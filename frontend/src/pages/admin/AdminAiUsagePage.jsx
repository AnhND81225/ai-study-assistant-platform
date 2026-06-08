import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { PageHeader } from '../../components/common/PageHeader';

export function AdminAiUsagePage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.aiUsage()
      .then((page) => setItems(page.content || []))
      .catch((err) => setError(apiMessage(err, 'Could not load AI usage logs')));
  }, []);

  return (
    <div>
      <PageHeader title="AI usage logs" description="Model calls, status, and token usage when available." />
      <ErrorBanner message={error} />
      <div className="grid gap-3">
        {items.map((item) => (
          <article key={item.id} className="app-card p-4">
            <div className="flex flex-wrap justify-between gap-2">
              <h3 className="font-extrabold">{item.requestType}</h3>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-600">Model: {item.modelName || '-'}</p>
            <p className="text-sm font-medium text-slate-600">Tokens: {(item.inputTokens || 0) + (item.outputTokens || 0)}</p>
            {item.errorMessage ? <p className="mt-2 text-sm text-red-700">{item.errorMessage}</p> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
