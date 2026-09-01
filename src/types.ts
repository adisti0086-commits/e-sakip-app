export type UserRole = 'administrator' | 'operator_unit' | 'validator' | 'verifikator';

export type ActiveMenu =
  | 'dashboard'
  | 'master'
  | 'master_renstra'
  | 'pengaturan_kinerja'
  | 'input_kinerja'
  | 'capaian_bulan'
  | 'capaian_triwulan'
  | 'lhe';

export interface User {
  id: string;
  name: string;
  nip: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  opdId: string;
  opdName: string;
  avatarUrl?: string;
}

export interface OPD {
  id: string;
  kode: string;
  nama: string;
  kepala: string;
  nipKepala: string;
  kategori: string;
  email: string;
  telepon: string;
}

export interface ProgramKegiatan {
  id: string;
  opdId: string;
  kodeProgram: string;
  namaProgram: string;
  kodeKegiatan: string;
  namaKegiatan: string;
  paguAnggaran: number;
  tahun: number;
}

export interface RenstraTujuan {
  id: string;
  kode: string;
  pernyataan: string;
  indikator: string;
  targetAwal: string;
  targetAkhir: string;
  satuan: string;
}

export interface RenstraSasaran {
  id: string;
  opdId: string;
  tujuanId: string;
  kode: string;
  sasaranStrategis: string;
  indikatorKinerja: string;
  satuan: string;
  target: number;
  realisasi: number;
  capaian: number;
  targetTahun1?: number;
  targetTahun2?: number;
  targetTahun3?: number;
  targetTahun4?: number;
  targetTahun5?: number;
  cascadingLevel: 'Eselon II' | 'Eselon III' | 'Eselon IV' | 'Staf/Pelaksana';
}

export type Polarisasi = 'Maximize' | 'Minimize';

export interface IndikatorPK {
  id: string;
  opdId: string;
  tahun: number;
  noUrut?: number;
  sasaranStrategis: string;
  namaIndikator: string;
  formula: string;
  satuan: string;
  polarisasi: Polarisasi;
  targetTahunan: number;
  targetRenstra?: string;
  targetPKText?: string;
  realisasi2025Text?: string;
  realisasiSem1Text?: string;
  capaianSem1Text?: string;
  targetT1: number;
  targetT2: number;
  targetT3: number;
  targetT4: number;
  paguAnggaran: number;
  penanggungJawab: string;
  tipeIndikator: 'IKU' | 'IKP' | 'Program' | 'Kegiatan';
}

export type StatusValidasi = 'Draft' | 'Menunggu Validasi' | 'Terverifikasi' | 'Perlu Perbaikan' | 'Ditolak';

export interface RealisasiBulan {
  bulan: number; // 1 - 12
  namaBulan: string;
  targetBulanan: number;
  realisasi: number;
  persenCapaian: number;
  evidensLink?: string;
  evidensNama?: string;
  keterangan?: string;
  statusValidasi: StatusValidasi;
  catatanValidator?: string;
  tanggalInput?: string;
  validatorNama?: string;
}

export interface CapaianIndikatorBulan {
  indikatorId: string;
  tahun: number;
  opdId: string;
  realisasiPerBulan: RealisasiBulan[];
}

export interface RealisasiTriwulan {
  triwulan: number; // 1, 2, 3, 4
  namaTriwulan: string;
  target: number;
  realisasi: number;
  persenCapaian: number;
  statusWarna: 'hijau' | 'kuning' | 'merah';
  faktorPendorong: string;
  faktorPenghambat: string;
  tindakLanjut: string;
  statusValidasi: StatusValidasi;
  catatanValidator?: string;
  tanggalVerifikasi?: string;
  evidensFile?: string;
}

export interface CapaianIndikatorTriwulan {
  indikatorId: string;
  tahun: number;
  opdId: string;
  realisasiPerTriwulan: RealisasiTriwulan[];
}

export interface KriteriaLHE {
  id: string;
  komponen: 'Perencanaan Kinerja' | 'Pengukuran Kinerja' | 'Pelaporan Kinerja' | 'Evaluasi Internal' | 'Capaian Kinerja';
  subKomponen: string;
  parameter: string;
  skor: 0 | 1; // 1 = Memenuhi, 0 = Belum Memenuhi
  bobotKriteria: number;
  catatanEvaluator: string;
}

export interface LHEEvaluation {
  id: string;
  nomorSuratLHE: string;
  opdId: string;
  tahun: number;
  tanggalEvaluasi: string;
  evaluatorId: string;
  evaluatorNama: string;
  dokumenLHEUrl?: string;
  dokumenLHENama?: string;
  ukuranFile?: string;
  status: 'Draft Evaluasi' | 'Selesai Dievaluasi' | 'Diterbitkan ke OPD';
  kriteriaList: KriteriaLHE[];
  nilaiTotal: number; // 0 - 100
  predikat: 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D';
  kategoriPredikat: string;
  catatanEvaluasiUmum: string;
  rekomendasiPerbaikan: string[];
  komitmenTindakLanjut?: string;
}

export interface BobotSakip {
  perencanaan: number; // default 30
  pengukuran: number;  // default 30
  pelaporan: number;   // default 15
  evaluasiInternal: number; // default 10
  capaianKinerja: number; // default 15
}
