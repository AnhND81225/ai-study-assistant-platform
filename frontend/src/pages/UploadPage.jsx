import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, ImagePlus, Sparkles } from 'lucide-react';
import { subjectApi } from '../api/subjectApi';
import { submissionApi } from '../api/submissionApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { ErrorBanner } from '../components/common/ErrorBanner';

const maxSizeBytes = 5 * 1024 * 1024;
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

export function UploadPage() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState('');
  const [note, setNote] = useState('');
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const previewUrl = useMemo(() => (image ? URL.createObjectURL(image) : null), [image]);

  useEffect(() => {
    subjectApi.list().then((items) => {
      setSubjects(items);
      setSubjectId(items[0]?.id || '');
    }).catch((err) => setError(apiMessage(err, 'Could not load subjects')));
  }, []);

  useEffect(() => () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  }, [previewUrl]);

  function selectImage(file) {
    setError('');
    if (!file) return;
    if (!allowedTypes.includes(file.type)) {
      setError('Only JPG, PNG, and WebP images are supported.');
      return;
    }
    if (file.size > maxSizeBytes) {
      setError('Image must be 5 MB or smaller.');
      return;
    }
    setImage(file);
  }

  async function submit(event) {
    event.preventDefault();
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
      <PageHeader title="Upload homework" description="Use your camera or gallery, add a short note, and generate an AI explanation." />
      <form onSubmit={submit} className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
          <ErrorBanner message={error} />
          <label className="mt-4 grid min-h-72 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 p-4 text-center">
            {previewUrl ? (
              <img src={previewUrl} alt="Homework preview" className="max-h-96 w-full rounded-lg object-contain" />
            ) : (
              <div>
                <ImagePlus className="mx-auto text-sea" size={42} />
                <p className="mt-3 font-bold">Choose homework image</p>
                <p className="mt-1 text-sm text-slate-600">Camera or gallery on mobile</p>
              </div>
            )}
            <input type="file" accept="image/*" onChange={(event) => selectImage(event.target.files?.[0])} className="sr-only" />
          </label>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid gap-4">
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
            <button disabled={loading || !subjectId} className="tap-target inline-flex items-center justify-center gap-2 rounded-lg bg-sea px-4 font-bold text-white disabled:opacity-60">
              {loading ? <Sparkles size={18} className="animate-pulse" /> : <Camera size={18} />}
              {loading ? 'Processing AI explanation...' : 'Upload and explain'}
            </button>
          </div>
        </section>
      </form>
    </div>
  );
}
