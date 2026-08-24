"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

export function Sheet({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ type: "spring", damping: 32, stiffness: 340 }}
            className={`relative z-10 max-h-[88vh] w-full overflow-y-auto rounded-t-3xl border-t border-ink-700/60 bg-ink-900 pb-[env(safe-area-inset-bottom)] shadow-elevated md:max-h-[85vh] md:rounded-3xl md:border ${
              wide ? "md:max-w-xl" : "md:max-w-md"
            }`}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-ink-700/50 bg-ink-900/95 px-5 py-4 backdrop-blur">
              <h2 className="font-display text-base font-semibold text-ink-50">{title}</h2>
              <button
                onClick={onClose}
                className="tap-target flex h-8 w-8 items-center justify-center rounded-full bg-ink-800 text-ink-300 hover:text-ink-50"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-5 py-4">{children}</div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
