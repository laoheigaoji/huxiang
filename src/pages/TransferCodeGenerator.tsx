import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, QrCode, X, History } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';

interface HistoryItem {
    id: string;
    name: string;
    cardNo: string;
    cardIndex?: string;
    isCardNoHidden?: boolean;
    shortUrl: string;
    createdAt: string;
}

const maskCardNumber = (cardNo: string) => {
    if (!cardNo || cardNo.length <= 10) return cardNo;
    return `${cardNo.slice(0, 6)}***${cardNo.slice(-4)}`;
};

interface StyledQrModalProps {
    isOpen: boolean;
    onClose: () => void;
    shortUrl: string;
    name: string;
    cardNo: string;
}

const StyledQrModal: React.FC<StyledQrModalProps> = ({ isOpen, onClose, shortUrl, name, cardNo }) => {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const [imageSrc, setImageSrc] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && canvasRef.current && shortUrl) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (!ctx) return;
            setImageSrc(null); // Reset image source

            const bg = new Image();
            const qr = new Image();
            
            // Allow cross-origin for images? Might need this?
            bg.crossOrigin = "anonymous";
            qr.crossOrigin = "anonymous";

            bg.onload = () => {
                canvas.width = bg.width;
                canvas.height = bg.height;
                ctx.drawImage(bg, 0, 0);

                qr.onload = () => {
                    const scale = 0.55;
                    const newQrWidth = bg.width * scale;
                    const newQrHeight = bg.width * scale;
                    const dstX = (bg.width - newQrWidth) / 2;
                    const dstY = bg.height * 0.40;

                    ctx.drawImage(qr, dstX, dstY, newQrWidth, newQrHeight);

                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 48px Arial';
                    ctx.textAlign = 'center';
                    const textY = dstY + newQrHeight + 80;
                    ctx.fillText(`${name}    ${maskCardNumber(cardNo)}`, bg.width / 2, textY);
                    
                    // Generate image data URL after rendering
                    setImageSrc(canvas.toDataURL('image/png'));
                };
                qr.onerror = () => {
                    console.error("Failed to load QR code image");
                    ctx.fillStyle = 'red';
                    ctx.fillText('二维码加载失败', canvas.width / 2, canvas.height / 2);
                };
                qr.src = `/api/proxy/image?url=${encodeURIComponent(`https://api.2dcode.biz/v1/create-qr-code?data=${encodeURIComponent(shortUrl)}`)}`;
            };
            bg.onerror = () => {
                console.error("Failed to load background image");
            };
            bg.src = '/api/proxy/image?url=https://wxqun988.vxjuejin.com/bg11.jpg';
        }
    }, [isOpen, shortUrl, name, cardNo]);

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-4 flex flex-col items-center">
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                {imageSrc ? (
                    <img src={imageSrc} alt="二维码" className="w-full h-auto rounded-xl" />
                ) : (
                    <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-xl animate-pulse">
                        <span className="text-gray-400">正在生成...</span>
                    </div>
                )}
                <p className="text-center text-sm text-slate-500 mt-4">长按图片保存到相册</p>
            </div>
        </Modal>
    );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean, onClose: () => void, children: React.ReactNode }) => (
    <AnimatePresence>
        {isOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={onClose}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                    <button onClick={onClose} className="p-4 absolute top-2 right-2 text-gray-400"><X /></button>
                    {children}
                </motion.div>
            </motion.div>
        )}
    </AnimatePresence>
);

const TransferCodeGenerator = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ name: '', cardNo: '', bankMark: 'ICBC', cardIndex: '', isCardNoHidden: false });
    const [shortUrl, setShortUrl] = useState('');
    const [showQr, setShowQr] = useState(false);
    const [selectedItem, setSelectedItem] = useState<{name: string, cardNo: string} | null>(null);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user.id;
    const [showPayment, setShowPayment] = useState(false);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'balance' | 'alipay'>('alipay');
    const [isProcessingPayment, setIsProcessingPayment] = useState(false);
    
    const [isGeneratingBalance, setIsGeneratingBalance] = useState(false);

    const [settings, setSettings] = useState<any>({});
    
    useEffect(() => {
        api.getSettings().then(setSettings).catch(console.error);
        if (userId) {
            fetch(`/api/transfer-code/history?userId=${userId}`)
                .then(res => res.json())
                .then(data => setHistory(data))
                .catch(console.error);
        }
    }, [userId]);


    const handlePurchase = async () => {
        if (!userId) {
            alert("请先登录");
            return;
        }
        try {
            if (selectedPaymentMethod === 'balance') {
                setIsGeneratingBalance(true);
                const response = await fetch('/api/transfer-code/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId, ...formData })
                });
                const data = await response.json();
                if (response.ok) {
                    setIsGeneratingBalance(false);
                    setShortUrl(data.shortUrl);
                    
                    fetch(`/api/transfer-code/history?userId=${userId}`)
                        .then(res => res.json())
                        .then(d => setHistory(d))
                        .catch(console.error);

                    setShowPayment(false);
                    setSelectedItem({name: formData.name, cardNo: formData.cardNo});
                    setShowQr(true);
                } else {
                    setIsGeneratingBalance(false);
                    alert(data.error || '生成失败');
                }
            } else {
                setShowPayment(false);
                sessionStorage.setItem('tcForm', JSON.stringify(formData));
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.set('payment_return', '1');
                currentUrl.searchParams.set('init_bal', user?.balance || '0');
                const returnUrl = currentUrl.toString();
                
                const isPC = !/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
                
                const payAmount = formData.isCardNoHidden ? 80 : 50;
                setIsProcessingPayment(true);
                const payRes = await api.createPayment(payAmount, 'alipay', '转卡码生成', userId, undefined, returnUrl, isPC);
                
                if (payRes.code === 1) {
                    const outTradeNo = payRes.out_trade_no;
                    if (outTradeNo) {
                        sessionStorage.setItem('last_out_trade_no', outTradeNo);
                    }
                    if (isPC && payRes.url && payRes.params) {
                        // Form submit jump for PC
                        const form = document.createElement('form');
                        form.method = 'POST';
                        form.action = payRes.url;
                        form.target = '_blank';
                        Object.keys(payRes.params).forEach(key => {
                            const input = document.createElement('input');
                            input.type = 'hidden';
                            input.name = key;
                            input.value = payRes.params[key];
                            form.appendChild(input);
                        });
                        document.body.appendChild(form);
                        form.submit();
                        document.body.removeChild(form);
                    } else if (payRes.payurl || payRes.qrcode || payRes.url || payRes.payment_url) {
                        const paymentUrl = payRes.payurl || payRes.qrcode || payRes.url || payRes.payment_url;
                        // Keep loading overlay, it will be cleared by poll or manual close
                        window.location.href = paymentUrl;
                    } else {
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        url.searchParams.delete('init_bal');
                        window.history.replaceState({}, '', url.toString());
                        alert('创建支付成功，但未能获取支付页面');
                        setIsProcessingPayment(false);
                    }
                } else {
                    const url = new URL(window.location.href);
                    url.searchParams.delete('payment_return');
                    url.searchParams.delete('init_bal');
                    window.history.replaceState({}, '', url.toString());

                    alert(payRes.msg || '支付请求发送失败');
                    setIsProcessingPayment(false);
                }
            }
        } catch (error: any) {
            console.error(error);
            const url = new URL(window.location.href);
            url.searchParams.delete('payment_return');
            url.searchParams.delete('init_bal');
            window.history.replaceState({}, '', url.toString());

            alert(error.message || '网络错误');
            setIsProcessingPayment(false);
            setIsGeneratingBalance(false);
        }
    };

    // Polling to check if generation succeeded already
    const isProcessingPaymentRef = React.useRef(isProcessingPayment);
    useEffect(() => {
        isProcessingPaymentRef.current = isProcessingPayment;
    }, [isProcessingPayment]);

    useEffect(() => {
        if (!userId) return;

        const urlParams = new URLSearchParams(window.location.search);
        console.log("URL Params on mount:", urlParams.toString());

        const isPaymentReturn = urlParams.get('payment_return') === '1';

        if (isPaymentReturn && !isProcessingPayment) {
            setIsProcessingPayment(true);
        }

        let isPolling = false;
        const pollInterval = setInterval(async () => {
           if (!isProcessingPaymentRef.current) return;
           if (isPolling) return;
           
           const currentUrlParams = new URLSearchParams(window.location.search);
           
           // Try to find it
           let outTradeNo = currentUrlParams.get('out_trade_no') || sessionStorage.getItem('last_out_trade_no');
           
           if (!outTradeNo) {
               try {
                   const resp = await fetch(`/api/order/find-recent-pending?userId=${userId}`);
                   if (resp.ok) {
                       const order = await resp.json();
                       outTradeNo = order.out_trade_no;
                   }
               } catch (e) {
                   console.error("Polling: Failed to find pending order", e);
               }
           }
           
           if (!outTradeNo) return; // Nothing to poll

           isPolling = true;
           try {
            // Check order status
            console.log("Polling: Fetching /api/order/status for:", outTradeNo);
            const res = await fetch(`/api/order/status?out_trade_no=${String(outTradeNo)}`);
            if (!res.ok) {
                console.error("Polling: Status check failed with status:", res.status);
                return;
            }
            const data = await res.json();
            console.log("Polling status check result for:", outTradeNo, data);
            
            if (data.status === 'completed') {
                 console.log("Order completed, attempting automatic generation");
                     try {
                        const formStr = sessionStorage.getItem('tcForm');
                        const formPayload = formStr ? JSON.parse(formStr) : formData;
                        
                        
                        // Clear URL params BEFORE setting state to avoid effect re-triggering
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        url.searchParams.delete('out_trade_no');
                        window.history.replaceState({}, '', url.toString());

                        // IMMEDIATELY show the QR modal in a loading state
                        setIsProcessingPayment(false);
                        setShowQr(true);
                        setSelectedItem({name: formPayload.name, cardNo: formPayload.cardNo});
                        setShortUrl(""); // Clear previous
                        
                        // Proceed to poll/generate
                        let genRes;
                        try {
                            genRes = await fetch('/api/transfer-code/generate', {
                                 method: 'POST',
                                 headers: { 'Content-Type': 'application/json' },
                                 body: JSON.stringify({ userId, ...formPayload })
                            });
                        } catch (e) {
                            console.error("Auto generation fetch err:", e);
                            alert("生成请求异常，请稍后刷新页面");
                            setShowQr(false);
                            isPolling = false;
                            return;
                        }

                        let genData: any = {};
                        try {
                            genData = await genRes.json();
                        } catch (e) {
                            console.error("Failed to parse genRes", e);
                        }

                        // Clear URL params
                        const currentUrl = new URL(window.location.href);
                        currentUrl.searchParams.delete('payment_return');
                        currentUrl.searchParams.delete('out_trade_no');
                        window.history.replaceState({}, '', currentUrl.toString());

                        if (genRes.ok) {
                            setShortUrl(genData.shortUrl);
                            
                            // fetch history to be safe
                            fetch(`/api/transfer-code/history?userId=${userId}`)
                               .then(res => res.json())
                               .then(data => setHistory(data))
                               .catch(() => {});

                            sessionStorage.removeItem('tcForm');
                            isPolling = false;
                            return; // Exit polling
                        } else {
                            alert(genData.error || '生成失败，请检查余额是否足够或联系客服');
                            setShowQr(false); // Close QR modal on failure
                            isPolling = false;
                            return; // Exit polling
                        }
                    } catch (e: any) {
                        console.error("Auto generation err:", e);
                        alert("请求异常: " + (e.message || "未知错误"));
                        setShowQr(false);
                        
                        const url = new URL(window.location.href);
                        url.searchParams.delete('payment_return');
                        window.history.replaceState({}, '', url.toString());
                        setIsProcessingPayment(false);
                        isPolling = false;
                        return;
                    }
                }

                // Fallback (if needed, could check status again or just stop)
           } finally {
               isPolling = false;
           }
        }, 3000);
        
        return () => clearInterval(pollInterval);
    // Remove isProcessingPayment from dependency to prevent infinite loops of setting it back to true if replaceState lags
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setShowPayment(true);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen bg-slate-50 p-4 text-slate-900 pb-20">
            <header className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-md p-4 rounded-3xl shadow-sm border border-slate-100">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition">
                    <ChevronLeft className="w-6 h-6 text-slate-600" />
                </button>
                <h2 className="text-lg font-bold text-slate-900">转卡码生成器</h2>
                <div className="w-10"></div>
            </header>

            <form onSubmit={handleSubmit} className="bg-white p-7 rounded-3xl shadow-lg shadow-slate-200/50 space-y-5 border border-slate-100">
                <div className="space-y-4">
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" placeholder="收款人姓名" required onChange={e => setFormData({...formData, name: e.target.value})}/>
                    <input type="text" className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" placeholder="银行卡号" required onChange={e => setFormData({...formData, cardNo: e.target.value})}/>
                    <select className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-slate-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" onChange={e => setFormData({...formData, bankMark: e.target.value})}>
                        <option value="ICBC">工商银行 (ICBC)</option>
                        <option value="ABC">农业银行 (ABC)</option>
                        <option value="CCB">建设银行 (CCB)</option>
                        <option value="BOC">中国银行 (BOC)</option>
                        <option value="CMB">招商银行 (CMB)</option>
                        <option value="PSBC">邮储银行 (PSBC)</option>
                        <option value="COMM">交通银行 (COMM)</option>
                        <option value="SPDB">浦发银行 (SPDB)</option>
                        <option value="CMBC">民生银行 (CMBC)</option>
                        <option value="CIB">兴业银行 (CIB)</option>
                        <option value="CITIC">中信银行 (CITIC)</option>
                        <option value="CEB">光大银行 (CEB)</option>
                        <option value="GDB">广发银行 (GDB)</option>
                        <option value="HXB">华夏银行 (HXB)</option>
                        <option value="PAB">平安银行 (PAB)</option>
                    </select>

                    <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-800">隐藏卡号(隐藏码)</span>
                            <span className="text-[10px] text-slate-400">开启后将使用 cardIndex 参数</span>
                        </div>
                        <button 
                            type="button"
                            onClick={() => setFormData({...formData, isCardNoHidden: !formData.isCardNoHidden})}
                            className={`w-14 h-7 rounded-full transition-colors relative ${formData.isCardNoHidden ? 'bg-blue-600' : 'bg-slate-200'}`}
                        >
                            <div className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${formData.isCardNoHidden ? 'translate-x-7' : ''}`} />
                        </button>
                    </div>

                    {formData.isCardNoHidden && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 bg-slate-50 rounded-2xl border border-blue-100 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition" 
                                placeholder="请输入 Card Index (必填)" 
                                required={formData.isCardNoHidden} 
                                value={formData.cardIndex}
                                onChange={e => setFormData({...formData, cardIndex: e.target.value})}
                            />
                        </motion.div>
                    )}
                </div>
                <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-2xl font-semibold text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/10">
                    生成转卡码
                </button>
            </form>

            <AnimatePresence>
            {shortUrl && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-8 bg-gradient-to-br from-blue-600 to-indigo-700 p-7 rounded-3xl shadow-xl shadow-blue-500/20 text-white">
                    <p className="font-semibold text-blue-100 text-sm mb-3">生成成功！</p>
                    <div className="grid grid-cols-1 gap-3">
                        <button onClick={() => { setSelectedItem({name: formData.name, cardNo: formData.cardNo}); setShowQr(true); }} className="py-4 bg-white text-blue-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition">
                            <QrCode size={18} /> 查看二维码
                        </button>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>

            <div className="mt-10">
                <h3 className="text-base font-bold flex items-center gap-2 mb-4 text-slate-800 px-1"><History className="text-slate-400" size={18} /> 最近生成</h3>
                <div className="space-y-3">
                    {history.map((item, index) => (
                        <div key={item.id || index} className="bg-white p-4 rounded-2xl flex justify-between items-center border border-slate-100 shadow-sm">
                             <div>
                                <p className="text-sm font-bold text-slate-900">{item.name}</p>
                                <p className="text-xs text-slate-500 font-mono mt-1">
                                    {maskCardNumber(item.cardNo)}
                                    {item.isCardNoHidden && <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-600 text-[9px] rounded font-bold">隐藏码</span>}
                                </p>
                                <p className="text-[10px] text-slate-400 mt-1">{new Date(item.createdAt).toLocaleString()}</p>
                             </div>
                             <button onClick={() => { setShortUrl(item.shortUrl); setSelectedItem({name: item.name, cardNo: item.cardNo}); setShowQr(true); }} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200">
                                <QrCode size={18} className="text-slate-600" />
                             </button>
                        </div>
                    ))}
                </div>
            </div>

            <StyledQrModal 
                isOpen={showQr} 
                onClose={() => {setShowQr(false); setSelectedItem(null);}} 
                shortUrl={shortUrl} 
                name={selectedItem ? selectedItem.name : formData.name} 
                cardNo={selectedItem ? selectedItem.cardNo : formData.cardNo} 
            />
            
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
                        <span className="text-[#d32f2f] text-3xl font-bold">¥ {formData.isCardNoHidden ? '80.00' : '50.00'}</span>
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
                          className={`flex items-center justify-between p-4 rounded-xl border border-gray-100 cursor-pointer ${user?.balance < (formData.isCardNoHidden ? 80 : 50) ? 'bg-gray-50 opacity-60' : (selectedPaymentMethod === 'balance' ? 'bg-orange-50 border-orange-200' : 'bg-white')}`}
                          onClick={() => {
                            if (user?.balance < (formData.isCardNoHidden ? 80 : 50)) {
                               navigate('/topup');
                            } else {
                               setSelectedPaymentMethod('balance');
                            }
                          }}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center mr-3 text-white">¥</div>
                            <div>
                              <p className="font-medium">余额支付 (可用余额: ¥ {Number(user?.balance || 0).toFixed(2)})</p>
                              {user?.balance < parseFloat(settings.transferCodePrice || '2') && <p className="text-[10px] text-[#d32f2f]">余额不足，请充值</p>}
                            </div>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${selectedPaymentMethod === 'balance' ? 'border-orange-500 p-0.5' : 'border-gray-300'}`}>
                            {selectedPaymentMethod === 'balance' && <div className="w-full h-full bg-orange-500 rounded-full"></div>}
                          </div>
                        </div>
                      </div>
        
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePurchase(); }}
                        disabled={isProcessingPayment || isGeneratingBalance}
                        className="w-full bg-[#d32f2f] text-white font-bold py-4 rounded-full mt-6 shadow-xl shadow-[#d32f2f]/20 active:scale-95 transition-transform disabled:opacity-50"
                      >
                        {isGeneratingBalance ? '正在生成...' : (isProcessingPayment ? '正在跳转付款...' : '立即支付')}
                      </button>
                   </motion.div>
                </div>
            )}
            {/* Fullscreen Loading Overlay for Payment */}
            {isProcessingPayment && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-3xl flex flex-col items-center justify-center shadow-2xl max-w-[280px] w-full mx-4 relative">
                        <button 
                            onClick={() => {
                                setIsProcessingPayment(false);
                                
                    const url = new URL(window.location.href);
                    url.searchParams.delete('payment_return');
                    url.searchParams.delete('init_bal');
                    window.history.replaceState({}, '', url.toString());

                                
                            }} 
                            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={20} />
                        </button>
                        <div className="w-12 h-12 border-4 border-[#d32f2f] border-t-transparent rounded-full animate-spin mb-4 mt-2"></div>
                        <p className="text-gray-900 font-bold text-lg">正在确认支付...</p>
                        <p className="text-gray-400 text-xs mt-2 text-center leading-relaxed">支付完成后请返回此页面，系统将自动同步解锁状态</p>
                    </div>
                </div>
            )}
        </motion.div>
    );
};

export default TransferCodeGenerator;
