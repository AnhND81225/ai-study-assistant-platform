const styles = {
  UPLOADED: 'bg-amber-50 text-warn border-amber-200',
  EXPLAINED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  AI_FAILED: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {status}
    </span>
  );
}
