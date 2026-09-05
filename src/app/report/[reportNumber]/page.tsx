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
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <p className="text-zinc-400">Loading report...</p>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-xl w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="text-red-400 font-mono text-xs font-bold mb-3">
            REPORT UNAVAILABLE
          </div>

          <h1 className="text-xl font-bold mb-2">
            Report not publicly available
          </h1>

          <p className="text-sm text-zinc-400">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-zinc-950 text-white py-10 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="text-xs font-mono font-bold text-red-400 mb-2">
            PUBLIC REPORT
          </p>

          <h1 className="text-3xl font-bold">{report.brand_name}</h1>

          <p className="text-sm text-zinc-500 mt-2 font-mono">
            {report.report_number}
          </p>
        </div>

        <div className="bg-zinc-900 border border-red-500/30 rounded-2xl p-6 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <Detail label="Platform" value={report.platform} />
            <div>
  <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
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
    className="text-sm text-red-400 hover:text-red-300 hover:underline break-words"
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

          <div className="border-t border-zinc-800 pt-5">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-2">
              Customer Report
            </p>

            <p className="text-sm text-zinc-200 whitespace-pre-wrap">
              {report.description || 'No description provided.'}
            </p>
          </div>
          {evidence.length > 0 && (
  <div className="border-t border-zinc-800 pt-5">
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
          className="block bg-zinc-950 border border-zinc-800 rounded-xl overflow-hidden hover:border-red-500/40 transition"
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

          <div className="px-3 py-2 border-t border-zinc-800">
            <p className="text-xs text-zinc-400 truncate">
              {item.file_name || 'Evidence'}
            </p>
          </div>
        </a>
      ))}
    </div>
  </div>
)}

          {report.business_response_text && (
            <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4">
              <p className="text-[10px] uppercase tracking-wider text-emerald-400 mb-2">
                Business Response
              </p>

              <p className="text-sm text-zinc-200 whitespace-pre-wrap">
                {report.business_response_text}
              </p>

              {report.business_response_type && (
                <p className="text-xs text-zinc-500 mt-3">
                  Response type: {report.business_response_type}
                </p>
              )}
            </div>
          )}
        </div>

        <p className="text-xs text-zinc-600 text-center">
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
      <p className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </p>
      <p className="text-sm text-zinc-200 break-words">{value}</p>
    </div>
  );
}