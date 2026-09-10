import React, { useState, useMemo, useEffect } from 'react';
import {
  Plus,
  Download,
  Search,
  ChevronRight,
  FileCheck,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Link, useNavigate } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import BusinessContextStrip from '../components/dashboard/BusinessContextStrip';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { dashboardData, getLiveDashboardData } from '../data/dashboardData';
import { getApprovals } from '../data/approvalsStorage';
import {
  getApplications,
  fetchApplicationsFromSupabase,
  calculateApplicationMetrics,
  deriveNextAction,
  calculateSLAStatus,
  exportApplicationsCSV,
  APPLICATION_STATUSES,
  SORT_OPTIONS,
} from '../data/applicationsStorage';

export default function ApplicationsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(() => getLiveDashboardData(user));

  // Applications & Approvals state
  const [applications, setApplications] = useState(() => getApplications());
  const [approvalsList, setApprovalsList] = useState(() => getApprovals());

  // Search & Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedApproval, setSelectedApproval] = useState('All');
  const [selectedAuthority, setSelectedAuthority] = useState('All');
  const [selectedDateFilter, setSelectedDateFilter] = useState('All');
  const [selectedActionFilter, setSelectedActionFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Recently Updated');

  // Load cloud applications from Supabase
  useEffect(() => {
    async function loadCloudApplications() {
      const fetched = await fetchApplicationsFromSupabase(user?.id);
      if (Array.isArray(fetched) && fetched.length > 0) {
        setApplications(fetched);
      }
    }
    loadCloudApplications();
  }, [user?.id]);

  // Storage listener to sync across tabs and mode changes
  useEffect(() => {
    const handleStorage = () => {
      setLiveData(getLiveDashboardData(user));
      setApplications(getApplications());
      setApprovalsList(getApprovals());
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('appModeChanged', handleStorage);
    window.addEventListener('userBusinessProfileUpdated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('appModeChanged', handleStorage);
      window.removeEventListener('userBusinessProfileUpdated', handleStorage);
    };
  }, [user]);

  // Map approval ID to Approval Name for quick lookup
  const approvalsLookup = useMemo(() => {
    const map = {};
    approvalsList.forEach((a) => {
      map[a.id] = a.name;
    });
    return map;
  }, [approvalsList]);

  // Unique authorities list derived from applications
  const authoritiesList = useMemo(() => {
    const set = new Set();
    applications.forEach((app) => {
      const name = app.authority?.name?.trim();
      if (name) set.add(name);
    });
    return Array.from(set).sort();
  }, [applications]);

  // Calculated metrics
  const metrics = useMemo(() => {
    return calculateApplicationMetrics(applications);
  }, [applications]);

  // Filter and sort applications
  const filteredApplications = useMemo(() => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    return applications
      .filter((app) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchId = (app.id || '').toLowerCase().includes(q);
          const matchTitle = (app.title || '').toLowerCase().includes(q);
          const matchApproval = (approvalsLookup[app.approvalId] || app.approvalId || '').toLowerCase().includes(q);
          const matchAuth = (app.authority?.name || '').toLowerCase().includes(q);
          const matchDept = (app.authority?.department || '').toLowerCase().includes(q);
          const matchStage = (app.currentStage || '').toLowerCase().includes(q);
          const matchStatus = (app.status || '').toLowerCase().includes(q);
          const matchNotes = (app.notes || '').toLowerCase().includes(q);
          if (
            !matchId &&
            !matchTitle &&
            !matchApproval &&
            !matchAuth &&
            !matchDept &&
            !matchStage &&
            !matchStatus &&
            !matchNotes
          ) {
            return false;
          }
        }

        // Status filter
        if (selectedStatus !== 'All' && app.status !== selectedStatus) {
          return false;
        }

        // Approval filter
        if (selectedApproval !== 'All' && app.approvalId !== selectedApproval) {
          return false;
        }

        // Authority filter
        if (selectedAuthority !== 'All' && app.authority?.name !== selectedAuthority) {
          return false;
        }

        // Date submitted filter
        if (selectedDateFilter !== 'All') {
          if (!app.submission?.submittedAt) return false;
          const subDate = new Date(app.submission.submittedAt);
          if (selectedDateFilter === 'Submitted this week' && subDate < oneWeekAgo) return false;
          if (selectedDateFilter === 'Submitted this month' && subDate < oneMonthAgo) return false;
          if (selectedDateFilter === 'Submitted in last 90 days' && subDate < ninetyDaysAgo) return false;
        }

        // Action required filter
        if (selectedActionFilter !== 'All') {
          const isAction =
            app.status === 'QUERY_RAISED' ||
            (app.status === 'DRAFT' && app.readiness?.missingDocuments > 0);
          if (selectedActionFilter === 'Action Required' && !isAction) return false;
          if (selectedActionFilter === 'No Action Required' && isAction) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'Recently Updated') {
          return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
        }
        if (sortBy === 'Submitted Date (Newest)') {
          const dateA = a.submission?.submittedAt ? new Date(a.submission.submittedAt) : 0;
          const dateB = b.submission?.submittedAt ? new Date(b.submission.submittedAt) : 0;
          return dateB - dateA;
        }
        if (sortBy === 'Submitted Date (Oldest)') {
          const dateA = a.submission?.submittedAt ? new Date(a.submission.submittedAt) : 0;
          const dateB = b.submission?.submittedAt ? new Date(b.submission.submittedAt) : 0;
          return dateA - dateB;
        }
        if (sortBy === 'Deadline (Earliest)') {
          if (!a.sla?.deadline) return 1;
          if (!b.sla?.deadline) return -1;
          return new Date(a.sla.deadline) - new Date(b.sla.deadline);
        }
        if (sortBy === 'Application ID') {
          return (a.id || '').localeCompare(b.id || '');
        }
        if (sortBy === 'Status') {
          return (a.status || '').localeCompare(b.status || '');
        }
        return 0;
      });
  }, [
    applications,
    searchQuery,
    selectedStatus,
    selectedApproval,
    selectedAuthority,
    selectedDateFilter,
    selectedActionFilter,
    sortBy,
    approvalsLookup,
  ]);

  // Seed sample records
  const handleSeedSamples = () => {
    const seeded = seedSampleApplications();
    setApplications(seeded);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setSelectedApproval('All');
    setSelectedAuthority('All');
    setSelectedDateFilter('All');
    setSelectedActionFilter('All');
    setSortBy('Recently Updated');
  };

  // Export CSV
  const handleExportCSV = () => {
    exportApplicationsCSV(filteredApplications, approvalsLookup);
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedStatus !== 'All' ||
    selectedApproval !== 'All' ||
    selectedAuthority !== 'All' ||
    selectedDateFilter !== 'All' ||
    selectedActionFilter !== 'All';

  return (
    <DashboardShell>
      <div className="space-y-6 pb-12">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#18324A]" />
              <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
                APPLICATION MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
              APPLICATIONS
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
              Track your approval applications from preparation to final decision.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            {applications.length > 0 && (
              <Button
                variant="outline"
                size="md"
                icon={Download}
                onClick={handleExportCSV}
              >
                Export
              </Button>
            )}
            <Link to="/applications/new">
              <Button variant="primary" size="md" icon={Plus}>
                + New Application
              </Button>
            </Link>
          </div>
        </div>

        {/* BUSINESS CONTEXT STRIP */}
        <BusinessContextStrip business={liveData.business} />

        {/* APPLICATION METRICS STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Total */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#6E6A61] uppercase block mb-1">
              TOTAL
            </span>
            <span className="font-sans font-bold text-2xl text-[#171717] block">
              {metrics.total}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              All applications
            </span>
          </div>

          {/* Drafts */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#8B8982] uppercase block mb-1">
              DRAFTS
            </span>
            <span className="font-sans font-bold text-2xl text-[#8B8982] block">
              {metrics.drafts}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Being prepared
            </span>
          </div>

          {/* Under Review */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#C08A3E] uppercase block mb-1">
              UNDER REVIEW
            </span>
            <span className="font-sans font-bold text-2xl text-[#C08A3E] block">
              {metrics.underReview}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Authority scrutiny
            </span>
          </div>

          {/* Action Required */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#B85C4A] uppercase block mb-1">
              ACTION REQUIRED
            </span>
            <span className="font-sans font-bold text-2xl text-[#B85C4A] block">
              {metrics.actionRequired}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Queries & blockers
            </span>
          </div>

          {/* Inspection Pending */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#C08A3E] uppercase block mb-1">
              INSPECTION PENDING
            </span>
            <span className="font-sans font-bold text-2xl text-[#C08A3E] block">
              {metrics.inspectionPending}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Site visits slated
            </span>
          </div>

          {/* Approved */}
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
            <span className="meta-label text-[10px] text-[#5D8068] uppercase block mb-1">
              APPROVED
            </span>
            <span className="font-sans font-bold text-2xl text-[#5D8068] block">
              {metrics.approved}
            </span>
            <span className="text-[10px] font-mono-data text-[#6E6A61] mt-0.5 block">
              Clearance granted
            </span>
          </div>
        </div>

        {/* ZERO DATA EMPTY STATE */}
        {applications.length === 0 ? (
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-16 text-center shadow-[0_8px_24px_rgba(23,23,23,0.04)] my-6">
            <div className="w-14 h-14 rounded-[4px] bg-[#E9E1D0] border border-[#262522] flex items-center justify-center mx-auto mb-5 text-[#18324A]">
              <FileCheck className="w-7 h-7" />
            </div>

            <span className="font-mono-data text-xs text-[#6E6A61] uppercase tracking-wider block mb-1">
              REGISTRY EMPTY
            </span>

            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight uppercase mb-2">
              No applications yet
            </h2>

            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans max-w-md mx-auto leading-relaxed mb-6">
              Start an application from one of your required approvals to initiate formal departmental filings.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link to="/applications/new">
                <Button variant="primary" size="md" icon={Plus}>
                  + New Application
                </Button>
              </Link>
              <Button
                variant="outline"
                size="md"
                icon={Sparkles}
                onClick={handleSeedSamples}
              >
                Load Sample Applications
              </Button>
            </div>
          </div>
        ) : (
          /* SEARCH, FILTERS & MAIN LIST */
          <div className="space-y-4">
            {/* Search and Filters Bar */}
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
              {/* Search input */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search applications by ID, approval name, authority, status, or notes..."
                  className="w-full h-11 pl-10 pr-4 bg-[#FFFFFF] border border-[#D6D0C3] focus:border-[#18324A] rounded-[3px] text-xs font-mono-data text-[#171717] placeholder:text-[#8B8982] focus:outline-none transition-colors"
                />
                <Search className="w-4 h-4 text-[#6E6A61] absolute left-3.5 top-1/2 -translate-y-1/2" />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-mono-data text-[#6E6A61] hover:text-[#171717]"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* Filters row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1 text-xs font-mono-data">
                {/* Status Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    STATUS
                  </label>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Statuses</option>
                    {APPLICATION_STATUSES.map((st) => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Approval Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    APPROVAL
                  </label>
                  <select
                    value={selectedApproval}
                    onChange={(e) => setSelectedApproval(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Approvals</option>
                    {approvalsList.map((appr) => (
                      <option key={appr.id} value={appr.id}>
                        {appr.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Authority Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    AUTHORITY
                  </label>
                  <select
                    value={selectedAuthority}
                    onChange={(e) => setSelectedAuthority(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Authorities</option>
                    {authoritiesList.map((auth) => (
                      <option key={auth} value={auth}>
                        {auth}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date Submitted Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    DATE SUBMITTED
                  </label>
                  <select
                    value={selectedDateFilter}
                    onChange={(e) => setSelectedDateFilter(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Time</option>
                    <option value="Submitted this week">This Week</option>
                    <option value="Submitted this month">This Month</option>
                    <option value="Submitted in last 90 days">Last 90 Days</option>
                  </select>
                </div>

                {/* Action Required Filter */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    ACTION STATUS
                  </label>
                  <select
                    value={selectedActionFilter}
                    onChange={(e) => setSelectedActionFilter(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    <option value="All">All Records</option>
                    <option value="Action Required">Action Required</option>
                    <option value="No Action Required">No Action Required</option>
                  </select>
                </div>

                {/* Sorting */}
                <div>
                  <label className="block text-[10px] uppercase font-semibold text-[#6E6A61] mb-1">
                    SORT BY
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-xs text-[#171717] focus:outline-none focus:border-[#18324A]"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status strip */}
              <div className="flex items-center justify-between pt-2 border-t border-[#D6D0C3] text-[11px] font-mono-data text-[#6E6A61]">
                <span>
                  Showing {filteredApplications.length} of {applications.length} applications
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="text-[#18324A] font-bold hover:underline flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset filters
                  </button>
                )}
              </div>
            </div>

            {/* Filter Empty State */}
            {filteredApplications.length === 0 ? (
              <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
                <span className="font-mono-data text-xs text-[#B85C4A] font-bold block mb-1">
                  NO MATCHES FOUND
                </span>
                <h3 className="text-lg font-bold text-[#171717] uppercase mb-1">
                  No applications found
                </h3>
                <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mb-4">
                  Try a different search term or clear your active filters.
                </p>
                <Button variant="outline" size="sm" onClick={handleResetFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                {/* Desktop Table View (md and up) */}
                <div className="hidden md:block bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_4px_16px_rgba(23,23,23,0.03)] overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#262522] bg-[#E9E1D0]/60 text-[#6E6A61] font-mono-data text-[10px] uppercase tracking-wider">
                        <th className="py-3 px-4 font-bold">APPLICATION</th>
                        <th className="py-3 px-4 font-bold">APPROVAL</th>
                        <th className="py-3 px-4 font-bold">AUTHORITY</th>
                        <th className="py-3 px-4 font-bold">STATUS</th>
                        <th className="py-3 px-4 font-bold">SUBMITTED</th>
                        <th className="py-3 px-4 font-bold">SLA / DEADLINE</th>
                        <th className="py-3 px-4 font-bold">NEXT ACTION</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D6D0C3] font-mono-data text-xs">
                      {filteredApplications.map((app) => {
                        const nextAction = deriveNextAction(app);
                        const slaStatus = calculateSLAStatus(app);
                        const isQuery = app.status === 'QUERY_RAISED';

                        return (
                          <tr
                            key={app.id}
                            onClick={() => navigate(`/applications/${app.id}`)}
                            className={`hover:bg-[#E9E1D0]/70 transition-colors cursor-pointer group ${
                              isQuery ? 'bg-[rgba(184,92,74,0.03)]' : ''
                            }`}
                          >
                            {/* Application ID & Title */}
                            <td className="py-3.5 px-4">
                              <div className="flex flex-col">
                                <span className="font-mono-data font-bold text-xs text-[#18324A] group-hover:underline">
                                  {app.id}
                                </span>
                                <span className="font-sans font-semibold text-xs text-[#171717] mt-0.5 truncate max-w-[200px]">
                                  {app.title}
                                </span>
                              </div>
                            </td>

                            {/* Approval Name */}
                            <td className="py-3.5 px-4 font-sans font-bold text-xs text-[#171717]">
                              {approvalsLookup[app.approvalId] || app.approvalId || '—'}
                            </td>

                            {/* Authority */}
                            <td className="py-3.5 px-4 text-[#30302D]">
                              <div className="flex flex-col">
                                <span className="font-medium text-[#171717] truncate max-w-[180px]">
                                  {app.authority?.name || '—'}
                                </span>
                                <span className="text-[10px] text-[#6E6A61] truncate">
                                  {app.authority?.jurisdiction || app.authority?.state || ''}
                                </span>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <StatusBadge status={app.status} label={app.status} />
                            </td>

                            {/* Submitted Date */}
                            <td className="py-3.5 px-4 whitespace-nowrap text-[#30302D]">
                              {app.submission?.submittedAt
                                ? new Date(app.submission.submittedAt).toLocaleDateString()
                                : <span className="text-[#8B8982]">Draft</span>}
                            </td>

                            {/* SLA / Deadline */}
                            <td className="py-3.5 px-4 whitespace-nowrap">
                              <div className="flex flex-col">
                                <span className="font-semibold text-[#171717]">
                                  {app.sla?.deadline || '—'}
                                </span>
                                {slaStatus === 'AT_RISK' && (
                                  <span className="text-[10px] font-bold text-[#C08A3E]">
                                    At Risk
                                  </span>
                                )}
                                {slaStatus === 'BREACHED' && (
                                  <span className="text-[10px] font-bold text-[#B85C4A]">
                                    SLA Breached
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* Next Action */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`text-xs font-sans font-semibold truncate max-w-[160px] ${
                                    isQuery ? 'text-[#B85C4A]' : 'text-[#18324A]'
                                  }`}
                                >
                                  {nextAction}
                                </span>
                                <ArrowRight className="w-3.5 h-3.5 text-[#6E6A61] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Stacked Cards View (< md) */}
                <div className="md:hidden space-y-3">
                  {filteredApplications.map((app) => {
                    const nextAction = deriveNextAction(app);
                    const isQuery = app.status === 'QUERY_RAISED';

                    return (
                      <div
                        key={app.id}
                        onClick={() => navigate(`/applications/${app.id}`)}
                        className={`bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-[0_2px_8px_rgba(23,23,23,0.03)] space-y-3 cursor-pointer ${
                          isQuery ? 'border-l-4 border-l-[#B85C4A]' : ''
                        }`}
                      >
                        {/* Card Header */}
                        <div className="flex items-start justify-between gap-2 border-b border-[#D6D0C3] pb-2.5">
                          <div>
                            <span className="font-mono-data text-[10px] text-[#18324A] font-bold bg-[#E9E1D0] px-1 py-0.2 rounded border border-[#D6D0C3] block mb-1">
                              {app.id}
                            </span>
                            <h3 className="font-sans font-bold text-base text-[#171717] leading-tight">
                              {app.title}
                            </h3>
                            <p className="text-xs text-[#6E6A61] font-mono-data mt-0.5">
                              {approvalsLookup[app.approvalId] || app.approvalId} • {app.authority?.name}
                            </p>
                          </div>
                          <StatusBadge status={app.status} label={app.status} />
                        </div>

                        {/* Card Grid */}
                        <div className="grid grid-cols-2 gap-2 text-xs font-mono-data pt-1">
                          <div>
                            <span className="text-[10px] text-[#6E6A61] uppercase block">DEADLINE</span>
                            <span className="font-semibold text-[#171717]">
                              {app.sla?.deadline || '—'}
                            </span>
                          </div>

                          <div>
                            <span className="text-[10px] text-[#6E6A61] uppercase block">NEXT ACTION</span>
                            <span
                              className={`font-semibold text-[11px] truncate block ${
                                isQuery ? 'text-[#B85C4A]' : 'text-[#18324A]'
                              }`}
                            >
                              {nextAction}
                            </span>
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="pt-2 border-t border-[#D6D0C3] flex items-center justify-between text-xs font-mono-data text-[#18324A] font-bold">
                          <span>VIEW APPLICATION DOSSIER</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
