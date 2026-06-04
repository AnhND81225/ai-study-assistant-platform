import { Gauge } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiUsageApi } from '../../api/aiUsageApi';

export function AiUsageCard({ compact = false }) {
  const [quota, setQuota] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    aiUsageApi.mine()
      .then(setQuota)
      .catch(() => setError('AI quota unavailable'));
  }, []);

  if (error) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
        {error}
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
        Loading AI quota...
      </div>
    );
  }

  const percent = quota.dailyLimit > 0 ? Math.min(100, (quota.usedToday / quota.dailyLimit) * 100) : 0;

  return (
    <div className={`rounded-lg border border-slate-200 bg-white ${compact ? 'p-4' : 'p-5'} shadow-soft`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-500">Daily explanation quota</p>
          <p className="mt-1 text-2xl font-black text-ink">
            {quota.remainingToday}
            <span className="text-base font-bold text-slate-500">/{quota.dailyLimit} left</span>
          </p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-mint text-sea">
          <Gauge size={20} />
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        Used {quota.usedToday} today. Resets daily.
      </p>
    </div>
  );
}
