import React, { useEffect } from 'react';
import { Phone, PhoneOff, Video, Mic } from 'lucide-react';
import { User } from '../types';
import { soundFX } from '../utils/audio';

interface IncomingCallModalProps {
  caller: User;
  type: 'VOICE' | 'VIDEO';
  onAccept: () => void;
  onDecline: () => void;
  lang: 'bn' | 'en';
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  caller,
  type,
  onAccept,
  onDecline,
  lang,
}) => {
  useEffect(() => {
    const stopRing = soundFX.playIncomingRing();
    return () => stopRing();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden animate-in zoom-in-95">
        {/* Pulsing glow ring */}
        <div className="relative w-28 h-28 mx-auto my-4">
          <div className="absolute inset-0 rounded-full bg-emerald-500/30 animate-ping opacity-75" />
          <img
            src={caller.avatar}
            alt={caller.name}
            className="relative w-28 h-28 rounded-full border-4 border-emerald-500 object-cover shadow-xl"
          />
        </div>

        <h3 className="text-xl font-bold text-white tracking-tight">{caller.name}</h3>
        <p className="text-xs text-slate-400 mt-1 font-mono">@{caller.username}</p>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold my-4 border border-emerald-500/30">
          {type === 'VIDEO' ? <Video className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          <span>
            {type === 'VIDEO'
              ? lang === 'bn'
                ? 'ইনকামিং ভিডিয়ো কল...'
                : 'Incoming Video Call...'
              : lang === 'bn'
              ? 'ইনকামিং ভয়েস কল...'
              : 'Incoming Voice Call...'}
          </span>
        </div>

        <p className="text-xs text-slate-400 mb-6">
          {lang === 'bn'
            ? 'কল রিসিভ করে কথা শুরু করুন'
            : 'Accept call to connect'}
        </p>

        {/* Action Buttons: Decline (Red) and Accept (Green) */}
        <div className="flex items-center justify-center gap-8">
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-rose-600 group-hover:bg-rose-700 flex items-center justify-center shadow-lg shadow-rose-600/30 transition-all">
              <PhoneOff className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-rose-300 font-medium mt-1">
              {lang === 'bn' ? 'কেটে দিন' : 'Decline'}
            </span>
          </button>

          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-1 group active:scale-95 transition-all"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-600 group-hover:bg-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all animate-bounce">
              <Phone className="w-7 h-7 text-white" />
            </div>
            <span className="text-xs text-emerald-300 font-medium mt-1">
              {lang === 'bn' ? 'রিসিভ করুন' : 'Accept'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
