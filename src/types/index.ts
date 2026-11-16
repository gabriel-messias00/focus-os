export type Priority = "high" | "medium" | "low";
export type Category = "work" | "study" | "personal" | "other";
export type TaskFilter = "all" | "pending" | "done";
export type TaskSort = "newest" | "oldest" | "priority" | "dueDate";

export interface Task {
  id: string;
  title: string;
  priority: Priority;
  category: Category;
  dueDate: string | null;
  done: boolean;
  createdAt: number;
  updatedAt?: number;
}


export interface FocusSession {
  id: string;
  completedAt: number;
  durationMinutes: number;
  completed: boolean;
  taskId?: string | null;
}
