import React, { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Lock, ChevronLeft, Eye, EyeOff, Smile, Users } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [referrer, setReferrer] = useState(searchParams.get('ref') || '');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWechat, setIsWechat] = useState(false);

  React.useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const wechat = ua.indexOf('micromessenger') !== -1;
    setIsWechat(wechat);
  }, []);

  const startWechatLogin = async () => {
    try {
      const config = await api.getConfig();
      const referrer = searchParams.get('ref');
      const redirectUri = encodeURIComponent(window.location.origin + '/login' + (referrer ? `?ref=${referrer}` : ''));
      
      let url = '';
      if (config.wechatAuthUrl) {
          url = config.wechatAuthUrl.replace('[REDIRECT_URI]', redirectUri);
          if (!url.includes(redirectUri) && !config.wechatAuthUrl.includes('[REDIRECT_URI]')) {
              url = config.wechatAuthUrl + (config.wechatAuthUrl.includes('?') ? '&' : '?') + `redirect_uri=${redirectUri}`;
          }
      } else {
          const appId = config.wechatAppId || 'wxf0ea7bb3386e9d01';
          url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${appId}&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
      }
      
      window.location.href = url;
    } catch (err) {
      console.error('Failed to start WeChat login:', err);
      // Fallback
      const redirectUri = encodeURIComponent(window.location.origin + '/login' + (searchParams.get('ref') ? `?ref=${searchParams.get('ref')}` : ''));
      const url = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxf0ea7bb3386e9d01&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
      window.location.href = url;
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const newUser = await api.register(username, password, nickname, referrer || undefined);
      localStorage.setItem('user', JSON.stringify(newUser));
      navigate('/');
    } catch (err: any) {
      setError(err.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen bg-white p-6"
    >
      <div className="mb-12">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">开通账户</h1>
        <p className="text-gray-500">加入我们，获取更多精彩预测</p>
      </div>

      {!isWechat ? (
        <form onSubmit={handleRegister} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">用户名</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[#b71c1c] focus:border-[#b71c1c] bg-gray-50"
                placeholder="限3-20位英文字母或数字"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">昵称</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Smile className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-[#b71c1c] focus:border-[#b71c1c] bg-gray-50"
                placeholder="您的公开名称"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-[#b71c1c] focus:border-[#b71c1c] bg-gray-50"
                placeholder="请输入密码"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-[#b71c1c] text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#b71c1c] text-white py-4 rounded-xl font-bold shadow-lg shadow-[#b71c1c]/10 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? '正在注册...' : '立即注册'}
          </button>
        </form>
      ) : (
        <div className="space-y-6">
          {error && (
            <p className="text-[#b71c1c] text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
          )}
          
          <button
            onClick={startWechatLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#07c160] text-white py-5 rounded-2xl font-bold shadow-xl shadow-[#07c160]/20 active:scale-[0.98] transition-all disabled:opacity-50 text-lg"
          >
            <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
              <path d="M8.309 3c-4.57 0-8.309 3.256-8.309 7.273 0 2.273 1.258 4.309 3.221 5.674l-.821 2.395 2.872-1.439c.64.182 1.32.273 2.036.273.197 0 .394-.015.586-.039-.364-.788-.574-1.65-.574-2.564 0-3.321 3.012-6.014 6.726-6.014 1.157 0 2.235.265 3.167.728-.521-3.418-4.045-6.087-8.204-6.087zm3.111 2.455c.421 0 .764.343.764.764 0 .421-.343.764-.764.764s-.764-.343-.764-.764c0-.421.343-.764.764-.764zm-6.111 0c.421 0 .764.343.764.764 0 .421-.343.764-.764.764s-.764-.343-.764-.764c0-.421.343-.764.764-.764zM16.142 9.545c-3.14 0-5.711 2.213-5.711 4.942 0 1.543.812 2.923 2.083 3.864l-.532 1.637 1.86-.982c.453.153.943.238 1.455.238 3.14 0 5.711-2.213 5.711-4.942s-2.571-4.957-5.711-4.957zm-2.143 1.91c.287 0 .52.233.52.52s-.233.52-.52.52-.52-.233-.52-.52.233-.52.52-.52zm4.286 0c.287 0 .52.233.52.52s-.233.52-.52.52-.52-.233-.52-.52.233-.52.52-.52z" />
            </svg>
            微信一键登录/注册
          </button>
          
          <p className="text-center text-gray-400 text-xs px-10">
            微信环境下推荐使用静默授权登录，快速且安全
          </p>
        </div>
      )}

      {!isWechat && (
        <div className="mt-8 text-center">
          <p className="text-gray-500">
            已有账户?{' '}
            <Link to="/login" className="text-[#b71c1c] font-bold">
              立即登录
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Register;
