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

const RISK_AND_RESILIENCE_DASHBOARD_JSON = `{
  "header": {
    "title": "Product Resiliency: ADP Wide Metrics FYTD March 2026",
    "subtitle": "Enterprise Operations Dashboard · Real-time Resiliency Intelligence"
  },
  "colors": {
    "headerOrange": "#0000ab",
    "headerOrangeDark": "#000080",
    "green": "#027a48",
    "red": "#b42318",
    "fy25Line": "#1d2939",
    "fy26Line": "#8b1a1a",
    "goalLine": "#daa520",
    "textDark": "#101828",
    "textMuted": "#667085"
  },
  "metricsSection": {
    "title": "Metrics"
  },
  "metricCards": [
    {
      "type": "availability",
      "title": "Client Availability",
      "description": "Uptime across all client-facing services",
      "value": 99.9964,
      "decimals": 4,
      "suffix": "%",
      "valueColor": "#027a48",
      "accent": "#027a48",
      "icon": "shield",
      "thresholdLegend": "Threshold: Red <99.90%, Yellow 99.90% to <99.99%, Green 99.99%+"
    },
    {
      "type": "count",
      "title": "Critical Incident Volume",
      "description": "Total critical incidents reported",
      "value": 29,
      "valueLabel": "Total Count",
      "accent": "#0000ab",
      "icon": "alert"
    },
    {
      "type": "count",
      "title": "Critical Incidents Due to Change",
      "description": "Incidents triggered by system changes",
      "value": 16,
      "valueLabel": "Count",
      "accent": "#b42318",
      "icon": "change"
    },
    {
      "type": "kpi",
      "title": "SLA Compliance",
      "description": "SLA adherence over the last four weeks",
      "value": 90,
      "suffix": "%",
      "caption": "Last Weeks",
      "accent": "#059669",
      "icon": "compliance"
    },
    {
      "type": "time",
      "title": "Mean Time to Detect",
      "description": "Average and median detection time",
      "meanValue": "4.38 Hrs.",
      "medianLabel": "Median time to Detect",
      "medianValue": "0.85 Hrs.",
      "accent": "#1d4ed8",
      "icon": "detect"
    },
    {
      "type": "time",
      "title": "Mean Time to Engage",
      "description": "Average and median engagement time",
      "meanValue": "1.71 Hrs.",
      "medianLabel": "Median Time to Engage",
      "medianValue": "0.78 Hrs.",
      "accent": "#7c3aed",
      "icon": "engage"
    },
    {
      "type": "time",
      "title": "Mean Time to Resolve",
      "description": "Average and median resolution time",
      "meanValue": "12.15 Hrs.",
      "medianLabel": "Median Time to Resolve",
      "medianValue": "7.10 Hrs.",
      "accent": "#0d9488",
      "icon": "resolve"
    },
    {
      "type": "kpi",
      "title": "Open Incidents",
      "description": "Currently open incidents across all services",
      "value": 12,
      "accent": "#dc6803",
      "icon": "incidents",
      "trend": {
        "direction": "down",
        "value": "14%",
        "label": "vs Previous Quarter"
      }
    }
  ],
  "readinessCards": [
    {
      "title": "Resilience Readiness",
      "accent": "#0000ab",
      "rows": [
        {
          "condition": "≥90% coverage",
          "status": "On Track",
          "tone": "on-track"
        },
        {
          "condition": "75–89%",
          "status": "At Risk",
          "tone": "at-risk"
        },
        {
          "condition": "<75%",
          "status": "Off Track",
          "tone": "off-track"
        }
      ]
    },
    {
      "title": "Recovery Performance",
      "accent": "#1d4ed8",
      "rows": [
        {
          "condition": "≥95% objectives met",
          "status": "On Track",
          "tone": "on-track"
        },
        {
          "condition": "85–94%",
          "status": "At Risk",
          "tone": "at-risk"
        },
        {
          "condition": "<85%",
          "status": "Off Track",
          "tone": "off-track"
        }
      ]
    },
    {
      "title": "Protection Compliance",
      "accent": "#0d9488",
      "rows": [
        {
          "condition": "≥95% compliant",
          "status": "On Track",
          "tone": "on-track"
        },
        {
          "condition": "85–94%",
          "status": "At Risk",
          "tone": "at-risk"
        },
        {
          "condition": "<85%",
          "status": "Off Track",
          "tone": "off-track"
        }
      ]
    }
  ],
  "charts": {
    "mttd": {
      "title": "Mean Time to Detect (hrs)",
      "goal": 7.42,
      "yMax": 18,
      "fytdPercent": "41.39%",
      "fytdColorKey": "green",
      "headerStats": {
        "fy25": "8.73 hrs",
        "fy25JulMar": "9.47 hrs",
        "fy26Goal": "7.42 hrs",
        "fy26Current": "5.55 hrs"
      },
      "data": [
        {
          "month": "Jul",
          "fy25": 3.85,
          "fy26": 2.77
        },
        {
          "month": "Aug",
          "fy25": 6.63,
          "fy26": 6.26
        },
        {
          "month": "Sep",
          "fy25": 7.1,
          "fy26": 4.72
        },
        {
          "month": "Oct",
          "fy25": 9.91,
          "fy26": 8.39
        },
        {
          "month": "Nov",
          "fy25": 16.27,
          "fy26": 8.79
        },
        {
          "month": "Dec",
          "fy25": 10.04,
          "fy26": 4.05
        },
        {
          "month": "Jan",
          "fy25": 8.24,
          "fy26": 1.65
        },
        {
          "month": "Feb",
          "fy25": 7.34,
          "fy26": 6.1
        },
        {
          "month": "Mar",
          "fy25": 4.38,
          "fy26": 3.65
        }
      ]
    },
    "mtte": {
      "title": "Mean Time to Engage (hrs)",
      "goal": 2.47,
      "yMax": 18,
      "fytdPercent": "12.46%",
      "fytdColorKey": "red",
      "headerStats": {
        "fy25": "2.90 hrs",
        "fy25JulMar": "3.53 hrs",
        "fy26Goal": "2.47 hrs",
        "fy26Current": "3.97 hrs"
      },
      "data": [
        {
          "month": "Jul",
          "fy25": 3.08,
          "fy26": 2.17
        },
        {
          "month": "Aug",
          "fy25": 4.37,
          "fy26": 1.59
        },
        {
          "month": "Sep",
          "fy25": 6.2,
          "fy26": 0.68
        },
        {
          "month": "Oct",
          "fy25": 1.23,
          "fy26": 6.2
        },
        {
          "month": "Nov",
          "fy25": 6.15,
          "fy26": 2.62
        },
        {
          "month": "Dec",
          "fy25": 3.61,
          "fy26": 2.04
        },
        {
          "month": "Jan",
          "fy25": 0.83,
          "fy26": 5.43
        },
        {
          "month": "Feb",
          "fy25": 14.39,
          "fy26": 2.4
        },
        {
          "month": "Mar",
          "fy25": 1.71,
          "fy26": 7.5
        }
      ]
    },
    "mttr": {
      "title": "Mean Time to Restore (hrs)",
      "goal": 19.43,
      "yMax": 36,
      "fytdPercent": "10.21%",
      "fytdColorKey": "green",
      "headerStats": {
        "fy25": "22.86 hrs",
        "fy25JulMar": "22.88 hrs",
        "fy26Goal": "19.43 hrs",
        "fy26Current": "20.52 hrs"
      },
      "data": [
        {
          "month": "Jul",
          "fy25": 12.26,
          "fy26": 17.97
        },
        {
          "month": "Aug",
          "fy25": 18.38,
          "fy26": 29.97
        },
        {
          "month": "Sep",
          "fy25": 10.34,
          "fy26": 13.26
        },
        {
          "month": "Oct",
          "fy25": 21.6,
          "fy26": 29.18
        },
        {
          "month": "Nov",
          "fy25": 25.33,
          "fy26": 18.46
        },
        {
          "month": "Dec",
          "fy25": 18.19,
          "fy26": 19.23
        },
        {
          "month": "Jan",
          "fy25": 21.1,
          "fy26": 6.15
        },
        {
          "month": "Feb",
          "fy25": 21.34,
          "fy26": 34.38
        },
        {
          "month": "Mar",
          "fy25": 12.79,
          "fy26": 22.15
        }
      ]
    }
  },
  "footer": {
    "note": "Gold line represents FY26 Goal; Rose line represents FY26 Current.",
    "goalLabel": "FY26 Goal",
    "currentLabel": "FY26 Current",
    "brand": "ADP"
  }
}`;

const DASHBOARD_DATA = JSON.parse(RISK_AND_RESILIENCE_DASHBOARD_JSON);

const CHART_KEYS = ['mttd', 'mtte', 'mttr'];
const CHART_DELAYS = { mttd: 450, mtte: 520, mttr: 590 };

const DASHBOARD_STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { min-height: 100vh; width: 100%; }
  body {
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #eef1f5;
    overflow-x: hidden;
  }

  @keyframes pr-fade-up {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes pr-strip-rise {
    from { opacity: 0; transform: translateY(10px) scale(0.98); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes pr-strip-shine {
    0% { transform: translateX(-120%) skewX(-12deg); opacity: 0; }
    40% { opacity: 0.6; }
    100% { transform: translateX(220%) skewX(-12deg); opacity: 0; }
  }
  .pr-root {
    min-height: 100vh;
    width: 100%;
    padding: 0;
    font-family: 'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif;
    background: #f4f5f7;
    color: #101828;
    position: relative;
    overflow-x: hidden;
  }

  .pr-root::before,
  .pr-root::after {
    display: none;
  }

  .pr-root *, .pr-root *::before, .pr-root *::after { box-sizing: border-box; }

  .pr-shell {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: none;
    min-height: 100vh;
    margin: 0;
    background: #fff;
    border: none;
    border-radius: 0;
    overflow: hidden;
    box-shadow: none;
    animation: pr-fade-up 0.7s ease both;
    display: flex;
    flex-direction: column;
  }

  .pr-header-banner {
    position: relative;
    background: linear-gradient(135deg, #0000ab 0%, #000080 100%);
    padding: 16px 0;
    overflow: hidden;
    width: 100%;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .pr-header-banner::before,
  .pr-header-banner::after {
    display: none;
  }

  .pr-header-accent {
    display: none;
  }

  .pr-header {
    position: relative;
    z-index: 1;
    animation: pr-fade-up 0.6s ease both;
  }

  .pr-header-left h1 {
    margin: 0;
    font-size: clamp(15px, 2.2vw, 20px);
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    line-height: 1.3;
  }

  .pr-header-left p {
    margin: 6px 0 0;
    font-size: clamp(11px, 1.4vw, 13px);
    color: rgba(255, 255, 255, 0.85);
    letter-spacing: 0.2px;
  }

  .pr-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .pr-content-inner {
    width: 100%;
    max-width: 1440px;
    margin: 0 auto;
    padding: 0 22px;
  }

  .pr-metrics-section {
    padding: 16px 0 20px;
    border-bottom: 1px solid #eaecf0;
    background: #fff;
    width: 100%;
    position: relative;
  }

  .pr-metrics-section .pr-content-inner {
    padding-top: 0;
    padding-bottom: 0;
    max-width: min(1920px, 100%);
  }

  .pr-metrics-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
    overscroll-behavior-x: contain;
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scroll-padding-inline: clamp(12px, 2vw, 22px);
    scrollbar-width: thin;
    padding-bottom: 2px;
  }

  .pr-metrics-scroll::-webkit-scrollbar {
    height: 6px;
  }

  .pr-metrics-scroll::-webkit-scrollbar-thumb {
    background: rgba(102, 112, 133, 0.35);
    border-radius: 999px;
  }

  .pr-metrics-grid {
    display: block;
    min-width: 0;
  }

  .pr-metrics-row {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: clamp(8px, 0.85vw, 12px);
    align-items: stretch;
    width: 100%;
    min-width: 0;
  }

  .pr-metrics-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
    flex-wrap: wrap;
    padding-bottom: 8px;
    border-bottom: 1px solid #eef2f6;
    transition: border-color 0.3s ease;
  }

  .pr-metrics-heading:hover { border-color: #e4e7ec; }

  .pr-metrics-heading-left h2 {
    margin: 0;
    font-size: clamp(14px, 1.6vw, 16px);
    font-weight: 600;
    color: #344054;
    letter-spacing: -0.1px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pr-metrics-heading-left h2::before {
    content: '';
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: #0000ab;
    flex-shrink: 0;
  }

  .pr-readiness-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: clamp(12px, 1.2vw, 16px);
    margin-top: 0;
    margin-bottom: clamp(14px, 1.5vw, 18px);
    width: 100%;
    min-width: 0;
    align-items: stretch;
  }

  .pr-readiness-card {
    position: relative;
    border: 1px solid #eaecf0;
    border-radius: 12px;
    background: #fff;
    padding: clamp(14px, 1.2vw, 18px) clamp(14px, 1.3vw, 20px);
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05);
    min-width: 0;
    animation: pr-strip-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
    --accent: #0000ab;
    overflow: hidden;
  }

  .pr-readiness-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent);
    opacity: 0.85;
  }

  .pr-readiness-card:hover {
    border-color: color-mix(in srgb, var(--accent) 28%, #eaecf0);
    box-shadow: 0 4px 14px rgba(16, 24, 40, 0.08);
    transform: translateY(-2px);
  }

  .pr-readiness-card-title {
    margin: 0 0 clamp(10px, 1vw, 12px);
    padding-bottom: 8px;
    border-bottom: 1px solid #eef2f6;
    font-size: clamp(12px, 1.05vw, 14px);
    font-weight: 700;
    color: #101828;
    letter-spacing: -0.15px;
    line-height: 1.35;
  }

  .pr-readiness-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: clamp(7px, 0.75vw, 10px);
  }

  .pr-readiness-list li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    min-width: 0;
  }

  .pr-readiness-condition {
    font-size: clamp(10px, 0.82vw, 12px);
    font-weight: 500;
    color: #344054;
    line-height: 1.35;
    min-width: 0;
  }

  .pr-readiness-status {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: clamp(9px, 0.72vw, 10px);
    font-weight: 700;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }

  .pr-readiness-status.on-track {
    background: #ecfdf3;
    color: #027a48;
    border: 1px solid #abefc6;
  }

  .pr-readiness-status.at-risk {
    background: #fffaeb;
    color: #b54708;
    border: 1px solid #fedf89;
  }

  .pr-readiness-status.off-track {
    background: #fef3f2;
    color: #b42318;
    border: 1px solid #fecdca;
  }

  .pr-metric-card {
    position: relative;
    padding: clamp(10px, 1vw, 14px) clamp(10px, 1.05vw, 14px);
    display: flex;
    flex-direction: column;
    gap: clamp(6px, 0.7vw, 10px);
    border-radius: 12px;
    border: 1px solid #eaecf0;
    background: #fff;
    box-shadow: 0 1px 3px rgba(16, 24, 40, 0.05);
    min-height: clamp(118px, 11vw, 138px);
    height: 100%;
    min-width: 0;
    scroll-snap-align: start;
    cursor: default;
    animation: pr-strip-rise 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
    transition:
      background 0.22s ease,
      box-shadow 0.22s ease,
      border-color 0.22s ease,
      transform 0.22s ease;
    --accent: #667085;
    overflow: hidden;
  }

  .pr-metric-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: var(--accent);
    opacity: 0;
    transition: opacity 0.22s ease;
  }

  .pr-metric-card::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.7) 50%, transparent 70%);
    transform: translateX(-110%);
    pointer-events: none;
    opacity: 0;
  }

  .pr-metric-card:hover {
    background: #fafbfc;
    border-color: color-mix(in srgb, var(--accent) 22%, #eaecf0);
    box-shadow: 0 4px 14px rgba(16, 24, 40, 0.08);
    transform: translateY(-2px);
    z-index: 2;
  }

  .pr-metric-card:hover::before {
    opacity: 1;
  }

  .pr-metric-card:hover::after {
    opacity: 1;
    animation: pr-strip-shine 0.55s ease;
  }

  .pr-metric-card-header {
    display: flex;
    align-items: flex-start;
    gap: clamp(6px, 0.65vw, 8px);
    min-width: 0;
    position: relative;
    z-index: 1;
  }

  .pr-metric-card-icon {
    width: clamp(26px, 2.2vw, 30px);
    height: clamp(26px, 2.2vw, 30px);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: color-mix(in srgb, var(--accent) 10%, white);
    color: var(--accent);
    flex-shrink: 0;
    border: 1px solid color-mix(in srgb, var(--accent) 18%, transparent);
    transition: transform 0.22s ease, background 0.22s ease, box-shadow 0.22s ease;
  }

  .pr-metric-card-icon svg { width: clamp(13px, 1.2vw, 15px); height: clamp(13px, 1.2vw, 15px); display: block; }

  .pr-metric-card:hover .pr-metric-card-icon {
    transform: scale(1.08);
    background: color-mix(in srgb, var(--accent) 14%, white);
    box-shadow: 0 2px 8px color-mix(in srgb, var(--accent) 18%, transparent);
  }

  .pr-metric-card-label {
    font-size: clamp(9px, 0.72vw, 11px);
    font-weight: 600;
    color: #344054;
    line-height: 1.35;
    transition: color 0.25s ease;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
    min-width: 0;
  }

  .pr-metric-card:hover .pr-metric-card-label { color: #101828; }

  .pr-metric-card-body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    justify-content: space-between;
  }

  .pr-metric-card-footer {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-height: 0;
    justify-content: flex-end;
  }

  .pr-metric-card-value-row {
    display: flex;
    align-items: baseline;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pr-metric-card-value {
    font-size: clamp(15px, 1.45vw, 22px);
    font-weight: 700;
    color: #101828;
    letter-spacing: -0.35px;
    line-height: 1.1;
    transition: color 0.22s ease;
    word-break: break-word;
  }

  .pr-metric-card:hover .pr-metric-card-value {
    color: var(--accent);
  }

  .pr-metric-card-sub {
    font-size: 10px;
    font-weight: 600;
    color: #98a2b3;
    transition: color 0.25s ease;
  }

  .pr-metric-card:hover .pr-metric-card-sub { color: #667085; }

  .pr-metric-card-badge {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.3px;
    text-transform: uppercase;
    background: #ecfdf3;
    color: #027a48;
    border: 1px solid #abefc6;
  }

  .pr-metric-card-badge.warning { background: #fffaeb; color: #b54708; border-color: #fedf89; }
  .pr-metric-card-badge.danger { background: #fef3f2; color: #b42318; border-color: #fecdca; }

  .pr-metric-card-bar {
    height: 4px;
    border-radius: 999px;
    background: #f2f4f7;
    overflow: hidden;
    position: relative;
    z-index: 1;
  }

  .pr-metric-card-bar-fill {
    height: 100%;
    border-radius: 999px;
    background: color-mix(in srgb, var(--accent) 85%, white);
    transition: width 0.8s ease, background 0.22s ease;
  }

  .pr-metric-card:hover .pr-metric-card-bar-fill {
    background: var(--accent);
  }

  .pr-metric-card-caption {
    font-size: clamp(8px, 0.62vw, 10px);
    font-weight: 600;
    color: #667085;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .pr-metric-card-threshold-legend {
    font-size: clamp(7px, 0.58vw, 9px);
    font-weight: 500;
    color: #667085;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    overflow: hidden;
  }

  .pr-metric-card-value.is-green {
    color: #027a48;
  }

  .pr-metric-card:hover .pr-metric-card-value.is-green {
    color: #027a48;
  }

  .pr-metric-card-trend {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    font-size: clamp(8px, 0.62vw, 10px);
    font-weight: 600;
    line-height: 1.25;
    flex-wrap: wrap;
  }

  .pr-metric-card-trend.down { color: #027a48; }
  .pr-metric-card-trend.up { color: #b42318; }

  .pr-metric-card-trend svg {
    width: 12px;
    height: 12px;
    flex-shrink: 0;
  }

  .pr-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 14px 0 16px;
    font-size: 11px;
    color: #667085;
    background: #fff;
    border-top: 1px solid #eaecf0;
    flex-wrap: wrap;
    margin-top: auto;
    width: 100%;
  }

  .pr-footer::before,
  .pr-footer::after {
    display: none;
  }

  .pr-footer .pr-content-inner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    width: 100%;
    position: relative;
    z-index: 1;
  }

  .pr-footer-note {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pr-footer-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px;
    border-radius: 6px;
    background: #f9fafb;
    border: 1px solid #eaecf0;
    font-size: 10px;
    cursor: default;
  }

  .pr-footer-badge::before {
    display: none;
  }

  .pr-footer-badge:hover {
    border-color: #d0d5dd;
    background: #f2f4f7;
    transform: none;
    box-shadow: none;
  }

  .pr-logo {
    font-weight: 800;
    font-size: clamp(16px, 2.2vw, 22px);
    color: #0000ab;
    letter-spacing: 1px;
    font-style: italic;
    cursor: default;
  }

  .pr-logo:hover {
    color: #000066;
  }

  @media (max-width: 1400px) {
    .pr-metrics-row {
      grid-template-columns: repeat(8, minmax(132px, 1fr));
      min-width: max(100%, 1120px);
    }
    .pr-readiness-row { gap: 12px; }
  }

  @media (max-width: 1200px) {
    .pr-metrics-row {
      grid-template-columns: repeat(8, minmax(148px, 1fr));
      min-width: max(100%, 1240px);
    }
    .pr-readiness-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .pr-readiness-row > .pr-readiness-card:last-child {
      grid-column: 1 / -1;
    }
  }

  @media (max-width: 992px) {
    .pr-metrics-row {
      grid-template-columns: repeat(8, minmax(156px, 1fr));
      min-width: max(100%, 1300px);
    }
  }

  @media (max-width: 768px) {
    .pr-content-inner { padding: 0 14px; }
    .pr-header-banner { padding: 16px 0; }
    .pr-metrics-section { padding: 12px 0 16px; }
    .pr-metrics-row {
      gap: 10px;
      grid-template-columns: repeat(8, minmax(142px, 1fr));
      min-width: max(100%, 1180px);
    }
    .pr-readiness-row {
      grid-template-columns: 1fr;
      margin-top: 0;
      margin-bottom: 12px;
      gap: 12px;
    }
    .pr-readiness-row > .pr-readiness-card:last-child {
      grid-column: auto;
    }
    .pr-metric-card { min-height: 124px; }
    .pr-footer { flex-direction: column; text-align: center; }
    .pr-footer .pr-content-inner { flex-direction: column; text-align: center; }
    .pr-footer-note { justify-content: center; }
  }

  @media (max-width: 576px) {
    .pr-metrics-row {
      grid-template-columns: repeat(8, minmax(128px, 1fr));
      min-width: max(100%, 1060px);
    }
    .pr-metric-card-value { font-size: 15px; }
  }

  @media (max-width: 480px) {
    .pr-content-inner { padding: 0 10px; }
    .pr-header-left h1 { font-size: 14px; }
    .pr-metrics-row {
      grid-template-columns: repeat(8, minmax(118px, 1fr));
      min-width: max(100%, 980px);
    }
  }

  @media (hover: none) {
    .pr-metric-card:hover {
      background: inherit;
      box-shadow: none;
      transform: none;
    }
    .pr-metric-card:hover::before { opacity: inherit; }
    .pr-metric-card:hover::after { animation: none; opacity: 0; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  .pr-charts-section {
    width: 100%;
    padding: 16px 0 20px;
    background: #f4f5f7;
    flex: 1;
    position: relative;
  }

  .pr-charts-heading {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eaecf0;
  }

  .pr-charts-heading h2 {
    margin: 0;
    font-size: clamp(14px, 1.6vw, 16px);
    font-weight: 600;
    color: #344054;
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: -0.1px;
  }

  .pr-charts-heading h2::before {
    content: '';
    width: 3px;
    height: 14px;
    border-radius: 2px;
    background: #0000ab;
    flex-shrink: 0;
  }

  .pr-charts-heading p {
    margin: 2px 0 0 11px;
    font-size: 11px;
    color: #667085;
  }

  .pr-charts-tag {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 6px;
    background: #fff;
    border: 1px solid #eaecf0;
    font-size: 10px;
    font-weight: 500;
    color: #667085;
  }

  .pr-charts-row {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
    width: 100%;
    align-items: stretch;
  }

  .pr-chart-panel {
    border: 1px solid #eaecf0;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04);
    transition: border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease;
    animation: pr-fade-up 0.5s ease both;
    overflow: hidden;
    min-width: 0;
    position: relative;
    isolation: isolate;
    --chart-accent: #0000ab;
  }

  .pr-chart-panel::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--chart-accent);
    opacity: 0.45;
    transition: opacity 0.22s ease;
    z-index: 2;
    pointer-events: none;
  }

  .pr-chart-panel:hover {
    transform: translateY(-2px);
    border-color: color-mix(in srgb, var(--chart-accent) 28%, #eaecf0);
    box-shadow:
      0 4px 6px -2px rgba(16, 24, 40, 0.05),
      0 12px 20px -4px rgba(16, 24, 40, 0.08);
    z-index: 2;
  }

  .pr-chart-panel:hover::after { opacity: 1; }

  .pr-chart-mttd { --chart-accent: #2563eb; }
  .pr-chart-mtte { --chart-accent: #7c3aed; }
  .pr-chart-mttr { --chart-accent: #0d9488; }

  .pr-stat-row {
    display: flex;
    border-bottom: 1px solid #eaecf0;
    position: relative;
    z-index: 1;
  }

  .pr-stat-cell {
    flex: 1;
    padding: 8px 10px;
    font-size: clamp(9px, 1vw, 11px);
    font-weight: 600;
  }

  .pr-stat-cell.gray {
    background: #f2f4f7;
    color: #475467;
    border-right: 1px solid #eaecf0;
  }

  .pr-stat-cell.orange {
    background: #0000ab;
    color: #fff;
    border-right: 1px solid #000080;
  }

  .pr-stat-cell.orange:last-child,
  .pr-stat-cell.gray:last-child { border-right: none; }

  .pr-chart-title {
    text-align: center;
    font-weight: 600;
    font-size: clamp(11px, 1.2vw, 12px);
    padding: 10px 8px 8px;
    border-bottom: 1px solid #f2f4f7;
    color: #344054;
    background: #fff;
    position: relative;
    z-index: 1;
  }

  .pr-chart-panel:hover .pr-chart-title { color: var(--chart-accent); }

  .pr-chart-body {
    padding: 6px 10px 0;
    width: 100%;
    min-height: 220px;
    position: relative;
    z-index: 1;
    background: #fff;
  }

  .pr-chart-legend {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 4px;
    padding: 0 8px 4px;
    font-size: 11px;
    color: #667085;
    background: #fff;
    position: relative;
    z-index: 1;
  }

  .pr-legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 4px 8px;
    border-radius: 6px;
  }

  .pr-legend-line {
    width: 24px;
    height: 2px;
    border-radius: 1px;
  }

  .pr-fytd {
    text-align: center;
    font-weight: 700;
    font-size: clamp(11px, 1.3vw, 14px);
    padding: 8px 8px 12px;
    background: #fff;
    border-top: 1px solid #f9fafb;
    position: relative;
    z-index: 1;
  }

  .pr-tooltip {
    background: #fff !important;
    border: 1px solid #eaecf0 !important;
    border-radius: 8px !important;
    padding: 0 !important;
    box-shadow: 0 8px 24px rgba(16, 24, 40, 0.1) !important;
    font-size: 12px !important;
    overflow: hidden;
    pointer-events: none;
  }

  .pr-tooltip-inner { padding: 12px 16px; }

  .pr-tooltip-label {
    font-weight: 700;
    font-size: 12px;
    color: #1d2939;
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid rgba(16, 24, 40, 0.08);
  }

  .pr-tooltip-row {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: 5px;
    font-size: 11px;
    color: #475467;
  }

  .pr-tooltip-row:first-of-type { margin-top: 0; }

  .pr-tooltip-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .pr-tooltip-name { font-weight: 600; color: #344054; }

  .pr-tooltip-value {
    margin-left: auto;
    font-weight: 800;
    color: #1d2939;
    font-size: 12px;
  }

  @media (max-width: 1400px) {
    .pr-charts-row { gap: 12px; }
  }

  @media (max-width: 1200px) {
    .pr-charts-row { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pr-charts-row .pr-chart-panel:last-child { grid-column: 1 / -1; }
  }

  @media (max-width: 992px) {
    .pr-charts-row { grid-template-columns: 1fr; }
    .pr-charts-row .pr-chart-panel:last-child { grid-column: auto; }
    .pr-stat-cell { font-size: 10px; padding: 6px 8px; }
  }

  @media (max-width: 768px) {
    .pr-charts-row { gap: 12px; }
    .pr-chart-body { min-height: 210px; }
    .pr-stat-row { flex-direction: column; }
    .pr-stat-cell { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.15); }
    .pr-stat-cell.gray { border-bottom: 1px solid #d0d5dd; }
    .pr-stat-cell:last-child { border-bottom: none; }
  }

  @media (max-width: 576px) {
    .pr-chart-body { min-height: 200px; }
    .pr-chart-legend { gap: 12px; font-size: 10px; }
  }

  @media (max-width: 480px) {
    .pr-chart-title { font-size: 11px; }
    .pr-fytd { font-size: 12px; }
  }

  @media (hover: none) {
    .pr-chart-panel:hover { transform: none; box-shadow: none; }
  }
`;

const useCountUp = (target, duration = 1200, decimals = 0) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let start = null;
    let frame;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setValue(target * eased);
      if (progress < 1) frame = requestAnimationFrame(step);
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return decimals > 0 ? value.toFixed(decimals) : Math.round(value);
};

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

const RiskAndResilience = () => (
  <>
    <style>{DASHBOARD_STYLES}</style>
    <DashboardContent data={DASHBOARD_DATA} />
  </>
);

export default RiskAndResilience;
export { RISK_AND_RESILIENCE_DASHBOARD_JSON, DASHBOARD_DATA };
