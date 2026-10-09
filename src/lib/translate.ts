import { englishCopy } from "./english-copy";

export type Locale = "id" | "en";
export const localeCookie = "alur_kendali_locale";

export function translate(locale: Locale, text: string): string {
  if (locale === "id") return text;
  const exact = englishCopy[text];
  if (exact !== undefined) return exact;
  const trimmed = text.trim();
  if (englishCopy[trimmed] !== undefined)
    return text.replace(trimmed, englishCopy[trimmed]);
  const t = (value: string) => translate(locale, value);
  const patterns: [RegExp, (...parts: string[]) => string][] = [
    [/^Hari ini, (.+)$/, (time) => `Today, ${time}`],
    [/^Kemarin, (.+)$/, (time) => `Yesterday, ${time}`],
    [/^(Alur Kendali), kembali ke atas$/, (name) => `${name}, back to top`],
    [/^0(\d) (.+)$/, (n, label) => `0${n} ${t(label)}`],
    [/^Langkah (\d+) dari (\d+)$/, (n, total) => `Step ${n} of ${total}`],
    [/^(\d+) tahap kerja$/, (n) => `${n} workflow stages`],
    [/^Coba (.+)$/, (label) => `Try ${label}`],
    [/^Sekarang giliran (.+)\.$/, (role) => `It is ${t(role)}'s turn.`],
    [/^Peran aktif: (.+)$/, (role) => `Active role: ${t(role)}`],
    [
      /^(\d+) aktivitas pada (.+)\.$/,
      (n, code) => `${n} activities on ${code}.`,
    ],
    [
      /^(\d+) aktivitas diekspor ke CSV\.$/,
      (n) => `${n} activities exported to CSV.`,
    ],
    [/^Konfirmasi terima (\d+) rim$/, (n) => `Confirm receipt of ${n} reams`],
    [/^(\d+) pemeriksaan tersisa$/, (n) => `${n} checks remaining`],
    [/^Tahap berikutnya: (.+)$/, (label) => `Next stage: ${t(label)}`],
    [/^Tercatat · (.+)$/, (ref) => `Recorded · ${ref}`],
    [/^(\d+) rim kertas A4$/, (n) => `${n} reams of A4 paper`],
    [/^(\d+) rim$/, (n) => `${n} reams`],
    [/^(\d+) unit$/, (n) => `${n} units`],
    [/^(\d+) dari 4 selesai$/, (n) => `${n} of 4 done`],
    [
      /^Tahap ini dikerjakan oleh (.+)\.$/,
      (role) => `This stage is done by ${t(role)}.`,
    ],
    [
      /^(Pengajuan|Barang|Pekerjaan) diteruskan ke (.+)\.$/,
      (noun, role) =>
        `${noun === "Pengajuan" ? "The request" : noun === "Barang" ? "The goods" : "The work"} ${noun === "Barang" ? "move" : "moves"} on to ${t(role)}.`,
    ],
    [/^Anda akan memerankan (\d+) orang$/, (n) => `You will play ${n} people`],
    [/^Tahap (\d+) dari (\d+)$/, (n, total) => `Stage ${n} of ${total}`],
    [
      /^Diskusikan proses (.+) di usaha Anda$/,
      (label) => `Discuss the ${t(label)} workflow in your business`,
    ],
    [
      /^Halo, saya sudah mencoba demo Alur Kendali dan ingin mendiskusikan proses kerja di perusahaan kami\.$/,
      () =>
        "Hello, I have tried the Alur Kendali demo and would like to discuss a workflow at our company.",
    ],
    [
      /^Tahap ini membutuhkan peran (.+)\.$/,
      (role) => `This stage requires the ${t(role)} role.`,
    ],
    [
      /^Manager menolak pengajuan: ([\s\S]*)$/,
      (reason) => `Manager rejected the request: ${reason}`,
    ],
    [
      /^(\d+) rim kertas A4 dikirim dari Gudang Pusat ke Cabang Kemang\.$/,
      (n) =>
        `${n} reams of A4 paper sent from Central Warehouse to Kemang Branch.`,
    ],
    [
      /^Cabang Kemang menerima (\d+) rim\. Saldo cabang: (\d+) rim\.$/,
      (n, balance) =>
        `Kemang Branch received ${n} reams. Branch stock: ${balance} reams.`,
    ],
    [
      /^Tagihan (Rp[\d.]+) tidak cocok dengan PO Rp3\.200\.000\. Pembayaran ditahan\.$/,
      (amount) =>
        `Invoice ${amount} does not match PO Rp3.200.000. Payment blocked.`,
    ],
    [
      /^Pengajuan simulasi (Rp[\d.]+) dibuat bersama referensi bukti contoh\.$/,
      (amount) =>
        `A simulated ${amount} request was created with a sample document reference.`,
    ],
    [
      /^Pengajuan (\S+) disetujui dan diteruskan ke Finance\.$/,
      (code) => `Request ${code} approved and forwarded to Finance.`,
    ],
    [
      /^Finance mencatat pembayaran contoh (\S+) sebesar (Rp[\d.]+)\.$/,
      (code, amount) =>
        `Finance recorded a sample payment of ${amount} for ${code}.`,
    ],
    [
      /^Penyesuaian contoh (\S+) disetujui oleh (.+)\.$/,
      (code, name) => `Sample adjustment ${code} approved by ${name}.`,
    ],
    [/^PO contoh (\S+) diterbitkan\.$/, (code) => `Sample PO ${code} issued.`],
    [
      /^Pembayaran contoh (\S+) sebesar (Rp[\d.]+) dicatat\.$/,
      (code, amount) => `Sample payment of ${amount} recorded for ${code}.`,
    ],
    [
      /^(Selesai|Dibuka kembali): (.+)\. Pelaksana (.+)\.$/,
      (status, label, name) =>
        `${t(status)}: ${t(label)}. Performed by ${name}.`,
    ],
    [
      /^(Selesai|Dibuka kembali): (.+)\.$/,
      (status, label) => `${t(status)}: ${t(label)}.`,
    ],
    [
      /^(.+) memperbarui checklist pada (.+)\.$/,
      (name, at) => `${name} updated the checklist at ${at}.`,
    ],
    [
      /^Halo, saya ingin mendiskusikan proses kerja di kantor yang saat ini masih manual atau pakai spreadsheet\. Area yang ingin dibahas: (.+)\. Boleh minta waktu untuk diskusi alurnya\?$/,
      (area) =>
        `Hello, I would like to discuss a workflow at our company that is currently handled manually or in spreadsheets. The area we would like to discuss is ${area === "operasional/finance" ? "operations/finance" : t(area)}. Could we arrange a time to talk through the process?`,
    ],
    [
      /^Halo, saya sudah mencoba demo (.+) Alur Kendali\. Saya ingin mendiskusikan proses (.+) di perusahaan kami\.$/,
      (demo, area) =>
        `Hello, I have tried the ${demo} demo from Alur Kendali. I would like to discuss the ${area} workflow at our company.`,
    ],
  ];
  for (const [pattern, render] of patterns) {
    const match = text.match(pattern);
    if (match) return render(...match.slice(1));
  }
  return text;
}

export const pageCopy = {
  id: {
    title: "Alur Kendali | Business Systems & Controls Consulting",
    description:
      "Konsultasi dan implementasi sistem internal untuk workflow finance, inventory, procurement, approval, dan reporting yang semakin kompleks untuk spreadsheet.",
    demoTitle: "Coba alur bisnis | Alur Kendali",
    demoDescription:
      "Demo terpandu Finance, Inventory, Procurement, dan Operations dengan data contoh.",
    ogTitle: "Alur Kendali | Proses bisnis lebih terkendali",
    ogDescription:
      "Ubah workflow finance dan operasional yang tersebar menjadi sistem internal yang terkontrol.",
  },
  en: {
    title: "Alur Kendali | Business Systems & Controls Consulting",
    description:
      "Consulting and implementation of internal systems for finance, inventory, procurement, approvals, and reporting workflows that have outgrown spreadsheets.",
    demoTitle: "Try a Business Workflow | Alur Kendali",
    demoDescription:
      "Guided Finance, Inventory, Procurement, and Operations demos with sample data.",
    ogTitle: "Alur Kendali | Business workflows with clear controls",
    ogDescription:
      "Bring scattered finance and operations workflows into connected internal systems with clear controls.",
  },
} as const;
