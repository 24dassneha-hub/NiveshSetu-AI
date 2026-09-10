import React from 'react';
import { ChevronDown } from 'lucide-react';

export default function Select({
  label,
  id,
  value,
  onChange,
  onBlur,
  options = [],
  placeholder = 'Select an option',
  error,
  helperText,
  required = false,
  className = '',
  disabled = false,
  ...props
}) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold uppercase tracking-[0.08em] text-[#30302D] mb-2 font-mono-data"
        >
          {label} {required && <span className="text-[#B85C4A]">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`w-full h-[52px] md:h-[52px] max-md:h-[50px] bg-[#FAF8F2] text-[#171717] px-4 pr-10 text-[15px] font-sans rounded-[4px] border appearance-none transition-[border-color,box-shadow] duration-160 focus:outline-none ${
            error
              ? 'border-[#B85C4A] focus:border-[#B85C4A] focus:ring-[3px] focus:ring-[rgba(184,92,74,0.12)]'
              : 'border-[#262522] focus:border-[#18324A] focus:ring-[3px] focus:ring-[rgba(24,50,74,0.08)]'
          } ${disabled ? 'opacity-60 cursor-not-allowed bg-[#E9E1D0]' : 'cursor-pointer'} ${className}`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="text-[#8B8982]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const val = typeof opt === 'object' ? opt.value : opt;
            const text = typeof opt === 'object' ? opt.label : opt;
            return (
              <option key={val} value={val}>
                {text}
              </option>
            );
          })}
        </select>

        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6E6A61]">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {error ? (
        <p id={`${selectId}-error`} className="text-xs text-[#B85C4A] font-mono-data mt-1.5 flex items-center gap-1 auth-error-enter">
          <span>•</span>
          <span>{error}</span>
        </p>
      ) : helperText ? (
        <p className="text-xs text-[#6E6A61] font-mono-data mt-1.5">{helperText}</p>
      ) : null}
    </div>
  );
}
