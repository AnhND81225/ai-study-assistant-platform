import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, LockKeyhole, MailWarning } from 'lucide-react';
import { authApi } from '../api/authApi';
import { apiMessage } from '../api/client';
import { ErrorBanner } from '../components/common/ErrorBanner';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(token ? '' : 'This reset link is missing a token.');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(apiMessage(err, 'This reset link is invalid or expired.'));
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
            StudyAI
          </Link>

          {success ? (
            <>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={26} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Password updated</h1>
              <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
                Your password has been changed. You can sign in with the new password now.
              </p>
              <Link to="/login" className="primary-button mt-6 text-center">Go to sign in</Link>
            </>
          ) : (
            <form onSubmit={submit}>
              <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-ocean">
                <MailWarning size={26} />
              </div>
              <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">Create new password</h1>
              <p className="mt-2 text-sm font-semibold leading-6 text-slate-600">
                Choose a strong password for your StudyAI account.
              </p>
              <div className="mt-6 grid gap-4">
                <ErrorBanner message={error} onDismiss={() => setError('')} />
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  New password
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="input-field w-full pl-10"
                    />
                  </span>
                </label>
                <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                  Confirm password
                  <span className="relative">
                    <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      className="input-field w-full pl-10"
                    />
                  </span>
                </label>
                <button disabled={loading || !token} className="primary-button">
                  {loading ? 'Updating...' : 'Update password'}
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
