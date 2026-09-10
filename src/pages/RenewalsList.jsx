import React, { useState, useMemo, useEffect } from 'react';
import {
  RefreshCw,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText,
  Calendar,
  Building2,
  ExternalLink,
  ChevronRight,
  LayoutGrid,
  List,
  ArrowUpRight,
  ShieldAlert,
  Plus
} from 'lucide-react';
import { Link, useNavigate } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import MetricBlock from '../components/ui/MetricBlock';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import InitiateRenewalModal from '../components/renewals/InitiateRenewalModal';
import {
  getRenewals,
  getRenewalUrgency,
  calculateRenewalMetrics,
  RENEWALS_STORAGE_KEY
} from '../data/renewalsStorage';

export default function RenewalsList() {
  const navigate = useNavigate();
  const [renewals, setRenewals] = useState(() => getRenewals());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [sortBy, setSortBy] = useState('URGENCY');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Selected clearance for the 1-click renewal filing modal
  const [activeRenewalForModal, setActiveRenewalForModal] = useState(null);

  // Sync when storage or app mode changes
  useEffect(() => {
    const handleStorage = () => setRenewals(getRenewals());
    window.addEventListener('storage', handleStorage);
    window.addEventListener('appModeChanged', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('appModeChanged', handleStorage);
    };
  }, []);

  const refreshList = () => {
    setRenewals(getRenewals());
  };

  // Metrics
  const metrics = useMemo(() => {
    return calculateRenewalMetrics(renewals);
  }, [renewals]);

  // Unique departments for filter dropdown
  const departmentsList = useMemo(() => {
    const set = new Set();
    renewals.forEach((r) => {
      if (r.department) set.add(r.department.trim());
    });
    return Array.from(set).sort();
  }, [renewals]);

  // Critical item for the top banner alert (first critical or overdue clearance)
  const criticalClearance = useMemo(() => {
    return renewals.find((r) => {
      const urgency = getRenewalUrgency(r);
      return (urgency.isCritical || urgency.isExpired) && r.status !== 'IN_PROGRESS';
    }) || null;
  }, [renewals]);

  // Filtered and sorted renewals
  const filteredRenewals = useMemo(() => {
    return renewals
      .filter((item) => {
        const urgency = getRenewalUrgency(item);

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = item.clearanceName?.toLowerCase().includes(q);
          const matchLic = item.licenseNumber?.toLowerCase().includes(q);
          const matchDept = item.department?.toLowerCase().includes(q);
          const matchCat = item.category?.toLowerCase().includes(q);
          const matchAct = item.governingAct?.toLowerCase().includes(q);
          if (!matchName && !matchLic && !matchDept && !matchCat && !matchAct) {
            return false;
          }
        }

        // Department filter
        if (selectedDepartment !== 'All' && item.department !== selectedDepartment) {
          return false;
        }

        // Status Tabs filter
        if (selectedStatusTab === 'DUE_SOON') {
          return urgency.isDueSoon && item.status !== 'IN_PROGRESS';
        }
        if (selectedStatusTab === 'CRITICAL') {
          return urgency.isCritical && item.status !== 'IN_PROGRESS';
        }
        if (selectedStatusTab === 'IN_PROGRESS') {
          return item.status === 'IN_PROGRESS' || urgency.urgency === 'IN_PROGRESS';
        }
        if (selectedStatusTab === 'ACTIVE') {
          return urgency.urgency === 'ACTIVE';
        }
        if (selectedStatusTab === 'EXPIRED') {
          return urgency.isExpired && item.status !== 'RENEWED';
        }

        return true;
      })
      .sort((a, b) => {
        const uA = getRenewalUrgency(a);
        const uB = getRenewalUrgency(b);

        if (sortBy === 'URGENCY') {
          // Critical and expired first, then ascending days remaining
          return uA.daysRemaining - uB.daysRemaining;
        }
        if (sortBy === 'EXPIRY_ASC') {
          return new Date(a.expiryDate) - new Date(b.expiryDate);
        }
        if (sortBy === 'EXPIRY_DESC') {
          return new Date(b.expiryDate) - new Date(a.expiryDate);
        }
        if (sortBy === 'NAME') {
          return a.clearanceName.localeCompare(b.clearanceName);
        }
        if (sortBy === 'FEE') {
          return (b.renewalFee || 0) - (a.renewalFee || 0);
        }
        return 0;
      });
  }, [renewals, searchQuery, selectedStatusTab, selectedDepartment, sortBy]);

  return (
    <DashboardShell>
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#18324A]" />
            <span className="font-mono-data text-xs text-[#18324A] font-bold uppercase tracking-wider">
              STATUTORY VALIDITY & COMPLIANCE LIFECYCLE
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            CLEARANCE RENEWALS
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Automated countdown tracking, statutory window alerts, and 1-click renewal filing for industrial licenses.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <Link to="/approvals/new">
            <Button variant="primary" size="md" icon={Plus}>
              ADD CLEARANCE
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Top Urgent Warning Banner (If any clearance is within 15 days or overdue) */}
      {criticalClearance && (
        <div className="bg-[#FAF8F2] border-2 border-[#B85C4A] rounded-[4px] p-4 shadow-[0_4px_12px_rgba(184,92,74,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#B85C4A] text-white flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono-data text-[10px] uppercase font-bold text-[#B85C4A] tracking-wider">
                  STATUTORY EXPIRY NOTICE
                </span>
                <span className="font-mono-data text-xs font-semibold px-2 py-0.5 rounded bg-[#B85C4A]/15 text-[#B85C4A]">
                  {getRenewalUrgency(criticalClearance).label}
                </span>
              </div>
              <h4 className="text-sm font-bold text-[#171717] uppercase tracking-tight mt-0.5">
                {criticalClearance.clearanceName} ({criticalClearance.licenseNumber})
              </h4>
              <p className="text-xs text-[#6E6A61] mt-0.5 font-sans">
                {criticalClearance.penalConsequence || 'Immediate renewal filing mandatory to avoid penal inspection and closure.'}
              </p>
            </div>
          </div>

          <Button
            variant="danger"
            size="sm"
            icon={ArrowUpRight}
            onClick={() => setActiveRenewalForModal(criticalClearance)}
            className="shrink-0 self-start sm:self-auto"
          >
            RENEW CLEARANCE NOW
          </Button>
        </div>
      )}

      {/* 3. KPI Metrics Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricBlock
          value={metrics.total}
          label="Tracked Clearances"
          subtext="Industrial Licenses"
          variant="white"
        />
        <MetricBlock
          value={metrics.renewalDue}
          label="Renewal Window Open"
          subtext="Within 60-Day SLA"
          variant="default"
        />
        <MetricBlock
          value={metrics.critical}
          label="Critical Notices"
          subtext="Expires < 15 Days"
          variant="subtle"
        />
        <MetricBlock
          value={metrics.inProgress}
          label="Filing In Progress"
          subtext="Under Department Review"
          variant="navy"
        />
        <MetricBlock
          value={metrics.expired}
          label="Overdue / Expired"
          subtext="Requires Immediate Action"
          variant="default"
        />
      </div>

      {/* 4. Controls & Filter Bar */}
      <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clearances by name, license number, issuing department, or governing act..."
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

        {/* Filter Pills, Department Select, Sort, and View Toggle */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
          {/* Status Tab Pills */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-data">
            {[
              { id: 'ALL', label: `ALL (${metrics.total})` },
              { id: 'DUE_SOON', label: `DUE SOON (${metrics.renewalDue})` },
              { id: 'IN_PROGRESS', label: `IN PROGRESS (${metrics.inProgress})` },
              { id: 'ACTIVE', label: `ACTIVE (${metrics.active})` },
              { id: 'EXPIRED', label: `EXPIRED (${metrics.expired})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatusTab(tab.id)}
                className={`px-2.5 py-1.5 rounded-[3px] font-semibold transition-all ${
                  selectedStatusTab === tab.id
                    ? 'bg-[#18324A] text-[#FAF8F2] shadow-xs'
                    : 'bg-[#FFFFFF] border border-[#D6D0C3] text-[#6E6A61] hover:text-[#171717]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-data">
            {/* Department Filter */}
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-[#171717] focus:outline-none focus:border-[#18324A]"
            >
              <option value="All">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-[#171717] focus:outline-none focus:border-[#18324A]"
            >
              <option value="URGENCY">Sort: Urgency (Fewest Days Left)</option>
              <option value="EXPIRY_ASC">Sort: Expiry (Earliest First)</option>
              <option value="EXPIRY_DESC">Sort: Expiry (Latest First)</option>
              <option value="NAME">Sort: Clearance Name</option>
              <option value="FEE">Sort: Statutory Fee</option>
            </select>

            {/* View Toggle */}
            <div className="flex items-center border border-[#D6D0C3] rounded-[3px] overflow-hidden bg-[#FFFFFF]">
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-2 transition-colors ${
                  viewMode === 'GRID' ? 'bg-[#18324A] text-white' : 'text-[#6E6A61] hover:text-[#171717]'
                }`}
                title="Card Grid View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                className={`p-2 transition-colors ${
                  viewMode === 'TABLE' ? 'bg-[#18324A] text-white' : 'text-[#6E6A61] hover:text-[#171717]'
                }`}
                title="Data Table View"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Clearance List / Cards Grid */}
      {filteredRenewals.length === 0 ? (
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-14 text-center my-6">
          <Clock className="w-10 h-10 text-[#6E6A61] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#171717] uppercase tracking-tight">
            NO CLEARANCES MATCH YOUR FILTER
          </h3>
          <p className="text-xs text-[#6E6A61] mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or filter tabs to inspect other clearances.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedStatusTab('ALL');
              setSelectedDepartment('All');
            }}
            className="mt-4 px-3 py-1.5 bg-[#FFFFFF] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-[#E9E1D0]"
          >
            RESET ALL FILTERS
          </button>
        </div>
      ) : viewMode === 'GRID' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRenewals.map((renewal) => {
            const urgency = getRenewalUrgency(renewal);
            const isCritical = urgency.isCritical || urgency.isExpired;
            const isInProgress = renewal.status === 'IN_PROGRESS';

            return (
              <div
                key={renewal.id}
                className={`bg-[#FFFFFF] border rounded-[4px] p-4 sm:p-5 flex flex-col justify-between transition-all hover:shadow-[0_6px_16px_rgba(23,23,23,0.06)] ${
                  isCritical
                    ? 'border-[#B85C4A]/70 bg-[#FFFFFF]'
                    : isInProgress
                    ? 'border-[#18324A] bg-[#FFFFFF]'
                    : 'border-[#262522]'
                }`}
              >
                {/* Top Row: Clearance Category, Name, Urgency Badge */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider">
                      {renewal.category}
                    </span>
                    <StatusBadge status={urgency.urgency} label={urgency.label} />
                  </div>

                  <Link
                    to={`/renewals/${renewal.id}`}
                    className="group flex items-start justify-between gap-2"
                  >
                    <h3 className="text-base font-bold text-[#171717] group-hover:text-[#18324A] tracking-tight transition-colors">
                      {renewal.clearanceName}
                    </h3>
                  </Link>

                  <p className="text-xs text-[#6E6A61] mt-1 flex items-center gap-1.5 font-sans">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{renewal.department}</span>
                  </p>

                  <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono-data text-xs text-[#171717]">
                    <div>
                      <span className="text-[10px] text-[#6E6A61] uppercase block">LICENSE REF</span>
                      <span className="font-bold text-[#18324A]">{renewal.licenseNumber}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E6A61] uppercase block">EXPIRY DATE</span>
                      <span className="font-bold">
                        {new Date(renewal.expiryDate).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E6A61] uppercase block">RENEWAL DEMAND</span>
                      <span className="font-bold">₹{renewal.renewalFee?.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Validity Countdown Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-[#D6D0C3]">
                    <div className="flex items-center justify-between text-[11px] font-mono-data mb-1">
                      <span className="text-[#6E6A61]">STATUTORY VALIDITY TIMELINE</span>
                      <span
                        className="font-bold"
                        style={{ color: urgency.color }}
                      >
                        {urgency.daysRemaining >= 0
                          ? `${urgency.daysRemaining} DAYS REMAINING`
                          : `${Math.abs(urgency.daysRemaining)} DAYS OVERDUE`}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#E9E1D0] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, Math.max(5, urgency.progressPercent))}%`,
                          backgroundColor: urgency.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[9px] font-mono-data text-[#8B8982] mt-1">
                      <span>ISSUED: {renewal.issueDate}</span>
                      <span>WINDOW: {renewal.windowDays || 60}D</span>
                      <span>EXP: {renewal.expiryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions Row */}
                <div className="mt-5 pt-3 border-t border-[#D6D0C3] flex items-center justify-between gap-2">
                  <Link
                    to={`/renewals/${renewal.id}`}
                    className="text-xs font-mono-data text-[#6E6A61] hover:text-[#18324A] font-semibold inline-flex items-center gap-1"
                  >
                    <span>AUDIT HISTORY</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>

                  {isInProgress ? (
                    <Link to={`/applications/${renewal.linkedApplicationId || ''}`}>
                      <Button variant="secondary" size="sm" icon={ExternalLink}>
                        TRACK APPLICATION
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      variant={isCritical ? 'danger' : 'primary'}
                      size="sm"
                      icon={RefreshCw}
                      onClick={() => setActiveRenewalForModal(renewal)}
                    >
                      INITIATE RENEWAL
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] overflow-hidden shadow-[0_2px_8px_rgba(23,23,23,0.02)]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono-data">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#262522] text-[#6E6A61] uppercase text-[10px]">
                  <th className="py-3 px-4">Clearance & License Ref</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Expiry Date</th>
                  <th className="py-3 px-4">Validity Clock</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Fee</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D0C3]">
                {filteredRenewals.map((renewal) => {
                  const urgency = getRenewalUrgency(renewal);
                  const isInProgress = renewal.status === 'IN_PROGRESS';

                  return (
                    <tr key={renewal.id} className="hover:bg-[#FAF8F2] transition-colors">
                      <td className="py-3 px-4">
                        <Link
                          to={`/renewals/${renewal.id}`}
                          className="font-bold text-[#171717] hover:text-[#18324A] block"
                        >
                          {renewal.clearanceName}
                        </Link>
                        <span className="text-[11px] text-[#6E6A61]">{renewal.licenseNumber}</span>
                      </td>
                      <td className="py-3 px-4 text-[#171717] font-sans max-w-[180px] truncate">
                        {renewal.department}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#171717]">
                        {renewal.expiryDate}
                      </td>
                      <td className="py-3 px-4 min-w-[140px]">
                        <div className="flex items-center justify-between text-[10px] mb-0.5">
                          <span style={{ color: urgency.color }} className="font-bold">
                            {urgency.daysRemaining >= 0
                              ? `${urgency.daysRemaining}d left`
                              : `${Math.abs(urgency.daysRemaining)}d overdue`}
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#E9E1D0] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(5, urgency.progressPercent))}%`,
                              backgroundColor: urgency.color,
                            }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={urgency.urgency} label={urgency.label} />
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#171717]">
                        ₹{renewal.renewalFee?.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isInProgress ? (
                          <Link to={`/applications/${renewal.linkedApplicationId || ''}`}>
                            <button className="px-2.5 py-1 text-[11px] font-semibold bg-[#FFFFFF] border border-[#18324A] text-[#18324A] rounded-[3px] hover:bg-[#18324A] hover:text-white transition-colors">
                              TRACK
                            </button>
                          </Link>
                        ) : (
                          <button
                            onClick={() => setActiveRenewalForModal(renewal)}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-[#18324A] text-[#FAF8F2] rounded-[3px] hover:bg-[#18324A]/90 transition-colors"
                          >
                            RENEW
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. Multi-Step Renewal Initiation Modal */}
      <InitiateRenewalModal
        isOpen={!!activeRenewalForModal}
        renewal={activeRenewalForModal}
        onClose={() => setActiveRenewalForModal(null)}
        onSuccess={() => {
          refreshList();
        }}
      />
    </DashboardShell>
  );
}
