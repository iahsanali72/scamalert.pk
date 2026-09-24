import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Spot an Online Scam in Pakistan',
  description:
    'The warning signs Pakistani online sellers show before they scam a buyer — payment pressure, fake reviews, and unverifiable accounts — and what to check before you pay.',
};

export default function SpotScamsGuidePage() {
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
              How to Spot an Online Scam in Pakistan
            </h1>
            <p className="mt-3 text-[var(--sa-graphite)]">
              Most fraudulent sellers on Instagram, Facebook, and WhatsApp in
              Pakistan follow the same playbook. Here&apos;s what to watch
              for before you send any money.
            </p>
          </header>

          <div className="mt-8 space-y-8 leading-7 text-[var(--sa-ink)]">
            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                Common warning signs
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  <strong>Only accepts advance bank transfer.</strong> A
                  seller who refuses cash on delivery, and insists you pay in
                  full before they ship anything, is the single most common
                  pattern in reports filed on this platform.
                </li>
                <li>
                  <strong>Prices well below market rate.</strong> If the same
                  product sells elsewhere for significantly more, treat the
                  discount as a red flag rather than a deal.
                </li>
                <li>
                  <strong>No verifiable address or store history.</strong> A
                  legitimate business can usually point to a physical
                  location, a consistent posting history, or a paper trail —
                  a page created weeks ago with no track record can&apos;t.
                </li>
                <li>
                  <strong>Reviews that look manufactured.</strong> Watch for
                  comments that are generic, repetitive, or all posted within
                  the same few days — a common sign of purchased engagement.
                </li>
                <li>
                  <strong>Artificial urgency.</strong> Countdown timers,
                  &quot;only 2 left&quot;, or discounts that reset every time
                  you revisit the page are pressure tactics designed to stop
                  you from checking further.
                </li>
                <li>
                  <strong>Payment to a personal account.</strong> Being asked
                  to transfer money to an individual&apos;s bank account or
                  mobile wallet, rather than a registered business account,
                  makes the payment much harder to trace or dispute.
                </li>
                <li>
                  <strong>No real customer support.</strong> If the only way
                  to reach the seller is a personal WhatsApp number or
                  Instagram DM, with no order tracking or support channel,
                  there&apos;s nowhere to go if something goes wrong.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                What to check before you pay
              </h2>
              <ul className="list-disc space-y-3 pl-5">
                <li>
                  Search the seller&apos;s handle in the{' '}
                  <Link
                    href="/"
                    className="font-semibold text-[var(--sa-red)] hover:underline"
                  >
                    ScamAlert.pk directory and unresolved cases
                  </Link>{' '}
                  before ordering.
                </li>
                <li>
                  Ask for cash on delivery. A seller who refuses it outright,
                  with no clear reason, is worth a second look.
                </li>
                <li>
                  Search the exact product name alongside the seller&apos;s
                  handle to see if anyone has already reported an issue.
                </li>
                <li>
                  Start with a small order rather than a large one if you
                  haven&apos;t bought from the seller before.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="sa-display mb-3 text-xl font-bold">
                If you&apos;ve already been scammed
              </h2>
              <p>
                Document what you have — order details, payment proof, and
                any messages with the seller — and{' '}
                <Link
                  href="/"
                  className="font-semibold text-[var(--sa-red)] hover:underline"
                >
                  file a report on ScamAlert.pk
                </Link>
                . Reported sellers get a 72-hour window to respond before the
                report becomes part of the public record, so other buyers can
                see it before they order.
              </p>
            </section>

            <section className="border-t border-[var(--sa-border)] pt-6">
              <p className="text-sm text-[var(--sa-graphite)]">
                Related:{' '}
                <Link
                  href="/how-to-verify-online-seller-pakistan"
                  className="font-semibold text-[var(--sa-red)] hover:underline"
                >
                  How to Verify an Online Seller Before You Pay
                </Link>
              </p>
            </section>
          </div>
        </article>
      </div>
    </main>
  );
}
