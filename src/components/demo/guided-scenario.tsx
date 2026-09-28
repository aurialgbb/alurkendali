"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  scenarios,
  scenarioStep,
  isComplete,
  roleLabels,
  type ScenarioId,
  type ScenarioAction,
} from "@/lib/demo-scenarios";
import { useGuided } from "@/lib/guided-store";
import { site } from "@/lib/site";
import {
  FinanceWorkbench,
  InventoryWorkbench,
  ProcurementWorkbench,
  OperationsWorkbench,
} from "./workbenches";
import { ResetScenario } from "./reset-scenario";
const guidance = {
  finance: [
    "Gunakan pengajuan dan nota contoh yang tersedia. Anda bisa menambahkan catatan sebelum mengirim.",
    "Periksa kebutuhan cabang dan nilai pada nota. Sebagai Manager, Anda menentukan apakah biaya dapat disetujui.",
    "Cocokkan pengajuan Rp350.000 dengan nota. Catat pembayaran simulasi setelah keduanya sesuai.",
    "Pengajuan, persetujuan, dan pembayaran kini bisa ditelusuri dari dokumen yang sama.",
  ],
  inventory: [
    "Tentukan jumlah kertas yang akan dikirim. Saldo awal gudang 100 rim dan cabang 10 rim.",
    "Sebagai Manager cabang, konfirmasi barang yang tiba. Saldo dalam perjalanan akan berpindah ke cabang.",
    "Perpindahan barang selesai. Total persediaan tetap 110 rim, dengan saldo setiap lokasi yang diperbarui.",
  ],
  procurement: [
    "Periksa kebutuhan 2 scanner senilai Rp3.200.000. Persetujuan ini menerbitkan pesanan contoh.",
    "Sebagai Staf, catat 2 scanner yang diterima cabang. Dokumen penerimaan menjadi pembanding tagihan.",
    "Bandingkan PO, penerimaan, dan tagihan. Coba tagihan berselisih untuk melihat mengapa pembayaran ditahan.",
    "Jumlah barang dan nominal sudah cocok. Sekarang Anda dapat mencatat pembayaran simulasi.",
    "Pembayaran memiliki dasar yang dapat ditelusuri: pesanan, penerimaan, dan tagihan yang cocok.",
  ],
  operations: [
    "Centang setiap pemeriksaan yang sudah dilakukan. Progress berubah mengikuti pekerjaan yang selesai.",
    "Empat pemeriksaan selesai. Simpan laporan agar tim berikutnya dapat melihat kesiapan cabang.",
    "Laporan cabang tersimpan bersama pelaksana, waktu, dan riwayat setiap pemeriksaan.",
  ],
};
export default function GuidedScenario({ id }: { id: ScenarioId }) {
  const { states, loaded, notice, act, reset } = useGuided();
  const s = states[id];
  const c = scenarios[id];
  const step = scenarioStep(id, s);
  const complete = isComplete(id, s);
  const required = c.roles[step];
  const needsRole = s.started && !complete && s.role !== required;
  const heading = useRef<HTMLHeadingElement>(null);
  const focusKey = `${step}:${s.role}:${s.started}`;
  const lastStep = useRef(focusKey);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (lastStep.current !== focusKey) {
      lastStep.current = focusKey;
      heading.current?.focus();
    }
  }, [focusKey]);
  const enabled = loaded && s.started && !needsRole && !complete;
  const action = (a: ScenarioAction) => act(id, a);
  const Workbench = {
    finance: FinanceWorkbench,
    inventory: InventoryWorkbench,
    procurement: ProcurementWorkbench,
    operations: OperationsWorkbench,
  }[id];
  const configuredNumber = site.whatsappNumber.replace(/[^0-9]/g, "");
  const waNumber = /^[1-9]\d{7,14}$/.test(configuredNumber)
    ? configuredNumber
    : "";
  const contact = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(`Halo, saya sudah mencoba demo ${c.label} Alur Kendali. Saya ingin mendiskusikan proses ${c.label} di perusahaan kami.`)}`
    : `/?demo=${id}#diskusi`;
  if (!loaded)
    return (
      <div className="demo-loading" role="status">
        Menyiapkan kasus {c.label}…
      </div>
    );
  return (
    <div className="guided-scenario">
      <div className="scenario-breadcrumb">
        <Link href="/demo">Semua kasus</Link>
        <span>/</span>
        <span>{c.label}</span>
        <div>
          <Link href={`/demo/${id}?mode=explore`}>Jelajahi sendiri</Link>
          <ResetScenario
            label={c.label}
            onReset={() => {
              reset(id);
              setRevision((v) => v + 1);
            }}
          />
        </div>
      </div>
      <header className="scenario-heading">
        <div>
          <p className="demo-eyebrow">
            Demo {c.label} · PT Selaras Niaga, perusahaan contoh
          </p>
          <h1>{c.title}</h1>
          <p>{c.description}</p>
        </div>
        <span className="scenario-mode">
          {complete ? "✓ Skenario selesai" : "Panduan interaktif"}
        </span>
      </header>
      <ol className="scenario-progress" aria-label="Tahap skenario">
        {c.steps.map((label, i) => (
          <li
            key={label}
            className={i < step ? "is-done" : i === step ? "is-active" : ""}
            aria-current={i === step ? "step" : undefined}
          >
            <span>{i < step ? "✓" : String(i + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
          </li>
        ))}
      </ol>
      {notice && (
        <p className="demo-storage-notice" role="status">
          {notice}
        </p>
      )}
      <div className="scenario-layout">
        <aside className={`scenario-guide ${complete ? "guide-complete" : ""}`}>
          <span className="guide-step">
            {complete
              ? "Hasil yang bisa ditelusuri"
              : `Langkah ${step + 1} dari ${c.steps.length - 1}`}
          </span>
          <h2 ref={heading} tabIndex={-1}>
            {complete
              ? "Alurnya selesai. Buktinya tersimpan."
              : !s.started
                ? "Mari coba kasus ini."
                : needsRole
                  ? `Sekarang giliran ${roleLabels[required]}.`
                  : c.steps[step]}
          </h2>
          <p>{guidance[id][step]}</p>
          <div className="guide-role">
            <span>Anda berperan sebagai</span>
            <strong>{roleLabels[s.role]}</strong>
            <small>
              {id === "inventory" && s.role === "staff"
                ? "Tim Gudang Pusat"
                : s.role === "manager"
                  ? "Penanggung jawab cabang"
                  : s.role === "finance"
                    ? "Tim pemeriksa keuangan"
                    : "Tim operasional cabang"}
            </small>
          </div>
          {!s.started && (
            <button
              className="demo-primary"
              onClick={() => act(id, { type: "start" })}
            >
              Mulai demo {c.label}
              <span aria-hidden="true">→</span>
            </button>
          )}
          {needsRole && (
            <button
              className="demo-primary"
              onClick={() => act(id, { type: "role", role: required })}
            >
              Lanjut sebagai {roleLabels[required]}
              <span aria-hidden="true">→</span>
            </button>
          )}
          {enabled && (
            <div className="guide-next">
              <span aria-hidden="true">↳</span>
              <p>
                {id === "operations" && step === 0
                  ? "Tandai pemeriksaan pada checklist di area kerja."
                  : "Periksa area kerja, lalu gunakan tombol tindakan di bawah dokumen."}
              </p>
            </div>
          )}
          {complete && (
            <div className="guide-result-links">
              <Link
                className="demo-primary"
                href={`/demo/reporting?scenario=${id}&doc=${c.code}`}
              >
                Lihat riwayat dokumen
              </Link>
              <Link className="demo-secondary" href="/demo">
                Coba kategori lain
              </Link>
              <a
                className="demo-text-link"
                href={contact}
                target={waNumber ? "_blank" : undefined}
                rel={waNumber ? "noopener noreferrer" : undefined}
              >
                Diskusikan proses {c.label}
              </a>
            </div>
          )}
          <p className="guide-disclaimer">
            Data dan tindakan adalah simulasi. Tidak ada transaksi atau
            pengiriman barang nyata.
          </p>
        </aside>
        <div className="scenario-workspace">
          <div className="workspace-label">
            <span>{c.code}</span>
            <span>
              {complete
                ? "Selesai"
                : s.started
                  ? `Peran aktif: ${roleLabels[s.role]}`
                  : "Pratinjau kasus"}
            </span>
          </div>
          <div key={`${id}-${revision}`} className="workspace-content">
            <Workbench s={s} enabled={enabled} act={action} />
          </div>
          <div
            className="scenario-feedback"
            aria-live="polite"
            aria-atomic="true"
          >
            {s.error ? (
              <p role="alert" className="scenario-error">
                {s.error}
              </p>
            ) : s.events.length > 0 ? (
              <p className="scenario-success">
                ✓ {s.events[s.events.length - 1].action}
              </p>
            ) : null}
          </div>
          {s.finance.status === "rejected" && id === "finance" && (
            <div className="scenario-rejection">
              <h3>Pengajuan ditolak</h3>
              <p>{s.finance.reason}</p>
              <p>
                Keputusan dan alasannya tersimpan. Gunakan “Ulangi skenario”
                untuk mencoba alur persetujuan.
              </p>
              <Link href="/demo/reporting?scenario=finance&doc=EXP-DEMO-001">
                Lihat catatan keputusan
              </Link>
            </div>
          )}
        </div>
      </div>
      <section className="scenario-history">
        <div>
          <p className="demo-eyebrow">Jejak pekerjaan</p>
          <h2>Setiap tindakan punya catatan.</h2>
          <p>
            {s.events.length
              ? `${s.events.length} aktivitas pada ${c.code}.`
              : "Riwayat akan muncul setelah Anda melakukan tindakan pertama."}
          </p>
        </div>
        <ol>
          {s.events
            .slice(-4)
            .reverse()
            .map((e) => (
              <li key={e.id}>
                <span className="event-dot" />
                <div>
                  <strong>{e.action}</strong>
                  <span>
                    {roleLabels[e.actor]} ·{" "}
                    {new Date(e.at).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </li>
            ))}
        </ol>
      </section>
    </div>
  );
}
