import React, { useState } from 'react';
import { ChevronLeft, X, MoreHorizontal, ChevronDown, Camera, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import * as qiniu from 'qiniu-js';

const Feedback = () => {
  const navigate = useNavigate();
  const [scenario, setScenario] = useState('');
  const [content, setContent] = useState('');
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Note: we'll use a simple generic mockup for scenario select and images
  const scenarios = ['功能建议', '遇到Bug', '账号问题', '支付问题', '其他'];
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      const { token, domain } = await api.getQiniuToken();
      const key = `feedback/${Date.now()}-${file.name}`;
      
      return new Promise<string>((resolve, reject) => {
        const observable = qiniu.upload(file, key, token);
        observable.subscribe({
          complete: (res) => resolve(`${domain}/${res.key}`),
          error: (err) => reject(err),
        });
      });
    } catch (err) {
      console.error('Qiniu upload failed:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!content) {
      alert('请填写改善方式/文字描述');
      return;
    }
    setSubmitting(true);
    try {
      await api.submitFeedback({ scenario, content, phone, images });
      alert('提交成功，感谢您的反馈！');
      navigate(-1);
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#f8fbff] min-h-[100dvh] pb-32 flex flex-col"
    >
      {/* Header */}
      <div className="px-6 py-4 flex items-center sticky top-0 bg-[#f8fbff] z-20">
        <ChevronLeft className="w-6 h-6 text-gray-800 cursor-pointer" onClick={() => navigate(-1)} />
        <h2 className="text-[17px] font-bold text-gray-900 text-center flex-1 pr-6">意见反馈</h2>
      </div>

      {/* Form Content */}
      <div className="px-6 space-y-5 flex-1 overflow-y-auto pb-24">
        
        {/* Scenario Selection */}
        <div className="space-y-1">
          <label className="text-[15px] font-bold text-gray-900 px-1">场景问题：</label>
          <div 
             onClick={() => setIsSelectorOpen(true)}
             className="bg-white rounded-xl h-12 px-4 flex items-center justify-between border border-blue-50 shadow-sm cursor-pointer"
          >
             <span className={`text-[14px] font-medium ${scenario ? 'text-gray-900' : 'text-[#cccccc]'}`}>
                {scenario || '请选择'}
             </span>
             <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
          </div>
        </div>

        {/* Bottom Sheet Selector */}
        <AnimatePresence>
          {isSelectorOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSelectorOpen(false)}
              />
              <motion.div 
                initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
                className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl z-[60] overflow-hidden pb-safe"
              >
                <div className="flex flex-col py-2">
                   {scenarios.map(s => (
                     <button 
                       key={s}
                       onClick={() => { setScenario(s); setIsSelectorOpen(false); }}
                       className="py-4 text-[16px] font-bold text-gray-800 border-b border-gray-50 last:border-0 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                     >
                       {s}
                     </button>
                   ))}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Image Upload */}
        <div className="space-y-3 pt-2">
          <label className="text-[15px] font-bold text-gray-900">请上传问题说明图片，最多6张：</label>
          <div className="flex flex-wrap gap-2">
            {images.map((img, i) => (
              <div key={i} className="w-[80px] h-[80px] bg-white rounded-lg border border-gray-200 overflow-hidden relative">
                <img src={img} className="w-full h-full object-cover" />
                <button onClick={() => setImages(imgs => imgs.filter((_, idx) => idx !== i))} className="absolute top-1 right-1 bg-black/50 p-1 rounded-full"><X className="w-3 h-3 text-white" /></button>
              </div>
            ))}
            {images.length < 6 && (
              <label className="w-[80px] h-[80px] bg-white rounded-lg border border-dashed border-gray-200 flex items-center justify-center active:bg-gray-50 cursor-pointer">
                <Camera className="w-6 h-6 text-gray-300" strokeWidth={1.5} />
                <input type="file" className="hidden" accept="image/*" onChange={async (e) => {
                  if (e.target.files && e.target.files[0]) {
                    try {
                      const url = await handleUpload(e.target.files[0]);
                      setImages([...images, url]);
                    } catch (err) {
                      alert('图片上传失败');
                    }
                  }
                }} />
              </label>
            )}
          </div>
        </div>

        {/* Improvement Description */}
        <div className="space-y-2 pt-2">
          <label className="text-[15px] font-bold text-gray-900">改善方式：</label>
          <div className="bg-white rounded-xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
            <textarea 
              placeholder="请输入文字描述" 
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-24 p-4 text-[14px] font-medium focus:outline-none placeholder:text-[#cccccc] resize-none"
            ></textarea>
          </div>
        </div>

        {/* Contact Phone */}
        <div className="space-y-2 pt-2 pb-4">
          <label className="text-[15px] font-bold text-gray-900">联系电话：</label>
          <div className="bg-white rounded-xl h-12 px-4 flex items-center shadow-[0_2px_12px_rgba(0,0,0,0.03)] border border-gray-100">
            <input 
              type="tel" 
              placeholder="请输入联系电话" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-transparent text-[14px] font-medium focus:outline-none placeholder:text-[#cccccc]" 
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-4 left-0 right-0 px-6 z-30">
        <button 
          disabled={submitting}
          onClick={handleSubmit}
          className="w-full bg-[#ef5350] text-white font-bold py-[12px] rounded-full text-base shadow-lg shadow-red-100 active:scale-95 transition-transform disabled:opacity-50"
        >
          {submitting ? '提交中...' : '提交'}
        </button>
      </div>

    </motion.div>
  );
};

export default Feedback;
