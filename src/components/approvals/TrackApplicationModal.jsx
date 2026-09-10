import React, { useState } from 'react';
import { X, PlusCircle } from 'lucide-react';
import { trackNewApplication } from '../../data/approvalsStorage.js';

export default function TrackApplicationModal({ onClose, onTracked }) {
  const [approvalName, setApprovalName] = useState('');
  const [authorityName, setAuthorityName] = useState('');
  const [applicationId, setApplicationId] = useState('');
  const [monitoringSource, setMonitoringSource] = useState('NSWS');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!approvalName.trim() || !applicationId.trim()) {
      setError('Please provide the approval name and the government application ID.');
      return;
    }

    const tracked = trackNewApplication({
      approvalName: approvalName.trim(),
      authorityName: authorityName.trim() || 'Issuing Authority',
      applicationId: applicationId.trim(),
      monitoringSource,
    });

    if (onTracked) onTracked(tracked);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
        aria-hidden="true"
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-2xl p-6 z-10 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#262522]">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-[#18324A]" />
            <div>
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider font-bold block">
                CONNECT TO MONITOR
              </span>
              <h3 className="font-sans font-bold text-base text-[#171717]">
                Track Government Application
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-[#6E6A61] hover:text-[#171717] rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="font-sans text-xs text-[#6E6A61] leading-relaxed">
          Applied through an official portal or NSWS? Enter your government acknowledgment reference below to enable automated Sneha AI status tracking.
        </p>

        {error && (
          <div className="p-2.5 bg-[#B85C4A]/10 border border-[#B85C4A]/30 rounded-[3px] text-xs font-sans text-[#B85C4A]">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1">
              Clearance / Approval Name *
            </label>
            <input
              type="text"
              required
              value={approvalName}
              onChange={(e) => setApprovalName(e.target.value)}
              placeholder="e.g. Consent to Operate (CTO), Factory License, Fire NOC"
              className="w-full bg-white border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1">
              Issuing Authority / Department
            </label>
            <input
              type="text"
              value={authorityName}
              onChange={(e) => setAuthorityName(e.target.value)}
              placeholder="e.g. OSPCB, Directorate of Factories & Boilers"
              className="w-full bg-white border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-sans text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1">
              Government Application / Acknowledgment ID *
            </label>
            <input
              type="text"
              required
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              placeholder="e.g. NSWS-2026-9921 or OCMMS-CTO-4412"
              className="w-full bg-white border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data font-semibold text-[#18324A] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
            />
          </div>

          <div>
            <label className="block text-xs font-mono-data font-bold text-[#171717] uppercase tracking-wider mb-1">
              Monitoring Source Channel
            </label>
            <select
              value={monitoringSource}
              onChange={(e) => setMonitoringSource(e.target.value)}
              className="w-full bg-white border border-[#262522] rounded-[3px] py-2 px-3 text-xs font-mono-data text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A]"
            >
              <option value="NSWS">National Single Window System (NSWS)</option>
              <option value="Department API">State Department Portal (GO-SWIFT / OCMMS)</option>
              <option value="API Setu">API Setu / Government Open Gateway</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#D6D0C3]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-[#262522] text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] text-xs font-mono-data font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#18324A] hover:bg-[#224564] text-[#FAF8F2] rounded-[3px] text-xs font-mono-data font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Connect to Monitor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
