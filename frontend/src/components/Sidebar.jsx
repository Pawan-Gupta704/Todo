import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  ListTodo,
  CalendarDays,
  CalendarClock,
  CheckCircle2,
  Calendar,
  FolderKanban,
  Settings,
  LogOut,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "../context/AuthContext";

const groups = [
  {
    title: "Overview",
    links: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/tasks", label: "My Tasks", icon: ListTodo },
      { to: "/calendar", label: "Calendar", icon: Calendar },
    ],
  },
  {
    title: "Focus",
    links: [
      { to: "/today", label: "Today", icon: CalendarDays },
      { to: "/upcoming", label: "Upcoming", icon: CalendarClock },
      { to: "/completed", label: "Completed", icon: CheckCircle2 },
    ],
  },
  {
    title: "Organize",
    links: [
      { to: "/categories", label: "Categories", icon: FolderKanban },
      { to: "/settings", label: "Settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ open, setOpen, collapsed, setCollapsed }) {
  const { logout } = useAuth();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-line bg-card transition-all duration-300 md:static md:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
        ${collapsed ? "md:w-[80px]" : "md:w-64"} w-72`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg shadow-primary/25">
              <Sparkles size={18} />
              <span className="absolute inset-0 rounded-xl ring-1 ring-white/20" />
            </span>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="text-base font-extrabold leading-none tracking-tight">
                  TaskFlow
                </span>
                <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                  Workspace
                </span>
              </div>
            )}
          </div>
          <button
            className="text-muted hover:text-txt md:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          {groups.map((group) => (
            <div key={group.title}>
              {!collapsed && (
                <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-wider text-muted/70">
                  {group.title}
                </p>
              )}
              <div className="space-y-0.5">
                {group.links.map(({ to, label, icon: Icon, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                       ${isActive ? "text-primary" : "text-muted hover:bg-bg hover:text-txt"}`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-xl bg-primary/10"
                            transition={{
                              type: "spring",
                              stiffness: 400,
                              damping: 30,
                            }}
                          />
                        )}
                        {isActive && (
                          <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
                        )}
                        <Icon size={19} className="relative shrink-0" />
                        {!collapsed && (
                          <span className="relative truncate">{label}</span>
                        )}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="space-y-1 border-t border-line p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-50 dark:hover:bg-red-500/10"
          >
            <LogOut size={19} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition hover:bg-bg hover:text-txt md:flex"
          >
            {collapsed ? <ChevronRight size={19} /> : <ChevronLeft size={19} />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
