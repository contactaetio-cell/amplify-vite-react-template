#!/usr/bin/env node
import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5001';
const TARGET_PATH = '/dashboard/admin-evals';
const USERNAME = process.env.E2E_USERNAME ?? process.env.COGNITO_TEST_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD ?? process.env.COGNITO_TEST_PASSWORD;
const HEADLESS = (process.env.E2E_HEADLESS ?? 'true').toLowerCase() !== 'false';
const TIMEOUT_MS = Number(process.env.E2E_TIMEOUT_MS ?? 45000);
const ARTIFACTS_DIR = path.resolve(process.cwd(), 'tmp', 'e2e-artifacts');

const result = {
  baseUrl: BASE_URL,
  target: TARGET_PATH,
  startedAt: new Date().toISOString(),
  checks: [],
  endpoint: null,
  projectsObserved: 0,
  selectedProjectId: null,
  passed: false,
};

function currentPath(page) {
  try {
    return new URL(page.url()).pathname;
  } catch {
    return '';
  }
}

function isOnTargetPath(page) {
  return currentPath(page) === TARGET_PATH;
}

function addCheck(name, passed, details = undefined) {
  result.checks.push({ name, passed, ...(details ? { details } : {}) });
}

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function saveFailureArtifacts(page, label) {
  await ensureDir(ARTIFACTS_DIR);
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const screenshotPath = path.join(ARTIFACTS_DIR, `${label}-${stamp}.png`);
  const htmlPath = path.join(ARTIFACTS_DIR, `${label}-${stamp}.html`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  const html = await page.content();
  await fs.writeFile(htmlPath, html, 'utf8');
  return { screenshotPath, htmlPath };
}

async function tryLogin(page) {
  let loginView = await isLoginScreen(page);
  const path = currentPath(page);

  if (!loginView && path === '/' && (USERNAME || PASSWORD)) {
    await page.goto(new URL('/login', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    loginView = await isLoginScreen(page);
  }

  if (!loginView) return { attempted: false, succeeded: true };

  if (!USERNAME || !PASSWORD) {
    return {
      attempted: false,
      succeeded: false,
      reason: 'Auth required but E2E_USERNAME/E2E_PASSWORD (or COGNITO_TEST_USERNAME/COGNITO_TEST_PASSWORD) are not set.',
    };
  }

  const emailCandidates = [
    page.getByLabel(/email/i).first(),
    page.locator('input[type="email"]').first(),
    page.locator('input[name="username"]').first(),
    page.locator('input[autocomplete="username"]').first(),
  ];
  const passwordCandidates = [
    page.getByLabel(/password/i).first(),
    page.locator('input[name="password"]').first(),
    page.locator('input[autocomplete="current-password"]').first(),
    page.locator('input[type="password"]').first(),
  ];
  const submitCandidates = [
    page.locator('button[type="submit"]').first(),
    page.getByRole('button', { name: /^sign in$/i }).first(),
    page.locator('button:not([type=\"submit\"])').filter({ hasText: /^sign in$/i }).first(),
  ];

  const getVisible = async (candidates) => {
    for (const locator of candidates) {
      if (await locator.isVisible().catch(() => false)) return locator;
    }
    return null;
  };

  // Let Amplify UI settle before selecting controls.
  await page.waitForTimeout(500);

  // Ensure we're on the Sign In tab (and not Create Account).
  const signInTab = page.getByRole('button', { name: /^sign in$/i }).first();
  if (await signInTab.isVisible().catch(() => false)) {
    await signInTab.click().catch(() => undefined);
  }

  const emailInput = await getVisible(emailCandidates);
  const passwordInput = await getVisible(passwordCandidates);
  const submitButton = await getVisible(submitCandidates);

  if (!emailInput || !passwordInput) {
    return {
      attempted: true,
      succeeded: false,
      reason: 'Login form fields were not found on the login screen.',
    };
  }

  await emailInput.fill(USERNAME);
  await passwordInput.fill(PASSWORD);

  if (submitButton) {
    await Promise.all([
      page.waitForLoadState('networkidle', { timeout: TIMEOUT_MS }).catch(() => undefined),
      submitButton.click(),
    ]);
  } else {
    await passwordInput.press('Enter');
    await page.waitForLoadState('networkidle', { timeout: TIMEOUT_MS }).catch(() => undefined);
  }

  // Amplify auth can complete a moment after submit/network idle.
  await page.waitForFunction(
    () => !document.querySelector('input[type="password"]') || !window.location.pathname.startsWith('/login'),
    { timeout: TIMEOUT_MS }
  ).catch(() => undefined);
  await page.waitForTimeout(800);

  const stillLogin = await isLoginScreen(page);
  if (stillLogin) {
    const uiError =
      (await page.locator('[role="alert"]').first().textContent().catch(() => null))
      ?? (await page.locator('.amplify-alert__body').first().textContent().catch(() => null))
      ?? (await page.locator('[data-amplify-authenticator] .amplify-text--error').first().textContent().catch(() => null));
    return {
      attempted: true,
      succeeded: false,
      reason: 'Login attempt submitted but login screen is still visible.',
      uiError: uiError?.trim() || undefined,
    };
  }

  return { attempted: true, succeeded: true };
}

async function isLoginScreen(page) {
  const hasPasswordField = (await page.locator('input[type="password"]').count()) > 0;
  if (!hasPasswordField) return false;
  const url = page.url();
  if (url.includes('/login')) return true;
  const hasSignInLabel = (await page.getByText(/sign in/i).count()) > 0;
  return hasSignInLabel;
}

async function run() {
  const browser = await chromium.launch({ headless: HEADLESS });
  const context = await browser.newContext();
  const page = await context.newPage();

  let endpointPayload = null;
  let endpointStatus = null;

  page.on('response', async (response) => {
    const url = response.url();
    if (!url.includes('/admin/insight-evaluations')) return;
    endpointStatus = response.status();
    try {
      endpointPayload = await response.json();
    } catch {
      endpointPayload = null;
    }
  });

  try {
    const healthResponse = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    addCheck('base_url_reachable', Boolean(healthResponse && healthResponse.ok()), {
      status: healthResponse?.status(),
      finalUrl: page.url(),
    });

    await page.goto(new URL(TARGET_PATH, BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });

    addCheck('target_route_navigation', isOnTargetPath(page), {
      current_path: currentPath(page),
      current_url: page.url(),
    });

    const login = await tryLogin(page);
    if (!login.succeeded) {
      addCheck('auth_login', false, { reason: login.reason });
      const artifacts = await saveFailureArtifacts(page, 'login-failure');
      result.failureArtifacts = artifacts;
      result.endpoint = { status: endpointStatus, hasPayload: Boolean(endpointPayload) };
      return;
    }
    addCheck('auth_login', true, { attempted: login.attempted });

    await page.goto(new URL(TARGET_PATH, BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    await page.waitForTimeout(2500);

    const onTargetAfterAuth = isOnTargetPath(page);
    addCheck('target_route_after_auth', onTargetAfterAuth, {
      current_path: currentPath(page),
      current_url: page.url(),
    });
    if (!onTargetAfterAuth && currentPath(page) === '/') {
      const relogin = await tryLogin(page);
      addCheck('auth_relogin_after_redirect', relogin.succeeded, {
        attempted: relogin.attempted,
        reason: relogin.reason,
      });

      if (relogin.succeeded) {
        await page.goto(new URL(TARGET_PATH, BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
        await page.waitForTimeout(2500);
      }
    }

    if (!isOnTargetPath(page)) {
      addCheck('auth_guard_allows_admin_evals', false, {
        reason: 'Did not reach /dashboard/admin-evals after auth step.',
        current_path: currentPath(page),
        current_url: page.url(),
      });
      const artifacts = await saveFailureArtifacts(page, 'route-guard-failure');
      result.failureArtifacts = artifacts;
      result.endpoint = { status: endpointStatus, hasPayload: Boolean(endpointPayload) };
      return;
    }

    const heading = page.getByRole('heading', { name: 'Admin Insight Evaluations' });
    await heading.waitFor({ state: 'visible', timeout: TIMEOUT_MS });
    addCheck('admin_evals_screen_visible', true, { url: page.url() });

    if (endpointStatus == null || endpointPayload == null) {
      try {
        const evalResponse = await page.waitForResponse(
          (response) => response.url().includes('/admin/insight-evaluations'),
          { timeout: 15000 },
        );
        endpointStatus = evalResponse.status();
        try {
          endpointPayload = await evalResponse.json();
        } catch {
          endpointPayload = null;
        }
      } catch {
        // Best effort: endpoint might have failed before a response could be captured.
      }
    }

    const endpointValid =
      endpointStatus === 200
      && endpointPayload
      && typeof endpointPayload.total_projects === 'number'
      && Array.isArray(endpointPayload.projects);

    addCheck('admin_endpoint_response_shape', Boolean(endpointValid), {
      status: endpointStatus,
      total_projects: endpointPayload?.total_projects,
      has_projects_array: Array.isArray(endpointPayload?.projects),
    });

    result.endpoint = {
      status: endpointStatus,
      hasPayload: Boolean(endpointPayload),
      total_projects: endpointPayload?.total_projects,
    };

    const projectsCountText = await page.locator('text=Projects').first().isVisible().catch(() => false);
    addCheck('summary_cards_visible', projectsCountText, {});

    const rows = page.locator('table tbody tr');
    const rowCount = await rows.count();
    result.projectsObserved = rowCount;

    if (rowCount > 0) {
      await rows.first().click();
      const selectedProjectBadge = page.locator('[data-slot="badge"]').first();
      const badgeText = await selectedProjectBadge.textContent();
      result.selectedProjectId = badgeText?.trim() ?? null;

      const hasMetadataColumns =
        (await page.getByRole('columnheader', { name: 'Metadata Δ' }).count()) > 0
        && (await page.getByRole('columnheader', { name: 'Meta +' }).count()) > 0
        && (await page.getByRole('columnheader', { name: 'Meta -' }).count()) > 0
        && (await page.getByRole('columnheader', { name: 'Meta ~' }).count()) > 0;

      addCheck('recent_terminal_events_metadata_columns_visible', hasMetadataColumns);
    } else {
      addCheck('projects_table_has_rows', false, {
        reason: 'No project rows rendered. Endpoint may have no data.',
      });
    }

    result.passed = result.checks.every((item) => item.passed);
  } catch (error) {
    addCheck('unexpected_runtime_error', false, {
      message: error instanceof Error ? error.message : String(error),
    });
    result.passed = false;
    try {
      const artifacts = await saveFailureArtifacts(page, 'runtime-failure');
      result.failureArtifacts = artifacts;
    } catch {
      // best effort
    }
  } finally {
    result.finishedAt = new Date().toISOString();
    result.durationMs =
      new Date(result.finishedAt).getTime() - new Date(result.startedAt).getTime();
    console.log(JSON.stringify(result, null, 2));
    await page.close();
    await context.close();
    await browser.close();
  }
}

run();
