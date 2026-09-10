import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopUtilityBar from './TopUtilityBar';
import NotificationsDropdown from './NotificationsDropdown';
import SearchModal from './SearchModal';
import RoadmapDetailModal from './RoadmapDetailModal';
import GraceChatAssistant from './GraceChatAssistant';
import { getLiveDashboardData, dashboardData } from '../../data/dashboardData';
import { getUnreadAlertsCount } from '../../data/alertsStorage';

export default function DashboardShell({ children }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(() => getUnreadAlertsCount());
  const [liveData, setLiveData] = useState(() => getLiveDashboardData());

  useEffect(() => {
    const handleSync = () => {
      setUnreadCount(getUnreadAlertsCount());
      setLiveData(getLiveDashboardData());
    };
    window.addEventListener('alertsUpdated', handleSync);
    window.addEventListener('appModeChanged', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('alertsUpdated', handleSync);
      window.removeEventListener('appModeChanged', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  // Global Keyboard shortcut for Quick Search (⌘K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectNode = (nodeOrId) => {
    if (!nodeOrId) return;
    const roadmapList = liveData?.roadmap || dashboardData?.roadmap || [];
    if (typeof nodeOrId === 'string') {
      const found = roadmapList.find((n) => n.id === nodeOrId);
      if (found) setSelectedNode(found);
    } else {
      setSelectedNode(nodeOrId);
    }
  };

  const handleSelectNotification = (notifOrId) => {
    setIsNotificationsOpen(false);
    setUnreadCount((prev) => Math.max(0, prev - 1));
    const targetId = typeof notifOrId === 'object' ? notifOrId?.nodeId : notifOrId;
    if (targetId) {
      handleSelectNode(targetId);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE5] text-[#171717] flex flex-col md:flex-row antialiased selection:bg-[#18324A] selection:text-[#FAF8F2]">
      {/* Sidebar (Desktop 240px + Mobile Drawer) */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar (64px) */}
        <div className="relative">
          <TopUtilityBar
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
            unreadCount={unreadCount}
          />

          {/* Notifications Dropdown */}
          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={liveData.notifications}
            onSelectNotification={handleSelectNotification}
          />
        </div>

        {/* Dynamic Page Content */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 focus:outline-none"
        >
          {children}

          {/* Workspace Footer */}
          <footer className="pt-8 pb-4 border-t border-[#D6D0C3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-data text-[#6E6A61]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#18324A]">NIVESHSETU AI</span>
              <span>•</span>
              <span>BUSINESS COMPLIANCE DOSSIER</span>
            </div>
            <div>
              SINGLE WINDOW CLEARANCE SYSTEM • DEMO ENVIRONMENT
            </div>
          </footer>
        </main>
      </div>

      {/* Overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        roadmap={liveData?.roadmap || dashboardData?.roadmap || []}
        onSelectNode={handleSelectNode}
      />

      <RoadmapDetailModal
        isOpen={Boolean(selectedNode)}
        node={selectedNode}
        onClose={() => setSelectedNode(null)}
      />

      {/* Floating Grace AI Assistant */}
      <GraceChatAssistant />
    </div>
  );
}
