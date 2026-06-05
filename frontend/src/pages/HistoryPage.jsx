import { Link } from 'react-router-dom';
import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Check, Pencil, Plus, Search, Star, X } from 'lucide-react';
import { submissionApi } from '../api/submissionApi';
import { subjectApi } from '../api/subjectApi';
import { apiMessage } from '../api/client';
import { PageHeader } from '../components/common/PageHeader';
import { EmptyState } from '../components/common/EmptyState';
import { ErrorBanner } from '../components/common/ErrorBanner';
import { StatusPill } from '../components/common/StatusPill';

const statuses = ['UPLOADED', 'EXPLAINED', 'AI_FAILED'];

export function HistoryPage() {
  const [items, setItems] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [pageInfo, setPageInfo] = useState({ number: 0, totalPages: 0, last: true });
  const [search, setSearch] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [status, setStatus] = useState('');
  const [favoriteOnly, setFavoriteOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', note: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const filterKey = useMemo(() => `${search}|${subjectId}|${status}|${favoriteOnly}`, [search, subjectId, status, favoriteOnly]);

  useEffect(() => {
    subjectApi.list()
      .then(setSubjects)
      .catch((err) => setError(apiMessage(err, 'Could not load subjects')));
  }, []);

  useEffect(() => {
    setPage(0);
  }, [filterKey]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError('');
    submissionApi.mine({
      page,
      size: 8,
      search: search.trim() || undefined,
      subjectId: subjectId || undefined,
      status: status || undefined,
      favorite: favoriteOnly || undefined,
    })
      .then((data) => {
        if (ignore) return;
        setItems((current) => (page === 0 ? data.content || [] : [...current, ...(data.content || [])]));
        setPageInfo({
          number: data.number || 0,
          totalPages: data.totalPages || 0,
          last: Boolean(data.last),
        });
      })
      .catch((err) => {
        if (!ignore) setError(apiMessage(err, 'Could not load history'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [page, search, subjectId, status, favoriteOnly]);

  function beginEdit(item) {
    setEditing(item.id);
    setEditForm({ title: item.title || '', note: item.note || '' });
  }

  async function saveEdit(item) {
    setError('');
    try {
      const updated = await submissionApi.update(item.id, {
        title: editForm.title,
        note: editForm.note,
        favorite: item.favorite,
      });
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
      setEditing(null);
    } catch (err) {
      setError(apiMessage(err, 'Could not update submission'));
    }
  }

  async function toggleFavorite(item) {
    setError('');
    try {
      const updated = await submissionApi.update(item.id, {
        title: item.title,
        note: item.note,
        favorite: !item.favorite,
      });
      setItems((current) => current.map((entry) => (entry.id === item.id ? updated : entry)));
    } catch (err) {
      setError(apiMessage(err, 'Could not update favorite'));
    }
  }

  return (
    <div>
      <PageHeader title="Submission history" description="Search, filter, favorite, and organize your saved homework results." action={<Link to="/upload" className="primary-button"><Plus size={17} />New upload</Link>} />
      <ErrorBanner message={error} />

      <section className="app-card mb-4 grid gap-3 p-4">
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, note, question, or filename" className="input-field w-full pl-10" />
        </label>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 text-sm font-bold text-slate-600">
            Subject
            <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} className="input-field">
              <option value="">All subjects</option>
              {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-600">
            Status
            <select value={status} onChange={(event) => setStatus(event.target.value)} className="input-field">
              <option value="">All statuses</option>
              {statuses.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-bold text-slate-600">
            View
            <select value={favoriteOnly ? 'favorites' : 'all'} onChange={(event) => setFavoriteOnly(event.target.value === 'favorites')} className="input-field">
              <option value="all">All saved work</option>
              <option value="favorites">Favorites only</option>
            </select>
          </label>
        </div>
      </section>

      {items.length === 0 && !loading && !error ? (
        <EmptyState title="No matching submissions" description="Try another search or upload your first homework image." action={<Link to="/upload" className="primary-button">Upload homework</Link>} />
      ) : (
        <div className="grid gap-3">
          {items.map((item) => (
            <HistoryItem
              key={item.id}
              item={item}
              editing={editing === item.id}
              editForm={editForm}
              setEditForm={setEditForm}
              beginEdit={beginEdit}
              cancelEdit={() => setEditing(null)}
              saveEdit={saveEdit}
              toggleFavorite={toggleFavorite}
            />
          ))}
        </div>
      )}

      <div className="mt-4 flex justify-center">
        {!pageInfo.last ? (
          <button type="button" onClick={() => setPage((current) => current + 1)} disabled={loading} className="secondary-button">
            {loading ? 'Loading...' : 'Load more'}
          </button>
        ) : items.length ? (
          <p className="text-sm font-bold text-slate-500">End of history</p>
        ) : null}
      </div>
    </div>
  );
}

function HistoryItem({ item, editing, editForm, setEditForm, beginEdit, cancelEdit, saveEdit, toggleFavorite }) {
  const title = item.title || item.aiResponse?.detectedQuestion || `${item.subject.name} submission`;

  return (
    <article className="smooth-card app-card p-4">
      <div className="flex items-start gap-3">
        <Link to={`/submissions/${item.id}`} className="shrink-0">
          <img src={item.imageUrl} alt={`Submission ${item.id}`} className="h-20 w-20 rounded-lg object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2">
              <input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} maxLength={120} placeholder="Short title" className="input-field w-full" />
              <textarea value={editForm.note} onChange={(event) => setEditForm({ ...editForm, note: event.target.value })} maxLength={600} rows={3} placeholder="Note" className="rounded-lg border border-sky-100 px-3 py-2 text-sm outline-none focus:border-sea focus:ring-4 focus:ring-sky-100" />
              <div className="flex gap-2">
                <button type="button" onClick={() => saveEdit(item)} className="primary-button px-3 text-sm"><Check size={16} />Save</button>
                <button type="button" onClick={cancelEdit} className="secondary-button px-3 text-sm"><X size={16} />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="line-clamp-1 font-black">{title}</h3>
                <StatusPill status={item.status} />
              </div>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.subject.name}</p>
              <p className="mt-1 line-clamp-2 text-sm leading-6 text-slate-600">{item.note || item.aiResponse?.detectedQuestion || 'Tap to view details'}</p>
            </>
          )}
        </div>
        {!editing ? (
          <div className="grid shrink-0 gap-2">
            <button type="button" onClick={() => toggleFavorite(item)} className={`grid h-10 w-10 place-items-center rounded-lg border ${item.favorite ? 'border-sky-200 bg-mint text-ocean' : 'border-sky-100 bg-white text-slate-400'}`} aria-label={item.favorite ? 'Remove favorite' : 'Add favorite'}>
              <Star size={17} fill={item.favorite ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={() => beginEdit(item)} className="grid h-10 w-10 place-items-center rounded-lg border border-sky-100 bg-white text-slate-500" aria-label="Edit submission">
              <Pencil size={17} />
            </button>
            <Link to={`/submissions/${item.id}`} className="grid h-10 w-10 place-items-center rounded-lg border border-sky-100 bg-white text-sea" aria-label="Open submission">
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
