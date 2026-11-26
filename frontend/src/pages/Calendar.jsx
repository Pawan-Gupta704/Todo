import { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
  ListChecks,
} from "lucide-react";
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
  const { tasks, addTask, toggleTask } = useTasks({});
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState("month");
  const [selected, setSelected] = useState(toISODate(new Date()));
  const [modalOpen, setModalOpen] = useState(false);

  /* ---------- Group tasks by due date ---------- */
  const byDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.due_date) return;
      const key = String(t.due_date).slice(0, 10);
      (map[key] = map[key] || []).push(t);
    });
    return map;
  }, [tasks]);

  /* ---------- Month grid (with leading blanks) ---------- */
  const monthCells = useMemo(() => {
    const y = cursor.getFullYear();
    const m = cursor.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells = Array(firstDay).fill(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(y, m, d));
    return cells;
  }, [cursor]);

  /* ---------- Week grid (Sun → Sat of cursor's week) ---------- */
  const weekDays = useMemo(() => {
    const start = new Date(cursor);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      return d;
    });
  }, [cursor]);

  /* ---------- Navigation ---------- */
  const shift = (dir) => {
    const d = new Date(cursor);
    if (view === "month") d.setMonth(d.getMonth() + dir);
    else d.setDate(d.getDate() + dir * 7);
    setCursor(d);
  };

  const goToday = () => {
    const now = new Date();
    setCursor(now);
    setSelected(toISODate(now));
  };

  /* ---------- Determine highest-priority unfinished task ---------- */
  const topPriorityOf = (dayTasks) => {
    if (dayTasks.some((t) => !t.completed && t.priority === "High"))
      return "High";
    if (dayTasks.some((t) => !t.completed && t.priority === "Medium"))
      return "Medium";
    if (dayTasks.some((t) => !t.completed && t.priority === "Low"))
      return "Low";
    return null;
  };

  /* ---------- Cell tint by priority ---------- */
  const tintFor = (priority) => {
    if (priority === "High") return "bg-red-50/70 dark:bg-red-500/[0.06]";
    if (priority === "Medium")
      return "bg-orange-50/70 dark:bg-orange-500/[0.06]";
    if (priority === "Low") return "bg-green-50/70 dark:bg-green-500/[0.06]";
    return "bg-card";
  };

  /* ---------- Pill style per priority ---------- */
  const pillStyle = (priority) => {
    if (priority === "High")
      return "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400";
    if (priority === "Medium")
      return "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400";
  };

  /* ---------- A single day cell ---------- */
  const DayCell = ({ date, tall = false }) => {
    // Placeholder must be same height as real cell → keeps rows aligned
    if (!date)
      return <div className={`${tall ? "min-h-[200px]" : "min-h-[96px]"}`} />;

    const iso = toISODate(date);
    const dayTasks = byDate[iso] || [];
    const isToday = iso === toISODate(new Date());
    const isSelected = iso === selected;
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const topPriority = topPriorityOf(dayTasks);
    const maxPills = tall ? 4 : 2;

    return (
      <button
        onClick={() => setSelected(iso)}
        className={`group relative flex flex-col rounded-lg border p-2 text-left transition-all
          ${
            isSelected
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : `border-line ${tintFor(topPriority)} hover:border-primary/40 hover:shadow-sm`
          }
          ${tall ? "min-h-[200px]" : "min-h-[96px]"}`}
      >
        <span
          className={`inline-grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-semibold
            ${
              isToday
                ? "bg-primary text-white shadow-sm"
                : isWeekend
                  ? "text-red-500"
                  : "text-txt group-hover:text-primary"
            }`}
        >
          {date.getDate()}
        </span>

        <div className="mt-1 w-full space-y-0.5 overflow-hidden">
          {dayTasks.slice(0, maxPills).map((t) => (
            <div
              key={t.id}
              className={`truncate rounded px-1 py-0.5 text-[10px] font-medium leading-tight
                ${t.completed ? "bg-bg text-muted line-through" : pillStyle(t.priority)}`}
            >
              {t.title}
            </div>
          ))}
          {dayTasks.length > maxPills && (
            <span className="block pl-1 text-[10px] font-semibold text-muted">
              +{dayTasks.length - maxPills} more
            </span>
          )}
        </div>
      </button>
    );
  };

  const selectedTasks = byDate[selected] || [];
  const selectedDateObj = new Date(`${selected}T00:00:00`);

  return (
    <div className="space-y-5">
      {/* ---------- Header ---------- */}
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
          <button
            onClick={goToday}
            className="btn-ghost !px-3 text-xs"
            title="Jump to today"
          >
            Today
          </button>

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

      {/* ---------- Calendar + side panel ---------- */}
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="card p-4 lg:col-span-2">
          {/* Weekday header */}
          <div className="mb-2 grid grid-cols-7 gap-2 text-center text-[11px] font-bold uppercase tracking-wider text-muted">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className={i === 0 || i === 6 ? "text-red-500" : ""}>
                {d}
              </div>
            ))}
          </div>

          {/* Cells */}
          <div className="grid grid-cols-7 gap-2">
            {view === "month"
              ? monthCells.map((d, i) => <DayCell key={i} date={d} />)
              : weekDays.map((d) => (
                  <DayCell key={d.toISOString()} date={d} tall />
                ))}
          </div>
        </div>

        {/* Side panel — tasks for selected day */}
        <div className="card flex flex-col p-4">
          <div className="flex items-center gap-2 border-b border-line pb-3">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
              <CalendarDays size={17} />
            </span>
            <div>
              <p className="text-xs text-muted">Selected day</p>
              <h2 className="text-sm font-bold">{formatDate(selected)}</h2>
            </div>
          </div>

          <div className="mt-3 flex-1 space-y-2 overflow-y-auto">
            {selectedTasks.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-12 text-center text-muted">
                <ListChecks size={26} />
                <p className="text-sm">No tasks on this date</p>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  + Add one
                </button>
              </div>
            ) : (
              selectedTasks.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-xl border border-line border-l-4 p-3 transition hover:bg-bg
                    ${
                      t.priority === "High"
                        ? "border-l-red-500"
                        : t.priority === "Medium"
                          ? "border-l-orange-500"
                          : "border-l-green-500"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm font-semibold leading-snug ${
                        t.completed ? "line-through text-muted" : ""
                      }`}
                    >
                      {t.title}
                    </p>
                    <span
                      className={`badge shrink-0 ${priorityStyles[t.priority]}`}
                    >
                      {t.priority}
                    </span>
                  </div>

                  {t.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted">
                      {t.description}
                    </p>
                  )}

                  <div className="mt-2 flex items-center justify-between">
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

          {/* Legend */}
          <div className="mt-3 border-t border-line pt-3">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">
              Priority
            </p>
            <div className="flex flex-wrap gap-3 text-[11px] text-muted">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500" /> High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-orange-500" /> Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-green-500" /> Low
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Add task modal — pre-fills selected date */}
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
