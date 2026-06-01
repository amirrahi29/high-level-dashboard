import { useCallback, useMemo } from 'react';
import { useMatch, useNavigate, useSearchParams } from 'react-router-dom';

export function useDashboardNavigation() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const teamMatch = useMatch('/fast/:fastId/initiative/:initiativeId/team');
  const initiativeMatch = useMatch('/fast/:fastId/initiative/:initiativeId');
  const fastMatch = useMatch('/fast/:fastId');

  const layer = useMemo(() => {
    if (teamMatch) return 'team';
    if (initiativeMatch) return 'initiative';
    if (fastMatch) return 'fast';
    return 'ceo';
  }, [teamMatch, initiativeMatch, fastMatch]);

  const fastId = teamMatch?.params.fastId
    ?? initiativeMatch?.params.fastId
    ?? fastMatch?.params.fastId
    ?? null;

  const initiativeId = teamMatch?.params.initiativeId
    ?? initiativeMatch?.params.initiativeId
    ?? null;

  const drawerProjectId = searchParams.get('project');

  const navigateTo = useCallback((target) => {
    if (target === 'ceo') {
      navigate('/');
      return;
    }
    if (target === 'fast' && fastId) {
      navigate(`/fast/${fastId}`);
      return;
    }
    if (target === 'initiative' && fastId && initiativeId) {
      navigate(`/fast/${fastId}/initiative/${initiativeId}`);
      return;
    }
    if (target === 'team' && fastId && initiativeId) {
      navigate(`/fast/${fastId}/initiative/${initiativeId}/team`);
    }
  }, [navigate, fastId, initiativeId]);

  const goFast = useCallback((id) => {
    navigate(`/fast/${id}`);
  }, [navigate]);

  const goInitiative = useCallback((categoryId, initId) => {
    navigate(`/fast/${categoryId}/initiative/${initId}`);
  }, [navigate]);

  const goTeam = useCallback((categoryId, initId) => {
    navigate(`/fast/${categoryId}/initiative/${initId}/team`);
  }, [navigate]);

  const openProjectDrawer = useCallback((categoryId, initId, projectId) => {
    navigate(`/fast/${categoryId}/initiative/${initId}/team?project=${projectId}`);
  }, [navigate]);

  const closeProjectDrawer = useCallback(() => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete('project');
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return {
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
  };
}
