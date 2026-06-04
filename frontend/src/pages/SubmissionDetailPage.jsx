import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, RefreshCw, Trash2 } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';
import { ExplanationResultCard, GradingResultCard } from '../components/common/AiResultCards';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [explaining, setExplaining] = useState(false);

  useEffect(() => {
    submissionApi.detail(id)
      .then(setSubmission)
      .catch((err) => setError(apiMessage(err, 'Could not load submission')));
  }, [id]);

  async function remove() {
    if (!window.confirm('Delete this submission and related AI results?')) return;
    setDeleting(true);
    try {
      await submissionApi.remove(id);
      navigate('/submissions');
    } catch (err) {
      setError(apiMessage(err, 'Could not delete submission'));
    } finally {
      setDeleting(false);
    }
  }

  async function retryExplain() {
    if (!online) {
      setError('You are offline. Reconnect before retrying AI explanation.');
      return;
    }
    setExplaining(true);
    setError('');
    try {
      const explained = await submissionApi.explain(id);
      setSubmission(explained);
    } catch (err) {
      setError(apiMessage(err, 'Could not retry AI explanation'));
    } finally {
      setExplaining(false);
    }
  }

  if (!submission && !error) {
    return <PageHeader title="Loading submission" description="Fetching the latest saved result." />;
  }

  return (
    <div>
      <PageHeader title="Submission detail" description="Review the uploaded image, AI explanation, and grading results." action={<Link to="/submissions" className="secondary-button">Back</Link>} />
      <ErrorBanner message={error} />
      {submission ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <section className="app-card p-4">
            <img src={submission.imageUrl} alt="Uploaded homework" className="w-full rounded-lg object-contain" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill status={submission.status} />
              <span className="text-sm font-semibold text-slate-600">{submission.subject.name}</span>
            </div>
            {submission.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{submission.note}</p> : null}
            <button disabled={deleting} onClick={remove} className="danger-button mt-4 w-full">
              <Trash2 size={17} />
              {deleting ? 'Deleting...' : 'Delete submission'}
            </button>
            {submission.aiResponse ? (
              <Link to={`/grade?submissionId=${submission.id}`} className="primary-button mt-3 w-full">
                <ClipboardCheck size={17} />
                Grade answer
              </Link>
            ) : (
              <button disabled={explaining || !online} onClick={retryExplain} className="primary-button mt-3 w-full">
                <RefreshCw size={17} className={explaining ? 'animate-spin' : ''} />
                {explaining ? 'Retrying explanation...' : online ? 'Retry explanation' : 'Reconnect to retry'}
              </button>
            )}
          </section>
          <section className="grid gap-4">
            {submission.aiResponse ? (
              <ExplanationResultCard aiResponse={submission.aiResponse} />
            ) : (
              <div className="app-card border-dashed p-5">
                <h3 className="text-lg font-black">No explanation yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">The image is saved. Retry AI explanation when your connection and provider quota are ready.</p>
              </div>
            )}
            {submission.gradingResults?.length ? (
              <div className="grid gap-3">
                {submission.gradingResults.map((result) => (
                  <GradingResultCard key={result.id} result={result} />
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
