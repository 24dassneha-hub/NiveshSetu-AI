import React from 'react';

export default function PasswordRequirements({ password = '' }) {
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const requirements = [
    { label: 'At least 8 characters', valid: hasMinLength },
    { label: 'One uppercase letter', valid: hasUppercase },
    { label: 'One number', valid: hasNumber },
  ];

  return (
    <div className="mt-3 p-3.5 bg-[#FAF8F2] border border-[#D6D0C3] rounded-[4px]">
      <span className="block text-[11px] font-mono-data font-bold uppercase tracking-[0.08em] text-[#30302D] mb-2">
        PASSWORD REQUIREMENTS
      </span>
      <div className="space-y-1.5 text-xs font-mono-data">
        {requirements.map((req, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 transition-colors duration-150"
            style={{ color: req.valid ? '#5D8068' : '#8B8982' }}
          >
            <span className="font-bold text-[13px] leading-none">
              {req.valid ? '✓' : '○'}
            </span>
            <span className={req.valid ? 'text-[#171717]' : 'text-[#6E6A61]'}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
