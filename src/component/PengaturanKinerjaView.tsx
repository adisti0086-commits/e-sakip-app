import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Scale,
  Calendar,
  Layers,
  Save,
  RotateCcw,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { BobotSakip, User } from '../types';

interface PengaturanKinerjaViewProps {
  bobotSakip: BobotSakip;
  setBobotSakip: React.Dispatch<React.SetStateAction<BobotSakip>>;
  selectedYear: number;
  setSelectedYear: (y: number) => void;
  currentUser: User;
}

export const PengaturanKinerjaView: React.FC<PengaturanKinerjaViewProps> = ({
  bobotSakip,
  setBobotSakip,
  selectedYear,
  setSelectedYear,
  currentUser,
}) => {
  const [localBobot, setLocalBobot] = useState<BobotSakip>({ ...bobotSakip });
  const [batasHijau, setBatasHijau] = useState<number>(100);
  const [batasKuningMin, setBatasKuningMin] = useState<number>(50);
  const [deadlineT1, setDeadlineT1] = useState('10 April');
  const [deadlineT2, setDeadlineT2] = useState('15 Juli');
  const [deadlineT3, setDeadlineT3] = useState('15 Oktober');
  const [deadlineT4, setDeadlineT4] = useState('20 Januari');
  const [isSaved, setIsSaved] = useState(false);

  const totalBobot =
    Number(localBobot.perencanaan) +
    Number(localBobot.pengukuran) +
    Number(localBobot.pelaporan) +
    Number(localBobot.evaluasiInternal) +
    Number(localBobot.capaianKinerja);

  const isBobotValid = totalBobot === 100;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBobotValid) {
      alert('Total bobot SAKIP harus tepat 100%!');
      return;
    }
    setBobotSakip(localBobot);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleResetPermenpan = () => {
    setLocalBobot({
      perencanaan: 30,
      pengukuran: 30,
      pelaporan: 15,
      evaluasiInternal: 10,
      capaianKinerja: 15,
    });
  };

  const canEdit = currentUser.role === 'administrator' || currentUser.role === 'verifikator';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Intro info */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
        <div className="p-2.5 rounded-lg bg-emerald-50 text-emerald-700">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900">
            Standar Pengaturan SAKIP & Evaluasi Kinerja (PermenPAN-RB No. 88 Tahun 2021)
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Atur proporsi bobot evaluasi 5 pilar akuntabilitas kinerja pemerintah daerah, ambang batas visualisasi warna indikator capaian triwulanan, serta jadwal pembatasan penginputan data.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Bobot Komponen SAKIP */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1. Bobot Komponen Evaluasi SAKIP
              </h4>
              <p className="text-[11px] text-slate-500">
                Nilai akhir SAKIP dihitung berdasarkan akumulasi berbobot dari kelima komponen ini.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full ${
                  isBobotValid
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                Total: {totalBobot}% {isBobotValid ? '(Sesuai 100%)' : '(Harus 100%)'}
              </span>

              {canEdit && (
                <button
                  type="button"
                  onClick={handleResetPermenpan}
                  className="px-2.5 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 rounded-md border border-slate-200 flex items-center gap-1"
                  title="Kembalikan ke Bobot Standar PermenPAN-RB"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset PermenPAN</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-800">1. Perencanaan Kinerja</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={localBobot.perencanaan}
                    onChange={(e) =>
                      setLocalBobot({ ...localBobot, perencanaan: Number(e.target.value) })
                    }
                    className="w-16 p-1 text-center font-bold font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Renstra, IKU, Rencana Kerja Tahunan, Perjanjian Kinerja berjenjang.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-800">2. Pengukuran Kinerja</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={localBobot.pengukuran}
                    onChange={(e) =>
                      setLocalBobot({ ...localBobot, pengukuran: Number(e.target.value) })
                    }
                    className="w-16 p-1 text-center font-bold font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Sistem E-SAKIP, data dukung periodik bulanan/triwulanan, pemanfaatan hasil ukur.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-800">3. Pelaporan Kinerja</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={localBobot.pelaporan}
                    onChange={(e) =>
                      setLocalBobot({ ...localBobot, pelaporan: Number(e.target.value) })
                    }
                    className="w-16 p-1 text-center font-bold font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Penyusunan LAKIP tepat waktu, kualitas analisis efisiensi, dan publikasi terbuka.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-800">4. Evaluasi Akuntabilitas Internal</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={localBobot.evaluasiInternal}
                    onChange={(e) =>
                      setLocalBobot({ ...localBobot, evaluasiInternal: Number(e.target.value) })
                    }
                    className="w-16 p-1 text-center font-bold font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Evaluasi mandiri berkala OPD & tindak lanjut rekomendasi LHE sebelumnya.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 sm:col-span-2">
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-800">5. Capaian Kinerja</label>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    disabled={!canEdit}
                    value={localBobot.capaianKinerja}
                    onChange={(e) =>
                      setLocalBobot({ ...localBobot, capaianKinerja: Number(e.target.value) })
                    }
                    className="w-16 p-1 text-center font-bold font-mono bg-white border border-slate-300 rounded text-xs"
                  />
                  <span className="font-bold text-slate-600">%</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500">
                Capaian realisasi IKU strategis, efisiensi anggaran, dan inovasi pelayanan publik.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Ambang Batas Warna Kinerja */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              2. Konfigurasi Ambang Batas Warna Kinerja Triwulan
            </h4>
            <p className="text-[11px] text-slate-500">
              Sesuai dengan ketentuan operasional SAKIP daerah (Hijau, Kuning, Merah).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-600" />
                <span className="font-bold text-emerald-950">HIJAU (Tercapai / Melebihi)</span>
              </div>
              <p className="text-slate-600 text-[11px] mb-2">Batas Minimal Capaian:</p>
              <div className="flex items-center gap-1 font-mono font-bold text-emerald-700">
                <span>≥</span>
                <input
                  type="number"
                  disabled={!canEdit}
                  value={batasHijau}
                  onChange={(e) => setBatasHijau(Number(e.target.value))}
                  className="w-16 p-1 text-center bg-white border border-emerald-300 rounded text-xs font-bold"
                />
                <span>%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                <span className="font-bold text-amber-950">KUNING (Cukup / Perhatian)</span>
              </div>
              <p className="text-slate-600 text-[11px] mb-2">Rentang Capaian:</p>
              <div className="flex items-center gap-1 font-mono font-bold text-amber-700">
                <input
                  type="number"
                  disabled={!canEdit}
                  value={batasKuningMin}
                  onChange={(e) => setBatasKuningMin(Number(e.target.value))}
                  className="w-16 p-1 text-center bg-white border border-amber-300 rounded text-xs font-bold"
                />
                <span>% s.d. 99.9%</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3.5 h-3.5 rounded-full bg-rose-600" />
                <span className="font-bold text-rose-950">MERAH (Kritis / Rendah)</span>
              </div>
              <p className="text-slate-600 text-[11px] mb-2">Kondisi Realisasi:</p>
              <div className="flex items-center gap-1 font-mono font-bold text-rose-700">
                <span>&lt; {batasKuningMin}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Batas Waktu Pelaporan Triwulan */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              3. Jadwal Batas Waktu (Deadline) Penginputan Capaian Triwulan
            </h4>
            <p className="text-[11px] text-slate-500">
              Pengaturan batas waktu penguncian penginputan realisasi bagi Operator OPD.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Triwulan I (T1)</label>
              <input
                type="text"
                disabled={!canEdit}
                value={deadlineT1}
                onChange={(e) => setDeadlineT1(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Triwulan II (T2)</label>
              <input
                type="text"
                disabled={!canEdit}
                value={deadlineT2}
                onChange={(e) => setDeadlineT2(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Triwulan III (T3)</label>
              <input
                type="text"
                disabled={!canEdit}
                value={deadlineT3}
                onChange={(e) => setDeadlineT3(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-700 block mb-1">Triwulan IV (T4)</label>
              <input
                type="text"
                disabled={!canEdit}
                value={deadlineT4}
                onChange={(e) => setDeadlineT4(e.target.value)}
                className="w-full p-2 border border-slate-200 rounded-lg text-slate-800 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        {canEdit && (
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSaved && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Pengaturan berhasil disimpan!
              </span>
            )}
            <button
              type="submit"
              disabled={!isBobotValid}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Kinerja</span>
            </button>
          </div>
        )}
      </form>
    </div>
  );
};
