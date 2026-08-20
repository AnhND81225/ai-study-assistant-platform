import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ClipboardCheck, ListChecks, RefreshCw, ScanSearch, Star, Trash2 } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';
import { ExplanationResultCard, GradingResultCard } from '../components/common/AiResultCards';
import { RichText } from '../components/common/RichText';
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
  const [solvedQuestionPage, setSolvedQuestionPage] = useState(0);

  useEffect(() => {
    submissionApi.detail(id)
      .then(setSubmission)
      .catch((err) => setError(apiMessage(err, 'Could not load submission')));
  }, [id]);

  useEffect(() => {
    setSolvedQuestionPage(0);
  }, [id]);

  useEffect(() => {
    const count = submission?.questionSolutions?.length || 0;
    setSolvedQuestionPage((current) => (count ? Math.min(current, count - 1) : 0));
  }, [submission?.questionSolutions?.length]);

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
        <div className="submission-detail-shell grid gap-4">
          <div className="submission-top-grid grid items-stretch gap-4 lg:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.35fr)] xl:grid-cols-[minmax(360px,0.95fr)_minmax(0,1.45fr)]">
            <section className="submission-summary-card focus-panel smooth-card workspace-card">
              <div className="workspace-core flex h-full flex-col p-4 sm:p-5">
                <div className="submission-media-frame">
                  <img src={submission.imageUrl} alt="Uploaded homework" className="submission-media w-full rounded-2xl object-contain" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusPill status={submission.status} />
                  {submission.favorite ? <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold text-ocean"><Star size={13} fill="currentColor" />Favorite</span> : null}
                  <span className="text-sm font-medium text-slate-600">{submission.subject.name}</span>
                </div>
                {submission.note ? <p className="mt-3 text-sm leading-6 text-slate-600">{submission.note}</p> : null}
                <div className="mt-auto pt-4">
                  <button disabled={deleting} onClick={remove} className="danger-button w-full">
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
              </div>
            </section>
            <section className="detail-result-stream grid min-w-0 gap-4">
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
                <QuickAnswersPanel solutions={submission.questionSolutions} />
              ) : null}
            </section>
          </div>

          <section className="submission-wide-results grid gap-4">
            {submission.questionSolutions?.length ? (
              <DetailStep
                step="1"
                title="Solved questions"
                description="Each saved solution stays attached to its question, so solving another one will not replace it."
              >
                <SolvedQuestionsPager
                  solutions={submission.questionSolutions}
                  page={solvedQuestionPage}
                  setPage={setSolvedQuestionPage}
                />
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
              <div className="fade-in workspace-card border-dashed">
                <div className="workspace-core p-5">
                <h3 className="text-lg font-bold">No explanation yet</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-slate-600">The image is saved. Retry AI explanation when your connection and provider quota are ready.</p>
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
    <section className="question-scope-card fade-in smooth-card workspace-card border-blue-200 bg-blue-50/45">
      <div className="workspace-core p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-100 text-ocean">
          <ScanSearch size={20} />
        </span>
        <div>
          <h2 className="font-bold text-ink">Choose what you want to solve</h2>
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
              className={`choice-toggle relative grid h-11 min-w-11 place-items-center rounded-2xl border px-3 text-sm font-bold ${selectedQuestions.includes(number) ? 'border-blue-500 bg-sea text-white' : 'border-blue-200 bg-white text-ocean hover:border-blue-400'}`}
            >
              {number}
              {solvedNumbers.has(number) ? <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-full bg-emerald-500 text-[9px] text-white">✓</span> : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 rounded-2xl border border-blue-100 bg-white/80 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-ink">
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

function QuickAnswersPanel({ solutions }) {
  const answers = solutions
    .map((solution) => ({
      questionNumber: solution.questionNumber,
      answer: summarizeFinalAnswer(solution.finalAnswer),
      isLong: isLongQuickAnswer(solution.finalAnswer),
    }))
    .filter((item) => item.answer);

  if (!answers.length) return null;
  const shouldUseList = answers.some((item) => item.isLong) || answers.length > 6;

  return (
    <section className="quick-answer-panel fade-in smooth-card workspace-card">
      <div className="workspace-core flex h-full min-h-0 flex-col p-4 sm:p-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-ink">Quick answers</h2>
            <p className="mt-1 text-sm font-medium leading-6 text-slate-600">
              Scan the saved answers here, then review the detailed solution below.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">{answers.length} saved</span>
        </div>
        <div className={`quick-answer-grid mt-4 ${shouldUseList ? 'quick-answer-list-mode' : ''}`}>
          {answers.map((item) => (
            <div
              key={item.questionNumber}
              className="quick-answer-chip"
            >
              <span className="quick-answer-question">{item.questionNumber}</span>
              <RichText className="quick-answer-value">{item.answer}</RichText>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function summarizeFinalAnswer(value) {
  const answer = readFinalAnswerText(value);
  if (!answer) return '';
  const multipleChoice = answer.match(/(?:^|[\s,;:.])([A-D])(?:$|[\s,.;:])/i);
  if (multipleChoice) return multipleChoice[1].toUpperCase();
  return answer
    .replace(/\\n/g, ' ')
    .replace(/^answer\s*[:.)-]\s*/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function plainAnswerPreview(value) {
  return String(value || '')
    .replace(/\\n/g, ' ')
    .replace(/\\(?:text|mathrm)\{([^}]*)\}/g, '$1')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\[,;:!]/g, ' ')
    .replace(/\\_/g, '_')
    .replace(/\$/g, '')
    .replace(/([A-Za-z])_\{?(\d+)\}?/g, '$1$2')
    .replace(/\s+/g, ' ');
}

function isLongQuickAnswer(value) {
  const rawAnswer = readFinalAnswerText(value);
  const plainAnswer = plainAnswerPreview(rawAnswer);
  return plainAnswer.length > 58 || /(?:\\n|\n|[.;:]\s|\\begin|\\frac|\\times|\\text)/.test(rawAnswer);
}

function readFinalAnswerText(value) {
  if (!value) return '';
  const trimmed = String(value).trim();
  const candidate = trimmed.startsWith('```json')
    ? trimmed.slice(7).replace(/```\s*$/, '').trim()
    : trimmed;
  if (!candidate.startsWith('{')) return trimmed;
  try {
    const parsed = JSON.parse(candidate);
    return typeof parsed.finalAnswer === 'string' ? parsed.finalAnswer.trim() : '';
  } catch {
    return trimmed;
  }
}

function SolvedQuestionsPager({ solutions, page, setPage }) {
  const count = solutions.length;
  const activePage = Math.min(page, count - 1);
  const activeSolution = solutions[activePage];

  function goToPage(nextPage) {
    setPage(Math.max(0, Math.min(nextPage, count - 1)));
  }

  return (
    <div className="solved-question-pager">
      <div className="solved-question-nav">
        <div className="solved-question-toolbar">
          <div className="min-w-0">
            <p className="text-sm font-bold text-ink">Question {activeSolution.questionNumber}</p>
            <p className="mt-0.5 text-xs font-medium text-slate-500">
              {activePage + 1} of {count} saved solutions
            </p>
          </div>
        </div>

        <div className="solved-question-tabs" aria-label="Solved question pages">
          {solutions.map((solution, index) => (
            <button
              key={solution.id}
              type="button"
              aria-current={index === activePage ? 'page' : undefined}
              onClick={() => goToPage(index)}
              className={`solved-question-tab ${index === activePage ? 'solved-question-tab-active' : ''}`}
            >
              {solution.questionNumber}
            </button>
          ))}
        </div>

        <div className="solved-question-arrows">
          <button
            type="button"
            aria-label="Previous solved question"
            disabled={activePage === 0}
            onClick={() => goToPage(activePage - 1)}
            className="pager-icon-button"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            aria-label="Next solved question"
            disabled={activePage === count - 1}
            onClick={() => goToPage(activePage + 1)}
            className="pager-icon-button"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>

      <div key={activeSolution.id} className="solved-question-page">
        <ExplanationResultCard
          aiResponse={activeSolution}
          titleOverride={`Question ${activeSolution.questionNumber}`}
        />
      </div>
    </div>
  );
}

function DetailStep({ step, title, description, children }) {
  return (
    <section className="detail-step fade-in grid gap-3">
      <div className="flex items-start gap-3">
        <span className="detail-step-index grid h-8 w-8 shrink-0 place-items-center rounded-2xl bg-sea text-sm font-bold text-white shadow-[0_12px_26px_rgba(37,99,235,0.20)]">
          {step}
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-bold text-ink">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm font-medium leading-6 text-slate-600">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
