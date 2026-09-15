import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Verify an Online Seller Before You Pay',
  description:
    'A practical checklist for verifying Pakistani online stores and sellers before you send payment — from checking the blacklist to spotting a personal-account red flag.',
};

export default function VerifySellerGuidePage() {
  return (
    <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)]">
      <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
        <Link
          href="/"
          className="mb-8 inline-flex text-sm font-semibold text-[var(--sa-red)] hover:underline"
        >
          ← Back to ScamAlert.pk
        </Link>

        <article className="sa-card-elevated p-6 sm:p-10">
          <header className="border-b border-[var(--sa-border)] pb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[var(--sa-red)]">
              Buyer Guide
            </p>
            <h1 className="sa-display text-3xl font-bold tracking-tight sm:text-4xl">
              How to Verify an Online Seller Before You Pay
            </h1>
            <p className="mt-3 text-[var(--sa-graphite)]">
              A short checklist to run through before you order from a store
              or seller in Pakistan you haven&apos;t bought from before.
            </p>
          </header>

          <div className="mt-8 space-y-8 leading-7 text-[var(--sa-ink)]">
            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                Verification checklist
              </h2>
              <ol className="list-decimal space-y-3 pl-5">
                <li>
                  <strong>Check the directory and blacklist.</strong> Search
                  the seller&apos;s handle in the{' '}
                  <Link
                    href="/"
                    className="font-semibold text-[var(--sa-red)] hover:underline"
                  >
                    ScamAlert.pk brand directory
                  </Link>{' '}
                  — a track record of resolved disputes is a good sign; an
                  entry on the blacklist is not.
                </li>
                <li>
                  <strong>Look at account history.</strong> A page created a
                  few weeks ago, with a sudden spike in followers or
                  engagement, is harder to trust than one with a longer,
                  consistent history.
                </li>
                <li>
                  <strong>Search outside the platform.</strong> Look up the
                  seller&apos;s name or handle plus &quot;scam&quot; or
                  &quot;review&quot; on Google — problems often surface
                  outside the seller&apos;s own page, where they can&apos;t
                  delete the comment.
                </li>
                <li>
                  <strong>Prefer cash on delivery.</strong> COD shifts the
                  risk back to the seller. If it&apos;s offered, use it,
                  especially for a first order.
                </li>
                <li>
                  <strong>Never pay a personal account.</strong> A request to
                  transfer to an individual&apos;s bank account or mobile
                  wallet, instead of a registered business account, is one of
                  the strongest single warning signs — it makes the payment
                  far harder to trace or dispute later.
                </li>
                <li>
                  <strong>Ask for proof.</strong> A legitimate seller can
                  usually share a business registration, a physical address,
                  or a GST/NTN number on request. Hesitation or a vague
                  answer is itself information.
                </li>
                <li>
                  <strong>Start small.</strong> Place a smaller test order
                  before committing to a large one with a seller you
                  haven&apos;t used before.
                </li>
              </ol>
            </section>

            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                One red flag is enough
              </h2>
              <p>
                A seller can look professional — a polished page, a large
                follower count, genuine-looking photos — and still fail on
                one of these points. Treat any single red flag above,
                especially payment to a personal account or a refusal to
                offer COD, as reason enough to slow down, regardless of how
                convincing everything else looks.
              </p>
            </section>

            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                Already sent payment and something&apos;s wrong?
              </h2>
              <p>
                Keep your order details, payment proof, and any messages with
                the seller, then{' '}
                <Link
                  href="/"
                  className="font-semibold text-[var(--sa-red)] hover:underline"
                >
                  file a report on ScamAlert.pk
                </Link>
                . The seller gets a 72-hour window to respond before the
                report becomes part of the public record.
              </p>
            </section>

            <section className="border-t border-[var(--sa-border)] pt-6">
              <p className="text-sm text-[var(--sa-graphite)]">
                Related:{' '}
                <Link
                  href="/how-to-spot-online-scams-pakistan"
                  className="font-semibold text-[var(--sa-red)] hover:underline"
                >
                  How to Spot an Online Scam in Pakistan
                </Link>
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
