import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { Priority, Task, TaskInput } from "@/types";

import { db } from "./firebase";

interface FirestoreTask {
  title: string;
  description: string;
  dueDate: Timestamp;
  priority: Priority;
  completed: boolean;
  userId: string;
  createdAt?: Timestamp;
}

const tasksCollection = collection(db, "tasks");

export function subscribeToTasks(
  userId: string,
  onTasks: (tasks: Task[]) => void,
  onError: (error: Error) => void,
) {
  const userTasksQuery = query(tasksCollection, where("userId", "==", userId));

  return onSnapshot(
    userTasksQuery,
    (snapshot) => {
      const tasks = snapshot.docs.map((snapshotDoc) => {
        const data = snapshotDoc.data() as FirestoreTask;
        return {
          id: snapshotDoc.id,
          ...data,
          dueDate: data.dueDate.toDate(),
          createdAt: data.createdAt?.toDate() ?? null,
        } satisfies Task;
      });

      onTasks(sortTasks(tasks));
    },
    (error) => onError(error),
  );
}

export async function createTask(userId: string, input: TaskInput) {
  await addDoc(tasksCollection, {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: Timestamp.fromDate(input.dueDate),
    completed: false,
    userId,
    createdAt: serverTimestamp(),
  });
}

export async function updateTask(taskId: string, input: TaskInput) {
  await updateDoc(doc(tasksCollection, taskId), {
    ...input,
    title: input.title.trim(),
    description: input.description.trim(),
    dueDate: Timestamp.fromDate(input.dueDate),
  });
}

export async function setTaskCompleted(taskId: string, completed: boolean) {
  await updateDoc(doc(tasksCollection, taskId), { completed });
}

export async function deleteTask(taskId: string) {
  await deleteDoc(doc(tasksCollection, taskId));
}

export function sortTasks(tasks: Task[]): Task[] {
  return [...tasks].sort((left, right) => {
    const dueDateDifference = left.dueDate.getTime() - right.dueDate.getTime();
    if (dueDateDifference !== 0) return dueDateDifference;

    return (left.createdAt?.getTime() ?? 0) - (right.createdAt?.getTime() ?? 0);
  });
}
