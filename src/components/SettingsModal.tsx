import React, { useState } from 'react';
import {
  X,
  Key,
  DollarSign,
  Phone,
  Video,
  Check,
  AlertCircle,
  Coins,
  ArrowUpRight,
  ShieldCheck,
  User as UserIcon,
  LogOut,
} from 'lucide-react';
import { User, CashoutRequest } from '../types';
import { storage } from '../utils/storage';
import { GalleryManager } from './GalleryManager';

interface SettingsModalProps {
  currentUser: User;
  onClose: () => void;
  onUpdateUser: (user: User) => void;
  onLogout?: () => void;
  lang: 'bn' | 'en';
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  currentUser,
  onClose,
  onUpdateUser,
  onLogout,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'rates' | 'cashout' | 'password' | 'gallery'>('profile');

  // Password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  // FX Rates state
  const [voiceRate, setVoiceRate] = useState(currentUser.voiceRate || 20);
  const [videoRate, setVideoRate] = useState(currentUser.videoRate || 40);
  const [ratesSaved, setRatesSaved] = useState(false);

  // FX Cashout state
  const [payoutUpi, setPayoutUpi] = useState(currentUser.payoutUpiId || '');
  const [cashoutCredits, setCashoutCredits] = useState(currentUser.credits || 100);
  const [cashoutSuccess, setCashoutSuccess] = useState(false);
  const [cashoutError, setCashoutError] = useState('');

  // Bio state
  const [bio, setBio] = useState(currentUser.bio || '');
  const [bioSaved, setBioSaved] = useState(false);

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPass !== currentUser.password) {
      setPassMsg({
        text: lang === 'bn' ? 'বর্তমান পাসওয়ার্ড ভুল!' : 'Current password incorrect!',
        error: true,
      });
      return;
    }
    if (newPass.length < 4) {
      setPassMsg({
        text: lang === 'bn' ? 'নতুন পাসওয়ার্ড নূন্যতম ৪ অক্ষর হতে হবে।' : 'Password must be 4+ chars.',
        error: true,
      });
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg({
        text: lang === 'bn' ? 'নতুন পাসওয়ার্ড দুটি মিলছে না!' : 'Passwords do not match!',
        error: true,
      });
      return;
    }

    const updated = { ...currentUser, password: newPass };
    storage.updateUser(updated);
    onUpdateUser(updated);
    setPassMsg({
      text: lang === 'bn' ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password updated successfully!',
      error: false,
    });
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  const handleSaveRates = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      voiceRate: Math.max(1, Number(voiceRate)),
      videoRate: Math.max(1, Number(videoRate)),
    };
    storage.updateUser(updated);
    onUpdateUser(updated);
    setRatesSaved(true);
    setTimeout(() => setRatesSaved(false), 2500);
  };

  const handleSaveBio = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = { ...currentUser, bio: bio.trim() };
    storage.updateUser(updated);
    onUpdateUser(updated);
    setBioSaved(true);
    setTimeout(() => setBioSaved(false), 2000);
  };

  const handleRequestCashout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutUpi.trim()) {
      setCashoutError(lang === 'bn' ? 'আপনার UPI ID দিন' : 'Please provide UPI ID');
      return;
    }
    if (cashoutCredits <= 0 || cashoutCredits > currentUser.credits) {
      setCashoutError(lang === 'bn' ? 'পর্যাপ্ত ব্যালেন্স নেই' : 'Insufficient balance');
      return;
    }

    // Convert credits to INR: e.g. 1 Credit = ₹0.40 or 100 Credits = ₹40
    const inrAmount = Math.round(cashoutCredits * 0.4);

    const newCashout: CashoutRequest = {
      id: `cash_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      credits: cashoutCredits,
      amountInr: inrAmount,
      upiId: payoutUpi.trim(),
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    // Deduct credits from FX User wallet
    const updated = {
      ...currentUser,
      credits: currentUser.credits - cashoutCredits,
      payoutUpiId: payoutUpi.trim(),
    };
    storage.updateUser(updated);
    onUpdateUser(updated);

    storage.addCashoutRequest(newCashout);
    setCashoutSuccess(true);
    setCashoutError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/90 border-b border-slate-700/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-emerald-400" />
              {lang === 'bn' ? 'অ্যাকাউন্ট সেটিংস' : 'Account Settings'}
            </h3>
            <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 px-4 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'প্রোফাইল' : 'Profile'}
          </button>

          {currentUser.role === 'FX_USER' && (
            <>
              <button
                onClick={() => setActiveTab('rates')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === 'rates'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'কল বিলিং রেট' : 'Call Rates'}
              </button>

              <button
                onClick={() => setActiveTab('cashout')}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === 'cashout'
                    ? 'border-emerald-500 text-emerald-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {lang === 'bn' ? 'ওয়ালেট ক্যাশআউট' : 'Cashout'}
              </button>
            </>
          )}

          <button
            onClick={() => setActiveTab('gallery')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'gallery'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'গ্যালারি (১০টি)' : 'Gallery (10)'}
          </button>

          <button
            onClick={() => setActiveTab('password')}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all ${
              activeTab === 'password'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'পাসওয়ার্ড আপডেট' : 'Password'}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/60">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-emerald-500 shadow-md"
                />
                <div>
                  <h4 className="font-bold text-white text-base">{currentUser.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">@{currentUser.username}</p>
                  <p className="text-[11px] text-emerald-400 mt-0.5">
                    রোল: <span className="font-bold uppercase">{currentUser.role}</span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSaveBio} className="space-y-3">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">
                    {lang === 'bn' ? 'বায়ো / বিবরণ (Bio)' : 'Bio / Description'}
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="নিজের সম্পর্কে লিখুন..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>
                <div className="flex items-center justify-between">
                  {bioSaved && (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <Check className="w-4 h-4" />
                      {lang === 'bn' ? 'সংরক্ষিত হয়েছে!' : 'Saved!'}
                    </span>
                  )}
                  <button
                    type="submit"
                    className="ml-auto py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                  >
                    {lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Rates Tab (FXUser custom billing per minute) */}
          {activeTab === 'rates' && currentUser.role === 'FX_USER' && (
            <form onSubmit={handleSaveRates} className="space-y-4">
              <div className="bg-emerald-950/40 border border-emerald-800/60 p-3.5 rounded-2xl text-xs text-emerald-300 leading-relaxed">
                {lang === 'bn'
                  ? 'আপনার ইচ্ছা মতো প্রতি মিনিটে ইনকামিং ভয়েস কল ও ভিডিয়ো কল এর জন্য MXUser এর কাছে কত বিল করবেন তা নির্ধারণ করুন। MXUser কল করার আগেই এই রেট দেখে নেবে।'
                  : 'Set your custom billing rate per minute for incoming Voice & Video calls. MXUser will see this rate before placing a call.'}
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>
                      {lang === 'bn'
                        ? 'ইনকামিং ভয়েস কল রেট (ক্রেডিট / মিনিট)'
                        : 'Voice Call Rate (Credits / min)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={voiceRate}
                    onChange={(e) => setVoiceRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-300 flex items-center gap-1.5 mb-1.5">
                    <Video className="w-3.5 h-3.5 text-teal-400" />
                    <span>
                      {lang === 'bn'
                        ? 'ইনকামিং ভিডিয়ো কল রেট (ক্রেডিট / মিনিট)'
                        : 'Video Call Rate (Credits / min)'}
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={videoRate}
                    onChange={(e) => setVideoRate(Number(e.target.value))}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-mono focus:border-emerald-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                {ratesSaved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                    <Check className="w-4 h-4" />
                    {lang === 'bn' ? 'রেট সফলভাবে আপডেট হয়েছে!' : 'Rates saved!'}
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto py-2.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
                >
                  {lang === 'bn' ? 'রেট সেভ করুন' : 'Save Rates'}
                </button>
              </div>
            </form>
          )}

          {/* Cashout Tab (FXUser wallet conversion) */}
          {activeTab === 'cashout' && currentUser.role === 'FX_USER' && (
            <div className="space-y-4">
              <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">
                    {lang === 'bn' ? 'উপার্জিত ওয়ালেট ব্যালেন্স:' : 'Earned Wallet Balance:'}
                  </span>
                  <div className="text-xl font-bold text-amber-400 font-mono">
                    {currentUser.credits} <span className="text-xs font-normal">Credits</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">
                    {lang === 'bn' ? 'আনুমানিক INR মূল্য:' : 'Approx INR Value:'}
                  </span>
                  <div className="text-lg font-bold text-white font-mono">
                    ₹{Math.round(currentUser.credits * 0.4)}
                  </div>
                </div>
              </div>

              {cashoutSuccess ? (
                <div className="bg-emerald-950/60 border border-emerald-800 p-4 rounded-2xl text-center space-y-2">
                  <Check className="w-8 h-8 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">
                    {lang === 'bn' ? 'ক্যাশআউট অনুরোধ পাঠানো হয়েছে!' : 'Cashout Request Submitted!'}
                  </p>
                  <p className="text-[11px] text-emerald-300">
                    {lang === 'bn'
                      ? 'অ্যাডমিন শীঘ্রই আপনার উল্লেখিত ইউপিআই একাউন্টে টাকা পাঠাবেন।'
                      : 'Admin will disburse payment to your UPI ID shortly.'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleRequestCashout} className="space-y-3">
                  {cashoutError && (
                    <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-xl border border-rose-800">
                      {cashoutError}
                    </p>
                  )}

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {lang === 'bn' ? 'আপনার প্রাপ্তির UPI ID' : 'Your Payout UPI ID'} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. mobile@okaxis"
                      value={payoutUpi}
                      onChange={(e) => setPayoutUpi(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {lang === 'bn' ? 'উত্তোলনযোগ্য ক্রেডিট পরিমাণ' : 'Credits to withdraw'}
                    </label>
                    <input
                      type="number"
                      min="50"
                      max={currentUser.credits}
                      value={cashoutCredits}
                      onChange={(e) => setCashoutCredits(Number(e.target.value))}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      পাবেন প্রায়: ₹{Math.round(cashoutCredits * 0.4)}
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={currentUser.credits < 50}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-emerald-600/30 flex items-center justify-center gap-1.5 transition-all"
                  >
                    <ArrowUpRight className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'অ্যাডমিনকে ক্যাশআউট রিকোয়েস্ট পাঠান' : 'Request Cashout'}</span>
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Gallery Tab (Self upload up to 10 photos) */}
          {activeTab === 'gallery' && (
            <GalleryManager
              targetUser={currentUser}
              onUpdate={onUpdateUser}
              canEdit={true}
              lang={lang}
            />
          )}

          {/* Password Tab (Password protected and updateable) */}
          {activeTab === 'password' && (
            <form onSubmit={handleUpdatePassword} className="space-y-3.5">
              <div className="bg-slate-800/60 p-3 rounded-2xl border border-slate-700/60 text-xs text-slate-400">
                {lang === 'bn'
                  ? 'আপনার অ্যাকাউন্টের নিরাপত্তা নিশ্চিত করতে পাসওয়ার্ড আপডেট করতে পারেন।'
                  : 'Keep your account secure by updating your password.'}
              </div>

              {passMsg && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
                    passMsg.error
                      ? 'bg-rose-950/60 border-rose-800 text-rose-300'
                      : 'bg-emerald-950/60 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {passMsg.error ? <AlertCircle className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                  <span>{passMsg.text}</span>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}
                </label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </label>
                <input
                  type="password"
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  {lang === 'bn' ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                </label>
                <input
                  type="password"
                  value={confirmPass}
                  onChange={(e) => setConfirmPass(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:border-emerald-500"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30 transition-all"
              >
                {lang === 'bn' ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password'}
              </button>
            </form>
          )}

          {/* LARGE RED LOGOUT BUTTON FOR ALL USERS */}
          {onLogout && (
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="w-full py-3.5 px-4 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2 shadow-xl shadow-red-600/30 border-2 border-red-500 transition-all"
              >
                <LogOut className="w-5 h-5 text-white stroke-[2.5]" />
                <span className="tracking-wide">
                  {lang === 'bn' ? 'অ্যাকাউন্ট থেকে লগআউট করুন' : 'Log Out of Account'}
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
