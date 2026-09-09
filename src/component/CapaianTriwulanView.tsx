import React, { useState } from 'react';
import {
  PieChart,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Printer,
  Edit2,
  X,
  TrendingUp,
  Info,
  ShieldCheck,
  Link2,
  ExternalLink,
  Compass,
  Check,
} from 'lucide-react';
import {
  IndikatorPK,
  CapaianIndikatorTriwulan,
  RealisasiTriwulan,
  OPD,
  User,
  StatusValidasi,
} from '../types';

interface CapaianTriwulanViewProps {
  indikatorList: IndikatorPK[];
  capaianTriwulanList: CapaianIndikatorTriwulan[];
  setCapaianTriwulanList: React.Dispatch<React.SetStateAction<CapaianIndikatorTriwulan[]>>;
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
}

/**
 * Aturan Pewarnaan Capaian:
 * - Lebih dari 100% (> 100%)    : HIJAU
 * - Tepat tercapai 100% (= 100%): BIRU
 * - Antara 50% - < 100%         : KUNING
 * - Kurang dari 50% (< 50%)     : MERAH
 */
const getStatusWarnaInfo = (statusWarna: 'hijau' | 'biru' | 'kuning' | 'merah' | string) => {
  switch (statusWarna) {
    case 'hijau':
      return {
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs',
        dotClass: 'bg-emerald-500 animate-pulse',
        label: '> 100% (Melampaui)',
      };
    case 'biru':
      return {
        badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 shadow-2xs',
        dotClass: 'bg-blue-500',
        label: '100% (Tepat Tercapai)',
      };
    case 'kuning':
      return {
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 shadow-2xs',
        dotClass: 'bg-amber-500',
        label: '50% - <100% (Cukup)',
      };
    case 'merah':
    default:
      return {
        badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 shadow-2xs',
        dotClass: 'bg-rose-600',
        label: '< 50% (Kritis)',
      };
  }
};

const getCapaianColorByPercent = (persen: number) => {
  if (persen > 100) return 'hijau';
  if (Math.abs(persen - 100) < 0.01) return 'biru';
  if (persen >= 50) return 'kuning';
  return 'merah';
};

export const CapaianTriwulanView: React.FC<CapaianTriwulanViewProps> = ({
  indikatorList = [],
  capaianTriwulanList = [],
  setCapaianTriwulanList,
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [selectedTriwulan, setSelectedTriwulan] = useState<number>(0); // 0 = all
  const [colorFilter, setColorFilter] = useState<'all' | 'hijau' | 'biru' | 'kuning' | 'merah'>('all');

  // Modal Input / Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndikator, setEditingIndikator] = useState<IndikatorPK | null>(null);
  const [editingTriwulanNum, setEditingTriwulanNum] = useState<number>(1);
  const [triwulanForm, setTriwulanForm] = useState<{
    target: number;
    realisasi: number;
    faktorPendorong: string;
    faktorPenghambat: string;
    tindakLanjut: string;
    strategi: string;
    linkDakung: string;
    evidensFile: string;
  }>({
    target: 0,
    realisasi: 0,
    faktorPendorong: '',
    faktorPenghambat: '',
    tindakLanjut: '',
    strategi: '',
    linkDakung: '',
    evidensFile: '',
  });

  const getOpdName = (id: string) => opdList.find((o) => o.id === id)?.nama || id;

  // Filtered Indikator
  const filteredIndikator = (indikatorList || []).filter((i) => {
    const matchYear = i.tahun === selectedYear;
    if (currentUser.role === 'operator_unit') {
      if (currentUser.opdId && currentUser.opdId !== 'opd-rsup-m-djamil') {
        return matchYear && i.opdId === currentUser.opdId;
      }
      return matchYear && (filterOpd === 'all' || filterOpd === 'opd-rsup-m-djamil' || i.opdId === filterOpd);
    }
    return matchYear && (filterOpd === 'all' || filterOpd === 'opd-rsup-m-djamil' || i.opdId === filterOpd);
  });

  // Calculate Color stats (Hijau, Biru, Kuning, Merah)
  let totalRows = 0;
  let countHijau = 0;
  let countBiru = 0;
  let countKuning = 0;
  let countMerah = 0;

  filteredIndikator.forEach((ind) => {
    const cap = capaianTriwulanList.find((c) => c.indikatorId === ind.id && c.tahun === selectedYear);
    const triwulans = cap?.realisasiPerTriwulan || [];
    triwulans.forEach((t) => {
      if (selectedTriwulan === 0 || t.triwulan === selectedTriwulan) {
        if (t.triwulan <= 3 || t.realisasi > 0) {
          totalRows++;
          if (t.statusWarna === 'hijau') countHijau++;
          else if (t.statusWarna === 'biru') countBiru++;
          else if (t.statusWarna === 'kuning') countKuning++;
          else if (t.statusWarna === 'merah') countMerah++;
        }
      }
    });
  });

  // Open Edit Modal
  const handleOpenEdit = (ind: IndikatorPK, tNum: number, currentData?: RealisasiTriwulan) => {
    setEditingIndikator(ind);
    setEditingTriwulanNum(tNum);

    const defaultTarget =
      tNum === 1 ? ind.targetT1 : tNum === 2 ? ind.targetT2 : tNum === 3 ? ind.targetT3 : ind.targetT4;

    setTriwulanForm({
      target: currentData?.target || defaultTarget,
      realisasi: currentData?.realisasi || 0,
      faktorPendorong: currentData?.faktorPendorong || '',
      faktorPenghambat: currentData?.faktorPenghambat || ind.permasalahan || '',
      tindakLanjut: currentData?.tindakLanjut || ind.rencanaTindakLanjut || '',
      strategi: currentData?.strategi || ind.strategi || '',
      linkDakung: currentData?.linkDakung || (currentData?.evidensFile?.startsWith('http') ? currentData.evidensFile : ind.linkDakung || ''),
      evidensFile: currentData?.evidensFile || '',
    });
    setIsModalOpen(true);
  };

  // Save Triwulan Data
  const handleSaveTriwulan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndikator) return;

    const targetVal = Number(triwulanForm.target) || 1;
    const realisasiVal = Number(triwulanForm.realisasi) || 0;
    const rawPersen = Math.round((realisasiVal / targetVal) * 10000) / 100;

    // Rule:
    // > 100: hijau
    // = 100: biru
    // 50 - <100: kuning
    // < 50: merah
    let statusWarna: 'hijau' | 'biru' | 'kuning' | 'merah' = 'merah';
    if (rawPersen > 100) {
      statusWarna = 'hijau';
    } else if (Math.abs(rawPersen - 100) < 0.01) {
      statusWarna = 'biru';
    } else if (rawPersen >= 50) {
      statusWarna = 'kuning';
    } else {
      statusWarna = 'merah';
    }

    const tNama = `Triwulan ${['I (Jan - Mar)', 'II (Apr - Jun)', 'III (Jul - Sep)', 'IV (Okt - Des)'][editingTriwulanNum - 1]}`;

    const newTriwulanItem: RealisasiTriwulan = {
      triwulan: editingTriwulanNum,
      namaTriwulan: tNama,
      target: targetVal,
      realisasi: realisasiVal,
      persenCapaian: rawPersen,
      statusWarna,
      faktorPendorong: triwulanForm.faktorPendorong || '-',
      faktorPenghambat: triwulanForm.faktorPenghambat || '-',
      tindakLanjut: triwulanForm.tindakLanjut || '-',
      strategi: triwulanForm.strategi || '',
      linkDakung: triwulanForm.linkDakung || '',
      statusValidasi: 'Menunggu Validasi',
      evidensFile: triwulanForm.linkDakung ? 'Tautan Bukti Dukung Online' : '',
    };

    setCapaianTriwulanList((prev) => {
      const existing = prev.find(
        (c) => c.indikatorId === editingIndikator.id && c.tahun === selectedYear
      );

      if (existing) {
        return prev.map((c) =>
          c.indikatorId === editingIndikator.id && c.tahun === selectedYear
            ? {
                ...c,
                realisasiPerTriwulan: [
                  ...c.realisasiPerTriwulan.filter((t) => t.triwulan !== editingTriwulanNum),
                  newTriwulanItem,
                ].sort((a, b) => a.triwulan - b.triwulan),
              }
            : c
        );
      } else {
        return [
          ...prev,
          {
            indikatorId: editingIndikator.id,
            tahun: selectedYear,
            opdId: editingIndikator.opdId,
            realisasiPerTriwulan: [newTriwulanItem],
          },
        ];
      }
    });

    setIsModalOpen(false);
  };

  const handlePrint = () => {
    window.print();
  };

  const canEdit = currentUser.role === 'operator_unit' || currentUser.role === 'administrator';

  // Calculate Aggregates for the Footer Total Row
  let aggregateTargetSum = 0;
  let aggregateRealisasiSum = 0;
  let aggregatePersenSum = 0;
  let aggregateDisplayedRowCount = 0;
  let aggregateLinkCount = 0;
  let aggregateVerifiedCount = 0;

  filteredIndikator.forEach((ind) => {
    const cap = capaianTriwulanList.find(
      (c) => c.indikatorId === ind.id && c.tahun === selectedYear
    );
    const triwulanRows = cap?.realisasiPerTriwulan || [];

    const triwulanListToCompute = [1, 2, 3, 4]
      .filter((t) => selectedTriwulan === 0 || t === selectedTriwulan)
      .map((tNum) => {
        const row = triwulanRows.find((r) => r.triwulan === tNum);
        return {
          tNum,
          data: row || {
            triwulan: tNum,
            namaTriwulan: `Triwulan ${tNum}`,
            target: tNum === 1 ? ind.targetT1 : tNum === 2 ? ind.targetT2 : tNum === 3 ? ind.targetT3 : ind.targetT4,
            realisasi: 0,
            persenCapaian: 0,
            statusWarna: 'merah' as const,
            faktorPendorong: '-',
            faktorPenghambat: 'Belum diisi.',
            tindakLanjut: '-',
            statusValidasi: 'Draft' as StatusValidasi,
          },
        };
      })
      .filter(({ data }) => {
        if (colorFilter === 'all') return true;
        return data.statusWarna === colorFilter;
      });

    triwulanListToCompute.forEach(({ data }) => {
      aggregateDisplayedRowCount++;
      aggregateTargetSum += Number(data.target) || 0;
      aggregateRealisasiSum += Number(data.realisasi) || 0;
      aggregatePersenSum += Number(data.persenCapaian) || 0;
      if (data.linkDakung || (data.evidensFile && data.evidensFile.startsWith('http'))) {
        aggregateLinkCount++;
      }
      if (data.statusValidasi === 'Terverifikasi') {
        aggregateVerifiedCount++;
      }
    });
  });

  const averageCapaian = aggregateDisplayedRowCount > 0 ? Math.round((aggregatePersenSum / aggregateDisplayedRowCount) * 100) / 100 : 0;
  const averageNormalisasi = Math.min(averageCapaian, 120);

  const averageColorKey = getCapaianColorByPercent(averageCapaian);
  const averageColorInfo = getStatusWarnaInfo(averageColorKey);

  const averageNormColorKey = getCapaianColorByPercent(averageNormalisasi);
  const averageNormColorInfo = getStatusWarnaInfo(averageNormColorKey);

  return (
    <div className="space-y-6">
      {/* Top Filter and Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* OPD Filter */}
          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">Semua Unit Kerja (RSUP)</option>
                {opdList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Triwulan Filter */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <select
              value={selectedTriwulan}
              onChange={(e) => setSelectedTriwulan(Number(e.target.value))}
              className="bg-transparent font-semibold text-slate-800 focus:outline-hidden text-xs cursor-pointer pr-2"
            >
              <option value={0}>Semua Triwulan (T1 - T4)</option>
              <option value={1}>Triwulan I (Jan - Mar)</option>
              <option value={2}>Triwulan II (Apr - Jun)</option>
              <option value={3}>Triwulan III (Jul - Sep)</option>
              <option value={4}>Triwulan IV (Okt - Des)</option>
            </select>
          </div>

          {/* Color Filter: 4 Kategori (Hijau, Biru, Kuning, Merah) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setColorFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                colorFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setColorFilter('hijau')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                colorFilter === 'hijau' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Hijau (&gt;100%)</span>
            </button>
            <button
              type="button"
              onClick={() => setColorFilter('biru')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                colorFilter === 'biru' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              <span>Biru (=100%)</span>
            </button>
            <button
              type="button"
              onClick={() => setColorFilter('kuning')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                colorFilter === 'kuning' ? 'bg-amber-500 text-white shadow-xs' : 'text-amber-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-amber-300" />
              <span>Kuning (50-99%)</span>
            </button>
            <button
              type="button"
              onClick={() => setColorFilter('merah')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                colorFilter === 'merah' ? 'bg-rose-600 text-white shadow-xs' : 'text-rose-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-rose-300" />
              <span>Merah (&lt;50%)</span>
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Cetak Rekap Kinerja</span>
        </button>
      </div>

      {/* 4 Summary Stat Cards (Hijau, Biru, Kuning, Merah) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Hijau Card (>100%) */}
        <div className="bg-emerald-50/90 border border-emerald-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                Kategori HIJAU (&gt;100%)
              </span>
              <p className="text-xl font-black text-emerald-950">
                {countHijau} <span className="text-xs font-semibold text-emerald-700">Melampaui Target</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countHijau / totalRows) * 100) : 0}%
          </span>
        </div>

        {/* Biru Card (=100%) */}
        <div className="bg-blue-50/90 border border-blue-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-900">
                Kategori BIRU (=100%)
              </span>
              <p className="text-xl font-black text-blue-950">
                {countBiru} <span className="text-xs font-semibold text-blue-700">Tepat Tercapai</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-blue-800 bg-blue-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countBiru / totalRows) * 100) : 0}%
          </span>
        </div>

        {/* Kuning Card (50-99%) */}
        <div className="bg-amber-50/90 border border-amber-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Kategori KUNING (50-99%)
              </span>
              <p className="text-xl font-black text-amber-950">
                {countKuning} <span className="text-xs font-semibold text-amber-700">Cukup Tercapai</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countKuning / totalRows) * 100) : 0}%
          </span>
        </div>

        {/* Merah Card (<50%) */}
        <div className="bg-rose-50/90 border border-rose-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
                Kategori MERAH (&lt;50%)
              </span>
              <p className="text-xl font-black text-rose-950">
                {countMerah} <span className="text-xs font-semibold text-rose-700">Kritis / Kurang</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countMerah / totalRows) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Main Table: Capaian Kinerja Triwulan */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Kinerja Triwulanan Tahun Anggaran {selectedYear}
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi ketercapaian target triwulanan dengan indikator visual otomatis sesuai regulasi SAKIP
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
              Tersinkronisasi Otomatis dari Input Bulanan
            </span>
            <span className="text-xs font-bold text-slate-700 font-mono">
              {filteredIndikator.length} Indikator Kinerja
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[1020px]">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-3">Indikator & Unit Kerja</th>
                <th className="px-2 py-3 text-center">Triwulan</th>
                <th className="px-2 py-3 text-right">Target</th>
                <th className="px-2 py-3 text-right">Realisasi</th>
                <th className="px-3 py-3 text-center font-extrabold">% Capaian & Status</th>
                <th className="px-3 py-3 text-center font-extrabold bg-emerald-50/40 border-x border-emerald-100">
                  Normalisasi 120%
                </th>
                <th className="px-3 py-3">Analisis Faktor & Tindak Lanjut</th>
                <th className="px-3 py-3">Bukti Dukung (Link)</th>
                <th className="px-3 py-3">Status Validasi</th>
                {canEdit && <th className="px-2 py-3 text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredIndikator.map((ind) => {
                const cap = capaianTriwulanList.find(
                  (c) => c.indikatorId === ind.id && c.tahun === selectedYear
                );
                const triwulanRows = cap?.realisasiPerTriwulan || [];

                // Filter by selected Triwulan & Color
                const displayedTriwulan = [1, 2, 3, 4]
                  .filter((t) => selectedTriwulan === 0 || t === selectedTriwulan)
                  .map((tNum) => {
                    const row = triwulanRows.find((r) => r.triwulan === tNum);
                    return {
                      tNum,
                      data: row || {
                        triwulan: tNum,
                        namaTriwulan: `Triwulan ${tNum}`,
                        target: tNum === 1 ? ind.targetT1 : tNum === 2 ? ind.targetT2 : tNum === 3 ? ind.targetT3 : ind.targetT4,
                        realisasi: 0,
                        persenCapaian: 0,
                        statusWarna: 'merah' as const,
                        faktorPendorong: '-',
                        faktorPenghambat: 'Belum diisi.',
                        tindakLanjut: '-',
                        statusValidasi: 'Draft' as StatusValidasi,
                      },
                    };
                  })
                  .filter(({ data }) => {
                    if (colorFilter === 'all') return true;
                    return data.statusWarna === colorFilter;
                  });

                if (displayedTriwulan.length === 0) return null;

                return displayedTriwulan.map(({ tNum, data }, idx) => {
                  const isFirstRowForIndikator = idx === 0;
                  const warnaInfo = getStatusWarnaInfo(data.statusWarna);
                  const normalizedPersen = Math.min(data.persenCapaian, 120);
                  const normColorKey = getCapaianColorByPercent(normalizedPersen);
                  const normWarnaInfo = getStatusWarnaInfo(normColorKey);

                  const linkUrl = data.linkDakung || (data.evidensFile && data.evidensFile.startsWith('http') ? data.evidensFile : '');

                  return (
                    <tr key={`${ind.id}-T${tNum}`} className="hover:bg-slate-50/80 transition-colors">
                      {isFirstRowForIndikator ? (
                        <td
                          rowSpan={displayedTriwulan.length}
                          className="px-3 py-3.5 align-top border-r border-slate-100 max-w-xs bg-slate-50/30"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 text-[10px] font-bold">
                              {ind.tipeIndikator}
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 truncate">
                              {getOpdName(ind.opdId)}
                            </span>
                          </div>
                          <p className="font-bold text-slate-900 text-xs leading-snug">
                            {ind.namaIndikator}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-1 font-mono">
                            Target Tahunan: <strong>{ind.targetTahunan} {ind.satuan}</strong>
                          </p>
                        </td>
                      ) : null}

                      <td className="px-2 py-3.5 text-center font-bold text-slate-800 font-mono">
                        T{tNum}
                      </td>

                      <td className="px-2 py-3.5 text-right font-mono text-slate-700">
                        {data.target} {ind.satuan}
                      </td>

                      <td className="px-2 py-3.5 text-right font-mono font-bold text-slate-900">
                        {data.realisasi} {ind.satuan}
                      </td>

                      {/* Capaian & Status Warna */}
                      <td className="px-3 py-3.5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs border ${warnaInfo.badgeClass}`}
                        >
                          <div className={`w-2.5 h-2.5 rounded-full ${warnaInfo.dotClass}`} />
                          <span className="font-mono">{data.persenCapaian.toFixed(2).replace('.', ',')}%</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            ({data.statusWarna})
                          </span>
                        </div>
                      </td>

                      {/* Normalisasi 120% */}
                      <td className="px-3 py-3.5 text-center bg-emerald-50/20 border-x border-emerald-100">
                        <div className="flex flex-col items-center justify-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full font-black text-xs font-mono border ${normWarnaInfo.badgeClass}`}
                          >
                            {normalizedPersen.toFixed(2).replace('.', ',')}%
                          </span>
                          {data.persenCapaian > 120 && (
                            <span className="text-[9px] text-emerald-800 font-bold mt-0.5">
                              (Maks. 120%)
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Analisis Faktor */}
                      <td className="px-3 py-3.5 text-slate-700 max-w-sm">
                        <div className="space-y-1 text-[11px]">
                          {data.faktorPendorong && data.faktorPendorong !== '-' && (
                            <p>
                              <strong className="text-emerald-700">Pendorong:</strong>{' '}
                              {data.faktorPendorong}
                            </p>
                          )}
                          {data.faktorPenghambat && data.faktorPenghambat !== '-' && (
                            <p>
                              <strong className="text-rose-700">Penghambat:</strong>{' '}
                              {data.faktorPenghambat}
                            </p>
                          )}
                          {data.tindakLanjut && data.tindakLanjut !== '-' && (
                            <p>
                              <strong className="text-sky-700">Tindak Lanjut:</strong>{' '}
                              {data.tindakLanjut}
                            </p>
                          )}
                          {data.strategi && (
                            <p>
                              <strong className="text-amber-700">Strategi:</strong>{' '}
                              {data.strategi}
                            </p>
                          )}
                        </div>
                      </td>

                      {/* Bukti Dukung (Link Saja) */}
                      <td className="px-3 py-3.5">
                        {linkUrl ? (
                          <a
                            href={linkUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-[11px] transition-colors group"
                            title={linkUrl}
                          >
                            <Link2 className="w-3 h-3 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span>Buka Tautan</span>
                            <ExternalLink className="w-2.5 h-2.5 text-blue-400" />
                          </a>
                        ) : (
                          <span className="text-slate-400 italic text-[11px] flex items-center gap-1">
                            <Link2 className="w-3 h-3 text-slate-300" />
                            <span>Belum ada link</span>
                          </span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          {data.statusValidasi}
                        </span>
                      </td>

                      {canEdit && (
                        <td className="px-2 py-3.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(ind, tNum, data)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-md transition-colors"
                            title={`Edit Data Capaian T${tNum}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                });
              })}
            </tbody>

            {/* Baris Total di Bawah (Total / Rata-rata Triwulan) */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-700">
              <tr>
                <td colSpan={2} className="px-3 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="uppercase tracking-wider text-xs font-black text-emerald-400">
                      TOTAL / RATA-RATA TRIWULAN
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                      {aggregateDisplayedRowCount} Baris Triwulan Ditampilkan
                    </span>
                  </div>
                </td>

                <td className="px-2 py-4 text-right font-mono text-xs text-slate-200">
                  <div className="text-[10px] text-slate-400 font-normal">Total Target:</div>
                  <div className="font-extrabold text-white text-sm">
                    {aggregateTargetSum.toLocaleString('id-ID')}
                  </div>
                </td>

                <td className="px-2 py-4 text-right font-mono text-xs">
                  <div className="text-[10px] text-slate-400 font-normal">Total Realisasi:</div>
                  <div className="font-extrabold text-blue-400 text-sm">
                    {aggregateRealisasiSum.toLocaleString('id-ID')}
                  </div>
                </td>

                {/* Rata-rata Capaian (%) */}
                <td className="px-3 py-4 text-center">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black font-mono border ${averageColorInfo.badgeClass}`}
                    >
                      {averageCapaian.toFixed(2).replace('.', ',')} %
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      Rata-rata Capaian
                    </span>
                  </div>
                </td>

                {/* Rata-rata Normalisasi (Maks. 120%) */}
                <td className="px-3 py-4 text-center bg-slate-800 border-x border-slate-700">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black font-mono border ${averageNormColorInfo.badgeClass}`}
                    >
                      {averageNormalisasi.toFixed(2).replace('.', ',')} %
                    </span>
                    <span className="text-[9px] text-emerald-400 font-normal">
                      Normalisasi (Maks. 120%)
                    </span>
                  </div>
                </td>

                <td className="px-3 py-4 text-xs font-normal text-slate-400">
                  Analisis Kinerja Triwulan Berjalan
                </td>

                {/* Bukti Dukung Link Summary */}
                <td className="px-3 py-4 text-xs font-normal text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      <strong className="text-white font-mono">{aggregateLinkCount}</strong> Link Terisi
                    </span>
                  </div>
                </td>

                {/* Validasi Summary */}
                <td className="px-3 py-4 text-xs font-normal text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <strong className="text-emerald-400 font-mono">{aggregateVerifiedCount}</strong> Terverifikasi
                    </span>
                  </div>
                </td>

                {canEdit && <td className="px-2 py-4" />}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal: Input / Edit Capaian Triwulan */}
      {isModalOpen && editingIndikator && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Input Capaian Triwulan {editingTriwulanNum} (TA {selectedYear})
                </h3>
                <p className="text-xs text-slate-500 truncate max-w-md">
                  {editingIndikator.namaIndikator}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTriwulan} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Target Triwulan {editingTriwulanNum} ({editingIndikator.satuan}) - <span className="text-emerald-700 font-normal">Dapat Diubah</span>:
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={triwulanForm.target}
                    onChange={(e) => setTriwulanForm({ ...triwulanForm, target: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono font-bold text-sm focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Realisasi Capaian ({editingIndikator.satuan}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={triwulanForm.realisasi}
                    onChange={(e) => setTriwulanForm({ ...triwulanForm, realisasi: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono font-bold text-sm text-blue-700 focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Preview Status Warna & Normalisasi Sesuai Permintaan */}
              {(() => {
                const targetV = Number(triwulanForm.target) || 1;
                const realisasiV = Number(triwulanForm.realisasi) || 0;
                const rawP = Math.round((realisasiV / targetV) * 10000) / 100;
                const normP = Math.min(rawP, 120);

                let colorKey = getCapaianColorByPercent(rawP);
                let warnaInfo = getStatusWarnaInfo(colorKey);

                let normColorKey = getCapaianColorByPercent(normP);
                let normWarnaInfo = getStatusWarnaInfo(normColorKey);

                return (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        Estimasi Capaian Asli: <strong className="font-mono">{rawP.toFixed(2)}%</strong>
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${warnaInfo.badgeClass}`}>
                        {warnaInfo.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-between border-t border-slate-200/80 pt-2">
                      <div>
                        <span className="font-bold text-slate-800 block">Normalisasi (Maks. 120%):</span>
                        <span className="text-[10px] text-slate-500">
                          {rawP > 120 ? `Nilai dibatasi 120% (asli: ${rawP.toFixed(2)}%)` : 'Di bawah 120%'}
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black border ${normWarnaInfo.badgeClass}`}>
                        {normP.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="font-bold text-slate-800 block mb-1">Faktor Pendorong Keberhasilan:</label>
                <textarea
                  rows={2}
                  placeholder="Faktor pendukung / akselerasi capaian target..."
                  value={triwulanForm.faktorPendorong}
                  onChange={(e) => setTriwulanForm({ ...triwulanForm, faktorPendorong: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Faktor Penghambat / Kendala Lapangan:</label>
                <textarea
                  rows={2}
                  placeholder="Kendala teknis atau regulasi yang dihadapi..."
                  value={triwulanForm.faktorPenghambat}
                  onChange={(e) => setTriwulanForm({ ...triwulanForm, faktorPenghambat: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">Rencana Tindak Lanjut (Action Plan):</label>
                <textarea
                  rows={2}
                  placeholder="Langkah antisipatif dan mitigasi untuk triwulan selanjutnya..."
                  value={triwulanForm.tindakLanjut}
                  onChange={(e) => setTriwulanForm({ ...triwulanForm, tindakLanjut: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Compass className="w-4 h-4 text-amber-600" />
                  <span>Strategi Pencapaian Kinerja:</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Strategi khusus atau breakthrough capaian pada triwulan ini..."
                  value={triwulanForm.strategi || ''}
                  onChange={(e) => setTriwulanForm({ ...triwulanForm, strategi: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 text-xs"
                />
              </div>

              {/* Bukti Dukung: Link Saja (URL) */}
              <div>
                <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Link2 className="w-4 h-4 text-emerald-600" />
                  <span>Tautan / Link Evidens Bukti Dukung (Google Drive / Cloud URL):</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Masukkan tautan berkas data dukung online (Google Drive, Cloud Storage, atau portal SAKIP).
                </p>
                <div className="space-y-1.5">
                  <input
                    type="url"
                    placeholder="https://drive.google.com/... atau link berkas evidens"
                    value={triwulanForm.linkDakung || ''}
                    onChange={(e) => setTriwulanForm({ ...triwulanForm, linkDakung: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                  {triwulanForm.linkDakung && (
                    <div className="flex items-center justify-between bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 text-xs">
                      <span className="text-emerald-800 truncate font-mono max-w-[280px]">
                        {triwulanForm.linkDakung}
                      </span>
                      <a
                        href={triwulanForm.linkDakung}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-emerald-700 font-bold hover:underline shrink-0"
                      >
                        <span>Tes Buka Tautan</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan Capaian Triwulan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
