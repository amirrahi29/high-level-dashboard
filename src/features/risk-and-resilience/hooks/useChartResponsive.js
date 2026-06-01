import React, { useEffect, useState } from 'react';

function useChartResponsive() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width < 576;
  const isTablet = width >= 576 && width < 992;
  const isSmall = width < 768;

  return {
    chartHeight: isMobile ? 200 : isTablet ? 230 : isSmall ? 240 : 260,
    chartMargin: isMobile
      ? { top: 12, right: 6, left: -6, bottom: 4 }
      : isSmall
      ? { top: 16, right: 10, left: -2, bottom: 4 }
      : { top: 18, right: 14, left: 2, bottom: 4 },
    yAxisWidth: isMobile ? 24 : 30,
    tickSize: isMobile ? 8 : 10,
    showLabels: !isMobile,
    xAxisAngle: isMobile ? -35 : 0,
    xAxisHeight: isMobile ? 50 : 30,
    dotSize: isMobile ? 3 : 4,
    activeDotSize: isMobile ? 5 : 6,
    strokeWidth: isMobile ? 2 : 2.5,
  };
}

export { useChartResponsive };
