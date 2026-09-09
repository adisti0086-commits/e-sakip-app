import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Building2,
  ChevronDown,
  ChevronUp,
  Info,
  ExternalLink,
  FileText,
  Layers,
  Sparkles,
  Link as LinkIcon,
  Eye,
  Check,
  X,
  Calendar,
  ArrowRight,
} from 'lucide-react';
import { LKEKomponen, LKESubKomponen, LKECriteriaItem } from '../../data/lkeData';
import { OPD, User } from '../types';
import {
  computeFullLKEData,
  updateKriteriaScoreInSubKomponen,
  updateSubKomponenJawaban,
  LKE_SYNC_EVENT,
  SubKomponenKode,
  notifyLKESync,
  getPredikatObj,
} from '../utils/lkeSync';

interface LKEEvaluasiViewProps {
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

// Aturan Warna SAKIP:
// > 100% hijau, tercapai 100% biru, antara 50-100% kuning, kurang 50% merah.
// disamping capaian buat normalisasi 120 % paling tinggi.
export const getCapaianColor = (persen: number) => {
  if (persen > 100) {
    return {
      key: 'hijau' as const,
      label: 'Lebih dari 100%',
      labelShort: '> 100%',
      statusText: 'Melampaui Target (Sangat Baik)',
      bgClass: 'bg-emerald-600 text-white',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
    };
  }
  if (Math.abs(persen - 100) < 0.01) {
    return {
      key: 'biru' as const,
      label: 'Tercapai 100%',
      labelShort: '100%',
      statusText: 'Tercapai Sempurna',
      bgClass: 'bg-blue-600 text-white',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      dotClass: 'bg-blue-500',
    };
  }
  if (persen >= 50 && persen < 100) {
    return {
      key: 'kuning' as const,
      label: 'Antara 50 - 100%',
      labelShort: '50-100%',
      statusText: 'Cukup / Perlu Perhatian',
      bgClass: 'bg-amber-500 text-slate-900',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      dotClass: 'bg-amber-500',
    };
  }
  return {
    key: 'merah' as const,
    label: 'Kurang 50%',
    labelShort: '< 50%',
    statusText: 'Kurang / Kritis',
    bgClass: 'bg-rose-600 text-white',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
    dotClass: 'bg-rose-500',
  };
};

export const LKEEvaluasiView: React.FC<LKEEvaluasiViewProps> = ({
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
  onNavigateTab,
}) => {
  // Automatically loads and syncs with inputs 1, 2, 3, 4
  const [lkeData, setLkeData] = useState<LKEKomponen[]>(() => computeFullLKEData());
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [filterKomponen, setFilterKomponen] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'standar' | 'lengkap'>('lengkap');
  const [expandedCritIds, setExpandedCritIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>(
    new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Modal for viewing full connected evidence
  const [selectedCritModal, setSelectedCritModal] = useState<{
    crit: LKECriteriaItem;
    subKode: string;
    subNama: string;
    kompNama: string;
  } | null>(null);

  const canEdit =
    currentUser.role === 'verifikator' ||
    currentUser.role === 'validator' ||
    currentUser.role === 'administrator';

  // Listen to real-time sync events from any input component (1.a through 4.c)
  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ source?: string }>;
      if (ce.detail?.source === 'lke') return;
      setLkeData(computeFullLKEData());
      setLastSyncTime(
        new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    };

    window.addEventListener(LKE_SYNC_EVENT, handleSync);

    return () => {
      window.removeEventListener(LKE_SYNC_EVENT, handleSync);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRefresh = () => {
    setLkeData(computeFullLKEData());
    setLastSyncTime(
      new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    );
    showToast('Data LKE berhasil disinkronkan ulang dengan seluruh input Komponen 1, 2, 3, dan 4!');
  };

  // Update Jawaban Sub-Komponen PermenPAN-RB langsung
  const handleUpdateJawaban = (
    subKode: SubKomponenKode,
    newJawaban: 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'
  ) => {
    if (!canEdit) return;
    updateSubKomponenJawaban(subKode, newJawaban);
    setLkeData(computeFullLKEData());
    showToast(`Jawaban ${subKode} diubah ke '${newJawaban}'. Nilai SAKIP otomatis terbarui di Dashboard & LKE!`);
  };

  // Toggle skor kriteria 1 or 0 (Two-way synchronization with subcomponent)
  const handleToggleKriteria = (
    subKode: string,
    kriteriaId: string,
    currentSkor: number
  ) => {
    if (!canEdit) return;

    const newSkor: 1 | 0 = currentSkor === 1 ? 0 : 1;
    updateKriteriaScoreInSubKomponen(subKode as SubKomponenKode, kriteriaId, newSkor);
    setLkeData(computeFullLKEData());
    showToast(`Skor kriteria berhasil diubah menjadi ${newSkor} dan terhubung ke Dashboard & Sub-Komponen ${subKode}!`);
  };

  const toggleExpand = (critId: string) => {
    setExpandedCritIds((prev) => ({
      ...prev,
      [critId]: !prev[critId],
    }));
  };

  // Helper navigation to specific subcomponent input tab
  const handleNavigateToSub = (subKode: string) => {
    if (!onNavigateTab) return;
    const tabMap: Record<string, string> = {
      '1.a': 'perencanaan-1a',
      '1.b': 'perencanaan-1b',
      '1.c': 'perencanaan-1c',
      '2.a': 'pengukuran-2a',
      '2.b': 'pengukuran-2b',
      '2.c': 'pengukuran-2c',
      '3.a': 'pelaporan-3a',
      '3.b': 'pelaporan-3b',
      '3.c': 'pelaporan-3c',
      '4.a': 'evaluasi-4a',
      '4.b': 'evaluasi-4b',
      '4.c': 'evaluasi-4c',
    };
    const target = tabMap[subKode];
    if (target) onNavigateTab(target);
  };

  // Total Nilai SAKIP
  const totalNilai = lkeData.reduce((acc, k) => acc + k.nilai, 0);
  const roundedTotal = Math.round(totalNilai * 100) / 100;
  const predikatObj = getPredikatObj(roundedTotal);

  // Total Capaian SAKIP & Normalisasi 120% Paling Tinggi
  // > 100% hijau, tercapai 100% biru, antara 50-100% kuning, kurang 50% merah
  const totalBobot = 100;
  const totalCapaianPersen = totalBobot > 0 ? (roundedTotal / totalBobot) * 100 : 0;
  const totalNormPersen = Math.min(totalCapaianPersen, 120);
  const totalCapaianColor = getCapaianColor(totalCapaianPersen);
  const totalNormColor = getCapaianColor(totalNormPersen);

  // Total kriteria statistics across all components
  const allKriteria = lkeData.flatMap((k) => k.subKomponenList.flatMap((s) => s.kriteriaList));
  const totalKriteriaCount = allKriteria.length;
  const totalMemenuhiCount = allKriteria.filter((k) => k.skor === 1).length;

  // Filter components
  const filteredKomponen = lkeData.filter((k) => {
    if (filterKomponen !== 'all' && k.kode !== filterKomponen) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchKomponen = k.nama.toLowerCase().includes(term);
    const matchSub = k.subKomponenList.some(
      (s) =>
        s.nama.toLowerCase().includes(term) ||
        s.kriteriaList.some(
          (c) =>
            c.pernyataan.toLowerCase().includes(term) ||
            (c.buktiPendukung && c.buktiPendukung.toLowerCase().includes(term)) ||
            (c.catatanAsesor && c.catatanAsesor.toLowerCase().includes(term))
        )
    );
    return matchKomponen || matchSub;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Synchronized Connection Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#451212] to-slate-900 rounded-2xl p-5 md:p-6 text-white shadow-xl relative overflow-hidden border border-rose-900/30">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-rose-500/30 text-rose-200 border border-rose-400/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Terhubung Otomatis ke Input 1, 2, 3, 4
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/20 font-bold text-xs">
                TA {selectedYear} • RSUP Dr. M. Djamil
              </span>
              <span className="text-[11px] text-slate-300">
                Sinkron: <strong className="text-emerald-300 font-mono">{lastSyncTime}</strong>
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Lembar Kerja Evaluasi (LKE) SAKIP Terintegrasi
            </h1>
            <p className="text-xs text-rose-100/90 max-w-3xl leading-relaxed">
              Seluruh skor, regulasi/dokumen bukti dukung, tautan berkas (URL), dan catatan asesor yang Anda inputkan di{' '}
              <strong>1. Perencanaan Kinerja</strong>, <strong>2. Pengukuran Kinerja</strong>,{' '}
              <strong>3. Pelaporan Kinerja</strong>, dan <strong>4. Evaluasi Internal</strong> terhubung dan mengkalkulasi LKE secara otomatis sesuai format baku PermenPAN-RB No. 88/2021.
            </p>
          </div>

          {/* SAKIP Score Display matching Table Images */}
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md border border-white/15 p-4 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-300 block">
                Total Nilai Instansi
              </span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-emerald-300 font-mono">
                  {roundedTotal.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100.00</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-300 block">
                {predikatObj.kategori}
              </span>
            </div>
            <div className="pl-4 border-l border-white/15 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-300 block mb-1">
                Predikat
              </span>
              <span
                className={`text-2xl font-black px-3 py-1 rounded-xl shadow-xs inline-block ${predikatObj.bg}`}
              >
                {predikatObj.predikat}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Komponen Live Metrics Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          {lkeData.map((k) => (
            <button
              key={k.kode}
              type="button"
              onClick={() => setFilterKomponen(filterKomponen === k.kode ? 'all' : k.kode)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                filterKomponen === k.kode
                  ? 'bg-white text-slate-900 border-white ring-2 ring-white/50 shadow-md'
                  : 'bg-white/10 text-white border-white/10 hover:bg-white/15'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold line-clamp-1">
                  {k.no}. {k.nama}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className={filterKomponen === k.kode ? 'text-slate-600' : 'text-slate-300'}>
                  Bobot {k.bobot.toFixed(2)}
                </span>
                <span
                  className={`font-black font-mono ${
                    filterKomponen === k.kode ? 'text-slate-900' : 'text-emerald-300'
                  }`}
                >
                  Nilai {k.nilai.toFixed(1)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kriteria, regulasi, dokumen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={filterKomponen}
              onChange={(e) => setFilterKomponen(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua Komponen (1 - 4)</option>
              <option value="1">1. Perencanaan Kinerja (30%)</option>
              <option value="2">2. Pengukuran Kinerja (30%)</option>
              <option value="3">3. Pelaporan Kinerja (15%)</option>
              <option value="4">4. Evaluasi Internal (25%)</option>
            </select>
          </div>

          {/* View Mode Selector */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setViewMode('standar')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                viewMode === 'standar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Format Standar
            </button>
            <button
              type="button"
              onClick={() => setViewMode('lengkap')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'lengkap'
                  ? 'bg-rose-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 text-amber-300" />
              <span>Detail Bukti & Catatan</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={handleRefresh}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
            title="Segarkan data dari penyimpanan seluruh komponen"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Segarkan Sinkronisasi</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-[#5c1818] hover:bg-[#4a1313] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak LKE</span>
          </button>
        </div>
      </div>

      {/* TABLE SESUAI GAMBAR PERMENPAN-RB DENGAN KONEKSI KE HASIL INPUT 1,2,3,4 */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            {/* Header Dark Maroon / Brown (Identik Format PermenPAN-RB) */}
            <thead>
              <tr className="bg-[#5c1818] text-white font-bold text-center border-b border-[#4a1313]">
                <th rowSpan={2} className="px-3 py-3 w-12 border-r border-[#742323] text-center">
                  No
                </th>
                <th rowSpan={2} className="px-4 py-3 text-left border-r border-[#742323]">
                  Komponen / Sub Komponen / Kriteria SAKIP
                </th>
                <th rowSpan={2} className="px-3 py-3 w-20 border-r border-[#742323] text-center">
                  Bobot
                </th>
                <th colSpan={2} className="px-3 py-1.5 border-r border-[#742323] text-center bg-[#4c1212]">
                  Instansi RSUP
                </th>
                <th rowSpan={2} className="px-3 py-3 w-28 text-center border-r border-[#742323]">
                  % Capaian
                </th>
                <th rowSpan={2} className="px-3 py-3 w-32 text-center border-r border-[#742323] bg-[#4a1313]">
                  Normalisasi 120%
                </th>
                <th rowSpan={2} className="px-4 py-3 w-28 text-center">
                  Catatan / Skor
                </th>
              </tr>
              <tr className="bg-[#4c1212] text-white font-semibold text-[11px] border-b border-[#3b0d0d]">
                <th className="px-2 py-1.5 w-16 border-r border-[#742323] text-center">Jawaban</th>
                <th className="px-2 py-1.5 w-16 border-r border-[#742323] text-center">Nilai</th>
              </tr>
            </thead>

            <tbody>
              {filteredKomponen.map((komponen) => {
                const kompCapaian = komponen.bobot > 0 ? (komponen.nilai / komponen.bobot) * 100 : 0;
                const kompNorm = Math.min(kompCapaian, 120);
                const kompColor = getCapaianColor(kompCapaian);
                const kompNormColor = getCapaianColor(kompNorm);

                return (
                  <React.Fragment key={komponen.kode}>
                    {/* BARIS UTAMA KOMPONEN (Peach/Salmon Background Identik Gambar) */}
                    <tr className="bg-[#fde2e4] text-slate-900 font-extrabold border-t-2 border-b border-slate-300">
                      <td className="px-3 py-2.5 text-center font-bold border-r border-slate-300 text-slate-900">
                        {komponen.no}
                      </td>
                      <td className="px-4 py-2.5 uppercase tracking-wide border-r border-slate-300 text-slate-900">
                        <div className="flex items-center justify-between">
                          <span>{komponen.nama}</span>
                          <span className="text-[10px] font-semibold bg-rose-200/80 px-2 py-0.5 rounded text-rose-900 border border-rose-300">
                            Total Bobot {komponen.bobot.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono border-r border-slate-300 text-slate-900">
                        {komponen.bobot.toFixed(2)}
                      </td>
                      <td className="px-2 py-2.5 text-center border-r border-slate-300 bg-[#fad2d5]">
                        {/* Empty on Komponen level according to image */}
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-black border-r border-slate-300 bg-[#fad2d5] text-slate-900">
                        {komponen.nilai.toFixed(1)}
                      </td>
                      <td className="px-2 py-2.5 text-center border-r border-slate-300 bg-[#fad2d5]">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] border ${kompColor.badgeClass}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${kompColor.dotClass}`} />
                          {kompCapaian.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center border-r border-slate-300 bg-[#fad2d5]">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full font-mono font-bold text-[11px] border ${kompNormColor.badgeClass}`}
                        >
                          {kompNorm.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium italic text-slate-600">
                        Komponen {komponen.no}
                      </td>
                    </tr>

                    {/* SUB-KOMPONEN & KRITERIA LIST */}
                    {komponen.subKomponenList.map((sub) => {
                      const subCapaian = sub.bobot > 0 ? (sub.nilai / sub.bobot) * 100 : 0;
                      const subNorm = Math.min(subCapaian, 120);
                      const subColor = getCapaianColor(subCapaian);
                      const subNormColor = getCapaianColor(subNorm);

                      return (
                        <React.Fragment key={sub.kode}>
                          {/* BARIS SUB-KOMPONEN (Light Peach Identik Gambar) */}
                          <tr className="bg-[#fff1f2] text-slate-900 font-bold border-t border-b border-slate-300">
                            <td className="px-3 py-2 text-center font-mono border-r border-slate-300 text-slate-800">
                              {sub.kode}
                            </td>
                            <td className="px-4 py-2 border-r border-slate-300 text-slate-900">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-900 font-bold">{sub.nama}</span>
                                <button
                                  type="button"
                                  onClick={() => handleNavigateToSub(sub.kode)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-2xs ${
                                    sub.kode.startsWith('1.')
                                      ? 'bg-sky-100 hover:bg-sky-200 text-sky-800 border border-sky-300'
                                      : sub.kode.startsWith('2.')
                                      ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                      : sub.kode.startsWith('3.')
                                      ? 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
                                      : 'bg-purple-100 hover:bg-purple-200 text-purple-900 border border-purple-300'
                                  }`}
                                  title={`Buka Halaman Form Input Sub-Komponen ${sub.kode}`}
                                >
                                  <span>Buka Form Input {sub.kode}</span>
                                  <ArrowRight className="w-3 h-3" />
                                </button>
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center font-mono border-r border-slate-300 text-slate-800">
                              {sub.bobot.toFixed(2)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono font-extrabold border-r border-slate-300 bg-white">
                              {canEdit ? (
                                <select
                                  value={sub.jawaban}
                                  onChange={(e) =>
                                    handleUpdateJawaban(
                                      sub.kode as SubKomponenKode,
                                      e.target.value as 'AA' | 'A' | 'BB' | 'B' | 'CC' | 'C' | 'D'
                                    )
                                  }
                                  className="px-1.5 py-0.5 rounded bg-amber-50 border border-amber-300 text-slate-900 font-extrabold text-xs cursor-pointer hover:border-emerald-500 focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                                  title="Ubah Jawaban Evaluasi PermenPAN-RB (AA, A, BB, B, CC, C, D)"
                                >
                                  <option value="AA">AA (100%)</option>
                                  <option value="A">A (90%)</option>
                                  <option value="BB">BB (80%)</option>
                                  <option value="B">B (70%)</option>
                                  <option value="CC">CC (60%)</option>
                                  <option value="C">C (50%)</option>
                                  <option value="D">D (30%)</option>
                                </select>
                              ) : (
                                <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold">
                                  {sub.jawaban}
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2 text-center font-mono font-bold border-r border-slate-300 bg-white text-slate-900">
                              {sub.nilai.toFixed(1)}
                            </td>
                            <td className="px-2 py-2 text-center border-r border-slate-300 bg-white">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border ${subColor.badgeClass}`}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full ${subColor.dotClass}`} />
                                {subCapaian.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center border-r border-slate-300 bg-white">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full font-mono font-bold text-[11px] border ${subNormColor.badgeClass}`}
                              >
                                {subNorm.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-3 py-2 text-center italic text-slate-600 font-medium bg-[#fff1f2]">
                              (Diisi {sub.persenIsian.toFixed(2)})
                            </td>
                          </tr>

                          {/* LABEL KRITERIA */}
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <td className="px-3 py-1 border-r border-slate-300"></td>
                            <td
                              colSpan={4}
                              className="px-4 py-1 text-[11px] font-semibold text-slate-700 italic border-r border-slate-300"
                            >
                              Kriteria Pemenuhan Standar:
                            </td>
                            <td colSpan={2} className="px-3 py-1 text-center font-mono text-[11px] text-slate-500 border-r border-slate-300">
                              Skor Pemenuhan Kriteria
                            </td>
                            <td className="px-3 py-1 text-center font-mono font-bold text-slate-800 bg-[#fff9db] border-l border-slate-300">
                              {sub.persenIsian.toFixed(2)}
                            </td>
                          </tr>

                          {/* DAFTAR KRITERIA BERURUTAN */}
                          {sub.kriteriaList.map((crit) => {
                            const isGreen =
                              sub.kode === '1.b' ||
                              (sub.kode === '1.c' && crit.no <= 2) ||
                              (sub.kode === '2.b' && crit.no >= 2 && crit.no <= 3) ||
                              (sub.kode === '3.b' && crit.no >= 3 && crit.no <= 7);

                            const isExpanded = !!expandedCritIds[crit.id] || viewMode === 'lengkap';
                            const hasEvidence = !!crit.buktiPendukung || !!crit.linkDakung || !!crit.catatanAsesor;

                            return (
                              <React.Fragment key={crit.id}>
                                <tr
                                  className={`border-b border-slate-200 transition-colors hover:bg-slate-100/80 ${
                                    isGreen ? 'bg-[#dcedc8]/60' : 'bg-white'
                                  }`}
                                >
                                  <td className="px-3 py-1.5 text-center font-mono text-slate-500 border-r border-slate-300">
                                    {crit.no}
                                  </td>
                                  <td
                                    className="px-4 py-1.5 text-slate-800 leading-snug border-r border-slate-300"
                                    colSpan={3}
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-1">
                                        <p className="text-slate-900 font-medium">
                                          {crit.pernyataan}
                                        </p>
                                        {/* Inline badge indicator when evidence is linked */}
                                        {hasEvidence && viewMode === 'standar' && (
                                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                                              <Check className="w-2.5 h-2.5" /> Bukti Terhubung
                                            </span>
                                            {crit.linkDakung && (
                                              <span className="inline-flex items-center gap-1 text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200 font-semibold">
                                                <LinkIcon className="w-2.5 h-2.5" /> Tautan Aktif
                                              </span>
                                            )}
                                          </div>
                                        )}
                                      </div>

                                      {/* Quick View Button */}
                                      <div className="flex items-center gap-1 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setSelectedCritModal({
                                              crit,
                                              subKode: sub.kode,
                                              subNama: sub.nama,
                                              kompNama: komponen.nama,
                                            })
                                          }
                                          className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                                          title="Lihat Rincian Bukti & Catatan Input Lengkap"
                                        >
                                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                                        </button>
                                        {viewMode === 'standar' && (
                                          <button
                                            type="button"
                                            onClick={() => toggleExpand(crit.id)}
                                            className="p-1 rounded text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 transition-colors cursor-pointer"
                                            title="Buka rincian di bawah baris"
                                          >
                                            {expandedCritIds[crit.id] ? (
                                              <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                                            ) : (
                                              <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                            )}
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-mono font-bold border-r border-slate-300 bg-white">
                                    {/* Empty on Nilai column for criteria */}
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-mono text-xs border-r border-slate-300 bg-white">
                                    <span
                                      className={`font-bold ${
                                        crit.skor === 1 ? 'text-blue-700' : 'text-slate-400'
                                      }`}
                                    >
                                      {crit.skor === 1 ? '100%' : '0%'}
                                    </span>
                                  </td>
                                  <td className="px-2 py-1.5 text-center font-mono text-xs border-r border-slate-300 bg-white">
                                    <span
                                      className={`font-bold ${
                                        crit.skor === 1 ? 'text-blue-700' : 'text-slate-400'
                                      }`}
                                    >
                                      {crit.skor === 1 ? '100%' : '0%'}
                                    </span>
                                  </td>
                                  <td
                                    className={`px-3 py-1.5 text-center font-mono font-bold border-l border-slate-300 ${
                                      crit.skor === 1
                                        ? crit.no === 2 && sub.kode === '1.a'
                                          ? 'bg-[#fff59d]'
                                          : isGreen
                                          ? 'bg-[#dcedc8]'
                                          : 'bg-[#fff9db]'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {canEdit ? (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleToggleKriteria(sub.kode, crit.id, crit.skor)
                                        }
                                        className={`w-full py-0.5 rounded font-mono font-bold text-xs flex items-center justify-center gap-1 cursor-pointer transition-all hover:ring-2 hover:ring-emerald-400 ${
                                          crit.skor === 1
                                            ? 'text-slate-900'
                                            : 'text-rose-700 bg-rose-200'
                                        }`}
                                        title={`Klik untuk ubah skor (saat ini ${crit.skor})`}
                                      >
                                        <span>{crit.skor}</span>
                                        <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
                                      </button>
                                    ) : (
                                      <span>{crit.skor}</span>
                                    )}
                                  </td>
                                </tr>

                                {/* DETAIL BUKTI DUKUNG TERHUBUNG (Ditampilkan saat Mode Lengkap atau di-expand) */}
                                {isExpanded && (
                                  <tr className="bg-slate-50/90 border-b border-slate-200">
                                    <td className="border-r border-slate-300"></td>
                                    <td
                                      colSpan={5}
                                      className="px-4 py-2 border-r border-slate-300 text-[11px]"
                                    >
                                      <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-2xs space-y-2">
                                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-1.5">
                                          <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-700 flex items-center gap-1">
                                              <FileText className="w-3.5 h-3.5 text-rose-800" />
                                              Bukti Dukung Input {sub.kode}.{crit.no}:
                                            </span>
                                            {crit.nomorDokumen && (
                                              <span className="font-mono text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                                                {crit.nomorDokumen}
                                              </span>
                                            )}
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span
                                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                                crit.skor === 1
                                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                                              }`}
                                            >
                                              {crit.statusPemenuhan || (crit.skor === 1 ? 'Memenuhi Standar' : 'Belum Memenuhi')}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() => handleNavigateToSub(sub.kode)}
                                              className="text-[10px] font-bold text-sky-700 hover:text-sky-900 underline flex items-center gap-0.5 cursor-pointer"
                                            >
                                              <span>Edit di {sub.kode}</span>
                                              <ArrowRight className="w-2.5 h-2.5" />
                                            </button>
                                          </div>
                                        </div>

                                        <p className="text-slate-800 text-[11px] leading-relaxed">
                                          {crit.buktiPendukung || 'Belum ada bukti pendukung yang diinputkan.'}
                                        </p>

                                        {/* Catatan Asesor & Link Dukung */}
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-[10px] text-slate-600">
                                          <div className="italic text-slate-500">
                                            {crit.catatanAsesor ? (
                                              <span>
                                                <strong>Catatan Asesor:</strong> {crit.catatanAsesor}
                                              </span>
                                            ) : (
                                              <span className="text-slate-400">Tidak ada catatan asesor khusus.</span>
                                            )}
                                          </div>

                                          {crit.linkDakung ? (
                                            <a
                                              href={crit.linkDakung}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="inline-flex items-center gap-1 text-sky-700 hover:text-sky-900 bg-sky-50 hover:bg-sky-100 border border-sky-200 px-2 py-1 rounded font-bold transition-colors shrink-0"
                                            >
                                              <LinkIcon className="w-3 h-3" />
                                              <span>Buka Tautan Berkas Bukti</span>
                                              <ExternalLink className="w-2.5 h-2.5" />
                                            </a>
                                          ) : (
                                            <span className="text-slate-400 italic">Tautan link berkas belum diisi</span>
                                          )}
                                        </div>
                                      </div>
                                    </td>
                                    <td className="border-r border-slate-300 bg-white"></td>
                                    <td className="border-l border-slate-300 bg-slate-50"></td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}

                          {/* USIA DOKUMEN (BARIS BIRU IDENTIK GAMBAR 1, 2, 3, 4) */}
                          {sub.usiaDokumen !== undefined && (
                            <tr className="bg-[#b3d4fc] text-slate-900 font-bold border-b border-slate-300">
                              <td className="px-3 py-1.5 border-r border-slate-300"></td>
                              <td
                                colSpan={6}
                                className="px-4 py-1.5 font-bold text-slate-900 border-r border-slate-300"
                              >
                                Usia Dokumen
                              </td>
                              <td className="px-3 py-1.5 text-center font-mono font-bold bg-[#b3d4fc] border-l border-slate-300 text-slate-900">
                                {sub.usiaDokumen}
                              </td>
                            </tr>
                          )}

                          {/* UPAYA INOVATIF (BARIS BIRU IDENTIK GAMBAR 1, 2, 3, 4, 5) */}
                          {sub.upayaInovatif !== undefined && (
                            <tr className="bg-[#b3d4fc] text-slate-900 font-bold border-b border-slate-300">
                              <td className="px-3 py-1.5 border-r border-slate-300"></td>
                              <td
                                colSpan={6}
                                className="px-4 py-1.5 font-bold text-slate-900 border-r border-slate-300"
                              >
                                Terdapat upaya inovatif terkait{' '}
                                {sub.kode.startsWith('1')
                                  ? sub.kode === '1.b'
                                    ? 'kualitas perencanaan kinerja'
                                    : 'manfaat perencanaan kinerja'
                                  : sub.kode.startsWith('2')
                                  ? sub.kode === '2.b'
                                    ? 'kualitas pengukuran kinerja'
                                    : 'manfaat pengukuran kinerja'
                                  : sub.kode.startsWith('3')
                                  ? sub.kode === '3.b'
                                    ? 'kualitas pelaporan kinerja'
                                    : 'manfaat pelaporan kinerja'
                                  : sub.kode === '4.b'
                                  ? 'kualitas evaluasi akuntabilitas kinerja internal'
                                  : 'manfaat evaluasi akuntabilitas kinerja internal'}
                              </td>
                              <td className="px-3 py-1.5 text-center font-bold bg-[#b3d4fc] border-l border-slate-300 text-slate-900">
                                Dapat
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* BARIS TOTAL AKHIR NILAI SAKIP & CAPAIAN KINERJA (COLOR-CODED) */}
              <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                <td colSpan={2} className="px-4 py-3.5 uppercase tracking-wider text-right">
                  TOTAL NILAI AKUNTABILITAS KINERJA INSTANSI (SAKIP):
                </td>
                <td className="px-3 py-3.5 text-center font-mono text-emerald-400">100.00</td>
                <td className="px-2 py-3.5 text-center font-mono">
                  <span className={`px-2 py-0.5 rounded font-black text-xs ${predikatObj.bg}`}>
                    {predikatObj.predikat}
                  </span>
                </td>
                <td className="px-2 py-3.5 text-center font-mono text-emerald-400 text-base">
                  {roundedTotal.toFixed(1)}
                </td>
                {/* Total % Capaian dengan Aturan Warna User: >100% Hijau, 100% Biru, 50-100% Kuning, <50% Merah */}
                <td className="px-2 py-3.5 text-center border-x border-slate-700 bg-slate-800/80">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-black border ${totalCapaianColor.badgeClass}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${totalCapaianColor.dotClass}`} />
                      {totalCapaianPersen.toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-bold uppercase text-slate-300">
                      ({totalCapaianColor.label})
                    </span>
                  </div>
                </td>
                {/* Di Samping Capaian: Normalisasi 120% Paling Tinggi */}
                <td className="px-2 py-3.5 text-center border-r border-slate-700 bg-slate-800">
                  <div className="flex flex-col items-center justify-center gap-0.5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full font-mono text-xs font-black border ${totalNormColor.badgeClass}`}
                    >
                      {totalNormPersen.toFixed(1)}%
                    </span>
                    <span className="text-[9px] font-bold text-emerald-400">
                      {totalCapaianPersen > 120 ? '(Maks. 120%)' : 'Maks. 120%'}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3.5 text-center text-xs font-medium text-emerald-300">
                  {predikatObj.kategori}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* PANDUAN INDIKATOR WARNA CAPAIAN & KETENTUAN NORMALISASI 120% */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Ketentuan Standar Indikator Warna Capaian & Normalisasi 120% SAKIP
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            PermenPAN-RB No. 88/2021 & Pedoman Evaluasi Akuntabilitas Kinerja
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Lebih dari 100% Hijau */}
          <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/70 flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-emerald-950">&gt; 100% (Hijau)</span>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                Capaian melampaui target yang ditetapkan (Sangat Baik).
              </p>
            </div>
          </div>

          {/* Tercapai 100% Biru */}
          <div className="p-3 rounded-xl border border-blue-200 bg-blue-50/70 flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-blue-600 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-blue-950">Tercapai 100% (Biru)</span>
              </div>
              <p className="text-[11px] text-blue-800 font-medium mt-0.5">
                Target kinerja tercapai 100% tepat sasaran.
              </p>
            </div>
          </div>

          {/* Antara 50-100% Kuning */}
          <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/70 flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-amber-500 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-amber-950">50% - &lt;100% (Kuning)</span>
              </div>
              <p className="text-[11px] text-amber-900 font-medium mt-0.5">
                Capaian cukup, perlu pemantauan & perhatian berkala.
              </p>
            </div>
          </div>

          {/* Kurang 50% Merah */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/70 flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-rose-950">&lt; 50% (Merah)</span>
              </div>
              <p className="text-[11px] text-rose-900 font-medium mt-0.5">
                Kinerja kurang / kritis, membutuhkan tindak lanjut segera.
              </p>
            </div>
          </div>

          {/* Disamping Capaian Normalisasi 120% Paling Tinggi */}
          <div className="p-3 rounded-xl border border-purple-200 bg-purple-50/70 flex items-start gap-2.5">
            <div className="w-3.5 h-3.5 rounded-full bg-purple-600 mt-0.5 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-extrabold text-purple-950">Normalisasi 120%</span>
              </div>
              <p className="text-[11px] text-purple-900 font-medium mt-0.5">
                Ditempatkan di samping capaian dengan plafon maksimal 120.00%.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL RINCIAN BUKTI DUKUNG TERHUBUNG */}
      {selectedCritModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-slate-900 via-[#5c1818] to-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase">
                    Sub-Komponen {selectedCritModal.subKode}
                  </span>
                  <span className="text-xs text-rose-200 font-semibold">
                    Kriteria No. {selectedCritModal.crit.no}
                  </span>
                </div>
                <h3 className="text-base font-bold text-white">
                  Rincian Bukti & Evaluasi LKE
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCritModal(null)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Pernyataan Kriteria Standar PermenPAN-RB:
                </span>
                <p className="text-sm font-semibold text-slate-900 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {selectedCritModal.crit.pernyataan}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Skor Pemenuhan LKE:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-base font-black px-2.5 py-1 rounded-lg ${
                        selectedCritModal.crit.skor === 1
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {selectedCritModal.crit.skor === 1 ? '1 (Terpenuhi)' : '0 (Belum Terpenuhi)'}
                    </span>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => {
                          const newSkor: 1 | 0 = selectedCritModal.crit.skor === 1 ? 0 : 1;
                          handleToggleKriteria(
                            selectedCritModal.subKode,
                            selectedCritModal.crit.id,
                            selectedCritModal.crit.skor
                          );
                          setSelectedCritModal((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  crit: {
                                    ...prev.crit,
                                    skor: newSkor,
                                    statusPemenuhan:
                                      newSkor === 1 ? 'Memenuhi Standar' : 'Belum Memenuhi',
                                  },
                                }
                              : null
                          );
                        }}
                        className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded font-semibold text-[11px] cursor-pointer"
                      >
                        Ubah ke {selectedCritModal.crit.skor === 1 ? '0' : '1'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                    Status Pemenuhan:
                  </span>
                  <span className="text-xs font-bold text-slate-800 block mt-1">
                    {selectedCritModal.crit.statusPemenuhan || 'Memenuhi Standar'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Bukti Pendukung / Dokumen Regulasi RSUP:
                </span>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2">
                  <p className="text-slate-800 font-medium leading-relaxed">
                    {selectedCritModal.crit.buktiPendukung || 'Belum diisi.'}
                  </p>
                  {selectedCritModal.crit.nomorDokumen && (
                    <div className="text-[11px] text-slate-600 font-mono">
                      Nomor SK/Dokumen: <strong>{selectedCritModal.crit.nomorDokumen}</strong>
                    </div>
                  )}
                  {selectedCritModal.crit.tanggalPenetapan && (
                    <div className="text-[11px] text-slate-600">
                      Tanggal Penetapan: {selectedCritModal.crit.tanggalPenetapan}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Tautan Berkas Bukti (URL Dokumen):
                </span>
                {selectedCritModal.crit.linkDakung ? (
                  <a
                    href={selectedCritModal.crit.linkDakung}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 hover:bg-sky-100 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <LinkIcon className="w-4 h-4 text-sky-600 shrink-0" />
                      <span className="truncate font-semibold text-xs">
                        {selectedCritModal.crit.linkDakung}
                      </span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-sky-600 shrink-0" />
                  </a>
                ) : (
                  <p className="text-slate-400 italic bg-slate-50 p-3 rounded-xl border border-slate-200">
                    Tidak ada tautan berkas yang disertakan.
                  </p>
                )}
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                  Catatan Asesor Evaluasi:
                </span>
                <p className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-slate-700 italic leading-relaxed">
                  {selectedCritModal.crit.catatanAsesor || 'Tidak ada catatan khusus.'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const targetSub = selectedCritModal.subKode;
                  setSelectedCritModal(null);
                  handleNavigateToSub(targetSub);
                }}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span>Buka Form Input Sub-Komponen {selectedCritModal.subKode}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setSelectedCritModal(null)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
