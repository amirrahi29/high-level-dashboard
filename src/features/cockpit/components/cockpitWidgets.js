import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useResponsiveChart } from '../../../hooks/useResponsiveChart.js';
import { formatAppNumber, formatAppDate, formatAppDateTime } from '../../../utils/format.js';
import {
  classifyProgressBand,
  getProgressBandTheme,
  IMPERATIVE_LABELS,
  countProjectsByProgressBand,
  formatFastPillarSubtitle,
  statusFromHealthScore,
  progressBandLabel,
  computePortfolioSummary,
  computeExecutiveMetrics,
  resolveOwnerTone,
  RiskScoreGauge,
  buildOwnershipOverview,
  buildUpcomingMilestones,
  buildTopRisks,
  buildKeyHighlights,
  buildLastQuarterSummary,
  buildQuarterlyComparisonStats,
  buildInitiativeTrackerRows,
} from '../lib/cockpitData.js';
import { ORG_DATA, FAST_CATEGORIES, STATUS_META, healthColor } from '../lib/orgModel.js';
import { SectionCard, ProgressBar, StatusPill, Avatar } from './sharedUi.js';

function sparkSeries(weekly, pick) {
  return weekly.map((w, ix) => ({ ix, v: pick(w) }));
}

function buildCockpitAnalytics(orgData, filterFastId) {
  const { fastCategories, ceoTrends, ceoSummary: globalSummary } = orgData;
  const pillarFasts = filterFastId ? fastCategories.filter((f) => f.id === filterFastId) : fastCategories;
  const ceoSummary = filterFastId ? computePortfolioSummary(pillarFasts) : globalSummary;

  const weekly = ceoTrends.weekly;
  const monthly = ceoTrends.monthly.slice(-4);

  const quarterlyBars = monthly.map((m, i) => ({
    quarter: `${m.label}`,
    onTrack: m.onTrack ?? 0,
    atRisk: m.atRisk ?? 0,
    delayed: m.delayed ?? 0,
    sortKey: i,
  }));

  const initiativeTracker = buildInitiativeTrackerRows(pillarFasts);
  const upcomingMilestones = buildUpcomingMilestones(pillarFasts);

  const lastQuarterBullets = [
    `Average team utilization was ${weekly[weekly.length - 1]?.utilization ?? 85}%. Portfolio health ended near ${weekly[weekly.length - 1]?.close ?? ceoSummary.overallHealth}%.`,
    `${ceoSummary.onTrackPct}% of projects are on track across FAST pillars.`,
    `${ceoSummary.atRiskProjects > 0 ? `${ceoSummary.atRiskProjects} initiatives need executive sponsorship` : 'No major executive sponsorship gaps this quarter'}.`,
  ];

  const sparks = {
    health: sparkSeries(weekly, (w) => w.close),
    mix: sparkSeries(weekly, (w) => w.onTrack + w.atRisk * 1.05),
    pillars: sparkSeries(weekly, (w) => w.close * 1.03),
    initiatives: sparkSeries(weekly, (w) => w.onTrack + w.atRisk),
    onTrack: sparkSeries(weekly, (w) => w.onTrack * 11),
    atRisk: sparkSeries(weekly, (w) => w.atRisk * 12 + 18),
    offTrack: sparkSeries(weekly, (w) => w.delayed * 10 + 8),
  };

  const executiveMetrics = computeExecutiveMetrics(pillarFasts);
  const quarterlyStats = buildQuarterlyComparisonStats(quarterlyBars);

  return {
    ceoSummary,
    executiveMetrics,
    quarterlyBars,
    quarterlyStats,
    initiativeTracker,
    ownershipOverview: buildOwnershipOverview(pillarFasts),
    upcomingMilestones,
    lastQuarterSummary: buildLastQuarterSummary(quarterlyBars, ceoSummary, upcomingMilestones.length),
    keyHighlights: buildKeyHighlights(
      quarterlyStats,
      ceoSummary,
      executiveMetrics,
      upcomingMilestones.length,
    ),
    topRisks: buildTopRisks(pillarFasts),
    lastQuarterBullets,
    sparks,
  };
}

function useViewport() {
  const [vp, setVp] = useState(() => ({
    compact: false,
    isMobile: false,
    isTablet: false,
    isSmallLaptop: false,
    isCompactLaptop: false,
    chartH: 210,
    panelChartH: 168,
    panelMinH: 320,
    bottomMinH: 300,
    fastChartH: 108,
    healthDotSize: 44,
    healthDotCore: 38,
  }));

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      const isSmallLaptop = width < 1280;
      const isCompactLaptop = width < 1366;
      setVp({
        compact: width < 640,
        isMobile: width < 480,
        isTablet: width < 768,
        isSmallLaptop,
        isCompactLaptop,
        chartH: width < 480 ? 160 : width < 640 ? 180 : width < 768 ? 195 : width < 1024 ? 205 : width < 1280 ? 212 : width < 1536 ? 218 : 220,
        panelChartH: width < 480 ? 136 : width < 640 ? 148 : width < 768 ? 156 : width < 1024 ? 160 : width < 1280 ? 164 : width < 1536 ? 168 : 172,
        panelMinH: width < 768 ? 0 : width < 1024 ? 280 : width < 1280 ? 292 : width < 1536 ? 308 : 320,
        bottomMinH: width < 768 ? 0 : width < 1024 ? 260 : width < 1280 ? 272 : width < 1536 ? 286 : 300,
        fastChartH: width < 1180 ? 80 : width < 1280 ? 84 : width < 1366 ? 92 : width < 1536 ? 100 : 108,
        healthDotSize: width < 1180 ? 32 : width < 1280 ? 36 : width < 1366 ? 40 : 44,
        healthDotCore: width < 1180 ? 28 : width < 1280 ? 32 : width < 1366 ? 34 : 38,
      });
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => window.removeEventListener('resize', sync);
  }, []);

  return vp;
}

const FAST_PILLAR_ICONS = {
  FOCUS: '◎',
  ACCELERATE: '⚡',
  SCALE: '◆',
  TRANSFORM: '↻',
};

const TOWER_LEAD_ICONS = {
  ET: '🏢',
  BV: '◈',
  PD: '⚙',
  OT: '◫',
};

const TOWER_LEADS_DATA = [
  {
    id: 'enterprise-tech',
    shortName: 'ET',
    name: 'Enterprise Tech',
    subtitle: 'Enterprise technology initiatives',
    initiatives: 2,
    onTrack: 2,
    atRisk: 0,
    offTrack: 0,
  },
  {
    id: 'breakthrough-ventures',
    shortName: 'BV',
    name: 'Breakthrough Ventures',
    subtitle: 'Ventures and breakthrough bets',
    initiatives: 3,
    onTrack: 1,
    atRisk: 1,
    offTrack: 1,
  },
  {
    id: 'product-and-development',
    shortName: 'PD',
    name: 'Product and Development',
    subtitle: 'Product and development programs',
    initiatives: 13,
    onTrack: 13,
    atRisk: 0,
    offTrack: 0,
  },
  {
    id: 'others',
    shortName: 'OT',
    name: 'Others',
    subtitle: 'Other portfolio initiatives',
    initiatives: 8,
    onTrack: 8,
    atRisk: 0,
    offTrack: 0,
  },
];

const COCKPIT_METRIC_ICONS = {
  'Strategic Imperatives': '🏛',
  Initiatives: '📊',
  'Sub-Initiatives': '📋',
  'On Track': '✓',
  'At Risk': '◐',
  'Off Track': '⚠',
  'Portfolio Health Score': '◆',
};

function ChartLegendRow({ items }) {
  return (
    <div className="def-chart-legend-row" aria-label="Chart legend">
      {items.map((item) => (
        <span key={item.label} className="def-chart-legend-item">
          <i style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MetricSparkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="def-cockpit-metric-spark-tip">
      <strong>{Math.round(payload[0].value)}</strong>
    </div>
  );
}

function CockpitMetricSpark({ data, stroke, fillId = 'metricSparkFill' }) {
  const line = stroke || '#6366f1';
  return (
    <div className="def-cockpit-metric-spark">
      <ResponsiveContainer width="100%" height={24}>
        <AreaChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.28} />
              <stop offset="100%" stopColor={line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ix" hide />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            content={<MetricSparkTooltip />}
            cursor={{ stroke: line, strokeWidth: 1, strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={line}
            strokeWidth={2.25}
            fill={`url(#${fillId})`}
            dot={false}
            activeDot={{ r: 3.5, fill: line, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CockpitPortfolioScopeCard({ metrics, delay = '0ms' }) {
  const items = [
    { key: 'imperatives', label: 'Strategic Imperatives', value: metrics.strategicImperatives },
    { key: 'initiatives', label: 'Initiatives', value: metrics.initiatives },
  ];

  return (
    <article
      className="def-cockpit-metric-card def-cockpit-metric-scope def-cockpit-interactive def-accent-indigo def-stagger-in"
      style={{ '--stagger': delay }}
      aria-label="Active portfolio counts"
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-metric-scope-head">
        <div className="def-cockpit-metric-icon" aria-hidden="true">📁</div>
        <span className="def-cockpit-metric-label">Active portfolio</span>
      </div>
      <div className="def-cockpit-metric-scope-grid">
        {items.map((item) => (
          <div key={item.key} className="def-cockpit-metric-scope-item">
            <strong className="def-cockpit-metric-scope-value">{item.value}</strong>
            <span className="def-cockpit-metric-scope-name">{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function classifyOverallHealthLevel(score) {
  if (score > 80) return { tone: 'green', color: '#22c55e', label: 'Healthy' };
  if (score >= 60) return { tone: 'yellow', color: '#eab308', label: 'Watch' };
  return { tone: 'red', color: '#ef4444', label: 'Critical' };
}

function CockpitOverallHealthCard({ score, delay = '0ms' }) {
  const level = classifyOverallHealthLevel(score);
  const legend = [
    { key: 'green', label: 'Green >80', color: '#22c55e', active: score > 80 },
    { key: 'yellow', label: 'Yellow 60-80', color: '#eab308', active: score >= 60 && score <= 80 },
    { key: 'red', label: 'Red <60', color: '#ef4444', active: score < 60 },
  ];

  return (
    <article
      className={`def-cockpit-metric-card def-cockpit-overall-health def-cockpit-interactive def-stagger-in tone-${level.tone}`}
      style={{ '--stagger': delay, '--health-dot-color': level.color }}
      aria-label={`Overall health score ${score}`}
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-overall-health-head">
        <div className="def-cockpit-metric-icon" aria-hidden="true">◆</div>
        <span className="def-cockpit-metric-label">Overall health</span>
      </div>
      <div className="def-cockpit-overall-health-body">
        <ul className="def-cockpit-overall-health-legend" aria-label="Health score ranges">
          {legend.map((item) => (
            <li key={item.key} className={item.active ? 'is-active' : undefined} data-tone={item.key}>
              <i style={{ background: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="def-cockpit-overall-health-dot-wrap" aria-hidden="true">
          <span className="def-cockpit-overall-health-dot">
            <span className="def-cockpit-overall-health-dot-core" />
          </span>
        </div>
      </div>
    </article>
  );
}

function getMetricCountTooltip(statusBand) {
  if (statusBand === 'on-track') return 'Initiatives on track in the active portfolio';
  if (statusBand === 'at-risk') return 'Initiatives at risk in the active portfolio';
  if (statusBand === 'off-track') return 'Initiatives off track in the active portfolio';
  return 'Initiative count in the active portfolio';
}

function getPillarHealthTooltip() {
  return 'Pillar health score — average initiative progress across this FAST pillar';
}

function OverlayTooltip({ tip, className = '', children, block = false, align = 'end' }) {
  const anchorRef = useRef(null);
  const tipRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0, placement: 'top', arrowLeft: 10 });
  const Wrapper = block ? 'div' : 'span';

  const reposition = () => {
    const anchor = anchorRef.current;
    const tipEl = tipRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const pad = 8;
    const maxWidth = 210;
    const tipWidth = Math.min(tipEl?.offsetWidth || maxWidth, maxWidth);
    const tipHeight = tipEl?.offsetHeight || 44;

    let left = align === 'center'
      ? rect.left + (rect.width - tipWidth) / 2
      : rect.right - tipWidth;
    left = Math.max(pad, Math.min(left, window.innerWidth - tipWidth - pad));

    let placement = 'top';
    let top = rect.top - gap;
    if (rect.top - tipHeight - gap < pad) {
      placement = 'bottom';
      top = rect.bottom + gap;
    }

    const anchorX = align === 'center' ? rect.left + rect.width / 2 : rect.right - 6;
    const arrowLeft = Math.max(12, Math.min(anchorX - left, tipWidth - 12));
    setStyle({ top, left, placement, arrowLeft });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    reposition();
    const handle = () => reposition();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [open, tip, align]);

  return (
    <>
      <Wrapper
        ref={anchorRef}
        className={className}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </Wrapper>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={tipRef}
          className={`def-cockpit-overlay-tip placement-${style.placement}`}
          role="tooltip"
          style={{
            position: 'fixed',
            top: style.top,
            left: style.left,
            transform: style.placement === 'top' ? 'translateY(-100%)' : 'none',
            zIndex: 10000,
            '--tip-arrow-left': `${style.arrowLeft}px`,
          }}
        >
          {tip}
        </div>,
        document.body,
      )}
    </>
  );
}

function MetricCountPill({ count, statusBand }) {
  const tip = getMetricCountTooltip(statusBand);
  return (
    <span
      className="def-cockpit-metric-pill"
      tabIndex={0}
      aria-label={`${count} ${tip}`}
    >
      {count}
    </span>
  );
}

function CockpitMetricCard({
  title,
  value,
  valueSuffix,
  subtitle,
  accent,
  spark,
  delay = '0ms',
  showSpark = false,
  valueTone,
  statusBand,
  iconRight = false,
  trendSub = false,
  trendDown = false,
}) {
  const bandTheme = statusBand ? getProgressBandTheme(statusBand) : null;
  const resolvedTone = bandTheme?.tone ?? valueTone;
  const resolvedAccent = bandTheme?.accent ?? accent;
  const icon = COCKPIT_METRIC_ICONS[title] || '●';
  const isCountCard = iconRight;
  const isHealthCard = title === 'Portfolio Health Score';
  const healthPct = isHealthCard
    ? Math.max(0, Math.min(100, Number.parseInt(String(value), 10) || 0))
    : 0;
  const sparkFillId = `metric-spark-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const countTip = statusBand && subtitle && !isHealthCard
    ? getMetricCountTooltip(statusBand)
    : null;

  const card = (
    <article
      className={[
        'def-cockpit-metric-card',
        'def-cockpit-interactive',
        'def-stagger-in',
        isCountCard && 'metric-count',
        showSpark && 'metric-status',
        isHealthCard && 'metric-health',
        statusBand && `status-${statusBand}`,
        resolvedAccent,
      ].filter(Boolean).join(' ')}
      style={{
        '--stagger': delay,
        ...(bandTheme ? {
          '--metric-band-color': bandTheme.color,
          '--metric-band-label': bandTheme.label,
          '--metric-band-sub': bandTheme.sub,
          '--metric-band-border': bandTheme.border,
          '--metric-band-bg': bandTheme.cardBg,
          '--metric-icon-bg': bandTheme.iconBg,
          '--metric-icon-border': bandTheme.iconBorder,
        } : {}),
      }}
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-metric-head">
        {!isCountCard ? (
          <div className="def-cockpit-metric-icon" aria-hidden="true">{icon}</div>
        ) : null}
        <span className="def-cockpit-metric-label">{title}</span>
        {isCountCard ? (
          <div className="def-cockpit-metric-icon metric-icon-tr" aria-hidden="true">{icon}</div>
        ) : null}
      </div>
      <div className="def-cockpit-metric-body">
        <div className="def-cockpit-metric-value-row">
          <strong className={`def-cockpit-metric-value${resolvedTone ? ` tone-${resolvedTone}` : ''}`}>
            {value}
            {valueSuffix ? <span className="def-cockpit-metric-denom">{valueSuffix}</span> : null}
          </strong>
          {statusBand && subtitle && !isHealthCard ? (
            <MetricCountPill count={subtitle} statusBand={statusBand} />
          ) : null}
        </div>
        {isHealthCard ? (
          <div className="def-cockpit-metric-health-track" aria-hidden="true">
            <span className="def-cockpit-metric-health-fill" style={{ width: `${healthPct}%` }} />
          </div>
        ) : null}
        {subtitle && (isCountCard || isHealthCard) ? (
          <small className={`def-cockpit-metric-sub${trendSub ? (trendDown ? ' trend-down' : ' trend-up') : ''}`}>
            {subtitle}
          </small>
        ) : null}
      </div>
      {showSpark && spark ? (
        <CockpitMetricSpark
          data={spark}
          stroke={bandTheme?.spark ?? (resolvedTone === 'amber' ? '#f59e0b' : resolvedTone === 'rose' ? '#ef4444' : resolvedTone === 'emerald' ? '#22c55e' : '#6366f1')}
          fillId={sparkFillId}
        />
      ) : null}
    </article>
  );

  if (countTip) {
    return (
      <OverlayTooltip
        tip={countTip}
        className="def-cockpit-metric-card-overlay"
        block
        align="center"
      >
        {card}
      </OverlayTooltip>
    );
  }

  return card;
}

function FastHealthCard({ fast, theme, onSelectFast, index = 0 }) {
  const vp = useViewport();
  const projects = fast.initiatives.flatMap((ini) => ini.projects);
  const { onTrack: onCount, atRisk: atCount, offTrack: lateCount } = countProjectsByProgressBand(projects);
  const total = Math.max(projects.length, 1);

  const data = [
    { name: 'On Track', value: onCount || 0, fill: '#22c55e' },
    { name: 'At Risk', value: atCount, fill: '#f59e0b' },
    { name: 'Off Track', value: lateCount, fill: '#ef4444' },
  ].filter((d) => d.value > 0);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="def-cockpit-fast-health def-cockpit-interactive def-stagger-in"
      style={{ '--stagger': `${120 + index * 70}ms` }}
      onClick={() => onSelectFast?.(fast.id)}
      aria-label={`View ${fast.shortName} initiatives`}
    >
      <div className="def-cockpit-fast-head">
        <span className="def-cockpit-fast-icon">{FAST_PILLAR_ICONS[fast.shortName] || '●'}</span>
        <div className="def-cockpit-fast-titles">
          <div className="def-cockpit-fast-title-row">
            <p className="def-cockpit-fast-kicker">{fast.shortName}</p>
            <OverlayTooltip tip={getPillarHealthTooltip()} className="def-cockpit-fast-health-score-wrap">
              <span
                className="def-cockpit-fast-health-score"
                style={{ color: healthColor(fast.healthScore) }}
              >
                {fast.healthScore}%
              </span>
            </OverlayTooltip>
          </div>
          <h3>{formatFastPillarSubtitle(fast.name)}</h3>
        </div>
      </div>
      <div className="def-cockpit-fast-body">
        <div className="def-cockpit-fast-chart">
          <ResponsiveContainer width="100%" height={vp.fastChartH}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data.length ? data : [{ name: 'Empty', value: 1, fill: isDark ? '#334155' : '#e2e8f0' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              >
                {(data.length ? data : [{ fill: isDark ? '#334155' : '#e2e8f0' }]).map((e) => (
                  <Cell key={e.name || 'empty'} fill={e.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="def-cockpit-fast-donut-center">
            <strong>{total}</strong>
            <span>Initiatives</span>
          </div>
        </div>
        <ul className="def-cockpit-fast-legend">
          <li><i style={{ background: '#22c55e' }} aria-hidden="true" /><span>On track</span><strong>{onCount}</strong></li>
          <li><i style={{ background: '#f59e0b' }} aria-hidden="true" /><span>At risk</span><strong>{atCount}</strong></li>
          <li><i style={{ background: '#ef4444' }} aria-hidden="true" /><span>Off track</span><strong>{lateCount}</strong></li>
        </ul>
      </div>
    </button>
  );
}

function TowerLeadHealthCard({ lead, theme, index = 0 }) {
  const vp = useViewport();
  const total = Math.max(lead.initiatives, 1);

  const data = [
    { name: 'On Track', value: lead.onTrack || 0, fill: '#22c55e' },
    { name: 'At Risk', value: lead.atRisk, fill: '#f59e0b' },
    { name: 'Off Track', value: lead.offTrack, fill: '#ef4444' },
  ].filter((d) => d.value > 0);

  const isDark = theme === 'dark';

  return (
    <article
      className="def-cockpit-fast-health def-cockpit-tower-lead-card def-cockpit-interactive def-stagger-in"
      style={{ '--stagger': `${120 + index * 70}ms` }}
      aria-label={`${lead.name} tower lead summary`}
    >
      <div className="def-cockpit-fast-head">
        <span className="def-cockpit-fast-icon">{TOWER_LEAD_ICONS[lead.shortName] || '●'}</span>
        <div className="def-cockpit-fast-titles">
          <div className="def-cockpit-fast-title-row">
            <p className="def-cockpit-fast-kicker">{lead.shortName}</p>
          </div>
          <h3>{lead.name}</h3>
        </div>
      </div>
      <div className="def-cockpit-fast-body">
        <div className="def-cockpit-fast-chart">
          <ResponsiveContainer width="100%" height={vp.fastChartH}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data.length ? data : [{ name: 'Empty', value: 1, fill: isDark ? '#334155' : '#e2e8f0' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              >
                {(data.length ? data : [{ fill: isDark ? '#334155' : '#e2e8f0' }]).map((e) => (
                  <Cell key={e.name || 'empty'} fill={e.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="def-cockpit-fast-donut-center">
            <strong>{total}</strong>
            <span>Initiatives</span>
          </div>
        </div>
        <ul className="def-cockpit-fast-legend">
          <li><i style={{ background: '#22c55e' }} aria-hidden="true" /><span>On track</span><strong>{lead.onTrack}</strong></li>
          <li><i style={{ background: '#f59e0b' }} aria-hidden="true" /><span>At risk</span><strong>{lead.atRisk}</strong></li>
          <li><i style={{ background: '#ef4444' }} aria-hidden="true" /><span>Off track</span><strong>{lead.offTrack}</strong></li>
        </ul>
      </div>
    </article>
  );
}

const COCKPIT_OWNERSHIP_PREVIEW_LIMIT = 8;
const COCKPIT_MILESTONES_PREVIEW_LIMIT = 5;
const COCKPIT_TOP_RISKS_PREVIEW_LIMIT = 4;
const COCKPIT_KEY_HIGHLIGHTS_PREVIEW_LIMIT = 3;

function ModalProTableShell({ children, className = '' }) {
  return (
    <div className={`def-modal-pro-table-wrap${className ? ` ${className}` : ''}`}>
      <div className="def-modal-pro-table-scroll">
        {children}
      </div>
    </div>
  );
}

function CockpitInsightsDrawer({
  open,
  onClose,
  titleId,
  closeLabel,
  title,
  description,
  stats,
  sectionTitle,
  sectionCount,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const drawer = (
    <div className="def-drawer-root def-drawer-root-global open" role="presentation">
      <button type="button" className="def-drawer-backdrop" aria-label={closeLabel} onClick={onClose} />
      <aside
        className="def-drawer def-drawer-pillar def-drawer-pro def-cockpit-insights-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="def-drawer-head def-drawer-head-pillar">
          <div className="def-drawer-head-row">
            <span className="def-drawer-tier">Portfolio insights</span>
            <button type="button" className="def-drawer-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <h2 id={titleId}>{title}</h2>
          {description ? <p className="def-drawer-pillar-desc">{description}</p> : null}
          {stats ? <div className="def-drawer-pillar-stats">{stats}</div> : null}
        </header>
        <div className="def-drawer-body def-drawer-body-pillar">
          <div className="def-drawer-section-bar">
            <h3>{sectionTitle}</h3>
            <span>{sectionCount}</span>
          </div>
          <div className="def-drawer-pillar-table">
            {children}
          </div>
        </div>
      </aside>
    </div>
  );

  if (typeof document === 'undefined') return null;
  const host = document.getElementById('def-drawer-portal-host') || document.body;
  return createPortal(drawer, host);
}

function ModalBandCell({ count, pct, band }) {
  return (
    <span className={`def-modal-band-cell band-${band}`}>
      <strong>{count}</strong>
      <span className="def-modal-band-pct">{pct}%</span>
    </span>
  );
}

function CockpitPanelHeader({ title, actionLabel = 'View all', onViewAll }) {
  return (
    <div className="def-cockpit-panel-head">
      <h3 className="def-cockpit-card-title">{title}</h3>
      <button type="button" className="def-cockpit-view-all" onClick={onViewAll}>{actionLabel}</button>
    </div>
  );
}

function OwnershipOverviewTableBody({ rows, modal = false }) {
  const tableClass = modal
    ? 'def-modal-pro-table def-modal-pro-table-ownership'
    : 'def-cockpit-table def-cockpit-table-ownership';

  const table = (
    <table className={tableClass}>
      <thead>
        <tr>
          <th>Owner</th>
          <th>Total Initiatives</th>
          <th>On Track</th>
          <th>At Risk</th>
          <th>Off Track</th>
          <th>Health Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td data-label="Owner">
              <span className="def-cockpit-owner-cell def-modal-owner-cell">
                <Avatar name={row.owner} tone={resolveOwnerTone(row.owner)} />
                <strong>{row.owner}</strong>
              </span>
            </td>
            <td data-label="Total Initiatives">
              <span className="def-modal-count-chip">{row.total}</span>
            </td>
            <td data-label="On Track">
              <ModalBandCell count={row.onTrack} pct={row.onTrackPct} band="on-track" />
            </td>
            <td data-label="At Risk">
              <ModalBandCell count={row.atRisk} pct={row.atRiskPct} band="at-risk" />
            </td>
            <td data-label="Off Track">
              <ModalBandCell count={row.offTrack} pct={row.offTrackPct} band="off-track" />
            </td>
            <td data-label="Health Score">
              <span
                className="def-cockpit-health-pill def-modal-health-pill"
                style={{
                  color: healthColor(row.healthScore),
                  borderColor: `${healthColor(row.healthScore)}40`,
                  background: `${healthColor(row.healthScore)}16`,
                }}
              >
                {row.healthScore}
              </span>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={6} className="def-cockpit-empty">No ownership data.</td></tr>
        )}
      </tbody>
    </table>
  );

  if (modal) {
    return <ModalProTableShell>{table}</ModalProTableShell>;
  }
  return table;
}

function OwnershipOverviewDrawer({ open, onClose, rows }) {
  const totalOwners = rows.length;
  const totalInitiatives = rows.reduce((sum, row) => sum + row.total, 0);
  const avgHealth = Math.round(
    rows.reduce((sum, row) => sum + row.healthScore, 0) / Math.max(totalOwners, 1),
  );
  const portfolioStatus = statusFromHealthScore(avgHealth);

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-ownership-drawer-title"
      closeLabel="Close ownership overview"
      title="Ownership Overview"
      description="Initiative ownership across FAST pillars"
      sectionTitle="Owner breakdown"
      sectionCount={`${totalOwners} owners`}
      stats={(
        <>
          <StatusPill status={portfolioStatus} />
          <span
            className="def-drawer-pillar-score"
            style={{ color: healthColor(avgHealth) }}
          >
            {avgHealth}% health
          </span>
          <span className="def-drawer-pillar-meta">
            {totalOwners} owners
            {' | '}
            {totalInitiatives} initiatives
          </span>
        </>
      )}
    >
      <OwnershipOverviewTableBody rows={rows} modal />
    </CockpitInsightsDrawer>
  );
}

function OwnershipOverviewTable({ rows }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previewRows = rows.slice(0, COCKPIT_OWNERSHIP_PREVIEW_LIMIT);

  return (
    <>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-stagger-in" style={{ '--stagger': '160ms' }}>
        <CockpitPanelHeader title="Ownership Overview" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll wide def-cockpit-panel-body def-cockpit-table-preview">
          <OwnershipOverviewTableBody rows={previewRows} />
        </div>
      </div>
      <OwnershipOverviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rows={rows}
      />
    </>
  );
}

function UpcomingMilestonesTableBody({ rows, onOpenInitiative, modal = false }) {
  const tableClass = modal
    ? 'def-modal-pro-table def-modal-pro-table-milestones'
    : 'def-cockpit-table def-cockpit-table-milestones';

  const table = (
    <table className={tableClass}>
      <thead>
        <tr>
          <th>Initiative</th>
          <th>Strategic Imperative</th>
          <th>Due Date</th>
          <th>Days Left</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={onOpenInitiative ? 'def-cockpit-row-click def-modal-row-click' : undefined}
            onClick={onOpenInitiative ? () => onOpenInitiative(row.fastId, row.initiativeId) : undefined}
            onKeyDown={onOpenInitiative ? (event) => { if (event.key === 'Enter') onOpenInitiative(row.fastId, row.initiativeId); } : undefined}
            tabIndex={onOpenInitiative ? 0 : undefined}
            role={onOpenInitiative ? 'button' : undefined}
          >
            <td data-label="Initiative">
              <span className="def-cockpit-initiative-name">{row.initiative}</span>
            </td>
            <td data-label="Strategic Imperative">
              <span className="def-modal-imperative-chip">{row.imperative}</span>
            </td>
            <td data-label="Due Date">
              <span className="def-cockpit-due-date">{formatAppDate(row.dueDate)}</span>
            </td>
            <td data-label="Days Left">
              <span className="def-cockpit-days-left def-modal-days-chip">{row.daysLeft}</span>
            </td>
            <td data-label="Status">
              <span className={`def-cockpit-status-pill status-${row.status}`}>{row.statusLabel}</span>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={5} className="def-cockpit-empty">No milestones in the next 30 days.</td></tr>
        )}
      </tbody>
    </table>
  );

  if (modal) {
    return <ModalProTableShell>{table}</ModalProTableShell>;
  }
  return table;
}

function MilestonesOverviewDrawer({ open, onClose, rows, onOpenInitiative }) {
  const total = rows.length;
  const avgDays = total
    ? Math.round(rows.reduce((sum, row) => sum + row.daysLeft, 0) / total)
    : 0;
  const onTrackCount = rows.filter((row) => row.status === 'on-track').length;
  const portfolioStatus = onTrackCount >= total * 0.7 ? 'on-track' : onTrackCount >= total * 0.4 ? 'at-risk' : 'off-track';

  const handleOpenInitiative = (fastId, initiativeId) => {
    onClose();
    onOpenInitiative?.(fastId, initiativeId);
  };

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-milestones-drawer-title"
      closeLabel="Close milestones"
      title="Upcoming Milestone"
      description="Upcoming milestones and days remaining across the portfolio"
      sectionTitle="Milestone timeline"
      sectionCount={`${total} milestones`}
      stats={(
        <>
          <StatusPill status={portfolioStatus} />
          <span className="def-drawer-pillar-score def-drawer-pillar-days">
            {avgDays} days avg
          </span>
          <span className="def-drawer-pillar-meta">
            {total} milestones
            {' | '}
            {onTrackCount} on track
          </span>
        </>
      )}
    >
      <UpcomingMilestonesTableBody
        rows={rows}
        modal
        onOpenInitiative={handleOpenInitiative}
      />
    </CockpitInsightsDrawer>
  );
}

function UpcomingMilestonesTable({ rows, onOpenInitiative }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previewRows = rows.slice(0, COCKPIT_MILESTONES_PREVIEW_LIMIT);

  return (
    <>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-stagger-in" style={{ '--stagger': '160ms' }}>
        <CockpitPanelHeader title="Upcoming Milestone" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll wide def-cockpit-panel-body def-cockpit-table-preview">
          <UpcomingMilestonesTableBody rows={previewRows} onOpenInitiative={onOpenInitiative} />
        </div>
      </div>
      <MilestonesOverviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rows={rows}
        onOpenInitiative={onOpenInitiative}
      />
    </>
  );
}

function TopRisksList({ rows, compact = false }) {
  const preview = compact ? rows.slice(0, COCKPIT_TOP_RISKS_PREVIEW_LIMIT) : rows;
  return (
    <ul className="def-cockpit-top-risk-list">
      {preview.map((row) => (
        <li key={row.id} className={`def-cockpit-top-risk-item tone-${row.tone}`}>
          <RiskScoreGauge score={row.score} tone={row.tone} />
          <div className="def-cockpit-top-risk-copy">
            <strong>{row.title}</strong>
            <small>
              {row.atRiskCount} initiative{row.atRiskCount === 1 ? '' : 's'} at risk
            </small>
          </div>
        </li>
      ))}
      {preview.length === 0 && (
        <li className="def-cockpit-top-risk-empty">No elevated risks in the active portfolio.</li>
      )}
    </ul>
  );
}

function TopRisksTable({ rows }) {
  return (
    <ModalProTableShell>
      <table className="def-modal-pro-table def-modal-pro-table-risks">
        <thead>
          <tr>
            <th>Risk Area</th>
            <th>Risk Score</th>
            <th>Initiatives at Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="Risk area"><strong>{row.title}</strong></td>
              <td data-label="Risk score">
                <span className={`def-modal-risk-score tone-${row.tone}`}>{row.score}</span>
              </td>
              <td data-label="Initiatives at risk">
                <span className="def-modal-count-chip">{row.atRiskCount}</span>
              </td>
              <td data-label="Status">
                <StatusPill status={row.status} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="def-cockpit-empty">No elevated risks in the active portfolio.</td></tr>
          )}
        </tbody>
      </table>
    </ModalProTableShell>
  );
}

function TopRisksDrawer({ open, onClose, rows }) {
  const highCount = rows.filter((row) => row.tone === 'high').length;
  const totalAtRisk = rows.reduce((sum, row) => sum + row.atRiskCount, 0);
  const avgScore = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length)
    : 0;

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-top-risks-drawer-title"
      closeLabel="Close top risks"
      title="Top Risks"
      description="Executive view of the highest-risk delivery areas in the portfolio"
      sectionTitle="Risk scorecard"
      sectionCount={`${rows.length} areas`}
      stats={(
        <>
          <StatusPill status={highCount > 0 ? 'at-risk' : 'on-track'} />
          <span
            className="def-drawer-pillar-score"
            style={{ color: healthColor(Math.max(0, 100 - avgScore * 3)) }}
          >
            {avgScore} avg score
          </span>
          <span className="def-drawer-pillar-meta">
            {rows.length} risk areas
            {' | '}
            {totalAtRisk} initiatives at risk
          </span>
        </>
      )}
    >
      <TopRisksTable rows={rows} />
    </CockpitInsightsDrawer>
  );
}

function TopRisksPanel({ rows, stagger = '200ms' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div
        className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-cockpit-top-risks-panel def-stagger-in"
        style={{ '--stagger': stagger }}
      >
        <CockpitPanelHeader title="Top Risks" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll def-cockpit-panel-body def-cockpit-top-risks-scroll">
          <TopRisksList rows={rows} compact />
        </div>
      </div>
      <TopRisksDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} rows={rows} />
    </>
  );
}

function CockpitQuarterHighlights({ lastQuarter, highlights }) {
  return (
    <div className="def-cockpit-bottom-rail def-stagger-in" style={{ '--stagger': '240ms' }}>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-rail-card def-cockpit-interactive">
        <h3 className="def-cockpit-card-title">Last Quarter Summary</h3>
        <div className="def-cockpit-lq-grid">
          <div className="def-cockpit-lq-stat on-track">
            <span>On track</span>
            <strong>{lastQuarter.onTrackPct}%</strong>
          </div>
          <div className="def-cockpit-lq-stat at-risk">
            <span>At risk</span>
            <strong>{lastQuarter.atRiskPct}%</strong>
          </div>
          <div className="def-cockpit-lq-stat off-track">
            <span>Off track</span>
            <strong>{lastQuarter.offTrackPct}%</strong>
          </div>
        </div>
      </div>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-rail-card def-cockpit-interactive def-cockpit-highlight-panel">
        <h3 className="def-cockpit-card-title">Key Highlights</h3>
        <ul className="def-cockpit-highlight-list">
          {highlights.slice(0, COCKPIT_KEY_HIGHLIGHTS_PREVIEW_LIMIT).map((item) => (
            <li key={item.id} className={`def-cockpit-highlight-item tone-${item.tone}`}>
              <span className="def-cockpit-highlight-icon" aria-hidden="true">{item.icon}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export {
  sparkSeries,
  progressBandLabel,
  buildCockpitAnalytics,
  useViewport,
  FAST_PILLAR_ICONS,
  TOWER_LEAD_ICONS,
  TOWER_LEADS_DATA,
  ChartLegendRow,
  MetricSparkTooltip,
  CockpitMetricSpark,
  CockpitPortfolioScopeCard,
  CockpitOverallHealthCard,
  OverlayTooltip,
  MetricCountPill,
  CockpitMetricCard,
  FastHealthCard,
  TowerLeadHealthCard,
  ModalProTableShell,
  CockpitInsightsDrawer,
  ModalBandCell,
  CockpitPanelHeader,
  OwnershipOverviewTableBody,
  OwnershipOverviewDrawer,
  OwnershipOverviewTable,
  UpcomingMilestonesTableBody,
  MilestonesOverviewDrawer,
  UpcomingMilestonesTable,
  TopRisksPanel,
  CockpitQuarterHighlights,
};
