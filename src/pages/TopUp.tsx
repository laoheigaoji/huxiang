import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const TopUp = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('alipay1');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-white min-h-screen pb-32"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">充值</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">paydo.xzzsff.com</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* App Header */}
      <div className="bg-white px-4 py-3 flex items-center justify-center border-b border-gray-50 relative">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-gray-900">充值</h2>
      </div>

      <div className="p-4">
        {/* Balance Card */}
        <div className="bg-[#e53935] rounded-lg p-6 text-white relative">
          <p className="text-[14px] opacity-90 font-medium">账户余额 (元)</p>
          <p className="text-[36px] font-bold mt-4 flex items-baseline">
            <span className="text-[20px] mr-1">¥</span>0.00
          </p>
          <button className="absolute top-4 right-4 bg-white text-[#e53935] px-4 py-1.5 rounded-full text-[13px] font-bold">
            充值记录
          </button>
        </div>

        {/* Amount Input */}
        <div className="mt-8">
          <p className="text-[15px] font-bold text-gray-800">充值金额 (元) :</p>
          <div className="mt-4 bg-[#f8f8f8] rounded-lg p-4 flex items-center h-16 border border-gray-50">
             <span className="text-[18px] font-bold mr-3 text-gray-900">¥</span>
             <input 
               type="number" 
               placeholder="请输入金额" 
               className="text-[20px] font-bold bg-transparent w-full focus:outline-none placeholder:text-gray-300 placeholder:font-medium" 
             />
          </div>
          <p className="mt-3 text-[13px] text-gray-400 font-medium">
            单次最低充值金额100元，最高充值金额5000元
          </p>
          <p className="mt-1 text-[13px] text-[#00c853] font-medium">
            充值无手续费，实时到账
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mt-8">
          <p className="text-[15px] font-bold text-gray-800 mb-4">充值方式 :</p>
          <div className="space-y-3">
            {/* Alipay 1 */}
            <div 
              className={`rounded-xl p-4 flex items-center justify-between border transition-all active:bg-gray-50 ${selectedMethod === 'alipay1' ? 'border-[#e53935] bg-[#fffcfc]' : 'border-gray-100 bg-gray-50/30'}`}
              onClick={() => setSelectedMethod('alipay1')}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#2196f3] rounded-full flex items-center justify-center mr-3">
                   <span className="text-white text-[15px] font-bold italic">支</span>
                </div>
                <span className="text-[15px] font-medium text-gray-900">支付宝</span>
              </div>
              <div>
                {selectedMethod === 'alipay1' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#e53935] fill-[#e53935] text-white" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
              </div>
            </div>

            {/* Alipay 2 */}
            <div 
              className={`rounded-xl p-4 flex items-center justify-between border transition-all active:bg-gray-50 ${selectedMethod === 'alipay2' ? 'border-[#e53935] bg-[#fffcfc]' : 'border-gray-100 bg-gray-50/30'}`}
              onClick={() => setSelectedMethod('alipay2')}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#2196f3] rounded-full flex items-center justify-center mr-3">
                   <span className="text-white text-[15px] font-bold italic">支</span>
                </div>
                <span className="text-[15px] font-medium text-gray-900">支付宝2</span>
              </div>
              <div>
                {selectedMethod === 'alipay2' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#e53935] fill-[#e53935] text-white" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
              </div>
            </div>

            {/* WeChat 2 */}
            <div 
              className={`rounded-xl p-4 flex items-center justify-between border transition-all active:bg-gray-50 ${selectedMethod === 'wechat2' ? 'border-[#e53935] bg-[#fffcfc]' : 'border-gray-100 bg-gray-50/30'}`}
              onClick={() => setSelectedMethod('wechat2')}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#00c853] rounded-full flex items-center justify-center mr-3">
                   <span className="text-white text-[15px] font-bold italic">微</span>
                </div>
                <span className="text-[15px] font-medium text-gray-900">微信支付2</span>
              </div>
              <div>
                {selectedMethod === 'wechat2' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#e53935] fill-[#e53935] text-white" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="mt-8 flex items-center justify-center space-x-2">
           <div className="w-4 h-4 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
             <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
           </div>
           <span className="text-[13px] text-gray-800">
             支付即视为同意 <span className="text-[#3b82f6] underline">《支付协议》</span>
           </span>
        </div>

        {/* Confirm Button */}
        <button className="w-full bg-[#e53935] text-white font-bold py-4 rounded-full mt-6 shadow-xl shadow-red-100 active:scale-95 transition-transform text-[17px]">
          确认支付
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

export default TopUp;
