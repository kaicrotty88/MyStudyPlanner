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

/* -------------------- Timetable -------------------- */

export type TimetableMode = "school" | "university" | "custom";

export type TimetableCycle = "weekly" | "fortnightly";

export type TimetableWeek = "A" | "B" | "both";

export type TimetableDayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type TimetablePeriodType = "class" | "break";

/**
 * Main timetable settings.
 *
 * school:
 * - best for high school / fixed daily periods.
 * - uses TimetablePeriod + grid cells.
 *
 * university/custom:
 * - best for lectures, tutorials, labs, work, sport, etc.
 * - can use direct startTime/endTime classes.
 *
 * weekly:
 * - same timetable every week.
 *
 * fortnightly:
 * - Week A / Week B cycle.
 * - cycleStartDate should be the Monday of Week A.
 */
export interface TimetableSettings {
  mode: TimetableMode;
  cycle: TimetableCycle;
  cycleStartDate?: Date;
}

/**
 * LocalStorage-safe TimetableSettings shape.
 */
export interface TimetableSettingsStored {
  mode: TimetableMode;
  cycle: TimetableCycle;
  cycleStartDate?: string; // ISO
}

/**
 * A reusable period row for school timetable grids.
 *
 * Example:
 * - Period 1: 08:40–09:35
 * - Period 2: 09:35–10:30
 * - Recess: 10:30–10:50
 * - Lunch: 12:40–13:20
 *
 * Break periods are shown in the grid setup but do not need subject classes.
 */
export interface TimetablePeriod {
  id: string;
  name: string;
  startTime: string; // "HH:MM" 24h
  endTime: string; // "HH:MM" 24h
  type: TimetablePeriodType;
  order: number;
}

/**
 * LocalStorage-safe TimetablePeriod shape.
 */
export interface TimetablePeriodStored {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  type: TimetablePeriodType;
  order: number;
}

/**
 * A recurring class / lesson / lecture / tutorial / lab.
 *
 * Works for:
 * - school timetable grid cells
 * - uni lectures/tutorials/labs
 * - custom repeating timetable items
 *
 * School grid classes should usually use:
 * - periodId
 *
 * Uni/custom classes should usually use:
 * - startTime
 * - endTime
 *
 * Month view should usually hide these to avoid clutter.
 * Week/day view should display them in the hourly grid.
 */
export interface TimetableClass {
  id: string;

  /**
   * Optional subject link.
   * Most class items should have this, but it is optional so users can add
   * things like Assembly, Chapel, Sport, Free Period, Work, etc.
   */
  subjectId?: string;

  /**
   * Display title.
   * Examples:
   * - "Maths"
   * - "English"
   * - "Economics Tutorial"
   * - "Chemistry Lab"
   * - "Free Period"
   */
  title: string;

  dayOfWeek: TimetableDayOfWeek; // 0 Sun, 1 Mon, 2 Tue, etc.

  /**
   * For school timetable grid classes.
   * If periodId exists, Calendar can get start/end time from TimetablePeriod.
   */
  periodId?: string;

  /**
   * For university/custom classes.
   * Also used as fallback if periodId is missing.
   */
  startTime?: string; // "HH:MM" 24h
  endTime?: string; // "HH:MM" 24h

  /**
   * For weekly timetables, this can just be "both".
   * For fortnightly timetables:
   * - "A" = Week A only
   * - "B" = Week B only
   * - "both" = every week
   */
  week: TimetableWeek;

  location?: string; // room, building, campus, field, etc.
  teacher?: string; // teacher, tutor, lecturer, coach, etc.

  notes?: string;

  /** Where this editable timetable entry originally came from. */
  source?: "manual" | "google" | "ics";
  sourceLabel?: string;

  createdAt?: Date;
}

/**
 * LocalStorage-safe TimetableClass shape.
 */
export interface TimetableClassStored {
  id: string;
  subjectId?: string;
  title: string;

  dayOfWeek: TimetableDayOfWeek;

  periodId?: string;

  startTime?: string;
  endTime?: string;

  week: TimetableWeek;

  location?: string;
  teacher?: string;

  notes?: string;

  source?: "manual" | "google" | "ics";
  sourceLabel?: string;

  createdAt?: string; // ISO
}

/* -------------------- Tasks / Assessments / Personal items -------------------- */

export type TaskType = "task" | "assignment" | "exam" | "homework" | "personal";

export type TaskSource = "manual" | "reminder-migration";

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

  /**
   * Optional subject link.
   *
   * School/uni tasks usually have this:
   * - homework
   * - assignments
   * - exams
   *
   * Personal tasks usually do not:
   * - pack bag
   * - buy pens
   * - email someone
   */
  subjectId?: string;

  /**
   * Deadline date.
   *
   * For school tasks:
   * - dueDate = when it is due.
   * - scheduledDate/startTime/duration = when the student plans to do it.
   *
   * For personal tasks:
   * - dueDate = when it should happen / be completed.
   * - scheduledDate/startTime/duration = when it appears on the calendar.
   *
   * Timetable logic should only try to match class due times when subjectId exists.
   */
  dueDate: Date;

  /**
   * "task" is kept only for old saved data.
   * New UI should create:
   * - homework
   * - assignment
   * - exam
   * - personal
   */
  type: TaskType;

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
  duration?: string; // e.g. "15 min", "30 min", "1h", "1h 30m"

  /**
   * Term grouping.
   * Auto-assigned based on dueDate once Terms exist.
   * Usually only applies to school/uni tasks.
   */
  periodId?: string;

  /**
   * Optional mark/result.
   * Mostly used by assignments/exams.
   */
  result?: TaskResult;

  /**
   * General notes for any task.
   * Used to preserve old Reminder.notes during migration.
   */
  notes?: string;

  completed?: boolean;
  completedAt?: Date;

  repeat?: "none" | "daily" | "weekly";
  repeatUntil?: Date;

  /**
   * Helps migration logic avoid converting the same old reminder repeatedly.
   */
  source?: TaskSource;
  migratedFromReminderId?: string;

  createdAt?: Date;
}

/**
 * LocalStorage-safe Task shape.
 */
export interface TaskStored {
  id: string;
  title: string;
  subjectId?: string;

  dueDate: string; // ISO
  type: TaskType;

  scheduledDate?: string; // ISO
  startTime?: string;
  duration?: string;

  periodId?: string;

  result?: {
    score: number;
    outOf: number;
    dateRecorded: string; // ISO
    weighting?: number;
    notes?: string;
  };

  notes?: string;

  completed?: boolean;
  completedAt?: string; // ISO

  repeat?: "none" | "daily" | "weekly";
  repeatUntil?: string; // ISO

  source?: TaskSource;
  migratedFromReminderId?: string;

  createdAt?: string; // ISO
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

/* -------------------- Legacy Reminders -------------------- */

/**
 * Legacy calendar reminder.
 *
 * Reminders are being merged into Task as personal/non-subject tasks.
 * Keep this type temporarily so old saved data can be loaded and migrated
 * in App.tsx without losing anything.
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
 * LocalStorage-safe legacy Reminder shape.
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


export type ImportedCalendarSource = "google" | "ics";
export type ImportedCalendarKind = "class" | "event";

export interface ImportedCalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  location?: string;
  description?: string;
  source: ImportedCalendarSource;
  externalId: string;
  externalCalendarId?: string;
  calendarName?: string;
  importedAt: Date;
  updatedAt?: Date;
  kind?: ImportedCalendarKind;
  subjectId?: string;
  subjectName?: string;
  color?: string;
  recurring?: boolean;
  autoClassified?: boolean;
}

/* -------------------- Calendar Events -------------------- */

/**
 * General calendar events.
 * Future use: excursions, sport, tutoring, school events.
 *
 * Timetable classes should use TimetableClass instead.
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