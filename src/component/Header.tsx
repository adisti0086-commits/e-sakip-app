import React from 'react';
import {
  Menu,
  Building2,
  Calendar,
  UserCheck,
  Code2,
  Bell,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { User, OPD, UserRole } from '../../utils/types'
import { ActiveTab } from './Sidebar';

interface HeaderProps {
  activeTab: ActiveTab;
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  users: User[];
  opdList: OPD[];
  selectedOpdId: string;
  setSelectedOpdId: (id: string) => void;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  onToggleMobileMenu: () => void;
  onOpenPhpSource: () => void;
  pendingValidationCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  currentUser,
  onSwitchUser,
  users,
  opdList,
  selectedOpdId,
  setSelectedOpdId,
  selectedYear,
  setSelectedYear,
  onToggleMobileMenu,
  onOpenPhpSource,
  pendingValidationCount,
}) => {
  const [showRoleDropdown, setShowRoleDropdown] = React.useState(false);
  const [showNotification, setShowNotification] = React.useState(false);

  const getPageTitle = (tab: ActiveTab) => {
    switch (tab) {
      case 'dashboard':
        return {
          title: 'Dashboard Akuntabilitas Kinerja',
          subtitle: 'Ringkasan Capaian Indikator Kinerja dan Status Evaluasi SAKIP',
        };
      case 'master-opd':
        return {
          title: 'Master OPD / Unit Kerja',
          subtitle: 'Daftar Satuan Kerja Perangkat Daerah dan Pimpinan Unit',
        };
      case 'master-users':
        return {
          title: 'Master Pengguna (4 Role)',
          subtitle: 'Pengaturan Hak Akses Administrator, Operator, Validator, dan Verifikator',
        };
      case 'master-renstra':
        return {
          title: 'Master Rencana Strategis (Renstra)',
          subtitle: 'Struktur Visi, Misi, Tujuan, Sasaran Strategis & Cascading Kinerja 5 Tahunan',
        };
      case 'pengaturan-kinerja':
        return {
          title: 'Pengaturan Kinerja & Bobot SAKIP',
          subtitle: 'Konfigurasi Bobot Komponen PermenPAN-RB No. 88/2021 & Ambang Batas Capaian',
        };
      case 'input-kinerja':
        return {
          title: 'Input Indikator Perjanjian Kinerja (PK)',
          subtitle: 'Penetapan Indikator Kinerja Utama (IKU), Target Tahunan & Triwulanan',
        };
      case 'capaian-bulanan':
        return {
          title: 'Capaian Kinerja Perbulan',
          subtitle: 'Input Realisasi Bulanan, Evidens Bukti Dukung & Validasi Kinerja',
        };
      case 'capaian-triwulan':
        return {
          title: 'Capaian Kinerja Triwulan',
          subtitle: 'Rekapitulasi Triwulanan dengan Indikator Warna (Hijau ≥100%, Kuning 50-99%, Merah <50%)',
        };
      case 'lhe':
        return {
          title: 'Laporan Hasil Evaluasi (LHE) SAKIP',
          subtitle: 'Modul Evaluasi AKIP, Penilaian Lembar Kerja 1/0, Catatan & Rekomendasi',
        };
      case 'php-source':
        return {
          title: 'Source Code PHP & Database Schema SAKIP',
          subtitle: 'Arsitektur PHP MVC, MySQL Script & REST API Backend',
        };
    }
  };

  const pageInfo = getPageTitle(activeTab);

  const isOpdFilterDisabled = currentUser.role === 'operator_unit';

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 shadow-xs">
      <div className="px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Page Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-hidden"
            aria-label="Buka Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-lg lg:text-xl font-bold text-slate-800 tracking-tight leading-tight flex items-center gap-2">
              <span>{pageInfo.title}</span>
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              {pageInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Controls (Year, OPD Filter, Role Switch, PHP Source, Notifications) */}
        <div className="flex items-center gap-2.5">
          {/* Tahun Anggaran Selector */}
          <div className="flex items-center bg-slate-100/90 rounded-lg p-1 border border-slate-200 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1" />
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="bg-transparent text-slate-800 font-semibold focus:outline-hidden pr-2 cursor-pointer text-xs"
            >
              <option value={2024}>TA 2024</option>
              <option value={2025}>TA 2025</option>
              <option value={2026}>TA 2026</option>
            </select>
          </div>

          {/* OPD Filter Selector */}
          <div className="hidden md:flex items-center bg-slate-100/90 rounded-lg p-1 border border-slate-200 text-xs max-w-xs">
            <Building2 className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-1 shrink-0" />
            <select
              value={selectedOpdId}
              onChange={(e) => setSelectedOpdId(e.target.value)}
              disabled={isOpdFilterDisabled}
              className={`bg-transparent text-slate-800 font-medium focus:outline-hidden pr-2 truncate cursor-pointer text-xs ${
                isOpdFilterDisabled ? 'opacity-80 cursor-not-allowed font-semibold' : ''
              }`}
              title={isOpdFilterDisabled ? 'Terkunci sesuai OPD Operator' : 'Pilih Unit Kerja / OPD'}
            >
              {currentUser.role !== 'operator_unit' && (
                <option value="all">Semua OPD / Seluruh Pemda</option>
              )}
              {opdList.map((opd) => (
                <option key={opd.id} value={opd.id}>
                  {opd.nama}
                </option>
              ))}
            </select>
          </div>

          {/* PHP Code Button */}
          <button
            type="button"
            onClick={onOpenPhpSource}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-slate-100 text-xs font-semibold shadow-xs transition-colors"
            title="Lihat Arsitektur PHP & Skrip Database MySQL"
          >
            <Code2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Arsitektur PHP</span>
          </button>

          {/* Notification Button */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotification(!showNotification)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative focus:outline-hidden"
              title="Notifikasi Aktivitas SAKIP"
            >
              <Bell className="w-4 h-4" />
              {pendingValidationCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotification && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-800">Notifikasi SAKIP</span>
                  <span className="text-[10px] text-slate-400">Terbaru</span>
                </div>
                <div className="mt-2 space-y-2 text-xs">
                  <div className="p-2 rounded-lg bg-amber-50 border border-amber-200/60 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-900">Perlu Validasi Capaian</p>
                      <p className="text-[11px] text-amber-700">
                        {pendingValidationCount} laporan capaian bulanan/triwulanan menunggu validasi.
                      </p>
                    </div>
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-200/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-emerald-900">LHE BAPPEDA 2025 Selesai</p>
                      <p className="text-[11px] text-emerald-700">
                        Predikat AA (Nilai 92.5) telah diterbitkan oleh Tim Evaluator.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile & Role Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowRoleDropdown(!showRoleDropdown)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                {currentUser.name.charAt(0)}
              </div>
              <div className="text-left hidden xl:block">
                <p className="text-xs font-bold text-slate-800 leading-none truncate max-w-[130px]">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-600 font-semibold capitalize mt-0.5">
                  {currentUser.role.replace('_', ' ')}
                </p>
              </div>
            </button>

            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50">
                <div className="pb-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-800">{currentUser.name}</p>
                  <p className="text-[11px] text-slate-500 font-mono">NIP. {currentUser.nip}</p>
                  <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {currentUser.roleTitle}
                  </span>
                </div>

                <div className="mt-3">
                  <p className="text-[11px] uppercase font-bold text-slate-400 mb-2">
                    Beralih Peran Pengguna (4 Role):
                  </p>
                  <div className="space-y-1">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => {
                          onSwitchUser(u.role);
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left p-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          currentUser.role === u.role
                            ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200'
                            : 'hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div>
                          <p className="font-semibold">{u.name}</p>
                          <p className="text-[10px] text-slate-500 capitalize">
                            Role: {u.role.replace('_', ' ')}
                          </p>
                        </div>
                        {currentUser.role === u.role && (
                          <UserCheck className="w-4 h-4 text-emerald-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
