import { Author, Prediction, HistoryItem } from './types';

export const MOCK_AUTHORS: Author[] = [
  { id: '1', name: '狩猎者', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=shoulie', fans: 2450, recentRecord: '近10红8', streak: 8, isHot: true },
  { id: '2', name: '一路游', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=yilu', fans: 673, recentRecord: '近9红7', streak: 4, isHot: true },
  { id: '3', name: '浪子能', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=langzi', fans: 724, recentRecord: '近9红6', streak: 2, isHot: true },
  { id: '4', name: '凤凰丽', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fenghuang', fans: 1205, recentRecord: '近8红5', streak: 1 },
  { id: '5', name: '娜娜姐', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=nana', fans: 3100, recentRecord: '近10红6', streak: 0 },
  { id: '6', name: '龙磊磊', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=long', fans: 1560, recentRecord: '近10红6', streak: 3 },
  { id: '7', name: '飞哥', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=feige', fans: 7586, recentRecord: '近30红19', streak: 1 },
];

export const MOCK_PREDICTIONS: Prediction[] = [
  {
    id: 'p1',
    authorId: '7',
    authorName: '飞哥',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=feige',
    authorFans: 7586,
    authorRecentRecord: '近30红19',
    authorStreak: 1,
    period: '第116期',
    title: '提供参考（每天免费）福利🎁',
    contentTitle: '【第116期】提供参考（每天免费）福利🎁',
    tags: ['免费'],
    price: 0,
    isFree: true,
    time: '2026-04-26 15:05',
    viewCount: 4412,
    isHot: true
  },
  {
    id: 'p2',
    authorId: '8',
    authorName: '奥迪小王',
    authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=audi',
    authorFans: 4305,
    authorRecentRecord: '近30红20',
    authorStreak: 0,
    period: '第116期',
    title: '自由资讯 推荐平特一肖',
    contentTitle: '【奥迪小王】第116期 自由资讯 推荐平特一肖',
    tags: [],
    price: 286,
    isFree: false,
    countdown: '01:25:42',
    time: '2026-04-26 15:20',
    viewCount: 3616
  }
];

export const MOCK_HISTORY: HistoryItem[] = [
  {
    id: 'h1',
    period: '第115期',
    result: 'black',
    type: '全7位',
    mainPick: '猴',
    numbers: ['21', '16', '25', '29', '08', '07', '04'],
    animals: ['狗', '兔', '马', '虎', '猪', '鼠', '兔'],
    time: '2026-04-25 12:31',
    viewCount: 9270
  },
  {
    id: 'h2',
    period: '第114期',
    result: 'black',
    type: '全7位',
    mainPick: '猴',
    numbers: ['45', '41', '10', '01', '36', '25', '30'],
    animals: ['狗', '虎', '鸡', '马', '羊', '马', '牛'],
    time: '2026-04-24 13:16',
    viewCount: 7391
  }
];
