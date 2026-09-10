import React, { useEffect, useRef } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { Link } from '../../router';

export default function NotificationsDropdown({
  isOpen,
  onClose,
  notifications = [],
  onSelectNotification,
}) {
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const count = notifications ? notifications.length : 0;

  return (
    <div
      ref={dropdownRef}
      className="absolute right-4 top-16 w-80 sm:w-96 bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_12px_40px_rgba(23,23,23,0.12)] z-50 overflow-hidden auth-page-enter"
      role="region"
      aria-label="Notifications panel"
    >
      {/* Header */}
      <div className="p-3.5 bg-[#FAF8F2] border-b border-[#262522] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              count > 0 ? 'bg-[#B85C4A]' : 'bg-[#5D8068]'
            }`}
          />
          <h3 className="font-mono-data font-bold text-xs text-[#171717] tracking-wider uppercase">
            NOTIFICATIONS ({count})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-[#6E6A61] hover:text-[#171717] rounded-[2px]"
          aria-label="Close notifications"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Dynamic Warning / Status Subheader */}
      <div
        className={`px-3.5 py-2 border-b flex items-center justify-between text-[11px] font-mono-data font-bold ${
          count > 0
            ? 'bg-[#E9E1D0] border-[#D6D0C3] text-[#B85C4A]'
            : 'bg-[#EBF2EC] border-[#5D8068]/30 text-[#5D8068]'
        }`}
      >
        <span>
          {count > 0
            ? `${count} ACTION${count === 1 ? '' : 'S'} REQUIRE ATTENTION`
            : 'ALL CLEAR • 0 ACTIVE ALERTS'}
        </span>
        <span>{count > 0 ? 'HIGH PRIORITY' : 'HEALTHY'}</span>
      </div>

      {/* Notification Items or Clean Empty State */}
      <div className="divide-y divide-[#D6D0C3] max-h-64 overflow-y-auto">
        {count > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onClose();
                if (onSelectNotification) onSelectNotification(notif.nodeId);
              }}
              className="p-3.5 hover:bg-[#E9E1D0] transition-colors cursor-pointer group"
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="font-sans font-bold text-xs text-[#171717] group-hover:text-[#18324A] leading-tight">
                  {notif.title}
                </span>
                <span className="text-[10px] font-mono-data text-[#6E6A61] shrink-0">
                  {notif.time}
                </span>
              </div>
              <p className="text-[11px] text-[#6E6A61] font-mono-data leading-relaxed">
                {notif.detail}
              </p>
            </div>
          ))
        ) : (
          <div className="p-6 text-center text-xs font-mono-data text-[#6E6A61]">
            <CheckCircle2 className="w-8 h-8 text-[#5D8068] mx-auto mb-2 opacity-80" />
            <p className="font-bold text-[#171717] mb-1">No Active Compliance Alerts</p>
            <p className="text-[11px] text-[#8B8982]">Your statutory filings and clearance deadlines are up to date.</p>
          </div>
        )}
      </div>

      {/* Footer CTA */}
      <div className="p-2.5 bg-[#FAF8F2] border-t border-[#262522] flex items-center justify-between">
        <Link
          to="/alerts"
          onClick={onClose}
          className="w-full text-center py-1 text-xs font-mono-data font-bold text-[#18324A] hover:bg-[#E9E1D0] rounded-[2px] transition-colors uppercase tracking-wider block"
        >
          VIEW ALL ALERTS →
        </Link>
      </div>
    </div>
  );
}
