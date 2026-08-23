export type Priority = "low" | "medium" | "high";

export type TaskStatusFilter = "all" | "completed" | "incomplete";
export type PriorityFilter = "all" | Priority;

export interface User {
  uid: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
  completed: boolean;
  userId: string;
  createdAt: Date | null;
}

export interface TaskInput {
  title: string;
  description: string;
  dueDate: Date;
  priority: Priority;
}

export type AuthFieldErrors = Partial<
  Record<"email" | "password" | "confirmPassword" | "form", string>
>;
