import { Link } from 'react-router-dom';
import { Camera, ClipboardCheck, Clock } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Study dashboard" description="Choose a focused AI workflow, then review saved results from your private history." />
      <div className="mb-4">
        <AiUsageCard />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/upload" className="smooth-card rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Camera className="text-sea" size={28} />
          <h3 className="mt-4 text-lg font-bold">Explain question</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Upload a homework question image and generate a step-by-step explanation.</p>
        </Link>
        <Link to="/grade" className="smooth-card rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <ClipboardCheck className="text-sea" size={28} />
          <h3 className="mt-4 text-lg font-bold">Grade answer</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Pick an explained submission, enter the student answer, and get feedback.</p>
        </Link>
        <Link to="/submissions" className="smooth-card rounded-lg border border-slate-200 bg-white p-5">
          <Clock className="text-warn" size={28} />
          <h3 className="mt-4 text-lg font-bold">Review history</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Open past submissions, explanations, and grading results.</p>
        </Link>
      </div>
    </div>
  );
}
