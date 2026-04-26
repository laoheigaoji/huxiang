import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Headset, UserPlus, SlidersHorizontal, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { MOCK_AUTHORS, MOCK_PREDICTIONS } from '../mockData';

const AuthorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const author = MOCK_AUTHORS.find(a => a.id === id) || MOCK_AUTHORS[2];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-50 min-h-screen">
      {/* Blue Gradient Header */}
      <div className="h-48 bg-gradient-to-b from-blue-100 to-blue-50 absolute top-0 left-0 right-0 z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* Header Nav */}
      <div className="relative z-10 flex items-center justify-between p-4 text-gray-700">
        <ChevronLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-lg font-medium">作者主页</h2>
        <Headset className="w-6 h-6 cursor-pointer text-gray-400" />
      </div>

      {/* Author Card */}
      <div className="relative z-10 px-4">
        <div className="bg-white rounded-2xl p-6 card-shadow text-center">
            <img src={author.avatar} alt={author.name} className="w-20 h-20 rounded-full mx-auto border-4 border-white shadow-md -mt-16" />
            <h3 className="mt-4 text-xl font-bold text-gray-800">{author.name}</h3>
            <p className="text-xs text-orange-500 mt-1">{author.fans} 粉丝</p>
            
            <div className="mt-4 flex justify-center space-x-1.5">
              {['红', '红', '黑', '红', '黑', '红', '黑'].map((c, i) => (
                <span key={i} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${c === '红' ? 'bg-red-500 border border-red-400' : 'bg-gray-900'}`}>
                  {c}
                </span>
              ))}
            </div>

            <button className="mt-6 bg-pink-50 text-red-500 px-8 py-2 rounded-full text-sm font-bold border border-red-100 inline-flex items-center active:scale-95 transition-all">
              <UserPlus className="w-4 h-4 mr-2" /> 关注
            </button>
        </div>

        {/* Prediction Feed */}
        <div className="mt-6 space-y-4 pb-20">
          {[1, 2, 3].map(i => (
             <div key={i} className="bg-white rounded-xl p-4 card-shadow relative overflow-hidden group active:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <img src={author.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div className="ml-3">
                      <h4 className="font-bold text-sm text-gray-800">{author.name}</h4>
                      <div className="flex items-center mt-1">
                        <span className="text-[10px] text-red-500 bg-red-50 px-1 border border-red-100 rounded-sm">{author.recentRecord}</span>
                        <span className="ml-1 text-[10px] bg-red-500 text-white px-2 rounded-sm">{author.streak}连红 👍</span>
                      </div>
                    </div>
                  </div>
                  {i === 1 ? (
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] text-red-500">公开倒计时</span>
                      <div className="flex space-x-0.5">
                        {['03', '52', '30'].map((p, idx) => (
                          <React.Fragment key={idx}>
                            <span className="bg-red-500 text-white text-[10px] px-1 rounded-sm">{p}</span>
                            {idx < 2 && <span className="text-red-500 text-[10px]">:</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="absolute top-2 right-4 w-12 h-12 opacity-80">
                      <img src="https://img.icons8.com/color/96/000000/stamp.png" alt="" className="scale-75" />
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <h5 className="font-bold text-gray-900">【第{116-i+1}期】 精选六码中特🧧💗</h5>
                </div>

                <div className="mt-4 flex items-center justify-between text-[10px] text-gray-400">
                  <div className="flex items-center space-x-2">
                    <span>2026-04-2{6-i+1} 12:59:31</span>
                    <span className="bg-blue-50 text-blue-500 px-1.5 rounded-sm">第7位</span>
                  </div>
                  <div className="flex items-center">
                    <div className="flex -space-x-1 mr-1">
                       {[1, 2, 3].map(j => <img key={j} className="w-4 h-4 rounded-full ring-1 ring-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${j*i+100}`} alt=""/>)}
                    </div>
                    <span>{5080 + i * 1000}人查看</span>
                  </div>
                </div>
             </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default AuthorProfile;
