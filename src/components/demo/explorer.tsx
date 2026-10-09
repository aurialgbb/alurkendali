"use client";
import { useLocale } from "@/lib/locale";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo-store";
import { scenarios, type ScenarioId } from "@/lib/demo-scenarios";
import { rupiah } from "./workbenches";
import { translateSample } from "@/lib/demo-copy";
import LanguageSwitch from "@/components/language-switch";
const statuses: Record<string, string> = {
  pending_manager: "Menunggu Manager",
  pending_finance: "Menunggu Finance",
  verified_paid: "Pembayaran contoh tercatat",
  rejected: "Ditolak",
  completed: "Selesai",
  in_transit: "Dalam perjalanan",
  pending_approval: "Menunggu persetujuan",
  flagged: "Perlu diperiksa",
  pr_draft: "Draf permintaan",
  pr_approved: "Permintaan disetujui",
  po_issued: "PO diterbitkan",
  goods_received: "Barang diterima",
  "3way_matched": "Tiga dokumen cocok",
  paid: "Pembayaran contoh tercatat",
  in_progress: "Sedang dikerjakan",
};
function RecordDialog({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const { t: tr } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const label = useId();
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return (
    <dialog
      ref={ref}
      className="record-dialog"
      aria-labelledby={label}
      onClose={onClose}
    >
      <div className="record-dialog-heading">
        <h2 id={label}>{tr(title)}</h2>
        <LanguageSwitch />
        <button
          className="demo-secondary"
          onClick={() => ref.current?.close()}
          aria-label={tr("Tutup detail")}
        >
          {tr("Tutup")}
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function Explorer({ id }: { id: ScenarioId }) {
  const { t: tr, locale } = useLocale();
  const sample = (recordId: string, text: string) =>
    translateSample(locale, recordId, text);
  const d = useDemo();
  const [selected, setSelected] = useState<string | null>(null);
  const [newForm, setNewForm] = useState(false);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("");
  const [rejecting, setRejecting] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("350000");
  const [note, setNote] = useState("");
  const [resetting, setResetting] = useState(false);
  const expense = d.expenses.find((e) => e.id === selected);
  const rejection =
    expense &&
    d.auditLogs.find(
      (e) => e.docCode === expense.code && e.action === "Pengajuan ditolak",
    );
  const rejectionSuffix = rejection
    ? ` Alasan penolakan: ${rejection.details}`
    : "";
  const expenseNotes = expense
    ? locale === "en" && rejection && expense.notes.endsWith(rejectionSuffix)
      ? `${sample(expense.id, expense.notes.slice(0, -rejectionSuffix.length))} Rejection reason: ${rejection.details}`
      : sample(expense.id, expense.notes)
    : "";
  const inventory = d.inventory.find((e) => e.id === selected);
  const po = d.procurement.find((e) => e.id === selected);
  const records =
    id === "finance"
      ? d.expenses
      : id === "inventory"
        ? d.inventory
        : id === "procurement"
          ? d.procurement
          : d.operations;
  const filtered = records.filter(
    (e) =>
      (filter === "all" || e.status === filter) &&
      `${e.code} ${e.title} ${sample(e.id, e.title)}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const close = () => {
    setSelected(null);
    setRejecting(false);
    setReason("");
  };
  const canApprove =
    d.currentRole === "manager" || d.currentRole === "director";
  if (!d.isLoaded)
    return (
      <p role="status" className="demo-loading">
        {tr("Memuat data eksplorasi…")}
      </p>
    );
  return (
    <div className="explorer-view">
      <Link className="explorer-return" href={`/demo/${id}?mode=guided`}>
        {tr("Kembali ke panduan ")}
        {tr(scenarios[id].label)}
      </Link>
      <header className="report-heading">
        <div>
          <p className="demo-eyebrow">
            {tr("Mode bebas · ")}
            {tr(scenarios[id].label)}
          </p>
          <h1>
            {tr(
              id === "finance"
                ? "Pengajuan & persetujuan biaya"
                : id === "inventory"
                  ? "Persediaan & pergerakan aset"
                  : id === "procurement"
                    ? "Pesanan & dokumen pengadaan"
                    : "Pekerjaan harian cabang",
            )}
          </h1>
          <p>
            {tr(
              "Buka dokumen contoh dan coba tindakannya. Ganti peran di atas untuk melihat apa yang bisa dilakukan tiap orang.",
            )}
          </p>
        </div>
        {id === "finance" && (
          <button className="demo-primary" onClick={() => setNewForm(true)}>
            {tr("Buat pengajuan contoh")}
          </button>
        )}
      </header>
      {d.notice && (
        <p role="status" className="demo-storage-notice">
          {tr(d.notice)}
        </p>
      )}
      {d.error && (
        <p role="alert" className="explorer-error">
          {tr(d.error)}
        </p>
      )}
      <div className="report-filters">
        <label className="demo-field">
          {"Status"}
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">{tr("Semua status")}</option>
            {Array.from(new Set(records.map((e) => e.status))).map((status) => (
              <option key={status} value={status}>
                {tr(statuses[status])}
              </option>
            ))}
          </select>
        </label>
        <label className="demo-field report-search">
          {tr("Cari dokumen")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("Nomor atau judul dokumen")}
          />
        </label>
      </div>
      <div className="report-count">
        <span>
          {filtered.length}
          {tr(" dokumen contoh")}
        </span>
        <button
          className="demo-text-button"
          onClick={() => {
            setFilter("all");
            setQuery("");
          }}
        >
          {tr("Tampilkan semua")}
        </button>
      </div>
      {id === "operations" ? (
        <div className="explorer-operations">
          {d.operations
            .filter((e) => filtered.some((f) => f.id === e.id))
            .map((task) => (
              <section key={task.id}>
                <span className="explorer-code">
                  {task.code}
                  {" · "}
                  {tr(task.branch)}
                </span>
                <h2>{sample(task.id, task.title)}</h2>
                <p>
                  {tr(task.assignedTo)}
                  {" · "}
                  {tr(task.shift)}
                </p>
                <span className="explorer-status">
                  {tr(statuses[task.status])}
                  {" ·"} {tr(task.checkItems.filter((e) => e.checked).length)}
                  {"/"}
                  {task.checkItems.length}
                </span>
                <div className="operations-checks">
                  {task.checkItems.map((item, index) => (
                    <label key={item.label}>
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => d.toggleOperationItem(task.id, index)}
                      />
                      <span>{tr(item.label)}</span>
                    </label>
                  ))}
                </div>
                {task.supervisorNotes && <p>{tr(task.supervisorNotes)}</p>}
              </section>
            ))}
        </div>
      ) : (
        <div className="explorer-records">
          {filtered.map((record) => (
            <button
              key={record.id}
              className="explorer-record"
              onClick={() => setSelected(record.id)}
            >
              <span className="explorer-code">{record.code}</span>
              <span className="explorer-record-title">
                {sample(record.id, record.title)}
                <small>
                  {tr(
                    "branch" in record
                      ? record.branch
                      : "origin" in record
                        ? record.origin
                        : "",
                  )}
                </small>
              </span>
              <span className="explorer-record-amount">
                {tr(
                  "amount" in record
                    ? rupiah(record.amount)
                    : "totalAmount" in record
                      ? rupiah(record.totalAmount)
                      : "itemsSummary" in record
                        ? record.type === "adjustment"
                          ? "Penyesuaian"
                          : "Pergerakan barang"
                        : "",
                )}
              </span>
              <span className="explorer-status">
                {tr(statuses[record.status])}
              </span>
              <span className="explorer-open">{tr("Buka →")}</span>
            </button>
          ))}
        </div>
      )}
      {!filtered.length && (
        <div className="report-empty">
          <h2>{tr("Tidak ada dokumen yang cocok.")}</h2>
          <p>{tr("Ubah pencarian atau tampilkan semua status.")}</p>
        </div>
      )}
      <footer className="explorer-footer">
        <p>{tr("Perubahan Anda di mode bebas tersimpan di browser ini.")}</p>
        <button className="demo-text-button" onClick={() => setResetting(true)}>
          {tr("Kembalikan data awal")}
        </button>
      </footer>
      {selected && (
        <RecordDialog
          title={
            id === "finance"
              ? (expense?.code ?? "Dokumen")
              : id === "inventory"
                ? (inventory?.code ?? "Dokumen")
                : (po?.poNumber ?? "Dokumen")
          }
          onClose={close}
        >
          {id === "finance" && expense && (
            <>
              <h3>{sample(expense.id, expense.title)}</h3>
              <div className="explorer-detail-total">
                {tr(rupiah(expense.amount))}
              </div>
              <dl className="document-fields">
                <div>
                  <dt>{tr("Pemohon")}</dt>
                  <dd>{expense.submitter}</dd>
                </div>
                <div>
                  <dt>{tr("Cabang")}</dt>
                  <dd>{tr(expense.branch)}</dd>
                </div>
                <div>
                  <dt>{"Status"}</dt>
                  <dd>{tr(statuses[expense.status])}</dd>
                </div>
              </dl>
              <div className="explorer-evidence">
                <strong>{tr("Referensi lampiran contoh")}</strong>
                <p>{expense.receiptName}</p>
                <span>
                  {tr(
                    "Hanya nama berkas contoh. Tidak ada nota asli yang diunggah.",
                  )}
                </span>
              </div>
              <p className="explorer-notes">{expenseNotes}</p>
              {expense.managerApproval && (
                <p className="explorer-approval">
                  {tr("Disetujui: ")}
                  {expense.managerApproval.approvedBy}
                  <br />
                  {tr(expense.managerApproval.approvedAt)}
                </p>
              )}
              {expense.financeVerification && (
                <p className="explorer-approval">
                  {tr("Pembayaran simulasi: ")}
                  {expense.financeVerification.refNo}
                  <br />
                  {expense.financeVerification.verifiedBy}
                </p>
              )}
              {(expense.status === "pending_manager" && canApprove) ||
              (expense.status === "pending_finance" &&
                d.roleInfo.canVerifyAudit) ? (
                <div className="explorer-detail-actions">
                  {rejecting ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        d.rejectExpense(expense.id, reason);
                        setRejecting(false);
                      }}
                    >
                      <label className="demo-field">
                        {tr("Alasan penolakan")}
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          maxLength={500}
                        />
                      </label>
                      <button className="demo-primary" type="submit">
                        {tr("Simpan penolakan")}
                      </button>
                      <button
                        className="demo-text-button"
                        type="button"
                        onClick={() => setRejecting(false)}
                      >
                        {tr("Batal")}
                      </button>
                    </form>
                  ) : (
                    <>
                      <button
                        className="demo-primary"
                        onClick={() =>
                          expense.status === "pending_manager"
                            ? d.approveExpenseManager(expense.id, "")
                            : d.verifyExpenseFinance(
                                expense.id,
                                `SIM-${expense.code}`,
                                "",
                              )
                        }
                      >
                        {tr(
                          expense.status === "pending_manager"
                            ? "Setujui pengajuan"
                            : "Catat pembayaran simulasi",
                        )}
                      </button>
                      <button
                        className="demo-text-button"
                        onClick={() => setRejecting(true)}
                      >
                        {tr("Tolak dengan alasan")}
                      </button>
                    </>
                  )}
                </div>
              ) : expense.status.startsWith("pending") ? (
                <p className="explorer-role-hint">
                  {tr(
                    expense.status === "pending_manager"
                      ? "Dokumen ini menunggu Manager. Ganti peran di atas untuk memprosesnya."
                      : "Dokumen ini menunggu Finance. Ganti peran di atas untuk memprosesnya.",
                  )}
                </p>
              ) : null}
            </>
          )}
          {id === "inventory" && inventory && (
            <>
              <h3>{sample(inventory.id, inventory.title)}</h3>
              <dl className="document-fields">
                <div>
                  <dt>{tr("Asal")}</dt>
                  <dd>{tr(inventory.origin)}</dd>
                </div>
                <div>
                  <dt>{tr("Tujuan")}</dt>
                  <dd>{tr(inventory.destination ?? "Lokasi yang sama")}</dd>
                </div>
                <div>
                  <dt>{tr("Penanggung jawab")}</dt>
                  <dd>{tr(inventory.responsiblePerson)}</dd>
                </div>
                <div>
                  <dt>{"Status"}</dt>
                  <dd>{tr(statuses[inventory.status])}</dd>
                </div>
              </dl>
              <p>{tr(inventory.itemsSummary)}</p>
              <div className="explorer-evidence">
                <strong>{tr("Dokumen contoh")}</strong>
                <p>{tr(inventory.documentName)}</p>
                <span>{sample(inventory.id, inventory.notes)}</span>
              </div>
              {inventory.status === "pending_approval" &&
                (d.roleInfo.canApproveFinance ? (
                  <button
                    className="demo-primary"
                    onClick={() => d.approveAdjustment(inventory.id)}
                  >
                    {tr("Setujui penyesuaian stok")}
                  </button>
                ) : (
                  <p className="explorer-role-hint">
                    {tr(
                      "Penyesuaian stok disetujui oleh Manager atau Finance. Ganti peran di atas untuk memprosesnya.",
                    )}
                  </p>
                ))}
              {inventory.type === "transfer" && (
                <Link
                  className="demo-text-link"
                  href="/demo/inventory?mode=guided"
                >
                  {tr("Coba alur kirim dan terima barang →")}
                </Link>
              )}
            </>
          )}
          {id === "procurement" && po && (
            <>
              <h3>{sample(po.id, po.title)}</h3>
              <p className="explorer-notes">
                {tr(po.vendor)}
                {" · "}
                {tr(po.branch)}
              </p>
              <div className="explorer-match">
                <div>
                  <span>{tr("Pesanan")}</span>
                  <strong>{tr(rupiah(po.threeWayMatch.poAmount))}</strong>
                </div>
                <div>
                  <span>{tr("Penerimaan")}</span>
                  <strong>
                    {tr(
                      po.threeWayMatch.goodsQtyMatched
                        ? "Jumlah cocok"
                        : "Belum diterima",
                    )}
                  </strong>
                </div>
                <div>
                  <span>{tr("Tagihan")}</span>
                  <strong>
                    {tr(
                      po.threeWayMatch.invoiceAmount
                        ? rupiah(po.threeWayMatch.invoiceAmount)
                        : "Belum diterbitkan",
                    )}
                  </strong>
                </div>
              </div>
              <p className="explorer-status">{tr(statuses[po.status])}</p>
              {po.status === "3way_matched" &&
                (d.roleInfo.canVerifyAudit ? (
                  <button
                    className="demo-primary"
                    onClick={() => d.payProcurementPO(po.id)}
                  >
                    {tr("Catat pembayaran simulasi")}
                  </button>
                ) : (
                  <p className="explorer-role-hint">
                    {tr(
                      "Pembayaran dicatat oleh Finance setelah dokumen cocok. Ganti peran di atas untuk memprosesnya.",
                    )}
                  </p>
                ))}
              {["pr_draft", "pr_approved"].includes(po.status) &&
                d.roleInfo.canApproveProcurement && (
                  <button
                    className="demo-primary"
                    onClick={() => d.approveProcurementPR(po.id)}
                  >
                    {tr("Setujui pesanan")}
                  </button>
                )}
              {po.status === "po_issued" && (
                <Link
                  className="demo-text-link"
                  href="/demo/procurement?mode=guided"
                >
                  {tr("Coba penerimaan dan pencocokan dokumen →")}
                </Link>
              )}
            </>
          )}
          {d.error && (
            <p role="alert" className="explorer-error">
              {tr(d.error)}
            </p>
          )}
        </RecordDialog>
      )}
      {newForm && (
        <RecordDialog
          title="Buat pengajuan contoh"
          onClose={() => setNewForm(false)}
        >
          <form
            className="explorer-new-form"
            onSubmit={(e) => {
              e.preventDefault();
              if (
                !title.trim() ||
                !Number.isSafeInteger(Number(amount)) ||
                Number(amount) <= 0
              )
                return;
              d.addExpense({
                title,
                category: "Operasional Toko",
                amount: Number(amount),
                receiptName: "nota_contoh.pdf",
                notes: note,
              });
              setNewForm(false);
              setTitle("");
              setNote("");
              setQuery("");
              setFilter("all");
            }}
          >
            <label className="demo-field">
              {tr("Kebutuhan cabang")}
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
                autoFocus
              />
            </label>
            <label className="demo-field">
              {tr("Nominal (rupiah)")}
              <input
                type="number"
                min={1}
                step={1}
                max={1000000000}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </label>
            <label className="demo-field">
              {tr("Catatan")}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </label>
            <div className="explorer-evidence">
              <strong>{tr("Lampiran contoh disertakan")}</strong>
              <p>
                {tr("nota_contoh.pdf · Tidak perlu mengunggah data pribadi.")}
              </p>
            </div>
            <button className="demo-primary" type="submit">
              {tr("Kirim pengajuan contoh")}
            </button>
          </form>
        </RecordDialog>
      )}
      {resetting && (
        <RecordDialog
          title="Kembalikan data awal?"
          onClose={() => setResetting(false)}
        >
          <p>
            {tr(
              "Semua perubahan di mode bebas akan dihapus. Progress di empat panduan tetap aman.",
            )}
          </p>
          <div className="explorer-detail-actions">
            <button
              className="demo-secondary"
              onClick={() => setResetting(false)}
            >
              {tr("Batal")}
            </button>
            <button
              className="demo-primary"
              onClick={() => {
                d.resetDemoData();
                setResetting(false);
                setQuery("");
                setFilter("all");
              }}
            >
              {tr("Ya, reset eksplorasi")}
            </button>
          </div>
        </RecordDialog>
      )}
    </div>
  );
}
