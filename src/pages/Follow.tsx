import React from 'react';
import { ChevronLeft, Search, SlidersHorizontal, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MOCK_PREDICTIONS } from '../mockData';

const PredictionCard = ({ prediction }: { prediction: any, key?: React.Key }) => (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white rounded-lg p-4 mb-3 card-shadow border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="relative">
          <img src={prediction.authorAvatar} alt={prediction.authorName} className="w-10 h-10 rounded-full object-cover" />
          {prediction.authorStreak && (
            <div className="absolute -bottom-1 -right-1 bg-red-500 text-white text-[10px] px-1 rounded-sm border border-white">
              {prediction.authorStreak}连红
            </div>
          )}
        </div>
        <div className="ml-3">
          <div className="flex items-center">
            <span className="font-medium text-sm text-gray-900">{prediction.authorName}</span>
            <span className="ml-2 px-1 rounded text-[10px] bg-red-50 text-red-500 border border-red-100">
              {prediction.authorRecentRecord}
            </span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5">
            粉丝：{prediction.authorFans}  ·  方案：{prediction.viewCount}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-400 mb-1">{prediction.time}</div>
        {prediction.isHot && <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-medium">热门排行</span>}
      </div>
    </div>
    
    <div className="mb-3">
      <div className="text-xs font-bold text-red-500 mb-1">【{prediction.period}】期：{prediction.title}</div>
      <div className="text-sm text-gray-700 line-clamp-2 leading-relaxed">
        {prediction.contentTitle}
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
      <div className="flex gap-2">
        {prediction.tags.map((tag: string, idx: number) => (
          <span key={idx} className="text-[10px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center">
        {prediction.isFree ? (
          <span className="text-sm font-bold text-green-500">免费公开</span>
        ) : (
          <div className="flex items-center">
            <span className="text-xs text-gray-400 mr-2">截止：{prediction.countdown}</span>
            <span className="text-sm font-bold text-red-500">{prediction.price}金币</span>
          </div>
        )}
      </div>
    </div>
  </Link>
);

const Follow = () => {
  // Mock followed content - filtering some hot predictions to simulate "following"
  const followedPredictions = MOCK_PREDICTIONS.filter(p => p.isHot);

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
          <Star className="w-5 h-5 text-red-500 fill-red-500" />
          <h1 className="text-lg font-bold">我的关注</h1>
        </div>
        <div className="flex gap-4">
          <Search className="w-6 h-6 text-gray-400" />
          <SlidersHorizontal className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white flex px-4 border-b border-gray-100 sticky top-[53px] z-20">
        <div className="py-3 px-4 text-red-500 border-b-2 border-red-500 font-medium text-sm">全部动态</div>
        <div className="py-3 px-4 text-gray-500 font-medium text-sm">最新开奖</div>
        <div className="py-3 px-4 text-gray-500 font-medium text-sm">关注专家</div>
      </div>

      <div className="p-4">
        {followedPredictions.length > 0 ? (
          followedPredictions.map(p => (
            <PredictionCard key={p.id} prediction={p} />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Star className="w-16 h-16 mb-4 opacity-20" />
            <p>暂无关注动态，快去关注大神吧</p>
            <Link to="/" className="mt-4 px-6 py-2 bg-red-500 text-white rounded-full text-sm font-medium">
              去大厅看看
            </Link>
          </div>
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
