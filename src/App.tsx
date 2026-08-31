import React, { useState } from 'react';

import {
  INITIAL_USERS,
  INITIAL_OPD,
  INITIAL_RENSTRA_SASARAN,
   INITIAL_RENSTRA_TUJUAN,
  INITIAL_BOBOT_SAKIP,
  INITIAL_INDIKATOR_PK,
  INITIAL_CAPAIAN_BULAN,
  INITIAL_CAPAIAN_TRIWULAN,
  INITIAL_LHE,
} from '../data/initialData';

import {
  User,
  UserRole,
  OPD,
  RenstraTujuan,
  RenstraSasaran,
  BobotSakip,
  IndikatorPK,
  CapaianIndikatorBulan,
  CapaianIndikatorTriwulan,
  LHEEvaluation,
} from '../utils/types';

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

export default function App() {

  // =====================================================
  // NAVIGATION
  // =====================================================

  const [activeTab, setActiveTab] =
    useState<ActiveTab>('dashboard');

  // =====================================================
  // USER
  // =====================================================

  const [userList, setUserList] =
    useState<User[]>(INITIAL_USERS);

  const [currentUser, setCurrentUser] =
    useState<User>(INITIAL_USERS[0]);

  // =====================================================
  // FILTER
  // =====================================================

  const [selectedYear, setSelectedYear] =
    useState<number>(2025);

  const [selectedOpdId, setSelectedOpdId] =
    useState<string>('all');

  // =====================================================
  // MOBILE SIDEBAR
  // =====================================================

  const [isOpenMobile, setIsOpenMobile] =
    useState(false);

  // =====================================================
  // PHP MODAL
  // =====================================================

  const [isPhpModalOpen, setIsPhpModalOpen] =
    useState(false);

  // =====================================================
  // CORE DATA
  // =====================================================

  const [opdList, setOpdList] =
    useState<OPD[]>(INITIAL_OPD);

  const [renstraList, setRenstraList] =
    useState<RenstraSasaran[]>(INITIAL_RENSTRA_SASARAN);
  const [tujuanList, setTujuanList] = useState<RenstraTujuan[]>(
  INITIAL_RENSTRA_TUJUAN);

  const [bobotSakip, setBobotSakip] =
    useState<BobotSakip>(INITIAL_BOBOT_SAKIP);

  const [indikatorList, setIndikatorList] =
    useState<IndikatorPK[]>(INITIAL_INDIKATOR_PK);

  const [capaianBulanList, setCapaianBulanList] =
    useState<CapaianIndikatorBulan[]>(INITIAL_CAPAIAN_BULAN);

  const [capaianTriwulanList, setCapaianTriwulanList] =
    useState<CapaianIndikatorTriwulan[]>(
      INITIAL_CAPAIAN_TRIWULAN
    );

  const [lheList, setLheList] =
    useState<LHEEvaluation[]>(INITIAL_LHE);

  // =====================================================
  // PENDING VALIDATION
  // =====================================================

  const pendingValidationCount = capaianBulanList.filter(
    (item: any) =>
      item.status === 'menunggu_validasi' ||
      item.status === 'pending' ||
      item.status === 'Menunggu Validasi'
  ).length;

  // =====================================================
  // SWITCH USER / ROLE
  // =====================================================

  const handleUserChange = (role: UserRole) => {

    const selectedUser = userList.find(
      (user) => user.role === role
    );

    if (!selectedUser) return;

    setCurrentUser(selectedUser);

    // Operator hanya boleh melihat OPD miliknya
    if (
      selectedUser.role === 'operator_unit' &&
      selectedUser.opdId
    ) {
      setSelectedOpdId(selectedUser.opdId);
    } else {
      setSelectedOpdId('all');
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-hidden">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}

        currentUser={currentUser}

        onSwitchUser={handleUserChange}

        isOpenMobile={isOpenMobile}
        setIsOpenMobile={setIsOpenMobile}

        pendingValidationCount={pendingValidationCount}
      />

      {/* =================================================
          MAIN CONTENT
      ================================================= */}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden lg:ml-72">

        {/* =================================================
            HEADER
        ================================================= */}

        <Header
          activeTab={activeTab}

          currentUser={currentUser}

          onSwitchUser={handleUserChange}

          users={userList}

          opdList={opdList}

          selectedOpdId={selectedOpdId}
          setSelectedOpdId={setSelectedOpdId}

          selectedYear={selectedYear}
          setSelectedYear={setSelectedYear}

          onToggleMobileMenu={() =>
            setIsOpenMobile(!isOpenMobile)
          }

          onOpenPhpSource={() =>
            setIsPhpModalOpen(true)
          }

          pendingValidationCount={pendingValidationCount}
        />

        {/* =================================================
            CONTENT
        ================================================= */}

        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">

          <div className="max-w-7xl mx-auto space-y-6">

            {/* DASHBOARD */}

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
              />
            )}

            {/* MASTER OPD */}

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

            {/* MASTER USERS */}

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

            {/* MASTER RENSTRA */}

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

            {/* PENGATURAN KINERJA */}

            {activeTab === 'pengaturan-kinerja' && (
              <PengaturanKinerjaView
                bobotSakip={bobotSakip}
                setBobotSakip={setBobotSakip}

                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}

                currentUser={currentUser}
              />
            )}

            {/* INPUT KINERJA */}

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

            {/* CAPAIAN BULANAN */}

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

            {/* CAPAIAN TRIWULAN */}

            {activeTab === 'capaian-triwulan' && (
              <CapaianTriwulanView
                indikatorList={indikatorList}

                capaianTriwulanList={capaianTriwulanList}
                setCapaianTriwulanList={
                  setCapaianTriwulanList
                }

                opdList={opdList}

                selectedOpdId={selectedOpdId}
                selectedYear={selectedYear}

                currentUser={currentUser}
              />
            )}

            {/* LHE */}

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

      {/* =================================================
          PHP MODAL
      ================================================= */}

      {isPhpModalOpen && (
        <PhpArchitectureModal
          onClose={() => setIsPhpModalOpen(false)}
        />
      )}

    </div>
  );
}