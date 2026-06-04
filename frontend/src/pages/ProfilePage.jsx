import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/common/PageHeader';

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div>
      <PageHeader title="Profile" description="Your authenticated account details." />
      <section className="app-card p-5">
        <dl className="grid gap-4 text-sm">
          <Row label="Name" value={user?.fullName} />
          <Row label="Email" value={user?.email} />
          <Row label="Role" value={user?.role} />
          <Row label="Status" value={user?.enabled ? 'Enabled' : 'Disabled'} />
        </dl>
      </section>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="grid gap-1">
      <dt className="font-black text-slate-500">{label}</dt>
      <dd className="text-base font-bold text-ink">{value || '-'}</dd>
    </div>
  );
}
