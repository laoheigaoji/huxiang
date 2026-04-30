import React, { useState, useEffect } from 'react';
import { ChevronLeft, Info, CheckCircle2, ChevronRight, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

const Withdraw = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'alipay' | 'bank'>('alipay');
  const [account, setAccount] = useState('');
  const [bankName, setBankName] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getProfile();
        setUser(data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) return alert('请输入正确的提现金额');
    if (type === 'bank' && !bankName) return alert('请输入结算银行');
    if (!account) return alert('请输入结算账号');
    if (!name) return alert('请输入结算姓名');
    
    setLoading(true);
    try {
      await api.withdraw({ 
        amount: parseFloat(amount), 
        account, 
        bankName: type === 'bank' ? bankName : undefined,
        name, 
        type 
      });
      setSuccess(true);
    } catch (err: any) {
      alert(err.message || '提现申请失败');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <h2 className="text-2xl font-black text-gray-900 mb-2">提现申请已提交</h2>
        <p className="text-gray-500 text-sm mb-8">我们将在1-3个工作日内完成审核并打款，请耐心等待。</p>
        <button 
          onClick={() => navigate('/balance-details')}
          className="w-full bg-[#f8f9fc] text-gray-900 font-bold py-4 rounded-2xl active:scale-95 transition-transform"
        >
          返回余额
        </button>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="bg-white p-4 flex items-center justify-between sticky top-0 z-30">
        <ChevronLeft className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-lg font-bold text-gray-900">余额提现</h2>
        <div className="w-6"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Withdraw Amount Card */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <p className="text-sm font-bold text-gray-800 mb-6">提现金额</p>
          <div className="flex items-center border-b border-gray-50 pb-4 mb-4">
            <span className="text-3xl font-black text-gray-900 mr-3">¥</span>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00" 
              className="text-3xl font-black bg-transparent w-full focus:outline-none placeholder:text-gray-200" 
            />
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">可用余额 : ¥{user?.balance?.toFixed(2) || '0.00'}</span>
            <button className="text-[#d32f2f] font-bold" onClick={() => setAmount(user?.balance?.toFixed(2) || '0')}>全部提现</button>
          </div>
        </div>

        {/* Withdrawal Method */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-50">
          <p className="text-sm font-bold text-gray-800 mb-6">结算账户</p>
          
          <div className="space-y-4">
             <div className="flex items-center space-x-6 mb-6">
                <button 
                  onClick={() => setType('alipay')}
                  className={`flex items-center space-x-2 pb-2 border-b-2 transition-all ${type === 'alipay' ? 'border-[#d32f2f] text-[#d32f2f] font-bold' : 'border-transparent text-gray-400'}`}
                >
                   <span>支付宝</span>
                </button>
                <button 
                  onClick={() => setType('bank')}
                  className={`flex items-center space-x-2 pb-2 border-b-2 transition-all ${type === 'bank' ? 'border-[#d32f2f] text-[#d32f2f] font-bold' : 'border-transparent text-gray-400'}`}
                >
                   <span>银行卡</span>
                </button>
             </div>

             <div className="space-y-4">
                {type === 'bank' && (
                  <div>
                    <label className="text-[11px] text-gray-400 block mb-1">结算银行</label>
                    <input 
                      type="text" 
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="请输入银行名称 (如: 招商银行)" 
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-red-100"
                    />
                  </div>
                )}
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">结算姓名</label>
                  <input 
                    type="text" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入真实姓名" 
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-red-100"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">结算账号</label>
                  <input 
                    type="text" 
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={type === 'alipay' ? '请输入支付宝账号' : '请输入银行卡号'} 
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 ring-red-100"
                  />
                </div>
             </div>
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 bg-blue-50/50 rounded-2xl flex items-start space-x-3">
          <Info className="w-5 h-5 text-[#d32f2f] shrink-0" />
          <div className="text-[11px] text-[#d32f2f] leading-relaxed">
            提现须知：提现申请将在3个工作日内审核完毕。最低提现金额为100元，提现将收取0.1%的手续费。
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6">
          <button 
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full bg-[#d32f2f] text-white font-bold py-4 rounded-3xl shadow-xl shadow-[#d32f2f]/10 active:scale-95 transition-transform flex items-center justify-center space-x-2 ${
              loading ? 'opacity-70' : ''
            }`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              '确认提现'
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Withdraw;
