export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'FX_USER' | 'MX_USER';

export interface AdminPermissions {
  canManageCredits: boolean;
  canManageUsers: boolean;
  canManagePhotos: boolean;
  canApproveRecharge: boolean;
  canProcessCashout: boolean;
}

export interface User {
  id: string;
  username: string; // MXUser must be alphanumeric 4-8 chars
  name: string;
  role: UserRole;
  password: string; // password protected & updateable
  credits: number; // For MXUser: balance to spend; For FXUser: earned balance in wallet
  avatar: string;
  gallery: string[]; // up to 10 photos
  isOnline: boolean;
  isSuspended: boolean;
  isPaused?: boolean; // POS / Paused state controlled by Admin
  isLive?: boolean; // Live broadcasting state controlled by Admin or host
  voiceRate: number; // credits/min for incoming voice calls (set by FXUser)
  videoRate: number; // credits/min for incoming video calls (set by FXUser)
  permissions?: AdminPermissions; // for ADMIN created by Super Admin
  bio?: string;
  payoutUpiId?: string;
  createdAt: string;
}

export interface SignupBonusOffer {
  isEnabled: boolean; // default false
  bonusCredits: number; // credits given upon registration if isEnabled
  title?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface RechargePlan {
  inr: number;
  credits: number;
  bonusText?: string;
  isPopular?: boolean;
}

export interface RechargeRequest {
  id: string;
  userId: string;
  username: string;
  amountInr: number;
  credits: number;
  utrNumber: string;
  senderUpiName: string;
  screenshotUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  processedBy?: string;
  notes?: string;
}

export interface CashoutRequest {
  id: string;
  userId: string;
  username: string;
  credits: number;
  amountInr: number;
  upiId: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  processedBy?: string;
}

export interface Gift {
  id: string;
  name: string;
  nameBn: string;
  icon: string;
  credits: number;
}

export interface GiftSent {
  id: string;
  giftId: string;
  giftName: string;
  icon: string;
  credits: number;
  timestamp: string;
}

export interface CallLog {
  id: string;
  callerId: string;
  callerName: string;
  callerUsername: string;
  callerRole: UserRole;
  receiverId: string;
  receiverName: string;
  receiverUsername: string;
  receiverRole: UserRole;
  type: 'VOICE' | 'VIDEO';
  durationSeconds: number;
  creditsCharged: number;
  startedAt: string;
  endedAt: string;
  giftsTotalCredits?: number;
  status: 'COMPLETED' | 'MISSED' | 'DECLINED';
  rating?: number; // 1 to 5 stars rated by caller
  ratingComment?: string; // Quality feedback tag or text comment
  ratedAt?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderRole: UserRole;
  receiverId: string;
  receiverUsername: string;
  text?: string;
  photoUrl?: string;
  timestamp: string;
  isRead: boolean;
}

export interface ActiveCallState {
  callId: string;
  caller: User;
  receiver: User;
  type: 'VOICE' | 'VIDEO';
  ratePerMinute: number;
  startTime: number;
  maxAllowedMinutes: number;
  status: 'RINGING' | 'CONNECTED' | 'ENDED';
}

export interface SystemAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'OFFER';
  priority: 'NORMAL' | 'HIGH' | 'URGENT';
  senderId: string;
  senderUsername: string;
  createdAt: string;
  isActive: boolean;
}

