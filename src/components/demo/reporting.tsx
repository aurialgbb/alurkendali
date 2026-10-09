"use client";
import { useLocale } from "@/lib/locale";
import { useState } from "react";
import Link from "next/link";
import { useGuided } from "@/lib/guided-store";
import { useDemo } from "@/lib/demo-store";
import { INITIAL_AUDIT_LOGS } from "@/lib/demo-data";
import { scenarioIds, scenarios, roleLabels } from "@/lib/demo-scenarios";
const INITIAL_LOG_IDS = new Set(INITIAL_AUDIT_LOGS.map((log) => log.id));
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

// Exploration events come in two shapes: seed text ("Hari ini, 10:30", "Kemarin,
// 21:00", "15 Sep, 16:45") and browser-local strings ("9/10/2026, 10.15.30").
// Both become a timestamp so rows sort newest first and read in one format.
function parseExploreTime(value: string) {
  const now = new Date();
  const day = (offset: number, h: string, mi: string) =>
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - offset,
      +h,
      +mi,
    ).getTime();
  let match = value.match(/^(Hari ini|Kemarin), (\d{1,2})[.:](\d{2})$/);
  if (match) return day(match[1] === "Kemarin" ? 1 : 0, match[2], match[3]);
  match = value.match(/^(\d{1,2}) (\w{3}), (\d{1,2})[.:](\d{2})$/);
  if (match) {
    const month = MONTHS.indexOf(match[2]);
    if (month >= 0)
      return new Date(
        now.getFullYear(),
        month,
        +match[1],
        +match[3],
        +match[4],
      ).getTime();
  }
  match = value.match(
    /^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s+(\d{1,2})[.:](\d{2})/,
  );
  if (match)
    return new Date(
      +match[3],
      +match[2] - 1,
      +match[1],
      +match[4],
      +match[5],
    ).getTime();
  return 0;
}

function relativeTime(at: number) {
  const date = new Date(at);
  const clock = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  ).getTime();
  if (at >= startOfToday) return `Hari ini, ${clock}`;
  if (at >= startOfToday - 86400000) return `Kemarin, ${clock}`;
  return `${date.getDate()} ${MONTHS[date.getMonth()]}, ${clock}`;
}

export default function Reporting({
  initialScenario,
  initialDocument,
}: {
  initialScenario?: string;
  initialDocument?: string;
}) {
  const { t: tr } = useLocale();
  const { states, loaded } = useGuided();
  const { auditLogs } = useDemo();
  const [category, setCategory] = useState(
    scenarioIds.some((id) => id === initialScenario) ? initialScenario! : "all",
  );
  const [query, setQuery] = useState(initialDocument ?? "");
  const [source, setSource] = useState("guided");
  const [notice, setNotice] = useState("");
  const guided = scenarioIds
    .flatMap((id) =>
      states[id].events.map((e) => ({
        key: e.id,
        module: id as string,
        code: e.code,
        action: tr(e.action),
        searchAction: e.action,
        actor: tr(roleLabels[e.actor]),
        date: relativeTime(Date.parse(e.at)),
        sort: e.at,
        href: `/demo/${id}?mode=guided`,
      })),
    )
    .sort((a, b) => b.sort.localeCompare(a.sort));
  const exploration = auditLogs
    .map((e) => {
      const at = parseExploreTime(e.timestamp);
      return {
        key: e.id,
        module: e.module as string,
        code: e.docCode,
        action: e.action === "Pengajuan ditolak" ? e.details : tr(e.details),
        searchAction: e.details,
        actor: e.user,
        date: at ? relativeTime(at) : e.timestamp,
        // Seed rows carry made-up relative times ("Hari ini, 10:30") that can be later
        // than the visitor's own actions, so the visitor's actions always sort first.
        sort: `${INITIAL_LOG_IDS.has(e.id) ? 0 : 1}${String(at).padStart(15, "0")}`,
        href: `/demo/${e.module === "system" ? "overview" : e.module}?mode=explore`,
      };
    })
    .sort((a, b) => b.sort.localeCompare(a.sort));
  const moduleLabel = (module: string) =>
    scenarioIds.find((id) => id === module)
      ? scenarios[module as (typeof scenarioIds)[number]].label
      : "Sistem";
  const records = source === "guided" ? guided : exploration;
  const filtered = records.filter(
    (e) =>
      (category === "all" || e.module === category) &&
      `${e.code} ${e.action} ${e.searchAction} ${e.actor}`
        .toLocaleLowerCase("id-ID")
        .includes(query.toLocaleLowerCase("id-ID")),
  );
  function download() {
    const cell = (value: string) =>
      `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const csv = [
      ["Dokumen", "Modul", "Aktivitas", "Pelaksana", "Waktu"].map(tr).join(","),
      ...filtered.map((e) =>
        [e.code, moduleLabel(e.module), e.action, e.actor, e.date]
          .map(cell)
          .join(","),
      ),
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = `alur-kendali-riwayat-${source}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setNotice(`${filtered.length} aktivitas diekspor ke CSV.`);
  }
  if (!loaded)
    return (
      <p className="demo-loading" role="status">
        {tr("Memuat riwayat demo…")}
      </p>
    );
  return (
    <div className="demo-report">
      <header className="report-heading">
        <div>
          <p className="demo-eyebrow">{tr("Riwayat")}</p>
          <h1>{tr("Siapa melakukan apa, dan kapan.")}</h1>
          <p>
            {tr(
              "Setiap tindakan di demo tercatat di sini. Cari per dokumen atau unduh sebagai CSV.",
            )}
          </p>
        </div>
        <button
          className="demo-secondary"
          disabled={!filtered.length}
          onClick={download}
        >
          {tr("Unduh riwayat CSV")}
        </button>
      </header>
      <div className="report-filters">
        <label className="demo-field">
          {tr("Sumber data")}
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setQuery("");
            }}
          >
            <option value="guided">{tr("Demo terpandu")}</option>
            <option value="exploration">{tr("Mode bebas")}</option>
          </select>
        </label>
        <label className="demo-field">
          {tr("Kategori")}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">{tr("Semua kategori")}</option>
            {scenarioIds.map((id) => (
              <option key={id} value={id}>
                {tr(scenarios[id].label)}
              </option>
            ))}
          </select>
        </label>
        <label className="demo-field report-search">
          {tr("Cari dokumen atau aktivitas")}
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={tr("Contoh: EXP-DEMO-001")}
          />
        </label>
      </div>
      <div className="report-count">
        <span>
          {filtered.length}
          {tr(" aktivitas")}
        </span>
        {(query || category !== "all") && (
          <button
            className="demo-text-button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            {tr("Hapus filter")}
          </button>
        )}
      </div>
      {notice && (
        <p role="status" className="scenario-success">
          {tr(notice)}
        </p>
      )}
      {filtered.length ? (
        <ol className="report-records">
          {filtered.map((e) => (
            <li key={e.key}>
              <div className="report-record-code">
                <Link href={e.href}>{tr(e.code || "Catatan sistem")}</Link>
                <span>{tr(moduleLabel(e.module))}</span>
              </div>
              <div className="report-record-action">
                <p>{e.action}</p>
                <span>{tr(e.actor)}</span>
              </div>
              <time>{tr(e.date)}</time>
            </li>
          ))}
        </ol>
      ) : (
        <div className="report-empty">
          <h2>
            {tr(
              records.length
                ? "Tidak ada aktivitas yang cocok."
                : "Riwayat dimulai dari tindakan pertama.",
            )}
          </h2>
          <p>
            {tr(
              records.length
                ? "Ubah kata pencarian atau hapus filter untuk melihat catatan lainnya."
                : "Coba ajukan biaya, kirim barang, atau isi checklist. Tindakan Anda akan tercatat di sini.",
            )}
          </p>
          <Link href="/demo">{tr("Pilih kasus demo")}</Link>
        </div>
      )}
      <p className="report-footnote">
        {tr(
          "Riwayat demo hanya disimpan di browser ini. Kalau sebuah kasus diulang, riwayat kasus itu ikut terhapus.",
        )}
      </p>
    </div>
  );
}
