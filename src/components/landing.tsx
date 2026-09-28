"use client";

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
  return (
    <a
      className={`brand ${footer ? "brand-footer" : ""}`}
      href="#top"
      aria-label={`${site.name}, kembali ke atas`}
    >
      <Image
        src="/logo.png"
        alt={site.name}
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
  const open = useContext(ContactContext);
  return (
    <button
      type="button"
      className={`button primary ${className}`}
      onClick={() => open(source, context)}
    >
      {children}
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
    <div className={`tabs ${className}`} role="tablist" aria-label={label}>
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
          {item}
        </button>
      ))}
    </div>
  );
}

function HeroFlow() {
  return (
    <div
      className="hero-flow"
      role="img"
      aria-label="Ilustrasi: spreadsheet, approval di chat, dan dokumen terpisah disatukan menjadi pengajuan dengan approval, bukti, dan audit trail."
    >
      <div className="flow-caption">
        <span>Proses yang tersebar</span>
        <span>Alur yang terkendali</span>
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
            Spreadsheet
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
          <small>rekap_final_v3.xlsx</small>
        </div>
        <div className="source-doc source-chat">
          <div className="source-label">
            <Icon name="chat" />
            Approval di chat
          </div>
          <div className="chat-line">Sudah disetujui?</div>
          <div className="chat-line short">Cek file yang mana?</div>
        </div>
        <div className="source-doc source-evidence">
          <div className="source-label">
            <Icon name="document" />
            Dokumen terpisah
          </div>
          <div className="document-lines">
            <i />
            <i />
          </div>
          <small>Invoice & bukti transaksi</small>
        </div>
        <div className="controlled-card">
          <div className="controlled-top">
            <span className="tiny-monogram">ak.</span>
            <span>Semua terkait pengajuan ini</span>
          </div>
          <div className="controlled-body">
            <span className="small-label">Purchase request</span>
            <div className="request-title">Pengadaan peralatan</div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>Kebutuhan sudah dicatat</strong>
                <span>Data pengajuan lengkap</span>
              </div>
            </div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>Atasan sudah menyetujui</strong>
                <span>Keputusannya tersimpan</span>
              </div>
            </div>
            <div className="flow-step">
              <span className="step-check">
                <Icon name="check" />
              </span>
              <div>
                <strong>Bukti sudah dilampirkan</strong>
                <span>Bisa dibuka saat dibutuhkan</span>
              </div>
            </div>
            <div className="audit-strip">
              <Icon name="clock" />
              <span>Setiap perubahan tercatat.</span>
            </div>
          </div>
        </div>
      </div>
      <div className="flow-footnote">
        <span className="flow-key" />
        Ilustrasi alur bisnis<span>Dari pengajuan sampai laporan</span>
      </div>
    </div>
  );
}

function SolutionSection() {
  const [active, setActive] = useState(0);
  const solution = solutions[active];
  return (
    <section id="solusi" className="section solutions-section">
      <div className="lp-container">
        <div className="section-heading split-heading">
          <div>
            <span className="eyebrow">Area solusi</span>
            <h2>
              Proses mana yang paling
              <br />
              menyita waktu tim Anda?
            </h2>
          </div>
          <p>
            Tidak perlu merombak semuanya sekaligus.
            <br />
            Kita bisa mulai dari satu proses yang paling sering membuat
            pekerjaan tersendat.
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
              0{active + 1} / {solution.label}
            </span>
            <h3>{solution.title}</h3>
            <p>{solution.description}</p>
            <ul className="check-list">
              {solution.outcomes.map((outcome) => (
                <li key={outcome}>
                  <Icon name="check" />
                  {outcome}
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
              Coba demo {solution.short}
              <Icon name="arrow" />
            </Link>
            <ContactButton
              className="text-button"
              source="solution_whatsapp_click"
              context={solution.context}
            >
              Diskusikan {solution.short}
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
  const [active, setActive] = useState(0);
  const stage = demoStages[active];
  return (
    <section id="contoh" className="section demo-section">
      <div className="lp-container">
        <div className="demo-heading">
          <div>
            <span className="eyebrow">Lihat alurnya</span>
            <h2>
              Ikuti satu pengajuan,
              <br />
              dari awal sampai selesai.
            </h2>
          </div>
          <div>
            <span className="demo-label">Simulasi Alur Kerja</span>
            <p>
              Contoh Purchase & Expense Control.
              <br />
              Klik tahap untuk mengikuti satu pengajuan.
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
                Buka Portal Demo Lengkap (5 Modul) →
              </Link>
            </div>
          </div>
        </div>
        <div className="demo-frame" data-stage={active}>
          <div className="demo-toolbar">
            <div className="demo-app-name">
              <span className="tiny-monogram">ak.</span>
              <span>Purchase & Expense Control</span>
            </div>
            <span className="demo-readonly">
              Simulasi alur · Data ilustrasi
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
                    PR-2026-042 · Contoh pengajuan
                  </span>
                  <h3>Pengadaan peralatan cabang</h3>
                </div>
                <span className="status">{stage.status}</span>
              </div>
              {active < 3 ? (
                <>
                  <dl className="record-details">
                    <div>
                      <dt>Diajukan oleh</dt>
                      <dd>Tim operasional</dd>
                    </div>
                    <div>
                      <dt>Unit</dt>
                      <dd>Cabang Jakarta</dd>
                    </div>
                    <div>
                      <dt>Kategori</dt>
                      <dd>Peralatan operasional</dd>
                    </div>
                    <div>
                      <dt>Total pengajuan</dt>
                      <dd>Rp3.500.000</dd>
                    </div>
                  </dl>
                  <div className="evidence-box">
                    <Icon name="clip" />
                    <div>
                      <strong>
                        {active === 2
                          ? "Invoice & bukti penerimaan"
                          : "Penawaran peralatan.pdf"}
                      </strong>
                      <span>
                        {active === 2
                          ? "Nilai sesuai pengajuan · Dokumen diperiksa"
                          : "Dokumen pendukung · Data ilustrasi"}
                      </span>
                    </div>
                    <Icon name="check" />
                  </div>
                  {active === 1 && (
                    <div className="review-note">
                      <strong>Catatan persetujuan</strong>
                      <p>
                        Kebutuhan sesuai rencana operasional cabang. Lanjutkan
                        untuk verifikasi finance.
                      </p>
                    </div>
                  )}
                  {active === 2 && (
                    <div className="verification-row">
                      <Icon name="check" />
                      Nilai cocok
                      <Icon name="check" />
                      Bukti lengkap
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
                        <strong>{item.action}</strong>
                        <span>{item.role}</span>
                      </div>
                      <Icon name="check" />
                    </div>
                  ))}
                </div>
              )}
              <div className="record-footer">
                <Icon name="clock" />
                <span>
                  {stage.time} · {stage.action}
                </span>
              </div>
            </div>
            <aside className="demo-explainer" key={active}>
              <span className="section-index">Tahap 0{active + 1}</span>
              <h3>{stage.title}</h3>
              <p>{stage.description}</p>
              <div className="role-line">
                <span>Peran dalam proses</span>
                <strong>{stage.role}</strong>
              </div>
            </aside>
          </div>
        </div>
        <p className="demo-disclaimer">
          Ilustrasi untuk menjelaskan pendekatan sistem. Bukan implementasi
          klien atau aplikasi transaksi aktif.
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
  const [copyStatus, setCopyStatus] = useState("");
  useEffect(() => {
    setCopyStatus("");
  }, [message]);
  async function copyMessage() {
    setCopyStatus("Menyalin pesan...");
    try {
      await navigator.clipboard.writeText(message);
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
        <form method="dialog">
          <button
            className="icon-button dialog-close"
            aria-label="Tutup formulir kontak"
          >
            <Icon name="close" />
          </button>
        </form>
        <span className="eyebrow">Konsultasi Sistem</span>
        <h2 id="contact-title">Mulai dari proses Anda</h2>
        <p>
          Salin pesan pembuka berikut untuk memulai diskusi dengan tim konsultan
          kami melalui WhatsApp atau email.
        </p>
        <label className="message-label" htmlFor="contact-message">
          Pesan pembuka
        </label>
        <textarea id="contact-message" readOnly value={message} rows={6} />
        <button className="button primary" type="button" onClick={copyMessage}>
          Salin pesan
        </button>
        <p className="copy-status" role="status">
          {copyStatus}
        </p>
      </div>
    </dialog>
  );
}

export default function Landing() {
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
        `https://wa.me/${number}?text=${encodeURIComponent(text)}`,
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
        Lewati ke konten utama
      </a>
      <header className={`site-header ${scrolled ? "scrolled" : ""}`} id="top">
        <div className="lp-container nav-inner">
          <Brand />
          <nav className="desktop-nav" aria-label="Navigasi utama">
            {navigation.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <ContactButton className="nav-cta" source="nav_whatsapp_click" />
          <button
            ref={menuRef}
            className="menu-button"
            type="button"
            aria-controls="mobile-nav"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <span>{menuOpen ? "Tutup" : "Menu"}</span>
            <Icon name={menuOpen ? "close" : "menu"} />
          </button>
        </div>
        <nav
          id="mobile-nav"
          className="mobile-nav"
          aria-label="Navigasi seluler"
          hidden={!menuOpen}
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <ContactButton source="nav_whatsapp_click" />
        </nav>
      </header>
      <main id="main">
        <section id="hero" className="hero">
          <div className="lp-container hero-grid">
            <div className="hero-copy">
              <span className="eyebrow hero-enter">
                Business Systems & Controls Consulting
              </span>
              <h1 className="hero-enter">
                When spreadsheets
                <br className="desktop-break" /> are no longer
                <br className="desktop-break" /> <span>enough.</span>
              </h1>
              <p className="hero-description hero-enter">
                Bisnis makin besar, tapi alur kerja masih tersebar di file Excel
                dan grup chat? Kami bantu bangun sistem kerja internal yang
                terkontrol, rapi, dan mudah diawasi.
              </p>
              <div className="hero-actions hero-enter">
                <ContactButton source="hero_whatsapp_click" arrow />
                <Link className="button secondary" href="/demo">
                  Buka Live Demo (5 Modul) →
                </Link>
              </div>
              <div className="hero-trust">
                <span>
                  Built with an Audit Mindset
                  <br />
                  <strong>
                    Memastikan setiap transaksi jelas buktinya, persetujuan
                    tercatat, dan laporan minim selisih.
                  </strong>
                </span>
              </div>
            </div>
            <HeroFlow />
          </div>
          <div className="lp-container hero-baseline">
            <span>
              Sistem operasional yang rapi: lebih sedikit mencari file, lebih
              mudah memvalidasi angka.
            </span>
          </div>
        </section>
        <section id="tantangan" className="pain-section">
          <div className="lp-container">
            <div className="pain-heading reveal">
              <span className="eyebrow">Sering Mengalami Situasi Ini?</span>
              <h2>
                Bisnis makin ramai.
                <br />
                Tim makin sibuk mencocokkan file.
              </h2>
              <p>
                Excel tetap berguna. Masalah muncul ketika satu pengajuan harus
                melewati banyak orang, nota fisik, dan chat yang gampang
                terselip.
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
                    <span>0{index + 1}</span>
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
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
                Apa yang berubah dalam pekerjaan sehari-hari?
              </span>
              <h2>
                Tidak perlu lagi mencari status
                <br />
                dari satu chat ke chat lain.
              </h2>
            </div>
            <div className="comparison-grid reveal">
              <div className="before-column">
                <span className="comparison-label">
                  Saat semuanya masih terpisah
                </span>
                <h3>Tim harus bertanya dan mencocokkan ulang.</h3>
                <div className="before-flow">
                  <span>Spreadsheet</span>
                  <span>Chat approval</span>
                  <span>Folder bukti</span>
                  <span>Rekap ulang</span>
                </div>
                <p>
                  Pengajuan ada di spreadsheet, persetujuan di chat, dan bukti
                  di folder lain. Untuk mengecek satu transaksi, tim harus
                  membuka semuanya.
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
                <span className="eyebrow">Cara kami bekerja</span>
                <h2>
                  Kami pelajari cara kerja tim Anda,
                  <br />
                  lalu bangun sistemnya bersama.
                </h2>
              </div>
              <p>
                Sebelum membahas tampilan aplikasi, kami ingin tahu pekerjaan
                mana yang sering tersendat dan apa yang perlu Anda awasi.
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
                    0{index + 1}
                    <span />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
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
                  Mengapa pendekatan kami berbeda?
                </span>
                <h2>
                  Yang kami perhatikan:
                  <br />
                  cara kerja tim,
                  <br />
                  <span>dan kontrol di baliknya.</span>
                </h2>
                <div className="founder-signature">
                  <span className="signature-mark">ak.</span>
                  <div>
                    <strong>Didampingi langsung oleh founder</strong>
                    <span>
                      Top-tier audit pedigree · Spesialis sistem kontrol dan
                      tata kelola bisnis
                    </span>
                  </div>
                </div>
              </div>
              <div className="founder-copy">
                <blockquote className="founder-lead">
                  <strong>We don't do guesswork.</strong>
                  <p>
                    &ldquo;Sistem bisnis yang baik tidak dibangun dari
                    kira-kira, melainkan dari pola pikir kontrol dan audit.
                    Setiap transaksi, persetujuan, dan angka di laporan Anda
                    dipastikan siap diaudit (audit-ready) kapan pun
                    dibutuhkan.&rdquo;
                  </p>
                </blockquote>
                <p>
                  Karena itu, sejak awal kami membahas siapa yang boleh
                  mengajukan, siapa yang menyetujui, dan bukti apa yang harus
                  disimpan.
                </p>
                <p>
                  Pengalaman di audit dan finance membantu kami melihat bagian
                  yang mudah terlewat: angka yang perlu dicocokkan, perubahan
                  yang harus dicatat, dan pekerjaan yang perlu diperiksa lagi.
                </p>
              </div>
            </div>

            <div className="founder-pillars reveal">
              <div className="pillar-card">
                <span className="pillar-badge">01</span>
                <h3>Audit & Control Mindset</h3>
                <p>
                  Melihat proses dari kacamata kontrol risiko, pemisahan
                  persetujuan, dan bukti transaksi yang rapi.
                </p>
              </div>
              <div className="pillar-card">
                <span className="pillar-badge">02</span>
                <h3>Institutional Governance & Compliance</h3>
                <p>
                  Pemisahan wewenang dan kelengkapan bukti transaksi sesuai
                  standar akuntansi dan perpajakan.
                </p>
              </div>
              <div className="pillar-card">
                <span className="pillar-badge">03</span>
                <h3>High-Impact Systems Execution</h3>
                <p>
                  Penerjemahan alur bisnis yang rumit menjadi sistem internal
                  yang gesit, mudah dipakai tim, dan transparan.
                </p>
              </div>
            </div>
            <p className="founder-note">
              Pendekatan profesional berbasis tata kelola risiko, audit alur
              transaksi, dan integritas data bisnis.
            </p>
          </div>
        </section>
        <section className="section fit-section">
          <div className="lp-container">
            <div className="fit-header reveal">
              <span className="eyebrow">Apakah ini untuk Anda?</span>
              <h2>
                Sudah terasa perlu dirapikan,
                <br />
                tapi bingung mulai dari mana?
              </h2>
              <p>
                Pilih proses kerja yang paling sering terhambat. Kita evaluasi
                apakah sistem internal terkontrol adalah solusi yang tepat.
              </p>
            </div>
            <div className="fit-cards-grid reveal">
              <div className="fit-card fit-card-match">
                <div className="fit-card-header">
                  <span className="fit-badge match">Kualifikasi Utama</span>
                  <h3>Sangat cocok jika bisnis Anda...</h3>
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
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="fit-card fit-card-alt">
                <div className="fit-card-header">
                  <span className="fit-badge alt">Saran Objektif</span>
                  <h3>Pertimbangkan solusi lain jika...</h3>
                </div>
                <p>
                  Jika kebutuhan Anda sudah terjawab baik oleh software
                  akuntansi atau POS standar yang ada di pasaran, gunakan itu
                  dulu. Layanan kami berfokus pada alur kerja internal spesifik
                  yang membutuhkan kontrol ketat dan audit trail, bukan
                  pembuatan website sederhana atau penggantian seluruh sistem
                  ERP sekaligus.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="section faq-section">
          <div className="lp-container faq-centered">
            <div className="faq-centered-heading reveal">
              <span className="eyebrow">Sebelum kita berdiskusi</span>
              <h2>
                Beberapa hal
                <br />
                yang sering ditanyakan.
              </h2>
            </div>
            <div className="faq-list faq-centered-list reveal">
              {faqs.map(([question, answer]) => (
                <details key={question}>
                  <summary>
                    {question}
                    <span className="faq-plus" aria-hidden="true" />
                  </summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section id="diskusi" className="final-section">
          <div className="lp-container final-inner">
            <span className="eyebrow">Mulai dari satu percakapan</span>
            <h2>
              Ada alur kerja yang mulai
              <br />
              terlalu rumit untuk spreadsheet?
            </h2>
            <p>
              Ceritakan proses yang paling sering membuat tim bolak-balik
              mengecek file. Cukup obrolan santai 15 menit tanpa perlu dokumen
              teknis atau data rahasia.
            </p>
            <ContactButton source="final_whatsapp_click" arrow>
              Diskusikan via WhatsApp
            </ContactButton>
            <span className="final-microcopy">
              Diskusi awal membahas alur umum. Data keuangan dan file sensitif
              internal tidak diperlukan.
            </span>
          </div>
        </section>
      </main>
      <footer className="site-footer">
        <div className="lp-container footer-top">
          <div>
            <Brand footer />
            <p>{site.descriptor}</p>
          </div>
          <div className="footer-links">
            <span>Indonesia · By appointment</span>
            <button
              type="button"
              onClick={() => privacyRef.current?.showModal()}
            >
              Privasi
            </button>
            <button
              type="button"
              onClick={() => openContact("footer_whatsapp_click")}
            >
              WhatsApp
              <Icon name="arrow" />
            </button>
            {site.email && <a href={`mailto:${site.email}`}>Email</a>}
            {site.linkedin && (
              <a href={site.linkedin} target="_blank" rel="noreferrer">
                LinkedIn
              </a>
            )}
          </div>
        </div>
        <div className="lp-container footer-bottom">
          <span>
            © 2026 {site.name} · Business Systems & Controls Consulting
          </span>
          <span>Seluruh hak cipta dilindungi.</span>
        </div>
      </footer>
      {stickyCTA && (
        <div className="mobile-sticky">
          <ContactButton source="mobile_whatsapp_click">
            Diskusikan Proses Anda
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
          <form method="dialog">
            <button
              className="icon-button dialog-close"
              aria-label="Tutup kebijakan privasi"
            >
              <Icon name="close" />
            </button>
          </form>
          <span className="eyebrow">Kebijakan Privasi</span>
          <h2 id="privacy-title">Privasi & Kerahasiaan Data</h2>
          <p>
            Kami menghargai kerahasiaan proses bisnis, sistem operasional, dan
            data keuangan Anda. Halaman ini tidak mengumpulkan data pribadi
            tanpa persetujuan Anda.
          </p>
          <p>
            Seluruh diskusi awal dan informasi alur kerja yang Anda bagikan
            diperlakukan secara rahasia dan profesional.
          </p>
          <p>
            Saat Anda menghubungi kami melalui WhatsApp atau email, pesan baru
            terkirim setelah Anda memvalidasi dan mengirimkannya secara mandiri.
          </p>
          <p>
            Kerahasiaan alur kerja, data keuangan, dan sistem internal klien
            terlindungi oleh perjanjian kerahasiaan (NDA) pada setiap sesi
            implementasi.
          </p>
        </div>
      </dialog>
    </ContactContext.Provider>
  );
}
