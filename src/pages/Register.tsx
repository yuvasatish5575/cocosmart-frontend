import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, User as UserIcon, Phone, Check, X as XIcon } from "lucide-react";
import { Logo, Input, Button, CoconutLeaf } from "@/components/Frontend";
import { PasswordInput } from "@/components/PasswordInput";
import { useAuth } from "@/hooks/AuthContext";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordChecks(password: string) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    digit: /\d/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  };
}

const PASSWORD_RULES: Array<{ key: keyof ReturnType<typeof passwordChecks>; label: string }> = [
  { key: "length", label: "At least 8 characters" },
  { key: "upper", label: "One uppercase letter" },
  { key: "lower", label: "One lowercase letter" },
  { key: "digit", label: "One number" },
  { key: "special", label: "One special character" },
];

function PasswordChecklist({ password }: { password: string }) {
  const checks = passwordChecks(password);
  return (
    <ul className="grid grid-cols-1 gap-1 sm:grid-cols-2">
      {PASSWORD_RULES.map((rule) => {
        const met = checks[rule.key];
        return (
          <li key={rule.key} className={cn("flex items-center gap-1.5 text-xs", met ? "text-leaf" : "text-charcoal-soft")}>
            {met ? <Check className="h-3.5 w-3.5 shrink-0" strokeWidth={2.5} /> : <XIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />}
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirmPassword?: string; form?: string }>({});
  const [conflict, setConflict] = useState<{ type: "verified" | "unverified"; email: string } | null>(null);
  const [resending, setResending] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const emailValid = EMAIL_RE.test(email.trim());
  const checks = passwordChecks(password);
  const passwordValid = Object.values(checks).every(Boolean);
  const confirmValid = confirmPassword.length > 0 && confirmPassword === password;

  function markTouched(field: string) {
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function validate() {
    const next: typeof errors = {};
    if (!name.trim()) next.name = "Enter your name";
    if (!emailValid) next.email = "Enter a valid email address";
    if (!passwordValid) next.password = "Password doesn't meet all requirements";
    if (!confirmValid) next.confirmPassword = "Passwords don't match";
    return next;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true, password: true, confirmPassword: true });
    const next = validate();
    setErrors(next);
    setConflict(null);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      const result = await register({
        name: name.trim(),
        email: email.trim(),
        password,
        confirmPassword,
        phone: phone.trim() || undefined,
      });
      navigate(`/verify-email?email=${encodeURIComponent(result.email)}`);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "CONFLICT") {
        setConflict({ type: "verified", email: email.trim() });
      } else if (err instanceof ApiClientError && err.code === "EMAIL_NOT_VERIFIED") {
        setConflict({ type: "unverified", email: email.trim() });
      } else {
        const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
        setErrors({ form: message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (!conflict) return;
    setResending(true);
    try {
      await authService.resendCode(conflict.email);
      navigate(`/verify-email?email=${encodeURIComponent(conflict.email)}`);
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setErrors({ form: message });
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
          <h1 className="mt-6 font-display text-2xl text-charcoal">Create your account</h1>
          <p className="mt-2 text-sm text-charcoal-muted">Join CocoSmart for traceable, farm-fresh coconut products.</p>
        </div>

        {conflict ? (
          <div className="flex flex-col gap-4">
            <p className="rounded-md border border-line bg-cream px-4 py-3 text-sm text-charcoal-muted" role="alert">
              {conflict.type === "verified" ? (
                <>
                  An account with <strong className="font-bold text-charcoal">{conflict.email}</strong> already exists.
                  Sign in instead.
                </>
              ) : (
                <>
                  <strong className="font-bold text-charcoal">{conflict.email}</strong> is already registered but hasn't
                  been verified yet. Send a new verification code to finish setting up your account.
                </>
              )}
            </p>
            {conflict.type === "verified" ? (
              <Button size="lg" className="w-full" asChild>
                <Link to="/login">Sign In</Link>
              </Button>
            ) : (
              <Button onClick={handleResend} size="lg" className="w-full" loading={resending}>
                Send Verification Code
              </Button>
            )}
            <button type="button" onClick={() => setConflict(null)} className="self-center text-xs font-bold text-coconut hover:underline">
              Back
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
              <UserIcon className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => markTouched("name")}
                error={touched.name ? errors.name : undefined}
                className="pl-10"
                autoComplete="name"
                autoFocus
              />
            </div>

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => markTouched("email")}
                error={touched.email && !emailValid ? "Enter a valid email address" : undefined}
                className="pl-10 pr-10"
                autoComplete="email"
              />
              {email.length > 0 && emailValid && (
                <Check className="pointer-events-none absolute right-4 top-[38px] h-4 w-4 text-leaf" strokeWidth={2.5} />
              )}
            </div>

            <div className="relative">
              <Phone className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Phone (optional)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10"
                autoComplete="tel"
              />
            </div>

            <div className="flex flex-col gap-2">
              <PasswordInput
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onBlur={() => markTouched("password")}
                error={touched.password && !passwordValid ? "Password doesn't meet all requirements" : undefined}
                autoComplete="new-password"
              />
              {(touched.password || password.length > 0) && <PasswordChecklist password={password} />}
            </div>

            <PasswordInput
              label="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => markTouched("confirmPassword")}
              error={touched.confirmPassword && !confirmValid ? "Passwords don't match" : undefined}
              autoComplete="new-password"
              indicator={confirmValid ? <Check className="h-4 w-4 text-leaf" strokeWidth={2.5} /> : undefined}
            />

            <Button type="submit" size="lg" className="mt-2 w-full" loading={submitting}>
              Create Account
            </Button>
          </form>
        )}

        {!conflict && (
          <p className="mt-6 text-center text-sm text-charcoal-muted">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-coconut hover:underline">
              Sign In
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
