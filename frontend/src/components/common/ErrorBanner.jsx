import { AlertCircle, RefreshCw, X } from 'lucide-react';

export function ErrorBanner({ message, onRetry, onDismiss, retryLabel = 'Try again' }) {
  if (!message) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-3 rounded-[1.35rem] border border-red-200 bg-red-50/92 px-4 py-3 text-sm text-red-800 shadow-[0_16px_42px_rgba(185,28,28,0.08)]" role="alert">
      <div className="flex min-w-0 gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-red-700">
          <AlertCircle size={19} />
        </span>
        <div>
        <p className="font-extrabold">Something needs attention</p>
        <p className="mt-1 font-medium leading-5">{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full border border-red-200 bg-white px-4 font-bold text-red-700 transition hover:bg-red-50">
            <RefreshCw size={15} />
            {retryLabel}
          </button>
        ) : null}
        </div>
      </div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl text-red-600 hover:bg-red-100" aria-label="Dismiss error">
          <X size={17} />
        </button>
      ) : null}
    </div>
  );
}
