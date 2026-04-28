import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';

const UserAgreement = () => {
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
        <h2 className="text-[18px] font-bold text-white">用户协议</h2>
      </div>

      <div className="p-4 text-gray-800 text-[15px] leading-relaxed">
        <h3 className="font-bold text-[18px] mb-4 text-center">用户服务协议</h3>
        <p className="mb-4">
          欢迎您访问智料汇享（以下简称本平台）。在您使用本平台服务前，请务必仔细阅读本协议。您访问或使用本平台即表示您同意受本协议的所有条款和条件的约束。
        </p>

        <h4 className="font-bold mt-4 mb-2">1. 协议的接受和修改</h4>
        <p className="mb-4">
          本平台有权随时修改本协议的任何条款，并在平台上予以公布，修改后的协议一旦在平台公布即刻生效，代替原来的协议。如您继续使用本平台服务，即视为您已接受修改后的协议。
        </p>

        <h4 className="font-bold mt-4 mb-2">2. 服务说明</h4>
        <p className="mb-4">
          本平台主要为用户提供相关的资讯和预测信息发布、浏览及购买功能。平台仅提供技术支持与信息展示，对用户发布的具体内容及预测准确性不作任何明示或暗示的保证。
        </p>

        <h4 className="font-bold mt-4 mb-2">3. 用户账号与安全</h4>
        <p className="mb-4">
          用户需提供真实、完整、准确的个人资料。若因资料不实引发的任何纠纷或责任由用户自行承担。用户应妥善保管自己的账号和密码，因保管不善导致账号被盗用的，本平台不承担任何责任。
        </p>

        <h4 className="font-bold mt-4 mb-2">4. 用户行为规范</h4>
        <p className="mb-4">
          用户不得利用本平台制作、复制、发布、传播含有违反国家法律法规、危害国家安全、破坏社会稳定、淫秽色情、暴力恐怖及其他违法违规内容的信息。
          对于违规用户，平台有权采取封号、冻结资金、配合相关部门调查等措施。
        </p>

        <h4 className="font-bold mt-4 mb-2">5. 免责声明</h4>
        <p className="mb-4">
          对于因不可抗力或不能控制的原因造成的网络服务中断及其他问题，本平台不承担任何责任，但将尽力减少因此给用户造成的损失。本平台不对用户预测信息的真实性、准确性和结果负责，用户依此进行的操作风险自担。
        </p>

        <h4 className="font-bold mt-4 mb-2">6. 法律适用与争议解决</h4>
        <p className="mb-4">
          本协议的解释及争议管辖均适用中华人民共和国大陆地区法律。如发生争议，双方应尽量友好协商解决；协商不成的，可向平台所在地有管辖权的人民法院提起诉讼。
        </p>
      </div>
    </motion.div>
  );
};

export default UserAgreement;
