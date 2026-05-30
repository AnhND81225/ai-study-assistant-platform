import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [grading, setGrading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    submissionApi.detail(id)
      .then(setSubmission)
      .catch((err) => setError(apiMessage(err, 'Could not load submission')));
  }, [id]);

  async function grade(event) {
    event.preventDefault();
    setGrading(true);
    setError('');
    try {
      const result = await submissionApi.grade(id, answer);
      setSubmission((current) => ({
        ...current,
        gradingResults: [result, ...(current?.gradingResults || [])],
      }));
      setAnswer('');
    } catch (err) {
      setError(apiMessage(err, 'Could not grade answer'));
    } finally {
      setGrading(false);
    }
  }

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

  if (!submission && !error) {
    return <PageHeader title="Loading submission" description="Fetching the latest saved result." />;
  }

  return (
    <div>
      <PageHeader title="Submission detail" description="Review the uploaded image, AI explanation, and grading results." action={<Link to="/submissions" className="tap-target inline-flex items-center rounded-lg border border-slate-300 px-4 font-bold">Back</Link>} />
      <ErrorBanner message={error} />
      {submission ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <section className="rounded-lg border border-slate-200 bg-white p-4">
            <img src={submission.imageUrl} alt="Uploaded homework" className="w-full rounded-lg object-contain" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill status={submission.status} />
              <span className="text-sm font-semibold text-slate-600">{submission.subject.name}</span>
            </div>
            {submission.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{submission.note}</p> : null}
            <button disabled={deleting} onClick={remove} className="tap-target mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 font-bold text-red-700 disabled:opacity-60">
              <Trash2 size={17} />
              {deleting ? 'Deleting...' : 'Delete submission'}
            </button>
          </section>
          <section className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-bold">AI explanation</h3>
              {submission.aiResponse ? (
                <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
                  <p><strong>Detected question:</strong> {submission.aiResponse.detectedQuestion}</p>
                  <p className="whitespace-pre-wrap">{submission.aiResponse.explanation}</p>
                  {submission.aiResponse.finalAnswer ? <p><strong>Final answer:</strong> {submission.aiResponse.finalAnswer}</p> : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No explanation is stored yet.</p>
              )}
            </div>
            <form onSubmit={grade} className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-bold">Grade your answer</h3>
              <textarea required value={answer} onChange={(event) => setAnswer(event.target.value)} rows={5} placeholder="Paste or type your answer" className="mt-3 w-full rounded-lg border border-slate-300 px-3 py-3" />
              <button disabled={grading || !submission.aiResponse} className="tap-target mt-3 rounded-lg bg-sea px-4 font-bold text-white disabled:opacity-60">
                {grading ? 'Grading...' : 'Submit for grading'}
              </button>
            </form>
            {submission.gradingResults?.length ? (
              <div className="grid gap-3">
                {submission.gradingResults.map((result) => (
                  <article key={result.id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-2xl font-black text-sea">{result.score}/100</p>
                    <p className="mt-2 text-sm leading-6 text-slate-700">{result.feedback}</p>
                    {result.mistakes ? <p className="mt-2 text-sm text-slate-600"><strong>Mistakes:</strong> {result.mistakes}</p> : null}
                    {result.improvementSuggestions ? <p className="mt-2 text-sm text-slate-600"><strong>Improve:</strong> {result.improvementSuggestions}</p> : null}
                  </article>
                ))}
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}
