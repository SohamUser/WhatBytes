export function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function normalizeDueDate(date: Date): Date {
  return startOfLocalDay(date);
}

export function isTaskOverdue(dueDate: Date, completed: boolean): boolean {
  return !completed && startOfLocalDay(dueDate) < startOfLocalDay(new Date());
}

export function formatDueDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
