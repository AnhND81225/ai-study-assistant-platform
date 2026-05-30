import { PageHeader } from '../../components/common/PageHeader';

export function AdminOverviewPage() {
  return (
    <div>
      <PageHeader title="Admin overview" description="Review users, submissions, subjects, and AI usage logs from the admin area." />
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label="Security" value="RBAC" />
        <Metric label="Uploads" value="Cloudinary" />
        <Metric label="AI Logs" value="Tracked" />
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
      <p className="text-sm font-bold text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-black text-sea">{value}</p>
    </div>
  );
}
