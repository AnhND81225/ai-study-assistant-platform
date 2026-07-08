import { Link } from 'react-router-dom';
import { ArrowRight, Camera, ClipboardCheck, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';

export function DashboardPage() {
  return (
    <div className="motion-page">
      <PageHeader title="Ready to study?" description="Start with a question you want to understand, or check work you have already completed." />
      <div className="mb-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="app-card relative overflow-hidden border-blue-100 bg-white/92 p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-44 w-44 -translate-y-16 translate-x-12 rounded-full bg-blue-100/70 blur-2xl" aria-hidden="true" />
          <div className="flex items-start justify-between gap-4">
            <div className="relative max-w-xl">
              <p className="eyebrow">Best next step</p>
              <h2 className="mt-4 text-3xl font-extrabold leading-[1.05] text-ink sm:text-4xl">Solve one question now, save the explanation forever.</h2>
              <p className="mt-4 text-sm font-semibold leading-7 text-slate-600">StudyAI reads the question, explains the approach, and keeps the result ready for review.</p>
              <Link to="/upload" className="primary-button mt-5 px-4">
                <Camera size={18} />
                Solve a question
                <ArrowRight size={17} />
              </Link>
            </div>
            <span className="hidden h-14 w-14 shrink-0 place-items-center rounded-lg bg-blue-50 text-ocean sm:grid">
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
  orange: 'bg-amber-50 text-amber-700',
};

function ActionCard({ to, icon: Icon, title, detail, tone }) {
  return (
    <Link to={to} className="smooth-card app-card group p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}>
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
