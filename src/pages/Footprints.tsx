import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, MoreHorizontal, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const FootprintCard: React.FC<{ item: any }> = ({ item }) => {
  const navigate = useNavigate();
  console.log('FootprintCard item:', item);
  return (
  <div onClick={() => navigate(`/prediction/${item.id}`)} className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm active:bg-gray-50 transition-colors">
    <div className="flex items-center justify-between mb-3 text-sm text-gray-800">
      <div className="flex items-center font-bold text-[15px]">
        {item.period && <span className="text-[#e53935] mr-1">【{item.period}】</span>}
        {item.title}
      </div>
      <div className="text-gray-400 text-[12px]">{item.time}</div>
    </div>
    
    {item.zhengwen && (
      <div className="flex items-center text-sm mb-3">
          <span className="text-gray-500 mr-2">正文:</span>
          <span className="bg-[#fef3c7] text-[#92400e] px-2 py-0.5 rounded text-xs font-bold">{item.zhengwen}</span>
      </div>
    )}

    {item.predictions && item.predictions.length > 0 && (
      <div className="flex items-center text-sm mb-3">
          <span className="text-gray-500 mr-2">核对:</span>
          <div className="flex flex-wrap gap-1.5">
             {item.predictions.map((p: any, i: number) => (
               <div key={i} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold ${p.color === 'red' ? 'bg-[#ef4444]' : p.color === 'blue' ? 'bg-[#3b82f6]' : 'bg-[#1f2937]'}`}>
                     {p.number}
                  </div>
                  {p.name && <span className="text-[10px] text-gray-500 mt-0.5 font-bold">{p.name}</span>}
               </div>
             ))}
          </div>
      </div>
    )}

    <div className="flex items-center justify-between border-t border-gray-50 pt-3">
        <div className="flex items-center space-x-2">
            {item.resultType && (
              <span className="text-[10px] bg-[#e53935] text-white px-1.5 py-0.5 rounded-sm font-bold opacity-80">
                  {item.resultType}
              </span>
            )}
        </div>
        <div className="flex items-center text-[11px] text-gray-400 font-medium">
          <span>{item.viewCount || 0}人查看</span>
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
