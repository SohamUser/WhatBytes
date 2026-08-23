import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import {
  createTask as createTaskDocument,
  deleteTask as deleteTaskDocument,
  setTaskCompleted,
  subscribeToTasks,
  updateTask as updateTaskDocument,
} from "@/services/taskService";
import { Task, TaskInput } from "@/types";

interface TaskContextValue {
  tasks: Task[];
  isLoading: boolean;
  error: string | null;
  busyTaskIds: ReadonlySet<string>;
  retry: () => void;
  createTask: (input: TaskInput) => Promise<void>;
  updateTask: (taskId: string, input: TaskInput) => Promise<void>;
  toggleTask: (task: Task) => Promise<void>;
  removeTask: (taskId: string) => Promise<void>;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function TaskProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(user));
  const [error, setError] = useState<string | null>(null);
  const [retryToken, setRetryToken] = useState(0);
  const [busyTaskIds, setBusyTaskIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    if (!user) {
      setTasks([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    return subscribeToTasks(
      user.uid,
      (nextTasks) => {
        setTasks(nextTasks);
        setIsLoading(false);
      },
      () => {
        setError("We couldn't load your tasks. Check your connection and retry.");
        setIsLoading(false);
      },
    );
  }, [user, retryToken]);

  const retry = useCallback(() => setRetryToken((value) => value + 1), []);

  const createTask = useCallback(
    async (input: TaskInput) => {
      if (!user) throw new Error("You must be signed in to create a task.");
      try {
        await createTaskDocument(user.uid, input);
        showToast("Task created.", "success");
      } catch (mutationError) {
        showToast("Couldn't create the task. Please try again.", "error");
        throw mutationError;
      }
    },
    [user, showToast],
  );

  const updateTask = useCallback(
    async (taskId: string, input: TaskInput) => {
      try {
        await updateTaskDocument(taskId, input);
        showToast("Task updated.", "success");
      } catch (mutationError) {
        showToast("Couldn't update the task. Please try again.", "error");
        throw mutationError;
      }
    },
    [showToast],
  );

  const withBusyTask = useCallback(async (taskId: string, operation: () => Promise<void>) => {
    setBusyTaskIds((current) => new Set(current).add(taskId));
    try {
      await operation();
    } finally {
      setBusyTaskIds((current) => {
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    }
  }, []);

  const toggleTask = useCallback(
    async (task: Task) => {
      try {
        await withBusyTask(task.id, () => setTaskCompleted(task.id, !task.completed));
      } catch {
        showToast("Couldn't update the task. Please try again.", "error");
      }
    },
    [showToast, withBusyTask],
  );

  const removeTask = useCallback(
    async (taskId: string) => {
      try {
        await withBusyTask(taskId, () => deleteTaskDocument(taskId));
        showToast("Task deleted.", "success");
      } catch {
        showToast("Couldn't delete the task. Please try again.", "error");
      }
    },
    [showToast, withBusyTask],
  );

  const value = useMemo(
    () => ({
      tasks,
      isLoading,
      error,
      busyTaskIds,
      retry,
      createTask,
      updateTask,
      toggleTask,
      removeTask,
    }),
    [
      tasks,
      isLoading,
      error,
      busyTaskIds,
      retry,
      createTask,
      updateTask,
      toggleTask,
      removeTask,
    ],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within TaskProvider");
  return context;
}
