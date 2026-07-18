import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Camera, CheckCircle2, ScanLine, Sparkles } from 'lucide-react';
import { subjectApi } from '../api/subjectApi';
import { submissionApi } from '../api/submissionApi';
import { apiMessage, isRetryableError } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { ImageScannerInput } from '../components/common/ImageScannerInput';
import { AiUsageCard } from '../components/common/AiUsageCard';
import { ProcessProgress } from '../components/common/ProcessProgress';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export function UploadPage() {
  const navigate = useNavigate();
  const online = useOnlineStatus();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(-1);
  const [canRetry, setCanRetry] = useState(false);

  const progressSteps = [
    { label: 'Save scan', detail: 'Securely uploading your question image.' },
    { label: 'Read question', detail: 'AI is reading the question and subject context.' },
    { label: 'Build solution', detail: 'Preparing clear study steps and the final answer.' },
  ];

  useEffect(() => {
    subjectApi.list().then((items) => {
      setSubjects(items);
      setSubjectId(items[0]?.id || '');
    }).catch((err) => setError(apiMessage(err, 'Could not load subjects')));
  }, []);

  async function submit(event) {
    event?.preventDefault();
    if (!online) {
      setError('You are offline. Reconnect before uploading or requesting an AI solution.');
      return;
    }
    if (!image) {
      setError('Choose a homework image first.');
      return;
    }
    setLoading(true);
    setError('');
    setCanRetry(false);
    setActiveStep(0);
    try {
      const submission = await submissionApi.create({ subjectId, note, image });
      setActiveStep(1);
      const explained = await submissionApi.explain(submission.id);
      setActiveStep(2);
      navigate(`/submissions/${explained.id}`);
    } catch (err) {
      setError(apiMessage(err, 'Could not solve this question'));
      setCanRetry(isRetryableError(err));
    } finally {
      setLoading(false);
      setActiveStep(-1);
    }
  }

  return (
    <div className="motion-page">
      <PageHeader title="Solve a question" description="Scan one clear homework question and get a guided, step-by-step solution." />
      <ProcessProgress title="Creating your solution" steps={progressSteps} activeStep={activeStep} />
      <section className="mb-6 grid gap-3 sm:grid-cols-3">
        <WorkflowMiniCard icon={ScanLine} title="1. Scan" detail="Take one clear photo." />
        <WorkflowMiniCard icon={BookOpen} title="2. Explain" detail="AI reads the question." />
        <WorkflowMiniCard icon={CheckCircle2} title="3. Save" detail="Review it later." />
      </section>
      <form onSubmit={submit} className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="workspace-card">
          <div className="workspace-core p-4 sm:p-5">
          <ErrorBanner message={error} onRetry={canRetry ? () => submit() : undefined} onDismiss={() => setError('')} />
          <div className="mt-4">
            <ImageScannerInput
              value={image}
              onChange={setImage}
              onError={setError}
              label="Question photo"
              helperText="Include the full question. For a page with several questions, add the question number in your note."
              emptyTitle="Scan question image"
              emptyDescription="Place the full question inside the frame, avoid shadows, then rotate if the photo is sideways."
              kindLabel="question image"
            />
          </div>
          </div>
        </section>
        <section className="focus-panel workspace-card h-fit lg:sticky lg:top-28">
          <div className="workspace-core p-4 sm:p-5">
          <div className="grid gap-4">
            <AiUsageCard compact />
            <div className="rounded-[1.35rem] border border-blue-100 bg-blue-50/70 p-4">
              <p className="text-sm font-extrabold text-ocean">Better scan, better answer</p>
              <p className="mt-1 text-sm font-semibold leading-6 text-slate-600">Use one clear question per upload. If the photo has many questions, write the question number below.</p>
            </div>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Subject
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="input-field">
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              Note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} maxLength={600} placeholder="Example: Solve question 5, or add what you tried" className="textarea-field" />
            </label>
            <button disabled={loading || !subjectId || !image || !online} className="primary-button">
              {loading ? <Sparkles size={18} className="animate-pulse" /> : <Camera size={18} />}
                {loading ? 'Creating solution...' : online ? 'Solve this question' : 'Reconnect to solve'}
            </button>
          </div>
          </div>
        </section>
      </form>
    </div>
  );
}

function WorkflowMiniCard({ icon: Icon, title, detail }) {
  return (
    <article className="workspace-card">
      <div className="workspace-core flex items-center gap-3 p-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-ocean">
          <Icon size={20} />
        </span>
        <div>
          <h2 className="text-sm font-extrabold text-ink">{title}</h2>
          <p className="mt-1 text-xs font-bold leading-5 text-slate-500">{detail}</p>
        </div>
      </div>
    </article>
  );
}
