import React, { useState } from 'react';
import { Star, Phone, Video, Check, Sparkles, MessageSquare, Volume2, ShieldCheck, Heart } from 'lucide-react';
import { CallLog } from '../types';

interface PostCallRatingModalProps {
  callLog: CallLog;
  onClose: () => void;
  onSubmit: (rating: number, comment?: string) => void;
  lang: 'bn' | 'en';
}

export const PostCallRatingModal: React.FC<PostCallRatingModalProps> = ({
  callLog,
  onClose,
  onSubmit,
  lang,
}) => {
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const quickTagsBn = [
    '🔊 স্পষ্ট অডিও',
    '📹 ক্রিস্টাল এইচডি ভিডিও',
    '⚡ স্মুথ সংযোগ',
    '🌸 চমৎকার হোস্ট',
    '💖 অসাধারণ অভিজ্ঞতা',
    '📶 নেটওয়ার্ক হালকা ধীর',
  ];

  const quickTagsEn = [
    '🔊 Clear Audio',
    '📹 Crystal HD Video',
    '⚡ Smooth Connection',
    '🌸 Friendly Host',
    '💖 Great Experience',
    '📶 Network Slight Lag',
  ];

  const tags = lang === 'bn' ? quickTagsBn : quickTagsEn;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const ratingDescriptionsBn: Record<number, string> = {
    1: 'খারাপ সংযোগ ও কোয়ালিটি',
    2: 'চলনসই / কিছুটা অসুবিধা',
    3: 'ভালো কল অভিজ্ঞতা',
    4: 'খুব ভালো ও স্পষ্ট কল',
    5: 'অসাধারণ ক্রিস্টাল ক্লিয়ার এইচডি কোয়ালিটি! 🌟',
  };

  const ratingDescriptionsEn: Record<number, string> = {
    1: 'Poor connection quality',
    2: 'Fair / Minor interruptions',
    3: 'Good call experience',
    4: 'Very good & clear quality',
    5: 'Outstanding Crystal HD Quality! 🌟',
  };

  const ratingDesc =
    lang === 'bn' ? ratingDescriptionsBn : ratingDescriptionsEn;

  const activeStars = hoverRating || selectedRating;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCommentParts = [
      ...selectedTags,
      ...(comment.trim() ? [comment.trim()] : []),
    ];
    const finalFeedback = finalCommentParts.join(' • ');

    setIsSubmitted(true);
    setTimeout(() => {
      onSubmit(selectedRating, finalFeedback);
    }, 500);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-md bg-gradient-to-b from-slate-900 via-[#101720] to-slate-950 border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="text-center space-y-1 relative">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-emerald-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center mx-auto mb-2 shadow-lg">
            <Sparkles className="w-7 h-7 text-amber-400 animate-pulse" />
          </div>
          <h3 className="text-lg font-black text-white tracking-tight flex items-center justify-center gap-1.5">
            <span>{lang === 'bn' ? 'কল সম্পন্ন হয়েছে!' : 'Call Completed!'}</span>
          </h3>
          <p className="text-xs text-slate-400">
            {lang === 'bn'
              ? 'ভয়েস / ভিডিও কল কোয়ালিটি ৫ স্টারে রেটিং দিন'
              : 'Rate voice & video call quality out of 5 stars'}
          </p>
        </div>

        {/* Call Summary Card */}
        <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 font-bold border border-slate-700 shrink-0">
              {callLog.type === 'VIDEO' ? (
                <Video className="w-5 h-5 text-teal-400" />
              ) : (
                <Phone className="w-5 h-5 text-emerald-400" />
              )}
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-white truncate">
                {callLog.receiverName}
              </h4>
              <p className="text-[11px] text-slate-400 font-mono truncate">
                @{callLog.receiverUsername}
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono shrink-0">
            <div className="text-slate-300 font-bold">
              {formatDuration(callLog.durationSeconds)}
            </div>
            <div className="text-amber-400 text-[11px] font-bold">
              {callLog.creditsCharged} cr
            </div>
          </div>
        </div>

        {/* 5-STAR RATING SELECTOR */}
        <div className="space-y-2 text-center py-1">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            {lang === 'bn' ? 'কলের মান কেমন ছিল?' : 'How was the call quality?'}
          </label>

          <div className="flex items-center justify-center gap-2.5 sm:gap-3 py-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isFilled = star <= activeStars;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setSelectedRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="p-1 sm:p-1.5 rounded-xl transition-transform transform hover:scale-125 active:scale-95 focus:outline-none"
                  aria-label={`${star} star`}
                >
                  <Star
                    className={`w-8 h-8 sm:w-9 sm:h-9 transition-colors ${
                      isFilled
                        ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]'
                        : 'text-slate-600 hover:text-slate-400'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Rating Description Label */}
          <div className="h-5">
            <p className="text-xs font-bold text-amber-400 animate-in fade-in">
              {ratingDesc[activeStars] || ''}
            </p>
          </div>
        </div>

        {/* QUICK FEEDBACK TAGS */}
        <div className="space-y-2">
          <label className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {lang === 'bn'
                ? 'দ্রুত ফিডব্যাক ট্যাগ নির্বাচন করুন:'
                : 'Select quick feedback tags:'}
            </span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`py-1 px-2.5 rounded-xl text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300 shadow-sm'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* OPTIONAL COMMENTS */}
        <div>
          <label className="text-[11px] font-semibold text-slate-400 block mb-1">
            {lang === 'bn'
              ? 'অতিরিক্ত মন্তব্য (ঐচ্ছিক):'
              : 'Additional Comments (Optional):'}
          </label>
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={
              lang === 'bn'
                ? 'যেমন: অডিও দারুণ ছিল, কোনো ল্যাগ ছিল না...'
                : 'e.g., Audio was crystal clear, no lag...'
            }
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs font-semibold transition-colors"
          >
            {lang === 'bn' ? 'এড়িয়ে যান' : 'Skip'}
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitted}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-[0.99]"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {isSubmitted
                ? lang === 'bn'
                  ? 'সংরক্ষিত হচ্ছে...'
                  : 'Saving...'
                : lang === 'bn'
                ? `${selectedRating} স্টার রেটিং জমা দিন`
                : `Submit ${selectedRating}-Star Rating`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
