import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail } from "lucide-react";
import { Logo, Input, Button, CoconutLeaf } from "@/components/Frontend";
import { OtpInput, OTP_CODE_LENGTH } from "@/components/OtpInput";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/AuthContext";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";

const OTP_RESEND_COOLDOWN_SECONDS = 30;

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
  const { login, loginWithOtp } = useAuth();

  const [otpMode, setOtpMode] = useState<"email" | "code" | null>(null);
  const [otpEmail, setOtpEmail] = useState("");
  const [otpEmailError, setOtpEmailError] = useState<string | undefined>();
  const [otpCode, setOtpCode] = useState("");
  const [otpError, setOtpError] = useState<string | undefined>();
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [devOtp, setDevOtp] = useState<string | null>(null);

  const redirectTo = (location.state as { from?: string } | null)?.from ?? "/account";

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = setInterval(() => setOtpCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [otpCooldown]);

  function resetOtpFlow() {
    setOtpMode(null);
    setOtpEmail("");
    setOtpEmailError(undefined);
    setOtpCode("");
    setOtpError(undefined);
    setOtpCooldown(0);
    setDevOtp(null);
  }

  async function sendLoginOtp(targetEmail: string) {
    setOtpSending(true);
    setOtpEmailError(undefined);
    try {
      const result = await authService.requestLoginOtp(targetEmail);
      setDevOtp(result.devOtp ?? null);
      setOtpCode("");
      setOtpError(undefined);
      setOtpCooldown(OTP_RESEND_COOLDOWN_SECONDS);
      setOtpMode("code");
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setOtpEmailError(message);
    } finally {
      setOtpSending(false);
    }
  }

  async function handleOtpEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!otpEmail.trim() || !otpEmail.includes("@")) {
      setOtpEmailError("Enter a valid email address");
      return;
    }
    await sendLoginOtp(otpEmail.trim());
  }

  async function handleOtpResend() {
    if (otpCooldown > 0 || otpSending) return;
    await sendLoginOtp(otpEmail.trim());
  }

  async function submitOtpCode(fullCode: string) {
    if (otpVerifying) return;
    setOtpVerifying(true);
    setOtpError(undefined);
    try {
      await loginWithOtp(otpEmail.trim(), fullCode);
      show("Welcome back");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TOO_MANY_REQUESTS") {
        const retryAfter = (err.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
        setOtpCooldown(retryAfter ?? OTP_RESEND_COOLDOWN_SECONDS);
      }
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setOtpError(message);
      setOtpCode("");
    } finally {
      setOtpVerifying(false);
    }
  }

  function handleOtpCodeChange(next: string) {
    setOtpCode(next);
    setOtpError(undefined);
    if (next.length === OTP_CODE_LENGTH) {
      void submitOtpCode(next);
    }
  }

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

        {otpMode === "code" ? (
          <div className="flex flex-col items-center gap-5">
            <p className="text-center text-sm text-charcoal-muted">
              Enter the 6-digit code sent to <strong className="font-bold text-charcoal">{otpEmail}</strong>
            </p>
            {devOtp && (
              <p className="rounded-md border border-dashed border-line bg-cream px-3 py-2 text-center text-xs text-charcoal-soft">
                Dev only — code: <strong className="font-mono">{devOtp}</strong>
              </p>
            )}

            <OtpInput value={otpCode} onChange={handleOtpCodeChange} disabled={otpVerifying} />

            {otpError && (
              <p className="text-center text-sm font-semibold text-error" role="alert">
                {otpError}
              </p>
            )}

            <Button
              className="w-full"
              size="lg"
              loading={otpVerifying}
              onClick={() => submitOtpCode(otpCode)}
              disabled={otpCode.length !== OTP_CODE_LENGTH}
            >
              Sign In
            </Button>

            <p className="text-center text-sm text-charcoal-muted">
              Didn't get a code?{" "}
              {otpCooldown > 0 ? (
                <span className="font-bold text-charcoal-soft">Resend in {otpCooldown}s</span>
              ) : (
                <button
                  type="button"
                  onClick={handleOtpResend}
                  disabled={otpSending}
                  className="font-bold text-coconut hover:underline disabled:opacity-60"
                >
                  {otpSending ? "Sending…" : "Resend code"}
                </button>
              )}
            </p>

            <button type="button" onClick={resetOtpFlow} className="text-xs font-bold text-coconut hover:underline">
              Back to Sign In
            </button>
          </div>
        ) : otpMode === "email" ? (
          <form className="flex flex-col gap-4" onSubmit={handleOtpEmailSubmit} noValidate>
            <p className="text-sm text-charcoal-muted">
              We'll email a 6-digit code to sign you in — no password needed. If an account exists for this email,
              you'll receive it shortly.
            </p>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Email"
                type="email"
                value={otpEmail}
                onChange={(e) => setOtpEmail(e.target.value)}
                error={otpEmailError}
                className="pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full" loading={otpSending}>
              Send Code
            </Button>

            <button type="button" onClick={resetOtpFlow} className="self-center text-xs font-bold text-coconut hover:underline">
              Back to Sign In
            </button>
          </form>
        ) : unverifiedEmail ? (
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

            <PasswordInput
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <Link to="/forgot-password" className="-mt-2 self-end text-xs font-bold text-coconut hover:underline">
              Forgot password?
            </Link>

            <Button type="submit" size="lg" className="mt-2 w-full" loading={submitting}>
              Sign In
            </Button>

            <button
              type="button"
              onClick={() => {
                setOtpEmail(email);
                setOtpMode("email");
              }}
              className="self-center text-xs font-bold text-coconut hover:underline"
            >
              Sign in with a code instead
            </button>
          </form>
        )}

        {!unverifiedEmail && otpMode === null && (
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
