import { Plus } from 'lucide-react';

export function EmptyState({ title, description, action }) {
  return (
    <div className="app-card border-dashed border-slate-300/80 bg-white/82 px-5 py-12 text-center">
      <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-blue-50 text-ocean shadow-inner">
        <Plus size={22} />
      </div>
      <h2 className="text-xl font-extrabold text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-600">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
