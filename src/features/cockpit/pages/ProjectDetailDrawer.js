import React, { useEffect, useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, ComposedChart, Line, Pie, PieChart,
  ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from 'recharts';
import { formatDate } from '../../../utils/format.js';
import { useResponsiveChart } from '../../../hooks/useResponsiveChart.js';
import { MODULE_STATUS, healthColor } from '../lib/orgModel.js';
import { StatusPill, RiskBadge, Avatar } from '../components/sharedUi.js';
import { ChartLegendRow } from '../components/cockpitWidgets.js';

const MODULE_CHART_COLORS = {
  done: '#34d399',
  'in-progress': '#6366f1',
  pending: '#94a3b8',
};

function buildModuleChartData(project) {
  const counts = { done: 0, 'in-progress': 0, pending: 0 };
  project.modules.forEach((m) => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: MODULE_STATUS[status].label,
      value,
      status,
      fill: MODULE_CHART_COLORS[status],
    }));
}

function buildProjectBurndown(project) {
  const totalWeeks = Math.max(4, Math.min(8, Math.ceil(project.duration.plannedDays / 14)));
  const elapsedWeeks = Math.max(
    1,
    Math.round((project.duration.elapsedDays / Math.max(project.duration.plannedDays, 1)) * totalWeeks),
  );
  return Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1;
    const planned = Math.round((week / totalWeeks) * 100);
    let actual = null;
    if (week <= elapsedWeeks) {
      actual = week === elapsedWeeks
        ? project.progress
        : Math.round((week / elapsedWeeks) * project.progress * 0.94);
    }
    return { label: `W${week}`, planned, actual };
  });
}

function DrawerChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="def-drawer-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.name || entry.dataKey}>
          {entry.name}: <strong>{entry.value}{entry.dataKey === 'util' || entry.name === 'Planned' || entry.name === 'Actual' ? '%' : ''}</strong>
        </span>
      ))}
    </div>
  );
}

function ProjectProgressGauge({ progress, theme }) {
  const ringData = [
    { name: 'complete', value: progress, fill: healthColor(progress) },
    { name: 'remaining', value: 100 - progress, fill: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8edf4' },
  ];

  return (
    <div className="def-drawer-gauge">
      <ResponsiveContainer width="100%" aspect={1} minWidth={0}>
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie
            data={ringData}
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="88%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="def-drawer-gauge-center">
        <strong>{progress}%</strong>
        <span>Complete</span>
      </div>
    </div>
  );
}

function ProjectDetailCharts({ project, theme }) {
  const chart = useResponsiveChart();
  const isDark = theme === 'dark';
  const tick = isDark ? '#94949e' : '#64748b';
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.2)';
  const moduleData = useMemo(() => buildModuleChartData(project), [project]);
  const burndownData = useMemo(() => buildProjectBurndown(project), [project]);

  return (
    <div className="def-drawer-charts def-drawer-charts-compact">
      <div className="def-drawer-chart-card">
        <div className="def-drawer-chart-head">
          <h3>Modules</h3>
          <span>{project.modules.length} total</span>
        </div>
        <div className="def-drawer-chart-wrap">
          <ResponsiveContainer width="100%" height={150} minWidth={0}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={moduleData}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {moduleData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DrawerChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="def-drawer-donut-legend def-drawer-donut-legend-inline">
          {moduleData.map((item) => (
            <span key={item.status}>
              <i style={{ background: item.fill }} />
              {item.name} | {item.value}
            </span>
          ))}
        </div>
      </div>

      <div className="def-drawer-chart-card">
        <div className="def-drawer-chart-head">
          <h3>Delivery</h3>
          <span>Planned vs actual</span>
        </div>
        <div className="def-drawer-chart-wrap">
          <ResponsiveContainer width="100%" height={160} minWidth={0}>
            <ComposedChart data={burndownData} margin={{ ...chart.chartMargin, top: 10, right: 10, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="defDrawerArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke={grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: chart.tickSmall, fill: tick }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickMargin={4}
                height={chart.xAxisHeight}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: chart.tickSmall, fill: tick }}
                axisLine={false}
                tickLine={false}
                width={chart.yAxisWidth}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<DrawerChartTooltip />} />
              <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Planned" />
              <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} fill="url(#defDrawerArea)" name="Actual" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ChartLegendRow
          items={[
            { label: 'Planned', color: '#94a3b8' },
            { label: 'Actual', color: '#6366f1' },
          ]}
        />
      </div>
    </div>
  );
}

function ProjectDetailContent({ project, theme }) {
  const onSchedule = project.delayDays <= 0;

  return (
    <>
      <div className="def-drawer-summary">
        <ProjectProgressGauge progress={project.progress} theme={theme} />
        <div className="def-drawer-summary-stats">
          <div className="def-drawer-summary-stat">
            <span>Duration</span>
            <strong>{project.duration.elapsedDays}d / {project.duration.plannedDays}d</strong>
            <small>{project.duration.remainingDays}d remaining</small>
          </div>
          <div className="def-drawer-summary-stat">
            <span>Target end</span>
            <strong>{formatDate(project.timeline.expectedEndDate)}</strong>
          </div>
          <div className="def-drawer-summary-stat">
            <span>Projected</span>
            <strong style={{ color: onSchedule ? '#059669' : '#dc2626' }}>
              {formatDate(project.timeline.projectedEndDate)}
              {!onSchedule && ` (+${project.delayDays}d)`}
            </strong>
          </div>
        </div>
      </div>

      {project.blockers.length > 0 && (
        <div className="def-drawer-alert def-drawer-alert-danger">
          <strong>Blockers</strong>
          <ul>{project.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      )}

      {project.delayReason && (
        <div className="def-drawer-alert def-drawer-alert-warn">
          <strong>Delay</strong>
          <p>{project.delayReason}</p>
        </div>
      )}

      <ProjectDetailCharts project={project} theme={theme} />

      <div className="def-drawer-block def-drawer-block-compact">
        <div className="def-drawer-block-head">
          <h3>Task list</h3>
          <span>{project.modules.length} modules</span>
        </div>
        <div className="def-drawer-module-list">
          {project.modules.map((mod) => {
            const modMeta = MODULE_STATUS[mod.status];
            return (
              <article key={mod.id} className={`def-drawer-module def-drawer-module-${mod.status}`}>
                <div className="def-drawer-module-top">
                  <strong>{mod.name}</strong>
                  <span className="def-pill def-pill-sm" style={{ color: modMeta.color, background: modMeta.bg }}>
                    {modMeta.label}
                  </span>
                </div>
                <div className="def-drawer-module-meta">
                  <span>{mod.assignee}</span>
                  <span>{mod.estimatedDays}d est.{mod.actualDays ? ` | ${mod.actualDays}d actual` : ''}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="def-drawer-block def-drawer-block-compact">
        <div className="def-drawer-block-head">
          <h3>Team members</h3>
          <span>{project.developers.length} people</span>
        </div>
        <div className="def-drawer-team-list">
          {project.developers.map((dev) => (
            <article key={dev.id} className="def-drawer-team-row">
              <Avatar name={dev.name} tone="slate" />
              <div className="def-drawer-team-info">
                <strong>{dev.name}</strong>
                <span>{dev.role} | {dev.currentModule}</span>
              </div>
              <span
                className="def-drawer-team-util"
                style={{ color: dev.utilization > 90 ? '#dc2626' : dev.utilization > 80 ? '#6366f1' : '#059669' }}
              >
                {dev.utilization}%
              </span>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ProjectDetailDrawer({ project, team, open, onClose, theme = 'light' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !project) return null;

  const onSchedule = project.delayDays <= 0;

  return (
    <div className="def-drawer-root open" role="presentation">
      <button type="button" className="def-drawer-backdrop" aria-label="Close project details" onClick={onClose} />
      <aside className="def-drawer def-drawer-pro" role="dialog" aria-modal="true" aria-labelledby="def-drawer-title">
        <header className="def-drawer-head def-drawer-head-clean">
          <div className="def-drawer-head-row">
            <span className="def-drawer-tier">Project details</span>
            <button type="button" className="def-drawer-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <h2 id="def-drawer-title">{project.name}</h2>
          <p className="def-drawer-subtitle">
            Client: <strong>{project.client}</strong>
            {' | '}
            Team: <strong>{team?.name ?? 'Unassigned'}</strong>
          </p>
          <div className="def-drawer-head-badges">
            <StatusPill status={project.status} />
            <RiskBadge risk={project.risk} />
            <span className={`def-drawer-schedule-chip${onSchedule ? ' ok' : ' late'}`}>
              {onSchedule ? 'On schedule' : `${project.delayDays} days behind`}
            </span>
          </div>
        </header>
        <div className="def-drawer-body def-drawer-body-pro">
          <ProjectDetailContent project={project} theme={theme} />
        </div>
      </aside>
    </div>
  );
}

export default ProjectDetailDrawer;
