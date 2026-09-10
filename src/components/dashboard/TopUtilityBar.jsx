import React from 'react';
import { Menu, Search, Bell, HelpCircle } from 'lucide-react';
import { Link, useLocation } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { getLiveDashboardData } from '../../data/dashboardData';

export default function TopUtilityBar({
  onToggleMobileMenu,
  onOpenSearch,
  onToggleNotifications,
  unreadCount = 0,
}) {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const liveData = getLiveDashboardData();
  const businessName = liveData?.business?.name || liveData?.businessContext?.businessName || user?.businessName || 'My Enterprise';
  const initials = businessName
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'EN';

  const getSectionTitle = () => {
    if (pathname.startsWith('/documents')) return 'Documents';
    if (pathname.startsWith('/apply') || pathname.startsWith('/applications')) return 'Apply';
    if (pathname.startsWith('/approvals')) return 'Approval';
    if (pathname.startsWith('/renewals')) return 'Renewal';
    if (pathname.startsWith('/incentives')) return 'Incentive';
    if (pathname.startsWith('/alerts')) return 'Alerts';
    if (pathname.startsWith('/sneha') || pathname.startsWith('/grace')) return 'Sneha AI';
    if (pathname.startsWith('/business-profile')) return 'Business Profile';
    if (pathname.startsWith('/settings')) return 'Settings';
    if (pathname.startsWith('/help')) return 'Help & Support';
    return 'Overview';
  };

  return (
    <header className="h-16 border-b border-[#D6D0C3] bg-[#FAF8F2] px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Left: Hamburger (mobile) + Section Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="p-1.5 -ml-1 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-[#262522] md:hidden cursor-pointer focus-visible:ring-2 focus-visible:ring-[#18324A]"
          aria-label="Open navigation sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-sans font-bold text-sm sm:text-base text-[#171717] tracking-tight">
            {getSectionTitle()}
          </span>
          <span className="hidden sm:inline-block font-mono-data text-[10px] text-[#6E6A61] bg-[#E9E1D0] px-1.5 py-0.5 rounded-[2px] border border-[#D6D0C3]">
            WORKSPACE
          </span>
        </div>
      </div>

      {/* Right: Search, Notifications, Help, User Badge */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search trigger button */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-[3px] border border-[#D6D0C3] bg-[#FFFFFF] hover:border-[#262522] text-[#6E6A61] hover:text-[#171717] text-xs font-mono-data transition-[border-color,color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#18324A]"
          aria-label="Search approvals"
        >
          <Search className="w-3.5 h-3.5 text-[#171717]" />
          <span className="hidden sm:inline">Search approvals...</span>
          <kbd className="hidden lg:inline-block text-[10px] px-1 py-0.2 bg-[#FAF8F2] border border-[#D6D0C3] rounded text-[#6E6A61]">
            ⌘K
          </kbd>
        </button>

        {/* Notifications trigger button */}
        <button
          onClick={onToggleNotifications}
          className="relative p-2 rounded-[3px] border border-[#D6D0C3] bg-[#FFFFFF] hover:border-[#262522] text-[#171717] transition-[border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#18324A]"
          aria-label="View notifications"
        >
          <Bell className="w-4 h-4 text-[#171717]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#B85C4A] text-[#FAF8F2] text-[9px] font-mono-data font-bold rounded-full flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Help Link */}
        <Link
          to="/help"
          className="p-2 rounded-[3px] border border-[#D6D0C3] bg-[#FFFFFF] hover:border-[#262522] text-[#171717] transition-[border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:ring-2 focus-visible:ring-[#18324A]"
          aria-label="Help & Documentation"
        >
          <HelpCircle className="w-4 h-4 text-[#171717]" />
        </Link>

        {/* User Mini Avatar Badge */}
        <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-[#D6D0C3]">
          <div
            className="w-8 h-8 rounded-[3px] bg-[#18324A] text-[#FAF8F2] flex items-center justify-center font-mono-data font-bold text-xs select-none"
            title={`${businessName} (Business Account)`}
          >
            {initials}
          </div>
          <span
            className="hidden xl:inline text-xs font-mono-data font-medium text-[#30302D] max-w-[140px] truncate"
            title={businessName}
          >
            {businessName}
          </span>
        </div>
      </div>
    </header>
  );
}
