import React, { useState, useMemo } from 'react';
import {
  X,
  Clock,
  FileText,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  ArrowLeft,
  ExternalLink,
  Receipt,
  FileCheck
} from 'lucide-react';
import { Link } from '../../router';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';
import {
  checkRenewalPrerequisites,
  initiateRenewalApplication,
  getRenewalUrgency
} from '../../data/renewalsStorage';

export default function InitiateRenewalModal({
  isOpen,
  onClose,
  renewal,
  onSuccess
}) {
  const [step, setStep] = useState(1);
  const [termYears, setTermYears] = useState(renewal?.validityYears || 1);
  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  // Re-check document prerequisites from vault
  const prereqs = useMemo(() => {
    if (!renewal) return { allMatched: true, requirements: [] };
    return checkRenewalPrerequisites(renewal);
  }, [renewal]);

  if (!isOpen || !renewal) return null;

  const urgency = getRenewalUrgency(renewal);
  const baseFee = renewal.renewalFee || 10000;
  const lateFee = urgency.isExpired ? (renewal.lateFeePerMonth || 2000) * 2 : 0;
  const renewalFee = Math.round(baseFee * (termYears === 5 ? 4.5 : termYears === 3 ? 2.8 : termYears));
  const totalPayable = renewalFee + lateFee;

  const handleTermChange = (years) => {
    setTermYears(years);
  };

  const handleSubmit = () => {
    if (!declared) return;
    setIsSubmitting(true);

    try {
      const res = initiateRenewalApplication(renewal.id, {
        termYears,
        fee: totalPayable,
      });

      if (res.success) {
        setSubmissionResult(res);
        if (onSuccess) {
          onSuccess(res);
        }
      }
    } catch (err) {
      console.error('Failed to initiate renewal:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setStep(1);
    setSubmissionResult(null);
    setDeclared(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-[#FAF8F2] border-2 border-[#262522] rounded-[6px] max-w-2xl w-full shadow-[0_16px_40px_rgba(23,23,23,0.2)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header */}
        <div className="bg-[#FFFFFF] border-b border-[#262522] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#18324A] text-[#FAF8F2] flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono-data text-[10px] text-[#18324A] font-bold uppercase tracking-wider block">
                STATUTORY SINGLE WINDOW FILING
              </span>
              <h3 className="text-base font-bold text-[#171717] tracking-tight uppercase">
                Initiate Clearance Renewal
              </h3>
            </div>
          </div>
          <button
            onClick={handleModalClose}
            className="w-8 h-8 flex items-center justify-center rounded-[3px] text-[#6E6A61] hover:text-[#171717] hover:bg-[#E9E1D0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Target Clearance Info Bar */}
        <div className="bg-[#FAF8F2] px-5 py-3 border-b border-[#D6D0C3] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono-data text-[10px] uppercase font-bold text-[#6E6A61] block">
              Clearance Name
            </span>
            <span className="font-bold text-[#171717] text-sm">{renewal.clearanceName}</span>
          </div>
          <div className="flex items-center gap-3">
            <div>
              <span className="font-mono-data text-[10px] uppercase font-bold text-[#6E6A61] block">
                License No.
              </span>
              <span className="font-mono-data font-medium text-[#18324A]">{renewal.licenseNumber}</span>
            </div>
            <StatusBadge status={urgency.urgency} label={urgency.label} />
          </div>
        </div>

        {/* Wizard Steps Indicator (if not completed) */}
        {!submissionResult && (
          <div className="bg-[#FFFFFF] px-5 py-2.5 border-b border-[#D6D0C3] flex items-center justify-between text-xs font-mono-data">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#18324A] font-bold' : 'text-[#6E6A61]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-[#18324A] text-white' : 'bg-[#E9E1D0] text-[#171717]'}`}>
                1
              </span>
              <span>VALIDITY TERM</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-[#D6D0C3]" />
            <div className={`flex items-center gap-2 ${step === 2 ? 'text-[#18324A] font-bold' : 'text-[#6E6A61]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-[#18324A] text-white' : 'bg-[#E9E1D0] text-[#171717]'}`}>
                2
              </span>
              <span>DOCUMENTS AUDIT</span>
            </div>
            <div className="h-0.5 flex-1 mx-3 bg-[#D6D0C3]" />
            <div className={`flex items-center gap-2 ${step === 3 ? 'text-[#18324A] font-bold' : 'text-[#6E6A61]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? 'bg-[#18324A] text-white' : 'bg-[#E9E1D0] text-[#171717]'}`}>
                3
              </span>
              <span>SUBMISSION</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 font-sans">
          {/* SUCCESS STATE */}
          {submissionResult ? (
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#5D8068]/15 border border-[#5D8068] text-[#5D8068] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="font-mono-data text-xs text-[#5D8068] font-bold uppercase tracking-wider block">
                  STATUTORY FILING COMPLETE
                </span>
                <h4 className="text-xl font-bold text-[#171717] uppercase tracking-tight mt-0.5">
                  Renewal Application Submitted
                </h4>
                <p className="text-xs text-[#6E6A61] mt-1 max-w-md mx-auto">
                  Application reference has been recorded in the Single Window Composite Applications system. Department SLA tracking is active.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 text-left font-mono-data text-xs space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">APPLICATION ID:</span>
                  <span className="font-bold text-[#18324A]">{submissionResult.application?.id}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">CLEARANCE:</span>
                  <span className="font-semibold text-[#171717]">{renewal.clearanceName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">REQUESTED EXTENSION:</span>
                  <span className="font-semibold text-[#171717]">{termYears} Year(s)</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">STATUTORY FEE:</span>
                  <span className="font-bold text-[#5D8068]">₹{totalPayable.toLocaleString('en-IN')} (Paid)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">COMMITTED SLA:</span>
                  <span className="font-semibold text-[#171717]">{renewal.slaDays || 30} Working Days</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <Link to={`/applications/${submissionResult.application?.id}`}>
                  <Button variant="primary" size="md" icon={ExternalLink}>
                    TRACK APPLICATION
                  </Button>
                </Link>
                <Button variant="secondary" size="md" onClick={handleModalClose}>
                  CLOSE
                </Button>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: TERM & DURATION */
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[4px] p-4">
                <label className="block text-xs font-mono-data font-bold uppercase text-[#18324A] mb-2">
                  Select Requested Renewal Term
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[1, 3, 5].map((years) => (
                    <button
                      key={years}
                      type="button"
                      onClick={() => handleTermChange(years)}
                      className={`p-3 border rounded-[4px] text-left transition-all ${
                        termYears === years
                          ? 'border-[#18324A] bg-[#18324A]/5 ring-1 ring-[#18324A]'
                          : 'border-[#D6D0C3] bg-[#FAF8F2] hover:border-[#18324A]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-data text-xs font-bold text-[#171717]">
                          {years} YEAR{years > 1 ? 'S' : ''}
                        </span>
                        {years === 3 && (
                          <span className="text-[9px] font-mono-data bg-[#C08A3E]/20 text-[#8F5E17] px-1 rounded">
                            POPULAR
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#6E6A61] block font-sans">
                        Valid through {new Date().getFullYear() + years}
                      </span>
                      <span className="font-mono-data text-xs font-semibold text-[#18324A] mt-2 block">
                        ₹{Math.round(baseFee * (years === 5 ? 4.5 : years === 3 ? 2.8 : years)).toLocaleString('en-IN')}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fee Breakdown Notice */}
              <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[4px] p-4 font-mono-data text-xs space-y-2">
                <span className="text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider block">
                  STATUTORY FEE ESTIMATE BREAKDOWN
                </span>
                <div className="flex justify-between text-[#171717]">
                  <span>Base Renewal Fee ({termYears} Yr):</span>
                  <span>₹{renewalFee.toLocaleString('en-IN')}</span>
                </div>
                {lateFee > 0 && (
                  <div className="flex justify-between text-[#B85C4A]">
                    <span>Late Filing Compound Penalty:</span>
                    <span>+ ₹{lateFee.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#6E6A61]">
                  <span>e-Treasury Portal Processing Fee:</span>
                  <span>₹0.00 (Exempt under Single Window)</span>
                </div>
                <div className="border-t border-[#262522] pt-2 flex justify-between font-bold text-sm text-[#18324A]">
                  <span>TOTAL ESTIMATED DEMAND:</span>
                  <span>₹{totalPayable.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {urgency.isExpired && (
                <div className="p-3 bg-[#B85C4A]/10 border border-[#B85C4A] rounded-[4px] flex items-start gap-2.5 text-xs text-[#B85C4A]">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold uppercase tracking-wider">Statutory Delay Alert</span>
                    <p className="font-sans mt-0.5 text-[#171717]">
                      This clearance is currently overdue. A statutory compounding surcharge applies under the governing rules.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : step === 2 ? (
            /* STEP 2: PREREQUISITES & DOCUMENTS CHECK */
            <div className="space-y-3">
              <div>
                <span className="text-xs font-mono-data uppercase font-bold text-[#18324A]">
                  Prerequisite Document Audit
                </span>
                <p className="text-xs text-[#6E6A61]">
                  The engine automatically verifies necessary audit certifications and laboratory returns from your Document Vault.
                </p>
              </div>

              <div className="space-y-2">
                {prereqs.requirements.map((req) => (
                  <div
                    key={req.id}
                    className={`p-3 border rounded-[4px] flex items-center justify-between gap-3 text-xs ${
                      req.isSatisfied
                        ? 'bg-[#FFFFFF] border-[#D6D0C3]'
                        : 'bg-[#FAF8F2] border-[#C08A3E]/60'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        {req.isSatisfied ? (
                          <CheckCircle className="w-4 h-4 text-[#5D8068]" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-[#C08A3E]" />
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-[#171717] block">{req.name}</span>
                        <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono-data text-[#6E6A61]">
                          <span>TYPE: {req.type}</span>
                          {req.mandatory && (
                            <span className="text-[#B85C4A] font-semibold">• MANDATORY</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {req.isSatisfied ? (
                        <span className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#5D8068] font-bold uppercase">
                          ✓ Verified in Vault
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-mono-data text-[11px] text-[#C08A3E] font-bold uppercase">
                          ● Pending Upload
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {!prereqs.allMatched && (
                <div className="p-3 bg-[#C08A3E]/10 border border-[#C08A3E] rounded-[4px] text-xs font-sans text-[#171717]">
                  <span className="font-bold text-[#8F5E17] block font-mono-data uppercase mb-0.5">
                    Provisional Filing Notice
                  </span>
                  Some supplementary documents are not yet uploaded in your Document Vault. You may still file your application today; you will have a 7-day statutory window to attach them before scrutiny.
                </div>
              )}
            </div>
          ) : (
            /* STEP 3: DECLARATION & CONFIRMATION */
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 text-xs font-mono-data space-y-2">
                <span className="text-[10px] font-bold text-[#18324A] uppercase tracking-wider block">
                  SUMMARY OF STATUTORY RENEWAL SUBMISSION
                </span>
                <div className="grid grid-cols-2 gap-2 text-[#171717] pt-1">
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">ISSUING AUTHORITY:</span>
                    <span className="font-semibold">{renewal.department}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">EXISTING LICENSE:</span>
                    <span className="font-semibold">{renewal.licenseNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">REQUESTED EXTENSION:</span>
                    <span className="font-semibold">{termYears} Year(s)</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">STATUTORY SLA:</span>
                    <span className="font-semibold">{renewal.slaDays || 30} Days (ORTPSA Act)</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">TOTAL DEMAND AMOUNT:</span>
                    <span className="font-bold text-[#18324A]">₹{totalPayable.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">PAYMENT ROUTE:</span>
                    <span className="font-semibold">Integrated e-Challan</span>
                  </div>
                </div>
              </div>

              {/* Legal Declaration */}
              <div className="p-3.5 bg-[#FAF8F2] border border-[#262522] rounded-[4px]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-[#171717]">
                  <input
                    type="checkbox"
                    checked={declared}
                    onChange={(e) => setDeclared(e.target.checked)}
                    className="mt-0.5 rounded border-[#262522] text-[#18324A] focus:ring-[#18324A]"
                  />
                  <span>
                    I hereby declare that the industrial installation, boiler systems, emissions parameters, and workplace conditions strictly conform to the statutory standards under <strong>{renewal.governingAct}</strong>, and no unauthorized modifications have been carried out since previous inspection.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        {!submissionResult && (
          <div className="bg-[#FFFFFF] border-t border-[#262522] px-5 py-3.5 flex items-center justify-between">
            {step > 1 ? (
              <Button
                variant="secondary"
                size="sm"
                icon={ArrowLeft}
                onClick={() => setStep((s) => s - 1)}
              >
                BACK
              </Button>
            ) : (
              <Button variant="secondary" size="sm" onClick={handleModalClose}>
                CANCEL
              </Button>
            )}

            {step < 3 ? (
              <Button
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => setStep((s) => s + 1)}
              >
                PROCEED TO {step === 1 ? 'DOCUMENTS' : 'SUBMISSION'}
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={FileCheck}
                disabled={!declared || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'FILING RENEWAL...' : 'SUBMIT RENEWAL APPLICATION'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
