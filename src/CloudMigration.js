import React, { useEffect, useRef, useState } from 'react';
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

const CLOUD_MIGRATION_DASHBOARD_JSON = `{
  "header": {
    "breadcrumbs": [
      "Dashboard",
      "Fast Dashboard",
      "Transform / Operational Excellence Program",
      "Cloud Migration V2"
    ],
    "title": "Cloud Migration V2",
    "subtitle": "Executive Initiative Scorecard - Q2 2026",
    "lastUpdated": "5/26/2026, 9:13:23 PM",
    "brand": "ADP"
  },
  "kpiCards": [
    {
      "title": "Migration Progress",
      "value": "16%",
      "valueTone": "green",
      "icon": "cloud",
      "iconTone": "blue"
    },
    {
      "title": "Risk and Compliance Score",
      "value": "90",
      "valueTone": "orange",
      "icon": "shield",
      "iconTone": "gold"
    },
    {
      "title": "Cloud Efficiency",
      "value": "With-in Budget",
      "valueTone": "green",
      "icon": "list",
      "iconTone": "green"
    }
  ],
  "migrationStats": [
    {
      "label": "Small App Migrations",
      "value": 814
    },
    {
      "label": "Medium & Large App Migrations",
      "value": 280
    },
    {
      "label": "Apps Missing DC Label",
      "value": 18
    }
  ],
  "datacenterRows": [
    {
      "location": "DC1 and 2",
      "apps": 597,
      "compliance": 14
    },
    {
      "location": "DC4 and 5",
      "apps": 303,
      "compliance": 8
    },
    {
      "location": "Roseland CDL",
      "apps": 73,
      "compliance": 1
    },
    {
      "location": "DC7a and DC7b",
      "apps": 34,
      "compliance": 47
    },
    {
      "location": "DC10 and DC11",
      "apps": 33,
      "compliance": 27
    },
    {
      "location": "DC12 and DC13",
      "apps": 23,
      "compliance": 100
    },
    {
      "location": "",
      "apps": 18,
      "compliance": 28
    },
    {
      "location": "DC14 and DC15",
      "apps": 8,
      "compliance": 100
    },
    {
      "location": "Not Applicable",
      "apps": 4,
      "compliance": 50
    },
    {
      "location": "N/A",
      "apps": 1,
      "compliance": 100
    }
  ],
  "datacenterTotal": {
    "apps": 1094,
    "compliance": 16
  },
  "chartColors": {
    "atRisk": "#B22222",
    "blank": "#FF0000",
    "complete": "#FFA500",
    "delayed": "#4169E1",
    "notInFlight": "#000000",
    "onTrack": "#00BFFF"
  },
  "businessUnitLegend": [
    {
      "key": "atRisk",
      "label": "At risk",
      "color": "#B22222"
    },
    {
      "key": "blank",
      "label": "Blank",
      "color": "#FF0000"
    },
    {
      "key": "complete",
      "label": "Complete",
      "color": "#FFA500"
    },
    {
      "key": "delayed",
      "label": "Delayed",
      "color": "#4169E1"
    },
    {
      "key": "notInFlight",
      "label": "Not in Flight",
      "color": "#000000"
    },
    {
      "key": "onTrack",
      "label": "On track",
      "color": "#00BFFF"
    }
  ],
  "businessUnitTooltipOrder": [
    "blank",
    "atRisk",
    "complete",
    "delayed",
    "notInFlight",
    "onTrack"
  ],
  "businessUnitStackOrder": [
    "atRisk",
    "blank",
    "complete",
    "delayed",
    "notInFlight",
    "onTrack"
  ],
  "businessUnitXMax": 500,
  "businessUnits": [
    {
      "name": "GETS",
      "atRisk": 48,
      "blank": 20,
      "complete": 140,
      "delayed": 30,
      "notInFlight": 190,
      "onTrack": 50
    },
    {
      "name": "ESI",
      "atRisk": 12,
      "blank": 18,
      "complete": 35,
      "delayed": 45,
      "notInFlight": 120,
      "onTrack": 20
    },
    {
      "name": "Nationals",
      "atRisk": 0,
      "blank": 33,
      "complete": 7,
      "delayed": 0,
      "notInFlight": 39,
      "onTrack": 1
    },
    {
      "name": "Majors & Canada",
      "atRisk": 8,
      "blank": 14,
      "complete": 18,
      "delayed": 6,
      "notInFlight": 22,
      "onTrack": 4
    },
    {
      "name": "SBS/RS/IS",
      "atRisk": 6,
      "blank": 12,
      "complete": 16,
      "delayed": 5,
      "notInFlight": 18,
      "onTrack": 3
    },
    {
      "name": "Smart Compliance Solutions",
      "atRisk": 5,
      "blank": 10,
      "complete": 14,
      "delayed": 4,
      "notInFlight": 15,
      "onTrack": 2
    },
    {
      "name": "TBD",
      "atRisk": 4,
      "blank": 9,
      "complete": 12,
      "delayed": 3,
      "notInFlight": 12,
      "onTrack": 2
    },
    {
      "name": "GSO",
      "atRisk": 3,
      "blank": 8,
      "complete": 10,
      "delayed": 3,
      "notInFlight": 10,
      "onTrack": 2
    },
    {
      "name": "Shared Applications",
      "atRisk": 2,
      "blank": 7,
      "complete": 8,
      "delayed": 2,
      "notInFlight": 8,
      "onTrack": 1
    },
    {
      "name": "Finance / Other",
      "atRisk": 2,
      "blank": 6,
      "complete": 7,
      "delayed": 2,
      "notInFlight": 6,
      "onTrack": 1
    },
    {
      "name": "HRO / PEO",
      "atRisk": 1,
      "blank": 5,
      "complete": 6,
      "delayed": 1,
      "notInFlight": 5,
      "onTrack": 1
    },
    {
      "name": "Product & Innovation / Data Cloud",
      "atRisk": 1,
      "blank": 4,
      "complete": 5,
      "delayed": 1,
      "notInFlight": 4,
      "onTrack": 1
    },
    {
      "name": "Service Delivery",
      "atRisk": 0,
      "blank": 3,
      "complete": 4,
      "delayed": 1,
      "notInFlight": 3,
      "onTrack": 1
    },
    {
      "name": "Employee Financial Solutions",
      "atRisk": 0,
      "blank": 2,
      "complete": 3,
      "delayed": 1,
      "notInFlight": 2,
      "onTrack": 1
    }
  ],
  "monthlyProgress": [
    {
      "month": "Jan-26",
      "appMigrated": 20,
      "bfWise": 19
    },
    {
      "month": "Feb-26",
      "appMigrated": 45,
      "bfWise": 43
    },
    {
      "month": "Mar-26",
      "appMigrated": 60,
      "bfWise": 58
    },
    {
      "month": "Apr-26",
      "appMigrated": 75,
      "bfWise": 73
    }
  ],
  "lineChartColors": {
    "appMigrated": "#00BFFF",
    "bfWise": "#4169E1"
  }
}`;

const DASHBOARD_DATA = JSON.parse(CLOUD_MIGRATION_DASHBOARD_JSON);

const STATUS_KEYS = DASHBOARD_DATA.businessUnitStackOrder;

function getLegendItem(legend, key) {
  return legend.find((item) => item.key === key);
}

function sumBusinessUnit(row) {
  return STATUS_KEYS.reduce((total, key) => total + (row[key] ?? 0), 0);
}

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

const DASHBOARD_STYLES = `
  @keyframes ghi-rise {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .ghi-root {
    min-height: 100vh;
    width: 100%;
    background: linear-gradient(180deg, #eef2f7 0%, #e8edf3 100%);
    color: #101828;
    font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }

  .ghi-root *, .ghi-root *::before, .ghi-root *::after { box-sizing: border-box; }

  .ghi-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  .ghi-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 12px 20px;
    background: rgba(255, 255, 255, 0.92);
    border-bottom: 1px solid #d8dee8;
    backdrop-filter: blur(10px);
    font-size: 12px;
    color: #475467;
    position: sticky;
    top: 0;
    z-index: 20;
  }

  .ghi-topbar-left {
    font-weight: 700;
    color: #1e293b;
    letter-spacing: 0.01em;
  }

  .ghi-topbar-right {
    display: flex;
    align-items: center;
    gap: 14px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .ghi-updated {
    color: #64748b;
    font-size: 11px;
  }

  .ghi-brand {
    font-weight: 800;
    letter-spacing: 0.06em;
    color: #d0272b;
    font-size: 18px;
  }

  .ghi-content {
    flex: 1;
    width: 100%;
    max-width: 1680px;
    margin: 0 auto;
    padding: 12px 14px 16px;
    animation: ghi-rise 0.45s ease both;
  }

  .ghi-breadcrumbs {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 6px;
    font-size: 11px;
    color: #667085;
    margin-bottom: 10px;
  }

  .ghi-breadcrumb-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .ghi-breadcrumb-sep {
    color: #98a2b3;
  }

  .ghi-breadcrumb-current {
    color: #1e293b;
    font-weight: 600;
  }

  .ghi-title-block h1 {
    margin: 0;
    font-size: clamp(24px, 2.6vw, 34px);
    line-height: 1.12;
    color: #1d4ed8;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .ghi-title-block p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #64748b;
  }

  .ghi-kpi-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 10px;
    margin: 12px 0 12px;
  }

  .ghi-kpi-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    padding: 12px 14px;
    min-height: 78px;
    box-shadow: none;
    transition: border-color 0.2s ease;
    animation: ghi-rise 0.5s ease both;
  }

  .ghi-kpi-card:hover {
    transform: none;
    box-shadow: none;
    border-color: #b8c4d9;
  }

  .ghi-kpi-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }

  .ghi-kpi-icon svg {
    width: 26px;
    height: 26px;
  }

  .ghi-kpi-icon-blue { background: rgba(29, 78, 216, 0.1); }
  .ghi-kpi-icon-green { background: rgba(2, 122, 72, 0.1); }
  .ghi-kpi-icon-gold { background: rgba(220, 104, 3, 0.12); }

  .ghi-kpi-label {
    display: block;
    font-size: 12px;
    color: #64748b;
    margin-bottom: 6px;
    font-weight: 500;
  }

  .ghi-kpi-value {
    font-size: clamp(24px, 2.4vw, 34px);
    line-height: 1.05;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .ghi-kpi-value-green { color: #027a48; }
  .ghi-kpi-value-orange { color: #dc6803; }

  .ghi-main-grid {
    display: grid;
    grid-template-columns: minmax(260px, 0.95fr) minmax(300px, 1.2fr) minmax(240px, 0.85fr);
    gap: 10px;
    align-items: start;
  }

  .ghi-main-grid > * {
    min-width: 0;
  }

  .ghi-panel-chart {
    min-width: 0;
    overflow: hidden;
  }

  .ghi-chart-frame,
  .ghi-chart-plot {
    width: 100%;
    min-width: 0;
    position: relative;
  }

  .ghi-chart-viewport {
    width: 100%;
    min-width: 0;
    overflow: auto;
    border: 1px solid #eaecf0;
    border-radius: 4px;
    background: #fff;
  }

  .ghi-chart-viewport::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  .ghi-chart-viewport::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 999px;
  }

  .ghi-panel {
    background: #fff;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    padding: 10px;
    min-width: 0;
    display: flex;
    flex-direction: column;
    box-shadow: none;
    animation: ghi-rise 0.55s ease both;
  }

  .ghi-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 6px;
    flex-wrap: wrap;
  }

  .ghi-panel-title {
    margin: 0;
    font-size: 12px;
    font-weight: 700;
    color: #1e293b;
  }

  .ghi-panel-title-blue {
    color: #1d4ed8;
    font-size: 12px;
    margin: 12px 0 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ghi-panel-tag {
    font-size: 10px;
    color: #64748b;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 999px;
    padding: 4px 8px;
    white-space: nowrap;
  }

  .ghi-panel-datacenter {
    padding: 10px;
    gap: 10px;
  }

  .ghi-dc-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }

  .ghi-dc-stat-card {
    background: #fff;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    padding: 8px 10px 10px;
    min-height: 0;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: 4px;
    animation: ghi-rise 0.45s ease both;
    transition: border-color 0.2s ease;
  }

  .ghi-dc-stat-card:hover {
    border-color: #b8c4d9;
    box-shadow: none;
  }

  .ghi-dc-stat-label {
    display: block;
    font-size: 10px;
    line-height: 1.25;
    color: #667085;
    font-weight: 500;
    min-height: 0;
  }

  .ghi-dc-stat-value {
    font-size: 22px;
    line-height: 1;
    color: #2563eb;
    font-weight: 800;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .ghi-dc-table-section {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .ghi-dc-table-title {
    margin: 0;
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: #0f172a;
  }

  .ghi-dc-table-shell {
    overflow: auto;
    border: 1px solid #d0d5dd;
    border-radius: 6px;
    background: #fff;
  }

  .ghi-dc-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    font-size: 11px;
    table-layout: fixed;
  }

  .ghi-dc-table thead th {
    background: #2563eb;
    color: #fff;
    padding: 6px 8px;
    font-size: 11px;
    font-weight: 700;
    white-space: nowrap;
    border-bottom: 1px solid #1d4ed8;
  }

  .ghi-dc-table thead th:first-child {
    border-top-left-radius: 9px;
  }

  .ghi-dc-table thead th:last-child {
    border-top-right-radius: 9px;
  }

  .ghi-dc-col-location {
    width: 46%;
    text-align: left;
  }

  .ghi-dc-col-apps {
    width: 27%;
    text-align: center;
  }

  .ghi-dc-col-compliance {
    width: 27%;
    text-align: center;
  }

  .ghi-dc-table tbody td {
    padding: 5px 8px;
    border-bottom: 1px solid #eaecf0;
    color: #334155;
    vertical-align: middle;
    line-height: 1.2;
  }

  .ghi-dc-table tbody tr:last-child td {
    border-bottom: none;
  }

  .ghi-dc-table tbody tr:hover td {
    background: #f8fbff;
  }

  .ghi-dc-num {
    font-variant-numeric: tabular-nums;
    font-weight: 600;
    color: #1e293b;
  }

  .ghi-compliance {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 40px;
    padding: 2px 7px;
    border-radius: 999px;
    font-weight: 700;
    font-size: 10px;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }

  .ghi-compliance-bold {
    font-size: 10px;
    min-width: 42px;
    padding: 2px 7px;
  }

  .ghi-compliance-high {
    background: #dcfce7;
    color: #166534;
  }

  .ghi-compliance-mid {
    background: #ffedd5;
    color: #9a3412;
  }

  .ghi-compliance-low {
    background: #fee2e2;
    color: #991b1b;
  }

  .ghi-dc-table-total td {
    background: #eef4ff !important;
    font-weight: 800;
    color: #0f172a;
    border-top: 1px solid #dbeafe;
    padding-top: 6px;
    padding-bottom: 6px;
  }

  .ghi-dc-table-total td:first-child {
    border-bottom-left-radius: 9px;
  }

  .ghi-dc-table-total td:last-child {
    border-bottom-right-radius: 9px;
  }

  .ghi-panel-chart {
    min-height: 0;
  }

  .ghi-chart-frame {
    width: 100%;
  }

  .ghi-legend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 10px;
    margin-top: 6px;
    padding-top: 6px;
    border-top: 1px solid #edf2f7;
    font-size: 9px;
    color: #475467;
  }

  .ghi-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    white-space: nowrap;
  }

  .ghi-legend-item i {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
    flex-shrink: 0;
  }

  .ghi-legend-line {
    width: 18px !important;
    height: 3px !important;
    border-radius: 2px !important;
  }

  .ghi-chart-tooltip {
    background: rgba(255, 255, 255, 0.98);
    border: 1px solid #d0d7e2;
    border-radius: 10px;
    padding: 0;
    font-size: 11px;
    color: #334155;
    box-shadow: 0 16px 40px rgba(15, 23, 42, 0.14);
    min-width: 190px;
    overflow: hidden;
    pointer-events: none;
  }

  .ghi-tooltip-head {
    padding: 10px 12px 8px;
    background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .ghi-tooltip-kicker {
    display: block;
    font-size: 10px;
    color: #64748b;
    margin-bottom: 2px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .ghi-tooltip-head strong {
    display: block;
    font-size: 13px;
    color: #0f172a;
  }

  .ghi-tooltip-rows {
    padding: 8px 12px;
    display: grid;
    gap: 6px;
  }

  .ghi-tooltip-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .ghi-tooltip-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: #475467;
  }

  .ghi-tooltip-label i {
    width: 9px;
    height: 9px;
    border-radius: 2px;
    flex-shrink: 0;
  }

  .ghi-tooltip-value {
    font-weight: 700;
    color: #0f172a;
    font-variant-numeric: tabular-nums;
  }

  .ghi-tooltip-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px 10px;
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
    font-weight: 600;
  }

  .ghi-tooltip-footer strong {
    color: #1d4ed8;
    font-size: 13px;
  }

  @media (max-width: 1400px) {
    .ghi-main-grid {
      grid-template-columns: minmax(260px, 1fr) minmax(280px, 1.1fr);
    }

    .ghi-main-grid .ghi-panel-chart:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 1024px) {
    .ghi-main-grid {
      grid-template-columns: 1fr;
    }

    .ghi-kpi-row {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 768px) {
    .ghi-content {
      padding: 12px 12px 20px;
    }

    .ghi-kpi-row {
      grid-template-columns: 1fr;
    }

    .ghi-dc-stats {
      grid-template-columns: 1fr;
    }

    .ghi-dc-stat-card {
      min-height: 76px;
    }

    .ghi-dc-table {
      font-size: 11px;
      table-layout: auto;
      min-width: 320px;
    }

    .ghi-dc-table thead th,
    .ghi-dc-table tbody td {
      padding: 9px 10px;
    }

    .ghi-topbar {
      padding: 10px 12px;
    }

    .ghi-brand {
      font-size: 16px;
    }
  }

  @media (max-width: 480px) {
    .ghi-title-block h1 {
      font-size: 22px;
    }

    .ghi-kpi-value {
      font-size: 24px;
    }

    .ghi-panel {
      padding: 12px;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const CloudMigration = () => (
  <>
    <style>{DASHBOARD_STYLES}</style>
    <DashboardContent data={DASHBOARD_DATA} />
  </>
);

export default CloudMigration;
export { CLOUD_MIGRATION_DASHBOARD_JSON, DASHBOARD_DATA };
