import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight } from 'lucide-react';
import Button from '../ui/Button';
import { Link } from '../../router';

export default function Navbar({ onNavigateToApp, activeSection = 'overview' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: '01. The Problem', href: '#problem' },
    { label: '02. Methodology', href: '#how-it-works' },
    { label: '03. Approval Roadmap', href: '#roadmap' },
    { label: '04. Pre-Validation', href: '#document-intelligence' },
    { label: '05. Department Sync', href: '#department-workflow' },
  ];

  // Close menu on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Smooth scroll handler with URL state update
  const handleAnchorClick = (e, href) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      if (typeof window !== 'undefined') {
        window.history.pushState(null, '', href);
      }
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F3EFE5] border-b border-[#262522]">
      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand mark */}
          <Link to="/" className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] rounded-[4px]">
            <div className="w-9 h-9 bg-[#18324A] text-[#FAF8F2] rounded-[4px] flex items-center justify-center font-mono-data font-bold text-base border border-[#18324A] group-hover:bg-[#234563] transition-[background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]">
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

          {/* Desktop Nav Items */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1 border-x border-[#D6D0C3] px-4 h-full">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="px-3 py-2 text-xs font-mono-data text-[#30302D] hover:text-[#18324A] hover:bg-[#FAF8F2] rounded-[3px] transition-[color,background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A]"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Action CTAs */}
          <div className="hidden sm:flex items-center gap-2.5">
            <Link to="/login">
              <button
                className="px-3 py-2 text-xs font-mono-data font-semibold text-[#171717] hover:text-[#18324A] hover:bg-[#FAF8F2] rounded-[3px] border border-transparent hover:border-[#D6D0C3] transition-[color,background-color,border-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A]"
              >
                LOGIN
              </button>
            </Link>

            <Link to="/register">
              <Button
                variant="primary"
                size="sm"
                icon={ArrowUpRight}
                iconPosition="right"
              >
                GET STARTED
              </Button>
            </Link>
          </div>

          {/* Mobile hamburger - visible below lg breakpoint */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-[#171717] hover:bg-[#E9E1D0] active:bg-[#ded5c2] rounded-[4px] transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-navigation-menu"
          className="lg:hidden bg-[#FAF8F2] border-b border-[#262522] px-4 pt-3 pb-6 space-y-3 mobile-menu-enter shadow-[0_8px_24px_rgba(23,23,23,0.08)]"
        >
          <div className="space-y-1">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => handleAnchorClick(e, item.href)}
                className="flex items-center min-h-[44px] px-3 py-2.5 text-xs font-mono-data text-[#171717] hover:bg-[#E9E1D0] active:bg-[#ded5c2] rounded-[3px] transition-[background-color] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)]"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="pt-3 border-t border-[#D6D0C3] flex flex-col gap-2">
            <Link
              to="/register"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button
                variant="primary"
                size="md"
                className="w-full justify-center min-h-[44px]"
                icon={ArrowUpRight}
                iconPosition="right"
              >
                GET STARTED
              </Button>
            </Link>
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full"
            >
              <Button
                variant="secondary"
                size="md"
                className="w-full justify-center min-h-[44px]"
              >
                LOGIN
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

