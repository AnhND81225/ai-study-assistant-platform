import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ClipboardCheck, ListChecks, RefreshCw, ScanSearch, Star, Trash2 } from 'lucide-react';
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
  const [questionNumber, setQuestionNumber] = useState('');

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

  async function runExplain(params = {}) {
    if (!online) {
      setError('You are offline. Reconnect before retrying AI explanation.');
      return;
    }
    setExplaining(true);
    setError('');
    try {
      const explained = await submissionApi.explain(id, params);
      setSubmission(explained);
    } catch (err) {
      setError(apiMessage(err, 'Could not prepare the requested solution'));
    } finally {
      setExplaining(false);
    }
  }

  function solveSelectedQuestion() {
    const selected = Number(questionNumber);
    if (!Number.isInteger(selected) || selected < 1) {
      setError('Enter the question number you want to solve.');
      return;
    }
    runExplain({ questionNumber: selected, solveMode: 'ONE_QUESTION' });
  }

  if (!submission && !error) {
    return <PageHeader title="Loading submission" description="Fetching the latest saved result." />;
  }

  return (
    <div className="motion-page">
      <PageHeader title={submission?.title || 'Submission detail'} description="Review the uploaded image, AI explanation, and grading results." action={<Link to="/submissions" className="secondary-button">Back</Link>} />
      <ErrorBanner message={error} />
      {submission ? (
        <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
          <section className="app-card h-fit p-4 sm:p-5 lg:sticky lg:top-24">
            <img src={submission.imageUrl} alt="Uploaded homework" className="w-full rounded-lg object-contain" />
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <StatusPill status={submission.status} />
              {submission.favorite ? <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-ocean"><Star size={13} fill="currentColor" />Favorite</span> : null}
              <span className="text-sm font-semibold text-slate-600">{submission.subject.name}</span>
            </div>
            {submission.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{submission.note}</p> : null}
            <button disabled={deleting} onClick={remove} className="danger-button mt-4 w-full">
              <Trash2 size={17} />
              {deleting ? 'Deleting...' : 'Delete submission'}
            </button>
            {canGrade(submission.aiResponse) ? (
              <Link to={`/grade?submissionId=${submission.id}`} className="primary-button mt-3 w-full">
                <ClipboardCheck size={17} />
                Check student answer
              </Link>
            ) : canRetryExplanation(submission) ? (
              <button disabled={explaining || !online} onClick={() => runExplain()} className="primary-button mt-3 w-full">
                <RefreshCw size={17} className={explaining ? 'animate-spin' : ''} />
                {explaining ? 'Retrying explanation...' : online ? 'Retry explanation' : 'Reconnect to retry'}
              </button>
            ) : null}
          </section>
          <section className="grid gap-4">
            {shouldShowQuestionScope(submission.aiResponse) ? (
              <QuestionScopePanel
                aiResponse={submission.aiResponse}
                questionNumber={questionNumber}
                setQuestionNumber={setQuestionNumber}
                explaining={explaining}
                online={online}
                solveSelectedQuestion={solveSelectedQuestion}
                runExplain={runExplain}
              />
            ) : null}
            {submission.aiResponse ? (
              <ExplanationResultCard aiResponse={submission.aiResponse} />
            ) : (
              <div className="app-card border-dashed p-5">
                <h3 className="text-lg font-extrabold">No explanation yet</h3>
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

function canGrade(aiResponse) {
  return aiResponse && ['SOLUTION_READY', 'PARTIAL_RESULT'].includes(aiResponse.resultStatus || 'SOLUTION_READY');
}

function canRetryExplanation(submission) {
  return !submission.aiResponse || submission.status === 'AI_FAILED';
}

function shouldShowQuestionScope(aiResponse) {
  if (!aiResponse) return false;
  return aiResponse.resultStatus === 'QUESTION_SELECTION_REQUIRED'
    || aiResponse.resultStatus === 'PARTIAL_RESULT'
    || (aiResponse.availableQuestions?.length || 0) > 1;
}

function QuestionScopePanel({
  aiResponse,
  questionNumber,
  setQuestionNumber,
  explaining,
  online,
  solveSelectedQuestion,
  runExplain,
}) {
  const availableQuestions = aiResponse.availableQuestions || [];
  const multipleChoice = aiResponse.questionType === 'MULTIPLE_CHOICE';

  return (
    <section className="app-card border-violet-200 bg-violet-50/40 p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-violet-100 text-violet-700">
          <ScanSearch size={20} />
        </span>
        <div>
          <h2 className="font-extrabold text-ink">Choose what you want to solve</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
            This photo contains several questions. Selecting a smaller scope gives a clearer and more reliable answer.
          </p>
        </div>
      </div>

      {availableQuestions.length ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Detected question numbers">
          {availableQuestions.map((number) => (
            <button
              key={number}
              type="button"
              onClick={() => setQuestionNumber(String(number))}
              className={`grid h-10 min-w-10 place-items-center rounded-lg border px-3 text-sm font-extrabold transition ${String(number) === questionNumber ? 'border-violet-500 bg-violet-600 text-white' : 'border-violet-200 bg-white text-violet-700 hover:border-violet-400'}`}
            >
              {number}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          Question number
          <input
            type="number"
            min="1"
            value={questionNumber}
            onChange={(event) => setQuestionNumber(event.target.value)}
            placeholder="Example: 5"
            className="input-field"
          />
        </label>
        <button type="button" disabled={explaining || !online} onClick={solveSelectedQuestion} className="primary-button self-end">
          <ListChecks size={17} />
          {explaining ? 'Working...' : 'Solve selected question'}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {multipleChoice ? (
          <button type="button" disabled={explaining || !online} onClick={() => runExplain({ solveMode: 'ANSWERS_ONLY' })} className="secondary-button">
            Get answers only
          </button>
        ) : null}
        <button type="button" disabled={explaining || !online} onClick={() => runExplain({ solveMode: 'EXPLAIN_ALL' })} className="secondary-button">
          Explain all readable questions
        </button>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        Explaining a full page takes longer and may return a partial result when part of the photo is cropped.
      </p>
    </section>
  );
}
