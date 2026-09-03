import React from 'react';
import { LogOut, AlertTriangle, X } from 'lucide-react';
import { User } from '../types';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: () => void;
  currentUser: User;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  currentUser,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden text-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Konfirmasi Log Out</h3>
              <p className="text-xs text-slate-500">Keluar dari sesi aplikasi SAKElek</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <p className="text-xs text-slate-500 font-semibold mb-1">Akun yang sedang aktif:</p>
            <p className="text-sm font-bold text-slate-900">{currentUser.name}</p>
            <p className="text-xs text-slate-600 capitalize mt-0.5">
              Peran: <span className="font-semibold text-emerald-700">{currentUser.roleTitle}</span>
            </p>
            {currentUser.nip && currentUser.nip !== '-' ? (
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">NIP. {currentUser.nip}</p>
            ) : (
              <p className="text-[11px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Apakah Anda yakin ingin keluar dari sesi SAKElek? Semua perubahan data yang belum disimpan pada form yang sedang aktif mungkin akan hilang.
          </p>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirmLogout}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/30 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Ya, Keluar (Log Out)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
