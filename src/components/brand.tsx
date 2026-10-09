"use client";
import Image from "next/image";
import { useLocale } from "@/lib/locale";
import { site } from "@/lib/site";

// Icon + text wordmark: the full logo carries a tagline that is unreadable at header size.
export default function BrandMark({
  href,
  label,
  className = "",
}: {
  href: string;
  label: string;
  className?: string;
}) {
  const { t: tr } = useLocale();
  return (
    <a className={`brand ${className}`} href={href} aria-label={tr(label)}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={40}
        height={40}
        priority
        className="brand-icon"
      />
      <span className="brand-wordmark">{site.name.replace(" ", "")}</span>
    </a>
  );
}
