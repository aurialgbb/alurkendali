import {
  DEMO_ROLES,
  INITIAL_EXPENSES,
  INITIAL_INVENTORY,
  INITIAL_PROCUREMENT,
  INITIAL_OPERATIONS,
  INITIAL_AUDIT_LOGS,
  type RoleType,
  type ExpenseItem,
} from "./demo-data";
export type NewExpense = {
  title: string;
  category: ExpenseItem["category"];
  amount: number;
  receiptName: string;
  notes: string;
};
export function initialExplorer() {
  return structuredClone({
    // Free mode opens as the owner, so no document is locked on first look.
    currentRole: "director" as RoleType,
    expenses: INITIAL_EXPENSES,
    inventory: INITIAL_INVENTORY,
    procurement: INITIAL_PROCUREMENT,
    operations: INITIAL_OPERATIONS,
    auditLogs: INITIAL_AUDIT_LOGS,
    error: "",
  });
}
export type ExplorerState = ReturnType<typeof initialExplorer>;
export type ExplorerAction =
  | { type: "role"; role: RoleType }
  | { type: "reset" }
  | { type: "load"; value: ExplorerState }
  | { type: "add"; data: NewExpense; uid: string; at: string }
  | {
      type: "approve" | "verify" | "reject" | "adjust" | "order" | "pay";
      id: string;
      note?: string;
      ref?: string;
      uid: string;
      at: string;
    }
  | { type: "check"; id: string; index: number; uid: string; at: string };
export function explorerReducer(
  previous: ExplorerState,
  action: ExplorerAction,
): ExplorerState {
  if (action.type === "reset") return initialExplorer();
  if (action.type === "load") return action.value;
  if (action.type === "role")
    return { ...previous, currentRole: action.role, error: "" };
  const s = structuredClone(previous);
  s.error = "";
  const user = DEMO_ROLES[s.currentRole];
  const fail = (message: string) => ({ ...previous, error: message });
  const audit = (
    module: ExplorerState["auditLogs"][number]["module"],
    code: string,
    label: string,
    details: string,
  ) =>
    s.auditLogs.unshift({
      id: action.uid,
      timestamp: action.at,
      module,
      docCode: code,
      action: label,
      user: user.name,
      role: user.roleTitle,
      details,
    });
  if (action.type === "add") {
    if (
      !action.data.title.trim() ||
      !Number.isSafeInteger(action.data.amount) ||
      action.data.amount <= 0 ||
      !action.data.receiptName.trim()
    )
      return fail("Lengkapi judul, nominal positif, dan nama bukti contoh.");
    const code = `EXP-DEMO-${action.uid.slice(0, 8).toUpperCase()}`;
    s.expenses.unshift({
      ...action.data,
      title: action.data.title.trim(),
      id: action.uid,
      code,
      submitter: user.name,
      branch: user.branch,
      date: action.at,
      status: "pending_manager",
      receiptSize: "Contoh",
      notes: action.data.notes.trim(),
    });
    audit(
      "finance",
      code,
      "Pengajuan dibuat",
      `Pengajuan simulasi Rp${action.data.amount.toLocaleString("id-ID")} dibuat bersama referensi bukti contoh.`,
    );
    return s;
  }
  if (["approve", "verify", "reject"].includes(action.type)) {
    if (
      action.type !== "approve" &&
      action.type !== "verify" &&
      action.type !== "reject"
    )
      return s;
    const item = s.expenses.find((e) => e.id === action.id);
    if (!item) return fail("Pengajuan tidak ditemukan.");
    if (action.type === "approve") {
      if (
        !(["manager", "director"] as RoleType[]).includes(s.currentRole) ||
        item.status !== "pending_manager"
      )
        return fail(
          "Persetujuan ini dilakukan Manager atau Direktur, dan hanya untuk dokumen yang menunggu Manager.",
        );
      item.status = "pending_finance";
      item.managerApproval = {
        approvedBy: user.name,
        approvedAt: action.at,
        notes: action.note || "Disetujui untuk kebutuhan cabang.",
      };
      audit(
        "finance",
        item.code,
        "Manager menyetujui",
        `Pengajuan ${item.code} disetujui dan diteruskan ke Finance.`,
      );
    } else if (action.type === "verify") {
      if (
        !user.canVerifyAudit ||
        item.status !== "pending_finance" ||
        !item.managerApproval ||
        !item.receiptName
      )
        return fail(
          "Verifikasi dilakukan Finance atau Direktur, setelah Manager menyetujui dan bukti terlampir.",
        );
      item.status = "verified_paid";
      item.financeVerification = {
        verifiedBy: user.name,
        verifiedAt: action.at,
        refNo: action.ref || `SIM-${action.uid.slice(0, 8)}`,
        notes: action.note || "Pembayaran simulasi dicatat.",
      };
      audit(
        "finance",
        item.code,
        "Pembayaran simulasi dicatat",
        `Finance mencatat pembayaran contoh ${item.code} sebesar Rp${item.amount.toLocaleString("id-ID")}.`,
      );
    } else {
      if (
        !["pending_manager", "pending_finance"].includes(item.status) ||
        !action.note?.trim() ||
        !(item.status === "pending_manager"
          ? ["manager", "director"].includes(s.currentRole)
          : user.canVerifyAudit)
      )
        return fail(
          "Penolakan butuh alasan, dan hanya bisa dilakukan pemeriksa pada dokumen yang masih menunggu.",
        );
      item.status = "rejected";
      item.notes += ` Alasan penolakan: ${action.note.trim()}`;
      audit("finance", item.code, "Pengajuan ditolak", action.note.trim());
    }
    return s;
  }
  if (action.type === "adjust") {
    const item = s.inventory.find((e) => e.id === action.id);
    if (
      !item ||
      item.type !== "adjustment" ||
      item.status !== "pending_approval" ||
      !user.canApproveFinance
    )
      return fail(
        "Penyesuaian stok membutuhkan otorisasi Manager/Finance dan status menunggu.",
      );
    item.status = "completed";
    item.notes += ` Disetujui ${user.name}.`;
    audit(
      "inventory",
      item.code,
      "Penyesuaian disetujui",
      `Penyesuaian contoh ${item.code} disetujui oleh ${user.name}.`,
    );
    return s;
  }
  if (action.type === "order" || action.type === "pay") {
    const item = s.procurement.find((e) => e.id === action.id);
    if (!item) return fail("Pesanan tidak ditemukan.");
    if (action.type === "order") {
      if (
        !user.canApproveProcurement ||
        !["pr_draft", "pr_approved"].includes(item.status)
      )
        return fail(
          "Pesanan belum dapat disetujui oleh peran ini atau sudah diterbitkan.",
        );
      item.status = "po_issued";
      item.threeWayMatch.poMatched = true;
      audit(
        "procurement",
        item.poNumber,
        "Pesanan disetujui",
        `PO contoh ${item.poNumber} diterbitkan.`,
      );
    } else {
      const m = item.threeWayMatch;
      if (
        !user.canVerifyAudit ||
        item.status !== "3way_matched" ||
        !m.isFullyMatched ||
        !m.goodsQtyMatched ||
        !m.invoiceMatched ||
        !m.poMatched ||
        m.invoiceAmount !== m.poAmount ||
        m.poAmount !== item.totalAmount
      )
        return fail(
          "Pembayaran membutuhkan Finance/Direktur dan tiga dokumen yang cocok.",
        );
      item.status = "paid";
      audit(
        "procurement",
        item.poNumber,
        "Pembayaran simulasi dicatat",
        `Pembayaran contoh ${item.poNumber} sebesar Rp${item.totalAmount.toLocaleString("id-ID")} dicatat.`,
      );
    }
    return s;
  }
  if (action.type === "check") {
    const task = s.operations.find((e) => e.id === action.id);
    if (
      !task ||
      !Number.isInteger(action.index) ||
      !task.checkItems[action.index]
    )
      return fail("Item checklist tidak ditemukan.");
    const item = task.checkItems[action.index];
    item.checked = !item.checked;
    task.status = task.checkItems.every((e) => e.checked)
      ? "completed"
      : "in_progress";
    task.supervisorNotes = `${user.name} memperbarui checklist pada ${action.at}.`;
    audit(
      "operations",
      task.code,
      task.status === "completed"
        ? "Checklist lengkap"
        : "Checklist diperbarui",
      `${item.checked ? "Selesai" : "Dibuka kembali"}: ${item.label}. Pelaksana ${user.name}.`,
    );
  }
  return s;
}
export function parseExplorer(value: unknown): ExplorerState | null {
  if (!value || typeof value !== "object") return null;
  const s = value as ExplorerState;
  try {
    if (!Object.hasOwn(DEMO_ROLES, s.currentRole)) return null;
    const strings = (v: unknown, keys: string[]) =>
      !!v &&
      typeof v === "object" &&
      keys.every((k) => typeof (v as Record<string, unknown>)[k] === "string");
    if (
      !Array.isArray(s.expenses) ||
      !s.expenses.every(
        (e) =>
          strings(e, [
            "id",
            "code",
            "title",
            "category",
            "submitter",
            "branch",
            "date",
            "receiptName",
            "receiptSize",
            "notes",
          ]) &&
          Number.isFinite(e.amount) &&
          e.amount > 0 &&
          [
            "pending_manager",
            "pending_finance",
            "verified_paid",
            "rejected",
          ].includes(e.status),
      )
    )
      return null;
    if (
      !Array.isArray(s.inventory) ||
      !s.inventory.every(
        (e) =>
          strings(e, [
            "id",
            "code",
            "title",
            "origin",
            "responsiblePerson",
            "date",
            "itemsSummary",
            "documentName",
            "notes",
          ]) &&
          ["transfer", "asset", "adjustment"].includes(e.type) &&
          ["completed", "in_transit", "pending_approval", "flagged"].includes(
            e.status,
          ),
      )
    )
      return null;
    if (
      !Array.isArray(s.procurement) ||
      !s.procurement.every(
        (e) =>
          strings(e, [
            "id",
            "code",
            "poNumber",
            "title",
            "vendor",
            "requestedBy",
            "branch",
            "date",
            "notes",
          ]) &&
          Number.isFinite(e.totalAmount) &&
          [
            "pr_draft",
            "pr_approved",
            "po_issued",
            "goods_received",
            "3way_matched",
            "paid",
          ].includes(e.status) &&
          strings(e.threeWayMatch, ["receivingSlipNo", "invoiceNo"]) &&
          Number.isFinite(e.threeWayMatch.poAmount) &&
          Number.isFinite(e.threeWayMatch.invoiceAmount) &&
          [
            e.threeWayMatch.poMatched,
            e.threeWayMatch.goodsQtyMatched,
            e.threeWayMatch.invoiceMatched,
            e.threeWayMatch.isFullyMatched,
          ].every((v) => typeof v === "boolean"),
      )
    )
      return null;
    if (
      !Array.isArray(s.operations) ||
      !s.operations.every(
        (e) =>
          strings(e, [
            "id",
            "code",
            "title",
            "branch",
            "assignedTo",
            "date",
            "shift",
          ]) &&
          ["completed", "in_progress", "flagged"].includes(e.status) &&
          Array.isArray(e.checkItems) &&
          e.checkItems.every(
            (i) => strings(i, ["label"]) && typeof i.checked === "boolean",
          ),
      )
    )
      return null;
    if (
      !Array.isArray(s.auditLogs) ||
      !s.auditLogs.every((e) =>
        strings(e, [
          "id",
          "timestamp",
          "module",
          "action",
          "user",
          "role",
          "docCode",
          "details",
        ]),
      )
    )
      return null;
    return { ...s, error: "" };
  } catch {
    return null;
  }
}
