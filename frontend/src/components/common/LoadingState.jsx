export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="grid min-h-screen place-items-center bg-paper px-5 text-ink">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-sea" />
        <p className="text-sm font-bold text-slate-600">{label}</p>
      </div>
    </div>
  );
}
