"use client";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { m } from "motion/react";
import { scenarios, scenarioIds, type ScenarioId } from "@/lib/demo-scenarios";
import { useGuided } from "@/lib/guided-store";
import { isComplete } from "@/lib/demo-scenarios";
import { ease, once } from "@/components/motion";
import DemoContactLink from "./contact-link";

// Each preview plays its case once when it scrolls into view: the receipt meets the
// request, the stock moves, the three documents line up, the checklist fills.
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
        <m.div
          className="mini-receipt"
          initial={{ opacity: 0, x: 40, rotate: 14 }}
          whileInView={{ opacity: 1, x: 0, rotate: 5 }}
          viewport={once}
          transition={{ duration: 0.7, ease }}
        >
          <span>{tr("Nota contoh")}</span>
          <div className="mini-lines" />
          <strong>{"Rp350.000"}</strong>
          <m.small
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={once}
            transition={{ duration: 0.4, delay: 0.8 }}
          >
            {tr("Nominal cocok ✓")}
          </m.small>
        </m.div>
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
        <m.div
          className="mini-transfer"
          initial={{ opacity: 0, x: -18 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={once}
          transition={{ duration: 0.8, ease }}
        >
          {tr("20 rim")}
          <span>{"→"}</span>
        </m.div>
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
          <m.div
            key={t}
            className="mini-document"
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: i === 1 ? -9 : 0 }}
            viewport={once}
            transition={{ duration: 0.5, delay: i * 0.15, ease }}
          >
            <small>
              {"0"}
              {i + 1}
            </small>
            <span>{tr(t)}</span>
            <div className="mini-lines" />
            <strong>{tr(i === 1 ? "2 unit" : "Rp3,2 jt")}</strong>
          </m.div>
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
          <m.i
            initial={{ width: "0%" }}
            whileInView={{ width: "50%" }}
            viewport={once}
            transition={{ duration: 0.9, ease }}
          />
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
          <p className="demo-eyebrow">{tr("Demo interaktif")}</p>
          <h1>
            {tr("Mulai dari satu")} <span>{tr("masalah sehari-hari.")}</span>
          </h1>
          <p>
            {tr(
              "Pilih proses yang paling mirip dengan pekerjaan di kantor Anda. Kami pandu langkah demi langkah, sampai jejaknya tercatat.",
            )}
          </p>
        </div>
        <div className="picker-note">
          <strong>
            {tr("Pilih satu kasus, jalankan sendiri, lihat hasilnya.")}
          </strong>
          <p>
            {tr(
              "Data contoh sudah disiapkan. Tidak perlu daftar atau mengisi data perusahaan. Satu kasus selesai sekitar satu menit.",
            )}
          </p>
          <Link href="/demo/overview">{tr("Lihat tampilan owner")}</Link>
          <DemoContactLink
            source="demo_picker_contact"
            className="demo-text-link"
          >
            {tr("Langsung diskusikan proses Anda")}
          </DemoContactLink>
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
                </span>
              </div>
            </Link>
          );
        })}
      </div>
      <div className="picker-footer">
        <p>
          {tr("Mau mencoba tanpa panduan? ")}
          <Link href="/demo/finance?mode=explore">{tr("Buka mode bebas")}</Link>
        </p>
        <Link href="/">{tr("Kembali ke Alur Kendali")}</Link>
      </div>
    </div>
  );
}
