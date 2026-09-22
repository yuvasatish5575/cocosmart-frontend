import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo, Button, CoconutLeaf } from "@/components/Frontend";
import { PasswordInput } from "@/components/PasswordInput";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const navigate = useNavigate();
  const { show } = useToast();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{ password?: string; confirmPassword?: string; form?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const next: typeof errors = {};
    if (password.length < 8) next.password = "Password must be at least 8 characters";
    if (confirmPassword !== password) next.confirmPassword = "Passwords don't match";
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await authService.resetPassword(token, password);
      show("Password updated", "You can now sign in with your new password.");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setErrors({ form: message });
    } finally {
      setSubmitting(false);
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
          <h1 className="mt-6 font-display text-2xl text-charcoal">Choose a new password</h1>
          <p className="mt-2 text-sm text-charcoal-muted">Make it at least 8 characters.</p>
        </div>

        {!token ? (
          <p className="rounded-md border border-error-soft bg-error-soft px-3 py-2 text-center text-sm font-semibold text-error" role="alert">
            This reset link is missing its token. Please request a new one.
          </p>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            {errors.form && (
              <p className="rounded-md border border-error-soft bg-error-soft px-3 py-2 text-sm font-semibold text-error" role="alert">
                {errors.form}
              </p>
            )}
            <PasswordInput
              label="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="new-password"
              autoFocus
            />
            <PasswordInput
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
            <Button type="submit" size="lg" className="mt-2 w-full" loading={submitting}>
              Update Password
            </Button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-charcoal-muted">
          <Link to="/login" className="font-bold text-coconut hover:underline">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
