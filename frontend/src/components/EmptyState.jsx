import { motion } from "framer-motion";

export default function EmptyState({
  title,
  description,
  action,
  variant = "tasks",
}) {
  const illustrations = {
    tasks: (
      <svg viewBox="0 0 120 120" className="h-24 w-24">
        <defs>
          <linearGradient id="eg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="44" fill="url(#eg)" opacity="0.12" />
        <rect
          x="30"
          y="36"
          width="60"
          height="52"
          rx="8"
          fill="none"
          stroke="url(#eg)"
          strokeWidth="2.5"
        />
        <line
          x1="42"
          y1="52"
          x2="78"
          y2="52"
          stroke="url(#eg)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="42"
          y1="63"
          x2="70"
          y2="63"
          stroke="url(#eg)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <line
          x1="42"
          y1="74"
          x2="60"
          y2="74"
          stroke="url(#eg)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M86 24 L89 27 L94 21"
          fill="none"
          stroke="#6C63FF"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 120 120" className="h-24 w-24">
        <defs>
          <linearGradient id="sg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6C63FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="44" fill="url(#sg)" opacity="0.12" />
        <circle
          cx="55"
          cy="55"
          r="18"
          fill="none"
          stroke="url(#sg)"
          strokeWidth="2.5"
        />
        <line
          x1="68"
          y1="68"
          x2="82"
          y2="82"
          stroke="url(#sg)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    ),
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex flex-col items-center gap-3 px-6 py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      >
        {illustrations[variant] || illustrations.tasks}
      </motion.div>
      <h3 className="text-lg font-bold">{title}</h3>
      <p className="max-w-sm text-sm text-muted">{description}</p>
      {action}
    </motion.div>
  );
}
