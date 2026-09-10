import React from 'react';
import useScrollReveal from '../../hooks/useScrollReveal';

export default function HowItWorks() {
  const sectionRef = useScrollReveal();

  const steps = [
    {
      num: '01',
      title: 'DISCOVER',
      subtitle: 'Matrix Generation',
      desc: 'Know which approvals apply based on your sector, scale, and location.',
      deliverable: 'Customized Approval Checklist',
      delayClass: 'reveal-delay-1',
    },
    {
      num: '02',
      title: 'PREPARE',
      subtitle: 'Pre-Validation',
      desc: 'Know what documents you need and pre-check them before formal submission.',
      deliverable: 'Verified Document Vault',
      delayClass: 'reveal-delay-2',
    },
    {
      num: '03',
      title: 'SUBMIT',
      subtitle: 'Parallel Dispatch',
      desc: 'Dispatch verified dossiers to Pollution, Factories, and Fire simultaneously.',
      deliverable: 'Common Application Token',
      delayClass: 'reveal-delay-3',
    },
    {
      num: '04',
      title: 'TRACK',
      subtitle: 'SLA Monitoring',
      desc: 'Know what happens next with joint inspections and real-time SLA countdowns.',
      deliverable: 'Joint Inspection Calendar',
      delayClass: 'reveal-delay-4',
    },
    {
      num: '05',
      title: 'COMPLY',
      subtitle: 'Renewals & Incentives',
      desc: 'Stay ahead of statutory renewal deadlines and unlock capital subsidies.',
      deliverable: 'Unified Compliance Health',
      delayClass: 'reveal-delay-4',
    },
  ];

  return (
    <section id="how-it-works" ref={sectionRef} className="scroll-mt-section bg-[#F3EFE5] border-b border-[#262522]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Section Title Header */}
        <div className="reveal-init p-6 sm:p-10 border-b border-[#262522] bg-[#FAF8F2] flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="font-mono-data text-xs font-bold text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px]">
                SECTION 02
              </span>
              <span className="meta-label text-[#6E6A61]">END-TO-END METHODOLOGY</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#171717]">
              How It Works
            </h2>
          </div>
          <p className="text-sm text-[#6E6A61] max-w-md font-mono-data">
            Five clear phases engineered to compress regulatory timelines while maintaining statutory rigor.
          </p>
        </div>

        {/* 5-Step Editorial Grid: 1 column on mobile/tablet, 5 columns on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 bg-[#FAF8F2]">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className={`reveal-init ${step.delayClass} p-5 sm:p-6 flex flex-col justify-between hover:bg-[#F3EFE5] transition-[background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] border-b last:border-b-0 lg:border-b-0 lg:border-r lg:last:border-r-0 border-[#262522] h-full`}
            >
              <div>
                {/* Header Row with large number */}
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#D6D0C3]">
                  <span className="font-mono-data text-3xl font-bold text-[#18324A]">
                    {step.num}
                  </span>
                  <span className="text-[10px] font-mono-data text-[#6E6A61] uppercase tracking-wider">
                    PHASE 0{idx + 1}
                  </span>
                </div>

                {/* Step Title & Subtitle */}
                <h3 className="text-lg font-bold text-[#171717] tracking-tight mb-0.5">
                  {step.title}
                </h3>
                <div className="meta-label text-[#5E7D91] text-[10px] mb-3">
                  {step.subtitle}
                </div>

                {/* Narrative */}
                <p className="text-xs text-[#6E6A61] leading-relaxed mb-6">
                  {step.desc}
                </p>
              </div>

              {/* Bottom deliverable tag */}
              <div className="pt-4 border-t border-[#D6D0C3] mt-auto">
                <div className="text-[10px] font-mono-data text-[#6E6A61] uppercase">
                  DELIVERABLE:
                </div>
                <div className="text-xs font-semibold text-[#171717] mt-0.5 font-mono-data">
                  {step.deliverable}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Editorial Callout Strip */}
        <div className="p-4 sm:p-6 bg-[#E9E1D0] border-t border-[#262522] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full bg-[#5D8068]"></span>
            <span className="text-xs font-mono-data text-[#171717]">
              <strong>STATUTORY PRINCIPLE:</strong> Parallel departmental reviews operate concurrently under enforceable timelines.
            </span>
          </div>
          <div className="text-xs font-mono-data text-[#18324A] font-semibold">
            MAX SLA: 30 WORKING DAYS PER CLEARANCE STAGE
          </div>
        </div>
      </div>
    </section>
  );
}
