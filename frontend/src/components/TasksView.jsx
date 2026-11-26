import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { Plus } from "lucide-react";
import useTasks from "../hooks/useTasks";
import TaskCard from "./TaskCard";
import TaskModal from "./TaskModal";
import SearchBar from "./SearchBar";
import EmptyState from "./EmptyState";
import ConfirmDialog from "./ConfirmDialog";
import { CATEGORIES, PRIORITIES } from "../utils/helpers";

export default function TasksView({
  title,
  subtitle,
  preset = {},
  showFilters = true,
}) {
  const [searchParams] = useSearchParams();

  // ----- filter state -----
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [status, setStatus] = useState("");
  const [sort, setSort] = useState("newest");

  // ----- modal / dialog state -----
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Sync with URL (e.g. Navbar search -> /tasks?q=foo, or Categories -> /tasks?category=Work)
  useEffect(() => {
    setSearch(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "");
  }, [searchParams]);

  // Debounce search so we don't fetch on every keystroke
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  // Build the filters object sent to the API
  const filters = useMemo(
    () => ({
      ...preset,
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(priority && { priority }),
      ...(category && { category }),
      ...(status && !preset.status && { status }),
      sort,
    }),
    [preset, debouncedSearch, priority, category, status, sort],
  );

  const { tasks, loading, addTask, editTask, removeTask, toggleTask } =
    useTasks(filters);

  // ----- handlers -----
  const handleSubmit = async (payload) => {
    if (editing) await editTask(editing.id, payload);
    else await addTask(payload);
    setModalOpen(false);
    setEditing(null);
  };

  const handleDelete = async (task) => {
    if (!window.confirm(`Delete "${task.title}"? This cannot be undone.`))
      return;
    try {
      await removeTask(task.id);
    } catch (err) {
      // A 403 is already toasted in useTasks — this just ensures no unhandled rejection
      if (err.response?.status !== 403) {
        toast.error("Failed to delete task");
      }
    }
  };

  const openAdd = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    Boolean(priority) ||
    Boolean(category) ||
    Boolean(status);

  return (
    <div className="space-y-5">
      {/* ---------------- Header ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
        </div>
        <button className="btn-primary" onClick={openAdd}>
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* ---------------- Filter bar (tinted box) ---------------- */}
      {showFilters && (
        <div className="grid gap-3 rounded-2xl border border-line bg-tintIndigo p-4 shadow-soft dark:bg-primary/5 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by title or description…"
            />
          </div>

          {!preset.status && (
            <select
              className="input !bg-white dark:!bg-card"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          )}

          <select
            className="input !bg-white dark:!bg-card"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="">All Priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <select
            className="input !bg-white dark:!bg-card"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="input !bg-white dark:!bg-card"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="dueDate">Due date</option>
            <option value="priority">Priority</option>
            <option value="alphabetical">A → Z</option>
          </select>
        </div>
      )}

      {/* ---------------- Task grid / states ---------------- */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-40 animate-pulse p-4">
              <div className="h-4 w-2/3 rounded bg-line" />
              <div className="mt-3 h-3 w-full rounded bg-line" />
              <div className="mt-2 h-3 w-4/5 rounded bg-line" />
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          title={hasActiveFilters ? "No matching tasks" : "No tasks yet"}
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search terms."
              : "Create your first task and start being productive."
          }
          action={
            <button className="btn-primary mt-2" onClick={openAdd}>
              <Plus size={18} /> Add New Task
            </button>
          }
          variant={debouncedSearch ? "search" : "tasks"}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence>
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={toggleTask}
                onEdit={openEdit}
                onDelete={setDeleting}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ---------------- Add / Edit modal ---------------- */}
      <TaskModal
        open={modalOpen}
        initialTask={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />

      {/* ---------------- Delete confirmation ---------------- */}
      <ConfirmDialog
        open={!!deleting}
        title="Delete task?"
        message={
          deleting
            ? `"${deleting.title}" will be deleted. You'll have a few seconds to undo.`
            : ""
        }
        confirmLabel="Delete"
        loading={deleteLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeleting(null)}
      />
    </div>
  );
}
