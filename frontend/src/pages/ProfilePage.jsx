import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { roleLabel } from '../utils/enumLabels';
import { BookOpen, ShieldCheck, UserRound } from 'lucide-react';

export function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="motion-page">
      <PageHeader title="Your profile" description="Review your account details and access level." />
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <ProfileSignal icon={UserRound} label="Account" value={user?.enabled ? 'Active' : 'Disabled'} />
        <ProfileSignal icon={ShieldCheck} label="Role" value={roleLabel(user?.role)} />
        <ProfileSignal icon={BookOpen} label="Workspace" value="StudyAI" />
      </div>
      <section className="workspace-card max-w-3xl overflow-hidden">
        <div className="workspace-core overflow-hidden">
        <div className="flex items-center gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-blue-50/70 p-5">
          <div className="grid h-16 w-16 place-items-center rounded-[1.35rem] bg-sea text-xl font-extrabold text-white shadow-[0_18px_34px_rgba(37,99,235,0.20)]">
            {user?.fullName?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div>
            <h2 className="text-xl font-extrabold tracking-[-0.025em] text-ink">{user?.fullName || 'Student'}</h2>
            <p className="mt-1 text-sm font-medium text-slate-500">{user?.email}</p>
          </div>
        </div>
        <dl className="grid gap-0 p-5 text-sm">
          <Row label="Name" value={user?.fullName} />
          <Row label="Email" value={user?.email} />
          <Row label="Account type" value={roleLabel(user?.role)} />
          <Row label="Account status" value={user?.enabled ? 'Active' : 'Disabled'} />
        </dl>
        </div>
      </section>
    </div>
  );
}

function ProfileSignal({ icon: Icon, label, value }) {
  return (
    <article className="workspace-card">
      <div className="workspace-core flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-ocean">
          <Icon size={20} />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-slate-400">{label}</p>
          <p className="mt-1 truncate text-sm font-extrabold text-ink">{value || '-'}</p>
        </div>
      </div>
    </article>
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
