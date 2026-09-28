import type { ReactNode } from "react";

export default function SolutionIllustration({
  category,
  title,
  note,
}: {
  category: string;
  title: string;
  note: string;
}) {
  const views: Record<string, ReactNode> = {
    finance: (
      <div className="finance-match">
        <div className="sample-document">
          <span className="visual-eyebrow">BUKTI PEMBAYARAN</span>
          <strong>INV / 024</strong>
          <div className="receipt-lines">
            <i />
            <i />
            <i />
          </div>
          <span>Total tagihan</span>
          <b>Rp2.450.000</b>
        </div>
        <div className="matching-detail">
          <span className="visual-eyebrow">PENCOCOKAN</span>
          <h4>
            Satu transaksi,
            <br />
            bukti lengkap.
          </h4>
          <ul>
            <li>✓ Nominal sesuai</li>
            <li>✓ Bukti terlampir</li>
            <li>✓ Persetujuan tercatat</li>
          </ul>
          <span className="visual-success">Siap direkonsiliasi</span>
        </div>
      </div>
    ),
    inventory: (
      <div className="asset-map">
        <div className="asset-summary">
          <span className="asset-symbol" aria-hidden="true">
            ▣
          </span>
          <div>
            <span className="visual-eyebrow">AST / 018</span>
            <h4>Laptop operasional</h4>
          </div>
          <span className="visual-success">Diterima</span>
        </div>
        <div className="asset-route">
          <div>
            <span className="location-pin" aria-hidden="true">
              A
            </span>
            <strong>Gudang pusat</strong>
            <span>Lokasi asal</span>
          </div>
          <span className="route-arrow" aria-hidden="true">
            →
          </span>
          <div>
            <span className="location-pin destination" aria-hidden="true">
              B
            </span>
            <strong>Cabang Bandung</strong>
            <span>Lokasi saat ini</span>
          </div>
        </div>
        <div className="asset-owner">
          <span className="owner-avatar" aria-hidden="true">
            DS
          </span>
          <div>
            <span>Penanggung jawab</span>
            <strong>Dina S. · Operasional</strong>
          </div>
          <span>
            Serah terima
            <br />
            <b>Tercatat</b>
          </span>
        </div>
      </div>
    ),
    procurement: (
      <div className="purchase-chain">
        <span className="visual-eyebrow">
          PEMBELIAN PERLENGKAPAN · PR / 031
        </span>
        <h4>Setiap dokumen saling terhubung.</h4>
        <div className="purchase-documents">
          {[
            ["01", "Pengajuan", "Kebutuhan disetujui"],
            ["02", "Pesanan", "PO diterbitkan"],
            ["03", "Tagihan", "Menunggu invoice"],
          ].map(([number, label, status]) => (
            <div className="purchase-document" key={number}>
              <span>{number}</span>
              <strong>{label}</strong>
              <small>{status}</small>
            </div>
          ))}
        </div>
        <div className="budget-row">
          <span>
            Anggaran tersedia <b>Rp8.000.000</b>
          </span>
          <span>
            Nilai pesanan <b>Rp3.200.000</b>
          </span>
        </div>
        <div
          className="budget-track"
          aria-label="Pesanan menggunakan 40 persen anggaran"
        >
          <span />
        </div>
        <p className="visual-caption">
          40% anggaran terpakai untuk pesanan ini
        </p>
      </div>
    ),
    operations: (
      <div className="operations-board">
        <div className="board-heading">
          <h4>
            Pekerjaan berpindah,
            <br />
            konteksnya ikut.
          </h4>
          <span>3 tugas contoh</span>
        </div>
        <div className="board-columns">
          {[
            ["Antrean", "Cek permintaan", "Tim admin", "1"],
            ["Dikerjakan", "Siapkan barang", "Tim gudang", "1"],
            ["Selesai", "Konfirmasi terima", "Tim cabang", "1"],
          ].map(([label, task, owner, count], index) => (
            <div className={`board-column board-column-${index}`} key={label}>
              <div className="board-label">
                {label}
                <span>{count}</span>
              </div>
              <div className="task-slip">
                <span className="visual-eyebrow">OPS / 0{index + 1}</span>
                <strong>{task}</strong>
                <span>{owner}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="board-handoff">
          Setiap tugas punya status dan penanggung jawab.
        </p>
      </div>
    ),
    reporting: (
      <div className="report-overview">
        <div className="report-heading">
          <div>
            <span className="visual-eyebrow">RINGKASAN PENGELUARAN</span>
            <h4>Rp24.000.000</h4>
          </div>
          <span>
            September
            <br />
            Data ilustrasi
          </span>
        </div>
        <div className="report-bars">
          {[
            ["Operasional", "12", "100%"],
            ["Pembelian", "8", "66.67%"],
            ["Lainnya", "4", "33.33%"],
          ].map(([label, value, width]) => (
            <div className="report-bar-row" key={label}>
              <span>{label}</span>
              <div>
                <i style={{ width }} />
              </div>
              <strong>Rp{value} jt</strong>
            </div>
          ))}
        </div>
        <div className="report-source">
          <span className="visual-eyebrow">DARI ANGKA KE TRANSAKSI</span>
          <strong>Operasional → 12 transaksi</strong>
          <span>Rincian dan bukti tersimpan bersama laporan.</span>
        </div>
      </div>
    ),
  };
  return (
    <div
      className={`mini-ui solution-visual visual-${category}`}
      data-illustration={category}
    >
      <div className="mini-top">
        <span>{title}</span>
        <span className="illustration-label">Ilustrasi · contoh data</span>
      </div>
      <div className="category-scene">{views[category]}</div>
      <div className="category-note">
        <span aria-hidden="true">✓</span>
        <p>{note}</p>
      </div>
    </div>
  );
}
