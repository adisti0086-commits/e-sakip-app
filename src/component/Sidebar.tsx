import React from 'react';
import {
  LayoutDashboard,
  Database,
  Target,
  Sliders,
  FilePlus2,
  CalendarDays,
  PieChart,
  FileCheck2,
  Code2,
  Building2,
  Users,
  ShieldCheck,
  Award,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { User, UserRole } from '../../utils/types';

export type ActiveTab =
  | 'dashboard'
  | 'master-opd'
  | 'master-users'
  | 'master-renstra'
  | 'pengaturan-kinerja'
  | 'input-kinerja'
  | 'capaian-bulanan'
  | 'capaian-triwulan'
  | 'lhe'
  | 'php-source';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser: User;
  onSwitchUser: (role: UserRole) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingValidationCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  isOpenMobile,
  setIsOpenMobile,
  pendingValidationCount,
}) => {
  const [masterExpanded, setMasterExpanded] = React.useState(
    activeTab === 'master-opd' || activeTab === 'master-users'
  );

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'administrator':
        return { label: 'Administrator', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
      case 'operator_unit':
        return { label: 'Operator Unit', bg: 'bg-sky-100 text-sky-800 border-sky-200' };
      case 'validator':
        return { label: 'Validator', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'verifikator':
        return { label: 'Verifikator', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const navItems = [
    {
      id: 'dashboard' as ActiveTab,
      label: 'Dashboard SAKIP',
      icon: LayoutDashboard,
      roles: ['administrator', 'operator_unit', 'validator', 'verifikator'],
      badge: null,
    },
    {
      id: 'master-group',
      label: 'Master Data',
      icon: Database,
      roles: ['administrator', 'validator', 'verifikator'],
      isGroup: true,
      children: [
        { id: 'master-opd' as ActiveTab, label: 'Master OPD / Unit Kerja', icon: Building2 },
        { id: 'master-users' as ActiveTab, label: 'Master Pengguna (4 Role)', icon: Users },
      ],
    },
    {
      id: 'master-renstra' as ActiveTab,
      label: 'Master Renstra',
      icon: Target,
      roles: ['administrator', 'operator_unit', 'validator', 'verifikator'],
      badge: '5 Tahun',
    },
    {
      id: 'pengaturan-kinerja' as ActiveTab,
      label: 'Pengaturan Kinerja',
      icon: Sliders,
      roles: ['administrator', 'verifikator'],
      badge: null,
    },
    {
      id: 'input-kinerja' as ActiveTab,
      label: 'Input Kinerja (PK)',
      icon: FilePlus2,
      roles: ['administrator', 'operator_unit'],
      badge: 'Target & IKU',
    },
    {
      id: 'capaian-bulanan' as ActiveTab,
      label: 'Capaian Perbulan',
      icon: CalendarDays,
      roles: ['administrator', 'operator_unit', 'validator'],
      badge: pendingValidationCount > 0 && currentUser.role === 'validator' ? `${pendingValidationCount} Validasi` : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'capaian-triwulan' as ActiveTab,
      label: 'Capaian Triwulan',
      icon: PieChart,
      roles: ['administrator', 'operator_unit', 'validator', 'verifikator'],
      badge: 'Hijau/Kuning/Merah',
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'lhe' as ActiveTab,
      label: 'LHE (Laporan Evaluasi)',
      icon: FileCheck2,
      roles: ['administrator', 'operator_unit', 'validator', 'verifikator'],
      badge: 'Penilaian 1/0',
      badgeColor: 'bg-indigo-600 text-white',
    },
    {
      id: 'php-source' as ActiveTab,
      label: 'Source Code PHP & DB',
      icon: Code2,
      roles: ['administrator', 'operator_unit', 'validator', 'verifikator'],
      badge: 'PHP + SQL',
      badgeColor: 'bg-slate-700 text-white',
    },
  ];

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
        className={`fixed top-0 left-0 bottom-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800 shadow-xl`}
      >
        {/* Header / Logo */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 text-white font-black text-xl">
            <Award className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white">E-SAKIP</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[170px]">
              Sistem Akuntabilitas Kinerja
            </p>
          </div>
        </div>

        {/* User Active Card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-xs">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${currentBadge.bg}`}
                >
                  {currentBadge.label}
                </span>
              </div>
              <p className="text-sm font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-400 truncate">{currentUser.opdName}</p>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="mt-3 pt-2.5 border-t border-slate-700/60">
            <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block mb-1.5">
              Simulasi Ganti Role (4 User):
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSwitchUser('administrator')}
                className={`text-[11px] px-2 py-1 rounded font-medium text-left truncate transition-colors ${
                  currentUser.role === 'administrator'
                    ? 'bg-rose-600 text-white font-bold'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
                title="Administrator"
              >
                1. Admin
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('operator_unit')}
                className={`text-[11px] px-2 py-1 rounded font-medium text-left truncate transition-colors ${
                  currentUser.role === 'operator_unit'
                    ? 'bg-sky-600 text-white font-bold'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
                title="Operator Unit OPD"
              >
                2. Operator
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('validator')}
                className={`text-[11px] px-2 py-1 rounded font-medium text-left truncate transition-colors ${
                  currentUser.role === 'validator'
                    ? 'bg-amber-600 text-white font-bold'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
                title="Validator Kinerja"
              >
                3. Validator
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('verifikator')}
                className={`text-[11px] px-2 py-1 rounded font-medium text-left truncate transition-colors ${
                  currentUser.role === 'verifikator'
                    ? 'bg-emerald-600 text-white font-bold'
                    : 'bg-slate-700/80 text-slate-300 hover:bg-slate-700'
                }`}
                title="Verifikator / Evaluator LHE"
              >
                4. Verifikator
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama SAKIP
          </div>

          {navItems.map((item) => {
            // Check if current role has permission
            if (item.roles && !item.roles.includes(currentUser.role)) {
              return null;
            }

            if (item.isGroup && item.children) {
              const isGroupActive = item.children.some((c) => c.id === activeTab);
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setMasterExpanded(!masterExpanded)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isGroupActive
                        ? 'text-white bg-slate-800'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 text-emerald-400" />
                      <span>{item.label}</span>
                    </div>
                    {masterExpanded ? (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    )}
                  </button>

                  {masterExpanded && (
                    <div className="pl-6 pr-1 space-y-1 border-l-2 border-slate-700/60 ml-4 py-1">
                      {item.children.map((child) => (
                        <button
                          key={child.id}
                          type="button"
                          onClick={() => handleNavClick(child.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                            activeTab === child.id
                              ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                              : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                          }`}
                        >
                          <child.icon className="w-3.5 h-3.5" />
                          <span>{child.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            }

            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavClick(item.id as ActiveTab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/30'
                    : 'text-slate-300 hover:bg-slate-800/90 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-emerald-400'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 whitespace-nowrap ${
                      item.badgeColor || 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400 bg-slate-950/40">
          <div className="flex items-center justify-between text-[11px] mb-1">
            <span className="font-semibold text-slate-300">Standar PermenPAN-RB</span>
            <span className="text-emerald-400 font-mono">No. 88/2021</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-relaxed">
            Evaluasi Akuntabilitas Kinerja Instansi Pemerintah Terintegrasi
          </p>
        </div>
      </aside>
    </>
  );
};
