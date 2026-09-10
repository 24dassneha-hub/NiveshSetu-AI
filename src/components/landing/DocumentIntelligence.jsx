import React from 'react';
import { Upload, FileText } from 'lucide-react';
import Button from '../ui/Button';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function DocumentIntelligence({ onTryValidation }) {
  const sectionRef = useScrollReveal();

  return (
    <section id="document-intelligence" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Section Title Header */}
        <div className="reveal-init p-6 sm:p-10 border-b border-[#262522] bg-[#FAF8F2] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                SECTION 04
              </span>
              <span className="meta-label text-[#6E6A61]">PRE-SUBMISSION AUDIT</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
              Document Intelligence
            </h2>
          </div>
          <p className="text-sm text-[#6E6A61] max-w-md font-mono-data">
            Pre-validate blueprints, deeds, and statutory declarations before submission to prevent procedural rejections.
          </p>
        </div>

        {/* 2-Column Split View: Document Preview (Left) + AI Pre-Check Audit (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#262522]">
          {/* Left Column: Simulated PDF / Blueprint Viewer (7 cols) */}
          <div className="reveal-init lg:col-span-7 p-4 sm:p-8 bg-[#E9E1D0]">
            <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] overflow-hidden shadow-[0_8px_24px_rgba(23,23,23,0.06)]">
              {/* Document toolbar */}
              <div className="px-3 sm:px-4 py-2.5 bg-[#FAF8F2] border-b border-[#262522] flex flex-wrap items-center justify-between gap-2 text-xs font-mono-data text-[#30302D]">
                <div className="flex items-center gap-2 min-w-0">
                  <FileText className="w-4 h-4 text-[#18324A] shrink-0" />
                  <span className="font-semibold text-[#171717] truncate">
                    Factory_Layout_Plan_Sheet03.pdf
                  </span>
                  <span className="text-[#6E6A61] hidden sm:inline shrink-0">(3.4 MB • 300 DPI)</span>
                </div>
                <div className="flex items-center gap-3 shrink-0 text-[11px]">
                  <span className="text-[#5D8068] font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#5D8068]"></span>
                    OCR VERIFIED
                  </span>
                  <span className="text-[#D6D0C3]">|</span>
                  <span>PAGE 3 OF 6</span>
                </div>
              </div>

              {/* Simulated Document Canvas with Technical Schematics & Overlays */}
              <div className="p-4 sm:p-8 bg-[#FAF8F2] font-mono-data text-xs space-y-5 sm:space-y-6 select-none relative">
                {/* Government Header Stamp on doc */}
                <div className="border-b border-[#262522] pb-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div>
                    <div className="text-[10px] text-[#6E6A61] uppercase">FORM 1B ANNEXURE SCHEDULE</div>
                    <div className="font-bold text-sm text-[#171717]">
                      DIRECTORATE OF FACTORIES & BOILERS
                    </div>
                    <div className="text-[11px] text-[#6E6A61]">
                      Industrial Building Plan & Machinery Installation Blueprint
                    </div>
                  </div>
                  <div className="text-left sm:text-right border border-[#262522] p-1.5 px-2 bg-[#FFFFFF] self-start">
                    <div className="text-[9px] text-[#6E6A61]">REVENUE PLOT</div>
                    <div className="font-bold text-xs text-[#18324A]">KHATA 104 / PLOT 882</div>
                  </div>
                </div>

                {/* Simulated blueprint wireframe boxes with annotations */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 min-h-[13rem]">
                  {/* Schematic section 1 */}
                  <div className="border border-dashed border-[#262522] p-3 flex flex-col justify-between bg-[#FFFFFF] relative group">
                    <div className="text-[10px] font-semibold text-[#18324A] flex items-center justify-between mb-2">
                      <span>ZONE A: PROCESSING BAY</span>
                      <span className="text-[#5D8068] text-[9px] border border-[#5D8068] px-1 rounded-[2px] shrink-0">
                        ✓ NBC COMPLIANT
                      </span>
                    </div>
                    <div className="space-y-1 text-[10px] text-[#6E6A61]">
                      <div>Clearance height: 6.20m</div>
                      <div>Exhaust manifold: 4 x 7.5 kW</div>
                      <div>Aisle width: 2.80m (Statutory min: 2.0m)</div>
                    </div>
                    <div className="text-[9px] text-[#5D8068] pt-2 mt-2 border-t border-[#D6D0C3]">
                      ✓ Spatial clearance verified
                    </div>
                  </div>

                  {/* Schematic section 2 with DEFECT HIGHLIGHT */}
                  <div className="border-2 border-[#B85C4A] p-3 flex flex-col justify-between bg-red-50/20 relative">
                    <div className="text-[10px] font-semibold text-[#B85C4A] flex items-center justify-between mb-2">
                      <span>ZONE B: STRUCTURAL ATTESTATION</span>
                      <span className="text-[#B85C4A] text-[9px] font-bold bg-[rgba(184,92,74,0.15)] px-1 rounded-[2px] shrink-0">
                        ! DEFECT
                      </span>
                    </div>
                    <div className="border border-dashed border-[#B85C4A] bg-[#FFFFFF] p-2 text-center my-auto">
                      <span className="text-[10px] text-[#B85C4A] font-bold block leading-tight">
                        MISSING STRUCTURAL ENGINEER SEAL
                      </span>
                      <span className="text-[9px] text-[#6E6A61] block mt-0.5 leading-tight">
                        Section 6(1)(a) requires Chartered Engineer Signature
                      </span>
                    </div>
                    <div className="text-[9px] text-[#B85C4A] font-semibold pt-1 mt-2">
                      ! Flagged during pre-submission parse
                    </div>
                  </div>
                </div>

                {/* Document Metadata Table at bottom of page */}
                <div className="border border-[#262522] text-[10px] grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[#262522] bg-[#FFFFFF]">
                  <div className="p-2">
                    <span className="text-[#6E6A61] block text-[9px]">APPLICANT ENTITY:</span>
                    <span className="font-bold text-[#171717]">UTKAL AGRO-TECH LTD.</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[#6E6A61] block text-[9px]">INDUSTRIAL ESTATE:</span>
                    <span className="font-bold text-[#171717]">CHOUDWAR PHASE II</span>
                  </div>
                  <div className="p-2">
                    <span className="text-[#6E6A61] block text-[9px]">POLLUTION CATEGORY:</span>
                    <span className="font-bold text-[#C08A3E]">ORANGE (FOOD PROC.)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: AI-Assisted Regulatory Pre-Check (5 cols) */}
          <div className="reveal-init lg:col-span-5 p-6 sm:p-8 bg-[#FAF8F2] flex flex-col justify-between">
            <div>
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6D0C3]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#18324A]"></span>
                  <span className="meta-label text-[#18324A]">
                    AI-ASSISTED RECOMMENDATION
                  </span>
                </div>
                <span className="font-mono-data text-xs text-[#6E6A61]">
                  ENGINE V3.4
                </span>
              </div>

              <h3 className="text-xl font-bold text-[#171717] tracking-tight mb-2">
                Automated Regulatory Pre-Check
              </h3>
              <p className="text-xs text-[#6E6A61] mb-5 font-mono-data">
                Rule evaluation against statutory Factories Rules and National Building Code.
              </p>

              {/* Checklist Items */}
              <div className="space-y-2.5 mb-6">
                <div className="p-3 border border-[#D6D0C3] rounded-[3px] bg-[#FFFFFF] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[rgba(93,128,104,0.15)] text-[#5D8068] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#171717]">
                      Document Resolution & Legibility
                    </div>
                    <div className="text-[11px] text-[#6E6A61] font-mono-data mt-0.5">
                      300 DPI detected; OCR confidence score 99.4% on all text layers.
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-[#D6D0C3] rounded-[3px] bg-[#FFFFFF] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[rgba(93,128,104,0.15)] text-[#5D8068] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#171717]">
                      Entity Name & Tax Profile Match
                    </div>
                    <div className="text-[11px] text-[#6E6A61] font-mono-data mt-0.5">
                      Matches GSTIN and PAN registration exactly.
                    </div>
                  </div>
                </div>

                <div className="p-3 border border-[#D6D0C3] rounded-[3px] bg-[#FFFFFF] flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[rgba(93,128,104,0.15)] text-[#5D8068] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    ✓
                  </span>
                  <div>
                    <div className="text-xs font-semibold text-[#171717]">
                      Plot Boundary Deed Verified
                    </div>
                    <div className="text-[11px] text-[#6E6A61] font-mono-data mt-0.5">
                      Plot 882 coordinates align with infrastructure boundary deed.
                    </div>
                  </div>
                </div>

                {/* Defect Item */}
                <div className="p-3 border-2 border-[#B85C4A] rounded-[3px] bg-red-50/20 flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-[rgba(184,92,74,0.2)] text-[#B85C4A] flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    !
                  </span>
                  <div>
                    <div className="text-xs font-bold text-[#B85C4A]">
                      Signature & Seal Missing on Sheet 03
                    </div>
                    <div className="text-[11px] text-[#30302D] mt-0.5 font-mono-data">
                      Section 6(1)(a) requires Chartered Structural Engineer seal on foundation schedule.
                    </div>
                  </div>
                </div>
              </div>

              {/* Issues Found Summary Box */}
              <div className="p-4 bg-[#FFFFFF] border border-[#262522] rounded-[3px] mb-6">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#D6D0C3]">
                  <span className="text-xs font-mono-data font-bold text-[#171717] uppercase">
                    ISSUES DETECTED:
                  </span>
                  <span className="text-xs font-mono-data font-bold text-[#B85C4A]">
                    1 DEFECT
                  </span>
                </div>
                <p className="text-xs text-[#6E6A61] leading-relaxed">
                  Submitting now would trigger a query memo and 14 days of delay. Fix sheet 03 before submission.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-[#D6D0C3] flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="md"
                className="flex-1 justify-center btn-editorial-hover"
                icon={Upload}
                onClick={onTryValidation}
              >
                Upload Fixed Sheet 03
              </Button>
              <Button
                variant="secondary"
                size="md"
                className="flex-1 justify-center btn-editorial-hover"
                onClick={onTryValidation}
              >
                Download Defect Memo
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
