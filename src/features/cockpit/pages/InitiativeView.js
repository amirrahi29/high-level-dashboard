import React, { useEffect, useMemo } from 'react';
import { formatDate } from '../../../utils/format.js';
import { buildInitiativeScorecard, InitiativeKpiTable, StrategicTargetCards, getInitiativeTrackerDetail } from '../lib/cockpitData.js';
import { SectionCard, StatusPill, RiskBadge, ProgressBar, HierarchyTrail } from '../components/sharedUi.js';

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

export default InitiativeView;
