import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import * as taskService from "../services/taskService";

export default function useTasks(filters = {}) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const key = useMemo(() => JSON.stringify(filters), [filters]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await taskService.fetchTasks(JSON.parse(key));
      setTasks(data.tasks || []);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [key]);

  useEffect(() => {
    load();
  }, [load]);

  const addTask = async (payload) => {
    await taskService.createTask(payload);
    toast.success("Task created successfully");
    await load();
  };

  const editTask = async (id, payload) => {
    await taskService.updateTask(id, payload);
    toast.success("Task updated successfully");
    await load();
  };

  // Delete can throw a 403 — let the caller decide how to show it
  const removeTask = async (id) => {
    try {
      await taskService.deleteTask(id);
      toast.success("Task deleted successfully");
      await load();
    } catch (err) {
      const message = err.response?.data?.message || "Failed to delete task";
      toast.error(message, { duration: 4000 });
      throw err; // re-throw so callers can react
    }
  };

  const toggleTask = async (id) => {
    const { data } = await taskService.toggleTask(id);
    toast.success(data.message);
    await load();
  };

  return {
    tasks,
    loading,
    refresh: load,
    addTask,
    editTask,
    removeTask,
    toggleTask,
  };
}
