"use client";
import Link from "next/link";
import { scenarios, scenarioIds, type ScenarioId } from "@/lib/demo-scenarios";
import { useGuided } from "@/lib/guided-store";
import { isComplete } from "@/lib/demo-scenarios";

export function ProcessPreview({ id }: { id: ScenarioId }) {
  if (id === "finance")
    return (
      <div className="preview-finance" aria-hidden="true">
        <div className="mini-document">
          <span>Pengajuan biaya</span>
          <strong>Rp350.000</strong>
          <div className="mini-lines" />
          <small>Perlengkapan cabang</small>
        </div>
        <div className="mini-receipt">
          <span>Nota contoh</span>
          <div className="mini-lines" />
          <strong>Rp350.000</strong>
          <small>Nominal cocok ✓</small>
        </div>
        <div className="mini-flow">
          <span>Staf</span>
          <i /> <span>Manager</span>
          <i />
          <span>Finance</span>
        </div>
      </div>
    );
  if (id === "inventory")
    return (
      <div className="preview-inventory" aria-hidden="true">
        <div className="mini-location">
          <span>Gudang Pusat</span>
          <div className="mini-boxes">
            <i />
            <i />
            <i />
          </div>
          <strong>
            100 <small>rim</small>
          </strong>
        </div>
        <div className="mini-transfer">
          20 rim<span>→</span>
        </div>
        <div className="mini-location">
          <span>Cabang Kemang</span>
          <div className="mini-boxes">
            <i />
          </div>
          <strong>
            10 <small>rim</small>
          </strong>
        </div>
      </div>
    );
  if (id === "procurement")
    return (
      <div className="preview-procurement" aria-hidden="true">
        {["Pesanan", "Penerimaan", "Tagihan"].map((t, i) => (
          <div key={t} className="mini-document">
            <small>0{i + 1}</small>
            <span>{t}</span>
            <div className="mini-lines" />
            <strong>{i === 1 ? "2 unit" : "Rp3,2 jt"}</strong>
          </div>
        ))}
        <span className="mini-match">Tiga dokumen, satu pemeriksaan</span>
      </div>
    );
  return (
    <div className="preview-operations" aria-hidden="true">
      <div className="mini-branch">
        <span>Cabang Kemang</span>
        <strong>Persiapan buka</strong>
        <small>2 dari 4 pemeriksaan</small>
        <div className="mini-progress">
          <i />
        </div>
      </div>
      <div className="mini-checks">
        <span>✓ Uang awal kasir</span>
        <span>✓ Area pelanggan</span>
        <span>○ Mesin kasir</span>
        <span>○ Stok perlengkapan</span>
      </div>
    </div>
  );
}

export default function DemoPicker() {
  const { states, loaded, notice } = useGuided();
  return (
    <div className="demo-picker">
      <div className="picker-intro">
        <div>
          <p className="demo-eyebrow">Coba alurnya. Lihat hasilnya.</p>
          <h1>
            Mulai dari satu
            <br />
            <span>masalah sehari-hari.</span>
          </h1>
          <p>
            Pilih proses yang paling dekat dengan pekerjaan Anda. Kami pandu
            dari tindakan pertama sampai hasilnya tercatat.
          </p>
        </div>
        <div className="picker-note">
          <span>01 → 02 → 03</span>
          <strong>Pilih kasus. Jalankan. Pahami.</strong>
          <p>
            Gunakan data contoh yang sudah tersedia. Tidak perlu daftar atau
            mengisi data perusahaan.
          </p>
          <Link href="/demo/overview">Lihat ringkasan manajemen →</Link>
        </div>
      </div>
      {notice && (
        <p className="demo-storage-notice" role="status">
          {notice}
        </p>
      )}
      <div className="picker-grid">
        {scenarioIds.map((id, i) => {
          const c = scenarios[id];
          const active = loaded && states[id].started;
          const completed = loaded && isComplete(id, states[id]);
          return (
            <Link
              href={`/demo/${id}?mode=guided`}
              className={`picker-card picker-${id}`}
              key={id}
            >
              <div className="picker-card-label">
                <span>
                  0{i + 1} / {c.label}
                </span>
                <span>
                  {completed
                    ? "Selesai ✓"
                    : active
                      ? "Sedang dicoba"
                      : i === 0
                        ? "Mulai dari sini"
                        : `${c.steps.length - 1} tahap kerja`}
                </span>
              </div>
              <ProcessPreview id={id} />
              <div className="picker-card-copy">
                <h2>{c.title}</h2>
                <p>{c.problem}</p>
                <span className="picker-card-cta">
                  {completed
                    ? "Lihat hasil"
                    : active
                      ? "Lanjutkan demo"
                      : `Coba ${c.label}`}
                  <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="picker-footer">
        <p>
          Seluruh dokumen, perusahaan, dan transaksi di sini adalah simulasi.
        </p>
        <Link href="/">Kembali ke Alur Kendali</Link>
      </div>
    </div>
  );
}
