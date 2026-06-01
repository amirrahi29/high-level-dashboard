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

export { RISK_AND_RESILIENCE_DASHBOARD_JSON, DASHBOARD_DATA, CHART_KEYS, CHART_DELAYS };
