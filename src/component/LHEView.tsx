import React, { useState } from 'react';
import {
  FileCheck2,
  Upload,
  Edit2,
  Trash2,
  Plus,
  Search,
  Building2,
  Award,
  CheckCircle2,
  AlertCircle,
  FileText,
  Printer,
  X,
  Send,
  Eye,
  Check,
  ShieldCheck,
  Info,
  ListPlus,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';
import {
  LHEEvaluation,
  KriteriaLHE,
  OPD,
  User,
  BobotSakip,
} from '../../utils/types';
import { DEFAULT_LHE_KRITERIA, hitungNilaiLHE } from '../../data/initialData';
import { PrintLHEModal } from './PrintLHEModal';

interface LHEViewProps {
  lheList: LHEEvaluation[];
  setLheList: React.Dispatch<React.SetStateAction<LHEEvaluation[]>>;
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  bobotSakip: BobotSakip;
}

export const LHEView: React.FC<LHEViewProps> = ({
  lheList,
  setLheList,
  opdList,
  selectedOpdId,
  selectedYear,
  currentUser,
  bobotSakip,
}) => {
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [searchTerm, setSearchTerm] = useState('');

  // Active LHE for detailed evaluation / viewing
  const [selectedLheId, setSelectedLheId] = useState<string>(
    lheList[0]?.id || ''
  );

  // Modals
  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printLheTarget, setPrintLheTarget] = useState<LHEEvaluation | null>(null);

  // Form State for creating/editing LHE & scoring 1/0
  const [editingLhe, setEditingLhe] = useState<LHEEvaluation | null>(null);
  const [lheForm, setLheForm] = useState<Partial<LHEEvaluation>>({
    nomorSuratLHE: '',
    opdId: opdList[0]?.id || '',
    tahun: selectedYear,
    tanggalEvaluasi: new Date().toISOString().split('T')[0],
    evaluatorNama: currentUser.name,
    status: 'Draft Evaluasi',
    kriteriaList: DEFAULT_LHE_KRITERIA,
    catatanEvaluasiUmum: '',
    rekomendasiPerbaikan: [
      'Menyempurnakan cascading pohon kinerja hingga tingkat staf/pelaksana.',
      'Meningkatkan konsistensi pelaporan capaian bulanan dan bukti dukung valid.',
    ],
  });

  // Upload modal state
  const [uploadTargetLhe, setUploadTargetLhe] = useState<LHEEvaluation | null>(null);
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadFileSize, setUploadFileSize] = useState('1.5 MB');

  // Permissions: Verifikator & Administrator can evaluate & score 1/0
  const canEvaluate =
    currentUser.role === 'verifikator' || currentUser.role === 'administrator';

  const getOpdName = (id: string) => opdList.find((o) => o.id === id)?.nama || id;

  // Filtered LHE List
  const filteredLheList = lheList.filter((lhe) => {
    const matchYear = lhe.tahun === selectedYear;
    let matchOpd = true;
    if (currentUser.role === 'operator_unit') {
      matchOpd = lhe.opdId === currentUser.opdId;
    } else if (filterOpd !== 'all') {
      matchOpd = lhe.opdId === filterOpd;
    }
    const matchSearch =
      lhe.nomorSuratLHE.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getOpdName(lhe.opdId).toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchOpd && matchSearch;
  });

  const activeLhe =
    lheList.find((l) => l.id === selectedLheId) || filteredLheList[0] || lheList[0];

  // Handlers
  const handleOpenCreate = () => {
    setEditingLhe(null);
    const targetOpd =
      currentUser.role === 'operator_unit' ? currentUser.opdId : opdList[0]?.id || '';

    setLheForm({
      nomorSuratLHE: `LHE.700/${String(lheList.length + 41).padStart(3, '0')}/INSP/SAKIP/${selectedYear}`,
      opdId: targetOpd,
      tahun: selectedYear,
      tanggalEvaluasi: new Date().toISOString().split('T')[0],
      evaluatorNama: currentUser.name,
      evaluatorId: currentUser.id,
      status: 'Draft Evaluasi',
      kriteriaList: DEFAULT_LHE_KRITERIA.map((k) => ({ ...k })),
      catatanEvaluasiUmum: 'Hasil evaluasi akuntabilitas kinerja menunjukkan komitmen perangkat daerah dalam peningkatan kualitas perencanaan dan pengukuran kinerja.',
      rekomendasiPerbaikan: [
        'Melakukan sinkronisasi cascading sasaran strategis dengan perjanjian kinerja staf.',
        'Meningkatkan kepatuhan pemenuhan dokumen bukti dukung pada aplikasi E-SAKIP.',
      ],
    });
    setIsEvaluationModalOpen(true);
  };

  const handleOpenEdit = (lhe: LHEEvaluation) => {
    setEditingLhe(lhe);
    setLheForm({ ...lhe, kriteriaList: lhe.kriteriaList.map((k) => ({ ...k })) });
    setIsEvaluationModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Laporan Hasil Evaluasi (LHE) ini?')) {
      setLheList((prev) => prev.filter((l) => l.id !== id));
      if (selectedLheId === id) {
        setSelectedLheId(lheList.find((l) => l.id !== id)?.id || '');
      }
    }
  };

  // Toggle 1/0 scoring on form
  const handleToggleScore = (kriteriaId: string) => {
    if (!lheForm.kriteriaList) return;
    setLheForm((prev) => ({
      ...prev,
      kriteriaList: prev.kriteriaList?.map((k) =>
        k.id === kriteriaId ? { ...k, skor: (k.skor === 1 ? 0 : 1) as 0 | 1 } : k
      ),
    }));
  };

  // Add / Remove Rekomendasi
  const handleAddRekomendasi = () => {
    setLheForm((prev) => ({
      ...prev,
      rekomendasiPerbaikan: [...(prev.rekomendasiPerbaikan || []), ''],
    }));
  };

  const handleUpdateRekomendasi = (idx: number, text: string) => {
    setLheForm((prev) => {
      const list = [...(prev.rekomendasiPerbaikan || [])];
      list[idx] = text;
      return { ...prev, rekomendasiPerbaikan: list };
    });
  };

  const handleRemoveRekomendasi = (idx: number) => {
    setLheForm((prev) => ({
      ...prev,
      rekomendasiPerbaikan: (prev.rekomendasiPerbaikan || []).filter((_, i) => i !== idx),
    }));
  };

  // Save LHE Evaluation
  const handleSaveEvaluation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lheForm.nomorSuratLHE || !lheForm.kriteriaList) return;

    // Recalculate Total Score & Predicate
    const calculated = hitungNilaiLHE(lheForm.kriteriaList, bobotSakip);

    if (editingLhe) {
      const updated: LHEEvaluation = {
        ...editingLhe,
        ...lheForm,
        nilaiTotal: calculated.nilaiTotal,
        predikat: calculated.predikat,
        kategoriPredikat: calculated.kategori,
      } as LHEEvaluation;

      setLheList((prev) => prev.map((l) => (l.id === editingLhe.id ? updated : l)));
      setSelectedLheId(updated.id);
    } else {
      const newLhe: LHEEvaluation = {
        id: `lhe-${Date.now()}`,
        nomorSuratLHE: lheForm.nomorSuratLHE || '',
        opdId: lheForm.opdId || opdList[0]?.id || '',
        tahun: selectedYear,
        tanggalEvaluasi: lheForm.tanggalEvaluasi || new Date().toISOString().split('T')[0],
        evaluatorId: currentUser.id,
        evaluatorNama: lheForm.evaluatorNama || currentUser.name,
        status: (lheForm.status as LHEEvaluation['status']) || 'Selesai Dievaluasi',
        kriteriaList: lheForm.kriteriaList,
        nilaiTotal: calculated.nilaiTotal,
        predikat: calculated.predikat,
        kategoriPredikat: calculated.kategori,
        catatanEvaluasiUmum: lheForm.catatanEvaluasiUmum || '',
        rekomendasiPerbaikan: (lheForm.rekomendasiPerbaikan || []).filter((r) => r.trim() !== ''),
        dokumenLHENama: `LHE_SAKIP_${selectedYear}.pdf`,
        ukuranFile: '2.1 MB',
      };

      setLheList((prev) => [newLhe, ...prev]);
      setSelectedLheId(newLhe.id);
    }

    setIsEvaluationModalOpen(false);
    setEditingLhe(null);
  };

  // Upload Dokumen LHE Handler
  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTargetLhe || !uploadFileName) return;

    setLheList((prev) =>
      prev.map((l) =>
        l.id === uploadTargetLhe.id
          ? {
              ...l,
              dokumenLHENama: uploadFileName,
              ukuranFile: uploadFileSize || '1.8 MB',
              dokumenLHEUrl: 'https://cloud.pemda.go.id/lhe/uploaded.pdf',
            }
          : l
      )
    );
    setIsUploadModalOpen(false);
    setUploadTargetLhe(null);
  };

  // Preview score inside form
  const formCalculated = lheForm.kriteriaList
    ? hitungNilaiLHE(lheForm.kriteriaList, bobotSakip)
    : { nilaiTotal: 0, predikat: 'D' as const, kategori: 'Kurang' };

  return (
    <div className="space-y-6">
      {/* Top Filter and Actions */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nomor LHE atau OPD..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
              >
                <option value="all">Semua Unit Kerja (OPD)</option>
                {opdList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {canEvaluate && (
          <button
            type="button"
            onClick={handleOpenCreate}
            className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Buat Evaluasi LHE Baru (1/0)</span>
          </button>
        )}
      </div>

      {/* Main Grid: Left List of LHEs & Right Detailed Evaluation Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: LHE Cards List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daftar LHE ({filteredLheList.length})
            </span>
            <span className="text-[11px] text-slate-500">TA {selectedYear}</span>
          </div>

          {filteredLheList.length === 0 ? (
            <div className="bg-white p-6 rounded-xl border border-slate-200 text-center text-slate-400 text-xs">
              Belum ada Laporan Hasil Evaluasi (LHE) untuk OPD ini.
            </div>
          ) : (
            filteredLheList.map((lhe) => {
              const isSelected = activeLhe?.id === lhe.id;
              return (
                <div
                  key={lhe.id}
                  onClick={() => setSelectedLheId(lhe.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-emerald-50/70 border-emerald-400 shadow-md ring-1 ring-emerald-400'
                      : 'bg-white border-slate-200 hover:bg-slate-50 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-bold text-xs text-slate-900 block leading-tight">
                        {getOpdName(lhe.opdId)}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500 mt-0.5 block">
                        No. {lhe.nomorSuratLHE}
                      </span>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-sm font-black px-2 py-0.5 rounded-lg bg-emerald-600 text-white inline-block">
                        {lhe.predikat}
                      </span>
                      <span className="text-[11px] font-mono font-bold text-slate-700 block mt-0.5">
                        {lhe.nilaiTotal} Poin
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lhe.catatanEvaluasiUmum}
                  </p>

                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">{lhe.tanggalEvaluasi}</span>
                    <div className="flex items-center gap-1">
                      {/* Upload button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadTargetLhe(lhe);
                          setUploadFileName(lhe.dokumenLHENama || `LHE_SAKIP_${getOpdName(lhe.opdId).substring(0, 10)}.pdf`);
                          setIsUploadModalOpen(true);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded"
                        title="Upload / Ganti Dokumen LHE"
                      >
                        <Upload className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit button */}
                      {canEvaluate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenEdit(lhe);
                          }}
                          className="p-1 text-slate-500 hover:text-sky-600 hover:bg-slate-100 rounded"
                          title="Edit Penilaian Lembar Kerja 1/0"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Delete button */}
                      {canEvaluate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(lhe.id);
                          }}
                          className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded"
                          title="Hapus LHE"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Column: Detailed LHE View & 1/0 Checklist Results (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {activeLhe ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              {/* Header of Active LHE */}
              <div className="p-6 bg-slate-900 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px]">
                        LHE SAKIP RESMI
                      </span>
                      <span className="text-xs text-slate-300 font-mono">
                        {activeLhe.nomorSuratLHE}
                      </span>
                    </div>
                    <h2 className="text-lg font-bold text-white tracking-tight">
                      {getOpdName(activeLhe.opdId)}
                    </h2>
                    <p className="text-xs text-slate-300 mt-1">
                      Evaluator: <strong>{activeLhe.evaluatorNama}</strong> • Tanggal:{' '}
                      <strong>{activeLhe.tanggalEvaluasi}</strong>
                    </p>
                  </div>

                  {/* Big Score Card */}
                  <div className="bg-slate-800/90 border border-slate-700 p-3.5 rounded-xl flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Nilai Akuntabilitas
                      </span>
                      <span className="text-2xl font-black text-emerald-400 font-mono">
                        {activeLhe.nilaiTotal}
                      </span>
                      <span className="text-[11px] text-slate-400"> / 100 Poin</span>
                    </div>
                    <div className="pl-3 border-l border-slate-700 text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Predikat
                      </span>
                      <span className="text-2xl font-black px-2.5 py-0.5 rounded-lg bg-emerald-600 text-white inline-block">
                        {activeLhe.predikat}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Top */}
                <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-300">Dokumen File:</span>
                    <span className="text-xs font-semibold text-emerald-300 flex items-center gap-1 font-mono">
                      <FileText className="w-3.5 h-3.5" />
                      {activeLhe.dokumenLHENama || 'LHE_Dokumen.pdf'} ({activeLhe.ukuranFile || '2.1 MB'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setUploadTargetLhe(activeLhe);
                        setUploadFileName(activeLhe.dokumenLHENama || '');
                        setIsUploadModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Upload Dokumen</span>
                    </button>

                    {canEvaluate && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(activeLhe)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Edit Penilaian 1/0</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setPrintLheTarget(activeLhe);
                        setIsPrintModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Cetak Format LHE</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* 1/0 Evaluation Checklist Table */}
              <div className="p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">
                        Lembar Kerja Evaluasi AKIP (Penilaian 1 = Memenuhi / 0 = Belum)
                      </h3>
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      Total {activeLhe.kriteriaList.length} Parameter Evaluasi
                    </span>
                  </div>

                  <div className="mt-4 divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden text-xs">
                    {/* Header */}
                    <div className="bg-slate-100/90 px-4 py-3 font-bold text-slate-700 grid grid-cols-12 gap-2 text-[11px] uppercase tracking-wider">
                      <div className="col-span-3">Komponen & Sub-Komponen</div>
                      <div className="col-span-6">Parameter Standar SAKIP</div>
                      <div className="col-span-1 text-center">Bobot</div>
                      <div className="col-span-2 text-center">Penilaian (1/0)</div>
                    </div>

                    {activeLhe.kriteriaList.map((kriteria, idx) => (
                      <div
                        key={kriteria.id}
                        className="px-4 py-3.5 grid grid-cols-12 gap-2 items-center hover:bg-slate-50/80 transition-colors"
                      >
                        <div className="col-span-3">
                          <span className="font-bold text-slate-900 block leading-tight">
                            {kriteria.komponen}
                          </span>
                          <span className="text-[11px] text-slate-500 mt-0.5 block">
                            {kriteria.subKomponen}
                          </span>
                        </div>

                        <div className="col-span-6 text-slate-700 text-xs">
                          <p className="leading-relaxed">{kriteria.parameter}</p>
                          {kriteria.catatanEvaluator && (
                            <p className="text-[11px] text-slate-500 mt-1 italic">
                              Catatan: {kriteria.catatanEvaluator}
                            </p>
                          )}
                        </div>

                        <div className="col-span-1 text-center font-mono font-bold text-slate-600 text-xs">
                          {kriteria.bobotKriteria}%
                        </div>

                        <div className="col-span-2 text-center">
                          {kriteria.skor === 1 ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-xs">
                              <Check className="w-3 h-3 text-emerald-700" />
                              <span>1 (Memenuhi)</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-100 text-rose-900 border border-rose-300 font-black text-xs">
                              <X className="w-3 h-3 text-rose-700" />
                              <span>0 (Belum)</span>
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Hasil Penilaian & Rekapitulasi Nilai 5 Komponen */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-3">
                    Rekapitulasi Nilai Akhir Komponen SAKIP
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center text-xs">
                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Perencanaan ({bobotSakip.perencanaan}%)
                      </span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        {hitungNilaiLHE(activeLhe.kriteriaList, bobotSakip).skorKomponen['Perencanaan Kinerja']?.skorDidapat}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Pengukuran ({bobotSakip.pengukuran}%)
                      </span>
                      <span className="text-base font-black text-teal-700 font-mono">
                        {hitungNilaiLHE(activeLhe.kriteriaList, bobotSakip).skorKomponen['Pengukuran Kinerja']?.skorDidapat}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Pelaporan ({bobotSakip.pelaporan}%)
                      </span>
                      <span className="text-base font-black text-sky-700 font-mono">
                        {hitungNilaiLHE(activeLhe.kriteriaList, bobotSakip).skorKomponen['Pelaporan Kinerja']?.skorDidapat}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Evaluasi Internal ({bobotSakip.evaluasiInternal}%)
                      </span>
                      <span className="text-base font-black text-indigo-700 font-mono">
                        {hitungNilaiLHE(activeLhe.kriteriaList, bobotSakip).skorKomponen['Evaluasi Internal']?.skorDidapat}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block font-semibold">
                        Capaian Kinerja ({bobotSakip.capaianKinerja}%)
                      </span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        {hitungNilaiLHE(activeLhe.kriteriaList, bobotSakip).skorKomponen['Capaian Kinerja']?.skorDidapat}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Catatan Evaluasi & Rekomendasi Perbaikan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Catatan Evaluasi */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/50">
                    <h4 className="font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <FileText className="w-4 h-4 text-amber-700" />
                      Catatan Evaluasi Akuntabilitas
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {activeLhe.catatanEvaluasiUmum || 'Tidak ada catatan evaluasi umum.'}
                    </p>
                  </div>

                  {/* Rekomendasi Perbaikan */}
                  <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
                    <h4 className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <TrendingUp className="w-4 h-4 text-emerald-700" />
                      Rekomendasi Perbaikan Terstruktur
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      {activeLhe.rekomendasiPerbaikan.map((rek, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="font-bold text-emerald-700 font-mono shrink-0">
                            {idx + 1}.
                          </span>
                          <span>{rek}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-slate-200 text-center text-slate-400 text-sm">
              Pilih LHE pada daftar di sebelah kiri untuk melihat rincian penilaian.
            </div>
          )}
        </div>
      </div>

      {/* Modal 1: Evaluasi & Penilaian 1/0 (Lembar Kerja Interaktif) */}
      {isEvaluationModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingLhe ? 'Edit Evaluasi & Lembar Kerja LHE' : 'Buat Lembar Kerja Evaluasi LHE (1/0)'}
                </h3>
                <p className="text-xs text-slate-500">
                  Standar PermenPAN-RB No. 88/2021 • Penilaian 1 = Memenuhi, 0 = Belum
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEvaluationModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEvaluation} className="mt-4 space-y-5 text-xs">
              {/* Top metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nomor Surat LHE</label>
                  <input
                    type="text"
                    required
                    value={lheForm.nomorSuratLHE}
                    onChange={(e) => setLheForm({ ...lheForm, nomorSuratLHE: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Kerja (OPD)</label>
                  <select
                    value={lheForm.opdId}
                    onChange={(e) => setLheForm({ ...lheForm, opdId: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold"
                  >
                    {opdList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nama Evaluator</label>
                  <input
                    type="text"
                    required
                    value={lheForm.evaluatorNama}
                    onChange={(e) => setLheForm({ ...lheForm, evaluatorNama: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              {/* Realtime Calculated Score Badge */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Award className="w-6 h-6 text-emerald-700" />
                  <div>
                    <span className="font-bold text-emerald-950 text-xs">
                      Hasil Nilai Akumulasi Real-time:
                    </span>
                    <p className="text-[11px] text-emerald-800">
                      Dihitung otomatis dari checklist 1/0 dan bobot 5 komponen
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-lg font-black text-emerald-900 font-mono">
                      {formCalculated.nilaiTotal}
                    </span>
                    <span className="text-xs text-emerald-700"> / 100</span>
                  </div>
                  <span className="text-base font-black px-3 py-1 rounded-lg bg-emerald-600 text-white">
                    {formCalculated.predikat}
                  </span>
                </div>
              </div>

              {/* Checklist Parameters 1 / 0 */}
              <div>
                <label className="font-bold text-slate-800 block mb-2 text-xs uppercase tracking-wider">
                  Checklist Parameter Penilaian (Klik Tombol 1 atau 0):
                </label>

                <div className="space-y-2 max-h-72 overflow-y-auto p-1 border border-slate-200 rounded-xl">
                  {lheForm.kriteriaList?.map((kriteria) => (
                    <div
                      key={kriteria.id}
                      className="p-3 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 flex items-start justify-between gap-3"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-bold text-slate-900 text-xs">
                            {kriteria.komponen}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {kriteria.subKomponen}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-snug">{kriteria.parameter}</p>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleScore(kriteria.id)}
                          className={`px-3 py-1.5 rounded-lg font-black text-xs transition-colors flex items-center gap-1 ${
                            kriteria.skor === 1
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>1 (Ya)</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleScore(kriteria.id)}
                          className={`px-3 py-1.5 rounded-lg font-black text-xs transition-colors flex items-center gap-1 ${
                            kriteria.skor === 0
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>0 (Tidak)</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Catatan Evaluasi Umum */}
              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Catatan Evaluasi Umum / Opini Evaluator:
                </label>
                <textarea
                  required
                  rows={3}
                  value={lheForm.catatanEvaluasiUmum}
                  onChange={(e) => setLheForm({ ...lheForm, catatanEvaluasiUmum: e.target.value })}
                  placeholder="Ketik catatan evaluasi umum..."
                  className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Rekomendasi Perbaikan List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-bold text-slate-800 block text-xs">
                    Rekomendasi Perbaikan Terstruktur:
                  </label>
                  <button
                    type="button"
                    onClick={handleAddRekomendasi}
                    className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Butir Rekomendasi</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {lheForm.rekomendasiPerbaikan?.map((rek, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="font-bold text-slate-500 font-mono w-5 text-right">
                        {idx + 1}.
                      </span>
                      <input
                        type="text"
                        value={rek}
                        onChange={(e) => handleUpdateRekomendasi(idx, e.target.value)}
                        placeholder="Ketik butir rekomendasi..."
                        className="flex-1 p-2 rounded-lg border border-slate-300 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveRekomendasi(idx)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEvaluationModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan LHE & Nilai (1/0)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Upload Dokumen LHE */}
      {isUploadModalOpen && uploadTargetLhe && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">Upload Dokumen LHE Resmi</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="mt-4 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-slate-500 block text-[11px]">OPD Penerima:</span>
                <span className="font-bold text-slate-900 text-xs">
                  {getOpdName(uploadTargetLhe.opdId)}
                </span>
                <span className="text-slate-500 block text-[11px] mt-1 font-mono">
                  {uploadTargetLhe.nomorSuratLHE}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-800 block mb-1">
                  Pilih Berkas Dokumen LHE (PDF):
                </label>
                <div className="border-2 border-dashed border-slate-300 rounded-xl p-5 text-center hover:bg-slate-50 cursor-pointer">
                  <FileText className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold text-slate-800">Klik untuk memilih file PDF LHE</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Maksimal 25MB (PDF tertandatangan)</p>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama File:</label>
                <input
                  type="text"
                  required
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-300 font-mono text-xs"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                >
                  Simpan & Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Print Official LHE */}
      {isPrintModalOpen && printLheTarget && (
        <PrintLHEModal
          lhe={printLheTarget}
          opdName={getOpdName(printLheTarget.opdId)}
          bobotSakip={bobotSakip}
          onClose={() => setIsPrintModalOpen(false)}
        />
      )}
    </div>
  );
};
