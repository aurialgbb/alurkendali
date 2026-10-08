"use client";
import { useEffect, useRef, useState } from "react";
import { m, useInView, useReducedMotion } from "motion/react";
import { useLocale } from "@/lib/locale";
import { ease } from "@/components/motion";

// Each problem plays a short scene once when it scrolls into view, so the visitor
// sees the failure (a mismatch, a late receipt, a buried approval, a silent edit)
// instead of only reading about it. Reduced motion shows the final frame.

function useScene(delay: number) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.6 });
  const reduced = useReducedMotion();
  const [done, setDone] = useState(false);
  useEffect(() => {
    if (!seen) return;
    const timer = window.setTimeout(() => setDone(true), reduced ? 0 : delay);
    return () => window.clearTimeout(timer);
  }, [seen, reduced, delay]);
  return { ref, seen, done };
}

export function ReconcileVisual() {
  const { t: tr } = useLocale();
  const { ref, seen, done } = useScene(1300);
  const rows = [
    ["Penjualan", "12.400.000", "12.400.000"],
    ["Biaya cabang", "8.150.000", "8.150.000"],
    ["Kas kecil", "3.200.000", "2.750.000"],
  ];
  return (
    <div className="pain-visual reconcile" ref={ref} aria-hidden="true">
      <div className="reconcile-head">
        <span />
        <span>{tr("Cabang")}</span>
        <span>{tr("Pusat")}</span>
      </div>
      {rows.map(([label, branch, center], index) => (
        <m.div
          key={label}
          className={`reconcile-row ${index === 2 && done ? "is-off" : ""}`}
          initial={{ opacity: 0, x: -10 }}
          animate={seen ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.4, delay: index * 0.18, ease }}
        >
          <span>{tr(label)}</span>
          <b>{branch}</b>
          <b>{center}</b>
        </m.div>
      ))}
      <m.div
        className="reconcile-gap"
        initial={{ opacity: 0, y: 6 }}
        animate={done ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, ease }}
      >
        {tr("Selisih Rp450.000, dicari ulang satu per satu")}
      </m.div>
      <small>{tr("Contoh angka")}</small>
    </div>
  );
}

export function ReceiptVisual() {
  const { t: tr } = useLocale();
  const { ref, seen, done } = useScene(1400);
  return (
    <div className="pain-visual receipt" ref={ref} aria-hidden="true">
      <m.div
        className="receipt-line is-paid"
        initial={{ opacity: 0, y: 6 }}
        animate={seen ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.4, ease }}
      >
        <span>{tr("Transfer keluar")}</span>
        <b>{"Rp1.200.000"}</b>
      </m.div>
      <div className={`receipt-line receipt-slot ${done ? "is-late" : ""}`}>
        <span>{tr("Nota")}</span>
        <m.b
          key={done ? "late" : "missing"}
          initial={{ opacity: 0, x: 8 }}
          animate={seen ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.35, delay: done ? 0 : 0.3, ease }}
        >
          {tr(done ? "Menyusul 3 hari kemudian" : "Belum ada")}
        </m.b>
      </div>
    </div>
  );
}

export function ChatVisual() {
  const { t: tr } = useLocale();
  const { ref, seen, done } = useScene(1500);
  const messages = [
    ["Oke, lanjut beli.", "approval"],
    ["Foto barangnya sudah?", ""],
    ["Sudah di grup sebelah", ""],
    ["Rapat jam 3 ya", ""],
    ["Siapa yang setujui ini?", "question"],
  ];
  return (
    <div className="pain-visual chat" ref={ref} aria-hidden="true">
      <m.div
        className="chat-stack"
        animate={{ y: done ? -78 : 0 }}
        transition={{ duration: 0.9, ease }}
      >
        {messages.map(([text, kind], index) => (
          <m.span
            key={text}
            className={`chat-bubble ${kind}`}
            initial={{ opacity: 0, y: 8 }}
            animate={seen ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.35, delay: index * 0.22, ease }}
          >
            {tr(text)}
          </m.span>
        ))}
      </m.div>
    </div>
  );
}

export function FormulaVisual() {
  const { t: tr } = useLocale();
  const { ref, seen, done } = useScene(1200);
  return (
    <div className="pain-visual formula" ref={ref} aria-hidden="true">
      <div className="formula-bar">
        <span>{"fx"}</span>
        <m.code
          key={done ? "after" : "before"}
          className={done ? "is-changed" : ""}
          initial={{ opacity: 0 }}
          animate={seen ? { opacity: 1 } : undefined}
          transition={{ duration: 0.3 }}
        >
          {done ? "=SUM(B2:B8)" : "=SUM(B2:B9)"}
        </m.code>
      </div>
      <m.span
        className="formula-history"
        initial={{ opacity: 0 }}
        animate={done ? { opacity: 1 } : undefined}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        {tr("Riwayat perubahan: tidak ada")}
      </m.span>
    </div>
  );
}
