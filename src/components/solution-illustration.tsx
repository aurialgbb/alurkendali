"use client";
import { useLocale } from "@/lib/locale";
import type { ReactNode } from "react";
import { m } from "motion/react";
import { ease } from "@/components/motion";

// Each category moves the way its work moves: receipts get matched, stock travels
// between locations, documents link up, tasks hand over, and totals build from rows.
// The scene remounts per tab, so it replays when a visitor switches category.
const appear = (delay: number, y = 10) => ({
  initial: { opacity: 0, y },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease },
});

export default function SolutionIllustration({
  category,
  title,
  note,
}: {
  category: string;
  title: string;
  note: string;
}) {
  const { t: tr } = useLocale();
  const views: Record<string, ReactNode> = {
    finance: (
      <div className="finance-match">
        <m.div
          className="sample-document"
          initial={{ opacity: 0, x: -24, rotate: -8 }}
          animate={{ opacity: 1, x: 0, rotate: -3 }}
          transition={{ duration: 0.6, ease }}
        >
          <span className="visual-eyebrow">{tr("BUKTI PEMBAYARAN")}</span>
          <strong>{"INV / 024"}</strong>
          <div className="receipt-lines">
            <i />
            <i />
            <i />
          </div>
          <span>{tr("Total tagihan")}</span>
          <b>{"Rp2.450.000"}</b>
        </m.div>
        <div className="matching-detail">
          <span className="visual-eyebrow">{tr("PENCOCOKAN")}</span>
          <h4>
            {tr("Satu transaksi,")}
            <br />
            {tr("bukti lengkap.")}
          </h4>
          <ul>
            {["Nominal sesuai", "Bukti terlampir", "Persetujuan tercatat"].map(
              (item, index) => (
                <m.li key={item} {...appear(0.45 + index * 0.25, 0)}>
                  <span aria-hidden="true">{"✓ "}</span>
                  {tr(item)}
                </m.li>
              ),
            )}
          </ul>
          <m.span
            className="visual-success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 1.3, ease }}
          >
            {tr("Siap direkonsiliasi")}
          </m.span>
        </div>
      </div>
    ),
    inventory: (
      <div className="asset-map">
        <div className="asset-summary">
          <span className="asset-symbol" aria-hidden="true">
            {"▣"}
          </span>
          <div>
            <span className="visual-eyebrow">{"AST / 018"}</span>
            <h4>{tr("Laptop operasional")}</h4>
          </div>
          <m.span
            className="visual-success"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35, delay: 1.5, ease }}
          >
            {tr("Diterima")}
          </m.span>
        </div>
        <div className="asset-route">
          <div>
            <span className="location-pin" aria-hidden="true">
              {"A"}
            </span>
            <strong>{tr("Gudang pusat")}</strong>
            <span>{tr("Lokasi asal")}</span>
          </div>
          <span className="route-arrow" aria-hidden="true">
            <m.i
              className="route-parcel"
              initial={{ left: "0%" }}
              animate={{ left: "100%" }}
              transition={{ duration: 1.1, delay: 0.35, ease: "easeInOut" }}
            />
          </span>
          <div>
            <m.span
              className="location-pin destination"
              aria-hidden="true"
              initial={{ backgroundColor: "#ffffff", color: "#24664f" }}
              animate={{ backgroundColor: "#24664f", color: "#ffffff" }}
              transition={{ duration: 0.3, delay: 1.4 }}
            >
              {"B"}
            </m.span>
            <strong>{tr("Cabang Bandung")}</strong>
            <span>{tr("Lokasi saat ini")}</span>
          </div>
        </div>
        <m.div className="asset-owner" {...appear(1.6)}>
          <span className="owner-avatar" aria-hidden="true">
            {"DS"}
          </span>
          <div>
            <span>{tr("Penanggung jawab")}</span>
            <strong>{tr("Dina S. · Operasional")}</strong>
          </div>
          <span>
            {tr("Serah terima")}
            <br />
            <b>{tr("Tercatat")}</b>
          </span>
        </m.div>
      </div>
    ),
    procurement: (
      <div className="purchase-chain">
        <span className="visual-eyebrow">
          {tr("PEMBELIAN PERLENGKAPAN · PR / 031")}
        </span>
        <h4>{tr("Setiap dokumen saling terhubung.")}</h4>
        <div className="purchase-documents">
          {[
            ["01", "Pengajuan", "Kebutuhan disetujui"],
            ["02", "Pesanan", "PO diterbitkan"],
            ["03", "Tagihan", "Menunggu invoice"],
          ].map(([number, label, status], index) => (
            <m.div
              className="purchase-document"
              key={number}
              {...appear(0.2 + index * 0.3, 14)}
            >
              <span>{tr(number)}</span>
              <strong>{tr(label)}</strong>
              <small>{tr(status)}</small>
            </m.div>
          ))}
        </div>
        <div className="budget-row">
          <span>
            {tr("Anggaran tersedia ")}
            <b>{"Rp8.000.000"}</b>
          </span>
          <span>
            {tr("Nilai pesanan ")}
            <b>{"Rp3.200.000"}</b>
          </span>
        </div>
        <div
          className="budget-track"
          aria-label={tr("Pesanan menggunakan 40 persen anggaran")}
        >
          <m.span
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 1.2, ease }}
          />
        </div>
        <p className="visual-caption">
          {tr("40% anggaran terpakai untuk pesanan ini")}
        </p>
      </div>
    ),
    operations: (
      <div className="operations-board">
        <div className="board-heading">
          <h4>
            {tr("Pekerjaan berpindah,")}
            <br />
            {tr("konteksnya ikut.")}
          </h4>
          <span>{tr("3 tugas contoh")}</span>
        </div>
        <div className="board-columns">
          {[
            ["Antrean", "Cek permintaan", "Tim admin", "1"],
            ["Dikerjakan", "Siapkan barang", "Tim gudang", "1"],
            ["Selesai", "Konfirmasi terima", "Tim cabang", "1"],
          ].map(([label, task, owner, count], index) => (
            <div className={`board-column board-column-${index}`} key={label}>
              <div className="board-label">
                {tr(label)}
                <span>{tr(count)}</span>
              </div>
              <m.div
                className="task-slip"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 + index * 0.4, ease }}
              >
                <span className="visual-eyebrow">
                  {"OPS / 0"}
                  {index + 1}
                </span>
                <strong>{tr(task)}</strong>
                <span>{tr(owner)}</span>
              </m.div>
            </div>
          ))}
        </div>
        <p className="board-handoff">
          {tr("Setiap tugas punya status dan penanggung jawab.")}
        </p>
      </div>
    ),
    reporting: (
      <div className="report-overview">
        <div className="report-heading">
          <div>
            <span className="visual-eyebrow">
              {tr("RINGKASAN PENGELUARAN")}
            </span>
            <h4>{"Rp24.000.000"}</h4>
          </div>
          <span>
            {"September"}
            <br />
            {tr("Data ilustrasi")}
          </span>
        </div>
        <div className="report-bars">
          {[
            ["Operasional", "12", "100%"],
            ["Pembelian", "8", "66.67%"],
            ["Lainnya", "4", "33.33%"],
          ].map(([label, value, width], index) => (
            <div className="report-bar-row" key={label}>
              <span>{tr(label)}</span>
              <div>
                <m.i
                  initial={{ width: "0%" }}
                  animate={{ width }}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.18, ease }}
                />
              </div>
              <strong>
                {"Rp"}
                {tr(value)}
                {tr(" jt")}
              </strong>
            </div>
          ))}
        </div>
        <m.div className="report-source" {...appear(1)}>
          <span className="visual-eyebrow">
            {tr("DARI ANGKA KE TRANSAKSI")}
          </span>
          <strong>{tr("Operasional → 12 transaksi")}</strong>
          <span>{tr("Rincian dan bukti tersimpan bersama laporan.")}</span>
        </m.div>
      </div>
    ),
  };
  return (
    <div
      className={`mini-ui solution-visual visual-${category}`}
      data-illustration={category}
    >
      <div className="mini-top">
        <span>{tr(title)}</span>
        <span className="illustration-label">
          {tr("Ilustrasi · contoh data")}
        </span>
      </div>
      <div className="category-scene">{views[category]}</div>
      <div className="category-note">
        <span aria-hidden="true">{"✓"}</span>
        <p>{tr(note)}</p>
      </div>
    </div>
  );
}
