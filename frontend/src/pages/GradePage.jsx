import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ClipboardCheck, Sparkles } from 'lucide-react';
import { subjectApi } from '../api/subjectApi';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';
import { ImageScannerInput } from '../components/common/ImageScannerInput';
import { ExplanationResultCard, GradingResultCard } from '../components/common/AiResultCards';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

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
      .catch((err) => setError(apiMessage(err, 'Could not load grading data')))
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
    event.preventDefault();
    setError('');
    if (!online) {
      setError('You are offline. Reconnect before requesting AI grading.');
      return;
    }
    if (workflow === 'new') {
      if (!newWorkImage) {
        setError('Choose a student work image first.');
        return;
      }
      setGrading(true);
      try {
        const submission = await submissionApi.gradeNewImage({ subjectId, note, image: newWorkImage });
        setItems((current) => [submission, ...current.filter((item) => item.id !== submission.id)]);
        setSelected(submission);
        setSelectedId(String(submission.id));
        setWorkflow('existing');
        setNewWorkImage(null);
        setNote('');
      } catch (err) {
        setError(apiMessage(err, 'Could not grade student work image'));
      } finally {
        setGrading(false);
      }
      return;
    }

    if (!selected?.aiResponse) {
      setError('Choose an explained submission first.');
      return;
    }
    if (mode === 'text' && !answer.trim()) {
      setError('Type the student answer before grading.');
      return;
    }
    if (mode === 'image' && !answerImage) {
      setError('Choose a student answer image first.');
      return;
    }
    setGrading(true);
    try {
      const result = mode === 'image'
        ? await submissionApi.gradeImage(selected.id, answerImage)
        : await submissionApi.grade(selected.id, answer.trim());
      setSelected((current) => ({
        ...current,
        gradingResults: [result, ...(current?.gradingResults || [])],
      }));
      setAnswer('');
      setAnswerImage(null);
    } catch (err) {
      setError(apiMessage(err, 'Could not grade answer'));
    } finally {
      setGrading(false);
    }
  }

  if (loading) {
    return <PageHeader title="Grade answer" description="Loading grading workspace." />;
  }

  return (
    <div>
      <PageHeader
        title="Grade answer"
        description="Grade a new image containing the question and student work, or grade an answer for an existing explanation."
        action={<Link to="/upload" className="secondary-button">Explain only</Link>}
      />
      <ErrorBanner message={error} />

      <div className="mb-4 grid grid-cols-2 gap-2 rounded-[1rem] bg-sky-50 p-1">
        <button
          type="button"
          onClick={() => {
            setWorkflow('new');
            setSearchParams({}, { replace: true });
          }}
          className={`tap-target rounded-lg px-3 text-sm font-black transition ${workflow === 'new' ? 'bg-white text-ocean shadow-soft' : 'text-slate-600'}`}
        >
          Grade new work
        </button>
        <button
          type="button"
          onClick={() => {
            setWorkflow('existing');
            if (selectedId) setSearchParams({ submissionId: selectedId }, { replace: true });
          }}
          className={`tap-target rounded-lg px-3 text-sm font-black transition ${workflow === 'existing' ? 'bg-white text-ocean shadow-soft' : 'text-slate-600'}`}
        >
          Grade existing
        </button>
      </div>

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

          <section className="app-card p-4">
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
                {grading ? 'Reading and grading...' : online ? 'Grade new work' : 'Reconnect to grade'}
              </button>
            </div>
          </section>
        </form>
      ) : explainedItems.length === 0 ? (
        <EmptyState
          title="No explained questions yet"
          description="Generate an explanation first, or switch to Grade new work to grade a full image directly."
          action={<Link to="/upload" className="primary-button">Explain question</Link>}
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
                <img src={selected.imageUrl} alt="Selected homework" className="w-full rounded-lg object-contain" />
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

            <div className="app-card p-4">
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
                    emptyDescription="Use a clear close-up of the answer. The AI will read handwriting from the image before grading."
                    kindLabel="answer image"
                  />
                </div>
              )}
              <button disabled={grading || !canGradeExisting || !online} className="primary-button mt-3">
                {grading ? <Sparkles size={18} className="animate-pulse" /> : <ClipboardCheck size={18} />}
                {grading ? 'Grading...' : !online ? 'Reconnect to grade' : mode === 'image' ? 'Grade image' : 'Submit for grading'}
              </button>
            </div>
          </section>
        </form>
      )}

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
