import React from 'react';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium text-sm transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-[cubic-bezier(0.22,1,0.36,1)] active:duration-100 active:scale-[0.98] rounded-[4px] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#18324A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F3EFE5] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed select-none';


  const sizeStyles = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2.5 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#18324A] text-[#FAF8F2] border border-[#18324A] hover:bg-[#234563] active:bg-[#112435]',
    secondary:
      'bg-transparent text-[#171717] border border-[#262522] hover:bg-[#E9E1D0] active:bg-[#ded5c2]',
    outline:
      'bg-transparent text-[#30302D] border border-[#D6D0C3] hover:border-[#262522] hover:bg-[#FAF8F2]',
    ghost:
      'bg-transparent text-[#30302D] hover:bg-[#E9E1D0] active:bg-[#ded5c2]',
    white:
      'bg-[#FFFFFF] text-[#171717] border border-[#262522] hover:bg-[#FAF8F2]',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {Icon && iconPosition === 'left' && (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={2} />
      )}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && (
        <Icon className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} strokeWidth={2} />
      )}
    </button>
  );
}
