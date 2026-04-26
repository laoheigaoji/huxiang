import { Author, Prediction, HistoryItem } from './types';

export const MOCK_AUTHORS: Author[] = [
  { id: '1', name: '狩猎者', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100', fans: 2450, recentRecord: '近10红8', streak: 8, isHot: true },
  { id: '2', name: '一路游', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', fans: 673, recentRecord: '近9红7', streak: 7, isHot: true },
  { id: '3', name: '高效资深', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', fans: 1245, recentRecord: '近9红7', streak: 7 },
  { id: '4', name: '大理发', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', fans: 890, recentRecord: '近10红7', streak: 7 },
  { id: '5', name: '飞哥', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', fans: 7586, recentRecord: '近10红7', streak: 7 },
  { id: '6', name: '小明子', avatar: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=100', fans: 1560, recentRecord: '近10红7', streak: 7 },
  { id: '7', name: '李李', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', fans: 2100, recentRecord: '近10红7', streak: 7 },
  { id: '8', name: '浪子能', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', fans: 724, recentRecord: '近9红6', streak: 6 },
  { id: '9', name: '凤凰丽', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', fans: 1205, recentRecord: '近8红5', streak: 5 },
  { id: '10', name: '忆江南', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100', fans: 3100, recentRecord: '近10红6', streak: 6 },
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
