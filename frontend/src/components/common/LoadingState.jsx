export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-5 text-ink">
      <div className="w-full max-w-sm rounded-lg border border-slate-200 bg-white p-6 text-center shadow-soft">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-mint border-t-sea" />
        <p className="text-sm font-semibold">{label}</p>
      </div>
    </div>
  );
}
