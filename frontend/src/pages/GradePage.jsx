import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { subjectApi } from '../api/subjectApi';
import { submissionApi } from '../api/submissionApi';
import { apiMessage, isRetryableError } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';
import { ImageScannerInput } from '../components/common/ImageScannerInput';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ProcessProgress } from '../components/common/ProcessProgress';

const lazyNamed = (loader, name) => lazy(() => loader().then((module) => ({ default: module[name] })));
const ExplanationResultCard = lazyNamed(() => import('../components/common/AiResultCards'), 'ExplanationResultCard');
const GradingResultCard = lazyNamed(() => import('../components/common/AiResultCards'), 'GradingResultCard');

export function GradePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const online = useOnlineStatus();
  const initialSubmissionId = searchParams.get('submissionId') || '';
  const initialWorkflow = initialSubmissionId || searchParams.get('view') === 'saved' ? 'existing' : 'new';
  const [workflow, setWorkflow] = useState(initialWorkflow);
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [note, setNote] = useState('');
  const [selectedId, setSelectedId] = useState(initialSubmissionId);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState('text');
  const [answer, setAnswer] = useState('');
  const [answerImage, setAnswerImage] = useState(null);
  const [newWorkImage, setNewWorkImage] = useState(null);
  const [error, setError] = useState('');
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsLoaded, setItemsLoaded] = useState(false);
  const [grading, setGrading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [canRetry, setCanRetry] = useState(false);

  const progressSteps = [
    { label: 'Read work', detail: 'Reading the question and student answer.' },
    { label: 'Check solution', detail: 'Comparing the work with a correct solution.' },
    { label: 'Write feedback', detail: 'Preparing the score, mistakes, and next steps.' },
  ];

  const explainedItems = useMemo(() => items.filter(isReadyForGrading), [items]);
  const canGradeExisting = isReadyForGrading(selected) && (mode === 'image' ? Boolean(answerImage) : Boolean(answer.trim()));

  useEffect(() => {
    subjectApi.list()
      .then((subjectList) => {
        setSubjects(subjectList);
        setSubjectId(subjectList[0]?.id || '');
      })
      .catch((err) => setError(apiMessage(err, 'Could not load your checking workspace')))
      .finally(() => setSubjectsLoading(false));
  }, []);

  useEffect(() => {
    if (workflow !== 'existing' || itemsLoaded || itemsLoading) return;
    setItemsLoading(true);
    submissionApi.mine()
      .then((page) => {
        const content = page.content || [];
        setItems(content);
        const initial = content.find((item) => String(item.id) === initialSubmissionId && isReadyForGrading(item)) || content.find(isReadyForGrading);
        if (initial) setSelectedId(String(initial.id));
      })
      .catch((err) => setError(apiMessage(err, 'Could not load your saved questions')))
      .finally(() => {
        setItemsLoaded(true);
        setItemsLoading(false);
      });
  }, [workflow, itemsLoaded, itemsLoading, initialSubmissionId]);

  useEffect(() => {
    if (!selectedId) {
      setSelected(null);
      return;
    }
    setError('');
    submissionApi.detail(selectedId)
      .then((detail) => {
        setSelected(detail);
        if (workflow === 'existing') {
          setSearchParams({ view: 'saved', submissionId: String(detail.id) }, { replace: true });
        }
      })
      .catch((err) => setError(apiMessage(err, 'Could not load selected submission')));
  }, [selectedId, setSearchParams, workflow]);

  async function submit(event) {
    event?.preventDefault();
    setError('');
    if (!online) {
      setError('You are offline. Reconnect before checking student work.');
      return;
    }
    if (workflow === 'new') {
      if (!newWorkImage) {
        setError('Choose a student work image first.');
        return;
      }
      setGrading(true);
      setCanRetry(false);
      setActiveStep(0);
      try {
        setActiveStep(1);
        const submission = await submissionApi.gradeNewImage({ subjectId, note, image: newWorkImage });
        setActiveStep(2);
        setItems((current) => [submission, ...current.filter((item) => item.id !== submission.id)]);
        setSelected(submission);
        setSelectedId(String(submission.id));
        setWorkflow('existing');
        setNewWorkImage(null);
        setNote('');
      } catch (err) {
        setError(apiMessage(err, 'Could not check the student work image'));
        setCanRetry(isRetryableError(err));
      } finally {
        setGrading(false);
        setActiveStep(-1);
      }
      return;
    }

    if (!isReadyForGrading(selected)) {
      setError('Choose a submission with a complete or partial solution first.');
      return;
    }
    if (mode === 'text' && !answer.trim()) {
      setError('Type the student answer before checking it.');
      return;
    }
    if (mode === 'image' && !answerImage) {
      setError('Choose a student answer image first.');
      return;
    }
    setGrading(true);
    setCanRetry(false);
    setActiveStep(0);
    try {
      setActiveStep(1);
      const result = mode === 'image'
        ? await submissionApi.gradeImage(selected.id, answerImage)
        : await submissionApi.grade(selected.id, answer.trim());
      setSelected((current) => ({
        ...current,
        gradingResults: [result, ...(current?.gradingResults || [])],
      }));
      setAnswer('');
      setAnswerImage(null);
      setActiveStep(2);
    } catch (err) {
      setError(apiMessage(err, 'Could not check the student answer'));
      setCanRetry(isRetryableError(err));
    } finally {
      setGrading(false);
      setActiveStep(-1);
    }
  }

  return (
    <div className="motion-page">
      <PageHeader
        title="Check student work"
        description="Check a complete worksheet photo, or review a new answer for a question you already solved."
        action={<Link to="/upload" className="secondary-button">Solve a question</Link>}
      />
      <ErrorBanner message={error} onRetry={canRetry ? () => submit() : undefined} onDismiss={() => setError('')} />
      <ProcessProgress title="Checking the student work" steps={progressSteps} activeStep={activeStep} />

      <div className="mb-6 grid grid-cols-2 gap-2 rounded-full border border-slate-200/80 bg-slate-100/80 p-1.5">
        <button
          type="button"
          onClick={() => {
            setWorkflow('new');
            setSearchParams({}, { replace: true });
          }}
          className={`workflow-tab tap-target rounded-full px-3 text-sm font-extrabold ${workflow === 'new' ? 'workflow-tab-active bg-white text-ocean shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : 'text-slate-600'}`}
        >
          Check a worksheet
        </button>
        <button
          type="button"
          onClick={() => {
            setWorkflow('existing');
            setSearchParams({
              view: 'saved',
              ...(selectedId ? { submissionId: selectedId } : {}),
            }, { replace: true });
          }}
          className={`workflow-tab tap-target rounded-full px-3 text-sm font-extrabold ${workflow === 'existing' ? 'workflow-tab-active bg-white text-ocean shadow-[0_10px_24px_rgba(15,23,42,0.08)]' : 'text-slate-600'}`}
        >
          Check saved answer
        </button>
      </div>

      <div key={workflow} className="workflow-reveal">
        {workflow === 'new' ? (
          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[1fr_360px]">
          <section className="smooth-card app-card p-4 sm:p-5">
            <ImageScannerInput
              value={newWorkImage}
              onChange={setNewWorkImage}
              onError={setError}
              label="Full work scan"
              helperText="Scan one image that contains both the question and the student's written solution."
              emptyTitle="Scan full student work"
              emptyDescription="Keep the question and answer visible in one frame. Rotate the photo if it was captured sideways."
              kindLabel="student work image"
            />
          </section>

          <section className="focus-panel app-card h-fit p-4 sm:p-5 lg:sticky lg:top-28">
            <div className="grid gap-4">
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Subject
                <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="input-field" disabled={subjectsLoading}>
                  {subjectsLoading ? <option value="">Loading subjects...</option> : null}
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1.5 text-sm font-bold text-slate-700">
                Note or rubric
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} maxLength={600} placeholder="Optional grading instruction" className="textarea-field" />
              </label>
              <button disabled={grading || !subjectId || !newWorkImage || !online} className="primary-button">
                {grading ? <Sparkles size={18} className="animate-pulse" /> : <ClipboardCheck size={18} />}
                {grading ? 'Checking student work...' : online ? 'Check this worksheet' : 'Reconnect to check'}
              </button>
            </div>
          </section>
        </form>
        ) : itemsLoading ? (
          <div className="app-card border-dashed p-6 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-100 border-t-sea" />
            <p className="mt-3 text-sm font-bold text-slate-600">Loading saved questions...</p>
          </div>
        ) : explainedItems.length === 0 ? (
          <EmptyState
            title="No explained questions yet"
            description="Solve a question first, or switch to Check a worksheet to review a complete image directly."
            action={<Link to="/upload" className="primary-button">Solve a question</Link>}
          />
        ) : (
          <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[340px_1fr]">
          <section className="focus-panel app-card h-fit p-4 sm:p-5 lg:sticky lg:top-28">
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Explained question
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="input-field">
                {explainedItems.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.subject.name}</option>)}
              </select>
            </label>
            {selected ? (
              <div className="mt-4">
                <img src={selected.imageUrl} alt="Selected homework" className="media-lift w-full rounded-2xl object-contain" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={selected.status} />
                  <span className="text-sm font-semibold text-slate-600">{selected.subject.name}</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4">
            {selected?.aiResponse ? (
              <Suspense fallback={<ResultLoadingState />}>
                <ExplanationResultCard aiResponse={selected.aiResponse} />
              </Suspense>
            ) : null}

            <div className="focus-panel app-card p-4 sm:p-5">
              <h3 className="text-lg font-extrabold">Student answer</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-full bg-slate-100/90 p-1.5">
                <button type="button" onClick={() => setMode('text')} className={`tap-target rounded-full px-3 text-sm font-extrabold ${mode === 'text' ? 'bg-white text-ocean shadow-sm' : 'text-slate-600'}`}>Type answer</button>
                <button type="button" onClick={() => setMode('image')} className={`tap-target rounded-full px-3 text-sm font-extrabold ${mode === 'image' ? 'bg-white text-ocean shadow-sm' : 'text-slate-600'}`}>Upload image</button>
              </div>
              {mode === 'text' ? (
                <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={7} placeholder="Paste or type the student's answer" className="textarea-field mt-3 w-full" />
              ) : (
                <div className="mt-3">
                  <ImageScannerInput
                    value={answerImage}
                    onChange={setAnswerImage}
                    onError={setError}
                    label="Answer scan"
                    helperText="Scan only the student's answer for this already-explained question."
                    emptyTitle="Scan student answer"
                    emptyDescription="Use a clear close-up of the answer. AI will read the handwriting before checking the work."
                    kindLabel="answer image"
                  />
                </div>
              )}
              <button disabled={grading || !canGradeExisting || !online} className="primary-button mt-3">
                {grading ? <Sparkles size={18} className="animate-pulse" /> : <ClipboardCheck size={18} />}
                {grading ? 'Checking...' : !online ? 'Reconnect to check' : mode === 'image' ? 'Check answer image' : 'Check this answer'}
              </button>
            </div>
          </section>
          </form>
        )}
      </div>

      {selected?.gradingResults?.length ? (
        <div className="mt-4 grid gap-3">
          {selected.gradingResults.map((result) => (
            <Suspense key={result.id} fallback={<ResultLoadingState />}>
              <GradingResultCard result={result} />
            </Suspense>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function isReadyForGrading(submission) {
  if (!submission?.aiResponse) return false;
  return ['SOLUTION_READY', 'PARTIAL_RESULT'].includes(submission.aiResponse.resultStatus || 'SOLUTION_READY');
}

function ResultLoadingState() {
  return (
    <div className="app-card border-dashed p-5 text-sm font-bold text-slate-500">
      Loading result...
    </div>
  );
}
