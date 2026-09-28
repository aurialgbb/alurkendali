# Alur Kendali

Landing page lokal untuk Business Systems & Controls Consulting, berdasarkan `../LP Implementation Plan`.

## Menjalankan

```powershell
cd "C:\Users\auria\OneDrive\Documents\14. Business Project\landing-page"
npm ci
npm run dev
```

Buka http://127.0.0.1:3000. Build produksi: `npm run build`, kemudian `npm run start`.

## Mengganti identitas dan kontak

- `src/lib/site.ts`: nama brand, penanda nama sementara, nomor WhatsApp, email, LinkedIn, solusi, dan FAQ.
- `.env.local`: isi `NEXT_PUBLIC_WHATSAPP_NUMBER` dengan nomor bisnis internasional, misalnya format `62...` tanpa tanda tambah atau spasi. Gunakan nomor yang Anda kuasai. Restart server setelah mengubah variabel ini.
- `src/components/landing.tsx`: isi hero, proses kerja, kredibilitas founder, dan demo.
- `src/app/globals.css`: warna, ukuran, spacing, animasi, dan aturan mobile.
- `src/app/layout.tsx`: judul halaman dan metadata. Pengindeksan dimatikan selama pratinjau lokal.
- `src/app/icon.svg`: monogram sementara untuk favicon.

Brand yang tampil saat ini adalah Alur Kendali. Monogram `ak.` dan wordmark pada komponen Brand perlu disesuaikan ketika identitas final dipilih. Kredibilitas founder mengikuti dokumen pengguna; tidak ada nama individu atau firma yang dikarang.

Jika WhatsApp belum diisi atau formatnya tidak valid, CTA membuka pratinjau pesan yang dapat disalin. Jika nomor valid tersedia, CTA membuka WhatsApp dengan pesan sesuai kategori. Aplikasi tidak mengirim pesan secara otomatis. Email dan LinkedIn hanya muncul jika konfigurasinya terisi.

## Isi versi lokal

Navbar responsif, hero diagram, empat masalah bisnis, lima tab solusi, before/after, demo Purchase & Expense empat tahap, empat langkah engagement, founder, fit qualification, lima FAQ, CTA akhir, footer, dan informasi privasi lokal.

Demo interaktif tersedia di `/demo`: pilih Finance, Inventory, Procurement, atau Operations. Setiap kategori memiliki panduan, pergantian peran, perubahan data simulasi, hasil, dan riwayat. Mode eksplorasi menggunakan data terpisah. Tidak ada backend produksi, autentikasi, upload nota asli, atau pembayaran nyata. Font Inter dimuat dari proyek; lisensinya tersedia di `src/app/fonts/OFL.txt`.

Progress panduan disimpan pada localStorage `alur_kendali_guided_v1`. Reset skenario hanya memengaruhi kategori yang dipilih. Data eksplorasi memakai `alur_kendali_demo_state_v2`, dengan pembacaan data v1 yang valid. Jika penyimpanan browser tidak tersedia, tampil pemberitahuan bahwa perubahan hanya berlaku selama sesi.

Route kategori memakai `?mode=guided` (juga default) atau `?mode=explore`. `/demo/overview` menampilkan ringkasan dari aktivitas panduan; `/demo/reporting` menyediakan filter dan unduhan CSV nyata. Deep link riwayat menggunakan `?scenario=finance&doc=EXP-DEMO-001`.

Event konversi tersimpan sementara di `window.alurEvents` (maksimum 100) dan dipancarkan sebagai event `alur:analytics`. `utm_source`, `utm_medium`, dan `utm_campaign` ikut dicatat untuk pengecekan lokal. Tidak ada penyedia analytics atau pengiriman event keluar. Muat ulang halaman untuk menghapus catatan.

## Verifikasi

```powershell
npm run typecheck
node qa/verify.cjs
npm run test:demo:state
npm run test:demo:browser
```

Server lokal harus aktif untuk pemeriksaan browser. Instal browser pengujian dengan `npx playwright install chromium` bila diperlukan. Alternatif: set `CHROME_PATH` ke executable Chrome yang tersedia. Hasil pemeriksaan tersimpan di `qa/artifacts/qa-results.json`; screenshot ada di folder yang sama.

Pemeriksaan demo terpandu memakai Chrome lokal melalui Playwright (`channel: chrome`) dan server `http://127.0.0.1:3000`. Hasil tersimpan di `qa/artifacts/guided-verification.json`. Domain checks mencakup urutan peran, audit atomik, duplikasi aksi, stok konsisten, dan pembayaran saat dokumen belum cocok. Browser checks mencakup empat alur, penolakan, refresh/resume, reset kategori, mode eksplorasi, CSV, axe, lima ukuran layar, serta zoom 200%. Uji pemahaman dengan calon pengguna tetap perlu dilakukan terpisah.

Pemeriksaan mencakup seluruh CTA, navigasi, lima solusi, empat tahap demo, FAQ, clipboard berhasil/gagal, modal, keyboard, event/UTM, overflow delapan ukuran layar, pembesaran teks 200%, reduced motion, serta axe WCAG A/AA. Target performa perlu dievaluasi kembali pada hosting produksi dan perangkat nyata.

## Sebelum publikasi

Ganti identitas sementara dan kontak; periksa kembali copy founder; tentukan domain, kebijakan privasi publik, dan penyedia analytics; sesuaikan robots/canonical/metadata. Belum ada deployment, domain publik, maupun layanan eksternal yang diaktifkan.

## Revisi alur

Bagian perbandingan memiliki animasi berulang empat tahap, dengan tombol jeda/putar. Saat bagian tidak terlihat atau tab browser tidak aktif, progres berhenti sementara. Pengaturan reduced motion menampilkan seluruh tahap selesai tanpa animasi. Implementasinya ada di `src/components/controlled-flow.tsx`; hasil pemeriksaan revisi ada di `REVISION-NOTES.md`.
