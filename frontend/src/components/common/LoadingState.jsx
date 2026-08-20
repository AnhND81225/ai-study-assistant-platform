export function LoadingState({ label = 'Loading' }) {
  return (
    <div className="premium-page grid min-h-screen place-items-center px-5 text-ink">
      <div className="workspace-card w-full max-w-sm">
        <div className="workspace-core p-8 text-center">
          <div className="mx-auto mb-5 h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-sea" />
          <p className="text-sm font-extrabold text-slate-600">{label}</p>
        </div>
      </div>
    </div>
  );
}
