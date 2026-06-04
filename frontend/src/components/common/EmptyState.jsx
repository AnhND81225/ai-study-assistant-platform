export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-sky-200 bg-white p-6 text-center shadow-soft">
      <div className="mx-auto mb-4 h-2 w-16 rounded-full bg-sea" />
      <h2 className="text-base font-black text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
