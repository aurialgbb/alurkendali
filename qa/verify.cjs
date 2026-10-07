const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    ...(process.env.CHROME_PATH
      ? { executablePath: process.env.CHROME_PATH }
      : {}),
  });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1050 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  const checks = [];
  const accessibility = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") errors.push(msg.text());
  });
  const ok = (name) => {
    checks.push(name);
    console.log("PASS " + name);
  };
  async function axe(name) {
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    accessibility.push({
      name,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  await page.goto(
    "http://127.0.0.1:3000/?utm_source=local-qa&utm_campaign=preview",
    { waitUntil: "networkidle" },
  );
  assert.match(await page.title(), /Alur Kendali/);
  assert.equal(await page.locator("h1").count(), 1);
  ok("Page, title, one primary heading");
  await axe("desktop-initial");
  const links = await page
    .locator('a[href^="#"]')
    .evaluateAll((els) =>
      els.map((el) => ({
        href: el.getAttribute("href"),
        exists: !!document.querySelector(el.getAttribute("href")),
      })),
    );
  assert(links.every((l) => l.exists));
  ok("Every anchor has a destination");
  for (const href of ["#solusi", "#cara-kerja", "#pendekatan"]) {
    await page.locator(`.desktop-nav a[href="${href}"]`).click();
    assert.equal(new URL(page.url()).hash, href);
  }
  ok("Desktop navigation clicked through");
  const solutionTabs = page.locator("#solusi [role=tab]");
  for (let i = 0; i < 5; i++) {
    await solutionTabs.nth(i).click();
    assert.equal(
      await solutionTabs.nth(i).getAttribute("aria-selected"),
      "true",
    );
    await page.locator("#solutions-panel button.text-button").click();
    assert(await page.locator("dialog[open]").isVisible());
    const value = await page.locator("#contact-message").inputValue();
    assert.match(value, /Area yang ingin dibahas:/);
    const expected = [
      "finance / reconciliation",
      "inventory / asset",
      "procurement / spending",
      "workflow / approval",
      "management reporting",
    ][i];
    assert(value.includes(expected));
    await page.keyboard.press("Escape");
    assert.equal(await page.locator("dialog[open]").count(), 0);
  }
  ok("All five solution panels and contextual contact messages");
  await solutionTabs.nth(0).focus();
  await page.keyboard.press("ArrowRight");
  assert.equal(await solutionTabs.nth(1).getAttribute("aria-selected"), "true");
  await page.keyboard.press("End");
  assert.equal(await solutionTabs.nth(4).getAttribute("aria-selected"), "true");
  await page.keyboard.press("Home");
  assert.equal(await solutionTabs.nth(0).getAttribute("aria-selected"), "true");
  ok("Solution tabs arrow/Home/End keyboard controls");
  await axe("solutions");
  const demoTabs = page.locator("#contoh [role=tab]");
  for (let i = 0; i < 4; i++) {
    await demoTabs.nth(i).click();
    assert.equal(await demoTabs.nth(i).getAttribute("aria-selected"), "true");
    assert.match(
      await page.locator(".demo-explainer .section-index").innerText(),
      new RegExp(`0${i + 1}`),
    );
    if (i === 3) assert.equal(await page.locator(".audit-event").count(), 4);
    await axe("demo-" + i);
  }
  ok("All four demo states, data, status and audit history");
  await page
    .locator("#contoh")
    .screenshot({ path: "qa/artifacts/demo-section.png" });
  for (const summary of await page.locator(".faq-list summary").all()) {
    await summary.click();
    assert(await summary.locator("..").evaluate((el) => el.open));
    await summary.click();
    assert.equal(await summary.locator("..").evaluate((el) => el.open), false);
  }
  ok("All five FAQs open and close");
  for (const selector of [
    ".nav-cta",
    ".hero-actions .primary",
    "#diskusi .primary",
    ".footer-links button:last-of-type",
  ]) {
    await page.locator(selector).click();
    assert(await page.locator("dialog[open]").isVisible());
    await page.getByRole("button", { name: "Tutup formulir kontak" }).click();
  }
  ok("Navbar, hero, final and footer contact CTAs");
  await page.locator(".hero-actions .primary").click();
  await axe("contact-modal");
  await page.getByRole("button", { name: "Salin pesan", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Pesan tersalin" })
    .waitFor();
  assert.match(
    await page.evaluate(() => navigator.clipboard.readText()),
    /Halo, saya ingin mendiskusikan/,
  );
  await page.keyboard.press("Escape");
  assert(
    await page
      .locator(".hero-actions .primary")
      .evaluate((el) => el === document.activeElement),
  );
  ok("Copy succeeds, modal Escape closes and restores focus");
  await page.evaluate(() =>
    Object.defineProperty(navigator.clipboard, "writeText", {
      configurable: true,
      value: async () => {
        throw new Error("QA clipboard denied");
      },
    }),
  );
  await page.locator(".hero-actions .primary").click();
  await page.getByRole("button", { name: "Salin pesan", exact: true }).click();
  await page
    .getByRole("status")
    .filter({ hasText: "Pesan belum tersalin" })
    .waitFor();
  await page.keyboard.press("Escape");
  ok("Clipboard failure gives manual-copy recovery");
  await page.getByRole("button", { name: "Privasi", exact: true }).click();
  assert(
    await page.getByRole("heading", { name: "Privasi & Kerahasiaan Data" }).isVisible(),
  );
  await page.getByRole("button", { name: "Tutup kebijakan privasi" }).click();
  ok("Privacy information dialog");
  const widths = [320, 375, 390, 640, 768, 1024, 1280, 1440];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.evaluate(() => scrollTo(0, 0));
    const size = await page.evaluate(() => ({
      viewport: innerWidth,
      body: document.documentElement.scrollWidth,
    }));
    assert(size.body <= size.viewport, JSON.stringify(size));
  }
  ok("No horizontal page overflow at " + widths.join(", ") + "px");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  assert(await page.locator("#mobile-nav").isVisible());
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("#mobile-nav").isVisible(), false);
  for (const href of ["#solusi", "#cara-kerja", "#pendekatan"]) {
    await page.getByRole("button", { name: "Menu", exact: true }).click();
    await page.locator(`#mobile-nav a[href="${href}"]`).click();
    assert.equal(await page.locator("#mobile-nav").isVisible(), false);
  }
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await page.locator("#mobile-nav .primary").click();
  assert(await page.locator("dialog[open]").isVisible());
  await page.keyboard.press("Escape");
  ok("Mobile menu, all navigation items, menu CTA and Escape");
  await page.locator("#solusi").scrollIntoViewIfNeeded();
  await page.locator(".mobile-sticky .primary").waitFor({ state: "visible" });
  await page.locator(".mobile-sticky .primary").click();
  assert(await page.locator("dialog[open]").isVisible());
  await page.keyboard.press("Escape");
  await page.locator("#diskusi").scrollIntoViewIfNeeded();
  await page.locator(".mobile-sticky").waitFor({ state: "detached" });
  ok("Mobile sticky CTA appears after hero and hides at final CTA");
  await page.evaluate(() => scrollTo(0, 0));
  await axe("mobile");
  await page.screenshot({ path: "qa/artifacts/mobile-hero.png" });
  await page.screenshot({
    path: "qa/artifacts/mobile-full.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 640, height: 900 });
  await page.evaluate(() => (document.documentElement.style.fontSize = "200%"));
  assert(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  ok("200% text size reflows without horizontal overflow");
  await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  assert.equal(
    await page.evaluate(
      () =>
        getComputedStyle(document.querySelector(".flow-connectors path"))
          .animationName,
    ),
    "none",
  );
  ok("Reduced-motion preference disables animation");
  const events = await page.evaluate(() => window.alurEvents);
  assert(events.some((e) => e.event === "demo_interaction"));
  assert(events.some((e) => e.event === "solution_reporting_view"));
  assert(events.some((e) => e.event === "founder_section_view"));
  assert(events.every((e) => e.details.utm_source === "local-qa"));
  ok("Conversion events include campaign attribution");
  assert.equal(errors.length, 0, JSON.stringify(errors));
  ok("No browser runtime or console errors");
  const violations = accessibility.filter((a) => a.violations.length);
  fs.writeFileSync(
    "qa/artifacts/qa-results.json",
    JSON.stringify({ checks, accessibility, events, errors }, null, 2),
  );
  console.log(
    JSON.stringify(
      { checks: checks.length, accessibilityViolations: violations },
      null,
      2,
    ),
  );
  await browser.close();
  if (violations.length) process.exitCode = 1;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
