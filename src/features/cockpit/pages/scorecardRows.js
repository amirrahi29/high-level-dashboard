import { buildInitiativeScorecardSummary } from '../lib/cockpitData.js';

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

export { buildFastScorecardRows };
