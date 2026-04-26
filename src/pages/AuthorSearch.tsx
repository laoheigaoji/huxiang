import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const AuthorSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f8f8f8] min-h-screen"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">商家列表</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">op93.help</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* App Header */}
      <div className="bg-[#e53935] px-4 py-3 flex items-center justify-center relative">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">商家列表</h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-full flex items-center h-10 px-4 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜索" 
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-gray-300"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="bg-[#e53935] text-white px-6 py-1.5 rounded-full text-[14px] font-bold ml-2">
            搜索
          </button>
        </div>
      </div>

      {/* Empty State / Hint */}
      <div className="flex flex-col items-center justify-center mt-40">
        <div className="bg-black/70 text-white px-6 py-4 rounded-lg text-[15px] font-medium">
          请输入搜索关键字
        </div>
      </div>

      {/* Bottom Browser Navigation Mockup */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#f8f8f8] flex items-center justify-around z-50 border-t border-gray-200 px-24">
         <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         <div className="rotate-180">
            <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         </div>
      </div>
    </motion.div>
  );
};

export default AuthorSearch;
