import React, { useState } from 'react';
import {
  FilePlus2,
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
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
} from 'lucide-react';
import { IndikatorPK, OPD, RenstraSasaran, User, Polarisasi } from '../../utils/types'

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
  indikatorList,
  setIndikatorList,
  opdList,
  sasaranList,
  selectedOpdId,
  selectedYear,
  currentUser,
}) => {
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndikator, setEditingIndikator] = useState<IndikatorPK | null>(null);

  // Form State for Indikator PK & Target
  const [formData, setFormData] = useState<Partial<IndikatorPK>>({
    opdId: currentUser.role === 'operator_unit' ? currentUser.opdId : opdList[0]?.id || '',
    tahun: selectedYear,
    sasaranStrategis: sasaranList[0]?.sasaranStrategis || '',
    namaIndikator: '',
    formula: '',
    satuan: '%',
    polarisasi: 'Maximize' as Polarisasi,
    targetTahunan: 100,
    targetT1: 25,
    targetT2: 50,
    targetT3: 75,
    targetT4: 100,
    paguAnggaran: 500000000,
    penanggungJawab: 'Bidang Perencanaan & Evaluasi',
    tipeIndikator: 'IKU',
  });

  const canEdit = currentUser.role === 'administrator' || currentUser.role === 'operator_unit';

  const filteredIndikator = indikatorList.filter((i) => {
    const matchYear = i.tahun === selectedYear;
    let matchOpd = true;
    if (currentUser.role === 'operator_unit') {
      matchOpd = i.opdId === currentUser.opdId;
    } else if (filterOpd !== 'all') {
      matchOpd = i.opdId === filterOpd;
    }
    const matchSearch =
      i.namaIndikator.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.sasaranStrategis.toLowerCase().includes(searchTerm.toLowerCase());
    return matchYear && matchOpd && matchSearch;
  });

  const getOpdName = (id: string) => opdList.find((o) => o.id === id)?.nama || id;

  const handleOpenAdd = () => {
    setEditingIndikator(null);
    const targetOpd = currentUser.role === 'operator_unit' ? currentUser.opdId : opdList[0]?.id || '';
    const availableSasaran = sasaranList.filter((s) => s.opdId === targetOpd);

    setFormData({
      opdId: targetOpd,
      tahun: selectedYear,
      sasaranStrategis: availableSasaran[0]?.sasaranStrategis || sasaranList[0]?.sasaranStrategis || 'Sasaran Strategis Utama',
      namaIndikator: '',
      formula: '(Realisasi Output / Target Output) x 100%',
      satuan: '%',
      polarisasi: 'Maximize',
      targetTahunan: 100,
      targetT1: 25,
      targetT2: 50,
      targetT3: 75,
      targetT4: 100,
      paguAnggaran: 250000000,
      penanggungJawab: 'Bidang Pelaksana Teknis',
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
        opdId: formData.opdId || opdList[0]?.id || '',
        tahun: selectedYear,
        sasaranStrategis: formData.sasaranStrategis || '',
        namaIndikator: formData.namaIndikator || '',
        formula: formData.formula || '',
        satuan: formData.satuan || '%',
        polarisasi: (formData.polarisasi as Polarisasi) || 'Maximize',
        targetTahunan: Number(formData.targetTahunan) || 0,
        targetT1: Number(formData.targetT1) || 0,
        targetT2: Number(formData.targetT2) || 0,
        targetT3: Number(formData.targetT3) || 0,
        targetT4: Number(formData.targetT4) || 0,
        paguAnggaran: Number(formData.paguAnggaran) || 0,
        penanggungJawab: formData.penanggungJawab || '-',
        tipeIndikator: formData.tipeIndikator || 'IKU',
      };
      setIndikatorList((prev) => [newIndikator, ...prev]);
    }
    setIsModalOpen(false);
    setEditingIndikator(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus indikator Perjanjian Kinerja ini?')) {
      setIndikatorList((prev) => prev.filter((i) => i.id !== id));
    }
  };

  // Available sasaran filtered by the form's current OPD
  const currentOpdSasarans = sasaranList.filter((s) => s.opdId === formData.opdId);

  return (
    <div className="space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama indikator atau sasaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1.5 border border-slate-200 text-xs">
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

        {canEdit && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="w-full md:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Input Indikator & Target PK Baru</span>
          </button>
        )}
      </div>

      {/* Indikator List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Daftar Indikator Perjanjian Kinerja (PK) Tahun Anggaran {selectedYear}
            </h3>
            <p className="text-[11px] text-slate-500">
              Target tahunan dan pembagian target per triwulan yang menjadi tolok ukur evaluasi kinerja
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            {filteredIndikator.length} Indikator Terdaftar
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/90 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-3 py-3">Tipe & OPD</th>
                <th className="px-3 py-3">Sasaran Strategis</th>
                <th className="px-3 py-3">Nama Indikator Kinerja & Formula</th>
                <th className="px-2 py-3 text-center bg-emerald-50 text-emerald-950 font-extrabold">
                  Target Th.
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
              {filteredIndikator.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-400">
                    Belum ada indikator Perjanjian Kinerja untuk kriteria ini. Klik "Input Indikator & Target PK Baru" untuk menambahkan.
                  </td>
                </tr>
              ) : (
                filteredIndikator.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-3 py-3.5 align-top">
                      <span
                        className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                          item.tipeIndikator === 'IKU'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : 'bg-blue-100 text-blue-800 border border-blue-200'
                        }`}
                      >
                        {item.tipeIndikator}
                      </span>
                      <p className="text-[11px] font-medium text-slate-700 mt-1 max-w-[130px] leading-tight">
                        {getOpdName(item.opdId)}
                      </p>
                    </td>

                    <td className="px-3 py-3.5 align-top max-w-[180px]">
                      <p className="font-semibold text-slate-900 leading-snug">
                        {item.sasaranStrategis}
                      </p>
                    </td>

                    <td className="px-3 py-3.5 align-top max-w-xs">
                      <p className="font-bold text-slate-900 text-xs">{item.namaIndikator}</p>
                      <div className="mt-1 text-[11px] text-slate-500 bg-slate-50 p-1.5 rounded border border-slate-100">
                        <span className="font-medium text-slate-600">Rumus: </span>
                        {item.formula}
                      </div>
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
                            className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                            title="Edit Indikator & Target PK"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Hapus Indikator"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Input Baru / Edit Indikator & Target PK */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FilePlus2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  {editingIndikator ? 'Edit Indikator & Target PK' : 'Input Baru Indikator Perjanjian Kinerja (PK)'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              {/* Row 1: OPD & Tahun */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Kerja (OPD)</label>
                  <select
                    disabled={currentUser.role === 'operator_unit'}
                    value={formData.opdId}
                    onChange={(e) => setFormData({ ...formData, opdId: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {opdList.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.nama}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Tipe Indikator Kinerja</label>
                  <select
                    value={formData.tipeIndikator}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tipeIndikator: e.target.value as IndikatorPK['tipeIndikator'],
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                  >
                    <option value="IKU">IKU - Indikator Kinerja Utama (Level Kepala OPD / Sasaran)</option>
                    <option value="IKP">IKP - Indikator Kinerja Program (Level Kabid / Program)</option>
                    <option value="Kegiatan">Indikator Output Kegiatan (Level Kasubag / Kasi)</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Sasaran Strategis Renstra */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Sasaran Strategis Terkait (Renstra / RPJMD)
                </label>
                {currentOpdSasarans.length > 0 ? (
                  <select
                    value={formData.sasaranStrategis}
                    onChange={(e) => setFormData({ ...formData, sasaranStrategis: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    {currentOpdSasarans.map((s) => (
                      <option key={s.id} value={s.sasaranStrategis}>
                        {s.kode} - {s.sasaranStrategis}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    placeholder="Ketik sasaran strategis..."
                    value={formData.sasaranStrategis}
                    onChange={(e) => setFormData({ ...formData, sasaranStrategis: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                )}
              </div>

              {/* Row 3: Nama Indikator Kinerja */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Nama Indikator Perjanjian Kinerja (PK)
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: Persentase Konsistensi Perencanaan RKPD dengan APBD"
                  value={formData.namaIndikator}
                  onChange={(e) => setFormData({ ...formData, namaIndikator: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Row 4: Formula / Rumus Matematis & Satuan & Polarisasi */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Pengukuran</label>
                  <input
                    type="text"
                    required
                    placeholder="%, Dokumen, Indeks, Orang"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Polarisasi Target</label>
                  <select
                    value={formData.polarisasi}
                    onChange={(e) =>
                      setFormData({ ...formData, polarisasi: e.target.value as Polarisasi })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Maximize">Maximize (Semakin tinggi semakin baik)</option>
                    <option value="Minimize">Minimize (Semakin rendah semakin baik)</option>
                  </select>
                </div>

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
              </div>

              {/* Formula */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Formula / Cara Perhitungan Matematis
                </label>
                <input
                  type="text"
                  required
                  placeholder="misal: (Realisasi Program Sesuai RKPD / Total Program) * 100%"
                  value={formData.formula}
                  onChange={(e) => setFormData({ ...formData, formula: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              {/* Row 5: TARGET TAHUNAN & BREAKDOWN TRIWULAN (T1, T2, T3, T4) */}
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-950 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-700" />
                    Penetapan Target Tahunan & Target Triwulanan
                  </span>
                  <span className="text-[10px] text-emerald-800 font-semibold">Tahun {selectedYear}</span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  <div className="bg-white p-2 rounded-lg border border-emerald-300">
                    <label className="font-bold text-emerald-900 block text-center mb-1 text-[11px]">
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
                      className="w-full p-1.5 text-center font-extrabold text-emerald-800 border border-emerald-400 rounded text-sm"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[11px]">
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
                      className="w-full p-1.5 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[11px]">
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
                      className="w-full p-1.5 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[11px]">
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
                      className="w-full p-1.5 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>

                  <div className="bg-white p-2 rounded-lg border border-slate-200">
                    <label className="font-semibold text-slate-700 block text-center mb-1 text-[11px]">
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
                      className="w-full p-1.5 text-center font-bold text-slate-800 border border-slate-200 rounded text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Penanggung Jawab */}
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Unit / Bidang Penanggung Jawab
                </label>
                <input
                  type="text"
                  placeholder="misal: Bidang Perencanaan Makro / Seksi Pelayanan"
                  value={formData.penanggungJawab}
                  onChange={(e) => setFormData({ ...formData, penanggungJawab: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
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
                  Simpan Indikator & Target PK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
