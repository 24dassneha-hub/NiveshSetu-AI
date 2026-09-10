import React, { useState, useEffect } from 'react';
import Sidebar from '../components/dashboard/Sidebar';
import TopUtilityBar from '../components/dashboard/TopUtilityBar';
import BusinessContextStrip from '../components/dashboard/BusinessContextStrip';
import MetricCards from '../components/dashboard/MetricCards';
import ApprovalRoadmap from '../components/dashboard/ApprovalRoadmap';
import RoadmapDetailModal from '../components/dashboard/RoadmapDetailModal';
import TodaysActions from '../components/dashboard/TodaysActions';
import UpcomingDeadlines from '../components/dashboard/UpcomingDeadlines';
import RecentActivity from '../components/dashboard/RecentActivity';
import ComplianceSnapshot from '../components/dashboard/ComplianceSnapshot';
import SearchModal from '../components/dashboard/SearchModal';
import NotificationsDropdown from '../components/dashboard/NotificationsDropdown';
import GraceChatAssistant from '../components/dashboard/GraceChatAssistant';
import { getLiveDashboardData } from '../data/dashboardData';
import { useAuth } from '../context/AuthContext';
import {
  switchToCleanMode,
  switchToDemoMode,
  resetCleanWorkspace,
} from '../data/appModeState';

export default function Dashboard() {
  const { user } = useAuth();
  const [liveData, setLiveData] = useState(() => getLiveDashboardData(user));
  const [selectedNode, setSelectedNode] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync live dashboard data whenever user changes, mode switches, or localStorage updates
  useEffect(() => {
    const refreshData = () => {
      setLiveData(getLiveDashboardData(user));
    };
    refreshData();
    window.addEventListener('storage', refreshData);
    window.addEventListener('appModeChanged', refreshData);
    return () => {
      window.removeEventListener('storage', refreshData);
      window.removeEventListener('appModeChanged', refreshData);
    };
  }, [user]);

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
    if (typeof nodeOrId === 'string') {
      const found = liveData.roadmap.find((n) => n.id === nodeOrId);
      if (found) setSelectedNode(found);
    } else {
      setSelectedNode(nodeOrId);
    }
  };

  const handleSelectNotification = (notif) => {
    setIsNotificationsOpen(false);
    if (notif && notif.nodeId) {
      handleSelectNode(notif.nodeId);
    }
  };

  const handleSwitchToClean = () => {
    switchToCleanMode();
    setLiveData(getLiveDashboardData(user));
  };

  const handleSwitchToDemo = () => {
    switchToDemoMode();
    setLiveData(getLiveDashboardData(user));
  };

  const handleResetClean = () => {
    if (window.confirm('Reset clean workspace to zero data? Any custom approvals or documents you added will be cleared.')) {
      resetCleanWorkspace();
      setLiveData(getLiveDashboardData(user));
    }
  };

  return (
    <div className="min-h-screen bg-[#F3EFE5] text-[#171717] flex flex-col md:flex-row antialiased selection:bg-[#18324A] selection:text-[#FAF8F2]">
      {/* 1. Sticky Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* 2. Main Content Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Utility Bar */}
        <div className="relative">
          <TopUtilityBar
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
            onOpenSearch={() => setIsSearchOpen(true)}
            onToggleNotifications={() => setIsNotificationsOpen((prev) => !prev)}
            unreadCount={liveData.notifications.length}
          />

          {/* Notifications Dropdown */}
          <NotificationsDropdown
            isOpen={isNotificationsOpen}
            onClose={() => setIsNotificationsOpen(false)}
            notifications={liveData.notifications}
            onSelectNotification={handleSelectNotification}
          />
        </div>

        {/* Workspace Canvas Container */}
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6 focus:outline-none"
        >
          {/* Live Enterprise Environment Banner with Real/Sample Mode Control */}
          {liveData.isDemo ? (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 bg-[#FAF6E9] border border-[#C59B27] rounded-[4px] text-xs font-mono-data text-[#8A6A14] shadow-[0_2px_8px_rgba(197,155,39,0.08)]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C59B27] animate-pulse" />
                <span className="font-bold text-[#8A6A14] uppercase tracking-wide flex items-center gap-1">
                  ⚡ DEMO MODE • SIMULATED DATA
                </span>
                <span className="text-[#C59B27]/40 hidden sm:inline">|</span>
                <span className="text-[#6E6A61] font-semibold">
                  Sample Enterprise: <strong className="text-[#18324A]">{liveData.business.name}</strong> (Bhubaneswar • ₹10 Cr • 6 Clearances • 8 Docs)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwitchToClean}
                  className="px-3 py-1.5 text-xs font-bold bg-[#18324A] hover:bg-[#244B66] text-[#FAF8F2] rounded-[3px] border border-[#18324A] transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  title="Switch to clean workspace (0 initial data, enter your own business)"
                >
                  <span>✨ Switch to Clean Mode</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 px-4 bg-[#EBF2EC] border border-[#5D8068] rounded-[4px] text-xs font-mono-data text-[#2E4A35] shadow-[0_2px_8px_rgba(93,128,104,0.08)]">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-[#5D8068] animate-pulse" />
                <span className="font-bold text-[#2E4A35] uppercase tracking-wide flex items-center gap-1">
                  🟢 CLEAN WORKSPACE • USER-DRIVEN
                </span>
                <span className="text-[#5D8068]/40 hidden sm:inline">|</span>
                <span className="text-[#4F6854] font-medium">
                  Enterprise: <strong className="text-[#18324A]">{liveData.business.name || 'Unconfigured (Click to Setup)'}</strong> • Zero-data active
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSwitchToDemo}
                  className="px-3 py-1.5 text-xs font-bold bg-[#FAF6E9] hover:bg-[#F3EFE5] text-[#8A6A14] border border-[#C59B27] rounded-[3px] transition-colors cursor-pointer flex items-center gap-1"
                  title="Load the pre-populated demo dataset for demonstration"
                >
                  <span>⚡ Try Demo Dataset</span>
                </button>
                <button
                  onClick={handleResetClean}
                  className="px-2.5 py-1.5 text-[11px] font-semibold bg-white hover:bg-[#FAF8F2] text-[#B85C4A] border border-[#B85C4A]/40 rounded-[3px] transition-colors cursor-pointer"
                  title="Reset clean workspace to zero"
                >
                  Reset Clean Data
                </button>
              </div>
            </div>
          )}

          {/* Business Context Strip */}
          <section aria-label="Business Profile Context">
            <BusinessContextStrip business={liveData.business} />
          </section>

          {/* Key Metric Cards */}
          <section aria-label="Key Performance Indicators">
            <MetricCards metrics={liveData.metrics} />
          </section>

          {/* Approval Roadmap DAG */}
          <section aria-label="Approval Clearance Roadmap">
            <ApprovalRoadmap
              roadmap={liveData.roadmap}
              onSelectNode={handleSelectNode}
            />
          </section>

          {/* Row 1: Today's Actions (60%) + Upcoming Deadlines (40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <TodaysActions
                actions={liveData.actions}
                onSelectAction={handleSelectNode}
              />
            </div>
            <div className="lg:col-span-5">
              <UpcomingDeadlines deadlines={liveData.deadlines} />
            </div>
          </div>

          {/* Row 2: Recent Activity (60%) + Compliance Snapshot (40%) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-7">
              <RecentActivity activity={liveData.activity} />
            </div>
            <div className="lg:col-span-5">
              <ComplianceSnapshot compliance={liveData.compliance} />
            </div>
          </div>

          {/* Workspace Footer */}
          <footer className="pt-8 pb-4 border-t border-[#D6D0C3] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono-data text-[#6E6A61]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#18324A]">NIVESHSETU AI</span>
              <span>•</span>
              <span>SMART INDIA HACKATHON 2026</span>
            </div>
            <div>
              LAST SYNCHRONIZED: {liveData.business.lastUpdated} (REAL-TIME REACTIVE)
            </div>
          </footer>
        </main>
      </div>

      {/* Global Interactive Overlays */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        roadmap={liveData.roadmap}
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
