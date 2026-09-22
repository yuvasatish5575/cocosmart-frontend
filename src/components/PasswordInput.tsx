import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/Frontend";
import { cn } from "@/lib/utils";

interface PasswordInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  error?: string;
  hint?: string;
  /** Rendered just left of the show/hide toggle, e.g. a "passwords match" checkmark. */
  indicator?: ReactNode;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, indicator, ...props }, ref) => {
    const [visible, setVisible] = useState(false);
    return (
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-[38px] h-4 w-4 text-charcoal-soft" strokeWidth={1.8} />
        <Input ref={ref} type={visible ? "text" : "password"} className={cn("pl-10", indicator ? "pr-16" : "pr-10", className)} {...props} />
        {indicator && <span className="pointer-events-none absolute right-10 top-[38px] h-4 w-4">{indicator}</span>}
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          tabIndex={-1}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-4 top-[38px] h-4 w-4 text-charcoal-soft transition-colors hover:text-charcoal"
        >
          {visible ? <EyeOff className="h-4 w-4" strokeWidth={1.8} /> : <Eye className="h-4 w-4" strokeWidth={1.8} />}
        </button>
      </div>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
