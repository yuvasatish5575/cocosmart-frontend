import { useRef } from "react";
import { cn } from "@/lib/utils";

export const OTP_CODE_LENGTH = 6;

export function OtpInput({
  value,
  onChange,
  disabled,
  length = OTP_CODE_LENGTH,
}: {
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  length?: number;
}) {
  const digits = Array.from({ length }, (_, i) => value[i] ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  function setDigit(index: number, char: string) {
    const next = digits.slice();
    next[index] = char;
    onChange(next.join(""));
  }

  function handleChange(index: number, raw: string) {
    const char = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, char);
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      setDigit(index - 1, "");
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) inputRefs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted.padEnd(length, "").slice(0, length).trimEnd());
    const focusIndex = Math.min(pasted.length, length - 1);
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
