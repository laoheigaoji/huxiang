import React, { useState, useEffect } from 'react';

interface JumpingNumberProps {
  id: string;
  base: number;
  range?: number;
  interval?: number;
}

const JumpingNumber: React.FC<JumpingNumberProps> = ({ id, base, range = 5, interval = 3000 }) => {
  const [num, setNum] = useState(() => {
    if (typeof window === 'undefined') return base;
    const saved = sessionStorage.getItem(`jumping_num_${id}`);
    if (saved) {
      const parsed = parseInt(saved);
      return parsed > base ? parsed : base;
    }
    return base;
  });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setNum(prev => {
        const next = prev + Math.floor(Math.random() * range) + 1;
        sessionStorage.setItem(`jumping_num_${id}`, next.toString());
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [id, range, interval]);

  return <>{num}</>;
};

export default JumpingNumber;
