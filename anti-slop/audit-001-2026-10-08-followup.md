# Follow-up audit 001: perbaikan LP Alur Kendali

Tanggal: 8 Oktober 2026. Mode: AFTER. Pemilik menyetujui semua nomor (1-18), dengan keputusan berikut.

## Status per temuan

| No | Status | Yang dilakukan |
|---|---|---|
| 1 | Dipertahankan (owner override R-37) | Pemilik menyatakan klaim kredensial benar dan founder sudah dikenal audiens. Dicatat di `DESIGN.md`. |
| 2 | Dipertahankan (owner override R-37) | Pemilik mengonfirmasi NDA dan kata "tim" akurat. |
| 3 | Sebagian | Nomor tetap lewat `NEXT_PUBLIC_WHATSAPP_NUMBER` (diisi pemilik). Dialog tidak lagi menyebut email bila email kosong; teks status internal ("nomor dapat ditambahkan nanti") dihapus. **Masih pemblokir publikasi sampai nomor diisi.** |
| 4 | Diperbaiki | Plus Jakarta Sans untuk h1/h2 dan suara founder; Inter untuk body. Instrument Serif sempat dipakai lalu diganti atas permintaan pemilik (terlihat sempit). Alasan dicatat di `DESIGN.md`. |
| 5 | Diperbaiki | Reveal generik dihapus. Setiap section punya gerak bertujuan (storyboard di `DESIGN.md`). |
| 6 | Diperbaiki | Panah hanya di CTA utama hero/akhir dan tautan menuju demo. Karakter "→" dihapus dari label. |
| 7 | Diperbaiki | Masalah: 1 utama + 3 baris dengan adegan berbeda. Cara kerja: rel proses. Pilar founder: daftar bergaris. Fit: daftar, bukan kartu. |
| 8 | Diperbaiki | Badge "Kualifikasi Utama", "Saran Objektif", "Simulasi Alur Kerja" dan nomor non-urutan dihapus. |
| 9 | Diperbaiki | Garis kiri di hero, blockquote, catatan persetujuan, dan sumber laporan dihapus. |
| 10 | Diperbaiki | Latar: putih, krem (masalah), satu tint biru (band demo dan CTA akhir). Hijau founder dihapus. |
| 11 | Diperbaiki | Judul pilar ditulis ulang dalam bahasa Indonesia konkret. "We don't do guesswork." dipertahankan sebagai suara founder. |
| 12 | Diperbaiki | Section comparison digabung ke demo; cerita tidak lagi diulang tiga kali. |
| 13 | Dipertahankan (owner) | Founder tanpa nama atas keputusan pemilik (lihat no. 1). |
| 14 | Diperbaiki | Fit dan FAQ digabung dalam satu section dua kolom. |
| 15 | Diperbaiki | `<br>` paksa dihapus dari heading (kecuali komposisi tiga baris pernyataan founder); `text-wrap: balance`. |
| 16 | Diperbaiki | Header memakai ikon + wordmark teks; logo bertagline hanya di footer. |
| 17 | Diperbaiki | "Coba demo X" menjadi tombol sekunder, "Diskusikan X" link teks; "Live Demo" menjadi "Coba Demo Interaktif". |
| 18 | Diperbaiki | Gaya inline link portal demo diganti kelas CSS. |

## Bukti pemeriksaan

- `npm run typecheck` dan `npm run build` (Turbopack): PASS.
- `npm run test:locale:copy`: PASS (791 entri). `npm run test:demo:state`: PASS (10 kelompok).
- `qa/motion-check.cjs`: PASS pada 1366, 768, 375 px dan 1366 px reduced motion. Tidak ada overflow horizontal, semua h2 terlihat setelah scroll, tidak ada console error atau hydration mismatch. Screenshot di `qa/artifacts/motion-*.png`.
- `qa/landing-clickthrough.cjs` (R-35), semua PASS:
  - nav Solusi / Cara kerja / Pendekatan kami → anchor terlihat;
  - CTA hero, nav, akhir, footer WhatsApp → dialog kontak; Salin pesan → "Pesan tersalin."; Escape menutup;
  - footer Privasi → dialog privasi, Escape menutup;
  - tab solusi: klik Procurement, ArrowRight → Operations, ilustrasi mengikuti; "Diskusikan Operations" → dialog berkonteks workflow / approval;
  - demo: tombol jeda mengubah aria-pressed; tab 04 → 4 event audit, autoplay berhenti; ArrowLeft → tahap 03;
  - FAQ: buka dengan klik, tutup dengan Enter;
  - toggle ENG → heading berbahasa Inggris;
  - "Coba Demo Interaktif" → /demo;
  - mobile: menu buka, Escape menutup, link menavigasi dan menutup menu; sticky CTA muncul setelah hero dan membuka dialog;
  - tidak ada page error.
- Kontras warna baru (dihitung): terendah 5,31:1 (#636874 di #fbf9f6). Semua ≥ 4,5:1.
- Ukuran JS halaman `/` (build webpack, `qa/bundle-size.cjs`): 174,9 KB → 212,2 KB gzip (+37,3 KB).
- Em dash: tidak ada di komponen, CSS, atau copy.

## Delivery Gate

Block 1 (Hard Gate): R-02 PASS (tanpa em dash). R-03 PASS (tiga lebar, tanpa overflow). R-17 PASS (angka hanya di ilustrasi berlabel "Contoh angka" / "Data ilustrasi"). R-18 PASS. R-23 PASS (wordmark teks dari nama merek, ikon dari aset yang ada). R-24 PASS (nav ke anchor dan /demo yang ada). R-25 PASS. R-26 PASS (click-through di atas). R-27 PASS (tidak ada UI data baru; dialog punya status gagal salin). R-28 PASS (FAQ lama, spesifik produk). R-32 PASS (tab dan FAQ dengan keyboard, Escape untuk dialog/menu). R-33 PASS (semua di source). R-34 PASS (satu tema). R-35 PASS. R-36: klaim no. 1/2 dipertahankan atas pernyataan pemilik (override tercatat). R-37 PASS (dial dan arah di `DESIGN.md`). R-38 PASS.

Block 2 (Purpose-Gate): R-01 PASS (tanpa gradien; fade kecil di adegan chat untuk menandai pesan yang tergulir). R-04 PASS (ikon dokumen/chat/grid/perisai relevan). R-06 PASS (alasan Plus Jakarta Sans tertulis). R-07 PASS. R-08 PASS. R-09 PASS. R-10 PASS (blur hanya header saat scroll, warisan). R-12 PASS. R-13 PASS. R-14 PASS. R-19 PASS (tujuan tiap gerak tertulis; satu loop dengan tombol jeda). R-22 PASS.

Block 3 (Liveliness): dial ENERGY 2 / RHYTHM 3 / MOTION 3 dideklarasikan; komposisi section berbeda-beda; satu fokus per layar; aksen biru di momen kunci; motif identitas: garis alur yang tergambar (hero, band demo, rel cara kerja, CTA akhir).

Block 4 (Craftsmanship): tidak ada temuan terbuka selain no. 3 (nomor WhatsApp) yang menunggu pemilik.

## Batas bukti

Belum diuji pada perangkat fisik, Safari, atau dengan calon pengguna. Pemeriksaan visual memakai screenshot headless setelah animasi selesai; kualitas gerak saat berjalan perlu dilihat langsung di browser. `npm run test:demo:browser` dan `test:locale:browser` (skrip lama yang mengarah ke port 3000) tidak dijalankan ulang.
