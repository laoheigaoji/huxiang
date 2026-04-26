import React, { useState } from 'react';
import { ChevronLeft, Search, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Orders = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const tabs = ['七日已支付', '一日未支付'];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen font-sans"
    >
      {/* Internal Navigation Header */}
      <div className="bg-white px-4 py-3 flex items-center sticky top-0 z-30 border-b border-gray-100">
        <ChevronLeft className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="flex-1 text-center text-lg font-bold text-gray-800 pr-6">订单</h2>
      </div>

      {/* Search Bar */}
      <div className="bg-white px-4 py-1.5 flex items-center space-x-3 border-b border-gray-50">
        <div className="flex-1 relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="w-4 h-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full h-9 pl-10 pr-4 bg-white border border-gray-200 rounded-md text-sm focus:outline-none placeholder:text-gray-400"
            placeholder="输入关键字"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="text-[15px] text-gray-800 font-medium whitespace-nowrap">搜索</button>
      </div>

      {/* Tabs */}
      <div className="bg-white flex border-b border-gray-100 mt-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            onClick={() => setActiveTab(index)}
            className={`flex-1 py-4 text-sm font-medium relative transition-colors ${
              activeTab === index ? 'text-[#e53935]' : 'text-gray-500'
            }`}
          >
            {tab}
            {activeTab === index && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#e53935]" />
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center pt-32 px-6">
        <div className="w-48 h-48 relative mb-4 opacity-70">
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
        <p className="text-gray-300 text-sm font-medium tracking-wide">没有数据哦~</p>
      </div>

      {/* Browser Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 py-3 flex items-center justify-around">
        <ChevronLeft className="w-7 h-7 text-gray-700 cursor-pointer" onClick={() => navigate(-1)} />
        <ChevronLeft className="w-7 h-7 text-gray-200 rotate-180" />
      </div>
    </motion.div>
  );
};

export default Orders;
