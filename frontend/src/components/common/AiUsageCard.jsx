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
      <div className="surface-panel border-dashed px-5 py-4 text-sm font-bold text-slate-500">
        {error}
      </div>
    );
  }

  if (!quota) {
    return (
      <div className="surface-panel border-dashed px-5 py-4 text-sm font-bold text-slate-500">
        Loading AI quota...
      </div>
    );
  }

  const percent = quota.dailyLimit > 0 ? Math.min(100, (quota.usedToday / quota.dailyLimit) * 100) : 0;

  return (
    <div className={`app-card smooth-card overflow-hidden border-blue-100 bg-white/92 ${compact ? 'p-4' : 'p-5'}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow border-slate-200 text-slate-500">Daily AI limit</p>
          <p className="mt-3 text-3xl font-extrabold leading-none text-ink">
            {quota.remainingToday}
            <span className="text-base font-extrabold text-slate-500"> of {quota.dailyLimit}</span>
          </p>
        </div>
        <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-ocean shadow-inner">
          <Gauge size={20} />
        </span>
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-blue-100/80">
        <div className="h-full rounded-full bg-gradient-to-r from-sea to-sky-400 transition-all" style={{ width: `${percent}%` }} />
      </div>
      <p className="mt-3 text-xs font-bold leading-5 text-slate-500">
        {quota.usedToday} used today. Your allowance resets daily.
      </p>
    </div>
  );
}
