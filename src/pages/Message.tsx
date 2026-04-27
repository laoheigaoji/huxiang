import React, { useState, useEffect } from 'react';
import { ChevronLeft, Bell, Settings, MessageSquare, Tag, Volume2, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const MessageItem = ({ type, title, content, time, onClick }: any) => {
  const getIcon = () => {
    switch (type) {
      case 'system': return { icon: Bell, color: 'bg-orange-400' };
      case 'activity': return { icon: Tag, color: 'bg-blue-400' };
      case 'follow': return { icon: UserPlus, color: 'bg-green-400' };
      case 'activity_interaction': return { icon: MessageSquare, color: 'bg-red-400' };
      default: return { icon: Bell, color: 'bg-gray-400' };
    }
  };
  
  const { icon: Icon, color } = getIcon();
  const displayTime = new Date(time).toLocaleDateString() === new Date().toLocaleDateString() 
    ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : new Date(time).toLocaleDateString([], { month: '2-digit', day: '2-digit' });

  return (
    <div onClick={onClick} className="flex items-center px-4 py-4 bg-white border-b border-gray-50 active:bg-gray-50 transition-colors cursor-pointer">
      <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white shrink-0 shadow-sm transition-transform active:scale-90`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-gray-900 text-sm tracking-tight">{title}</h3>
          <span className="text-[10px] text-gray-400 font-medium">{displayTime}</span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500 line-clamp-1 pr-4 leading-relaxed">{content}</p>
        </div>
      </div>
    </div>
  );
};

const Message = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const data = await api.getMessages();
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-gray-50 min-h-screen"
    >
      {/* Header */}
      <div className="bg-white px-4 py-4 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100 shadow-sm">
        <button onClick={() => navigate(-1)} className="w-10 flex items-center justify-start">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-lg font-black text-gray-900 tracking-tight">消息通知</h1>
        <div className="w-10 flex justify-end">
          <Settings className="w-5 h-5 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : messages.length > 0 ? (
        <div className="mt-2 shadow-sm rounded-2xl overflow-hidden mx-3 border border-gray-100">
          {messages.map(msg => (
            <MessageItem 
              key={msg.id} 
              {...msg} 
              onClick={() => navigate(`/message/${msg.id}`, { state: { message: msg } })}
            />
          ))}
        </div>
      ) : (
        <div className="mt-20 px-6 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <Bell className="w-10 h-10 text-gray-300" />
          </div>
          <h3 className="text-gray-900 font-bold mb-1">暂无新消息</h3>
          <p className="text-gray-400 text-xs">有些活动和通知会在这里显示</p>
        </div>
      )}

      <div className="mt-8 px-4">
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400 text-[11px] font-medium uppercase tracking-wider">没有更多私信联系人</p>
          <button className="mt-3 bg-red-50 text-red-600 px-6 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform">
            查看在线客服
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Message;
