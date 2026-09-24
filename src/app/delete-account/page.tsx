import type { Metadata } from 'next';
import Link from 'next/link';
import DeleteAccountForm from './DeleteAccountForm';

export const metadata: Metadata = {
  title: 'Delete Your Account',
  description: 'Request deletion of your ScamAlert.pk account and associated data.',
  robots: { index: false, follow: false },
};

export default function DeleteAccountPage() {
  return (
    <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)]">
      <div className="mx-auto max-w-xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-semibold text-[var(--sa-red)] hover:underline"
        >
          ← Back to ScamAlert.pk
        </Link>

        <h1 className="sa-display mb-3 text-2xl font-bold sm:text-3xl">
          Delete your account
        </h1>

        <div className="mb-6 space-y-3 text-sm text-[var(--sa-graphite)]">
          <p>
            Submitting this form asks us to permanently delete your ScamAlert.pk account and
            the personal data tied to it (email, profile details, login).
          </p>
          <p>
            <strong className="text-[var(--sa-ink)]">
              This also deletes any reports you filed, their evidence, and any messages tied to
              them.
            </strong>{' '}
            If you&apos;d rather keep a report on record but stop using your account, you can{' '}
            <Link href="/" className="font-semibold text-[var(--sa-red)] hover:underline">
              delete individual reports
            </Link>{' '}
            from your dashboard instead of your whole account.
          </p>
          <p>
            We review each request manually before completing it, since this form isn&apos;t
            behind a login and we want to make sure it&apos;s really you. See our{' '}
            <Link href="/privacy" className="font-semibold text-[var(--sa-red)] hover:underline">
              Privacy Policy
            </Link>{' '}
            for details on what&apos;s retained and why.
          </p>
        </div>

        <DeleteAccountForm />
      </div>
    </main>
  );
}
