"use client";
import type { ReactNode } from "react";
import { useLocale } from "@/lib/locale";
import { contactHref } from "@/lib/site";
import { track } from "@/lib/track";
import { scenarios, type ScenarioId } from "@/lib/demo-scenarios";

/** "Discuss this" link used across the demo; carries the scenario the visitor tried. */
export default function DemoContactLink({
  scenario,
  source,
  className = "demo-primary",
  children,
}: {
  scenario?: ScenarioId;
  source: string;
  className?: string;
  children: ReactNode;
}) {
  const { t: tr } = useLocale();
  const label = scenario ? scenarios[scenario].label : "";
  const message = tr(
    scenario
      ? `Halo, saya sudah mencoba demo ${label} Alur Kendali. Saya ingin mendiskusikan proses ${label} di perusahaan kami.`
      : "Halo, saya sudah mencoba demo Alur Kendali dan ingin mendiskusikan proses kerja di perusahaan kami.",
  );
  const { href, external } = contactHref(message, scenario);
  return (
    <a
      className={className}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onClick={() => track(source, scenario ? { scenario } : {})}
    >
      {children}
    </a>
  );
}
