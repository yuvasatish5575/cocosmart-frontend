import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import { Logo, Input, Button, CoconutLeaf } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/AuthContext";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({});
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { show } = useToast();
  const { login } = useAuth();

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/account";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (!email.trim() || !email.includes("@")) next.email = "Enter a valid email address";
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    setErrors(next);
    setUnverifiedEmail(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await login(email.trim(), password);
      show("Welcome back");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "EMAIL_NOT_VERIFIED") {
        setUnverifiedEmail(email.trim());
        setErrors({});
      } else {
        const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
        setErrors({ form: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!unverifiedEmail) return;
    setResending(true);
    try {
      await authService.resendCode(unverifiedEmail);
      navigate(`/verify-email?email=${encodeURIComponent(unverifiedEmail)}`);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      show(message, undefined, "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <div className="relative flex min-h-[calc(100vh-72px)] items-center justify-center overflow-hidden bg-coconut px-4 py-16 sm:px-6">
      <CoconutLeaf color="#FFFFFF" className="pointer-events-none absolute -left-12 -top-12 w-64 -rotate-[18deg] opacity-[0.08]" />
      <CoconutLeaf color="#D4AF37" className="pointer-events-none absolute -bottom-16 -right-12 w-72 rotate-[24deg] opacity-[0.12]" />

      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-lifted sm:p-10">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link to="/" aria-label="CocoSmart home">
            <Logo />
          </Link>
          <h1 className="mt-6 font-display text-2xl text-charcoal">Welcome back</h1>
          <p className="mt-2 text-sm text-charcoal-muted">Sign in to track orders, manage subscriptions and more.</p>
        </div>

        {unverifiedEmail ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-md border border-line bg-cream px-4 py-3 text-sm text-charcoal-muted" role="alert">
              <strong className="font-bold text-charcoal">{unverifiedEmail}</strong> hasn't been verified yet. Send a new
              verification code to finish setting up your account.
            </p>
            <Button onClick={handleResend} size="lg" className="w-full" loading={resending}>
              Send Verification Code
            </Button>
            <button
              type="button"
              onClick={() => setUnverifiedEmail(null)}
              className="self-center text-xs font-bold text-coconut hover:underline"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <p className="rounded-md border border-error-soft bg-error-soft px-3 py-2 text-sm font-semibold text-error" role="alert">
                {errors.form}
              </p>
            )}

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
                className="pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={errors.password}
                className="pl-10"
                autoComplete="current-password"
              />
            </div>

            <Link to="/forgot-password" className="-mt-2 self-end text-xs font-bold text-coconut hover:underline">
              Forgot password?
            </Link>

            <Button type="submit" size="lg" className="mt-2 w-full" loading={submitting}>
              Sign In
            </Button>
          </form>
        )}

        {!unverifiedEmail && (
          <>
            <div className="my-6 flex items-center gap-3 text-xs font-bold uppercase tracking-wide text-charcoal-soft">
              <span className="h-px flex-1 bg-line" />
              or
              <span className="h-px flex-1 bg-line" />
            </div>

            <Button variant="outline" size="lg" className="w-full" asChild>
              <Link to="/">Continue as Guest</Link>
            </Button>

            <p className="mt-6 text-center text-sm text-charcoal-muted">
              New to CocoSmart?{" "}
              <Link to="/register" className="font-bold text-coconut hover:underline">
                Create Account
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
