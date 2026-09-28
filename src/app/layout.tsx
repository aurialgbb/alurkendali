import type { Metadata } from "next";
import localFont from "next/font/local";
import { site } from "@/lib/site";
import "./globals.css";

const inter = localFont({
  src: "./fonts/inter-latin-variable.woff2",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${site.name} | Business Systems & Controls Consulting`,
  description:
    "Konsultasi dan implementasi sistem internal untuk workflow finance, inventory, procurement, approval, dan reporting yang semakin kompleks untuk spreadsheet.",
  icons: {
    icon: [
      { url: "/icon.png", sizes: "32x32", type: "image/png" },
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  robots: { index: false, follow: false },
  openGraph: {
    title: `${site.name} | Proses bisnis lebih terkendali`,
    description:
      "Ubah workflow finance dan operasional yang tersebar menjadi sistem internal yang terkontrol.",
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
