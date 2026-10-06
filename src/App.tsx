/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, CallLog, SystemAnnouncement } from './types';
import { storage } from './utils/storage';
import { soundFX } from './utils/audio';
import { Navbar } from './components/Navbar';
import { HostListView } from './components/HostListView';
import { ChatListView } from './components/ChatListView';
import { ChatScreen } from './components/ChatScreen';
import { CallHistoryView } from './components/CallHistoryView';
import { WalletView } from './components/WalletView';
import { AdminPanel } from './components/AdminPanel';
import { SuperAdminPanel } from './components/SuperAdminPanel';
import { FXUserProfileModal } from './components/FXUserProfileModal';
import { FlashNotice } from './components/FlashNotice';
import { CallScreen } from './components/CallScreen';
import { IncomingCallModal } from './components/IncomingCallModal';
import { RechargeModal } from './components/RechargeModal';
import { SettingsModal } from './components/SettingsModal';
import { AuthModal } from './components/AuthModal';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { PostCallRatingModal } from './components/PostCallRatingModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => storage.getCurrentUser());
  const [users, setUsers] = useState<User[]>(() => storage.getUsers());
  const [announcements, setAnnouncements] = useState<SystemAnnouncement[]>(() => storage.getAnnouncements());
  const [lang, setLang] = useState<'bn' | 'en'>(() => storage.getLanguage());

  // Navigation
  const [activeTab, setActiveTab] = useState<'hosts' | 'chats' | 'calls' | 'wallet' | 'admin' | 'superadmin'>('hosts');

  // Modals & Active States
  const [selectedHostProfile, setSelectedHostProfile] = useState<User | null>(null);
  const [activeChatPartner, setActiveChatPartner] = useState<User | null>(null);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Post-call rating state for caller review
  const [ratingTargetCallLog, setRatingTargetCallLog] = useState<CallLog | null>(null);
  const [ratingSuccessToast, setRatingSuccessToast] = useState<string | null>(null);

  // Call Pipeline States
  // 1. Flash Notice (3-second duration preview before call)
  const [pendingCall, setPendingCall] = useState<{
    target: User;
    type: 'VOICE' | 'VIDEO';
    ratePerMinute: number;
    maxMinutes: number;
    maxSeconds: number;
  } | null>(null);

  // 2. Active Outgoing / In-Call screen
  const [activeCall, setActiveCall] = useState<{
    caller: User;
    receiver: User;
    type: 'VOICE' | 'VIDEO';
    ratePerMinute: number;
  } | null>(null);

  // 3. Incoming Call Modal (for simulated or cross-tab incoming call)
  const [incomingCall, setIncomingCall] = useState<{
    caller: User;
    type: 'VOICE' | 'VIDEO';
  } | null>(null);

  // Low balance warning modal
  const [lowBalanceAlert, setLowBalanceAlert] = useState<{
    rate: number;
    type: 'VOICE' | 'VIDEO';
  } | null>(null);

  // Refresh user data & broadcast listener
  const refreshData = () => {
    const updatedUsers = storage.getUsers();
    setUsers(updatedUsers);
    setAnnouncements(storage.getAnnouncements());
    if (currentUser) {
      const refreshedMe = updatedUsers.find((u) => u.id === currentUser.id);
      if (refreshedMe) setCurrentUser(refreshedMe);
    }
  };

  useEffect(() => {
    let bc: BroadcastChannel | null = null;
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        bc = new BroadcastChannel('tc_event_channel');
        bc.onmessage = (event) => {
          const data = event.data;
          if (
            data.type === 'USERS_UPDATED' ||
            data.type === 'RECHARGES_UPDATED' ||
            data.type === 'ANNOUNCEMENTS_UPDATED'
          ) {
            refreshData();
          } else if (data.type === 'INCOMING_CALL' && currentUser && data.receiverId === currentUser.id) {
            const callerUser = storage.getUsers().find((u) => u.id === data.callerId);
            if (callerUser) {
              setIncomingCall({ caller: callerUser, type: data.callType });
            }
          }
        };
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }

    return () => {
      bc?.close();
    };
  }, [currentUser]);

  const toggleLanguage = () => {
    const nextLang = lang === 'bn' ? 'en' : 'bn';
    setLang(nextLang);
    storage.setLanguage(nextLang);
  };

  // Triggered when MXUser clicks Voice or Video call to FXUser or Admin
  const handleInitiateCall = (target: User, type: 'VOICE' | 'VIDEO') => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    // Check if call to Admin -> FREE!
    const isFreeCall = target.role === 'ADMIN' || target.role === 'SUPER_ADMIN';
    const rate = isFreeCall ? 0 : type === 'VIDEO' ? target.videoRate || 40 : target.voiceRate || 20;

    if (!isFreeCall && currentUser.credits < rate) {
      setLowBalanceAlert({ rate, type });
      return;
    }

    // Calculate maximum duration
    const maxMinutes = rate > 0 ? Math.floor(currentUser.credits / rate) : 999;
    const maxSeconds = 0;

    // Prompt rule: "সেটা কল করার সময়ে তাৎক্ষণিক ফ্ল্যাশ ম্যাসেজ এ দেখিয়ে দেবে ৩ সেকেন্ডের জন্য"
    setPendingCall({
      target,
      type,
      ratePerMinute: rate,
      maxMinutes,
      maxSeconds,
    });

    if (selectedHostProfile) setSelectedHostProfile(null);
  };

  // Called after 3-second flash notice expires
  const handleStartActiveCallAfterFlash = () => {
    if (!pendingCall || !currentUser) return;

    setActiveCall({
      caller: currentUser,
      receiver: pendingCall.target,
      type: pendingCall.type,
      ratePerMinute: pendingCall.ratePerMinute,
    });

    // Broadcast incoming call to other tab if open
    storage.broadcast({
      type: 'INCOMING_CALL',
      callerId: currentUser.id,
      receiverId: pendingCall.target.id,
      callType: pendingCall.type,
    });

    setPendingCall(null);
  };

  const handleEndCall = (durationSeconds: number, creditsCharged: number, giftsTotal: number) => {
    if (!activeCall) return;

    // Save permanent immutable CallLog
    const newLog: CallLog = {
      id: `call_${Date.now()}`,
      callerId: activeCall.caller.id,
      callerName: activeCall.caller.name,
      callerUsername: activeCall.caller.username,
      callerRole: activeCall.caller.role,
      receiverId: activeCall.receiver.id,
      receiverName: activeCall.receiver.name,
      receiverUsername: activeCall.receiver.username,
      receiverRole: activeCall.receiver.role,
      type: activeCall.type,
      durationSeconds,
      creditsCharged,
      startedAt: new Date(Date.now() - durationSeconds * 1000).toISOString(),
      endedAt: new Date().toISOString(),
      giftsTotalCredits: giftsTotal,
      status: durationSeconds > 0 ? 'COMPLETED' : 'MISSED',
    };

    storage.addCallLog(newLog);
    setActiveCall(null);
    refreshData();

    // Trigger post-call 5-star rating modal for caller if call was completed
    if (durationSeconds > 0 && activeCall.caller.id === currentUser?.id) {
      setRatingTargetCallLog(newLog);
    }
  };

  const handleSubmitCallRating = (rating: number, comment?: string) => {
    if (ratingTargetCallLog) {
      storage.rateCallLog(ratingTargetCallLog.id, rating, comment);
      setRatingTargetCallLog(null);
      setRatingSuccessToast(
        lang === 'bn'
          ? `⭐ ধন্যবাদ! কলের জন্য ${rating} স্টার রেটিং সফলভাবে সংরক্ষিত হয়েছে।`
          : `⭐ Thank you! Your ${rating}-star rating has been recorded.`
      );
      setTimeout(() => setRatingSuccessToast(null), 4000);
      refreshData();
    }
  };

  // Handle incoming call acceptance
  const handleAcceptIncomingCall = () => {
    if (!incomingCall || !currentUser) return;
    setActiveCall({
      caller: incomingCall.caller,
      receiver: currentUser,
      type: incomingCall.type,
      ratePerMinute:
        incomingCall.type === 'VIDEO' ? currentUser.videoRate || 40 : currentUser.voiceRate || 20,
    });
    setIncomingCall(null);
  };

  const handleDeclineIncomingCall = () => {
    if (incomingCall && currentUser) {
      storage.addCallLog({
        id: `call_declined_${Date.now()}`,
        callerId: incomingCall.caller.id,
        callerName: incomingCall.caller.name,
        callerUsername: incomingCall.caller.username,
        callerRole: incomingCall.caller.role,
        receiverId: currentUser.id,
        receiverName: currentUser.name,
        receiverUsername: currentUser.username,
        receiverRole: currentUser.role,
        type: incomingCall.type,
        durationSeconds: 0,
        creditsCharged: 0,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        status: 'DECLINED',
      });
    }
    setIncomingCall(null);
  };

  const openAdminChatDirectly = () => {
    const admin = users.find((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') || users[1];
    if (admin) {
      setActiveChatPartner(admin);
    }
  };

  const callAdminDirectly = () => {
    const admin = users.find((u) => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN') || users[1];
    if (admin) {
      handleInitiateCall(admin, 'VOICE');
    }
  };

  const handleLogout = () => {
    storage.setCurrentUser('');
    setCurrentUser(null);
    setActiveChatPartner(null);
    setActiveCall(null);
    setPendingCall(null);
    setSelectedHostProfile(null);
    setShowSettingsModal(false);
    setShowRechargeModal(false);
    setShowAuthModal(true);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0B141A] flex items-center justify-center p-4">
        <AuthModal
          onSuccess={(u) => {
            setCurrentUser(u);
            refreshData();
          }}
          lang={lang}
        />
      </div>
    );
  }

  const appThemeClass =
    currentUser?.role === 'MX_USER'
      ? 'min-h-screen bg-[#08080a] text-amber-50 flex flex-col font-sans transition-colors duration-300'
      : currentUser?.role === 'FX_USER'
      ? 'min-h-screen bg-[#0d0812] text-pink-50 flex flex-col font-sans transition-colors duration-300'
      : 'min-h-screen bg-[#0B141A] text-slate-100 flex flex-col font-sans transition-colors duration-300';

  return (
    <div className={appThemeClass}>
      {/* 3-Zone Top Navigation */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenRecharge={() => setShowRechargeModal(true)}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenAuth={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        lang={lang}
        onToggleLang={toggleLanguage}
      />

      {/* System-wide Announcement Banner */}
      <AnnouncementBanner announcements={announcements} lang={lang} />

      {/* Main Body Routing */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Full Chat Screen Overlay if active thread selected */}
        {activeChatPartner ? (
          <div className="flex-1 flex flex-col h-[calc(100vh-64px)]">
            <ChatScreen
              currentUser={currentUser}
              partner={activeChatPartner}
              onBack={() => setActiveChatPartner(null)}
              onInitiateCall={handleInitiateCall}
              onOpenProfile={(p) => setSelectedHostProfile(p)}
              lang={lang}
            />
          </div>
        ) : (
          <>
            {activeTab === 'hosts' && (
              <HostListView
                currentUser={currentUser}
                users={users}
                onSelectHost={(host) => setSelectedHostProfile(host)}
                onInitiateCall={handleInitiateCall}
                onOpenChat={(target) => setActiveChatPartner(target)}
                onOpenRecharge={() => setShowRechargeModal(true)}
                lang={lang}
              />
            )}

            {activeTab === 'chats' && (
              <ChatListView
                currentUser={currentUser}
                onSelectChatPartner={(partner) => setActiveChatPartner(partner)}
                lang={lang}
              />
            )}

            {activeTab === 'calls' && (
              <CallHistoryView
                currentUser={currentUser}
                onInitiateCall={handleInitiateCall}
                lang={lang}
              />
            )}

            {activeTab === 'wallet' && (
              <WalletView
                currentUser={currentUser}
                onOpenRecharge={() => setShowRechargeModal(true)}
                onOpenSettings={() => setShowSettingsModal(true)}
                lang={lang}
              />
            )}

            {activeTab === 'admin' && (
              <AdminPanel currentUser={currentUser} onRefresh={refreshData} lang={lang} />
            )}

            {activeTab === 'superadmin' && (
              <SuperAdminPanel currentUser={currentUser} onRefresh={refreshData} lang={lang} />
            )}
          </>
        )}
      </main>

      {/* FX User Profile Modal (with up to 10 photos, call rates, talk time estimates) */}
      {selectedHostProfile && (
        <FXUserProfileModal
          user={selectedHostProfile}
          currentUserCredits={currentUser.credits}
          onClose={() => setSelectedHostProfile(null)}
          onInitiateCall={handleInitiateCall}
          onOpenChat={(target) => {
            setSelectedHostProfile(null);
            setActiveChatPartner(target);
          }}
          onOpenRecharge={() => {
            setSelectedHostProfile(null);
            setShowRechargeModal(true);
          }}
          lang={lang}
        />
      )}

      {/* 3-Second Flash Notice before Call */}
      {pendingCall && (
        <FlashNotice
          balance={currentUser.credits}
          ratePerMinute={pendingCall.ratePerMinute}
          maxMinutes={pendingCall.maxMinutes}
          maxSeconds={pendingCall.maxSeconds}
          onDismiss={handleStartActiveCallAfterFlash}
          lang={lang}
        />
      )}

      {/* Active Voice & Video Call Screen */}
      {activeCall && (
        <CallScreen
          caller={activeCall.caller}
          receiver={activeCall.receiver}
          type={activeCall.type}
          ratePerMinute={activeCall.ratePerMinute}
          onEndCall={handleEndCall}
          lang={lang}
        />
      )}

      {/* Incoming Call Ringing Modal */}
      {incomingCall && (
        <IncomingCallModal
          caller={incomingCall.caller}
          type={incomingCall.type}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
          lang={lang}
        />
      )}

      {/* UPI Recharge & QR Code Modal */}
      {showRechargeModal && (
        <RechargeModal
          currentUser={currentUser}
          onClose={() => setShowRechargeModal(false)}
          onOpenAdminChat={openAdminChatDirectly}
          onCallAdmin={callAdminDirectly}
          lang={lang}
        />
      )}

      {/* Settings Modal (Password, FX rates, cashout, gallery) */}
      {showSettingsModal && (
        <SettingsModal
          currentUser={currentUser}
          onClose={() => setShowSettingsModal(false)}
          onUpdateUser={(updated) => {
            setCurrentUser(updated);
            refreshData();
          }}
          onLogout={handleLogout}
          lang={lang}
        />
      )}

      {/* Auth / Role Switcher Modal */}
      {showAuthModal && (
        <AuthModal
          onSuccess={(u) => {
            setCurrentUser(u);
            setShowAuthModal(false);
            refreshData();
          }}
          onClose={() => setShowAuthModal(false)}
          lang={lang}
        />
      )}

      {/* Low Balance Warning Modal */}
      {lowBalanceAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-white">
              {lang === 'bn' ? 'পর্যাপ্ত ক্রেডিট নেই!' : 'Insufficient Balance!'}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {lang === 'bn'
                ? `এই ${lowBalanceAlert.type === 'VIDEO' ? 'ভিডিয়ো' : 'ভয়েস'} কলটি করতে প্রতি মিনিটে ${lowBalanceAlert.rate} ক্রেডিট প্রয়োজন। আপনার বর্তমান ব্যালেন্স: ${currentUser.credits} ক্রেডিট। অনুগ্রহ করে রিচার্জ করুন।`
                : `This call requires ${lowBalanceAlert.rate} cr/min. Your balance is ${currentUser.credits} credits. Please recharge.`}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setLowBalanceAlert(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setLowBalanceAlert(null);
                  setShowRechargeModal(true);
                }}
                className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-600/30"
              >
                {lang === 'bn' ? 'রিচার্জ করুন' : 'Recharge'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Post-Call 5-Star Rating Modal for Callers */}
      {ratingTargetCallLog && (
        <PostCallRatingModal
          callLog={ratingTargetCallLog}
          onClose={() => setRatingTargetCallLog(null)}
          onSubmit={handleSubmitCallRating}
          lang={lang}
        />
      )}

      {/* Rating Success Toast */}
      {ratingSuccessToast && (
        <div className="fixed bottom-16 sm:bottom-6 right-4 sm:right-6 z-50 p-4 rounded-2xl bg-slate-900 border border-amber-500/60 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-4 duration-300">
          <span>{ratingSuccessToast}</span>
        </div>
      )}
    </div>
  );
}
