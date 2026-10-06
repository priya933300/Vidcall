import React, { useState } from 'react';
import {
  Users,
  CreditCard,
  UserPlus,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  Lock,
  Unlock,
  Coins,
  ArrowDownLeft,
  ArrowUpRight,
  Eye,
  Trash2,
  Sparkles,
  Image as ImageIcon,
  AlertTriangle,
  FileText,
  Search,
  Clock,
  Calendar,
  ShieldAlert,
  Database,
  CheckCheck,
  Phone,
  Video,
  Megaphone,
  Bell,
  Send,
  Info,
  Radio,
  Check,
  AlertCircle,
  Edit3,
  Pause,
  Play,
  Gift,
  Power,
  ToggleLeft,
  ToggleRight,
  Star,
} from 'lucide-react';
import { User, UserRole, RechargeRequest, CashoutRequest, AdminPermissions, CallLog, SystemAnnouncement, SignupBonusOffer } from '../types';
import { storage } from '../utils/storage';
import { generateSvgAvatar } from '../utils/avatars';
import { GalleryManager } from './GalleryManager';

interface AdminPanelProps {
  currentUser: User;
  onRefresh: () => void;
  lang: 'bn' | 'en';
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ currentUser, onRefresh, lang }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'recharges' | 'cashouts' | 'audit' | 'announcements'>('recharges');
  const [selectedUserForGallery, setSelectedUserForGallery] = useState<User | null>(null);

  // Audit view filters
  const [auditSearch, setAuditSearch] = useState('');
  const [auditTypeFilter, setAuditTypeFilter] = useState<'ALL' | 'VOICE' | 'VIDEO' | 'RATED'>('ALL');

  // Announcements state
  const [annTitle, setAnnTitle] = useState('');
  const [annMessage, setAnnMessage] = useState('');
  const [annType, setAnnType] = useState<'INFO' | 'ALERT' | 'WARNING' | 'OFFER'>('INFO');
  const [annPriority, setAnnPriority] = useState<'NORMAL' | 'HIGH' | 'URGENT'>('NORMAL');
  const [annSuccessMsg, setAnnSuccessMsg] = useState('');
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

  // Sign-up bonus offer state
  const bonusOffer = storage.getSignupBonusOffer();
  const [showBonusModal, setShowBonusModal] = useState(false);
  const [bonusAmountInput, setBonusAmountInput] = useState(bonusOffer.bonusCredits || 50);
  const [bonusTitleInput, setBonusTitleInput] = useState(bonusOffer.title || 'অ্যাডমিন স্পেশাল সাইন আপ বোনাস');
  const [bonusToggleSuccessMsg, setBonusToggleSuccessMsg] = useState('');

  // User Edit State
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editRole, setEditRole] = useState<'FX_USER' | 'MX_USER'>('FX_USER');
  const [editVoiceRate, setEditVoiceRate] = useState(20);
  const [editVideoRate, setEditVideoRate] = useState(40);
  const [editCredits, setEditCredits] = useState(0);
  const [editBio, setEditBio] = useState('');
  const [editIsPaused, setEditIsPaused] = useState(false);
  const [editIsLive, setEditIsLive] = useState(false);
  const [editIsSuspended, setEditIsSuspended] = useState(false);

  // User Delete State
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Quick User ID Action State for Admin Direct Control
  const [quickTargetUserId, setQuickTargetUserId] = useState('');
  const [quickActionMsg, setQuickActionMsg] = useState('');

  // Users Filter State
  const [userFilter, setUserFilter] = useState<'ALL' | 'FX' | 'MX' | 'LIVE' | 'PAUSED' | 'SUSPENDED'>('ALL');
  const [userSearch, setUserSearch] = useState('');

  // Dedicated modal controls for each separate power
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreditManageModal, setShowCreditManageModal] = useState(false);
  const [showPhotoSelectModal, setShowPhotoSelectModal] = useState(false);
  const [showSuspendSelectModal, setShowSuspendSelectModal] = useState(false);

  // Create User Form State
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'FX_USER' | 'MX_USER'>('FX_USER');
  const [newVoiceRate, setNewVoiceRate] = useState(20);
  const [newVideoRate, setNewVideoRate] = useState(40);
  const [formError, setFormError] = useState('');

  // Credit Adjust State
  const [creditModalUser, setCreditModalUser] = useState<User | null>(null);
  const [creditAmount, setCreditAmount] = useState(100);

  const users = storage.getUsers();
  const recharges = storage.getRechargeRequests();
  const cashouts = storage.getCashoutRequests();

  // Permission checks
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const perms: AdminPermissions = currentUser.permissions || {
    canManageCredits: isSuperAdmin,
    canManageUsers: isSuperAdmin,
    canManagePhotos: isSuperAdmin,
    canApproveRecharge: isSuperAdmin,
    canProcessCashout: isSuperAdmin,
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = newUsername.trim().toLowerCase();

    // Validate alphanumeric 4-8 chars if MX_USER
    if (newRole === 'MX_USER') {
      const regex = /^[a-zA-Z0-9]{4,8}$/;
      if (!regex.test(uname)) {
        setFormError(
          lang === 'bn'
            ? 'এমএক্স ইউজারনেম শুধুমাত্র আলফা-নিউমেরিক ৪ থেকে ৮ অক্ষরের হতে হবে!'
            : 'MX Username must be alphanumeric, 4 to 8 characters!'
        );
        return;
      }
    }

    if (users.some((u) => u.username.toLowerCase() === uname)) {
      setFormError(lang === 'bn' ? 'এই ইউজারনেম ইতিমধ্যে ব্যবহৃত হয়েছে!' : 'Username already taken!');
      return;
    }

    if (!newPassword || newPassword.length < 4) {
      setFormError(lang === 'bn' ? 'পাসওয়ার্ড অন্তত ৪ অক্ষরের হতে হবে!' : 'Password must be at least 4 characters!');
      return;
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      username: uname,
      name: newName.trim() || uname,
      role: newRole,
      password: newPassword,
      credits: newRole === 'MX_USER' ? 0 : 0,
      avatar: generateSvgAvatar(newName || uname, newRole, users.length),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      voiceRate: newRole === 'FX_USER' ? newVoiceRate : 0,
      videoRate: newRole === 'FX_USER' ? newVideoRate : 0,
      createdAt: new Date().toISOString(),
      bio: newRole === 'FX_USER' ? 'কল রিসিভার হোস্ট' : 'সদস্য কলার',
    };

    storage.saveUsers([...users, newUser]);
    setShowCreateModal(false);
    setNewUsername('');
    setNewName('');
    setNewPassword('');
    setFormError('');
    onRefresh();
  };

  const toggleSuspend = (user: User) => {
    if (!perms.canManageUsers && !isSuperAdmin) return;
    const updated = { ...user, isSuspended: !user.isSuspended };
    storage.updateUser(updated);
    onRefresh();
  };

  const handleAdjustCredits = (delta: number) => {
    if (!creditModalUser || (!perms.canManageCredits && !isSuperAdmin)) return;
    const newBal = Math.max(0, creditModalUser.credits + delta);
    const updated = { ...creditModalUser, credits: newBal };
    storage.updateUser(updated);
    setCreditModalUser(null);
    onRefresh();
  };

  const handleApproveRecharge = (req: RechargeRequest) => {
    if (!perms.canApproveRecharge && !isSuperAdmin) return;
    // Credit user's wallet
    const targetUser = users.find((u) => u.id === req.userId);
    if (targetUser) {
      const updatedUser = { ...targetUser, credits: targetUser.credits + req.credits };
      storage.updateUser(updatedUser);
    }

    // Update request
    const updatedReqs = recharges.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: 'APPROVED' as const,
            processedBy: currentUser.username,
          }
        : r
    );
    storage.saveRechargeRequests(updatedReqs);
    onRefresh();
  };

  const handleRejectRecharge = (req: RechargeRequest) => {
    if (!perms.canApproveRecharge && !isSuperAdmin) return;
    const updatedReqs = recharges.map((r) =>
      r.id === req.id
        ? {
            ...r,
            status: 'REJECTED' as const,
            processedBy: currentUser.username,
          }
        : r
    );
    storage.saveRechargeRequests(updatedReqs);
    onRefresh();
  };

  const handleApproveCashout = (req: CashoutRequest) => {
    if (!perms.canProcessCashout && !isSuperAdmin) return;
    const updated = cashouts.map((c) =>
      c.id === req.id
        ? {
            ...c,
            status: 'COMPLETED' as const,
            processedBy: currentUser.username,
          }
        : c
    );
    storage.saveCashoutRequests(updated);
    onRefresh();
  };

  const announcements = storage.getAnnouncements();

  const handleSendAnnouncement = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!annTitle.trim() || !annMessage.trim()) return;

    const newAnn: SystemAnnouncement = {
      id: `ann_${Date.now()}`,
      title: annTitle.trim(),
      message: annMessage.trim(),
      type: annType,
      priority: annPriority,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      createdAt: new Date().toISOString(),
      isActive: true,
    };

    storage.addAnnouncement(newAnn);
    setAnnTitle('');
    setAnnMessage('');
    setAnnSuccessMsg(
      lang === 'bn'
        ? 'সিস্টেম নোটিশ সফলভাবে সকল ইউজারের কাছে সম্প্রচারিত হয়েছে!'
        : 'System announcement broadcasted to all users successfully!'
    );
    setShowAnnouncementModal(false);
    setTimeout(() => setAnnSuccessMsg(''), 4500);
    onRefresh();
  };

  const handleToggleAnnouncement = (id: string) => {
    storage.toggleAnnouncement(id);
    onRefresh();
  };

  const handleDeleteAnnouncement = (id: string) => {
    storage.deleteAnnouncement(id);
    onRefresh();
  };

  const handleTogglePause = (user: User) => {
    storage.toggleUserPause(user.id);
    onRefresh();
  };

  const handleToggleLive = (user: User) => {
    storage.toggleUserLive(user.id);
    onRefresh();
  };

  const handleDeleteUser = (userId: string) => {
    storage.deleteUser(userId);
    setUserToDelete(null);
    onRefresh();
  };

  const handleStartEditUser = (user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditPassword(user.password);
    setEditRole(user.role === 'FX_USER' ? 'FX_USER' : 'MX_USER');
    setEditVoiceRate(user.voiceRate || 20);
    setEditVideoRate(user.videoRate || 40);
    setEditCredits(user.credits || 0);
    setEditBio(user.bio || '');
    setEditIsPaused(Boolean(user.isPaused));
    setEditIsLive(Boolean(user.isLive || user.isOnline));
    setEditIsSuspended(Boolean(user.isSuspended));
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated: User = {
      ...editingUser,
      name: editName.trim() || editingUser.username,
      password: editPassword.trim() || editingUser.password,
      role: editRole,
      voiceRate: editRole === 'FX_USER' ? Number(editVoiceRate) : 0,
      videoRate: editRole === 'FX_USER' ? Number(editVideoRate) : 0,
      credits: Math.max(0, Number(editCredits)),
      bio: editBio.trim(),
      isPaused: editIsPaused,
      isLive: editIsLive,
      isOnline: editIsLive,
      isSuspended: editIsSuspended,
    };
    storage.updateUser(updated);
    setEditingUser(null);
    onRefresh();
  };

  const handleQuickAction = (action: 'DELETE' | 'PAUSE' | 'EDIT' | 'SUSPEND' | 'LIVE') => {
    if (!quickTargetUserId.trim()) {
      setQuickActionMsg(lang === 'bn' ? 'অনুগ্রহ করে একটি ইউজার বেছে নিন।' : 'Please select or enter a user ID/username.');
      setTimeout(() => setQuickActionMsg(''), 4000);
      return;
    }
    const target = users.find(
      (u) =>
        u.id.toLowerCase() === quickTargetUserId.trim().toLowerCase() ||
        u.username.toLowerCase() === quickTargetUserId.trim().toLowerCase()
    );
    if (!target) {
      setQuickActionMsg(lang === 'bn' ? 'ইউজার আইডি পাওয়া যায়নি!' : 'User ID not found!');
      setTimeout(() => setQuickActionMsg(''), 4000);
      return;
    }

    if (action === 'DELETE') {
      setUserToDelete(target);
    } else if (action === 'EDIT') {
      handleStartEditUser(target);
    } else if (action === 'PAUSE') {
      handleTogglePause(target);
      setQuickActionMsg(
        lang === 'bn'
          ? `@${target.username} ইউজার ${!target.isPaused ? 'পজ (POS)' : 'আনপজ'} করা হয়েছে।`
          : `@${target.username} user has been ${!target.isPaused ? 'paused (POS)' : 'resumed'}.`
      );
      setTimeout(() => setQuickActionMsg(''), 4000);
    } else if (action === 'SUSPEND') {
      toggleSuspend(target);
      setQuickActionMsg(
        lang === 'bn'
          ? `@${target.username} ইউজার ${!target.isSuspended ? 'সাসপেন্ড' : 'আনলক'} করা হয়েছে।`
          : `@${target.username} user has been ${!target.isSuspended ? 'suspended' : 'activated'}.`
      );
      setTimeout(() => setQuickActionMsg(''), 4000);
    } else if (action === 'LIVE') {
      handleToggleLive(target);
      setQuickActionMsg(
        lang === 'bn'
          ? `@${target.username} ইউজার লাইভ স্ট্যাটাস আপডেট করা হয়েছে।`
          : `@${target.username} user live status updated.`
      );
      setTimeout(() => setQuickActionMsg(''), 4000);
    }
  };

  const handleToggleSignupBonus = (enabled?: boolean) => {
    const nextEnabled = enabled !== undefined ? enabled : !bonusOffer.isEnabled;
    storage.toggleSignupBonusOffer(nextEnabled, Number(bonusAmountInput) || 50, bonusTitleInput || 'অ্যাডমিন স্পেশাল সাইন আপ বোনাস');
    setBonusToggleSuccessMsg(
      nextEnabled
        ? (lang === 'bn' ? `✅ সাইন আপ বোনাস অফার চালু করা হয়েছে (+${bonusAmountInput || 50} ক্রেডিট)!` : `Signup bonus offer enabled (+${bonusAmountInput || 50} credits)!`)
        : (lang === 'bn' ? '⛔ সাইন আপ বোনাস অফার বন্ধ করা হয়েছে (নতুন ইউজার ০ ক্রেডিট পাবে)।' : 'Signup bonus disabled (new users get 0 credits).')
    );
    setTimeout(() => setBonusToggleSuccessMsg(''), 4500);
    onRefresh();
  };

  const handleSaveSignupBonusSettings = (e: React.FormEvent) => {
    e.preventDefault();
    storage.saveSignupBonusOffer({
      isEnabled: bonusOffer.isEnabled,
      bonusCredits: Math.max(0, Number(bonusAmountInput)),
      title: bonusTitleInput.trim() || 'অ্যাডমিন স্পেশাল সাইন আপ বোনাস',
      updatedAt: new Date().toISOString(),
    });
    setShowBonusModal(false);
    setBonusToggleSuccessMsg(
      lang === 'bn'
        ? `✅ বোনাস সেটিংস সংরক্ষিত হয়েছে (${bonusAmountInput} ক্রেডিট)।`
        : `Bonus settings saved (${bonusAmountInput} credits).`
    );
    setTimeout(() => setBonusToggleSuccessMsg(''), 4500);
    onRefresh();
  };

  // Only show FXUser and MXUser in standard admin list
  const managedUsers = users.filter((u) => u.role === 'FX_USER' || u.role === 'MX_USER');
  const pendingRecharges = recharges.filter((r) => r.status === 'PENDING');
  const pendingCashouts = cashouts.filter((c) => c.status === 'PENDING');

  // Super Admin permanent audit logs: completed calls only
  const allCallLogs = storage.getCallLogs();
  const completedCallLogs = allCallLogs.filter((log) => log.status === 'COMPLETED');

  const filteredAuditLogs = completedCallLogs.filter((log) => {
    const query = auditSearch.trim().toLowerCase();
    const matchesSearch =
      !query ||
      log.callerUsername.toLowerCase().includes(query) ||
      log.receiverUsername.toLowerCase().includes(query) ||
      log.callerId.toLowerCase().includes(query) ||
      log.receiverId.toLowerCase().includes(query) ||
      log.callerName.toLowerCase().includes(query) ||
      log.receiverName.toLowerCase().includes(query) ||
      log.id.toLowerCase().includes(query);

    const matchesType =
      auditTypeFilter === 'ALL'
        ? true
        : auditTypeFilter === 'RATED'
        ? typeof log.rating === 'number' && log.rating > 0
        : log.type === auditTypeFilter;
    return matchesSearch && matchesType;
  });

  const ratedCallLogs = completedCallLogs.filter((l) => typeof l.rating === 'number' && l.rating > 0);
  const avgCallRating =
    ratedCallLogs.length > 0
      ? (ratedCallLogs.reduce((sum, l) => sum + (l.rating || 0), 0) / ratedCallLogs.length).toFixed(1)
      : '5.0';

  const totalAuditCreditsDeducted = completedCallLogs.reduce((sum, l) => sum + l.creditsCharged, 0);
  const totalAuditGiftsCredits = completedCallLogs.reduce((sum, l) => sum + (l.giftsTotalCredits || 0), 0);
  const totalAuditSeconds = completedCallLogs.reduce((sum, l) => sum + l.durationSeconds, 0);
  const totalAuditMinutes = Math.floor(totalAuditSeconds / 60);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-950 text-slate-100 space-y-6">
      {/* Top Banner with Admin Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-[#13222B] to-slate-900 p-5 rounded-3xl border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-600/30">
            {currentUser.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h2 className="text-lg font-extrabold text-white tracking-tight">
                {lang === 'bn' ? 'অ্যাডমিন ক্ষমতা ড্যাশবোর্ড' : 'Admin Powers Dashboard'}
              </h2>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                @{currentUser.username}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'সুপার অ্যাডমিন প্রদত্ত সকল ক্ষমতার আলাদা অ্যাকশন বাটন কন্ট্রোল'
                : 'Dedicated control buttons for all assigned admin powers'}
            </p>
          </div>
        </div>
      </div>

      {/* DEDICATED ADMIN CAPABILITIES ACTION BUTTONS GRID */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{lang === 'bn' ? 'এডমিনের সকল ক্ষমতার আলাদা আলাদা অ্যাকশন বাটন:' : 'Dedicated Admin Power Action Buttons:'}</span>
          </h3>
          <span className="text-[11px] text-emerald-400 font-mono">
            {lang === 'bn' ? (isSuperAdmin ? '৯টি স্বতন্ত্র ক্ষমতা' : '৮টি স্বতন্ত্র ক্ষমতা') : (isSuperAdmin ? '9 Dedicated Powers' : '8 Dedicated Powers')}
          </span>
        </div>

        {/* The Separate Action Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Power Button 1: Create FX / MX User */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/80 to-slate-900 hover:from-emerald-900/90 hover:to-slate-800 border border-emerald-500/40 text-left transition-all group shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-2.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors">
              <UserPlus className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '১. নতুন ইউজার তৈরি' : '1. Create User'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'FXHost ও MXUser তৈরি করুন' : 'Create FXHost / MXUser'}
            </p>
          </button>

          {/* Power Button 2: Manage & Adjust Credits */}
          <button
            onClick={() => {
              setActiveTab('users');
              setShowCreditManageModal(true);
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/80 to-slate-900 hover:from-amber-900/90 hover:to-slate-800 border border-amber-500/40 text-left transition-all group shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-2.5 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Coins className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '২. ক্রেডিট যোগ ও বিয়োগ' : '2. Adjust Credits'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'ব্যালেন্স পরিবর্তন ও নিয়ন্ত্রণ' : 'Add or deduct credits'}
            </p>
          </button>

          {/* Power Button 3: Suspend / Activate Users */}
          <button
            onClick={() => {
              setActiveTab('users');
              setShowSuspendSelectModal(true);
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/80 to-slate-900 hover:from-rose-900/90 hover:to-slate-800 border border-rose-500/40 text-left transition-all group shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-2.5 group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৩. সাসপেন্ড ও অ্যাক্টিভ' : '3. Suspend / Activate'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'ইউজার একাউন্ট ব্লক ও আনব্লক' : 'Lock / unlock accounts'}
            </p>
          </button>

          {/* Power Button 4: Manage Gallery Photos */}
          <button
            onClick={() => {
              setActiveTab('users');
              setShowPhotoSelectModal(true);
            }}
            className="p-4 rounded-2xl bg-gradient-to-br from-cyan-950/80 to-slate-900 hover:from-cyan-900/90 hover:to-slate-800 border border-cyan-500/40 text-left transition-all group shadow-md active:scale-[0.98]"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mb-2.5 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
              <ImageIcon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৪. গ্যালারির ছবি পরিচালনা' : '4. Gallery Photos'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? '১০টি ছবি যোগ ও ডিলিট করুন' : 'Add/delete user photos'}
            </p>
          </button>

          {/* Power Button 5: Approve UPI Recharge */}
          <button
            onClick={() => setActiveTab('recharges')}
            className={`p-4 rounded-2xl bg-gradient-to-br from-blue-950/80 to-slate-900 hover:from-blue-900/90 hover:to-slate-800 border text-left transition-all group shadow-md active:scale-[0.98] ${
              activeTab === 'recharges' ? 'border-blue-400 ring-2 ring-blue-500/30' : 'border-blue-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              {pendingRecharges.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[11px] animate-bounce">
                  {pendingRecharges.length} New
                </span>
              )}
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৫. UPI রিচার্জ অনুমোদন' : '5. Approve Recharges'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'UTR যাচাই ও ক্রেডিট প্রদান' : 'Verify UTR & credit user'}
            </p>
          </button>

          {/* Power Button 6: Process FX Cashouts */}
          <button
            onClick={() => setActiveTab('cashouts')}
            className={`p-4 rounded-2xl bg-gradient-to-br from-purple-950/80 to-slate-900 hover:from-purple-900/90 hover:to-slate-800 border text-left transition-all group shadow-md active:scale-[0.98] ${
              activeTab === 'cashouts' ? 'border-purple-400 ring-2 ring-purple-500/30' : 'border-purple-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
                <ArrowUpRight className="w-5 h-5" />
              </div>
              {pendingCashouts.length > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950 font-extrabold text-[11px] animate-bounce">
                  {pendingCashouts.length} New
                </span>
              )}
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৬. FX ক্যাশআউট বিতরণ' : '6. Process Cashouts'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'হোস্টদের নগদ টাকা সম্পন্ন' : 'Disburse host payout'}
            </p>
          </button>

          {/* Power Button 7: Send System Announcement */}
          <button
            onClick={() => {
              setActiveTab('announcements');
            }}
            className={`p-4 rounded-2xl bg-gradient-to-br from-indigo-950/90 to-slate-900 hover:from-indigo-900 hover:to-slate-800 border text-left transition-all group shadow-md active:scale-[0.98] ${
              activeTab === 'announcements' ? 'border-indigo-400 ring-2 ring-indigo-500/40' : 'border-indigo-500/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                <Megaphone className="w-5 h-5" />
              </div>
              <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold text-[11px] border border-indigo-500/30">
                {announcements.filter((a) => a.isActive).length} Active
              </span>
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৭. সিস্টেম নোটিশ ও ঘোষণা' : '7. System Announcement'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {lang === 'bn' ? 'সকল ইউজারের জন্য জরুরি বার্তা পাঠান' : 'Broadcast alert to all users'}
            </p>
          </button>

          {/* Power Button 8: Sign-up Bonus Offer Control */}
          <button
            onClick={() => setShowBonusModal(true)}
            className={`p-4 rounded-2xl bg-gradient-to-br from-pink-950/80 to-slate-900 hover:from-pink-900/90 hover:to-slate-800 border text-left transition-all group shadow-md active:scale-[0.98] ${
              bonusOffer.isEnabled ? 'border-pink-500/60 ring-2 ring-pink-500/30' : 'border-pink-500/30'
            }`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="w-10 h-10 rounded-xl bg-pink-500/20 text-pink-400 flex items-center justify-center group-hover:bg-pink-500 group-hover:text-white transition-colors">
                <Gift className="w-5 h-5" />
              </div>
              <span
                className={`px-2 py-0.5 rounded-full font-extrabold text-[11px] border ${
                  bonusOffer.isEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {bonusOffer.isEnabled ? `ON (+${bonusOffer.bonusCredits} cr)` : 'OFF (০ cr)'}
              </span>
            </div>
            <h4 className="font-bold text-white text-xs sm:text-sm">
              {lang === 'bn' ? '৮. সাইন আপ বোনাস অফার' : '8. Sign-up Bonus Offer'}
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {bonusOffer.isEnabled
                ? (lang === 'bn' ? `চালু: নতুন ইউজার +${bonusOffer.bonusCredits} পাবে` : `Active: +${bonusOffer.bonusCredits} cr for new users`)
                : (lang === 'bn' ? 'বন্ধ: কোনো ইউজার বোনাস পাবে না' : 'Disabled: New users get 0 cr')}
            </p>
          </button>

          {/* Power Button 9: Super Admin Permanent Audit */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('audit')}
              className={`p-4 rounded-2xl bg-gradient-to-br from-amber-950/90 to-slate-900 hover:from-amber-900 hover:to-slate-800 border text-left transition-all group shadow-md active:scale-[0.98] ${
                activeTab === 'audit' ? 'border-amber-400 ring-2 ring-amber-500/40' : 'border-amber-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-extrabold text-[11px] border border-amber-500/30">
                  {completedCallLogs.length} Logs
                </span>
              </div>
              <h4 className="font-bold text-white text-xs sm:text-sm">
                {lang === 'bn' ? '৯. অ্যাডমিন অডিট' : '9. Admin Audit'}
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {lang === 'bn' ? 'স্থায়ী কল লগ ও ক্রেডিট কর্তন' : 'Permanent call & credit audit'}
              </p>
            </button>
          )}
        </div>
      </div>

      {/* Tabs for fast switching */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('recharges')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'recharges'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>{lang === 'bn' ? 'ইউপিআই রিচার্জ তালিকা' : 'Recharge Requests'}</span>
          {pendingRecharges.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px]">
              {pendingRecharges.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'users'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>{lang === 'bn' ? 'FX ও MX ইউজার তালিকা' : 'FX & MX Users'}</span>
          <span className="text-[11px] text-slate-400">({managedUsers.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cashouts')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'cashouts'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white bg-slate-900'
          }`}
        >
          <Coins className="w-4 h-4" />
          <span>{lang === 'bn' ? 'এফএক্স ক্যাশআউট তালিকা' : 'FX Cashouts'}</span>
          {pendingCashouts.length > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-emerald-400 text-slate-950 font-bold text-[10px]">
              {pendingCashouts.length}
            </span>
          )}
        </button>

        {/* Super Admin Audit Tab */}
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('audit')}
            className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
              activeTab === 'audit'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-amber-400 hover:text-white bg-slate-900 border border-amber-500/30'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{lang === 'bn' ? 'অ্যাডমিন অডিট' : 'Admin Audit'}</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[10px]">
              {completedCallLogs.length}
            </span>
          </button>
        )}

        {/* System Announcements Tab */}
        <button
          onClick={() => setActiveTab('announcements')}
          className={`py-2 px-4 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-colors ${
            activeTab === 'announcements'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-indigo-300 hover:text-white bg-slate-900 border border-indigo-500/30'
          }`}
        >
          <Megaphone className="w-4 h-4 text-indigo-400" />
          <span>{lang === 'bn' ? 'সিস্টেম নোটিশ ও ঘোষণা' : 'System Announcements'}</span>
          <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 font-bold text-[10px]">
            {announcements.length}
          </span>
        </button>
      </div>

      {/* Tab 1: UPI Recharge Verification */}
      {activeTab === 'recharges' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'অপেক্ষমাণ রিচার্জ রিকোয়েস্ট' : 'Pending Recharge Requests'}
            </h3>
            <span className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'ইউজার ইউপিআই পেমেন্টের পর ইউটিআর সাবমিট করেছে'
                : 'Users submitted UTR after UPI payment'}
            </span>
          </div>

          {recharges.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              {lang === 'bn' ? 'কোনো রিচার্জ রিকোয়েস্ট নেই' : 'No recharge requests found'}
            </div>
          ) : (
            <div className="space-y-3">
              {recharges.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">@{req.username}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          req.status === 'APPROVED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : req.status === 'REJECTED'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="font-bold text-white">₹{req.amountInr}</span>
                      <span>·</span>
                      <span className="font-mono text-amber-400 font-bold">+{req.credits} Credits</span>
                      <span>·</span>
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                        UTR: {req.utrNumber}
                      </span>
                      <span>·</span>
                      <span className="text-slate-400">{req.senderUpiName}</span>
                    </div>
                  </div>

                  {req.status === 'PENDING' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRejectRecharge(req)}
                        className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-rose-900/50 text-rose-400 border border-rose-800/60 text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'বাতিল করুন' : 'Reject'}</span>
                      </button>
                      <button
                        onClick={() => handleApproveRecharge(req)}
                        className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>{lang === 'bn' ? 'অনুমোদন ও ক্রেডিট দিন' : 'Approve & Credit'}</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Users Management (FXUser & MXUser with Dedicated Action Buttons: Delete / POS / Edit / Suspend / Live / Credit / Photo) */}
      {activeTab === 'users' && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* SIGN-UP BONUS OFFER BANNER & DEDICATED TOGGLE BUTTON */}
          <div className="bg-gradient-to-r from-pink-950/70 via-slate-900 to-slate-900 border border-pink-500/40 rounded-3xl p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center justify-center shrink-0">
                  <Gift className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                      {lang === 'bn' ? 'সাইন আপ বোনাস অফার নিয়ন্ত্রণ' : 'Sign-up Bonus Offer Control'}
                    </h4>
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-extrabold border ${
                        bonusOffer.isEnabled
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {bonusOffer.isEnabled
                        ? `ACTIVE: +${bonusOffer.bonusCredits} CREDITS`
                        : 'DISABLED: 0 CREDITS'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {bonusOffer.isEnabled
                      ? (lang === 'bn'
                          ? `অ্যাডমিন অফার চালু আছে। নতুন কোনো ইউজার সরাসরি সাইন আপ করলে +${bonusOffer.bonusCredits} বোনাস ক্রেডিট পাবে।`
                          : `Bonus offer is ACTIVE. New online registrations automatically receive +${bonusOffer.bonusCredits} credits.`)
                      : (lang === 'bn'
                          ? 'অ্যাডমিন অফার বন্ধ। কোনো নতুন ইউজার সাইন আপ বোনাস পাবে না (ব্যালেন্স ০ থাকবে) যতক্ষন না অ্যাডমিন অফার চালু করছে।'
                          : 'Bonus offer is DISABLED. New users receive 0 credits until admin activates an offer.')}
                  </p>
                </div>
              </div>

              {/* Action Buttons for Sign-up Bonus */}
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  onClick={() => handleToggleSignupBonus()}
                  className={`py-2.5 px-4 rounded-xl text-xs font-black flex items-center gap-2 shadow-md transition-all active:scale-95 ${
                    bonusOffer.isEnabled
                      ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>
                    {bonusOffer.isEnabled
                      ? (lang === 'bn' ? '⛔ অফার বন্ধ করুন' : 'Turn OFF Offer')
                      : (lang === 'bn' ? '✨ অফার চালু করুন' : 'Turn ON Offer')}
                  </span>
                </button>

                <button
                  onClick={() => {
                    setBonusAmountInput(bonusOffer.bonusCredits);
                    setBonusTitleInput(bonusOffer.title || 'অ্যাডমিন স্পেশাল সাইন আপ বোনাস');
                    setShowBonusModal(true);
                  }}
                  className="py-2.5 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <span>⚙️ {lang === 'bn' ? 'পরিমাণ ও সেটিংস' : 'Configure'}</span>
                </button>
              </div>
            </div>

            {bonusToggleSuccessMsg && (
              <div className="p-3 rounded-2xl bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{bonusToggleSuccessMsg}</span>
              </div>
            )}
          </div>

          {/* ADMIN DIRECT USER ID CONTROL BAR: Delete / POS / Edit / Suspend / Live */}
          <div className="bg-gradient-to-r from-slate-900 via-[#18232c] to-slate-900 border border-emerald-500/30 rounded-3xl p-4 sm:p-5 shadow-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <h4 className="text-xs sm:text-sm font-extrabold text-white">
                  {lang === 'bn'
                    ? 'যেকোনো ইউজার আইডি দ্রুত নিয়ন্ত্রণ (Delete / POS / Edit / Suspend / Live):'
                    : 'Target Any User ID Directly (Delete / POS / Edit / Suspend / Live):'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {lang === 'bn' ? 'এডমিনের পূর্ণ ক্ষমতা' : 'Full Admin Authority'}
              </span>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5">
              {/* Select or type user ID */}
              <div className="flex-1 flex items-center gap-2">
                <select
                  value={quickTargetUserId}
                  onChange={(e) => setQuickTargetUserId(e.target.value)}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                >
                  <option value="">{lang === 'bn' ? '-- ইউজার আইডি বা ইউজার বেছে নিন --' : '-- Select User ID / Username --'}</option>
                  {managedUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      @{u.username} ({u.name}) - {u.role === 'FX_USER' ? 'FX Host' : 'MX Caller'} [ID: {u.id.slice(0, 10)}] {u.isSuspended ? '⛔' : ''} {u.isPaused ? '⏸️' : ''} {u.isLive ? '🔴' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5 Distinct Action Buttons: Delete / POS / Edit / Suspend / Live */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 shrink-0">
                {/* 1. ডিলিট (Delete) */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('DELETE')}
                  className="py-2 px-3 rounded-xl bg-red-950/70 hover:bg-red-900 text-red-200 border border-red-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  title={lang === 'bn' ? 'ইউজার আইডি স্থায়ীভাবে মুছে ফেলুন' : 'Delete User ID'}
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>{lang === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                </button>

                {/* 2. pos / পজ (POS / Pause) */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('PAUSE')}
                  className="py-2 px-3 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-200 border border-amber-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  title={lang === 'bn' ? 'ইউজার সাময়িক স্থগিত (POS / Pause) করুন' : 'Pause User (POS)'}
                >
                  <Pause className="w-3.5 h-3.5 text-amber-400" />
                  <span>{lang === 'bn' ? 'pos / পজ' : 'POS'}</span>
                </button>

                {/* 3. edit / এডিট (Edit) */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('EDIT')}
                  className="py-2 px-3 rounded-xl bg-blue-950/70 hover:bg-blue-900 text-blue-200 border border-blue-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  title={lang === 'bn' ? 'ইউজার তথ্য এডিট করুন' : 'Edit User ID'}
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>{lang === 'bn' ? 'edit / এডিট' : 'Edit'}</span>
                </button>

                {/* 4. suspension / সাসপেনশন (Suspend) */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('SUSPEND')}
                  className="py-2 px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900 text-rose-200 border border-rose-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  title={lang === 'bn' ? 'ইউজার আইডি সাসপেন্ড বা আনলক করুন' : 'Suspend / Unlock'}
                >
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{lang === 'bn' ? 'সাসপেনশন' : 'Suspend'}</span>
                </button>

                {/* 5. Live / লাইভ (Live) */}
                <button
                  type="button"
                  onClick={() => handleQuickAction('LIVE')}
                  className="py-2 px-3 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/50 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
                  title={lang === 'bn' ? 'ইউজারকে লাইভ ও সক্রিয় করুন' : 'Make User Live'}
                >
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{lang === 'bn' ? 'Live / সক্রিয়' : 'Live'}</span>
                </button>
              </div>
            </div>

            {quickActionMsg && (
              <div className="p-2.5 rounded-xl bg-slate-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{quickActionMsg}</span>
              </div>
            )}
          </div>

          {/* Search & User Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'ইউজারনেম, নাম বা ID দিয়ে খুঁজুন...'
                    : 'Search by username, name or ID...'
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-800 rounded-xl shrink-0 overflow-x-auto">
              <button
                onClick={() => setUserFilter('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'সকল' : 'All'} ({managedUsers.length})
              </button>
              <button
                onClick={() => setUserFilter('FX')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'FX' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                FX Hosts ({managedUsers.filter((u) => u.role === 'FX_USER').length})
              </button>
              <button
                onClick={() => setUserFilter('MX')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'MX' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                MX Callers ({managedUsers.filter((u) => u.role === 'MX_USER').length})
              </button>
              <button
                onClick={() => setUserFilter('LIVE')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'LIVE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                🔴 Live ({managedUsers.filter((u) => u.isLive || u.isOnline).length})
              </button>
              <button
                onClick={() => setUserFilter('PAUSED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'PAUSED' ? 'bg-amber-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⏸️ POS ({managedUsers.filter((u) => u.isPaused).length})
              </button>
              <button
                onClick={() => setUserFilter('SUSPENDED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  userFilter === 'SUSPENDED' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                ⛔ Suspended ({managedUsers.filter((u) => u.isSuspended).length})
              </button>
            </div>
          </div>

          {/* User Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {managedUsers
              .filter((u) => {
                const q = userSearch.trim().toLowerCase();
                const matchSearch =
                  !q ||
                  u.username.toLowerCase().includes(q) ||
                  u.name.toLowerCase().includes(q) ||
                  u.id.toLowerCase().includes(q);

                if (!matchSearch) return false;
                if (userFilter === 'FX') return u.role === 'FX_USER';
                if (userFilter === 'MX') return u.role === 'MX_USER';
                if (userFilter === 'LIVE') return u.isLive || u.isOnline;
                if (userFilter === 'PAUSED') return u.isPaused;
                if (userFilter === 'SUSPENDED') return u.isSuspended;
                return true;
              })
              .map((user) => (
                <div
                  key={user.id}
                  className={`bg-slate-900 p-5 rounded-3xl border flex flex-col justify-between space-y-4 shadow-xl transition-all ${
                    user.isSuspended
                      ? 'border-rose-900/60 bg-slate-950/90'
                      : user.isPaused
                      ? 'border-amber-900/60 bg-slate-950/90'
                      : user.isLive || user.isOnline
                      ? 'border-emerald-500/40 hover:border-emerald-500/70'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-700"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                            user.isLive || user.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                          }`}
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-white text-sm">
                            {user.name}
                          </h4>
                          {user.isSuspended && (
                            <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.2 rounded-md font-bold">
                              ⛔ সাসপেন্ডেড
                            </span>
                          )}
                          {user.isPaused && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded-md font-bold">
                              ⏸️ POS (পজড)
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono">@{user.username}</p>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              user.role === 'FX_USER'
                                ? 'bg-purple-900/60 text-purple-300 border border-purple-500/30'
                                : 'bg-blue-900/60 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {user.role === 'FX_USER' ? 'FX Host' : 'MX Caller'}
                          </span>

                          <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-500/30">
                            {user.credits} cr
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                              user.isLive || user.isOnline
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                                : 'bg-slate-800 text-slate-400 border-slate-700'
                            }`}
                          >
                            {user.isLive || user.isOnline ? '🔴 Live' : '⚪ অফলাইন'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {user.role === 'FX_USER' && (
                      <div className="text-right text-[11px] text-slate-400 font-mono bg-slate-800/80 p-2 rounded-xl border border-slate-700 shrink-0">
                        <div>Voice: <span className="text-emerald-400 font-bold">{user.voiceRate}</span> cr/m</div>
                        <div>Video: <span className="text-teal-400 font-bold">{user.videoRate}</span> cr/m</div>
                      </div>
                    )}
                  </div>

                  {user.bio && (
                    <p className="text-xs text-slate-400 italic line-clamp-1 bg-slate-950/50 p-2 rounded-xl border border-slate-800/60">
                      "{user.bio}"
                    </p>
                  )}

                  {/* DEDICATED SEPARATE ACTION BUTTONS ON USER CARD */}
                  <div className="pt-3 border-t border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>{lang === 'bn' ? 'ইউজার নিয়ন্ত্রণ ক্ষমতা (সকল অ্যাকশন):' : 'All User Admin Powers:'}</span>
                      <span className="font-mono text-slate-500">ID: {user.id.slice(0, 10)}</span>
                    </div>

                    {/* Primary Row: Edit, POS / Pause, Live, Suspend */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                      {/* Power 1: Edit User */}
                      <button
                        onClick={() => handleStartEditUser(user)}
                        className="py-2 px-2 rounded-xl bg-blue-950/60 hover:bg-blue-900 text-blue-300 text-xs font-bold flex items-center justify-center gap-1 border border-blue-500/40 transition-colors shadow-sm"
                        title={lang === 'bn' ? 'ইউজার তথ্য এডিট করুন' : 'Edit User'}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{lang === 'bn' ? 'এডিট' : 'Edit'}</span>
                      </button>

                      {/* Power 2: POS / Pause Toggle */}
                      <button
                        onClick={() => handleTogglePause(user)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors shadow-sm ${
                          user.isPaused
                            ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400'
                            : 'bg-amber-950/60 hover:bg-amber-900 text-amber-300 border-amber-500/40'
                        }`}
                        title={lang === 'bn' ? 'ইউজার অ্যাকাউন্ট পজ বা আনপজ করুন' : 'Pause / Resume Account'}
                      >
                        {user.isPaused ? (
                          <>
                            <Play className="w-3.5 h-3.5 text-white" />
                            <span>{lang === 'bn' ? 'আনপজ' : 'Resume'}</span>
                          </>
                        ) : (
                          <>
                            <Pause className="w-3.5 h-3.5 text-amber-400" />
                            <span>{lang === 'bn' ? 'POS / পজ' : 'POS'}</span>
                          </>
                        )}
                      </button>

                      {/* Power 3: Live Status Toggle */}
                      <button
                        onClick={() => handleToggleLive(user)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors shadow-sm ${
                          user.isLive || user.isOnline
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-500/50'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                        }`}
                        title={lang === 'bn' ? 'ইউজারের লাইভ স্ট্যাটাস পরিবর্তন করুন' : 'Toggle Live'}
                      >
                        <Radio className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {user.isLive || user.isOnline
                            ? (lang === 'bn' ? '🔴 Live অফ' : 'End Live')
                            : (lang === 'bn' ? '📡 Live চালু' : 'Set Live')}
                        </span>
                      </button>

                      {/* Power 4: Suspend / Reactivate */}
                      <button
                        onClick={() => toggleSuspend(user)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition-colors shadow-sm ${
                          user.isSuspended
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                            : 'bg-rose-950/60 hover:bg-rose-900 text-rose-300 border-rose-500/40'
                        }`}
                        title={lang === 'bn' ? 'অ্যাকাউন্ট সাসপেনশন টগল করুন' : 'Suspend / Activate'}
                      >
                        {user.isSuspended ? (
                          <>
                            <Unlock className="w-3.5 h-3.5 text-white" />
                            <span>{lang === 'bn' ? 'আনলক' : 'Unlock'}</span>
                          </>
                        ) : (
                          <>
                            <Lock className="w-3.5 h-3.5 text-rose-400" />
                            <span>{lang === 'bn' ? 'সাসপেন্ড' : 'Suspend'}</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Secondary Row: Credit Adjust, Photos, and Delete */}
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {/* Power 5: Credit Adjust */}
                      <button
                        onClick={() => setCreditModalUser(user)}
                        className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span>{lang === 'bn' ? 'ক্রেডিট' : 'Credits'}</span>
                      </button>

                      {/* Power 6: Photos */}
                      <button
                        onClick={() => setSelectedUserForGallery(user)}
                        className="py-2 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-bold flex items-center justify-center gap-1 border border-slate-700 transition-colors"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{lang === 'bn' ? 'ছবি' : 'Photos'} ({user.gallery.length})</span>
                      </button>

                      {/* Power 7: Delete User */}
                      <button
                        onClick={() => setUserToDelete(user)}
                        className="py-2 px-2 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold flex items-center justify-center gap-1 border border-red-500/40 transition-colors"
                        title={lang === 'bn' ? 'ইউজার আইডি স্থায়ীভাবে মুছে ফেলুন' : 'Delete User'}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        <span>{lang === 'bn' ? 'ডিলিট' : 'Delete'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Tab 3: FX User Cashouts */}
      {activeTab === 'cashouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {lang === 'bn' ? 'এফএক্স হোস্ট ক্যাশআউট রিকোয়েস্ট' : 'FX Host Cashout Requests'}
            </h3>
            <span className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কল রিসিভ করে অর্জিত ক্রেডিট নগদ টাকায় রূপান্তরের আবেদন'
                : 'Payout requests from received call credits'}
            </span>
          </div>

          {cashouts.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              {lang === 'bn' ? 'কোনো ক্যাশআউট রিকোয়েস্ট নেই' : 'No cashout requests yet'}
            </div>
          ) : (
            <div className="space-y-3">
              {cashouts.map((req) => (
                <div
                  key={req.id}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">@{req.username}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          req.status === 'COMPLETED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                      <span className="font-bold text-emerald-400 font-mono">
                        {req.credits} Credits = ₹{req.amountInr}
                      </span>
                      <span>·</span>
                      <span className="font-mono bg-slate-800 px-2 py-0.5 rounded text-emerald-300">
                        UPI: {req.upiId}
                      </span>
                    </div>
                  </div>

                  {req.status === 'PENDING' && (perms.canProcessCashout || isSuperAdmin) && (
                    <button
                      onClick={() => handleApproveCashout(req)}
                      className="py-2 px-5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-lg shadow-purple-600/30 transition-colors"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>{lang === 'bn' ? 'টাকা পাঠিয়ে ক্যাশআউট সম্পন্ন করুন' : 'Mark Disbursed'}</span>
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Super Admin Permanent Read-Only Call Audit View */}
      {activeTab === 'audit' && isSuperAdmin && (
        <div className="space-y-5 animate-in fade-in duration-200">
          {/* Audit Banner */}
          <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {lang === 'bn' ? 'সুপার অ্যাডমিন অডিট কনসোল' : 'Super Admin Call Audit Console'}
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                      PERMANENT · READ-ONLY
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'bn'
                      ? 'সম্পন্ন হওয়া প্রতিটি ভয়েস ও ভিডিয়ো কলের স্থায়ী অপঠনীয় রেকর্ড। টাইমস্ট্যাম্প, কলার ও রিসিভার আইডি এবং সম্পূর্ণ ক্রেডিট কর্তন অপরিবর্তনশীলভাবে সংরক্ষিত।'
                      : 'Immutable, read-only audit trail of all completed calls. Displays exact timestamps, caller/receiver IDs, and financial credit deductions.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="text-xs text-slate-400 block">
                  {lang === 'bn' ? 'অডিট রেকর্ড সংখ্যা:' : 'Total Audit Logs:'}
                </span>
                <span className="text-xl font-mono font-bold text-amber-400">
                  {completedCallLogs.length} Records
                </span>
              </div>
            </div>
          </div>

          {/* Audit Summary Metrics Grid (5 Key Metrics including Quality Rating) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{lang === 'bn' ? 'মোট সম্পন্ন কল' : 'Completed Calls'}</span>
                <Database className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl font-bold text-white font-mono">{completedCallLogs.length}</div>
              <p className="text-[10px] text-emerald-400 mt-0.5">সব সফল কল সেশন</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{lang === 'bn' ? 'মোট অডিট সময়কাল' : 'Audited Talk Time'}</span>
                <Clock className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-xl font-bold text-teal-400 font-mono">
                {totalAuditMinutes}m {totalAuditSeconds % 60}s
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">{totalAuditSeconds} মোট সেকেন্ড</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{lang === 'bn' ? 'মোট ক্রেডিট কর্তন' : 'Credits Deducted'}</span>
                <Coins className="w-4 h-4 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono">{totalAuditCreditsDeducted} cr</div>
              <p className="text-[10px] text-amber-400 mt-0.5">কলার থেকে কর্তিত ক্রেডিট</p>
            </div>

            <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{lang === 'bn' ? 'ইন-কল গিফট ক্রেডিট' : 'Gifts Transferred'}</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-xl font-bold text-purple-400 font-mono">{totalAuditGiftsCredits} cr</div>
              <p className="text-[10px] text-purple-400 mt-0.5">লাইভ উপহার লেনদেন</p>
            </div>

            {/* Quality Rating Metric Card */}
            <div className="bg-slate-900 p-4 rounded-2xl border border-amber-500/30 col-span-2 sm:col-span-1 shadow-sm">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                <span>{lang === 'bn' ? 'গড় কল কোয়ালিটি' : 'Avg Rating'}</span>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <div className="text-xl font-bold text-amber-400 font-mono flex items-center gap-1.5">
                <span>{avgCallRating}</span>
                <span className="text-xs text-amber-300">/ 5.0</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                {ratedCallLogs.length} {lang === 'bn' ? 'টি রেটিং রিভিউ' : 'ratings'}
              </p>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder={
                  lang === 'bn'
                    ? 'কলার ID/নাম, রিসিভার ID/নাম বা Call ID দিয়ে অডিট ফিল্টার করুন...'
                    : 'Search by Caller ID, Receiver ID, Username or Call ID...'
                }
                className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-slate-800 rounded-xl shrink-0 overflow-x-auto">
              <button
                onClick={() => setAuditTypeFilter('ALL')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors ${
                  auditTypeFilter === 'ALL'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'সব কল' : 'All'} ({completedCallLogs.length})
              </button>
              <button
                onClick={() => setAuditTypeFilter('VOICE')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                  auditTypeFilter === 'VOICE'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Phone className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ভয়েস' : 'Voice'}</span>
              </button>
              <button
                onClick={() => setAuditTypeFilter('VIDEO')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                  auditTypeFilter === 'VIDEO'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Video className="w-3 h-3" />
                <span>{lang === 'bn' ? 'ভিডিয়ো' : 'Video'}</span>
              </button>
              <button
                onClick={() => setAuditTypeFilter('RATED')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 ${
                  auditTypeFilter === 'RATED'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{lang === 'bn' ? 'রেটিং প্রাপ্ত' : 'Rated'}</span>
                <span className="text-[10px] font-mono opacity-80">({ratedCallLogs.length})</span>
              </button>
            </div>
          </div>

          {/* Audit Logs Table / Feed */}
          {filteredAuditLogs.length === 0 ? (
            <div className="p-12 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>
                {auditSearch
                  ? lang === 'bn'
                    ? 'এই সার্চ কোয়েরির সাথে কোনো অডিট রেকর্ড মিলছে না'
                    : 'No matching audit records found for search'
                  : lang === 'bn'
                  ? 'এখনো কোনো সম্পন্ন কল অডিট লগ সংরক্ষিত নেই'
                  : 'No completed call logs recorded yet'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredAuditLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-slate-900 p-4 sm:p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all space-y-3 shadow-md"
                >
                  {/* Row Top: Call Ref, Type, Status & Duration */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                        ID: {log.id}
                      </span>

                      <span
                        className={`text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                          log.type === 'VIDEO'
                            ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {log.type === 'VIDEO' ? <Video className="w-3.5 h-3.5" /> : <Phone className="w-3.5 h-3.5" />}
                        <span>{log.type === 'VIDEO' ? 'ভিডিও কল' : 'ভয়েস কল'}</span>
                      </span>

                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                        ✓ {log.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-teal-400" />
                        <span>Duration:</span>
                        <strong className="text-white">
                          {Math.floor(log.durationSeconds / 60)}m {log.durationSeconds % 60}s
                        </strong>
                      </span>
                    </div>
                  </div>

                  {/* Row Middle: Caller ID/Info VS Receiver ID/Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80">
                    {/* Caller Info */}
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>কলার (Caller / Payer):</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-900/40 text-blue-300 font-mono">
                          {log.callerRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span>{log.callerName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">(@{log.callerUsername})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <span>Caller ID:</span>
                        <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.2 rounded">
                          {log.callerId}
                        </code>
                      </div>
                    </div>

                    {/* Receiver Info */}
                    <div className="space-y-1 md:border-l md:border-slate-800 md:pl-3">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>রিসিভার (Receiver / Host):</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-900/40 text-purple-300 font-mono">
                          {log.receiverRole}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-semibold text-white">
                        <span>{log.receiverName}</span>
                        <span className="text-slate-400 font-mono text-[11px]">(@{log.receiverUsername})</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                        <span>Receiver ID:</span>
                        <code className="text-teal-400 bg-slate-900 px-1.5 py-0.2 rounded">
                          {log.receiverId}
                        </code>
                      </div>
                    </div>
                  </div>

                  {/* Row Bottom: Financials & Exact Timestamps */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 text-xs">
                    {/* Timestamps */}
                    <div className="flex flex-wrap items-center gap-3 text-slate-400 font-mono text-[11px]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Started:</span>
                        <span className="text-slate-300">
                          {new Date(log.startedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </span>
                      <span>➔</span>
                      <span className="flex items-center gap-1">
                        <span>Ended:</span>
                        <span className="text-slate-300">
                          {new Date(log.endedAt).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </span>
                      </span>
                    </div>

                    {/* Credit Deductions */}
                    <div className="flex items-center gap-3 font-mono text-right">
                      <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">কলার থেকে কর্তিত:</span>
                        <span className="text-xs font-bold text-rose-400">
                          -{log.creditsCharged} Credits
                        </span>
                      </div>

                      <div className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                        <span className="text-[10px] text-slate-400 block">হোস্ট ওয়ালেটে জমা:</span>
                        <span className="text-xs font-bold text-emerald-400">
                          +{log.creditsCharged} Credits
                        </span>
                      </div>

                      {log.giftsTotalCredits ? (
                        <div className="bg-purple-950/40 px-2.5 py-1 rounded-lg border border-purple-800/60">
                          <span className="text-[10px] text-purple-300 block">উপহার ক্রেডিট:</span>
                          <span className="text-xs font-bold text-purple-300">
                            +{log.giftsTotalCredits} cr
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Quality Rating & Caller Feedback Review */}
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-950/90 border border-slate-800/90 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-slate-400">
                        {lang === 'bn' ? 'কলার রেটিং ও অডিট:' : 'Caller Rating & Quality:'}
                      </span>
                      {log.rating ? (
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= (log.rating || 0)
                                    ? 'fill-amber-400 text-amber-400'
                                    : 'text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs font-mono font-bold text-amber-400">
                            {log.rating}/5
                          </span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 italic">
                          {lang === 'bn' ? 'রেটিং দেওয়া হয়নি' : 'Not rated yet'}
                        </span>
                      )}
                    </div>

                    {log.ratingComment && (
                      <div className="text-[11px] text-slate-300 font-medium bg-slate-900 px-2.5 py-0.5 rounded-lg border border-slate-700/80">
                        "{log.ratingComment}"
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: System Announcements & Broadcast */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shrink-0">
                  <Megaphone className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {lang === 'bn' ? 'সিস্টেম নোটিশ ও গুরুত্বপূর্ণ ঘোষণা সম্প্রচার' : 'System-Wide Announcements & Alerts'}
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                      LIVE BROADCAST
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                    {lang === 'bn'
                      ? 'অ্যাডমিন হিসেবে সকল ইউজারের হোম স্ক্রিনে গুরুত্বপূর্ণ সিস্টেম নোটিশ, বিশেষ অফার, সতর্কতা বা জরুরি বার্তা সম্প্রচার করুন।'
                      : 'Send urgent notifications, platform maintenance alerts, bonus offers, or updates that appear at the top of every user screen.'}
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">
                    {lang === 'bn' ? 'সক্রিয় নোটিশ:' : 'Active Notices:'}
                  </span>
                  <span className="text-xl font-mono font-bold text-emerald-400">
                    {announcements.filter((a) => a.isActive).length} / {announcements.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {annSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-500/50 flex items-center gap-3 text-emerald-300 text-xs font-bold animate-in fade-in duration-200">
              <Check className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{annSuccessMsg}</span>
            </div>
          )}

          {/* Broadcast Composer Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-indigo-400" />
                <h4 className="text-sm font-bold text-white">
                  {lang === 'bn' ? 'নতুন সিস্টেম নোটিশ বা ঘোষণা তৈরি করুন' : 'Compose New Announcement'}
                </h4>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {lang === 'bn' ? 'প্রেরক: @' + currentUser.username : 'Sender: @' + currentUser.username}
              </span>
            </div>

            {/* Quick 1-click Presets */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'দ্রুত প্রিসেট টেমপ্লেট (এক ক্লিকে পূরণ করুন):' : 'Quick Preset Templates:'}</span>
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setAnnTitle('মেগা রিচার্জ বোনাস অফার');
                    setAnnMessage('ইউপিআই রিচার্জে পাচ্ছেন অতিরিক্ত ২৫% বোনাস ক্রেডিট! সীমিত সময়ের জন্য অফার চালু আছে।');
                    setAnnType('OFFER');
                    setAnnPriority('HIGH');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>🎁 রিচার্জ বোনাস অফার</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnnTitle('সিস্টেম রক্ষণাবেক্ষণ নোটিশ');
                    setAnnMessage('আজ রাত ১২টায় প্ল্যাটফর্মের রুটিন রক্ষণাবেক্ষণ কাজ চলবে। সাময়িক সংযোগ বিঘ্ন হতে পারে।');
                    setAnnType('WARNING');
                    setAnnPriority('HIGH');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900 border border-amber-500/40 text-amber-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>⚠️ সিস্টেম রক্ষণাবেক্ষণ</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnnTitle('২৪/৭ অ্যাডমিন সাপোর্ট ও ফ্রি কল');
                    setAnnMessage('ব্যালেন্স ০ হলেও অ্যাডমিনকে ফ্রি ভয়েস ও ভিডিও কল করে যেকোনো রিচার্জ বা টেকনিক্যাল সহায়তা নিন।');
                    setAnnType('INFO');
                    setAnnPriority('NORMAL');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-blue-950/60 hover:bg-blue-900 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>📞 অ্যাডমিন ফ্রি কল সাপোর্ট</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnnTitle('জরুরি নিরাপত্তা ও সতর্কতা');
                    setAnnMessage('সকল ব্যবহারকারীকে অনুরোধ করা হচ্ছে অননুমোদিত অ্যাকাউন্টে কোনো ইউপিআই পেমেন্ট না করতে।');
                    setAnnType('ALERT');
                    setAnnPriority('URGENT');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>🚨 জরুরি সতর্কতা</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSendAnnouncement} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'ঘোষণার শিরোনাম (Announcement Title) *' : 'Title *'}
                </label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  placeholder={lang === 'bn' ? 'যেমন: সিস্টেম নোটিশ ও বিশেষ বোনাস অফার' : 'e.g. Special System Update & Bonus'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'ঘোষণার বিস্তারিত বার্তা (Message Content) *' : 'Message *'}
                </label>
                <textarea
                  rows={3}
                  value={annMessage}
                  onChange={(e) => setAnnMessage(e.target.value)}
                  placeholder={lang === 'bn' ? 'সকল ইউজারের উদ্দেশ্যে আপনার বার্তা লিখুন...' : 'Write message to all users...'}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
                  required
                />
              </div>

              {/* Type and Priority Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    {lang === 'bn' ? 'নোটিশের ধরন (Announcement Type)' : 'Category / Type'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setAnnType('INFO')}
                      className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        annType === 'INFO'
                          ? 'bg-blue-600/30 border-blue-400 text-blue-200 ring-2 ring-blue-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Info className="w-3.5 h-3.5 text-blue-400" />
                      <span>{lang === 'bn' ? 'তথ্য (INFO)' : 'INFO'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnType('OFFER')}
                      className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        annType === 'OFFER'
                          ? 'bg-emerald-600/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{lang === 'bn' ? 'অফার (OFFER)' : 'OFFER'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnType('WARNING')}
                      className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        annType === 'WARNING'
                          ? 'bg-amber-600/30 border-amber-400 text-amber-200 ring-2 ring-amber-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                      <span>{lang === 'bn' ? 'সতর্কতা (WARN)' : 'WARNING'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnType('ALERT')}
                      className={`p-2.5 rounded-xl text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        annType === 'ALERT'
                          ? 'bg-red-600/30 border-red-400 text-red-200 ring-2 ring-red-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>{lang === 'bn' ? 'জরুরি (ALERT)' : 'ALERT'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1.5">
                    {lang === 'bn' ? 'অগ্রাধিকার স্তর (Priority Level)' : 'Priority'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAnnPriority('NORMAL')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        annPriority === 'NORMAL'
                          ? 'bg-slate-700 border-slate-400 text-white ring-1 ring-slate-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {lang === 'bn' ? 'সাধারণ' : 'Normal'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnPriority('HIGH')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        annPriority === 'HIGH'
                          ? 'bg-amber-600 border-amber-400 text-white ring-2 ring-amber-500/30'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {lang === 'bn' ? 'উচ্চ' : 'High'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAnnPriority('URGENT')}
                      className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                        annPriority === 'URGENT'
                          ? 'bg-red-600 border-red-400 text-white ring-2 ring-red-500/40 animate-pulse'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {lang === 'bn' ? 'জরুরি' : 'Urgent'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              {(annTitle || annMessage) && (
                <div className="pt-2">
                  <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                    {lang === 'bn' ? 'লাইভ প্রিভিউ (ইউজাররা যেভাবে দেখতে পাবে):' : 'Live User Screen Preview:'}
                  </span>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-2.5">
                    <Megaphone className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                          {annType} · {annPriority}
                        </span>
                        <span className="text-xs font-bold text-white truncate">
                          {annTitle || 'শিরোনাম'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {annMessage || 'বার্তা বিবরণ'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Broadcast Action Button */}
              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 active:scale-[0.99] transition-all"
              >
                <Megaphone className="w-5 h-5 text-white" />
                <span>{lang === 'bn' ? '📢 সকল ইউজারের কাছে জরুরি নোটিশ সম্প্রচার করুন' : 'Broadcast Announcement to All Users'}</span>
              </button>
            </form>
          </div>

          {/* List of Sent Announcements */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Radio className="w-4 h-4 text-indigo-400" />
                <span>{lang === 'bn' ? 'পূর্বে পাঠানো ঘোষণাসমূহ' : 'Broadcasted Announcements History'}</span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {announcements.length} {lang === 'bn' ? 'মোট নোটিশ' : 'Total'}
              </span>
            </div>

            {announcements.length === 0 ? (
              <div className="p-8 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
                {lang === 'bn' ? 'এখনো কোনো ঘোষণা পাঠানো হয়নি' : 'No announcements sent yet'}
              </div>
            ) : (
              <div className="space-y-3">
                {announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      ann.isActive
                        ? 'bg-slate-900 border-indigo-500/30 hover:border-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              ann.type === 'ALERT'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                : ann.type === 'OFFER'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : ann.type === 'WARNING'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            }`}
                          >
                            {ann.type}
                          </span>

                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              ann.priority === 'URGENT'
                                ? 'bg-red-600 text-white'
                                : ann.priority === 'HIGH'
                                ? 'bg-amber-600 text-white'
                                : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {ann.priority}
                          </span>

                          {ann.isActive ? (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              <span>{lang === 'bn' ? 'সক্রিয় (Live)' : 'Active (Live)'}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-bold">
                              {lang === 'bn' ? 'স্থগিত (Paused)' : 'Inactive'}
                            </span>
                          )}

                          <span className="text-xs text-slate-400 font-mono">
                            @{ann.senderUsername}
                          </span>

                          <span className="text-xs text-slate-500">·</span>

                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(ann.createdAt).toLocaleString()}
                          </span>
                        </div>

                        <h5 className="font-bold text-white text-sm">
                          {ann.title}
                        </h5>

                        <p className="text-xs text-slate-300 leading-relaxed">
                          {ann.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0">
                        {/* Toggle active button */}
                        <button
                          onClick={() => handleToggleAnnouncement(ann.id)}
                          className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            ann.isActive
                              ? 'bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-300 border border-emerald-500/40'
                          }`}
                        >
                          {ann.isActive
                            ? lang === 'bn' ? 'স্থগিত করুন' : 'Pause'
                            : lang === 'bn' ? 'পুনরায় সক্রিয় করুন' : 'Activate'}
                        </button>

                        {/* Delete announcement button */}
                        <button
                          onClick={() => handleDeleteAnnouncement(ann.id)}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-900/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 transition-colors"
                          title={lang === 'bn' ? 'মুছে ফেলুন' : 'Delete'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal 1: Create User (FXUser or MXUser) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <span>{lang === 'bn' ? 'নতুন ইউজার তৈরি করুন' : 'Create New User'}</span>
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {formError && (
              <p className="text-xs text-rose-400 bg-rose-950/60 p-2.5 rounded-xl border border-rose-800">
                {formError}
              </p>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'ইউজারের ভূমিকা (Role)' : 'Role'}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewRole('FX_USER')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      newRole === 'FX_USER'
                        ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    FXUser (কল রিসিভার)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewRole('MX_USER')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                      newRole === 'MX_USER'
                        ? 'bg-blue-950/80 border-blue-500 text-blue-200'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    MXUser (কলার)
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'ইউজারনেম (Username)' : 'Username'} *
                </label>
                <input
                  type="text"
                  placeholder={
                    newRole === 'MX_USER'
                      ? 'আলফা-নিউমেরিক ৪-৮ অক্ষর (যেমন: joy99)'
                      : 'e.g. tina_fx'
                  }
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'সম্পূর্ণ নাম (Full Name)' : 'Full Name'}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Tina Roy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'} *
                </label>
                <input
                  type="password"
                  placeholder="অন্তত ৪ অক্ষর"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              {newRole === 'FX_USER' && (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Voice Rate (cr/min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newVoiceRate}
                      onChange={(e) => setNewVoiceRate(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Video Rate (cr/min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={newVideoRate}
                      onChange={(e) => setNewVideoRate(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  {lang === 'bn' ? 'তৈরি করুন' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Adjust User Credits */}
      {creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{lang === 'bn' ? 'ইউজার ক্রেডিট পরিবর্তন' : 'Adjust Credits'}</span>
              </h3>
              <button
                onClick={() => setCreditModalUser(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 bg-slate-800/80 p-3 rounded-xl border border-slate-700">
              ইউজার: <span className="font-bold text-white">@{creditModalUser.username}</span> ({creditModalUser.name})<br />
              বর্তমান ব্যালেন্স: <span className="font-mono font-bold text-amber-400">{creditModalUser.credits}</span> Credits
            </p>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'ক্রেডিট পরিমাণ' : 'Credit Amount'}
              </label>
              <input
                type="number"
                min="10"
                step="10"
                value={creditAmount}
                onChange={(e) => setCreditAmount(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                onClick={() => handleAdjustCredits(creditAmount)}
                className="py-3 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/30"
              >
                <Plus className="w-4 h-4" />
                <span>+ ক্রেডিট যোগ করুন</span>
              </button>
              <button
                onClick={() => handleAdjustCredits(-creditAmount)}
                className="py-3 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md shadow-rose-600/30"
              >
                <Minus className="w-4 h-4" />
                <span>- ক্রেডিট কর্তন করুন</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Selector for Credit Adjustment */}
      {showCreditManageModal && !creditModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-400" />
                <span>{lang === 'bn' ? 'ইউজার বেছে নিন ক্রেডিট পরিবর্তনের জন্য' : 'Select User to Adjust Credits'}</span>
              </h3>
              <button
                onClick={() => setShowCreditManageModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {managedUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setCreditModalUser(u);
                    setShowCreditManageModal(false);
                  }}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400">{u.credits} cr</span>
                    <span className="py-1 px-2.5 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold">
                      পরিবর্তন করুন
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Selector for Photo Management */}
      {showPhotoSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-cyan-400" />
                <span>{lang === 'bn' ? 'ইউজার বেছে নিন ছবি পরিচালনার জন্য' : 'Select User for Photo Management'}</span>
              </h3>
              <button
                onClick={() => setShowPhotoSelectModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {managedUsers.map((u) => (
                <div
                  key={u.id}
                  onClick={() => {
                    setSelectedUserForGallery(u);
                    setShowPhotoSelectModal(false);
                  }}
                  className="p-3 bg-slate-800/80 hover:bg-slate-700/80 rounded-2xl border border-slate-700 cursor-pointer flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </div>
                  </div>
                  <span className="py-1 px-2.5 rounded-lg bg-cyan-500/20 text-cyan-300 text-xs font-bold">
                    গ্যালারি ({u.gallery.length}/10)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Selector for Suspend / Activate */}
      {showSuspendSelectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-rose-400" />
                <span>{lang === 'bn' ? 'সাসপেন্ড ও আনলক নিয়ন্ত্রণ' : 'Suspend / Activate Control'}</span>
              </h3>
              <button
                onClick={() => setShowSuspendSelectModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {managedUsers.map((u) => (
                <div
                  key={u.id}
                  className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-9 h-9 rounded-full object-cover" />
                    <div>
                      <h4 className="font-bold text-white text-xs">{u.name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">@{u.username}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSuspend(u)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold flex items-center gap-1 ${
                      u.isSuspended
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-rose-900 hover:bg-rose-800 text-rose-200'
                    }`}
                  >
                    {u.isSuspended ? (
                      <>
                        <Unlock className="w-3.5 h-3.5" />
                        <span>সক্রিয় করুন</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>সাসপেন্ড</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Gallery Manager for selected user */}
      {selectedUserForGallery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  <span>@{selectedUserForGallery.username} - এর গ্যালারি পরিচালনা</span>
                </h3>
                <p className="text-xs text-slate-400">
                  {lang === 'bn' ? 'অ্যাডমিন ক্ষমতা ব্যবহার করে ছবি যোগ বা মুছুন' : 'Admin photo management'}
                </p>
              </div>
              <button
                onClick={() => setSelectedUserForGallery(null)}
                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-xl"
              >
                ✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
              </button>
            </div>

            <GalleryManager
              targetUser={selectedUserForGallery}
              onUpdate={(updated) => {
                setSelectedUserForGallery(updated);
                onRefresh();
              }}
              canEdit={true}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* Modal 7: Edit User ID Details Modal (Name, Password, Role, Balance, Rates, Bio, Statuses) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{lang === 'bn' ? 'ইউজার আইডি এডিট করুন' : 'Edit User Account'}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-blue-400 font-mono font-bold">
                      @{editingUser.username}
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono">ID: {editingUser.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'সম্পূর্ণ নাম (Name)' : 'Full Name'} *
                  </label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'} *
                  </label>
                  <input
                    type="text"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'ভূমিকা (User Role)' : 'Role'}
                  </label>
                  <select
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value as 'FX_USER' | 'MX_USER')}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="FX_USER">FX Host (কল গ্রহণকারী)</option>
                    <option value="MX_USER">MX Caller (কল প্রদানকারী)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'ওয়ালেট ক্রেডিট / ব্যালেন্স' : 'Wallet Balance'} (Credits)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCredits}
                    onChange={(e) => setEditCredits(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-amber-400 font-mono font-bold focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {editRole === 'FX_USER' && (
                <div className="grid grid-cols-2 gap-3 p-3 bg-slate-800/60 rounded-2xl border border-slate-700">
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Voice Rate (cr/min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editVoiceRate}
                      onChange={(e) => setEditVoiceRate(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-emerald-400 font-mono font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400 block mb-1">
                      Video Rate (cr/min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={editVideoRate}
                      onChange={(e) => setEditVideoRate(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-teal-400 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'বায়ো / পরিচিতি (Bio)' : 'Bio'}
                </label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="ব্যবহারকারীর পরিচিতি..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Status Toggles Directly Inside Edit Modal */}
              <div className="p-3 bg-slate-800/80 rounded-2xl border border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  {lang === 'bn' ? 'ইউজার স্ট্যাটাস পরিবর্তন:' : 'User Status Controls:'}
                </span>

                <div className="grid grid-cols-3 gap-2">
                  {/* Toggle 1: POS / Pause */}
                  <button
                    type="button"
                    onClick={() => setEditIsPaused(!editIsPaused)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      editIsPaused
                        ? 'bg-amber-600 border-amber-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Pause className="w-3.5 h-3.5" />
                    <span>{editIsPaused ? 'পজড (POS)' : 'স্বাভাবিক'}</span>
                  </button>

                  {/* Toggle 2: Live */}
                  <button
                    type="button"
                    onClick={() => setEditIsLive(!editIsLive)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      editIsLive
                        ? 'bg-emerald-600 border-emerald-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Radio className="w-3.5 h-3.5" />
                    <span>{editIsLive ? '🔴 Live' : '⚪ অফলাইন'}</span>
                  </button>

                  {/* Toggle 3: Suspension */}
                  <button
                    type="button"
                    onClick={() => setEditIsSuspended(!editIsSuspended)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border flex items-center justify-center gap-1 transition-all ${
                      editIsSuspended
                        ? 'bg-rose-600 border-rose-400 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{editIsSuspended ? '⛔ সাসপেন্ড' : 'সক্রিয়'}</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = editingUser;
                    setEditingUser(null);
                    setUserToDelete(target);
                  }}
                  className="py-2.5 px-3 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 border border-red-500/40 text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  <span>{lang === 'bn' ? 'ইউজার মুছুন' : 'Delete User'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                  >
                    {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 8: Delete User Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-red-600/60 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">
                  {lang === 'bn' ? 'ইউজার আইডি ডিলিট নিশ্চিতকরণ' : 'Confirm User Deletion'}
                </h3>
                <p className="text-xs text-red-400 font-semibold">
                  {lang === 'bn' ? 'এই কাজটি অপরিবর্তনীয়!' : 'This action cannot be undone!'}
                </p>
              </div>
            </div>

            {/* Target User Details */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="flex items-center gap-3">
                <img
                  src={userToDelete.avatar}
                  alt={userToDelete.name}
                  className="w-11 h-11 rounded-2xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="font-bold text-white text-sm">{userToDelete.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">@{userToDelete.username}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono">
                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold">
                  {userToDelete.role === 'FX_USER' ? 'FX Host' : 'MX Caller'}
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 text-amber-300 font-bold border border-amber-500/30">
                  {userToDelete.credits} Credits
                </span>
                <span className="text-[11px] text-slate-500">ID: {userToDelete.id}</span>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-red-950/30 border border-red-800/40 p-3 rounded-xl">
              {lang === 'bn'
                ? 'এডমিন হিসেবে আপনি এই ইউজার আইডি স্থায়ীভাবে মুছে ফেলতে যাচ্ছেন। মুছে ফেলার পর এই ইউজারের একাউন্ট, ব্যালেন্স ও ডেটা আর ফিরিয়ে আনা সম্ভব হবে না।'
                : 'As Admin, you are about to permanently delete this user account. All balance and records will be purged.'}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
              >
                {lang === 'bn' ? 'বাতিল করুন' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete.id)}
                className="py-2.5 px-5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-lg shadow-red-600/40 flex items-center gap-2 transition-all active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>{lang === 'bn' ? 'হ্যাঁ, স্থায়ীভাবে ডিলিট করুন' : 'Yes, Delete Permanently'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 9: Sign-up Bonus Offer Control & Settings Modal */}
      {showBonusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-slate-900 border border-pink-500/40 rounded-3xl p-6 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
                  <Gift className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {lang === 'bn' ? 'সাইন আপ বোনাস অফার কন্ট্রোল' : 'Sign-up Bonus Offer Control'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {lang === 'bn' ? 'নতুন ইউজারদের ফ্রি ক্রেডিট অফার ব্যবস্থাপনা' : 'Configure new registration bonus'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowBonusModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Toggle Switch Button */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">
                  {lang === 'bn' ? 'অফার স্ট্যাটাস (বর্তমান অবস্থা):' : 'Offer Status:'}
                </span>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold border ${
                    bonusOffer.isEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  }`}
                >
                  {bonusOffer.isEnabled ? 'ON (সক্রিয়)' : 'OFF (বন্ধ)'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => handleToggleSignupBonus()}
                className={`w-full py-3 rounded-xl text-xs font-black flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] ${
                  bonusOffer.isEnabled
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <Power className="w-4 h-4" />
                <span>
                  {bonusOffer.isEnabled
                    ? (lang === 'bn' ? '⛔ অফার বন্ধ করুন (নতুন ইউজার ০ ক্রেডিট পাবে)' : 'Turn OFF Offer (New users get 0 cr)')
                    : (lang === 'bn' ? `✨ অফার চালু করুন (+${bonusAmountInput} ক্রেডিট প্রদান)` : `Turn ON Offer (+${bonusAmountInput} cr)`)}
                </span>
              </button>
            </div>

            {/* Settings Form */}
            <form onSubmit={handleSaveSignupBonusSettings} className="space-y-3.5">
              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'সাইন আপ বোনাস ক্রেডিট পরিমাণ' : 'Bonus Credits Amount'}
                </label>
                <input
                  type="number"
                  min="0"
                  step="5"
                  value={bonusAmountInput}
                  onChange={(e) => setBonusAmountInput(Math.max(0, Number(e.target.value)))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-amber-400 font-mono font-bold focus:outline-none focus:border-pink-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'অফারের নাম / শিরোনাম' : 'Offer Title'}
                </label>
                <input
                  type="text"
                  value={bonusTitleInput}
                  onChange={(e) => setBonusTitleInput(e.target.value)}
                  placeholder="যেমন: অ্যাডমিন স্পেশাল সাইন আপ বোনাস"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="p-3 bg-pink-950/20 border border-pink-500/30 rounded-xl text-[11px] text-pink-200 leading-relaxed">
                {lang === 'bn'
                  ? '💡 নিয়ম: অফার বন্ধ থাকলে কোনো ইউজার সাইন আপ করলে কোনো বোনাস পাবে না (ব্যালেন্স ০ থাকবে)। অ্যাডমিন এখানে অফার চালু করলেই কেবল নতুন অ্যাকাউন্ট খোলার পর উক্ত বোনাস ক্রেডিট যুক্ত হবে।'
                  : 'Rule: When disabled, new users receive 0 credits upon registration. When enabled, new users receive the configured bonus.'}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBonusModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  {lang === 'bn' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white text-xs font-bold shadow-lg shadow-pink-600/30 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{lang === 'bn' ? 'সেটিংস সংরক্ষণ করুন' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
