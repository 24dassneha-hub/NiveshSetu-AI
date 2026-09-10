import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import Button from '../ui/Button';

export default function RoadmapDetailModal({ node, isOpen, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !node) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-node-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FAF8F2] border border-[#262522] rounded-[4px] p-6 shadow-[0_16px_48px_rgba(23,23,23,0.15)] z-10 auth-page-enter">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 mb-4 border-b border-[#262522]">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono-data text-[10px] text-[#6E6A61] uppercase tracking-wider">
                STAGE 0{node.stepNumber} // CLEARANCE SPECIFICATION
              </span>
            </div>
            <h3
              id="modal-node-title"
              className="text-xl font-bold text-[#171717] tracking-tight uppercase"
            >
              {node.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#171717] hover:bg-[#E9E1D0] rounded-[3px] border border-[#262522] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#18324A]"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Node Status Banner */}
        <div className="flex items-center justify-between p-3 bg-[#E9E1D0] border border-[#D6D0C3] rounded-[3px] mb-4">
          <span className="text-xs font-mono-data font-semibold text-[#171717]">
            CURRENT STATUS:
          </span>
          <StatusBadge status={node.status} label={node.statusLabel} />
        </div>

        {/* Detail Fields */}
        <div className="space-y-3.5 mb-6 text-xs font-mono-data">
          {/* Authority */}
          <div className="p-3 bg-[#FFFFFF] border border-[#262522] rounded-[3px]">
            <span className="text-[10px] text-[#6E6A61] uppercase block mb-0.5">
              AUTHORITY:
            </span>
            <span className="font-semibold text-[#171717] font-sans text-sm block">
              {node.authority}
            </span>
          </div>

          {/* Submission Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px]">
              <span className="text-[10px] text-[#6E6A61] uppercase block mb-0.5">
                SUBMITTED:
              </span>
              <span className="font-bold text-[#171717]">
                {node.submittedDate || '—'}
              </span>
            </div>

            <div className="p-2.5 bg-[#FFFFFF] border border-[#D6D0C3] rounded-[3px]">
              <span className="text-[10px] text-[#6E6A61] uppercase block mb-0.5">
                EXPECTED UPDATE:
              </span>
              <span className="font-bold text-[#18324A]">
                {node.expectedUpdate || '—'}
              </span>
            </div>
          </div>

          {/* Next Action */}
          <div className="p-3 bg-[#FFFFFF] border border-[#262522] rounded-[3px]">
            <span className="text-[10px] text-[#6E6A61] uppercase block mb-0.5">
              NEXT ACTION:
            </span>
            <span className="font-semibold text-[#30302D] font-sans leading-relaxed block">
              {node.nextAction}
            </span>
          </div>

          {/* Description */}
          <div className="p-3 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[3px] text-[#6E6A61] font-sans leading-relaxed text-xs">
            {node.description}
          </div>
        </div>

        {/* Footer buttons */}
        <div className="pt-3 border-t border-[#D6D0C3] flex items-center justify-end gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            CLOSE
          </Button>
        </div>
      </div>
    </div>
  );
}
