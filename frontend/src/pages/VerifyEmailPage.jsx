import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BookOpen, CheckCircle2, MailWarning } from 'lucide-react';
import { authApi } from '../api/authApi';
import { apiMessage } from '../api/client';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [state, setState] = useState({ status: 'loading', message: 'Verifying your email...' });
  const token = searchParams.get('token') || '';

  useEffect(() => {
    if (!token) {
      setState({ status: 'error', message: 'This verification link is missing a token.' });
      return;
    }
    authApi.verifyEmail(token)
      .then(() => setState({ status: 'success', message: 'Your email is verified. You can sign in now.' }))
      .catch((err) => setState({ status: 'error', message: apiMessage(err, 'This verification link is invalid or expired.') }));
  }, [token]);

  const success = state.status === 'success';

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
          <div className={`mb-5 grid h-14 w-14 place-items-center rounded-2xl ${success ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
            {success ? <CheckCircle2 size={26} /> : <MailWarning size={26} />}
          </div>
          <h1 className="text-4xl font-extrabold tracking-[-0.035em] text-ink">
            {success ? 'Email verified' : 'Verify email'}
          </h1>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">{state.message}</p>
          <Link to="/login" className="primary-button mt-6 text-center">Go to sign in</Link>
        </div>
      </section>
    </main>
  );
}
