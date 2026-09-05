import { apiFetch } from "@/lib/apiClient";
import type { AuthUser } from "@/data/types";

interface AuthResult {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResult {
  email: string;
  message: string;
}

export const authService = {
  register(input: { name: string; email: string; password: string; confirmPassword: string; phone?: string }) {
    return apiFetch<RegisterResult>("/auth/register", { method: "POST", body: input, auth: false });
  },
  verifyEmail(input: { email: string; code: string }) {
    return apiFetch<{ message: string }>("/auth/verify-email", { method: "POST", body: input, auth: false });
  },
  resendCode(email: string) {
    return apiFetch<{ message: string }>("/auth/resend-code", { method: "POST", body: { email }, auth: false });
  },
  login(input: { email: string; password: string }) {
    return apiFetch<AuthResult>("/auth/login", { method: "POST", body: input, auth: false });
  },
  refresh(refreshToken: string) {
    return apiFetch<AuthResult>("/auth/refresh", { method: "POST", body: { refreshToken }, auth: false });
  },
  logout(refreshToken: string) {
    return apiFetch<{ message: string }>("/auth/logout", { method: "POST", body: { refreshToken }, auth: false });
  },
  me() {
    return apiFetch<AuthUser>("/auth/me");
  },
  forgotPassword(email: string) {
    return apiFetch<{ message: string }>("/auth/forgot-password", { method: "POST", body: { email }, auth: false });
  },
  resetPassword(token: string, password: string) {
    return apiFetch<{ message: string }>("/auth/reset-password", { method: "POST", body: { token, password }, auth: false });
  },
};
