import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, History, Home, LogOut, ScanLine, Shield, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PwaStatusBanner } from '../components/pwa/PwaStatusBanner';

const userNav = [
  { to: '/dashboard', label: 'Home', icon: Home, preload: () => import('../pages/DashboardPage') },
  { to: '/upload', label: 'Solve', icon: ScanLine, preload: () => import('../pages/UploadPage') },
  { to: '/grade', label: 'Check', icon: ClipboardCheck, preload: () => import('../pages/GradePage') },
  { to: '/submissions', label: 'History', icon: History, preload: () => import('../pages/HistoryPage') },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen text-ink">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 rounded-lg font-extrabold text-ink">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sea text-white shadow-[0_12px_24px_rgba(37,99,235,0.18)]">
              <BookOpen size={19} />
            </span>
            <span className="text-lg">StudyAI</span>
          </NavLink>
          <nav className="hidden items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 md:flex" aria-label="Primary navigation">
            {userNav.map((item) => <DesktopNavItem key={item.to} item={item} />)}
          </nav>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <NavLink to="/admin" className="secondary-button px-3 text-sm" aria-label="Open admin">
                <Shield size={17} /><span className="hidden lg:inline">Admin</span>
              </NavLink>
            ) : null}
            <NavLink to="/profile" className="secondary-button px-3" aria-label="Open profile">
              <User size={17} />
              <span className="hidden lg:inline max-w-28 truncate">{user?.fullName || 'Profile'}</span>
            </NavLink>
            <button onClick={handleLogout} className="secondary-button px-3 text-slate-700" title="Sign out">
              <LogOut size={17} aria-hidden="true" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <PwaStatusBanner />

      <main id="main-content" className="safe-bottom mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_30px_rgba(15,23,42,0.08)] backdrop-blur-xl md:hidden" aria-label="Mobile navigation">
        <div className="mx-auto grid max-w-md grid-cols-4 gap-1 py-2">
          {userNav.map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function DesktopNavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onMouseEnter={item.preload}
      onFocus={item.preload}
      className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-md px-3 text-sm font-bold transition-colors ${isActive ? 'bg-white text-ocean shadow-sm' : 'text-slate-600 hover:bg-white hover:text-ink'}`}
    >
      <Icon size={16} />
      {item.label}
    </NavLink>
  );
}

function MobileNavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onTouchStart={item.preload}
      onFocus={item.preload}
      className={({ isActive }) =>
        `relative flex min-h-14 flex-col items-center justify-center rounded-lg text-[11px] font-bold transition-colors ${
          isActive ? 'bg-blue-50 text-ocean' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'
        }`
      }
    >
      <Icon size={19} />
      <span className="mt-1">{item.label}</span>
    </NavLink>
  );
}
