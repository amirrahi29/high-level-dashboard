import React, { useEffect, useState } from 'react';

import '../../styles/cloud-migration.css';
import DashboardContent from './components/CloudMigrationDashboard.js';
import { DASHBOARD_DATA } from './data/dashboardData.js';

export default function CloudMigrationPage() {
  return <DashboardContent data={DASHBOARD_DATA} />;
}

export { CLOUD_MIGRATION_DASHBOARD_JSON, DASHBOARD_DATA } from './data/dashboardData.js';
