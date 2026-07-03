import { useEffect, useState } from 'react';
import { subjectApi } from '../../api/subjectApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';

export function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    subjectApi.list()
      .then(setSubjects)
      .catch((err) => setError(apiMessage(err, 'Could not load subjects')))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(event) {
    event.preventDefault();
    setError('');
    try {
      await subjectApi.create(form);
      setForm({ name: '', description: '' });
      load();
    } catch (err) {
      setError(apiMessage(err, 'Could not create subject'));
    }
  }

  return (
    <div>
      <PageHeader title="Subjects" description="Manage supported homework subjects." />
      <ErrorBanner message={error} />
      <form onSubmit={submit} className="app-card mb-5 grid gap-3 p-4 md:grid-cols-[1fr_1fr_auto]">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Subject name" className="input-field" aria-label="Subject name" />
        <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="input-field" aria-label="Subject description" />
        <button className="primary-button">Add subject</button>
      </form>
      {loading ? (
        <div className="surface-panel border-dashed p-4 text-sm font-bold text-slate-500">Loading subjects...</div>
      ) : subjects.length === 0 && !error ? (
        <EmptyState title="No subjects yet" description="Add the first supported homework subject above." />
      ) : (
        <div className="grid gap-3">
          {subjects.map((subject) => (
            <article key={subject.id} className="app-card p-4">
              <h3 className="font-extrabold">{subject.name}</h3>
              <p className="mt-1 text-sm font-medium leading-6 text-slate-600">{subject.description}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
