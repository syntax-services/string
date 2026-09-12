import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, Business, AccountType, ResolvedUserType } from '../types';
import * as SecureStore from 'expo-secure-store';

import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  business: Business | null;
  accountType: AccountType | null;
  currentRole: AccountType | null;
  resolvedUserType: ResolvedUserType | null;
  hasBothRoles: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; account_type?: string; referral_code?: string }) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  switchRole: (role: AccountType) => Promise<void>;
  refreshProfile: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [business, setBusiness] = useState<Business | null>(null);
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const [resolvedUserType, setResolvedUserType] = useState<ResolvedUserType | null>(null);
  const [hasBothRoles, setHasBothRoles] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // 1. Fetch user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile(profileData as Profile);
      }

      // 2. Fetch business record if exists
      const { data: bizData } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (bizData) {
        setBusiness(bizData as Business);
      }

      // 3. Determine roles
      const hasBiz = !!bizData;
      const isCustomer = profileData?.user_type === 'customer' || !bizData;
      setHasBothRoles(hasBiz && !!profileData);

      // Check stored preferred role
      let preferredRole: AccountType | null = null;
      try {
        preferredRole = (await SecureStore.getItemAsync(`string_mobile_role_${userId}`)) as AccountType;
      } catch {}

      if (preferredRole === 'business' && hasBiz) {
        setAccountType('business');
        setResolvedUserType('business');
      } else if (preferredRole === 'customer') {
        setAccountType('customer');
        setResolvedUserType('customer');
      } else {
        const defaultRole = hasBiz ? 'business' : 'customer';
        setAccountType(defaultRole);
        setResolvedUserType(defaultRole);
      }
    } catch (err) {
      console.error('[AUTH HYDRATION ERROR]', err);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setBusiness(null);
        setAccountType(null);
        setResolvedUserType(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (data?.user) {
        await fetchUserData(data.user.id);
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; account_type?: string; referral_code?: string }
  ) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: metadata?.full_name,
            account_type: metadata?.account_type || 'customer',
            referral_code: metadata?.referral_code,
          },
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signInWithGoogle = async (): Promise<{ error: Error | null }> => {
    try {
      const redirectUrl = makeRedirectUri({
        scheme: 'stringapp',
        path: 'auth/callback',
      });

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true,
        },
      });

      if (error) throw error;
      if (!data?.url) throw new Error('No authentication URL returned from Google.');

      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const queryParams = new URLSearchParams(
          url.includes('#') ? url.split('#')[1] : url.split('?')[1]
        );
        const accessToken = queryParams.get('access_token');
        const refreshToken = queryParams.get('refresh_token');

        if (accessToken && refreshToken) {
          const { error: sessionError } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });
          if (sessionError) throw sessionError;
        } else {
          const code = queryParams.get('code');
          if (code) {
            const { error: codeError } = await supabase.auth.exchangeCodeForSession(code);
            if (codeError) throw codeError;
          }
        }
      }
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setBusiness(null);
    setAccountType(null);
    setResolvedUserType(null);
  };

  const switchRole = async (newRole: AccountType) => {
    if (user?.id) {
      try {
        await SecureStore.setItemAsync(`string_mobile_role_${user.id}`, newRole);
      } catch {}
    }
    setAccountType(newRole);
    setResolvedUserType(newRole);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchUserData(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        business,
        accountType,
        currentRole: accountType,
        resolvedUserType,
        hasBothRoles,
        loading,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        switchRole,
        refreshProfile,
        refreshAuth: refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
