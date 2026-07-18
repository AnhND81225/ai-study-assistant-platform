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
  const [selectedQuestions, setSelectedQuestions] = useState([]);

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

  async function solveSelectedQuestions() {
    if (!selectedQuestions.length) {
      setError('Choose at least one question to solve.');
      return;
    }
    if (!online) {
      setError('You are offline. Reconnect before requesting AI solutions.');
      return;
    }
    setExplaining(true);
    setError('');
    try {
      const explained = await submissionApi.solveQuestions(id, selectedQuestions);
      setSubmission(explained);
      setSelectedQuestions([]);
    } catch (err) {
      setError(apiMessage(err, 'Could not solve the selected questions'));
    } finally {
      setExplaining(false);
    }
  }

  if (!submission && !error) {
    return <PageHeader title="Loading submission" description="Fetching the latest saved result." />;
  }

  return (
    <div className="motion-page">
      <PageHeader title={submission?.title || 'Submission detail'} description="Review the uploaded image, AI explanation, and grading results." action={<Link to="/submissions" className="secondary-button">Back</Link>} />
      <ErrorBanner message={error} />
      {submission ? (
        <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
          <section className="focus-panel workspace-card h-fit lg:sticky lg:top-28">
            <div className="workspace-core p-4 sm:p-5">
            <img src={submission.imageUrl} alt="Uploaded homework" className="w-full rounded-2xl object-contain shadow-[0_18px_38px_rgba(15,23,42,0.10)]" />
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
            {canGrade(submission) ? (
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
            </div>
          </section>
          <section className="grid gap-4">
            {shouldShowQuestionScope(submission.aiResponse) ? (
              <QuestionScopePanel
                aiResponse={submission.aiResponse}
                questionSolutions={submission.questionSolutions || []}
                selectedQuestions={selectedQuestions}
                setSelectedQuestions={setSelectedQuestions}
                explaining={explaining}
                online={online}
                solveSelectedQuestions={solveSelectedQuestions}
              />
            ) : null}
            {submission.questionSolutions?.length ? (
              <DetailStep
                step="1"
                title="Solved questions"
                description="Each saved solution stays attached to its question, so solving another one will not replace it."
              >
                <div className="grid gap-4">
                  {submission.questionSolutions.map((solution) => (
                    <ExplanationResultCard
                      key={solution.id}
                      aiResponse={solution}
                      titleOverride={`Question ${solution.questionNumber}`}
                    />
                  ))}
                </div>
              </DetailStep>
            ) : null}
            {submission.aiResponse && submission.aiResponse.resultStatus !== 'QUESTION_SELECTION_REQUIRED' ? (
              <DetailStep
                step={submission.questionSolutions?.length ? '2' : '1'}
                title="AI solution reference"
                description="This is the saved explanation generated from the uploaded question."
              >
                <ExplanationResultCard aiResponse={submission.aiResponse} titleOverride="AI solution reference" />
              </DetailStep>
            ) : !submission.aiResponse ? (
              <div className="workspace-card border-dashed">
                <div className="workspace-core p-5">
                <h3 className="text-lg font-extrabold">No explanation yet</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">The image is saved. Retry AI explanation when your connection and provider quota are ready.</p>
                </div>
              </div>
            ) : null}
            {submission.gradingResults?.length ? (
              <DetailStep
                step={submission.questionSolutions?.length ? '3' : '2'}
                title="Checked answers"
                description="Newest grading feedback appears first so you can review score and mistakes quickly."
              >
                <div className="grid gap-3">
                {submission.gradingResults.map((result) => (
                  <GradingResultCard key={result.id} result={result} />
                ))}
                </div>
              </DetailStep>
            ) : null}
          </section>
        </div>
      ) : null}
    </div>
  );
}

function canGrade(submission) {
  if (submission.questionSolutions?.length) return true;
  const { aiResponse } = submission;
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
  questionSolutions,
  selectedQuestions,
  setSelectedQuestions,
  explaining,
  online,
  solveSelectedQuestions,
}) {
  const availableQuestions = aiResponse.availableQuestions || [];
  const solvedNumbers = new Set(questionSolutions.map((solution) => solution.questionNumber));
  const pendingCredits = selectedQuestions.filter((number) => !solvedNumbers.has(number)).length;

  function toggleQuestion(number) {
    setSelectedQuestions((current) => {
      if (current.includes(number)) return current.filter((item) => item !== number);
      if (current.length >= 3) return current;
      return [...current, number].sort((left, right) => left - right);
    });
  }

  return (
    <section className="workspace-card border-violet-200 bg-violet-50/50">
      <div className="workspace-core p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
          <ScanSearch size={20} />
        </span>
        <div>
          <h2 className="font-extrabold text-ink">Choose what you want to solve</h2>
          <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
            Select up to three questions. Daily solves are charged per new question, not per button click.
          </p>
        </div>
      </div>

      {availableQuestions.length ? (
        <div className="mt-4 flex flex-wrap gap-2" aria-label="Detected question numbers">
          {availableQuestions.map((number) => (
            <button
              key={number}
              type="button"
              aria-pressed={selectedQuestions.includes(number)}
              onClick={() => toggleQuestion(number)}
              className={`relative grid h-11 min-w-11 place-items-center rounded-2xl border px-3 text-sm font-extrabold transition ${selectedQuestions.includes(number) ? 'border-violet-500 bg-violet-600 text-white' : 'border-violet-200 bg-white text-violet-700 hover:border-violet-400'}`}
            >
              {number}
              {solvedNumbers.has(number) ? <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-violet-100 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-extrabold text-ink">
            {selectedQuestions.length ? `${selectedQuestions.length} selected` : 'No questions selected'}
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {pendingCredits
              ? `This will use ${pendingCredits} daily solve${pendingCredits === 1 ? '' : 's'}.`
              : selectedQuestions.length
                ? 'These saved solutions will use 0 additional solves.'
                : 'Choose up to three question numbers above.'}
          </p>
        </div>
        <button type="button" disabled={explaining || !online || !selectedQuestions.length} onClick={solveSelectedQuestions} className="primary-button">
          <ListChecks size={17} />
          {explaining ? 'Solving...' : 'Solve selected questions'}
        </button>
      </div>
      <p className="mt-3 text-xs font-semibold leading-5 text-slate-500">
        A check mark means that question is already saved. Selecting it again does not call AI or use another solve.
      </p>
      </div>
    </section>
  );
}

function DetailStep({ step, title, description, children }) {
  return (
    <section className="grid gap-3">
      <div className="flex items-start gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-sea text-sm font-extrabold text-white shadow-[0_14px_30px_rgba(37,99,235,0.22)]">
          {step}
        </span>
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.025em] text-ink">{title}</h2>
          <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
