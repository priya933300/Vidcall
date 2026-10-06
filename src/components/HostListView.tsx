import React, { useState } from 'react';
import {
  Phone,
  Video,
  MessageSquare,
  ShieldCheck,
  Coins,
  Sparkles,
  Image as ImageIcon,
  Clock,
  Search,
} from 'lucide-react';
import { User } from '../types';

interface HostListViewProps {
  currentUser: User;
  users: User[];
  onSelectHost: (host: User) => void;
  onInitiateCall: (target: User, type: 'VOICE' | 'VIDEO') => void;
  onOpenChat: (target: User) => void;
  onOpenRecharge: () => void;
  lang: 'bn' | 'en';
}

export const HostListView: React.FC<HostListViewProps> = ({
  currentUser,
  users,
  onSelectHost,
  onInitiateCall,
  onOpenChat,
  onOpenRecharge,
  lang,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Prompt rule: MXUser can only see FXUsers and online Admins
  const fxUsers = users.filter(
    (u) =>
      u.role === 'FX_USER' &&
      !u.isSuspended &&
      (u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const onlineAdmins = users.filter(
    (u) => (u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') && !u.isSuspended && u.isOnline
  );

  const isMX = currentUser.role === 'MX_USER';
  const isFX = currentUser.role === 'FX_USER';

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Free Admin Support Banner for MXUser */}
      {isMX && onlineAdmins.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/60 via-[#14120e] to-slate-950 border border-amber-500/40 rounded-3xl p-5 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                  <span>{lang === 'bn' ? 'অনলাইন অ্যাডমিন সাপোর্ট' : 'Online Admin Support'}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                    {lang === 'bn' ? '০ ব্যালেন্সেও ফ্রি' : 'Free 0 Balance'}
                  </span>
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lang === 'bn'
                    ? 'ব্যালেন্স ০ থাকলেও অ্যাডমিনকে ফ্রি ভয়েস কল, ভিডিয়ো কল ও মেসেজ করতে পারবেন।'
                    : 'Call and message admins for free even with 0 credits for top-up or assistance.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onlineAdmins.slice(0, 1).map((admin) => (
                <div key={admin.id} className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenChat(admin)}
                    className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>{lang === 'bn' ? 'মেসেজ' : 'Message'}</span>
                  </button>

                  <button
                    onClick={() => onInitiateCall(admin, 'VOICE')}
                    className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all"
                  >
                    <Phone className="w-4 h-4" />
                    <span>{lang === 'bn' ? 'ফ্রি কল' : 'Free Call'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FX Users Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>{lang === 'bn' ? 'অনলাইন এফএক্স হোস্ট তালিকা' : 'Available FX Hosts'}</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'bn'
                ? 'কথা বলতে ও ভিডিয়ো কলে যুক্ত হতে যেকোনো হোস্ট বেছে নিন'
                : 'Select any host for instant voice and video chat'}
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={lang === 'bn' ? 'হোস্ট খুঁজুন...' : 'Search hosts...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {fxUsers.length === 0 ? (
          <div className="p-12 bg-slate-900/60 rounded-3xl border border-slate-800 text-center text-slate-400">
            <p className="text-xs">
              {lang === 'bn' ? 'কোনো এফএক্স হোস্ট পাওয়া যায়নি' : 'No FX hosts found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fxUsers.map((host) => {
              const voiceRate = host.voiceRate || 20;
              const videoRate = host.videoRate || 40;
              const maxVoiceMins = voiceRate > 0 ? Math.floor(currentUser.credits / voiceRate) : 0;
              const maxVideoMins = videoRate > 0 ? Math.floor(currentUser.credits / videoRate) : 0;
              const canCallVoice = currentUser.credits >= voiceRate;
              const canCallVideo = currentUser.credits >= videoRate;

              return (
                <div
                  key={host.id}
                  className={`rounded-3xl p-5 shadow-xl flex flex-col justify-between transition-all group ${
                    isMX
                      ? 'bg-[#0e0e12] border border-amber-500/25 hover:border-amber-500/50 shadow-black/80'
                      : isFX
                      ? 'bg-[#140b17] border border-pink-500/25 hover:border-pink-500/50 shadow-black/80'
                      : 'bg-slate-900 border border-slate-800 hover:border-slate-700/80'
                  }`}
                >
                  <div className="space-y-3.5">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div
                        onClick={() => onSelectHost(host)}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <div className="relative">
                          <img
                            src={host.avatar}
                            alt={host.name}
                            className={`w-14 h-14 rounded-full object-cover border-2 shadow-md group-hover:scale-105 transition-transform ${
                              isMX ? 'border-amber-400' : isFX ? 'border-pink-400' : 'border-emerald-400'
                            }`}
                          />
                          <span
                            className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                              host.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                            }`}
                          />
                        </div>
                        <div>
                          <h3 className={`font-bold text-base transition-colors ${
                            isMX ? 'text-white group-hover:text-amber-400' : isFX ? 'text-white group-hover:text-pink-400' : 'text-white group-hover:text-emerald-400'
                          }`}>
                            {host.name}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono">@{host.username}</p>
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                            <ImageIcon className={`w-3 h-3 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-emerald-400'}`} />
                            <span>{host.gallery.length}/10 {lang === 'bn' ? 'ছবি' : 'Photos'}</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => onSelectHost(host)}
                        className={`text-xs px-2.5 py-1 rounded-xl transition-colors border ${
                          isMX
                            ? 'bg-amber-950/40 text-amber-300 border-amber-500/30 hover:bg-amber-900/50'
                            : isFX
                            ? 'bg-pink-950/40 text-pink-300 border-pink-500/30 hover:bg-pink-900/50'
                            : 'bg-slate-800 text-slate-400 hover:text-white border-slate-700'
                        }`}
                      >
                        {lang === 'bn' ? 'প্রোফাইল' : 'View'}
                      </button>
                    </div>

                    {/* Bio */}
                    {host.bio && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                        {host.bio}
                      </p>
                    )}

                    {/* Rates & Duration Preview */}
                    <div className={`grid grid-cols-2 gap-2 text-xs p-3 rounded-2xl border ${
                      isMX
                        ? 'bg-amber-950/20 border-amber-500/20 text-amber-200'
                        : isFX
                        ? 'bg-pink-950/20 border-pink-500/20 text-pink-200'
                        : 'bg-slate-800/60 border-slate-700/60'
                    }`}>
                      <div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Phone className={`w-3 h-3 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-emerald-400'}`} />
                          <span>{lang === 'bn' ? 'ভয়েস রেট' : 'Voice'}</span>
                        </div>
                        <div className="font-bold text-white font-mono mt-0.5">
                          {voiceRate} <span className="text-[10px] font-normal text-slate-400">cr/m</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-emerald-400'}`}>
                          {lang === 'bn' ? 'সর্বোচ্চ:' : 'Max:'} {maxVoiceMins}m
                        </div>
                      </div>

                      <div className="border-l border-slate-800 pl-3">
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Video className={`w-3 h-3 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-teal-400'}`} />
                          <span>{lang === 'bn' ? 'ভিডিয়ো রেট' : 'Video'}</span>
                        </div>
                        <div className="font-bold text-white font-mono mt-0.5">
                          {videoRate} <span className="text-[10px] font-normal text-slate-400">cr/m</span>
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-teal-400'}`}>
                          {lang === 'bn' ? 'সর্বোচ্চ:' : 'Max:'} {maxVideoMins}m
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 mt-3 border-t border-slate-800/80 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onOpenChat(host)}
                      className={`py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors border ${
                        isMX
                          ? 'bg-[#15151a] hover:bg-[#1e1e24] text-amber-200 border-amber-500/30'
                          : isFX
                          ? 'bg-[#18111b] hover:bg-[#231828] text-pink-200 border-pink-500/30'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/60'
                      }`}
                      title={lang === 'bn' ? 'মেসেজ পাঠান' : 'Chat'}
                    >
                      <MessageSquare className={`w-4 h-4 ${isMX ? 'text-amber-400' : isFX ? 'text-pink-400' : 'text-emerald-400'}`} />
                      <span>{lang === 'bn' ? 'চ্যাট' : 'Chat'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!canCallVoice) {
                          onOpenRecharge();
                        } else {
                          onInitiateCall(host, 'VOICE');
                        }
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        canCallVoice
                          ? isMX
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 text-slate-950 font-black shadow-md shadow-amber-500/20'
                            : isFX
                            ? 'bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 text-white font-black shadow-md shadow-pink-500/20'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                          : 'bg-amber-600/80 hover:bg-amber-600 text-white'
                      }`}
                      title={
                        canCallVoice
                          ? lang === 'bn'
                            ? 'ভয়েস কল করুন'
                            : 'Voice Call'
                          : lang === 'bn'
                          ? 'রিচার্জ করুন'
                          : 'Recharge'
                      }
                    >
                      <Phone className="w-4 h-4" />
                      <span>{canCallVoice ? (lang === 'bn' ? 'ভয়েস' : 'Voice') : 'রিচার্জ'}</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!canCallVideo) {
                          onOpenRecharge();
                        } else {
                          onInitiateCall(host, 'VIDEO');
                        }
                      }}
                      className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                        canCallVideo
                          ? isMX
                            ? 'bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 text-slate-950 font-black shadow-md shadow-yellow-500/20'
                            : isFX
                            ? 'bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 text-white font-black shadow-md shadow-rose-500/20'
                            : 'bg-teal-600 hover:bg-teal-500 text-white shadow-sm'
                          : 'bg-amber-600/80 hover:bg-amber-600 text-white'
                      }`}
                      title={
                        canCallVideo
                          ? lang === 'bn'
                            ? 'ভিডিয়ো কল করুন'
                            : 'Video Call'
                          : lang === 'bn'
                          ? 'রিচার্জ করুন'
                          : 'Recharge'
                      }
                    >
                      <Video className="w-4 h-4" />
                      <span>{canCallVideo ? (lang === 'bn' ? 'ভিডিয়ো' : 'Video') : 'রিচার্জ'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
