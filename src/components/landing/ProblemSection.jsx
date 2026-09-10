import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function ProblemSection() {
  const sectionRef = useScrollReveal();

  const problems = [
    {
      number: '01',
      title: 'Too many approvals',
      subtitle: 'REGULATORY FRAGMENTATION',
      description:
        'Navigating dozens of disparate department portals with conflicting prerequisites for land, power, pollution, and factory setup leaves founders vulnerable to missed permissions.',
      metric: '32–46',
      metricLabel: 'Permits required for an average medium manufacturing unit',
      impact: 'Up to 9 months lost before plant construction',
      delayClass: 'reveal-delay-1',
    },
    {
      number: '02',
      title: 'Repetitive paperwork',
      subtitle: 'DOCUMENT REDUNDANCY',
      description:
        'Identical deeds, KYC, and architectural blueprints are uploaded repeatedly into isolated departmental silos with zero inter-agency data reuse.',
      metric: '68%',
      metricLabel: 'Of total uploaded documents are identical across departments',
      impact: 'High compliance overhead & document fatigue',
      delayClass: 'reveal-delay-2',
    },
    {
      number: '03',
      title: 'No unified visibility',
      subtitle: 'PROCESS BOTTLENECKS',
      description:
        'Uncoordinated inspections and opaque query cycles drag out clearances with no unified tracking or statutory SLA enforcement.',
      metric: '41%',
      metricLabel: 'Of initial submissions rejected due to minor preventable defects',
      impact: 'Statutory timelines breached with no escalation path',
      delayClass: 'reveal-delay-3',
    },
  ];

  return (
    <section id="problem" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Section Header */}
        <div className="reveal-init p-6 sm:p-10 border-b border-[#262522] bg-[#FAF8F2] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                SECTION 01
              </span>
              <span className="meta-label text-[#6E6A61]">THE SYSTEMIC CHALLENGE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
              The Problem
            </h2>
          </div>
          <p className="text-sm text-[#6E6A61] max-w-md font-mono-data">
            Administrative silos leave entrepreneurs overwhelmed and government scrutiny teams overburdened.
          </p>
        </div>

        {/* 3-Column Editorial Grid with thin 1px #262522 separators */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#262522] bg-[#FAF8F2]">
          {problems.map((problem) => (
            <div
              key={problem.number}
              className={`reveal-init ${problem.delayClass} p-6 sm:p-8 flex flex-col justify-between hover:bg-[#F3EFE5] transition-[background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] h-full`}
            >
              <div>
                {/* Number & Subtitle */}
                <div className="flex items-baseline justify-between mb-6 pb-4 border-b border-[#D6D0C3]">
                  <span className="font-mono-data text-5xl sm:text-6xl font-bold text-[#171717] tracking-tight">
                    {problem.number}
                  </span>
                  <span className="meta-label text-[#18324A] text-[10px] bg-[#E9E1D0] px-2 py-1 rounded-[2px]">
                    {problem.subtitle}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-[#171717] mb-3 tracking-tight">
                  {problem.title}
                </h3>

                {/* Narrative Description */}
                <p className="text-sm text-[#6E6A61] leading-relaxed mb-6">
                  {problem.description}
                </p>
              </div>

              {/* Data & Impact Block */}
              <div className="pt-6 border-t border-[#D6D0C3] mt-auto space-y-3">
                <div className="bg-[#FFFFFF] border border-[#262522] p-3.5 rounded-[3px]">
                  <div className="font-mono-data text-2xl font-bold text-[#B85C4A]">
                    {problem.metric}
                  </div>
                  <div className="text-[11px] text-[#6E6A61] font-mono-data mt-0.5 leading-tight">
                    {problem.metricLabel}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono-data text-[#30302D]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B85C4A]"></span>
                  <span>Outcome: {problem.impact}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
