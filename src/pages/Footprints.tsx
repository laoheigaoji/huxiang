import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, Search, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const FootprintCard = ({ item }: { item: any, key?: React.Key }) => (
  <div className="bg-white rounded-xl p-4 mb-3 border border-gray-100 relative shadow-sm overflow-hidden active:bg-gray-50 transition-colors">
    {/* Ribbon badge top right */}
    {item.isPublic && (
      <div className="absolute top-0 right-0 w-10 h-10">
        <div className="absolute top-0 right-0 w-0 h-0 border-t-[40px] border-t-orange-500 border-l-[40px] border-l-transparent"></div>
        <span className="absolute top-1.5 right-0.5 text-[10px] text-white font-bold rotate-45">公开</span>
      </div>
    )}

    {/* Top left arrow icon for specialized posts */}
    {item.hasSpecialIcon && (
      <div className="absolute top-0 left-0">
        <div className="w-5 h-5 bg-orange-500 rounded-br-lg flex items-center justify-center">
           <div className="w-2.5 h-2.5 border-t-2 border-l-2 border-white rotate-45 translate-y-0.5"></div>
        </div>
      </div>
    )}

    {/* Author Header */}
    <div className="flex items-start">
      <img src={item.authorAvatar} alt="" className="w-11 h-11 rounded-full object-cover" />
      <div className="ml-3 flex-1">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-[15px]">{item.authorName}</h3>
            <p className="text-[11px] text-orange-500 font-medium">
              <span className="font-bold">{item.authorFans}</span> 粉丝
            </p>
          </div>
          {item.isWon && (
             <div className="w-12 h-12 border-2 border-red-200 rounded-full flex items-center justify-center -rotate-12 opacity-60">
                <div className="w-10 h-10 border border-red-500 rounded-full flex items-center justify-center text-red-500 font-black text-lg p-1 border-dotted">
                   红
                </div>
             </div>
          )}
        </div>
      </div>
    </div>

    {/* Content Title */}
    <div className="mt-3">
      <h4 className="text-[16px] font-bold text-gray-900 leading-snug">
        <span className="text-[#e53935]">【{item.period}】</span> {item.title} {item.emojis}
      </h4>
    </div>

    {/* Metadata Badges */}
    <div className="mt-3 flex items-center space-x-2">
      <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 border border-red-100 rounded-sm">
        {item.record}
      </span>
      <span className="text-[10px] bg-[#e53935] text-white px-2 py-0.5 rounded-sm flex items-center shadow-sm">
        {item.streak}连红 👍
      </span>
      <div className="bg-gray-100/80 rounded-sm px-2 py-0.5 text-[10px] text-gray-400 font-medium">
        访问时间:{item.visitTime}
      </div>
    </div>

    {/* Price Section */}
    <div className="mt-4 flex items-center justify-between">
       <div className="flex items-baseline text-[#e53935]">
          <span className="text-sm font-bold mr-0.5">¥</span>
          <span className="text-xl font-black">{item.price}</span>
          <span className="text-[12px] font-bold opacity-80">.00</span>
       </div>
       {item.countdown && (
          <div className="flex items-center space-x-1.5 bg-gray-50/50 rounded-full pl-3">
            <span className="text-[11px] text-[#e53935] font-bold">公开倒计时</span>
            <div className="flex space-x-0.5">
              {item.countdown.split(':').map((p: string, i: number) => (
                <React.Fragment key={i}>
                  <div className="bg-[#e53935] text-white text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded">
                    {p}
                  </div>
                  {i < 2 && <span className="text-[#e53935] font-bold">:</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
       )}
    </div>

    {/* Footer Info */}
    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
       <span className="text-[11px] text-gray-400 font-medium">{item.publishTime}</span>
       <div className="flex items-center text-[11px] text-gray-400 font-medium">
          <div className="flex -space-x-1.5 mr-2">
            {[1, 2, 3].map(i => (
              <img 
                key={i} 
                className="w-5 h-5 rounded-full border border-white" 
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + item.id}`} 
                alt="" 
              />
            ))}
          </div>
          <span>{item.viewCount}人查看</span>
       </div>
    </div>
  </div>
);

const Footprints = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('today');

  const footprints = [
    {
      id: 1,
      authorName: '浪子能',
      authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150',
      authorFans: 724,
      period: '第114期',
      title: '精选六码中特🧧💗',
      emojis: '得得得🛑',
      record: '近9红6',
      streak: 1,
      visitTime: '2026-04-26 20:08:37',
      price: '766.00',
      publishTime: '2026-04-24 13:28:06',
      viewCount: 7533,
      isWon: true,
      isPublic: true
    },
    {
      id: 2,
      authorName: '东莞凡哥',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
      authorFans: 1215,
      period: '第116期',
      title: '热烈两码中特',
      emojis: '🔥 🔥 🔥',
      record: '近23红9',
      streak: 2,
      visitTime: '2026-04-26 20:08:27',
      price: '1388.00',
      publishTime: '2026-04-26 13:28:04',
      viewCount: 5533,
      countdown: '01:20:36'
    },
    {
      id: 3,
      authorName: '飞哥',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150',
      authorFans: 7586,
      period: '第115期',
      title: '特码八肖',
      emojis: '🀄️爆爆爆',
      record: '近30红19',
      streak: 4,
      visitTime: '2026-04-26 20:07:15',
      price: '0.00',
      publishTime: '2026-04-25 13:28:00',
      viewCount: 9988,
      hasSpecialIcon: true
    }
  ];

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
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-gray-300 font-medium"
          />
          <button className="px-4 text-[16px] font-bold text-gray-900 border-l border-gray-100 active:bg-gray-50">
            搜索
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="px-4">
        {footprints.map(item => (
          <FootprintCard key={item.id} item={item} />
        ))}
      </div>

    </motion.div>
  );
};

export default Footprints;
