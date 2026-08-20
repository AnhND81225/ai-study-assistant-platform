import { Gauge } from 'lucide-react';
import { useEffect, useState } from 'react';
import { aiUsageApi } from '../../api/aiUsageApi';
import { useAuth } from '../../auth/AuthContext';

const AI_USAGE_CACHE_TTL_MS = 60_000;
const aiUsageCache = new Map();

export function AiUsageCard({ compact = false }) {
  const { user } = useAuth();
  const cacheKey = aiUsageCacheKey(user);
  const cachedQuota = readAiUsageCache(cacheKey);
  const [quota, setQuota] = useState(() => cachedQuota?.quota || null);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    const cached = readAiUsageCache(cacheKey);

    if (cached) {
      setQuota(cached.quota);
    }

    if (cached && Date.now() - cached.savedAt < AI_USAGE_CACHE_TTL_MS) {
      return () => {
        ignore = true;
      };
    }

    aiUsageApi.mine()
      .then((nextQuota) => {
        if (ignore) return;
        setQuota(nextQuota);
        aiUsageCache.set(cacheKey, {
          quota: nextQuota,
          savedAt: Date.now(),
        });
      })
      .catch(() => {
        if (!ignore && !cached) setError('AI quota unavailable');
      });

    return () => {
      ignore = true;
    };
  }, [cacheKey]);

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
    <div className={`workspace-card overflow-hidden border-blue-100 ${compact ? '' : ''}`}>
      <div className={`workspace-core ${compact ? 'p-4' : 'p-5'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow border-slate-200 text-slate-500">Daily AI limit</p>
            <p className="mt-3 text-3xl font-extrabold leading-none tracking-[-0.04em] text-ink">
              {quota.remainingToday}
              <span className="text-base font-extrabold tracking-normal text-slate-500"> of {quota.dailyLimit}</span>
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
    </div>
  );
}

function aiUsageCacheKey(user) {
  return user?.id ?? user?.email ?? user?.username ?? 'current-user';
}

function readAiUsageCache(cacheKey) {
  return aiUsageCache.get(cacheKey) || null;
}
