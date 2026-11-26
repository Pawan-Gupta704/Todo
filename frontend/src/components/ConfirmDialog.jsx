import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "danger",
  loading = false,
  onConfirm,
  onCancel,
}) {
  const tones = {
    danger: {
      bg: "bg-red-100 dark:bg-red-500/15",
      text: "text-red-600 dark:text-red-400",
      btn: "bg-red-500 hover:bg-red-600",
    },
    primary: {
      bg: "bg-primary/10",
      text: "text-primary",
      btn: "bg-primary hover:bg-primary/90",
    },
  };
  const t = tones[tone] || tones.danger;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-line bg-card p-6 shadow-2xl"
          >
            <div
              className={`mx-auto grid h-12 w-12 place-items-center rounded-full ${t.bg} ${t.text}`}
            >
              <AlertTriangle size={22} />
            </div>
            <h3 className="mt-4 text-center text-lg font-bold">{title}</h3>
            <p className="mt-1 text-center text-sm text-muted">{message}</p>
            <div className="mt-6 flex gap-2">
              <button
                onClick={onCancel}
                className="btn-ghost flex-1"
                disabled={loading}
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                disabled={loading}
                className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition active:scale-[0.98] disabled:opacity-60 ${t.btn}`}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
