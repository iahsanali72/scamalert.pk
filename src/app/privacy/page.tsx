import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ScamAlert.pk collects, uses, and protects your data when you file or view fraud reports.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-[#F7F8FA] text-[#172033]">
      <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
        <a
          href="/"
          className="mb-8 inline-flex text-sm font-semibold text-[#16835D] hover:underline"
        >
          ← Back to ScamAlert.pk
        </a>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
          <header className="border-b border-slate-200 pb-7">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-[#16835D]">
              ScamAlert.pk
            </p>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Privacy Policy
            </h1>
            <p className="mt-3 text-sm text-slate-500">
              Last updated: September 9, 2026
            </p>
          </header>

          <div className="mt-8 space-y-8 leading-7 text-slate-700">
            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                1. Introduction
              </h2>
              <p>
                ScamAlert.pk is a consumer reporting and dispute-resolution
                platform designed to help consumers document experiences with
                businesses and give businesses an opportunity to respond.
                This Privacy Policy explains how we collect, use, store and
                protect information when you use ScamAlert.pk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                2. Information We Collect
              </h2>
              <p>
                We may collect information you provide when creating an
                account, submitting a report, responding to a report or
                communicating with ScamAlert.pk. This may include your name,
                email address, report details, business information, order or
                transaction information, descriptions of your experience and
                supporting evidence that you choose to upload.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                3. Account and Authentication Information
              </h2>
              <p>
                We use authentication services to create and secure user
                accounts. If you choose to sign in using a third-party service
                such as Google, we may receive basic account information
                permitted by that service, such as your name and email
                address. We do not receive your Google password.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                4. How We Use Information
              </h2>
              <p>
                We use information to operate ScamAlert.pk, authenticate users,
                process and display reports, notify relevant parties, enable
                business responses and customer verdicts, prevent abuse,
                investigate platform misuse, maintain security and improve the
                service.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                5. Public Reports
              </h2>
              <p>
                ScamAlert.pk is designed as a reporting platform. Information
                submitted as part of a report may become publicly visible
                according to the platform's reporting and review process.
                Users should not submit passwords, payment-card numbers,
                government identification numbers or other unnecessary
                sensitive personal information in public report fields.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                6. Evidence and Uploaded Files
              </h2>
              <p>
                Users may provide supporting files or evidence in connection
                with a report or response. We process and store these materials
                for purposes related to the report, dispute process, platform
                integrity and abuse prevention. Access to evidence may be
                restricted depending on the function it serves.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                7. Service Providers
              </h2>
              <p>
                We may use third-party service providers for functions such as
                authentication, database hosting, website hosting, email
                delivery and infrastructure. These providers may process
                information as necessary to provide their services to
                ScamAlert.pk.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                8. Data Security
              </h2>
              <p>
                We use reasonable technical and organisational measures
                intended to protect information and restrict unauthorised
                access. However, no internet-based service or method of
                electronic storage can guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                9. Data Retention
              </h2>
              <p>
                We may retain account information, reports, responses,
                evidence, security records and related information for as long
                as reasonably necessary to operate the platform, maintain the
                integrity of its reporting history, comply with legal
                obligations, resolve disputes and prevent abuse.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                10. Your Choices and Account Deletion
              </h2>
              <p>
                You can request deletion of your account and its associated
                personal data (email, profile details, login) at any time
                through our{' '}
                <a href="/delete-account" className="font-semibold text-[#16835D] hover:underline">
                  account deletion request page
                </a>
                , whether or not you are currently signed in. Deleting your
                account also deletes any reports you filed, their evidence,
                and any messages tied to them, since that content is directly
                associated with your account.
              </p>
              <p className="mt-3">
                Requests are reviewed manually before being completed, since
                the request form is not behind a login and we take reasonable
                steps to confirm it is really you before permanently deleting
                anything. We aim to complete valid requests within a few
                business days. Certain information may still need to be
                retained where necessary for security, legal compliance,
                fraud prevention or the integrity of reports and dispute
                records not tied to the deleted account.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                11. Changes to This Policy
              </h2>
              <p>
                We may update this Privacy Policy as ScamAlert.pk develops.
                The latest version will be published on this page with an
                updated effective date.
              </p>
            </section>

            <section>
              <h2 className="mb-3 text-xl font-bold text-[#172033]">
                12. Contact
              </h2>
              <p>
                For privacy questions or requests, contact ScamAlert.pk through
                the contact information provided on our website.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}