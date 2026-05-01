import React, { useState, useEffect } from 'react';

interface JumpingNumberProps {
  id: string;
  base: number;
  range?: number;
  interval?: number;
  allowDecrease?: boolean;
}

const JumpingNumber: React.FC<JumpingNumberProps> = ({ id, base, range = 5, interval = 3000, allowDecrease = false }) => {
  const [num, setNum] = useState(() => {
    if (typeof window === 'undefined') return base;
    const saved = sessionStorage.getItem(`jumping_num_${id}`);
    if (saved) {
      return parseInt(saved);
    }
    return base;
  });
  
  useEffect(() => {
    // initialize if base changes
    if (!sessionStorage.getItem(`jumping_num_base_${id}`)) {
       sessionStorage.setItem(`jumping_num_base_${id}`, (base || 0).toString());
    }
    
    const timer = setInterval(() => {
      setNum(prev => {
        const initialBase = parseInt(sessionStorage.getItem(`jumping_num_base_${id}`) || (base || 0).toString());
        
        let next;
        
        if (allowDecrease) {
            // randomly -range to +range
            const change = Math.floor(Math.random() * (range * 2)) - range;
            next = prev + change;
            
            // ensure it doesn't deviate too far from base (e.g. max 3 * range)
            if (next > initialBase + range * 3) {
                next = prev - Math.abs(change);
            } else if (next < initialBase - range * 3) {
                next = prev + Math.abs(change);
            }
        } else {
            // Only increase
            next = prev + Math.floor(Math.random() * range) + 1;
        }
        
        // Prevent negative
        if (next < 0) next = 0;
        
        sessionStorage.setItem(`jumping_num_${id}`, (next || 0).toString());
        return next;
      });
    }, interval);
    return () => clearInterval(timer);
  }, [id, range, interval, base, allowDecrease]);

  return <>{num}</>;
};

export default JumpingNumber;
