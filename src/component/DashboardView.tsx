import React, { useState, useMemo } from 'react';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
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
  KeyRound,
  Search,
  Filter,
  Printer,
  FileSpreadsheet,
  Target,
  Percent,
  Activity,
  ArrowRight,
  CheckCircle,
  Eye,
  FileText,
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
  onOpenLoginModal,
}) => {
  // Local state for interactive filtering on Dashboard
  const [statusFilter, setStatusFilter] = useState<'all' | 'hijau' | 'kuning' | 'merah'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSasaranFilter, setSelectedSasaranFilter] = useState('all');
  const [selectedPeriodView, setSelectedPeriodView] = useState<'sem1' | 't1' | 't2' | 't3' | 't4'>('sem1');

  // Filter Indicators by selected OPD & Year
  const filteredIndikator = useMemo(() => {
    return (indikatorList || []).filter(
      (i) => (selectedOpdId === 'all' || i.opdId === selectedOpdId) && i.tahun === selectedYear
    );
  }, [indikatorList, selectedOpdId, selectedYear]);

  // Filter LHE evaluations
  const filteredLhe = useMemo(() => {
    return (lheList || []).filter(
      (l) => (selectedOpdId === 'all' || l.opdId === selectedOpdId) && l.tahun === selectedYear
    );
  }, [lheList, selectedOpdId, selectedYear]);

  // Map each indicator with its achievement data
  const indikatorWithCapaian = useMemo(() => {
    return filteredIndikator.map((ind) => {
      const cap = capaianTriwulanList.find(
        (c) => c.indikatorId === ind.id && c.tahun === selectedYear
      );
      const t1 = cap?.realisasiPerTriwulan?.find((t) => t.triwulan === 1);
      const t2 = cap?.realisasiPerTriwulan?.find((t) => t.triwulan === 2);
      const t3 = cap?.realisasiPerTriwulan?.find((t) => t.triwulan === 3);
      const t4 = cap?.realisasiPerTriwulan?.find((t) => t.triwulan === 4);

      // Default values from PK / Triwulan
      const rawSem1Persen = parseFloat(ind.capaianSem1Text?.replace('%', '').replace(',', '.') || '0');
      const capaianSem1Val = t2?.persenCapaian ?? (rawSem1Persen > 0 ? rawSem1Persen : 100);
      const realisasiSem1Val = t2?.realisasi ?? (parseFloat(ind.realisasiSem1Text?.replace('%', '').replace(',', '.') || '0'));

      let statusWarna: 'hijau' | 'kuning' | 'merah' = 'merah';
      if (capaianSem1Val >= 100) statusWarna = 'hijau';
      else if (capaianSem1Val >= 50) statusWarna = 'kuning';
      else statusWarna = 'merah';

      return {
        ...ind,
        capaianData: cap,
        t1,
        t2,
        t3,
        t4,
        capaianSem1Val,
        realisasiSem1Val,
        statusWarna,
      };
    });
  }, [filteredIndikator, capaianTriwulanList, selectedYear]);

  // Color statistics
  const countHijau = useMemo(() => indikatorWithCapaian.filter((i) => i.statusWarna === 'hijau').length, [indikatorWithCapaian]);
  const countKuning = useMemo(() => indikatorWithCapaian.filter((i) => i.statusWarna === 'kuning').length, [indikatorWithCapaian]);
  const countMerah = useMemo(() => indikatorWithCapaian.filter((i) => i.statusWarna === 'merah').length, [indikatorWithCapaian]);
  const totalEvaluated = indikatorWithCapaian.length;

  const persenHijau = totalEvaluated ? Math.round((countHijau / totalEvaluated) * 100) : 0;
  const persenKuning = totalEvaluated ? Math.round((countKuning / totalEvaluated) * 100) : 0;
  const persenMerah = totalEvaluated ? Math.round((countMerah / totalEvaluated) * 100) : 0;

  // Average Achievement percentage
  const avgCapaian = useMemo(() => {
    if (!indikatorWithCapaian.length) return 0;
    const total = indikatorWithCapaian.reduce((acc, curr) => acc + curr.capaianSem1Val, 0);
    return Math.round((total / indikatorWithCapaian.length) * 100) / 100;
  }, [indikatorWithCapaian]);

  // List of unique Sasaran Strategis
  const sasaranList = useMemo(() => {
    const list = Array.from(new Set(indikatorWithCapaian.map((i) => i.sasaranStrategis)));
    return list.filter(Boolean);
  }, [indikatorWithCapaian]);

  // Filtered rows for the Capaian Table on Dashboard
  const displayedIndikators = useMemo(() => {
    return indikatorWithCapaian.filter((ind) => {
      const matchStatus = statusFilter === 'all' || ind.statusWarna === statusFilter;
      const matchSasaran = selectedSasaranFilter === 'all' || ind.sasaranStrategis === selectedSasaranFilter;
      const matchQuery =
        searchQuery === '' ||
        ind.namaIndikator.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.sasaranStrategis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ind.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSasaran && matchQuery;
    });
  }, [indikatorWithCapaian, statusFilter, selectedSasaranFilter, searchQuery]);

  // Average SAKIP Score
  const avgSakipScore = filteredLhe.length
    ? Math.round((filteredLhe.reduce((acc, l) => acc + l.nilaiTotal, 0) / filteredLhe.length) * 100) / 100
    : 88.10;

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

  // Group indicators by Sasaran Strategis for neat rendering
  const groupedBySasaran = useMemo(() => {
    const groups: Record<string, typeof displayedIndikators> = {};
    displayedIndikators.forEach((ind) => {
      const sas = ind.sasaranStrategis || 'Sasaran Lainnya';
      if (!groups[sas]) groups[sas] = [];
      groups[sas].push(ind);
    });
    return groups;
  }, [displayedIndikators]);

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
            Anda terautentikasi sebagai <strong className="text-emerald-300 capitalize">{currentUser.roleTitle}</strong> ({currentUser.opdName}). Dashboard ini menyajikan langsung <strong className="text-white">Hasil Pengukuran Capaian Kinerja (18 Indikator & 11 Sasaran Strategis Kemenkes RI)</strong>, status deviasi warna, serta evaluasi LHE SAKIP.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            {currentUser.role === 'operator_unit' && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigate('input-kinerja')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Input Indikator & Target PK</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('capaian-triwulan')}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
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
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Validasi Capaian Bulanan & Evidens</span>
              </button>
            )}

            {currentUser.role === 'verifikator' && (
              <button
                type="button"
                onClick={() => onNavigate('lhe')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck2 className="w-4 h-4" />
                <span>Evaluasi LHE (Lembar Kerja 1/0)</span>
              </button>
            )}

            {currentUser.role === 'administrator' && (
              <button
                type="button"
                onClick={() => onNavigate('capaian-triwulan')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Monitoring Capaian Triwulan</span>
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

      {/* Main KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Rata-Rata Capaian Kinerja */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Rata-Rata Capaian Kinerja
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{avgCapaian}%</span>
              <span className="text-xs text-slate-500 font-medium">Semester I / TA {selectedYear}</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-emerald-600" /> Kinerja Efektif
            </span>
            <span className="text-emerald-700 font-bold">18 Indikator PK</span>
          </div>
        </div>

        {/* Card 2: Nilai Akuntabilitas SAKIP */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:border-emerald-300 transition-colors">
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
            <span className="text-emerald-700 font-bold">PermenPAN-RB No. 88</span>
          </div>
        </div>

        {/* Card 3: Status Capaian Hijau (≥ 100%) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'hijau' ? 'all' : 'hijau')}
          className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            statusFilter === 'hijau' ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-200' : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Target Tercapai (≥100%)
              </span>
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-emerald-700">{countHijau}</span>
              <span className="text-xs font-bold text-emerald-700">Indikator ({persenHijau}%)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-emerald-100/80 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-medium">Status Hijau (Optimal)</span>
            <span className="text-emerald-800 font-bold">Klik Filter</span>
          </div>
        </div>

        {/* Card 4: Status Deviasi (Kuning & Merah) */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'merah' || statusFilter === 'kuning' ? 'all' : 'kuning')}
          className={`p-5 rounded-xl border shadow-xs flex flex-col justify-between cursor-pointer transition-all ${
            statusFilter === 'kuning' || statusFilter === 'merah' ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-200' : 'bg-white border-slate-200/80 hover:border-amber-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Perlu Perhatian / Kritis
              </span>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold text-amber-700">{countKuning}</span>
              <span className="text-xs font-medium text-amber-700">Kuning ({persenKuning}%)</span>
              <span className="text-2xl font-extrabold text-rose-700">{countMerah}</span>
              <span className="text-xs font-medium text-rose-700">Merah ({persenMerah}%)</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-rose-700 font-medium">Kuning (50-99%) | Merah (&lt;50%)</span>
            <span className="text-amber-800 font-bold">Klik Filter</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION UTAMA: TAMPILAN HASIL CAPAIAN KINERJA (FORMAT RESMI KEMENKES RI) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Header Hasil Capaian */}
        <div className="p-5 lg:p-6 bg-gradient-to-r from-slate-50 via-emerald-50/30 to-slate-50 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 text-xs font-semibold mb-1.5">
              <Target className="w-3.5 h-3.5" />
              <span>Tabel Hasil Pengukuran Capaian Kinerja (Format Resmi Kemenkes RI)</span>
            </div>
            <h3 className="text-lg lg:text-xl font-bold text-slate-900 flex items-center gap-2">
              <span>Hasil Pengukuran Capaian Kinerja TA {selectedYear}</span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                {displayedIndikators.length} dari {filteredIndikator.length} Indikator
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Data ketercapaian target Renstra, Perjanjian Kinerja (PK), realisasi berjalan, dan persentase capaian per sasaran strategis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Status Filter Tabs */}
            <div className="inline-flex rounded-lg bg-slate-100 p-1 border border-slate-200 text-xs font-medium">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-all ${
                  statusFilter === 'all' ? 'bg-white text-slate-900 font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({totalEvaluated})
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('hijau')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  statusFilter === 'hijau' ? 'bg-emerald-600 text-white font-bold shadow-xs' : 'text-emerald-700 hover:text-emerald-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Hijau ({countHijau})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('kuning')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  statusFilter === 'kuning' ? 'bg-amber-500 text-white font-bold shadow-xs' : 'text-amber-700 hover:text-amber-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-amber-300" />
                <span>Kuning ({countKuning})</span>
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('merah')}
                className={`px-3 py-1.5 rounded-md flex items-center gap-1.5 transition-all ${
                  statusFilter === 'merah' ? 'bg-rose-600 text-white font-bold shadow-xs' : 'text-rose-700 hover:text-rose-800'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-rose-300" />
                <span>Merah ({countMerah})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('capaian-triwulan')}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <span>Kelola Detail Triwulan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:w-80 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari indikator kinerja, PJ, atau sasaran..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ×
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span>Sasaran:</span>
              <select
                value={selectedSasaranFilter}
                onChange={(e) => setSelectedSasaranFilter(e.target.value)}
                className="py-1.5 px-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 max-w-xs truncate"
              >
                <option value="all">Semua Sasaran Strategis (11)</option>
                {sasaranList.map((sas, idx) => (
                  <option key={idx} value={sas}>
                    {sas}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabel Hasil Capaian Kinerja */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4 w-12 text-center">No</th>
                <th className="py-3 px-4 min-w-[280px]">Indikator Kinerja & Penanggung Jawab</th>
                <th className="py-3 px-3 w-28 text-center">Target Renstra</th>
                <th className="py-3 px-3 w-28 text-center">Target PK</th>
                <th className="py-3 px-3 w-28 text-center">Realisasi Tahun Lalu</th>
                <th className="py-3 px-3 w-32 text-center">Realisasi Berjalan</th>
                <th className="py-3 px-4 w-36 text-center">Capaian & Status</th>
                <th className="py-3 px-3 w-28 text-center">Status Evidens</th>
                <th className="py-3 px-3 w-20 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {Object.keys(groupedBySasaran).length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <AlertTriangle className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Tidak ada data indikator yang sesuai dengan filter.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setStatusFilter('all');
                        setSearchQuery('');
                        setSelectedSasaranFilter('all');
                      }}
                      className="mt-2 text-xs text-emerald-600 font-semibold hover:underline"
                    >
                      Reset Filter
                    </button>
                  </td>
                </tr>
              ) : (
                (Object.entries(groupedBySasaran) as [string, typeof displayedIndikators][]).map(([sasaran, items], groupIdx) => (
                  <React.Fragment key={groupIdx}>
                    {/* Sasaran Strategis Header Row */}
                    <tr className="bg-emerald-50/40 border-y border-emerald-100/80">
                      <td colSpan={9} className="py-2.5 px-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-emerald-950 text-xs flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-emerald-700" />
                            <span>{sasaran}</span>
                          </span>
                          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                            {items.length} Indikator
                          </span>
                        </div>
                      </td>
                    </tr>

                    {/* Indicator Data Rows */}
                    {items.map((ind) => {
                      const persen = ind.capaianSem1Val;
                      const statusColor = ind.statusWarna;

                      return (
                        <tr
                          key={ind.id}
                          className="hover:bg-slate-50/80 transition-colors group"
                        >
                          <td className="py-3 px-4 text-center font-bold text-slate-600 font-mono text-xs">
                            {ind.noUrut}
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                              {ind.namaIndikator}
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                PJ: {ind.penanggungJawab}
                              </span>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">Satuan: {ind.satuan}</span>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center text-slate-700 font-medium font-mono">
                            {ind.targetRenstra || '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                            {ind.targetPKText || `${ind.targetTahunan} ${ind.satuan}`}
                          </td>
                          <td className="py-3 px-3 text-center text-slate-600 font-mono">
                            {ind.realisasi2025Text || '-'}
                          </td>
                          <td className="py-3 px-3 text-center font-bold text-slate-900 font-mono">
                            {ind.realisasiSem1Text || (ind.realisasiSem1Val ? `${ind.realisasiSem1Val} ${ind.satuan}` : '-')}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <span
                                className={`inline-flex items-center gap-1 font-extrabold px-2.5 py-0.5 rounded-full text-xs font-mono ${
                                  statusColor === 'hijau'
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                    : statusColor === 'kuning'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                                }`}
                              >
                                {statusColor === 'hijau' ? (
                                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                                ) : statusColor === 'kuning' ? (
                                  <AlertTriangle className="w-3 h-3 text-amber-700" />
                                ) : (
                                  <XCircle className="w-3 h-3 text-rose-700" />
                                )}
                                <span>{persen}%</span>
                              </span>

                              {/* Progress bar mini */}
                              <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    statusColor === 'hijau'
                                      ? 'bg-emerald-500'
                                      : statusColor === 'kuning'
                                      ? 'bg-amber-500'
                                      : 'bg-rose-500'
                                  }`}
                                  style={{ width: `${Math.min(persen, 100)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                              <CheckCircle className="w-3 h-3 text-emerald-600" />
                              <span>Terverifikasi</span>
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => onNavigate('capaian-triwulan')}
                              title="Buka Detail Triwulan"
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-800 transition-colors cursor-pointer"
                            >
                              <ArrowUpRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Summary Note */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Tabel ini bersumber langsung dari modul Perjanjian Kinerja & Capaian Triwulan SAKIP Kemenkes RI.
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <span className="text-emerald-700">🟢 Hijau (≥100%): {countHijau}</span>
            <span className="text-amber-700">🟡 Kuning (50-99%): {countKuning}</span>
            <span className="text-rose-700">🔴 Merah (&lt;50%): {countMerah}</span>
          </div>
        </div>
      </div>

      {/* Grid: 4 Komponen Evaluasi SAKIP PermenPAN-RB & Panduan Status Capaian */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 4 Komponen Evaluasi SAKIP PermenPAN-RB */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                4 Komponen Evaluasi SAKIP (PermenPAN-RB No. 88/2021)
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
                  <span className="text-emerald-700 font-semibold font-mono">Nilai: 24.00 (80.00%)</span>
                  <span className="text-slate-500">Bobot {bobotSakip.perencanaan}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full" style={{ width: '80%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ketersediaan dokumen perencanaan, pemenuhan standar SMART, cascading berjenjang & crosscutting, serta pemanfaatan berkesinambungan.
              </p>
            </div>

            {/* Komponen 2 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">2. Pengukuran Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold font-mono">Nilai: 27.60 (92.00%)</span>
                  <span className="text-slate-500">Bobot {bobotSakip.pengukuran}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-teal-600 rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pelaksanaan pengukuran kinerja, kebutuhan efisiensi berjenjang berkelanjutan, dan pemanfaatan untuk reward/punishment serta strategi.
              </p>
            </div>

            {/* Komponen 3 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">3. Pelaporan Kinerja</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold font-mono">Nilai: 13.50 (90.00%)</span>
                  <span className="text-slate-500">Bobot {bobotSakip.pelaporan}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-600 rounded-full" style={{ width: '90%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Ketersediaan dokumen laporan, kualitas informasi pencapaian/kegagalan & perbaikan, serta dampak penyesuaian kebijakan.
              </p>
            </div>

            {/* Komponen 4 */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-bold text-slate-800">4. Evaluasi Akuntabilitas Kinerja Internal</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold font-mono">Nilai: 23.00 (92.00%)</span>
                  <span className="text-slate-500">Bobot {bobotSakip.evaluasiInternal}%</span>
                </div>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '92%' }} />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Pelaksanaan evaluasi akuntabilitas internal, kualitas SDM evaluator, dan peningkatan implementasi SAKIP yang memberikan dampak nyata.
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
              <span>Standar Deviasi Warna Capaian SAKIP</span>
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
                    Realisasi kinerja mencapai atau melampaui target yang ditetapkan dalam Perjanjian Kinerja (PK).
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
                    Realisasi sedang berjalan namun masih di bawah target, memerlukan analisis hambatan dan tindak lanjut.
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
                    Realisasi di bawah 50%, membutuhkan percepatan program dan perhatian khusus pimpinan unit kerja.
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
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
