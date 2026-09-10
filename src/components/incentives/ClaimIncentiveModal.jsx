import React, { useState } from 'react';
import {
  X,
  Award,
  CheckCircle,
  FileText,
  ArrowRight,
  ArrowLeft,
  ExternalLink,
  Coins
} from 'lucide-react';
import { Link } from '../../router';
import Button from '../ui/Button';
import { fileIncentiveClaim } from '../../data/incentivesStorage';

export default function ClaimIncentiveModal({
  isOpen,
  onClose,
  scheme,
  onSuccess
}) {
  const [step, setStep] = useState(1);
  const [capexAmount, setCapexAmount] = useState(12500000); // 1.25 Cr default
  const [claimAmount, setClaimAmount] = useState(scheme?.estimatedEntitlement || 3500000);
  const [declared, setDeclared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState(null);

  if (!isOpen || !scheme) return null;

  const handleCapexChange = (val) => {
    const num = Number(val) || 0;
    setCapexAmount(num);
    // Rough estimation (approx 25-30% of capex capped at scheme maxBenefitCap)
    const estimated = Math.min(scheme.maxBenefitCap, Math.round(num * 0.28));
    setClaimAmount(estimated);
  };

  const handleSubmit = () => {
    if (!declared) return;
    setIsSubmitting(true);

    try {
      const res = fileIncentiveClaim(scheme.id, {
        capexAmount,
        claimAmount,
      });

      if (res.success) {
        setSubmissionResult(res);
        if (onSuccess) onSuccess(res);
      }
    } catch (err) {
      console.error('Failed to submit incentive claim:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSubmissionResult(null);
    setDeclared(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#171717]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div
        className="bg-[#FAF8F2] border-2 border-[#262522] rounded-[6px] max-w-2xl w-full shadow-[0_16px_40px_rgba(23,23,23,0.2)] overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="bg-[#FFFFFF] border-b border-[#262522] px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[4px] bg-[#18324A] text-[#FAF8F2] flex items-center justify-center font-bold">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <span className="font-mono-data text-[10px] text-[#18324A] font-bold uppercase tracking-wider block">
                ODISHA IPR 2022 FISCAL INCENTIVE FILING
              </span>
              <h3 className="text-base font-bold text-[#171717] tracking-tight uppercase">
                Claim Industrial Subsidy
              </h3>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-[3px] text-[#6E6A61] hover:text-[#171717] hover:bg-[#E9E1D0] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scheme Banner */}
        <div className="bg-[#FAF8F2] px-5 py-3 border-b border-[#D6D0C3] flex items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-mono-data text-[10px] uppercase font-bold text-[#6E6A61] block">
              SCHEME
            </span>
            <span className="font-bold text-[#171717] text-sm">{scheme.schemeName}</span>
          </div>
          <div className="text-right">
            <span className="font-mono-data text-[10px] uppercase font-bold text-[#6E6A61] block">
              POLICY REF
            </span>
            <span className="font-mono-data text-[#18324A] font-semibold">{scheme.policyReference}</span>
          </div>
        </div>

        {/* Wizard Steps */}
        {!submissionResult && (
          <div className="bg-[#FFFFFF] px-5 py-2.5 border-b border-[#D6D0C3] flex items-center justify-between text-xs font-mono-data">
            <div className={`flex items-center gap-2 ${step === 1 ? 'text-[#18324A] font-bold' : 'text-[#6E6A61]'}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-[#18324A] text-white' : 'bg-[#E9E1D0] text-[#171717]'}`}>
                1
              </span>
              <span>CAPEX & BENEFIT</span>
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
              <span>DECLARATION</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="p-5 max-h-[60vh] overflow-y-auto space-y-4 font-sans text-xs">
          {submissionResult ? (
            /* SUCCESS STATE */
            <div className="text-center py-4 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#5D8068]/15 border border-[#5D8068] text-[#5D8068] flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="font-mono-data text-xs text-[#5D8068] font-bold uppercase tracking-wider block">
                  SUBSIDY CLAIM RECORDED
                </span>
                <h4 className="text-xl font-bold text-[#171717] uppercase tracking-tight mt-0.5">
                  Claim Application Transmitted
                </h4>
                <p className="text-xs text-[#6E6A61] mt-1 max-w-md mx-auto font-sans">
                  Your claim has been submitted to the District Industries Centre (DIC) and IPICOL Single Window. Scrutiny SLA is {scheme.slaDays} days under Odisha RTSA.
                </p>
              </div>

              <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 text-left font-mono-data space-y-2 max-w-md mx-auto">
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">TRACKING REF:</span>
                  <span className="font-bold text-[#18324A]">{submissionResult.application?.id}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">SCHEME:</span>
                  <span className="font-semibold text-[#171717]">{scheme.schemeName}</span>
                </div>
                <div className="flex justify-between pb-1.5 border-b border-[#D6D0C3]">
                  <span className="text-[#6E6A61]">CLAIMED BENEFIT:</span>
                  <span className="font-bold text-[#5D8068]">₹{claimAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">STATUTORY SLA:</span>
                  <span className="font-semibold text-[#171717]">{scheme.slaDays} Working Days</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <Link to={`/applications/${submissionResult.application?.id}`}>
                  <Button variant="primary" size="md" icon={ExternalLink}>
                    TRACK CLAIM DOSSIER
                  </Button>
                </Link>
                <Button variant="secondary" size="md" onClick={handleClose}>
                  CLOSE
                </Button>
              </div>
            </div>
          ) : step === 1 ? (
            /* STEP 1: CAPEX & CALCULATION */
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] border border-[#D6D0C3] rounded-[4px] p-4 space-y-3">
                <label className="block text-xs font-mono-data font-bold uppercase text-[#18324A]">
                  Verified Capital Investment in Plant & Machinery (INR)
                </label>
                <input
                  type="number"
                  value={capexAmount}
                  onChange={(e) => handleCapexChange(e.target.value)}
                  className="w-full h-11 px-3 bg-[#FAF8F2] border border-[#262522] rounded-[3px] font-mono-data text-sm font-bold text-[#171717] focus:outline-none focus:border-[#18324A]"
                  placeholder="Enter Plant & Machinery Capex"
                />
                <span className="text-[11px] text-[#6E6A61] block font-mono-data">
                  Rate Formula: {scheme.subsidyRate}
                </span>
              </div>

              <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 font-mono-data space-y-2">
                <span className="text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider block">
                  CALCULATED ENTITLEMENT ESTIMATION
                </span>
                <div className="flex justify-between text-[#171717]">
                  <span>Declared Plant Capex:</span>
                  <span>₹{capexAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-[#171717]">
                  <span>Statutory Maximum Cap:</span>
                  <span>₹{scheme.maxBenefitCap.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-[#262522] pt-2 flex justify-between font-bold text-sm text-[#5D8068]">
                  <span>ESTIMATED SUBSIDY ENTITLEMENT:</span>
                  <span>₹{claimAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>
          ) : step === 2 ? (
            /* STEP 2: DOCUMENTS AUDIT */
            <div className="space-y-3">
              <div>
                <span className="font-mono-data font-bold uppercase text-[#18324A] text-xs">
                  Mandatory Supporting Documents
                </span>
                <p className="text-xs text-[#6E6A61] mt-0.5">
                  The following certifications are required by the District Industries Centre for claim audit:
                </p>
              </div>

              <div className="space-y-2">
                {scheme.requiredDocuments.map((doc, idx) => (
                  <div
                    key={idx}
                    className="p-3 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[4px] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#18324A] shrink-0" />
                      <span className="font-semibold text-[#171717]">{doc}</span>
                    </div>
                    <span className="font-mono-data text-[10px] text-[#5D8068] font-bold uppercase shrink-0">
                      ✓ Ready in Vault
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* STEP 3: DECLARATION & SUBMISSION */
            <div className="space-y-4">
              <div className="bg-[#FFFFFF] border border-[#262522] rounded-[4px] p-4 font-mono-data space-y-2">
                <span className="text-[10px] font-bold text-[#18324A] uppercase tracking-wider block">
                  SUMMARY OF STATUTORY SUBSIDY CLAIM
                </span>
                <div className="grid grid-cols-2 gap-2 text-[#171717] pt-1">
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">SANCTIONING AUTHORITY:</span>
                    <span className="font-semibold">{scheme.authority}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">CLAIM AMOUNT:</span>
                    <span className="font-bold text-[#5D8068]">₹{claimAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">DISBURSEMENT ROUTE:</span>
                    <span className="font-semibold">PFMS Direct Benefit Transfer</span>
                  </div>
                  <div>
                    <span className="text-[#6E6A61] block text-[10px]">COMMITTED SLA:</span>
                    <span className="font-semibold">{scheme.slaDays} Working Days</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 bg-[#FAF8F2] border border-[#262522] rounded-[4px]">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-[#171717]">
                  <input
                    type="checkbox"
                    checked={declared}
                    onChange={(e) => setDeclared(e.target.checked)}
                    className="mt-0.5 rounded border-[#262522] text-[#18324A] focus:ring-[#18324A]"
                  />
                  <span>
                    I solemnly affirm that the capital equipment, plant assets, and tax filings cited are genuine, currently installed at our registered factory site, and have not been used to claim duplicate subsidies under any other state or central government scheme.
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
              <Button variant="secondary" size="sm" onClick={handleClose}>
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
                NEXT STEP
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={Coins}
                disabled={!declared || isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'TRANSMITTING CLAIM...' : 'TRANSMIT SUBSIDY CLAIM'}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
