'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function PublicReportPage() {
  const params = useParams<{ reportNumber: string }>();
  const reportNumber = decodeURIComponent(params.reportNumber);

  const [supabase] = useState(() => createClient());
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [evidence, setEvidence] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);

  const getPublicReportUrl = () => {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}/report/${encodeURIComponent(reportNumber)}`;
  };

  const handleWhatsAppShare = () => {
    const publicUrl = getPublicReportUrl();
    if (!publicUrl) return;

    const message = [
      `ScamAlert.pk Report: ${report?.brand_name || 'Reported seller'}`,
      `Report #${reportNumber}`,
      `Read the public report: ${publicUrl}`,
    ].join('\n');

    window.open(
      `https://wa.me/?text=${encodeURIComponent(message)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleCopyLink = async () => {
    const publicUrl = getPublicReportUrl();
    if (!publicUrl) return;

    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (copyError) {
      console.error('Unable to copy report link:', copyError);
    }
  };


  const handleFacebookShare = () => {
    const publicUrl = getPublicReportUrl();
    if (!publicUrl) return;

    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(publicUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleXShare = () => {
    const publicUrl = getPublicReportUrl();
    if (!publicUrl) return;

    const text = `ScamAlert.pk Report: ${report?.brand_name || 'Reported seller'} — Report #${reportNumber}`;

    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(publicUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };

  const handleLinkedInShare = () => {
    const publicUrl = getPublicReportUrl();
    if (!publicUrl) return;

    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(publicUrl)}`,
      '_blank',
      'noopener,noreferrer'
    );
  };
  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      setError('');

      const { data, error: rpcError } = await supabase.rpc(
        'get_public_report',
        {
          p_report_number: reportNumber,
        }
      );

      if (rpcError) {
        console.error(rpcError);
        setError('Unable to load this report.');
        setLoading(false);
        return;
      }

      if (!data?.length) {
        setError(
          'This report is not publicly available, has been resolved, or is still within its 72-hour response window.'
        );
        setLoading(false);
        return;
      }

      const publicReport = data[0];

const { data: evidenceRows, error: evidenceError } = await supabase.rpc(
  'public_expired_evidence'
);

if (evidenceError) {
  console.error(evidenceError);
} else {
  const matchingEvidence = (evidenceRows || []).filter(
    (item: any) => item.report_id === publicReport.id
  );

  const signedEvidence = await Promise.all(
    matchingEvidence.map(async (item: any) => {
      const { data: signed, error: signedError } = await supabase.storage
  .from('report-evidence')
  .createSignedUrl(item.storage_path, 60 * 60);

if (signedError) {
  console.error('Evidence signed URL error:', signedError);
}

      return {
        ...item,
        url: signed?.signedUrl || '',
      };
    })
  );

  setEvidence(signedEvidence);
}

setReport(publicReport);
      setLoading(false);
    };

    void loadReport();
  }, [reportNumber, supabase]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] flex items-center justify-center p-6">
        <p className="text-zinc-400">Loading report...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] p-6 shadow-[var(--sa-shadow-md)]">
          <div className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-red-deep)] font-semibold mb-3">
            REPORT UNAVAILABLE
          </div>

          <h1 className="sa-display text-xl font-semibold text-[var(--sa-ink)] mb-2">
            Report not publicly available
          </h1>

          <p className="text-sm text-[var(--sa-graphite)]">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] py-8 md:py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-red-deep)] font-semibold mb-2">
            PUBLIC REPORT
          </p>

          <h1 className="sa-display text-3xl font-semibold tracking-tight text-[var(--sa-ink)]">{report.brand_name}</h1>

          <p className="text-sm text-zinc-500 mt-2 font-mono">
            {report.report_number}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            <button
              type="button"
              onClick={handleWhatsAppShare}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-4 py-2 text-sm font-medium text-[var(--sa-ink)] transition cursor-pointer hover:bg-zinc-50"
            >
              Share on WhatsApp
            </button>

            <button
              type="button"
              onClick={handleFacebookShare}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-4 py-2 text-sm font-medium text-[var(--sa-ink)] transition cursor-pointer hover:bg-zinc-50"
            >
              Facebook
            </button>

            <button
              type="button"
              onClick={handleXShare}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-4 py-2 text-sm font-medium text-[var(--sa-ink)] transition cursor-pointer hover:bg-zinc-50"
            >
              X
            </button>

            <button
              type="button"
              onClick={handleLinkedInShare}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-4 py-2 text-sm font-medium text-[var(--sa-ink)] transition cursor-pointer hover:bg-zinc-50"
            >
              LinkedIn
            </button>

            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center rounded-[10px] border border-[var(--sa-border)] bg-[var(--sa-surface)] px-4 py-2 text-sm font-medium text-[var(--sa-ink)] transition cursor-pointer hover:bg-zinc-50"
            >
              {copied ? 'Link copied' : 'Copy link'}
            </button>
          </div>
        </div>

        <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] p-5 md:p-6 space-y-6 shadow-[var(--sa-shadow-md)]">
          <div className="grid sm:grid-cols-2 gap-4">
            <Detail label="Platform" value={report.platform} />
            <div>
  <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-graphite)] mb-1">
    Handle
  </p>

  <a
    href={
      report.platform?.toLowerCase() === 'instagram'
        ? `https://instagram.com/${String(report.handle).replace(/^@/, '')}`
        : report.platform?.toLowerCase() === 'facebook'
        ? `https://facebook.com/${String(report.handle).replace(/^@/, '')}`
        : report.platform?.toLowerCase() === 'tiktok'
        ? `https://tiktok.com/@${String(report.handle).replace(/^@/, '')}`
        : report.platform?.toLowerCase() === 'x' ||
          report.platform?.toLowerCase() === 'twitter'
        ? `https://x.com/${String(report.handle).replace(/^@/, '')}`
        : '#'
    }
    target="_blank"
    rel="noopener noreferrer"
    className="text-sm text-[var(--sa-red-deep)] hover:text-[var(--sa-red)] hover:underline break-words"
  >
    {report.handle}
  </a>
</div>
            <Detail label="Email" value={report.brand_email} />
            <Detail label="WhatsApp / Phone" value={report.brand_whatsapp} />
            <Detail label="Order Number" value={report.order_number} />
            <Detail label="Order Date" value={report.order_date} />
            <Detail
              label="Amount Paid"
              value={
                report.amount_paid != null
                  ? `PKR ${report.amount_paid}`
                  : null
              }
            />
            <Detail label="Payment Method" value={report.payment_method} />
          </div>

          <div className="border-t border-[var(--sa-border)] pt-5">
            <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-graphite)] mb-2">
              Customer Report
            </p>

            <p className="text-sm text-[var(--sa-ink)] whitespace-pre-wrap">
              {report.description || 'No description provided.'}
            </p>
          </div>
          {evidence.length > 0 && (
  <div className="border-t border-[var(--sa-border)] pt-5">
    <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-3">
      Customer Evidence
    </p>

    <div className="grid sm:grid-cols-2 gap-3">
      {evidence.map((item: any) => (
        <a
          key={item.storage_path}
          href={item.url || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="block bg-[#F7F5F2] border border-[var(--sa-border)] rounded-[12px] overflow-hidden hover:border-[var(--sa-red)]/40 transition"
        >
          {item.mime_type?.startsWith('image/') && item.url ? (
            <img
              src={item.url}
              alt={item.file_name || 'Report evidence'}
              className="w-full max-h-72 object-contain bg-black"
            />
          ) : (
            <div className="p-4 text-sm text-zinc-300">
              View evidence file
            </div>
          )}

          <div className="px-3 py-2 border-t border-[var(--sa-border)]">
            <p className="text-xs text-zinc-400 truncate">
              {item.file_name || 'Evidence'}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
)}

          {(report.business_response_text ||
            report.customer_final_response_text) && (
            <div className="border-t border-[var(--sa-border)] pt-5 space-y-4">
              <div>
                <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-graphite)] mb-1">
                  Case History
                </p>
                <p className="text-xs text-[var(--sa-graphite)]">
                  Response history for this unresolved public report.
                </p>
              </div>

              {report.business_response_text && (
                <div className="bg-[var(--sa-green-soft)] border border-[var(--sa-green)]/25 rounded-[12px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-green)] font-semibold">
                      Business Response
                    </p>

                    {report.business_responded_at && (
                      <p className="text-[11px] text-[var(--sa-graphite)]">
                        {new Date(report.business_responded_at).toLocaleString('en-PK')}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-[var(--sa-ink)] whitespace-pre-wrap">
                    {report.business_response_text}
                  </p>

                  <div className="mt-3 space-y-1">
                    {report.business_response_type && (
                      <p className="text-xs text-[var(--sa-graphite)]">
                        Response type:{' '}
                        {String(report.business_response_type).replaceAll('_', ' ')}
                      </p>
                    )}

                    {report.business_tracking_number && (
                      <p className="text-xs text-[var(--sa-ink)]">
                        <span className="font-medium">Tracking number:</span>{' '}
                        {report.business_tracking_number}
                      </p>
                    )}

                    {report.business_refund_reference && (
                      <p className="text-xs text-[var(--sa-ink)]">
                        <span className="font-medium">Refund reference:</span>{' '}
                        {report.business_refund_reference}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {report.customer_final_response_text && (
                <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[12px] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-red-deep)] font-semibold">
                      Customer Final Response
                    </p>

                    {report.customer_final_responded_at && (
                      <p className="text-[11px] text-[var(--sa-graphite)]">
                        {new Date(report.customer_final_responded_at).toLocaleString('en-PK')}
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-[var(--sa-ink)] whitespace-pre-wrap">
                    {report.customer_final_response_text}
                  </p>

                  {report.customer_resolution_choice && (
                    <div className="mt-3">
                      <span className="inline-flex items-center rounded-full border border-[var(--sa-border)] px-2.5 py-1 text-xs font-medium text-[var(--sa-ink)]">
                        {report.customer_resolution_choice === 'resolved'
                          ? 'Satisfied · Resolved'
                          : 'Not Satisfied · Report Active'}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-[var(--sa-graphite)] text-center leading-relaxed">
          This page displays a user-submitted report after the business response
          window has expired. A report does not independently establish wrongdoing.
        </p>
      </div>
    </main>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  if (value === null || value === undefined || value === '') return null;

  return (
    <div>
      <p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-graphite)] mb-1">
        {label}
      </p>
      <p className="text-sm text-[var(--sa-ink)] break-words">{value}</p>
    </div>
  );
}