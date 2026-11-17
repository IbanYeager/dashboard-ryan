# SISTEM INFORMASI & DASHBOARD SUPERVISOR SALES TIM 1 PAK RYAN (FERYANTO)
## Tunas Toyota Cabang Kiara Condong &mdash; Bandung

### 1. Ringkasan Proyek
Proyek ini merupakan sistem dashboard monitoring penjualan dan operasional supervisi komprehensif mandiri khusus untuk **Supervisor Sales Tim 1 &mdash; Pak Ryan (Feryanto)** pada Tunas Toyota Cabang Kiara Condong, Bandung. 

Sesuai instruksi dan kebutuhan operasional:
1. **Data Terisolasi Khusus SPV Ryan**: Seluruh data yang disajikan difokuskan khusus untuk data penjualan, prospek, wiraniaga, teritori FOA, taksasi OLX Autos, dan alokasi AO report di bawah naungan SPV Ryan (tidak bercampur dengan SPV Alvin atau SPV Riva).
2. **Input Mandiri Hot Prospek (Smart Paste Otomatis)**: User atau SPV dapat menambahkan data hot prospek secara mandiri hanya dengan melakukan *paste* teks dari WhatsApp, tabel Excel/Google Sheets, atau catatan multi-baris. Sistem melakukan parsing otomatis secara instan dan menyimpan data ke browser (`localStorage`).
3. **Plan Activity Tim 1 SPV Ryan**: Menyajikan monitoring rencana aktivitas bulanan (SPM by Activity) per funnel (Leads, Prospect, Hot Prospect, SPK Firm, Retail Sales/DO) dalam 6 periode 5 harian (Agustus 2026).
4. **SPK, DO & Analisis Pembiayaan Leasing Multi-Tahun**:
   - Transaksi Delivery Unit (DO) YTD 2026 (336 unit closed).
   - DO September 2026 (39 unit delivery SPV Ryan).
   - SPK September 2026 (32 unit SPK masuk SPV Ryan).
   - SPK Borrow & Outstanding (30 unit SPK Open/Approved belum DO dengan alert SPK > 2 bulan dari Kepala Cabang).
   - Rekap historis multi-tahun (2024, 2025, 2026) dan komposisi mitra leasing (MTF, TAFS, ACC, KKB BCA, MUF, Adira, Cash).
5. **Fokus FOA (Field Operation Activity / Outlet Area)**: Penugasan 12 wiraniaga Tim Ryan di 10 kecamatan teritori fokus, target SPK & DO, model unggulan (Veloz HV, Rangga, Avanza, Zenix, Reborn), dan agenda test drive lapangan perumahan (Residential Kiarasari, Buah Batu, Ciwastra Park, Mobile Car Show, Live TikTok).
6. **OLX Autos Trade-In (Khusus SPV Ryan)**: Monitoring 26 unit mobil seken konsumen yang diappraisal tukar tambah dengan total nilai taksasi Rp 5,22 Miliar dan rasio deal 42.3% (11 unit deal) periode Juni &ndash; September 2026.
7. **Area Operation (AO) Report (Khusus SPV Ryan)**: Integrasi laporan resmi Area Operation Tunas National as of 5/5/2026 (matching ratio 38%, full stock 77, OS firmed 13, potential DO 6, STO efficiency 103%) beserta target alokasi Tim Ryan (35 unit DO, gap 32 SPK) dan viewer diagram visual beresolusi tinggi.
8. **Inklusi Service Berkala (SBI)**: Modul **Service Berkala (SBI)** tetap terintegrasi mengawal 704 kendaraan delivery tim Ryan (CAI Rate 76.3%, 534 unit sudah datang servis).

---

### 2. Struktur Direktori Proyek
```
c:\Users\TUNAS\Downloads\www\dashboard_spv_ryan\
├── index.html                           # Antarmuka utama dashboard (Single Page Application 12 Modul)
├── SPEC.md                              # Dokumentasi arsitektur dan spesifikasi data
├── assets\
│   ├── css\
│   │   └── style.css                    # Desain sistem profesional 2-tone Tunas Toyota & modal styling
│   ├── js\
│   │   ├── ryan_data.js                 # Dataset terverifikasi terintegrasi khusus Tim Ryan (zero-latency)
│   │   └── app.js                       # Controller, Smart Paste parser, interactive charts, filter & pagination
│   └── img\
│       ├── team\
│       │   └── feryanto.png             # Foto avatar resmi SPV Feryanto (Pak Ryan)
│       └── reports\
│           └── ao_report.png            # Diagram visual resmi Area Operation Report
└── data\
    ├── ryan_sales_transactions.json     # 336 data transaksi delivery unit YTD tim Ryan
    ├── ryan_hot_prospects.json          # 105 data prospek aktif & hangat tim Ryan
    ├── ryan_plan_activity.json          # 65 data rencana aktivitas SPM tim Ryan 6 periode
    ├── ryan_fokus_foa.json              # 12 data penugasan FOA wiraniaga tim Ryan
    ├── ryan_olx_tradein.json            # 26 data taksasi trade-in OLX tim Ryan
    ├── ryan_ao_report.json              # Data parameter dan model breakdown AO Report
    ├── ryan_spk_september.json          # 32 data SPK masuk September tim Ryan
    ├── ryan_spk_borrow.json             # 30 data SPK borrow & outstanding tim Ryan
    ├── ryan_do_september.json           # 39 data delivery DO September tim Ryan
    ├── ryan_leasing_history.json        # Rekap historis multi-tahun (2024-2026) & leasing
    ├── ryan_sbi_records.json            # 704 data tindak lanjut servis berkala (SBI) tim Ryan
    ├── ryan_salesforce.json             # 19 data profil dan kinerja wiraniaga tim Ryan
    └── ryan_funnel_summary.json         # Ringkasan tahapan sales & marketing funnel
```

---

### 3. Modul & Fitur Dashboard

#### A. Ringkasan Eksekutif (#overview)
- **4 Kartu KPI Utama**: Total Delivery DO (336 Unit), Total Omset OTR (Rp 88,42 M), Hot Prospek Siap Closing (105+ Leads), Database Retensi SBI (704 Unit).
- **Banner Akses Cepat Modul Baru**: Pintasan satu-klik ke modul Plan Activity, Leasing Multi-Thn, Fokus FOA, OLX Trade-In, dan AO Report.
- **Grafik Tren Bulanan**: Visualisasi bar bertumpuk Kredit vs Tunai periode Januari &ndash; Oktober 2026.
- **Grafik Distribusi Model**: Komposisi Avanza, Calya, Veloz, Innova Reborn, Zenix Hybrid, Rush, Fortuner, Agya.
- **Top 5 Wiraniaga**: Leaderboard kontribusi wiraniaga terbaik tim Ryan.

#### B. Hot Prospek Sales & Smart Paste (#prospek)
- **105+ Prospek Hangat**: Calon pembeli siap closing, negosiasi diskon/DP, atau appraisal trade-in.
- **Fitur Smart Paste Otomatis**:
  - Cukup paste teks pesan WhatsApp dari konsumen/wiraniaga, salinan baris tabel dari Google Sheets/Excel, atau format list.
  - Sistem mengekstrak nama, nomor telepon WhatsApp, wiraniaga, unit kendaraan, cara bayar, leasing, dan catatan secara otomatis.
  - Dilengkapi tombol template contoh cepat (*Contoh WhatsApp*, *Contoh Excel*, *Contoh Multi-Baris*).
  - Tinjauan pratinjau kartu sebelum disimpan.
- **Form Input Manual**: Opsi input detail per field dengan dropdown 19 wiraniaga Tim Ryan.
- **Penyimpanan Lokal Persisten**: Tersimpan di `localStorage` peramban, tidak hilang saat refresh, dapat direset kembali ke data awal kapan saja.
- **Badge Indikator Input Baru & Tombol Hapus**: Setiap data input mandiri diberi tanda khusus dan tombol hapus individual.
- **Ekspor CSV**: Mengunduh seluruh daftar prospek termasuk input mandiri ke format spreadsheet.

#### C. Plan Activity Tim Ryan (#activity)
- **Monitoring Rencana Aktivitas SPM**:
  - Saluran: Digital Marketing (Web, FB, IG), LIVE TikTok, Walk-in / Call-in, Customer Gathering & Showroom Event, Residansial & FOA.
  - Funnel: Leads, Prospect, Hot Prospect, SPK Firm, Retail Sales (RS / DO).
  - Periode: 1-5 Agt, 6-10 Agt, 11-15 Agt, 16-20 Agt, 21-25 Agt, 26-31 Agt, Total Target vs Actual.
- **Grafik Komposisi Saluran**: Bar chart perbandingan Target vs Realisasi per channel aktivitas.
- **Filter & Ekspor CSV**: Filter menurut saluran dan tahapan funnel.

#### D. SPK, Delivery (DO) & Penjualan (#penjualan)
- **4 Sub-Modul Terintegrasi**:
  1. *Transaksi DO YTD 2026*: 336 data transaksi delivery konsumen per invoice, SPK, VIN, wiraniaga, cara bayar, dan OTR.
  2. *DO September 2026*: 39 data delivery DO September dengan klasifikasi Retail/Fleet dan status leasing MTF.
  3. *SPK September 2026*: 32 data SPK masuk September lengkap dengan NVSO, warna, produk, dan status.
  4. *SPK Borrow & Outstanding*: 30 data SPK open & approved yang belum DO dengan status tanda jadi (DP), validasi admin, dan remarks SPV.
- **Peringatan Kepala Cabang**: Notifikasi khusus untuk SPK > 2 bulan dan invalid agar segera ditindaklanjuti.
- **Filter Multi-Kriteria**: Pencarian instan, filter bulan, filter model, filter wiraniaga, filter cara bayar, dan ekspor CSV.

#### E. Analisis Pembiayaan Leasing & Multi-Tahun (#leasing)
- **Komposisi Pembiayaan Tim Ryan**: 74.1% Kredit (249 unit) vs 25.9% Tunai (87 unit).
- **Pangsa Mitra Leasing**: MTF 92 unit (36.9%), TAFS 79 unit (31.7%), ACC 37 unit (14.9%), KKB BCA 15 unit (6.0%), MUF 5 unit (2.0%), Adira & Lainnya 21 unit (8.4%).
- **Rekap Multi-Tahun**:
  - *2024*: 677 unit DO (54 Hybrid, 8.0%), Retail 541, Fleet 66.
  - *2025*: 854 unit DO (105 Hybrid, 12.3%), Retail 689, Fleet 91.
  - *2026*: 682 unit cabang (Tim Ryan menyumbang 336 unit atau 49.3% kontribusi cabang).
- **Grafik Tren Bulanan Leasing Cabang**: Area chart bertumpuk volume bulanan MTF, TAF, ACC, Cash, dan Bank Lainnya.

#### F. Fokus FOA (Field Operation Activity) (#foa)
- **Penugasan 12 Wiraniaga Tim Ryan**: Erick, Yani, Juarna, Yeni, Dadan, Nova, Rahma, Fia, Egy, Jajang, Nuri, Shinta.
- **10 Teritori Binaan Fokus**: Kiaracondong, Bojongloa, Ujung Berung, Antapani, Buah Batu, Andir, Arcamanik, Cidadap, dll.
- **Target SPK & DO**: 15 Unit SPK dan 15 Unit DO teritori.
- **Fokus Model**: Veloz Hybrid, Hilux Rangga Pick Up, Avanza, Innova Zenix Hybrid, Innova Reborn, Agya, Rush.
- **Agenda Kegiatan Lapangan**:
  - Residential Kiarasari & Buah Batu (Test Drive Veloz & Zenix).
  - Residential Ciwastra Park & Batununggal (Display Avanza & Veloz).
  - Mobile Sabtu-Minggu Pagi & Live TikTok (PIC: Rahma, Juarna, Egy).

#### G. OLX Autos Trade-In Tim Ryan (#olx)
- **26 Data Taksasi Khusus Tim Ryan**: Periode Juni &ndash; September 2026.
- **Total Nilai Taksasi**: Rp 5,22 Miliar.
- **Tingkat Deal Trade-In**: 42.3% (11 unit deal closing).
- **Komposisi Merk Seken**: Toyota (13 unit), Honda (4 unit), Mitsubishi (2 unit), Daihatsu (2 unit), Mazda (1 unit), Suzuki (1 unit), BMW (1 unit).
- **Detail Taksasi**: Odometer (Km), masa berlaku pajak, catatan selisih bidding (gap 20-55 Juta), dan status negosiasi.

#### H. Area Operation (AO) Report (#aoreport)
- **Data Resmi AO Report (as of 5/5/2026)**:
  - Matching Ratio: **38%**.
  - Invoicable Stock: **77 Unit** (71 Free for Sales, 6 Matched).
  - Outstanding Orders (OS): **16 Unit** (13 Firmed Order, 3 Unfirmed).
  - Potensial DO dari OS: **6 Unit** (Waterfall closing: 4 unit tgl 21-25, 2 unit tgl 25-31).
  - OAP Target Cabang: **79 Unit** (Gap 73 unit kebutuhan SPK baru).
  - Efisiensi STO: **103%**.
- **Alokasi Supervisi Tim 1 Pak Ryan**:
  - Target DO Tim Ryan: 35 Unit / Bulan (44.3% kontribusi cabang).
  - Matching Stok Prioritas: Avanza G CVT, Calya G, Raize G MT, Hiace Premio.
- **Diagram Visual Resolusi Tinggi**: Arsip gambar diagram resmi Area Operation Report disematkan langsung dengan opsi tampilan layar penuh.

#### I. Marketing Funnel (#funnel)
- **6 Tahapan Pipeline Penjualan**: Activity (830) &rarr; Contact (245) &rarr; Prospect (100) &rarr; Hot Prospect (25) &rarr; SPK (15) &rarr; DO (12).
- **Grafik Horizontal Pipeline Funnel & Arahan Taktis Supervisi**.

#### J. Kinerja Wiraniaga (#wiraniaga)
- **Direktori Lengkap 19 Wiraniaga Tim Ryan**: Kartu produktivitas individu dan tabel peringkat berdasarkan DO unit dan omset OTR.

#### K. Service Berkala (SBI) & Retensi (#sbi)
- **704 Data Pelanggan SBI Tim Ryan**: CAI Rate 76.3%, 534 unit sudah datang, 384 prioritas HOT/HIGH.

#### L. Profil & Struktur Tim (#tim)
- Profil Supervisor Feryanto (Pak Ryan) dengan foto resmi dan direktori 19 wiraniaga.

---

### 4. Prosedur Menjalankan Aplikasi
1. Buka browser (disarankan **Brave Browser** atau Chrome).
2. Akses URL:
   `http://localhost:8080/dashboard_spv_ryan/`
   atau buka file langsung:
   `c:\Users\TUNAS\Downloads\www\dashboard_spv_ryan\index.html`
3. Seluruh fitur berjalan instan, responsif, dan tanpa ketergantungan koneksi server eksternal.
