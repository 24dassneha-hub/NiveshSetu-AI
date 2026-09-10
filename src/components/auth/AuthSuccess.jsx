import React from 'react';
import { Check, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { useNavigate } from '../../router';

export default function AuthSuccess({
  title = 'SIGN IN SUCCESSFUL',
  message = 'Authentication is currently running in demo mode.',
  primaryActionText = 'CONTINUE TO WORKSPACE →',
  primaryActionRoute = '/dashboard',
  secondaryActionText,
  secondaryActionRoute = '/login',
  onPrimaryClick,
  onSecondaryClick,
}) {
  const navigate = useNavigate();

  const handlePrimary = () => {
    if (onPrimaryClick) onPrimaryClick();
    else if (primaryActionRoute) navigate(primaryActionRoute);
  };

  const handleSecondary = () => {
    if (onSecondaryClick) onSecondaryClick();
    else if (secondaryActionRoute) navigate(secondaryActionRoute);
  };

  return (
    <div className="p-6 md:p-8 bg-[#FAF8F2] border border-[#262522] rounded-[4px] shadow-[0_8px_24px_rgba(23,23,23,0.06)] auth-success-enter">
      <div className="w-12 h-12 rounded-[4px] bg-[rgba(93,128,104,0.15)] border border-[#5D8068] text-[#5D8068] flex items-center justify-center font-bold text-xl mb-4 auth-success-icon">
        ✓
      </div>

      <div className="meta-label text-[#5D8068] text-[11px] mb-1">
        VERIFICATION COMPLETE
      </div>

      <h2 className="text-2xl sm:text-3xl font-bold text-[#171717] tracking-tight mb-2">
        {title}
      </h2>

      <p className="text-sm text-[#6E6A61] leading-relaxed mb-6 font-sans">
        {message}
      </p>

      <div className="space-y-3">
        <Button
          variant="primary"
          size="lg"
          className="w-full justify-center"
          onClick={handlePrimary}
        >
          {primaryActionText}
        </Button>

        {secondaryActionText && (
          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center"
            onClick={handleSecondary}
          >
            {secondaryActionText}
          </Button>
        )}
      </div>
    </div>
  );
}
