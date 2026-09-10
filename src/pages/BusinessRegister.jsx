import React, { useState, useEffect } from 'react';
import { Loader2, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import AuthLayout from '../components/auth/AuthLayout';
import AuthHeader from '../components/auth/AuthHeader';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import PasswordField from '../components/auth/PasswordField';
import AuthError from '../components/auth/AuthError';
import AuthSuccess from '../components/auth/AuthSuccess';
import Button from '../components/ui/Button';
import { Link, useNavigate } from '../router';
import { useAuth } from '../context/AuthContext';
import { saveUserBusinessProfile, switchToCleanMode } from '../data/appModeState';

export default function BusinessRegister() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState('forward');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authError, setAuthError] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    businessType: 'Private Limited',
    state: 'Odisha',
    district: 'Khordha',
    industry: 'Manufacturing',
    investment: '',
    employees: '',
  });

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  // Validations
  const validateField = (field, value) => {
    switch (field) {
      case 'fullName':
        if (!value.trim()) return 'This field is required.';
        return '';
      case 'email':
        if (!value.trim()) return 'Enter a valid email address.';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Enter a valid email address.';
        return '';
      case 'password':
        if (!value) return 'This field is required.';
        if (value.length < 8) return 'Password must be at least 8 characters.';
        return '';
      case 'confirmPassword':
        if (!value) return 'This field is required.';
        if (value !== formData.password) return 'Passwords do not match.';
        return '';
      case 'businessName':
        if (!value.trim()) return 'This field is required.';
        return '';
      case 'investment':
        if (!value.trim()) return 'Invested capital amount is required.';
        return '';
      case 'employees':
        if (!value.trim()) return 'Employee count is required.';
        if (isNaN(Number(value)) || Number(value) < 1) return 'Enter a valid employee count (minimum 1).';
        return '';
      default:
        return '';
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateField(field, formData[field]) }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateField(field, value) }));
    }
    if (field === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: value !== formData.confirmPassword ? 'Passwords do not match.' : '',
      }));
    }
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    const nameErr = validateField('fullName', formData.fullName);
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);
    const confErr = validateField('confirmPassword', formData.confirmPassword);

    setTouched({ fullName: true, email: true, password: true, confirmPassword: true });
    setErrors({ fullName: nameErr, email: emailErr, password: passErr, confirmPassword: confErr });

    if (!nameErr && !emailErr && !passErr && !confErr) {
      setDirection('forward');
      setStep(2);
      window.scrollTo(0, 0);
    }
  };

  const handleStep2Submit = (e) => {
    e.preventDefault();
    const bizErr = validateField('businessName', formData.businessName);
    const invErr = validateField('investment', formData.investment);
    const empErr = validateField('employees', formData.employees);

    setTouched((prev) => ({
      ...prev,
      businessName: true,
      investment: true,
      employees: true,
    }));
    setErrors((prev) => ({
      ...prev,
      businessName: bizErr,
      investment: invErr,
      employees: empErr,
    }));

    if (!bizErr && !invErr && !empErr) {
      setDirection('forward');
      setStep(3);
      window.scrollTo(0, 0);
    }
  };

  const handleFinalSubmit = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const formattedInvestment = formData.investment.trim().startsWith('₹')
        ? formData.investment.trim()
        : `₹${formData.investment.trim()}`;
      const numEmployees = parseInt(formData.employees, 10) || Number(formData.employees) || 1;

      // Persist to user's isolated profile in storage
      saveUserBusinessProfile({
        name: formData.businessName.trim(),
        businessName: formData.businessName.trim(),
        fullName: formData.fullName.trim(),
        sector: formData.industry,
        industrySector: formData.industry,
        project: `${formData.industry} Facility`,
        district: formData.district,
        state: formData.state,
        location: `${formData.district}, ${formData.state}`,
        projectValue: formattedInvestment,
        investmentRange: formattedInvestment,
        investmentCr: formattedInvestment,
        employees: String(numEmployees),
        employmentEstimate: numEmployees,
        isConfigured: true,
        isCleanState: true,
        isDemo: false,
      });

      // Activate Clean Mode for freshly registered accounts
      switchToCleanMode();

      const res = await register({
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        businessName: formData.businessName,
        businessType: formData.businessType,
        state: formData.state,
        district: formData.district,
        industry: formData.industry,
        investment: formattedInvestment,
        investmentRange: formattedInvestment,
        employees: numEmployees,
        employmentEstimate: numEmployees,
      });

      setIsLoading(false);

      if (!res.success) {
        setAuthError({
          title: 'REGISTRATION FAILED',
          message: res.error || 'Failed to create business profile.',
        });
        return;
      }

      setIsSuccess(true);
    } catch (err) {
      setIsLoading(false);
      setAuthError({
        title: 'REGISTRATION ERROR',
        message: err.message || 'Unable to connect to registration server.',
      });
    }
  };

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        navigate('/dashboard');
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, navigate]);

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthSuccess
          title="ACCOUNT CREATED"
          message="Your enterprise account has been created and synced with Supabase Cloud."
          primaryActionText="CONTINUE TO DASHBOARD →"
          primaryActionRoute="/dashboard"
          secondaryActionText="RETURN TO SIGN IN"
          secondaryActionRoute="/login"
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      {/* Header */}
      <AuthHeader
        category="ACCOUNT / REGISTER"
        heading="CREATE BUSINESS ACCOUNT"
        description="Establish your enterprise compliance workspace to generate approval roadmaps."
      />

      {/* Step Indicator */}
      <div className="flex items-center justify-between pb-3 mb-8 border-b border-[#262522] font-mono-data text-xs">
        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-bold text-xs ${
              step === 1
                ? 'bg-[#18324A] text-[#FAF8F2]'
                : step > 1
                ? 'bg-[rgba(93,128,104,0.15)] text-[#5D8068] border border-[#5D8068]'
                : 'bg-[#E9E1D0] text-[#8B8982]'
            }`}
          >
            {step > 1 ? '✓' : '01'}
          </span>
          <span className={step === 1 ? 'font-bold text-[#18324A]' : step > 1 ? 'text-[#5D8068]' : 'text-[#8B8982]'}>
            ACCOUNT
          </span>
        </div>

        <span className="text-[#D6D0C3] hidden sm:inline">────────</span>

        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-bold text-xs ${
              step === 2
                ? 'bg-[#18324A] text-[#FAF8F2]'
                : step > 2
                ? 'bg-[rgba(93,128,104,0.15)] text-[#5D8068] border border-[#5D8068]'
                : 'bg-[#E9E1D0] text-[#8B8982]'
            }`}
          >
            {step > 2 ? '✓' : '02'}
          </span>
          <span className={step === 2 ? 'font-bold text-[#18324A]' : step > 2 ? 'text-[#5D8068]' : 'text-[#8B8982]'}>
            BUSINESS
          </span>
        </div>

        <span className="text-[#D6D0C3] hidden sm:inline">────────</span>

        <div className="flex items-center gap-2">
          <span
            className={`w-6 h-6 rounded-[2px] flex items-center justify-center font-bold text-xs ${
              step === 3
                ? 'bg-[#18324A] text-[#FAF8F2]'
                : 'bg-[#E9E1D0] text-[#8B8982]'
            }`}
          >
            03
          </span>
          <span className={step === 3 ? 'font-bold text-[#18324A]' : 'text-[#8B8982]'}>
            REVIEW
          </span>
        </div>
      </div>

      {/* STEP 01 — ACCOUNT */}
      {step === 1 && (
        <form
          key="step1"
          onSubmit={handleStep1Submit}
          noValidate
          className={`space-y-5 ${direction === 'forward' ? 'form-step-forward' : 'form-step-backward'}`}
        >
          <Input
            label="FULL NAME"
            id="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            error={touched.fullName ? errors.fullName : ''}
            required
          />

          <Input
            label="EMAIL ADDRESS"
            id="email"
            type="email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            error={touched.email ? errors.email : ''}
            autoComplete="email"
            required
          />

          <PasswordField
            label="PASSWORD"
            id="password"
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            error={touched.password ? errors.password : ''}
            required
          />

          <PasswordField
            label="CONFIRM PASSWORD"
            id="confirmPassword"
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
            error={touched.confirmPassword ? errors.confirmPassword : ''}
            required
          />

          <div className="pt-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full justify-center"
              icon={ArrowRight}
              iconPosition="right"
            >
              CONTINUE TO BUSINESS DETAILS →
            </Button>
          </div>

          <div className="pt-2 text-center text-sm text-[#6E6A61]">
            <span>Already have an account? </span>
            <Link to="/login" className="text-[#18324A] font-semibold hover:underline font-mono-data">
              SIGN IN →
            </Link>
          </div>
        </form>
      )}

      {/* STEP 02 — BUSINESS */}
      {step === 2 && (
        <form
          key="step2"
          onSubmit={handleStep2Submit}
          noValidate
          className={`space-y-5 ${direction === 'forward' ? 'form-step-forward' : 'form-step-backward'}`}
        >
          <Input
            label="BUSINESS NAME"
            id="businessName"
            placeholder="e.g. Utkal Agro-Tech Ltd."
            value={formData.businessName}
            onChange={(e) => handleChange('businessName', e.target.value)}
            onBlur={() => handleBlur('businessName')}
            error={touched.businessName ? errors.businessName : ''}
            required
          />

          <Select
            label="BUSINESS TYPE"
            id="businessType"
            value={formData.businessType}
            onChange={(e) => handleChange('businessType', e.target.value)}
            options={[
              'Sole Proprietorship',
              'Partnership',
              'Private Limited',
              'Public Limited',
              'LLP',
              'Other',
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="STATE"
              id="state"
              value={formData.state}
              onChange={(e) => handleChange('state', e.target.value)}
              options={['Odisha', 'Other Supported Jurisdictions']}
            />

            <Select
              label="DISTRICT"
              id="district"
              value={formData.district}
              onChange={(e) => handleChange('district', e.target.value)}
              options={[
                'Khordha',
                'Cuttack',
                'Ganjam',
                'Sundargarh',
                'Balasore',
                'Jharsuguda',
                'Angul',
                'Jajpur',
              ]}
            />
          </div>

          <Select
            label="INDUSTRY / SECTOR"
            id="industry"
            value={formData.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            options={[
              'Manufacturing',
              'Food Processing',
              'IT / Software',
              'Construction',
              'Retail',
              'Healthcare',
              'Hospitality',
              'Other',
            ]}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="INVESTED MONEY / CAPITAL OUTLAY (₹)"
              id="investment"
              placeholder="e.g. ₹5 Cr or 50,00,000"
              value={formData.investment}
              onChange={(e) => handleChange('investment', e.target.value)}
              onBlur={() => handleBlur('investment')}
              error={touched.investment ? errors.investment : ''}
              required
            />

            <Input
              label="EMPLOYEE NUMBER / WORKFORCE COUNT"
              id="employees"
              type="number"
              min="1"
              placeholder="e.g. 35"
              value={formData.employees}
              onChange={(e) => handleChange('employees', e.target.value)}
              onBlur={() => handleBlur('employees')}
              error={touched.employees ? errors.employees : ''}
              required
            />
          </div>

          <div className="pt-3 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1 justify-center"
              icon={ArrowLeft}
              onClick={() => {
                setDirection('backward');
                setStep(1);
              }}
            >
              BACK
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-2 justify-center"
              icon={ArrowRight}
              iconPosition="right"
            >
              CONTINUE TO REVIEW →
            </Button>
          </div>
        </form>
      )}

      {/* STEP 03 — BUSINESS REVIEW */}
      {step === 3 && (
        <div
          key="step3"
          className={`space-y-6 ${direction === 'forward' ? 'form-step-forward' : 'form-step-backward'}`}
        >
          <div className="border-b border-[#262522] pb-2">
            <span className="meta-label">STEP 03 // SUMMARY</span>
            <h2 className="text-xl font-bold text-[#171717] mt-0.5">
              REVIEW YOUR INFORMATION
            </h2>
          </div>

          {authError && (
            <AuthError
              title={authError.title}
              message={authError.message}
            />
          )}

          {/* Structured Summary Sections */}
          <div className="border border-[#262522] rounded-[4px] bg-[#FAF8F2] divide-y divide-[#262522] text-xs">
            {/* ACCOUNT SECTION */}
            <div className="p-4 bg-[#FFFFFF]">
              <span className="font-mono-data font-bold uppercase text-[11px] text-[#18324A] block mb-2">
                ACCOUNT DETAILS
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data">
                <div>
                  <span className="text-[#6E6A61] block">Full Name:</span>
                  <span className="font-semibold text-[#171717]">{formData.fullName}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block">Email:</span>
                  <span className="font-semibold text-[#171717]">{formData.email}</span>
                </div>
              </div>
            </div>

            {/* BUSINESS SECTION */}
            <div className="p-4 bg-[#FAF8F2]">
              <span className="font-mono-data font-bold uppercase text-[11px] text-[#18324A] block mb-2">
                BUSINESS SPECIFICATION
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data">
                <div>
                  <span className="text-[#6E6A61] block">Business Name:</span>
                  <span className="font-semibold text-[#171717]">{formData.businessName}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block">Type:</span>
                  <span className="font-semibold text-[#171717]">{formData.businessType}</span>
                </div>
                <div className="col-span-2 pt-1">
                  <span className="text-[#6E6A61] block">Sector / Industry:</span>
                  <span className="font-semibold text-[#171717]">{formData.industry}</span>
                </div>
              </div>
            </div>

            {/* CAPITAL & WORKFORCE SECTION */}
            <div className="p-4 bg-[#FFFFFF]">
              <span className="font-mono-data font-bold uppercase text-[11px] text-[#18324A] block mb-2">
                CAPITAL & WORKFORCE SPECIFICATION
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data">
                <div>
                  <span className="text-[#6E6A61] block">Invested Money / Outlay:</span>
                  <span className="font-semibold text-[#171717]">{formData.investment || '₹5 Cr'}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block">Workforce / Employees:</span>
                  <span className="font-semibold text-[#171717]">{formData.employees || '35'} personnel</span>
                </div>
              </div>
            </div>

            {/* LOCATION SECTION */}
            <div className="p-4 bg-[#FAF8F2]">
              <span className="font-mono-data font-bold uppercase text-[11px] text-[#18324A] block mb-2">
                OPERATIONAL JURISDICTION
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono-data">
                <div>
                  <span className="text-[#6E6A61] block">State:</span>
                  <span className="font-semibold text-[#171717]">{formData.state}</span>
                </div>
                <div>
                  <span className="text-[#6E6A61] block">District:</span>
                  <span className="font-semibold text-[#171717]">{formData.district}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1 justify-center"
              icon={ArrowLeft}
              onClick={() => {
                setDirection('backward');
                setStep(2);
              }}
              disabled={isLoading}
            >
              BACK
            </Button>

            <button
              type="button"
              onClick={handleFinalSubmit}
              disabled={isLoading}
              className="flex-2 h-[52px] max-md:h-[50px] bg-[#18324A] text-[#FAF8F2] font-semibold text-sm tracking-wider uppercase border border-[#18324A] rounded-[4px] hover:bg-[#244B66] active:bg-[#112435] transition-[background-color,transform] duration-150 active:duration-100 active:translate-y-[1px] flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[rgba(24,50,74,0.25)] disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FAF8F2]" />
                  <span>CREATING ACCOUNT...</span>
                </>
              ) : (
                <span>CREATE BUSINESS ACCOUNT</span>
              )}
            </button>
          </div>
        </div>
      )}
    </AuthLayout>
  );
}
