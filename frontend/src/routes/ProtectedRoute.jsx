import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { LoadingState } from '../components/common/LoadingState';

export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.booting) {
    return <LoadingState label="Checking session" />;
  }

  if (!auth.isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
