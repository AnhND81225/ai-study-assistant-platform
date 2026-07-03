import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles } from 'lucide-react';
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
      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="app-card p-4 sm:p-5">
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
        </section>
        <section className="app-card h-fit p-4 sm:p-5 lg:sticky lg:top-24">
          <div className="grid gap-4">
            <AiUsageCard compact />
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
        </section>
      </form>
    </div>
  );
}
