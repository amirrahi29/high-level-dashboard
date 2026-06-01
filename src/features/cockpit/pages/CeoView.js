import React, { useEffect, useMemo } from 'react';
import { formatAppDateTime } from '../../../utils/format.js';
import { buildInitiativeScorecardSummary, InitiativeTracker } from '../lib/cockpitData.js';
import { ORG_DATA } from '../lib/orgModel.js';
import { Avatar } from '../components/sharedUi.js';
import {
  buildCockpitAnalytics,
  CockpitQuarterHighlights,
  useViewport,
  CockpitPortfolioScopeCard,
  CockpitMetricCard,
  CockpitOverallHealthCard,
  FastHealthCard,
  TowerLeadHealthCard,
  UpcomingMilestonesTable,
  TopRisksPanel,
  TOWER_LEADS_DATA,
} from '../components/cockpitWidgets.js';

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

export default CeoView;
