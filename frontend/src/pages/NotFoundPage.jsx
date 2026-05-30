import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-center">
      <div className="max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-soft">
        <h1 className="text-3xl font-black text-ink">404</h1>
        <p className="mt-2 text-slate-600">This page does not exist.</p>
        <Link to="/" className="tap-target mt-5 inline-flex items-center rounded-lg bg-sea px-4 font-bold text-white">Home</Link>
      </div>
    </main>
  );
}
