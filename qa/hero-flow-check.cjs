// Hero illustration: the connector lines must meet the cards at several widths, and
// the packets must actually move along them after the intro.
// Usage: node qa/hero-flow-check.cjs [baseUrl]   (default http://127.0.0.1:3100)
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.argv[2] ?? "http://127.0.0.1:3100";

(async () => {
  fs.mkdirSync("qa/artifacts", { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  // Order of the intro: records and request card first, then lines, then the flow.
  {
    const page = await browser.newPage({ viewport: { width: 1366, height: 860 } });
    await page.goto(base, { waitUntil: "domcontentloaded" });
    const started = Date.now();
    const drawn = () =>
      page.evaluate(() => {
        // Computed style, not the attribute: a CSS rule overriding the dasharray must fail this test.
        const fraction = (el) => {
          const value = getComputedStyle(el).strokeDasharray;
          return value === "none" ? 1 : parseFloat(value);
        };
        const lines = [...document.querySelectorAll(".flow-connectors path:not(.flow-dash):not(.flow-ink)")];
        const ink = document.querySelector(".flow-ink");
        return {
          lines: lines.map(fraction),
          ink: ink ? fraction(ink) : 0,
          card: +getComputedStyle(document.querySelector(".controlled-card")).opacity,
          dash: +(getComputedStyle(document.querySelector(".flow-dash") ?? document.body).opacity),
        };
      });
    // The lines are mounted when the intro starts, so time from there, not from page load.
    await page.waitForSelector(".flow-connectors", { state: "attached" });
    const t0 = Date.now();
    await page.waitForTimeout(2000);
    const early = await drawn();
    assert.ok(early.card > 0.9, `the request card is in before the lines: ${JSON.stringify(early)}`);
    assert.ok(early.lines.every((v) => v < 0.05) && early.ink < 0.05, `no lines yet at 2.0 s: ${JSON.stringify(early)}`);
    await page.waitForTimeout(5200 - (Date.now() - t0));
    const late = await drawn();
    assert.ok(late.card > 0.99, "the card is fully in");
    assert.ok(late.lines.every((v) => v > 0.95) && late.ink > 0.95, `lines drawn by 5.2 s: ${JSON.stringify(late)}`);    console.log("PASS order: cards first, lines after, flow last");
    await page.close();
  }
  for (const width of [1366, 1100, 768]) {
    const page = await browser.newPage({ viewport: { width, height: 860 } });
    await page.goto(base, { waitUntil: "networkidle" });
    await page.waitForTimeout(4200);
    const geometry = await page.evaluate(() => {
      const canvas = document.querySelector(".flow-canvas").getBoundingClientRect();
      const card = document.querySelector(".controlled-card").getBoundingClientRect();
      const ink = document.querySelector(".flow-ink")?.getBoundingClientRect();
      const docs = [...document.querySelectorAll(".source-doc")].map((d) => d.getBoundingClientRect());
      return {
        canvasLeft: canvas.left,
        cardLeft: card.left - canvas.left,
        inkRight: ink ? ink.right - canvas.left : null,
        docRight: Math.max(...docs.map((d) => d.right)) - canvas.left,
        paths: document.querySelectorAll(".flow-connectors path:not(.flow-dash):not(.flow-ink)").length,
        dashes: document.querySelectorAll(".flow-dash").length,
        packets: document.querySelectorAll(".flow-packet").length,
      };
    });
    assert.equal(geometry.paths, 3, `${width}: three connector lines`);
    assert.equal(geometry.dashes, 3, `${width}: dashed flow on each line`);
    assert.equal(geometry.packets, 3, `${width}: a packet per line`);
    // The darker segment must end at the card edge (the card is rotated 1deg, so allow a few px).
    assert.ok(Math.abs(geometry.inkRight - geometry.cardLeft) < 8, `${width}: ink meets card (${geometry.inkRight} vs ${geometry.cardLeft})`);

    // Packets move: sample positions over time.
    const sample = () =>
      page.evaluate(() =>
        [...document.querySelectorAll(".flow-packet")].map((c) => {
          const r = c.getBoundingClientRect();
          return Math.round(r.left * 10) / 10 + "," + Math.round(r.top * 10) / 10;
        }),
      );
    const a = await sample();
    await page.waitForTimeout(700);
    const b = await sample();
    assert.notDeepEqual(a, b, `${width}: packets are moving`);
    await page.locator(".hero-flow").screenshot({ path: `qa/artifacts/hero-flow-${width}.png` });
    console.log(`PASS ${width}px: lines meet the card, dashes and packets run`);
    await page.close();
  }

  const still = await browser.newContext({ viewport: { width: 1366, height: 860 }, reducedMotion: "reduce" });
  const page = await still.newPage();
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  const reduced = await page.evaluate(() => ({
    dashes: document.querySelectorAll(".flow-dash").length,
    packets: document.querySelectorAll(".flow-packet").length,
    lines: document.querySelectorAll(".flow-connectors path").length,
  }));
  assert.equal(reduced.dashes + reduced.packets, 0, "reduced motion: no moving flow");
  assert.ok(reduced.lines >= 4, "reduced motion: lines still drawn");
  console.log("PASS reduced motion: static lines, no packets or dashes");
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
