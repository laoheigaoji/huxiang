import React, { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Trophy, Pencil, User as UserIcon, X, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Author, Prediction } from '../types';

const SortIcon = ({ type, direction }: { type: string, direction?: 'up' | 'down' }) => {
  if (type === 'default') {
    return (
      <div className="w-8 h-8 flex items-center justify-center">
        <div className="flex flex-col space-y-[2px]">
          <div className="w-4 h-[2px] bg-red-500 rounded-full"></div>
          <div className="w-2 h-[2px] bg-red-500 rounded-full"></div>
          <div className="w-3 h-[2px] bg-red-500 rounded-full"></div>
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
    { id: 'default', label: '默认排序', type: 'default', icon: <SlidersHorizontal className="w-6 h-6 text-red-500" /> },
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
                      <SlidersHorizontal className="w-6 h-6 text-red-500" />
                    ) : (
                      <div className="font-bold text-[18px] text-gray-800 flex items-center">
                        {opt.type === 'hit' && <span>冲</span>}
                        {opt.type === 'streak' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="leading-none">红</span></div>}
                        {opt.type === 'fans' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="leading-none tracking-tighter">R</span></div>}
                        {opt.type === 'views' && <div className="flex items-end"><span className="text-[10px] mb-1">1</span><span className="text-xl">👁️</span></div>}
                      </div>
                    )}
                  </div>
                  <span className={`flex-1 text-[16px] font-medium ${selected === opt.id ? 'text-red-500 font-bold' : 'text-gray-800'}`}>
                    {opt.label}
                  </span>
                  {selected === opt.id && (
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
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
  <Link to={`/author/${author.id}`} className="flex flex-col items-center min-w-[72px] mb-4">
    <div className="relative">
      <div className="w-14 h-14 rounded-full overflow-hidden border-[1.5px] border-white shadow-sm ring-1 ring-gray-100">
        <img src={author.avatar} alt={author.name} className="w-full h-full object-cover" />
      </div>
    </div>
    <span className="text-[12px] text-gray-800 font-bold mt-1.5 mb-1 truncate w-full text-center">{author.name}</span>
    <div className="flex items-center">
      <div className="flex bg-white border border-red-500 rounded-[3px] overflow-hidden scale-90">
        <span className="text-[9px] text-red-500 px-1 font-bold whitespace-nowrap">近10红</span>
        <span className="bg-red-500 text-white text-[9px] px-1.5 font-bold">{author.streak}</span>
      </div>
    </div>
  </Link>
);

const PredictionCard = ({ prediction, isFollowed, onFollow }: { prediction: Prediction, isFollowed?: boolean, onFollow?: (e: React.MouseEvent) => void }) => (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white rounded-xl mb-4 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border border-gray-100/30 mx-3">
    {prediction.isHot && (
      <div className="absolute top-0 left-0 z-10 w-8 h-8 flex items-center justify-center bg-gradient-to-br from-orange-400 to-orange-600 rounded-br-2xl shadow-sm">
        <Trophy className="w-4 h-4 text-white rotate-[-15deg] drop-shadow-sm" />
      </div>
    )}
    
    <div className="p-4">
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
        <button 
          onClick={onFollow}
          className={`text-[12px] font-bold px-4 py-1.5 rounded-full active:scale-95 transition-all shadow-sm ${
            isFollowed 
              ? 'bg-gray-100 text-gray-400' 
              : 'bg-[#fef2f2] text-[#ef5350]'
          }`}
        >
          {isFollowed ? '已关注' : '+关注'}
        </button>
      </div>

      {/* Content Title */}
      <h4 className="text-[16px] font-black text-gray-900 leading-tight mb-3">
        {prediction.contentTitle}
      </h4>

      {/* Badges/Tags */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="flex bg-white border border-red-500 rounded-[5px] overflow-hidden scale-95 origin-left">
          <span className="text-[10px] text-red-500 px-2 py-0.5 font-bold bg-white">近30红19</span>
          <div className="flex items-center bg-[#ef5350] text-white text-[10px] px-2 py-0.5 font-bold space-x-1">
            <span>{prediction.authorStreak}连红</span>
            <span className="text-[9px]">👍</span>
          </div>
        </div>
        
        {prediction.isFree && (
          <div className="bg-[#4caf50] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-[5px] scale-95 origin-left transition-transform shadow-sm">
            免费
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50/80">
        <span className="text-[11px] text-gray-400 font-medium">{prediction.time}</span>
        <div className="flex items-center">
          <div className="flex -space-x-1.5 mr-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-5 h-5 rounded-full border border-white overflow-hidden bg-gray-100 ring-1 ring-gray-50">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${prediction.id}${i}`} className="w-full h-full object-cover" alt="viewer" />
              </div>
            ))}
          </div>
          <span className="text-[11px] text-gray-400 font-bold tracking-tight">{prediction.viewCount}次</span>
        </div>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [authorType, setAuthorType] = useState<'top' | 'new'>('top');
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsData, predictionsData, profileData] = await Promise.all([
          api.getAuthors(),
          api.getPredictions(),
          api.getProfile().catch(() => null)
        ]);
        setAuthors(authorsData);
        setPredictions(predictionsData);
        setUser(profileData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleFollow = async (e: React.MouseEvent, authorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await api.followAuthor(authorId);
      const updatedProfile = await api.getProfile();
      setUser(updatedProfile);
      localStorage.setItem('user', JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('Failed to follow author', err);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-100/50 min-h-screen">
      {/* Sort Modal */}
      <SortModal 
        isOpen={isSortModalOpen} 
        onClose={() => setIsSortModalOpen(false)} 
        selected={selectedSort}
        onSelect={setSelectedSort}
      />

      {/* Sticky Header Section */}
      <div className="bg-gradient-to-b from-[#fff0f1] to-white px-4 pt-10 pb-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] border-b border-gray-100">
        {/* User & Online Stats */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center">
            <div className="w-14 h-14 rounded-full overflow-hidden border-[2.5px] border-white shadow-md ring-1 ring-red-50">
              <img 
                src={user?.avatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"} 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
            <div className="ml-3">
              <h2 className="text-[17px] font-black text-gray-900 leading-tight tracking-tight">{user?.nickname || user?.username || '全村人的希望'}</h2>
              <p className="text-[11px] text-gray-400 font-medium mt-0.5">欢迎使用智料汇享</p>
            </div>
          </div>
          
          <div className="text-right flex flex-col items-end">
            <div className="flex items-center space-x-1 mb-0.5">
              <span className="text-[10px] text-gray-400 font-medium">平台当前在线人数:</span>
              <span className="text-[11px] text-[#ef5350] font-black italic">4035</span>
              <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">人</span>
            </div>
            <div className="text-[9.5px] text-gray-400 font-medium italic opacity-80 leading-none">
              **楼台27分钟前，解锁作者: 钱大师
            </div>
          </div>
        </div>

        {/* Search Line */}
        <div className="flex items-center mb-5">
          <Link to="/author-search" className="flex-1 bg-white rounded-full h-10 px-4 flex items-center shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-red-50/50 transition-shadow">
             <Search className="w-4 h-4 text-gray-300 mr-2" />
             <span className="text-[14px] text-gray-300 font-medium flex-1">输入搜索内容</span>
          </Link>
          <div className="flex items-center ml-4">
             <button 
                onClick={() => setIsSortModalOpen(true)}
                className="flex items-center justify-center p-1 active:scale-90 transition-transform"
             >
                <div className="flex flex-col space-y-[4px]">
                   <div className="w-6 h-[2.5px] bg-[#ef5350] rounded-full"></div>
                   <div className="w-4 h-[2.5px] bg-[#ef5350] rounded-full self-end"></div>
                   <div className="w-6 h-[2.5px] bg-[#ef5350] rounded-full"></div>
                </div>
             </button>
          </div>
        </div>

        {/* Action Tabs */}
        <div className="flex space-x-3 mb-5">
          <button 
            onClick={() => setAuthorType('top')}
            className={`flex-1 h-12 rounded-xl flex items-center px-4 transition-all active:scale-95 ${
              authorType === 'top' 
                ? 'bg-gradient-to-br from-[#ff6e40] to-[#ffab40] text-white shadow-lg shadow-orange-100 font-black' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
            <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ring-1 ${authorType === 'top' ? 'bg-white/20 ring-white/10' : 'bg-gray-200 ring-gray-300'}`}>
              <Trophy className={`w-3.5 h-3.5 ${authorType === 'top' ? 'text-white' : 'text-gray-400'}`} />
            </div>
            <span className="text-[15px] italic tracking-widest leading-none">战绩榜</span>
          </button>
          
          <button 
            onClick={() => setAuthorType('new')}
            className={`flex-1 h-12 rounded-xl flex items-center px-4 transition-all active:scale-95 ${
              authorType === 'new' 
                ? 'bg-gradient-to-br from-[#ef5350] to-[#f44336] text-white shadow-lg shadow-red-100 font-black' 
                : 'bg-gray-100 text-gray-400'
            }`}
          >
             <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ring-1 ${authorType === 'new' ? 'bg-white/20 ring-white/10' : 'bg-gray-200 ring-gray-300'}`}>
                <span className={`text-[12px] font-black ${authorType === 'new' ? 'text-white' : 'text-gray-400'}`}>¥</span>
             </div>
             <span className="text-[15px] italic tracking-widest leading-none">新作者</span>
          </button>
        </div>

        {/* Scrollable Author List */}
        <div className="flex overflow-x-auto pb-1 -mx-4 px-4 scrollbar-hide space-x-1.5 mask-fade-right">
          {(authorType === 'top' ? authors : authors.slice().reverse()).map(author => (
            <AuthorAvatarGrid key={author.id} author={author} />
          ))}
        </div>
      </div>

      {/* Marquee Notice Bar */}
      <div className="bg-[#fff9c4]/60 px-4 py-2.5 flex items-center justify-between border-b border-[#fff9c4]/30 backdrop-blur-sm">
        <div className="flex items-center flex-1 overflow-hidden space-x-2">
          <div className="w-1 h-1 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="text-[12px] text-[#ef6c00] font-bold whitespace-nowrap overflow-hidden">
            如没有微信支付通知，请联系客服查询。
          </span>
        </div>
        <X className="w-4 h-4 text-orange-300 ml-2 shrink-0 cursor-pointer hover:text-orange-500" />
      </div>

      {/* Main Feed Content */}
      <div className="pt-4 pb-32 bg-gray-50/30">
        <div className="space-y-0">
          {predictions.map((prediction, index) => (
            <React.Fragment key={prediction.id}>
              {index === 1 && (
                <Link to="/prediction/p2" className="block bg-white rounded-xl mb-4 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border border-gray-100/30 mx-3">
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-100 shadow-sm mr-2.5">
                          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100" className="w-full h-full object-cover" alt="avatar" />
                        </div>
                        <div className="flex flex-col">
                          <h3 className="text-[15px] font-bold text-gray-900 leading-tight">奥迪小王</h3>
                          <span className="text-[11px] text-orange-500 font-bold mt-0.5">4305 粉丝</span>
                        </div>
                      </div>
                      
                      {/* Countdown Timer Block */}
                      <div className="flex flex-col items-end">
                        <span className="text-[11px] text-[#ef5350] font-bold mb-1 tracking-tighter">公开倒计时</span>
                        <div className="flex items-center space-x-1 uppercase">
                          <span className="bg-[#ef5350] text-white text-[12px] font-black w-6 h-6 flex items-center justify-center rounded-[3px] shadow-sm">01</span>
                          <span className="text-[#ef5350] font-black">:</span>
                          <span className="bg-[#ef5350] text-white text-[12px] font-black w-6 h-6 flex items-center justify-center rounded-[3px] shadow-sm">25</span>
                          <span className="text-[#ef5350] font-black">:</span>
                          <span className="bg-[#ef5350] text-white text-[12px] font-black w-6 h-6 flex items-center justify-center rounded-[3px] shadow-sm">39</span>
                        </div>
                      </div>
                    </div>
                    <h4 className="text-[16px] font-black text-gray-900 leading-tight mb-2">【第116期】提供参考 (每天免费) 福利🧧</h4>
                  </div>
                </Link>
              )}
              <PredictionCard 
                prediction={prediction} 
                isFollowed={user?.following?.includes(prediction.authorId)}
                onFollow={(e) => handleFollow(e, prediction.authorId)} 
              />
            </React.Fragment>
          ))}
          
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

      {/* Floating Sticky Sort Button */}
      <div className="fixed bottom-28 right-4 z-50">
        <button 
          onClick={() => setIsSortModalOpen(true)}
          className="w-14 h-14 bg-[#ef5350] rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(239,83,80,0.4)] active:scale-90 active:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col space-y-[4px]">
             <div className="w-6 h-[2.5px] bg-white rounded-full"></div>
             <div className="w-4 h-[2.5px] bg-white rounded-full self-end"></div>
             <div className="w-6 h-[2.5px] bg-white rounded-full"></div>
          </div>
        </button>
      </div>
    </motion.div>
  );
};

export default Home;
