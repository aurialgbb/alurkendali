// Landing revision 2026-10-08: clicks through every interactive element and records
// what happened. Usage: node qa/landing-clickthrough.cjs [baseUrl]
const { chromium } = require("playwright");
const assert = require("node:assert/strict");

const base = process.argv[2] ?? "http://127.0.0.1:3100";
const log = (line) => console.log(`PASS ${line}`);

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH,
  });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 860 },
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(base, { waitUntil: "networkidle" });

  for (const [label, hash] of [
    ["Solusi", "#solusi"],
    ["Cara kerja", "#cara-kerja"],
    ["Pendekatan kami", "#pendekatan"],
  ]) {
    await page.locator(".desktop-nav").getByRole("link", { name: label }).click();
    await page.waitForTimeout(900);
    assert.ok(page.url().endsWith(hash), `nav ${label}`);
    const top = await page.locator(hash).evaluate((el) => el.getBoundingClientRect().top);
    assert.ok(top < 200, `${hash} scrolled into view (${top})`);
    log(`nav "${label}" -> ${hash} in view`);
  }

  await page.locator(".hero-actions .primary").click();
  await page.locator("#contact-title").waitFor();
  await page.getByRole("button", { name: "Salin pesan", exact: true }).click();
  await page.getByRole("status").filter({ hasText: "Pesan tersalin." }).waitFor();
  await page.keyboard.press("Escape");
  assert.equal(await page.locator(".contact-dialog[open]").count(), 0);
  log("hero CTA -> contact dialog, copy -> 'Pesan tersalin.', Escape closes");

  for (const selector of [".nav-cta", "#diskusi .primary"]) {
    await page.locator(selector).first().click();
    await page.locator("#contact-title").waitFor();
    await page.keyboard.press("Escape");
  }
  await page.locator(".footer-links").getByRole("button", { name: "WhatsApp" }).click();
  await page.locator("#contact-title").waitFor();
  await page.keyboard.press("Escape");
  log("nav CTA, final CTA, footer WhatsApp -> contact dialog (no number configured)");

  await page.locator(".footer-links").getByRole("button", { name: "Privasi" }).click();
  await page.locator("#privacy-title").waitFor();
  await page.keyboard.press("Escape");
  log("footer Privasi -> privacy dialog, Escape closes");

  const solutionTabs = page.locator("#solusi [role=tab]");
  await solutionTabs.nth(2).click();
  await page.waitForTimeout(700);
  assert.equal(await solutionTabs.nth(2).getAttribute("aria-selected"), "true");
  assert.equal(await page.locator("[data-illustration]").getAttribute("data-illustration"), "procurement");
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(700);
  assert.equal(await page.locator("[data-illustration]").getAttribute("data-illustration"), "operations");
  log("solution tabs: click Procurement, ArrowRight -> Operations, illustration follows");
  await page.locator("#solusi").getByRole("button", { name: "Diskusikan Operations" }).click();
  await page.locator("#contact-title").waitFor();
  assert.match(await page.locator("#contact-message").inputValue(), /workflow \/ approval/);
  await page.keyboard.press("Escape");
  log("solution 'Diskusikan Operations' -> dialog with operations context");

  const demoTabs = page.locator("#contoh [role=tab]");
  await page.locator("#contoh .demo-frame").scrollIntoViewIfNeeded();
  const toggle = page.locator("#contoh .sequence-toggle");
  assert.equal(await toggle.getAttribute("aria-pressed"), "false");
  await toggle.click();
  assert.equal(await toggle.getAttribute("aria-pressed"), "true");
  await toggle.click();
  log("demo pause button toggles aria-pressed");
  await demoTabs.nth(3).click();
  await page.waitForTimeout(600);
  assert.equal(await page.locator(".audit-event").count(), 4);
  assert.equal(await toggle.getAttribute("aria-pressed"), "true");
  await page.waitForTimeout(4200);
  assert.equal(await demoTabs.nth(3).getAttribute("aria-selected"), "true");
  log("demo tab 04 -> audit timeline (4 events); choosing a stage stops autoplay");
  await demoTabs.nth(3).focus();
  await page.keyboard.press("ArrowLeft");
  await page.waitForTimeout(500);
  assert.equal(await demoTabs.nth(2).getAttribute("aria-selected"), "true");
  log("demo tabs keyboard ArrowLeft -> stage 03");

  const faq = page.locator(".faq-item button").first();
  await faq.scrollIntoViewIfNeeded();
  await faq.click();
  await page.locator("#faq-answer-0").waitFor();
  assert.equal(await faq.getAttribute("aria-expanded"), "true");
  await faq.press("Enter");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#faq-answer-0").count(), 0);
  log("FAQ opens on click, closes with Enter");

  await page.locator(".language-desktop").getByRole("button", { name: "English" }).click();
  await page.waitForTimeout(400);
  assert.match(await page.locator("#solusi h2").innerText(), /Which process/);
  assert.match(await page.locator("#tantangan h2").innerText(), /The business is busier/);
  log("language switch ENG -> headings translated");
  await page.locator(".language-desktop").getByRole("button", { name: "Bahasa Indonesia" }).click();

  await page.locator(".hero-actions .secondary").click();
  await page.waitForURL(/\/demo$/);
  log("'Coba Demo Interaktif' -> /demo");
  await page.goto(base, { waitUntil: "networkidle" });

  await page.setViewportSize({ width: 375, height: 812 });
  await page.waitForTimeout(400);
  await page.evaluate(() => window.scrollTo(0, 0));
  const menu = page.locator(".menu-button");
  await menu.click();
  await page.locator("#mobile-nav").waitFor();
  assert.equal(await menu.getAttribute("aria-expanded"), "true");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  assert.equal(await page.locator("#mobile-nav").count(), 0);
  await menu.click();
  await page.locator("#mobile-nav").getByRole("link", { name: "Cara kerja" }).click();
  await page.waitForTimeout(900);
  assert.equal(await page.locator("#mobile-nav").count(), 0);
  log("mobile menu opens, Escape closes, link navigates and closes menu");

  await page.evaluate(() => window.scrollTo(0, 2400));
  await page.waitForTimeout(800);
  await page.locator(".mobile-sticky .primary").click();
  await page.locator("#contact-title").waitFor();
  await page.keyboard.press("Escape");
  log("mobile sticky CTA appears after hero and opens contact dialog");

  assert.deepEqual(errors, [], "page errors");
  log("no page errors during click-through");
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
