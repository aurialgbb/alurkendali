"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useDemo } from "@/lib/demo-store";
import { scenarioIds, scenarios, roleLabels } from "@/lib/demo-scenarios";
import type { RoleType } from "@/lib/demo-data";
export function DemoNav() {
  const path = usePathname();
  const search = useSearchParams();
  const { currentRole, switchRole } = useDemo();
  const explore = search.get("mode") === "explore";
  return (
    <>
      <a className="demo-skip" href="#demo-content">
        Langsung ke isi demo
      </a>
      <header className="demo-header">
        <Link href="/" aria-label="Alur Kendali, kembali ke website">
          <Image
            src="/logo.png"
            width={180}
            height={55}
            alt="Alur Kendali"
            priority
          />
        </Link>
        <div className="demo-header-description">
          Ruang demo<span>Data contoh · Tanpa pendaftaran</span>
        </div>
        <Link className="demo-header-back" href="/">
          Kembali ke website <span aria-hidden="true">↗</span>
        </Link>
      </header>
      <nav className="demo-category-nav" aria-label="Kategori demo">
        <Link href="/demo" aria-current={path === "/demo" ? "page" : undefined}>
          Pilih kasus
        </Link>
        {scenarioIds.map((id) => (
          <Link
            key={id}
            href={`/demo/${id}?mode=${explore ? "explore" : "guided"}`}
            aria-current={path === `/demo/${id}` ? "page" : undefined}
          >
            {scenarios[id].label}
          </Link>
        ))}
        <Link
          href="/demo/overview"
          aria-current={path === "/demo/overview" ? "page" : undefined}
        >
          Ringkasan
        </Link>
        <Link
          href="/demo/reporting"
          aria-current={path === "/demo/reporting" ? "page" : undefined}
        >
          Riwayat
        </Link>
      </nav>
      {explore && (
        <div className="demo-explore-bar">
          <p>Mode eksplorasi · Data contoh terpisah dari panduan</p>
          <label>
            Peran aktif{" "}
            <select
              value={currentRole}
              onChange={(e) => switchRole(e.target.value as RoleType)}
            >
              {Object.entries(roleLabels).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </>
  );
}
