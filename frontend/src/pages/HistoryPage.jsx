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
import { submissionStatusLabel } from '../utils/enumLabels';

const statuses = ['UPLOADED', 'EXPLAINED', 'QUESTION_SELECTION_REQUIRED', 'INCOMPLETE_IMAGE', 'PARTIAL_RESULT', 'AI_FAILED'];

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
  const [retryKey, setRetryKey] = useState(0);
  const [notice, setNotice] = useState('');
  const [updatingFavoriteId, setUpdatingFavoriteId] = useState(null);

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
  }, [page, search, subjectId, status, favoriteOnly, retryKey]);

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
    setNotice('');
    setUpdatingFavoriteId(item.id);
    try {
      const updated = await submissionApi.update(item.id, {
        title: item.title,
        note: item.note,
        favorite: !item.favorite,
      });
      setItems((current) => {
        if (favoriteOnly && !updated.favorite) {
          return current.filter((entry) => entry.id !== item.id);
        }
        return current.map((entry) => (entry.id === item.id ? updated : entry));
      });
      setNotice(updated.favorite
        ? 'Added to Favorites. You can quickly find it here anytime.'
        : 'Removed from Favorites.');
    } catch (err) {
      setError(apiMessage(err, 'Could not update favorite'));
    } finally {
      setUpdatingFavoriteId(null);
    }
  }

  return (
    <div>
      <PageHeader title="Saved homework" description="Review past questions, solutions, and feedback whenever you need them." action={<Link to="/upload" className="primary-button"><Plus size={17} />New homework</Link>} />
      <ErrorBanner message={error} onRetry={() => setRetryKey((current) => current + 1)} onDismiss={() => setError('')} />
      {notice ? (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-ocean" role="status">
          <span className="inline-flex items-center gap-2"><Star size={16} fill="currentColor" />{notice}</span>
          <button type="button" onClick={() => setNotice('')} className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ocean" aria-label="Dismiss message"><X size={16} /></button>
        </div>
      ) : null}

      <section className="app-card mb-5 grid gap-4 p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-2 rounded-lg bg-slate-100 p-1" aria-label="Saved homework view">
          <button
            type="button"
            onClick={() => setFavoriteOnly(false)}
            className={`tap-target rounded-lg px-3 text-sm font-bold transition ${!favoriteOnly ? 'bg-white text-ocean shadow-sm' : 'text-slate-600'}`}
          >
            All homework
          </button>
          <button
            type="button"
            onClick={() => setFavoriteOnly(true)}
            className={`tap-target inline-flex items-center justify-center gap-2 rounded-lg px-3 text-sm font-bold transition ${favoriteOnly ? 'bg-white text-ocean shadow-sm' : 'text-slate-600'}`}
          >
            <Star size={15} fill={favoriteOnly ? 'currentColor' : 'none'} />
            Favorites
          </button>
        </div>
        <label className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search title, note, question, or filename" className="input-field w-full pl-10" />
        </label>
        <div className="grid gap-3 md:grid-cols-2">
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
              {statuses.map((item) => <option key={item} value={item}>{submissionStatusLabel(item)}</option>)}
            </select>
          </label>
        </div>
      </section>

      {items.length === 0 && !loading && !error ? (
        <EmptyState
          title={favoriteOnly ? 'No favorites yet' : 'No matching homework'}
          description={favoriteOnly ? 'Use the star on homework you want to find quickly later.' : 'Try another search or upload your first homework image.'}
          action={favoriteOnly ? <button type="button" onClick={() => setFavoriteOnly(false)} className="secondary-button">View all homework</button> : <Link to="/upload" className="primary-button">Upload homework</Link>}
        />
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
              updatingFavorite={updatingFavoriteId === item.id}
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

function HistoryItem({ item, editing, editForm, setEditForm, beginEdit, cancelEdit, saveEdit, toggleFavorite, updatingFavorite }) {
  const title = item.title || item.aiResponse?.detectedQuestion || `${item.subject.name} submission`;

  return (
    <article className={`smooth-card app-card p-4 sm:p-5 ${item.favorite ? 'border-blue-200 bg-blue-50/20' : ''}`}>
      <div className="flex items-start gap-3">
        <Link to={`/submissions/${item.id}`} className="shrink-0">
          <img src={item.imageUrl} alt={`Submission ${item.id}`} className="h-20 w-20 rounded-lg object-cover" />
        </Link>
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2">
              <input value={editForm.title} onChange={(event) => setEditForm({ ...editForm, title: event.target.value })} maxLength={120} placeholder="Short title" className="input-field w-full" />
              <textarea value={editForm.note} onChange={(event) => setEditForm({ ...editForm, note: event.target.value })} maxLength={600} rows={3} placeholder="Note" className="textarea-field text-sm" />
              <div className="flex gap-2">
                <button type="button" onClick={() => saveEdit(item)} className="primary-button px-3 text-sm"><Check size={16} />Save</button>
                <button type="button" onClick={cancelEdit} className="secondary-button px-3 text-sm"><X size={16} />Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="line-clamp-1 font-extrabold">{title}</h3>
                <StatusPill status={item.status} />
                {item.favorite ? <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-bold text-ocean"><Star size={12} fill="currentColor" />Favorite</span> : null}
              </div>
              <p className="mt-1 text-sm font-bold text-slate-500">{item.subject.name}</p>
              <p className="mt-1 line-clamp-2 text-sm font-medium leading-6 text-slate-600">{item.note || item.aiResponse?.detectedQuestion || 'Tap to view details'}</p>
            </>
          )}
        </div>
        {!editing ? (
          <div className="grid shrink-0 gap-2">
            <button type="button" disabled={updatingFavorite} onClick={() => toggleFavorite(item)} className={`grid h-10 w-10 place-items-center rounded-lg border transition-colors ${item.favorite ? 'border-blue-200 bg-blue-50 text-ocean' : 'border-slate-200 bg-white text-slate-400 hover:text-ocean'}`} aria-label={item.favorite ? 'Remove from favorites' : 'Add to favorites'} title={item.favorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Star size={17} fill={item.favorite ? 'currentColor' : 'none'} />
            </button>
            <button type="button" onClick={() => beginEdit(item)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:text-ocean" aria-label="Edit submission">
              <Pencil size={17} />
            </button>
            <Link to={`/submissions/${item.id}`} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-ocean transition-colors hover:bg-blue-50" aria-label="Open submission">
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : null}
      </div>
    </article>
  );
}
