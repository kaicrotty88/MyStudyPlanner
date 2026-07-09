"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { ThemeToggle } from "./ThemeToggle";
import { Marks } from "./marks";

import type {
  Reminder,
  Subject,
  Task,
  StudySession,
  Period,
  TimetableSettings,
  TimetableClass,
  TimetablePeriod,
  TimetableDayOfWeek,
  TimetableWeek,
} from "./models";

import { User, X, Lock, Sparkles } from "lucide-react";
import { UserButton, useSession, useUser, SignInButton } from "@clerk/nextjs";
import LoadingScreen from "@/components/LoadingScreen";

import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  fetchPlannerState,
  upsertPlannerState,
  clearPlannerState,
} from "@/lib/plannerStateSupabase";
import { fetchUserPlan } from "@/lib/profileSupabase";

import WhatsNewModal from "@/components/WhatsNewModal";

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000;

const WHATS_NEW_VERSION_KEY = "2026-02-21";
const WHATS_NEW_VERSION_LABEL = "Update";
const WHATS_NEW_UPDATES = [
  "Sync across devices for signed-in users.",
  "Added further colour options.",
  "You can now delete marks.",
  "Fixed onboarding / sync issues.",
  "Required fields now show a red asterisk for clarity.",
  "Calendar is now larger so items truncate less.",
  "Feedback: go to Settings → bottom email.",
];

type Tab =
  | "calendar"
  | "tasks"
  | "study"
  | "marks"
  | "settings";

type AppMode = "demo" | "app";
type Plan = "free" | "premium";
type SettingsOpenSection = "subjects" | "terms" | "timetable" | "backup" | "premium" | null;

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
  { id: "6", name: "Economics", color: "#7FA88F" },
  { id: "7", name: "Legal Studies", color: "#A88F7F" },
  { id: "8", name: "Business Studies", color: "#7F8FA8" },
  { id: "9", name: "Engineering", color: "#A87F93" },
];

const DEFAULT_TIMETABLE_SETTINGS: TimetableSettings = {
  mode: "school",
  cycle: "weekly",
  cycleStartDate: undefined,
};

const DEFAULT_SCHOOL_TIMETABLE_PERIODS: TimetablePeriod[] = [
  {
    id: "tp1",
    name: "Period 1",
    startTime: "08:40",
    endTime: "09:35",
    type: "class",
    order: 1,
  },
  {
    id: "tp2",
    name: "Period 2",
    startTime: "09:35",
    endTime: "10:30",
    type: "class",
    order: 2,
  },
  {
    id: "tp-recess",
    name: "Recess",
    startTime: "10:30",
    endTime: "10:50",
    type: "break",
    order: 3,
  },
  {
    id: "tp3",
    name: "Period 3",
    startTime: "10:50",
    endTime: "11:45",
    type: "class",
    order: 4,
  },
  {
    id: "tp4",
    name: "Period 4",
    startTime: "11:45",
    endTime: "12:40",
    type: "class",
    order: 5,
  },
  {
    id: "tp-lunch",
    name: "Lunch",
    startTime: "12:40",
    endTime: "13:20",
    type: "break",
    order: 6,
  },
  {
    id: "tp5",
    name: "Period 5",
    startTime: "13:20",
    endTime: "14:15",
    type: "class",
    order: 7,
  },
  {
    id: "tp6",
    name: "Period 6",
    startTime: "14:15",
    endTime: "15:10",
    type: "class",
    order: 8,
  },
];

const DEMO_PERIODS: Period[] = [
  {
    id: "p1",
    name: "Term 1",
    startDate: new Date(2026, 0, 29),
    endDate: new Date(2026, 3, 11),
  },
  {
    id: "p2",
    name: "Term 2",
    startDate: new Date(2026, 3, 28),
    endDate: new Date(2026, 6, 3),
  },
];

const DEMO_TIMETABLE_SETTINGS: TimetableSettings = {
  mode: "school",
  cycle: "fortnightly",
  cycleStartDate: new Date(2026, 0, 26),
};

type DemoTimetableSlot = {
  week: Exclude<TimetableWeek, "both">;
  dayOfWeek: TimetableDayOfWeek;
  periodId: string;
  subjectId: string;
  location: string;
  teacher: string;
};

const subjectNameById = (subjectId: string) =>
  defaultSubjects.find((subject) => subject.id === subjectId)?.name ?? "Class";

const makeDemoTimetableClasses = (): TimetableClass[] => {
  const createdAt = new Date(2026, 0, 26);

  const slots: DemoTimetableSlot[] = [
    // Week A — Monday
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp1",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp2",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp3",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp4",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp5",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "A",
      dayOfWeek: 1,
      periodId: "tp6",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },

    // Week A — Tuesday
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp1",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp2",
      subjectId: "7",
      location: "Room L2",
      teacher: "Ms Wright",
    },
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp3",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp4",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp5",
      subjectId: "5",
      location: "Room H1",
      teacher: "Mr Lewis",
    },
    {
      week: "A",
      dayOfWeek: 2,
      periodId: "tp6",
      subjectId: "9",
      location: "Workshop",
      teacher: "Mr Foster",
    },

    // Week A — Wednesday
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp1",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp2",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp3",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp4",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp5",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "A",
      dayOfWeek: 3,
      periodId: "tp6",
      subjectId: "7",
      location: "Room L2",
      teacher: "Ms Wright",
    },

    // Week A — Thursday
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp1",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp2",
      subjectId: "5",
      location: "Room H1",
      teacher: "Mr Lewis",
    },
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp3",
      subjectId: "9",
      location: "Workshop",
      teacher: "Mr Foster",
    },
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp4",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp5",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "A",
      dayOfWeek: 4,
      periodId: "tp6",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },

    // Week A — Friday
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp1",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp2",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp3",
      subjectId: "7",
      location: "Room L2",
      teacher: "Ms Wright",
    },
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp4",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp5",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "A",
      dayOfWeek: 5,
      periodId: "tp6",
      subjectId: "5",
      location: "Room H1",
      teacher: "Mr Lewis",
    },

    // Week B — Monday
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp1",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp2",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp3",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp4",
      subjectId: "7",
      location: "Room L2",
      teacher: "Ms Wright",
    },
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp5",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "B",
      dayOfWeek: 1,
      periodId: "tp6",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },

    // Week B — Tuesday
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp1",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp2",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp3",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp4",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp5",
      subjectId: "9",
      location: "Workshop",
      teacher: "Mr Foster",
    },
    {
      week: "B",
      dayOfWeek: 2,
      periodId: "tp6",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },

    // Week B — Wednesday
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp1",
      subjectId: "5",
      location: "Room H1",
      teacher: "Mr Lewis",
    },
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp2",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp3",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp4",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp5",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "B",
      dayOfWeek: 3,
      periodId: "tp6",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },

    // Week B — Thursday
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp1",
      subjectId: "7",
      location: "Room L2",
      teacher: "Ms Wright",
    },
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp2",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp3",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp4",
      subjectId: "5",
      location: "Room H1",
      teacher: "Mr Lewis",
    },
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp5",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
    {
      week: "B",
      dayOfWeek: 4,
      periodId: "tp6",
      subjectId: "9",
      location: "Workshop",
      teacher: "Mr Foster",
    },

    // Week B — Friday
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp1",
      subjectId: "2",
      location: "Lab 1",
      teacher: "Dr Harris",
    },
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp2",
      subjectId: "4",
      location: "Room E4",
      teacher: "Ms Taylor",
    },
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp3",
      subjectId: "3",
      location: "Lab 2",
      teacher: "Ms Chen",
    },
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp4",
      subjectId: "8",
      location: "Room B1",
      teacher: "Mrs Patel",
    },
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp5",
      subjectId: "6",
      location: "Room C3",
      teacher: "Mr O'Brien",
    },
    {
      week: "B",
      dayOfWeek: 5,
      periodId: "tp6",
      subjectId: "1",
      location: "Room M2",
      teacher: "Mr Anderson",
    },
  ];

  return slots.map((slot, index) => ({
    id: `demo-timetable-${index + 1}`,
    subjectId: slot.subjectId,
    title: subjectNameById(slot.subjectId),
    dayOfWeek: slot.dayOfWeek,
    periodId: slot.periodId,
    week: slot.week,
    location: slot.location,
    teacher: slot.teacher,
    createdAt,
  }));
};

const DEMO_TIMETABLE_CLASSES: TimetableClass[] = makeDemoTimetableClasses();

function debounce<T extends (...args: any[]) => void>(fn: T, delay = 600) {
  let timer: number | null = null;

  return (...args: Parameters<T>) => {
    if (timer !== null) window.clearTimeout(timer);

    timer = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return startOfDay(next);
};

const makeDemoData = () => {
  const now = new Date();

  const today = addDays(now, 0);
  const tomorrow = addDays(now, 1);
  const in2 = addDays(now, 2);
  const in3 = addDays(now, 3);
  const in5 = addDays(now, 5);
  const in7 = addDays(now, 7);
  const in10 = addDays(now, 10);
  const yesterday = addDays(now, -1);
  const twoDaysAgo = addDays(now, -2);
  const lastWeek = addDays(now, -7);
  const twoWeeksAgo = addDays(now, -14);
  const threeWeeksAgo = addDays(now, -21);
  const fourWeeksAgo = addDays(now, -28);
  const fiveWeeksAgo = addDays(now, -35);

  const tasks: Task[] = [
    {
      id: "t1",
      title: "Calculus worksheet",
      subjectId: "1",
      dueDate: in3,
      type: "homework",
      scheduledDate: today,
      startTime: "16:00",
      duration: "60 min",
      periodId: "p1",
      completed: false,
    },
    {
      id: "t2",
      title: "Practical report draft",
      subjectId: "3",
      dueDate: in7,
      type: "assignment",
      scheduledDate: tomorrow,
      startTime: "16:30",
      duration: "1h 30m",
      periodId: "p1",
      completed: false,
    },
    {
      id: "t3",
      title: "Motion topic test",
      subjectId: "2",
      dueDate: in10,
      type: "exam",
      scheduledDate: in10,
      startTime: "09:00",
      duration: "2h",
      periodId: "p1",
      completed: false,
    },
    {
      id: "t4",
      title: "English paragraph",
      subjectId: "4",
      dueDate: yesterday,
      type: "homework",
      scheduledDate: twoDaysAgo,
      startTime: "18:00",
      duration: "45 min",
      periodId: "p1",
      completed: false,
    },
    {
      id: "t5",
      title: "Maths quiz",
      subjectId: "1",
      dueDate: fiveWeeksAgo,
      type: "exam",
      scheduledDate: fiveWeeksAgo,
      startTime: "09:20",
      duration: "45 min",
      periodId: "p1",
      completed: true,
      completedAt: fiveWeeksAgo,
      result: {
        score: 18,
        outOf: 20,
        dateRecorded: fourWeeksAgo,
        weighting: 10,
        notes: "Strong calculus and algebra result.",
      },
    },
    {
      id: "t6",
      title: "Chemistry practical",
      subjectId: "3",
      dueDate: fourWeeksAgo,
      type: "assignment",
      scheduledDate: fourWeeksAgo,
      startTime: "11:45",
      duration: "1h",
      periodId: "p1",
      completed: true,
      completedAt: fourWeeksAgo,
      result: {
        score: 23,
        outOf: 25,
        dateRecorded: threeWeeksAgo,
        weighting: 15,
        notes: "Excellent method and conclusion.",
      },
    },
    {
      id: "t7",
      title: "English essay",
      subjectId: "4",
      dueDate: threeWeeksAgo,
      type: "assignment",
      scheduledDate: threeWeeksAgo,
      startTime: "14:15",
      duration: "1h",
      periodId: "p1",
      completed: true,
      completedAt: threeWeeksAgo,
      result: {
        score: 17,
        outOf: 20,
        dateRecorded: twoWeeksAgo,
        weighting: 20,
        notes: "Clear thesis and strong evidence.",
      },
    },
    {
      id: "t8",
      title: "Physics topic test",
      subjectId: "2",
      dueDate: twoWeeksAgo,
      type: "exam",
      scheduledDate: twoWeeksAgo,
      startTime: "10:50",
      duration: "55 min",
      periodId: "p1",
      completed: true,
      completedAt: twoWeeksAgo,
      result: {
        score: 41,
        outOf: 50,
        dateRecorded: lastWeek,
        weighting: 15,
        notes: "Good mechanics result. Revise projectile questions.",
      },
    },
    {
      id: "t9",
      title: "Economics essay",
      subjectId: "6",
      dueDate: lastWeek,
      type: "assignment",
      scheduledDate: lastWeek,
      startTime: "17:00",
      duration: "1h 30m",
      periodId: "p1",
      completed: true,
      completedAt: lastWeek,
      result: {
        score: 18,
        outOf: 20,
        dateRecorded: yesterday,
        weighting: 20,
        notes: "Strong use of budget examples and diagrams.",
      },
    },
    {
      id: "t10",
      title: "Legal Studies case notes",
      subjectId: "7",
      dueDate: in5,
      type: "homework",
      scheduledDate: in2,
      startTime: "17:30",
      duration: "45 min",
      periodId: "p1",
      completed: false,
    },
  ];

  const studySessions: StudySession[] = [
    {
      id: "s1",
      title: "Calculus practice",
      subjectId: "1",
      date: today,
      startTime: "17:00",
      duration: "60 min",
      linkedTaskId: "t1",
      completed: false,
    },
    {
      id: "s2",
      title: "Physics review",
      subjectId: "2",
      date: tomorrow,
      startTime: "18:00",
      duration: "45 min",
      linkedTaskId: "t3",
      completed: false,
    },
  ];

  tasks.push(
    {
      id: "personal-1",
      title: "Pack bag tonight",
      type: "personal",
      dueDate: today,
      scheduledDate: today,
      startTime: "20:30",
      duration: "15 min",
      notes: "Laptop charger, workbook, sport kit",
      repeat: "none",
      completed: false,
      createdAt: today,
    },
    {
      id: "personal-2",
      title: "Email teacher",
      type: "personal",
      dueDate: tomorrow,
      scheduledDate: tomorrow,
      startTime: "16:15",
      duration: "15 min",
      repeat: "none",
      completed: false,
      createdAt: today,
    }
  );

  return {
    subjects: defaultSubjects,
    periods: DEMO_PERIODS,
    tasks,
    studySessions,
    timetableSettings: DEMO_TIMETABLE_SETTINGS,
    timetablePeriods: DEFAULT_SCHOOL_TIMETABLE_PERIODS,
    timetableClasses: DEMO_TIMETABLE_CLASSES,
  };
};

const seedPeriodsStorage = (periods: Period[]) => {
  try {
    const stored = periods.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
    }));

    localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

const hydrateDate = (value: any, fallback = new Date()) => {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
};

const normaliseTaskType = (value: any): Task["type"] => {
  if (
    value === "assignment" ||
    value === "exam" ||
    value === "homework" ||
    value === "personal" ||
    value === "task"
  ) {
    return value;
  }

  return "homework";
};

const migrateReminderToPersonalTask = (reminder: any): Task => {
  const dueDate = reminder?.dueDate
    ? hydrateDate(reminder.dueDate)
    : reminder?.createdAt
      ? hydrateDate(reminder.createdAt)
      : new Date();

  const time = reminder?.time ? String(reminder.time) : "09:00";

  return {
    id: `reminder-${String(reminder?.id ?? Date.now())}`,
    title: String(reminder?.title ?? "Personal task"),
    type: "personal",
    dueDate,
    scheduledDate: dueDate,
    startTime: time,
    duration: "15 min",
    notes: reminder?.notes ? String(reminder.notes) : undefined,
    repeat:
      reminder?.repeat === "daily" || reminder?.repeat === "weekly"
        ? reminder.repeat
        : "none",
    completed: Boolean(reminder?.completed),
    completedAt: reminder?.completedAt ? hydrateDate(reminder.completedAt) : undefined,
    createdAt: reminder?.createdAt ? hydrateDate(reminder.createdAt) : undefined,
    source: "reminder-migration",
    migratedFromReminderId: String(reminder?.id ?? ""),
  };
};

function LockedPremiumView({
  feature,
  onGoToSettings,
}: {
  feature: "insights" | "marks";
  onGoToSettings: () => void;
}) {
  const title = feature === "insights" ? "Insights are Premium" : "Marks are Premium";
  const body =
    feature === "insights"
      ? "Upgrade to unlock deeper study analytics, trends, and progress insights."
      : "Upgrade to track assessment results, marks, and performance over time.";

  return (
    <div className="min-h-[calc(100vh-68px)] bg-background">
      <div className="mx-auto flex min-h-[calc(100vh-68px)] max-w-4xl items-center justify-center px-6 py-12">
        <div className="app-card w-full p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft">
              <Lock className="h-6 w-6 text-muted-foreground" />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">{body}</p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={onGoToSettings}
                className="app-btn-primary"
              >
                <Sparkles className="h-4 w-4" />
                View Premium
              </button>

              <button
                type="button"
                onClick={onGoToSettings}
                className="app-btn-secondary"
              >
                Go to Settings
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground">
              Upgrade from Settings to unlock this feature on your account. Demo mode stays open so visitors can test the full product.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App({ mode = "app" }: { mode?: AppMode }) {
  const hydrated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();

  const supabase = useMemo(() => {
    if (!session) return null;
    return getSupabaseClient(() => session.getToken() ?? Promise.resolve(null));
  }, [session]);

  const [activeTab, setActiveTab] = useState<Tab>("calendar");

  const [subjects, setSubjects] = useState<Subject[]>(
    mode === "demo" ? defaultSubjects : []
  );
  const [periods, setPeriods] = useState<Period[]>(
    mode === "demo" ? DEMO_PERIODS : []
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  // Legacy bridge only. Reminders are now migrated into Tasks as personal tasks.
  // This stays temporarily so older Calendar props do not break before Calendar is updated.
  const reminders: Reminder[] = [];

  const [timetableSettings, setTimetableSettings] = useState<TimetableSettings>(
    mode === "demo" ? DEMO_TIMETABLE_SETTINGS : DEFAULT_TIMETABLE_SETTINGS
  );
  const [timetablePeriods, setTimetablePeriods] = useState<TimetablePeriod[]>(
    DEFAULT_SCHOOL_TIMETABLE_PERIODS
  );
  const [timetableClasses, setTimetableClasses] = useState<TimetableClass[]>(
    mode === "demo" ? DEMO_TIMETABLE_CLASSES : []
  );

  const [settingsOpenSection, setSettingsOpenSection] =
    useState<SettingsOpenSection>(null);

  const [showMobileDesktopHint, setShowMobileDesktopHint] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [plan, setPlan] = useState<Plan>(mode === "demo" ? "premium" : "free");

  const storageKey = mode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  const hasPremium = plan === "premium";
  const isPremiumTab = (tab: Tab | string) => tab === "marks";
  const setupItems = [
    {
      id: "subjects",
      label: "Subjects",
      missing: subjects.length === 0,
      body: "Add subjects so tasks, marks, study sessions, and calendar items can use subject colours.",
    },
    {
      id: "terms",
      label: "Terms",
      missing: periods.length === 0,
      body: "Add term dates so tasks, marks, and assessments can be grouped properly.",
    },
    {
      id: "timetable",
      label: "Timetable",
      missing: timetableClasses.length === 0,
      body: "Add your timetable so Calendar can show classes and match homework due dates to lessons.",
    },
  ] as const;

  const missingSetupItems = setupItems.filter((item) => item.missing);
  const shouldShowSetupBanner =
    mode === "app" && activeTab !== "settings" && missingSetupItems.length > 0;

  const tabs = [
    { id: "calendar", label: "Calendar" },
    { id: "tasks", label: "Tasks" },
    { id: "study", label: "Study" },
    { id: "marks", label: "Marks" },
    { id: "settings", label: "Settings" },
  ] satisfies Array<{ id: Tab; label: string }>;

  const makeStateSnapshot = () => ({
    subjects,
    periods,
    tasks,
    studySessions,
    timetableSettings,
    timetablePeriods,
    timetableClasses,
  });

  const applyParsedState = (parsed: any) => {
    setSubjects(Array.isArray(parsed?.subjects) ? parsed.subjects : []);

    setPeriods(
      Array.isArray(parsed?.periods)
        ? parsed.periods.map((p: any) => ({
            id: String(p?.id ?? Date.now()),
            name: String(p?.name ?? "Term"),
            startDate: hydrateDate(p?.startDate),
            endDate: hydrateDate(p?.endDate),
          }))
        : []
    );

    const parsedTasks: Task[] = Array.isArray(parsed?.tasks)
      ? parsed.tasks.map((t: any) => ({
          ...t,
          id: String(t?.id ?? Date.now()),
          title: String(t?.title ?? ""),
          subjectId: t?.subjectId ? String(t.subjectId) : undefined,
          dueDate: hydrateDate(t?.dueDate),
          type: normaliseTaskType(t?.type),
          scheduledDate: t?.scheduledDate ? hydrateDate(t.scheduledDate) : undefined,
          completedAt: t?.completedAt ? hydrateDate(t.completedAt) : undefined,
          repeatUntil: t?.repeatUntil ? hydrateDate(t.repeatUntil) : undefined,
          notes: t?.notes ? String(t.notes) : undefined,
          source: t?.source === "reminder-migration" ? "reminder-migration" : t?.source === "manual" ? "manual" : undefined,
          migratedFromReminderId: t?.migratedFromReminderId
            ? String(t.migratedFromReminderId)
            : undefined,
          createdAt: t?.createdAt ? hydrateDate(t.createdAt) : undefined,
          result:
            t?.result && typeof t.result === "object"
              ? {
                  ...t.result,
                  score: Number(t.result.score ?? 0),
                  outOf: Number(t.result.outOf ?? 100) || 100,
                  dateRecorded: hydrateDate(t.result.dateRecorded),
                }
              : undefined,
        }))
      : [];

    const alreadyMigratedReminderIds = new Set(
      parsedTasks
        .map((task) => task.migratedFromReminderId)
        .filter((id): id is string => Boolean(id))
    );

    const migratedReminderTasks: Task[] = Array.isArray(parsed?.reminders)
      ? parsed.reminders
          .filter((reminder: any) => !alreadyMigratedReminderIds.has(String(reminder?.id ?? "")))
          .map(migrateReminderToPersonalTask)
      : [];

    setTasks([...parsedTasks, ...migratedReminderTasks]);

    setStudySessions(
      Array.isArray(parsed?.studySessions)
        ? parsed.studySessions.map((s: any) => ({
            ...s,
            id: String(s?.id ?? Date.now()),
            subjectId: String(s?.subjectId ?? ""),
            title: String(s?.title ?? "Study session"),
            date: hydrateDate(s?.date),
            startTime: String(s?.startTime ?? "16:00"),
            duration: String(s?.duration ?? "60 min"),
            completedAt: s?.completedAt ? hydrateDate(s.completedAt) : undefined,
          }))
        : []
    );



    const incomingSettings = parsed?.timetableSettings;

    setTimetableSettings({
      mode:
        incomingSettings?.mode === "school" ||
        incomingSettings?.mode === "university" ||
        incomingSettings?.mode === "custom"
          ? incomingSettings.mode
          : DEFAULT_TIMETABLE_SETTINGS.mode,
      cycle:
        incomingSettings?.cycle === "weekly" ||
        incomingSettings?.cycle === "fortnightly"
          ? incomingSettings.cycle
          : DEFAULT_TIMETABLE_SETTINGS.cycle,
      cycleStartDate: incomingSettings?.cycleStartDate
        ? hydrateDate(incomingSettings.cycleStartDate)
        : undefined,
    });

    setTimetablePeriods(
      Array.isArray(parsed?.timetablePeriods)
        ? parsed.timetablePeriods
            .map((p: any, index: number) => ({
              id: String(p?.id ?? `tp-${index + 1}`),
              name: String(p?.name ?? `Period ${index + 1}`),
              startTime: String(p?.startTime ?? "09:00"),
              endTime: String(p?.endTime ?? "10:00"),
              type: p?.type === "break" ? "break" : "class",
              order:
                typeof p?.order === "number"
                  ? p.order
                  : Number.isFinite(Number(p?.order))
                    ? Number(p.order)
                    : index + 1,
            }))
            .sort((a: TimetablePeriod, b: TimetablePeriod) => a.order - b.order)
        : DEFAULT_SCHOOL_TIMETABLE_PERIODS
    );

    setTimetableClasses(
      Array.isArray(parsed?.timetableClasses)
        ? parsed.timetableClasses.map((c: any) => ({
            id: String(c?.id ?? Date.now()),
            subjectId: c?.subjectId ? String(c.subjectId) : undefined,
            title: String(c?.title ?? "Class"),
            dayOfWeek:
              c?.dayOfWeek === 0 ||
              c?.dayOfWeek === 1 ||
              c?.dayOfWeek === 2 ||
              c?.dayOfWeek === 3 ||
              c?.dayOfWeek === 4 ||
              c?.dayOfWeek === 5 ||
              c?.dayOfWeek === 6
                ? c.dayOfWeek
                : 1,
            periodId: c?.periodId ? String(c.periodId) : undefined,
            startTime: c?.startTime ? String(c.startTime) : undefined,
            endTime: c?.endTime ? String(c.endTime) : undefined,
            week: c?.week === "A" || c?.week === "B" || c?.week === "both" ? c.week : "both",
            location: c?.location ? String(c.location) : undefined,
            teacher: c?.teacher ? String(c.teacher) : undefined,
            notes: c?.notes ? String(c.notes) : undefined,
            createdAt: c?.createdAt ? hydrateDate(c.createdAt) : undefined,
          }))
        : []
    );
  };

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("mystudyplanner-mobile-desktop-hint");
      if (!dismissed) setShowMobileDesktopHint(true);
    } catch {}
  }, []);

  useEffect(() => {
    if (mode === "demo") {
      setPlan("premium");
      return;
    }

    if (!userLoaded) return;

    if (!isSignedIn || !supabase || !user?.id) {
      setPlan("free");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const nextPlan = await fetchUserPlan(supabase, user.id);
        if (!cancelled) setPlan(nextPlan);
      } catch (error) {
        console.error("Failed to fetch user plan:", error);
        if (!cancelled) setPlan("free");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, userLoaded, isSignedIn, supabase, user?.id]);

  useEffect(() => {
    let cancelled = false;

    const finishLoading = () => {
      if (cancelled) return;

      hydrated.current = true;
      setIsReady(true);

      try {
        const seen = localStorage.getItem("mystudyplanner-whats-new-version");
        if (seen !== WHATS_NEW_VERSION_KEY) setShowWhatsNew(true);
      } catch {}
    };

    const loadLocalFallback = () => {
      try {
        const rawLocal = localStorage.getItem(storageKey);
        if (!rawLocal) return false;

        const parsedLocal = JSON.parse(rawLocal);
        applyParsedState(parsedLocal);
        return true;
      } catch {
        return false;
      }
    };

    if (mode === "demo") {
      const demo = makeDemoData();

      setSubjects(demo.subjects);
      setPeriods(demo.periods);
      setTasks(demo.tasks);
      setStudySessions(demo.studySessions);
      setTimetableSettings(demo.timetableSettings);
      setTimetablePeriods(demo.timetablePeriods);
      setTimetableClasses(demo.timetableClasses);
      seedPeriodsStorage(demo.periods);

      finishLoading();
      return () => {
        cancelled = true;
      };
    }

    if (!userLoaded) {
      return () => {
        cancelled = true;
      };
    }

    if (!isSignedIn || !supabase) {
      loadLocalFallback();
      finishLoading();
      return () => {
        cancelled = true;
      };
    }

    (async () => {
      try {
        const remote = await fetchPlannerState(supabase);

        if (cancelled) return;

        const remoteHasPlannerData =
          !!remote &&
          (Array.isArray((remote as any).tasks) ||
            Array.isArray((remote as any).subjects) ||
            Array.isArray((remote as any).periods) ||
            Array.isArray((remote as any).studySessions) ||
            Array.isArray((remote as any).reminders) ||
            Array.isArray((remote as any).timetablePeriods) ||
            Array.isArray((remote as any).timetableClasses) ||
            Boolean((remote as any).timetableSettings));

        if (remoteHasPlannerData) {
          applyParsedState(remote);

          try {
            localStorage.setItem(storageKey, JSON.stringify(remote));
          } catch {}

          finishLoading();
          return;
        }

        const localLoaded = loadLocalFallback();

        if (localLoaded) {
          const snapshotFromLocal = JSON.parse(localStorage.getItem(storageKey) || "{}");
          await upsertPlannerState(supabase, snapshotFromLocal);
        } else {
          setSubjects([]);
          setPeriods([]);
          setTasks([]);
          setStudySessions([]);
          setTimetableSettings(DEFAULT_TIMETABLE_SETTINGS);
          setTimetablePeriods(DEFAULT_SCHOOL_TIMETABLE_PERIODS);
          setTimetableClasses([]);
        }

        finishLoading();
      } catch (error) {
        console.error("Failed to init planner state:", error);

        if (cancelled) return;

        loadLocalFallback();
        finishLoading();
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, userLoaded, isSignedIn, supabase, storageKey]);

  const saveRemoteDebounced = useMemo(
    () =>
      debounce(async (snapshot: Record<string, unknown>) => {
        if (!supabase) return;
        await upsertPlannerState(supabase, snapshot);
      }, 700),
    [supabase]
  );

  useEffect(() => {
    if (!hydrated.current) return;
    if (mode === "demo") return;

    const snapshot = makeStateSnapshot();

    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch {}

    if (mode === "app" && Boolean(isSignedIn) && supabase && isReady) {
      saveRemoteDebounced(snapshot);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    subjects,
    periods,
    tasks,
    studySessions,
    timetableSettings,
    timetablePeriods,
    timetableClasses,
    storageKey,
    mode,
    isSignedIn,
    supabase,
    saveRemoteDebounced,
    isReady,
  ]);

  useEffect(() => {
    const completedCutoff = Date.now() - AUTO_DELETE_COMPLETED_AFTER_MS;

    setTasks((prev) =>
      prev.filter((task) => {
        if (task.result) return true;
        if (!task.completed || !task.completedAt) return true;
        return task.completedAt.getTime() >= completedCutoff;
      })
    );

    setStudySessions((prev) =>
      prev.filter((session) => {
        if (!session.completed || !session.completedAt) return true;
        return session.completedAt.getTime() >= completedCutoff;
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks.length, studySessions.length]);

  const dismissMobileDesktopHint = () => {
    setShowMobileDesktopHint(false);

    try {
      localStorage.setItem("mystudyplanner-mobile-desktop-hint", "1");
    } catch {}
  };

  const markWhatsNewSeen = () => {
    setShowWhatsNew(false);

    try {
      localStorage.setItem("mystudyplanner-whats-new-version", WHATS_NEW_VERSION_KEY);
    } catch {}
  };

  const openSettingsSection = (section: SettingsOpenSection) => {
    setActiveTab("settings");
    setSettingsOpenSection(section);
  };

  const handleClearAllData = async () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(PERIODS_STORAGE_KEY);
    } catch {}

    if (mode === "demo") {
      const demo = makeDemoData();

      setSubjects(demo.subjects);
      setPeriods(demo.periods);
      setTasks(demo.tasks);
      setStudySessions(demo.studySessions);
      setTimetableSettings(demo.timetableSettings);
      setTimetablePeriods(demo.timetablePeriods);
      setTimetableClasses(demo.timetableClasses);
      seedPeriodsStorage(demo.periods);
      setActiveTab("calendar");
      return;
    }

    setSubjects([]);
    setPeriods([]);
    setTasks([]);
    setStudySessions([]);
    setTimetableSettings(DEFAULT_TIMETABLE_SETTINGS);
    setTimetablePeriods(DEFAULT_SCHOOL_TIMETABLE_PERIODS);
    setTimetableClasses([]);
    setActiveTab("calendar");

    if (Boolean(isSignedIn) && supabase) {
      try {
        await clearPlannerState(supabase);
      } catch (error) {
        console.error("Failed to clear remote planner state:", error);
      }
    }
  };

  const handleAddSubject = (name: string, color: string) =>
    setSubjects((prev) => [...prev, { id: Date.now().toString(), name, color }]);

  const handleUpdateSubject = (id: string, name: string, color: string) =>
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === id ? { ...subject, name, color } : subject))
    );

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((subject) => subject.id !== id));
    setTasks((prev) => prev.filter((task) => task.subjectId !== id));
    setStudySessions((prev) => prev.filter((session) => session.subjectId !== id));
    setTimetableClasses((prev) => prev.filter((item) => item.subjectId !== id));
  };

  const handleAddTask = (task: Omit<Task, "id">) =>
    setTasks((prev) => [...prev, { ...task, id: Date.now().toString() }]);

  const handleUpdateTask = (id: string, task: Omit<Task, "id">) =>
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...task, id } : item)));

  const handleDeleteTask = (id: string) =>
    setTasks((prev) => prev.filter((task) => task.id !== id));

  const toggleTaskCompleted = (id: string) =>
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== id) return task;

        const nextCompleted = !task.completed;

        return {
          ...task,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );

  const handleAddStudySession = (session: Omit<StudySession, "id">) =>
    setStudySessions((prev) => [
      ...prev,
      {
        ...session,
        id: Date.now().toString(),
      },
    ]);

  const handleUpdateStudySession = (id: string, session: Omit<StudySession, "id">) =>
    setStudySessions((prev) =>
      prev.map((item) => (item.id === id ? { ...session, id } : item))
    );

  const handleDeleteStudySession = (id: string) =>
    setStudySessions((prev) => prev.filter((session) => session.id !== id));

  const handleToggleSessionCompleted = (id: string) =>
    setStudySessions((prev) =>
      prev.map((session) => {
        if (session.id !== id) return session;

        const nextCompleted = !session.completed;

        return {
          ...session,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );


  const handleUpdatePeriods = (nextPeriods: Period[]) => {
    const sorted = [...nextPeriods].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    setPeriods(sorted);
    seedPeriodsStorage(sorted);
  };

  const handleUpdateTimetableSettings = (settings: TimetableSettings) => {
    setTimetableSettings(settings);
  };

  const handleUpdateTimetablePeriods = (nextPeriods: TimetablePeriod[]) => {
    setTimetablePeriods([...nextPeriods].sort((a, b) => a.order - b.order));
  };

  const handleAddTimetableClass = (timetableClass: Omit<TimetableClass, "id">) => {
    setTimetableClasses((prev) => [
      ...prev,
      {
        ...timetableClass,
        id: Date.now().toString(),
        createdAt: timetableClass.createdAt ?? new Date(),
      },
    ]);
  };

  const handleUpdateTimetableClass = (
    id: string,
    timetableClass: Omit<TimetableClass, "id">
  ) => {
    setTimetableClasses((prev) =>
      prev.map((item) => (item.id === id ? { ...timetableClass, id } : item))
    );
  };

  const handleDeleteTimetableClass = (id: string) => {
    setTimetableClasses((prev) => prev.filter((item) => item.id !== id));
  };

  const openTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  if (!isReady) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <WhatsNewModal
        open={mode === "app" && Boolean(isSignedIn) && showWhatsNew}
        onClose={markWhatsNewSeen}
        versionLabel={WHATS_NEW_VERSION_LABEL}
        updates={WHATS_NEW_UPDATES}
      />

      <nav className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href={mode === "demo" ? "/preview" : "/app"}
            className="flex items-center gap-3"
          >
            <div className="leading-tight">
              <div className="text-base font-semibold tracking-tight text-foreground">MyStudyPlanner</div>
              <div className="text-[11px] text-muted-foreground">
                {mode === "demo" ? "Sample data preview" : "Calendar workspace"}
              </div>
            </div>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {tabs.map((tab) => {
              const locked = mode === "app" && isPremiumTab(tab.id) && !hasPremium;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => openTab(tab.id)}
                  className={[
                    "app-nav-tab",
                    activeTab === tab.id ? "app-nav-tab-active" : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {tab.label}
                    {locked ? <Lock className="h-3.5 w-3.5" /> : null}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            {mode === "demo" ? (
              <span className="app-pill hidden sm:inline-flex">
                Preview Mode
              </span>
            ) : null}

            <ThemeToggle />

            {mode === "demo" ? (
              <Link
                href="/sign-up"
                className="app-btn-primary hidden sm:inline-flex"
              >
                Create account
              </Link>
            ) : isSignedIn ? (
              <UserButton afterSignOutUrl="/" />
            ) : (
              <div className="hidden items-center gap-2 sm:flex">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="app-btn-secondary"
                  >
                    Sign in
                  </button>
                </SignInButton>

                <Link
                  href="/sign-up"
                  className="app-btn-primary"
                >
                  Create account
                </Link>
              </div>
            )}

            <div className="lg:hidden">
              <button
                type="button"
                onClick={() => setActiveTab("calendar")}
                className="app-iconbtn h-10 w-10 border border-border bg-card"
                aria-label="Open dashboard"
              >
                <User className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-card px-3 py-2 lg:hidden">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => {
              const locked = mode === "app" && isPremiumTab(tab.id) && !hasPremium;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => openTab(tab.id)}
                  className={[
                    "app-nav-tab shrink-0",
                    activeTab === tab.id ? "app-nav-tab-active" : "",
                  ].join(" ")}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {tab.label}
                    {locked ? <Lock className="h-3.5 w-3.5" /> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {mode === "app" && !isSignedIn ? (
          <div className="border-t border-border bg-muted/30 px-4 py-2 sm:hidden">
            <div className="flex items-center justify-between gap-3">
              <div className="text-xs text-muted-foreground">
                Sign in to save and sync your planner.
              </div>

              <div className="flex items-center gap-2">
                <Link
                  href="/sign-in"
                  className="app-btn-ghost h-9 px-3"
                >
                  Sign in
                </Link>

                <Link
                  href="/sign-up"
                  className="app-btn-primary h-9 px-3"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      {showMobileDesktopHint ? (
        <div className="app-banner md:hidden">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
            <div className="text-[12px] leading-5 text-muted-foreground">
              Best on desktop. Mobile is great for quick check-ins.
            </div>

            <button
              onClick={dismissMobileDesktopHint}
              className="app-iconbtn shrink-0"
              aria-label="Dismiss"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ) : null}

      {shouldShowSetupBanner ? (
        <div className="app-banner">
          <div className="app-banner-inner">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                Finish setting up MyStudyPlanner
              </div>
              <div className="text-xs leading-5 text-muted-foreground">
                {missingSetupItems.map((item) => item.label).join(", ")} still need setup.
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {missingSetupItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openSettingsSection(item.id)}
                  className="app-btn-secondary h-9 px-3"
                  title={item.body}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      <main>
        {activeTab === "calendar" ? (
          <Calendar
            studySessions={studySessions}
            tasks={tasks}
            subjects={subjects}
            timetableSettings={timetableSettings}
            timetablePeriods={timetablePeriods}
            timetableClasses={timetableClasses}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskCompleted={toggleTaskCompleted}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
            onToggleStudySessionCompleted={handleToggleSessionCompleted}
          />
        ) : null}

        {activeTab === "tasks" ? (
          <Tasks
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompleted={toggleTaskCompleted}
          />
        ) : null}

        {activeTab === "study" ? (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
            onToggleSessionCompleted={handleToggleSessionCompleted}
            hasPremium={hasPremium}
            onGoToSettings={() => setActiveTab("settings")}
          />
        ) : null}

        {activeTab === "marks" ? (
          hasPremium ? (
            <Marks
              tasks={tasks}
              subjects={subjects}
              onUpdateTask={handleUpdateTask}
            />
          ) : (
            <LockedPremiumView
              feature="marks"
              onGoToSettings={() => openSettingsSection("premium")}
            />
          )
        ) : null}

        {activeTab === "settings" ? (
          <Settings
            appMode={mode}
            subjects={subjects}
            periods={periods}
            tasks={tasks}
            studyItems={[]}
            studySessions={studySessions}
            plan={plan}
            timetableSettings={timetableSettings}
            timetablePeriods={timetablePeriods}
            timetableClasses={timetableClasses}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onUpdatePeriods={handleUpdatePeriods}
            onUpdateTimetableSettings={handleUpdateTimetableSettings}
            onUpdateTimetablePeriods={handleUpdateTimetablePeriods}
            onAddTimetableClass={handleAddTimetableClass}
            onUpdateTimetableClass={handleUpdateTimetableClass}
            onDeleteTimetableClass={handleDeleteTimetableClass}
            onClearAllData={handleClearAllData}
            openSection={settingsOpenSection}
            onOpenSectionHandled={() => setSettingsOpenSection(null)}
          />
        ) : null}
      </main>
    </div>
  );
}