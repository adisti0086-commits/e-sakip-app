import React, { useState } from 'react';
import {
  Shield,
  Award,
  KeyRound,
  LogIn,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Sparkles,
  FileCheck2,
  PieChart,
  Target,
  ArrowRight,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { User as UserType, UserRole, OPD } from '../types';

interface LoginPageProps {
  onLoginSuccess: (user: UserType, selectedYear: number) => void;
  users: UserType[];
  opdList: OPD[];
  defaultYear?: number;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  users,
  opdList,
  defaultYear = 2025,
}) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(defaultYear);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeRoleTab, setActiveRoleTab] = useState<UserRole>('administrator');

  // Role details metadata for quick-select
  const roleCards: {
    role: UserRole;
    username: string;
    label: string;
    badgeColor: string;
    activeBorder: string;
    iconColor: string;
    description: string;
    responsibilities: string[];
  }[] = [
    {
      role: 'administrator',
      username: 'admin',
      label: '1. Administrator',
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      activeBorder: 'border-rose-500 bg-rose-950/30 ring-2 ring-rose-500/40',
      iconColor: 'text-rose-400',
      description: 'Pengelola Master Renstra, Bobot SAKIP, Master OPD & seluruh data.',
      responsibilities: ['Master OPD & 4 User', 'Cascading Renstra', 'Bobot PermenPAN-RB 88/2021'],
    },
    {
      role: 'operator_unit',
      username: 'operator',
      label: '2. Operator',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
      activeBorder: 'border-sky-500 bg-sky-950/30 ring-2 ring-sky-500/40',
      iconColor: 'text-sky-400',
      description: 'Penanggung jawab Perjanjian Kinerja, Target Triwulan & Realisasi Bulanan.',
      responsibilities: ['Input 18 Indikator PK', 'Target T1 - T4', 'Upload Evidens Dukung'],
    },
    {
      role: 'validator',
      username: 'validator',
      label: '3. Validator',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      activeBorder: 'border-amber-500 bg-amber-950/30 ring-2 ring-amber-500/40',
      iconColor: 'text-amber-400',
      description: 'Verifikator dokumen evidens dan penilai kepatuhan realisasi capaian.',
      responsibilities: ['Verifikasi Evidens', 'Validasi Status Capaian', 'Matriks Hijau/Kuning/Merah'],
    },
    {
      role: 'verifikator',
      username: 'verifikator',
      label: '4. Verifikator',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      activeBorder: 'border-emerald-500 bg-emerald-950/30 ring-2 ring-emerald-500/40',
      iconColor: 'text-emerald-400',
      description: 'Tim Evaluator pengisi LKE AKIP, penerbit LHE, dan nilai predikat SAKIP.',
      responsibilities: ['Evaluasi LHE Skor 1/0', 'Kalkulasi 4 Komponen', 'Cetak LHE & Predikat'],
    },
  ];

  const handleSelectRolePreset = (role: UserRole, directLogin = false) => {
    setActiveRoleTab(role);
    const targetCard = roleCards.find((r) => r.role === role);
    if (targetCard) {
      setUsername(targetCard.username);
      setPassword('password123');
      setErrorMessage(null);

      if (directLogin) {
        performLogin(targetCard.username, 'password123', role);
      }
    }
  };

  const performLogin = (inputUser: string, inputPass: string, forcedRole?: UserRole) => {
    setIsLoading(true);
    setErrorMessage(null);

    setTimeout(() => {
      // Find matching user by role, username, or email
      let matchedUser: UserType | undefined;

      if (forcedRole) {
        matchedUser = users.find((u) => u.role === forcedRole);
      } else {
        const uLower = inputUser.trim().toLowerCase();
        if (uLower.includes('admin')) {
          matchedUser = users.find((u) => u.role === 'administrator');
        } else if (uLower.includes('operator') || uLower.includes('rahmi') || uLower.includes('pk')) {
          matchedUser = users.find((u) => u.role === 'operator_unit');
        } else if (uLower.includes('valid') || uLower.includes('hendra') || uLower.includes('yankes')) {
          matchedUser = users.find((u) => u.role === 'validator');
        } else if (uLower.includes('verif') || uLower.includes('eval') || uLower.includes('ahmad') || uLower.includes('itjen')) {
          matchedUser = users.find((u) => u.role === 'verifikator');
        } else {
          matchedUser = users.find(
            (u) =>
              u.email.toLowerCase().includes(uLower) ||
              u.name.toLowerCase().includes(uLower) ||
              u.nip.replace(/\s/g, '').includes(uLower.replace(/\s/g, ''))
          );
        }
      }

      if (!matchedUser) {
        // Default to active selected role if not strictly matched
        matchedUser = users.find((u) => u.role === activeRoleTab) || users[0];
      }

      if (matchedUser) {
        setIsLoading(false);
        onLoginSuccess(matchedUser, selectedYear);
      } else {
        setIsLoading(false);
        setErrorMessage('Username atau kata sandi tidak ditemukan dalam sistem SAKIP.');
      }
    }, 450);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setErrorMessage('Silakan masukkan Username, Email, atau NIP.');
      return;
    }
    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi.');
      return;
    }
    performLogin(username, password);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Background Decorative Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar / Branding */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-black text-xl">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white">SAKElek</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  RSUP DR. M DJAMIL
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-normal hidden sm:block">
                Sistem Akuntabilitas Kinerja Instansi Pemerintah - Kemenkes RI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/80 text-xs text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Standar PermenPAN-RB No. 88/2021</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-md bg-emerald-600 text-white font-bold">
              TA {selectedYear}
            </span>
          </div>
        </div>
      </header>

      {/* Main Login Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 z-10">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Form Login Box */}
          <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 relative overflow-hidden">
            {/* Header Form */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Portal Autentikasi Pengguna</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Masuk ke SAKElek
              </h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Silakan masukkan kredensial atau pilih akun simulasi untuk mulai mengelola akuntabilitas kinerja.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-200 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                  Username / NIP / Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Contoh: admin, operator, validator, verifikator"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Kata Sandi
                  </label>
                  <span className="text-[11px] text-slate-400 font-mono">Default: password123</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi..."
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Tahun Anggaran & Ingat Saya */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                    Tahun Anggaran (TA)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Calendar className="w-3.5 h-3.5" />
                    </div>
                    <select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(Number(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
                    >
                      <option value={2024}>TA 2024</option>
                      <option value={2025}>TA 2025 (Aktif)</option>
                      <option value={2026}>TA 2026 (Perencanaan)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center sm:pt-6">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>Ingat Saya di Perangkat Ini</span>
                  </label>
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-700/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Memverifikasi Akses...</span>
                    </div>
                  ) : (
                    <>
                      <LogIn className="w-4 h-4" />
                      <span>Masuk ke Sistem SAKElek</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-400">
              <span>Instansi: </span>
              <strong className="text-slate-300">RSUP Dr. M Djamil Padang</strong> - Ditjen Yankes Kemenkes RI
            </div>
          </div>

          {/* Right Column: 4 Role Quick Login Cards & System Preview */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Akses Cepat 4 Role Pengguna</span>
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Klik salah satu role untuk langsung mengisi form atau login instan
                  </p>
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 border border-slate-700">
                  4 Role SAKIP
                </span>
              </div>

              {/* 4 Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {roleCards.map((rc) => {
                  const isSelected = activeRoleTab === rc.role;
                  const matchingUser = users.find((u) => u.role === rc.role);

                  return (
                    <div
                      key={rc.role}
                      onClick={() => handleSelectRolePreset(rc.role, false)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                        isSelected
                          ? rc.activeBorder
                          : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${rc.badgeColor}`}
                          >
                            {rc.label}
                          </span>
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <p className="text-xs font-bold text-white leading-tight truncate">
                          {matchingUser?.name || rc.username}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 leading-snug line-clamp-2">
                          {rc.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-400">
                          user: <strong className="text-slate-200">{rc.username}</strong>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectRolePreset(rc.role, true);
                          }}
                          className="text-[10px] font-bold px-2 py-1 rounded bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 border border-slate-700 transition-all cursor-pointer flex items-center gap-1"
                        >
                          <span>Login</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Feature Highlights Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800/90 text-xs">
              <h3 className="font-bold text-slate-200 text-xs uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Fitur Utama SAKElek RSUP Dr. M Djamil</span>
              </h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>18 Indikator Strategis PK</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                  <span>Matriks T1-T4 Hijau/Kuning/Merah</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                  <span>Evaluasi LHE PermenPAN-RB</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                  <span>Cetak Dokumen Resmi LHE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/40 py-3.5 text-center text-xs text-slate-500">
        <p>
          &copy; {selectedYear} SAKElek RSUP Dr. M Djamil Padang - Kementerian Kesehatan Republik Indonesia.
        </p>
      </footer>
    </div>
  );
};
