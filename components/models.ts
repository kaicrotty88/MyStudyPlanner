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

/* -------------------- Tasks / Assessments -------------------- */

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

  /**
   * Deadline date.
   *
   * For homework/assignments:
   * - dueDate = when it is due.
   * - scheduledDate/startTime/duration = when the student plans to do it.
   *
   * Future timetable logic can use:
   * - subjectId
   * - dueDate
   * to infer the actual class/period where the homework is due.
   */
  dueDate: Date;

  /**
   * "task" is kept only for old saved data.
   * New UI should create only: homework, assignment, exam.
   */
  type: "task" | "assignment" | "exam" | "homework";

  /**
   * Optional scheduled calendar block.
   *
   * In Calendar UI, these should be required for homework/assignment/exam
   * created from Calendar.
   *
   * They stay optional in the model so old saved data does not break.
   */
  scheduledDate?: Date;
  startTime?: string; // "HH:MM" 24h preferred
  duration?: string; // e.g. "30 min", "1h", "1h 30m"

  /**
   * Term grouping.
   * Auto-assigned based on dueDate once Terms exist.
   */
  periodId?: string;

  /**
   * Optional mark/result.
   * Mostly used by assignments/exams.
   */
  result?: TaskResult;

  completed?: boolean;
  completedAt?: Date;

  repeat?: "none" | "daily" | "weekly";
  repeatUntil?: Date;
}

/* -------------------- Study Sessions -------------------- */

export interface StudySession {
  id: string;
  subjectId: string;
  title?: string; // UI falls back to "Study session"
  date: Date;
  startTime: string; // "HH:MM" 24h preferred
  duration: string; // e.g. "60 min", "1h 30m"
  linkedTaskId?: string;
  completed?: boolean;
  completedAt?: Date;
}

/* -------------------- Reminders -------------------- */

/**
 * Calendar reminder.
 *
 * Reminders are instant/timed markers, not duration blocks.
 * They should appear at a specific time in Calendar.
 *
 * New reminders should always have:
 * - dueDate
 * - time
 *
 * These are kept technically optional only so old saved reminders without
 * date/time can still load and be normalised in App.tsx.
 */
export interface Reminder {
  id: string;
  title: string;
  notes?: string;

  dueDate?: Date;
  time?: string; // "HH:MM" 24h

  repeat?: "none" | "daily" | "weekly";

  completed?: boolean;
  completedAt?: Date;

  createdAt?: Date;
}

/**
 * LocalStorage-safe Reminder shape.
 */
export interface ReminderStored {
  id: string;
  title: string;
  notes?: string;

  dueDate?: string; // ISO
  time?: string; // "HH:MM" 24h

  repeat?: "none" | "daily" | "weekly";

  completed?: boolean;
  completedAt?: string; // ISO
  createdAt?: string; // ISO
}

/* -------------------- Calendar Events -------------------- */

/**
 * General calendar events.
 * Future use: classes, school periods, excursions, sport, tutoring.
 */
export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  time?: string;

  repeat?: "none" | "daily" | "weekly";
  repeatUntil?: Date;
}

/**
 * LocalStorage-safe CalendarEvent shape.
 */
export interface CalendarEventStored {
  id: string;
  title: string;
  date: string; // ISO
  time?: string;

  repeat?: "none" | "daily" | "weekly";
  repeatUntil?: string; // ISO
}

/* -------------------- Utils -------------------- */

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();