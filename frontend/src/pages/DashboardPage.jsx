import { Link } from 'react-router-dom';
import { Camera, CheckCircle2, ClipboardCheck, Clock, Sparkles } from 'lucide-react';
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
        <ActionCard to="/upload" icon={Camera} title="Solve a question" detail="Photograph one question and learn the solution step by step." />
        <ActionCard to="/grade" icon={ClipboardCheck} title="Check student work" detail="Grade a complete worksheet or an answer to a saved question." />
        <ActionCard to="/submissions" icon={Clock} title="Review history" detail="Open past submissions, explanations, grading results, and delete old work." />
      </div>
      <section className="mt-5 border-t border-sky-100 pt-5">
        <p className="text-sm font-black text-ink">Your first result takes three simple steps</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <OnboardingStep number="1" title="Choose a workflow" detail="Solve a question or check completed work." />
          <OnboardingStep number="2" title="Take a clear photo" detail="Keep the full question visible and avoid shadows." />
          <OnboardingStep number="3" title="Review and improve" detail="Read the steps, score, and focused feedback." />
        </div>
      </section>
    </div>
  );
}

function OnboardingStep({ number, title, detail }) {
  return (
    <div className="flex gap-3 rounded-lg border border-sky-100 bg-white p-4">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-mint text-sm font-black text-ocean">
        {number === '3' ? <CheckCircle2 size={17} /> : number}
      </span>
      <div>
        <p className="font-black text-ink">{title}</p>
        <p className="mt-1 text-sm font-semibold leading-5 text-slate-500">{detail}</p>
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
