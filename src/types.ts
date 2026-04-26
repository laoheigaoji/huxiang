import { LucideIcon } from 'lucide-react';

export interface Author {
  id: string;
  name: string;
  avatar: string;
  fans: number;
  recentRecord: string; // e.g. "近9红6"
  streak: number; // e.g. 2
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
  time: string;
  viewCount: number;
  isHot?: boolean;
}

export interface HistoryItem {
  id: string;
  period: string;
  result: 'red' | 'black';
  type: string; // 全7位
  mainPick: string;
  numbers: string[];
  animals: string[];
  time: string;
  viewCount: number;
}
