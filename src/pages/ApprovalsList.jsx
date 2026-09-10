import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  PlusCircle,
  Download,
  RotateCcw,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import BusinessContextStrip from '../components/dashboard/BusinessContextStrip';
import { useAuth } from '../context/AuthContext';
import { getApprovals, getApprovalsFromSupabase, CATEGORIES } from '../data/approvalsStorage';
import { NORMALIZED_STATUS } from '../services/monitoringService';
import { getLiveDashboardData } from '../data/dashboardData';
import ApprovalMetricsSummary from '../components/approvals/ApprovalMetricsSummary';
import MonitoringStatusBanner from '../components/approvals/MonitoringStatusBanner';
import ApprovalDetailDrawer from '../components/approvals/ApprovalDetailDrawer';
import CertificateModal from '../components/approvals/CertificateModal';
import TrackApplicationModal from '../components/approvals/TrackApplicationModal';

export default function ApprovalsList() {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(() => getLiveDashboardData(user));
  const [approvals, setApprovals] = useState(() => getApprovals());

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedSource, setSelectedSource] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Updated');

  // Modals & Drawers
  const [activeApprovalForDrawer, setActiveApprovalForDrawer] = useState(null);
  const [activeApprovalForCert, setActiveApprovalForCert] = useState(null);
  const [showTrackModal, setShowTrackModal] = useState(false);

  // Sync state with storage and mode/profile changes
  const reloadData = () => {
    setLiveData(getLiveDashboardData(user));
    setApprovals(getApprovals());
  };

  useEffect(() => {
    async function loadCloudApprovals() {
      const fetched = await getApprovalsFromSupabase(user?.id);
      if (Array.isArray(fetched) && fetched.length > 0) {
        setApprovals(fetched);
      }
    }
    loadCloudApprovals();
  }, [user?.id]);

  useEffect(() => {
    window.addEventListener('storage', reloadData);
    window.addEventListener('appModeChanged', reloadData);
    window.addEventListener('userBusinessProfileUpdated', reloadData);
    return () => {
      window.removeEventListener('storage', reloadData);
      window.removeEventListener('appModeChanged', reloadData);
      window.removeEventListener('userBusinessProfileUpdated', reloadData);
    };
  }, [user]);

  // Keyboard escape for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (showTrackModal) setShowTrackModal(false);
        else if (activeApprovalForCert) setActiveApprovalForCert(null);
        else if (activeApprovalForDrawer) setActiveApprovalForDrawer(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTrackModal, activeApprovalForCert, activeApprovalForDrawer]);

  // Unified Live Business Profile Context
  const businessContext = liveData.business;

  // Unique sources
  const monitoringSources = useMemo(() => {
    const set = new Set();
    approvals.forEach((a) => {
      if (a.monitoring?.source) set.add(a.monitoring.source);
    });
    return ['All', ...Array.from(set)];
  }, [approvals]);

  // Action Required list (surfaced prominently at the top)
  const actionRequiredApprovals = useMemo(() => {
    return approvals.filter(
      (a) => a.status?.normalized === NORMALIZED_STATUS.ACTION_REQUIRED
    );
  }, [approvals]);

  // Filtered & sorted approvals
  const filteredApprovals = useMemo(() => {
    return approvals
      .filter((a) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const matchName = a.name?.toLowerCase().includes(q);
          const matchAuth = a.authority?.name?.toLowerCase().includes(q);
          const matchCat = a.category?.toLowerCase().includes(q);
          const matchAppId = a.application?.applicationId?.toLowerCase().includes(q);
          const matchGovStatus = a.status?.sourceStatus?.toLowerCase().includes(q);
          if (!matchName && !matchAuth && !matchCat && !matchAppId && !matchGovStatus) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'All') {
          if (a.status?.normalized !== selectedStatus) return false;
        }

        // Source filter
        if (selectedSource !== 'All') {
          if (a.monitoring?.source !== selectedSource) return false;
        }

        // Category filter
        if (selectedCategory !== 'All') {
          if (a.category !== selectedCategory) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Approval Name') {
          return (a.name || '').localeCompare(b.name || '');
        }
        if (sortBy === 'Status') {
          return (a.status?.normalized || '').localeCompare(b.status?.normalized || '');
        }
        if (sortBy === 'Response Deadline') {
          const da = a.actionRequired?.deadline || '9999';
          const db = b.actionRequired?.deadline || '9999';
          return da.localeCompare(db);
        }
        // Default: Recently Updated
        const dateA = new Date(a.updatedAt || a.status?.changedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || b.status?.changedAt || 0).getTime();
        return dateB - dateA;
      });
  }, [approvals, searchQuery, selectedStatus, selectedSource, selectedCategory, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedStatus !== 'All' ||
    selectedSource !== 'All' ||
    selectedCategory !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedSource('All');
    setSelectedCategory('All');
    setSortBy('Recently Updated');
  };

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Top Eyebrow & Page Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#6E6A61] font-semibold">
              APPROVAL MONITOR
            </span>
            <span className="text-[#D6D0C3]">•</span>
            <span className="font-mono-data text-[10px] uppercase tracking-wider text-[#18324A] font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#5D8068]" />
              CONNECTED SINGLE WINDOW SOURCES
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-4 border-b border-[#262522]">
            <div>
              <h1 className="font-sans font-bold text-2xl sm:text-3xl lg:text-4xl text-[#171717] tracking-tight">
                Your Government Approvals
              </h1>
              <p className="font-sans text-sm sm:text-base text-[#6E6A61] mt-1 max-w-3xl leading-relaxed">
                Sneha AI monitors connected application channels and keeps your approval status up to date in one place.
                The government system is the sole source of truth.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowTrackModal(true)}
                className="px-3 py-2 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-white hover:text-[#18324A] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-[#18324A]" />
                Track Application ID
              </button>

              <Link
                to="/apply"
                className="px-3 py-2 bg-[#18324A] border border-[#18324A] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold hover:bg-[#224564] transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Go to Apply</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#C08A3E]" />
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

        {/* Top Summary Metrics */}
        <ApprovalMetricsSummary approvals={approvals} />

        {/* Sneha AI Monitoring Status & Demo Controls */}
        <MonitoringStatusBanner approvals={approvals} onRefresh={reloadData} />

        {/* PROMINENT SECTION: Action Required Triage (if department queries exist) */}
        {actionRequiredApprovals.length > 0 && (
          <section className="p-4 sm:p-5 bg-[#B85C4A]/10 border-2 border-[#B85C4A]/40 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-[#B85C4A]" />
                <h2 className="font-sans font-bold text-base text-[#171717] tracking-tight">
                  Action Required ({actionRequiredApprovals.length})
                </h2>
              </div>
              <span className="font-mono-data text-[11px] font-bold text-[#B85C4A] bg-white px-2 py-0.5 border border-[#B85C4A]/30 rounded-[2px]">
                Statutory Queries Raised
              </span>
            </div>
            <p className="font-sans text-xs text-[#30302D] leading-relaxed">
              The issuing department has requested clarifications or additional documentation. Failure to respond within statutory deadlines may result in automatic application rejection.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {actionRequiredApprovals.map((item) => (
                <div
                  key={item.id}
                  className="bg-white border border-[#262522] rounded-[3px] p-3.5 space-y-2 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-mono-data text-[#6E6A61] mb-1">
                      <span className="font-bold text-[#B85C4A] uppercase">DEFICIENCY NOTICE</span>
                      {item.actionRequired?.deadline && (
                        <span className="font-bold px-1.5 py-0.2 bg-[#B85C4A] text-white rounded">
                          Deadline: {item.actionRequired.deadline}
                        </span>
                      )}
                    </div>
                    <h3 className="font-sans font-bold text-sm text-[#171717]">
                      {item.name}
                    </h3>
                    <span className="font-mono-data text-[11px] text-[#6E6A61] block">
                      Ref: {item.application?.applicationId} • {item.authority?.name}
                    </span>
                    <p className="font-sans text-xs text-[#30302D] mt-2 line-clamp-2 leading-snug bg-[#FAF8F2] p-2 border border-[#D6D0C3] rounded-[2px]">
                      {item.actionRequired?.message}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#F3EFE5] flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveApprovalForDrawer(item)}
                      className="text-xs font-mono-data font-semibold text-[#18324A] hover:underline"
                    >
                      View Details →
                    </button>
                    {item.officialUrl && (
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-[#B85C4A] hover:bg-[#a64e3c] text-white rounded-[2px] text-xs font-mono-data font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Respond on Portal</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* MAIN APPROVAL MONITOR DIRECTORY */}
        <section className="space-y-4 pt-2">
          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 pb-2 border-b border-[#262522]">
            <div>
              <h2 className="font-sans font-bold text-xl text-[#171717] tracking-tight">
                All Monitored Clearances
              </h2>
              <p className="font-sans text-xs sm:text-sm text-[#6E6A61] mt-0.5">
                Overview of statutory licenses, permits, and permissions linked to your enterprise profile.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-xs font-bold text-[#171717]">
                {filteredApprovals.length} tracked {filteredApprovals.length === 1 ? 'approval' : 'approvals'}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="font-mono-data text-xs text-[#B85C4A] hover:underline flex items-center gap-1 font-semibold ml-2 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-xs space-y-3">
            {/* Search Box */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#6E6A61] absolute left-3 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by clearance name, department, application ID, or government status..."
                className="w-full bg-white border border-[#262522] rounded-[3px] py-2 pl-9 pr-8 text-xs font-sans text-[#171717] placeholder:text-[#8B8982] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
              />
            </div>

            {/* Dropdown Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs font-mono-data">
              {/* Status Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Compliance Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  <option value="All">All Statuses</option>
                  <option value={NORMALIZED_STATUS.APPROVED}>Approved</option>
                  <option value={NORMALIZED_STATUS.UNDER_PROCESS}>Under Process</option>
                  <option value={NORMALIZED_STATUS.ACTION_REQUIRED}>Action Required</option>
                  <option value={NORMALIZED_STATUS.NOT_YET}>Not Yet Applied</option>
                  <option value={NORMALIZED_STATUS.REJECTED}>Rejected</option>
                </select>
              </div>

              {/* Monitoring Source Filter */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Monitoring Source
                </label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  {monitoringSources.map((src) => (
                    <option key={src} value={src}>
                      {src === 'All' ? 'All Sources' : src}
                    </option>
                  ))}
                </select>
              </div>

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
                  <option value="All">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-[10px] text-[#6E6A61] uppercase tracking-wider mb-1 font-bold">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-white border border-[#262522] rounded-[3px] py-1.5 px-2 text-xs text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
                >
                  <option value="Recently Updated">Recently Updated</option>
                  <option value="Approval Name">Clearance Name (A–Z)</option>
                  <option value="Status">Status</option>
                  <option value="Response Deadline">Response Deadline</option>
                </select>
              </div>
            </div>
          </div>

          {/* MAIN LIST: Desktop Editorial Table & Mobile Cards */}
          {filteredApprovals.length === 0 ? (
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 text-center space-y-3">
              <Search className="w-10 h-10 text-[#6E6A61] mx-auto opacity-70" />
              <h3 className="font-sans font-bold text-base text-[#171717]">
                No approvals match your criteria
              </h3>
              <p className="font-sans text-xs text-[#6E6A61] max-w-md mx-auto">
                No monitored government approvals matched your search or filters. You can clear filters or link a new application ID.
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-white border border-[#262522] text-[#171717] text-xs font-mono-data font-semibold rounded-[3px] hover:bg-[#E9E1D0] transition-colors cursor-pointer"
                >
                  Clear Filters
                </button>
                <button
                  type="button"
                  onClick={() => setShowTrackModal(true)}
                  className="px-4 py-2 bg-[#18324A] text-white text-xs font-mono-data font-semibold rounded-[3px] hover:bg-[#224564] transition-colors cursor-pointer"
                >
                  Track Application
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-[#262522] rounded-[4px] overflow-hidden shadow-xs">
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#FAF8F2] border-b border-[#262522] font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 font-bold">APPROVAL & AUTHORITY</th>
                      <th className="py-3 px-4 font-bold">APPLICATION ID</th>
                      <th className="py-3 px-4 font-bold">STATUS & STAGE</th>
                      <th className="py-3 px-4 font-bold">LAST UPDATED</th>
                      <th className="py-3 px-4 font-bold">SOURCE</th>
                      <th className="py-3 px-4 font-bold text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E9E1D0]">
                    {filteredApprovals.map((item) => {
                      const normStatus = item.status?.normalized;
                      return (
                        <tr
                          key={item.id}
                          className="hover:bg-[#FAF8F2] transition-colors cursor-pointer group"
                          onClick={() => setActiveApprovalForDrawer(item)}
                        >
                          {/* Approval Name & Authority */}
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-sm text-[#171717] group-hover:text-[#18324A]">
                              {item.name}
                            </div>
                            <div className="text-xs text-[#6E6A61] truncate max-w-xs mt-0.5">
                              {item.authority?.name}
                            </div>
                          </td>

                          {/* Application ID */}
                          <td className="py-3.5 px-4 font-mono-data font-semibold text-[#18324A]">
                            {item.application?.applicationId || (
                              <span className="text-[#8B8982] font-normal italic">Not Submitted</span>
                            )}
                          </td>

                          {/* Status & Current Stage */}
                          <td className="py-3.5 px-4">
                            <div>
                              {normStatus === NORMALIZED_STATUS.APPROVED ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                                  <ShieldCheck className="w-3 h-3 text-[#5D8068]" />
                                  APPROVED
                                </span>
                              ) : normStatus === NORMALIZED_STATUS.ACTION_REQUIRED ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B85C4A]/15 text-[#B85C4A] border border-[#B85C4A]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                                  <AlertTriangle className="w-3 h-3 text-[#B85C4A]" />
                                  ACTION REQUIRED
                                </span>
                              ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#8B8982]/15 text-[#6E6A61] border border-[#8B8982]/30 rounded-[2px] font-mono-data text-[10px] font-bold">
                                  NOT YET
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C08A3E]/15 text-[#8F611E] border border-[#C08A3E]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                                  <Clock className="w-3 h-3 text-[#C08A3E]" />
                                  UNDER PROCESS
                                </span>
                              )}
                              <span className="block text-[11px] text-[#30302D] mt-1 truncate max-w-xs">
                                {item.status?.sourceStatus || item.status?.currentStage}
                              </span>
                            </div>
                          </td>

                          {/* Last Updated */}
                          <td className="py-3.5 px-4 text-xs font-mono-data text-[#6E6A61]">
                            {item.application?.submissionDate || 'Recently'}
                          </td>

                          {/* Source */}
                          <td className="py-3.5 px-4 font-mono-data text-xs">
                            <span className="text-[#171717] font-semibold">
                              {item.monitoring?.source || 'NSWS'}
                            </span>
                            {item.monitoring?.connectionStatus === 'MONITORING_UNAVAILABLE' && (
                              <span className="block text-[9.5px] text-[#8B8982]">
                                Manual Only
                              </span>
                            )}
                          </td>

                          {/* Action Button */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-2">
                              {normStatus === NORMALIZED_STATUS.APPROVED && item.certificate?.available ? (
                                <button
                                  type="button"
                                  onClick={() => setActiveApprovalForCert(item)}
                                  className="px-2.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-white rounded-[2px] text-xs font-mono-data font-semibold flex items-center gap-1 shadow-xs cursor-pointer"
                                  title="Download statutory certificate"
                                >
                                  <Download className="w-3 h-3" />
                                  <span>Certificate</span>
                                </button>
                              ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
                                <Link
                                  to="/apply"
                                  className="px-2.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-white rounded-[2px] text-xs font-mono-data font-semibold flex items-center gap-1 shadow-xs"
                                >
                                  <span>Apply Now</span>
                                  <ArrowRight className="w-3 h-3" />
                                </Link>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setActiveApprovalForDrawer(item)}
                                  className="px-2.5 py-1.5 bg-[#FAF8F2] border border-[#262522] hover:bg-white text-[#171717] rounded-[2px] text-xs font-mono-data font-medium cursor-pointer"
                                >
                                  Details
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden divide-y divide-[#E9E1D0]">
                {filteredApprovals.map((item) => {
                  const normStatus = item.status?.normalized;
                  return (
                    <div
                      key={item.id}
                      onClick={() => setActiveApprovalForDrawer(item)}
                      className="p-4 space-y-3 hover:bg-[#FAF8F2] transition-colors cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase font-bold block">
                            {item.category} • {item.monitoring?.source}
                          </span>
                          <h3 className="font-sans font-bold text-sm text-[#171717]">
                            {item.name}
                          </h3>
                          <span className="text-xs text-[#6E6A61] block mt-0.5">
                            {item.authority?.name}
                          </span>
                        </div>

                        <div>
                          {normStatus === NORMALIZED_STATUS.APPROVED ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                              APPROVED
                            </span>
                          ) : normStatus === NORMALIZED_STATUS.ACTION_REQUIRED ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#B85C4A]/15 text-[#B85C4A] border border-[#B85C4A]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                              ACTION REQUIRED
                            </span>
                          ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#8B8982]/15 text-[#6E6A61] border border-[#8B8982]/30 rounded-[2px] font-mono-data text-[10px] font-bold">
                              NOT YET
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#C08A3E]/15 text-[#8F611E] border border-[#C08A3E]/40 rounded-[2px] font-mono-data text-[10px] font-bold">
                              UNDER PROCESS
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="p-2.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] text-xs font-sans space-y-1">
                        <div className="flex items-center justify-between font-mono-data text-[11px]">
                          <span className="text-[#6E6A61]">Application Ref:</span>
                          <span className="font-bold text-[#18324A]">
                            {item.application?.applicationId || 'Not submitted'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-[#6E6A61]">Govt Status:</span>
                          <span className="font-bold text-[#171717] truncate max-w-[180px]">
                            {item.status?.sourceStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1 text-xs font-mono-data" onClick={(e) => e.stopPropagation()}>
                        <span className="text-[#6E6A61]">
                          Updated: {item.application?.submissionDate || 'Recently'}
                        </span>

                        <div className="flex items-center gap-2">
                          {normStatus === NORMALIZED_STATUS.APPROVED && item.certificate?.available ? (
                            <button
                              type="button"
                              onClick={() => setActiveApprovalForCert(item)}
                              className="px-2.5 py-1 bg-[#18324A] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>Certificate</span>
                            </button>
                          ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
                            <Link
                              to="/apply"
                              className="px-2.5 py-1 bg-[#18324A] text-white rounded-[2px] text-xs font-semibold flex items-center gap-1"
                            >
                              <span>Apply Now →</span>
                            </Link>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setActiveApprovalForDrawer(item)}
                              className="px-2.5 py-1 bg-white border border-[#262522] rounded-[2px] text-xs font-medium"
                            >
                              Details
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* Legal Notice Footer */}
        <div className="p-4 bg-[#E9E1D0]/70 border border-[#262522] rounded-[4px] flex items-start gap-3 text-xs font-sans text-[#30302D]">
          <Info className="w-4 h-4 text-[#18324A] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase tracking-wider block">
              STATUTORY SOURCE OF TRUTH NOTICE
            </span>
            <p className="leading-relaxed">
              Approval decisions, inspection reports, and statutory certificates originate exclusively from the respective competent government authorities and single window portals (NSWS, GO-SWIFT, OCMMS). Sneha AI normalizes status feeds and provides automated compliance intelligence without fabricating official decisions.
            </p>
          </div>
        </div>
      </div>

      {/* DETAIL DRAWER */}
      {activeApprovalForDrawer && (
        <ApprovalDetailDrawer
          approval={activeApprovalForDrawer}
          onClose={() => setActiveApprovalForDrawer(null)}
        />
      )}

      {/* CERTIFICATE MODAL */}
      {activeApprovalForCert && (
        <CertificateModal
          approval={activeApprovalForCert}
          onClose={() => setActiveApprovalForCert(null)}
        />
      )}

      {/* TRACK APPLICATION MODAL */}
      {showTrackModal && (
        <TrackApplicationModal
          onClose={() => setShowTrackModal(false)}
          onTracked={() => reloadData()}
        />
      )}
    </DashboardShell>
  );
}
