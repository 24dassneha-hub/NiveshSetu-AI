import React from 'react';
import {
  ArrowUpRight,
  Clock,
  FileCheck,
  Calendar,
} from 'lucide-react';
import Button from '../ui/Button';
import StatusBadge from '../ui/StatusBadge';

export default function Hero({ onBuildRoadmap, onExplorePlatform }) {
  return (

    <section className="bg-[#F3EFE5] border-b border-[#262522]">
      {/* Outer container with editorial frame */}
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Top editorial dispatch ticker (matching the reference's numbered top row) */}
        <div className="grid grid-cols-1 md:grid-cols-3 border-b border-[#262522] bg-[#FAF8F2] divide-y md:divide-y-0 md:divide-x divide-[#262522]">
          <div className="p-3.5 sm:p-4 flex gap-3 items-start">
            <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-1.5 py-0.5 rounded-[2px] leading-none">
              01
            </span>
            <div>
              <p className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Comprehensive Regulatory Engine
              </p>
              <p className="text-[11px] text-[#6E6A61] mt-0.5 font-mono-data">
                48 Central & State Acts indexed across manufacturing & service sectors
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 flex gap-3 items-start">
            <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-1.5 py-0.5 rounded-[2px] leading-none">
              02
            </span>
            <div>
              <p className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Synchronized Parallel Scrutiny
              </p>
              <p className="text-[11px] text-[#6E6A61] mt-0.5 font-mono-data">
                Average total clearance time compressed from 114 to 38 working days
              </p>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 flex gap-3 items-start">
            <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-1.5 py-0.5 rounded-[2px] leading-none">
              03
            </span>
            <div>
              <p className="text-xs font-semibold text-[#171717] uppercase tracking-wider">
                Pre-Validated Filing Assurance
              </p>
              <p className="text-[11px] text-[#6E6A61] mt-0.5 font-mono-data">
                Zero document-defect rejections before formal departmental receipt
              </p>
            </div>
          </div>
        </div>

        {/* Main Editorial Hero Block */}
        <div className="p-6 sm:p-10 lg:p-14 border-b border-[#262522]">
          <div className="max-w-4xl">
            {/* Category label */}
            <div className="hero-enter-label inline-flex items-center gap-2 px-2.5 py-1 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[3px] mb-5">
              <span className="w-1.5 h-1.5 bg-[#18324A] rounded-full"></span>
              <span className="meta-label text-[#18324A] text-[10px]">
                BUSINESS APPROVAL & COMPLIANCE PLATFORM
              </span>
            </div>

            {/* Massive Editorial Headline */}
            <h1 className="hero-enter-headline text-3xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-[#171717] leading-[1.08] sm:leading-[1.05] mb-5">
              Every approval.
              <br />
              <span className="text-[#30302D]">One clear path.</span>
            </h1>

            {/* Supporting description text - Crisp 1-2 sentence maximum */}
            <p className="hero-enter-desc text-base sm:text-lg text-[#6E6A61] max-w-2xl leading-relaxed mb-8">
              Know what approvals you need, pre-validate required documents, and track multi-agency clearances from a single unified workspace.
            </p>

            {/* CTA Buttons */}
            <div className="hero-enter-cta flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 flex-wrap">
              <Button
                variant="primary"
                size="lg"
                icon={ArrowUpRight}
                iconPosition="right"
                onClick={onBuildRoadmap}
                className="w-full sm:w-auto btn-editorial-hover"
              >
                Build My Approval Roadmap
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={onExplorePlatform}
                className="w-full sm:w-auto btn-editorial-hover"
              >
                Explore the Platform
              </Button>
            </div>

            {/* Micro metadata footer */}
            <div className="mt-8 pt-4 border-t border-[#D6D0C3] flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-mono-data text-[#6E6A61]">
              <span>JURISDICTION: INDIA / STATE SINGLE-WINDOW SYSTEM</span>
              <span className="hidden sm:inline">•</span>
              <span>STATUTORY SERVICE-LEVEL TIMELINES ENFORCED</span>
              <span className="hidden sm:inline">•</span>
              <span>NO LOGIN REQUIRED FOR CHECKLIST</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* PRODUCT PREVIEW: Miniature NiveshSetu Dashboard (The Hero Visual) */}
        {/* ========================================================================= */}
        <div className="hero-enter-visual p-3 sm:p-6 lg:p-8 bg-[#E9E1D0]">
          <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_12px_40px_rgba(23,23,23,0.08)] overflow-hidden">
            {/* Top Workspace Header Bar */}
            <div className="px-3 sm:px-5 py-2.5 sm:py-3 bg-[#FAF8F2] border-b border-[#262522] flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <div className="flex gap-1.5 shrink-0" aria-hidden="true">
                  <span className="w-2.5 h-2.5 rounded-full border border-[#262522]/50 bg-[#FAF8F2] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full border border-[#262522]/50 bg-[#FAF8F2] inline-block"></span>
                  <span className="w-2.5 h-2.5 rounded-full border border-[#262522]/50 bg-[#FAF8F2] inline-block"></span>
                </div>
                <div className="h-4 w-px bg-[#D6D0C3] shrink-0"></div>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="font-bold text-xs text-[#18324A] truncate">Utkal Agro-Tech Ltd.</span>
                  <span className="text-[10px] font-mono-data text-[#6E6A61] px-1.5 py-0.5 bg-[#E9E1D0] rounded-[2px] shrink-0">
                    Industrial Unit • Odisha
                  </span>
                </div>
              </div>

              {/* Clean progress indicator */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="hidden sm:block w-24 h-1.5 bg-[#E9E1D0] rounded-full overflow-hidden border border-[#D6D0C3]">
                  <div className="h-full bg-[#18324A] rounded-full" style={{ width: '64%' }}></div>
                </div>
                <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                  64% COMPLETE
                </span>
              </div>
            </div>

            {/* Dashboard Subheader & Top Metrics */}
            <div className="p-4 sm:p-6 border-b border-[#262522] bg-[#F3EFE5]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight">
                    Good morning, Omm
                  </h2>
                  <p className="text-xs sm:text-sm text-[#6E6A61] mt-0.5">
                    2 approvals require your attention today to keep the project on schedule.
                  </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#18324A] self-start sm:self-auto shrink-0">
                  <span className="w-2 h-2 rounded-full bg-[#5D8068]"></span>
                  <span>Phase: Construction & Consents</span>
                </div>
              </div>

              {/* Top 4 Metric Blocks - Balanced & Decluttered */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-[#FAF8F2] border border-[#262522] p-3.5 rounded-[3px] flex flex-col justify-between">
                  <div className="font-mono-data text-2xl sm:text-3xl font-bold text-[#171717]">12</div>
                  <div className="text-xs font-medium text-[#6E6A61] uppercase tracking-wider mt-1.5">
                    Total Approvals
                  </div>
                </div>

                <div className="bg-[#FAF8F2] border border-[#262522] p-3.5 rounded-[3px] flex flex-col justify-between">
                  <div className="font-mono-data text-2xl sm:text-3xl font-bold text-[#5D8068] flex items-center justify-between">
                    <span>07</span>
                    <span className="text-xs font-sans font-semibold px-1.5 py-0.5 bg-[rgba(93,128,104,0.12)] rounded text-[#5D8068]">
                      58%
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#6E6A61] uppercase tracking-wider mt-1.5">
                    Granted & Clear
                  </div>
                </div>

                <div className="bg-[#FAF8F2] border border-[#262522] p-3.5 rounded-[3px] flex flex-col justify-between">
                  <div className="font-mono-data text-2xl sm:text-3xl font-bold text-[#C08A3E] flex items-center justify-between">
                    <span>03</span>
                    <span className="text-xs font-sans font-semibold px-1.5 py-0.5 bg-[rgba(192,138,62,0.12)] rounded text-[#C08A3E]">
                      In SLA
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#6E6A61] uppercase tracking-wider mt-1.5">
                    Under Scrutiny
                  </div>
                </div>

                <div className="bg-[#FAF8F2] border border-[#B85C4A] p-3.5 rounded-[3px] flex flex-col justify-between bg-red-50/15">
                  <div className="font-mono-data text-2xl sm:text-3xl font-bold text-[#B85C4A] flex items-center justify-between">
                    <span>02</span>
                    <span className="text-xs font-sans font-semibold px-1.5 py-0.5 bg-[rgba(184,92,74,0.15)] rounded text-[#B85C4A]">
                      Action Due
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#B85C4A] uppercase tracking-wider mt-1.5">
                    Action Needed
                  </div>
                </div>
              </div>
            </div>

            {/* Miniature Dashboard Content: Aligned Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#262522]">
              {/* Left Column: The Roadmap Timeline (8 cols) */}
              <div className="lg:col-span-8 p-4 sm:p-6 bg-[#FAF8F2]">
                <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#D6D0C3]">
                  <div>
                    <span className="meta-label text-[10px] text-[#6E6A61]">CLEARANCE PATHWAY</span>
                    <h3 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight mt-0.5">
                      Statutory Clearance & Dependency Chain
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono-data text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3]">
                    Stage 3 of 5
                  </span>
                </div>

                {/* Connected Vertical Stepper - Aligned & Clean */}
                <div className="relative pl-6 sm:pl-7 space-y-3">
                  {/* Subtle continuous vertical guide line */}
                  <div className="absolute left-2.5 sm:left-3 top-3 bottom-3 w-px bg-[#D6D0C3]" aria-hidden="true" />

                  {/* Step 1: GST (Approved) */}
                  <div className="relative group">
                    <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full bg-[rgba(93,128,104,0.15)] border border-[#5D8068] text-[#5D8068] flex items-center justify-center font-bold text-[10px] z-10">
                      ✓
                    </div>
                    <div className="border border-[#D6D0C3] hover:border-[#262522] bg-[#FFFFFF] p-3 sm:p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors">
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#171717]">GST Registration</h4>
                        <p className="text-[11px] text-[#6E6A61] mt-0.5">Commercial Tax Authority</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-mono-data text-[#5D8068]">Cleared in 2 days</span>
                        <StatusBadge status="approved" label="Approved" />
                      </div>
                    </div>
                  </div>

                  {/* Step 2: Factory License (Approved) */}
                  <div className="relative group">
                    <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full bg-[rgba(93,128,104,0.15)] border border-[#5D8068] text-[#5D8068] flex items-center justify-center font-bold text-[10px] z-10">
                      ✓
                    </div>
                    <div className="border border-[#D6D0C3] hover:border-[#262522] bg-[#FFFFFF] p-3 sm:p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-colors">
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#171717]">Factory Plan & Machine Layout</h4>
                        <p className="text-[11px] text-[#6E6A61] mt-0.5">Directorate of Factories & Boilers</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-mono-data text-[#5D8068]">Approved 02 Sep</span>
                        <StatusBadge status="approved" label="Approved" />
                      </div>
                    </div>
                  </div>

                  {/* Step 3: Consent to Establish (In Review) */}
                  <div className="relative group">
                    <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full bg-[rgba(192,138,62,0.2)] border border-[#C08A3E] text-[#C08A3E] flex items-center justify-center font-bold text-[10px] z-10">
                      ●
                    </div>
                    <div className="border border-[#C08A3E] bg-[#FFFFFF] p-3 sm:p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#171717]">
                          Consent to Establish (CTE — Orange Category)
                        </h4>
                        <p className="text-[11px] text-[#6E6A61] mt-0.5">Odisha State Pollution Control Board</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-mono-data text-[#C08A3E] font-medium">4 days remaining</span>
                        <StatusBadge status="in_review" label="In Review" />
                      </div>
                    </div>
                  </div>

                  {/* Step 4: Fire Safety NOC (Action Required) */}
                  <div className="relative group">
                    <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full bg-[rgba(184,92,74,0.2)] border border-[#B85C4A] text-[#B85C4A] flex items-center justify-center font-bold text-[10px] z-10">
                      !
                    </div>
                    <div className="border border-[#B85C4A] bg-red-50/15 p-3 sm:p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 shadow-sm">
                      <div>
                        <h4 className="font-semibold text-xs sm:text-sm text-[#171717]">
                          Fire Safety Recommendation Certificate
                        </h4>
                        <p className="text-[11px] text-[#B85C4A] mt-0.5">Upload marked evacuation blueprint</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-mono-data text-[#B85C4A] font-medium">Due in 24h</span>
                        <StatusBadge status="action_required" label="Action Required" />
                      </div>
                    </div>
                  </div>

                  {/* Step 5: Final Commercial Clearance (Not Started) */}
                  <div className="relative group">
                    <div className="absolute -left-6 sm:-left-7 top-3 w-5 h-5 rounded-full bg-[#FAF8F2] border border-[#8B8982] text-[#8B8982] flex items-center justify-center font-bold text-[10px] z-10">
                      ○
                    </div>
                    <div className="border border-[#D6D0C3] bg-[#FAF8F2] opacity-80 p-3 sm:p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div>
                        <h4 className="font-medium text-xs sm:text-sm text-[#30302D]">Consolidated Operating License (CTO)</h4>
                        <p className="text-[11px] text-[#6E6A61] mt-0.5">Single Window Clearance Committee</p>
                      </div>
                      <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
                        <span className="text-[11px] font-mono-data text-[#6E6A61]">Upcoming Phase</span>
                        <StatusBadge status="not_started" label="Not Started" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Critical Actions (4 cols) */}
              <div className="lg:col-span-4 p-4 sm:p-6 bg-[#FAF8F2] flex flex-col justify-between gap-6">
                <div>
                  <div className="flex items-center justify-between pb-3.5 mb-5 border-b border-[#D6D0C3]">
                    <span className="meta-label text-[10px] text-[#6E6A61]">CRITICAL ACTIONS</span>
                    <span className="font-mono-data text-[10px] font-bold text-[#B85C4A] bg-red-50 px-2 py-0.5 rounded border border-[#B85C4A]/30">
                      2 PENDING
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* Action Item 1 */}
                    <div className="border-l-3 border-l-[#B85C4A] border border-[#D6D0C3] bg-[#FFFFFF] p-3.5 rounded-[3px]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono-data text-[10px] text-[#B85C4A] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          <span>48H DEADLINE</span>
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs text-[#171717] mb-1">
                        Upload Water Balance Diagram
                      </h5>
                      <p className="text-[11px] text-[#6E6A61] leading-relaxed mb-3">
                        OSPCB requested revised effluent discharge calculations for Phase 1.
                      </p>
                      <button
                        onClick={onBuildRoadmap}
                        className="w-full text-center py-2 bg-[#18324A] text-[#FAF8F2] text-xs font-medium rounded-[3px] hover:bg-[#234563] active:scale-[0.98] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
                      >
                        Open Validation Panel
                      </button>
                    </div>

                    {/* Action Item 2 */}
                    <div className="border-l-3 border-l-[#C08A3E] border border-[#D6D0C3] bg-[#FFFFFF] p-3.5 rounded-[3px]">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono-data text-[10px] text-[#C08A3E] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>JOINT INSPECTION</span>
                        </span>
                      </div>
                      <h5 className="font-semibold text-xs text-[#171717] mb-1">
                        Factory Site Joint Inspection
                      </h5>
                      <p className="text-[11px] text-[#6E6A61] leading-relaxed">
                        Confirmed for <strong>14 Sep 2026, 11:00 AM</strong> with Labour & Fire inspectors.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bottom Trust Note - Clean, low-profile, and avoids floating widget collision */}
                <div className="pt-2 border-t border-[#D6D0C3] flex items-center gap-2 text-[11px] text-[#6E6A61] font-mono-data">
                  <FileCheck className="w-3.5 h-3.5 text-[#5D8068] shrink-0" />
                  <span>Verified with Odisha Single Window (Go-Swift)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
