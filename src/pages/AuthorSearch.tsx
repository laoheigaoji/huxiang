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
      {/* App Header */}
      <div className="bg-[#e53935] px-4 py-4 flex items-center justify-center relative shadow-sm">
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

    </motion.div>
  );
};

export default AuthorSearch;
