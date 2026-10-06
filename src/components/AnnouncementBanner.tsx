import React, { useState } from 'react';
import { Megaphone, AlertCircle, Sparkles, AlertTriangle, Info, X, ChevronDown, ChevronUp } from 'lucide-react';
import { SystemAnnouncement } from '../types';

interface AnnouncementBannerProps {
  announcements: SystemAnnouncement[];
  lang: 'bn' | 'en';
}

export const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements, lang }) => {
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeList = announcements.filter((a) => a.isActive && !dismissedIds.includes(a.id));
  if (activeList.length === 0) return null;

  const current = activeList[0];

  const handleDismiss = (id: string) => {
    setDismissedIds((prev) => [...prev, id]);
  };

  const getBadgeStyle = (type: string, priority: string) => {
    if (priority === 'URGENT' || type === 'ALERT') {
      return {
        bg: 'bg-red-950/90 border-red-500/60 text-red-200',
        badge: 'bg-red-600 text-white',
        icon: <AlertCircle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />,
        label: lang === 'bn' ? 'জরুরি নোটিশ' : 'URGENT ALERT',
      };
    }
    if (type === 'OFFER') {
      return {
        bg: 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200',
        badge: 'bg-emerald-600 text-white',
        icon: <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />,
        label: lang === 'bn' ? 'বিশেষ অফার' : 'SPECIAL OFFER',
      };
    }
    if (type === 'WARNING') {
      return {
        bg: 'bg-amber-950/90 border-amber-500/60 text-amber-200',
        badge: 'bg-amber-600 text-white',
        icon: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />,
        label: lang === 'bn' ? 'সতর্কতা' : 'WARNING',
      };
    }
    return {
      bg: 'bg-blue-950/90 border-blue-500/60 text-blue-200',
      badge: 'bg-blue-600 text-white',
      icon: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
      label: lang === 'bn' ? 'সিস্টেম নোটিশ' : 'ANNOUNCEMENT',
    };
  };

  const style = getBadgeStyle(current.type, current.priority);

  return (
    <div className={`w-full border-b backdrop-blur-md px-4 py-2.5 transition-all shadow-md ${style.bg}`}>
      <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-2.5 min-w-0 flex-1">
          {style.icon}

          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0 flex-1 text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${style.badge}`}>
                {style.label}
              </span>
              <span className="font-extrabold text-white truncate max-w-[200px] sm:max-w-none">
                {current.title}
              </span>
            </div>

            <p className={`text-slate-300 text-[11px] sm:text-xs leading-relaxed ${isExpanded ? '' : 'line-clamp-1 sm:truncate'}`}>
              {current.message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {current.message.length > 60 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
              title={isExpanded ? 'সংক্ষেপ করুন' : 'বিস্তারিত দেখুন'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}

          <button
            onClick={() => handleDismiss(current.id)}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Dismiss'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
