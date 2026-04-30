import { LucideIcon } from 'lucide-react';

export interface Author {
  id: string;
  name: string;
  avatar: string;
  fans: number;
  recentRecord: string; // e.g. "近9红6"
  streak: number; // e.g. 2
  history?: ('红' | '黑')[];
  isHot?: boolean;
  accuracy?: string;
}

export interface Prediction {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorFans: number;
  authorRecentRecord: string;
  authorStreak: number;
  period: string; // 第116期
  title: string;
  contentTitle: string;
  tags: string[];
  price: number;
  isFree: boolean;
  countdown?: string;
  unlockAt?: string;
  unlockDuration?: string;
  time: string;
  viewCount: number;
  isHot?: boolean;
  content?: string;
  updatedAt?: string;
  isUnlocked?: boolean;
  result?: '红' | '黑';
  mainPicks?: number[];
  orderId?: string;
}

export interface SiteSettings {
  id: string;
  siteName: string;
  announcement: string;
  contactEmail: string;
  defaultUnlockDuration: string; // HH:MM:SS string
  authorCommissionRate?: number;
  inviteCommissionRate?: number;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  nickname: string;
  avatar: string;
  balance: number;
  wechatOpenId?: string;
  following: string[];
  purchased: string[];
  isAuthor?: boolean;
  authorId?: string;
  totalEarnings?: number;
  referrerId?: string;
  totalInvitedEarnings?: number;
  createdAt?: string;
}

export interface HistoryItem {
  id: string;
  authorId?: string;
  period: string;
  result: 'red' | 'black';
  type: string; // 全7位
  mainPick: string;
  numbers: string[];
  animals: string[];
  time: string;
  viewCount: number;
}

export interface Application {
  id: string;
  userId: string;
  username: string;
  realName: string;
  phone: string;
  idType: string;
  idNumber: string;
  hometown: string;
  specialty: string;
  description: string;
  photoFront?: string;
  photoBack?: string;
  status: 'pending' | 'approved' | 'rejected';
  time: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  account: string;
  bankName?: string;
  name: string;
  type: 'alipay' | 'bank';
  status: 'pending' | 'approved' | 'rejected';
  time: string;
}
