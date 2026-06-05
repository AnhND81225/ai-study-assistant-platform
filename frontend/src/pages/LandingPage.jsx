import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Camera, CheckCircle2, ClipboardCheck, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen overflow-hidden bg-sea text-white">
      <section className="mx-auto grid min-h-screen w-full max-w-5xl content-between px-5 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/20">
              <BookOpen size={20} />
            </span>
            StudyAI
          </div>
          <Link to="/login" className="rounded-full bg-white/15 px-4 py-2 text-sm font-black backdrop-blur">
            Sign in
          </Link>
        </div>

        <div className="grid items-center gap-8 py-8 lg:grid-cols-[1fr_390px]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-2 text-sm font-black">
              <Sparkles size={16} />
              Mobile-first AI study helper
            </div>
            <h1 className="text-5xl font-black leading-[1.02] tracking-normal sm:text-6xl">
              Turn homework photos into clear study steps.
            </h1>
            <p className="mt-5 max-w-xl text-base font-semibold leading-8 text-white/82">
              Photograph a question, learn the solution step by step, check completed work, and keep every result in one private study history.
            </p>
            <div className="mt-8 grid gap-3 sm:flex">
              <Link to="/register" className="primary-button bg-white px-6 text-ocean shadow-none hover:bg-sky-50">
                Create account
              </Link>
              <Link to="/login" className="secondary-button border-white/40 bg-white/10 px-6 text-white hover:border-white hover:text-white">
                Sign in
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[360px]">
            <div className="relative rounded-[2rem] border border-white/20 bg-white p-4 text-ink shadow-glow">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-sea">Today</p>
                  <h2 className="text-xl font-black">Study plan</h2>
                </div>
                <img src="/app-icon.svg" alt="StudyAI app icon" className="h-11 w-11 rounded-2xl" />
              </div>
              <div className="grid gap-3">
                <PhoneCard icon={Camera} title="Solve a question" detail="Take a clear photo from your phone" />
                <PhoneCard icon={BookOpen} title="Learn each step" detail="Read clear formulas and explanations" />
                <PhoneCard icon={ClipboardCheck} title="Check your work" detail="See your score, mistakes, and next steps" />
              </div>
              <div className="mt-4 rounded-2xl bg-mint p-4">
                <div className="flex items-center gap-2 text-sm font-black text-ocean">
                  <ShieldCheck size={17} />
                  Private by default
                </div>
                <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                  Only you can open your saved questions, explanations, and grading results.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-3 pb-2 text-sm font-black text-white/88 sm:grid-cols-3">
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
    <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-paper p-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sea text-white">
        <Icon size={19} />
      </span>
      <div>
        <p className="font-black">{title}</p>
        <p className="text-sm font-semibold text-slate-500">{detail}</p>
      </div>
    </div>
  );
}

function LandingPoint({ label }) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/12 px-3 py-2">
      <CheckCircle2 size={16} />
      {label}
    </div>
  );
}
