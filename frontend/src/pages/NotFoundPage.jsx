import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
      <div className="app-card max-w-md p-8">
        <p className="text-sm font-bold text-ocean">Page not found</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">This page is not available</h1>
        <p className="mt-3 font-medium leading-6 text-slate-600">The link may be outdated, or the page may have moved.</p>
        <Link to="/" className="primary-button mt-5">Home</Link>
      </div>
    </main>
  );
}
