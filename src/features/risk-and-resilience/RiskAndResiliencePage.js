import React, { useEffect, useState } from 'react';

import '../../styles/risk-and-resilience.css';
import { DASHBOARD_DATA } from './data/dashboardData.js';
import DashboardContent from './components/DashboardContent.js';

export default function RiskAndResiliencePage() {
  return <DashboardContent data={DASHBOARD_DATA} />;
}

export { RISK_AND_RESILIENCE_DASHBOARD_JSON, DASHBOARD_DATA } from './data/dashboardData.js';
