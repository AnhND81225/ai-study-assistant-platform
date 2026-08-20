import { Activity, Cloud, ShieldCheck } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';

export function AdminOverviewPage() {
  return (
    <div>
      <PageHeader title="Admin overview" description="Review users, submissions, subjects, and AI usage logs from the admin area." />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric icon={ShieldCheck} label="Security" value="RBAC" tone="blue" />
        <Metric icon={Cloud} label="Uploads" value="Cloudinary" tone="green" />
        <Metric icon={Activity} label="AI Logs" value="Tracked" tone="orange" />
      </div>
    </div>
  );
}

const tones = {
  blue: 'bg-blue-50 text-ocean',
  green: 'bg-slate-100 text-slate-700',
  orange: 'bg-slate-100 text-slate-700',
};

function Metric({ icon: Icon, label, value, tone }) {
  return (
    <div className="smooth-card workspace-card">
      <div className="workspace-core p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={20} /></span>
      <p className="mt-4 text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      </div>
    </div>
  );
}
