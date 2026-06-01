import React, { useEffect, useMemo } from 'react';
import { buildInitiativeScorecardSummary, InitiativeKpiTable, IMPERATIVE_LABELS, statusFromHealthScore } from '../lib/cockpitData.js';
import { healthColor } from '../lib/orgModel.js';
import { StatusPill, HierarchyTrail } from '../components/sharedUi.js';
import { buildFastScorecardRows } from './scorecardRows.js';

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

export default FastCategoryView;
