"use client";
import { useLocale } from "@/lib/locale";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { scenarioIds, scenarios, roleLabels } from "@/lib/demo-scenarios";
import type { RoleType } from "@/lib/demo-data";
import LanguageSwitch from "@/components/language-switch";
import BrandMark from "@/components/brand";
import DemoContactLink from "@/components/demo/contact-link";

export function DemoNav() {
  const { t: tr } = useLocale();
  const path = usePathname();
  const router = useRouter();
  const search = useSearchParams();
  const { currentRole, switchRole } = useDemo();
  const explore = search.get("mode") === "explore";
  const mode = explore ? "explore" : "guided";
  const ownerView = path === "/demo/overview" || path === "/demo/reporting";
  const current = scenarioIds.find((id) => path === `/demo/${id}`);
  return (
    <>
      <a className="demo-skip" href="#demo-content">
        {tr("Langsung ke isi demo")}
      </a>
      <header className="demo-header">
        <BrandMark href="/" label="Alur Kendali, kembali ke website" />
        <div className="demo-header-description">
          {tr("Ruang demo")}
          <span>{tr("Semua data di sini contoh")}</span>
        </div>
        <LanguageSwitch />
        <Link className="demo-header-back" href="/">
          {tr("Kembali ke website")}
        </Link>
        <DemoContactLink
          source="demo_header_contact"
          className="demo-header-cta"
        >
          {tr("Diskusikan proses Anda")}
        </DemoContactLink>
      </header>
      <nav className="demo-category-nav" aria-label={tr("Kategori demo")}>
        <div className="demo-nav-desktop">
          <Link
            href="/demo"
            aria-current={path === "/demo" ? "page" : undefined}
          >
            {tr("Pilih kasus")}
          </Link>
          {scenarioIds.map((id) => (
            <Link
              key={id}
              href={`/demo/${id}?mode=${mode}`}
              aria-current={current === id ? "page" : undefined}
            >
              {tr(scenarios[id].label)}
            </Link>
          ))}
          <Link
            href="/demo/overview"
            aria-current={ownerView ? "page" : undefined}
          >
            {tr("Tampilan owner")}
          </Link>
        </div>
        {/* Seven tabs do not fit a phone; one labelled picker replaces the scrolling row. */}
        <div className="demo-nav-mobile">
          <label>
            <span>{tr("Kasus")}</span>
            <select
              value={current ?? (ownerView ? "owner" : "all")}
              onChange={(event) => {
                const value = event.target.value;
                router.push(
                  value === "all"
                    ? "/demo"
                    : value === "owner"
                      ? "/demo/overview"
                      : `/demo/${value}?mode=${mode}`,
                );
              }}
            >
              <option value="all">{tr("Semua kasus")}</option>
              {scenarioIds.map((id) => (
                <option key={id} value={id}>
                  {tr(scenarios[id].label)}
                </option>
              ))}
              <option value="owner">{tr("Tampilan owner")}</option>
            </select>
          </label>
        </div>
      </nav>
      {explore && (
        <div className="demo-explore-bar">
          <p>{tr("Mode bebas · Data contoh di sini terpisah dari panduan")}</p>
          <label>
            {tr("Lihat sebagai")}{" "}
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as RoleType)}
            >
              {Object.entries(roleLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {tr(label)}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </>
  );
}
