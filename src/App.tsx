import React, { useState, useEffect } from 'react';
import {
  INITIAL_USERS,
  INITIAL_OPD,
  INITIAL_RENSTRA_TUJUAN,
  INITIAL_RENSTRA_SASARAN,
  INITIAL_BOBOT_SAKIP,
  INITIAL_INDIKATOR_PK,
  INITIAL_CAPAIAN_BULAN,
  INITIAL_CAPAIAN_TRIWULAN,
  INITIAL_LHE,
} from '../data/initialData';
import {
  User,
  OPD,
  RenstraTujuan,
  RenstraSasaran,
  BobotSakip,
  IndikatorPK,
  CapaianIndikatorBulan,
  CapaianIndikatorTriwulan,
  LHEEvaluation,
  UserRole,
} from './types';
import { Sidebar, ActiveTab } from './component/Sidebar';
import { Header } from './component/Header';
import { DashboardView } from './component/DashboardView';
import { MasterDataView } from './component/MasterDataView';
import { MasterRenstraView } from './component/MasterRenstraView';
import { PengaturanKinerjaView } from './component/PengaturanKinerjaView';
import { InputKinerjaView } from './component/InputKinerjaView';
import { CapaianBulananView } from './component/CapaianBulananView';
import { CapaianTriwulanView } from './component/CapaianTriwulanView';
import { LHEView } from './component/LHEView';
import { LKEEvaluasiView } from './component/LKEEvaluasiView';
import { Perencanaan1aView } from './component/Perencanaan1aView';
import { Perencanaan1bView } from './component/Perencanaan1bView';
import { Perencanaan1cView } from './component/Perencanaan1cView';
import { Pengukuran2aView } from './component/Pengukuran2aView';
import { Pengukuran2bView } from './component/Pengukuran2bView';
import { Pengukuran2cView } from './component/Pengukuran2cView';
import { Pelaporan3aView } from './component/Pelaporan3aView';
import { Pelaporan3bView } from './component/Pelaporan3bView';
import { Pelaporan3cView } from './component/Pelaporan3cView';
import { Evaluasi4aView } from './component/Evaluasi4aView';
import { Evaluasi4bView } from './component/Evaluasi4bView';
import { Evaluasi4cView } from './component/Evaluasi4cView';
import { LoginModal } from './component/LoginModal';
import { LoginPage } from './component/LoginPage';
import { LogoutConfirmModal } from './component/LogoutConfirmModal';

export default function App() {
  // Navigation & Authentication State
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userList, setUserList] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default: Administrator
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedOpdId, setSelectedOpdId] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Core Data State
  const [opdList, setOpdList] = useState<OPD[]>(INITIAL_OPD);
  const [tujuanList, setTujuanList] = useState<RenstraTujuan[]>(INITIAL_RENSTRA_TUJUAN);
  const [renstraList, setRenstraList] = useState<RenstraSasaran[]>(INITIAL_RENSTRA_SASARAN);
  const [bobotSakip, setBobotSakip] = useState<BobotSakip>(INITIAL_BOBOT_SAKIP);
  const [indikatorList, setIndikatorList] = useState<IndikatorPK[]>(() => {
    try {
      const saved = localStorage.getItem('sakip_indikator_pk_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading indikator list from localStorage', e);
    }
    return INITIAL_INDIKATOR_PK;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sakip_indikator_pk_data', JSON.stringify(indikatorList));
    } catch (e) {
      console.error('Error saving indikator list to localStorage', e);
    }
  }, [indikatorList]);

  const [capaianBulanList, setCapaianBulanList] = useState<CapaianIndikatorBulan[]>(() => {
    try {
      const saved = localStorage.getItem('sakip_capaian_bulan_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading capaian bulan from localStorage', e);
    }
    return INITIAL_CAPAIAN_BULAN;
  });

  const [capaianTriwulanList, setCapaianTriwulanList] = useState<CapaianIndikatorTriwulan[]>(() => {
    try {
      const saved = localStorage.getItem('sakip_capaian_triwulan_data');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading capaian triwulan from localStorage', e);
    }
    return INITIAL_CAPAIAN_TRIWULAN;
  });

  useEffect(() => {
    try {
      localStorage.setItem('sakip_capaian_bulan_data', JSON.stringify(capaianBulanList));
    } catch (e) {
      console.error('Error saving capaian bulan to localStorage', e);
    }
  }, [capaianBulanList]);

  useEffect(() => {
    try {
      localStorage.setItem('sakip_capaian_triwulan_data', JSON.stringify(capaianTriwulanList));
    } catch (e) {
      console.error('Error saving capaian triwulan to localStorage', e);
    }
  }, [capaianTriwulanList]);

  const [lheList, setLheList] = useState<LHEEvaluation[]>(INITIAL_LHE);

  // Count pending validation for validator
  const pendingValidationCount = capaianBulanList.filter(
  (capaian) =>
    capaian.realisasiPerBulan.some(
      (bulan) => bulan.statusValidasi === 'Menunggu Validasi'
    )
).length;

  // Authentication Handlers
  const handleLoginSuccess = (user: User, year: number) => {
    setCurrentUser(user);
    setSelectedYear(year);
    setIsLoggedIn(true);
    if (user.role === 'operator_unit' && user.opdId) {
      setSelectedOpdId(user.opdId);
    }
  };

  const handleLogoutConfirm = () => {
    setIsLogoutModalOpen(false);
    setIsLoggedIn(false);
  };

  // Handle switching active user role directly or from modal
  const handleUserChange = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'operator_unit' && user.opdId) {
      setSelectedOpdId(user.opdId);
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    const targetUser = userList.find((u) => u.role === role) || INITIAL_USERS.find((u) => u.role === role);
    if (targetUser) {
      handleUserChange(targetUser);
    }
  };

  // If user is not logged in, show dedicated Login Page
  if (!isLoggedIn) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        users={userList}
        opdList={opdList}
        defaultYear={selectedYear}
      />
    );
  }

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* 1. Left Sidebar with Role Switching, Navigation, and Logout */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchRole}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        pendingValidationCount={pendingValidationCount}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:pl-72">
        {/* Header */}
        <Header
          activeTab={activeTab}
          currentUser={currentUser}
          onSwitchUser={handleSwitchRole}
          users={userList}
          opdList={opdList}
          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}
          selectedOpdId={selectedOpdId}
          setSelectedOpdId={setSelectedOpdId}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          pendingValidationCount={pendingValidationCount}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
          onOpenLogoutModal={() => setIsLogoutModalOpen(true)}
        />

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <DashboardView
                indikatorList={indikatorList}
                capaianTriwulanList={capaianTriwulanList}
                lheList={lheList}
                opdList={opdList}
                bobotSakip={bobotSakip}
                selectedYear={selectedYear}
                selectedOpdId={selectedOpdId}
                currentUser={currentUser}
                onNavigate={setActiveTab}
                onOpenLoginModal={() => setIsLoginModalOpen(true)}
              />
            )}

            {activeTab === 'master-opd' && (
              <MasterDataView
                viewType="opd"
                opdList={opdList}
                setOpdList={setOpdList}
                usersList={userList}
                setUsersList={setUserList}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'master-users' && (
              <MasterDataView
                viewType="users"
                opdList={opdList}
                setOpdList={setOpdList}
                usersList={userList}
                setUsersList={setUserList}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'perencanaan-1a' && (
              <Perencanaan1aView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'perencanaan-1b' && (
              <Perencanaan1bView
                opdList={opdList}
                sasaranList={renstraList}
                indikatorList={indikatorList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'perencanaan-1c' && (
              <Perencanaan1cView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {/* KOMPONEN 2: PENGUKURAN KINERJA (SAKIP) */}
            {activeTab === 'pengukuran-2a' && (
              <Pengukuran2aView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'pengukuran-2b' && (
              <Pengukuran2bView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'pengukuran-2c' && (
              <Pengukuran2cView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {/* KOMPONEN 3: PELAPORAN KINERJA (SAKIP) */}
            {activeTab === 'pelaporan-3a' && (
              <Pelaporan3aView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'pelaporan-3b' && (
              <Pelaporan3bView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'pelaporan-3c' && (
              <Pelaporan3cView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {/* KOMPONEN 4: EVALUASI INTERNAL (SAKIP) */}
            {activeTab === 'evaluasi-4a' && (
              <Evaluasi4aView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'evaluasi-4b' && (
              <Evaluasi4bView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'evaluasi-4c' && (
              <Evaluasi4cView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'master-renstra' && (
              <MasterRenstraView
                tujuanList={tujuanList}
                setTujuanList={setTujuanList}
                sasaranList={renstraList}
                setSasaranList={setRenstraList}
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'pengaturan-kinerja' && (
              <PengaturanKinerjaView
                bobotSakip={bobotSakip}
                setBobotSakip={setBobotSakip}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'input-kinerja' && (
              <InputKinerjaView
                indikatorList={indikatorList}
                setIndikatorList={setIndikatorList}
                opdList={opdList}
                sasaranList={renstraList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                capaianTriwulanList={capaianTriwulanList}
                setCapaianTriwulanList={setCapaianTriwulanList}
              />
            )}

            {activeTab === 'capaian-bulanan' && (
              <CapaianBulananView
                indikatorList={indikatorList}
                capaianBulanList={capaianBulanList}
                setCapaianBulanList={setCapaianBulanList}
                capaianTriwulanList={capaianTriwulanList}
                setCapaianTriwulanList={setCapaianTriwulanList}
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'capaian-triwulan' && (
              <CapaianTriwulanView
                indikatorList={indikatorList}
                capaianTriwulanList={capaianTriwulanList}
                setCapaianTriwulanList={setCapaianTriwulanList}
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'lke' && (
              <LKEEvaluasiView
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                onNavigateTab={(tab) => setActiveTab(tab as ActiveTab)}
              />
            )}

            {activeTab === 'lhe' && (
              <LHEView
                lheList={lheList}
                setLheList={setLheList}
                opdList={opdList}
                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}
                currentUser={currentUser}
                bobotSakip={bobotSakip}
              />
            )}
          </div>
        </main>
      </div>

      {/* Login & 4 User Simulation Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onSelectUser={handleUserChange}
        users={userList}
        opdList={opdList}
        onLogout={() => {
          setIsLoginModalOpen(false);
          setIsLogoutModalOpen(true);
        }}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirmLogout={handleLogoutConfirm}
        currentUser={currentUser}
      />
    </div>
  );
}
