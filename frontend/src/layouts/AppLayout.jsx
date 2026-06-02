import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { BookOpen, ClipboardCheck, History, Home, LogOut, Shield, Upload, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const userNav = [
  { to: '/dashboard', label: 'Home', icon: Home },
  { to: '/upload', label: 'Explain', icon: Upload },
  { to: '/grade', label: 'Grade', icon: ClipboardCheck },
  { to: '/submissions', label: 'History', icon: History },
  { to: '/profile', label: 'Profile', icon: User },
];

export function AppLayout() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-slate-50 text-ink">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <NavLink to="/dashboard" className="flex items-center gap-2 font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-sea text-white">
              <BookOpen size={19} />
            </span>
            <span>StudyAI</span>
          </NavLink>
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <NavLink to="/admin" className="hidden tap-target items-center gap-2 rounded-lg px-3 text-sm font-semibold text-sea sm:flex">
                <Shield size={17} /> Admin
              </NavLink>
            ) : null}
            <button onClick={handleLogout} className="tap-target rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
              <LogOut size={17} aria-hidden="true" />
              <span className="sr-only">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="safe-bottom mx-auto w-full max-w-6xl px-4 py-5">
        <div className="mb-5">
          <p className="text-sm text-slate-500">Signed in as</p>
          <h1 className="text-xl font-bold text-ink">{user?.fullName || 'Student'}</h1>
        </div>
        <Outlet />
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 px-2 pb-[env(safe-area-inset-bottom)] shadow-soft backdrop-blur md:hidden">
        <div
          className="mx-auto grid max-w-md gap-1 py-2"
          style={{ gridTemplateColumns: `repeat(${isAdmin ? 6 : 5}, minmax(0, 1fr))` }}
        >
          {userNav.map((item) => (
            <MobileNavItem key={item.to} item={item} />
          ))}
          {isAdmin ? <MobileNavItem item={{ to: '/admin', label: 'Admin', icon: Shield }} /> : null}
        </div>
      </nav>
    </div>
  );
}

function MobileNavItem({ item }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `flex min-h-14 flex-col items-center justify-center rounded-lg text-[11px] font-semibold ${
          isActive ? 'bg-mint text-sea' : 'text-slate-500'
        }`
      }
    >
      <Icon size={19} />
      <span className="mt-1">{item.label}</span>
    </NavLink>
  );
}
