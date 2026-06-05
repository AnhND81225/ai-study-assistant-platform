import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { LoadingState } from './components/common/LoadingState';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleBasedRoute } from './routes/RoleBasedRoute';

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));

const AppLayout = lazyNamed(() => import('./layouts/AppLayout'), 'AppLayout');
const AdminLayout = lazyNamed(() => import('./layouts/AdminLayout'), 'AdminLayout');
const LandingPage = lazyNamed(() => import('./pages/LandingPage'), 'LandingPage');
const LoginPage = lazyNamed(() => import('./pages/LoginPage'), 'LoginPage');
const RegisterPage = lazyNamed(() => import('./pages/RegisterPage'), 'RegisterPage');
const DashboardPage = lazyNamed(() => import('./pages/DashboardPage'), 'DashboardPage');
const UploadPage = lazyNamed(() => import('./pages/UploadPage'), 'UploadPage');
const GradePage = lazyNamed(() => import('./pages/GradePage'), 'GradePage');
const HistoryPage = lazyNamed(() => import('./pages/HistoryPage'), 'HistoryPage');
const SubmissionDetailPage = lazyNamed(() => import('./pages/SubmissionDetailPage'), 'SubmissionDetailPage');
const ProfilePage = lazyNamed(() => import('./pages/ProfilePage'), 'ProfilePage');
const AdminOverviewPage = lazyNamed(() => import('./pages/admin/AdminOverviewPage'), 'AdminOverviewPage');
const AdminUsersPage = lazyNamed(() => import('./pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminSubmissionsPage = lazyNamed(() => import('./pages/admin/AdminSubmissionsPage'), 'AdminSubmissionsPage');
const AdminSubjectsPage = lazyNamed(() => import('./pages/admin/AdminSubjectsPage'), 'AdminSubjectsPage');
const AdminAiUsagePage = lazyNamed(() => import('./pages/admin/AdminAiUsagePage'), 'AdminAiUsagePage');
const ForbiddenPage = lazyNamed(() => import('./pages/ForbiddenPage'), 'ForbiddenPage');
const NotFoundPage = lazyNamed(() => import('./pages/NotFoundPage'), 'NotFoundPage');

export default function App() {
  return (
    <Suspense fallback={<LoadingState label="Opening StudyAI..." />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/403" element={<ForbiddenPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/grade" element={<GradePage />} />
            <Route path="/submissions" element={<HistoryPage />} />
            <Route path="/submissions/:id" element={<SubmissionDetailPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route element={<RoleBasedRoute allowedRoles={['ROLE_ADMIN']} />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminOverviewPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="submissions" element={<AdminSubmissionsPage />} />
                <Route path="subjects" element={<AdminSubjectsPage />} />
                <Route path="ai-usage" element={<AdminAiUsagePage />} />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route path="/offline" element={<Navigate to="/offline.html" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
