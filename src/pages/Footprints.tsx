import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, MoreHorizontal, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const FootprintCard: React.FC<{ item: any }> = ({ item }) => {
  const navigate = useNavigate();
  return (
    <div onClick={() => navigate(`/prediction/${item.id}`)} className="block bg-white rounded-xl mb-2 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border border-gray-100/30 mx-3">
    
    {item.isUnlocked && (
      <div className="absolute top-0 right-0 z-20 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-bl-xl shadow-md border-b border-l border-white/20">
        已公开
      </div>
    )}
    
    <div className="p-2.5 relative">
      
      {/* Result Stamp */}
      {item.result && (
        <div className="absolute top-10 right-2 w-14 h-10 z-10 pointer-events-none opacity-90 select-none">
          <img 
            src={item.result === '红' ? 'https://wxqun988.vxjuejin.com/IMG_1034.PNG' : 'https://wxqun988.vxjuejin.com/IMG_1035.PNG'} 
            alt={item.result}
            className="w-full h-full object-contain transform rotate-[-15deg]"
          />
        </div>
      )}

      {/* Author Info */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm mr-2">
            <img src={item.authorAvatar || "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400"} alt={item.authorName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{item.authorName || '匿名作者'}</h3>
            <span className="text-[10px] text-orange-500 font-bold mt-0.5">{item.authorFans || 0} 粉丝</span>
          </div>
        </div>
      </div>

      {/* Content Title */}
      <h4 className="text-[15px] leading-[1.3] mb-2.5 flex items-start">
        {item.period && <span className="font-bold text-gray-900 shrink-0 mr-1">【{item.period}】</span>}
        <span className="font-medium text-gray-800">{item.title || item.contentTitle}</span>
      </h4>

      {/* Badges/Tags & Price */}
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="flex bg-white border border-[#d32f2f] rounded-[4px] overflow-hidden scale-95 origin-left shrink-0">
            <span className="text-[9px] text-[#d32f2f] px-1.5 py-0.5 font-bold bg-white">{item.authorRecentRecord || '精选'}</span>
            {item.authorStreak > 0 && (
              <div className="flex items-center bg-[#d32f2f] text-white text-[9px] px-1.5 py-0.5 font-bold space-x-0.5 shrink-0">
                <span>{item.authorStreak}连红</span>
                <span className="text-[8px]">👍</span>
              </div>
            )}
          </div>
          
          {item.tags && item.tags.map((tag: string, idx: number) => (
            <div key={idx} className="bg-red-50 text-[#d32f2f] text-[9px] font-bold px-2 py-0.5 rounded-[4px] border border-red-100/50 scale-95 origin-left shrink-0">
              {tag}
            </div>
          ))}
          
          {item.accessTime && (
              <div className="bg-blue-50 text-blue-600 text-[9px] font-bold px-2 py-0.5 rounded-[4px] border border-blue-100/50 scale-95 origin-left shrink-0">
                  访问时间:{item.accessTime}
              </div>
          )}
        </div>

        <div className={`shrink-0 ${item.isFree || item.isUnlocked ? 'text-green-500' : 'text-[#d32f2f]'}`}>
          {item.isFree || item.isUnlocked ? (
            <span className="text-[14px] font-black">免费</span>
          ) : (
            <div className="flex items-baseline">
              <span className="text-[11px] font-black mr-0.5">¥</span>
              <span className="text-[16px] font-black">{Math.floor(item.price || 0)}</span>
              <span className="text-[10px] font-medium">.00</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-50/80">
        <div className="flex items-center gap-2">
            <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
            {item.accessTime && (
              <span className="text-[10px] text-gray-400 font-medium bg-gray-50 px-1.5 py-0.5 rounded border border-gray-100">
                  访问时间:{item.accessTime}
              </span>
            )}
        </div>
        <div className="flex items-center">
          <span className="text-[10px] text-gray-400 font-bold tracking-tight">
            {item.viewCount || 0}次查看
          </span>
        </div>
      </div>

    </div>
  </div>
)};

const Footprints = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');

  const [footprints, setFootprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await api.getPredictions();
        setFootprints(data);
      } catch (err) {
        console.error('Failed to fetch footprints', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredFootprints = footprints.filter(item => 
    item.title?.includes(searchQuery) || item.period?.includes(searchQuery)
  );

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-[#f8f8f8] min-h-screen pb-12"
    >
      {/* App Header */}
      <div className="bg-[#e53935] px-4 py-4 flex items-center justify-center relative shadow-md">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">文章浏览记录</h2>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        <button 
          onClick={() => setTab('today')}
          className={`flex-1 py-3 text-[16px] font-bold transition-all relative ${tab === 'today' ? 'text-[#e53935]' : 'text-gray-900/80'}`}
        >
          今日 (6次)
          {tab === 'today' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e53935]"></div>}
        </button>
        <button 
          onClick={() => setTab('all')}
          className={`flex-1 py-3 text-[16px] font-bold transition-all relative ${tab === 'all' ? 'text-[#e53935]' : 'text-gray-900/80'}`}
        >
          全部 (6次)
          {tab === 'all' && <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-[#e53935]"></div>}
        </button>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3">
        <div className="flex bg-white rounded-lg h-10 border border-gray-100">
          <div className="px-3 flex items-center">
            <Search className="w-5 h-5 text-gray-300" />
          </div>
          <input 
            type="text" 
            placeholder="搜索文章名称、期号" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-gray-300 font-medium"
          />
          <button className="px-4 text-[16px] font-bold text-gray-900 border-l border-gray-100 active:bg-gray-50">
            搜索
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4">
        {filteredFootprints.map(item => (
          <FootprintCard key={item.id} item={item} />
        ))}
      </div>

    </motion.div>
  );
};

export default Footprints;
