import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronDown, Camera, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Feedback = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f0f7ff] min-h-screen pb-20 relative overflow-hidden"
    >
      {/* Sky Background with Clouds Effect */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#b3e5fc] to-[#f0f7ff] -z-10">
        <div className="absolute top-10 left-10 w-32 h-12 bg-white/40 blur-2xl rounded-full"></div>
        <div className="absolute top-20 right-0 w-48 h-16 bg-white/30 blur-2xl rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-4 py-8 flex items-center relative z-10">
        <ChevronLeft className="w-7 h-7 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[20px] font-bold text-gray-900 text-center flex-1 pr-6">意见反馈</h2>
      </div>

      {/* Mascot Robot (Same as FAQ) */}
      <div className="flex justify-center -mt-4 mb-4 relative">
        <div className="w-56 h-40 relative flex items-center justify-center">
          <div className="relative group">
            {/* Blue Sphere */}
            <div className="w-24 h-24 bg-gradient-to-br from-[#80d8ff] to-[#40c4ff] rounded-full shadow-lg flex items-center justify-center relative border-4 border-white/50">
               <div className="flex space-x-3 mt-1">
                 <div className="w-2.5 h-2.5 bg-blue-800 rounded-full"></div>
                 <div className="w-2.5 h-2.5 bg-blue-800 rounded-full"></div>
               </div>
               <div className="absolute bottom-6 w-8 h-3 border-b-2 border-blue-800 rounded-full"></div>
               <div className="absolute -top-3 -left-4 -right-4 h-20 border-[10px] border-blue-300/60 rounded-full pointer-events-none"></div>
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-10 bg-blue-400/80 rounded-lg border-2 border-white/30"></div>
               <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-10 bg-blue-400/80 rounded-lg border-2 border-white/30"></div>
            </div>
            <div className="absolute inset-0 bg-blue-200/40 blur-3xl -z-10 rounded-full scale-150"></div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="px-5 -mt-4 relative z-20 space-y-5">
        
        {/* Scenario Selection */}
        <div className="space-y-4">
          <label className="text-[17px] font-bold text-gray-900">场景问题：</label>
          <div className="bg-white rounded-xl h-14 px-5 flex items-center justify-between border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] active:bg-gray-50 cursor-pointer">
            <span className="text-[#cccccc] text-[15px] font-medium">请选择</span>
            <ChevronDown className="w-5 h-5 text-gray-300" />
          </div>
        </div>

        {/* Image Upload */}
        <div className="space-y-4 pt-2">
          <label className="text-[17px] font-bold text-gray-900">请上传问题说明图片，最多6张：</label>
          <div className="flex flex-wrap gap-4">
            <div className="w-[100px] h-[100px] bg-white rounded-xl border border-dashed border-gray-200 flex items-center justify-center active:bg-gray-50 cursor-pointer">
              <Camera className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <div className="w-[100px] h-[100px] bg-[#f8f9fa] rounded-xl border border-dashed border-gray-200 flex items-center justify-center active:bg-gray-50 cursor-pointer">
              <Plus className="w-8 h-8 text-gray-300" strokeWidth={1} />
            </div>
          </div>
          <p className="text-[13px] text-gray-400 font-medium">
            单张图片建议1M以内，超过1M的图片会被过滤
          </p>
        </div>

        {/* Improvement Description */}
        <div className="space-y-4 pt-2">
          <label className="text-[17px] font-bold text-gray-900">改善方式：</label>
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
            <textarea 
              placeholder="请输入文字描述" 
              className="w-full h-36 p-5 text-[15px] font-medium focus:outline-none placeholder:text-[#cccccc] resize-none"
            ></textarea>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="space-y-4 pt-2 pb-8">
          <label className="text-[17px] font-bold text-gray-900">联系电话：</label>
          <div className="bg-white rounded-xl h-14 px-5 flex items-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
            <input 
              type="tel" 
              placeholder="请输入联系电话" 
              className="w-full bg-transparent text-[15px] font-medium focus:outline-none placeholder:text-[#cccccc]" 
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
          <button className="w-full bg-[#ef5350] text-white font-bold py-[15px] rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform">
            提交
          </button>
        </div>
      </div>

    </motion.div>
  );
};

export default Feedback;
