import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Phone,
  Video,
  Send,
  Image as ImageIcon,
  CheckCheck,
  ShieldAlert,
  X,
} from 'lucide-react';
import { User, ChatMessage } from '../types';
import { storage } from '../utils/storage';
import { soundFX } from '../utils/audio';

interface ChatScreenProps {
  currentUser: User;
  partner: User;
  onBack: () => void;
  onInitiateCall: (partner: User, type: 'VOICE' | 'VIDEO') => void;
  onOpenProfile?: (user: User) => void;
  lang: 'bn' | 'en';
}

export const ChatScreen: React.FC<ChatScreenProps> = ({
  currentUser,
  partner,
  onBack,
  onInitiateCall,
  onOpenProfile,
  lang,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const loadMessages = () => {
    const all = storage.getMessages();
    const thread = all.filter(
      (m) =>
        (m.senderId === currentUser.id && m.receiverId === partner.id) ||
        (m.senderId === partner.id && m.receiverId === currentUser.id)
    );
    setMessages(thread);
  };

  useEffect(() => {
    loadMessages();
    const interval = window.setInterval(loadMessages, 1500);
    return () => clearInterval(interval);
  }, [currentUser.id, partner.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedPhoto) return;

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      senderId: currentUser.id,
      senderUsername: currentUser.username,
      senderRole: currentUser.role,
      receiverId: partner.id,
      receiverUsername: partner.username,
      text: inputText.trim() || undefined,
      photoUrl: selectedPhoto || undefined,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    storage.addMessage(newMsg);
    soundFX.playMessageSent();
    setInputText('');
    setSelectedPhoto(null);
    loadMessages();
  };

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formatMessageTime = (iso: string) => {
    try {
      const date = new Date(iso);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0B141A] text-slate-100 relative">
      {/* WhatsApp Header */}
      <div className="h-16 px-4 bg-[#202C33] border-b border-[#2A3942] flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div
            onClick={() => onOpenProfile && onOpenProfile(partner)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative">
              <img
                src={partner.avatar}
                alt={partner.name}
                className="w-10 h-10 rounded-full object-cover border border-emerald-500/50"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#202C33] ${
                  partner.isOnline ? 'bg-emerald-500' : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-100 group-hover:text-emerald-400 transition-colors">
                {partner.name}
              </h3>
              <p className="text-[11px] text-emerald-400">
                {partner.isOnline
                  ? lang === 'bn'
                    ? 'অনলাইন'
                    : 'online'
                  : lang === 'bn'
                  ? 'অফলাইন'
                  : 'offline'}
                {partner.role === 'FX_USER' && ` · ${partner.voiceRate} cr/min`}
              </p>
            </div>
          </div>
        </div>

        {/* Call Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onInitiateCall(partner, 'VOICE')}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition-all"
            title={lang === 'bn' ? 'ভয়েস কল করুন' : 'Voice Call'}
          >
            <Phone className="w-5 h-5" />
          </button>
          <button
            onClick={() => onInitiateCall(partner, 'VIDEO')}
            className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-emerald-400 active:scale-95 transition-all"
            title={lang === 'bn' ? 'ভিডিয়ো কল করুন' : 'Video Call'}
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Security Immutability Notice Bar */}
      <div className="bg-[#182229] py-1.5 px-3 border-b border-[#222E35] flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <ShieldAlert className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>
          {lang === 'bn'
            ? 'সুরক্ষিত চ্যাট: নিয়ম অনুসারে কোনো মেসেজ ডিলিট বা এডিট করা যায় না।'
            : 'Secure Chat: Messages are permanent and cannot be edited or deleted.'}
        </span>
      </div>

      {/* Messages Feed (WhatsApp Styled Doodle Backdrop) */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `radial-gradient(#202C33 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
        }}
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
            <p className="text-xs">
              {lang === 'bn'
                ? 'এখনো কোনো মেসেজ নেই। কথা শুরু করতে নিচে লিখুন বা কল করুন।'
                : 'No messages yet. Send a message or start a call.'}
            </p>
          </div>
        ) : (
          messages.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} animate-in fade-in duration-150`}
              >
                <div
                  className={`max-w-[75%] sm:max-w-md rounded-2xl px-3.5 py-2 text-xs shadow-md break-words ${
                    isMe
                      ? 'bg-[#005C4B] text-slate-100 rounded-tr-xs'
                      : 'bg-[#202C33] text-slate-100 rounded-tl-xs'
                  }`}
                >
                  {/* Photo if present */}
                  {msg.photoUrl && (
                    <div
                      onClick={() => setLightboxPhoto(msg.photoUrl || null)}
                      className="mb-1.5 rounded-xl overflow-hidden cursor-pointer group border border-black/20"
                    >
                      <img
                        src={msg.photoUrl}
                        alt="Shared Photo"
                        className="max-h-60 w-full object-cover group-hover:opacity-90 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Text */}
                  {msg.text && <p className="leading-relaxed text-[13px]">{msg.text}</p>}

                  {/* Time & Double Tick */}
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] text-slate-400">
                    <span>{formatMessageTime(msg.timestamp)}</span>
                    {isMe && <CheckCheck className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Selected Photo Preview before sending */}
      {selectedPhoto && (
        <div className="p-3 bg-[#202C33] border-t border-[#2A3942] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={selectedPhoto}
              alt="Preview"
              className="w-14 h-14 rounded-xl object-cover border border-emerald-500"
            />
            <span className="text-xs text-slate-300">
              {lang === 'bn' ? 'ছবি যুক্ত হয়েছে' : 'Photo attached'}
            </span>
          </div>
          <button
            onClick={() => setSelectedPhoto(null)}
            className="w-7 h-7 rounded-full bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Bottom Message Input Bar */}
      <form
        onSubmit={handleSend}
        className="p-3 bg-[#202C33] border-t border-[#2A3942] flex items-center gap-2 shrink-0"
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          className="hidden"
          onChange={handlePhotoSelect}
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-emerald-400 transition-colors shrink-0"
          title={lang === 'bn' ? 'ছবি সংযুক্ত করুন' : 'Attach Photo'}
        >
          <ImageIcon className="w-5 h-5" />
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            lang === 'bn' ? 'একটি মেসেজ লিখুন...' : 'Type a message...'
          }
          className="flex-1 bg-[#2A3942] text-slate-100 placeholder-slate-400 text-xs sm:text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />

        <button
          type="submit"
          disabled={!inputText.trim() && !selectedPhoto}
          className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white flex items-center justify-center transition-all shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Lightbox Modal */}
      {lightboxPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute -top-10 right-0 text-white text-xs bg-slate-800 px-3 py-1 rounded-full"
            >
              ✕ {lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
            </button>
            <img
              src={lightboxPhoto}
              alt="Full view"
              className="w-full rounded-2xl max-h-[80vh] object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
