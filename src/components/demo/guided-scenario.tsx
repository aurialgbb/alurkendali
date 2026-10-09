"use client";
import { useLocale } from "@/lib/locale";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "motion/react";
import {
  scenarios,
  scenarioStep,
  isComplete,
  roleLabels,
  type ScenarioId,
  type ScenarioAction,
} from "@/lib/demo-scenarios";
import { useGuided } from "@/lib/guided-store";
import { ease } from "@/components/motion";
import {
  FinanceWorkbench,
  InventoryWorkbench,
  ProcurementWorkbench,
  OperationsWorkbench,
} from "./workbenches";
import { ResetScenario } from "./reset-scenario";
import CastStrip, { HANDOFF_MS } from "./cast-strip";
import OwnerView from "./owner-view";
import DemoContactLink from "./contact-link";

const guidance = {
  finance: [
    "Pengajuan dan nota contoh sudah disiapkan. Tambahkan catatan kalau perlu, lalu kirim.",
    "Sekarang Anda Manager. Lihat kebutuhan cabang dan nilai notanya, lalu putuskan: setujui, atau tolak dengan alasan.",
    "Sekarang Anda Finance. Cocokkan nilai pengajuan Rp350.000 dengan notanya, lalu catat pembayarannya.",
    "Pengajuan, persetujuan, dan pembayaran bisa ditelusuri dari satu dokumen.",
  ],
  inventory: [
    "Tentukan berapa rim kertas yang dikirim. Gudang punya 100 rim, cabang 10 rim.",
    "Sekarang Anda Manager cabang. Konfirmasi barang yang sampai, lalu saldonya pindah ke cabang.",
    "Barang sudah sampai. Totalnya tetap 110 rim, hanya lokasinya yang berubah.",
  ],
  procurement: [
    "Cabang butuh 2 scanner senilai Rp3.200.000. Setujui pesanannya supaya PO terbit.",
    "Sekarang Anda Staf cabang. Catat 2 scanner yang diterima. Catatan ini nanti jadi pembanding tagihan.",
    "Tagihan supplier sudah masuk. Cocokkan dengan PO dan penerimaan barang sebelum dibayar.",
    "Tiga dokumen sudah cocok. Sekarang pembayarannya boleh dicatat.",
    "Pembayaran ini punya dasar yang jelas: pesanan, penerimaan, dan tagihan yang cocok.",
  ],
  operations: [
    "Centang pemeriksaan yang sudah dikerjakan. Setiap centang langsung tercatat dengan nama dan jamnya.",
    "Empat pemeriksaan selesai. Simpan laporannya supaya shift berikutnya tahu cabang sudah siap.",
    "Laporan cabang tersimpan, lengkap dengan siapa yang memeriksa dan kapan.",
  ],
};

const handoffNoun: Record<ScenarioId, string> = {
  finance: "Pengajuan",
  inventory: "Barang",
  procurement: "Pekerjaan",
  operations: "Pekerjaan",
};

const time = (at: string) =>
  new Date(at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

export default function GuidedScenario({ id }: { id: ScenarioId }) {
  const { t: tr } = useLocale();
  const { states, loaded, notice, act, reset } = useGuided();
  const prefersReduced = useReducedMotion();
  const s = states[id];
  const c = scenarios[id];
  const step = scenarioStep(id, s);
  const complete = isComplete(id, s);
  const required = c.roles[step];
  const needsRole = s.started && !complete && s.role !== required;
  const heading = useRef<HTMLHeadingElement>(null);
  const ownerHeading = useRef<HTMLHeadingElement>(null);
  const focusKey = `${step}:${s.role}:${s.started}`;
  const lastStep = useRef(focusKey);
  const wasComplete = useRef(complete);
  const [revision, setRevision] = useState(0);

  // Keep screen-reader focus on the guide without scrolling the page away from the
  // document the visitor just changed.
  useEffect(() => {
    if (lastStep.current !== focusKey) {
      lastStep.current = focusKey;
      if (!complete) heading.current?.focus({ preventScroll: true });
    }
  }, [focusKey, complete]);

  // Finishing a scenario brings the owner's view into sight once.
  useEffect(() => {
    if (complete && !wasComplete.current) {
      ownerHeading.current?.focus({ preventScroll: true });
      ownerHeading.current
        ?.closest("section")
        ?.scrollIntoView({
          behavior: prefersReduced ? "auto" : "smooth",
          block: "start",
        });
    }
    wasComplete.current = complete;
  }, [complete, prefersReduced]);

  // Work passes to the next person by itself: the cast strip animates the document
  // travelling to them, then the next role takes over. Reduced motion skips the wait.
  // `act` is a new function every render; the ref keeps the timer from restarting.
  const actRef = useRef(act);
  useEffect(() => {
    actRef.current = act;
  });
  useEffect(() => {
    if (!loaded || !needsRole) return;
    const timer = window.setTimeout(
      () => actRef.current(id, { type: "role", role: required }),
      prefersReduced ? 0 : HANDOFF_MS,
    );
    return () => window.clearTimeout(timer);
  }, [loaded, needsRole, required, id, prefersReduced]);

  const enabled = loaded && s.started && !needsRole && !complete;
  const action = (a: ScenarioAction) => act(id, a);
  const Workbench = {
    finance: FinanceWorkbench,
    inventory: InventoryWorkbench,
    procurement: ProcurementWorkbench,
    operations: OperationsWorkbench,
  }[id];
  const rejected = id === "finance" && s.finance.status === "rejected";
  const lastEvent = s.events[s.events.length - 1];
  const procurementBlocked = id === "procurement" && s.procurement.mismatch;

  if (!loaded)
    return (
      <div className="demo-loading" role="status">
        {tr("Menyiapkan kasus ")}
        {tr(c.label)}
        {"…"}
      </div>
    );

  const restart = () => {
    reset(id);
    setRevision((v) => v + 1);
  };

  return (
    <div className="guided-scenario">
      <div className="scenario-breadcrumb">
        <Link href="/demo">{tr("Semua kasus")}</Link>
        <span aria-hidden="true">{"/"}</span>
        <span>{tr(c.label)}</span>
        <div>
          <ResetScenario label={c.label} onReset={restart} />
        </div>
      </div>
      <header className="scenario-heading">
        <p className="demo-eyebrow">
          {"Demo "}
          {tr(c.label)}
          {tr(" · PT Selaras Niaga")}
        </p>
        <h1>{tr(c.title)}</h1>
        <p>{tr(c.description)}</p>
      </header>
      <CastStrip
        roles={c.roles}
        active={s.role}
        handoffTo={needsRole ? required : null}
        started={s.started}
        complete={complete}
      />
      <ol className="scenario-progress" aria-label={tr("Tahap skenario")}>
        {c.steps.map((label, i) => {
          const last = i === c.steps.length - 1;
          return (
            <li
              key={label}
              className={i < step ? "is-done" : i === step ? "is-active" : ""}
              aria-current={i === step ? "step" : undefined}
            >
              <span>
                {i < step || (last && complete) ? "✓" : last ? "" : i + 1}
              </span>
              <strong>{tr(label)}</strong>
            </li>
          );
        })}
      </ol>
      {notice && (
        <p className="demo-storage-notice" role="status">
          {tr(notice)}
        </p>
      )}
      {complete && <OwnerView ref={ownerHeading} id={id} s={s} />}
      <div className="scenario-layout">
        {/* Desktop: guide and trail stay in view beside the document. Phones: the
            wrapper dissolves so the order becomes guide, document, trail. */}
        <div className="scenario-side">
          <aside
            className={`scenario-guide ${complete ? "guide-complete" : ""}`}
          >
            <span className="guide-step">
              {tr(
                complete
                  ? "Selesai"
                  : `Tahap ${Math.min(step + 1, c.steps.length - 1)} dari ${c.steps.length - 1}`,
              )}
            </span>
            <h2 ref={heading} tabIndex={-1}>
              {tr(
                complete
                  ? "Alurnya selesai, dan semua jejaknya tersimpan."
                  : rejected
                    ? "Pengajuan ditolak, alasannya tersimpan."
                    : !s.started
                      ? "Coba kasus ini sendiri."
                      : needsRole
                        ? `${handoffNoun[id]} diteruskan ke ${roleLabels[required]}.`
                        : c.steps[step],
              )}
            </h2>
            <p>
              {tr(
                rejected
                  ? "Manager menolak dengan alasan, dan keputusannya tercatat. Coba lagi untuk melihat jalur persetujuannya."
                  : procurementBlocked && !complete
                    ? "Tagihan Rp3.500.000 tidak cocok dengan PO, jadi pembayaran ditahan otomatis. Terima tagihan koreksi dari supplier untuk melanjutkan."
                    : guidance[id][step],
              )}
            </p>
            <div className="guide-role">
              <span>{tr("Anda sekarang")}</span>
              <strong>{tr(roleLabels[needsRole ? required : s.role])}</strong>
              <small>
                {tr(
                  id === "inventory" && s.role === "staff" && !needsRole
                    ? "Tim Gudang Pusat"
                    : (needsRole ? required : s.role) === "manager"
                      ? "Penanggung jawab cabang"
                      : (needsRole ? required : s.role) === "finance"
                        ? "Tim pemeriksa keuangan"
                        : "Tim operasional cabang",
                )}
              </small>
            </div>
            {!s.started && (
              <button
                className="demo-primary"
                onClick={() => act(id, { type: "start" })}
              >
                {tr("Mulai demo ")}
                {tr(c.label)}
              </button>
            )}
            {enabled && !rejected && (
              <p className="guide-next">
                {tr(
                  id === "operations" && step === 0
                    ? "Centang daftar di sebelah kanan."
                    : "Tombolnya ada di bawah dokumen.",
                )}
              </p>
            )}
            {rejected && (
              <div className="guide-result-links">
                <button
                  className="demo-primary"
                  onClick={() => {
                    restart();
                    act(id, { type: "start" });
                  }}
                >
                  {tr("Coba lagi dengan persetujuan")}
                </button>
                <DemoContactLink
                  scenario={id}
                  source="demo_rejection_contact"
                  className="demo-text-link"
                >
                  {tr(`Diskusikan proses ${c.label} di usaha Anda`)}
                </DemoContactLink>
              </div>
            )}
          </aside>
          <section className="guide-trail" aria-label={tr("Jejak pekerjaan")}>
            <h3>{tr("Jejak pekerjaan")}</h3>
            {s.events.length ? (
              <ol>
                <AnimatePresence initial={false}>
                  {s.events
                    .slice(-5)
                    .reverse()
                    .map((e) => (
                      <m.li
                        key={e.id}
                        initial={{
                          opacity: 0,
                          y: -8,
                          backgroundColor: "#eaf0ff",
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          backgroundColor: "#eaf0ff00",
                        }}
                        transition={{ duration: 0.6, ease }}
                      >
                        <span className="event-dot" />
                        <div>
                          <strong>{tr(e.action)}</strong>
                          <span>
                            {tr(roleLabels[e.actor])}
                            {" · "}
                            {tr(time(e.at))}
                          </span>
                        </div>
                      </m.li>
                    ))}
                </AnimatePresence>
              </ol>
            ) : (
              <p>
                {tr(
                  "Setiap tindakan Anda akan muncul di sini, lengkap dengan nama dan jamnya.",
                )}
              </p>
            )}
          </section>
        </div>
        <div className="scenario-workspace">
          <div key={`${id}-${revision}`} className="workspace-content">
            <Workbench s={s} enabled={enabled} act={action} />
          </div>
          {s.error && !procurementBlocked && (
            <p role="alert" className="scenario-error">
              {tr(s.error)}
            </p>
          )}
          <p className="sr-only" aria-live="polite" aria-atomic="true">
            {lastEvent ? tr(lastEvent.action) : ""}
          </p>
          {rejected && (
            <m.div
              className="scenario-rejection"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease }}
            >
              <h3>{tr("Pengajuan ditolak")}</h3>
              <p>{s.finance.reason}</p>
              <p>
                {tr(
                  "Keputusan dan alasannya tersimpan, jadi tidak ada yang hilang di chat.",
                )}
              </p>
              <Link href="/demo/reporting?scenario=finance&doc=EXP-DEMO-001">
                {tr("Lihat catatan keputusan")}
              </Link>
            </m.div>
          )}
        </div>
      </div>
    </div>
  );
}
