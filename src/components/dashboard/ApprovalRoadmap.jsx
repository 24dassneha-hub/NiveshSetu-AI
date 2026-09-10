import React from 'react';
import { ChevronRight, Plus, FileCheck } from 'lucide-react';
import { Link } from '../../router';
import Button from '../ui/Button';

export default function ApprovalRoadmap({ roadmap = [], onSelectNode }) {
  const getStatusTheme = (status) => {
    switch (status) {
      case 'completed':
        return {
          color: '#5D8068',
          bg: 'rgba(93, 128, 104, 0.12)',
          border: 'rgba(93, 128, 104, 0.4)',
          dotBg: '#5D8068',
        };
      case 'in_review':
        return {
          color: '#C08A3E',
          bg: 'rgba(192, 138, 62, 0.12)',
          border: 'rgba(192, 138, 62, 0.4)',
          dotBg: '#C08A3E',
        };
      case 'action_required':
        return {
          color: '#B85C4A',
          bg: 'rgba(184, 92, 74, 0.12)',
          border: '#B85C4A',
          dotBg: '#B85C4A',
        };
      default:
        return {
          color: '#8B8982',
          bg: 'rgba(139, 137, 130, 0.12)',
          border: 'rgba(139, 137, 130, 0.4)',
          dotBg: '#8B8982',
        };
    }
  };

  const completedCount = roadmap.filter((n) => n.status === 'completed').length;
  const inReviewCount = roadmap.filter((n) => n.status === 'in_review').length;
  const actionCount = roadmap.filter((n) => n.status === 'action_required').length;

  return (
    <div className="bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-5 sm:p-6 shadow-[0_4px_16px_rgba(23,23,23,0.03)]">
      {/* Roadmap Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 mb-6 border-b border-[#262522]">
        <div>
          <h2 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight uppercase">
            APPROVAL ROADMAP
          </h2>
          <p className="text-xs font-mono-data text-[#6E6A61] mt-0.5">
            {roadmap.length > 0
              ? `${roadmap.length} clearances · ${completedCount} completed · ${inReviewCount} in review · ${actionCount} action required`
              : 'No approvals recorded in this enterprise workspace.'}
          </p>
        </div>
        <span className="text-[11px] font-mono-data text-[#18324A] bg-[#E9E1D0] px-2 py-0.5 rounded-[2px] border border-[#D6D0C3] self-start sm:self-auto">
          INTERACTIVE DAG • CLICK NODE TO INSPECT
        </span>
      </div>

      {/* Empty State when no approvals entered yet */}
      {roadmap.length === 0 ? (
        <div className="py-10 text-center space-y-3">
          <div className="w-10 h-10 rounded-[4px] bg-[#E9E1D0] border border-[#262522] flex items-center justify-center mx-auto text-[#18324A]">
            <FileCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-[#171717] uppercase tracking-tight">
            NO APPROVALS YET
          </h3>
          <p className="text-xs text-[#6E6A61] max-w-md mx-auto font-sans">
            Complete your business profile to discover the approvals applicable to your business, or add clearances manually.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <Link to="/business-profile">
              <Button variant="primary" size="sm">
                Complete Business Profile
              </Button>
            </Link>
            <Link to="/approvals/new">
              <Button variant="secondary" size="sm" icon={Plus}>
                Add Approval Manually
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>

      {/* ========================================================================= */}
      {/* DESKTOP WORKFLOW (Horizontal: md and up)                                 */}
      {/* ========================================================================= */}
      <div className="hidden md:block overflow-x-auto pb-3">
        <div className="min-w-[860px] flex items-center justify-between relative py-2">
          {roadmap.map((node, index) => {
            const theme = getStatusTheme(node.status);
            const isCompletedConnection =
              node.status === 'completed' &&
              index < roadmap.length - 1 &&
              roadmap[index + 1].status === 'completed';

            return (
              <React.Fragment key={node.id}>
                {/* Node Box */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => onSelectNode(node)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onSelectNode(node);
                    }
                  }}
                  className="flex flex-col items-center text-center p-3 rounded-[4px] border border-[#262522] bg-[#FAF8F2] hover:bg-[#FFFFFF] hover:border-[#18324A] hover:scale-[1.01] transition-[background-color,border-color,transform] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer w-28 shrink-0 relative z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] shadow-[0_2px_8px_rgba(23,23,23,0.04)]"
                  aria-label={`Open details for ${node.name}`}
                >
                  {/* Status Symbol Badge */}
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs mb-2 border"
                    style={{
                      color: theme.color,
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                    }}
                  >
                    {node.symbol}
                  </div>

                  {/* Node Name */}
                  <span className="font-sans font-bold text-xs text-[#171717] leading-tight line-clamp-2 h-8 flex items-center">
                    {node.name}
                  </span>

                  {/* Status Pill */}
                  <span
                    className="meta-label text-[9px] px-1.5 py-0.5 rounded-[2px] mt-2 font-mono-data uppercase tracking-wider"
                    style={{
                      color: theme.color,
                      backgroundColor: theme.bg,
                    }}
                  >
                    {node.statusLabel}
                  </span>
                </div>

                {/* Connecting Line between nodes */}
                {index < roadmap.length - 1 && (
                  <div
                    className="flex-1 h-0.5 min-w-[12px] relative z-0"
                    style={{
                      backgroundColor: isCompletedConnection ? '#5D8068' : '#D6D0C3',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MOBILE WORKFLOW (Vertical: below md)                                     */}
      {/* ========================================================================= */}
      <div className="md:hidden space-y-3 relative pl-2">
        {roadmap.map((node, index) => {
          const theme = getStatusTheme(node.status);
          const isCompletedConnection =
            node.status === 'completed' &&
            index < roadmap.length - 1 &&
            roadmap[index + 1].status === 'completed';

          return (
            <div key={node.id} className="relative">
              {/* Vertical connector line */}
              {index < roadmap.length - 1 && (
                <div
                  className="absolute left-4 top-10 bottom-[-14px] w-0.5 z-0"
                  style={{
                    backgroundColor: isCompletedConnection ? '#5D8068' : '#D6D0C3',
                  }}
                />
              )}

              {/* Interactive Node Card */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => onSelectNode(node)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectNode(node);
                  }
                }}
                className="relative z-10 flex items-center justify-between p-3.5 bg-[#FAF8F2] hover:bg-[#FFFFFF] border border-[#262522] rounded-[4px] transition-[background-color,border-color] duration-160 ease-[cubic-bezier(0.22,1,0.36,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border"
                    style={{
                      color: theme.color,
                      backgroundColor: theme.bg,
                      borderColor: theme.border,
                    }}
                  >
                    {node.symbol}
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-sans font-bold text-xs text-[#171717] truncate">
                      {node.name}
                    </span>
                    <span
                      className="text-[10px] font-mono-data uppercase tracking-wider mt-0.5"
                      style={{ color: theme.color }}
                    >
                      {node.statusLabel}
                    </span>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-[#6E6A61] shrink-0 ml-2" />
              </div>
            </div>
          );
        })}
      </div>
        </>
      )}
    </div>
  );
}
