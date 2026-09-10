import React from 'react';

export default function AuthHeader({
  category = 'ACCOUNT / SIGN IN',
  heading = 'SIGN IN',
  description = 'Access your business approvals, applications and compliance workspace.',
  className = '',
}) {
  return (
    <div className={`mb-8 md:mb-9 ${className}`}>
      <span className="block text-xs font-semibold uppercase tracking-[0.12em] text-[#6E6A61] mb-2 font-mono-data">
        {category}
      </span>
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-[#171717] leading-tight mb-2">
        {heading}
      </h1>
      {description && (
        <p className="text-sm sm:text-base text-[#6E6A61] leading-relaxed max-w-lg">
          {description}
        </p>
      )}
    </div>
  );
}
