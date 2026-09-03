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
    e.preventDefault(); setSaving(true); setError('');
    const { data, error: rpcError } = await supabase.rpc('submit_business_response', {
      p_report_number: reportNumber,
      p_token: token,
      p_response_text: responseText,
      p_response_type: responseType,
      p_tracking_number: trackingNumber || null,
      p_refund_reference: refundReference || null,
    });
    setSaving(false);
    if (rpcError || !data) { setError(rpcError?.message || 'Unable to submit response.'); return; }
    setSubmitted(true);
  };

  return <main className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
    <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8 space-y-6">
      <div><p className="text-xs font-mono text-red-400">SCAMALERT.PK BUSINESS RESPONSE</p><h1 className="text-2xl font-bold mt-1">Respond to complaint {reportNumber}</h1><p className="text-xs text-zinc-400 mt-2">This page gives temporary access to this complaint only. No business account is required.</p></div>
      {error && <div className="border border-red-500/40 bg-red-950/30 text-red-300 rounded-xl p-3 text-sm">{error}</div>}
      {report && <>
        <div className="grid sm:grid-cols-2 gap-3 text-sm bg-zinc-950 rounded-xl p-4 border border-zinc-800">
          <div><span className="text-zinc-500">Business</span><p className="font-semibold">{report.brand_name}</p></div>
          <div><span className="text-zinc-500">Order #</span><p className="font-semibold">{report.order_number}</p></div>
          <div><span className="text-zinc-500">Platform</span><p>{report.platform} · {report.handle}</p></div>
          <div><span className="text-zinc-500">Amount</span><p>PKR {Number(report.amount_paid).toLocaleString()}</p></div>
          <div className="sm:col-span-2"><span className="text-zinc-500">Customer complaint</span><p className="mt-1 whitespace-pre-wrap">{report.description}</p></div>
        </div>
        {submitted ? <div className="border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 rounded-xl p-4">Your response has been recorded. The customer can review it from their dashboard.</div> :
        <form onSubmit={submit} className="space-y-4">
          <select value={responseType} onChange={e=>setResponseType(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3">
            <option value="response">General response</option><option value="refund_issued">Refund issued</option><option value="tracking_provided">Tracking / delivery proof</option><option value="order_not_recognized">Order not recognized</option>
          </select>
          <textarea required minLength={5} rows={6} value={responseText} onChange={e=>setResponseText(e.target.value)} placeholder="Explain your response to this complaint..." className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3" />
          <div className="grid sm:grid-cols-2 gap-3"><input value={trackingNumber} onChange={e=>setTrackingNumber(e.target.value)} placeholder="Tracking number (optional)" className="bg-zinc-950 border border-zinc-700 rounded-lg p-3"/><input value={refundReference} onChange={e=>setRefundReference(e.target.value)} placeholder="Refund reference (optional)" className="bg-zinc-950 border border-zinc-700 rounded-lg p-3"/></div>
          <button disabled={saving} className="w-full bg-red-600 hover:bg-red-700 rounded-xl py-3 font-bold disabled:opacity-50">{saving ? 'Submitting...' : 'Submit response'}</button>
        </form>}
      </>}
    </div>
  </main>;
}
