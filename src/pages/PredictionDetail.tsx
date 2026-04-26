import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Headset, Share2, Lock, ArrowRight, UserPlus, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_PREDICTIONS, MOCK_HISTORY } from '../mockData';

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showPayment, setShowPayment] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const prediction = MOCK_PREDICTIONS.find(p => p.id === id) || MOCK_PREDICTIONS[1];

  React.useEffect(() => {
    const lastShown = localStorage.getItem('disclaimer_last_shown');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleCloseDisclaimer = () => {
    if (dontShowAgain) {
      localStorage.setItem('disclaimer_last_shown', new Date().toDateString());
    }
    setShowDisclaimer(false);
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="bg-gray-50 min-h-screen">
      {/* Disclaimer Modal */}
      <AnimatePresence>
        {showDisclaimer && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-[2px]">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden relative shadow-2xl"
            >
              {/* Top Header Background */}
              <div className="h-24 bg-gradient-to-b from-pink-50 to-white relative flex items-center justify-center overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,rgba(255,182,193,0.3),transparent)]"></div>
                
                {/* Decorative Elements */}
                <div className="absolute top-6 left-10 w-12 h-8 bg-white/80 rounded-xl flex items-center justify-center shadow-sm">
                   <div className="flex space-x-1">
                      <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                      <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                      <div className="w-1 h-1 bg-pink-300 rounded-full"></div>
                   </div>
                </div>
                <div className="absolute top-8 right-10 w-16 h-10 bg-white/80 rounded-xl shadow-sm flex flex-col p-1.5 space-y-1">
                   <div className="w-full h-1 bg-pink-100 rounded-full"></div>
                   <div className="w-3/4 h-1 bg-pink-100 rounded-full"></div>
                </div>

                {/* Floating Bell Icon Wrapper */}
                <div className="absolute -top-6 flex flex-col items-center">
                  <div className="relative">
                    <div className="absolute inset-0 bg-pink-200 blur-2xl opacity-50 translate-y-8"></div>
                    <img 
                      src="https://img.icons8.com/color/240/notification-bell.png" 
                      alt="bell" 
                      className="w-24 h-24 object-contain relative z-10" 
                    />
                    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-white/40 blur-sm rounded-full"></div>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="px-6 pb-8 text-center">
                <h3 className="text-xl font-black text-gray-900 mb-4 tracking-wider">免费声明</h3>
                
                <div className="text-[14px] text-gray-600 leading-relaxed space-y-4 font-medium mb-6">
                  <p>
                    本平台所展示的方案均为 <span className="text-orange-500">模拟演示内容</span>，仅供学习与交流参考。不代表平台立场， <span className="text-orange-500">不构成任何建议</span>。平台不对方案的实用性或结果作出任何保证。
                  </p>
                  
                  <div className="bg-orange-50/50 rounded-2xl p-4 py-6 border border-orange-100/50">
                    <h4 className="text-orange-500 font-bold text-lg mb-2">温馨提示</h4>
                    <p className="text-gray-700 font-bold">
                      请理性判断，切勿轻信或传播未经证实的信息。
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleCloseDisclaimer}
                  className="w-full bg-[#e53935] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 mb-4 active:scale-95 transition-transform"
                >
                  好的
                </button>

                <div 
                  className="flex items-center justify-center space-x-2 cursor-pointer"
                  onClick={() => setDontShowAgain(!dontShowAgain)}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${dontShowAgain ? 'bg-red-500 border-red-500' : 'border-gray-300'}`}>
                    {dontShowAgain && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                  <span className="text-gray-400 text-sm font-medium">今日不再弹出</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Red Header Background */}
      <div className="h-48 red-gradient absolute top-0 left-0 right-0 z-0 opacity-90 rounded-b-[40px]">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
      </div>

      {/* Header Nav */}
      <div className="relative z-10 flex items-center justify-between p-4 text-white">
        <ChevronLeft className="w-6 h-6 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-lg font-medium">方案详情</h2>
        <Headset className="w-6 h-6 cursor-pointer" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-4 mt-2">
        <div className="bg-white rounded-2xl p-4 card-shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={prediction.authorAvatar} alt="" className="w-12 h-12 rounded-full" />
              <div className="ml-3">
                <h3 className="font-bold text-gray-800">{prediction.authorName}</h3>
                <p className="text-xs text-orange-500">{prediction.authorFans} 粉丝</p>
              </div>
            </div>
            <button className="bg-pink-50 text-red-500 px-4 py-1.5 rounded-full text-xs font-bold border border-red-100 flex items-center">
              <UserPlus className="w-3 h-3 mr-1" /> 关注
            </button>
          </div>

          <div className="mt-2 flex space-x-2">
            <span className="text-[10px] text-red-500 bg-red-50 px-1 border border-red-100 rounded-sm">近30红20</span>
            <div className="flex-grow"></div>
            <span className="text-[10px] text-gray-400">近七日人气 <span className="text-red-500 font-bold">58373</span></span>
          </div>

          <div className="mt-6">
            <h1 className="text-lg font-bold text-gray-900 leading-relaxed">
              <span className="text-red-600">【{prediction.authorName}】</span> {prediction.period} {prediction.title}
            </h1>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
              <span>{prediction.time}</span>
              <div className="flex items-center">
                <div className="flex -space-x-1 overflow-hidden mr-1">
                   {[1, 2, 3].map(i => (
                    <img key={i} className="h-4 w-4 rounded-full ring-1 ring-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 100}`} alt="" />
                  ))}
                </div>
                <span>3616人查看</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lock Section / Result Section */}
        {!prediction.isFree && (
          <div className="mt-4 bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-400">
              <Share2 className="w-5 h-5 cursor-pointer" />
            </div>
            
            <h4 className="text-gray-800 font-bold text-lg">解锁公开倒计时</h4>
            
            <div className="flex justify-center items-center space-x-2 mt-4">
              {['01', '25', '20'].map((part, i) => (
                <React.Fragment key={i}>
                  <div className="bg-red-500 text-white text-xl font-bold w-10 h-10 flex items-center justify-center rounded-md">{part}</div>
                  {i < 2 && <span className="text-red-500 text-xl font-bold">:</span>}
                </React.Fragment>
              ))}
            </div>

            <button 
              onClick={() => setShowPayment(true)}
              className="mt-6 flex items-center justify-center space-x-2 bg-gray-900 text-white w-full py-3 rounded-full font-medium"
            >
              <Lock className="w-4 h-4 fill-white" />
              <span>付费 ¥ {prediction.price} 立即解锁</span>
            </button>

            <p className="mt-4 text-[10px] text-gray-400 leading-relaxed px-2">
              作者方案为个人数字概率分析内容，该结果不作为开奖胜负统计，不作为任何承诺。内容信息仅供参考，不代表平台意见！
            </p>
          </div>
        )}

        {/* History / Info */}
        <div className="mt-8 text-center relative mb-4">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-gray-200 -translate-y-1/2"></div>
          <span className="relative z-10 bg-gray-50 px-4 text-xs font-medium text-red-500 flex items-center justify-center">
            <span className="w-8 h-px bg-gray-300 mr-4"></span> 付费须知 <span className="w-8 h-px bg-gray-300 ml-4"></span>
          </span>
        </div>

        <p className="text-xs text-center text-gray-500 leading-relaxed px-4">
          温馨提示：本平台为虚拟内容服务，文章为作者个人分析观点，仅供参考，不保证结果或实用性。内容一经解锁即完成服务，付款即表示同意《购买协议》，虚拟产品不支持退款，请理性谨慎解锁。
        </p>

        {/* Past Records */}
        <div className="mt-8">
          <div className="flex items-center space-x-2 mb-4">
            <span className="font-bold text-gray-800">往期方案</span>
            <div className="flex space-x-1">
              {['黑', '黑', '红', '黑', '红', '黑', '红'].map((c, i) => (
                <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${c === '红' ? 'bg-red-500' : 'bg-gray-800'}`}>
                  {c}
                </span>
              ))}
            </div>
          </div>

          <div className="space-y-4 pb-12">
            {MOCK_HISTORY.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 card-shadow relative">
                 <div className="absolute top-4 right-4 w-12 h-12 opacity-40">
                    <img src="https://img.icons8.com/color/96/000000/stamp.png" alt="" className="grayscale" />
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-800">{item.period}</span>
                      <span className="ml-2 text-[10px] text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-sm">{item.type}</span>
                    </div>
                 </div>
                 <div className="mt-4 flex items-center">
                   <span className="text-xs text-gray-400 mr-2">正文</span>
                   <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-bold leading-none">{item.mainPick}</span>
                 </div>
                 <div className="mt-4 flex items-center">
                   <span className="text-xs text-gray-400 mr-2">核对</span>
                   <div className="flex space-x-1.5">
                     {item.numbers.map((n, i) => (
                       <div key={i} className="flex flex-col items-center">
                         <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${i === 6 ? 'bg-blue-500' : 'bg-red-500'}`}>
                           {n}
                         </div>
                         <span className="text-[10px] text-red-500 mt-0.5">{item.animals[i]}</span>
                       </div>
                     ))}
                   </div>
                 </div>
                 <div className="mt-4 flex justify-between items-center text-[10px] text-gray-400">
                   <span>{item.time}</span>
                   <div className="flex items-center">
                     <div className="flex -space-x-1 mr-1">
                        {[1, 2, 3].map(i => <img key={i} className="w-4 h-4 rounded-full ring-1 ring-white" src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i+item.id}`} alt=""/>)}
                     </div>
                     <span>{item.viewCount}人查看</span>
                   </div>
                 </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-3 flex items-center justify-between z-50 border-t border-gray-100 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-baseline space-x-1">
          <span className="text-sm font-medium text-gray-800">需支付:</span>
          <span className="text-xl font-bold text-red-600">¥ {prediction.price}</span>
        </div>
        <button 
          onClick={() => setShowPayment(true)}
          className="bg-red-600 text-white px-10 py-3 rounded-full font-bold shadow-lg shadow-red-100 transition-transform active:scale-95"
        >
          立即支付
        </button>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={() => setShowPayment(false)}>
           <motion.div 
            initial={{ y: "100%" }} 
            animate={{ y: 0 }} 
            className="bg-white w-full max-w-lg rounded-t-3xl p-6"
            onClick={e => e.stopPropagation()}
           >
              <div className="flex justify-between items-center mb-6">
                <ChevronLeft className="w-6 h-6 invisible" />
                <h3 className="text-lg font-bold">支付</h3>
                <X className="w-6 h-6 text-gray-400 cursor-pointer" onClick={() => setShowPayment(false)} />
              </div>
              
              <div className="text-center mb-8">
                <span className="text-red-600 text-3xl font-bold">¥ {prediction.price}.00</span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                       <span className="text-white font-bold text-lg">支</span>
                    </div>
                    <div>
                      <p className="font-medium">支付宝 (通过性更强)</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-red-500 p-0.5">
                    <div className="w-full h-full bg-red-500 rounded-full"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 opacity-60">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-white">¥</div>
                    <div>
                      <p className="font-medium">余额支付 (可用余额: ¥ 0.00 <span className="text-green-500">充值</span>)</p>
                    </div>
                  </div>
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300"></div>
                </div>
              </div>

              <div className="mt-8 text-xs text-blue-500 leading-relaxed">
                 支付异常请联系上级推荐人，严禁私下交易。查实违规奖励5-10倍。
              </div>

              <button className="w-full bg-red-600 text-white font-bold py-4 rounded-full mt-6 shadow-xl shadow-red-100">
                立即支付
              </button>
           </motion.div>
        </div>
      )}

      {/* Floating Return Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center text-gray-400 text-[10px] card-shadow border border-gray-100">
           返回
        </button>
      </div>
    </motion.div>
  );
};

export default PredictionDetail;
