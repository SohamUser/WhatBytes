import { Task } from "@/types";
import { startOfLocalDay } from "@/utils/date";

export interface TaskSection {
  title: "Overdue" | "Today" | "Tomorrow" | "This week" | "Later";
  data: Task[];
}

function addLocalDays(date: Date, days: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
}

export function groupTasksByDueDate(tasks: Task[], now = new Date()): TaskSection[] {
  const today = startOfLocalDay(now);
  const tomorrow = addLocalDays(today, 1);
  const weekEnd = addLocalDays(today, 7);
  const groups: Record<TaskSection["title"], Task[]> = {
    Overdue: [],
    Today: [],
    Tomorrow: [],
    "This week": [],
    Later: [],
  };

  for (const task of tasks) {
    const dueDate = startOfLocalDay(task.dueDate);
    if (dueDate < today) groups.Overdue.push(task);
    else if (dueDate.getTime() === today.getTime()) groups.Today.push(task);
    else if (dueDate.getTime() === tomorrow.getTime()) groups.Tomorrow.push(task);
    else if (dueDate <= weekEnd) groups["This week"].push(task);
    else groups.Later.push(task);
  }

  return (Object.entries(groups) as Array<[TaskSection["title"], Task[]]>)
    .filter(([, data]) => data.length > 0)
    .map(([title, data]) => ({ title, data }));
}
