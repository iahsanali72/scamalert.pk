'use client';

import { useState } from 'react';

function ScamAlertLogo({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 cursor-pointer group select-none"
    >
      <div className="relative w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-red-800 flex items-center justify-center shadow-lg shadow-red-950/60 border border-red-400/30 group-hover:scale-105 transition duration-200">
        <svg
          className="w-5 h-5 text-white relative z-10"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 005 13h14a1 1 0 00.707-1.707L19 11.586V8a6 6 0 00-6-6zM10 18a2 2 0 014 0h-4z" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-baseline gap-0.5">
          <span className="font-black text-white text-lg tracking-tight leading-none">
            SCAM
          </span>
          <span className="font-black text-red-500 text-lg tracking-tight leading-none">
            ALERT<span className="text-zinc-400 font-bold text-sm">.pk</span>
          </span>
        </div>

        <span className="text-[9px] uppercase tracking-widest text-zinc-400 font-mono mt-0.5">
          Official Fraud Registry
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

  if (lower.includes('telegram')) {
    return (
      <span
        title="Telegram"
        className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-sky-500 text-white shrink-0"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M21.8 4.2L18.7 19c-.2 1-1 1.3-1.8.8l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.4-5.1 9.3-8.4c.4-.4-.1-.6-.6-.2L6.1 12.7l-4.9-1.5c-1.1-.3-1.1-1.1.2-1.6L20.5 3c.9-.3 1.7.2 1.3 1.2z" />
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
  if (lower.includes('telegram')) return `https://t.me/${clean.replace(/^@/, '')}`;
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
  let label = 'HIGH RISK';
  let barColor = 'bg-red-500';

  if (score >= 80) {
    colorClass =
      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    label = 'SAFE';
    barColor = 'bg-emerald-500';
  } else if (score >= 50) {
    colorClass =
      'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    label = 'MODERATE';
    barColor = 'bg-yellow-500';
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
  const [reportAmount, setReportAmount] = useState('');
  const [reportPaymentMethod, setReportPaymentMethod] =
    useState('JazzCash');
  const [reportDescription, setReportDescription] = useState('');
  const [reportFiles, setReportFiles] = useState<File[]>([]);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);

  const [pendingReportDraft, setPendingReportDraft] = useState<any>(null);
  const [showAuthRequiredModal, setShowAuthRequiredModal] = useState(false);
  const [reportSuccessMessage, setReportSuccessMessage] = useState('');

  const [newReportSearch, setNewReportSearch] = useState('');

  const [systemNotifications, setSystemNotifications] = useState<string[]>([
    '[Automated Notice]: Official Dispute Notice sent to @Luxe_Fashions_PK. 72h countdown initiated.',
  ]);

  const [submittedReportsFeed, setSubmittedReportsFeed] = useState([
    {
      id: '1',
      brand: 'Luxe Fashions PK',
      handle: '@luxe_fashions_pk',
      platform: 'Instagram',
      reportCount: 4,
    },
    {
      id: '2',
      brand: 'TrendyWear_PK',
      handle: '@trendywears_pk',
      platform: 'Instagram',
      reportCount: 12,
    },
    {
      id: '3',
      brand: 'Crypto Yield Pros',
      handle: '@cryptoyield_scam',
      platform: 'Telegram',
      reportCount: 25,
    },
    {
      id: '4',
      brand: 'UrbanTrends_PK',
      handle: '@urbantrends_pk',
      platform: 'Facebook',
      reportCount: 7,
    },
    {
      id: '5',
      brand: 'Gadget Vault Pakistan',
      handle: '@gadgetvault_pk',
      platform: 'WhatsApp',
      reportCount: 2,
    },
  ]);

  const [userTickets, setUserTickets] = useState([
    {
      id: 'REP-84920',
      brand: 'Luxe Fashions PK',
      handle: '@luxe_fashions_pk',
      platform: 'Instagram',
      status: 'Pending Brand Response (72h Timer Active)',
      timeLeft: '72 hours remaining',
      date: '2026-08-30',
    },
  ]);

  const [brandList, setBrandList] = useState([
    {
      name: 'Khaadi Official',
      handle: '@khaadi',
      platform: 'Website',
      score: 95,
      verified: true,
      resolvedCases: 142,
      openDisputes: 0,
    },
    {
      name: 'Gul Ahmed Store',
      handle: '@gulahmed',
      platform: 'Website',
      score: 92,
      verified: true,
      resolvedCases: 98,
      openDisputes: 1,
    },
    {
      name: 'UrbanTrends_PK',
      handle: '@urbantrends_pk',
      platform: 'Instagram',
      score: 65,
      verified: false,
      resolvedCases: 12,
      openDisputes: 3,
    },
    {
      name: 'Luxe Fashions PK',
      handle: '@luxe_fashions_pk',
      platform: 'Instagram',
      score: 40,
      verified: false,
      resolvedCases: 2,
      openDisputes: 1,
    },
  ]);

  const [blacklistedBrands, setBlacklistedBrands] = useState([
    {
      id: 'REP-83104',
      brand: 'Crypto Yield Pros',
      handle: '@cryptoyield_scam',
      platform: 'Telegram',
      reason: '72h Timer Expired Without Resolution (Scam Confirmed)',
      dateBlacklisted: '2026-08-20',
      trustScore: '0 / 100',
    },
  ]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSearch(searchQuery.trim());
    setActiveTab('brands');
  };

  const finalizeAndSubmitReport = (
    brandName: string,
    handle: string,
    platform: string,
    amount: string,
    desc: string
  ) => {
    const newTicketId = `REP-${Math.floor(
      10000 + Math.random() * 90000
    )}`;

    const normalizedHandle = handle.startsWith('@')
      ? handle
      : `@${handle}`;

    const newFeedItem = {
      id: String(submittedReportsFeed.length + 1),
      brand: brandName,
      handle: normalizedHandle,
      platform,
      reportCount: 1,
    };

    const newUserTicket = {
      id: newTicketId,
      brand: brandName,
      handle: normalizedHandle,
      platform,
      status: 'Pending Brand Response (72h Timer Active)',
      timeLeft: '72 hours remaining',
      date: new Date().toISOString().split('T')[0],
    };

    setSubmittedReportsFeed([
      newFeedItem,
      ...submittedReportsFeed,
    ]);

    setUserTickets([newUserTicket, ...userTickets]);

    setReportBrandName('');
    setReportHandle('');
    setReportAmount('');
    setReportDescription('');
    setReportFiles([]);
    setPendingReportDraft(null);

    setReportSuccessMessage(
      `Report successfully filed! Ticket ID: ${newTicketId}. 72-hour automated dispute notice initiated.`
    );

    setActiveTab('dashboard');
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn) return;

    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
      setLoggedInUser(usernameInput.trim() || 'CustomerDemo');

      setUsernameInput('');
      setPasswordInput('');

      if (pendingReportDraft) {
        finalizeAndSubmitReport(
          pendingReportDraft.brandName,
          pendingReportDraft.handle,
          pendingReportDraft.platform,
          pendingReportDraft.amount,
          pendingReportDraft.description
        );
      } else {
        setActiveTab('dashboard');
      }
    }, 800);
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSendingReset) return;

    setIsSendingReset(true);

    setTimeout(() => {
      setIsSendingReset(false);
      setResetEmailSent(true);
    }, 1000);
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

  const handleUsernameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const val = e.target.value;

    setUsernameInput(val);

    if (val.length < 3) {
      setUsernameStatus('idle');
      return;
    }

    setUsernameStatus('checking');

    setTimeout(() => {
      const takenNames = [
        'admin',
        'buyer',
        'user',
        'scamalert',
        'customer',
      ];

      if (takenNames.includes(val.toLowerCase())) {
        setUsernameStatus('taken');
      } else {
        setUsernameStatus('available');
      }
    }, 600);
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoggingIn || usernameStatus === 'taken') return;

    setIsLoggingIn(true);

    setTimeout(() => {
      setIsLoggingIn(false);
      setIsLoggedIn(true);
      setLoggedInUser(usernameInput.trim() || 'NewUser');

      setUsernameInput('');
      setEmailInput('');
      setPasswordInput('');
      setFirstName('');
      setLastName('');
      setDob('');
      setProvince('');
      setCity('');
      setZipcode('');
      setPhone('');
      setUsernameStatus('idle');

      if (pendingReportDraft) {
        finalizeAndSubmitReport(
          pendingReportDraft.brandName,
          pendingReportDraft.handle,
          pendingReportDraft.platform,
          pendingReportDraft.amount,
          pendingReportDraft.description
        );
      } else {
        setActiveTab('dashboard');
      }
    }, 1200);
  };

  const handleFileNewReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmittingReport) return;

    if (!isLoggedIn) {
      setPendingReportDraft({
        brandName: reportBrandName,
        handle: reportHandle,
        platform: reportPlatform,
        amount: reportAmount,
        description: reportDescription,
      });

      setShowAuthRequiredModal(true);
      return;
    }

    setIsSubmittingReport(true);

    setTimeout(() => {
      setIsSubmittingReport(false);

      finalizeAndSubmitReport(
        reportBrandName,
        reportHandle,
        reportPlatform,
        reportAmount,
        reportDescription
      );
    }, 1000);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setLoggedInUser('');
    setShowUserDropdown(false);
    setActiveTab('overview');
  };

  const handleMarkResolved = (id: string) => {
    const resolvedTicket = userTickets.find((t) => t.id === id);

    if (resolvedTicket) {
      setUserTickets(userTickets.filter((t) => t.id !== id));

      setSystemNotifications([
        `[Resolved]: Ticket ${id} for ${resolvedTicket.brand} marked as resolved by customer.`,
        ...systemNotifications,
      ]);

      alert(`Ticket ${id} has been successfully marked as Resolved.`);
    }
  };

  const handleDeleteTicket = (id: string) => {
    setUserTickets(userTickets.filter((t) => t.id !== id));
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col relative font-sans">
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

      <header className="border-b border-zinc-800 bg-zinc-900/40 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            <ScamAlertLogo
              onClick={() =>
                setActiveTab(isLoggedIn ? 'dashboard' : 'overview')
              }
            />

            <div className="flex md:hidden items-center gap-2">
              {!isLoggedIn ? (
                <>
                  <button
                    onClick={() => setActiveTab('login')}
                    className="bg-zinc-800 border border-zinc-700 text-zinc-200 px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Sign In
                  </button>

                  <button
                    onClick={() => setActiveTab('signup')}
                    className="bg-red-600 text-white px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Sign Up
                  </button>
                </>
              ) : (
                <span className="text-xs font-bold text-red-400 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-lg">
                  @{loggedInUser}
                </span>
              )}
            </div>
          </div>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-xl justify-center"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search store handle or domain..."
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-red-500 text-zinc-200 placeholder-zinc-500"
              />
            </div>

            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="w-32 sm:w-36 bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-2 text-sm focus:outline-none focus:border-red-500 text-zinc-300 cursor-pointer"
            >
              <option value="all">All Channels</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="website">Website</option>
            </select>

            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
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
              <span>Search</span>
            </button>
          </form>

          <div className="hidden md:flex items-center gap-2.5 relative">
            {!isLoggedIn ? (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer"
                >
                  Sign In
                </button>

                <button
                  onClick={() => setActiveTab('signup')}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-md cursor-pointer"
                >
                  Sign Up
                </button>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() =>
                    setShowUserDropdown(!showUserDropdown)
                  }
                  className="border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-zinc-200 font-semibold">
                    @{loggedInUser}
                  </span>
                  <span className="text-xs text-zinc-400">▼</span>
                </button>

                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-52 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl overflow-hidden z-50 py-1">
                    <div className="px-4 py-2 border-b border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block uppercase tracking-wider">
                        Signed in as
                      </span>
                      <span className="text-xs font-bold text-white truncate block">
                        @{loggedInUser}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('dashboard');
                        setShowUserDropdown(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition cursor-pointer flex items-center gap-2"
                    >
                      📊 User Dashboard
                    </button>

                    <div className="border-t border-zinc-800 my-1" />

                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition cursor-pointer font-medium flex items-center gap-2"
                    >
                      🚪 Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-zinc-800 bg-zinc-950/80">
          <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto">
            {tabsToRender.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`px-5 py-2.5 text-sm font-medium border-b-2 transition cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-white bg-zinc-900/50'
                    : 'border-transparent text-zinc-400 hover:text-zinc-200'
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
            <div className="bg-emerald-950/50 border border-emerald-500/40 rounded-2xl px-5 py-4 flex items-start gap-3 shadow-lg">
              <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-emerald-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-emerald-300">
                  Report Submitted Successfully
                </p>
                <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                  {reportSuccessMessage}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReportSuccessMessage('')}
                className="text-zinc-500 hover:text-white text-sm font-bold cursor-pointer"
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
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">
                  Account Required to Submit Report
                </h3>

                <button
                  onClick={() => setShowAuthRequiredModal(false)}
                  className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
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
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-3 rounded-xl transition cursor-pointer text-center"
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    setShowAuthRequiredModal(false);
                    setActiveTab('signup');
                  }}
                  className="w-full bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-3 rounded-xl transition cursor-pointer text-center shadow-lg"
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
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">
                  Sign In to ScamAlert.pk
                </h2>

                <p className="text-xs text-zinc-400">
                  Access your dispute console and track 72-hour
                  enforcement status.
                </p>
              </div>

              <form
                onSubmit={handleLoginSubmit}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-semibold block">
                    Username or Email
                  </label>

                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) =>
                      setUsernameInput(e.target.value)
                    }
                    placeholder="e.g. CustomerDemo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-zinc-300 font-semibold block">
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
                    value={passwordInput}
                    onChange={(e) =>
                      setPasswordInput(e.target.value)
                    }
                    placeholder="••••••••"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer flex items-center justify-center min-h-[46px]"
                >
                  {isLoggingIn ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400">
                  Don't have an account?{' '}
                </span>

                <button
                  onClick={() => setActiveTab('signup')}
                  className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
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
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl max-w-sm w-full shadow-2xl">
              {!resetEmailSent ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-white">
                      Reset Password
                    </h3>

                    <button
                      onClick={handleCloseForgotPassword}
                      className="text-zinc-400 hover:text-white text-sm font-bold cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Enter your registered email address below, and we
                    will send you a secure link to reset your password.
                  </p>

                  <form
                    onSubmit={handleForgotPasswordSubmit}
                    className="space-y-4"
                  >
                    <div className="space-y-1">
                      <label className="text-xs text-zinc-300 font-semibold block">
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
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleCloseForgotPassword}
                        className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isSendingReset}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer flex items-center justify-center min-h-[38px]"
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
                    <h3 className="text-xl font-bold text-white">
                      Reset Link Sent!
                    </h3>

                    <p className="text-sm text-zinc-300 leading-relaxed">
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
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl text-sm transition cursor-pointer"
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
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="text-center space-y-2 pb-2">
                <h2 className="text-2xl font-bold text-white">
                  Create Verified Account
                </h2>

                <p className="text-xs text-zinc-400">
                  Register with your full details to submit verified
                  fraud evidence and launch disputes.
                </p>
              </div>

              <form
                onSubmit={handleSignupSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      First Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ali"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Last Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Khan"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="date"
                      required
                      value={dob}
                      onChange={(e) => setDob(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500 [color-scheme:dark] cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0300 1234567"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Province <span className="text-red-500">*</span>
                    </label>

                    <select
                      required
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
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
                    <label className="text-xs text-zinc-300 font-semibold block">
                      City <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Karachi"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Zipcode
                    </label>

                    <input
                      type="text"
                      value={zipcode}
                      onChange={(e) => setZipcode(e.target.value)}
                      placeholder="75000"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-zinc-300 font-semibold block">
                    Username <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={handleUsernameChange}
                    placeholder="e.g. BuyerShield"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
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
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="buyer@example.com"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Password <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="password"
                      required
                      minLength={8}
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer"
                >
                  {isLoggingIn
                    ? 'Creating Account...'
                    : 'Create Verified Account'}
                </button>
              </form>

              <div className="text-center pt-2 border-t border-zinc-800">
                <span className="text-xs text-zinc-400">
                  Already registered?{' '}
                </span>

                <button
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-bold text-red-400 hover:underline cursor-pointer"
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
          <div className="space-y-8 py-4">
            <div className="bg-gradient-to-r from-zinc-900 to-zinc-900/60 border border-zinc-800 p-8 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-3 max-w-xl">
                <span className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-bold">
                  PAKISTAN FRAUD & SCAM REGISTRY
                </span>

                <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Protect Your Online Shopping in Pakistan
                </h1>

                <p className="text-sm text-zinc-400 leading-relaxed">
                  Check seller trust scores, verify social media store
                  handles before transferring funds via JazzCash or
                  EasyPaisa, and track active dispute records.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-6 py-3.5 rounded-xl shadow-lg transition cursor-pointer w-full sm:w-auto"
                >
                  + File New Report
                </button>

                <button
                  onClick={() => setActiveTab('new-reports')}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-semibold px-5 py-3.5 rounded-xl transition cursor-pointer w-full sm:w-auto"
                >
                  View Reports Feed
                </button>
              </div>
            </div>

            {/* LIVE REPORT TICKER */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Recent Reports Live Feed
                </h3>

                <button
                  onClick={() => setActiveTab('new-reports')}
                  className="text-xs text-red-400 hover:underline font-semibold cursor-pointer"
                >
                  View All →
                </button>
              </div>

              <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl overflow-hidden py-4 relative shadow-inner">
                <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />

                <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

                <div className="animate-marquee flex items-center gap-6 px-4">
                  {[...submittedReportsFeed, ...submittedReportsFeed].map(
                    (item, index) => (
                      <div
                        key={`${item.id}-${index}`}
                        onClick={() => setActiveTab('new-reports')}
                        className="bg-zinc-950 border border-zinc-800/80 hover:border-red-500/40 px-4 py-3 rounded-xl flex items-center gap-4 shrink-0 cursor-pointer transition shadow-md"
                      >
                        <div className="space-y-0.5">
                          <span className="text-xs font-bold text-white block">
                            {item.brand}
                          </span>

                          {/* HANDLE + SMALL PLATFORM LOGO */}
                          <PlatformLink platform={item.platform} handle={item.handle} className="mt-1" />
                        </div>

                        <div className="pl-3 border-l border-zinc-800 flex flex-col items-end">
                          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
                            Reports
                          </span>

                          <span className="text-xs font-mono font-bold text-red-400">
                            {item.reportCount} Active
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FILE NEW REPORT */}
        {activeTab === 'file-report' && (
          <div className="max-w-2xl mx-auto py-6 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6">
              <div className="space-y-2 border-b border-zinc-800 pb-4">
                <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-wider">
                  Automated Enforcement Registry
                </span>

                <h2 className="text-2xl font-bold text-white">
                  File a Fraud or Scam Report
                </h2>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  Submitting this report initiates an official{' '}
                  <strong className="text-zinc-200">
                    72-hour dispute window
                  </strong>{' '}
                  against the seller. If the seller fails to provide
                  proof of delivery or issue a refund within 72 hours,
                  their handle is automatically blacklisted.
                </p>
              </div>

              <form
                onSubmit={handleFileNewReportSubmit}
                className="space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Brand / Store Name{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={reportBrandName}
                      onChange={(e) =>
                        setReportBrandName(e.target.value)
                      }
                      placeholder="e.g. Urban Vogue PK"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Store Handle / URL{' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      required
                      value={reportHandle}
                      onChange={(e) =>
                        setReportHandle(e.target.value)
                      }
                      placeholder="e.g. @urbanvogue_pk"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Platform <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={reportPlatform}
                      onChange={(e) =>
                        setReportPlatform(e.target.value)
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="Instagram">Instagram</option>
                      <option value="Facebook">Facebook</option>
                      <option value="WhatsApp">WhatsApp</option>
                      <option value="Website">Website</option>
                      <option value="Telegram">Telegram</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Lost Amount (PKR){' '}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      required
                      value={reportAmount}
                      onChange={(e) =>
                        setReportAmount(e.target.value)
                      }
                      placeholder="e.g. 4500"
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-300 font-semibold block">
                      Payment Method
                    </label>

                    <select
                      value={reportPaymentMethod}
                      onChange={(e) =>
                        setReportPaymentMethod(e.target.value)
                      }
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500 cursor-pointer"
                    >
                      <option value="JazzCash">JazzCash</option>
                      <option value="EasyPaisa">EasyPaisa</option>
                      <option value="Bank Transfer">
                        Bank Transfer
                      </option>
                      <option value="COD Fraud">COD Fraud</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-semibold block">
                    Incident Description & Chat Details{' '}
                    <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    required
                    rows={4}
                    value={reportDescription}
                    onChange={(e) =>
                      setReportDescription(e.target.value)
                    }
                    placeholder="Describe what happened, when you transferred the money, and how the seller stopped responding..."
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3.5 text-sm text-zinc-100 focus:outline-none focus:border-red-500 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-semibold block">
                    Upload Evidence (Receipts, Chat Screenshots)
                  </label>

                  <label className="border border-dashed border-zinc-700 bg-zinc-950/60 rounded-xl p-6 text-center hover:border-red-500/50 transition cursor-pointer block">
                    <input
                      type="file"
                      multiple
                      accept="image/png, image/jpeg, image/jpg"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files) {
                          setReportFiles(Array.from(e.target.files));
                        }
                      }}
                    />

                    <svg
                      className="w-8 h-8 text-zinc-500 mx-auto mb-2"
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

                    <span className="text-xs text-zinc-300 font-semibold block">
                      {reportFiles.length > 0
                        ? `${reportFiles.length} file(s) selected`
                        : 'Click to upload files or drag & drop'}
                    </span>

                    <span className="text-[10px] text-zinc-500 block mt-1">
                      PNG, JPG, JPEG up to 10MB
                    </span>
                  </label>
                </div>

                <div className="bg-red-950/20 border border-red-500/30 p-4 rounded-xl flex items-start gap-3">
                  <span className="text-red-400 font-bold text-base mt-0.5">
                    ⚠️
                  </span>

                  <p className="text-xs text-red-300 leading-relaxed">
                    By submitting, you certify that all provided details
                    and payment screenshots are authentic and accurate
                    to the best of your knowledge. False reporting may
                    lead to account termination.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingReport}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl text-sm transition cursor-pointer flex items-center justify-center min-h-[46px]"
                >
                  {isSubmittingReport ? (
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Submit Report & Start 72h Countdown'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* DASHBOARD */}
        {activeTab === 'dashboard' && isLoggedIn && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Welcome back, @{loggedInUser}!
                </h2>

                <p className="text-xs text-zinc-400 mt-1">
                  Manage your active 72-hour dispute tickets, mark
                  resolved, or delete records.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  + File New Report
                </button>

                <button
                  onClick={() => setActiveTab('new-reports')}
                  className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 font-semibold px-4 py-2.5 rounded-xl text-sm transition cursor-pointer"
                >
                  Reports Feed
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-md font-bold text-white">
                Your Active Complaints & 72h Timer
              </h3>

              {userTickets.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-sm">
                  No active complaints right now.
                </div>
              ) : (
                userTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-yellow-400 font-bold">
                        {ticket.id}
                      </span>

                      <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30 px-2.5 py-1 rounded font-medium">
                        {ticket.status}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-white">
                        {ticket.brand}
                      </h4>

                      {/* HANDLE + PLATFORM LOGO */}
                      <PlatformLink platform={ticket.platform} handle={ticket.handle} className="mt-1" />

                      <p className="text-xs text-red-400 font-semibold mt-1">
                        ⏳ {ticket.timeLeft}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-zinc-800 text-xs">
                      <span className="text-zinc-500">
                        Logged on: {ticket.date}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            handleMarkResolved(ticket.id)
                          }
                          className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          ✓ Mark Resolved
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteTicket(ticket.id)
                          }
                          className="bg-zinc-800 hover:bg-red-950/40 border border-zinc-700 hover:border-red-500/40 text-zinc-300 hover:text-red-400 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* REPORTS FEED */}
        {activeTab === 'new-reports' && (
          <div className="max-w-3xl mx-auto py-6 space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Submitted Reports Registry
                </h2>

                <p className="text-xs text-zinc-400 mt-1">
                  Browse submitted reports against brands, platform
                  channels, and their active report counts.
                </p>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  value={newReportSearch}
                  onChange={(e) =>
                    setNewReportSearch(e.target.value)
                  }
                  placeholder="Search brand or handle..."
                  className="bg-zinc-950 border border-zinc-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-red-500 text-zinc-200 placeholder-zinc-500 w-full md:w-56"
                />

                <button
                  onClick={() => setActiveTab('file-report')}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer shrink-0"
                >
                  + File New
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {filteredNewReportsFeed.length === 0 ? (
                <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl text-center text-zinc-400 text-sm">
                  No reports found matching your search.
                </div>
              ) : (
                filteredNewReportsFeed.map((item) => (
                  <div
                    key={item.id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-white">
                        {item.brand}
                      </h4>

                      {/* HANDLE + PLATFORM LOGO */}
                      <PlatformLink platform={item.platform} handle={item.handle} />
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                        Reports Against:
                      </span>

                      <span className="px-2.5 py-1 rounded-md bg-red-500/10 border border-red-500/30 text-red-400 font-mono font-bold text-xs">
                        {item.reportCount}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BRAND DIRECTORY */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Verified & Rated Brand Directory
                </h2>

                <p className="text-xs text-zinc-400 mt-1">
                  Browse trust scores and open dispute counts for
                  Pakistani online sellers.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('file-report')}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
              >
                + File New Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredBrands.map((brand, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-white">
                        {brand.name}
                      </h4>

                      {brand.verified && (
                        <span className="text-xs bg-blue-500/10 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded">
                          Verified
                        </span>
                      )}
                    </div>

                    {/* HANDLE + PLATFORM LOGO */}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                      <span>Handle:</span>
                      <PlatformLink platform={brand.platform} handle={brand.handle} />
                    </div>
                  </div>

                  <ScamMeterBadge
                    score={brand.score}
                    isBlacklisted={brand.score === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BLACKLIST */}
        {activeTab === 'blacklisted' && (
          <div className="space-y-6">
            <div className="bg-red-950/20 border border-red-500/30 p-6 rounded-2xl flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">
                  Official Blacklisted Entities
                </h2>

                <p className="text-xs text-red-300/80 mt-1">
                  Reports that finish their 72-hour timer without
                  brand resolution automatically transition into this
                  blacklist registry.
                </p>
              </div>

              <button
                onClick={() => setActiveTab('file-report')}
                className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shrink-0"
              >
                + File New Report
              </button>
            </div>

            <div className="space-y-4">
              {blacklistedBrands.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-zinc-900 border border-red-500/40 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs text-red-400 font-bold">
                      {item.id}
                    </span>

                    <span className="text-xs bg-red-600 text-white px-2.5 py-0.5 rounded font-mono font-bold">
                      0/100 BLACKLISTED
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">
                      {item.brand}
                    </h4>

                    {/* HANDLE + PLATFORM LOGO */}
                    <PlatformLink platform={item.platform} handle={item.handle} className="mt-1" />

                    <p className="text-xs text-red-300 mt-1 font-medium">
                      {item.reason}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-zinc-800 text-xs text-zinc-400">
                    <span>
                      Date Blacklisted: {item.dateBlacklisted}
                    </span>

                    <span className="text-red-400 font-semibold">
                      Status: Permanently Flagged
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}