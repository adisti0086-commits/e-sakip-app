import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Network,
  Users,
  Target,
  FileCheck2,
  Search,
  Filter,
  ExternalLink,
  Link2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Check,
  ChevronDown,
  Building2,
  HelpCircle,
  Edit3,
  Plus,
  X,
  Save,
  RotateCcw,
  FileText,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import {
  Kriteria1bItem,
  IndikatorSmartCheck,
  INITIAL_KRITERIA_1B,
  INITIAL_SMART_CHECKS,
} from '../data/perencanaanData';
import { IndikatorPK, OPD, RenstraSasaran, User } from '../types';

interface Perencanaan1bViewProps {
  opdList: OPD[];
  sasaranList?: RenstraSasaran[];
  indikatorList?: IndikatorPK[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

const STORAGE_KEY_KRITERIA_1B = 'sakip_kriteria_1b_v2';

export const Perencanaan1bView: React.FC<Perencanaan1bViewProps> = ({
  opdList = [],
  sasaranList = [],
  indikatorList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'kriteria' | 'smart' | 'cascading' | 'crosscutting'>('kriteria');

  // Kriteria state with local storage persistence
  const [kriteriaList, setKriteriaList] = useState<Kriteria1bItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KRITERIA_1B);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Error loading stored 1b criteria', e);
    }
    return INITIAL_KRITERIA_1B;
  });

  const [smartChecks, setSmartChecks] = useState<IndikatorSmartCheck[]>(INITIAL_SMART_CHECKS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'memenuhi' | 'belum'>('all');

  // Modal State for Inputting / Editing Bukti Dukung
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteriaId, setEditingKriteriaId] = useState<string>('k-1b-1');
  const [formData, setFormData] = useState({
    buktiPendukung: '',
    nomorDokumen: '',
    tanggalPenetapan: '',
    unitPenyusun: '',
    linkDakung: '',
    statusPemenuhan: 'Memenuhi Standar' as 'Memenuhi Standar' | 'Sebagian Memenuhi' | 'Belum Memenuhi',
    skor: 1 as 1 | 0,
    catatanAsesor: '',
  });

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  const bobot1b = 9.0;
  const totalKriteria = kriteriaList.length;
  const kriteriaTerpenuhi = kriteriaList.filter((k) => k.skor === 1).length;
  const persenPemenuhan = totalKriteria > 0 ? Math.round((kriteriaTerpenuhi / totalKriteria) * 100) : 0;
  const nilai1b = Math.round(((persenPemenuhan / 100) * bobot1b) * 100) / 100;

  // Verifikator, Admin, or Unit Operator can input / edit evidence
  const canEdit =
    currentUser.role === 'verifikator' ||
    currentUser.role === 'administrator' ||
    currentUser.role === 'operator_unit';

  const handleToggleSkor = (id: string) => {
    if (!canEdit) return;
    setKriteriaList((prev) => {
      const updated = prev.map((item) => {
        if (item.id === id) {
          const nextSkor: 1 | 0 = item.skor === 1 ? 0 : 1;
          return {
            ...item,
            skor: nextSkor,
            statusPemenuhan: nextSkor === 1 ? 'Memenuhi Standar' : ('Belum Memenuhi' as const),
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY_KRITERIA_1B, JSON.stringify(updated));
      return updated;
    });
    showToast('Skor kriteria berhasil diperbarui.');
  };

  const handleOpenModal = (kriteria: Kriteria1bItem) => {
    setEditingKriteriaId(kriteria.id);
    setFormData({
      buktiPendukung: kriteria.buktiPendukung || '',
      nomorDokumen: kriteria.nomorDokumen || '',
      tanggalPenetapan: kriteria.tanggalPenetapan || '',
      unitPenyusun: kriteria.unitPenyusun || '',
      linkDakung: kriteria.linkDakung || '',
      statusPemenuhan: kriteria.statusPemenuhan || 'Memenuhi Standar',
      skor: kriteria.skor,
      catatanAsesor: kriteria.catatanAsesor || '',
    });
    setIsModalOpen(true);
  };

  const handleOpenNewModal = () => {
    const defaultKriteria = kriteriaList[0] || INITIAL_KRITERIA_1B[0];
    handleOpenModal(defaultKriteria);
  };

  const handleChangeKriteriaSelect = (targetId: string) => {
    const found = kriteriaList.find((k) => k.id === targetId);
    if (found) {
      setEditingKriteriaId(targetId);
      setFormData({
        buktiPendukung: found.buktiPendukung || '',
        nomorDokumen: found.nomorDokumen || '',
        tanggalPenetapan: found.tanggalPenetapan || '',
        unitPenyusun: found.unitPenyusun || '',
        linkDakung: found.linkDakung || '',
        statusPemenuhan: found.statusPemenuhan || 'Memenuhi Standar',
        skor: found.skor,
        catatanAsesor: found.catatanAsesor || '',
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
            buktiPendukung: formData.buktiPendukung,
            nomorDokumen: formData.nomorDokumen,
            tanggalPenetapan: formData.tanggalPenetapan,
            unitPenyusun: formData.unitPenyusun,
            linkDakung: formData.linkDakung,
            statusPemenuhan: formData.statusPemenuhan,
            skor: formData.skor,
            catatanAsesor: formData.catatanAsesor,
          };
        }
        return item;
      });
      localStorage.setItem(STORAGE_KEY_KRITERIA_1B, JSON.stringify(updated));
      return updated;
    });
    setIsModalOpen(false);
    showToast('Bukti pendukung kriteria 1.b berhasil disimpan!');
  };

  const handleResetDefault = () => {
    if (window.confirm('Kembalikan seluruh data kriteria dan bukti dukung 1.b ke kondisi awal?')) {
      setKriteriaList(INITIAL_KRITERIA_1B);
      localStorage.setItem(STORAGE_KEY_KRITERIA_1B, JSON.stringify(INITIAL_KRITERIA_1B));
      showToast('Data kriteria 1.b dikembalikan ke standar awal.');
    }
  };

  const currentSelectedKriteria = kriteriaList.find((k) => k.id === editingKriteriaId);

  const filteredKriteria = kriteriaList.filter((item) => {
    // Filter status
    if (filterStatus === 'memenuhi' && item.skor !== 1) return false;
    if (filterStatus === 'belum' && item.skor !== 0) return false;

    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.kodeKriteria.toLowerCase().includes(term) ||
      item.pernyataan.toLowerCase().includes(term) ||
      item.buktiPendukung.toLowerCase().includes(term) ||
      (item.nomorDokumen && item.nomorDokumen.toLowerCase().includes(term)) ||
      (item.unitPenyusun && item.unitPenyusun.toLowerCase().includes(term)) ||
      item.catatanAsesor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300 relative">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-teal-500/40 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-teal-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* 1. HEADER STATISTIK KOMPONEN 1.B */}
      <div className="bg-gradient-to-r from-teal-900 via-sky-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-teal-500/30 text-teal-200 border border-teal-400/30 text-xs font-black tracking-wider uppercase">
                Sub-Komponen 1.b LKE SAKIP
              </span>
              <span className="text-xs text-teal-200/80 font-medium">PermenPAN-RB No. 88/2021</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Dokumen Perencanaan Memenuhi Standar yang Baik
            </h2>
            <p className="text-sm text-teal-100/90 max-w-3xl leading-relaxed">
              Kualitas rumusan sasaran outcome, pemenuhan kriteria <strong>SMART</strong> indikator kinerja, IKU berkelanjutan, target achievable & menantang, keselarasan <strong>Cascading</strong> berjenjang, hubungan <strong>Crosscutting</strong>, serta penetapan PK unit & SKP pegawai.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">Bobot SAKIP</span>
              <span className="text-2xl font-black text-white font-mono">{bobot1b.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">Nilai Capaian</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">{nilai1b.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[115px]">
              <span className="text-[11px] font-bold text-teal-200 uppercase tracking-wider block">Kriteria Terpenuhi</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{kriteriaTerpenuhi}/{totalKriteria}</span>
              <span className="text-[10px] text-white/80 block font-semibold mt-0.5">({persenPemenuhan}% Kategori A)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs and Top Action Button */}
        <div className="mt-6 pt-4 border-t border-teal-700/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTabSub('kriteria')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'kriteria'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-teal-950/40 text-teal-100 hover:bg-teal-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <span>11 Kriteria Standar Kualitas (1.b.1 - 1.b.11)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('smart')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'smart'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-teal-950/40 text-teal-100 hover:bg-teal-800/60'
              }`}
            >
              <Target className="w-4 h-4 text-sky-500" />
              <span>Pengujian Standar SMART & IKU (1.b.5 - 1.b.7)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('cascading')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'cascading'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-teal-950/40 text-teal-100 hover:bg-teal-800/60'
              }`}
            >
              <Network className="w-4 h-4 text-amber-500" />
              <span>Pohon Kinerja / Cascading (1.b.8)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('crosscutting')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'crosscutting'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-teal-950/40 text-teal-100 hover:bg-teal-800/60'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-500" />
              <span>Crosscutting & Kinerja Pegawai (1.b.9 - 1.b.11)</span>
            </button>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleOpenNewModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Input Bukti Pendukung</span>
            </button>
          )}
        </div>
      </div>

      {/* SUB-VIEW 1: TABEL 11 KRITERIA LKE */}
      {activeTabSub === 'kriteria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Filter, Search & Action Bar */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Pemenuhan 11 Kriteria Standar Kualitas Perencanaan Kinerja (Sub-Komponen 1.b)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Checklist parameter legalitas, formalisasi, rumusan outcome, SMART, cascading, dan publikasi
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
                  Memenuhi ({kriteriaTerpenuhi})
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
                  placeholder="Cari kriteria / bukti..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-teal-500 w-52 sm:w-60"
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
                  <th className="px-4 py-3 min-w-[280px]">Bukti Pendukung / Regulasi RSUP</th>
                  <th className="px-4 py-3 min-w-[220px]">Catatan Asesor Evaluasi</th>
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
                        <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px]">
                          {crit.kodeKriteria}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="font-bold text-slate-900 leading-snug">{crit.pernyataan}</p>
                        <div className="mt-1 flex items-center gap-2">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                              crit.skor === 1
                                ? 'text-teal-800 bg-teal-50 border border-teal-200'
                                : 'text-rose-700 bg-rose-50 border border-rose-200'
                            }`}
                          >
                            Status: {crit.statusPemenuhan}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="text-xs leading-relaxed font-medium text-slate-800">{crit.buktiPendukung}</p>

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
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-700 hover:text-teal-900 hover:underline bg-teal-50 border border-teal-200 px-2 py-0.5 rounded"
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
                          {crit.catatanAsesor}
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
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
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
                Terpenuhi: <strong className="text-emerald-700">{kriteriaTerpenuhi}</strong>
              </span>
              <span>
                Belum: <strong className="text-rose-600">{totalKriteria - kriteriaTerpenuhi}</strong>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">Bobot Komponen 1.b: {bobot1b.toFixed(2)}</span>
              <span className="font-bold text-slate-900 bg-teal-100/70 border border-teal-200 px-3 py-1 rounded-lg">
                Nilai Sub-Komponen: {nilai1b.toFixed(2)} / {bobot1b.toFixed(2)} ({persenPemenuhan}%)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: PENGUJIAN STANDAR SMART (1.b.5 - 1.b.7) */}
      {activeTabSub === 'smart' && (
        <div className="space-y-4">
          <div className="bg-sky-50 border border-sky-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-sky-950 flex items-center gap-2">
                <Target className="w-4 h-4 text-sky-600" />
                <span>Kaidah Penilaian Indikator SMART RSUP Dr. M. Djamil (Kriteria 1.b.5 - 1.b.7)</span>
              </h4>
              <p className="text-xs text-sky-800/80 leading-relaxed max-w-3xl">
                Setiap indikator kinerja wajib memenuhi 5 pilar kriteria: <strong>S</strong> (Specific - tidak ambigu), <strong>M</strong> (Measurable - dapat dihitung dengan satuan), <strong>A</strong> (Achievable - dapat dicapai), <strong>R</strong> (Relevant - selaras tugas RS), dan <strong>T</strong> (Time-Bound - memiliki periode waktu jelas).
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-sky-200 text-xs font-bold text-sky-900 shadow-2xs shrink-0">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>100% Indikator Lolos SMART</span>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const k5 = kriteriaList.find((k) => k.kodeKriteria === '1.b.5');
                    if (k5) handleOpenModal(k5);
                  }}
                  className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Input Bukti SMART</span>
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Matriks Pengujian SMART 18 Indikator Kinerja Utama
              </h4>
              <span className="text-[11px] text-slate-500 font-medium">Standar PermenPAN-RB No. 88/2021</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-4 py-3">Indikator Kinerja</th>
                    <th className="px-3 py-3">Sasaran Strategis & PJ</th>
                    <th className="px-2 py-3 text-center">Specific</th>
                    <th className="px-2 py-3 text-center">Measurable</th>
                    <th className="px-2 py-3 text-center">Achievable</th>
                    <th className="px-2 py-3 text-center">Relevant</th>
                    <th className="px-2 py-3 text-center">Time-bound</th>
                    <th className="px-3 py-3 text-center">Tipe</th>
                    <th className="px-4 py-3">Justifikasi Pengujian SMART</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {smartChecks.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3.5 font-bold text-slate-900 max-w-[240px]">
                        <span className="text-[10px] text-sky-700 font-mono block">{item.kodeIndikator}</span>
                        <span>{item.namaIndikator}</span>
                      </td>
                      <td className="px-3 py-3.5 text-slate-600 max-w-[200px]">
                        <p className="text-[11px] font-semibold text-slate-800">{item.sasaranStrategis}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">PJ: {item.penanggungJawab}</p>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          ✓
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          ✓
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          ✓
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          ✓
                        </span>
                      </td>
                      <td className="px-2 py-3.5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 font-black text-[11px]">
                          ✓
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center">
                        <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-extrabold text-[10px] border border-sky-200">
                          {item.tipeIndikator}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 text-[11px] max-w-[250px] leading-relaxed">
                        {item.justifikasiSMART}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: POHON KINERJA & CASCADING (1.b.8) */}
      {activeTabSub === 'cascading' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Network className="w-5 h-5 text-amber-600" />
                  <span>Pohon Kinerja & Matriks Cascading Kinerja Berjenjang (Kriteria 1.b.8)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-3xl">
                  Penjabaran keselarasan hasil dari level <strong>Direktur Utama</strong> (Ultimate Outcome) diturunkan ke level <strong>Direktur Bidang</strong> (Intermediate Outcome), <strong>Ketua Tim/KSM/Instalasi</strong> (Immediate Outcome / Output), hingga target kinerja individu <strong>Staf Pelaksana</strong>.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    const k8 = kriteriaList.find((k) => k.kodeKriteria === '1.b.8');
                    if (k8) handleOpenModal(k8);
                  }}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-2xs cursor-pointer flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Input Bukti Cascading (1.b.8)</span>
                </button>
              )}
            </div>

            {/* Visual Tree */}
            <div className="mt-6 space-y-4">
              {/* Level 1: Direktur Utama */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-sky-900 to-indigo-900 text-white shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-sky-100">
                    Level 1: Direktur Utama (Eselon II.a) • Ultimate Outcome
                  </span>
                  <span className="text-xs font-mono font-bold text-sky-200">Perjanjian Kinerja Menkes RI</span>
                </div>
                <h5 className="font-bold text-sm mt-2">
                  Terwujudnya RSUP Dr. M. Djamil Padang sebagai Pusat Rujukan Nasional Berkualitas Internasional
                </h5>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-sky-100">
                  <span className="bg-sky-950/60 px-2 py-1 rounded border border-sky-700/50">
                    IKU 1: Skor Kepuasan Pasien (CSAT 90.64)
                  </span>
                  <span className="bg-sky-950/60 px-2 py-1 rounded border border-sky-700/50">
                    IKU 2: Capaian Lokus Pengampuan KJSU (73.75%)
                  </span>
                  <span className="bg-sky-950/60 px-2 py-1 rounded border border-sky-700/50">
                    IKU 3: Cost Recovery Rate BLU (84.5%)
                  </span>
                </div>
              </div>

              {/* Direct Downward Arrows */}
              <div className="flex justify-around text-slate-400 font-bold text-xs py-1">
                <span>↓ Direct Cascading</span>
                <span>↓ Direct Cascading</span>
                <span>↓ Direct Cascading</span>
                <span>↓ Direct Cascading</span>
              </div>

              {/* Level 2: 4 Direktorat (Eselon III) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="p-3.5 rounded-xl border border-sky-200 bg-sky-50/60">
                  <span className="text-[10px] font-bold text-sky-800 block">Direktorat Layanan Operasional</span>
                  <h6 className="font-bold text-xs text-slate-900 mt-1">Efisiensi Layanan & CSAT</h6>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Waktu tunggu farmasi, antrean poliklinik terpadu, dan fasilitas kenyamanan pasien.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-teal-200 bg-teal-50/60">
                  <span className="text-[10px] font-bold text-teal-800 block">Direktorat Medik & Keperawatan</span>
                  <h6 className="font-bold text-xs text-slate-900 mt-1">Mutu Klinis & Pengampuan</h6>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Operasi bypass jantung, radioterapi kanker, trombolisis stroke, dan akreditasi RS.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/60">
                  <span className="text-[10px] font-bold text-amber-800 block">Direktorat Ren & Keuangan</span>
                  <h6 className="font-bold text-xs text-slate-900 mt-1">Tata Kelola & Likuiditas BLU</h6>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Cost recovery rate, percepatan klaim BPJS, efisiensi anggaran belanja operasional.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl border border-purple-200 bg-purple-50/60">
                  <span className="text-[10px] font-bold text-purple-800 block">Direktorat SDM, Dik & Lit</span>
                  <h6 className="font-bold text-xs text-slate-900 mt-1">Uji Klinis & Kompetensi</h6>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Penelitian Clinical Research Unit (CRU), fellowship dokter spesialis, akreditasi diklat.
                  </p>
                </div>
              </div>

              {/* Level 3: Unit Kerja / Instalasi & KSM */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                  Level 3: Kepala Instalasi, Ketua Tim Kerja & KSM (Eselon IV / Non-Struktural)
                </span>
                <p className="text-xs text-slate-700 leading-relaxed">
                  24 Instalasi Pelayanan (IGD, Rawat Inap, Farmasi, Laboratorium, Radiologi), 16 Kelompok Staf Medis (KSM Bedah, Penyakit Dalam, Jantung, Anak, dll), serta 6 Bagian Tata Usaha menetapkan PK Unit Kerja selaras dengan target indikator direktorat pembina.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: CROSSCUTTING & KINERJA PEGAWAI (1.b.9 - 1.b.11) */}
      {activeTabSub === 'crosscutting' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Crosscutting Matrix */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Matriks Hubungan Lintas Fungsi (Crosscutting - 1.b.9)
                  </h4>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      const k9 = kriteriaList.find((k) => k.kodeKriteria === '1.b.9');
                      if (k9) handleOpenModal(k9);
                    }}
                    className="text-xs text-indigo-700 hover:text-indigo-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Input Bukti</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Keterkaitan sasaran strategis dengan kolaborasi multi-disiplin di RSUP Dr. M. Djamil:
              </p>
              <div className="space-y-2.5 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-sky-800 block mb-0.5">1. Pelayanan Kateterisasi Jantung (Cath Lab):</strong>
                  <span className="text-slate-600">Kolaborasi KSM Jantung + Instalasi Farmasi (BMHP Stent) + Bagian Keuangan (Klaim INA-CBGs) + Bagian Sarpras Alkes.</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-teal-800 block mb-0.5">2. Pengampuan Nasional RS Jejaring:</strong>
                  <span className="text-slate-600">Kolaborasi Dokter Subspesialis + Tim IT (Telemedicine Kemenkes) + Bagian SDM & Diklat (Proctoring Fellowship).</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <strong className="text-amber-800 block mb-0.5">3. Digitalisasi Rekam Medis (RME):</strong>
                  <span className="text-slate-600">Kolaborasi Instalasi SIMRS + Seluruh Dokter DPJP + Perawat + Rekam Medis + BPJS Center.</span>
                </div>
              </div>
            </div>

            {/* Kepatuhan PK Unit & SKP Pegawai */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    Perencanaan Kinerja Unit & SKP Pegawai (1.b.10 & 1.b.11)
                  </h4>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      const k10 = kriteriaList.find((k) => k.kodeKriteria === '1.b.10');
                      if (k10) handleOpenModal(k10);
                    }}
                    className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Input Bukti PK/SKP</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Tingkat kepatuhan penetapan dokumen PK Unit dan SKP Pegawai tahun berjalan:
              </p>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-emerald-900">Kepatuhan PK Unit Kerja (1.b.10)</span>
                    <span className="font-mono font-black text-emerald-800 text-xs">100% (46/46 Satker)</span>
                  </div>
                  <div className="w-full h-2 bg-emerald-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: '100%' }} />
                  </div>
                  <span className="text-[10px] text-emerald-700 mt-1 block">
                    Seluruh 4 Direktorat, 24 Instalasi, 16 KSM, dan 6 Bagian telah menetapkan PK Unit.
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-sky-900">Penetapan SKP Pegawai SIASN (1.b.11)</span>
                    <span className="font-mono font-black text-sky-800 text-xs">99.8% (2.834/2.840 Pegawai)</span>
                  </div>
                  <div className="w-full h-2 bg-sky-200 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full" style={{ width: '99.8%' }} />
                  </div>
                  <span className="text-[10px] text-sky-700 mt-1 block">
                    Terintegrasi dengan aplikasi e-Kinerja BKN / SIASN Kemenkes untuk ASN & BLU.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MODAL FORM: INPUT & EDIT BUKTI DUKUNG 1.B */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-teal-500/20 text-teal-400 rounded-lg border border-teal-500/30">
                  <FileCheck2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-base">
                    Input & Perbarui Bukti Dukung Kriteria 1.b
                  </h3>
                  <p className="text-xs text-teal-200/80">
                    Sub-Komponen 1.b: Standar Kualitas Perencanaan Kinerja
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
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-medium"
                >
                  {kriteriaList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.kodeKriteria} - {k.pernyataan}
                    </option>
                  ))}
                </select>
                {currentSelectedKriteria && (
                  <div className="mt-2 p-2.5 bg-teal-50/70 border border-teal-200 rounded-xl text-teal-900 text-[11px] leading-relaxed">
                    <strong>Pernyataan Kriteria {currentSelectedKriteria.kodeKriteria}:</strong>{' '}
                    {currentSelectedKriteria.pernyataan}
                  </div>
                )}
              </div>

              {/* Bukti Pendukung / Evidens */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Bukti Pendukung / Regulasi RSUP <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="Contoh: Dokumen Renstra RSUP 2025-2029, Buku Kamus Indikator SMART, SK Penetapan IKU..."
                  value={formData.buktiPendukung}
                  onChange={(e) => setFormData({ ...formData, buktiPendukung: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Row: Nomor Dokumen & Tanggal Penetapan */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Nomor Dokumen / SK / Regulasi
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: HK.02.02/DIRUT/308/2024"
                    value={formData.nomorDokumen}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Tanggal Pengesahan / Penetapan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 Januari 2025"
                    value={formData.tanggalPenetapan}
                    onChange={(e) => setFormData({ ...formData, tanggalPenetapan: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Row: Unit Penyusun & Link Bukti Dukung */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Unit Penyusun / Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Bagian Perencanaan & Anggaran"
                    value={formData.unitPenyusun}
                    onChange={(e) => setFormData({ ...formData, unitPenyusun: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                      className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Row: Status Pemenuhan & Skor LKE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
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
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 font-semibold"
                  >
                    <option value="Memenuhi Standar">Memenuhi Standar</option>
                    <option value="Sebagian Memenuhi">Sebagian Memenuhi</option>
                    <option value="Belum Memenuhi">Belum Memenuhi</option>
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
                            statusPemenuhan: 'Memenuhi Standar',
                          })
                        }
                        className="text-teal-600 focus:ring-teal-500"
                      />
                      <span className="font-bold text-emerald-800">1 (Memenuhi / Ya)</span>
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
                            statusPemenuhan: 'Belum Memenuhi',
                          })
                        }
                        className="text-rose-600 focus:ring-rose-500"
                      />
                      <span className="font-bold text-rose-800">0 (Belum / Tidak)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Catatan Asesor Evaluasi */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Catatan Asesor / Evaluator Internal SAKIP
                </label>
                <textarea
                  rows={2}
                  placeholder="Catatan verifikasi atau rekomendasi kelengkapan dokumen..."
                  value={formData.catatanAsesor}
                  onChange={(e) => setFormData({ ...formData, catatanAsesor: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-500"
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
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
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
