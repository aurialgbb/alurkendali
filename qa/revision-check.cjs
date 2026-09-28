const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:3000", { waitUntil: "networkidle" });
  const flow = page.locator(".controlled-sequence");
  await flow.scrollIntoViewIfNeeded();
  const phase = () => flow.getAttribute("data-phase");
  assert.equal(await phase(), "0");
  const observed = [0];
  for (const next of [1, 2, 3, 4, 0]) {
    await page.waitForFunction(
      (value) =>
        document.querySelector(".controlled-sequence")?.dataset.phase ===
        String(value),
      next,
      { timeout: 5500 },
    );
    observed.push(next);
  }
  console.log("PASS complete loop " + observed.join(" -> "));
  await page.getByRole("button", { name: "Jeda animasi", exact: true }).click();
  const paused = await phase();
  await page.waitForTimeout(2200);
  assert.equal(await phase(), paused);
  console.log("PASS pause retains current step");
  await page
    .getByRole("button", { name: "Putar animasi", exact: true })
    .click();
  await page.waitForFunction(
    (value) =>
      document.querySelector(".controlled-sequence")?.dataset.phase !== value,
    paused,
    { timeout: 3500 },
  );
  await page.getByRole("button", { name: "Jeda animasi", exact: true }).click();
  await page
    .locator(".comparison-section")
    .screenshot({ path: "qa/artifacts/revision-flow-desktop.png" });
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    "Desktop axe",
    JSON.stringify(
      axe.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          message: n.failureSummary,
        })),
      })),
    ),
  );
  await page
    .getByRole("button", { name: "Putar animasi", exact: true })
    .click();
  await page.locator("#hero").scrollIntoViewIfNeeded();
  await page.waitForTimeout(250);
  const offscreen = await phase();
  await page.waitForTimeout(2400);
  assert.equal(await phase(), offscreen);
  console.log("PASS offscreen pauses progression");
  for (const width of [320, 390, 640, 768, 1024, 1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const sizes = await page.evaluate(() => ({
      w: innerWidth,
      s: document.documentElement.scrollWidth,
    }));
    assert(sizes.s <= sizes.w, JSON.stringify(sizes));
  }
  console.log("PASS responsive widths");
  await page.setViewportSize({ width: 390, height: 844 });
  await flow.scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Jeda animasi", exact: true }).click();
  await page
    .locator(".comparison-section")
    .screenshot({ path: "qa/artifacts/revision-flow-mobile.png" });
  const mobileAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    "Mobile axe",
    JSON.stringify(
      mobileAxe.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          message: n.failureSummary,
        })),
      })),
    ),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForFunction(
    () => document.querySelector(".controlled-sequence")?.dataset.phase === "4",
  );
  assert.equal(await flow.locator(".is-done").count(), 4);
  assert.equal(await flow.locator("button").count(), 0);
  await page.waitForTimeout(2200);
  assert.equal(await phase(), "4");
  console.log("PASS reduced motion displays complete static flow");
  await page.locator("#contoh").scrollIntoViewIfNeeded();
  await page.locator("#demo-tab-3").click();
  await page
    .locator("#contoh")
    .screenshot({ path: "qa/artifacts/revision-demo-mobile.png" });
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page
    .locator("#hero")
    .screenshot({ path: "qa/artifacts/revision-hero.png" });
  await page
    .locator("#pendekatan")
    .screenshot({ path: "qa/artifacts/revision-founder.png" });
  assert.equal(errors.length, 0);
  console.log("PASS no runtime errors");
  fs.writeFileSync(
    "qa/artifacts/revision-results.json",
    JSON.stringify(
      {
        observed,
        desktopViolations: axe.violations,
        mobileViolations: mobileAxe.violations,
        errors,
      },
      null,
      2,
    ),
  );
  await browser.close();
  if (axe.violations.length || mobileAxe.violations.length) process.exit(1);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
