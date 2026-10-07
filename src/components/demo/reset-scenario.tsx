"use client";
import { useLocale } from "@/lib/locale";
import { useEffect, useRef } from "react";
export function ResetScenario({
  label,
  onReset,
}: {
  label: string;
  onReset: () => void;
}) {
  const { t: tr } = useLocale();
  const ref = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    const restore = () => trigger.current?.focus();
    dialog?.addEventListener("close", restore);
    return () => dialog?.removeEventListener("close", restore);
  }, []);
  return (
    <>
      <button
        ref={trigger}
        className="demo-text-button"
        onClick={() => ref.current?.showModal()}
      >
        {tr("Ulangi skenario")}
      </button>
      <dialog className="demo-dialog" ref={ref} aria-labelledby="reset-title">
        <h2 id="reset-title">
          {tr("Ulangi demo ")}
          {tr(label)}
          {"?"}
        </h2>
        <p>
          {tr(
            "Data dan riwayat skenario ini kembali ke awal. Progress kategori lain tetap tersimpan.",
          )}
        </p>
        <div>
          <button
            autoFocus
            className="demo-secondary"
            onClick={() => ref.current?.close()}
          >
            {tr("Lanjutkan demo")}
          </button>
          <button
            className="demo-primary"
            onClick={() => {
              onReset();
              ref.current?.close();
            }}
          >
            {tr("Ya, ulangi")}
          </button>
        </div>
      </dialog>
    </>
  );
}
