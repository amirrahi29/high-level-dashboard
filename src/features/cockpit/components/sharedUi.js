import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import { CRITICAL_STATUS, STATUS_META, RISK_META, healthColor } from '../lib/orgModel.js';
import { getInitials } from '../lib/orgModel.js';
import { ORG_DATA } from '../lib/orgModel.js';

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

export {
  StatusPill,
  RiskBadge,
  ProgressBar,
  SectionCard,
  HierarchyTrail,
  AppSidebar,
  AppFooter,
  Avatar,
  ThemeToggle,
};
