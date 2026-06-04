import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { ArrowRight, Plus } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';

export function HistoryPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    submissionApi.mine()
      .then((page) => setItems(page.content || []))
      .catch((err) => setError(apiMessage(err, 'Could not load history')));
  }, []);

  return (
    <div>
      <PageHeader title="Submission history" description="Your uploaded homework questions and AI results." action={<Link to="/upload" className="primary-button"><Plus size={17} />New upload</Link>} />
      <ErrorBanner message={error} />
      {items.length === 0 && !error ? (
        <EmptyState title="No submissions yet" description="Upload your first homework image to generate an explanation." action={<Link to="/upload" className="primary-button">Upload homework</Link>} />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link key={item.id} to={`/submissions/${item.id}`} className="smooth-card app-card p-4">
              <div className="flex items-start gap-3">
                <img src={item.imageUrl} alt={`Submission ${item.id}`} className="h-20 w-20 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold">{item.subject.name}</h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.aiResponse?.detectedQuestion || item.note || 'Tap to view details'}</p>
                </div>
                <ArrowRight className="mt-1 shrink-0 text-sea" size={18} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
