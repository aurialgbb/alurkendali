Implementation plan: demo Alur Kendali yang mudah dipahami
Tanggal: 18 September 2026
Status: implementasi teknis selesai. Empat panduan, mode eksplorasi, ringkasan, riwayat, dan CTA kategori LP telah diterapkan. Pengujian domain, alur browser, responsive, keyboard, dan axe lulus. Uji pemahaman 3–5 calon pengguna serta pengujian perangkat fisik belum dilakukan. Bukti pemeriksaan: anti-slop/guided-demo-delivery.md.

1. Keputusan produk

Pertahankan satu aplikasi, dengan pintu masuk per kategori dari LP. Pengunjung mencoba satu masalah bisnis hingga melihat hasilnya, lalu dapat menjelajahi modul terkait. Mode terpandu menjadi pengalaman awal. Mode eksplorasi dan ringkasan manajemen tetap tersedia sebagai pilihan sekunder.

Sasaran pengguna: calon klien finance, operasional, dan pemilik bisnis yang belum memahami struktur aplikasi. Sasaran pengalaman: dalam satu layar pertama mereka tahu masalah yang dicontohkan, tindakan berikutnya, serta hasil yang akan diperoleh. Target durasi skenario utama 2–4 menit, untuk divalidasi melalui uji pengguna, bukan klaim performa yang ditampilkan sebagai fakta.

2. Struktur halaman dan perjalanan pengguna

- `/demo`: halaman pemilihan kasus, dengan pertanyaan “Proses mana yang ingin Anda rapikan?”. Finance menjadi contoh awal yang direkomendasikan. Kategori lain tetap mudah ditemukan.
- `/demo/finance`, `/demo/inventory`, `/demo/procurement`, `/demo/operations`: pertahankan URL yang ada; sediakan mode terpandu melalui parameter `?mode=guided`. Tombol “Jelajahi sendiri” membuka mode bebas.
- `/demo/overview`: pindahkan ringkasan manajemen yang sekarang berada di `/demo` ke sini. Periksa dan perbarui semua tautan internal yang bermaksud membuka ringkasan.
- `/demo/reporting`: jejak perubahan lintas modul, dapat dibuka dari hasil skenario dengan filter dan ID dokumen yang relevan.
- CTA setiap kategori solusi LP langsung menuju skenario terkait; CTA demo umum menuju pemilihan kasus.

Perjalanan: pilih masalah → lihat kasus contoh → lakukan tindakan → lihat perubahan → lanjutkan sebagai peran berikutnya → lihat rangkuman hasil. Setelah selesai, tawarkan “Ulangi skenario”, “Coba kategori lain”, dan konsultasi yang membawa konteks kategori. Jangan membuka konsultasi sebelum pengguna menekan CTA.

3. Anatomi pengalaman terpandu

Layar awal kategori memuat judul berbasis pekerjaan, kasus singkat dengan data contoh, pratinjau dokumen atau proses, dan satu tombol mulai yang spesifik. Hindari modal tutorial panjang.

Saat skenario berjalan:

- Header ringkas: kategori, label data simulasi, keluar dari panduan, ulangi skenario.
- Daftar tahap: tahap selesai, tahap aktif, tahap berikutnya. Jumlah tahap mengikuti proses sebenarnya.
- Area kerja utama: dokumen atau tugas yang sedang dikerjakan. Data lain disederhanakan pada mode terpandu.
- Panel pendamping: “Yang perlu Anda lakukan” dan alasan langkah tersebut diperlukan. Pada mobile, panel menjadi ringkasan di atas tindakan.
- Pergantian peran dilakukan dengan tombol jelas, misalnya “Lanjut sebagai Manager”. Jelaskan tanggung jawab yang berubah dan pertahankan ID dokumen. Pemilih semua peran tetap tersedia pada mode eksplorasi.
- Setelah aksi, perlihatkan status baru, perubahan angka bila relevan, dan catatan aktivitas. Tahap berikutnya terbuka setelah perubahan data berhasil, bukan setelah klik tombol panduan.
- Layar hasil merangkum dokumen, siapa yang menyetujui, status akhir, dan bukti yang terhubung. Semua berasal dari state skenario.

Panduan harus bisa ditutup, dilanjutkan setelah refresh, dan diulang tanpa menggandakan dokumen. Kunjungan langsung ke URL kategori harus tetap masuk akal tanpa melewati LP.

4. Skenario per kategori

| Kategori | Kasus utama | Langkah pengguna | Bukti hasil | Kebutuhan implementasi |
|---|---|---|---|---|
| Finance | Penggantian biaya operasional dengan nota contoh | Pakai data contoh dan ajukan → Manager memeriksa serta menyetujui → Finance memverifikasi bukti dan mencatat pembayaran simulasi → lihat hasil | Satu dokumen dengan nominal konsisten, riwayat persetujuan, serta referensi pembayaran simulasi | Gunakan aksi yang ada; perbaiki validasi, transisi, bukti contoh, dan audit |
| Inventory | Mutasi barang antar lokasi | Pilih barang dan jumlah → kirim dari gudang → konfirmasi penerimaan di cabang → lihat saldo dan riwayat | Jumlah di sumber, dalam perjalanan, dan tujuan tetap konsisten | Tambahkan model saldo/lokasi, aksi pengiriman, serta penerimaan; aksi saat ini terutama persetujuan penyesuaian |
| Procurement | Tagihan supplier dibandingkan dengan pesanan dan barang diterima | Tinjau dan setujui permintaan → catat penerimaan → bandingkan PO, penerimaan, tagihan → selesaikan pembayaran simulasi | Dokumen cocok atau selisih dijelaskan; pembayaran diblokir jika syarat belum terpenuhi | Tambahkan pencatatan penerimaan, pemeriksaan nilai/kuantitas, hasil cocok/selisih, dan guard pembayaran |
| Operations | Checklist pembukaan cabang | Buka tugas cabang → isi checklist → lihat pekerjaan tersisa → selesaikan dan tinjau hasil | Progress sesuai item, status selesai, pelaksana serta waktu tercatat | Gunakan checkbox yang ada; tambah pencatatan pelaksana/waktu dan audit penyelesaian |

Finance menjadi acuan pola interaksi dan visual sebelum diterapkan ke kategori lain. Skenario selisih tagihan dan penolakan biaya menjadi cabang tambahan sesudah alur utama stabil. Reporting menjadi bukti akhir skenario, bukan tutorial kelima yang wajib dijalani.

5. Arah visual: lebih hidup, tetap sesuai LP

Gunakan Controlled Flow dan Anti Slop selama implementasi. Design Read: demo B2B terpandu untuk calon pengguna nonteknis, gaya editorial dan ilustrasi proses dari LP, ENERGY 2 / RHYTHM 2 / MOTION 2.

Pertahankan Inter, ink #192334, secondary #566173, blue #2449D8, white, dan garis pemisah dingin. Tambahkan kedalaman melalui lapisan yang bermakna: latar aplikasi netral, area kerja putih, panel dokumen sedikit terangkat, dan panel panduan pale blue. Warm neutral menandai pekerjaan yang perlu diperiksa; hijau terbatas pada hasil selesai. Warna selalu disertai teks status.

Komposisi khas per kategori:

- Finance: lembar pengajuan berdampingan dengan nota contoh; jalur persetujuan menunjukkan perpindahan tanggung jawab.
- Inventory: lokasi asal, barang dalam perjalanan, lokasi tujuan; perubahan jumlah terlihat setelah aksi nyata.
- Procurement: tiga dokumen bersebelahan pada desktop, satu per satu pada mobile, dengan baris jumlah/nilai yang dapat dibandingkan.
- Operations: daftar cabang dan lembar checklist aktif, progress yang berasal dari item pekerjaan, serta informasi penanggung jawab.

Gunakan ilustrasi proses dari komponen yang ada bila cocok, dengan data yang benar-benar terkait skenario. Ornamen dan ilustrasi statis tidak boleh tampak seperti kontrol yang bisa diklik. Identitas kategori berasal dari komposisi dan isi, bukan empat palet berbeda.

Hierarki awal: judul 28–36 px desktop, 24–28 px mobile; teks utama 14–16 px; label 12–13 px. Gunakan satu tindakan primer pada setiap tahap. Bayangan ringan hanya untuk panel yang bertumpuk, drawer, dan dialog. Hindari membungkus setiap paragraf dalam kartu.

Motion: transisi status dan perpindahan panel sekitar 160–240 ms; sorotan singkat pada baris yang berubah; transisi progres hanya mengikuti aksi. Tidak ada pulse tanpa henti, confetti, angka bergerak tanpa perubahan data, atau modal tutorial berantai. Hormati prefers-reduced-motion.

6. Fondasi teknis dan perbaikan alur

Tetap gunakan Next.js App Router dan DemoProvider yang ada. Rencana komponen:

- `src/lib/demo-scenarios.ts`: definisi kategori, kasus, tahap, peran yang diperlukan, target dokumen, dan kondisi selesai.
- `src/components/demo/scenario-shell.tsx`: layout panduan desktop/mobile.
- `src/components/demo/scenario-progress.tsx`: tahap aktif dan navigasi yang memenuhi prasyarat.
- `src/components/demo/scenario-result.tsx`: rangkuman berbasis hasil skenario.
- `src/components/demo/role-handoff.tsx`: perpindahan peran yang dijelaskan kepada pengguna.
- `src/components/demo/document-preview.tsx`: bukti contoh dengan label simulasi; bedakan dari fitur unggah berkas nyata.
- `src/app/demo/demo.css` dan komponen tampilan: pindahkan override generik berbasis `.text-xs`, `nth-child`, dan nama utility ke kelas komponen eksplisit agar modul dapat berkembang tanpa merusak halaman lain.

State dan integritas:

- Pisahkan progress panduan dari status bisnis. Simpan scenario ID, target record ID, dan tahap; hitung penyelesaian tahap dari data bisnis.
- Kelola perubahan record dan audit secara atomik, idealnya melalui reducer. Saat ini beberapa aksi mengisi docCode di dalam state updater lalu menggunakannya di luar updater; pola tersebut perlu diganti agar referensi audit dapat diandalkan.
- Validasi peran, status asal, nominal, jumlah barang, serta prasyarat di fungsi aksi. Pembatasan tombol saja tidak cukup untuk menjaga urutan demo.
- Klik ulang tidak boleh menggandakan transaksi atau audit. Simpan selected record ID dan ambil detail terbaru dari store agar panel tidak menampilkan salinan stale.
- Untuk mutasi, pisahkan stok sumber, dalam perjalanan, dan diterima. Total barang tetap konsisten dan stok tidak boleh negatif.
- Hasil matching Procurement dihitung dari data dokumen; setujui PR tidak berarti penerimaan dan invoice sudah cocok.
- Reset skenario hanya mengulang data dan progress milik skenario tersebut. Pisahkan data terpandu dari eksperimen mode bebas, dengan versioned storage dan strategi migrasi data lama.
- Tangani state belum dimuat, localStorage tidak tersedia/rusak, serta progress yang tidak cocok lagi dengan versi data. Jelaskan bila perubahan hanya tersimpan selama sesi.
- Seluruh pembayaran dan lampiran contoh diberi konteks simulasi; jangan mengklaim transfer bank, bukti nyata, atau audit immutable.

7. Urutan pengerjaan dan definisi selesai

Tahap A: struktur dan desain Finance.
Hasil: pemilihan kasus, hubungan CTA LP, mockup Finance desktop/mobile di kode, pola panduan dan peran, serta desain hasil. Selesai ketika masalah, tindakan pertama, dan hasil yang dijanjikan terlihat tanpa penjelasan lisan.

Tahap B: Finance lengkap.
Hasil: satu skenario dapat dijalankan hingga selesai; bukti contoh terbuka; perpindahan peran jelas; validasi dan audit terhubung; refresh/resume/reset bekerja. Selesai ketika dokumen yang sama dapat dilacak sejak pengajuan hingga hasil tanpa tombol buntu atau status palsu.

Tahap C: kategori lain.
Hasil: Inventory, Procurement, Operations mengikuti pola panduan yang sama tetapi memakai komposisi proses berbeda. Dahulukan aksi bisnis yang belum tersedia, baru hubungkan langkah tutorial. Selesai ketika setiap tahap mengubah data yang dapat diverifikasi.

Tahap D: pengalaman lintas kategori.
Hasil: overview manajemen, hasil skenario menuju audit dokumen yang benar, mode eksplorasi, keluar/lanjutkan panduan, serta CTA konsultasi berkonteks. Navigasi dari LP dan tautan langsung diuji.

Tahap E: pemeriksaan dan uji pemahaman.
Hasil: build/typecheck, pengujian alur, review visual, dan catatan uji pengguna. Perbaiki titik bingung sebelum dibagikan luas. Jangan menyamakan build lulus dengan pengguna sudah memahami demo.

8. Acceptance criteria sebelum demo dibagikan

- Pengunjung dapat memilih kategori, memulai, dan menyelesaikan skenario tanpa fasilitator menunjukkan tombol berikutnya.
- Setiap halaman skenario menjawab: sedang melakukan apa, sebagai siapa, tindakan selanjutnya apa, dan apa hasilnya.
- Skenario Finance, Inventory, Procurement, dan Operations lulus uji end-to-end, termasuk prasyarat peran, klik ganda, refresh, ulangi, dan navigasi kembali.
- Terdapat pengujian bermakna untuk audit referensi, transisi ilegal, stok konsisten, dan pembayaran saat dokumen belum cocok.
- Empty, loading, error, dan aksi tidak tersedia memiliki penjelasan serta jalan keluar.
- Semua kontrol diubah/ditambahkan dicoba; dialog memiliki focus management, Escape, label form, dan error yang terbaca. Keyboard saja dapat menyelesaikan alur utama.
- Render diverifikasi pada lebar 360, 390, 768, 1024, 1440 px dan zoom 200%; tidak ada overflow halaman. Tabel panjang memiliki scroll lokal dengan petunjuk jelas.
- Kontras WCAG AA diperiksa, tap target utama sekitar 44 px, reduced motion bekerja, dan perubahan status dapat diumumkan melalui live region.
- Angka ringkasan dan hasil dihitung dari data; gambar, perusahaan, dokumen, dan pembayaran contoh dikenali sebagai simulasi.
- LP tetap konsisten setelah perubahan shared CSS. Tidak ada error runtime; typecheck dan build lulus.
- Uji dengan 3–5 calon pengguna yang relevan: minta mereka mencoba kasus tanpa petunjuk lisan. Catat keberhasilan, salah klik, kebingungan peran, waktu penyelesaian, dan kemampuan menjelaskan hasil. Ini target validasi yang masih perlu dilakukan, bukan hasil uji saat ini.

9. Batas scope

Pekerjaan ini mencakup pengalaman demo, aksi simulasi yang dibutuhkan skenario, data contoh, dan integrasi navigasi LP. Backend produksi, autentikasi nyata, koneksi bank/ERP, upload dokumen sensitif, dan deployment publik tidak masuk scope rencana ini. Mode bebas tetap menggunakan aplikasi yang sama. Jangan memecah menjadi empat codebase atau membuat empat produk yang perlu dipelihara terpisah.
