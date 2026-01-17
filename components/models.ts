// models.ts

export interface Subject {
  id: string;
  name: string;
  color: string;
}

/* -------------------- Periods -------------------- */

export interface Period {
  id: string;
  name: string; // e.g. "Term 1", "Prelims", "HSC"
}

/* -------------------- Tasks -------------------- */

export interface TaskResult {
  score: number; // e.g. 78
  outOf: number; // e.g. 100
  dateRecorded: Date; // when the result was entered/received
  weighting?: number; // optional (%), future use
  notes?: string; // optional
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: Date;

  type: "task" | "assignment" | "exam" | "homework";

  // Optional grouping label (no dates/week logic)
  periodId?: string;

  // Optional mark/result (used by assignment/exam in UI)
  result?: TaskResult;

  completed?: boolean;
  completedAt?: Date;
}

/* -------------------- Study Sessions -------------------- */

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

/* -------------------- Utils -------------------- */

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
