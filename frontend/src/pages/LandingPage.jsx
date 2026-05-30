import { Link, Navigate } from 'react-router-dom';
import { BookOpen, Camera, ShieldCheck, Smartphone } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';

export function LandingPage() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <main className="min-h-screen bg-white text-ink">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl grid-cols-[minmax(0,1fr)] content-center gap-8 overflow-hidden px-5 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-center">
        <div className="min-w-0">
          <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-sea text-white">
            <BookOpen size={24} />
          </div>
          <h1 className="max-w-2xl text-4xl font-black leading-tight tracking-normal sm:text-6xl">AI Study Assistant</h1>
          <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
            Upload a homework photo, get a step-by-step explanation, and keep a private study history in a mobile-first PWA.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link to="/register" className="tap-target inline-flex w-full items-center justify-center rounded-lg bg-sea px-5 font-bold text-white sm:w-auto">
              Create account
            </Link>
            <Link to="/login" className="tap-target inline-flex w-full items-center justify-center rounded-lg border border-slate-300 px-5 font-bold text-ink sm:w-auto">
              Sign in
            </Link>
          </div>
        </div>
        <div className="min-w-0 w-full max-w-full justify-self-center rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-soft sm:max-w-[420px] lg:justify-self-auto">
          <div className="min-w-0 rounded-lg bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-bold">Upload homework</p>
              <span className="rounded-full bg-mint px-3 py-1 text-xs font-bold text-sea">PWA</span>
            </div>
            <div className="mt-4 grid h-48 min-w-0 place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50">
              <Camera className="text-sea" size={42} />
            </div>
            <div className="mt-4 grid gap-3">
              <Feature icon={Smartphone} label="Mobile camera upload" />
              <Feature icon={ShieldCheck} label="JWT, RBAC, ownership checks" />
              <Feature icon={BookOpen} label="AI explanation history" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Feature({ icon: Icon, label }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm font-semibold">
      <Icon size={18} className="text-sea" />
      <span className="min-w-0 break-words">{label}</span>
    </div>
  );
}
