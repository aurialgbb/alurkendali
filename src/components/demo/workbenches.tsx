"use client";
import { useLocale } from "@/lib/locale";
import { useState, type FormEvent } from "react";
import { AnimatePresence, m } from "motion/react";
import { ease } from "@/components/motion";
import {
  checklist,
  roleLabels,
  type ScenarioState,
  type ScenarioAction,
} from "@/lib/demo-scenarios";
export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;

/** A number that slides in when it changes, so a moving balance is noticed. */
function Count({ value }: { value: number }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <m.span
        key={value}
        className="count-value"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.35, ease }}
      >
        {value}
      </m.span>
    </AnimatePresence>
  );
}
type Props = {
  s: ScenarioState;
  enabled: boolean;
  act: (a: ScenarioAction) => void;
};
export function FinanceWorkbench({ s, enabled, act }: Props) {
  const { t: tr } = useLocale();
  const [note, setNote] = useState(s.finance.note);
  const [reject, setReject] = useState(false);
  const [reason, setReason] = useState("");
  const status = s.finance.status;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (reject) act({ type: "reject", reason });
    else if (status === "draft") act({ type: "submit", note });
    else if (status === "submitted") act({ type: "approve" });
    else act({ type: "verify" });
  }
  const comparing = status === "approved";
  return (
    <form onSubmit={submit} className="workbench-finance">
      <div className="document-pair">
        <section className="business-document">
          {/* The decision lands on the document itself, the way a stamp would. */}
          <AnimatePresence>
            {["approved", "paid", "rejected"].includes(status) && (
              <m.span
                key={status === "rejected" ? "rejected" : "approved"}
                className={`doc-stamp ${status === "rejected" ? "is-rejected" : ""}`}
                initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={{ duration: 0.4, ease }}
                aria-hidden="true"
              >
                {tr(status === "rejected" ? "Ditolak" : "Disetujui Manager")}
              </m.span>
            )}
          </AnimatePresence>
          <div className="document-topline">
            <span>{"EXP-DEMO-001"}</span>
            <span>{tr("Pengajuan biaya")}</span>
          </div>
          <h2>
            {tr("Perlengkapan")}
            <br />
            {tr("Cabang Kemang")}
          </h2>
          <p className="document-description">
            {tr("Kertas dan alat tulis untuk kegiatan operasional cabang.")}
          </p>
          <dl className="document-fields">
            <div>
              <dt>{tr("Pemohon")}</dt>
              <dd>{tr("Rian · Staf cabang")}</dd>
            </div>
            <div>
              <dt>{tr("Kategori")}</dt>
              <dd>{tr("Operasional toko")}</dd>
            </div>
            <div>
              <dt>{tr("Cabang")}</dt>
              <dd>{"Kemang"}</dd>
            </div>
            <div
              className={`document-total ${comparing ? "is-comparing" : ""}`}
            >
              <dt>{tr("Total pengajuan")}</dt>
              <dd>{tr(rupiah(350000))}</dd>
            </div>
          </dl>
          {status === "draft" ? (
            <label className="demo-field">
              {tr("Catatan pengajuan ")}
              <span>{tr("(opsional)")}</span>
              <textarea
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                disabled={!enabled}
                placeholder={tr("Contoh: untuk kebutuhan kasir minggu ini")}
                rows={2}
              />
            </label>
          ) : (
            <div className="document-note">
              <span>{tr("Catatan pengajuan")}</span>
              <p>
                {s.finance.note ||
                  tr("Perlengkapan untuk kegiatan operasional cabang.")}
              </p>
            </div>
          )}
          {status === "paid" && (
            <div className="document-verified">
              {tr("✓ Pembayaran simulasi tercatat")}
              <span>
                {tr("Referensi ")}
                {s.finance.reference}
              </span>
            </div>
          )}
        </section>
        <aside className="receipt-paper" aria-label={tr("Nota belanja contoh")}>
          <span className="receipt-label">{tr("Lampiran · Nota contoh")}</span>
          <h3>{tr("Toko Perlengkapan")}</h3>
          <div className="receipt-rule" />
          <div className="receipt-item">
            <span>
              {tr("Kertas A4")}
              <br />
              <small>{tr("5 rim × Rp50.000")}</small>
            </span>
            <strong>{"Rp250.000"}</strong>
          </div>
          <div className="receipt-item">
            <span>
              {tr("Alat tulis")}
              <br />
              <small>{tr("2 paket × Rp50.000")}</small>
            </span>
            <strong>{"Rp100.000"}</strong>
          </div>
          <div className="receipt-rule" />
          <div
            className={`receipt-item receipt-total ${comparing ? "is-comparing" : ""}`}
          >
            <span>{"Total"}</span>
            <strong>{"Rp350.000"}</strong>
          </div>
          {/* Matching is Finance's job, so the receipt only says "cocok" once Finance has checked it. */}
          {status === "paid" ? (
            <m.div
              className="receipt-match"
              initial={{ opacity: 0, scale: 1.3, rotate: -6 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              {tr("✓ Cocok dengan pengajuan Rp350.000")}
            </m.div>
          ) : (
            <div className="receipt-match is-pending">
              {tr(
                comparing
                  ? "Bandingkan dengan total pengajuan"
                  : "Belum dicocokkan",
              )}
            </div>
          )}
          <div className="receipt-end">
            {tr("Bukti dan pengajuan")}
            <br />
            {tr("tersimpan bersama.")}
          </div>
        </aside>
      </div>
      {enabled && status !== "paid" && status !== "rejected" && (
        <div className="workbench-actions">
          {reject && (
            <label className="demo-field rejection-field">
              {tr("Alasan penolakan")}
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                maxLength={500}
                rows={2}
              />
            </label>
          )}
          <div className="action-row">
            <button className="demo-primary" type="submit">
              {tr(
                reject
                  ? "Simpan penolakan"
                  : status === "draft"
                    ? "Kirim pengajuan Rp350.000"
                    : status === "submitted"
                      ? "Setujui pengajuan"
                      : "Verifikasi & catat pembayaran",
              )}
            </button>
            {status === "submitted" && (
              <button
                className="demo-text-button"
                type="button"
                onClick={() => setReject(!reject)}
              >
                {tr(reject ? "Batal menolak" : "Tolak dengan alasan")}
              </button>
            )}
          </div>
          <p>
            {tr(
              status === "approved"
                ? "Pembayaran ini simulasi. Tidak ada uang yang ditransfer."
                : "Tindakan ini langsung masuk ke jejak pekerjaan.",
            )}
          </p>
        </div>
      )}
    </form>
  );
}
export function InventoryWorkbench({ s, enabled, act }: Props) {
  const { t: tr } = useLocale();
  const [quantity, setQuantity] = useState(String(s.inventory.quantity));
  const inv = s.inventory;
  return (
    <div className="workbench-inventory">
      <div className="stock-route">
        <section className="stock-location">
          <span>{tr("Lokasi asal")}</span>
          <div className="warehouse-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <h2>{tr("Gudang Pusat")}</h2>
          <strong>
            <Count value={inv.source} />
            <small>{tr("rim")}</small>
          </strong>
          <p>{tr("Saldo tersedia")}</p>
        </section>
        <div className={`stock-transit ${inv.transit ? "is-moving" : ""}`}>
          {/* The parcel sits where the goods are: warehouse, on the road, or at the branch. */}
          <span className="transit-track" aria-hidden="true">
            <m.i
              className="transit-parcel"
              initial={false}
              animate={{
                left:
                  inv.status === "draft"
                    ? "0%"
                    : inv.status === "sent"
                      ? "50%"
                      : "100%",
                opacity: inv.status === "draft" ? 0.35 : 1,
              }}
              transition={{ duration: 0.9, ease }}
            />
          </span>
          <strong>
            <Count value={inv.transit} />
            {tr(" rim")}
          </strong>
          <p>
            {tr(
              inv.status === "received" ? "Sudah diterima" : "Dalam perjalanan",
            )}
          </p>
        </div>
        <section className="stock-location stock-destination">
          <span>{tr("Lokasi tujuan")}</span>
          <div className="branch-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <h2>{tr("Cabang Kemang")}</h2>
          <strong>
            <Count value={inv.destination} />
            <small>{tr("rim")}</small>
          </strong>
          <p>{tr("Saldo tersedia")}</p>
        </section>
      </div>
      <div className="stock-conservation">
        <span>{tr("Kertas A4 · SKU-KRT-001")}</span>
        {/* Flashes on every move to show the total never changes, only the location. */}
        <m.strong
          key={inv.status}
          initial={{ backgroundColor: "#fbeee0" }}
          animate={{ backgroundColor: "#fbeee000" }}
          transition={{ duration: 1.4 }}
        >
          {"Total "}
          {tr(inv.source + inv.transit + inv.destination)}
          {tr(" rim di seluruh lokasi")}
        </m.strong>
      </div>
      <form
        className="transfer-document"
        onSubmit={(e) => {
          e.preventDefault();
          act(
            inv.status === "draft"
              ? { type: "dispatch", quantity: Number(quantity) }
              : { type: "receive" },
          );
        }}
      >
        <div className="document-topline">
          <span>{"MOV-DEMO-001"}</span>
          <span>{tr("Surat jalan contoh")}</span>
        </div>
        <div className="transfer-details">
          <div>
            <h3>{tr("Kirim perlengkapan ke cabang")}</h3>
            <p>
              {tr(
                "Saldo berpindah saat barang dikirim dan diterima. Tidak ada barang yang ditambahkan.",
              )}
            </p>
          </div>
          <label className="demo-field">
            {tr("Jumlah kertas (rim)")}
            <input
              type="number"
              min={1}
              max={100}
              step={1}
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={!enabled || inv.status !== "draft"}
            />
          </label>
        </div>
        {enabled && inv.status !== "received" && (
          <button className="demo-primary" type="submit">
            {tr(
              inv.status === "draft"
                ? "Kirim dari Gudang Pusat"
                : `Konfirmasi terima ${inv.quantity} rim`,
            )}
          </button>
        )}
        {inv.status === "received" && (
          <p className="document-verified">
            {"✓ "}
            {tr(inv.quantity)}
            {tr(" rim diterima dan saldo cabang diperbarui.")}
          </p>
        )}
      </form>
    </div>
  );
}
export function ProcurementWorkbench({ s, enabled, act }: Props) {
  const { t: tr } = useLocale();
  const [quantity, setQuantity] = useState("2");
  const p = s.procurement;
  const received = ["received", "matched", "paid"].includes(p.status);
  const matched = ["matched", "paid"].includes(p.status);
  // The supplier's first invoice is Rp300.000 too high. Matching it is not optional:
  // the visitor sees payment held before the corrected invoice arrives.
  const FIRST_INVOICE = 3500000;
  const shownInvoice =
    p.status === "received"
      ? p.mismatch
        ? p.invoice
        : FIRST_INVOICE
      : p.invoice;
  return (
    <div className="workbench-procurement">
      <div className="procurement-context">
        <span>{tr("Pengadaan untuk Cabang Kemang")}</span>
        <h2>{tr("2 barcode scanner wireless")}</h2>
        <p>{tr("Supplier contoh · PT Teknologi Niaga")}</p>
      </div>
      <div className="match-documents">
        <section className="match-document">
          <span className="document-index">{tr("01 / Pesanan")}</span>
          <h3>{"Purchase order"}</h3>
          <span className="document-reference">{"PO-DEMO-001"}</span>
          <dl>
            <div>
              <dt>{tr("Jumlah")}</dt>
              <dd>{tr("2 unit")}</dd>
            </div>
            <div>
              <dt>{tr("Harga satuan")}</dt>
              <dd>{"Rp1.600.000"}</dd>
            </div>
          </dl>
          <strong>{"Rp3.200.000"}</strong>
          <span
            className={`document-status ${p.status !== "draft" ? "is-ok" : ""}`}
          >
            {tr(
              p.status === "draft"
                ? "Menunggu persetujuan"
                : "✓ Pesanan disetujui",
            )}
          </span>
        </section>
        <section className="match-document">
          <span className="document-index">{tr("02 / Penerimaan")}</span>
          <h3>{tr("Barang diterima")}</h3>
          <span className="document-reference">{"GR-DEMO-001"}</span>
          <dl>
            <div>
              <dt>{tr("Tujuan")}</dt>
              <dd>{"Kemang"}</dd>
            </div>
            <div>
              <dt>{tr("Kondisi contoh")}</dt>
              <dd>{tr(received ? "Baik" : "Belum diperiksa")}</dd>
            </div>
          </dl>
          <strong>
            {tr(p.received)}
            {" unit"}
          </strong>
          <span className={`document-status ${received ? "is-ok" : ""}`}>
            {tr(received ? "✓ Jumlah sesuai pesanan" : "Belum dicatat")}
          </span>
        </section>
        <section
          className={`match-document ${p.mismatch ? "has-mismatch" : ""}`}
        >
          <span className="document-index">{tr("03 / Tagihan")}</span>
          <h3>{tr("Invoice supplier")}</h3>
          <span className="document-reference">{"INV-DEMO-001"}</span>
          <dl>
            <div>
              <dt>{tr("Jumlah")}</dt>
              <dd>{tr("2 unit")}</dd>
            </div>
            <div>
              <dt>{tr("Pembanding")}</dt>
              <dd>{"PO-DEMO-001"}</dd>
            </div>
          </dl>
          <strong>
            {received ? tr(rupiah(shownInvoice)) : tr("Belum masuk")}
          </strong>
          <span className={`document-status ${matched ? "is-ok" : ""}`}>
            {tr(
              matched
                ? "✓ Tagihan cocok"
                : p.mismatch
                  ? "Selisih Rp300.000 dari PO"
                  : received
                    ? "Belum dicocokkan"
                    : "Menunggu barang diterima",
            )}
          </span>
          <AnimatePresence>
            {p.mismatch && p.status === "received" && (
              <m.span
                key="held"
                className="doc-stamp is-held"
                initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease }}
                aria-hidden="true"
              >
                {tr("Pembayaran ditahan")}
              </m.span>
            )}
            {matched && (
              <m.span
                key="matched"
                className="doc-stamp"
                initial={{ opacity: 0, scale: 1.4, rotate: -14 }}
                animate={{ opacity: 1, scale: 1, rotate: -8 }}
                transition={{ duration: 0.4, ease }}
                aria-hidden="true"
              >
                {tr("Cocok")}
              </m.span>
            )}
          </AnimatePresence>
        </section>
      </div>
      {p.status === "paid" && (
        <div className="document-verified">
          {tr("✓ Pembayaran simulasi Rp3.200.000 tercatat")}
          <span>{tr("Referensi SIM-PO-001")}</span>
        </div>
      )}
      {enabled && p.status !== "paid" && (
        <form
          className="procurement-action"
          onSubmit={(e) => {
            e.preventDefault();
            act(
              p.status === "draft"
                ? { type: "order" }
                : p.status === "ordered"
                  ? { type: "goods", quantity: Number(quantity) }
                  : p.status === "received"
                    ? {
                        type: "match",
                        invoice: p.mismatch ? 3200000 : FIRST_INVOICE,
                      }
                    : { type: "pay" },
            );
          }}
        >
          {p.status === "ordered" && (
            <label className="demo-field">
              {tr("Jumlah scanner yang diterima")}
              <input
                type="number"
                min={1}
                max={2}
                step={1}
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
              />
              <small>
                {tr(
                  "PO memuat 2 unit. Periksa jumlah sebelum mencatat penerimaan.",
                )}
              </small>
            </label>
          )}
          {p.status === "received" && (
            <p className="procurement-invoice-note">
              {tr(
                p.mismatch
                  ? "Supplier sudah mengirim tagihan koreksi sebesar Rp3.200.000."
                  : "Tagihan supplier masuk: Rp3.500.000. Cocokkan dulu dengan PO dan penerimaan barang.",
              )}
            </p>
          )}
          <button className="demo-primary" type="submit">
            {tr(
              p.status === "draft"
                ? "Setujui pesanan Rp3.200.000"
                : p.status === "ordered"
                  ? "Catat penerimaan barang"
                  : p.status === "received"
                    ? p.mismatch
                      ? "Cocokkan tagihan koreksi Rp3.200.000"
                      : "Cocokkan tiga dokumen"
                    : "Catat pembayaran simulasi",
            )}
          </button>
          {p.status === "matched" && (
            <p>
              {tr(
                "Tiga dokumen cocok. Tindakan ini hanya mencatat pembayaran contoh.",
              )}
            </p>
          )}
        </form>
      )}
    </div>
  );
}
export function OperationsWorkbench({ s, enabled, act }: Props) {
  const { t: tr } = useLocale();
  const done = s.operations.checks.filter(Boolean).length;
  return (
    <div className="workbench-operations">
      <div className="branch-summary">
        <span>{tr("Cabang Kemang")}</span>
        <h2>
          {tr("Siap membuka")}
          <br />
          {tr("hari yang baru.")}
        </h2>
        <p>{tr("Shift pagi · Penanggung jawab Rian")}</p>
        <div className="operations-count">
          <strong>{tr(done)}</strong>
          <span>
            {"/ 4"}
            <br />
            {tr("pemeriksaan selesai")}
          </span>
        </div>
        <progress
          aria-label={tr("Kemajuan pemeriksaan cabang")}
          value={done}
          max={4}
        />
        <span className="branch-readiness">
          {tr(
            s.operations.completed
              ? "✓ Laporan tersimpan"
              : done === 4
                ? "Siap menyimpan laporan"
                : `${4 - done} pemeriksaan tersisa`,
          )}
        </span>
      </div>
      <section className="checklist-paper">
        <div className="document-topline">
          <span>{"OPS-DEMO-001"}</span>
          <span>{tr("Checklist pembukaan")}</span>
        </div>
        <h3>{tr("Periksa sebelum pelanggan datang")}</h3>
        <div className="operations-checks">
          {checklist.map((label, index) => {
            const checked = s.operations.checks[index];
            // Who ticked it and when, straight from the event log: the evidence the
            // next shift or the owner would otherwise have to ask for.
            const stamp = checked
              ? s.events.findLast((e) => e.action === `Selesai: ${label}.`)
              : undefined;
            return (
              <label className={checked ? "is-checked" : ""} key={label}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!enabled || s.operations.completed}
                  onChange={(e) =>
                    act({ type: "check", index, checked: e.target.checked })
                  }
                />
                <span>{tr(label)}</span>
                <AnimatePresence>
                  {stamp && (
                    <m.small
                      className="check-meta"
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3, ease }}
                    >
                      {tr(roleLabels[stamp.actor])}
                      {" · "}
                      {new Date(stamp.at).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </m.small>
                  )}
                </AnimatePresence>
              </label>
            );
          })}
        </div>
        {enabled && !s.operations.completed && (
          <>
            <button
              className="demo-primary"
              onClick={() => act({ type: "finish" })}
              disabled={done !== 4}
            >
              {tr("Simpan laporan pembukaan")}
            </button>
            {done !== 4 && (
              <p className="checklist-hint">
                {tr("Lengkapi ")}
                {tr(4 - done)}
                {tr(" pemeriksaan lagi untuk menyimpan laporan.")}
              </p>
            )}
          </>
        )}
        {s.operations.completed && (
          <p className="document-verified">
            {tr(
              "✓ Laporan tersimpan bersama pelaksana dan jam setiap pemeriksaan.",
            )}
          </p>
        )}
      </section>
    </div>
  );
}
