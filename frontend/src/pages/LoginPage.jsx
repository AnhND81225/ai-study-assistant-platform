import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, LockKeyhole, Mail } from 'lucide-react';
import { consumeSessionNotice, useAuth } from '../auth/AuthContext';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(() => consumeSessionNotice());
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await auth.login(form);
      navigate(location.state?.from?.pathname || '/dashboard', { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  }

  return <AuthForm title="Welcome back" subtitle="Continue your study session." submitLabel="Sign in" form={form} setForm={setForm} submit={submit} loading={loading} error={error} dismissError={() => setError('')} footer={<Link to="/register" className="font-bold text-ocean">Create an account</Link>} />;
}

function AuthForm({ title, subtitle, submitLabel, form, setForm, submit, loading, error, dismissError, footer }) {
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
        <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">{title}</h1>
        <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">{subtitle}</p>
        <div className="mt-6 grid gap-4">
          <ErrorBanner message={error} onDismiss={dismissError} />
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
              <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <button disabled={loading} className="primary-button">
            {loading ? 'Please wait...' : submitLabel}
          </button>
          <div className="border-t border-slate-100 pt-4 text-center text-sm font-medium text-slate-600">{footer}</div>
        </div>
        </div>
      </form>
    </main>
  );
}
