import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { CheckCircle2, Info, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ToastItem {
  id: number;
  title: string;
  description?: string;
  tone: "success" | "info" | "error";
}

interface ToastContextValue {
  show: (title: string, description?: string, tone?: ToastItem["tone"]) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const icons = {
  success: CheckCircle2,
  info: Info,
  error: AlertCircle,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const show = useCallback((title: string, description?: string, tone: ToastItem["tone"] = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, title, description, tone }]);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      <ToastPrimitive.Provider swipeDirection="left" duration={3200}>
        {children}
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <ToastPrimitive.Root
              key={t.id}
              onOpenChange={(open) => {
                if (!open) setToasts((prev) => prev.filter((x) => x.id !== t.id));
              }}
              className={cn(
                "flex items-start gap-3 rounded-lg border border-line bg-white px-4 py-3 shadow-lifted",
                "data-[state=open]:animate-[toast-in_0.25s_var(--ease-premium)]",
                "data-[swipe=end]:animate-[toast-out_0.2s_ease-in]"
              )}
            >
              <Icon
                className={cn(
                  "mt-0.5 h-5 w-5 shrink-0",
                  t.tone === "success" && "text-coconut",
                  t.tone === "error" && "text-error",
                  t.tone === "info" && "text-charcoal-muted"
                )}
              />
              <div className="flex flex-col gap-0.5">
                <ToastPrimitive.Title className="text-sm font-bold text-charcoal">{t.title}</ToastPrimitive.Title>
                {t.description && (
                  <ToastPrimitive.Description className="text-xs text-charcoal-muted">
                    {t.description}
                  </ToastPrimitive.Description>
                )}
              </div>
            </ToastPrimitive.Root>
          );
        })}
        <ToastPrimitive.Viewport className="fixed bottom-6 left-6 z-[100] flex w-[340px] max-w-[calc(100vw-2rem)] flex-col gap-2 outline-none max-sm:bottom-20 max-sm:left-4" />
      </ToastPrimitive.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
