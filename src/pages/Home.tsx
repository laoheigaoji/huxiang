import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Trophy, Pencil, User as UserIcon, X, ChevronRight, Check, ArrowLeftRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Author, Prediction } from '../types';
import JumpingNumber from '../components/JumpingNumber';

const SortIcon = ({ type, direction }: { type: string, direction?: 'up' | 'down' }) => {
  if (type === 'default') {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="flex flex-col space-y-[2px]">
          <div className="w-4 h-[2px] bg-[#b71c1c] rounded-full"></div>
          <div className="w-2 h-[2px] bg-[#b71c1c] rounded-full"></div>
          <div className="w-3 h-[2px] bg-[#b71c1c] rounded-full"></div>
        </div>
      </div>
    );
  }

  const color = direction === 'up' ? 'text-gray-800' : 'text-gray-800';
  
  return (
    <div className="w-10 h-10 flex items-center justify-center font-bold text-lg select-none">
       {type === 'hit' && <span className={color}>冲</span>}
       {type === 'streak' && <div className="flex items-baseline"><span className="text-xs mr-0.5">1</span><span className={color}>红</span></div>}
       {type === 'fans' && <div className="flex items-baseline"><span className="text-xs mr-0.5">1</span><span className={color}>R</span></div>}
       {type === 'views' && <div className="flex items-baseline"><span className="text-xs mr-0.5">1</span><span className={color}>👁️</span></div>}
    </div>
  );
};

const SortModal = ({ isOpen, onClose, selected, onSelect }: { isOpen: boolean, onClose: () => void, selected: string, onSelect: (id: string) => void }) => {
  const options = [
    { id: 'default', label: '默认排序', type: 'default', icon: <SlidersHorizontal className="w-6 h-6 text-[#b71c1c]" /> },
    { id: 'hit_desc', label: '命中率从高到低', type: 'hit', direction: 'down' },
    { id: 'streak_asc', label: '连红从低到高', type: 'streak', direction: 'up' },
    { id: 'streak_desc', label: '连红从高到低', type: 'streak', direction: 'down' },
    { id: 'fans_asc', label: '作者粉丝量从低到高', type: 'fans', direction: 'up' },
    { id: 'fans_desc', label: '作者粉丝量从高到低', type: 'fans', direction: 'down' },
    { id: 'views_asc', label: '查看率从低到高', type: 'views', direction: 'up' },
    { id: 'views_desc', label: '查看率从高到低', type: 'views', direction: 'down' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[24px] z-[70] overflow-hidden"
          >
            <div className="py-4">
              {options.map((opt) => (
                <div 
                  key={opt.id}
                  onClick={() => { onSelect(opt.id); onClose(); }}
                  className="flex items-center px-6 py-3.5 active:bg-gray-50 transition-colors"
                >
                  <div className="w-10 mr-4 flex justify-center">
                    {opt.id === 'default' ? (
                      <SlidersHorizontal className="w-6 h-6 text-[#b71c1c]" />
                    ) : (
                      <div className="font-bold text-[18px] text-gray-800 flex items-center">
                        {opt.type === 'hit' && <span>冲</span>}
                        {opt.type === 'streak' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="leading-none">红</span></div>}
                        {opt.type === 'fans' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="leading-none tracking-tighter">R</span></div>}
                        {opt.type === 'views' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="text-xl">👁️</span></div>}
                      </div>
                    )}
                  </div>
                  <span className={`flex-1 text-[16px] font-medium ${selected === opt.id ? 'text-[#b71c1c] font-bold' : 'text-gray-800'}`}>
                    {opt.label}
                  </span>
                  {selected === opt.id && (
                    <div className="w-6 h-6 bg-[#b71c1c] rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const AuthorAvatarGrid = ({ author }: { author: Author, key?: React.Key }) => (
  <Link to={`/author/${author.id}`} className="flex flex-col items-center min-w-[64px] px-0.5">
    <div className="w-[50px] h-[50px] rounded-full overflow-hidden mb-1 shadow-sm border border-gray-50">
      <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
    </div>
    <span className="text-[11px] text-gray-700 font-bold mb-1.5 truncate w-full text-center tracking-tighter">{author.name}</span>
    <div className="flex bg-white border border-[#b71c1c] rounded-[3px] overflow-hidden shadow-sm">
      <span className="text-[9px] text-[#b71c1c] px-1.5 py-1 font-bold whitespace-nowrap bg-white border-r border-[#b71c1c]/20 leading-none flex items-center">{author.recentRecord}</span>
      <span className="bg-[#b71c1c] text-white text-[10px] px-1.5 py-1 font-black leading-none min-w-[18px] text-center flex items-center justify-center">{author.streak}</span>
    </div>
  </Link>
);

const CountdownTimer = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const updateTime = () => {
      const target = new Date(targetDate).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsExpired(true);
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({
          h: h.toString().padStart(2, '0'),
          m: m.toString().padStart(2, '0'),
          s: s.toString().padStart(2, '0')
        });
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) return null;

  return (
    <div className="flex flex-col items-end">
      <span className="text-[10px] text-[#b71c1c] font-bold mb-1 tracking-tighter">公开倒计时</span>
      <div className="flex items-center space-x-1">
        <span className="bg-[#b71c1c] text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-[3px] shadow-sm">{timeLeft.h}</span>
        <span className="text-[#b71c1c] font-black text-xs">:</span>
        <span className="bg-[#b71c1c] text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-[3px] shadow-sm">{timeLeft.m}</span>
        <span className="text-[#b71c1c] font-black text-xs">:</span>
        <span className="bg-[#b71c1c] text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-[3px] shadow-sm">{timeLeft.s}</span>
      </div>
    </div>
  );
};

const formatPeriod = (period: string) => {
  if (!period) return '';
  let p = period.trim();
  // Remove existing brackets, "第" and "期" to normalize
  p = p.replace(/^【|】$/g, '').replace(/^第/, '').replace(/期$/, '');
  return `【第${p}期】`;
};

const PredictionCard = ({ prediction, isFollowed, onFollow }: { prediction: Prediction, isFollowed?: boolean, onFollow?: (e: React.MouseEvent) => void, key?: React.Key }) => {
  const periodDisplay = formatPeriod(prediction.period);
  const titleDisplay = prediction.title || prediction.contentTitle;
  
  return (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white rounded-xl mb-4 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border border-gray-100/30 mx-3">
    {prediction.isHot && (
      <div className="absolute top-0 left-0 z-10 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-br-2xl shadow-sm">
        <Trophy className="w-4 h-4 text-white rotate-[-15deg] drop-shadow-sm" />
      </div>
    )}

    {prediction.isUnlocked && (
      <div className="absolute top-0 right-0 z-20 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-bl-xl shadow-md border-b border-l border-white/20">
        已公开
      </div>
    )}
    
    <div className="p-4 relative">
      {/* Result Stamp */}
      {prediction.result && (
        <div className="absolute top-12 right-2 w-16 h-12 z-10 pointer-events-none opacity-90 select-none">
          <img 
            src={prediction.result === '红' ? 'https://wxqun988.vxjuejin.com/IMG_1034.PNG' : 'https://wxqun988.vxjuejin.com/IMG_1035.PNG'} 
            alt={prediction.result}
            className="w-full h-full object-contain transform rotate-[-15deg]"
          />
        </div>
      )}
      
      {/* Author Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm mr-2.5">
            <img src={prediction.authorAvatar} alt={prediction.authorName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[15px] font-bold text-gray-900 leading-tight">{prediction.authorName}</h3>
            <span className="text-[11px] text-orange-500 font-bold mt-0.5">{prediction.authorFans} 粉丝</span>
          </div>
        </div>
        {!prediction.isUnlocked && !prediction.isFree && prediction.unlockAt && (
           <CountdownTimer targetDate={prediction.unlockAt} />
        )}
        {(!prediction.unlockAt || prediction.isFree) && !prediction.isUnlocked && (
          <button 
            onClick={onFollow}
            className={`text-[12px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm ${
              isFollowed 
                ? 'bg-gray-100 text-gray-400' 
                : 'bg-[#fef2f2] text-[#b71c1c]'
            }`}
          >
            {isFollowed ? '已关注' : '+关注'}
          </button>
        )}
      </div>

      {/* Content Title */}
      <h4 className="text-[16px] leading-[1.4] mb-3 flex items-start">
        {periodDisplay && <span className="font-bold text-gray-900 shrink-0 mr-1">{periodDisplay}</span>}
        <span className="font-medium text-gray-800">{prediction.title || prediction.contentTitle}</span>
      </h4>

      {/* Badges/Tags & Price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex bg-white border border-[#b71c1c] rounded-[5px] overflow-hidden scale-95 origin-left shrink-0">
            <span className="text-[10px] text-[#b71c1c] px-2 py-0.5 font-bold bg-white">{prediction.authorRecentRecord || '精选'}</span>
            {prediction.authorStreak > 0 && (
              <div className="flex items-center bg-[#b71c1c] text-white text-[10px] px-2 py-0.5 font-bold space-x-1 shrink-0">
                <span>{prediction.authorStreak}连红</span>
                <span className="text-[9px]">👍</span>
              </div>
            )}
          </div>
          
          {prediction.tags && prediction.tags.map((tag, idx) => (
            <div key={idx} className="bg-red-50 text-[#b71c1c] text-[10px] font-bold px-2.5 py-0.5 rounded-[5px] border border-red-100/50 scale-95 origin-left shrink-0">
              {tag}
            </div>
          ))}
        </div>

        <div className={`shrink-0 ${prediction.isFree || prediction.isUnlocked ? 'text-green-500' : 'text-[#b71c1c]'}`}>
          {prediction.isFree || prediction.isUnlocked ? (
            <span className="text-[15px] font-black">免费</span>
          ) : (
            <div className="flex items-baseline">
              <span className="text-[12px] font-black mr-0.5">¥</span>
              <span className="text-[17px] font-black">{Math.floor(prediction.price)}</span>
              <span className="text-[11px] font-medium">.00</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50/80">
        <span className="text-[11px] text-gray-400 font-medium">{prediction.time}</span>
        <div className="flex items-center">
          <div className="flex flex-col items-end mr-3">
            <div className="flex -space-x-1.5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-4 h-4 rounded-full border border-white overflow-hidden bg-gray-100 ring-1 ring-gray-100">
                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${prediction.id}${i}`} className="w-full h-full object-cover" alt="viewer" />
                </div>
              ))}
            </div>
          </div>
          <span className="text-[11px] text-gray-400 font-bold tracking-tight">
            <JumpingNumber id={`view_${prediction.id}`} base={prediction.viewCount || 888} range={3} interval={2000} />次
          </span>
        </div>
      </div>
    </div>
  </Link>
  );
};

const Home = () => {
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorType, setAuthorType] = useState<'top' | 'new'>('top');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const [authorsData, predictionsData, profileData, settingsData] = await Promise.all([
        api.getAuthors(),
        api.getPredictions(),
        api.getProfile().catch(() => null),
        api.getSettings().catch(() => null)
      ]);
      setAuthors(authorsData);
      setPredictions(predictionsData);
      setUser(profileData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed to fetch data', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Pull to refresh logic
  const [startY, setStartY] = useState(0);
  const [pullOffset, setPullOffset] = useState(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (startY === 0) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - startY;
    if (diff > 0 && window.scrollY === 0) {
      // Apply resistance
      const offset = Math.min(diff * 0.4, 80);
      setPullOffset(offset);
      // Optional: stop scroll
      if (diff > 10) {
        // e.preventDefault(); // Might cause issues in some browsers
      }
    }
  };

  const handleTouchEnd = () => {
    if (pullOffset > 50) {
      fetchData(true);
    }
    setStartY(0);
    setPullOffset(0);
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-[#b71c1c] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleFollow = async (e: React.MouseEvent, authorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const { isFollowing } = await api.followAuthor(authorId);
      
      // Update local predictions state to reflect fan count change
      setPredictions(prev => prev.map(p => {
        if (p.authorId === authorId) {
          return { ...p, authorFans: p.authorFans + (isFollowing ? 1 : -1) };
        }
        return p;
      }));

      // Update local authors state
      setAuthors(prev => prev.map(a => {
        if (a.id === authorId) {
          return { ...a, fans: (a.fans || 0) + (isFollowing ? 1 : -1) };
        }
        return a;
      }));

      const updatedProfile = await api.getProfile();
      setUser(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('Failed to follow author', err);
    }
  };

  const filteredPredictions = Array.isArray(predictions) ? predictions.filter(p => 
    (p.title || p.contentTitle || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.authorName || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const getHitRate = (record: string) => {
    if (!record) return 0;
    const match = record.match(/近(\d+)红(\d+)/);
    if (match) {
      const total = parseInt(match[1]);
      const hit = parseInt(match[2]);
      return total === 0 ? 0 : hit / total;
    }
    return 0;
  };

  const sortedPredictions = [...filteredPredictions].sort((a, b) => {
    switch (selectedSort) {
      case 'hit_desc':
        return getHitRate(b.authorRecentRecord) - getHitRate(a.authorRecentRecord);
      case 'streak_asc':
        return (a.authorStreak || 0) - (b.authorStreak || 0);
      case 'streak_desc':
        return (b.authorStreak || 0) - (a.authorStreak || 0);
      case 'fans_asc':
        return (a.authorFans || 0) - (b.authorFans || 0);
      case 'fans_desc':
        return (b.authorFans || 0) - (a.authorFans || 0);
      case 'views_asc':
        return (a.viewCount || 0) - (b.viewCount || 0);
      case 'views_desc':
        return (b.viewCount || 0) - (a.viewCount || 0);
      default:
        // By time descending
        return new Date(b.time).getTime() - new Date(a.time).getTime();
    }
  });

  return (
    <div 
      className="bg-gray-100/50 min-h-screen relative overflow-x-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh Indicator */}
      <motion.div 
        style={{ height: pullOffset }} 
        className="flex items-center justify-center overflow-hidden bg-gray-50/50"
      >
        <div className={`w-6 h-6 border-2 border-[#b71c1c] border-t-transparent rounded-full animate-spin transition-opacity ${pullOffset > 20 ? 'opacity-100' : 'opacity-0'}`} />
      </motion.div>

      {/* Actual Refreshing Indicator (when loading) */}
      <AnimatePresence>
        {refreshing && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] bg-white px-4 py-2 rounded-full shadow-lg border border-gray-100 flex items-center space-x-2"
          >
            <div className="w-4 h-4 border-2 border-[#b71c1c] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-gray-600">正在刷新...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        style={{ y: pullOffset * 0.5 }}
      >
      {/* Sort Modal */}
      <SortModal 
        isOpen={isSortModalOpen} 
        onClose={() => setIsSortModalOpen(false)} 
        selected={selectedSort}
        onSelect={setSelectedSort}
      />

      {/* Main Top Content Container */}
      <div className="bg-white px-3 py-2.5 rounded-b-[12px] shadow-sm mb-1 border-b border-gray-100 mt-4">
        {/* User & Search Area */}
        <div className="flex items-center justify-between mb-3">
           <div className="flex items-center shrink-0">
              <div className="w-10 h-10 rounded-full overflow-hidden shadow-sm border-[1.5px] border-white ring-1 ring-gray-100">
                <img 
                  src={user?.avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
              <div className="ml-2 max-w-[120px]">
                <h2 className="text-[14px] font-black text-gray-900 leading-none truncate">{user?.nickname || user?.username || '全村人的希望'}</h2>
                <p className="text-[9px] text-gray-400 mt-1 font-medium italic">欢迎使用智料汇享</p>
              </div>
           </div>
           
           <div className="flex items-center space-x-2 flex-1 justify-end ml-3">
              <div className="bg-gray-50 border border-gray-100 rounded-full h-8 flex items-center px-4 flex-1 max-w-[140px]">
                <Search className="w-3.5 h-3.5 text-gray-300 mr-2" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="输入搜索内容"
                  className="text-[11px] text-gray-800 font-medium flex-1 outline-none bg-transparent placeholder:text-gray-300"
                />
              </div>
              <Link to="/author-search" className="text-[#b71c1c] active:scale-95 transition-transform">
                <ArrowLeftRight className="w-5 h-5" strokeWidth={2.5} />
              </Link>
           </div>
        </div>

        {/* Tab Buttons & Stats */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setAuthorType('top')}
              className={`h-7 px-3 rounded flex items-center font-black transition-all ${
                authorType === 'top' 
                  ? 'bg-[#b71c1c] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <Trophy className={`w-3.5 h-3.5 mr-1 ${authorType === 'top' ? 'text-white' : 'text-gray-400'}`} />
              <span className="text-[12px]">战绩榜</span>
            </button>
            
            <button 
              onClick={() => setAuthorType('new')}
              className={`h-7 px-3 rounded flex items-center font-black transition-all ${
                authorType === 'new' 
                  ? 'bg-[#b71c1c] text-white shadow-md' 
                  : 'bg-gray-100 text-gray-400'
              }`}
            >
              <div className="w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center mr-1 scale-90">
                <span className={`text-[8px] font-black ${authorType === 'new' ? 'text-white' : 'text-gray-400'}`}>¥</span>
              </div>
              <span className="text-[12px]">新作者</span>
            </button>
          </div>
          
          <div className="text-right">
             <div className="flex items-center justify-end text-[10.5px] font-bold space-x-1 leading-none text-gray-900">
               <span>平台当前在线人数:</span>
               <span className="text-[#b71c1c] font-medium italic tracking-tighter text-[11.5px]">
                  <JumpingNumber id="online_count" base={4089} range={10} interval={1500} />
               </span>
               <span>人</span>
             </div>
             <p className="text-[9.5px] text-gray-800 font-bold tracking-tighter italic leading-none mt-1">
               **似锦11分钟前，解锁作者: 飞哥
             </p>
          </div>
        </div>


        {/* Author Avatars Grid - Two Rows of Five */}
        <div className="mt-1">
          <div className="grid grid-cols-5 gap-y-2 gap-x-1">
             {(authorType === 'top' ? authors : authors.slice().reverse()).slice(0, 10).map((author, index) => (
               <AuthorAvatarGrid key={author.id + index} author={author} />
             ))}
          </div>
        </div>
      </div>

      {/* Yellow Notice Bar */}
      <div className="bg-[#fffef2] px-4 py-1.5 flex items-center justify-between border-b border-orange-100/30 mb-0.5">
        <span className="text-[11.5px] text-orange-400 font-bold tracking-tight">
           {settings?.announcement || '关系推荐人进行开通'}
        </span>
        <X className="w-3.5 h-3.5 text-orange-200 cursor-pointer" />
      </div>

      <div className="flex-1 pb-24">
        <div className="space-y-0">
          {sortedPredictions.map((prediction) => (
              <PredictionCard 
                key={prediction.id}
                prediction={prediction} 
                isFollowed={user?.following?.includes(prediction.authorId)}
                onFollow={(e) => handleFollow(e, prediction.authorId)} 
              />
            ))}
          
          {sortedPredictions.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
               <Search className="w-12 h-12 mb-3 opacity-20" />
               <p className="text-sm font-bold">没有搜索到相关文章</p>
            </div>
          )}
          
          {/* Legal Disclaimer Footer */}
          <div className="mx-4 mt-6 p-4 rounded-xl border border-gray-100/50 bg-white/50 relative overflow-hidden backdrop-blur-sm">
             <div className="absolute top-0 right-0 p-2 cursor-pointer" onClick={(e) => e.currentTarget.parentElement?.remove()}>
                <X className="w-3.5 h-3.5 text-gray-300 hover:text-gray-500" />
             </div>
             <p className="text-[10.5px] text-gray-400 font-bold text-center leading-relaxed">
               文章内容为作者个人观点，不代表平台立场，仅供参考！不保证实用性
             </p>
             <div className="h-px bg-gradient-to-r from-transparent via-gray-100 to-transparent my-3 w-full"></div>
          </div>
        </div>
      </div>

      </motion.div>

      {/* Floating Sticky Sort Button */}
      <div className="fixed bottom-28 right-4 z-50">
        <button 
          onClick={() => setIsSortModalOpen(true)}
          className="w-14 h-14 bg-[#b71c1c] rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(183,28,28,0.4)] active:scale-90 active:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col space-y-[4px]">
             <div className="w-6 h-[2.5px] bg-white rounded-full"></div>
             <div className="w-4 h-[2.5px] bg-white rounded-full self-end"></div>
             <div className="w-6 h-[2.5px] bg-white rounded-full"></div>
          </div>
        </button>
      </div>
    </div>
  );
};

export default Home;
