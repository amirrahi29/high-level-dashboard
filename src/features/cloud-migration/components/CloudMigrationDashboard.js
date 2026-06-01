import React, { useEffect, useState } from 'react';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useChartFrame } from '../hooks/useChartFrame.js';
import { DASHBOARD_DATA, STATUS_KEYS } from '../data/dashboardData.js';

function getLegendItem(legend, key) {
  return legend.find((item) => item.key === key);
}

function sumBusinessUnit(row) {
  return STATUS_KEYS.reduce((total, key) => total + (row[key] ?? 0), 0);
}

function complianceTone(value) {
  if (value >= 90) return 'high';
  if (value >= 25) return 'mid';
  return 'low';
}

function KpiIcon({ type, tone }) {
  const palette = {
    blue: '#1d4ed8',
    green: '#027a48',
    gold: '#dc6803',
  };
  const stroke = palette[tone] ?? palette.blue;

  if (type === 'cloud') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M7 18h11a4 4 0 0 0 .3-8 5.5 5.5 0 0 0-10.6-1.5A3.5 3.5 0 0 0 7 18Z" fill="none" stroke={stroke} strokeWidth="1.8" />
      </svg>
    );
  }
  if (type === 'shield') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 3 5 6v6c0 4.2 3 7.8 7 9 4-1.2 7-4.8 7-9V6l-7-3Z" fill="none" stroke={stroke} strokeWidth="1.8" />
        <circle cx="12" cy="11" r="2.5" fill={stroke} opacity="0.25" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 7h12M6 12h12M6 17h8" fill="none" stroke={stroke} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function KpiCards({ cards }) {
  return (
    <div className="ghi-kpi-row">
      {cards.map((card, index) => (
        <article
          key={card.title}
          className="ghi-kpi-card"
          style={{ animationDelay: `${index * 70}ms` }}
        >
          <div className={`ghi-kpi-icon ghi-kpi-icon-${card.iconTone}`}>
            <KpiIcon type={card.icon} tone={card.iconTone} />
          </div>
          <div className="ghi-kpi-copy">
            <span className="ghi-kpi-label">{card.title}</span>
            <strong className={`ghi-kpi-value ghi-kpi-value-${card.valueTone}`}>{card.value}</strong>
          </div>
        </article>
      ))}
    </div>
  );
}

function ComplianceBadge({ value, bold = false }) {
  const tone = complianceTone(value);
  return (
    <span
      className={`ghi-compliance ghi-compliance-${tone}${bold ? ' ghi-compliance-bold' : ''}`}
      title={`Compliance: ${value}%`}
    >
      {value}%
    </span>
  );
}

function DatacenterPanel({ stats, rows, total }) {
  return (
    <section className="ghi-panel ghi-panel-datacenter">
      <div className="ghi-dc-stats">
        {stats.map((item, index) => (
          <article
            key={item.label}
            className="ghi-dc-stat-card"
            style={{ animationDelay: `${index * 60}ms` }}
          >
            <span className="ghi-dc-stat-label">{item.label}</span>
            <strong className="ghi-dc-stat-value">{item.value.toLocaleString()}</strong>
          </article>
        ))}
      </div>

      <div className="ghi-dc-table-section">
        <h3 className="ghi-dc-table-title">Global Datacenter View</h3>
        <div className="ghi-dc-table-shell">
          <table className="ghi-dc-table">
            <thead>
              <tr>
                <th className="ghi-dc-col-location">DC Location</th>
                <th className="ghi-dc-col-apps"># of Apps</th>
                <th className="ghi-dc-col-compliance">% Compliance</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={`${row.location}-${index}`}
                  title={`${row.location || 'Unlabeled DC'} · ${row.apps} apps · ${row.compliance}% compliance`}
                >
                  <td className="ghi-dc-col-location">{row.location || '\u00A0'}</td>
                  <td className="ghi-dc-col-apps ghi-dc-num">{row.apps.toLocaleString()}</td>
                  <td className="ghi-dc-col-compliance">
                    <ComplianceBadge value={row.compliance} />
                  </td>
                </tr>
              ))}
              <tr className="ghi-dc-table-total">
                <td className="ghi-dc-col-location">Total</td>
                <td className="ghi-dc-col-apps ghi-dc-num">{total.apps.toLocaleString()}</td>
                <td className="ghi-dc-col-compliance">
                  <ComplianceBadge value={total.compliance} bold />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function BusinessUnitTooltip({ active, payload, label, legend, tooltipOrder }) {
  if (!active || !payload?.length) return null;

  const row = payload[0]?.payload ?? {};
  const totalApps = sumBusinessUnit(row);

  return (
    <div className="ghi-chart-tooltip ghi-chart-tooltip-bu">
      <div className="ghi-tooltip-head">
        <span className="ghi-tooltip-kicker">Business Unit</span>
        <strong>{label}</strong>
      </div>
      <div className="ghi-tooltip-rows">
        {tooltipOrder.map((key) => {
          const item = getLegendItem(legend, key);
          if (!item) return null;
          return (
            <div key={item.key} className="ghi-tooltip-row">
              <span className="ghi-tooltip-label">
                <i style={{ background: item.color }} />
                {item.label}
              </span>
              <span className="ghi-tooltip-value">{row[item.key] ?? 0}</span>
            </div>
          );
        })}
      </div>
      <div className="ghi-tooltip-footer">
        <span># of Apps</span>
        <strong>{totalApps}</strong>
      </div>
    </div>
  );
}

function BusinessUnitChart({ data, legend, stackOrder, tooltipOrder, xMax }) {
  const plotHeight = Math.max(360, data.length * 22 + 36);
  const viewportHeight = Math.min(plotHeight, 400);
  const yAxisWidth = 118;
  const [frameRef, frame] = useChartFrame(plotHeight);

  return (
    <section className="ghi-panel ghi-panel-chart">
      <div className="ghi-panel-head">
        <h3 className="ghi-panel-title">Migration Status by Business Unit</h3>
      </div>
      <div className="ghi-chart-viewport" style={{ height: viewportHeight }}>
        <div ref={frameRef} className="ghi-chart-plot" style={{ height: plotHeight }}>
          {frame.width > 0 && (
            <ResponsiveContainer width={frame.width} height={plotHeight} minWidth={0}>
              <BarChart
                data={data}
                layout="vertical"
                margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
                barCategoryGap="10%"
              >
                <CartesianGrid stroke="#e8edf3" horizontal={false} strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  domain={[0, xMax]}
                  ticks={[0, 100, 200, 300, 400, 500]}
                  tick={{ fill: '#667085', fontSize: 11 }}
                  axisLine={{ stroke: '#cfd8e3' }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={yAxisWidth}
                  tick={{ fill: '#344054', fontSize: 11 }}
                  axisLine={{ stroke: '#cfd8e3' }}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(65, 105, 225, 0.08)' }}
                  content={<BusinessUnitTooltip legend={legend} tooltipOrder={tooltipOrder} />}
                />
                {stackOrder.map((key) => {
                  const item = getLegendItem(legend, key);
                  if (!item) return null;
                  return (
                    <Bar
                      key={item.key}
                      dataKey={item.key}
                      name={item.label}
                      stackId="status"
                      fill={item.color}
                      radius={item.key === 'onTrack' ? [0, 2, 2, 0] : [0, 0, 0, 0]}
                      isAnimationActive={false}
                    />
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="ghi-legend-row">
        {legend.map((item) => (
          <span key={item.key} className="ghi-legend-item">
            <i style={{ background: item.color }} />
            {item.label}
          </span>
        ))}
      </div>
    </section>
  );
}

function MonthlyProgressTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="ghi-chart-tooltip ghi-chart-tooltip-line">
      <div className="ghi-tooltip-head">
        <span className="ghi-tooltip-kicker">Month</span>
        <strong>{label}</strong>
      </div>
      <div className="ghi-tooltip-rows">
        {payload.map((entry) => (
          <div key={entry.dataKey} className="ghi-tooltip-row">
            <span className="ghi-tooltip-label">
              <i style={{ background: entry.color }} />
              {entry.name}
            </span>
            <span className="ghi-tooltip-value">{entry.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyProgressChart({ data, lineColors }) {
  const chartHeight = 320;
  const [frameRef, frame] = useChartFrame(chartHeight);

  return (
    <section className="ghi-panel ghi-panel-chart">
      <div className="ghi-panel-head">
        <h3 className="ghi-panel-title">% Monthly Migrated App Progress</h3>
        <span className="ghi-panel-tag">FY26 trend</span>
      </div>
      <div ref={frameRef} className="ghi-chart-frame" style={{ height: chartHeight }}>
        {frame.width > 0 && (
          <ResponsiveContainer width={frame.width} height={chartHeight} minWidth={0}>
            <LineChart data={data} margin={{ top: 12, right: 16, left: 8, bottom: 8 }}>
              <CartesianGrid stroke="#e8edf3" vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tick={{ fill: '#667085', fontSize: 11 }}
                axisLine={{ stroke: '#cfd8e3' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 80]}
                ticks={[0, 20, 40, 60, 80]}
                tickFormatter={(value) => `${value}%`}
                tick={{ fill: '#667085', fontSize: 11 }}
                axisLine={{ stroke: '#cfd8e3' }}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: '#94a3b8', strokeDasharray: '4 4' }}
                content={<MonthlyProgressTooltip />}
              />
              <Line
                type="monotone"
                dataKey="appMigrated"
                name="APP Migrated (%)"
                stroke={lineColors.appMigrated}
                strokeWidth={2.5}
                dot={{ r: 4, fill: lineColors.appMigrated, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="bfWise"
                name="BF Wise Migrations (%)"
                stroke={lineColors.bfWise}
                strokeWidth={2.5}
                dot={{ r: 4, fill: lineColors.bfWise, stroke: '#fff', strokeWidth: 2 }}
                activeDot={{ r: 6, stroke: '#fff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="ghi-legend-row">
        <span className="ghi-legend-item">
          <i className="ghi-legend-line" style={{ background: lineColors.appMigrated }} />
          APP Migrated (%)
        </span>
        <span className="ghi-legend-item">
          <i className="ghi-legend-line" style={{ background: lineColors.bfWise }} />
          BF Wise Migrations (%)
        </span>
      </div>
    </section>
  );
}

function DashboardContent({ data }) {
  const {
    header,
    kpiCards,
    migrationStats,
    datacenterRows,
    datacenterTotal,
    businessUnits,
    businessUnitLegend,
    businessUnitStackOrder,
    businessUnitTooltipOrder,
    businessUnitXMax,
    monthlyProgress,
    lineChartColors,
  } = data;

  return (
    <div className="ghi-root">
      <div className="ghi-shell">
        <header className="ghi-topbar">
          <span className="ghi-topbar-left">Command Center</span>
          <div className="ghi-topbar-right">
            <span className="ghi-updated">Last Updated: {header.lastUpdated}</span>
            <span className="ghi-brand">{header.brand}</span>
          </div>
        </header>

        <div className="ghi-content">
          <nav className="ghi-breadcrumbs" aria-label="Breadcrumb">
            {header.breadcrumbs.map((crumb, index) => (
              <span key={crumb} className="ghi-breadcrumb-item">
                {index > 0 && <span className="ghi-breadcrumb-sep">&gt;</span>}
                <span className={index === header.breadcrumbs.length - 1 ? 'ghi-breadcrumb-current' : ''}>
                  {crumb}
                </span>
              </span>
            ))}
          </nav>

          <div className="ghi-title-block">
            <h1>{header.title}</h1>
            <p>{header.subtitle}</p>
          </div>

          <KpiCards cards={kpiCards} />

          <div className="ghi-main-grid">
            <DatacenterPanel stats={migrationStats} rows={datacenterRows} total={datacenterTotal} />
            <BusinessUnitChart
              data={businessUnits}
              legend={businessUnitLegend}
              stackOrder={businessUnitStackOrder}
              tooltipOrder={businessUnitTooltipOrder}
              xMax={businessUnitXMax}
            />
            <MonthlyProgressChart
              data={monthlyProgress}
              lineColors={lineChartColors}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardContent;
