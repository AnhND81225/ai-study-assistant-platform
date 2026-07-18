import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="premium-page grid min-h-screen place-items-center px-5 text-center">
      <div className="workspace-card max-w-md">
        <div className="workspace-core p-8">
          <p className="eyebrow border-blue-100 bg-blue-50 text-ocean">Page not found</p>
          <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.035em] text-ink">This page is not available</h1>
          <p className="mt-3 font-semibold leading-7 text-slate-600">The link may be outdated, or the page may have moved.</p>
          <Link to="/" className="primary-button mt-6">Home</Link>
        </div>
      </div>
    </main>
  );
}
