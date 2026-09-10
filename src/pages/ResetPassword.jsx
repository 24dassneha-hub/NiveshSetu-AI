import React, { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import PasswordField from '../components/auth/PasswordField';
import PasswordRequirements from '../components/auth/PasswordRequirements';
import AuthSuccess from '../components/auth/AuthSuccess';
import Button from '../components/ui/Button';
import { Link, useNavigate } from '../router';

export default function ResetPassword() {
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [touched, setTouched] = useState({ password: false, confirmPassword: false });
  const [errors, setErrors] = useState({ password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const validatePassword = (val) => {
    if (!val) return 'This field is required.';
    if (val.length < 8) return 'Password must be at least 8 characters.';
    if (!/[A-Z]/.test(val)) return 'Password must contain at least one uppercase letter.';
    if (!/[0-9]/.test(val)) return 'Password must contain at least one number.';
    return '';
  };

  const validateConfirm = (val, original) => {
    if (!val) return 'This field is required.';
    if (val !== original) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const passErr = validatePassword(password);
    const confErr = validateConfirm(confirmPassword, password);

    setTouched({ password: true, confirmPassword: true });
    setErrors({ password: passErr, confirmPassword: confErr });

    if (passErr || confErr) return;

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
          title="PASSWORD UPDATED"
          message="Your password has been updated successfully. You can now use your new credentials to access your NiveshSetu workspace."
          primaryActionText="SIGN IN"
          primaryActionRoute="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthHeader
        category="ACCOUNT / PASSWORD RESET"
        heading="CREATE A NEW PASSWORD"
        description="Ensure your new password complies with regulatory data protection guidelines."
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <PasswordField
            label="NEW PASSWORD"
            id="newPassword"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, password: true }));
              setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
            }}
            error={touched.password ? errors.password : ''}
            required
          />

          {/* Live password requirements tracker */}
          <PasswordRequirements password={password} />
        </div>

        <div>
          <PasswordField
            label="CONFIRM NEW PASSWORD"
            id="confirmNewPassword"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (touched.confirmPassword) {
                setErrors((prev) => ({
                  ...prev,
                  confirmPassword: validateConfirm(e.target.value, password),
                }));
              }
            }}
            onBlur={() => {
              setTouched((prev) => ({ ...prev, confirmPassword: true }));
              setErrors((prev) => ({
                ...prev,
                confirmPassword: validateConfirm(confirmPassword, password),
              }));
            }}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            required
          />
        </div>

        <div className="pt-3">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] max-md:h-[50px] bg-[#18324A] text-[#FAF8F2] font-semibold text-sm tracking-wider uppercase border border-[#18324A] rounded-[4px] hover:bg-[#244B66] active:bg-[#112435] transition-[background-color,transform] duration-150 active:duration-100 active:translate-y-[1px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[rgba(24,50,74,0.25)] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F2]" />
                <span>UPDATING PASSWORD...</span>
              </>
            ) : (
              <span>UPDATE PASSWORD</span>
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
