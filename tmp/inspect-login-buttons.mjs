import { chromium } from 'playwright';
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:5001';
const browser = await chromium.launch({ headless: true });
const page = await (await browser.newContext()).newPage();
await page.goto(new URL('/login', BASE_URL).toString(), { waitUntil: 'domcontentloaded' });
await page.waitForTimeout(1500);
const buttons = await page.evaluate(() => {
  const out = [];
  document.querySelectorAll('button').forEach((btn, i) => {
    const text = (btn.textContent || '').trim().replace(/\s+/g,' ');
    out.push({
      i,
      text,
      type: btn.getAttribute('type'),
      id: btn.id || null,
      className: btn.className,
      name: btn.getAttribute('name'),
      dataAttrs: Array.from(btn.attributes).filter(a=>a.name.startsWith('data-')).map(a=>`${a.name}=${a.value}`)
    });
  });
  return out;
});
console.log(JSON.stringify(buttons, null, 2));
await browser.close();
