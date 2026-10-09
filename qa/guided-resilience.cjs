// Keyboard-only Finance run on a phone, corrupt saved progress, blocked storage.
// Usage: node qa/guided-resilience.cjs [baseUrl]   (default http://127.0.0.1:3000)
const { chromium, expect } = require("@playwright/test");
const fs = require("fs");
const base = process.argv[2] ?? "http://127.0.0.1:3000";

(async () => {
  const b = await chromium.launch({ channel: "chrome", headless: true });
  const checks = [];
  const c = await b.newContext({ viewport: { width: 390, height: 844 } });
  const p = await c.newPage();
  await p.goto(`${base}/demo/finance?mode=guided`, { waitUntil: "networkidle" });
  // Tab forward from the current focus until the named button is reached, then press Enter.
  // The button only exists after the automatic handoff, so wait for it first.
  async function activate(name) {
    await p.getByRole("button", { name, exact: true }).waitFor();
    for (let i = 0; i < 80; i++) {
      await p.keyboard.press("Tab");
      const found = await p.evaluate(
        (n) =>
          document.activeElement?.tagName === "BUTTON" &&
          document.activeElement.textContent.trim() === n,
        name,
      );
      if (found) {
        await p.keyboard.press("Enter");
        return;
      }
    }
    throw new Error("Cannot tab to " + name);
  }
  for (const name of [
    "Mulai demo Finance",
    "Kirim pengajuan Rp350.000",
    "Setujui pengajuan",
    "Verifikasi & catat pembayaran",
  ])
    await activate(name);
  await expect(p.getByRole("heading", { name: "Ini yang Anda lihat sebagai owner." })).toBeVisible();
  checks.push("Finance completed using Tab and Enter only on a 390px viewport, with automatic handoffs");
  await c.close();

  const broken = await b.newContext();
  await broken.addInitScript(() => localStorage.setItem("alur_kendali_guided_v1", "{broken"));
  const q = await broken.newPage();
  await q.goto(`${base}/demo/finance?mode=guided`, { waitUntil: "networkidle" });
  await expect(q.locator(".demo-storage-notice")).toContainText("Progres sebelumnya tidak terbaca");
  await expect(q.getByRole("button", { name: "Mulai demo Finance" })).toBeEnabled();
  checks.push("Malformed persistence recovers with a visible notice");
  await broken.close();

  const blocked = await b.newContext();
  await blocked.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new DOMException("Blocked", "SecurityError");
    };
    Storage.prototype.getItem = function () {
      throw new DOMException("Blocked", "SecurityError");
    };
  });
  const r = await blocked.newPage();
  await r.goto(`${base}/demo/operations?mode=guided`, { waitUntil: "networkidle" });
  await r.getByRole("button", { name: "Mulai demo Operations" }).click();
  await expect(r.locator(".demo-storage-notice")).toContainText("tidak mengizinkan penyimpanan");
  await r.getByRole("checkbox").first().check();
  await expect(r.getByRole("checkbox").first()).toBeChecked();
  checks.push("Unavailable storage keeps the current session functional with an explicit notice");
  await blocked.close();

  console.log(JSON.stringify({ checks }, null, 2));
  fs.writeFileSync("qa/artifacts/guided-resilience.json", JSON.stringify({ checks }, null, 2));
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
