import React, { useState } from 'react';
import { Search, SlidersHorizontal, Trophy, Pencil, User as UserIcon, X, ChevronRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_AUTHORS, MOCK_PREDICTIONS } from '../mockData';
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
  <Link to={`/author/${author.id}`} className="flex flex-col items-center min-w-[70px]">
    <div className="relative">
      <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
    </div>
    <span className="text-xs mt-1 font-medium text-gray-800">{author.name}</span>
    <div className="flex mt-1">
      <span className="text-[10px] bg-red-50 text-red-500 px-1 rounded-l-sm border border-red-100">{author.recentRecord}</span>
      <span className="text-[10px] bg-red-500 text-white px-1.5 rounded-r-sm">{author.streak}</span>
    </div>
  </Link>
);

const PredictionCard = ({ prediction }: { prediction: Prediction, key?: React.Key }) => (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white mt-3 p-4 relative overflow-hidden">
    {prediction.isHot && (
      <div className="absolute top-0 left-0 w-8 h-8 flex items-center justify-center bg-orange-500 rounded-br-2xl">
        <Trophy className="w-4 h-4 text-white rotate-[-15deg]" />
      </div>
    )}
    <div className="flex items-start justify-between">
      <div className="flex items-center">
        <img src={prediction.authorAvatar} alt={prediction.authorName} className="w-10 h-10 rounded-full" />
        <div className="ml-3">
          <div className="flex items-center">
            <span className="font-bold text-sm text-gray-800">{prediction.authorName}</span>
          </div>
          <p className="text-xs text-orange-500">{prediction.authorFans} 粉丝</p>
        </div>
      </div>
      {prediction.countdown && (
        <div className="flex items-center space-x-1">
          <span className="text-[10px] text-red-500">公开倒计时</span>
          <div className="flex space-x-0.5">
            {prediction.countdown.split(':').map((part, i) => (
              <React.Fragment key={i}>
                <span className="bg-red-500 text-white text-[10px] px-1 rounded-sm">{part}</span>
                {i < 2 && <span className="text-red-500">:</span>}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>

    <div className="mt-3">
      <h3 className="font-bold text-base text-gray-900 leading-tight">{prediction.contentTitle}</h3>
      <div className="flex mt-2 items-center space-x-2">
        <div className="flex">
          <span className="text-[10px] border border-red-200 text-red-500 px-1.5 py-0.5 rounded-l-md font-medium">近30红19</span>
          <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-r-md flex items-center">
            {prediction.authorStreak}连红 👍
          </span>
        </div>
        {prediction.isFree && <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-md">免费</span>}
      </div>
    </div>

    <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-3">
      <span className="text-xs text-gray-400">{prediction.time}</span>
      <div className="flex items-center">
        <div className="flex -space-x-1 overflow-hidden mr-2">
          {[1, 2, 3].map(i => (
            <img key={i} className="inline-block h-4 w-4 rounded-full ring-1 ring-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + prediction.id}`} alt="" />
          ))}
        </div>
        <span className="text-xs text-gray-400">{prediction.viewCount}次</span>
      </div>
    </div>
  </Link>
);

const Home = () => {
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('default');

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-50 min-h-screen">
      {/* Sort Modal */}
      <SortModal 
        isOpen={isSortModalOpen} 
        onClose={() => setIsSortModalOpen(false)} 
        selected={selectedSort}
        onSelect={setSelectedSort}
      />

      {/* Header */}
      <div className="bg-white p-4 pb-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=village" alt="Avatar" className="w-12 h-12 rounded-full" />
            <div>
              <h1 className="font-bold text-lg text-gray-800">全村人的希望</h1>
              <p className="text-xs text-gray-500">欢迎使用智料汇享</p>
            </div>
          </div>
          <Link to="/author-search" className="flex items-center bg-gray-100 rounded-full px-4 py-2 flex-grow max-w-[180px] ml-4">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <span className="text-gray-400 text-xs">输入搜索内容</span>
          </Link>
          <SlidersHorizontal 
            className={`w-6 h-6 ml-4 cursor-pointer transition-colors ${isSortModalOpen ? 'text-red-500' : 'text-gray-400'}`} 
            onClick={() => setIsSortModalOpen(true)}
          />
        </div>

        {/* Info bar */}
        <div className="flex justify-between items-center mt-4 px-1">
          <div className="flex space-x-2">
            <div className="flex items-center bg-orange-100 text-orange-600 px-3 py-1 rounded-md text-xs font-bold ring-1 ring-orange-200">
              <Trophy className="w-3 h-3 mr-1 fill-orange-600" /> 战绩榜
            </div>
            <div className="flex items-center bg-red-500 text-white px-3 py-1 rounded-md text-xs font-bold shadow-sm">
              <div className="bg-yellow-400 rounded-full p-0.5 mr-1 text-red-500">¥</div> 新作者
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-gray-400 flex items-center justify-end">
              平台当前在线人数: <span className="text-red-500 font-bold ml-1">4070</span> 人
            </div>
            <div className="text-[10px] text-gray-400">**园记20分钟前，解锁作者：开阔眼界</div>
          </div>
        </div>

        {/* Authors Grid */}
        <div className="flex overflow-x-auto space-x-4 py-4 no-scrollbar">
          {MOCK_AUTHORS.map(author => (
            <AuthorAvatarGrid key={author.id} author={author} />
          ))}
        </div>
      </div>

      {/* Banner / Notice */}
      <div className="px-4 py-2 bg-yellow-50 flex items-center justify-between text-xs text-orange-600 border-t border-b border-orange-100">
        <span className="font-medium">联系推荐人进行开通</span>
        <X className="w-4 h-4 text-gray-400" />
      </div>

      {/* Feed */}
      <div className="px-0">
        {MOCK_PREDICTIONS.map(prediction => (
          <PredictionCard key={prediction.id} prediction={prediction} />
        ))}
        
        <div className="bg-white mt-1 p-2 text-center text-[10px] text-gray-400 relative">
          <span className="relative z-10 bg-white px-2">
            文章内容为作者个人观点，不代表平台立场，仅供参考！不保证实用性
          </span>
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-100 -translate-y-1/2"></div>
          <X className="w-3 h-3 absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>
      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col space-y-3 z-40">
        <div 
          className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-200 cursor-pointer active:scale-90 transition-transform"
          onClick={() => setIsSortModalOpen(true)}
        >
           <SlidersHorizontal className="w-6 h-6 rotate-90" />
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
