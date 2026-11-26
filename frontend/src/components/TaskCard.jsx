import { motion } from "framer-motion";
import {
  Calendar,
  Pencil,
  Trash2,
  CheckCircle2,
  Circle,
  Tag,
  User,
} from "lucide-react";
import { formatDate, isOverdue, priorityStyles } from "../utils/helpers";
import { useAuth } from "../context/AuthContext";

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const { user } = useAuth();
  const overdue = isOverdue(task);
  const isOwner = user?.id === task.user_id; // ← WHO OWNS THIS TASK?

  const ownerInitials = (task.owner_name || "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      whileHover={{ y: -3 }}
      className="card flex flex-col p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task.id)}
          className="mt-0.5 shrink-0 text-muted transition hover:text-primary"
          aria-label="Toggle complete"
        >
          {task.completed ? (
            <CheckCircle2 size={20} className="text-green-500" />
          ) : (
            <Circle size={20} />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <h3
            className={`truncate text-sm font-semibold ${
              task.completed ? "text-muted line-through" : "text-txt"
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted">
              {task.description}
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className={`badge ${priorityStyles[task.priority]}`}>
          {task.priority}
        </span>
        <span className="badge bg-secondary/10 text-secondary">
          <Tag size={11} /> {task.category}
        </span>
        <span
          className={`badge ${
            overdue
              ? "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400"
              : "bg-bg text-muted"
          }`}
        >
          <Calendar size={11} /> {formatDate(task.due_date)}
        </span>
      </div>

      {/* 👇 OWNER BADGE — always visible */}
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-[8px] font-bold text-white">
          {ownerInitials}
        </span>
        <span>
          {isOwner
            ? "Created by you"
            : `Created by ${task.owner_name || "Unknown"}`}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-end gap-1 border-t border-line pt-3">
        {/* Edit is available to EVERYONE */}
        <button
          onClick={() => onEdit(task)}
          className="rounded-lg p-2 text-muted transition hover:bg-bg hover:text-primary"
          aria-label="Edit task"
        >
          <Pencil size={16} />
        </button>

        {/* 👇 Delete is OWNER-ONLY */}
        {isOwner && (
          <button
            onClick={() => onDelete(task)}
            className="rounded-lg p-2 text-muted transition hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10"
            aria-label="Delete task"
            title="Only the task creator can delete it"
          >
            <Trash2 size={16} />
          </button>
        )}

        {/* Non-owners see a subtle lock hint instead of the trash icon */}
        {!isOwner && (
          <span
            className="rounded-lg p-2 text-muted/40 cursor-not-allowed"
            title={`Only ${task.owner_name} can delete this task`}
          >
            <User size={16} />
          </span>
        )}
      </div>
    </motion.div>
  );
}
