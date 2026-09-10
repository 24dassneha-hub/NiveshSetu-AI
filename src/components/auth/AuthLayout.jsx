import React from 'react';
import { ArrowLeft } from 'lucide-react';
import AuthBrandPanel from './AuthBrandPanel';
import { Link } from '../../router';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#F3EFE5] text-[#171717] w-full flex flex-col md:flex-row antialiased selection:bg-[#18324A] selection:text-[#FAF8F2]">
      {/* Desktop Left Brand Panel: 42% width with 1px solid #262522 border */}
      <div className="hidden lg:block lg:w-[42vw] min-h-screen border-r border-[#262522] sticky top-0 self-start shrink-0">
        <AuthBrandPanel />
      </div>

      {/* Mobile/Tablet Header: shown only when width <= 1024px */}
      <div className="lg:hidden p-6 sm:p-8 bg-[#F3EFE5] border-b border-[#262522]">
        <div className="flex items-center justify-between mb-4">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#18324A] text-[#FAF8F2] rounded-[4px] flex items-center justify-center font-mono-data font-bold text-sm">
              NS
            </div>
            <span className="font-sans font-bold text-base tracking-tight text-[#171717]">
              NIVESHSETU <span className="font-mono-data text-xs font-semibold px-1 py-0.5 bg-[#E9E1D0] rounded-[2px] text-[#18324A]">AI</span>
            </span>
          </Link>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#30302D] hover:text-[#18324A] font-mono-data"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PLATFORM</span>
          </Link>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] leading-tight mb-2">
          Every approval. One clear path.
        </h2>
        <p className="text-xs text-[#6E6A61] max-w-md">
          Discover what your business needs, prepare the right documents, and track every approval from one workspace.
        </p>

        {/* Compact roadmap preview on mobile */}
        <div className="mt-4 pt-3 border-t border-[#D6D0C3] flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-mono-data">
          <span className="text-[#5D8068] font-semibold">✓ GST</span>
          <span className="text-[#5D8068] font-semibold">✓ FACTORY LIC</span>
          <span className="text-[#C08A3E] font-semibold">● POLLUTION</span>
          <span className="text-[#B85C4A] font-semibold">! FIRE NOC</span>
          <span className="text-[#8B8982]">○ LABOUR</span>
        </div>
      </div>

      {/* Right Authentication Workspace: 58% width on desktop */}
      <div className="flex-1 lg:w-[58vw] min-h-screen relative flex flex-col justify-between p-6 sm:p-10 lg:py-12 lg:px-[clamp(48px,6vw,112px)]">
        {/* Top Right Header Action: ← BACK TO PLATFORM */}
        <div className="hidden lg:flex items-center justify-end pb-8">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-[#30302D] hover:text-[#18324A] font-mono-data transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span>BACK TO PLATFORM</span>
          </Link>
        </div>

        {/* Form Container: Max width 520px with smooth page entrance */}
        <div className="w-full max-w-[520px] mx-auto lg:mx-0 my-auto py-6 sm:py-8 auth-page-enter">
          {children}
        </div>

        {/* Bottom subtle metadata */}
        <div className="pt-6 border-t border-[#D6D0C3] text-[11px] font-mono-data text-[#6E6A61] flex flex-wrap items-center justify-between gap-3">
          <span>SECURE SINGLE-WINDOW WORKSPACE</span>
          <span>NIVESHSETU AI • SIH 2026</span>
        </div>
      </div>
    </div>
  );
}
