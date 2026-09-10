import React from 'react';

export default function MetricBlock({
  value,
  label,
  subtext,
  variant = 'default',
  className = '',
}) {
  const variantStyles = {
    default: 'bg-[#FAF8F2] border-[#262522]',
    subtle: 'bg-[#E9E1D0] border-[#D6D0C3]',
    navy: 'bg-[#18324A] text-[#FAF8F2] border-[#18324A]',
    white: 'bg-[#FFFFFF] border-[#262522]',
  };

  const isNavy = variant === 'navy';

  return (
    <div
      className={`border rounded-[4px] p-4 flex flex-col justify-between transition-colors ${
        variantStyles[variant] || variantStyles.default
      } ${className}`}
    >
      <div className="flex items-baseline justify-between mb-1">
        <span
          className={`font-mono-data text-3xl md:text-4xl font-semibold tracking-tight ${
            isNavy ? 'text-[#FAF8F2]' : 'text-[#171717]'
          }`}
        >
          {value}
        </span>
      </div>
      <div>
        <p
          className={`text-xs font-semibold uppercase tracking-wider ${
            isNavy ? 'text-[#D6D0C3]' : 'text-[#30302D]'
          }`}
        >
          {label}
        </p>
        {subtext && (
          <p
            className={`text-[11px] mt-0.5 leading-tight ${
              isNavy ? 'text-[#5E7D91]' : 'text-[#6E6A61]'
            }`}
          >
            {subtext}
          </p>
        )}
      </div>
    </div>
  );
}
