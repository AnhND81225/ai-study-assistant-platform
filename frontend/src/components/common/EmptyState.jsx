import { Plus } from 'lucide-react';

export function EmptyState({ title, description, action }) {
  return (
    <div className="workspace-card border-dashed text-center">
      <div className="workspace-core px-5 py-12">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-[1.35rem] border border-blue-100 bg-blue-50 text-ocean shadow-inner">
          <Plus size={23} />
        </div>
        <h2 className="text-2xl font-extrabold tracking-[-0.025em] text-ink">{title}</h2>
        <p className="mx-auto mt-3 max-w-md text-sm font-semibold leading-7 text-slate-600">{description}</p>
        {action ? <div className="mt-6">{action}</div> : null}
      </div>
    </div>
  );
}
