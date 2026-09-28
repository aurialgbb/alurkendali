"use client";
import { useEffect, useRef } from "react";
export function ResetScenario({
  label,
  onReset,
}: {
  label: string;
  onReset: () => void;
}) {
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
        Ulangi skenario
      </button>
      <dialog className="demo-dialog" ref={ref} aria-labelledby="reset-title">
        <h2 id="reset-title">Ulangi demo {label}?</h2>
        <p>
          Data dan riwayat skenario ini kembali ke awal. Progress kategori lain
          tetap tersimpan.
        </p>
        <div>
          <button
            autoFocus
            className="demo-secondary"
            onClick={() => ref.current?.close()}
          >
            Lanjutkan demo
          </button>
          <button
            className="demo-primary"
            onClick={() => {
              onReset();
              ref.current?.close();
            }}
          >
            Ya, ulangi
          </button>
        </div>
      </dialog>
    </>
  );
}
