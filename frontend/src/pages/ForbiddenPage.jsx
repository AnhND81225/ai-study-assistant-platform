import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <main className="premium-page grid min-h-screen place-items-center px-5 text-center">
      <div className="workspace-card max-w-md">
        <div className="workspace-core p-8">
          <p className="eyebrow border-red-100 bg-red-50 text-red-600">Access restricted</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-ink">You cannot open this page</h1>
          <p className="mt-3 font-semibold leading-7 text-slate-600">Your account does not have permission to access this area.</p>
          <Link to="/dashboard" className="primary-button mt-6">Go back</Link>
        </div>
      </div>
    </main>
  );
}
