import { useEffect, useRef, useState } from 'react';

function useChartFrame(defaultHeight = 360) {
  const ref = useRef(null);
  const [frame, setFrame] = useState({ width: 0, height: defaultHeight });

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    const measure = () => {
      const rect = node.getBoundingClientRect();
      setFrame({
        width: Math.max(Math.floor(rect.width), 0),
        height: defaultHeight,
      });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    window.addEventListener('resize', measure);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [defaultHeight]);

  return [ref, frame];
}

export { useChartFrame };
