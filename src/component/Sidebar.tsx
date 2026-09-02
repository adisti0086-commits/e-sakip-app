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
  KeyRound,
} from 'lucide-react';
import { User, UserRole } from '../types';

export type ActiveTab =
  | 'dashboard'
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
  onSwitchUser: (role: UserRole) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
  pendingValidationCount: number;
  onOpenLoginModal?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onSwitchUser,
  isOpenMobile,
  setIsOpenMobile,
  pendingValidationCount,
  onOpenLoginModal,
}) => {
  const [masterExpanded, setMasterExpanded] = React.useState(
    activeTab === 'master-opd' || activeTab === 'master-users'
  );

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
      badge: '18 Indikator (Kemenkes)',
      badgeColor: 'bg-emerald-600 text-white font-bold',
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
                RS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[170px]">
              Sistem Akuntabilitas Kinerja
            </p>
          </div>
        </div>

        {/* User Active Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-[#131c2e] border border-slate-800 shadow-md">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <div className="mb-1.5">
                <span
                  className={`text-[11px] font-bold px-3 py-0.5 rounded-full inline-block ${currentBadge.bg}`}
                >
                  {currentBadge.label}
                </span>
              </div>
              <p className="text-[13px] font-bold text-white leading-tight truncate">
                {currentUser.name}
              </p>
              <p className="text-[11px] text-slate-400 truncate mt-0.5 font-normal">
                {currentUser.opdName}
              </p>
            </div>
          </div>

          {/* Quick Role Switcher Buttons */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 block">
                SIMULASI GANTI ROLE (4 USER):
              </label>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => onSwitchUser('administrator')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold text-left truncate transition-all cursor-pointer ${
                  currentUser.role === 'administrator'
                    ? 'bg-[#ff003b] hover:bg-[#e60035] text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
                title="1. Administrator SAKIP"
              >
                1. Admin
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('operator_unit')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold text-left truncate transition-all cursor-pointer ${
                  currentUser.role === 'operator_unit'
                    ? 'bg-sky-600 hover:bg-sky-500 text-white shadow-md shadow-sky-600/30'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
                title="2. Operator Unit OPD"
              >
                2. Operator
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('validator')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold text-left truncate transition-all cursor-pointer ${
                  currentUser.role === 'validator'
                    ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/30'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
                title="3. Validator Kinerja"
              >
                3. Validator
              </button>
              <button
                type="button"
                onClick={() => onSwitchUser('verifikator')}
                className={`text-xs px-2.5 py-1.5 rounded-lg font-bold text-left truncate transition-all cursor-pointer ${
                  currentUser.role === 'verifikator'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-[#1e293b] text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/50'
                }`}
                title="4. Verifikator / Evaluator LHE"
              >
                4. Verifikator
              </button>
            </div>

            {/* Open Full Login Modal Button */}
            {onOpenLoginModal && (
              <button
                type="button"
                onClick={onOpenLoginModal}
                className="mt-2.5 w-full py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/90 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Buka Menu Login 4 User</span>
              </button>
            )}
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

      
      </aside>
    </>
  );
};
