import type { RoleType } from "./demo-data";

export const scenarioIds = [
  "finance",
  "inventory",
  "procurement",
  "operations",
] as const;
export type ScenarioId = (typeof scenarioIds)[number];
export const roleLabels: Record<RoleType, string> = {
  staff: "Staf",
  manager: "Manager",
  finance: "Finance",
  director: "Direktur",
};
export const scenarios = {
  finance: {
    label: "Finance",
    title: "Dari nota sampai biaya disetujui.",
    problem: "Bukti belanja ada, tetapi persetujuannya masih tersebar di chat.",
    description:
      "Ajukan biaya perlengkapan cabang, periksa sebagai Manager, lalu verifikasi sebagai Finance.",
    outcome: "Satu pengajuan, bukti dan riwayat yang terhubung.",
    code: "EXP-DEMO-001",
    steps: ["Ajukan biaya", "Persetujuan", "Verifikasi", "Hasil"],
    roles: ["staff", "manager", "finance", "finance"],
  },
  inventory: {
    label: "Inventory",
    title: "Ikuti barang sampai ke cabang.",
    problem: "Barang sudah keluar gudang. Apakah cabang sudah menerimanya?",
    description:
      "Kirim kertas A4 dari Gudang Pusat ke Cabang Kemang, lalu konfirmasi penerimaannya.",
    outcome: "Lokasi dan jumlah barang terlihat di setiap tahap.",
    code: "MOV-DEMO-001",
    steps: ["Siapkan mutasi", "Terima barang", "Hasil"],
    roles: ["staff", "manager", "manager"],
  },
  procurement: {
    label: "Procurement",
    title: "Periksa tagihan sebelum dibayar.",
    problem: "Tagihan supplier datang sebelum barang dan jumlahnya diperiksa.",
    description:
      "Setujui pesanan scanner, catat barang yang diterima, lalu cocokkan tiga dokumennya.",
    outcome: "Pembayaran hanya terbuka ketika dokumennya cocok.",
    code: "PO-DEMO-001",
    steps: [
      "Setujui pesanan",
      "Terima barang",
      "Cocokkan",
      "Pembayaran",
      "Hasil",
    ],
    roles: ["manager", "staff", "finance", "finance", "finance"],
  },
  operations: {
    label: "Operations",
    title: "Cabang siap buka, tanpa menebak.",
    problem:
      "Checklist tersebar dan tim berikutnya tidak tahu pekerjaan yang tersisa.",
    description:
      "Kerjakan pemeriksaan pembukaan Cabang Kemang, lalu simpan laporan kesiapan cabang.",
    outcome: "Pekerjaan, pelaksana, dan waktu selesai tercatat.",
    code: "OPS-DEMO-001",
    steps: ["Periksa cabang", "Simpan laporan", "Hasil"],
    roles: ["staff", "staff", "staff"],
  },
} satisfies Record<
  ScenarioId,
  {
    label: string;
    title: string;
    problem: string;
    description: string;
    outcome: string;
    code: string;
    steps: string[];
    roles: RoleType[];
  }
>;
export const checklist = [
  "Hitung uang awal kasir: Rp500.000",
  "Periksa kebersihan area pelanggan",
  "Uji mesin kasir dan printer struk",
  "Pastikan stok perlengkapan siap",
];
export interface ScenarioEvent {
  id: string;
  at: string;
  action: string;
  actor: RoleType;
  code: string;
}
export interface ScenarioState {
  started: boolean;
  role: RoleType;
  finance: {
    status: "draft" | "submitted" | "approved" | "paid" | "rejected";
    note: string;
    reason: string;
    reference: string;
  };
  inventory: {
    status: "draft" | "sent" | "received";
    quantity: number;
    source: number;
    transit: number;
    destination: number;
  };
  procurement: {
    status: "draft" | "ordered" | "received" | "matched" | "paid";
    received: number;
    invoice: number;
    mismatch: boolean;
  };
  operations: { checks: boolean[]; completed: boolean };
  events: ScenarioEvent[];
  error: string;
}
export type ScenarioAction =
  | { type: "start" }
  | { type: "role"; role: RoleType }
  | { type: "submit"; note: string }
  | { type: "approve" }
  | { type: "verify" }
  | { type: "reject"; reason: string }
  | { type: "dispatch"; quantity: number }
  | { type: "receive" }
  | { type: "order" }
  | { type: "goods"; quantity: number }
  | { type: "match"; invoice: number }
  | { type: "pay" }
  | { type: "check"; index: number; checked: boolean }
  | { type: "finish" };
export function freshScenario(id: ScenarioId): ScenarioState {
  return {
    started: false,
    role: scenarios[id].roles[0],
    finance: { status: "draft", note: "", reason: "", reference: "" },
    inventory: {
      status: "draft",
      quantity: 20,
      source: 100,
      transit: 0,
      destination: 10,
    },
    procurement: {
      status: "draft",
      received: 0,
      invoice: 3200000,
      mismatch: false,
    },
    operations: { checks: [false, false, false, false], completed: false },
    events: [],
    error: "",
  };
}
export function scenarioStep(id: ScenarioId, s: ScenarioState): number {
  if (id === "finance")
    return { draft: 0, submitted: 1, approved: 2, paid: 3, rejected: 1 }[
      s.finance.status
    ];
  if (id === "inventory")
    return { draft: 0, sent: 1, received: 2 }[s.inventory.status];
  if (id === "procurement")
    return { draft: 0, ordered: 1, received: 2, matched: 3, paid: 4 }[
      s.procurement.status
    ];
  return s.operations.completed
    ? 2
    : s.operations.checks.every(Boolean)
      ? 1
      : 0;
}
export function isComplete(id: ScenarioId, s: ScenarioState) {
  return scenarioStep(id, s) === scenarios[id].steps.length - 1;
}

export function transition(
  id: ScenarioId,
  previous: ScenarioState,
  action: ScenarioAction,
  at: string,
): ScenarioState {
  const s = structuredClone(previous);
  s.error = "";
  const fail = (message: string) => ({ ...previous, error: message });
  const log = (message: string) =>
    s.events.push({
      id: `${scenarios[id].code}-${s.events.length + 1}`,
      at,
      action: message,
      actor: s.role,
      code: scenarios[id].code,
    });
  if (action.type === "start") {
    s.started = true;
    return s;
  }
  if (action.type === "role") {
    const required = scenarios[id].roles[scenarioStep(id, s)];
    if (action.role !== required)
      return fail(`Tahap ini membutuhkan peran ${roleLabels[required]}.`);
    s.role = action.role;
    return s;
  }
  if (!s.started) return fail("Mulai skenario terlebih dahulu.");
  if (s.role !== scenarios[id].roles[scenarioStep(id, s)])
    return fail(
      "Lanjutkan sebagai peran yang bertanggung jawab pada tahap ini.",
    );
  switch (action.type) {
    case "submit":
      if (id !== "finance" || s.finance.status !== "draft")
        return fail("Pengajuan ini sudah dikirim.");
      s.finance.status = "submitted";
      s.finance.note = action.note.trim().slice(0, 500);
      log("Biaya Rp350.000 diajukan bersama nota contoh.");
      break;
    case "approve":
      if (id !== "finance" || s.finance.status !== "submitted")
        return fail("Pengajuan belum dapat disetujui.");
      s.finance.status = "approved";
      log("Manager menyetujui biaya Rp350.000 untuk perlengkapan cabang.");
      break;
    case "verify":
      if (id !== "finance" || s.finance.status !== "approved")
        return fail("Persetujuan Manager diperlukan sebelum verifikasi.");
      s.finance.status = "paid";
      s.finance.reference = "SIM-PAY-001";
      log(
        "Finance mencocokkan nota Rp350.000 dan mencatat pembayaran simulasi SIM-PAY-001.",
      );
      break;
    case "reject":
      if (
        id !== "finance" ||
        s.finance.status !== "submitted" ||
        !action.reason.trim()
      )
        return fail("Isi alasan penolakan sebelum menyimpan.");
      s.finance.status = "rejected";
      s.finance.reason = action.reason.trim().slice(0, 500);
      log(`Manager menolak pengajuan: ${s.finance.reason}`);
      break;
    case "dispatch":
      if (id !== "inventory" || s.inventory.status !== "draft")
        return fail("Mutasi ini sudah dikirim.");
      if (
        !Number.isInteger(action.quantity) ||
        action.quantity < 1 ||
        action.quantity > s.inventory.source
      )
        return fail("Jumlah harus bilangan bulat antara 1 dan 100 rim.");
      s.inventory.quantity = action.quantity;
      s.inventory.source -= action.quantity;
      s.inventory.transit = action.quantity;
      s.inventory.status = "sent";
      log(
        `${action.quantity} rim kertas A4 dikirim dari Gudang Pusat ke Cabang Kemang.`,
      );
      break;
    case "receive":
      if (id !== "inventory" || s.inventory.status !== "sent")
        return fail("Barang belum dalam perjalanan atau sudah diterima.");
      s.inventory.destination += s.inventory.transit;
      s.inventory.transit = 0;
      s.inventory.status = "received";
      log(
        `Cabang Kemang menerima ${s.inventory.quantity} rim. Saldo cabang: ${s.inventory.destination} rim.`,
      );
      break;
    case "order":
      if (id !== "procurement" || s.procurement.status !== "draft")
        return fail("Pesanan ini sudah disetujui.");
      s.procurement.status = "ordered";
      log("Pesanan 2 scanner @ Rp1.600.000 disetujui. Total PO Rp3.200.000.");
      break;
    case "goods":
      if (id !== "procurement" || s.procurement.status !== "ordered")
        return fail("Penerimaan harus mengacu pada pesanan yang disetujui.");
      if (action.quantity !== 2)
        return fail(
          "PO berisi 2 scanner. Lengkapi penerimaan 2 unit sebelum melanjutkan contoh ini.",
        );
      s.procurement.received = action.quantity;
      s.procurement.status = "received";
      log("Staf mencatat penerimaan 2 scanner pada GR-DEMO-001.");
      break;
    case "match":
      if (id !== "procurement" || s.procurement.status !== "received")
        return fail("Penerimaan barang harus dicatat sebelum pencocokan.");
      if (!Number.isFinite(action.invoice) || action.invoice <= 0)
        return fail("Nominal tagihan harus lebih besar dari nol.");
      s.procurement.invoice = action.invoice;
      if (action.invoice !== 3200000 || s.procurement.received !== 2) {
        if (
          !s.procurement.mismatch ||
          previous.procurement.invoice !== action.invoice
        )
          log(
            `Tagihan Rp${action.invoice.toLocaleString("id-ID")} tidak cocok dengan PO Rp3.200.000. Pembayaran ditahan.`,
          );
        s.procurement.mismatch = true;
        s.error =
          "Nominal tagihan berbeda dari PO. Gunakan tagihan koreksi Rp3.200.000 lalu periksa kembali.";
      } else {
        s.procurement.mismatch = false;
        s.procurement.status = "matched";
        log("PO, penerimaan 2 scanner, dan tagihan Rp3.200.000 cocok.");
      }
      break;
    case "pay":
      if (
        id !== "procurement" ||
        s.procurement.status !== "matched" ||
        s.procurement.mismatch ||
        s.procurement.received !== 2 ||
        s.procurement.invoice !== 3200000
      )
        return fail("Pembayaran ditahan sampai tiga dokumen cocok.");
      s.procurement.status = "paid";
      log(
        "Pembayaran simulasi Rp3.200.000 dicatat dengan referensi SIM-PO-001.",
      );
      break;
    case "check":
      if (
        id !== "operations" ||
        s.operations.completed ||
        !Number.isInteger(action.index) ||
        action.index < 0 ||
        action.index >= checklist.length
      )
        return fail("Checklist ini tidak dapat diubah.");
      if (s.operations.checks[action.index] === action.checked) return s;
      s.operations.checks[action.index] = action.checked;
      log(
        `${action.checked ? "Selesai" : "Dibuka kembali"}: ${checklist[action.index]}.`,
      );
      break;
    case "finish":
      if (
        id !== "operations" ||
        s.operations.completed ||
        !s.operations.checks.every(Boolean)
      )
        return fail(
          "Selesaikan seluruh pemeriksaan sebelum menyimpan laporan.",
        );
      s.operations.completed = true;
      log(
        "Laporan pembukaan Cabang Kemang disimpan. Empat pemeriksaan selesai.",
      );
      break;
  }
  return s;
}

export type ScenarioMap = Record<ScenarioId, ScenarioState>;
export function freshScenarios(): ScenarioMap {
  return Object.fromEntries(
    scenarioIds.map((id) => [id, freshScenario(id)]),
  ) as ScenarioMap;
}
export function validSavedScenarios(value: unknown): value is ScenarioMap {
  if (!value || typeof value !== "object") return false;
  try {
    return scenarioIds.every((id) => {
      const s = (value as ScenarioMap)[id];
      const inv = s.inventory;
      return (
        typeof s.started === "boolean" &&
        Object.hasOwn(roleLabels, s.role) &&
        typeof s.error === "string" &&
        ["draft", "submitted", "approved", "paid", "rejected"].includes(
          s.finance.status,
        ) &&
        [s.finance.note, s.finance.reason, s.finance.reference].every(
          (v) => typeof v === "string",
        ) &&
        ["draft", "sent", "received"].includes(inv.status) &&
        [inv.source, inv.transit, inv.destination, inv.quantity].every(
          (v) => Number.isInteger(v) && v >= 0,
        ) &&
        inv.quantity >= 1 &&
        inv.quantity <= 100 &&
        inv.source + inv.transit + inv.destination === 110 &&
        (inv.status === "draft"
          ? inv.source === 100 && inv.transit === 0 && inv.destination === 10
          : inv.source === 100 - inv.quantity &&
            (inv.status === "sent"
              ? inv.transit === inv.quantity && inv.destination === 10
              : inv.transit === 0 && inv.destination === 10 + inv.quantity)) &&
        ["draft", "ordered", "received", "matched", "paid"].includes(
          s.procurement.status,
        ) &&
        [0, 2].includes(s.procurement.received) &&
        Number.isFinite(s.procurement.invoice) &&
        s.procurement.invoice > 0 &&
        typeof s.procurement.mismatch === "boolean" &&
        (!["matched", "paid"].includes(s.procurement.status) ||
          (s.procurement.received === 2 &&
            s.procurement.invoice === 3200000 &&
            !s.procurement.mismatch)) &&
        typeof s.operations.completed === "boolean" &&
        s.operations.checks.length === 4 &&
        s.operations.checks.every((v) => typeof v === "boolean") &&
        (!s.operations.completed || s.operations.checks.every(Boolean)) &&
        Array.isArray(s.events) &&
        s.events.length <= 1000 &&
        s.events.every(
          (e) =>
            typeof e.id === "string" &&
            typeof e.action === "string" &&
            e.code === scenarios[id].code &&
            Object.hasOwn(roleLabels, e.actor) &&
            typeof e.at === "string" &&
            Number.isFinite(Date.parse(e.at)),
        )
      );
    });
  } catch {
    return false;
  }
}
