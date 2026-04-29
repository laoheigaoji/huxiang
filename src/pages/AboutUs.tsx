import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-[#f8f8f8] min-h-screen"
    >
      <div className="bg-[#b71c1c] px-4 py-4 flex items-center justify-center relative shadow-sm header-safe-area">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">关于我们</h2>
      </div>

      <div className="flex flex-col items-center mt-12 bg-white py-12 shadow-sm">
        <div className="w-20 h-20 bg-[#b71c1c] rounded-2xl flex items-center justify-center shadow-lg mb-4">
           {/* Placeholder for App Logo */}
          <span className="text-white font-bold text-2xl tracking-widest">智料</span>
        </div>
        <h3 className="text-[20px] font-bold text-gray-800 mb-1">智料汇享</h3>
        <p className="text-sm text-gray-500 mb-8">版本 v1.0.0</p>
        
        <div className="w-full px-6 text-gray-600 text-[15px] leading-relaxed text-center">
            致力于为广大用户提供专业、便捷的信息获取和价值分享平台。我们依靠先进的数据模型和庞大的活跃作者社群，为您带来一手的高价值内容。
        </div>
      </div>

      <div className="mt-4 bg-white shadow-sm">
        <div className="px-4 py-4 border-b border-gray-50 flex justify-between">
            <span className="text-gray-800 text-[16px]">官方网站</span>
            <span className="text-gray-500">www.zhiliaohx.com</span>
        </div>
        <div className="px-4 py-4 border-b border-gray-50 flex justify-between">
            <span className="text-gray-800 text-[16px]">客服邮箱</span>
            <span className="text-gray-500">service@zhiliaohx.com</span>
        </div>
        <div className="px-4 py-4 flex justify-between">
            <span className="text-gray-800 text-[16px]">官方微信公众号</span>
            <span className="text-gray-500">智料汇享</span>
        </div>
      </div>

      <div className="text-center mt-12 text-xs text-gray-400">
        <p>Copyright © {new Date().getFullYear()} 智料汇享</p>
        <p className="mt-1">All Rights Reserved</p>
      </div>

    </motion.div>
  );
};

export default AboutUs;
