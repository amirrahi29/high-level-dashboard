import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

function getChartViewportWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : 1200;
}

function useResponsiveChart() {
  const [width, setWidth] = useState(getChartViewportWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width <= 480;
  const isTablet = width <= 768;
  const isSmall = width <= 1024;

  return {
    width,
    isMobile,
    isTablet,
    isSmall,
    tick: isMobile ? 9 : isTablet ? 10 : 11,
    tickSmall: isMobile ? 8 : isTablet ? 9 : 10,
    yAxisWidth: isMobile ? 48 : isTablet ? 60 : 76,
    barYAxisWidth: isMobile ? 56 : isTablet ? 72 : 88,
    barSize: isMobile ? 7 : isTablet ? 9 : 12,
    pieRadius: isMobile ? 52 : isTablet ? 72 : 90,
    chartMargin: isMobile
      ? { top: 6, right: 8, left: 2, bottom: 0 }
      : isTablet
        ? { top: 8, right: 12, left: 4, bottom: 2 }
        : { top: 10, right: 16, left: 6, bottom: 4 },
    axisMargin: isMobile
      ? { top: 6, right: 10, left: 4, bottom: 2 }
      : { top: 8, right: 16, left: 6, bottom: 4 },
    xAxisHeight: isMobile ? 46 : isTablet ? 36 : 30,
    legendProps: isMobile
      ? { verticalAlign: 'bottom', align: 'center', wrapperStyle: { fontSize: 10, paddingTop: 6, lineHeight: 1.3 } }
      : { verticalAlign: 'bottom', align: 'left', wrapperStyle: { fontSize: 11, paddingTop: 8, lineHeight: 1.35 } },
    showDualAxis: !isMobile,
  };
}

export { useResponsiveChart, getChartViewportWidth };
