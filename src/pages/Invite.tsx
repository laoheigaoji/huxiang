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

  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;
  const baseUrl = window.location.origin;
  const referralUrl = `${baseUrl}/register?ref=${user?.id || ''}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralUrl);
    alert('已复制链接到剪贴板');
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-gray-50 min-h-screen">
      <div className="bg-orange-400 h-48 relative overflow-hidden">
        <div className="p-4 flex items-center justify-between relative z-10 text-white">
          <ChevronLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="text-lg font-bold">邀请有礼</h2>
          <div className="w-6"></div>
        </div>
        
        {/* Banner Text Decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
           <h1 className="text-4xl font-black text-white italic drop-shadow-md tracking-tighter">邀请好友 得佣金</h1>
           <div className="mt-2 inline-block bg-white text-orange-500 px-4 py-1 rounded-full text-xs font-bold">好友消费 得佣金</div>
        </div>
        
        {/* Confetti decoration */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circle-knot.png')] opacity-20"></div>
      </div>

      <div className="px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 flex flex-col items-center card-shadow mb-6">
           <div className="flex items-center justify-around w-full mb-8">
              <div className="text-center">
                 <div className="text-2xl font-black text-gray-900">{friends.length}</div>
                 <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">成功邀请</div>
              </div>
              <div className="w-px h-10 bg-gray-100"></div>
              <div className="text-center">
                 <div className="text-2xl font-black text-red-600">¥ {(user?.totalInvitedEarnings || 0).toFixed(2)}</div>
                 <div className="text-[10px] text-gray-400 font-bold uppercase mt-1">累计分润</div>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4 w-full">
              <button 
                onClick={copyToClipboard}
                className="bg-orange-50 rounded-2xl py-4 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
              >
                 <Copy className="w-6 h-6 text-orange-500" />
                 <span className="text-xs font-bold text-orange-600">复制链接</span>
              </button>
              <button 
                onClick={() => setShowQR(true)}
                className="bg-red-50 rounded-2xl py-4 flex flex-col items-center justify-center space-y-2 active:scale-95 transition-transform"
              >
                 <QrCode className="w-6 h-6 text-red-500" />
                 <span className="text-xs font-bold text-red-600">我的二维码</span>
              </button>
           </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl card-shadow min-h-[300px] overflow-hidden">
           <div className="bg-orange-500 text-white py-3 px-6 text-center font-bold text-sm">
             已成功邀请 {friends.length} 位好友
           </div>
           
           <div className="p-4">
             <div className="relative mb-4">
               <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
               <input 
                type="text" 
                placeholder="搜索好友昵称/账号" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none" 
               />
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
                     <div className="text-right">
                       <p className="text-[10px] text-gray-400">注册时间</p>
                       <p className="text-xs font-medium text-gray-600">{friend.createdAt?.split('T')[0] || '未知'}</p>
                     </div>
                   </div>
                 ))}
               </div>
             ) : (
               <div className="flex flex-col items-center justify-center py-12 opacity-40">
                  <ClipboardList className="w-16 h-16 text-gray-300" />
                  <p className="text-xs text-gray-400 mt-2">暂无数据</p>
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
              className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden relative pb-8 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>

              <div className="p-4 flex flex-col items-center">
                 <div className="w-full flex justify-end">
                    <X className="w-6 h-6 text-gray-300 cursor-pointer" onClick={() => setShowQR(false)} />
                 </div>
                 
                 <div className="text-center mb-6">
                    <h3 className="font-bold text-2xl text-gray-800">邀好友 享好料</h3>
                    <p className="text-sm text-gray-500 font-medium mt-1">传递好料.收获回报</p>
                 </div>
                 
                 {/* Poster Canvas / Image */}
                 <div className="relative w-full aspect-[4/5] max-w-[320px] bg-gray-50 rounded-2xl overflow-hidden shadow-xl mx-auto">
                    <AnimatePresence mode="wait">
                      {/* Different background styles based on tab */}
                      <motion.div 
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="absolute inset-0"
                      >
                        <div className={`absolute inset-0 transition-colors duration-500 ${
                          activeTab === 0 ? 'bg-orange-50' : 
                          activeTab === 1 ? 'bg-blue-50' : 'bg-red-50'
                        }`}>
                          {/* Decorative background elements based on image */}
                          <img 
                            src={posters[activeTab].bg} 
                            alt="bg" 
                            className="w-full h-full object-cover opacity-80"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-transparent to-transparent"></div>
                        </div>

                        <div className="relative z-10 p-6 flex flex-col h-full items-center justify-between">
                           <div className="text-center mt-4">
                              <h4 className={`text-2xl font-black whitespace-pre-line leading-tight tracking-tight ${
                                activeTab === 0 ? 'text-orange-900' : 
                                activeTab === 1 ? 'text-blue-900' : 'text-red-900'
                              }`}>
                                {posters[activeTab].mainText}
                              </h4>
                           </div>

                           <div className={`relative bg-white p-2.5 rounded-xl shadow-2xl transition-transform duration-500 hover:scale-105 active:scale-95`}>
                              <QRCodeSVG 
                                value={referralUrl} 
                                size={144}
                                level="H"
                                includeMargin={false}
                              />
                              {user?.avatar && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-white shadow-sm">
                                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                                </div>
                              )}
                           </div>

                           <div className="text-center mb-4">
                              <div className="flex items-center justify-center space-x-1 mb-1">
                                 <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                 <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">智汇达人 精选推荐</span>
                              </div>
                              <p className="text-[11px] text-gray-400">微信扫码 即可加入</p>
                           </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                 </div>

                 {/* Tab Selection */}
                 <div className="mt-8 flex w-full max-w-[320px] justify-between px-2">
                    {posters.map((poster, index) => (
                      <button 
                        key={poster.id}
                        onClick={() => setActiveTab(index)}
                        className={`text-sm font-bold pb-2 transition-all duration-300 relative ${
                          activeTab === index ? 'text-red-600 scale-110' : 'text-gray-400'
                        }`}
                      >
                        {poster.title}
                        {activeTab === index && (
                          <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600" />
                        )}
                      </button>
                    ))}
                 </div>

                 <button className="w-full max-w-[320px] bg-red-600 text-white font-bold py-4 rounded-full mt-8 flex items-center justify-center shadow-lg active:scale-95 transition-all">
                    <Download className="w-5 h-5 mr-2" /> 长按二维码保存
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
