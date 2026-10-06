import React, { useEffect, useState } from 'react';
import { Clock, Coins, Sparkles } from 'lucide-react';

interface FlashNoticeProps {
  balance: number;
  ratePerMinute: number;
  maxMinutes: number;
  maxSeconds: number;
  onDismiss: () => void;
  lang: 'bn' | 'en';
}

export const FlashNotice: React.FC<FlashNoticeProps> = ({
  balance,
  ratePerMinute,
  maxMinutes,
  maxSeconds,
  onDismiss,
  lang,
}) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 3000;

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remainingPercent);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [onDismiss]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm pointer-events-none animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 to-slate-950 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl text-center text-white relative overflow-hidden pointer-events-auto transform transition-all scale-100 animate-in zoom-in-95">
        {/* Top glowing icon */}
        <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles className="w-7 h-7 animate-pulse" />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-white mb-1">
          {lang === 'bn' ? 'কল সময় হিসাব' : 'Call Duration Calculated'}
        </h3>

        <div className="bg-slate-800/80 rounded-2xl p-4 my-3 border border-slate-700/60 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-amber-400" />
              {lang === 'bn' ? 'বর্তমান ব্যালেন্স:' : 'Current Balance:'}
            </span>
            <span className="font-bold text-amber-400 font-mono text-sm">{balance} Credits</span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-400" />
              {lang === 'bn' ? 'কল রেট:' : 'Call Rate:'}
            </span>
            <span className="font-semibold text-slate-200 font-mono">{ratePerMinute} cr/min</span>
          </div>

          <div className="pt-2 border-t border-slate-700/80 flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300">
              {lang === 'bn' ? 'সর্বোচ্চ কথা বলতে পারবেন:' : 'Max Call Duration:'}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">
              {maxMinutes}m {maxSeconds}s
            </span>
          </div>
        </div>

        <p className="text-xs text-slate-400 mb-4">
          {lang === 'bn'
            ? '৩ সেকেন্ড পর স্বয়ংক্রিয়ভাবে কল শুরু হবে...'
            : 'Connecting automatically in 3 seconds...'}
        </p>

        {/* 3-Second countdown bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-75 ease-linear rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};
