import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Menu,
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  User,
  Settings,
  Command,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import NotificationPanel from "./NotificationPanel";
import { fetchTasks } from "../services/taskService";
import { isOverdue, toISODate } from "../utils/helpers";

export default function Navbar({ onMenuClick, onOpenPalette }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setNotifOpen(false);
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await fetchTasks();
        const list = data.tasks || [];
        const today = toISODate(new Date());
        const items = [
          ...list
            .filter(isOverdue)
            .slice(0, 3)
            .map((t) => ({
              id: `o${t.id}`,
              title: "Overdue task",
              text: t.title,
              tone: "danger",
            })),
          ...list
            .filter(
              (t) =>
                !t.completed &&
                t.due_date &&
                String(t.due_date).slice(0, 10) === today,
            )
            .slice(0, 3)
            .map((t) => ({
              id: `t${t.id}`,
              title: "Due today",
              text: t.title,
              tone: "warning",
            })),
        ];
        if (!cancelled) setNotifications(items);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="glass sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line/60 px-4 md:px-6">
      <button
        onClick={onMenuClick}
        className="rounded-lg p-2 text-muted hover:bg-bg hover:text-txt md:hidden"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <button
        onClick={onOpenPalette}
        className="group hidden flex-1 max-w-md items-center gap-2 rounded-xl border border-line bg-bg/60 px-3 py-2 text-sm text-muted transition hover:border-primary/40 hover:bg-bg sm:flex"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Search tasks…</span>
        <kbd className="flex items-center gap-1 rounded-md border border-line bg-card px-1.5 py-0.5 text-[10px] font-semibold">
          <Command size={10} /> K
        </kbd>
      </button>

      <div ref={wrapRef} className="ml-auto flex items-center gap-1.5">
        <button
          onClick={toggleTheme}
          className="rounded-xl p-2.5 text-muted transition hover:bg-bg hover:text-txt"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={19} /> : <Moon size={19} />}
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setNotifOpen((o) => !o);
              setMenuOpen(false);
            }}
            className="relative rounded-xl p-2.5 text-muted transition hover:bg-bg hover:text-txt"
            aria-label="Notifications"
          >
            <Bell size={19} />
            {notifications.length > 0 && (
              <>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                <span className="absolute right-2 top-2 h-2 w-2 animate-ping rounded-full bg-red-500" />
              </>
            )}
          </button>
          <NotificationPanel open={notifOpen} items={notifications} />
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setMenuOpen((o) => !o);
              setNotifOpen(false);
            }}
            className="flex items-center gap-2 rounded-xl p-1.5 pr-2 transition hover:bg-bg"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-secondary text-xs font-bold text-white ring-2 ring-card">
              {initials}
            </span>
            <span className="hidden text-sm font-semibold sm:block">
              {user?.name?.split(" ")[0]}
            </span>
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-line bg-card shadow-xl">
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-semibold">{user?.name}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-bg"
              >
                <Settings size={16} /> Settings
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/settings");
                }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm hover:bg-bg"
              >
                <User size={16} /> Profile
              </button>
              <button
                onClick={logout}
                className="flex w-full items-center gap-2 border-t border-line px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
