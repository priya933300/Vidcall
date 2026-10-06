import React, { useState } from 'react';
import {
  Phone,
  Video,
  Clock,
  Coins,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Star,
} from 'lucide-react';
import { User, CallLog } from '../types';
import { storage } from '../utils/storage';

interface CallHistoryViewProps {
  currentUser: User;
  onInitiateCall: (partner: User, type: 'VOICE' | 'VIDEO') => void;
  lang: 'bn' | 'en';
}

export const CallHistoryView: React.FC<CallHistoryViewProps> = ({
  currentUser,
  onInitiateCall,
  lang,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'VOICE' | 'VIDEO'>('ALL');
  const allLogs = storage.getCallLogs();
  const allUsers = storage.getUsers();

  // Filter logs for current user (unless Super Admin who sees all)
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const userLogs = allLogs.filter(
    (l) => isSuperAdmin || l.callerId === currentUser.id || l.receiverId === currentUser.id
  );

  const filtered = userLogs.filter((l) => {
    if (filter === 'VOICE') return l.type === 'VOICE';
    if (filter === 'VIDEO') return l.type === 'VIDEO';
    return true;
  });

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    if (mins === 0) return `${s}s`;
    return `${mins}m ${s}s`;
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Immutability Notice Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 flex items-center justify-between gap-3 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>
            {lang === 'bn'
              ? 'নিরাপত্তা ও স্বচ্ছতা নীতি: কোনো কল লগ ডিলিট বা এডিট করা সম্পূর্ণ নিষিদ্ধ।'
              : 'Security Policy: Call logs are immutable and cannot be edited or deleted.'}
          </span>
        </div>
        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/30 shrink-0">
          {userLogs.length} {lang === 'bn' ? 'টি কল' : 'Calls'}
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white tracking-tight">
          {lang === 'bn' ? 'কল হিস্ট্রি ও হিসাব' : 'Call History & Records'}
        </h2>

        <div className="flex items-center gap-1 p-1 bg-slate-900 rounded-2xl border border-slate-800">
          <button
            onClick={() => setFilter('ALL')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors ${
              filter === 'ALL' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'সব কল' : 'All'}
          </button>
          <button
            onClick={() => setFilter('VOICE')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors ${
              filter === 'VOICE' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'ভয়েস' : 'Voice'}
          </button>
          <button
            onClick={() => setFilter('VIDEO')}
            className={`px-3 py-1 text-xs font-semibold rounded-xl transition-colors ${
              filter === 'VIDEO' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {lang === 'bn' ? 'ভিডিয়ো' : 'Video'}
          </button>
        </div>
      </div>

      {/* Call Logs List */}
      {filtered.length === 0 ? (
        <div className="p-12 bg-slate-900 rounded-3xl border border-slate-800 text-center text-slate-400 text-xs">
          <Phone className="w-8 h-8 mx-auto mb-2 text-slate-600" />
          <p>{lang === 'bn' ? 'এখনো কোনো কল রেকর্ড নেই' : 'No call logs recorded yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((log) => {
            const isCaller = log.callerId === currentUser.id;
            const otherPartyId = isCaller ? log.receiverId : log.callerId;
            const otherPartyName = isCaller ? log.receiverName : log.callerName;
            const otherParty = allUsers.find((u) => u.id === otherPartyId);

            return (
              <div
                key={log.id}
                className="bg-slate-900 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700/80 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                      log.type === 'VIDEO'
                        ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {log.type === 'VIDEO' ? <Video className="w-5 h-5" /> : <Phone className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                      {isCaller ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <ArrowDownLeft className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      <span>{otherPartyName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {formatDuration(log.durationSeconds)}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {formatDate(log.startedAt)}
                      </span>
                    </div>

                    {/* Quality Star Rating */}
                    {log.rating ? (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= (log.rating || 0)
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[10px] font-mono text-amber-400 font-bold">
                          {log.rating}★
                        </span>
                        {log.ratingComment && (
                          <span className="text-[10px] text-slate-400 italic truncate max-w-[180px]">
                            • {log.ratingComment}
                          </span>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3 text-right">
                  <div>
                    <div
                      className={`text-xs font-mono font-bold ${
                        isCaller ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {log.creditsCharged === 0
                        ? lang === 'bn'
                          ? 'ফ্রি কল'
                          : 'Free'
                        : `${isCaller ? '-' : '+'}${log.creditsCharged} cr`}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider block">
                      {log.status}
                    </span>
                  </div>

                  {otherParty && !otherParty.isSuspended && currentUser.role === 'MX_USER' && (
                    <button
                      onClick={() => onInitiateCall(otherParty, log.type)}
                      className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-emerald-400 flex items-center justify-center transition-colors border border-slate-700/60"
                      title={lang === 'bn' ? 'পুনরায় কল করুন' : 'Call again'}
                    >
                      {log.type === 'VIDEO' ? <Video className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
