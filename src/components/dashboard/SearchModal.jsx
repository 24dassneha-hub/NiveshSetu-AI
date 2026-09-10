import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';

export default function SearchModal({ isOpen, onClose, roadmap, onSelectNode }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);

  const handleClose = useCallback(() => {
    setQuery('');
    onClose();
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const filtered = roadmap.filter((node) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      node.name.toLowerCase().includes(q) ||
      node.authority.toLowerCase().includes(q) ||
      node.status.toLowerCase().includes(q) ||
      node.statusLabel.toLowerCase().includes(q)
    );
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="search-modal-title"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#171717]/60 backdrop-blur-[1px] transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-lg bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_16px_48px_rgba(23,23,23,0.15)] z-10 overflow-hidden auth-page-enter">
        {/* Search Header Input */}
        <div className="p-3 bg-[#FAF8F2] border-b border-[#262522] flex items-center gap-2.5">
          <Search className="w-4 h-4 text-[#18324A] shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            id="search-modal-title"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search approvals, authorities, or status..."
            className="w-full text-xs sm:text-sm font-sans bg-transparent text-[#171717] placeholder:text-[#6E6A61] focus:outline-none"
            aria-label="Search approvals"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-[#6E6A61] hover:text-[#171717]"
              aria-label="Clear query"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-block text-[10px] font-mono-data px-1.5 py-0.5 bg-[#E9E1D0] border border-[#D6D0C3] rounded text-[#6E6A61]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-72 overflow-y-auto divide-y divide-[#D6D0C3] p-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs font-mono-data text-[#6E6A61]">
              No approvals found matching "{query}".
            </div>
          ) : (
            filtered.map((node) => (
              <div
                key={node.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  handleClose();
                  onSelectNode(node);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleClose();
                    onSelectNode(node);
                  }
                }}
                className="p-3 flex items-center justify-between hover:bg-[#E9E1D0] rounded-[3px] transition-colors cursor-pointer group focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18324A]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs bg-[#FAF8F2] border border-[#262522] shrink-0">
                    {node.symbol}
                  </span>
                  <div className="flex flex-col min-w-0">
                    <span className="font-sans font-bold text-xs text-[#171717] group-hover:text-[#18324A] truncate">
                      {node.name}
                    </span>
                    <span className="text-[11px] text-[#6E6A61] font-mono-data truncate">
                      {node.authority}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <StatusBadge status={node.status} label={node.statusLabel} />
                  <ChevronRight className="w-4 h-4 text-[#6E6A61]" />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-3 py-2 bg-[#E9E1D0] border-t border-[#D6D0C3] flex items-center justify-between text-[11px] font-mono-data text-[#6E6A61]">
          <span>{filtered.length} approvals indexed</span>
          <span>Click to inspect dossier</span>
        </div>
      </div>
    </div>
  );
}
