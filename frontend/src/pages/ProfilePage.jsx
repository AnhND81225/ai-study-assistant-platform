import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { roleLabel } from '../utils/enumLabels';

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="motion-page">
      <PageHeader title="Your profile" description="Review your account details and access level." />
      <section className="app-card max-w-2xl overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-slate-50 p-5">
          <div className="grid h-14 w-14 place-items-center rounded-lg bg-sea text-xl font-extrabold text-white">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-ink">{user?.fullName || 'Student'}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{user?.email}</p>
          </div>
        </div>
        <dl className="grid gap-0 p-5 text-sm">
          <Row label="Name" value={user?.fullName} />
          <Row label="Email" value={user?.email} />
          <Row label="Account type" value={roleLabel(user?.role)} />
          <Row label="Account status" value={user?.enabled ? 'Active' : 'Disabled'} />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1 border-b border-slate-100 py-4 first:pt-0 last:border-0 last:pb-0 sm:grid-cols-[160px_1fr] sm:items-center">
      <dt className="font-bold text-slate-500">{label}</dt>
      <dd className="text-base font-bold text-ink sm:text-right">{value || '-'}</dd>
    </div>
  );
}
