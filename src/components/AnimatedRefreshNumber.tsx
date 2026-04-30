import React, { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

interface Props {
  id: string;
  base: number;
  refreshTrigger?: number;
}

const AnimatedRefreshNumber: React.FC<Props> = ({ id, base, refreshTrigger = 0 }) => {
  const [target, setTarget] = useState(() => {
    if (typeof window === 'undefined') return base;
    const saved = sessionStorage.getItem(`anim_num_${id}`);
    if (saved) {
      const parsed = parseInt(saved);
      return parsed > base ? parsed : base;
    }
    return base;
  });

  useEffect(() => {
    if (refreshTrigger > 0) {
      setTarget(prev => {
        const next = prev + Math.floor(Math.random() * 5) + 1;
        sessionStorage.setItem(`anim_num_${id}`, next.toString());
        return next;
      });
    }
  }, [refreshTrigger, id]);

  const count = useMotionValue(target);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, target, { duration: 1, type: "spring" });
    return animation.stop;
  }, [target, count]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedRefreshNumber;
