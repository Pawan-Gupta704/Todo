import {
  Sun,
  Moon,
  User,
  Mail,
  CalendarDays,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { formatDate } from "../utils/helpers";

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your profile and preferences
        </p>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold">Profile</h2>
        <div className="mt-4 flex items-center gap-4">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-primary to-secondary text-lg font-bold text-white">
            {(user?.name || "U").charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-muted">{user?.email}</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <User size={17} className="text-muted" />
            <div>
              <p className="text-xs text-muted">Full name</p>
              <p className="text-sm font-medium">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <Mail size={17} className="text-muted" />
            <div className="min-w-0">
              <p className="text-xs text-muted">Email</p>
              <p className="truncate text-sm font-medium">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <CalendarDays size={17} className="text-muted" />
            <div>
              <p className="text-xs text-muted">Member since</p>
              <p className="text-sm font-medium">
                {formatDate(user?.created_at || new Date())}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-line p-3">
            <ShieldCheck size={17} className="text-green-500" />
            <div>
              <p className="text-xs text-muted">Security</p>
              <p className="text-sm font-medium">JWT + Bcrypt secured</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold">Appearance</h2>
        <div className="mt-4 flex items-center justify-between rounded-xl border border-line p-4">
          <div className="flex items-center gap-3">
            {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
            <div>
              <p className="text-sm font-medium">
                {theme === "dark" ? "Dark mode" : "Light mode"}
              </p>
              <p className="text-xs text-muted">
                Your preference is saved automatically
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-7 w-12 rounded-full transition ${
              theme === "dark" ? "bg-primary" : "bg-line"
            }`}
            aria-label="Toggle theme"
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${
                theme === "dark" ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-sm font-bold">Session</h2>
        <button onClick={logout} className="btn-ghost mt-4 !text-red-500">
          <LogOut size={17} /> Logout of your account
        </button>
      </div>
    </div>
  );
}
