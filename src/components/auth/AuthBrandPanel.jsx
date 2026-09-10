import React from 'react';
import { Link } from '../../router';

export default function AuthBrandPanel() {
  const roadmapItems = [
    {
      symbol: '✓',
      label: 'GST REGISTRATION',
      color: '#5D8068',
      meta: 'Commercial Tax Authority',
    },
    {
      symbol: '✓',
      label: 'FACTORY LICENSE',
      color: '#5D8068',
      meta: 'Factories & Boilers',
    },
    {
      symbol: '●',
      label: 'POLLUTION CONSENT',
      color: '#C08A3E',
      meta: 'Consent to Establish (CTE)',
    },
    {
      symbol: '!',
      label: 'FIRE NOC',
      color: '#B85C4A',
      meta: 'Fire Safety Recommendation',
    },
    {
      symbol: '○',
      label: 'LABOUR APPROVAL',
      color: '#8B8982',
      meta: 'Contract Labour Act',
    },
  ];

  return (
    <div className="h-full flex flex-col justify-between p-8 sm:p-12 bg-[#F3EFE5]">
      {/* Top Brand Block */}
      <div>
        {/* Logo / Wordmark identical to Feature 1 */}
        <Link to="/" className="inline-flex items-center gap-3 group mb-8">
          <div className="w-9 h-9 bg-[#18324A] text-[#FAF8F2] rounded-[4px] flex items-center justify-center font-mono-data font-bold text-base border border-[#18324A] group-hover:bg-[#234563] transition-colors">
            NS
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-bold text-lg tracking-tight text-[#171717] leading-none">
              NIVESHSETU <span className="font-mono-data text-xs font-semibold px-1.5 py-0.5 bg-[#E9E1D0] rounded-[3px] ml-1 text-[#18324A]">AI</span>
            </span>
            <span className="meta-label text-[9px] tracking-widest text-[#6E6A61] mt-1">
              Approval & Compliance Intelligence
            </span>
          </div>
        </Link>

        {/* Category Label */}
        <div className="text-[12px] font-semibold tracking-[0.12em] uppercase text-[#6E6A61] mb-3 font-mono-data">
          BUSINESS APPROVAL & COMPLIANCE PLATFORM
        </div>

        {/* Main Statement */}
        <h2 className="text-[clamp(38px,3.8vw,60px)] font-bold text-[#171717] tracking-tight leading-[1.02] max-w-[480px] mb-4">
          Every approval.
          <br />
          <span className="text-[#30302D]">One clear path.</span>
        </h2>

        {/* Narrative Description */}
        <p className="text-base text-[#6E6A61] leading-[1.6] max-w-[420px]">
          Discover what your business needs, prepare the right documents, and track every approval from one workspace.
        </p>
      </div>

      {/* Middle/Bottom: Approval Roadmap Preview (at ~65-70%) */}
      <div className="mt-10 pt-8 border-t border-[#D6D0C3]">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#262522]">
          <span className="text-xs font-mono-data font-bold uppercase tracking-[0.08em] text-[#171717]">
            YOUR APPROVAL ROADMAP
          </span>
          <span className="text-[11px] font-mono-data text-[#6E6A61]">
            STATUTORY PIPELINE
          </span>
        </div>

        {/* Structured List with 1px bottom separators (no rounded cards) */}
        <div className="divide-y divide-[#D6D0C3] font-mono-data text-xs">
          {roadmapItems.map((item, index) => (
            <div
              key={index}
              className="py-2.5 flex items-center justify-between transition-colors hover:bg-[#E9E1D0]/40 px-1"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="font-bold text-[13px] w-4 text-center leading-none select-none"
                  style={{ color: item.color }}
                >
                  {item.symbol}
                </span>
                <span className="font-semibold tracking-wider text-[#171717] text-[11px]">
                  {item.label}
                </span>
              </div>
              <span className="text-[10px] text-[#6E6A61]">
                {item.meta}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Metadata */}
        <div className="mt-8 pt-4 border-t border-[#D6D0C3] flex items-center justify-between text-[11px] font-mono-data text-[#6E6A61]">
          <span className="font-semibold text-[#18324A]">01 / 05</span>
          <span className="uppercase tracking-widest text-[10px]">
            PERSONALIZED APPROVAL WORKFLOW
          </span>
        </div>
      </div>
    </div>
  );
}
