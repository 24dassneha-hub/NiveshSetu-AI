import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Building2,
  Compass,
  X,
  Lock,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
  FolderLock,
} from 'lucide-react';
import { Link } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import BusinessContextStrip from '../components/dashboard/BusinessContextStrip';
import { useAuth } from '../context/AuthContext';
import { getLiveDashboardData } from '../data/dashboardData';
import { getApprovals } from '../data/approvalsStorage';
import { getDocuments } from '../data/documentsStorage';
import {
  getAllPortals,
  searchPortals,
  filterPortals,
  resolveApplicationChannel,
  validateOfficialPortal,
  calculateDocumentReadiness,
  getRecommendedPortals,
  getUniqueCategories,
  getUniqueStates,
  getUniqueAuthorities,
  getUniqueChannels,
} from '../services/portalService';

export default function ApplyPage() {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(() => getLiveDashboardData(user));

  // Core Data
  const [approvals, setApprovals] = useState(() => getApprovals());
  const [documents, setDocuments] = useState(() => getDocuments());

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [selectedAuthority, setSelectedAuthority] = useState('All');
  const [selectedChannel, setSelectedChannel] = useState('All');
  const [sortBy, setSortBy] = useState('Recommended');

  // Drawer & Modal State
  const [activePortalForDrawer, setActivePortalForDrawer] = useState(null);
  const [portalForRedirectModal, setPortalForRedirectModal] = useState(null);
  const [expandedReadinessId, setExpandedReadinessId] = useState(null);

  // Sync with localStorage and mode/profile changes
  useEffect(() => {
    const handleStorageUpdate = () => {
      setLiveData(getLiveDashboardData(user));
      setApprovals(getApprovals());
      setDocuments(getDocuments());
    };
    window.addEventListener('storage', handleStorageUpdate);
    window.addEventListener('appModeChanged', handleStorageUpdate);
    window.addEventListener('userBusinessProfileUpdated', handleStorageUpdate);
    return () => {
      window.removeEventListener('storage', handleStorageUpdate);
      window.removeEventListener('appModeChanged', handleStorageUpdate);
      window.removeEventListener('userBusinessProfileUpdated', handleStorageUpdate);
    };
  }, [user]);

  // Keyboard escape handler for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (portalForRedirectModal) setPortalForRedirectModal(null);
        else if (activePortalForDrawer) setActivePortalForDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [portalForRedirectModal, activePortalForDrawer]);

  // Unified Live Business Profile Context
  const businessContext = liveData.business;

  // Dynamic recommendations based on approvals and documents
  const recommendations = useMemo(() => {
    return getRecommendedPortals(approvals, documents);
  }, [approvals, documents]);

  // All registered portals
  const allPortals = useMemo(() => getAllPortals(), []);

  // Filter options
  const categoryOptions = useMemo(() => getUniqueCategories(allPortals), [allPortals]);
  const stateOptions = useMemo(() => getUniqueStates(allPortals), [allPortals]);
  const authorityOptions = useMemo(() => getUniqueAuthorities(allPortals), [allPortals]);
  const channelOptions = useMemo(() => getUniqueChannels(), []);

  // Filtered and searched portal directory
  const filteredPortals = useMemo(() => {
    const searched = searchPortals(searchQuery, allPortals);
    const filtered = filterPortals(searched, {
      category: selectedCategory,
      state: selectedState,
      authority: selectedAuthority,
      channel: selectedChannel,
    });

    // Sorting
    return [...filtered].sort((a, b) => {
      if (sortBy === 'Name (A-Z)') {
        return a.serviceName.localeCompare(b.serviceName);
      }
      if (sortBy === 'Authority') {
        return a.authority.name.localeCompare(b.authority.name);
      }
      if (sortBy === 'Category') {
        return a.category.localeCompare(b.category);
      }
      // Default: Recommended order
      return 0;
    });
  }, [allPortals, searchQuery, selectedCategory, selectedState, selectedAuthority, selectedChannel, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedState !== 'All' ||
    selectedAuthority !== 'All' ||
    selectedChannel !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedState('All');
    setSelectedAuthority('All');
    setSelectedChannel('All');
    setSortBy('Recommended');
  };

  // Safe redirect confirmation trigger
  const handleInitiateApply = (portal) => {
    const validation = validateOfficialPortal(portal);
    if (!validation.isValid) {
      alert(`Cannot open portal: ${validation.reason}`);
      return;
    }
    setPortalForRedirectModal(portal);
  };

  // Safe external navigation after confirmation
  const handleConfirmRedirect = () => {
    if (!portalForRedirectModal) return;

    const validation = validateOfficialPortal(portalForRedirectModal);
    if (!validation.isValid || !validation.cleanUrl) {
      alert('Security validation failed. External redirect aborted.');
      setPortalForRedirectModal(null);
      return;
    }

    // Open verified URL in safe new tab
    window.open(validation.cleanUrl, '_blank', 'noopener,noreferrer');
    setPortalForRedirectModal(null);
  };

  return (
    <DashboardShell>
      {/* Top Breadcrumb & Eyebrow */}
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#6E6A61] font-semibold">
              OFFICIAL APPLICATION PORTALS
            </span>
            <span className="text-[#D6D0C3]">•</span>
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#5D8068] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#5D8068]" />
              VERIFIED GOVERNMENT CHANNELS
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#262522]">
            <div>
              <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-[#171717] tracking-tight">
                Apply
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#6E6A61] mt-1 max-w-3xl leading-relaxed">
                Start your approval applications through the official government portals relevant to your business.
                NiveshSetu routes you directly to verified single windows and departmental portals without fabricating forms.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to="/documents"
                className="px-3 py-2 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-white hover:text-[#18324A] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <FolderLock className="w-3.5 h-3.5 text-[#6E6A61]" />
                Document Vault
              </Link>
              <Link
                to="/sneha"
                className="px-3 py-2 bg-[#18324A] border border-[#18324A] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold hover:bg-[#224564] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
                Sneha AI Advisor
              </Link>
            </div>
          </div>
        </div>

        {/* Business Context Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono-data text-[#6E6A61]">
            <span className="font-bold tracking-wider uppercase">Active Business Profile</span>
            <span>DEMO ENVIRONMENT • ODISHA</span>
          </div>
          <BusinessContextStrip business={businessContext} />
        </div>

        {/* Prominent Search Bar */}
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 shadow-xs">
          <div className="mb-2">
            <label
              htmlFor="portal-search-input"
              className="meta-label text-[10px] text-[#6E6A61] tracking-wider uppercase font-mono-data font-bold block"
            >
              SEARCH OFFICIAL GOVERNMENT PORTALS
            </label>
          </div>
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-[#6E6A61] absolute left-3.5 pointer-events-none" />
            <input
              id="portal-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by service, approval, department, or portal (e.g., Fire NOC, OSPCB, NSWS, FSSAI, Labour)..."
              className="w-full bg-[#FFFFFF] border border-[#262522] rounded-[3px] py-3 pl-11 pr-10 text-sm font-sans text-[#171717] placeholder:text-[#8B8982] focus:outline-none focus:ring-2 focus:ring-[#18324A] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 p-1 text-[#6E6A61] hover:text-[#171717] transition-colors"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs font-mono-data text-[#6E6A61]">
            <span className="text-[11px]">Quick filters:</span>
            {['Fire NOC', 'Pollution', 'Factory License', 'FSSAI', 'NSWS', 'Labour'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setSearchQuery(term)}
                className={`px-2 py-0.5 border rounded-[2px] text-[11px] transition-colors cursor-pointer ${
                  searchQuery.toLowerCase() === term.toLowerCase()
                    ? 'bg-[#18324A] text-white border-[#18324A]'
                    : 'bg-[#FAF8F2] border-[#D6D0C3] hover:border-[#262522] text-[#30302D]'
                }`}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION: Recommended for Your Business */}
        <section className="space-y-4 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-[#D6D0C3]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
                <h2 className="font-sans font-bold text-xl text-[#171717] tracking-tight">
                  Recommended for your business
                </h2>
              </div>
              <p className="font-sans text-xs sm:text-sm text-[#6E6A61] mt-0.5">
                Start with the approval services identified for your business profile by Sneha AI.
              </p>
            </div>
            <span className="font-mono-data text-xs text-[#18324A] font-semibold">
              {recommendations.length} Recommended {recommendations.length === 1 ? 'Clearance' : 'Clearances'}
            </span>
          </div>

          {recommendations.length === 0 ? (
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 text-center space-y-3">
              <Compass className="w-10 h-10 text-[#6E6A61] mx-auto opacity-70" />
              <h3 className="font-sans font-bold text-base text-[#171717]">
                No approval recommendations yet
              </h3>
              <p className="font-sans text-xs text-[#6E6A61] max-w-md mx-auto">
                Complete your business profile and run Sneha AI to identify the exact statutory approvals and line department portals relevant to your business.
              </p>
              <Link
                to="/sneha"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#18324A] text-[#FAF8F2] font-mono-data text-xs font-semibold rounded-[3px] hover:bg-[#224564] transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
                Consult Sneha AI
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {recommendations.map((item) => {
                const portal = item.portal;
                const readiness = item.readiness;
                const isExpanded = expandedReadinessId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 shadow-xs flex flex-col justify-between hover:border-[#18324A] transition-colors"
                  >
                    <div>
                      {/* Card Header & Badges */}
                      <div className="flex items-start justify-between gap-2 mb-2.5">
                        <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[2px] text-[#18324A]">
                          {item.category}
                        </span>

                        {item.channelType === 'NSWS' ? (
                          <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 bg-[#18324A]/10 text-[#18324A] border border-[#18324A]/30 rounded-[2px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#18324A]" />
                            AVAILABLE VIA NSWS
                          </span>
                        ) : item.channelType === 'EXTERNAL_PORTAL' ? (
                          <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#5D8068]" />
                            VERIFIED OFFICIAL PORTAL
                          </span>
                        ) : (
                          <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 bg-[#8B8982]/15 text-[#6E6A61] border border-[#8B8982]/30 rounded-[2px]">
                            CHANNEL UNAVAILABLE
                          </span>
                        )}
                      </div>

                      {/* Service Title */}
                      <h3 className="font-sans font-bold text-base sm:text-lg text-[#171717] tracking-tight leading-snug">
                        {item.name}
                      </h3>

                      {/* Authority */}
                      <div className="flex items-center gap-1.5 text-xs text-[#6E6A61] mt-1 font-sans">
                        <Building2 className="w-3.5 h-3.5 shrink-0 text-[#6E6A61]" />
                        <span className="truncate">{item.authority}</span>
                      </div>

                      {/* Portal Description */}
                      {portal && (
                        <p className="font-sans text-xs text-[#30302D] mt-2.5 line-clamp-2 leading-relaxed">
                          {portal.description}
                        </p>
                      )}

                      {/* Document Readiness Strip */}
                      <div className="mt-4 p-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <FileText className="w-3.5 h-3.5 text-[#18324A]" />
                            <span className="font-mono-data text-[11px] font-bold text-[#171717] uppercase tracking-wider">
                              DOCUMENT READINESS
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`font-mono-data text-xs font-bold ${
                                readiness.missingCount === 0
                                  ? 'text-[#5D8068]'
                                  : readiness.readyCount > 0
                                  ? 'text-[#C08A3E]'
                                  : 'text-[#B85C4A]'
                              }`}
                            >
                              {readiness.readyCount} / {readiness.totalRequired} Ready
                            </span>
                            <button
                              type="button"
                              onClick={() => setExpandedReadinessId(isExpanded ? null : item.id)}
                              className="p-1 text-[#6E6A61] hover:text-[#171717] transition-colors"
                              aria-label="Toggle document checklist"
                            >
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-[#E9E1D0] h-1.5 rounded-full mt-2 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 ${
                              readiness.percentage === 100
                                ? 'bg-[#5D8068]'
                                : readiness.percentage >= 50
                                ? 'bg-[#C08A3E]'
                                : 'bg-[#B85C4A]'
                            }`}
                            style={{ width: `${readiness.percentage}%` }}
                          />
                        </div>

                        {/* Expanded Checklist */}
                        {isExpanded && readiness.items.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-[#E9E1D0] space-y-1.5 text-xs font-sans">
                            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase font-bold block mb-1">
                              Mandatory Verification Checklist:
                            </span>
                            {readiness.items.map((doc, idx) => (
                              <div key={idx} className="flex items-start gap-2 py-0.5">
                                {doc.isReady ? (
                                  <CheckCircle2 className="w-3.5 h-3.5 text-[#5D8068] shrink-0 mt-0.5" />
                                ) : (
                                  <AlertTriangle className="w-3.5 h-3.5 text-[#C08A3E] shrink-0 mt-0.5" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <span className={`text-xs ${doc.isReady ? 'text-[#171717]' : 'text-[#6E6A61]'}`}>
                                    {doc.name}
                                  </span>
                                  {doc.documentName && (
                                    <span className="text-[10px] font-mono-data text-[#5D8068] block">
                                      Attached: {doc.documentName}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                            <div className="pt-2 flex justify-between items-center text-[11px] font-mono-data">
                              <Link to="/documents" className="text-[#18324A] hover:underline font-semibold">
                                Open Document Vault →
                              </Link>
                              {readiness.missingCount > 0 && (
                                <span className="text-[#C08A3E] font-medium">
                                  {readiness.missingCount} document{readiness.missingCount > 1 ? 's' : ''} missing
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Footer */}
                    <div className="mt-5 pt-4 border-t border-[#D6D0C3] flex items-center justify-between gap-3">
                      {portal && (
                        <div className="min-w-0">
                          <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block truncate">
                            OFFICIAL DESTINATION
                          </span>
                          <span className="font-mono-data text-xs text-[#18324A] font-medium flex items-center gap-1 truncate">
                            <Lock className="w-3 h-3 text-[#5D8068]" />
                            {portal.domain}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-2 shrink-0">
                        {portal && (
                          <button
                            type="button"
                            onClick={() => setActivePortalForDrawer(portal)}
                            className="px-2.5 py-1.5 border border-[#262522] rounded-[3px] bg-[#FAF8F2] hover:bg-[#FFFFFF] text-xs font-mono-data text-[#171717] font-medium transition-colors"
                          >
                            Details
                          </button>
                        )}

                        {item.channelType === 'NSWS' && portal ? (
                          <button
                            type="button"
                            onClick={() => handleInitiateApply(portal)}
                            className="px-3.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Continue on NSWS</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : item.channelType === 'EXTERNAL_PORTAL' && portal ? (
                          <button
                            type="button"
                            onClick={() => handleInitiateApply(portal)}
                            className="px-3.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Apply on Official Portal</span>
                            <ExternalLink className="w-3 h-3" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-1.5 bg-[#E9E1D0] border border-[#D6D0C3] text-[#8B8982] rounded-[3px] text-xs font-mono-data font-medium cursor-not-allowed"
                          >
                            Channel Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* SECTION: All Official Portals Directory */}
        <section className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-[#262522]">
            <div>
              <h2 className="font-sans font-bold text-xl text-[#171717] tracking-tight">
                All Official Portals
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#6E6A61] mt-0.5">
                Browse verified government application channels available in the NiveshSetu directory.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-bold text-[#171717]">
                {filteredPortals.length} official {filteredPortals.length === 1 ? 'portal' : 'portals'}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-mono-data text-xs text-[#B85C4A] hover:underline flex items-center gap-1 font-semibold ml-2"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono-data">
              {/* Category Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'All' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* State Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  State / Scope
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {stateOptions.map((st) => (
                    <option key={st} value={st}>
                      {st === 'All' ? 'All States' : st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Authority Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Authority
                </label>
                <select
                  value={selectedAuthority}
                  onChange={(e) => setSelectedAuthority(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {authorityOptions.map((auth) => (
                    <option key={auth} value={auth}>
                      {auth === 'All' ? 'All Authorities' : auth}
                    </option>
                  ))}
                </select>
              </div>

              {/* Application Channel Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Channel
                </label>
                <select
                  value={selectedChannel}
                  onChange={(e) => setSelectedChannel(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {channelOptions.map((ch) => (
                    <option key={ch} value={ch}>
                      {ch === 'All' ? 'All Channels' : ch}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  <option value="Recommended">Recommended</option>
                  <option value="Name (A-Z)">Name (A–Z)</option>
                  <option value="Authority">Authority</option>
                  <option value="Category">Category</option>
                </select>
              </div>
            </div>
          </div>

          {/* Portal List / Results */}
          {filteredPortals.length === 0 ? (
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 text-center space-y-3">
              <Search className="w-10 h-10 text-[#6E6A61] mx-auto opacity-70" />
              <h3 className="font-sans font-bold text-base text-[#171717]">
                No official portal found
              </h3>
              <p className="font-sans text-xs text-[#6E6A61] max-w-md mx-auto">
                We couldn't find a verified government application portal matching your search or filters.
                Try searching by approval name, service, department, or authority.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 bg-[#18324A] text-[#FAF8F2] font-mono-data text-xs font-semibold rounded-[3px] hover:bg-[#224564] transition-colors"
              >
                Clear search & filters
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPortals.map((portal) => {
                const channel = resolveApplicationChannel(portal);
                const readiness = calculateDocumentReadiness(portal, documents);

                return (
                  <div
                    key={portal.id}
                    className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 sm:p-5 hover:bg-white transition-[background-color,border-color] duration-150 flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    {/* Left details */}
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[2px] text-[#18324A]">
                          {portal.category}
                        </span>
                        <span className="font-mono-data text-[10px] text-[#6E6A61]">
                          {portal.authority.jurisdiction} • {portal.authority.state}
                        </span>

                        {channel === 'NSWS' ? (
                          <span className="font-mono-data text-[10px] font-bold px-1.5 py-0.2 bg-[#18324A]/10 text-[#18324A] border border-[#18324A]/30 rounded-[2px]">
                            NSWS
                          </span>
                        ) : (
                          <span className="font-mono-data text-[10px] font-bold px-1.5 py-0.2 bg-[#5D8068]/10 text-[#2A5237] border border-[#5D8068]/30 rounded-[2px] flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-[#5D8068]" />
                            VERIFIED OFFICIAL
                          </span>
                        )}
                      </div>

                      <h3 className="font-sans font-bold text-base sm:text-lg text-[#171717] tracking-tight">
                        {portal.serviceName}
                      </h3>

                      <p className="font-sans text-xs text-[#6E6A61] line-clamp-1">
                        {portal.authority.name} • {portal.authority.department}
                      </p>

                      <p className="font-sans text-xs text-[#30302D] line-clamp-2 pt-0.5">
                        {portal.description}
                      </p>

                      <div className="pt-1 flex flex-wrap items-center gap-4 text-[11px] font-mono-data text-[#6E6A61]">
                        <span className="flex items-center gap-1 text-[#18324A]">
                          <Lock className="w-3 h-3 text-[#5D8068]" />
                          {portal.domain}
                        </span>
                        <span>•</span>
                        <span>Verified: {portal.lastVerifiedAt}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold ${
                            readiness.missingCount === 0 ? 'text-[#5D8068]' : 'text-[#C08A3E]'
                          }`}
                        >
                          Docs: {readiness.readyCount}/{readiness.totalRequired} Ready
                        </span>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 pt-3 md:pt-0 border-t md:border-t-0 border-[#D6D0C3] shrink-0">
                      <div className="flex items-center gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={() => setActivePortalForDrawer(portal)}
                          className="px-3 py-2 border border-[#262522] rounded-[3px] bg-[#FAF8F2] hover:bg-[#FFFFFF] text-xs font-mono-data text-[#171717] font-medium transition-colors"
                        >
                          Details
                        </button>

                        {channel === 'NSWS' ? (
                          <button
                            type="button"
                            onClick={() => handleInitiateApply(portal)}
                            className="flex-1 md:flex-initial px-3.5 py-2 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Continue on NSWS</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        ) : channel === 'EXTERNAL_PORTAL' ? (
                          <button
                            type="button"
                            onClick={() => handleInitiateApply(portal)}
                            className="flex-1 md:flex-initial px-3.5 py-2 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <span>Apply on Official Portal</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            className="px-3 py-2 bg-[#E9E1D0] border border-[#D6D0C3] text-[#8B8982] rounded-[3px] text-xs font-mono-data font-medium cursor-not-allowed"
                          >
                            Unavailable
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Legal Disclaimer Banner */}
        <div className="p-4 bg-[#E9E1D0]/70 border border-[#262522] rounded-[4px] flex items-start gap-3 text-xs font-sans text-[#30302D]">
          <Info className="w-4 h-4 text-[#18324A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase tracking-wider block">
              STATUTORY COMPLIANCE & LEGAL NOTICE
            </span>
            <p className="leading-relaxed">
              NiveshSetu AI is an independent enterprise compliance and intelligence platform and not a government website.
              Government applications and final statutory submissions are completed on the respective official government portals or authorized application channels.
            </p>
          </div>
        </div>
      </div>

      {/* PORTAL DETAIL DRAWER */}
      {activePortalForDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setActivePortalForDrawer(null)}
            className="fixed inset-0 bg-[#171717]/50 backdrop-blur-[1px] transition-opacity"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl bg-[#FAF8F2] border-l border-[#262522] p-6 h-full z-10 overflow-y-auto shadow-2xl flex flex-col justify-between">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#262522]">
                <div>
                  <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider text-[#6E6A61] block mb-1">
                    OFFICIAL APPLICATION SERVICE
                  </span>
                  <h2 className="font-sans font-bold text-xl text-[#171717] tracking-tight">
                    {activePortalForDrawer.serviceName}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setActivePortalForDrawer(null)}
                  className="p-1.5 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-[#262522] transition-colors"
                  aria-label="Close drawer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Metadata Badges */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-white border border-[#D6D0C3] rounded-[3px] font-mono-data text-xs">
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Category</span>
                  <span className="text-[#171717] font-semibold">{activePortalForDrawer.category}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Jurisdiction</span>
                  <span className="text-[#171717] font-semibold">{activePortalForDrawer.authority.jurisdiction}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Department</span>
                  <span className="text-[#171717] font-semibold truncate block">
                    {activePortalForDrawer.authority.department}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Channel Type</span>
                  <span className="text-[#18324A] font-bold">
                    {resolveApplicationChannel(activePortalForDrawer) === 'NSWS'
                      ? 'National Single Window'
                      : 'Verified Official Portal'}
                  </span>
                </div>
              </div>

              {/* Authority & Description */}
              <div className="space-y-2">
                <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider block">
                  ISSUING AUTHORITY
                </span>
                <p className="font-sans text-sm font-bold text-[#171717]">
                  {activePortalForDrawer.authority.name}
                </p>
                <p className="font-sans text-xs text-[#30302D] leading-relaxed">
                  {activePortalForDrawer.description}
                </p>
              </div>

              {/* Statutory Acts */}
              {activePortalForDrawer.acts && (
                <div className="p-3 bg-[#E9E1D0]/50 border border-[#D6D0C3] rounded-[3px] text-xs font-sans">
                  <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase block mb-1">
                    Statutory Acts & Legal Basis:
                  </span>
                  <p className="text-[#30302D]">{activePortalForDrawer.acts}</p>
                </div>
              )}

              {/* Document Readiness Breakdown */}
              {(() => {
                const readiness = calculateDocumentReadiness(activePortalForDrawer, documents);

                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider">
                        DOCUMENT VAULT PRE-FLIGHT CHECK
                      </span>
                      <span className="font-mono-data text-xs font-bold text-[#18324A]">
                        {readiness.readyCount} / {readiness.totalRequired} Ready ({readiness.percentage}%)
                      </span>
                    </div>

                    <div className="p-3 bg-white border border-[#D6D0C3] rounded-[3px] space-y-2">
                      {readiness.items.map((doc, idx) => (
                        <div key={idx} className="flex items-start justify-between gap-2 text-xs py-1 border-b border-[#F3EFE5] last:border-0">
                          <div className="flex items-start gap-2">
                            {doc.isReady ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#5D8068] shrink-0 mt-0.5" />
                            ) : (
                              <AlertTriangle className="w-3.5 h-3.5 text-[#C08A3E] shrink-0 mt-0.5" />
                            )}
                            <div>
                              <span className="font-medium text-[#171717]">{doc.name}</span>
                              {doc.description && (
                                <p className="text-[11px] text-[#6E6A61] mt-0.5">{doc.description}</p>
                              )}
                            </div>
                          </div>
                          <span
                            className={`font-mono-data text-[10px] uppercase font-bold shrink-0 ${
                              doc.isReady ? 'text-[#5D8068]' : 'text-[#B85C4A]'
                            }`}
                          >
                            {doc.isReady ? 'READY' : 'MISSING'}
                          </span>
                        </div>
                      ))}

                      <div className="pt-2 flex justify-between items-center text-xs font-mono-data">
                        <Link to="/documents" className="text-[#18324A] hover:underline font-semibold flex items-center gap-1">
                          <FolderLock className="w-3.5 h-3.5" />
                          Manage Vault Documents →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Official Domain Check */}
              <div className="p-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] font-mono-data text-xs space-y-1">
                <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Official Domain Verification</span>
                <div className="flex items-center gap-2 text-[#18324A] font-bold">
                  <Lock className="w-3.5 h-3.5 text-[#5D8068]" />
                  <span>https://{activePortalForDrawer.domain}</span>
                </div>
                <span className="text-[10px] text-[#6E6A61] block">
                  Last verified by administration on {activePortalForDrawer.lastVerifiedAt}
                </span>
              </div>
            </div>

            {/* Drawer Bottom CTA */}
            <div className="pt-6 border-t border-[#262522] mt-6 space-y-3">
              <p className="text-[11px] font-sans text-[#6E6A61] text-center">
                NiveshSetu AI does not submit this application. You will continue on the official application channel.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActivePortalForDrawer(null)}
                  className="w-1/3 py-2.5 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-[#E9E1D0] transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const p = activePortalForDrawer;
                    setActivePortalForDrawer(null);
                    handleInitiateApply(p);
                  }}
                  className="flex-1 py-2.5 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>
                    {resolveApplicationChannel(activePortalForDrawer) === 'NSWS'
                      ? 'Continue to NSWS'
                      : 'Apply on Official Portal'}
                  </span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SAFE EXTERNAL REDIRECT CONFIRMATION MODAL */}
      {portalForRedirectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setPortalForRedirectModal(null)}
            className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[2px] transition-opacity"
            aria-hidden="true"
          />

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-6 z-10 shadow-2xl space-y-5 animate-in fade-in duration-150">
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#262522]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#18324A] text-[#FAF8F2] flex items-center justify-center font-mono-data">
                  <ExternalLink className="w-4 h-4 text-[#FAF8F2]" />
                </div>
                <div>
                  <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider block">
                    EXTERNAL GOVERNMENT REDIRECT
                  </span>
                  <h3 className="font-sans font-bold text-lg text-[#171717] tracking-tight">
                    You're leaving NiveshSetu AI
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPortalForRedirectModal(null)}
                className="p-1 text-[#6E6A61] hover:text-[#171717] transition-colors"
                aria-label="Cancel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="font-sans text-xs sm:text-sm text-[#30302D] leading-relaxed">
              You'll continue your application on the official government website:
            </p>

            {/* Destination Verification Preview Box */}
            <div className="p-3.5 bg-white border border-[#262522] rounded-[3px] space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-sm text-[#171717]">
                  {portalForRedirectModal.serviceName}
                </span>
                <span className="font-mono-data text-[9.5px] font-bold px-1.5 py-0.2 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px]">
                  HTTPS SECURE
                </span>
              </div>
              <div className="text-xs text-[#6E6A61] font-sans">
                Authority: {portalForRedirectModal.authority.name}
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono-data text-[#18324A] font-bold pt-1 border-t border-[#F3EFE5]">
                <Lock className="w-3.5 h-3.5 text-[#5D8068]" />
                <span className="truncate">{portalForRedirectModal.officialUrl}</span>
              </div>
            </div>

            <div className="text-xs text-[#6E6A61] font-sans space-y-1 bg-[#E9E1D0]/40 p-3 rounded-[3px] border border-[#D6D0C3]">
              <p>
                <strong>Important:</strong> NiveshSetu AI helps you understand the approval, prepare your documents, and find the correct application channel. The statutory application itself is completed on the official government website.
              </p>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPortalForRedirectModal(null)}
                className="px-4 py-2 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-[#E9E1D0] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmRedirect}
                className="px-4 py-2 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
              >
                <span>
                  {resolveApplicationChannel(portalForRedirectModal) === 'NSWS'
                    ? 'Continue to NSWS'
                    : 'Continue to Official Portal'}
                </span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardShell>
  );
}
