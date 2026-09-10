import React from 'react';

export default function ComplianceSnapshot({ compliance }) {
  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="pb-3 mb-2 border-b border-[#262522] flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight uppercase">
          COMPLIANCE SNAPSHOT
        </h2>
        <span className="text-[10px] font-mono-data text-[#5D8068] font-bold bg-[#E9E1D0] px-1.5 py-0.5 rounded-[2px] border border-[#D6D0C3]">
          ON TRACK
        </span>
      </div>

      {/* Main Score & Summary */}
      <div className="my-2">
        <div className="flex items-baseline gap-3">
          <span className="font-mono-data font-bold text-4xl sm:text-5xl text-[#18324A] tracking-tight">
            {compliance.percentage}%
          </span>
          <span className="font-mono-data text-xs text-[#5D8068] font-semibold">
            ✓ HEALTHY
          </span>
        </div>
        <p className="text-xs sm:text-sm font-sans text-[#6E6A61] mt-1">
          {compliance.summary}
        </p>
      </div>

      {/* Segmented Horizontal Progress Bar (NO circular charts per Rule 25) */}
      <div className="mt-4 pt-3 border-t border-[#D6D0C3] space-y-3">
        <div className="w-full h-2.5 bg-[#E9E1D0] rounded-[2px] overflow-hidden flex border border-[#262522]/40">
          {/* Completed Segment */}
          <div
            className="h-full bg-[#5D8068] transition-all duration-300"
            style={{ width: `${compliance.breakdown.completed}%` }}
            title={`Completed: ${compliance.breakdown.completed}%`}
          />
          {/* In Review Segment */}
          <div
            className="h-full bg-[#C08A3E] transition-all duration-300"
            style={{ width: `${compliance.breakdown.inReview}%` }}
            title={`In Review: ${compliance.breakdown.inReview}%`}
          />
          {/* Action Required Segment */}
          <div
            className="h-full bg-[#B85C4A] transition-all duration-300"
            style={{ width: `${compliance.breakdown.actionRequired}%` }}
            title={`Action Required: ${compliance.breakdown.actionRequired}%`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono-data text-[#30302D]">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#5D8068]" />
            <span>Completed ({compliance.counts?.completed ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#C08A3E]" />
            <span>In Review ({compliance.counts?.inReview ?? 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B85C4A]" />
            <span>Action ({compliance.counts?.actionRequired ?? 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
