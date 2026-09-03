import React, { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  Shield,
  Phone,
  Mail,
  UserCheck,
  CheckCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { OPD, User, UserRole } from '../types';

interface MasterDataViewProps {
  viewType: 'opd' | 'users';
  opdList: OPD[];
  setOpdList: React.Dispatch<React.SetStateAction<OPD[]>>;
  usersList: User[];
  setUsersList: React.Dispatch<React.SetStateAction<User[]>>;
  currentUser: User;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  viewType,
  opdList = [],
  setOpdList,
  usersList = [],
  setUsersList,
  currentUser,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // OPD Form State
  const [opdForm, setOpdForm] = useState<Partial<OPD>>({
    kode: '',
    nama: '',
    kepala: '',
    nipKepala: '',
    kategori: 'Dinas Teknis',
    email: '',
    telepon: '',
  });

  // User Form State
  const [userForm, setUserForm] = useState<Partial<User>>({
    name: '',
    nip: '',
    email: '',
    role: 'operator_unit',
    roleTitle: '',
    opdId: opdList?.[0]?.id || '',
    opdName: opdList?.[0]?.nama || '',
  });

  const canModify = currentUser.role === 'administrator';

  // Handlers for OPD
  const handleSaveOpd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opdForm.nama || !opdForm.kode) return;

    if (editingItem) {
      setOpdList((prev) =>
        prev.map((o) => (o.id === editingItem.id ? ({ ...o, ...opdForm } as OPD) : o))
      );
    } else {
      const newOpd: OPD = {
        id: `opd-${Date.now()}`,
        kode: opdForm.kode || '00.00',
        nama: opdForm.nama || '',
        kepala: opdForm.kepala || '-',
        nipKepala: opdForm.nipKepala || '-',
        kategori: opdForm.kategori || 'Dinas Teknis',
        email: opdForm.email || '-',
        telepon: opdForm.telepon || '-',
      };
      setOpdList((prev) => [...prev, newOpd]);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteOpd = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus OPD ini?')) {
      setOpdList((prev) => prev.filter((o) => o.id !== id));
    }
  };

  // Handlers for Users
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.nip) return;

    const assignedOpd = opdList.find((o) => o.id === userForm.opdId);

    const getRoleTitle = (role: UserRole) => {
      switch (role) {
        case 'administrator':
          return 'Administrator Utama SAKIP';
        case 'operator_unit':
          return 'Operator Unit / Perencana OPD';
        case 'validator':
          return 'Tim Validator Kinerja Organisasi';
        case 'verifikator':
          return 'Auditor Madya / Tim Evaluator LHE';
      }
    };

    if (editingItem) {
      setUsersList((prev) =>
        prev.map((u) =>
          u.id === editingItem.id
            ? ({
                ...u,
                ...userForm,
                roleTitle: userForm.roleTitle || getRoleTitle(userForm.role as UserRole),
                opdName: assignedOpd ? assignedOpd.nama : u.opdName,
              } as User)
            : u
        )
      );
    } else {
      const newUser: User = {
        id: `user-${Date.now()}`,
        name: userForm.name || '',
        nip: userForm.nip || '',
        email: userForm.email || '',
        role: (userForm.role as UserRole) || 'operator_unit',
        roleTitle: userForm.roleTitle || getRoleTitle(userForm.role as UserRole),
        opdId: userForm.opdId || opdList?.[0]?.id || '',
        opdName: assignedOpd ? assignedOpd.nama : 'Unit Kerja',
      };
      setUsersList((prev) => [...prev, newUser]);
    }
    setIsAddModalOpen(false);
    setEditingItem(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
      setUsersList((prev) => prev.filter((u) => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={viewType === 'opd' ? 'Cari nama OPD atau kode...' : 'Cari nama pengguna atau NIP...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {canModify && (
          <button
            type="button"
            onClick={() => {
              setEditingItem(null);
              if (viewType === 'opd') {
                setOpdForm({
                  kode: '',
                  nama: '',
                  kepala: '',
                  nipKepala: '',
                  kategori: 'Dinas Teknis',
                  email: '',
                  telepon: '',
                });
              } else {
                setUserForm({
                  name: '',
                  nip: '',
                  email: '',
                  role: 'operator_unit',
                  roleTitle: '',
                  opdId: opdList?.[0]?.id || '',
                });
              }
              setIsAddModalOpen(true);
            }}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>{viewType === 'opd' ? 'Tambah OPD Baru' : 'Tambah Pengguna Baru'}</span>
          </button>
        )}
      </div>

      {/* OPD Table View */}
      {viewType === 'opd' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Kode OPD</th>
                  <th className="px-4 py-3">Nama Unit Kerja (OPD)</th>
                  <th className="px-4 py-3">Kepala OPD & NIP</th>
                  <th className="px-4 py-3">Kategori</th>
                  <th className="px-4 py-3">Kontak & Email</th>
                  {canModify && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {opdList
                  .filter(
                    (o) =>
                      o.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      o.kode.includes(searchTerm)
                  )
                  .map((opd) => (
                    <tr key={opd.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-slate-800">
                        {opd.kode}
                      </td>
                      <td className="px-4 py-3.5 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>{opd.nama}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">
                        <p className="font-semibold">{opd.kepala}</p>
                        <p className="text-[11px] text-slate-400 font-mono">NIP. {opd.nipKepala}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-medium">
                          {opd.kategori}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{opd.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{opd.telepon}</span>
                        </div>
                      </td>
                      {canModify && (
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingItem(opd);
                                setOpdForm(opd);
                                setIsAddModalOpen(true);
                              }}
                              className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                              title="Edit OPD"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteOpd(opd.id)}
                              className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Hapus OPD"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Table View (4 Roles) */}
      {viewType === 'users' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Manajemen 4 Peran Utama SAKIP (Administrator, Operator Unit, Validator, Verifikator)
              </span>
            </div>
            <span className="text-xs text-slate-500">{usersList.length} Pengguna Terdaftar</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Nama Pegawai & NIP</th>
                  <th className="px-4 py-3">Role / Peran SAKIP</th>
                  <th className="px-4 py-3">Unit Kerja (OPD)</th>
                  <th className="px-4 py-3">Email Akun</th>
                  {canModify && <th className="px-4 py-3 text-right">Aksi</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList
                  .filter(
                    (u) =>
                      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      u.nip.includes(searchTerm) ||
                      u.role.includes(searchTerm)
                  )
                  .map((user) => {
                    const getBadge = (role: UserRole) => {
                      switch (role) {
                        case 'administrator':
                          return {
                            label: '1. Administrator',
                            style: 'bg-rose-100 text-rose-800 border-rose-200',
                          };
                        case 'operator_unit':
                          return {
                            label: '2. Operator Unit',
                            style: 'bg-sky-100 text-sky-800 border-sky-200',
                          };
                        case 'validator':
                          return {
                            label: '3. Validator',
                            style: 'bg-amber-100 text-amber-800 border-amber-200',
                          };
                        case 'verifikator':
                          return {
                            label: '4. Verifikator',
                            style: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                          };
                      }
                    };
                    const badge = getBadge(user.role);

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">{user.name}</p>
                              {user.nip && user.nip !== '-' && (
                                <p className="text-[11px] text-slate-500 font-mono">NIP. {user.nip}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold border ${badge.style}`}
                          >
                            {badge.label}
                          </span>
                          <p className="text-[11px] text-slate-500 mt-1">{user.roleTitle}</p>
                        </td>
                        <td className="px-4 py-3.5 font-medium text-slate-800">{user.opdName}</td>
                        <td className="px-4 py-3.5 text-slate-600 font-mono text-[11px]">
                          {user.email}
                        </td>
                        {canModify && (
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingItem(user);
                                  setUserForm(user);
                                  setIsAddModalOpen(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                                title="Edit Pengguna"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-1.5 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Hapus Pengguna"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Add / Edit OPD or User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">
                {editingItem ? 'Edit Data' : 'Tambah Data Baru'}{' '}
                {viewType === 'opd' ? 'OPD / Unit Kerja' : 'Pengguna SAKIP'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewType === 'opd' ? (
              <form onSubmit={handleSaveOpd} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Kode OPD</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: 01.01"
                    value={opdForm.kode}
                    onChange={(e) => setOpdForm({ ...opdForm, kode: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Unit Kerja (OPD)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Dinas Pendidikan"
                    value={opdForm.nama}
                    onChange={(e) => setOpdForm({ ...opdForm, nama: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nama Kepala OPD</label>
                    <input
                      type="text"
                      placeholder="Nama lengkap & gelar"
                      value={opdForm.kepala}
                      onChange={(e) => setOpdForm({ ...opdForm, kepala: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NIP Kepala</label>
                    <input
                      type="text"
                      placeholder="1980xxxx..."
                      value={opdForm.nipKepala}
                      onChange={(e) => setOpdForm({ ...opdForm, nipKepala: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email Resmi</label>
                    <input
                      type="email"
                      placeholder="satker@kemenkes.go.id"
                      value={opdForm.email}
                      onChange={(e) => setOpdForm({ ...opdForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Telepon / Fax</label>
                    <input
                      type="text"
                      placeholder="(0751) 37790"
                      value={opdForm.telepon}
                      onChange={(e) => setOpdForm({ ...opdForm, telepon: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Simpan Unit Kerja
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSaveUser} className="mt-4 space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Nama Role / Pengguna
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Administrator / Operator"
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">NIP (Opsional)</label>
                    <input
                      type="text"
                      placeholder="NIP atau tanda (-)"
                      value={userForm.nip}
                      onChange={(e) => setUserForm({ ...userForm, nip: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Email</label>
                    <input
                      type="email"
                      required
                      placeholder="nama@kemenkes.go.id"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Peran / Role</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => setUserForm({ ...userForm, role: e.target.value as UserRole })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    >
                      <option value="administrator">1. Administrator</option>
                      <option value="operator_unit">2. Operator Unit</option>
                      <option value="validator">3. Validator</option>
                      <option value="verifikator">4. Verifikator</option>
                    </select>
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Unit Kerja (OPD)</label>
                    <select
                      value={userForm.opdId}
                      onChange={(e) => setUserForm({ ...userForm, opdId: e.target.value })}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    >
                      {opdList.map((o) => (
                        <option key={o.id} value={o.id}>
                          {o.nama}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-3 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                  >
                    Simpan Pengguna
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
