// Demo revision 2026-10-09: walks each guided case with motion on (and once with
// reduced motion), screenshots every stage, and fails on overflow, console errors
// or hydration warnings. Usage: node qa/demo-check.cjs [baseUrl]  (default 3100)
const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const base = process.argv[2] ?? "http://127.0.0.1:3100";

const flows = {
  finance: ["Kirim pengajuan Rp350.000", "Setujui pengajuan", "Verifikasi & catat pembayaran"],
  inventory: ["Kirim dari Gudang Pusat", "Konfirmasi terima 20 rim"],
  procurement: [
    "Setujui pesanan Rp3.200.000",
    "Catat penerimaan barang",
    "Cocokkan tiga dokumen",
    "Cocokkan tagihan koreksi Rp3.200.000",
    "Catat pembayaran simulasi",
  ],
  operations: null,
};

async function run(browser, { width, height, reduced, tag }) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: reduced ? "reduce" : "no-preference",
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const shot = (name) =>
    page.screenshot({ path: `qa/artifacts/demo-${tag}-${name}.png`, fullPage: true });
  const overflow = async (where) => {
    const extra = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    assert.ok(extra <= 0, `${tag} ${where}: horizontal overflow ${extra}px`);
  };

  await page.goto(`${base}/demo`, { waitUntil: "networkidle" });
  await page.mouse.wheel(0, 1600);
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await overflow("picker");
  await shot("picker");

  for (const [id, steps] of Object.entries(flows)) {
    await page.goto(`${base}/demo/${id}?mode=guided`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: /^Mulai demo/ }).click();
    await page.waitForTimeout(400);
    await shot(`${id}-1-start`);
    if (steps)
      for (const [index, name] of steps.entries()) {
        // The next action appears after the automatic handoff (about 1.4 s with motion).
        await page.getByRole("button", { name, exact: true }).click({ timeout: 6000 });
        await page.waitForTimeout(reduced ? 300 : 900);
        await overflow(`${id} step ${index + 1}`);
        if (index < steps.length - 1) await shot(`${id}-${index + 2}`);
      }
    else {
      const boxes = page.getByRole("checkbox");
      for (let i = 0; i < 4; i++) await boxes.nth(i).check();
      await page.getByRole("button", { name: "Simpan laporan pembukaan", exact: true }).click();
    }
    await page.getByRole("heading", { name: "Ini yang Anda lihat sebagai owner." }).waitFor();
    await page.waitForTimeout(reduced ? 200 : 1500);
    await overflow(`${id} done`);
    await shot(`${id}-done`);
  }
  for (const route of ["overview", "reporting"]) {
    await page.goto(`${base}/demo/${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    await overflow(route);
    await shot(route);
  }
  assert.deepEqual(errors, [], `${tag}: console errors`);
  console.log(`PASS ${tag}: 4 cases end in the owner view, no overflow, no console errors`);
  await context.close();
}

(async () => {
  fs.mkdirSync("qa/artifacts", { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROME_PATH });
  try {
    await run(browser, { width: 1366, height: 900, reduced: false, tag: "desktop" });
    await run(browser, { width: 768, height: 1024, reduced: false, tag: "tablet" });
    await run(browser, { width: 375, height: 812, reduced: false, tag: "mobile" });
    await run(browser, { width: 1366, height: 900, reduced: true, tag: "reduced" });
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
