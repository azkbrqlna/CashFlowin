// components/ui/toaster.jsx
"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(
    ({ title, description, variant = "success", duration = 3000 }) => {
      const id = Date.now().toString() + Math.random().toString(36).slice(2, 9);
      const t = { id, title, description, variant, duration };
      setToasts((s) => [t, ...s]);
      if (duration > 0) {
        setTimeout(() => {
          setToasts((s) => s.filter((x) => x.id !== id));
        }, duration);
      }
    },
    []
  );

  const remove = useCallback(
    (id) => setToasts((s) => s.filter((t) => t.id !== id)),
    []
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container */}
      <div
        aria-live="polite"
        className="fixed inset-0 flex items-end px-4 py-6 pointer-events-none sm:items-start sm:p-6 z-50"
      >
        <div className="w-full flex flex-col items-center space-y-3 sm:items-end">
          <AnimatePresence initial={false}>
            {toasts.map((t) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.98 }}
                className="pointer-events-auto w-full max-w-sm"
              >
                <div
                  className={
                    "rounded-lg shadow-lg p-4 flex items-start gap-3 " +
                    (t.variant === "success"
                      ? "bg-green-600 text-white"
                      : t.variant === "error"
                      ? "bg-red-600 text-white"
                      : "bg-white text-gray-900 border")
                  }
                >
                  <div className="mt-0.5">
                    {t.variant === "success" ? (
                      <CheckCircle className="w-6 h-6" />
                    ) : t.variant === "error" ? (
                      <XCircle className="w-6 h-6" />
                    ) : null}
                  </div>

                  <div className="flex-1">
                    <div className="font-medium">{t.title}</div>
                    {t.description && (
                      <div className="text-sm opacity-90 mt-1">
                        {t.description}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => remove(t.id)}
                    className="ml-2 text-white opacity-90 hover:opacity-100"
                    aria-label="close toast"
                  >
                    ×
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return ctx;
}
