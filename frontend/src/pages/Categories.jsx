import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Briefcase,
  GraduationCap,
  Home,
  ShoppingCart,
  Layers,
  ArrowRight,
} from "lucide-react";
import useTasks from "../hooks/useTasks";

const META = {
  Personal: {
    icon: Home,
    box: "bg-tintPink  border-pink-200/60   dark:bg-pink-500/10   dark:border-pink-500/20",
    iconBox: "bg-white text-pink-600   dark:bg-pink-500/20 dark:text-pink-400",
  },
  Education: {
    icon: GraduationCap,
    box: "bg-tintSky   border-sky-200/60    dark:bg-sky-500/10    dark:border-sky-500/20",
    iconBox: "bg-white text-sky-600    dark:bg-sky-500/20 dark:text-sky-400",
  },
  Work: {
    icon: Briefcase,
    box: "bg-tintIndigo border-indigo-200/60 dark:bg-primary/10   dark:border-primary/20",
    iconBox: "bg-white text-primary   dark:bg-primary/20 dark:text-primary",
  },
  Shopping: {
    icon: ShoppingCart,
    box: "bg-tintAmber border-amber-200/60  dark:bg-amber-500/10  dark:border-amber-500/20",
    iconBox:
      "bg-white text-amber-600  dark:bg-amber-500/20 dark:text-amber-400",
  },
  Other: {
    icon: Layers,
    box: "bg-tintSlate border-slate-200/60  dark:bg-slate-500/10  dark:border-slate-500/20",
    iconBox:
      "bg-white text-slate-600  dark:bg-slate-500/20 dark:text-slate-300",
  },
};

export default function Categories() {
  const { tasks, loading } = useTasks({});
  const navigate = useNavigate();

  const grouped = useMemo(() => {
    return Object.keys(META).map((key) => {
      const list = tasks.filter((t) => t.category === key);
      return {
        key,
        total: list.length,
        completed: list.filter((t) => t.completed).length,
        pending: list.filter((t) => !t.completed).length,
      };
    });
  }, [tasks]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Categories</h1>
        <p className="mt-1 text-sm text-muted">Browse your tasks by category</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {grouped.map(({ key, total, completed, pending }) => {
          const { icon: Icon, box, iconBox } = META[key];
          return (
            <button
              key={key}
              onClick={() =>
                navigate(`/tasks?category=${encodeURIComponent(key)}`)
              }
              className={`group relative overflow-hidden rounded-2xl border p-5 text-left shadow-soft transition hover:-translate-y-1 hover:shadow-lift ${box}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl shadow-sm ${iconBox}`}
                >
                  <Icon size={20} />
                </span>
                <ArrowRight
                  size={18}
                  className="text-muted transition group-hover:translate-x-1 group-hover:text-primary"
                />
              </div>

              <h3 className="mt-4 text-base font-bold">{key}</h3>
              <p className="text-xs text-muted">
                {loading
                  ? "Loading…"
                  : `${total} task${total === 1 ? "" : "s"}`}
              </p>

              <div className="mt-3 flex gap-2">
                <span className="badge bg-white/70 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
                  {completed} done
                </span>
                <span className="badge bg-white/70 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400">
                  {pending} pending
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
