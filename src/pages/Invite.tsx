import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, Search, Download } from 'lucide-react';
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
        const { toPng } = await import('html-to-image');
        const dataUrl = await toPng(posterRef.current, {
            cacheBust: true,
            pixelRatio: 2,
            backgroundColor: 'transparent'
        });
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#FFAD7A] min-h-screen font-sans pb-10">
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Large right top coin */}
        <div className="absolute -right-12 -top-4 w-40 h-40 bg-gradient-to-bl from-[#FFE69B] to-[#FF9014] rounded-full flex items-center justify-center opacity-90 blur-[1px]">
          <div className="w-28 h-28 border-4 border-[#FFDC7B] rounded-full flex items-center justify-center">
            <div className="w-24 h-24 border-2 border-[#FFC745] rounded-full flex items-center justify-center">
              <span className="text-[#FF8D00] text-5xl font-bold font-serif opacity-50">¥</span>
            </div>
          </div>
        </div>

        {/* Left middle coin */}
        <div className="absolute left-2 top-32 w-16 h-16 bg-gradient-to-br from-[#FFE69B] to-[#FF9014] rounded-full flex items-center justify-center shadow-lg">
          <div className="w-12 h-12 border-2 border-[#FFDC7B] rounded-full flex flex-col items-center justify-center bg-gradient-to-b from-[#FFF2B2] to-[#FFB732]">
              <div className="text-[#FFAE00] text-2xl">⭐</div>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute left-1/3 top-48 w-4 h-4 bg-gradient-to-br from-[#FFE69B] to-[#FF9014] rounded-full shadow-sm rotate-12 blur-[1px]"></div>
        <div className="absolute left-1/4 top-64 w-6 h-6 bg-gradient-to-br from-[#FFE69B] to-[#FF9014] rounded-full shadow-sm -rotate-12 blur-[0.5px] items-center justify-center flex text-[#FF8D00] text-[10px] font-bold">¥</div>
        <div className="absolute right-1/4 top-56 w-5 h-5 bg-gradient-to-br from-[#FFE69B] to-[#FF9014] rounded-full shadow-sm rotate-45 blur-[0.5px]"></div>
        <div className="absolute right-8 top-[300px] w-8 h-8 bg-gradient-to-br from-[#FFE69B] to-[#FF9014] rounded-full shadow-sm rotate-12 blur-[1px] flex items-center justify-center text-[#FF8D00] text-[12px] font-bold border border-white/20">¥</div>
        
        {/* Sparkles */}
        <div className="absolute left-8 top-28 text-white opacity-80 text-xl font-light">✦</div>
        <div className="absolute right-12 top-40 text-white opacity-60 text-lg font-light">✦</div>
      </div>

      {/* Header */}
      <div className="px-4 py-4 flex items-center text-white relative z-20">
        <ChevronLeft className="w-8 h-8 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="flex-1 flex justify-center text-lg pr-8 text-white/90">
           申请记录
        </div>
      </div>

      {/* Main Intro */}
      <div className="text-center w-full relative z-10 flex flex-col items-center mt-2 mb-10">
        <div className="relative w-auto flex justify-center px-4">
            <span className="text-[44px] font-black italic tracking-tighter absolute top-0 z-0 text-[#E63925] whitespace-nowrap" style={{
              WebkitTextStroke: '10px #E63925',
              transform: 'scaleY(1.1) rotate(-1deg)'
            }}>邀请好友 得佣金</span>
            
            <span className="text-[44px] font-black italic tracking-tighter relative z-10 whitespace-nowrap" style={{
              background: 'linear-gradient(to bottom, #FFFFE4 0%, #FFB61F 70%, #FF9000 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              WebkitTextStroke: '2px #FFFFFF',
              transform: 'scaleY(1.1) rotate(-1deg)'
            }}>邀请好友 得佣金</span>
        </div>
        <div className="bg-white/90 px-6 py-1.5 mt-6 rounded-full text-[#F43C2E] text-sm font-bold tracking-widest shadow-sm">
            好友消费 得佣金
        </div>
      </div>

      {/* CTA Card */}
      <div className="bg-[#FCDAB6] mx-4 rounded-xl p-3 flex items-center justify-between shadow-sm relative z-20 border-b-4 border-[#EFA46E]">
        <div className="flex items-center">
          <span className="text-xl font-black italic tracking-widest text-[#333333] drop-shadow-[1px_1px_0px_white]">
            立即邀请
          </span>
          <span className="text-[42px] -ml-1 drop-shadow-md relative top-0.5" style={{ transform: 'rotate(-5deg)' }}>👉</span>
        </div>
        
        <div 
          onClick={() => setShowQR(true)}
          className="flex items-center bg-gradient-to-r from-[#FF7E00] to-[#FF4D00] text-white rounded-full px-5 py-2.5 shadow-[0_4px_12px_rgba(255,88,0,0.3)] active:scale-95 transition-transform cursor-pointer relative overflow-hidden group"
        >
          {/* Burst abstract icon */}
          <div className="mr-2 relative w-6 h-6 flex items-center justify-center">
             <div className="absolute inset-1 bg-white rotate-45 group-hover:rotate-90 transition-transform duration-500 rounded-[2px]" />
             <div className="absolute inset-1 bg-white rotate-0 group-hover:rotate-45 transition-transform duration-500 rounded-[2px]" />
             <div className="absolute rounded-full w-2 h-2 bg-[#FF4D00] z-10" />
          </div>
          <span className="font-bold italic text-base tracking-widest drop-shadow-sm">分享二维码</span>
        </div>
      </div>

      {/* Bottom List Section */}
      <div className="mx-4 mt-6 relative z-10">
         <div className="bg-[#FBE4CC] rounded-t-xl rounded-b-xl overflow-hidden shadow-sm flex flex-col">
             <div className="flex justify-center -mt-px relative z-10">
                <div className="bg-[#F17843] text-white px-8 py-2.5 text-sm font-medium rounded-b-lg shadow-sm">
                   已成功邀请{friends.length}位好友
                </div>
             </div>

             <div className="px-4 py-4 flex items-center space-x-3 bg-[#FBE4CC]">
                <div className="relative flex-1">
                   <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                   <input 
                     type="text" 
                     placeholder="请输入" 
                     value={searchQuery}
                     onChange={(e) => setSearchQuery(e.target.value)}
                     className="w-full bg-white rounded flex-1 py-2.5 pl-10 pr-4 text-gray-700 outline-none placeholder-gray-400 text-sm" 
                   />
                </div>
                <div className="text-gray-800 font-medium text-base tracking-widest cursor-pointer active:opacity-50">搜索</div>
             </div>
             
             <div className="bg-white flex-1 min-h-[400px]">
               {loading ? (
                 <div className="flex justify-center py-12">
                   <div className="w-8 h-8 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"></div>
                 </div>
               ) : filteredFriends.length > 0 ? (
                 <div className="space-y-0 divide-y divide-gray-50">
                   {filteredFriends.map((friend) => (
                     <div key={friend.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                       <div className="flex items-center space-x-3">
                         <img src={friend.avatar} className="w-10 h-10 rounded-full object-cover border border-gray-100" alt="" />
                         <div>
                           <p className="text-sm font-bold text-gray-800">{friend.nickname}</p>
                           <p className="text-[11px] text-gray-400 mt-0.5">账号: {friend.username}</p>
                         </div>
                       </div>
                     </div>
                   ))}
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-32 h-32 relative flex items-center justify-center mb-2">
                      <div className="w-16 h-20 bg-gradient-to-b from-[#FE9999] to-[#FE5E5E] rounded-md block relative shadow-sm">
                         <div className="absolute top-4 left-3 right-3 h-1 bg-white/50 rounded-full"></div>
                         <div className="absolute top-7 left-3 right-5 h-1 bg-white/50 rounded-full"></div>
                         <div className="absolute top-10 left-3 right-4 h-1 bg-white/50 rounded-full"></div>
                         <div className="absolute -bottom-2 left-0 right-0 h-4 bg-gradient-to-r from-[#FFC2C2] to-[#FF9090] rounded-full shadow-sm flex items-center">
                            <div className="w-14 h-1 bg-white/30 mx-auto rounded-full"></div>
                         </div>
                         <div className="absolute -top-1.5 -left-1.5 w-4 h-5 bg-[#FFB4B4] rounded-t-md rounded-bl-xl z-10 shadow-sm border-r border-[#FE9999]"></div>
                      </div>
                      <div className="absolute top-4 right-2 w-3 h-3 bg-[#FFB4B4] rounded-full"></div>
                      <div className="absolute bottom-6 left-4 border-[4px] border-transparent border-b-[#FF7575] rotate-12"></div>
                      <div className="absolute bottom-4 right-8 border-[5px] border-transparent border-b-[#FF7575] -rotate-12"></div>
                    </div>
                    <p className="text-[#F26C6C] text-[15px] tracking-widest mt-4">暂无数据</p>
                 </div>
               )}
             </div>
         </div>
      </div>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <div className="fixed inset-0 z-[150] flex items-end justify-center" onClick={() => setShowQR(false)}>
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
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>

              <div className="p-4 flex flex-col items-center">
                 <div className="w-full flex justify-end">
                    <X className="w-6 h-6 text-gray-300 cursor-pointer" onClick={() => setShowQR(false)} />
                 </div>
                 
                 <div className="text-center mb-4">
                    <h3 className="font-bold text-xl text-gray-800">邀好友 享好料</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">传递好料.收获回报</p>
                 </div>
                 
                 <div ref={posterRef} className="relative w-full aspect-[4/5] max-w-[280px] rounded-2xl overflow-hidden shadow-xl mx-auto" style={{ backgroundColor: '#f9fafb' }}>
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute inset-0"
                      >
                        <div className="absolute inset-0" style={{ backgroundColor: activeTab === 0 ? '#fff7ed' : activeTab === 1 ? '#eff6ff' : '#fef2f2' }}>
                          <img 
                            crossOrigin="anonymous"
                            src={posters[activeTab].bg} 
                            alt="bg" 
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)' }}></div>
                        </div>

                        <div className="relative z-10 p-5 flex flex-col h-full items-center justify-between">
                           <div className="text-center mt-2">
                              <h4 className="text-xl font-black whitespace-pre-line leading-tight tracking-tight" style={{ color: activeTab === 0 ? '#7c2d12' : activeTab === 1 ? '#1e3a8a' : '#991b1b' }}>
                                {posters[activeTab].mainText}
                              </h4>
                           </div>

                           <div className={`relative p-2 rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105 active:scale-95`} style={{ backgroundColor: '#ffffff' }}>
                              <QRCodeSVG 
                                value={referralUrl} 
                                size={120}
                                level="H"
                                includeMargin={false}
                              />
                              {user?.avatar && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border-2 overflow-hidden shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#ffffff' }}>
                                  <img crossOrigin="anonymous" src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                </div>
                              )}
                           </div>

                           <div className="text-center mb-2">
                              <div className="flex items-center justify-center space-x-1 mb-0.5">
                                 <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#ef4444' }}></div>
                                 <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: '#6b7280' }}>智汇达人 精选推荐</span>
                              </div>
                              <p className="text-[10px]" style={{ color: '#9ca3af' }}>微信扫码 即可加入</p>
                           </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                 </div>

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

