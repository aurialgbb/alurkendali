"use client";

import { useLocale } from "@/lib/locale";

export default function LanguageSwitch({
  className = "",
}: {
  className?: string;
}) {
  const { locale, setLocale } = useLocale();
  return (
    <div
      className={`language-switch ${className}`}
      role="group"
      aria-label={locale === "id" ? "Pilih bahasa" : "Choose language"}
    >
      {(["id", "en"] as const).map((value) => (
        <button
          key={value}
          type="button"
          lang={value}
          aria-label={value === "id" ? "Bahasa Indonesia" : "English"}
          aria-pressed={locale === value}
          onClick={() => setLocale(value)}
        >
          {value === "id" ? "ID" : "ENG"}
        </button>
      ))}
    </div>
  );
}
