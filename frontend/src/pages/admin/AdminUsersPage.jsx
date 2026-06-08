import { useEffect, useState } from 'react';
import { adminApi } from '../../api/adminApi';
import { apiMessage } from '../../api/client';
import { ErrorBanner } from '../../components/common/ErrorBanner';
import { PageHeader } from '../../components/common/PageHeader';
import { roleLabel } from '../../utils/enumLabels';

export function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.users()
      .then((page) => setUsers(page.content || []))
      .catch((err) => setError(apiMessage(err, 'Could not load users')));
  }, []);

  return (
    <div>
      <PageHeader title="Users" description="Admin-only user list." />
      <ErrorBanner message={error} />
      <div className="grid gap-3">
        {users.map((user) => (
          <article key={user.id} className="app-card p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="font-extrabold">{user.fullName}</h3>
                <p className="mt-1 text-sm font-medium text-slate-600">{user.email}</p>
              </div>
              <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-ocean">{roleLabel(user.role)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
