import {
  buildLayOfLandCategories,
  computePortfolioSummary,
  buildPortfolioTrends,
  classifyProgressBand,
  getProgressBandTheme,
} from './cockpitData.js';

const FAST_CATEGORIES = buildLayOfLandCategories();
const PORTFOLIO_SUMMARY = computePortfolioSummary(FAST_CATEGORIES);

const ORG_DATA = {
  organization: {
    name: 'ADP Demo',
    lastUpdated: '2026-05-25T09:30:00+05:30',
    viewerName: 'C. Coleman',
    viewerRole: 'Chief Executive',
  },

  ceoSummary: PORTFOLIO_SUMMARY,
  ceoTrends: buildPortfolioTrends(PORTFOLIO_SUMMARY),
  fastCategories: FAST_CATEGORIES,
};

const STATUS_META = {
  'on-track': { label: 'On Track', color: '#059669', bg: '#ecfdf5' },
  delayed: { label: 'Delayed', color: '#d97706', bg: '#fffbeb' },
  blocked: { label: 'Blocked', color: '#dc2626', bg: '#fef2f2' },
  completed: { label: 'Completed', color: '#2563eb', bg: '#eff6ff' },
  'at-risk': { label: 'At Risk', color: '#ea580c', bg: '#fff7ed' },
  'off-track': { label: 'Off Track', color: '#dc2626', bg: '#fef2f2' },
};

const RISK_META = {
  low: { label: 'Low Risk', color: '#059669' },
  medium: { label: 'Medium Risk', color: '#d97706' },
  high: { label: 'High Risk', color: '#dc2626' },
};

const MODULE_STATUS = {
  done: { label: 'Done', color: '#059669', bg: '#ecfdf5' },
  'in-progress': { label: 'In Progress', color: '#2563eb', bg: '#eff6ff' },
  pending: { label: 'Pending', color: '#64748b', bg: '#f1f5f9' },
};

function healthColor(score) {
  return getProgressBandTheme(classifyProgressBand(score))?.color ?? '#64748b';
}

function findFastCategory(id) {
  return ORG_DATA.fastCategories.find((f) => f.id === id);
}

function findInitiative(fastCategory, initiativeId) {
  return fastCategory?.initiatives.find((i) => i.id === initiativeId);
}

function findProject(initiative, projectId) {
  return initiative?.projects.find((p) => p.id === projectId);
}

function getInitials(name) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

const CRITICAL_STATUS = new Set(['at-risk', 'delayed', 'blocked', 'off-track']);

export {
  FAST_CATEGORIES,
  PORTFOLIO_SUMMARY,
  ORG_DATA,
  STATUS_META,
  RISK_META,
  MODULE_STATUS,
  healthColor,
  findFastCategory,
  findInitiative,
  findProject,
  getInitials,
  CRITICAL_STATUS,
};
