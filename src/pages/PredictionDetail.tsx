import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Headset, Share2, Lock, ArrowRight, UserPlus, X, Star, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeSVG } from 'qrcode.react';
import { api } from '../services/api';
import { Prediction, HistoryItem } from '../types';

const PredictionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'alipay'>('balance');
  const [showShare, setShowShare] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [author, setAuthor] = useState<any>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  const isPurchasedRef = React.useRef(false);
  const isUnlockedRef = React.useRef(false);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [showPayment, setShowPayment] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const posterRef = React.useRef<HTMLDivElement>(null);

  const handleDownloadPoster = async () => {
      if (!posterRef.current) return;
      try {
          const { toPng } = await import('html-to-image');
          const dataUrl = await toPng(posterRef.current, {
              cacheBust: true,
              pixelRatio: 2,
              backgroundColor: '#ffffff',
          });
          const link = document.createElement('a');
          link.download = `prediction-${prediction?.id || Date.now()}.png`;
          link.href = dataUrl;
          link.click();
      } catch (err) {
          console.error('Failed to generate poster', err);
          alert('保存海报失败，请尝试截图保存');
      }
  };

  useEffect(() => {
    isPurchasedRef.current = isPurchased;
    isUnlockedRef.current = isUnlocked;
  }, [isPurchased, isUnlocked]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (id) {
            const [predData, histData, profileData] = await Promise.all([
              api.getPredictionById(id),
              api.getHistory().catch(() => []),
              api.getProfile().catch(() => null)
            ]);
            setPrediction(predData);
            
            if (predData) {
              const allPredictionsForAuthor = await api.getAuthorPredictions(predData.authorId).catch(() => []);
              setHistory(allPredictionsForAuthor.filter((h: any) => h.id !== predData.id).sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
              
              if (predData.isUnlocked) {
                setIsUnlocked(true);
              }
              const authorData = await api.getAuthorById(predData.authorId).catch(() => null);
              setAuthor(authorData);
            
            if (profileData) {
              setUser(profileData);
              if (profileData.following) {
                setIsFollowed(profileData.following.includes(predData.authorId));
              }
              if (profileData.purchased && profileData.purchased.includes(id)) {
                setIsPurchased(true);
              }
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch prediction', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    // Polling to check unlocking status after payment
    const pollInterval = setInterval(async () => {
        if (id && !isUnlockedRef.current && !isPurchasedRef.current) {
             const predData = await api.getPredictionById(id).catch(() => null);
             const profileData = await api.getProfile().catch(() => null);
             
             if (predData && (predData.isUnlocked || (profileData && profileData.purchased?.includes(id)))) {
                 setPrediction(predData);
                 if (profileData) setUser(profileData);
                 setIsUnlocked(true);
                 setIsPurchased(true);
                 clearInterval(pollInterval);
             }
        }
    }, 5000);

    const lastShown = localStorage.getItem('disclaimer_last_shown');
    const today = new Date().toDateString();
    if (lastShown !== today) {
      setShowDisclaimer(true);
    }
    
    return () => clearInterval(pollInterval);
  }, [id]);

  useEffect(() => {
    if (!prediction?.unlockAt) return;

    const updateTimer = async () => {
      const target = new Date(prediction.unlockAt!).getTime();
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setIsUnlocked(true);
        setTimeLeft({ h: '00', m: '00', s: '00' });
        
        // Mark as public on backend if not already unlocked/public
        if (!prediction.isUnlocked && prediction.status !== 'public') {
            await api.markAsPublic(prediction.id).catch(console.error);
        }

        return true; // Finished
      } else {
        const h = Math.floor(diff / (1000 * 60 * 60));
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({
          h: h.toString().padStart(2, '0'),
          m: m.toString().padStart(2, '0'),
          s: s.toString().padStart(2, '0')
        });
        return false; // Not finished
      }
    };

    const isFinished = updateTimer();
    if (isFinished) return;

    const timer = setInterval(() => {
      if (updateTimer()) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [prediction]);

  const handleCloseDisclaimer = () => {
    if (dontShowAgain) {
      localStorage.setItem('disclaimer_last_shown', new Date().toDateString());
    }
    setShowDisclaimer(false);
  };

  const handleFollow = async () => {
    if (!prediction) return;
    try {
      await api.followAuthor(prediction.authorId);
      setIsFollowed(!isFollowed);
      // Update local profile cache if needed
      api.getProfile().then(p => {
        localStorage.setItem('user', JSON.stringify(p));
        setUser(p);
      });
    } catch (err) {
      console.error('Follow failed', err);
    }
  };

  const handlePurchase = async () => {
    if (!id) return;
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      setIsProcessingPayment(true);
      if (selectedPaymentMethod === 'balance') {
        await api.purchasePrediction(id);
        setIsPurchased(true);
        const updatedUser = await api.getProfile();
        setUser(updatedUser);
        setShowPayment(false);
        setIsProcessingPayment(false);
        alert('购买成功！');
      } else {
        // Alipay flow
        const returnUrl = window.location.href;
        const payRes = await api.createPayment(prediction!.price, 'alipay', prediction!.title, user.id, id, returnUrl);
        const paymentUrl = payRes.url || payRes.payurl || payRes.payment_url || payRes.qrcode;
        if (paymentUrl) {
            setShowPayment(false);
            window.location.href = paymentUrl;
        } else {
            console.error('Payment failed', payRes);
            alert('支付请求发送失败，请稍后再试');
            setIsProcessingPayment(false);
        }
      }
    } catch (err: any) {
      alert(err.message || '购买失败');
      setIsProcessingPayment(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-vh-screen bg-gray-50 h-screen">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!prediction) return null;

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
        
        <div className="flex items-center space-x-2">
            {prediction.status === 'public' && (
                <span className="bg-green-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">公开</span>
            )}
            <Headset className="w-6 h-6 cursor-pointer" />
        </div>
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
            <button 
              onClick={handleFollow}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border flex items-center transition-all active:scale-95 ${
                isFollowed 
                  ? 'bg-gray-100 text-gray-400 border-gray-200' 
                  : 'bg-pink-50 text-red-500 border-red-100'
              }`}
            >
              <UserPlus className={`w-3 h-3 mr-1 ${isFollowed ? 'hidden' : 'block'}`} /> {isFollowed ? '已关注' : '关注'}
            </button>
          </div>

          <div className="mt-2 flex items-center flex-wrap gap-2">
            <span className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 border border-red-100 rounded-sm">
              {prediction.authorRecentRecord || '精选'}
            </span>
            {prediction.tags && prediction.tags.map((tag, idx) => (
              <span key={idx} className="text-[10px] text-red-500 bg-red-50 px-1.5 py-0.5 border border-red-100 rounded-sm">
                {tag}
              </span>
            ))}
            <div className="flex-grow"></div>
            <span className="text-[10px] text-gray-400">近七日人气 <span className="text-red-500 font-bold">{prediction.viewCount + 15000}</span></span>
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
        {!prediction.isFree && !isPurchased && !isUnlocked && (
          <div className="mt-4 bg-orange-50 rounded-2xl p-6 border border-orange-100 text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-400">
              <Share2 className="w-5 h-5 cursor-pointer" onClick={() => setShowShare(true)} />
            </div>
            
            <h4 className="text-gray-800 font-bold text-lg">解锁公开倒计时</h4>
            
            <div className="flex justify-center items-center space-x-2 mt-4 transition-all">
              {['h', 'm', 's'].map((key) => (
                <React.Fragment key={key}>
                  <motion.div 
                    className="bg-red-500 text-white text-xl font-bold w-12 h-12 flex items-center justify-center rounded-xl shadow-lg shadow-red-100"
                  >
                    {timeLeft[key as keyof typeof timeLeft]}
                  </motion.div>
                  {key !== 's' && <span className="text-red-500 text-xl font-black">:</span>}
                </React.Fragment>
              ))}
            </div>

            <button 
              onClick={() => setShowPayment(true)}
              className="mt-8 flex items-center justify-center space-x-2 bg-gray-900 text-white w-full py-4 rounded-full font-black shadow-xl shadow-gray-200 active:scale-95 transition-transform"
            >
              <Lock className="w-5 h-5 fill-white" />
              <span>付费 ¥ {prediction.price} 立即解锁</span>
            </button>

            <p className="mt-6 text-[11px] text-gray-400 leading-relaxed px-4 font-medium italic">
              内容解锁后永久查看。倒计时结束后将变更为公开方案，公开后不再收费。
            </p>
          </div>
        )}

        {(prediction.isFree || isPurchased || isUnlocked) && (
          <div className="mt-4 bg-white rounded-2xl p-6 border border-gray-100 card-shadow text-center relative overflow-hidden">
            <div className="absolute top-4 right-4 text-gray-400">
              <Share2 className="w-5 h-5 cursor-pointer" onClick={() => setShowShare(true)} />
            </div>
            
            <h4 className="text-gray-800 font-bold text-lg mb-6">推荐内容</h4>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center">
                <span className="text-sm text-gray-500 mb-2">精选内容</span>
                <div className="flex space-x-3">
                  {(prediction.mainPicks || [36, 24, 12]).map((n, i) => (
                    <div key={i} className="w-12 h-12 rounded-full bg-[#f44336] flex items-center justify-center text-white text-lg font-black shadow-lg">
                      {n}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                {prediction.content || '这是作者为您精心挑选的号码，基于大数据模拟分析得出。'}
              </div>
            </div>
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
            {author?.history && (
              <div className="flex space-x-1">
                {author.history.map((c: string, i: number) => (
                  <span key={i} className={`w-6 h-6 rounded-full flex items-center justify-center text-xs text-white ${c === '红' ? 'bg-red-500' : 'bg-gray-800'}`}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-4 pb-12">
            {history.map(item => (
              <div key={item.id} className="bg-white rounded-xl p-4 card-shadow relative">
                <div className="absolute top-8 right-4 w-20 h-16 z-10 pointer-events-none opacity-90 select-none">
                   <img 
                     src={item.result === 'red' || item.result === '红' ? 'https://wxqun988.vxjuejin.com/IMG_1034.PNG' : 'https://wxqun988.vxjuejin.com/IMG_1035.PNG'} 
                     alt={item.result} 
                     className="w-full h-full object-contain"
                   />
                </div>

                <div className="flex items-center mb-3">
                   <span className="font-bold text-gray-800 text-lg mr-2">{item.period}</span>
                   <span className="text-[11px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded font-medium">{item.title}</span>
                </div>
                
                <div className="mt-3 flex items-center">
                  <span className="text-sm text-gray-500 mr-3">正文</span>
                  <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded text-sm font-bold">{item.content || '暂无'}</span>
                </div>
                
                <div className="mt-3 flex items-start">
                  <span className="text-sm text-gray-500 mr-3 mt-1">核对</span>
                  <div className="flex flex-wrap gap-2 text-sm font-bold text-gray-800">
                    {(item.mainPicks || []).map((p: any, i: number) => (
                      <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-[#ef4444]">
                        {p}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4 flex justify-between items-center text-xs text-gray-400 border-t border-gray-50 pt-3">
                  <span>{item.time}</span>
                  <div className="flex items-center">
                    <span className="mr-2">{item.viewCount}人查看</span>
                  </div>
                </div>
             </div>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {!isPurchased && !prediction.isFree && !isUnlocked && (
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
      )}

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
                <div 
                  className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer ${selectedPaymentMethod === 'alipay' ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`} 
                  onClick={() => setSelectedPaymentMethod('alipay')}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                       <span className="text-white font-bold text-lg">支</span>
                    </div>
                    <div>
                      <p className="font-medium">支付宝 (通过性更强)</p>
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${selectedPaymentMethod === 'alipay' ? 'border-blue-500 p-0.5' : 'border-gray-300'}`}>
                    {selectedPaymentMethod === 'alipay' && <div className="w-full h-full bg-blue-500 rounded-full"></div>}
                  </div>
                </div>

                <div 
                  className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer ${user?.balance < prediction?.price ? 'bg-gray-50 opacity-60' : (selectedPaymentMethod === 'balance' ? 'bg-orange-50 border-orange-200' : 'bg-white')}`}
                  onClick={() => {
                    if (user?.balance < prediction?.price) {
                       navigate('/topup');
                    } else {
                       setSelectedPaymentMethod('balance');
                    }
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-white">¥</div>
                    <div>
                      <p className="font-medium">余额支付 (可用余额: ¥ {user?.balance || '0.00'})</p>
                      {user?.balance < prediction?.price && <p className="text-[10px] text-red-500">余额不足，请充值</p>}
                    </div>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${selectedPaymentMethod === 'balance' ? 'border-orange-500 p-0.5' : 'border-gray-300'}`}>
                    {selectedPaymentMethod === 'balance' && <div className="w-full h-full bg-orange-500 rounded-full"></div>}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-xs text-blue-500 leading-relaxed">
                 支付异常请联系上级推荐人，严禁私下交易。查实违规奖励5-10倍。
              </div>

              <button 
                onClick={(e) => { e.stopPropagation(); handlePurchase(); }}
                disabled={isProcessingPayment}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-full mt-6 shadow-xl shadow-red-100 active:scale-95 transition-transform disabled:opacity-50"
              >
                {isProcessingPayment ? '正在支付...' : '立即支付'}
              </button>
           </motion.div>
        </div>
      )}

      {/* Share Poster Modal */}
      <AnimatePresence>
        {showShare && (
          <div className="fixed inset-0 z-[150] flex items-end justify-center" onClick={() => setShowShare(false)}>
            {/* Backdrop with fade and blur */}
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
              className="bg-white w-full max-w-lg rounded-t-[32px] overflow-hidden relative pb-8 max-h-[85vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {/* Drag Handle Bar */}
              <div className="w-12 h-1 bg-gray-200 rounded-full mx-auto mt-3 mb-1"></div>

              {/* Close Button */}
              <div className="absolute top-4 right-6 z-20">
                <X className="w-6 h-6 text-gray-400 cursor-pointer p-0.5" onClick={() => setShowShare(false)} />
              </div>

              {/* Poster Content Area */}
              <div className="relative">
                <div ref={posterRef} className="relative p-5 bg-white">
                  {/* Background Watermark Pattern */}
                  <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none overflow-hidden select-none" style={{ 
                    backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                  }}>
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div key={i} className="absolute text-[9px] font-black whitespace-nowrap rotate-[-30deg]" style={{
                        left: `${(i % 4) * 30}%`,
                        top: `${Math.floor(i / 4) * 18}%`,
                        color: '#000000'
                      }}>
                        智料汇享 智料汇享
                      </div>
                    ))}
                  </div>
                  {/* Poster Content Area */}
                  <div className="relative z-10">
                    {/* Poster Header */}
                    <div className="text-center mb-5">
                      <h3 className="text-[20px] font-black text-gray-900 tracking-tight" style={{ color: '#111827' }}>{prediction.authorName}</h3>
                      <p className="text-[10px] font-bold mt-1 uppercase tracking-widest" style={{ color: '#9ca3af' }}>{prediction.period} 专属方案</p>
                    </div>

                    {/* Prediction Summary Section - Conditional Rendering */}
                    {!prediction.isFree && !isPurchased && !isUnlocked ? (
                      /* Locked Version */
                      <div className="rounded-2xl p-5 border flex flex-col items-center mb-6 overflow-hidden relative" style={{ backgroundColor: '#fff5f5', borderColor: '#fee2e2' }}>
                        <div className="absolute top-0 left-0 w-full h-1 overflow-hidden" style={{ backgroundColor: '#ef4444' }}>
                          <motion.div 
                            animate={{ x: ["-100%", "100%"] }} 
                            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/50 to-transparent"
                          />
                        </div>
                        
                        <h4 className="font-black text-[15px] mb-4 tracking-widest flex items-center" style={{ color: '#ef4444' }}>
                          <Lock className="w-3.5 h-3.5 mr-1.5" style={{ fill: '#ef4444' }} />
                          解锁公开倒计时
                        </h4>
                        
                        {/* Countdown Timer in Poster */}
                        <div className="flex justify-center items-center space-x-1.5 mb-5 transition-all">
                          {['h', 'm', 's'].map((key) => (
                            <React.Fragment key={key}>
                              <div className="text-white text-base font-bold w-9 h-9 flex items-center justify-center rounded-lg shadow-sm" style={{ backgroundColor: '#e53935' }}>
                                {timeLeft[key as keyof typeof timeLeft]}
                              </div>
                              {key !== 's' && <span className="text-lg font-black" style={{ color: '#ef4444' }}>:</span>}
                            </React.Fragment>
                          ))}
                        </div>

                        {/* Payment Info */}
                        <div className="bg-white/80 backdrop-blur-sm px-5 py-2.5 rounded-full border flex items-center justify-center space-x-2 font-black text-[13px] mb-4 shadow-sm" style={{ borderColor: '#fee2e2', color: '#111827' }}>
                          <span>付费 ¥ {prediction.price} 立即解锁</span>
                        </div>

                        {/* Disclaimer Text */}
                        <div className="text-[9px] leading-tight text-center px-4 font-medium italic" style={{ color: '#9ca3af' }}>
                          付费解锁后永久查看，不限次数。
                        </div>
                      </div>
                    ) : (
                      /* Unlocked Version */
                      <div className="rounded-2xl p-5 border flex flex-col items-center mb-6" style={{ backgroundColor: '#fff7ed', borderColor: '#ffedd5' }}>
                        <h4 className="font-black text-[15px] mb-4 tracking-widest flex items-center" style={{ color: '#ea580c' }}>
                          <Star className="w-3.5 h-3.5 mr-1.5" style={{ fill: '#f97316' }} />
                          付费推荐内容
                        </h4>
                        
                        {/* Paid Content Box */}
                        <div className="w-full bg-white/60 backdrop-blur-sm border-2 border-dashed rounded-xl py-5 flex flex-col items-center shadow-sm" style={{ borderColor: '#fed7aa' }}>
                          <div className="flex space-x-3 mb-4">
                            {(prediction.mainPicks || [36, 24, 12]).map((n, i) => (
                              <motion.div 
                                key={i}
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-black shadow-md"
                                style={{ background: 'linear-gradient(to bottom right, #ef4444, #dc2626)' }}
                              >
                                {n}
                              </motion.div>
                            ))}
                          </div>
                          <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase" style={{ backgroundColor: '#ffedd5', color: '#ea580c' }}>
                            VIP 内部精选方案
                          </div>
                          {prediction.content && (
                            <div className="mt-3 px-4 text-[10px] text-center font-bold" style={{ color: '#4b5563' }}>
                              {prediction.content.substring(0, 40)}{prediction.content.length > 40 ? '...' : ''}
                            </div>
                          )}
                        </div>
                        
                        <div className="mt-4 text-[9px] font-medium text-center" style={{ color: '#9ca3af' }}>
                          * 这是为您精心挑选的号码，基于大数据模拟分析。
                        </div>
                      </div>
                    )}

                    {/* QR Code Section */}
                    <div className="flex items-center justify-between px-2 mb-2">
                      <div className="flex-1">
                         <h4 className="font-black text-[15px] mb-1" style={{ color: '#111827' }}>智料汇享</h4>
                         <p className="text-[10px] font-bold leading-relaxed pr-4" style={{ color: '#9ca3af' }}>
                           专业数字概率分析平台<br />
                           每日更新独家数据方案
                         </p>
                         <div className="mt-3 text-[9px] font-medium" style={{ color: '#d1d5db' }}>
                           {new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-')}
                         </div>
                      </div>
                      <div className="flex flex-col items-center">
                        <div className="bg-white p-2 rounded-xl border shadow-md mb-1.5" style={{ borderColor: '#f3f4f6' }}>
                          <QRCodeSVG 
                            value={`https://${window.location.host}/prediction/${id}`} 
                            size={70}
                            bgColor="#ffffff"
                            fgColor="#000000"
                            level="H"
                          />
                        </div>
                        <p className="font-black text-[10px] tracking-widest" style={{ color: '#111827' }}>扫码查看详情</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="px-5 pb-5">
                  <button onClick={handleDownloadPoster} className="w-full bg-[#e53935] text-white font-bold py-3.5 rounded-2xl flex items-center justify-center space-x-2 shadow-lg shadow-red-100 active:scale-[0.98] transition-transform">
                    <Download className="w-4 h-4" />
                    <span className="text-[15px] tracking-widest">下载高清海报</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Return Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button onClick={() => navigate(-1)} className="w-12 h-12 bg-white rounded-full flex flex-col items-center justify-center text-gray-400 text-[10px] card-shadow border border-gray-100">
           返回
        </button>
      </div>
      {isProcessingPayment && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/20 backdrop-blur-sm">
            <div className="bg-white p-4 rounded-2xl flex items-center justify-center shadow-2xl">
                <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        </div>
      )}
    </motion.div>
  );
};

export default PredictionDetail;

