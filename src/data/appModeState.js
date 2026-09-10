/**
 * NiveshSetu AI — Central Application Mode & Dataset Engine
 * 
 * Manages two strictly isolated states:
 * 1. DEMO MODE ('demo'): Preloaded with comprehensive Odisha industrial evaluation dataset
 *    (Omm Enterprises, ₹10 Cr, 80 employees, 6 approvals, 8 documents, alerts, deadlines)
 * 2. CLEAN MODE ('clean'): Authentic user-input driven workspace. All metrics start at 0.
 *    User-entered information becomes the single source of truth and is NEVER overwritten by demo data.
 */

export const APP_MODE = {
  DEMO: 'demo',
  CLEAN: 'clean',
};

export const APP_MODE_KEY = 'niveshsetu_app_mode';
export const USER_BUSINESS_KEY = 'niveshsetu_user_business_profile';
export const USER_APPROVALS_KEY = 'niveshsetu_user_approvals';
export const USER_DOCUMENTS_KEY = 'niveshsetu_user_documents';
export const USER_APPLICATIONS_KEY = 'niveshsetu_user_applications';
export const USER_RENEWALS_KEY = 'niveshsetu_user_renewals';
export const USER_ALERTS_KEY = 'niveshsetu_user_alerts';

/**
 * 1. CENTRALIZED DEMO DATASET
 */
export const DEMO_BUSINESS_PROFILE = {
  id: 'BUS-2026-0001',
  name: 'Omm Enterprises',
  businessName: 'Omm Enterprises',
  fullName: 'Omm Prakash',
  email: 'entrepreneur@odisha.gov.in',
  entityType: 'Private Limited Company',
  businessType: 'Food Processing Unit',
  industrySector: 'Food Processing & Agri-Business',
  sector: 'Food Processing & Agri-Business',
  location: 'Bhubaneswar, Odisha',
  city: 'Bhubaneswar',
  state: 'Odisha',
  district: 'Khordha',
  investment: '₹10 Cr',
  investmentRange: '₹10 Cr (Medium Enterprise)',
  employees: 80,
  employmentEstimate: 80,
  pan: 'ABCDE1234F',
  gstin: '21ABCDE1234F1Z5',
  udyam: 'UDYAM-OD-2026-0091',
  address: 'Plot 42, Chandaka Industrial Estate, Bhubaneswar, Odisha - 751024',
  accountType: 'Single Window Registered Enterprise',
  isConfigured: true,
  isDemo: true,
};

/**
 * Clean baseline template for user input
 */
export const CLEAN_BUSINESS_PROFILE_TEMPLATE = {
  name: '',
  businessName: '',
  fullName: '',
  email: '',
  entityType: '',
  businessType: '',
  industrySector: '',
  sector: '',
  location: '',
  city: '',
  state: 'Odisha',
  district: '',
  investment: '',
  investmentRange: '',
  employees: '',
  employmentEstimate: 0,
  pan: '',
  gstin: '',
  udyam: '',
  address: '',
  accountType: 'Single Window Enterprise',
  isConfigured: false,
  isDemo: false,
};

/**
 * Retrieve current application mode ('demo' | 'clean')
 * Defaults to 'demo' for initial evaluation if unselected.
 */
export function getAppMode() {
  if (typeof localStorage === 'undefined') return APP_MODE.DEMO;
  try {
    const saved = localStorage.getItem(APP_MODE_KEY);
    if (saved === APP_MODE.CLEAN || saved === APP_MODE.DEMO) {
      return saved;
    }
  } catch (_e) {
    // Storage read fallback
  }
  return APP_MODE.DEMO;
}

export function isDemoMode() {
  return getAppMode() === APP_MODE.DEMO;
}

export function isCleanMode() {
  return getAppMode() === APP_MODE.CLEAN;
}

/**
 * Set and persist application mode, notifying all listeners across components
 */
export function setAppMode(mode) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(APP_MODE_KEY, mode);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('appModeChanged', { detail: { mode } }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (err) {
    console.error('Error setting application mode:', err);
  }
}

/**
 * Switch directly to Clean Mode
 */
export function switchToCleanMode() {
  setAppMode(APP_MODE.CLEAN);
}

/**
 * Switch directly to Demo Mode
 */
export function switchToDemoMode() {
  setAppMode(APP_MODE.DEMO);
}

/**
 * Retrieve user business profile from isolated user storage
 */
export function getUserBusinessProfile(authFallbackUser = null) {
  if (typeof localStorage === 'undefined') return CLEAN_BUSINESS_PROFILE_TEMPLATE;
  try {
    const raw = localStorage.getItem(USER_BUSINESS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object' && (parsed.isConfigured || parsed.businessName || parsed.name)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading user business profile:', err);
  }

  // If authFallbackUser not passed, check localStorage session
  let activeUser = authFallbackUser;
  if (!activeUser) {
    try {
      const sessRaw = localStorage.getItem('niveshsetu_session');
      if (sessRaw) {
        const sess = JSON.parse(sessRaw);
        if (sess?.user) activeUser = sess.user;
      }
    } catch (_e) {}
  }

  // If user entered details during custom registration or login
  if (activeUser?.businessName && activeUser.businessName !== 'Omm Enterprises') {
    const resolvedInvestment = activeUser.investment || activeUser.investmentRange || activeUser.projectValue || '';
    const resolvedEmployees = activeUser.employees || (activeUser.employmentEstimate ? String(activeUser.employmentEstimate) : '');
    const resolvedLocation = activeUser.location || (activeUser.district ? `${activeUser.district}, ${activeUser.state || 'Odisha'}` : (activeUser.city || 'Odisha'));
    const resolvedSector = activeUser.industrySector || activeUser.sector || activeUser.businessType || activeUser.industry || '';

    return {
      ...CLEAN_BUSINESS_PROFILE_TEMPLATE,
      name: activeUser.businessName,
      businessName: activeUser.businessName,
      fullName: activeUser.fullName || activeUser.name || '',
      email: activeUser.email || '',
      industrySector: resolvedSector,
      sector: resolvedSector,
      project: activeUser.project || (resolvedSector ? `${resolvedSector} Facility` : ''),
      district: activeUser.district || '',
      state: activeUser.state || 'Odisha',
      location: resolvedLocation,
      investmentRange: resolvedInvestment,
      investment: resolvedInvestment,
      projectValue: resolvedInvestment,
      employmentEstimate: activeUser.employmentEstimate || parseInt(resolvedEmployees, 10) || 0,
      employees: resolvedEmployees ? (String(resolvedEmployees).includes('Personnel') || String(resolvedEmployees).includes('Worker') ? String(resolvedEmployees) : `${resolvedEmployees} Personnel`) : '',
      pan: activeUser.pan || '',
      gstin: activeUser.gstin || '',
      udyam: activeUser.udyam || '',
      address: activeUser.address || '',
      isConfigured: true,
      isDemo: false,
    };
  }

  return CLEAN_BUSINESS_PROFILE_TEMPLATE;
}

/**
 * Save user business profile (USER DATA ONLY - does not affect demo dataset)
 */
export function saveUserBusinessProfile(profile) {
  if (typeof localStorage === 'undefined') return;
  try {
    const rawName = profile.name || profile.businessName || '';
    const rawSector = profile.sector || profile.industrySector || profile.project || '';
    const rawLocation = profile.location || profile.district || '';
    const rawValue = profile.projectValue || profile.investmentRange || (profile.investmentCr ? `₹${profile.investmentCr} Cr` : '');
    const rawEmployees = profile.employees || (profile.employmentEstimate ? String(profile.employmentEstimate) : '');

    const updated = {
      ...CLEAN_BUSINESS_PROFILE_TEMPLATE,
      ...profile,
      name: rawName,
      businessName: rawName,
      sector: rawSector,
      industrySector: rawSector,
      project: profile.project || (rawSector ? `${rawSector} Unit` : ''),
      location: rawLocation,
      district: rawLocation,
      projectValue: rawValue,
      investmentRange: rawValue,
      employees: rawEmployees,
      employmentEstimate: profile.employmentEstimate || parseInt(rawEmployees, 10) || 0,
      isConfigured: Boolean(rawName && rawName.trim()),
      isDemo: false,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_BUSINESS_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('userBusinessProfileUpdated', { detail: updated }));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('appModeChanged'));
    }
    return updated;
  } catch (err) {
    console.error('Error saving user business profile:', err);
    return null;
  }
}

/**
 * Clear user data to zero state
 */
export function resetCleanWorkspace() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(USER_BUSINESS_KEY, JSON.stringify(CLEAN_BUSINESS_PROFILE_TEMPLATE));
    localStorage.setItem(USER_APPROVALS_KEY, JSON.stringify([]));
    localStorage.setItem(USER_DOCUMENTS_KEY, JSON.stringify([]));
    localStorage.setItem(USER_APPLICATIONS_KEY, JSON.stringify([]));
    localStorage.setItem(USER_RENEWALS_KEY, JSON.stringify([]));
    localStorage.setItem(USER_ALERTS_KEY, JSON.stringify([]));
    setAppMode(APP_MODE.CLEAN);
  } catch (err) {
    console.error('Error resetting clean workspace:', err);
  }
}
