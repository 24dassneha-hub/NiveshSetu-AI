import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Building2,
  Download,
  ExternalLink,
  Sparkles,
  Info,
} from 'lucide-react';
import { Link, useParams } from '../router';
import DashboardShell from '../components/dashboard/DashboardShell';
import { getApprovalById } from '../data/approvalsStorage';
import { generateSnehaExplanation, NORMALIZED_STATUS } from '../services/monitoringService';
import CertificateModal from '../components/approvals/CertificateModal';

export default function ApprovalDetail() {
  const params = useParams();
  const approvalId = params?.id;

  const approval = useMemo(() => (approvalId ? getApprovalById(approvalId) : null), [approvalId]);
  const [showCertModal, setShowCertModal] = useState(false);

  if (!approval) {
    return (
      <DashboardShell>
        <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-8 sm:p-12 text-center my-8 space-y-4">
          <span className="font-mono-data text-xs text-[#B85C4A] font-bold block">
            RECORD NOT FOUND
          </span>
          <h2 className="text-xl font-bold text-[#171717] uppercase">
            Approval {approvalId} does not exist
          </h2>
          <p className="text-xs text-[#6E6A61] font-sans max-w-md mx-auto">
            This clearance record may have been removed or the link is no longer valid.
          </p>
          <Link
            to="/approvals"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#18324A] text-white rounded-[3px] text-xs font-mono-data font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Approval Monitor</span>
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const normStatus = approval.status?.normalized || NORMALIZED_STATUS.UNDER_PROCESS;
  const snehaInsight = generateSnehaExplanation(approval);
  const timeline = approval.timeline || [];
  const actionRequired = approval.actionRequired || {};
  const cert = approval.certificate || {};

  return (
    <DashboardShell>
      <div className="space-y-6">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            to="/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A] hover:underline mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO APPROVAL MONITOR</span>
          </Link>

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#262522]">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider text-[#6E6A61]">
                  APPROVAL MONITOR
                </span>
                <span className="text-[#D6D0C3]">•</span>
                <span className="font-mono-data text-[10px] font-bold px-2 py-0.5 bg-[#E9E1D0] rounded-[2px] text-[#18324A]">
                  {approval.category}
                </span>
                <span className="text-[#D6D0C3]">•</span>
                <span className="font-mono-data text-[10px] text-[#6E6A61]">
                  Ref: {approval.application?.applicationId || approval.id}
                </span>
              </div>
              <h1 className="font-sans font-bold text-2xl sm:text-3xl text-[#171717] tracking-tight">
                {approval.name}
              </h1>
              <div className="flex items-center gap-1.5 text-xs text-[#6E6A61] mt-1 font-sans">
                <Building2 className="w-3.5 h-3.5 text-[#6E6A61] shrink-0" />
                <span>{approval.authority?.name}</span>
                {approval.authority?.department && (
                  <span>• {approval.authority.department}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {normStatus === NORMALIZED_STATUS.APPROVED && cert.available && (
                <button
                  type="button"
                  onClick={() => setShowCertModal(true)}
                  className="px-3.5 py-2 bg-[#18324A] hover:bg-[#224564] text-white rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Certificate</span>
                </button>
              )}

              {approval.officialUrl && (
                <a
                  href={approval.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-2 bg-white border border-[#262522] hover:bg-[#FAF8F2] text-[#171717] rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Official Portal</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#6E6A61]" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* DUAL STATUS STRIP: NiveshSetu Status + Government Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-white border border-[#262522] rounded-[4px] shadow-xs">
          <div>
            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block mb-1.5">
              NIVESHSETU NORMALIZED STATUS
            </span>
            {normStatus === NORMALIZED_STATUS.APPROVED ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px] text-sm font-mono-data font-bold">
                <ShieldCheck className="w-4 h-4 text-[#5D8068]" />
                APPROVED
              </span>
            ) : normStatus === NORMALIZED_STATUS.ACTION_REQUIRED ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#B85C4A]/15 text-[#B85C4A] border border-[#B85C4A]/40 rounded-[2px] text-sm font-mono-data font-bold">
                <AlertTriangle className="w-4 h-4 text-[#B85C4A]" />
                ACTION REQUIRED
              </span>
            ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8B8982]/15 text-[#6E6A61] border border-[#8B8982]/30 rounded-[2px] text-sm font-mono-data font-bold">
                NOT YET APPLIED
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#C08A3E]/15 text-[#8F611E] border border-[#C08A3E]/40 rounded-[2px] text-sm font-mono-data font-bold">
                <Clock className="w-4 h-4 text-[#C08A3E]" />
                UNDER PROCESS
              </span>
            )}
            <p className="text-xs text-[#6E6A61] font-sans mt-2">
              Automated classification assigned by Sneha AI based on the official single window response.
            </p>
          </div>

          <div className="md:border-l md:border-[#E9E1D0] md:pl-5">
            <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block mb-1.5">
              OFFICIAL GOVERNMENT STATUS (SOURCE OF TRUTH)
            </span>
            <span className="font-sans font-bold text-base text-[#171717] block">
              {approval.status?.sourceStatus || 'Application Registered'}
            </span>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono-data text-[#6E6A61]">
              <span>Source: <strong className="text-[#18324A]">{approval.monitoring?.source || 'NSWS'}</strong></span>
              <span>•</span>
              <span>Last Checked: {approval.monitoring?.lastCheckedAt ? 'Today' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* SNEHA AI EXPLANATION BOX */}
        <div className="p-5 bg-gradient-to-br from-[#FAF8F2] to-[#E9E1D0]/60 border border-[#262522] rounded-[4px] space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A]">
            <Sparkles className="w-4 h-4 text-[#C08A3E]" />
            <span>SNEHA AI COMPLIANCE INTERPRETATION</span>
          </div>
          <h3 className="font-sans font-bold text-base text-[#171717] leading-snug">
            {snehaInsight.headline}
          </h3>
          <p className="font-sans text-xs sm:text-sm text-[#30302D] leading-relaxed">
            {snehaInsight.detail}
          </p>
          <div className="pt-2 border-t border-[#D6D0C3] flex items-start gap-2 text-xs text-[#18324A] font-sans">
            <Info className="w-4 h-4 text-[#18324A] shrink-0 mt-0.5" />
            <span className="font-semibold">{snehaInsight.actionAdvice}</span>
          </div>
        </div>

        {/* ACTION REQUIRED CALLOUT (If query exists) */}
        {normStatus === NORMALIZED_STATUS.ACTION_REQUIRED && actionRequired.required && (
          <div className="p-5 bg-[#B85C4A]/10 border-2 border-[#B85C4A]/40 rounded-[4px] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono-data font-bold text-[#B85C4A] uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-[#B85C4A]" />
                <span>DEFICIENCY NOTICE / STATUTORY QUERY</span>
              </div>
              {actionRequired.deadline && (
                <span className="font-mono-data text-xs font-bold px-2 py-0.5 bg-[#B85C4A] text-white rounded-[2px]">
                  Response Due: {actionRequired.deadline}
                </span>
              )}
            </div>
            <p className="font-sans text-xs sm:text-sm text-[#171717] leading-relaxed font-medium">
              {actionRequired.message}
            </p>
            {approval.officialUrl && (
              <div>
                <a
                  href={approval.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#B85C4A] hover:bg-[#a64e3c] text-white rounded-[3px] text-xs font-mono-data font-semibold transition-colors"
                >
                  <span>Respond on Official Department Portal</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* METADATA STRIP */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-white border border-[#D6D0C3] rounded-[3px] font-mono-data text-xs">
          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Application ID</span>
            <span className="font-bold text-[#18324A] text-sm">
              {approval.application?.applicationId || 'Not Linked'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Submission Date</span>
            <span className="text-[#171717] font-semibold">
              {approval.application?.submissionDate || 'Pending'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Monitoring Source</span>
            <span className="text-[#171717] font-semibold">
              {approval.monitoring?.source || 'NSWS'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">SLA Days</span>
            <span className="text-[#171717] font-semibold">
              {approval.sla?.durationDays || 30} Days
            </span>
          </div>
        </div>

        {/* STATUTORY CERTIFICATE CARD (If approved) */}
        {normStatus === NORMALIZED_STATUS.APPROVED && cert.available && (
          <div className="p-5 bg-[#5D8068]/10 border border-[#5D8068]/40 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-mono-data text-xs font-bold text-[#2A5237] uppercase">
                <ShieldCheck className="w-4 h-4 text-[#5D8068]" />
                <span>OFFICIAL STATUTORY CERTIFICATE AVAILABLE</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-[#171717]">
                {cert.name || `${approval.name} License`}
              </h4>
              <span className="font-mono-data text-xs text-[#6E6A61] block">
                Certificate No: {cert.number || 'OD-FAC-2026-88412'} • Issued: {cert.issuedAt || 'Recently'} • Valid until: {cert.validUntil || '2027'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowCertModal(true)}
              className="px-4 py-2 bg-[#18324A] hover:bg-[#224564] text-white rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>View & Download Certificate</span>
            </button>
          </div>
        )}

        {/* VERIFIED TIMELINE SECTION */}
        <div className="bg-white border border-[#262522] rounded-[4px] p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between pb-2 border-b border-[#D6D0C3]">
            <h3 className="font-sans font-bold text-base text-[#171717]">
              Application Milestones & Timeline
            </h3>
            <span className="font-mono-data text-xs text-[#6E6A61]">
              Verified events from issuing authority
            </span>
          </div>

          {timeline.length === 0 ? (
            <div className="p-6 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] text-xs text-[#6E6A61] font-sans text-center">
              No government milestones have been recorded yet for this clearance.
            </div>
          ) : (
            <div className="relative pl-6 space-y-5 border-l-2 border-[#18324A] ml-2 pt-1">
              {timeline.map((step, idx) => (
                <div key={idx} className="relative">
                  <span
                    className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center ${
                      step.status === 'COMPLETED'
                        ? 'bg-[#5D8068]'
                        : step.status === 'IN_PROGRESS'
                        ? 'bg-[#C08A3E]'
                        : 'bg-[#D6D0C3]'
                    }`}
                  />
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#171717] font-sans text-sm">
                        {step.stage}
                      </span>
                      <span className="font-mono-data text-xs text-[#6E6A61]">
                        {step.date}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#6E6A61] leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal
          approval={approval}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </DashboardShell>
  );
}
