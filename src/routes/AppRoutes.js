import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import PageLoader from '../components/ui/PageLoader.js';

const DashboardLayout = lazy(() => import('../features/cockpit/DashboardLayout.js'));

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageLoader label="Starting dashboard…" />}>
      <Routes>
        <Route path="/*" element={<DashboardLayout />} />
      </Routes>
    </Suspense>
  );
}
