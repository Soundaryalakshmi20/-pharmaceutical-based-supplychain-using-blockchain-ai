import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import client, { clearToken, getToken, setToken } from '../api/client';

const AuthContext = createContext(null);

/**
 * AuthProvider — session state for the whole app.
 *
 * On mount it replays any stored JWT against GET /api/auth/me so a page
 * refresh keeps the user logged in (the service worker never caches /auth/me).
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!getToken()) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const { data } = await client.get('/auth/me');
      setUser(data.data);
      return data.data;
    } catch (_) {
      clearToken();
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // A 401 anywhere in the app ends the session.
  useEffect(() => {
    const onUnauthorized = () => {
      clearToken();
      setUser(null);
    };
    window.addEventListener('pharmachain:unauthorized', onUnauthorized);
    return () => window.removeEventListener('pharmachain:unauthorized', onUnauthorized);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await client.post('/auth/login', { email, password });
    setToken(data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    window.location.assign('/login');
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      logout,
      refresh,
      isAuthenticated: Boolean(user),
      token: getToken(),
    }),
    [user, loading, login, logout, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}

export default AuthContext;
