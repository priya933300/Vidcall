import React, { useState } from 'react';
import { MessageSquare, Search, ShieldAlert, CheckCheck, Clock } from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storage } from '../utils/storage';

interface ChatListViewProps {
  currentUser: User;
  onSelectChatPartner: (partner: User) => void;
  lang: 'bn' | 'en';
}

export const ChatListView: React.FC<ChatListViewProps> = ({
  currentUser,
  onSelectChatPartner,
  lang,
}) => {
  const [search, setSearch] = useState('');
  const allUsers = storage.getUsers();
  const allMessages = storage.getMessages();

  // Find users current user can chat with
  let availablePartners: User[] = [];
  if (currentUser.role === 'MX_USER') {
    // MXUser sees FXUsers and Admins
    availablePartners = allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        !u.isSuspended &&
        (u.role === 'FX_USER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    );
  } else if (currentUser.role === 'FX_USER') {
    // FXUser sees MXUsers and Admins
    availablePartners = allUsers.filter(
      (u) =>
        u.id !== currentUser.id &&
        !u.isSuspended &&
        (u.role === 'MX_USER' || u.role === 'ADMIN' || u.role === 'SUPER_ADMIN')
    );
  } else {
    // Admin / Super Admin sees all
    availablePartners = allUsers.filter((u) => u.id !== currentUser.id && !u.isSuspended);
  }

  // Filter with search
  const filtered = availablePartners.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  // Get last message for partner
  const getLastMessage = (partnerId: string): ChatMessage | undefined => {
    const thread = allMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === partnerId) ||
        (m.senderId === partnerId && m.receiverId === currentUser.id)
    );
    return thread[thread.length - 1];
  };

  const formatTime = (iso?: string) => {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const isMx = currentUser.role === 'MX_USER';
  const isFx = currentUser.role === 'FX_USER';

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 space-y-4">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
          <MessageSquare className={`w-5 h-5 ${isMx ? 'text-amber-400' : isFx ? 'text-pink-400' : 'text-emerald-400'}`} />
          <span>{lang === 'bn' ? 'মেসেজ ও চ্যাট' : 'Messages & Chats'}</span>
        </h2>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={lang === 'bn' ? 'চ্যাট খুঁজুন...' : 'Search chats...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full border rounded-2xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors ${
              isMx
                ? 'bg-[#101015] border-amber-500/30 focus:border-amber-400'
                : isFx
                ? 'bg-[#160d19] border-pink-500/30 focus:border-pink-400'
                : 'bg-slate-900 border-slate-800 focus:border-emerald-500'
            }`}
          />
        </div>
      </div>

      {/* Security notice */}
      <div className={`py-2 px-3 rounded-2xl border flex items-center gap-2 text-[11px] text-slate-400 ${
        isMx
          ? 'bg-[#121217] border-amber-500/20'
          : isFx
          ? 'bg-[#19101d] border-pink-500/20'
          : 'bg-[#182229] border-[#222E35]'
      }`}>
        <ShieldAlert className={`w-4 h-4 shrink-0 ${isMx ? 'text-amber-400' : isFx ? 'text-pink-400' : 'text-emerald-400'}`} />
        <span>
          {lang === 'bn'
            ? 'সুরক্ষিত বার্তা: সমস্ত চ্যাট ও ছবি অপরিবর্তনীয় এবং ডিলিট বা এডিট অযোগ্য।'
            : 'Secure Messaging: All chats and photos are permanent and tamper-proof.'}
        </span>
      </div>

      {/* Chat Thread List */}
      <div className={`border rounded-3xl overflow-hidden divide-y ${
        isMx
          ? 'bg-[#0e0e13] border-amber-500/25 divide-amber-500/10 shadow-xl shadow-black/80'
          : isFx
          ? 'bg-[#130b17] border-pink-500/25 divide-pink-500/10 shadow-xl shadow-black/80'
          : 'bg-slate-900 border-slate-800 divide-slate-800/80'
      }`}>
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            {lang === 'bn' ? 'কোনো চ্যাট সঙ্গী পাওয়া যায়নি' : 'No chat conversations found'}
          </div>
        ) : (
          filtered.map((partner) => {
            const lastMsg = getLastMessage(partner.id);
            return (
              <div
                key={partner.id}
                onClick={() => onSelectChatPartner(partner)}
                className={`p-4 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  isMx
                    ? 'hover:bg-amber-950/20'
                    : isFx
                    ? 'hover:bg-pink-950/20'
                    : 'hover:bg-[#202C33]/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={partner.avatar}
                      alt={partner.name}
                      className={`w-12 h-12 rounded-full object-cover border ${
                        isMx
                          ? 'border-amber-400/50'
                          : isFx
                          ? 'border-pink-400/50'
                          : 'border-emerald-500/50'
                      }`}
                    />
                    <span
                      className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        partner.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                      }`}
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-white text-sm truncate">{partner.name}</h4>
                      {partner.role === 'ADMIN' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                          Admin
                        </span>
                      )}
                      {partner.role === 'FX_USER' && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono">
                          FX Host
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 truncate mt-0.5">
                      {lastMsg?.photoUrl ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          📷 <span>{lang === 'bn' ? 'ছবি শেয়ার করেছেন' : 'Photo'}</span>
                        </span>
                      ) : lastMsg?.text ? (
                        lastMsg.text
                      ) : (
                        <span className="text-slate-500 italic">
                          {partner.role === 'FX_USER'
                            ? `Voice: ${partner.voiceRate} cr · Video: ${partner.videoRate} cr`
                            : partner.bio || 'কথা বলতে ট্যাপ করুন'}
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {formatTime(lastMsg?.timestamp)}
                  </span>
                  {partner.role === 'FX_USER' && (
                    <span className="text-[10px] text-amber-400 font-mono block mt-1">
                      {partner.voiceRate} cr/min
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
