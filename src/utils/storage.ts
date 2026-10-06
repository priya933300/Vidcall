import { User, RechargePlan, RechargeRequest, CashoutRequest, CallLog, ChatMessage, Gift, SystemAnnouncement, SignupBonusOffer } from '../types';
import { generateSvgAvatar, generateGalleryPhoto } from './avatars';

export const UPI_ID = 'gpay-12200991834@okbizaxis';

export const RECHARGE_PLANS: RechargePlan[] = [
  { inr: 50, credits: 100, bonusText: 'স্ট্যান্ডার্ড প্যাক' },
  { inr: 100, credits: 220, bonusText: '+10% বোনাস ক্রেডিট', isPopular: true },
  { inr: 500, credits: 1200, bonusText: '+20% বোনাস ক্রেডিট' },
  { inr: 1000, credits: 2500, bonusText: '+25% মেগা অফার' },
];

export const GIFTS_CATALOG: Gift[] = [
  { id: 'rose', name: 'Rose', nameBn: 'গোলাপ', icon: '🌹', credits: 20 },
  { id: 'chocolate', name: 'Chocolate', nameBn: 'চকলেট', icon: '🍫', credits: 50 },
  { id: 'heart', name: 'Heart', nameBn: 'ভালোবাসা', icon: '💖', credits: 100 },
  { id: 'crown', name: 'Crown', nameBn: 'রয়েল ক্রাউন', icon: '👑', credits: 250 },
  { id: 'diamond', name: 'Diamond', nameBn: 'হীরক দ্যুতি', icon: '💎', credits: 500 },
];

const STORAGE_KEYS = {
  USERS: 'tc_users_v2',
  CURRENT_USER_ID: 'tc_current_user_id_v2',
  RECHARGES: 'tc_recharges_v2',
  CASHOUTS: 'tc_cashouts_v2',
  CALL_LOGS: 'tc_call_logs_v2',
  MESSAGES: 'tc_messages_v2',
  LANGUAGE: 'tc_language_v2',
  ANNOUNCEMENTS: 'tc_announcements_v2',
  SIGNUP_BONUS_OFFER: 'tc_signup_bonus_offer_v2',
};

function createInitialSignupBonusOffer(): SignupBonusOffer {
  return {
    isEnabled: false, // Default is OFF: "কোনো ইউজার ই sine up বোনাস পাবে না যতক্ষন না admin অফার দিচ্ছে"
    bonusCredits: 50,
    title: 'অ্যাডমিন স্পেশাল সাইন আপ বোনাস',
    updatedAt: '2026-02-01T00:00:00.000Z',
  };
}

function createInitialAnnouncements(): SystemAnnouncement[] {
  return [
    {
      id: 'ann_welcome',
      title: 'সিস্টেম নোটিশ ও মেগা বোনাস অফার',
      message: 'TalkConnect এ স্বাগতম! ইউপিআই রিচার্জে অতিরিক্ত বোনাস ক্রেডিট যুক্ত রয়েছে। যেকোনো সমস্যায় বা রিচার্জ সহায়তায় অ্যাডমিনকে ফ্রি কল করুন।',
      type: 'OFFER',
      priority: 'HIGH',
      senderId: 'usr_admin1',
      senderUsername: 'IMRAN',
      createdAt: '2026-02-01T10:00:00.000Z',
      isActive: true,
    },
  ];
}

// Seed initial users
function createInitialUsers(): User[] {
  const priyaGallery = Array.from({ length: 10 }, (_, i) => generateGalleryPhoto('Priya Sen', i));
  const nehaGallery = Array.from({ length: 10 }, (_, i) => generateGalleryPhoto('Neha Roy', i));
  const ananyaGallery = Array.from({ length: 10 }, (_, i) => generateGalleryPhoto('Ananya Das', i));

  return [
    {
      id: 'usr_superadmin',
      username: 'MALEK',
      name: 'Malek (Super Admin)',
      role: 'SUPER_ADMIN',
      password: 'imrantarafdar',
      credits: 999999,
      avatar: generateSvgAvatar('Malek', 'SUPER_ADMIN', 0),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      voiceRate: 0,
      videoRate: 0,
      createdAt: '2026-01-01T00:00:00.000Z',
      bio: 'সম্পুর্ন সিস্টেমের নিয়ন্ত্রক ও প্ল্যাটফর্ম প্রধান',
    },
    {
      id: 'usr_admin1',
      username: 'IMRAN',
      name: 'Imran (Admin)',
      role: 'ADMIN',
      password: 'mouimranbaby',
      credits: 50000,
      avatar: generateSvgAvatar('Imran', 'ADMIN', 1),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      voiceRate: 0,
      videoRate: 0,
      permissions: {
        canManageCredits: true,
        canManageUsers: true,
        canManagePhotos: true,
        canApproveRecharge: true,
        canProcessCashout: true,
      },
      createdAt: '2026-01-02T00:00:00.000Z',
      bio: '২৪/৭ ইউজার ও রিচার্জ সাপোর্ট অ্যাডমিন',
    },
    {
      id: 'usr_fx1',
      username: 'priya_fx',
      name: 'Priya Sen',
      role: 'FX_USER',
      password: 'priya123',
      credits: 450, // accumulated earned credits in wallet
      avatar: generateSvgAvatar('Priya Sen', 'FX_USER', 2),
      gallery: priyaGallery,
      isOnline: true,
      isSuspended: false,
      voiceRate: 20, // 20 credits per min
      videoRate: 40, // 40 credits per min
      bio: 'কলকাতা · গান ও আড্ডা দিতে ভালোবাসি 🌸 কল করুন!',
      payoutUpiId: 'priyasen@oksbi',
      createdAt: '2026-01-05T00:00:00.000Z',
    },
    {
      id: 'usr_fx2',
      username: 'neha_fx',
      name: 'Neha Roy',
      role: 'FX_USER',
      password: 'neha123',
      credits: 620,
      avatar: generateSvgAvatar('Neha Roy', 'FX_USER', 3),
      gallery: nehaGallery,
      isOnline: true,
      isSuspended: false,
      voiceRate: 25,
      videoRate: 50,
      bio: 'মডেল ও ক্রিয়েটর ✨ মিষ্টি কথা ও বন্ধুত্ব করতে কল করুন!',
      payoutUpiId: 'neharoy@okaxis',
      createdAt: '2026-01-06T00:00:00.000Z',
    },
    {
      id: 'usr_fx3',
      username: 'ananya_fx',
      name: 'Ananya Das',
      role: 'FX_USER',
      password: 'ananya123',
      credits: 310,
      avatar: generateSvgAvatar('Ananya Das', 'FX_USER', 4),
      gallery: ananyaGallery,
      isOnline: false,
      isSuspended: false,
      voiceRate: 15,
      videoRate: 30,
      bio: 'আর্টিস্ট ও ট্রাভেলার 🎨 কথা বলে মন ভালো করুন!',
      payoutUpiId: 'ananyadas@paytm',
      createdAt: '2026-01-07T00:00:00.000Z',
    },
    {
      id: 'usr_mx1',
      username: 'rahul01', // Alphanumeric 4-8 chars
      name: 'Rahul Ghosh',
      role: 'MX_USER',
      password: 'user123',
      credits: 220, // Has balance for 11 mins voice or 5.5 mins video
      avatar: generateSvgAvatar('Rahul Ghosh', 'MX_USER', 5),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      voiceRate: 0,
      videoRate: 0,
      createdAt: '2026-01-10T00:00:00.000Z',
      bio: 'নতুন সদস্য',
    },
    {
      id: 'usr_mx2',
      username: 'arjun88', // Alphanumeric 4-8 chars
      name: 'Arjun Das',
      role: 'MX_USER',
      password: 'user123',
      credits: 0, // 0 balance to test free admin call & recharge requirement
      avatar: generateSvgAvatar('Arjun Das', 'MX_USER', 0),
      gallery: [],
      isOnline: true,
      isSuspended: false,
      voiceRate: 0,
      videoRate: 0,
      createdAt: '2026-01-12T00:00:00.000Z',
      bio: 'রিচার্জের অপেক্ষায়',
    },
  ];
}

// Initial Messages
function createInitialMessages(): ChatMessage[] {
  return [
    {
      id: 'msg_1',
      senderId: 'usr_admin1',
      senderUsername: 'admin_joy',
      senderRole: 'ADMIN',
      receiverId: 'usr_mx1',
      receiverUsername: 'rahul01',
      text: 'TalkConnect এ স্বাগতম! কোনো সমস্যায় বা ব্যালেন্স রিচার্জের সহায়তায় যে কোনো সময় মেসেজ বা ফ্রি কল করুন।',
      timestamp: '2026-02-01T10:00:00.000Z',
      isRead: true,
    },
    {
      id: 'msg_2',
      senderId: 'usr_fx1',
      senderUsername: 'priya_fx',
      senderRole: 'FX_USER',
      receiverId: 'usr_mx1',
      receiverUsername: 'rahul01',
      text: 'হ্যালো রাহুল! আমি এখন লাইভ আছি, ভয়েস বা ভিডিয়ো কল করতে পারেন 🌸',
      timestamp: '2026-02-01T10:15:00.000Z',
      isRead: true,
    },
  ];
}

// Initial Call Logs
function createInitialCallLogs(): CallLog[] {
  return [
    {
      id: 'call_1',
      callerId: 'usr_mx1',
      callerName: 'Rahul Ghosh',
      callerUsername: 'rahul01',
      callerRole: 'MX_USER',
      receiverId: 'usr_fx1',
      receiverName: 'Priya Sen',
      receiverUsername: 'priya_fx',
      receiverRole: 'FX_USER',
      type: 'VOICE',
      durationSeconds: 120,
      creditsCharged: 40,
      startedAt: '2026-02-01T11:00:00.000Z',
      endedAt: '2026-02-01T11:02:00.000Z',
      status: 'COMPLETED',
    },
  ];
}

export const storage = {
  getUsers(): User[] {
    const raw = localStorage.getItem(STORAGE_KEYS.USERS);
    let parsed: User[];
    if (!raw) {
      parsed = createInitialUsers();
    } else {
      try {
        parsed = JSON.parse(raw);
      } catch {
        parsed = createInitialUsers();
      }
    }

    // Ensure Super Admin MALEK with password imrantarafdar is always configured
    const malekIdx = parsed.findIndex(
      (u) => u.username.toUpperCase() === 'MALEK' || u.role === 'SUPER_ADMIN' || u.id === 'usr_superadmin'
    );
    if (malekIdx !== -1) {
      parsed[malekIdx] = {
        ...parsed[malekIdx],
        username: 'MALEK',
        name: 'Malek (Super Admin)',
        role: 'SUPER_ADMIN',
        password: 'imrantarafdar',
      };
    } else {
      parsed.unshift({
        id: 'usr_superadmin',
        username: 'MALEK',
        name: 'Malek (Super Admin)',
        role: 'SUPER_ADMIN',
        password: 'imrantarafdar',
        credits: 999999,
        avatar: generateSvgAvatar('Malek', 'SUPER_ADMIN', 0),
        gallery: [],
        isOnline: true,
        isSuspended: false,
        voiceRate: 0,
        videoRate: 0,
        createdAt: '2026-01-01T00:00:00.000Z',
        bio: 'সম্পুর্ন সিস্টেমের নিয়ন্ত্রক ও প্ল্যাটফর্ম প্রধান',
      });
    }

    // Ensure Admin IMRAN with password mouimranbaby is always configured
    const imranIdx = parsed.findIndex(
      (u) => u.username.toUpperCase() === 'IMRAN' || u.id === 'usr_admin1'
    );
    if (imranIdx !== -1) {
      parsed[imranIdx] = {
        ...parsed[imranIdx],
        username: 'IMRAN',
        name: 'Imran (Admin)',
        role: 'ADMIN',
        password: 'mouimranbaby',
        permissions: {
          canManageCredits: true,
          canManageUsers: true,
          canManagePhotos: true,
          canApproveRecharge: true,
          canProcessCashout: true,
        },
      };
    } else {
      parsed.push({
        id: 'usr_admin1',
        username: 'IMRAN',
        name: 'Imran (Admin)',
        role: 'ADMIN',
        password: 'mouimranbaby',
        credits: 50000,
        avatar: generateSvgAvatar('Imran', 'ADMIN', 1),
        gallery: [],
        isOnline: true,
        isSuspended: false,
        voiceRate: 0,
        videoRate: 0,
        permissions: {
          canManageCredits: true,
          canManageUsers: true,
          canManagePhotos: true,
          canApproveRecharge: true,
          canProcessCashout: true,
        },
        createdAt: '2026-01-02T00:00:00.000Z',
        bio: '২৪/৭ ইউজার ও রিচার্জ সাপোর্ট অ্যাডমিন',
      });
    }

    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
    return parsed;
  },

  saveUsers(users: User[]) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.broadcast({ type: 'USERS_UPDATED' });
  },

  getCurrentUser(): User | null {
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const users = this.getUsers();
    if (!currentId) {
      // Default to rahul01 (MX_USER) for instant interactive experience
      const defaultUser = users.find((u) => u.username === 'rahul01') || users[0];
      if (defaultUser) {
        this.setCurrentUser(defaultUser.id);
        return defaultUser;
      }
      return null;
    }
    return users.find((u) => u.id === currentId) || users[0] || null;
  },

  setCurrentUser(userId: string) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    this.broadcast({ type: 'USER_SWITCHED', userId });
  },

  updateUser(updated: User) {
    const users = this.getUsers().map((u) => (u.id === updated.id ? updated : u));
    this.saveUsers(users);
  },

  getRechargeRequests(): RechargeRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RECHARGES);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveRechargeRequests(reqs: RechargeRequest[]) {
    localStorage.setItem(STORAGE_KEYS.RECHARGES, JSON.stringify(reqs));
    this.broadcast({ type: 'RECHARGES_UPDATED' });
  },

  addRechargeRequest(req: RechargeRequest) {
    const reqs = [req, ...this.getRechargeRequests()];
    this.saveRechargeRequests(reqs);
  },

  getCashoutRequests(): CashoutRequest[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CASHOUTS);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCashoutRequests(reqs: CashoutRequest[]) {
    localStorage.setItem(STORAGE_KEYS.CASHOUTS, JSON.stringify(reqs));
    this.broadcast({ type: 'CASHOUTS_UPDATED' });
  },

  addCashoutRequest(req: CashoutRequest) {
    const reqs = [req, ...this.getCashoutRequests()];
    this.saveCashoutRequests(reqs);
  },

  getCallLogs(): CallLog[] {
    const raw = localStorage.getItem(STORAGE_KEYS.CALL_LOGS);
    if (!raw) {
      const initLogs = createInitialCallLogs();
      this.saveCallLogs(initLogs);
      return initLogs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveCallLogs(logs: CallLog[]) {
    localStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(logs));
    this.broadcast({ type: 'CALL_LOGS_UPDATED' });
  },

  addCallLog(log: CallLog) {
    const logs = [log, ...this.getCallLogs()];
    this.saveCallLogs(logs);
  },

  rateCallLog(callId: string, rating: number, comment?: string) {
    const logs = this.getCallLogs().map((l) =>
      l.id === callId
        ? {
            ...l,
            rating: Math.max(1, Math.min(5, Math.round(rating))),
            ratingComment: comment?.trim() || l.ratingComment,
            ratedAt: new Date().toISOString(),
          }
        : l
    );
    this.saveCallLogs(logs);
  },

  getMessages(): ChatMessage[] {
    const raw = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    if (!raw) {
      const initMsgs = createInitialMessages();
      this.saveMessages(initMsgs);
      return initMsgs;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveMessages(msgs: ChatMessage[]) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(msgs));
    this.broadcast({ type: 'MESSAGES_UPDATED' });
  },

  addMessage(msg: ChatMessage) {
    const msgs = [...this.getMessages(), msg];
    this.saveMessages(msgs);
  },

  getLanguage(): 'bn' | 'en' {
    return (localStorage.getItem(STORAGE_KEYS.LANGUAGE) as 'bn' | 'en') || 'bn';
  },

  setLanguage(lang: 'bn' | 'en') {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, lang);
    this.broadcast({ type: 'LANGUAGE_UPDATED', lang });
  },

  getAnnouncements(): SystemAnnouncement[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
    if (!raw) {
      const init = createInitialAnnouncements();
      this.saveAnnouncements(init);
      return init;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  },

  saveAnnouncements(list: SystemAnnouncement[]) {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
    this.broadcast({ type: 'ANNOUNCEMENTS_UPDATED' });
  },

  addAnnouncement(ann: SystemAnnouncement) {
    const list = [ann, ...this.getAnnouncements()];
    this.saveAnnouncements(list);
  },

  deleteAnnouncement(id: string) {
    const list = this.getAnnouncements().filter((a) => a.id !== id);
    this.saveAnnouncements(list);
  },

  toggleAnnouncement(id: string) {
    const list = this.getAnnouncements().map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    this.saveAnnouncements(list);
  },

  deleteUser(userId: string) {
    // Protect core superadmin and admin accounts from deletion
    if (userId === 'usr_superadmin' || userId === 'usr_admin1') {
      return false;
    }
    const list = this.getUsers().filter((u) => u.id !== userId);
    this.saveUsers(list);

    // If current logged-in user was deleted, switch back to admin or default
    const currentId = localStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    if (currentId === userId) {
      const fallback = list.find((u) => u.role === 'ADMIN') || list[0];
      if (fallback) {
        this.setCurrentUser(fallback.id);
      }
    }
    return true;
  },

  toggleUserPause(userId: string) {
    const list = this.getUsers().map((u) =>
      u.id === userId ? { ...u, isPaused: !u.isPaused } : u
    );
    this.saveUsers(list);
  },

  setUserPause(userId: string, isPaused: boolean) {
    const list = this.getUsers().map((u) =>
      u.id === userId ? { ...u, isPaused } : u
    );
    this.saveUsers(list);
  },

  toggleUserLive(userId: string) {
    const list = this.getUsers().map((u) =>
      u.id === userId
        ? {
            ...u,
            isLive: !u.isLive,
            isOnline: !u.isLive,
            // When going live, unpause and unsuspend if desired
            isPaused: !u.isLive ? false : u.isPaused,
          }
        : u
    );
    this.saveUsers(list);
  },

  setUserLive(userId: string, isLive: boolean) {
    const list = this.getUsers().map((u) =>
      u.id === userId
        ? {
            ...u,
            isLive,
            isOnline: isLive,
            isPaused: isLive ? false : u.isPaused,
          }
        : u
    );
    this.saveUsers(list);
  },

  setUserSuspension(userId: string, isSuspended: boolean) {
    const list = this.getUsers().map((u) =>
      u.id === userId ? { ...u, isSuspended } : u
    );
    this.saveUsers(list);
  },

  getSignupBonusOffer(): SignupBonusOffer {
    const raw = localStorage.getItem(STORAGE_KEYS.SIGNUP_BONUS_OFFER);
    if (!raw) {
      const init = createInitialSignupBonusOffer();
      this.saveSignupBonusOffer(init);
      return init;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return createInitialSignupBonusOffer();
    }
  },

  saveSignupBonusOffer(offer: SignupBonusOffer) {
    localStorage.setItem(STORAGE_KEYS.SIGNUP_BONUS_OFFER, JSON.stringify(offer));
    this.broadcast({ type: 'SIGNUP_BONUS_UPDATED', offer });
  },

  toggleSignupBonusOffer(enabled?: boolean, amount?: number, title?: string): SignupBonusOffer {
    const current = this.getSignupBonusOffer();
    const next: SignupBonusOffer = {
      ...current,
      isEnabled: enabled !== undefined ? enabled : !current.isEnabled,
      bonusCredits: amount !== undefined ? amount : current.bonusCredits,
      title: title || current.title,
      updatedAt: new Date().toISOString(),
    };
    this.saveSignupBonusOffer(next);
    return next;
  },

  // Cross-tab broadcast channel
  broadcast(data: Record<string, unknown>) {
    try {
      if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('tc_event_channel');
        bc.postMessage(data);
        bc.close();
      }
    } catch (e) {
      console.warn('BroadcastChannel error', e);
    }
  },
};
