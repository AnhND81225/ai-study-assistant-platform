import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { BookOpen, CheckCircle2, LockKeyhole, Mail, User } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { GoogleSignInButton } from '../components/common/GoogleSignInButton';
import { authApi } from '../api/authApi';

export function RegisterPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);
  const [loading, setLoading] = useState(false);

  if (auth.isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await auth.register(form);
      setNotice(response);
    } catch (err) {
      setError(apiMessage(err, 'Registration failed'));
    } finally {
      setLoading(false);
    }
  }

  const handleGoogleCredential = useCallback(async (credential) => {
    setError('');
    setLoading(true);
    try {
      await auth.googleLogin(credential);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(apiMessage(err, 'Google sign in failed'));
    } finally {
      setLoading(false);
    }
  }, [auth, navigate]);

  async function resendVerification() {
    if (!notice?.email) return;
    setError('');
    setLoading(true);
    try {
      await authApi.resendVerification(notice.email);
      setNotice({ ...notice, nextStep: 'Verification email sent again. Please check your inbox.' });
    } catch (err) {
      setError(apiMessage(err, 'Could not resend verification email'));
    } finally {
      setLoading(false);
    }
  }

  if (notice) {
    return (
      <main className="landing-page grid min-h-[100dvh] place-items-center px-4 py-8">
        <section className="auth-card">
          <div className="auth-card-core">
            <Link to="/" className="mb-8 inline-flex items-center gap-2.5 font-extrabold text-ink">
              <span className="grid h-11 w-11 place-items-center rounded-[1.05rem] bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
                <BookOpen size={19} />
              </span>
              AI-Learning
            </Link>
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 size={26} />
            </div>
            <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Check your email</h1>
            <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
              We sent a verification link to <span className="text-ink">{notice.email}</span>. Verify your email before signing in.
            </p>
            <ErrorBanner message={error} onDismiss={() => setError('')} />
            <div className="mt-6 grid gap-3">
              <button type="button" disabled={loading} onClick={resendVerification} className="primary-button">
                {loading ? 'Sending...' : 'Resend email'}
              </button>
              <Link to="/login" className="secondary-button text-center">Back to sign in</Link>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="landing-page grid min-h-[100dvh] place-items-center px-4 py-8">
      <form onSubmit={submit} className="auth-card">
        <div className="auth-card-core">
        <Link to="/" className="mb-8 inline-flex items-center gap-2.5 font-extrabold text-ink">
          <span className="grid h-11 w-11 place-items-center rounded-[1.05rem] bg-sea text-white shadow-[0_18px_34px_rgba(37,99,235,0.24)]">
            <BookOpen size={19} />
          </span>
          AI-Learning
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
          <div className="flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.18em] text-slate-400">
            <span className="h-px flex-1 bg-slate-100" />
            or
            <span className="h-px flex-1 bg-slate-100" />
          </div>
          <GoogleSignInButton onCredential={handleGoogleCredential} onError={setError} />
          <div className="border-t border-slate-100 pt-4 text-center text-sm font-medium text-slate-600">
            <Link to="/login" className="font-bold text-ocean">I already have an account</Link>
          </div>
        </div>
        </div>
      </form>
    </main>
  );
}
