import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import { LocaleProvider } from "@/lib/locale";
import { localeCookie, pageCopy } from "@/lib/translate";
import "./globals.css";
import "./landing.css";

const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = localFont({
  src: [
    { path: "./fonts/plus-jakarta-sans-latin-wght-normal.woff2", style: "normal" },
    { path: "./fonts/plus-jakarta-sans-latin-wght-italic.woff2", style: "italic" },
  ],
  weight: "200 800",
  variable: "--font-display",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const locale =
    (await cookies()).get(localeCookie)?.value === "en" ? "en" : "id";
  const copy = pageCopy[locale];
  return {
    title: copy.title,
    description: copy.description,
    icons: {
      icon: [
        { url: "/icon.png", sizes: "32x32", type: "image/png" },
        { url: "/icon.png", sizes: "192x192", type: "image/png" },
      ],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    },
    robots: { index: false, follow: false },
    openGraph: {
      title: copy.ogTitle,
      description: copy.ogDescription,
      locale: locale === "id" ? "id_ID" : "en_GB",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale =
    (await cookies()).get(localeCookie)?.value === "en" ? "en" : "id";
  return (
    <html lang={locale} className={`${inter.variable} ${plusJakartaSans.variable}`}>
      <body>
        <LocaleProvider initialLocale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
