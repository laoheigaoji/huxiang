import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -20 }} 
      className="bg-white min-h-screen"
    >
      <div className="bg-[#e53935] px-4 py-4 flex items-center justify-center relative shadow-sm sticky top-0 z-50">
        <ChevronLeft className="w-7 h-7 absolute left-4 text-white cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[18px] font-bold text-white">隐私协议</h2>
      </div>

      <div className="p-4 text-gray-800 text-[15px] leading-relaxed">
        <h3 className="font-bold text-[18px] mb-4 text-center">隐私权保护政策</h3>
        <p className="mb-4">
          本平台非常重视您的隐私。本隐私政策旨在说明本平台如何收集、使用、保护以及共享您的个人信息。
        </p>

        <h4 className="font-bold mt-4 mb-2">1. 信息收集</h4>
        <p className="mb-4">
          在您注册账号或使用平台服务时，为了向您提供更好的服务，我们会收集您主动提供的或因使用服务而产生的相关信息。这些信息可能包括您的手机号码、昵称、头像、交易记录及使用偏好等。
        </p>

        <h4 className="font-bold mt-4 mb-2">2. 信息使用</h4>
        <p className="mb-4">
          本平台收集的信息将主要用于以下场景：<br/>
          (1) 为您提供各项平台服务；<br/>
          (2) 处理您的订单与支付；<br/>
          (3) 改进我们的服务和产品功能；<br/>
          (4) 发送与服务相关的通知及客户支持；<br/>
          (5) 维护平台的安全与风控管理。
        </p>

        <h4 className="font-bold mt-4 mb-2">3. 信息共享与披露</h4>
        <p className="mb-4">
          我们将对您的个人信息严格保密。除非经过您的同意或根据法律法规要求、相关政府部门的强制性要求，我们不会向任何未关联的第三方共享或披露您的个人信息。
        </p>

        <h4 className="font-bold mt-4 mb-2">4. 信息安全保护</h4>
        <p className="mb-4">
          我们采用行业标准的物理、电子和管理措施来保护您的个人信息安全，防止您的信息遭到未经授权的访问、公开披露、使用、修改、损坏或丢失。
        </p>

        <h4 className="font-bold mt-4 mb-2">5. 未成年人的隐私保护</h4>
        <p className="mb-4">
          我们十分重视未成年人的个人信息保护。如果您是18周岁以下的未成年人，建议您在父母或监护人的指导下使用我们的服务。
        </p>

        <h4 className="font-bold mt-4 mb-2">6. 政策更新</h4>
        <p className="mb-4">
          本隐私政策可能会进行修订。如果发生重大变更，我们会在平台上发布通知。若您继续使用我们的服务，即表示您同意接收修订后的隐私政策的约束。
        </p>
      </div>
    </motion.div>
  );
};

export default PrivacyPolicy;
