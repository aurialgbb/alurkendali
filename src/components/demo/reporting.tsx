"use client";
import { useState } from "react";
import Link from "next/link";
import { useGuided } from "@/lib/guided-store";
import { useDemo } from "@/lib/demo-store";
import { scenarioIds, scenarios, roleLabels } from "@/lib/demo-scenarios";
export default function Reporting({
  initialScenario,
  initialDocument,
}: {
  initialScenario?: string;
  initialDocument?: string;
}) {
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
        action: e.action,
        actor: roleLabels[e.actor],
        date: new Date(e.at).toLocaleString("id-ID"),
        sort: e.at,
        href: `/demo/${id}?mode=guided`,
      })),
    )
    .sort((a, b) => b.sort.localeCompare(a.sort));
  const exploration = auditLogs.map((e) => ({
    key: e.id,
    module: e.module as string,
    code: e.docCode,
    action: e.details,
    actor: e.user,
    date: e.timestamp,
    sort: "",
    href: `/demo/${e.module === "system" ? "overview" : e.module}?mode=explore`,
  }));
  const records = source === "guided" ? guided : exploration;
  const filtered = records.filter(
    (e) =>
      (category === "all" || e.module === category) &&
      `${e.code} ${e.action} ${e.actor}`
        .toLocaleLowerCase("id-ID")
        .includes(query.toLocaleLowerCase("id-ID")),
  );
  function download() {
    const cell = (value: string) =>
      `"${(/^[=+@\-\t\r]/.test(value) ? "'" + value : value).replaceAll('"', '""')}"`;
    const csv = [
      "Dokumen,Modul,Aktivitas,Pelaksana,Waktu",
      ...filtered.map((e) =>
        [e.code, e.module, e.action, e.actor, e.date].map(cell).join(","),
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
        Memuat riwayat demo…
      </p>
    );
  return (
    <div className="demo-report">
      <header className="report-heading">
        <div>
          <p className="demo-eyebrow">Riwayat & pelaporan</p>
          <h1>Dari hasil, kembali ke prosesnya.</h1>
          <p>Lihat siapa melakukan apa pada setiap dokumen simulasi.</p>
        </div>
        <button
          className="demo-secondary"
          disabled={!filtered.length}
          onClick={download}
        >
          Unduh riwayat CSV
        </button>
      </header>
      <div className="report-filters">
        <label className="demo-field">
          Sumber data
          <select
            value={source}
            onChange={(e) => {
              setSource(e.target.value);
              setQuery("");
            }}
          >
            <option value="guided">Demo terpandu</option>
            <option value="exploration">Mode eksplorasi</option>
          </select>
        </label>
        <label className="demo-field">
          Kategori
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">Semua kategori</option>
            {scenarioIds.map((id) => (
              <option key={id} value={id}>
                {scenarios[id].label}
              </option>
            ))}
          </select>
        </label>
        <label className="demo-field report-search">
          Cari dokumen atau aktivitas
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contoh: EXP-DEMO-001"
          />
        </label>
      </div>
      <div className="report-count">
        <span>{filtered.length} aktivitas</span>
        {(query || category !== "all") && (
          <button
            className="demo-text-button"
            onClick={() => {
              setQuery("");
              setCategory("all");
            }}
          >
            Hapus filter
          </button>
        )}
      </div>
      {notice && (
        <p role="status" className="scenario-success">
          {notice}
        </p>
      )}
      {filtered.length ? (
        <ol className="report-records">
          {filtered.map((e) => (
            <li key={e.key}>
              <div className="report-record-code">
                <Link href={e.href}>{e.code || "Catatan sistem"}</Link>
                <span>{e.module}</span>
              </div>
              <div className="report-record-action">
                <p>{e.action}</p>
                <span>{e.actor}</span>
              </div>
              <time>{e.date}</time>
            </li>
          ))}
        </ol>
      ) : (
        <div className="report-empty">
          <h2>
            {records.length
              ? "Tidak ada aktivitas yang cocok."
              : "Riwayat dimulai dari tindakan pertama."}
          </h2>
          <p>
            {records.length
              ? "Ubah kata pencarian atau hapus filter untuk melihat catatan lainnya."
              : "Coba pengajuan biaya, kirim barang, atau isi checklist. Tindakan Anda akan tercatat di sini."}
          </p>
          <Link href="/demo">Pilih kasus demo →</Link>
        </div>
      )}
      <p className="report-footnote">
        Catatan disimpan pada browser ini untuk keperluan demo. Mengulang
        skenario akan menghapus riwayat skenario tersebut.
      </p>
    </div>
  );
}
