import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2, AlertCircle } from "lucide-react";
import { CATEGORIES, PRIORITIES, toISODate } from "../utils/helpers";

const empty = {
  title: "",
  description: "",
  category: "Personal",
  priority: "Medium",
  due_date: "",
};

export default function TaskModal({
  open,
  onClose,
  onSubmit,
  initialTask,
  defaultDate,
}) {
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const titleRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    if (initialTask) {
      setForm({
        title: initialTask.title || "",
        description: initialTask.description || "",
        category: initialTask.category || "Personal",
        priority: initialTask.priority || "Medium",
        due_date: initialTask.due_date
          ? String(initialTask.due_date).slice(0, 10)
          : "",
      });
    } else {
      setForm({ ...empty, due_date: defaultDate || toISODate(new Date()) });
    }
    setError("");
    setTimeout(() => titleRef.current?.focus(), 100);
  }, [open, initialTask, defaultDate]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) {
      setError("Task title is required");
      return;
    }
    setSaving(true);
    try {
      await onSubmit({
        ...form,
        title: form.title.trim(),
        due_date: form.due_date || null,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/50 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <h2 className="text-lg font-bold">
                  {initialTask ? "Edit Task" : "Add New Task"}
                </h2>
                <p className="text-xs text-muted">
                  {initialTask
                    ? "Update task details"
                    : "Fill in the details below"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-1.5 text-muted hover:bg-bg hover:text-txt"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Task Title *
                  </label>
                  <input
                    ref={titleRef}
                    className="input"
                    value={form.title}
                    onChange={set("title")}
                    placeholder="e.g. Finish project report"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Description
                  </label>
                  <textarea
                    className="input min-h-[90px] resize-none"
                    value={form.description}
                    onChange={set("description")}
                    placeholder="Add more details…"
                    maxLength={500}
                  />
                  <p className="mt-1 text-right text-[10px] text-muted">
                    {form.description.length}/500
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Category
                    </label>
                    <select
                      className="input"
                      value={form.category}
                      onChange={set("category")}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium">
                      Priority
                    </label>
                    <select
                      className="input"
                      value={form.priority}
                      onChange={set("priority")}
                    >
                      {PRIORITIES.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium">
                    Due Date
                  </label>
                  <input
                    type="date"
                    className="input"
                    value={form.due_date}
                    onChange={set("due_date")}
                  />
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 border-t border-line bg-bg/40 px-6 py-4">
                <button type="button" className="btn-ghost" onClick={onClose}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving && <Loader2 size={16} className="animate-spin" />}
                  {initialTask ? "Update Task" : "Save Task"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
