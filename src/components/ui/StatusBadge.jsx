import React from 'react';

export default function StatusBadge({ status, label, className = '' }) {
  // Normalize status key
  const key = (status || '').toLowerCase().replace(/[\s-]/g, '_');

  let config = {
    symbol: '○',
    text: label || 'Not Started',
    color: '#8B8982',
    bg: 'rgba(139, 137, 130, 0.12)',
    border: 'rgba(139, 137, 130, 0.35)',
  };

  if (['approved', 'completed', 'verified', 'successful', 'active', 'renewed', 'on_track'].includes(key)) {
    config = {
      symbol: '✓',
      text: label || 'Approved',
      color: '#5D8068',
      bg: 'rgba(93, 128, 104, 0.12)',
      border: 'rgba(93, 128, 104, 0.35)',
    };
  } else if (['uploaded', 'ready_to_submit'].includes(key)) {
    config = {
      symbol: '↑',
      text: label || (key === 'ready_to_submit' ? 'Ready to Submit' : 'Uploaded'),
      color: '#18324A',
      bg: 'rgba(24, 50, 74, 0.12)',
      border: 'rgba(24, 50, 74, 0.35)',
    };
  } else if (['draft'].includes(key)) {
    config = {
      symbol: '✎',
      text: label || 'Draft',
      color: '#8B8982',
      bg: 'rgba(139, 137, 130, 0.12)',
      border: 'rgba(139, 137, 130, 0.35)',
    };
  } else if (['withdrawn'].includes(key)) {
    config = {
      symbol: '—',
      text: label || 'Withdrawn',
      color: '#8B8982',
      bg: 'rgba(139, 137, 130, 0.12)',
      border: 'rgba(139, 137, 130, 0.35)',
    };
  } else if ([
    'in_review',
    'review',
    'under_review',
    'pending',
    'upcoming',
    'waiting',
    'in_progress',
    'ready_to_apply',
    'submitted',
    'inspection_pending',
    'decision_pending',
    'due_soon',
    'renewal_in_progress',
    'scheduled',
    'requested',
  ].includes(key)) {
    config = {
      symbol: '●',
      text: label || 'In Review',
      color: '#C08A3E',
      bg: 'rgba(192, 138, 62, 0.12)',
      border: 'rgba(192, 138, 62, 0.35)',
    };
  } else if ([
    'action_required',
    'action',
    'rejected',
    'expired',
    'missing',
    'critical',
    'issue',
    'query_raised',
    'documents_required',
    'breached',
    'failed',
    'at_risk',
  ].includes(key)) {
    config = {
      symbol: '!',
      text: label || 'Action Required',
      color: '#B85C4A',
      bg: 'rgba(184, 92, 74, 0.12)',
      border: 'rgba(184, 92, 74, 0.35)',
    };
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[3px] text-xs font-medium font-mono-data tracking-tight border ${className}`}
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <span className="font-bold select-none text-[11px] leading-none" aria-hidden="true">
        {config.symbol}
      </span>
      <span className="font-sans text-[11px] uppercase tracking-wider font-semibold text-[#171717]">
        {config.text}
      </span>
    </span>
  );
}
