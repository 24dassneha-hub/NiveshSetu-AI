import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  ArrowRight,
  ShieldAlert,
  FilePlus,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Send,
  RotateCcw,
  CheckCircle,
} from 'lucide-react';
import { useNavigate } from '../../router';
import { useAuth } from '../../context/AuthContext';
import { askSneha } from '../../lib/graceAiService';
import { createDocumentSlotsForLicense } from '../../data/documentsStorage';

export default function GraceAlertAdvisor({ activeAlerts = [], onAlertResolved }) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isExpanded, setIsExpanded] = useState(true);
  const [queryInput, setQueryInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState(null);
  const [createdSlots, setCreatedSlots] = useState(null);

  // Find critical or query alerts to generate smart recommended prompts
  const criticalCount = activeAlerts.filter((a) => a.severity === 'CRITICAL').length;
  const queryCount = activeAlerts.filter((a) => a.category === 'QUERY').length;

  useEffect(() => {
    const handleCustomAlertQuery = (e) => {
      if (e.detail && e.detail.query) {
        setIsExpanded(true);
        handleAskSneha(e.detail.query);
      }
    };
    window.addEventListener('askSnehaAlert', handleCustomAlertQuery);
    window.addEventListener('askGraceAlert', handleCustomAlertQuery);
    return () => {
      window.removeEventListener('askSnehaAlert', handleCustomAlertQuery);
      window.removeEventListener('askGraceAlert', handleCustomAlertQuery);
    };
  }, []);

  const handleAskSneha = async (queryText) => {
    const q = queryText || queryInput;
    if (!q || !q.trim() || isLoading) return;

    setIsLoading(true);
    setCreatedSlots(null);
    try {
      const res = await askSneha(q);
      setAiResponse({
        query: q,
        reply: res.reply,
        matchedLicense: res.matchedLicense,
        source: res.source,
      });
      setQueryInput('');
    } catch (err) {
      console.error('Sneha Alert Advisor error:', err);
      setAiResponse({
        query: q,
        reply: 'Sneha encountered an issue resolving this alert query. Please try again or click one of the quick remedies below.',
        matchedLicense: null,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateVaultSlots = (license) => {
    if (!license) return;
    const result = createDocumentSlotsForLicense(license, user);
    setCreatedSlots(result);
  };

  return (
    <div className="bg-[#FAF8F2] border-2 border-[#18324A] rounded-[4px] shadow-[0_4px_20px_rgba(24,50,74,0.06)] overflow-hidden transition-all">
      {/* Advisor Header Bar */}
      <div className="bg-[#18324A] text-[#FAF8F2] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-[#C08A3E] text-[#18324A] flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xs sm:text-sm tracking-tight text-white uppercase">
                Sneha AI • Alert Remediation Advisor
              </span>
              <span className="text-[10px] font-mono-data bg-[#5D8068] text-white px-1.5 py-0.2 rounded font-semibold">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-[#D6D0C3] hidden sm:block">
              Statutory legal guidance, scrutiny query responses, and 1-click document slot creation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {criticalCount > 0 && (
            <span className="text-[10px] font-mono-data bg-[#B85C4A] text-white px-2 py-0.5 rounded font-bold">
              {criticalCount} CRITICAL
            </span>
          )}
          {queryCount > 0 && (
            <span className="text-[10px] font-mono-data bg-[#C08A3E] text-white px-2 py-0.5 rounded font-bold">
              {queryCount} QUERY
            </span>
          )}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="text-[#D6D0C3] hover:text-white p-1 rounded hover:bg-white/10 transition-colors cursor-pointer"
            title={isExpanded ? 'Collapse panel' : 'Expand panel'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Content Body */}
      {isExpanded && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* AI Situation Analysis Summary */}
          <div className="bg-[#F3EFE5] border border-[#262522]/15 p-3.5 rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[#18324A]">
                <Bot className="w-4 h-4 text-[#C08A3E]" />
                <span>Sneha's Real-Time Remediation Briefing</span>
              </div>
              <p className="text-[#6E6A61] text-[11.5px] leading-relaxed">
                {criticalCount > 0
                  ? `You have ${criticalCount} statutory clearance(s) approaching expiry or overdue. Sneha can immediately generate missing prerequisite upload slots to fast-track your renewal.`
                  : `Your statutory compliance status is healthy. Ask Sneha any questions regarding upcoming audits or inspector scrutiny queries.`}
              </p>
            </div>

            {/* Quick action buttons based on alerts */}
            <div className="flex flex-wrap items-center gap-1.5 shrink-0">
              <button
                onClick={() =>
                  handleAskSneha(
                    'What documents are needed to renew the Factory Operating License under Factories Act?'
                  )
                }
                className="text-[11px] font-medium bg-white hover:bg-[#18324A] hover:text-white text-[#18324A] px-2.5 py-1.5 rounded border border-[#262522]/20 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
              >
                ⚡ Factory License Remedy
              </button>
              <button
                onClick={() =>
                  handleAskSneha(
                    'How to resolve OSPCB inspector query regarding hydraulic pipeline test report for Consent to Operate?'
                  )
                }
                className="text-[11px] font-medium bg-white hover:bg-[#18324A] hover:text-white text-[#18324A] px-2.5 py-1.5 rounded border border-[#262522]/20 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
              >
                🔬 OSPCB Query Response
              </button>
              <button
                onClick={() =>
                  handleAskSneha(
                    'What is the standard preparation checklist for on-site Fire Safety verification inspection?'
                  )
                }
                className="text-[11px] font-medium bg-white hover:bg-[#18324A] hover:text-white text-[#18324A] px-2.5 py-1.5 rounded border border-[#262522]/20 transition-colors cursor-pointer whitespace-nowrap shadow-2xs"
              >
                🚒 Fire Inspection Prep
              </button>
            </div>
          </div>

          {/* AI Response Card (If user asked or triggered a remedy) */}
          {aiResponse && (
            <div className="bg-[#FFFFFF] border-2 border-[#18324A] rounded-[4px] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-[#D6D0C3] pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-[#18324A] text-white flex items-center justify-center text-[10px] font-bold">
                    S
                  </div>
                  <span className="font-bold text-xs text-[#18324A]">
                    Statutory Resolution Memo: "{aiResponse.query}"
                  </span>
                </div>
                <button
                  onClick={() => {
                    setAiResponse(null);
                    setCreatedSlots(null);
                  }}
                  className="text-[11px] text-[#6E6A61] hover:text-[#B85C4A] p-1"
                  title="Clear recommendation"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Reply Body */}
              <div className="text-xs text-[#171717] leading-relaxed whitespace-pre-line font-sans">
                {aiResponse.reply}
              </div>

              {/* Matched License & 1-Click Document Slot Creation */}
              {aiResponse.matchedLicense && (
                <div className="mt-3 pt-3 border-t border-[#D6D0C3] bg-[#F3EFE5] p-3 rounded-[3px] space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-mono-data uppercase font-bold text-[#18324A] bg-[#18324A]/10 px-1.5 py-0.5 rounded">
                        {aiResponse.matchedLicense.category}
                      </span>
                      <h4 className="font-bold text-xs text-[#171717] mt-0.5">
                        {aiResponse.matchedLicense.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono-data text-[#6E6A61] bg-white px-2 py-0.5 rounded border border-[#D6D0C3]">
                      ⏱️ {aiResponse.matchedLicense.slaDays} Working Days SLA
                    </span>
                  </div>

                  {/* Slot Action Button */}
                  {createdSlots ? (
                    <div className="bg-[#5D8068]/15 border border-[#5D8068] p-2.5 rounded flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#5D8068]">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>
                          {createdSlots.created.length} Document Slots Created in Vault!
                          {createdSlots.skipped.length > 0 &&
                            ` (${createdSlots.skipped.length} existing slots kept)`}
                        </span>
                      </div>
                      <button
                        onClick={() => navigate('/documents')}
                        className="text-[11px] font-bold text-[#18324A] hover:underline flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-[#5D8068] cursor-pointer"
                      >
                        Open Vault
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1">
                      <span className="text-[11px] text-[#6E6A61]">
                        Generate {aiResponse.matchedLicense.requiredDocuments.length} prerequisite
                        slots to satisfy this alert.
                      </span>
                      <button
                        onClick={() => handleCreateVaultSlots(aiResponse.matchedLicense)}
                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-[#18324A] hover:bg-[#1f3f5c] text-white text-xs font-semibold py-1.5 px-3 rounded-[3px] border border-[#262522] transition-colors cursor-pointer"
                      >
                        <FilePlus className="w-3.5 h-3.5 text-[#C08A3E]" />
                        <span>Create Required Slots in Vault</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Inline Query Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskSneha();
            }}
            className="flex items-center gap-2 pt-1"
          >
            <div className="relative flex-1">
              <input
                type="text"
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                placeholder="Ask Sneha how to respond to an alert, resolve SLA breach, or list required renewal documents..."
                className="w-full bg-white border border-[#262522]/30 rounded-[4px] px-3.5 py-2 text-xs text-[#171717] placeholder-[#8B8982] focus:outline-none focus:border-[#18324A] focus:ring-1 focus:ring-[#18324A]"
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              disabled={!queryInput.trim() || isLoading}
              className="bg-[#18324A] hover:bg-[#1f3f5c] disabled:bg-[#8B8982] text-white text-xs font-semibold px-4 py-2 rounded-[4px] border border-[#262522] flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              {isLoading ? (
                <span>Consulting...</span>
              ) : (
                <>
                  <span>Ask Sneha</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export const SnehaAlertAdvisor = GraceAlertAdvisor;
