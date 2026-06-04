import { Link } from 'react-router-dom';
import { Camera, ClipboardCheck, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Study dashboard" description="Choose a focused AI workflow, then review saved results from your private history." />
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="app-card overflow-hidden bg-sea p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-white/80">Next best action</p>
              <h3 className="mt-2 text-3xl font-black leading-tight">Scan a question and learn it step by step.</h3>
              <Link to="/upload" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 font-black text-ocean">
                <Camera size={18} />
                Start scan
              </Link>
            </div>
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-[1.25rem] bg-white/20">
              <Sparkles size={24} />
            </span>
          </div>
        </div>
        <AiUsageCard />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard to="/upload" icon={Camera} title="Explain question" detail="Upload a homework question image and generate a step-by-step explanation." />
        <ActionCard to="/grade" icon={ClipboardCheck} title="Grade answer" detail="Grade typed answers, answer images, or a full student-work scan." />
        <ActionCard to="/submissions" icon={Clock} title="Review history" detail="Open past submissions, explanations, grading results, and delete old work." />
      </div>
    </div>
  );
}

function ActionCard({ to, icon: Icon, title, detail }) {
  return (
    <Link to={to} className="smooth-card app-card p-5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-mint text-ocean">
        <Icon size={23} />
      </span>
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}
