import React, { useState } from 'react';
import { Loader2, ArrowLeft, Mail } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import Input from '../components/ui/Input';
import AuthSuccess from '../components/auth/AuthSuccess';
import Button from '../components/ui/Button';
import { Link, useNavigate } from '../router';

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (val) => {
    if (!val.trim()) return 'Enter a valid email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Enter a valid email address.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const err = validateEmail(email);
    setTouched(true);
    setError(err);

    if (err) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 800);
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthSuccess
          title="CHECK YOUR EMAIL"
          message={`We've sent password reset instructions to ${email}. Follow the instructions in the email to recover access to your compliance workspace.`}
          primaryActionText="RETURN TO SIGN IN"
          primaryActionRoute="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        category="ACCOUNT / PASSWORD RESET"
        heading="RESET YOUR PASSWORD"
        description="Enter your account email and we'll guide you through the next step."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div>
          <Input
            label="EMAIL ADDRESS"
            id="resetEmail"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched) setError(validateEmail(e.target.value));
            }}
            onBlur={() => {
              setTouched(true);
              setError(validateEmail(email));
            }}
            error={touched ? error : ''}
            autoComplete="email"
            required
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] max-md:h-[50px] bg-[#18324A] text-[#FAF8F2] font-semibold text-sm tracking-wider uppercase border border-[#18324A] rounded-[4px] hover:bg-[#244B66] active:bg-[#112435] transition-[background-color,transform] duration-150 active:duration-100 active:translate-y-[1px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[rgba(24,50,74,0.25)] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F2]" />
                <span>SENDING INSTRUCTIONS...</span>
              </>
            ) : (
              <span>SEND RESET INSTRUCTIONS</span>
            )}
          </button>
        </div>

        <div className="pt-2 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#30302D] hover:text-[#18324A] font-mono-data transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>BACK TO SIGN IN</span>
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
