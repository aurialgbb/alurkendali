"use client";

import { useEffect, useRef, useState } from "react";

const steps = [
  {
    title: "Pengajuan",
    description: "Tim mengisi kebutuhan dan melampirkan dokumen pendukung.",
  },
  {
    title: "Persetujuan",
    description: "Atasan memeriksa pengajuan dan mencatat keputusannya.",
  },
  {
    title: "Cek bukti",
    description:
      "Finance mencocokkan pengajuan dengan invoice dan bukti transaksi.",
  },
  {
    title: "Laporan",
    description:
      "Hasilnya masuk ke laporan, lengkap dengan riwayat persetujuannya.",
  },
];

export default function ControlledFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [visible, setVisible] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(preference.matches);
    const syncVisibility = () => setPageVisible(!document.hidden);
    syncPreference();
    syncVisibility();
    preference.addEventListener("change", syncPreference);
    document.addEventListener("visibilitychange", syncVisibility);
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.15 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", syncPreference);
      document.removeEventListener("visibilitychange", syncVisibility);
    };
  }, []);

  useEffect(() => {
    if (!playing || !visible || !pageVisible || reducedMotion) return;
    const timer = window.setTimeout(
      () => setPhase((current) => (current + 1) % 5),
      phase === 4 ? 2400 : 1500,
    );
    return () => window.clearTimeout(timer);
  }, [phase, playing, visible, pageVisible, reducedMotion]);

  const current = reducedMotion ? 4 : phase;
  const complete = current === 4;

  return (
    <div
      ref={ref}
      className="after-column controlled-sequence"
      data-phase={current}
      data-playing={playing && !reducedMotion}
    >
      <div className="sequence-header">
        <span className="comparison-label">Dengan alur yang terhubung</span>
        {!reducedMotion && (
          <button
            type="button"
            className="sequence-toggle"
            aria-label={playing ? "Jeda animasi" : "Putar animasi"}
            title={playing ? "Jeda animasi" : "Putar animasi"}
            aria-pressed={!playing}
            onClick={() => setPlaying((value) => !value)}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              {playing ? (
                <path d="M5 3v10M11 3v10" />
              ) : (
                <path d="m5 3 7 5-7 5Z" />
              )}
            </svg>
          </button>
        )}
      </div>
      <h3>Dari pengajuan sampai laporan, statusnya bisa dicek.</h3>
      <ol
        className="after-flow"
        aria-label="Urutan proses: pengajuan, persetujuan, pemeriksaan bukti, dan laporan"
      >
        {steps.map((step, index) => {
          const done = index < current;
          const active = index === current;
          return (
            <li
              key={step.title}
              className={
                done ? "is-done" : active ? "is-current" : "is-waiting"
              }
              aria-current={active ? "step" : undefined}
            >
              <span className="sequence-node" aria-hidden="true">
                {done ? (
                  <svg viewBox="0 0 24 24">
                    <path d="m5 12 4 4L19 6" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <strong>{step.title}</strong>
              <small>
                {done ? "Selesai" : active ? "Berjalan" : "Menunggu"}
              </small>
            </li>
          );
        })}
      </ol>
      <div className={`sequence-explanation ${complete ? "is-complete" : ""}`}>
        <span>
          {complete ? "Semua tahap selesai" : `Langkah ${current + 1} dari 4`}
        </span>
        <p>
          {complete
            ? "Pengajuan selesai. Dokumen dan riwayatnya tetap bisa ditelusuri saat dibutuhkan."
            : steps[current].description}
        </p>
      </div>
      <p className="sequence-note">
        Contoh alur · Setiap keputusan dan perubahan tercatat.
      </p>
    </div>
  );
}
