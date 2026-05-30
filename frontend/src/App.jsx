import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { AdminLayout } from './layouts/AdminLayout';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleBasedRoute } from './routes/RoleBasedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { UploadPage } from './pages/UploadPage';
import { HistoryPage } from './pages/HistoryPage';
import { SubmissionDetailPage } from './pages/SubmissionDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminSubmissionsPage } from './pages/admin/AdminSubmissionsPage';
import { AdminSubjectsPage } from './pages/admin/AdminSubjectsPage';
import { AdminAiUsagePage } from './pages/admin/AdminAiUsagePage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/403" element={<ForbiddenPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
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
  );
}
