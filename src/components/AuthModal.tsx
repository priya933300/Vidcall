import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { storage } from '../utils/storage';
import { generateSvgAvatar } from '../utils/avatars';
import { LogIn, UserPlus, Shield, Sparkles, Check, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  onSuccess: (user: User) => void;
  onClose?: () => void;
  lang: 'bn' | 'en';
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess, onClose, lang }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER_MX'>('LOGIN');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const users = storage.getUsers();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.trim().toLowerCase();
    const matched = users.find(
      (u) => u.username.toLowerCase() === uname && u.password === password
    );

    if (!matched) {
      setErrorMsg(
        lang === 'bn'
          ? 'ভুল ইউজারনেম বা পাসওয়ার্ড!'
          : 'Invalid username or password!'
      );
      return;
    }

    if (matched.isSuspended) {
      setErrorMsg(
        lang === 'bn'
          ? 'আপনার অ্যাকাউন্টটি সাসপেন্ড করা হয়েছে। অ্যাডমিনের সাথে যোগাযোগ করুন।'
          : 'Your account is suspended. Contact admin.'
      );
      return;
    }

    if (matched.isPaused) {
      setErrorMsg(
        lang === 'bn'
          ? 'আপনার অ্যাকাউন্টটি অ্যাডমিন দ্বারা সাময়িকভাবে পজ (POS) করে রাখা হয়েছে।'
          : 'Your account has been temporarily paused by admin.'
      );
      return;
    }

    storage.setCurrentUser(matched.id);
    onSuccess(matched);
  };

  const bonusOffer = storage.getSignupBonusOffer();

  const handleRegisterMX = (e: React.FormEvent) => {
    e.preventDefault();
    const uname = username.trim().toLowerCase();

    // Prompt rule: "একটা আলফা নিউমেরিক নূন্যতম ৪ অক্ষর থেকে ৮ অক্ষরের ইউজার নাম ও একটা পাসওয়ার্ড ব্যবহার করে করতে পারবে"
    const regex = /^[a-zA-Z0-9]{4,8}$/;
    if (!regex.test(uname)) {
      setErrorMsg(
        lang === 'bn'
          ? 'ইউজারনেম অবশ্যই আলফা-নিউমেরিক (অক্ষর ও সংখ্যা) এবং ৪ থেকে ৮ অক্ষরের হতে হবে!'
          : 'Username must be alphanumeric and between 4 to 8 characters long!'
      );
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === uname)) {
      setErrorMsg(
        lang === 'bn'
          ? 'এই ইউজারনেমটি আগে থেকেই রয়েছে। অনুগ্রহ করে অন্য নাম দিন।'
          : 'This username is already taken. Please choose another.'
      );
      return;
    }

    if (!password || password.length < 4) {
      setErrorMsg(
        lang === 'bn'
          ? 'পাসওয়ার্ড নূন্যতম ৪ অক্ষরের হতে হবে।'
          : 'Password must be at least 4 characters.'
      );
      return;
    }

    // Prompt rule: কোনো ইউজার ই sine up বোনাস পাবে না যতক্ষন না admin অফার দিচ্ছে
    const startingCredits = bonusOffer.isEnabled ? Math.max(0, bonusOffer.bonusCredits) : 0;

    const newUser: User = {
      id: `usr_mx_${Date.now()}`,
      username: uname,
      name: fullName.trim() || uname,
      role: 'MX_USER',
      password: password,
      credits: startingCredits,
      avatar: generateSvgAvatar(fullName || uname, 'MX_USER', users.length),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      isPaused: false,
      voiceRate: 0,
      videoRate: 0,
      createdAt: new Date().toISOString(),
      bio: 'সদস্য কলার',
    };

    const updatedUsers = [...users, newUser];
    storage.saveUsers(updatedUsers);
    storage.setCurrentUser(newUser.id);
    onSuccess(newUser);
  };

  const quickLoginAs = (uname: string) => {
    const matched = users.find((u) => u.username === uname);
    if (matched) {
      storage.setCurrentUser(matched.id);
      onSuccess(matched);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header: SX-VIDcall Branding */}
        <div className="text-center space-y-1.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 via-emerald-500 to-amber-400 p-[2px] mx-auto mb-2 shadow-lg shadow-red-600/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <span className="font-black text-sm tracking-tighter bg-gradient-to-r from-red-500 via-emerald-400 to-amber-300 bg-clip-text text-transparent">
                SX
              </span>
            </div>
          </div>
          <h2 className="text-2xl font-black tracking-tight flex items-center justify-center">
            <span className="text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]">SX</span>
            <span className="text-amber-400 mx-0.5">-</span>
            <span className="text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]">VID</span>
            <span className="text-yellow-400">call</span>
          </h2>
          <p className="text-xs text-slate-400">
            {lang === 'bn' ? 'প্রিমিয়াম লাইভ ভয়েস ও ভিডিও কল প্ল্যাটফর্ম' : 'Live Voice & Video Calling Platform'}
          </p>
        </div>

        {/* Tab switcher: Login vs Online Register MX */}
        <div className="grid grid-cols-2 p-1 bg-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'LOGIN' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'লগইন (সকল ইউজার)' : 'Login (All Roles)'}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER_MX');
              setErrorMsg('');
            }}
            className={`py-2 text-xs font-semibold rounded-xl transition-all ${
              mode === 'REGISTER_MX'
                ? 'bg-emerald-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'অনলাইন MX রেজিস্ট্রেশন' : 'Register MX User'}
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-2xl flex items-center gap-2 text-xs text-rose-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {mode === 'LOGIN' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'ইউজারনেম' : 'Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={lang === 'bn' ? 'আপনার ইউজারনেম লিখুন...' : 'Enter your username...'}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{lang === 'bn' ? 'লগইন করুন' : 'Log In'}</span>
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterMX} className="space-y-3.5">
            {bonusOffer.isEnabled ? (
              <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-slate-900 border border-emerald-500/50 p-3 rounded-2xl flex items-center justify-between gap-2 shadow-lg">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 uppercase">
                        {lang === 'bn' ? 'অ্যাডমিন অফার সক্রিয়' : 'Admin Bonus Active'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white mt-0.5">
                      {bonusOffer.title || (lang === 'bn' ? 'সাইন আপ বোনাস' : 'Signup Bonus')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">{lang === 'bn' ? 'ফ্রি ক্রেডিট:' : 'Free:'}</span>
                  <span className="font-mono font-extrabold text-amber-400 text-sm">+{bonusOffer.bonusCredits} cr</span>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/80 border border-slate-800 p-2.5 rounded-2xl flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-slate-500" />
                  <span>{lang === 'bn' ? 'সাইন আপ ব্যালেন্স:' : 'Starting Balance:'}</span>
                </span>
                <span className="font-mono font-bold text-slate-300">
                  {lang === 'bn' ? '০ ক্রেডিট (কোনো অফার নেই)' : '0 Credits (No Bonus Offer)'}
                </span>
              </div>
            )}

            <div className="bg-emerald-950/30 border border-emerald-800/40 p-2.5 rounded-xl text-[11px] text-slate-300">
              {lang === 'bn'
                ? 'অনলাইন সরাসরি রেজিস্ট্রেশন: শুধুমাত্র একটি ৪-৮ অক্ষরের আলফা-নিউমেরিক নাম ও পাসওয়ার্ড দিয়ে অ্যাকাউন্ট খুলুন।'
                : 'Direct online signup: Just an alphanumeric username (4-8 chars) and password.'}
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'ইউজারনেম (৪-৮ অক্ষর, অক্ষর ও সংখ্যা)' : 'Username (4-8 alphanumeric)'} *
              </label>
              <input
                type="text"
                maxLength={8}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="যেমন: joy123 / raj99"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'নাম (ঐচ্ছিক)' : 'Full Name (Optional)'}
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Joy Roy"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1">
                {lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'} *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="নূন্যতম ৪ অক্ষর"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Account'}</span>
            </button>
          </form>
        )}

        {onClose && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 hover:text-white transition-colors"
            >
              {lang === 'bn' ? 'ফিরে যান' : 'Back'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
