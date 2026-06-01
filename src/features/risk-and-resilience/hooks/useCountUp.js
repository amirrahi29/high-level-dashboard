import React, { useState } from 'react';

const useCountUp = (target, duration = 1200, decimals = 0) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let frame;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
};

export { useCountUp };
