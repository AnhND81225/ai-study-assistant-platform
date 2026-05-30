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
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <aside className="rounded-lg border border-slate-200 bg-white p-3">
        <h2 className="px-2 py-2 text-sm font-bold uppercase tracking-wide text-slate-500">Admin</h2>
        <nav className="grid gap-1">
          {adminNav.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `tap-target flex items-center gap-2 rounded-lg px-3 text-sm font-semibold ${
                    isActive ? 'bg-mint text-sea' : 'text-slate-600 hover:bg-slate-50'
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
      <section>
        <Outlet />
      </section>
    </div>
  );
}
