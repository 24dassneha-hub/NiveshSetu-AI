import React, { useState } from 'react';
import {
  AlertTriangle,
  CalendarCheck,
  Award,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Building2,
} from 'lucide-react';
import { getApprovals, saveApproval } from '../../data/approvalsStorage';
import { addAlert } from '../../data/alertsStorage';

export default function OfficerSimulationBar({ onStateChange }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [notification, setNotification] = useState(null);

  const showFeedback = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
    if (onStateChange) onStateChange();
    window.dispatchEvent(new Event('storage'));
  };

  // 1. Simulate Scrutiny Query / Deficiency Notice
  const handleRaiseQuery = () => {
    const approvals = getApprovals();
    const target = approvals.find((a) => a.status?.normalized === 'UNDER_PROCESS') || approvals[0];
    if (!target) return;

    const updated = {
      ...target,
      status: {
        ...target.status,
        normalized: 'ACTION_REQUIRED',
        sourceStatus: 'Query Raised by Scrutiny Officer',
        currentStage: 'Applicant Clarification Awaited',
        changedAt: new Date().toISOString(),
      },
      actionRequired: {
        required: true,
        message: 'Statutory query raised under Section 21 of Air Act: Please clarify stack height calculation and hazardous waste storage containment bunds.',
        deadline: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      },
    };

    saveApproval(updated);

    addAlert({
      title: `Scrutiny Query Raised: ${target.name}`,
      message: `Assistant Director has flagged a document deficiency regarding stack height and secondary containment. Respond within 7 days.`,
      severity: 'CRITICAL',
      source: 'State Single Window Scrutiny Portal',
      category: 'COMPLIANCE',
      actionUrl: `/approvals/${target.id}`,
    });

    showFeedback(`🚨 Query raised on ${target.name}. Approval state updated to ACTION REQUIRED.`);
  };

  // 2. Simulate 48-Hour Computerized Joint Inspection
  const handleScheduleInspection = () => {
    const approvals = getApprovals();
    const target = approvals.find((a) => a.category === 'Factory' || a.category === 'Environment') || approvals[0];
    if (!target) return;

    const inspectionDate = new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

    const updated = {
      ...target,
      status: {
        ...target.status,
        currentStage: 'Computerized Joint Site Inspection Scheduled',
        changedAt: new Date().toISOString(),
      },
    };

    saveApproval(updated);

    addAlert({
      title: `Joint Site Inspection Scheduled (${inspectionDate})`,
      message: `Under BRAP mandates, a single-window joint inspection across Directorate of Factories & Boilers and Fire Services is confirmed for ${inspectionDate} at 10:30 AM.`,
      severity: 'WARNING',
      source: 'Central Inspection Framework (CIS)',
      category: 'INSPECTION',
      actionUrl: `/approvals/${target.id}`,
    });

    showFeedback(`📅 Computerized Joint Inspection scheduled for ${inspectionDate}. Alert sent.`);
  };

  // 3. Simulate Section 13(1) Deemed Approval SLA Breach
  const handleSimulateDeemedApproval = () => {
    const approvals = getApprovals();
    const target = approvals.find((a) => a.status?.normalized === 'UNDER_PROCESS') || approvals[0];
    if (!target) return;

    const certNumber = `OD-DEEMED-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const updated = {
      ...target,
      status: {
        ...target.status,
        normalized: 'APPROVED',
        sourceStatus: 'Deemed Approval Granted (SLA Expiry)',
        currentStage: 'Deemed Certificate Issued',
        changedAt: new Date().toISOString(),
      },
      certificate: {
        available: true,
        name: `Deemed Statutory Clearance (${target.name})`,
        number: certNumber,
        issuedAt: new Date().toISOString().split('T')[0],
        validUntil: '2028-12-31',
      },
      actionRequired: { required: false, message: null },
    };

    saveApproval(updated);

    addAlert({
      title: `⚖️ Deemed Approval Granted: ${target.name}`,
      message: `Clearance granted under Section 13(1) of Odisha Industries (Facilitation) Act 2004 due to statutory SLA elapsed at issuing authority. Certificate ${certNumber} generated.`,
      severity: 'SUCCESS',
      source: 'ORTPSA Single Window Auto-Escalation',
      category: 'APPROVAL',
      actionUrl: `/approvals/${target.id}`,
    });

    showFeedback(`⚖️ Statutory Deemed Approval triggered for ${target.name}. Certificate: ${certNumber}`);
  };

  // 4. Grant Digital Clearance Approval
  const handleGrantApproval = () => {
    const approvals = getApprovals();
    const target = approvals.find((a) => a.status?.normalized !== 'APPROVED') || approvals[0];
    if (!target) return;

    const certNumber = `OD-SW-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const updated = {
      ...target,
      status: {
        ...target.status,
        normalized: 'APPROVED',
        sourceStatus: 'Formal Clearance Granted',
        currentStage: 'Clearance Granted & Digitally Signed',
        changedAt: new Date().toISOString(),
      },
      certificate: {
        available: true,
        name: `Statutory License — ${target.name}`,
        number: certNumber,
        issuedAt: new Date().toISOString().split('T')[0],
        validUntil: '2028-12-31',
      },
      actionRequired: { required: false, message: null },
    };

    saveApproval(updated);

    addAlert({
      title: `🎉 Clearance Granted: ${target.name}`,
      message: `Issuing authority has verified all scrutiny checks and issued digital clearance certificate ${certNumber}.`,
      severity: 'SUCCESS',
      source: 'Department Single Window Portal',
      category: 'APPROVAL',
      actionUrl: `/approvals/${target.id}`,
    });

    showFeedback(`✅ ${target.name} approved! Digital certificate ${certNumber} generated.`);
  };

  // 5. Restore Sample Data
  const handleReset = () => {
    if (window.confirm('Reset platform data to clean baseline demonstration dataset?')) {
      localStorage.removeItem('niveshsetu_approvals');
      localStorage.removeItem('niveshsetu_documents');
      localStorage.removeItem('niveshsetu_applications');
      localStorage.removeItem('niveshsetu_renewals');
      localStorage.removeItem('niveshsetu_alerts');
      window.location.reload();
    }
  };

  return (
    <div className="bg-[#18324A] text-white border-b border-[#262522] shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#E6AF2E] animate-pulse"></span>
          <span className="font-mono-data font-bold tracking-wider uppercase text-[#FAF8F2] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#E6AF2E]" />
            SIH EVALUATION SIMULATOR
          </span>
          <span className="hidden md:inline font-mono-data text-[10px] text-[#D6D0C3] border-l border-white/20 pl-2">
            Simulate live government events during hackathon jury evaluation
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {notification && (
            <span className="font-mono-data text-[11px] text-[#5D8068] bg-[#FAF8F2] px-2 py-0.5 rounded font-bold transition-all">
              {notification}
            </span>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-[11px] font-mono-data text-[#FAF8F2] hover:text-[#E6AF2E] flex items-center gap-1 underline cursor-pointer"
          >
            <span>{isExpanded ? 'Hide Actions' : 'Show Actions'}</span>
            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="bg-[#0f2233] border-t border-white/10 px-4 sm:px-6 py-2.5">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center gap-2">
            <span className="font-mono-data text-[10px] uppercase font-bold text-[#D6D0C3] mr-1">
              Officer Actions:
            </span>

            <button
              onClick={handleRaiseQuery}
              className="px-2.5 py-1 bg-[#B85C4A] hover:bg-[#9a4736] text-white rounded-[2px] font-mono-data text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulates an issuing officer raising a formal query notice"
            >
              <AlertTriangle className="w-3 h-3" />
              <span>Raise Query Notice</span>
            </button>

            <button
              onClick={handleScheduleInspection}
              className="px-2.5 py-1 bg-[#C08A3E] hover:bg-[#a6742f] text-white rounded-[2px] font-mono-data text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Schedules a computerized joint site inspection across 3 departments"
            >
              <CalendarCheck className="w-3 h-3" />
              <span>Schedule 48h Joint Inspection</span>
            </button>

            <button
              onClick={handleSimulateDeemedApproval}
              className="px-2.5 py-1 bg-[#254A6B] hover:bg-[#34628d] text-white rounded-[2px] font-mono-data text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Simulates Section 13(1) statutory SLA breach"
            >
              <Sparkles className="w-3 h-3 text-[#E6AF2E]" />
              <span>Trigger Section 13(1) Deemed Approval</span>
            </button>

            <button
              onClick={handleGrantApproval}
              className="px-2.5 py-1 bg-[#5D8068] hover:bg-[#4b6a54] text-white rounded-[2px] font-mono-data text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Approve clearance and issue digital certificate"
            >
              <Award className="w-3 h-3" />
              <span>Grant Digital Approval</span>
            </button>

            <button
              onClick={handleReset}
              className="ml-auto px-2.5 py-1 bg-transparent hover:bg-white/10 text-[#D6D0C3] hover:text-white rounded-[2px] font-mono-data text-[11px] flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset records to pristine demonstration state"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
