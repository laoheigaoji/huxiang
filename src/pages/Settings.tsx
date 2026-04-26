import React from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const SettingItem = ({ label }: { label: string }) => (
  <div className="bg-white px-4 py-4 flex items-center justify-between active:bg-gray-50 cursor-pointer border-b border-gray-50 last:border-b-0">
    <span className="text-[17px] text-gray-800 font-medium">{label}</span>
    <ChevronRight className="w-6 h-6 text-gray-300" />
  </div>
);

const Settings = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-[#f8f8f8] min-h-screen pb-20"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">设置</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">a0275.com.cn</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* App Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-50 relative">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-gray-900">系统设置</h2>
      </div>

      {/* Settings List */}
      <div className="mt-2 shadow-sm">
        <SettingItem label="账号安全" />
      </div>

      <div className="mt-2 shadow-sm">
        <SettingItem label="隐私协议" />
        <SettingItem label="用户协议" />
      </div>

      <div className="mt-2 shadow-sm">
        <SettingItem label="关于我们" />
      </div>

      {/* Logout Button */}
      <div className="mt-2 bg-white flex items-center justify-center py-4 active:bg-gray-50 cursor-pointer shadow-sm">
        <span className="text-[#e53935] text-[17px] font-bold">退出登录</span>
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

export default Settings;
