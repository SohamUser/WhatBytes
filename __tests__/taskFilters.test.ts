import type { Task } from "@/types";
import { filterAndSortTasks } from "@/utils/taskFilters";

function task(
  id: string,
  dueDate: string,
  priority: Task["priority"],
  completed: boolean,
): Task {
  return {
    id,
    title: id,
    description: "",
    dueDate: new Date(dueDate),
    priority,
    completed,
    userId: "user-1",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
  };
}

const tasks = [
  task("later", "2026-08-30", "high", false),
  task("done", "2026-08-20", "low", true),
  task("earlier", "2026-08-21", "high", false),
  task("medium", "2026-08-22", "medium", false),
];

describe("filterAndSortTasks", () => {
  it("sorts matching tasks by due date from earliest to latest", () => {
    expect(filterAndSortTasks(tasks, { priority: "all", status: "all" }).map(({ id }) => id))
      .toEqual(["done", "earlier", "medium", "later"]);
  });

  it("filters by completion status", () => {
    expect(filterAndSortTasks(tasks, { priority: "all", status: "completed" }).map(({ id }) => id))
      .toEqual(["done"]);
    expect(filterAndSortTasks(tasks, { priority: "all", status: "incomplete" }).map(({ id }) => id))
      .toEqual(["earlier", "medium", "later"]);
  });

  it("combines priority and status filters", () => {
    expect(filterAndSortTasks(tasks, { priority: "high", status: "incomplete" }).map(({ id }) => id))
      .toEqual(["earlier", "later"]);
  });
});
