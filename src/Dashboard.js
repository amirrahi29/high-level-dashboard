import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import RiskAndResilience from './RiskAndResilience';
import CloudMigration from './CloudMigration';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

const APP_LOCALE = 'en-US';
const EMPTY_VALUE = 'N/A';
const PRODUCT_RESILIENCY_INITIATIVE_ID = 'risk-and-resiliency';
const CLOUD_MIGRATION_INITIATIVE_ID = 'cloud-migration';

const EMBEDDED_INITIATIVE_VIEWS = {
  [PRODUCT_RESILIENCY_INITIATIVE_ID]: RiskAndResilience,
  [CLOUD_MIGRATION_INITIATIVE_ID]: CloudMigration,
};

function getEmbeddedInitiativeView(initiativeId) {
  return EMBEDDED_INITIATIVE_VIEWS[initiativeId] ?? null;
}

function formatAppDate(iso) {
  if (!iso) return EMPTY_VALUE;
  return new Date(iso).toLocaleDateString(APP_LOCALE, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatAppDateTime(iso) {
  if (!iso) return EMPTY_VALUE;
  try {
    return new Date(iso).toLocaleString(APP_LOCALE, {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return String(iso);
  }
}

function formatDate(iso) {
  return formatAppDate(iso);
}

function formatAppNumber(value, options) {
  if (value == null || Number.isNaN(Number(value))) return EMPTY_VALUE;
  return Number(value).toLocaleString(APP_LOCALE, options);
}

function getChartViewportWidth() {
  return typeof window !== 'undefined' ? window.innerWidth : 1200;
}

function useResponsiveChart() {
  const [width, setWidth] = useState(getChartViewportWidth);

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const isMobile = width <= 480;
  const isTablet = width <= 768;
  const isSmall = width <= 1024;

  return {
    width,
    isMobile,
    isTablet,
    isSmall,
    tick: isMobile ? 9 : isTablet ? 10 : 11,
    tickSmall: isMobile ? 8 : isTablet ? 9 : 10,
    yAxisWidth: isMobile ? 48 : isTablet ? 60 : 76,
    barYAxisWidth: isMobile ? 56 : isTablet ? 72 : 88,
    barSize: isMobile ? 7 : isTablet ? 9 : 12,
    pieRadius: isMobile ? 52 : isTablet ? 72 : 90,
    chartMargin: isMobile
      ? { top: 6, right: 8, left: 2, bottom: 0 }
      : isTablet
        ? { top: 8, right: 12, left: 4, bottom: 2 }
        : { top: 10, right: 16, left: 6, bottom: 4 },
    axisMargin: isMobile
      ? { top: 6, right: 10, left: 4, bottom: 2 }
      : { top: 8, right: 16, left: 6, bottom: 4 },
    xAxisHeight: isMobile ? 46 : isTablet ? 36 : 30,
    legendProps: isMobile
      ? { verticalAlign: 'bottom', align: 'center', wrapperStyle: { fontSize: 10, paddingTop: 6, lineHeight: 1.3 } }
      : { verticalAlign: 'bottom', align: 'left', wrapperStyle: { fontSize: 11, paddingTop: 8, lineHeight: 1.35 } },
    showDualAxis: !isMobile,
  };
}

function toSlug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 56);
}

const DEMO_INITIATIVE_PROGRESS = [
  95, 92, 58, 30, 96, 65, 94, 91, 35, 88, 72, 97, 90, 93, 76, 89,
  96, 87, 98, 40, 92, 85, 78, 94, 86, 91,
];

function demoTrendFromProgress(progress) {
  return [
    Math.max(5, progress - 14),
    Math.max(5, progress - 9),
    Math.max(5, progress - 4),
    progress,
  ];
}

function resolveDemoProgress(index, override) {
  if (override != null) return override;
  return DEMO_INITIATIVE_PROGRESS[index % DEMO_INITIATIVE_PROGRESS.length];
}

function statusFromProgressBand(progress, index) {
  const band = classifyProgressBand(progress);
  if (band === 'on-track') return 'on-track';
  if (band === 'at-risk') return index % 5 === 0 ? 'delayed' : 'at-risk';
  return index % 4 === 0 ? 'blocked' : 'delayed';
}

function riskFromProgressBand(progress) {
  const band = classifyProgressBand(progress);
  if (band === 'on-track') return 'low';
  if (band === 'at-risk') return 'medium';
  return 'high';
}

function createDemoProject(id, name, index = 0, progressOverride) {
  const progress = resolveDemoProgress(index, progressOverride);
  const status = statusFromProgressBand(progress, index);
  const risk = riskFromProgressBand(progress);
  const delayDays = status === 'delayed' || status === 'blocked'
    ? (progress < 40 ? [45, 38, 76, 52][index % 4] : [18, 12, 28, 8][index % 4])
    : 0;
  const delayReason = delayDays > 20
    ? 'Cross-team dependency awaiting sign-off'
    : delayDays > 0
      ? 'Minor scope adjustment from stakeholders'
      : null;
  const clients = ['Internal', 'Enterprise', 'GPT Portfolio', 'Strategic Client'];
  return {
    id,
    name,
    status,
    risk,
    client: clients[index % clients.length],
    progress,
    duration: {
      plannedDays: 90,
      elapsedDays: Math.round(progress * 0.9),
      remainingDays: Math.max(0, 90 - Math.round(progress * 0.9)),
    },
    timeline: {
      startDate: '2026-02-01',
      expectedEndDate: '2026-05-30',
      projectedEndDate: delayDays ? '2026-06-20' : '2026-05-28',
    },
    teamSize: 3 + (index % 4),
    delayDays,
    delayReason,
    blockers: status === 'blocked' ? ['Approval pending', 'Environment unavailable'] : [],
    modules: [
      { id: `${id}-m1`, name: 'Discovery & Planning', status: 'done', estimatedDays: 12, actualDays: 11, assignee: 'Lead' },
      { id: `${id}-m2`, name: 'Build & Integrate', status: progress > 70 ? 'done' : 'in-progress', estimatedDays: 24, actualDays: Math.round(progress * 0.2), assignee: 'Engineer' },
      { id: `${id}-m3`, name: 'Validation & Rollout', status: progress > 85 ? 'in-progress' : 'pending', estimatedDays: 14, actualDays: 0, assignee: 'Engineer' },
    ],
    developers: [
      { id: `${id}-d1`, name: 'Delivery Lead', role: 'Lead', utilization: 82 + (index % 10), currentModule: 'Build & Integrate' },
      { id: `${id}-d2`, name: 'Engineer A', role: 'Engineer', utilization: 75 + (index % 12), currentModule: 'Build & Integrate' },
      { id: `${id}-d3`, name: 'Engineer B', role: 'Engineer', utilization: 68 + (index % 15), currentModule: 'Validation & Rollout' },
    ],
  };
}

const LAY_OF_LAND_ROWS = [
  { fast: 'FOCUS & Deliver on BU & Functional Priorities', fastShort: 'FOCUS', initiative: 'Deliver against medium term Guidance', owner: 'GPT', team: 'BU Leaders' },
  { fast: 'FOCUS & Deliver on BU & Functional Priorities', fastShort: 'FOCUS', initiative: 'Client 0 Lyric', owner: 'Lyric', team: 'TBD' },
  { fast: 'FOCUS & Deliver on BU & Functional Priorities', fastShort: 'FOCUS', initiative: 'NextGen development per plan', owner: 'Lyric / WFN NG / Roll/e', team: 'BU Leaders' },
  { fast: 'FOCUS & Deliver on BU & Functional Priorities', fastShort: 'FOCUS', initiative: 'PI Acceleration', owner: 'PI', team: 'PI Leaders' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'AI tool adoption (% of assoc.)', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'AI Productivity Benefit (Cumulative %)', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'AI Infrastructure Progress (AI Studio)', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'AI Infrastructure Progress (Personalization Engine & Data Central)', owner: 'Data', team: 'Amin & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'Deliver on Persona based agent plan', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'AI Centric (BU) Roadmaps', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'Accelerate NG dev. & Migration Factory via AI', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'Portfolio & TAM Expansion', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'ACCELERATE - Product Portfolio Impact', fastShort: 'ACCELERATE', initiative: 'H2A (Human to Agent) Standards', owner: 'Product & AI', team: 'Prasanna & Team' },
  { fast: 'SCALE - GPT Led Growth Bets', fastShort: 'SCALE', initiative: 'Breakthrough Business Revenue - Marketplace', owner: 'Ventures', team: 'Oz & Team' },
  { fast: 'SCALE - GPT Led Growth Bets', fastShort: 'SCALE', initiative: 'Breakthrough Business Revenue - Data', owner: 'N/A', team: 'N/A' },
  { fast: 'SCALE - GPT Led Growth Bets', fastShort: 'SCALE', initiative: 'Investment and Revenue Gains from Ventures', owner: 'Ventures', team: 'Oz & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'Vendor Management (TESM)', owner: 'GPT Strat', team: 'Varun & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'GPT Global Delivery Model', owner: 'GPT SOT', team: 'Varun & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'SDLC/ADLC', owner: 'GPD', team: 'Ram & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'People Excellence (Workforce & Talent Strategy)', owner: 'HR', team: 'Emma & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'Stakeholder Excellence', owner: 'GPT SOT', team: 'Varun & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'Collaboration / Associate Experience', owner: 'GETS', team: 'Prakash & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'Cloud Migration', owner: 'GETS', team: 'Prakash & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'IAM', owner: 'GETS', team: 'Prakash & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'Risk and Resiliency', owner: 'GPD', team: 'Ram & Team' },
  { fast: 'TRANSFORM - GPT Operations & Engagement', fastShort: 'TRANSFORM', initiative: 'GPT Performance Management (Control Tower)', owner: 'GPT SOT', team: 'Varun & Team' },
];

function summarizeProjects(projects) {
  const delayed = projects.filter((p) => p.status === 'delayed' || p.status === 'blocked').length;
  const pendingModules = projects.reduce((sum, p) => sum + p.modules.filter((m) => m.status === 'pending').length, 0);
  const avgUtilization = projects.length
    ? Math.round(projects.reduce((sum, p) => sum + (p.developers.reduce((s, d) => s + d.utilization, 0) / Math.max(p.developers.length, 1)), 0) / projects.length)
    : 0;
  const teamSize = projects.reduce((sum, p) => sum + p.teamSize, 0);
  const status = delayed >= 2 ? 'at-risk' : delayed === 1 ? 'delayed' : 'on-track';
  return { activeProjects: projects.length, delayedProjects: delayed, pendingModules, developers: teamSize, avgUtilization, status };
}

function classifyProgressBand(progress) {
  if (progress > 80) return 'on-track';
  if (progress >= 50) return 'at-risk';
  return 'off-track';
}

function statusFromHealthScore(healthScore) {
  return classifyProgressBand(healthScore);
}

const PROGRESS_BAND_THEME = {
  'on-track': {
    tone: 'emerald',
    accent: 'def-accent-emerald',
    color: '#059669',
    label: '#15803d',
    sub: '#166534',
    spark: '#22c55e',
    iconBg: 'rgba(34,197,94,0.12)',
    iconBorder: 'rgba(34,197,94,0.22)',
    cardBg: 'linear-gradient(165deg, #ffffff 0%, #ecfdf5 48%, #f0fdf4 100%)',
    border: 'rgba(5,150,105,0.24)',
  },
  'at-risk': {
    tone: 'amber',
    accent: 'def-accent-amber',
    color: '#d97706',
    label: '#b45309',
    sub: '#92400e',
    spark: '#f59e0b',
    iconBg: 'rgba(245,158,11,0.14)',
    iconBorder: 'rgba(245,158,11,0.28)',
    cardBg: 'linear-gradient(165deg, #ffffff 0%, #fffbeb 48%, #fef3c7 100%)',
    border: 'rgba(217,119,6,0.24)',
  },
  'off-track': {
    tone: 'rose',
    accent: 'def-accent-rose',
    color: '#dc2626',
    label: '#b91c1c',
    sub: '#991b1b',
    spark: '#ef4444',
    iconBg: 'rgba(239,68,68,0.12)',
    iconBorder: 'rgba(239,68,68,0.22)',
    cardBg: 'linear-gradient(165deg, #ffffff 0%, #fef2f2 48%, #fee2e2 100%)',
    border: 'rgba(220,38,38,0.24)',
  },
};

function getProgressBandTheme(band) {
  return PROGRESS_BAND_THEME[band] || null;
}

function countProjectsByProgressBand(projects) {
  const counts = { onTrack: 0, atRisk: 0, offTrack: 0 };
  projects.forEach((project) => {
    const band = classifyProgressBand(project.progress ?? 0);
    if (band === 'on-track') counts.onTrack += 1;
    else if (band === 'at-risk') counts.atRisk += 1;
    else counts.offTrack += 1;
  });
  return counts;
}

const IMPERATIVE_LABELS = {
  FOCUS: 'Focus',
  ACCELERATE: 'Accelerate',
  SCALE: 'Scale',
  TRANSFORM: 'Transform',
};

function formatFastPillarSubtitle(fullName) {
  return fullName
    .replace(/^FOCUS &\s*/i, '')
    .replace(/^ACCELERATE -\s*/i, '')
    .replace(/^SCALE -\s*/i, '')
    .replace(/^TRANSFORM -\s*/i, '')
    .trim();
}

const INITIATIVE_TRACKER_REF = {
  'deliver against medium term guidance': {
    initiative: 'Deliver on BU & Functional Priorities & KTLO',
    budgetPct: 72, budgetTotalM: 24, budgetSpentM: 17,
    target: '$18M', ctt: '$8.7M of $18M (48%)', source: 'adp',
  },
  'client 0 lyric': {
    initiative: 'Deliver on BU & Functional Priorities & KTLO',
    budgetPct: 68, budgetTotalM: 12, budgetSpentM: 8,
    target: '>85%', ctt: '71% complete', source: 'adp',
  },
  'nextgen development per plan': {
    initiative: 'Deliver on BU & Functional Priorities & KTLO',
    budgetPct: 58, budgetTotalM: 18, budgetSpentM: 10,
    target: '>85%', ctt: '58% complete', source: 'adp',
  },
  'pi acceleration': {
    initiative: 'Deliver on BU & Functional Priorities & KTLO',
    budgetPct: 35, budgetTotalM: 24, budgetSpentM: 8,
    target: '>85%', ctt: '35% complete', source: 'adp',
  },
  'ai tool adoption (% of assoc.)': {
    initiative: 'AI Foundation', budgetPct: 62, budgetTotalM: 5, budgetSpentM: 3,
    target: '$8M Revenue', ctt: '$4.2M of $8M (52%)', source: 'adp',
  },
  'ai productivity benefit (cumulative %)': {
    initiative: 'AI Foundation', budgetPct: 38, budgetTotalM: 12, budgetSpentM: 5,
    target: '$12M Revenue', ctt: '$2.1M of $12M (18%)', source: 'sample',
  },
  'deliver on persona based agent plan': {
    initiative: 'AI Foundation', budgetPct: 32, budgetTotalM: 1, budgetSpentM: 0.3,
    target: '50%', ctt: '19% of 50%', source: 'sample',
  },
  'ai infrastructure progress (ai studio)': {
    initiative: 'AI Foundation', budgetPct: 78, budgetTotalM: 1, budgetSpentM: 0.8,
    target: '25%', ctt: '23% of 25%', source: 'sample',
  },
  'ai infrastructure progress (personalization engine & data central)': {
    initiative: 'AI Foundation', budgetPct: 55, budgetTotalM: 2, budgetSpentM: 1.1,
    target: '30%', ctt: '18% of 30%', source: 'sample',
  },
  'portfolio & tam expansion': {
    initiative: 'Data and Intelligence Layer', budgetPct: 74, budgetTotalM: 18, budgetSpentM: 13,
    target: '$108M', ctt: '$48M of $108M (44%)', source: 'adp',
  },
  'ai centric (bu) roadmaps': {
    initiative: 'Data and Intelligence Layer', budgetPct: 61, budgetTotalM: 24, budgetSpentM: 15,
    target: '$108M', ctt: '$42M of $108M (39%)', source: 'adp',
  },
  'accelerate ng dev. & migration factory via ai': {
    initiative: 'AI Accelerated EVC Revenue', budgetPct: 48, budgetTotalM: 8, budgetSpentM: 4,
    target: '$108M', ctt: '$12M of $108M (11%)', source: 'sample',
  },
  'h2a (human to agent) standards': {
    initiative: 'AI Accelerated EVC Revenue', budgetPct: 52, budgetTotalM: 5, budgetSpentM: 2.6,
    target: '100%', ctt: '38% of 100%', source: 'sample',
  },
  'breakthrough business revenue - marketplace': {
    initiative: 'AI Accelerated AVM Revenue', budgetPct: 22, budgetTotalM: 3, budgetSpentM: 0.7,
    target: '100%', ctt: '12% of 100%', source: 'sample',
  },
  'breakthrough business revenue - data': {
    initiative: 'AI Accelerated CXP Revenue', budgetPct: 70, budgetTotalM: 4, budgetSpentM: 2.8,
    target: '100%', ctt: '52% of 100%', source: 'sample',
  },
  'investment and revenue gains from ventures': {
    initiative: 'AI Accelerated CXP Revenue', budgetPct: 58, budgetTotalM: 2, budgetSpentM: 1.2,
    target: '100%', ctt: '44% of 100%', source: 'sample',
  },
  'vendor management (tesm)': {
    initiative: 'GPT Operations & Engagement', budgetPct: 28, budgetTotalM: 6, budgetSpentM: 1.7,
    target: '90%', ctt: '22% of 90%', source: 'sample',
  },
  'gpt global delivery model': {
    initiative: 'GPT Operations & Engagement', budgetPct: 82, budgetTotalM: 8, budgetSpentM: 6.5,
    target: '95%', ctt: '68% of 95%', source: 'sample',
  },
  'sdlc/adlc': {
    initiative: 'GPT Operations & Engagement', budgetPct: 46, budgetTotalM: 5, budgetSpentM: 2.3,
    target: '85%', ctt: '38% of 85%', source: 'sample',
  },
  'people excellence (workforce & talent strategy)': {
    initiative: 'GPT Operations & Engagement', budgetPct: 36, budgetTotalM: 4, budgetSpentM: 1.4,
    target: '80%', ctt: '28% of 80%', source: 'sample',
  },
  'stakeholder excellence': {
    initiative: 'GPT Operations & Engagement', budgetPct: 76, budgetTotalM: 3, budgetSpentM: 2.3,
    target: '90%', ctt: '62% of 90%', source: 'sample',
  },
  'collaboration / associate experience': {
    initiative: 'GPT Operations & Engagement', budgetPct: 44, budgetTotalM: 2, budgetSpentM: 0.9,
    target: '75%', ctt: '28% of 75%', source: 'sample',
  },
  'cloud migration': {
    initiative: 'GPT Operations & Engagement', budgetPct: 88, budgetTotalM: 10, budgetSpentM: 8.8,
    target: '100%', ctt: '78% of 100%', source: 'sample',
  },
  'iam': {
    initiative: 'GPT Operations & Engagement', budgetPct: 30, budgetTotalM: 2, budgetSpentM: 0.6,
    target: '90%', ctt: '18% of 90%', source: 'sample',
  },
  'risk and resiliency': {
    initiative: 'GPT Operations & Engagement', budgetPct: 54, budgetTotalM: 4, budgetSpentM: 2.2,
    target: '85%', ctt: '42% of 85%', source: 'sample',
  },
  'gpt performance management (control tower)': {
    initiative: 'GPT Operations & Engagement', budgetPct: 64, budgetTotalM: 5, budgetSpentM: 3.2,
    target: '90%', ctt: '52% of 90%', source: 'sample',
  },
};

const SCORECARD_STATUS_META = {
  'on-track': { label: 'On Track', tone: 'track' },
  'at-risk': { label: 'At Risk', tone: 'watch' },
  'off-track': { label: 'Off Track', tone: 'risk' },
};

const INITIATIVE_SCORECARD_REF = {
  'deliver against medium term guidance': {
    strategicTargets: [
      { label: 'Product Rollout', value: 'Lyric : 6 / 10' },
      { label: 'Migration Readiness', value: 'Customer Base : 72%' },
      { label: 'Risk Mix', value: 'Low / Med / High : 30 / 50 / 20' },
    ],
    kpis: [
      { kpi: 'Cost Savings Realized', status: 'at-risk', current: '$8.7M', target2029: '$18M', targetYearOne: '$12M', comments: 'N/A' },
      { kpi: 'Migration Readiness', status: 'on-track', current: '70:30', target2029: '80:20', targetYearOne: '75:25', comments: 'N/A' },
      { kpi: 'Milestone Achievement', status: 'on-track', current: '78%', target2029: '>85%', targetYearOne: '80%', comments: 'N/A' },
      { kpi: 'Product Rollout Velocity', status: 'at-risk', current: '6 products', target2029: '10 products', targetYearOne: '8 products', comments: 'N/A' },
      { kpi: 'Risk & Compliance Score', status: 'at-risk', current: 'Medium', target2029: 'Low', targetYearOne: 'Low-Medium', comments: 'N/A' },
    ],
  },
  'client 0 lyric': {
    strategicTargets: [
      { label: 'Migration Readiness', value: 'Customer Base : 72%' },
      { label: 'Product Rollout', value: 'Lyric : 6 / 10' },
      { label: 'Risk Mix', value: 'Low / Med / High : 35 / 45 / 20' },
    ],
    kpis: [
      { kpi: 'Milestone Achievement', status: 'on-track', current: '88%', target2029: '>85%', targetYearOne: '80%', comments: 'N/A' },
      { kpi: 'Client Adoption', status: 'on-track', current: '71%', target2029: '85%', targetYearOne: '75%', comments: 'N/A' },
      { kpi: 'Schedule Adherence', status: 'on-track', current: '88%', target2029: '90%', targetYearOne: '82%', comments: 'N/A' },
    ],
  },
  'nextgen development per plan': {
    strategicTargets: [
      { label: 'Platform Readiness', value: 'Core modules : 58%' },
      { label: 'Migration Factory', value: 'Throughput : 72%' },
      { label: 'Risk Mix', value: 'Low / Med / High : 28 / 52 / 20' },
    ],
    kpis: [
      { kpi: 'Milestone Achievement', status: 'at-risk', current: '72%', target2029: '>85%', targetYearOne: '78%', comments: 'N/A' },
      { kpi: 'Delivery Progress', status: 'at-risk', current: '58%', target2029: '85%', targetYearOne: '70%', comments: 'N/A' },
      { kpi: 'Schedule Adherence', status: 'at-risk', current: '72%', target2029: '90%', targetYearOne: '80%', comments: 'N/A' },
    ],
  },
  'pi acceleration': {
    strategicTargets: [
      { label: 'PI Throughput', value: 'Sprint velocity : 35%' },
      { label: 'Backlog Burn', value: 'Q2 target : 45%' },
      { label: 'Risk Mix', value: 'Low / Med / High : 15 / 35 / 50' },
    ],
    kpis: [
      { kpi: 'Milestone Achievement', status: 'off-track', current: '35%', target2029: '>85%', targetYearOne: '60%', comments: 'Behind plan' },
      { kpi: 'Sprint Completion', status: 'off-track', current: '35%', target2029: '90%', targetYearOne: '70%', comments: 'N/A' },
      { kpi: 'Delivery Risk', status: 'off-track', current: 'High', target2029: 'Low', targetYearOne: 'Medium', comments: 'N/A' },
    ],
  },
  'ai productivity benefit (cumulative %)': {
    strategicTargets: [
      { label: 'Agents in Pipeline', value: 'Client Persona : 18' },
      { label: 'Agents Rolled Out', value: 'Client Persona : 6' },
      { label: 'Risk Mix', value: 'Low / Med / High : 25 / 50 / 25' },
    ],
    kpis: [
      { kpi: 'Agents in Pipeline', status: 'on-track', current: '18', target2029: '25', targetYearOne: '20', comments: 'N/A' },
      { kpi: 'Agents Rolled Out', status: 'at-risk', current: '6', target2029: '15', targetYearOne: '10', comments: 'N/A' },
      { kpi: 'Persona Coverage', status: 'on-track', current: '64%', target2029: '90%', targetYearOne: '75%', comments: 'N/A' },
      { kpi: 'User Satisfaction', status: 'on-track', current: '82', target2029: '90', targetYearOne: '85', comments: 'N/A' },
      { kpi: 'Model Reliability', status: 'at-risk', current: '89%', target2029: '95%', targetYearOne: '92%', comments: 'N/A' },
    ],
  },
  'investment and revenue gains from ventures': {
    strategicTargets: [
      { label: 'Targets in Pipeline', value: 'M&A : 9' },
      { label: 'Deals Closed', value: 'M&A : 3' },
      { label: 'Risk Mix', value: 'Low / Med / High : 22 / 48 / 30' },
    ],
    kpis: [
      { kpi: 'Targets in Pipeline', status: 'on-track', current: '9', target2029: '12', targetYearOne: '10', comments: 'N/A' },
      { kpi: 'Deals Closed', status: 'on-track', current: '3', target2029: '5', targetYearOne: '4', comments: 'N/A' },
      { kpi: 'Due Diligence Completion', status: 'at-risk', current: '67%', target2029: '90%', targetYearOne: '78%', comments: 'N/A' },
      { kpi: 'Revenue from New Ventures', status: 'at-risk', current: '$15M', target2029: '$25M', targetYearOne: '$18M', comments: 'N/A' },
      { kpi: 'Integration Risk', status: 'at-risk', current: 'Moderate-High', target2029: 'Low', targetYearOne: 'Medium', comments: 'N/A' },
    ],
  },
};

function deriveScorecardStatus(initiativeStatus, risk) {
  if (initiativeStatus === 'delayed' || initiativeStatus === 'blocked' || risk === 'high') return 'off-track';
  if (initiativeStatus === 'at-risk' || risk === 'medium') return 'at-risk';
  return 'on-track';
}

function buildFallbackScorecard(initiative) {
  const progress = Math.round(
    initiative.projects.reduce((sum, project) => sum + project.progress, 0)
      / Math.max(initiative.projects.length, 1),
  );
  const risk = initiative.status === 'on-track' ? 'low' : initiative.status === 'at-risk' ? 'medium' : 'high';
  const headlineStatus = deriveScorecardStatus(initiative.status, risk);
  return {
    strategicTargets: [
      { label: 'Milestone Progress', value: `${progress}% complete` },
      { label: 'Active Projects', value: String(initiative.projects.length) },
      { label: 'Risk Mix', value: headlineStatus === 'on-track' ? 'Low / Med / High : 40 / 45 / 15' : 'Low / Med / High : 25 / 45 / 30' },
    ],
    kpis: [
      {
        kpi: 'Milestone Achievement',
        status: deriveScorecardStatus(initiative.status, risk),
        current: `${progress}%`,
        target2029: '>85%',
        targetYearOne: '70%',
        comments: 'N/A',
      },
      {
        kpi: 'Schedule Adherence',
        status: progress >= 70 ? 'on-track' : progress >= 50 ? 'at-risk' : 'off-track',
        current: `${progress}%`,
        target2029: '90%',
        targetYearOne: '75%',
        comments: 'N/A',
      },
      {
        kpi: 'Delivery Risk',
        status: headlineStatus,
        current: risk === 'high' ? 'High' : risk === 'medium' ? 'Medium' : 'Low',
        target2029: 'Low',
        targetYearOne: 'Low-Medium',
        comments: 'N/A',
      },
    ],
  };
}

function buildInitiativeScorecard(initiative) {
  return INITIATIVE_SCORECARD_REF[initiative.name.toLowerCase()] ?? buildFallbackScorecard(initiative);
}

function deriveScorecardStatusFromProgress(progress) {
  return classifyProgressBand(progress);
}

function buildInitiativeScorecardSummary(ini) {
  const ref = INITIATIVE_TRACKER_REF[ini.name.toLowerCase()];
  const scorecard = buildInitiativeScorecard(ini);
  const firstKpi = scorecard.kpis[0];
  const progress = ini.projects[0]?.progress ?? 68;
  const risk = ref?.risk ?? (ini.status === 'on-track' ? 'low' : ini.status === 'at-risk' ? 'medium' : 'high');
  const isFinancial = Boolean(ref?.target?.startsWith('$') || firstKpi?.current?.includes?.('$'));
  return {
    scorecardStatus: isFinancial
      ? (firstKpi?.status ?? deriveScorecardStatus(ini.status, risk))
      : deriveScorecardStatusFromProgress(progress),
    current: isFinancial
      ? (firstKpi?.current ?? ref?.ctt ?? `${progress}%`)
      : `${progress}%`,
    target2029: firstKpi?.target2029 ?? ref?.target ?? `${Math.min(100, progress + 15)}%`,
    targetYearOne: firstKpi?.targetYearOne ?? `${Math.min(100, progress + 8)}%`,
    comments: firstKpi?.comments ?? 'N/A',
  };
}

function ScorecardStatusCell({ status }) {
  const normalized = status === 'on-watch' ? 'at-risk' : status;
  const meta = SCORECARD_STATUS_META[normalized] || SCORECARD_STATUS_META['at-risk'];
  return (
    <span className="def-scorecard-status">
      <i className={`def-scorecard-dot def-scorecard-dot-${meta.tone}`} aria-hidden="true" />
      {meta.label}
    </span>
  );
}
    
const OWNER_TONE_MAP = {
  GPT: 'indigo',
  'GPT Strat': 'indigo',
  'GPT SOT': 'indigo',
  'Product & AI': 'violet',
  Data: 'blue',
  Ventures: 'amber',
  HR: 'rose',
  GPD: 'slate',
  GETS: 'slate',
  Lyric: 'teal',
  PI: 'cyan',
};

function resolveOwnerTone(owner) {
  if (!owner || owner === 'N/A') return 'neutral';
  if (OWNER_TONE_MAP[owner]) return OWNER_TONE_MAP[owner];
  if (owner.includes('Lyric')) return 'teal';
  if (owner.includes('Product')) return 'violet';
  return 'neutral';
}

function OwnerBadge({ owner }) {
  if (!owner || owner === EMPTY_VALUE) return <span className="def-owner-empty">{EMPTY_VALUE}</span>;
  const tone = resolveOwnerTone(owner);
  return (
    <span className={`def-owner-badge tone-${tone}`} title={`Owner: ${owner}`}>
      <span className="def-owner-badge-dot" aria-hidden="true" />
      <span className="def-owner-badge-text">{owner}</span>
    </span>
  );
}

function TeamBadge({ team }) {
  if (!team || team === EMPTY_VALUE) return <span className="def-owner-empty">{EMPTY_VALUE}</span>;
  return (
    <span className="def-team-badge" title={`Team: ${team}`}>
      <span className="def-team-badge-icon" aria-hidden="true">👥</span>
      <span className="def-team-badge-text">{team}</span>
    </span>
  );
}

function applyGroupRowSpans(rows, groups) {
  const stripKeys = groups.flatMap((g) => [g.span, g.show]);
  const normalized = rows.map((row) => {
    const next = { ...row };
    stripKeys.forEach((key) => delete next[key]);
    return next;
  });
  const withSpans = normalized.map((row) => ({
    ...row,
    ...Object.fromEntries(groups.flatMap((g) => [[g.span, 0], [g.show, false]])),
  }));

  function processRange(start, end, groupIdx) {
    if (groupIdx >= groups.length) return;
    const { key, span, show } = groups[groupIdx];
    let i = start;
    while (i < end) {
      const value = withSpans[i][key];
      let groupEnd = i;
      while (groupEnd < end && withSpans[groupEnd][key] === value) groupEnd += 1;
      withSpans[i][show] = true;
      withSpans[i][span] = groupEnd - i;
      processRange(i, groupEnd, groupIdx + 1);
      i = groupEnd;
    }
  }

  processRange(0, withSpans.length, 0);
  return withSpans;
}

const TRACKER_SPAN_GROUPS = [
  { key: 'imperative', span: 'imperativeSpan', show: 'showImperative' },
  { key: 'initiative', span: 'initiativeSpan', show: 'showInitiative' },
];

function applyTrackerRowSpans(rows) {
  return applyGroupRowSpans(rows, TRACKER_SPAN_GROUPS);
}

function CockpitCollapsibleSection({
  id,
  title,
  description,
  badge,
  defaultOpen = false,
  className = '',
  stagger = '360ms',
  children,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const bodyId = `${id}-body`;

  return (
    <section
      className={`def-cockpit-section def-cockpit-collapsible${open ? ' is-open' : ' is-collapsed'} ${className}`.trim()}
      style={{ '--stagger': stagger }}
    >
      <button
        type="button"
        className="def-cockpit-collapse-trigger"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-controls={bodyId}
      >
        <div className="def-cockpit-collapse-trigger-main">
          <h2 className="def-cockpit-section-title def-cockpit-collapse-title">{title}</h2>
          {description ? <p className="def-cockpit-collapse-desc">{description}</p> : null}
        </div>
        {badge ? <span className="def-cockpit-collapse-badge">{badge}</span> : null}
        <span className="def-cockpit-collapse-chevron" aria-hidden="true">{open ? 'v' : '>'}</span>
      </button>
      {open ? (
        <div id={bodyId} className="def-cockpit-collapse-body">
          {children}
        </div>
      ) : null}
    </section>
  );
}

function StrategicTargetCards({ targets }) {
  if (!targets?.length) return null;
  return (
    <div className="def-scorecard-targets">
      <p className="def-scorecard-targets-label">Strategic targets - 2029</p>
      <div className="def-scorecard-targets-row">
        {targets.map((target) => (
          <div key={target.label} className="def-scorecard-target-card">
            <span>{target.label}</span>
            <strong>{target.value}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function InitiativeKpiTable({
  rows,
  onRowClick,
  emptyMessage = 'No KPI rows to display.',
  showOwnership = false,
  embedded = false,
  modal = false,
}) {
  const colSpan = showOwnership ? 8 : 6;
  const wrapClass = embedded
    ? 'def-table-wrap def-table-embedded def-table-scroll-wrap'
    : modal
      ? 'def-modal-pro-table-wrap'
      : 'def-table-wrap def-table-pro def-table-scroll-wrap';
  const tableClass = modal
    ? 'def-table def-initiative-kpi-table def-modal-pro-table'
    : 'def-table def-initiative-kpi-table';
  const scrollInner = modal ? (
    <div className="def-modal-pro-table-scroll">
      <table className={tableClass}>
        <thead>
          <tr>
            <th>KPI</th>
            {showOwnership ? <th>Owner</th> : null}
            {showOwnership ? <th>Team</th> : null}
            <th>Status</th>
            <th>Current</th>
            <th>2029 Target</th>
            <th>Year One Target</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'def-table-row def-table-row-click' : 'def-table-row'}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (event) => { if (event.key === 'Enter') onRowClick(row); } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
            >
              <td data-label="KPI"><strong>{row.kpi}</strong></td>
              {showOwnership ? <td data-label="Owner"><OwnerBadge owner={row.owner} /></td> : null}
              {showOwnership ? <td data-label="Team"><TeamBadge team={row.team} /></td> : null}
              <td data-label="Status"><ScorecardStatusCell status={row.scorecardStatus} /></td>
              <td data-label="Current">{row.current}</td>
              <td data-label="2029 Target">{row.target2029}</td>
              <td data-label="Year One Target">{row.targetYearOne}</td>
              <td data-label="Comments">{row.comments}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={colSpan} className="def-cockpit-empty">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  ) : null;

  if (modal) {
    return <div className={wrapClass}>{scrollInner}</div>;
  }

  return (
    <div className={wrapClass}>
      <table className={tableClass}>
        <thead>
          <tr>
            <th>KPI</th>
            {showOwnership ? <th>Owner</th> : null}
            {showOwnership ? <th>Team</th> : null}
            <th>Status</th>
            <th>Current</th>
            <th>2029 Target</th>
            <th>Year One Target</th>
            <th>Comments</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.id}
              className={onRowClick ? 'def-table-row def-table-row-click' : 'def-table-row'}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              onKeyDown={onRowClick ? (event) => { if (event.key === 'Enter') onRowClick(row); } : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              role={onRowClick ? 'button' : undefined}
            >
              <td><strong>{row.kpi}</strong></td>
              {showOwnership ? <td><OwnerBadge owner={row.owner} /></td> : null}
              {showOwnership ? <td><TeamBadge team={row.team} /></td> : null}
              <td><ScorecardStatusCell status={row.scorecardStatus} /></td>
              <td>{row.current}</td>
              <td>{row.target2029}</td>
              <td>{row.targetYearOne}</td>
              <td>{row.comments}</td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={colSpan} className="def-cockpit-empty">{emptyMessage}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function formatBudgetM(totalM, spentM, pct) {
  return `${pct}% of $${totalM}M ($${spentM}M spent)`;
}

function buildInitiativeTrackerRows(fastCategories) {
  const imperativeOrder = { Focus: 0, Accelerate: 1, Scale: 2, Transform: 3 };
  const rows = [];

  fastCategories.forEach((fast) => {
    const imperative = IMPERATIVE_LABELS[fast.shortName] || fast.shortName;
    const defaultInitiative = fast.name
      .replace(/^FOCUS &\s*|^ACCELERATE -\s*|^SCALE -\s*|^TRANSFORM -\s*/i, '')
      .trim();

    fast.initiatives.forEach((ini) => {
      const ref = INITIATIVE_TRACKER_REF[ini.name.toLowerCase()];
      const scorecardSummary = buildInitiativeScorecardSummary(ini);

      rows.push({
        id: `${fast.id}-${ini.id}`,
        fastId: fast.id,
        initiativeId: ini.id,
        imperative,
        initiative: ref?.initiative ?? defaultInitiative,
        subInitiative: ini.name,
        owner: ini.owner ?? 'N/A',
        team: ini.team?.name ?? 'N/A',
        scorecardStatus: scorecardSummary.scorecardStatus,
        current: scorecardSummary.current,
        target2029: scorecardSummary.target2029,
        targetYearOne: scorecardSummary.targetYearOne,
        comments: scorecardSummary.comments,
        source: ref?.source ?? 'sample',
      });
    });
  });

  rows.sort(
    (a, b) =>
      (imperativeOrder[a.imperative] ?? 9) - (imperativeOrder[b.imperative] ?? 9)
      || a.imperative.localeCompare(b.imperative, APP_LOCALE)
      || a.initiative.localeCompare(b.initiative, APP_LOCALE)
      || a.subInitiative.localeCompare(b.subInitiative, APP_LOCALE),
  );

  return applyTrackerRowSpans(rows);
}

function getInitiativeTrackerDetail(initiative, fastCategory) {
  const ref = INITIATIVE_TRACKER_REF[initiative.name.toLowerCase()];
  const progress = Math.round(
    initiative.projects.reduce((sum, project) => sum + project.progress, 0)
      / Math.max(initiative.projects.length, 1),
  );
  const defaultParent = fastCategory.name
    .replace(/^FOCUS &\s*|^ACCELERATE -\s*|^SCALE -\s*|^TRANSFORM -\s*/i, '')
    .trim();
  const delayed = initiative.projects.filter(
    (project) => project.status === 'delayed' || project.status === 'blocked',
  ).length;
  const budgetPct = ref?.budgetPct ?? Math.min(95, 18 + progress / 2);
  const budgetTotalM = ref?.budgetTotalM ?? 2 + (initiative.projects.length % 4);
  const budgetSpentM = ref?.budgetSpentM ?? Math.round(budgetTotalM * (budgetPct / 100) * 10) / 10;

  return {
    parentInitiative: ref?.initiative ?? defaultParent,
    imperative: IMPERATIVE_LABELS[fastCategory.shortName] || fastCategory.shortName,
    owner: initiative.owner ?? 'N/A',
    team: initiative.team?.name ?? 'N/A',
    budgetPct,
    budgetLabel: formatBudgetM(budgetTotalM, budgetSpentM, budgetPct),
    budgetTone: budgetPct >= 80 ? 'warn' : 'ok',
    schedulePct: progress,
    target: ref?.target ?? `${Math.min(100, progress + 15)}%`,
    ctt: ref?.target?.startsWith('$') ? (ref?.ctt ?? `${progress}%`) : `${progress}%`,
    trend: demoTrendFromProgress(progress),
    trendUp: progress >= demoTrendFromProgress(progress)[0],
    risk: riskFromProgressBand(progress),
    source: ref?.source ?? 'sample',
    delayed,
  };
}

function InitiativeTracker({ rows, lastUpdated, onOpenInitiative }) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = !q
      ? rows
      : rows.filter(
        (r) =>
          r.imperative.toLowerCase().includes(q)
          || r.initiative.toLowerCase().includes(q)
          || r.subInitiative.toLowerCase().includes(q)
          || (r.owner ?? '').toLowerCase().includes(q)
          || (r.team ?? '').toLowerCase().includes(q),
      );
    return applyTrackerRowSpans(base);
  }, [rows, query]);

  const updatedLabel = useMemo(() => formatAppDateTime(lastUpdated), [lastUpdated]);

  return (
    <CockpitCollapsibleSection
      id="initiative-tracker"
      title="Lay of land - Initiative tracker"
      description={`Portfolio scorecard across FAST pillars, owners, teams, and KPI targets | Last updated: ${updatedLabel}`}
      badge={`${filtered.length} initiatives`}
      defaultOpen={false}
      className="def-cockpit-tracker def-cockpit-interactive def-stagger-in"
      stagger="280ms"
    >
      <div className="def-tracker-legend">
        <span className="def-tracker-legend-item adp"><i aria-hidden="true" /> Source: ADP / Provided by ADP</span>
        <span className="def-tracker-legend-item sample"><i aria-hidden="true" /> Illustrative data / Sample data</span>
      </div>
      <div className="def-tracker-toolbar">
        <label className="def-tracker-search">
          <span className="sr-only">Search initiatives</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search initiative..."
          />
        </label>
        <span className="def-tracker-count">{filtered.length} initiatives</span>
      </div>
      <div className="def-tracker-table-scroll def-table-scroll-wrap">
        <table className="def-tracker-table">
          <thead>
            <tr>
              <th>Strategic imperative</th>
              <th>Initiative</th>
              <th>KPI</th>
              <th>Owner</th>
              <th>Team</th>
              <th>Status</th>
              <th>Current</th>
              <th>2029 Target</th>
              <th>Year One Target</th>
              <th>Comments</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row) => (
              <tr
                key={row.id}
                className={`def-tracker-row def-tracker-source-${row.source}${onOpenInitiative ? ' def-tracker-row-click' : ''}`}
                onClick={onOpenInitiative ? () => onOpenInitiative(row.fastId, row.initiativeId) : undefined}
                onKeyDown={onOpenInitiative ? (event) => { if (event.key === 'Enter') onOpenInitiative(row.fastId, row.initiativeId); } : undefined}
                tabIndex={onOpenInitiative ? 0 : undefined}
                role={onOpenInitiative ? 'button' : undefined}
              >
                {row.showImperative ? (
                  <td className="def-tracker-imperative" rowSpan={row.imperativeSpan}>{row.imperative}</td>
                ) : null}
                {row.showInitiative ? (
                  <td className="def-tracker-initiative" rowSpan={row.initiativeSpan}>{row.initiative}</td>
                ) : null}
                <td className="def-tracker-sub">
                  <strong>{row.subInitiative}</strong>
                  {row.source === 'sample' ? <span className="def-tracker-tag sample">Sample</span> : null}
                </td>
                <td className="def-tracker-owner"><OwnerBadge owner={row.owner} /></td>
                <td className="def-tracker-team"><TeamBadge team={row.team} /></td>
                <td><ScorecardStatusCell status={row.scorecardStatus} /></td>
                <td>{row.current}</td>
                <td>{row.target2029}</td>
                <td>{row.targetYearOne}</td>
                <td>{row.comments}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={10} className="def-cockpit-empty">No initiatives match your search.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </CockpitCollapsibleSection>
  );
}

function buildLayOfLandCategories() {
  const fastMap = new Map();
  LAY_OF_LAND_ROWS.forEach((row, index) => {
    const fastId = toSlug(row.fast);
    if (!fastMap.has(fastId)) fastMap.set(fastId, { id: fastId, name: row.fast, shortName: row.fastShort, initiatives: [] });
    const initiativeId = toSlug(row.initiative);
    const projects = [createDemoProject(`prj-${index + 1}`, row.initiative, index)];
    const teamSummary = summarizeProjects(projects);
    fastMap.get(fastId).initiatives.push({
      id: initiativeId, name: row.initiative, owner: row.owner ?? 'N/A', status: teamSummary.status,
      team: { id: toSlug(`${row.team}-${initiativeId}`), name: row.team, status: teamSummary.status, summary: teamSummary },
      projects,
    });
  });
  return Array.from(fastMap.values()).map((fast) => {
    const allProjects = fast.initiatives.flatMap((i) => i.projects);
    const delayed = allProjects.filter((p) => p.status === 'delayed' || p.status === 'blocked').length;
    const healthScore = Math.round(allProjects.reduce((s, p) => s + p.progress, 0) / Math.max(allProjects.length, 1));
    return {
      ...fast,
      status: statusFromHealthScore(healthScore),
      healthScore,
      summary: {
        initiatives: fast.initiatives.length,
        teams: new Set(fast.initiatives.map((i) => i.team.name)).size,
        activeProjects: allProjects.length,
        delayedProjects: delayed,
        avgUtilization: Math.round(allProjects.reduce((s, p) => s + p.progress, 0) / Math.max(allProjects.length, 1)),
      },
    };
  });
}

function computePortfolioSummary(fastCategories) {
  const initiatives = fastCategories.flatMap((f) => f.initiatives);
  const projects = initiatives.flatMap((i) => i.projects);
  const teams = new Set(initiatives.map((i) => i.team.name));
  const activeProjects = projects.filter((p) => p.status !== 'completed').length;
  const delayedProjects = projects.filter((p) => p.status === 'delayed' || p.status === 'blocked').length;
  const bandCounts = countProjectsByProgressBand(projects);
  const onTrackProjects = bandCounts.onTrack;
  const atRiskProjects = bandCounts.atRisk;
  const offTrackProjects = bandCounts.offTrack;
  const completedProjects = projects.filter((p) => p.status === 'completed').length;
  const overallHealth = projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0;
  const denom = Math.max(projects.length, 1);
  return {
    totalFastCategories: fastCategories.length,
    totalInitiatives: initiatives.length,
    totalTeams: teams.size,
    totalProjects: projects.length,
    activeProjects,
    delayedProjects,
    atRiskProjects,
    onTrackProjects,
    completedProjects,
    offTrackProjects,
    onTrackPct: Math.round((onTrackProjects / denom) * 100),
    atRiskPct: Math.round((atRiskProjects / denom) * 100),
    offTrackPct: Math.round((offTrackProjects / denom) * 100),
    overallHealth,
    totalDevelopers: projects.reduce((s, p) => s + p.teamSize, 0),
  };
}

function computeExecutiveMetrics(fastCategories) {
  const summary = computePortfolioSummary(fastCategories);
  const initiatives = fastCategories.flatMap((fast) => fast.initiatives);
  const subInitiatives = initiatives.reduce(
    (sum, ini) => sum + buildInitiativeScorecard(ini).kpis.length,
    0,
  );

  return {
    strategicImperatives: fastCategories.length,
    initiatives: initiatives.length,
    subInitiatives,
    onTrackPct: summary.onTrackPct,
    onTrackCount: summary.onTrackProjects,
    atRiskPct: summary.atRiskPct,
    atRiskCount: summary.atRiskProjects,
    offTrackPct: summary.offTrackPct,
    offTrackCount: summary.offTrackProjects,
    healthScore: summary.overallHealth,
  };
}

const COCKPIT_ANCHOR_DATE = '2026-05-25';

function addDaysToIso(iso, days) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function daysBetweenIso(fromIso, toIso) {
  const from = new Date(`${fromIso}T00:00:00Z`);
  const to = new Date(`${toIso}T00:00:00Z`);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function buildOwnershipOverview(pillarFasts) {
  const byOwner = new Map();
  pillarFasts.forEach((fast) => {
    fast.initiatives.forEach((ini) => {
      const owner = ini.owner && ini.owner !== 'N/A' ? ini.owner : 'Unassigned';
      if (!byOwner.has(owner)) byOwner.set(owner, { owner, initiatives: [] });
      byOwner.get(owner).initiatives.push(ini);
    });
  });
  return Array.from(byOwner.values())
    .map((entry) => {
      const total = entry.initiatives.length;
      const onTrack = entry.initiatives.filter((ini) => classifyProgressBand(ini.projects[0]?.progress ?? 0) === 'on-track').length;
      const atRisk = entry.initiatives.filter((ini) => classifyProgressBand(ini.projects[0]?.progress ?? 0) === 'at-risk').length;
      const offTrack = Math.max(0, total - onTrack - atRisk);
      const healthScore = Math.round(
        entry.initiatives.reduce((sum, ini) => sum + (ini.projects[0]?.progress ?? 0), 0) / Math.max(total, 1),
      );
      return {
        id: toSlug(entry.owner),
        owner: entry.owner,
        total,
        onTrack,
        atRisk,
        offTrack,
        onTrackPct: Math.round((onTrack / Math.max(total, 1)) * 100),
        atRiskPct: Math.round((atRisk / Math.max(total, 1)) * 100),
        offTrackPct: Math.round((offTrack / Math.max(total, 1)) * 100),
        healthScore,
      };
    })
    .sort((a, b) => b.total - a.total);
}

function buildUpcomingMilestones(pillarFasts) {
  const dueOffsets = [3, 5, 8, 12, 15, 18, 22, 26, 28, 10, 14, 20, 24, 29, 7, 17];
  let offsetIdx = 0;
  const milestones = [];
  pillarFasts.forEach((fast) => {
    fast.initiatives.forEach((ini) => {
      const progress = ini.projects[0]?.progress ?? 0;
      const band = classifyProgressBand(progress);
      const dueDate = addDaysToIso(COCKPIT_ANCHOR_DATE, dueOffsets[offsetIdx % dueOffsets.length]);
      milestones.push({
        id: `${fast.id}-${ini.id}`,
        initiative: ini.name,
        imperative: IMPERATIVE_LABELS[fast.shortName] || fast.shortName,
        dueDate,
        daysLeft: daysBetweenIso(COCKPIT_ANCHOR_DATE, dueDate),
        status: band,
        statusLabel: progressBandLabel(band),
        fastId: fast.id,
        initiativeId: ini.id,
      });
      offsetIdx += 1;
    });
  });
  return milestones
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

function buildQuarterlyComparisonStats(rows) {
  if (rows.length < 2) return { onTrackDelta: 0, atRiskDelta: 0, offTrackDelta: 0 };
  const pct = (row) => {
    const total = row.onTrack + row.atRisk + row.delayed;
    if (!total) return { on: 0, risk: 0, off: 0 };
    return {
      on: Math.round((row.onTrack / total) * 100),
      risk: Math.round((row.atRisk / total) * 100),
      off: Math.round((row.delayed / total) * 100),
    };
  };
  const cur = pct(rows[rows.length - 1]);
  const prev = pct(rows[rows.length - 2]);
  return {
    onTrackDelta: cur.on - prev.on,
    atRiskDelta: cur.risk - prev.risk,
    offTrackDelta: cur.off - prev.off,
  };
}

function buildLastQuarterSummary(quarterlyBars, ceoSummary, milestoneCount = 8) {
  const row = quarterlyBars.length >= 2
    ? quarterlyBars[quarterlyBars.length - 2]
    : quarterlyBars[quarterlyBars.length - 1];
  if (!row) {
    return {
      label: 'Q1 2026',
      onTrackPct: 61,
      atRiskPct: 23,
      offTrackPct: 16,
      totalInitiatives: ceoSummary?.totalInitiatives ?? 26,
      healthScore: ceoSummary?.overallHealth ?? 81,
      milestoneCount,
    };
  }
  const total = row.onTrack + row.atRisk + row.delayed || 1;
  return {
    label: row.quarter,
    onTrackPct: Math.round((row.onTrack / total) * 100),
    atRiskPct: Math.round((row.atRisk / total) * 100),
    offTrackPct: Math.round((row.delayed / total) * 100),
    totalInitiatives: ceoSummary?.totalInitiatives ?? 26,
    healthScore: ceoSummary?.overallHealth ?? 81,
    milestoneCount,
  };
}

function buildKeyHighlights(quarterlyStats, ceoSummary, executiveMetrics, milestoneCount = 8) {
  const onTrackDelta = Math.max(quarterlyStats.onTrackDelta, 0) || 27;
  const atRiskReduced = Math.max(-quarterlyStats.atRiskDelta, 0) || 4;
  const completed = Math.max(ceoSummary.completedProjects, 26);
  const healthScore = executiveMetrics?.healthScore ?? ceoSummary.overallHealth ?? 81;
  const subInitiatives = executiveMetrics?.subInitiatives ?? 84;
  const onTrackCount = executiveMetrics?.onTrackCount ?? ceoSummary.onTrackProjects ?? 17;

  return [
    {
      id: 'ontrack',
      tone: 'on-track',
      icon: '↑',
      text: `On Track initiatives improved by ${onTrackDelta}%`,
    },
    {
      id: 'atrisk',
      tone: 'at-risk',
      icon: '!',
      text: `At Risk initiatives reduced by ${atRiskReduced}%`,
    },
    {
      id: 'complete',
      tone: 'complete',
      icon: '✓',
      text: `${completed} initiatives completed this quarter`,
    },
    {
      id: 'health',
      tone: 'complete',
      icon: '◆',
      text: `Portfolio health reached ${healthScore}% overall`,
    },
    {
      id: 'milestones',
      tone: 'on-track',
      icon: '◎',
      text: `${milestoneCount} upcoming milestones on schedule this quarter`,
    },
    {
      id: 'coverage',
      tone: 'complete',
      icon: '▣',
      text: `${subInitiatives} sub-initiatives tracked across ${onTrackCount} active programs`,
    },
  ];
}

const RISK_PARENT_LABELS = {
  'Deliver on BU & Functional Priorities & KTLO': 'Core Business Delivery',
  'AI Foundation': 'AI Product Delivery',
  'Data and Intelligence Layer': 'Data Platform Modernization',
  'AI Accelerated EVC Revenue': 'NextGen Migration Factory',
  'AI Accelerated AVM Revenue': 'Marketplace Expansion',
  'AI Accelerated CXP Revenue': 'Customer Experience Growth',
  'GPT Operations & Engagement': 'Workforce Modernization',
};

const COCKPIT_TOP_RISKS_SUPPLEMENT = [
  {
    id: 'data-platform-modernization',
    title: 'Data Platform Modernization',
    score: 19,
    atRiskCount: 2,
    tone: 'medium',
    status: 'delayed',
  },
  {
    id: 'marketplace-expansion',
    title: 'Marketplace Expansion',
    score: 17,
    atRiskCount: 1,
    tone: 'medium',
    status: 'delayed',
  },
  {
    id: 'cloud-infrastructure',
    title: 'Cloud Infrastructure',
    score: 16,
    atRiskCount: 1,
    tone: 'low',
    status: 'on-track',
  },
];

function buildTopRisks(pillarFasts) {
  const clusters = new Map();

  pillarFasts.forEach((fast) => {
    fast.initiatives.forEach((ini) => {
      const progress = ini.projects[0]?.progress ?? 0;
      if (classifyProgressBand(progress) === 'on-track') return;

      const ref = INITIATIVE_TRACKER_REF[ini.name.toLowerCase()];
      const parentKey = ref?.initiative ?? ini.name;
      const title = RISK_PARENT_LABELS[parentKey]
        ?? parentKey.replace(/\s*&\s*KTLO/i, '').trim();
      const score = Math.min(30, Math.max(15, Math.round(32 - progress * 0.25)));

      if (!clusters.has(parentKey)) {
        clusters.set(parentKey, {
          id: toSlug(parentKey),
          title,
          scores: [],
          atRiskCount: 0,
        });
      }

      const cluster = clusters.get(parentKey);
      cluster.scores.push(score);
      cluster.atRiskCount += 1;
    });
  });

  const computed = Array.from(clusters.values())
    .map((cluster) => {
      const score = Math.round(
        cluster.scores.reduce((sum, value) => sum + value, 0) / Math.max(cluster.scores.length, 1),
      );
      const tone = score >= 22 ? 'high' : score >= 18 ? 'medium' : 'low';
      return {
        id: cluster.id,
        title: cluster.title,
        score,
        atRiskCount: cluster.atRiskCount,
        tone,
        status: tone === 'high' ? 'at-risk' : tone === 'medium' ? 'delayed' : 'on-track',
      };
    });

  const computedIds = new Set(computed.map((row) => row.id));
  const computedTitles = new Set(computed.map((row) => row.title));
  const supplement = COCKPIT_TOP_RISKS_SUPPLEMENT.filter(
    (row) => !computedIds.has(row.id) && !computedTitles.has(row.title),
  );

  return [...computed, ...supplement].sort((a, b) => b.score - a.score);
}

const RISK_GAUGE_COLORS = {
  high: '#ef4444',
  medium: '#f59e0b',
  low: '#eab308',
};

function RiskScoreGauge({ score, tone }) {
  const color = RISK_GAUGE_COLORS[tone] || RISK_GAUGE_COLORS.medium;
  const radius = 26;
  const cx = 32;
  const cy = 34;
  const arcLength = Math.PI * radius;
  const dash = arcLength * (score / 30);
  const trackPath = `M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`;

  return (
    <div className={`def-cockpit-risk-gauge tone-${tone}`} aria-hidden="true">
      <svg viewBox="0 0 64 44" className="def-cockpit-risk-gauge-svg">
        <path d={trackPath} fill="none" stroke="rgba(148,163,184,0.28)" strokeWidth="5" strokeLinecap="round" />
        <path
          d={trackPath}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLength}`}
        />
      </svg>
      <div className="def-cockpit-risk-gauge-meta">
        <strong>{score}</strong>
        <span>Risk Score</span>
      </div>
    </div>
  );
}

function TopRisksList({ rows, compact = false }) {
  const preview = compact ? rows.slice(0, COCKPIT_TOP_RISKS_PREVIEW_LIMIT) : rows;
  return (
    <ul className="def-cockpit-top-risk-list">
      {preview.map((row) => (
        <li key={row.id} className={`def-cockpit-top-risk-item tone-${row.tone}`}>
          <RiskScoreGauge score={row.score} tone={row.tone} />
          <div className="def-cockpit-top-risk-copy">
            <strong>{row.title}</strong>
            <small>
              {row.atRiskCount} initiative{row.atRiskCount === 1 ? '' : 's'} at risk
            </small>
          </div>
        </li>
      ))}
      {preview.length === 0 && (
        <li className="def-cockpit-top-risk-empty">No elevated risks in the active portfolio.</li>
      )}
    </ul>
  );
}

function TopRisksTable({ rows }) {
  return (
    <ModalProTableShell>
      <table className="def-modal-pro-table def-modal-pro-table-risks">
        <thead>
          <tr>
            <th>Risk Area</th>
            <th>Risk Score</th>
            <th>Initiatives at Risk</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td data-label="Risk area"><strong>{row.title}</strong></td>
              <td data-label="Risk score">
                <span className={`def-modal-risk-score tone-${row.tone}`}>{row.score}</span>
              </td>
              <td data-label="Initiatives at risk">
                <span className="def-modal-count-chip">{row.atRiskCount}</span>
              </td>
              <td data-label="Status">
                <StatusPill status={row.status} />
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="def-cockpit-empty">No elevated risks in the active portfolio.</td></tr>
          )}
        </tbody>
      </table>
    </ModalProTableShell>
  );
}

function TopRisksDrawer({ open, onClose, rows }) {
  const highCount = rows.filter((row) => row.tone === 'high').length;
  const totalAtRisk = rows.reduce((sum, row) => sum + row.atRiskCount, 0);
  const avgScore = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + row.score, 0) / rows.length)
    : 0;

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-top-risks-drawer-title"
      closeLabel="Close top risks"
      title="Top Risks"
      description="Executive view of the highest-risk delivery areas in the portfolio"
      sectionTitle="Risk scorecard"
      sectionCount={`${rows.length} areas`}
      stats={(
        <>
          <StatusPill status={highCount > 0 ? 'at-risk' : 'on-track'} />
          <span
            className="def-drawer-pillar-score"
            style={{ color: healthColor(Math.max(0, 100 - avgScore * 3)) }}
          >
            {avgScore} avg score
          </span>
          <span className="def-drawer-pillar-meta">
            {rows.length} risk areas
            {' | '}
            {totalAtRisk} initiatives at risk
          </span>
        </>
      )}
    >
      <TopRisksTable rows={rows} />
    </CockpitInsightsDrawer>
  );
}

function TopRisksPanel({ rows, stagger = '200ms' }) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div
        className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-cockpit-top-risks-panel def-stagger-in"
        style={{ '--stagger': stagger }}
      >
        <CockpitPanelHeader title="Top Risks" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll def-cockpit-panel-body def-cockpit-top-risks-scroll">
          <TopRisksList rows={rows} compact />
        </div>
      </div>
      <TopRisksDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} rows={rows} />
    </>
  );
}

function buildPortfolioTrends(summary) {
  const { onTrackProjects, atRiskProjects, offTrackProjects, overallHealth } = summary;
  const syncPoint = (point) => ({
    ...point,
    onTrack: onTrackProjects,
    atRisk: atRiskProjects,
    delayed: offTrackProjects,
    close: overallHealth,
  });
  return {
    targetHealth: 80,
    symbol: 'PORTFOLIO',
    ranges: ['8W', '6M'],
    weekly: [
      { label: '31 Mar', open: 62, high: 65, low: 60, close: 63, volume: 1840, onTrack: 8, atRisk: 10, delayed: 8, utilization: 81 },
      { label: '7 Apr', open: 63, high: 66, low: 61, close: 64, volume: 1920, onTrack: 9, atRisk: 9, delayed: 8, utilization: 82 },
      { label: '14 Apr', open: 64, high: 67, low: 62, close: 66, volume: 2050, onTrack: 10, atRisk: 8, delayed: 8, utilization: 83 },
      { label: '21 Apr', open: 66, high: 69, low: 64, close: 68, volume: 2180, onTrack: 12, atRisk: 8, delayed: 6, utilization: 84 },
      { label: '28 Apr', open: 68, high: 71, low: 66, close: 70, volume: 2010, onTrack: 14, atRisk: 7, delayed: 5, utilization: 85 },
      { label: '5 May', open: 70, high: 73, low: 68, close: 73, volume: 2240, onTrack: 15, atRisk: 6, delayed: 5, utilization: 86 },
      { label: '12 May', open: 73, high: 76, low: 71, close: 75, volume: 2090, onTrack: 16, atRisk: 6, delayed: 4, utilization: 87 },
      { label: '19 May', open: 75, high: 78, low: 73, close: 77, volume: 2160, onTrack: 17, atRisk: 5, delayed: 4, utilization: 87 },
    ].map((point, index, arr) => (index === arr.length - 1 ? syncPoint(point) : point)),
    monthly: [
      { label: 'Dec', open: 68, high: 70, low: 66, close: 69, volume: 8200, onTrack: 12, atRisk: 7, delayed: 7, utilization: 78 },
      { label: 'Jan', open: 69, high: 70, low: 65, close: 67, volume: 8450, onTrack: 11, atRisk: 7, delayed: 8, utilization: 80 },
      { label: 'Feb', open: 67, high: 68, low: 64, close: 65, volume: 8680, onTrack: 11, atRisk: 6, delayed: 9, utilization: 82 },
      { label: 'Mar', open: 65, high: 67, low: 63, close: 64, volume: 8920, onTrack: 10, atRisk: 7, delayed: 9, utilization: 83 },
      { label: 'Apr', open: 64, high: 67, low: 63, close: 65, volume: 9100, onTrack: 11, atRisk: 6, delayed: 9, utilization: 85 },
      { label: 'May', open: 65, high: 67, low: 64, close: 65, volume: 9280, onTrack: 11, atRisk: 6, delayed: 9, utilization: 87 },
    ].map((point, index, arr) => (index === arr.length - 1 ? syncPoint(point) : point)),
  };
}

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

function StatusPill({ status }) {
  const meta = STATUS_META[status] || { label: status, color: '#64748b', bg: '#f1f5f9' };
  const isCritical = CRITICAL_STATUS.has(status);
  return (
    <span
      className={`def-pill${isCritical ? ' def-pill-pulse' : ''}`}
      style={{ color: meta.color, background: meta.bg, borderColor: `${meta.color}44`, boxShadow: `0 0 0 1px ${meta.color}18` }}
    >
      {isCritical && <span className="def-pill-dot" style={{ background: meta.color }} />}
      {meta.label}
    </span>
  );
}

function RiskBadge({ risk }) {
  const meta = RISK_META[risk] || { label: risk, color: '#64748b' };
  return (
    <span className="def-risk" style={{ color: meta.color, borderColor: `${meta.color}33`, background: `${meta.color}0d` }}>
      {meta.label}
    </span>
  );
}

function ProgressBar({ value, color, animate = true }) {
  const fillColor = color || healthColor(value);
  return (
    <div className="def-progress-track">
      <div
        className={`def-progress-fill${animate ? ' def-progress-animate' : ''}`}
        style={{ '--def-progress': `${Math.min(value, 100)}%`, background: fillColor }}
      />
    </div>
  );
}

function SectionCard({ title, desc, children, className = '' }) {
  return (
    <section className={`def-panel ${className}`.trim()}>
      {(title || desc) && (
        <div className="def-panel-head">
          {title && <h2 className="def-section-title">{title}</h2>}
          {desc && <p className="def-section-desc">{desc}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

function HierarchyTrail({ items }) {
  if (!items?.length) return null;
  return (
    <nav className="def-breadcrumb" aria-label="Organization hierarchy">
      {items.map((item, index) => (
        <span key={item.key} className="def-bc-item">
          {index > 0 && <span className="def-bc-sep" aria-hidden="true">/</span>}
          {item.onClick ? (
            <button type="button" className="def-bc-link" onClick={item.onClick}>
              {item.tier && <span className="def-bc-tier">{item.tier}</span>}
              {item.label}
            </button>
          ) : (
            <span className="def-bc-current">
              {item.tier && <span className="def-bc-tier">{item.tier}</span>}
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}

function AppSidebar({
  layer,
  fastCategory,
  initiative,
  onGoCeo,
  onSelectFast,
  onSelectInitiative,
  open,
  onNavigate,
}) {
  const pillarFasts = ORG_DATA.fastCategories;

  const [expandedFast, setExpandedFast] = useState(null);

  useEffect(() => {
    setExpandedFast(fastCategory?.id ?? null);
  }, [fastCategory?.id]);

  const goCeo = () => {
    onGoCeo();
    onNavigate?.();
  };

  const pickFast = (fastId) => {
    onSelectFast(fastId);
    setExpandedFast(fastId);
    onNavigate?.();
  };

  const pickInitiative = (fastId, initiativeId) => {
    onSelectInitiative(fastId, initiativeId);
    setExpandedFast(fastId);
    onNavigate?.();
  };

  const toggleFast = (fastId) => {
    setExpandedFast((prev) => (prev === fastId ? null : fastId));
  };

  return (
    <aside className={`def-sidebar${open ? ' def-sidebar-open' : ''}`}>
      <nav className="def-sidebar-nav">
        <p className="def-sidebar-label">Executive</p>
        <button
          type="button"
          className={`def-sidebar-link def-sidebar-link-ceo${layer === 'ceo' ? ' active' : ''}`}
          onClick={goCeo}
        >
          <span className="def-sidebar-tier def-sidebar-tier-ceo">CC</span>
          <span className="def-sidebar-link-text">
            <strong>Command Center Cockpit</strong>
            <small>Portfolio health & FAST pillars</small>
          </span>
        </button>

        <p className="def-sidebar-label def-sidebar-label-section">
          FAST pillars
          <span className="def-sidebar-count">{pillarFasts.length}</span>
        </p>

        {pillarFasts.map((fast) => {
          const isExpanded = expandedFast === fast.id;
          const isActive = fastCategory?.id === fast.id;
          const isSelected = isActive && layer !== 'ceo';
          return (
            <div key={fast.id} className={`def-sidebar-group${isActive ? ' active' : ''}${isExpanded ? ' expanded' : ''}`}>
              <div
                className={`def-sidebar-pillar-card${isSelected ? ' is-selected' : ''}`}
                role="button"
                tabIndex={0}
                onClick={() => pickFast(fast.id)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    pickFast(fast.id);
                  }
                }}
                aria-label={`Open ${fast.shortName} pillar`}
              >
                <div className="def-sidebar-pillar-head">
                  <span className="def-sidebar-tier def-sidebar-tier-mgr">{fast.shortName.slice(0, 2)}</span>
                  <div className="def-sidebar-pillar-copy">
                    <strong title={fast.shortName}>{fast.shortName}</strong>
                    <span>
                      {fast.initiatives.length} initiatives
                    </span>
                  </div>
                  <div className="def-sidebar-pillar-actions">
                    <button
                      type="button"
                      className={`def-sidebar-pillar-expand${isExpanded ? ' open' : ''}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        toggleFast(fast.id);
                      }}
                      aria-expanded={isExpanded}
                      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} initiatives under ${fast.shortName}`}
                    >
                      {isExpanded ? 'v' : '>'}
                    </button>
                  </div>
                </div>
              </div>
              {isExpanded && (
                <div className="def-sidebar-nested">
                  <p className="def-sidebar-sublabel">
                    Initiatives
                    <span className="def-sidebar-count">{fast.initiatives.length}</span>
                  </p>
                  {fast.initiatives.map((ini) => {
                    const isIniActive = initiative?.id === ini.id && fastCategory?.id === fast.id;
                    const ownerLabel = ini.owner && ini.owner !== 'N/A' ? ini.owner : 'Unassigned';
                    const teamLabel = ini.team?.name && ini.team.name !== 'N/A' ? ini.team.name : 'No team';
                    return (
                      <button
                        key={ini.id}
                        type="button"
                        className={`def-sidebar-ini-link${isIniActive ? ' active' : ''}`}
                        onClick={() => pickInitiative(fast.id, ini.id)}
                        aria-label={`${ini.name}, ${ownerLabel}`}
                      >
                        <span className="def-sidebar-ini-name" title={ini.name}>{ini.name}</span>
                        <span
                          className="def-sidebar-ini-meta"
                          title={`Owner: ${ownerLabel} | Team: ${teamLabel}`}
                        >
                          {ownerLabel} | {teamLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </nav>
    </aside>
  );
}

function AppFooter({ compact = false }) {
  return (
    <footer className={`def-footer${compact ? ' def-footer-compact' : ''}`}>
      <span>{ORG_DATA.ceoSummary.totalProjects} projects tracked</span>
    </footer>
  );
}

function Avatar({ name, tone = 'blue' }) {
  return <span className={`def-avatar def-avatar-${tone}`}>{getInitials(name)}</span>;
}

function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      type="button"
      className="def-theme-toggle"
      onClick={onToggle}
      aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      title={theme === 'light' ? 'Dark mode' : 'Light mode'}
    >
      {theme === 'light' ? '☾' : '☀'}
    </button>
  );
}

const THEME_STORAGE_KEY = 'adp-demo-theme';


function sparkSeries(weekly, pick) {
  return weekly.map((w, ix) => ({ ix, v: pick(w) }));
}

function progressBandLabel(band) {
  if (band === 'on-track') return 'On Track';
  if (band === 'at-risk') return 'At Risk';
  return 'Off Track';
}

function buildCockpitAnalytics(orgData, filterFastId) {
  const { fastCategories, ceoTrends, ceoSummary: globalSummary } = orgData;
  const pillarFasts = filterFastId ? fastCategories.filter((f) => f.id === filterFastId) : fastCategories;
  const ceoSummary = filterFastId ? computePortfolioSummary(pillarFasts) : globalSummary;

  const weekly = ceoTrends.weekly;
  const monthly = ceoTrends.monthly.slice(-4);

  const quarterlyBars = monthly.map((m, i) => ({
    quarter: `${m.label}`,
    onTrack: m.onTrack ?? 0,
    atRisk: m.atRisk ?? 0,
    delayed: m.delayed ?? 0,
    sortKey: i,
  }));

  const initiativeTracker = buildInitiativeTrackerRows(pillarFasts);
  const upcomingMilestones = buildUpcomingMilestones(pillarFasts);

  const lastQuarterBullets = [
    `Average team utilization was ${weekly[weekly.length - 1]?.utilization ?? 85}%. Portfolio health ended near ${weekly[weekly.length - 1]?.close ?? ceoSummary.overallHealth}%.`,
    `${ceoSummary.onTrackPct}% of projects are on track across FAST pillars.`,
    `${ceoSummary.atRiskProjects > 0 ? `${ceoSummary.atRiskProjects} initiatives need executive sponsorship` : 'No major executive sponsorship gaps this quarter'}.`,
  ];

  const sparks = {
    health: sparkSeries(weekly, (w) => w.close),
    mix: sparkSeries(weekly, (w) => w.onTrack + w.atRisk * 1.05),
    pillars: sparkSeries(weekly, (w) => w.close * 1.03),
    initiatives: sparkSeries(weekly, (w) => w.onTrack + w.atRisk),
    onTrack: sparkSeries(weekly, (w) => w.onTrack * 11),
    atRisk: sparkSeries(weekly, (w) => w.atRisk * 12 + 18),
    offTrack: sparkSeries(weekly, (w) => w.delayed * 10 + 8),
  };

  const executiveMetrics = computeExecutiveMetrics(pillarFasts);
  const quarterlyStats = buildQuarterlyComparisonStats(quarterlyBars);

  return {
    ceoSummary,
    executiveMetrics,
    quarterlyBars,
    quarterlyStats,
    initiativeTracker,
    ownershipOverview: buildOwnershipOverview(pillarFasts),
    upcomingMilestones,
    lastQuarterSummary: buildLastQuarterSummary(quarterlyBars, ceoSummary, upcomingMilestones.length),
    keyHighlights: buildKeyHighlights(
      quarterlyStats,
      ceoSummary,
      executiveMetrics,
      upcomingMilestones.length,
    ),
    topRisks: buildTopRisks(pillarFasts),
    lastQuarterBullets,
    sparks,
  };
}

function useViewport() {
  const [vp, setVp] = useState(() => ({
    compact: false,
    isMobile: false,
    isTablet: false,
    isSmallLaptop: false,
    isCompactLaptop: false,
    chartH: 210,
    panelChartH: 168,
    panelMinH: 320,
    bottomMinH: 300,
    fastChartH: 108,
    healthDotSize: 44,
    healthDotCore: 38,
  }));

  useEffect(() => {
    const sync = () => {
      const width = window.innerWidth;
      const isSmallLaptop = width < 1280;
      const isCompactLaptop = width < 1366;
      setVp({
        compact: width < 640,
        isMobile: width < 480,
        isTablet: width < 768,
        isSmallLaptop,
        isCompactLaptop,
        chartH: width < 480 ? 160 : width < 640 ? 180 : width < 768 ? 195 : width < 1024 ? 205 : width < 1280 ? 212 : width < 1536 ? 218 : 220,
        panelChartH: width < 480 ? 136 : width < 640 ? 148 : width < 768 ? 156 : width < 1024 ? 160 : width < 1280 ? 164 : width < 1536 ? 168 : 172,
        panelMinH: width < 768 ? 0 : width < 1024 ? 280 : width < 1280 ? 292 : width < 1536 ? 308 : 320,
        bottomMinH: width < 768 ? 0 : width < 1024 ? 260 : width < 1280 ? 272 : width < 1536 ? 286 : 300,
        fastChartH: width < 1180 ? 80 : width < 1280 ? 84 : width < 1366 ? 92 : width < 1536 ? 100 : 108,
        healthDotSize: width < 1180 ? 32 : width < 1280 ? 36 : width < 1366 ? 40 : 44,
        healthDotCore: width < 1180 ? 28 : width < 1280 ? 32 : width < 1366 ? 34 : 38,
      });
    };
    sync();
    window.addEventListener('resize', sync, { passive: true });
    return () => window.removeEventListener('resize', sync);
  }, []);

  return vp;
}

const FAST_PILLAR_ICONS = {
  FOCUS: '◎',
  ACCELERATE: '⚡',
  SCALE: '◆',
  TRANSFORM: '↻',
};

const TOWER_LEAD_ICONS = {
  ET: '🏢',
  BV: '◈',
  PD: '⚙',
  OT: '◫',
};

const TOWER_LEADS_DATA = [
  {
    id: 'enterprise-tech',
    shortName: 'ET',
    name: 'Enterprise Tech',
    subtitle: 'Enterprise technology initiatives',
    initiatives: 2,
    onTrack: 2,
    atRisk: 0,
    offTrack: 0,
  },
  {
    id: 'breakthrough-ventures',
    shortName: 'BV',
    name: 'Breakthrough Ventures',
    subtitle: 'Ventures and breakthrough bets',
    initiatives: 3,
    onTrack: 1,
    atRisk: 1,
    offTrack: 1,
  },
  {
    id: 'product-and-development',
    shortName: 'PD',
    name: 'Product and Development',
    subtitle: 'Product and development programs',
    initiatives: 13,
    onTrack: 13,
    atRisk: 0,
    offTrack: 0,
  },
  {
    id: 'others',
    shortName: 'OT',
    name: 'Others',
    subtitle: 'Other portfolio initiatives',
    initiatives: 8,
    onTrack: 8,
    atRisk: 0,
    offTrack: 0,
  },
];

const COCKPIT_METRIC_ICONS = {
  'Strategic Imperatives': '🏛',
  Initiatives: '📊',
  'Sub-Initiatives': '📋',
  'On Track': '✓',
  'At Risk': '◐',
  'Off Track': '⚠',
  'Portfolio Health Score': '◆',
};

function ChartLegendRow({ items }) {
  return (
    <div className="def-chart-legend-row" aria-label="Chart legend">
      {items.map((item) => (
        <span key={item.label} className="def-chart-legend-item">
          <i style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  );
}

function MetricSparkTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="def-cockpit-metric-spark-tip">
      <strong>{Math.round(payload[0].value)}</strong>
    </div>
  );
}

function CockpitMetricSpark({ data, stroke, fillId = 'metricSparkFill' }) {
  const line = stroke || '#6366f1';
  return (
    <div className="def-cockpit-metric-spark">
      <ResponsiveContainer width="100%" height={24}>
        <AreaChart data={data} margin={{ top: 6, right: 2, bottom: 0, left: 2 }}>
          <defs>
            <linearGradient id={fillId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={line} stopOpacity={0.28} />
              <stop offset="100%" stopColor={line} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <XAxis dataKey="ix" hide />
          <YAxis hide domain={['dataMin - 2', 'dataMax + 2']} />
          <Tooltip
            content={<MetricSparkTooltip />}
            cursor={{ stroke: line, strokeWidth: 1, strokeDasharray: '3 3' }}
            isAnimationActive={false}
          />
          <Area
            type="monotone"
            dataKey="v"
            stroke={line}
            strokeWidth={2.25}
            fill={`url(#${fillId})`}
            dot={false}
            activeDot={{ r: 3.5, fill: line, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive
            animationDuration={900}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function CockpitPortfolioScopeCard({ metrics, delay = '0ms' }) {
  const items = [
    { key: 'imperatives', label: 'Strategic Imperatives', value: metrics.strategicImperatives },
    { key: 'initiatives', label: 'Initiatives', value: metrics.initiatives },
  ];

  return (
    <article
      className="def-cockpit-metric-card def-cockpit-metric-scope def-cockpit-interactive def-accent-indigo def-stagger-in"
      style={{ '--stagger': delay }}
      aria-label="Active portfolio counts"
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-metric-scope-head">
        <div className="def-cockpit-metric-icon" aria-hidden="true">📁</div>
        <span className="def-cockpit-metric-label">Active portfolio</span>
      </div>
      <div className="def-cockpit-metric-scope-grid">
        {items.map((item) => (
          <div key={item.key} className="def-cockpit-metric-scope-item">
            <strong className="def-cockpit-metric-scope-value">{item.value}</strong>
            <span className="def-cockpit-metric-scope-name">{item.label}</span>
          </div>
        ))}
      </div>
    </article>
  );
}

function classifyOverallHealthLevel(score) {
  if (score > 80) return { tone: 'green', color: '#22c55e', label: 'Healthy' };
  if (score >= 60) return { tone: 'yellow', color: '#eab308', label: 'Watch' };
  return { tone: 'red', color: '#ef4444', label: 'Critical' };
}

function CockpitOverallHealthCard({ score, delay = '0ms' }) {
  const level = classifyOverallHealthLevel(score);
  const legend = [
    { key: 'green', label: 'Green >80', color: '#22c55e', active: score > 80 },
    { key: 'yellow', label: 'Yellow 60-80', color: '#eab308', active: score >= 60 && score <= 80 },
    { key: 'red', label: 'Red <60', color: '#ef4444', active: score < 60 },
  ];

  return (
    <article
      className={`def-cockpit-metric-card def-cockpit-overall-health def-cockpit-interactive def-stagger-in tone-${level.tone}`}
      style={{ '--stagger': delay, '--health-dot-color': level.color }}
      aria-label={`Overall health score ${score}`}
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-overall-health-head">
        <div className="def-cockpit-metric-icon" aria-hidden="true">◆</div>
        <span className="def-cockpit-metric-label">Overall health</span>
      </div>
      <div className="def-cockpit-overall-health-body">
        <ul className="def-cockpit-overall-health-legend" aria-label="Health score ranges">
          {legend.map((item) => (
            <li key={item.key} className={item.active ? 'is-active' : undefined} data-tone={item.key}>
              <i style={{ background: item.color }} aria-hidden="true" />
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className="def-cockpit-overall-health-dot-wrap" aria-hidden="true">
          <span className="def-cockpit-overall-health-dot">
            <span className="def-cockpit-overall-health-dot-core" />
          </span>
        </div>
      </div>
    </article>
  );
}

function getMetricCountTooltip(statusBand) {
  if (statusBand === 'on-track') return 'Initiatives on track in the active portfolio';
  if (statusBand === 'at-risk') return 'Initiatives at risk in the active portfolio';
  if (statusBand === 'off-track') return 'Initiatives off track in the active portfolio';
  return 'Initiative count in the active portfolio';
}

function getPillarHealthTooltip() {
  return 'Pillar health score — average initiative progress across this FAST pillar';
}

function OverlayTooltip({ tip, className = '', children, block = false, align = 'end' }) {
  const anchorRef = useRef(null);
  const tipRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [style, setStyle] = useState({ top: 0, left: 0, placement: 'top', arrowLeft: 10 });
  const Wrapper = block ? 'div' : 'span';

  const reposition = () => {
    const anchor = anchorRef.current;
    const tipEl = tipRef.current;
    if (!anchor) return;

    const rect = anchor.getBoundingClientRect();
    const gap = 8;
    const pad = 8;
    const maxWidth = 210;
    const tipWidth = Math.min(tipEl?.offsetWidth || maxWidth, maxWidth);
    const tipHeight = tipEl?.offsetHeight || 44;

    let left = align === 'center'
      ? rect.left + (rect.width - tipWidth) / 2
      : rect.right - tipWidth;
    left = Math.max(pad, Math.min(left, window.innerWidth - tipWidth - pad));

    let placement = 'top';
    let top = rect.top - gap;
    if (rect.top - tipHeight - gap < pad) {
      placement = 'bottom';
      top = rect.bottom + gap;
    }

    const anchorX = align === 'center' ? rect.left + rect.width / 2 : rect.right - 6;
    const arrowLeft = Math.max(12, Math.min(anchorX - left, tipWidth - 12));
    setStyle({ top, left, placement, arrowLeft });
  };

  useLayoutEffect(() => {
    if (!open) return undefined;
    reposition();
    const handle = () => reposition();
    window.addEventListener('scroll', handle, true);
    window.addEventListener('resize', handle);
    return () => {
      window.removeEventListener('scroll', handle, true);
      window.removeEventListener('resize', handle);
    };
  }, [open, tip, align]);

  return (
    <>
      <Wrapper
        ref={anchorRef}
        className={className}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      >
        {children}
      </Wrapper>
      {open && typeof document !== 'undefined' && createPortal(
        <div
          ref={tipRef}
          className={`def-cockpit-overlay-tip placement-${style.placement}`}
          role="tooltip"
          style={{
            position: 'fixed',
            top: style.top,
            left: style.left,
            transform: style.placement === 'top' ? 'translateY(-100%)' : 'none',
            zIndex: 10000,
            '--tip-arrow-left': `${style.arrowLeft}px`,
          }}
        >
          {tip}
        </div>,
        document.body,
      )}
    </>
  );
}

function MetricCountPill({ count, statusBand }) {
  const tip = getMetricCountTooltip(statusBand);
  return (
    <span
      className="def-cockpit-metric-pill"
      tabIndex={0}
      aria-label={`${count} ${tip}`}
    >
      {count}
    </span>
  );
}

function CockpitMetricCard({
  title,
  value,
  valueSuffix,
  subtitle,
  accent,
  spark,
  delay = '0ms',
  showSpark = false,
  valueTone,
  statusBand,
  iconRight = false,
  trendSub = false,
  trendDown = false,
}) {
  const bandTheme = statusBand ? getProgressBandTheme(statusBand) : null;
  const resolvedTone = bandTheme?.tone ?? valueTone;
  const resolvedAccent = bandTheme?.accent ?? accent;
  const icon = COCKPIT_METRIC_ICONS[title] || '●';
  const isCountCard = iconRight;
  const isHealthCard = title === 'Portfolio Health Score';
  const healthPct = isHealthCard
    ? Math.max(0, Math.min(100, Number.parseInt(String(value), 10) || 0))
    : 0;
  const sparkFillId = `metric-spark-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const countTip = statusBand && subtitle && !isHealthCard
    ? getMetricCountTooltip(statusBand)
    : null;

  const card = (
    <article
      className={[
        'def-cockpit-metric-card',
        'def-cockpit-interactive',
        'def-stagger-in',
        isCountCard && 'metric-count',
        showSpark && 'metric-status',
        isHealthCard && 'metric-health',
        statusBand && `status-${statusBand}`,
        resolvedAccent,
      ].filter(Boolean).join(' ')}
      style={{
        '--stagger': delay,
        ...(bandTheme ? {
          '--metric-band-color': bandTheme.color,
          '--metric-band-label': bandTheme.label,
          '--metric-band-sub': bandTheme.sub,
          '--metric-band-border': bandTheme.border,
          '--metric-band-bg': bandTheme.cardBg,
          '--metric-icon-bg': bandTheme.iconBg,
          '--metric-icon-border': bandTheme.iconBorder,
        } : {}),
      }}
    >
      <span className="def-cockpit-metric-stripe" aria-hidden="true" />
      <div className="def-cockpit-metric-head">
        {!isCountCard ? (
          <div className="def-cockpit-metric-icon" aria-hidden="true">{icon}</div>
        ) : null}
        <span className="def-cockpit-metric-label">{title}</span>
        {isCountCard ? (
          <div className="def-cockpit-metric-icon metric-icon-tr" aria-hidden="true">{icon}</div>
        ) : null}
      </div>
      <div className="def-cockpit-metric-body">
        <div className="def-cockpit-metric-value-row">
          <strong className={`def-cockpit-metric-value${resolvedTone ? ` tone-${resolvedTone}` : ''}`}>
            {value}
            {valueSuffix ? <span className="def-cockpit-metric-denom">{valueSuffix}</span> : null}
          </strong>
          {statusBand && subtitle && !isHealthCard ? (
            <MetricCountPill count={subtitle} statusBand={statusBand} />
          ) : null}
        </div>
        {isHealthCard ? (
          <div className="def-cockpit-metric-health-track" aria-hidden="true">
            <span className="def-cockpit-metric-health-fill" style={{ width: `${healthPct}%` }} />
          </div>
        ) : null}
        {subtitle && (isCountCard || isHealthCard) ? (
          <small className={`def-cockpit-metric-sub${trendSub ? (trendDown ? ' trend-down' : ' trend-up') : ''}`}>
            {subtitle}
          </small>
        ) : null}
      </div>
      {showSpark && spark ? (
        <CockpitMetricSpark
          data={spark}
          stroke={bandTheme?.spark ?? (resolvedTone === 'amber' ? '#f59e0b' : resolvedTone === 'rose' ? '#ef4444' : resolvedTone === 'emerald' ? '#22c55e' : '#6366f1')}
          fillId={sparkFillId}
        />
      ) : null}
    </article>
  );

  if (countTip) {
    return (
      <OverlayTooltip
        tip={countTip}
        className="def-cockpit-metric-card-overlay"
        block
        align="center"
      >
        {card}
      </OverlayTooltip>
    );
  }

  return card;
}

function FastHealthCard({ fast, theme, onSelectFast, index = 0 }) {
  const vp = useViewport();
  const projects = fast.initiatives.flatMap((ini) => ini.projects);
  const { onTrack: onCount, atRisk: atCount, offTrack: lateCount } = countProjectsByProgressBand(projects);
  const total = Math.max(projects.length, 1);

  const data = [
    { name: 'On Track', value: onCount || 0, fill: '#22c55e' },
    { name: 'At Risk', value: atCount, fill: '#f59e0b' },
    { name: 'Off Track', value: lateCount, fill: '#ef4444' },
  ].filter((d) => d.value > 0);

  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className="def-cockpit-fast-health def-cockpit-interactive def-stagger-in"
      style={{ '--stagger': `${120 + index * 70}ms` }}
      onClick={() => onSelectFast?.(fast.id)}
      aria-label={`View ${fast.shortName} initiatives`}
    >
      <div className="def-cockpit-fast-head">
        <span className="def-cockpit-fast-icon">{FAST_PILLAR_ICONS[fast.shortName] || '●'}</span>
        <div className="def-cockpit-fast-titles">
          <div className="def-cockpit-fast-title-row">
            <p className="def-cockpit-fast-kicker">{fast.shortName}</p>
            <OverlayTooltip tip={getPillarHealthTooltip()} className="def-cockpit-fast-health-score-wrap">
              <span
                className="def-cockpit-fast-health-score"
                style={{ color: healthColor(fast.healthScore) }}
              >
                {fast.healthScore}%
              </span>
            </OverlayTooltip>
          </div>
          <h3>{formatFastPillarSubtitle(fast.name)}</h3>
        </div>
      </div>
      <div className="def-cockpit-fast-body">
        <div className="def-cockpit-fast-chart">
          <ResponsiveContainer width="100%" height={vp.fastChartH}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data.length ? data : [{ name: 'Empty', value: 1, fill: isDark ? '#334155' : '#e2e8f0' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              >
                {(data.length ? data : [{ fill: isDark ? '#334155' : '#e2e8f0' }]).map((e) => (
                  <Cell key={e.name || 'empty'} fill={e.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="def-cockpit-fast-donut-center">
            <strong>{total}</strong>
            <span>Initiatives</span>
          </div>
        </div>
        <ul className="def-cockpit-fast-legend">
          <li><i style={{ background: '#22c55e' }} aria-hidden="true" /><span>On track</span><strong>{onCount}</strong></li>
          <li><i style={{ background: '#f59e0b' }} aria-hidden="true" /><span>At risk</span><strong>{atCount}</strong></li>
          <li><i style={{ background: '#ef4444' }} aria-hidden="true" /><span>Off track</span><strong>{lateCount}</strong></li>
        </ul>
      </div>
    </button>
  );
}

function TowerLeadHealthCard({ lead, theme, index = 0 }) {
  const vp = useViewport();
  const total = Math.max(lead.initiatives, 1);

  const data = [
    { name: 'On Track', value: lead.onTrack || 0, fill: '#22c55e' },
    { name: 'At Risk', value: lead.atRisk, fill: '#f59e0b' },
    { name: 'Off Track', value: lead.offTrack, fill: '#ef4444' },
  ].filter((d) => d.value > 0);

  const isDark = theme === 'dark';

  return (
    <article
      className="def-cockpit-fast-health def-cockpit-tower-lead-card def-cockpit-interactive def-stagger-in"
      style={{ '--stagger': `${120 + index * 70}ms` }}
      aria-label={`${lead.name} tower lead summary`}
    >
      <div className="def-cockpit-fast-head">
        <span className="def-cockpit-fast-icon">{TOWER_LEAD_ICONS[lead.shortName] || '●'}</span>
        <div className="def-cockpit-fast-titles">
          <div className="def-cockpit-fast-title-row">
            <p className="def-cockpit-fast-kicker">{lead.shortName}</p>
          </div>
          <h3>{lead.name}</h3>
        </div>
      </div>
      <div className="def-cockpit-fast-body">
        <div className="def-cockpit-fast-chart">
          <ResponsiveContainer width="100%" height={vp.fastChartH}>
            <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
              <Pie
                data={data.length ? data : [{ name: 'Empty', value: 1, fill: isDark ? '#334155' : '#e2e8f0' }]}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="88%"
                paddingAngle={3}
                stroke="none"
                isAnimationActive
                animationDuration={800}
              >
                {(data.length ? data : [{ fill: isDark ? '#334155' : '#e2e8f0' }]).map((e) => (
                  <Cell key={e.name || 'empty'} fill={e.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="def-cockpit-fast-donut-center">
            <strong>{total}</strong>
            <span>Initiatives</span>
          </div>
        </div>
        <ul className="def-cockpit-fast-legend">
          <li><i style={{ background: '#22c55e' }} aria-hidden="true" /><span>On track</span><strong>{lead.onTrack}</strong></li>
          <li><i style={{ background: '#f59e0b' }} aria-hidden="true" /><span>At risk</span><strong>{lead.atRisk}</strong></li>
          <li><i style={{ background: '#ef4444' }} aria-hidden="true" /><span>Off track</span><strong>{lead.offTrack}</strong></li>
        </ul>
      </div>
    </article>
  );
}

const COCKPIT_OWNERSHIP_PREVIEW_LIMIT = 8;
const COCKPIT_MILESTONES_PREVIEW_LIMIT = 5;
const COCKPIT_TOP_RISKS_PREVIEW_LIMIT = 4;
const COCKPIT_KEY_HIGHLIGHTS_PREVIEW_LIMIT = 3;

function ModalProTableShell({ children, className = '' }) {
  return (
    <div className={`def-modal-pro-table-wrap${className ? ` ${className}` : ''}`}>
      <div className="def-modal-pro-table-scroll">
        {children}
      </div>
    </div>
  );
}

function CockpitInsightsDrawer({
  open,
  onClose,
  titleId,
  closeLabel,
  title,
  description,
  stats,
  sectionTitle,
  sectionCount,
  children,
}) {
  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const drawer = (
    <div className="def-drawer-root def-drawer-root-global open" role="presentation">
      <button type="button" className="def-drawer-backdrop" aria-label={closeLabel} onClick={onClose} />
      <aside
        className="def-drawer def-drawer-pillar def-drawer-pro def-cockpit-insights-drawer"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <header className="def-drawer-head def-drawer-head-pillar">
          <div className="def-drawer-head-row">
            <span className="def-drawer-tier">Portfolio insights</span>
            <button type="button" className="def-drawer-close" onClick={onClose} aria-label="Close">
              ×
            </button>
          </div>
          <h2 id={titleId}>{title}</h2>
          {description ? <p className="def-drawer-pillar-desc">{description}</p> : null}
          {stats ? <div className="def-drawer-pillar-stats">{stats}</div> : null}
        </header>
        <div className="def-drawer-body def-drawer-body-pillar">
          <div className="def-drawer-section-bar">
            <h3>{sectionTitle}</h3>
            <span>{sectionCount}</span>
          </div>
          <div className="def-drawer-pillar-table">
            {children}
          </div>
        </div>
      </aside>
    </div>
  );

  if (typeof document === 'undefined') return null;
  const host = document.getElementById('def-drawer-portal-host') || document.body;
  return createPortal(drawer, host);
}

function ModalBandCell({ count, pct, band }) {
  return (
    <span className={`def-modal-band-cell band-${band}`}>
      <strong>{count}</strong>
      <span className="def-modal-band-pct">{pct}%</span>
    </span>
  );
}

function CockpitPanelHeader({ title, actionLabel = 'View all', onViewAll }) {
  return (
    <div className="def-cockpit-panel-head">
      <h3 className="def-cockpit-card-title">{title}</h3>
      <button type="button" className="def-cockpit-view-all" onClick={onViewAll}>{actionLabel}</button>
    </div>
  );
}

function OwnershipOverviewTableBody({ rows, modal = false }) {
  const tableClass = modal
    ? 'def-modal-pro-table def-modal-pro-table-ownership'
    : 'def-cockpit-table def-cockpit-table-ownership';

  const table = (
    <table className={tableClass}>
      <thead>
        <tr>
          <th>Owner</th>
          <th>Total Initiatives</th>
          <th>On Track</th>
          <th>At Risk</th>
          <th>Off Track</th>
          <th>Health Score</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td data-label="Owner">
              <span className="def-cockpit-owner-cell def-modal-owner-cell">
                <Avatar name={row.owner} tone={resolveOwnerTone(row.owner)} />
                <strong>{row.owner}</strong>
              </span>
            </td>
            <td data-label="Total Initiatives">
              <span className="def-modal-count-chip">{row.total}</span>
            </td>
            <td data-label="On Track">
              <ModalBandCell count={row.onTrack} pct={row.onTrackPct} band="on-track" />
            </td>
            <td data-label="At Risk">
              <ModalBandCell count={row.atRisk} pct={row.atRiskPct} band="at-risk" />
            </td>
            <td data-label="Off Track">
              <ModalBandCell count={row.offTrack} pct={row.offTrackPct} band="off-track" />
            </td>
            <td data-label="Health Score">
              <span
                className="def-cockpit-health-pill def-modal-health-pill"
                style={{
                  color: healthColor(row.healthScore),
                  borderColor: `${healthColor(row.healthScore)}40`,
                  background: `${healthColor(row.healthScore)}16`,
                }}
              >
                {row.healthScore}
              </span>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={6} className="def-cockpit-empty">No ownership data.</td></tr>
        )}
      </tbody>
    </table>
  );

  if (modal) {
    return <ModalProTableShell>{table}</ModalProTableShell>;
  }
  return table;
}

function OwnershipOverviewDrawer({ open, onClose, rows }) {
  const totalOwners = rows.length;
  const totalInitiatives = rows.reduce((sum, row) => sum + row.total, 0);
  const avgHealth = Math.round(
    rows.reduce((sum, row) => sum + row.healthScore, 0) / Math.max(totalOwners, 1),
  );
  const portfolioStatus = statusFromHealthScore(avgHealth);

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-ownership-drawer-title"
      closeLabel="Close ownership overview"
      title="Ownership Overview"
      description="Initiative ownership across FAST pillars"
      sectionTitle="Owner breakdown"
      sectionCount={`${totalOwners} owners`}
      stats={(
        <>
          <StatusPill status={portfolioStatus} />
          <span
            className="def-drawer-pillar-score"
            style={{ color: healthColor(avgHealth) }}
          >
            {avgHealth}% health
          </span>
          <span className="def-drawer-pillar-meta">
            {totalOwners} owners
            {' | '}
            {totalInitiatives} initiatives
          </span>
        </>
      )}
    >
      <OwnershipOverviewTableBody rows={rows} modal />
    </CockpitInsightsDrawer>
  );
}

function OwnershipOverviewTable({ rows }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previewRows = rows.slice(0, COCKPIT_OWNERSHIP_PREVIEW_LIMIT);

  return (
    <>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-stagger-in" style={{ '--stagger': '160ms' }}>
        <CockpitPanelHeader title="Ownership Overview" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll wide def-cockpit-panel-body def-cockpit-table-preview">
          <OwnershipOverviewTableBody rows={previewRows} />
        </div>
      </div>
      <OwnershipOverviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rows={rows}
      />
    </>
  );
}

function UpcomingMilestonesTableBody({ rows, onOpenInitiative, modal = false }) {
  const tableClass = modal
    ? 'def-modal-pro-table def-modal-pro-table-milestones'
    : 'def-cockpit-table def-cockpit-table-milestones';

  const table = (
    <table className={tableClass}>
      <thead>
        <tr>
          <th>Initiative</th>
          <th>Strategic Imperative</th>
          <th>Due Date</th>
          <th>Days Left</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr
            key={row.id}
            className={onOpenInitiative ? 'def-cockpit-row-click def-modal-row-click' : undefined}
            onClick={onOpenInitiative ? () => onOpenInitiative(row.fastId, row.initiativeId) : undefined}
            onKeyDown={onOpenInitiative ? (event) => { if (event.key === 'Enter') onOpenInitiative(row.fastId, row.initiativeId); } : undefined}
            tabIndex={onOpenInitiative ? 0 : undefined}
            role={onOpenInitiative ? 'button' : undefined}
          >
            <td data-label="Initiative">
              <span className="def-cockpit-initiative-name">{row.initiative}</span>
            </td>
            <td data-label="Strategic Imperative">
              <span className="def-modal-imperative-chip">{row.imperative}</span>
            </td>
            <td data-label="Due Date">
              <span className="def-cockpit-due-date">{formatAppDate(row.dueDate)}</span>
            </td>
            <td data-label="Days Left">
              <span className="def-cockpit-days-left def-modal-days-chip">{row.daysLeft}</span>
            </td>
            <td data-label="Status">
              <span className={`def-cockpit-status-pill status-${row.status}`}>{row.statusLabel}</span>
            </td>
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={5} className="def-cockpit-empty">No milestones in the next 30 days.</td></tr>
        )}
      </tbody>
    </table>
  );

  if (modal) {
    return <ModalProTableShell>{table}</ModalProTableShell>;
  }
  return table;
}

function MilestonesOverviewDrawer({ open, onClose, rows, onOpenInitiative }) {
  const total = rows.length;
  const avgDays = total
    ? Math.round(rows.reduce((sum, row) => sum + row.daysLeft, 0) / total)
    : 0;
  const onTrackCount = rows.filter((row) => row.status === 'on-track').length;
  const portfolioStatus = onTrackCount >= total * 0.7 ? 'on-track' : onTrackCount >= total * 0.4 ? 'at-risk' : 'off-track';

  const handleOpenInitiative = (fastId, initiativeId) => {
    onClose();
    onOpenInitiative?.(fastId, initiativeId);
  };

  return (
    <CockpitInsightsDrawer
      open={open}
      onClose={onClose}
      titleId="def-milestones-drawer-title"
      closeLabel="Close milestones"
      title="Upcoming Milestone"
      description="Upcoming milestones and days remaining across the portfolio"
      sectionTitle="Milestone timeline"
      sectionCount={`${total} milestones`}
      stats={(
        <>
          <StatusPill status={portfolioStatus} />
          <span className="def-drawer-pillar-score def-drawer-pillar-days">
            {avgDays} days avg
          </span>
          <span className="def-drawer-pillar-meta">
            {total} milestones
            {' | '}
            {onTrackCount} on track
          </span>
        </>
      )}
    >
      <UpcomingMilestonesTableBody
        rows={rows}
        modal
        onOpenInitiative={handleOpenInitiative}
      />
    </CockpitInsightsDrawer>
  );
}

function UpcomingMilestonesTable({ rows, onOpenInitiative }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const previewRows = rows.slice(0, COCKPIT_MILESTONES_PREVIEW_LIMIT);

  return (
    <>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-interactive def-stagger-in" style={{ '--stagger': '160ms' }}>
        <CockpitPanelHeader title="Upcoming Milestone" onViewAll={() => setDrawerOpen(true)} />
        <div className="def-cockpit-table-scroll wide def-cockpit-panel-body def-cockpit-table-preview">
          <UpcomingMilestonesTableBody rows={previewRows} onOpenInitiative={onOpenInitiative} />
        </div>
      </div>
      <MilestonesOverviewDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        rows={rows}
        onOpenInitiative={onOpenInitiative}
      />
    </>
  );
}

function CockpitQuarterHighlights({ lastQuarter, highlights }) {
  return (
    <div className="def-cockpit-bottom-rail def-stagger-in" style={{ '--stagger': '240ms' }}>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-rail-card def-cockpit-interactive">
        <h3 className="def-cockpit-card-title">Last Quarter Summary</h3>
        <div className="def-cockpit-lq-grid">
          <div className="def-cockpit-lq-stat on-track">
            <span>On track</span>
            <strong>{lastQuarter.onTrackPct}%</strong>
          </div>
          <div className="def-cockpit-lq-stat at-risk">
            <span>At risk</span>
            <strong>{lastQuarter.atRiskPct}%</strong>
          </div>
          <div className="def-cockpit-lq-stat off-track">
            <span>Off track</span>
            <strong>{lastQuarter.offTrackPct}%</strong>
          </div>
        </div>
      </div>
      <div className="def-cockpit-table-card def-cockpit-panel def-cockpit-bottom-card def-cockpit-rail-card def-cockpit-interactive def-cockpit-highlight-panel">
        <h3 className="def-cockpit-card-title">Key Highlights</h3>
        <ul className="def-cockpit-highlight-list">
          {highlights.slice(0, COCKPIT_KEY_HIGHLIGHTS_PREVIEW_LIMIT).map((item) => (
            <li key={item.id} className={`def-cockpit-highlight-item tone-${item.tone}`}>
              <span className="def-cockpit-highlight-icon" aria-hidden="true">{item.icon}</span>
              <p>{item.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CeoView({ theme, onOpenFastPillar, onOpenInitiative }) {
  const vp = useViewport();
  const analytics = useMemo(
    () => buildCockpitAnalytics(ORG_DATA, null),
    [],
  );
  const { organization } = ORG_DATA;
  const lastUpdatedLabel = useMemo(
    () => formatAppDateTime(organization.lastUpdated),
    [organization.lastUpdated],
  );

  return (
    <div
      className={`def-layer def-page-enter def-cockpit def-cockpit-theme-${theme}`}
      style={{
        '--cockpit-bottom-min-h': vp.bottomMinH ? `${vp.bottomMinH}px` : '0px',
        '--cockpit-panel-min-h': vp.panelMinH ? `${vp.panelMinH}px` : '0px',
        '--cockpit-fast-chart': `${vp.fastChartH}px`,
        '--health-dot-size': `${vp.healthDotSize}px`,
        '--health-dot-core-size': `${vp.healthDotCore}px`,
      }}
    >
      <header className="def-cockpit-top def-cockpit-interactive def-stagger-in" style={{ '--stagger': '0ms' }}>
        <div className="def-cockpit-top-main">
          <div className="def-cockpit-top-copy">
            <p className="def-cockpit-eyebrow">Command Center</p>
            <h1 className="def-cockpit-title">Command Center Cockpit</h1>
          </div>
          <div className="def-cockpit-top-toolbar">
            <div className="def-cockpit-last-updated">
              <span className="def-cockpit-last-updated-label">Last Updated</span>
              <time dateTime={organization.lastUpdated}>{lastUpdatedLabel}</time>
            </div>
            <div className="def-cockpit-top-meta">
              <div className="def-cockpit-user-popover-host">
                <button
                  type="button"
                  className="def-cockpit-user-trigger"
                  aria-label={`${organization.viewerName}, ${organization.viewerRole}`}
                >
                  <Avatar name={organization.viewerName} tone="indigo" />
                </button>
                <div className="def-cockpit-user-popover" role="tooltip">
                  <div className="def-cockpit-user-popover-head">
                    <Avatar name={organization.viewerName} tone="indigo" />
                    <div className="def-cockpit-user-popover-copy">
                      <strong>{organization.viewerName}</strong>
                      <small>{organization.viewerRole}</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="def-cockpit-metrics-row">
        <CockpitPortfolioScopeCard
          metrics={analytics.executiveMetrics}
          delay="0ms"
        />
        <CockpitMetricCard
          title="On Track"
          value={`${analytics.executiveMetrics.onTrackPct}%`}
          subtitle={`${analytics.executiveMetrics.onTrackCount}`}
          spark={analytics.sparks.onTrack}
          delay="40ms"
          showSpark
          statusBand="on-track"
        />
        <CockpitMetricCard
          title="At Risk"
          value={`${analytics.executiveMetrics.atRiskPct}%`}
          subtitle={`${analytics.executiveMetrics.atRiskCount}`}
          spark={analytics.sparks.atRisk}
          delay="80ms"
          showSpark
          statusBand="at-risk"
        />
        <CockpitMetricCard
          title="Off Track"
          value={`${analytics.executiveMetrics.offTrackPct}%`}
          subtitle={`${analytics.executiveMetrics.offTrackCount}`}
          spark={analytics.sparks.offTrack}
          delay="120ms"
          showSpark
          statusBand="off-track"
        />
        <CockpitOverallHealthCard
          score={analytics.executiveMetrics.healthScore}
          delay="160ms"
        />
      </div>

      <section className="def-cockpit-block def-cockpit-interactive def-stagger-in" style={{ '--stagger': '60ms' }}>
        <div className="def-cockpit-block-head">
          <h2 className="def-cockpit-section-title">FAST pillars health</h2>
        </div>
        <div className="def-cockpit-fast-grid">
          {ORG_DATA.fastCategories.map((f, i) => (
            <FastHealthCard key={f.id} fast={f} theme={theme} onSelectFast={onOpenFastPillar} index={i} />
          ))}
        </div>
      </section>

      <section className="def-cockpit-block def-cockpit-block-secondary def-cockpit-interactive def-stagger-in" style={{ '--stagger': '120ms' }}>
        <div className="def-cockpit-block-head">
          <h2 className="def-cockpit-section-title">Tower leads view</h2>
        </div>
        <div className="def-cockpit-fast-grid">
          {TOWER_LEADS_DATA.map((lead, i) => (
            <TowerLeadHealthCard key={lead.id} lead={lead} theme={theme} index={i} />
          ))}
        </div>
      </section>

      <section className="def-cockpit-block def-cockpit-interactive def-stagger-in" style={{ '--stagger': '180ms' }}>
        <div className="def-cockpit-block-head">
          <h2 className="def-cockpit-section-title">Portfolio insights</h2>
        </div>
        <div className="def-cockpit-bottom-row">
          <UpcomingMilestonesTable
            rows={analytics.upcomingMilestones}
            onOpenInitiative={onOpenInitiative}
          />
          <TopRisksPanel rows={analytics.topRisks} />
          <CockpitQuarterHighlights
            lastQuarter={analytics.lastQuarterSummary}
            highlights={analytics.keyHighlights}
          />
        </div>
      </section>

      <InitiativeTracker
        rows={analytics.initiativeTracker}
        lastUpdated={organization.lastUpdated}
        onOpenInitiative={onOpenInitiative}
      />
    </div>
  );
}

function buildFastScorecardRows(fastCategory) {
  return fastCategory.initiatives.map((ini) => {
    const summary = buildInitiativeScorecardSummary(ini);
    return {
      id: ini.id,
      initiativeId: ini.id,
      kpi: ini.name,
      owner: ini.owner ?? 'N/A',
      team: ini.team?.name ?? 'N/A',
      scorecardStatus: summary.scorecardStatus,
      current: summary.current,
      target2029: summary.target2029,
      targetYearOne: summary.targetYearOne,
      comments: summary.comments,
    };
  });
}

function FastCategoryView({ fastCategory, onSelectInitiative, onGoCeo, onBack }) {
  const scorecardRows = useMemo(
    () => buildFastScorecardRows(fastCategory),
    [fastCategory],
  );
  const imperative = IMPERATIVE_LABELS[fastCategory.shortName] || fastCategory.shortName;
  const healthTone = healthColor(fastCategory.healthScore);
  const pillarStatus = statusFromHealthScore(fastCategory.healthScore);

  return (
    <div className="def-layer def-page-enter def-initiative-page def-pillar-page">
      <HierarchyTrail
        items={[
          { key: 'sec', tier: 'Strategic Execution', label: 'Cockpit', onClick: onGoCeo },
          { key: 'fast', tier: 'FAST', label: fastCategory.shortName },
        ]}
      />

      <article className="def-pillar-shell">
        <header className="def-pillar-hero">
          <div className="def-pillar-hero-main">
            <div className="def-pillar-hero-meta">
              <span className="def-initiative-pillar">{imperative}</span>
              <StatusPill status={pillarStatus} />
            </div>
            <h1 className="def-pillar-title">{fastCategory.shortName} pillar</h1>
            <p className="def-pillar-subtitle">{fastCategory.name}</p>
            <ul className="def-pillar-stats" aria-label="Pillar summary">
              <li><strong>{fastCategory.summary.initiatives}</strong> initiatives</li>
              <li><strong>{fastCategory.summary.activeProjects}</strong> projects</li>
              <li><strong>{fastCategory.summary.teams}</strong> teams</li>
              <li className="def-pillar-health" style={{ color: healthTone }}>
                <strong>{fastCategory.healthScore}%</strong> Health
              </li>
            </ul>
          </div>
        </header>

        <section className="def-pillar-body" aria-labelledby="def-pillar-kpi-title">
          <div className="def-pillar-section-head">
            <div>
              <h2 id="def-pillar-kpi-title" className="def-pillar-section-title">Initiative KPIs</h2>
              <p className="def-pillar-section-desc">
                Executive scorecard for {scorecardRows.length} initiatives under {imperative}
              </p>
            </div>
          </div>
          <InitiativeKpiTable
            rows={scorecardRows}
            embedded
            onRowClick={(row) => onSelectInitiative(row.initiativeId)}
          />
        </section>

        <footer className="def-pillar-footer">
          <button type="button" className="def-back-link" onClick={onBack}>
            Back to Command Center Cockpit
          </button>
        </footer>
      </article>
    </div>
  );
}

function InitiativeView({ fastCategory, initiative, onGoCeo, onGoFast, onGoTeam, onSelectProject }) {
  const detail = useMemo(
    () => getInitiativeTrackerDetail(initiative, fastCategory),
    [initiative, fastCategory],
  );
  const scorecard = useMemo(() => buildInitiativeScorecard(initiative), [initiative]);
  const kpiRows = useMemo(
    () => scorecard.kpis.map((row, index) => ({
      id: `${initiative.id}-kpi-${index}`,
      ...row,
    })),
    [initiative.id, scorecard.kpis],
  );
  const team = initiative.team;
  const teamSize = team?.summary?.developers
    ?? initiative.projects.reduce((sum, project) => sum + project.teamSize, 0);

  return (
    <div className="def-layer def-page-enter def-initiative-page">
      <HierarchyTrail
        items={[
          { key: 'sec', tier: 'Strategic Execution', label: 'Cockpit', onClick: onGoCeo },
          { key: 'fast', tier: 'FAST', label: fastCategory.shortName, onClick: onGoFast },
          { key: 'ini', tier: 'Initiative', label: initiative.name },
        ]}
      />

      <header className="def-initiative-header">
        <div className="def-initiative-header-main">
          <div className="def-initiative-meta">
            <span className="def-initiative-pillar">{detail.imperative}</span>
            <span className="def-initiative-parent">{detail.parentInitiative}</span>
          </div>
          <h1 className="def-initiative-title">{initiative.name}</h1>
          <p className="def-initiative-sub">
            Executive initiative scorecard
            {' | '}
            Owner: <strong>{initiative.owner ?? 'N/A'}</strong>
            {' | '}
            Team: <strong>{team?.name ?? 'Unassigned'}</strong>
          </p>
        </div>
        <div className="def-initiative-header-aside">
          <StatusPill status={initiative.status} />
          <span className={`def-initiative-source ${detail.source}`}>
            {detail.source === 'adp' ? 'Provided by ADP' : 'Sample data'}
          </span>
        </div>
      </header>

      <StrategicTargetCards targets={scorecard.strategicTargets} />

      <SectionCard title="Initiative KPIs" desc="Key metrics tracked against 2029 and year-one targets">
        <InitiativeKpiTable rows={kpiRows} />
      </SectionCard>

      <div className="def-initiative-quick-stats">
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{initiative.projects.length}</span>
          <span className="def-initiative-stat-lbl">Active projects</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{detail.delayed}</span>
          <span className="def-initiative-stat-lbl">Delayed / blocked</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{teamSize}</span>
          <span className="def-initiative-stat-lbl">Team size</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{team?.summary?.avgUtilization ?? detail.schedulePct}%</span>
          <span className="def-initiative-stat-lbl">Avg utilization</span>
        </div>
      </div>

      <SectionCard
        title="Projects"
        desc={`${initiative.projects.length} program${initiative.projects.length !== 1 ? 's' : ''} under this initiative`}
      >
        <div className="def-table-wrap def-table-pro def-table-scroll-wrap">
          <table className="def-table def-project-table def-initiative-project-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>End date</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {initiative.projects.map((project) => (
                <tr key={project.id} className="def-table-row def-project-row">
                  <td>
                    <strong className="def-project-name">{project.name}</strong>
                    {project.delayReason && (
                      <span className="def-project-row-hint">{project.delayReason}</span>
                    )}
                  </td>
                  <td>{project.client}</td>
                  <td>
                    <div className="def-project-row-badges">
                      <StatusPill status={project.status} />
                      <RiskBadge risk={project.risk} />
                    </div>
                  </td>
                  <td>
                    <div className="def-inline-progress def-inline-progress-wide">
                      <ProgressBar value={project.progress} />
                      <span>{project.progress}%</span>
                    </div>
                  </td>
                  <td style={{
                    color: project.delayDays > 0 ? '#dc2626' : 'inherit',
                    fontWeight: project.delayDays > 0 ? 600 : 400,
                  }}
                  >
                    {formatDate(project.timeline.projectedEndDate)}
                    {project.delayDays > 0 && ` (+${project.delayDays}d)`}
                  </td>
                  <td className="def-project-row-action">
                    {onSelectProject ? (
                      <button
                        type="button"
                        className="def-btn-sm def-btn-ghost"
                        onClick={() => onSelectProject(project.id)}
                      >
                        Details
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="def-initiative-actions">
          <button type="button" className="def-btn-sm" onClick={onGoTeam}>
            View team workspace
          </button>
        </div>
      </SectionCard>

      <button type="button" className="def-back-btn" onClick={onGoCeo}>← Back to Command Center Cockpit</button>
    </div>
  );
}

const MODULE_CHART_COLORS = {
  done: '#34d399',
  'in-progress': '#6366f1',
  pending: '#94a3b8',
};

function buildModuleChartData(project) {
  const counts = { done: 0, 'in-progress': 0, pending: 0 };
  project.modules.forEach((m) => {
    counts[m.status] = (counts[m.status] || 0) + 1;
  });
  return Object.entries(counts)
    .filter(([, value]) => value > 0)
    .map(([status, value]) => ({
      name: MODULE_STATUS[status].label,
      value,
      status,
      fill: MODULE_CHART_COLORS[status],
    }));
}

function buildProjectBurndown(project) {
  const totalWeeks = Math.max(4, Math.min(8, Math.ceil(project.duration.plannedDays / 14)));
  const elapsedWeeks = Math.max(
    1,
    Math.round((project.duration.elapsedDays / Math.max(project.duration.plannedDays, 1)) * totalWeeks),
  );
  return Array.from({ length: totalWeeks }, (_, i) => {
    const week = i + 1;
    const planned = Math.round((week / totalWeeks) * 100);
    let actual = null;
    if (week <= elapsedWeeks) {
      actual = week === elapsedWeeks
        ? project.progress
        : Math.round((week / elapsedWeeks) * project.progress * 0.94);
    }
    return { label: `W${week}`, planned, actual };
  });
}

function DrawerChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="def-drawer-chart-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.name || entry.dataKey}>
          {entry.name}: <strong>{entry.value}{entry.dataKey === 'util' || entry.name === 'Planned' || entry.name === 'Actual' ? '%' : ''}</strong>
        </span>
      ))}
    </div>
  );
}

function ProjectProgressGauge({ progress, theme }) {
  const ringData = [
    { name: 'complete', value: progress, fill: healthColor(progress) },
    { name: 'remaining', value: 100 - progress, fill: theme === 'dark' ? 'rgba(255,255,255,0.08)' : '#e8edf4' },
  ];

  return (
    <div className="def-drawer-gauge">
      <ResponsiveContainer width="100%" aspect={1} minWidth={0}>
        <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
          <Pie
            data={ringData}
            cx="50%"
            cy="50%"
            innerRadius="68%"
            outerRadius="88%"
            startAngle={90}
            endAngle={-270}
            dataKey="value"
            stroke="none"
            isAnimationActive
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="def-drawer-gauge-center">
        <strong>{progress}%</strong>
        <span>Complete</span>
      </div>
    </div>
  );
}

function ProjectDetailCharts({ project, theme }) {
  const chart = useResponsiveChart();
  const isDark = theme === 'dark';
  const tick = isDark ? '#94949e' : '#64748b';
  const grid = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(148,163,184,0.2)';
  const moduleData = useMemo(() => buildModuleChartData(project), [project]);
  const burndownData = useMemo(() => buildProjectBurndown(project), [project]);

  return (
    <div className="def-drawer-charts def-drawer-charts-compact">
      <div className="def-drawer-chart-card">
        <div className="def-drawer-chart-head">
          <h3>Modules</h3>
          <span>{project.modules.length} total</span>
        </div>
        <div className="def-drawer-chart-wrap">
          <ResponsiveContainer width="100%" height={150} minWidth={0}>
            <PieChart margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <Pie
                data={moduleData}
                cx="50%"
                cy="50%"
                innerRadius="58%"
                outerRadius="82%"
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {moduleData.map((entry) => (
                  <Cell key={entry.status} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip content={<DrawerChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="def-drawer-donut-legend def-drawer-donut-legend-inline">
          {moduleData.map((item) => (
            <span key={item.status}>
              <i style={{ background: item.fill }} />
              {item.name} | {item.value}
            </span>
          ))}
        </div>
      </div>

      <div className="def-drawer-chart-card">
        <div className="def-drawer-chart-head">
          <h3>Delivery</h3>
          <span>Planned vs actual</span>
        </div>
        <div className="def-drawer-chart-wrap">
          <ResponsiveContainer width="100%" height={160} minWidth={0}>
            <ComposedChart data={burndownData} margin={{ ...chart.chartMargin, top: 10, right: 10, left: 2, bottom: 0 }}>
              <defs>
                <linearGradient id="defDrawerArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 6" stroke={grid} vertical={false} />
              <XAxis
                dataKey="label"
                tick={{ fontSize: chart.tickSmall, fill: tick }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
                tickMargin={4}
                height={chart.xAxisHeight}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tick={{ fontSize: chart.tickSmall, fill: tick }}
                axisLine={false}
                tickLine={false}
                width={chart.yAxisWidth}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<DrawerChartTooltip />} />
              <Line type="monotone" dataKey="planned" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="4 3" dot={false} name="Planned" />
              <Area type="monotone" dataKey="actual" stroke="#6366f1" strokeWidth={2} fill="url(#defDrawerArea)" name="Actual" connectNulls />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <ChartLegendRow
          items={[
            { label: 'Planned', color: '#94a3b8' },
            { label: 'Actual', color: '#6366f1' },
          ]}
        />
      </div>
    </div>
  );
}

function ProjectDetailContent({ project, theme }) {
  const onSchedule = project.delayDays <= 0;

  return (
    <>
      <div className="def-drawer-summary">
        <ProjectProgressGauge progress={project.progress} theme={theme} />
        <div className="def-drawer-summary-stats">
          <div className="def-drawer-summary-stat">
            <span>Duration</span>
            <strong>{project.duration.elapsedDays}d / {project.duration.plannedDays}d</strong>
            <small>{project.duration.remainingDays}d remaining</small>
          </div>
          <div className="def-drawer-summary-stat">
            <span>Target end</span>
            <strong>{formatDate(project.timeline.expectedEndDate)}</strong>
          </div>
          <div className="def-drawer-summary-stat">
            <span>Projected</span>
            <strong style={{ color: onSchedule ? '#059669' : '#dc2626' }}>
              {formatDate(project.timeline.projectedEndDate)}
              {!onSchedule && ` (+${project.delayDays}d)`}
            </strong>
          </div>
        </div>
      </div>

      {project.blockers.length > 0 && (
        <div className="def-drawer-alert def-drawer-alert-danger">
          <strong>Blockers</strong>
          <ul>{project.blockers.map((b) => <li key={b}>{b}</li>)}</ul>
        </div>
      )}

      {project.delayReason && (
        <div className="def-drawer-alert def-drawer-alert-warn">
          <strong>Delay</strong>
          <p>{project.delayReason}</p>
        </div>
      )}

      <ProjectDetailCharts project={project} theme={theme} />

      <div className="def-drawer-block def-drawer-block-compact">
        <div className="def-drawer-block-head">
          <h3>Task list</h3>
          <span>{project.modules.length} modules</span>
        </div>
        <div className="def-drawer-module-list">
          {project.modules.map((mod) => {
            const modMeta = MODULE_STATUS[mod.status];
            return (
              <article key={mod.id} className={`def-drawer-module def-drawer-module-${mod.status}`}>
                <div className="def-drawer-module-top">
                  <strong>{mod.name}</strong>
                  <span className="def-pill def-pill-sm" style={{ color: modMeta.color, background: modMeta.bg }}>
                    {modMeta.label}
                  </span>
                </div>
                <div className="def-drawer-module-meta">
                  <span>{mod.assignee}</span>
                  <span>{mod.estimatedDays}d est.{mod.actualDays ? ` | ${mod.actualDays}d actual` : ''}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <div className="def-drawer-block def-drawer-block-compact">
        <div className="def-drawer-block-head">
          <h3>Team members</h3>
          <span>{project.developers.length} people</span>
        </div>
        <div className="def-drawer-team-list">
          {project.developers.map((dev) => (
            <article key={dev.id} className="def-drawer-team-row">
              <Avatar name={dev.name} tone="slate" />
              <div className="def-drawer-team-info">
                <strong>{dev.name}</strong>
                <span>{dev.role} | {dev.currentModule}</span>
              </div>
              <span
                className="def-drawer-team-util"
                style={{ color: dev.utilization > 90 ? '#dc2626' : dev.utilization > 80 ? '#6366f1' : '#059669' }}
              >
                {dev.utilization}%
              </span>
            </article>
          ))}
        </div>
      </div>
    </>
  );
}

function ProjectDetailDrawer({ project, team, open, onClose, theme = 'light' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !project) return null;

  const onSchedule = project.delayDays <= 0;

  return (
    <div className="def-drawer-root open" role="presentation">
      <button type="button" className="def-drawer-backdrop" aria-label="Close project details" onClick={onClose} />
      <aside className="def-drawer def-drawer-pro" role="dialog" aria-modal="true" aria-labelledby="def-drawer-title">
        <header className="def-drawer-head def-drawer-head-clean">
          <div className="def-drawer-head-row">
            <span className="def-drawer-tier">Project details</span>
            <button type="button" className="def-drawer-close" onClick={onClose} aria-label="Close">
              ✕
            </button>
          </div>
          <h2 id="def-drawer-title">{project.name}</h2>
          <p className="def-drawer-subtitle">
            Client: <strong>{project.client}</strong>
            {' | '}
            Team: <strong>{team?.name ?? 'Unassigned'}</strong>
          </p>
          <div className="def-drawer-head-badges">
            <StatusPill status={project.status} />
            <RiskBadge risk={project.risk} />
            <span className={`def-drawer-schedule-chip${onSchedule ? ' ok' : ' late'}`}>
              {onSchedule ? 'On schedule' : `${project.delayDays} days behind`}
            </span>
          </div>
        </header>
        <div className="def-drawer-body def-drawer-body-pro">
          <ProjectDetailContent project={project} theme={theme} />
        </div>
      </aside>
    </div>
  );
}

function TeamView({
  fastCategory,
  initiative,
  team,
  activeProjectId,
  onOpenProject,
  onGoCeo,
  onGoFast,
  onGoInitiative,
}) {
  const projects = initiative.projects;
  const delayedCount = projects.filter(
    (project) => project.status === 'delayed' || project.status === 'blocked',
  ).length;
  const avgProgress = Math.round(
    projects.reduce((sum, project) => sum + project.progress, 0) / Math.max(projects.length, 1),
  );
  const teamSize = team.summary?.developers
    ?? projects.reduce((sum, project) => sum + project.teamSize, 0);

  return (
    <div className="def-layer def-page-enter def-initiative-page">
      <HierarchyTrail
        items={[
          { key: 'sec', tier: 'Strategic Execution', label: 'Cockpit', onClick: onGoCeo },
          { key: 'fast', tier: 'FAST', label: fastCategory.shortName, onClick: onGoFast },
          { key: 'ini', tier: 'Initiative', label: initiative.name, onClick: onGoInitiative },
          { key: 'team', tier: 'Team', label: team.name },
        ]}
      />

      <header className="def-initiative-header">
        <div className="def-initiative-header-main">
          <div className="def-initiative-meta">
            <span className="def-initiative-pillar">{fastCategory.shortName}</span>
            <span className="def-initiative-parent">{initiative.name}</span>
          </div>
          <h1 className="def-initiative-title">{team.name}</h1>
          <p className="def-initiative-sub">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
            {' | '}
            {teamSize} team members
            {' | '}
            {fastCategory.shortName} pillar
          </p>
        </div>
        <div className="def-initiative-header-aside">
          <StatusPill status={team.status ?? initiative.status} />
        </div>
      </header>

      <div className="def-initiative-quick-stats">
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{projects.length}</span>
          <span className="def-initiative-stat-lbl">Active projects</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{delayedCount}</span>
          <span className="def-initiative-stat-lbl">Delayed / blocked</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{avgProgress}%</span>
          <span className="def-initiative-stat-lbl">Average progress</span>
        </div>
        <div className="def-initiative-stat">
          <span className="def-initiative-stat-num">{team.summary?.avgUtilization ?? avgProgress}%</span>
          <span className="def-initiative-stat-lbl">Avg utilization</span>
        </div>
      </div>

      <SectionCard
        title="Projects"
        desc={`${projects.length} project${projects.length !== 1 ? 's' : ''} owned by ${team.name}`}
      >
        <div className="def-table-wrap def-table-pro def-table-scroll-wrap">
          <table className="def-table def-project-table def-initiative-project-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Status</th>
                <th>Progress</th>
                <th>End date</th>
                <th>Team size</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr
                  key={project.id}
                  className={`def-table-row def-project-row${activeProjectId === project.id ? ' def-project-row-active' : ''}`}
                >
                  <td>
                    <strong className="def-project-name">{project.name}</strong>
                    {project.delayReason && (
                      <span className="def-project-row-hint">{project.delayReason}</span>
                    )}
                  </td>
                  <td>{project.client}</td>
                  <td>
                    <div className="def-project-row-badges">
                      <StatusPill status={project.status} />
                      <RiskBadge risk={project.risk} />
                    </div>
                  </td>
                  <td>
                    <div className="def-inline-progress def-inline-progress-wide">
                      <ProgressBar value={project.progress} />
                      <span>{project.progress}%</span>
                    </div>
                  </td>
                  <td style={{
                    color: project.delayDays > 0 ? '#dc2626' : 'inherit',
                    fontWeight: project.delayDays > 0 ? 600 : 400,
                  }}
                  >
                    {formatDate(project.timeline.projectedEndDate)}
                    {project.delayDays > 0 && ` (+${project.delayDays}d)`}
                  </td>
                  <td>{project.teamSize}</td>
                  <td className="def-project-row-action">
                    <button
                      type="button"
                      className="def-btn-sm def-btn-ghost"
                      onClick={() => onOpenProject(project.id)}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <button type="button" className="def-back-btn" onClick={onGoCeo}>← Back to Command Center Cockpit</button>
    </div>
  );
}

const STYLES = `
  html { scroll-behavior: smooth; }
  @media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } }
  html, body, #root {
    margin: 0; padding: 0; min-height: 100vh; max-width: 100%; overflow-x: hidden;
  }
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-normal);
    line-height: var(--leading-normal);
    letter-spacing: var(--tracking-normal);
    color: #111827;
    background: #f7f8fa;
  }
  ::selection { background: rgba(20, 115, 230, 0.2); color: #2c2c2c; }
  ::-webkit-scrollbar { width: 8px; height: 8px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.15); border-radius: 4px; transition: background 0.2s;
  }
  ::-webkit-scrollbar-thumb:hover { background: rgba(0, 0, 0, 0.25); }

  :root {
    --def-blue: #6366f1;
    --def-blue-dark: #4f46e5;
    --def-violet: #a855f7;
    --def-cyan: #22d3ee;
    --def-pink: #ec4899;
    --def-gradient: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
    --def-gradient-soft: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08));
    --def-radius: 18px;
    --def-radius-sm: 12px;
    --def-sidebar-w: 312px;
    --def-topbar-h: 56px;
    --space-1: 4px;
    --space-2: 8px;
    --space-3: 12px;
    --space-4: 16px;
    --space-5: 20px;
    --space-6: 24px;
    --content-pad-x: clamp(var(--space-3), 1.5vw, var(--space-5));
    --content-pad-y: clamp(var(--space-3), 1.8vw, var(--space-5));
    --section-gap: var(--space-5);
    --cockpit-gap: var(--space-2);
    --cockpit-pad: var(--space-2);
    --font-sans: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-normal: 400;
    --font-medium: 500;
    --font-semibold: 600;
    --font-bold: 700;
    --font-extrabold: 800;
    --leading-tight: 1.25;
    --leading-snug: 1.35;
    --leading-normal: 1.5;
    --leading-relaxed: 1.625;
    --tracking-tight: -0.02em;
    --tracking-normal: 0;
    --tracking-wide: 0.025em;
    --tracking-label: 0.06em;
    --text-2xs: 0.625rem;
    --text-xs: 0.6875rem;
    --text-sm: 0.8125rem;
    --text-base: 0.875rem;
    --text-md: 0.9375rem;
    --text-lg: 1.0625rem;
    --text-xl: 1.25rem;
    --text-2xl: 1.5rem;
    --text-3xl: 1.875rem;
    --text-min: var(--text-2xs);
    --def-shadow-sm: 0 2px 8px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04);
    --def-touch-min: 44px;
  }

  .def-app.def-theme-light {
    --def-text: #334155;
    --def-muted: #64748b;
    --def-subtle: #94a3b8;
    --def-heading: #1e293b;
    --def-hero-title: #f8fafc;
    --def-hero-muted: #cbd5e1;
    --def-glass: rgba(255,255,255,0.72);
    --def-surface: rgba(255,255,255,0.88);
    --def-border: rgba(148,163,184,0.35);
    --def-border-soft: rgba(148,163,184,0.2);
    --def-shadow: 0 8px 32px rgba(15,23,42,0.06), 0 1px 0 rgba(255,255,255,0.9) inset;
    --def-shadow-lg: 0 24px 60px rgba(99,102,241,0.12), 0 8px 24px rgba(15,23,42,0.06);
    --def-shadow-glow: 0 0 0 1px rgba(99,102,241,0.15), 0 12px 40px rgba(99,102,241,0.15);
    --def-bg-app: linear-gradient(160deg, #eef2ff 0%, #f5f3ff 35%, #fdf2f8 70%, #ecfeff 100%);
    --def-topbar-bg: rgba(255,255,255,0.9);
    --def-topbar-text: #334155;
    --def-topbar-border: rgba(148,163,184,0.25);
    --def-topbar-pill-bg: rgba(99,102,241,0.08);
    --def-topbar-pill-border: rgba(99,102,241,0.22);
    --def-sidebar-bg: rgba(255,255,255,0.94);
    --def-sidebar-text: #334155;
    --def-sidebar-muted: #64748b;
    --def-sidebar-border: rgba(148,163,184,0.22);
    --def-sidebar-hover: rgba(99,102,241,0.08);
    --def-sidebar-active: linear-gradient(135deg, rgba(99,102,241,0.14), rgba(168,85,247,0.1));
    --def-sidebar-shadow: 8px 0 32px rgba(99,102,241,0.08);
    --def-footer-bg: rgba(255,255,255,0.65);
    --def-chart-ticker-bg: linear-gradient(135deg, rgba(238,242,255,0.98) 0%, rgba(224,231,255,0.95) 50%, rgba(245,243,255,0.92) 100%);
    --def-chart-wrap-bg: linear-gradient(180deg, rgba(248,250,252,0.98) 0%, rgba(224,231,255,0.96) 100%);
    --def-chart-text: #334155;
    --def-chart-muted: #64748b;
    --def-chart-border: rgba(99,102,241,0.22);
    --def-mesh-1: rgba(99,102,241,0.28);
    --def-mesh-2: rgba(236,72,153,0.18);
    --def-mesh-3: rgba(34,211,238,0.15);
    --def-accordion-bg: rgba(99,102,241,0.06);
    --def-live-badge-bg: #f8fafc;
    --def-live-badge-border: #e2e8f0;
    --def-live-badge-text: #64748b;
    --def-progress-track: #e2e8f0;
    --def-card-stat-bg: rgba(255,255,255,0.55);
    --def-table-head-bg: linear-gradient(180deg, rgba(99,102,241,0.08), rgba(168,85,247,0.04));
    --def-table-row-hover: linear-gradient(90deg, rgba(99,102,241,0.08), rgba(236,72,153,0.04));
  }

  .def-app.def-theme-dark {
    --def-text: #d4d4d8;
    --def-muted: #94949e;
    --def-subtle: #71717a;
    --def-heading: #e4e4e7;
    --def-hero-title: #e4e4e7;
    --def-hero-muted: #a1a1aa;
    --def-glass: rgba(0,0,0,0.62);
    --def-surface: rgba(10,10,10,0.88);
    --def-border: rgba(255,255,255,0.1);
    --def-border-soft: rgba(255,255,255,0.06);
    --def-shadow: 0 8px 32px rgba(0,0,0,0.45), 0 1px 0 rgba(255,255,255,0.04) inset;
    --def-shadow-lg: 0 24px 60px rgba(0,0,0,0.55), 0 8px 24px rgba(0,0,0,0.35);
    --def-shadow-glow: 0 0 0 1px rgba(255,255,255,0.06), 0 12px 40px rgba(0,0,0,0.5);
    --def-bg-app: linear-gradient(160deg, #000000 0%, #050505 35%, #0a0a0a 70%, #000000 100%);
    --def-topbar-bg: rgba(0,0,0,0.94);
    --def-topbar-text: #d4d4d8;
    --def-topbar-border: rgba(255,255,255,0.06);
    --def-topbar-pill-bg: rgba(255,255,255,0.06);
    --def-topbar-pill-border: rgba(255,255,255,0.1);
    --def-sidebar-bg: rgba(0,0,0,0.97);
    --def-sidebar-text: #d4d4d8;
    --def-sidebar-muted: #71717a;
    --def-sidebar-border: rgba(255,255,255,0.06);
    --def-sidebar-hover: rgba(255,255,255,0.06);
    --def-sidebar-active: linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0.04));
    --def-sidebar-shadow: 8px 0 40px rgba(0,0,0,0.45);
    --def-footer-bg: rgba(0,0,0,0.65);
    --def-chart-ticker-bg: linear-gradient(135deg, rgba(0,0,0,0.98) 0%, rgba(8,8,8,0.96) 50%, rgba(14,14,14,0.94) 100%);
    --def-chart-wrap-bg: linear-gradient(180deg, rgba(0,0,0,0.98) 0%, rgba(12,12,12,0.96) 100%);
    --def-chart-text: #d4d4d8;
    --def-chart-muted: #94949e;
    --def-chart-border: rgba(255,255,255,0.08);
    --def-mesh-1: rgba(255,255,255,0.035);
    --def-mesh-2: rgba(236,72,153,0.06);
    --def-mesh-3: rgba(168,85,247,0.05);
    --def-accordion-bg: rgba(255,255,255,0.03);
    --def-live-badge-bg: rgba(255,255,255,0.06);
    --def-live-badge-border: rgba(255,255,255,0.1);
    --def-live-badge-text: #94949e;
    --def-progress-track: rgba(255,255,255,0.1);
    --def-card-stat-bg: rgba(255,255,255,0.04);
    --def-table-head-bg: linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02));
    --def-table-row-hover: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
  }

  .def-app.def-theme-dark .def-hero-premium {
    background: linear-gradient(135deg, #000000 0%, #0a0a0a 45%, #111111 100%);
    border-color: rgba(255,255,255,0.1);
  }
  .def-app.def-theme-dark .def-hero-premium::before {
    background: radial-gradient(circle, rgba(236,72,153,0.05), transparent 70%);
  }
  .def-app.def-theme-dark .def-topbar::after {
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
  }
  .def-app.def-theme-dark .def-theme-toggle:hover {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.16);
    box-shadow: none;
  }
  .def-app.def-theme-dark .def-sidebar-pillar-expand:hover,
  .def-app.def-theme-dark .def-sidebar-pillar-expand.open {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
  }
  .def-app.def-theme-dark .def-sidebar-nested {
    background: rgba(255,255,255,0.03);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-sidebar-count {
    background: rgba(99,102,241,0.16);
    border-color: rgba(129,140,248,0.24);
    color: #a5b4fc;
  }
  .def-app.def-theme-dark .def-sidebar-link.active {
    border-color: rgba(255,255,255,0.12);
    box-shadow: inset 3px 0 0 #818cf8, 0 2px 10px rgba(0,0,0,0.25);
  }
  .def-app.def-theme-dark .def-chart-tooltip {
    background: rgba(0,0,0,0.96);
    box-shadow: 0 12px 32px rgba(0,0,0,0.55);
  }
  .def-app.def-theme-dark .def-stock-tooltip {
    background: linear-gradient(145deg, rgba(0,0,0,0.98), rgba(10,10,10,0.98));
    border-color: rgba(255,255,255,0.1);
  }
  .def-app.def-theme-dark .def-chart-stat:hover,
  .def-app.def-theme-dark .def-kpi-item:hover,
  .def-app.def-theme-dark .def-card-clickable:hover,
  .def-app.def-theme-dark .def-hover-lift:hover {
    border-color: rgba(255,255,255,0.14);
  }
  .def-app.def-theme-dark .def-candle-down {
    background: rgba(0,0,0,0.95) !important;
  }
  .def-app.def-theme-dark .def-panel:hover {
    border-color: rgba(255,255,255,0.12);
  }
  .def-app.def-theme-dark .def-project-stat {
    background: rgba(255,255,255,0.04);
    border-color: var(--def-border);
  }
  .def-app.def-theme-dark .def-project-stat:hover {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.12);
  }
  .def-app.def-theme-dark .def-kpi-num {
    color: var(--def-text);
  }
  .def-app.def-theme-dark .def-section-title {
    color: var(--def-heading);
  }
  .def-app.def-theme-dark .def-table td {
    color: var(--def-text);
  }
  .def-app.def-theme-dark .def-dev-top strong {
    color: var(--def-text);
  }

  @keyframes defMeshDrift {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -20px) scale(1.05); }
    66% { transform: translate(-20px, 15px) scale(0.95); }
  }
  @keyframes defGradientShift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
  }

  @keyframes defFadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes defPageEnter {
    from { opacity: 0; transform: translateY(12px) scale(0.995); }
    to { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes defProgressGrow {
    from { width: 0; }
    to { width: var(--def-progress); }
  }
  @keyframes defShimmer {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(220%); }
  }
  @keyframes defPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(234, 88, 12, 0.35); }
    50% { box-shadow: 0 0 0 6px rgba(234, 88, 12, 0); }
  }
  @keyframes defLivePulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.55; transform: scale(0.85); }
  }
  @keyframes defTopbarGlow {
    0%, 100% { opacity: 0.45; }
    50% { opacity: 0.85; }
  }

  html, body, #root {
    height: 100%;
    overflow: hidden;
  }
  html {
    -webkit-text-size-adjust: 100%;
  }
  body {
    margin: 0;
    overscroll-behavior: none;
  }

  .def-app {
    position: relative;
    height: 100%;
    max-height: 100dvh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--def-bg-app);
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-normal);
    line-height: var(--leading-normal);
    letter-spacing: var(--tracking-normal);
    font-variant-numeric: tabular-nums;
    font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    color: var(--def-text);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    transition: background 0.35s ease, color 0.35s ease;
  }
  .def-app *, .def-app *::before, .def-app *::after { box-sizing: border-box; }
  .def-app :is(button, input, select, textarea, optgroup) {
    font-family: inherit;
    font-size: inherit;
    line-height: inherit;
    letter-spacing: inherit;
  }
  .def-app h1, .def-app h2, .def-app h3, .def-app h4 {
    font-family: inherit;
    font-weight: var(--font-extrabold);
    line-height: var(--leading-tight);
    letter-spacing: var(--tracking-tight);
    color: var(--def-heading);
    margin: 0;
  }
  .def-app strong, .def-app b { font-weight: var(--font-bold); }
  .def-app small { font-size: var(--text-sm); line-height: var(--leading-snug); }
  .def-app :is(.def-table, .def-cockpit-table, .def-tracker-table, .def-initiative-kpi-table) {
    font-size: var(--text-sm);
  }
  .def-app :is(.def-table th, .def-cockpit-table th, .def-tracker-table thead th, .def-initiative-kpi-table th) {
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    letter-spacing: var(--tracking-label);
  }
  .def-app :is(
    .def-cockpit-rail-label,
    .def-sidebar-label,
    .def-sidebar-sublabel,
    .def-cockpit-eyebrow,
    .def-cockpit-fast-kicker,
    .def-scorecard-targets-label
  ) {
    font-size: var(--text-xs);
    font-weight: var(--font-extrabold);
    letter-spacing: var(--tracking-label);
    text-transform: uppercase;
  }
  .def-layer {
    width: 100%;
    min-width: 0;
    max-width: 100%;
  }
  .def-main > .def-layer:not(.def-cockpit) {
    max-width: 1440px;
    margin-inline: auto;
  }
  .def-mesh {
    position: fixed;
    border-radius: 50%;
    filter: blur(80px);
    pointer-events: none;
    z-index: 0;
    animation: defMeshDrift 18s ease-in-out infinite;
  }
  .def-mesh-1 {
    width: 520px; height: 520px;
    top: -180px; left: -120px;
    background: radial-gradient(circle, var(--def-mesh-1), transparent 70%);
  }
  .def-mesh-2 {
    width: 480px; height: 480px;
    top: 20%; right: -140px;
    background: radial-gradient(circle, var(--def-mesh-2), transparent 70%);
    animation-delay: -6s;
  }
  .def-mesh-3 {
    width: 400px; height: 400px;
    bottom: -100px; left: 35%;
    background: radial-gradient(circle, var(--def-mesh-3), transparent 70%);
    animation-delay: -12s;
  }
  .def-layout {
    position: relative;
  }

  .def-topbar {
    position: relative;
    flex-shrink: 0;
    z-index: 100;
    background: var(--def-topbar-bg);
    color: var(--def-topbar-text);
    padding: 0 14px;
    height: var(--def-topbar-h);
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid var(--def-topbar-border);
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(20px) saturate(180%);
    transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
  }
  .def-topbar-left, .def-topbar-right { display: flex; align-items: center; gap: 12px; min-width: 0; }
  .def-menu-toggle {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--def-topbar-pill-border);
    background: var(--def-topbar-pill-bg);
    color: var(--def-topbar-text);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
  }
  .def-topbar-brand {
    font-weight: 700;
    font-size: 0.95rem;
    letter-spacing: 0.02em;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-sidebar-backdrop {
    display: none;
  }
  .def-topbar-mark {
    width: 38px; height: 38px;
    border-radius: 12px;
    background: var(--def-gradient);
    background-size: 200% 200%;
    animation: defGradientShift 6s ease infinite;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.72rem; font-weight: 900; letter-spacing: 0.04em;
    box-shadow: 0 8px 24px rgba(99,102,241,0.45);
  }
  .def-topbar-divider { width: 1px; height: 22px; background: rgba(255,255,255,0.15); }
  .def-topbar-sub { font-size: 0.78rem; opacity: 0.72; font-weight: 500; }
  .def-topbar-period {
    font-size: 0.72rem;
    padding: 5px 12px;
    border-radius: 999px;
    background: rgba(255,255,255,0.07);
    border: 1px solid rgba(255,255,255,0.1);
    color: #cbd5e1;
  }
  .def-topbar::after {
    content: '';
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(96,165,250,0.6), transparent);
    animation: defTopbarGlow 3s ease-in-out infinite;
  }
  .def-topbar-layer {
    font-size: 0.78rem;
    padding: 7px 16px;
    border-radius: 999px;
    background: var(--def-topbar-pill-bg);
    border: 1px solid var(--def-topbar-pill-border);
    backdrop-filter: blur(8px);
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .def-theme-toggle {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--def-topbar-pill-border);
    background: var(--def-topbar-pill-bg);
    color: var(--def-topbar-text);
    cursor: pointer;
    font-size: 1rem;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: all 0.22s ease;
  }
  .def-theme-toggle:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(167,139,250,0.4);
    transform: translateY(-1px);
  }
  .def-topbar-layer:hover {
    background: rgba(99,102,241,0.2);
    border-color: rgba(167,139,250,0.5);
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(99,102,241,0.25);
  }

  .def-layout {
    flex: 1;
    min-height: 0;
    display: grid;
    grid-template-columns: var(--def-sidebar-w) minmax(0, 1fr);
    align-items: stretch;
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .def-content-wrap {
    min-width: 0;
    min-height: 0;
    width: 100%;
    max-width: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior-y: contain;
    scroll-behavior: smooth;
  }

  .def-sidebar {
    width: 100%;
    height: 100%;
    min-height: 0;
    position: relative;
    overflow-x: hidden;
    overflow-y: auto;
    overscroll-behavior: contain;
    display: flex;
    flex-direction: column;
    background: var(--def-sidebar-bg);
    backdrop-filter: blur(24px) saturate(160%);
    color: var(--def-sidebar-text);
    border-right: 1px solid var(--def-sidebar-border);
    --sidebar-inset-x: var(--space-3);
    padding: var(--space-4) var(--sidebar-inset-x) var(--space-3);
    min-height: 0;
    box-shadow: var(--def-sidebar-shadow);
    transition: background 0.35s ease, color 0.35s ease, border-color 0.35s ease;
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,0.35) transparent;
  }
  .def-sidebar::-webkit-scrollbar { width: 5px; }
  .def-sidebar::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.35);
    border-radius: 999px;
  }
  .def-sidebar-brand {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px 18px;
    border-bottom: 1px solid var(--def-sidebar-border);
    margin-bottom: 14px;
  }
  .def-sidebar-brand-compact {
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    padding: 10px 12px 16px;
  }
  .def-sidebar-period {
    font-size: 0.88rem;
    font-weight: 700;
    color: var(--def-sidebar-text);
    letter-spacing: 0.02em;
  }
  .def-sidebar-period-hint {
    font-size: 0.62rem;
    color: var(--def-sidebar-muted);
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
  }
  .def-sidebar-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    font-size: 0.6875rem;
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--def-sidebar-muted);
    font-weight: var(--font-bold);
    padding: var(--space-1) 2px 4px;
    margin: 0;
  }
  .def-sidebar-label-section {
    margin-top: var(--space-2);
    padding-top: var(--space-2);
    border-top: 1px solid var(--def-sidebar-border);
  }
  .def-sidebar-sublabel {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    margin: 0 0 6px;
    padding: 2px 4px 0;
    font-size: 0.6875rem;
    font-weight: var(--font-extrabold);
    text-transform: uppercase;
    letter-spacing: 0.07em;
    color: var(--def-sidebar-muted);
  }
  .def-sidebar-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 999px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.14);
    font-size: 0.625rem;
    font-weight: 800;
    letter-spacing: 0;
    color: #6366f1;
    font-variant-numeric: tabular-nums;
  }
  .def-sidebar-tier {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    border-radius: 9px;
    font-size: 0.58rem;
    font-weight: 900;
    letter-spacing: 0.03em;
    flex-shrink: 0;
  }
  .def-sidebar-tier-ceo {
    background: var(--def-gradient);
    color: #fff;
    box-shadow: 0 4px 14px rgba(99,102,241,0.35);
  }
  .def-sidebar-tier-mgr {
    background: linear-gradient(135deg, rgba(99,102,241,0.18), rgba(168,85,247,0.12));
    border: 1px solid rgba(99,102,241,0.25);
    color: var(--def-sidebar-text);
  }
  .def-sidebar-tier-tl {
    width: 22px;
    height: 22px;
    border-radius: 6px;
    font-size: 0.46rem;
    background: rgba(99,102,241,0.06);
    border: 1px solid var(--def-sidebar-border);
    color: var(--def-sidebar-muted);
  }
  .def-sidebar-role {
    color: var(--def-violet);
    font-weight: 700;
  }
  .def-app.def-theme-dark .def-sidebar-role { color: #a1a1aa; }
  .def-app.def-theme-dark .def-hero-premium.def-layer-header h1,
  .def-app.def-theme-dark .def-layer-header.def-hero-premium h1 {
    background: none;
    -webkit-text-fill-color: var(--def-hero-title);
    color: var(--def-hero-title);
  }
  .def-app.def-theme-dark .def-hero-premium .def-eyebrow,
  .def-app.def-theme-dark .def-hero-premium .def-subtitle {
    color: var(--def-hero-muted);
  }
  .def-app.def-theme-dark .def-hero-premium .def-live-badge {
    color: var(--def-hero-muted);
  }
  .def-app.def-theme-dark .def-chart-tooltip-row strong,
  .def-app.def-theme-dark .def-health-tooltip-grid strong {
    color: var(--def-text);
  }
  .def-app.def-theme-dark .def-chart-tooltip-title {
    color: var(--def-muted);
  }
  .def-sidebar-nav {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
    min-height: 0;
    padding-bottom: var(--space-2);
  }
  .def-sidebar-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
  }
  .def-sidebar-pillar-card {
    border: 1px solid var(--def-sidebar-border);
    border-radius: 12px;
    background: rgba(255,255,255,0.88);
    overflow: hidden;
    cursor: pointer;
    transition: border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease;
  }
  .def-sidebar-pillar-card:hover {
    border-color: rgba(99,102,241,0.24);
    background: rgba(255,255,255,0.98);
    box-shadow: 0 4px 16px rgba(99,102,241,0.08);
  }
  .def-sidebar-pillar-card.is-selected {
    border-color: rgba(99,102,241,0.32);
    background: linear-gradient(180deg, rgba(99,102,241,0.1), rgba(168,85,247,0.05));
    box-shadow: inset 3px 0 0 #6366f1, 0 4px 16px rgba(99,102,241,0.1);
  }
  .def-sidebar-pillar-card:focus-visible {
    outline: 2px solid rgba(99,102,241,0.45);
    outline-offset: 2px;
  }
  .def-sidebar-pillar-head {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr) auto;
    column-gap: 10px;
    align-items: center;
    padding: 11px 11px 9px;
  }
  .def-sidebar-pillar-copy {
    min-width: 0;
  }
  .def-sidebar-pillar-copy strong {
    display: block;
    font-size: 0.8125rem;
    font-weight: var(--font-extrabold);
    color: var(--def-sidebar-text);
    line-height: 1.3;
    letter-spacing: -0.01em;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-sidebar-pillar-copy span {
    display: block;
    margin-top: 3px;
    font-size: 0.6875rem;
    font-weight: var(--font-semibold);
    color: var(--def-sidebar-muted);
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-sidebar-pillar-actions {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    flex-shrink: 0;
  }
  .def-sidebar-score-pillar {
    height: 26px;
    min-width: 44px;
    padding: 0 8px;
    font-size: 0.6875rem;
  }
  .def-sidebar-pillar-expand {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--def-sidebar-border);
    border-radius: 8px;
    background: rgba(255,255,255,0.96);
    color: var(--def-sidebar-muted);
    cursor: pointer;
    font-size: 0.7rem;
    line-height: 1;
    padding: 0;
    flex-shrink: 0;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s ease;
  }
  .def-sidebar-pillar-expand:hover,
  .def-sidebar-pillar-expand.open {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.28);
    color: #4338ca;
  }
  .def-sidebar-pillar-expand.open {
    transform: rotate(0deg);
  }
  .def-app.def-theme-dark .def-sidebar-pillar-card {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-sidebar-pillar-card:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(255,255,255,0.14);
  }
  .def-app.def-theme-dark .def-sidebar-pillar-card.is-selected {
    background: linear-gradient(180deg, rgba(99,102,241,0.16), rgba(168,85,247,0.08));
    border-color: rgba(129,140,248,0.35);
  }
  .def-app.def-theme-dark .def-sidebar-pillar-expand {
    background: rgba(255,255,255,0.06);
  }
  .def-sidebar-link {
    display: grid;
    grid-template-columns: 34px minmax(0, 1fr);
    align-items: center;
    column-gap: 10px;
    width: 100%;
    padding: 10px 11px;
    border: 1px solid transparent;
    border-radius: 12px;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font: inherit;
    min-height: 48px;
    transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .def-sidebar-link:hover { background: var(--def-sidebar-hover); }
  .def-sidebar-link.active {
    background: var(--def-sidebar-active);
    border-color: rgba(99,102,241,0.22);
    box-shadow: inset 3px 0 0 #6366f1, 0 2px 10px rgba(99,102,241,0.08);
  }
  .def-sidebar-link-ceo {
    margin-bottom: 0;
    padding: 11px 12px;
    background: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(168,85,247,0.04));
    border-color: rgba(99,102,241,0.14);
  }
  .def-sidebar-link-ceo:hover {
    background: linear-gradient(135deg, rgba(99,102,241,0.11), rgba(168,85,247,0.07));
    border-color: rgba(99,102,241,0.2);
  }
  .def-sidebar-link-ceo.active {
    background: var(--def-sidebar-active);
    border-color: rgba(99,102,241,0.28);
    box-shadow: inset 3px 0 0 #6366f1, 0 4px 14px rgba(99,102,241,0.12);
  }
  .def-app.def-theme-dark .def-sidebar-link-ceo {
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06));
    border-color: rgba(255,255,255,0.08);
  }
  .def-sidebar-link-icon { opacity: 0.7; font-size: 0.7rem; }
  .def-sidebar-link .def-avatar { width: 30px; height: 30px; font-size: 0.6rem; border-radius: 8px; }
  .def-sidebar-link-text { min-width: 0; align-self: center; }
  .def-sidebar-link-text strong {
    display: block;
    font-size: 0.8125rem;
    font-weight: var(--font-bold);
    color: var(--def-sidebar-text);
    line-height: 1.3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-sidebar-link-text small {
    display: block;
    font-size: 0.6875rem;
    color: var(--def-sidebar-muted);
    line-height: 1.4;
    margin-top: 3px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-sidebar-score {
    flex-shrink: 0;
    font-size: 0.6875rem;
    font-weight: var(--font-extrabold);
    padding: 0 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.96);
    border: 1px solid var(--def-sidebar-border);
    min-width: 44px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    line-height: 1;
    box-shadow: 0 1px 2px rgba(15,23,42,0.05);
    font-variant-numeric: tabular-nums;
  }
  .def-app.def-theme-dark .def-sidebar-score {
    background: rgba(255,255,255,0.05);
  }
  .def-sidebar-nested {
    margin: 2px 0 0;
    padding: 8px;
    border: 1px solid rgba(99,102,241,0.12);
    border-radius: 11px;
    background: linear-gradient(180deg, rgba(248,250,252,0.96), rgba(241,245,249,0.88));
    animation: defFadeUp 0.25s ease both;
    display: flex;
    flex-direction: column;
    gap: 0;
    max-height: min(420px, 46vh);
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,0.35) transparent;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.8);
  }
  .def-sidebar-nested::-webkit-scrollbar { width: 4px; }
  .def-sidebar-nested::-webkit-scrollbar-thumb {
    background: rgba(148,163,184,0.35);
    border-radius: 999px;
  }
  .def-sidebar-ini-link {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    column-gap: 10px;
    row-gap: 5px;
    width: 100%;
    padding: 11px 10px;
    border: 1px solid transparent;
    border-radius: 9px;
    background: transparent;
    color: var(--def-sidebar-text);
    cursor: pointer;
    font: inherit;
    text-align: left;
    align-items: start;
    transition: background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }
  .def-sidebar-ini-link + .def-sidebar-ini-link {
    border-top: 1px solid rgba(148,163,184,0.16);
    margin-top: 0;
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
  .def-sidebar-ini-link:hover {
    background: rgba(99,102,241,0.07);
    border-color: rgba(99,102,241,0.1);
  }
  .def-sidebar-ini-link.active {
    background: linear-gradient(90deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06));
    border-color: rgba(99,102,241,0.2);
    box-shadow: inset 3px 0 0 #6366f1;
  }
  .def-sidebar-ini-name {
    grid-column: 1;
    grid-row: 1;
    margin: 0;
    font-size: 0.78125rem;
    font-weight: 700;
    color: var(--def-sidebar-text);
    line-height: 1.45;
    letter-spacing: -0.01em;
    overflow: hidden;
    word-break: break-word;
    line-clamp: 2;
  }
  .def-sidebar-ini-meta {
    grid-column: 1;
    grid-row: 2;
    display: block;
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 600;
    color: #64748b;
    line-height: 1.35;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-sidebar-ini-link .def-sidebar-ini-status {
    grid-column: 2;
    grid-row: 1 / span 2;
    align-self: center;
    justify-self: end;
  }
  .def-sidebar-ini-status {
    flex-shrink: 0;
    min-width: 42px;
    padding: 4px 9px;
    border-radius: 999px;
    border: 1px solid transparent;
    font-size: 0.6875rem;
    font-weight: 800;
    line-height: 1.2;
    text-align: center;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .def-app.def-theme-dark .def-sidebar-ini-link.active {
    border-color: rgba(255,255,255,0.1);
    box-shadow: inset 3px 0 0 #818cf8;
  }
  .def-app.def-theme-dark .def-sidebar-ini-meta {
    color: #94a3b8;
  }
  .def-app.def-theme-dark .def-sidebar-ini-link + .def-sidebar-ini-link {
    border-top-color: rgba(255,255,255,0.08);
  }

  .def-main {
    flex: 1;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    margin: 0;
    overflow-x: hidden;
    padding: var(--content-pad-y) var(--content-pad-x) var(--space-6);
  }

  .def-footer {
    width: 100%;
    padding: var(--space-2) var(--content-pad-x);
    border-top: 1px solid var(--def-border-soft);
    background: var(--def-footer-bg);
    backdrop-filter: blur(12px);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--space-2);
    font-size: 0.72rem;
    color: var(--def-muted);
    flex-shrink: 0;
  }
  .def-footer-compact {
    padding: 6px var(--content-pad-x);
    font-size: 0.68rem;
  }

  @media (max-width: 960px) {
    :root {
      --def-topbar-h: 56px;
    }
    .def-layout {
      grid-template-columns: 1fr;
      overflow: visible;
    }
    .def-menu-toggle {
      display: inline-flex;
    }
    .def-sidebar-backdrop {
      display: block;
      position: fixed;
      inset: var(--def-topbar-h) 0 0 0;
      z-index: 150;
      border: none;
      padding: 0;
      margin: 0;
      background: rgba(0,0,0,0.55);
      backdrop-filter: blur(2px);
      cursor: pointer;
    }
    .def-sidebar {
      position: fixed;
      top: var(--def-topbar-h);
      left: 0;
      bottom: 0;
      width: min(var(--def-sidebar-w), 92vw);
      z-index: 170;
      min-height: 0;
      max-height: none;
      align-self: auto;
      transform: translateX(-105%);
      transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1);
      border-right: 1px solid var(--def-sidebar-border);
      border-bottom: none;
      overflow-y: auto;
      overflow-x: hidden;
      overscroll-behavior: contain;
      box-shadow: 12px 0 40px rgba(15,23,42,0.18);
    }
    .def-sidebar.def-sidebar-open {
      transform: translateX(0);
    }
    .def-main { padding: var(--space-4) var(--space-3) var(--space-5); }
    .def-main:has(.def-cockpit) { padding: var(--space-2) var(--space-3) var(--space-3); }
    .def-topbar { height: var(--def-topbar-h); padding: 0 14px; }
    .def-card-clickable:hover,
    .def-panel:hover,
    .def-table-row:hover,
    .def-hero-panel:hover,
    .def-hover-lift:hover,
    .def-project-stat:hover {
      transform: none;
    }
    .def-sidebar-nested {
      margin: 0;
      padding: 6px;
      max-height: min(340px, 40vh);
    }
    .def-sidebar-ini-link {
      padding: 10px 9px;
      row-gap: 4px;
    }
    .def-sidebar-ini-name { font-size: 0.75rem; }
    .def-sidebar-link {
      min-height: 48px;
      padding: 10px 11px;
      grid-template-columns: 34px minmax(0, 1fr);
    }
    .def-sidebar-pillar-head {
      grid-template-columns: 34px minmax(0, 1fr) auto;
      column-gap: 8px;
      padding: 10px;
    }
  }

  @media (max-width: 1024px) {
    .def-initiative-progress { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  }

  @media (max-width: 768px) {
    .def-hero-panel {
      padding: 18px 16px;
      border-radius: 16px;
      margin-bottom: 18px;
    }
    .def-layer-header {
      flex-direction: column;
      align-items: stretch;
      gap: 14px;
    }
    .def-hero-stats {
      align-items: flex-start;
      flex-direction: row;
      flex-wrap: wrap;
      gap: 8px;
    }
    .def-hero-premium.def-layer-header h1,
    .def-layer-header.def-hero-premium h1 {
      font-size: 1.5rem;
      word-break: break-word;
    }
    .def-layer-header h1 {
      font-size: 1.45rem;
      word-break: break-word;
    }
    .def-header-with-avatar {
      flex-wrap: wrap;
      gap: 12px;
    }
    .def-subtitle {
      font-size: 0.86rem;
    }
    .def-panel {
      padding: 18px 16px;
      border-radius: 16px;
      margin-bottom: 18px;
    }
    .def-initiative-header { padding: var(--space-3); }
    .def-initiative-header-aside { align-items: flex-start; flex-direction: row; flex-wrap: wrap; }
    .def-initiative-progress { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .def-initiative-quick-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .def-scorecard-targets-row { grid-template-columns: 1fr; }
    .def-initiative-kpi-table { min-width: min(640px, 100%); }
    .def-kpi-item {
      padding: 12px;
      gap: 10px;
    }
    .def-kpi-num {
      font-size: 1.2rem;
    }
    .def-card {
      padding: 18px 16px;
      border-radius: 16px;
    }
    .def-card-top {
      flex-wrap: wrap;
      gap: 12px;
    }
    .def-card-identity {
      min-width: 0;
      flex: 1;
    }
    .def-card h3 {
      word-break: break-word;
    }
    .def-card-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .def-card-grid {
      grid-template-columns: 1fr;
    }
    .def-table th,
    .def-table td {
      padding: 10px 11px;
      font-size: var(--text-xs);
    }
    .def-table-wrap .def-table th:first-child,
    .def-table-wrap .def-table td:first-child {
      position: sticky;
      left: 0;
      z-index: 2;
      background: var(--def-glass);
      box-shadow: 2px 0 8px rgba(15,23,42,0.05);
    }
    .def-table-wrap .def-table thead th:first-child {
      z-index: 3;
      background: var(--def-table-head-bg);
    }
    .def-table-initiatives th:nth-child(2),
    .def-table-initiatives td:nth-child(2),
    .def-table-initiatives th:nth-child(5),
    .def-table-initiatives td:nth-child(5),
    .def-table-initiatives th:nth-child(6),
    .def-table-initiatives td:nth-child(6) {
      display: none;
    }
    .def-project-table th:nth-child(2),
    .def-project-table td:nth-child(2),
    .def-project-table th:nth-child(5),
    .def-project-table td:nth-child(5),
    .def-project-table td:nth-child(6),
    .def-project-table th:nth-child(6) {
      display: none;
    }
    .def-table-pro .def-table,
    .def-project-table {
      min-width: min(100%, 520px);
    }
    .def-linked-chip {
      font-size: var(--text-xs);
      padding: 4px 8px;
    }
    .def-table-name {
      flex-wrap: wrap;
    }
    .def-table-wrap {
    }
    .def-health-chart-card {
      padding: 12px 8px 10px;
      border-radius: 16px;
    }
    .def-health-chart-card .recharts-responsive-container {
      min-width: 0 !important;
    }
    .def-section-title {
      font-size: var(--text-md);
    }
    .def-section-desc {
      font-size: var(--text-sm);
      margin-bottom: 14px;
    }
    .def-stepper {
      border-radius: 16px;
      padding: 8px 10px;
    }
    .def-breadcrumb {
      flex-wrap: wrap;
      gap: 6px;
    }
    .def-project-badges {
      width: 100%;
    }
    .def-dev-module {
      padding-left: 0;
    }
    .def-project-card {
      padding: 16px;
      border-radius: 16px;
    }
    .def-project-head h3 {
      word-break: break-word;
    }
    .def-dev-top {
      flex-wrap: wrap;
      gap: 10px;
    }
  }

  @media (max-width: 640px) {
    .def-main { padding: var(--space-3) var(--space-3) var(--space-5); }
    .def-main:has(.def-cockpit) { padding: var(--space-2) var(--space-3); }
    .def-topbar-left { gap: 8px; }
    .def-topbar-mark {
      width: 34px;
      height: 34px;
      font-size: 0.66rem;
    }
    .def-topbar-brand {
      font-size: 0.82rem;
      max-width: calc(100vw - 130px);
    }
    .def-chart-head {
      flex-direction: column;
      align-items: stretch;
      gap: 12px;
    }
    .def-chart-controls {
      width: 100%;
      gap: 8px;
    }
    .def-chart-chip-group {
      flex: 1;
      justify-content: center;
    }
    .def-health-chart-divider {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 8px 10px;
    }
    .def-health-chart-divider-hint {
      display: none;
    }
    .def-health-legend {
      gap: 8px 12px;
      padding: 10px 8px 4px;
    }
    .def-health-tooltip {
      min-width: 0;
      max-width: calc(100vw - 32px);
    }
    .def-health-tooltip-head {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .def-live-badge {
      white-space: normal;
      font-size: 0.72rem;
    }
    .def-footer {
      flex-direction: column;
      align-items: flex-start;
      padding: 12px;
    }
    .def-card-stats strong {
      font-size: 1rem;
    }
    .def-card-stats span {
      font-size: 0.6rem;
    }
    .def-inline-progress {
      min-width: 88px;
    }
    .def-project-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .def-timeline-bar-labels {
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
    }
  }

  @media (max-width: 480px) {
    .def-sidebar-tier {
      width: 26px;
      height: 26px;
      font-size: 0.5rem;
    }
    .def-sidebar-link {
      padding: 8px var(--space-2);
      gap: var(--space-2);
    }
    .def-sidebar-score {
      font-size: 0.62rem;
      min-width: 38px;
      height: 26px;
      padding: 0 7px;
    }
    .def-sidebar-pillar-expand { min-height: 24px; min-width: 24px; }
    .def-sidebar-score-pillar { min-width: 38px; height: 24px; }
    .def-sidebar-ini-status { font-size: 0.54rem; min-width: 34px; padding: 2px 6px; }
    .def-hero-premium.def-layer-header h1,
    .def-layer-header.def-hero-premium h1 {
      font-size: 1.3rem;
    }
    .def-layer-header h1 {
      font-size: 1.25rem;
    }
    .def-card-arrow {
      opacity: 1;
      transform: none;
    }
    .def-btn-sm {
      padding: 8px 12px;
      font-size: 0.72rem;
    }
    .def-mesh-1,
    .def-mesh-2,
    .def-mesh-3 {
      opacity: 0.45;
    }
  }

  .def-accordion {
    border-top: 1px solid var(--def-border-soft);
    background: var(--def-accordion-bg);
  }
  .def-accordion-trigger {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border: none;
    background: transparent;
    color: var(--def-text);
    cursor: pointer;
    text-align: left;
    font: inherit;
    transition: background 0.2s;
  }
  .def-accordion-trigger:hover { background: rgba(255,255,255,0.04); }
  .def-accordion-trigger-text strong { display: block; font-size: 0.82rem; }
  .def-accordion-trigger-text small { display: block; font-size: 0.68rem; color: #64748b; margin-top: 2px; }
  .def-accordion-chevron {
    width: 24px;
    height: 24px;
    border-radius: 8px;
    background: rgba(255,255,255,0.08);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    font-weight: 700;
    flex-shrink: 0;
  }
  .def-accordion-panel { padding: 0 16px 14px; animation: defFadeUp 0.25s ease both; }
  .def-chart-accordion { border-radius: 0 0 18px 18px; }
  .def-chart-accordion .def-stock-legend-pro {
    padding: 0;
    background: transparent;
    border: none;
    grid-template-columns: 1fr 1fr;
  }

  .def-page-enter { animation: defPageEnter 0.45s cubic-bezier(0.22, 1, 0.36, 1) both; }
  .def-stagger-in {
    opacity: 0;
    animation: defFadeUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    animation-delay: var(--stagger, 0ms);
  }

  .def-stepper-item { display: inline-flex; align-items: center; }
  .def-stepper {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-bottom: 24px;
    padding: 10px 14px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 999px;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(16px) saturate(160%);
  }
  .def-stepper-line {
    width: 24px;
    height: 2px;
    background: linear-gradient(90deg, rgba(99,102,241,0.3), rgba(168,85,247,0.5));
    margin: 0 6px;
    border-radius: 999px;
  }
  .def-stepper-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    background: none;
    border: none;
    color: var(--def-blue);
    cursor: pointer;
    font-size: 0.82rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    transition: all 0.22s cubic-bezier(0.22, 1, 0.36, 1);
  }
  .def-stepper-btn:hover { background: rgba(99,102,241,0.1); transform: translateY(-1px); }
  .def-stepper-current {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 0.82rem;
    font-weight: 700;
    color: #fff;
    padding: 6px 14px;
    background: var(--def-gradient);
    border-radius: 999px;
    box-shadow: 0 8px 20px rgba(99,102,241,0.35);
  }
  .def-stepper-index {
    width: 22px; height: 22px;
    border-radius: 50%;
    background: rgba(255,255,255,0.15);
    color: inherit;
    font-size: 0.68rem;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .def-stepper-index.active { background: rgba(255,255,255,0.25); color: #fff; }

  .def-panel {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 20px;
    padding: var(--space-5);
    margin-bottom: var(--section-gap);
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(20px) saturate(160%);
    transition: box-shadow 0.35s, transform 0.35s, border-color 0.35s;
  }
  .def-panel:hover {
    box-shadow: var(--def-shadow-lg);
    border-color: rgba(167,139,250,0.35);
    transform: translateY(-2px);
  }
  .def-panel-flush { padding-top: 16px; }
  .def-panel-head { margin-bottom: 16px; }

  .def-exec-banner {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    padding: 16px 20px;
    margin-bottom: 22px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(251,146,60,0.15), rgba(244,63,94,0.1));
    border: 1px solid rgba(251,146,60,0.35);
    box-shadow: 0 12px 32px rgba(234,88,12,0.12);
    backdrop-filter: blur(12px);
  }
  .def-exec-banner-icon {
    width: 36px; height: 36px;
    border-radius: 12px;
    background: linear-gradient(135deg, #f97316, #ef4444);
    color: #fff;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 8px 20px rgba(239,68,68,0.35);
    animation: defPulse 2.5s ease-in-out infinite;
  }
  .def-exec-banner strong { display: block; color: #9a3412; font-size: 0.88rem; margin-bottom: 2px; }
  .def-exec-banner p { margin: 0; font-size: 0.8rem; color: #c2410c; }

  .def-card-avatar-wrap {
    position: relative;
    width: 52px;
    height: 52px;
    flex-shrink: 0;
  }
  .def-card-avatar-wrap .def-health-ring { position: absolute; inset: 0; }
  .def-health-ring-progress { transition: stroke-dashoffset 1s cubic-bezier(0.22, 1, 0.36, 1); }
  .def-card-avatar-wrap .def-avatar {
    position: absolute;
    top: 50%; left: 50%;
    transform: translate(-50%, -50%);
    width: 34px; height: 34px;
    font-size: 0.62rem;
    border-radius: 9px;
  }

  .def-card-status-at-risk { border-top: 3px solid #ea580c; }
  .def-card-status-blocked { border-top: 3px solid #dc2626; }
  .def-card-status-on-track { border-top: 3px solid #059669; }

  .def-table-pro {
    border-radius: 12px;
    overflow: visible;
    box-shadow: inset 0 0 0 1px var(--def-border);
  }
  .def-table-wrap.def-table-pro {
    overflow-x: auto;
    overflow-y: visible;
  }
  .def-table-scroll-wrap {
    position: relative;
  }
  .def-table-scroll-wrap::after {
    content: 'Scroll right';
    position: sticky;
    right: 0;
    bottom: 0;
    float: right;
    margin: -28px 8px 8px 0;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: var(--text-min);
    font-weight: 700;
    color: var(--def-muted);
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    pointer-events: none;
    opacity: 0.85;
  }
  @media (min-width: 769px) {
    .def-table-scroll-wrap::after { display: none; }
  }

  .def-timeline-visual { padding: 4px 0; }
  .def-timeline-bar-track {
    position: relative;
    height: 10px;
    background: #e2e8f0;
    border-radius: 999px;
    overflow: hidden;
    margin-bottom: 10px;
  }
  .def-timeline-bar-elapsed {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: linear-gradient(90deg, #bfdbfe, #93c5fd);
    border-radius: 999px;
    opacity: 0.55;
  }
  .def-timeline-bar-progress {
    position: absolute;
    left: 0; top: 0; bottom: 0;
    background: linear-gradient(90deg, var(--def-blue), #6366f1);
    border-radius: 999px;
    box-shadow: 0 0 12px rgba(37,99,235,0.35);
  }
  .def-timeline-bar-labels {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    font-size: 0.72rem;
    color: var(--def-muted);
    font-weight: 600;
  }

  .def-breadcrumb {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 6px;
    margin-bottom: 18px;
    font-size: 0.82rem;
    padding: 10px 14px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 12px;
    backdrop-filter: blur(8px);
    box-shadow: var(--def-shadow);
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
    max-width: 100%;
  }
  .def-breadcrumb::-webkit-scrollbar { display: none; }
  .def-bc-item { display: inline-flex; align-items: center; flex-wrap: nowrap; gap: 4px; flex-shrink: 0; white-space: nowrap; }
  .def-bc-sep { color: var(--def-subtle); margin: 0 4px; font-weight: 300; }
  .def-bc-tier {
    display: inline-block;
    font-size: 0.58rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--def-subtle);
    margin-right: 4px;
  }
  .def-bc-link {
    background: none;
    border: none;
    color: var(--def-blue);
    cursor: pointer;
    padding: 4px 8px;
    font-size: inherit;
    font-weight: 600;
    border-radius: 6px;
    transition: background 0.2s, color 0.2s;
  }
  .def-bc-link:hover {
    background: var(--def-sidebar-hover);
    color: var(--def-violet);
  }
  .def-bc-current {
    color: var(--def-text);
    font-weight: 600;
    padding: 4px 10px;
    background: var(--def-card-stat-bg);
    border: 1px solid var(--def-border-soft);
    border-radius: 6px;
  }

  .def-linked-projects {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 6px;
  }
  .def-linked-chip {
    border: 1px solid var(--def-border);
    background: var(--def-card-stat-bg);
    color: var(--def-muted);
    font-size: 0.65rem;
    font-weight: 600;
    padding: 3px 8px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.2s, color 0.2s, border-color 0.2s;
  }
  .def-linked-chip:hover {
    background: var(--def-sidebar-active);
    color: var(--def-text);
    border-color: rgba(99,102,241,0.3);
  }

  .def-main:has(.def-initiative-embed) {
    padding: 0;
  }
  .def-initiative-embed {
    width: 100%;
    min-width: 0;
  }
  .def-initiative-embed .pr-root,
  .def-initiative-embed .ghi-root {
    min-height: auto;
  }
  .def-initiative-embed .pr-shell,
  .def-initiative-embed .ghi-shell {
    min-height: auto;
  }

  .def-initiative-page {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    width: 100%;
    min-width: 0;
  }
  .def-initiative-header {
    position: relative;
    overflow: hidden;
    display: flex; align-items: flex-start; justify-content: space-between; gap: var(--space-3);
    flex-wrap: wrap; padding: var(--space-4);
    background: linear-gradient(135deg, #fff 0%, #f8fafc 100%);
    border: 1px solid var(--def-border);
    border-left: 4px solid #6366f1;
    border-radius: 14px;
    box-shadow: var(--def-shadow-sm);
    transition: box-shadow 0.25s ease, border-color 0.25s ease;
  }
  .def-initiative-header::after {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 140px; height: 140px;
    background: radial-gradient(circle, rgba(99,102,241,0.1), transparent 70%);
    pointer-events: none;
  }
  .def-initiative-header-main { min-width: 0; flex: 1 1 280px; }
  .def-initiative-meta {
    display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 6px;
  }
  .def-initiative-pillar {
    display: inline-block; padding: 2px 8px; border-radius: 6px;
    font-size: 0.62rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em;
    background: rgba(99,102,241,0.1); color: #4f46e5;
  }
  .def-initiative-parent {
    font-size: 0.68rem; font-weight: 600; color: var(--def-muted); line-height: 1.35;
  }
  .def-initiative-title {
    margin: 0 0 6px; font-size: clamp(var(--text-xl), 2.4vw, var(--text-2xl)); font-weight: var(--font-extrabold);
    letter-spacing: var(--tracking-tight); color: var(--def-heading); line-height: var(--leading-tight);
  }
  .def-initiative-sub { margin: 0; font-size: var(--text-sm); color: var(--def-muted); line-height: var(--leading-relaxed); }
  .def-initiative-sub strong { color: var(--def-text); font-weight: 700; }
  .def-initiative-header-aside {
    display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0;
  }

  .def-pillar-page {
    gap: var(--space-2);
  }
  .def-pillar-page .def-breadcrumb {
    margin-bottom: 0;
    padding: 8px 12px;
    background: transparent;
    border: none;
    box-shadow: none;
    backdrop-filter: none;
  }
  .def-pillar-shell {
    display: flex;
    flex-direction: column;
    min-width: 0;
    background: #fff;
    border: 1px solid var(--def-border);
    border-radius: 16px;
    box-shadow: var(--def-shadow-sm);
    overflow: hidden;
  }
  .def-pillar-hero {
    position: relative;
    padding: var(--space-4) var(--space-4) var(--space-3);
    background: linear-gradient(135deg, #fff 0%, #f8faff 55%, #f5f3ff 100%);
    border-bottom: 1px solid var(--def-border);
  }
  .def-pillar-hero::before {
    content: '';
    position: absolute;
    inset: 0 auto 0 0;
    width: 4px;
    background: linear-gradient(180deg, #6366f1, #8b5cf6);
  }
  .def-pillar-hero-main { min-width: 0; padding-left: 6px; }
  .def-pillar-hero-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
  }
  .def-pillar-title {
    margin: 0 0 4px;
    font-size: clamp(1.35rem, 2.6vw, 1.75rem);
    font-weight: var(--font-extrabold);
    letter-spacing: var(--tracking-tight);
    color: var(--def-heading);
    line-height: var(--leading-tight);
  }
  .def-pillar-subtitle {
    margin: 0;
    font-size: var(--text-sm);
    color: var(--def-muted);
    line-height: var(--leading-relaxed);
    max-width: 52ch;
  }
  .def-pillar-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 0;
    margin: 14px 0 0;
    padding: 0;
    list-style: none;
    font-size: 0.75rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-pillar-stats li {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .def-pillar-stats li:not(:last-child)::after {
    content: '';
    width: 1px;
    height: 12px;
    margin: 0 12px;
    background: var(--def-border);
  }
  .def-pillar-stats strong {
    color: var(--def-heading);
    font-weight: 800;
  }
  .def-pillar-health strong { font-weight: 800; }
  .def-top-risks-page .def-top-risks-hero::before {
    background: linear-gradient(180deg, #ef4444, #f59e0b);
  }
  .def-top-risks-preview {
    border-top: 1px solid var(--def-border);
    padding-top: var(--space-4);
  }
  .def-top-risks-preview .def-cockpit-top-risk-list {
    margin: 0;
  }
  .def-pillar-body {
    padding: var(--space-3) var(--space-4) var(--space-4);
    min-width: 0;
  }
  .def-pillar-section-head {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-2);
    margin-bottom: var(--space-2);
  }
  .def-pillar-section-title {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--def-heading);
    letter-spacing: -0.01em;
  }
  .def-pillar-section-desc {
    margin: 4px 0 0;
    font-size: 0.72rem;
    color: var(--def-muted);
    line-height: 1.45;
  }
  .def-table-embedded {
    border-radius: 10px;
    overflow: hidden;
    border: 1px solid rgba(226,232,240,0.95);
    box-shadow: none;
  }
  .def-table-embedded .def-table thead th {
    background: #f8fafc;
    font-size: 0.62rem;
  }
  .def-table-embedded .def-table tbody tr:last-child td {
    border-bottom: none;
  }
  .def-pillar-footer {
    display: flex;
    align-items: center;
    padding: var(--space-3) var(--space-4);
    border-top: 1px solid var(--def-border);
    background: #fafbfd;
  }
  .def-back-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: none;
    padding: 0;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--def-blue);
    cursor: pointer;
    transition: color 0.2s ease, transform 0.2s ease;
  }
  .def-back-link::before {
    content: '←';
    font-size: 0.9rem;
    line-height: 1;
    transition: transform 0.2s ease;
  }
  .def-back-link:hover {
    color: var(--def-violet);
  }
  .def-back-link:hover::before {
    transform: translateX(-3px);
  }

  .def-initiative-source {
    font-size: 0.62rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;
  }
  .def-initiative-source.adp { background: rgba(37,99,235,0.1); color: #1d4ed8; }
  .def-initiative-source.sample { background: rgba(148,163,184,0.18); color: #64748b; }
  .def-initiative-progress {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--space-2);
  }
  .def-initiative-progress-card {
    display: flex; flex-direction: column; gap: 6px; min-width: 0;
    padding: var(--space-3); background: #fff; border: 1px solid var(--def-border);
    border-radius: 10px; box-shadow: var(--def-shadow-sm);
  }
  .def-initiative-progress-label {
    font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.05em; color: var(--def-muted);
  }
  .def-initiative-progress-value {
    font-size: 0.78rem; font-weight: 700; color: var(--def-heading); line-height: 1.35;
  }
  .def-initiative-progress-card .def-progress-track { height: 6px; }
  .def-initiative-trend-row {
    display: flex; align-items: center; gap: 8px; margin-top: 2px;
  }
  .def-initiative-trend-row .def-tracker-spark { width: 64px; height: 32px; }
  .def-initiative-trend-note { font-size: 0.62rem; font-weight: 700; }
  .def-initiative-trend-note.up { color: #15803d; }
  .def-initiative-trend-note.down { color: #b91c1c; }
  .def-initiative-risk-row {
    display: flex; align-items: center; gap: 8px;
  }
  .def-initiative-risk-row strong { font-size: 0.82rem; color: var(--def-heading); }
  .def-initiative-risk-hint { font-size: 0.64rem; color: var(--def-muted); line-height: 1.35; }
  .def-initiative-quick-stats {
    display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-2);
  }
  .def-initiative-stat {
    padding: var(--space-2) var(--space-3); background: linear-gradient(180deg, #fff, #f8fafc);
    border: 1px solid var(--def-border); border-radius: 10px; text-align: center;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }
  .def-initiative-stat:hover {
    transform: translateY(-2px);
    box-shadow: var(--def-shadow-sm);
    border-color: rgba(99,102,241,0.28);
  }
  .def-initiative-stat-num {
    display: block; font-size: 1.15rem; font-weight: 800; color: var(--def-heading); line-height: 1.2;
  }
  .def-initiative-stat-lbl {
    display: block; margin-top: 2px; font-size: 0.62rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.04em; color: var(--def-muted);
  }
  .def-initiative-actions { margin-top: var(--space-3); }
  .def-initiative-project-table { min-width: 640px; }
  .def-btn-ghost {
    background: transparent; border: 1px solid var(--def-border); color: var(--def-text);
  }
  .def-btn-ghost:hover { background: rgba(99,102,241,0.06); border-color: rgba(99,102,241,0.25); }

  .def-scorecard-targets { margin-bottom: var(--space-3); }
  .def-scorecard-targets-label {
    margin: 0 0 8px; font-size: 0.68rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--def-muted);
  }
  .def-scorecard-targets-row {
    display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: var(--space-2);
  }
  .def-scorecard-target-card {
    padding: var(--space-3); border: 1px solid rgba(37,99,235,0.22); border-radius: 12px;
    background: linear-gradient(180deg, #fff, #f8fbff);
    box-shadow: var(--def-shadow-sm); min-width: 0;
    transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .def-scorecard-target-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--def-shadow-lg);
    border-color: rgba(37,99,235,0.42);
  }
  .def-scorecard-target-card span {
    display: block; font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.05em; color: #1d4ed8; margin-bottom: 4px;
  }
  .def-scorecard-target-card strong {
    display: block; font-size: 0.82rem; font-weight: 700; color: var(--def-heading); line-height: 1.35;
  }
  .def-initiative-kpi-table .def-scorecard-status { font-size: 0.78rem; }
  .def-table-row-click { cursor: pointer; }
  .def-table-row-click:focus-visible { outline: 2px solid #6366f1; outline-offset: -2px; }
  .def-scorecard-status {
    display: inline-flex; align-items: center; gap: 6px; font-weight: 700; white-space: nowrap;
  }
  .def-scorecard-dot {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; font-style: normal;
  }
  .def-scorecard-dot-track { background: #22c55e; }
  .def-scorecard-dot-watch { background: #f59e0b; }
  .def-scorecard-dot-risk { background: #ef4444; }

  .def-hero-panel {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 22px;
    padding: 24px 28px;
    box-shadow: var(--def-shadow);
    margin-bottom: 24px;
    backdrop-filter: blur(20px) saturate(160%);
    transition: box-shadow 0.35s, transform 0.35s;
  }
  .def-hero-panel:hover { box-shadow: var(--def-shadow-lg); }
  .def-hero-premium {
    background: linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(49,46,129,0.92) 45%, rgba(88,28,135,0.88) 100%);
    border: 1px solid rgba(167,139,250,0.25);
    color: var(--def-hero-title);
    overflow: hidden;
    position: relative;
  }
  .def-hero-premium::before {
    content: '';
    position: absolute;
    top: -50%; right: -20%;
    width: 400px; height: 400px;
    background: radial-gradient(circle, rgba(236,72,153,0.25), transparent 70%);
    pointer-events: none;
  }
  .def-hero-premium .def-eyebrow { color: var(--def-hero-muted); }
  .def-hero-premium .def-subtitle { color: var(--def-hero-muted); max-width: none; }
  .def-hero-content { position: relative; z-index: 1; }
  .def-hero-stats { display: flex; flex-direction: column; align-items: flex-end; gap: 10px; position: relative; z-index: 1; }
  .def-hero-stat-pill {
    padding: 10px 16px;
    border-radius: 14px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    backdrop-filter: blur(8px);
    text-align: right;
  }
  .def-hero-stat-pill span { display: block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--def-hero-muted); margin-bottom: 2px; }
  .def-hero-stat-pill strong { font-size: 1.4rem; font-weight: 800; }
  .def-hero-premium .def-live-badge {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.12);
    color: var(--def-hero-muted);
  }
  .def-hero-premium .def-hero-stats .def-pill {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
  }
  .def-hero-premium .def-hero-stats .def-risk {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.15);
    backdrop-filter: blur(8px);
  }
  .def-hero-premium .def-header-with-avatar .def-avatar {
    box-shadow: 0 8px 24px rgba(0,0,0,0.25), 0 0 0 3px rgba(255,255,255,0.12);
  }

  .def-layer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; flex-wrap: wrap; width: 100%; }
  .def-header-with-avatar { display: flex; align-items: flex-start; gap: 16px; }
  .def-eyebrow {
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--def-subtle);
    margin: 0 0 6px;
    font-weight: 700;
  }
  .def-layer-header h1 {
    margin: 0 0 8px;
    font-size: 1.85rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--def-heading);
    background: var(--def-gradient);
    background-size: 200% auto;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: defGradientShift 8s ease infinite;
  }
  .def-hero-premium.def-layer-header h1,
  .def-layer-header.def-hero-premium h1 {
    background: none;
    -webkit-text-fill-color: var(--def-hero-title);
    color: var(--def-hero-title);
    background-size: auto;
    background-clip: border-box;
    animation: none;
    font-size: 2rem;
  }
  .def-subtitle { margin: 0; color: var(--def-muted); font-size: 0.93rem; line-height: 1.55; }
  .def-updated { font-size: 0.8rem; color: var(--def-muted); white-space: nowrap; }
  .def-live-badge {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 14px;
    background: var(--def-live-badge-bg);
    border: 1px solid var(--def-live-badge-border);
    border-radius: 999px;
    color: var(--def-live-badge-text);
    font-weight: 500;
  }
  .def-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #059669;
    box-shadow: 0 0 0 3px rgba(5,150,105,0.2);
    animation: defLivePulse 2s ease-in-out infinite;
  }

  .def-avatar {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 42px;
    height: 42px;
    border-radius: 12px;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    flex-shrink: 0;
    transition: transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.25s;
  }
  .def-avatar-blue { background: linear-gradient(135deg, #dbeafe, #bfdbfe); color: #1d4ed8; box-shadow: 0 4px 12px rgba(37,99,235,0.15); }
  .def-avatar-green { background: linear-gradient(135deg, #d1fae5, #a7f3d0); color: #047857; box-shadow: 0 4px 12px rgba(5,150,105,0.15); }
  .def-avatar-amber { background: linear-gradient(135deg, #fef3c7, #fde68a); color: #b45309; box-shadow: 0 4px 12px rgba(217,119,6,0.15); }
  .def-avatar-red { background: linear-gradient(135deg, #fee2e2, #fecaca); color: #b91c1c; box-shadow: 0 4px 12px rgba(220,38,38,0.15); }
  .def-avatar-indigo { background: linear-gradient(135deg, #e0e7ff, #c7d2fe); color: #4338ca; box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
  .def-avatar-slate { background: linear-gradient(135deg, #f1f5f9, #e2e8f0); color: #475569; box-shadow: 0 4px 12px rgba(71,85,105,0.12); }

  .def-kpi-strip {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 152px), 1fr));
    gap: 14px;
    margin-bottom: 24px;
    width: 100%;
  }
  .def-kpi-strip-quad {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 1280px) {
    .def-kpi-strip:not(.def-kpi-strip-quad) { grid-template-columns: repeat(6, minmax(0, 1fr)); }
    .def-kpi-strip-quad { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  }
  @media (max-width: 900px) {
    .def-kpi-strip { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  }
  @media (max-width: 480px) {
    .def-kpi-strip { grid-template-columns: 1fr; }
  }
  .def-kpi-item {
    position: relative;
    overflow: hidden;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 16px;
    padding: 16px 18px;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(16px) saturate(160%);
    transition: transform 0.28s ease, box-shadow 0.28s, border-color 0.28s;
  }
  .def-kpi-item:hover {
    transform: translateY(-6px) scale(1.02);
    box-shadow: var(--def-shadow-glow);
    border-color: rgba(167,139,250,0.4);
  }
  .def-kpi-icon-wrap {
    width: 44px; height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, color-mix(in srgb, var(--kpi-color) 18%, transparent), color-mix(in srgb, var(--kpi-color) 8%, transparent));
    border: 1px solid color-mix(in srgb, var(--kpi-color) 25%, transparent);
    flex-shrink: 0;
    box-shadow: 0 8px 20px color-mix(in srgb, var(--kpi-color) 20%, transparent);
  }
  .def-kpi-icon { font-size: 1rem; color: var(--kpi-color); filter: saturate(1.2); }
  .def-kpi-body { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 2px; }
  .def-kpi-num {
    display: block;
    font-size: 1.5rem;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: var(--kpi-color, var(--def-text));
  }
  .def-kpi-lbl {
    display: block;
    font-size: 0.65rem;
    color: var(--def-muted);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1.3;
  }
  .def-kpi-glow {
    position: absolute;
    bottom: -20px; right: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: var(--kpi-color);
    opacity: 0.08;
    filter: blur(20px);
    pointer-events: none;
  }

  .def-section { margin-bottom: 28px; width: 100%; min-width: 0; }
  .def-section-title {
    margin: 0 0 6px;
    font-size: var(--text-lg);
    font-weight: var(--font-bold);
    letter-spacing: var(--tracking-tight);
    color: var(--def-heading);
    position: relative;
    display: inline-block;
  }
  .def-section-title::after {
    content: '';
    display: block;
    height: 3px;
    width: 48px;
    margin-top: 8px;
    border-radius: 999px;
    background: var(--def-gradient);
  }
  .def-section-desc { margin: 0 0 18px; font-size: var(--text-sm); color: var(--def-muted); line-height: var(--leading-relaxed); }

  .def-chart-section { width: 100%; }
  .def-health-chart { width: 100%; min-width: 0; margin-bottom: 28px; }

  .def-health-chart-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  @media (max-width: 900px) {
    .def-health-chart-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  }
  .def-health-stat {
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(12px);
  }
  .def-health-stat-primary {
    border-color: rgba(99,102,241,0.35);
    box-shadow: var(--def-shadow-glow);
  }
  .def-health-stat span {
    display: block;
    font-size: 0.68rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--def-muted);
    font-weight: 700;
    margin-bottom: 4px;
  }
  .def-health-stat strong { display: block; font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; line-height: 1.1; }
  .def-health-stat small { display: block; font-size: 0.72rem; color: var(--def-muted); margin-top: 4px; }
  .def-health-stat small.up { color: #059669; font-weight: 600; }
  .def-health-stat small.down { color: #dc2626; font-weight: 600; }

  .def-health-chart-card {
    background: var(--def-chart-wrap-bg);
    border: 1px solid var(--def-chart-border);
    border-radius: 20px;
    padding: 16px 12px 12px;
    box-shadow: var(--def-shadow-glow);
    overflow: visible;
    width: 100%;
    min-width: 0;
    max-width: 100%;
    touch-action: auto;
    transition: background 0.35s ease;
  }
  .def-health-chart-card .recharts-responsive-container,
  .def-health-chart-card .recharts-wrapper {
    touch-action: auto;
  }
  .def-health-chart-divider {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    padding: 10px 14px;
    margin: 4px 0;
    border-top: 1px solid var(--def-border-soft);
    border-bottom: 1px solid var(--def-border-soft);
    background: var(--def-accordion-bg);
  }
  .def-health-chart-divider span:first-child {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--def-muted);
  }
  .def-health-chart-divider-hint { font-size: 0.68rem; color: var(--def-muted); opacity: 0.85; }

  .def-health-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px 18px;
    padding: 12px 14px 4px;
    font-size: 0.72rem;
    color: var(--def-muted);
  }
  .def-health-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .def-health-legend i {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    font-style: normal;
  }
  .def-lg-area { background: linear-gradient(135deg, #6366f1, #ec4899); }
  .def-lg-high { background: linear-gradient(90deg, #4ade80 50%, #f87171 50%); }
  .def-lg-target { background: transparent; border: 2px dashed #34d399; width: 14px !important; height: 0 !important; border-radius: 0 !important; }
  .def-lg-ma { background: linear-gradient(90deg, #fbbf24, #c4b5fd); }
  .def-lg-ontrack { background: #4ade80; }
  .def-lg-atrisk { background: #fbbf24; }
  .def-lg-delayed { background: #f87171; }
  .def-lg-util { background: #a855f7; border-radius: 50%; }
  .def-lg-vol { background: #6366f1; }

  .def-health-tooltip {
    background: var(--def-surface);
    border: 1px solid var(--def-border);
    border-radius: 14px;
    padding: 14px 16px;
    box-shadow: var(--def-shadow-lg);
    backdrop-filter: blur(16px);
    min-width: 220px;
  }
  .def-health-tooltip-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--def-border-soft);
  }
  .def-health-tooltip-period { margin: 0 0 4px; font-size: 0.72rem; color: var(--def-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  .def-health-tooltip-score { display: block; font-size: 1.6rem; font-weight: 800; letter-spacing: -0.03em; }
  .def-health-tooltip-delta {
    font-size: 0.72rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .def-health-tooltip-delta.up { color: #059669; background: rgba(5,150,105,0.1); }
  .def-health-tooltip-delta.down { color: #dc2626; background: rgba(220,38,38,0.1); }
  .def-health-tooltip-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px 14px;
    font-size: 0.78rem;
  }
  .def-health-tooltip-grid span { color: var(--def-muted); font-weight: 600; }
  .def-health-tooltip-grid strong { color: var(--def-text); font-size: 0.85rem; }

  .def-stock-terminal { width: 100%; }
  .def-stock-chart-wrap { width: 100%; }
  .def-chart-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 16px;
    width: 100%;
    min-width: 0;
  }
  .def-chart-controls {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    align-items: center;
  }
  .def-chart-chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    background: var(--def-glass);
    padding: 5px;
    border-radius: 999px;
    border: 1px solid var(--def-border);
    backdrop-filter: blur(12px);
  }
  .def-chart-chip {
    border: none;
    background: transparent;
    color: var(--def-muted);
    font-size: 0.72rem;
    font-weight: 700;
    padding: 7px 14px;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.22s, color 0.22s, transform 0.22s, box-shadow 0.22s;
    white-space: nowrap;
  }
  .def-chart-chip:hover { background: rgba(99,102,241,0.1); color: var(--def-blue); transform: translateY(-1px); }
  .def-chart-chip.active {
    background: var(--def-gradient);
    color: #fff;
    box-shadow: 0 8px 20px rgba(99,102,241,0.35);
  }
  .def-chart-status-group {
    border-radius: 14px;
  }
  .def-chart-status-chip.active.def-chart-status-onTrack {
    background: linear-gradient(135deg, #059669, #34d399);
    box-shadow: 0 6px 16px rgba(5,150,105,0.35);
    color: #fff;
  }
  .def-chart-status-chip.active.def-chart-status-atRisk {
    background: linear-gradient(135deg, #d97706, #fbbf24);
    box-shadow: 0 6px 16px rgba(217,119,6,0.35);
    color: #fff;
  }
  .def-chart-status-chip.active.def-chart-status-delayed {
    background: linear-gradient(135deg, #dc2626, #f87171);
    box-shadow: 0 6px 16px rgba(220,38,38,0.35);
    color: #fff;
  }
  .def-chart-status-chip.active.def-chart-status-utilization {
    background: linear-gradient(135deg, #7c3aed, #a855f7);
    box-shadow: 0 6px 16px rgba(124,58,237,0.35);
    color: #fff;
  }
  .def-chart-status-chip:not(.active) {
    opacity: 0.72;
  }

  .def-chart-summary-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }
  .def-chart-stat {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 16px;
    padding: 14px 16px;
    backdrop-filter: blur(12px);
    transition: transform 0.28s, box-shadow 0.28s, border-color 0.28s;
  }
  .def-chart-stat:hover {
    transform: translateY(-4px);
    box-shadow: var(--def-shadow-glow);
    border-color: rgba(167,139,250,0.35);
  }
  .def-chart-stat span { display: block; font-size: 0.68rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--def-muted); font-weight: 700; margin-bottom: 4px; }
  .def-chart-stat strong { display: block; font-size: 1.35rem; font-weight: 800; letter-spacing: -0.02em; color: var(--def-text); }
  .def-chart-stat small { display: block; font-size: 0.72rem; color: var(--def-subtle); margin-top: 4px; }

  .def-chart-card {
    background: rgba(255,255,255,0.94);
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 16px;
    padding: 16px 12px 12px;
    box-shadow: 0 4px 24px rgba(15,39,68,0.06);
    transition: box-shadow 0.3s;
  }
  .def-chart-card:hover { box-shadow: 0 8px 32px rgba(15,39,68,0.09); }

  .def-chart-tooltip {
    background: var(--def-surface);
    border: 1px solid var(--def-border);
    border-radius: 12px;
    padding: 12px 14px;
    box-shadow: var(--def-shadow-lg);
    min-width: 180px;
    backdrop-filter: blur(8px);
  }
  .def-chart-tooltip-title {
    margin: 0 0 10px;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--def-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .def-chart-tooltip-grid { display: flex; flex-direction: column; gap: 6px; }
  .def-chart-tooltip-row {
    display: grid;
    grid-template-columns: 8px 1fr auto;
    gap: 8px;
    align-items: center;
    font-size: 0.78rem;
    color: var(--def-muted);
  }
  .def-chart-tooltip-dot { width: 8px; height: 8px; border-radius: 50%; }
  .def-chart-tooltip-row strong { color: var(--def-text); font-size: 0.82rem; }

  .def-chart-legend-note {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 8px 4px;
    font-size: 0.72rem;
    color: #94a3b8;
  }
  .def-chart-legend-note span { display: inline-flex; align-items: center; gap: 6px; }
  .def-chart-legend-note i { display: inline-block; width: 14px; height: 3px; border-radius: 999px; font-style: normal; }

  @media (max-width: 640px) {
    .def-chart-head { flex-direction: column; }
    .def-chart-controls { width: 100%; }
    .def-chart-chip-group { flex: 1; justify-content: center; }
    .def-stock-ticker { flex-direction: column; align-items: flex-start; gap: 10px; }
    .def-stock-ticker-right { flex-wrap: wrap; gap: 10px; }
  }

  .def-stock-ticker {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    flex-wrap: wrap;
    background: var(--def-chart-ticker-bg);
    color: var(--def-chart-text);
    border-radius: 18px;
    padding: 16px 20px;
    margin-bottom: 12px;
    border: 1px solid var(--def-chart-border);
    box-shadow: var(--def-shadow-glow);
    transition: background 0.35s ease, color 0.35s ease;
  }
  .def-stock-symbol {
    font-size: 0.68rem;
    font-weight: 800;
    letter-spacing: 0.12em;
    color: var(--def-chart-muted);
    background: var(--def-topbar-pill-bg);
    padding: 4px 8px;
    border-radius: 6px;
  }
  .def-stock-price { font-size: 1.75rem; font-weight: 800; letter-spacing: -0.03em; }
  .def-stock-change { font-size: 0.85rem; font-weight: 700; padding: 4px 10px; border-radius: 999px; }
  .def-stock-change.up { color: #4ade80; background: rgba(74,222,128,0.12); }
  .def-stock-change.down { color: #f87171; background: rgba(248,113,113,0.12); }
  .def-stock-ticker-left { display: flex; align-items: baseline; gap: 12px; flex-wrap: wrap; }
  .def-stock-ticker-right { display: flex; gap: 16px; font-size: 0.78rem; color: var(--def-chart-muted); }
  .def-stock-ticker-right strong { color: var(--def-chart-text); margin-left: 4px; }

  .def-stock-chart-wrap {
    background: var(--def-chart-wrap-bg);
    border: 1px solid var(--def-chart-border);
    border-radius: 18px;
    padding: 14px 10px 10px;
    box-shadow: var(--def-shadow-glow);
    transition: background 0.35s ease;
  }
  .def-stock-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 14px;
    padding: 10px 12px 6px;
    font-size: 0.72rem;
    color: var(--def-chart-muted);
    border-top: 1px solid var(--def-border-soft);
    margin-top: 6px;
  }
  .def-stock-legend span { display: inline-flex; align-items: center; gap: 6px; }
  .def-stock-legend i { display: inline-block; width: 10px; height: 10px; border-radius: 2px; font-style: normal; }
  .def-stock-terminal .def-chart-summary-row { margin-bottom: 16px; }

  .def-stock-data-guide {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
    margin-bottom: 18px;
  }
  .def-stock-guide-item {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 14px 16px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 16px;
    backdrop-filter: blur(12px);
    box-shadow: var(--def-shadow);
  }
  .def-stock-guide-icon { font-size: 1.2rem; line-height: 1; flex-shrink: 0; }
  .def-stock-guide-item strong { display: block; font-size: 0.82rem; margin-bottom: 4px; color: var(--def-text); }
  .def-stock-guide-item p { margin: 0; font-size: 0.74rem; color: var(--def-muted); line-height: 1.45; }

  .def-stock-ticker-pro { margin-bottom: 0; border-radius: 18px 18px 0 0; border-bottom: none; }
  .def-stock-ticker-main { display: flex; flex-direction: column; gap: 2px; }
  .def-stock-price-label { font-size: 0.68rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; }
  .def-stock-price small { font-size: 1rem; opacity: 0.6; margin-left: 2px; }
  .def-stock-ticker-metrics {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }
  .def-stock-ticker-metric {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 8px 12px;
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 12px;
    min-width: 72px;
  }
  .def-stock-ticker-metric span { font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.08em; color: #94a3b8; font-weight: 700; }
  .def-stock-ticker-metric strong { font-size: 0.95rem; color: #f1f5f9; }
  .def-stock-ticker-metric small { font-size: 0.62rem; color: #64748b; }
  .def-stock-ticker-metric.target { border-color: rgba(52,211,153,0.25); background: rgba(52,211,153,0.08); }

  .def-stock-chart-terminal {
    border-radius: 0 0 18px 18px;
    padding: 0;
    overflow: hidden;
  }
  .def-stock-pane { padding: 16px 12px 8px; }
  .def-stock-pane-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 12px;
    flex-wrap: wrap;
    padding: 0 8px 12px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 8px;
  }
  .def-stock-pane-tag {
    display: inline-block;
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #a78bfa;
    background: rgba(167,139,250,0.12);
    border: 1px solid rgba(167,139,250,0.25);
    padding: 3px 8px;
    border-radius: 999px;
    margin-bottom: 6px;
  }
  .def-stock-pane-title h3 {
    margin: 0;
    font-size: 0.95rem;
    font-weight: 800;
    color: #e2e8f0;
    letter-spacing: -0.01em;
  }
  .def-stock-pane-meta {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 6px;
  }
  .def-stock-pane-scale { font-size: 0.68rem; color: #64748b; font-weight: 600; }
  .def-stock-pane-live {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.68rem;
    color: #94a3b8;
    font-weight: 600;
  }
  .def-stock-pane-split {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    flex-wrap: wrap;
    padding: 10px 20px;
    background: var(--def-accordion-bg);
    border-top: 1px solid var(--def-border-soft);
    border-bottom: 1px solid var(--def-border-soft);
  }
  .def-stock-pane-split-label {
    font-size: 0.72rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--def-muted);
  }
  .def-stock-pane-split-hint { font-size: 0.68rem; color: #64748b; }
  .def-stock-pane-volume { padding-top: 8px; }

  .def-stock-legend-pro {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    padding: 16px 20px 18px;
    background: rgba(0,0,0,0.2);
    border-top: 1px solid rgba(255,255,255,0.06);
    margin-top: 0;
  }
  .def-stock-legend-group { min-width: 0; }
  .def-stock-legend-title {
    margin: 0 0 8px;
    font-size: 0.68rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #94a3b8;
  }
  .def-stock-legend-items { display: flex; flex-direction: column; gap: 6px; }
  .def-stock-legend-items span { font-size: 0.72rem; color: var(--def-muted); }
  .def-zone-healthy { background: rgba(52,211,153,0.35) !important; border-radius: 3px !important; width: 14px !important; height: 10px !important; }
  .def-zone-warn { background: rgba(251,191,36,0.35) !important; border-radius: 3px !important; width: 14px !important; height: 10px !important; }
  .def-zone-risk { background: rgba(248,113,113,0.35) !important; border-radius: 3px !important; width: 14px !important; height: 10px !important; }
  .def-line-target { background: transparent !important; border: 2px dashed #34d399 !important; width: 14px !important; height: 0 !important; border-radius: 0 !important; }

  .def-candle-up { background: linear-gradient(180deg, #4ade80, #16a34a); box-shadow: 0 0 8px rgba(74,222,128,0.4); }
  .def-candle-down { background: rgba(15,23,42,0.9) !important; border: 2px solid #f87171 !important; width: 10px !important; height: 10px !important; box-shadow: 0 0 8px rgba(248,113,113,0.3); }

  .def-stock-tooltip {
    background: linear-gradient(145deg, rgba(15,23,42,0.98), rgba(30,27,75,0.98));
    border: 1px solid rgba(167,139,250,0.35);
    border-radius: 14px;
    padding: 0;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05);
    min-width: 280px;
    max-width: 320px;
    overflow: hidden;
  }
  .def-stock-tooltip-pro .def-stock-tooltip-head {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 10px;
    padding: 14px 16px 10px;
    background: rgba(255,255,255,0.04);
    border-bottom: 1px solid rgba(255,255,255,0.08);
  }
  .def-stock-tooltip-date {
    margin: 0;
    font-size: 0.82rem;
    color: #f1f5f9;
    text-transform: none;
    letter-spacing: -0.01em;
    font-weight: 800;
  }
  .def-stock-tooltip-sub { margin: 2px 0 0; font-size: 0.68rem; color: #64748b; font-weight: 500; }
  .def-stock-tooltip-badge {
    font-size: 0.68rem;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 999px;
    white-space: nowrap;
  }
  .def-stock-tooltip-badge.up { color: #4ade80; background: rgba(74,222,128,0.12); border: 1px solid rgba(74,222,128,0.25); }
  .def-stock-tooltip-badge.down { color: #f87171; background: rgba(248,113,113,0.12); border: 1px solid rgba(248,113,113,0.25); }
  .def-stock-tooltip-hint {
    margin: 0;
    padding: 10px 16px;
    font-size: 0.72rem;
    color: #94a3b8;
    line-height: 1.45;
    border-bottom: 1px solid rgba(255,255,255,0.06);
  }
  .def-stock-ohlc-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 12px 16px;
  }
  .def-stock-metric-row {
    display: flex;
    flex-direction: column;
    gap: 3px;
    padding: 8px 10px;
    background: rgba(255,255,255,0.04);
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.06);
  }
  .def-stock-metric-row.highlight {
    background: rgba(167,139,250,0.1);
    border-color: rgba(167,139,250,0.25);
    grid-column: 1 / -1;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .def-stock-metric-key {
    font-size: 0.68rem;
    color: #94a3b8;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .def-stock-metric-key em {
    display: block;
    font-style: normal;
    font-size: 0.62rem;
    color: #64748b;
    font-weight: 500;
    text-transform: none;
    letter-spacing: 0;
    margin-top: 1px;
  }
  .def-stock-metric-row strong { font-size: 1rem; color: #f8fafc; }
  .def-stock-tooltip-context {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    padding: 0 16px 12px;
  }
  .def-stock-tooltip-context div {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.72rem;
  }
  .def-stock-tooltip-context span { color: #64748b; font-weight: 600; }
  .def-stock-tooltip-context strong { color: #e2e8f0; font-size: 0.82rem; }
  .def-stock-tooltip-ma {
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
    padding: 10px 16px 14px;
    border-top: 1px solid rgba(255,255,255,0.08);
    font-size: 0.72rem;
    color: #94a3b8;
  }
  .def-stock-tooltip-ma span { display: inline-flex; align-items: center; gap: 6px; }
  .def-stock-tooltip-ma i { display: inline-block; width: 12px; height: 3px; border-radius: 999px; font-style: normal; }
  .def-stock-tooltip-ma strong { color: #f1f5f9; }

  @media (max-width: 640px) {
    .def-stock-data-guide { grid-template-columns: 1fr; }
    .def-stock-ticker-metrics { width: 100%; }
    .def-stock-ticker-metric { flex: 1; min-width: calc(33% - 8px); }
    .def-stock-legend-pro { grid-template-columns: 1fr; }
    .def-stock-tooltip { min-width: 240px; }
  }

  .def-card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 260px), 1fr)); gap: 16px; }
  .def-card {
    position: relative;
    overflow: hidden;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 20px;
    padding: 22px;
    text-align: left;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(16px) saturate(160%);
  }
  .def-card-clickable {
    cursor: pointer;
    transition: transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.35s, border-color 0.35s;
    width: 100%;
    font: inherit;
    color: inherit;
  }
  .def-card-clickable:hover {
    transform: translateY(-8px) scale(1.01);
    box-shadow: var(--def-shadow-glow);
    border-color: rgba(167,139,250,0.45);
  }
  .def-card-clickable:hover .def-avatar { transform: scale(1.08); }
  .def-card-clickable:hover .def-card-arrow { opacity: 1; transform: translateX(0); color: var(--def-violet); }
  .def-card-shine {
    position: absolute;
    inset: 0;
    background: linear-gradient(105deg, transparent 42%, rgba(255,255,255,0.45) 50%, transparent 58%);
    transform: translateX(-130%);
    transition: transform 0.65s ease;
    pointer-events: none;
  }
  .def-card-clickable:hover .def-card-shine { transform: translateX(130%); }
  .def-card-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 16px; }
  .def-card-identity { display: flex; align-items: flex-start; gap: 12px; }
  .def-card h3 { margin: 0 0 3px; font-size: 1.02rem; font-weight: 700; }
  .def-card-meta { margin: 0; font-size: 0.78rem; color: var(--def-muted); line-height: 1.4; }
  .def-card-arrow {
    display: block;
    margin-top: 14px;
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--def-subtle);
    opacity: 0;
    transform: translateX(-8px);
    transition: opacity 0.28s, transform 0.28s, color 0.28s;
  }

  .def-card-stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-bottom: 16px; }
  .def-card-stats div {
    text-align: center;
    background: var(--def-card-stat-bg);
    border-radius: 12px;
    padding: 10px 4px;
    border: 1px solid var(--def-border-soft);
    backdrop-filter: blur(8px);
    transition: background 0.25s, transform 0.25s, border-color 0.25s;
  }
  .def-card-clickable:hover .def-card-stats div {
    background: rgba(255,255,255,0.75);
    border-color: rgba(167,139,250,0.25);
  }
  .def-card-stats div:hover { transform: scale(1.04); }
  .def-card-stats strong { display: block; font-size: 1.12rem; font-weight: 800; }
  .def-card-stats span { font-size: 0.65rem; color: var(--def-muted); text-transform: uppercase; letter-spacing: 0.05em; font-weight: 600; }
  .def-card-stats strong { color: var(--def-text); }

  .def-health-row { display: flex; justify-content: space-between; font-size: 0.82rem; margin-bottom: 8px; font-weight: 600; }
  .def-alert-line {
    margin: 14px 0 0;
    font-size: 0.78rem;
    color: #c2410c;
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #fed7aa;
    animation: defPulse 2.5s ease-in-out infinite;
  }

  .def-pill {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 11px;
    border-radius: 999px;
    font-size: 0.7rem;
    font-weight: 700;
    border: 1px solid transparent;
    white-space: nowrap;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  .def-pill:hover { transform: scale(1.05); }
  .def-pill-pulse { animation: defPulse 2.5s ease-in-out infinite; }
  .def-pill-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
  .def-pill-sm { font-size: 0.65rem; padding: 3px 9px; }
  .def-risk {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid transparent;
    transition: transform 0.2s;
  }
  .def-risk:hover { transform: scale(1.04); }

  .def-progress-track {
    height: 7px;
    background: var(--def-progress-track);
    border-radius: 999px;
    overflow: hidden;
    position: relative;
  }
  .def-progress-fill {
    height: 100%;
    border-radius: 999px;
    width: var(--def-progress);
    position: relative;
    overflow: hidden;
  }
  .def-progress-animate { animation: defProgressGrow 1s cubic-bezier(0.22, 1, 0.36, 1) forwards; }
  .def-progress-fill::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
    animation: defShimmer 2.2s ease-in-out infinite;
  }

  .def-table-wrap {
    overflow-x: auto;
    overflow-y: visible;
    overscroll-behavior-x: contain;
    scrollbar-width: thin;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 18px;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(16px) saturate(160%);
    transition: box-shadow 0.35s, border-color 0.35s;
  }
  .def-table-wrap:hover {
    box-shadow: var(--def-shadow-lg);
    border-color: rgba(167,139,250,0.3);
  }
  .def-table { width: 100%; border-collapse: collapse; font-size: var(--text-sm); }
  .def-table th {
    text-align: left;
    padding: 14px 16px;
    background: var(--def-table-head-bg);
    color: var(--def-muted);
    font-weight: var(--font-bold);
    font-size: var(--text-xs);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    border-bottom: 1px solid var(--def-border-soft);
  }
  .def-table td { padding: 14px 16px; border-bottom: 1px solid rgba(148,163,184,0.12); vertical-align: middle; transition: background 0.2s; font-size: var(--text-sm); }
  .def-table-row { transition: background 0.22s, transform 0.22s; }
  .def-table-row:hover td { background: var(--def-table-row-hover); }
  .def-table-row:hover { transform: scale(1.002); }
  .def-table tr:last-child td { border-bottom: none; }
  .def-table-name { display: flex; align-items: center; gap: 10px; }
  .def-table-name .def-avatar { width: 34px; height: 34px; font-size: 0.68rem; border-radius: 10px; }

  .def-inline-progress { display: flex; align-items: center; gap: 10px; min-width: 110px; }
  .def-inline-progress .def-progress-track { flex: 1; }

  .def-btn-sm {
    background: var(--def-gradient);
    background-size: 200% auto;
    color: #fff;
    border: none;
    border-radius: 999px;
    padding: 8px 16px;
    font-size: var(--text-xs);
    font-weight: var(--font-bold);
    font-family: inherit;
    cursor: pointer;
    white-space: nowrap;
    box-shadow: 0 8px 24px rgba(99,102,241,0.35);
    transition: transform 0.22s, box-shadow 0.22s, background-position 0.35s;
  }
  .def-btn-sm:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 28px rgba(168,85,247,0.4);
    background-position: 100% center;
  }
  .def-btn-sm:active { transform: translateY(0); }
  .def-btn-full { width: 100%; margin-top: 14px; padding: 11px; }

  .def-back-btn {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    color: var(--def-muted);
    border-radius: 999px;
    padding: 11px 20px;
    font-size: 0.84rem;
    font-weight: 600;
    cursor: pointer;
    margin-top: 12px;
    backdrop-filter: blur(12px);
    transition: all 0.25s cubic-bezier(0.22, 1, 0.36, 1);
    box-shadow: var(--def-shadow);
  }
  .def-back-btn:hover {
    background: color-mix(in srgb, var(--def-glass) 88%, var(--def-blue) 12%);
    border-color: rgba(167,139,250,0.45);
    color: var(--def-blue);
    transform: translateX(-4px);
    box-shadow: var(--def-shadow-glow);
  }
  .def-app.def-theme-dark .def-back-btn:hover {
    background: rgba(255,255,255,0.08);
    color: var(--def-text);
  }

  .def-hover-lift { transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s; }
  .def-hover-lift:hover {
    transform: translateY(-4px);
    box-shadow: 0 16px 32px rgba(15,39,68,0.1);
  }

  .def-project-list { display: flex; flex-direction: column; gap: 18px; }
  .def-project-card {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 20px;
    padding: 22px;
    border-left: 4px solid #059669;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(16px) saturate(160%);
  }
  .def-project-delayed, .def-project-blocked { border-left-color: #dc2626; }
  .def-project-at-risk { border-left-color: #ea580c; }
  .def-project-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 16px; flex-wrap: wrap; }
  .def-project-head h3 { margin: 0 0 4px; font-size: 1.05rem; font-weight: 700; }
  .def-project-badges { display: flex; gap: 8px; flex-wrap: wrap; }

  .def-project-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(145px, 1fr)); gap: 12px; margin-bottom: 14px; }
  .def-project-stat {
    background: linear-gradient(180deg, #f8fafc, #fff);
    border: 1px solid #e2e8f0;
    border-radius: 10px;
    padding: 12px 14px;
    transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  }
  .def-project-stat:hover {
    border-color: #93c5fd;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(37,99,235,0.08);
  }
  .def-project-stat span { display: block; font-size: 0.7rem; color: var(--def-muted); margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .def-project-stat strong { font-size: 0.92rem; font-weight: 700; color: var(--def-text); }
  .def-project-stat .def-progress-track { margin-top: 8px; }

  .def-delay-reason {
    margin: 0 0 12px;
    font-size: 0.81rem;
    color: #c2410c;
    background: linear-gradient(135deg, #fff7ed, #ffedd5);
    padding: 10px 14px;
    border-radius: 8px;
    border: 1px solid #fed7aa;
  }
  .def-module-summary { display: flex; gap: 8px; flex-wrap: wrap; }
  .def-module-chip {
    font-size: 0.73rem;
    font-weight: 700;
    padding: 5px 12px;
    border-radius: 999px;
    transition: transform 0.2s;
  }
  .def-module-chip:hover { transform: scale(1.06); }
  .def-module-chip.done { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
  .def-module-chip.progress { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; }
  .def-module-chip.pending { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

  .def-blocker-box {
    background: linear-gradient(135deg, #fef2f2, #fff1f2);
    border: 1px solid #fecaca;
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 22px;
    font-size: 0.85rem;
    box-shadow: 0 4px 16px rgba(220,38,38,0.08);
    animation: defPulse 3s ease-in-out infinite;
  }
  .def-blocker-box ul { margin: 10px 0 0 18px; padding: 0; }
  .def-blocker-box li { margin-bottom: 5px; color: #991b1b; font-weight: 500; }

  .def-two-col { display: grid; grid-template-columns: 1.2fr 1fr; gap: 22px; }
  @media (max-width: 900px) { .def-two-col { grid-template-columns: 1fr; } }

  .def-project-table .def-project-name { display: block; font-size: 0.88rem; }
  .def-project-row-hint {
    display: block;
    margin-top: 4px;
    font-size: 0.72rem;
    color: #c2410c;
    font-weight: 500;
    max-width: 280px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-project-row-badges { display: flex; flex-wrap: wrap; gap: 6px; }
  .def-project-row-action { text-align: right; white-space: nowrap; }
  .def-project-row-active { background: rgba(99,102,241,0.06); }
  .def-inline-progress-wide { min-width: 120px; }

  .def-drawer-portal-host {
    position: fixed;
    inset: var(--def-topbar-h) 0 0 0;
    z-index: 300;
    pointer-events: none;
  }
  .def-drawer-portal-host:has(.def-drawer-root.open) {
    pointer-events: auto;
  }

  .def-drawer-root {
    position: fixed;
    inset: var(--def-topbar-h) 0 0 0;
    z-index: 200;
    pointer-events: none;
  }
  .def-drawer-root-global {
    position: absolute;
    inset: 0;
    z-index: 1;
    min-height: 100%;
  }
  .def-drawer-root-global .def-drawer-backdrop {
    background: rgba(15, 23, 42, 0.48);
    backdrop-filter: blur(8px);
  }
  .def-app.def-theme-dark .def-drawer-root-global .def-drawer-backdrop {
    background: rgba(0, 0, 0, 0.72);
  }
  .def-drawer-root.open { pointer-events: auto; }
  .def-drawer-backdrop {
    position: absolute;
    inset: 0;
    border: none;
    padding: 0;
    margin: 0;
    background: rgba(15,23,42,0.32);
    backdrop-filter: blur(4px);
    cursor: pointer;
    animation: defDrawerFadeIn 0.28s ease both;
  }
  .def-app.def-theme-dark .def-drawer-backdrop {
    background: rgba(0,0,0,0.62);
  }
  .def-drawer {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(580px, 100%);
    display: flex;
    flex-direction: column;
    background: var(--def-surface);
    border-left: 1px solid var(--def-border);
    box-shadow: -20px 0 60px rgba(15,23,42,0.18);
    transform: translateX(100%);
    animation: defDrawerSlideIn 0.34s cubic-bezier(0.22, 1, 0.36, 1) forwards;
    overflow: hidden;
  }
  .def-drawer-pro {
    background: linear-gradient(180deg, var(--def-surface) 0%, color-mix(in srgb, var(--def-surface) 92%, #eef2ff) 100%);
  }
  .def-drawer-pillar {
    width: min(680px, 100%);
    background: var(--def-surface);
  }
  .def-drawer-pillar.def-drawer-pro {
    background: var(--def-surface);
  }
  .def-drawer-head-pillar {
    flex-shrink: 0;
    padding: 14px 16px 12px;
    border-bottom: 1px solid var(--def-border);
    background: var(--def-surface);
  }
  .def-drawer-head-pillar .def-drawer-head-row {
    margin-bottom: 8px;
  }
  .def-drawer-head-pillar h2 {
    margin: 0 0 4px;
    font-size: 1.12rem;
    font-weight: var(--font-extrabold);
    letter-spacing: var(--tracking-tight);
    color: var(--def-heading);
    line-height: 1.25;
  }
  .def-drawer-pillar-desc {
    margin: 0 0 10px;
    font-size: var(--text-xs);
    color: var(--def-muted);
    line-height: 1.4;
  }
  .def-drawer-pillar-stats {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 8px;
  }
  .def-drawer-pillar-score {
    font-size: var(--text-2xs);
    font-weight: var(--font-extrabold);
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(15, 23, 42, 0.05);
    border: 1px solid var(--def-border-soft);
    letter-spacing: -0.01em;
    line-height: 1.2;
  }
  .def-drawer-pillar-meta {
    margin: 0;
    font-size: var(--text-2xs);
    font-weight: var(--font-semibold);
    color: var(--def-muted);
    line-height: 1.3;
  }
  .def-drawer-body-pillar {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    padding: 0;
  }
  .def-drawer-section-bar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--def-border);
    background: rgba(248,250,252,0.65);
  }
  .def-drawer-section-bar h3 {
    margin: 0;
    font-size: var(--text-xs);
    font-weight: var(--font-extrabold);
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--def-heading);
  }
  .def-drawer-section-bar span {
    font-size: var(--text-2xs);
    font-weight: var(--font-semibold);
    color: var(--def-muted);
    white-space: nowrap;
  }
  .def-drawer-pillar-table {
    flex: 1;
    min-height: 0;
    overflow: auto;
  }
  .def-drawer-pillar-table .def-table-wrap.def-table-pro {
    border-radius: 0;
    box-shadow: none;
    overflow: visible;
  }
  .def-drawer-pillar-table .def-table-scroll-wrap {
    max-height: none;
    overflow: visible;
  }
  .def-drawer-pillar-table .def-table-scroll-wrap::after {
    display: none;
  }
  .def-drawer-pillar-table .def-table {
    border: none;
    border-radius: 0;
  }
  .def-drawer-pillar-table .def-initiative-kpi-table thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: var(--def-table-head-bg);
    box-shadow: 0 1px 0 var(--def-border);
  }
  .def-drawer-pillar-table .def-initiative-kpi-table th,
  .def-drawer-pillar-table .def-initiative-kpi-table td {
    padding: 10px 14px;
    vertical-align: middle;
  }
  .def-drawer-pillar-table .def-initiative-kpi-table td:first-child,
  .def-drawer-pillar-table .def-initiative-kpi-table th:first-child {
    padding-left: 16px;
  }
  .def-drawer-pillar-table .def-initiative-kpi-table td:last-child,
  .def-drawer-pillar-table .def-initiative-kpi-table th:last-child {
    padding-right: 16px;
  }
  .def-cockpit-insights-drawer.def-drawer-pillar {
    width: min(720px, 100%);
  }
  .def-cockpit-insights-drawer.def-drawer {
    background: #fff;
    box-shadow: -24px 0 64px rgba(15, 23, 42, 0.22);
  }
  .def-cockpit-insights-drawer .def-drawer-head-pillar {
    background: #fff;
  }
  .def-cockpit-insights-drawer .def-drawer-section-bar {
    background: #f8fafc;
  }
  .def-app.def-theme-dark .def-cockpit-insights-drawer.def-drawer,
  .def-app.def-theme-dark .def-cockpit-insights-drawer .def-drawer-head-pillar {
    background: #1e293b;
    border-left-color: rgba(255, 255, 255, 0.1);
  }
  .def-app.def-theme-dark .def-cockpit-insights-drawer .def-drawer-section-bar {
    background: rgba(15, 23, 42, 0.72);
  }
  .def-cockpit-insights-drawer .def-modal-pro-table-wrap {
    margin: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
  }
  .def-app.def-theme-dark .def-cockpit-insights-drawer .def-modal-pro-table-wrap {
    background: #1e293b;
  }
  .def-cockpit-insights-drawer .def-modal-pro-table-scroll {
    flex: 1;
    min-height: 0;
    max-height: none;
  }

  .def-modal-pro-table-wrap {
    margin: 0 12px 12px;
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 1px 3px rgba(15,23,42,0.04);
    overflow: hidden;
  }
  .def-modal-pro-table-scroll {
    overflow: auto;
    max-height: min(58vh, 560px);
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,0.45) transparent;
  }
  .def-modal-pro-table {
    width: 100%;
    border-collapse: collapse;
    font-size: var(--text-xs);
    min-width: min(100%, 680px);
  }
  .def-modal-pro-table thead th {
    position: sticky;
    top: 0;
    z-index: 2;
    padding: 9px 12px;
    text-align: left;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
    background: #f8fafc;
    border-bottom: 1px solid rgba(226,232,240,0.95);
    white-space: nowrap;
  }
  .def-modal-pro-table tbody tr {
    transition: background 0.18s ease;
  }
  .def-modal-pro-table tbody tr:nth-child(even) td {
    background: rgba(248,250,252,0.65);
  }
  .def-modal-pro-table tbody tr:hover td {
    background: rgba(99,102,241,0.05);
  }
  .def-modal-pro-table td {
    padding: 10px 12px;
    border-bottom: 1px solid rgba(226,232,240,0.88);
    vertical-align: middle;
    color: var(--def-text);
    line-height: 1.35;
  }
  .def-modal-pro-table tbody tr:last-child td {
    border-bottom: none;
  }
  .def-modal-pro-table td:first-child,
  .def-modal-pro-table th:first-child {
    padding-left: 14px;
  }
  .def-modal-pro-table td:last-child,
  .def-modal-pro-table th:last-child {
    padding-right: 14px;
  }
  .def-modal-pro-table.def-modal-pro-table-ownership th:nth-child(n+2),
  .def-modal-pro-table.def-modal-pro-table-ownership td:nth-child(n+2) {
    text-align: center;
  }
  .def-modal-pro-table.def-modal-pro-table-milestones th:nth-child(n+3),
  .def-modal-pro-table.def-modal-pro-table-milestones td:nth-child(n+3) {
    text-align: center;
  }
  .def-modal-pro-table .def-table-row-click {
    cursor: pointer;
  }
  .def-modal-pro-table .def-table-row-click:focus-visible {
    outline: 2px solid rgba(99,102,241,0.45);
    outline-offset: -2px;
  }
  .def-modal-owner-cell {
    gap: 10px;
  }
  .def-modal-owner-cell strong {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--def-heading);
  }
  .def-modal-pro-table .def-modal-count-chip {
    display: inline;
    min-width: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    font-size: var(--text-xs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
  }
  .def-modal-pro-table .def-modal-band-cell {
    display: inline-flex;
    align-items: baseline;
    justify-content: center;
    gap: 5px;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .def-modal-pro-table .def-modal-band-cell strong {
    font-size: var(--text-xs);
    font-weight: 700;
    line-height: 1.2;
  }
  .def-modal-pro-table .def-modal-band-pct {
    font-size: 0.625rem;
    font-weight: 500;
    color: var(--def-muted);
    opacity: 1;
  }
  .def-modal-pro-table .def-modal-band-cell.band-on-track strong { color: #15803d; }
  .def-modal-pro-table .def-modal-band-cell.band-at-risk strong { color: #b45309; }
  .def-modal-pro-table .def-modal-band-cell.band-off-track strong { color: #b91c1c; }
  .def-modal-count-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: var(--font-extrabold);
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.16);
  }
  .def-modal-band-cell {
    display: inline-flex;
    align-items: baseline;
    gap: 6px;
    padding: 4px 9px;
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
    border: 1px solid transparent;
  }
  .def-modal-band-cell strong {
    font-size: var(--text-sm);
    font-weight: var(--font-extrabold);
    line-height: 1;
  }
  .def-modal-band-pct {
    font-size: var(--text-2xs);
    font-weight: var(--font-semibold);
    opacity: 0.82;
  }
  .def-modal-band-cell.band-on-track {
    color: #15803d;
    background: rgba(34,197,94,0.1);
    border-color: rgba(34,197,94,0.2);
  }
  .def-modal-band-cell.band-at-risk {
    color: #b45309;
    background: rgba(245,158,11,0.12);
    border-color: rgba(245,158,11,0.22);
  }
  .def-modal-band-cell.band-off-track {
    color: #b91c1c;
    background: rgba(239,68,68,0.1);
    border-color: rgba(239,68,68,0.2);
  }
  .def-modal-pro-table .def-modal-health-pill,
  .def-modal-pro-table .def-cockpit-health-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 0;
    padding: 2px 0;
    border: none;
    border-radius: 0;
    background: transparent !important;
    box-shadow: none;
    font-size: var(--text-xs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .def-modal-health-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: var(--font-extrabold);
    font-variant-numeric: tabular-nums;
    border: 1px solid transparent;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.45);
  }
  .def-modal-pro-table .def-modal-imperative-chip {
    display: inline-flex;
    align-items: center;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: #4338ca;
    background: rgba(99,102,241,0.07);
    border: none;
    white-space: nowrap;
  }
  .def-modal-imperative-chip {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: var(--text-2xs);
    font-weight: var(--font-bold);
    letter-spacing: 0.03em;
    text-transform: uppercase;
    color: #4338ca;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.18);
    white-space: nowrap;
  }
  .def-modal-pro-table .def-modal-days-chip,
  .def-modal-pro-table .def-cockpit-days-left {
    display: inline;
    min-width: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    font-size: var(--text-xs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
  }
  .def-modal-pro-table .def-cockpit-initiative-name {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--def-heading);
    line-height: 1.35;
  }
  .def-modal-pro-table .def-cockpit-due-date {
    font-size: var(--text-xs);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--def-muted);
  }
  .def-modal-pro-table .def-cockpit-status-pill {
    font-size: 0.625rem;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
  }
  .def-modal-pro-table.def-modal-pro-table-risks th:nth-child(n+2),
  .def-modal-pro-table.def-modal-pro-table-risks td:nth-child(n+2) {
    text-align: center;
  }
  .def-modal-pro-table.def-modal-pro-table-risks td strong {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--def-heading);
  }
  .def-modal-pro-table .def-modal-risk-score {
    min-width: 0;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent !important;
    font-size: var(--text-xs);
    font-weight: 700;
    font-variant-numeric: tabular-nums;
  }
  .def-modal-pro-table .def-modal-risk-score.tone-high { color: #dc2626; }
  .def-modal-pro-table .def-modal-risk-score.tone-medium { color: #d97706; }
  .def-modal-pro-table .def-modal-risk-score.tone-low { color: #ca8a04; }
  .def-modal-days-chip {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 30px;
    padding: 3px 9px;
    border-radius: 999px;
    background: rgba(15,23,42,0.05);
    border: 1px solid rgba(148,163,184,0.22);
  }
  .def-drawer-pillar-days {
    color: var(--def-heading);
  }
  .def-modal-pro-table .def-cockpit-empty {
    padding: 28px 16px;
    text-align: center;
    color: var(--def-muted);
    font-weight: var(--font-semibold);
  }
  .def-app.def-theme-dark .def-modal-pro-table-wrap {
    background: rgba(15,23,42,0.92);
    border-color: rgba(255,255,255,0.08);
    box-shadow: none;
  }
  .def-app.def-theme-dark .def-modal-pro-table thead th {
    background: rgba(15,23,42,0.98);
    border-bottom-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-modal-pro-table tbody tr:nth-child(even) td {
    background: rgba(255,255,255,0.02);
  }
  .def-app.def-theme-dark .def-modal-pro-table tbody tr:hover td {
    background: rgba(99,102,241,0.12);
  }
  .def-app.def-theme-dark .def-modal-pro-table .def-modal-days-chip,
  .def-app.def-theme-dark .def-modal-pro-table .def-cockpit-days-left {
    background: transparent;
    border: none;
    color: var(--def-heading);
  }
  @media (max-width: 768px) {
    .def-modal {
      width: 100%;
      max-height: min(94vh, 900px);
    }
    .def-modal-pro-table-wrap {
      margin: 0 8px 10px;
      border-radius: 8px;
    }
    .def-modal-pro-table-scroll {
      max-height: min(62vh, 520px);
    }
    .def-modal-pro-table {
      min-width: 0;
    }
    .def-modal-pro-table thead {
      display: none;
    }
    .def-modal-pro-table tbody tr {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 8px 12px;
      padding: 14px 14px 12px;
      border-bottom: 1px solid rgba(226,232,240,0.88);
    }
    .def-modal-pro-table tbody tr:hover {
      box-shadow: none;
      background: rgba(99,102,241,0.04);
    }
    .def-modal-pro-table tbody tr:last-child {
      border-bottom: none;
    }
    .def-modal-pro-table td {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 4px;
      padding: 0;
      border: none;
      background: transparent !important;
    }
    .def-modal-pro-table td::before {
      content: attr(data-label);
      font-size: var(--text-2xs);
      font-weight: var(--font-extrabold);
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--def-muted);
      line-height: 1.2;
    }
    .def-modal-pro-table td:first-child {
      grid-column: 1 / -1;
      padding-bottom: 4px;
      border-bottom: 1px dashed rgba(226,232,240,0.9);
      margin-bottom: 2px;
    }
    .def-modal-pro-table.def-modal-pro-table-ownership td:nth-child(2) {
      grid-column: 1 / -1;
    }
    .def-modal-pro-table.def-initiative-kpi-table td:first-child strong {
      font-size: var(--text-sm);
      line-height: 1.35;
    }
    .def-drawer-pillar-stats {
      flex-wrap: wrap;
      gap: 8px;
    }
    .def-drawer-pillar-meta {
      width: 100%;
    }
  }
  @media (max-width: 480px) {
    .def-modal-pro-table tbody tr {
      grid-template-columns: 1fr;
    }
    .def-modal-pro-table td:first-child {
      grid-column: auto;
    }
    .def-modal-pro-table.def-modal-pro-table-ownership td:nth-child(2) {
      grid-column: auto;
    }
  }

  .def-app.def-theme-dark .def-drawer-head-pillar {
    background: var(--def-surface);
  }
  .def-app.def-theme-dark .def-drawer-section-bar {
    background: rgba(255,255,255,0.03);
  }
  .def-app.def-theme-dark .def-drawer-pillar-score {
    background: rgba(255,255,255,0.06);
  }
  @keyframes defDrawerFadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes defDrawerSlideIn {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .def-modal-root {
    position: fixed;
    inset: 0;
    z-index: 220;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px 16px;
    pointer-events: none;
  }
  #def-modal-host {
    position: fixed;
    inset: 0;
    z-index: 220;
    pointer-events: none;
  }
  #def-modal-host:has(.def-modal-root.open) {
    pointer-events: auto;
  }
  .def-modal-root.open { pointer-events: auto; }
  .def-modal-backdrop {
    position: absolute;
    inset: 0;
    border: none;
    padding: 0;
    margin: 0;
    background: rgba(15,23,42,0.42);
    backdrop-filter: blur(6px);
    cursor: pointer;
    animation: defDrawerFadeIn 0.24s ease both;
  }
  .def-app.def-theme-dark .def-modal-backdrop {
    background: rgba(0,0,0,0.68);
  }
  .def-modal {
    position: relative;
    z-index: 1;
    width: min(920px, 100%);
    max-height: min(88vh, 860px);
    display: flex;
    flex-direction: column;
    background: var(--def-surface);
    border: 1px solid var(--def-border);
    border-radius: 16px;
    box-shadow:
      0 24px 48px rgba(15,39,68,0.2),
      0 8px 24px rgba(99,102,241,0.1);
    overflow: hidden;
    animation: defModalPopIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
  }
  .def-modal-pillar {
    background: linear-gradient(180deg, var(--def-surface) 0%, color-mix(in srgb, var(--def-surface) 94%, #eef2ff) 100%);
  }
  .def-modal-pillar .def-drawer-body-pillar {
    flex: 1;
    min-height: 0;
    overflow: hidden;
  }
  .def-modal-pillar .def-drawer-pillar-table {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  .def-modal-pillar .def-modal-pro-table-wrap {
    margin: 10px 12px 12px;
  }
  .def-modal-cockpit-table .def-cockpit-table-modal-body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    padding: 0 16px 16px;
  }
  .def-cockpit-modal-table-scroll {
    flex: 1;
    min-height: 0;
    max-height: min(58vh, 560px);
    overflow: auto;
    -webkit-overflow-scrolling: touch;
  }
  @keyframes defModalPopIn {
    from {
      opacity: 0;
      transform: translateY(14px) scale(0.98);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }
  @media (max-width: 768px) {
    .def-modal-root {
      padding: 12px;
      align-items: center;
    }
    .def-modal {
      width: 100%;
      max-height: min(92vh, 900px);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .def-modal {
      animation: none;
    }
  }

  .def-drawer-head-pro {
    position: relative;
    flex-shrink: 0;
    padding: 0;
    border-bottom: 1px solid var(--def-border-soft);
    background: var(--def-glass);
    backdrop-filter: blur(20px) saturate(160%);
    overflow: hidden;
  }
  .def-drawer-head-clean {
    flex-shrink: 0;
    padding: 18px 20px 16px;
    border-bottom: 1px solid var(--def-border);
    background: #fff;
  }
  .def-drawer-head-clean h2 {
    margin: 0 0 6px;
    font-size: clamp(1.05rem, 2.2vw, 1.28rem);
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--def-heading);
    line-height: 1.25;
    word-break: break-word;
  }
  .def-drawer-head-clean .def-drawer-subtitle {
    margin: 0 0 10px;
    font-size: 0.78rem;
    line-height: 1.45;
  }
  .def-drawer-head-clean .def-drawer-subtitle strong {
    color: var(--def-text);
    font-weight: 700;
  }
  .def-drawer-schedule-chip {
    font-size: 0.64rem;
    font-weight: 700;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid var(--def-border);
    background: #f8fafc;
    color: var(--def-muted);
  }
  .def-drawer-schedule-chip.ok {
    background: rgba(34,197,94,0.1);
    border-color: rgba(34,197,94,0.25);
    color: #15803d;
  }
  .def-drawer-schedule-chip.late {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.22);
    color: #b91c1c;
  }
  .def-drawer-head-accent {
    position: absolute;
    inset: 0 0 auto 0;
    height: 120px;
    pointer-events: none;
  }
  .def-drawer-head-inner {
    position: relative;
    padding: 20px 22px 18px;
  }
  .def-drawer-head-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 10px;
  }
  .def-drawer-tier {
    font-size: 0.62rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--def-muted);
  }
  .def-drawer-head-pro h2 {
    margin: 0 0 6px;
    font-size: 1.35rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--def-heading);
    line-height: 1.2;
    word-break: break-word;
  }
  .def-drawer-subtitle {
    margin: 0 0 12px;
    font-size: 0.84rem;
    color: var(--def-muted);
    font-weight: 500;
  }
  .def-drawer-head-badges {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .def-drawer-head-chip {
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--def-muted);
    padding: 5px 10px;
    border-radius: 999px;
    background: var(--def-glass);
    border: 1px solid var(--def-border-soft);
  }
  .def-drawer-close {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    border-radius: 10px;
    border: 1px solid var(--def-border);
    background: var(--def-glass);
    color: var(--def-muted);
    cursor: pointer;
    font-size: 0.9rem;
    transition: background 0.2s, color 0.2s, border-color 0.2s, transform 0.2s;
  }
  .def-drawer-close:hover {
    background: rgba(99,102,241,0.12);
    border-color: rgba(99,102,241,0.35);
    color: var(--def-blue);
    transform: scale(1.04);
  }
  .def-drawer-body-pro {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 16px 18px 28px;
    overscroll-behavior: contain;
  }
  .def-drawer-summary {
    display: grid;
    grid-template-columns: minmax(96px, 112px) minmax(0, 1fr);
    gap: 14px;
    align-items: center;
    padding: 14px 16px;
    margin-bottom: 14px;
    border-radius: 16px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    min-width: 0;
  }
  .def-drawer-gauge {
    position: relative;
    width: 100%;
    max-width: 112px;
    aspect-ratio: 1;
    min-height: 96px;
    flex-shrink: 0;
    overflow: visible;
  }
  .def-drawer-gauge .recharts-responsive-container {
    min-width: 0 !important;
  }
  .def-drawer-gauge-center {
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }
  .def-drawer-gauge-center strong {
    font-size: 1.2rem;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: var(--def-heading);
    line-height: 1;
  }
  .def-drawer-gauge-center span {
    margin-top: 3px;
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--def-muted);
  }
  .def-drawer-summary-stats {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }
  .def-drawer-summary-stat span {
    display: block;
    font-size: 0.6rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--def-muted);
    margin-bottom: 3px;
  }
  .def-drawer-summary-stat strong {
    display: block;
    font-size: 0.86rem;
    color: var(--def-text);
    line-height: 1.3;
  }
  .def-drawer-summary-stat small {
    display: block;
    margin-top: 2px;
    font-size: 0.72rem;
    color: var(--def-muted);
    font-weight: 500;
  }
  .def-drawer-alert {
    margin-bottom: 14px;
    padding: 12px 14px;
    border-radius: 14px;
    font-size: 0.82rem;
  }
  .def-drawer-alert strong {
    display: block;
    margin-bottom: 6px;
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .def-drawer-alert ul {
    margin: 0;
    padding-left: 18px;
  }
  .def-drawer-alert p { margin: 0; line-height: 1.45; }
  .def-drawer-alert-danger {
    background: linear-gradient(135deg, rgba(254,226,226,0.9), rgba(255,241,242,0.85));
    border: 1px solid #fecaca;
    color: #991b1b;
  }
  .def-drawer-alert-warn {
    background: linear-gradient(135deg, rgba(255,247,237,0.95), rgba(255,237,213,0.85));
    border: 1px solid #fed7aa;
    color: #9a3412;
  }
  .def-app.def-theme-dark .def-drawer-alert-danger {
    background: rgba(127,29,29,0.25);
    border-color: rgba(248,113,113,0.35);
    color: #fca5a5;
  }
  .def-app.def-theme-dark .def-drawer-alert-warn {
    background: rgba(124,45,18,0.25);
    border-color: rgba(251,146,60,0.35);
    color: #fdba74;
  }
  .def-drawer-charts {
    display: grid;
  }
  .def-drawer-charts-compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 14px;
  }
  .def-drawer-charts-compact .def-drawer-chart-card {
    padding: 12px;
    border-radius: 14px;
    min-width: 0;
    overflow: hidden;
  }
  .def-drawer-chart-wrap {
    width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  .def-drawer-chart-wrap .recharts-responsive-container {
    min-width: 0 !important;
  }
  .def-drawer-donut-legend-inline {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-top: 2px;
  }
  .def-drawer-donut-legend-inline span {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.66rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-drawer-chart-card {
    padding: 14px;
    border-radius: 16px;
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    box-shadow: var(--def-shadow);
    min-width: 0;
  }
  .def-drawer-chart-card-wide {
    grid-column: 1 / -1;
  }
  .def-drawer-chart-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
    min-width: 0;
    flex-wrap: wrap;
  }
  .def-drawer-chart-head h3 {
    margin: 0;
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--def-heading);
    letter-spacing: -0.01em;
    line-height: 1.25;
    flex: 1 1 auto;
    min-width: 0;
  }
  .def-drawer-chart-head span {
    font-size: 0.68rem;
    color: var(--def-muted);
    font-weight: 600;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .def-drawer-chart-card .def-chart-legend-row {
    margin-top: 6px;
    padding-top: 6px;
    border-top-color: var(--def-border-soft);
  }
  .def-drawer-donut-wrap { position: relative; }
  .def-drawer-donut-legend {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-top: 4px;
  }
  .def-drawer-donut-legend span {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 0.68rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-drawer-donut-legend i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
    font-style: normal;
  }
  .def-drawer-chart-tooltip {
    background: var(--def-surface);
    border: 1px solid var(--def-border);
    border-radius: 10px;
    padding: 8px 10px;
    box-shadow: var(--def-shadow-lg);
    font-size: 0.72rem;
    color: var(--def-muted);
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .def-drawer-chart-tooltip strong { color: var(--def-text); }
  .def-drawer-block {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    box-shadow: var(--def-shadow);
  }
  .def-drawer-block-compact {
    margin-bottom: 12px;
    padding: 14px;
    border-radius: 14px;
  }
  .def-drawer-block-compact .def-drawer-block-head {
    margin-bottom: 10px;
  }
  .def-drawer-block-compact .def-drawer-block-head h3 {
    font-size: 0.82rem;
  }
  .def-drawer-block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }
  .def-drawer-block-head h3 {
    margin: 0;
    font-size: 0.88rem;
    font-weight: 800;
    color: var(--def-heading);
  }
  .def-drawer-block-head span {
    font-size: 0.72rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-drawer-module-pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }
  .def-drawer-module-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .def-drawer-module {
    padding: 12px 14px;
    border-radius: 12px;
    border: 1px solid var(--def-border-soft);
    background: color-mix(in srgb, var(--def-glass) 85%, transparent);
    border-left-width: 3px;
  }
  .def-drawer-module-done { border-left-color: #34d399; }
  .def-drawer-module-in-progress { border-left-color: #6366f1; }
  .def-drawer-module-pending { border-left-color: #94a3b8; }
  .def-drawer-module-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 6px;
  }
  .def-drawer-module-top strong {
    font-size: 0.84rem;
    color: var(--def-text);
  }
  .def-drawer-module-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    font-size: 0.72rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-drawer-team-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .def-drawer-team-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 0;
    border-bottom: 1px solid var(--def-border-soft);
  }
  .def-drawer-team-row:last-child { border-bottom: none; padding-bottom: 0; }
  .def-drawer-team-info {
    flex: 1;
    min-width: 0;
  }
  .def-drawer-team-info strong {
    display: block;
    font-size: 0.82rem;
    color: var(--def-text);
  }
  .def-drawer-team-info span {
    display: block;
    font-size: 0.72rem;
    color: var(--def-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-drawer-team-util {
    font-size: 0.82rem;
    font-weight: 800;
    flex-shrink: 0;
  }
  @media (max-width: 768px) {
    .def-drawer-charts-compact { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .def-drawer { width: 100%; }
    .def-drawer-summary {
      grid-template-columns: 1fr;
      text-align: center;
      justify-items: center;
    }
    .def-drawer-summary-stats {
      width: 100%;
      text-align: left;
    }
    .def-drawer-gauge {
      max-width: 120px;
      margin: 0 auto;
    }
    .def-project-row-hint {
      max-width: none;
      white-space: normal;
      line-height: 1.35;
    }
    .def-drawer-team-info span {
      white-space: normal;
      overflow: visible;
      text-overflow: unset;
    }
  }

  .def-dev-list { display: flex; flex-direction: column; gap: 12px; }
  .def-dev-card {
    background: var(--def-glass);
    border: 1px solid var(--def-border);
    border-radius: 16px;
    padding: 16px 18px;
    box-shadow: var(--def-shadow);
    backdrop-filter: blur(12px);
  }
  .def-dev-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
  .def-dev-identity { display: flex; align-items: center; gap: 10px; }
  .def-dev-identity .def-avatar { width: 36px; height: 36px; font-size: 0.7rem; border-radius: 10px; }
  .def-dev-top strong { display: block; font-size: 0.9rem; font-weight: 700; }
  .def-dev-util { font-weight: 800; font-size: 0.92rem; }
  .def-dev-module { margin: 0 0 10px; font-size: 0.78rem; color: var(--def-muted); padding-left: 46px; }

  .def-timeline-box {
    background: rgba(255,255,255,0.94);
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 16px;
    padding: 18px 20px;
    box-shadow: 0 4px 20px rgba(15,39,68,0.05);
    transition: box-shadow 0.3s, transform 0.3s;
  }
  .def-timeline-box:hover {
    box-shadow: 0 8px 28px rgba(15,39,68,0.08);
    transform: translateY(-2px);
  }
  .def-timeline-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(165px, 1fr)); gap: 18px; }
  .def-timeline-row > div {
    padding: 12px 14px;
    background: #f8fafc;
    border-radius: 10px;
    border: 1px solid #e2e8f0;
    transition: border-color 0.25s, background 0.25s;
  }
  .def-timeline-row > div:hover { background: #fff; border-color: #93c5fd; }
  .def-timeline-row span { display: block; font-size: 0.72rem; color: #64748b; margin-bottom: 5px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
  .def-timeline-row strong { font-size: 0.96rem; font-weight: 700; }

  .def-main:has(.def-cockpit) {
    padding: clamp(var(--space-2), 1.2vw, var(--space-3)) clamp(var(--space-2), 1.4vw, var(--space-3)) var(--space-3);
  }

  @keyframes cockpitPulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(34,197,94,0.35); }
    50% { box-shadow: 0 0 0 4px rgba(34,197,94,0); }
  }
  @keyframes cockpitShimmerSweep {
    0% { transform: translateX(-130%) skewX(-14deg); opacity: 0; }
    30% { opacity: 0.75; }
    100% { transform: translateX(230%) skewX(-14deg); opacity: 0; }
  }
  @keyframes cockpitIconFloat {
    0%, 100% { transform: translateY(0) scale(1) rotate(0deg); }
    50% { transform: translateY(-2px) scale(1.1) rotate(-4deg); }
  }

  .def-cockpit {
    --cockpit-ease: cubic-bezier(0.22, 1, 0.36, 1);
    --cockpit-ease-spring: cubic-bezier(0.34, 1.45, 0.64, 1);
    --cockpit-shadow-sm: 0 1px 4px rgba(15,39,68,0.05);
    --cockpit-shadow-md: 0 12px 32px rgba(15,39,68,0.1), 0 2px 8px rgba(99,102,241,0.06);
    --cockpit-shadow-lg: 0 20px 48px rgba(99,102,241,0.16), 0 6px 16px rgba(15,39,68,0.08);
    --cockpit-hover-lift: -6px;
    --cockpit-hover-scale: 1.012;
    --cockpit-gap: clamp(8px, 0.9vw, 12px);
    --cockpit-metric-min-h: clamp(94px, 9vw, 106px);
    --cockpit-metric-pad-x: clamp(8px, 1vw, 12px);
    --cockpit-metric-pad-y: clamp(8px, 0.9vw, 10px);
    --cockpit-fast-chart: 108px;
    --cockpit-fast-min-h: clamp(168px, 15vw, 200px);
    --health-dot-size: 44px;
    --health-dot-core-size: 38px;
    display: flex; flex-direction: column; gap: var(--cockpit-gap); padding-bottom: 0;
  }
  .def-cockpit-interactive {
    position: relative;
    overflow: hidden;
    isolation: isolate;
    touch-action: manipulation;
    -webkit-tap-highlight-color: transparent;
    transition:
      transform 0.38s var(--cockpit-ease-spring),
      box-shadow 0.38s var(--cockpit-ease),
      border-color 0.32s ease,
      background 0.32s ease;
  }
  .def-cockpit-interactive::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 0;
    background: linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(168,85,247,0.04) 42%, transparent 68%);
    opacity: 0;
    transition: opacity 0.38s ease;
  }
  .def-cockpit-chart-card.def-cockpit-interactive::after,
  .def-cockpit-table-card.def-cockpit-interactive::after,
  .def-cockpit-metric-card.def-cockpit-interactive:not(.metric-count)::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: inherit;
    pointer-events: none;
    z-index: 1;
    background: linear-gradient(
      105deg,
      transparent 40%,
      rgba(255,255,255,0.52) 50%,
      transparent 60%
    );
    transform: translateX(-130%) skewX(-14deg);
    opacity: 0;
  }
  .def-cockpit-interactive > * {
    position: relative;
    z-index: 2;
  }
  .def-cockpit-interactive:focus-visible {
    outline: 2px solid #6366f1;
    outline-offset: 2px;
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-interactive:hover {
      transform: translateY(var(--cockpit-hover-lift)) scale(var(--cockpit-hover-scale));
      box-shadow: var(--cockpit-shadow-md);
      border-color: rgba(99,102,241,0.28);
    }
    .def-cockpit-interactive:hover::before { opacity: 1; }
    .def-cockpit-chart-card.def-cockpit-interactive:hover::after,
    .def-cockpit-table-card.def-cockpit-interactive:hover::after,
    .def-cockpit-metric-card.def-cockpit-interactive:not(.metric-count):hover::after {
      animation: cockpitShimmerSweep 0.72s var(--cockpit-ease) forwards;
    }
    .def-cockpit-metric-card:hover .def-cockpit-metric-icon {
      animation: cockpitIconFloat 0.55s var(--cockpit-ease-spring) both;
    }
    .def-cockpit-metric-card:hover .def-cockpit-metric-spark {
      opacity: 1;
      transform: translateY(-2px) scale(1.03);
    }
    .def-cockpit-metric-card:hover .def-cockpit-metric-value {
      transform: scale(1.035);
    }
    .def-cockpit-metric-card:hover .def-cockpit-metric-stripe,
    .def-cockpit-metric-card-overlay:hover .def-cockpit-metric-stripe {
      transform: scaleX(1);
      opacity: 1;
    }
    .def-cockpit-fast-health:hover .def-cockpit-fast-icon {
      animation: cockpitIconFloat 0.55s var(--cockpit-ease-spring) both;
    }
    .def-cockpit-fast-health:hover .def-cockpit-fast-chart {
      transform: scale(1.04);
    }
    .def-cockpit-move-stat:hover {
      transform: translateY(-3px);
      background: #fff;
      box-shadow: 0 8px 20px rgba(99,102,241,0.1);
      border-color: rgba(99,102,241,0.22);
    }
    .def-cockpit-exec-risk-item:hover {
      background: rgba(99,102,241,0.05);
      transform: translateX(3px);
      border-radius: 10px;
      padding-left: 6px;
      padding-right: 6px;
    }
    .def-cockpit-exec-risk-item:hover .def-cockpit-exec-risk-score {
      transform: scale(1.08);
      box-shadow: 0 6px 16px rgba(15,23,42,0.12);
    }
    .def-cockpit-rail-card.def-cockpit-interactive:hover {
      transform: translateY(-2px) scale(1.003);
      box-shadow: 0 4px 12px rgba(15,23,42,0.06), 0 1px 3px rgba(99,102,241,0.05);
      border-color: rgba(99,102,241,0.14);
    }
    .def-cockpit-rail-card.def-cockpit-interactive:hover::before {
      opacity: 0.35;
    }
    .def-cockpit-rail-card .def-cockpit-lq-stat:hover {
      transform: translateY(-1px);
      box-shadow: 0 3px 10px rgba(15,23,42,0.05);
      border-color: rgba(99,102,241,0.12);
    }
    .def-cockpit-rail-card .def-cockpit-highlight-item:hover {
      transform: translateX(2px);
      background: rgba(255,255,255,0.98);
    }
    .def-cockpit-rail-card .def-cockpit-highlight-item:hover .def-cockpit-highlight-icon {
      transform: scale(1.04);
    }
    .def-cockpit-rail-card .def-cockpit-top-risk-item:hover {
      transform: translateX(2px);
    }
    .def-cockpit-rail-card .def-cockpit-top-risk-item:hover .def-cockpit-risk-gauge-meta strong {
      transform: scale(1.02);
    }
    .def-cockpit-risk-item:hover { background: rgba(99,102,241,0.05); }
    .def-cockpit-table tbody tr:hover { background: rgba(99,102,241,0.06); }
    .def-cockpit-top:hover { box-shadow: var(--cockpit-shadow-sm); }
    .def-cockpit-user-trigger:hover { transform: translateY(-1px); }
    .def-cockpit-filter select:hover { border-color: rgba(99,102,241,0.35); }
    .def-chart-legend-item:hover {
      color: var(--def-heading);
      transform: translateY(-1px);
    }
    .def-cockpit-view-all:hover {
      color: #4338ca;
      transform: translateX(2px);
    }
  }
  @media (hover: none) {
    .def-cockpit-interactive:active {
      transform: scale(0.985);
      transition-duration: 0.14s;
    }
    .def-cockpit-metric-card:active,
    .def-cockpit-fast-health:active {
      opacity: 0.94;
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .def-cockpit-interactive,
    .def-cockpit-metric-card,
    .def-cockpit-fast-health,
    .def-cockpit-move-stat,
    .def-cockpit-highlight-item,
    .def-cockpit-lq-stat,
    .def-cockpit-exec-risk-item,
    .def-cockpit-metric-icon,
    .def-cockpit-metric-value,
    .def-cockpit-metric-spark,
    .def-stagger-in {
      transition: none !important;
      animation: none !important;
    }
    .def-stagger-in { opacity: 1; }
    .def-cockpit-interactive::after { display: none; }
  }
  .def-cockpit-top {
    position: relative;
    overflow: visible;
    z-index: 20;
    margin: 0;
    padding: 14px 16px 14px 18px;
    border-radius: 14px;
    border: 1px solid rgba(99,102,241,0.12);
    background: linear-gradient(135deg, #ffffff 0%, #f8faff 52%, #f5f3ff 100%);
    box-shadow: 0 4px 22px rgba(99,102,241,0.07);
    transition: box-shadow 0.28s var(--cockpit-ease), border-color 0.28s ease;
  }
  .def-cockpit-top::before {
    content: '';
    position: absolute;
    left: 0;
    top: 14px;
    bottom: 14px;
    width: 3px;
    border-radius: 0 4px 4px 0;
    background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
  }
  .def-cockpit-top-main {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 20px;
    min-width: 0;
  }
  .def-cockpit-top-copy {
    flex: 1 1 220px;
    min-width: 0;
  }
  .def-cockpit-eyebrow {
    margin: 0 0 4px;
    font-size: var(--text-2xs);
    font-weight: var(--font-bold);
    text-transform: uppercase;
    letter-spacing: var(--tracking-label);
    color: #6366f1;
  }
  .def-cockpit-title {
    margin: 0;
    font-size: clamp(1.15rem, 2.4vw, 1.45rem);
    font-weight: var(--font-extrabold);
    color: var(--def-heading);
    letter-spacing: var(--tracking-tight);
    line-height: var(--leading-tight);
    word-break: break-word;
  }
  .def-cockpit-top-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    flex: 1 1 280px;
    min-width: 0;
  }
  .def-cockpit-top-meta {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 0;
    background: transparent;
    border: none;
    box-shadow: none;
  }
  .def-cockpit-last-updated {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--def-border);
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--def-heading);
    white-space: nowrap;
  }
  .def-cockpit-last-updated-label {
    font-size: var(--text-2xs);
    font-weight: var(--font-bold);
    color: var(--def-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .def-cockpit-last-updated time {
    font-variant-numeric: tabular-nums;
  }
  .def-cockpit-filter {
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
    border-radius: 10px;
    background: #fff;
    border: 1px solid var(--def-border);
    font-size: var(--text-2xs);
    font-weight: var(--font-bold);
    color: var(--def-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    transition: border-color 0.22s ease, box-shadow 0.22s ease;
  }
  .def-cockpit-filter:focus-within {
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 0 0 2px rgba(99,102,241,0.1);
  }
  .def-cockpit-filter select {
    min-width: 0;
    width: auto;
    max-width: min(160px, 28vw);
    padding: 0 18px 0 0;
    border: none;
    background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2364748b' d='M1 1l4 4 4-4'/%3E%3C/svg%3E") no-repeat right center;
    font-size: var(--text-sm);
    font-weight: var(--font-semibold);
    color: var(--def-heading);
    cursor: pointer;
    appearance: none;
  }
  .def-cockpit-filter select:focus { outline: none; }
  .def-cockpit-user-popover-host {
    position: relative;
    display: inline-flex;
    align-items: center;
  }
  .def-cockpit-user-trigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .def-cockpit-user-trigger .def-avatar {
    width: 38px;
    height: 38px;
    font-size: 0.72rem;
    border-radius: 11px;
  }
  .def-cockpit-user-trigger:hover,
  .def-cockpit-user-trigger:focus-visible {
    transform: translateY(-1px);
  }
  .def-cockpit-user-trigger:focus-visible {
    outline: 2px solid rgba(99,102,241,0.45);
    outline-offset: 3px;
  }
  .def-cockpit-user-popover {
    position: absolute;
    top: calc(100% + 10px);
    right: 0;
    width: min(260px, 72vw);
    padding: 14px 16px;
    border-radius: 14px;
    background: #fff;
    border: 1px solid rgba(226,232,240,0.96);
    box-shadow:
      0 2px 8px rgba(15,23,42,0.06),
      0 18px 42px rgba(15,23,42,0.14);
    opacity: 0;
    visibility: hidden;
    transform: translateY(6px) scale(0.98);
    transform-origin: top right;
    transition:
      opacity 0.18s ease,
      transform 0.22s var(--cockpit-ease-spring),
      visibility 0.18s ease;
    z-index: 60;
    pointer-events: none;
  }
  .def-cockpit-user-popover::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 14px;
    width: 12px;
    height: 12px;
    background: #fff;
    border-left: 1px solid rgba(226,232,240,0.96);
    border-top: 1px solid rgba(226,232,240,0.96);
    transform: rotate(45deg);
  }
  .def-cockpit-user-popover-host:hover .def-cockpit-user-popover,
  .def-cockpit-user-popover-host:focus-within .def-cockpit-user-popover {
    opacity: 1;
    visibility: visible;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .def-cockpit-user-popover-head {
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
  }
  .def-cockpit-user-popover-head .def-avatar {
    width: 44px;
    height: 44px;
    font-size: 0.78rem;
    border-radius: 12px;
  }
  .def-cockpit-user-popover-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
    line-height: 1.25;
  }
  .def-cockpit-user-popover-copy strong {
    font-size: var(--text-sm);
    font-weight: var(--font-extrabold);
    color: var(--def-heading);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-cockpit-user-popover-copy small {
    font-size: var(--text-xs);
    color: var(--def-muted);
    font-weight: var(--font-semibold);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-cockpit-metrics-row {
    display: grid;
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: var(--cockpit-gap);
    align-items: stretch;
    min-width: 0;
  }
  .def-cockpit-metrics-row > .def-cockpit-metric-card,
  .def-cockpit-metrics-row > .def-cockpit-metric-card-overlay {
    width: 100%;
    height: 100%;
    min-height: var(--cockpit-metric-min-h);
    min-width: 0;
  }
  .def-cockpit-metric-card-overlay {
    display: block;
    height: 100%;
    min-width: 0;
  }
  .def-cockpit-metric-card-overlay > .def-cockpit-metric-card {
    height: 100%;
  }
  .def-cockpit-metric-card {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: clamp(4px, 0.6vw, 6px);
    padding: var(--cockpit-metric-pad-y) var(--cockpit-metric-pad-x) calc(var(--cockpit-metric-pad-y) - 1px);
    min-height: 0;
    min-width: 0;
    overflow: hidden;
    background: #fff;
    border: 1px solid rgba(226,232,240,0.92);
    border-radius: 14px;
    box-shadow:
      0 1px 2px rgba(15,23,42,0.04),
      0 6px 18px rgba(15,23,42,0.05);
  }
  .def-cockpit-metric-card.metric-status {
    padding-bottom: 8px;
    overflow: hidden;
    z-index: 1;
  }
  .def-cockpit-metric-card.metric-status:hover,
  .def-cockpit-metric-card.metric-status:focus-within {
    z-index: 3;
  }
  .def-cockpit-metric-card.metric-count {
    padding-top: 10px;
    background: linear-gradient(180deg, #ffffff 0%, rgba(99,102,241,0.045) 100%);
    border-color: rgba(99,102,241,0.16);
    --cockpit-hover-lift: -7px;
    --cockpit-hover-scale: 1.016;
  }
  .def-cockpit-metric-card.metric-scope {
    padding: 10px 12px 9px;
    background: linear-gradient(165deg, #ffffff 0%, rgba(99,102,241,0.05) 52%, rgba(129,140,248,0.07) 100%);
    border-color: rgba(99,102,241,0.18);
    --cockpit-hover-lift: -7px;
    --cockpit-hover-scale: 1.016;
  }
  .def-cockpit-metric-card.metric-scope::after {
    content: '';
    position: absolute;
    inset: auto -18px -18px auto;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 72%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.75;
    transition: transform 0.45s var(--cockpit-ease-spring), opacity 0.35s ease;
  }
  .def-cockpit-metric-scope-head {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .def-cockpit-metric-scope-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 5px;
    min-width: 0;
    flex: 1;
    align-items: stretch;
  }
  .def-cockpit-metric-scope-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    text-align: center;
    gap: 5px;
    min-width: 0;
    min-height: 100%;
    padding: 6px 3px 5px;
    border-radius: 8px;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(99,102,241,0.1);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.85);
    transition: border-color 0.25s ease, background 0.25s ease;
  }
  .def-cockpit-metric-scope-value {
    font-size: clamp(0.92rem, 1.35vw, 1.08rem);
    font-weight: var(--font-extrabold);
    color: var(--def-heading);
    line-height: 1;
    letter-spacing: var(--tracking-tight);
    font-variant-numeric: tabular-nums;
    flex-shrink: 0;
  }
  .def-cockpit-metric-scope-name {
    font-size: 0.5rem;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.02em;
    color: var(--def-muted);
    line-height: 1.2;
    min-height: calc(0.5rem * 1.2 * 2);
    width: 100%;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    text-align: center;
    white-space: normal;
    overflow: hidden;
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.metric-scope:hover .def-cockpit-metric-scope-item {
      border-color: rgba(99,102,241,0.22);
      background: rgba(255,255,255,0.92);
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.metric-scope:hover {
      border-color: rgba(99,102,241,0.42);
      box-shadow: var(--cockpit-shadow-lg);
    }
    .def-cockpit-metric-card.metric-scope:hover::after {
      opacity: 1;
      transform: scale(1.35);
    }
  }
  .def-cockpit-metric-card.metric-health {
    min-height: 0;
  }
  .def-cockpit-overall-health {
    position: relative;
    gap: clamp(3px, 0.5vw, 4px);
    overflow: hidden;
    isolation: isolate;
    background:
      linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 52%, rgba(255,255,255,0.98) 100%);
    box-shadow:
      0 1px 2px rgba(15,23,42,0.04),
      0 8px 24px rgba(15,23,42,0.06);
  }
  .def-cockpit-overall-health-dot {
    display: grid;
    place-items: center;
    width: var(--health-dot-size);
    height: var(--health-dot-size);
    border-radius: 50%;
    background: transparent;
    box-shadow: none;
  }
  .def-cockpit-overall-health-dot-core {
    display: block;
    width: var(--health-dot-core-size);
    height: var(--health-dot-core-size);
    border-radius: 50%;
    background: color-mix(in srgb, var(--health-dot-color, #22c55e) 95%, #fff);
    border: 1px solid color-mix(in srgb, var(--health-dot-color, #22c55e) 88%, #000);
    box-shadow: none;
  }
  .def-cockpit-overall-health.tone-green {
    border-color: rgba(34, 197, 94, 0.28);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(240,253,244,0.92) 48%, rgba(255,255,255,0.98) 100%);
    box-shadow:
      0 1px 2px rgba(15,23,42,0.04),
      0 6px 18px rgba(34,197,94,0.08),
      inset 0 1px 0 rgba(255,255,255,0.85);
  }
  .def-cockpit-overall-health.tone-yellow {
    border-color: rgba(234, 179, 8, 0.3);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,252,232,0.92) 48%, rgba(255,255,255,0.98) 100%);
    box-shadow:
      0 1px 2px rgba(15,23,42,0.04),
      0 6px 18px rgba(234,179,8,0.08),
      inset 0 1px 0 rgba(255,255,255,0.85);
  }
  .def-cockpit-overall-health.tone-red {
    border-color: rgba(239, 68, 68, 0.3);
    background:
      linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(254,242,242,0.92) 48%, rgba(255,255,255,0.98) 100%);
    box-shadow:
      0 1px 2px rgba(15,23,42,0.04),
      0 6px 18px rgba(239,68,68,0.08),
      inset 0 1px 0 rgba(255,255,255,0.85);
  }
  .def-cockpit-overall-health-head {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
    padding-right: 2px;
  }
  .def-cockpit-overall-health-head .def-cockpit-metric-label {
    font-size: 0.58rem;
  }
  .def-cockpit-overall-health-head .def-cockpit-metric-icon {
    background: color-mix(in srgb, var(--health-dot-color, #22c55e) 12%, #fff);
    border-color: color-mix(in srgb, var(--health-dot-color, #22c55e) 24%, transparent);
    color: var(--health-dot-color, #22c55e);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.75);
  }
  .def-cockpit-overall-health-head,
  .def-cockpit-overall-health-body {
    position: relative;
    z-index: 1;
  }
  .def-cockpit-overall-health-body {
    display: grid;
    grid-template-columns: minmax(0, 1fr) var(--health-dot-size);
    align-items: center;
    align-content: center;
    gap: 6px;
    flex: 1;
    min-height: 0;
    padding-top: 0;
    overflow: hidden;
  }
  .def-cockpit-overall-health-dot-wrap {
    display: grid;
    place-items: center;
    width: var(--health-dot-size);
    height: var(--health-dot-size);
    flex-shrink: 0;
    margin: 0;
    justify-self: end;
    align-self: center;
    z-index: 2;
    pointer-events: none;
    transition: transform 0.35s var(--cockpit-ease-spring);
  }
  .def-cockpit-overall-health-legend {
    list-style: none;
    margin: 0;
    padding: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    align-self: center;
  }
  .def-cockpit-overall-health-legend li {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 6px 2px 4px;
    border-radius: 999px;
    font-size: 0.48rem;
    font-weight: 700;
    color: var(--def-muted);
    line-height: 1.15;
    letter-spacing: 0.01em;
    background: rgba(255,255,255,0.72);
    border: 1px solid rgba(226,232,240,0.92);
    transition: color 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .def-cockpit-overall-health-legend li span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-cockpit-overall-health-legend li.is-active {
    color: var(--def-heading);
    font-weight: 800;
    background: color-mix(in srgb, var(--health-dot-color, #22c55e) 11%, #fff);
    border-color: color-mix(in srgb, var(--health-dot-color, #22c55e) 30%, transparent);
    box-shadow:
      0 1px 4px color-mix(in srgb, var(--health-dot-color, #22c55e) 16%, transparent),
      inset 0 1px 0 rgba(255,255,255,0.75);
  }
  .def-cockpit-overall-health-legend li i {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
    font-style: normal;
    border: 1px solid rgba(15, 23, 42, 0.08);
    box-shadow: 0 0 0 1px rgba(255,255,255,0.7);
  }
  .def-cockpit-overall-health.tone-green .def-cockpit-metric-stripe {
    background: linear-gradient(90deg, #22c55e, #059669);
  }
  .def-cockpit-overall-health.tone-yellow .def-cockpit-metric-stripe {
    background: linear-gradient(90deg, #eab308, #f59e0b);
  }
  .def-cockpit-overall-health.tone-red .def-cockpit-metric-stripe {
    background: linear-gradient(90deg, #ef4444, #dc2626);
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-overall-health:hover {
      border-color: color-mix(in srgb, var(--health-dot-color, #22c55e) 42%, transparent);
      box-shadow:
        0 1px 2px rgba(15,23,42,0.04),
        0 8px 22px color-mix(in srgb, var(--health-dot-color, #22c55e) 12%, transparent),
        inset 0 1px 0 rgba(255,255,255,0.85);
    }
    .def-cockpit-overall-health:hover .def-cockpit-overall-health-dot-wrap {
      transform: scale(1.04);
    }
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.metric-count:hover {
      border-color: rgba(99,102,241,0.42);
      box-shadow: var(--cockpit-shadow-lg);
    }
    .def-cockpit-metric-card.metric-count:hover::after {
      opacity: 1;
      transform: scale(1.35);
    }
  }
  .def-cockpit-metric-card.metric-count::after {
    content: '';
    position: absolute;
    inset: auto -18px -18px auto;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 72%);
    pointer-events: none;
    z-index: 0;
    opacity: 0.75;
    transition: transform 0.45s var(--cockpit-ease-spring), opacity 0.35s ease;
  }
  .def-cockpit-metric-stripe {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: var(--metric-band-color, linear-gradient(90deg, #6366f1, #a855f7));
    border-radius: 14px 14px 0 0;
    opacity: 0;
    transform: scaleX(0);
    transform-origin: left center;
    pointer-events: none;
    z-index: 1;
    transition:
      transform 0.55s var(--cockpit-ease),
      opacity 0.28s ease;
  }
  .def-cockpit-metric-head {
    display: flex;
    align-items: center;
    gap: 7px;
    min-width: 0;
  }
  .def-cockpit-metric-card.metric-count .def-cockpit-metric-head {
    justify-content: space-between;
  }
  .def-cockpit-metric-body {
    display: flex;
    flex-direction: column;
    gap: 3px;
    min-width: 0;
  }
  .def-cockpit-metric-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    min-width: 0;
  }
  .def-cockpit-metric-card.def-accent-emerald { border-color: rgba(5,150,105,0.2); --cockpit-hover-lift: -6px; }
  .def-cockpit-metric-card.def-accent-emerald:hover { border-color: rgba(5,150,105,0.42); box-shadow: 0 16px 36px rgba(5,150,105,0.14); }
  .def-cockpit-metric-card.def-accent-amber { border-color: rgba(217,119,6,0.2); }
  .def-cockpit-metric-card.def-accent-amber:hover { border-color: rgba(217,119,6,0.42); box-shadow: 0 16px 36px rgba(217,119,6,0.14); }
  .def-cockpit-metric-card.def-accent-rose { border-color: rgba(220,38,38,0.2); }
  .def-cockpit-metric-card.def-accent-rose:hover { border-color: rgba(220,38,38,0.42); box-shadow: 0 16px 36px rgba(220,38,38,0.14); }
  .def-cockpit-metric-card.def-accent-indigo { border-color: rgba(99,102,241,0.2); }
  .def-cockpit-metric-card.def-accent-indigo:hover { border-color: rgba(99,102,241,0.42); box-shadow: var(--cockpit-shadow-lg); }
  .def-cockpit-metric-icon {
    flex: 0 0 auto;
    width: 24px;
    height: 24px;
    display: grid;
    place-items: center;
    border-radius: 7px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.14);
    font-size: 0.72rem;
    line-height: 1;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.65);
    transition: background 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
  }
  .def-cockpit-metric-card.metric-count .def-cockpit-metric-icon.metric-icon-tr {
    width: 30px;
    height: 30px;
    border-radius: 10px;
    background: linear-gradient(145deg, rgba(99,102,241,0.14) 0%, rgba(129,140,248,0.08) 100%);
    border-color: rgba(99,102,241,0.18);
    transition: background 0.32s ease, border-color 0.32s ease, box-shadow 0.32s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.metric-count:hover .def-cockpit-metric-icon.metric-icon-tr {
      background: rgba(99,102,241,0.2);
      border-color: rgba(99,102,241,0.32);
      box-shadow: 0 6px 16px rgba(99,102,241,0.18);
    }
    .def-cockpit-metric-card:hover .def-cockpit-metric-icon {
      background: rgba(99,102,241,0.16);
      border-color: rgba(99,102,241,0.26);
    }
  }
  .def-cockpit-metric-pill-wrap {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }
  .def-cockpit-metric-pill {
    flex: 0 0 auto;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    min-height: 20px;
    padding: 1px 7px;
    border-radius: 999px;
    font-size: 0.62rem;
    font-weight: var(--font-extrabold);
    line-height: 1.2;
    color: var(--metric-band-color);
    background: var(--metric-icon-bg);
    border: 1px solid var(--metric-icon-border);
    font-variant-numeric: tabular-nums;
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
    cursor: help;
  }
  .def-cockpit-metric-pill:focus-visible {
    outline: 2px solid rgba(99,102,241,0.45);
    outline-offset: 2px;
  }
  .def-cockpit-metric-pill-tip {
    position: absolute;
    right: 50%;
    bottom: calc(100% + 8px);
    width: max-content;
    max-width: 210px;
    padding: 8px 11px;
    border-radius: 9px;
    background: #0f172a;
    color: #f8fafc;
    font-size: 0.58rem;
    font-weight: 600;
    line-height: 1.4;
    text-align: left;
    letter-spacing: 0.01em;
    box-shadow: 0 10px 24px rgba(15,23,42,0.24);
    opacity: 0;
    visibility: hidden;
    transform: translate(50%, 4px);
    transition: opacity 0.18s ease, transform 0.18s ease, visibility 0.18s;
    pointer-events: none;
    z-index: 8;
  }
  .def-cockpit-metric-pill-tip::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 100%;
    transform: translateX(-50%);
    border: 5px solid transparent;
    border-top-color: #0f172a;
  }
  .def-cockpit-metric-pill-wrap:hover .def-cockpit-metric-pill-tip,
  .def-cockpit-metric-pill-wrap:focus-within .def-cockpit-metric-pill-tip {
    opacity: 1;
    visibility: visible;
    transform: translate(50%, 0);
  }
  .def-cockpit-metric-card.metric-status .def-cockpit-metric-body {
    flex: 1;
  }
  .def-cockpit-metric-card.metric-status .def-cockpit-metric-value {
    font-size: clamp(1rem, 1.45vw, 1.18rem);
    letter-spacing: -0.02em;
  }
  .def-cockpit-metric-card.metric-status .def-cockpit-metric-spark {
    margin-top: auto;
    opacity: 0.95;
    mask-image: linear-gradient(90deg, transparent, #000 6%, #000 94%, transparent);
  }
  .def-cockpit-metric-health-track {
    width: 100%;
    height: 5px;
    border-radius: 999px;
    background: rgba(148,163,184,0.22);
    overflow: hidden;
  }
  .def-cockpit-metric-health-fill {
    display: block;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--metric-band-color) 0%, rgba(255,255,255,0.35) 140%);
    box-shadow: 0 0 10px color-mix(in srgb, var(--metric-band-color) 40%, transparent);
    transition: width 0.8s var(--cockpit-ease), box-shadow 0.35s ease;
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.metric-health:hover .def-cockpit-metric-health-fill {
      box-shadow: 0 0 14px color-mix(in srgb, var(--metric-band-color) 55%, transparent);
    }
  }
  .def-cockpit-metric-card.metric-health {
    background: var(--metric-band-bg);
    border-color: var(--metric-band-border);
  }
  .def-cockpit-metric-card.metric-health .def-cockpit-metric-label {
    color: var(--metric-band-label);
  }
  .def-cockpit-metric-card.metric-health .def-cockpit-metric-value {
    color: var(--metric-band-color);
  }
  .def-cockpit-metric-card.metric-health .def-cockpit-metric-icon {
    background: var(--metric-icon-bg);
    border-color: var(--metric-icon-border);
    color: var(--metric-band-color);
  }
  .def-cockpit-metric-value.tone-emerald { color: #059669; }
  .def-cockpit-metric-value.tone-amber { color: #d97706; }
  .def-cockpit-metric-value.tone-rose { color: #dc2626; }
  .def-cockpit-metric-value.tone-blue { color: #2563eb; }
  .def-cockpit-metric-card.status-on-track,
  .def-cockpit-metric-card.status-at-risk,
  .def-cockpit-metric-card.status-off-track {
    background: var(--metric-band-bg);
    border-color: var(--metric-band-border);
    padding-top: 10px;
  }
  .def-cockpit-metric-card.status-on-track .def-cockpit-metric-label,
  .def-cockpit-metric-card.status-at-risk .def-cockpit-metric-label,
  .def-cockpit-metric-card.status-off-track .def-cockpit-metric-label {
    color: var(--metric-band-label);
    font-weight: var(--font-extrabold);
  }
  .def-cockpit-metric-card.status-on-track .def-cockpit-metric-value,
  .def-cockpit-metric-card.status-at-risk .def-cockpit-metric-value,
  .def-cockpit-metric-card.status-off-track .def-cockpit-metric-value {
    color: var(--metric-band-color);
    font-size: clamp(1rem, 1.45vw, 1.18rem);
  }
  .def-cockpit-metric-card.status-on-track .def-cockpit-metric-icon,
  .def-cockpit-metric-card.status-at-risk .def-cockpit-metric-icon,
  .def-cockpit-metric-card.status-off-track .def-cockpit-metric-icon {
    background: var(--metric-icon-bg);
    border: 1px solid var(--metric-icon-border);
    color: var(--metric-band-color);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.55);
  }
  @media (hover: hover) and (pointer: fine) {
    .def-cockpit-metric-card.status-on-track:hover {
      border-color: rgba(5,150,105,0.42);
      box-shadow: 0 16px 36px rgba(5,150,105,0.14);
    }
    .def-cockpit-metric-card.status-at-risk:hover {
      border-color: rgba(217,119,6,0.42);
      box-shadow: 0 16px 36px rgba(217,119,6,0.14);
    }
    .def-cockpit-metric-card.status-off-track:hover {
      border-color: rgba(220,38,38,0.42);
      box-shadow: 0 16px 36px rgba(239,68,68,0.14);
    }
  }
  .def-app.def-theme-dark .def-cockpit-metric-pill-tip {
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }
  .def-app.def-theme-dark .def-cockpit-metric-pill-tip::after {
    border-top-color: #1e293b;
  }
  .def-app.def-theme-dark .def-cockpit-metric-card.status-on-track,
  .def-app.def-theme-dark .def-cockpit-metric-card.metric-health.status-on-track {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(34,197,94,0.08) 100%);
  }
  .def-app.def-theme-dark .def-cockpit-metric-card.status-at-risk,
  .def-app.def-theme-dark .def-cockpit-metric-card.metric-health.status-at-risk {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(245,158,11,0.08) 100%);
  }
  .def-app.def-theme-dark .def-cockpit-metric-card.status-off-track,
  .def-app.def-theme-dark .def-cockpit-metric-card.metric-health.status-off-track {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(239,68,68,0.08) 100%);
  }
  .def-cockpit-metric-denom {
    font-size: 0.58em;
    font-weight: var(--font-bold);
    color: var(--def-muted);
    margin-left: 1px;
    opacity: 0.85;
  }
  .def-cockpit-metric-sub.trend-up {
    color: #059669;
    font-weight: var(--font-semibold);
  }
  .def-cockpit-metric-sub.trend-down {
    color: #dc2626;
    font-weight: var(--font-semibold);
  }
  .def-cockpit-metric-card.metric-health .def-cockpit-metric-sub.trend-up,
  .def-cockpit-metric-card.metric-health .def-cockpit-metric-sub.trend-down {
    color: var(--metric-band-sub);
  }
  .def-cockpit-metric-label {
    flex: 1;
    min-width: 0;
    font-size: clamp(0.5rem, 0.85vw, 0.58rem);
    font-weight: var(--font-extrabold);
    color: var(--def-muted);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-cockpit-metric-card.metric-count .def-cockpit-metric-label {
    color: #64748b;
  }
  .def-cockpit-metric-value {
    display: block;
    font-size: clamp(1.05rem, 1.35vw, 1.22rem);
    font-weight: var(--font-extrabold);
    color: var(--def-heading);
    line-height: var(--leading-tight);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
    transform-origin: left center;
    transition: transform 0.35s var(--cockpit-ease-spring), color 0.28s ease;
  }
  .def-cockpit-metric-card.metric-count .def-cockpit-metric-value {
    font-size: clamp(1.15rem, 1.5vw, 1.35rem);
  }
  .def-cockpit-metric-sub {
    display: block;
    font-size: 0.62rem;
    color: var(--def-subtle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-cockpit-metric-card.metric-count .def-cockpit-metric-sub {
    color: #94a3b8;
    font-weight: var(--font-semibold);
    letter-spacing: 0.02em;
  }
  .def-cockpit-metric-spark {
    width: 100%;
    height: 24px;
    margin-top: auto;
    opacity: 0.92;
    transition: opacity 0.32s ease, transform 0.38s var(--cockpit-ease-spring);
  }
  .def-cockpit-metric-spark-tip {
    padding: 4px 8px;
    border-radius: 6px;
    background: #0f172a;
    color: #f8fafc;
    font-size: 0.62rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    line-height: 1;
    box-shadow: 0 6px 16px rgba(15,23,42,0.18);
  }
  .def-cockpit-metric-spark-tip strong {
    font-weight: 800;
  }
  .def-cockpit-section {
    background: #fff; border: 1px solid rgba(226,232,240,0.95); border-radius: 12px;
    padding: var(--cockpit-pad) var(--space-3); box-shadow: var(--def-shadow-sm);
    transition: box-shadow 0.22s ease, border-color 0.22s ease;
  }
  .def-cockpit-section:hover {
    box-shadow: var(--def-shadow);
    border-color: rgba(99,102,241,0.18);
  }
  .def-cockpit-section-title {
    margin: 0 0 12px; font-size: var(--text-md); font-weight: var(--font-extrabold); color: var(--def-heading);
    letter-spacing: var(--tracking-tight); line-height: var(--leading-snug);
  }
  .def-cockpit-block {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    min-width: 0;
  }
  .def-cockpit-block-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-2);
    min-width: 0;
  }
  .def-cockpit-block-head .def-cockpit-section-title {
    margin: 0;
  }
  .def-cockpit-collapsible.is-collapsed {
    padding-bottom: var(--space-2);
  }
  .def-cockpit-collapse-trigger {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 0;
    border: none;
    background: transparent;
    color: inherit;
    cursor: pointer;
    text-align: left;
    font: inherit;
    transition: opacity 0.18s ease;
  }
  .def-cockpit-collapse-trigger:hover .def-cockpit-collapse-title {
    color: #4f46e5;
  }
  .def-cockpit-collapse-trigger:focus-visible {
    outline: 2px solid rgba(99,102,241,0.45);
    outline-offset: 3px;
    border-radius: 8px;
  }
  .def-cockpit-collapse-trigger-main {
    flex: 1;
    min-width: 0;
  }
  .def-cockpit-collapse-title {
    margin: 0;
    transition: color 0.18s ease;
  }
  .def-cockpit-collapse-desc {
    margin: 4px 0 0;
    font-size: 0.68rem;
    color: var(--def-muted);
    font-weight: 600;
    line-height: 1.4;
  }
  .def-cockpit-collapse-badge {
    flex: 0 0 auto;
    font-size: 0.64rem;
    font-weight: 800;
    color: #6366f1;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.16);
    border-radius: 999px;
    padding: 4px 10px;
    white-space: nowrap;
  }
  .def-cockpit-collapse-chevron {
    flex: 0 0 auto;
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 8px;
    border: 1px solid rgba(226,232,240,0.95);
    background: rgba(248,250,252,0.95);
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
    line-height: 1;
    transition: transform 0.22s ease, background 0.22s ease, border-color 0.22s ease, color 0.22s ease;
  }
  .def-cockpit-collapsible.is-open .def-cockpit-collapse-chevron {
    background: rgba(99,102,241,0.1);
    border-color: rgba(99,102,241,0.22);
    color: #4f46e5;
  }
  .def-cockpit-collapse-body {
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(226,232,240,0.85);
    animation: defFadeUp 0.24s ease both;
  }
  .def-cockpit-collapsible .def-tracker-legend {
    margin-bottom: 10px;
  }
  .def-cockpit-section-head-row {
    display: flex; align-items: baseline; justify-content: space-between; gap: 6px; margin-bottom: 5px;
  }
  .def-cockpit-section-meta { font-size: 0.68rem; color: var(--def-muted); font-weight: 600; white-space: nowrap; }

  .sr-only {
    position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px;
    overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;
  }

  .def-owner-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    max-width: 100%;
    padding: 4px 9px 4px 7px;
    border-radius: 999px;
    font-size: 0.66rem;
    font-weight: 700;
    line-height: 1.25;
    border: 1px solid transparent;
    background: rgba(148,163,184,0.12);
    color: #334155;
  }
  .def-owner-badge-dot {
    flex: 0 0 auto;
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    opacity: 0.85;
  }
  .def-owner-badge-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-owner-badge.tone-indigo { background: rgba(99,102,241,0.1); border-color: rgba(99,102,241,0.18); color: #4338ca; }
  .def-owner-badge.tone-violet { background: rgba(139,92,246,0.1); border-color: rgba(139,92,246,0.18); color: #6d28d9; }
  .def-owner-badge.tone-blue { background: rgba(37,99,235,0.1); border-color: rgba(37,99,235,0.18); color: #1d4ed8; }
  .def-owner-badge.tone-amber { background: rgba(245,158,11,0.12); border-color: rgba(245,158,11,0.2); color: #b45309; }
  .def-owner-badge.tone-rose { background: rgba(244,63,94,0.1); border-color: rgba(244,63,94,0.18); color: #be123c; }
  .def-owner-badge.tone-teal { background: rgba(20,184,166,0.1); border-color: rgba(20,184,166,0.18); color: #0f766e; }
  .def-owner-badge.tone-cyan { background: rgba(6,182,212,0.1); border-color: rgba(6,182,212,0.18); color: #0e7490; }
  .def-owner-badge.tone-slate { background: rgba(100,116,139,0.1); border-color: rgba(100,116,139,0.18); color: #475569; }
  .def-owner-empty { color: #cbd5e1; font-weight: 700; }
  .def-team-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    max-width: 100%;
    padding: 4px 8px;
    border-radius: 8px;
    font-size: 0.66rem;
    font-weight: 600;
    color: #475569;
    background: rgba(241,245,249,0.95);
    border: 1px solid rgba(226,232,240,0.95);
  }
  .def-team-badge-icon { font-size: 0.62rem; opacity: 0.75; }
  .def-team-badge-text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .def-tracker-owner,
  .def-tracker-team { min-width: 108px; }

  .def-cockpit-tracker { padding: var(--space-3) var(--space-3) var(--space-2); }
  .def-tracker-legend {
    display: flex; flex-wrap: wrap; gap: 10px 14px; align-items: center;
  }
  .def-tracker-legend-item {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 0.62rem; font-weight: 700; color: var(--def-muted); white-space: nowrap;
  }
  .def-tracker-legend-item i {
    width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; font-style: normal;
  }
  .def-tracker-legend-item.adp i { background: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,0.2); }
  .def-tracker-legend-item.sample i { background: #94a3b8; box-shadow: 0 0 0 2px rgba(148,163,184,0.25); }
  .def-tracker-toolbar {
    display: flex; align-items: center; justify-content: space-between; gap: var(--space-2);
    margin-bottom: var(--space-2); flex-wrap: wrap;
  }
  .def-tracker-search { flex: 1 1 180px; max-width: 280px; }
  .def-tracker-search input {
    width: 100%; padding: 6px 10px; border: 1px solid rgba(226,232,240,0.95);
    border-radius: 8px; font-size: 0.72rem; background: #fff; color: var(--def-text);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .def-tracker-search input:focus {
    outline: none; border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
  }
  .def-tracker-count { font-size: 0.64rem; font-weight: 700; color: var(--def-muted); white-space: nowrap; }
  .def-tracker-table-scroll { overflow-x: auto; }
  .def-tracker-table {
    width: 100%; min-width: 880px; border-collapse: collapse; font-size: var(--text-xs);
  }
  .def-tracker-table thead th {
    background: linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 100%);
    color: #fff; font-weight: var(--font-bold); text-align: left; padding: 8px 10px;
    border: 1px solid rgba(255,255,255,0.08); white-space: nowrap;
    font-size: var(--text-xs); letter-spacing: var(--tracking-wide);
  }
  .def-tracker-table tbody td {
    padding: 6px 10px; border: 1px solid rgba(226,232,240,0.95);
    vertical-align: middle; line-height: var(--leading-snug); background: #fff;
    font-size: var(--text-xs);
  }
  .def-tracker-table .def-scorecard-status { font-size: var(--text-2xs); gap: 5px; }
  .def-tracker-table .def-scorecard-dot { width: 8px; height: 8px; }
  .def-tracker-table tbody tr:nth-child(even) td { background: #f8fafc; }
  .def-tracker-row-click { cursor: pointer; transition: background 0.18s ease; }
  .def-tracker-row-click:hover td { background: rgba(99,102,241,0.06) !important; }
  .def-tracker-row-click:focus-visible { outline: 2px solid #6366f1; outline-offset: -2px; }
  .def-tracker-imperative {
    font-weight: 800; color: var(--def-heading); vertical-align: top;
    background: #f1f5f9 !important; min-width: 72px; text-transform: capitalize;
  }
  .def-tracker-initiative {
    font-weight: 700; color: var(--def-heading); vertical-align: top;
    min-width: 120px; max-width: 160px; line-height: 1.3;
  }
  .def-tracker-sub { min-width: 140px; }
  .def-tracker-sub strong { display: block; font-weight: 700; color: var(--def-heading); }
  .def-tracker-tag {
    display: inline-block; margin-top: 2px; padding: 1px 5px; border-radius: 4px;
    font-size: 0.56rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.04em;
  }
  .def-tracker-tag.sample { background: rgba(148,163,184,0.18); color: #64748b; }
  .def-tracker-metric { display: flex; flex-direction: column; gap: 4px; min-width: 108px; }
  .def-tracker-metric span { font-weight: 600; color: var(--def-text); white-space: nowrap; }
  .def-tracker-metric .def-progress-track { height: 6px; border-radius: 999px; }
  .def-tracker-spark { width: 72px; min-width: 64px; height: 36px; }
  .def-tracker-risk-cell { text-align: center; width: 44px; }
  .def-tracker-risk {
    display: inline-block; width: 14px; height: 14px; border-radius: 50%;
    box-shadow: inset 0 0 0 1px rgba(15,23,42,0.08);
  }
  .def-tracker-risk-low { background: #22c55e; }
  .def-tracker-risk-medium { background: #f59e0b; }
  .def-tracker-risk-high { background: #ef4444; }

  .def-cockpit-fast-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--cockpit-gap);
    align-items: stretch;
    min-width: 0;
  }
  .def-cockpit-fast-health {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: clamp(8px, 1vw, 12px);
    padding: clamp(10px, 1.1vw, 14px) clamp(12px, 1.3vw, 16px) clamp(10px, 1vw, 12px);
    height: 100%;
    min-height: var(--cockpit-fast-min-h);
    background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 14px;
    cursor: pointer;
    text-align: left;
    min-width: 0;
    font: inherit;
    color: inherit;
  }
  .def-cockpit-fast-health .def-cockpit-metric-stripe {
    display: none;
  }
  .def-cockpit-fast-head {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(226,232,240,0.92);
    overflow: visible;
    position: relative;
    z-index: 1;
  }
  .def-cockpit-fast-icon {
    width: 34px;
    height: 34px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 9px;
    background: rgba(99,102,241,0.1);
    color: #6366f1;
    font-size: 0.95rem;
    transition: background 0.32s ease, box-shadow 0.32s ease;
  }
  .def-cockpit-fast-chart {
    position: relative;
    width: var(--cockpit-fast-chart);
    height: var(--cockpit-fast-chart);
    flex-shrink: 0;
    transition: transform 0.42s var(--cockpit-ease-spring);
  }
  .def-cockpit-fast-titles { min-width: 0; flex: 1; }
  .def-cockpit-fast-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 4px;
  }
  .def-cockpit-fast-kicker {
    margin: 0; font-size: 0.62rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: #6366f1;
  }
  .def-cockpit-fast-health-score {
    flex-shrink: 0;
    font-size: 0.68rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    cursor: help;
  }
  .def-cockpit-fast-health-score-wrap {
    position: relative;
    display: inline-flex;
    flex-shrink: 0;
  }
  .def-cockpit-overlay-tip {
    width: max-content;
    max-width: 210px;
    padding: 8px 11px;
    border-radius: 9px;
    background: #0f172a;
    color: #f8fafc;
    font-size: 0.58rem;
    font-weight: 600;
    line-height: 1.4;
    text-align: left;
    letter-spacing: 0.01em;
    box-shadow: 0 10px 24px rgba(15,23,42,0.24);
    pointer-events: none;
  }
  .def-cockpit-overlay-tip.placement-top::after {
    content: '';
    position: absolute;
    left: var(--tip-arrow-left, 10px);
    top: 100%;
    border: 5px solid transparent;
    border-top-color: #0f172a;
  }
  .def-cockpit-overlay-tip.placement-bottom::after {
    content: '';
    position: absolute;
    left: var(--tip-arrow-left, 10px);
    bottom: 100%;
    border: 5px solid transparent;
    border-bottom-color: #0f172a;
  }
  .def-app.def-theme-dark .def-cockpit-overlay-tip {
    background: #1e293b;
    color: #f1f5f9;
    border: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 10px 24px rgba(0,0,0,0.35);
  }
  .def-app.def-theme-dark .def-cockpit-overlay-tip.placement-top::after {
    border-top-color: #1e293b;
  }
  .def-app.def-theme-dark .def-cockpit-overlay-tip.placement-bottom::after {
    border-bottom-color: #1e293b;
  }
  .def-cockpit-fast-health h3 {
    margin: 0;
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--def-muted);
    line-height: 1.35;
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }
  .def-cockpit-fast-body {
    display: grid;
    grid-template-columns: var(--cockpit-fast-chart) minmax(0, 1fr);
    align-items: center;
    gap: clamp(8px, 1.1vw, 16px);
    flex: 1;
    min-width: 0;
    padding: 2px 0;
  }
  .def-cockpit-fast-donut-center {
    position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center;
    pointer-events: none; text-align: center;
  }
  .def-cockpit-fast-donut-center strong { font-size: clamp(0.95rem, 2.2vw, 1.05rem); font-weight: 800; color: var(--def-heading); line-height: 1; }
  .def-cockpit-fast-donut-center span {
    font-size: 0.52rem; font-weight: 700; color: var(--def-muted); text-transform: uppercase;
    max-width: 62px; line-height: 1.15; margin-top: 3px;
  }
  .def-cockpit-fast-legend {
    list-style: none;
    margin: 0;
    padding: 0;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 5px;
  }
  .def-cockpit-fast-legend li {
    display: grid;
    grid-template-columns: auto 1fr auto;
    align-items: center;
    gap: 6px;
    padding: 5px 7px;
    border-radius: 7px;
    background: rgba(248,250,252,0.95);
    border: 1px solid rgba(226,232,240,0.85);
    font-size: 0.62rem;
    color: var(--def-muted);
    font-weight: 600;
  }
  .def-cockpit-fast-legend li span {
    min-width: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .def-cockpit-fast-legend li i { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; font-style: normal; }
  .def-cockpit-fast-legend li strong {
    font-size: 0.72rem;
    color: var(--def-heading);
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    text-align: right;
  }
  .def-cockpit-fast-trend { font-weight: 800; padding: 1px 6px; border-radius: 999px; font-size: 0.58rem; flex-shrink: 0; }
  .def-cockpit-fast-trend.up { background: rgba(34,197,94,0.12); color: #15803d; }
  .def-cockpit-fast-trend.down { background: rgba(239,68,68,0.12); color: #b91c1c; }
  .def-cockpit-workspace {
    display: grid;
    gap: var(--cockpit-gap);
    align-items: stretch;
    min-width: 0;
  }
  .def-cockpit-workspace-analytics {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
  .def-cockpit-workspace-analytics > * {
    min-height: var(--cockpit-panel-min-h, 0px);
    height: 100%;
  }
  .def-cockpit-bottom-row {
    display: grid;
    grid-template-columns: minmax(0, 1.15fr) minmax(0, 1fr) minmax(280px, 0.88fr);
    gap: var(--cockpit-gap);
    align-items: stretch;
    min-width: 0;
    width: 100%;
  }
  .def-cockpit-bottom-row > * {
    min-height: var(--cockpit-bottom-min-h, 0px);
    min-width: 0;
    height: 100%;
  }
  .def-cockpit-panel {
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: inherit;
  }
  .def-cockpit-bottom-card {
    min-height: 0;
    min-width: 0;
  }
  .def-cockpit-panel-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 10px;
    min-width: 0;
  }
  .def-cockpit-panel-head .def-cockpit-card-title {
    margin: 0;
    flex: 1;
    min-width: 0;
    line-height: 1.25;
  }
  .def-cockpit-panel-head .def-cockpit-view-all {
    flex-shrink: 0;
    align-self: center;
    margin: 0;
  }
  .def-cockpit-view-all {
    border: none;
    background: transparent;
    color: #2563eb;
    font-size: 0.625rem;
    font-weight: 600;
    cursor: pointer;
    padding: 0;
    white-space: nowrap;
    letter-spacing: 0.01em;
    transition: color 0.22s ease, transform 0.28s var(--cockpit-ease);
  }
  .def-cockpit-quarter-trends {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid rgba(226,232,240,0.9);
    font-size: 0.68rem;
    font-weight: var(--font-bold);
  }
  .def-cockpit-quarter-trends .up { color: #15803d; }
  .def-cockpit-quarter-trends .down { color: #b91c1c; }
  .def-cockpit-trend-good {
    color: #15803d;
    font-weight: var(--font-extrabold);
    white-space: nowrap;
  }
  .def-cockpit-exec-risk-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  .def-cockpit-exec-risk-item {
    display: grid;
    grid-template-columns: 42px minmax(0, 1fr);
    gap: 10px;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid rgba(226,232,240,0.85);
    transition:
      transform 0.32s var(--cockpit-ease-spring),
      background 0.28s ease,
      padding 0.28s ease,
      border-radius 0.28s ease;
  }
  .def-cockpit-exec-risk-item:last-child { border-bottom: none; padding-bottom: 0; }
  .def-cockpit-exec-risk-score {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    font-size: 0.82rem;
    font-weight: var(--font-extrabold);
    line-height: 1;
    border: 2px solid transparent;
    transition: transform 0.32s var(--cockpit-ease-spring), box-shadow 0.32s ease;
  }
  .def-cockpit-exec-risk-item.tone-high .def-cockpit-exec-risk-score {
    color: #b91c1c;
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.28);
  }
  .def-cockpit-exec-risk-item.tone-medium .def-cockpit-exec-risk-score {
    color: #b45309;
    background: rgba(245,158,11,0.14);
    border-color: rgba(245,158,11,0.28);
  }
  .def-cockpit-exec-risk-item.tone-low .def-cockpit-exec-risk-score {
    color: #a16207;
    background: rgba(251,191,36,0.14);
    border-color: rgba(251,191,36,0.28);
  }
  .def-cockpit-exec-risk-copy strong {
    display: block;
    font-size: 0.78rem;
    line-height: 1.35;
    color: var(--def-heading);
  }
  .def-cockpit-exec-risk-copy small {
    display: block;
    margin-top: 2px;
    font-size: 0.68rem;
    color: var(--def-muted);
  }
  .def-cockpit-owner-cell {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-width: 0;
  }
  .def-cockpit-owner-cell .def-avatar {
    width: 28px;
    height: 28px;
    font-size: 0.58rem;
    flex-shrink: 0;
  }
  .def-cockpit-owner-cell strong {
    font-size: 0.72rem;
    font-weight: var(--font-bold);
  }
  .def-cockpit-health-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    padding: 3px 8px;
    border-radius: 999px;
    border: 1px solid;
    font-size: 0.72rem;
    font-weight: var(--font-extrabold);
    font-variant-numeric: tabular-nums;
  }
  .def-cockpit-status-pill {
    display: inline-flex;
    align-items: center;
    padding: 3px 8px;
    border-radius: 999px;
    font-size: 0.66rem;
    font-weight: var(--font-extrabold);
    white-space: nowrap;
  }
  .def-cockpit-status-pill.status-on-track {
    color: #059669;
    background: rgba(34,197,94,0.12);
    border: 1px solid rgba(34,197,94,0.22);
  }
  .def-cockpit-status-pill.status-at-risk {
    color: #d97706;
    background: rgba(245,158,11,0.12);
    border: 1px solid rgba(245,158,11,0.22);
  }
  .def-cockpit-status-pill.status-off-track {
    color: #dc2626;
    background: rgba(239,68,68,0.12);
    border: 1px solid rgba(239,68,68,0.22);
  }
  .def-cockpit-row-click { cursor: pointer; }
  .def-cockpit-row-click:hover { background: rgba(99,102,241,0.05); }
  .def-cockpit-table-ownership { min-width: 520px; width: 100%; }
  .def-cockpit-table-milestones { min-width: 440px; width: 100%; }
  .def-cockpit-table-ownership,
  .def-cockpit-table-milestones {
    font-size: var(--text-xs);
  }
  .def-cockpit-table-ownership thead th,
  .def-cockpit-table-milestones thead th {
    padding: 7px 10px;
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #64748b;
    background: rgba(248,250,252,0.98);
    border-bottom: 1px solid rgba(226,232,240,0.95);
    white-space: nowrap;
  }
  .def-cockpit-table-ownership tbody td,
  .def-cockpit-table-milestones tbody td {
    padding: 8px 10px;
    font-size: var(--text-xs);
    line-height: 1.35;
    color: var(--def-text);
    vertical-align: middle;
  }
  .def-cockpit-table-ownership tbody tr:last-child td,
  .def-cockpit-table-milestones tbody tr:last-child td {
    border-bottom: none;
  }
  .def-cockpit-table-ownership tbody tr:nth-child(even) td,
  .def-cockpit-table-milestones tbody tr:nth-child(even) td {
    background: rgba(248,250,252,0.55);
  }
  .def-cockpit-table-ownership td:nth-child(2),
  .def-cockpit-table-ownership td:nth-child(3),
  .def-cockpit-table-ownership td:nth-child(4),
  .def-cockpit-table-ownership td:nth-child(5),
  .def-cockpit-table-ownership td:nth-child(6),
  .def-cockpit-table-ownership th:nth-child(2),
  .def-cockpit-table-ownership th:nth-child(3),
  .def-cockpit-table-ownership th:nth-child(4),
  .def-cockpit-table-ownership th:nth-child(5),
  .def-cockpit-table-ownership th:nth-child(6) {
    text-align: center;
  }
  .def-cockpit-table-ownership .def-modal-band-cell,
  .def-cockpit-table-ownership .def-modal-count-chip,
  .def-cockpit-table-ownership .def-cockpit-health-pill {
    margin-inline: auto;
  }
  .def-cockpit-table-ownership .def-modal-band-cell {
    padding: 3px 7px;
    gap: 4px;
    white-space: nowrap;
  }
  .def-cockpit-table-ownership .def-modal-band-cell strong {
    font-size: var(--text-xs);
  }
  .def-cockpit-table-ownership .def-modal-band-pct {
    font-size: 0.625rem;
  }
  .def-cockpit-table-ownership .def-modal-count-chip {
    min-width: 26px;
    padding: 2px 7px;
    font-size: 0.625rem;
  }
  .def-cockpit-table-ownership .def-cockpit-health-pill {
    min-width: 32px;
    padding: 3px 8px;
    font-size: 0.6875rem;
  }
  .def-cockpit-table-ownership .def-cockpit-owner-cell strong {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--def-heading);
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 120px;
  }
  .def-cockpit-table-ownership .def-cockpit-owner-cell .def-avatar {
    width: 26px;
    height: 26px;
    font-size: 0.54rem;
  }
  .def-cockpit-table-milestones td:nth-child(3),
  .def-cockpit-table-milestones td:nth-child(4),
  .def-cockpit-table-milestones td:nth-child(5),
  .def-cockpit-table-milestones th:nth-child(3),
  .def-cockpit-table-milestones th:nth-child(4),
  .def-cockpit-table-milestones th:nth-child(5) {
    text-align: center;
    white-space: nowrap;
  }
  .def-cockpit-initiative-name {
    display: block;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--def-heading);
    line-height: 1.35;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }
  .def-cockpit-due-date {
    font-size: var(--text-xs);
    font-weight: 500;
    font-variant-numeric: tabular-nums;
    color: var(--def-muted);
  }
  .def-cockpit-table-milestones .def-modal-imperative-chip {
    font-size: 0.625rem;
    padding: 2px 7px;
  }
  .def-cockpit-table-milestones .def-modal-days-chip {
    min-width: 28px;
    padding: 2px 8px;
    font-size: 0.625rem;
    font-weight: 700;
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
  }
  .def-cockpit-table-milestones .def-cockpit-status-pill {
    font-size: 0.625rem;
    padding: 3px 8px;
    font-weight: 700;
  }
  .def-cockpit-table-milestones thead th,
  .def-cockpit-table-milestones tbody td {
    white-space: nowrap;
  }
  .def-cockpit-table-milestones thead th:first-child,
  .def-cockpit-table-milestones tbody td:first-child {
    white-space: nowrap;
    max-width: 180px;
  }
  .def-cockpit-table-ownership thead th {
    white-space: nowrap;
  }
  .def-cockpit-table-ownership thead th:first-child,
  .def-cockpit-table-ownership tbody td:first-child {
    white-space: normal;
  }
  .def-cockpit-table-ownership th:last-child,
  .def-cockpit-table-ownership td:last-child,
  .def-cockpit-table-milestones th:last-child,
  .def-cockpit-table-milestones td:last-child {
    padding-right: 12px;
  }
  .def-cockpit-days-left {
    font-weight: var(--font-extrabold);
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
    white-space: nowrap;
  }
  .def-cockpit-table-recovery-time { min-width: min(420px, 100%); }
  .def-cockpit-bottom-rail {
    display: grid;
    grid-template-rows: auto auto auto;
    gap: var(--cockpit-gap);
    min-width: 0;
    height: 100%;
    min-height: inherit;
  }
  .def-cockpit-rail-card {
    background: linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.94) 100%);
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .def-cockpit-rail-card.def-cockpit-interactive {
    --cockpit-hover-lift: -2px;
    --cockpit-hover-scale: 1.003;
  }
  .def-cockpit-rail-card.def-cockpit-interactive::after {
    display: none;
  }
  .def-cockpit-rail-card > .def-cockpit-card-title {
    margin: 0 0 10px;
  }
  .def-app.def-theme-dark .def-cockpit-rail-card {
    background: linear-gradient(180deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.92) 100%);
  }
  .def-cockpit-highlight-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .def-cockpit-highlight-panel .def-cockpit-highlight-list {
    flex: 1;
    justify-content: flex-start;
  }
  .def-cockpit-lq-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    min-width: 0;
  }
  .def-cockpit-lq-head .def-cockpit-card-title {
    margin: 0;
    flex: 1;
    min-width: 0;
  }
  .def-cockpit-lq-label {
    flex-shrink: 0;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(99,102,241,0.1);
    border: 1px solid rgba(99,102,241,0.18);
    color: #4338ca;
    font-size: 0.62rem;
    font-weight: 800;
    letter-spacing: 0.03em;
    text-transform: uppercase;
    line-height: 1.2;
  }
  .def-cockpit-lq-meta {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(226,232,240,0.9);
  }
  .def-cockpit-lq-meta-item {
    min-width: 0;
    text-align: center;
  }
  .def-cockpit-lq-meta-item span {
    display: block;
    font-size: 0.58rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--def-muted);
    margin-bottom: 2px;
    line-height: 1.25;
  }
  .def-cockpit-lq-meta-item strong {
    display: block;
    font-size: 0.82rem;
    font-weight: 800;
    color: var(--def-heading);
    font-variant-numeric: tabular-nums;
    line-height: 1.2;
  }
  .def-cockpit-lq-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
    margin-top: 0;
  }
  .def-cockpit-lq-stat {
    padding: 10px 8px;
    border-radius: 10px;
    border: 1px solid rgba(226,232,240,0.95);
    background: rgba(255,255,255,0.88);
    text-align: center;
    transition:
      transform 0.28s var(--cockpit-ease-spring),
      box-shadow 0.28s ease,
      border-color 0.24s ease;
  }
  .def-cockpit-lq-stat.on-track {
    border-color: rgba(34,197,94,0.22);
    background: rgba(240,253,244,0.72);
  }
  .def-cockpit-lq-stat.at-risk {
    border-color: rgba(245,158,11,0.22);
    background: rgba(255,251,235,0.72);
  }
  .def-cockpit-lq-stat.off-track {
    border-color: rgba(239,68,68,0.2);
    background: rgba(254,242,242,0.72);
  }
  .def-cockpit-lq-stat span {
    display: block;
    font-size: 0.62rem;
    font-weight: var(--font-bold);
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: var(--def-muted);
    margin-bottom: 4px;
  }
  .def-cockpit-lq-stat strong {
    display: block;
    font-size: 1rem;
    font-weight: var(--font-extrabold);
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
  }
  .def-cockpit-lq-stat.on-track strong { color: #059669; }
  .def-cockpit-lq-stat.at-risk strong { color: #d97706; }
  .def-cockpit-lq-stat.off-track strong { color: #dc2626; }
  .def-cockpit-highlight-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 11px;
  }
  .def-cockpit-highlight-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    border: none;
    background: transparent;
    transition: transform 0.28s var(--cockpit-ease-spring), background 0.24s ease;
  }
  .def-cockpit-highlight-icon {
    width: 22px;
    height: 22px;
    display: grid;
    place-items: center;
    border-radius: 50%;
    flex-shrink: 0;
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
    line-height: 1;
    box-shadow: 0 1px 3px rgba(15,23,42,0.12);
    transition: transform 0.28s var(--cockpit-ease-spring);
  }
  .def-cockpit-highlight-item.tone-on-track .def-cockpit-highlight-icon {
    background: #22c55e;
  }
  .def-cockpit-highlight-item.tone-at-risk .def-cockpit-highlight-icon {
    background: #eab308;
    font-size: 0.72rem;
  }
  .def-cockpit-highlight-item.tone-complete .def-cockpit-highlight-icon {
    background: #3b82f6;
    font-size: 0.68rem;
  }
  .def-cockpit-highlight-item p {
    margin: 0;
    font-size: 0.78rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--def-heading);
  }
  .def-cockpit-top-risks-panel {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  .def-cockpit-top-risks-panel .def-cockpit-top-risks-scroll {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
  }
  .def-cockpit-top-risk-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }
  .def-cockpit-top-risk-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 0;
    min-width: 0;
    transition: transform 0.28s var(--cockpit-ease-spring);
  }
  .def-cockpit-top-risk-copy {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .def-cockpit-top-risk-copy strong {
    display: block;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.35;
    color: var(--def-heading);
  }
  .def-cockpit-top-risk-copy small {
    display: block;
    margin-top: 2px;
    font-size: 0.68rem;
    color: var(--def-muted);
    line-height: 1.35;
  }
  .def-cockpit-top-risk-empty {
    font-size: 0.72rem;
    color: var(--def-muted);
    padding: 8px 0;
  }
  .def-cockpit-risk-gauge {
    position: relative;
    width: 64px;
    height: 48px;
    flex: 0 0 64px;
  }
  .def-cockpit-risk-gauge-svg {
    display: block;
    width: 100%;
    height: auto;
  }
  .def-cockpit-risk-gauge-meta {
    position: absolute;
    left: 50%;
    bottom: 0;
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
    text-align: center;
    pointer-events: none;
  }
  .def-cockpit-risk-gauge-meta strong {
    font-size: 1rem;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--def-heading);
    transition: transform 0.28s var(--cockpit-ease-spring);
  }
  .def-cockpit-risk-gauge-meta span {
    font-size: 0.46rem;
    font-weight: 700;
    letter-spacing: 0.02em;
    text-transform: uppercase;
    color: var(--def-muted);
    white-space: nowrap;
  }
  .def-cockpit-risk-gauge.tone-high .def-cockpit-risk-gauge-meta strong { color: #dc2626; }
  .def-cockpit-risk-gauge.tone-medium .def-cockpit-risk-gauge-meta strong { color: #d97706; }
  .def-cockpit-risk-gauge.tone-low .def-cockpit-risk-gauge-meta strong { color: #ca8a04; }
  .def-modal-risk-score {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 34px;
    padding: 4px 10px;
    border-radius: 999px;
    font-size: var(--text-xs);
    font-weight: var(--font-extrabold);
    font-variant-numeric: tabular-nums;
    border: 1px solid transparent;
  }
  .def-modal-risk-score.tone-high {
    color: #dc2626;
    background: rgba(239,68,68,0.12);
    border-color: rgba(239,68,68,0.24);
  }
  .def-modal-risk-score.tone-medium {
    color: #d97706;
    background: rgba(245,158,11,0.14);
    border-color: rgba(245,158,11,0.24);
  }
  .def-modal-risk-score.tone-low {
    color: #ca8a04;
    background: rgba(234,179,8,0.14);
    border-color: rgba(234,179,8,0.24);
  }
  .def-drawer-pillar-table-risks {
    padding: 4px 12px 12px;
  }
  .def-drawer-pillar-table-risks .def-cockpit-top-risk-list {
    gap: 14px;
  }
  .def-drawer-pillar-table-risks .def-cockpit-top-risk-item {
    padding: 10px 0;
    border-bottom: 1px solid rgba(226,232,240,0.88);
  }
  .def-drawer-pillar-table-risks .def-cockpit-top-risk-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
  @media (max-width: 480px) {
    .def-cockpit-top-risk-item {
      grid-template-columns: 64px minmax(0, 1fr);
      gap: 8px;
    }
    .def-cockpit-risk-gauge {
      width: 64px;
      height: 46px;
    }
    .def-cockpit-risk-gauge-meta strong {
      font-size: 0.92rem;
    }
  }
  .def-cockpit-ws-charts {
    display: flex;
    flex-direction: column;
    gap: var(--cockpit-gap);
    min-width: 0;
    min-height: 0;
  }
  .def-cockpit-ws-charts > .def-cockpit-chart-card {
    flex: 0 0 auto;
  }
  .def-cockpit-ws-recovery {
    display: flex;
    flex-direction: column;
    min-width: 0;
    min-height: 0;
    max-height: var(--cockpit-ws-h, auto);
    overflow: hidden;
  }
  .def-cockpit-ws-recovery .def-cockpit-table-scroll-recovery {
    flex: 1 1 auto;
    min-height: 0;
    max-height: none;
    overflow: auto;
  }
  .def-cockpit-workspace > .def-cockpit-rail {
    align-self: start;
    max-height: var(--cockpit-ws-h, auto);
    overflow-y: auto;
    min-height: 0;
  }
  .def-cockpit-chart-card, .def-cockpit-table-card, .def-cockpit-rail-card {
    background: #fff;
    border: 1px solid rgba(226,232,240,0.95);
    border-radius: 12px;
    padding: var(--space-3);
    min-width: 0;
    min-height: 0;
    box-shadow: var(--cockpit-shadow-sm);
  }
  .def-cockpit-chart-card.def-cockpit-interactive,
  .def-cockpit-table-card.def-cockpit-interactive {
    --cockpit-hover-lift: -5px;
    --cockpit-hover-scale: 1.008;
  }
  .def-cockpit-card-title, .def-cockpit-chart-head .def-cockpit-card-title {
    margin: 0;
    font-size: 0.8125rem;
    font-weight: var(--font-extrabold);
    color: var(--def-heading);
    line-height: var(--leading-snug);
    letter-spacing: var(--tracking-tight);
  }
  .def-cockpit-chart-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 10px;
    min-width: 0;
    flex-shrink: 0;
  }
  .def-cockpit-chart-plot {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    flex: 0 0 var(--cockpit-panel-chart-h, 168px);
    height: var(--cockpit-panel-chart-h, 168px);
  }
  .def-cockpit-chart-plot .recharts-responsive-container {
    min-width: 0 !important;
    height: 100% !important;
  }
  .def-cockpit-panel .def-chart-legend-row,
  .def-cockpit-panel .def-cockpit-quarter-trends,
  .def-cockpit-panel .def-cockpit-movement-stats {
    flex-shrink: 0;
  }
  .def-cockpit-panel .def-cockpit-movement-stats {
    margin-top: auto;
  }
  .def-cockpit-top-risks .def-cockpit-exec-risk-list {
    flex: 1;
    justify-content: center;
  }
  .def-cockpit-ws-recovery .def-cockpit-table-scroll,
  .def-cockpit-bottom-card .def-cockpit-table-scroll.wide {
    flex: 1 1 auto;
    min-height: 140px;
    max-height: min(240px, 34vh);
    overflow: auto;
  }
  .def-cockpit-bottom-card .def-cockpit-table-scroll.wide.def-cockpit-table-preview {
    flex: 0 0 auto;
    min-height: 0;
    min-width: 0;
    max-height: none;
    overflow-x: auto;
    overflow-y: hidden;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    scrollbar-color: rgba(148,163,184,0.45) transparent;
  }
  .def-chart-legend-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 14px;
    margin-top: 8px;
    padding-top: 6px;
    border-top: 1px solid rgba(226,232,240,0.9);
  }
  .def-chart-legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: var(--text-xs);
    font-weight: var(--font-semibold);
    color: var(--def-muted);
    line-height: var(--leading-snug);
    white-space: nowrap;
    transition: color 0.22s ease, transform 0.28s var(--cockpit-ease);
  }
  .def-chart-legend-item i {
    width: 10px;
    height: 10px;
    border-radius: 3px;
    flex-shrink: 0;
    font-style: normal;
  }
  .def-cockpit-panel .def-cockpit-panel-body {
    flex: 1 1 auto;
    min-width: 0;
    min-height: 0;
  }
  .def-cockpit-movement-stats {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 6px;
    margin-top: auto;
  }
  .def-cockpit-move-stat {
    padding: 6px 8px;
    border-radius: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    transition:
      transform 0.32s var(--cockpit-ease-spring),
      background 0.28s ease,
      box-shadow 0.32s ease,
      border-color 0.28s ease;
  }
  .def-cockpit-move-stat span {
    display: block;
    font-size: 0.56rem;
    font-weight: 700;
    color: var(--def-muted);
    text-transform: uppercase;
    line-height: 1.25;
  }
  .def-cockpit-move-stat strong { display: block; margin-top: 1px; font-size: 0.95rem; font-weight: 800; }
  .def-cockpit-move-stat.improved strong { color: #15803d; }
  .def-cockpit-move-stat.deteriorated strong { color: #b91c1c; }
  .def-cockpit-move-stat.net.positive strong { color: #15803d; }
  .def-cockpit-move-stat.net.negative strong { color: #b91c1c; }
  .def-cockpit-table-scroll {
    overflow: auto;
    overflow-x: auto;
    max-height: 100%;
  }
  .def-cockpit-table-scroll-recovery {
    max-height: min(280px, calc(var(--cockpit-chart-h, 210px) + 76px));
  }
  .def-cockpit-ws-recovery .def-cockpit-table-scroll-recovery {
    max-height: none;
  }
  .def-cockpit-table-scroll.wide { max-height: min(280px, 42vh); }
  .def-cockpit-table { width: 100%; border-collapse: collapse; font-size: 0.7rem; }
  .def-cockpit-table-recovery { min-width: min(480px, 100%); }
  .def-cockpit-table-teams { min-width: min(640px, 100%); }
  .def-cockpit-table th, .def-cockpit-table td {
    padding: 4px 6px; border-bottom: 1px solid rgba(226,232,240,0.9); text-align: left; vertical-align: middle;
    transition: background 0.2s ease;
  }
  .def-cockpit-table th {
    font-size: 0.62rem; text-transform: uppercase; letter-spacing: 0.04em;
    color: var(--def-muted); font-weight: 700; background: #f8fafc; position: sticky; top: 0; z-index: 1;
  }
  .def-cockpit-table.zebra tbody tr:nth-child(even) { background: rgba(248,250,252,0.85); }
  .def-cockpit-empty { text-align: center; color: var(--def-muted); font-style: italic; padding: 8px !important; }
  .def-cockpit-rail { display: flex; flex-direction: column; gap: var(--cockpit-gap); min-width: 0; min-height: 0; }
  .def-cockpit-rail-label {
    margin: 0 0 6px; font-size: 0.6rem; font-weight: 800; text-transform: uppercase;
    letter-spacing: 0.06em; color: var(--def-muted);
  }
  .def-cockpit-rail-card.subtle { background: linear-gradient(180deg, #f8fafc 0%, #fff 100%); }
  .def-cockpit-bullets { margin: 0; padding-left: 14px; font-size: 0.68rem; color: var(--def-text); line-height: 1.4; }
  .def-cockpit-bullets.tight { font-size: 0.66rem; color: var(--def-muted); }
  .def-cockpit-bullets li { margin-bottom: 4px; }
  .def-cockpit-risk-list { list-style: none; margin: 0; padding: 0; }
  .def-cockpit-risk-item {
    padding: 8px 2px 10px;
    border-bottom: 1px solid rgba(226,232,240,0.9);
    border-radius: 6px;
    transition: background 0.22s ease;
  }
  .def-cockpit-risk-item:last-child { border-bottom: none; padding-bottom: 2px; }
  .def-cockpit-risk-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 3px;
    min-width: 0;
  }
  .def-cockpit-risk-title {
    flex: 1;
    min-width: 0;
    font-size: 0.68rem;
    font-weight: 700;
    color: var(--def-heading);
    line-height: 1.25;
    overflow: hidden;
    line-clamp: 2;
  }
  .def-cockpit-risk-pct {
    flex-shrink: 0;
    align-self: flex-start;
    font-size: 0.62rem;
    font-weight: 800;
    padding: 1px 6px;
    border-radius: 6px;
    line-height: 1.3;
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(226,232,240,0.95);
    white-space: nowrap;
  }
  .def-cockpit-risk-pct-on-track { border-color: rgba(34,197,94,0.35); background: rgba(34,197,94,0.08); }
  .def-cockpit-risk-pct-at-risk { border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.08); }
  .def-cockpit-risk-pct-off-track { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.08); }
  .def-cockpit-risk-level {
    display: block;
    font-size: 0.56rem;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 5px;
  }
  .def-cockpit-risk-level-on-track { color: #15803d; }
  .def-cockpit-risk-level-at-risk { color: #b45309; }
  .def-cockpit-risk-level-off-track { color: #b91c1c; }
  .def-cockpit-risk-track {
    height: 4px;
    border-radius: 999px;
    background: rgba(226,232,240,0.95);
    overflow: hidden;
  }
  .def-cockpit-risk-fill {
    height: 100%;
    border-radius: 999px;
    min-width: 2px;
    transition: width 0.35s ease;
  }
  .def-cockpit-risk-empty {
    padding: 8px 2px;
    font-size: 0.64rem;
    color: var(--def-muted);
    font-style: italic;
  }
  .def-cockpit-dl { margin: 0; display: flex; flex-direction: column; gap: 4px; }
  .def-cockpit-dl div { display: flex; justify-content: space-between; gap: 6px; font-size: 0.68rem; padding: 4px 0; }
  .def-cockpit-dl dt { color: var(--def-muted); font-weight: 600; }
  .def-cockpit-dl dd { margin: 0; font-weight: 800; color: var(--def-heading); }
  .def-cockpit-mini-actions { margin-top: 8px; }

  @media (max-width: 1536px) {
    :root { --def-sidebar-w: 296px; }
    .def-cockpit {
      --cockpit-fast-min-h: 188px;
    }
    .def-cockpit-bottom-row {
      grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr) minmax(240px, 0.85fr);
    }
  }
  @media (max-width: 1400px) {
    .def-cockpit-workspace-analytics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .def-cockpit-bottom-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .def-cockpit-bottom-row > .def-cockpit-bottom-rail {
      grid-column: 1 / -1;
      max-width: 520px;
    }
    .def-cockpit-workspace-analytics > *,
    .def-cockpit-bottom-row > * {
      min-height: 0;
    }
  }
  @media (max-width: 1366px) {
    :root { --def-sidebar-w: 280px; }
    .def-cockpit {
      --cockpit-metric-min-h: 96px;
      --cockpit-fast-min-h: 176px;
    }
    .def-cockpit-overall-health-head .def-cockpit-metric-label {
      font-size: clamp(0.48rem, 0.8vw, 0.54rem);
    }
    .def-cockpit-overall-health-legend li {
      font-size: clamp(0.42rem, 0.75vw, 0.48rem);
      padding: 2px 5px 2px 4px;
    }
    .def-cockpit-metric-scope-name {
      font-size: clamp(0.44rem, 0.7vw, 0.5rem);
    }
    .def-cockpit-fast-health h3 {
      font-size: clamp(0.66rem, 1vw, 0.72rem);
    }
  }
  @media (max-width: 1280px) {
    :root { --def-sidebar-w: 268px; }
    .def-cockpit {
      --cockpit-metric-min-h: 92px;
      --cockpit-fast-min-h: 168px;
    }
    .def-cockpit-metrics-row {
      gap: 8px;
    }
    .def-cockpit-metric-icon {
      width: 22px;
      height: 22px;
      font-size: 0.66rem;
    }
    .def-cockpit-metric-scope-value {
      font-size: clamp(0.84rem, 1.2vw, 0.98rem);
    }
  }
  @media (max-width: 1180px) {
    :root { --def-sidebar-w: 252px; }
    .def-cockpit-metrics-row {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    .def-cockpit-metrics-row > :nth-child(1) { grid-column: 1 / span 2; }
    .def-cockpit-metrics-row > :nth-child(2) { grid-column: 3; }
    .def-cockpit-metrics-row > :nth-child(3) { grid-column: 4; }
    .def-cockpit-metrics-row > :nth-child(4) { grid-column: 1 / span 2; }
    .def-cockpit-metrics-row > :nth-child(5) { grid-column: 3 / span 2; }
    .def-cockpit-overall-health-body {
      gap: 4px;
    }
    .def-cockpit-fast-legend li {
      padding: 4px 6px;
      font-size: clamp(0.56rem, 0.9vw, 0.62rem);
    }
  }
  @media (max-width: 1024px) {
    :root { --def-sidebar-w: 240px; }
    .def-cockpit-fast-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .def-cockpit-bottom-row {
      grid-template-columns: 1fr;
    }
    .def-cockpit-bottom-row > .def-cockpit-bottom-rail {
      max-width: none;
    }
  }
  @media (max-width: 768px) {
    .def-cockpit-top { padding: 12px 14px 12px 16px; }
    .def-cockpit-top-main { flex-direction: column; align-items: stretch; gap: 12px; }
    .def-cockpit-top-toolbar {
      width: 100%;
      flex-direction: column;
      align-items: stretch;
      gap: 10px;
    }
    .def-cockpit-last-updated {
      width: 100%;
      justify-content: space-between;
    }
    .def-cockpit-top-meta {
      width: auto;
      justify-content: flex-end;
      padding: 0;
    }
    .def-cockpit-user-popover-host {
      margin-left: auto;
    }
    .def-cockpit-workspace {
      grid-template-columns: 1fr;
      grid-template-rows: auto;
    }
    .def-cockpit-workspace-analytics,
    .def-cockpit-bottom-row {
      grid-template-columns: 1fr;
    }
    .def-cockpit-workspace-analytics > *,
    .def-cockpit-bottom-row > * {
      min-height: 0;
      height: auto;
    }
    .def-cockpit-bottom-rail {
      grid-template-rows: auto auto;
    }
    .def-cockpit-ws-recovery .def-cockpit-table-scroll,
    .def-cockpit-bottom-card .def-cockpit-table-scroll.wide {
      max-height: min(220px, 42vh);
    }
    .def-cockpit-chart-plot {
      flex-basis: min(var(--cockpit-panel-chart-h, 148px), 42vw);
      height: min(var(--cockpit-panel-chart-h, 148px), 42vw);
    }
    .def-cockpit-table-recovery,
    .def-cockpit-table-teams { min-width: min(520px, 100%); }
    .def-tracker-table { min-width: min(720px, 100%); font-size: var(--text-xs); }
    .def-tracker-head { flex-direction: column; }
    .def-tracker-search { max-width: none; }
    .def-tracker-legend { width: 100%; }
  }
  @media (max-width: 640px) {
    .def-cockpit { --cockpit-pad: var(--space-3); }
    .def-cockpit-top-meta {
      flex-direction: row;
      align-items: center;
      justify-content: flex-end;
      gap: 0;
    }
    .def-cockpit-user-popover {
      right: 0;
      left: auto;
    }
    .def-cockpit-metrics-row {
      display: flex;
      flex-wrap: nowrap;
      overflow-x: auto;
      overscroll-behavior-x: contain;
      scroll-snap-type: x mandatory;
      scroll-padding-inline: 4px;
      scrollbar-width: thin;
      gap: 8px;
      padding: 2px 2px 6px;
      -webkit-mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
      mask-image: linear-gradient(90deg, transparent, #000 10px, #000 calc(100% - 10px), transparent);
    }
    .def-cockpit-metrics-row > .def-cockpit-metric-card,
    .def-cockpit-metrics-row > .def-cockpit-metric-card-overlay {
      flex: 0 0 clamp(124px, 42vw, 148px);
      scroll-snap-align: start;
      min-height: var(--cockpit-metric-min-h);
    }
    .def-cockpit-fast-grid { grid-template-columns: 1fr; }
    .def-cockpit-movement-stats { grid-template-columns: 1fr; }
    .def-cockpit-metric-label { font-size: var(--text-min); }
    .def-cockpit-table { font-size: var(--text-xs); }
    .def-cockpit-card-title { font-size: var(--text-xs); }
    .def-chart-legend-row { gap: 6px 10px; }
    .def-chart-legend-item { font-size: var(--text-min); white-space: normal; }
  }
  @media (max-width: 480px) {
    .def-cockpit-metrics-row,
    .def-cockpit-fast-grid { grid-template-columns: unset; }
    .def-cockpit-metrics-row > .def-cockpit-metric-card,
    .def-cockpit-metrics-row > .def-cockpit-metric-card-overlay {
      flex: 0 0 clamp(118px, 44vw, 132px);
      min-height: 0;
    }
    .def-cockpit-table-recovery,
    .def-cockpit-table-teams { min-width: min(100%, 480px); }
    .def-cockpit-fast-health h3 { line-clamp: 3; }
  }

  .def-app.def-theme-dark .def-alert-line,
  .def-app.def-theme-dark .def-delay-reason {
    background: rgba(234,88,12,0.12);
    border-color: rgba(234,88,12,0.28);
    color: #fdba74;
  }
  .def-app.def-theme-dark .def-blocker-box {
    background: rgba(220,38,38,0.1);
    border-color: rgba(220,38,38,0.28);
  }
  .def-app.def-theme-dark .def-blocker-box li { color: #fca5a5; }
  .def-app.def-theme-dark .def-module-chip {
    background: rgba(255,255,255,0.06);
    border-color: rgba(255,255,255,0.1);
    color: var(--def-text);
  }
  .def-app.def-theme-dark .def-timeline-box {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-timeline-row > div {
    background: rgba(255,255,255,0.04);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-timeline-row > div:hover {
    background: rgba(255,255,255,0.07);
    border-color: rgba(99,102,241,0.35);
  }
  .def-app.def-theme-dark .def-timeline-row span { color: var(--def-muted); }
  .def-app.def-theme-dark .def-drawer-head-clean {
    background: rgba(30,41,59,0.95);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-drawer-schedule-chip {
    background: rgba(15,23,42,0.5);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-drawer-pro {
    background: linear-gradient(180deg, var(--def-surface) 0%, rgba(15,23,42,0.95) 100%);
  }
  .def-app.def-theme-dark .def-project-row-active {
    background: rgba(99,102,241,0.14);
    box-shadow: inset 3px 0 0 #818cf8;
  }
  .def-app.def-theme-dark .def-accordion-trigger-text small { color: var(--def-muted); }

  .def-cockpit-theme-dark .def-cockpit-top,
  .def-cockpit-theme-dark .def-cockpit-metric-card,
  .def-cockpit-theme-dark .def-cockpit-section,
  .def-cockpit-theme-dark .def-cockpit-fast-health,
  .def-cockpit-theme-dark .def-cockpit-chart-card,
  .def-cockpit-theme-dark .def-cockpit-table-card,
  .def-cockpit-theme-dark .def-cockpit-rail-card {
    background: rgba(30,41,59,0.88);
    border-color: rgba(255,255,255,0.08);
  }
  .def-cockpit-theme-dark .def-cockpit-top {
    background: linear-gradient(135deg, rgba(30,41,59,0.96) 0%, rgba(15,23,42,0.92) 100%);
    border-color: rgba(129,140,248,0.18);
  }
  .def-cockpit-theme-dark .def-cockpit-top-meta {
    background: transparent;
    border: none;
  }
  .def-cockpit-theme-dark .def-cockpit-user-popover {
    background: rgba(30,41,59,0.98);
    border-color: rgba(255,255,255,0.1);
    box-shadow:
      0 2px 8px rgba(0,0,0,0.2),
      0 18px 42px rgba(0,0,0,0.35);
  }
  .def-cockpit-theme-dark .def-cockpit-user-popover::before {
    background: rgba(30,41,59,0.98);
    border-color: rgba(255,255,255,0.1);
  }
  .def-cockpit-theme-dark .def-cockpit-last-updated {
    background: rgba(15,23,42,0.6);
    border-color: rgba(255,255,255,0.1);
  }
  .def-cockpit-theme-dark .def-cockpit-filter {
    background: rgba(15,23,42,0.6);
    border-color: rgba(255,255,255,0.1);
  }
  .def-cockpit-theme-dark .def-cockpit-filter select {
    color: var(--def-text);
    background: transparent url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath fill='%2394949e' d='M1 1l4 4 4-4'/%3E%3C/svg%3E") no-repeat right center;
  }
  .def-cockpit-theme-dark .def-cockpit-fast-health { background: linear-gradient(180deg, rgba(30,41,59,0.95), rgba(15,23,42,0.9)); }
  .def-cockpit-theme-dark .def-cockpit-table th { background: rgba(15,23,42,0.5); }
  .def-cockpit-theme-dark .def-cockpit-move-stat { background: rgba(15,23,42,0.5); border-color: rgba(255,255,255,0.08); }
  .def-cockpit-theme-dark .def-cockpit-rail-card.subtle { background: rgba(15,23,42,0.45); }
  .def-cockpit-theme-dark .def-cockpit-interactive::before {
    background: linear-gradient(135deg, rgba(129,140,248,0.12) 0%, transparent 52%);
  }
  .def-app.def-theme-dark .def-initiative-header {
    background: linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.9));
    border-left-color: #818cf8;
  }
  .def-app.def-theme-dark .def-initiative-stat {
    background: linear-gradient(180deg, rgba(30,41,59,0.88), rgba(15,23,42,0.65));
  }
  .def-app.def-theme-dark .def-scorecard-target-card {
    background: linear-gradient(180deg, rgba(30,41,59,0.92), rgba(15,23,42,0.78));
  }
  .def-app.def-theme-dark .def-initiative-header,
  .def-app.def-theme-dark .def-initiative-progress-card {
    background: rgba(30,41,59,0.88); border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-pillar-shell {
    background: rgba(30,41,59,0.92);
    border-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-pillar-hero {
    background: linear-gradient(135deg, rgba(30,41,59,0.98), rgba(15,23,42,0.92));
    border-bottom-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-pillar-footer {
    background: rgba(15,23,42,0.55);
    border-top-color: rgba(255,255,255,0.08);
  }
  .def-app.def-theme-dark .def-table-embedded {
    border-color: rgba(255,255,255,0.1);
  }
  .def-app.def-theme-dark .def-table-embedded .def-table thead th {
    background: rgba(15,23,42,0.65);
  }

  .def-cockpit-theme-dark .def-tracker-search input {
    background: rgba(15,23,42,0.6); border-color: rgba(255,255,255,0.1); color: var(--def-text);
  }
  .def-cockpit-theme-dark .def-tracker-table tbody td { background: rgba(30,41,59,0.5); border-color: rgba(255,255,255,0.06); }
  .def-cockpit-theme-dark .def-tracker-table tbody tr:nth-child(even) td { background: rgba(15,23,42,0.45); }
  .def-cockpit-theme-dark .def-tracker-imperative { background: rgba(15,23,42,0.65) !important; }
  .def-cockpit-theme-dark .def-tracker-row-click:hover td { background: rgba(99,102,241,0.14) !important; }

  @media (max-width: 768px) {
    .def-panel:hover { transform: none; box-shadow: var(--def-shadow); }
    .def-initiative-header { padding: var(--space-3); }
    .def-initiative-header::after { display: none; }
    .def-pillar-hero { padding: var(--space-3); }
    .def-pillar-body { padding: var(--space-2) var(--space-3) var(--space-3); }
    .def-pillar-footer { padding: var(--space-2) var(--space-3); }
    .def-pillar-stats li:not(:last-child)::after { margin: 0 8px; }
    .def-initiative-stat:hover { transform: none; }
    .def-scorecard-target-card:hover { transform: none; }
    .def-tracker-table-scroll {
      margin-inline: calc(-1 * var(--content-pad-x));
      padding-inline: var(--content-pad-x);
      scroll-padding-left: var(--content-pad-x);
    }
    .def-tracker-table-scroll .def-tracker-table th:first-child,
    .def-tracker-table-scroll .def-tracker-table td.def-tracker-imperative {
      position: sticky;
      left: 0;
      z-index: 2;
      box-shadow: 2px 0 8px rgba(15,23,42,0.06);
    }
    .def-tracker-table-scroll .def-tracker-table thead th:first-child {
      z-index: 3;
    }
    .def-tracker-table th:nth-child(2),
    .def-tracker-table td.def-tracker-initiative {
      position: sticky;
      left: 72px;
      z-index: 2;
      box-shadow: 2px 0 8px rgba(15,23,42,0.06);
    }
    .def-tracker-table thead th:nth-child(2) { z-index: 3; }
    .def-tracker-table th:nth-last-child(-n+2),
    .def-tracker-table td:nth-last-child(-n+2) { display: none; }
    .def-initiative-kpi-table th:nth-last-child(-n+2),
    .def-initiative-kpi-table td:nth-last-child(-n+2) { display: none; }
    .def-drawer { width: 100%; max-width: 100%; }
    .def-btn-sm { min-height: var(--def-touch-min); padding: 8px 14px; }
    .def-back-btn { min-height: var(--def-touch-min); width: 100%; justify-content: center; }
  }
  @media (max-width: 480px) {
    .def-initiative-quick-stats { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .def-initiative-title { font-size: 1.05rem; }
    .def-scorecard-targets-row { gap: var(--space-2); }
    .def-cockpit-metrics-row { grid-template-columns: unset; }
    .def-bc-current { max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const Dashboard = () => {
  const [layer, setLayer] = useState('ceo');
  const [fastId, setFastId] = useState(null);
  const [initiativeId, setInitiativeId] = useState(null);
  const [drawerProjectId, setDrawerProjectId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem(THEME_STORAGE_KEY) || 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    document.documentElement.lang = APP_LOCALE;
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
    }
  }, [theme]);

  const fastCategory = useMemo(() => findFastCategory(fastId), [fastId]);
  const initiative = useMemo(() => findInitiative(fastCategory, initiativeId), [fastCategory, initiativeId]);
  const embeddedInitiativeView = useMemo(
    () => getEmbeddedInitiativeView(initiativeId),
    [initiativeId],
  );
  const drawerProject = useMemo(
    () => findProject(initiative, drawerProjectId),
    [initiative, drawerProjectId],
  );

  const navigateTo = (target) => {
    if (target === 'ceo') {
      setLayer('ceo');
      setFastId(null);
      setInitiativeId(null);
      setDrawerProjectId(null);
    } else if (target === 'fast') {
      setLayer('fast');
      setInitiativeId(null);
      setDrawerProjectId(null);
    } else if (target === 'initiative') {
      setLayer('initiative');
      setDrawerProjectId(null);
    } else if (target === 'team') {
      setLayer('team');
      setDrawerProjectId(null);
    }
  };

  const goFast = (id) => {
    setFastId(id);
    setInitiativeId(null);
    setDrawerProjectId(null);
    setLayer('fast');
  };

  const goInitiative = (categoryId, initId) => {
    setFastId(categoryId);
    setInitiativeId(initId);
    setDrawerProjectId(null);
    setLayer('initiative');
  };

  const goTeam = (categoryId, initId) => {
    setFastId(categoryId);
    setInitiativeId(initId);
    setDrawerProjectId(null);
    setLayer('team');
  };

  const openProjectDrawer = (categoryId, initId, prjId) => {
    setFastId(categoryId);
    setInitiativeId(initId);
    setLayer('team');
    setDrawerProjectId(prjId);
  };

  useEffect(() => {
    const node = contentRef.current;
    if (node) {
      if (typeof node.scrollTo === 'function') node.scrollTo({ top: 0, behavior: 'auto' });
      else node.scrollTop = 0;
    }
    setSidebarOpen(false);
  }, [layer]);

  useEffect(() => {
    if (layer !== 'team') setDrawerProjectId(null);
  }, [layer]);

  useEffect(() => {
    const lockScroll = (sidebarOpen && window.innerWidth <= 960)
      || Boolean(drawerProjectId);
    const content = contentRef.current;
    if (content) {
      content.style.overflow = lockScroll ? 'hidden' : '';
    }
    return () => {
      if (content) content.style.overflow = '';
    };
  }, [sidebarOpen, drawerProjectId]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 960) setSidebarOpen(false);
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div className={`def-app def-theme-${theme}`}>
        <div className="def-mesh def-mesh-1" aria-hidden="true" />
        <div className="def-mesh def-mesh-2" aria-hidden="true" />
        <div className="def-mesh def-mesh-3" aria-hidden="true" />
        <header className="def-topbar">
          <div className="def-topbar-left">
            <button
              type="button"
              className="def-menu-toggle"
              onClick={() => setSidebarOpen((open) => !open)}
              aria-expanded={sidebarOpen}
              aria-label={sidebarOpen ? 'Close navigation menu' : 'Open navigation menu'}
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <span className="def-topbar-mark">AD</span>
            <span className="def-topbar-brand">{ORG_DATA.organization.name}</span>
          </div>
          <div className="def-topbar-right">
            <ThemeToggle theme={theme} onToggle={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))} />
          </div>
        </header>

        {sidebarOpen && (
          <button
            type="button"
            className="def-sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="def-layout">
          <AppSidebar
            layer={layer}
            fastCategory={fastCategory}
            initiative={initiative}
            open={sidebarOpen}
            onNavigate={() => setSidebarOpen(false)}
            onGoCeo={() => navigateTo('ceo')}
            onSelectFast={goFast}
            onSelectInitiative={goInitiative}
          />

          <div className="def-content-wrap" ref={contentRef}>
            <main className="def-main" key={layer}>
          {layer === 'ceo' && (
            <CeoView
              theme={theme}
              onOpenFastPillar={goFast}
              onOpenInitiative={goInitiative}
            />
          )}

          {layer === 'fast' && fastCategory && (
            <FastCategoryView
              fastCategory={fastCategory}
              onGoCeo={() => navigateTo('ceo')}
              onSelectInitiative={(initId) => goInitiative(fastCategory.id, initId)}
              onBack={() => navigateTo('ceo')}
            />
          )}

          {layer === 'initiative' && fastCategory && initiative && (
            embeddedInitiativeView ? (
              <div className="def-layer def-page-enter def-initiative-embed">
                {React.createElement(embeddedInitiativeView)}
              </div>
            ) : (
              <InitiativeView
                fastCategory={fastCategory}
                initiative={initiative}
                onGoCeo={() => navigateTo('ceo')}
                onGoFast={() => navigateTo('fast')}
                onGoTeam={() => goTeam(fastCategory.id, initiative.id)}
                onSelectProject={(prjId) => openProjectDrawer(fastCategory.id, initiative.id, prjId)}
              />
            )
          )}

          {layer === 'team' && fastCategory && initiative && initiative.team && (
            <TeamView
              fastCategory={fastCategory}
              initiative={initiative}
              team={initiative.team}
              activeProjectId={drawerProjectId}
              onOpenProject={setDrawerProjectId}
              onGoCeo={() => navigateTo('ceo')}
              onGoFast={() => navigateTo('fast')}
              onGoInitiative={() => navigateTo('initiative')}
            />
          )}
            </main>
            {!(layer === 'initiative' && embeddedInitiativeView) && <AppFooter compact={layer === 'ceo'} />}

            {layer === 'team' && fastCategory && initiative && drawerProject && (
              <ProjectDetailDrawer
                project={drawerProject}
                team={initiative.team}
                theme={theme}
                open={Boolean(drawerProjectId)}
                onClose={() => setDrawerProjectId(null)}
              />
            )}

          </div>
        </div>
        <div id="def-drawer-portal-host" className="def-drawer-portal-host" />
      </div>
    </>
  );
};

export { useResponsiveChart };
export { default as CloudMigration } from './CloudMigration';
export { default as RiskAndResilience } from './RiskAndResilience';
export default Dashboard;
