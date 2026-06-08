import { Link } from 'react-router-dom';
import { ArrowRight, Camera, ClipboardCheck, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';

export function DashboardPage() {
  return (
    <div className="motion-page">
      <PageHeader title="Ready to study?" description="Start with a question you want to understand, or check work you have already completed." />
      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="overflow-hidden rounded-lg bg-ink p-5 text-white shadow-soft sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-xl">
              <p className="text-sm font-bold text-blue-200">Start with one clear question</p>
              <h2 className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl">Take a photo and understand every step.</h2>
              <p className="mt-3 text-sm font-medium leading-6 text-slate-300">StudyAI reads the question, explains the approach, and keeps the result ready for review.</p>
              <Link to="/upload" className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-bold text-ocean transition-colors hover:bg-blue-50">
                <Camera size={18} />
                Solve a question
                <ArrowRight size={17} />
              </Link>
            </div>
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-lg bg-white/10 text-blue-200 sm:grid">
              <Sparkles size={24} />
            </span>
          </div>
        </div>
        <AiUsageCard />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard to="/upload" icon={Camera} title="Solve homework" detail="Take a photo of one question and learn the solution step by step." tone="blue" />
        <ActionCard to="/grade" icon={ClipboardCheck} title="Check my work" detail="Upload completed work or check an answer to a saved question." tone="green" />
        <ActionCard to="/submissions" icon={Clock} title="Saved homework" detail="Review past questions, solutions, and feedback whenever you need them." tone="orange" />
      </div>
    </div>
  );
}

const tones = {
  blue: 'bg-blue-50 text-ocean',
  green: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-orange-50 text-orange-700',
};

function ActionCard({ to, icon: Icon, title, detail, tone }) {
  return (
    <Link to={to} className="smooth-card app-card group p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-lg ${tones[tone]}`}>
        <Icon size={23} />
      </span>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <ArrowRight size={18} className="text-slate-400 transition-colors group-hover:text-ocean" />
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detail}</p>
    </Link>
  );
}
