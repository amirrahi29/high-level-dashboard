import React, { useEffect, useState } from 'react';

import { MetricCard, MonthlyMetricsCards } from './MetricCards.js';
import { TrendingCharts } from './Charts.js';

function DashboardContent({ data }) {
  const { header, colors, metricsSection, metricCards, readinessCards, charts, footer } = data;

  return (
    <div className="pr-root">
      <div className="pr-shell">
        <header className="pr-header-banner">
          <div className="pr-content-inner">
            <div className="pr-header">
              <div className="pr-header-left">
                <h1>{header.title}</h1>
                <p>{header.subtitle}</p>
              </div>
            </div>
          </div>
        </header>

        <div className="pr-body">
          <section className="pr-metrics-section">
            <div className="pr-content-inner">
              <div className="pr-metrics-heading">
                <div className="pr-metrics-heading-left">
                  <h2>{metricsSection.title}</h2>
                </div>
              </div>

              <ReadinessThresholdCards cards={readinessCards} />
              <MonthlyMetricsCards cards={metricCards} />
            </div>
          </section>

          <TrendingCharts charts={charts} colors={colors} />
        </div>

        <footer className="pr-footer">
          <div className="pr-content-inner">
            <div className="pr-footer-note">
              <span>{footer.note}</span>
              <span className="pr-footer-badge">
                <span style={{ width: 14, height: 3, background: colors.goalLine, borderRadius: 2 }} />
                {footer.goalLabel}
              </span>
              <span className="pr-footer-badge">
                <span style={{ width: 14, height: 3, background: colors.fy26Line, borderRadius: 2 }} />
                {footer.currentLabel}
              </span>
            </div>
            <div className="pr-logo">{footer.brand}</div>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default DashboardContent;
