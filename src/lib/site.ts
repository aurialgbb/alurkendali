export const site = {
  name: "Alur Kendali",
  descriptor: "Business Systems & Controls Consulting",
  temporaryBrand: false,
  whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "",
  email: "",
  linkedin: "",
};

export const navigation = [
  { label: "Solusi", href: "#solusi" },
  { label: "Live Demo Portal", href: "/demo" },
  { label: "Cara kerja", href: "#cara-kerja" },
  { label: "Pendekatan kami", href: "#pendekatan" },
];

export const solutions = [
  {
    id: "finance",
    label: "Finance & Controls",
    short: "Finance",
    context: "finance / reconciliation",
    title: "Uangnya sudah keluar, tapi bukti dan notanya ada di mana?",
    description:
      "Pengajuan biaya, reimbursement, dan uang muka tersimpan bersama persetujuan dan buktinya. Tim bisa mengecek kelengkapan tanpa membuka banyak file.",
    outcomes: [
      "Jelas siapa yang perlu menyetujui",
      "Bukti transaksi bisa dibuka dari pengajuan",
      "Terlihat mana yang sudah dicocokkan dan mana yang belum",
    ],
    uiTitle: "Expense & reimbursement",
    uiLabel: "Pengajuan",
    rows: [
      ["EXP-024", "Biaya perjalanan", "Diverifikasi"],
      ["EXP-025", "Cash advance", "Menunggu approval"],
      ["EXP-026", "Reimbursement", "Bukti dilengkapi"],
    ],
    note: "Perlu mengecek ulang? Buka pengajuannya, lalu lihat bukti dan riwayatnya.",
  },
  {
    id: "inventory",
    label: "Inventory & Assets",
    short: "Inventory",
    context: "inventory / asset",
    title: "Barangnya sekarang di mana, dan siapa yang memegangnya?",
    description:
      "Catat barang masuk, perpindahan antar lokasi, dan penyerahan aset. Saat ada selisih, tim punya catatan untuk mulai menelusurinya.",
    outcomes: [
      "Riwayat perpindahan barang tersimpan",
      "Nama penanggung jawab aset bisa dicek",
      "Penyesuaian stok disertai alasan dan persetujuan",
    ],
    uiTitle: "Inventory & asset movement",
    uiLabel: "Pergerakan",
    rows: [
      ["MOV-014", "Transfer ke cabang", "Disetujui"],
      ["AST-018", "Penyerahan aset", "Bukti dilengkapi"],
      ["ADJ-003", "Penyesuaian stok", "Menunggu approval"],
    ],
    note: "Lihat lokasi terakhir, penanggung jawab, dan bukti serah terimanya.",
  },
  {
    id: "procurement",
    label: "Procurement",
    short: "Procurement",
    context: "procurement / spending",
    title: "Tagihan supplier tiba-tiba datang, tapi siapa yang pesan barangnya?",
    description:
      "Hubungkan permintaan pembelian, persetujuan anggaran, PO, dan invoice. Tim bisa melihat apa yang dipesan dan sudah sampai tahap mana.",
    outcomes: [
      "Kebutuhan dan anggaran diperiksa sebelum pembelian",
      "PO bisa ditelusuri ke permintaan awal",
      "Invoice dan bukti pembelian tersimpan bersama",
    ],
    uiTitle: "Purchase & spending control",
    uiLabel: "Permintaan",
    rows: [
      ["PR-042", "Peralatan cabang", "Disetujui"],
      ["PO-019", "Purchase order", "Diverifikasi"],
      ["INV-031", "Invoice supplier", "Menunggu approval"],
    ],
    note: "Dari invoice, tim bisa menelusuri apa yang diminta dan siapa yang menyetujui.",
  },
  {
    id: "operations",
    label: "Operations",
    short: "Operations",
    context: "workflow / approval",
    title: "Pekerjaan tersendat di tengah jalan karena tidak jelas giliran siapa?",
    description:
      "Rapikan pekerjaan rutin antar tim atau cabang. Pengajuan, dokumen, dan statusnya bisa dilihat oleh orang yang perlu menindaklanjuti.",
    outcomes: [
      "Jelas siapa yang sedang menangani pekerjaan",
      "Bukti penyelesaian bisa dicek tim berikutnya",
      "Pekerjaan yang tertahan lebih mudah dikenali",
    ],
    uiTitle: "Branch operations",
    uiLabel: "Aktivitas",
    rows: [
      ["OPS-021", "Pengajuan cabang", "Menunggu approval"],
      ["OPS-022", "Serah terima", "Bukti dilengkapi"],
      ["OPS-023", "Review operasional", "Diverifikasi"],
    ],
    note: "Saat giliran tim lain, status dan dokumennya sudah tersedia.",
  },
  {
    id: "reporting",
    label: "Reporting",
    short: "Reporting",
    context: "management reporting",
    title: "Mau tahu kondisi bisnis terbaru, tapi harus menunggu rekap manual berhari-hari?",
    description:
      "Gunakan data dari pekerjaan yang sudah tercatat untuk menyusun laporan. Kalau ada angka yang perlu dijelaskan, tim bisa melihat transaksi di baliknya.",
    outcomes: [
      "Isi laporan mengikuti kebutuhan manajemen",
      "Angka ringkasan bisa ditelusuri ke transaksi",
      "Pengajuan yang belum selesai terlihat jelas",
    ],
    uiTitle: "Management process overview",
    uiLabel: "Area",
    rows: [
      ["FIN", "Rekonsiliasi expense", "Diverifikasi"],
      ["OPS", "Pengajuan cabang", "Menunggu approval"],
      ["PRC", "Dokumen pembelian", "Bukti dilengkapi"],
    ],
    note: "Angka di laporan punya sumber yang bisa dibuka dan diperiksa.",
  },
] as const;

export const faqs = [
  [
    "Apakah harus mengganti seluruh sistem yang sudah ada?",
    "Tidak perlu. Kita bisa mulai dari satu proses yang paling sering bermasalah. Sistem yang masih bekerja dengan baik tetap digunakan. Jika perlu dihubungkan, kita bahas kebutuhannya sebelum menentukan lingkup pekerjaan.",
  ],
  [
    "Apakah sistem dibuat sesuai proses perusahaan?",
    "Ya. Kami mempelajari cara kerja tim Anda dulu: siapa yang mengajukan, siapa yang memeriksa, dan laporan apa yang dibutuhkan. Dari situ, kita sepakati alur dan batasan sistem yang akan dibuat.",
  ],
  [
    "Apakah harus berhenti menggunakan Excel?",
    "Tidak. Excel tetap berguna untuk banyak pekerjaan. Yang kita rapikan adalah proses yang mulai sulit dikelola lewat spreadsheet, misalnya pengajuan yang melewati banyak orang atau transaksi yang membutuhkan bukti dan persetujuan.",
  ],
  [
    "Berapa biaya implementasinya?",
    "Kami perlu memahami prosesnya dulu agar estimasinya masuk akal. Biaya dipengaruhi alur kerja, jumlah peran pengguna, dan kebutuhan hubungan dengan sistem lain. Ceritakan kebutuhannya lewat WhatsApp, lalu kita bahas lingkup pekerjaan dan perkiraan biayanya.",
  ],
  [
    "Apakah bisa dimulai dari satu proses saja?",
    "Bisa, dan biasanya itu titik mulai yang baik. Pilih satu proses yang paling terasa masalahnya, gunakan sistemnya, lalu evaluasi bersama tim. Setelah berjalan baik, baru kita bahas kebutuhan berikutnya.",
  ],
] as const;
