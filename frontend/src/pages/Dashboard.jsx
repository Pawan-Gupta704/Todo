import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  ListTodo,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
} from "lucide-react";
import useTasks from "../hooks/useTasks";
import StatCard from "../components/StatCard";
import TaskCard from "../components/TaskCard";
import TaskModal from "../components/TaskModal";
import { useAuth } from "../context/AuthContext";
import {
  formatDate,
  isOverdue,
  priorityStyles,
  toISODate,
} from "../utils/helpers";

export default function Dashboard() {
  const { user } = useAuth();
  const { tasks, loading, addTask, editTask, removeTask, toggleTask } =
    useTasks({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    return {
      total,
      completed,
      pending: total - completed,
      overdue: tasks.filter(isOverdue).length,
      rate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const pieData = [
    { name: "Completed", value: stats.completed },
    { name: "Pending", value: stats.pending },
  ];

  const weeklyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      days.push({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        created: tasks.filter((t) => String(t.created_at).slice(0, 10) === iso)
          .length,
      });
    }
    return days;
  }, [tasks]);

  const recent = useMemo(
    () =>
      [...tasks]
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 4),
    [tasks],
  );

  const upcoming = useMemo(
    () =>
      tasks
        .filter(
          (t) =>
            !t.completed &&
            t.due_date &&
            String(t.due_date).slice(0, 10) >= toISODate(new Date()),
        )
        .sort((a, b) => String(a.due_date).localeCompare(String(b.due_date)))
        .slice(0, 5),
    [tasks],
  );

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
    } catch {
      /* errors are already toasted by useTasks */
    }
  };

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-muted">
            {stats.pending > 0
              ? `You have ${stats.pending} task${stats.pending > 1 ? "s" : ""} left. Let's make today count.`
              : "All caught up. Great work!"}
          </p>
          <p className="mt-1 text-xs text-muted">{today}</p>
        </div>
        <button
          className="btn-primary"
          onClick={() => {
            setEditing(null);
            setModalOpen(true);
          }}
        >
          <Plus size={18} /> Add New Task
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={ListTodo}
          label="Total Tasks"
          value={stats.total}
          hint="All tasks in your workspace"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completed}
          hint="Tasks finished"
          tone="green"
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={stats.pending}
          hint="Tasks still in progress"
          tone="orange"
        />
        <StatCard
          icon={AlertTriangle}
          label="Overdue"
          value={stats.overdue}
          hint="Past due and unfinished"
          tone="red"
        />
      </div>

      {/* Analytics */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-5">
          <h2 className="text-sm font-bold">Completed vs Pending</h2>
          <div className="h-56">
            {stats.total === 0 ? (
              <p className="grid h-full place-items-center text-sm text-muted">
                No data yet
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    <Cell fill="#22c55e" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="card p-5 lg:col-span-2">
          <h2 className="text-sm font-bold">Weekly Task Activity</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--border)"
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted)"
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12 }}
                  stroke="var(--muted)"
                />
                <Tooltip />
                <Bar
                  dataKey="created"
                  fill="#6C63FF"
                  radius={[6, 6, 0, 0]}
                  name="Tasks created"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="card p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold">Productivity Progress</h2>
          <span className="text-sm font-bold text-primary">{stats.rate}%</span>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-bg">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
            style={{ width: `${stats.rate}%` }}
          />
        </div>
        <p className="mt-2 text-xs text-muted">
          {stats.completed} of {stats.total} tasks completed
        </p>
      </div>

      {/* Recent + Upcoming */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-bold">Recent Tasks</h2>
            <Link
              to="/tasks"
              className="text-xs font-semibold text-primary hover:underline"
            >
              View all
            </Link>
          </div>

          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="card h-36 animate-pulse p-4" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="card grid place-items-center px-6 py-12 text-center text-sm text-muted">
              No tasks yet — create your first one!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {recent.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onEdit={(t) => {
                    setEditing(t);
                    setModalOpen(true);
                  }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="mb-3 text-sm font-bold">Upcoming Deadlines</h2>
          <div className="card divide-y divide-line">
            {upcoming.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-muted">
                No upcoming deadlines
              </p>
            ) : (
              upcoming.map((t) => (
                <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                  <span
                    className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                      t.priority === "High"
                        ? "bg-red-500"
                        : t.priority === "Medium"
                          ? "bg-orange-500"
                          : "bg-green-500"
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{t.title}</p>
                    <p className="text-xs text-muted">
                      {formatDate(t.due_date)}
                    </p>
                  </div>
                  <span className={`badge ${priorityStyles[t.priority]}`}>
                    {t.priority}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        initialTask={editing}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
