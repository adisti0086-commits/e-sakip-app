import React, { useState } from 'react';
import {
  Target,
  Plus,
  Edit2,
  Trash2,
  Search,
  Network,
  Calendar,
  Layers,
  CheckCircle2,
  X,
  Building2,
  ChevronDown,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { RenstraTujuan, RenstraSasaran, OPD, User } from '../types';

interface MasterRenstraViewProps {
  tujuanList?: RenstraTujuan[];
  setTujuanList?: React.Dispatch<React.SetStateAction<RenstraTujuan[]>>;
  sasaranList?: RenstraSasaran[];
  setSasaranList?: React.Dispatch<React.SetStateAction<RenstraSasaran[]>>;
  opdList: OPD[];
  selectedOpdId: string;
  currentUser: User;
}

export const MasterRenstraView: React.FC<MasterRenstraViewProps> = ({
  tujuanList = [],
  setTujuanList,
  sasaranList = [],
  setSasaranList,
  opdList = [],
  selectedOpdId,
  currentUser,
}) => {
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [activeTabSub, setActiveTabSub] = useState<'sasaran' | 'cascading'>('sasaran');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSasaran, setEditingSasaran] = useState<RenstraSasaran | null>(null);

  const [formData, setFormData] = useState<Partial<RenstraSasaran>>({
    kode: '',
    opdId: opdList?.[0]?.id || '',
    tujuanId: tujuanList?.[0]?.id || '',
    sasaranStrategis: '',
    indikatorKinerja: '',
    satuan: '%',
    target: 90,
    realisasi: 90,
    capaian: 100,
    cascadingLevel: 'Eselon II',
  });

  const canEdit = currentUser.role === 'administrator' || currentUser.role === 'operator_unit';

  const filteredSasaran = (sasaranList || []).filter((s) => {
    if (currentUser.role === 'operator_unit') {
      return s.opdId === currentUser.opdId;
    }
    return filterOpd === 'all' || s.opdId === filterOpd;
  });

  const getOpdName = (id: string) => opdList?.find((o) => o.id === id)?.nama || id;
  const getTujuanName = (id: string) => (tujuanList || []).find((t) => t.id === id)?.pernyataan || id;

  const handleSaveSasaran = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.sasaranStrategis || !formData.indikatorKinerja) return;

    if (!setSasaranList) return;

    const targetVal = Number(formData.target) || 0;
    const realisasiVal = Number(formData.realisasi) || 0;
    const calculatedCapaian =
      formData.capaian !== undefined && formData.capaian !== null
        ? Number(formData.capaian)
        : targetVal > 0
        ? Math.round((realisasiVal / targetVal) * 10000) / 100
        : 0;

    if (editingSasaran) {
      setSasaranList((prev) =>
        prev.map((s) =>
          s.id === editingSasaran.id
            ? ({
                ...s,
                ...formData,
                target: targetVal,
                realisasi: realisasiVal,
                capaian: calculatedCapaian,
              } as RenstraSasaran)
            : s
        )
      );
    } else {
      const newSasaran: RenstraSasaran = {
        id: `sasaran-${Date.now()}`,
        kode: formData.kode || `SS.${Date.now().toString().slice(-4)}`,
        opdId: formData.opdId || opdList?.[0]?.id || '',
        tujuanId: formData.tujuanId || (tujuanList && tujuanList[0]?.id) || '',
        sasaranStrategis: formData.sasaranStrategis || '',
        indikatorKinerja: formData.indikatorKinerja || '',
        satuan: formData.satuan || '%',
        target: targetVal,
        realisasi: realisasiVal,
        capaian: calculatedCapaian,
        cascadingLevel: formData.cascadingLevel || 'Eselon II',
      };
      setSasaranList((prev) => [...prev, newSasaran]);
    }
    setIsModalOpen(false);
    setEditingSasaran(null);
  };

  const handleDeleteSasaran = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Sasaran Renstra ini?')) {
      setSasaranList?.((prev) => prev.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher & OPD filter */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTabSub('sasaran')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTabSub === 'sasaran'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Sasaran, Target & Capaian</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTabSub('cascading')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 ${
              activeTabSub === 'cascading'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Network className="w-3.5 h-3.5" />
            <span>Pohon Kinerja (Cascading)</span>
          </button>
        </div>

        {/* Action button & Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2 py-1.5 border border-slate-200 text-xs">
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

          {canEdit && (
            <button
              type="button"
              onClick={() => {
                setEditingSasaran(null);
                setFormData({
                  kode: '',
                  opdId: currentUser.role === 'operator_unit' ? currentUser.opdId : opdList?.[0]?.id || '',
                  tujuanId: tujuanList?.[0]?.id || '',
                  sasaranStrategis: '',
                  indikatorKinerja: '',
                  satuan: '%',
                  target: 90,
                  realisasi: 90,
                  capaian: 100,
                  cascadingLevel: 'Eselon II',
                });
                setIsModalOpen(true);
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sasaran Renstra</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab 1: Sasaran, Target, Realisasi & Capaian Table */}
      {activeTabSub === 'sasaran' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Matriks Sasaran Strategis, Target & Capaian Renstra
              </h3>
              <p className="text-[11px] text-slate-500">
                Landasan utama penyusunan Perjanjian Kinerja (PK) tahunan dan IKU Perangkat Daerah
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-600">
              {filteredSasaran.length} Sasaran Terdaftar
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-3 py-3">Kode & Level</th>
                  <th className="px-3 py-3">Unit Kerja (OPD)</th>
                  <th className="px-3 py-3">Sasaran Strategis</th>
                  <th className="px-3 py-3">Indikator Kinerja & Satuan</th>
                  <th className="px-3 py-3 text-center bg-slate-200/60 text-slate-800">Target</th>
                  <th className="px-3 py-3 text-center bg-blue-100/70 text-blue-900">Realisasi</th>
                  <th className="px-3 py-3 text-center bg-emerald-100/70 text-emerald-900">Capaian</th>
                  {canEdit && <th className="px-3 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSasaran.map((item) => {
                  const targetVal = item.target ?? item.targetTahun3 ?? 0;
                  const realisasiVal = item.realisasi ?? item.targetTahun3 ?? 0;
                  const rawCapaianVal =
                    item.capaian !== undefined
                      ? item.capaian
                      : targetVal > 0
                      ? Math.round((realisasiVal / targetVal) * 10000) / 100
                      : 100;
                  const capaianVal = Math.min(rawCapaianVal, 120);
                  const isGood = capaianVal >= 100;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-3.5">
                        <span className="font-mono font-bold text-slate-900 block">{item.kode}</span>
                        <span className="inline-block mt-0.5 text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {item.cascadingLevel}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 font-medium text-slate-800 max-w-[150px]">
                        {getOpdName(item.opdId)}
                      </td>
                      <td className="px-3 py-3.5 font-semibold text-slate-900 max-w-xs">
                        {item.sasaranStrategis}
                      </td>
                      <td className="px-3 py-3.5 text-slate-700 max-w-xs">
                        <p className="font-medium">{item.indikatorKinerja}</p>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Satuan: {item.satuan}
                        </span>
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold text-slate-900 bg-slate-50/50">
                        {targetVal} {item.satuan}
                      </td>
                      <td className="px-3 py-3.5 text-center font-bold text-blue-700 bg-blue-50/40">
                        {realisasiVal} {item.satuan}
                      </td>
                      <td className="px-3 py-3.5 text-center bg-emerald-50/40">
                        <div className="flex flex-col items-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold font-mono border ${
                              isGood
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-amber-100 text-amber-800 border-amber-300'
                            }`}
                          >
                            {capaianVal.toFixed(2)}%
                          </span>
                          {rawCapaianVal > 120 && (
                            <span className="text-[9px] text-slate-500 mt-0.5 font-mono">
                              (Maks. 120%)
                            </span>
                          )}
                        </div>
                      </td>
                      {canEdit && (
                        <td className="px-3 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingSasaran(item);
                                setFormData({
                                  ...item,
                                  target: item.target ?? item.targetTahun3 ?? 90,
                                  realisasi: item.realisasi ?? item.targetTahun3 ?? 90,
                                  capaian: item.capaian ?? 100,
                                });
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit Sasaran Renstra"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSasaran(item.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus Sasaran"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Subtab 2: Pohon Kinerja (Cascading) */}
      {activeTabSub === 'cascading' && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600" />
              <span>Cascading Pohon Kinerja (Hierarki Sasaran & Indikator SAKIP)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Menghubungkan Sasaran Strategis Daerah (RPJMD) hingga level operasional Perangkat Daerah.
            </p>
          </div>

          <div className="space-y-6">
            {tujuanList.map((tuj, idx) => (
              <div key={tuj.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                {/* Level 1: Tujuan Strategis */}
                <div className="p-3 bg-slate-900 text-white rounded-lg shadow-xs flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold text-[10px] font-mono">
                      TUJUAN STRATEGIS #{idx + 1}
                    </span>
                    <span className="font-bold text-xs">{tuj.pernyataan}</span>
                  </div>
                  <span className="text-[11px] text-emerald-300 font-mono font-semibold">
                    Target: {tuj.targetAkhir} {tuj.satuan}
                  </span>
                </div>

                {/* Level 2: Sasaran Strategis OPD (Eselon II) */}
                <div className="pl-6 pt-4 space-y-3">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3 h-3 text-emerald-600" />
                    <span>Sasaran Strategis Perangkat Daerah (Ultimate Outcome / Eselon II):</span>
                  </div>

                  {sasaranList
                    .filter((s) => s.tujuanId === tuj.id)
                    .map((sas) => (
                      <div
                        key={sas.id}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-xs space-y-2 hover:border-emerald-300 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-bold font-mono">
                              {sas.kode}
                            </span>
                            <span className="font-bold text-xs text-slate-800">
                              {sas.sasaranStrategis}
                            </span>
                          </div>
                          <span className="text-[11px] font-semibold text-slate-500">
                            {getOpdName(sas.opdId)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center justify-between text-xs bg-slate-50 p-2.5 rounded-md gap-2">
                          <div className="text-slate-600">
                            <strong>Indikator Kinerja:</strong> {sas.indikatorKinerja} ({sas.satuan})
                          </div>
                          <div className="flex items-center gap-3 font-mono text-xs">
                            <span className="text-slate-700 font-semibold">
                              Target: <strong className="text-slate-900">{sas.target ?? sas.targetTahun3 ?? 0} {sas.satuan}</strong>
                            </span>
                            <span className="text-blue-700 font-semibold">
                              Realisasi: <strong className="text-blue-900">{sas.realisasi ?? sas.targetTahun3 ?? 0} {sas.satuan}</strong>
                            </span>
                            <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                              Capaian: {sas.capaian ? `${sas.capaian.toFixed(2)}%` : '100%'}
                            </span>
                          </div>
                        </div>

                        {/* Level 3: Program & Kegiatan (Eselon III & IV) */}
                        <div className="pl-4 pt-1 border-l-2 border-slate-200 text-[11px] text-slate-500 space-y-1">
                          <p>↳ <strong>Direct Outcome (Eselon III):</strong> Program Peningkatan Akurasi Pelaporan & Pengendalian</p>
                          <p>↳ <strong>Immediate Output (Eselon IV):</strong> Kegiatan Penyusunan Dokumen Evaluasi Kinerja Triwulanan</p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Add / Edit Sasaran Renstra */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingSasaran ? 'Edit Sasaran Renstra' : 'Tambah Sasaran Strategis Renstra'}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSasaran} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode Sasaran</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: SS.BAP.01"
                    value={formData.kode}
                    onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Level Cascading</label>
                  <select
                    value={formData.cascadingLevel}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        cascadingLevel: e.target.value as RenstraSasaran['cascadingLevel'],
                      })
                    }
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="Eselon II">Eselon II (Kepala OPD / Ultimate Outcome)</option>
                    <option value="Eselon III">Eselon III (Kabid / Intermediate Outcome)</option>
                    <option value="Eselon IV">Eselon IV (Kasubag / Output Kinerja)</option>
                    <option value="Staf/Pelaksana">Staf / Pelaksana (Aktivitas Kinerja)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Unit Kerja (OPD)</label>
                <select
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
                <label className="font-semibold text-slate-700 block mb-1">Pernyataan Sasaran Strategis</label>
                <textarea
                  required
                  rows={2}
                  placeholder="misal: Meningkatnya Akurasi & Ketepatan Waktu Dokumen Perencanaan Pembangunan..."
                  value={formData.sasaranStrategis}
                  onChange={(e) => setFormData({ ...formData, sasaranStrategis: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">Indikator Kinerja Renstra</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Persentase Program RKPD sesuai RPJMD"
                    value={formData.indikatorKinerja}
                    onChange={(e) => setFormData({ ...formData, indikatorKinerja: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Satuan Target</label>
                  <input
                    type="text"
                    required
                    placeholder="%, Dokumen, Nilai"
                    value={formData.satuan}
                    onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Target, Realisasi & Capaian */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 block text-xs">
                    Target, Realisasi & Capaian Kinerja Renstra:
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    (Maks. Capaian dibatasi 120%)
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <span className="text-[11px] text-slate-600 font-semibold block mb-1">Target</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.target ?? ''}
                      onChange={(e) => {
                        const newTarget = Number(e.target.value);
                        const curReal = formData.realisasi ?? 0;
                        const rawCap = newTarget > 0 ? Math.round((curReal / newTarget) * 10000) / 100 : 0;
                        const newCap = Math.min(rawCap, 120);
                        setFormData({
                          ...formData,
                          target: newTarget,
                          capaian: newCap,
                        });
                      }}
                      className="w-full p-2.5 text-center rounded-lg border border-slate-200 font-bold text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="Nilai Target"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 font-semibold block mb-1">Realisasi</span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formData.realisasi ?? ''}
                      onChange={(e) => {
                        const newReal = Number(e.target.value);
                        const curTarget = formData.target ?? 0;
                        const rawCap = curTarget > 0 ? Math.round((newReal / curTarget) * 10000) / 100 : 0;
                        const newCap = Math.min(rawCap, 120);
                        setFormData({
                          ...formData,
                          realisasi: newReal,
                          capaian: newCap,
                        });
                      }}
                      className="w-full p-2.5 text-center rounded-lg border border-slate-200 font-bold text-xs bg-white text-blue-700 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="Nilai Realisasi"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-600 font-semibold block mb-1">Capaian (%)</span>
                    <input
                      type="number"
                      step="any"
                      max={120}
                      required
                      value={formData.capaian ?? ''}
                      onChange={(e) => {
                        const cap = Math.min(Number(e.target.value), 120);
                        setFormData({ ...formData, capaian: cap });
                      }}
                      className="w-full p-2.5 text-center rounded-lg border border-slate-200 font-bold text-xs bg-emerald-50 text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                      placeholder="%"
                    />
                  </div>
                </div>
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
                  Simpan Sasaran Renstra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
