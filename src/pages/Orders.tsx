import React, { useState, useEffect } from 'react';
import { ChevronLeft, Search, X, MoreHorizontal } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Prediction } from '../types';

const PredictionCard = ({ prediction }: { prediction: Prediction, key?: React.Key }) => (
  <Link to={`/prediction/${prediction.id}`} className="block bg-white rounded-lg p-4 mb-3 shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center">
        <div className="relative">
          <img src={prediction.authorAvatar} alt={prediction.authorName} className="w-10 h-10 rounded-full object-cover" />
          {prediction.authorStreak > 0 && (
            <div className="absolute -bottom-1 -right-1 bg-[#ef5350] text-white text-[10px] px-1 rounded-sm border border-white font-bold">
              {prediction.authorStreak}连红
            </div>
          )}
        </div>
        <div className="ml-3">
          <div className="flex items-center">
            <span className="font-bold text-[15px] text-gray-800">{prediction.authorName}</span>
            <span className="ml-2 px-1 py-0.5 rounded-[4px] text-[10px] font-bold bg-gradient-to-r from-red-500 to-red-400 text-white shadow-sm">
              {prediction.authorRecentRecord || '精选'}
            </span>
          </div>
          <div className="flex items-center text-[10px] text-gray-400 mt-1 font-medium space-x-2">
            <span>粉丝 {prediction.authorFans || 0}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-gray-300"></span>
            <span>方案 {prediction.viewCount || 0}</span>
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-[10px] text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">{prediction.time}</div>
        {prediction.orderId && <div className="text-[10px] text-gray-400 mt-1">订单号: {prediction.orderId}</div>}
      </div>
    </div>
    
    <div className="mb-3">
      <div className="text-[15px] text-gray-800 font-bold line-clamp-2 leading-relaxed">
        {prediction.contentTitle || prediction.title}
      </div>
    </div>

    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
      <div className="flex flex-wrap gap-2">
        {prediction.tags && prediction.tags.map((tag: string, idx: number) => (
          <span key={idx} className="text-[10px] bg-red-50 text-red-500 border border-red-100/50 px-2.5 py-0.5 rounded-[4px] font-bold">
            {tag}
          </span>
        ))}
      </div>
      <div className="flex items-center">
        <span className="text-sm font-bold text-gray-400">已购买</span>
      </div>
    </div>
  </Link>
);


const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Prediction[]>([]);

  const tabs = ['已购文章'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const purchased = await api.getPurchasedPredictions();
        setOrders(purchased);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => 
    (o.title && o.title.includes(searchQuery)) || 
    (o.authorName && o.authorName.includes(searchQuery)) ||
    (o.contentTitle && o.contentTitle.includes(searchQuery))
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-[#f5f5f5] min-h-screen font-sans pb-20"
    >
      {/* Internal Navigation Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-30 border-b border-gray-100 shadow-sm">
        <ChevronLeft className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="flex-1 text-center text-[17px] font-bold text-gray-800 pr-6">我的订单</h2>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-2 flex items-center space-x-3 border-b border-gray-50 shadow-sm">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full h-[36px] pl-9 pr-4 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-red-500/20 placeholder:text-gray-400 font-medium"
            placeholder="搜索文章或作者"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <X 
              className="absolute inset-y-0 right-3 my-auto w-4 h-4 text-gray-400 cursor-pointer" 
              onClick={() => setSearchQuery('')}
            />
          )}
        </div>
        <button className="text-[14px] text-gray-800 font-bold whitespace-nowrap active:scale-95 transition-transform">搜索</button>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-3 text-[15px] font-bold relative transition-colors ${
              activeTab === index ? 'text-[#e53935]' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === index && (
              <div className="absolute bottom-0 left-[35%] right-[35%] h-[3px] bg-[#e53935] rounded-t-full shadow-[0_-1px_4px_rgba(229,57,53,0.3)]" />
            )}
          </button>
        ))}
      </div>

      <div className="p-3">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div>
            {filteredOrders.map(p => (
              <PredictionCard key={p.id} prediction={p} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center pt-24 px-6">
            <div className="w-40 h-40 relative mb-2 opacity-50 drop-shadow-sm">
              <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M40 100L100 130L160 100L100 70L40 100Z" fill="#F0F0F0" />
                <path d="M40 100V130L100 160V130L40 100Z" fill="#E0E0E0" />
                <path d="M160 100V130L100 160V130L160 100Z" fill="#D0D0D0" />
                <path d="M60 90L100 110L140 90L100 70L60 90Z" fill="#F5F5F5" />
                <path d="M100 110V140L140 120V90L100 110Z" fill="#EAEAEA" />
                <path d="M60 90V120L100 140V110L60 90Z" fill="#DCDCDC" />
                
                {/* Trail */}
                <path d="M80 80C90 60 110 50 130 60" stroke="#CCCCCC" strokeWidth="1.5" strokeDasharray="4 4" fill="none" />
                <circle cx="135" cy="55" r="8" fill="#CCCCCC" />
                <path d="M135 55L145 45L125 45L135 55Z" fill="#CCCCCC" />
              </svg>
            </div>
            <p className="text-gray-400 text-sm font-bold tracking-wide">空空如也~</p>
          </div>
        )}
      </div>

    </motion.div>
  );
};

export default Orders;

