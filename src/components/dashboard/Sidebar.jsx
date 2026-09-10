import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FileCheck,
  FolderLock,
  Compass,
  RefreshCw,
  Award,
  Bell,
  Sparkles,
  HelpCircle,
  Settings,
  Building2,
  X,
  LogOut,
} from 'lucide-react';
import { Link, useLocation, useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { getUnreadAlertsCount } from '../../data/alertsStorage';

export default function Sidebar({ isOpen, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [unreadAlerts, setUnreadAlerts] = useState(() => getUnreadAlertsCount());

  useEffect(() => {
    const handleAlertsChange = () => {
      setUnreadAlerts(getUnreadAlertsCount());
    };
    window.addEventListener('alertsUpdated', handleAlertsChange);
    window.addEventListener('appModeChanged', handleAlertsChange);
    window.addEventListener('storage', handleAlertsChange);
    return () => {
      window.removeEventListener('alertsUpdated', handleAlertsChange);
      window.removeEventListener('appModeChanged', handleAlertsChange);
      window.removeEventListener('storage', handleAlertsChange);
    };
  }, []);

  // Primary navigation items (Strict sequence: Overview -> Documents -> Apply -> Approval -> Renewal -> Incentive -> Alerts -> Sneha AI)
  const mainNavItems = [
    { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Documents', href: '/documents', icon: FolderLock },
    { label: 'Apply', href: '/apply', icon: Compass },
    { label: 'Approval', href: '/approvals', icon: FileCheck },
    { label: 'Renewal', href: '/renewals', icon: RefreshCw },
    { label: 'Incentive', href: '/incentives', icon: Award },
    {
      label: 'Alerts',
      href: '/alerts',
      icon: Bell,
      badge: unreadAlerts > 0 ? String(unreadAlerts) : null,
    },
    { label: 'Sneha AI', href: '/sneha', icon: Sparkles, badge: 'AI', isAi: true },
  ];

  // Secondary items
  const secondaryNavItems = [
    { label: 'Business Profile', href: '/business-profile', icon: Building2 },
    { label: 'Help & Support', href: '/help', icon: HelpCircle },
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const renderNavContent = (isMobile = false) => (
    <div className="flex flex-col justify-between h-full">
      {/* Brand Header */}
      <div>
        <div className="pb-5 mb-4 border-b border-[#262522] flex items-center justify-between">
          <Link
            to="/"
            onClick={() => isMobile && onClose()}
            className="flex items-start gap-2.5 group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A] rounded-[3px]"
          >
            <div className="w-8 h-8 bg-[#18324A] text-[#FAF8F2] rounded-[3px] flex items-center justify-center font-mono-data font-bold text-sm shrink-0 mt-0.5 border border-[#18324A]">
              NS
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-sans font-bold text-sm text-[#171717] tracking-tight">
                NIVESHSETU <span className="font-mono-data text-[10px] font-semibold px-1 py-0.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[2px] ml-0.5 text-[#18324A]">AI</span>
              </span>
              <span className="meta-label text-[8.5px] tracking-wider text-[#6E6A61] mt-0.5 uppercase">
                Business Approval &<br />Compliance Platform
              </span>
            </div>
          </Link>

          {isMobile && (
            <button
              onClick={onClose}
              className="p-1.5 text-[#171717] hover:bg-[#FAF8F2] rounded-[3px] border border-[#262522] transition-colors cursor-pointer"
              aria-label="Close sidebar menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Navigation List */}
        <nav aria-label="Dashboard Navigation" className="space-y-1">
          {mainNavItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === '/dashboard' && (pathname === '/dashboard' || pathname === '' || pathname === '/')) ||
              (item.href === '/documents' && pathname.startsWith('/documents')) ||
              (item.href === '/apply' && (pathname.startsWith('/apply') || pathname.startsWith('/applications'))) ||
              (item.href === '/approvals' && pathname.startsWith('/approvals')) ||
              (item.href === '/renewals' && pathname.startsWith('/renewals')) ||
              (item.href === '/incentives' && pathname.startsWith('/incentives')) ||
              (item.href === '/alerts' && pathname.startsWith('/alerts')) ||
              (item.href === '/sneha' && (pathname.startsWith('/sneha') || pathname.startsWith('/grace')));
            const Icon = item.icon;

            return (
              <Link
                key={item.label}
                to={item.href}
                onClick={() => isMobile && onClose()}
                className={`flex items-center justify-between h-10 px-3 rounded-[4px] text-xs font-mono-data font-medium transition-[background-color,color,border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] ${
                  isActive
                    ? 'bg-[#18324A] text-[#FAF8F2] font-semibold border border-[#18324A]'
                    : 'text-[#30302D] hover:bg-[#FAF8F2] hover:text-[#18324A] border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#FAF8F2]' : item.isAi ? 'text-[#C08A3E]' : 'text-[#6E6A61]'}`} />
                  <span className={item.isAi ? 'font-semibold text-[#18324A]' : ''}>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono-data font-bold ${
                    item.isAi
                      ? 'bg-[#C08A3E] text-white'
                      : 'bg-[#B85C4A] text-[#FAF8F2]'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sneha AI Layout Component directly under Alerts in the website layout */}
        <div className="mt-3 p-3 bg-gradient-to-br from-[#18324A] to-[#224564] text-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[#C08A3E] flex items-center justify-center text-white shadow-xs">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="font-bold text-xs tracking-tight text-white">Sneha AI</span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-mono-data text-[#5D8068] bg-[#FAF8F2] px-1.5 py-0.2 rounded font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5D8068] animate-pulse" />
              ONLINE
            </span>
          </div>
          <p className="text-[10px] text-[#D6D0C3] leading-snug mb-2.5 font-sans">
            Statutory clearance rules, document checklists, and 1-click vault slots.
          </p>
          <div className="flex items-center gap-1.5">
            <Link
              to="/sneha"
              onClick={() => isMobile && onClose()}
              className="flex-1 text-center py-1 px-2 text-[10px] font-mono-data font-semibold bg-[#FAF8F2] hover:bg-white text-[#18324A] rounded-[2px] transition-colors"
            >
              Open Console
            </Link>
            <button
              type="button"
              onClick={() => {
                if (isMobile && onClose) {
                  onClose();
                }
                window.dispatchEvent(new CustomEvent('openSnehaChat'));
                window.dispatchEvent(new CustomEvent('openGraceChat'));
              }}
              className="py-1 px-2 text-[10px] font-mono-data font-semibold bg-[#C08A3E] hover:bg-[#d99f4c] text-white rounded-[2px] transition-colors cursor-pointer"
              title="Launch quick floating assistant"
            >
              Ask AI
            </button>
          </div>
        </div>

        {/* Subtle Separator */}
        <div className="my-3 pt-3 border-t border-[#262522]">
          <nav aria-label="Support Navigation" className="space-y-1">
            {secondaryNavItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => isMobile && onClose()}
                  className={`flex items-center gap-2.5 h-10 px-3 rounded-[4px] text-xs font-mono-data font-medium transition-[background-color,color,border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] ${
                    isActive
                      ? 'bg-[#18324A] text-[#FAF8F2] font-semibold border border-[#18324A]'
                      : 'text-[#6E6A61] hover:bg-[#FAF8F2] hover:text-[#18324A] border border-transparent'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0 text-[#6E6A61]" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Area at bottom */}
      <div className="pt-4 border-t border-[#262522] mt-auto">
        <div className="p-2.5 bg-[#FAF8F2] border border-[#262522] rounded-[4px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-[3px] bg-[#18324A] text-[#FAF8F2] flex items-center justify-center font-mono-data font-bold text-xs shrink-0">
              {user?.businessName ? user.businessName.substring(0, 2).toUpperCase() : user?.name ? user.name.substring(0, 2).toUpperCase() : 'OE'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-sans font-bold text-xs text-[#171717] truncate leading-tight uppercase">
                {user?.businessName || user?.name || 'OMM ENTERPRISES'}
              </span>
              <span className="text-[10px] font-mono-data text-[#6E6A61] truncate">
                Business Account
              </span>
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="p-1.5 text-[#6E6A61] hover:text-[#B85C4A] hover:bg-[#E9E1D0] rounded-[3px] transition-colors cursor-pointer shrink-0"
            title="Sign out of workspace"
            aria-label="Sign out"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar (240px wide, hidden below md/lg) */}
      <aside className="hidden md:block w-[240px] shrink-0 bg-[#E9E1D0] border-r border-[#262522] p-5 sticky top-0 h-screen overflow-y-auto">
        {renderNavContent(false)}
      </aside>

      {/* Mobile Drawer (< md) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={onClose}
            className="fixed inset-0 bg-[#171717]/50 backdrop-blur-[1px] transition-opacity duration-200"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <div className="relative w-[280px] max-w-[85vw] bg-[#E9E1D0] border-r border-[#262522] p-5 h-full z-10 overflow-y-auto mobile-menu-enter shadow-[4px_0_24px_rgba(23,23,23,0.15)]">
            {renderNavContent(true)}
          </div>
        </div>
      )}
    </>
  );
}
