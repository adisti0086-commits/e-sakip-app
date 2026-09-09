import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Search,
  Check,
  Edit3,
  X,
  Building2,
  Calendar,
  ExternalLink,
  Link2,
  RotateCcw,
  Layers,
  Sparkles,
  Save,
  BookOpen,
  Activity,
  FileCheck2,
} from 'lucide-react';
import { INITIAL_KRITERIA_2A, SakipKriteriaItem } from '../../data/sakipKompData';
import { OPD, User } from '../types';
import { notifyLKESync, LKE_SYNC_EVENT } from '../utils/lkeSync';

interface Pengukuran2aViewProps {
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

const STORAGE_KEY_2A = 'sakip_kriteria_2a_v2';

export const Pengukuran2aView: React.FC<Pengukuran2aViewProps> = ({
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
  onNavigateTab,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'kriteria' | 'kamus'>('kriteria');
  const [usiaDokumen, setUsiaDokumen] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('sakip_2a_usia_dokumen');
      if (saved) return Number(saved);
    } catch {
      // fallback
    }
    return 5;
  });

  const [kriteriaList, setKriteriaList] = useState<SakipKriteriaItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_2A);
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return INITIAL_KRITERIA_2A;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'memenuhi' | 'belum'>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modal State for Evidence Input
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<SakipKriteriaItem | null>(null);
  const [formData, setFormData] = useState<Partial<SakipKriteriaItem>>({
    buktiPendukung: '',
    nomorDokumen: '',
    tanggalPenetapan: '',
    unitPenyusun: '',
    linkDakung: '',
    catatanAsesor: '',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
  });

  const isInitialMount = useRef(true);
  const isExternalSync = useRef(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_2A, JSON.stringify(kriteriaList));
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      if (isExternalSync.current) {
        isExternalSync.current = false;
        return;
      }
      notifyLKESync('2.a');
    } catch {
      // ignore
    }
  }, [kriteriaList]);

  // Listen for sync updates triggered from LKE
  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ source?: string }>;
      if (ce.detail?.source === '2.a') return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY_2A);
        if (saved) {
          setKriteriaList((prev) => {
            if (JSON.stringify(prev) === saved) return prev;
            isExternalSync.current = true;
            return JSON.parse(saved);
          });
        }
      } catch (e) {
        console.error(e);
      }
    };
    window.addEventListener(LKE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(LKE_SYNC_EVENT, handleSync);
  }, []);

  const bobot2a = 6.0;
  const totalKriteria = kriteriaList.length;
  const kriteriaTerpenuhi = kriteriaList.filter((k) => k.skor === 1).length;
  const persenPemenuhan = totalKriteria > 0 ? Math.round((kriteriaTerpenuhi / totalKriteria) * 100) : 0;
  const nilai2a = Math.round(((persenPemenuhan / 100) * bobot2a) * 100) / 100;

  const canEdit =
    currentUser.role === 'verifikator' ||
    currentUser.role === 'administrator' ||
    currentUser.role === 'operator_unit';

  const handleToggleSkor = (id: string) => {
    if (!canEdit) return;
    setKriteriaList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newSkor: 1 | 0 = item.skor === 1 ? 0 : 1;
          return {
            ...item,
            skor: newSkor,
            statusPemenuhan: newSkor === 1 ? 'Memenuhi Standar' : 'Belum Memenuhi',
          };
        }
        return item;
      })
    );
    setSaveToast('Skor kriteria berhasil diperbarui');
    setTimeout(() => setSaveToast(null), 2500);
  };

  const handleOpenEditModal = (item: SakipKriteriaItem) => {
    setEditingItem(item);
    setFormData({
      buktiPendukung: item.buktiPendukung,
      nomorDokumen: item.nomorDokumen,
      tanggalPenetapan: item.tanggalPenetapan,
      unitPenyusun: item.unitPenyusun,
      linkDakung: item.linkDakung,
      catatanAsesor: item.catatanAsesor,
      statusPemenuhan: item.statusPemenuhan,
      skor: item.skor,
    });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setKriteriaList((prev) =>
      prev.map((item) => {
        if (item.id === editingItem.id) {
          return {
            ...item,
            buktiPendukung: formData.buktiPendukung || item.buktiPendukung,
            nomorDokumen: formData.nomorDokumen || item.nomorDokumen,
            tanggalPenetapan: formData.tanggalPenetapan || item.tanggalPenetapan,
            unitPenyusun: formData.unitPenyusun || item.unitPenyusun,
            linkDakung: formData.linkDakung || item.linkDakung,
            catatanAsesor: formData.catatanAsesor || item.catatanAsesor,
            statusPemenuhan: formData.statusPemenuhan || item.statusPemenuhan,
            skor: formData.skor !== undefined ? formData.skor : item.skor,
          };
        }
        return item;
      })
    );

    setIsModalOpen(false);
    setEditingItem(null);
    setSaveToast('Bukti dukung kriteria 2.a berhasil disimpan!');
    setTimeout(() => setSaveToast(null), 3000);
  };

  const handleResetDefault = () => {
    if (confirm('Kembalikan data Kriteria 2.a ke default sistem?')) {
      setKriteriaList(INITIAL_KRITERIA_2A);
      localStorage.removeItem(STORAGE_KEY_2A);
      setSaveToast('Data kriteria 2.a direset ke default');
      setTimeout(() => setSaveToast(null), 2500);
    }
  };

  const filteredKriteria = kriteriaList.filter((item) => {
    if (filterStatus === 'memenuhi' && item.skor !== 1) return false;
    if (filterStatus === 'belum' && item.skor !== 0) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        item.kodeKriteria.toLowerCase().includes(q) ||
        item.pernyataan.toLowerCase().includes(q) ||
        item.buktiPendukung.toLowerCase().includes(q) ||
        item.nomorDokumen.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 border border-emerald-500/40 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{saveToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider">
                Komponen 2: Pengukuran Kinerja
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                Sub-Komponen 2.a
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-xs">
                Tahun Anggaran {selectedYear}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-6 h-6 text-emerald-600" />
              2.a Pengukuran Kinerja Telah Dilakukan
            </h1>
            <p className="text-xs text-slate-500 max-w-3xl leading-relaxed">
              Memastikan ketersediaan pedoman teknis pengukuran, buku kamus indikator dengan definisi operasional yang jelas, serta mekanisme pengumpulan data yang andal dan terverifikasi.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Otomatis Terhubung ke LKE • Nilai: {nilai2a.toFixed(2)} / {bobot2a.toFixed(2)}
              </span>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('lke')}
                  className="text-xs text-emerald-700 hover:text-emerald-900 underline font-bold cursor-pointer"
                >
                  Buka Lembar Kerja Evaluasi (LKE) →
                </button>
              )}
            </div>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Capaian Sub-Komponen 2.a
              </span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-2xl font-black text-slate-900 font-mono">
                  {nilai2a.toFixed(2)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ {bobot2a.toFixed(2)}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-700">
                {persenPemenuhan}% Kriteria Terpenuhi
              </span>
            </div>
            <div className="pl-3 border-l border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
                Status
              </span>
              <span className="text-xs font-extrabold px-2.5 py-1 rounded-lg bg-emerald-600 text-white shadow-xs">
                {persenPemenuhan >= 90 ? 'AA (Sangat Baik)' : persenPemenuhan >= 80 ? 'A' : 'BB'}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTabSub('kriteria')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTabSub === 'kriteria'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Daftar Kriteria & Input Bukti Dukung ({totalKriteria})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTabSub('kamus')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                activeTabSub === 'kamus'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Kamus & Definisi Operasional Indikator</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleResetDefault}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded hover:bg-slate-100"
            title="Reset ke data default"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Default</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DAFTAR KRITERIA & INPUT BUKTI DUKUNG */}
      {activeTabSub === 'kriteria' && (
        <div className="space-y-4">
          {/* Controls: Search & Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nomor, kriteria, bukti dukung..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-500 font-medium">Filter Status:</span>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="text-xs rounded-lg border border-slate-200 px-2.5 py-1.5 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Semua ({kriteriaList.length})</option>
                <option value="memenuhi">Memenuhi ({kriteriaTerpenuhi})</option>
                <option value="belum">Belum ({totalKriteria - kriteriaTerpenuhi})</option>
              </select>
            </div>
          </div>

          {/* Criteria Cards */}
          <div className="space-y-3">
            {filteredKriteria.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-slate-200 shadow-xs hover:border-emerald-300 transition-colors p-4 md:p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="px-2 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono font-black text-xs shrink-0">
                      {item.kodeKriteria}
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-snug">
                        {item.pernyataan}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            item.skor === 1
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.statusPemenuhan}
                        </span>
                        <span className="text-[11px] text-slate-400">•</span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Unit: <strong className="text-slate-700">{item.unitPenyusun}</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Toggle Skor & Input Bukti Dukung */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                    <button
                      type="button"
                      onClick={() => handleToggleSkor(item.id)}
                      disabled={!canEdit}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                        item.skor === 1
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                          : 'bg-rose-50 text-rose-700 border-rose-300 hover:bg-rose-100'
                      }`}
                      title="Klik untuk mengubah skor pemenuhan"
                    >
                      {item.skor === 1 ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Skor: 1</span>
                        </>
                      ) : (
                        <>
                          <X className="w-3.5 h-3.5 text-rose-600" />
                          <span>Skor: 0</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditModal(item)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Input Bukti Dukung</span>
                    </button>
                  </div>
                </div>

                {/* Bukti Dukung Detail Box */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-xs space-y-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Dokumen Bukti Dukung:
                      </span>
                      <p className="font-semibold text-slate-800">{item.buktiPendukung}</p>
                      <div className="flex items-center gap-2 text-slate-500 mt-1">
                        <span className="font-mono bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {item.nomorDokumen}
                        </span>
                        <span>•</span>
                        <span>{item.tanggalPenetapan}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Catatan Evaluator / Asesor:
                      </span>
                      <p className="text-slate-600 italic">"{item.catatanAsesor}"</p>

                      {item.linkDakung && (
                        <a
                          href={item.linkDakung}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800 font-bold mt-1.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>Buka Tautan Bukti (Cloud Storage)</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* USIA DOKUMEN (Parameter Khusus PermenPAN-RB LKE) */}
          <div className="bg-[#b3d4fc]/30 border-2 border-sky-300 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start gap-3">
              <span className="w-8 h-8 rounded-lg bg-sky-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-xs">
                ★
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-black text-slate-900">Usia Dokumen Pengukuran Kinerja</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-100 text-sky-800 border border-sky-300">
                    Sesuai Format LKE PermenPAN-RB
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Masa berlaku penetapan pedoman teknis dan mekanisme pengumpulan data kinerja unit.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center bg-white px-3.5 py-2 rounded-xl border border-sky-300 shadow-2xs">
              <span className="text-xs font-bold text-slate-600">Usia Dokumen:</span>
              <select
                value={usiaDokumen}
                disabled={!canEdit}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setUsiaDokumen(val);
                  localStorage.setItem('sakip_2a_usia_dokumen', String(val));
                  setSaveToast(`Usia dokumen disetel: ${val} Tahun`);
                  setTimeout(() => setSaveToast(null), 2500);
                }}
                className="font-mono font-black text-sm text-slate-900 bg-sky-50 border border-sky-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer"
              >
                <option value={5}>5 (Sangat Mutakhir / ≤ 5 Tahun)</option>
                <option value={4}>4 Tahun</option>
                <option value={3}>3 Tahun</option>
                <option value={2}>2 Tahun</option>
                <option value={1}>1 Tahun</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: KAMUS INDIKATOR & DEFINISI OPERASIONAL */}
      {activeTabSub === 'kamus' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Kamus Indikator Kinerja & Definisi Operasional (Kriteria 2.a.2)
              </h2>
              <p className="text-xs text-slate-500">
                Standar operasional pengukuran kinerja RSUP Dr. M. Djamil memuat formula, sumber data, dan polaritas 18 indikator perjanjian kinerja.
              </p>
            </div>
            <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
              18 Indikator Terdefinisi
            </span>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-[10px] uppercase font-extrabold text-slate-600 border-b border-slate-200">
                <tr>
                  <th className="p-3 w-12 text-center">No</th>
                  <th className="p-3">Nama Indikator Kinerja</th>
                  <th className="p-3">Definisi Operasional & Formula</th>
                  <th className="p-3">Sumber Data</th>
                  <th className="p-3 text-center">Polaritas</th>
                  <th className="p-3">Frekuensi Ukur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 text-center font-bold">1</td>
                  <td className="p-3 font-semibold text-slate-900">Indeks Kepuasan Masyarakat (IKM)</td>
                  <td className="p-3 text-slate-600">Total nilai tertimbang survey 9 unsur pelayanan PermenPAN-RB No. 14/2017</td>
                  <td className="p-3">Aplikasi E-Survei Mandiri Pasien</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">MAXIMIZE</span></td>
                  <td className="p-3">Bulanan & Semester</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 text-center font-bold">2</td>
                  <td className="p-3 font-semibold text-slate-900">Nilai Akuntabilitas Kinerja Instansi (SAKIP)</td>
                  <td className="p-3 text-slate-600">Total skor evaluasi Lembar Kerja Evaluasi (LKE) Akuntabilitas Kinerja 4 komponen</td>
                  <td className="p-3">LHE Kemenkes / Itjen</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">MAXIMIZE</span></td>
                  <td className="p-3">Tahunan</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 text-center font-bold">3</td>
                  <td className="p-3 font-semibold text-slate-900">Rasio Pendapatan BLU terhadap Biaya Operasional</td>
                  <td className="p-3 text-slate-600">(Total Realisasi Pendapatan BLU / Total Beban Operasional) x 100%</td>
                  <td className="p-3">Sistem Akuntansi Keuangan BLU</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">MAXIMIZE</span></td>
                  <td className="p-3">Bulanan & Triwulan</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 text-center font-bold">4</td>
                  <td className="p-3 font-semibold text-slate-900">Average Length of Stay (ALOS) Pasien Rawat Inap</td>
                  <td className="p-3 text-slate-600">Jumlah hari rawat semua pasien keluar hidup & mati / Jumlah pasien keluar hidup & mati</td>
                  <td className="p-3">SIMRS Modul Rawat Inap</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-bold text-[10px]">TARGET RANGE</span></td>
                  <td className="p-3">Bulanan</td>
                </tr>
                <tr className="hover:bg-slate-50/80">
                  <td className="p-3 text-center font-bold">5</td>
                  <td className="p-3 font-semibold text-slate-900">Waktu Tanggap Pelayanan Gawat Darurat (Emergency Response Time)</td>
                  <td className="p-3 text-slate-600">Waktu sejak pasien tiba di IGD sampai mendapatkan pelayanan dokter &lt; 5 menit</td>
                  <td className="p-3">Triage Elektronik IGD SIMRS</td>
                  <td className="p-3 text-center"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">MAXIMIZE</span></td>
                  <td className="p-3">Bulanan</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT BUKTI DUKUNG */}
      {isModalOpen && editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  {editingItem.kodeKriteria}
                </div>
                <div>
                  <h3 className="font-bold text-sm">Input & Perbarui Bukti Dukung</h3>
                  <p className="text-[11px] text-slate-300">Sub-Komponen 2.a: Pengukuran Kinerja</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Kriteria PermenPAN-RB:</span>
                <p className="font-semibold text-slate-800 mt-0.5">{editingItem.pernyataan}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Status Pemenuhan
                  </label>
                  <select
                    value={formData.statusPemenuhan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusPemenuhan: e.target.value as any,
                        skor: e.target.value === 'Memenuhi Standar' ? 1 : 0,
                      })
                    }
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Memenuhi Standar">Memenuhi Standar</option>
                    <option value="Sebagian Memenuhi">Sebagian Memenuhi</option>
                    <option value="Belum Memenuhi">Belum Memenuhi</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Skor Nilai LKE (1 / 0)
                  </label>
                  <select
                    value={formData.skor}
                    onChange={(e) => setFormData({ ...formData, skor: Number(e.target.value) as 1 | 0 })}
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 bg-white font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>1 - Memenuhi</option>
                    <option value={0}>0 - Belum Memenuhi</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Nama Dokumen Bukti Pendukung <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.buktiPendukung}
                  onChange={(e) => setFormData({ ...formData, buktiPendukung: e.target.value })}
                  placeholder="Contoh: SK Direktur tentang Pedoman Teknis Pengukuran Kinerja..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Nomor Dokumen / SK
                  </label>
                  <input
                    type="text"
                    value={formData.nomorDokumen}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    placeholder="HK.02.03/D.XVI/..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Tanggal Penetapan / Pengesahan
                  </label>
                  <input
                    type="text"
                    value={formData.tanggalPenetapan}
                    onChange={(e) => setFormData({ ...formData, tanggalPenetapan: e.target.value })}
                    placeholder="15 Januari 2024"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Unit Penyusun / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    value={formData.unitPenyusun}
                    onChange={(e) => setFormData({ ...formData, unitPenyusun: e.target.value })}
                    placeholder="Bagian Perencanaan dan Evaluasi Kinerja"
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Link Bukti Dukung (Google Drive / Cloud)
                  </label>
                  <input
                    type="url"
                    value={formData.linkDakung}
                    onChange={(e) => setFormData({ ...formData, linkDakung: e.target.value })}
                    placeholder="https://drive.google.com/..."
                    className="w-full text-xs rounded-lg border border-slate-200 p-2 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Catatan Asesor / Evaluator
                </label>
                <textarea
                  rows={2}
                  value={formData.catatanAsesor}
                  onChange={(e) => setFormData({ ...formData, catatanAsesor: e.target.value })}
                  placeholder="Catatan hasil verifikasi bukti dukung..."
                  className="w-full text-xs rounded-lg border border-slate-200 p-2.5 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Bukti Dukung</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
