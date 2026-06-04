import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Sparkles } from 'lucide-react';
import { subjectApi } from '../api/subjectApi';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { ImageScannerInput } from '../components/common/ImageScannerInput';
import { AiUsageCard } from '../components/common/AiUsageCard';
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

  useEffect(() => {
    subjectApi.list().then((items) => {
      setSubjects(items);
      setSubjectId(items[0]?.id || '');
    }).catch((err) => setError(apiMessage(err, 'Could not load subjects')));
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (!online) {
      setError('You are offline. Reconnect before uploading or requesting AI explanation.');
      return;
    }
    if (!image) {
      setError('Choose a homework image first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const submission = await submissionApi.create({ subjectId, note, image });
      const explained = await submissionApi.explain(submission.id);
      navigate(`/submissions/${explained.id}`);
    } catch (err) {
      setError(apiMessage(err, 'Upload or AI explanation failed'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <PageHeader title="Explain question" description="Upload a homework question image, add a short note, and generate an AI explanation." />
      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <ErrorBanner message={error} />
          <div className="mt-4">
            <ImageScannerInput
              value={image}
              onChange={setImage}
              onError={setError}
              label="Question scan"
              helperText="Scan the homework question with your camera, or choose a clear image from the gallery."
              emptyTitle="Scan question image"
              emptyDescription="Place the full question inside the frame, avoid shadows, then rotate if the photo is sideways."
              kindLabel="question image"
            />
          </div>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-4">
            <AiUsageCard compact />
            <label className="grid gap-1 text-sm font-semibold">
              Subject
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="tap-target rounded-lg border border-slate-300 px-3">
                {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-semibold">
              Note
              <textarea value={note} onChange={(event) => setNote(event.target.value)} rows={5} maxLength={600} placeholder="Optional context or what you tried" className="rounded-lg border border-slate-300 px-3 py-3" />
            </label>
            <button disabled={loading || !subjectId || !image || !online} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-sea px-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <Sparkles size={18} className="animate-pulse" /> : <Camera size={18} />}
              {loading ? 'Processing AI explanation...' : online ? 'Explain question' : 'Reconnect to explain'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
