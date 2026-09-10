import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Coins,
  ExternalLink,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Link } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import MetricBlock from '../components/ui/MetricBlock';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import ClaimIncentiveModal from '../components/incentives/ClaimIncentiveModal';
import FiscalTaxValuationDossier from '../components/incentives/FiscalTaxValuationDossier';
import {
  getIncentives,
  calculateIncentiveMetrics,
  INCENTIVE_CATEGORIES,
} from '../data/incentivesStorage';
import { useAuth } from '../context/AuthContext';
import { getUserBusinessProfile, isDemoMode } from '../data/appModeState';
import {
  getFiscalAssessment,
  parseInvestmentAmount,
  formatCurrencyInr,
} from '../data/fiscalIncentivesEngine';

export default function IncentivesList() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(() => getUserBusinessProfile(user));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatusTab, setSelectedStatusTab] = useState('ALL');
  const [activeSchemeForClaim, setActiveSchemeForClaim] = useState(null);
  const [revision, setRevision] = useState(0);

  // Sync profile when mode or user business profile updates
  useEffect(() => {
    const handleSync = () => {
      setProfile(getUserBusinessProfile(user));
      setRevision((prev) => prev + 1);
    };
    window.addEventListener('userBusinessProfileUpdated', handleSync);
    window.addEventListener('appModeChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('userBusinessProfileUpdated', handleSync);
      window.removeEventListener('appModeChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [user]);

  // Determine registered investment amount
  const registeredRaw =
    profile?.projectValue ||
    profile?.investmentRange ||
    profile?.investment ||
    (isDemoMode() ? '₹10 Cr' : '₹5 Cr');

  const registeredNumeric = useMemo(
    () => parseInvestmentAmount(registeredRaw, 100000000),
    [registeredRaw]
  );

  // Real-time What-If Outlay Simulation State
  const [simulatedAmount, setSimulatedAmount] = useState(null);
  const activeInvestment = simulatedAmount !== null ? simulatedAmount : registeredNumeric;
  const isSimulating = simulatedAmount !== null && simulatedAmount !== registeredNumeric;

  // Complete Statutory Fiscal Assessment (Valuation, GST, Corporate Tax, Subsidies)
  const fiscalAssessment = useMemo(() => {
    return getFiscalAssessment(activeInvestment, profile);
  }, [activeInvestment, profile, revision]);

  const activeIncentives = fiscalAssessment.subsidies.schemes;

  // Dynamic KPI Metrics derived from active investment
  const metrics = useMemo(() => {
    return calculateIncentiveMetrics(activeIncentives);
  }, [activeIncentives]);

  const filteredIncentives = useMemo(() => {
    return activeIncentives.filter((item) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = item.schemeName.toLowerCase().includes(q);
        const matchAuth = item.authority.toLowerCase().includes(q);
        const matchPol = item.policyReference.toLowerCase().includes(q);
        const matchDesc = item.description.toLowerCase().includes(q);
        if (!matchName && !matchAuth && !matchPol && !matchDesc) return false;
      }

      // Category
      if (selectedCategory !== 'All' && item.category !== selectedCategory) {
        return false;
      }

      // Status tab
      if (selectedStatusTab === 'ELIGIBLE' && item.status !== 'ELIGIBLE') return false;
      if (selectedStatusTab === 'CLAIMED' && item.status !== 'CLAIMED') return false;
      if (selectedStatusTab === 'DISBURSED' && item.status !== 'DISBURSED') return false;

      return true;
    });
  }, [activeIncentives, searchQuery, selectedCategory, selectedStatusTab]);

  return (
    <DashboardShell>
      {/* 1. Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#5D8068]" />
            <span className="font-mono-data text-xs text-[#5D8068] font-bold uppercase tracking-wider">
              ODISHA INDUSTRIAL POLICY RESOLUTION (IPR 2022)
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight uppercase">
            INDUSTRIAL INCENTIVES & SUBSIDIES
          </h1>
          <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5">
            Investment-linked eligibility matching, statutory GST & corporate tax relief, and one-click incentive claim filing.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/applications">
            <Button variant="secondary" size="md" icon={ExternalLink}>
              TRACK CLAIMS
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. Fiscal, Tax & Valuation Assessment Dossier */}
      <FiscalTaxValuationDossier
        assessment={fiscalAssessment}
        registeredAmount={registeredNumeric}
        simulatedAmount={activeInvestment}
        onSimulateAmount={setSimulatedAmount}
        onResetSimulation={() => setSimulatedAmount(null)}
        isSimulating={isSimulating}
        businessName={profile?.name || profile?.businessName || user?.businessName}
      />

      {/* 3. KPI Metrics Bar (Dynamically Computed from Investment) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricBlock
          value={formatCurrencyInr(metrics.totalPotentialBenefit)}
          label="Potential Subsidy Pool"
          subtext="Total Eligible Entitlement"
          variant="navy"
        />
        <MetricBlock
          value={metrics.eligibleCount}
          label="Eligible to Claim"
          subtext="Ready for Filing"
          variant="white"
        />
        <MetricBlock
          value={metrics.claimedCount}
          label="Claims Under Review"
          subtext="DIC / IPICOL Scrutiny"
          variant="subtle"
        />
        <MetricBlock
          value={formatCurrencyInr(metrics.totalDisbursedBenefit)}
          label="Total Availed / Disbursed"
          subtext="Realized Fiscal Benefit"
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
            placeholder="Search subsidies by scheme name, authority, policy reference, or description..."
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

        {/* Filter Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono-data">
            {[
              { id: 'ALL', label: `ALL (${metrics.totalSchemes})` },
              { id: 'ELIGIBLE', label: `ELIGIBLE (${metrics.eligibleCount})` },
              { id: 'CLAIMED', label: `UNDER REVIEW (${metrics.claimedCount})` },
              { id: 'DISBURSED', label: `DISBURSED (${metrics.disbursedCount})` },
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

          {/* Category Dropdown */}
          <div className="text-xs font-mono-data">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-9 px-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px] text-[#171717] focus:outline-none focus:border-[#18324A]"
            >
              {INCENTIVE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All' ? 'All Incentive Categories' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 4. Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIncentives.map((scheme) => {
          const isEligible = scheme.status === 'ELIGIBLE';
          const isClaimed = scheme.status === 'CLAIMED';
          const isDisbursed = scheme.status === 'DISBURSED';

          return (
            <div
              key={scheme.id}
              className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 flex flex-col justify-between transition-all hover:shadow-[0_6px_16px_rgba(23,23,23,0.06)]"
            >
              <div>
                {/* Category & Status */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase tracking-wider bg-[#18324A]/10 px-2 py-0.5 rounded">
                    {scheme.category}
                  </span>
                  <StatusBadge
                    status={
                      isEligible
                        ? 'active'
                        : isClaimed
                        ? 'in_progress'
                        : isDisbursed
                        ? 'approved'
                        : 'draft'
                    }
                    label={
                      isEligible
                        ? 'Eligible to Claim'
                        : isClaimed
                        ? 'Claim Under Review'
                        : isDisbursed
                        ? 'Disbursed / Availed'
                        : 'Not Eligible'
                    }
                  />
                </div>

                <Link
                  to={`/incentives/${scheme.id}`}
                  className="group block"
                >
                  <h3 className="text-base font-bold text-[#171717] group-hover:text-[#18324A] tracking-tight transition-colors">
                    {scheme.schemeName}
                  </h3>
                </Link>

                <p className="text-xs text-[#6E6A61] mt-1 font-sans leading-relaxed line-clamp-2">
                  {scheme.description}
                </p>

                {/* Financial Entitlement Box */}
                <div className="mt-4 p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] font-mono-data text-xs space-y-1.5">
                  <div className="flex justify-between text-[#6E6A61]">
                    <span>SUBSIDY RATE:</span>
                    <span className="font-semibold text-[#171717]">{scheme.subsidyRate}</span>
                  </div>
                  <div className="flex justify-between text-[#6E6A61]">
                    <span>MAX SCHEME CAP:</span>
                    <span className="font-semibold text-[#171717]">
                      ₹{(scheme.maxBenefitCap / 100000).toFixed(0)} Lakh
                    </span>
                  </div>
                  <div className="border-t border-[#D6D0C3] pt-1.5 flex justify-between font-bold text-sm text-[#5D8068]">
                    <span>ESTIMATED BENEFIT:</span>
                    <span>
                      {scheme.estimatedEntitlement > 0
                        ? `₹${scheme.estimatedEntitlement?.toLocaleString('en-IN')}`
                        : '₹0 (Threshold Gap)'}
                    </span>
                  </div>
                  {scheme.formulaNote && (
                    <div className="mt-1.5 p-1.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded text-[11px] text-[#524E48] font-sans leading-tight">
                      <strong className="text-[#18324A] font-mono-data">Statutory Basis:</strong> {scheme.formulaNote}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between text-[11px] font-mono-data text-[#6E6A61]">
                  <span>SLA: {scheme.slaDays} Working Days</span>
                  <span>REF: {scheme.policyReference}</span>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="mt-5 pt-3 border-t border-[#D6D0C3] flex items-center justify-between gap-2">
                <Link
                  to={`/incentives/${scheme.id}`}
                  className="text-xs font-mono-data text-[#6E6A61] hover:text-[#18324A] font-semibold inline-flex items-center gap-1"
                >
                  <span>FULL GUIDELINES</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                {isClaimed ? (
                  <Link to={`/applications/${scheme.linkedApplicationId || ''}`}>
                    <Button variant="secondary" size="sm" icon={ExternalLink}>
                      TRACK CLAIM
                    </Button>
                  </Link>
                ) : isEligible ? (
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Coins}
                    onClick={() => setActiveSchemeForClaim(scheme)}
                  >
                    CLAIM BENEFIT NOW
                  </Button>
                ) : (
                  <Button variant="secondary" size="sm" disabled>
                    {scheme.thresholdGap > 0
                      ? `MIN. REQ: ${formatCurrencyInr(scheme.minInvestment)}`
                      : 'THRESHOLD NOT MET'}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Claim Modal */}
      <ClaimIncentiveModal
        isOpen={!!activeSchemeForClaim}
        scheme={activeSchemeForClaim}
        onClose={() => setActiveSchemeForClaim(null)}
        onSuccess={() => {
          setRevision((prev) => prev + 1);
        }}
      />
    </DashboardShell>
  );
}
