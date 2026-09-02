import React from 'react';
import { Printer, X, Award, Check, FileText } from 'lucide-react';
import { LHEEvaluation, BobotSakip } from '../types';
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
              Kementerian Kesehatan Republik Indonesia
            </h2>
            <h1 className="text-lg font-black uppercase tracking-wider text-slate-900">
              INSPEKTORAT JENDERAL
            </h1>
            <p className="text-[11px] font-sans text-slate-600">
              Jl. H.R. Rasuna Said Blok X-5 Kav. 4-9 Jakarta 12950 • Telp: (021) 5201590 • Email: itjen@kemkes.go.id
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
              <span className="w-44 font-semibold text-slate-600">Unit Kerja yang Dievaluasi</span>
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

          {/* Tabel Nilai Komponen, Sub-Komponen, dan Kriteria SAKIP PermenPAN-RB No. 88/2021 */}
          <div className="mb-6">
            <h4 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-900 mb-2">
              I. Rincian Evaluasi Komponen, Sub-Komponen & Kriteria SAKIP
            </h4>
            <table className="w-full text-left font-sans text-[11px] border-collapse border border-slate-400">
              <thead className="bg-slate-200 font-bold text-slate-800 text-[11px]">
                <tr>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-12">No</th>
                  <th className="border border-slate-400 px-3 py-1.5">Komponen / Sub Komponen / Kriteria</th>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Bobot</th>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-16">Nilai</th>
                  <th className="border border-slate-400 px-2 py-1.5 text-center w-16">%</th>
                </tr>
              </thead>
              <tbody>
                {/* 1. PERENCANAAN KINERJA */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">1</td>
                  <td className="border border-slate-400 px-3 py-1 uppercase">PERENCANAAN KINERJA</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">30.00</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PERENCANAAN KINERJA']?.skorDidapat.toFixed(2) || '24.00'}
                  </td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PERENCANAAN KINERJA']?.persen.toFixed(2) || '80.00'}%
                  </td>
                </tr>
                {lhe.kriteriaList
                  .filter((k) => k.komponen.toUpperCase().includes('PERENCANAAN'))
                  .map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-700">
                        {k.kode || '1.x'}
                      </td>
                      <td className="border border-slate-400 px-3 py-1 text-slate-800 leading-snug">
                        {k.kriteria || k.parameter}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.bobotKriteria.toFixed(2)}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-900">
                        {k.nilai !== undefined ? k.nilai.toFixed(2) : (k.skor === 1 ? k.bobotKriteria.toFixed(2) : '0.00')}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.persen !== undefined ? `${k.persen.toFixed(2)}%` : (k.skor === 1 ? '100.00%' : '0.00%')}
                      </td>
                    </tr>
                  ))}

                {/* 2. PENGUKURAN KINERJA */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">2</td>
                  <td className="border border-slate-400 px-3 py-1 uppercase">PENGUKURAN KINERJA</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">30.00</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PENGUKURAN KINERJA']?.skorDidapat.toFixed(2) || '27.60'}
                  </td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PENGUKURAN KINERJA']?.persen.toFixed(2) || '92.00'}%
                  </td>
                </tr>
                {lhe.kriteriaList
                  .filter((k) => k.komponen.toUpperCase().includes('PENGUKURAN'))
                  .map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-700">
                        {k.kode || '2.x'}
                      </td>
                      <td className="border border-slate-400 px-3 py-1 text-slate-800 leading-snug">
                        {k.kriteria || k.parameter}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.bobotKriteria.toFixed(2)}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-900">
                        {k.nilai !== undefined ? k.nilai.toFixed(2) : (k.skor === 1 ? k.bobotKriteria.toFixed(2) : '0.00')}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.persen !== undefined ? `${k.persen.toFixed(2)}%` : (k.skor === 1 ? '100.00%' : '0.00%')}
                      </td>
                    </tr>
                  ))}

                {/* 3. PELAPORAN KINERJA */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">3</td>
                  <td className="border border-slate-400 px-3 py-1 uppercase">PELAPORAN KINERJA</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">15.00</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PELAPORAN KINERJA']?.skorDidapat.toFixed(2) || '13.50'}
                  </td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['PELAPORAN KINERJA']?.persen.toFixed(2) || '90.00'}%
                  </td>
                </tr>
                {lhe.kriteriaList
                  .filter((k) => k.komponen.toUpperCase().includes('PELAPORAN'))
                  .map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-700">
                        {k.kode || '3.x'}
                      </td>
                      <td className="border border-slate-400 px-3 py-1 text-slate-800 leading-snug">
                        {k.kriteria || k.parameter}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.bobotKriteria.toFixed(2)}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-900">
                        {k.nilai !== undefined ? k.nilai.toFixed(2) : (k.skor === 1 ? k.bobotKriteria.toFixed(2) : '0.00')}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.persen !== undefined ? `${k.persen.toFixed(2)}%` : (k.skor === 1 ? '100.00%' : '0.00%')}
                      </td>
                    </tr>
                  ))}

                {/* 4. EVALUASI AKUNTABILITAS KINERJA INTERNAL */}
                <tr className="bg-slate-100 font-bold text-slate-900">
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">4</td>
                  <td className="border border-slate-400 px-3 py-1 uppercase">EVALUASI AKUNTABILITAS KINERJA INTERNAL</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">25.00</td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['EVALUASI AKUNTABILITAS KINERJA INTERNAL']?.skorDidapat.toFixed(2) || '23.00'}
                  </td>
                  <td className="border border-slate-400 px-2 py-1 text-center font-mono">
                    {result.skorKomponen['EVALUASI AKUNTABILITAS KINERJA INTERNAL']?.persen.toFixed(2) || '92.00'}%
                  </td>
                </tr>
                {lhe.kriteriaList
                  .filter((k) => k.komponen.toUpperCase().includes('EVALUASI'))
                  .map((k) => (
                    <tr key={k.id} className="hover:bg-slate-50">
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-700">
                        {k.kode || '4.x'}
                      </td>
                      <td className="border border-slate-400 px-3 py-1 text-slate-800 leading-snug">
                        {k.kriteria || k.parameter}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.bobotKriteria.toFixed(2)}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono font-semibold text-slate-900">
                        {k.nilai !== undefined ? k.nilai.toFixed(2) : (k.skor === 1 ? k.bobotKriteria.toFixed(2) : '0.00')}
                      </td>
                      <td className="border border-slate-400 px-2 py-1 text-center font-mono text-slate-700">
                        {k.persen !== undefined ? `${k.persen.toFixed(2)}%` : (k.skor === 1 ? '100.00%' : '0.00%')}
                      </td>
                    </tr>
                  ))}

                {/* FOOTER TOTAL */}
                <tr className="bg-slate-200 font-black text-slate-900">
                  <td colSpan={2} className="border border-slate-400 px-3 py-2 text-right uppercase">
                    Nilai Akuntabilitas Kinerja / Kategori Predikat
                  </td>
                  <td className="border border-slate-400 px-2 py-2 text-center font-mono">100.00</td>
                  <td className="border border-slate-400 px-2 py-2 text-center font-mono font-black text-sm text-emerald-900">
                    {result.nilaiTotal.toFixed(2)}
                  </td>
                  <td className="border border-slate-400 px-2 py-2 text-center font-mono font-black text-sm text-emerald-900">
                    {result.predikat}
                  </td>
                </tr>
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
                IV. Rekomendasi Perbaikan untuk Unit Kerja
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
              <p className="font-bold text-slate-900">Kepala / Direktur {opdName}</p>
              <div className="h-16" />
              <p className="font-bold text-slate-900 underline">................................................</p>
              <p className="text-[10px] text-slate-500">NIP. ........................................</p>
            </div>

            <div className="text-right">
              <p className="text-slate-600">Ditetapkan pada: {lhe.tanggalEvaluasi}</p>
              <p className="font-bold text-slate-900">Tim Evaluator SAKIP Inspektorat Jenderal Kemenkes</p>
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
