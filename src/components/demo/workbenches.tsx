"use client";
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
            <span>EXP-DEMO-001</span>
            <span>Pengajuan biaya</span>
          </div>
          <h2>
            Perlengkapan
            <br />
            Cabang Kemang
          </h2>
          <p className="document-description">
            Kertas dan alat tulis untuk kegiatan operasional cabang.
          </p>
          <dl className="document-fields">
            <div>
              <dt>Pemohon</dt>
              <dd>Rian · Staf cabang</dd>
            </div>
            <div>
              <dt>Kategori</dt>
              <dd>Operasional toko</dd>
            </div>
            <div>
              <dt>Cabang</dt>
              <dd>Kemang</dd>
            </div>
            <div className="document-total">
              <dt>Total pengajuan</dt>
              <dd>{rupiah(350000)}</dd>
            </div>
          </dl>
          {status === "draft" ? (
            <label className="demo-field">
              Catatan pengajuan <span>(opsional)</span>
              <textarea
                value={note}
                maxLength={500}
                onChange={(e) => setNote(e.target.value)}
                disabled={!enabled}
                placeholder="Contoh: untuk kebutuhan kasir minggu ini"
                rows={2}
              />
            </label>
          ) : (
            <div className="document-note">
              <span>Catatan pengajuan</span>
              <p>
                {s.finance.note ||
                  "Perlengkapan untuk kegiatan operasional cabang."}
              </p>
            </div>
          )}
          {status === "paid" && (
            <div className="document-verified">
              ✓ Pembayaran simulasi tercatat
              <span>Referensi {s.finance.reference}</span>
            </div>
          )}
        </section>
        <aside className="receipt-paper" aria-label="Nota belanja contoh">
          <span className="receipt-label">Lampiran · Nota contoh</span>
          <h3>Toko Perlengkapan</h3>
          <p>Dokumen simulasi, bukan nota transaksi nyata.</p>
          <div className="receipt-rule" />
          <div className="receipt-item">
            <span>
              Kertas A4
              <br />
              <small>5 rim × Rp50.000</small>
            </span>
            <strong>Rp250.000</strong>
          </div>
          <div className="receipt-item">
            <span>
              Alat tulis
              <br />
              <small>2 paket × Rp50.000</small>
            </span>
            <strong>Rp100.000</strong>
          </div>
          <div className="receipt-rule" />
          <div className="receipt-item receipt-total">
            <span>Total</span>
            <strong>Rp350.000</strong>
          </div>
          <div className="receipt-match">
            <span>✓</span> Sama dengan nilai pengajuan
          </div>
          <div className="receipt-end">
            Bukti dan pengajuan
            <br />
            tersimpan bersama.
          </div>
        </aside>
      </div>
      {enabled && status !== "paid" && status !== "rejected" && (
        <div className="workbench-actions">
          {reject && (
            <label className="demo-field rejection-field">
              Alasan penolakan
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
              {reject
                ? "Simpan penolakan"
                : status === "draft"
                  ? "Kirim pengajuan Rp350.000"
                  : status === "submitted"
                    ? "Setujui pengajuan"
                    : "Verifikasi & catat pembayaran"}
              <span aria-hidden="true">→</span>
            </button>
            {status === "submitted" && (
              <button
                className="demo-text-button"
                type="button"
                onClick={() => setReject(!reject)}
              >
                {reject ? "Batal menolak" : "Tolak dengan alasan"}
              </button>
            )}
          </div>
          <p>
            {status === "approved"
              ? "Pembayaran ini simulasi. Tidak ada uang yang ditransfer."
              : "Tindakan Anda akan tercatat pada riwayat dokumen."}
          </p>
        </div>
      )}
    </form>
  );
}
export function InventoryWorkbench({ s, enabled, act }: Props) {
  const [quantity, setQuantity] = useState(String(s.inventory.quantity));
  const inv = s.inventory;
  return (
    <div className="workbench-inventory">
      <div className="stock-route">
        <section className="stock-location">
          <span>Lokasi asal</span>
          <div className="warehouse-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <h2>Gudang Pusat</h2>
          <strong>
            {inv.source}
            <small>rim</small>
          </strong>
          <p>Saldo tersedia</p>
        </section>
        <div className={`stock-transit ${inv.transit ? "is-moving" : ""}`}>
          <span aria-hidden="true">→</span>
          <strong>{inv.transit} rim</strong>
          <p>
            {inv.status === "received" ? "Sudah diterima" : "Dalam perjalanan"}
          </p>
        </div>
        <section className="stock-location stock-destination">
          <span>Lokasi tujuan</span>
          <div className="branch-mark" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <h2>Cabang Kemang</h2>
          <strong>
            {inv.destination}
            <small>rim</small>
          </strong>
          <p>Saldo tersedia</p>
        </section>
      </div>
      <div className="stock-conservation">
        <span>Kertas A4 · SKU-KRT-001</span>
        <strong>
          Total {inv.source + inv.transit + inv.destination} rim di seluruh
          lokasi
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
          <span>MOV-DEMO-001</span>
          <span>Surat jalan contoh</span>
        </div>
        <div className="transfer-details">
          <div>
            <h3>Kirim perlengkapan ke cabang</h3>
            <p>
              Saldo berpindah saat barang dikirim dan diterima. Tidak ada barang
              yang ditambahkan.
            </p>
          </div>
          <label className="demo-field">
            Jumlah kertas (rim)
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
            {inv.status === "draft"
              ? "Kirim dari Gudang Pusat"
              : `Konfirmasi terima ${inv.quantity} rim`}
            <span aria-hidden="true">→</span>
          </button>
        )}
        {inv.status === "received" && (
          <p className="document-verified">
            ✓ {inv.quantity} rim diterima dan saldo cabang diperbarui.
          </p>
        )}
      </form>
    </div>
  );
}
export function ProcurementWorkbench({ s, enabled, act }: Props) {
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
        <span>Pengadaan untuk Cabang Kemang</span>
        <h2>2 barcode scanner wireless</h2>
        <p>Supplier contoh · PT Teknologi Niaga</p>
      </div>
      <div className="match-documents">
        <section className="match-document">
          <span className="document-index">01 / Pesanan</span>
          <h3>Purchase order</h3>
          <span className="document-reference">PO-DEMO-001</span>
          <dl>
            <div>
              <dt>Jumlah</dt>
              <dd>2 unit</dd>
            </div>
            <div>
              <dt>Harga satuan</dt>
              <dd>Rp1.600.000</dd>
            </div>
          </dl>
          <strong>Rp3.200.000</strong>
          <span
            className={`document-status ${p.status !== "draft" ? "is-ok" : ""}`}
          >
            {p.status === "draft"
              ? "Menunggu persetujuan"
              : "✓ Pesanan disetujui"}
          </span>
        </section>
        <section className="match-document">
          <span className="document-index">02 / Penerimaan</span>
          <h3>Barang diterima</h3>
          <span className="document-reference">GR-DEMO-001</span>
          <dl>
            <div>
              <dt>Tujuan</dt>
              <dd>Kemang</dd>
            </div>
            <div>
              <dt>Kondisi contoh</dt>
              <dd>{received ? "Baik" : "Belum diperiksa"}</dd>
            </div>
          </dl>
          <strong>{p.received} unit</strong>
          <span className={`document-status ${received ? "is-ok" : ""}`}>
            {received ? "✓ Jumlah sesuai pesanan" : "Belum dicatat"}
          </span>
        </section>
        <section
          className={`match-document ${p.mismatch ? "has-mismatch" : ""}`}
        >
          <span className="document-index">03 / Tagihan</span>
          <h3>Invoice supplier</h3>
          <span className="document-reference">INV-DEMO-001</span>
          <dl>
            <div>
              <dt>Jumlah</dt>
              <dd>2 unit</dd>
            </div>
            <div>
              <dt>Pembanding</dt>
              <dd>PO-DEMO-001</dd>
            </div>
          </dl>
          <strong>{rupiah(configuredInvoice)}</strong>
          <span className={`document-status ${matched ? "is-ok" : ""}`}>
            {matched
              ? "✓ Tagihan cocok"
              : p.mismatch
                ? "Selisih perlu diperiksa"
                : "Belum dicocokkan"}
          </span>
        </section>
      </div>
      {p.status === "paid" && (
        <div className="document-verified">
          ✓ Pembayaran simulasi Rp3.200.000 tercatat
          <span>Referensi SIM-PO-001</span>
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
              Jumlah scanner yang diterima
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
                PO memuat 2 unit. Periksa jumlah sebelum mencatat penerimaan.
              </small>
            </label>
          )}
          {p.status === "received" && (
            <label className="demo-field">
              Pilih tagihan contoh
              <select
                value={invoice}
                onChange={(e) => setInvoice(e.target.value)}
              >
                <option value="3200000">Rp3.200.000 · Sesuai pesanan</option>
                <option value="3500000">
                  Rp3.500.000 · Coba tagihan berselisih
                </option>
              </select>
              <small>
                Selisih Rp300.000 akan menahan pembayaran sampai tagihan
                dikoreksi.
              </small>
            </label>
          )}
          <button className="demo-primary" type="submit">
            {p.status === "draft"
              ? "Setujui pesanan Rp3.200.000"
              : p.status === "ordered"
                ? "Catat penerimaan barang"
                : p.status === "received"
                  ? "Cocokkan tiga dokumen"
                  : "Catat pembayaran simulasi"}
            <span aria-hidden="true">→</span>
          </button>
          {p.status === "matched" && (
            <p>
              Tiga dokumen cocok. Tindakan ini hanya mencatat pembayaran contoh.
            </p>
          )}
        </form>
      )}
    </div>
  );
}
export function OperationsWorkbench({ s, enabled, act }: Props) {
  const done = s.operations.checks.filter(Boolean).length;
  return (
    <div className="workbench-operations">
      <div className="branch-summary">
        <span>Cabang Kemang</span>
        <h2>
          Siap membuka
          <br />
          hari yang baru.
        </h2>
        <p>Shift pagi · Penanggung jawab Rian</p>
        <div className="operations-count">
          <strong>{done}</strong>
          <span>
            / 4<br />
            pemeriksaan selesai
          </span>
        </div>
        <progress
          aria-label="Kemajuan pemeriksaan cabang"
          value={done}
          max={4}
        />
        <span className="branch-readiness">
          {s.operations.completed
            ? "✓ Laporan tersimpan"
            : done === 4
              ? "Siap menyimpan laporan"
              : `${4 - done} pemeriksaan tersisa`}
        </span>
      </div>
      <section className="checklist-paper">
        <div className="document-topline">
          <span>OPS-DEMO-001</span>
          <span>Checklist pembukaan</span>
        </div>
        <h3>Periksa sebelum pelanggan datang</h3>
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
              <span>{label}</span>
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
              Simpan laporan pembukaan<span aria-hidden="true">→</span>
            </button>
            {done !== 4 && (
              <p className="checklist-hint">
                Lengkapi {4 - done} pemeriksaan lagi untuk menyimpan laporan.
              </p>
            )}
          </>
        )}
        {s.operations.completed && (
          <p className="document-verified">
            ✓ Seluruh pemeriksaan selesai. Pelaksana dan waktu tersimpan di
            riwayat.
          </p>
        )}
      </section>
    </div>
  );
}
