import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Search, ClipboardList, Download, User as UserIcon, QrCode, ScrollText, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';

const Invite = () => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [friends, setFriends] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const data = await api.getInvitedFriends();
        setFriends(data);
      } catch (err) {
        console.error('Failed to fetch friends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, []);

  const filteredFriends = friends.filter(f => 
    f.nickname?.includes(searchQuery) || f.username?.includes(searchQuery)
  );

  const posters = [
    {
      id: 0,
      title: '分享码一',
      bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
      mainText: '大师云集\n独家好料',
      theme: 'yellow'
    },
    {
      id: 1,
      title: '分享码二',
      bg: 'https://images.unsplash.com/photo-1518173946687-a4c8a3b778f1?auto=format&fit=crop&q=80&w=800',
      mainText: '精准模型\n实时获利',
      theme: 'blue'
    },
    {
      id: 2,
      title: '分享码三',
      bg: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
      mainText: '稳定复利\n财富自由',
      theme: 'red'
    }
  ];

  const posterRef = React.useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!posterRef.current) return;
    
    try {
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(posterRef.current, {
            backgroundColor: null,
            scale: 2, // Higher quality
        });
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `invite-poster-${activeTab}.png`;
        link.href = dataUrl;
        link.click();
    } catch (err) {
        console.error('Failed to generate poster', err);
        alert('保存海报失败，请尝试截图保存');
    }
  };

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const baseUrl = window.location.origin;
  const referralUrl = `${baseUrl}/login?ref=${user?.id || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    alert('已复制链接到剪贴板');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#FFF5EB] min-h-screen pb-10">
      {/* Header - Matches Screenshot */}
      <div className="bg-[#FF9F6A] h-60 relative overflow-hidden flex flex-col items-center pt-6">
        <div className="px-4 flex items-center justify-between w-full relative z-10 text-white mb-6">
          <ChevronLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="text-xl font-bold">邀请有礼</h2>
          <div className="flex gap-4">
            <span className="text-sm">邀请记录</span>
            {/* Dots */}
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Banner Text - Matches Screenshot Mood */}
        <div className="text-center px-4 w-full">
           <h1 className="text-3xl font-black text-white italic drop-shadow-lg tracking-tight mb-3">邀请好友 得佣金</h1>
           <div className="inline-block bg-white/20 backdrop-blur-sm text-white px-6 py-1.5 rounded-full text-sm font-bold border border-white/30">好友消费 得佣金</div>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-20">
        {/* CTA Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-2 mb-6 flex items-center justify-between">
           <div className="font-bold text-gray-800 text-lg ml-4">立即邀请</div>
           <div className="flex items-center bg-gradient-to-r from-orange-400 to-red-500 text-white rounded-full px-6 py-3 font-bold shadow-md cursor-pointer active:scale-95 transition-transform" onClick={() => setShowQR(true)}>
             <span className="mr-2">分享二维码</span>
             <div className="bg-white/30 p-1 rounded-full"><span className="text-lg">👆</span></div>
           </div>
        </div>

        {/* List Section */}
        <div className="bg-white rounded-2xl shadow-sm min-h-[300px] overflow-hidden">
           <div className="bg-[#FFE4CC] text-orange-900 py-3 px-6 text-center font-bold text-sm">
             已成功邀请 {friends.length} 位好友
           </div>
           
           <div className="p-4">
             <div className="relative mb-4">
               <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                type="text" 
                placeholder="请输入" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#FFF9F2] border border-[#F8E1C9] rounded-full py-2 pl-9 pr-20 text-sm focus:outline-none" 
               />
               <button className="absolute right-0 top-0 bottom-0 bg-[#FF9F6A] text-white px-4 rounded-full text-sm font-bold">搜索</button>
             </div>

             {loading ? (
               <div className="flex justify-center py-12">
                 <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
               </div>
             ) : filteredFriends.length > 0 ? (
               <div className="space-y-4">
                 {filteredFriends.map((friend) => (
                   <div key={friend.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors">
                     <div className="flex items-center space-x-3">
                       <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                       <div>
                         <p className="text-sm font-bold text-gray-800">{friend.nickname}</p>
                         <p className="text-[10px] text-gray-400">账号: {friend.username}</p>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-32 h-32 bg-[#FFF0E0] rounded-full flex items-center justify-center mb-4">
                    <ScrollText className="w-16 h-16 text-[#FF9F6A]" />
                  </div>
                  <p className="text-sm text-[#FF9F6A] font-bold">暂无数据</p>
               </div>
             )}
           </div>
        </div>
      </div>

      {/* QR Code Modal (Bottom Sheet Style) */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[150] flex items-end justify-center" onClick={() => setShowQR(false)}>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            />
            
            <motion.div 
              initial={{ y: "100%" }} 
              animate={{ y: 0 }} 
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden relative pb-8"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>

              <div className="p-4 flex flex-col items-center">
                 <div className="w-full flex justify-end">
                    <X className="w-6 h-6 text-gray-300 cursor-pointer" onClick={() => setShowQR(false)} />
                 </div>
                 
                 <div className="text-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800">邀好友 享好料</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">传递好料.收获回报</p>
                 </div>
                 
                 {/* Poster Canvas / Image - FIX: Use explicit hex colors instead of Tailwind colors to avoid oklch error */}
                 <div ref={posterRef} className="relative w-full aspect-[4/5] max-w-[280px] bg-gray-50 rounded-2xl overflow-hidden shadow-xl mx-auto">
                    <AnimatePresence mode="wait">
                      {/* Different background styles based on tab */}
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute inset-0"
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: activeTab === 0 ? '#fff7ed' : activeTab === 1 ? '#eff6ff' : '#fef2f2' }}>
                          <img 
                            src={posters[activeTab].bg} 
                            alt="bg" 
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-5 flex flex-col h-full items-center justify-between">
                           <div className="text-center mt-2">
                              <h4 className="text-xl font-black whitespace-pre-line leading-tight tracking-tight" style={{ color: activeTab === 0 ? '#7c2d12' : activeTab === 1 ? '#1e3a8a' : '#991b1b' }}>
                                {posters[activeTab].mainText}
                              </h4>
                           </div>

                           <div className={`relative bg-white p-2 rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105 active:scale-95`}>
                              <QRCodeSVG 
                                value={referralUrl} 
                                size={120}
                                level="H"
                                includeMargin={false}
                              />
                              {user?.avatar && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm">
                                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                </div>
                              )}
                           </div>

                           <div className="text-center mb-2">
                              <div className="flex items-center justify-center space-x-1 mb-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                 <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">智汇达人 精选推荐</span>
                              </div>
                              <p className="text-[10px] text-gray-400">微信扫码 即可加入</p>
                           </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                 </div>

                 {/* Tab Selection */}
                 <div className="mt-4 flex w-full max-w-[280px] justify-between px-2">
                    {posters.map((poster, index) => (
                      <button 
                        key={poster.id}
                        onClick={() => setActiveTab(index)}
                        className={`text-xs font-bold pb-1 transition-all duration-300 relative ${
                          activeTab === index ? 'text-red-600 scale-105' : 'text-gray-400'
                        }`}
                      >
                        {poster.title}
                        {activeTab === index && (
                          <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                        )}
                      </button>
                    ))}
                 </div>

                 <button onClick={handleDownload} className="w-full max-w-[280px] bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold py-3 rounded-full mt-4 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                    <Download className="w-4 h-4 mr-2" /> 保存海报到相册
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Invite;
