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
      <div className="app-card px-4 py-3 text-sm font-bold text-slate-500">
        {error}
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="app-card px-4 py-3 text-sm font-bold text-slate-500">
        Loading AI quota...
      </div>
    );
  }

  const percent = quota.dailyLimit > 0 ? Math.min(100, (quota.usedToday / quota.dailyLimit) * 100) : 0;

  return (
    <div className={`app-card overflow-hidden ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-black text-slate-500">Daily explanation quota</p>
          <p className="mt-1 text-2xl font-black text-ink">
            {quota.remainingToday}
            <span className="text-base font-black text-slate-500">/{quota.dailyLimit} left</span>
          </p>
        </div>
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-mint text-ocean">
          <Gauge size={20} />
        </span>
      </div>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-sky-100">
        <div className="h-full rounded-full bg-sea transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-2 text-xs font-bold text-slate-500">
        Used {quota.usedToday} today. Resets daily.
      </p>
    </div>
  );
}
