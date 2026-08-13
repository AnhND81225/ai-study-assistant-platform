export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-7 flex flex-col gap-4 border-b border-slate-200/70 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="max-w-3xl text-3xl font-bold leading-[1.08] tracking-[-0.025em] text-ink sm:text-5xl">{title}</h1>
        {description ? <p className="mt-3 max-w-3xl text-sm font-medium leading-7 text-slate-500 sm:text-base">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
