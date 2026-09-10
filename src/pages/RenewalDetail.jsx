import React, { useState, useMemo, useEffect } from 'react';
import {
  ArrowLeft,
  Clock,
  Building2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Calendar,
  ShieldAlert,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  Scale,
  Award,
  Download,
  Check
} from 'lucide-react';
import { Link, useParams, useNavigate } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import StatusBadge from '../components/ui/StatusBadge';
import Button from '../components/ui/Button';
import InitiateRenewalModal from '../components/renewals/InitiateRenewalModal';
import {
  getRenewalById,
  getRenewalUrgency,
  checkRenewalPrerequisites,
  getRenewals
} from '../data/renewalsStorage';

export default function RenewalDetail() {
  const params = useParams();
  const navigate = useNavigate();
  const id = params.id;

  const [renewal, setRenewal] = useState(() => getRenewalById(id));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setRenewal(getRenewalById(id));
  }, [id]);

  // Re-read storage on storage events
  useEffect(() => {
    const handleStorage = () => setRenewal(getRenewalById(id));
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [id]);

  if (!renewal) {
    return (
      <DashboardShell>
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-14 text-center my-8">
          <Clock className="w-12 h-12 text-[#6E6A61] mx-auto mb-3" />
          <h2 className="text-xl font-bold text-[#171717] uppercase tracking-tight">
            Clearance Record Not Found
          </h2>
          <p className="text-xs text-[#6E6A61] mt-1 max-w-sm mx-auto">
            The requested clearance ID ({id}) does not exist in your enterprise records.
          </p>
          <div className="mt-5">
            <Link to="/renewals">
              <Button variant="secondary" size="md" icon={ArrowLeft}>
                BACK TO RENEWALS LIST
              </Button>
            </Link>
          </div>
        </div>
      </DashboardShell>
    );
  }

  const urgency = getRenewalUrgency(renewal);
  const prereqs = checkRenewalPrerequisites(renewal);
  const isInProgress = renewal.status === 'IN_PROGRESS';

  return (
    <DashboardShell>
      {/* 1. Breadcrumb & Top Navigation */}
      <div className="flex items-center justify-between gap-4 pb-3 border-b border-[#262522]">
        <div className="flex items-center gap-2 text-xs font-mono-data">
          <Link to="/renewals" className="text-[#6E6A61] hover:text-[#18324A] flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>RENEWALS</span>
          </Link>
          <span className="text-[#8B8982]">/</span>
          <span className="text-[#171717] font-bold">{renewal.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {isInProgress ? (
            <Link to={`/applications/${renewal.linkedApplicationId || ''}`}>
              <Button variant="secondary" size="sm" icon={ExternalLink}>
                TRACK APPLICATION ({renewal.linkedApplicationId})
              </Button>
            </Link>
          ) : (
            <Button
              variant={urgency.isCritical || urgency.isExpired ? 'danger' : 'primary'}
              size="sm"
              icon={RefreshCw}
              onClick={() => setIsModalOpen(true)}
            >
              INITIATE RENEWAL
            </Button>
          )}
        </div>
      </div>

      {/* 2. Main Clearance Dossier Header */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono-data text-[10px] font-bold text-[#18324A] uppercase tracking-wider bg-[#18324A]/10 px-2 py-0.5 rounded">
                {renewal.category}
              </span>
              <span className="font-mono-data text-xs text-[#6E6A61]">
                ID: {renewal.id}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight uppercase">
              {renewal.clearanceName}
            </h1>
            <p className="text-xs sm:text-sm text-[#6E6A61] font-sans mt-0.5 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 shrink-0 text-[#18324A]" />
              <span>{renewal.department}</span>
            </p>
          </div>

          <div className="flex flex-col sm:items-end gap-1.5">
            <StatusBadge status={urgency.urgency} label={urgency.label} />
            <span className="font-mono-data text-xs text-[#6E6A61]">
              Ref: <strong className="text-[#18324A]">{renewal.licenseNumber}</strong>
            </span>
          </div>
        </div>

        {/* Big Statutory Validity Countdown Meter */}
        <div className="p-4 sm:p-5 bg-[#FAF8F2] border border-[#262522] rounded-[4px] space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <span className="font-mono-data text-[10px] uppercase font-bold text-[#6E6A61] tracking-wider block">
                STATUTORY VALIDITY TIMELINE & COUNTDOWN
              </span>
              <span className="font-mono-data text-2xl sm:text-3xl font-bold" style={{ color: urgency.color }}>
                {urgency.daysRemaining >= 0
                  ? `${urgency.daysRemaining} DAYS REMAINING`
                  : `${Math.abs(urgency.daysRemaining)} DAYS OVERDUE`}
              </span>
            </div>
            <div className="font-mono-data text-xs text-right">
              <span className="text-[#6E6A61] block">CURRENT VALIDITY WINDOW</span>
              <span className="font-bold text-[#171717]">
                {renewal.issueDate} → {renewal.expiryDate}
              </span>
            </div>
          </div>

          {/* Meter progress bar */}
          <div className="w-full h-3 bg-[#E9E1D0] rounded-full overflow-hidden border border-[#D6D0C3]">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(5, urgency.progressPercent))}%`,
                backgroundColor: urgency.color,
              }}
            />
          </div>

          <div className="grid grid-cols-3 text-[11px] font-mono-data text-[#6E6A61] pt-1 border-t border-[#D6D0C3]">
            <div>
              <span className="block text-[9px] uppercase font-bold">ISSUANCE DATE</span>
              <span className="text-[#171717] font-semibold">{renewal.issueDate}</span>
            </div>
            <div className="text-center">
              <span className="block text-[9px] uppercase font-bold">RENEWAL WINDOW (60D)</span>
              <span className="text-[#18324A] font-semibold">Active Window</span>
            </div>
            <div className="text-right">
              <span className="block text-[9px] uppercase font-bold">EXPIRATION DATE</span>
              <span className="text-[#B85C4A] font-semibold">{renewal.expiryDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Grid: Department & Escalation + Statutory Legal Penalties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Department & SLA Information */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
            <Building2 className="w-4 h-4 text-[#18324A]" />
            <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
              Department & Service Level Agreement (SLA)
            </h3>
          </div>

          <div className="font-mono-data text-xs space-y-2.5">
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">ISSUING AUTHORITY:</span>
              <span className="font-bold text-[#171717]">{renewal.department}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">OFFICER IN CHARGE:</span>
              <span className="font-semibold text-[#171717]">{renewal.officerInCharge || 'Regional Officer'}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">STATUTORY SLA COMMITMENT:</span>
              <span className="font-bold text-[#5D8068]">
                {renewal.slaDays || 30} Working Days (Odisha RTSA Act 2012)
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">ESCALATION AUTHORITY:</span>
              <span className="text-[#18324A] font-medium">{renewal.escalationContact}</span>
            </div>
          </div>
        </div>

        {/* Legal & Penalty Warning */}
        <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
            <Scale className="w-4 h-4 text-[#B85C4A]" />
            <h3 className="text-xs font-mono-data font-bold uppercase text-[#B85C4A] tracking-wider">
              Statutory Penalties & Non-Compliance Risk
            </h3>
          </div>

          <div className="font-mono-data text-xs space-y-2.5">
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">GOVERNING ACT:</span>
              <span className="font-bold text-[#171717]">{renewal.governingAct}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">STATUTORY DEMAND FEE:</span>
              <span className="font-bold text-[#18324A]">₹{renewal.renewalFee?.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">COMPOUNDING LATE SURCHARGE:</span>
              <span className="font-bold text-[#B85C4A]">
                ₹{renewal.lateFeePerMonth?.toLocaleString('en-IN')} / month of delay
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#6E6A61] uppercase block">LEGAL CONSEQUENCE:</span>
              <span className="font-sans text-xs text-[#B85C4A] font-medium block">
                {renewal.penalConsequence || 'Immediate cessation order & revocation of power supply.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Mandatory Documents & Vault Verification Checklist */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-[#D6D0C3]">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#18324A]" />
            <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
              Prerequisite Compliance Documents (Document Vault Linkage)
            </h3>
          </div>
          <Link
            to="/documents"
            className="text-xs font-mono-data text-[#18324A] hover:underline flex items-center gap-1 font-semibold"
          >
            <span>DOCUMENT VAULT</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-2">
          {prereqs.requirements.map((req) => (
            <div
              key={req.id}
              className="p-3 border border-[#D6D0C3] rounded-[4px] flex items-center justify-between gap-3 text-xs bg-[#FAF8F2]"
            >
              <div className="flex items-center gap-2.5">
                {req.isSatisfied ? (
                  <CheckCircle className="w-4 h-4 text-[#5D8068] shrink-0" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-[#C08A3E] shrink-0" />
                )}
                <div>
                  <span className="font-bold text-[#171717]">{req.name}</span>
                  <span className="font-mono-data text-[11px] text-[#6E6A61] ml-2">
                    [TYPE: {req.type}]
                  </span>
                </div>
              </div>

              <div className="shrink-0">
                {req.isSatisfied ? (
                  <span className="font-mono-data text-[11px] text-[#5D8068] font-bold">
                    ✓ Verified in Vault
                  </span>
                ) : (
                  <span className="font-mono-data text-[11px] text-[#C08A3E] font-bold">
                    ● Missing / Required
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Historical Audit Trail of Past Renewal Cycles */}
      <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-5 shadow-[0_2px_8px_rgba(23,23,23,0.02)] space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-[#D6D0C3]">
          <Award className="w-4 h-4 text-[#18324A]" />
          <h3 className="text-xs font-mono-data font-bold uppercase text-[#18324A] tracking-wider">
            Clearance Renewal Audit History
          </h3>
        </div>

        {(!renewal.history || renewal.history.length === 0) ? (
          <p className="text-xs text-[#6E6A61] font-mono-data py-2">
            No previous renewal cycles recorded.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono-data">
              <thead>
                <tr className="bg-[#FAF8F2] border-b border-[#D6D0C3] text-[#6E6A61] uppercase text-[10px]">
                  <th className="py-2.5 px-3">Renewal Cycle</th>
                  <th className="py-2.5 px-3">Application Ref</th>
                  <th className="py-2.5 px-3">Term</th>
                  <th className="py-2.5 px-3">Validity Span</th>
                  <th className="py-2.5 px-3">Fee Paid</th>
                  <th className="py-2.5 px-3">Certificate / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D6D0C3]">
                {renewal.history.map((cycle, idx) => (
                  <tr key={idx} className="hover:bg-[#FAF8F2] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-[#171717]">
                      {cycle.cycle}
                    </td>
                    <td className="py-2.5 px-3 text-[#18324A] font-semibold">
                      {cycle.renewalRef}
                    </td>
                    <td className="py-2.5 px-3 text-[#171717]">
                      {cycle.term}
                    </td>
                    <td className="py-2.5 px-3 text-[#6E6A61]">
                      {cycle.grantedOn} → {cycle.validUntil}
                    </td>
                    <td className="py-2.5 px-3 text-[#171717]">
                      {cycle.feePaid}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-[#18324A]">
                        {cycle.certificateNumber || cycle.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. Multi-Step Renewal Initiation Modal */}
      <InitiateRenewalModal
        isOpen={isModalOpen}
        renewal={renewal}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          setRenewal(getRenewalById(id));
        }}
      />
    </DashboardShell>
  );
}
