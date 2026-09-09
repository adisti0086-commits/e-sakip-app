import React, { useState, useEffect, useRef } from 'react';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Award,
  DollarSign,
  Activity,
  FileSpreadsheet,
  RotateCcw,
  Search,
  Check,
  Calendar,
  Building2,
  ArrowUpRight,
  ExternalLink,
  Users,
  Briefcase,
  Layers,
  Sparkles,
  Edit3,
  Plus,
  X,
  Save,
  Link2,
  FileText,
} from 'lucide-react';
import {
  Kriteria1cItem,
  PemanfaatanAnggaranSasaran,
  INITIAL_KRITERIA_1C,
  INITIAL_PEMANFAATAN_ANGGARAN,
} from '../../data/perencanaanData';
import { OPD, User } from '../types';
import { notifyLKESync, LKE_SYNC_EVENT } from '../utils/lkeSync';

interface Perencanaan1cViewProps {
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

const STORAGE_KEY_KRITERIA_1C = 'sakip_kriteria_1c_v2';

export const Perencanaan1cView: React.FC<Perencanaan1cViewProps> = ({
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
  onNavigateTab,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'kriteria' | 'anggaran' | 'pemantauan' | 'komitmen'>('kriteria');

  // Kriteria state with local storage persistence
  const [kriteriaList, setKriteriaList] = useState<Kriteria1cItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KRITERIA_1C);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading stored 1c criteria', e);
    }
    return INITIAL_KRITERIA_1C;
  });

  const [anggaranList] = useState<PemanfaatanAnggaranSasaran[]>(INITIAL_PEMANFAATAN_ANGGARAN);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'memenuhi' | 'belum'>('all');

  // Modal State for Inputting / Editing Bukti Dukung
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteriaId, setEditingKriteriaId] = useState<string>('k-1c-1');
  const [formData, setFormData] = useState({
    bentukPemanfaatan: '',
    dokumenEvidens: '',
    nomorDokumen: '',
    tanggalPenetapan: '',
    unitPenyusun: '',
    linkDakung: '',
    statusPemanfaatan: 'Dimanfaatkan Penuh' as 'Dimanfaatkan Penuh' | 'Sebagian Dimanfaatkan' | 'Belum Optimal',
    skor: 1 as 1 | 0,
    catatanEvaluasi: '',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const isInitialMount = useRef(true);
  const isExternalSync = useRef(false);

  // Sync to localStorage and notify LKE whenever kriteriaList changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KRITERIA_1C, JSON.stringify(kriteriaList));
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }
      if (isExternalSync.current) {
        isExternalSync.current = false;
        return;
      }
      notifyLKESync('1.c');
    } catch {}
  }, [kriteriaList]);

  // Listen for sync updates triggered from LKE
  useEffect(() => {
    const handleSync = (e: Event) => {
      const ce = e as CustomEvent<{ source?: string }>;
      if (ce.detail?.source === '1.c') return;
      try {
        const saved = localStorage.getItem(STORAGE_KEY_KRITERIA_1C);
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

  const bobot1c = 15.0;
  const totalKriteria = kriteriaList.length;
  const kriteriaTerpenuhi = kriteriaList.filter((k) => k.skor === 1).length;
  const persenPemenuhan = totalKriteria > 0 ? Math.round((kriteriaTerpenuhi / totalKriteria) * 100) : 0;
  const nilai1c = Math.round(((persenPemenuhan / 100) * bobot1c) * 100) / 100;

  // Verifikator, Admin, or Unit Operator can input / edit evidence
  const canEdit =
    currentUser.role === 'verifikator' ||
    currentUser.role === 'administrator' ||
    currentUser.role === 'operator_unit';

  const handleToggleSkor = (id: string) => {
    if (!canEdit) return;
    setKriteriaList((prev) => {
      const updated: Kriteria1cItem[] = prev.map((item): Kriteria1cItem => {
        if (item.id === id) {
          const nextSkor: 1 | 0 = item.skor === 1 ? 0 : 1;
          const nextStatus: Kriteria1cItem['statusPemanfaatan'] =
            nextSkor === 1 ? 'Dimanfaatkan Penuh' : 'Belum Optimal';
          return {
            ...item,
            skor: nextSkor,
            statusPemanfaatan: nextStatus,
          };
        }
        return item;
      });
      try {
        localStorage.setItem(STORAGE_KEY_KRITERIA_1C, JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save to localStorage', err);
      }
      return updated;
    });
    showToast('Skor pemanfaatan kriteria berhasil diperbarui.');
  };

  const handleOpenModal = (kriteria: Kriteria1cItem) => {
    setEditingKriteriaId(kriteria.id);
    setFormData({
      bentukPemanfaatan: kriteria.bentukPemanfaatan || '',
      dokumenEvidens: kriteria.dokumenEvidens || '',
      nomorDokumen: kriteria.nomorDokumen || '',
      tanggalPenetapan: kriteria.tanggalPenetapan || '',
      unitPenyusun: kriteria.unitPenyusun || '',
      linkDakung: kriteria.linkDakung || '',
      statusPemanfaatan: kriteria.statusPemanfaatan || 'Dimanfaatkan Penuh',
      skor: kriteria.skor,
      catatanEvaluasi: kriteria.catatanEvaluasi || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    const defaultKriteria = kriteriaList[0] || INITIAL_KRITERIA_1C[0];
    handleOpenModal(defaultKriteria);
  };

  const handleChangeKriteriaSelect = (targetId: string) => {
    const found = kriteriaList.find((k) => k.id === targetId);
    if (found) {
      setEditingKriteriaId(targetId);
      setFormData({
        bentukPemanfaatan: found.bentukPemanfaatan || '',
        dokumenEvidens: found.dokumenEvidens || '',
        nomorDokumen: found.nomorDokumen || '',
        tanggalPenetapan: found.tanggalPenetapan || '',
        unitPenyusun: found.unitPenyusun || '',
        linkDakung: found.linkDakung || '',
        statusPemanfaatan: found.statusPemanfaatan || 'Dimanfaatkan Penuh',
        skor: found.skor,
        catatanEvaluasi: found.catatanEvaluasi || '',
      });
    }
  };

  const handleSaveBuktiDukung = (e: React.FormEvent) => {
    e.preventDefault();
    setKriteriaList((prev) => {
      const updated = prev.map((item) => {
        if (item.id === editingKriteriaId) {
          return {
            ...item,
            bentukPemanfaatan: formData.bentukPemanfaatan,
            dokumenEvidens: formData.dokumenEvidens,
            nomorDokumen: formData.nomorDokumen,
            tanggalPenetapan: formData.tanggalPenetapan,
            unitPenyusun: formData.unitPenyusun,
            linkDakung: formData.linkDakung,
            statusPemanfaatan: formData.statusPemanfaatan,
            skor: formData.skor,
            catatanEvaluasi: formData.catatanEvaluasi,
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY_KRITERIA_1C, JSON.stringify(updated));
      return updated;
    });
    setIsModalOpen(false);
    showToast('Bukti pemanfaatan kriteria 1.c berhasil disimpan!');
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh data kriteria dan bukti pemanfaatan 1.c ke kondisi awal?')) {
      setKriteriaList(INITIAL_KRITERIA_1C);
      localStorage.setItem(STORAGE_KEY_KRITERIA_1C, JSON.stringify(INITIAL_KRITERIA_1C));
      showToast('Data kriteria 1.c dikembalikan ke standar awal.');
    }
  };

  const currentSelectedKriteria = kriteriaList.find((k) => k.id === editingKriteriaId);

  const filteredKriteria = kriteriaList.filter((item) => {
    if (filterStatus === 'memenuhi' && item.skor !== 1) return false;
    if (filterStatus === 'belum' && item.skor !== 0) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.kodeKriteria.toLowerCase().includes(term) ||
      item.pernyataan.toLowerCase().includes(term) ||
      item.bentukPemanfaatan.toLowerCase().includes(term) ||
      item.dokumenEvidens.toLowerCase().includes(term) ||
      (item.nomorDokumen && item.nomorDokumen.toLowerCase().includes(term)) ||
      (item.unitPenyusun && item.unitPenyusun.toLowerCase().includes(term)) ||
      item.catatanEvaluasi.toLowerCase().includes(term)
    );
  });

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-amber-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER STATISTIK KOMPONEN 1.C */}
      <div className="bg-gradient-to-r from-amber-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-black tracking-wider uppercase">
                Sub-Komponen 1.c LKE SAKIP
              </span>
              <span className="text-xs text-amber-200/80 font-medium">PermenPAN-RB No. 88/2021</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Perencanaan Kinerja Dimanfaatkan untuk Mewujudkan Hasil
            </h2>
            <p className="text-sm text-amber-100/90 max-w-3xl leading-relaxed">
              Pemanfaatan perencanaan kinerja dalam penganggaran berbasis kinerja (<strong>Money Follows Program</strong>), keselarasan aktivitas belanja, pemantauan rencana aksi secara berkala, penyempurnaan dokumen dari hasil evaluasi, serta komitmen pimpinan, satker, dan pegawai.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Otomatis Terhubung ke LKE • Nilai: {nilai1c.toFixed(2)} / {bobot1c.toFixed(2)}
              </span>
              {onNavigateTab && (
                <button
                  type="button"
                  onClick={() => onNavigateTab('lke')}
                  className="text-xs text-amber-200 hover:text-white underline font-bold cursor-pointer"
                >
                  Buka Lembar Kerja Evaluasi (LKE) →
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">Bobot SAKIP</span>
              <span className="text-2xl font-black text-white font-mono">{bobot1c.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">Nilai Capaian</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">{nilai1c.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[115px]">
              <span className="text-[11px] font-bold text-amber-200 uppercase tracking-wider block">Kriteria Terpenuhi</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{kriteriaTerpenuhi}/{totalKriteria}</span>
              <span className="text-[10px] text-white/80 block font-semibold mt-0.5">({persenPemenuhan}% Pemanfaatan)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs and Top Action Button */}
        <div className="mt-6 pt-4 border-t border-amber-700/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTabSub('kriteria')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'kriteria'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-amber-950/40 text-amber-100 hover:bg-amber-800/60'
              }`}
            >
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span>8 Kriteria Pemanfaatan (1.c.1 - 1.c.8)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('anggaran')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'anggaran'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-amber-950/40 text-amber-100 hover:bg-amber-800/60'
              }`}
            >
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Money Follows Program (1.c.1 & 1.c.2)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('pemantauan')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'pemantauan'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-amber-950/40 text-amber-100 hover:bg-amber-800/60'
              }`}
            >
              <Activity className="w-4 h-4 text-sky-500" />
              <span>Pemantauan Rencana Aksi (1.c.3 & 1.c.4)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('komitmen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'komitmen'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-amber-950/40 text-amber-100 hover:bg-amber-800/60'
              }`}
            >
              <RotateCcw className="w-4 h-4 text-purple-500" />
              <span>Perbaikan & Komitmen (1.c.5 - 1.c.8)</span>
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Bukti Pemanfaatan</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: TABEL 8 KRITERIA LKE 1.C */}
      {activeTabSub === 'kriteria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter, Search & Action Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span>Pemenuhan 8 Kriteria Pemanfaatan Perencanaan Kinerja (Sub-Komponen 1.c)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluasi bukti riil pemanfaatan anggaran, rencana aksi, monev berkala, dan komitmen seluruh satker
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter Tabs */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterStatus === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({totalKriteria})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('memenuhi')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterStatus === 'memenuhi'
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Dimanfaatkan ({kriteriaTerpenuhi})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('belum')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    filterStatus === 'belum'
                      ? 'bg-rose-600 text-white shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum ({totalKriteria - kriteriaTerpenuhi})
                </button>
              </div>

              {/* Search Box */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Cari kriteria pemanfaatan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-amber-500 w-52 sm:w-60"
                />
              </div>

              {/* Reset to Default */}
              {canEdit && (
                <button
                  type="button"
                  onClick={handleResetDefault}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-slate-200 transition-colors"
                  title="Kembalikan ke Data Standar Awal"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-3.5 py-3 text-center w-12">No</th>
                  <th className="px-3.5 py-3 w-16 text-center">Kode</th>
                  <th className="px-4 py-3 min-w-[240px]">Pernyataan Standar Kriteria PermenPAN-RB</th>
                  <th className="px-4 py-3 min-w-[280px]">Bentuk Pemanfaatan & Dokumen Evidens</th>
                  <th className="px-4 py-3 min-w-[220px]">Catatan Evaluasi Asesor</th>
                  <th className="px-3.5 py-3 text-center w-28">Skor LKE</th>
                  <th className="px-3.5 py-3 text-center w-28">Aksi Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKriteria.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500 italic">
                      Tidak ada kriteria yang sesuai dengan pencarian atau filter.
                    </td>
                  </tr>
                ) : (
                  filteredKriteria.map((crit) => (
                    <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-3.5 text-center font-bold text-slate-400">
                        {crit.no}
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        <span className="font-mono font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-[11px]">
                          {crit.kodeKriteria}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 leading-snug">{crit.pernyataan}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              crit.skor === 1
                                ? 'text-emerald-800 bg-emerald-50 border border-emerald-200'
                                : 'text-rose-700 bg-rose-50 border border-rose-200'
                            }`}
                          >
                            Status: {crit.statusPemanfaatan}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="text-xs leading-relaxed font-medium text-slate-800">{crit.bentukPemanfaatan}</p>
                        <div className="mt-1 flex items-center gap-1.5 text-indigo-900 font-mono font-semibold text-[11px]">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                          <span>{crit.dokumenEvidens}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {crit.nomorDokumen && (
                            <span className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                              <FileText className="w-3 h-3 text-slate-400" />
                              <span>{crit.nomorDokumen}</span>
                            </span>
                          )}
                          {crit.tanggalPenetapan && (
                            <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              <span>{crit.tanggalPenetapan}</span>
                            </span>
                          )}
                          {crit.linkDakung && (
                            <a
                              href={crit.linkDakung}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 hover:text-amber-900 hover:underline bg-amber-50 border border-amber-200 px-2 py-0.5 rounded"
                            >
                              <ExternalLink className="w-3 h-3" />
                              <span>Buka Berkas</span>
                            </a>
                          )}
                        </div>
                        {crit.unitPenyusun && (
                          <span className="text-[10px] text-slate-400 block mt-1">
                            Unit: {crit.unitPenyusun}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px] leading-relaxed">
                        <p className="italic text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                          {crit.catatanEvaluasi}
                        </p>
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleSkor(crit.id)}
                          disabled={!canEdit}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all ${
                            crit.skor === 1
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                          } ${!canEdit ? 'cursor-default' : 'cursor-pointer'}`}
                          title={canEdit ? 'Klik untuk toggle nilai 1 atau 0' : undefined}
                        >
                          {crit.skor === 1 ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-700" />
                              <span>1 (Ya)</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-rose-700" />
                              <span>0 (Tidak)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="px-3.5 py-3.5 text-center">
                        {canEdit ? (
                          <button
                            type="button"
                            onClick={() => handleOpenModal(crit)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-amber-800 hover:text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Input Bukti</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Lihat Saja</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600 gap-3">
            <div className="flex items-center gap-4">
              <span>
                Total Kriteria: <strong>{totalKriteria}</strong>
              </span>
              <span>
                Dimanfaatkan Penuh: <strong className="text-emerald-700">{kriteriaTerpenuhi}</strong>
              </span>
              <span>
                Belum Optimal: <strong className="text-rose-600">{totalKriteria - kriteriaTerpenuhi}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Bobot Komponen 1.c: {bobot1c.toFixed(2)}</span>
              <span className="font-bold text-slate-900 bg-amber-100/70 border border-amber-200 px-3 py-1 rounded-lg">
                Nilai Sub-Komponen: {nilai1c.toFixed(2)} / {bobot1c.toFixed(2)} ({persenPemenuhan}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: ANGGARAN BERBASIS KINERJA (MONEY FOLLOWS PROGRAM - 1.c.1 & 1.c.2) */}
      {activeTabSub === 'anggaran' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Penerapan Prinsip Money Follows Program (Kriteria 1.c.1 & 1.c.2)</span>
              </h4>
              <p className="text-xs text-emerald-800/80 leading-relaxed max-w-3xl">
                Alokasi Pagu Anggaran DIPA & RBA BLU RSUP Dr. M. Djamil secara eksplisit dikaitkan dengan target masing-masing Sasaran Strategis. Realisasi belanja diukur secara berkala bersamaan dengan capaian indikator kinerja untuk menjamin efisiensi penggunaan dana publik.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900 shadow-2xs shrink-0">
                <span className="block text-[10px] text-emerald-600 uppercase font-extrabold">Total Alokasi Kinerja</span>
                <span className="text-base font-black font-mono">Rp 79,8 Miliar</span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const k1 = kriteriaList.find((k) => k.kodeKriteria === '1.c.1');
                    if (k1) handleOpenModal(k1);
                  }}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Input Bukti Anggaran</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Matriks Keselarasan Anggaran vs Realisasi Belanja vs Capaian Sasaran Strategis
              </h4>
              <span className="text-[11px] text-slate-500 font-mono">TA {selectedYear}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-4 py-3">Sasaran Strategis & Unit Pembina</th>
                    <th className="px-4 py-3 text-right">Pagu Anggaran</th>
                    <th className="px-4 py-3 text-right">Realisasi Anggaran</th>
                    <th className="px-3 py-3 text-center">% Realisasi</th>
                    <th className="px-3 py-3 text-center">Capaian Kinerja</th>
                    <th className="px-4 py-3 text-center">Efisiensi Belanja</th>
                    <th className="px-4 py-3 text-center">Status Money Follows Program</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {anggaranList.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5">
                        <span className="font-mono font-bold text-sky-800 text-[10px] block">{item.kodeSasaran}</span>
                        <p className="font-bold text-slate-900 text-xs">{item.sasaranStrategis}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.unitKerja}</p>
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono font-bold text-slate-800">
                        {formatRupiah(item.paguAnggaran)}
                      </td>
                      <td className="px-4 py-3.5 text-right font-mono text-slate-700">
                        {formatRupiah(item.realisasiAnggaran)}
                      </td>
                      <td className="px-3 py-3.5 text-center font-mono font-bold text-slate-800">
                        {item.persenRealisasiAnggaran}%
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 font-mono font-black text-xs text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {item.capaianKinerjaRata2}%
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-teal-50 text-teal-800 border border-teal-200">
                          {item.efisiensiAnggaran}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Terhubung Penuh</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: PEMANTAUAN DINAMIS RENCANA AKSI (1.c.3 & 1.c.4) */}
      {activeTabSub === 'pemantauan' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Evaluasi keterlaksanaan RTM, monitoring triwulanan, dan early warning system target kinerja
            </p>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  const k4 = kriteriaList.find((k) => k.kodeKriteria === '1.c.4');
                  if (k4) handleOpenModal(k4);
                }}
                className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Input Bukti Pemantauan (1.c.4)</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Card 1: RTM Bulanan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-sm text-slate-900">Rapat Tinjauan Manajemen (RTM)</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Dilaksanakan rutin setiap bulan dipimpin langsung oleh Direktur Utama dan dihadiri seluruh Direktur serta Kepala Satker.
              </p>
              <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 text-xs">
                <span className="font-bold text-sky-900 block">Jadwal RTM Terdekat:</span>
                <span className="text-slate-700">Setiap hari Selasa minggu pertama setiap bulan di Ruang Rapat Pimpinan RSUP.</span>
              </div>
            </div>

            {/* Card 2: Monev Triwulanan */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">Monev Kinerja Triwulanan</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pengukuran realisasi indikator triwulanan menggunakan sistem warna: Hijau (≥100%), Kuning (50-99%), Merah (&lt;50%).
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs">
                <span className="font-bold text-emerald-900 block">Tingkat Capaian Triwulan:</span>
                <span className="text-slate-700">Triwulan I (98.2%), Triwulan II (100.4%), Triwulan III (101.1%).</span>
              </div>
            </div>

            {/* Card 3: Early Warning System */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-2.5">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h4 className="font-bold text-sm text-slate-900">Sistem Peringatan Dini</h4>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Notifikasi otomatis bagi unit kerja yang memiliki indikator dengan realisasi deviasi minus &gt; 10% dari target rencana aksi.
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 text-xs">
                <span className="font-bold text-amber-900 block">Action Plan Korektif:</span>
                <span className="text-slate-700">Wajib menyusun lembar rencana aksi mitigasi dalam waktu maksimal 7 hari kerja.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: PERBAIKAN DOKUMEN & KOMITMEN (1.c.5 - 1.c.8) */}
      {activeTabSub === 'komitmen' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Box 1: Histori Perbaikan Dokumen */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-5 h-5 text-purple-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Penyempurnaan Dokumen Perencanaan (1.c.5 & 1.c.6)
                  </h4>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      const k5 = kriteriaList.find((k) => k.kodeKriteria === '1.c.5');
                      if (k5) handleOpenModal(k5);
                    }}
                    className="text-xs text-purple-700 hover:text-purple-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Input Bukti</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Bukti penyempurnaan dan penyesuaian dokumen perencanaan berdasarkan rekomendasi audit dan evaluasi kinerja:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                  <strong className="text-purple-900 block">1. Addendum Perjanjian Kinerja (PK Perubahan):</strong>
                  <span className="text-slate-600">Penyesuaian target lokus pengampuan nasional akibat percepatan dropping alkes CT-Scan dari Kemenkes.</span>
                </div>
                <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
                  <strong className="text-purple-900 block">2. Review Renstra Menuju Akreditasi JCI:</strong>
                  <span className="text-slate-600">Penyempurnaan formulasi indikator waktu tunggu operasi elektif menjadi di bawah 48 jam.</span>
                </div>
              </div>
            </div>

            {/* Box 2: Komitmen Satker & Pegawai */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Komitmen Unit Kerja & Pegawai (1.c.7 & 1.c.8)
                  </h4>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      const k7 = kriteriaList.find((k) => k.kodeKriteria === '1.c.7');
                      if (k7) handleOpenModal(k7);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Input Bukti</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500">
                Langkah konkret peningkatan komitmen dan kepedulian seluruh jajaran terhadap pencapaian target kinerja:
              </p>
              <div className="space-y-2 text-xs">
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <strong className="text-emerald-900 block">1. Pakta Integritas & Rapat Komitmen Kinerja:</strong>
                  <span className="text-slate-600">Ditandatangani serentak di hadapan Direksi pada awal tahun anggaran oleh seluruh Kepala Instalasi & KSM.</span>
                </div>
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <strong className="text-emerald-900 block">2. Remunerasi Berbasis Capaian SAKIP:</strong>
                  <span className="text-slate-600">Nilai capaian IKU menjadi komponen pengali insentif kinerja bulanan pegawai (merit system).</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL FORM: INPUT & EDIT BUKTI DUKUNG 1.C */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg border border-amber-500/30">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Input & Perbarui Bukti Dukung Pemanfaatan (1.c)
                  </h3>
                  <p className="text-xs text-amber-200/80">
                    Sub-Komponen 1.c: Pemanfaatan Perencanaan Kinerja
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveBuktiDukung} className="p-6 overflow-y-auto space-y-4 text-xs">
              {/* Select Kriteria */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Pilih Kriteria Standar PermenPAN-RB
                </label>
                <select
                  value={editingKriteriaId}
                  onChange={(e) => handleChangeKriteriaSelect(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                >
                  {kriteriaList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kodeKriteria} - {k.pernyataan}
                    </option>
                  ))}
                </select>
                {currentSelectedKriteria && (
                  <div className="mt-2 p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                    <strong>Pernyataan Kriteria {currentSelectedKriteria.kodeKriteria}:</strong>{' '}
                    {currentSelectedKriteria.pernyataan}
                  </div>
                )}
              </div>

              {/* Bentuk Pemanfaatan */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bentuk Pemanfaatan Riil di Rumah Sakit <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Penyusunan RBA & DIPA Satker mendasarkan alokasi belanja langsung pada target 18 IKU..."
                  value={formData.bentukPemanfaatan}
                  onChange={(e) => setFormData({ ...formData, bentukPemanfaatan: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Dokumen Evidens / Bukti Pemanfaatan */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Dokumen Evidens / Bukti Riil <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matriks Sinkronisasi Anggaran Renstra - RBA TA 2025, SOP Verifikasi KAK..."
                  value={formData.dokumenEvidens}
                  onChange={(e) => setFormData({ ...formData, dokumenEvidens: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              {/* Row: Nomor Dokumen & Tanggal Penetapan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nomor Dokumen / SK / BA / Laporan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: SP DIPA-024.04.2.415392/2025"
                    value={formData.nomorDokumen}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tanggal Pengesahan / Penetapan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 29 November 2024"
                    value={formData.tanggalPenetapan}
                    onChange={(e) => setFormData({ ...formData, tanggalPenetapan: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Row: Unit Penyusun & Link Bukti Dukung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Unit Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Direktorat Perencanaan & Keuangan"
                    value={formData.unitPenyusun}
                    onChange={(e) => setFormData({ ...formData, unitPenyusun: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tautan Berkas Digital (Link Google Drive / Cloud)
                  </label>
                  <div className="relative">
                    <Link2 className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      placeholder="https://drive.google.com/..."
                      value={formData.linkDakung}
                      onChange={(e) => setFormData({ ...formData, linkDakung: e.target.value })}
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Status Pemanfaatan & Skor LKE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Status Pemanfaatan
                  </label>
                  <select
                    value={formData.statusPemanfaatan}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        statusPemanfaatan: e.target.value as any,
                        skor: e.target.value === 'Dimanfaatkan Penuh' ? 1 : 0,
                      })
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500 font-semibold"
                  >
                    <option value="Dimanfaatkan Penuh">Dimanfaatkan Penuh</option>
                    <option value="Sebagian Dimanfaatkan">Sebagian Dimanfaatkan</option>
                    <option value="Belum Optimal">Belum Optimal</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Skor LKE (1 = Ya, 0 = Tidak)
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="skor"
                        checked={formData.skor === 1}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            skor: 1,
                            statusPemanfaatan: 'Dimanfaatkan Penuh',
                          })
                        }
                        className="text-amber-600 focus:ring-amber-500"
                      />
                      <span className="font-bold text-emerald-800">1 (Dimanfaatkan / Ya)</span>
                    </label>
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="skor"
                        checked={formData.skor === 0}
                        onChange={() =>
                          setFormData({
                            ...formData,
                            skor: 0,
                            statusPemanfaatan: 'Belum Optimal',
                          })
                        }
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-bold text-rose-800">0 (Belum Optimal / Tidak)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Catatan Evaluasi Asesor */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Evaluasi / Rekomendasi Asesor
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan analisis dampak pemanfaatan atau rekomendasi perbaikan..."
                  value={formData.catatanEvaluasi}
                  onChange={(e) => setFormData({ ...formData, catatanEvaluasi: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Modal Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 font-bold hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan Bukti Pemanfaatan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
