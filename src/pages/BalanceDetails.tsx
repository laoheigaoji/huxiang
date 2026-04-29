import React, { useState, useEffect } from 'react';
import { ChevronLeft, Wallet, ArrowUpRight, ArrowDownLeft, History, PieChart, Landmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { api } from '../services/api';

interface Transaction {
  id: string;
  type: 'recharge' | 'withdraw' | 'earnings';
  amount: number;
  description: string;
  time: string;
}

const BalanceDetails = () => {
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profile, trans] = await Promise.all([
          api.getProfile(),
          api.getTransactions()
        ]);
        setBalance(profile.balance || 0);
        
        // Calculate total earnings from transactions
        const earnings = trans
          .filter((t: any) => t.type === 'earnings')
          .reduce((sum: number, t: any) => sum + t.amount, 0);
        setTotalEarnings(earnings);
        
        setTransactions(trans.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime()));
      } catch (err) {
        console.error('Failed to fetch balance details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#f8f9fc] min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 flex items-center justify-between p-4 sticky top-0 z-30">
        <ChevronLeft className="w-6 h-6 text-gray-700 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-lg font-bold text-gray-900">余额详情</h2>
        <History className="w-6 h-6 text-gray-400 cursor-pointer" onClick={() => navigate('/transactions')} />
      </div>

      <div className="p-4 space-y-4">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-[#b71c1c] to-[#d32f2f] rounded-3xl p-6 text-white shadow-xl shadow-red-100">
          <div className="flex items-center space-x-2 opacity-80 mb-2">
            <Wallet className="w-4 h-4" />
            <span className="text-sm font-medium">账户余额 (元)</span>
          </div>
          <div className="text-4xl font-black mb-6">
            {balance.toFixed(2)}
          </div>
          <div className="flex items-center justify-between pt-4 border-t border-white/20">
            <div>
              <p className="text-white/70 text-xs mb-1">累计收益</p>
              <p className="text-lg font-bold">¥{totalEarnings.toFixed(2)}</p>
            </div>
            <button 
              onClick={() => navigate('/withdraw')}
              className="bg-white text-[#e53935] px-6 py-2 rounded-full text-sm font-bold shadow-sm active:scale-95 transition-transform"
            >
              申请提现
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
              <PieChart className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px]">本月收支</p>
              <p className="text-sm font-bold text-gray-800">统计明细</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-50 flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <p className="text-gray-400 text-[11px]">提现记录</p>
              <p className="text-sm font-bold text-gray-800">全部记录</p>
            </div>
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-gray-900 font-bold">收支记录</h3>
            <span className="text-xs text-gray-400">近30天</span>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-6 h-6 border-2 border-[#b71c1c] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : transactions.length > 0 ? (
            <div className="space-y-6">
              {transactions.map((t) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      t.type === 'recharge' ? 'bg-green-50 text-green-500' : 
                      t.type === 'withdraw' ? 'bg-red-50 text-red-500' :
                      'bg-orange-50 text-orange-500'
                    }`}>
                      {t.type === 'recharge' ? <ArrowDownLeft className="w-5 h-5" /> : 
                       t.type === 'withdraw' ? <ArrowUpRight className="w-5 h-5" /> :
                       <Landmark className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-800">{t.description}</p>
                      <p className="text-[11px] text-gray-400">{new Date(t.time).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className={`text-sm font-black ${
                    t.type === 'withdraw' ? 'text-gray-900' : 'text-green-600'
                  }`}>
                    {t.amount > 0 ? '+' : ''}{t.amount.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <History className="w-12 h-12 text-gray-100 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">暂无收支记录</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BalanceDetails;
