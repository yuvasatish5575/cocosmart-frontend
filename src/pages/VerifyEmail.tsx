import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Logo, Button, CoconutLeaf } from "@/components/Frontend";
import { useToast } from "@/hooks/useToast";
import { authService } from "@/services/authService";
import { ApiClientError } from "@/lib/apiClient";
import { cn } from "@/lib/utils";

const CODE_LENGTH = 6;
const RESEND_COOLDOWN_SECONDS = 30;

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (next: string) => void; disabled?: boolean }) {
  const digits = Array.from({ length: CODE_LENGTH }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, char);
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (!pasted) return;
    onChange(pasted.padEnd(CODE_LENGTH, "").slice(0, CODE_LENGTH).trimEnd());
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  }

  return (
    <div className="flex justify-center gap-2 sm:gap-3">
      {digits.map((digit, i) => (
        <input
          key={i}
          ref={(el) => {
            inputRefs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          value={digit}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "h-14 w-11 rounded-md border border-line bg-white text-center text-xl font-bold text-charcoal transition-colors sm:h-16 sm:w-12",
            "focus:outline-none focus:border-coconut focus:ring-2 focus:ring-coconut-50",
            disabled && "opacity-60"
          )}
        />
      ))}
    </div>
  );
}

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") ?? "";
  const navigate = useNavigate();
  const { show } = useToast();

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function submitCode(fullCode: string) {
    if (!email || verifying) return;
    setVerifying(true);
    setError(undefined);
    try {
      await authService.verifyEmail({ email, code: fullCode });
      show("Email verified", "You can now sign in to your account.");
      navigate("/login", { replace: true });
    } catch (err) {
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setError(message);
      setCode("");
    } finally {
      setVerifying(false);
    }
  }

  function handleCodeChange(next: string) {
    setCode(next);
    setError(undefined);
    if (next.length === CODE_LENGTH) {
      void submitCode(next);
    }
  }

  async function handleResend() {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(undefined);
    try {
      await authService.resendCode(email);
      setCode("");
      setCooldown(RESEND_COOLDOWN_SECONDS);
      show("Code sent", `A new verification code was sent to ${email}.`);
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "TOO_MANY_REQUESTS") {
        const retryAfter = (err.details as { retryAfterSeconds?: number } | undefined)?.retryAfterSeconds;
        setCooldown(retryAfter ?? RESEND_COOLDOWN_SECONDS);
      }
      const message = err instanceof ApiClientError ? err.message : "Something went wrong. Please try again.";
      setError(message);
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
          <h1 className="mt-6 font-display text-2xl text-charcoal">Verify your email</h1>
          {email ? (
            <p className="mt-2 text-sm text-charcoal-muted">
              Enter the 6-digit code we sent to <strong className="font-bold text-charcoal">{email}</strong>
            </p>
          ) : (
            <p className="mt-2 text-sm text-charcoal-muted">We couldn't tell which email to verify.</p>
          )}
        </div>

        {!email ? (
          <Button size="lg" className="w-full" asChild>
            <Link to="/register">Back to Sign Up</Link>
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-5">
            <OtpInput value={code} onChange={handleCodeChange} disabled={verifying} />

            {error && (
              <p className="text-center text-sm font-semibold text-error" role="alert">
                {error}
              </p>
            )}

            <Button className="w-full" size="lg" loading={verifying} onClick={() => submitCode(code)} disabled={code.length !== CODE_LENGTH}>
              Verify Email
            </Button>

            <p className="text-center text-sm text-charcoal-muted">
              Didn't get a code?{" "}
              {cooldown > 0 ? (
                <span className="font-bold text-charcoal-soft">Resend in {cooldown}s</span>
              ) : (
                <button type="button" onClick={handleResend} disabled={resending} className="font-bold text-coconut hover:underline disabled:opacity-60">
                  {resending ? "Sending…" : "Resend code"}
                </button>
              )}
            </p>

            <Link to="/login" className="text-xs font-bold text-coconut hover:underline">
              Back to Sign In
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
