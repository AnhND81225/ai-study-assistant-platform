import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { attachAuthInterceptors } from '../api/client';
import { authApi } from '../api/authApi';

const AuthContext = createContext(null);
const TOKEN_KEY = 'studyai_token';
const USER_KEY = 'studyai_user';
const SESSION_NOTICE_KEY = 'studyai_session_notice';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  });
  const [booting, setBooting] = useState(Boolean(token));

  useEffect(() => {
    attachAuthInterceptors(
      () => localStorage.getItem(TOKEN_KEY),
      () => logout('Your session expired. Sign in again to continue where you left off.'),
    );
  }, []);

  useEffect(() => {
    if (!token) {
      setBooting(false);
      return;
    }
    authApi.me()
      .then((profile) => {
        setUser(profile);
        localStorage.setItem(USER_KEY, JSON.stringify(profile));
      })
      .catch(() => logout('Your session expired. Sign in again to continue where you left off.'))
      .finally(() => setBooting(false));
  }, [token]);

  function persistSession(authResponse) {
    setToken(authResponse.token);
    setUser(authResponse.user);
    localStorage.setItem(TOKEN_KEY, authResponse.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResponse.user));
  }

  async function login(payload) {
    persistSession(await authApi.login(payload));
  }

  async function register(payload) {
    persistSession(await authApi.register(payload));
  }

  function logout(notice = '') {
    if (notice) {
      sessionStorage.setItem(SESSION_NOTICE_KEY, notice);
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  const value = useMemo(() => ({
    token,
    user,
    booting,
    isAuthenticated: Boolean(token && user),
    isAdmin: user?.role === 'ROLE_ADMIN',
    login,
    register,
    logout,
  }), [token, user, booting]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function consumeSessionNotice() {
  const notice = sessionStorage.getItem(SESSION_NOTICE_KEY) || '';
  sessionStorage.removeItem(SESSION_NOTICE_KEY);
  return notice;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
