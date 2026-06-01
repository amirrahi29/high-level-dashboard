import { lazy } from 'react';
import { PRODUCT_RESILIENCY_INITIATIVE_ID, CLOUD_MIGRATION_INITIATIVE_ID } from '../../../constants/app.js';

const RiskAndResilience = lazy(() => import('../../risk-and-resilience/RiskAndResiliencePage.js'));
const CloudMigration = lazy(() => import('../../cloud-migration/CloudMigrationPage.js'));

const EMBEDDED_INITIATIVE_VIEWS = {
  [PRODUCT_RESILIENCY_INITIATIVE_ID]: RiskAndResilience,
  [CLOUD_MIGRATION_INITIATIVE_ID]: CloudMigration,
};

export function getEmbeddedInitiativeView(initiativeId) {
  return EMBEDDED_INITIATIVE_VIEWS[initiativeId] ?? null;
}

export { EMBEDDED_INITIATIVE_VIEWS };
