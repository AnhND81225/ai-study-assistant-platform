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
      <div className="surface-panel border-dashed px-4 py-3 text-sm font-semibold text-slate-500">
        {error}
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="surface-panel border-dashed px-4 py-3 text-sm font-semibold text-slate-500">
        Loading AI quota...
      </div>
    );
  }

  const percent = quota.dailyLimit > 0 ? Math.min(100, (quota.usedToday / quota.dailyLimit) * 100) : 0;

  return (
    <div className={`app-card overflow-hidden border-blue-100 bg-white ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold text-slate-600">Solutions available today</p>
          <p className="mt-1 text-2xl font-extrabold text-ink">
            {quota.remainingToday}
            <span className="text-base font-bold text-slate-500"> of {quota.dailyLimit} left</span>
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-ocean">
          <Gauge size={20} />
        </span>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-blue-100">
        <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">
        {quota.usedToday} used today. Your allowance resets daily.
      </p>
    </div>
  );
}
