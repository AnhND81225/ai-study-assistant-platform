import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useState } from 'react';
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
    <main className="grid min-h-screen place-items-center bg-slate-50 px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
        <h1 className="text-2xl font-black text-ink">Create account</h1>
        <div className="mt-5 grid gap-4">
          <ErrorBanner message={error} />
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Full name
            <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="tap-target rounded-lg border border-slate-300 px-3 outline-none focus:border-sea" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Email
            <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="tap-target rounded-lg border border-slate-300 px-3 outline-none focus:border-sea" />
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Password
            <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="tap-target rounded-lg border border-slate-300 px-3 outline-none focus:border-sea" />
          </label>
          <button disabled={loading} className="tap-target rounded-lg bg-sea px-4 font-bold text-white disabled:opacity-60">
            {loading ? 'Please wait...' : 'Create account'}
          </button>
          <div className="text-center text-sm text-slate-600">
            <Link to="/login" className="font-bold text-sea">I already have an account</Link>
          </div>
        </div>
      </form>
    </main>
  );
}
