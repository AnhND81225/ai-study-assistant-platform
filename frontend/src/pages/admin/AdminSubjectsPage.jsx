import { useEffect, useState } from 'react';
import { subjectApi } from '../../api/subjectApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { PageHeader } from '../../components/common/PageHeader';

export function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });
  const [error, setError] = useState('');

  function load() {
    subjectApi.list().then(setSubjects).catch((err) => setError(apiMessage(err, 'Could not load subjects')));
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
      <form onSubmit={submit} className="mb-4 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-[1fr_1fr_auto]">
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Subject name" className="tap-target rounded-lg border border-slate-300 px-3" />
        <input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Description" className="tap-target rounded-lg border border-slate-300 px-3" />
        <button className="tap-target rounded-lg bg-sea px-4 font-bold text-white">Add</button>
      </form>
      <div className="grid gap-3">
        {subjects.map((subject) => (
          <article key={subject.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <h3 className="font-bold">{subject.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{subject.description}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
