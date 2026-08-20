import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { EmptyState } from '../../components/common/EmptyState';
import { PageHeader } from '../../components/common/PageHeader';
import { roleLabel } from '../../utils/enumLabels';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.users()
      .then((page) => setUsers(page.content || []))
      .catch((err) => setError(apiMessage(err, 'Could not load users')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader title="Users" description="Admin-only user list." />
      <ErrorBanner message={error} />
      {loading ? (
        <div className="surface-panel border-dashed p-4 text-sm font-bold text-slate-500">Loading users...</div>
      ) : users.length === 0 && !error ? (
        <EmptyState title="No users yet" description="New accounts will appear here after registration." />
      ) : (
        <div className="grid gap-3">
          {users.map((user) => (
            <article key={user.id} className="smooth-card workspace-card">
              <div className="workspace-core p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold">{user.fullName}</h3>
                  <p className="mt-1 text-sm font-medium text-slate-600">{user.email}</p>
                </div>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-ocean">{roleLabel(user.role)}</span>
              </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
