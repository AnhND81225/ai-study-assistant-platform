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
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5 font-extrabold text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-sea text-white shadow-glow">
            <BookOpen size={19} />
          </span>
          StudyAI
        </Link>
        <h1 className="text-3xl font-extrabold text-ink">{title}</h1>
        <p className="mt-2 text-sm font-medium text-slate-600">{subtitle}</p>
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
      </form>
    </main>
  );
}
