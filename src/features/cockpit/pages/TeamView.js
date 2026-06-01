import React, { useEffect, useMemo } from 'react';
import { formatDate } from '../../../utils/format.js';
import { SectionCard, StatusPill, RiskBadge, ProgressBar, HierarchyTrail } from '../components/sharedUi.js';

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

export default TeamView;
