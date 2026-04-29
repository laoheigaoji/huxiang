import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Info, Calendar, Smartphone, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

const RealNameAuth = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    realName: '',
    idCard: '',
    phone: '',
    code: '',
    isLongTerm: false,
    startDate: '',
    endDate: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const userId = userStr ? JSON.parse(userStr).id : null;
      await api.updateProfile({
        ...formData,
        isRealNameVerified: true
      });
      // Optionally update local storage
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, isRealNameVerified: true }));
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || '认证失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900 mr-8">实名认证</h1>
      </div>

      {/* Notice Banner */}
      <div className="bg-orange-50 px-4 py-3 flex items-start space-x-2">
        <Info className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-600 leading-relaxed">
          实名认证是享受平台政治服务的前提，更多专属特权等你解锁。
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">身份证姓名 <span className="text-[#b71c1c]">*</span></label>
          <input
            type="text"
            required
            value={formData.realName}
            onChange={(e) => setFormData({ ...formData, realName: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c]"
            placeholder="请输入身份证姓名"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">身份证号码 <span className="text-[#b71c1c]">*</span></label>
          <input
            type="text"
            required
            value={formData.idCard}
            onChange={(e) => setFormData({ ...formData, idCard: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c]"
            placeholder="请输入身份证号码"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">手机号 <span className="text-[#b71c1c]">*</span></label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c]"
            placeholder="请输入手机号"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">短信验证码 <span className="text-[#b71c1c]">*</span></label>
          <div className="flex space-x-3">
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="flex-1 bg-gray-50 border border-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c]"
              placeholder="请输入验证码"
            />
            <button type="button" className="bg-[#b71c1c] text-white px-6 py-3 rounded-lg text-sm font-bold active:scale-95 transition-transform">
              获取验证码
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-4">身份证是否长期 <span className="text-[#b71c1c]">*</span></label>
          <div className="flex space-x-8">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={!formData.isLongTerm} 
                onChange={() => setFormData({...formData, isLongTerm: false})}
                className="w-5 h-5 text-[#b71c1c] focus:ring-[#b71c1c] border-gray-300"
              />
              <span className="text-sm font-bold text-gray-700">否</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                checked={formData.isLongTerm} 
                onChange={() => setFormData({...formData, isLongTerm: true})}
                className="w-5 h-5 text-[#b71c1c] focus:ring-[#b71c1c] border-gray-300"
              />
              <span className="text-sm font-bold text-gray-700">是</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">身份证有效开始日期 <span className="text-[#b71c1c]">*</span></label>
            <div className="relative">
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c] appearance-none"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">身份证有效结束日期 <span className="text-[#b71c1c]">*</span></label>
            <div className="relative">
              <input
                type="date"
                required={!formData.isLongTerm}
                disabled={formData.isLongTerm}
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full bg-gray-50 border border-gray-100 rounded-lg pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-[#b71c1c] appearance-none disabled:opacity-50"
              />
              <Calendar className="w-5 h-5 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="bg-orange-50/50 p-4 rounded-xl flex items-start space-x-3">
          <ShieldCheck className="w-5 h-5 text-[#b71c1c] shrink-0 mt-0.5" />
          <p className="text-[11px] text-orange-600 leading-relaxed font-medium">
            我们将严格保密您的身份信息，仅用于实名认证，请确保填写的信息真实准确，否则将影响功能使用。
          </p>
        </div>

        {error && <p className="text-[#b71c1c] text-sm text-center font-bold">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#b71c1c] text-white font-bold py-4 rounded-full text-lg shadow-lg active:scale-[0.98] transition-all disabled:bg-gray-400"
        >
          {loading ? '提交中...' : '提交认证'}
        </button>
      </form>
    </motion.div>
  );
};

export default RealNameAuth;
