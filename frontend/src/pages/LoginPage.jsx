import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
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

  return <AuthForm title="Sign in" submitLabel="Sign in" form={form} setForm={setForm} submit={submit} loading={loading} error={error} footer={<Link to="/register" className="font-bold text-sea">Create an account</Link>} />;
}

function AuthForm({ title, submitLabel, form, setForm, submit, loading, error, footer }) {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-black text-ink">{title}</h1>
        <div className="mt-5 grid gap-4">
          <ErrorBanner message={error} />
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Email
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="tap-target rounded-lg border border-slate-300 px-3 outline-none focus:border-sea" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Password
            <input required type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="tap-target rounded-lg border border-slate-300 px-3 outline-none focus:border-sea" />
          </label>
          <button disabled={loading} className="tap-target rounded-lg bg-sea px-4 font-bold text-white disabled:opacity-60">
            {loading ? 'Please wait...' : submitLabel}
          </button>
          <div className="text-center text-sm text-slate-600">{footer}</div>
        </div>
      </form>
    </main>
  );
}
