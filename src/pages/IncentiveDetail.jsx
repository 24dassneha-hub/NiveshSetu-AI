import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Award,
  Building2,
  CheckCircle,
  FileText,
  Calendar,
  Coins,
  ExternalLink,
  ShieldCheck,
  Scale,
  Clock,
  Briefcase
} from 'lucide-react';
import { Link, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import ClaimIncentiveModal from '../components/incentives/ClaimIncentiveModal';
import { getIncentiveById } from '../data/incentivesStorage';
import { useAuth } from '../context/AuthContext';
import { getUserBusinessProfile, isDemoMode } from '../data/appModeState';
import {
  getFiscalAssessment,
  parseInvestmentAmount,
  formatCurrencyInr,
} from '../data/fiscalIncentivesEngine';

export default function IncentiveDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [baseScheme, setBaseScheme] = useState(() => getIncentiveById(id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  const profile = getUserBusinessProfile(user);
  const registeredRaw =
    profile?.projectValue ||
    profile?.investmentRange ||
    profile?.investment ||
    (isDemoMode() ? '₹10 Cr' : '₹5 Cr');
  const activeInvestment = parseInvestmentAmount(registeredRaw, 100000000);
  const assessment = getFiscalAssessment(activeInvestment, profile);

  useEffect(() => {
    setBaseScheme(getIncentiveById(id));
  }, [id]);

  const scheme = assessment.subsidies.schemes.find((s) => s.id === id) || baseScheme;

  if (!scheme) {
    return (
      <DashboardShell>
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-14 text-center my-8">
          <Award className="w-12 h-12 text-[#6E6A61] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#171717] uppercase tracking-tight">
            Incentive Scheme Not Found
          </h2>
          <p className="text-xs text-[#6E6A61] mt-1 max-w-sm mx-auto font-sans">
            The requested scheme reference ({id}) does not exist in the state incentive registry.
          </p>
          <div className="mt-5">
            <Link to="/incentives">
              <Button variant="secondary" size="md" icon={ArrowLeft}>
                BACK TO INCENTIVES
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const isEligible = scheme.status === 'ELIGIBLE';
  const isClaimed = scheme.status === 'CLAIMED';

  return (
    <DashboardShell>
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#262522]">
        <div className="flex items-center gap-2 text-xs font-mono-data">
          <Link to="/incentives" className="text-[#6E6A61] hover:text-[#18324A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>INCENTIVES</span>
          </Link>
          <span className="text-[#8B8982]">/</span>
          <span className="text-[#171717] font-bold">{scheme.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {isClaimed ? (
            <Link to={`/applications/${scheme.linkedApplicationId || ''}`}>
              <Button variant="secondary" size="sm" icon={ExternalLink}>
                TRACK CLAIM DOSSIER
              </Button>
            </Link>
          ) : isEligible ? (
            <Button
              variant="primary"
              size="sm"
              icon={Coins}
              onClick={() => setIsModalOpen(true)}
            >
              CLAIM SUBSIDY NOW
            </Button>
          ) : null}
        </div>
      </div>

      {/* Main Scheme Header Dossier */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase tracking-wider bg-[#18324A]/10 px-2 py-0.5 rounded">
                {scheme.category}
              </span>
              <span className="font-mono-data text-xs text-[#6E6A61]">
                SCHEME ID: {scheme.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight uppercase">
              {scheme.schemeName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 shrink-0 text-[#18324A]" />
              <span>{scheme.authority}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusBadge
              status={isEligible ? 'active' : isClaimed ? 'in_progress' : 'approved'}
              label={isEligible ? 'Eligible to Claim' : isClaimed ? 'Claim Under Review' : 'Disbursed'}
            />
            <span className="font-mono-data text-xs text-[#6E6A61]">
              Policy: <strong className="text-[#18324A]">{scheme.policyReference}</strong>
            </span>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-[#171717] font-sans leading-relaxed border-t border-[#D6D0C3] pt-3">
          {scheme.description}
        </p>

        {/* Financial Benefit Callout */}
        <div className="p-4 sm:p-5 bg-[#FAF8F2] border border-[#262522] rounded-[4px] space-y-2 font-mono-data text-xs">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[10px] uppercase font-bold text-[#6E6A61] tracking-wider block">
              ESTIMATED BENEFIT ENTITLEMENT UNDER IPR 2022
            </span>
            <span className="text-[11px] font-mono-data text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded font-bold">
              Linked Outlay: {assessment.formattedInvestment} ({assessment.valuation.tier})
            </span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-[#5D8068]">
              {scheme.estimatedEntitlement > 0
                ? `₹${scheme.estimatedEntitlement?.toLocaleString('en-IN')}`
                : '₹0 (Threshold Gap)'}
            </span>
            <span className="text-[#6E6A61]">
              MAX SCHEME CEILING: <strong className="text-[#171717]">₹{(scheme.maxBenefitCap / 100000).toFixed(0)} Lakh</strong>
            </span>
          </div>
          <p className="font-sans text-xs text-[#6E6A61] pt-1 border-t border-[#D6D0C3]">
            Subsidy Formula: {scheme.formulaNote || scheme.subsidyRate}
          </p>
        </div>
      </div>

      {/* Grid: Eligibility Criteria & Required Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Eligibility Card */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
            <Briefcase className="w-4 h-4 text-[#18324A]" />
            <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
              Eligibility & District Classification
            </h3>
          </div>

          <div className="font-mono-data text-xs space-y-2.5">
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">TARGET INDUSTRIAL SECTORS:</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {scheme.targetSectors?.map((s, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded text-[10px] text-[#171717]">
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">ELIGIBLE DISTRICT ZONES:</span>
              <span className="font-bold text-[#171717]">{scheme.eligibleZones?.join(', ')}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">MINIMUM INVESTMENT THRESHOLD:</span>
              <span className="font-bold text-[#171717]">₹{(scheme.minInvestment / 100000).toFixed(0)} Lakh</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">CLAIM SUBMISSION WINDOW:</span>
              <span className="font-sans text-xs text-[#171717]">{scheme.claimWindow}</span>
            </div>
          </div>
        </div>

        {/* Required Documents Card */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
            <FileText className="w-4 h-4 text-[#18324A]" />
            <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
              Prerequisite Scrutiny Certifications
            </h3>
          </div>

          <div className="space-y-2">
            {scheme.requiredDocuments?.map((doc, idx) => (
              <div
                key={idx}
                className="p-2.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-[#5D8068] shrink-0" />
                  <span className="font-sans font-medium text-[#171717]">{doc}</span>
                </div>
                <span className="font-mono-data text-[10px] text-[#5D8068] uppercase font-bold shrink-0">
                  Required
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Disbursement Milestones Timeline */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
          <Clock className="w-4 h-4 text-[#18324A]" />
          <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
            Scrutiny & Sanction Milestones (SLA: {scheme.slaDays} Working Days)
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono-data text-xs">
          {scheme.milestones?.map((m, idx) => (
            <div key={idx} className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[4px] space-y-1">
              <span className="text-[10px] text-[#6E6A61] uppercase block">STAGE {idx + 1}</span>
              <span className="font-bold text-[#171717] block font-sans">{m.name}</span>
              <span className="text-[#18324A] text-[11px] block">Target SLA: {m.days} Days</span>
            </div>
          ))}
        </div>
      </div>

      {/* Claim Modal */}
      <ClaimIncentiveModal
        isOpen={isModalOpen}
        scheme={scheme}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setScheme(getIncentiveById(id));
        }}
      />
    </DashboardShell>
  );
}
