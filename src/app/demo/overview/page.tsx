"use client";
import { useLocale } from "@/lib/locale";
import { useEffect, useState } from "react";
import Link from "next/link";
import { animate, useReducedMotion } from "motion/react";
import { useGuided } from "@/lib/guided-store";
import { useDemo } from "@/lib/demo-store";
import {
  scenarioIds,
  scenarios,
  scenarioStep,
  isComplete,
} from "@/lib/demo-scenarios";
import { ease } from "@/components/motion";
import DemoContactLink from "@/components/demo/contact-link";

/** Counts up once to a value that comes from the visitor's own demo activity. */
function CountUp({
  value,
  format = String,
}: {
  value: number;
  format?: (n: number) => string;
}) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(0);
  useEffect(() => {
    if (reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, {
      duration: 1,
      ease,
      onUpdate: (v) => setShown(Math.round(v)),
    });
    return () => controls.stop();
  }, [value, reduced]);
  return (
    <>
      <span aria-hidden="true">{format(shown)}</span>
      <span className="sr-only">{format(value)}</span>
    </>
  );
}

export default function ManagementOverview() {
  const { t: tr } = useLocale();
  const { states, loaded } = useGuided();
  const { expenses, procurement, inventory } = useDemo();
  if (!loaded)
    return (
      <p className="demo-loading" role="status">
        {tr("Memuat tampilan owner…")}
      </p>
    );
  const completed = scenarioIds.filter((id) =>
    isComplete(id, states[id]),
  ).length;
  const events = scenarioIds
    .flatMap((id) => states[id].events.map((e) => ({ ...e, scenario: id })))
    .sort((a, b) => b.at.localeCompare(a.at));
  const payment =
    (states.finance.finance.status === "paid" ? 350000 : 0) +
    (states.procurement.procurement.status === "paid" ? 3200000 : 0);
  return (
    <div className="management-overview">
      <header className="report-heading">
        <div>
          <p className="demo-eyebrow">{tr("Tampilan owner")}</p>
          <h1>{tr("Yang Anda lihat tiap pagi, tanpa bertanya di grup.")}</h1>
          <p>
            {tr("Angka di bawah dihitung dari tindakan Anda di demo terpandu.")}
          </p>
        </div>
        <div className="report-heading-actions">
          <DemoContactLink source="demo_overview_contact">
            {tr("Diskusikan proses Anda")}
          </DemoContactLink>
          <Link className="demo-secondary" href="/demo">
            {tr("Pilih kasus")}
          </Link>
        </div>
      </header>
      <dl className="management-metrics">
        <div>
          <dt>{tr("Kasus selesai")}</dt>
          <dd>
            <CountUp value={completed} />
            <span className="metric-of">{"/ 4"}</span>
          </dd>
        </div>
        <div>
          <dt>{tr("Pembayaran tercatat (simulasi)")}</dt>
          <dd>
            <CountUp
              value={payment}
              format={(n) => `Rp${n.toLocaleString("id-ID")}`}
            />
          </dd>
        </div>
        <div>
          <dt>{tr("Aktivitas tercatat")}</dt>
          <dd>
            <CountUp value={events.length} />
          </dd>
        </div>
      </dl>
      <div className="management-columns">
        <section>
          <h2>{tr("Status per kasus")}</h2>
          <div className="management-modules">
            {scenarioIds.map((id) => (
              <Link href={`/demo/${id}?mode=guided`} key={id}>
                <span>{tr(scenarios[id].label)}</span>
                <div>
                  <strong>{tr(scenarios[id].title)}</strong>
                  <p>
                    {tr(
                      isComplete(id, states[id])
                        ? "Selesai · Lihat hasil"
                        : states[id].started
                          ? `Tahap berikutnya: ${scenarios[id].steps[scenarioStep(id, states[id])]}`
                          : "Belum dicoba",
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="report-section-title">
            <h2>{tr("Aktivitas terakhir")}</h2>
            <Link href="/demo/reporting">{tr("Lihat semua riwayat")}</Link>
          </div>
          {events.length ? (
            <ol className="management-events">
              {events.slice(0, 5).map((e) => (
                <li key={e.id}>
                  <Link
                    href={`/demo/reporting?scenario=${e.scenario}&doc=${e.code}`}
                  >
                    <span>{e.code}</span>
                    <p>{tr(e.action)}</p>
                  </Link>
                </li>
              ))}
            </ol>
          ) : (
            <div className="report-empty">
              <h3>{tr("Belum ada aktivitas.")}</h3>
              <p>
                {tr(
                  "Coba satu kasus, dan setiap tindakannya akan muncul di sini.",
                )}
              </p>
              <Link href="/demo/finance?mode=guided">
                {tr("Mulai dari Finance")}
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="exploration-summary">
        <h2>{tr("Mode bebas")}</h2>
        <p>
          {tr(
            "Mau mencoba tanpa panduan? Di mode bebas Anda bisa membuka semua dokumen contoh, dari sudut pandang owner.",
          )}
        </p>
        <div>
          <Link href="/demo/finance?mode=explore">
            {expenses.length}
            {tr(" pengajuan biaya")}
          </Link>
          <Link href="/demo/inventory?mode=explore">
            {inventory.length}
            {tr(" catatan persediaan")}
          </Link>
          <Link href="/demo/procurement?mode=explore">
            {procurement.length}
            {tr(" dokumen pengadaan")}
          </Link>
        </div>
      </section>
    </div>
  );
}
