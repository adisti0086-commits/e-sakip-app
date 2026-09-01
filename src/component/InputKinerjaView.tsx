import React, { useState, useMemo } from 'react';
import {
  FilePlus2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Building2,
  Calendar,
  Layers,
  HelpCircle,
  X,
  TrendingUp,
  DollarSign,
  UserCheck,
  CheckCircle2,
  ArrowRight,
  Table as TableIcon,
  LayoutGrid,
  FileSpreadsheet,
  Printer,
  Sparkles,
  Percent,
  Check,
} from 'lucide-react';
import { IndikatorPK, OPD, RenstraSasaran, User, Polarisasi } from '../types';

interface InputKinerjaViewProps {
  indikatorList: IndikatorPK[];
  setIndikatorList: React.Dispatch<React.SetStateAction<IndikatorPK[]>>;
  opdList: OPD[];
  sasaranList: RenstraSasaran[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
}

export const InputKinerjaView: React.FC<InputKinerjaViewProps> = ({
  indikatorList = [],
  setIndikatorList,
  opdList = [],
  sasaranList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [activeSubView, setActiveSubView] = useState<'tabel31' | 'detailPK'>('tabel31');
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndikator, setEditingIndikator] = useState<IndikatorPK | null>(null);

  // Form State for Indikator PK & Target
  const [formData, setFormData] = useState<Partial<IndikatorPK>>({
    opdId: currentUser.role === 'operator_unit' ? currentUser.opdId : opdList?.[0]?.id || '',
    tahun: selectedYear,
    noUrut: 1,
    sasaranStrategis: sasaranList?.[0]?.sasaranStrategis || '',
    namaIndikator: '',
    formula: '',
    satuan: '%',
    polarisasi: 'Maximize' as Polarisasi,
    targetTahunan: 100,
    targetRenstra: '100%',
    targetPKText: '100%',
    realisasi2025Text: '-',
    realisasiSem1Text: '100%',
    capaianSem1Text: '100%',
    targetT1: 25,
    targetT2: 50,
    targetT3: 75,
    targetT4: 100,
    paguAnggaran: 500000000,
    penanggungJawab: 'Instalasi / KSM Terkait',
    tipeIndikator: 'IKU',
  });

  const canEdit = currentUser.role === 'administrator' || currentUser.role === 'operator_unit';

  const filteredIndikator = useMemo(() => {
    return (indikatorList || [])
      .filter((i) => {
        const matchYear = i.tahun === selectedYear || selectedYear === 2026;
        let matchOpd = true;
        if (currentUser.role === 'operator_unit') {
          matchOpd = i.opdId === currentUser.opdId;
        } else if (filterOpd !== 'all') {
          matchOpd = i.opdId === filterOpd;
        }
        const matchSearch =
          i.namaIndikator.toLowerCase().includes(searchTerm.toLowerCase()) ||
          i.sasaranStrategis.toLowerCase().includes(searchTerm.toLowerCase());
        return matchOpd && matchSearch;
      })
      .sort((a, b) => (a.noUrut || 99) - (b.noUrut || 99));
  }, [indikatorList, selectedYear, currentUser, filterOpd, searchTerm]);

  // Group by Sasaran Strategis for Tabel 3.1
  const groupedBySasaran = useMemo(() => {
    const groups: { sasaran: string; sasaranNo: number; items: IndikatorPK[] }[] = [];
    const sasaranMap = new Map<string, IndikatorPK[]>();

    filteredIndikator.forEach((item) => {
      const current = sasaranMap.get(item.sasaranStrategis) || [];
      current.push(item);
      sasaranMap.set(item.sasaranStrategis, current);
    });

    let counter = 1;
    sasaranMap.forEach((items, sasaran) => {
      groups.push({
        sasaran,
        sasaranNo: counter++,
        items,
      });
    });

    return groups;
  }, [filteredIndikator]);

  // Calculate Average Capaian Semester I
  const averageCapaianSem1 = useMemo(() => {
    if (filteredIndikator.length === 0) return 0;
    const total = filteredIndikator.reduce((acc, curr) => {
      const val = parseFloat(curr.capaianSem1Text?.replace('%', '').replace(',', '.') || '0') || 0;
      return acc + val;
    }, 0);
    return Math.round((total / filteredIndikator.length) * 100) / 100;
  }, [filteredIndikator]);

  const getOpdName = (id: string) => opdList?.find((o) => o.id === id)?.nama || id;

  const handleOpenAdd = () => {
    setEditingIndikator(null);
    const targetOpd = currentUser.role === 'operator_unit' ? currentUser.opdId : opdList?.[0]?.id || '';
    const nextNo = filteredIndikator.length + 1;

    setFormData({
      opdId: targetOpd,
      tahun: selectedYear,
      noUrut: nextNo,
      sasaranStrategis: sasaranList?.[0]?.sasaranStrategis || 'Terwujudnya Layanan Terbaik Level Asia',
      namaIndikator: '',
      formula: '(Realisasi / Target) x 100%',
      satuan: '%',
      polarisasi: 'Maximize',
      targetTahunan: 100,
      targetRenstra: '80%',
      targetPKText: '90%',
      realisasi2025Text: '85%',
      realisasiSem1Text: '88%',
      capaianSem1Text: '97.7%',
      targetT1: 25,
      targetT2: 50,
      targetT3: 75,
      targetT4: 100,
      paguAnggaran: 250000000,
      penanggungJawab: 'Tim Kerja Teknis SAKIP',
      tipeIndikator: 'IKU',
    });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namaIndikator || !formData.sasaranStrategis) return;

    if (editingIndikator) {
      setIndikatorList((prev) =>
        prev.map((item) =>
          item.id === editingIndikator.id ? ({ ...item, ...formData } as IndikatorPK) : item
        )
      );
    } else {
      const newIndikator: IndikatorPK = {
        id: `pk-${Date.now()}`,
        opdId: formData.opdId || opdList?.[0]?.id || '',
        tahun: selectedYear,
        noUrut: Number(formData.noUrut) || filteredIndikator.length + 1,
        sasaranStrategis: formData.sasaranStrategis || '',
        namaIndikator: formData.namaIndikator || '',
        formula: formData.formula || '',
        satuan: formData.satuan || '%',
        polarisasi: (formData.polarisasi as Polarisasi) || 'Maximize',
        targetTahunan: Number(formData.targetTahunan) || 0,
        targetRenstra: formData.targetRenstra || '-',
        targetPKText: formData.targetPKText || `${formData.targetTahunan} ${formData.satuan}`,
        realisasi2025Text: formData.realisasi2025Text || '-',
        realisasiSem1Text: formData.realisasiSem1Text || '-',
        capaianSem1Text: formData.capaianSem1Text || '100%',
        targetT1: Number(formData.targetT1) || 0,
        targetT2: Number(formData.targetT2) || 0,
        targetT3: Number(formData.targetT3) || 0,
        targetT4: Number(formData.targetT4) || 0,
        paguAnggaran: Number(formData.paguAnggaran) || 0,
        penanggungJawab: formData.penanggungJawab || '-',
        tipeIndikator: formData.tipeIndikator || 'IKU',
      };
      setIndikatorList((prev) => [...prev, newIndikator]);
    }
    setIsModalOpen(false);
    setEditingIndikator(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus indikator Perjanjian Kinerja ini?')) {
      setIndikatorList((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Helper to colorize capaian percentage
  const getCapaianBadge = (capaianStr?: string) => {
    if (!capaianStr) return <span className="text-slate-400">-</span>;
    const num = parseFloat(capaianStr.replace('%', '').replace(',', '.'));
    if (isNaN(num)) return <span>{capaianStr}</span>;

    if (num >= 100) {
      return (
        <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
          {capaianStr}
        </span>
      );
    } else if (num >= 75) {
      return (
        <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
          {capaianStr}
        </span>
      );
    } else {
      return (
        <span className="font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
          {capaianStr}
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner: SAKIP Kemenkes Tabel 3.1 Highlight */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-400/30 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                SAKIP KEMENKES RI
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 font-medium text-xs border border-white/10">
                18 Indikator Kinerja PK
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">
              Tabel 3.1 Hasil Pengukuran Pencapaian Kinerja Semester I Tahun {selectedYear}
            </h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl">
              Pengukuran Perjanjian Kinerja (PK) RSUP Dr. M Djamil Padang - Kementerian Kesehatan RI mencakup 11 Sasaran Strategis dan 18 Indikator Kinerja Utama/Klinis.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/20 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/30 flex items-center justify-center border border-emerald-400/30">
              <Percent className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-emerald-200 uppercase tracking-wider">
                RATA-RATA CAPAIAN SEMESTER I
              </p>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-white">{averageCapaianSem1.toLocaleString('id-ID')}%</span>
                <span className="text-xs font-bold text-emerald-300">(Kategori Baik)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Controls, View Switcher & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Sub-view switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setActiveSubView('tabel31')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'tabel31'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Tabel 3.1 Kemenkes (18 Indikator)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveSubView('detailPK')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubView === 'detailPK'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Target Triwulan & Pagu</span>
            </button>
          </div>

          <div className="relative w-full sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari indikator atau sasaran..."
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
                <option value="all">Semua Satker / Unit Kerja</option>
                {opdList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Indikator PK</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. VIEW MODE 1: TABEL 3.1 EXACT FORMAT KEMENKES */}
      {activeSubView === 'tabel31' && (
        <div className="bg-white rounded-xl border border-slate-300 shadow-md overflow-hidden">
          {/* Header Title */}
          <div className="p-4 bg-slate-800 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-bold text-sm tracking-wide">
                Tabel 3.1 Hasil Pengukuran Pencapaian Kinerja Semester I Tahun {selectedYear}
              </h3>
              <p className="text-[11px] text-slate-300">
                Format Resmi Laporan Pengukuran Kinerja Kemenkes RI / RSUP Dr. M Djamil
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                18 Indikator • 11 Sasaran Strategis
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-extrabold text-center border-b-2 border-slate-300 text-[11px]">
                  <th className="px-3 py-3 w-12 border-r border-slate-300">No</th>
                  <th className="px-4 py-3 text-left border-r border-slate-300 min-w-[280px]">
                    Indikator Kinerja
                  </th>
                  <th className="px-3 py-3 border-r border-slate-300 w-28">Target Renstra</th>
                  <th className="px-3 py-3 border-r border-slate-300 w-28 bg-emerald-50 text-emerald-950 font-black">
                    Target PK
                  </th>
                  <th className="px-3 py-3 border-r border-slate-300 w-28">Realisasi 2025</th>
                  <th className="px-3 py-3 border-r border-slate-300 w-32 bg-slate-50 font-bold">
                    Realisasi Semester I {selectedYear}
                  </th>
                  <th className="px-3 py-3 w-32 bg-emerald-100/70 text-emerald-950 font-black border-r border-slate-300">
                    Capaian Semester I {selectedYear}
                  </th>
                  {canEdit && <th className="px-2 py-3 w-16 text-center">Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {groupedBySasaran.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 8 : 7} className="px-4 py-8 text-center text-slate-400">
                      Tidak ada indikator yang cocok dengan filter pencarian.
                    </td>
                  </tr>
                ) : (
                  groupedBySasaran.map((group) => (
                    <React.Fragment key={group.sasaran}>
                      {/* Sasaran Strategis Green Header Banner */}
                      <tr className="bg-[#8cc63f] text-slate-950 font-bold text-center border-y border-emerald-600">
                        <td colSpan={canEdit ? 8 : 7} className="px-4 py-2">
                          <div className="text-[12px] uppercase tracking-wider font-extrabold">
                            Sasaran Strategis {group.sasaranNo}
                          </div>
                          <div className="text-[13px] font-bold text-slate-900">
                            {group.sasaran}
                          </div>
                        </td>
                      </tr>

                      {/* Indikator Rows within this Sasaran */}
                      {group.items.map((item) => (
                        <tr
                          key={item.id}
                          className="hover:bg-slate-50 border-b border-slate-200 transition-colors"
                        >
                          <td className="px-3 py-3 text-center font-bold text-slate-700 border-r border-slate-200">
                            {item.noUrut}
                          </td>
                          <td className="px-4 py-3 border-r border-slate-200">
                            <p className="font-bold text-slate-900 text-xs">{item.namaIndikator}</p>
                            <p className="text-[11px] text-slate-500 mt-0.5 italic">{item.formula}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PJ: {item.penanggungJawab}</p>
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-slate-800 border-r border-slate-200">
                            {item.targetRenstra || '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-900 bg-emerald-50/50 border-r border-slate-200">
                            {item.targetPKText || `${item.targetTahunan} ${item.satuan}`}
                          </td>
                          <td className="px-3 py-3 text-center font-medium text-slate-700 border-r border-slate-200">
                            {item.realisasi2025Text || '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-slate-900 bg-slate-50/50 border-r border-slate-200">
                            {item.realisasiSem1Text || '-'}
                          </td>
                          <td className="px-3 py-3 text-center font-extrabold border-r border-slate-200">
                            {getCapaianBadge(item.capaianSem1Text)}
                          </td>
                          {canEdit && (
                            <td className="px-2 py-3 text-center">
                              <div className="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingIndikator(item);
                                    setFormData(item);
                                    setIsModalOpen(true);
                                  }}
                                  className="p-1 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded transition-colors"
                                  title="Edit Indikator & Target PK"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors"
                                  title="Hapus Indikator"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))
                )}
              </tbody>
              {/* Footer: RATA-RATA CAPAIAN */}
              <tfoot>
                <tr className="bg-slate-900 text-white font-black text-xs border-t-2 border-slate-800">
                  <td colSpan={canEdit ? 6 : 6} className="px-4 py-3.5 text-center uppercase tracking-wider font-extrabold text-slate-200">
                    RATA-RATA CAPAIAN
                  </td>
                  <td className="px-4 py-3.5 text-center text-sm font-black bg-slate-800 text-emerald-400 border-x border-slate-700">
                    {averageCapaianSem1.toLocaleString('id-ID')}%
                  </td>
                  {canEdit && <td className="px-2 py-3.5 text-center"></td>}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* 4. VIEW MODE 2: DETAIL TARGET TRIWULAN & PAGU ANGGARAN */}
      {activeSubView === 'detailPK' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Rincian Target Triwulan & Alokasi Pagu Anggaran {selectedYear}
              </h3>
              <p className="text-[11px] text-slate-500">
                Pembagian target periodik Triwulan I s/d IV serta unit penanggung jawab
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {filteredIndikator.length} Indikator Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="px-3 py-3 w-12 text-center">No</th>
                  <th className="px-3 py-3">Sasaran Strategis</th>
                  <th className="px-3 py-3">Nama Indikator Kinerja</th>
                  <th className="px-2 py-3 text-center bg-emerald-50 text-emerald-950 font-extrabold">
                    Target Tahunan
                  </th>
                  <th className="px-2 py-3 text-center bg-slate-200/50">T1</th>
                  <th className="px-2 py-3 text-center bg-slate-200/50">T2</th>
                  <th className="px-2 py-3 text-center bg-slate-200/50">T3</th>
                  <th className="px-2 py-3 text-center bg-slate-200/50">T4</th>
                  <th className="px-3 py-3">Pagu & Penanggung Jawab</th>
                  {canEdit && <th className="px-3 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIndikator.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3.5 text-center font-bold text-slate-700 align-top">
                      {item.noUrut || '-'}
                    </td>
                    <td className="px-3 py-3.5 align-top max-w-[180px]">
                      <p className="font-semibold text-slate-900 leading-snug">
                        {item.sasaranStrategis}
                      </p>
                    </td>
                    <td className="px-3 py-3.5 align-top max-w-xs">
                      <p className="font-bold text-slate-900 text-xs">{item.namaIndikator}</p>
                      <p className="text-[11px] text-slate-500 mt-1 italic">{item.formula}</p>
                      <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                        <span>Satuan: <strong>{item.satuan}</strong></span>
                        <span>•</span>
                        <span>Polaritas: <strong>{item.polarisasi}</strong></span>
                      </div>
                    </td>
                    <td className="px-2 py-3.5 text-center font-black text-emerald-700 bg-emerald-50/50 align-top text-sm">
                      {item.targetTahunan} {item.satuan}
                    </td>
                    <td className="px-2 py-3.5 text-center font-bold text-slate-700 bg-slate-50/50 align-top">
                      {item.targetT1}
                    </td>
                    <td className="px-2 py-3.5 text-center font-bold text-slate-700 bg-slate-50/50 align-top">
                      {item.targetT2}
                    </td>
                    <td className="px-2 py-3.5 text-center font-bold text-slate-700 bg-slate-50/50 align-top">
                      {item.targetT3}
                    </td>
                    <td className="px-2 py-3.5 text-center font-bold text-slate-700 bg-slate-50/50 align-top">
                      {item.targetT4}
                    </td>
                    <td className="px-3 py-3.5 align-top text-slate-600 max-w-[160px]">
                      <p className="font-mono text-[11px] font-bold text-slate-800">
                        Rp {item.paguAnggaran.toLocaleString('id-ID')}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{item.penanggungJawab}</p>
                    </td>
                    {canEdit && (
                      <td className="px-3 py-3.5 text-right align-top">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingIndikator(item);
                              setFormData(item);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                            title="Edit Indikator & Target PK"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                            title="Hapus Indikator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. MODAL: INPUT / EDIT INDIKATOR PK (Lengkap Format Kemenkes) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingIndikator ? 'Edit Indikator Kinerja PK Kemenkes' : 'Input Baru Indikator PK (18 Indikator Kemenkes)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              {/* Row 1: Nomor Urut & Sasaran Strategis */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">No. Urut (1-18)</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    required
                    value={formData.noUrut}
                    onChange={(e) => setFormData({ ...formData, noUrut: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-bold"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Sasaran Strategis (11 Sasaran SAKIP Kemenkes)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Terwujudnya Layanan Terbaik Level Asia"
                    value={formData.sasaranStrategis}
                    onChange={(e) => setFormData({ ...formData, sasaranStrategis: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 2: Nama Indikator Kinerja */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Indikator Kinerja (misal: IKM 16.4.11 - Skor kepuasan pelanggan (CSAT))
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ketik kode IKM dan nama indikator..."
                  value={formData.namaIndikator}
                  onChange={(e) => setFormData({ ...formData, namaIndikator: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                />
              </div>

              {/* Row 3: Tabel 3.1 Kemenkes Values (Target Renstra, Target PK, Realisasi 2025, Realisasi Sem 1, Capaian Sem 1) */}
              <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                <p className="font-bold text-emerald-950 text-xs flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  Parameter Pengukuran Tabel 3.1 Kemenkes
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Target Renstra</label>
                    <input
                      type="text"
                      placeholder="Baik / 70% / -"
                      value={formData.targetRenstra}
                      onChange={(e) => setFormData({ ...formData, targetRenstra: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-semibold bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Target PK</label>
                    <input
                      type="text"
                      placeholder="90,64 / 70% / 100%"
                      value={formData.targetPKText}
                      onChange={(e) => setFormData({ ...formData, targetPKText: e.target.value })}
                      className="w-full p-2 rounded-lg border border-emerald-400 text-xs font-bold text-emerald-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Realisasi 2025</label>
                    <input
                      type="text"
                      placeholder="86,47 / -"
                      value={formData.realisasi2025Text}
                      onChange={(e) => setFormData({ ...formData, realisasi2025Text: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Realisasi Sem I</label>
                    <input
                      type="text"
                      placeholder="87,15 / 100%"
                      value={formData.realisasiSem1Text}
                      onChange={(e) => setFormData({ ...formData, realisasiSem1Text: e.target.value })}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-white"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1 text-[11px]">Capaian Sem I</label>
                    <input
                      type="text"
                      placeholder="96,15%"
                      value={formData.capaianSem1Text}
                      onChange={(e) => setFormData({ ...formData, capaianSem1Text: e.target.value })}
                      className="w-full p-2 rounded-lg border border-emerald-500 text-xs font-black text-emerald-700 bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Rumus Matematis & Satuan */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Formula / Cara Perhitungan Matematis
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: (Realisasi / Target) * 100%"
                    value={formData.formula}
                    onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Pengukuran</label>
                  <input
                    type="text"
                    required
                    placeholder="%, Nilai, Level, Poin"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Row 5: Breakdown Triwulan Target (T1, T2, T3, T4) */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <label className="font-bold text-slate-800 block text-xs">
                  Breakdown Target Angka Triwulanan
                </label>
                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-emerald-300">
                    <label className="font-bold text-emerald-900 block text-center mb-1 text-[10px]">
                      Target Tahunan
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.targetTahunan}
                      onChange={(e) =>
                        setFormData({ ...formData, targetTahunan: Number(e.target.value) })
                      }
                      className="w-full p-1 text-center font-extrabold text-emerald-800 border border-emerald-400 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[10px]">
                      Triwulan I
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.targetT1}
                      onChange={(e) =>
                        setFormData({ ...formData, targetT1: Number(e.target.value) })
                      }
                      className="w-full p-1 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[10px]">
                      Triwulan II
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.targetT2}
                      onChange={(e) =>
                        setFormData({ ...formData, targetT2: Number(e.target.value) })
                      }
                      className="w-full p-1 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[10px]">
                      Triwulan III
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.targetT3}
                      onChange={(e) =>
                        setFormData({ ...formData, targetT3: Number(e.target.value) })
                      }
                      className="w-full p-1 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[10px]">
                      Triwulan IV
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.targetT4}
                      onChange={(e) =>
                        setFormData({ ...formData, targetT4: Number(e.target.value) })
                      }
                      className="w-full p-1 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Row 6: Pagu & Penanggung Jawab */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Pagu Anggaran (Rp)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Rp 0"
                    value={formData.paguAnggaran}
                    onChange={(e) => setFormData({ ...formData, paguAnggaran: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Instalasi / KSM Penanggung Jawab
                  </label>
                  <input
                    type="text"
                    placeholder="misal: Komite PPI / Pusat Jantung Terpadu"
                    value={formData.penanggungJawab}
                    onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold cursor-pointer"
                >
                  Simpan Indikator PK Kemenkes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
