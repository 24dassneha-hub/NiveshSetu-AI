import React from 'react';

export default function UpcomingDeadlines({ deadlines }) {
  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'action_required':
        return { color: '#B85C4A', bg: 'rgba(184, 92, 74, 0.12)' };
      case 'due_soon':
        return { color: '#C08A3E', bg: 'rgba(192, 138, 62, 0.12)' };
      case 'in_review':
        return { color: '#5E7D91', bg: 'rgba(94, 125, 145, 0.12)' };
      default:
        return { color: '#8B8982', bg: 'rgba(139, 137, 130, 0.12)' };
    }
  };

  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="pb-3 mb-3 border-b border-[#262522] flex items-center justify-between">
        <h2 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight uppercase">
          UPCOMING DEADLINES
        </h2>
        <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase">
          {deadlines.length} SCHEDULED
        </span>
      </div>

      {deadlines.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <p className="text-xs text-[#6E6A61] font-sans max-w-xs mx-auto">
            No upcoming deadlines recorded. Add clearances with expiry dates to track countdowns.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop Table View (>= sm) */}
          <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#262522] text-[#6E6A61] font-mono-data text-[10px] uppercase tracking-wider">
              <th className="pb-2 font-semibold">DATE</th>
              <th className="pb-2 font-semibold">ITEM</th>
              <th className="pb-2 font-semibold">TYPE</th>
              <th className="pb-2 font-semibold text-right">STATUS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#D6D0C3] font-mono-data text-xs">
            {deadlines.map((row) => {
              const badge = getStatusBadgeStyle(row.status);
              return (
                <tr key={row.id} className="hover:bg-[#E9E1D0]/50 transition-colors">
                  <td className="py-3 font-bold text-[#171717] whitespace-nowrap">
                    {row.date}
                  </td>
                  <td className="py-3 font-sans font-semibold text-[#30302D]">
                    {row.item}
                  </td>
                  <td className="py-3 text-[#6E6A61] text-[11px]">
                    {row.type}
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <span
                      className="px-1.5 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider inline-block"
                      style={{ color: badge.color, backgroundColor: badge.bg }}
                    >
                      {row.statusLabel}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Row View (< sm) */}
      <div className="sm:hidden divide-y divide-[#D6D0C3]">
        {deadlines.map((row) => {
          const badge = getStatusBadgeStyle(row.status);
          return (
            <div key={row.id} className="py-2.5 flex items-center justify-between gap-2">
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono-data font-bold text-xs text-[#171717]">
                    {row.date}
                  </span>
                  <span className="text-[#D6D0C3]">·</span>
                  <span className="text-[10px] font-mono-data text-[#6E6A61]">
                    {row.type}
                  </span>
                </div>
                <span className="font-sans font-semibold text-xs text-[#30302D] truncate mt-0.5">
                  {row.item}
                </span>
              </div>
              <span
                className="px-1.5 py-0.5 rounded-[2px] text-[9px] font-mono-data font-bold uppercase tracking-wider shrink-0"
                style={{ color: badge.color, backgroundColor: badge.bg }}
              >
                {row.statusLabel}
              </span>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
