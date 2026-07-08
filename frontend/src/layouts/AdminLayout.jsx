import { NavLink, Outlet } from 'react-router-dom';
import { Activity, BookOpen, LayoutDashboard, Users } from 'lucide-react';

const adminNav = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/submissions', label: 'Submissions', icon: BookOpen },
  { to: '/admin/subjects', label: 'Subjects', icon: BookOpen },
  { to: '/admin/ai-usage', label: 'AI Usage', icon: Activity },
];

export function AdminLayout() {
  return (
    <div className="grid gap-5 lg:grid-cols-[230px_minmax(0,1fr)]">
      <aside className="app-card h-fit p-3 lg:sticky lg:top-28">
        <div className="border-b border-slate-100 px-2 pb-3 pt-1">
          <h2 className="font-extrabold text-ink">Admin workspace</h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">Manage platform activity</p>
        </div>
        <nav className="mt-3 grid grid-cols-2 gap-1 sm:grid-cols-5 lg:grid-cols-1" aria-label="Admin navigation">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `tap-target flex items-center gap-2 rounded-2xl px-3 text-sm font-extrabold transition-colors ${
                    isActive ? 'bg-blue-50 text-ocean shadow-inner' : 'text-slate-600 hover:bg-slate-50 hover:text-ink'
                  }`
                }
              >
                <Icon size={17} />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>
      <section className="min-w-0">
        <Outlet />
      </section>
    </div>
  );
}
