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

export { CLOUD_MIGRATION_DASHBOARD_JSON, DASHBOARD_DATA, STATUS_KEYS };
