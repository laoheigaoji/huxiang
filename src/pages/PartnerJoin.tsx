import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, Headset, Info, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const PartnerJoin = () => {
  const navigate = useNavigate();
  const [selectedType, setSelectedType] = useState('agent'); // 'author' or 'agent'

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-[#fff9f9] min-h-screen pb-32"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">入驻合作</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">a0275.com.cn</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* Red Page Header */}
      <div className="bg-gradient-to-b from-[#d32f2f] to-[#e53935] px-4 py-4 flex flex-col items-center relative">
        <div className="w-full flex items-center justify-between text-white mb-6">
          <ChevronLeft className="w-7 h-7 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="text-lg font-bold">入驻合作</h2>
          <Headset className="w-6 h-6 cursor-pointer" />
        </div>

        {/* Stepper */}
        <div className="w-full max-w-xs flex items-center justify-between relative px-2 mb-2">
          {/* Connecting Lines */}
          <div className="absolute top-3 left-8 right-8 h-[1px] bg-white/30 z-0"></div>
          
          {/* Step 1 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-[#e53935] text-xs font-bold mb-2">
              1
            </div>
            <span className="text-[11px] text-white font-medium">合作类型</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2">
              2
            </div>
            <span className="text-[11px] text-white/60 font-medium">基本信息</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center z-10">
            <div className="w-6 h-6 bg-white/30 rounded-full flex items-center justify-center text-white text-xs font-bold mb-2">
              3
            </div>
            <span className="text-[11px] text-white/60 font-medium">提交申请</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-4 px-4 space-y-4">
        
        {/* Section: Account Information */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center bg-[#fff8f8]">
            <div className="w-1 h-4 bg-[#e53935] rounded-full mr-2"></div>
            <h3 className="text-[15px] font-bold text-[#b71c1c]">账号信息</h3>
          </div>
          <div className="p-4 flex items-center justify-between relative">
            <div className="space-y-4 flex-1">
              <div className="flex items-center text-[14px]">
                <span className="text-gray-400 w-24">用户昵称</span>
                <span className="text-gray-800 font-medium ml-4">全村人的希望</span>
              </div>
              <div className="flex items-center text-[14px]">
                <span className="text-gray-400 w-24">用户ID</span>
                <span className="text-gray-800 font-medium ml-4">967</span>
              </div>
              <div className="flex items-center text-[14px]">
                <span className="text-gray-400 w-24">手机号</span>
                <span className="text-gray-400 font-medium ml-4">暂无</span>
              </div>
            </div>
            <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
              <img 
                src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&q=80&w=400" 
                alt="Avatar" 
                className="w-full h-full object-cover" 
              />
            </div>
          </div>
        </div>

        {/* Section: Cooperation Type */}
        <div className="bg-white rounded-xl overflow-hidden shadow-sm">
          <div className="px-4 py-3 flex items-center justify-between bg-[#fff8f8]">
            <div className="flex items-center">
              <div className="w-1 h-4 bg-[#e53935] rounded-full mr-2"></div>
              <h3 className="text-[15px] font-bold text-[#b71c1c]">合作类型</h3>
            </div>
            <span className="text-[11px] text-[#e53935] font-medium opacity-80">每个账号仅能申请一种类型</span>
          </div>
          
          <div className="px-4 py-2">
            {/* Option: Author */}
            <div 
              className="py-5 flex items-center border-b border-gray-50 cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => setSelectedType('author')}
            >
              <div className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${selectedType === 'author' ? 'border-[#e53935]' : 'border-gray-200'}`}>
                {selectedType === 'author' && <div className="w-3 h-3 bg-[#e53935] rounded-full"></div>}
              </div>
              <div className="flex items-center">
                <span className="text-[16px] font-bold text-gray-800 mr-2">优质作者</span>
                <span className="text-[13px] text-gray-400">(分享个人优质内容观点)</span>
              </div>
            </div>

            {/* Option: Agent */}
            <div 
              className="py-5 flex items-center cursor-pointer active:opacity-70 transition-opacity"
              onClick={() => setSelectedType('agent')}
            >
              <div className="mr-4">
                {selectedType === 'agent' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#e53935] fill-[#e53935] text-white" />
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
                )}
              </div>
              <div className="flex items-center">
                <span className="text-[16px] font-bold text-gray-800 mr-2">合作代理</span>
                <span className="text-[13px] text-gray-400">(代理商家粉丝团队模式)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Help Link */}
        <div className="pt-4 flex items-center justify-center space-x-1.5 text-[14px]">
          <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center text-gray-400 text-xs font-bold">?</div>
          <p className="text-gray-400">
            如有疑问，请<span className="text-[#e53935] font-bold mx-0.5">咨询客服</span>处理
          </p>
        </div>

        {/* Warning Toast (Simulated) */}
        <div className="mt-8 bg-[#fffbe6] border border-[#ffe58f] rounded-lg p-3 flex items-start">
          <AlertTriangle className="w-4 h-4 text-[#faad14] mt-0.5 mr-2 shrink-0" />
          <div className="text-[13px] text-[#856404] font-bold">温馨提示</div>
        </div>

      </div>

      {/* Fixed Sticky Button */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
        <button className="w-full bg-[#d32f2f] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform">
          下一步
        </button>
      </div>

      {/* Bottom Browser Navigation Mockup */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#f8f8f8] flex items-center justify-around z-50 border-t border-gray-200 px-20">
         <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         <div className="w-6 h-6 flex items-center justify-center rotate-180">
            <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         </div>
      </div>

    </motion.div>
  );
};

export default PartnerJoin;
