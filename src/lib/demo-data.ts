export type RoleType = "staff" | "manager" | "finance" | "director";

export interface UserRole {
  id: RoleType;
  name: string;
  roleTitle: string;
  branch: string;
  avatarLetter: string;
  description: string;
  canApproveFinance: boolean;
  canApproveProcurement: boolean;
  canVerifyAudit: boolean;
  canSubmitRequest: boolean;
}

export const DEMO_ROLES: Record<RoleType, UserRole> = {
  staff: {
    id: "staff",
    name: "Rian Pratama",
    roleTitle: "Staf Operasional & Kasir",
    branch: "Cabang Kemang",
    avatarLetter: "RP",
    description: "Membuat pengajuan kasbon, melampirkan nota fisik, dan mengisi checklist harian.",
    canApproveFinance: false,
    canApproveProcurement: false,
    canVerifyAudit: false,
    canSubmitRequest: true,
  },
  manager: {
    id: "manager",
    name: "Budi Santoso",
    roleTitle: "Kepala Cabang Kemang",
    branch: "Cabang Kemang",
    avatarLetter: "BS",
    description: "Memeriksa kewajaran pengajuan biaya cabang, menyetujui mutasi, dan memvalidasi SOP.",
    canApproveFinance: true,
    canApproveProcurement: true,
    canVerifyAudit: false,
    canSubmitRequest: true,
  },
  finance: {
    id: "finance",
    name: "Dewi Lestari, Ak.",
    roleTitle: "Finance & Internal Control",
    branch: "Kantor Pusat Sudirman",
    avatarLetter: "DL",
    description: "Mencocokkan nota asli dengan nominal, menjalankan 3-way matching, dan rekonsiliasi.",
    canApproveFinance: true,
    canApproveProcurement: true,
    canVerifyAudit: true,
    canSubmitRequest: true,
  },
  director: {
    id: "director",
    name: "Hendra Wijaya",
    roleTitle: "Managing Director / Owner",
    branch: "Kantor Pusat Sudirman",
    avatarLetter: "HW",
    description: "Memantau KPI lintas cabang, meninjau pengeluaran di atas limit, dan melihat audit trail.",
    canApproveFinance: true,
    canApproveProcurement: true,
    canVerifyAudit: true,
    canSubmitRequest: true,
  },
};

export interface AuditLogItem {
  id: string;
  timestamp: string;
  module: "finance" | "inventory" | "procurement" | "operations" | "system";
  action: string;
  user: string;
  role: string;
  docCode: string;
  details: string;
}

export interface ExpenseItem {
  id: string;
  code: string;
  title: string;
  category: "Operasional Toko" | "Reimbursement" | "Kasbon / Advance" | "Perawatan / Servis";
  amount: number;
  submitter: string;
  branch: string;
  date: string;
  status: "pending_manager" | "pending_finance" | "verified_paid" | "rejected";
  receiptName: string;
  receiptSize: string;
  receiptUrl?: string;
  notes: string;
  managerApproval?: {
    approvedBy: string;
    approvedAt: string;
    notes: string;
  };
  financeVerification?: {
    verifiedBy: string;
    verifiedAt: string;
    refNo: string;
    notes: string;
  };
}

export interface InventoryItem {
  id: string;
  code: string;
  title: string;
  type: "transfer" | "asset" | "adjustment";
  origin: string;
  destination?: string;
  responsiblePerson: string;
  date: string;
  status: "completed" | "in_transit" | "pending_approval" | "flagged";
  itemsSummary: string;
  documentName: string;
  notes: string;
  discrepancyValue?: number;
}

export interface ProcurementItem {
  id: string;
  code: string;
  poNumber: string;
  title: string;
  vendor: string;
  requestedBy: string;
  branch: string;
  date: string;
  totalAmount: number;
  status: "pr_draft" | "pr_approved" | "po_issued" | "goods_received" | "3way_matched" | "paid";
  threeWayMatch: {
    poAmount: number;
    poMatched: boolean;
    receivingSlipNo: string;
    goodsQtyMatched: boolean;
    invoiceNo: string;
    invoiceAmount: number;
    invoiceMatched: boolean;
    isFullyMatched: boolean;
  };
  notes: string;
}

export interface OperationTask {
  id: string;
  code: string;
  title: string;
  branch: string;
  shift: "Pagi (Opening)" | "Malam (Closing)";
  assignedTo: string;
  date: string;
  status: "completed" | "in_progress" | "flagged";
  checkItems: {
    label: string;
    checked: boolean;
    notes?: string;
  }[];
  supervisorNotes?: string;
}

export const INITIAL_EXPENSES: ExpenseItem[] = [
  {
    id: "exp-1",
    code: "EXP-2026-081",
    title: "Pembelian Gas Elpiji & Sabun Cuci Urgent",
    category: "Operasional Toko",
    amount: 850000,
    submitter: "Rian Pratama",
    branch: "Cabang Kemang",
    date: "Hari ini, 09:15",
    status: "pending_manager",
    receiptName: "struk_gas_elpiji_supermarket.jpg",
    receiptSize: "340 KB",
    notes: "Gas habis saat jam sibuk dan persediaan sabun habis. Menggunakan uang kas kecil kasir.",
  },
  {
    id: "exp-2",
    code: "EXP-2026-079",
    title: "Reimbursement BBM & E-Toll Kunjungan Klien",
    category: "Reimbursement",
    amount: 1450000,
    submitter: "Dimas Anggoro",
    branch: "Kantor Pusat Sudirman",
    date: "Kemarin, 16:30",
    status: "pending_finance",
    receiptName: "rekap_etoll_bbm_pertamina.pdf",
    receiptSize: "1.2 MB",
    notes: "Kunjungan presentasi prospek korporat area Cikarang & Karawang selama 2 hari.",
    managerApproval: {
      approvedBy: "Budi Santoso",
      approvedAt: "Kemarin, 18:00",
      notes: "Sesuai rencana kerja mingguan divisi sales.",
    },
  },
  {
    id: "exp-3",
    code: "EXP-2026-074",
    title: "Cash Advance Operasional Booth Pameran",
    category: "Kasbon / Advance",
    amount: 3000000,
    submitter: "Siti Rahma",
    branch: "Kantor Pusat Sudirman",
    date: "14 Sep 2026",
    status: "verified_paid",
    receiptName: "surat_tugas_bazar_bca_transfer.pdf",
    receiptSize: "890 KB",
    notes: "Uang muka listrik tambahan dan akomodasi crew booth selama 3 hari.",
    managerApproval: {
      approvedBy: "Budi Santoso",
      approvedAt: "14 Sep 2026, 11:00",
      notes: "Disetujui sesuai budget event Q3.",
    },
    financeVerification: {
      verifiedBy: "Dewi Lestari, Ak.",
      verifiedAt: "14 Sep 2026, 14:15",
      refNo: "TRX-BCA-99210",
      notes: "Transfer berhasil diverifikasi. Laporan pertanggungjawaban nota wajib diserahkan maks H+3 pameran.",
    },
  },
  {
    id: "exp-4",
    code: "EXP-2026-068",
    title: "Servis Darurat Mesin Penggiling & Chiller",
    category: "Perawatan / Servis",
    amount: 2150000,
    submitter: "Rian Pratama",
    branch: "Cabang Kemang",
    date: "10 Sep 2026",
    status: "verified_paid",
    receiptName: "invoice_servis_teknisi_pendingin.jpg",
    receiptSize: "450 KB",
    notes: "Penggantian kapasitor dan freon kompresor chiller utama.",
    managerApproval: {
      approvedBy: "Budi Santoso",
      approvedAt: "10 Sep 2026, 15:30",
      notes: "Penanganan urgent agar bahan baku tidak rusak.",
    },
    financeVerification: {
      verifiedBy: "Dewi Lestari, Ak.",
      verifiedAt: "11 Sep 2026, 10:00",
      refNo: "TRX-MND-44102",
      notes: "Nominal invoice cocok dengan bukti transfer ke teknisi rekanan.",
    },
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: "inv-1",
    code: "MOV-2026-034",
    title: "Transfer 50 Box Kertas A4 & Toner Cadangan",
    type: "transfer",
    origin: "Gudang Pusat Sudirman",
    destination: "Cabang Bandung",
    responsiblePerson: "Agus Salim (Logistik)",
    date: "Hari ini, 08:30",
    status: "in_transit",
    itemsSummary: "30 Box PaperOne 80gsm, 20 Unit Toner HP 85A",
    documentName: "Surat_Jalan_SJ-8821.pdf",
    notes: "Pengiriman via ekspedisi rekanan. Estimasi tiba besok sore.",
  },
  {
    id: "inv-2",
    code: "AST-2026-019",
    title: "Penyerahan Aset Laptop Lenovo ThinkPad T14",
    type: "asset",
    origin: "Kantor Pusat Sudirman",
    destination: "Cabang Kemang",
    responsiblePerson: "Rian Pratama (Staf Cabang)",
    date: "12 Sep 2026",
    status: "completed",
    itemsSummary: "Laptop SN-LNV-99210-ID, Adaptor 65W, Tas Backpack",
    documentName: "BAST_Aset_No_019.pdf",
    notes: "Aset operasional kasir & admin cabang baru. BAST ditandatangani basah dan terarsip digital.",
  },
  {
    id: "inv-3",
    code: "ADJ-2026-008",
    title: "Penyesuaian Stok Opname (Selisih 2 Botol Sirup)",
    type: "adjustment",
    origin: "Cabang Kemang",
    responsiblePerson: "Rian Pratama",
    date: "Kemarin, 21:00",
    status: "pending_approval",
    itemsSummary: "2 Botol Sirup Vanilla Premium (Pecah saat bongkar muat)",
    documentName: "Foto_Bukti_Pecah_BeritaAcara.jpg",
    notes: "Pecah terbentur palet kayu saat bongkar muat ekspedisi hari Selasa. Memerlukan otorisasi penghapusan stok.",
    discrepancyValue: -280000,
  },
  {
    id: "inv-4",
    code: "MOV-2026-031",
    title: "Transfer Cup Sealer & Seal Roll 10 Roll",
    type: "transfer",
    origin: "Gudang Pusat Sudirman",
    destination: "Cabang Kemang",
    responsiblePerson: "Budi Santoso",
    date: "08 Sep 2026",
    status: "completed",
    itemsSummary: "1 Unit Mesin Sealer Eton, 10 Roll Plastik Lid",
    documentName: "Surat_Jalan_SJ-8750_Verified.pdf",
    notes: "Telah diterima dalam kondisi baik dan dicatat di inventaris cabang.",
  },
];

export const INITIAL_PROCUREMENT: ProcurementItem[] = [
  {
    id: "prc-1",
    code: "PR-2026-042",
    poNumber: "PO-2026-042",
    title: "Pengadaan 2 Unit Barcode Scanner Wireless",
    vendor: "PT Teknologi Niaga Mandiri",
    requestedBy: "Rian Pratama",
    branch: "Cabang Kemang",
    date: "Hari ini, 10:00",
    totalAmount: 3200000,
    status: "po_issued",
    threeWayMatch: {
      poAmount: 3200000,
      poMatched: true,
      receivingSlipNo: "Belum Diterima",
      goodsQtyMatched: false,
      invoiceNo: "Belum Terbit",
      invoiceAmount: 0,
      invoiceMatched: false,
      isFullyMatched: false,
    },
    notes: "Penggantian barcode scanner kabel yang sering error di kasir 1 & 2.",
  },
  {
    id: "prc-2",
    code: "PR-2026-039",
    poNumber: "PO-2026-039",
    title: "Restock Cup Kertas & Kotak Kemasan 1.000 Pcs",
    vendor: "CV Berkah Kemasan Nusantara",
    requestedBy: "Dewi Lestari, Ak.",
    branch: "Kantor Pusat Sudirman",
    date: "15 Sep 2026",
    totalAmount: 8500000,
    status: "3way_matched",
    threeWayMatch: {
      poAmount: 8500000,
      poMatched: true,
      receivingSlipNo: "GR-2026-089 (1000 pcs utuh)",
      goodsQtyMatched: true,
      invoiceNo: "INV-BKN-2026-11",
      invoiceAmount: 8500000,
      invoiceMatched: true,
      isFullyMatched: true,
    },
    notes: "Dokumen PO, Surat Penerimaan Gudang, dan Tagihan Supplier 100% cocok. Siap proses pembayaran.",
  },
  {
    id: "prc-3",
    code: "PR-2026-035",
    poNumber: "PO-2026-035",
    title: "Pengadaan Rak Besi Heavy Duty Gudang",
    vendor: "PT Mega Steel Perkasa",
    requestedBy: "Agus Salim",
    branch: "Gudang Pusat Sudirman",
    date: "05 Sep 2026",
    totalAmount: 14200000,
    status: "paid",
    threeWayMatch: {
      poAmount: 14200000,
      poMatched: true,
      receivingSlipNo: "GR-2026-077",
      goodsQtyMatched: true,
      invoiceNo: "INV-MSP-8891",
      invoiceAmount: 14200000,
      invoiceMatched: true,
      isFullyMatched: true,
    },
    notes: "Lunas ditransfer via Mandiri Giro. Barang terpasang sempurna di modul racking barat.",
  },
];

export const INITIAL_OPERATIONS: OperationTask[] = [
  {
    id: "ops-1",
    code: "OPS-2026-055",
    title: "Opening SOP & Cash Float Checklist",
    branch: "Cabang Kemang",
    shift: "Pagi (Opening)",
    assignedTo: "Rian Pratama",
    date: "Hari ini, 07:45",
    status: "completed",
    checkItems: [
      { label: "Hitung fisik kas kecil opening kasir Rp500.000 (Pecahan pas)", checked: true },
      { label: "Pemeriksaan kebersihan area dine-in, kasir, dan toilet", checked: true },
      { label: "Uji fungsi mesin kasir POS, barcode scanner, dan EDC", checked: true },
      { label: "Pengecekan suhu display chiller (-4°C batas aman)", checked: true },
    ],
    supervisorNotes: "Opening tepat waktu pukul 07:45. Semua checklist standar terpenuhi.",
  },
  {
    id: "ops-2",
    code: "OPS-2026-056",
    title: "Mid-Day Restock & Shift Handover",
    branch: "Cabang Kemang",
    shift: "Pagi (Opening)",
    assignedTo: "Rian Pratama",
    date: "Hari ini, 14:00",
    status: "in_progress",
    checkItems: [
      { label: "Rekonsiliasi transaksi shift 1 dengan sistem POS", checked: true },
      { label: "Penyerahan uang tunai hasil shift 1 ke brankas cabang", checked: true },
      { label: "Pengecekan stok bahan baku kritis sebelum shift malam", checked: false, notes: "Menunggu tim logistik" },
      { label: "Serah terima kunci dan catatan khusus ke supervisor shift 2", checked: false },
    ],
  },
  {
    id: "ops-3",
    code: "OPS-2026-052",
    title: "Closing & Daily Cash Drop Cabang Bandung",
    branch: "Cabang Bandung",
    shift: "Malam (Closing)",
    assignedTo: "Siti Rahma",
    date: "Kemarin, 22:30",
    status: "completed",
    checkItems: [
      { label: "Cetak laporan closing settlement EDC & POS", checked: true },
      { label: "Pencocokan total fisik uang vs laporan kasir (Nol selisih)", checked: true },
      { label: "Penguncian pintu ganda & pengaktifan alarm toko", checked: true },
    ],
    supervisorNotes: "Settlement klop tanpa selisih. Rekap bukti diunggah ke portal.",
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogItem[] = [
  {
    id: "log-1",
    timestamp: "Hari ini, 10:30",
    module: "procurement",
    action: "PR Approved & PO Issued",
    user: "Dewi Lestari, Ak.",
    role: "Finance & Internal Control",
    docCode: "PO-2026-042",
    details: "Purchase Request disetujui, alokasi anggaran Rp3.200.000 diverifikasi terhadap pos belanja Cabang Kemang.",
  },
  {
    id: "log-2",
    timestamp: "Hari ini, 10:00",
    module: "procurement",
    action: "PR Created",
    user: "Rian Pratama",
    role: "Staf Operasional",
    docCode: "PR-2026-042",
    details: "Mengajukan pengadaan 2 unit barcode scanner wireless untuk kasir Cabang Kemang.",
  },
  {
    id: "log-3",
    timestamp: "Hari ini, 09:15",
    module: "finance",
    action: "Expense Submitted",
    user: "Rian Pratama",
    role: "Staf Operasional",
    docCode: "EXP-2026-081",
    details: "Mengajukan reimbursement operasional toko Rp850.000 dengan bukti struk kasir terlampir.",
  },
  {
    id: "log-4",
    timestamp: "Hari ini, 08:30",
    module: "inventory",
    action: "Stock Transfer Dispatched",
    user: "Agus Salim",
    role: "Kepala Logistik",
    docCode: "MOV-2026-034",
    details: "Mengeluarkan 50 box kertas & toner dari Gudang Pusat Sudirman menuju Cabang Bandung (SJ-8821).",
  },
  {
    id: "log-5",
    timestamp: "Kemarin, 21:00",
    module: "inventory",
    action: "Stock Adjustment Flagged",
    user: "Rian Pratama",
    role: "Staf Operasional",
    docCode: "ADJ-2026-008",
    details: "Melaporkan selisih stok 2 botol sirup pecah (Rp280.000). Foto bukti dan berita acara diunggah.",
  },
  {
    id: "log-6",
    timestamp: "Kemarin, 18:00",
    module: "finance",
    action: "Expense Manager Approved",
    user: "Budi Santoso",
    role: "Kepala Cabang Kemang",
    docCode: "EXP-2026-079",
    details: "Menyetujui pengajuan reimbursement bbm/e-toll Rp1.450.000. Diteruskan ke Finance Pusat.",
  },
  {
    id: "log-7",
    timestamp: "15 Sep, 16:45",
    module: "procurement",
    action: "3-Way Match Verified",
    user: "Dewi Lestari, Ak.",
    role: "Finance & Internal Control",
    docCode: "PO-2026-039",
    details: "Verifikasi 3 dokumen (PO vs GR-089 vs Tagihan INV-BKN-2026-11) cocok 100% senilai Rp8.500.000.",
  },
  {
    id: "log-8",
    timestamp: "14 Sep, 14:15",
    module: "finance",
    action: "Cash Advance Disbursed",
    user: "Dewi Lestari, Ak.",
    role: "Finance & Internal Control",
    docCode: "EXP-2026-074",
    details: "Mencairkan dana kasbon pameran Rp3.000.000 via transfer BCA Ref: TRX-BCA-99210.",
  },
];
