import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'nurodesk_auth_user_v1';

// Mock Google profile pictures (for demo)
const GOOGLE_AVATARS = [
  'https://lh3.googleusercontent.com/a/default-user=s96-c',
];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const clearError = useCallback(() => setError(null), []);

  // Email + Password Login (mock)
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // Simulate network delay
      await new Promise((r) => setTimeout(r, 900));

      if (!email || !password) {
        throw new Error('Please enter your email and password.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }

      // Create mock user from email
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      const mockUser = {
        id: `user_${btoa(email).slice(0, 12)}`,
        name,
        email,
        avatar: null,
        provider: 'email',
        joinedAt: new Date().toISOString(),
      };
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Google OAuth (mock — simulates Google sign-in)
  const loginWithGoogle = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1200));

      // Mock Google user
      const mockGoogleUsers = [
        { name: 'Alex Student', email: 'alex.student@gmail.com' },
        { name: 'Jordan Dev', email: 'jordan.dev@gmail.com' },
        { name: 'Sam Coder', email: 'sam.coder@gmail.com' },
      ];
      const picked = mockGoogleUsers[Math.floor(Math.random() * mockGoogleUsers.length)];

      const mockUser = {
        id: `google_${btoa(picked.email).slice(0, 12)}`,
        name: picked.name,
        email: picked.email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(picked.name)}&background=6366f1&color=fff&size=96`,
        provider: 'google',
        joinedAt: new Date().toISOString(),
      };
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Email + Password Register (mock)
  const register = useCallback(async (name, email, password, confirmPassword) => {
    setLoading(true);
    setError(null);
    try {
      await new Promise((r) => setTimeout(r, 1000));

      if (!name || !email || !password) {
        throw new Error('All fields are required.');
      }
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters.');
      }
      if (password !== confirmPassword) {
        throw new Error('Passwords do not match.');
      }

      const mockUser = {
        id: `user_${btoa(email).slice(0, 12)}`,
        name: name.trim(),
        email,
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff&size=96`,
        provider: 'email',
        joinedAt: new Date().toISOString(),
      };
      setUser(mockUser);
      return mockUser;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    setUser(null);
    setError(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, clearError, login, loginWithGoogle, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
