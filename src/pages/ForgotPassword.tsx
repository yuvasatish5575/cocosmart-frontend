import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { Logo, Input, Button, CoconutLeaf } from "@/components/Frontend";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address");
      return;
    }
    setError(undefined);
    setSubmitting(true);
    try {
      await authService.forgotPassword(email.trim());
      setSent(true);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.");
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
          <h1 className="mt-6 font-display text-2xl text-charcoal">Reset your password</h1>
          <p className="mt-2 text-sm text-charcoal-muted">
            {sent
              ? "Check your inbox for a link to choose a new password."
              : "Enter the email on your account and we'll send you a reset link."}
          </p>
        </div>

        {sent ? (
          <Button variant="outline" size="lg" className="w-full" asChild>
            <Link to="/login">Back to Sign In</Link>
          </Button>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error}
                className="pl-10"
                autoComplete="email"
                autoFocus
              />
            </div>
            <Button type="submit" size="lg" className="mt-2 w-full" loading={submitting}>
              Send Reset Link
            </Button>
            <Link to="/login" className="self-center text-xs font-bold text-coconut hover:underline">
              Back to Sign In
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
