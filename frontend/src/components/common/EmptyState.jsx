export function EmptyState({ title, description, action }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center shadow-soft">
      <div className="mx-auto mb-5 grid h-12 w-12 place-items-center rounded-lg bg-blue-50 text-2xl font-extrabold text-ocean">+</div>
      <h2 className="text-lg font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm font-medium leading-6 text-slate-600">{description}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
