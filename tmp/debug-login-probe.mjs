import { chromium } from 'playwright';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5001';
const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;

if (!USERNAME || !PASSWORD) {
  console.error('Missing E2E_USERNAME/E2E_PASSWORD');
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();

const authResponses = [];
page.on('response', async (res) => {
  const url = res.url();
  const interesting = /(cognito|amazonaws\.com|amplify|oauth|signin|login|auth)/i.test(url);
  if (!interesting) return;
  const entry = { url, status: res.status(), method: res.request().method() };
  try {
    const ct = res.headers()['content-type'] || '';
    if (ct.includes('application/json')) {
      entry.body = await res.json();
    } else {
      const text = await res.text();
      entry.body = text.slice(0, 600);
    }
  } catch {
    entry.body = '<unreadable>';
  }
  authResponses.push(entry);
});

await page.goto(new URL('/login', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1200);

const email = page.getByLabel(/email/i).first();
const password = page.getByLabel(/password/i).first();
const submit = page.getByRole('button', { name: /sign in/i }).first();

await email.fill(USERNAME);
await password.fill(PASSWORD);

await Promise.all([
  page.waitForLoadState('networkidle', { timeout: 45000 }).catch(() => undefined),
  submit.click(),
]);

await page.waitForTimeout(4000);

const alertText = await page.locator('[role="alert"]').allTextContents().catch(() => []);
const errorText = await page.locator('.amplify-text--error, .amplify-alert__body').allTextContents().catch(() => []);

console.log(JSON.stringify({
  currentUrl: page.url(),
  alerts: alertText,
  errors: errorText,
  authResponses,
}, null, 2));

await browser.close();
