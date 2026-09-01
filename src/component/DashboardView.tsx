import React, { useState } from 'react';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building2,
  FileCheck2,
  ArrowUpRight,
  ShieldCheck,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  Info,
  FolderArchive,
  Download,
  Check,
  Code2,
  KeyRound,
  LogIn,
} from 'lucide-react';
import {
  User,
  OPD,
  IndikatorPK,
  CapaianIndikatorTriwulan,
  LHEEvaluation,
  BobotSakip,
} from '../types';
import { ActiveTab } from './Sidebar';
import { downloadSampZip } from '../utils/downloadZip';

interface DashboardViewProps {
  currentUser: User;
  selectedYear: number;
  selectedOpdId: string;
  opdList: OPD[];
  indikatorList: IndikatorPK[];
  capaianTriwulanList: CapaianIndikatorTriwulan[];
  lheList: LHEEvaluation[];
  bobotSakip: BobotSakip;
  onNavigate: (tab: ActiveTab) => void;
  onOpenPhpModal?: () => void;
  onOpenLoginModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  selectedYear,
  selectedOpdId,
  opdList = [],
  indikatorList = [],
  capaianTriwulanList = [],
  lheList = [],
  bobotSakip,
  onNavigate,
  onOpenPhpModal,
  onOpenLoginModal,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    try {
      await downloadSampZip();
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    } catch (e) {
      console.error(e);
      alert('Gagal mendownload ZIP. Silakan coba kembali.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Filter by selected OPD & Year
  const filteredIndikator = (indikatorList || []).filter(
    (i) => (selectedOpdId === 'all' || i.opdId === selectedOpdId) && i.tahun === selectedYear
  );

  const filteredLhe = (lheList || []).filter(
    (l) => (selectedOpdId === 'all' || l.opdId === selectedOpdId) && l.tahun === selectedYear
  );

  // Calculate triwulan color stats
  let totalTriwulanEvaluated = 0;
  let countHijau = 0;
  let countKuning = 0;
  let countMerah = 0;

  (capaianTriwulanList || []).forEach((cap) => {
    if (selectedOpdId === 'all' || cap.opdId === selectedOpdId) {
      if (cap.tahun === selectedYear) {
        (cap.realisasiPerTriwulan || []).forEach((t) => {
          if (t.triwulan <= 3) {
            // Count reported quarters T1 - T3
            totalTriwulanEvaluated++;
            if (t.statusWarna === 'hijau') countHijau++;
            else if (t.statusWarna === 'kuning') countKuning++;
            else if (t.statusWarna === 'merah') countMerah++;
          }
        });
      }
    }
  });

  const persenHijau = totalTriwulanEvaluated ? Math.round((countHijau / totalTriwulanEvaluated) * 100) : 0;
  const persenKuning = totalTriwulanEvaluated ? Math.round((countKuning / totalTriwulanEvaluated) * 100) : 0;
  const persenMerah = totalTriwulanEvaluated ? Math.round((countMerah / totalTriwulanEvaluated) * 100) : 0;

  // Average SAKIP Score
  const avgSakipScore = filteredLhe.length
    ? Math.round(
        (filteredLhe.reduce((acc, l) => acc + l.nilaiTotal, 0) / filteredLhe.length) * 100
      ) / 100
    : 85.0;

  const getPredikatInfo = (score: number) => {
    if (score >= 90) return { predikat: 'AA', label: 'Sangat Memuaskan', color: 'bg-emerald-600 text-white' };
    if (score >= 80) return { predikat: 'A', label: 'Memuaskan', color: 'bg-teal-600 text-white' };
    if (score >= 70) return { predikat: 'BB', label: 'Sangat Baik', color: 'bg-blue-600 text-white' };
    if (score >= 60) return { predikat: 'B', label: 'Baik', color: 'bg-indigo-600 text-white' };
    if (score >= 50) return { predikat: 'CC', label: 'Cukup Baik', color: 'bg-amber-600 text-white' };
    if (score >= 30) return { predikat: 'C', label: 'Kurang', color: 'bg-orange-600 text-white' };
    return { predikat: 'D', label: 'Sangat Kurang', color: 'bg-rose-600 text-white' };
  };

  const currentPredikat = getPredikatInfo(avgSakipScore);

  const getOpdName = (id: string) => {
    const found = opdList.find((o) => o.id === id);
    return found ? found.nama : id;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Role Greeting */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 rounded-2xl shadow-lg border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 flex items-center pr-8 pointer-events-none">
          <Award className="w-64 h-64 text-emerald-300" />
        </div>

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Sistem Akuntabilitas Kinerja Instansi Pemerintah (SAKIP) TA {selectedYear}</span>
          </div>
          <h2 className="text-xl lg:text-2xl font-bold tracking-tight text-white mb-2">
            Selamat Datang, {currentUser.name}
          </h2>
          <p className="text-slate-300 text-xs lg:text-sm leading-relaxed">
            Anda terautentikasi sebagai <strong className="text-emerald-300 capitalize">{currentUser.roleTitle}</strong> ({currentUser.opdName}). Pantau keselarasan Renstra, target Perjanjian Kinerja (PK), capaian triwulanan (Hijau/Kuning/Merah), dan penerbitan Laporan Hasil Evaluasi (LHE).
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {currentUser.role === 'operator_unit' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('input-kinerja')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Input Indikator & Target PK</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('capaian-triwulan')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Input Capaian Triwulan</span>
                </button>
              </>
            )}

            {currentUser.role === 'validator' && (
              <button
                type="button"
                onClick={() => onNavigate('capaian-bulanan')}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validasi Capaian Bulanan & Evidens</span>
              </button>
            )}

            {currentUser.role === 'verifikator' && (
              <button
                type="button"
                onClick={() => onNavigate('lhe')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Evaluasi LHE (Lembar Kerja 1/0)</span>
              </button>
            )}

            {currentUser.role === 'administrator' && (
              <button
                type="button"
                onClick={() => onNavigate('lhe')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Monitoring Rekapitulasi LHE</span>
              </button>
            )}

            {onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="px-4 py-2 bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-600 text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-4 h-4 text-amber-400" />
                <span>Menu Login 4 User</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PROMINENT QUICK DOWNLOAD XAMPP PACKAGE BANNER */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 border-2 border-blue-500/50 shadow-xl text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <FolderArchive className="w-6 h-6 text-blue-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-white">File Paket XAMPP (sakip-xampp-package.zip)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-500 text-white uppercase tracking-wider">
                ZIP Siap Pakai
              </span>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              Berisi 16 file PHP Native, koneksi database PDO, skrip SQL (<code className="text-white bg-blue-950 px-1 py-0.5 rounded font-mono">db_sakip_pemda.sql</code>), dan panduan instalasi.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {onOpenPhpModal && (
            <button
              type="button"
              onClick={onOpenPhpModal}
              className="flex-1 md:flex-none px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-600 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Code2 className="w-4 h-4 text-blue-300" />
              <span>Lihat Struktur File</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex-1 md:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 active:scale-95 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isDownloading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Mengunduh ZIP...</span>
              </>
            ) : downloadSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-200" />
                <span>ZIP Berhasil Diunduh!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download sakip-xampp-package.zip</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Nilai SAKIP */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Nilai Akuntabilitas (SAKIP)
              </span>
              <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${currentPredikat.color}`}>
                {currentPredikat.predikat}
              </span>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{avgSakipScore}</span>
              <span className="text-xs text-slate-500 font-medium">/ 100 Poin</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">{currentPredikat.label}</span>
            <span className="text-emerald-700 font-bold">PermenPAN-RB</span>
          </div>
        </div>

        {/* Card 2: Total Indikator */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Total Indikator PK
              </span>
              <Layers className="w-4 h-4 text-sky-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">{filteredIndikator.length}</span>
              <span className="text-xs text-slate-500 font-medium">Indikator Kinerja</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600">IKU & IKP Perangkat Daerah</span>
            <button
              type="button"
              onClick={() => onNavigate('input-kinerja')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
            >
              Lihat <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 3: Status Capaian Hijau (≥ 100%) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Tercapai (≥100%)
              </span>
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{countHijau}</span>
              <span className="text-xs font-bold text-emerald-700">({persenHijau}%)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Kategori Hijau
            </span>
            <span className="text-slate-500">Tercapai</span>
          </div>
        </div>

        {/* Card 4: Status Deviasi (Kuning & Merah) */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Perlu Perhatian / Kritis
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-amber-700">{countKuning}</span>
              <span className="text-xs font-medium text-amber-700">Kuning ({persenKuning}%)</span>
              <span className="text-xl font-extrabold text-rose-700">{countMerah}</span>
              <span className="text-xs font-medium text-rose-700">Merah</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-medium">Merah: &lt;50% | Kuning: 50-99%</span>
            <button
              type="button"
              onClick={() => onNavigate('capaian-triwulan')}
              className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-0.5"
            >
              Cek <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Bobot 5 Komponen SAKIP & Realisasi Triwulanan */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 5 Komponen Evaluasi SAKIP PermenPAN-RB */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                5 Komponen Evaluasi SAKIP (PermenPAN-RB No. 88/2021)
              </h3>
              <p className="text-xs text-slate-500">
                Struktur bobot penilaian akuntabilitas kinerja instansi pemerintah
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              Total 100%
            </span>
          </div>

          <div className="mt-5 space-y-4">
            {/* Komponen 1 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">1. Perencanaan Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Skor: 27.5</span>
                  <span className="text-slate-500">Bobot {bobotSakip.perencanaan}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Renstra, IKU OPD, Rencana Kerja Tahunan, dan Perjanjian Kinerja berjenjang.
              </p>
            </div>

            {/* Komponen 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">2. Pengukuran Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Skor: 25.0</span>
                  <span className="text-slate-500">Bobot {bobotSakip.pengukuran}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '83%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Sistem E-SAKIP, ketersediaan bukti dukung bulanan, dan keandalan data kinerja.
              </p>
            </div>

            {/* Komponen 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">3. Pelaporan Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Skor: 14.2</span>
                  <span className="text-slate-500">Bobot {bobotSakip.pelaporan}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '95%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ketepatan waktu LAKIP, kedalaman analisis deviasi, dan publikasi ke masyarakat.
              </p>
            </div>

            {/* Komponen 4 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">4. Evaluasi Akuntabilitas Kinerja Internal</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Skor: 8.8</span>
                  <span className="text-slate-500">Bobot {bobotSakip.evaluasiInternal}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '88%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Evaluasi mandiri berkala dan tindak lanjut rekomendasi LHE sebelumnya.
              </p>
            </div>

            {/* Komponen 5 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">5. Capaian Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold">Skor: 14.5</span>
                  <span className="text-slate-500">Bobot {bobotSakip.capaianKinerja}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '96%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Capaian realisasi IKU, efisiensi penggunaan anggaran, serta inovasi daerah.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Panduan Warna Capaian & Rekap LHE Terbaru */}
        <div className="lg:col-span-5 space-y-6">
          {/* Rules Card: Panduan Warna Capaian */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>Standar Warna Capaian Triwulan</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-start gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-950">HIJAU : Tercapai / Melebihi</span>
                    <span className="font-mono font-bold text-emerald-700">≥ 100%</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Realisasi kinerja mencapai atau melampaui target yang ditetapkan dalam Perjanjian Kinerja.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-950">KUNING : Cukup / Perlu Perhatian</span>
                    <span className="font-mono font-bold text-amber-700">50% - 99.9%</span>
                  </div>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Realisasi sedang berjalan namun masih di bawah target, memerlukan tindak lanjut mitigasi.
                  </p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-3">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shrink-0 mt-0.5" />
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-950">MERAH : Kritis / Tidak Tercapai</span>
                    <span className="font-mono font-bold text-rose-700">&lt; 50%</span>
                  </div>
                  <p className="text-[11px] text-rose-800 mt-0.5">
                    Realisasi di bawah 50%, membutuhkan intervensi khusus dan evaluasi kendala dari pimpinan.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick LHE List */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 text-sm">Hasil Evaluasi (LHE) Terkini</h3>
              <button
                type="button"
                onClick={() => onNavigate('lhe')}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
              >
                Lihat Semua
              </button>
            </div>

            <div className="space-y-2.5">
              {filteredLhe.slice(0, 3).map((lhe) => (
                <div
                  key={lhe.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/70 hover:bg-slate-100/80 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-800 truncate max-w-[200px]">
                      {getOpdName(lhe.opdId)}
                    </span>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-md bg-emerald-600 text-white">
                      {lhe.predikat} ({lhe.nilaiTotal})
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                    {lhe.catatanEvaluasiUmum}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>No. {lhe.nomorSuratLHE}</span>
                    <span className="text-slate-600 font-medium">{lhe.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
