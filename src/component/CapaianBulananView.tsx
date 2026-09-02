import React, { useState } from 'react';
import {
  CalendarDays,
  Search,
  Building2,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  MessageSquare,
  X,
  Edit2,
  Send,
  ShieldCheck,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  IndikatorPK,
  CapaianIndikatorBulan,
  OPD,
  User,
  StatusValidasi,
  RealisasiBulan,
} from '../types';

interface CapaianBulananViewProps {
  indikatorList: IndikatorPK[];
  capaianBulanList: CapaianIndikatorBulan[];
  setCapaianBulanList: React.Dispatch<React.SetStateAction<CapaianIndikatorBulan[]>>;
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
}

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export const CapaianBulananView: React.FC<CapaianBulananViewProps> = ({
  indikatorList = [],
  capaianBulanList = [],
  setCapaianBulanList,
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [selectedIndikatorId, setSelectedIndikatorId] = useState<string>(
    indikatorList?.[0]?.id || ''
  );
  const [selectedBulan, setSelectedBulan] = useState<number>(8); // August default

  // Input & Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [activeEditingBulan, setActiveEditingBulan] = useState<RealisasiBulan | null>(null);

  // Form states for Input Realisasi & Upload Evidens
  const [realisasiInput, setRealisasiInput] = useState<number>(0);
  const [evidensNamaInput, setEvidensNamaInput] = useState('');
  const [keteranganInput, setKeteranganInput] = useState('');

  // Validator feedback state
  const [validatorStatus, setValidatorStatus] = useState<StatusValidasi>('Terverifikasi');
  const [validatorCatatan, setValidatorCatatan] = useState('');

  // Filtered Indikator
  const filteredIndikator = (indikatorList || []).filter((i) => {
    const matchYear = i.tahun === selectedYear;
    if (currentUser.role === 'operator_unit') {
      return matchYear && i.opdId === currentUser.opdId;
    }
    return matchYear && (filterOpd === 'all' || i.opdId === filterOpd);
  });

  const activeIndikator =
    (indikatorList || []).find((i) => i.id === selectedIndikatorId) || filteredIndikator?.[0];

  const activeCapaian = activeIndikator
    ? (capaianBulanList || []).find(
        (c) => c.indikatorId === activeIndikator.id && c.tahun === selectedYear
      )
    : null;

  const getOpdName = (id: string) => opdList?.find((o) => o.id === id)?.nama || id;

  const getStatusBadge = (status: StatusValidasi) => {
    switch (status) {
      case 'Terverifikasi':
        return {
          label: 'Terverifikasi',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: CheckCircle2,
        };
      case 'Menunggu Validasi':
        return {
          label: 'Menunggu Validasi',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          icon: Clock,
        };
      case 'Perlu Perbaikan':
        return {
          label: 'Perlu Perbaikan',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          icon: AlertCircle,
        };
      case 'Ditolak':
        return {
          label: 'Ditolak',
          bg: 'bg-red-100 text-red-800 border-red-300',
          icon: AlertCircle,
        };
      default:
        return {
          label: 'Draft',
          bg: 'bg-slate-100 text-slate-700 border-slate-300',
          icon: Clock,
        };
    }
  };

  // Open Edit Modal for a specific month
  const handleOpenEditMonth = (bulanItem: RealisasiBulan) => {
    setActiveEditingBulan(bulanItem);
    setRealisasiInput(bulanItem.realisasi);
    setEvidensNamaInput(bulanItem.evidensNama || '');
    setKeteranganInput(bulanItem.keterangan || '');
    setIsEditModalOpen(true);
  };

  // Open Validator Review Modal
  const handleOpenValidatorModal = (bulanItem: RealisasiBulan) => {
    setActiveEditingBulan(bulanItem);
    setValidatorStatus(bulanItem.statusValidasi === 'Draft' ? 'Terverifikasi' : bulanItem.statusValidasi);
    setValidatorCatatan(bulanItem.catatanValidator || '');
    setIsValidationModalOpen(true);
  };

  // Save Realisasi and Evidens
  const handleSaveRealisasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIndikator || !activeEditingBulan) return;

    const targetB = activeEditingBulan.targetBulanan || 1;
    const rawPersen = Math.round((Number(realisasiInput) / targetB) * 10000) / 100;
    const persen = Math.min(rawPersen, 120);

    const updatedMonthItem: RealisasiBulan = {
      ...activeEditingBulan,
      realisasi: Number(realisasiInput),
      persenCapaian: persen,
      evidensNama: evidensNamaInput || (evidensNamaInput === '' ? undefined : `Evidens_${activeEditingBulan.namaBulan}.pdf`),
      keterangan: keteranganInput,
      statusValidasi: 'Menunggu Validasi',
      tanggalInput: new Date().toISOString().split('T')[0],
    };

    updateMonthInState(activeIndikator.id, updatedMonthItem);
    setIsEditModalOpen(false);
  };

  // Save Validation Feedback
  const handleSaveValidation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIndikator || !activeEditingBulan) return;

    const updatedMonthItem: RealisasiBulan = {
      ...activeEditingBulan,
      statusValidasi: validatorStatus,
      catatanValidator: validatorCatatan,
      validatorNama: currentUser.name,
    };

    updateMonthInState(activeIndikator.id, updatedMonthItem);
    setIsValidationModalOpen(false);
  };

  const updateMonthInState = (indikatorId: string, updatedMonth: RealisasiBulan) => {
    setCapaianBulanList((prev) => {
      const existing = prev.find((c) => c.indikatorId === indikatorId && c.tahun === selectedYear);
      if (existing) {
        return prev.map((c) =>
          c.indikatorId === indikatorId && c.tahun === selectedYear
            ? {
                ...c,
                realisasiPerBulan: c.realisasiPerBulan.map((b) =>
                  b.bulan === updatedMonth.bulan ? updatedMonth : b
                ),
              }
            : c
        );
      } else {
        // Create initial array for this indikator
        const initialMonths: RealisasiBulan[] = BULAN_NAMES.map((name, idx) => {
          if (idx + 1 === updatedMonth.bulan) return updatedMonth;
          return {
            bulan: idx + 1,
            namaBulan: name,
            targetBulanan: Math.round(((idx + 1) / 12) * (activeIndikator?.targetTahunan || 100) * 10) / 10,
            realisasi: 0,
            persenCapaian: 0,
            statusValidasi: 'Draft',
          };
        });

        return [
          ...prev,
          {
            indikatorId,
            tahun: selectedYear,
            opdId: activeIndikator?.opdId || '',
            realisasiPerBulan: initialMonths,
          },
        ];
      }
    });
  };

  // Generate fallback list of 12 months if activeCapaian is not yet created
  const monthDataList: RealisasiBulan[] =
    activeCapaian?.realisasiPerBulan ||
    BULAN_NAMES.map((name, idx) => ({
      bulan: idx + 1,
      namaBulan: name,
      targetBulanan: Math.round(((idx + 1) / 12) * (activeIndikator?.targetTahunan || 100) * 10) / 10,
      realisasi: 0,
      persenCapaian: 0,
      statusValidasi: 'Draft',
    }));

  return (
    <div className="space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
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

          {/* Indikator Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs max-w-md w-full">
            <span className="text-slate-500 font-semibold mr-2 shrink-0">Pilih Indikator:</span>
            <select
              value={activeIndikator?.id || ''}
              onChange={(e) => setSelectedIndikatorId(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden text-xs truncate w-full cursor-pointer"
            >
              {filteredIndikator.map((i) => (
                <option key={i.id} value={i.id}>
                  [{i.tipeIndikator}] {i.namaIndikator}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Satuan:</span>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold font-mono">
            {activeIndikator?.satuan || '%'}
          </span>
          <span className="text-slate-500 font-medium ml-2">Target TA {selectedYear}:</span>
          <span className="font-bold text-slate-900 font-mono">
            {activeIndikator?.targetTahunan} {activeIndikator?.satuan}
          </span>
        </div>
      </div>

      {/* Active Indikator Detail Card */}
      {activeIndikator && (
        <div className="bg-slate-900 text-white p-5 rounded-xl border border-slate-800 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-bold">
                  {activeIndikator.tipeIndikator}
                </span>
                <span className="text-xs text-slate-300 font-semibold">
                  {getOpdName(activeIndikator.opdId)}
                </span>
              </div>
              <h2 className="text-base font-bold text-white tracking-tight">
                {activeIndikator.namaIndikator}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Sasaran: <strong>{activeIndikator.sasaranStrategis}</strong>
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono bg-slate-800/80 p-3 rounded-lg border border-slate-700">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Formula Hitung</span>
                <span className="text-slate-200 font-sans text-xs">{activeIndikator.formula}</span>
              </div>
              <div className="pl-3 border-l border-slate-700">
                <span className="text-[10px] text-slate-400 block uppercase">Pagu Anggaran</span>
                <span className="text-emerald-400 font-bold">
                  Rp {activeIndikator.paguAnggaran.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12 Months Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Bulanan (Januari s.d. Desember {selectedYear})
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Peran Anda: <strong className="capitalize text-emerald-700">{currentUser.role.replace('_', ' ')}</strong>
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-3 text-center w-12">Bulan</th>
                <th className="px-3 py-3">Nama Bulan</th>
                <th className="px-3 py-3 text-right">Target Kumulatif</th>
                <th className="px-3 py-3 text-right">Realisasi Bulanan</th>
                <th className="px-3 py-3 text-center min-w-[150px] bg-emerald-50/70 border-x border-emerald-100">
                  <div className="font-extrabold text-emerald-950">Capaian (%)</div>
                  <div className="text-[9px] font-normal normal-case text-emerald-700 font-mono">
                    (Realisasi / Target) × 100%
                  </div>
                </th>
                <th className="px-3 py-3">Bukti Dukung / Evidens</th>
                <th className="px-3 py-3">Status Validasi</th>
                <th className="px-3 py-3">Catatan Validator</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthDataList.map((month) => {
                const statusBadge = getStatusBadge(month.statusValidasi);
                const BadgeIcon = statusBadge.icon;
                const isGreen = month.persenCapaian >= 100;
                const isYellow = month.persenCapaian >= 50 && month.persenCapaian < 100;
                const isRed = month.persenCapaian > 0 && month.persenCapaian < 50;

                return (
                  <tr key={month.bulan} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3.5 text-center font-bold text-slate-600 font-mono">
                      {month.bulan.toString().padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-900">
                      {month.namaBulan}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-slate-700">
                      {month.targetBulanan.toString().replace('.', ',')} {activeIndikator?.satuan}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-blue-700">
                      {month.realisasi.toString().replace('.', ',')} {activeIndikator?.satuan}
                    </td>
                    <td className="px-3 py-3.5 text-center bg-emerald-50/30 border-x border-emerald-100">
                      <div className="flex flex-col items-center justify-center gap-1">
                        {(() => {
                          const rawPersen = month.targetBulanan > 0 ? (month.realisasi / month.targetBulanan) * 100 : 0;
                          const cappedPersen = Math.min(month.persenCapaian, 120);
                          return (
                            <>
                              <span
                                className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black font-mono shadow-xs border ${
                                  isGreen
                                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                    : isYellow
                                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                                    : isRed
                                    ? 'bg-rose-100 text-rose-900 border-rose-300'
                                    : 'bg-slate-100 text-slate-500 border-slate-200'
                                }`}
                              >
                                {cappedPersen > 0
                                  ? `${cappedPersen.toFixed(2).replace('.', ',')} %`
                                  : '0,00 %'}
                              </span>
                              {month.realisasi > 0 && month.targetBulanan > 0 && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ({month.realisasi} / {month.targetBulanan}) × 100%
                                  {rawPersen > 120 && ' (Maks. 120%)'}
                                </span>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    </td>
                    <td className="px-3 py-3.5">
                      {month.evidensNama ? (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-medium">
                          <FileText className="w-3.5 h-3.5" />
                          <span className="truncate max-w-[140px]" title={month.evidensNama}>
                            {month.evidensNama}
                          </span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Belum diupload</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${statusBadge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        <span>{statusBadge.label}</span>
                      </span>
                    </td>
                    <td className="px-3 py-3.5 text-slate-600 max-w-[180px]">
                      {month.catatanValidator ? (
                        <p className="text-[11px] truncate" title={month.catatanValidator}>
                          {month.catatanValidator}
                        </p>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Operator can Edit/Input */}
                        {(currentUser.role === 'operator_unit' || currentUser.role === 'administrator') && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditMonth(month)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] flex items-center gap-1 border border-emerald-200"
                            title="Input Realisasi & Upload Evidens"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Input</span>
                          </button>
                        )}

                        {/* Validator can Validate */}
                        {(currentUser.role === 'validator' || currentUser.role === 'administrator') && (
                          <button
                            type="button"
                            onClick={() => handleOpenValidatorModal(month)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 font-semibold rounded text-[11px] flex items-center gap-1 border border-amber-200"
                            title="Validasi Capaian Bulanan"
                          >
                            <ShieldCheck className="w-3 h-3 text-amber-600" />
                            <span>Validasi</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Input Realisasi Bulanan & Upload Evidens (Operator) */}
      {isEditModalOpen && activeEditingBulan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Input Capaian Bulan {activeEditingBulan.namaBulan}
                </h3>
                <p className="text-xs text-slate-500">{activeIndikator?.namaIndikator}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRealisasi} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 block text-[11px]">Target Bulan Ini:</span>
                  <span className="font-bold text-slate-800 text-sm font-mono">
                    {activeEditingBulan.targetBulanan} {activeIndikator?.satuan}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Satuan Pengukuran:</span>
                  <span className="font-bold text-slate-800">{activeIndikator?.satuan}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Angka Realisasi Capaian ({activeIndikator?.satuan}):
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={realisasiInput}
                  onChange={(e) => setRealisasiInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold font-mono text-sm"
                />
              </div>

              {/* Live Capaian Calculation Preview */}
              {activeEditingBulan.targetBulanan > 0 && (() => {
                const rawVal = Math.round(((Number(realisasiInput) || 0) / activeEditingBulan.targetBulanan) * 10000) / 100;
                const cappedVal = Math.min(rawVal, 120);
                return (
                  <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-800 block">
                        Hasil Capaian Terhitung:
                      </span>
                      <span className="text-[10px] text-emerald-600 font-mono">
                        ({realisasiInput || 0} / {activeEditingBulan.targetBulanan}) × 100%
                        {rawVal > 120 && ' (Maksimal dibatasi 120%)'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black font-mono text-emerald-900">
                        {cappedVal.toFixed(2).replace('.', ',')} %
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Upload Evidens Simulator */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Upload Evidens / Bukti Dukung (PDF / Dokumen):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50/50 cursor-pointer">
                  <Upload className="w-6 h-6 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-semibold text-slate-700">Pilih file atau seret file ke sini</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Format didukung: PDF, DOCX, XLSX, JPG (Maks. 10MB)</p>
                  <input
                    type="text"
                    placeholder="Nama file: Laporan_Kinerja_Bulan.pdf"
                    value={evidensNamaInput}
                    onChange={(e) => setEvidensNamaInput(e.target.value)}
                    className="mt-2 w-full p-1.5 text-xs text-center border border-slate-200 rounded font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Catatan / Keterangan Penjelasan Progres:
                </label>
                <textarea
                  rows={2}
                  placeholder="Keterangan singkat kendala atau kemajuan aktivitas..."
                  value={keteranganInput}
                  onChange={(e) => setKeteranganInput(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Validator</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Form Validasi & Feedback (Validator) */}
      {isValidationModalOpen && activeEditingBulan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Validasi Capaian Bulan {activeEditingBulan.namaBulan}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsValidationModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveValidation} className="mt-4 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Realisasi Dilaporkan:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {activeEditingBulan.realisasi} / {activeEditingBulan.targetBulanan} ({activeEditingBulan.persenCapaian}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Bukti Dukung (Evidens):</span>
                  <span className="font-semibold text-emerald-700">
                    {activeEditingBulan.evidensNama || 'Tidak ada evidens terlampir'}
                  </span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1.5">
                  Keputusan Hasil Validasi:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setValidatorStatus('Terverifikasi')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      validatorStatus === 'Terverifikasi'
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Terverifikasi</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidatorStatus('Perlu Perbaikan')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      validatorStatus === 'Perlu Perbaikan'
                        ? 'bg-amber-600 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Perlu Perbaikan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setValidatorStatus('Ditolak')}
                    className={`p-2 rounded-lg text-xs font-bold border transition-colors flex items-center justify-center gap-1 ${
                      validatorStatus === 'Ditolak'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Tolak</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Catatan / Rekomendasi Validator untuk Operator:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ketik catatan validasi, misal: Bukti dukung telah diverifikasi lengkap dan valid..."
                  value={validatorCatatan}
                  onChange={(e) => setValidatorCatatan(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsValidationModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Simpan Validasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
