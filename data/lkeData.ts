export interface LKECriteriaItem {
  id: string;
  no: number;
  pernyataan: string;
  skor: number; // 1 or 0
  buktiPendukung?: string;
  catatanAsesor?: string;
  linkDakung?: string;
  nomorDokumen?: string;
  tanggalPenetapan?: string;
  statusPemenuhan?: string;
}

export interface LKESubKomponen {
  kode: string; // '1.a', '1.b', etc.
  nama: string;
  bobot: number;
  jawaban: 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D';
  nilai: number;
  persenIsian: number; // e.g. 100.00 or 87.50
  kriteriaList: LKECriteriaItem[];
  usiaDokumen?: number; // e.g. 1 or 5
  upayaInovatif?: 'Dapat' | 'Tidak';
  catatan?: string;
}

export interface LKEKomponen {
  no: number;
  kode: string;
  nama: string;
  bobot: number;
  nilai: number;
  subKomponenList: LKESubKomponen[];
}

export const INITIAL_LKE_DATA: LKEKomponen[] = [
  // 1. PERENCANAAN KINERJA
  {
    no: 1,
    kode: '1',
    nama: 'PERENCANAAN KINERJA',
    bobot: 30.0,
    nilai: 24.0,
    subKomponenList: [
      {
        kode: '1.a',
        nama: 'Dokumen Perencanaan kinerja telah tersedia',
        bobot: 6.0,
        jawaban: 'A',
        nilai: 5.4,
        persenIsian: 100.0,
        usiaDokumen: 1,
        kriteriaList: [
          { id: '1.a.1', no: 1, pernyataan: 'Terdapat pedoman teknis perencanaan kinerja.', skor: 1 },
          { id: '1.a.2', no: 2, pernyataan: 'Terdapat dokumen perencanaan kinerja jangka panjang.', skor: 1 },
          { id: '1.a.3', no: 3, pernyataan: 'Terdapat dokumen perencanaan kinerja jangka menengah.', skor: 1 },
          { id: '1.a.4', no: 4, pernyataan: 'Terdapat dokumen perencanaan kinerja jangka pendek.', skor: 1 },
          { id: '1.a.5', no: 5, pernyataan: 'Terdapat dokumen perencanaan aktivitas yang mendukung kinerja.', skor: 1 },
          { id: '1.a.6', no: 6, pernyataan: 'Terdapat dokumen perencanaan anggaran yang mendukung kinerja.', skor: 1 },
        ],
      },
      {
        kode: '1.b',
        nama: 'Dokumen Perencanaan kinerja telah memenuhi standar yang baik',
        bobot: 9.0,
        jawaban: 'A',
        nilai: 8.1,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '1.b.1', no: 1, pernyataan: 'Dokumen Perencanaan Kinerja telah diformalkan.', skor: 1 },
          { id: '1.b.2', no: 2, pernyataan: 'Dokumen Perencanaan Kinerja telah dipublikasikan tepat waktu.', skor: 1 },
          { id: '1.b.3', no: 3, pernyataan: 'Dokumen Perencanaan Kinerja telah menggambarkan Kebutuhan atas Kinerja sebenarnya.', skor: 1 },
          { id: '1.b.4', no: 4, pernyataan: 'Kualitas Rumusan Hasil (Tujuan & Sasaran) telah jelas menggambarkan kondisi kinerja yang akan dicapai.', skor: 1 },
          { id: '1.b.5', no: 5, pernyataan: 'Ukuran Keberhasilan (Indikator Kinerja) telah memenuhi kriteria SMART.', skor: 1 },
          { id: '1.b.6', no: 6, pernyataan: 'Indikator Kinerja Utama (IKU) telah menggambarkan kondisi Kinerja Utama yang harus dicapai, tertuang secara berkelanjutan (sustainable - tidak sering diganti dalam 1 periode Perencanaan Strategis).', skor: 1 },
          { id: '1.b.7', no: 7, pernyataan: 'Target yang ditetapkan dalam Perencanaan Kinerja dapat dicapai (achievable), menantang, dan realistis.', skor: 1 },
          { id: '1.b.8', no: 8, pernyataan: 'Setiap Dokumen Perencanaan Kinerja menggambarkan hubungan yang berkesinambungan, serta selaras antara Kondisi/Hasil yang akan dicapai di setiap level jabatan (Cascading).', skor: 1 },
          { id: '1.b.9', no: 9, pernyataan: 'Perencanaan kinerja dapat memberikan informasi tentang hubungan kinerja, strategi, kebijakan, bahkan aktivitas antar bidang/dengan tugas dan fungsi lain yang berkaitan (Crosscutting).', skor: 1 },
          { id: '1.b.10', no: 10, pernyataan: 'Setiap unit/satuan kerja merumuskan dan menetapkan Perencanaan Kinerja.', skor: 1 },
          { id: '1.b.11', no: 11, pernyataan: 'Setiap pegawai merumuskan dan menetapkan Perencanaan Kinerja.', skor: 1 },
        ],
      },
      {
        kode: '1.c',
        nama: 'Perencanaan Kinerja telah dimanfaatkan untuk mewujudkan hasil',
        bobot: 15.0,
        jawaban: 'B',
        nilai: 10.5,
        persenIsian: 87.5,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '1.c.1', no: 1, pernyataan: 'Anggaran yang ditetapkan telah mengacu pada Kinerja yang ingin dicapai.', skor: 1 },
          { id: '1.c.2', no: 2, pernyataan: 'Aktivitas yang dilaksanakan telah mendukung Kinerja yang ingin dicapai.', skor: 1 },
          { id: '1.c.3', no: 3, pernyataan: 'Target yang ditetapkan dalam Perencanaan Kinerja telah dicapai dengan baik, atau setidaknya...', skor: 0 },
          { id: '1.c.4', no: 4, pernyataan: 'Rencana aksi kinerja dapat berjalan dinamis karena capaian kinerja selalu dipantau secara berkala.', skor: 1 },
          { id: '1.c.5', no: 5, pernyataan: 'Terdapat perbaikan/penyempurnaan Dokumen Perencanaan Kinerja yang ditetapkan dari hasil evaluasi.', skor: 1 },
          { id: '1.c.6', no: 6, pernyataan: 'Terdapat perbaikan/penyempurnaan Dokumen Perencanaan Kinerja dalam mewujudkan kinerja.', skor: 1 },
          { id: '1.c.7', no: 7, pernyataan: 'Setiap unit/satuan kerja memahami dan peduli, serta berkomitmen dalam mencapai kinerja.', skor: 1 },
          { id: '1.c.8', no: 8, pernyataan: 'Setiap Pegawai memahami dan peduli, serta berkomitmen dalam mencapai kinerja yang telah ditetapkan.', skor: 1 },
        ],
      },
    ],
  },

  // 2. PENGUKURAN KINERJA
  {
    no: 2,
    kode: '2',
    nama: 'PENGUKURAN KINERJA',
    bobot: 30.0,
    nilai: 27.6,
    subKomponenList: [
      {
        kode: '2.a',
        nama: 'Pengukuran Kinerja telah dilakukan',
        bobot: 6.0,
        jawaban: 'AA',
        nilai: 6.0,
        persenIsian: 100.0,
        usiaDokumen: 5,
        kriteriaList: [
          { id: '2.a.1', no: 1, pernyataan: 'Terdapat pedoman teknis pengukuran kinerja dan pengumpulan data kinerja.', skor: 1 },
          { id: '2.a.2', no: 2, pernyataan: 'Terdapat Definisi Operasional yang jelas atas kinerja dan cara mengukur indikator kinerja.', skor: 1 },
          { id: '2.a.3', no: 3, pernyataan: 'Terdapat mekanisme yang jelas terhadap pengumpulan data kinerja yang dapat diandalkan.', skor: 1 },
        ],
      },
      {
        kode: '2.b',
        nama: 'Pengukuran Kinerja telah menjadi kebutuhan dalam pengelolaan kinerja',
        bobot: 9.0,
        jawaban: 'A',
        nilai: 8.1,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '2.b.1', no: 1, pernyataan: 'Pimpinan selalu teribat sebagai pengambil keputusan (Decision Maker) dalam mengukur capaian kinerja.', skor: 1 },
          { id: '2.b.2', no: 2, pernyataan: 'Data kinerja yang dikumpulkan telah relevan untuk mengukur capaian kinerja yang diharapkan.', skor: 1 },
          { id: '2.b.3', no: 3, pernyataan: 'Data kinerja yang dikumpulkan telah mendukung capaian kinerja yang diharapkan.', skor: 1 },
          { id: '2.b.4', no: 4, pernyataan: 'Pengukuran kinerja telah dilakukan secara berkala.', skor: 1 },
          { id: '2.b.5', no: 5, pernyataan: 'Setiap level organisasi melakukan pemantauan atas pengukuran capaian kinerja unit', skor: 1 },
          { id: '2.b.6', no: 6, pernyataan: 'Pengumpulan data kinerja telah memanfaatkan Teknologi Informasi (Aplikasi).', skor: 1 },
          { id: '2.b.7', no: 7, pernyataan: 'Pengukuran capaian kinerja telah memanfaatkan Teknologi Informasi (Aplikasi)', skor: 1 },
        ],
      },
      {
        kode: '2.c',
        nama: 'Pengukuran Kinerja telah dijadikan dasar dalam pemberian reward/penyesuaian',
        bobot: 15.0,
        jawaban: 'A',
        nilai: 13.5,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '2.c.1', no: 1, pernyataan: 'Pengukuran Kinerja telah menjadi dasar dalam penyesuaian (pemberian/pengurangan) remunerasi/tunjangan kinerja.', skor: 1 },
          { id: '2.c.2', no: 2, pernyataan: 'Pengukuran Kinerja telah menjadi dasar dalam penempatan/penghapusan Jabatan baik struktural maupun fungsional.', skor: 1 },
          { id: '2.c.3', no: 3, pernyataan: 'Pengukuran kinerja telah mempengaruhi penyesuaian (Refocusing) Organisasi.', skor: 1 },
          { id: '2.c.4', no: 4, pernyataan: 'Pengukuran kinerja telah mempengaruhi penyesuaian Strategi dalam mencapai kinerja.', skor: 1 },
          { id: '2.c.5', no: 5, pernyataan: 'Pengukuran kinerja telah mempengaruhi penyesuaian Kebijakan dalam mencapai kinerja.', skor: 1 },
          { id: '2.c.6', no: 6, pernyataan: 'Pengukuran kinerja telah mempengaruhi penyesuaian Aktivitas dalam mencapai kinerja.', skor: 1 },
          { id: '2.c.7', no: 7, pernyataan: 'Pengukuran kinerja telah mempengaruhi penyesuaian Anggaran dalam mencapai kinerja.', skor: 1 },
          { id: '2.c.8', no: 8, pernyataan: 'Terdapat efisiensi atas penggunaan anggaran dalam mencapai kinerja.', skor: 1 },
          { id: '2.c.9', no: 9, pernyataan: 'Setiap unit/satuan kerja memahami dan peduli atas hasil pengukuran kinerja.', skor: 1 },
          { id: '2.c.10', no: 10, pernyataan: 'Setiap pegawai memahami dan peduli atas hasil pengukuran kinerja.', skor: 1 },
        ],
      },
    ],
  },

  // 3. PELAPORAN KINERJA
  {
    no: 3,
    kode: '3',
    nama: 'PELAPORAN KINERJA',
    bobot: 15.0,
    nilai: 13.5,
    subKomponenList: [
      {
        kode: '3.a',
        nama: 'Terdapat Dokumen Laporan yang menggambarkan Kinerja',
        bobot: 3.0,
        jawaban: 'A',
        nilai: 2.7,
        persenIsian: 100.0,
        usiaDokumen: 1,
        kriteriaList: [
          { id: '3.a.1', no: 1, pernyataan: 'Dokumen Laporan Kinerja telah disusun.', skor: 1 },
          { id: '3.a.2', no: 2, pernyataan: 'Dokumen Laporan Kinerja telah disusun secara berkala.', skor: 1 },
          { id: '3.a.3', no: 3, pernyataan: 'Dokumen Laporan Kinerja telah diformalkan.', skor: 1 },
          { id: '3.a.4', no: 4, pernyataan: 'Dokumen Laporan Kinerja telah direviu.', skor: 1 },
          { id: '3.a.5', no: 5, pernyataan: 'Dokumen Laporan Kinerja telah dipublikasikan.', skor: 1 },
          { id: '3.a.6', no: 6, pernyataan: 'Dokumen Laporan Kinerja telah disampaikan tepat waktu.', skor: 1 },
        ],
      },
      {
        kode: '3.b',
        nama: 'Dokumen Laporan Kinerja telah memenuhi Standar',
        bobot: 4.5,
        jawaban: 'A',
        nilai: 4.05,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '3.b.1', no: 1, pernyataan: 'Dokumen Laporan Kinerja disusun secara berkualitas sesuai dengan standar.', skor: 1 },
          { id: '3.b.2', no: 2, pernyataan: 'Dokumen Laporan Kinerja telah mengungkap seluruh informasi tentang pencapaian kinerja.', skor: 1 },
          { id: '3.b.3', no: 3, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan analisis dan evaluasi realisasi kinerja dengan target tahunan.', skor: 1 },
          { id: '3.b.4', no: 4, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan analisis dan evaluasi realisasi kinerja dengan target jangka menengah.', skor: 1 },
          { id: '3.b.5', no: 5, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan analisis dan evaluasi realisasi kinerja dengan realisasi kinerja tahun-tahun sebelumnya.', skor: 1 },
          { id: '3.b.6', no: 6, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan analisis dan evaluasi realisasi kinerja dengan realisasi kinerja di level nasional/internasional (Benchmark Kinerja).', skor: 1 },
          { id: '3.b.7', no: 7, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan kualitas atas capaian kinerja beserta upaya nyata dan/atau hambatannya.', skor: 1 },
          { id: '3.b.8', no: 8, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan efisiensi atas penggunaan sumber daya dalam mencapai kinerja.', skor: 1 },
          { id: '3.b.9', no: 9, pernyataan: 'Dokumen Laporan Kinerja telah menginfokan upaya perbaikan dan penyempurnaan kinerja ke depan (Rekomendasi perbaikan kinerja).', skor: 1 },
        ],
      },
      {
        kode: '3.c',
        nama: 'Pelaporan Kinerja telah memberikan dampak yang besar dalam peningkatan kinerja',
        bobot: 7.5,
        jawaban: 'A',
        nilai: 6.75,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '3.c.1', no: 1, pernyataan: 'Informasi dalam laporan kinerja selalu menjadi perhatian utama pimpinan (Bertanggung Jawab).', skor: 1 },
          { id: '3.c.2', no: 2, pernyataan: 'Penyajian informasi dalam laporan kinerja menjadi kepedulian seluruh pegawai.', skor: 1 },
          { id: '3.c.3', no: 3, pernyataan: 'Informasi dalam laporan kinerja berkala telah digunakan dalam penyesuaian aktivitas untuk mencapai kinerja.', skor: 1 },
          { id: '3.c.4', no: 4, pernyataan: 'Informasi dalam laporan kinerja berkala telah digunakan dalam penyesuaian penggunaan anggaran untuk mencapai kinerja.', skor: 1 },
          { id: '3.c.5', no: 5, pernyataan: 'Informasi dalam laporan kinerja telah digunakan dalam evaluasi pencapaian keberhasilan kinerja.', skor: 1 },
          { id: '3.c.6', no: 6, pernyataan: 'Informasi dalam laporan kinerja telah digunakan dalam penyesuaian perencanaan kinerja yang akan dihadapi berikutnya.', skor: 1 },
          { id: '3.c.7', no: 7, pernyataan: 'Informasi dalam laporan kinerja selalu mempengaruhi perubahan budaya kinerja organisasi.', skor: 1 },
        ],
      },
    ],
  },

  // 4. EVALUASI AKUNTABILITAS KINERJA INTERNAL
  {
    no: 4,
    kode: '4',
    nama: 'EVALUASI AKUNTABILITAS KINERJA INTERNAL',
    bobot: 25.0,
    nilai: 23.0,
    subKomponenList: [
      {
        kode: '4.a',
        nama: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan',
        bobot: 5.0,
        jawaban: 'AA',
        nilai: 5.0,
        persenIsian: 100.0,
        usiaDokumen: 5,
        kriteriaList: [
          { id: '4.a.1', no: 1, pernyataan: 'Terdapat pedoman teknis Evaluasi Akuntabilitas Kinerja Internal.', skor: 1 },
          { id: '4.a.2', no: 2, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan pada seluruh unit.', skor: 1 },
          { id: '4.a.3', no: 3, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan secara berjenjang.', skor: 1 },
        ],
      },
      {
        kode: '4.b',
        nama: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan secara berkualitas',
        bobot: 7.5,
        jawaban: 'A',
        nilai: 6.75,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '4.b.1', no: 1, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan sesuai standar.', skor: 1 },
          { id: '4.b.2', no: 2, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan oleh SDM yang memadai.', skor: 1 },
          { id: '4.b.3', no: 3, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan dengan pendalaman yang memadai.', skor: 1 },
          { id: '4.b.4', no: 4, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan pada seluruh unit kerja/bagian/instalasi/dll.', skor: 1 },
          { id: '4.b.5', no: 5, pernyataan: 'Evaluasi Akuntabilitas Kinerja Internal telah dilaksanakan menggunakan Teknologi Informasi (Aplikasi).', skor: 1 },
        ],
      },
      {
        kode: '4.c',
        nama: 'Implementasi SAKIP telah meningkat karena evaluasi akuntabilitas kinerja internal',
        bobot: 12.5,
        jawaban: 'A',
        nilai: 11.25,
        persenIsian: 100.0,
        upayaInovatif: 'Dapat',
        kriteriaList: [
          { id: '4.c.1', no: 1, pernyataan: 'Seluruh rekomendasi atas hasil evaluasi akuntabilitas kinerja internal telah ditindaklanjuti.', skor: 1 },
          { id: '4.c.2', no: 2, pernyataan: 'Telah terjadi peningkatan implementasi SAKIP dengan melaksanakan tindak lanjut atas rekomendasi.', skor: 1 },
          { id: '4.c.3', no: 3, pernyataan: 'Hasil Evaluasi Akuntabilitas Kinerja Internal telah dimanfaatkan untuk perbaikan dan peningkatan akuntabilitas kinerja.', skor: 1 },
          { id: '4.c.4', no: 4, pernyataan: 'Hasil dari Evaluasi Akuntabilitas Kinerja Internal telah dimanfaatkan dalam mendukung efektifitas dan efisiensi kinerja.', skor: 1 },
          { id: '4.c.5', no: 5, pernyataan: 'Telah terjadi perbaikan dan peningkatan kinerja dengan memanfaatkan hasil evaluasi akuntabilitas kinerja internal.', skor: 1 },
        ],
      },
    ],
  },
];
