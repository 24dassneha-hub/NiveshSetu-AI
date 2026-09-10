import React from 'react';

export default function Input({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  className = '',
  rightElement,
  disabled = false,
  ...props
}) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#30302D] mb-2 font-mono-data"
        >
          {label} {required && <span className="text-[#B85C4A]">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${inputId}-error` : undefined}
          className={`w-full h-[52px] md:h-[52px] max-md:h-[50px] bg-[#FAF8F2] text-[#171717] px-4 text-[15px] font-sans rounded-[4px] border transition-[border-color,box-shadow] duration-160 placeholder:text-[#8B8982] focus:outline-none ${
            error
              ? 'border-[#B85C4A] focus:border-[#B85C4A] focus:ring-[3px] focus:ring-[rgba(184,92,74,0.12)]'
              : 'border-[#262522] focus:border-[#18324A] focus:ring-[3px] focus:ring-[rgba(24,50,74,0.08)]'
          } ${rightElement ? 'pr-12' : ''} ${disabled ? 'opacity-60 cursor-not-allowed bg-[#E9E1D0]' : ''} ${className}`}
          {...props}
        />

        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            {rightElement}
          </div>
        )}
      </div>

      {error ? (
        <p id={`${inputId}-error`} className="text-xs text-[#B85C4A] font-mono-data mt-1.5 flex items-center gap-1 auth-error-enter">
          <span>•</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#6E6A61] font-mono-data mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}
