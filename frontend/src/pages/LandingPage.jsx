import { Link, Navigate } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  FlaskConical,
  GraduationCap,
  PenLine,
  Sparkles,
  TerminalSquare,
} from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

const steps = [
  {
    number: '01',
    icon: Camera,
    title: 'Take a clear photo',
    description: 'Use your phone camera or gallery. Keep the full question visible so StudyAI can read it well.',
  },
  {
    number: '02',
    icon: BookOpen,
    title: 'Get guided solution',
    description: 'Review the detected question, step-by-step explanation, and final answer in one clean view.',
  },
  {
    number: '03',
    icon: ClipboardCheck,
    title: 'Check your answer',
    description: 'Compare completed work against the expected solution and get focused feedback.',
  },
];

const subjects = [
  { label: 'Math', icon: GraduationCap },
  { label: 'English', icon: PenLine },
  { label: 'Physics', icon: Sparkles },
  { label: 'Chemistry', icon: FlaskConical },
  { label: 'Programming', icon: TerminalSquare },
  { label: 'Other', icon: FileText },
];

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="landing-page min-h-[100dvh] overflow-hidden text-ink">
      <section className="mx-auto flex min-h-[100dvh] w-full max-w-6xl flex-col px-5 pb-12 pt-5 sm:px-6 lg:pb-16">
        <header className="landing-nav flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2.5 font-extrabold" aria-label="StudyAI home">
            <span className="grid h-11 w-11 place-items-center rounded-[1.05rem] bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
              <BookOpen size={20} strokeWidth={2.1} />
            </span>
            <span className="text-lg tracking-[-0.02em]">StudyAI</span>
          </Link>

          <nav className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/75 p-1 text-sm font-extrabold shadow-[0_14px_40px_rgba(15,23,42,0.08)] sm:flex">
            <a href="#how-it-works" className="rounded-full px-4 py-3 text-slate-700 transition hover:bg-blue-50 hover:text-ocean">
              How it works
            </a>
            <Link to="/login" className="rounded-full px-4 py-3 text-slate-700 transition hover:bg-blue-50 hover:text-ocean">
              Sign in
            </Link>
            <Link to="/register" className="rounded-full bg-sea px-5 py-3 text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)] transition hover:bg-ocean">
              Start
            </Link>
          </nav>

          <Link to="/login" className="secondary-button px-5 sm:hidden">
            Sign in
          </Link>
        </header>

        <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[minmax(0,0.96fr)_minmax(360px,0.74fr)] lg:gap-14 lg:py-16">
          <div className="max-w-2xl">
            <div className="fade-in inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/75 px-3.5 py-2 text-xs font-extrabold text-ocean shadow-[0_12px_32px_rgba(37,99,235,0.08)]">
              <Sparkles size={15} strokeWidth={2.1} />
              AI study assistant
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-extrabold leading-[0.98] tracking-[-0.035em] text-ink sm:text-6xl lg:text-7xl">
              Your homework photo, explained clearly.
            </h1>
            <p className="mt-6 max-w-xl text-base font-semibold leading-8 text-slate-600 sm:text-lg">
              Upload a question, get step-by-step help, and check your answer with focused feedback.
            </p>

            <div className="mt-8 grid gap-3 sm:flex">
              <Link to="/register" className="primary-button group px-6">
                Start studying
                <span className="grid h-8 w-8 place-items-center rounded-full bg-white/18 transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1">
                  <ArrowRight size={17} />
                </span>
              </Link>
              <Link to="/login" className="secondary-button px-6">
                Sign in
              </Link>
            </div>

            <div className="mt-8 grid gap-3 text-sm font-extrabold text-slate-700 sm:grid-cols-3">
              <LandingPoint label="Phone photos" />
              <LandingPoint label="Private history" />
              <LandingPoint label="Answer checking" />
            </div>
          </div>

          <HeroPreview />
        </div>
      </section>

      <section id="how-it-works" className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-[-0.035em] text-ink sm:text-5xl">How StudyAI helps</h2>
          <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
            A simple flow for everyday homework: capture the question, learn the steps, then improve your answer.
          </p>
        </div>

        <div className="mt-10 grid gap-5 lg:gap-6">
          {steps.map((step, index) => (
            <StepPanel key={step.title} step={step} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="rounded-[2.25rem] border border-white/80 bg-white/70 p-2 shadow-[0_30px_90px_rgba(15,23,42,0.10)]">
          <div className="rounded-[1.8rem] bg-white p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:p-8 lg:p-10">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-5xl">Choose what you need</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-slate-600">
                Start with a homework photo, then choose whether you want a solution or feedback.
              </p>
            </div>

            <div className="mt-9 grid gap-5 md:grid-cols-2">
              <WorkflowCard
                icon={BookOpen}
                title="Solve a question"
                description="Upload the question image and StudyAI explains the solution in clear steps."
                action="Try Solve"
                to="/register"
              />
              <WorkflowCard
                icon={ClipboardCheck}
                title="Check completed work"
                description="Upload or type your answer, then get feedback, score, and improvement tips."
                action="Try Check"
                to="/register"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-6 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-[0.82fr_1fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-0.035em] sm:text-5xl">Built for daily study</h2>
            <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-slate-600">
              Save your work, review old answers, and continue learning from your study history.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {subjects.map((subject) => (
              <SubjectPill key={subject.label} subject={subject} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-5 pb-20 pt-10 sm:px-6 lg:pb-24">
        <div className="overflow-hidden rounded-[2.25rem] bg-ink p-2 text-white shadow-[0_34px_100px_rgba(15,23,42,0.24)]">
          <div className="relative rounded-[1.8rem] border border-white/10 bg-[radial-gradient(circle_at_10%_0%,rgba(96,165,250,0.28),transparent_26rem),linear-gradient(135deg,#122033,#0f172a)] p-7 sm:p-10 lg:p-12">
            <div className="absolute right-8 top-8 hidden h-20 w-20 rounded-full border border-white/15 bg-white/10 lg:block" aria-hidden="true" />
            <div className="relative max-w-2xl">
              <p className="text-sm font-extrabold text-blue-100">Ready when your next question is.</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.035em] sm:text-5xl">Ready to study smarter?</h2>
              <p className="mt-4 text-base font-semibold leading-7 text-blue-50/85">
                Create an account, upload a homework photo, and keep every result in one private study space.
              </p>
              <div className="mt-7 grid gap-3 sm:flex">
                <Link to="/register" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-extrabold text-ink transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5">
                  Create free account
                  <ArrowRight size={17} />
                </Link>
                <Link to="/login" className="inline-flex min-h-12 items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 text-sm font-extrabold text-white transition duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 hover:bg-white/16">
                  I already have an account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[400px] lg:max-w-[420px]">
      <div className="absolute -left-5 top-10 h-28 w-28 rounded-[2rem] border border-blue-100 bg-blue-50/80" aria-hidden="true" />
      <div className="absolute -right-4 bottom-16 h-32 w-32 rounded-[2rem] border border-emerald-100 bg-emerald-50/80" aria-hidden="true" />
      <div className="relative rounded-[2.35rem] border border-slate-900/10 bg-slate-950 p-2 shadow-[0_36px_90px_rgba(15,23,42,0.24)]">
        <div className="overflow-hidden rounded-[1.85rem] bg-slate-50 p-4">
          <div className="mx-auto mb-4 h-1.5 w-16 rounded-full bg-slate-300" aria-hidden="true" />
          <div className="rounded-[1.45rem] bg-white p-4 shadow-[0_20px_50px_rgba(15,23,42,0.10)]">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-slate-400">Homework preview</p>
                <h2 className="mt-1 text-lg font-extrabold tracking-[-0.02em]">Uploaded question</h2>
              </div>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">Ready</span>
            </div>

            <div className="rounded-[1.2rem] border border-slate-200 bg-[linear-gradient(90deg,rgba(148,163,184,0.16)_1px,transparent_1px),linear-gradient(rgba(148,163,184,0.16)_1px,transparent_1px)] bg-[length:22px_22px] p-4">
              <div className="grid gap-3 font-extrabold text-slate-700">
                <div className="h-3 w-3/4 rounded-full bg-slate-300" />
                <div className="flex items-center gap-2">
                  <span>3x</span>
                  <span className="h-0.5 w-10 bg-slate-500" />
                  <span>12 = 24</span>
                </div>
                <div className="h-3 w-2/3 rounded-full bg-slate-200" />
              </div>
            </div>

            <div className="mt-4 rounded-[1.2rem] border border-blue-100 bg-blue-50/80 p-4">
              <div className="flex items-center gap-2 text-sm font-extrabold text-ocean">
                <CheckCircle2 size={16} />
                AI result
              </div>
              <div className="mt-3 grid gap-2 text-sm font-bold text-slate-700">
                <PreviewRow label="Detected question" />
                <PreviewRow label="Step-by-step solution" />
                <PreviewRow label="Final answer ready" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepPanel({ step, index }) {
  const Icon = step.icon;
  const alignRight = index % 2 === 1;

  return (
    <article className={`landing-step grid gap-5 rounded-[2rem] border border-white/80 bg-white/78 p-2 shadow-[0_22px_70px_rgba(15,23,42,0.08)] lg:grid-cols-[1fr_0.85fr] ${alignRight ? 'lg:grid-flow-col-dense' : ''}`}>
      <div className={`rounded-[1.55rem] bg-white p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] sm:p-8 ${alignRight ? 'lg:col-start-2' : ''}`}>
        <div className="flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-ocean">
            <Icon size={24} strokeWidth={2} />
          </span>
          <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-slate-400">{step.number}</span>
        </div>
        <h3 className="mt-8 text-2xl font-extrabold tracking-[-0.03em] sm:text-4xl">{step.title}</h3>
        <p className="mt-4 max-w-xl text-base font-semibold leading-8 text-slate-600">{step.description}</p>
      </div>

      <div className={`grid min-h-56 place-items-center rounded-[1.55rem] border border-blue-100 bg-[radial-gradient(circle_at_50%_10%,rgba(37,99,235,0.12),transparent_16rem),linear-gradient(180deg,#f8fbff,#eef6ff)] p-6 ${alignRight ? 'lg:col-start-1' : ''}`}>
        <StepVisual index={index} />
      </div>
    </article>
  );
}

function StepVisual({ index }) {
  if (index === 0) {
    return (
      <div className="relative h-44 w-36 rounded-[1.6rem] border-[7px] border-slate-900 bg-white p-3 shadow-[0_22px_48px_rgba(15,23,42,0.18)]">
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
        <div className="grid h-full place-items-center rounded-2xl bg-blue-50 text-ocean">
          <Camera size={40} strokeWidth={1.8} />
        </div>
      </div>
    );
  }

  if (index === 1) {
    return (
      <div className="w-full max-w-xs rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
            <BookOpen size={18} />
          </span>
          <div className="h-3 flex-1 rounded-full bg-slate-200" />
        </div>
        <div className="grid gap-3">
          <div className="h-3 rounded-full bg-blue-100" />
          <div className="h-3 w-5/6 rounded-full bg-slate-200" />
          <div className="h-3 w-4/6 rounded-full bg-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xs rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-[0_20px_45px_rgba(15,23,42,0.12)]">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-extrabold">Scorecard</span>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-extrabold text-emerald-700">86%</span>
      </div>
      <div className="grid gap-3">
        <PreviewRow label="Strong reasoning" />
        <PreviewRow label="One small mistake" />
        <PreviewRow label="Improve final step" />
      </div>
    </div>
  );
}

function WorkflowCard({ icon: Icon, title, description, action, to }) {
  return (
    <article className="smooth-card group rounded-[1.8rem] border border-slate-200/80 bg-slate-50/90 p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white text-ocean shadow-[0_14px_32px_rgba(15,23,42,0.08)]">
          <Icon size={23} strokeWidth={2} />
        </span>
        <div>
          <h3 className="text-xl font-extrabold tracking-[-0.025em]">{title}</h3>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      <Link to={to} className="primary-button mt-6 w-full group-hover:bg-ocean">
        {action}
      </Link>
    </article>
  );
}

function SubjectPill({ subject }) {
  const Icon = subject.icon;
  return (
    <div className="flex items-center gap-3 rounded-[1.35rem] border border-slate-200/80 bg-white/82 p-3 font-extrabold text-slate-700 shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-blue-50 text-ocean">
        <Icon size={18} strokeWidth={2} />
      </span>
      {subject.label}
    </div>
  );
}

function PreviewRow({ label }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={15} className="text-emerald-600" />
      <span>{label}</span>
    </div>
  );
}

function LandingPoint({ label }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle2 size={16} className="text-emerald-600" />
      {label}
    </div>
  );
}
