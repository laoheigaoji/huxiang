import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Headset, UserPlus, SlidersHorizontal, Trophy } from 'lucide-react';
import { motion } from 'motion/react';
import { api } from '../services/api';
import { Author, Prediction } from '../types';
import { Link } from 'react-router-dom';

const CountdownTimer = ({ unlockAt }: { unlockAt: string }) => {
  const [timeLeft, setTimeLeft] = useState({ h: '00', m: '00', s: '00' });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const update = () => {
      const diff = new Date(unlockAt).getTime() - new Date().getTime();
      if (diff <= 0) {
        setIsFinished(true);
        setTimeLeft({ h: '00', m: '00', s: '00' });
        return true;
      }
      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({
        h: h.toString().padStart(2, '0'),
        m: m.toString().padStart(2, '0'),
        s: s.toString().padStart(2, '0')
      });
      return false;
    };

    if (update()) return;
    const timer = setInterval(() => {
      if (update()) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [unlockAt]);

  if (isFinished) return <span className="text-[11px] text-green-500 font-black">已公开</span>;

  return (
    <div className="flex flex-col items-end">
      <span className="text-[11px] text-[#f44336] font-black mb-1">公开倒计时</span>
      <div className="flex space-x-0.5">
        {[timeLeft.h, timeLeft.m, timeLeft.s].map((p, idx) => (
          <React.Fragment key={idx}>
            <span className="bg-[#ef5350] text-white text-[11px] font-bold px-1.5 py-0.5 rounded-sm">{p}</span>
            {idx < 2 && <span className="text-[#f44336] text-[11px] font-bold self-center">:</span>}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const AuthorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [author, setAuthor] = useState<Author | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowed, setIsFollowed] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [authorData, allPredictions, profileData] = await Promise.all([
          api.getAuthorById(id!),
          api.getPredictions().catch(() => []),
          api.getProfile().catch(() => null)
        ]);
        setAuthor(authorData);
        // Sort items by time descending
        const predictionsArray = Array.isArray(allPredictions) ? allPredictions : [];
        const sorted = predictionsArray
          .filter(p => p.authorId === id)
          .sort((a, b) => new Date(b.time || '').getTime() - new Date(a.time || '').getTime());
        setPredictions(sorted);
        
        if (profileData && profileData.following) {
          setIsFollowed(profileData.following.includes(id!));
        }
      } catch (err) {
        console.error('Failed to fetch author data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const toggleFollow = async () => {
    if (!author) return;
    try {
      await api.followAuthor(author.id);
      setIsFollowed(!isFollowed);
      // Update local storage to keep sync
      const updatedProfile = await api.getProfile();
      localStorage.setItem('user', JSON.stringify(updatedProfile));
    } catch (err) {
      console.error('Toggle follow failed', err);
    }
  };

  if (loading || !author) return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-[#f0f7ff] min-h-screen">
      {/* Sky Background */}
      <div className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-[#b3e5fc] to-[#f0f7ff] -z-0"></div>

      {/* Header Nav */}
      <div className="relative z-10 flex items-center justify-between p-4 px-5 text-gray-800 pt-6">
        <ChevronLeft className="w-7 h-7 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[19px] font-bold">作者主页</h2>
        <Headset className="w-6 h-6 cursor-pointer" onClick={() => navigate('/feedback')} />
      </div>

      <div className="relative z-10 px-5 pt-2">
        {/* Author Info Card */}
        <div className="bg-white rounded-2xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <img src={author.avatar} alt={author.name} className="w-[68px] h-[68px] rounded-full object-cover shadow-sm border border-gray-50" />
              <div className="ml-4">
                <h3 className="text-[20px] font-black text-gray-900">{author.name}</h3>
                <div className="mt-1 flex items-center space-x-1">
                  <span className="text-[14px] font-bold text-orange-500">{author.fans}</span>
                  <span className="text-[13px] text-gray-400 font-medium">粉丝</span>
                </div>
              </div>
            </div>
            
            <button 
              onClick={toggleFollow}
              className={`h-[34px] px-4 rounded-full text-[14px] font-extrabold shadow-sm active:scale-95 transition-all flex items-center ${
                isFollowed 
                  ? 'bg-gray-100 text-gray-400 border border-gray-200' 
                  : 'bg-[#fff1f1] text-[#f44336] border border-[#ffe0e0]'
              }`}
            >
              {isFollowed ? '已关注' : '+关注'}
            </button>
          </div>

          {/* Record Circles */}
          {author.history && author.history.length > 0 ? (
            <div className="mt-6 flex space-x-2">
              {author.history.map((status, idx) => (
                <div 
                  key={idx} 
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold text-white shadow-sm ${
                    status === '红' ? 'bg-[#ef5350]' : 'bg-[#212121]'
                  }`}
                >
                  {status}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 flex items-center space-x-2">
              <div className="px-3 py-1 bg-gray-50 rounded-full text-[12px] text-gray-400 font-bold border border-gray-100 italic">
                新作者暂无历史记录
              </div>
            </div>
          )}
        </div>

        {/* Prediction Feed */}
        <div className="mt-6 space-y-4 pb-20">
          {predictions.length > 0 ? (
            predictions.map((prediction) => (
              <Link 
                key={prediction.id} 
                to={`/prediction/${prediction.id}`}
                className="block bg-white rounded-xl p-5 shadow-[0_4px_20px_rgb(0,0,0,0.02)] border border-gray-50 relative overflow-hidden active:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    <img src={author.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="ml-3">
                      <div className="text-[15px] font-bold text-gray-900">{author.name}</div>
                      <div className="flex items-center mt-0.5 space-x-1">
                        <span className="px-1.5 py-0.5 bg-[#fff5f5] text-[#f44336] text-[10px] font-black rounded-sm border border-[#ffe0e0]">
                          {author.recentRecord}
                        </span>
                        {author.streak > 0 && (
                          <span className="px-1.5 py-0.5 bg-[#f44336] text-white text-[10px] font-black rounded-sm flex items-center">
                            {author.streak}连红 <span className="ml-0.5 text-[8px] transform -translate-y-[1px]">👍</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!prediction.isUnlocked && prediction.unlockAt && new Date(prediction.unlockAt).getTime() > Date.now() ? (
                    <CountdownTimer unlockAt={prediction.unlockAt} />
                  ) : prediction.result ? (
                    <div className="absolute top-8 right-4 w-20 h-16 z-10 pointer-events-none select-none">
                      <img 
                        src={prediction.result === '红' ? 'https://wxqun988.vxjuejin.com/IMG_1034.PNG' : 'https://wxqun988.vxjuejin.com/IMG_1035.PNG'} 
                        className="w-full h-full object-contain opacity-90 rotate-[-12deg]" 
                        alt={prediction.result} 
                      />
                    </div>
                  ) : null}
                </div>

                <div className="mt-4">
                  <h5 className="text-[16px] font-bold leading-relaxed">
                    <span className="text-[#f44336]">【{prediction.period}】</span>
                    <span className="text-gray-800">{prediction.contentTitle}</span>
                  </h5>
                </div>

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex items-center space-x-3 text-[12px] text-gray-400 font-medium">
                    <span>{prediction.time}</span>
                    {prediction.tags && prediction.tags.map((tag, idx) => (
                      <span key={idx} className="bg-[#f0f7ff] text-[#40c4ff] px-2 py-0.5 rounded-sm text-[11px] font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center">
                    <div className="flex -space-x-1.5 mr-2">
                       {[1, 2, 3].map(j => (
                         <img 
                           key={j} 
                           className="w-5 h-5 rounded-full ring-2 ring-white" 
                           src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${j*prediction.id.length+100}`} 
                           alt=""
                         />
                       ))}
                    </div>
                    <span className="text-[12px] text-gray-400 font-medium">{prediction.viewCount}人查看</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-xl shadow-sm">
              <p>该作者暂无发布的方案</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AuthorProfile;
