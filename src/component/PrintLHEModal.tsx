import React from 'react';
import { Printer, X, Award, Check, FileText } from 'lucide-react';
import { LHEEvaluation, BobotSakip } from '../../utils/types';
import { hitungNilaiLHE } from '../../data/initialData';

interface PrintLHEModalProps {
  lhe: LHEEvaluation;
  opdName: string;
  bobotSakip: BobotSakip;
  onClose: () => void;
}

export const PrintLHEModal: React.FC<PrintLHEModalProps> = ({
  lhe,
  opdName,
  bobotSakip,
  onClose,
}) => {
  const result = hitungNilaiLHE(lhe.kriteriaList, bobotSakip);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 max-h-[94vh] flex flex-col">
        {/* Modal Controls Top */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Pratinjau Cetak Format Resmi LHE SAKIP
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Paper */}
        <div className="flex-1 overflow-y-auto mt-4 p-8 bg-white border border-slate-200 rounded-xl font-serif text-slate-900 print:border-0 print:p-0">
          {/* Official Letterhead (Kop Surat) */}
          <div className="text-center pb-4 border-b-4 border-double border-slate-900 mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-slate-800">
              Pemerintah Daerah Provinsi / Kabupaten / Kota
            </h2>
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
              INSPEKTORAT DAERAH
            </h1>
            <p className="text-[11px] font-sans text-slate-600">
              Jalan Pemuda No. 1 Kompleks Perkantoran Pemerintah Daerah • Telp: (021) 7890123 • Email: inspektorat@pemda.go.id
            </p>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h3 className="text-base font-bold uppercase tracking-wide underline underline-offset-4">
              LAPORAN HASIL EVALUASI AKUNTABILITAS KINERJA INSTANSI PEMERINTAH (LHE SAKIP)
            </h3>
            <p className="text-xs font-sans font-semibold text-slate-700 mt-1">
              Nomor: {lhe.nomorSuratLHE}
            </p>
            <p className="text-xs font-sans text-slate-600">
              Tahun Evaluasi: {lhe.tahun}
            </p>
          </div>

          {/* OPD Info */}
          <div className="mb-6 font-sans text-xs space-y-1">
            <div className="flex">
              <span className="w-44 font-semibold text-slate-600">Perangkat Daerah yang Dievaluasi</span>
              <span className="font-bold text-slate-900">: {opdName}</span>
            </div>
            <div className="flex">
              <span className="w-44 font-semibold text-slate-600">Tanggal Pelaksanaan Evaluasi</span>
              <span className="text-slate-800">: {lhe.tanggalEvaluasi}</span>
            </div>
            <div className="flex">
              <span className="w-44 font-semibold text-slate-600">Tim Evaluator AKIP</span>
              <span className="text-slate-800">: {lhe.evaluatorNama}</span>
            </div>
          </div>

          {/* Ringkasan Skor & Predikat */}
          <div className="mb-6 border-2 border-slate-900 rounded-lg p-4 font-sans bg-slate-50">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] uppercase font-bold text-slate-600 block">
                  Nilai Akhir Evaluasi Akuntabilitas Kinerja
                </span>
                <span className="text-3xl font-black font-mono text-slate-900">
                  {result.nilaiTotal}
                </span>
                <span className="text-sm font-semibold text-slate-600"> / 100 Poin</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] uppercase font-bold text-slate-600 block">
                  Predikat Tingkat Akuntabilitas
                </span>
                <span className="text-2xl font-black px-4 py-1 rounded bg-slate-900 text-white inline-block">
                  {result.predikat}
                </span>
                <span className="block text-xs font-bold text-slate-800 mt-1">
                  ({result.kategori})
                </span>
              </div>
            </div>
          </div>

          {/* Tabel Nilai 5 Komponen SAKIP */}
          <div className="mb-6">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
              I. Rincian Capaian Nilai per Komponen Evaluasi SAKIP
            </h4>
            <table className="w-full text-left font-sans text-xs border-collapse border border-slate-400">
              <thead className="bg-slate-200 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th className="border border-slate-400 px-3 py-2 text-center w-8">No</th>
                  <th className="border border-slate-400 px-3 py-2">Komponen Evaluasi</th>
                  <th className="border border-slate-400 px-3 py-2 text-center">Bobot Standar</th>
                  <th className="border border-slate-400 px-3 py-2 text-center">Nilai Tercapai</th>
                  <th className="border border-slate-400 px-3 py-2 text-center">% Efektivitas</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(result.skorKomponen).map(([namaKomponen, detail], idx) => (
                  <tr key={namaKomponen}>
                    <td className="border border-slate-400 px-3 py-1.5 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-400 px-3 py-1.5 font-semibold">{namaKomponen}</td>
                    <td className="border border-slate-400 px-3 py-1.5 text-center font-mono">{detail.totalBobot}%</td>
                    <td className="border border-slate-400 px-3 py-1.5 text-center font-mono font-bold text-slate-900">
                      {detail.skorDidapat}
                    </td>
                    <td className="border border-slate-400 px-3 py-1.5 text-center font-mono">
                      {detail.persen}%
                    </td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td colSpan={2} className="border border-slate-400 px-3 py-2 text-right">
                    TOTAL NILAI AKUNTABILITAS (SAKIP)
                  </td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-mono">100%</td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-mono font-black text-sm text-emerald-800">
                    {result.nilaiTotal}
                  </td>
                  <td className="border border-slate-400 px-3 py-2 text-center font-mono font-black">
                    {result.predikat}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Lembar Kerja Penilaian 1/0 */}
          <div className="mb-6">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
              II. Lembar Kerja Evaluasi Parameter (Penilaian 1/0)
            </h4>
            <table className="w-full text-left font-sans text-[11px] border-collapse border border-slate-400">
              <thead className="bg-slate-200 font-bold text-slate-800">
                <tr>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-8">No</th>
                  <th className="border border-slate-400 px-2 py-1.5">Komponen / Sub-Komponen</th>
                  <th className="border border-slate-400 px-2 py-1.5">Parameter Indikator Standar</th>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Skor (1/0)</th>
                </tr>
              </thead>
              <tbody>
                {lhe.kriteriaList.map((k, idx) => (
                  <tr key={k.id}>
                    <td className="border border-slate-400 px-2 py-1 text-center font-mono">{idx + 1}</td>
                    <td className="border border-slate-400 px-2 py-1">
                      <strong>{k.komponen}</strong> - {k.subKomponen}
                    </td>
                    <td className="border border-slate-400 px-2 py-1">{k.parameter}</td>
                    <td className="border border-slate-400 px-2 py-1 text-center font-black font-mono">
                      {k.skor === 1 ? '1 (Ya)' : '0 (Tidak)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Catatan Evaluasi & Rekomendasi */}
          <div className="mb-8 font-sans text-xs space-y-4">
            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-1">
                III. Catatan & Temuan Evaluator
              </h4>
              <p className="p-3 bg-slate-50 border border-slate-300 rounded text-slate-800 leading-relaxed text-justify">
                {lhe.catatanEvaluasiUmum}
              </p>
            </div>

            <div>
              <h4 className="font-bold uppercase tracking-wider text-slate-900 mb-1">
                IV. Rekomendasi Perbaikan untuk Perangkat Daerah
              </h4>
              <ol className="list-decimal list-inside space-y-1 p-3 bg-slate-50 border border-slate-300 rounded text-slate-800 leading-relaxed">
                {lhe.rekomendasiPerbaikan.map((rek, idx) => (
                  <li key={idx} className="text-justify">
                    {rek}
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Signature Block */}
          <div className="font-sans text-xs flex justify-between items-start pt-6 border-t border-slate-300">
            <div>
              <p className="text-slate-600">Mengetahui,</p>
              <p className="font-bold text-slate-900">Kepala {opdName}</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 underline">................................................</p>
              <p className="text-[10px] text-slate-500">NIP. ........................................</p>
            </div>

            <div className="text-right">
              <p className="text-slate-600">Ditetapkan pada: {lhe.tanggalEvaluasi}</p>
              <p className="font-bold text-slate-900">Tim Evaluator SAKIP Inspektorat Daerah</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 underline">{lhe.evaluatorNama}</p>
              <p className="text-[10px] text-slate-500">NIP. 19840215 200801 1 004</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
