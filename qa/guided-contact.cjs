// Returning from the demo opens the landing page's contact dialog with the
// category context; nothing is sent and no external service is opened.
// Usage: node qa/guided-contact.cjs [baseUrl]   (default http://127.0.0.1:3000)
const { chromium, expect } = require("@playwright/test");
const base = process.argv[2] ?? "http://127.0.0.1:3000";

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.addInitScript(() => {
    window.demoOpened = [];
    window.open = (url) => {
      window.demoOpened.push(url);
      return null;
    };
  });
  await p.goto(`${base}/?demo=inventory&kontak=1#diskusi`, { waitUntil: "networkidle" });
  const urls = await p.evaluate(() => window.demoOpened);
  if (urls.length) throw new Error("A popup was opened without a click");
  await expect(p.locator("#contact-title")).toBeVisible();
  await expect(p.locator("#contact-message")).toContainText("persediaan dan aset");
  if (p.url().includes("kontak=1")) throw new Error("kontak=1 was not removed from the URL");
  await p.keyboard.press("Escape");
  console.log("PASS demo return opens the contact dialog with the inventory context");

  await p.goto(`${base}/?demo=inventory#diskusi`, { waitUntil: "networkidle" });
  await expect(p.locator("#contact-title")).toBeHidden();
  await p.locator("#diskusi button").click();
  await expect(p.locator("#contact-message")).toContainText("persediaan dan aset");
  await p.keyboard.press("Escape");
  console.log("PASS without kontak=1 the dialog waits for a click and keeps the context");
  await p.locator("#solusi").scrollIntoViewIfNeeded();
  await p.screenshot({ path: "qa/artifacts/guided-lp-integration.png" });
  await p.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await p.screenshot({ path: "qa/artifacts/guided-picker-final.png", fullPage: true });
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
