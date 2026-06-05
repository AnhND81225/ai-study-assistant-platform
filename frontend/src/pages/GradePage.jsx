import { useEffect, useMemo, useState } from 'react';
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
import { ExplanationResultCard, GradingResultCard } from '../components/common/AiResultCards';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { ProcessProgress } from '../components/common/ProcessProgress';

export function GradePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const online = useOnlineStatus();
  const initialSubmissionId = searchParams.get('submissionId') || '';
  const [workflow, setWorkflow] = useState(initialSubmissionId ? 'existing' : 'new');
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
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [canRetry, setCanRetry] = useState(false);

  const progressSteps = [
    { label: 'Read work', detail: 'Reading the question and student answer.' },
    { label: 'Check solution', detail: 'Comparing the work with a correct solution.' },
    { label: 'Write feedback', detail: 'Preparing the score, mistakes, and next steps.' },
  ];

  const explainedItems = useMemo(() => items.filter((item) => item.aiResponse), [items]);
  const canGradeExisting = Boolean(selected?.aiResponse) && (mode === 'image' ? Boolean(answerImage) : Boolean(answer.trim()));

  useEffect(() => {
    Promise.all([
      submissionApi.mine(),
      subjectApi.list(),
    ])
      .then(([page, subjectList]) => {
        const content = page.content || [];
        setItems(content);
        setSubjects(subjectList);
        setSubjectId(subjectList[0]?.id || '');
        const initial = content.find((item) => String(item.id) === initialSubmissionId && item.aiResponse) || content.find((item) => item.aiResponse);
        if (initial) setSelectedId(String(initial.id));
      })
      .catch((err) => setError(apiMessage(err, 'Could not load your checking workspace')))
      .finally(() => setLoading(false));
  }, []);

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
          setSearchParams({ submissionId: String(detail.id) }, { replace: true });
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

    if (!selected?.aiResponse) {
      setError('Choose an explained submission first.');
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

  if (loading) {
    return <PageHeader title="Check student work" description="Loading your checking workspace." />;
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

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-[1rem] bg-sky-50 p-1">
        <button
          type="button"
          onClick={() => {
            setWorkflow('new');
            setSearchParams({}, { replace: true });
          }}
          className={`workflow-tab tap-target rounded-lg px-3 text-sm font-black ${workflow === 'new' ? 'workflow-tab-active bg-white text-ocean shadow-soft' : 'text-slate-600'}`}
        >
          Check a worksheet
        </button>
        <button
          type="button"
          onClick={() => {
            setWorkflow('existing');
            if (selectedId) setSearchParams({ submissionId: selectedId }, { replace: true });
          }}
          className={`workflow-tab tap-target rounded-lg px-3 text-sm font-black ${workflow === 'existing' ? 'workflow-tab-active bg-white text-ocean shadow-soft' : 'text-slate-600'}`}
        >
          Check saved answer
        </button>
      </div>

      <div key={workflow} className="workflow-reveal">
        {workflow === 'new' ? (
          <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <section className="smooth-card app-card p-4">
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

          <section className="focus-panel app-card p-4">
            <div className="grid gap-4">
              <label className="grid gap-1 text-sm font-semibold">
                Subject
                <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="input-field">
                  {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                Note or rubric
                <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} maxLength={600} placeholder="Optional grading instruction" className="rounded-lg border border-sky-100 bg-white px-3 py-3 outline-none transition focus:border-sea focus:ring-4 focus:ring-sky-100" />
              </label>
              <button disabled={grading || !subjectId || !newWorkImage || !online} className="primary-button">
                {grading ? <Sparkles size={18} className="animate-pulse" /> : <ClipboardCheck size={18} />}
                {grading ? 'Checking student work...' : online ? 'Check this worksheet' : 'Reconnect to check'}
              </button>
            </div>
          </section>
        </form>
        ) : explainedItems.length === 0 ? (
          <EmptyState
            title="No explained questions yet"
            description="Solve a question first, or switch to Check a worksheet to review a complete image directly."
            action={<Link to="/upload" className="primary-button">Solve a question</Link>}
          />
        ) : (
          <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[340px_1fr]">
          <section className="app-card p-4">
            <label className="grid gap-1 text-sm font-semibold">
              Explained question
              <select value={selectedId} onChange={(event) => setSelectedId(event.target.value)} className="input-field">
                {explainedItems.map((item) => <option key={item.id} value={item.id}>#{item.id} - {item.subject.name}</option>)}
              </select>
            </label>
            {selected ? (
              <div className="mt-4">
                <img src={selected.imageUrl} alt="Selected homework" className="media-lift w-full rounded-lg object-contain" />
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <StatusPill status={selected.status} />
                  <span className="text-sm font-semibold text-slate-600">{selected.subject.name}</span>
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-4">
            {selected?.aiResponse ? (
              <ExplanationResultCard aiResponse={selected.aiResponse} />
            ) : null}

            <div className="focus-panel app-card p-4">
              <h3 className="text-lg font-black">Student answer</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 rounded-lg bg-sky-50 p-1">
                <button type="button" onClick={() => setMode('text')} className={`tap-target rounded-md px-3 text-sm font-black ${mode === 'text' ? 'bg-white text-ocean shadow-soft' : 'text-slate-600'}`}>Type answer</button>
                <button type="button" onClick={() => setMode('image')} className={`tap-target rounded-md px-3 text-sm font-black ${mode === 'image' ? 'bg-white text-ocean shadow-soft' : 'text-slate-600'}`}>Upload image</button>
              </div>
              {mode === 'text' ? (
                <textarea value={answer} onChange={(event) => setAnswer(event.target.value)} rows={7} placeholder="Paste or type the student's answer" className="mt-3 w-full rounded-lg border border-sky-100 px-3 py-3 transition focus:border-sea focus:outline-none focus:ring-4 focus:ring-sky-100" />
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
            <GradingResultCard key={result.id} result={result} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
