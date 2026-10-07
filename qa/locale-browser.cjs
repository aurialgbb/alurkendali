const { chromium } = require("playwright");
const { default: AxeBuilder } = require("@axe-core/playwright");
const fs = require("node:fs");
const assert = require("node:assert/strict");
const origin = process.env.QA_URL || "http://127.0.0.1:3000";

(async () => {
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    permissions: ["clipboard-read", "clipboard-write"],
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const checks = [];
  const pass = (name) => {
    checks.push(name);
    console.log("PASS " + name);
  };
  const switchTo = async (language) => {
    const scope = (await page.getByRole("dialog").count())
      ? page.getByRole("dialog")
      : page;
    await scope
      .getByRole("button", {
        name: language === "en" ? "English" : "Bahasa Indonesia",
        exact: true,
      })
      .filter({ visible: true })
      .click();
    await page.waitForFunction(
      (expected) => document.documentElement.lang === expected,
      language,
    );
  };
  await page.goto(origin);
  await page
    .getByRole("button", { name: "Diskusikan Proses Anda", exact: true })
    .first()
    .waitFor();
  await page.getByText("Semua tahap selesai", { exact: true }).waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "id");
  const original = await page.locator("main").innerText();
  await switchTo("en");
  await page
    .getByRole("button", { name: "Discuss Your Workflow", exact: true })
    .first()
    .waitFor();
  assert.match(
    await page.locator("#hero").innerText(),
    /Your business is growing/,
  );
  await page.screenshot({ path: "qa/artifacts/language-desktop.png" });
  await switchTo("id");
  assert.equal(await page.locator("main").innerText(), original);
  pass("ID content returns exactly after ID → ENG → ID");
  await switchTo("en");
  await page.reload();
  await page
    .getByRole("button", { name: "Discuss Your Workflow", exact: true })
    .first()
    .waitFor();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  assert.match(
    await page.locator('meta[name="description"]').getAttribute("content"),
    /Consulting/,
  );
  pass(
    "Cookie remembers ENG and server renders matching language and metadata",
  );

  const texts = {};
  for (const route of [
    "/demo",
    "/demo/finance",
    "/demo/inventory",
    "/demo/procurement",
    "/demo/operations",
    "/demo/overview",
    "/demo/reporting",
    "/demo/finance?mode=explore",
    "/demo/inventory?mode=explore",
    "/demo/procurement?mode=explore",
    "/demo/operations?mode=explore",
  ]) {
    await page.goto(origin + route);
    await page.locator(".language-switch").waitFor();
    await page.waitForTimeout(300);
    texts[route] = await page.locator("body").innerText();
    assert.equal(await page.locator("html").getAttribute("lang"), "en");
    assert.ok(!/Memuat|Menyiapkan/.test(texts[route]), route);
  }
  fs.writeFileSync(
    "qa/artifacts/language-pages.json",
    JSON.stringify(texts, null, 2),
  );
  pass("All 11 portal views render in ENG");

  const go = async (route) => {
    await page.goto(origin + route);
    await page
      .locator(".language-switch")
      .first()
      .waitFor({ state: "attached" });
  };
  const button = (name) => page.getByRole("button", { name, exact: true });
  const saved = () =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem("alur_kendali_guided_v1")).states,
    );
  const snapshot = () =>
    page.evaluate(() => [
      localStorage.getItem("alur_kendali_guided_v1"),
      localStorage.getItem("alur_kendali_demo_state_v2"),
    ]);
  const flip = async () => {
    const before = await snapshot();
    await switchTo("id");
    await switchTo("en");
    assert.deepEqual(await snapshot(), before);
  };
  await go("/demo/finance");
  await button("Start demo: Finance").click();
  await page
    .getByLabel("Request notes")
    .fill("Catatan pengguna: Pengajuan biaya");
  await flip();
  assert.equal(
    await page.getByLabel("Request notes").inputValue(),
    "Catatan pengguna: Pengajuan biaya",
  );
  await button("Submit Rp350.000 request").click();
  await flip();
  await button("Continue as Manager").click();
  await button("Approve request").click();
  await button("Continue as Finance").click();
  await flip();
  await button("Verify & record payment").click();
  assert.equal((await saved()).finance.finance.status, "paid");
  assert.equal(
    (await saved()).finance.finance.note,
    "Catatan pengguna: Pengajuan biaya",
  );
  pass(
    "Finance form, role handoffs, approval and payment preserve data across switches",
  );

  await go("/demo/inventory");
  await button("Start demo: Inventory").click();
  await page.getByLabel("Paper quantity (reams)").fill("37");
  await flip();
  assert.equal(
    await page.getByLabel("Paper quantity (reams)").inputValue(),
    "37",
  );
  await button("Send from Central Warehouse").click();
  await flip();
  await button("Continue as Manager").click();
  await button("Confirm receipt of 37 reams").click();
  assert.equal((await saved()).inventory.inventory.destination, 47);
  pass("Inventory keeps stock and entered quantity during language changes");

  await go("/demo/procurement");
  await button("Start demo: Procurement").click();
  await button("Approve Rp3.200.000 order").click();
  await button("Continue as Staff").click();
  await page.getByLabel("Scanners received").fill("1");
  await button("Record goods receipt").click();
  assert.match(
    await page.locator('main [role="alert"]').innerText(),
    /2 scanners/,
  );
  await flip();
  await page.getByLabel("Scanners received").fill("2");
  await button("Record goods receipt").click();
  await button("Continue as Finance").click();
  await page.getByLabel("Choose a sample invoice").selectOption("3500000");
  await button("Match three documents").click();
  await flip();
  assert.equal(
    await page.getByLabel("Choose a sample invoice").inputValue(),
    "3500000",
  );
  assert.match(
    await page.locator('main [role="alert"]').innerText(),
    /invoice amount differs/,
  );
  await page.getByLabel("Choose a sample invoice").selectOption("3200000");
  await button("Match three documents").click();
  await button("Record simulated payment").click();
  assert.equal((await saved()).procurement.procurement.status, "paid");
  pass(
    "Procurement receipt guards, mismatch messages and corrected payment work in ENG",
  );

  await go("/demo/operations");
  await button("Start demo: Operations").click();
  await page.getByRole("checkbox").first().check();
  await flip();
  assert.equal(await page.getByRole("checkbox").first().isChecked(), true);
  for (let i = 1; i < 4; i++) await page.getByRole("checkbox").nth(i).check();
  await button("Save opening report").click();
  assert.equal((await saved()).operations.operations.completed, true);
  pass("Operations checklist and report retain progress during switching");

  await go("/demo/finance");
  await button("Restart scenario").click();
  await button("Yes, restart").click();
  await button("Start demo: Finance").click();
  await button("Submit Rp350.000 request").click();
  await button("Continue as Manager").click();
  await button("Reject with a reason").click();
  await page.getByLabel("Rejection reason").fill("Pengajuan biaya");
  await flip();
  assert.equal(
    await page.getByLabel("Rejection reason").inputValue(),
    "Pengajuan biaya",
  );
  await button("Save rejection").click();
  await flip();
  assert.match(
    await page.locator(".scenario-rejection").innerText(),
    /Pengajuan biaya/,
  );
  assert.equal((await saved()).finance.finance.reason, "Pengajuan biaya");
  pass(
    "Rejection reason remains verbatim in the form, result and translated history",
  );

  await go("/demo/reporting");
  await page.getByLabel("Search documents or activities").fill("EXP-DEMO-001");
  await page
    .locator(".report-filters")
    .getByLabel("Category")
    .selectOption("finance");
  const count = await page.locator(".report-records li").count();
  await flip();
  assert.equal(
    await page.getByLabel("Search documents or activities").inputValue(),
    "EXP-DEMO-001",
  );
  assert.equal(await page.locator(".report-records li").count(), count);
  let pending = page.waitForEvent("download");
  await button("Download history CSV").click();
  await (await pending).saveAs("qa/artifacts/language-english.csv");
  const csvEn = fs.readFileSync("qa/artifacts/language-english.csv", "utf8");
  assert.match(csvEn, /Document,Module,Activity,Performed by,Time/);
  assert.match(csvEn, /Manager rejected the request: Pengajuan biaya/);
  await switchTo("id");
  pending = page.waitForEvent("download");
  await button("Unduh riwayat CSV").click();
  await (await pending).saveAs("qa/artifacts/language-indonesian.csv");
  assert.match(
    fs.readFileSync("qa/artifacts/language-indonesian.csv", "utf8"),
    /Dokumen,Modul,Aktivitas,Pelaksana,Waktu/,
  );
  await switchTo("en");
  pass(
    "Reporting filters persist and CSV localizes system text while preserving user input",
  );

  await go("/demo/finance?mode=explore");
  await button("Create sample request").click();
  await page.getByLabel("Branch requirements").fill("Pengajuan biaya");
  await page.getByLabel("Amount (rupiah)").fill("450000");
  await page.getByLabel("Notes", { exact: true }).fill("Catatan pengguna");
  await flip();
  assert.equal(
    await page.getByLabel("Branch requirements").inputValue(),
    "Pengajuan biaya",
  );
  await button("Submit sample request").click();
  await page.getByRole("button", { name: /Pengajuan biaya/ }).click();
  await flip();
  assert.match(await page.getByRole("dialog").innerText(), /Pengajuan biaya/);
  assert.match(await page.getByRole("dialog").innerText(), /Catatan pengguna/);
  const newCode = await page.getByRole("dialog").locator("h2").innerText();
  await page.keyboard.press("Escape");
  await page.getByLabel("Active role").selectOption("manager");
  await page.getByRole("button", { name: /Pengajuan biaya/ }).click();
  await button("Reject with a reason").click();
  await page.getByLabel("Rejection reason").fill("Pengajuan biaya");
  await button("Save rejection").click();
  assert.match(
    await page.getByRole("dialog").innerText(),
    /Rejection reason: Pengajuan biaya/,
  );
  await page.keyboard.press("Escape");
  await page.getByLabel("Search documents").fill("Urgent LPG");
  assert.equal(await page.locator(".explorer-records > button").count(), 1);
  pass(
    "Explore mode preserves user copy, form and open dialog; translated titles are searchable",
  );
  await go("/demo/reporting");
  await page.getByLabel("Data source").selectOption("exploration");
  await page.getByLabel("Search documents or activities").fill(newCode);
  assert.equal(
    await page.locator(".report-record-action p").first().innerText(),
    "Pengajuan biaya",
  );
  pass(
    "Exploration rejection history preserves reasons that match dictionary entries",
  );

  const accessibility = [];
  const viewports = [];
  for (const locale of ["id", "en"]) {
    await switchTo(locale);
    for (const route of [
      "/",
      "/demo",
      "/demo/finance",
      "/demo/reporting",
      "/demo/finance?mode=explore",
    ]) {
      await go(route);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
        .analyze();
      accessibility.push({
        locale,
        route,
        violations: result.violations.map((v) => ({
          id: v.id,
          nodes: v.nodes.map((n) => n.target),
        })),
      });
      assert.deepEqual(
        result.violations.map((v) => v.id),
        [],
        `${locale} ${route}`,
      );
    }
    for (const width of [320, 360, 390, 720, 768, 1100, 1280, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      for (const route of [
        "/",
        "/demo/finance",
        "/demo/operations?mode=explore",
      ]) {
        await go(route);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        );
        viewports.push({ locale, width, route, overflow });
        assert.equal(overflow, false, `${locale} ${width} ${route}`);
        if (width === 390 && route === "/") {
          await page.locator(".menu-button").click();
          await page.screenshot({
            path: `qa/artifacts/language-mobile-${locale}.png`,
          });
          assert.equal(
            await page.locator(".mobile-nav .language-switch").isVisible(),
            true,
          );
        }
      }
    }
    await page.setViewportSize({ width: 1440, height: 1000 });
    await go("/");
    await page.evaluate(
      () => (document.documentElement.style.fontSize = "200%"),
    );
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.evaluate(() => (document.documentElement.style.fontSize = ""));
  }
  pass(
    "Both languages pass axe, eight responsive widths and 200% text enlargement",
  );
  await go("/demo");
  await page.evaluate(() =>
    Object.defineProperty(document, "cookie", {
      configurable: true,
      get: () => "",
      set: () => {
        throw new Error("Cookies blocked");
      },
    }),
  );
  await switchTo("id");
  await switchTo("en");
  await page.getByRole("link", { name: "Overview", exact: true }).click();
  assert.equal(await page.locator("html").getAttribute("lang"), "en");
  pass("Cookie failures do not block switching or client navigation");
  assert.deepEqual(errors, []);
  fs.writeFileSync(
    "qa/artifacts/language-verification.json",
    JSON.stringify({ checks, errors, accessibility, viewports }, null, 2),
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
