// models.ts

export interface Subject {
  id: string;
  name: string;
  color: string;
}

/* -------------------- Periods (Terms) -------------------- */

/**
 * In-app Period model (dates as Date objects).
 * Used for comparisons like: startDate <= task.dueDate <= endDate
 */
export interface Period {
  id: string;
  name: string; // e.g. "Term 1", "Term 2", "Prelims", "HSC"
  startDate: Date;
  endDate: Date;
}

/**
 * LocalStorage-safe Period shape (dates as ISO strings).
 * JSON can't store Date objects, so we persist as strings and parse on load.
 */
export interface PeriodStored {
  id: string;
  name: string;
  startDate: string; // ISO string
  endDate: string; // ISO string
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

  // Term grouping (auto-assigned based on dueDate once Terms exist)
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

/* -------------------- Reminders -------------------- */

/**
 * A lightweight, general reminder (not tied to a subject).
 * Optional date + time; can also be "floating" (no date) for sticky reminders.
 */
export interface Reminder {
  id: string;
  title: string;
  notes?: string;

  // If omitted, reminder is a "sticky" note-style reminder.
  dueDate?: Date;

  // Optional time label for the UI (stored as "HH:MM" 24h)
  time?: string;

  repeat?: "none" | "daily" | "weekly";

  completed?: boolean;
  completedAt?: Date;

  createdAt?: Date;
}

/**
 * LocalStorage-safe Reminder shape (dates as ISO strings).
 */
export interface ReminderStored {
  id: string;
  title: string;
  notes?: string;

  dueDate?: string; // ISO
  time?: string;

  repeat?: "none" | "daily" | "weekly";

  completed?: boolean;
  completedAt?: string; // ISO
  createdAt?: string; // ISO
}

/* -------------------- Utils -------------------- */

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();
