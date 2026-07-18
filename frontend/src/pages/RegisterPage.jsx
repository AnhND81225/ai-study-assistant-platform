import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, LockKeyhole, Mail, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="landing-page grid min-h-[100dvh] place-items-center px-4 py-8">
      <form onSubmit={submit} className="auth-card">
        <div className="auth-card-core">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5 font-extrabold text-ink">
          <span className="grid h-11 w-11 place-items-center rounded-[1.05rem] bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
            <BookOpen size={19} />
          </span>
          StudyAI
        </Link>
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Create account</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">Start saving explanations and grading results.</p>
        <div className="mt-6 grid gap-4">
          <ErrorBanner message={error} onDismiss={() => setError('')} />
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Full name
            <span className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <label className="grid gap-1.5 text-sm font-bold text-slate-700">
            Password
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <button disabled={loading} className="primary-button">
            {loading ? 'Please wait...' : 'Create account'}
          </button>
          <div className="border-t border-slate-100 pt-4 text-center text-sm font-medium text-slate-600">
            <Link to="/login" className="font-bold text-ocean">I already have an account</Link>
          </div>
        </div>
        </div>
      </form>
    </main>
  );
}
