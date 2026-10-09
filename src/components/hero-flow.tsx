"use client";
import { useEffect, useRef, useState } from "react";
import { m, useReducedMotion } from "motion/react";
import { useLocale } from "@/lib/locale";
import Icon from "@/components/icon";
import { ease } from "@/components/motion";

// Plays on load: scattered records arrive, connectors draw, the records settle into
// one controlled request, then each control is ticked in order. After that a quiet
// flow keeps running along the lines (dashes and small packets travelling from each
// record into the request), because the point of the illustration is that data now
// moves on its own. It pauses off-screen and in hidden tabs, and is static under
// reduced motion.
const sources = [
  { className: "source-sheet", dx: -40, dy: -18 },
  { className: "source-chat", dx: -56, dy: 10 },
  { className: "source-evidence", dx: -36, dy: 22 },
];

const steps = [
  ["Kebutuhan sudah dicatat", "Data pengajuan lengkap"],
  ["Atasan sudah menyetujui", "Keputusannya tersimpan"],
  ["Bukti sudah dilampirkan", "Bisa dibuka saat dibutuhkan"],
];

const RADIUS = 26;
// Order of the intro, in seconds: the records arrive (0.3 to about 1.5), the request
// card slides in (1.5 to 2.2), only then do the lines draw, and the flow starts last.
const LINES_AT = 2.3;
const INK_AT = LINES_AT + 1;
const FLOW_AT = INK_AT + 0.5;
const FLOW_START = FLOW_AT + 0.4;

type Geometry = {
  width: number;
  height: number;
  cardLeft: number;
  entryY: number;
  entryX: number;
  paths: string[];
};

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
  const reduced = useReducedMotion();
  const canvasRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const docRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [geo, setGeo] = useState<Geometry | null>(null);

  // The lines are built from where the records and the card really are, so they meet
  // the cards at any width instead of relying on fixed coordinates.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    function measure() {
      const card = cardRef.current;
      const docs = docRefs.current;
      if (!canvas || !card || docs.length < 3 || docs.some((d) => !d)) return;
      const starts = docs.map((d) => ({
        x: d!.offsetLeft + d!.offsetWidth,
        y: d!.offsetTop + d!.offsetHeight / 2,
      }));
      const cardLeft = card.offsetLeft;
      const farthest = Math.max(...starts.map((s) => s.x));
      const space = cardLeft - farthest;
      // Not enough room between the records and the card for a readable line.
      if (space < 40) {
        setGeo(null);
        return;
      }
      const junction = farthest + space * 0.5;
      const radius = Math.min(RADIUS, space * 0.3);
      const entryY = starts[1].y;
      const entryX = junction + radius;
      const paths = starts.map((s) => {
        const gap = entryY - s.y;
        if (Math.abs(gap) < radius * 2) return `M${s.x} ${s.y}H${entryX}`;
        const dir = Math.sign(gap);
        return [
          `M${s.x} ${s.y}`,
          `H${junction - radius}`,
          `Q${junction} ${s.y} ${junction} ${s.y + dir * radius}`,
          `V${entryY - dir * radius}`,
          `Q${junction} ${entryY} ${entryX} ${entryY}`,
        ].join("");
      });
      setGeo({
        width: canvas.clientWidth,
        height: canvas.clientHeight,
        cardLeft,
        entryY,
        entryX,
        paths,
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(canvas);
    document.fonts?.ready.then(measure);
    return () => observer.disconnect();
  }, []);

  // SMIL packets keep running on their own clock, so pause them whenever the
  // illustration is out of view or the tab is hidden.
  useEffect(() => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    if (!svg || !canvas || reduced) return;
    let visible = true;
    const sync = () => {
      if (visible && !document.hidden) svg.unpauseAnimations();
      else svg.pauseAnimations();
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        sync();
      },
      { threshold: 0.1 },
    );
    observer.observe(canvas);
    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [reduced, geo]);

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
      <div className="flow-canvas" ref={canvasRef}>
        {geo && (
          <svg
            ref={svgRef}
            className="flow-connectors"
            viewBox={`0 0 ${geo.width} ${geo.height}`}
            aria-hidden="true"
          >
            {geo.paths.map((d, index) => (
              <g key={d}>
                <m.path
                  d={d}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: 0.9,
                    delay: LINES_AT + index * 0.12,
                    ease,
                  }}
                />
                {!reduced && (
                  <m.path
                    className="flow-dash"
                    d={d}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: FLOW_AT }}
                  />
                )}
              </g>
            ))}
            <m.path
              className="flow-ink"
              d={`M${geo.entryX} ${geo.entryY}H${geo.cardLeft}`}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.4, delay: INK_AT, ease }}
            />
            {!reduced &&
              geo.paths.map((d, index) => (
                <circle
                  key={`packet-${d}`}
                  className="flow-packet"
                  r="3.5"
                  opacity="0"
                >
                  <animateMotion
                    dur="2.6s"
                    begin={`${FLOW_START + index * 0.85}s`}
                    repeatCount="indefinite"
                    path={`${d}H${geo.cardLeft}`}
                    calcMode="linear"
                  />
                  <animate
                    attributeName="opacity"
                    dur="2.6s"
                    begin={`${FLOW_START + index * 0.85}s`}
                    repeatCount="indefinite"
                    values="0;1;1;0"
                    keyTimes="0;0.1;0.88;1"
                  />
                </circle>
              ))}
          </svg>
        )}
        {sources.map((source, index) => (
          <m.div
            key={source.className}
            ref={(el) => {
              docRefs.current[index] = el;
            }}
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
          ref={cardRef}
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
