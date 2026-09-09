import React, { useState } from 'react';
import {
  LayoutDashboard,
  Database,
  Target,
  Sliders,
  FilePlus2,
  CalendarDays,
  PieChart,
  FileCheck2,
  Building2,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronDown,
  LogIn,
  LogOut,
  FileSpreadsheet,
  Layers,
  Activity,
  FileText,
  ClipboardCheck,
  CheckCircle2,
} from 'lucide-react';
import { User, UserRole } from '../types';
import { getSAKIPSummary, LKE_SYNC_EVENT } from '../utils/lkeSync';

export type ActiveTab =
  | 'dashboard'
  | 'lke'
  | 'perencanaan-1a'
  | 'perencanaan-1b'
  | 'perencanaan-1c'
  | 'pengukuran-2a'
  | 'pengukuran-2b'
  | 'pengukuran-2c'
  | 'pelaporan-3a'
  | 'pelaporan-3b'
  | 'pelaporan-3c'
  | 'evaluasi-4a'
  | 'evaluasi-4b'
  | 'evaluasi-4c'
  | 'master-opd'
  | 'master-users'
  | 'master-renstra'
  | 'pengaturan-kinerja'
  | 'input-kinerja'
  | 'capaian-bulanan'
  | 'capaian-triwulan'
  | 'lhe';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser?: (role: UserRole) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingValidationCount: number;
  onOpenLoginModal?: () => void;
  onOpenLogoutModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  isOpenMobile,
  setIsOpenMobile,
  pendingValidationCount: _pendingValidationCount,
  onOpenLoginModal,
  onOpenLogoutModal,
}) => {
  // Expansion states for the 4 SAKIP Table Components
  const [openKomp1, setOpenKomp1] = useState(
    activeTab === 'perencanaan-1a' ||
    activeTab === 'perencanaan-1b' ||
    activeTab === 'perencanaan-1c'
  );
  const [openKomp2, setOpenKomp2] = useState(
    activeTab === 'pengukuran-2a' ||
    activeTab === 'pengukuran-2b' ||
    activeTab === 'pengukuran-2c'
  );
  const [openKomp3, setOpenKomp3] = useState(
    activeTab === 'pelaporan-3a' ||
    activeTab === 'pelaporan-3b' ||
    activeTab === 'pelaporan-3c'
  );
  const [openKomp4, setOpenKomp4] = useState(
    activeTab === 'evaluasi-4a' ||
    activeTab === 'evaluasi-4b' ||
    activeTab === 'evaluasi-4c' ||
    activeTab === 'lke' ||
    activeTab === 'lhe'
  );
  const [masterExpanded, setMasterExpanded] = useState(
    activeTab === 'master-opd' ||
    activeTab === 'master-users' ||
    activeTab === 'master-renstra' ||
    activeTab === 'input-kinerja' ||
    activeTab === 'capaian-bulanan' ||
    activeTab === 'capaian-triwulan' ||
    activeTab === 'pengaturan-kinerja'
  );

  const [sakipSummary, setSakipSummary] = useState(() => getSAKIPSummary());

  React.useEffect(() => {
    const handleSync = () => {
      const next = getSAKIPSummary();
      setSakipSummary((prev) => {
        if (
          prev.totalNilai === next.totalNilai &&
          prev.komp1Nilai === next.komp1Nilai &&
          prev.komp2Nilai === next.komp2Nilai &&
          prev.komp3Nilai === next.komp3Nilai &&
          prev.komp4Nilai === next.komp4Nilai
        ) {
          return prev;
        }
        return next;
      });
    };
    window.addEventListener(LKE_SYNC_EVENT, handleSync);
    return () => window.removeEventListener(LKE_SYNC_EVENT, handleSync);
  }, []);

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return {
          label: 'Administrator',
          bg: 'bg-[#ffe4e6] text-[#e11d48] font-bold',
        };
      case 'operator_unit':
        return {
          label: 'Operator Unit',
          bg: 'bg-[#e0f2fe] text-[#0284c7] font-bold',
        };
      case 'validator':
        return {
          label: 'Validator',
          bg: 'bg-[#fef3c7] text-[#d97706] font-bold',
        };
      case 'verifikator':
        return {
          label: 'Verifikator',
          bg: 'bg-[#d1fae5] text-[#059669] font-bold',
        };
    }
  };

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setIsOpenMobile(false);
  };

  const currentBadge = getRoleBadge(currentUser.role);

  return (
    <>
      {/* Mobile overlay */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        id="sakip-main-sidebar"
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 no-print print:hidden ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Header / Logo */}
        <div className="p-4 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl shrink-0">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">SAKElek</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium truncate">
              RSUP Dr. M. Djamil Padang
            </p>
          </div>
        </div>

        {/* User Active Card */}
        <div className="p-3 mx-3 my-2 rounded-xl bg-slate-950/70 border border-slate-800 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${currentBadge.bg}`}>
                  {currentBadge.label}
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-tight truncate">
                {currentUser.name}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Links according to SAKIP Table */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5 custom-scrollbar text-xs">
          {/* 0. DASHBOARD UTAMA */}
          <button
            type="button"
            onClick={() => handleNavClick('dashboard')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white font-bold shadow-md shadow-emerald-600/20'
                : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <LayoutDashboard className="w-4 h-4 text-emerald-400" />
              <span>Dashboard SAKIP</span>
            </div>
            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-200">
              Utama
            </span>
          </button>

          {/* LEMBAR KERJA EVALUASI (LKE LENGKAP IDENTIK TABEL) */}
          <button
            type="button"
            onClick={() => handleNavClick('lke')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === 'lke'
                ? 'bg-[#5c1818] text-white font-bold shadow-md shadow-red-950/40 ring-1 ring-amber-500/50'
                : 'text-slate-200 bg-slate-800/60 hover:bg-slate-800 hover:text-white border border-slate-700/60'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <div className="text-left leading-tight">
                <span className="block font-bold">Lembar Kerja Evaluasi (LKE)</span>
                <span className="text-[10px] text-slate-400">Tabel Kriteria PermenPAN-RB</span>
              </div>
            </div>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono">
              {sakipSummary.totalNilai.toFixed(1)} Poin
            </span>
          </button>

          {/* PEMISAH TABEL 4 KOMPONEN SAKIP */}
          <div className="pt-3 pb-1 px-2">
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              <span>Komponen SAKIP (Tabel LKE)</span>
              <span>Bobot</span>
            </div>
          </div>

          {/* 1. PERENCANAAN KINERJA */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenKomp1(!openKomp1)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 text-left min-w-0">
                <Target className="w-4 h-4 text-sky-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate text-slate-100">
                    1. PERENCANAAN KINERJA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-800">
                  30
                </span>
                {openKomp1 ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {openKomp1 && (
              <div className="pl-5 pr-1 space-y-1 border-l-2 border-sky-600/40 ml-4 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('perencanaan-1a')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'perencanaan-1a'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">1.a Dok. Perencanaan Tersedia</span>
                  <span className="text-[9px] font-mono text-sky-300">6.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('perencanaan-1b')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'perencanaan-1b'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">1.b Standar SMART & IKU</span>
                  <span className="text-[9px] font-mono text-sky-300">9.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('perencanaan-1c')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'perencanaan-1c'
                      ? 'bg-sky-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">1.c Pemanfaatan Perencanaan</span>
                  <span className="text-[9px] font-mono text-sky-300">15.00</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. PENGUKURAN KINERJA */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenKomp2(!openKomp2)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 text-left min-w-0">
                <Activity className="w-4 h-4 text-emerald-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate text-slate-100">
                    2. PENGUKURAN KINERJA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                  30
                </span>
                {openKomp2 ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {openKomp2 && (
              <div className="pl-5 pr-1 space-y-1 border-l-2 border-emerald-600/40 ml-4 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('pengukuran-2a')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pengukuran-2a'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">2.a Pengukuran Dilakukan</span>
                  <span className="text-[9px] font-mono text-emerald-300">6.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('pengukuran-2b')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pengukuran-2b'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">2.b Kebutuhan Pengelolaan</span>
                  <span className="text-[9px] font-mono text-emerald-300">9.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('pengukuran-2c')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pengukuran-2c'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">2.c Pemanfaatan Pengukuran</span>
                  <span className="text-[9px] font-mono text-emerald-300">15.00</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. PELAPORAN KINERJA */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenKomp3(!openKomp3)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 text-left min-w-0">
                <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate text-slate-100">
                    3. PELAPORAN KINERJA
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  15
                </span>
                {openKomp3 ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {openKomp3 && (
              <div className="pl-5 pr-1 space-y-1 border-l-2 border-amber-600/40 ml-4 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('pelaporan-3a')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pelaporan-3a'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">3.a Dokumen Pelaporan Tersedia</span>
                  <span className="text-[9px] font-mono text-amber-300">3.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('pelaporan-3b')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pelaporan-3b'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">3.b Memberikan Info Terukur</span>
                  <span className="text-[9px] font-mono text-amber-300">4.50</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('pelaporan-3c')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'pelaporan-3c'
                      ? 'bg-amber-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">3.c Dampak Pelaporan Kinerja</span>
                  <span className="text-[9px] font-mono text-amber-300">7.50</span>
                </button>
              </div>
            )}
          </div>

          {/* 4. EVALUASI AKUNTABILITAS KINERJA INTERNAL */}
          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenKomp4(!openKomp4)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <div className="flex items-center gap-2 text-left min-w-0">
                <ClipboardCheck className="w-4 h-4 text-purple-400 shrink-0" />
                <div className="min-w-0">
                  <span className="font-bold text-xs block truncate text-slate-100">
                    4. EVALUASI INTERNAL
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800">
                  25
                </span>
                {openKomp4 ? (
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
            </button>

            {openKomp4 && (
              <div className="pl-5 pr-1 space-y-1 border-l-2 border-purple-600/40 ml-4 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('evaluasi-4a')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'evaluasi-4a'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">4.a Pelaksanaan Evaluasi SPI</span>
                  <span className="text-[9px] font-mono text-purple-300">5.00</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('evaluasi-4b')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'evaluasi-4b'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">4.b Kualitas Evaluasi SDM</span>
                  <span className="text-[9px] font-mono text-purple-300">7.50</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('evaluasi-4c')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'evaluasi-4c'
                      ? 'bg-purple-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span className="truncate">4.c Pemanfaatan Hasil Evaluasi</span>
                  <span className="text-[9px] font-mono text-purple-300">12.50</span>
                </button>

                <div className="pt-1 mt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleNavClick('lke')}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === 'lke'
                        ? 'bg-slate-800 text-amber-300 font-bold'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">Lembar Kerja Evaluasi (LKE)</span>
                    <span className="text-[9px] font-bold text-amber-400">Tabel 100</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* MASTER DATA & PENGATURAN SISTEM */}
          <div className="pt-3 pb-1 px-2">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1">
              Master & Konfigurasi
            </div>
          </div>

          <div className="space-y-1">
            <button
              type="button"
              onClick={() => setMasterExpanded(!masterExpanded)}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-emerald-400" />
                <span className="font-semibold text-xs">Master Data & Pengukuran</span>
              </div>
              {masterExpanded ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {masterExpanded && (
              <div className="pl-5 pr-1 space-y-1 border-l-2 border-slate-700 ml-4 py-1">
                <button
                  type="button"
                  onClick={() => handleNavClick('master-opd')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'master-opd'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Master Unit Kerja</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('master-users')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'master-users'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Master Pengguna (4 Role)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('master-renstra')}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                    activeTab === 'master-renstra'
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Master Renstra & Sasaran</span>
                </button>

                {/* Modul Pengukuran Kinerja di luar SAKIP (sesuai request) */}
                <div className="pt-1 mt-1 border-t border-slate-800/80">
                  <div className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 px-2 py-0.5">
                    Modul Pengukuran
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavClick('input-kinerja')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === 'input-kinerja'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Target className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Pengukuran Kinerja (Input PK)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('capaian-bulanan')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === 'capaian-bulanan'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <CalendarDays className="w-3.5 h-3.5 text-sky-400" />
                    <span>Capaian Kinerja Bulanan</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleNavClick('capaian-triwulan')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === 'capaian-triwulan'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <PieChart className="w-3.5 h-3.5 text-amber-400" />
                    <span>Capaian Kinerja Triwulan</span>
                  </button>
                </div>

                {/* Konfigurasi Bobot SAKIP */}
                <div className="pt-1 mt-1 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => handleNavClick('pengaturan-kinerja')}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
                      activeTab === 'pengaturan-kinerja'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Sliders className="w-3.5 h-3.5 text-purple-400" />
                    <span>Konfigurasi & Bobot SAKIP</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer: Ganti Akun & Keluar */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/80">
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onOpenLoginModal}
              className="flex-1 text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Ganti Akun</span>
            </button>
            <button
              type="button"
              onClick={onOpenLogoutModal}
              className="flex-1 text-[11px] font-semibold text-rose-400 hover:text-rose-300 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/90 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
