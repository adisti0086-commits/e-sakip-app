import React, { useState } from 'react';
import {
  X,
  Shield,
  UserCheck,
  KeyRound,
  LogIn,
  LogOut,
  CheckCircle2,
  Lock,
  Building2,
  Sparkles,
  Info,
  Sliders,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { User, UserRole, OPD } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  onSelectUser: (user: User) => void;
  users: User[];
  opdList: OPD[];
  onLogout?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  users,
  opdList,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'form' | 'matrix'>('quick');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [selectedRoleForForm, setSelectedRoleForForm] = useState<UserRole>('administrator');
  const [loginMessage, setLoginMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const roleCredentials: Record<
    UserRole,
    {
      username: string;
      roleName: string;
      color: string;
      activeColor: string;
      badgeBg: string;
      desc: string;
      permissions: string[];
    }
  > = {
    administrator: {
      username: 'admin',
      roleName: '1. Administrator SAKIP',
      color: 'border-rose-500/40 bg-rose-950/20 hover:border-rose-500',
      activeColor: 'ring-2 ring-rose-500 border-rose-500 bg-rose-950/40',
      badgeBg: 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-900/60 dark:text-rose-200 dark:border-rose-700',
      desc: 'Pengelola utama sistem, master data OPD, master user, renstra, dan konfigurasi bobot evaluasi.',
      permissions: [
        'Kelola Master OPD & 4 Role Pengguna',
        'Pohon Kinerja Cascading & Renstra 5 Tahun',
        'Konfigurasi Bobot SAKIP (PermenPAN-RB 88/2021)',
        'Monitor Seluruh Capaian & Ekspor Data',
      ],
    },
    operator_unit: {
      username: 'operator_bappeda',
      roleName: '2. Operator Unit OPD',
      color: 'border-sky-500/40 bg-sky-950/20 hover:border-sky-500',
      activeColor: 'ring-2 ring-sky-500 border-sky-500 bg-sky-950/40',
      badgeBg: 'bg-sky-100 text-sky-800 border-sky-300 dark:bg-sky-900/60 dark:text-sky-200 dark:border-sky-700',
      desc: 'Penanggung jawab input perjanjian kinerja, target triwulan, dan realisasi bulanan OPD.',
      permissions: [
        'Input Perjanjian Kinerja & Indikator IKU/IKP',
        'Set Target Triwulan 1 s/d 4 (Polarisasi & Formula)',
        'Entri Realisasi Bulanan & Upload Evidens Link/File',
        'Pantau Progres Capaian OPD Sendiri',
      ],
    },
    validator: {
      username: 'validator_sakip',
      roleName: '3. Validator Kinerja',
      color: 'border-amber-500/40 bg-amber-950/20 hover:border-amber-500',
      activeColor: 'ring-2 ring-amber-500 border-amber-500 bg-amber-950/40',
      badgeBg: 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-900/60 dark:text-amber-200 dark:border-amber-700',
      desc: 'Verifikator dokumen evidens dan penilai kepatuhan capaian bulanan/triwulan unit kerja.',
      permissions: [
        'Verifikasi Kelayakan Evidens Dukung Capaian',
        'Validasi Status Realisasi (Draft → Verified / Reject)',
        'Beri Catatan Rekomendasi Perbaikan Capaian',
        'Analisis Matriks Triwulan (Hijau/Kuning/Merah)',
      ],
    },
    verifikator: {
      username: 'evaluator_inspektorat',
      roleName: '4. Verifikator / Evaluator LHE',
      color: 'border-emerald-500/40 bg-emerald-950/20 hover:border-emerald-500',
      activeColor: 'ring-2 ring-emerald-500 border-emerald-500 bg-emerald-950/40',
      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-900/60 dark:text-emerald-200 dark:border-emerald-700',
      desc: 'Tim Inspektorat pengisi LKE AKIP, penerbit LHE, rekomendasi tindak lanjut, dan cetak laporan.',
      permissions: [
        'Pengisian Lembar Kerja Evaluasi AKIP (Skor 1/0)',
        'Kalkulasi Otomatis 5 Komponen PermenPAN-RB 88/2021',
        'Penerbitan Predikat (AA, A, BB, B, CC, C, D)',
        'Cetak Resmi LHE & Rekomendasi Tindak Lanjut',
      ],
    },
  };

  const handleSelectUser = (user: User) => {
    onSelectUser(user);
    setLoginMessage({
      type: 'success',
      text: `Berhasil login sebagai ${user.name} (${user.roleTitle})`,
    });
    setTimeout(() => {
      onClose();
      setLoginMessage(null);
    }, 600);
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedUser = (users || []).find((u) => u.role === selectedRoleForForm) || users?.[0];
    if (matchedUser) {
      handleSelectUser(matchedUser);
    }
  };

  const setFormPreset = (role: UserRole) => {
    setSelectedRoleForForm(role);
    setUsername(roleCredentials[role].username);
    setPassword('password123');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[92vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Header Modal */}
        <div className="p-4 sm:p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-600/30 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Menu Login & Simulasi 4 User SAKIP</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  PermenPAN-RB 88/2021
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Pilih profil pengguna untuk menguji hak akses dan alur kerja Sistem Akuntabilitas Kinerja
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-800 bg-slate-900/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('quick')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'quick'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>1-Klik Pilih User (4 Profil Demo)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('form')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'form'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>Form Login Manual</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`pb-3 px-3 border-b-2 flex items-center gap-1.5 transition-colors cursor-pointer ${
              activeTab === 'matrix'
                ? 'border-emerald-500 text-emerald-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Matriks Izin & Kewenangan (RBAC)</span>
          </button>
        </div>

        {/* Success / Error Notification */}
        {loginMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{loginMessage.text}</span>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: 1-Klik Pilih User */}
          {activeTab === 'quick' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Daftar 4 Akun Pengguna Tersedia:
                </span>
                <span className="text-[11px] text-slate-400">Klik kartu di bawah untuk login instan</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {users.map((user, idx) => {
                  const cred = roleCredentials[user.role];
                  const isCurrent = currentUser.id === user.id;

                  return (
                    <div
                      key={user.id}
                      onClick={() => handleSelectUser(user)}
                      className={`relative p-4 rounded-xl border transition-all cursor-pointer group flex flex-col justify-between ${
                        isCurrent ? cred.activeColor : cred.color
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span
                            className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border shadow-xs ${cred.badgeBg}`}
                          >
                            {cred.roleName}
                          </span>
                          {isCurrent && (
                            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              Sedang Aktif
                            </span>
                          )}
                        </div>

                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                          {user.name}
                        </h3>
                        <p className="text-xs text-slate-300 mt-0.5 font-medium">{user.opdName}</p>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIP: {user.nip}</p>

                        <div className="mt-2.5 pt-2 border-t border-slate-700/60">
                          <p className="text-[11px] text-slate-300 leading-snug">{cred.desc}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs">
                        <span className="text-[11px] text-slate-400 font-mono">
                          User: <strong className="text-slate-200">{cred.username}</strong> | Pass: <strong className="text-slate-200">password123</strong>
                        </span>
                        <span className="text-xs font-bold text-emerald-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                          Pilih User <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Form Login Manual */}
          {activeTab === 'form' && (
            <div className="max-w-xl mx-auto space-y-5">
              <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-xs">
                <span className="font-bold text-slate-200 block mb-2">Pilih Preset Role Cepat:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormPreset('administrator')}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer border ${
                      selectedRoleForForm === 'administrator'
                        ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    1. Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPreset('operator_unit')}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer border ${
                      selectedRoleForForm === 'operator_unit'
                        ? 'bg-sky-600 text-white border-sky-400 shadow-md'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    2. Operator
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPreset('validator')}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer border ${
                      selectedRoleForForm === 'validator'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    3. Validator
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormPreset('verifikator')}
                    className={`p-2 rounded-lg text-center font-bold text-[11px] transition-all cursor-pointer border ${
                      selectedRoleForForm === 'verifikator'
                        ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                        : 'bg-slate-700/60 text-slate-300 border-slate-600 hover:bg-slate-700'
                    }`}
                  >
                    4. Verifikator
                  </button>
                </div>
              </div>

              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Username / ID Pengguna
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Masukkan username..."
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Password / Kata Sandi
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm focus:border-emerald-500 focus:outline-none"
                      placeholder="Masukkan password..."
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Demo Password: <code className="text-emerald-400 font-mono">password123</code>
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk ke Sistem E-SAKIP</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: Matriks Hak Akses RBAC */}
          {activeTab === 'matrix' && (
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Aplikasi E-SAKIP menerapkan <strong>Role-Based Access Control (RBAC)</strong> sesuai dengan tugas pokok dan fungsi tata kelola kinerja pemerintah:
              </p>

              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-slate-200 border-b border-slate-700">
                      <th className="p-3 font-bold">Fitur / Modul SAKIP</th>
                      <th className="p-3 font-bold text-rose-400 text-center">1. Admin</th>
                      <th className="p-3 font-bold text-sky-400 text-center">2. Operator</th>
                      <th className="p-3 font-bold text-amber-400 text-center">3. Validator</th>
                      <th className="p-3 font-bold text-emerald-400 text-center">4. Verifikator</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Master Data OPD & 4 Role Pengguna</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Master Renstra & Pohon Kinerja Cascading</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Konfigurasi Bobot SAKIP (PermenPAN-RB)</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Ubah</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Input Perjanjian Kinerja (PK) & Target TW</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Input OPD</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Entri Capaian Bulanan & Upload Evidens</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Entri OPD</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Verifikasi Dokumen & Validasi Realisasi</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-slate-500">-</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Validasi</td>
                      <td className="p-3 text-center text-slate-300">Lihat</td>
                    </tr>
                    <tr className="hover:bg-slate-800/40">
                      <td className="p-3 font-medium">Evaluasi AKIP (Skor Biner 1/0) & Terbit LHE</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Full Akses</td>
                      <td className="p-3 text-center text-slate-300">Lihat LHE</td>
                      <td className="p-3 text-center text-slate-300">Lihat LHE</td>
                      <td className="p-3 text-center text-emerald-400 font-bold">Evaluator</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Pengguna saat ini: <strong className="text-slate-200">{currentUser.name}</strong> ({currentUser.roleTitle})</span>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Log Out</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold transition-colors cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
