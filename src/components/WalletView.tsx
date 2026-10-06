import React, { useState } from 'react';
import {
  Wallet,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  ShieldCheck,
  Clock,
  Sparkles,
  CreditCard,
} from 'lucide-react';
import { User, RechargeRequest, CashoutRequest } from '../types';
import { storage } from '../utils/storage';

interface WalletViewProps {
  currentUser: User;
  onOpenRecharge: () => void;
  onOpenSettings: () => void;
  lang: 'bn' | 'en';
}

export const WalletView: React.FC<WalletViewProps> = ({
  currentUser,
  onOpenRecharge,
  onOpenSettings,
  lang,
}) => {
  const allRecharges = storage.getRechargeRequests();
  const allCashouts = storage.getCashoutRequests();

  const userRecharges = allRecharges.filter((r) => r.userId === currentUser.id);
  const userCashouts = allCashouts.filter((c) => c.userId === currentUser.id);

  const isFx = currentUser.role === 'FX_USER';
  const isMx = currentUser.role === 'MX_USER';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Wallet Balance Hero Card */}
      <div
        className={`rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all ${
          isMx
            ? 'bg-gradient-to-br from-amber-950/70 via-[#120f0a] to-[#08080a] border border-amber-500/50 shadow-black/90'
            : isFx
            ? 'bg-gradient-to-br from-pink-950/70 via-[#180d1a] to-[#0d0812] border border-pink-500/50 shadow-black/90'
            : 'bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-900 border border-emerald-500/40 shadow-2xl'
        }`}
      >
        <div
          className={`absolute -right-10 -bottom-10 w-48 h-48 rounded-full blur-2xl pointer-events-none ${
            isMx ? 'bg-amber-500/15' : isFx ? 'bg-pink-500/15' : 'bg-emerald-500/10'
          }`}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div>
            <div
              className={`flex items-center gap-2 text-xs font-semibold uppercase tracking-wider mb-2 ${
                isMx ? 'text-amber-400' : isFx ? 'text-pink-400' : 'text-emerald-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>
                {isFx
                  ? lang === 'bn'
                    ? 'উপার্জিত এফএক্স ওয়ালেট ব্যালেন্স'
                    : 'FX Creator Wallet Balance'
                  : lang === 'bn'
                  ? 'আপনার মোট কলিং ক্রেডিট ব্যালেন্স'
                  : 'Total Calling Credit Balance'}
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-extrabold text-white font-mono">
                {currentUser.credits}
              </span>
              <span
                className={`text-base font-bold ${
                  isMx ? 'text-amber-400' : isFx ? 'text-pink-400' : 'text-amber-400'
                }`}
              >
                Credits
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-2">
              {isFx
                ? lang === 'bn'
                  ? `আনুমানিক নগদ রূপান্তর মূল্য: ₹${Math.round(currentUser.credits * 0.4)} (ক্যাশআউট অনুরোধের মাধ্যমে)`
                  : `Estimated payout cash value: ₹${Math.round(currentUser.credits * 0.4)}`
                : lang === 'bn'
                ? 'এই ক্রেডিট দিয়ে এফএক্স হোস্টদের সাথে ভয়েস ও ভিডিয়ো কল করতে পারবেন।'
                : 'Spend credits to make audio and video calls to FX hosts.'}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            {isFx ? (
              <button
                onClick={onOpenSettings}
                className="py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white text-xs font-black shadow-lg shadow-pink-600/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <ArrowUpRight className="w-4 h-4 stroke-[3]" />
                <span>{lang === 'bn' ? 'ক্যাশআউট রিকোয়েস্ট পাঠান' : 'Request Cashout'}</span>
              </button>
            ) : (
              <button
                onClick={onOpenRecharge}
                className={`py-3 px-6 rounded-2xl text-xs font-black shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  isMx
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 shadow-amber-500/25'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white shadow-emerald-600/30'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>{lang === 'bn' ? 'UPI দিয়ে রিচার্জ করুন' : 'Top-up with UPI'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Recharge Plans Quick Grid for Callers */}
      {!isFx && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              {lang === 'bn' ? 'উপলব্ধ রিচার্জ প্ল্যানসমূহ (INR)' : 'Recharge Plans (INR)'}
            </h3>
            <span className="text-xs text-slate-400">UPI ID: gpay-12200991834@okbizaxis</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { inr: 50, credits: 100, text: 'স্ট্যান্ডার্ড' },
              { inr: 100, credits: 220, text: '+10% বোনাস', popular: true },
              { inr: 500, credits: 1200, text: '+20% বোনাস' },
              { inr: 1000, credits: 2500, text: '+25% মেগা' },
            ].map((plan) => (
              <div
                key={plan.inr}
                onClick={onOpenRecharge}
                className={`p-4 rounded-2xl border bg-slate-900 cursor-pointer hover:border-emerald-500 transition-all ${
                  plan.popular ? 'border-emerald-500/60 shadow-lg shadow-emerald-950' : 'border-slate-800'
                }`}
              >
                <div className="text-sm font-bold text-white">₹{plan.inr}</div>
                <div className="text-base font-extrabold text-amber-400 font-mono mt-0.5">
                  {plan.credits} cr
                </div>
                <div className="text-[11px] text-slate-400 mt-1">{plan.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction & History Records */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {isFx
            ? lang === 'bn'
              ? 'ক্যাশআউট অনুরোধের বিবরণ'
              : 'Cashout Request History'
            : lang === 'bn'
            ? 'আপনার রিচার্জ অনুরোধসমূহ'
            : 'Your Recharge Submissions'}
        </h3>

        {isFx ? (
          userCashouts.length === 0 ? (
            <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
              {lang === 'bn' ? 'কোনো ক্যাশআউট হিস্ট্রি নেই' : 'No cashout requests found'}
            </div>
          ) : (
            <div className="space-y-2.5">
              {userCashouts.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-white text-sm">
                      {c.credits} Credits = ₹{c.amountInr}
                    </span>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">UPI: {c.upiId}</p>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      c.status === 'COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          )
        ) : userRecharges.length === 0 ? (
          <div className="p-8 bg-slate-900 rounded-2xl border border-slate-800 text-center text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো রিচার্জ জমা দেওয়া হয়নি' : 'No recharge submissions yet'}
          </div>
        ) : (
          <div className="space-y-2.5">
            {userRecharges.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">₹{r.amountInr}</span>
                    <span className="text-xs font-mono font-bold text-amber-400">
                      (+{r.credits} cr)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">UTR: {r.utrNumber}</p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                    r.status === 'APPROVED'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : r.status === 'REJECTED'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
