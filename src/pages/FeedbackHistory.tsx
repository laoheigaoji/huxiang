import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Feedback } from '../types';
import { motion } from 'motion/react';

const FeedbackHistory = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFeedbackHistory().then(data => {
      console.log('Feedback history data:', data);
      setHistory(Array.isArray(data) ? data : []);
      setLoading(false);
    });
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f8fbff] min-h-[100dvh]"
    >
      <div className="px-6 py-4 flex items-center sticky top-0 bg-[#f8fbff] z-20">
        <ChevronLeft className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[17px] font-bold text-gray-900 text-center flex-1 pr-6">反馈工单</h2>
      </div>

      <div className="px-4 space-y-4">
        {loading ? (
          <div className="text-center py-10 text-gray-400">加载中...</div>
        ) : history.length === 0 ? (
          <div className="text-center py-10 text-gray-400">暂无反馈记录</div>
        ) : (
          history.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex justify-between mb-2">
                <span className="text-[14px] font-bold text-gray-900">{item.scenario}</span>
                <span className="text-[12px] text-gray-400">{item.time}</span>
              </div>
              <p className="text-[14px] text-gray-700 mb-2">{item.content}</p>
              {item.images && item.images.length > 0 && (
                <div className="flex gap-2 mb-2">
                  {item.images.map((img, i) => (
                    <img key={i} src={img} className="w-16 h-16 rounded object-cover" />
                  ))}
                </div>
              )}
              {item.reply && (
                <div className="bg-blue-50 rounded-lg p-3 mt-2">
                  <p className="text-[12px] font-bold text-blue-800 mb-1">管理员回复：</p>
                  <p className="text-[13px] text-blue-900">{item.reply}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default FeedbackHistory;
