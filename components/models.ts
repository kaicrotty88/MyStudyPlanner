// models.ts

export interface Subject {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: Date;
  type: "task" | "assignment" | "exam" | "homework";
  completed?: boolean;
  completedAt?: Date;
}

export interface StudySession {
  id: string;
  subjectId: string;
  title?: string; // UI falls back to "Study session"
  date: Date;
  startTime: string;
  duration: string;
  linkedTaskId?: string;
  completed?: boolean;
  completedAt?: Date;
}

/* -------------------- Marks -------------------- */

export interface Mark {
  id: string;
  subjectId: string;

  title: string; // e.g. "Midyear Exam", "Essay 1"
  score: number; // e.g. 78
  outOf: number; // e.g. 100

  date: Date; // when the mark was received or recorded

  weighting?: number; // optional, e.g. 20 (%), future use
  notes?: string; // optional short note
}

/* -------------------- Utils -------------------- */

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
