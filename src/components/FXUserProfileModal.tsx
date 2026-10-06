import React, { useState } from 'react';
import { Phone, Video, MessageCircle, X, Coins, Clock, Sparkles, Image as ImageIcon } from 'lucide-react';
import { User } from '../types';

interface FXUserProfileModalProps {
  user: User;
  currentUserCredits: number;
  onClose: () => void;
  onInitiateCall: (user: User, type: 'VOICE' | 'VIDEO') => void;
  onOpenChat: (user: User) => void;
  onOpenRecharge: () => void;
  lang: 'bn' | 'en';
}

export const FXUserProfileModal: React.FC<FXUserProfileModalProps> = ({
  user,
  currentUserCredits,
  onClose,
  onInitiateCall,
  onOpenChat,
  onOpenRecharge,
  lang,
}) => {
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(null);

  const voiceRate = user.voiceRate || 20;
  const videoRate = user.videoRate || 40;

  const maxVoiceMinutes = voiceRate > 0 ? Math.floor(currentUserCredits / voiceRate) : 0;
  const maxVideoMinutes = videoRate > 0 ? Math.floor(currentUserCredits / videoRate) : 0;

  const hasVoiceCredits = currentUserCredits >= voiceRate;
  const hasVideoCredits = currentUserCredits >= videoRate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header with cover & profile picture */}
        <div className="relative bg-gradient-to-r from-emerald-800 via-teal-900 to-slate-900 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-full border-3 border-emerald-400 object-cover shadow-xl bg-slate-800"
              />
              <span
                className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  user.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </div>
            <div className="text-white">
              <h2 className="text-xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-xs text-emerald-300 font-mono">@{user.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {user.isOnline
                    ? lang === 'bn'
                      ? 'অনলাইন'
                      : 'Online'
                    : lang === 'bn'
                    ? 'অফলাইন'
                    : 'Offline'}
                </span>
                <span className="text-[11px] text-slate-300">
                  {user.gallery.length}/10 {lang === 'bn' ? 'ছবি' : 'Photos'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 text-slate-200">
          {/* Bio */}
          {user.bio && (
            <div className="bg-slate-800/70 rounded-2xl p-3.5 border border-slate-700/60 text-xs text-slate-300 leading-relaxed">
              {user.bio}
            </div>
          )}

          {/* Call Rates & Talk Time Estimates */}
          <div className="grid grid-cols-2 gap-3">
            {/* Voice Call Card */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium text-emerald-400">
                    <Phone className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'ভয়েস কল রেট' : 'Voice Call'}
                  </span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {voiceRate} <span className="text-xs font-normal text-slate-400">cr/min</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'bn' ? 'সর্বোচ্চ কথা বলতে পারবেন:' : 'Est. talk time:'}{' '}
                  <span className="text-emerald-400 font-semibold font-mono">
                    {maxVoiceMinutes} {lang === 'bn' ? 'মিনিট' : 'mins'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => {
                  if (!hasVoiceCredits) {
                    onOpenRecharge();
                  } else {
                    onInitiateCall(user, 'VOICE');
                  }
                }}
                className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  hasVoiceCredits
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30'
                    : 'bg-amber-600/80 hover:bg-amber-600 text-white'
                }`}
              >
                <Phone className="w-4 h-4" />
                {hasVoiceCredits
                  ? lang === 'bn'
                    ? 'ভয়েস কল করুন'
                    : 'Call Voice'
                  : lang === 'bn'
                  ? 'রিচার্জ করে কল করুন'
                  : 'Recharge to Call'}
              </button>
            </div>

            {/* Video Call Card */}
            <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/60 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                  <span className="flex items-center gap-1 font-medium text-teal-400">
                    <Video className="w-3.5 h-3.5" />
                    {lang === 'bn' ? 'ভিডিয়ো কল রেট' : 'Video Call'}
                  </span>
                </div>
                <div className="text-lg font-bold text-white font-mono">
                  {videoRate} <span className="text-xs font-normal text-slate-400">cr/min</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  {lang === 'bn' ? 'সর্বোচ্চ কথা বলতে পারবেন:' : 'Est. talk time:'}{' '}
                  <span className="text-teal-400 font-semibold font-mono">
                    {maxVideoMinutes} {lang === 'bn' ? 'মিনিট' : 'mins'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => {
                  if (!hasVideoCredits) {
                    onOpenRecharge();
                  } else {
                    onInitiateCall(user, 'VIDEO');
                  }
                }}
                className={`mt-4 w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  hasVideoCredits
                    ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-md shadow-teal-600/30'
                    : 'bg-amber-600/80 hover:bg-amber-600 text-white'
                }`}
              >
                <Video className="w-4 h-4" />
                {hasVideoCredits
                  ? lang === 'bn'
                    ? 'ভিডিয়ো কল করুন'
                    : 'Call Video'
                  : lang === 'bn'
                  ? 'রিচার্জ করে কল করুন'
                  : 'Recharge to Call'}
              </button>
            </div>
          </div>

          {/* Quick Chat Option */}
          <button
            onClick={() => onOpenChat(user)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            {lang === 'bn' ? 'মেসেজ ও ফটো পাঠান' : 'Chat & Send Photos'}
          </button>

          {/* 10-Photo Gallery Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                {lang === 'bn' ? 'ফটো গ্যালারি (১০টি ছবি)' : 'Photo Gallery (10 Photos)'}
              </h4>
              <span className="text-[11px] text-slate-400 font-mono">
                {user.gallery.length} / 10
              </span>
            </div>

            {user.gallery.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                {lang === 'bn' ? 'কোনো ছবি যুক্ত করা হয়নি' : 'No photos added yet'}
              </p>
            ) : (
              <div className="grid grid-cols-5 gap-2">
                {user.gallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => setSelectedPhotoIndex(idx)}
                    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group border border-slate-700 hover:border-emerald-500 transition-all"
                  >
                    <img
                      src={imgUrl}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1 rounded font-mono">
                      #{idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox for Gallery Photo */}
      {selectedPhotoIndex !== null && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex flex-col items-center justify-center p-4 animate-in fade-in"
          onClick={() => setSelectedPhotoIndex(null)}
        >
          <div className="relative max-w-sm w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute -top-10 right-0 text-white text-sm bg-slate-800/80 px-3 py-1 rounded-full"
            >
              ✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <img
              src={user.gallery[selectedPhotoIndex]}
              alt={`Photo ${selectedPhotoIndex + 1}`}
              className="w-full rounded-2xl shadow-2xl border border-slate-700 max-h-[70vh] object-contain mx-auto"
            />
            <p className="text-center text-xs text-slate-300 mt-2 font-mono">
              Photo {selectedPhotoIndex + 1} / {user.gallery.length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
