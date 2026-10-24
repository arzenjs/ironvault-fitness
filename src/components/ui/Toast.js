"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Info, TriangleAlert, X, XCircle } from "lucide-react";
import { EASE_OUT_EXPO } from "@/lib/motion";

/**
 * Minimal toast system (no extra dependency). Toasts are announced politely to
 * screen readers and auto-dismiss after 5.5s.
 */
const ToastContext = createContext(null);

const icons = {
  success: CheckCircle2,
  error: XCircle,
  warning: TriangleAlert,
  info: Info,
};

const toneStyles = {
  success: "border-emerald-400/35 text-emerald-100",
  error: "border-red-400/40 text-red-50",
  warning: "border-amber-300/40 text-amber-50",
  info: "border-white/20 text-fog",
};

const iconStyles = {
  success: "text-emerald-400",
  error: "text-red-400",
  warning: "text-amber-300",
  info: "text-ash",
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    ({ title, description, tone = "info", duration = 5500 }) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((list) => [...list.slice(-3), { id, title, description, tone }]);
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => clearTimeout(timer));
      map.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] flex flex-col items-center gap-2 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:bottom-6 sm:left-auto sm:right-6 sm:items-end sm:px-0"
        role="region"
        aria-label="Notifications"
      >
        <AnimatePresence initial={false}>
          {toasts.map((item) => {
            const Icon = icons[item.tone] || Info;
            return (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 24, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.97 }}
                transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border bg-coal/95 px-4 py-3 shadow-2xl backdrop-blur ${toneStyles[item.tone]}`}
              >
                <Icon size={18} className={`mt-0.5 shrink-0 ${iconStyles[item.tone]}`} aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug">{item.title}</p>
                  {item.description ? (
                    <p className="mt-1 text-xs leading-relaxed text-ash break-words">{item.description}</p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="-mr-1 -mt-1 rounded-md p-1 text-ash transition hover:text-fog"
                  aria-label="Dismiss notification"
                >
                  <X size={14} />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
        <div aria-live="polite" aria-atomic="true" className="sr-only">
          {toasts.length ? toasts[toasts.length - 1].title : ""}
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}
