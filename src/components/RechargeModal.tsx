import React, { useState } from 'react';
import { X, Copy, Check, QrCode as QrIcon, ShieldCheck, ArrowRight, MessageSquare, PhoneCall } from 'lucide-react';
import { User, RechargePlan, RechargeRequest } from '../types';
import { RECHARGE_PLANS, UPI_ID, storage } from '../utils/storage';
import { UpiQrCode } from './UpiQrCode';

interface RechargeModalProps {
  currentUser: User;
  onClose: () => void;
  onOpenAdminChat?: () => void;
  onCallAdmin?: () => void;
  lang: 'bn' | 'en';
}

export const RechargeModal: React.FC<RechargeModalProps> = ({
  currentUser,
  onClose,
  onOpenAdminChat,
  onCallAdmin,
  lang,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<RechargePlan>(RECHARGE_PLANS[1]); // Default ₹100
  const [utrNumber, setUtrNumber] = useState('');
  const [senderName, setSenderName] = useState(currentUser.name || '');
  const [copied, setCopied] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!utrNumber.trim()) {
      setErrorMsg(lang === 'bn' ? 'দয়া করে ১২ সংখ্যার ইউটিআর/রেফারেন্স নম্বর দিন' : 'Please provide UTR number');
      return;
    }

    const newReq: RechargeRequest = {
      id: `rech_${Date.now()}`,
      userId: currentUser.id,
      username: currentUser.username,
      amountInr: selectedPlan.inr,
      credits: selectedPlan.credits,
      utrNumber: utrNumber.trim(),
      senderUpiName: senderName.trim() || currentUser.username,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    storage.addRechargeRequest(newReq);
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              {lang === 'bn' ? 'ব্যালেন্স রিচার্জ (Indian UPI)' : 'Credit Recharge (Indian UPI)'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'bn'
                ? 'কল করার জন্য ক্রেডিট রিচার্জ করুন'
                : 'Recharge credits to make audio and video calls'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-200">
          {submitted ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="text-lg font-bold text-white">
                {lang === 'bn' ? 'পেমেন্ট রিকোয়েস্ট জমা হয়েছে!' : 'Payment Proof Submitted!'}
              </h4>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                {lang === 'bn'
                  ? `আপনার ₹${selectedPlan.inr} (${selectedPlan.credits} ক্রেডিট) রিচার্জ অনুরোধ অ্যাডমিনকে পাঠানো হয়েছে। অ্যাডমিন ইউটিআর (${utrNumber}) যাচাই করে দ্রুত ক্রেডিট যুক্ত করে দেবেন।`
                  : `Your recharge request of ₹${selectedPlan.inr} (${selectedPlan.credits} credits) with UTR ${utrNumber} is pending review. Admin will credit your account shortly.`}
              </p>

              <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                {onOpenAdminChat && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenAdminChat();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    {lang === 'bn' ? 'অ্যাডমিনের সাথে চ্যাট করুন' : 'Chat with Admin'}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md"
                >
                  {lang === 'bn' ? 'ঠিক আছে' : 'Done'}
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step 1: Select Plan */}
              <div>
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-3">
                  {lang === 'bn' ? '১. রিচার্জ প্ল্যান বেছে নিন:' : '1. Choose Recharge Plan:'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {RECHARGE_PLANS.map((plan) => {
                    const isSelected = selectedPlan.inr === plan.inr;
                    return (
                      <button
                        key={plan.inr}
                        type="button"
                        onClick={() => setSelectedPlan(plan)}
                        className={`relative p-3 rounded-2xl border text-left transition-all ${
                          isSelected
                            ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-md shadow-emerald-500/10'
                            : 'bg-slate-800/70 border-slate-700 text-slate-300 hover:border-slate-600'
                        }`}
                      >
                        {plan.isPopular && (
                          <span className="absolute -top-2 right-2 text-[9px] bg-emerald-500 text-slate-950 font-bold px-1.5 py-0.5 rounded-full">
                            POPULAR
                          </span>
                        )}
                        <div className="text-sm font-bold text-white">₹{plan.inr}</div>
                        <div className="text-xs font-mono font-bold text-amber-400 mt-0.5">
                          {plan.credits} cr
                        </div>
                        {plan.bonusText && (
                          <div className="text-[10px] text-slate-400 mt-1 truncate">
                            {plan.bonusText}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: UPI ID & QR Code */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/70 space-y-4">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* QR Code */}
                  <div className="shrink-0 flex flex-col items-center">
                    <UpiQrCode amount={selectedPlan.inr} size={180} />
                    <span className="text-[11px] text-amber-400 font-mono mt-1 font-semibold">
                      ₹{selectedPlan.inr} · {selectedPlan.credits} Credits
                    </span>
                  </div>

                  {/* UPI Details & Copy */}
                  <div className="flex-1 w-full space-y-3">
                    <div>
                      <span className="text-[11px] text-slate-400 block mb-1">
                        {lang === 'bn' ? 'অফিসিয়াল UPI ID:' : 'Official UPI ID:'}
                      </span>
                      <div className="flex items-center gap-2 bg-slate-900 px-3 py-2.5 rounded-xl border border-slate-700">
                        <code className="text-xs text-emerald-300 font-mono flex-1 select-all break-all">
                          {UPI_ID}
                        </code>
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="shrink-0 text-xs px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium flex items-center gap-1 transition-colors"
                        >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? (lang === 'bn' ? 'কপি হয়েছে' : 'Copied') : (lang === 'bn' ? 'কপি' : 'Copy')}
                        </button>
                      </div>
                    </div>

                    <div className="text-xs text-slate-400 space-y-1.5 pt-1">
                      <p className="flex items-center gap-1.5 text-slate-300">
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        {lang === 'bn'
                          ? 'যেকোনো UPI অ্যাপ (GPay, PhonePe, Paytm, Cred) দিয়ে কিউআর স্ক্যান করে পেমেন্ট করুন।'
                          : 'Scan the QR code with any UPI app to pay.'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3: Submit UTR & Form */}
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  {lang === 'bn'
                    ? '২. পেমেন্টের পর ইউটিআর নম্বর জমা দিন:'
                    : '2. Submit UTR / Ref Number After Payment:'}
                </label>

                {errorMsg && (
                  <p className="text-xs text-rose-400 bg-rose-950/50 p-2.5 rounded-xl border border-rose-800">
                    {errorMsg}
                  </p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {lang === 'bn' ? 'ইউপিআই UTR / Ref নম্বর' : 'UPI UTR / Reference No.'} *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 405612345678"
                      value={utrNumber}
                      onChange={(e) => {
                        setUtrNumber(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-1">
                      {lang === 'bn' ? 'প্রেরকের নাম / ব্যবহৃত UPI অ্যাপ' : 'Sender Name / UPI App'}
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. PhonePe / Rahul Ghosh"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <span>
                    {lang === 'bn'
                      ? `₹${selectedPlan.inr} পেমেন্ট ভেরিফিকেশন পাঠান (${selectedPlan.credits} ক্রেডিট)`
                      : `Submit ₹${selectedPlan.inr} Payment Proof (${selectedPlan.credits} cr)`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Free Admin Support Line Notice */}
              <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  {lang === 'bn'
                    ? '০ ব্যালেন্সেও অ্যাডমিনের সাথে ফ্রি কল ও চ্যাট করা যায়।'
                    : 'Free call & chat with Admin even at 0 balance.'}
                </span>

                <div className="flex items-center gap-2">
                  {onCallAdmin && (
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onCallAdmin();
                      }}
                      className="text-emerald-400 hover:underline flex items-center gap-1 text-xs"
                    >
                      <PhoneCall className="w-3 h-3" />
                      {lang === 'bn' ? 'অ্যাডমিনকে কল' : 'Call Admin'}
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
