import { chromium } from 'playwright';
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5001';
const USERNAME = process.env.E2E_USERNAME;
const PASSWORD = process.env.E2E_PASSWORD;
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
const authResponses = [];
page.on('response', async (res) => {
  const u = res.url();
  if (!/(cognito-idp|amazonaws\.com|oauth|login|signin|auth)/i.test(u)) return;
  const entry = { url: u, status: res.status(), method: res.request().method() };
  try { entry.body = (await res.text()).slice(0, 500); } catch {}
  authResponses.push(entry);
});
await page.goto(new URL('/login', BASE_URL).toString(), { waitUntil: 'domcontentloaded', timeout: 60000 });
await page.waitForTimeout(1500);
await page.getByLabel(/email/i).first().fill(USERNAME);
await page.getByLabel(/password/i).first().fill(PASSWORD);
await page.locator('button[type="submit"]').first().click();
await page.waitForTimeout(5000);
const allErrs = await page.locator('[role="alert"], .amplify-alert__body, .amplify-text--error').allTextContents();
console.log(JSON.stringify({ url: page.url(), errs: allErrs, authResponses }, null, 2));
await browser.close();
