import { Link } from 'react-router-dom';

export function ForbiddenPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-paper px-5 text-center">
      <div className="app-card max-w-md p-8">
        <p className="text-sm font-bold text-red-600">Access restricted</p>
        <h1 className="mt-2 text-3xl font-extrabold text-ink">You cannot open this page</h1>
        <p className="mt-3 font-medium leading-6 text-slate-600">Your account does not have permission to access this area.</p>
        <Link to="/dashboard" className="primary-button mt-5">Go back</Link>
      </div>
    </main>
  );
}
