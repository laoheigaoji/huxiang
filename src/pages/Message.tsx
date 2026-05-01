import React, { useState, useEffect } from 'react';
import { X, MoreHorizontal, Volume2, SquareCheck, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

const MessageItem = ({ id, title, content, time, isRead, onClick }: any) => {
  const displayTime = new Date(time).toLocaleDateString([], { month: '2-digit', day: '2-digit' }) + ' ' + 
                      new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <div 
      onClick={() => onClick(id)} 
      className="flex items-start px-4 py-4 bg-white border-b border-gray-50 active:bg-gray-50 transition-colors cursor-pointer"
    >
      <div className="w-12 h-12 rounded-full bg-[#bfdbfe]/40 flex items-center justify-center text-[#60a5fa] shrink-0">
        <Volume2 className="w-6 h-6 fill-current" />
      </div>
      <div className="ml-3 flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-1">
          <div className="flex items-center space-x-1.5 overflow-hidden">
            <h3 className={`text-gray-900 text-[15px] font-bold truncate ${!isRead ? 'max-w-[85%]' : 'max-w-full'}`}>
              {title}
            </h3>
            {!isRead && (
              <div className="w-2 h-2 bg-red-500 rounded-full shrink-0" />
            )}
          </div>
          <span className="text-[11px] text-gray-400 shrink-0 ml-2">{displayTime}</span>
        </div>
        <p className="text-[13px] text-gray-400 line-clamp-1 leading-relaxed">
          {content}
        </p>
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
      // Add unread status simulation since real API might not have it
      setMessages(data.map((m: any, i: number) => ({ ...m, isRead: i > 2 })));
    } catch (err) {
      console.error('Failed to fetch messages', err);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = () => {
    setMessages(msgs => msgs.map(m => ({ ...m, isRead: true })));
    localStorage.setItem('message_read', 'true');
    // We could use an event or state management here, but App.tsx will pick it up on next re-render or navigation
  };

  const handleItemClick = (id: string) => {
    setMessages(msgs => msgs.map(m => m.id === id ? { ...m, isRead: true } : m));
    const msg = messages.find(m => m.id === id);
    navigate(`/message/${id}`, { state: { message: msg } });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-white h-screen flex flex-col overflow-hidden"
    >
      {/* Fixed Top Section */}
      <div className="flex-none bg-white z-30">
        {/* Header */}
        <div className="px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="w-10">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </button>
          <h1 className="text-[17px] font-bold text-gray-900">消息中心</h1>
          <div className="w-10 flex justify-end">
             <SquareCheck className="w-5 h-5 text-gray-400 cursor-pointer" onClick={markAllAsRead} />
          </div>
        </div>

        {/* Tabs - Centered */}
        <div className="px-0">
          <div className="flex justify-center border-b-2 border-[#ef4444]">
            <div className="relative">
              <p className="text-[#ef4444] font-bold text-[18px] py-3 px-6 text-center">平台公告</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message List - Scrollable */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : messages.length > 0 ? (
          <div className="pb-24">
            {messages.map(msg => (
              <MessageItem 
                key={msg.id} 
                {...msg} 
                onClick={handleItemClick}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-400 text-sm">暂无新消息</p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Message;

