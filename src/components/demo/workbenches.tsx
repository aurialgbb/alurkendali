"use client";
import { useLocale } from "@/lib/locale";
import { useState, type FormEvent } from "react";
import {
  checklist,
  type ScenarioState,
  type ScenarioAction,
} from "@/lib/demo-scenarios";
export const rupiah = (n: number) => `Rp${n.toLocaleString("id-ID")}`;
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
  return (
    <form onSubmit={submit} className="workbench-finance">
      <div className="document-pair">
        <section className="business-document">
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
            <div className="document-total">
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
          <p>{tr("Dokumen simulasi, bukan nota transaksi nyata.")}</p>
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
          <div className="receipt-item receipt-total">
            <span>{"Total"}</span>
            <strong>{"Rp350.000"}</strong>
          </div>
          <div className="receipt-match">
            <span>{"✓"}</span>
            {tr(" Sama dengan nilai pengajuan")}
          </div>
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
              <span aria-hidden="true">{"→"}</span>
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
                : "Tindakan Anda akan tercatat pada riwayat dokumen.",
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
            {tr(inv.source)}
            <small>{tr("rim")}</small>
          </strong>
          <p>{tr("Saldo tersedia")}</p>
        </section>
        <div className={`stock-transit ${inv.transit ? "is-moving" : ""}`}>
          <span aria-hidden="true">{"→"}</span>
          <strong>
            {tr(inv.transit)}
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
            {tr(inv.destination)}
            <small>{tr("rim")}</small>
          </strong>
          <p>{tr("Saldo tersedia")}</p>
        </section>
      </div>
      <div className="stock-conservation">
        <span>{tr("Kertas A4 · SKU-KRT-001")}</span>
        <strong>
          {"Total "}
          {tr(inv.source + inv.transit + inv.destination)}
          {tr(" rim di seluruh lokasi")}
        </strong>
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
            <span aria-hidden="true">{"→"}</span>
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
  const [invoice, setInvoice] = useState(String(s.procurement.invoice));
  const p = s.procurement;
  const received = ["received", "matched", "paid"].includes(p.status);
  const matched = ["matched", "paid"].includes(p.status);
  const configuredInvoice =
    p.status === "received" ? Number(invoice) : p.invoice;
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
          <strong>{tr(rupiah(configuredInvoice))}</strong>
          <span className={`document-status ${matched ? "is-ok" : ""}`}>
            {tr(
              matched
                ? "✓ Tagihan cocok"
                : p.mismatch
                  ? "Selisih perlu diperiksa"
                  : "Belum dicocokkan",
            )}
          </span>
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
                    ? { type: "match", invoice: Number(invoice) }
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
            <label className="demo-field">
              {tr("Pilih tagihan contoh")}
              <select
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              >
                <option value="3200000">
                  {tr("Rp3.200.000 · Sesuai pesanan")}
                </option>
                <option value="3500000">
                  {tr("Rp3.500.000 · Coba tagihan berselisih")}
                </option>
              </select>
              <small>
                {tr(
                  "Selisih Rp300.000 akan menahan pembayaran sampai tagihan dikoreksi.",
                )}
              </small>
            </label>
          )}
          <button className="demo-primary" type="submit">
            {tr(
              p.status === "draft"
                ? "Setujui pesanan Rp3.200.000"
                : p.status === "ordered"
                  ? "Catat penerimaan barang"
                  : p.status === "received"
                    ? "Cocokkan tiga dokumen"
                    : "Catat pembayaran simulasi",
            )}
            <span aria-hidden="true">{"→"}</span>
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
          {checklist.map((label, index) => (
            <label
              className={s.operations.checks[index] ? "is-checked" : ""}
              key={label}
            >
              <input
                type="checkbox"
                checked={s.operations.checks[index]}
                disabled={!enabled || s.operations.completed}
                onChange={(e) =>
                  act({ type: "check", index, checked: e.target.checked })
                }
              />
              <span>{tr(label)}</span>
            </label>
          ))}
        </div>
        {enabled && !s.operations.completed && (
          <>
            <button
              className="demo-primary"
              onClick={() => act({ type: "finish" })}
              disabled={done !== 4}
            >
              {tr("Simpan laporan pembukaan")}
              <span aria-hidden="true">{"→"}</span>
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
              "✓ Seluruh pemeriksaan selesai. Pelaksana dan waktu tersimpan di riwayat.",
            )}
          </p>
        )}
      </section>
    </div>
  );
}
