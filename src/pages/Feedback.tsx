import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronDown, Camera, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Feedback = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-[#f2f9ff] min-h-screen pb-32"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">平台投诉</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">a0275.com.cn</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* Hero Section with Mascot */}
      <div className="relative bg-gradient-to-b from-[#e3f2fd] to-[#f2f9ff] h-40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="px-4 py-4 flex items-center relative z-10">
          <ChevronLeft className="w-7 h-7 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="ml-24 text-[18px] font-bold text-gray-900">意见反馈</h2>
        </div>
        {/* Mascot Robot Image Placeholder */}
        <div className="absolute right-0 bottom-0 w-48 h-32 flex items-end justify-end pointer-events-none">
           <div className="relative">
              <div className="w-32 h-32 bg-blue-200/50 rounded-full flex items-center justify-center filter blur-xl absolute -bottom-10 -right-10"></div>
              <img 
                src="https://img.icons8.com/color/240/robot-tapi.png" 
                alt="mascot" 
                className="w-32 h-32 object-contain relative z-10 opacity-80" 
              />
           </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-6 -mt-4 relative z-20 space-y-6">
        
        {/* Scenario Selection */}
        <div className="space-y-3">
          <label className="text-[16px] font-bold text-gray-900">场景问题：</label>
          <div className="bg-white rounded-xl h-14 px-4 flex items-center justify-between border border-gray-50 shadow-sm active:bg-gray-50 cursor-pointer">
            <span className="text-[#999999] text-[15px] font-medium">请选择</span>
            <ChevronDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-[16px] font-bold text-gray-900">请上传问题说明图片，最多6张：</label>
          <div className="flex space-x-3">
            <div className="w-24 h-24 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center active:bg-gray-50 cursor-pointer">
              <Camera className="w-7 h-7 text-gray-300" />
            </div>
            <div className="w-24 h-24 bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center active:bg-gray-50 cursor-pointer">
              <Plus className="w-7 h-7 text-gray-300" strokeWidth={1} />
            </div>
          </div>
          <p className="text-[12px] text-gray-400 font-medium">
            单张图片建议1M以内，超过1M的图片会被过滤
          </p>
        </div>

        {/* Improvement Description */}
        <div className="space-y-3">
          <label className="text-[16px] font-bold text-gray-900">改善方式：</label>
          <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-50">
            <textarea 
              placeholder="请输入文字描述" 
              className="w-full h-32 p-4 text-[15px] font-medium focus:outline-none placeholder:text-[#999999]"
            ></textarea>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="space-y-3">
          <label className="text-[16px] font-bold text-gray-900">联系电话：</label>
          <div className="bg-white rounded-xl h-14 px-4 flex items-center shadow-sm border border-gray-50">
            <input 
              type="tel" 
              placeholder="请输入联系电话" 
              className="w-full bg-transparent text-[15px] font-medium focus:outline-none placeholder:text-[#999999]" 
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button className="w-full bg-[#e53935] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform">
            提交
          </button>
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

export default Feedback;
