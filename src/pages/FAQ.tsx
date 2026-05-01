import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <FAQItemContent question={question} answer={answer} />
  </div>
);

const FAQItemContent = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`w-full mb-2 bg-[#f8fbff] rounded-xl overflow-hidden border border-blue-50 transition-all ${isOpen ? 'shadow-sm' : ''}`}>
      <div 
        className="py-3 px-4 flex items-center justify-between active:opacity-60 transition-opacity cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[14px] text-gray-800 font-bold leading-tight">{question}</span>
        <div className={`p-0.5 rounded-full bg-blue-50 ${isOpen ? 'rotate-180' : ''} transition-transform`}>
          <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-4 px-4 text-[13px] text-gray-600 leading-relaxed font-medium bg-white border-t border-blue-50/50 pt-2">
              {answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FAQ = () => {
  const navigate = useNavigate();

  const faqs = [
    {
      question: '如何加入粉丝？',
      answer: '进入作者主页，点击"关注"按钮即可成为该作者的粉丝，后续可在"我的关注"中查看。'
    },
    {
      question: '如何取消关注？',
      answer: '进入作者主页或"我的关注"列表，点击"已关注"按钮即可取消关注。'
    },
    {
      question: '何种情况会被封号？',
      answer: '违反平台规则的行为包括但不限于：发布违规内容、恶意刷单、欺诈用户、传播虚假信息等，将会被平台封禁账号。'
    },
    {
      question: '请问解锁文章内容，可以退换吗?',
      answer: '由于数字内容的特殊性，文章解锁后不支持退换，请在解锁前仔细核对。'
    },
    {
      question: '解锁的资料是一期的还是针对这个作者所有的材料?',
      answer: '解锁仅针对当前文章的单篇内容，如需查看该作者其他文章，需另外解锁。'
    },
    {
      question: '解锁资料可以保证必中吗?',
      answer: '所有分析观点仅供参考，不保证百分之百中奖，请理性参考。'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f0f7ff] min-h-[100dvh] pb-24 relative overflow-y-auto"
    >
      {/* Sky Background with Clouds Effect */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#b3e5fc] to-[#f0f7ff] -z-10">
        <div className="absolute top-10 left-10 w-32 h-12 bg-white/40 blur-2xl rounded-full"></div>
        <div className="absolute top-20 right-0 w-48 h-16 bg-white/30 blur-2xl rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-4 py-5 flex items-center relative z-10">
        <ChevronLeft className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-gray-900 text-center flex-1 pr-6">常见问题</h2>
      </div>

      {/* Mascot Robot (Refined position) */}
      <div className="flex justify-center -mt-6 mb-2 relative">
        <div className="w-48 h-32 relative flex items-center justify-center">
          {/* Blue Sphere Mascot with Headphones (Using a more accurate placeholder) */}
          <div className="relative group scale-75">
            {/* Blue Sphere */}
            <div className="w-24 h-24 bg-gradient-to-br from-[#80d8ff] to-[#40c4ff] rounded-full shadow-lg flex items-center justify-center relative border-4 border-white/50">
               {/* Eyes */}
               <div className="flex space-x-3 mt-1">
                 <div className="w-2.5 h-2.5 bg-blue-800 rounded-full"></div>
                 <div className="w-2.5 h-2.5 bg-blue-800 rounded-full"></div>
               </div>
               {/* Smile */}
               <div className="absolute bottom-6 w-8 h-3 border-b-2 border-blue-800 rounded-full"></div>
               
               {/* Translucent Headphones */}
               <div className="absolute -top-3 -left-4 -right-4 h-20 border-[10px] border-blue-300/60 rounded-full pointer-events-none"></div>
               <div className="absolute -left-6 top-1/2 -translate-y-1/2 w-8 h-10 bg-blue-400/80 rounded-lg border-2 border-white/30"></div>
               <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-8 h-10 bg-blue-400/80 rounded-lg border-2 border-white/30"></div>
            </div>
            
            {/* Glow / Clouds behind */}
            <div className="absolute inset-0 bg-blue-200/40 blur-3xl -z-10 rounded-full scale-150"></div>
          </div>
        </div>
      </div>

      {/* FAQ Card Container */}
      <div className="px-4 -mt-6 relative z-20">
        <div className="bg-white rounded-xl p-3 shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-white">
          <h3 className="text-[14px] font-black text-gray-800 mb-2 px-2">常见问题：</h3>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-6 left-0 right-0 px-4 z-50">
        <button className="w-full bg-[#e53935] text-white font-bold py-[12px] rounded-full text-base shadow-lg active:scale-95 transition-transform">
          点击联系在线客服
        </button>
      </div>

    </motion.div>
  );
};

export default FAQ;
