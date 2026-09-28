import fs from "node:fs";
import path from "node:path";
import lighthouse from "lighthouse";
import { launch } from "chrome-launcher";

fs.mkdirSync("qa/artifacts/lighthouse-profile", { recursive: true });
const chrome = await launch({
  chromePath: process.env.CHROME_PATH,
  chromeFlags: ["--headless", "--no-sandbox"],
  userDataDir: path.resolve("qa/artifacts/lighthouse-profile"),
  logLevel: "silent",
});
try {
  const result = await lighthouse(
    process.env.QA_URL ?? "http://127.0.0.1:3001",
    {
      port: chrome.port,
      logLevel: "error",
      onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    },
  );
  fs.writeFileSync(
    "qa/artifacts/lighthouse-mobile.json",
    JSON.stringify(result.lhr, null, 2),
  );
  console.log(
    JSON.stringify(
      {
        scores: Object.fromEntries(
          Object.entries(result.lhr.categories).map(([key, value]) => [
            key,
            value.score * 100,
          ]),
        ),
        lcp: result.lhr.audits["largest-contentful-paint"].displayValue,
        cls: result.lhr.audits["cumulative-layout-shift"].displayValue,
      },
      null,
      2,
    ),
  );
} finally {
  await chrome.kill();
}
