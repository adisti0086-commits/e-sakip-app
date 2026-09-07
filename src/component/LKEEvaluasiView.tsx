import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Award,
  CheckCircle2,
  Printer,
  Search,
  Filter,
  RefreshCw,
  Building2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Info,
  Check,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { INITIAL_LKE_DATA, LKEKomponen, LKESubKomponen } from '../../data/lkeData';
import { OPD, User } from '../types';

interface LKEEvaluasiViewProps {
  opdList: OPD[];
  selectedOpdId: string;
  selectedYear: number;
  currentUser: User;
  onNavigateTab?: (tab: string) => void;
}

export const LKEEvaluasiView: React.FC<LKEEvaluasiViewProps> = ({
  opdList = [],
  selectedOpdId,
  selectedYear,
  currentUser,
  onNavigateTab,
}) => {
  const [lkeData, setLkeData] = useState<LKEKomponen[]>(INITIAL_LKE_DATA);
  const [filterOpd, setFilterOpd] = useState(
    currentUser.role === 'operator_unit' ? currentUser.opdId : selectedOpdId
  );
  const [filterKomponen, setFilterKomponen] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const canEdit =
    currentUser.role === 'verifikator' || currentUser.role === 'administrator';

  const getOpdName = (id: string) => {
    if (id === 'all' || id === 'opd-rsup-m-djamil') return 'RSUP Dr. M. Djamil Padang (Level Instansi)';
    return opdList.find((o) => o.id === id)?.nama || id;
  };

  // Toggle skor kriteria 1 or 0
  const handleToggleKriteria = (
    komponenIndex: number,
    subIndex: number,
    kriteriaIndex: number
  ) => {
    if (!canEdit) return;

    setLkeData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev)) as LKEKomponen[];
      const crit = copy[komponenIndex].subKomponenList[subIndex].kriteriaList[kriteriaIndex];
      crit.skor = crit.skor === 1 ? 0 : 1;

      // Recalculate subkomponen
      const sub = copy[komponenIndex].subKomponenList[subIndex];
      const totalKriteria = sub.kriteriaList.length;
      const skorMemenuhi = sub.kriteriaList.filter((k) => k.skor === 1).length;
      const persen = totalKriteria > 0 ? (skorMemenuhi / totalKriteria) * 100 : 100;
      sub.persenIsian = Math.round(persen * 100) / 100;
      sub.nilai = Math.round(((sub.persenIsian / 100) * sub.bobot) * 100) / 100;

      // Update predikat jawaban
      if (sub.persenIsian >= 100) sub.jawaban = 'AA';
      else if (sub.persenIsian >= 90) sub.jawaban = 'A';
      else if (sub.persenIsian >= 80) sub.jawaban = 'BB';
      else if (sub.persenIsian >= 70) sub.jawaban = 'B';
      else if (sub.persenIsian >= 60) sub.jawaban = 'CC';
      else if (sub.persenIsian >= 50) sub.jawaban = 'C';
      else sub.jawaban = 'D';

      // Recalculate komponen
      const totalSubNilai = copy[komponenIndex].subKomponenList.reduce(
        (sum, s) => sum + s.nilai,
        0
      );
      copy[komponenIndex].nilai = Math.round(totalSubNilai * 100) / 100;

      return copy;
    });
  };

  // Total Nilai SAKIP
  const totalNilai = lkeData.reduce((acc, k) => acc + k.nilai, 0);
  const roundedTotal = Math.round(totalNilai * 100) / 100;

  const getPredikat = (score: number) => {
    if (score >= 90) return { predikat: 'AA', kategori: 'Sangat Memuaskan', bg: 'bg-emerald-600 text-white' };
    if (score >= 80) return { predikat: 'A', kategori: 'Memuaskan (Sangat Baik)', bg: 'bg-emerald-500 text-white' };
    if (score >= 70) return { predikat: 'BB', kategori: 'Sangat Baik', bg: 'bg-teal-600 text-white' };
    if (score >= 60) return { predikat: 'B', kategori: 'Baik', bg: 'bg-amber-500 text-white' };
    if (score >= 50) return { predikat: 'CC', kategori: 'Cukup (Memadai)', bg: 'bg-orange-500 text-white' };
    if (score >= 30) return { predikat: 'C', kategori: 'Kurang', bg: 'bg-rose-500 text-white' };
    return { predikat: 'D', kategori: 'Sangat Kurang', bg: 'bg-red-700 text-white' };
  };

  const predikatObj = getPredikat(roundedTotal);

  // Filter components
  const filteredKomponen = lkeData.filter((k) => {
    if (filterKomponen !== 'all' && k.kode !== filterKomponen) return false;
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const matchKomponen = k.nama.toLowerCase().includes(term);
    const matchSub = k.subKomponenList.some(
      (s) =>
        s.nama.toLowerCase().includes(term) ||
        s.kriteriaList.some((c) => c.pernyataan.toLowerCase().includes(term))
    );
    return matchKomponen || matchSub;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Summary */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md bg-[#5c1818] text-white font-bold text-xs uppercase tracking-wider">
                LKE SAKIP PermenPAN-RB
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-xs">
                Tahun Anggaran {selectedYear}
              </span>
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">
              Lembar Kerja Evaluasi (LKE) Akuntabilitas Kinerja Instansi Pemerintah
            </h1>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Tabel evaluasi berjenjang 4 komponen SAKIP: Perencanaan Kinerja (30%), Pengukuran Kinerja (30%),
              Pelaporan Kinerja (15%), dan Evaluasi Akuntabilitas Kinerja Internal (25%) dengan total bobot 100.
            </p>
          </div>

          {/* SAKIP Score Display matching Table Images */}
          <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">
                Total Nilai Instansi
              </span>
              <div className="flex items-baseline gap-1 justify-end">
                <span className="text-3xl font-black text-slate-900 font-mono">
                  {roundedTotal.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400 font-semibold">/ 100.00</span>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 block">
                {predikatObj.kategori}
              </span>
            </div>
            <div className="pl-4 border-l border-slate-200 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Predikat
              </span>
              <span
                className={`text-2xl font-black px-3 py-1 rounded-xl shadow-xs inline-block ${predikatObj.bg}`}
              >
                {predikatObj.predikat}
              </span>
            </div>
          </div>
        </div>

        {/* 4 Komponen Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          {lkeData.map((k) => (
            <button
              key={k.kode}
              type="button"
              onClick={() => setFilterKomponen(filterKomponen === k.kode ? 'all' : k.kode)}
              className={`p-3 rounded-xl border text-left transition-all ${
                filterKomponen === k.kode
                  ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-800 line-clamp-1">
                  {k.no}. {k.nama}
                </span>
              </div>
              <div className="flex items-baseline justify-between text-xs">
                <span className="text-slate-500 font-medium">Bobot {k.bobot.toFixed(2)}</span>
                <span className="font-black text-slate-900 font-mono">
                  Nilai {k.nilai.toFixed(1)}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kriteria atau sub-komponen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
            <select
              value={filterKomponen}
              onChange={(e) => setFilterKomponen(e.target.value)}
              className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer"
            >
              <option value="all">Semua Komponen (1 - 4)</option>
              <option value="1">1. Perencanaan Kinerja (30%)</option>
              <option value="2">2. Pengukuran Kinerja (30%)</option>
              <option value="3">3. Pelaporan Kinerja (15%)</option>
              <option value="4">4. Evaluasi Internal (25%)</option>
            </select>
          </div>

          {currentUser.role !== 'operator_unit' && (
            <div className="flex items-center bg-slate-100 rounded-lg px-2.5 py-1.5 border border-slate-200 text-xs">
              <Building2 className="w-3.5 h-3.5 text-slate-500 mr-1.5" />
              <select
                value={filterOpd}
                onChange={(e) => setFilterOpd(e.target.value)}
                className="bg-transparent font-medium text-slate-800 focus:outline-hidden text-xs cursor-pointer max-w-[200px] truncate"
              >
                <option value="all">Tingkat Rumah Sakit (Keseluruhan)</option>
                {opdList.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nama}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            type="button"
            onClick={() => setLkeData(INITIAL_LKE_DATA)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5"
            title="Reset ke Nilai Standar Hasil Evaluasi"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Reset Standar</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-lg bg-[#5c1818] hover:bg-[#4a1313] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak Lembar Kerja</span>
          </button>
        </div>
      </div>

      {/* TABLE SESUAI GAMBAR YANG DIMASUKKAN USER */}
      <div className="bg-white rounded-2xl border border-slate-300 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            {/* Header Dark Maroon / Brown (Identik Gambar 1-5) */}
            <thead>
              <tr className="bg-[#5c1818] text-white font-bold text-center border-b border-[#4a1313]">
                <th rowSpan={2} className="px-3 py-3 w-12 border-r border-[#742323] text-center">
                  No
                </th>
                <th rowSpan={2} className="px-4 py-3 text-left border-r border-[#742323]">
                  Komponen/Sub Komponen/Kriteria
                </th>
                <th rowSpan={2} className="px-3 py-3 w-20 border-r border-[#742323] text-center">
                  Bobot
                </th>
                <th colSpan={2} className="px-3 py-1.5 border-r border-[#742323] text-center bg-[#4c1212]">
                  Instansi
                </th>
                <th rowSpan={2} className="px-4 py-3 w-28 text-center">
                  Catatan
                </th>
              </tr>
              <tr className="bg-[#4c1212] text-white font-semibold text-[11px] border-b border-[#3b0d0d]">
                <th className="px-2 py-1.5 w-16 border-r border-[#742323] text-center">Jawaban</th>
                <th className="px-2 py-1.5 w-16 border-r border-[#742323] text-center">Nilai</th>
              </tr>
            </thead>

            <tbody>
              {filteredKomponen.map((komponen, kompIdx) => {
                const globalKompIndex = lkeData.findIndex((k) => k.kode === komponen.kode);

                return (
                  <React.Fragment key={komponen.kode}>
                    {/* BARIS UTAMA KOMPONEN (Peach/Salmon Background Identik Gambar) */}
                    <tr className="bg-[#fde2e4] text-slate-900 font-extrabold border-t-2 border-b border-slate-300">
                      <td className="px-3 py-2.5 text-center font-bold border-r border-slate-300 text-slate-900">
                        {komponen.no}
                      </td>
                      <td className="px-4 py-2.5 uppercase tracking-wide border-r border-slate-300 text-slate-900">
                        {komponen.nama}
                      </td>
                      <td className="px-3 py-2.5 text-center font-mono border-r border-slate-300 text-slate-900">
                        {komponen.bobot.toFixed(2)}
                      </td>
                      <td className="px-2 py-2.5 text-center border-r border-slate-300 bg-[#fad2d5]">
                        {/* Empty on Komponen level according to image */}
                      </td>
                      <td className="px-2 py-2.5 text-center font-mono font-black border-r border-slate-300 bg-[#fad2d5] text-slate-900">
                        {komponen.nilai.toFixed(1)}
                      </td>
                      <td className="px-3 py-2.5 text-center font-medium italic text-slate-600">
                        {/* Catatan Komponen */}
                      </td>
                    </tr>

                    {/* SUB-KOMPONEN & KRITERIA LIST */}
                    {komponen.subKomponenList.map((sub, subIdx) => {
                      return (
                        <React.Fragment key={sub.kode}>
                          {/* BARIS SUB-KOMPONEN (Light Peach Identik Gambar) */}
                          <tr className="bg-[#fff1f2] text-slate-900 font-bold border-t border-b border-slate-300">
                            <td className="px-3 py-2 text-center font-mono border-r border-slate-300 text-slate-800">
                              {sub.kode}
                            </td>
                            <td className="px-4 py-2 border-r border-slate-300 text-slate-900">
                              <div className="flex items-center justify-between gap-2">
                                <span>{sub.nama}</span>
                                {onNavigateTab && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const targetTab =
                                        sub.kode === '1.a' ? 'perencanaan-1a' :
                                        sub.kode === '1.b' ? 'perencanaan-1b' :
                                        sub.kode === '1.c' ? 'perencanaan-1c' :
                                        sub.kode === '2.a' ? 'pengukuran-2a' :
                                        sub.kode === '2.b' ? 'pengukuran-2b' :
                                        sub.kode === '2.c' ? 'pengukuran-2c' :
                                        sub.kode === '3.a' ? 'pelaporan-3a' :
                                        sub.kode === '3.b' ? 'pelaporan-3b' :
                                        sub.kode === '3.c' ? 'pelaporan-3c' :
                                        sub.kode === '4.a' ? 'evaluasi-4a' :
                                        sub.kode === '4.b' ? 'evaluasi-4b' :
                                        sub.kode === '4.c' ? 'evaluasi-4c' : null;
                                      if (targetTab) onNavigateTab(targetTab);
                                    }}
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 shrink-0 cursor-pointer transition-colors shadow-2xs ${
                                      sub.kode.startsWith('1.')
                                        ? 'bg-sky-100 hover:bg-sky-200 text-sky-800'
                                        : sub.kode.startsWith('2.')
                                        ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                                        : sub.kode.startsWith('3.')
                                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                                        : 'bg-purple-100 hover:bg-purple-200 text-purple-900'
                                    }`}
                                    title={`Buka Rincian & Input Bukti Dukung ${sub.kode}`}
                                  >
                                    <span>Buka Detail & Bukti {sub.kode} →</span>
                                  </button>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-center font-mono border-r border-slate-300 text-slate-800">
                              {sub.bobot.toFixed(2)}
                            </td>
                            <td className="px-2 py-2 text-center font-mono font-extrabold border-r border-slate-300 bg-white">
                              <span className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 text-slate-900 font-bold">
                                {sub.jawaban}
                              </span>
                            </td>
                            <td className="px-2 py-2 text-center font-mono font-bold border-r border-slate-300 bg-white text-slate-900">
                              {sub.nilai.toFixed(1)}
                            </td>
                            <td className="px-3 py-2 text-center italic text-slate-600 font-medium bg-[#fff1f2]">
                              (Diisi {sub.persenIsian.toFixed(2)})
                            </td>
                          </tr>

                          {/* LABEL KRITERIA: */}
                          <tr className="bg-slate-50/80 border-b border-slate-200">
                            <td className="px-3 py-1 border-r border-slate-300"></td>
                            <td
                              colSpan={4}
                              className="px-4 py-1 text-[11px] font-semibold text-slate-700 italic border-r border-slate-300"
                            >
                              Kriteria:
                            </td>
                            <td className="px-3 py-1 text-center font-mono font-bold text-slate-800 bg-[#fff9db] border-l border-slate-300">
                              {sub.persenIsian.toFixed(2)}
                            </td>
                          </tr>

                          {/* DAFTAR KRITERIA BERURUTAN */}
                          {sub.kriteriaList.map((crit, critIdx) => {
                            // Sesuai gambar, kriteria substantif memiliki baris hijau lembut (bg-[#c8e6c9]/50)
                            const isGreen =
                              sub.kode === '1.b' ||
                              (sub.kode === '1.c' && crit.no <= 2) ||
                              (sub.kode === '2.b' && crit.no >= 2 && crit.no <= 3) ||
                              (sub.kode === '3.b' && crit.no >= 3 && crit.no <= 7);

                            return (
                              <tr
                                key={crit.id}
                                className={`border-b border-slate-200 transition-colors hover:bg-slate-100/80 ${
                                  isGreen ? 'bg-[#dcedc8]/60' : 'bg-white'
                                }`}
                              >
                                <td className="px-3 py-1.5 text-center font-mono text-slate-500 border-r border-slate-300">
                                  {crit.no}
                                </td>
                                <td
                                  className="px-4 py-1.5 text-slate-800 leading-snug border-r border-slate-300"
                                  colSpan={3}
                                >
                                  {crit.pernyataan}
                                </td>
                                <td className="px-2 py-1.5 text-center font-mono font-bold border-r border-slate-300 bg-white">
                                  {/* Empty on Nilai column for criteria */}
                                </td>
                                <td
                                  className={`px-3 py-1.5 text-center font-mono font-bold border-l border-slate-300 ${
                                    crit.skor === 1
                                      ? crit.no === 2 && sub.kode === '1.a'
                                        ? 'bg-[#fff59d]' // kuning seperti gambar
                                        : isGreen
                                        ? 'bg-[#dcedc8]'
                                        : 'bg-[#fff9db]'
                                      : 'bg-rose-100 text-rose-800'
                                  }`}
                                >
                                  {canEdit ? (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleToggleKriteria(globalKompIndex, subIdx, critIdx)
                                      }
                                      className={`w-full py-0.5 rounded font-mono font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:ring-2 hover:ring-emerald-400 ${
                                        crit.skor === 1
                                          ? 'text-slate-900'
                                          : 'text-rose-700 bg-rose-200'
                                      }`}
                                      title="Klik untuk ubah skor (1 atau 0)"
                                    >
                                      <span>{crit.skor}</span>
                                      <ChevronDown className="w-3 h-3 text-slate-400 opacity-60" />
                                    </button>
                                  ) : (
                                    <span>{crit.skor}</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}

                          {/* USIA DOKUMEN (BARIS BIRU IDENTIK GAMBAR 1, 2, 3, 4) */}
                          {sub.usiaDokumen !== undefined && (
                            <tr className="bg-[#b3d4fc] text-slate-900 font-bold border-b border-slate-300">
                              <td className="px-3 py-1.5 border-r border-slate-300"></td>
                              <td
                                colSpan={4}
                                className="px-4 py-1.5 font-bold text-slate-900 border-r border-slate-300"
                              >
                                Usia Dokumen
                              </td>
                              <td className="px-3 py-1.5 text-center font-mono font-bold bg-[#b3d4fc] border-l border-slate-300">
                                {sub.usiaDokumen}
                              </td>
                            </tr>
                          )}

                          {/* UPAYA INOVATIF (BARIS BIRU IDENTIK GAMBAR 1, 2, 3, 4, 5) */}
                          {sub.upayaInovatif !== undefined && (
                            <tr className="bg-[#b3d4fc] text-slate-900 font-bold border-b border-slate-300">
                              <td className="px-3 py-1.5 border-r border-slate-300"></td>
                              <td
                                colSpan={4}
                                className="px-4 py-1.5 font-bold text-slate-900 border-r border-slate-300"
                              >
                                Terdapat upaya inovatif terkait{' '}
                                {sub.kode.startsWith('1')
                                  ? sub.kode === '1.b'
                                    ? 'kualitas perencanaan kinerja'
                                    : 'manfaat perencanaan kinerja'
                                  : sub.kode.startsWith('2')
                                  ? sub.kode === '2.b'
                                    ? 'kualitas pengukuran kinerja'
                                    : 'manfaat pengukuran kinerja'
                                  : sub.kode.startsWith('3')
                                  ? sub.kode === '3.b'
                                    ? 'kualitas pelaporan kinerja'
                                    : 'manfaat pelaporan kinerja'
                                  : sub.kode === '4.b'
                                  ? 'kualitas evaluasi akuntabilitas kinerja internal'
                                  : 'manfaat evaluasi akuntabilitas kinerja internal'}
                              </td>
                              <td className="px-3 py-1.5 text-center font-bold bg-[#b3d4fc] border-l border-slate-300 text-slate-900">
                                Dapat
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </React.Fragment>
                );
              })}

              {/* BARIS TOTAL AKHIR NILAI SAKIP */}
              <tr className="bg-slate-900 text-white font-black text-sm border-t-2 border-slate-900">
                <td colSpan={2} className="px-4 py-3 uppercase tracking-wider text-right">
                  TOTAL NILAI AKUNTABILITAS KINERJA INSTANSI (SAKIP):
                </td>
                <td className="px-3 py-3 text-center font-mono text-emerald-400">100.00</td>
                <td className="px-2 py-3 text-center font-mono">
                  <span className={`px-2 py-0.5 rounded font-black text-xs ${predikatObj.bg}`}>
                    {predikatObj.predikat}
                  </span>
                </td>
                <td className="px-2 py-3 text-center font-mono text-emerald-400 text-base">
                  {roundedTotal.toFixed(1)}
                </td>
                <td className="px-3 py-3 text-center text-xs font-medium text-emerald-300">
                  {predikatObj.kategori}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
