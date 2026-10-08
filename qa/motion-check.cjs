// Landing revision 2026-10-08: renders every section after its motion settles,
// checks overflow and console errors, and repeats with reduced motion.
// Usage: node qa/motion-check.cjs [baseUrl]   (default http://127.0.0.1:3100)
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");

const base = process.argv[2] ?? "http://127.0.0.1:3100";
const sections = [
  "#hero",
  "#tantangan",
  "#solusi",
  "#contoh",
  "#cara-kerja",
  "#pendekatan",
  "#kecocokan",
  "#diskusi",
];

async function walk(page) {
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 250) {
    await page.mouse.wheel(0, 250);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(1200);
}

async function run(browser, { width, height, reduced, tag }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(reduced ? 300 : 4000);
  await walk(page);

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  assert.ok(overflow <= 0, `${tag}: horizontal overflow ${overflow}px`);

  const hiddenHeadings = await page.evaluate(() =>
    [...document.querySelectorAll(".lp main h2")]
      .filter((h) => Number(getComputedStyle(h).opacity) < 0.99)
      .map((h) => h.textContent.slice(0, 40)),
  );
  assert.deepEqual(hiddenHeadings, [], `${tag}: headings still hidden`);

  for (const selector of sections) {
    await page.locator(selector).scrollIntoViewIfNeeded();
    await page.waitForTimeout(reduced ? 100 : 2200);
    await page
      .locator(selector)
      .screenshot({ path: `qa/artifacts/motion-${tag}-${selector.slice(1)}.png` });
  }
  assert.deepEqual(errors, [], `${tag}: console errors`);
  console.log(`PASS ${tag}: no overflow, headings visible, no console errors`);
  await context.close();
}

(async () => {
  fs.mkdirSync("qa/artifacts", { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  try {
    await run(browser, { width: 1366, height: 860, reduced: false, tag: "desktop" });
    await run(browser, { width: 768, height: 1024, reduced: false, tag: "tablet" });
    await run(browser, { width: 375, height: 812, reduced: false, tag: "mobile" });
    await run(browser, { width: 1366, height: 860, reduced: true, tag: "reduced" });
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
