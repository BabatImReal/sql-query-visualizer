import React, { createContext, useState, useContext, useEffect } from 'react';

// Simple local-storage backed auth for demo/local mode only.
// NOTE: Do NOT use this approach for production credentials.

const USERS_KEY = 'sql_visualizer_users';
const CURRENT_USER_KEY = 'sql_visualizer_current_user';

const AuthContext = createContext();

const loadUsers = () => {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to load users from localStorage', e);
    return [];
  }
};

const saveUsers = (users) => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage', e);
  }
};

const loadCurrentUser = () => {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load current user', e);
    return null;
  }
};

const saveCurrentUser = (user) => {
  if (typeof window === 'undefined') return;
  try {
    if (user) {
      window.localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user', e);
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ mode: 'local' });

  useEffect(() => {
    const existingUser = loadCurrentUser();
    if (existingUser) {
      setUser(existingUser);
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const register = ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error('An account with this email already exists');
    }

    const newUser = {
      id: Date.now(),
      email,
      password, // For demo only; do NOT store plain-text passwords in real apps.
      createdAt: new Date().toISOString(),
    };

    const updated = [...users, newUser];
    saveUsers(updated);

    // Auto-login after registration
    setUser({ id: newUser.id, email: newUser.email });
    saveCurrentUser({ id: newUser.id, email: newUser.email });
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const login = ({ email, password }) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    const users = loadUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!existing || existing.password !== password) {
      throw new Error('Invalid email or password');
    }

    const loggedInUser = { id: existing.id, email: existing.email };
    setUser(loggedInUser);
    saveCurrentUser(loggedInUser);
    setIsAuthenticated(true);
    setAuthError(null);
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    saveCurrentUser(null);
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
