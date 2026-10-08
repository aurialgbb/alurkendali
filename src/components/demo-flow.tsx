"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  useInView,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useLocale } from "@/lib/locale";
import Icon from "@/components/icon";
import { ease, once, rise, stagger } from "@/components/motion";

const demoStages = [
  {
    name: "Pengajuan",
    tool: "Spreadsheet",
    title: "Tim mengajukan kebutuhan.",
    description:
      "Apa yang dibutuhkan, berapa biayanya, untuk apa? Semua dilengkapi dulu sebelum pengajuan sampai ke atasan.",
    status: "Diajukan",
    role: "Pemohon",
    time: "09:12",
    action: "Pengajuan dibuat",
  },
  {
    name: "Persetujuan",
    tool: "Chat approval",
    title: "Atasan memeriksa pengajuan.",
    description:
      "Atasan melihat kebutuhan, anggaran, dan dokumennya di satu tempat. Keputusan dan catatannya tersimpan di situ, tidak hanya terkirim lewat chat.",
    status: "Disetujui",
    role: "Manager operasional",
    time: "10:05",
    action: "Kebutuhan & anggaran disetujui",
  },
  {
    name: "Cek finance",
    tool: "Folder bukti",
    title: "Finance mencocokkan buktinya.",
    description:
      "Nilai invoice sudah sesuai pengajuan? Buktinya lengkap? Finance bisa langsung memeriksa tanpa minta dokumen satu per satu lewat chat.",
    status: "Diverifikasi",
    role: "Tim finance",
    time: "11:20",
    action: "Invoice & bukti diperiksa",
  },
  {
    name: "Riwayat & laporan",
    tool: "Rekap ulang",
    title: "Saat perlu dicek, riwayatnya ada.",
    description:
      "Manajemen bisa melihat siapa yang mengajukan, siapa yang menyetujui, dan kapan finance memeriksa buktinya, tanpa mencari ulang percakapannya.",
    status: "Selesai",
    role: "Manajemen",
    time: "11:25",
    action: "Proses selesai, riwayat tersedia",
  },
];

const STAGE_MS = 3600;

// Where each scattered tool starts before scrolling pulls it into line.
const scatter = [
  { x: -26, y: -34, rotate: -7 },
  { x: 18, y: 30, rotate: 5 },
  { x: -14, y: 40, rotate: -4 },
  { x: 30, y: -26, rotate: 6 },
];

function ConvergeChip({
  index,
  progress,
}: {
  index: number;
  progress: MotionValue<number>;
}) {
  const { t: tr } = useLocale();
  const stage = demoStages[index];
  const start = scatter[index];
  const x = useTransform(progress, [0, 1], [start.x, 0]);
  const y = useTransform(progress, [0, 1], [start.y, 0]);
  const rotate = useTransform(progress, [0, 1], [start.rotate, 0]);
  const before = useTransform(progress, [0.35, 0.6], [1, 0]);
  const after = useTransform(progress, [0.45, 0.75], [0, 1]);
  return (
    <m.li className="converge-chip" style={{ x, y, rotate }}>
      <m.span className="chip-before" style={{ opacity: before }}>
        {tr(stage.tool)}
      </m.span>
      <m.span className="chip-after" style={{ opacity: after }}>
        <span className="chip-number">
          {"0"}
          {index + 1}
        </span>
        {tr(stage.name)}
      </m.span>
    </m.li>
  );
}

// Scroll-linked signature moment: the four disconnected tools a team juggles today
// straighten into the four connected stages of one request.
function ConvergeBand() {
  const { t: tr } = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  // Start from the scroll-driven values so server and first client render match,
  // then settle to the final layout once a reduced-motion preference is known.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.95", "center 0.45"],
  });
  const settled = useTransform(scrollYProgress, () => 1);
  const progress = reduced ? settled : scrollYProgress;
  const line = useTransform(progress, [0.55, 1], [0, 1]);
  const beforeLabel = useTransform(progress, [0.3, 0.55], [1, 0]);
  const afterLabel = useTransform(progress, [0.5, 0.8], [0, 1]);
  return (
    <div className="converge-band" ref={ref}>
      <div className="converge-labels" aria-hidden="true">
        <m.span className="is-before" style={{ opacity: beforeLabel }}>
          {tr("Saat semuanya masih terpisah")}
        </m.span>
        <m.span className="is-after" style={{ opacity: afterLabel }}>
          {tr("Dengan alur yang terhubung")}
        </m.span>
      </div>
      <p className="sr-only">
        {tr(
          "Spreadsheet, approval di chat, folder bukti, dan rekap ulang digantikan oleh empat tahap yang terhubung: pengajuan, persetujuan, cek finance, serta riwayat dan laporan.",
        )}
      </p>
      <ol className="converge-row" aria-hidden="true">
        <m.span className="converge-line" style={{ scaleX: line }} />
        {demoStages.map((stage, index) => (
          <ConvergeChip key={stage.name} index={index} progress={progress} />
        ))}
      </ol>
    </div>
  );
}

export default function DemoSection({
  onTrack,
}: {
  onTrack: (event: string, details?: Record<string, string>) => void;
}) {
  const { t: tr } = useLocale();
  const frameRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const visible = useInView(frameRef, { amount: 0.35 });
  // The preference is unknown during server render; treat it as reduced until mounted
  // so the server and first client render agree.
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = !mounted || prefersReduced;
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  const stage = demoStages[active];
  const running = playing && visible && pageVisible && !reduced;

  useEffect(() => {
    const sync = () => setPageVisible(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  // Autoplay walks the request through its stages; it pauses off-screen, in a hidden
  // tab, for reduced motion, and for good once the visitor picks a stage.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(
      () => setActive((current) => (current + 1) % demoStages.length),
      active === demoStages.length - 1 ? STAGE_MS + 1600 : STAGE_MS,
    );
    return () => window.clearTimeout(timer);
  }, [running, active]);

  function choose(index: number) {
    setActive(index);
    setPlaying(false);
    onTrack("demo_interaction", { stage: demoStages[index].name });
  }

  function handleKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = demoStages.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % demoStages.length
        : event.key === "ArrowLeft"
          ? (index - 1 + demoStages.length) % demoStages.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    choose(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <section id="contoh" className="section demo-section">
      <div className="lp-container">
        <m.div
          className="demo-heading"
          variants={stagger(0.12)}
          initial="hidden"
          whileInView="show"
          viewport={once}
        >
          <m.div variants={rise}>
            <span className="eyebrow">{tr("Lihat alurnya")}</span>
            <h2>{tr("Ikuti satu pengajuan, dari awal sampai selesai.")}</h2>
          </m.div>
          <m.div variants={rise}>
            <p>
              {tr(
                "Sekarang pengajuan ada di spreadsheet, persetujuan di chat, buktinya di folder lain. Mengecek satu transaksi berarti membuka semuanya. Ini bedanya kalau semua tersambung.",
              )}
            </p>
            <Link href="/demo" className="demo-portal-link">
              {tr("Buka portal demo lengkap")}
              <Icon name="arrow" />
            </Link>
          </m.div>
        </m.div>

        <ConvergeBand />

        <div className="demo-frame" data-stage={active} ref={frameRef}>
          <div className="demo-toolbar">
            <div className="demo-app-name">
              <span className="tiny-monogram">{"ak."}</span>
              <span>{"Purchase & Expense Control"}</span>
            </div>
            <div className="demo-toolbar-end">
              <span className="demo-readonly">
                {tr("Simulasi alur · Data ilustrasi")}
              </span>
              {!reduced && (
                <button
                  type="button"
                  className="sequence-toggle"
                  aria-label={tr(playing ? "Jeda animasi" : "Putar animasi")}
                  title={tr(playing ? "Jeda animasi" : "Putar animasi")}
                  aria-pressed={!playing}
                  onClick={() => setPlaying((value) => !value)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true">
                    {playing ? (
                      <path d="M5 3v10M11 3v10" />
                    ) : (
                      <path d="m5 3 7 5-7 5Z" />
                    )}
                  </svg>
                </button>
              )}
            </div>
          </div>
          <div
            className="tabs demo-tabs"
            role="tablist"
            aria-label={tr("Tahap demo Purchase dan Expense")}
          >
            {demoStages.map((item, index) => {
              const selected = active === index;
              return (
                <button
                  key={item.name}
                  type="button"
                  role="tab"
                  ref={(el) => {
                    tabRefs.current[index] = el;
                  }}
                  id={`demo-tab-${index}`}
                  aria-controls="demo-panel"
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  className={index < active ? "is-done" : ""}
                  onKeyDown={(event) => handleKey(event, index)}
                  onClick={() => choose(index)}
                >
                  {tr(`0${index + 1} ${item.name}`)}
                  {selected && running && (
                    <m.span
                      key={`progress-${active}`}
                      className="tab-progress"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{
                        duration:
                          (index === demoStages.length - 1
                            ? STAGE_MS + 1600
                            : STAGE_MS) / 1000,
                        ease: "linear",
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <div
            id="demo-panel"
            role="tabpanel"
            aria-labelledby={`demo-tab-${active}`}
            tabIndex={0}
            className="demo-panel"
          >
            <div className="demo-record">
              <div className="record-heading">
                <div>
                  <span className="record-code">
                    {tr("PR-2026-042 · Contoh pengajuan")}
                  </span>
                  <h3>{tr("Pengadaan peralatan cabang")}</h3>
                </div>
                <AnimatePresence mode="popLayout" initial={false}>
                  <m.span
                    key={stage.status}
                    className="status"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    {tr(stage.status)}
                  </m.span>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                {active < 3 ? (
                  <m.div
                    key="record"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, ease }}
                  >
                    <dl className="record-details">
                      <div>
                        <dt>{tr("Diajukan oleh")}</dt>
                        <dd>{tr("Tim operasional")}</dd>
                      </div>
                      <div>
                        <dt>{"Unit"}</dt>
                        <dd>{tr("Cabang Jakarta")}</dd>
                      </div>
                      <div>
                        <dt>{tr("Kategori")}</dt>
                        <dd>{tr("Peralatan operasional")}</dd>
                      </div>
                      <div>
                        <dt>{tr("Total pengajuan")}</dt>
                        <dd>{"Rp3.500.000"}</dd>
                      </div>
                    </dl>
                    <div className="evidence-box">
                      <Icon name="clip" />
                      <div>
                        <strong>
                          {tr(
                            active === 2
                              ? "Invoice & bukti penerimaan"
                              : "Penawaran peralatan.pdf",
                          )}
                        </strong>
                        <span>
                          {tr(
                            active === 2
                              ? "Nilai sesuai pengajuan · Dokumen diperiksa"
                              : "Dokumen pendukung · Data ilustrasi",
                          )}
                        </span>
                      </div>
                      <Icon name="check" />
                    </div>
                    <AnimatePresence initial={false}>
                      {active === 1 && (
                        <m.div
                          key="review"
                          className="review-note"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease }}
                        >
                          <strong>{tr("Catatan persetujuan")}</strong>
                          <p>
                            {tr(
                              "Kebutuhan sesuai rencana operasional cabang. Lanjutkan untuk verifikasi finance.",
                            )}
                          </p>
                        </m.div>
                      )}
                      {active === 2 && (
                        <m.div
                          key="verify"
                          className="verification-row"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.35, ease }}
                        >
                          <Icon name="check" />
                          {tr("Nilai cocok")}
                          <Icon name="check" />
                          {tr("Bukti lengkap")}
                        </m.div>
                      )}
                    </AnimatePresence>
                  </m.div>
                ) : (
                  <m.div
                    key="timeline"
                    className="audit-timeline"
                    variants={stagger(0.18)}
                    initial="hidden"
                    animate="show"
                    exit={{ opacity: 0 }}
                  >
                    {demoStages.map((item) => (
                      <m.div
                        className="audit-event"
                        key={item.name}
                        variants={{
                          hidden: { opacity: 0, x: -12 },
                          show: { opacity: 1, x: 0, transition: { ease } },
                        }}
                      >
                        <span className="audit-dot" />
                        <time>{item.time}</time>
                        <div>
                          <strong>{tr(item.action)}</strong>
                          <span>{tr(item.role)}</span>
                        </div>
                        <Icon name="check" />
                      </m.div>
                    ))}
                  </m.div>
                )}
              </AnimatePresence>
              <div className="record-footer">
                <Icon name="clock" />
                <span>
                  {stage.time}
                  {" · "}
                  {tr(stage.action)}
                </span>
              </div>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.aside
                className="demo-explainer"
                key={active}
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease }}
              >
                <span className="section-index">
                  {tr("Tahap 0")}
                  {active + 1}
                </span>
                <h3>{tr(stage.title)}</h3>
                <p>{tr(stage.description)}</p>
                <div className="role-line">
                  <span>{tr("Peran dalam proses")}</span>
                  <strong>{tr(stage.role)}</strong>
                </div>
              </m.aside>
            </AnimatePresence>
          </div>
        </div>
        <p className="demo-disclaimer">
          {tr(
            "Ilustrasi untuk menjelaskan pendekatan sistem. Bukan implementasi klien atau aplikasi transaksi aktif.",
          )}
        </p>
      </div>
    </section>
  );
}
