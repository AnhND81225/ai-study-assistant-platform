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
      <header className="sticky top-0 z-20 px-3 pt-3 sm:px-6">
        <div className="premium-shell mx-auto flex max-w-6xl items-center justify-between gap-3 rounded-[1.5rem] bg-white/82 px-3 py-2.5 backdrop-blur-2xl sm:px-4">
          <NavLink to="/dashboard" className="flex items-center gap-2.5 rounded-2xl font-extrabold text-ink">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
              <BookOpen size={19} />
            </span>
            <span className="text-lg">StudyAI</span>
          </NavLink>
          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-slate-100/80 p-1 md:flex" aria-label="Primary navigation">
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

      <main id="main-content" className="safe-bottom mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:hidden" aria-label="Mobile navigation">
        <div className="premium-shell mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.5rem] bg-white/88 p-1.5 backdrop-blur-2xl">
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
      className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-full px-3.5 text-sm font-extrabold transition-all ${isActive ? 'bg-white text-ocean shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : 'text-slate-600 hover:bg-white/80 hover:text-ink'}`}
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
        `relative flex min-h-14 flex-col items-center justify-center rounded-[1.15rem] text-[11px] font-extrabold transition-all ${
          isActive ? 'bg-sea text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)]' : 'text-slate-500 hover:bg-slate-50 hover:text-ink'
        }`
      }
    >
      <Icon size={19} />
      <span className="mt-1">{item.label}</span>
    </NavLink>
  );
}
