import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, SlidersHorizontal, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Author, Prediction } from '../types';

const PredictionCard = ({ prediction }: { prediction: Prediction, key?: React.Key }) => (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white rounded-xl mb-4 overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] relative border border-gray-100/30">
    {prediction.isUnlocked && (
      <div className="absolute top-0 right-0 z-20 bg-green-500 text-white text-[10px] font-black px-2.5 py-1 rounded-bl-xl shadow-md border-b border-l border-white/20">
        已公开
      </div>
    )}
    
    <div className="p-4 relative">
      {/* Author Info */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 shadow-sm mr-2.5">
            <img src={prediction.authorAvatar} alt={prediction.authorName} className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <h3 className="text-[14px] font-bold text-gray-900 leading-tight">{prediction.authorName}</h3>
            <div className="flex items-center mt-0.5 space-x-1">
              <span className="text-[10px] text-orange-500 font-bold">{prediction.authorFans} 粉丝</span>
              <span className="text-[9px] text-gray-300">·</span>
              <span className="text-[10px] text-[#d32f2f] font-bold">{prediction.authorRecentRecord}</span>
            </div>
          </div>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-gray-400 font-medium">{prediction.time}</span>
        </div>
      </div>

      {/* Content Title */}
      <h4 className="text-[15px] font-black text-gray-900 leading-tight mb-3">
        {prediction.contentTitle}
      </h4>

      {/* Badges/Tags & Price */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {prediction.tags && prediction.tags.map((tag, idx) => (
            <div key={idx} className="bg-red-50 text-[#d32f2f] text-[10px] font-bold px-2 py-0.5 rounded-[4px] border border-red-100/50">
              {tag}
            </div>
          ))}
          {prediction.isFree && (
             <span className="bg-green-50 text-green-600 text-[10px] font-bold px-2 py-0.5 rounded-[4px] border border-green-100/50">免费</span>
          )}
        </div>

        <div className={`shrink-0 ${prediction.isFree || prediction.isUnlocked ? 'text-green-500' : 'text-[#d32f2f]'}`}>
          {prediction.isFree || prediction.isUnlocked ? (
            <span className="text-[14px] font-black">免费</span>
          ) : (
            <div className="flex items-baseline">
              <span className="text-[11px] font-black mr-0.5">¥</span>
              <span className="text-[16px] font-black">{Math.floor(prediction.price)}</span>
              <span className="text-[10px] font-medium">.00</span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50/80">
        <div className="flex -space-x-1 mr-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-4 h-4 rounded-full border border-white overflow-hidden bg-gray-100 shadow-sm">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${prediction.id}${i}`} className="w-full h-full object-cover" alt="viewer" />
            </div>
          ))}
        </div>
        <span className="text-[11px] text-gray-400 font-bold tracking-tight">
          {prediction.viewCount || 888}次
        </span>
      </div>
    </div>
  </Link>
);

const Follow = () => {
  const [followedPredictions, setFollowedPredictions] = useState<Prediction[]>([]);
  const [followedAuthors, setFollowedAuthors] = useState<Author[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'authors'>('feed');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allPredictions, allAuthors, profile] = await Promise.all([
          api.getPredictions(),
          api.getAuthors(),
          api.getProfile().catch(() => null)
        ]);
        
        if (profile && profile.following) {
          const followedIds = profile.following;
          setFollowedPredictions(allPredictions.filter(p => followedIds.includes(p.authorId)));
          setFollowedAuthors(allAuthors.filter((a: Author) => followedIds.includes(a.id)));
        }
      } catch (err) {
        console.error('Fetch following failed', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-[#d32f2f] fill-[#d32f2f]" />
          <h1 className="text-lg font-bold">我的关注</h1>
        </div>
        <div className="flex gap-4">
          <Search className="w-6 h-6 text-gray-400" />
          <SlidersHorizontal className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white flex px-4 border-b border-gray-100 sticky top-[53px] z-20">
        <button 
          onClick={() => setActiveTab('feed')}
          className={`py-3 px-4 font-medium text-sm transition-colors ${activeTab === 'feed' ? 'text-[#d32f2f] border-b-2 border-[#d32f2f]' : 'text-gray-500'}`}
        >
          全部动态
        </button>
        <button 
          onClick={() => setActiveTab('authors')}
          className={`py-3 px-4 font-medium text-sm transition-colors ${activeTab === 'authors' ? 'text-[#d32f2f] border-b-2 border-[#d32f2f]' : 'text-gray-500'}`}
        >
          关注专家
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'feed' ? (
          followedPredictions.length > 0 ? (
            followedPredictions.map(p => (
              <PredictionCard key={p.id} prediction={p} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Star className="w-16 h-16 mb-4 opacity-20" />
              <p>暂无关注动态，快去关注大神吧</p>
              <Link to="/" className="mt-4 px-6 py-2 bg-[#d32f2f] text-white rounded-full text-sm font-medium">
                去大厅看看
              </Link>
            </div>
          )
        ) : (
          followedAuthors.length > 0 ? (
            <div className="space-y-3">
              {followedAuthors.map(author => (
                <Link key={author.id} to={`/author/${author.id}`} className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-gray-50">
                  <div className="flex items-center">
                    <img src={author.avatar} alt={author.name} className="w-12 h-12 rounded-full object-cover" />
                    <div className="ml-3">
                      <div className="font-bold text-gray-900">{author.name}</div>
                      <div className="text-xs text-gray-500 mt-1">粉丝：{author.fans} · 近{author.recentRecord}</div>
                    </div>
                  </div>
                  <ChevronLeft className="w-5 h-5 text-gray-300 rotate-180" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Star className="w-16 h-16 mb-4 opacity-20" />
              <p>你还没有关注任何专家</p>
            </div>
          )
        )}
      </div>

      {/* Footer Disclaimer */}
      <div className="px-6 py-8 text-center text-gray-400 text-[10px] leading-relaxed">
        预测分析仅供参考，不代表官方立场。<br />
        提倡适度娱乐，拒绝非法赌博。
      </div>
    </motion.div>
  );
};

export default Follow;
