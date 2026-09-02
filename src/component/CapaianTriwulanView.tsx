import React, { useState } from 'react';
import {
  PieChart,
  Filter,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileSpreadsheet,
  Printer,
  Edit2,
  Plus,
  X,
  TrendingUp,
  FileText,
  Info,
  ShieldCheck,
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

  React.useEffect(() => {
    if (currentUser.role !== 'operator_unit') {
      setFilterOpd(selectedOpdId);
    }
  }, [selectedOpdId, currentUser.role]);
  const [selectedTriwulan, setSelectedTriwulan] = useState<number>(0); // 0 = Semua Triwulan, 1, 2, 3, 4
  const [colorFilter, setColorFilter] = useState<'all' | 'hijau' | 'kuning' | 'merah'>('all');

  // Edit Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndikator, setEditingIndikator] = useState<IndikatorPK | null>(null);
  const [editingTriwulanNum, setEditingTriwulanNum] = useState<number>(1);
  const [triwulanForm, setTriwulanForm] = useState<Partial<RealisasiTriwulan>>({
    target: 0,
    realisasi: 0,
    faktorPendorong: '',
    faktorPenghambat: '',
    tindakLanjut: '',
    evidensFile: '',
  });

  const getOpdName = (id: string) => opdList?.find((o) => o.id === id)?.nama || id;

  const canEdit = currentUser.role === 'operator_unit' || currentUser.role === 'administrator';

  // Filtered Indikator
  const filteredIndikator = (indikatorList || []).filter((i) => {
    const matchYear = i.tahun === selectedYear;
    if (currentUser.role === 'operator_unit') {
      return matchYear && i.opdId === currentUser.opdId;
    }
    return matchYear && (filterOpd === 'all' || i.opdId === filterOpd);
  });

  // Calculate Color stats
  let totalRows = 0;
  let countHijau = 0;
  let countKuning = 0;
  let countMerah = 0;

  filteredIndikator.forEach((ind) => {
    const cap = capaianTriwulanList.find((c) => c.indikatorId === ind.id && c.tahun === selectedYear);
    const triwulans = cap?.realisasiPerTriwulan || [];
    triwulans.forEach((t) => {
      if (selectedTriwulan === 0 || t.triwulan === selectedTriwulan) {
        if (t.triwulan <= 3) {
          // reported
          totalRows++;
          if (t.statusWarna === 'hijau') countHijau++;
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
      faktorPenghambat: currentData?.faktorPenghambat || '',
      tindakLanjut: currentData?.tindakLanjut || '',
      evidensFile: currentData?.evidensFile || `Evidens_T${tNum}_${ind.tipeIndikator}.pdf`,
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
    const persen = Math.min(rawPersen, 120);

    // Rule:
    // >= 100: hijau
    // 50 - 99.99: kuning
    // < 50: merah
    let statusWarna: 'hijau' | 'kuning' | 'merah' = 'merah';
    if (persen >= 100) {
      statusWarna = 'hijau';
    } else if (persen >= 50) {
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
      persenCapaian: persen,
      statusWarna,
      faktorPendorong: triwulanForm.faktorPendorong || '-',
      faktorPenghambat: triwulanForm.faktorPenghambat || '-',
      tindakLanjut: triwulanForm.tindakLanjut || '-',
      statusValidasi: 'Menunggu Validasi',
      evidensFile: triwulanForm.evidensFile,
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

  return (
    <div className="space-y-6">
      {/* Top Filter & Legend Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">Semua Unit Kerja</option>
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

          {/* Color Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              type="button"
              onClick={() => setColorFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors ${
                colorFilter === 'all' ? 'bg-white shadow-xs text-slate-900' : 'text-slate-600'
              }`}
            >
              Semua Warna
            </button>
            <button
              type="button"
              onClick={() => setColorFilter('hijau')}
              className={`px-2.5 py-1 rounded font-semibold transition-colors flex items-center gap-1 ${
                colorFilter === 'hijau' ? 'bg-emerald-600 text-white shadow-xs' : 'text-emerald-700'
              }`}
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Hijau (≥100%)</span>
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

      {/* Summary Stat Cards with Color Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Hijau Card */}
        <div className="bg-emerald-50/80 border border-emerald-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900">
                Kategori HIJAU (Tercapai)
              </span>
              <p className="text-xl font-black text-emerald-950">
                {countHijau} <span className="text-xs font-semibold text-emerald-700">Laporan (≥100%)</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countHijau / totalRows) * 100) : 0}%
          </span>
        </div>

        {/* Kuning Card */}
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                Kategori KUNING (Perhatian)
              </span>
              <p className="text-xl font-black text-amber-950">
                {countKuning} <span className="text-xs font-semibold text-amber-700">Laporan (50-99%)</span>
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-1 rounded-md">
            {totalRows ? Math.round((countKuning / totalRows) * 100) : 0}%
          </span>
        </div>

        {/* Merah Card */}
        <div className="bg-rose-50/80 border border-rose-200 p-4 rounded-xl shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center font-black">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-rose-900">
                Kategori MERAH (Kritis)
              </span>
              <p className="text-xl font-black text-rose-950">
                {countMerah} <span className="text-xs font-semibold text-rose-700">Laporan (&lt;50%)</span>
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
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Kinerja Triwulanan Tahun Anggaran {selectedYear}
            </h3>
            <p className="text-[11px] text-slate-500">
              Evaluasi ketercapaian target triwulanan dengan indikator visual otomatis sesuai regulasi SAKIP
            </p>
          </div>
          <span className="text-xs font-bold text-slate-700">
            {filteredIndikator.length} Indikator Kinerja
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-3">Indikator & OPD</th>
                <th className="px-2 py-3 text-center">Triwulan</th>
                <th className="px-2 py-3 text-right">Target</th>
                <th className="px-2 py-3 text-right">Realisasi</th>
                <th className="px-3 py-3 text-center font-extrabold">% Capaian & Status</th>
                <th className="px-3 py-3">Analisis Faktor & Tindak Lanjut</th>
                <th className="px-3 py-3">Bukti Evidens</th>
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
                  .filter((tNum) => selectedTriwulan === 0 || tNum === selectedTriwulan)
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
                  const isHijau = data.statusWarna === 'hijau';
                  const isKuning = data.statusWarna === 'kuning';
                  const isMerah = data.statusWarna === 'merah';

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

                      <td className="px-3 py-3.5 text-center">
                        <div
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-black text-xs border ${
                            isHijau
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 shadow-xs'
                              : isKuning
                              ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                              : 'bg-rose-100 text-rose-900 border-rose-300 shadow-xs'
                          }`}
                        >
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${
                              isHijau
                                ? 'bg-emerald-600 animate-pulse'
                                : isKuning
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                            }`}
                          />
                          <span className="font-mono">{Math.min(data.persenCapaian, 120)}%</span>
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            ({data.statusWarna})
                          </span>
                        </div>
                      </td>

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
                        </div>
                      </td>

                      <td className="px-3 py-3.5 text-slate-600">
                        {data.evidensFile ? (
                          <div className="flex items-center gap-1 text-emerald-700 font-medium text-[11px]">
                            <FileText className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[120px]" title={data.evidensFile}>
                              {data.evidensFile}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">-</span>
                        )}
                      </td>

                      <td className="px-3 py-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
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
                    Target Triwulan {editingTriwulanNum} ({editingIndikator.satuan}):
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={triwulanForm.target}
                    onChange={(e) => setTriwulanForm({ ...triwulanForm, target: Number(e.target.value) })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-bold font-mono text-sm"
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
                    className="w-full p-2 rounded-lg border border-emerald-400 font-black font-mono text-sm text-emerald-800"
                  />
                </div>
              </div>

              {/* Preview Status Warna */}
              {(() => {
                const targetV = Number(triwulanForm.target) || 1;
                const realisasiV = Number(triwulanForm.realisasi) || 0;
                const rawP = Math.round((realisasiV / targetV) * 10000) / 100;
                const p = Math.min(rawP, 120);
                let colorClass = 'bg-rose-100 text-rose-800 border-rose-300';
                let label = 'MERAH (<50%)';
                if (p >= 100) {
                  colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  label = 'HIJAU (≥100%)';
                } else if (p >= 50) {
                  colorClass = 'bg-amber-100 text-amber-800 border-amber-300';
                  label = 'KUNING (50-99%)';
                }

                return (
                  <div className={`p-3 rounded-lg border flex items-center justify-between ${colorClass}`}>
                    <span className="font-bold">
                      Estimasi % Capaian: {p}%
                      {rawP > 120 && ' (Dibatasi Maks. 120%)'}
                    </span>
                    <span className="font-extrabold uppercase font-mono">{label}</span>
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
                <label className="font-bold text-slate-800 block mb-1">Nama Dokumen Evidens Pendukung:</label>
                <input
                  type="text"
                  placeholder="Nama file lampiran PDF"
                  value={triwulanForm.evidensFile}
                  onChange={(e) => setTriwulanForm({ ...triwulanForm, evidensFile: e.target.value })}
                  className="w-full p-2 rounded-lg border border-slate-200 font-mono text-xs"
                />
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
                  Simpan Capaian Triwulan {editingTriwulanNum}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
