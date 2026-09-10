import React from 'react';

export default function Footer() {
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', `#${id}`);
      }
    }
  };

  return (
    <footer className="bg-[#FAF8F2] border-t border-[#262522] text-[#171717]">
      <div className="max-w-7xl mx-auto border-x border-[#262522]">
        {/* Main Footer Content */}
        <div className="p-6 sm:p-10 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#D6D0C3]">
            {/* Brand & Purpose (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#18324A] text-[#FAF8F2] rounded-[4px] flex items-center justify-center font-mono-data font-bold text-sm">
                  NS
                </div>
                <div>
                  <span className="font-sans font-bold text-base tracking-tight text-[#171717]">
                    NIVESHSETU <span className="font-mono-data text-xs font-semibold px-1 py-0.5 bg-[#E9E1D0] rounded-[2px] text-[#18324A]">AI</span>
                  </span>
                </div>
              </div>

              <p className="text-sm font-semibold text-[#30302D]">
                Every approval. One clear path.
              </p>

              <p className="text-xs text-[#6E6A61] leading-relaxed max-w-sm">
                An intelligent business approval and statutory compliance management platform engineered to simplify and accelerate end-to-end industrial clearances while maintaining statutory rigor.
              </p>

              {/* Mandatory Branding Disclaimer as per Rule 36 */}
              <div className="p-3 bg-[#F3EFE5] border border-[#D6D0C3] rounded-[3px] text-[11px] text-[#6E6A61] font-mono-data leading-tight">
                <strong className="text-[#171717]">DISCLAIMER:</strong> NiveshSetu AI is an advanced enterprise technology solution developed for Smart India Hackathon 2026. It is a compliance intelligence platform and not an official government portal.
              </div>
            </div>

            {/* Regulatory Engines (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="meta-label text-[#171717]">REGULATORY CODES</div>
              <ul className="space-y-2 text-xs font-mono-data text-[#6E6A61]">
                <li className="hover:text-[#18324A] transition-colors duration-150">Factories Act 1948</li>
                <li className="hover:text-[#18324A] transition-colors duration-150">Water & Air Acts</li>
                <li className="hover:text-[#18324A] transition-colors duration-150">Fire Safety Rules</li>
                <li className="hover:text-[#18324A] transition-colors duration-150">Contract Labour Act</li>
                <li className="hover:text-[#18324A] transition-colors duration-150">Industrial Policy 2022</li>
                <li className="hover:text-[#18324A] transition-colors duration-150">Boilers Act 1923</li>
              </ul>
            </div>

            {/* Architecture (2 cols) */}
            <div className="lg:col-span-2 space-y-3">
              <div className="meta-label text-[#171717]">CAPABILITIES</div>
              <ul className="space-y-2 text-xs font-mono-data text-[#6E6A61]">
                <li>
                  <button
                    onClick={() => scrollToSection('roadmap')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Approval Roadmap
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('document-intelligence')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Document Intelligence
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('department-workflow')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Parallel Scrutiny
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('department-workflow')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Joint Inspections
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('department-workflow')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Statutory SLA Engine
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => scrollToSection('problem')}
                    className="hover:text-[#18324A] transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] text-left"
                  >
                    Systemic Bottlenecks
                  </button>
                </li>
              </ul>
            </div>


            {/* System Info (3 cols) */}
            <div className="lg:col-span-3 space-y-3">
              <div className="meta-label text-[#171717]">PROJECT SPECIFICATION</div>
              <div className="p-3 bg-[#E9E1D0] border border-[#262522] rounded-[3px] text-xs font-mono-data space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">PROGRAM:</span>
                  <span className="font-semibold text-[#171717]">SIH 2026</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">PILOT:</span>
                  <span className="font-semibold text-[#18324A]">Odisha Corridor</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">VERSION:</span>
                  <span className="font-semibold text-[#30302D]">v1.0.0-PROD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#6E6A61]">ARCHITECTURE:</span>
                  <span className="font-semibold text-[#5D8068]">Deterministic DAG</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono-data text-[#6E6A61]">
            <div>
              © 2026 NiveshSetu AI. Designed for Ease of Doing Business & Statutory Safeguards.
            </div>
            <div className="flex items-center gap-4">
              <span>WCAG 2.1 AA COMPLIANT</span>
              <span>•</span>
              <span>ZERO TRACKING COOKIES</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
