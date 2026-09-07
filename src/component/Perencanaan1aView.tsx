import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Award,
  FileText,
  Search,
  Check,
  Edit3,
  Plus,
  X,
  Building2,
  Calendar,
  FileSpreadsheet,
  ExternalLink,
  Link2,
  RotateCcw,
  Clock,
  Layers,
  Sparkles,
  FileCheck2,
  CheckCheck,
  Save,
} from 'lucide-react';
import {
  Kriteria1aItem,
  DokumenPerencanaan1a,
  INITIAL_KRITERIA_1A,
  INITIAL_DOKUMEN_1A,
} from '../data/perencanaanData';
import { OPD, User } from '../types';

interface Perencanaan1aViewProps {
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

const STORAGE_KEY_KRITERIA = 'sakip_kriteria_1a_v2';
const STORAGE_KEY_DOKUMEN = 'sakip_dokumen_1a_v2';

export const Perencanaan1aView: React.FC<Perencanaan1aViewProps> = ({
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [activeTabSub, setActiveTabSub] = useState<'kriteria' | 'dokumen' | 'legalitas' | 'siklus'>('kriteria');

  // Load criteria state from localStorage if available
  const [kriteriaList, setKriteriaList] = useState<Kriteria1aItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_KRITERIA);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_KRITERIA_1A;
  });

  // Load document inventory state from localStorage if available
  const [inventarisList, setInventarisList] = useState<DokumenPerencanaan1a[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DOKUMEN);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_DOKUMEN_1A;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'memenuhi' | 'belum'>('all');
  const [saveToast, setSaveToast] = useState<string | null>(null);

  // Modal State for Inputting / Editing Bukti Dukung
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingKriteria, setEditingKriteria] = useState<Kriteria1aItem | null>(null);
  const [formData, setFormData] = useState<Partial<Kriteria1aItem>>({
    kodeKriteria: '1.a.1',
    pernyataan: '',
    buktiPendukung: '',
    nomorDokumen: '',
    catatanAsesor: '',
    linkDakung: '',
    tanggalPenetapan: '',
    unitPenyusun: 'Bagian Perencanaan dan Anggaran',
    statusPemenuhan: 'Memenuhi Standar',
    skor: 1,
  });

  // Save to localStorage whenever kriteriaList or inventarisList changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_KRITERIA, JSON.stringify(kriteriaList));
    } catch {
      // ignore
    }
  }, [kriteriaList]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_DOKUMEN, JSON.stringify(inventarisList));
    } catch {
      // ignore
    }
  }, [inventarisList]);

  const bobot1a = 6.0;
  const totalKriteria = kriteriaList.length;
  const kriteriaTerpenuhi = kriteriaList.filter((k) => k.skor === 1).length;
  const persenPemenuhan = totalKriteria > 0 ? Math.round((kriteriaTerpenuhi / totalKriteria) * 100) : 0;
  const nilai1a = Math.round(((persenPemenuhan / 100) * bobot1a) * 100) / 100;

  const canEdit = currentUser.role === 'verifikator' || currentUser.role === 'administrator' || currentUser.role === 'operator_unit';

  // Toggle skor 1/0 directly from table
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

    // Also sync with inventaris
    const crit = kriteriaList.find((c) => c.id === id);
    if (crit) {
      setInventarisList((prev) =>
        prev.map((doc) => {
          if (doc.kodeKriteria === crit.kodeKriteria) {
            return {
              ...doc,
              skorLKE: crit.skor === 1 ? 0 : 1,
              statusKetersediaan: crit.skor === 1 ? 'Belum Tersedia' : 'Tersedia Lengkap',
            };
          }
          return doc;
        })
      );
    }

    showToast('Skor kriteria berhasil diperbarui!');
  };

  // Open modal to input or edit evidence
  const handleOpenEditModal = (kriteria: Kriteria1aItem) => {
    setEditingKriteria(kriteria);
    setFormData({
      ...kriteria,
    });
    setIsModalOpen(true);
  };

  // Open modal for new input
  const handleOpenNewModal = () => {
    const defaultCrit = kriteriaList[0];
    setEditingKriteria(defaultCrit);
    setFormData({
      kodeKriteria: defaultCrit.kodeKriteria,
      pernyataan: defaultCrit.pernyataan,
      buktiPendukung: '',
      nomorDokumen: '',
      catatanAsesor: '',
      linkDakung: '',
      tanggalPenetapan: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      unitPenyusun: 'Bagian Perencanaan dan Anggaran',
      statusPemenuhan: 'Memenuhi Standar',
      skor: 1,
    });
    setIsModalOpen(true);
  };

  // Save changes from modal
  const handleSaveBuktiDukung = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.kodeKriteria) return;

    setKriteriaList((prev) =>
      prev.map((item) => {
        if (item.kodeKriteria === formData.kodeKriteria) {
          return {
            ...item,
            buktiPendukung: formData.buktiPendukung || item.buktiPendukung,
            nomorDokumen: formData.nomorDokumen || item.nomorDokumen,
            catatanAsesor: formData.catatanAsesor || item.catatanAsesor,
            linkDakung: formData.linkDakung || item.linkDakung,
            tanggalPenetapan: formData.tanggalPenetapan || item.tanggalPenetapan,
            unitPenyusun: formData.unitPenyusun || item.unitPenyusun,
            statusPemenuhan: (formData.statusPemenuhan as any) || item.statusPemenuhan,
            skor: formData.skor !== undefined ? formData.skor : item.skor,
          };
        }
        return item;
      })
    );

    // Also update corresponding inventaris list
    setInventarisList((prev) =>
      prev.map((doc) => {
        if (doc.kodeKriteria === formData.kodeKriteria) {
          return {
            ...doc,
            namaDokumen: formData.buktiPendukung || doc.namaDokumen,
            nomorSK: formData.nomorDokumen || doc.nomorSK,
            tanggalPengesahan: formData.tanggalPenetapan || doc.tanggalPengesahan,
            unitPenyusun: formData.unitPenyusun || doc.unitPenyusun,
            linkDakung: formData.linkDakung || doc.linkDakung,
            skorLKE: formData.skor !== undefined ? formData.skor : doc.skorLKE,
            statusKetersediaan: formData.skor === 1 ? 'Tersedia Lengkap' : 'Belum Tersedia',
          };
        }
        return doc;
      })
    );

    setIsModalOpen(false);
    showToast(`Bukti dukung untuk kriteria ${formData.kodeKriteria} berhasil disimpan!`);
  };

  // Reset to default data
  const handleResetData = () => {
    if (window.confirm('Kembalikan data bukti dukung kriteria 1.a ke data standar awal?')) {
      setKriteriaList(INITIAL_KRITERIA_1A);
      setInventarisList(INITIAL_DOKUMEN_1A);
      localStorage.removeItem(STORAGE_KEY_KRITERIA);
      localStorage.removeItem(STORAGE_KEY_DOKUMEN);
      showToast('Data berhasil dikembalikan ke standar awal.');
    }
  };

  const showToast = (msg: string) => {
    setSaveToast(msg);
    setTimeout(() => {
      setSaveToast(null);
    }, 3500);
  };

  // Filtered criteria
  const filteredKriteria = kriteriaList.filter((item) => {
    if (filterStatus === 'memenuhi' && item.skor !== 1) return false;
    if (filterStatus === 'belum' && item.skor !== 0) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.kodeKriteria.toLowerCase().includes(term) ||
      item.pernyataan.toLowerCase().includes(term) ||
      item.buktiPendukung.toLowerCase().includes(term) ||
      item.nomorDokumen.toLowerCase().includes(term) ||
      item.catatanAsesor.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-teal-500/40 flex items-center gap-2.5 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span className="text-xs font-semibold">{saveToast}</span>
        </div>
      )}

      {/* 1. HEADER STATISTIK KOMPONEN 1.A (SERUPA 1.B & 1.C) */}
      <div className="bg-gradient-to-r from-sky-900 via-teal-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-sky-500/30 text-sky-200 border border-sky-400/30 text-xs font-black tracking-wider uppercase">
                Sub-Komponen 1.a LKE SAKIP
              </span>
              <span className="text-xs text-sky-200/80 font-medium">PermenPAN-RB No. 88/2021</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Dokumen Perencanaan Kinerja Telah Tersedia
            </h2>
            <p className="text-sm text-sky-100/90 max-w-3xl leading-relaxed">
              Keberadaan dokumen perencanaan jangka panjang (<strong>RSB 2045</strong>), jangka menengah (<strong>Renstra 2025–2029</strong>), jangka pendek (<strong>RKT & PK</strong>), rencana aktivitas pendukung (<strong>RBA & KAK</strong>), rencana anggaran (<strong>DIPA & Pagu Kinerja</strong>), serta formalisasi penetapan berjenjang di RSUP Dr. M. Djamil Padang.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Bobot SAKIP</span>
              <span className="text-2xl font-black text-white font-mono">{bobot1a.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[105px]">
              <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Nilai Capaian</span>
              <span className="text-2xl font-black text-emerald-300 font-mono">{nilai1a.toFixed(2)}</span>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 text-center min-w-[115px]">
              <span className="text-[11px] font-bold text-sky-200 uppercase tracking-wider block">Kriteria Terpenuhi</span>
              <span className="text-2xl font-black text-amber-300 font-mono">{kriteriaTerpenuhi}/{totalKriteria}</span>
              <span className="text-[10px] text-white/80 block font-semibold mt-0.5">({persenPemenuhan}% Kategori A)</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs (Sub-Tabs Serupa 1.b & 1.c) */}
        <div className="mt-6 pt-4 border-t border-sky-700/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTabSub('kriteria')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'kriteria'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-sky-950/40 text-sky-100 hover:bg-sky-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-teal-500" />
              <span>6 Kriteria Standar Pemenuhan (1.a.1 - 1.a.6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('dokumen')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'dokumen'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-sky-950/40 text-sky-100 hover:bg-sky-800/60'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-sky-400" />
              <span>Inventaris 6 Berkas Perencanaan Wajib</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('legalitas')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'legalitas'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-sky-950/40 text-sky-100 hover:bg-sky-800/60'
              }`}
            >
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Formalisasi & Penetapan Berjenjang (1.a.6)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTabSub('siklus')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTabSub === 'siklus'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-sky-950/40 text-sky-100 hover:bg-sky-800/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Siklus & Waktu Penetapan Dokumen</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <button
                type="button"
                onClick={handleOpenNewModal}
                className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md cursor-pointer transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Input Bukti Pendukung</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: TABEL 6 KRITERIA STANDAR DENGAN INPUT BUKTI DUKUNG */}
      {activeTabSub === 'kriteria' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-600" />
                <span>Pemenuhan 6 Kriteria Standar Dokumen Perencanaan Kinerja (Sub-Komponen 1.a)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Ketersediaan dokumen RPJP, Renstra, RKT, PK, RBA, DIPA serta kelengkapan bukti pendukung yang dapat diinputkan langsung
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter status */}
              <div className="flex rounded-xl bg-slate-100 p-0.5 border border-slate-200 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setFilterStatus('all')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Semua ({kriteriaList.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('memenuhi')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'memenuhi' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Memenuhi ({kriteriaTerpenuhi})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterStatus('belum')}
                  className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                    filterStatus === 'belum' ? 'bg-rose-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Belum ({totalKriteria - kriteriaTerpenuhi})
                </button>
              </div>

              {/* Search */}
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

              {/* Tombol Reset Data */}
              <button
                type="button"
                onClick={handleResetData}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
                title="Reset ke data awal"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                  <th className="px-4 py-3 text-center w-12">No</th>
                  <th className="px-3 py-3 w-16 text-center">Kode</th>
                  <th className="px-4 py-3 min-w-[280px]">Pernyataan Standar Kriteria PermenPAN-RB</th>
                  <th className="px-4 py-3 min-w-[320px]">Bukti Pendukung / Regulasi RSUP</th>
                  <th className="px-4 py-3 min-w-[240px]">Catatan Asesor Evaluasi</th>
                  <th className="px-3 py-3 text-center w-28">Skor LKE</th>
                  <th className="px-3 py-3 text-center w-28">Aksi Bukti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredKriteria.map((crit) => (
                  <tr key={crit.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3.5 text-center font-bold text-slate-400">
                      {crit.no}
                    </td>
                    <td className="px-3 py-3.5 text-center">
                      <span className="font-mono font-bold text-teal-800 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded text-[11px]">
                        {crit.kodeKriteria}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-slate-900 leading-snug">{crit.pernyataan}</p>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded mt-1.5 inline-block ${
                          crit.skor === 1
                            ? 'text-teal-800 bg-teal-50 border border-teal-200'
                            : 'text-rose-800 bg-rose-50 border border-rose-200'
                        }`}
                      >
                        Status: {crit.statusPemenuhan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700">
                      <p className="text-xs leading-relaxed font-normal text-slate-800">
                        {crit.buktiPendukung || <span className="text-slate-400 italic">Belum diinputkan</span>}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        {crit.nomorDokumen && (
                          <span className="font-mono text-[10px] text-slate-700 bg-slate-100 px-2 py-0.5 rounded font-bold border border-slate-200">
                            Dok: {crit.nomorDokumen}
                          </span>
                        )}
                        {crit.tanggalPenetapan && (
                          <span className="text-[10px] text-slate-500">
                            📅 {crit.tanggalPenetapan}
                          </span>
                        )}
                        {crit.linkDakung && (
                          <a
                            href={crit.linkDakung}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-700 hover:text-sky-900 hover:underline bg-sky-50 px-1.5 py-0.5 rounded border border-sky-200"
                          >
                            <Link2 className="w-3 h-3" />
                            <span>Tautan Berkas</span>
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 text-[11px] italic leading-relaxed">
                      {crit.catatanAsesor || <span className="text-slate-400">Belum ada catatan asesor</span>}
                    </td>
                    <td className="px-3 py-3.5 text-center">
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
                    <td className="px-3 py-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(crit)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-[11px] font-bold transition-colors cursor-pointer shadow-2xs"
                        title="Input / Edit Bukti Dukung & Catatan Asesor"
                      >
                        <Edit3 className="w-3 h-3 text-sky-600" />
                        <span>Input Bukti</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">Total Kriteria 1.a:</span>
              <span className="font-mono font-bold text-slate-900">{totalKriteria} Butir</span>
              <span>•</span>
              <span className="font-semibold text-emerald-700">Terpenuhi: {kriteriaTerpenuhi} Butir</span>
              <span>•</span>
              <span className="font-semibold text-slate-700">Bobot Komponen: {bobot1a.toFixed(2)}</span>
            </div>
            <div className="text-right">
              <span className="font-bold text-slate-800">Nilai Sub-Komponen 1.a: </span>
              <span className="font-mono text-base font-black text-emerald-700">{nilai1a.toFixed(2)}</span>
              <span className="text-slate-500 font-bold ml-1">/ {bobot1a.toFixed(2)} ({persenPemenuhan}%)</span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 2: INVENTARIS 6 BERKAS PERENCANAAN WAJIB */}
      {activeTabSub === 'dokumen' && (
        <div className="space-y-4">
          {/* Overview Grid 6 Dokumen Wajib */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inventarisList.map((dok) => (
              <div
                key={dok.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-50 text-sky-700 border border-sky-200 font-mono font-bold text-[11px]">
                      {dok.kodeKriteria}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        dok.statusKetersediaan === 'Tersedia Lengkap'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>{dok.statusKetersediaan}</span>
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                      {dok.jenisDokumen}
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug mt-0.5">
                      {dok.namaDokumen}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {dok.keterangan}
                  </p>

                  <div className="space-y-1 text-[11px] text-slate-500 pt-1">
                    <div className="flex items-center justify-between">
                      <span>No. Regulasi/SK:</span>
                      <span className="font-mono font-bold text-slate-800">{dok.nomorSK}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Penetapan:</span>
                      <span className="font-semibold text-slate-700">{dok.tanggalPengesahan}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Periode Berlaku:</span>
                      <span className="font-semibold text-slate-700">{dok.periodeBerlaku}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Unit Pengusul:</span>
                      <span className="text-slate-700 truncate max-w-[160px]" title={dok.unitPenyusun}>
                        {dok.unitPenyusun}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  {dok.linkDakung ? (
                    <a
                      href={dok.linkDakung}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 text-xs font-bold border border-sky-200 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Buka Berkas</span>
                    </a>
                  ) : (
                    <span className="text-xs text-slate-400 italic">Belum ada berkas</span>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const crit = kriteriaList.find((k) => k.kodeKriteria === dok.kodeKriteria);
                      if (crit) handleOpenEditModal(crit);
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Perbarui Bukti</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Table View of Inventory */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-sky-600" />
                  <span>Daftar Rinci Berkas Inventaris Dokumen Perencanaan (1.a)</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Arsip dokumen SK Direktur Utama, Renstra, RKT, PK, RBA BLU, dan DIPA Petikan TA {selectedYear}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold uppercase text-[10px] tracking-wider">
                    <th className="px-4 py-3 w-16 text-center">Kode</th>
                    <th className="px-4 py-3">Nama Dokumen Perencanaan</th>
                    <th className="px-3 py-3">Nomor Regulasi / SK</th>
                    <th className="px-3 py-3">Tanggal Penetapan</th>
                    <th className="px-3 py-3">Unit Penyusun</th>
                    <th className="px-3 py-3 text-center">Status</th>
                    <th className="px-3 py-3 text-center">Tautan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventarisList.map((dok) => (
                    <tr key={dok.id} className="hover:bg-slate-50/60">
                      <td className="px-4 py-3 text-center">
                        <span className="font-mono font-bold text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded text-[11px]">
                          {dok.kodeKriteria}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-slate-900 text-xs">{dok.namaDokumen}</p>
                        <span className="text-[10px] text-slate-500 block mt-0.5">{dok.kriteriaLabel}</span>
                      </td>
                      <td className="px-3 py-3 font-mono text-[11px] text-slate-700 font-semibold">
                        {dok.nomorSK || '-'}
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-[11px]">
                        {dok.tanggalPengesahan}
                      </td>
                      <td className="px-3 py-3 text-slate-600 text-[11px]">
                        {dok.unitPenyusun}
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            dok.statusKetersediaan === 'Tersedia Lengkap'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-100 text-amber-800 border border-amber-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{dok.statusKetersediaan}</span>
                        </span>
                      </td>
                      <td className="px-3 py-3 text-center">
                        {dok.linkDakung ? (
                          <a
                            href={dok.linkDakung}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-[11px] border border-sky-200"
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span>Buka</span>
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[10px]">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 3: FORMALISASI & PENETAPAN BERJENJANG (1.a.6) */}
      {activeTabSub === 'legalitas' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600" />
                  <span>Matriks Formalisasi & Penetapan Berjenjang Dokumen Perencanaan (1.a.6)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bukti pemenuhan legalitas penandatanganan Perjanjian Kinerja (PK) dan Dokumen Rencana Aksi secara berjenjang dari Eselon I hingga level unit kerja
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto">
                <CheckCheck className="w-4 h-4 text-emerald-600" />
                <span>Status Legalitas: 100% Ditandatangani</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              {/* Level 1: Dirut & Menkes RI */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase tracking-wider">
                      Tier 1 • Level Instansi / Kemenkes
                    </span>
                    <span className="text-xs font-bold text-emerald-700">10 Januari 2025</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Perjanjian Kinerja (PK) Direktur Utama dengan Menteri Kesehatan RI
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Memuat komitmen pencapaian 18 Indikator Kinerja Utama (IKU) RSUP Dr. M. Djamil, indikator layanan rujukan KJSU, serta efisiensi anggaran BLU.
                  </p>
                  <div className="text-[11px] space-y-1 text-slate-500 pt-2 border-t border-slate-200">
                    <div><strong>Penandatangan:</strong> Direktur Utama & Menkes RI</div>
                    <div><strong>No. Dokumen:</strong> HK.02.03/DIRUT/004/2025</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Telah Disahkan Formal
                  </span>
                  <a
                    href="https://drive.google.com/drive/folders/dakung-rkt-pk-tahunan-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Lihat Berkas
                  </a>
                </div>
              </div>

              {/* Level 2: Dewan Pengawas & Dirut */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px] uppercase tracking-wider">
                      Tier 2 • Pengawasan BLU
                    </span>
                    <span className="text-xs font-bold text-emerald-700">08 Januari 2025</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Pengesahan RBA BLU Definitif oleh Dewan Pengawas
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Pengesahan Rencana Bisnis dan Anggaran (RBA) BLU oleh Dewan Pengawas RSUP Dr. M. Djamil Padang sebagai landasan operasional belanja rumah sakit.
                  </p>
                  <div className="text-[11px] space-y-1 text-slate-500 pt-2 border-t border-slate-200">
                    <div><strong>Penandatangan:</strong> Ketua Dewan Pengawas & Direktur Utama</div>
                    <div><strong>No. Dokumen:</strong> KU.01.01/DEWAS/005/2025</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Telah Disahkan Formal
                  </span>
                  <a
                    href="https://drive.google.com/drive/folders/dakung-rba-poa-aktivitas-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Lihat Berkas
                  </a>
                </div>
              </div>

              {/* Level 3: Dirut & Para Direktur Bidang */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold text-[10px] uppercase tracking-wider">
                      Tier 3 • Level Direksi
                    </span>
                    <span className="text-xs font-bold text-emerald-700">12 Januari 2025</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Perjanjian Kinerja (PK) Direktur Utama dengan Para Direktur Bidang
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Penetapan target kinerja berjenjang untuk 4 Direktorat: Pelayanan Medik & Keperawatan, SDM & Pendidikan, Perencanaan & Keuangan, serta Layanan Operasional.
                  </p>
                  <div className="text-[11px] space-y-1 text-slate-500 pt-2 border-t border-slate-200">
                    <div><strong>Penandatangan:</strong> Dirut & 4 Direktur Bidang</div>
                    <div><strong>No. Dokumen:</strong> BA-PK/DIRUT/004/2025</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 4 dari 4 Ditandatangani
                  </span>
                  <a
                    href="https://drive.google.com/drive/folders/dakung-rkt-pk-tahunan-2025"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Lihat Berkas
                  </a>
                </div>
              </div>

              {/* Level 4: Direktur Bidang & Kepala Unit Kerja */}
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-md bg-teal-100 text-teal-800 font-bold text-[10px] uppercase tracking-wider">
                      Tier 4 • Level Unit / Instalasi / KSM
                    </span>
                    <span className="text-xs font-bold text-emerald-700">15 Januari 2025</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900">
                    Perjanjian Kinerja (PK) Unit Kerja & Instalasi Pelayanan
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Cascading target ke 24 unit kerja operasional (Instalasi Rawat Inap, Rawat Jalan, Bedah Sentral, Laboratorium, Farmasi, ICU, IGD, dan Tim Kerja Teknis).
                  </p>
                  <div className="text-[11px] space-y-1 text-slate-500 pt-2 border-t border-slate-200">
                    <div><strong>Penandatangan:</strong> Direktur Terkait & Seluruh Ka. Instalasi / KSM</div>
                    <div><strong>Total Dokumen:</strong> 24 Berkas Perjanjian Kinerja Unit</div>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 24 dari 24 Unit Lengkap
                  </span>
                  <a
                    href="https://drive.google.com/drive/folders/dakung-pedoman-sakip-djamil"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-700 hover:underline font-bold inline-flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Lihat Berkas
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-VIEW 4: SIKLUS & WAKTU PENETAPAN DOKUMEN PERENCANAAN */}
      {activeTabSub === 'siklus' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600" />
                <span>Siklus Tahunan & Kepatuhan Waktu Penyusunan Dokumen Perencanaan</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Kepatuhan jadwal penetapan regulasi perencanaan kinerja sesuai batas waktu ketentuan PermenPAN-RB No. 88/2021 dan PMK Pengelolaan Keuangan BLU
              </p>
            </div>

            <div className="relative border-l-2 border-teal-500 ml-4 mt-6 space-y-8 pl-6 pb-2">
              {/* Item 1 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                      Tahap 1: Evaluasi & Perumusan Sasaran (T-1)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Oktober 2024</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    Review Capaian Kinerja & Penyusunan Draft RKT / RBA TA {selectedYear}
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Bagian Perencanaan dan Anggaran bersama Komite Medik & Keperawatan menyusun baseline capaian dan proyeksi target pelayanan rumah sakit rujukan.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                      Tahap 2: Pengesahan Anggaran & Alokasi Pagu
                    </span>
                    <span className="text-xs text-slate-500 font-mono">November - Desember 2024</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    Penerbitan DIPA Petikan Satker & Persetujuan RBA oleh Dewas
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Penetapan SP DIPA Kemenkes RI tanggal 29 November 2024 dan pengesahan RBA BLU oleh Dewan Pengawas tanggal 08 Januari 2025.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-teal-500 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Tahap 3: Formalisasi Perjanjian Kinerja (PK)
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Januari 2025 (Tepat Waktu)</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    Penetapan RKT TA {selectedYear} & Penandatanganan PK Berjenjang
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Seluruh dokumen PK ditandatangani sebelum batas akhir 15 Januari 2025, dimulai dari PK Dirut - Menkes (10 Jan) hingga seluruh unit kerja (15 Jan).
                  </p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="relative">
                <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-slate-400 border-4 border-white shadow-xs" />
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Tahap 4: Publikasi & Distribusi Berkas Digital
                    </span>
                    <span className="text-xs text-slate-500 font-mono">Februari 2025 - Berjalan</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 mt-2">
                    Aksesibilitas Dokumen Perencanaan untuk Seluruh Pegawai & Publik
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Seluruh dokumen Renstra, RKT, PK, dan RBA diunggah ke Portal SAKIP RSUP Dr. M. Djamil dan dapat diakses publik secara transparan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INPUT / EDIT BUKTI DUKUNG KRITERIA 1.A */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">
                  Input / Perbarui Bukti Dukung Kriteria {formData.kodeKriteria}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBuktiDukung} className="p-6 space-y-4 text-xs">
              {/* Pilihan Kriteria */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Pilih Kriteria Standar Sub-Komponen 1.a:
                </label>
                <select
                  value={formData.kodeKriteria}
                  onChange={(e) => {
                    const selected = kriteriaList.find((k) => k.kodeKriteria === e.target.value);
                    if (selected) {
                      setFormData({
                        ...formData,
                        kodeKriteria: selected.kodeKriteria,
                        pernyataan: selected.pernyataan,
                        buktiPendukung: selected.buktiPendukung,
                        nomorDokumen: selected.nomorDokumen,
                        catatanAsesor: selected.catatanAsesor,
                        linkDakung: selected.linkDakung,
                        statusPemenuhan: selected.statusPemenuhan,
                        skor: selected.skor,
                      });
                    }
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                >
                  {kriteriaList.map((k) => (
                    <option key={k.kodeKriteria} value={k.kodeKriteria}>
                      {k.kodeKriteria} - {k.pernyataan}
                    </option>
                  ))}
                </select>
              </div>

              {/* Bukti Pendukung / Regulasi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Bukti Pendukung / Regulasi RSUP yang Diinputkan: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Contoh: Rencana Strategis Bisnis (RSB) Jangka Panjang RSUP Dr. M. Djamil Padang Menuju Top Asia 2045..."
                  value={formData.buktiPendukung || ''}
                  onChange={(e) => setFormData({ ...formData, buktiPendukung: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-900 leading-relaxed"
                />
              </div>

              {/* Nomor Dokumen & Tanggal */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nomor Dokumen / SK Pengesahan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: HK.02.02/DIRUT/308/2024"
                    value={formData.nomorDokumen || ''}
                    onChange={(e) => setFormData({ ...formData, nomorDokumen: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Tanggal Pengesahan / Penetapan:
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: 10 Januari 2025"
                    value={formData.tanggalPenetapan || ''}
                    onChange={(e) => setFormData({ ...formData, tanggalPenetapan: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>
              </div>

              {/* Unit Penyusun & Link Dokumen */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Unit Penyusun / Penanggung Jawab:
                  </label>
                  <input
                    type="text"
                    placeholder="Bagian Perencanaan dan Anggaran"
                    value={formData.unitPenyusun || ''}
                    onChange={(e) => setFormData({ ...formData, unitPenyusun: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Link Berkas Digital (Google Drive / Cloud):
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={formData.linkDakung || ''}
                    onChange={(e) => setFormData({ ...formData, linkDakung: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-mono text-slate-900"
                  />
                </div>
              </div>

              {/* Status Pemenuhan & Skor LKE */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Status Pemenuhan Standar:
                  </label>
                  <select
                    value={formData.statusPemenuhan || 'Memenuhi Standar'}
                    onChange={(e) => setFormData({ ...formData, statusPemenuhan: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 font-semibold text-slate-900"
                  >
                    <option value="Memenuhi Standar">Memenuhi Standar</option>
                    <option value="Sebagian Memenuhi">Sebagian Memenuhi</option>
                    <option value="Belum Memenuhi">Belum Memenuhi</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Skor LKE SAKIP:
                  </label>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, skor: 1, statusPemenuhan: 'Memenuhi Standar' })}
                      className={`flex-1 py-1.5 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.skor === 1
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>1 (Ya / Memenuhi)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, skor: 0, statusPemenuhan: 'Belum Memenuhi' })}
                      className={`flex-1 py-1.5 px-3 rounded-xl font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        formData.skor === 0
                          ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>0 (Tidak / Belum)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Catatan Asesor Evaluasi */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Catatan Asesor Evaluasi:
                </label>
                <textarea
                  rows={2}
                  placeholder="Masukkan catatan penilaian kepatuhan, keabsahan dokumen, atau rekomendasi..."
                  value={formData.catatanAsesor || ''}
                  onChange={(e) => setFormData({ ...formData, catatanAsesor: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 text-slate-900"
                />
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold shadow-md cursor-pointer flex items-center gap-1.5"
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
