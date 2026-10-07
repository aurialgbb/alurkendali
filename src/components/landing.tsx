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
import { faqs, navigation, site, solutions } from "@/lib/site";
import ControlledFlow from "@/components/controlled-flow";
import SolutionIllustration from "@/components/solution-illustration";
import LanguageSwitch from "@/components/language-switch";

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

function Icon({
  name,
  className = "",
}: {
  name:
    | "arrow"
    | "check"
    | "document"
    | "chat"
    | "grid"
    | "shield"
    | "clip"
    | "clock"
    | "close"
    | "menu"
    | "branch";
  className?: string;
}) {
  const paths: Record<string, ReactNode> = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    document: (
      <>
        <path d="M14 3H6a1 1 0 0 0-1 1v16h14V8Z" />
        <path d="M14 3v5h5M9 12h6M9 16h6" />
      </>
    ),
    chat: (
      <>
        <path d="M20 11a8 8 0 0 1-8 8H5l-3 3V11a9 9 0 0 1 18 0Z" />
        <path d="M7 10h9M7 14h6" />
      </>
    ),
    grid: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18M3 14h18M9 4v16M15 4v16" />
      </>
    ),
    shield: (
      <>
        <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" />
        <path d="m8 11 3 3 5-5" />
      </>
    ),
    clip: <path d="m8 13 6-6a3 3 0 0 1 4 4l-8 8a5 5 0 0 1-7-7l9-9M6 15l9-9" />,
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    close: <path d="m6 6 12 12M6 18 18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    branch: (
      <>
        <rect x="3" y="3" width="6" height="6" rx="1" />
        <rect x="15" y="15" width="6" height="6" rx="1" />
        <path d="M6 9v9h9M9 6h9v9" />
      </>
    ),
  };
  return (
    <svg
      className={`icon ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
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
      <Image
        src="/logo.png"
        alt={tr(site.name)}
        width={360}
        height={110}
        priority={!footer}
        className="brand-image"
      />
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
  className = "",
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
      className={`button primary ${className}`}
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
    </div>
  );
}

function HeroFlow() {
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
          <path d="M150 78H193Q218 78 218 105V176Q218 200 243 200H290" />
          <path d="M160 200H290" />
          <path d="M150 322H193Q218 322 218 298V224Q218 200 243 200H290" />
          <path className="flow-ink" d="M250 200h40" />
        </svg>
        <div className="source-doc source-sheet">
          <div className="source-label">
            <Icon name="grid" />
            {"Spreadsheet"}
          </div>
          <div className="sheet-lines">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>{"rekap_final_v3.xlsx"}</small>
        </div>
        <div className="source-doc source-chat">
          <div className="source-label">
            <Icon name="chat" />
            {tr("Approval di chat")}
          </div>
          <div className="chat-line">{tr("Sudah disetujui?")}</div>
          <div className="chat-line short">{tr("Cek file yang mana?")}</div>
        </div>
        <div className="source-doc source-evidence">
          <div className="source-label">
            <Icon name="document" />
            {tr("Dokumen terpisah")}
          </div>
          <div className="document-lines">
            <i />
            <i />
          </div>
          <small>{tr("Invoice & bukti transaksi")}</small>
        </div>
        <div className="controlled-card">
          <div className="controlled-top">
            <span className="tiny-monogram">{"ak."}</span>
            <span>{tr("Semua terkait pengajuan ini")}</span>
          </div>
          <div className="controlled-body">
            <span className="small-label">{"Purchase request"}</span>
            <div className="request-title">{tr("Pengadaan peralatan")}</div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>{tr("Kebutuhan sudah dicatat")}</strong>
                <span>{tr("Data pengajuan lengkap")}</span>
              </div>
            </div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>{tr("Atasan sudah menyetujui")}</strong>
                <span>{tr("Keputusannya tersimpan")}</span>
              </div>
            </div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>{tr("Bukti sudah dilampirkan")}</strong>
                <span>{tr("Bisa dibuka saat dibutuhkan")}</span>
              </div>
            </div>
            <div className="audit-strip">
              <Icon name="clock" />
              <span>{tr("Setiap perubahan tercatat.")}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flow-footnote">
        <span className="flow-key" />
        {tr("Ilustrasi alur bisnis")}
        <span>{tr("Dari pengajuan sampai laporan")}</span>
      </div>
    </div>
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
            <h2>
              {tr("Proses mana yang paling")}
              <br />
              {tr("menyita waktu tim Anda?")}
            </h2>
          </div>
          <p>
            {tr("Tidak perlu merombak semuanya sekaligus.")}
            <br />
            {tr(
              "Kita bisa mulai dari satu proses yang paling sering membuat pekerjaan tersendat.",
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
          <div className="solution-copy" key={`copy-${active}`}>
            <span className="section-index">
              {"0"}
              {active + 1}
              {" / "}
              {tr(solution.label)}
            </span>
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
            <Link
              href={
                solution.id === "reporting"
                  ? "/demo/overview"
                  : `/demo/${solution.id}?mode=guided`
              }
              className="text-button"
            >
              {tr("Coba demo ")}
              {tr(solution.short)}
              <Icon name="arrow" />
            </Link>
            <ContactButton
              className="text-button"
              source="solution_whatsapp_click"
              context={solution.context}
            >
              {tr("Diskusikan ")}
              {tr(solution.short)}
              <Icon name="arrow" />
            </ContactButton>
          </div>
          <SolutionIllustration
            key={solution.id}
            category={solution.id}
            title={solution.uiTitle}
            note={solution.note}
          />
        </div>
      </div>
    </section>
  );
}

const demoStages = [
  {
    name: "Pengajuan",
    title: "Tim mengajukan kebutuhan.",
    description:
      "Apa yang dibutuhkan, berapa biayanya, dan untuk keperluan apa? Informasi ini dilengkapi sebelum pengajuan diterima atasan.",
    status: "Diajukan",
    role: "Pemohon",
    time: "09:12",
    action: "Pengajuan dibuat",
  },
  {
    name: "Persetujuan",
    title: "Atasan memeriksa pengajuan.",
    description:
      "Atasan melihat kebutuhan, anggaran, dan dokumennya di tempat yang sama. Keputusan beserta catatannya tersimpan, bukan hanya terkirim di chat.",
    status: "Disetujui",
    role: "Manager operasional",
    time: "10:05",
    action: "Kebutuhan & anggaran disetujui",
  },
  {
    name: "Cek finance",
    title: "Finance mencocokkan buktinya.",
    description:
      "Apakah nilai invoice sesuai pengajuan? Apakah bukti sudah lengkap? Finance bisa memeriksanya tanpa meminta dokumen satu per satu lewat chat.",
    status: "Diverifikasi",
    role: "Tim finance",
    time: "11:20",
    action: "Invoice & bukti diperiksa",
  },
  {
    name: "Riwayat & laporan",
    title: "Saat perlu dicek, riwayatnya ada.",
    description:
      "Manajemen bisa melihat siapa yang mengajukan, siapa yang menyetujui, dan kapan finance memeriksa buktinya. Tidak perlu mencari ulang percakapannya.",
    status: "Selesai",
    role: "Manajemen",
    time: "11:25",
    action: "Proses selesai, riwayat tersedia",
  },
];

function DemoSection() {
  const { t: tr } = useLocale();
  const [active, setActive] = useState(0);
  const stage = demoStages[active];
  return (
    <section id="contoh" className="section demo-section">
      <div className="lp-container">
        <div className="demo-heading">
          <div>
            <span className="eyebrow">{tr("Lihat alurnya")}</span>
            <h2>
              {tr("Ikuti satu pengajuan,")}
              <br />
              {tr("dari awal sampai selesai.")}
            </h2>
          </div>
          <div>
            <span className="demo-label">{tr("Simulasi Alur Kerja")}</span>
            <p>
              {tr("Contoh Purchase & Expense Control.")}
              <br />
              {tr("Klik tahap untuk mengikuti satu pengajuan.")}
            </p>
            <div style={{ marginTop: "0.5rem" }}>
              <Link
                href="/demo"
                style={{
                  color: "#2449D8",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.25rem",
                }}
              >
                {tr("Buka Portal Demo Lengkap (5 Modul) →")}
              </Link>
            </div>
          </div>
        </div>
        <div className="demo-frame" data-stage={active}>
          <div className="demo-toolbar">
            <div className="demo-app-name">
              <span className="tiny-monogram">{"ak."}</span>
              <span>{"Purchase & Expense Control"}</span>
            </div>
            <span className="demo-readonly">
              {tr("Simulasi alur · Data ilustrasi")}
            </span>
          </div>
          <Tabs
            id="demo"
            label="Tahap demo Purchase dan Expense"
            className="demo-tabs"
            items={demoStages.map(
              (item, index) => `0${index + 1} ${item.name}`,
            )}
            active={active}
            onChange={(index) => {
              setActive(index);
              track("demo_interaction", { stage: demoStages[index].name });
            }}
          />
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
                <span className="status">{tr(stage.status)}</span>
              </div>
              {active < 3 ? (
                <>
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
                  {active === 1 && (
                    <div className="review-note">
                      <strong>{tr("Catatan persetujuan")}</strong>
                      <p>
                        {tr(
                          "Kebutuhan sesuai rencana operasional cabang. Lanjutkan untuk verifikasi finance.",
                        )}
                      </p>
                    </div>
                  )}
                  {active === 2 && (
                    <div className="verification-row">
                      <Icon name="check" />
                      {tr("Nilai cocok")}
                      <Icon name="check" />
                      {tr("Bukti lengkap")}
                    </div>
                  )}
                </>
              ) : (
                <div className="audit-timeline">
                  {demoStages.map((item) => (
                    <div className="audit-event" key={item.name}>
                      <span className="audit-dot" />
                      <time>{item.time}</time>
                      <div>
                        <strong>{tr(item.action)}</strong>
                        <span>{tr(item.role)}</span>
                      </div>
                      <Icon name="check" />
                    </div>
                  ))}
                </div>
              )}
              <div className="record-footer">
                <Icon name="clock" />
                <span>
                  {stage.time}
                  {" · "}
                  {tr(stage.action)}
                </span>
              </div>
            </div>
            <aside className="demo-explainer" key={active}>
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
            </aside>
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
      setCopyStatus("Pesan tersalin. Nomor WhatsApp dapat ditambahkan nanti.");
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
            "Salin pesan pembuka berikut untuk memulai diskusi dengan tim konsultan kami melalui WhatsApp atau email.",
          )}
        </p>
        <label className="message-label" htmlFor="contact-message">
          {tr("Pesan pembuka")}
        </label>
        <textarea id="contact-message" readOnly value={tr(message)} rows={6} />
        <button className="button primary" type="button" onClick={copyMessage}>
          {tr("Salin pesan")}
        </button>
        <p className="copy-status" role="status">
          {tr(copyStatus)}
        </p>
      </div>
    </dialog>
  );
}

export default function Landing() {
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
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("reveal-pending");
            entry.target.classList.add("in-view");
            if (entry.target.id === "pendekatan") track("founder_section_view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 },
    );
    document
      .querySelectorAll(".reveal, .section-heading, #pendekatan")
      .forEach((el) => {
        if (
          !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
          el.getBoundingClientRect().top > window.innerHeight
        )
          el.classList.add("reveal-pending");
        observer.observe(el);
      });
    return () => {
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
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
          <ContactButton className="nav-cta" source="nav_whatsapp_click" />
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
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label={tr("Navigasi seluler")}
          hidden={!menuOpen}
        >
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
        </nav>
      </header>
      <main id="main">
        <section id="hero" className="hero">
          <div className="lp-container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-enter">
                {"Business Systems & Controls Consulting"}
              </span>
              <h1 className="hero-enter">
                {"When spreadsheets"}
                <br className="desktop-break" />
                {" are no longer"}
                <br className="desktop-break" /> <span>{"enough."}</span>
              </h1>
              <p className="hero-description hero-enter">
                {tr(
                  "Bisnis makin besar, tapi alur kerja masih tersebar di file Excel dan grup chat? Kami bantu bangun sistem kerja internal yang terkontrol, rapi, dan mudah diawasi.",
                )}
              </p>
              <div className="hero-actions hero-enter">
                <ContactButton source="hero_whatsapp_click" arrow />
                <Link className="button secondary" href="/demo">
                  {tr("Buka Live Demo (5 Modul) →")}
                </Link>
              </div>
              <div className="hero-trust">
                <span>
                  {"Built with an Audit Mindset"}
                  <br />
                  <strong>
                    {tr(
                      "Memastikan setiap transaksi jelas buktinya, persetujuan tercatat, dan laporan minim selisih.",
                    )}
                  </strong>
                </span>
              </div>
            </div>
            <HeroFlow />
          </div>
          <div className="lp-container hero-baseline">
            <span>
              {tr(
                "Sistem operasional yang rapi: lebih sedikit mencari file, lebih mudah memvalidasi angka.",
              )}
            </span>
          </div>
        </section>
        <section id="tantangan" className="pain-section">
          <div className="lp-container">
            <div className="pain-heading reveal">
              <span className="eyebrow">
                {tr("Sering Mengalami Situasi Ini?")}
              </span>
              <h2>
                {tr("Bisnis makin ramai.")}
                <br />
                {tr("Tim makin sibuk mencocokkan file.")}
              </h2>
              <p>
                {tr(
                  "Excel tetap berguna. Masalah muncul ketika satu pengajuan harus melewati banyak orang, nota fisik, dan chat yang gampang terselip.",
                )}
              </p>
            </div>
            <div className="pain-grid reveal">
              {[
                [
                  "grid",
                  "Tiap tutup buku, tim lembur mencari selisih",
                  "Data cabang beda dengan catatan pusat. Laporan keuangan molor berminggu-minggu hanya karena tim sibuk mencocokkan angka satu per satu.",
                ],
                [
                  "document",
                  "Uang sudah keluar, bukti bayar menyusul",
                  "Kasbon diambil atau transfer sudah jalan, tapi nota hilang atau lupa difoto. Akhirnya pengeluaran sulit dipertanggungjawabkan saat diperiksa.",
                ],
                [
                  "chat",
                  "Persetujuan hanya modal chat di WhatsApp",
                  "Persetujuan tenggelam di grup. Saat barang datang salah spesifikasi atau melebihi anggaran, sulit memastikan siapa yang memberi izin.",
                ],
                [
                  "clock",
                  "Rumus spreadsheet berubah tanpa jejak",
                  "Satu file diedit bersama oleh banyak orang. Ketika ada angka atau rumus yang keliru diubah, tidak ada riwayat siapa yang mengeditnya.",
                ],
              ].map(([icon, title, text], index) => (
                <article className="pain-item" key={title}>
                  <div className="pain-icon">
                    <Icon name={icon as "grid"} />
                    <span>
                      {"0"}
                      {index + 1}
                    </span>
                  </div>
                  <h3>{tr(title)}</h3>
                  <p>{tr(text)}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
        <SolutionSection />
        <section className="comparison-section">
          <div className="lp-container">
            <div className="comparison-heading reveal">
              <span className="eyebrow">
                {tr("Apa yang berubah dalam pekerjaan sehari-hari?")}
              </span>
              <h2>
                {tr("Tidak perlu lagi mencari status")}
                <br />
                {tr("dari satu chat ke chat lain.")}
              </h2>
            </div>
            <div className="comparison-grid reveal">
              <div className="before-column">
                <span className="comparison-label">
                  {tr("Saat semuanya masih terpisah")}
                </span>
                <h3>{tr("Tim harus bertanya dan mencocokkan ulang.")}</h3>
                <div className="before-flow">
                  <span>{"Spreadsheet"}</span>
                  <span>{"Chat approval"}</span>
                  <span>{tr("Folder bukti")}</span>
                  <span>{tr("Rekap ulang")}</span>
                </div>
                <p>
                  {tr(
                    "Pengajuan ada di spreadsheet, persetujuan di chat, dan bukti di folder lain. Untuk mengecek satu transaksi, tim harus membuka semuanya.",
                  )}
                </p>
              </div>
              <div className="transition-arrow" aria-hidden="true">
                <Icon name="arrow" />
              </div>
              <ControlledFlow />
            </div>
          </div>
        </section>
        <DemoSection />
        <section id="cara-kerja" className="section work-section">
          <div className="lp-container">
            <div className="split-heading section-heading reveal">
              <div>
                <span className="eyebrow">{tr("Cara kami bekerja")}</span>
                <h2>
                  {tr("Kami pelajari cara kerja tim Anda,")}
                  <br />
                  {tr("lalu bangun sistemnya bersama.")}
                </h2>
              </div>
              <p>
                {tr(
                  "Sebelum membahas tampilan aplikasi, kami ingin tahu pekerjaan mana yang sering tersendat dan apa yang perlu Anda awasi.",
                )}
              </p>
            </div>
            <ol className="work-grid reveal">
              {[
                [
                  "Pelajari prosesnya",
                  "Kami melihat bagaimana tim bekerja sekarang, siapa saja yang terlibat, dan di mana pekerjaan sering tertahan.",
                ],
                [
                  "Sepakati alur baru",
                  "Bersama tim Anda, kami menentukan langkah kerja, siapa yang menyetujui, serta bukti dan laporan yang diperlukan.",
                ],
                [
                  "Bangun dan coba",
                  "Sistem dibangun sesuai alur yang disepakati, lalu dicoba oleh tim Anda dengan contoh pekerjaan sehari-hari.",
                ],
                [
                  "Pakai dan evaluasi",
                  "Kami mendampingi tim saat mulai menggunakan sistem dan memperbaiki bagian yang masih menyulitkan pekerjaan.",
                ],
              ].map(([title, text], index) => (
                <li key={title}>
                  <div className="work-number">
                    {"0"}
                    {index + 1}
                    <span />
                  </div>
                  <h3>{tr(title)}</h3>
                  <p>{tr(text)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section id="pendekatan" className="founder-section">
          <div className="lp-container">
            <div className="founder-grid">
              <div className="founder-statement">
                <span className="eyebrow">
                  {tr("Mengapa pendekatan kami berbeda?")}
                </span>
                <h2>
                  {tr("Yang kami perhatikan:")}
                  <br />
                  {tr("cara kerja tim,")}
                  <br />
                  <span>{tr("dan kontrol di baliknya.")}</span>
                </h2>
                <div className="founder-signature">
                  <span className="signature-mark">{"ak."}</span>
                  <div>
                    <strong>{tr("Didampingi langsung oleh founder")}</strong>
                    <span>
                      {tr(
                        "Top-tier audit pedigree · Spesialis sistem kontrol dan tata kelola bisnis",
                      )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="founder-copy">
                <blockquote className="founder-lead">
                  <strong>{"We don't do guesswork."}</strong>
                  <p>
                    {tr(
                      "“Sistem bisnis yang baik tidak dibangun dari kira-kira, melainkan dari pola pikir kontrol dan audit. Setiap transaksi, persetujuan, dan angka di laporan Anda dipastikan siap diaudit (audit-ready) kapan pun dibutuhkan.”",
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
                    "Pengalaman di audit dan finance membantu kami melihat bagian yang mudah terlewat: angka yang perlu dicocokkan, perubahan yang harus dicatat, dan pekerjaan yang perlu diperiksa lagi.",
                  )}
                </p>
              </div>
            </div>

            <div className="founder-pillars reveal">
              <div className="pillar-card">
                <span className="pillar-badge">{"01"}</span>
                <h3>{"Audit & Control Mindset"}</h3>
                <p>
                  {tr(
                    "Melihat proses dari kacamata kontrol risiko, pemisahan persetujuan, dan bukti transaksi yang rapi.",
                  )}
                </p>
              </div>
              <div className="pillar-card">
                <span className="pillar-badge">{"02"}</span>
                <h3>{"Institutional Governance & Compliance"}</h3>
                <p>
                  {tr(
                    "Pemisahan wewenang dan kelengkapan bukti transaksi sesuai standar akuntansi dan perpajakan.",
                  )}
                </p>
              </div>
              <div className="pillar-card">
                <span className="pillar-badge">{"03"}</span>
                <h3>{"High-Impact Systems Execution"}</h3>
                <p>
                  {tr(
                    "Penerjemahan alur bisnis yang rumit menjadi sistem internal yang gesit, mudah dipakai tim, dan transparan.",
                  )}
                </p>
              </div>
            </div>
            <p className="founder-note">
              {tr(
                "Pendekatan profesional berbasis tata kelola risiko, audit alur transaksi, dan integritas data bisnis.",
              )}
            </p>
          </div>
        </section>
        <section className="section fit-section">
          <div className="lp-container">
            <div className="fit-header reveal">
              <span className="eyebrow">{tr("Apakah ini untuk Anda?")}</span>
              <h2>
                {tr("Sudah terasa perlu dirapikan,")}
                <br />
                {tr("tapi bingung mulai dari mana?")}
              </h2>
              <p>
                {tr(
                  "Pilih proses kerja yang paling sering terhambat. Kita evaluasi apakah sistem internal terkontrol adalah solusi yang tepat.",
                )}
              </p>
            </div>
            <div className="fit-cards-grid reveal">
              <div className="fit-card fit-card-match">
                <div className="fit-card-header">
                  <span className="fit-badge match">
                    {tr("Kualifikasi Utama")}
                  </span>
                  <h3>{tr("Sangat cocok jika bisnis Anda...")}</h3>
                </div>
                <ul className="check-list">
                  {[
                    "Melibatkan 3+ cabang, gudang, atau departemen yang saling bertukar data",
                    "Tim butuh lebih dari 2 hari tiap tutup buku hanya untuk rekonsiliasi nota",
                    "Persetujuan pengeluaran dana masih mengandalkan chat WhatsApp pribadi",
                    "Software standar yang ada terasa kaku dan belum pas dengan cara kerja tim",
                  ].map((item) => (
                    <li key={item}>
                      <Icon name="check" />
                      {tr(item)}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="fit-card fit-card-alt">
                <div className="fit-card-header">
                  <span className="fit-badge alt">{tr("Saran Objektif")}</span>
                  <h3>{tr("Pertimbangkan solusi lain jika...")}</h3>
                </div>
                <p>
                  {tr(
                    "Jika kebutuhan Anda sudah terjawab baik oleh software akuntansi atau POS standar yang ada di pasaran, gunakan itu dulu. Layanan kami berfokus pada alur kerja internal spesifik yang membutuhkan kontrol ketat dan audit trail, bukan pembuatan website sederhana atau penggantian seluruh sistem ERP sekaligus.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section faq-section">
          <div className="lp-container faq-centered">
            <div className="faq-centered-heading reveal">
              <span className="eyebrow">{tr("Sebelum kita berdiskusi")}</span>
              <h2>
                {tr("Beberapa hal")}
                <br />
                {tr("yang sering ditanyakan.")}
              </h2>
            </div>
            <div className="faq-list faq-centered-list reveal">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {tr(question)}
                    <span className="faq-plus" aria-hidden="true" />
                  </summary>
                  <p>{tr(answer)}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section id="diskusi" className="final-section">
          <div className="lp-container final-inner">
            <span className="eyebrow">{tr("Mulai dari satu percakapan")}</span>
            <h2>
              {tr("Ada alur kerja yang mulai")}
              <br />
              {tr("terlalu rumit untuk spreadsheet?")}
            </h2>
            <p>
              {tr(
                "Ceritakan proses yang paling sering membuat tim bolak-balik mengecek file. Cukup obrolan santai 15 menit tanpa perlu dokumen teknis atau data rahasia.",
              )}
            </p>
            <ContactButton source="final_whatsapp_click" arrow>
              {tr("Diskusikan via WhatsApp")}
            </ContactButton>
            <span className="final-microcopy">
              {tr(
                "Diskusi awal membahas alur umum. Data keuangan dan file sensitif internal tidak diperlukan.",
              )}
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="lp-container footer-top">
          <div>
            <Brand footer />
            <p>{tr(site.descriptor)}</p>
          </div>
          <div className="footer-links">
            <span>{"Indonesia · By appointment"}</span>
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
              <Icon name="arrow" />
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
      {stickyCTA && (
        <div className="mobile-sticky">
          <ContactButton source="mobile_whatsapp_click">
            {tr("Diskusikan Proses Anda")}
            <Icon name="arrow" />
          </ContactButton>
        </div>
      )}
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
    </ContactContext.Provider>
  );
}
