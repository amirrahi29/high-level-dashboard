import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { APP_LOCALE, EMPTY_VALUE } from '../../../constants/app.js';
import { formatAppDateTime } from '../../../utils/format.js';
import { toSlug } from '../../../utils/slug.js';

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

function progressBandLabel(band) {
  if (band === 'on-track') return 'On Track';
  if (band === 'at-risk') return 'At Risk';
  return 'Off Track';
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

export {
  DEMO_INITIATIVE_PROGRESS,
  demoTrendFromProgress,
  resolveDemoProgress,
  statusFromProgressBand,
  riskFromProgressBand,
  createDemoProject,
  LAY_OF_LAND_ROWS,
  summarizeProjects,
  classifyProgressBand,
  statusFromHealthScore,
  PROGRESS_BAND_THEME,
  getProgressBandTheme,
  progressBandLabel,
  countProjectsByProgressBand,
  IMPERATIVE_LABELS,
  formatFastPillarSubtitle,
  INITIATIVE_TRACKER_REF,
  SCORECARD_STATUS_META,
  INITIATIVE_SCORECARD_REF,
  deriveScorecardStatus,
  buildFallbackScorecard,
  buildInitiativeScorecard,
  deriveScorecardStatusFromProgress,
  buildInitiativeScorecardSummary,
  ScorecardStatusCell,
  OwnerBadge,
  TeamBadge,
  resolveOwnerTone,
  applyGroupRowSpans,
  TRACKER_SPAN_GROUPS,
  applyTrackerRowSpans,
  CockpitCollapsibleSection,
  StrategicTargetCards,
  InitiativeKpiTable,
  formatBudgetM,
  buildInitiativeTrackerRows,
  getInitiativeTrackerDetail,
  InitiativeTracker,
  buildLayOfLandCategories,
  computePortfolioSummary,
  computeExecutiveMetrics,
  COCKPIT_ANCHOR_DATE,
  addDaysToIso,
  daysBetweenIso,
  buildOwnershipOverview,
  buildUpcomingMilestones,
  buildQuarterlyComparisonStats,
  buildLastQuarterSummary,
  buildKeyHighlights,
  RISK_PARENT_LABELS,
  COCKPIT_TOP_RISKS_SUPPLEMENT,
  buildTopRisks,
  RISK_GAUGE_COLORS,
  RiskScoreGauge,
  buildPortfolioTrends,
};
