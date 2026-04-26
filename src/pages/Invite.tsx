import React, { useState } from 'react';
import { ChevronLeft, X, Search, Info, Download, ClipboardList } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const Invite = () => {
  const navigate = useNavigate();
  const [showQR, setShowQR] = useState(false);

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
        <div onClick={() => setShowQR(true)} className="bg-white rounded-2xl py-8 flex items-center justify-center flex-col px-4 cursor-pointer card-shadow">
           <div className="relative group">
              <button className="bg-gradient-to-r from-orange-400 to-pink-500 text-white text-2xl font-black italic px-12 py-3 rounded-full flex items-center space-x-2 shadow-lg group-active:scale-95 transition-transform">
                立即邀请 👈 分享二维码
              </button>
           </div>
        </div>

        <div className="mt-6 bg-white rounded-2xl card-shadow min-h-[300px]">
           <div className="bg-orange-500 text-white py-3 px-6 text-center font-bold text-sm rounded-t-2xl">
             已成功邀请0位好友
           </div>
           
           <div className="p-4">
             <div className="relative">
               <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
               <input type="text" placeholder="请输入" className="w-full bg-gray-50 border border-gray-100 rounded-lg py-2 pl-9 pr-12 text-sm focus:outline-none" />
               <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800 text-sm font-medium">搜索</button>
             </div>

             <div className="flex flex-col items-center justify-center mt-12 opacity-40">
                <ClipboardList className="w-16 h-16 text-gray-300" />
                <p className="text-xs text-gray-400 mt-2">暂无数据</p>
             </div>
           </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6" onClick={() => setShowQR(false)}>
           <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} 
            animate={{ scale: 1, opacity: 1 }} 
            className="bg-white rounded-2xl w-full max-w-sm overflow-hidden"
            onClick={e => e.stopPropagation()}
           >
              <div className="p-4 flex justify-between items-center bg-gray-50">
                 <div className="w-6"></div>
                 <div className="text-center">
                    <h3 className="font-bold text-gray-800">邀好友 享好料</h3>
                    <p className="text-[10px] text-gray-400">传递好料.收获回报</p>
                 </div>
                 <X className="w-6 h-6 text-gray-400 cursor-pointer" onClick={() => setShowQR(false)} />
              </div>
              
              <div className="p-4">
                 <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden flex items-center justify-center">
                    <img src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800" alt="background" className="absolute inset-0 w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/20"></div>
                    <div className="relative z-10 bg-white p-2 rounded-lg shadow-xl">
                       <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=example" alt="QR" className="w-32 h-32" />
                    </div>
                    <div className="absolute top-8 left-1/2 -translate-x-1/2 text-center text-white w-full">
                       <p className="text-2xl font-black leading-tight">好料分享<br/>智料汇享</p>
                    </div>
                 </div>

                 <div className="mt-4 flex justify-around border-b border-gray-100 pb-2">
                    <span className="text-sm font-bold text-red-500 border-b-2 border-red-500 pb-2 px-2">分享码一</span>
                    <span className="text-sm text-gray-400 px-2 pb-2">分享码二</span>
                    <span className="text-sm text-gray-400 px-2 pb-2">分享码三</span>
                 </div>

                 <button className="w-full bg-red-600 text-white font-bold py-3 rounded-full mt-4 flex items-center justify-center">
                    <Download className="w-4 h-4 mr-2" /> 长按二维码保存
                 </button>
              </div>
           </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Invite;
