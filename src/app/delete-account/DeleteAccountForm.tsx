'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';

export default function DeleteAccountForm() {
  const [supabase] = useState(() => createClient());
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.email) setEmail(user.email);
    })();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const { error: rpcError } = await supabase.rpc('request_account_deletion', {
        p_email: email.trim(),
        p_reason: reason.trim() || null,
      });
      if (rpcError) {
        setError(rpcError.message || 'Could not submit your request. Please try again.');
        return;
      }
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="sa-card p-6 text-center">
        <p className="text-sm font-semibold text-[var(--sa-ink)]">Request received.</p>
        <p className="mt-2 text-sm text-[var(--sa-graphite)]">
          We&apos;ll review and complete your request within a few business days. If we need to
          verify it&apos;s really you, we&apos;ll reach out at the email you provided.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="sa-card space-y-4 p-6">
      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--sa-ink)]">
          Account email <span className="text-[var(--sa-red)]">*</span>
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-[8px] border border-[var(--sa-border)] px-3.5 py-2.5 text-sm focus:border-[var(--sa-red)] focus:outline-none"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-semibold text-[var(--sa-ink)]">
          Reason (optional)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Optional — helps us improve, but not required"
          className="w-full rounded-[8px] border border-[var(--sa-border)] px-3.5 py-2.5 text-sm focus:border-[var(--sa-red)] focus:outline-none"
        />
      </div>

      {error && (
        <p className="rounded-[8px] border border-[var(--sa-red)]/25 bg-[var(--sa-red-soft)] px-3 py-2 text-sm text-[var(--sa-red-deep)]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-[8px] bg-[var(--sa-red)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--sa-red-deep)] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Request account deletion'}
      </button>
    </form>
  );
}
