# Verifikasi demo terpandu Alur Kendali

Implementasi: 18 September 2026. Mode Anti Slop: selama pengerjaan. Controlled Flow: ENERGY 2 / RHYTHM 2 / MOTION 2.

## Hasil implementasi

- `/demo` menjadi pemilihan kasus dengan pratinjau proses yang berbeda untuk setiap kategori.
- Empat kategori memiliki panduan, perpindahan peran yang eksplisit, aksi bisnis simulasi, hasil, dan riwayat dokumen.
- Finance mendukung pengajuan, persetujuan, verifikasi/pembayaran simulasi, serta penolakan beralasan.
- Inventory memindahkan saldo antara gudang, dalam perjalanan, dan cabang, dengan total 110 rim tetap konsisten.
- Procurement mendukung penerimaan barang dan perbandingan dokumen; pembayaran ditahan untuk tagihan berselisih.
- Operations mencatat pemeriksaan, pelaksana, waktu, dan laporan selesai.
- Mode eksplorasi terpisah, dengan detail dokumen yang mengikuti state terbaru, modal native, filter, serta aksi sesuai peran.
- Ringkasan manajemen mengikuti data panduan. Reporting menghubungkan kode dokumen, kategori, sumber data, dan ekspor CSV nyata.
- CTA kategori pada LP masuk ke skenario terkait; Reporting menuju ringkasan manajemen.
- Progress terversi disimpan lokal; refresh/resume, reset per kategori, data rusak, serta storage yang diblokir memiliki penanganan.

## Bukti pemeriksaan

- `qa/guided-domain.cjs`: 10 kelompok pengujian domain lulus, mencakup peran, urutan status, duplikasi, audit, stok, penerimaan, tagihan, dan schema data tersimpan.
- `qa/artifacts/guided-verification.json`: 12 kelompok pemeriksaan browser lulus; empat alur utama, penolakan, reload, reset, eksplorasi, filter, CSV, dan CTA LP.
- Axe WCAG A/AA: tidak ada pelanggaran terdeteksi pada delapan route yang diuji.
- 40 kombinasi route/viewport (360, 390, 768, 1024, 1440 px): tidak ada overflow halaman. Navigasi kategori menggunakan scroll lokal pada layar sempit.
- Pembesaran CSS 200% pada Finance: tidak ada overflow halaman. Ini pengujian emulasi, bukan pengujian perangkat fisik.
- Tidak ada pageerror pada rangkaian browser tersebut.
- `qa/artifacts/guided-resilience.json`: Finance selesai hanya dengan Tab/Enter pada 390 px; data JSON rusak pulih; browser storage diblokir tetap dapat menjalankan demo pada sesi berjalan.
- Screenshot desktop dan mobile ada di `qa/artifacts/guided-*.png`.

## Anti Slop delivery gate

### Hard Gate

- R-02 PASS: copy komponen demo baru tidak memakai em dash.
- R-03 PASS: 40 kombinasi viewport/route tidak mengalami overflow halaman; Finance juga diperiksa pada pembesaran 200%.
- R-17 PASS: ringkasan dihitung dari status dan aktivitas simulasi, tanpa persentase kepatuhan karangan.
- R-18 PASS: tidak ada testimonial atau logo klien; perusahaan dan orang pada data diberi konteks contoh.
- R-23 PASS: logo menggunakan aset LP yang sudah ada; pratinjau dokumen adalah ilustrasi data contoh.
- R-24 PASS: kategori, ringkasan, riwayat, dan tautan dari LP mengarah ke route yang ada.
- R-25 PASS: axe tidak menemukan pelanggaran kontras pada delapan halaman yang diperiksa.
- R-26 PASS: aksi utama, filter, dokumen, checkbox, reset, peran, dan CSV dijalankan pada browser; lampiran contoh tidak disamarkan sebagai unduhan berkas asli.
- R-27 PASS: loading, hasil pencarian kosong, validasi, data rusak, dan storage tidak tersedia memiliki pesan dan jalan keluar.
- R-28 PASS: demo tidak menambahkan FAQ generik.
- R-32 PASS: Finance diselesaikan dengan keyboard; reset mendukung Escape dan mengembalikan fokus; input berlabel dan focus-visible tersedia.
- R-33 PASS: fitur ditulis dalam source TS/TSX/CSS; script QA hanya memverifikasi perilaku dan render.
- R-34 PASS: tema terang mengikuti LP; tidak ada kontrol tema yang setengah berfungsi.
- R-35 PASS: aplikasi dijalankan di browser; alur utama dan kontrol pendukung diuji dengan hasil tersimpan.
- R-36 PASS: reporting menyebut penyimpanan lokal untuk demo dan tidak mengklaim audit immutable, transfer bank nyata, atau kepatuhan keamanan.
- R-37 PASS: arah visual berasal dari LP dan Controlled Flow; dial ditetapkan sebelum implementasi.
- R-38 PASS: dokumen, stok, perusahaan, dan pembayaran secara eksplisit merupakan simulasi.

### Purpose Gate

- R-01/R-07 PASS: latar menggunakan warna solid. Garis pada mini dokumen merepresentasikan baris isi dokumen, tanpa glow atau grid dekoratif.
- R-04 PASS: tanda centang menunjukkan selesai, panah menunjukkan arah proses atau navigasi; tidak menambahkan library ikon generik.
- R-06 PASS: Inter mengikuti LP; angka tabular membantu perbandingan saldo dan nominal.
- R-08 PASS: panah digunakan pada perpindahan tahap, perpindahan barang, dan tautan menuju detail.
- R-09 PASS: status berupa label fungsional dan progress; tidak ada badge marketing.
- R-10/R-13 PASS: tidak memakai glassmorphism atau glow.
- R-12 PASS: bayangan hanya membedakan dokumen fisik, panel kerja, dan dialog dari latarnya.
- R-14 PASS: pilihan kategori memiliki struktur konsisten untuk membandingkan kasus, tetapi komposisi visual serta area kerjanya berbeda.
- R-19 PASS: transisi singkat pada tombol dan progress membantu respons tindakan; reduced motion mematikan transisi.
- R-22 PASS: nota, lokasi stok, tiga dokumen pengadaan, dan checklist menggambarkan proses kategori yang bersangkutan.

### Liveliness

- Dial PASS: ENERGY 2 melalui bentuk dokumen dan kontras aksen; RHYTHM 2 melalui pembagian panduan/pekerjaan/riwayat; MOTION 2 melalui respons kontrol dan progress.
- Fokus PASS: pilih kasus pada hub; satu langkah dan tindakan utama pada tiap skenario; hasil dan riwayat saat selesai.
- Whitespace PASS: memisahkan konteks, tahap, area kerja, dan bukti aktivitas.
- Aksen PASS: biru mengikuti identitas LP; hijau hanya menandai hasil selesai dan konteks checklist.
- Identitas PASS: dokumen dan perpindahan pekerjaan menjadi motif berulang yang relevan dengan Alur Kendali.

### Craftsmanship & Quality Locks

- C-1/R-31 PASS: pilihan warna, kedalaman, komposisi kategori, dan tipografi memiliki tujuan yang dijelaskan di atas.
- C-2 PASS: transaksi simulasi mengubah data; filter bekerja; ekspor menghasilkan berkas; tidak ada tombol palsu.
- C-3/R-05 PASS: halaman dimulai dari kasus bisnis, diikuti pekerjaan dan hasil; tidak menambahkan struktur marketing generik.
- C-4 PASS: responsive, keyboard, persistence, error, validasi, dan reset diuji.
- C-5 PASS: semua fakta yang ditampilkan tentang hasil demo berasal dari state atau data contoh yang berlabel.
- R-11 PASS: radius dibedakan antara dokumen, tombol, panel, dan step indicator.
- R-15/R-16 PASS: CTA menyebut aksi konkret seperti kirim, setujui, terima, cocokkan, dan simpan; tidak memakai slogan AI.
- R-20/R-30 PASS: tiap kategori menggunakan dokumen dan pekerjaan Alur Kendali, dengan identitas LP yang sudah tersedia.
- R-21/R-29 PASS: tema terang berasal dari brand; palet ink/white/blue dengan warna status kontekstual.

## Batas bukti

Pemeriksaan otomatis dan review screenshot tidak membuktikan calon pengguna memahami demo. Uji pemahaman 3–5 calon pengguna, validasi pada perangkat fisik, dan evaluasi produksi belum dilakukan. Tidak ada deployment publik, backend produksi, transfer uang, atau pengiriman barang nyata.

## Pemeriksaan akhir

- Build produksi Next.js dan pemeriksaan TypeScript: PASS.
- Konteks konsultasi: PASS; kategori Inventory diteruskan ke pesan konsultasi dari LP, dengan pembukaan layanan eksternal diintersep selama tes. Tidak ada pesan dikirim.
- Link akses cepat keyboard disembunyikan secara visual saat tidak fokus; alur Finance tetap selesai memakai Tab/Enter setelah perbaikan.
- Screenshot hub final: `qa/artifacts/guided-picker-final.png`.
