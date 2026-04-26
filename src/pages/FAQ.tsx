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
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f0f7ff] min-h-screen pb-12 relative overflow-hidden"
    >
      {/* Sky Background with Clouds Effect */}
      <div className="absolute top-0 left-0 right-0 h-80 bg-gradient-to-b from-[#b3e5fc] to-[#f0f7ff] -z-10">
        <div className="absolute top-10 left-10 w-32 h-12 bg-white/40 blur-2xl rounded-full"></div>
        <div className="absolute top-20 right-0 w-48 h-16 bg-white/30 blur-2xl rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-4 py-8 flex items-center relative z-10">
        <ChevronLeft className="w-7 h-7 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[20px] font-bold text-gray-900 text-center flex-1 pr-6">常见问题</h2>
      </div>

      {/* Mascot Robot (Refined position) */}
      <div className="flex justify-center -mt-4 mb-4 relative">
        <div className="w-56 h-40 relative flex items-center justify-center">
          {/* Blue Sphere Mascot with Headphones (Using a more accurate placeholder) */}
          <div className="relative group">
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
      <div className="px-4 -mt-2 relative z-20">
        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white">
          <h3 className="text-[17px] font-bold text-[#3f51b5] mb-4">常见问题：</h3>
          
          <div className="space-y-0">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Action Button */}
      <div className="fixed bottom-10 left-0 right-0 px-6 z-50">
        <button className="w-full bg-[#e53935] text-white font-bold py-[15px] rounded-full text-lg shadow-xl shadow-red-200 active:scale-95 transition-transform">
          点击联系在线客服
        </button>
      </div>

    </motion.div>
  );
};

export default FAQ;
