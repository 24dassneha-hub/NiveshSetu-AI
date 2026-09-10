import React from 'react';

export default function RecentActivity({ activity }) {
  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="pb-3 mb-4 border-b border-[#262522] flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight uppercase">
          RECENT ACTIVITY
        </h2>
        <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase">
          AUDIT LOG
        </span>
      </div>

      {/* Timeline List */}
      {activity.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-[#6E6A61] font-sans max-w-xs mx-auto">
            No audit activities logged yet. As you create approvals and upload documents, audit trail records will log here automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-4 relative pl-4 border-l border-[#262522] ml-2 my-1">
          {activity.map((entry) => (
            <div key={entry.id} className="relative">
              {/* Dot marker on the border */}
              <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#FAF8F2] border-2 border-[#18324A]" />

              {/* Timestamp & Text */}
              <div className="flex flex-col">
                <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase tracking-wider">
                  {entry.timestamp}
                </span>
                <span className="font-sans font-semibold text-xs sm:text-sm text-[#171717] mt-0.5">
                  {entry.text}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
