import React, { useState } from 'react';
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
import { PhpArchitectureModal } from './component/PhpArchitectureModal';
import { LoginModal } from './component/LoginModal';

export default function App() {
  // Navigation & User State
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [userList, setUserList] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]); // Default: Administrator
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedOpdId, setSelectedOpdId] = useState<string>('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isPhpModalOpen, setIsPhpModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Core Data State
  const [opdList, setOpdList] = useState<OPD[]>(INITIAL_OPD);
  const [tujuanList, setTujuanList] = useState<RenstraTujuan[]>(INITIAL_RENSTRA_TUJUAN);
  const [renstraList, setRenstraList] = useState<RenstraSasaran[]>(INITIAL_RENSTRA_SASARAN);
  const [bobotSakip, setBobotSakip] = useState<BobotSakip>(INITIAL_BOBOT_SAKIP);
  const [indikatorList, setIndikatorList] = useState<IndikatorPK[]>(INITIAL_INDIKATOR_PK);
  const [capaianBulanList, setCapaianBulanList] = useState<CapaianIndikatorBulan[]>(INITIAL_CAPAIAN_BULAN);
  const [capaianTriwulanList, setCapaianTriwulanList] = useState<CapaianIndikatorTriwulan[]>(INITIAL_CAPAIAN_TRIWULAN);
  const [lheList, setLheList] = useState<LHEEvaluation[]>(INITIAL_LHE);

  // Count pending validation for validator
  const pendingValidationCount = capaianTriwulanList.reduce(
  (total, capaian) =>
    total +
    capaian.realisasiPerTriwulan.filter(
      (r) => r.statusValidasi === 'Menunggu Validasi'
    ).length,
  0
);

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

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">
      {/* 1. Left Sidebar with Role Switching and Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onSwitchUser={handleSwitchRole}
        isOpenMobile={isMobileMenuOpen}
        setIsOpenMobile={setIsMobileMenuOpen}
        pendingValidationCount={pendingValidationCount}
        onOpenPhpCode={() => setIsPhpModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
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
          onOpenPhpSource={() => setIsPhpModalOpen(true)}
          pendingValidationCount={pendingValidationCount}
          onOpenLoginModal={() => setIsLoginModalOpen(true)}
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
                onOpenPhpModal={() => setIsPhpModalOpen(true)}
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
              />
            )}

            {activeTab === 'capaian-bulanan' && (
              <CapaianBulananView
                indikatorList={indikatorList}
                capaianBulanList={capaianBulanList}
                setCapaianBulanList={setCapaianBulanList}
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
      />

      {/* PHP Backend Source Code & MySQL Architecture Modal */}
      {isPhpModalOpen && (
        <PhpArchitectureModal onClose={() => setIsPhpModalOpen(false)} />
      )}
    </div>
  );
}
