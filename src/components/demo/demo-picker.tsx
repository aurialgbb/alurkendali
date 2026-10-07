"use client";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { scenarios, scenarioIds, type ScenarioId } from "@/lib/demo-scenarios";
import { useGuided } from "@/lib/guided-store";
import { isComplete } from "@/lib/demo-scenarios";

export function ProcessPreview({ id }: { id: ScenarioId }) {
  const { t: tr } = useLocale();
  if (id === "finance")
    return (
      <div className="preview-finance" aria-hidden="true">
        <div className="mini-document">
          <span>{tr("Pengajuan biaya")}</span>
          <strong>{"Rp350.000"}</strong>
          <div className="mini-lines" />
          <small>{tr("Perlengkapan cabang")}</small>
        </div>
        <div className="mini-receipt">
          <span>{tr("Nota contoh")}</span>
          <div className="mini-lines" />
          <strong>{"Rp350.000"}</strong>
          <small>{tr("Nominal cocok ✓")}</small>
        </div>
        <div className="mini-flow">
          <span>{tr("Staf")}</span>
          <i /> <span>{"Manager"}</span>
          <i />
          <span>{"Finance"}</span>
        </div>
      </div>
    );
  if (id === "inventory")
    return (
      <div className="preview-inventory" aria-hidden="true">
        <div className="mini-location">
          <span>{tr("Gudang Pusat")}</span>
          <div className="mini-boxes">
            <i />
            <i />
            <i />
          </div>
          <strong>
            {"100 "}
            <small>{tr("rim")}</small>
          </strong>
        </div>
        <div className="mini-transfer">
          {tr("20 rim")}
          <span>{"→"}</span>
        </div>
        <div className="mini-location">
          <span>{tr("Cabang Kemang")}</span>
          <div className="mini-boxes">
            <i />
          </div>
          <strong>
            {"10 "}
            <small>{tr("rim")}</small>
          </strong>
        </div>
      </div>
    );
  if (id === "procurement")
    return (
      <div className="preview-procurement" aria-hidden="true">
        {["Pesanan", "Penerimaan", "Tagihan"].map((t, i) => (
          <div key={t} className="mini-document">
            <small>
              {"0"}
              {i + 1}
            </small>
            <span>{tr(t)}</span>
            <div className="mini-lines" />
            <strong>{tr(i === 1 ? "2 unit" : "Rp3,2 jt")}</strong>
          </div>
        ))}
        <span className="mini-match">
          {tr("Tiga dokumen, satu pemeriksaan")}
        </span>
      </div>
    );
  return (
    <div className="preview-operations" aria-hidden="true">
      <div className="mini-branch">
        <span>{tr("Cabang Kemang")}</span>
        <strong>{tr("Persiapan buka")}</strong>
        <small>{tr("2 dari 4 pemeriksaan")}</small>
        <div className="mini-progress">
          <i />
        </div>
      </div>
      <div className="mini-checks">
        <span>{tr("✓ Uang awal kasir")}</span>
        <span>{tr("✓ Area pelanggan")}</span>
        <span>{tr("○ Mesin kasir")}</span>
        <span>{tr("○ Stok perlengkapan")}</span>
      </div>
    </div>
  );
}

export default function DemoPicker() {
  const { t: tr } = useLocale();
  const { states, loaded, notice } = useGuided();
  return (
    <div className="demo-picker">
      <div className="picker-intro">
        <div>
          <p className="demo-eyebrow">{tr("Coba alurnya. Lihat hasilnya.")}</p>
          <h1>
            {tr("Mulai dari satu")}
            <br />
            <span>{tr("masalah sehari-hari.")}</span>
          </h1>
          <p>
            {tr(
              "Pilih proses yang paling dekat dengan pekerjaan Anda. Kami pandu dari tindakan pertama sampai hasilnya tercatat.",
            )}
          </p>
        </div>
        <div className="picker-note">
          <span>{"01 → 02 → 03"}</span>
          <strong>{tr("Pilih kasus. Jalankan. Pahami.")}</strong>
          <p>
            {tr(
              "Gunakan data contoh yang sudah tersedia. Tidak perlu daftar atau mengisi data perusahaan.",
            )}
          </p>
          <Link href="/demo/overview">{tr("Lihat ringkasan manajemen →")}</Link>
        </div>
      </div>
      {notice && (
        <p className="demo-storage-notice" role="status">
          {tr(notice)}
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
                  {"0"}
                  {i + 1}
                  {" / "}
                  {tr(c.label)}
                </span>
                <span>
                  {tr(
                    completed
                      ? "Selesai ✓"
                      : active
                        ? "Sedang dicoba"
                        : i === 0
                          ? "Mulai dari sini"
                          : `${c.steps.length - 1} tahap kerja`,
                  )}
                </span>
              </div>
              <ProcessPreview id={id} />
              <div className="picker-card-copy">
                <h2>{tr(c.title)}</h2>
                <p>{tr(c.problem)}</p>
                <span className="picker-card-cta">
                  {tr(
                    completed
                      ? "Lihat hasil"
                      : active
                        ? "Lanjutkan demo"
                        : `Coba ${c.label}`,
                  )}
                  <span aria-hidden="true">{"↗"}</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="picker-footer">
        <p>
          {tr(
            "Seluruh dokumen, perusahaan, dan transaksi di sini adalah simulasi.",
          )}
        </p>
        <Link href="/">{tr("Kembali ke Alur Kendali")}</Link>
      </div>
    </div>
  );
}
