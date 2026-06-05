import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, History, Home, LogOut, ScanLine, Shield, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { PwaStatusBanner } from '../components/pwa/PwaStatusBanner';

const userNav = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/upload', label: 'Solve', icon: ScanLine },
  { to: '/grade', label: 'Check', icon: ClipboardCheck },
  { to: '/submissions', label: 'History', icon: History },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-20 border-b border-sky-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sea text-white shadow-glow">
              <BookOpen size={19} />
            </span>
            <span>StudyAI</span>
          </NavLink>
          <nav className="hidden items-center gap-1 md:flex">
            {userNav.map((item) => <DesktopNavItem key={item.to} item={item} />)}
          </nav>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <NavLink to="/admin" className="secondary-button px-3 text-sm" aria-label="Open admin">
                <Shield size={17} /><span className="hidden lg:inline">Admin</span>
              </NavLink>
            ) : null}
            <NavLink to="/profile" className="secondary-button px-3 text-sm" aria-label="Open profile">
              <User size={17} />
              <span className="hidden lg:inline max-w-28 truncate">{user?.fullName || 'Profile'}</span>
            </NavLink>
            <button onClick={handleLogout} className="secondary-button px-3 text-sm text-slate-700">
              <LogOut size={17} aria-hidden="true" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </header>
      <PwaStatusBanner />

      <main className="safe-bottom mx-auto w-full max-w-5xl px-4 py-5">
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-sky-100 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur md:hidden">
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
    <NavLink to={item.to} className={({ isActive }) => `inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold ${isActive ? 'bg-mint text-ocean' : 'text-slate-500 hover:bg-sky-50 hover:text-ink'}`}>
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
      className={({ isActive }) =>
        `flex min-h-14 flex-col items-center justify-center rounded-lg text-[11px] font-semibold ${
          isActive ? 'bg-mint text-ocean' : 'text-slate-500'
        }`
      }
    >
      <Icon size={19} />
      <span className="mt-1">{item.label}</span>
    </NavLink>
  );
}
