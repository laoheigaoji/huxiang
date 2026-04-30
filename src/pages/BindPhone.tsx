import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Smartphone } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

const BindPhone = () => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.updateProfile({ phone, password });
      // Update local storage
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        localStorage.setItem('user', JSON.stringify({ ...user, phone }));
      }
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || '绑定失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white min-h-screen">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="p-1">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="px-6 pt-10 text-center">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">绑定手机号并完善密码</h1>
        <p className="text-gray-400 mt-2 text-sm font-medium">请填写手机号、验证码和登录密码</p>
      </div>

      <form onSubmit={handleSubmit} className="px-6 mt-16 space-y-6">
        <div>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#d32f2f] focus:border-[#d32f2f] bg-gray-50 text-[15px] font-bold text-gray-800 placeholder:text-gray-400"
            placeholder="请输入手机号"
          />
        </div>

        <div className="flex space-x-2">
          <div className="flex-1">
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#d32f2f] focus:border-[#d32f2f] bg-gray-50 text-[15px] font-bold text-gray-800 placeholder:text-gray-400"
              placeholder="请输入短信验证码"
            />
          </div>
          <button 
            type="button" 
            className="w-24 bg-[#d32f2f] text-white font-bold rounded-xl text-[15px] active:scale-95 transition-transform"
          >
            获取验证码
          </button>
        </div>

        <div>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="block w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-[#d32f2f] focus:border-[#d32f2f] bg-gray-50 text-[15px] font-bold text-gray-800 placeholder:text-gray-400"
            placeholder="请输入登录密码"
          />
        </div>

        {error && <p className="text-[#d32f2f] text-sm text-center font-bold">{error}</p>}

        <div className="pt-10">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#d32f2f] text-white font-bold py-[14px] rounded-xl text-[17px] shadow-lg shadow-[#d32f2f]/10 active:scale-95 transition-transform disabled:opacity-70"
          >
            {loading ? '保存中...' : '确定'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default BindPhone;
