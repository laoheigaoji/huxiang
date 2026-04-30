import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const TopUp = () => {
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('alipay');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [balanceAtStart, setBalanceAtStart] = useState<number | null>(null);
  const [user, setUser] = useState<any>(null);

  React.useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('status') === 'success' && !loading) {
        setLoading(true);
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.delete('status');
        window.history.replaceState({}, '', currentUrl.toString());
    }

    api.getProfile().then(data => {
      setUser(data);
      if (data && data.balance !== undefined) {
        setBalanceAtStart(data.balance);
      }
    }).catch(console.error);
  }, []);

  const pollBalance = async () => {
    try {
      const data = await api.getProfile();
      if (data && data.balance !== undefined) {
        if (balanceAtStart !== null && data.balance > balanceAtStart) {
          setUser(data);
          setLoading(false);
          alert('充值成功！');
          return true;
        }
      }
    } catch (err) {
      console.error("Polling error", err);
    }
    return false;
  };

  const loadingRef = React.useRef(loading);
  React.useEffect(() => {
    loadingRef.current = loading;
  }, [loading]);

  React.useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        if (loadingRef.current) {
          pollBalance();
        }
      }, 3000);
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && loadingRef.current) {
        pollBalance();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, balanceAtStart]);

  const handlePay = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('请输入正确的充值金额');
      return;
    }
    
    setLoading(true);
    try {
      const isPC = !/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      console.log('Initiating payment, isPC:', isPC);
      const res = await api.createPayment(parseFloat(amount), selectedMethod, '金币充值', user?.id, undefined, undefined, isPC);
      console.log('Payment response:', res);
      
      if (res.code === 1) {
        const outTradeNo = res.out_trade_no;
        if (outTradeNo) {
            sessionStorage.setItem('last_out_trade_no', outTradeNo);
        }
        if (isPC && res.url && res.params) {
            // Form submit jump for PC
            // Keep loading status while redirecting
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = res.url;
            form.target = '_blank';
            Object.keys(res.params).forEach(key => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = key;
                input.value = res.params[key];
                form.appendChild(input);
            });
            document.body.appendChild(form);
            form.submit();
            document.body.removeChild(form);
        } else if (res.payurl || res.qrcode || res.urlscheme) {
            const url = res.payurl || res.qrcode || res.urlscheme;
            if (url.startsWith('http')) {
              window.location.href = url;
              // Keep loading true, it will be cleared by pollBalance or manual close
            } else {
              // For qrcode or urlscheme that aren't direct http links
              alert(`请使用支付应用扫码或打开: ${url}`);
              setLoading(false);
            }
        } else {
            alert('创建支付成功，但未能获取支付页面');
            setLoading(false);
        }
      } else {
        alert(res.msg || '创建支付失败 (错误代码: ' + res.code + ')');
        setLoading(false);
      }
    } catch (err) {
      console.error('Payment failed', err);
      alert('支付请求失败，请稍后重试');
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-white min-h-screen pb-12"
    >
      {/* App Header */}
      <div className="bg-[#d32f2f] px-4 py-4 flex items-center justify-center relative shadow-sm">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">充值</h2>
      </div>

      <div className="p-4">
        {/* Balance Card */}
        <div className="bg-[#d32f2f] rounded-lg p-6 text-white relative">
          <p className="text-[14px] opacity-90 font-medium">账户余额 (元)</p>
          <p className="text-[36px] font-bold mt-4 flex items-baseline">
            <span className="text-[20px] mr-1">¥</span>{user?.balance?.toFixed(2) || '0.00'}
          </p>
          <button 
            className="absolute top-4 right-4 bg-white text-[#d32f2f] px-4 py-1.5 rounded-full text-[13px] font-bold"
            onClick={() => navigate('/balance-details')}
          >
            充值记录
          </button>
        </div>

        {/* Amount Input */}
        <div className="mt-8">
          <p className="text-[15px] font-bold text-gray-800">充值金额 (元) :</p>
          <div className="mt-4 bg-[#f8f8f8] rounded-lg p-4 flex items-center h-16 border border-gray-50">
             <span className="text-[18px] font-bold mr-3 text-gray-900">¥</span>
             <input 
               type="number" 
               value={amount}
               onChange={(e) => setAmount(e.target.value)}
               placeholder="请输入金额" 
               className="text-[20px] font-bold bg-transparent w-full focus:outline-none placeholder:text-gray-300 placeholder:font-medium" 
             />
          </div>
          <p className="mt-3 text-[13px] text-gray-400 font-medium">
            单次最低充值金额100元，最高充值金额5000元
          </p>
          <p className="mt-1 text-[13px] text-[#00c853] font-medium">
            充值无手续费，实时到账
          </p>
        </div>

        {/* Payment Methods */}
        <div className="mt-8">
          <p className="text-[15px] font-bold text-gray-800 mb-4">充值方式 :</p>
          <div className="space-y-3">
            {/* Alipay */}
            <div 
              className={`rounded-xl p-4 flex items-center justify-between border transition-all active:bg-gray-50 ${selectedMethod === 'alipay' ? 'border-[#d32f2f] bg-[#fffcfc]' : 'border-gray-100 bg-gray-50/30'}`}
              onClick={() => setSelectedMethod('alipay')}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#2196f3] rounded-full flex items-center justify-center mr-3">
                   <span className="text-white text-[15px] font-bold italic">支</span>
                </div>
                <span className="text-[15px] font-medium text-gray-900">支付宝 1</span>
              </div>
              <div>
                {selectedMethod === 'alipay' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#d32f2f] fill-[#d32f2f]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
              </div>
            </div>

            {/* WeChat */}
            <div 
              className={`rounded-xl p-4 flex items-center justify-between border transition-all active:bg-gray-50 ${selectedMethod === 'wxpay' ? 'border-[#d32f2f] bg-[#fffcfc]' : 'border-gray-100 bg-gray-50/30'}`}
              onClick={() => setSelectedMethod('wxpay')}
            >
              <div className="flex items-center">
                <div className="w-9 h-9 bg-[#00c853] rounded-full flex items-center justify-center mr-3">
                   <span className="text-white text-[15px] font-bold italic">微</span>
                </div>
                <span className="text-[15px] font-medium text-gray-900">微信支付</span>
              </div>
              <div>
                {selectedMethod === 'wxpay' ? (
                  <CheckCircle2 className="w-6 h-6 text-[#d32f2f] fill-[#d32f2f]" />
                ) : (
                  <div className="w-6 h-6 rounded-full border border-gray-300"></div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Agreement */}
        <div className="mt-8 flex items-center justify-center space-x-2">
           <div className="w-4 h-4 border border-gray-200 rounded flex items-center justify-center bg-gray-50">
             <div className="w-2.5 h-2.5 bg-white rounded-sm"></div>
           </div>
           <span className="text-[13px] text-gray-800">
             支付即视为同意 <span className="text-[#3b82f6] underline">《支付协议》</span>
           </span>
        </div>

        {/* Confirm Button */}
        <button 
          onClick={handlePay}
          disabled={loading}
          className={`w-full bg-[#d32f2f] text-white font-bold py-4 rounded-full mt-6 shadow-xl shadow-[#d32f2f]/10 active:scale-95 transition-transform text-[17px] ${loading ? 'opacity-70 animate-pulse' : ''}`}
        >
          {loading ? '创建订单中...' : '确认支付'}
        </button>
      </div>

      {/* Fullscreen Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl max-w-[280px] w-full mx-4 relative">
                <button 
                    onClick={() => setLoading(false)} 
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                >
                    <X size={20} />
                </button>
                <div className="w-12 h-12 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin mb-4 mt-2"></div>
                <p className="text-gray-900 font-bold text-lg">正在确认充值...</p>
                <p className="text-gray-400 text-xs mt-2 text-center leading-relaxed">支付完成后请返回此页面，系统将自动更新余额</p>
            </div>
        </div>
      )}

    </motion.div>
  );
};

export default TopUp;
