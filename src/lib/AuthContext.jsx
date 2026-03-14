import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ mode: 'supabase' });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error) {
          console.error('Failed to get current user from Supabase', error);
          setAuthError({ type: 'auth_init_error', message: error.message });
        } else if (data?.user) {
          setUser({ id: data.user.id, email: data.user.email });
          setIsAuthenticated(true);
        }
      } catch (err) {
        console.error('Unexpected error while initializing auth', err);
        setAuthError({ type: 'auth_init_error', message: err.message });
      } finally {
        setIsLoadingAuth(false);
      }
    };

    initAuth();

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email });
        setIsAuthenticated(true);
        setAuthError(null);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });

    return () => {
      subscription?.subscription?.unsubscribe?.();
    };
  }, []);

  const register = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth` : undefined,
      },
    });

    if (signUpError) {
      throw new Error(signUpError.message || 'Failed to create account');
    }

    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (loginError) {
      throw new Error(loginError.message || 'Account created, but login failed. Please verify your email and try signing in.');
    }

    if (!loginData?.user) {
      throw new Error('Account created, but could not complete login. Please try signing in.');
    }

    setUser({ id: loginData.user.id, email: loginData.user.email });
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const login = async ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      throw new Error(error.message || 'Invalid email or password');
    }

    if (!data?.user) {
      throw new Error('Login failed. Please try again.');
    }

    setUser({ id: data.user.id, email: data.user.email });
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Failed to sign out from Supabase', error);
      return;
    }
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoadingAuth,
        isLoadingPublicSettings,
        authError,
        appPublicSettings,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
