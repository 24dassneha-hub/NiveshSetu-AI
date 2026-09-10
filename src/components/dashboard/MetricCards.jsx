import React from 'react';

export default function MetricCards({ metrics }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-4 sm:p-5 flex flex-col justify-between shadow-[0_4px_16px_rgba(23,23,23,0.03)] hover:border-[#18324A] transition-[border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)]"
        >
          {/* Header row: Label + Indicator dot */}
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#30302D]">
              {metric.label}
            </span>
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: metric.indicatorColor }}
              aria-hidden="true"
            />
          </div>

          {/* Main numeric value */}
          <div className="my-1">
            <span
              className="font-mono-data font-bold text-3xl sm:text-4xl tracking-tight"
              style={{ color: metric.id === 'total_approvals' ? '#171717' : metric.indicatorColor }}
            >
              {metric.value}
            </span>
          </div>

          {/* Supporting metadata line */}
          <div className="pt-2 border-t border-[#D6D0C3] mt-2">
            <span className="text-xs text-[#6E6A61] font-mono-data truncate block">
              {metric.supporting}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
