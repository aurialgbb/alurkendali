const assert = require("node:assert/strict");
const { translate } = require("./generated/translate.js");
const { translateSample } = require("./generated/demo-copy.js");
const { englishCopy } = require("./generated/english-copy.js");
const { checklist } = require("./generated/demo-scenarios.js");
const {
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_PROCUREMENT,
  INITIAL_OPERATIONS,
} = require("./generated/demo-data.js");

for (const text of Object.keys(englishCopy))
  assert.equal(translate("id", text), text);
assert.equal(
  translate("en", "Manager menolak pengajuan: Pengajuan biaya"),
  "Manager rejected the request: Pengajuan biaya",
);
assert.equal(
  translate("en", "Cabang Kemang menerima 37 rim. Saldo cabang: 47 rim."),
  "Kemang Branch received 37 reams. Branch stock: 47 reams.",
);
assert.equal(
  translate(
    "en",
    "Tagihan Rp3.500.000 tidak cocok dengan PO Rp3.200.000. Pembayaran ditahan.",
  ),
  "Invoice Rp3.500.000 does not match PO Rp3.200.000. Payment blocked.",
);
assert.equal(
  translate(
    "en",
    "Finance mencatat pembayaran contoh EXP-DEMO-123 sebesar Rp450.000.",
  ),
  "Finance recorded a sample payment of Rp450.000 for EXP-DEMO-123.",
);
for (const label of checklist)
  assert.notEqual(translate("en", `Selesai: ${label}.`), `Selesai: ${label}.`);
assert.equal(translate("en", "Imported custom text"), "Imported custom text");
assert.equal(
  translateSample("en", "user-written-record", "Pengajuan biaya"),
  "Pengajuan biaya",
);
assert.equal(
  translateSample(
    "en",
    "user-written-record",
    "Gas habis saat jam sibuk dan persediaan sabun habis. Menggunakan uang kas kecil kasir.",
  ),
  "Gas habis saat jam sibuk dan persediaan sabun habis. Menggunakan uang kas kecil kasir.",
);
for (const record of [
  ...INITIAL_EXPENSES,
  ...INITIAL_INVENTORY,
  ...INITIAL_PROCUREMENT,
  ...INITIAL_OPERATIONS,
]) {
  assert.equal(translateSample("id", record.id, record.title), record.title);
  if (
    /[A-Za-z]/.test(record.title) &&
    ![
      "Opening SOP & Cash Float Checklist",
      "Mid-Day Restock & Shift Handover",
    ].includes(record.title)
  )
    assert.notEqual(
      translateSample("en", record.id, record.title),
      record.title,
    );
}
console.log(
  `PASS ${Object.keys(englishCopy).length} Indonesian copy entries preserved; legacy events and sample/user text verified`,
);
