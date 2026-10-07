"use client";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { useGuided } from "@/lib/guided-store";
import { useDemo } from "@/lib/demo-store";
import {
  scenarioIds,
  scenarios,
  scenarioStep,
  isComplete,
} from "@/lib/demo-scenarios";
export default function ManagementOverview() {
  const { t: tr } = useLocale();
  const { states, loaded } = useGuided();
  const { expenses, procurement, inventory } = useDemo();
  if (!loaded)
    return (
      <p className="demo-loading" role="status">
        {tr("Memuat ringkasan…")}
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
          <p className="demo-eyebrow">{tr("Ringkasan manajemen")}</p>
          <h1>
            {tr("Lihat hasil dari proses")}
            <br />
            {tr("yang sudah Anda coba.")}
          </h1>
          <p>
            {tr("Angka di bawah mengikuti tindakan Anda pada demo terpandu.")}
          </p>
        </div>
        <Link className="demo-secondary" href="/demo">
          {tr("Pilih kasus demo")}
        </Link>
      </header>
      <dl className="management-metrics">
        <div>
          <dt>{tr("Skenario selesai")}</dt>
          <dd>
            {tr(completed)}
            <span>{"/ 4"}</span>
          </dd>
        </div>
        <div>
          <dt>{tr("Pembayaran simulasi tercatat")}</dt>
          <dd>
            {"Rp"}
            {tr(payment.toLocaleString("id-ID"))}
          </dd>
        </div>
        <div>
          <dt>{tr("Aktivitas dalam panduan")}</dt>
          <dd>{events.length}</dd>
        </div>
      </dl>
      <div className="management-columns">
        <section>
          <h2>{tr("Alur per kategori")}</h2>
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
                          : "Belum dicoba · Mulai panduan",
                    )}
                  </p>
                </div>
                <span aria-hidden="true">{"→"}</span>
              </Link>
            ))}
          </div>
        </section>
        <section>
          <div className="report-section-title">
            <h2>{tr("Aktivitas terakhir")}</h2>
            <Link href="/demo/reporting">{tr("Lihat semua")}</Link>
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
                {tr("Coba satu skenario. Setiap tindakan akan muncul di sini.")}
              </p>
              <Link href="/demo/finance?mode=guided">
                {tr("Mulai dari Finance →")}
              </Link>
            </div>
          )}
        </section>
      </div>
      <section className="exploration-summary">
        <h2>{tr("Data contoh di mode eksplorasi")}</h2>
        <p>
          {tr(
            "Terpisah dari panduan agar Anda dapat mencoba perubahan dengan bebas.",
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
