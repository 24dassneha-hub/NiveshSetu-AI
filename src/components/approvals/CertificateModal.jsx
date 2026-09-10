import React from 'react';
import { X, Printer, ShieldCheck, QrCode, Lock } from 'lucide-react';

export default function CertificateModal({ approval, onClose }) {
  if (!approval || !approval.certificate) return null;

  const cert = approval.certificate;
  const authority = approval.authority || {};
  const application = approval.application || {};

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-2xl bg-white border border-[#262522] rounded-[4px] shadow-2xl p-6 z-10 max-h-[90vh] overflow-y-auto space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262522]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#5D8068]" />
            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block">
                OFFICIAL STATUTORY RECORD
              </span>
              <h3 className="font-sans font-bold text-base text-[#171717]">
                {cert.name || `${approval.name} Certificate`}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6E6A61] hover:text-[#171717] rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype Watermark Warning */}
        <div className="p-2.5 bg-[#E9E1D0]/60 border border-[#D6D0C3] rounded-[3px] flex items-center justify-between text-xs font-mono-data text-[#18324A]">
          <span className="font-bold flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#C08A3E]" />
            DEMO CERTIFICATE • FOR PROTOTYPE / SIH EVALUATION PURPOSES ONLY
          </span>
          <span className="text-[10px] text-[#6E6A61]">NON-LEGAL ARTIFACT</span>
        </div>

        {/* Certificate Body (Clean Editorial Certificate) */}
        <div className="border-2 border-[#18324A] p-6 sm:p-8 rounded-[2px] bg-[#FAF8F2] space-y-6 relative overflow-hidden">
          {/* Subtle Watermark */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none select-none">
            <span className="text-7xl font-bold font-mono-data text-[#18324A] rotate-45">
              DEMO ONLY
            </span>
          </div>

          {/* Certificate Header */}
          <div className="text-center space-y-1.5 border-b border-[#D6D0C3] pb-4">
            <span className="font-mono-data text-[11px] font-bold tracking-widest text-[#6E6A61] uppercase block">
              GOVERNMENT OF ODISHA
            </span>
            <h2 className="font-sans font-bold text-lg sm:text-xl text-[#18324A] uppercase tracking-wide">
              {authority.name || 'DIRECTORATE OF STATUTORY CLEARANCES'}
            </h2>
            <p className="font-sans text-xs text-[#6E6A61]">
              {authority.department || 'Statutory Compliance & Single Window Portal'}
            </p>
          </div>

          {/* Certificate Title */}
          <div className="text-center space-y-1">
            <span className="font-mono-data text-[10px] font-bold text-[#5D8068] uppercase tracking-wider block">
              STATUTORY CLEARANCE GRANT
            </span>
            <h1 className="font-sans font-bold text-xl sm:text-2xl text-[#171717] tracking-tight">
              {approval.name}
            </h1>
          </div>

          {/* Certificate Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-white border border-[#D6D0C3] p-4 rounded-[3px]">
            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block font-bold">
                Certificate Number
              </span>
              <span className="font-mono-data font-bold text-sm text-[#18324A]">
                {cert.number || 'OD-STAT-2026-8812'}
              </span>
            </div>

            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block font-bold">
                Application Reference
              </span>
              <span className="font-mono-data font-bold text-sm text-[#171717]">
                {application.applicationId || 'FL-2026-00421'}
              </span>
            </div>

            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block font-bold">
                Date of Issue
              </span>
              <span className="font-bold text-[#171717]">{cert.issuedAt || '08 Sep 2026'}</span>
            </div>

            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block font-bold">
                Validity Period
              </span>
              <span className="font-bold text-[#5D8068]">{cert.validUntil || '31 Dec 2027'}</span>
            </div>

            <div className="col-span-2 pt-2 border-t border-[#F3EFE5]">
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase block font-bold">
                Grantee Business Unit
              </span>
              <span className="font-bold text-[#171717] block">
                Omm Enterprises — Agro-Processing Facility
              </span>
              <span className="text-[11px] text-[#6E6A61]">
                Plot 42/B, Chandaka Industrial Estate, Khordha, Odisha
              </span>
            </div>
          </div>

          {/* Certificate Footer Verification */}
          <div className="flex items-end justify-between pt-4 border-t border-[#D6D0C3] text-xs font-mono-data text-[#6E6A61]">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 bg-white border border-[#262522] rounded-[2px] flex items-center justify-center p-1">
                <QrCode className="w-12 h-12 text-[#18324A]" />
              </div>
              <div className="text-[10px] space-y-0.5">
                <span className="font-bold text-[#171717] block">DIGITALLY VERIFIED</span>
                <span>Portal: {approval.officialUrl || 'nsws.gov.in'}</span>
                <span>Tamper-evident checksum: 7f8a9...b4</span>
              </div>
            </div>

            <div className="text-right">
              <div className="w-24 h-0.5 bg-[#262522] ml-auto mb-1" />
              <span className="font-bold text-[11px] text-[#171717] block">Competent Authority</span>
              <span className="text-[9.5px]">Govt. of Odisha</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#FAF8F2] border border-[#262522] text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] text-xs font-mono-data font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print / Save Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
}
