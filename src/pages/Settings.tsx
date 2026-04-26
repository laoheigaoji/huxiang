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
      className="bg-[#f8f8f8] min-h-screen pb-12"
    >
      {/* App Header */}
      <div className="bg-[#e53935] px-4 py-4 flex items-center justify-center relative shadow-sm">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">系统设置</h2>
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

    </motion.div>
  );
};

export default Settings;
