import { RefreshCw, X } from 'lucide-react';

export function ErrorBanner({ message, onRetry, onDismiss, retryLabel = 'Try again' }) {
  if (!message) return null;
  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 shadow-sm" role="alert">
      <div>
        <p className="font-black">Something needs attention</p>
        <p className="mt-1 font-semibold leading-5">{message}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 font-black text-red-700">
            <RefreshCw size={15} />
            {retryLabel}
          </button>
        ) : null}
      </div>
      {onDismiss ? (
        <button type="button" onClick={onDismiss} className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-red-600 hover:bg-red-100" aria-label="Dismiss error">
          <X size={17} />
        </button>
      ) : null}
    </div>
  );
}
