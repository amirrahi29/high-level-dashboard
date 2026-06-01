import React, { useEffect, useState } from 'react';

import { useCountUp } from '../hooks/useCountUp.js';

const svgProps = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function MetricIcon({ type }) {
  switch (type) {
    case 'shield':
      return (
        <svg {...svgProps}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      );
    case 'alert':
      return (
        <svg {...svgProps}>
          <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case 'change':
      return (
        <svg {...svgProps}>
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path d="M16 16h5v5" />
        </svg>
      );
    case 'detect':
      return (
        <svg {...svgProps}>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
          <path d="M11 8v6" />
          <path d="M8 11h6" />
        </svg>
      );
    case 'engage':
      return (
        <svg {...svgProps}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case 'resolve':
      return (
        <svg {...svgProps}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    case 'compliance':
      return (
        <svg {...svgProps}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case 'incidents':
      return (
        <svg {...svgProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      );
    default:
      return null;
  }
}

function MetricCardShell({ children, accent, delay = 0, title = '' }) {
  return (
    <div
      className="pr-metric-card"
      style={{ '--accent': accent, animationDelay: `${delay}ms` }}
      title={title || undefined}
    >
      {children}
    </div>
  );
}

function AvailabilityCard({ card, delay }) {
  const count = useCountUp(card.value, 1200, card.decimals || 0);
  const displayValue = `${count}${card.suffix || ''}`;

  return (
    <MetricCardShell accent={card.accent} delay={delay} title={card.description || card.title}>
      <div className="pr-metric-card-header">
        <div className="pr-metric-card-icon">
          <MetricIcon type={card.icon} />
        </div>
        <span className="pr-metric-card-label">{card.title}</span>
      </div>
      <div className="pr-metric-card-body">
        <div className="pr-metric-card-value-row">
          <span
            className={`pr-metric-card-value${card.valueColor ? ' is-green' : ''}`}
            style={card.valueColor ? { color: card.valueColor } : undefined}
          >
            {displayValue}
          </span>
        </div>
        <div className="pr-metric-card-footer">
          {card.thresholdLegend && (
            <span className="pr-metric-card-threshold-legend">{card.thresholdLegend}</span>
          )}
        </div>
      </div>
    </MetricCardShell>
  );
}

function CountCard({ card, delay }) {
  const count = useCountUp(card.value, 900);
  const displayValue = card.valueLabel
    ? `${count}`
    : `${count}${card.suffix || ''}`;

  return (
    <MetricCardShell accent={card.accent} delay={delay} title={card.description || card.title}>
      <div className="pr-metric-card-header">
        <div className="pr-metric-card-icon">
          <MetricIcon type={card.icon} />
        </div>
        <span className="pr-metric-card-label">{card.title}</span>
      </div>
      <div className="pr-metric-card-body">
        <div className="pr-metric-card-value-row">
          <span className="pr-metric-card-value">{displayValue}</span>
        </div>
        {card.valueLabel ? (
          <div className="pr-metric-card-footer">
            <span className="pr-metric-card-caption">{card.valueLabel}</span>
          </div>
        ) : null}
      </div>
    </MetricCardShell>
  );
}

function TimeCard({ card, delay }) {
  return (
    <MetricCardShell accent={card.accent} delay={delay} title={card.description || card.title}>
      <div className="pr-metric-card-header">
        <div className="pr-metric-card-icon">
          <MetricIcon type={card.icon} />
        </div>
        <span className="pr-metric-card-label">{card.title}</span>
      </div>
      <div className="pr-metric-card-body">
        <div className="pr-metric-card-value-row">
          <span className="pr-metric-card-value">{card.meanValue}</span>
        </div>
        <div className="pr-metric-card-footer">
          <span className="pr-metric-card-caption">{card.medianLabel}: {card.medianValue}</span>
        </div>
      </div>
    </MetricCardShell>
  );
}

function TrendArrow({ direction }) {
  if (direction === 'down') {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <polyline points="19 12 12 19 5 12" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function KpiCard({ card, delay }) {
  const count = useCountUp(card.value, 900, card.decimals || 0);
  const displayValue = `${count}${card.suffix || ''}`;

  return (
    <MetricCardShell accent={card.accent} delay={delay} title={card.description || card.title}>
      <div className="pr-metric-card-header">
        <div className="pr-metric-card-icon">
          <MetricIcon type={card.icon} />
        </div>
        <span className="pr-metric-card-label">{card.title}</span>
      </div>
      <div className="pr-metric-card-body">
        <div className="pr-metric-card-value-row">
          <span className="pr-metric-card-value">{displayValue}</span>
        </div>
        <div className="pr-metric-card-footer">
          {card.caption && <span className="pr-metric-card-caption">{card.caption}</span>}
          {card.trend && (
            <span className={`pr-metric-card-trend ${card.trend.direction}`}>
              <TrendArrow direction={card.trend.direction} />
              {card.trend.value} {card.trend.label}
            </span>
          )}
        </div>
      </div>
    </MetricCardShell>
  );
}

function MetricCard({ card, delay }) {
  switch (card.type) {
    case 'availability':
      return <AvailabilityCard card={card} delay={delay} />;
    case 'count':
      return <CountCard card={card} delay={delay} />;
    case 'time':
      return <TimeCard card={card} delay={delay} />;
    case 'kpi':
      return <KpiCard card={card} delay={delay} />;
    default:
      return null;
  }
}

function MonthlyMetricsCards({ cards }) {
  return (
    <div className="pr-metrics-scroll">
      <div className="pr-metrics-grid">
        <div className="pr-metrics-row">
          {cards.map((card, index) => (
            <MetricCard key={card.title} card={card} delay={60 + index * 35} />
          ))}
        </div>
      </div>
    </div>
  );
}

export { MetricIcon, MetricCardShell, AvailabilityCard, CountCard, TimeCard, TrendArrow, KpiCard, MetricCard, MonthlyMetricsCards };
