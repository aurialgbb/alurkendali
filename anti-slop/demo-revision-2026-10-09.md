# Revisi demo interaktif: dari alat uji ke alat jualan

Tanggal: 9 Oktober 2026. Mode antislop: AFTER (pilihan sesi). Keputusan pemilik:
- cakupan: semua;
- mode eksplorasi: disembunyikan menjadi "mode bebas";
- pergantian peran: animasi serah-terima otomatis.

Dial: ENERGY 2 / RHYTHM 2 / MOTION 3, mengikuti LP.

## Status per temuan

| Temuan | Status | Yang dilakukan |
|---|---|---|
| Momen "aha" lemah | Diperbaiki | **Finance:** nota bertanda "Belum dicocokkan" sampai Finance memverifikasi; total pengajuan dan nota disorot saat dibandingkan; stempel "Disetujui Manager" muncul di dokumen. **Procurement:** tagihan pertama selalu Rp3.500.000, sehingga pembayaran ditahan sebelum tagihan koreksi diterima. **Inventory:** paket bergerak gudang → jalan → cabang, total 110 rim berkedip di setiap perpindahan. **Operations:** setiap centang menampilkan pelaksana dan jamnya. |
| Owner tidak pernah "duduk di kursinya" | Diperbaiki | Setiap kasus berakhir di **Tampilan owner**: ringkasan dari state kasus (tanpa angka karangan), jejak siapa melakukan apa dan kapan, dan CTA utama. Tab Ringkasan menjadi "Tampilan owner". |
| CTA nyaris tidak ada | Diperbaiki | CTA "Diskusikan proses Anda" ada di header semua halaman demo, kursi owner, panel penolakan, picker, dan Tampilan owner. Tanpa nomor WA, CTA kembali ke LP dengan dialog kontak **langsung terbuka** (`?kontak=1`), membawa kategori. Setiap klik dicatat lewat `track()`. |
| Penolakan jalan buntu | Diperbaiki | Tombol "Coba lagi dengan persetujuan" dan CTA kontak. |
| Klik "Lanjut sebagai X" | Diperbaiki | Serah-terima otomatis sekitar 1,4 detik; dokumen kecil berjalan di strip pemeran. Hemat 2 klik per kasus. Reduced motion: langsung. |
| Tidak ada onboarding | Diperbaiki | Strip pemeran: "Anda akan memerankan 3 orang", urutan peran, estimasi sekitar 1 menit. |
| Panduan dan tombol terpisah jauh; fokus melompat | Diperbaiki | **Desktop:** panduan dan jejak menempel (sticky) di samping dokumen. **HP:** urutan panduan → dokumen → jejak, dan tombol aksi menempel di bawah layar. Fokus memakai `preventScroll`. |
| Riwayat di paling bawah | Diperbaiki | Jejak pekerjaan live di samping dokumen, entri baru masuk dengan animasi. |
| Visual tertinggal dari LP | Diperbaiki | Heading Plus Jakarta Sans, logo ikon + wordmark, latar putih dengan permukaan kertas hangat, token warna (hijau = selesai, amber = ditahan), radius 6/10/14, Motion. |
| Disclaimer berulang, hitungan langkah tidak konsisten | Diperbaiki | Disclaimer hanya di header ("Semua data di sini contoh") dan satu baris pembayaran. "Tahap x dari y" selaras dengan progress; "Hasil" memakai centang. |
| Copy kaku | Diperbaiki | Panduan, error, notifikasi, picker, ringkasan, riwayat, dan mode bebas ditulis ulang. Data contoh berbahasa Inggris diterjemahkan. |
| Navigasi HP terpotong | Diperbaiki | 7 tab menjadi 5 + "Tampilan owner"; di ≤760px diganti satu pemilih kasus. |
| Mode eksplorasi membingungkan | Diperbaiki | Menjadi "mode bebas" dengan link kecil di picker dan Tampilan owner. Dibuka sebagai Direktur sehingga tidak ada dokumen terkunci. Riwayat diurutkan terbaru (aksi pengunjung di atas data contoh), label kategori dan format waktu diseragamkan. |
| `demo.css` berantakan | Diperbaiki | Ditulis ulang per bagian: token, aturan mati dihapus, satu blok per breakpoint, reduced motion di akhir. |

## Bukti pemeriksaan

- `npm run typecheck`, `npm run build`: PASS.
- `npm run test:demo:state`: PASS (10 kelompok). Tes eksplorasi kini menyetel peran Staf secara eksplisit karena default berubah ke Direktur.
- `npm run test:locale:copy`: PASS (943 entri). `qa/untranslated-check.cjs`: semua `tr()` punya terjemahan Inggris, kecuali nama perusahaan contoh.
- `qa/guided-browser.cjs` (port 3100): 14 alur lulus, axe WCAG A/AA tanpa pelanggaran di 8 route, tanpa overflow di 360/390/768/1024/1440 px, zoom 200% tanpa overflow, tanpa page error.
- `qa/guided-resilience.cjs`: Finance selesai hanya dengan Tab/Enter di 390px (dengan serah-terima otomatis); data rusak dan storage diblokir menampilkan notifikasi dan demo tetap jalan.
- `qa/guided-contact.cjs`: `?kontak=1` membuka dialog dengan konteks kategori dan menghapus parameter dari URL; tanpa parameter, dialog menunggu klik; tidak ada popup.
- `qa/demo-check.cjs`: keempat kasus berakhir di Tampilan owner pada 1366, 768, 375 px dan reduced motion; tanpa overflow, console error, atau hydration warning. Screenshot setiap tahap: `qa/artifacts/demo-*.png`.
- LP: `qa/landing-clickthrough.cjs` dan `qa/motion-check.cjs` tetap PASS setelah konteks kontak diganti ke bahasa Indonesia.

## Delivery Gate (ringkas)

- **Hard Gate:**
  - R-02 PASS (tanpa em dash).
  - R-03 PASS (5 lebar).
  - R-17/R-38 PASS: semua angka di Tampilan owner dan ringkasan dihitung dari state; data contoh berlabel.
  - R-24 PASS: nav ke route yang ada.
  - R-25 PASS (axe).
  - R-26/R-35 PASS (click-through di atas).
  - R-27 PASS: loading, kosong, data rusak, storage diblokir.
  - R-32 PASS: keyboard saja.
  - R-36 PASS: pembayaran tetap disebut simulasi.
- **Purpose-Gate:** setiap gerak punya tujuan tertulis di komentar kode:
  - serah-terima;
  - stempel keputusan;
  - paket stok;
  - total yang berkedip;
  - jejak live;
  - pratinjau picker sekali tampil;
  - angka owner dihitung naik.

  Tidak ada loop. Stempel huruf kapital dipakai sebagai metafora stempel dokumen, bukan label dekoratif.
- **Liveliness:** motif LP (garis alur) dipakai lagi di strip pemeran dan jalur paket.

## Batas bukti

- Belum diuji di perangkat fisik, Safari, atau dengan calon pengguna. Uji pemahaman 3–5 owner tetap disarankan.
- Alur dengan nomor WhatsApp terisi hanya diperiksa lewat kode (`contactHref`); nomor asli belum tersedia.
- Skrip lama `qa/verify.cjs`, `qa/locale-browser.cjs`, dan `qa/demo-refresh*.cjs` (port 3000) belum dijalankan ulang.
