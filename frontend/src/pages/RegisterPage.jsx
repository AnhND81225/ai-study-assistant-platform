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
    <main className="grid min-h-screen place-items-center bg-paper px-4 py-8">
      <form onSubmit={submit} className="w-full max-w-md rounded-[1.5rem] border border-sky-100 bg-white p-5 shadow-soft">
        <Link to="/" className="mb-6 inline-flex items-center gap-2 font-black text-ink">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sea text-white shadow-glow">
            <BookOpen size={19} />
          </span>
          StudyAI
        </Link>
        <h1 className="text-3xl font-black text-ink">Create account</h1>
        <p className="mt-2 text-sm font-semibold text-slate-500">Start saving explanations and grading results.</p>
        <div className="mt-5 grid gap-4">
          <ErrorBanner message={error} />
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Full name
            <span className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required value={form.fullName} onChange={(event) => setForm({ ...form, fullName: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Email
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <label className="grid gap-1 text-sm font-semibold text-slate-700">
            Password
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input required minLength={8} type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} className="input-field w-full pl-10" />
            </span>
          </label>
          <button disabled={loading} className="primary-button">
            {loading ? 'Please wait...' : 'Create account'}
          </button>
          <div className="text-center text-sm font-semibold text-slate-600">
            <Link to="/login" className="font-black text-ocean">I already have an account</Link>
          </div>
        </div>
      </form>
    </main>
  );
}
