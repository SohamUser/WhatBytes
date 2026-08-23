import type { PriorityFilter, Task, TaskStatusFilter } from "@/types";

interface TaskFilterOptions {
  priority: PriorityFilter;
  status: TaskStatusFilter;
}

export function filterAndSortTasks(
  tasks: readonly Task[],
  { priority, status }: TaskFilterOptions,
): Task[] {
  return tasks
    .filter((task) => {
      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesStatus =
        status === "all" || (status === "completed" ? task.completed : !task.completed);
      return matchesPriority && matchesStatus;
    })
    .sort((left, right) => {
      const dueDateDifference = left.dueDate.getTime() - right.dueDate.getTime();
      if (dueDateDifference !== 0) return dueDateDifference;

      const leftCreatedAt = left.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightCreatedAt = right.createdAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (leftCreatedAt !== rightCreatedAt) return leftCreatedAt - rightCreatedAt;
      return left.id.localeCompare(right.id);
    });
}
