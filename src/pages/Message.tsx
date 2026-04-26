import React from 'react';
import { ChevronLeft, Bell, Settings, MessageSquare, Tag, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';

const MessageItem = ({ icon: Icon, color, title, desc, time, badge }: any) => (
  <div className="flex items-center px-4 py-4 bg-white border-b border-gray-50 active:bg-gray-50 transition-colors">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="ml-4 flex-1">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
        <span className="text-[10px] text-gray-400">{time}</span>
      </div>
      <div className="flex justify-between items-center">
        <p className="text-xs text-gray-500 line-clamp-1 pr-4">{desc}</p>
        {badge > 0 && (
          <span className="bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0">
            {badge}
          </span>
        )}
      </div>
    </div>
  </div>
);

const Message = () => {
  const messages = [
    {
      id: 1,
      icon: Bell,
      color: 'bg-orange-400',
      title: '系统通知',
      desc: '您的金币充值已成功入账，快去看看吧！',
      time: '10:25',
      badge: 1
    },
    {
      id: 2,
      icon: Tag,
      color: 'bg-blue-400',
      title: '优惠活动',
      desc: '专享红单包月套餐，限时8折优惠中...',
      time: '昨天',
      badge: 0
    },
    {
      id: 3,
      icon: Volume2,
      color: 'bg-red-400',
      title: '开奖播报',
      desc: '第2024102期已经开奖，点击查看详细结果。',
      time: '昨天',
      badge: 5
    },
    {
      id: 4,
      icon: MessageSquare,
      color: 'bg-green-400',
      title: '方案动态',
      desc: '您关注的大神 [红单捕手] 发布了新方案！',
      time: '前天',
      badge: 0
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <div className="w-10"></div>
        <h1 className="text-lg font-bold text-gray-900">消息通知</h1>
        <div className="w-10 flex justify-end">
          <Settings className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="mt-2 shadow-sm rounded-xl overflow-hidden mx-2">
        {messages.map(msg => (
          <MessageItem key={msg.id} {...msg} />
        ))}
      </div>

      <div className="mt-8 px-4">
        <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-xs">没有更多私信联系人</p>
          <button className="mt-2 text-red-500 text-xs font-medium">查看在线客服</button>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
