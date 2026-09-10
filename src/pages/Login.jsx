import React, { useState, useEffect } from 'react';
import {
  Loader2,
  Zap,
  KeyRound,
  Building2,
  SunMedium,
  ShieldCheck,
  CheckCircle2,
  Radio,
  Server,
  Cpu,
  Sparkles,
} from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import Input from '../components/ui/Input';
import PasswordField from '../components/auth/PasswordField';
import AuthError from '../components/auth/AuthError';
import AuthSuccess from '../components/auth/AuthSuccess';
import { Link, useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';
import { switchToDemoMode, switchToCleanMode } from '../data/appModeState';

const EVALUATOR_PERSONAS = [
  {
    id: 'msme',
    name: 'Omm Prakash',
    businessName: 'Omm Enterprises',
    sector: 'Food Processing & Agri-Business',
    district: 'Khordha',
    email: 'entrepreneur@odisha.gov.in',
    password: 'DemoPassword2026!',
    tag: 'MSME INDUSTRIALIST',
    tagColor: 'bg-[#18324A] text-[#FAF8F2]',
    icon: Building2,
    details: '6 active approvals • 8 documents • Food processing plant in Khordha',
  },
  {
    id: 'green',
    name: 'Dr. Rashmi Mohapatra',
    businessName: 'Konark Green Energy Ltd',
    sector: 'Renewable Energy & Solar Parks',
    district: 'Ganjam',
    email: 'konark.energy@odisha.gov.in',
    password: 'DemoPassword2026!',
    tag: 'GREEN ENERGY',
    tagColor: 'bg-[#3F624D] text-[#FAF8F2]',
    icon: SunMedium,
    details: 'CTE / CTO Pollution Consent • Grid Feasibility • 25MW Solar in Ganjam',
  },
  {
    id: 'officer',
    name: 'Shri P. K. Mohanty (GM)',
    businessName: 'District Industries Centre (DIC)',
    sector: 'Single Window Facilitation Desk',
    district: 'Khordha',
    email: 'dic.officer@odisha.gov.in',
    password: 'DemoPassword2026!',
    tag: 'NODAL OFFICER',
    tagColor: 'bg-[#8A6A14] text-[#FAF8F2]',
    icon: ShieldCheck,
    details: 'Statutory scrutiny officer • Inspection scheduler • Section 13(1) deemed clearances',
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedPersona, setSelectedPersona] = useState(EVALUATOR_PERSONAS[0]);

  const [email, setEmail] = useState(() => {
    try {
      return localStorage.getItem('niveshsetu_remembered_email') || '';
    } catch {
      return '';
    }
  });
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => {
    try {
      return Boolean(localStorage.getItem('niveshsetu_remembered_email'));
    } catch {
      return false;
    }
  });

  // Field interaction tracking
  const [touched, setTouched] = useState({ email: false, password: false });
  const [errors, setErrors] = useState({ email: '', password: '' });

  // Submission state
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const validateEmail = (val) => {
    if (!val.trim()) return 'Please enter your email address.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return 'Enter a valid email address.';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Please enter your password.';
    return '';
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === 'email') {
      setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    }
    if (field === 'password') {
      setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
    }
  };

  const handleSelectPersona = (persona) => {
    setSelectedPersona(persona);
    setEmail(persona.email);
    setPassword(persona.password);
    setTouched({ email: true, password: true });
    setErrors({ email: '', password: '' });
    setAuthError(null);
  };

  const handleDirectLaunchPersona = async (persona) => {
    setSelectedPersona(persona);
    setIsLoading(true);
    setAuthError(null);
    switchToDemoMode();
    try {
      const res = await login({
        email: persona.email,
        name: persona.name,
        fullName: persona.name,
        businessName: persona.businessName,
        district: persona.district,
        industrySector: persona.sector,
        accountType: persona.id === 'officer' ? 'officer' : 'business',
      });
      setIsLoading(false);
      if (res?.success) {
        setIsSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch {
      setIsLoading(false);
      navigate('/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    // Validate all
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailErr, password: passErr });

    if (emailErr || passErr) return;

    // Determine mode based on persona match
    const isDemoEmail = EVALUATOR_PERSONAS.some(
      (p) => p.email.toLowerCase() === email.trim().toLowerCase()
    );
    if (isDemoEmail) {
      switchToDemoMode();
    } else {
      switchToCleanMode();
    }

    // Persist or remove remembered email
    try {
      if (rememberMe) {
        localStorage.setItem('niveshsetu_remembered_email', email.trim());
      } else {
        localStorage.removeItem('niveshsetu_remembered_email');
      }
    } catch {
      // Storage access exception safe guard
    }

    setIsLoading(true);

    try {
      const res = await login({ email: email.trim(), password });
      setIsLoading(false);

      if (!res.success) {
        setAuthError({
          title: 'SIGN IN FAILED',
          message: res.error || "The email or password doesn't match our records.",
          showDemoBypass: true,
        });
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setAuthError({
        title: 'SIGN IN ERROR',
        message: err.message || 'Unable to connect to authentication server.',
        showDemoBypass: true,
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthSuccess
          title="SIGN IN SUCCESSFUL"
          message={`Session authenticated for ${selectedPersona?.businessName || 'Business Workspace'}. Establishing single-window sync...`}
          primaryActionText="CONTINUE TO WORKSPACE →"
          primaryActionRoute="/dashboard"
          secondaryActionText="SIGN IN WITH DIFFERENT ACCOUNT"
          onSecondaryClick={() => {
            setIsSuccess(false);
            setEmail('');
            setPassword('');
          }}
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <AuthHeader
        category="ACCOUNT / SIGN IN"
        heading="SIGN IN"
        description="Access your business approvals, applications and compliance workspace."
      />

      {/* SIH 2026 Jury Fast Pass & Persona Switcher */}
      <div className="mb-6 p-4 rounded-[6px] border border-[#C59B27]/40 bg-[#FAF6E9] shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#8A6A14] font-mono-data">
            <Sparkles className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>SIH 2026 Jury Evaluation Fast Pass</span>
          </div>
          <span className="px-2 py-0.5 text-[10px] font-mono-data font-bold rounded bg-[#C59B27]/20 text-[#8A6A14] flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 text-[#8A6A14] animate-pulse" />
            1-CLICK DEMO
          </span>
        </div>

        <p className="text-xs text-[#524E48] leading-relaxed mb-3">
          Select an evaluation persona below for immediate access or auto-filling credentials:
        </p>

        {/* 3 Personas Selection Grid */}
        <div className="space-y-2 mb-3">
          {EVALUATOR_PERSONAS.map((persona) => {
            const IconComponent = persona.icon;
            const isSelected = selectedPersona?.id === persona.id;

            return (
              <div
                key={persona.id}
                onClick={() => handleSelectPersona(persona)}
                className={`p-2.5 rounded-[4px] border cursor-pointer transition-all flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-[#18324A] bg-[#FFFFFF] shadow-xs'
                    : 'border-[#262522]/15 bg-[#FAF8F2]/60 hover:bg-[#FAF8F2]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#18324A] text-[#FAF8F2]' : 'bg-[#E9E1D0] text-[#18324A]'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-xs text-[#171717] truncate">
                        {persona.businessName}
                      </span>
                      <span
                        className={`text-[9px] font-mono-data font-semibold px-1.5 py-0.2 rounded ${persona.tagColor}`}
                      >
                        {persona.tag}
                      </span>
                    </div>
                    <div className="text-[11px] text-[#6E6A61] truncate font-sans">
                      {persona.details}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDirectLaunchPersona(persona);
                  }}
                  disabled={isLoading}
                  className="shrink-0 px-2.5 py-1.5 bg-[#18324A] hover:bg-[#244B66] text-[#FAF8F2] text-[11px] font-semibold rounded-[3px] flex items-center gap-1 transition-colors cursor-pointer"
                  title="Launch workspace directly with this persona"
                >
                  <Zap className="w-3 h-3 text-[#E5B54F]" />
                  <span>Launch</span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Action button row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleDirectLaunchPersona(selectedPersona)}
            disabled={isLoading}
            className="flex-1 py-2.5 px-3 bg-[#18324A] hover:bg-[#244B66] text-[#FAF8F2] font-semibold text-xs rounded-[4px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Launch workspace directly with selected persona"
          >
            <Zap className="w-3.5 h-3.5 text-[#E5B54F]" />
            <span>Launch Workspace</span>
          </button>
          <button
            type="button"
            onClick={() => handleSelectPersona(selectedPersona)}
            className="py-2.5 px-4 bg-white hover:bg-[#FAF8F2] text-[#18324A] font-semibold text-xs rounded-[4px] border border-[#262522]/30 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            title="Fill login form with selected persona credentials"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#6E6A61]" />
            <span>Fill Form</span>
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Email Field */}
        <div>
          <Input
            label="EMAIL ADDRESS"
            id="login-email"
            type="email"
            placeholder="Enter your email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (touched.email) {
                setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) }));
              }
              if (authError) setAuthError(null);
            }}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : ''}
            autoComplete="email"
            required
          />
        </div>

        {/* Password Field */}
        <div>
          <PasswordField
            label="PASSWORD"
            id="login-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (touched.password) {
                setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) }));
              }
              if (authError) setAuthError(null);
            }}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : ''}
            autoComplete="current-password"
            required
          />

          {/* Login Support Row */}
          <div className="flex items-center justify-between mt-3.5 text-xs font-mono-data">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none text-[#30302D]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded-[3px] border border-[#262522] bg-[#FAF8F2] text-[#18324A] focus:ring-1 focus:ring-[#18324A] cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <Link
              to="/forgot-password"
              className="text-[#18324A] hover:underline font-semibold"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Auth Error Banner with optional Demo Fallback */}
        {authError && (
          <div className="space-y-2">
            <AuthError title={authError.title} message={authError.message} />
            {authError.showDemoBypass && (
              <div className="p-3 bg-[#FAF8F2] border border-[#18324A]/20 rounded-[4px] flex items-center justify-between gap-3 text-xs">
                <span className="text-[#30302D]">Evaluating for hackathon or test drive?</span>
                <button
                  type="button"
                  onClick={() => handleDirectLaunchPersona(selectedPersona)}
                  className="px-2.5 py-1 bg-[#18324A] text-[#FAF8F2] font-semibold text-[11px] rounded hover:bg-[#244B66] cursor-pointer transition-colors"
                >
                  Enter Demo Workspace →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Primary Sign In Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[52px] max-md:h-[50px] bg-[#18324A] text-[#FAF8F2] font-semibold text-sm tracking-wider uppercase border border-[#18324A] rounded-[4px] hover:bg-[#244B66] active:bg-[#112435] transition-[background-color,transform] duration-150 active:duration-100 active:translate-y-[1px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[rgba(24,50,74,0.25)] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F2]" />
                <span>SIGNING IN...</span>
              </>
            ) : (
              <span>SIGN IN</span>
            )}
          </button>
        </div>

        {/* Live System Telemetry Strip */}
        <div className="pt-2 pb-1 border-t border-[#D6D0C3] flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono-data text-[#6E6A61]">
          <div className="flex items-center gap-1.5">
            <Server className="w-3 h-3 text-[#5D8068]" />
            <span>Supabase Cloud Auth Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-[#18324A]" />
            <span>Gemini 2.5 Scrutiny Engine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3 text-[#5D8068]" />
            <span>Odisha BRAP 2026 Sync</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 text-center text-sm text-[#6E6A61]">
          <span>Don't have a NiveshSetu account? </span>
          <Link
            to="/register"
            className="text-[#18324A] font-semibold hover:underline inline-flex items-center gap-1 font-mono-data"
          >
            CREATE ACCOUNT →
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}
