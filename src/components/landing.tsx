"use client";
import { useLocale } from "@/lib/locale";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  m,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { faqs, navigation, site, solutions } from "@/lib/site";
import Icon from "@/components/icon";
import HeroFlow from "@/components/hero-flow";
import DemoSection from "@/components/demo-flow";
import SolutionIllustration from "@/components/solution-illustration";
import LanguageSwitch from "@/components/language-switch";
import {
  ChatVisual,
  FormulaVisual,
  ReceiptVisual,
  ReconcileVisual,
} from "@/components/pain-visuals";
import { MotionProvider, ease, once, rise, stagger } from "@/components/motion";

type EventDetails = Record<string, string>;
declare global {
  interface Window {
    alurEvents?: { event: string; details: EventDetails; at: string }[];
  }
}
function track(event: string, details: EventDetails = {}) {
  const query = new URLSearchParams(window.location.search);
  const attribution: EventDetails = {};
  ["utm_source", "utm_medium", "utm_campaign"].forEach((key) => {
    const value = query.get(key);
    if (value) attribution[key] = value.slice(0, 120);
  });
  const entry = {
    event,
    details: { ...attribution, ...details },
    at: new Date().toISOString(),
  };
  window.alurEvents = [...(window.alurEvents ?? []).slice(-99), entry];
  window.dispatchEvent(new CustomEvent("alur:analytics", { detail: entry }));
}

// Headings are wiped in from the top, like a line being written into a ledger.
// It is the one repeated entrance on the page; body copy stays still.
const wipe = {
  hidden: { opacity: 0, clipPath: "inset(0 0 100% 0)", y: 12 },
  show: {
    opacity: 1,
    clipPath: "inset(0 0 0% 0)",
    y: 0,
    transition: { duration: 0.8, ease },
  },
};

function Headline({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <m.h2
      className={className}
      variants={wipe}
      initial="hidden"
      whileInView="show"
      // clip-path hides the element from IntersectionObserver ratios, so trigger on
      // any intersection once the heading is 12% above the bottom edge.
      viewport={{ once: true, amount: 0, margin: "0px 0px -12% 0px" }}
    >
      {children}
    </m.h2>
  );
}

function Brand({ footer = false }: { footer?: boolean }) {
  const { t: tr } = useLocale();
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#top"
      aria-label={tr(`${site.name}, kembali ke atas`)}
    >
      {footer ? (
        <Image
          src="/logo.png"
          alt={tr(site.name)}
          width={360}
          height={110}
          className="brand-image"
        />
      ) : (
        <>
          <Image
            src="/logo-icon.png"
            alt=""
            width={40}
            height={40}
            priority
            className="brand-icon"
          />
          <span className="brand-wordmark">{"AlurKendali"}</span>
        </>
      )}
    </a>
  );
}

const ContactContext = createContext<
  (source: string, context?: string) => void
>(() => {});
function ContactButton({
  source,
  context,
  children = "Diskusikan Proses Anda",
  className = "button primary",
  arrow = false,
}: {
  source: string;
  context?: string;
  children?: ReactNode;
  className?: string;
  arrow?: boolean;
}) {
  const { t: tr } = useLocale();
  const open = useContext(ContactContext);
  return (
    <button
      type="button"
      className={className}
      onClick={() => open(source, context)}
    >
      {tr(children)}
      {arrow && <Icon name="arrow" />}
    </button>
  );
}

function Tabs({
  items,
  active,
  onChange,
  id,
  label,
  className = "",
}: {
  items: readonly string[];
  active: number;
  onChange: (index: number) => void;
  id: string;
  label: string;
  className?: string;
}) {
  const { t: tr } = useLocale();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // The indicator slides to the chosen tab so the change of category reads as one move.
  useEffect(() => {
    function measure() {
      const tab = refs.current[active];
      if (tab) setIndicator({ left: tab.offsetLeft, width: tab.offsetWidth });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [active, items]);
  function handleKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % items.length;
    else if (event.key === "ArrowLeft")
      next = (index - 1 + items.length) % items.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = items.length - 1;
    else return;
    event.preventDefault();
    onChange(next);
    refs.current[next]?.focus();
  }
  return (
    <div className={`tabs ${className}`} role="tablist" aria-label={tr(label)}>
      {items.map((item, index) => (
        <button
          key={item}
          type="button"
          role="tab"
          ref={(el) => {
            refs.current[index] = el;
          }}
          id={`${id}-tab-${index}`}
          aria-controls={`${id}-panel`}
          aria-selected={active === index}
          tabIndex={active === index ? 0 : -1}
          onKeyDown={(event) => handleKey(event, index)}
          onClick={() => onChange(index)}
        >
          {tr(item)}
        </button>
      ))}
      <span
        className="tab-indicator"
        aria-hidden="true"
        style={{ left: indicator.left, width: indicator.width }}
      />
    </div>
  );
}

function Hero() {
  const { t: tr } = useLocale();
  const lines = ["When spreadsheets", "are no longer"];
  return (
    <section id="hero" className="hero">
      <div className="lp-container hero-grid">
        <div className="hero-copy">
          <m.span
            className="eyebrow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {"Business Systems & Controls Consulting"}
          </m.span>
          {/* Each line rises out of its own mask; the underline then marks the turning point. */}
          <h1 aria-label="When spreadsheets are no longer enough.">
            {lines.map((line, index) => (
              <span className="mask-line" key={line} aria-hidden="true">
                <m.span
                  initial={{ y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.8, delay: 0.1 + index * 0.12, ease }}
                >
                  {line}
                </m.span>
              </span>
            ))}
            <span className="mask-line" aria-hidden="true">
              <m.em
                initial={{ y: "110%" }}
                animate={{ y: "0%" }}
                transition={{ duration: 0.8, delay: 0.34, ease }}
              >
                {"enough."}
                <svg viewBox="0 0 200 14" preserveAspectRatio="none">
                  <m.path
                    d="M3 9C48 4 110 3 197 7"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.7, delay: 1.05, ease }}
                  />
                </svg>
              </m.em>
            </span>
          </h1>
          <m.div variants={stagger(0.12, 0.55)} initial="hidden" animate="show">
            <m.p className="hero-description" variants={rise}>
              {tr(
                "Usaha makin besar, tapi pengajuan masih lewat Excel dan grup chat? Kami bantu bangun sistem internal supaya status, persetujuan, dan bukti setiap pengajuan ada di satu tempat.",
              )}
            </m.p>
            <m.div className="hero-actions" variants={rise}>
              <ContactButton source="hero_whatsapp_click" arrow />
              <Link className="button secondary" href="/demo">
                {tr("Coba Demo Interaktif")}
              </Link>
            </m.div>
            <m.div className="hero-trust" variants={rise}>
              <Icon name="shield" />
              <span>
                {tr("Dirancang dengan kacamata audit")}
                <br />
                <strong>
                  {tr(
                    "Setiap transaksi ada buktinya, setiap persetujuan tercatat, dan angka di laporan bisa ditelusuri.",
                  )}
                </strong>
              </span>
            </m.div>
          </m.div>
        </div>
        <HeroFlow />
      </div>
    </section>
  );
}

const painRows = [
  {
    title: "Uang sudah keluar, bukti bayar menyusul",
    text: "Kasbon sudah diambil, transfer sudah jalan, tapi notanya hilang atau lupa difoto. Pas diperiksa, pengeluarannya susah dipertanggungjawabkan.",
    Visual: ReceiptVisual,
  },
  {
    title: "Persetujuan cuma lewat chat WhatsApp",
    text: "Persetujuan tenggelam di antara obrolan lain. Begitu barang datang tidak sesuai atau melewati anggaran, susah memastikan siapa yang tadi bilang boleh.",
    Visual: ChatVisual,
  },
  {
    title: "Rumus spreadsheet berubah tanpa jejak",
    text: "Satu file diedit banyak orang. Kalau ada rumus yang berubah, tidak ketahuan siapa yang mengubahnya dan kapan.",
    Visual: FormulaVisual,
  },
];

function PainSection() {
  const { t: tr } = useLocale();
  return (
    <section id="tantangan" className="pain-section">
      <div className="lp-container">
        <div className="pain-heading">
          <span className="eyebrow">{tr("Pernah mengalami ini?")}</span>
          <Headline>
            {tr("Usaha makin ramai, tapi tim malah sibuk mencocokkan file.")}
          </Headline>
          <p>
            {tr(
              "Excel-nya sendiri tidak salah. Repotnya mulai saat satu pengajuan harus lewat banyak orang, nota kertas, dan chat yang gampang tenggelam.",
            )}
          </p>
        </div>
        <div className="pain-layout">
          <article className="pain-lead">
            <ReconcileVisual />
            <h3>{tr("Tiap tutup buku, tim lembur mencari selisih")}</h3>
            <p>
              {tr(
                "Angka cabang tidak sama dengan catatan pusat, jadi tim lembur mencocokkannya satu per satu. Akibatnya laporan keuangan bisa molor berminggu-minggu.",
              )}
            </p>
          </article>
          <div className="pain-list">
            {painRows.map(({ title, text, Visual }) => (
              <article className="pain-row" key={title}>
                <Visual />
                <div>
                  <h3>{tr(title)}</h3>
                  <p>{tr(text)}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionSection() {
  const { t: tr } = useLocale();
  const [active, setActive] = useState(0);
  const solution = solutions[active];
  return (
    <section id="solusi" className="section solutions-section">
      <div className="lp-container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">{tr("Area solusi")}</span>
            <Headline>
              {tr("Proses mana yang paling menyita waktu tim Anda?")}
            </Headline>
          </div>
          <p>
            {tr(
              "Tidak perlu mengubah semuanya sekaligus. Mulai saja dari satu proses yang paling sering membuat pekerjaan macet.",
            )}
          </p>
        </div>
        <Tabs
          id="solutions"
          label="Area solusi bisnis"
          items={solutions.map((item) => item.label)}
          active={active}
          onChange={(index) => {
            setActive(index);
            track(`solution_${solutions[index].id}_view`);
          }}
        />
        <div
          id="solutions-panel"
          role="tabpanel"
          aria-labelledby={`solutions-tab-${active}`}
          tabIndex={0}
          className="solution-panel"
        >
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              className="solution-copy"
              key={`copy-${active}`}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 14 }}
              transition={{ duration: 0.3, ease }}
            >
              <span className="section-index">{tr(solution.label)}</span>
              <h3>{tr(solution.title)}</h3>
              <p>{tr(solution.description)}</p>
              <ul className="check-list">
                {solution.outcomes.map((outcome) => (
                  <li key={outcome}>
                    <Icon name="check" />
                    {tr(outcome)}
                  </li>
                ))}
              </ul>
              <div className="solution-actions">
                <Link
                  href={
                    solution.id === "reporting"
                      ? "/demo/overview"
                      : `/demo/${solution.id}?mode=guided`
                  }
                  className="button secondary"
                >
                  {tr("Coba demo ")}
                  {tr(solution.short)}
                  <Icon name="arrow" />
                </Link>
                <ContactButton
                  className="text-link"
                  source="solution_whatsapp_click"
                  context={solution.context}
                >
                  {tr("Diskusikan ")}
                  {tr(solution.short)}
                </ContactButton>
              </div>
            </m.div>
          </AnimatePresence>
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={solution.id}
              className="solution-visual-wrap"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease }}
            >
              <SolutionIllustration
                category={solution.id}
                title={solution.uiTitle}
                note={solution.note}
              />
            </m.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

const workSteps = [
  [
    "Pelajari prosesnya",
    "Kami lihat dulu cara tim bekerja sekarang: siapa yang terlibat dan di mana pekerjaan sering tertahan.",
  ],
  [
    "Sepakati alur baru",
    "Bersama tim Anda, kami tentukan langkah kerjanya, siapa yang menyetujui, serta bukti dan laporan apa yang perlu ada.",
  ],
  [
    "Bangun dan coba",
    "Sistem kami bangun sesuai alur yang disepakati, lalu tim Anda mencobanya dengan pekerjaan sehari-hari.",
  ],
  [
    "Pakai dan evaluasi",
    "Kami mendampingi tim saat mulai memakainya, lalu memperbaiki bagian yang masih menyulitkan.",
  ],
];

// The process line fills as the visitor scrolls, and each step lights up when the
// line reaches it, so the engagement reads as a sequence rather than four equal boxes.
function WorkSection() {
  const { t: tr } = useLocale();
  const ref = useRef<HTMLOListElement>(null);
  const prefersReduced = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const reduced = mounted && prefersReduced;
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "end 0.6"],
  });
  const [reached, setReached] = useState(0);
  useMotionValueEvent(scrollYProgress, "change", (value) => {
    if (!reduced)
      setReached(value <= 0.02 ? 0 : Math.min(4, Math.floor(value * 3) + 1));
  });
  useEffect(() => {
    if (reduced) setReached(4);
  }, [reduced]);
  return (
    <section id="cara-kerja" className="section work-section">
      <div className="lp-container">
        <div className="split-heading section-heading">
          <div>
            <span className="eyebrow">{tr("Cara kami bekerja")}</span>
            <Headline>
              {tr("Kami pelajari cara kerja tim Anda, lalu bangun sistemnya bersama.")}
            </Headline>
          </div>
          <p>
            {tr(
              "Sebelum bicara tampilan aplikasi, kami ingin tahu dulu pekerjaan mana yang sering macet dan apa yang perlu Anda awasi.",
            )}
          </p>
        </div>
        <ol className="work-track" ref={ref}>
          <span className="work-rail" aria-hidden="true">
            <m.span
              className="work-rail-fill"
              style={
                { "--progress": reduced ? 1 : scrollYProgress } as React.CSSProperties
              }
            />
          </span>
          {workSteps.map(([title, text], index) => (
            <li key={title} className={index < reached ? "is-reached" : ""}>
              <span className="work-node" aria-hidden="true">
                {"0"}
                {index + 1}
              </span>
              <h3>{tr(title)}</h3>
              <p>{tr(text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const pillars = [
  [
    "Kontrol dan audit",
    "Kami menilai proses dari sisi risiko: siapa menyetujui apa, dan apakah buktinya rapi.",
  ],
  [
    "Tata kelola dan kepatuhan",
    "Wewenang dipisah dengan jelas dan bukti transaksi dilengkapi sesuai standar akuntansi dan perpajakan.",
  ],
  [
    "Sistem yang dipakai tim",
    "Alur bisnis yang rumit kami terjemahkan jadi sistem internal yang ringan dipakai tim dan terang prosesnya.",
  ],
];

function FounderSection() {
  const { t: tr } = useLocale();
  const ref = useRef<HTMLElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.25 });
  useEffect(() => {
    if (seen) track("founder_section_view");
  }, [seen]);
  return (
    <section id="pendekatan" className="founder-section" ref={ref}>
      <div className="lp-container">
        <div className="founder-grid">
          <div className="founder-statement">
            <span className="eyebrow">
              {tr("Mengapa pendekatan kami berbeda?")}
            </span>
            <m.h2
              variants={stagger(0.18)}
              initial="hidden"
              whileInView="show"
              viewport={once}
            >
              {[
                tr("Yang kami perhatikan:"),
                tr("cara kerja tim,"),
                tr("dan kontrol di baliknya."),
              ].map((line, index) => (
                <span className="mask-line" key={line}>
                  <m.span
                    className={index === 2 ? "is-accent" : ""}
                    variants={{
                      hidden: { y: "110%" },
                      show: { y: "0%", transition: { duration: 0.8, ease } },
                    }}
                  >
                    {line}
                  </m.span>
                </span>
              ))}
            </m.h2>
            <div className="founder-signature">
              {/* The monogram is revealed left to right, like a signature being written. */}
              <m.span
                className="signature-mark"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                whileInView={{ clipPath: "inset(0 0% 0 0)" }}
                viewport={{ once: true, amount: 0 }}
                transition={{ duration: 0.9, delay: 0.5, ease }}
              >
                {"ak."}
              </m.span>
              <div>
                <strong>{tr("Didampingi langsung oleh founder")}</strong>
                <span>
                  {tr(
                    "Berlatar belakang audit top-tier · Spesialis sistem kontrol dan tata kelola bisnis",
                  )}
                </span>
              </div>
            </div>
          </div>
          <div className="founder-copy">
            <blockquote className="founder-lead">
              <m.span
                className="quote-mark"
                aria-hidden="true"
                initial={{ opacity: 0, scale: 0.6 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={once}
                transition={{ duration: 0.6, ease }}
              >
                {"“"}
              </m.span>
              <strong>{"We don't do guesswork."}</strong>
              <p>
                {tr(
                  "“Sistem bisnis yang baik dibangun dari pola pikir kontrol dan audit, bukan dari kira-kira. Setiap transaksi, persetujuan, dan angka di laporan Anda harus siap diaudit kapan pun dibutuhkan.”",
                )}
              </p>
            </blockquote>
            <p>
              {tr(
                "Karena itu, sejak awal kami membahas siapa yang boleh mengajukan, siapa yang menyetujui, dan bukti apa yang harus disimpan.",
              )}
            </p>
            <p>
              {tr(
                "Pengalaman di audit dan finance membuat kami peka pada bagian yang gampang terlewat, seperti angka yang harus dicocokkan atau perubahan yang harus dicatat.",
              )}
            </p>
          </div>
        </div>
        <m.ul
          className="founder-pillars"
          variants={stagger(0.2)}
          initial="hidden"
          whileInView="show"
          viewport={once}
        >
          {pillars.map(([title, text]) => (
            <m.li key={title} variants={rise}>
              <m.span
                className="pillar-rule"
                aria-hidden="true"
                variants={{
                  hidden: { scaleX: 0 },
                  show: { scaleX: 1, transition: { duration: 0.7, ease } },
                }}
              />
              <h3>{tr(title)}</h3>
              <p>{tr(text)}</p>
            </m.li>
          ))}
        </m.ul>
      </div>
    </section>
  );
}

const fitItems = [
  "Punya minimal 3 cabang, gudang, atau departemen yang saling bertukar data",
  "Tutup buku butuh lebih dari 2 hari hanya untuk mencocokkan nota",
  "Persetujuan pengeluaran masih lewat chat WhatsApp pribadi",
  "Software standar terasa kaku dan tidak pas dengan cara kerja tim",
];

function FaqItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const { t: tr } = useLocale();
  const [open, setOpen] = useState(false);
  const id = `faq-answer-${index}`;
  return (
    <div className={`faq-item ${open ? "is-open" : ""}`}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen((value) => !value)}
        >
          {tr(question)}
          <span className="faq-plus" aria-hidden="true" />
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {open && (
          <m.div
            id={id}
            className="faq-answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease }}
          >
            <p>{tr(answer)}</p>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FitFaqSection() {
  const { t: tr } = useLocale();
  return (
    <section id="kecocokan" className="section fit-section">
      <div className="lp-container fit-faq-grid">
        <div className="fit-column">
          <span className="eyebrow">{tr("Apakah ini untuk Anda?")}</span>
          <Headline>
            {tr("Sudah terasa perlu dirapikan, tapi bingung mulai dari mana?")}
          </Headline>
          <p className="fit-intro">
            {tr(
              "Coba pilih satu proses yang paling sering macet. Dari situ kita lihat bersama apakah sistem internal memang jawabannya.",
            )}
          </p>
          <h3>{tr("Biasanya cocok kalau usaha Anda...")}</h3>
          {/* Criteria are ticked one by one, as if the visitor is checking them off. */}
          <m.ul
            className="check-list fit-checks"
            variants={stagger(0.22, 0.1)}
            initial="hidden"
            whileInView="show"
            viewport={once}
          >
            {fitItems.map((item) => (
              <m.li
                key={item}
                variants={{
                  hidden: { opacity: 0.35 },
                  show: { opacity: 1, transition: { duration: 0.3 } },
                }}
              >
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <m.path
                    d="m5 12 4 4L19 6"
                    variants={{
                      hidden: { pathLength: 0 },
                      show: { pathLength: 1, transition: { duration: 0.35, ease } },
                    }}
                  />
                </svg>
                {tr(item)}
              </m.li>
            ))}
          </m.ul>
          <div className="fit-alt">
            <h3>{tr("Mungkin lebih baik pakai yang lain kalau...")}</h3>
            <p>
              {tr(
                "Kebutuhan Anda sudah terpenuhi software akuntansi atau POS standar. Kalau begitu, pakai itu dulu. Kami fokus pada alur kerja internal yang butuh kontrol ketat dan jejak audit. Kami tidak membuat website sederhana dan tidak mengganti seluruh ERP sekaligus.",
              )}
            </p>
          </div>
        </div>
        <div className="faq-column">
          <span className="eyebrow">{tr("Sebelum kita berdiskusi")}</span>
          <h2 className="faq-title">{tr("Yang sering ditanyakan")}</h2>
          <div className="faq-list">
            {faqs.map(([question, answer], index) => (
              <FaqItem
                key={question}
                question={question}
                answer={answer}
                index={index}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// The flow line from the rest of the page ends at the button: the last stage of
// the story is the conversation. Drawn once, no looping pulse.
function FinalSection() {
  const { t: tr } = useLocale();
  return (
    <section id="diskusi" className="final-section">
      <svg
        className="final-line"
        viewBox="0 0 400 200"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <m.path
          d="M0 40H55C85 40 92 135 112 135H158"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={once}
          transition={{ duration: 1.2, ease }}
        />
      </svg>
      <div className="lp-container final-inner">
        <span className="eyebrow">{tr("Mulai dari satu percakapan")}</span>
        <Headline>
          {tr("Ada alur kerja yang mulai terlalu rumit untuk spreadsheet?")}
        </Headline>
        <p>
          {tr(
            "Ceritakan proses yang paling sering membuat tim bolak-balik mengecek file. Cukup obrolan santai 15 menit tanpa perlu dokumen teknis atau data rahasia.",
          )}
        </p>
        <m.div
          initial={{ opacity: 0, scale: 0.94 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={once}
          transition={{ duration: 0.5, delay: 0.6, ease }}
        >
          <ContactButton source="final_whatsapp_click" arrow>
            {tr("Diskusikan via WhatsApp")}
          </ContactButton>
        </m.div>
        <span className="final-microcopy">
          {tr(
            "Diskusi awal membahas alur umum. Data keuangan dan file sensitif internal tidak diperlukan.",
          )}
        </span>
      </div>
    </section>
  );
}

function ContactDialog({
  dialogRef,
  message,
}: {
  dialogRef: React.RefObject<HTMLDialogElement | null>;
  message: string;
}) {
  const { t: tr } = useLocale();
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    setCopyStatus("");
  }, [message]);
  async function copyMessage() {
    setCopyStatus("Menyalin pesan...");
    try {
      await navigator.clipboard.writeText(tr(message));
      setCopyStatus("Pesan tersalin.");
    } catch {
      setCopyStatus(
        "Pesan belum tersalin. Pilih teks pesan di atas lalu salin secara manual.",
      );
    }
  }
  return (
    <dialog
      ref={dialogRef}
      className="contact-dialog"
      aria-labelledby="contact-title"
      onClose={() => setCopyStatus("")}
      onClick={(event) => {
        if (event.target === event.currentTarget) dialogRef.current?.close();
      }}
    >
      <div className="dialog-content">
        <LanguageSwitch className="language-dialog" />
        <form method="dialog">
          <button
            className="icon-button dialog-close"
            aria-label={tr("Tutup formulir kontak")}
          >
            <Icon name="close" />
          </button>
        </form>
        <span className="eyebrow">{tr("Konsultasi Sistem")}</span>
        <h2 id="contact-title">{tr("Mulai dari proses Anda")}</h2>
        <p>
          {tr(
            site.email
              ? "Salin pesan pembuka berikut untuk memulai diskusi dengan tim konsultan kami melalui WhatsApp atau email."
              : "Salin pesan pembuka berikut, lalu kirimkan ke kontak Alur Kendali untuk memulai diskusi.",
          )}
        </p>
        <label className="message-label" htmlFor="contact-message">
          {tr("Pesan pembuka")}
        </label>
        <textarea id="contact-message" readOnly value={tr(message)} rows={6} />
        <button className="button primary" type="button" onClick={copyMessage}>
          {tr("Salin pesan")}
        </button>
        {site.email && (
          <a className="dialog-email" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        )}
        <p className="copy-status" role="status">
          {tr(copyStatus)}
        </p>
      </div>
    </dialog>
  );
}

export default function Landing() {
  return (
    <MotionProvider>
      <LandingPage />
    </MotionProvider>
  );
}

function LandingPage() {
  const { t: tr } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [stickyCTA, setStickyCTA] = useState(false);
  const [message, setMessage] = useState("");
  const dialogRef = useRef<HTMLDialogElement>(null);
  const privacyRef = useRef<HTMLDialogElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 24);
      const hero = document.getElementById("hero");
      const final = document.getElementById("diskusi");
      setStickyCTA(
        !!hero &&
          hero.getBoundingClientRect().bottom < 0 &&
          !!final &&
          final.getBoundingClientRect().top > window.innerHeight,
      );
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    function onEscape(event: globalThis.KeyboardEvent) {
      if (event.key === "Escape" && menuOpen) {
        setMenuOpen(false);
        menuRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [menuOpen]);

  function openContact(source: string, context?: string) {
    const demoCategory = new URLSearchParams(window.location.search).get(
      "demo",
    );
    const area =
      context ??
      solutions.find((item) => item.id === demoCategory)?.context ??
      "operasional/finance";
    const text = `Halo, saya ingin mendiskusikan proses kerja di kantor yang saat ini masih manual atau pakai spreadsheet. Area yang ingin dibahas: ${area}. Boleh minta waktu untuk diskusi alurnya?`;
    track(source, { area });
    setMenuOpen(false);
    const number = site.whatsappNumber.replace(/[^0-9]/g, "");
    if (/^[1-9]\d{7,14}$/.test(number)) {
      window.open(
        `https://wa.me/${number}?text=${encodeURIComponent(tr(text))}`,
        "_blank",
        "noopener,noreferrer",
      );
      return;
    }
    setMessage(text);
    dialogRef.current?.showModal();
  }

  return (
    <ContactContext.Provider value={openContact}>
      <div className="lp">
      <a className="skip-link" href="#main">
        {tr("Lewati ke konten utama")}
      </a>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="top">
        <div className="lp-container nav-inner">
          <Brand />
          <nav className="desktop-nav" aria-label={tr("Navigasi utama")}>
            {navigation.map((item) => {
              const NavLink = item.href.startsWith("#") ? "a" : Link;
              return (
                <NavLink href={item.href} key={item.href}>
                  {tr(item.label)}
                </NavLink>
              );
            })}
          </nav>
          <LanguageSwitch className="language-desktop" />
          <ContactButton
            className="button primary nav-cta"
            source="nav_whatsapp_click"
          />
          <button
            ref={menuRef}
            className="menu-button"
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>{tr(menuOpen ? "Tutup" : "Menu")}</span>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <m.nav
              id="mobile-nav"
              className="mobile-nav"
              aria-label={tr("Navigasi seluler")}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease }}
            >
              <div className="mobile-nav-inner">
                <LanguageSwitch />
                {navigation.map((item) => {
                  const NavLink = item.href.startsWith("#") ? "a" : Link;
                  return (
                    <NavLink
                      key={item.href}
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {tr(item.label)}
                    </NavLink>
                  );
                })}
                <ContactButton source="nav_whatsapp_click" />
              </div>
            </m.nav>
          )}
        </AnimatePresence>
      </header>
      <main id="main">
        <Hero />
        <PainSection />
        <SolutionSection />
        <DemoSection onTrack={track} />
        <WorkSection />
        <FounderSection />
        <FitFaqSection />
        <FinalSection />
      </main>
      <footer className="site-footer">
        <div className="lp-container footer-top">
          <div>
            <Brand footer />
            <p>{tr(site.descriptor)}</p>
          </div>
          <div className="footer-links">
            <span>{tr("Indonesia · Dengan janji temu")}</span>
            <button
              type="button"
              onClick={() => privacyRef.current?.showModal()}
            >
              {tr("Privasi")}
            </button>
            <button
              type="button"
              onClick={() => openContact("footer_whatsapp_click")}
            >
              {"WhatsApp"}
            </button>
            {site.email && <a href={`mailto:${site.email}`}>{"Email"}</a>}
            {site.linkedin && (
              <a href={site.linkedin} target="_blank" rel="noreferrer">
                {"LinkedIn"}
              </a>
            )}
          </div>
        </div>
        <div className="lp-container footer-bottom">
          <span>
            {"© 2026 "}
            {site.name}
            {" · Business Systems & Controls Consulting"}
          </span>
          <span>{tr("Seluruh hak cipta dilindungi.")}</span>
        </div>
      </footer>
      <AnimatePresence>
        {stickyCTA && (
          <m.div
            className="mobile-sticky"
            initial={{ y: "110%" }}
            animate={{ y: "0%" }}
            exit={{ y: "110%" }}
            transition={{ duration: 0.35, ease }}
          >
            <ContactButton source="mobile_whatsapp_click">
              {tr("Diskusikan Proses Anda")}
            </ContactButton>
          </m.div>
        )}
      </AnimatePresence>
      <ContactDialog dialogRef={dialogRef} message={message} />
      <dialog
        ref={privacyRef}
        className="contact-dialog"
        aria-labelledby="privacy-title"
      >
        <div className="dialog-content">
          <LanguageSwitch className="language-dialog" />
          <form method="dialog">
            <button
              className="icon-button dialog-close"
              aria-label={tr("Tutup kebijakan privasi")}
            >
              <Icon name="close" />
            </button>
          </form>
          <span className="eyebrow">{tr("Kebijakan Privasi")}</span>
          <h2 id="privacy-title">{tr("Privasi & Kerahasiaan Data")}</h2>
          <p>
            {tr(
              "Kami menghargai kerahasiaan proses bisnis, sistem operasional, dan data keuangan Anda. Halaman ini tidak mengumpulkan data pribadi tanpa persetujuan Anda.",
            )}
          </p>
          <p>
            {tr(
              "Seluruh diskusi awal dan informasi alur kerja yang Anda bagikan diperlakukan secara rahasia dan profesional.",
            )}
          </p>
          <p>
            {tr(
              "Saat Anda menghubungi kami melalui WhatsApp atau email, pesan baru terkirim setelah Anda memvalidasi dan mengirimkannya secara mandiri.",
            )}
          </p>
          <p>
            {tr(
              "Kerahasiaan alur kerja, data keuangan, dan sistem internal klien terlindungi oleh perjanjian kerahasiaan (NDA) pada setiap sesi implementasi.",
            )}
          </p>
        </div>
      </dialog>
      </div>
    </ContactContext.Provider>
  );
}
