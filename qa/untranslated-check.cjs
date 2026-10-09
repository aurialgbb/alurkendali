// Lists tr("...") literals in the given source files that have no English
// translation. Run `npm run test:locale:copy` first so qa/generated is fresh.
// Usage: node qa/untranslated-check.cjs <file> [file...]
const fs = require("node:fs");
const { translate } = require("./generated/translate.js");

const missing = new Set();
for (const file of process.argv.slice(2)) {
  const source = fs.readFileSync(file, "utf8");
  for (const match of source.matchAll(/tr\(\s*"((?:[^"\\]|\\.)*)"/g)) {
    const text = JSON.parse(`"${match[1]}"`);
    if (!/[a-z]/i.test(text)) continue;
    if (translate("en", text) === text) missing.add(`${file}: ${text}`);
  }
}
console.log(missing.size ? [...missing].join("\n") : "PASS every tr() literal has an English translation");
process.exitCode = missing.size ? 1 : 0;
