export const toISODate = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
};

export const formatDate = (value) => {
  if (!value) return "No due date";
  const d = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const isOverdue = (task) =>
  Boolean(task.due_date) &&
  !task.completed &&
  String(task.due_date).slice(0, 10) < toISODate(new Date());

export const priorityStyles = {
  High: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400",
  Medium:
    "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400",
  Low: "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400",
};

export const priorityDot = {
  High: "bg-red-500",
  Medium: "bg-orange-500",
  Low: "bg-green-500",
};

export const CATEGORIES = [
  "Personal",
  "Education",
  "Work",
  "Shopping",
  "Other",
];
export const PRIORITIES = ["High", "Medium", "Low"];
