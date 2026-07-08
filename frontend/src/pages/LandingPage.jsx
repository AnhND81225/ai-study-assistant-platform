import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Camera, CheckCircle2, ClipboardCheck, LockKeyhole, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-[100dvh] overflow-hidden text-ink">
      <section className="mx-auto grid min-h-[100dvh] w-full max-w-6xl content-between px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-extrabold">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
              <BookOpen size={20} />
            </span>
            <span className="text-lg">StudyAI</span>
          </div>
          <Link to="/login" className="secondary-button px-5">
            Sign in
          </Link>
        </div>

        <div className="grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_430px] lg:py-14">
          <div className="max-w-2xl">
            <p className="eyebrow mb-5">
              <LockKeyhole size={14} />
              Private study workspace
            </p>
            <h1 className="text-5xl font-extrabold leading-[0.98] tracking-normal text-ink sm:text-7xl">
              Understand homework, one clear step at a time.
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
              Take a photo of a question, learn how to solve it, check completed work, and return to every result when you need it.
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link to="/register" className="primary-button px-6">
                Start studying
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="secondary-button px-6">
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="absolute -right-4 -top-5 h-28 w-28 rounded-[2rem] border border-blue-100 bg-blue-50/80" aria-hidden="true" />
            <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-[2rem] border border-slate-200 bg-white/70" aria-hidden="true" />
            <div className="premium-shell relative rounded-[2rem]">
            <div className="relative rounded-[1.55rem] border border-slate-200/70 bg-white/92 p-5 text-ink shadow-[0_32px_80px_rgba(15,23,42,0.16)]">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="eyebrow border-slate-200 text-slate-500">Today</p>
                  <h2 className="mt-3 text-2xl font-extrabold">Study plan</h2>
                </div>
                <img src="/app-icon.svg" alt="StudyAI app icon" className="h-11 w-11 rounded-2xl" />
              </div>
              <div className="grid gap-3">
                <PhoneCard icon={Camera} title="Solve a question" detail="Take a clear photo from your phone" />
                <PhoneCard icon={BookOpen} title="Learn each step" detail="Read clear formulas and explanations" />
                <PhoneCard icon={ClipboardCheck} title="Check your work" detail="See your score, mistakes, and next steps" />
              </div>
              <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-ocean">
                  <ShieldCheck size={17} />
                  Private by default
                </div>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
                  Only you can open your saved questions, explanations, and grading results.
                </p>
              </div>
            </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 border-t border-slate-200/70 pb-2 pt-5 text-sm font-extrabold text-slate-600 sm:grid-cols-3">
          <LandingPoint label="Install on your phone" />
          <LandingPoint label="Private study history" />
          <LandingPoint label="Clear math formatting" />
        </div>
      </section>
    </main>
  );
}

function PhoneCard({ icon: Icon, title, detail }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/90 p-3 transition-transform duration-300 hover:-translate-y-0.5">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-ocean">
        <Icon size={19} />
      </span>
      <div>
        <p className="font-extrabold">{title}</p>
        <p className="text-sm font-medium text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function LandingPoint({ label }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={16} />
      {label}
    </div>
  );
}
