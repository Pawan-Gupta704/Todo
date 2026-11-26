import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import useTasks from "../hooks/useTasks";
import TaskModal from "../components/TaskModal";
import {
  formatDate,
  priorityDot,
  priorityStyles,
  toISODate,
} from "../utils/helpers";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar() {
  const { tasks, addTask, editTask, toggleTask } = useTasks({});
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(toISODate(new Date()));
  const [modalOpen, setModalOpen] = useState(false);

  const byDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const key = String(t.due_date).slice(0, 10);
      (map[key] = map[key] || []).push(t);
    });
    return map;
  }, [tasks]);

  const monthCells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [cursor]);

  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  const shift = (dir) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCursor(d);
  };

  const DayCell = ({ date, tall = false }) => {
    if (!date)
      return <div className="min-h-[76px] rounded-xl bg-transparent" />;
    const iso = toISODate(date);
    const dayTasks = byDate[iso] || [];
    const isToday = iso === toISODate(new Date());
    const isSelected = iso === selected;

    return (
      <button
        onClick={() => setSelected(iso)}
        className={`min-h-[76px] rounded-xl border p-2 text-left transition
        ${
          isToday
            ? "border-primary bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90"
            : isSelected
              ? "border-primary bg-primary/5"
              : "border-line bg-card hover:border-primary/50 hover:bg-primary/5"
        }
        ${tall ? "min-h-[120px]" : ""}`}
      >
        <span
          className={`inline-grid h-6 w-6 place-items-center rounded-full text-xs font-bold
          ${isToday ? "bg-white text-primary" : "text-txt"}`}
        >
          {date.getDate()}
        </span>
        <div className="mt-1 flex flex-wrap gap-1">
          {dayTasks.slice(0, 3).map((t) => (
            <span
              key={t.id}
              className={`h-1.5 w-1.5 rounded-full ${isToday ? "bg-white/80" : priorityDot[t.priority]}`}
            />
          ))}
          {dayTasks.length > 3 && (
            <span
              className={`text-[10px] ${isToday ? "text-white/80" : "text-muted"}`}
            >
              +{dayTasks.length - 3}
            </span>
          )}
        </div>
      </button>
    );
  };
  const selectedTasks = byDate[selected] || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-muted">
            {cursor.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex rounded-xl border border-line bg-card p-1">
            {["month", "week"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  view === v
                    ? "bg-primary text-white"
                    : "text-muted hover:text-txt"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <button
            className="btn-ghost !px-2.5"
            onClick={() => shift(-1)}
            aria-label="Previous"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            className="btn-ghost !px-2.5"
            onClick={() => shift(1)}
            aria-label="Next"
          >
            <ChevronRight size={18} />
          </button>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Add Task
          </button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-semibold text-muted">
            {WEEKDAYS.map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {view === "month"
              ? monthCells.map((d, i) => <DayCell key={i} date={d} />)
              : weekDays.map((d) => (
                  <DayCell key={d.toISOString()} date={d} tall />
                ))}
          </div>
        </div>

        <div className="card p-4">
          <h2 className="text-sm font-bold">{formatDate(selected)}</h2>
          <div className="mt-3 space-y-2">
            {selectedTasks.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                No tasks on this date
              </p>
            ) : (
              selectedTasks.map((t) => (
                <div key={t.id} className="rounded-xl border border-line p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold ${t.completed ? "line-through text-muted" : ""}`}
                    >
                      {t.title}
                    </p>
                    <span className={`badge ${priorityStyles[t.priority]}`}>
                      {t.priority}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="badge bg-secondary/10 text-secondary">
                      {t.category}
                    </span>
                    <button
                      onClick={() => toggleTask(t.id)}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      {t.completed ? "Mark pending" : "Complete"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <TaskModal
        open={modalOpen}
        defaultDate={selected}
        onClose={() => setModalOpen(false)}
        onSubmit={async (payload) => {
          await addTask(payload);
          setModalOpen(false);
        }}
      />
    </div>
  );
}
