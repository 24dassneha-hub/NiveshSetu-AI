import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Input from '../ui/Input';

export default function PasswordField({
  label = 'PASSWORD',
  id = 'password',
  placeholder = 'Enter your password',
  value,
  onChange,
  onBlur,
  error,
  helperText,
  required = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Input
      label={label}
      id={id}
      type={showPassword ? 'text' : 'password'}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      helperText={helperText}
      required={required}
      rightElement={
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          className="p-1.5 text-[#6E6A61] hover:text-[#171717] focus:outline-none focus:ring-1 focus:ring-[#18324A] rounded-[2px]"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      }
      {...props}
    />
  );
}
