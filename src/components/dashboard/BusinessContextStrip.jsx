import React from 'react';
import { Link } from '../../router';
import { Edit3 } from 'lucide-react';

export default function BusinessContextStrip({ business }) {
  const isConfigured = Boolean(business?.name && business?.name !== '—');

  const infoGroups = [
    {
      label: 'BUSINESS',
      value: business?.name || 'Not Configured',
      isPlaceholder: !isConfigured,
    },
    {
      label: 'PROJECT / SECTOR',
      value: business?.project || business?.sector || (isConfigured ? '—' : 'Not Specified'),
      isPlaceholder: !isConfigured,
    },
    {
      label: 'LOCATION',
      value: business?.location || (isConfigured ? '—' : 'Not Specified'),
      isPlaceholder: !isConfigured,
    },
    {
      label: 'PROJECT VALUE',
      value: business?.projectValue || (isConfigured ? '—' : '₹0'),
      isPlaceholder: !isConfigured,
    },
    {
      label: 'EMPLOYEES',
      value: business?.employees ? `${business.employees}` : '0',
      isPlaceholder: !isConfigured,
    },
  ];

  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_4px_16px_rgba(23,23,23,0.03)] overflow-hidden">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-[#262522]">
        {infoGroups.map((group, idx) => (
          <div
            key={group.label}
            className={`p-4 flex flex-col justify-center min-h-[72px] sm:min-h-[88px] relative group ${
              idx === infoGroups.length - 1 ? 'col-span-2 sm:col-span-1' : ''
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="meta-label text-[10px] text-[#6E6A61] tracking-wider">
                {group.label}
              </span>
              {idx === 0 && (
                <Link
                  to="/business-profile"
                  className="text-[10px] font-mono-data font-semibold text-[#18324A] hover:underline flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-opacity"
                  title="Edit business parameters"
                >
                  <Edit3 className="w-2.5 h-2.5" />
                  <span>Edit</span>
                </Link>
              )}
            </div>

            {idx === 0 && !isConfigured ? (
              <Link
                to="/business-profile"
                className="font-sans font-bold text-sm sm:text-base text-[#18324A] hover:underline flex items-center gap-1 tracking-tight truncate"
              >
                <span>Click to Set Business Name →</span>
              </Link>
            ) : (
              <span
                className={`font-sans font-bold text-sm sm:text-base tracking-tight truncate ${
                  group.isPlaceholder ? 'text-[#6E6A61]/70' : 'text-[#171717]'
                }`}
              >
                {group.value}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
