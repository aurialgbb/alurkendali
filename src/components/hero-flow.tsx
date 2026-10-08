"use client";
import { m } from "motion/react";
import { useLocale } from "@/lib/locale";
import Icon from "@/components/icon";
import { ease } from "@/components/motion";

// Plays once on load: scattered records arrive, connectors draw, the records settle
// into one controlled request, then each control is ticked in order. It tells the
// page's core promise (scattered to controlled) before the visitor scrolls.
const sources = [
  { className: "source-sheet", dx: -40, dy: -18 },
  { className: "source-chat", dx: -56, dy: 10 },
  { className: "source-evidence", dx: -36, dy: 22 },
];

const connectors = [
  "M150 78H193Q218 78 218 105V176Q218 200 243 200H290",
  "M160 200H290",
  "M150 322H193Q218 322 218 298V224Q218 200 243 200H290",
];

const steps = [
  ["Kebutuhan sudah dicatat", "Data pengajuan lengkap"],
  ["Atasan sudah menyetujui", "Keputusannya tersimpan"],
  ["Bukti sudah dilampirkan", "Bisa dibuka saat dibutuhkan"],
];

function SourceBody({ index }: { index: number }) {
  const { t: tr } = useLocale();
  if (index === 0)
    return (
      <>
        <div className="source-label">
          <Icon name="grid" />
          {"Spreadsheet"}
        </div>
        <div className="sheet-lines">
          {Array.from({ length: 9 }, (_, cell) => (
            <i key={cell} />
          ))}
        </div>
        <small>{"rekap_final_v3.xlsx"}</small>
      </>
    );
  if (index === 1)
    return (
      <>
        <div className="source-label">
          <Icon name="chat" />
          {tr("Approval di chat")}
        </div>
        <div className="chat-line">{tr("Sudah disetujui?")}</div>
        <div className="chat-line short">{tr("Cek file yang mana?")}</div>
      </>
    );
  return (
    <>
      <div className="source-label">
        <Icon name="document" />
        {tr("Dokumen terpisah")}
      </div>
      <div className="document-lines">
        <i />
        <i />
      </div>
      <small>{tr("Invoice & bukti transaksi")}</small>
    </>
  );
}

export default function HeroFlow() {
  const { t: tr } = useLocale();
  return (
    <div
      className="hero-flow"
      role="img"
      aria-label={tr(
        "Ilustrasi: spreadsheet, approval di chat, dan dokumen terpisah disatukan menjadi pengajuan dengan approval, bukti, dan audit trail.",
      )}
    >
      <div className="flow-caption">
        <span>{tr("Proses yang tersebar")}</span>
        <span>{tr("Alur yang terkendali")}</span>
      </div>
      <div className="flow-canvas">
        <svg
          className="flow-connectors"
          viewBox="0 0 600 400"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {connectors.map((d, index) => (
            <m.path
              key={d}
              d={d}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, delay: 1 + index * 0.12, ease }}
            />
          ))}
          <m.path
            className="flow-ink"
            d="M250 200h40"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 1.9, ease }}
          />
        </svg>
        {sources.map((source, index) => (
          <m.div
            key={source.className}
            className={`source-doc ${source.className}`}
            initial={{ opacity: 0, x: source.dx, y: source.dy }}
            animate={{
              opacity: [0, 1, 1, 0.62],
              x: [source.dx, 0, 0, 0],
              y: [source.dy, 0, 0, 0],
            }}
            transition={{
              duration: 3.2,
              times: [0, 0.2, 0.78, 1],
              delay: 0.3 + index * 0.15,
              ease,
            }}
          >
            <SourceBody index={index} />
          </m.div>
        ))}
        <m.div
          className="controlled-card"
          initial={{ opacity: 0, x: 28, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 1.5, ease }}
        >
          <div className="controlled-top">
            <span className="tiny-monogram">{"ak."}</span>
            <span>{tr("Semua terkait pengajuan ini")}</span>
          </div>
          <div className="controlled-body">
            <span className="small-label">{"Purchase request"}</span>
            <div className="request-title">{tr("Pengadaan peralatan")}</div>
            {steps.map(([title, detail], index) => (
              <m.div
                className="flow-step"
                key={title}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 2 + index * 0.38, ease }}
              >
                <span className="step-check">
                  <svg
                    className="icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <m.path
                      d="m5 12 4 4L19 6"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{
                        duration: 0.35,
                        delay: 2.2 + index * 0.38,
                        ease,
                      }}
                    />
                  </svg>
                </span>
                <div>
                  <strong>{tr(title)}</strong>
                  <span>{tr(detail)}</span>
                </div>
              </m.div>
            ))}
            <m.div
              className="audit-strip"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 3.2 }}
            >
              <Icon name="clock" />
              <span>{tr("Setiap perubahan tercatat.")}</span>
            </m.div>
          </div>
        </m.div>
      </div>
      <div className="flow-footnote">
        <span className="flow-key" />
        {tr("Ilustrasi alur bisnis")}
        <span>{tr("Dari pengajuan sampai laporan")}</span>
      </div>
    </div>
  );
}
