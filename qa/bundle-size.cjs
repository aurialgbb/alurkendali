// Sums the JavaScript a first visit to the landing page downloads (gzip estimate).
// Usage: node qa/bundle-size.cjs [baseUrl]   (run against `next start`)
const { chromium } = require("playwright");
const zlib = require("node:zlib");

const base = process.argv[2] ?? "http://127.0.0.1:3200";

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const sizes = [];
  page.on("response", async (response) => {
    if (!response.url().endsWith(".js")) return;
    try {
      sizes.push(zlib.gzipSync(await response.body()).length);
    } catch {
      /* Redirected or aborted responses have no body to measure. */
    }
  });
  await page.goto(base, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  const total = sizes.reduce((sum, size) => sum + size, 0) / 1024;
  console.log(`total JS ${total.toFixed(1)} KB gzip across ${sizes.length} files`);
  await browser.close();
})();
