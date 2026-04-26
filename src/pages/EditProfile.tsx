import React from 'react';
import { ChevronLeft, X, MoreHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const EditProfile = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      exit={{ opacity: 0, scale: 0.95 }} 
      className="bg-white min-h-screen pb-32"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">个人信息</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">a0275.com.cn</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* App Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-50 relative">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-gray-900">个人中心</h2>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center py-8">
        <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg border-2 border-white">
          <img 
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400" 
            alt="Avatar" 
            className="w-full h-full object-cover" 
          />
        </div>
      </div>

      {/* Form Fields */}
      <div className="px-6 space-y-4">
        {/* Nickname */}
        <div className="bg-[#f8f8f8] rounded-md h-14 flex items-center px-4">
          <span className="text-[16px] text-gray-800 font-medium">昵称：</span>
          <input 
            type="text" 
            defaultValue="全村人的希望" 
            className="ml-4 flex-1 bg-transparent text-[16px] text-gray-800 font-medium focus:outline-none" 
          />
        </div>

        {/* Phone Number */}
        <div className="flex space-x-3">
          <div className="flex-1 bg-[#f8f8f8] rounded-md h-14 flex items-center px-4">
            <span className="text-[16px] text-gray-800 font-medium whitespace-nowrap">手机号：</span>
            <input 
              type="tel" 
              placeholder="" 
              className="ml-4 flex-1 bg-transparent text-[16px] text-gray-800 font-medium focus:outline-none" 
            />
          </div>
          <button className="w-24 bg-[#e53935] text-white font-bold rounded-md active:scale-95 transition-transform text-[15px]">
            绑定
          </button>
        </div>

        {/* Password */}
        <div className="flex space-x-3">
          <div className="flex-1 bg-[#f8f8f8] rounded-md h-14 flex items-center px-4">
            <span className="text-[16px] text-gray-800 font-medium whitespace-nowrap">登录密码：</span>
            <span className="ml-4 flex-1 text-[16px] text-gray-800 font-medium">******</span>
          </div>
          <button className="w-24 bg-[#e53935] text-white font-bold rounded-md active:scale-95 transition-transform text-[15px]">
            设置
          </button>
        </div>

        {/* ID Verification */}
        <div className="flex space-x-3">
          <div className="flex-1 bg-[#f8f8f8] rounded-md h-14 flex items-center px-4">
            <span className="text-[16px] text-gray-800 font-medium whitespace-nowrap">实名认证：</span>
            <span className="ml-4 flex-1 text-[16px] text-red-600 font-bold">未认证</span>
          </div>
          <button className="w-24 bg-[#e53935] text-white font-bold rounded-md active:scale-95 transition-transform text-[15px]">
            未认证
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
        <button className="w-full bg-[#e53935] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform">
          保存修改
        </button>
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

export default EditProfile;
