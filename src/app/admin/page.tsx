'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

interface Stats {
  totalReports: number;
  pendingReports: number;
  resolvedReports: number;
  expiredUnresolvedReports: number;
  totalUsers: number;
}

interface AdminReport {
  id: string;
  report_number: string;
  user_id: string;
  brand_name: string;
  handle: string;
  platform: string;
  order_number: string;
  amount_paid: number;
  payment_method: string;
  status: 'pending' | 'resolved';
  created_at: string;
  public_at: string;
  resolved_at: string | null;
  business_responded_at: string | null;
}

interface AdminUser {
  id: string;
  email: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  city: string | null;
  createdAt: string;
  reportCount: number;
  isBanned: boolean;
}

type AuthState = 'checking' | 'signed-out' | 'not-admin' | 'admin';
type Tab = 'overview' | 'reports' | 'users' | 'deletions';

interface DeletionRequest {
  id: string;
  user_id: string | null;
  email: string;
  reason: string | null;
  status: 'pending' | 'completed' | 'rejected';
  created_at: string;
  processed_at: string | null;
}

interface ReportDetail {
  report: {
    id: string;
    report_number: string;
    brand_name: string;
    handle: string;
    platform: string;
    order_number: string;
    brand_email: string | null;
    brand_whatsapp: string | null;
    order_date: string | null;
    amount_paid: number;
    payment_method: string;
    description: string;
    status: string;
    created_at: string;
    public_at: string;
    resolved_at: string | null;
  };
  businessResponse: {
    response_text: string;
    response_type: string;
    tracking_number: string | null;
    refund_reference: string | null;
    created_at: string;
  } | null;
  evidence: {
    id: string;
    file_name: string;
    mime_type: string | null;
    url: string | null;
  }[];
  customerFinalResponses: {
    response_text: string;
    resolution_choice: string;
    created_at: string;
  }[];
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      })
    : '—';

export default function AdminPage() {
  const [supabase] = useState(() => createClient());
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  const [stats, setStats] = useState<Stats | null>(null);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [deletionRequests, setDeletionRequests] = useState<DeletionRequest[]>([]);
  const [reportFilter, setReportFilter] = useState<'all' | 'pending' | 'resolved' | 'expired'>('all');
  const [reportSearch, setReportSearch] = useState('');
  const [busyReportId, setBusyReportId] = useState<string | null>(null);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [busyDeletionId, setBusyDeletionId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [nowMs, setNowMs] = useState<number | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detail, setDetail] = useState<ReportDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');

  const openDetail = async (reportId: string) => {
    setDetailId(reportId);
    setDetail(null);
    setDetailError('');
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { cache: 'no-store' });
      const data = await res.json();
      if (!res.ok) {
        setDetailError(data?.error || 'Failed to load report.');
        return;
      }
      setDetail(data);
    } catch {
      setDetailError('Failed to load report.');
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setDetailId(null);
    setDetail(null);
    setDetailError('');
  };

  const loadAll = async () => {
    const [statsRes, reportsRes, usersRes, deletionsRes] = await Promise.all([
      fetch('/api/admin/stats', { cache: 'no-store' }),
      fetch('/api/admin/reports', { cache: 'no-store' }),
      fetch('/api/admin/users', { cache: 'no-store' }),
      fetch('/api/admin/deletion-requests', { cache: 'no-store' }),
    ]);

    if (
      statsRes.status === 403 ||
      reportsRes.status === 403 ||
      usersRes.status === 403 ||
      deletionsRes.status === 403
    ) {
      setAuthState('not-admin');
      return;
    }

    const [statsData, reportsData, usersData, deletionsData] = await Promise.all([
      statsRes.json(),
      reportsRes.json(),
      usersRes.json(),
      deletionsRes.json(),
    ]);

    setStats(statsData);
    setReports(reportsData.reports ?? []);
    setUsers(usersData.users ?? []);
    setDeletionRequests(deletionsData.requests ?? []);
    setNowMs(Date.now());
    setAuthState('admin');
  };

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthState('signed-out');
        return;
      }
      try {
        await loadAll();
      } catch {
        setError('Failed to load admin data.');
        setAuthState('not-admin');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleStatusChange = async (reportId: string, status: 'pending' | 'resolved') => {
    setBusyReportId(reportId);
    setError('');
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to update report.');
        return;
      }
      await loadAll();
    } finally {
      setBusyReportId(null);
    }
  };

  const handleDelete = async (reportId: string) => {
    if (!window.confirm('Permanently delete this report? This cannot be undone.')) return;
    setBusyReportId(reportId);
    setError('');
    try {
      const res = await fetch(`/api/admin/reports/${reportId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to delete report.');
        return;
      }
      await loadAll();
    } finally {
      setBusyReportId(null);
    }
  };

  const handleBanToggle = async (userId: string, action: 'ban' | 'unban') => {
    if (action === 'ban' && !window.confirm('Ban this user? They will no longer be able to sign in.')) return;
    setBusyUserId(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to update user.');
        return;
      }
      await loadAll();
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeleteUser = async (userId: string, email: string | null) => {
    if (
      !window.confirm(
        `Permanently delete the account ${email ?? userId}? This also deletes their reports and evidence. This cannot be undone.`
      )
    )
      return;
    setBusyUserId(userId);
    setError('');
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to delete account.');
        return;
      }
      await loadAll();
    } finally {
      setBusyUserId(null);
    }
  };

  const handleDeletionRequestStatus = async (
    requestId: string,
    status: 'completed' | 'rejected'
  ) => {
    setBusyDeletionId(requestId);
    setError('');
    try {
      const res = await fetch(`/api/admin/deletion-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error || 'Failed to update request.');
        return;
      }
      await loadAll();
    } finally {
      setBusyDeletionId(null);
    }
  };

  const isExpiredUnresolved = (r: AdminReport) =>
    r.status === 'pending' && nowMs !== null && new Date(r.public_at).getTime() <= nowMs;

  const filteredReports = reports.filter((r) => {
    const matchesFilter =
      reportFilter === 'all' ||
      (reportFilter === 'pending' && r.status === 'pending') ||
      (reportFilter === 'resolved' && r.status === 'resolved') ||
      (reportFilter === 'expired' && isExpiredUnresolved(r));
    const q = reportSearch.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      r.report_number.toLowerCase().includes(q) ||
      r.brand_name.toLowerCase().includes(q) ||
      r.handle.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  });

  if (authState === 'checking') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--sa-paper)] text-[var(--sa-graphite)]">
        Checking access…
      </main>
    );
  }

  if (authState === 'signed-out' || authState === 'not-admin') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--sa-paper)] px-5 text-center">
        <div className="sa-card-elevated max-w-md p-8">
          <h1 className="sa-display mb-2 text-xl font-bold text-[var(--sa-ink)]">
            Admin access only
          </h1>
          <p className="text-sm text-[var(--sa-graphite)]">
            {authState === 'signed-out'
              ? 'Sign in on the homepage with your admin account, then come back to this page.'
              : "This account doesn't have admin access."}
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-[8px] bg-[var(--sa-red)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--sa-red-deep)]"
          >
            Back to ScamAlert.pk
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)]">
      <header className="border-b border-[var(--sa-border)] bg-[var(--sa-surface)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <div>
            <p className="sa-mono text-xs font-semibold uppercase tracking-wider text-[var(--sa-red)]">
              Admin
            </p>
            <h1 className="sa-display text-lg font-bold">ScamAlert.pk Dashboard</h1>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--sa-red)] hover:underline">
            ← Back to site
          </Link>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-1 px-4 md:px-6">
          {(['overview', 'reports', 'users', 'deletions'] as Tab[]).map((tab) => {
            const pendingDeletions = deletionRequests.filter((r) => r.status === 'pending').length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`border-b-2 px-4 py-2.5 text-sm font-semibold capitalize transition ${
                  activeTab === tab
                    ? 'border-[var(--sa-red)] text-[var(--sa-ink)]'
                    : 'border-transparent text-[var(--sa-graphite)] hover:text-[var(--sa-ink)]'
                }`}
              >
                {tab === 'deletions' && pendingDeletions > 0
                  ? `Deletions (${pendingDeletions})`
                  : tab}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {error && (
          <div className="mb-6 rounded-[8px] border border-[var(--sa-red)]/30 bg-[var(--sa-red-soft)] px-4 py-3 text-sm text-[var(--sa-red-deep)]">
            {error}
          </div>
        )}

        {activeTab === 'overview' && stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {[
              { label: 'Total reports', value: stats.totalReports },
              { label: 'Pending', value: stats.pendingReports },
              { label: 'Resolved', value: stats.resolvedReports },
              { label: 'Expired / unresolved', value: stats.expiredUnresolvedReports },
              { label: 'Total users', value: stats.totalUsers },
            ].map((s) => (
              <div key={s.label} className="sa-card p-5">
                <p className="sa-display text-3xl font-bold text-[var(--sa-ink)]">{s.value}</p>
                <p className="mt-1 text-xs text-[var(--sa-graphite)]">{s.label}</p>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-2">
                {(['all', 'pending', 'expired', 'resolved'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setReportFilter(f)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold capitalize transition ${
                      reportFilter === f
                        ? 'border-[var(--sa-red)] bg-[var(--sa-red)] text-white'
                        : 'border-[var(--sa-border)] text-[var(--sa-graphite)] hover:border-[var(--sa-red)]'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <input
                value={reportSearch}
                onChange={(e) => setReportSearch(e.target.value)}
                placeholder="Search report #, brand, or handle…"
                className="w-full rounded-[8px] border border-[var(--sa-border)] px-3 py-2 text-sm focus:border-[var(--sa-ink)] focus:outline-none sm:w-72"
              />
            </div>

            <div className="sa-card overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b border-[var(--sa-border)] text-left text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                    <th className="px-4 py-3">Report #</th>
                    <th className="px-4 py-3">Brand / Handle</th>
                    <th className="px-4 py-3">Platform</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Filed</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="border-b border-[var(--sa-border)] last:border-0">
                      <td className="px-4 py-3">
                        <button
                          onClick={() => openDetail(r.id)}
                          className="font-semibold text-[var(--sa-red)] hover:underline"
                        >
                          {r.report_number}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {r.brand_name}
                        <span className="block text-xs text-[var(--sa-graphite)]">@{r.handle}</span>
                      </td>
                      <td className="px-4 py-3">{r.platform}</td>
                      <td className="px-4 py-3">Rs {Number(r.amount_paid).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        {isExpiredUnresolved(r) ? (
                          <span className="rounded-full bg-[var(--sa-red-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-red-deep)]">
                            Expired
                          </span>
                        ) : r.status === 'resolved' ? (
                          <span className="rounded-full bg-[var(--sa-green-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-green)]">
                            Resolved
                          </span>
                        ) : (
                          <span className="rounded-full bg-[var(--sa-border)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-graphite)]">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--sa-graphite)]">{formatDate(r.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {r.status !== 'resolved' ? (
                            <button
                              disabled={busyReportId === r.id}
                              onClick={() => handleStatusChange(r.id, 'resolved')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--sa-green)] hover:text-[var(--sa-green)] disabled:opacity-50"
                            >
                              Resolve
                            </button>
                          ) : (
                            <button
                              disabled={busyReportId === r.id}
                              onClick={() => handleStatusChange(r.id, 'pending')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--sa-ink)] disabled:opacity-50"
                            >
                              Reopen
                            </button>
                          )}
                          <button
                            disabled={busyReportId === r.id}
                            onClick={() => handleDelete(r.id)}
                            className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold text-[var(--sa-red)] transition hover:border-[var(--sa-red)] disabled:opacity-50"
                          >
                            Delete
                          </button>
                          {users.find((u) => u.id === r.user_id)?.isBanned ? (
                            <button
                              disabled={busyUserId === r.user_id}
                              onClick={() => handleBanToggle(r.user_id, 'unban')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--sa-ink)] disabled:opacity-50"
                            >
                              Unban submitter
                            </button>
                          ) : (
                            <button
                              disabled={busyUserId === r.user_id}
                              onClick={() => handleBanToggle(r.user_id, 'ban')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold text-[var(--sa-red)] transition hover:border-[var(--sa-red)] disabled:opacity-50"
                              title="Ban the user who filed this report"
                            >
                              Ban submitter
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredReports.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-[var(--sa-graphite)]">
                        No reports match this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="sa-card overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[var(--sa-border)] text-left text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Reports filed</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-[var(--sa-border)] last:border-0">
                    <td className="px-4 py-3">{u.email ?? '—'}</td>
                    <td className="px-4 py-3">{u.username ?? '—'}</td>
                    <td className="px-4 py-3">
                      {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td className="px-4 py-3">{u.city ?? '—'}</td>
                    <td className="px-4 py-3">{u.reportCount}</td>
                    <td className="px-4 py-3 text-[var(--sa-graphite)]">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      {u.isBanned ? (
                        <span className="rounded-full bg-[var(--sa-red-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-red-deep)]">
                          Banned
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--sa-green-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-green)]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {u.isBanned ? (
                          <button
                            disabled={busyUserId === u.id}
                            onClick={() => handleBanToggle(u.id, 'unban')}
                            className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--sa-ink)] disabled:opacity-50"
                          >
                            Unban
                          </button>
                        ) : (
                          <button
                            disabled={busyUserId === u.id}
                            onClick={() => handleBanToggle(u.id, 'ban')}
                            className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold text-[var(--sa-red)] transition hover:border-[var(--sa-red)] disabled:opacity-50"
                          >
                            Ban
                          </button>
                        )}
                        <button
                          disabled={busyUserId === u.id}
                          onClick={() => handleDeleteUser(u.id, u.email)}
                          className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold text-[var(--sa-red)] transition hover:border-[var(--sa-red)] disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-[var(--sa-graphite)]">
                      No users yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'deletions' && (
          <div className="sa-card overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="border-b border-[var(--sa-border)] text-left text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Requested</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deletionRequests.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--sa-border)] last:border-0">
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3 max-w-xs truncate" title={r.reason ?? ''}>
                      {r.reason ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-[var(--sa-graphite)]">{formatDate(r.created_at)}</td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' ? (
                        <span className="rounded-full bg-[var(--sa-border)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-graphite)]">
                          Pending
                        </span>
                      ) : r.status === 'completed' ? (
                        <span className="rounded-full bg-[var(--sa-green-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-green)]">
                          Completed
                        </span>
                      ) : (
                        <span className="rounded-full bg-[var(--sa-red-soft)] px-2 py-0.5 text-xs font-semibold text-[var(--sa-red-deep)]">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'pending' ? (
                        <div className="flex flex-col gap-1.5">
                          <p className="text-[11px] text-[var(--sa-graphite)]">
                            Find &amp; delete the account in Users, then mark this:
                          </p>
                          <div className="flex gap-2">
                            <button
                              disabled={busyDeletionId === r.id}
                              onClick={() => handleDeletionRequestStatus(r.id, 'completed')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold transition hover:border-[var(--sa-green)] hover:text-[var(--sa-green)] disabled:opacity-50"
                            >
                              Mark completed
                            </button>
                            <button
                              disabled={busyDeletionId === r.id}
                              onClick={() => handleDeletionRequestStatus(r.id, 'rejected')}
                              className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1 text-xs font-semibold text-[var(--sa-red)] transition hover:border-[var(--sa-red)] disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-[var(--sa-graphite)]">
                          {formatDate(r.processed_at)}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
                {deletionRequests.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[var(--sa-graphite)]">
                      No deletion requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detailId && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 p-4 py-10"
          onClick={closeDetail}
        >
          <div
            className="sa-card-elevated w-full max-w-2xl bg-[var(--sa-surface)] p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <h2 className="sa-display text-xl font-bold">Report detail</h2>
              <button
                onClick={closeDetail}
                aria-label="Close"
                className="rounded-full p-1 text-[var(--sa-graphite)] hover:text-[var(--sa-ink)]"
              >
                ✕
              </button>
            </div>

            {detailLoading && <p className="text-sm text-[var(--sa-graphite)]">Loading…</p>}
            {detailError && (
              <p className="text-sm text-[var(--sa-red-deep)]">{detailError}</p>
            )}

            {detail && (
              <div className="space-y-6 text-sm">
                <div>
                  <p className="sa-display text-lg font-bold">{detail.report.report_number}</p>
                  <p className="text-[var(--sa-graphite)]">
                    {detail.report.brand_name} · @{detail.report.handle} · {detail.report.platform}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Order #</p>
                    <p>{detail.report.order_number}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Amount</p>
                    <p>Rs {Number(detail.report.amount_paid).toLocaleString()} · {detail.report.payment_method}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Status</p>
                    <p className="capitalize">{detail.report.status}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Filed</p>
                    <p>{formatDate(detail.report.created_at)}</p>
                  </div>
                  {detail.report.brand_email && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Brand email</p>
                      <p>{detail.report.brand_email}</p>
                    </div>
                  )}
                  {detail.report.brand_whatsapp && (
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Brand WhatsApp</p>
                      <p>{detail.report.brand_whatsapp}</p>
                    </div>
                  )}
                </div>

                <div>
                  <p className="mb-1 text-xs uppercase tracking-wide text-[var(--sa-graphite)]">Description</p>
                  <p className="whitespace-pre-wrap rounded-[8px] border border-[var(--sa-border)] p-3">
                    {detail.report.description}
                  </p>
                </div>

                {detail.evidence.length > 0 && (
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                      Evidence ({detail.evidence.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {detail.evidence.map((ev) =>
                        ev.url ? (
                          <a
                            key={ev.id}
                            href={ev.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-[6px] border border-[var(--sa-border)] px-2.5 py-1.5 text-xs font-semibold text-[var(--sa-red)] hover:underline"
                          >
                            {ev.file_name}
                          </a>
                        ) : (
                          <span key={ev.id} className="text-xs text-[var(--sa-graphite)]">
                            {ev.file_name} (unavailable)
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

                {detail.businessResponse && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                      Business response ({detail.businessResponse.response_type})
                    </p>
                    <p className="whitespace-pre-wrap rounded-[8px] border border-[var(--sa-border)] p-3">
                      {detail.businessResponse.response_text}
                    </p>
                    {detail.businessResponse.tracking_number && (
                      <p className="mt-1 text-xs text-[var(--sa-graphite)]">
                        Tracking: {detail.businessResponse.tracking_number}
                      </p>
                    )}
                    {detail.businessResponse.refund_reference && (
                      <p className="mt-1 text-xs text-[var(--sa-graphite)]">
                        Refund ref: {detail.businessResponse.refund_reference}
                      </p>
                    )}
                  </div>
                )}

                {detail.customerFinalResponses.length > 0 && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-[var(--sa-graphite)]">
                      Customer verdict
                    </p>
                    {detail.customerFinalResponses.map((cfr, i) => (
                      <p key={i} className="whitespace-pre-wrap rounded-[8px] border border-[var(--sa-border)] p-3">
                        <span className="font-semibold capitalize">{cfr.resolution_choice}</span>
                        {cfr.response_text ? ` — ${cfr.response_text}` : ''}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
