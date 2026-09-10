import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Lock,
  Download,
  Building2,
  Sparkles,
  ArrowRight,
  Info,
} from 'lucide-react';
import { Link } from '../../router';
import { generateSnehaExplanation, NORMALIZED_STATUS } from '../../services/monitoringService.js';
import CertificateModal from './CertificateModal.jsx';

export default function ApprovalDetailDrawer({ approval, onClose }) {
  const [showCertModal, setShowCertModal] = useState(false);

  if (!approval) return null;

  const normStatus = approval.status?.normalized || NORMALIZED_STATUS.UNDER_PROCESS;
  const snehaInsight = generateSnehaExplanation(approval);
  const timeline = approval.timeline || [];
  const actionRequired = approval.actionRequired || {};
  const cert = approval.certificate || {};

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-[#171717]/50 backdrop-blur-[1px] transition-opacity"
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <div className="relative w-full max-w-xl bg-[#FAF8F2] border-l border-[#262522] p-6 h-full z-10 overflow-y-auto shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3 pb-4 border-b border-[#262522]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider text-[#6E6A61]">
                    APPROVAL MONITOR
                  </span>
                  <span className="text-[#D6D0C3]">•</span>
                  <span className="font-mono-data text-[10px] text-[#18324A] font-semibold">
                    {approval.id}
                  </span>
                </div>
                <h2 className="font-sans font-bold text-xl text-[#171717] tracking-tight">
                  {approval.name}
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-[#6E6A61] mt-1 font-sans">
                  <Building2 className="w-3.5 h-3.5 text-[#6E6A61] shrink-0" />
                  <span>{approval.authority?.name}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-[#262522] transition-colors cursor-pointer"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* DUAL STATUS STRIP: NiveshSetu Status + Government Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-white border border-[#262522] rounded-[4px] shadow-xs">
              <div>
                <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block mb-1">
                  NIVESHSETU STATUS
                </span>
                {normStatus === NORMALIZED_STATUS.APPROVED ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#5D8068]/15 text-[#2A5237] border border-[#5D8068]/40 rounded-[2px] text-xs font-mono-data font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#5D8068]" />
                    APPROVED
                  </span>
                ) : normStatus === NORMALIZED_STATUS.ACTION_REQUIRED ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#B85C4A]/15 text-[#B85C4A] border border-[#B85C4A]/40 rounded-[2px] text-xs font-mono-data font-bold">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#B85C4A]" />
                    ACTION REQUIRED
                  </span>
                ) : normStatus === NORMALIZED_STATUS.NOT_YET ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#8B8982]/15 text-[#6E6A61] border border-[#8B8982]/30 rounded-[2px] text-xs font-mono-data font-bold">
                    NOT YET APPLIED
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#C08A3E]/15 text-[#8F611E] border border-[#C08A3E]/40 rounded-[2px] text-xs font-mono-data font-bold">
                    <Clock className="w-3.5 h-3.5 text-[#C08A3E]" />
                    UNDER PROCESS
                  </span>
                )}
              </div>

              <div>
                <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block mb-1">
                  OFFICIAL GOVERNMENT STATUS
                </span>
                <span className="font-sans font-bold text-xs sm:text-sm text-[#171717] block">
                  {approval.status?.sourceStatus || 'Processing'}
                </span>
                <span className="text-[11px] font-mono-data text-[#6E6A61] block mt-0.5">
                  Source: {approval.monitoring?.source || 'NSWS'}
                </span>
              </div>
            </div>

            {/* SNEHA AI ASSESSMENT BOX */}
            <div className="p-4 bg-gradient-to-br from-[#FAF8F2] to-[#E9E1D0]/60 border border-[#262522] rounded-[4px] space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-mono-data font-bold text-[#18324A]">
                <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
                <span>SNEHA AI COMPLIANCE INTERPRETATION</span>
              </div>
              <h4 className="font-sans font-bold text-sm text-[#171717] leading-snug">
                {snehaInsight.headline}
              </h4>
              <p className="font-sans text-xs text-[#30302D] leading-relaxed">
                {snehaInsight.detail}
              </p>
              <div className="pt-2 border-t border-[#D6D0C3] flex items-start gap-1.5 text-xs text-[#18324A] font-sans">
                <Info className="w-3.5 h-3.5 text-[#18324A] shrink-0 mt-0.5" />
                <span className="font-medium">{snehaInsight.actionAdvice}</span>
              </div>
            </div>

            {/* ACTION REQUIRED NOTICE (If department query exists) */}
            {normStatus === NORMALIZED_STATUS.ACTION_REQUIRED && actionRequired.required && (
              <div className="p-4 bg-[#B85C4A]/10 border border-[#B85C4A]/40 rounded-[4px] space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono-data font-bold text-[#B85C4A] uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-[#B85C4A]" />
                    <span>DEFICIENCY NOTICE / QUERY RAISED</span>
                  </div>
                  {actionRequired.deadline && (
                    <span className="font-mono-data text-[11px] font-bold px-2 py-0.5 bg-[#B85C4A] text-white rounded-[2px]">
                      Due: {actionRequired.deadline}
                    </span>
                  )}
                </div>
                <p className="font-sans text-xs text-[#171717] leading-relaxed font-medium">
                  {actionRequired.message}
                </p>
                {approval.officialUrl && (
                  <div className="pt-1">
                    <a
                      href={approval.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#B85C4A] hover:bg-[#a64e3c] text-white rounded-[2px] text-xs font-mono-data font-semibold transition-colors"
                    >
                      <span>Respond on Official Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* NOT YET APPLIED NOTICE */}
            {normStatus === NORMALIZED_STATUS.NOT_YET && (
              <div className="p-4 bg-[#E9E1D0]/70 border border-[#262522] rounded-[4px] flex items-center justify-between gap-3">
                <div className="space-y-0.5 text-xs font-sans text-[#30302D]">
                  <span className="font-bold block">Application Not Yet Submitted</span>
                  <span>Prepare your pre-requisites and submit through the verified government gateway.</span>
                </div>
                <Link
                  to="/apply"
                  className="px-3.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-white rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <span>Apply Now</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {/* APPLICATION REFERENCE METADATA */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-white border border-[#D6D0C3] rounded-[3px] font-mono-data text-xs">
              <div>
                <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Application ID</span>
                <span className="font-bold text-[#18324A]">
                  {approval.application?.applicationId || 'Not Linked'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Submitted Date</span>
                <span className="text-[#171717]">
                  {approval.application?.submissionDate || 'Pending'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#6E6A61] uppercase block font-bold">Monitoring Channel</span>
                <span className="text-[#171717]">
                  {approval.monitoring?.source || 'NSWS'}
                </span>
              </div>
            </div>

            {/* CERTIFICATE SECTION (When approved) */}
            {normStatus === NORMALIZED_STATUS.APPROVED && cert.available && (
              <div className="p-4 bg-[#5D8068]/10 border border-[#5D8068]/40 rounded-[4px] flex items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-mono-data text-xs font-bold text-[#2A5237] uppercase">
                    <ShieldCheck className="w-4 h-4 text-[#5D8068]" />
                    <span>STATUTORY CERTIFICATE READY</span>
                  </div>
                  <span className="font-mono-data text-[11px] text-[#171717] block">
                    No: {cert.number || 'OD-FAC-2026-88412'} • Valid until {cert.validUntil || '2027'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertModal(true)}
                  className="px-3.5 py-1.5 bg-[#18324A] hover:bg-[#224564] text-white rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shrink-0"
                >
                  <Download className="w-3 h-3" />
                  <span>View Certificate</span>
                </button>
              </div>
            )}

            {/* VERIFIED GOVERNMENT TIMELINE */}
            <div className="space-y-3">
              <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider block">
                OFFICIAL APPLICATION TIMELINE
              </span>

              {timeline.length === 0 ? (
                <div className="p-4 bg-white border border-[#D6D0C3] rounded-[3px] text-xs text-[#6E6A61] font-sans text-center">
                  No timeline events recorded by the government authority yet.
                </div>
              ) : (
                <div className="relative pl-6 space-y-4 border-l-2 border-[#18324A] ml-2">
                  {timeline.map((step, idx) => (
                    <div key={idx} className="relative group">
                      {/* Timeline dot */}
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
                          <span className="font-bold text-[#171717] font-sans">
                            {step.stage}
                          </span>
                          <span className="font-mono-data text-[11px] text-[#6E6A61]">
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

          {/* Drawer Footer */}
          <div className="pt-4 border-t border-[#D6D0C3] flex items-center justify-between gap-3">
            {approval.officialUrl ? (
              <a
                href={approval.officialUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-mono-data font-semibold text-[#18324A] hover:underline flex items-center gap-1.5 truncate"
              >
                <Lock className="w-3 h-3 text-[#5D8068]" />
                <span className="truncate">Open Official Portal ↗</span>
              </a>
            ) : (
              <span className="text-xs font-mono-data text-[#6E6A61]">
                Official Portal Link Unavailable
              </span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#262522] text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] text-xs font-mono-data font-semibold transition-colors cursor-pointer shrink-0"
            >
              Close
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Modal */}
      {showCertModal && (
        <CertificateModal
          approval={approval}
          onClose={() => setShowCertModal(false)}
        />
      )}
    </>
  );
}
