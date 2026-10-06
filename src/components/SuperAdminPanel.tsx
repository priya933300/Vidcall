import React, { useState } from 'react';
import {
  ShieldAlert,
  UserCheck,
  UserPlus,
  Trash2,
  Edit2,
  DollarSign,
  TrendingUp,
  Activity,
  PhoneCall,
  CheckSquare,
  Square,
  Coins,
  Lock,
  Unlock,
} from 'lucide-react';
import { User, AdminPermissions } from '../types';
import { storage } from '../utils/storage';
import { generateSvgAvatar } from '../utils/avatars';

interface SuperAdminPanelProps {
  currentUser: User;
  onRefresh: () => void;
  lang: 'bn' | 'en';
}

export const SuperAdminPanel: React.FC<SuperAdminPanelProps> = ({ currentUser, onRefresh, lang }) => {
  const [showCreateAdmin, setShowCreateAdmin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [perms, setPerms] = useState<AdminPermissions>({
    canManageCredits: true,
    canManageUsers: true,
    canManagePhotos: true,
    canApproveRecharge: true,
    canProcessCashout: true,
  });
  const [editingAdmin, setEditingAdmin] = useState<User | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const users = storage.getUsers();
  const recharges = storage.getRechargeRequests();
  const cashouts = storage.getCashoutRequests();
  const callLogs = storage.getCallLogs();

  const admins = users.filter((u) => u.role === 'ADMIN');
  const fxUsers = users.filter((u) => u.role === 'FX_USER');
  const mxUsers = users.filter((u) => u.role === 'MX_USER');

  // Financial statistics
  const totalApprovedInr = recharges
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.amountInr, 0);

  const totalCreditsIssued = recharges
    .filter((r) => r.status === 'APPROVED')
    .reduce((sum, r) => sum + r.credits, 0);

  const totalCashoutsCompletedInr = cashouts
    .filter((c) => c.status === 'COMPLETED')
    .reduce((sum, c) => sum + c.amountInr, 0);

  const totalCallMinutes = Math.floor(
    callLogs.reduce((sum, l) => sum + l.durationSeconds, 0) / 60
  );

  const handleCreateOrUpdateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = adminUsername.trim().toLowerCase();

    if (!editingAdmin && users.some((u) => u.username.toLowerCase() === uname)) {
      setErrorMsg(lang === 'bn' ? 'এই ইউজারনেম ইতিমধ্যে নেওয়া হয়েছে!' : 'Username taken!');
      return;
    }

    if (editingAdmin) {
      // Update
      const updated = {
        ...editingAdmin,
        name: adminName.trim() || editingAdmin.name,
        password: adminPassword || editingAdmin.password,
        permissions: perms,
      };
      storage.updateUser(updated);
      setEditingAdmin(null);
    } else {
      // Create
      const newAdmin: User = {
        id: `usr_adm_${Date.now()}`,
        username: uname,
        name: adminName.trim() || uname,
        role: 'ADMIN',
        password: adminPassword || 'admin123',
        credits: 50000,
        avatar: generateSvgAvatar(adminName || uname, 'ADMIN', users.length),
        gallery: [],
        isOnline: true,
        isSuspended: false,
        voiceRate: 0,
        videoRate: 0,
        permissions: perms,
        createdAt: new Date().toISOString(),
        bio: 'সুপার অ্যাডমিন দ্বারা নিযুক্ত প্ল্যাটফর্ম অ্যাডমিন',
      };
      storage.saveUsers([...users, newAdmin]);
    }

    setShowCreateAdmin(false);
    setAdminUsername('');
    setAdminName('');
    setAdminPassword('');
    setErrorMsg('');
    onRefresh();
  };

  const handleDeleteAdmin = (adminId: string) => {
    const updated = users.filter((u) => u.id !== adminId);
    storage.saveUsers(updated);
    onRefresh();
  };

  const startEditAdmin = (admin: User) => {
    setEditingAdmin(admin);
    setAdminUsername(admin.username);
    setAdminName(admin.name);
    setAdminPassword(admin.password);
    setPerms(
      admin.permissions || {
        canManageCredits: true,
        canManageUsers: true,
        canManagePhotos: true,
        canApproveRecharge: true,
        canProcessCashout: true,
      }
    );
    setShowCreateAdmin(true);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-slate-900 p-6 rounded-3xl border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              {lang === 'bn' ? 'সুপার অ্যাডমিন পূর্ণ নিয়ন্ত্রণ' : 'Super Admin Full Authority'}
            </h2>
          </div>
          <p className="text-xs text-purple-200/80 mt-1 max-w-xl">
            {lang === 'bn'
              ? 'প্ল্যাটফর্মের প্রতিটা ক্ষেত্রের এডিট, ডিলিট, অ্যাড ও রিমুভ এর সম্পুর্ন ক্ষমতা। অ্যাডমিন তৈরি করুন ও নির্দিষ্ট ক্ষমতা অর্পণ করুন।'
              : 'Complete platform oversight: edit, delete, add, remove authority. Create Admins and delegate granular permissions.'}
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAdmin(null);
            setAdminUsername('');
            setAdminName('');
            setAdminPassword('');
            setShowCreateAdmin(true);
          }}
          className="py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>{lang === 'bn' ? 'নতুন অ্যাডমিন বানান' : 'Create Admin'}</span>
        </button>
      </div>

      {/* Global Analytics Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'bn' ? 'মোট সংগৃহীত INR' : 'Total Revenue'}</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">₹{totalApprovedInr}</div>
          <p className="text-[10px] text-emerald-400 mt-1">UPI রিচার্জ সফল</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'bn' ? 'মোট ক্রেডিট ইস্যু' : 'Credits Issued'}</span>
            <Coins className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold text-amber-400 font-mono">{totalCreditsIssued} cr</div>
          <p className="text-[10px] text-slate-400 mt-1">সক্রিয় ইউজারদের মধ্যে</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'bn' ? 'এফএক্স ক্যাশআউট' : 'FX Disbursed'}</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl font-bold text-white font-mono">₹{totalCashoutsCompletedInr}</div>
          <p className="text-[10px] text-slate-400 mt-1">হোস্টদের নগদ প্রদান</p>
        </div>

        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>{lang === 'bn' ? 'মোট কল মিনিট' : 'Call Minutes'}</span>
            <PhoneCall className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-xl font-bold text-teal-400 font-mono">{totalCallMinutes} mins</div>
          <p className="text-[10px] text-slate-400 mt-1">{callLogs.length} টি কল হিস্ট্রি</p>
        </div>
      </div>

      {/* Admin Delegation Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-400" />
            {lang === 'bn' ? 'প্ল্যাটফর্ম অ্যাডমিন তালিকা ও ক্ষমতা বণ্টন' : 'Admins & Granted Powers'}
          </h3>
          <span className="text-xs text-slate-400 font-mono">({admins.length} Admins)</span>
        </div>

        {admins.length === 0 ? (
          <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো অ্যাডমিন নেই' : 'No admins created'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {admins.map((admin) => {
              const p = admin.permissions || {
                canManageCredits: false,
                canManageUsers: false,
                canManagePhotos: false,
                canApproveRecharge: false,
                canProcessCashout: false,
              };

              return (
                <div
                  key={admin.id}
                  className="bg-slate-900 p-5 rounded-2xl border border-slate-800 space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={admin.avatar}
                        alt={admin.name}
                        className="w-12 h-12 rounded-full object-cover border-2 border-purple-500"
                      />
                      <div>
                        <h4 className="font-bold text-white text-sm">{admin.name}</h4>
                        <p className="text-xs text-slate-400 font-mono">@{admin.username}</p>
                        <p className="text-[10px] text-purple-300 mt-0.5">
                          পাসওয়ার্ড: <span className="font-mono text-slate-300">{admin.password}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => startEditAdmin(admin)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                        title={lang === 'bn' ? 'ক্ষমতা পরিবর্তন করুন' : 'Edit permissions'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAdmin(admin.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/60 text-rose-400 transition-colors"
                        title={lang === 'bn' ? 'অ্যাডমিন রিমুভ করুন' : 'Delete admin'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Granted Permissions List */}
                  <div className="pt-2 border-t border-slate-800 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      অর্পিত ক্ষমতা (Assigned Powers):
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 text-xs">
                      <span
                        className={`flex items-center gap-1.5 ${
                          p.canManageCredits ? 'text-emerald-400' : 'text-slate-600 line-through'
                        }`}
                      >
                        {p.canManageCredits ? '✓' : '✗'} ক্রেডিট নিয়ন্ত্রণ
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          p.canManageUsers ? 'text-emerald-400' : 'text-slate-600 line-through'
                        }`}
                      >
                        {p.canManageUsers ? '✓' : '✗'} ইউজার তৈরি/সাসপেন্ড
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          p.canManagePhotos ? 'text-emerald-400' : 'text-slate-600 line-through'
                        }`}
                      >
                        {p.canManagePhotos ? '✓' : '✗'} গ্যালারি ফটো এডিট
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          p.canApproveRecharge ? 'text-emerald-400' : 'text-slate-600 line-through'
                        }`}
                      >
                        {p.canApproveRecharge ? '✓' : '✗'} ইউপিআই রিচার্জ অ্যাপ্রুভ
                      </span>
                      <span
                        className={`flex items-center gap-1.5 ${
                          p.canProcessCashout ? 'text-emerald-400' : 'text-slate-600 line-through'
                        }`}
                      >
                        {p.canProcessCashout ? '✓' : '✗'} এফএক্স ক্যাশআউট
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Admin */}
      {showCreateAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">
              {editingAdmin
                ? lang === 'bn'
                  ? 'অ্যাডমিন ক্ষমতা আপডেট করুন'
                  : 'Update Admin Powers'
                : lang === 'bn'
                ? 'নতুন অ্যাডমিন তৈরি ও ক্ষমতা প্রদান'
                : 'Create Admin & Assign Powers'}
            </h3>

            {errorMsg && (
              <p className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleCreateOrUpdateAdmin} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'ইউজারনেম' : 'Username'} *
                </label>
                <input
                  type="text"
                  value={adminUsername}
                  disabled={!!editingAdmin}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  placeholder="e.g. admin_sujoy"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white disabled:opacity-50"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'নাম' : 'Name'}
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="e.g. Sujoy Sen"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
                </label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  placeholder="পাসওয়ার্ড দিন"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                />
              </div>

              {/* Granular Permission Toggles */}
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <span className="text-xs font-bold text-purple-300 block">
                  {lang === 'bn' ? 'অ্যাডমিনকে কোন কোন ক্ষমতা দেবেন:' : 'Delegate Permissions:'}
                </span>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.canManageCredits}
                    onChange={(e) => setPerms({ ...perms, canManageCredits: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                  <span>ক্রেডিট যোগ ও বিয়োগ করার ক্ষমতা (Manage Credits)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.canManageUsers}
                    onChange={(e) => setPerms({ ...perms, canManageUsers: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                  <span>FX ও MX ইউজার তৈরি, সাসপেন্ড ও একটিভ করার ক্ষমতা</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.canManagePhotos}
                    onChange={(e) => setPerms({ ...perms, canManagePhotos: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                  <span>ইউজারদের গ্যালারি ছবি এড ও ডিলিট করার ক্ষমতা</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.canApproveRecharge}
                    onChange={(e) => setPerms({ ...perms, canApproveRecharge: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                  <span>ইউপিআই রিচার্জ যাচাই ও অনুমোদন করার ক্ষমতা</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={perms.canProcessCashout}
                    onChange={(e) => setPerms({ ...perms, canProcessCashout: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-0"
                  />
                  <span>এফএক্স হোস্টের ক্যাশআউট প্রক্রিয়া করার ক্ষমতা</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateAdmin(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold shadow-md shadow-purple-600/30"
                >
                  {editingAdmin
                    ? lang === 'bn'
                      ? 'আপডেট করুন'
                      : 'Update'
                    : lang === 'bn'
                    ? 'বানান'
                    : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
