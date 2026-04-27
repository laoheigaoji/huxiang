import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Plus, MoreVertical, 
  Eye, Calendar, Trash2, Edit3, 
  Filter, Search, AlertCircle
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Prediction } from '../types';

const AuthorDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, free, paid
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.getProfile();
        if (!userData.isAuthor) {
          navigate('/profile');
          return;
        }
        setUser(userData);
        const preds = await api.getAuthorPredictions(userData.authorId);
        setPredictions(preds);
      } catch (err) {
        console.error('Failed to fetch author dashboard data', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [navigate]);

  const handleDelete = async (id: string) => {
    try {
      await api.deleteAuthorPrediction(id);
      setPredictions(prev => prev.filter(p => p.id !== id));
      setShowDeleteConfirm(null);
    } catch (err) {
      alert('删除失败');
    }
  };

  const filteredPredictions = predictions.filter(p => {
    if (filter === 'free') return p.isFree;
    if (filter === 'paid') return !p.isFree;
    return true;
  });

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="bg-gray-50 min-h-screen pb-24"
    >
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center sticky top-0 z-40 border-b border-gray-100">
        <button onClick={() => navigate('/profile')} className="p-2 -ml-2">
          <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="flex-1 text-center text-lg font-bold text-gray-900">文章管理</h1>
        <Link to="/publish" className="p-2">
          <Plus className="w-6 h-6 text-red-500" />
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-6 text-white shadow-xl shadow-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">总收益 (金币)</p>
              <h2 className="text-3xl font-black mt-1">¥ {(user?.totalEarnings || 0).toFixed(2)}</h2>
            </div>
            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold">文章总数</p>
              <p className="text-lg font-bold">{predictions.length}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold">累计粉丝</p>
              <p className="text-lg font-bold">{user?.fans || 0}</p>
            </div>
            <div>
              <p className="text-white/40 text-[10px] uppercase font-bold">活跃度</p>
              <p className="text-lg font-bold">99%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-4 mb-4">
        <div className="bg-white p-1 rounded-xl flex">
          {[
            { id: 'all', label: '全部' },
            { id: 'free', label: '免费' },
            { id: 'paid', label: '付费' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                filter === tab.id ? 'bg-red-500 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="px-4 space-y-4">
        {filteredPredictions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-dashed border-gray-200">
            <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">暂无文章方案</p>
            <Link to="/publish" className="mt-4 inline-block text-red-500 font-bold text-sm">去发布第一篇</Link>
          </div>
        ) : (
          filteredPredictions.map((pred) => (
            <div key={pred.id} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center">
              <div className="flex-1 min-w-0 pr-4">
                <div className="flex items-center space-x-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    pred.isFree ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                  }`}>
                    {pred.isFree ? '免费' : `¥ ${pred.price}`}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${
                    pred.isUnlocked ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {pred.isUnlocked ? '已公开' : '锁定中'}
                  </span>
                  <span className="text-[10px] text-gray-400 font-medium">{pred.time}</span>
                </div>
                <h3 className="font-bold text-gray-800 truncate leading-snug">{pred.title}</h3>
                <div className="flex items-center space-x-3 mt-2">
                  <div className="flex items-center text-[10px] text-gray-400">
                    <Eye className="w-3 h-3 mr-1" />
                    <span>{pred.viewCount || 0} 阅读</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => navigate(`/publish?edit=${pred.id}`)}
                  className="p-2 text-gray-400 active:text-blue-500 transition-colors"
                >
                  <Edit3 className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setShowDeleteConfirm(pred.id)}
                  className="p-2 text-gray-400 active:text-red-500 transition-colors"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowDeleteConfirm(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">确认删除？</h3>
              <p className="text-gray-500 text-sm mb-8">文章删除后将无法恢复，相关数据也将被清除。</p>
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(null)}
                  className="flex-1 py-3.5 rounded-xl bg-gray-100 text-gray-600 font-bold active:scale-[0.98] transition-all"
                >
                  取消
                </button>
                <button 
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="flex-1 py-3.5 rounded-xl bg-red-500 text-white font-bold active:scale-[0.98] transition-all"
                >
                  确认删除
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AuthorDashboard;
