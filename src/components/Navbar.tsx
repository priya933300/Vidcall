import React from 'react';
import {
  MessageSquare,
  Phone,
  Users,
  Wallet,
  Settings,
  Shield,
  Coins,
  Globe,
  PlusCircle,
  LogIn,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  activeTab: 'chats' | 'calls' | 'hosts' | 'wallet' | 'admin' | 'superadmin';
  setActiveTab: (tab: 'chats' | 'calls' | 'hosts' | 'wallet' | 'admin' | 'superadmin') => void;
  onOpenRecharge: () => void;
  onOpenSettings: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  lang: 'bn' | 'en';
  onToggleLang: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenRecharge,
  onOpenSettings,
  onOpenAuth,
  onLogout,
  lang,
  onToggleLang,
}) => {
  const isSuperAdmin = currentUser?.role === 'SUPER_ADMIN';
  const isAdmin = currentUser?.role === 'ADMIN';
  const isMXUser = currentUser?.role === 'MX_USER';
  const isFXUser = currentUser?.role === 'FX_USER';

  // Role-based theme classes
  const headerBgClass = isMXUser
    ? 'bg-[#0a0a0d] border-b border-amber-500/30 shadow-lg shadow-black/80'
    : isFXUser
    ? 'bg-[#0f0913] border-b border-pink-500/30 shadow-lg shadow-black/80'
    : 'bg-[#111B21] border-b border-[#222E35] shadow-md';

  const activeTabClass = isMXUser
    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/10'
    : isFXUser
    ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40 shadow-sm shadow-pink-500/10'
    : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30';

  const mobileTabActiveClass = isMXUser
    ? 'text-amber-400 font-bold'
    : isFXUser
    ? 'text-pink-400 font-bold'
    : 'text-emerald-400 font-bold';

  return (
    <header className={`sticky top-0 z-40 select-none transition-colors duration-300 ${headerBgClass}`}>
      {/* 3-Zone Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-3">
        {/* Zone 1: SX-VIDcall Brand Wordmark (Red, Green & Yellow Bold Combination) */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 via-emerald-500 to-amber-400 p-[2px] shadow-lg shadow-red-600/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-xs tracking-tighter bg-gradient-to-r from-red-500 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                SX
              </span>
            </div>
          </div>

          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('hosts');
            }}
            className="group flex flex-col justify-center"
            title="SX-VIDcall"
          >
            <div className="flex items-center tracking-tight leading-none">
              {/* SX in bold red */}
              <span className="text-xl sm:text-2xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                SX
              </span>
              {/* hyphen in vibrant yellow */}
              <span className="text-xl sm:text-2xl font-black text-amber-400 mx-0.5">
                -
              </span>
              {/* VID in emerald green */}
              <span className="text-xl sm:text-2xl font-black text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">
                VID
              </span>
              {/* call in bright golden yellow */}
              <span className="text-xl sm:text-2xl font-black text-yellow-400">
                call
              </span>
            </div>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase -mt-0.5 flex items-center gap-1">
              {isMXUser ? (
                <span className="text-amber-400 font-mono">👑 Gold Edition</span>
              ) : isFXUser ? (
                <span className="text-pink-400 font-mono">🌸 Host Studio</span>
              ) : (
                <span className="text-emerald-400">Live Calling</span>
              )}
            </span>
          </a>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('hosts')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'hosts' ? activeTabClass : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>{lang === 'bn' ? 'এফএক্স হোস্ট' : 'FX Hosts'}</span>
          </button>

          <button
            onClick={() => setActiveTab('chats')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'chats' ? activeTabClass : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{lang === 'bn' ? 'চ্যাট' : 'Chats'}</span>
          </button>

          <button
            onClick={() => setActiveTab('calls')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'calls' ? activeTabClass : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>{lang === 'bn' ? 'কল হিস্ট্রি' : 'Call History'}</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'wallet' ? activeTabClass : 'text-slate-400 hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>{lang === 'bn' ? 'ওয়ালেট ও রিচার্জ' : 'Wallet & Top-up'}</span>
          </button>

          {/* Admin panel tab if Admin or Super Admin */}
          {(isAdmin || isSuperAdmin) && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অ্যাডমিন প্যানেল' : 'Admin Panel'}</span>
            </button>
          )}

          {/* Super Admin panel tab */}
          {isSuperAdmin && (
            <button
              onClick={() => setActiveTab('superadmin')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                activeTab === 'superadmin'
                  ? 'bg-purple-900/30 text-purple-300 border border-purple-500/40'
                  : 'text-purple-300/70 hover:text-purple-200'
              }`}
            >
              👑 <span>{lang === 'bn' ? 'সুপার অ্যাডমিন' : 'Super Admin'}</span>
            </button>
          )}
        </nav>

        {/* Zone 3: Actions & Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1 transition-colors whitespace-nowrap border border-slate-700"
            title="Toggle Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>{lang === 'bn' ? 'বাং' : 'EN'}</span>
          </button>

          {/* Wallet / Recharge CTA */}
          {currentUser && (
            <button
              onClick={onOpenRecharge}
              className={`px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-sm whitespace-nowrap transition-all ${
                isMXUser
                  ? 'bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black shadow-amber-500/20'
                  : isFXUser
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 shadow-pink-500/20'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-600/20'
              }`}
            >
              <Coins className={`w-3.5 h-3.5 ${isMXUser ? 'text-slate-950' : 'text-amber-300'}`} />
              <span className="font-mono">{currentUser.credits}</span>
              <span className="hidden lg:inline text-[11px] font-normal opacity-90">
                {lang === 'bn' ? 'রিচার্জ' : 'Top-up'}
              </span>
            </button>
          )}

          {/* User Profile Avatar / Settings */}
          {currentUser && (
            <button
              onClick={onOpenSettings}
              className={`flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full border text-xs text-white transition-colors ${
                isMXUser
                  ? 'bg-[#151518] hover:bg-[#1f1f23] border-amber-500/40'
                  : isFXUser
                  ? 'bg-[#17101b] hover:bg-[#221727] border-pink-500/40'
                  : 'bg-[#202C33] hover:bg-[#2A3942] border-[#2A3942]'
              }`}
              title={lang === 'bn' ? 'প্রোফাইল ও সেটিংস' : 'Profile & Settings'}
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className={`w-7 h-7 rounded-full object-cover border ${
                  isMXUser ? 'border-amber-400' : isFXUser ? 'border-pink-400' : 'border-emerald-500'
                }`}
              />
              <span className="hidden sm:inline font-semibold max-w-[80px] truncate">
                {currentUser.name}
              </span>
              <Settings className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}

          {/* LARGE RED PROMINENT LOGOUT BUTTON FOR ALL USERS */}
          {currentUser ? (
            <button
              onClick={onLogout}
              className="py-2 px-3 sm:py-2 sm:px-4 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-black text-xs sm:text-sm flex items-center gap-1.5 sm:gap-2 shadow-lg shadow-red-600/40 border border-red-500 whitespace-nowrap transition-all"
              title={lang === 'bn' ? 'সকল ইউজারদের জন্য বড় ও লাল লগআউট বটন' : 'Log Out'}
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-white stroke-[2.5]" />
              <span className="tracking-wide font-extrabold">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 whitespace-nowrap shadow-sm"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{lang === 'bn' ? 'লগইন' : 'Login'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (Ergonomic Thumb-Zone Navigation) */}
      <div className={`md:hidden flex items-center justify-around h-14 border-t px-2 ${
        isMXUser
          ? 'bg-[#0a0a0d] border-amber-500/20'
          : isFXUser
          ? 'bg-[#0f0913] border-pink-500/20'
          : 'bg-[#111B21] border-[#222E35]'
      }`}>
        <button
          onClick={() => setActiveTab('hosts')}
          className={`flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-medium transition-colors ${
            activeTab === 'hosts' ? mobileTabActiveClass : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5 mb-0.5" />
          <span>{lang === 'bn' ? 'হোস্ট' : 'Hosts'}</span>
        </button>

        <button
          onClick={() => setActiveTab('chats')}
          className={`flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-medium transition-colors ${
            activeTab === 'chats' ? mobileTabActiveClass : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>{lang === 'bn' ? 'চ্যাট' : 'Chats'}</span>
        </button>

        <button
          onClick={() => setActiveTab('calls')}
          className={`flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-medium transition-colors ${
            activeTab === 'calls' ? mobileTabActiveClass : 'text-slate-400'
          }`}
        >
          <Phone className="w-5 h-5 mb-0.5" />
          <span>{lang === 'bn' ? 'কল' : 'Calls'}</span>
        </button>

        <button
          onClick={() => setActiveTab('wallet')}
          className={`flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-medium transition-colors ${
            activeTab === 'wallet' ? mobileTabActiveClass : 'text-slate-400'
          }`}
        >
          <Wallet className="w-5 h-5 mb-0.5" />
          <span>{lang === 'bn' ? 'ওয়ালেট' : 'Wallet'}</span>
        </button>

        {(isAdmin || isSuperAdmin) && (
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-medium transition-colors ${
              activeTab === 'admin' ? 'text-emerald-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Shield className="w-5 h-5 mb-0.5" />
            <span>Admin</span>
          </button>
        )}

        {/* Mobile Red Logout Button */}
        {currentUser && (
          <button
            onClick={onLogout}
            className="flex flex-col items-center justify-center min-w-[40px] min-h-[44px] text-[10px] font-extrabold text-red-500 hover:text-red-400 transition-colors"
            title="Logout"
          >
            <LogOut className="w-5 h-5 mb-0.5 text-red-500 stroke-[2.5]" />
            <span className="text-[10px] text-red-400 font-black">{lang === 'bn' ? 'লগআউট' : 'Logout'}</span>
          </button>
        )}
      </div>
    </header>
  );
};
