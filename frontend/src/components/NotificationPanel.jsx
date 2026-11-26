import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Clock, BellOff } from "lucide-react";

export default function NotificationPanel({ open, items }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.15 }}
          className="absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-line bg-card shadow-xl"
        >
          <div className="border-b border-line px-4 py-3 text-sm font-semibold">
            Notifications
          </div>
          <div className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-muted">
                <BellOff size={22} />
                <p className="text-sm">You're all caught up 🎉</p>
              </div>
            ) : (
              items.map((n) => (
                <div
                  key={n.id}
                  className="flex items-start gap-3 border-b border-line/60 px-4 py-3 last:border-0"
                >
                  <span
                    className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${
                      n.tone === "danger"
                        ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
                        : "bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400"
                    }`}
                  >
                    {n.tone === "danger" ? (
                      <AlertTriangle size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <p className="truncate text-xs text-muted">{n.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
