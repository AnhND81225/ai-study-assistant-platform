import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
      <div className="app-card max-w-md p-6">
        <h1 className="text-3xl font-black text-ink">403</h1>
        <p className="mt-2 text-slate-600">You do not have permission to access this page.</p>
        <Link to="/dashboard" className="primary-button mt-5">Go back</Link>
      </div>
    </main>
  );
}
