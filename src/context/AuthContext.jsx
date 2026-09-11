import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const AUTH_STORAGE_KEY = 'niveshsetu_session';

const defaultBusinessProfile = {
  id: 'BUS-2026-0001',
  name: 'Omm Enterprises',
  fullName: 'Omm Prakash',
  email: 'entrepreneur@odisha.gov.in',
  businessName: 'Omm Enterprises',
  entityType: 'Private Limited Company',
  industrySector: 'Food Processing & Agri-Business',
  district: 'Khordha',
  investmentRange: '₹5 Cr - ₹25 Cr',
  employmentEstimate: 45,
  pan: 'ABCDE1234F',
  gstin: '21ABCDE1234F1Z5',
  phone: '+91 98765 43210',
  accountType: 'business',
};

const AuthContext = createContext({
  isAuthenticated: false,
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  updateProfile: async () => ({ success: false }),
});

export function AuthProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true);

  // Synchronous initial state from localStorage prevents flash of unauthenticated state
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return { isAuthenticated: false, user: null };
    }
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.isAuthenticated) {
          return { isAuthenticated: true, user: parsed.user || null };
        }
      }
    } catch (err) {
      console.error('Error reading authentication session:', err);
    }
    return { isAuthenticated: false, user: null };
  });

  // Helper to persist auth state in localStorage
  const persistSession = useCallback((state) => {
    try {
      if (state.isAuthenticated && state.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(state));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (err) {
      console.error('Error persisting authentication session:', err);
    }
    setAuthState(state);
  }, []);

  // Fetch or upsert profile in public.profiles for a given user
  const fetchUserProfile = useCallback(async (authUserId, userEmail, userMetadata = {}) => {
    if (!supabase) return null;
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching user profile from Supabase:', error.message);
      }

      if (profile) {
        return {
          id: profile.id,
          email: profile.email || userEmail,
          fullName: profile.full_name || userMetadata.fullName || userMetadata.name || 'Entrepreneur',
          name: profile.full_name || profile.business_name || 'Entrepreneur',
          businessName: profile.business_name || 'My Enterprise',
          entityType: profile.entity_type || 'Private Limited Company',
          industrySector: profile.industry_sector || 'General Manufacturing',
          district: profile.district || 'Khordha',
          investmentRange: profile.investment_range || '₹5 Cr - ₹25 Cr',
          employmentEstimate: profile.employment_estimate || 35,
          pan: profile.pan || '',
          gstin: profile.gstin || '',
          phone: profile.phone || '',
          accountType: profile.account_type || 'business',
        };
      }

      // If profile doesn't exist yet, build from user metadata
      const newProfile = {
        id: authUserId,
        email: userEmail,
        full_name: userMetadata.fullName || userMetadata.name || splitEmail(userEmail),
        business_name: userMetadata.businessName || 'Omm Enterprises',
        entity_type: userMetadata.entityType || userMetadata.businessType || 'Private Limited Company',
        industry_sector: userMetadata.industrySector || userMetadata.industry || 'General Manufacturing',
        district: userMetadata.district || 'Khordha',
        investment_range: userMetadata.investmentRange || '₹5 Cr - ₹25 Cr',
        employment_estimate: userMetadata.employmentEstimate || 45,
        pan: userMetadata.pan || '',
        gstin: userMetadata.gstin || '',
        phone: userMetadata.phone || '',
        account_type: 'business',
      };

      await supabase.from('profiles').upsert(newProfile);

      return {
        id: authUserId,
        email: userEmail,
        fullName: newProfile.full_name,
        name: newProfile.full_name,
        businessName: newProfile.business_name,
        entityType: newProfile.entity_type,
        industrySector: newProfile.industry_sector,
        district: newProfile.district,
        investmentRange: newProfile.investment_range,
        employmentEstimate: newProfile.employment_estimate,
        pan: newProfile.pan,
        gstin: newProfile.gstin,
        phone: newProfile.phone,
        accountType: newProfile.account_type,
      };
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  // Initialize and sync Supabase auth session
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (session?.user && isMounted) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );

          const finalUser = profile || {
            id: session.user.id,
            email: session.user.email,
            ...defaultBusinessProfile,
            ...session.user.user_metadata,
          };

          persistSession({ isAuthenticated: true, user: finalUser });
        }
      } catch (err) {
        console.warn('Supabase getSession initialization notice:', err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initSession();

    // Listen to Supabase auth events
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await fetchUserProfile(
            session.user.id,
            session.user.email,
            session.user.user_metadata
          );
          const finalUser = profile || {
            id: session.user.id,
            email: session.user.email,
            ...defaultBusinessProfile,
            ...session.user.user_metadata,
          };
          persistSession({ isAuthenticated: true, user: finalUser });
        } else if (event === 'SIGNED_OUT') {
          persistSession({ isAuthenticated: false, user: null });
        }
      }
    );

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchUserProfile, persistSession]);

  /**
   * Log in user
   * Supports:
   * 1. Supabase credentials: login({ email, password })
   * 2. Demo bypass: login(userDataObject)
   */
  const login = async (credentialsOrData) => {
    // Demo / instant bypass object (when no password provided)
    if (!credentialsOrData?.password && credentialsOrData?.email) {
      const demoUser = {
        ...defaultBusinessProfile,
        ...credentialsOrData,
        accountType: 'business',
      };
      persistSession({ isAuthenticated: true, user: demoUser });
      return { success: true, user: demoUser };
    }

    const { email, password } = credentialsOrData;

    if (!isSupabaseConfigured || !supabase) {
      // Fallback mode if Supabase credentials are not populated
      const fallbackUser = {
        ...defaultBusinessProfile,
        email: email.trim(),
        name: splitEmail(email),
        businessName: `${splitEmail(email)} Enterprise`,
      };
      persistSession({ isAuthenticated: true, user: fallbackUser });
      return { success: true, user: fallbackUser };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data?.user) {
        const profile = await fetchUserProfile(
          data.user.id,
          data.user.email,
          data.user.user_metadata
        );

        const authenticatedUser = profile || {
          id: data.user.id,
          email: data.user.email,
          ...defaultBusinessProfile,
          ...data.user.user_metadata,
        };

        persistSession({ isAuthenticated: true, user: authenticatedUser });
        return { success: true, user: authenticatedUser };
      }

      return { success: false, error: 'User session could not be established.' };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected error occurred.' };
    }
  };

  /**
   * Register new entrepreneur
   */
  const register = async (formData) => {
    const {
      email,
      password,
      fullName,
      name,
      businessName,
      businessType,
      state,
      district,
      industry,
      investment,
      investmentRange,
      employees,
      employmentEstimate,
      pan,
      gstin,
      phone,
    } = formData;

    const resolvedInvestment = investment || investmentRange || '₹5 Cr - ₹25 Cr';
    const resolvedEmployees = employees || employmentEstimate || 35;

    const metadata = {
      fullName: fullName || name || splitEmail(email),
      name: fullName || name || splitEmail(email),
      businessName: businessName || 'Enterprise',
      entityType: businessType || 'Private Limited Company',
      state: state || 'Odisha',
      district: district || 'Khordha',
      industrySector: industry || 'General Manufacturing',
      investmentRange: resolvedInvestment,
      investment: resolvedInvestment,
      employmentEstimate: resolvedEmployees,
      employees: resolvedEmployees,
      pan: pan || '',
      gstin: gstin || '',
      phone: phone || '',
      accountType: 'business',
    };

    if (!isSupabaseConfigured || !supabase) {
      // Offline fallback
      const mockUser = {
        id: `BUS-${Date.now().toString().slice(-4)}`,
        email: email.trim(),
        ...metadata,
      };
      persistSession({ isAuthenticated: true, user: mockUser });
      return { success: true, user: mockUser };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      // If Supabase returns user with empty identities, the email is already registered
      if (data?.user?.identities && data.user.identities.length === 0) {
        return {
          success: false,
          error: 'An account with this email address already exists. Please sign in instead.',
        };
      }

      if (data?.user) {
        // Attempt to upsert directly into profiles table as well
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            email: data.user.email,
            full_name: metadata.fullName,
            business_name: metadata.businessName,
            entity_type: metadata.entityType,
            industry_sector: metadata.industrySector,
            district: metadata.district,
            investment_range: metadata.investmentRange,
            employment_estimate: metadata.employmentEstimate,
            pan: metadata.pan,
            gstin: metadata.gstin,
            phone: metadata.phone,
            account_type: 'business',
          });
        } catch (e) {
          console.warn('Direct profile upsert caught:', e);
        }

        const newUser = {
          id: data.user.id,
          email: data.user.email,
          ...metadata,
        };

        // If session was returned immediately (email confirmation disabled)
        if (data.session) {
          persistSession({ isAuthenticated: true, user: newUser });
        }

        return {
          success: true,
          user: newUser,
          requiresEmailConfirmation: !data.session,
        };
      }

      return { success: false, error: 'Registration could not be completed.' };
    } catch (err) {
      return { success: false, error: err.message || 'An unexpected registration error occurred.' };
    }
  };

  /**
   * Logout
   */
  const logout = async () => {
    try {
      if (supabase && isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    } finally {
      persistSession({ isAuthenticated: false, user: null });
    }
  };

  /**
   * Update Profile
   */
  const updateProfile = async (updates) => {
    if (!authState.user) return { success: false, error: 'No authenticated user' };

    const updatedUser = {
      ...authState.user,
      ...updates,
    };

    persistSession({ isAuthenticated: true, user: updatedUser });

    if (supabase && isSupabaseConfigured && authState.user.id) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: updatedUser.fullName || updatedUser.name,
            business_name: updatedUser.businessName,
            entity_type: updatedUser.entityType,
            industry_sector: updatedUser.industrySector,
            district: updatedUser.district,
            investment_range: updatedUser.investmentRange,
            employment_estimate: updatedUser.employmentEstimate,
            pan: updatedUser.pan,
            gstin: updatedUser.gstin,
            phone: updatedUser.phone,
            updated_at: new Date().toISOString(),
          })
          .eq('id', authState.user.id);

        if (error) console.warn('Error updating Supabase profile:', error.message);
      } catch (err) {
        console.error('Failed to sync profile update to Supabase:', err);
      }
    }

    return { success: true, user: updatedUser };
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: authState.isAuthenticated,
        user: authState.user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function splitEmail(email = '') {
  if (!email) return 'Entrepreneur';
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
