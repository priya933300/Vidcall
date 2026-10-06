import React, { useState, useEffect, useRef } from 'react';
import {
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Gift as GiftIcon,
  Sparkles,
  ShieldCheck,
  Coins,
  Clock,
  Volume2,
} from 'lucide-react';
import { User, Gift, GiftSent } from '../types';
import { GIFTS_CATALOG, storage } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface CallScreenProps {
  caller: User;
  receiver: User;
  type: 'VOICE' | 'VIDEO';
  ratePerMinute: number;
  onEndCall: (durationSeconds: number, creditsCharged: number, giftsTotal: number) => void;
  lang: 'bn' | 'en';
}

export const CallScreen: React.FC<CallScreenProps> = ({
  caller,
  receiver,
  type,
  ratePerMinute,
  onEndCall,
  lang,
}) => {
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [showGiftDrawer, setShowGiftDrawer] = useState(false);
  const [giftsSent, setGiftsSent] = useState<GiftSent[]>([]);
  const [activeGiftCelebration, setActiveGiftCelebration] = useState<{ icon: string; name: string } | null>(null);
  const [currentCallerCredits, setCurrentCallerCredits] = useState(caller.credits);
  const [currentReceiverCredits, setCurrentReceiverCredits] = useState(receiver.credits);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Initialize camera/mic if video call
  useEffect(() => {
    soundFX.playCallConnected();

    let stream: MediaStream | null = null;
    const initMedia = async () => {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: true,
            video: type === 'VIDEO',
          });
          mediaStreamRef.current = stream;
          if (localVideoRef.current && stream) {
            localVideoRef.current.srcObject = stream;
          }
        }
      } catch (err) {
        console.warn('Camera/Mic permission not granted, using simulated stream', err);
      }
    };

    initMedia();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [type]);

  // Duration timer & real-time credit deduction
  useEffect(() => {
    // If call to Admin, rate is 0 (Free call)
    const isFreeCall = receiver.role === 'ADMIN' || receiver.role === 'SUPER_ADMIN' || ratePerMinute === 0;

    const timer = window.setInterval(() => {
      setDuration((prevSec) => {
        const nextSec = prevSec + 1;

        // Every 60 seconds elapsed, deduct 1 minute's rate
        if (!isFreeCall && nextSec > 0 && nextSec % 60 === 0) {
          setCurrentCallerCredits((prevBal) => {
            const newBal = prevBal - ratePerMinute;
            if (newBal <= 0) {
              // Out of credit! Auto terminate call
              window.setTimeout(() => {
                soundFX.playCallEnded();
                const totalCharged = Math.floor(nextSec / 60) * ratePerMinute;
                const giftsSum = giftsSent.reduce((sum, g) => sum + g.credits, 0);
                onEndCall(nextSec, totalCharged, giftsSum);
              }, 100);
              return 0;
            }
            // Update storage
            const updatedCaller = { ...caller, credits: newBal };
            storage.updateUser(updatedCaller);

            // Credit FX user
            setCurrentReceiverCredits((rxBal) => {
              const updatedRx = { ...receiver, credits: rxBal + ratePerMinute };
              storage.updateUser(updatedRx);
              return updatedRx.credits;
            });

            return newBal;
          });
        }

        return nextSec;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [caller, receiver, ratePerMinute, onEndCall, giftsSent]);

  const toggleMute = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
    setIsVideoOff(!isVideoOff);
  };

  const handleSendGift = (gift: Gift) => {
    // Rule: "কালের মধ্যে MXUser FXUser কে গিফট করতে পারবে তার ক্রেডিট লা ব্যালেন্স । যেটা সরাসরি MXUser এর একাউন্ট থেকে প্রথমে টাইম হিসাব করে বাকি অবশিষ্ট ক্রেডিট থেকে কেটে FXUser এর ওয়ালেট এ জমা হবে ।"
    // Calculate remaining required credits for current minute
    const elapsedMinutes = Math.floor(duration / 60);
    const minuteCreditCommitment = ratePerMinute > 0 ? ratePerMinute : 0;
    const safeRemainingCredits = currentCallerCredits - minuteCreditCommitment;

    if (safeRemainingCredits < gift.credits) {
      setToastMessage(
        lang === 'bn'
          ? `উপহার পাঠাতে ব্যালেন্স কম! অবশিষ্ট মুক্ত ক্রেডিট: ${Math.max(0, safeRemainingCredits)}`
          : `Insufficient free credits! Available: ${Math.max(0, safeRemainingCredits)}`
      );
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    // Deduct from caller and add to FXUser wallet directly
    const nextCallerCredits = currentCallerCredits - gift.credits;
    const nextReceiverCredits = currentReceiverCredits + gift.credits;

    setCurrentCallerCredits(nextCallerCredits);
    setCurrentReceiverCredits(nextReceiverCredits);

    const updatedCaller = { ...caller, credits: nextCallerCredits };
    const updatedReceiver = { ...receiver, credits: nextReceiverCredits };
    storage.updateUser(updatedCaller);
    storage.updateUser(updatedReceiver);

    const giftItem: GiftSent = {
      id: `gift_${Date.now()}`,
      giftId: gift.id,
      giftName: gift.name,
      icon: gift.icon,
      credits: gift.credits,
      timestamp: new Date().toISOString(),
    };

    setGiftsSent((prev) => [...prev, giftItem]);
    setActiveGiftCelebration({ icon: gift.icon, name: gift.nameBn || gift.name });
    soundFX.playGiftSparkle();

    setTimeout(() => {
      setActiveGiftCelebration(null);
    }, 2500);

    setToastMessage(
      lang === 'bn'
        ? `${receiver.name}-কে ${gift.icon} ${gift.nameBn} উপহার পাঠানো হয়েছে!`
        : `Sent ${gift.icon} ${gift.name} to ${receiver.name}!`
    );
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleEnd = () => {
    soundFX.playCallEnded();
    const isFreeCall = receiver.role === 'ADMIN' || receiver.role === 'SUPER_ADMIN' || ratePerMinute === 0;
    const totalMinutesCharged = isFreeCall ? 0 : Math.ceil(duration / 60);
    const totalCharged = isFreeCall ? 0 : totalMinutesCharged * ratePerMinute;
    const giftsSum = giftsSent.reduce((sum, g) => sum + g.credits, 0);
    onEndCall(duration, totalCharged, giftsSum);
  };

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isFreeCall = receiver.role === 'ADMIN' || receiver.role === 'SUPER_ADMIN' || ratePerMinute === 0;
  const remainingMinutesEst = ratePerMinute > 0 ? Math.floor(currentCallerCredits / ratePerMinute) : 999;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden select-none">
      {/* Toast Notice */}
      {toastMessage && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600/90 text-white text-xs font-semibold rounded-full shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          {toastMessage}
        </div>
      )}

      {/* Floating Gift Celebration Animation */}
      {activeGiftCelebration && (
        <div className="absolute inset-0 z-40 pointer-events-none flex items-center justify-center animate-in zoom-in-50 duration-300">
          <div className="text-center p-6 rounded-3xl bg-black/70 border border-amber-500/50 backdrop-blur-md shadow-2xl">
            <span className="text-7xl block animate-bounce">{activeGiftCelebration.icon}</span>
            <p className="mt-2 text-base font-bold text-amber-300">{activeGiftCelebration.name}</p>
            <p className="text-xs text-slate-300">
              {lang === 'bn' ? 'উপহার ক্রেডিট ওয়ালেটে জমা হয়েছে!' : 'Gift credited to wallet!'}
            </p>
          </div>
        </div>
      )}

      {/* Top Bar: Call Status & User Info */}
      <div className="relative z-20 px-4 pt-6 pb-3 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={receiver.avatar}
            alt={receiver.name}
            className="w-12 h-12 rounded-full border-2 border-emerald-500 shadow-md object-cover bg-slate-800"
          />
          <div>
            <h3 className="font-bold text-base text-white tracking-tight flex items-center gap-1.5">
              {receiver.name}
              {receiver.role === 'ADMIN' && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-normal">
                  Admin
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-300 flex items-center gap-1 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              {formatTime(duration)} · {type === 'VIDEO' ? 'ভিডিও কল' : 'ভয়েস কল'}
            </p>
          </div>
        </div>

        {/* Real-time Ticker: Balance & Rate */}
        <div className="text-right">
          {isFreeCall ? (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-500/30">
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ফ্রি অ্যাডমিন সাপোর্ট' : 'Free Support'}</span>
            </div>
          ) : (
            <div className="bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/60 text-right">
              <div className="flex items-center justify-end gap-1 text-xs text-amber-400 font-mono font-bold">
                <Coins className="w-3.5 h-3.5" />
                <span>{currentCallerCredits} cr</span>
              </div>
              <p className="text-[10px] text-slate-400">
                ~{remainingMinutesEst} {lang === 'bn' ? 'মিনিট বাকি' : 'mins left'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Stream Area */}
      <div className="relative flex-1 flex items-center justify-center p-4">
        {type === 'VIDEO' ? (
          <div className="relative w-full h-full max-w-2xl max-h-[640px] rounded-3xl overflow-hidden border border-slate-800 bg-slate-900 shadow-2xl flex items-center justify-center">
            {/* Receiver Feed (Simulated / Realistic Host View) */}
            <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900">
              <div className="relative">
                <img
                  src={receiver.avatar}
                  alt={receiver.name}
                  className="w-36 h-36 rounded-full border-4 border-emerald-400 shadow-2xl object-cover animate-pulse"
                />
                <span className="absolute bottom-1 right-2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-white tracking-tight">{receiver.name}</h2>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 animate-bounce" />
                {lang === 'bn' ? 'কথা বলছেন...' : 'Speaking...'}
              </p>

              {/* Rate badge on feed */}
              {!isFreeCall && (
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-mono text-slate-300 border border-white/10">
                  {ratePerMinute} {lang === 'bn' ? 'ক্রেডিট/মিনিট' : 'credits/min'}
                </div>
              )}
            </div>

            {/* Self PIP View (Bottom-Right) */}
            <div className="absolute bottom-4 right-4 w-28 h-36 rounded-2xl overflow-hidden border-2 border-slate-700 bg-black shadow-xl z-20">
              {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400 text-xs">
                  <VideoOff className="w-6 h-6 mb-1" />
                  <span>Off</span>
                </div>
              ) : (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              )}
            </div>
          </div>
        ) : (
          /* Voice Call Interface */
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
              <div className="w-44 h-44 rounded-full bg-emerald-500/20 absolute -inset-2 animate-ping opacity-30" />
              <div className="w-44 h-44 rounded-full bg-emerald-500/30 absolute -inset-1 animate-pulse" />
              <img
                src={receiver.avatar}
                alt={receiver.name}
                className="relative w-40 h-40 rounded-full border-4 border-emerald-500 shadow-2xl object-cover"
              />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{receiver.name}</h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              {lang === 'bn' ? 'ভয়েস কল চলছে' : 'Voice Call in Progress'} · {formatTime(duration)}
            </p>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center gap-1.5 mt-8 h-10">
              {[40, 70, 30, 90, 60, 100, 45, 80, 50, 95, 30, 85].map((height, i) => (
                <span
                  key={i}
                  className="w-1.5 bg-emerald-400 rounded-full transition-all duration-150 animate-pulse"
                  style={{
                    height: `${height}%`,
                    animationDelay: `${i * 120}ms`,
                  }}
                />
              ))}
            </div>

            {!isFreeCall && (
              <p className="text-xs text-amber-400 font-mono mt-6 bg-slate-900/90 px-4 py-1.5 rounded-full border border-slate-800">
                {lang === 'bn' ? 'রেট:' : 'Rate:'} {ratePerMinute} {lang === 'bn' ? 'ক্রেডিট/মিনিট' : 'cr/min'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Gift Tray Drawer */}
      {showGiftDrawer && !isFreeCall && (
        <div className="relative z-30 px-4 py-3 bg-slate-900/95 border-t border-slate-800 backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                {lang === 'bn' ? 'হোস্টকে উপহার পাঠান' : 'Send Gift to Host'}
              </span>
              <button
                onClick={() => setShowGiftDrawer(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-0.5"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {GIFTS_CATALOG.map((gift) => (
                <button
                  key={gift.id}
                  onClick={() => handleSendGift(gift)}
                  className="flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-800/90 hover:bg-emerald-900/40 border border-slate-700/60 active:scale-95 transition-all text-center"
                >
                  <span className="text-2xl mb-1">{gift.icon}</span>
                  <span className="text-[11px] font-medium text-slate-200 truncate w-full">
                    {lang === 'bn' ? gift.nameBn : gift.name}
                  </span>
                  <span className="text-[10px] font-bold text-amber-400 font-mono">
                    {gift.credits} cr
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom Control Bar (WhatsApp Style) */}
      <div className="relative z-20 px-6 py-6 bg-gradient-to-t from-black via-black/80 to-transparent flex items-center justify-center gap-5">
        {/* Mute Button */}
        <button
          onClick={toggleMute}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            isMuted ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-800/90 text-white hover:bg-slate-700'
          }`}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
        </button>

        {/* Video Toggle Button (if Video call) */}
        {type === 'VIDEO' && (
          <button
            onClick={toggleVideo}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
              isVideoOff ? 'bg-rose-500 text-white shadow-lg' : 'bg-slate-800/90 text-white hover:bg-slate-700'
            }`}
            title={isVideoOff ? 'Turn Camera On' : 'Turn Camera Off'}
          >
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        )}

        {/* Send Gift Button (Only for calls between MX and FX) */}
        {!isFreeCall && (
          <button
            onClick={() => setShowGiftDrawer(!showGiftDrawer)}
            className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-amber-500/20"
            title={lang === 'bn' ? 'উপহার পাঠান' : 'Send Gift'}
          >
            <GiftIcon className="w-6 h-6" />
          </button>
        )}

        {/* End Call Button */}
        <button
          onClick={handleEnd}
          className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 active:scale-95 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 transition-all"
          title={lang === 'bn' ? 'কল শেষ করুন' : 'End Call'}
        >
          <PhoneOff className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
