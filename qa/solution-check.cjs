const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
    });
    const page = await context.newPage();
    await page.goto("http://127.0.0.1:3000");
    await page.waitForTimeout(800);
    assert((await page.locator(".reveal-pending").count()) > 0);
    const reveal = await page
      .locator(".reveal-pending")
      .first()
      .elementHandle();
    assert.equal(
      await reveal.evaluate((el) => getComputedStyle(el).opacity),
      "0",
    );
    await reveal.scrollIntoViewIfNeeded();
    await page.waitForTimeout(900);
    assert(
      await reveal.evaluate(
        (el) =>
          el.classList.contains("in-view") &&
          !el.classList.contains("reveal-pending") &&
          getComputedStyle(el).opacity === "1",
      ),
    );
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);
    assert(await reveal.evaluate((el) => el.classList.contains("in-view")));
    await page.locator("#solusi").scrollIntoViewIfNeeded();
    for (let i = 0; i < 5; i++) {
      await page.locator("#solutions-tab-" + i).click();
      await page.waitForTimeout(500);
      await page
        .locator(".solution-panel")
        .screenshot({ path: "qa/artifacts/solution-" + i + ".png" });
      assert.equal(
        await page
          .locator("[data-illustration]")
          .getAttribute("data-illustration"),
        ["finance", "inventory", "procurement", "operations", "reporting"][i],
      );
    }
    for (const width of [320, 375, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (let i = 0; i < 5; i++) {
        await page.locator("#solutions-tab-" + i).click();
        assert(
          await page.evaluate(
            () => document.documentElement.scrollWidth <= innerWidth,
          ),
          `overflow ${width} ${i}`,
        );
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto("http://127.0.0.1:3000");
    await page.waitForTimeout(2200);
    await page.screenshot({ path: "qa/artifacts/style-hero.png" });
    const nojs = await browser.newContext({ javaScriptEnabled: false });
    const p2 = await nojs.newPage();
    await p2.goto("http://127.0.0.1:3000");
    assert.equal(await p2.locator(".reveal-pending").count(), 0);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:3000");
    await page.waitForTimeout(500);
    assert.equal(await page.locator(".reveal-pending").count(), 0);
    console.log(
      "PASS five distinct illustrations, 4 viewport widths × 5 tabs, no-JS and reduced-motion visibility",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

