import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService, type RegisterResult } from "@/services/authService";
import { tokenStore, ApiClientError } from "@/lib/apiClient";
import type { AuthUser } from "@/data/types";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  loginWithOtp: (email: string, code: string) => Promise<AuthUser>;
  /** Creates the account but does not sign in — the account is unverified until /verify-email succeeds. */
  register: (input: { name: string; email: string; password: string; confirmPassword: string; phone?: string }) => Promise<RegisterResult>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    tokenStore.setUnauthorizedHandler(() => setUser(null));
    return () => tokenStore.setUnauthorizedHandler(null);
  }, []);

  // Restore a session from the persisted refresh token on first load (the
  // access token itself is intentionally never persisted — see apiClient.ts).
  useEffect(() => {
    const refreshToken = tokenStore.getRefreshToken();
    if (!refreshToken) {
      setIsLoading(false);
      return;
    }
    authService
      .refresh(refreshToken)
      .then((result) => {
        tokenStore.setAccessToken(result.accessToken);
        tokenStore.setRefreshToken(result.refreshToken);
        setUser(result.user);
      })
      .catch(() => {
        tokenStore.setAccessToken(null);
        tokenStore.setRefreshToken(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const result = await authService.login({ email, password });
    tokenStore.setAccessToken(result.accessToken);
    tokenStore.setRefreshToken(result.refreshToken);
    setUser(result.user);
    return result.user;
  }

  async function loginWithOtp(email: string, code: string) {
    const result = await authService.verifyLoginOtp({ email, code });
    tokenStore.setAccessToken(result.accessToken);
    tokenStore.setRefreshToken(result.refreshToken);
    setUser(result.user);
    return result.user;
  }

  async function register(input: { name: string; email: string; password: string; confirmPassword: string; phone?: string }) {
    return authService.register(input);
  }

  async function logout() {
    const refreshToken = tokenStore.getRefreshToken();
    tokenStore.setAccessToken(null);
    tokenStore.setRefreshToken(null);
    setUser(null);
    if (refreshToken) {
      await authService.logout(refreshToken).catch((err: unknown) => {
        if (!(err instanceof ApiClientError)) throw err;
      });
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, loginWithOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
