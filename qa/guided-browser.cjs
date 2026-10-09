// Guided demo, free mode, history, owner view, contact hand-off, axe and overflow.
// Usage: node qa/guided-browser.cjs [baseUrl]   (default http://127.0.0.1:3000)
const { chromium, expect } = require("@playwright/test");
const AxeBuilder = require("@axe-core/playwright").default;
const assert = require("node:assert/strict");
const fs = require("fs");
const base = process.argv[2] ?? "http://127.0.0.1:3000";

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    acceptDownloads: true,
  });
  const p = await context.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const checks = [];
  const go = (route) => p.goto(base + route, { waitUntil: "networkidle" });
  const button = (name) => p.getByRole("button", { name, exact: true });
  const saved = () =>
    p.evaluate(() => JSON.parse(localStorage.getItem("alur_kendali_guided_v1")).states);
  const ownerView = () =>
    expect(p.getByRole("heading", { name: "Ini yang Anda lihat sebagai owner." })).toBeVisible();

  await go("/demo");
  await expect(p.getByRole("heading", { name: /Mulai dari satu/ })).toBeVisible();
  await p.getByRole("link", { name: /01 \/ Finance/ }).click();
  await p.waitForURL("**/demo/finance?mode=guided");
  await expect(p.locator(".cast-strip")).toContainText("Anda akan memerankan 3 orang");

  // Finance: no "continue as" clicks; the handoff happens by itself, also after a reload.
  await button("Mulai demo Finance").focus();
  await p.keyboard.press("Enter");
  await expect(p.getByLabel("Catatan pengajuan")).toBeEnabled();
  await p.getByLabel("Catatan pengajuan").fill("Untuk kasir minggu ini");
  await expect(p.locator(".receipt-match")).toContainText("Belum dicocokkan");
  await button("Kirim pengajuan Rp350.000").click();
  await p.reload({ waitUntil: "networkidle" });
  await button("Setujui pengajuan").click();
  await expect(p.locator(".doc-stamp")).toContainText("Disetujui Manager");
  await button("Verifikasi & catat pembayaran").click();
  await ownerView();
  await expect(p.locator(".receipt-match")).toContainText("Cocok dengan pengajuan");
  let s = await saved();
  assert.equal(s.finance.events.length, 3);
  assert.equal(s.finance.finance.note, "Untuk kasir minggu ini");
  assert.equal(await p.getByRole("button", { name: /Lanjut sebagai/ }).count(), 0);
  checks.push("Finance: keyboard start, auto handoff (incl. reload), stamp, match, owner view");
  await p.screenshot({ path: "qa/artifacts/guided-finance-complete.png", fullPage: true });

  await p.getByRole("link", { name: "Riwayat dokumen", exact: true }).click();
  await p.waitForURL("**/demo/reporting?*");
  await expect(p.locator(".report-records li")).toHaveCount(3);
  await expect(p.locator(".report-record-code").first()).toContainText("Finance");
  const downloadPromise = p.waitForEvent("download");
  await button("Unduh riwayat CSV").click();
  const download = await downloadPromise;
  await download.saveAs("qa/artifacts/guided-finance-export.csv");
  const csv = fs.readFileSync("qa/artifacts/guided-finance-export.csv", "utf8");
  assert.ok(csv.includes("EXP-DEMO-001"));
  assert.ok(csv.includes("SIM-PAY-001"));
  checks.push("Filtered history with category labels and real CSV export");

  await go("/demo/inventory?mode=guided");
  await button("Mulai demo Inventory").click();
  await p.getByLabel("Jumlah kertas (rim)").fill("37");
  await button("Kirim dari Gudang Pusat").click();
  s = await saved();
  assert.equal(s.inventory.inventory.source, 63);
  assert.equal(s.inventory.inventory.transit, 37);
  await button("Konfirmasi terima 37 rim").click();
  await ownerView();
  s = await saved();
  assert.equal(s.inventory.inventory.destination, 47);
  await expect(p.locator(".owner-card")).toContainText("110 rim");
  checks.push("Inventory dispatch, auto handoff, balance conservation and receipt");

  // Procurement: the first invoice is always the mismatched one.
  await go("/demo/procurement?mode=guided");
  await button("Mulai demo Procurement").click();
  await button("Setujui pesanan Rp3.200.000").click();
  await p.getByLabel("Jumlah scanner yang diterima").fill("1");
  await button("Catat penerimaan barang").click();
  await expect(p.locator("main").getByRole("alert")).toContainText("2 scanner");
  await p.getByLabel("Jumlah scanner yang diterima").fill("2");
  await button("Catat penerimaan barang").click();
  await button("Cocokkan tiga dokumen").click();
  await expect(p.locator(".match-document.has-mismatch")).toContainText("Selisih Rp300.000");
  await expect(p.locator(".doc-stamp.is-held")).toBeVisible();
  await expect(button("Catat pembayaran simulasi")).toHaveCount(0);
  await p.screenshot({ path: "qa/artifacts/guided-procurement-mismatch.png", fullPage: true });
  await button("Cocokkan tagihan koreksi Rp3.200.000").click();
  await button("Catat pembayaran simulasi").click();
  await ownerView();
  await expect(p.locator(".owner-card")).toContainText("Tagihan selisih ditahan");
  checks.push("Procurement: partial receipt guard, mismatch always shown and blocks payment, correction, payment");

  await go("/demo/operations?mode=guided");
  await button("Mulai demo Operations").click();
  await expect(button("Simpan laporan pembukaan")).toBeDisabled();
  const boxes = p.getByRole("checkbox");
  for (let i = 0; i < 4; i++) await boxes.nth(i).check();
  await expect(p.locator(".check-meta")).toHaveCount(4);
  await button("Simpan laporan pembukaan").click();
  await ownerView();
  s = await saved();
  assert.equal(s.operations.events.length, 5);
  checks.push("Operations checklist shows who and when per item, completion and audit");

  await go("/demo/overview");
  await expect(p.locator(".management-metrics")).toContainText("Rp3.550.000");
  await p.screenshot({ path: "qa/artifacts/guided-overview-complete.png", fullPage: true });
  checks.push("Owner view totals derived from completed scenarios");

  await go("/demo/finance?mode=guided");
  await button("Ulangi skenario").click();
  await expect(p.getByRole("dialog")).toBeVisible();
  await p.keyboard.press("Escape");
  await expect(button("Ulangi skenario")).toBeFocused();
  assert.equal((await saved()).finance.finance.status, "paid");
  await button("Ulangi skenario").click();
  await button("Ya, ulangi").click();
  await expect(button("Mulai demo Finance")).toBeVisible();
  s = await saved();
  assert.equal(s.finance.events.length, 0);
  assert.equal(s.inventory.inventory.status, "received");
  assert.equal(s.procurement.procurement.status, "paid");
  assert.equal(s.operations.operations.completed, true);
  checks.push("Reset cancel/Escape focus, scoped reset preserves other categories");

  await button("Mulai demo Finance").click();
  await button("Kirim pengajuan Rp350.000").click();
  await button("Tolak dengan alasan").click();
  await p.getByLabel("Alasan penolakan").fill("Kebutuhan belum dijelaskan");
  await button("Simpan penolakan").click();
  await expect(p.getByRole("heading", { name: "Pengajuan ditolak", exact: true })).toBeVisible();
  await button("Coba lagi dengan persetujuan").click();
  await expect(button("Kirim pengajuan Rp350.000")).toBeVisible();
  checks.push("Rejection records the reason and offers a way forward");

  // Contact hand-off without a WhatsApp number: the landing page opens its dialog.
  await go("/demo/finance?mode=guided");
  await p.locator(".demo-header-cta").click();
  await p.waitForURL((url) => url.pathname === "/");
  await expect(p.locator("#contact-title")).toBeVisible();
  assert.ok(!p.url().includes("kontak=1"));
  await p.keyboard.press("Escape");
  checks.push("Demo header CTA returns to the landing page with the contact dialog open");

  await go("/demo/finance?mode=explore");
  await expect(p.getByLabel("Lihat sebagai")).toHaveValue("director");
  await button("Buat pengajuan contoh").click();
  await p.getByLabel("Kebutuhan cabang").fill("Biaya uji eksplorasi");
  await p.getByLabel("Nominal (rupiah)").fill("450000");
  await button("Kirim pengajuan contoh").click();
  await p.getByLabel("Lihat sebagai").selectOption("staff");
  await p.getByRole("button", { name: /Biaya uji eksplorasi/ }).click();
  await expect(p.getByRole("dialog")).toContainText("Dokumen ini menunggu Manager");
  await p.keyboard.press("Escape");
  await p.getByLabel("Lihat sebagai").selectOption("manager");
  await p.getByRole("button", { name: /Biaya uji eksplorasi/ }).click();
  await button("Setujui pengajuan").click();
  await expect(p.getByRole("dialog")).toContainText("Menunggu Finance");
  await p.keyboard.press("Escape");
  await p.getByLabel("Lihat sebagai").selectOption("finance");
  await p.getByRole("button", { name: /Biaya uji eksplorasi/ }).click();
  await button("Catat pembayaran simulasi").click();
  await expect(p.getByRole("dialog")).toContainText("Pembayaran contoh tercatat");
  await p.keyboard.press("Escape");
  await p.getByLabel("Cari dokumen").fill("tidak-ada-dokumen");
  await expect(p.getByRole("heading", { name: "Tidak ada dokumen yang cocok." })).toBeVisible();
  await button("Tampilkan semua").click();
  checks.push("Free mode opens as Director; role guards, reactive detail, payment, filters, empty state");

  await go("/demo/inventory?mode=explore");
  await p.getByRole("button", { name: /ADJ-2026-008/ }).click();
  await button("Setujui penyesuaian stok").click();
  await expect(p.getByRole("dialog")).toContainText("Selesai");
  await p.keyboard.press("Escape");
  await go("/demo/procurement?mode=explore");
  await p.getByRole("button", { name: /PR-2026-039/ }).click();
  await button("Catat pembayaran simulasi").click();
  await expect(p.getByRole("dialog")).toContainText("Pembayaran contoh tercatat");
  await p.keyboard.press("Escape");
  await go("/demo/operations?mode=explore");
  await p.getByRole("checkbox").first().uncheck();
  await expect(p.locator(".explorer-operations section").first()).toContainText("Sedang dikerjakan");
  checks.push("Free mode stock adjustment, matched procurement payment, operations and audit");

  await go("/demo/reporting");
  await p.getByLabel("Sumber data").selectOption("exploration");
  // The visitor's last free-mode action (reopening a checklist item) comes first,
  // ahead of the seed rows with their made-up "today" times.
  await expect(p.locator(".report-records li").first()).toContainText("Dibuka kembali");
  const rows = await p.locator(".report-records li").allInnerTexts();
  const own = rows.findIndex((row) => row.includes("Rp450.000"));
  const seed = rows.findIndex((row) => row.includes("PO-2026-042"));
  assert.ok(own >= 0 && own < seed, "visitor actions sort above seed rows");
  await p.getByLabel("Cari dokumen atau aktivitas").fill("Biaya uji eksplorasi");
  await button("Hapus filter").click();
  await p.locator(".report-filters").getByLabel("Kategori").selectOption("finance");
  checks.push("History source/category/search filters, newest free-mode event first");

  const routes = [
    "/demo",
    "/demo/finance?mode=guided",
    "/demo/inventory?mode=guided",
    "/demo/procurement?mode=guided",
    "/demo/operations?mode=guided",
    "/demo/overview",
    "/demo/reporting",
    "/demo/finance?mode=explore",
  ];
  const accessibility = [];
  for (const route of routes) {
    await go(route);
    const result = await new AxeBuilder({ page: p })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    accessibility.push({
      route,
      violations: result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes.map((n) => ({ target: n.target, summary: n.failureSummary })),
      })),
    });
  }
  const viewports = [];
  for (const width of [360, 390, 768, 1024, 1440]) {
    await p.setViewportSize({ width, height: 1000 });
    for (const route of routes) {
      await go(route);
      const overflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
      viewports.push({ width, route, overflow });
      if (width === 390 && route === "/demo/inventory?mode=guided")
        await p.screenshot({ path: "qa/artifacts/guided-inventory-mobile.png", fullPage: true });
    }
  }
  await p.setViewportSize({ width: 390, height: 844 });
  await go("/demo");
  await p.getByLabel("Kasus").selectOption("procurement");
  await p.waitForURL("**/demo/procurement?mode=guided");
  checks.push("Mobile case picker replaces the tab row");

  await p.setViewportSize({ width: 1440, height: 1000 });
  await go("/demo/finance?mode=guided");
  await p.evaluate(() => (document.body.style.zoom = "2"));
  const zoomOverflow = await p.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  await p.screenshot({ path: "qa/artifacts/guided-zoom-200.png", fullPage: true });
  await go("/");
  await p.locator("#solusi").scrollIntoViewIfNeeded();
  await expect(p.getByRole("link", { name: "Coba demo Finance", exact: true })).toHaveAttribute(
    "href",
    "/demo/finance?mode=guided",
  );
  checks.push("LP category deep link");
  const result = { checks, errors, accessibility, viewports, zoomOverflow };
  fs.writeFileSync("qa/artifacts/guided-verification.json", JSON.stringify(result, null, 2));
  console.log(JSON.stringify({ checks, errors, axe: accessibility.filter((r) => r.violations.length), overflow: viewports.filter((v) => v.overflow), zoomOverflow }, null, 2));
  await browser.close();
  if (
    errors.length ||
    accessibility.some((r) => r.violations.length) ||
    viewports.some((r) => r.overflow) ||
    zoomOverflow
  )
    process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
