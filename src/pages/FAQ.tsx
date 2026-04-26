import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const FAQItem = ({ question, answer, key }: { question: string, answer: string, key?: React.Key }) => (
  <div className="border-b border-gray-100 last:border-b-0">
    <FAQItemContent question={question} answer={answer} />
  </div>
);

const FAQItemContent = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <div 
        className="py-5 px-2 flex items-center justify-between active:opacity-60 transition-opacity cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center flex-1 pr-4">
          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full mr-3 shrink-0"></div>
          <span className="text-[15px] text-gray-700 font-medium leading-tight">{question}</span>
        </div>
        <ChevronDown className={`w-5 h-5 text-gray-300 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pb-5 px-6 text-[14px] text-gray-500 leading-relaxed">
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
      question: '请问解锁文章内容,可以退换吗?',
      answer: '由于数字内容的特殊性，文章解锁后不支持退换，请在解锁前仔细核对。'
    },
    {
      question: '解锁的资料是一期的还是针对这个作者所有的材料',
      answer: '解锁仅针对当前文章的单篇内容，如需查看该作者其他文章，需另外解锁。'
    },
    {
      question: '解锁资料可以保证必中吗?',
      answer: '所有分析观点仅供参考，不保证百分之百中奖，请理性参考。'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      className="bg-[#f2f9ff] min-h-screen pb-32"
    >
      {/* System Browser Header */}
      <div className="bg-white px-4 pt-10 pb-2 flex items-center justify-between border-b border-gray-50">
        <X className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="text-center">
          <h1 className="text-[17px] font-bold text-gray-900 leading-tight">常见问题</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">a0275.com.cn</p>
        </div>
        <MoreHorizontal className="w-6 h-6 text-gray-800 cursor-pointer" />
      </div>

      {/* Hero Section with Mascot */}
      <div className="relative bg-gradient-to-b from-[#e3f2fd] to-[#f2f9ff] h-40 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="px-4 py-4 flex items-center relative z-10">
          <ChevronLeft className="w-7 h-7 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
          <h2 className="ml-24 text-[18px] font-bold text-gray-900 text-center flex-1 mr-4">常见问题</h2>
        </div>
        
        {/* Mascot Robot Image Placeholder (Matching feedback mascot) */}
        <div className="absolute right-0 bottom-0 w-48 h-32 flex items-end justify-end pointer-events-none translate-y-4">
           <div className="relative">
              <div className="w-32 h-32 bg-blue-200/50 rounded-full flex items-center justify-center filter blur-xl absolute -bottom-10 -right-10"></div>
              <img 
                src="https://img.icons8.com/color/240/robot-tapi.png" 
                alt="mascot" 
                className="w-32 h-32 object-contain relative z-10 opacity-80" 
              />
           </div>
        </div>
      </div>

      {/* FAQ Card Container */}
      <div className="px-5 -mt-4 relative z-20">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-50">
          <h3 className="text-[17px] font-bold text-blue-600 mb-2">常见问题：</h3>
          <div className="bg-gray-100/30 h-[1px] w-full mb-1"></div>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-10 left-0 right-0 px-8 z-50">
        <button className="w-full bg-[#e53935] text-white font-bold py-4 rounded-full text-lg shadow-xl shadow-red-100 active:scale-95 transition-transform">
          点击联系在线客服
        </button>
      </div>

      {/* Bottom Browser Navigation Mockup */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#f8f8f8] flex items-center justify-around z-50 border-t border-gray-200 px-24">
         <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         <div className="rotate-180">
            <ChevronLeft strokeWidth={1.5} className="w-6 h-6 text-gray-400" />
         </div>
      </div>
    </motion.div>
  );
};

export default FAQ;
