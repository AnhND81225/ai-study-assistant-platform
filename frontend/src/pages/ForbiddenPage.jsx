import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-center">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black text-ink">403</h1>
        <p className="mt-2 text-slate-600">You do not have permission to access this page.</p>
        <Link to="/dashboard" className="tap-target mt-5 inline-flex items-center rounded-lg bg-sea px-4 font-bold text-white">Go back</Link>
      </div>
    </main>
  );
}
