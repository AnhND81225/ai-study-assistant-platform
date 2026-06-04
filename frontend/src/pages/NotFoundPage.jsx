import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
      <div className="app-card max-w-md p-6">
        <h1 className="text-3xl font-black text-ink">404</h1>
        <p className="mt-2 text-slate-600">This page does not exist.</p>
        <Link to="/" className="primary-button mt-5">Home</Link>
      </div>
    </main>
  );
}
