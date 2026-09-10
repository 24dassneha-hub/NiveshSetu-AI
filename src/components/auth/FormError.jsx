import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function FormError({ error }) {
  if (!error) return null;

  return (
    <p className="text-xs text-[#B85C4A] font-mono-data mt-1.5 flex items-center gap-1.5">
      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
      <span>{error}</span>
    </p>
  );
}
