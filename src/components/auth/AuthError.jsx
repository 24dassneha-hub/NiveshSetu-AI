import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function AuthError({ title = 'SIGN IN FAILED', message, className = '' }) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className={`p-3.5 bg-[rgba(184,92,74,0.08)] border border-[#B85C4A] rounded-[4px] text-xs text-[#B85C4A] mb-5 flex items-start gap-2.5 auth-error-enter ${className}`}
    >
      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#B85C4A]" />
      <div>
        <div className="font-mono-data font-bold tracking-wider uppercase text-[11px] mb-0.5">
          {title}
        </div>
        <div className="font-sans text-[13px] text-[#30302D] leading-snug">
          {message}
        </div>
      </div>
    </div>
  );
}
