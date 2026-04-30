import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { User, Lock, ChevronLeft, Eye, EyeOff, MessageCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';

const Login = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isWechat, setIsWechat] = useState(false);
  const [wechatBaseUrl, setWechatBaseUrl] = useState('');

  const APP_ID = 'wxf0ea7bb3386e9d01';

  useEffect(() => {
    // Detect WeChat environment
    const ua = window.navigator.userAgent.toLowerCase();
    const isWx = ua.indexOf('micromessenger') !== -1;
    setIsWechat(isWx);

    api.getConfig().then(data => data?.wechatProxyUrl && setWechatBaseUrl(data.wechatProxyUrl)).catch(console.error);

    let referrer = searchParams.get('ref');
    if (referrer) {
      localStorage.setItem('wechat_referrer', referrer);
    } else {
      referrer = localStorage.getItem('wechat_referrer');
    }

    // Handle wechat code in URL
    const code = searchParams.get('code');
    const nickname = searchParams.get('nickname');
    const avatar = searchParams.get('avatar') || searchParams.get('headimgurl');

    if (code) {
      handleWechatLogin(code, nickname || undefined, avatar || undefined, referrer || undefined);
    }
  }, [searchParams]);

  const handleWechatLogin = async (code: string, nickname?: string, avatar?: string, referrer?: string) => {
    setLoading(true);
    setError('');
    try {
      // In a real app, send the code to your backend to exchange for a token/user
      const data = await api.wechatLogin(code, nickname, avatar, referrer);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.removeItem('wechat_referrer');
      navigate('/');
    } catch (err: any) {
      setError(err.message || '微信登录失败');
    } finally {
      setLoading(false);
    }
  };

  const redirectToWechat = () => {
    const currentRef = searchParams.get('ref') || localStorage.getItem('wechat_referrer');
    const targetUrl = currentRef ? `${window.location.origin}/login?ref=${currentRef}` : `${window.location.origin}/login`;
    // Use configured proxy URL or fallback to the requested structure if config is missing
    const baseUrl = wechatBaseUrl || 'https://gzh1.vxjuejin.com/api';
    const wechatAuthUrl = `${baseUrl}?appid=${APP_ID}&redirect_uri=${encodeURIComponent(targetUrl)}&response_type=code&scope=snsapi_userinfo&state=STATE#wechat_redirect`;
    window.location.href = wechatAuthUrl;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await api.login(username, password);
      localStorage.setItem('user', JSON.stringify(data));
      navigate('/profile');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  const referrer = searchParams.get('ref');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen bg-white p-6"
    >
      <div className="mb-12">
        <button onClick={() => navigate('/')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
      </div>

      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">欢迎回来</h1>
        <p className="text-gray-500">请登录您的账户以继续</p>
      </div>

      {isWechat ? (
        <div className=" flex flex-col items-center justify-center space-y-6">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-12 h-12 text-white" />
          </div>
          <button
            onClick={redirectToWechat}
            disabled={loading}
            className="w-full bg-green-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-green-200 active:scale-[0.98] transition-all flex items-center justify-center space-x-2"
          >
            {loading ? '正在处理...' : (
              <>
                <MessageCircle className="w-5 h-5" />
                <span>微信一键登录</span>
              </>
            )}
          </button>
          
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg w-full">{error}</p>
          )}
          
          <p className="text-gray-400 text-sm mt-4">检测到您正在微信环境，推荐使用微信快捷登录</p>
        </div>
      ) : (
        <form onSubmit={handleLogin} className="space-y-6">
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
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50"
                placeholder="请输入用户名"
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
                className="block w-full pl-10 pr-10 py-3 border border-gray-200 rounded-xl focus:ring-red-500 focus:border-red-500 bg-gray-50"
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
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#e53935] text-white py-4 rounded-xl font-bold shadow-lg shadow-red-200 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {loading ? '正在登录...' : '登录'}
          </button>
        </form>
      )}

      {!isWechat && (
        <div className="mt-8 text-center space-y-4">
          <p className="text-gray-500">
            还没有账户?{' '}
            <Link to={`/register${referrer ? `?ref=${referrer}` : ''}`} className="text-[#e53935] font-bold">
              立即注册
            </Link>
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default Login;
