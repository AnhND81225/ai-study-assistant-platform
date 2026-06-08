import { Link, Navigate } from 'react-router-dom';
import { ArrowRight, BookOpen, Camera, CheckCircle2, ClipboardCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl content-between px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 font-extrabold">
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-sea text-white shadow-glow">
              <BookOpen size={20} />
            </span>
            <span className="text-lg">StudyAI</span>
          </div>
          <Link to="/login" className="rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-bold transition-colors hover:bg-white/15">
            Sign in
          </Link>
        </div>

        <div className="grid items-center gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="max-w-2xl">
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-normal sm:text-6xl">
              Understand homework, one clear step at a time.
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-8 text-slate-300">
              Take a photo of a question, learn how to solve it, check completed work, and return to every result when you need it.
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link to="/register" className="primary-button bg-white px-6 text-ocean shadow-none hover:bg-blue-50">
                Start studying
                <ArrowRight size={17} />
              </Link>
              <Link to="/login" className="secondary-button border-white/20 bg-white/10 px-6 text-white hover:border-white/40 hover:bg-white/15 hover:text-white">
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="relative rounded-lg border border-white/15 bg-white p-4 text-ink shadow-glow">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-500">Your study workspace</p>
                  <h2 className="text-xl font-extrabold">What do you need?</h2>
                </div>
                <img src="/app-icon.svg" alt="StudyAI app icon" className="h-11 w-11 rounded-2xl" />
              </div>
              <div className="grid gap-3">
                <PhoneCard icon={Camera} title="Solve a question" detail="Take a clear photo from your phone" />
                <PhoneCard icon={BookOpen} title="Learn each step" detail="Read clear formulas and explanations" />
                <PhoneCard icon={ClipboardCheck} title="Check your work" detail="See your score, mistakes, and next steps" />
              </div>
              <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                <div className="flex items-center gap-2 text-sm font-extrabold text-emerald-700">
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

        <div className="grid gap-3 border-t border-white/10 pb-2 pt-5 text-sm font-bold text-slate-300 sm:grid-cols-3">
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
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-blue-50 text-ocean">
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
