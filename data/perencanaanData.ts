export interface DokumenPerencanaan1a {
  id: string;
  kodeKriteria: '1.a.1' | '1.a.2' | '1.a.3' | '1.a.4' | '1.a.5' | '1.a.6';
  kriteriaLabel: string;
  namaDokumen: string;
  jenisDokumen: string;
  nomorSK: string;
  tanggalPengesahan: string;
  periodeBerlaku: string;
  unitPenyusun: string;
  statusKetersediaan: 'Tersedia Lengkap' | 'Dalam Review' | 'Belum Tersedia';
  skorLKE: 1 | 0;
  linkDakung: string;
  keterangan: string;
}

export interface Kriteria1aItem {
  id: string;
  kodeKriteria: string;
  no: number;
  pernyataan: string;
  statusPemenuhan: 'Memenuhi Standar' | 'Sebagian Memenuhi' | 'Belum Memenuhi';
  skor: 1 | 0;
  buktiPendukung: string;
  nomorDokumen: string;
  catatanAsesor: string;
  linkDakung?: string;
  tanggalPenetapan?: string;
  unitPenyusun?: string;
}

export interface Kriteria1bItem {
  id: string;
  kodeKriteria: string;
  no: number;
  pernyataan: string;
  statusPemenuhan: 'Memenuhi Standar' | 'Sebagian Memenuhi' | 'Belum Memenuhi';
  skor: 1 | 0;
  buktiPendukung: string;
  nomorDokumen: string;
  catatanAsesor: string;
  linkDakung?: string;
  tanggalPenetapan?: string;
  unitPenyusun?: string;
}

export interface IndikatorSmartCheck {
  id: string;
  kodeIndikator: string;
  namaIndikator: string;
  sasaranStrategis: string;
  penanggungJawab: string;
  isSpecific: boolean;
  isMeasurable: boolean;
  isAchievable: boolean;
  isRelevant: boolean;
  isTimeBound: boolean;
  tipeIndikator: 'IKU' | 'IKD';
  polarisasi: 'MAXIMIZE' | 'MINIMIZE';
  skorKelayakan: number; // 0 - 100%
  justifikasiSMART: string;
}

export interface Kriteria1cItem {
  id: string;
  kodeKriteria: string;
  no: number;
  pernyataan: string;
  statusPemanfaatan: 'Dimanfaatkan Penuh' | 'Sebagian Dimanfaatkan' | 'Belum Optimal';
  skor: 1 | 0;
  bentukPemanfaatan: string;
  dokumenEvidens: string;
  catatanEvaluasi: string;
  nomorDokumen?: string;
  linkDakung?: string;
  tanggalPenetapan?: string;
  unitPenyusun?: string;
}

export interface PemanfaatanAnggaranSasaran {
  id: string;
  kodeSasaran: string;
  sasaranStrategis: string;
  unitKerja: string;
  paguAnggaran: number;
  realisasiAnggaran: number;
  persenRealisasiAnggaran: number;
  capaianKinerjaRata2: number;
  efisiensiAnggaran: 'Sangat Efisien' | 'Efisien' | 'Cukup';
  statusKeterkaitan: 'Money Follows Program' | 'Belum Sepenuhnya Terkait';
}

// -------------------------------------------------------------
// DATA AWAL 1.A (Dokumen Perencanaan Tersedia)
// -------------------------------------------------------------
export const INITIAL_DOKUMEN_1A: DokumenPerencanaan1a[] = [
  {
    id: 'dok-1a-1',
    kodeKriteria: '1.a.1',
    kriteriaLabel: 'Pedoman Teknis Perencanaan Kinerja',
    namaDokumen: 'Pedoman Tata Cara Penyusunan Perencanaan Kinerja & SAKIP RSUP Dr. M. Djamil',
    jenisDokumen: 'Keputusan Direktur Utama (SK)',
    nomorSK: 'HK.02.03/XVI/124/2024',
    tanggalPengesahan: '15 Januari 2024',
    periodeBerlaku: '2024 - 2029',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pedoman-sakip-djamil',
    keterangan: 'Memuat panduan penetapan tujuan, sasaran, indikator SMART, cascading, penarikan target bulanan & triwulan.',
  },
  {
    id: 'dok-1a-2',
    kodeKriteria: '1.a.2',
    kriteriaLabel: 'Dokumen Perencanaan Kinerja Jangka Panjang',
    namaDokumen: 'Rencana Strategis Bisnis (RSB) Jangka Panjang RSUP Dr. M. Djamil Padang Menuju Top Asia 2045',
    jenisDokumen: 'Dokumen RSB / RPJP Rumah Sakit',
    nomorSK: 'HK.01.07/MENKES/612/2023',
    tanggalPengesahan: '28 Desember 2023',
    periodeBerlaku: '2025 - 2045 (20 Tahun)',
    unitPenyusun: 'Direksi & Tim Perumus Visi Misi',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rsb-jangkapanjang-2045',
    keterangan: 'Peta jalan transformasi rumah sakit rujukan nasional Kemenkes dan jejaring kardiovaskular serta kanker wilayah barat.',
  },
  {
    id: 'dok-1a-3',
    kodeKriteria: '1.a.3',
    kriteriaLabel: 'Dokumen Perencanaan Kinerja Jangka Menengah',
    namaDokumen: 'Rencana Strategis (Renstra) RSUP Dr. M. Djamil Padang Tahun 2025-2029',
    jenisDokumen: 'Buku Renstra 5 Tahunan',
    nomorSK: 'HK.02.02/DIRUT/308/2024',
    tanggalPengesahan: '02 Oktober 2024',
    periodeBerlaku: '2025 - 2029 (5 Tahun)',
    unitPenyusun: 'Bagian Perencanaan & Anggaran bersama Seluruh Direktorat',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-renstra-djamil-2025-2029',
    keterangan: 'Memuat 11 Sasaran Strategis, 18 Indikator Kinerja Utama (IKU), target tahunan, strategi pendukung serta cascading matriks.',
  },
  {
    id: 'dok-1a-4',
    kodeKriteria: '1.a.4',
    kriteriaLabel: 'Dokumen Perencanaan Kinerja Jangka Pendek',
    namaDokumen: 'Rencana Kinerja Tahunan (RKT) TA 2025 & Dokumen Perjanjian Kinerja (PK) Direksi dan Satuan Kerja',
    jenisDokumen: 'RKT & Perjanjian Kinerja (PK)',
    nomorSK: 'HK.02.03/DIRUT/018/2025',
    tanggalPengesahan: '10 Januari 2025',
    periodeBerlaku: 'TA 2025 (1 Tahun)',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran & Seluruh Unit Kerja',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rkt-pk-tahunan-2025',
    keterangan: 'Ditandatangani secara berjenjang antara Direktur Utama dengan Menkes RI, serta Direksi dengan Ketua Tim Kerja/KSM/Instalasi.',
  },
  {
    id: 'dok-1a-5',
    kodeKriteria: '1.a.5',
    kriteriaLabel: 'Dokumen Perencanaan Aktivitas Pendukung Kinerja',
    namaDokumen: 'Rencana Bisnis dan Anggaran (RBA) BLU TA 2025, POA (Plan of Action), dan Kerangka Acuan Kerja (KAK)',
    jenisDokumen: 'RBA Definitif & KAK Kegiatan',
    nomorSK: 'KU.01.01/DEWAS/005/2025',
    tanggalPengesahan: '08 Januari 2025',
    periodeBerlaku: 'TA 2025',
    unitPenyusun: 'Direktorat Layanan Operasional & Tim Anggaran BLU',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rba-poa-aktivitas-2025',
    keterangan: 'Memuat rincian aktivitas operasional, belanja modal sarpras, obat/BMHP, peningkatan mutu, dan rencana tindak lanjut pelayanan.',
  },
  {
    id: 'dok-1a-6',
    kodeKriteria: '1.a.6',
    kriteriaLabel: 'Dokumen Perencanaan Anggaran Pendukung Kinerja',
    namaDokumen: 'DIPA Petikan Satker BLU RSUP Dr. M. Djamil Padang TA 2025 dan Matriks Alokasi Pagu Anggaran per Program',
    jenisDokumen: 'DIPA BLU Kemenkes RI & Alokasi Pagu',
    nomorSK: 'DIPA-024.04.2.415488/2025',
    tanggalPengesahan: '29 November 2024',
    periodeBerlaku: 'TA 2025',
    unitPenyusun: 'Direktorat Perencanaan dan Keuangan',
    statusKetersediaan: 'Tersedia Lengkap',
    skorLKE: 1,
    linkDakung: 'https://drive.google.com/drive/folders/dakung-dipa-pagu-anggaran-2025',
    keterangan: 'Total Pagu Anggaran Rp 642.850.000.000 teralokasi langsung ke dalam 11 Sasaran Strategis berbasis prinsip money follows program.',
  },
];

// -------------------------------------------------------------
// DATA AWAL KRITERIA 1.A (Standar Pemenuhan Dokumen PermenPAN-RB)
// -------------------------------------------------------------
export const INITIAL_KRITERIA_1A: Kriteria1aItem[] = [
  {
    id: 'k-1a-1',
    kodeKriteria: '1.a.1',
    no: 1,
    pernyataan: 'Terdapat Dokumen Perencanaan Kinerja Jangka Panjang.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Rencana Strategis Bisnis (RSB) Jangka Panjang RSUP Dr. M. Djamil Padang Menuju Top Asia 2045 dan Grand Design Transformasi Layanan Rujukan Nasional',
    nomorDokumen: 'HK.01.07/MENKES/612/2023',
    catatanAsesor: 'Dokumen perencanaan jangka panjang (20 tahun) telah disahkan pimpinan dan memuat arah pengembangan rumah sakit rujukan nasional.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rsb-jangkapanjang-2045',
    tanggalPenetapan: '28 Desember 2023',
    unitPenyusun: 'Direksi & Tim Perumus Visi Misi',
  },
  {
    id: 'k-1a-2',
    kodeKriteria: '1.a.2',
    no: 2,
    pernyataan: 'Terdapat Dokumen Perencanaan Kinerja Jangka Menengah (Renstra).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Rencana Strategis (Renstra) RSUP Dr. M. Djamil Padang Tahun 2025-2029 memuat Visi, Misi, 11 Sasaran Strategis, dan 18 Indikator Kinerja Utama (IKU)',
    nomorDokumen: 'HK.02.02/DIRUT/308/2024',
    catatanAsesor: 'Dokumen Renstra 5 tahunan telah ditetapkan melalui Keputusan Direktur Utama dan selaras dengan Renstra Kementerian Kesehatan RI.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-renstra-djamil-2025-2029',
    tanggalPenetapan: '02 Oktober 2024',
    unitPenyusun: 'Bagian Perencanaan & Anggaran',
  },
  {
    id: 'k-1a-3',
    kodeKriteria: '1.a.3',
    no: 3,
    pernyataan: 'Terdapat Dokumen Perencanaan Kinerja Jangka Pendek (RKT & Perjanjian Kinerja).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Dokumen Rencana Kinerja Tahunan (RKT) TA 2025 & Perjanjian Kinerja (PK) Direktur Utama dengan Menkes RI serta PK Direksi dan Unit Kerja',
    nomorDokumen: 'HK.02.03/DIRUT/018/2025',
    catatanAsesor: 'RKT dan PK tahun berjalan telah ditandatangani tepat waktu pada awal tahun anggaran dan dipublikasikan pada portal resmi.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rkt-pk-tahunan-2025',
    tanggalPenetapan: '10 Januari 2025',
    unitPenyusun: 'Bagian Perencanaan & Anggaran',
  },
  {
    id: 'k-1a-4',
    kodeKriteria: '1.a.4',
    no: 4,
    pernyataan: 'Terdapat Dokumen Perencanaan Aksi / Aktivitas Pendukung Kinerja.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Rencana Bisnis dan Anggaran (RBA) BLU TA 2025, Plan of Action (POA) Satker, dan Kerangka Acuan Kerja (KAK) Kegiatan',
    nomorDokumen: 'KU.01.01/DEWAS/005/2025',
    catatanAsesor: 'Dokumen memuat rincian aktivitas operasional, belanja modal sarpras alkes, dan timeline eksekusi program pelayanan.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-rba-poa-aktivitas-2025',
    tanggalPenetapan: '08 Januari 2025',
    unitPenyusun: 'Tim Anggaran BLU & Satker',
  },
  {
    id: 'k-1a-5',
    kodeKriteria: '1.a.5',
    no: 5,
    pernyataan: 'Terdapat Dokumen Perencanaan Anggaran Pendukung Kinerja.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'DIPA Petikan Satker BLU RSUP Dr. M. Djamil Padang TA 2025 dan Matriks Alokasi Pagu Anggaran Berbasis Sasaran Strategis',
    nomorDokumen: 'SP DIPA-024.04.2.415392/2025',
    catatanAsesor: 'Alokasi anggaran sebesar Rp 642,85 Miliar telah terhubung langsung dengan 11 Sasaran Strategis sesuai kaidah money follows program.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-dipa-pagu-anggaran-2025',
    tanggalPenetapan: '29 November 2024',
    unitPenyusun: 'Direktorat Perencanaan dan Keuangan',
  },
  {
    id: 'k-1a-6',
    kodeKriteria: '1.a.6',
    no: 6,
    pernyataan: 'Dokumen Perencanaan Kinerja telah Ditetapkan Secara Formal dan Berjenjang oleh Pimpinan.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'SK Direktur Utama tentang Penetapan Dokumen Perencanaan, Lembar Pengesahan Dewas, dan Penandatanganan PK Unit Kerja seluruh Satker',
    nomorDokumen: 'BA-PK/DIRUT/004/2025',
    catatanAsesor: 'Seluruh dokumen perencanaan kinerja memiliki legalitas hukum yang sah, mengikat seluruh satuan kerja dan pegawai RSUP.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pedoman-sakip-djamil',
    tanggalPenetapan: '15 Januari 2025',
    unitPenyusun: 'Bagian Tata Usaha & Hukum Organisasi',
  },
];

// -------------------------------------------------------------
// DATA AWAL 1.B (Standar SMART & Pemenuhan Kualitas)
// -------------------------------------------------------------
export const INITIAL_KRITERIA_1B: Kriteria1bItem[] = [
  {
    id: 'k-1b-1',
    kodeKriteria: '1.b.1',
    no: 1,
    pernyataan: 'Dokumen Perencanaan Kinerja telah diformalkan.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'SK Direktur Utama No. HK.02.02/DIRUT/308/2024 dan Berita Acara Kesepakatan PK dengan Dirjen Yankes Kemenkes RI',
    nomorDokumen: 'HK.02.02/DIRUT/308/2024',
    catatanAsesor: 'Dokumen perencanaan telah disahkan secara legal oleh pimpinan tertinggi dan Dewan Pengawas.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-formalisasi-renstra-2025',
    tanggalPenetapan: '02 Oktober 2024',
    unitPenyusun: 'Bagian Tata Usaha & Hukum Organisasi',
  },
  {
    id: 'k-1b-2',
    kodeKriteria: '1.b.2',
    no: 2,
    pernyataan: 'Dokumen Perencanaan Kinerja telah dipublikasikan tepat waktu.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Website Resmi RSUP Dr. M. Djamil (Menu SAKIP & PPID), Media Sosial, dan Portal Kemenkes SAKIP',
    nomorDokumen: 'URL: rsupmdjamil.kemkes.go.id/sakip',
    catatanAsesor: 'Dipublikasikan maksimal 1 bulan setelah penetapan tahun anggaran sesuai kaidah transparansi publik.',
    linkDakung: 'https://rsupmdjamil.kemkes.go.id/sakip',
    tanggalPenetapan: '20 Januari 2025',
    unitPenyusun: 'Instalasi SIMRS & Humas',
  },
  {
    id: 'k-1b-3',
    kodeKriteria: '1.b.3',
    no: 3,
    pernyataan: 'Dokumen Perencanaan Kinerja telah menggambarkan Kebutuhan atas Kinerja sebenarnya.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Analisis Situasi Lingkungan Strategis (SWOT), Analisis Morbiditas Rumah Sakit, dan Survei Kepuasan Pasien',
    nomorDokumen: 'Lap. Kajian Kebutuhan Kinerja RS-2024',
    catatanAsesor: 'Telah memetakan beban penyakit prioritas (Kanker, Jantung, Stroke, Uronefro, KIA) wilayah binaan.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-analisis-kebutuhan-kinerja',
    tanggalPenetapan: '18 September 2024',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
  },
  {
    id: 'k-1b-4',
    kodeKriteria: '1.b.4',
    no: 4,
    pernyataan: 'Kualitas Rumusan Hasil (Tujuan & Sasaran) telah jelas menggambarkan kondisi kinerja yang akan dicapai.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Matriks Visi-Misi-Tujuan-Sasaran Renstra 2025-2029 berorientasi Outcome / Dampak Pelayanan Medis',
    nomorDokumen: 'Bab III Renstra RSUP 2025-2029',
    catatanAsesor: 'Rumusan sasaran menggunakan kata kondisi (Terwujudnya, Meningkatnya), bukan sekadar aktivitas belanja.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-renstra-djamil-2025-2029',
    tanggalPenetapan: '02 Oktober 2024',
    unitPenyusun: 'Tim Perumus Renstra 2025-2029',
  },
  {
    id: 'k-1b-5',
    kodeKriteria: '1.b.5',
    no: 5,
    pernyataan: 'Ukuran Keberhasilan (Indikator Kinerja) telah memenuhi kriteria SMART (Specific, Measurable, Achievable, Relevant, Time-bound).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Buku Kamus / Definisi Operasional 18 Indikator PK RSUP Dr. M. Djamil Padang dilengkapi formula dan target berjenjang',
    nomorDokumen: 'Kamus Indikator Kinerja 2025',
    catatanAsesor: '18 dari 18 indikator kinerja utama telah lolos uji kelayakan SMART.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-kamus-indikator-smart-2025',
    tanggalPenetapan: '12 Januari 2025',
    unitPenyusun: 'Bagian Perencanaan & Komite Mutu',
  },
  {
    id: 'k-1b-6',
    kodeKriteria: '1.b.6',
    no: 6,
    pernyataan: 'Indikator Kinerja Utama (IKU) telah menggambarkan kondisi Kinerja Utama yang harus dicapai, tertuang secara berkelanjutan (sustainable).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Keputusan Dewan Pengawas dan Dirjen Pelayanan Kesehatan tentang IKU RSUP Dr. M. Djamil Padang 2025-2029',
    nomorDokumen: 'SK Penetapan IKU No. 42/2025',
    catatanAsesor: 'IKU konsisten dipertahankan selama periode Renstra dan tidak berubah-ubah di tengah jalan.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-penetapan-iku-2025-2029',
    tanggalPenetapan: '06 Januari 2025',
    unitPenyusun: 'Direksi & Dewan Pengawas',
  },
  {
    id: 'k-1b-7',
    kodeKriteria: '1.b.7',
    no: 7,
    pernyataan: 'Target yang ditetapkan dalam Perencanaan Kinerja dapat dicapai (achievable), menantang, dan realistis.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Dokumen Perhitungan Baseline Historis (3 tahun terakhir) dan Analisis Tren Kapasitas Layanan Rawat/OK/ICU',
    nomorDokumen: 'Kajian Proyeksi Target Renstra',
    catatanAsesor: 'Target dinaikkan secara terukur (challenging yet realistic) dengan mempertimbangkan penambahan sarpras alat medis.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-kajian-proyeksi-target',
    tanggalPenetapan: '15 Desember 2024',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
  },
  {
    id: 'k-1b-8',
    kodeKriteria: '1.b.8',
    no: 8,
    pernyataan: 'Setiap Dokumen Perencanaan Kinerja menggambarkan hubungan yang berkesinambungan dan selaras di setiap level jabatan (Cascading).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Pohon Kinerja (Cascading) RSUP Dr. M. Djamil: Eselon II (Dirut) -> Eselon III (Direktur) -> Eselon IV (Ketua Tim/KSM/Instalasi) -> Staf',
    nomorDokumen: 'Dokumen Cascading Kinerja 2025',
    catatanAsesor: 'Cascading jelas memperlihatkan direct cascade dan non-direct cascade ke seluruh jajaran.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pohon-kinerja-cascading-2025',
    tanggalPenetapan: '10 Januari 2025',
    unitPenyusun: 'Tim SAKIP & Tata Kelola Organisasi',
  },
  {
    id: 'k-1b-9',
    kodeKriteria: '1.b.9',
    no: 9,
    pernyataan: 'Perencanaan kinerja dapat memberikan informasi tentang hubungan kinerja, strategi, kebijakan, dan aktivitas antar bidang (Crosscutting).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Matriks Hubungan Lintas Bidang (Cross-cutting Matrix): Kolaborasi Layanan Medik, Keperawatan, Penunjang, Sarpras IT, dan Keuangan',
    nomorDokumen: 'Matriks Crosscutting Kemenkes 2025',
    catatanAsesor: 'Terdapat pembagian peran dan indikator bersama untuk sasaran pengampuan rumah sakit jejaring dan riset klinik.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-matriks-crosscutting-2025',
    tanggalPenetapan: '12 Januari 2025',
    unitPenyusun: 'Direktorat Terkait & Komite Medik',
  },
  {
    id: 'k-1b-10',
    kodeKriteria: '1.b.10',
    no: 10,
    pernyataan: 'Setiap unit/satuan kerja merumuskan dan menetapkan Perencanaan Kinerja.',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: '100% Satuan Kerja (4 Direktorat, 24 Instalasi, 16 KSM, 6 Bagian) telah menandatangani Perjanjian Kinerja Unit',
    nomorDokumen: 'Kompilasi PK Unit Kerja TA 2025',
    catatanAsesor: 'Seluruh unit kerja memiliki dokumen PK lengkap dengan target triwulanan masing-masing.',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pk-seluruh-unit-kerja-2025',
    tanggalPenetapan: '15 Januari 2025',
    unitPenyusun: 'Seluruh Kepala Instalasi, KSM & Bagian',
  },
  {
    id: 'k-1b-11',
    kodeKriteria: '1.b.11',
    no: 11,
    pernyataan: 'Setiap pegawai merumuskan dan menetapkan Perencanaan Kinerja (SKP Pegawai).',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
    buktiPendukung: 'Data Integrasi Portal e-Kinerja BKN / SIASN: 2.840 Pegawai ASN dan BLU RSUP telah menyusun dan menetapkan SKP Tahunan',
    nomorDokumen: 'Rekapitulasi SKP Pegawai 2025',
    catatanAsesor: 'Tingkat kepatuhan penetapan SKP pegawai mencapai 99.8% pada batas waktu triwulan I.',
    linkDakung: 'https://kinerja.bkn.go.id/login',
    tanggalPenetapan: '31 Januari 2025',
    unitPenyusun: 'Bagian SDM & Seluruh Pegawai RSUP',
  },
];

// DATA DETAIL PENGUJIAN SMART 18 INDIKATOR PK RSUP DR. M. DJAMIL
export const INITIAL_SMART_CHECKS: IndikatorSmartCheck[] = [
  {
    id: 'smart-1',
    kodeIndikator: 'IND.01',
    namaIndikator: 'Skor kepuasan pelanggan (CSAT)',
    sasaranStrategis: 'Terwujudnya Layanan Terbaik Level Asia',
    penanggungJawab: 'Direktur Layanan Operasional',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKU',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Fokus jelas pada skor survei pasien (0-100), formula terstandar PermenPAN-RB, terukur tiap triwulan, target realistis 90.64.',
  },
  {
    id: 'smart-2',
    kodeIndikator: 'IND.02',
    namaIndikator: 'Persentase pencapaian lokasi (lokus) yang dikelola/ diampu sesuai target',
    sasaranStrategis: 'Terwujudnya Penyelenggaraan Pengampuan Nasional untuk Penyakit Prioritas',
    penanggungJawab: 'Direktur Medik dan Keperawatan',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKU',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Spesifik menghitung lokus RSUD binaan KJSU (Kanker, Jantung, Stroke, Uronefro), terukur rasio lokus tuntas per target.',
  },
  {
    id: 'smart-3',
    kodeIndikator: 'IND.03',
    namaIndikator: 'Persentase pendapatan yang diperoleh dari semua penelitian CRU',
    sasaranStrategis: 'Terwujudnya Pusat Pendidikan, pelatihan dan penelitian yang Berkesinambungan dan Berkualitas Internasional',
    penanggungJawab: 'Direktur SDM, Pendidikan dan Penelitian',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKU',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Rasio pendapatan uji klinis CRU terhadap total PNBP RSUP, data terekam pada sistem billing BLU terverifikasi.',
  },
  {
    id: 'smart-4',
    kodeIndikator: 'IND.04',
    namaIndikator: 'Persentase Rekomendasi Hasil Audit Pengawasan Internal yang Ditindaklanjuti',
    sasaranStrategis: 'Terwujudnya Penguatan Tata Kelola Rumah Sakit yang Baik dan Akuntabel',
    penanggungJawab: 'Direktur Layanan Operasional & SPI',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKU',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Jumlah rekomendasi Itjen/SPI tuntas dibagi total temuan, batas waktu monitoring triwulanan.',
  },
  {
    id: 'smart-5',
    kodeIndikator: 'IND.05',
    namaIndikator: 'Rasio Pendapatan BLU terhadap Biaya Operasional (Cost Recovery Rate)',
    sasaranStrategis: 'Terwujudnya Penguatan Tata Kelola Keuangan yang Efisien dan Akuntabel',
    penanggungJawab: 'Direktur Perencanaan dan Keuangan',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKU',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Formula baku Kemenkeu Ditjen PBN, indikator mandatori kinerja keuangan BLU.',
  },
  {
    id: 'smart-6',
    kodeIndikator: 'IND.06',
    namaIndikator: 'Waktu Tanggap Pelayanan Gawat Darurat (Emergency Response Time ≤ 5 Menit)',
    sasaranStrategis: 'Meningkatnya Mutu dan Keselamatan Pasien Pelayanan Gawat Darurat',
    penanggungJawab: 'Direktur Medik dan Keperawatan',
    isSpecific: true,
    isMeasurable: true,
    isAchievable: true,
    isRelevant: true,
    isTimeBound: true,
    tipeIndikator: 'IKD',
    polarisasi: 'MAXIMIZE',
    skorKelayakan: 100,
    justifikasiSMART: 'Definisi waktu triase ke penanganan dokter spesialis emergency, tercatat digital di SIMRS IGD.',
  },
];

// -------------------------------------------------------------
// DATA AWAL 1.C (Pemanfaatan Perencanaan Kinerja)
// -------------------------------------------------------------
export const INITIAL_KRITERIA_1C: Kriteria1cItem[] = [
  {
    id: 'k-1c-1',
    kodeKriteria: '1.c.1',
    no: 1,
    pernyataan: 'Anggaran yang ditetapkan telah mengacu pada Kinerja yang ingin dicapai (Money Follows Program).',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Penyusunan RBA & DIPA Satker mendasarkan alokasi belanja langsung pada target 18 Indikator Kinerja Utama (IKU)',
    dokumenEvidens: 'Matriks Sinkronisasi Anggaran Renstra - RBA TA 2025',
    catatanEvaluasi: 'Pagu anggaran teralokasi dengan jelas ke masing-masing sasaran strategis rumah sakit tanpa ada pos anggaran tanpa indikator.',
    nomorDokumen: 'SP DIPA-024.04.2.415392/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pemanfaatan-anggaran-2025',
    tanggalPenetapan: '29 November 2024',
    unitPenyusun: 'Direktorat Perencanaan & Keuangan',
  },
  {
    id: 'k-1c-2',
    kodeKriteria: '1.c.2',
    no: 2,
    pernyataan: 'Aktivitas yang dilaksanakan telah mendukung Kinerja yang ingin dicapai.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Setiap Kerangka Acuan Kerja (KAK) dan Nota Dinas Pencairan Dana wajib mencantumkan target IKU yang didukung',
    dokumenEvidens: 'SOP Verifikasi KAK Berbasis Target IKU No. SOP-REN-04',
    catatanEvaluasi: 'Unit dilarang mengadakan kegiatan seremonial yang tidak berdampak langsung terhadap pencapaian sasaran strategis.',
    nomorDokumen: 'SOP-REN-04/DIRUT/2024',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-verifikasi-kak-iku',
    tanggalPenetapan: '14 Februari 2024',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
  },
  {
    id: 'k-1c-3',
    kodeKriteria: '1.c.3',
    no: 3,
    pernyataan: 'Target yang ditetapkan dalam Perencanaan Kinerja telah dicapai dengan baik atau menunjukkan progres capaian terukur.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Rata-rata capaian triwulanan indikator PK mencapai 98.4% dengan kategori sangat baik',
    dokumenEvidens: 'Laporan Capaian Kinerja Triwulan SAKIP TA 2025',
    catatanEvaluasi: 'Sebagian besar indikator tercapai sesuai trajectory target yang ditetapkan di awal tahun.',
    nomorDokumen: 'LAP-TW3/SAKIP/102/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-laporan-capaian-kinerja-triwulan',
    tanggalPenetapan: '10 Oktober 2025',
    unitPenyusun: 'Tim Evaluasi Kinerja SAKIP',
  },
  {
    id: 'k-1c-4',
    kodeKriteria: '1.c.4',
    no: 4,
    pernyataan: 'Rencana aksi kinerja dapat berjalan dinamis karena capaian kinerja selalu dipantau secara berkala.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Pelaksanaan Rapat Tinjauan Manajemen (RTM) dan Monev Kinerja Bulanan yang dipimpin langsung oleh Direksi',
    dokumenEvidens: 'Notula & Daftar Hadir RTM Bulanan Direksi TA 2025',
    catatanEvaluasi: 'Adanya penyesuaian strategi akselerasi jika di tengah jalan ditemukan indikator dengan realisasi di bawah target.',
    nomorDokumen: 'BA-RTM/DIRUT/B-09/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-notula-rtm-bulanan-direksi',
    tanggalPenetapan: '05 September 2025',
    unitPenyusun: 'Bagian Tata Usaha & Komite Mutu',
  },
  {
    id: 'k-1c-5',
    kodeKriteria: '1.c.5',
    no: 5,
    pernyataan: 'Terdapat perbaikan/penyempurnaan Dokumen Perencanaan Kinerja yang ditetapkan dari hasil evaluasi.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Penyusunan Addendum Perjanjian Kinerja (PK Perubahan) pada semester II berdasarkan hasil evaluasi internal',
    dokumenEvidens: 'Dokumen Addendum PK TA 2024 / Draft Review Renstra 2025',
    catatanEvaluasi: 'Rekomendasi Itjen dan Kemenpan-RB tahun sebelumnya telah diakomodasi dalam perbaikan RKT tahun berjalan.',
    nomorDokumen: 'ADD-PK/DIRUT/02/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-addendum-pk-dan-renstra',
    tanggalPenetapan: '15 Juli 2025',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
  },
  {
    id: 'k-1c-6',
    kodeKriteria: '1.c.6',
    no: 6,
    pernyataan: 'Terdapat perbaikan/penyempurnaan Dokumen Perencanaan Kinerja dalam mewujudkan kinerja yang lebih efektif.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Penyelarasan kembali target IKU Pengampuan Nasional dengan ketersediaan alat canggih DAK Kemenkes',
    dokumenEvidens: 'Berita Acara Penyesuaian Target Pengampuan 2025',
    catatanEvaluasi: 'Target diselaraskan agar realistis namun tetap memacu akselerasi layanan subspesialistik.',
    nomorDokumen: 'BA-YANKES/PENGAMPUAN/312/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-penyesuaian-target-pengampuan',
    tanggalPenetapan: '20 Agustus 2025',
    unitPenyusun: 'Direktorat Medik dan Keperawatan',
  },
  {
    id: 'k-1c-7',
    kodeKriteria: '1.c.7',
    no: 7,
    pernyataan: 'Setiap unit/satuan kerja memahami dan peduli, serta berkomitmen dalam mencapai kinerja.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Penandatanganan Pakta Integritas Kinerja Bersama dan Pembagian reward kinerja satker berprestasi',
    dokumenEvidens: 'Dokumentasi Pakta Integritas & Piagam Penghargaan Satker Terbaik',
    catatanEvaluasi: 'Keterlibatan Kepala Instalasi dan Ketua KSM sangat tinggi dalam pengawalan capaian target mutu.',
    nomorDokumen: 'PI-SATKER/DIRUT/001/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-pakta-integritas-satker-2025',
    tanggalPenetapan: '15 Januari 2025',
    unitPenyusun: 'Seluruh Kepala Instalasi & KSM',
  },
  {
    id: 'k-1c-8',
    kodeKriteria: '1.c.8',
    no: 8,
    pernyataan: 'Setiap Pegawai memahami dan peduli, serta berkomitmen dalam mencapai kinerja yang telah ditetapkan.',
    statusPemanfaatan: 'Dimanfaatkan Penuh',
    skor: 1,
    bentukPemanfaatan: 'Dialog Kinerja Individu triwulanan antara atasan langsung dengan staf, serta pengaitan capaian kinerja dengan remunerasi BLU',
    dokumenEvidens: 'Bukti Dialog Kinerja dan Rekapitulasi Pembayaran Remunerasi Berbasis Kinerja',
    catatanEvaluasi: 'Pemberian insentif remunerasi berhasil mendongkrak motivasi kerja dan disiplin pegawai.',
    nomorDokumen: 'SK-REMUN/DIRUT/088/2025',
    linkDakung: 'https://drive.google.com/drive/folders/dakung-dialog-kinerja-dan-remun-2025',
    tanggalPenetapan: '25 Januari 2025',
    unitPenyusun: 'Bagian SDM & Tim Remunerasi',
  },
];

// DATA MATRIKS PENGANGGARAN BERBASIS KINERJA (MONEY FOLLOWS PROGRAM) 1.C.1
export const INITIAL_PEMANFAATAN_ANGGARAN: PemanfaatanAnggaranSasaran[] = [
  {
    id: 'ang-1',
    kodeSasaran: 'SS.01',
    sasaranStrategis: 'Terwujudnya Layanan Terbaik Level Asia (Skor CSAT 90.64)',
    unitKerja: 'Direktorat Layanan Operasional',
    paguAnggaran: 12500000000,
    realisasiAnggaran: 11850000000,
    persenRealisasiAnggaran: 94.8,
    capaianKinerjaRata2: 100.62,
    efisiensiAnggaran: 'Sangat Efisien',
    statusKeterkaitan: 'Money Follows Program',
  },
  {
    id: 'ang-2',
    kodeSasaran: 'SS.02',
    sasaranStrategis: 'Penyelenggaraan Pengampuan Nasional KJSU Penyakit Prioritas',
    unitKerja: 'Direktorat Medik dan Keperawatan',
    paguAnggaran: 38400000000,
    realisasiAnggaran: 36200000000,
    persenRealisasiAnggaran: 94.27,
    capaianKinerjaRata2: 100.0,
    efisiensiAnggaran: 'Sangat Efisien',
    statusKeterkaitan: 'Money Follows Program',
  },
  {
    id: 'ang-3',
    kodeSasaran: 'SS.03',
    sasaranStrategis: 'Pusat Pendidikan, Pelatihan dan Riset Uji Klinis (CRU) Internasional',
    unitKerja: 'Direktorat SDM, Pendidikan dan Penelitian',
    paguAnggaran: 8900000000,
    realisasiAnggaran: 8100000000,
    persenRealisasiAnggaran: 91.01,
    capaianKinerjaRata2: 108.0,
    efisiensiAnggaran: 'Sangat Efisien',
    statusKeterkaitan: 'Money Follows Program',
  },
  {
    id: 'ang-4',
    kodeSasaran: 'SS.04',
    sasaranStrategis: 'Tata Kelola Rumah Sakit yang Baik, SPI, dan Akuntabilitas Kinerja',
    unitKerja: 'Direktorat Layanan Operasional & Bagian Perencanaan',
    paguAnggaran: 5400000000,
    realisasiAnggaran: 4950000000,
    persenRealisasiAnggaran: 91.67,
    capaianKinerjaRata2: 97.5,
    efisiensiAnggaran: 'Efisien',
    statusKeterkaitan: 'Money Follows Program',
  },
  {
    id: 'ang-5',
    kodeSasaran: 'SS.05',
    sasaranStrategis: 'Penguatan Tata Kelola Keuangan BLU Efisien & Cost Recovery Rate',
    unitKerja: 'Direktorat Perencanaan dan Keuangan',
    paguAnggaran: 14600000000,
    realisasiAnggaran: 13900000000,
    persenRealisasiAnggaran: 95.21,
    capaianKinerjaRata2: 102.3,
    efisiensiAnggaran: 'Sangat Efisien',
    statusKeterkaitan: 'Money Follows Program',
  },
];
