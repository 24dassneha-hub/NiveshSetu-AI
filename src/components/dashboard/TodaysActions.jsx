import React from 'react';
import { ArrowRight, AlertTriangle, Clock, CheckCircle, Sparkles } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function TodaysActions({ actions, onSelectAction }) {
  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)] flex flex-col justify-between h-full">
      {/* Header */}
      <div className="pb-3 mb-2 border-b border-[#262522] flex items-center justify-between">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight uppercase">
            TODAY'S ACTIONS
          </h2>
          <p className="text-xs font-mono-data text-[#6E6A61] mt-0.5">
            Items that require your attention.
          </p>
        </div>
        <button
          onClick={() => {
            const event = new CustomEvent('openSnehaChat', {
              detail: {
                query: 'What actions and statutory deadlines require my immediate compliance attention today?',
              },
            });
            window.dispatchEvent(event);
            window.dispatchEvent(new CustomEvent('openGraceChat', {
              detail: {
                query: 'What actions and statutory deadlines require my immediate compliance attention today?',
              },
            }));
          }}
          className="text-[11px] font-mono-data text-[#18324A] hover:text-[#C08A3E] bg-[#E9E1D0] hover:bg-[#D6D0C3] px-2.5 py-1.5 rounded-[3px] flex items-center gap-1.5 transition-colors font-semibold border border-[#262522]/15 cursor-pointer"
          title="Consult Sneha AI regarding today's urgent actions"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C08A3E]" />
          <span>Sneha AI Guide</span>
        </button>
      </div>

      {/* Action Rows */}
      {actions.length === 0 ? (
        <div className="py-8 text-center space-y-2">
          <CheckCircle className="w-7 h-7 text-[#5D8068] mx-auto" />
          <h3 className="text-xs font-bold text-[#171717] uppercase">All Tasks Up To Date</h3>
          <p className="text-[11px] text-[#6E6A61] font-sans max-w-xs mx-auto">
            No immediate compliance actions required today. New tasks will appear here as approvals are scrutinized or renewed.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-[#D6D0C3]">
          {actions.map((action) => (
          <div
            key={action.id}
            onClick={() => onSelectAction && onSelectAction(action.nodeId)}
            className="py-3.5 sm:py-4 px-2 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[3px] hover:bg-[#E9E1D0] transition-[background-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer group"
          >
            {/* Left & Center Information */}
            <div className="flex items-start sm:items-center gap-3 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 mt-1.5 sm:mt-0 ${
                  action.status === 'action_required' ? 'bg-[#B85C4A]' : 'bg-[#C08A3E]'
                }`}
                aria-hidden="true"
              />

              <div className="flex flex-col min-w-0">
                <span className="font-sans font-bold text-xs sm:text-sm text-[#171717] group-hover:text-[#18324A] transition-colors truncate">
                  {action.title}
                </span>
                <div className="flex items-center gap-2 mt-0.5 text-[11px] font-mono-data">
                  <span
                    className={`font-semibold ${
                      action.status === 'action_required'
                        ? 'text-[#B85C4A]'
                        : 'text-[#C08A3E]'
                    }`}
                  >
                    {action.statusLabel}
                  </span>
                  <span className="text-[#D6D0C3]">·</span>
                  <span className="text-[#6E6A61]">{action.due}</span>
                </div>
              </div>
            </div>

            {/* Right CTA */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onSelectAction && onSelectAction(action.nodeId);
              }}
              className="self-end sm:self-auto px-2.5 py-1 text-xs font-mono-data font-semibold text-[#18324A] bg-[#FFFFFF] hover:bg-[#18324A] hover:text-[#FAF8F2] border border-[#262522] rounded-[3px] transition-[background-color,color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
            >
              {action.ctaText}
            </button>
          </div>
        ))}
        </div>
      )}
    </div>
  );
}
