import type { Metadata } from "next";
import { Suspense } from "react";
import { DemoProvider } from "@/lib/demo-store";
import { GuidedProvider } from "@/lib/guided-store";
import { DemoNav } from "./demo-nav";
import "./demo.css";
export const metadata: Metadata = {
  title: "Coba alur bisnis | Alur Kendali",
  description:
    "Demo terpandu Finance, Inventory, Procurement, dan Operations dengan data contoh.",
};
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <GuidedProvider>
        <div className="demo-shell">
          <Suspense
            fallback={<div className="demo-loading">Memuat navigasi demo…</div>}
          >
            <DemoNav />
          </Suspense>
          <main id="demo-content" className="demo-main">
            {children}
          </main>
        </div>
      </GuidedProvider>
    </DemoProvider>
  );
}
