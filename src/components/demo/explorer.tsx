"use client";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo-store";
import { scenarios, type ScenarioId } from "@/lib/demo-scenarios";
import { rupiah } from "./workbenches";
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
        <h2 id={label}>{title}</h2>
        <button
          className="demo-secondary"
          onClick={() => ref.current?.close()}
          aria-label="Tutup detail"
        >
          Tutup
        </button>
      </div>
      {children}
    </dialog>
  );
}
export default function Explorer({ id }: { id: ScenarioId }) {
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
      `${e.code} ${e.title}`.toLowerCase().includes(query.toLowerCase()),
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
        Memuat data eksplorasi…
      </p>
    );
  return (
    <div className="explorer-view">
      <Link className="explorer-return" href={`/demo/${id}?mode=guided`}>
        Ikuti panduan {scenarios[id].label} →
      </Link>
      <header className="report-heading">
        <div>
          <p className="demo-eyebrow">
            Mode eksplorasi · {scenarios[id].label}
          </p>
          <h1>
            {id === "finance"
              ? "Pengajuan & persetujuan biaya"
              : id === "inventory"
                ? "Persediaan & pergerakan aset"
                : id === "procurement"
                  ? "Pesanan & dokumen pengadaan"
                  : "Pekerjaan harian cabang"}
          </h1>
          <p>
            Telusuri data contoh, buka dokumen, dan coba tindakan sesuai peran
            Anda.
          </p>
        </div>
        {id === "finance" && (
          <button className="demo-primary" onClick={() => setNewForm(true)}>
            Buat pengajuan contoh
          </button>
        )}
      </header>
      {d.notice && (
        <p role="status" className="demo-storage-notice">
          {d.notice}
        </p>
      )}
      {d.error && (
        <p role="alert" className="explorer-error">
          {d.error}
        </p>
      )}
      <div className="report-filters">
        <label className="demo-field">
          Status
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Semua status</option>
            {Array.from(new Set(records.map((e) => e.status))).map((status) => (
              <option key={status} value={status}>
                {statuses[status]}
              </option>
            ))}
          </select>
        </label>
        <label className="demo-field report-search">
          Cari dokumen
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Nomor atau judul dokumen"
          />
        </label>
      </div>
      <div className="report-count">
        <span>{filtered.length} dokumen contoh</span>
        <button
          className="demo-text-button"
          onClick={() => {
            setFilter("all");
            setQuery("");
          }}
        >
          Tampilkan semua
        </button>
      </div>
      {id === "operations" ? (
        <div className="explorer-operations">
          {d.operations
            .filter((e) => filtered.some((f) => f.id === e.id))
            .map((task) => (
              <section key={task.id}>
                <span className="explorer-code">
                  {task.code} · {task.branch}
                </span>
                <h2>{task.title}</h2>
                <p>
                  {task.assignedTo} · {task.shift}
                </p>
                <span className="explorer-status">
                  {statuses[task.status]} ·{" "}
                  {task.checkItems.filter((e) => e.checked).length}/
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
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
                {task.supervisorNotes && <p>{task.supervisorNotes}</p>}
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
                {record.title}
                <small>
                  {"branch" in record
                    ? record.branch
                    : "origin" in record
                      ? record.origin
                      : ""}
                </small>
              </span>
              <span className="explorer-record-amount">
                {"amount" in record
                  ? rupiah(record.amount)
                  : "totalAmount" in record
                    ? rupiah(record.totalAmount)
                    : "itemsSummary" in record
                      ? record.type === "adjustment"
                        ? "Penyesuaian"
                        : "Pergerakan barang"
                      : ""}
              </span>
              <span className="explorer-status">{statuses[record.status]}</span>
              <span className="explorer-open">Buka →</span>
            </button>
          ))}
        </div>
      )}
      {!filtered.length && (
        <div className="report-empty">
          <h2>Tidak ada dokumen yang cocok.</h2>
          <p>Ubah pencarian atau tampilkan semua status.</p>
        </div>
      )}
      <footer className="explorer-footer">
        <p>Semua nama, lampiran, dan pembayaran di sini adalah data contoh.</p>
        <button className="demo-text-button" onClick={() => setResetting(true)}>
          Reset data eksplorasi
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
              <h3>{expense.title}</h3>
              <div className="explorer-detail-total">
                {rupiah(expense.amount)}
              </div>
              <dl className="document-fields">
                <div>
                  <dt>Pemohon</dt>
                  <dd>{expense.submitter}</dd>
                </div>
                <div>
                  <dt>Cabang</dt>
                  <dd>{expense.branch}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statuses[expense.status]}</dd>
                </div>
              </dl>
              <div className="explorer-evidence">
                <strong>Referensi lampiran contoh</strong>
                <p>{expense.receiptName}</p>
                <span>
                  Representasi dokumen untuk simulasi. Tidak ada nota asli atau
                  berkas pribadi yang diunggah.
                </span>
              </div>
              <p className="explorer-notes">{expense.notes}</p>
              {expense.managerApproval && (
                <p className="explorer-approval">
                  Disetujui: {expense.managerApproval.approvedBy}
                  <br />
                  {expense.managerApproval.approvedAt}
                </p>
              )}
              {expense.financeVerification && (
                <p className="explorer-approval">
                  Pembayaran simulasi: {expense.financeVerification.refNo}
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
                        Alasan penolakan
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          required
                          maxLength={500}
                        />
                      </label>
                      <button className="demo-primary" type="submit">
                        Simpan penolakan
                      </button>
                      <button
                        className="demo-text-button"
                        type="button"
                        onClick={() => setRejecting(false)}
                      >
                        Batal
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
                        {expense.status === "pending_manager"
                          ? "Setujui pengajuan"
                          : "Catat pembayaran simulasi"}
                      </button>
                      <button
                        className="demo-text-button"
                        onClick={() => setRejecting(true)}
                      >
                        Tolak dengan alasan
                      </button>
                    </>
                  )}
                </div>
              ) : expense.status.startsWith("pending") ? (
                <p className="explorer-role-hint">
                  Pilih peran{" "}
                  {expense.status === "pending_manager" ? "Manager" : "Finance"}{" "}
                  di atas halaman untuk memproses dokumen ini.
                </p>
              ) : null}
            </>
          )}
          {id === "inventory" && inventory && (
            <>
              <h3>{inventory.title}</h3>
              <dl className="document-fields">
                <div>
                  <dt>Asal</dt>
                  <dd>{inventory.origin}</dd>
                </div>
                <div>
                  <dt>Tujuan</dt>
                  <dd>{inventory.destination ?? "Lokasi yang sama"}</dd>
                </div>
                <div>
                  <dt>Penanggung jawab</dt>
                  <dd>{inventory.responsiblePerson}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>{statuses[inventory.status]}</dd>
                </div>
              </dl>
              <p>{inventory.itemsSummary}</p>
              <div className="explorer-evidence">
                <strong>Dokumen contoh</strong>
                <p>{inventory.documentName}</p>
                <span>{inventory.notes}</span>
              </div>
              {inventory.status === "pending_approval" &&
                (d.roleInfo.canApproveFinance ? (
                  <button
                    className="demo-primary"
                    onClick={() => d.approveAdjustment(inventory.id)}
                  >
                    Setujui penyesuaian stok
                  </button>
                ) : (
                  <p className="explorer-role-hint">
                    Pilih peran Manager atau Finance untuk menyetujui
                    penyesuaian.
                  </p>
                ))}
              {inventory.type === "transfer" && (
                <Link
                  className="demo-text-link"
                  href="/demo/inventory?mode=guided"
                >
                  Coba alur kirim dan terima barang →
                </Link>
              )}
            </>
          )}
          {id === "procurement" && po && (
            <>
              <h3>{po.title}</h3>
              <p className="explorer-notes">
                {po.vendor} · {po.branch}
              </p>
              <div className="explorer-match">
                <div>
                  <span>Pesanan</span>
                  <strong>{rupiah(po.threeWayMatch.poAmount)}</strong>
                </div>
                <div>
                  <span>Penerimaan</span>
                  <strong>
                    {po.threeWayMatch.goodsQtyMatched
                      ? "Jumlah cocok"
                      : "Belum diterima"}
                  </strong>
                </div>
                <div>
                  <span>Tagihan</span>
                  <strong>
                    {po.threeWayMatch.invoiceAmount
                      ? rupiah(po.threeWayMatch.invoiceAmount)
                      : "Belum diterbitkan"}
                  </strong>
                </div>
              </div>
              <p className="explorer-status">{statuses[po.status]}</p>
              {po.status === "3way_matched" &&
                (d.roleInfo.canVerifyAudit ? (
                  <button
                    className="demo-primary"
                    onClick={() => d.payProcurementPO(po.id)}
                  >
                    Catat pembayaran simulasi
                  </button>
                ) : (
                  <p className="explorer-role-hint">
                    Pilih peran Finance untuk mencatat pembayaran setelah
                    dokumen cocok.
                  </p>
                ))}
              {["pr_draft", "pr_approved"].includes(po.status) &&
                d.roleInfo.canApproveProcurement && (
                  <button
                    className="demo-primary"
                    onClick={() => d.approveProcurementPR(po.id)}
                  >
                    Setujui pesanan
                  </button>
                )}
              {po.status === "po_issued" && (
                <Link
                  className="demo-text-link"
                  href="/demo/procurement?mode=guided"
                >
                  Coba penerimaan dan pencocokan dokumen →
                </Link>
              )}
            </>
          )}
          {d.error && (
            <p role="alert" className="explorer-error">
              {d.error}
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
              Kebutuhan cabang
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                maxLength={160}
                autoFocus
              />
            </label>
            <label className="demo-field">
              Nominal (rupiah)
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
              Catatan
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={500}
                rows={3}
              />
            </label>
            <div className="explorer-evidence">
              <strong>Lampiran contoh disertakan</strong>
              <p>nota_contoh.pdf · Tidak perlu mengunggah data pribadi.</p>
            </div>
            <button className="demo-primary" type="submit">
              Kirim pengajuan contoh
            </button>
          </form>
        </RecordDialog>
      )}
      {resetting && (
        <RecordDialog
          title="Reset data eksplorasi?"
          onClose={() => setResetting(false)}
        >
          <p>
            Seluruh perubahan pada mode eksplorasi kembali ke data awal.
            Progress empat panduan tidak ikut direset.
          </p>
          <div className="explorer-detail-actions">
            <button
              className="demo-secondary"
              onClick={() => setResetting(false)}
            >
              Batal
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
              Ya, reset eksplorasi
            </button>
          </div>
        </RecordDialog>
      )}
    </div>
  );
}
