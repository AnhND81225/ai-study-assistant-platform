import { submissionStatusLabel } from '../../utils/enumLabels';

const styles = {
  UPLOADED: 'bg-amber-50 text-warn border-amber-200',
  EXPLAINED: 'bg-blue-50 text-ocean border-blue-200',
  QUESTION_SELECTION_REQUIRED: 'bg-violet-50 text-violet-700 border-violet-200',
  INCOMPLETE_IMAGE: 'bg-amber-50 text-amber-800 border-amber-200',
  PARTIAL_RESULT: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  AI_FAILED: 'bg-red-50 text-red-700 border-red-200',
};

export function StatusPill({ status }) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${styles[status] || 'border-slate-200 bg-slate-50 text-slate-600'}`}>
      {submissionStatusLabel(status)}
    </span>
  );
}
