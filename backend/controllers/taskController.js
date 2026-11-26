const taskModel = require("../models/taskModel");

const CATEGORIES = ["Personal", "Education", "Work", "Shopping", "Other"];
const PRIORITIES = ["High", "Medium", "Low"];

const validateTaskPayload = (body, partial = false) => {
  const errors = [];
  if (!partial || body.title !== undefined) {
    if (!body.title || !String(body.title).trim())
      errors.push("Task title is required");
  }
  if (body.priority && !PRIORITIES.includes(body.priority)) {
    errors.push("Priority must be High, Medium or Low");
  }
  if (body.category && !CATEGORIES.includes(body.category)) {
    errors.push("Invalid category");
  }
  if (body.due_date && Number.isNaN(Date.parse(body.due_date))) {
    errors.push("Invalid due date");
  }
  return errors;
};

// POST /api/tasks — creator = authenticated user
const createTask = async (req, res, next) => {
  try {
    const errors = validateTaskPayload(req.body);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const task = await taskModel.create(req.user.id, req.body);
    res.status(201).json({ message: "Task created successfully", task });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks — ALL users' tasks
const getTasks = async (req, res, next) => {
  try {
    const filters = { ...req.query, _currentUserId: req.user.id };
    const tasks = await taskModel.getAll(filters);
    res.json({ count: tasks.length, tasks });
  } catch (err) {
    next(err);
  }
};

// GET /api/tasks/:id — any authenticated user
const getTaskById = async (req, res, next) => {
  try {
    const task = await taskModel.getById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ task });
  } catch (err) {
    next(err);
  }
};

// PUT /api/tasks/:id — anyone can edit
const updateTask = async (req, res, next) => {
  try {
    const errors = validateTaskPayload(req.body, true);
    if (errors.length) return res.status(400).json({ message: errors[0] });

    const task = await taskModel.update(req.params.id, req.body);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({ message: "Task updated successfully", task });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tasks/:id/complete — anyone can toggle
const toggleComplete = async (req, res, next) => {
  try {
    const task = await taskModel.toggleComplete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    res.json({
      message: task.completed
        ? "Task marked as completed"
        : "Task marked as pending",
      task,
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tasks/:id — ⛔ OWNER ONLY
const deleteTask = async (req, res, next) => {
  try {
    const task = await taskModel.getById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // THE KEY CHECK — only the creator can delete
    if (task.user_id !== req.user.id) {
      return res.status(403).json({
        message: `Only ${task.owner_name} (the task creator) can delete this task`,
      });
    }

    await taskModel.remove(req.params.id);
    res.json({ message: "Task deleted successfully" });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleComplete,
  deleteTask,
};
