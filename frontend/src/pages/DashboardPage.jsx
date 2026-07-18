import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, BookOpen, Camera, ClipboardCheck, Clock, Sparkles, Star, TrendingUp } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import { PageHeader } from '../components/common/PageHeader';
import { AiUsageCard } from '../components/common/AiUsageCard';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [totalWork, setTotalWork] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    submissionApi.mine({ size: 100 })
      .then((page) => {
        setSubmissions(page.content || []);
        setTotalWork(page.totalElements ?? page.content?.length ?? 0);
      })
      .catch((err) => setError(apiMessage(err, 'Could not load your study dashboard')))
      .finally(() => setLoading(false));
  }, []);

  const stats = useMemo(() => buildDashboardStats(submissions, totalWork), [submissions, totalWork]);

  return (
    <div className="motion-page">
      <PageHeader title="Study home" description="Start a question, check completed work, or return to saved homework when you need it." />
      <ErrorBanner message={error} onDismiss={() => setError('')} />
      <div className="mb-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <section className="hero-card p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-56 w-56 -translate-y-20 translate-x-14 rounded-full bg-blue-100/80 blur-2xl" aria-hidden="true" />
          <div className="absolute bottom-0 right-24 h-40 w-40 translate-y-16 rounded-full bg-emerald-100/70 blur-2xl" aria-hidden="true" />
          <div className="relative grid gap-6 lg:grid-cols-[1fr_220px] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/78 px-3 py-1.5 text-xs font-extrabold text-ocean">
                <Sparkles size={14} />
                Best next step
              </div>
              <h2 className="mt-5 max-w-2xl text-3xl font-extrabold leading-[1.04] tracking-[-0.035em] text-ink sm:text-5xl">
                Welcome back{user?.fullName ? `, ${firstName(user.fullName)}` : ''}. What do you want to study?
              </h2>
              <p className="mt-4 max-w-xl text-sm font-semibold leading-7 text-slate-600 sm:text-base">
                Scan homework, check completed work, and use your saved history to keep study progress organized.
              </p>
              <div className="mt-6 grid gap-3 sm:flex">
                <Link to="/upload" className="primary-button px-5">
                  <Camera size={18} />
                  Solve now
                  <ArrowRight size={17} />
                </Link>
                <Link to="/grade" className="secondary-button px-5">
                  <ClipboardCheck size={18} />
                  Check work
                </Link>
              </div>
            </div>
            <div className="hidden rounded-[1.5rem] border border-blue-100 bg-white/80 p-4 shadow-[0_18px_50px_rgba(37,99,235,0.10)] lg:block">
              <div className="grid gap-3">
                <MiniStep icon={Camera} label="Scan" />
                <MiniStep icon={BookOpen} label="Understand" />
                <MiniStep icon={Star} label="Review later" />
              </div>
            </div>
          </div>
        </section>
        <AiUsageCard />
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total work" value={stats.totalWork} detail="Saved homework" />
        <MetricCard label="Solved today" value={stats.solvedToday} detail="Created today" />
        <MetricCard label="Favorites" value={stats.favorites} detail="Pinned for review" />
        <MetricCard label="Avg score" value={stats.averageScore === null ? '-' : `${stats.averageScore}/100`} detail="From graded work" />
      </div>

      <div className="mb-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="workspace-card">
          <div className="workspace-core p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow border-blue-100 bg-blue-50 text-ocean">Weekly activity</p>
                <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em] text-ink">Study rhythm</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-blue-50 text-ocean">
                <BarChart3 size={20} />
              </span>
            </div>
            {loading ? (
              <ChartSkeleton />
            ) : (
              <div className="mt-6 grid grid-cols-7 items-end gap-1.5 sm:gap-3">
                {stats.weeklyActivity.map((day) => (
                  <div key={day.label} className="grid min-w-0 gap-2 text-center">
                    <span className="text-xs font-extrabold tabular-nums text-slate-400" aria-label={`${day.count} saved item${day.count === 1 ? '' : 's'}`}>
                      {day.count}
                    </span>
                    <div className="flex h-28 items-end rounded-full bg-slate-100 p-1.5">
                      <div
                        className="w-full rounded-full bg-gradient-to-t from-sea to-sky-300"
                        style={{ height: `${Math.max(12, day.percent)}%` }}
                        title={`${day.count} item${day.count === 1 ? '' : 's'}`}
                      />
                    </div>
                    <span className="text-xs font-extrabold text-slate-500">{day.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="workspace-card">
          <div className="workspace-core p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow border-emerald-100 bg-emerald-50 text-emerald-700">Subjects</p>
                <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em] text-ink">Breakdown</h2>
              </div>
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-50 text-emerald-700">
                <TrendingUp size={20} />
              </span>
            </div>
            <div className="mt-5 grid gap-3">
              {loading ? <SubjectSkeleton /> : stats.subjectBreakdown.length ? stats.subjectBreakdown.map((subject) => (
                <div key={subject.name}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-sm font-extrabold">
                    <span className="truncate text-slate-700">{subject.name}</span>
                    <span className="text-slate-500">{subject.count}</span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-400" style={{ width: `${subject.percent}%` }} />
                  </div>
                </div>
              )) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                  Upload your first homework to see subjects here.
                </p>
              )}
            </div>
          </div>
        </section>
      </div>

      <div className="mb-6 grid items-stretch gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="workspace-card min-w-0 overflow-hidden">
          <div className="workspace-core p-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="eyebrow border-blue-100 bg-blue-50 text-ocean">Recent homework</p>
                <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em] text-ink">Continue where you left off</h2>
              </div>
              <Link to="/submissions" className="secondary-button shrink-0 px-3 text-sm">View all</Link>
            </div>
            <div className="mt-5 grid gap-3">
              {loading ? <RecentSkeleton /> : stats.recent.length ? stats.recent.map((item) => (
                <Link key={item.id} to={`/submissions/${item.id}`} className="group flex min-w-0 items-center gap-3 overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-3 transition-colors hover:border-blue-200 hover:bg-blue-50/50">
                  <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover shadow-sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink">{item.title || item.aiResponse?.detectedQuestion || `${item.subject.name} homework`}</p>
                    <p className="mt-1 text-xs font-bold text-slate-500">{item.subject.name} · {formatRelativeDate(item.createdAt)}</p>
                  </div>
                  <ArrowRight size={17} className="shrink-0 text-slate-400 transition-colors group-hover:text-ocean" />
                </Link>
              )) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm font-semibold leading-6 text-slate-500">
                  No saved homework yet. Solve your first question to build history.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="workspace-card min-w-0">
          <div className="workspace-core p-5">
            <p className="eyebrow border-amber-100 bg-amber-50 text-amber-700">Study tip</p>
            <h2 className="mt-3 text-xl font-extrabold tracking-[-0.025em] text-ink">{stats.tip.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-7 text-slate-600">{stats.tip.body}</p>
            <Link to={stats.tip.to} className="primary-button mt-5 w-full justify-center">
              {stats.tip.cta}
              <ArrowRight size={17} />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <ActionCard to="/upload" icon={Camera} title="Solve homework" detail="Take a photo of one question and learn the solution step by step." tone="blue" />
        <ActionCard to="/grade" icon={ClipboardCheck} title="Check my work" detail="Upload completed work or check an answer to a saved question." tone="green" />
        <ActionCard to="/submissions" icon={Clock} title="Saved homework" detail="Review past questions, solutions, and feedback whenever you need them." tone="orange" />
      </div>
    </div>
  );
}

const tones = {
  blue: 'bg-blue-50 text-ocean',
  green: 'bg-emerald-50 text-emerald-700',
  orange: 'bg-amber-50 text-amber-700',
};

function ActionCard({ to, icon: Icon, title, detail, tone }) {
  return (
    <Link to={to} className="smooth-card workspace-card group min-w-0">
      <div className="workspace-core p-5">
      <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}>
        <Icon size={23} />
      </span>
      <div className="mt-4 flex items-center justify-between gap-3">
        <h3 className="text-lg font-extrabold">{title}</h3>
        <ArrowRight size={18} className="text-slate-400 transition-colors group-hover:text-ocean" />
      </div>
      <p className="mt-2 text-sm font-medium leading-6 text-slate-600">{detail}</p>
      </div>
    </Link>
  );
}

function MiniStep({ icon: Icon, label }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-3 text-sm font-extrabold text-slate-700">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-ocean">
        <Icon size={18} />
      </span>
      {label}
    </div>
  );
}

function MetricCard({ label, value, detail }) {
  return (
    <article className="workspace-card min-w-0">
      <div className="workspace-core p-4">
        <p className="text-sm font-extrabold text-slate-500">{label}</p>
        <p className="mt-2 text-3xl font-extrabold tracking-[-0.045em] text-ink">{value}</p>
        <p className="mt-1 text-xs font-bold text-slate-500">{detail}</p>
      </div>
    </article>
  );
}

function buildDashboardStats(items, totalWork) {
  const todayKey = dateKey(new Date());
  const recent = items.slice(0, 3);
  const solvedToday = items.filter((item) => dateKey(new Date(item.createdAt)) === todayKey).length;
  const favorites = items.filter((item) => item.favorite).length;
  const scores = items.flatMap((item) => item.gradingResults || [])
    .map((result) => Number(result.score))
    .filter((score) => Number.isFinite(score));
  const averageScore = scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;
  const weeklyActivity = buildWeeklyActivity(items);
  const subjectBreakdown = buildSubjectBreakdown(items);

  return {
    totalWork,
    solvedToday,
    favorites,
    averageScore,
    weeklyActivity,
    subjectBreakdown,
    recent,
    tip: pickStudyTip({ totalWork, averageScore, favorites, recentCount: recent.length }),
  };
}

function buildWeeklyActivity(items) {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - 6);
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return {
      key: dateKey(date),
      label: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 3),
      count: 0,
    };
  });
  const dayMap = new Map(days.map((day) => [day.key, day]));
  items.forEach((item) => {
    const key = dateKey(new Date(item.createdAt));
    if (dayMap.has(key)) {
      dayMap.get(key).count += 1;
    }
  });
  const max = Math.max(1, ...days.map((day) => day.count));
  return days.map((day) => ({ ...day, percent: (day.count / max) * 100 }));
}

function buildSubjectBreakdown(items) {
  const counts = new Map();
  items.forEach((item) => {
    const name = item.subject?.name || 'Other';
    counts.set(name, (counts.get(name) || 0) + 1);
  });
  const max = Math.max(1, ...counts.values());
  return Array.from(counts, ([name, count]) => ({ name, count, percent: Math.max(8, (count / max) * 100) }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function pickStudyTip({ totalWork, averageScore, favorites, recentCount }) {
  if (!recentCount) {
    return {
      title: 'Start with one clear question',
      body: 'Upload a single, well-lit question photo first. You will get cleaner explanations and a stronger history page.',
      cta: 'Solve first question',
      to: '/upload',
    };
  }
  if (!favorites) {
    return {
      title: 'Pin useful homework',
      body: 'Use favorites for questions you want to review before tests. They become easier to find in History.',
      cta: 'Open history',
      to: '/submissions',
    };
  }
  if (averageScore !== null && averageScore < 80) {
    return {
      title: 'Review mistakes first',
      body: 'Your checked work shows room to improve. Revisit feedback and retry one similar problem today.',
      cta: 'Check work',
      to: '/grade',
    };
  }
  return {
    title: totalWork > 10 ? 'Keep the streak useful' : 'Build a review habit',
    body: 'Save each solved question with a short title or favorite marker so future review takes seconds.',
    cta: 'Continue studying',
    to: '/upload',
  };
}

function dateKey(date) {
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function firstName(fullName) {
  return fullName.trim().split(/\s+/).slice(-1)[0] || fullName;
}

function formatRelativeDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ChartSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-7 items-end gap-1.5 sm:gap-3">
      {[32, 48, 76, 42, 64, 28, 54].map((height, index) => (
        <div key={index} className="grid min-w-0 gap-2 text-center">
          <span className="mx-auto h-3 w-4 rounded-full bg-slate-100" />
          <div className="flex h-28 items-end rounded-full bg-slate-100 p-1.5">
            <div className="w-full animate-pulse rounded-full bg-slate-200" style={{ height: `${height}%` }} />
          </div>
          <span className="mx-auto h-3 w-8 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function SubjectSkeleton() {
  return Array.from({ length: 4 }, (_, index) => (
    <div key={index} className="animate-pulse">
      <div className="mb-2 h-4 w-24 rounded-full bg-slate-100" />
      <div className="h-2.5 rounded-full bg-slate-100" />
    </div>
  ));
}

function RecentSkeleton() {
  return Array.from({ length: 3 }, (_, index) => (
    <div key={index} className="flex animate-pulse items-center gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 p-3">
      <div className="h-14 w-14 rounded-2xl bg-slate-100" />
      <div className="flex-1">
        <div className="h-4 w-2/3 rounded-full bg-slate-100" />
        <div className="mt-2 h-3 w-1/3 rounded-full bg-slate-100" />
      </div>
    </div>
  ));
}
