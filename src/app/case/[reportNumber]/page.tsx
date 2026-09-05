'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function CustomerCasePage() {
  const params = useParams<{ reportNumber: string }>();
  const router = useRouter();
  const reportNumber = decodeURIComponent(params.reportNumber);

  const [supabase] = useState(() => createClient());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [report, setReport] = useState<any>(null);
  const [userId, setUserId] = useState('');

  const [previewEvidence, setPreviewEvidence] = useState<{
    url: string;
    name: string;
    type?: string;
  } | null>(null);

  const [evidenceLoading, setEvidenceLoading] = useState(false);

  const [finalResponse, setFinalResponse] = useState<any>(null);
  const [finalResponseText, setFinalResponseText] = useState('');
  const [resolutionChoice, setResolutionChoice] = useState('keep_active');
  const [finalSubmitting, setFinalSubmitting] = useState(false);
  const [finalError, setFinalError] = useState('');
  const [finalSuccess, setFinalSuccess] = useState('');

  useEffect(() => {
    const loadCase = async () => {
      setLoading(true);
      setError('');

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/');
        return;
      }

      setUserId(user.id);

      const { data, error: reportError } = await supabase
        .from('reports')
        .select(`
          id,
          report_number,
          brand_name,
          handle,
          platform,
          status,
          created_at,
          public_at,
          resolved_at,
          order_number,
          amount_paid,
          payment_method,
          description,
          business_responded_at,

          report_evidence (
            storage_path,
            file_name,
            mime_type
          ),

          business_responses (
            response_text,
            response_type,
            tracking_number,
            refund_reference,
            created_at
          ),

          evidence_files (
            storage_path,
            file_name,
            file_type,
            uploaded_by_role,
            evidence_stage
          )
        `)
        .eq('report_number', reportNumber)
        .eq('user_id', user.id)
        .single();

      if (reportError || !data) {
        console.error('CASE LOAD ERROR:', reportError);

        setError(
          reportError?.message ||
            'Report not found or you do not have access to it.'
        );

        setLoading(false);
        return;
      }

      const customerEvidence = await Promise.all(
        (data.report_evidence || []).map(async (ev: any) => {
          const signed = await supabase.storage
            .from('report-evidence')
            .createSignedUrl(ev.storage_path, 3600);

          return {
            ...ev,
            url: signed.data?.signedUrl || null,
          };
        })
      );

      const businessEvidence = await Promise.all(
        (data.evidence_files || [])
          .filter(
            (ev: any) =>
              ev.uploaded_by_role === 'business' &&
              ev.evidence_stage === 'business_response'
          )
          .map(async (ev: any) => {
            const signed = await supabase.storage
              .from('report-evidence')
              .createSignedUrl(ev.storage_path, 3600);

            return {
              ...ev,
              url: signed.data?.signedUrl || null,
            };
          })
      );

      const { data: existingFinal, error: finalLoadError } = await supabase
        .from('customer_final_responses')
        .select(`
          id,
          report_id,
          user_id,
          response_text,
          resolution_choice,
          created_at
        `)
        .eq('report_id', data.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (finalLoadError) {
        console.error('FINAL RESPONSE LOAD ERROR:', finalLoadError);
      }

      setFinalResponse(existingFinal || null);

      setReport({
        ...data,
        customerEvidence,
        businessEvidence,
      });

      setLoading(false);
    };

    void loadCase();
  }, [reportNumber, router, supabase]);

  const submitFinalResponse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!report || !userId || finalSubmitting || finalResponse) return;

    const cleanText = finalResponseText.trim();

    if (cleanText.length < 5) {
      setFinalError('Please enter at least 5 characters.');
      return;
    }

    setFinalSubmitting(true);
    setFinalError('');
    setFinalSuccess('');

    const { data: inserted, error: insertError } = await supabase
      .from('customer_final_responses')
      .insert({
        report_id: report.id,
        user_id: userId,
        response_text: cleanText,
        resolution_choice: resolutionChoice,
      })
      .select(`
        id,
        report_id,
        user_id,
        response_text,
        resolution_choice,
        created_at
      `)
      .single();

    if (insertError) {
      console.error('FINAL RESPONSE INSERT ERROR:', insertError);

      setFinalError(
        insertError.code === '23505'
          ? 'Your final response has already been submitted.'
          : insertError.message || 'Unable to submit your final response.'
      );

      setFinalSubmitting(false);
      return;
    }

    if (resolutionChoice === 'resolved') {
      const { error: resolveError } = await supabase
        .from('reports')
        .update({
          status: 'resolved',
          resolved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', report.id)
        .eq('user_id', userId);

      if (resolveError) {
        console.error('REPORT RESOLVE ERROR:', resolveError);

        setFinalError(
          'Your final response was saved, but the report could not be marked resolved.'
        );
      } else {
        setReport((current: any) => ({
          ...current,
          status: 'resolved',
          resolved_at: new Date().toISOString(),
        }));
      }
    }

    setFinalResponse(inserted);
    setFinalResponseText('');

    setFinalSuccess(
      resolutionChoice === 'resolved'
        ? 'Your final response was submitted and the report was marked resolved.'
        : 'Your final response was submitted. The report will remain active.'
    );

    setFinalSubmitting(false);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          Loading report...
        </div>
      </main>
    );
  }

  if (error || !report) {
    return (
      <main className="min-h-screen bg-zinc-950 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/')}
            className="text-sm text-zinc-400 hover:text-white mb-6 cursor-pointer"
          >
            ← Back to dashboard
          </button>

          <div className="border border-red-500/40 bg-red-950/20 rounded-xl p-4 text-red-300">
            {error}
          </div>
        </div>
      </main>
    );
  }

  const businessResponse = Array.isArray(report.business_responses)
    ? report.business_responses[0]
    : report.business_responses;

  const isResolved = report.status === 'resolved';
  const isPublic = new Date(report.public_at) <= new Date();

  const caseStatus = isResolved
    ? 'Resolved'
    : isPublic
      ? 'Unresolved · Public'
      : finalResponse
        ? finalResponse.resolution_choice === 'resolved'
          ? 'Resolved'
          : 'Customer Replied · Report Remains Active'
        : businessResponse
          ? 'Brand Responded · Awaiting Your Review'
          : 'Waiting for Brand Response';

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        <button
          onClick={() => router.push('/')}
          className="text-sm text-zinc-400 hover:text-white cursor-pointer"
        >
          ← Back to dashboard
        </button>

        {/* REPORT HEADER */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <p className="font-mono text-xs text-yellow-400 font-bold">
                {report.report_number}
              </p>

              <h1 className="text-2xl font-bold mt-2">
                {report.brand_name}
              </h1>

              <p className="text-sm text-zinc-400 mt-1">
                {report.platform} · {report.handle}
              </p>
            </div>

            <span className="text-xs px-3 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-semibold">
              {caseStatus}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mt-6 text-sm">
            <div>
              <p className="text-zinc-500">Order #</p>
              <p>{report.order_number}</p>
            </div>

            <div>
              <p className="text-zinc-500">Amount</p>
              <p>
                PKR {Number(report.amount_paid || 0).toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Payment method</p>
              <p>{report.payment_method || 'Not provided'}</p>
            </div>

            <div>
              <p className="text-zinc-500">Filed on</p>
              <p>
                {new Date(report.created_at).toLocaleDateString('en-PK')}
              </p>
            </div>
          </div>
        </div>

        {/* CUSTOMER COMPLAINT */}

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
            Your complaint
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm">
            {report.description}
          </p>
        </div>

        {/* CUSTOMER ORIGINAL EVIDENCE */}

        {report.customerEvidence?.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-bold">
              Your evidence
            </p>

            <div className="flex flex-wrap gap-2 mt-3">
              {report.customerEvidence.map((ev: any) => (
                <button
                  key={ev.storage_path}
                  type="button"
                  onClick={() => {
                    if (!ev.url) return;

                    setEvidenceLoading(true);

                    setPreviewEvidence({
                      url: ev.url,
                      name: ev.file_name || 'Evidence',
                      type: ev.mime_type,
                    });
                  }}
                  className="text-sm border border-zinc-700 bg-zinc-950 hover:border-yellow-500/50 px-3 py-2 rounded-lg cursor-pointer"
                >
                  {ev.file_name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* BUSINESS RESPONSE */}

        {businessResponse ? (
          <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-6">
            <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
              Business response
            </p>

            <p className="mt-3 whitespace-pre-wrap text-sm">
              {businessResponse.response_text}
            </p>

            {businessResponse.tracking_number && (
              <p className="text-sm mt-4">
                <span className="text-zinc-500">
                  Tracking number:{' '}
                </span>

                {businessResponse.tracking_number}
              </p>
            )}

            {businessResponse.refund_reference && (
              <p className="text-sm mt-2">
                <span className="text-zinc-500">
                  Refund reference:{' '}
                </span>

                {businessResponse.refund_reference}
              </p>
            )}

            {report.businessEvidence?.length > 0 && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wider text-emerald-400 font-bold">
                  Business proof
                </p>

                <div className="flex flex-wrap gap-2 mt-2">
                  {report.businessEvidence.map((ev: any) => (
                    <button
                      key={ev.storage_path}
                      type="button"
                      onClick={() => {
                        if (!ev.url) return;

                        setEvidenceLoading(true);

                        setPreviewEvidence({
                          url: ev.url,
                          name: ev.file_name || 'Business proof',
                          type: ev.file_type,
                        });
                      }}
                      className="text-sm border border-emerald-500/30 bg-zinc-950 hover:border-emerald-400 px-3 py-2 rounded-lg cursor-pointer"
                    >
                      {ev.file_name || 'Open proof'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-zinc-500 mt-4">
              Responded{' '}
              {new Date(
                businessResponse.created_at
              ).toLocaleString('en-PK')}
            </p>
          </div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            <p className="text-sm text-yellow-400">
              Waiting for business response.
            </p>
          </div>
        )}

        {/* CUSTOMER FINAL RESPONSE FORM */}

        {businessResponse &&
          !finalResponse &&
          !isResolved && (
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-yellow-400 font-bold">
                    Your final response
                  </p>

                  <h2 className="text-lg font-bold text-white mt-1">
                    Are you satisfied with the business response?
                  </h2>

                  <p className="text-xs text-zinc-500 mt-1">
                    You can submit this response only once.
                  </p>
                </div>

                <span className="text-[10px] border border-red-500/30 bg-red-500/10 text-red-300 rounded-lg px-2 py-1 whitespace-nowrap">
                  ONE-TIME REPLY
                </span>
              </div>

              <form
                onSubmit={submitFinalResponse}
                className="space-y-4 mt-5"
              >
                <div className="grid sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setResolutionChoice('resolved')
                    }
                    className={`text-left rounded-xl border p-4 cursor-pointer transition ${
                      resolutionChoice === 'resolved'
                        ? 'border-emerald-500 bg-emerald-950/30'
                        : 'border-zinc-700 bg-zinc-950 hover:border-zinc-600'
                    }`}
                  >
                    <p className="font-semibold text-sm text-white">
                      ✓ I am satisfied
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      Submit your final words and resolve this report.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setResolutionChoice('keep_active')
                    }
                    className={`text-left rounded-xl border p-4 cursor-pointer transition ${
                      resolutionChoice === 'keep_active'
                        ? 'border-red-500 bg-red-950/20'
                        : 'border-zinc-700 bg-zinc-950 hover:border-zinc-600'
                    }`}
                  >
                    <p className="font-semibold text-sm text-white">
                      Keep report active
                    </p>

                    <p className="text-xs text-zinc-500 mt-1">
                      You are not satisfied and want the report to remain active.
                    </p>
                  </button>
                </div>

                <textarea
                  required
                  minLength={5}
                  rows={5}
                  value={finalResponseText}
                  onChange={(e) =>
                    setFinalResponseText(e.target.value)
                  }
                  placeholder={
                    resolutionChoice === 'resolved'
                      ? 'Explain why you are satisfied with the resolution...'
                      : 'Explain why you are not satisfied and why the report should remain active...'
                  }
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-xl p-4 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-red-500"
                />

                {finalError && (
                  <div className="border border-red-500/30 bg-red-950/20 rounded-xl p-3 text-sm text-red-300">
                    {finalError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={finalSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 font-bold text-white disabled:opacity-50 cursor-pointer"
                >
                  {finalSubmitting
                    ? 'Submitting...'
                    : 'Submit Final Response'}
                </button>

                <p className="text-[11px] text-zinc-500 text-center">
                  After submission, your final response cannot be edited or submitted again.
                </p>
              </form>
            </div>
          )}

        {/* CUSTOMER FINAL RESPONSE ALREADY SUBMITTED */}

        {finalResponse && (
          <div className="bg-blue-950/20 border border-blue-500/30 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wider text-blue-400 font-bold">
                  Your final response
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-200">
                  {finalResponse.response_text}
                </p>
              </div>

              <span
                className={`text-xs px-3 py-2 rounded-lg border font-semibold whitespace-nowrap ${
                  finalResponse.resolution_choice === 'resolved'
                    ? 'border-emerald-500/30 bg-emerald-950/30 text-emerald-400'
                    : 'border-red-500/30 bg-red-950/20 text-red-300'
                }`}
              >
                {finalResponse.resolution_choice === 'resolved'
                  ? 'Satisfied · Resolved'
                  : 'Not Satisfied · Report Active'}
              </span>
            </div>

            <p className="text-xs text-zinc-500 mt-4">
              Submitted{' '}
              {new Date(
                finalResponse.created_at
              ).toLocaleString('en-PK')}
            </p>
          </div>
        )}

        {finalSuccess && (
          <div className="border border-emerald-500/30 bg-emerald-950/20 rounded-xl p-4 text-sm text-emerald-300">
            {finalSuccess}
          </div>
        )}

      </div>

      {/* EVIDENCE PREVIEW */}

      {previewEvidence && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewEvidence(null)}
        >
          <div
            className="relative w-full max-w-5xl max-h-[90vh] bg-zinc-900 border border-zinc-700 rounded-2xl p-4 overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setPreviewEvidence(null)}
              className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/80 border border-zinc-700 text-white text-2xl flex items-center justify-center hover:bg-zinc-800 cursor-pointer"
              aria-label="Close evidence"
            >
              ×
            </button>

            <p className="text-sm font-semibold text-white pr-12 mb-3">
              {previewEvidence.name}
            </p>

            {previewEvidence.type === 'application/pdf' ? (
              <iframe
                src={previewEvidence.url}
                className="w-full h-[75vh] rounded-xl bg-white"
                title={previewEvidence.name}
              />
            ) : (
              <div className="relative min-h-[300px] flex items-center justify-center bg-black rounded-xl">
                {evidenceLoading && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-300">
                    <div className="w-8 h-8 border-2 border-zinc-600 border-t-white rounded-full animate-spin" />

                    <p className="text-sm mt-3">
                      Loading evidence...
                    </p>
                  </div>
                )}

                <img
                  src={previewEvidence.url}
                  alt={previewEvidence.name}
                  onLoad={() =>
                    setEvidenceLoading(false)
                  }
                  onError={() =>
                    setEvidenceLoading(false)
                  }
                  className={`w-full max-h-[75vh] object-contain rounded-xl ${
                    evidenceLoading
                      ? 'opacity-0'
                      : 'opacity-100'
                  }`}
                />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}