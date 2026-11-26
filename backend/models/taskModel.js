const db = require("../config/db");

const SORT_MAP = {
  newest: "t.created_at DESC",
  oldest: "t.created_at ASC",
  dueDate: "t.due_date IS NULL, t.due_date ASC",
  priority: "FIELD(t.priority,'High','Medium','Low')",
  alphabetical: "t.title ASC",
};

// Reads: ALL tasks from ALL users, joined with creator info.
// Updates/toggles: no user scoping — anyone can work on any task.
// Delete: stays owner-only via controller check.
const getAll = async (filters = {}) => {
  const { search, status, priority, category, due, sort, owner } = filters;

  let sql = `
    SELECT t.*, u.name AS owner_name, u.email AS owner_email
    FROM tasks t
    JOIN users u ON u.id = t.user_id
    WHERE 1=1
  `;
  const params = [];

  if (search) {
    sql += " AND (t.title LIKE ? OR t.description LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }
  if (priority && ["High", "Medium", "Low"].includes(priority)) {
    sql += " AND t.priority = ?";
    params.push(priority);
  }
  if (category) {
    sql += " AND t.category = ?";
    params.push(category);
  }
  if (status === "completed") sql += " AND t.completed = 1";
  if (status === "pending") sql += " AND t.completed = 0";

  if (due === "today") sql += " AND t.due_date = CURDATE()";
  if (due === "upcoming")
    sql += " AND t.due_date > CURDATE() AND t.completed = 0";
  if (due === "overdue")
    sql += " AND t.due_date < CURDATE() AND t.completed = 0";

  // Optional: filter by creator (useful for "My Tasks" page later)
  if (owner === "me") {
    sql += " AND t.user_id = ?";
    params.push(filters._currentUserId);
  }

  sql += ` ORDER BY ${SORT_MAP[sort] || SORT_MAP.newest}`;

  const [rows] = await db.query(sql, params);
  return rows;
};

const getById = async (id) => {
  const [rows] = await db.query(
    `SELECT t.*, u.name AS owner_name, u.email AS owner_email
     FROM tasks t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`,
    [id],
  );
  return rows[0];
};

const create = async (userId, task) => {
  const {
    title,
    description = null,
    category = "Other",
    priority = "Medium",
    due_date = null,
  } = task;
  const [result] = await db.query(
    `INSERT INTO tasks (user_id, title, description, category, priority, due_date)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, title, description, category, priority, due_date],
  );
  return getById(result.insertId);
};

// No user check — anyone can edit any task
const update = async (id, task) => {
  const existing = await getById(id);
  if (!existing) return null;

  const {
    title = existing.title,
    description = existing.description,
    category = existing.category,
    priority = existing.priority,
    due_date = existing.due_date,
    completed = existing.completed,
  } = task;

  await db.query(
    `UPDATE tasks
     SET title = ?, description = ?, category = ?, priority = ?, due_date = ?, completed = ?
     WHERE id = ?`,
    [title, description, category, priority, due_date, completed ? 1 : 0, id],
  );
  return getById(id);
};

// No user check — anyone can toggle
const toggleComplete = async (id) => {
  const existing = await getById(id);
  if (!existing) return null;
  await db.query("UPDATE tasks SET completed = ? WHERE id = ?", [
    existing.completed ? 0 : 1,
    id,
  ]);
  return getById(id);
};

// OWNER-ONLY — but the ownership check happens in the controller
const remove = async (id) => {
  await db.query("DELETE FROM tasks WHERE id = ?", [id]);
  return true;
};

module.exports = { getAll, getById, create, update, toggleComplete, remove };
