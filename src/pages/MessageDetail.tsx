import React from 'react';
import { ChevronLeft, MoreHorizontal } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'motion/react';

const MessageDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // Mock data matching the screenshot content
  const message = {
    title: '关于防范冒充平台工作人员诈骗的郑重提醒',
    date: '2026-03-23 17:36:01',
    content: [
      '尊敬的用户：',
      '本平台客服人员不会以任何理由主动添加用户微信，亦不会通过微信、私信等非官方渠道，向用户作出“必中”“包中”等虚假承诺，更不会要求用户进行私下转账、汇款等操作。',
      '如您遇到冒充本平台工作人员，以添加微信、承诺中奖、指导投注、私下缴费等名义实施诱导行为的，请务必提高警惕，加强防范，切勿轻信陌生信息，切勿私下交易，以免造成个人财产损失。',
      '请广大用户提高安全意识，认准官方渠道，谨防各类诈骗，守护好自身财产安全。'
    ]
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="bg-[#d32f2f] min-h-screen"
    >
      {/* Header */}
      <div className="bg-white px-4 py-3 sticky top-0 z-30 flex items-center border-b border-gray-100">
        <ChevronLeft className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <div className="flex-1 text-center">
          <h1 className="text-[18px] font-bold text-gray-900 pr-6">消息详情</h1>
        </div>
      </div>

      <div className="p-4">
        {/* White Card */}
        <div className="bg-white rounded-xl p-6 min-h-[88vh] shadow-lg">
          <h2 className="text-[20px] font-black text-[#333333] text-center leading-[1.4] mb-3 px-2">
            {message.title}
          </h2>
          
          <div className="text-center mb-5">
            <span className="text-[13px] text-[#999999]">
              {message.date}
            </span>
          </div>

          <div className="h-[1px] bg-[#f0f0f0] w-full mb-6" />

          <div className="space-y-5">
            {message.content.map((paragraph, index) => (
              <p key={index} className="text-[#666666] text-[15px] leading-[1.7] text-justify">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default MessageDetail;
