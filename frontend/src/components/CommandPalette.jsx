import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  LayoutDashboard,
  ListTodo,
  Calendar,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle2,
  Circle,
} from "lucide-react";
import useTasks from "../hooks/useTasks";

const ACTIONS = [
  {
    id: "dashboard",
    label: "Go to Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  { id: "tasks", label: "Go to My Tasks", icon: ListTodo, path: "/tasks" },
  {
    id: "calendar",
    label: "Go to Calendar",
    icon: Calendar,
    path: "/calendar",
  },
  {
    id: "settings",
    label: "Go to Settings",
    icon: Settings,
    path: "/settings",
  },
];

export default function CommandPalette({ open, onClose, onNewTask }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [highlighted, setHighlighted] = useState(0);
  const inputRef = useRef(null);
  const { tasks } = useTasks({});

  useEffect(() => {
    if (open) {
      setQuery("");
      setHighlighted(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const filteredActions = useMemo(() => {
    if (!query.trim()) return ACTIONS;
    const q = query.toLowerCase();
    return ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  }, [query]);

  const filteredTasks = useMemo(() => {
    if (!query.trim()) return tasks.slice(0, 6);
    const q = query.toLowerCase();
    return tasks
      .filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description || "").toLowerCase().includes(q),
      )
      .slice(0, 8);
  }, [query, tasks]);

  const items = useMemo(() => {
    const list = [];
    if (query.trim()) {
      list.push({
        key: "create",
        label: `Create task "${query}"`,
        icon: Plus,
        action: () => {
          onClose();
          onNewTask?.(query);
        },
      });
    }
    filteredActions.forEach((a) =>
      list.push({
        key: a.id,
        label: a.label,
        icon: a.icon,
        action: () => {
          onClose();
          navigate(a.path);
        },
      }),
    );
    filteredTasks.forEach((t) =>
      list.push({
        key: `t-${t.id}`,
        label: t.title,
        icon: t.completed ? CheckCircle2 : Circle,
        meta: t.priority,
        action: () => {
          onClose();
          navigate("/tasks");
        },
      }),
    );
    return list;
  }, [query, filteredActions, filteredTasks, navigate, onClose, onNewTask]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlighted((h) => Math.min(h + 1, items.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlighted((h) => Math.max(h - 1, 0));
      }
      if (e.key === "Enter") {
        e.preventDefault();
        items[highlighted]?.action?.();
      }
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, items, highlighted, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-slate-950/40 p-4 pt-24 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-line bg-card shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-line px-4">
              <Search size={18} className="text-muted" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setHighlighted(0);
                }}
                placeholder="Search tasks or jump to…"
                className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-muted"
              />
              <kbd className="rounded-md border border-line px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                ESC
              </kbd>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {items.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted">
                  No results
                </p>
              ) : (
                items.map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onClick={item.action}
                      onMouseEnter={() => setHighlighted(i)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                        highlighted === i
                          ? "bg-primary/10 text-primary"
                          : "text-txt hover:bg-bg"
                      }`}
                    >
                      <Icon size={16} className="shrink-0" />
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.meta && (
                        <span className="text-[10px] font-semibold uppercase text-muted">
                          {item.meta}
                        </span>
                      )}
                      {highlighted === i && <ArrowRight size={14} />}
                    </button>
                  );
                })
              )}
            </div>
            <div className="flex items-center justify-between border-t border-line bg-bg/40 px-4 py-2 text-[10px] text-muted">
              <span>↑↓ navigate · ↵ select · esc close</span>
              <span>TaskFlow</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
