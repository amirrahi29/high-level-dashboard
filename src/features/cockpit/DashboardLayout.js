import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';

import '../../styles/dashboard.css';
import { useDashboardNavigation } from '../../hooks/useDashboardNavigation.js';
import { APP_LOCALE } from '../../constants/app.js';
import { useTheme } from '../../hooks/useTheme.js';
import PageLoader from '../../components/ui/PageLoader.js';
import { ORG_DATA, findFastCategory, findInitiative, findProject } from './lib/orgModel.js';
import { AppSidebar, AppFooter, ThemeToggle } from './components/sharedUi.js';
import { getEmbeddedInitiativeView } from './lib/embeddedInitiatives.js';
import {
  CeoView,
  FastCategoryView,
  InitiativeView,
  TeamView,
  ProjectDetailDrawer,
} from './pages/lazyPages.js';

function PageSuspense({ children, label }) {
  return <Suspense fallback={<PageLoader label={label} />}>{children}</Suspense>;
}

export default function DashboardLayout() {
  const {
    layer,
    fastId,
    initiativeId,
    drawerProjectId,
    navigateTo,
    goFast,
    goInitiative,
    goTeam,
    openProjectDrawer,
    closeProjectDrawer,
  } = useDashboardNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const contentRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    document.documentElement.lang = APP_LOCALE;
  }, []);

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

  useEffect(() => {
    const node = contentRef.current;
    if (node) {
      if (typeof node.scrollTo === 'function') node.scrollTo({ top: 0, behavior: 'auto' });
      else node.scrollTop = 0;
    }
    setSidebarOpen(false);
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
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
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
              <PageSuspense label="Loading command center…">
                <CeoView
                  theme={theme}
                  onOpenFastPillar={goFast}
                  onOpenInitiative={goInitiative}
                />
              </PageSuspense>
            )}

            {layer === 'fast' && fastCategory && (
              <PageSuspense label="Loading pillar…">
                <FastCategoryView
                  fastCategory={fastCategory}
                  onGoCeo={() => navigateTo('ceo')}
                  onSelectInitiative={(initId) => goInitiative(fastCategory.id, initId)}
                  onBack={() => navigateTo('ceo')}
                />
              </PageSuspense>
            )}

            {layer === 'initiative' && fastCategory && initiative && (
              embeddedInitiativeView ? (
                <div className="def-layer def-page-enter def-initiative-embed">
                  <PageSuspense label="Loading initiative dashboard…">
                    {React.createElement(embeddedInitiativeView)}
                  </PageSuspense>
                </div>
              ) : (
                <PageSuspense label="Loading initiative…">
                  <InitiativeView
                    fastCategory={fastCategory}
                    initiative={initiative}
                    onGoCeo={() => navigateTo('ceo')}
                    onGoFast={() => navigateTo('fast')}
                    onGoTeam={() => goTeam(fastCategory.id, initiative.id)}
                    onSelectProject={(prjId) => openProjectDrawer(fastCategory.id, initiative.id, prjId)}
                  />
                </PageSuspense>
              )
            )}

            {layer === 'team' && fastCategory && initiative && initiative.team && (
              <PageSuspense label="Loading team workspace…">
                <TeamView
                  fastCategory={fastCategory}
                  initiative={initiative}
                  team={initiative.team}
                  activeProjectId={drawerProjectId}
                  onOpenProject={(prjId) => openProjectDrawer(fastCategory.id, initiative.id, prjId)}
                  onGoCeo={() => navigateTo('ceo')}
                  onGoFast={() => navigateTo('fast')}
                  onGoInitiative={() => navigateTo('initiative')}
                />
              </PageSuspense>
            )}
          </main>
          {!(layer === 'initiative' && embeddedInitiativeView) && <AppFooter compact={layer === 'ceo'} />}

          {layer === 'team' && fastCategory && initiative && drawerProject && (
            <PageSuspense label="Loading project details…">
              <ProjectDetailDrawer
                project={drawerProject}
                team={initiative.team}
                theme={theme}
                open={Boolean(drawerProjectId)}
                onClose={closeProjectDrawer}
              />
            </PageSuspense>
          )}
        </div>
      </div>
      <div id="def-drawer-portal-host" className="def-drawer-portal-host" />
    </div>
  );
}
