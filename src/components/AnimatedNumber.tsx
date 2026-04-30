import React, { useEffect } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';

const AnimatedNumber = ({ value }: { value: number }) => {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, value, { duration: 1, type: "spring" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
};

export default AnimatedNumber;
