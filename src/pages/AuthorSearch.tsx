import React, { useState, useEffect } from 'react';
import { ChevronLeft, X, MoreHorizontal, Search, UserPlus, Check } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { Author, User } from '../types';

const AuthorSearch = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorsData, profileData] = await Promise.all([
          api.getAuthors(),
          api.getProfile().catch(() => null)
        ]);
        setAuthors(authorsData);
        setUser(profileData);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleFollow = async (e: React.MouseEvent, authorId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.followAuthor(authorId);
      const updatedUser = await api.getProfile();
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (err) {
      alert(err instanceof Error ? err.message : '关注失败');
    }
  };

  const isTransferCodeQuery = query.trim() === '转卡码';
  const filteredAuthors = query.trim() === '' 
    ? [] 
    : authors.filter(a => 
        a.name.toLowerCase().includes(query.toLowerCase()) || 
        a.id.toLowerCase().includes(query.toLowerCase())
      );

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f8f8f8] min-h-screen"
    >
      {/* App Header */}
      <div className="bg-[#e53935] px-4 py-4 flex items-center justify-center relative shadow-sm">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">商家列表</h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="bg-white rounded-full flex items-center h-10 px-4 shadow-sm">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input 
            type="text" 
            placeholder="搜索商家名称" 
            className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-gray-300 font-bold"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query && (
            <X 
              className="w-4 h-4 text-gray-300 mr-2 cursor-pointer" 
              onClick={() => setQuery('')}
            />
          )}
        </div>
      </div>

      {/* Search Results */}
      <div className="px-4 space-y-3 pb-20">
        <AnimatePresence>
          {isTransferCodeQuery ? (
             <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center border border-gray-100 cursor-pointer"
              onClick={() => navigate('/transfer-code-generator')}
            >
              <div className="flex flex-1 items-center overflow-hidden mr-2">
                 <div className="w-12 h-12 rounded-full mr-3 border-2 border-red-50 flex items-center justify-center bg-gray-100 text-[#b71c1c] font-bold">码</div>
                 <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900">转卡码生成器</h3>
                 </div>
              </div>
            </motion.div>
          ) : (
            filteredAuthors.map((author) => (
            <motion.div
              key={author.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white p-4 rounded-xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center border border-gray-100"
            >
              <div className="flex flex-1 items-center overflow-hidden mr-2">
                <div onClick={() => navigate(`/author/${author.id}`)} className="flex items-center flex-1 min-w-0 cursor-pointer">
                  <img 
                    src={author.avatar} 
                    alt={author.name} 
                    className="w-12 h-12 rounded-full mr-3 border-2 border-red-50 object-cover flex-shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-0.5">
                      <h3 className="font-bold text-gray-900 truncate mr-1.5">{author.name}</h3>
                      {author.isHot && (
                        <span className="bg-orange-50 text-orange-500 text-[10px] px-1 rounded font-black">精品</span>
                      )}
                    </div>
                    <div className="flex items-center text-[11px] text-gray-400 font-bold space-x-2">
                      <span>粉丝 {author.fans}</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span className="text-[#b71c1c]">{author.recentRecord}</span>
                    </div>
                  </div>
                </div>
              </div>

              <button 
                type="button"
                onClick={(e) => handleFollow(e, author.id)}
                className={`relative z-10 px-4 py-1.5 rounded-full text-xs font-black transition-all active:scale-95 flex items-center flex-shrink-0 ${
                  user?.following?.includes(author.id)
                    ? 'bg-gray-100 text-gray-400'
                    : 'bg-[#b71c1c] text-white shadow-lg shadow-red-100'
                }`}
              >
                {user?.following?.includes(author.id) ? (
                  <>
                    <Check className="w-3 h-3 mr-1" strokeWidth={4} />
                    <span>已关注</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-3 h-3 mr-1" strokeWidth={4} />
                    <span>关注</span>
                  </>
                )}
              </button>
            </motion.div>
          )))}
        </AnimatePresence>

        {query.trim() === '' ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm bg-gradient-to-br from-gray-50 to-white overflow-hidden">
              <Search className="w-6 h-6 text-gray-200" />
            </div>
            <p className="text-[14px] text-gray-300 font-bold">请输入搜索商家关键字</p>
          </div>
        ) : filteredAuthors.length === 0 ? (
          <div className="flex flex-col items-center justify-center pt-20">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm bg-gradient-to-br from-gray-50 to-white overflow-hidden">
              <X className="w-6 h-6 text-gray-200" />
            </div>
            <p className="text-[14px] text-gray-300 font-bold">未找到相关商家</p>
          </div>
        ) : null}
      </div>

    </motion.div>
  );
};

export default AuthorSearch;
