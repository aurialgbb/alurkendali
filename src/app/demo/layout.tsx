import type { Metadata } from "next";
import { Suspense } from "react";
import { cookies } from "next/headers";
import { LocalizedText } from "@/lib/locale";
import { localeCookie, pageCopy } from "@/lib/translate";
import { DemoProvider } from "@/lib/demo-store";
import { GuidedProvider } from "@/lib/guided-store";
import { MotionProvider } from "@/components/motion";
import { DemoNav } from "./demo-nav";
import "./demo.css";
export async function generateMetadata(): Promise<Metadata> {
  const locale =
    (await cookies()).get(localeCookie)?.value === "en" ? "en" : "id";
  return {
    title: pageCopy[locale].demoTitle,
    description: pageCopy[locale].demoDescription,
  };
}
export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DemoProvider>
      <GuidedProvider>
        <MotionProvider>
          <div className="demo-shell">
            <Suspense
              fallback={
                <div className="demo-loading">
                  <LocalizedText>Memuat navigasi demo…</LocalizedText>
                </div>
              }
            >
              <DemoNav />
            </Suspense>
            <main id="demo-content" className="demo-main">
              {children}
            </main>
          </div>
        </MotionProvider>
      </GuidedProvider>
    </DemoProvider>
  );
}
