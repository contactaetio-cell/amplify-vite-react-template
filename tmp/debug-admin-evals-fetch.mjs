import { chromium } from 'playwright';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5001';
const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();

const hits = [];
const failed = [];
const consoleErrors = [];

page.on('response', async (res) => {
  const url = res.url();
  if (!url.includes('/admin/insight-evaluations')) return;
  let body = null;
  try { body = await res.text(); } catch {}
  hits.push({ url, status: res.status(), bodyPreview: body?.slice(0, 300) ?? null });
});
page.on('requestfailed', (req) => {
  const url = req.url();
  if (!url.includes('/admin/insight-evaluations')) return;
  failed.push({ url, method: req.method(), failure: req.failure() });
});
page.on('console', (msg) => {
  if (msg.type() === 'error') {
    consoleErrors.push(msg.text());
  }
});

await page.goto(new URL('/login', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1200);
await page.getByLabel(/email/i).first().fill(USERNAME);
await page.getByLabel(/password/i).first().fill(PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForURL(/\/dashboard(\/.*)?$/i, { timeout: 60000 });

await page.goto(new URL('/dashboard/admin-evals', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(7000);

const bodyText = await page.locator('body').innerText();
const hasErrorCard = /Failed to fetch admin insight evaluations|Failed to load insight evaluations|Invalid admin insight evaluations response|Failed to fetch/i.test(bodyText);

console.log(JSON.stringify({
  finalUrl: page.url(),
  hits,
  failed,
  hasErrorCard,
  consoleErrors: consoleErrors.slice(0, 20),
  bodyPreview: bodyText.slice(0, 1200),
}, null, 2));

await browser.close();
