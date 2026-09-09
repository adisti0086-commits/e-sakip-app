import React, { useState } from 'react';
import {
  CalendarDays,
  Building2,
  ExternalLink,
  Link2,
  X,
  Edit2,
  Send,
  ShieldCheck,
  Check,
  RotateCcw,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  TrendingUp,
} from 'lucide-react';
import {
  IndikatorPK,
  CapaianIndikatorBulan,
  CapaianIndikatorTriwulan,
  OPD,
  User,
  StatusValidasi,
  RealisasiBulan,
  RealisasiTriwulan,
} from '../types';

interface CapaianBulananViewProps {
  indikatorList: IndikatorPK[];
  capaianBulanList: CapaianIndikatorBulan[];
  setCapaianBulanList: React.Dispatch<React.SetStateAction<CapaianIndikatorBulan[]>>;
  capaianTriwulanList?: CapaianIndikatorTriwulan[];
  setCapaianTriwulanList?: React.Dispatch<React.SetStateAction<CapaianIndikatorTriwulan[]>>;
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
}

const BULAN_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

/**
 * Aturan Pewarnaan Capaian:
 * - Lebih dari 100% (> 100%)    : HIJAU
 * - Tepat tercapai 100% (= 100%): BIRU
 * - Antara 50% - < 100%         : KUNING
 * - Kurang dari 50% (< 50%)     : MERAH
 */
export const getCapaianColor = (persen: number) => {
  if (persen > 100) {
    return {
      type: 'lebih_100',
      colorName: 'Hijau',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300 font-extrabold shadow-2xs',
      textClass: 'text-emerald-700',
      dotClass: 'bg-emerald-500',
      label: '> 100% (Melampaui Target)',
    };
  }
  if (Math.abs(persen - 100) < 0.01) {
    return {
      type: 'tepat_100',
      colorName: 'Biru',
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-extrabold shadow-2xs',
      textClass: 'text-blue-700',
      dotClass: 'bg-blue-500',
      label: '100% (Tepat Tercapai)',
    };
  }
  if (persen >= 50 && persen < 100) {
    return {
      type: 'antara_50_100',
      colorName: 'Kuning',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 font-extrabold shadow-2xs',
      textClass: 'text-amber-700',
      dotClass: 'bg-amber-500',
      label: '50% - 99,99% (Cukup)',
    };
  }
  return {
    type: 'kurang_50',
    colorName: 'Merah',
    badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 font-extrabold shadow-2xs',
    textClass: 'text-rose-700',
    dotClass: 'bg-rose-500',
    label: '< 50% (Kurang)',
  };
};

export const CapaianBulananView: React.FC<CapaianBulananViewProps> = ({
  indikatorList = [],
  capaianBulanList = [],
  setCapaianBulanList,
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
  const [selectedIndikatorId, setSelectedIndikatorId] = useState<string>(
    indikatorList?.[0]?.id || ''
  );

  // Input & Modal States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [activeEditingBulan, setActiveEditingBulan] = useState<RealisasiBulan | null>(null);

  // Form states for Input Target, Realisasi & Link Evidens
  const [targetInput, setTargetInput] = useState<number>(0);
  const [realisasiInput, setRealisasiInput] = useState<number>(0);
  const [evidensLinkInput, setEvidensLinkInput] = useState('');
  const [keteranganInput, setKeteranganInput] = useState('');

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Validator feedback state
  const [validatorStatus, setValidatorStatus] = useState<StatusValidasi>('Terverifikasi');
  const [validatorCatatan, setValidatorCatatan] = useState('');

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
    setTargetInput(bulanItem.targetBulanan);
    setRealisasiInput(bulanItem.realisasi);
    setEvidensLinkInput(bulanItem.evidensLink || (bulanItem.evidensNama?.startsWith('http') ? bulanItem.evidensNama : ''));
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

  // Save Realisasi, Target, and Evidens Link
  const handleSaveRealisasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeIndikator || !activeEditingBulan) return;

    const targetB = Number(targetInput) > 0 ? Number(targetInput) : activeEditingBulan.targetBulanan || 1;
    const realisasiB = Number(realisasiInput) || 0;
    const rawPersen = Math.round((realisasiB / targetB) * 10000) / 100;
    const cleanLink = evidensLinkInput.trim();

    const updatedMonthItem: RealisasiBulan = {
      ...activeEditingBulan,
      targetBulanan: targetB,
      realisasi: realisasiB,
      persenCapaian: rawPersen,
      evidensLink: cleanLink || undefined,
      evidensNama: cleanLink ? 'Tautan Bukti Dukung' : undefined,
      keterangan: keteranganInput,
      statusValidasi: 'Menunggu Validasi',
      tanggalInput: new Date().toISOString().split('T')[0],
    };

    updateMonthInState(activeIndikator.id, updatedMonthItem);
    setIsEditModalOpen(false);

    const qNum = Math.ceil(activeEditingBulan.bulan / 3);
    showToast(
      `Capaian bulan ${activeEditingBulan.namaBulan} berhasil disimpan & otomatis disinkronkan ke Triwulan ${qNum}!`
    );
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
    showToast(`Status validasi bulan ${activeEditingBulan.namaBulan} berhasil diperbarui.`);
  };

  // Update month in State AND Auto-Sync with Triwulan Data
  const updateMonthInState = (indikatorId: string, updatedMonth: RealisasiBulan) => {
    let allMonthsForThisIndikator: RealisasiBulan[] = [];

    setCapaianBulanList((prev) => {
      const existing = prev.find((c) => c.indikatorId === indikatorId && c.tahun === selectedYear);
      if (existing) {
        const nextMonths = existing.realisasiPerBulan.map((b) =>
          b.bulan === updatedMonth.bulan ? updatedMonth : b
        );
        allMonthsForThisIndikator = nextMonths;
        return prev.map((c) =>
          c.indikatorId === indikatorId && c.tahun === selectedYear
            ? { ...c, realisasiPerBulan: nextMonths }
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
        allMonthsForThisIndikator = initialMonths;
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

    // Otomatis sinkronkan ke Data Triwulan jika setCapaianTriwulanList tersedia
    if (setCapaianTriwulanList && allMonthsForThisIndikator.length > 0) {
      setCapaianTriwulanList((prevTriwulan) => {
        const existingTriwulan = prevTriwulan.find(
          (t) => t.indikatorId === indikatorId && t.tahun === selectedYear
        );

        const updatedRealTriwulan: RealisasiTriwulan[] = [1, 2, 3, 4].map((qNum) => {
          const qMonths = allMonthsForThisIndikator.filter(
            (m) => Math.ceil(m.bulan / 3) === qNum
          );
          const endMonth = qMonths.find((m) => m.bulan === qNum * 3);
          const latestWithRealisasi = [...qMonths].reverse().find((m) => m.realisasi > 0);

          const fallbackTarget =
            qNum === 1
              ? activeIndikator?.targetT1
              : qNum === 2
              ? activeIndikator?.targetT2
              : qNum === 3
              ? activeIndikator?.targetT3
              : activeIndikator?.targetT4;

          const qTarget = endMonth?.targetBulanan ?? fallbackTarget ?? 0;
          const qRealisasi =
            endMonth && endMonth.realisasi > 0
              ? endMonth.realisasi
              : latestWithRealisasi
              ? latestWithRealisasi.realisasi
              : (endMonth?.realisasi ?? 0);

          const rawPersen = qTarget > 0 ? (qRealisasi / qTarget) * 100 : 0;
          const persenCapaian = Math.round(rawPersen * 100) / 100;

          // Status warna triwulan sesuai aturan:
          // > 100% hijau, 100% biru, 50-100% kuning, < 50% merah
          let statusWarna: 'hijau' | 'biru' | 'kuning' | 'merah' = 'merah';
          if (persenCapaian > 100) {
            statusWarna = 'hijau';
          } else if (Math.abs(persenCapaian - 100) < 0.01) {
            statusWarna = 'biru';
          } else if (persenCapaian >= 50 && persenCapaian < 100) {
            statusWarna = 'kuning';
          } else {
            statusWarna = 'merah';
          }

          const latestLink = [...qMonths].reverse().find((m) => m.evidensLink)?.evidensLink;
          const existingQ = existingTriwulan?.realisasiPerTriwulan.find((r) => r.triwulan === qNum);

          return {
            triwulan: qNum,
            namaTriwulan: `Triwulan ${
              qNum === 1 ? 'I (Jan - Mar)' : qNum === 2 ? 'II (Apr - Jun)' : qNum === 3 ? 'III (Jul - Sep)' : 'IV (Okt - Des)'
            }`,
            target: qTarget,
            realisasi: qRealisasi,
            persenCapaian,
            statusWarna,
            faktorPendorong:
              existingQ?.faktorPendorong || 'Tersinkronisasi otomatis dari input capaian bulanan.',
            faktorPenghambat: existingQ?.faktorPenghambat || '',
            tindakLanjut: existingQ?.tindakLanjut || '',
            statusValidasi: endMonth?.statusValidasi || latestWithRealisasi?.statusValidasi || 'Draft',
            catatanValidator: endMonth?.catatanValidator || latestWithRealisasi?.catatanValidator || '',
            linkDakung: latestLink || existingQ?.linkDakung || '',
            evidensFile: latestLink ? 'Link Bukti Dukung Bulanan' : existingQ?.evidensFile || '',
          };
        });

        if (existingTriwulan) {
          return prevTriwulan.map((item) =>
            item.indikatorId === indikatorId && item.tahun === selectedYear
              ? { ...item, realisasiPerTriwulan: updatedRealTriwulan }
              : item
          );
        } else {
          return [
            ...prevTriwulan,
            {
              indikatorId,
              tahun: selectedYear,
              opdId: activeIndikator?.opdId || '',
              realisasiPerTriwulan: updatedRealTriwulan,
            },
          ];
        }
      });
    }
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

  // Calculations for Bottom Summary Row (Total Row)
  const reportedMonths = monthDataList.filter((m) => m.realisasi > 0 || m.statusValidasi !== 'Draft');
  const reportedCount = reportedMonths.length;

  // Final Target (Target Kumulatif Akhir TA atau Bulan ke-12)
  const finalCumulativeTarget = monthDataList[11]?.targetBulanan || activeIndikator?.targetTahunan || 0;

  // Total Realisasi Aktif (Realisasi kumulatif tertinggi/terakhir yang telah dilaporkan)
  const latestReportedMonth = [...monthDataList].reverse().find((m) => m.realisasi > 0);
  const totalRealisasiAktif = latestReportedMonth ? latestReportedMonth.realisasi : 0;

  // Rata-rata Capaian (%) dari bulan yang sudah berjalan
  const totalPersenSum = reportedMonths.reduce((sum, m) => sum + m.persenCapaian, 0);
  const rataRataCapaian = reportedCount > 0 ? Math.round((totalPersenSum / reportedCount) * 100) / 100 : 0;

  // Capaian Akumulasi Kumulatif (Realisasi Aktif / Target Kumulatif Akhir)
  const akumulasiCapaian =
    finalCumulativeTarget > 0 ? Math.round((totalRealisasiAktif / finalCumulativeTarget) * 10000) / 100 : 0;

  // Normalisasi Capaian (Maksimal 120%)
  const normalisasiRataRata = Math.min(rataRataCapaian, 120);

  // Color Badges for Total Row
  const totalCapaianBadge = getCapaianColor(rataRataCapaian);
  const totalNormalisasiBadge = getCapaianColor(normalisasiRataRata);

  // Link & Verification Stats
  const linkCount = monthDataList.filter((m) => Boolean(m.evidensLink)).length;
  const verifiedCount = monthDataList.filter((m) => m.statusValidasi === 'Terverifikasi').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-700 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500 animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-200 hover:text-white rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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

      {/* Indikator Warna & Kriteria Penjelasan Banner */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-800">
          <Info className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Aturan Pewarnaan Capaian:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            &gt; 100% : Hijau
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 text-blue-900 border border-blue-300 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            100% : Biru
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            50% - &lt;100% : Kuning
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-bold font-mono">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            &lt; 50% : Merah
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-medium">
            <strong>Normalisasi:</strong> Maksimal 120%
          </span>
        </div>
      </div>

      {/* 12 Months Table View */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rekapitulasi Capaian Bulanan (Januari s.d. Desember {selectedYear})
            </h3>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="text-slate-500">
              Peran Anda: <strong className="capitalize text-emerald-700">{currentUser.role.replace('_', ' ')}</strong>
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
              Otomatis Terhubung ke Triwulan I - IV
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[960px]">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-3 text-center w-12">Bulan</th>
                <th className="px-3 py-3">Nama Bulan</th>
                <th className="px-3 py-3 text-right">Target Kumulatif</th>
                <th className="px-3 py-3 text-right">Realisasi Bulanan</th>
                <th className="px-3 py-3 text-center min-w-[140px] bg-slate-50 border-x border-slate-200">
                  <div className="font-extrabold text-slate-900">Capaian (%)</div>
                  <div className="text-[9px] font-normal normal-case text-slate-500 font-mono">
                    (Realisasi / Target) × 100%
                  </div>
                </th>
                <th className="px-3 py-3 text-center min-w-[140px] bg-emerald-50/50 border-r border-emerald-100">
                  <div className="font-extrabold text-emerald-950">Normalisasi 120%</div>
                  <div className="text-[9px] font-normal normal-case text-emerald-700 font-mono">
                    Maks. Cap 120,00%
                  </div>
                </th>
                <th className="px-3 py-3">Bukti Dukung (Link)</th>
                <th className="px-3 py-3">Status Validasi</th>
                <th className="px-3 py-3">Catatan Validator</th>
                <th className="px-3 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthDataList.map((month) => {
                const statusBadge = getStatusBadge(month.statusValidasi);
                const BadgeIcon = statusBadge.icon;

                // Capaian Asli
                const rawPersen =
                  month.targetBulanan > 0
                    ? Math.round((month.realisasi / month.targetBulanan) * 10000) / 100
                    : 0;
                const capaianColor = getCapaianColor(rawPersen);

                // Normalisasi Capaian (Maks 120%)
                const normalisasiVal = Math.min(rawPersen, 120);
                const normalisasiColor = getCapaianColor(normalisasiVal);

                const canEdit = currentUser.role === 'operator_unit' || currentUser.role === 'administrator';
                const canValidate = currentUser.role === 'validator' || currentUser.role === 'administrator';

                return (
                  <tr key={month.bulan} className="hover:bg-slate-50/90 transition-colors">
                    <td className="px-3 py-3.5 text-center font-bold text-slate-600 font-mono">
                      {month.bulan.toString().padStart(2, '0')}
                    </td>
                    <td className="px-3 py-3.5 font-bold text-slate-900">
                      {month.namaBulan}
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono text-slate-700">
                      <div className="flex items-center justify-end gap-1.5">
                        <span>
                          {month.targetBulanan.toString().replace('.', ',')} {activeIndikator?.satuan}
                        </span>
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditMonth(month)}
                            title="Ubah Target & Realisasi Bulan"
                            className="p-1 rounded text-slate-400 hover:text-emerald-600 hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3.5 text-right font-mono font-bold text-blue-700">
                      {month.realisasi.toString().replace('.', ',')} {activeIndikator?.satuan}
                    </td>

                    {/* Kolom 1: Capaian Asli */}
                    <td className="px-3 py-3.5 text-center bg-slate-50/40 border-x border-slate-200">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black font-mono border ${capaianColor.badgeClass}`}
                        >
                          {rawPersen.toFixed(2).replace('.', ',')} %
                        </span>
                        {month.realisasi > 0 && month.targetBulanan > 0 && (
                          <span className="text-[9px] text-slate-500 font-mono">
                            ({month.realisasi} / {month.targetBulanan})
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Kolom 2: Normalisasi 120% Paling Tinggi */}
                    <td className="px-3 py-3.5 text-center bg-emerald-50/20 border-r border-emerald-100">
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-black font-mono border ${normalisasiColor.badgeClass}`}
                        >
                          {normalisasiVal.toFixed(2).replace('.', ',')} %
                        </span>
                        {rawPersen > 120 && (
                          <span className="text-[9px] text-emerald-700 font-bold">
                            Maks. 120%
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Bukti Dukung: Link Saja */}
                    <td className="px-3 py-3.5">
                      {month.evidensLink ? (
                        <a
                          href={month.evidensLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 font-semibold text-[11px] transition-colors group"
                          title={month.evidensLink}
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
                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditMonth(month)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded text-[11px] flex items-center gap-1 border border-emerald-200"
                            title="Input Realisasi, Ubah Target & Link Evidens"
                          >
                            <Edit2 className="w-3 h-3" />
                            <span>Input</span>
                          </button>
                        )}

                        {canValidate && (
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

            {/* Baris Total di Bawah (Footer Summary) */}
            <tfoot className="bg-slate-900 text-white font-bold border-t-2 border-slate-700">
              <tr>
                <td colSpan={2} className="px-3 py-4 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <span className="uppercase tracking-wider text-xs font-black text-emerald-400">
                      TOTAL / RATA-RATA TAHUNAN
                    </span>
                    <span className="text-[10px] text-slate-400 font-normal mt-0.5">
                      12 Bulan TA {selectedYear} ({reportedCount} Bulan Aktif)
                    </span>
                  </div>
                </td>

                <td className="px-3 py-4 text-right font-mono text-xs text-slate-200">
                  <div className="text-[10px] text-slate-400 font-normal">Target Kumulatif Akhir:</div>
                  <div className="font-extrabold text-white text-sm">
                    {finalCumulativeTarget.toString().replace('.', ',')} {activeIndikator?.satuan}
                  </div>
                </td>

                <td className="px-3 py-4 text-right font-mono text-xs">
                  <div className="text-[10px] text-slate-400 font-normal">Realisasi Kumulatif:</div>
                  <div className="font-extrabold text-blue-400 text-sm">
                    {totalRealisasiAktif.toString().replace('.', ',')} {activeIndikator?.satuan}
                  </div>
                </td>

                {/* Total Capaian (%) */}
                <td className="px-3 py-4 text-center bg-slate-800/80 border-x border-slate-700">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black font-mono border ${totalCapaianBadge.badgeClass}`}
                    >
                      {rataRataCapaian.toFixed(2).replace('.', ',')} %
                    </span>
                    <span className="text-[9px] text-slate-400 font-normal">
                      Rata-rata Bulan Aktif
                    </span>
                  </div>
                </td>

                {/* Total Normalisasi (Maks 120%) */}
                <td className="px-3 py-4 text-center bg-slate-800 border-r border-slate-700">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span
                      className={`inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black font-mono border ${totalNormalisasiBadge.badgeClass}`}
                    >
                      {normalisasiRataRata.toFixed(2).replace('.', ',')} %
                    </span>
                    {rataRataCapaian > 120 && (
                      <span className="text-[9px] text-emerald-400 font-bold">(Maks. 120%)</span>
                    )}
                  </div>
                </td>

                {/* Link Evidens Summary */}
                <td className="px-3 py-4 text-xs font-normal text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                    <span>
                      <strong className="text-white font-mono">{linkCount}</strong> / 12 Link Terisi
                    </span>
                  </div>
                </td>

                {/* Validasi Summary */}
                <td className="px-3 py-4 text-xs font-normal text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>
                      <strong className="text-emerald-400 font-mono">{verifiedCount}</strong> Terverifikasi
                    </span>
                  </div>
                </td>

                <td colSpan={2} className="px-3 py-4 text-right text-[11px] text-slate-400 font-normal">
                  Terhubung ke Triwulan I - IV
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Modal 1: Input Target, Realisasi & Link Evidens (Operator) */}
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
                  <span className="text-slate-500 block text-[11px]">Satuan Pengukuran:</span>
                  <span className="font-bold text-slate-800 text-sm">{activeIndikator?.satuan}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Triwulan Terkait:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    Triwulan {Math.ceil(activeEditingBulan.bulan / 3)} (Otomatis Tersinkron)
                  </span>
                </div>
              </div>

              {/* Target Bulan Bisa Diubah */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Target Bulan Ini ({activeIndikator?.satuan}) - <span className="text-emerald-700 font-normal">Dapat Diubah</span>:
                </label>
                <input
                  type="number"
                  step="any"
                  required
                  value={targetInput}
                  onChange={(e) => setTargetInput(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold font-mono text-sm bg-white"
                  placeholder="Masukkan target bulanan..."
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Target dapat disesuaikan dengan target kumulatif / periodik rumah sakit.
                </p>
              </div>

              {/* Angka Realisasi */}
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
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-bold font-mono text-sm text-blue-700 bg-white"
                  placeholder="Masukkan realisasi bulanan..."
                />
              </div>

              {/* Live Capaian & Normalisasi Calculation Preview */}
              {Number(targetInput) > 0 && (() => {
                const liveRawPersen =
                  Math.round(((Number(realisasiInput) || 0) / Number(targetInput)) * 10000) / 100;
                const liveNormPersen = Math.min(liveRawPersen, 120);
                const liveBadge = getCapaianColor(liveRawPersen);
                const liveNormBadge = getCapaianColor(liveNormPersen);

                return (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">Hasil Capaian Asli:</span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${liveBadge.badgeClass}`}
                      >
                        {liveRawPersen.toFixed(2).replace('.', ',')} %
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs border-t border-slate-200/80 pt-2">
                      <div>
                        <span className="font-bold text-slate-800 block">Normalisasi (Maks. 120%):</span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {liveRawPersen > 120
                            ? `Dibatasi maksimal 120% (asli: ${liveRawPersen.toFixed(2)}%)`
                            : 'Nilai di bawah 120%, tidak dipotong'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-0.5 rounded-full font-mono text-xs font-black border ${liveNormBadge.badgeClass}`}
                      >
                        {liveNormPersen.toFixed(2).replace('.', ',')} %
                      </span>
                    </div>
                  </div>
                );
              })()}

              {/* Bukti Dukung Link Saja (URL) */}
              <div>
                <label className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
                  <Link2 className="w-4 h-4 text-emerald-600" />
                  <span>Tautan / Link Bukti Dukung (URL / Cloud Storage):</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-1.5">
                  Masukkan tautan berkas resmi (Google Drive, OneDrive, atau tautan portal dokumen).
                </p>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://..."
                  value={evidensLinkInput}
                  onChange={(e) => setEvidensLinkInput(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 font-mono text-xs"
                />

                {evidensLinkInput && (
                  <div className="mt-2 flex items-center justify-between bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 text-xs">
                    <span className="text-blue-800 truncate font-mono text-[11px] max-w-[280px]">
                      {evidensLinkInput}
                    </span>
                    <a
                      href={evidensLinkInput}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline shrink-0 text-[11px]"
                    >
                      <span>Tes Buka Tautan</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
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
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Simpan & Sinkronkan</span>
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
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Target Dilaporkan:</span>
                  <span className="font-bold text-slate-800 font-mono">
                    {activeEditingBulan.targetBulanan} {activeIndikator?.satuan}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Realisasi Dilaporkan:</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {activeEditingBulan.realisasi} {activeIndikator?.satuan} ({activeEditingBulan.persenCapaian}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tautan Bukti Dukung:</span>
                  {activeEditingBulan.evidensLink ? (
                    <a
                      href={activeEditingBulan.evidensLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                    >
                      <span>Buka Tautan Evidens</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Belum ada link terlampir</span>
                  )}
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
