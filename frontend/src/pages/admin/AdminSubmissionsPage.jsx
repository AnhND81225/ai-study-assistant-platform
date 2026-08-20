import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { submissionApi } from '../../api/submissionApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { StatusPill } from '../../components/common/StatusPill';

export function AdminSubmissionsPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    submissionApi.adminList()
      .then((page) => setItems(page.content || []))
      .catch((err) => setError(apiMessage(err, 'Could not load submissions')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="All submissions" description="Admin-only view of submission activity." />
      <ErrorBanner message={error} />
      {loading ? (
        <div className="surface-panel border-dashed p-4 text-sm font-bold text-slate-500">Loading submissions...</div>
      ) : items.length === 0 && !error ? (
        <EmptyState title="No submissions yet" description="Student uploads will appear here when they start using the app." />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <Link key={item.id} to={`/submissions/${item.id}`} className="smooth-card workspace-card">
              <div className="workspace-core p-4">
              <div className="flex items-center gap-3">
                <img src={item.imageUrl} alt="" className="h-16 w-16 rounded-2xl object-cover shadow-[0_12px_28px_rgba(15,23,42,0.10)]" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-extrabold">{item.subject.name}</h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-1 truncate text-sm font-medium text-slate-600">{item.userEmail}</p>
                </div>
              </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
