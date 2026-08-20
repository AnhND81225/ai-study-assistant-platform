import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle2, Mail } from 'lucide-react';
import { authApi } from '../api/authApi';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(apiMessage(err, 'Could not send the reset email'));
    } finally {
      setLoading(false);
    }
  }

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

          {sent ? (
            <>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Check your email</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                If an account exists for <span className="text-ink">{email}</span>, we sent a password reset link.
              </p>
              <div className="mt-6 grid gap-3">
                <button type="button" disabled={loading} onClick={submit} className="primary-button">
                  {loading ? 'Sending...' : 'Send again'}
                </button>
                <Link to="/login" className="secondary-button text-center">Back to sign in</Link>
              </div>
            </>
          ) : (
            <form onSubmit={submit}>
              <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Reset password</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Enter your email and we will send a secure reset link.
              </p>
              <div className="mt-6 grid gap-4">
                <ErrorBanner message={error} onDismiss={() => setError('')} />
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  Email
                  <span className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      className="input-field w-full pl-10"
                    />
                  </span>
                </label>
                <button disabled={loading} className="primary-button">
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>
                <div className="border-t border-slate-100 pt-4 text-center text-sm font-medium text-slate-600">
                  <Link to="/login" className="font-bold text-ocean">Back to sign in</Link>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
