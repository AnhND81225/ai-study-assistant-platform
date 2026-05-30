import { Link } from 'react-router-dom';
import { Camera, Clock, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/common/PageHeader';

export function DashboardPage() {
  return (
    <div>
      <PageHeader title="Study dashboard" description="Start with a homework image, then review explanations and grading feedback from your private history." />
      <div className="grid gap-4 md:grid-cols-3">
        <Link to="/upload" className="rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <Camera className="text-sea" size={28} />
          <h3 className="mt-4 text-lg font-bold">Upload question</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use camera or gallery on mobile. JPG, PNG, and WebP are supported.</p>
        </Link>
        <Link to="/submissions" className="rounded-lg border border-slate-200 bg-white p-5">
          <Clock className="text-warn" size={28} />
          <h3 className="mt-4 text-lg font-bold">Review history</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Open past submissions, explanations, and grading results.</p>
        </Link>
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <Sparkles className="text-sea" size={28} />
          <h3 className="mt-4 text-lg font-bold">AI workflow</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Explanations and grading require internet and a configured backend AI key.</p>
        </div>
      </div>
    </div>
  );
}
