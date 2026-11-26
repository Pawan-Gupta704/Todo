import { motion } from "framer-motion";
import { useEffect, useState } from "react";

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 600;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(value * eased));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value]);
  return <>{display}</>;
}

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}) {
  const tones = {
    primary: {
      box: "bg-tintIndigo dark:bg-primary/10",
      border: "border-indigo-200/60 dark:border-primary/20",
      accent: "from-[#6C63FF] to-[#3B82F6]",
      icon: "bg-white text-primary dark:bg-primary/20 dark:text-primary",
    },
    green: {
      box: "bg-tintMint dark:bg-green-500/10",
      border: "border-emerald-200/60 dark:border-green-500/20",
      accent: "from-emerald-400 to-green-500",
      icon: "bg-white text-emerald-600 dark:bg-green-500/20 dark:text-green-400",
    },
    orange: {
      box: "bg-tintPeach dark:bg-orange-500/10",
      border: "border-orange-200/60 dark:border-orange-500/20",
      accent: "from-amber-400 to-orange-500",
      icon: "bg-white text-orange-600 dark:bg-orange-500/20 dark:text-orange-400",
    },
    red: {
      box: "bg-tintRose dark:bg-red-500/10",
      border: "border-rose-200/60 dark:border-red-500/20",
      accent: "from-rose-400 to-red-500",
      icon: "bg-white text-rose-600 dark:bg-red-500/20 dark:text-red-400",
    },
  };
  const t = tones[tone] || tones.primary;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
      className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft transition-shadow hover:shadow-lift ${t.box} ${t.border}`}
    >
      {/* top accent bar */}
      <span
        className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${t.accent}`}
      />

      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            {label}
          </p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight">
            <AnimatedNumber value={value} />
          </p>
        </div>
        <span
          className={`grid h-11 w-11 place-items-center rounded-xl shadow-sm ${t.icon}`}
        >
          <Icon size={20} />
        </span>
      </div>
      <p className="relative mt-3 text-xs text-muted">{hint}</p>
    </motion.div>
  );
}
