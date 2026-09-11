'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function BusinessResponsePage() {
  const params = useParams<{ reportNumber: string }>();
  const search = useSearchParams();
  const [supabase] = useState(() => createClient());
  const token = search.get('token') || '';
  const reportNumber = decodeURIComponent(params.reportNumber);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState('');
  const [responseText, setResponseText] = useState('');
  const [responseType, setResponseType] = useState('response');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [refundReference, setRefundReference] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token) { setError('This response link is missing its secure token.'); return; }
      const { data, error: rpcError } = await supabase.rpc('get_business_report', { p_report_number: reportNumber, p_token: token });
      if (rpcError || !data?.length) { setError('This response link is invalid, expired, or no longer available.'); return; }
      setReport(data[0]);
      setSubmitted(Boolean(data[0].has_response));
    };
    void load();
  }, [reportNumber, token, supabase]);

  const submit = async (e: React.FormEvent) => {
  e.preventDefault();
  setSaving(true);
  setError('');

  try {
    if (proofFile) {
      const formData = new FormData();
      formData.append('file', proofFile);
      formData.append('reportNumber', reportNumber);
      formData.append('token', token);

      const uploadResponse = await fetch('/api/business-proof', {
        method: 'POST',
        body: formData,
      });

      const uploadResult = await uploadResponse.json();

      if (!uploadResponse.ok) {
        setSaving(false);
        setError(uploadResult?.error || 'Unable to upload proof.');
        return;
      }
    }

      const response = await fetch('/api/submit-business-response', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reportNumber,
          token,
          responseText,
          responseType,
          trackingNumber: trackingNumber || null,
          refundReference: refundReference || null,
        }),
      });

      const result = await response.json();

      setSaving(false);

      if (!response.ok || !result?.success) {
        setError(result?.error || 'Unable to submit response.');
        return;
      }

    setSubmitted(true);
  } catch (err: any) {
    setSaving(false);
    setError(err?.message || 'Unable to submit response.');
  }
};
  return <main className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] p-4 md:p-8">
    <div className="max-w-2xl mx-auto bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] p-5 md:p-8 space-y-6 shadow-[var(--sa-shadow-md)]">
      <div><p className="sa-mono text-[10px] uppercase tracking-[0.15em] text-[var(--sa-red-deep)] font-semibold">SCAMALERT.PK BUSINESS RESPONSE</p><h1 className="sa-display text-2xl md:text-3xl font-semibold tracking-tight mt-1">Respond to complaint {reportNumber}</h1><p className="text-xs text-[var(--sa-graphite)] mt-2">This page gives temporary access to this complaint only. No business account is required.</p></div>
      {error && <div className="border border-[var(--sa-red)]/25 bg-[var(--sa-red-soft)] text-[var(--sa-red-deep)] rounded-[10px] p-3 text-sm">{error}</div>}
      {report && <>
        <div className="grid sm:grid-cols-2 gap-3 text-sm bg-[#F7F5F2] rounded-[12px] p-4 border border-[var(--sa-border)]">
          <div><span className="text-[var(--sa-graphite)]">Business</span><p className="font-semibold">{report.brand_name}</p></div>
          <div><span className="text-[var(--sa-graphite)]">Order #</span><p className="font-semibold">{report.order_number}</p></div>
          <div><span className="text-[var(--sa-graphite)]">Platform</span><p>{report.platform} · {report.handle}</p></div>
          <div><span className="text-[var(--sa-graphite)]">Amount</span><p>PKR {Number(report.amount_paid).toLocaleString()}</p></div>
          <div className="sm:col-span-2 min-w-0"><span className="text-[var(--sa-graphite)]">Customer complaint</span><p className="mt-1 whitespace-pre-wrap break-all [overflow-wrap:anywhere]">{report.description}</p></div>
        </div>
        {submitted ? <div className="border border-[var(--sa-green)]/25 bg-[var(--sa-green-soft)] text-[var(--sa-green)] rounded-[10px] p-4">Your response has been recorded. The customer can review it from their dashboard.</div> :
        <form onSubmit={submit} className="space-y-4">
          <select
            value={responseType}
            onChange={e => {
              const nextType = e.target.value;
              setResponseType(nextType);

              if (nextType !== 'tracking_provided') {
                setTrackingNumber('');
              }

              if (nextType !== 'refund_issued') {
                setRefundReference('');
              }
            }}
            className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3 text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"
          >
            <option value="response">General response</option>
            <option value="refund_issued">Refund issued</option>
            <option value="tracking_provided">Tracking / delivery proof</option>
            <option value="order_not_recognized">Order not recognized</option>
          </select>

          <textarea
            required
            minLength={5}
            rows={6}
            value={responseText}
            onChange={e => setResponseText(e.target.value)}
            placeholder={
              responseType === 'refund_issued'
                ? 'Explain the refund, including when and how it was issued...'
                : responseType === 'tracking_provided'
                  ? 'Explain the shipment or delivery details...'
                  : responseType === 'order_not_recognized'
                    ? 'Explain why this order or transaction is not recognized...'
                    : 'Explain your response to this complaint...'
            }
            className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3 text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"
          />

          {responseType === 'tracking_provided' && (
            <input
              required
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
              className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3 text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"
            />
          )}

          {responseType === 'refund_issued' && (
            <input
              required
              value={refundReference}
              onChange={e => setRefundReference(e.target.value)}
              placeholder="Refund reference"
              className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3 text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"
            />
          )}
          <div className="space-y-2">
  <label className="block text-xs font-semibold text-[var(--sa-graphite)]">
    Attach Proof <span className="text-[var(--sa-graphite)]">(optional)</span>
  </label>

  <input
    type="file"
    accept="image/*,.pdf"
    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
    className="block w-full text-xs text-[var(--sa-graphite)] file:mr-3 file:rounded-[8px] file:border file:border-[var(--sa-border)] file:bg-white file:px-3 file:py-2 file:text-xs file:font-semibold file:text-[var(--sa-ink)] hover:file:bg-[#F7F5F2] file:cursor-pointer"
  />

  {proofFile && (
    <p className="text-xs text-[var(--sa-green)]">
      Selected: {proofFile.name}
    </p>
  )}
</div>
          <button disabled={saving} className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white rounded-[8px] py-3 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer">{saving ? 'Submitting...' : 'Submit response'}</button>
        </form>}
      </>}
    </div>
  </main>;
}
