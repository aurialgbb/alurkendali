"use client";
import { forwardRef } from "react";
import Link from "next/link";
import { m, useReducedMotion } from "motion/react";
import { useLocale } from "@/lib/locale";
import {
  roleLabels,
  scenarios,
  type ScenarioId,
  type ScenarioState,
} from "@/lib/demo-scenarios";
import { ease } from "@/components/motion";
import DemoContactLink from "./contact-link";
import { rupiah } from "./workbenches";

const time = (at: string) =>
  new Date(at).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Facts for the owner's card, read only from the finished scenario state. */
function facts(id: ScenarioId, s: ScenarioState): [string, string][] {
  if (id === "finance")
    return [
      ["Nilai pengajuan", rupiah(350000)],
      ["Bukti", "Nota terlampir, nominal cocok"],
      ["Pembayaran", `Tercatat · ${s.finance.reference}`],
    ];
  if (id === "inventory")
    return [
      ["Dikirim", `${s.inventory.quantity} rim kertas A4`],
      ["Saldo cabang", `${s.inventory.destination} rim`],
      [
        "Total di semua lokasi",
        `${s.inventory.source + s.inventory.transit + s.inventory.destination} rim`,
      ],
    ];
  if (id === "procurement")
    return [
      ["Nilai pesanan", rupiah(3200000)],
      ["Barang diterima", `${s.procurement.received} unit`],
      [
        "Tagihan",
        s.events.some((e) => e.action.includes("tidak cocok"))
          ? "Tagihan selisih ditahan, versi koreksi dibayar"
          : "Cocok dengan pesanan",
      ],
    ];
  return [
    [
      "Pemeriksaan",
      `${s.operations.checks.filter(Boolean).length} dari 4 selesai`,
    ],
    ["Laporan", "Tersimpan"],
    ["Pelaksana", roleLabels[s.events[0]?.actor ?? "staff"]],
  ];
}

// The payoff of every scenario: the same work seen from the owner's chair, built
// from what the visitor just did, with the conversation as the next step.
const OwnerView = forwardRef<
  HTMLHeadingElement,
  { id: ScenarioId; s: ScenarioState }
>(function OwnerView({ id, s }, headingRef) {
  const { t: tr } = useLocale();
  // Reduced motion shows the finished card at once instead of fading text in.
  const reduced = useReducedMotion();
  const c = scenarios[id];
  return (
    <m.section
      className="owner-view"
      initial={reduced ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease }}
      aria-labelledby="owner-view-title"
    >
      <div className="owner-view-intro">
        <p className="demo-eyebrow">{tr("Tampilan owner")}</p>
        <h2 id="owner-view-title" ref={headingRef} tabIndex={-1}>
          {tr("Ini yang Anda lihat sebagai owner.")}
        </h2>
        <p>
          {tr(
            "Tanpa bertanya di grup, Anda tahu siapa mengerjakan apa, kapan, dan buktinya di mana.",
          )}
        </p>
        <div className="owner-view-actions">
          <DemoContactLink scenario={id} source="demo_owner_contact">
            {tr(`Diskusikan proses ${c.label} di usaha Anda`)}
          </DemoContactLink>
          <Link className="demo-secondary" href="/demo">
            {tr("Coba kasus lain")}
          </Link>
        </div>
      </div>
      <div className="owner-card">
        <div className="owner-card-head">
          <span>{c.code}</span>
          <span className="owner-status">{tr("✓ Selesai")}</span>
        </div>
        <h3>{tr(c.title)}</h3>
        <dl>
          {facts(id, s).map(([label, value]) => (
            <div key={label}>
              <dt>{tr(label)}</dt>
              <dd>{tr(value)}</dd>
            </div>
          ))}
        </dl>
        <ol className="owner-trail">
          {s.events.map((e, index) => (
            <m.li
              key={e.id}
              initial={reduced ? false : { opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: 0.3 + index * 0.12, ease }}
            >
              <time>{time(e.at)}</time>
              <span>
                <strong>{tr(roleLabels[e.actor])}</strong>
                {tr(e.action)}
              </span>
            </m.li>
          ))}
        </ol>
        <div className="owner-card-links">
          <Link href="/demo/overview">{tr("Tampilan owner lengkap")}</Link>
          <Link href={`/demo/reporting?scenario=${id}&doc=${c.code}`}>
            {tr("Riwayat dokumen")}
          </Link>
        </div>
      </div>
    </m.section>
  );
});
export default OwnerView;
