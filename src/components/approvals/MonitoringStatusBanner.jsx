import React, { useState } from 'react';
import { RefreshCw, Sparkles, SlidersHorizontal, Check } from 'lucide-react';
import { simulateStatusTransition, resetApprovalsToDefault } from '../../data/approvalsStorage.js';
import { NORMALIZED_STATUS } from '../../services/monitoringService.js';

export default function MonitoringStatusBanner({
  approvals = [],
  onRefresh,
  lastSyncTime = 'Just now',
}) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showSimControls, setShowSimControls] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  const connectedCount = approvals.filter(
    (a) => a.monitoring?.connectionStatus === 'CONNECTED'
  ).length;

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      if (onRefresh) onRefresh();
    }, 600);
  };

  const handleSimulate = (approvalId, status, govStatus, extra) => {
    simulateStatusTransition(approvalId, status, govStatus, extra);
    setSimMessage(`Simulated: ${govStatus}`);
    setTimeout(() => setSimMessage(''), 3000);
    if (onRefresh) onRefresh();
  };

  const handleReset = () => {
    resetApprovalsToDefault();
    setSimMessage('Reset to default monitoring data');
    setTimeout(() => setSimMessage(''), 3000);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Monitoring Status */}
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#18324A] text-white flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#C08A3E]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono-data text-[10px] font-bold uppercase tracking-wider text-[#6E6A61]">
                SNEHA AI MONITORING
              </span>
              <span className="text-[#D6D0C3]">•</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] text-[10px] font-mono-data font-bold bg-[#FAF8F2] border border-[#262522] text-[#18324A]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C08A3E] animate-pulse" />
                SIMULATED MONITORING (DEMO)
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#6E6A61] font-sans">
              <span>Last synchronization: <strong className="text-[#171717]">{lastSyncTime}</strong></span>
              <span>•</span>
              <span>{connectedCount} connected single window sources</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            type="button"
            onClick={() => setShowSimControls(!showSimControls)}
            className={`px-2.5 py-1.5 border rounded-[3px] text-xs font-mono-data font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              showSimControls
                ? 'bg-[#18324A] text-white border-[#18324A]'
                : 'bg-[#FAF8F2] border-[#262522] text-[#171717] hover:bg-white'
            }`}
            title="Toggle live demo simulator controls"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Demo Controls</span>
          </button>

          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3 py-1.5 bg-[#FAF8F2] border border-[#262522] rounded-[3px] text-xs font-mono-data font-semibold text-[#171717] hover:bg-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
            title="Poll latest known state from NiveshSetu backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#18324A]' : 'text-[#6E6A61]'}`} />
            <span>{isRefreshing ? 'Syncing...' : 'Refresh Status'}</span>
          </button>
        </div>
      </div>

      {/* Collapsible Demo Simulation Toolbar */}
      {showSimControls && (
        <div className="mt-3 pt-3 border-t border-[#D6D0C3] space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-mono-data text-[10px] font-bold text-[#6E6A61] uppercase tracking-wider flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-[#18324A]" />
              HACKATHON / EVALUATOR DEMO SIMULATOR
            </span>
            {simMessage && (
              <span className="font-mono-data text-[11px] text-[#5D8068] font-bold flex items-center gap-1 animate-fadeIn">
                <Check className="w-3 h-3" />
                {simMessage}
              </span>
            )}
          </div>
          <p className="font-sans text-[11px] text-[#6E6A61] leading-relaxed">
            Click any trigger below to test how Sneha AI captures government status shifts and pushes real-time compliance alerts:
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  'APR-002',
                  NORMALIZED_STATUS.ACTION_REQUIRED,
                  'Query Raised: Water Intake Clarification',
                  {
                    message: 'OSPCB Regional Office has raised an inquiry regarding daily trade effluent calculations.',
                    deadline: '16 Sep 2026',
                  }
                )
              }
              className="px-2.5 py-1 bg-white border border-[#B85C4A] text-[#B85C4A] hover:bg-[#B85C4A]/10 text-xs font-mono-data font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              1. Simulate OSPCB Query Raised
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  'APR-003',
                  NORMALIZED_STATUS.APPROVED,
                  'Certificate Issued',
                  { stage: 'Fire Safety Certificate Issued' }
                )
              }
              className="px-2.5 py-1 bg-white border border-[#5D8068] text-[#5D8068] hover:bg-[#5D8068]/10 text-xs font-mono-data font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              2. Simulate Fire NOC Approved
            </button>

            <button
              type="button"
              onClick={() =>
                handleSimulate(
                  'APR-003',
                  NORMALIZED_STATUS.UNDER_PROCESS,
                  'On-Site Physical Inspection Completed',
                  { stage: 'Final Scrutiny' }
                )
              }
              className="px-2.5 py-1 bg-white border border-[#C08A3E] text-[#C08A3E] hover:bg-[#C08A3E]/10 text-xs font-mono-data font-semibold rounded-[2px] transition-colors cursor-pointer"
            >
              3. Simulate Inspection Passed
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="px-2.5 py-1 bg-[#E9E1D0] border border-[#262522] text-[#171717] hover:bg-[#FAF8F2] text-xs font-mono-data font-semibold rounded-[2px] transition-colors cursor-pointer ml-auto"
            >
              Reset to Defaults
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
