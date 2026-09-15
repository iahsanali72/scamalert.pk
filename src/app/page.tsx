'use client';

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import type { User } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase/client';

interface FeedItem {
  id: string;
  brand: string;
  handle: string;
  platform: string;
  reportCount: number;
}

interface BrandDirectoryItem {
  name: string;
  handle: string;
  platform: string;
  score: number;
  verified: boolean;
  resolvedCases: number;
  openDisputes: number;
}

interface BlacklistItem {
  id: string;
  brand: string;
  handle: string;
  platform: string;
  reason: string;
  dateBlacklisted: string;
  trustScore: number;
}

interface EvidenceItem {
  storage_path: string;
  file_name: string;
  mime_type: string;
  url: string | null;
}

interface PublicEvidenceItem extends EvidenceItem {
  report_id: string;
}

interface ExpiredReport {
  id: string;
  report_number: string;
  brand_name: string;
  handle: string;
  platform: string;
  order_number: string;
  amount_paid: number;
  payment_method: string;
  order_date: string | null;
  description: string;
  brand_email: string | null;
  brand_whatsapp: string | null;
  business_response_text: string | null;
}

interface BusinessResponse {
  response_text: string;
  response_type: string;
  tracking_number: string | null;
  refund_reference: string | null;
  created_at: string;
}

interface CustomerFinalResponse {
  response_text: string;
  resolution_choice: string;
  created_at: string;
}

interface ReportDraft {
  reportBrandName: string;
  reportHandle: string;
  reportPlatform: string;
  reportOrderNumber: string;
  reportBrandEmail: string;
  reportBrandWhatsapp: string;
  reportOrderDate: string;
  reportAmount: string;
  reportPaymentMethod: string;
  reportDescription: string;
}

interface FeedRow {
  feed_key: string;
  brand: string;
  handle: string;
  platform: string;
  report_count: number | string;
}

interface DirectoryRow {
  name: string;
  handle: string;
  platform: string;
  score: number | string;
  verified: boolean;
  resolved_cases: number | string;
  open_disputes: number | string;
}

interface BlacklistRow {
  id: string;
  brand: string;
  handle: string;
  platform: string;
  reason: string;
  date_blacklisted: string;
  trust_score: number;
}

interface Ticket {
  dbId: string;
  id: string;
  brand: string;
  handle: string;
  platform: string;
  status: string;
  timeLeft: string;
  date: string;
  publicAt: string;
  orderNumber: string;
  brandEmail: string | null;
  brandWhatsapp: string | null;
  amount: number;
  paymentMethod: string;
  description: string;
  emailStatus: string | null;
  whatsappStatus: string | null;
  businessResponse: BusinessResponse | null;
  customerFinalResponse: CustomerFinalResponse | null;
  evidence: EvidenceItem[];
}

/** Raw shape of a single row from the `reports` Supabase query in loadUserReports,
 * before it's transformed into a Ticket. Supabase infers to-one relations as an
 * array or a single object depending on the FK, so both are accepted here. */
interface RawReportRow {
  id: string;
  report_number: string;
  brand_name: string;
  handle: string;
  platform: string;
  status: string;
  public_at: string;
  created_at: string;
  order_number: string;
  brand_email: string | null;
  brand_whatsapp: string | null;
  amount_paid: number;
  payment_method: string;
  description: string;
  email_notification_status: string | null;
  whatsapp_notification_status: string | null;
  business_responded_at: string | null;
  business_responses: BusinessResponse | BusinessResponse[] | null;
  customer_final_responses: CustomerFinalResponse | CustomerFinalResponse[] | null;
  report_evidence: { storage_path: string; file_name: string; mime_type: string }[] | null;
}

function ScamAlertLogo({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3.5 cursor-pointer group select-none"
    >
      <svg
        width="46"
        height="46"
        viewBox="0 0 64 64"
        aria-label="ScamAlert.pk bell mark"
        className="shrink-0"
      >
        <path
          d="M32 12c8.3 0 15 6.7 15 15v10l4 6H13l4-6V27c0-8.3 6.7-15 15-15z"
          fill="#E5342A"
        />
        <circle cx="32" cy="49" r="5" fill="#17150F" />
        <rect
          x="2"
          y="20"
          width="5"
          height="14"
          rx="2.5"
          fill="#17150F"
          opacity="0.3"
        />
        <rect
          x="57"
          y="20"
          width="5"
          height="14"
          rx="2.5"
          fill="#17150F"
          opacity="0.3"
        />
      </svg>

      <div className="flex flex-col">
        <div className="flex items-baseline">
          <span className="sa-display font-bold text-[23px] tracking-[-0.04em] leading-none text-[var(--sa-ink)]">
            SCAMALERT
          </span>
          <span className="sa-display font-bold text-[23px] tracking-[-0.04em] leading-none text-[var(--sa-red)]">
            .PK
          </span>
        </div>

        <span className="sa-mono text-[9px] uppercase tracking-[0.16em] text-[var(--sa-graphite)] mt-1">
          Report today, protect others.
        </span>
      </div>
    </div>
  );
}

/* =========================================================
   PLATFORM ICON
   Small logo shown beside the seller handle
   ========================================================= */

function PlatformIcon({ platform }: { platform: string }) {
  const lower = platform.toLowerCase();

  if (lower.includes('instagram')) {
    return (
      <span
        title="Instagram"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 text-white shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle
            cx="17.5"
            cy="6.5"
            r="1"
            fill="currentColor"
            stroke="none"
          />
        </svg>
      </span>
    );
  }

  if (lower.includes('facebook')) {
    return (
      <span
        title="Facebook"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-blue-600 text-white shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 8h3V4h-3c-3.3 0-5 1.7-5 5v3H6v4h3v8h4v-8h3.2l.8-4H13V9c0-.7.3-1 1-1z" />
        </svg>
      </span>
    );
  }

  if (lower.includes('whatsapp')) {
    return (
      <span
        title="WhatsApp"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-emerald-500 text-white shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M20 11.5a8 8 0 01-11.7 7.1L4 20l1.4-4.1A8 8 0 1120 11.5z" />
          <path d="M8.5 8.5c.3-.4.7-.4 1-.1l1 1.2c.2.3.2.6 0 .9l-.5.6c.6 1.2 1.6 2.2 2.8 2.8l.6-.5c.3-.2.6-.2.9 0l1.2 1c.3.3.3.7-.1 1-.5.5-1.1.7-1.8.5-2.7-.7-5.2-3.2-5.9-5.9-.2-.7 0-1.3.5-1.8z" />
        </svg>
      </span>
    );
  }

  if (lower.includes('tiktok')) {
    return (
      <span
        title="TikTok"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-black text-white shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M14 3v10.5a4.5 4.5 0 11-4-4.47V12a2 2 0 102 2V3h2zm0 0c.7 2.3 2.2 3.8 4.5 4.5V10c-1.7-.3-3.2-1-4.5-2V3z" />
        </svg>
      </span>
    );
  }

  if (lower.includes('website')) {
    return (
      <span
        title="Website"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-300 shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18" />
          <path d="M12 3a14 14 0 010 18" />
          <path d="M12 3a14 14 0 000 18" />
        </svg>
      </span>
    );
  }

  return (
    <span
      title={platform}
      className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-400 shrink-0"
    >
      <svg
        className="w-3 h-3"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
      </svg>
    </span>
  );
}

function getPlatformUrl(platform: string, handle: string): string | null {
  const lower = platform.toLowerCase();
  const clean = handle.trim();
  if (!clean) return null;
  if (lower.includes('instagram')) return `https://www.instagram.com/${clean.replace(/^@/, '')}/`;
  if (lower.includes('facebook')) return `https://www.facebook.com/${clean.replace(/^@/, '')}`;
  if (lower.includes('tiktok')) return `https://www.tiktok.com/@${clean.replace(/^@/, '')}`;
  if (lower.includes('whatsapp')) {
    const phone = clean.replace(/[^\d+]/g, '').replace(/^\+/, '');
    return phone ? `https://wa.me/${phone}` : null;
  }
  if (lower.includes('website')) {
    if (/^https?:\/\//i.test(clean)) return clean;
    if (/^[\w.-]+\.[a-z]{2,}(?:\/.*)?$/i.test(clean)) return `https://${clean}`;
  }
  return null;
}

function PlatformLink({ platform, handle, className = '' }: { platform: string; handle: string; className?: string }) {
  const url = getPlatformUrl(platform, handle);
  const content = <>
    <span className="text-xs font-mono text-zinc-400 group-hover/platform:text-red-400 group-hover/platform:underline">{handle}</span>
    <PlatformIcon platform={platform} />
  </>;
  if (!url) return <div className={`flex items-center gap-1.5 ${className}`}>{content}</div>;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
      className={`flex items-center gap-1.5 group/platform hover:opacity-90 transition ${className}`}
      title={`Open ${platform}: ${handle}`}>
      {content}
    </a>
  );
}

function ScamMeterBadge({
  score,
  isBlacklisted,
}: {
  score: number;
  isBlacklisted: boolean;
}) {
  if (isBlacklisted) {
    return (
      <div className="flex flex-col items-end gap-1">
        <div className="px-2.5 py-1 rounded-md border text-xs font-mono font-bold flex items-center gap-2 bg-red-950 text-red-400 border-red-500/50">
          <span>BLACKLISTED</span>
          <span>0/100</span>
        </div>

        <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
          <div className="h-full bg-red-600" style={{ width: '0%' }} />
        </div>
      </div>
    );
  }

  let colorClass = 'bg-red-500/10 text-red-400 border-red-500/30';
let label = 'VERY POOR';
let barColor = 'bg-red-500';

if (score >= 90) {
  colorClass =
    'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  label = 'EXCELLENT';
  barColor = 'bg-emerald-500';
} else if (score >= 75) {
  colorClass =
    'bg-green-500/10 text-green-400 border-green-500/30';
  label = 'GOOD';
  barColor = 'bg-green-500';
} else if (score >= 60) {
  colorClass =
    'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
  label = 'FAIR';
  barColor = 'bg-yellow-500';
} else if (score >= 40) {
  colorClass =
    'bg-orange-500/10 text-orange-400 border-orange-500/30';
  label = 'POOR';
  barColor = 'bg-orange-500';
}

  return (
    <div className="flex flex-col items-end gap-1">
      <div
        className={`px-2.5 py-1 rounded-md border text-xs font-mono font-bold flex items-center gap-2 ${colorClass}`}
      >
        <span>{label}</span>
        <span>{score}/100</span>
      </div>

      <div className="w-24 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export default function ScamAlertApp() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedSearch, setAppliedSearch] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState('all');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [loginEmailInput, setLoginEmailInput] = useState('');
  const [loginPasswordInput, setLoginPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authMessage, setAuthMessage] = useState('');

  const [showForgotPasswordModal, setShowForgotPasswordModal] =
    useState(false);
  const [forgotEmailInput, setForgotEmailInput] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dob, setDob] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [phone, setPhone] = useState('');

  const [usernameStatus, setUsernameStatus] = useState<
    'idle' | 'checking' | 'available' | 'taken'
  >('idle');

  const [reportBrandName, setReportBrandName] = useState('');
  const [reportHandle, setReportHandle] = useState('');
  const [reportPlatform, setReportPlatform] = useState('Instagram');
  const [reportOrderNumber, setReportOrderNumber] = useState('');
  const [reportBrandEmail, setReportBrandEmail] = useState('');
  const [reportBrandWhatsapp, setReportBrandWhatsapp] = useState('');
  const [reportOrderDate, setReportOrderDate] = useState('');
  const [reportAmount, setReportAmount] = useState('');
  const [reportPaymentMethod, setReportPaymentMethod] =
    useState('JazzCash');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [fileUploadError, setFileUploadError] = useState('');
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [resolvingReportId, setResolvingReportId] = useState<string | null>(null);
const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
const [reportPendingDelete, setReportPendingDelete] = useState<string | null>(null);
  const [pendingReportDraft, setPendingReportDraft] = useState<ReportDraft | null>(null);
const savePendingReportDraft = () => {
  const draft = {
    reportBrandName,
    reportHandle,
    reportPlatform,
    reportOrderNumber,
    reportBrandEmail,
    reportBrandWhatsapp,
    reportOrderDate,
    reportAmount,
    reportPaymentMethod,
    reportDescription,
  };

  localStorage.setItem('scamalert_pending_report', JSON.stringify(draft));
  setPendingReportDraft(draft);
};
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState('');

  const [newReportSearch, setNewReportSearch] = useState('');

  const [systemNotifications, setSystemNotifications] = useState<string[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [submittedReportsFeed, setSubmittedReportsFeed] = useState<FeedItem[]>([]);
  const [expiredPublicReports, setExpiredPublicReports] = useState<ExpiredReport[]>([]);
  const [publicEvidence, setPublicEvidence] = useState<Record<string, PublicEvidenceItem[]>>({});
  const [userTickets, setUserTickets] = useState<Ticket[]>([]);
  const [brandList, setBrandList] = useState<BrandDirectoryItem[]>([]);
  const [blacklistedBrands, setBlacklistedBrands] = useState<BlacklistItem[]>([]);

  const formatTimeLeft = (publicAt: string, status: string) => {
    if (status === 'resolved') return 'Resolved';
    const diff = new Date(publicAt).getTime() - Date.now();
    if (diff <= 0) return '72-hour window expired — details are public';
    const hours = Math.floor(diff / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    return `${hours}h ${minutes}m remaining`;
  };

  const loadPublicData = async () => {
    const [feedResult, expiredResult, evidenceResult, directoryResult, blacklistResult] = await Promise.all([
      supabase.rpc('public_report_feed'),
      supabase.rpc('public_expired_reports'),
      supabase.rpc('public_expired_evidence'),
      supabase.rpc('public_brand_directory'),
      supabase.rpc('public_blacklist'),
    ]);

    if (!feedResult.error) {
      setSubmittedReportsFeed(((feedResult.data || []) as FeedRow[]).map((row) => ({
        id: row.feed_key, brand: row.brand, handle: row.handle, platform: row.platform, reportCount: Number(row.report_count),
      })));
    }
    if (!expiredResult.error) setExpiredPublicReports((expiredResult.data || []) as ExpiredReport[]);
    if (!evidenceResult.error) {
      const grouped: Record<string, PublicEvidenceItem[]> = {};
      for (const ev of (evidenceResult.data || []) as PublicEvidenceItem[]) {
        const signed = await supabase.storage.from('report-evidence').createSignedUrl(ev.storage_path, 3600);
        if (!grouped[ev.report_id]) grouped[ev.report_id] = [];
        grouped[ev.report_id].push({ ...ev, url: signed.data?.signedUrl || null });
      }
      setPublicEvidence(grouped);
    }
    if (!directoryResult.error) {
      setBrandList(((directoryResult.data || []) as DirectoryRow[]).map((row) => ({
        name: row.name, handle: row.handle, platform: row.platform, score: Number(row.score), verified: Boolean(row.verified),
        resolvedCases: Number(row.resolved_cases), openDisputes: Number(row.open_disputes),
      })));
    }
    if (!blacklistResult.error) {
      setBlacklistedBrands(((blacklistResult.data || []) as BlacklistRow[]).map((row) => ({
        id: row.id, brand: row.brand, handle: row.handle, platform: row.platform, reason: row.reason,
        dateBlacklisted: row.date_blacklisted, trustScore: row.trust_score,
      })));
    }
  };

  const loadUserReports = async (userId: string) => {
    const { data, error } = await supabase
      .from('reports')
      .select(`
  id,
  report_number,
  brand_name,
  handle,
  platform,
  status,
  public_at,
  created_at,
  order_number,
  brand_email,
  brand_whatsapp,
  amount_paid,
  payment_method,
  description,
  email_notification_status,
  whatsapp_notification_status,
  business_responded_at,
  business_responses(
    response_text,
    response_type,
    tracking_number,
    refund_reference,
    created_at
  ),
  customer_final_responses(
    response_text,
    resolution_choice,
    created_at
  ),
  report_evidence(
    storage_path,
    file_name,
    mime_type
  )
`)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) { setAuthError(error.message); return; }
    const tickets: Ticket[] = await Promise.all(((data || []) as unknown as RawReportRow[]).map(async (r) => {
      const evidence = await Promise.all((r.report_evidence || []).map(async (ev) => {
        const signed = await supabase.storage.from('report-evidence').createSignedUrl(ev.storage_path, 3600);
        return { ...ev, url: signed.data?.signedUrl || null };
      }));
      return {
        dbId: r.id, id: r.report_number, brand: r.brand_name, handle: r.handle, platform: r.platform, 
        status:
  r.status === 'resolved'
    ? 'Resolved by customer'
    : (
    Array.isArray(r.customer_final_responses)
      ? r.customer_final_responses.length > 0
      : Boolean(r.customer_final_responses)
  )
  ? 'Customer Replied · Report Active'
      : new Date(r.public_at) <= new Date()
        ? 'Unresolved — Public'
        : r.business_responded_at
          ? 'Brand Responded · Awaiting Your Review'
          : 'Pending Brand Response',
        timeLeft: formatTimeLeft(r.public_at, r.status), date: new Date(r.created_at).toLocaleDateString('en-PK'), publicAt: r.public_at,
        orderNumber: r.order_number, brandEmail: r.brand_email, brandWhatsapp: r.brand_whatsapp, amount: r.amount_paid, paymentMethod: r.payment_method, description: r.description,
        emailStatus: r.email_notification_status, whatsappStatus: r.whatsapp_notification_status, businessResponse: Array.isArray(r.business_responses)
  ? r.business_responses[0]
  : r.business_responses,

customerFinalResponse: Array.isArray(r.customer_final_responses)
  ? r.customer_final_responses[0]
  : r.customer_final_responses,

evidence,
      };
    }));
    setUserTickets(tickets);
  };
const restorePendingReportDraft = () => {
  const saved = localStorage.getItem('scamalert_pending_report');
  if (!saved) return false;

  try {
    const draft = JSON.parse(saved);

    setReportBrandName(draft.reportBrandName || '');
    setReportHandle(draft.reportHandle || '');
    setReportPlatform(draft.reportPlatform || 'Instagram');
    setReportOrderNumber(draft.reportOrderNumber || '');
    setReportBrandEmail(draft.reportBrandEmail || '');
    setReportBrandWhatsapp(draft.reportBrandWhatsapp || '');
    setReportOrderDate(draft.reportOrderDate || '');
    setReportAmount(draft.reportAmount || '');
    setReportPaymentMethod(draft.reportPaymentMethod || 'JazzCash');
    setReportDescription(draft.reportDescription || '');
    setPendingReportDraft(draft);

    return true;
  } catch {
    localStorage.removeItem('scamalert_pending_report');
    return false;
  }
};
const PENDING_REPORT_DB = 'scamalert_pending_report_db';
const PENDING_REPORT_STORE = 'pending_files';
const PENDING_REPORT_FILES_KEY = 'evidence';

const openPendingReportDb = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(PENDING_REPORT_DB, 1);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(PENDING_REPORT_STORE)) {
        db.createObjectStore(PENDING_REPORT_STORE);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const savePendingReportFiles = async (files: File[]) => {
  const db = await openPendingReportDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_REPORT_STORE, 'readwrite');
    tx.objectStore(PENDING_REPORT_STORE).put(files, PENDING_REPORT_FILES_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
};

const restorePendingReportFiles = async () => {
  const db = await openPendingReportDb();

  const files = await new Promise<File[]>((resolve, reject) => {
    const tx = db.transaction(PENDING_REPORT_STORE, 'readonly');
    const request = tx.objectStore(PENDING_REPORT_STORE).get(PENDING_REPORT_FILES_KEY);

    request.onsuccess = () => resolve((request.result as File[] | undefined) ?? []);
    request.onerror = () => reject(request.error);
  });

  db.close();

  setReportFiles(files);
};

const clearPendingReportFiles = async () => {
  const db = await openPendingReportDb();

  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_REPORT_STORE, 'readwrite');
    tx.objectStore(PENDING_REPORT_STORE).delete(PENDING_REPORT_FILES_KEY);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });

  db.close();
};
  useEffect(() => {
    let isMounted = true;

    const applyUser = async (user: User | null) => {
      if (!isMounted) return;
      if (user) {
        const displayName = user.user_metadata?.username || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
        setIsLoggedIn(true);
        setLoggedInUser(displayName);
        await loadUserReports(user.id);
       const restoredDraft = restorePendingReportDraft();

if (restoredDraft) {
  await restorePendingReportFiles();
} 
      } else {
        setIsLoggedIn(false);
        setLoggedInUser('');
        setUserTickets([]);
      }
    };

    const initialize = async () => {
      await loadPublicData();
      const { data: { user } } = await supabase.auth.getUser();
      await applyUser(user);
      const params = new URLSearchParams(window.location.search);
      if (params.get('verified') === 'true' && user) {
        setAuthMessage('Email verified successfully. You are now signed in.');
        const hasPendingReport = !!localStorage.getItem('scamalert_pending_report');
        setActiveTab(hasPendingReport ? 'file-report' : 'dashboard');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      if (params.get('auth_error')) {
        setAuthError('Authentication could not be completed. Please try again.');
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    };
    void initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      void applyUser(session?.user ?? null);
    });
    return () => { isMounted = false; subscription.unsubscribe(); };
  }, [supabase]);
 useEffect(() => {
  if (!isLoggedIn || !pendingReportDraft) return;

  const saved = localStorage.getItem('scamalert_pending_report');
  if (!saved) return;

  setActiveTab('file-report');
}, [isLoggedIn, pendingReportDraft]);
  const handleTabClick = (tab: string) => {
    setAuthError('');
    setAuthMessage('');
    setActiveTab(tab);
  };

  useEffect(() => {
    if (!reportSuccessMessage) return;

    const timer = window.setTimeout(() => {
      setReportSuccessMessage('');
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [reportSuccessMessage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setActiveTab('brands');
  };

  const submitReport = async () => {
    setIsSubmittingReport(true);
    setReportSuccessMessage('');
    setAuthError('');

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsSubmittingReport(false); setShowAuthRequiredModal(true); return; }

    const { data, error } = await supabase.rpc('create_report', {
      p_brand_name: reportBrandName.trim(),
      p_order_number: reportOrderNumber.trim(),
      p_brand_email: reportBrandEmail.trim() || null,
      p_brand_whatsapp:
        reportPlatform === 'WhatsApp'
          ? reportHandle.trim() || null
          : reportBrandWhatsapp.trim() || null,
      p_platform: reportPlatform,
      p_handle: reportHandle.trim(),
      p_order_date: reportOrderDate || null,
      p_amount_paid: Number(reportAmount),
      p_payment_method: reportPaymentMethod,
      p_description: reportDescription.trim(),
    });

    if (error || !data?.length) {
      setIsSubmittingReport(false);
      setAuthError(error?.message || 'Could not create report.');
      return;
    }

    const created = data[0];
    const failedUploads: string[] = [];
    for (const file of reportFiles) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${user.id}/${created.id}/${crypto.randomUUID()}-${safeName}`;
      const upload = await supabase.storage.from('report-evidence').upload(path, file, { contentType: file.type, upsert: false });
      if (!upload.error) {
        const insert = await supabase.from('report_evidence').insert({ report_id: created.id, user_id: user.id, storage_path: path, file_name: file.name, mime_type: file.type, size_bytes: file.size });
        if (insert.error) failedUploads.push(file.name);
      } else {
        failedUploads.push(file.name);
      }
    }
    const evidenceNotice =
      failedUploads.length === 0
        ? ''
        : ` Warning: ${failedUploads.length} of ${reportFiles.length} evidence file(s) failed to upload (${failedUploads.join(', ')}). The report itself was still filed.`;

    let customerNotice = 'Customer confirmation email failed.';

    // Send report-submission confirmation to the customer.
    try {
      const customerResponse = await fetch('/api/notify-customer-submitted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId: created.id }),
      });

      const customerResult = await customerResponse.json();

      customerNotice =
        customerResult.email === 'sent'
          ? 'Customer confirmation email sent.'
          : `Customer confirmation email: ${customerResult.email || customerResult.error || 'failed'}.`;
    } catch {
      customerNotice = 'Customer confirmation email failed.';
    }

    let notice = 'Business notification not configured.';
    try {
      const response = await fetch('/api/notify-business', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ reportId: created.id, responseToken: created.response_token }) });
      const result = await response.json();
      notice = result.email === 'sent' ? 'Business email notification sent.' : result.email === 'not_provided' ? 'No business email was provided.' : 'Business email notification is not configured yet.';
    } catch { /* report remains valid even when notification provider is unavailable */ }

    setReportBrandName(''); setReportHandle(''); setReportOrderNumber(''); setReportBrandEmail(''); setReportBrandWhatsapp('');
    setReportOrderDate(''); setReportAmount(''); setReportDescription(''); setReportFiles([]); setFileUploadError(''); setPendingReportDraft(null);
    localStorage.removeItem('scamalert_pending_report');
    await clearPendingReportFiles();
    setReportSuccessMessage(`Report ${created.report_number} filed. The 72-hour review window has started. ${customerNotice} ${notice}${evidenceNotice}`);
    setSystemNotifications(prev => [`[Report ${created.report_number}] 72-hour review window started. ${notice}`, ...prev]);
    await Promise.all([loadUserReports(user.id), loadPublicData()]);
    setIsSubmittingReport(false);
    setActiveTab('dashboard');
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn) return;

    setIsLoggingIn(true);
    setAuthError('');
    setAuthMessage('');

    const email = loginEmailInput.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password: loginPasswordInput,
    });

    setIsLoggingIn(false);

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        setAuthError('Please verify your email address before signing in. Check your inbox for the confirmation email.');
      } else {
        setAuthError(error.message);
      }
      return;
    }

    const user = data.user;
    const displayName =
      user?.user_metadata?.username ||
      user?.user_metadata?.full_name ||
      user?.email?.split('@')[0] ||
      'User';

    setIsLoggedIn(true);
    setLoggedInUser(displayName);
    setLoginEmailInput('');
    setLoginPasswordInput('');

    setActiveTab(pendingReportDraft ? 'file-report' : 'dashboard');
  };

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthMessage('');

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setAuthError(error.message);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSendingReset) return;
    setIsSendingReset(true); setAuthError('');
    const { error } = await supabase.auth.resetPasswordForEmail(forgotEmailInput.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setIsSendingReset(false);
    if (error) { setAuthError(error.message); return; }
    setResetEmailSent(true);
  };

  const handleCloseForgotPassword = () => {
    setShowForgotPasswordModal(false);
    setResetEmailSent(false);
    setForgotEmailInput('');
  };

  const handleBackToSignIn = () => {
    setShowForgotPasswordModal(false);
    setResetEmailSent(false);
    setForgotEmailInput('');
    setActiveTab('login');
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setUsernameInput(val);
    if (val.trim().length < 3) { setUsernameStatus('idle'); return; }
    setUsernameStatus('checking');
    const candidate = val.trim();
    window.setTimeout(async () => {
      const { data, error } = await supabase.rpc('username_available', { candidate });
      if (error) setUsernameStatus('idle');
      else setUsernameStatus(data ? 'available' : 'taken');
    }, 350);
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn || usernameStatus === 'taken') return;

    setIsLoggingIn(true);
    setAuthError('');
    setAuthMessage('');

    const username = usernameInput.trim();
    const email = emailInput.trim();

    const { data, error } = await supabase.auth.signUp({
      email,
      password: passwordInput,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          username,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          full_name: `${firstName.trim()} ${lastName.trim()}`.trim(),
          dob,
          province,
          city: city.trim(),
          zipcode: zipcode.trim(),
          phone: phone.trim(),
        },
      },
    });

    setIsLoggingIn(false);

    if (error) {
      setAuthError(error.message);
      return;
    }

    setPasswordInput('');

    if (!data.session) {
      setAuthMessage(
        `Verification email sent to ${email}. Please open that email and click “Confirm email address” before signing in.`
      );
      setActiveTab('login');
      setLoginEmailInput(email);
      return;
    }

    const user = data.user;
    const displayName =
      user?.user_metadata?.username ||
      user?.email?.split('@')[0] ||
      username ||
      'User';

    setIsLoggedIn(true);
    setLoggedInUser(displayName);
    setUsernameInput('');
    setEmailInput('');
    setFirstName('');
    setLastName('');
    setDob('');
    setProvince('');
    setCity('');
    setZipcode('');
    setPhone('');
    setUsernameStatus('idle');
   const hasPendingReport = !!localStorage.getItem('scamalert_pending_report');
   setActiveTab(hasPendingReport ? 'file-report' : 'dashboard');
  };

  const MAX_EVIDENCE_FILE_BYTES = 10 * 1024 * 1024;
  const ALLOWED_EVIDENCE_TYPES = ['image/png', 'image/jpeg'];

  const processEvidenceFiles = (incoming: FileList | File[]) => {
    const files = Array.from(incoming);
    const accepted: File[] = [];
    const rejected: string[] = [];

    for (const file of files) {
      if (!ALLOWED_EVIDENCE_TYPES.includes(file.type)) {
        rejected.push(`${file.name} (unsupported file type)`);
        continue;
      }
      if (file.size > MAX_EVIDENCE_FILE_BYTES) {
        rejected.push(`${file.name} (over 10MB)`);
        continue;
      }
      accepted.push(file);
    }

    setReportFiles(accepted);
    setFileUploadError(
      rejected.length > 0
        ? `Couldn't add: ${rejected.join(', ')}. Only PNG/JPG under 10MB are accepted.`
        : ''
    );
  };

  const handleFileNewReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingReport) return;
    if (!isLoggedIn) {
  savePendingReportDraft();
  await savePendingReportFiles(reportFiles);
  setShowAuthRequiredModal(true);
  return;
}
    await submitReport();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    setLoggedInUser('');
    setShowUserDropdown(false);
    setAuthError('');
    setAuthMessage('');
    setReportSuccessMessage('');
    setReportBrandName('');
    setReportHandle('');
    setReportOrderNumber('');
    setReportBrandEmail('');
    setReportBrandWhatsapp('');
    setReportOrderDate('');
    setReportAmount('');
    setReportDescription('');
    setReportFiles([]);
    setFileUploadError('');
    setPendingReportDraft(null);

localStorage.removeItem('scamalert_pending_report');
await clearPendingReportFiles();
    setActiveTab('overview');
  };

const handleMarkResolved = async (id: string) => {
  const ticket = userTickets.find((t) => t.id === id);
  if (!ticket || resolvingReportId === id) return;

  setResolvingReportId(id);
  setAuthError('');

  try {
    const { error } = await supabase
      .from('reports')
      .update({
        status: 'resolved',
        resolved_at: new Date().toISOString(),
      })
      .eq('id', ticket.dbId);

    if (error) {
      setAuthError(error.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await loadUserReports(user.id);
    }

    await loadPublicData();

    setReportSuccessMessage(
      `Report ${id} marked resolved. Its unresolved public listing has been removed.`
    );
  } finally {
    setResolvingReportId(null);
  }
};

  const handleDeleteTicket = async (id: string) => {
  const ticket = userTickets.find((t) => t.id === id);
  if (!ticket || deletingReportId === id) return;

  setDeletingReportId(id);
  setAuthError('');

  try {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', ticket.dbId);

    if (error) {
      setAuthError(error.message);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      await loadUserReports(user.id);
    }

    await loadPublicData();

    setReportSuccessMessage(`Report ${id} deleted.`);
    setReportPendingDelete(null);
  } finally {
    setDeletingReportId(null);
  }
};

  const activeSearchTerm = appliedSearch || searchQuery;

  const filteredBrands = brandList.filter(
    (b) =>
      b.name.toLowerCase().includes(activeSearchTerm.toLowerCase()) &&
      (selectedPlatform === 'all' ||
        b.platform.toLowerCase() === selectedPlatform.toLowerCase())
  );

  const filteredNewReportsFeed = submittedReportsFeed.filter(
    (item) =>
      item.brand
        .toLowerCase()
        .includes(newReportSearch.toLowerCase()) ||
      item.handle
        .toLowerCase()
        .includes(newReportSearch.toLowerCase())
  );

  const tabsToRender = isLoggedIn
    ? [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'file-report', label: '+ File New Report' },
        { id: 'new-reports', label: 'Reports Feed' },
        { id: 'brands', label: 'Brand Directory' },
        { id: 'blacklisted', label: 'Blacklist' },
      ]
    : [
        { id: 'overview', label: 'Overview' },
        { id: 'file-report', label: '+ File New Report' },
        { id: 'new-reports', label: 'Reports Feed' },
        { id: 'brands', label: 'Brand Directory' },
        { id: 'blacklisted', label: 'Blacklist' },
      ];

  return (
    <div className="min-h-screen bg-[var(--sa-paper)] text-[var(--sa-ink)] flex flex-col relative font-sans">
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-marquee {
          display: flex;
          width: max-content;
          animation: marquee 25s linear infinite;
        }

        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <header className="border-b border-[var(--sa-border)] bg-[var(--sa-surface)]/95 backdrop-blur relative z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-2 md:py-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2 md:gap-4">
          <div className="flex items-center justify-between gap-2 w-full md:w-auto min-w-0">
            <ScamAlertLogo
              onClick={() =>
                setActiveTab(isLoggedIn ? 'dashboard' : 'overview')
              }
            />

            <div className="flex md:hidden items-center gap-1.5 shrink-0">
  {!isLoggedIn ? (
    <>
      <button
        onClick={() => setActiveTab('login')}
        className="bg-white border border-[var(--sa-border)] text-[var(--sa-ink)] px-2.5 h-9 rounded-[4px] text-[11px] font-semibold leading-none whitespace-nowrap shrink-0 flex items-center justify-center cursor-pointer hover:bg-[#F2EFE9] transition"
      >
        Sign In
      </button>

      <button
        onClick={() => setActiveTab('signup')}
        className="bg-[var(--sa-red)] text-white px-2.5 h-9 rounded-[4px] text-[11px] font-semibold leading-none cursor-pointer hover:bg-[var(--sa-red-deep)] transition"
      >
        Sign Up
      </button>
    </>
  ) : (
    <div className="flex items-center gap-2 relative">
  <button
    type="button"
    onClick={() => setNotificationsOpen(!notificationsOpen)}
    className="relative bg-white border border-[var(--sa-border)] w-10 h-10 rounded-[4px] flex items-center justify-center hover:border-[var(--sa-ink)] transition cursor-pointer"
    title="Notifications"
  >
    <span className="text-lg">🔔</span>

    {userTickets.filter(
      (ticket: Ticket) =>
        ticket.businessResponse &&
        !ticket.customerFinalResponse &&
        ticket.status !== 'Resolved by customer'
    ).length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
        {userTickets.filter(
          (ticket: Ticket) =>
            ticket.businessResponse &&
            !ticket.customerFinalResponse &&
            ticket.status !== 'Resolved by customer'
        ).length}
      </span>
    )}

    {notificationsOpen && (
      <div className="absolute right-0 top-11 w-80 bg-white border border-[var(--sa-border)] rounded-[4px] shadow-[0_12px_30px_rgba(23,21,15,0.10)] z-50 p-3 text-left">
        <p className="sa-display text-sm font-bold text-[var(--sa-ink)] mb-3">
          Notifications
        </p>

        {userTickets.filter(
          (ticket: Ticket) =>
            ticket.businessResponse &&
            !ticket.customerFinalResponse &&
            ticket.status !== 'Resolved by customer'
        ).length === 0 ? (
          <p className="text-xs text-[var(--sa-graphite)] py-3">
            No new notifications.
          </p>
        ) : (
          userTickets
            .filter(
              (ticket: Ticket) =>
                ticket.businessResponse &&
                !ticket.customerFinalResponse &&
                ticket.status !== 'Resolved by customer'
            )
            .map((ticket: Ticket) => (
              <div
                key={ticket.dbId}
                onClick={() =>
                  router.push(`/case/${encodeURIComponent(ticket.id)}`)
                }
                className="border-t border-[#EAE6DE] py-3 cursor-pointer hover:bg-[#F7F5F2] px-2 rounded-[4px]"
              >
                <p className="text-xs font-bold text-[var(--sa-red-deep)]">
                  Brand responded
                </p>

                <p className="text-xs text-[var(--sa-ink)] mt-1">
                  {ticket.brand} responded to your complaint.
                </p>

                <p className="sa-mono text-[10px] text-[var(--sa-graphite)] mt-1">
                  {ticket.id} · Click to review
                </p>
              </div>
            ))
        )}
      </div>
    )}
  </button>

  <span className="sa-mono text-xs font-semibold text-[var(--sa-red-deep)] bg-white border border-[var(--sa-border)] px-3 py-2 rounded-[4px]">
    @{loggedInUser}
  </span>
</div>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="grid grid-cols-[minmax(0,1fr)_auto_auto] sm:flex sm:items-center gap-1 md:gap-2 w-full md:w-auto flex-1 max-w-xl justify-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store handle or domain..."
                className="w-full bg-white border border-[var(--sa-border)] rounded-[4px] px-3 h-8 md:h-auto md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[var(--sa-ink)] text-[var(--sa-ink)] placeholder:text-[var(--sa-graphite)] transition"
              />
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              aria-label="Filter by channel"
              className="w-[112px] sm:w-36 bg-white border border-[var(--sa-border)] rounded-[4px] px-2 h-8 md:h-auto md:py-2.5 text-xs md:text-sm focus:outline-none focus:border-[var(--sa-ink)] text-[var(--sa-ink)] cursor-pointer transition"
            >
              <option value="all">All Channels</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website">Website</option>
            </select>

            <button
              type="submit"
              aria-label="Search"
              className="bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white w-9 h-8 md:w-auto md:h-auto md:px-4 md:py-2.5 rounded-[var(--sa-radius-sm)] shadow-[var(--sa-shadow-sm)] text-sm font-semibold transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <span className="hidden md:inline">Search</span>
            </button>
          </form>

          <div className="hidden md:flex items-center gap-2.5 relative">
            {!isLoggedIn ? (
              <>
         <button
  onClick={() => setActiveTab('login')}
  className="!bg-white !text-[var(--sa-ink)] border border-[var(--sa-border)] px-2.5 h-9 rounded-[4px] text-[11px] font-semibold leading-none whitespace-nowrap shrink-0 flex items-center justify-center cursor-pointer hover:!bg-[#F2EFE9] transition"
>
  Sign In
</button>

<button
  onClick={() => setActiveTab('signup')}
  className="!bg-[var(--sa-red)] !text-white px-2.5 h-9 rounded-[4px] text-[11px] font-semibold leading-none whitespace-nowrap shrink-0 flex items-center justify-center cursor-pointer hover:!bg-[var(--sa-red-deep)] transition"
>
  Sign Up
</button>
              </>
            ) : (
  <>
   <div className="relative">
  <button
    type="button"
    onClick={() => setNotificationsOpen((open) => !open)}
    className="relative border border-[var(--sa-border)] bg-white hover:bg-[#F2EFE9] w-10 h-10 rounded-[4px] flex items-center justify-center cursor-pointer transition"
    title="Notifications"
  >
    <span className="text-lg">🔔</span>

    {userTickets.filter(
      (ticket: Ticket) =>
        ticket.businessResponse &&
        !ticket.customerFinalResponse &&
        ticket.status !== 'Resolved by customer'
    ).length > 0 && (
      <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-bold min-w-5 h-5 px-1 rounded-full flex items-center justify-center">
        {userTickets.filter(
          (ticket: Ticket) =>
            ticket.businessResponse &&
            !ticket.customerFinalResponse &&
            ticket.status !== 'Resolved by customer'
        ).length}
      </span>
    )}
  </button>

  {notificationsOpen && (
    <div className="absolute right-0 top-11 w-80 bg-white border border-[var(--sa-border)] rounded-[4px] shadow-[0_12px_30px_rgba(23,21,15,0.10)] z-50 p-3 text-left">
      <p className="sa-display text-sm font-bold text-[var(--sa-ink)] mb-3">
        Notifications
      </p>

      {userTickets.filter(
        (ticket: Ticket) =>
          ticket.businessResponse &&
          !ticket.customerFinalResponse &&
          ticket.status !== 'Resolved by customer'
      ).length === 0 ? (
        <p className="text-xs text-[var(--sa-graphite)] py-3">
          No new notifications.
        </p>
      ) : (
        userTickets
          .filter(
            (ticket: Ticket) =>
              ticket.businessResponse &&
              !ticket.customerFinalResponse &&
              ticket.status !== 'Resolved by customer'
          )
          .map((ticket: Ticket) => (
            <button
              key={ticket.dbId}
              type="button"
              onClick={() => {
                setNotificationsOpen(false);
                window.location.href = `/case/${encodeURIComponent(ticket.id)}`;
              }}
              className="w-full text-left border-t border-[#EAE6DE] py-3 hover:bg-[#F7F5F2] px-2 rounded-[4px] cursor-pointer"
            >
              <p className="text-xs font-bold text-[var(--sa-red-deep)]">
                Brand responded
              </p>

              <p className="text-xs text-[var(--sa-ink)] mt-1">
                {ticket.brand} responded to your complaint.
              </p>

              <p className="sa-mono text-[10px] text-[var(--sa-graphite)] mt-1">
                {ticket.id} · Click to review
              </p>
            </button>
          ))
      )}
    </div>
  )}
</div>

    <div className="relative">
                <button
                  onClick={() =>
                    setShowUserDropdown(!showUserDropdown)
                  }
                  className="border border-[var(--sa-border)] bg-white hover:bg-[#F2EFE9] px-4 py-2.5 rounded-[4px] text-sm font-medium flex items-center gap-2 transition cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-[var(--sa-ink)] font-semibold">
                    @{loggedInUser}
                  </span>
                  <span className="text-xs text-[var(--sa-graphite)]">▼</span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-[var(--sa-border)] rounded-[4px] shadow-[0_12px_30px_rgba(23,21,15,0.10)] overflow-hidden z-50 py-1">
                    <div className="px-4 py-3 border-b border-[#EAE6DE]">
                      <span className="sa-mono text-[10px] text-[var(--sa-graphite)] block uppercase tracking-[0.12em]">
                        Signed in as
                      </span>
                      <span className="text-xs font-bold text-[var(--sa-ink)] truncate block">
                        @{loggedInUser}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs text-[var(--sa-ink)] hover:bg-[#F2EFE9] transition cursor-pointer flex items-center gap-2"
                    >
                      📊 User Dashboard
                    </button>

                    <div className="border-t border-[#EAE6DE] my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2.5 text-xs text-[var(--sa-red-deep)] hover:bg-[var(--sa-red-soft)] transition cursor-pointer font-medium flex items-center gap-2"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
           )}
</div>
</>
)}
</div>
</div>

        <div className="border-t border-[var(--sa-border)] bg-[var(--sa-surface)]">
          <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 flex items-center gap-0 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
            {tabsToRender.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`sa-mono px-2.5 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[11px] uppercase tracking-[0.04em] sm:tracking-[0.08em] font-medium border-b-2 transition cursor-pointer whitespace-nowrap shrink-0 snap-start ${
                  activeTab === tab.id
                    ? 'border-[var(--sa-red)] text-[var(--sa-ink)] bg-[#FFF8F7]'
                    : 'border-transparent text-[var(--sa-graphite)] hover:text-[var(--sa-ink)] hover:bg-[#F7F5F2]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">

        {reportSuccessMessage && (
          <div className="max-w-3xl mx-auto mb-5">
            <div className="bg-[#F0FDF4] border border-[#86D5A5] rounded-2xl px-5 py-4 flex items-start gap-3 shadow-lg">
              <div className="w-7 h-7 rounded-full bg-[#DCFCE7] border border-[#86D5A5] flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-[#168A55]"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[#168A55]">
                  {reportSuccessMessage.includes(' deleted.')
                    ? 'Report Deleted Successfully'
                    : 'Report Submitted Successfully'}
                </p>
                <p className="text-xs text-[#4B5563] mt-1 leading-relaxed">
                  {reportSuccessMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportSuccessMessage('')}
                className="text-[var(--sa-graphite)] hover:text-[var(--sa-red)] text-sm font-semibold cursor-pointer transition"
                aria-label="Dismiss report confirmation"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* AUTH REQUIRED MODAL */}
        {showAuthRequiredModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] p-6 rounded-[16px] max-w-md w-full space-y-4 shadow-[var(--sa-shadow-lg)]">
              <div className="flex items-center justify-between">
                <h3 className="sa-display text-lg font-semibold text-[var(--sa-ink)]">
                  Account Required to Submit Report
                </h3>

                <button
                  onClick={() => setShowAuthRequiredModal(false)}
                  className="text-[var(--sa-graphite)] hover:text-[var(--sa-red)] text-sm font-semibold cursor-pointer transition"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-[var(--sa-graphite)] leading-relaxed">
                To launch a verified 72-hour dispute and protect other
                shoppers, you need to sign in or create an account. Your
                report draft has been saved!
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowAuthRequiredModal(false);
                    setActiveTab('login');
                  }}
                  className="w-full bg-white hover:bg-[#F7F5F2] border border-[var(--sa-border)] text-[var(--sa-ink)] text-xs font-semibold py-3 rounded-[8px] transition cursor-pointer text-center"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setShowAuthRequiredModal(false);
                    setActiveTab('signup');
                  }}
                  className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white text-xs font-semibold py-3 rounded-[8px] transition cursor-pointer text-center shadow-[var(--sa-shadow-sm)]"
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIGN IN */}
        {activeTab === 'login' && !isLoggedIn && (
          <div className="max-w-md mx-auto py-12">
            <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] p-6 sm:p-8 rounded-[16px] shadow-[var(--sa-shadow-md)] space-y-6">
              <div className="text-center space-y-2">
                <h2 className="sa-display text-2xl font-semibold tracking-tight text-[var(--sa-ink)]">
                  Sign In to ScamAlert.pk
                </h2>

                <p className="text-xs text-[var(--sa-graphite)]">
                  Access your dispute console and track 72-hour
                  enforcement status.
                </p>
              </div>

              {authError && (
                <div className="rounded-[10px] border border-[var(--sa-red)]/25 bg-[var(--sa-red-soft)] px-4 py-3 text-xs text-[var(--sa-red-deep)]">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="rounded-[10px] border border-[var(--sa-green)]/25 bg-[var(--sa-green-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--sa-green)]">
                  {authMessage}
                </div>
              )}

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                    Email Address
                  </label>

                  <input
                    type="email"
                    required
                    value={loginEmailInput}
                    onChange={(e) =>
                      setLoginEmailInput(e.target.value)
                    }
                    placeholder="you@example.com"
                    className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() => {
                        setResetEmailSent(false);
                        setForgotEmailInput('');
                        setShowForgotPasswordModal(true);
                      }}
                      className="text-xs text-red-400 hover:underline cursor-pointer font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>

                  <input
                    type="password"
                    required
                    value={loginPasswordInput}
                    onChange={(e) =>
                      setLoginPasswordInput(e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold py-3 rounded-[8px] text-sm transition cursor-pointer flex items-center justify-center min-h-[46px]"
                >
                  {isLoggingIn ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--sa-border)]" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">or</span>
                <div className="h-px flex-1 bg-[var(--sa-border)]" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-zinc-50 text-zinc-900 font-semibold py-3 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-3 border border-zinc-300 shadow-sm hover:shadow"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                >
                  <path fill="#4285F4" d="M21.805 10.023H12v3.955h5.617c-.242 1.273-.969 2.351-2.067 3.074v2.553h3.348c1.96-1.805 3.092-4.465 3.092-7.627 0-.664-.06-1.305-.185-1.955Z" />
                  <path fill="#34A853" d="M12 22c2.8 0 5.148-.93 6.865-2.395l-3.348-2.553c-.93.625-2.117.996-3.517.996-2.7 0-4.985-1.824-5.8-4.273H2.742v2.633A10 10 0 0 0 12 22Z" />
                  <path fill="#FBBC05" d="M6.2 13.775A5.998 5.998 0 0 1 5.887 12c0-.617.105-1.215.313-1.775V7.592H2.742A10.004 10.004 0 0 0 2 12c0 1.594.383 3.102 1.062 4.408L6.2 13.775Z" />
                  <path fill="#EA4335" d="M12 5.952c1.523 0 2.89.523 3.965 1.55l2.97-2.97C17.14 2.86 14.793 2 12 2a10 10 0 0 0-9.258 5.592L6.2 10.225C7.015 7.776 9.3 5.952 12 5.952Z" />
                </svg>
                Continue with Google
              </button>

              <div className="text-center pt-2 border-t border-zinc-800">
                <span className="text-xs text-[var(--sa-graphite)]">
                  Don't have an account?{' '}
                </span>

                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-xs font-semibold text-[var(--sa-red-deep)] hover:underline cursor-pointer"
                >
                  Sign Up Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD */}
        {showForgotPasswordModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] p-6 rounded-[16px] max-w-sm w-full shadow-[var(--sa-shadow-lg)]">
              {!resetEmailSent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="sa-display text-lg font-semibold text-[var(--sa-ink)]">
                      Reset Password
                    </h3>

                    <button
                      onClick={handleCloseForgotPassword}
                      className="text-[var(--sa-graphite)] hover:text-[var(--sa-red)] text-sm font-semibold cursor-pointer transition"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-[var(--sa-graphite)] leading-relaxed">
                    Enter your registered email address below, and we
                    will send you a secure link to reset your password.
                  </p>

                  <form
                    onSubmit={handleForgotPasswordSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                        Email Address
                      </label>

                      <input
                        type="email"
                        required
                        value={forgotEmailInput}
                        onChange={(e) =>
                          setForgotEmailInput(e.target.value)
                        }
                        placeholder="buyer@example.com"
                        className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] transition"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCloseForgotPassword}
                        className="flex-1 bg-white hover:bg-[#F7F5F2] border border-[var(--sa-border)] text-[var(--sa-ink)] text-xs font-semibold py-2.5 rounded-[8px] transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSendingReset}
                        className="flex-1 bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white text-xs font-semibold py-2.5 rounded-[8px] transition cursor-pointer flex items-center justify-center min-h-[38px]"
                      >
                        {isSendingReset ? (
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          'Send Link'
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div className="text-center space-y-5 py-3">
                  <div className="mx-auto w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-950/50">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="3"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="sa-display text-xl font-semibold text-[var(--sa-ink)]">
                      Reset Link Sent!
                    </h3>

                    <p className="text-sm text-[var(--sa-graphite)] leading-relaxed">
                      A password reset link has been sent to:
                    </p>

                    <p className="text-sm font-semibold text-emerald-400 break-all">
                      {forgotEmailInput}
                    </p>

                    <p className="text-xs text-zinc-500 leading-relaxed pt-1">
                      Please check your inbox and follow the
                      instructions to reset your password.
                    </p>
                  </div>

                  <button
                    onClick={handleBackToSignIn}
                    className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold py-3 rounded-[8px] text-sm transition cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SIGNUP */}
        {activeTab === 'signup' && !isLoggedIn && (
          <div className="max-w-2xl mx-auto py-8">
            <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] p-6 sm:p-8 rounded-[16px] shadow-[var(--sa-shadow-md)] space-y-6">
              <div className="text-center space-y-2 pb-2">
                <h2 className="sa-display text-2xl font-semibold tracking-tight text-[var(--sa-ink)]">
                  Create Verified Account
                </h2>

                <p className="text-xs text-[var(--sa-graphite)]">
                  Register with your full details to submit verified
                  fraud evidence and launch disputes.
                </p>
              </div>

              {authError && (
                <div className="rounded-[10px] border border-[var(--sa-red)]/25 bg-[var(--sa-red-soft)] px-4 py-3 text-xs text-[var(--sa-red-deep)]">
                  {authError}
                </div>
              )}

              {authMessage && (
                <div className="rounded-[10px] border border-[var(--sa-green)]/25 bg-[var(--sa-green-soft)] px-4 py-3 text-xs leading-relaxed text-[var(--sa-green)]">
                  {authMessage}
                </div>
              )}

              <button
                type="button"
                onClick={handleGoogleSignIn}
                className="w-full bg-white hover:bg-zinc-50 text-zinc-900 font-semibold py-3 rounded-xl text-sm transition cursor-pointer flex items-center justify-center gap-3 border border-zinc-300 shadow-sm hover:shadow"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-5 w-5 shrink-0"
                >
                  <path fill="#4285F4" d="M21.805 10.023H12v3.955h5.617c-.242 1.273-.969 2.351-2.067 3.074v2.553h3.348c1.96-1.805 3.092-4.465 3.092-7.627 0-.664-.06-1.305-.185-1.955Z" />
                  <path fill="#34A853" d="M12 22c2.8 0 5.148-.93 6.865-2.395l-3.348-2.553c-.93.625-2.117.996-3.517.996-2.7 0-4.985-1.824-5.8-4.273H2.742v2.633A10 10 0 0 0 12 22Z" />
                  <path fill="#FBBC05" d="M6.2 13.775A5.998 5.998 0 0 1 5.887 12c0-.617.105-1.215.313-1.775V7.592H2.742A10.004 10.004 0 0 0 2 12c0 1.594.383 3.102 1.062 4.408L6.2 13.775Z" />
                  <path fill="#EA4335" d="M12 5.952c1.523 0 2.89.523 3.965 1.55l2.97-2.97C17.14 2.86 14.793 2 12 2a10 10 0 0 0-9.258 5.592L6.2 10.225C7.015 7.776 9.3 5.952 12 5.952Z" />
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-[var(--sa-border)]" />
                <span className="text-[10px] uppercase tracking-wider text-zinc-500">or sign up with email</span>
                <div className="h-px flex-1 bg-[var(--sa-border)]" />
              </div>

              <form
                onSubmit={handleSignupSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      First Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ali"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Last Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Khan"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition [color-scheme:dark] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Province <span className="text-red-500">*</span>
                    </label>

                    <select
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition cursor-pointer"
                    >
                      <option value="" disabled>
                        Select Province
                      </option>
                      <option value="Sindh">Sindh</option>
                      <option value="Punjab">Punjab</option>
                      <option value="KPK">
                        Khyber Pakhtunkhwa
                      </option>
                      <option value="Balochistan">
                        Balochistan
                      </option>
                      <option value="ICT">Islamabad (ICT)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      City <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Karachi"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Zipcode
                    </label>

                    <input
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="75000"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                    Username <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={handleUsernameChange}
                    placeholder="e.g. BuyerShield"
                    className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                  />

                  {usernameStatus === 'checking' && (
                    <p className="text-[10px] text-zinc-500">
                      Checking username availability...
                    </p>
                  )}

                  {usernameStatus === 'available' && (
                    <p className="text-[10px] text-emerald-400">
                      ✓ Username is available
                    </p>
                  )}

                  {usernameStatus === 'taken' && (
                    <p className="text-[10px] text-red-400">
                      ✕ Username is already taken
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="buyer@example.com"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-[var(--sa-graphite)] font-semibold block">
                      Password <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold py-3.5 rounded-[8px] text-sm transition cursor-pointer"
                >
                  {isLoggingIn
                    ? 'Creating Account...'
                    : 'Create Verified Account'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-zinc-800">
                <span className="text-xs text-[var(--sa-graphite)]">
                  Already registered?{' '}
                </span>

                <button
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-semibold text-[var(--sa-red-deep)] hover:underline cursor-pointer"
                >
                  Sign In Here
                </button>
              </div>
            </div>
          </div>
        )}

        {/* OVERVIEW */}
        {(activeTab === 'overview' ||
          (activeTab === 'dashboard' && !isLoggedIn)) && (
          <div className="space-y-6 md:space-y-10 py-2 md:py-6">

            {/* HERO / REGISTRY INTRO */}
            <section className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[18px] overflow-hidden shadow-[0_12px_32px_rgba(23,21,15,0.08)]">
              <div className="relative grid md:grid-cols-[1fr_auto] overflow-hidden">

                <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/pakistan-hero-bg.webp')" }} />
                <div className="absolute inset-0" style={{ backgroundColor: "rgba(255,255,255,0.56)" }} />

                <div className="relative overflow-hidden p-4 sm:p-7 md:p-10 lg:p-12 md:min-h-[330px]">
                  <div className="relative z-10 max-w-2xl space-y-4 md:space-y-5">
                    <div className="sa-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] font-semibold">
                      Pakistan Fraud & Scam Registry
                    </div>

                    <h1 className="sa-display text-[30px] sm:text-[36px] md:text-[46px] lg:text-[52px] leading-[1.02] md:leading-[0.98] tracking-[-0.04em] md:tracking-[-0.045em] font-bold text-[var(--sa-ink)] max-w-xl">
                      Protect your online shopping in Pakistan.
                    </h1>

                    <p className="text-[14px] sm:text-[15px] md:text-[16px] leading-6 md:leading-7 text-[var(--sa-graphite)] max-w-xl">
                      Search seller handles before you transfer money, review
                      reported disputes, and file a structured complaint when
                      something goes wrong.
                    </p>
                  </div>


                </div>

                <div className="relative z-10 border-t md:border-t-0 md:border-l border-[var(--sa-border)] p-4 sm:p-7 md:p-8 lg:p-10 flex items-center">
                  <div className="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-[210px]">
                    <button
                      onClick={() => setActiveTab('file-report')}
                      className="flex-1 bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold px-5 py-3 rounded-[var(--sa-radius-sm)] shadow-[var(--sa-shadow-sm)] transition cursor-pointer text-sm"
                    >
                      + File New Report
                    </button>

                    <button
                      onClick={() => setActiveTab('new-reports')}
                      className="flex-1 bg-white hover:bg-[#F2EFE9] border border-[var(--sa-border)] text-[var(--sa-ink)] font-semibold px-5 py-3 rounded-[var(--sa-radius-sm)] shadow-[var(--sa-shadow-sm)] transition cursor-pointer text-sm"
                    >
                      View Reports Feed
                    </button>
                  </div>
                </div>

              </div>

              <div className="border-t border-[var(--sa-border)] bg-[#F2EFE9] px-5 sm:px-7 md:px-10 lg:px-12 py-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-x-7 gap-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-white border border-[var(--sa-border)] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[var(--sa-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6M9 8h3m-5-5h7l4 4v14H7V3z" />
                    </svg>
                  </span>
                  <span className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-graphite)]">
                    Evidence-backed records
                  </span>
                </div>

                <span className="hidden sm:block w-px h-6 bg-[var(--sa-border)]" />

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-white border border-[var(--sa-border)] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[var(--sa-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 3l7 3v5c0 4.4-2.8 8.4-7 10-4.2-1.6-7-5.6-7-10V6l7-3z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.5 12.5l1.7 1.7 3.8-4" />
                    </svg>
                  </span>
                  <span className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-graphite)]">
                    Seller right of response
                  </span>
                </div>

                <span className="hidden sm:block w-px h-6 bg-[var(--sa-border)]" />

                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-white border border-[var(--sa-border)] flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-[var(--sa-ink)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="9" strokeWidth="1.8" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M12 7v5l3 2" />
                    </svg>
                  </span>
                  <span className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-graphite)]">
                    72-hour resolution window
                  </span>
                </div>
              </div>
            </section>


            {/* RECENT REPORTS */}
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-1">
                    Live Registry
                  </div>

                  <h2 className="sa-display text-xl md:text-2xl font-bold tracking-[-0.03em] text-[var(--sa-ink)]">
                    Recent reports
                  </h2>
                </div>

                <button
                  onClick={() => setActiveTab('new-reports')}
                  className="sa-mono text-[11px] uppercase tracking-[0.08em] text-[var(--sa-red-deep)] hover:underline font-semibold cursor-pointer whitespace-nowrap"
                >
                  View all →
                </button>
              </div>

              {submittedReportsFeed.length === 0 ? (
                <div className="w-full bg-[var(--sa-surface)] border border-dashed border-[var(--sa-border)] rounded-[14px] px-6 py-10 flex flex-col items-center text-center gap-2">
                  <span className="w-10 h-10 rounded-full bg-[#F2EFE9] border border-[var(--sa-border)] flex items-center justify-center">
                    <svg className="w-5 h-5 text-[var(--sa-graphite)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6M9 8h3m-5-5h7l4 4v14H7V3z" />
                    </svg>
                  </span>
                  <p className="text-sm font-semibold text-[var(--sa-ink)]">
                    No reports filed yet
                  </p>
                  <p className="text-xs text-[var(--sa-graphite)] max-w-sm">
                    When shoppers file disputes, the seller and report count
                    appear here during the 72-hour response window.
                  </p>
                </div>
              ) : (
                <div className="w-full bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] overflow-x-auto sm:overflow-hidden relative shadow-[0_6px_20px_rgba(23,21,15,0.06)] scrollbar-hide snap-x snap-mandatory">

                  <div className="flex items-stretch sm:animate-marquee">
                    {[...submittedReportsFeed, ...submittedReportsFeed].map(
                      (item, index) => (
                        <button
                          type="button"
                          key={`${item.id}-${index}`}
                          onClick={() => setActiveTab('new-reports')}
                          className="min-w-[85%] sm:min-w-[260px] md:min-w-[300px] bg-white border-r border-[var(--sa-border)] px-4 sm:px-5 py-4 sm:py-5 flex items-center justify-between gap-4 sm:gap-5 text-left hover:bg-[#F7F5F2] transition cursor-pointer snap-start"
                        >
                          <div className="min-w-0">
                            <span className="sa-display text-[15px] font-bold text-[var(--sa-ink)] block truncate">
                              {item.brand}
                            </span>

                            <PlatformLink
                              platform={item.platform}
                              handle={item.handle}
                              className="mt-1.5"
                            />
                          </div>

                          <div className="pl-4 border-l border-[var(--sa-border)] shrink-0">
                            <span className="sa-mono text-[9px] text-[var(--sa-graphite)] uppercase tracking-[0.12em] block">
                              Reports
                            </span>

                            <span className="sa-mono text-[12px] font-semibold text-[var(--sa-red-deep)] block mt-1">
                              {item.reportCount} Active
                            </span>
                          </div>
                        </button>
                      )
                    )}
                  </div>

                </div>
              )}

              <p className="text-[11px] leading-relaxed text-[var(--sa-graphite)]">
                Recent registry activity. A report represents a submitted complaint
                and does not by itself establish wrongdoing.
              </p>
            </section>

          </div>
        )}

        {/* FILE NEW REPORT */}
        {activeTab === 'file-report' && (
          <div className="max-w-3xl mx-auto py-4 md:py-6 space-y-6">
            <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] p-5 sm:p-6 md:p-8 rounded-[16px] shadow-[var(--sa-shadow-md)] space-y-6">
              <div className="space-y-2 border-b border-[var(--sa-border)] pb-5">
                <span className="sa-mono text-[10px] font-semibold text-[var(--sa-red-deep)] uppercase tracking-[0.16em]">
                  Customer Dispute Registry
                </span>

                <h2 className="sa-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--sa-ink)]">
                  File a Fraud or Scam Report
                </h2>

                <p className="text-sm text-[var(--sa-graphite)] leading-6 max-w-2xl">
                  Submitting this report starts a{' '}
                  <strong className="text-[var(--sa-ink)]">
                    72-hour response window
                  </strong>{' '}
                  for the business. During that window the public feed shows only the seller identity and report count. If the complaint remains unresolved after 72 hours, its submitted report details become public.
                </p>
              </div>

              <form
                onSubmit={handleFileNewReportSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Platform <span className="text-[var(--sa-red)]">*</span>
                    </label>

                    <select
                      value={reportPlatform}
                      onChange={(e) =>
                        setReportPlatform(e.target.value)
                      }
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 cursor-pointer transition"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Website">Website</option>
                      <option value="TikTok">TikTok</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      {reportPlatform === 'Instagram' ? 'Instagram Handle' : reportPlatform === 'Facebook' ? 'Facebook Page URL' : reportPlatform === 'WhatsApp' ? 'WhatsApp Number' : reportPlatform === 'Website' ? 'Website URL' : reportPlatform === 'TikTok' ? 'TikTok Handle' : 'Store Handle / URL'}{' '}
                      <span className="text-[var(--sa-red)]">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={reportHandle}
                      onChange={(e) =>
                        setReportHandle(e.target.value)
                      }
                      placeholder={reportPlatform === 'Instagram' ? 'e.g. @urbanvogue_pk' : reportPlatform === 'Facebook' ? 'e.g. facebook.com/urbanvoguepk' : reportPlatform === 'WhatsApp' ? 'e.g. +92 300 1234567' : reportPlatform === 'Website' ? 'e.g. https://urbanvogue.pk' : reportPlatform === 'TikTok' ? 'e.g. @urbanvogue_pk' : 'e.g. @urbanvogue_pk'}
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Brand / Store Name{' '}
                      <span className="text-[var(--sa-red)]">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={reportBrandName}
                      onChange={(e) =>
                        setReportBrandName(e.target.value)
                      }
                      placeholder="e.g. Urban Vogue PK"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Order # <span className="text-[var(--sa-red)]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={reportOrderNumber}
                      onChange={(e) => setReportOrderNumber(e.target.value)}
                      placeholder="e.g. PK-10482"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Order Date <span className="font-normal text-[var(--sa-graphite)]">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={reportOrderDate}
                      onChange={(e) => setReportOrderDate(e.target.value)}
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Lost Amount (PKR){' '}
                      <span className="text-[var(--sa-red)]">*</span>
                    </label>

                    <input
                      type="number"
                      required
                      value={reportAmount}
                      onChange={(e) =>
                        setReportAmount(e.target.value)
                      }
                      placeholder="e.g. 4500"
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Payment Method
                    </label>

                    <select
                      value={reportPaymentMethod}
                      onChange={(e) =>
                        setReportPaymentMethod(e.target.value)
                      }
                      className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 cursor-pointer transition"
                    >
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="Bank Transfer">Bank Transfer</option>
                      <option value="COD Fraud">COD Fraud</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                      Brand Email <span className="font-normal text-[var(--sa-graphite)]">(Optional)</span>
                    </label>
                    <input type="email" value={reportBrandEmail} onChange={(e) => setReportBrandEmail(e.target.value)} placeholder="support@brand.com" className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition" />
                    <p className="text-[10px] text-[var(--sa-graphite)]">Used only to send this business a neutral complaint notice and response link.</p>
                  </div>

                  {reportPlatform !== 'WhatsApp' && (
                    <div className="space-y-1.5">
                      <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                        Brand WhatsApp # <span className="font-normal text-[var(--sa-graphite)]">(Optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={reportBrandWhatsapp}
                        onChange={(e) => setReportBrandWhatsapp(e.target.value)}
                        placeholder="+92 300 1234567"
                        className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] px-3.5 py-2.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 transition"
                      />
                      <p className="text-[10px] text-[var(--sa-graphite)]">
                        Stored for notification use once a WhatsApp Business provider is connected.
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                    Incident Description & Chat Details{' '}
                    <span className="text-[var(--sa-red)]">*</span>
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={reportDescription}
                    onChange={(e) =>
                      setReportDescription(e.target.value)
                    }
                    placeholder="Describe what happened, when you transferred the money, and how the seller stopped responding..."
                    className="w-full bg-white border border-[var(--sa-border)] rounded-[8px] p-3.5 text-sm text-[var(--sa-ink)] placeholder:text-[#9B948B] focus:outline-none focus:border-[var(--sa-red)] focus:ring-2 focus:ring-[var(--sa-red)]/10 resize-none transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-[var(--sa-ink)] font-semibold block">
                    Upload Evidence (Receipts, Chat Screenshots)
                  </label>

                  <label
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(true);
                    }}
                    onDragLeave={() => setIsDraggingFiles(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDraggingFiles(false);
                      if (e.dataTransfer.files?.length) {
                        processEvidenceFiles(e.dataTransfer.files);
                      }
                    }}
                    className={`border border-dashed rounded-[12px] p-6 text-center transition cursor-pointer block ${
                      isDraggingFiles
                        ? 'border-[var(--sa-red)] bg-[var(--sa-red-soft)]/40'
                        : 'border-[var(--sa-border)] bg-[#F7F5F2] hover:border-[var(--sa-red)]/50 hover:bg-[var(--sa-red-soft)]/20'
                    }`}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.length) {
                          processEvidenceFiles(e.target.files);
                        }
                      }}
                    />

                    <svg
                      className="w-8 h-8 text-[var(--sa-graphite)] mx-auto mb-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>

                    <span className="text-xs text-[var(--sa-ink)] font-semibold block">
                      {reportFiles.length > 0
                        ? `${reportFiles.length} file(s) selected`
                        : 'Click to upload files or drag & drop'}
                    </span>

                    <span className="text-[10px] text-[var(--sa-graphite)] block mt-1">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                  </label>

                  {fileUploadError && (
                    <p className="text-[11px] text-[var(--sa-red-deep)] bg-[var(--sa-red-soft)] border border-[var(--sa-red)]/25 rounded-[8px] px-3 py-2">
                      {fileUploadError}
                    </p>
                  )}
                </div>

                <div className="bg-[var(--sa-red-soft)]/55 border border-[var(--sa-red)]/20 p-4 rounded-[12px] flex items-start gap-3">
                  <span className="text-[var(--sa-red-deep)] font-bold text-base mt-0.5">
                    ⚠️
                  </span>

                  <p className="text-xs text-[var(--sa-red-deep)] leading-relaxed">
                    By submitting, you certify that all provided details
                    and payment screenshots are authentic and accurate
                    to the best of your knowledge. False reporting may
                    lead to account termination.
                  </p>
                </div>

                {authError && (
                  <div className="bg-[var(--sa-red-soft)] border border-[var(--sa-red)]/25 rounded-[10px] px-4 py-3">
                    <p className="text-sm font-medium text-[var(--sa-red-deep)]">
                      {authError}
                    </p>
                  </div>
                )}

<button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold py-3.5 rounded-[8px] text-sm transition cursor-pointer flex items-center justify-center min-h-[48px] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSubmittingReport ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Report & Start 72h Response Window'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && isLoggedIn && (
          <div className="space-y-6 py-6">

            <section className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] shadow-[var(--sa-shadow-sm)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div>
                  <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-2">
                    Your Dashboard
                  </div>

                  <h2 className="sa-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--sa-ink)]">
                    Welcome back, @{loggedInUser}!
                  </h2>

                  <p className="text-sm text-[var(--sa-graphite)] mt-2">
                    Manage your active reports, review seller responses, and track resolution status.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                  <button
                    onClick={() => setActiveTab('file-report')}
                    className="bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white font-semibold px-5 py-3 rounded-[8px] text-sm transition cursor-pointer"
                  >
                    + File New Report
                  </button>

                  <button
                    onClick={() => setActiveTab('new-reports')}
                    className="bg-white hover:bg-[#F2EFE9] border border-[var(--sa-border)] text-[var(--sa-ink)] font-semibold px-5 py-3 rounded-[8px] text-sm transition cursor-pointer"
                  >
                    Reports Feed
                  </button>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-1">
                  My Reports
                </div>

                <h3 className="sa-display text-xl md:text-2xl font-semibold text-[var(--sa-ink)]">
                  Your Complaints
                </h3>
              </div>

              {userTickets.length === 0 ? (
                <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] shadow-[var(--sa-shadow-sm)] p-10 text-center">
                  <p className="text-sm text-[var(--sa-graphite)]">
                    No active complaints right now.
                  </p>
                </div>
              ) : (
                userTickets.map((ticket) => (
                  <article
                    key={ticket.id}
                    className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] shadow-[var(--sa-shadow-sm)] overflow-hidden"
                  >
                    <div className="p-5 md:p-6 space-y-5">

                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            window.location.href = `/case/${encodeURIComponent(ticket.id)}`;
                          }}
                          className="sa-mono text-xs text-[var(--sa-red-deep)] font-semibold hover:underline cursor-pointer"
                        >
                          {ticket.id}
                        </button>

                        <span className="sa-mono text-[10px] uppercase tracking-wide bg-[#FFF8DC] text-[#8A6700] border border-[#D9B84A]/40 px-2.5 py-1 rounded-full font-semibold">
                          {ticket.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="sa-display text-xl font-semibold text-[var(--sa-ink)]">
                          {ticket.brand}
                        </h4>

                        <PlatformLink
                          platform={ticket.platform}
                          handle={ticket.handle}
                          className="mt-1.5"
                        />

                        <p className="sa-mono text-xs text-[var(--sa-red-deep)] font-semibold mt-3">
                          ⏳ {ticket.timeLeft}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="bg-[#F7F5F2] rounded-[10px] p-3">
                          <span className="text-[11px] uppercase tracking-wide text-[var(--sa-graphite)] block">
                            Order #
                          </span>
                          <span className="text-[var(--sa-ink)] font-medium mt-1 block">
                            {ticket.orderNumber}
                          </span>
                        </div>

                        <div className="bg-[#F7F5F2] rounded-[10px] p-3">
                          <span className="text-[11px] uppercase tracking-wide text-[var(--sa-graphite)] block">
                            Amount
                          </span>
                          <span className="text-[var(--sa-ink)] font-medium mt-1 block">
                            PKR {Number(ticket.amount || 0).toLocaleString()}
                          </span>
                        </div>

                        <div className="bg-[#F7F5F2] rounded-[10px] p-3">
                          <span className="text-[11px] uppercase tracking-wide text-[var(--sa-graphite)] block">
                            Email notice
                          </span>
                          <span className="text-[var(--sa-ink)] font-medium mt-1 block">
                            {ticket.emailStatus}
                          </span>
                        </div>

                        <div className="bg-[#F7F5F2] rounded-[10px] p-3">
                          <span className="text-[11px] uppercase tracking-wide text-[var(--sa-graphite)] block">
                            WhatsApp notice
                          </span>
                          <span className="text-[var(--sa-ink)] font-medium mt-1 block">
                            {ticket.whatsappStatus}
                          </span>
                        </div>
                      </div>

                      {ticket.evidence?.length > 0 && (
                        <div>
                          <p className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-graphite)] mb-2">
                            Your evidence
                          </p>

                          <div className="flex flex-wrap gap-2">
                            {ticket.evidence.map((ev: EvidenceItem) => (
                              <a
                                key={ev.storage_path}
                                href={ev.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs border border-[var(--sa-border)] bg-white px-3 py-2 rounded-[8px] hover:border-[var(--sa-red)]/40 transition"
                              >
                                {ev.file_name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {ticket.businessResponse && (
                        <div className="bg-[var(--sa-green-soft)] border border-[var(--sa-green)]/20 rounded-[12px] p-4">
                          <p className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-green)] font-semibold">
                            Business response
                          </p>

                          <p className="text-sm text-[var(--sa-ink)] mt-2 whitespace-pre-wrap leading-6">
                            {ticket.businessResponse.response_text}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="border-t border-[var(--sa-border)] bg-[#F7F5F2] px-5 md:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[var(--sa-graphite)]">
                        Logged on: {ticket.date}
                      </span>

                      <div className="relative flex flex-wrap items-center gap-2">
                        {ticket.status !== 'Resolved by customer' && (
                          <button
                            onClick={() => handleMarkResolved(ticket.id)}
                            disabled={resolvingReportId === ticket.id}
                            className="bg-[var(--sa-green-soft)] hover:bg-[#DDEFE5] border border-[var(--sa-green)]/30 text-[var(--sa-green)] px-3 py-2 rounded-[8px] text-xs font-semibold transition cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {resolvingReportId === ticket.id
                              ? 'Resolving...'
                              : 'Mark Resolved'}
                          </button>
                        )}

                        <button
                          onClick={() => setReportPendingDelete(ticket.id)}
                          className="bg-white hover:bg-[var(--sa-red-soft)] border border-[var(--sa-border)] hover:border-[var(--sa-red)]/30 text-[var(--sa-graphite)] hover:text-[var(--sa-red-deep)] px-3 py-2 rounded-[8px] text-xs font-semibold transition cursor-pointer"
                        >
                          Delete
                        </button>

                        {reportPendingDelete === ticket.id && (
  <div
    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4"
    onClick={() => setReportPendingDelete(null)}
  >
    <div
      className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl"
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="text-lg font-semibold text-black">
        Delete report {ticket.id}?
      </h3>

      <p className="mt-2 text-sm text-gray-600">
        This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={() => setReportPendingDelete(null)}
          disabled={deletingReportId === ticket.id}
          className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={() => handleDeleteTicket(ticket.id)}
          disabled={deletingReportId === ticket.id}
          className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
        >
          {deletingReportId === ticket.id
            ? 'Deleting...'
            : 'Delete Report'}
        </button>
      </div>
    </div>
  </div>
)}
                      </div>
                    </div>

                  </article>
                ))
              )}
            </section>

          </div>
        )}

        {/* REPORTS FEED */}
        {activeTab === 'new-reports' && (
          <div className="max-w-5xl mx-auto py-6 space-y-8">

            {/* REGISTRY HEADER */}
            <section className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[var(--sa-radius-lg)] shadow-[var(--sa-shadow-md)] overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6">

                <div className="max-w-2xl">
                  <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-2">
                    Public Registry
                  </div>

                  <h2 className="sa-display text-2xl md:text-3xl font-bold tracking-[-0.035em] text-[var(--sa-ink)]">
                    Submitted Reports Registry
                  </h2>

                  <p className="text-sm leading-6 text-[var(--sa-graphite)] mt-2 max-w-xl">
                    During each 72-hour window, only seller identity and aggregate
                    report counts are shown. Unresolved complaint details become
                    public after the deadline.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white px-4 py-2.5 rounded-[4px] text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  + File New Report
                </button>
              </div>

              <div className="border-t border-[var(--sa-border)] bg-[#F2EFE9] p-4 md:px-6">
                <input
                  type="text"
                  value={newReportSearch}
                  onChange={(e) => setNewReportSearch(e.target.value)}
                  placeholder="Search brand or handle..."
                  className="w-full bg-white border border-[var(--sa-border)] rounded-[var(--sa-radius-sm)] shadow-[var(--sa-shadow-sm)] px-4 py-3 text-sm text-[var(--sa-ink)] placeholder:text-[var(--sa-graphite)] focus:outline-none focus:border-[var(--sa-ink)] transition"
                />
              </div>
            </section>


            {/* ACTIVE 72-HOUR RECORDS */}
            <section className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-1">
                    Open Records
                  </div>

                  <h3 className="sa-display text-xl font-bold tracking-[-0.03em] text-[var(--sa-ink)]">
                    Reports within response window
                  </h3>
                </div>
              </div>

              <div className="border border-[var(--sa-border)] rounded-[var(--sa-radius-md)] bg-white overflow-hidden shadow-[var(--sa-shadow-sm)]">
                {filteredNewReportsFeed.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm text-[var(--sa-graphite)]">
                      No reports found matching your search.
                    </p>
                  </div>
                ) : (
                  filteredNewReportsFeed.map((item, index) => (
                    <div
                      key={item.id}
                      className={`px-5 md:px-6 py-5 flex items-center justify-between gap-5 hover:bg-[#F7F5F2] transition ${
                        index !== filteredNewReportsFeed.length - 1
                          ? 'border-b border-[var(--sa-border)]'
                          : ''
                      }`}
                    >
                      <div className="min-w-0">
                        <h4 className="sa-display text-[16px] font-bold text-[var(--sa-ink)] truncate">
                          {item.brand}
                        </h4>

                        <PlatformLink
                          platform={item.platform}
                          handle={item.handle}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="flex items-center gap-4 shrink-0">
                        <span className="sa-mono text-[9px] uppercase tracking-[0.12em] text-[var(--sa-graphite)] hidden sm:inline">
                          Reports Against
                        </span>

                        <span className="sa-mono min-w-9 text-center px-2.5 py-1.5 rounded-[999px] bg-[var(--sa-red-soft)] border border-[#F2C7C2] text-[var(--sa-red-deep)] font-semibold text-xs">
                          {item.reportCount}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p className="text-[11px] leading-relaxed text-[var(--sa-graphite)]">
                Records shown above are still within the business response period.
                Complaint details remain private during this window.
              </p>
            </section>


            {/* EXPIRED / PUBLIC REPORTS */}
            {expiredPublicReports.length > 0 && (
              <section className="space-y-3 pt-2">
                <div>
                  <div className="sa-mono text-[10px] uppercase tracking-[0.16em] text-[var(--sa-red-deep)] mb-1">
                    Public Records
                  </div>

                  <h3 className="sa-display text-xl font-bold tracking-[-0.03em] text-[var(--sa-ink)]">
                    Unresolved reports past 72 hours
                  </h3>

                  <p className="text-xs text-[var(--sa-graphite)] mt-1">
                    Complaint details below are public because the original
                    72-hour resolution window expired unresolved.
                  </p>
                </div>

                <div className="space-y-4">
                  {expiredPublicReports.map((report: ExpiredReport) => (
                    <article
                      key={report.id}
                      className="bg-white border border-[var(--sa-border)] rounded-[var(--sa-radius-lg)] overflow-hidden shadow-[var(--sa-shadow-md)]"
                    >
                      {/* REPORT HEADER */}
                      <div className="p-5 md:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="min-w-0">
                          <span className="sa-mono text-[10px] uppercase tracking-[0.12em] text-[var(--sa-red-deep)] font-semibold">
                            {report.report_number}
                          </span>

                          <h4 className="sa-display text-xl font-bold tracking-[-0.025em] text-[var(--sa-ink)] mt-1">
                            {report.brand_name}
                          </h4>

                          <PlatformLink
                            platform={report.platform}
                            handle={report.handle}
                            className="mt-1.5"
                          />
                        </div>

                        <div className="flex flex-row sm:flex-col sm:items-end gap-2 shrink-0">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.1em] px-2.5 py-1.5 rounded-[999px] bg-[var(--sa-red-soft)] border border-[#F2C7C2] text-[var(--sa-red-deep)] font-semibold">
                            72H Expired · Unresolved
                          </span>

                          <a
                            href={`/report/${encodeURIComponent(report.report_number)}`}
                            className="px-3 py-2 rounded-[4px] bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white text-xs font-semibold transition"
                          >
                            View Report
                          </a>
                        </div>
                      </div>

                      {/* RECORD DATA */}
                      <div className="border-t border-[var(--sa-border)] bg-[#F7F5F2] grid sm:grid-cols-2 lg:grid-cols-4">
                        <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-[var(--sa-border)]">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.1em] text-[var(--sa-graphite)] block">
                            Order
                          </span>
                          <span className="text-xs font-semibold text-[var(--sa-ink)] block mt-1">
                            {report.order_number}
                          </span>
                        </div>

                        <div className="px-4 py-3 border-b sm:border-b-0 lg:border-r border-[var(--sa-border)]">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.1em] text-[var(--sa-graphite)] block">
                            Amount
                          </span>
                          <span className="text-xs font-semibold text-[var(--sa-ink)] block mt-1">
                            PKR {Number(report.amount_paid).toLocaleString()}
                          </span>
                        </div>

                        <div className="px-4 py-3 border-b sm:border-b-0 sm:border-r border-[var(--sa-border)]">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.1em] text-[var(--sa-graphite)] block">
                            Payment
                          </span>
                          <span className="text-xs font-semibold text-[var(--sa-ink)] block mt-1">
                            {report.payment_method}
                          </span>
                        </div>

                        <div className="px-4 py-3">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.1em] text-[var(--sa-graphite)] block">
                            Order Date
                          </span>
                          <span className="text-xs font-semibold text-[var(--sa-ink)] block mt-1">
                            {report.order_date || 'Not provided'}
                          </span>
                        </div>
                      </div>

                      {/* COMPLAINT */}
                      <div className="p-5 md:p-6 border-t border-[var(--sa-border)]">
                        <span className="sa-mono text-[9px] uppercase tracking-[0.12em] text-[var(--sa-graphite)]">
                          Customer Report Details
                        </span>

                        <p className="text-sm leading-6 text-[#33302A] mt-2 whitespace-pre-wrap">
                          {report.description}
                        </p>
                      </div>

                      {/* CONTACT DETAILS */}
                      {(report.brand_email || report.brand_whatsapp) && (
                        <div className="px-5 md:px-6 pb-5 flex flex-wrap gap-x-6 gap-y-2">
                          {report.brand_email && (
                            <span className="text-[11px] text-[var(--sa-graphite)]">
                              Brand email:{' '}
                              <strong className="text-[var(--sa-ink)]">
                                {report.brand_email}
                              </strong>
                            </span>
                          )}

                          {report.brand_whatsapp && (
                            <span className="text-[11px] text-[var(--sa-graphite)]">
                              Brand WhatsApp:{' '}
                              <strong className="text-[var(--sa-ink)]">
                                {report.brand_whatsapp}
                              </strong>
                            </span>
                          )}
                        </div>
                      )}

                      {/* EVIDENCE */}
                      {publicEvidence[report.id]?.length > 0 && (
                        <div className="px-5 md:px-6 pb-5">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.12em] text-[var(--sa-graphite)] block mb-2">
                            Evidence
                          </span>

                          <div className="flex flex-wrap gap-2">
                            {publicEvidence[report.id].map((ev: PublicEvidenceItem) => (
                              <a
                                key={ev.storage_path}
                                href={ev.url || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs border border-[var(--sa-border)] bg-white hover:bg-[#F2EFE9] text-[var(--sa-ink)] px-3 py-2 rounded-[4px] transition"
                              >
                                {ev.file_name}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* BUSINESS RESPONSE */}
                      {report.business_response_text && (
                        <div className="border-t border-[#C6DFCF] bg-[var(--sa-green-soft)] p-5 md:p-6">
                          <span className="sa-mono text-[9px] uppercase tracking-[0.12em] text-[var(--sa-green)] font-semibold">
                            Business Response
                          </span>

                          <p className="text-sm leading-6 text-[#25543C] mt-2 whitespace-pre-wrap">
                            {report.business_response_text}
                          </p>
                        </div>
                      )}
                    </article>
                  ))}
                </div>

                <p className="text-[11px] leading-relaxed text-[var(--sa-graphite)]">
                  ScamAlert.pk publishes submitted complaint records and business
                  responses. A public listing is not an independent finding of fraud.
                </p>
              </section>
            )}
          </div>
        )}

        {/* BRAND DIRECTORY */}
        {activeTab === 'brands' && (
          <div className="space-y-6 py-6">
            <section className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[16px] shadow-[var(--sa-shadow-sm)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="max-w-2xl">
                  <div className="sa-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sa-red)] font-semibold mb-2">
                    Seller Directory
                  </div>

                  <h2 className="sa-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--sa-ink)]">
                    Brand Directory
                  </h2>

                  <p className="text-sm text-[var(--sa-graphite)] mt-2 leading-6">
                    Browse sellers and platforms appearing in submitted reports and review their recorded complaint outcomes.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white text-sm font-semibold px-5 py-3 rounded-[8px] shadow-sm transition cursor-pointer shrink-0"
                >
                  + File New Report
                </button>
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBrands.length === 0 && (
                <div className="md:col-span-2 bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] shadow-[var(--sa-shadow-sm)] p-10 text-center">
                  <p className="text-sm text-[var(--sa-graphite)]">
                    No report data matches this search yet.
                  </p>
                </div>
              )}

              {filteredBrands.map((brand, idx) => (
                <article
                  key={idx}
                  className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] shadow-[var(--sa-shadow-sm)] p-5 md:p-6 flex items-center justify-between gap-5"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="sa-display text-lg font-semibold text-[var(--sa-ink)]">
                        {brand.name}
                      </h4>

                      {brand.verified && (
                        <span className="sa-mono text-[10px] uppercase tracking-wide bg-[var(--sa-green-soft)] text-[var(--sa-green)] border border-[var(--sa-green)]/20 px-2 py-1 rounded-full">
                          Verified
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-[var(--sa-graphite)]">
                      <span>Handle:</span>
                      <PlatformLink
                        platform={brand.platform}
                        handle={brand.handle}
                      />
                    </div>
                  </div>

                  <div className="shrink-0">
                    <ScamMeterBadge
                      score={brand.score}
                      isBlacklisted={brand.score === 0}
                    />
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* BLACKLIST */}
        {activeTab === 'blacklisted' && (
          <div className="space-y-6 py-6">
            <section className="bg-[var(--sa-surface)] border border-[var(--sa-red)]/25 rounded-[16px] shadow-[var(--sa-shadow-sm)] p-6 md:p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                <div className="max-w-3xl">
                  <div className="sa-mono text-[11px] uppercase tracking-[0.16em] text-[var(--sa-red)] font-semibold mb-2">
                    72-Hour Status
                  </div>

                  <h2 className="sa-display text-2xl md:text-3xl font-semibold tracking-tight text-[var(--sa-ink)]">
                    Unresolved Reports Registry
                  </h2>

                  <p className="text-sm text-[var(--sa-graphite)] mt-2 leading-6">
                    Complaints that remain unresolved after the 72-hour response window are listed here with their public report details. A listing represents complaint status and is not an independent finding of fraud.
                  </p>
                </div>

                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-[var(--sa-red)] hover:bg-[var(--sa-red-deep)] text-white text-sm font-semibold px-5 py-3 rounded-[8px] shadow-sm transition cursor-pointer shrink-0"
                >
                  + File New Report
                </button>
              </div>
            </section>

            <div className="space-y-4">
              {blacklistedBrands.length === 0 && (
                <div className="bg-[var(--sa-surface)] border border-[var(--sa-border)] rounded-[14px] shadow-[var(--sa-shadow-sm)] p-10 text-center">
                  <p className="text-sm text-[var(--sa-graphite)]">
                    No unresolved reports have passed the 72-hour window.
                  </p>
                </div>
              )}

              {blacklistedBrands.map((item, idx) => (
                <article
                  key={idx}
                  className="bg-[var(--sa-surface)] border border-[var(--sa-red)]/25 rounded-[14px] shadow-[var(--sa-shadow-sm)] overflow-hidden"
                >
                  <div className="p-5 md:p-6 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="sa-mono text-xs text-[var(--sa-red)] font-semibold">
                        {item.id}
                      </span>

                      <span className="sa-mono text-[10px] uppercase tracking-wide bg-[var(--sa-red-soft)] text-[var(--sa-red-deep)] border border-[var(--sa-red)]/20 px-2.5 py-1 rounded-full font-semibold">
                        Unresolved · 72H
                      </span>
                    </div>

                    <div>
                      <h4 className="sa-display text-lg font-semibold text-[var(--sa-ink)]">
                        {item.brand}
                      </h4>

                      <PlatformLink
                        platform={item.platform}
                        handle={item.handle}
                        className="mt-1"
                      />

                      <p className="text-sm text-[var(--sa-graphite)] mt-3 leading-6">
                        {item.reason}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[var(--sa-red-soft)]/45 border-t border-[var(--sa-red)]/15 px-5 md:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="text-[var(--sa-graphite)]">
                      Listed: {item.dateBlacklisted}
                    </span>

                    <span className="text-[var(--sa-red-deep)] font-semibold">
                      Unresolved after 72 hours
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

      </main>

      <footer className="border-t border-[var(--sa-border)] bg-[var(--sa-surface)]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--sa-graphite)]">
          <span>© 2026 ScamAlert.pk</span>
          <div className="flex items-center gap-4">
            <a href="/privacy" className="hover:text-[var(--sa-ink)] transition">Privacy Policy</a>
            <a href="/terms" className="hover:text-[var(--sa-ink)] transition">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
