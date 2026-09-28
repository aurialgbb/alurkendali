const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  await page.locator(".hero-actions .primary").click();
  await page.getByRole("button", { name: "Salin pesan", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Pesan tersalin" })
    .waitFor();
  await page.keyboard.press("Escape");
  await page.locator(".hero-actions .primary").click();
  assert.equal(await page.locator(".copy-status").innerText(), "");
  await page.keyboard.press("Escape");
  console.log("PASS contact status resets on reopening");
  for (const [selector, name] of [
    ["#solusi", "solutions"],
    ["#pendekatan", "founder"],
    [".fit-section", "fit"],
    [".faq-section", "faq"],
  ]) {
    await page
      .locator(selector)
      .screenshot({ path: `qa/artifacts/${name}.png` });
  }
  await page.setViewportSize({ width: 390, height: 844 });
  for (let i = 0; i < 4; i++) {
    await page.locator("#contoh [role=tab]").nth(i).click();
    assert.equal(
      await page
        .locator("#contoh [role=tab]")
        .nth(i)
        .getAttribute("aria-selected"),
      "true",
    );
  }
  await page
    .locator("#contoh")
    .screenshot({ path: "qa/artifacts/mobile-demo.png" });
  console.log("PASS mobile demo tabs");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
