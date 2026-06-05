import { Link } from 'react-router-dom';
import { Camera, ClipboardCheck, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Ready to study?" description="Start with a question you want to understand, or check work you have already completed." />
      <div className="mb-4 grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="app-card overflow-hidden bg-sea p-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black text-white/80">Start here</p>
              <h3 className="mt-2 text-3xl font-black leading-tight">Take a photo and learn the solution step by step.</h3>
              <Link to="/upload" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 font-black text-ocean">
                <Camera size={18} />
                Take a photo
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
        <ActionCard to="/upload" icon={Camera} title="Solve homework" detail="Take a photo of one question and learn the solution step by step." />
        <ActionCard to="/grade" icon={ClipboardCheck} title="Check my work" detail="Upload your completed work or check an answer to a saved question." />
        <ActionCard to="/submissions" icon={Clock} title="Saved homework" detail="Review past questions, solutions, and feedback whenever you need them." />
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
