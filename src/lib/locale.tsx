"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { localeCookie, pageCopy, translate, type Locale } from "./translate";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: <T>(value: T) => T;
};
const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const [locale, updateLocale] = useState(initialLocale);
  const pathname = usePathname();
  useEffect(() => {
    document.documentElement.lang = locale;
    const copy = pageCopy[locale];
    const demo = pathname.startsWith("/demo");
    document.title = demo ? copy.demoTitle : copy.title;
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute("content", demo ? copy.demoDescription : copy.description);
    document
      .querySelector('meta[property="og:title"]')
      ?.setAttribute("content", copy.ogTitle);
    document
      .querySelector('meta[property="og:description"]')
      ?.setAttribute("content", copy.ogDescription);
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute("content", locale === "id" ? "id_ID" : "en_GB");
  }, [locale, pathname]);
  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale(next) {
        updateLocale(next);
        try {
          document.cookie = `${localeCookie}=${next}; Max-Age=15552000; Path=/; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
        } catch {
          /* The selection remains usable for this session when cookies are blocked. */
        }
      },
      t<T>(text: T): T {
        return (typeof text === "string" ? translate(locale, text) : text) as T;
      },
    }),
    [locale],
  );
  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const value = useContext(LocaleContext);
  if (!value) throw new Error("LocaleProvider is required");
  return value;
}

export function LocalizedText({ children }: { children: string }) {
  const { t } = useLocale();
  return t(children);
}
