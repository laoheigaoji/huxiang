import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';

const MessageDetail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;

  if (!message) {
    return (
      <div className="bg-gray-50 min-h-screen p-10 flex flex-col items-center justify-center">
        <p className="text-gray-500 mb-4">找不到消息详情</p>
        <button onClick={() => navigate(-1)} className="text-red-500 font-bold">返回</button>
      </div>
    );
  }

  const contentParagraphs = message.content.split('\n');

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-[#d32f2f] min-h-screen"
    >
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 flex items-center border-b border-gray-100 shadow-sm">
        <ChevronLeft className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="flex-1 text-center">
          <h1 className="text-lg font-black text-gray-900 pr-8 tracking-tight">消息详情</h1>
        </div>
      </div>

      <div className="p-4 safe-area-bottom">
        {/* White Card */}
        <div className="bg-white rounded-3xl p-8 min-h-[85vh] shadow-xl">
          <h2 className="text-2xl font-black text-gray-900 text-center leading-tight mb-4 tracking-tighter">
            {message.title}
          </h2>
          
          <div className="text-center mb-6">
            <span className="text-xs text-gray-400 font-bold tracking-widest uppercase bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
              {new Date(message.time).toLocaleString('zh-CN', { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit', 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
          </div>

          <div className="h-px bg-gray-100 w-full mb-8" />

          <div className="space-y-6">
            {contentParagraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-gray-600 text-base leading-relaxed text-left font-medium">
                {paragraph}
              </p>
            ))}
          </div>

          <div className="mt-20 pt-10 border-t border-gray-50 text-center">
             <p className="text-[10px] text-gray-300 font-black tracking-widest uppercase">
               智料汇享 · 官方通知
             </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageDetail;
