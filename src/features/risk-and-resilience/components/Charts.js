import React, { useEffect, useState } from 'react';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  ReferenceLine,
  LabelList,
  Tooltip,
} from 'recharts';

import { useChartResponsive } from '../hooks/useChartResponsive.js';
import { CHART_KEYS, CHART_DELAYS } from '../data/dashboardData.js';

const createChartDataLabel = (colors) => ({ x, y, value }) => {
  if (value == null || value === 0) return null;
  return (
    <text x={x} y={y - 8} fill={colors.textDark} fontSize={9} fontWeight={600} textAnchor="middle">
      {Number(value).toFixed(2)}
    </text>
  );
};

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="pr-tooltip">
      <div className="pr-tooltip-inner">
        <div className="pr-tooltip-label">{label}</div>
        {payload.map((entry) => (
          <div className="pr-tooltip-row" key={entry.dataKey}>
            <span className="pr-tooltip-dot" style={{ background: entry.color }} />
            <span className="pr-tooltip-name">{entry.name}</span>
            <span className="pr-tooltip-value">{Number(entry.value).toFixed(2)} hrs</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChartLegend({ colors }) {
  return (
    <div className="pr-chart-legend">
      <div className="pr-legend-item">
        <span className="pr-legend-line" style={{ background: colors.fy25Line }} />
        FY25
      </div>
      <div className="pr-legend-item">
        <span className="pr-legend-line" style={{ background: colors.fy26Line }} />
        FY26
      </div>
      <div className="pr-legend-item">
        <span className="pr-legend-line" style={{ background: colors.goalLine }} />
        Goal
      </div>
    </div>
  );
}

function TrendChart({ config, colors, delay = 0, chartKey }) {
  const r = useChartResponsive();

  return (
    <div
      className={`pr-chart-panel pr-chart-${chartKey}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pr-stat-row">
        <div className="pr-stat-cell gray">FY25: {config.headerStats.fy25}</div>
        <div className="pr-stat-cell gray">FY25 (Jul-Mar): {config.headerStats.fy25JulMar}</div>
      </div>
      <div className="pr-stat-row">
        <div className="pr-stat-cell orange">FY26 Goal: {config.headerStats.fy26Goal}</div>
        <div className="pr-stat-cell orange">FY26 Current: {config.headerStats.fy26Current}</div>
      </div>
      <div className="pr-chart-title">{config.title}</div>
      <div className="pr-chart-body">
        <ResponsiveContainer width="100%" height={r.chartHeight}>
          <LineChart data={config.data} margin={r.chartMargin}>
            <CartesianGrid stroke="#e4e7ec" strokeDasharray="4 4" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: r.tickSize, fill: colors.textMuted }}
              axisLine={{ stroke: '#d0d5dd' }}
              tickLine={false}
              angle={r.xAxisAngle}
              textAnchor={r.xAxisAngle ? 'end' : 'middle'}
              height={r.xAxisHeight}
              interval={0}
            />
            <YAxis
              domain={[0, config.yMax]}
              tick={{ fontSize: r.tickSize, fill: colors.textMuted }}
              axisLine={{ stroke: '#d0d5dd' }}
              tickLine={false}
              width={r.yAxisWidth}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ stroke: colors.headerOrange, strokeWidth: 1, strokeDasharray: '4 4', opacity: 0.45 }}
              wrapperStyle={{ outline: 'none', zIndex: 20 }}
            />
            <ReferenceLine
              y={config.goal}
              stroke={colors.goalLine}
              strokeWidth={2.5}
              strokeDasharray="6 4"
              label={r.showLabels ? { value: 'Goal', position: 'insideTopRight', fill: colors.goalLine, fontSize: 10 } : undefined}
            />
            <Line
              type="monotone"
              dataKey="fy25"
              name="FY25"
              stroke={colors.fy25Line}
              strokeWidth={r.strokeWidth}
              dot={{ r: r.dotSize, fill: colors.fy25Line, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: r.activeDotSize, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1400}
              animationEasing="ease-out"
            >
              {r.showLabels && <LabelList dataKey="fy25" content={createChartDataLabel(colors)} />}
            </Line>
            <Line
              type="monotone"
              dataKey="fy26"
              name="FY26"
              stroke={colors.fy26Line}
              strokeWidth={r.strokeWidth}
              dot={{ r: r.dotSize, fill: colors.fy26Line, stroke: '#fff', strokeWidth: 2 }}
              activeDot={{ r: r.activeDotSize, stroke: '#fff', strokeWidth: 2 }}
              animationDuration={1600}
              animationEasing="ease-out"
            >
              {r.showLabels && <LabelList dataKey="fy26" content={createChartDataLabel(colors)} />}
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend colors={colors} />
      <div className="pr-fytd" style={{ color: colors[config.fytdColorKey] }}>
        Fiscal Year to Date: {config.fytdPercent}
      </div>
    </div>
  );
}

function ReadinessThresholdCards({ cards }) {
  return (
    <div className="pr-readiness-row">
      {cards.map((card, index) => (
        <article
          key={card.title}
          className="pr-readiness-card"
          style={{ '--accent': card.accent, animationDelay: `${320 + index * 60}ms` }}
        >
          <h3 className="pr-readiness-card-title">{card.title}</h3>
          <ul className="pr-readiness-list">
            {card.rows.map((row) => (
              <li key={`${card.title}-${row.condition}`}>
                <span className="pr-readiness-condition">{row.condition}</span>
                <span className={`pr-readiness-status ${row.tone}`}>{row.status}</span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}

function TrendingCharts({ charts, colors }) {
  return (
    <section className="pr-charts-section">
      <div className="pr-content-inner">
        <div className="pr-charts-heading">
          <div>
            <h2>Trend Analysis</h2>
            <p>Month-over-month resiliency performance vs goals</p>
          </div>
          <span className="pr-charts-tag">FY25 · FY26 · Goal</span>
        </div>
        <div className="pr-charts-row">
          {CHART_KEYS.map((key) => (
            <TrendChart
              key={key}
              chartKey={key}
              config={charts[key]}
              colors={colors}
              delay={CHART_DELAYS[key]}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export { createChartDataLabel, ChartTooltip, ChartLegend, TrendChart, ReadinessThresholdCards, TrendingCharts };
