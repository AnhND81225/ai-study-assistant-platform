import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, Trash2 } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';
import { RichText } from '../components/common/RichText';

export function SubmissionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

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
            {submission.aiResponse ? (
              <Link to={`/grade?submissionId=${submission.id}`} className="tap-target mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-sea px-4 font-bold text-white">
                <ClipboardCheck size={17} />
                Grade answer
              </Link>
            ) : null}
          </section>
          <section className="grid gap-4">
            <div className="rounded-lg border border-slate-200 bg-white p-4">
              <h3 className="text-lg font-bold">AI explanation</h3>
              {submission.aiResponse ? (
                <div className="mt-3 grid gap-3 text-sm leading-6 text-slate-700">
                  <div><strong>Detected question:</strong> <RichText>{submission.aiResponse.detectedQuestion}</RichText></div>
                  <RichText>{submission.aiResponse.explanation}</RichText>
                  {submission.aiResponse.finalAnswer ? <div><strong>Final answer:</strong> <RichText>{submission.aiResponse.finalAnswer}</RichText></div> : null}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No explanation is stored yet.</p>
              )}
            </div>
            {submission.gradingResults?.length ? (
              <div className="grid gap-3">
                {submission.gradingResults.map((result) => (
                  <article key={result.id} className="smooth-card rounded-lg border border-slate-200 bg-white p-4">
                    <p className="text-2xl font-black text-sea">{result.score}/100</p>
                    {result.userAnswerImageUrl ? <img src={result.userAnswerImageUrl} alt="Graded student answer" className="mt-3 max-h-72 w-full rounded-lg object-contain" /> : null}
                    {result.userAnswer ? <div className="mt-2"><strong className="text-sm text-slate-700">Student answer:</strong><RichText>{result.userAnswer}</RichText></div> : null}
                    <RichText className="mt-2">{result.feedback}</RichText>
                    {result.mistakes ? <div className="mt-2"><strong className="text-sm text-slate-700">Mistakes:</strong><RichText>{result.mistakes}</RichText></div> : null}
                    {result.improvementSuggestions ? <div className="mt-2"><strong className="text-sm text-slate-700">Improve:</strong><RichText>{result.improvementSuggestions}</RichText></div> : null}
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
