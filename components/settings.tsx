"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Trash,
  ChevronDown,
  BookOpen,
  CalendarRange,
  Clock3,
  CalendarDays,
  Database,
  Sparkles,
  LifeBuoy,
} from "lucide-react";
import { CalendarImports } from "./calendar/CalendarImports";

import type {
  Subject,
  Task,
  StudySession,
  TimetableClass,
  TimetableCycle,
  TimetableDayOfWeek,
  TimetableMode,
  TimetablePeriod,
  TimetablePeriodType,
  TimetableSettings,
  TimetableWeek,
  ImportedCalendarEvent,
} from "./models";

interface StudyItem {
  id: string;
  subjectId: string;
  topic: string;
  date: Date;
  linkedTaskId?: string;
  notes?: string;
  showOnCalendar: boolean;
}

type AppMode = "demo" | "app";
type Plan = "free" | "premium";

type Period = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

type PeriodStored = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type SettingsOpenSection = "subjects" | "terms" | "timetable" | "backup" | "premium";

type ManualTimetableForm = {
  title: string;
  subjectId: string;
  dayOfWeek: TimetableDayOfWeek;
  startTime: string;
  endTime: string;
  week: TimetableWeek;
  location: string;
  teacher: string;
};

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

interface SettingsProps {
  subjects: Subject[];
  periods: Period[];
  tasks: Task[];
  studyItems: StudyItem[];
  studySessions: StudySession[];

  timetableSettings: TimetableSettings;
  timetablePeriods: TimetablePeriod[];
  timetableClasses: TimetableClass[];

  onUpdateTimetableSettings: (settings: TimetableSettings) => void;
  onUpdateTimetablePeriods: (periods: TimetablePeriod[]) => void;
  onAddTimetableClass: (timetableClass: Omit<TimetableClass, "id">) => void;
  onUpdateTimetableClass: (
    id: string,
    timetableClass: Omit<TimetableClass, "id">
  ) => void;
  onDeleteTimetableClass: (id: string) => void;

  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;

  onUpdatePeriods: (periods: Period[]) => void;

  appMode: AppMode;
  plan?: Plan;
  onClearAllData: () => void;
  importedCalendarEvents?: ImportedCalendarEvent[];
  onImportCalendarEvents?: (events: ImportedCalendarEvent[]) => void;
  onRemoveImportedCalendarSource?: (source: "google" | "ics") => void;
  openSection?: SettingsOpenSection | null;
  onOpenSectionHandled?: () => void;
}

const SUBJECT_COLOR_PALETTE = [
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#7C3AED",
  "#EA580C",
  "#0EA5E9",
  "#DB2777",
  "#CA8A04",
  "#059669",
  "#9333EA",
  "#4F46E5",
  "#B91C1C",
  "#15803D",
  "#A21CAF",
  "#C2410C",
  "#0284C7",
  "#BE185D",
  "#A16207",
  "#047857",
  "#6D28D9",
  "#1D4ED8",
  "#991B1B",
  "#166534",
  "#86198F",
  "#9A3412",
  "#0369A1",
  "#9D174D",
  "#854D0E",
  "#065F46",
  "#5B21B6",
];

const SCHOOL_DAYS: Array<{ value: TimetableDayOfWeek; label: string; short: string }> = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
];

const ALL_DAYS: Array<{ value: TimetableDayOfWeek; label: string; short: string }> = [
  { value: 1, label: "Monday", short: "Mon" },
  { value: 2, label: "Tuesday", short: "Tue" },
  { value: 3, label: "Wednesday", short: "Wed" },
  { value: 4, label: "Thursday", short: "Thu" },
  { value: 5, label: "Friday", short: "Fri" },
  { value: 6, label: "Saturday", short: "Sat" },
  { value: 0, label: "Sunday", short: "Sun" },
];

type BackupV1 = {
  version: 1;
  exportedAt: string;
  appMode: AppMode;
  data: any;
  periods?: PeriodStored[];
};

function toISODateInputValue(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [y, m, d] = value.split("-").map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function safeUUID() {
  const c = globalThis as typeof globalThis & {
    crypto?: { randomUUID?: () => string };
  };

  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();
  return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function normalizeHex(hex: string) {
  return String(hex || "").trim().toLowerCase();
}

function pickNextColor(usedColors: string[]) {
  const used = new Set(usedColors.map(normalizeHex));
  const next = SUBJECT_COLOR_PALETTE.find((c) => !used.has(normalizeHex(c)));
  return next ?? SUBJECT_COLOR_PALETTE[usedColors.length % SUBJECT_COLOR_PALETTE.length];
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function downloadJson(filename: string, obj: unknown) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function formatTimetableTime(time?: string) {
  if (!time) return "";

  const [hhRaw, mmRaw] = time.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);

  if (Number.isNaN(hh) || Number.isNaN(mm)) return time;

  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

function sortPeriods(periods: TimetablePeriod[]) {
  return [...periods].sort((a, b) => a.order - b.order);
}

export function Settings({
  subjects,
  periods: appPeriods,
  tasks,
  studyItems,
  studySessions,
  timetableSettings,
  timetablePeriods,
  timetableClasses,
  onUpdateTimetableSettings,
  onUpdateTimetablePeriods,
  onAddTimetableClass,
  onUpdateTimetableClass,
  onDeleteTimetableClass,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onUpdatePeriods,
  appMode,
  plan = "free",
  onClearAllData,
  importedCalendarEvents = [],
  onImportCalendarEvents = () => {},
  onRemoveImportedCalendarSource = () => {},
  openSection,
  onOpenSectionHandled,
}: SettingsProps) {
  const storageKey = appMode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  const [subjectsOpen, setSubjectsOpen] = useState(false);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [timetableOpen, setTimetableOpen] = useState(false);
  const [backupOpen, setBackupOpen] = useState(false);
  const [premiumOpen, setPremiumOpen] = useState(false);

  const [showAddSubjectForm, setShowAddSubjectForm] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);
  const [subjectForm, setSubjectForm] = useState({
    name: "",
    color: pickNextColor([]),
  });

  const [periods, setPeriods] = useState<Period[]>(appPeriods);
  const [showAddPeriodForm, setShowAddPeriodForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);
  const [periodFormError, setPeriodFormError] = useState("");
  const [periodForm, setPeriodForm] = useState({
    name: "",
    startDate: toISODateInputValue(new Date()),
    endDate: toISODateInputValue(new Date()),
  });

  const [activeTimetableWeek, setActiveTimetableWeek] = useState<"A" | "B">("A");
  const [showPeriodEditor, setShowPeriodEditor] = useState(false);
  const [periodDrafts, setPeriodDrafts] = useState<TimetablePeriod[]>([]);
  const [periodEditorError, setPeriodEditorError] = useState("");

  const [showManualClassForm, setShowManualClassForm] = useState(false);
  const [editingManualClassId, setEditingManualClassId] = useState<string | null>(null);
  const [deletingTimetableClassId, setDeletingTimetableClassId] = useState<string | null>(null);
  const [manualClassError, setManualClassError] = useState("");
  const [manualClassForm, setManualClassForm] = useState<ManualTimetableForm>({
    title: "",
    subjectId: "",
    dayOfWeek: 1,
    startTime: "09:00",
    endTime: "10:00",
    week: "both",
    location: "",
    teacher: "",
  });

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [importError, setImportError] = useState("");
  const [pendingBackup, setPendingBackup] = useState<BackupV1 | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [billingInterval, setBillingInterval] = useState<"monthly" | "yearly">("monthly");
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingError, setBillingError] = useState("");

  const subjectsCardRef = useRef<HTMLDivElement>(null);
  const termsCardRef = useRef<HTMLDivElement>(null);
  const timetableCardRef = useRef<HTMLDivElement>(null);
  const backupCardRef = useRef<HTMLDivElement>(null);
  const premiumCardRef = useRef<HTMLDivElement>(null);
  const subjectNameInputRef = useRef<HTMLInputElement>(null);
  const termNameInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const usedSubjectColors = useMemo(() => subjects.map((s) => s.color), [subjects]);

  const sortedTimetablePeriods = useMemo(
    () => sortPeriods(timetablePeriods),
    [timetablePeriods]
  );


  const getSubjectName = (subjectId?: string) =>
    subjects.find((s) => s.id === subjectId)?.name ?? "";

  const getSubjectColor = (subjectId?: string) =>
    subjects.find((s) => s.id === subjectId)?.color ?? "#64748b";

  const getDayLabel = (day: TimetableDayOfWeek) =>
    ALL_DAYS.find((d) => d.value === day)?.label ?? "Day";

  const deletingSubject = useMemo(
    () => subjects.find((s) => s.id === deletingSubjectId) || null,
    [subjects, deletingSubjectId]
  );

  const deletingTerm = useMemo(
    () => periods.find((p) => p.id === deletingPeriodId) || null,
    [periods, deletingPeriodId]
  );

  const deletingTimetableClass = useMemo(
    () => timetableClasses.find((c) => c.id === deletingTimetableClassId) ?? null,
    [timetableClasses, deletingTimetableClassId]
  );

  const deleteCounts = useMemo(() => {
    if (!deletingSubjectId) {
      return { tasks: 0, items: 0, sessions: 0, timetableClasses: 0 };
    }

    return {
      tasks: tasks.filter((x) => x.subjectId === deletingSubjectId).length,
      items: studyItems.filter((x) => x.subjectId === deletingSubjectId).length,
      sessions: studySessions.filter((x) => x.subjectId === deletingSubjectId).length,
      timetableClasses: timetableClasses.filter((x) => x.subjectId === deletingSubjectId).length,
    };
  }, [deletingSubjectId, tasks, studyItems, studySessions, timetableClasses]);

  const sortedManualClasses = useMemo(() => {
    return [...timetableClasses]
      .filter((c) => !c.periodId)
      .sort((a, b) => {
        if (a.dayOfWeek !== b.dayOfWeek) return a.dayOfWeek - b.dayOfWeek;
        const aTime = a.startTime ?? "";
        const bTime = b.startTime ?? "";
        if (aTime !== bTime) return aTime.localeCompare(bTime);
        return a.title.localeCompare(b.title);
      });
  }, [timetableClasses]);

  const importCounts = useMemo(() => {
    const d = pendingBackup?.data;
    const getLen = (x: any) => (Array.isArray(x) ? x.length : 0);

    return {
      subjects: getLen(d?.subjects),
      tasks: getLen(d?.tasks),
      studySessions: getLen(d?.studySessions),
      reminders: getLen(d?.reminders),
      timetablePeriods: getLen(d?.timetablePeriods),
      timetableClasses: getLen(d?.timetableClasses),
      periods: Array.isArray(pendingBackup?.periods) ? pendingBackup.periods.length : 0,
    };
  }, [pendingBackup]);

  const commitPeriods = (nextPeriods: Period[]) => {
    const sorted = [...nextPeriods].sort(
      (a, b) => a.startDate.getTime() - b.startDate.getTime()
    );

    setPeriods(sorted);
    onUpdatePeriods(sorted);
  };

  useEffect(() => {
    setPeriods(appPeriods);
  }, [appPeriods]);

  useEffect(() => {
    if (appPeriods.length > 0) return;

    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as PeriodStored[];
      const hydrated: Period[] = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));

      if (hydrated.length > 0) commitPeriods(hydrated);
    } catch {
      // ignore bad local term cache
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    try {
      const stored: PeriodStored[] = periods.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      }));

      localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(stored));
    } catch {}
  }, [periods]);

  useEffect(() => {
    if (!openSection) return;

    if (openSection === "subjects") {
      setSubjectsOpen(true);
      setPeriodsOpen(false);
      setTimetableOpen(false);
      setBackupOpen(false);
      setPremiumOpen(false);
      setShowAddSubjectForm(true);
      setEditingSubjectId(null);

      requestAnimationFrame(() => {
        subjectsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        subjectNameInputRef.current?.focus();
      });
    }

    if (openSection === "terms") {
      setSubjectsOpen(false);
      setPeriodsOpen(true);
      setTimetableOpen(false);
      setBackupOpen(false);
      setPremiumOpen(false);
      openNewTerm();

      requestAnimationFrame(() => {
        termsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        termNameInputRef.current?.focus();
      });
    }

    if (openSection === "timetable") {
      setSubjectsOpen(false);
      setPeriodsOpen(false);
      setTimetableOpen(true);
      setBackupOpen(false);
      setPremiumOpen(false);

      requestAnimationFrame(() => {
        timetableCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (openSection === "backup") {
      setSubjectsOpen(false);
      setPeriodsOpen(false);
      setTimetableOpen(false);
      setBackupOpen(true);
      setPremiumOpen(false);

      requestAnimationFrame(() => {
        backupCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    if (openSection === "premium") {
      setSubjectsOpen(false);
      setPeriodsOpen(false);
      setTimetableOpen(false);
      setBackupOpen(false);
      setPremiumOpen(true);

      requestAnimationFrame(() => {
        premiumCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    onOpenSectionHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection]);

  const resetSubjectForm = () => {
    setSubjectForm({ name: "", color: pickNextColor(usedSubjectColors) });
    setEditingSubjectId(null);
  };

  const openNewSubject = () => {
    resetSubjectForm();
    setShowAddSubjectForm(true);
    setSubjectsOpen(true);
    requestAnimationFrame(() => subjectNameInputRef.current?.focus());
  };

  const openEditSubject = (subject: Subject) => {
    setEditingSubjectId(subject.id);
    setSubjectForm({ name: subject.name, color: subject.color });
    setShowAddSubjectForm(true);
    setSubjectsOpen(true);
  };

  const cancelSubjectForm = () => {
    setShowAddSubjectForm(false);
    resetSubjectForm();
  };

  const saveSubject = () => {
    const name = subjectForm.name.trim();
    if (!name) return;

    if (editingSubjectId) {
      onUpdateSubject(editingSubjectId, name, subjectForm.color);
    } else {
      onAddSubject(name, subjectForm.color);
    }

    setShowAddSubjectForm(false);
    resetSubjectForm();
  };

  const openNewTerm = () => {
    const today = new Date();
    setShowAddPeriodForm(true);
    setEditingPeriodId(null);
    setPeriodFormError("");
    setPeriodForm({
      name: "",
      startDate: toISODateInputValue(today),
      endDate: toISODateInputValue(today),
    });
  };

  const openEditTerm = (period: Period) => {
    setShowAddPeriodForm(true);
    setEditingPeriodId(period.id);
    setPeriodFormError("");
    setPeriodForm({
      name: period.name,
      startDate: toISODateInputValue(period.startDate),
      endDate: toISODateInputValue(period.endDate),
    });
  };

  const cancelTermForm = () => {
    setShowAddPeriodForm(false);
    setEditingPeriodId(null);
    setPeriodFormError("");
  };

  const saveTerm = () => {
    const name = periodForm.name.trim();

    if (!name) {
      setPeriodFormError("Please enter a term name.");
      return;
    }

    const start = parseDateInput(periodForm.startDate);
    const end = parseDateInput(periodForm.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setPeriodFormError("Please enter valid dates.");
      return;
    }

    if (start.getTime() > end.getTime()) {
      setPeriodFormError("End date must be after start date.");
      return;
    }

    const duplicateName = periods.some(
      (period) =>
        period.id !== editingPeriodId &&
        period.name.trim().toLowerCase() === name.toLowerCase()
    );

    if (duplicateName) {
      setPeriodFormError("A term with this name already exists.");
      return;
    }

    const overlaps = periods.some(
      (period) =>
        period.id !== editingPeriodId &&
        start.getTime() <= period.endDate.getTime() &&
        end.getTime() >= period.startDate.getTime()
    );

    if (overlaps) {
      setPeriodFormError("Term dates cannot overlap another term.");
      return;
    }

    if (editingPeriodId) {
      commitPeriods(
        periods.map((p) =>
          p.id === editingPeriodId ? { ...p, name, startDate: start, endDate: end } : p
        )
      );
    } else {
      commitPeriods([...periods, { id: safeUUID(), name, startDate: start, endDate: end }]);
    }

    cancelTermForm();
  };

  const formatTermRange = (period: Period) => {
    const start = period.startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const end = period.endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    return `${start} → ${end}`;
  };

  const openPeriodEditor = () => {
    setPeriodDrafts(sortPeriods(timetablePeriods));
    setPeriodEditorError("");
    setShowPeriodEditor(true);
  };

  const addTimetablePeriod = () => {
    const nextOrder =
      periodDrafts.length > 0 ? Math.max(...periodDrafts.map((p) => p.order)) + 1 : 1;

    setPeriodDrafts((prev) => [
      ...prev,
      {
        id: safeUUID(),
        name: `Period ${prev.filter((p) => p.type === "class").length + 1}`,
        startTime: "09:00",
        endTime: "10:00",
        type: "class",
        order: nextOrder,
      },
    ]);
  };

  const updateTimetablePeriodDraft = (
    id: string,
    patch: Partial<TimetablePeriod>
  ) => {
    setPeriodDrafts((prev) =>
      sortPeriods(prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    );
  };

  const deleteTimetablePeriodDraft = (id: string) => {
    setPeriodDrafts((prev) => prev.filter((p) => p.id !== id));
  };

  const saveTimetablePeriods = () => {
    for (const period of periodDrafts) {
      if (!period.name.trim()) {
        setPeriodEditorError("Every period needs a name.");
        return;
      }

      if (!period.startTime || !period.endTime) {
        setPeriodEditorError("Every period needs a start and end time.");
        return;
      }

      if (period.startTime >= period.endTime) {
        setPeriodEditorError(`${period.name} has an end time before its start time.`);
        return;
      }
    }

    const sortedDrafts = sortPeriods(periodDrafts);

    for (let index = 1; index < sortedDrafts.length; index += 1) {
      const previous = sortedDrafts[index - 1];
      const current = sortedDrafts[index];

      if (current.startTime < previous.endTime) {
        setPeriodEditorError(
          `${current.name} overlaps ${previous.name}. Adjust the period times.`
        );
        return;
      }
    }

    onUpdateTimetablePeriods(
      sortedDrafts.map((p, index) => ({
        ...p,
        name: p.name.trim(),
        order: index + 1,
      }))
    );

    setShowPeriodEditor(false);
    setPeriodEditorError("");
  };

  const getGridClass = (
    dayOfWeek: TimetableDayOfWeek,
    periodId: string,
    week: TimetableWeek
  ) => {
    return timetableClasses.find(
      (item) =>
        item.dayOfWeek === dayOfWeek &&
        item.periodId === periodId &&
        (timetableSettings.cycle === "weekly"
          ? item.week === "both"
          : item.week === week)
    );
  };

  const setGridClass = (
    dayOfWeek: TimetableDayOfWeek,
    period: TimetablePeriod,
    subjectId: string,
    week: TimetableWeek
  ) => {
    const existing = getGridClass(dayOfWeek, period.id, week);

    if (!subjectId) {
      if (existing) onDeleteTimetableClass(existing.id);
      return;
    }

    const subject = subjects.find((s) => s.id === subjectId);
    const title = subject?.name ?? "Class";

    const payload: Omit<TimetableClass, "id"> = {
      title,
      subjectId,
      dayOfWeek,
      periodId: period.id,
      startTime: period.startTime,
      endTime: period.endTime,
      week: timetableSettings.cycle === "weekly" ? "both" : week,
      location: existing?.location,
      teacher: existing?.teacher,
      notes: existing?.notes,
      createdAt: existing?.createdAt ?? new Date(),
    };

    if (existing) {
      onUpdateTimetableClass(existing.id, payload);
    } else {
      onAddTimetableClass(payload);
    }
  };

  const copyWeekAToWeekB = () => {
    if (timetableSettings.cycle !== "fortnightly") return;

    const weekAClasses = timetableClasses.filter((c) => c.week === "A" && c.periodId);

    for (const classItem of weekAClasses) {
      const existingB = timetableClasses.find(
        (c) =>
          c.week === "B" &&
          c.periodId === classItem.periodId &&
          c.dayOfWeek === classItem.dayOfWeek
      );

      const payload: Omit<TimetableClass, "id"> = {
        title: classItem.title,
        subjectId: classItem.subjectId,
        dayOfWeek: classItem.dayOfWeek,
        periodId: classItem.periodId,
        startTime: classItem.startTime,
        endTime: classItem.endTime,
        week: "B",
        location: classItem.location,
        teacher: classItem.teacher,
        notes: classItem.notes,
        createdAt: existingB?.createdAt ?? new Date(),
      };

      if (existingB) {
        onUpdateTimetableClass(existingB.id, payload);
      } else {
        onAddTimetableClass(payload);
      }
    }
  };

  const clearSchoolGrid = (week?: "A" | "B") => {
    timetableClasses
      .filter((c) => c.periodId)
      .filter((c) => {
        if (timetableSettings.cycle === "weekly") return true;
        if (!week) return true;
        return c.week === week;
      })
      .forEach((c) => onDeleteTimetableClass(c.id));
  };

  const resetManualClassForm = () => {
    setManualClassForm({
      title: "",
      subjectId: "",
      dayOfWeek: 1,
      startTime: "09:00",
      endTime: "10:00",
      week: "both",
      location: "",
      teacher: "",
    });
    setManualClassError("");
    setEditingManualClassId(null);
  };

  const openNewManualClass = () => {
    resetManualClassForm();
    setShowManualClassForm(true);
  };

  const openEditManualClass = (item: TimetableClass) => {
    setEditingManualClassId(item.id);
    setManualClassError("");
    setShowManualClassForm(true);
    setManualClassForm({
      title: item.title,
      subjectId: item.subjectId ?? "",
      dayOfWeek: item.dayOfWeek,
      startTime: item.startTime ?? "09:00",
      endTime: item.endTime ?? "10:00",
      week: item.week,
      location: item.location ?? "",
      teacher: item.teacher ?? "",
    });
  };

  const saveManualClass = () => {
    const title = manualClassForm.title.trim();

    if (!title) {
      setManualClassError("Please enter a class name.");
      return;
    }

    if (!manualClassForm.startTime || !manualClassForm.endTime) {
      setManualClassError("Start and end time are required.");
      return;
    }

    if (manualClassForm.startTime >= manualClassForm.endTime) {
      setManualClassError("End time must be after start time.");
      return;
    }

    const payload: Omit<TimetableClass, "id"> = {
      title,
      subjectId: manualClassForm.subjectId || undefined,
      dayOfWeek: manualClassForm.dayOfWeek,
      startTime: manualClassForm.startTime,
      endTime: manualClassForm.endTime,
      week: timetableSettings.cycle === "weekly" ? "both" : manualClassForm.week,
      location: manualClassForm.location.trim() || undefined,
      teacher: manualClassForm.teacher.trim() || undefined,
      source: editingManualClassId
        ? timetableClasses.find((c) => c.id === editingManualClassId)?.source
        : "manual",
      sourceLabel: editingManualClassId
        ? timetableClasses.find((c) => c.id === editingManualClassId)?.sourceLabel
        : undefined,
      createdAt: editingManualClassId
        ? timetableClasses.find((c) => c.id === editingManualClassId)?.createdAt
        : new Date(),
    };

    if (editingManualClassId) {
      onUpdateTimetableClass(editingManualClassId, payload);
    } else {
      onAddTimetableClass(payload);
    }

    setShowManualClassForm(false);
    resetManualClassForm();
  };

  const handleExportBackup = () => {
    setImportError("");

    const rawAppData = safeJsonParse<any>(localStorage.getItem(storageKey));
    const rawPeriods =
      safeJsonParse<PeriodStored[]>(localStorage.getItem(PERIODS_STORAGE_KEY)) ?? undefined;

    const fallbackData = {
      subjects,
      periods: periods.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      })),
      tasks: tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : t.dueDate,
        scheduledDate:
          t.scheduledDate instanceof Date ? t.scheduledDate.toISOString() : t.scheduledDate,
      })),
      studySessions: studySessions.map((s) => ({
        ...s,
        date: s.date instanceof Date ? s.date.toISOString() : s.date,
      })),
      reminders: [],
      timetableSettings,
      timetablePeriods,
      timetableClasses,
      importedCalendarEvents: importedCalendarEvents.map((event) => ({
        ...event,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
        importedAt: event.importedAt.toISOString(),
        updatedAt: event.updatedAt?.toISOString(),
      })),
    };

    const backup: BackupV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appMode,
      data: {
        ...(rawAppData ?? fallbackData),
        timetableSettings,
        timetablePeriods,
        timetableClasses,
        importedCalendarEvents: rawAppData?.importedCalendarEvents ?? fallbackData.importedCalendarEvents,
      },
      periods: rawPeriods,
    };

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadJson(`mystudyplanner-backup-${dateStamp}.json`, backup);
  };

  const openImportPicker = () => {
    setImportError("");
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (file: File | null) => {
    setImportError("");
    setPendingBackup(null);
    setShowImportConfirm(false);

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<BackupV1>;

      if (parsed?.version !== 1) {
        setImportError("This backup file format isn’t supported.");
        return;
      }

      if (!parsed.data || typeof parsed.data !== "object") {
        setImportError("Backup is missing data.");
        return;
      }

      setPendingBackup({
        version: 1,
        exportedAt: String(parsed.exportedAt ?? new Date().toISOString()),
        appMode:
          parsed.appMode === "demo" || parsed.appMode === "app"
            ? parsed.appMode
            : appMode,
        data: parsed.data,
        periods: Array.isArray(parsed.periods) ? parsed.periods : undefined,
      });

      setShowImportConfirm(true);
    } catch {
      setImportError("Couldn’t read that file. Make sure it’s a valid .json backup.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingBackup) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(pendingBackup.data));

      if (pendingBackup.periods) {
        localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(pendingBackup.periods));
      }

      window.location.reload();
    } catch {
      setImportError("Import failed. Your browser may be blocking storage.");
      setShowImportConfirm(false);
      setPendingBackup(null);
    }
  };

  const currentPlanLabel = appMode === "demo" ? "Preview Premium" : plan === "premium" ? "Premium" : "Free plan";

  const startPremiumCheckout = async () => {
    if (appMode === "demo") return;

    setBillingError("");
    setBillingLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interval: billingInterval }),
      });

      const data = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not start checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      setBillingError(error instanceof Error ? error.message : "Could not start checkout.");
    } finally {
      setBillingLoading(false);
    }
  };

  const openBillingPortal = async () => {
    if (appMode === "demo") return;

    setBillingError("");
    setBillingLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await response.json().catch(() => null)) as
        | { url?: string; error?: string }
        | null;

      if (!response.ok || !data?.url) {
        throw new Error(data?.error ?? "Could not open billing management.");
      }

      window.location.href = data.url;
    } catch (error) {
      setBillingError(
        error instanceof Error ? error.message : "Could not open billing management."
      );
    } finally {
      setBillingLoading(false);
    }
  };

  const clearButtonLabel = appMode === "demo" ? "Reset demo" : "Clear all data";

  const handleConfirmClear = () => {
    try {
      localStorage.removeItem(PERIODS_STORAGE_KEY);
    } catch {}

    onClearAllData();
    setShowClearConfirm(false);
  };

  return (
    <div className="app-page app-scroll-page page-accent-settings space-y-4">
      <div className="space-y-1">
        <h1 className="app-page-title">Settings</h1>
        <p className="app-page-subtitle">
          Manage your subjects, terms, timetable, data, and support.
        </p>
      </div>

      <div className="space-y-3">
        <div ref={subjectsCardRef} className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setSubjectsOpen((v) => !v)}
            className="flex w-full items-center justify-between px-5 py-3.5 transition-colors hover:bg-muted/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="settings-row-icon settings-icon-subjects"><BookOpen className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-semibold text-foreground">Subjects</div>
                <div className="text-xs text-muted-foreground">{subjects.length} subject{subjects.length === 1 ? "" : "s"} configured.</div>
              </div>
            </div>

            <ChevronDown
              className={[
                "h-5 w-5 text-muted-foreground transition-transform",
                subjectsOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {subjectsOpen ? (
            <div className="settings-panel-content space-y-4 border-t border-border px-5 pb-5 pt-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={openNewSubject}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add subject
                </button>
              </div>

              {showAddSubjectForm ? (
                <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="text-sm font-semibold text-foreground">
                    {editingSubjectId ? "Edit subject" : "New subject"}
                  </div>

                  <input
                    ref={subjectNameInputRef}
                    type="text"
                    placeholder="Subject name"
                    maxLength={80}
                    value={subjectForm.name}
                    onChange={(e) => setSubjectForm((p) => ({ ...p, name: e.target.value }))}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Colour</label>

                    <div className="grid grid-cols-8 gap-2 sm:grid-cols-10 md:grid-cols-12">
                      {SUBJECT_COLOR_PALETTE.map((color) => {
                        const selected = normalizeHex(subjectForm.color) === normalizeHex(color);

                        return (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setSubjectForm((p) => ({ ...p, color }))}
                            className={[
                              "h-9 w-9 rounded-xl border transition-transform md:h-10 md:w-10",
                              selected
                                ? "scale-105 border-border ring-2 ring-primary"
                                : "border-border hover:scale-105",
                            ].join(" ")}
                            style={{ backgroundColor: color }}
                            aria-label={`Pick ${color}`}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={saveSubject}
                      disabled={!subjectForm.name.trim()}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
                      type="button"
                    >
                      {editingSubjectId ? "Save" : "Add"}
                    </button>

                    <button
                      onClick={cancelSubjectForm}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <div className="app-empty-state">
                    <div className="text-sm font-medium text-foreground">No subjects yet</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Add subjects before filling your timetable grid.
                    </div>
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 shadow-sm"
                      style={{ borderLeftWidth: 4, borderLeftColor: subject.color }}
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {subject.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {tasks.filter((t) => t.subjectId === subject.id).length} linked items
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditSubject(subject)}
                          className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                          aria-label="Edit subject"
                        >
                          <Edit2 className="h-4 w-4 text-foreground" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingSubjectId(subject.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                          aria-label="Delete subject"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={termsCardRef} className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setPeriodsOpen((v) => !v)}
            className="settings-panel-trigger flex w-full items-center justify-between px-5 py-3 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="settings-row-icon settings-icon-terms"><CalendarRange className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-semibold text-foreground">Terms</div>
                <div className="text-xs text-muted-foreground">{periods.length} term{periods.length === 1 ? "" : "s"} configured.</div>
              </div>
            </div>

            <ChevronDown
              className={[
                "h-5 w-5 text-muted-foreground transition-transform",
                periodsOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {periodsOpen ? (
            <div className="settings-panel-content space-y-4 border-t border-border px-5 pb-5 pt-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={openNewTerm}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <Plus className="h-4 w-4" />
                  Add term
                </button>
              </div>

              {showAddPeriodForm ? (
                <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-sm">
                  <div className="text-sm font-semibold text-foreground">
                    {editingPeriodId ? "Edit term" : "New term"}
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Name
                      </label>
                      <input
                        ref={termNameInputRef}
                        type="text"
                        placeholder="e.g. Term 1"
                        maxLength={80}
                        value={periodForm.name}
                        onChange={(e) => setPeriodForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Start date
                      </label>
                      <input
                        type="date"
                        value={periodForm.startDate}
                        onChange={(e) =>
                          setPeriodForm((p) => ({ ...p, startDate: e.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        End date
                      </label>
                      <input
                        type="date"
                        value={periodForm.endDate}
                        onChange={(e) =>
                          setPeriodForm((p) => ({ ...p, endDate: e.target.value }))
                        }
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {periodFormError ? (
                    <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                      {periodFormError}
                    </div>
                  ) : null}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={saveTerm}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      {editingPeriodId ? "Save" : "Add"}
                    </button>

                    <button
                      type="button"
                      onClick={cancelTermForm}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="space-y-2">
                {periods.length === 0 ? (
                  <div className="app-empty-state">
                    <div className="text-sm font-medium text-foreground">No terms yet</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Add term dates so tasks can be grouped automatically.
                    </div>
                  </div>
                ) : (
                  periods.map((period) => (
                    <div
                      key={period.id}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/50 px-4 py-3 shadow-sm"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-foreground">
                          {period.name}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {formatTermRange(period)}
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditTerm(period)}
                          className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                          aria-label="Edit term"
                        >
                          <Edit2 className="h-4 w-4 text-foreground" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeletingPeriodId(period.id)}
                          className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                          aria-label="Delete term"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : null}
        </div>

        <div ref={timetableCardRef} className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setTimetableOpen((v) => !v)}
            className="settings-panel-trigger flex w-full items-center justify-between px-5 py-3 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="settings-row-icon settings-icon-timetable"><CalendarDays className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-semibold text-foreground">Timetable</div>
                <div className="text-xs text-muted-foreground">{timetableSettings.cycle === "fortnightly" ? "Fortnightly" : "Weekly"} timetable · {timetableClasses.length} class{timetableClasses.length === 1 ? "" : "es"}.</div>
              </div>
            </div>

            <ChevronDown
              className={[
                "h-5 w-5 text-muted-foreground transition-transform",
                timetableOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {timetableOpen ? (
            <div className="space-y-5 px-5 pb-5">
              <div className="rounded-2xl border border-border bg-muted/[0.08] p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Timetable type
                    </label>
                    <select
                      value={timetableSettings.mode}
                      onChange={(e) =>
                        onUpdateTimetableSettings({
                          ...timetableSettings,
                          mode: e.target.value as TimetableMode,
                        })
                      }
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="school">School grid</option>
                      <option value="university">University</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Repeat cycle
                    </label>
                    <select
                      value={timetableSettings.cycle}
                      onChange={(e) => {
                        const nextCycle = e.target.value as TimetableCycle;

                        onUpdateTimetableSettings({
                          ...timetableSettings,
                          cycle: nextCycle,
                          cycleStartDate:
                            nextCycle === "fortnightly"
                              ? timetableSettings.cycleStartDate ?? new Date()
                              : undefined,
                        });
                      }}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="weekly">Every week</option>
                      <option value="fortnightly">Week A / Week B</option>
                    </select>
                  </div>

                  {timetableSettings.cycle === "fortnightly" ? (
                    <div>
                      <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Week A start date
                      </label>
                      <input
                        type="date"
                        value={
                          timetableSettings.cycleStartDate
                            ? toISODateInputValue(timetableSettings.cycleStartDate)
                            : ""
                        }
                        onChange={(e) =>
                          onUpdateTimetableSettings({
                            ...timetableSettings,
                            cycleStartDate: e.target.value
                              ? parseDateInput(e.target.value)
                              : undefined,
                          })
                        }
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  ) : null}
                </div>

                <div className="mt-3 text-[11px] leading-5 text-muted-foreground">
                  School mode uses a grid so you can fill 6 periods × 5 days quickly.
                  Week and day calendar views show classes. Month view stays clean.
                </div>
              </div>

              {timetableSettings.mode === "school" ? (
                <>
                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">Period times</div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Set these once, then fill the timetable grid below.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={openPeriodEditor}
                        className="rounded-xl border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                      >
                        Edit period times
                      </button>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2">
                      {sortedTimetablePeriods.map((period) => (
                        <div
                          key={period.id}
                          className="flex items-center justify-between rounded-xl border border-border bg-background/50 px-3 py-2"
                        >
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {period.name}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {period.type === "break" ? "Break" : "Class period"}
                            </div>
                          </div>

                          <div className="shrink-0 text-xs font-medium text-muted-foreground">
                            {formatTimetableTime(period.startTime)} –{" "}
                            {formatTimetableTime(period.endTime)}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {showPeriodEditor ? (
                    <div className="space-y-4 rounded-2xl border border-border bg-card p-4 shadow-sm">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm font-semibold text-foreground">
                            Edit period times
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Add class periods, recess, lunch, study periods, or sport blocks.
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={addTimetablePeriod}
                          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                          <Plus className="h-4 w-4" />
                          Add period
                        </button>
                      </div>

                      <div className="space-y-2">
                        {periodDrafts.map((period) => (
                          <div
                            key={period.id}
                            className="grid grid-cols-1 gap-2 rounded-xl border border-border bg-background/50 p-3 md:grid-cols-[1fr_130px_130px_130px_44px]"
                          >
                            <input
                              type="text"
                              value={period.name}
                              onChange={(e) =>
                                updateTimetablePeriodDraft(period.id, {
                                  name: e.target.value,
                                })
                              }
                              className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                              placeholder="Period name"
                              maxLength={60}
                            />

                            <input
                              type="time"
                              value={period.startTime}
                              onChange={(e) =>
                                updateTimetablePeriodDraft(period.id, {
                                  startTime: e.target.value,
                                })
                              }
                              className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />

                            <input
                              type="time"
                              value={period.endTime}
                              onChange={(e) =>
                                updateTimetablePeriodDraft(period.id, {
                                  endTime: e.target.value,
                                })
                              }
                              className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            />

                            <select
                              value={period.type}
                              onChange={(e) =>
                                updateTimetablePeriodDraft(period.id, {
                                  type: e.target.value as TimetablePeriodType,
                                })
                              }
                              className="rounded-xl border border-border bg-input-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <option value="class">Class</option>
                              <option value="break">Break</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => deleteTimetablePeriodDraft(period.id)}
                              className="grid h-10 w-10 place-items-center rounded-xl border border-border bg-card transition hover:bg-muted"
                              aria-label="Delete period"
                            >
                              <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {periodEditorError ? (
                        <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                          {periodEditorError}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveTimetablePeriods}
                          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                          Save period times
                        </button>

                        <button
                          type="button"
                          onClick={() => setShowPeriodEditor(false)}
                          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="text-sm font-semibold text-foreground">
                          Timetable grid
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Pick a subject in each cell. Empty means no class.
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {timetableSettings.cycle === "fortnightly" ? (
                          <>
                            <div className="flex rounded-xl border border-border bg-muted/20 p-1">
                              <button
                                type="button"
                                onClick={() => setActiveTimetableWeek("A")}
                                className={[
                                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                                  activeTimetableWeek === "A"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted",
                                ].join(" ")}
                              >
                                Week A
                              </button>

                              <button
                                type="button"
                                onClick={() => setActiveTimetableWeek("B")}
                                className={[
                                  "rounded-lg px-3 py-1.5 text-sm font-medium transition",
                                  activeTimetableWeek === "B"
                                    ? "bg-primary text-primary-foreground"
                                    : "text-muted-foreground hover:bg-muted",
                                ].join(" ")}
                              >
                                Week B
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={copyWeekAToWeekB}
                              className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                            >
                              Copy A → B
                            </button>
                          </>
                        ) : null}

                        <button
                          type="button"
                          onClick={() =>
                            clearSchoolGrid(
                              timetableSettings.cycle === "fortnightly"
                                ? activeTimetableWeek
                                : undefined
                            )
                          }
                          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground transition hover:bg-muted"
                        >
                          Clear grid
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 overflow-x-auto">
                      <div className="min-w-[900px] rounded-2xl border border-border">
                        <div className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-b border-border bg-muted/20">
                          <div className="border-r border-border px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Period
                          </div>
                          {SCHOOL_DAYS.map((day) => (
                            <div
                              key={day.value}
                              className="border-r border-border px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground last:border-r-0"
                            >
                              {day.short}
                            </div>
                          ))}
                        </div>

                        {sortedTimetablePeriods.map((period) => {
                          if (period.type === "break") {
                            return (
                              <div
                                key={period.id}
                                className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-b border-border bg-muted/[0.08] last:border-b-0"
                              >
                                <div className="border-r border-border px-3 py-3">
                                  <div className="text-sm font-semibold text-foreground">
                                    {period.name}
                                  </div>
                                  <div className="text-[11px] text-muted-foreground">
                                    {formatTimetableTime(period.startTime)} –{" "}
                                    {formatTimetableTime(period.endTime)}
                                  </div>
                                </div>

                                <div className="col-span-5 px-3 py-3 text-center text-xs text-muted-foreground">
                                  Break
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={period.id}
                              className="grid grid-cols-[150px_repeat(5,minmax(0,1fr))] border-b border-border last:border-b-0"
                            >
                              <div className="border-r border-border bg-background/50 px-3 py-3">
                                <div className="text-sm font-semibold text-foreground">
                                  {period.name}
                                </div>
                                <div className="text-[11px] text-muted-foreground">
                                  {formatTimetableTime(period.startTime)} –{" "}
                                  {formatTimetableTime(period.endTime)}
                                </div>
                              </div>

                              {SCHOOL_DAYS.map((day) => {
                                const current = getGridClass(
                                  day.value,
                                  period.id,
                                  timetableSettings.cycle === "weekly"
                                    ? "both"
                                    : activeTimetableWeek
                                );

                                const subjectColor = getSubjectColor(current?.subjectId);

                                return (
                                  <div
                                    key={`${period.id}-${day.value}`}
                                    className="border-r border-border p-2 last:border-r-0"
                                    style={{
                                      backgroundColor: current?.subjectId
                                        ? `${subjectColor}0D`
                                        : undefined,
                                    }}
                                  >
                                    <select
                                      value={current?.subjectId ?? ""}
                                      onChange={(e) =>
                                        setGridClass(
                                          day.value,
                                          period,
                                          e.target.value,
                                          timetableSettings.cycle === "weekly"
                                            ? "both"
                                            : activeTimetableWeek
                                        )
                                      }
                                      className="w-full rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                                      style={{
                                        borderLeftWidth: current?.subjectId ? 4 : 1,
                                        borderLeftColor: current?.subjectId
                                          ? subjectColor
                                          : undefined,
                                      }}
                                    >
                                      <option value="">Empty</option>
                                      {subjects.map((subject) => (
                                        <option key={subject.id} value={subject.id}>
                                          {subject.name}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {subjects.length === 0 ? (
                      <div className="mt-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                        Add subjects first, then you can fill the timetable grid.
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-foreground">
                        Manual classes
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground">
                        Best for uni lectures, tutorials, labs, sport, work, or custom events.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={openNewManualClass}
                      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                    >
                      <Plus className="h-4 w-4" />
                      Add class
                    </button>
                  </div>

                  {showManualClassForm ? (
                    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-background/50 p-4">
                      <div className="text-sm font-semibold text-foreground">
                        {editingManualClassId ? "Edit class" : "New class"}
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Class name
                          </label>
                          <input
                            type="text"
                            value={manualClassForm.title}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, title: e.target.value }))
                            }
                            placeholder="e.g. Economics Tutorial"
                            maxLength={100}
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Subject
                          </label>
                          <select
                            value={manualClassForm.subjectId}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, subjectId: e.target.value }))
                            }
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="">No subject / custom</option>
                            {subjects.map((subject) => (
                              <option key={subject.id} value={subject.id}>
                                {subject.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Day
                          </label>
                          <select
                            value={String(manualClassForm.dayOfWeek)}
                            onChange={(e) =>
                              setManualClassForm((p) => ({
                                ...p,
                                dayOfWeek: Number(e.target.value) as TimetableDayOfWeek,
                              }))
                            }
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            {ALL_DAYS.map((day) => (
                              <option key={day.value} value={day.value}>
                                {day.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {timetableSettings.cycle === "fortnightly" ? (
                          <div>
                            <label className="mb-1 block text-xs font-medium text-muted-foreground">
                              Week
                            </label>
                            <select
                              value={manualClassForm.week}
                              onChange={(e) =>
                                setManualClassForm((p) => ({
                                  ...p,
                                  week: e.target.value as TimetableWeek,
                                }))
                              }
                              className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                            >
                              <option value="both">Both weeks</option>
                              <option value="A">Week A only</option>
                              <option value="B">Week B only</option>
                            </select>
                          </div>
                        ) : null}

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Start time
                          </label>
                          <input
                            type="time"
                            value={manualClassForm.startTime}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, startTime: e.target.value }))
                            }
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            End time
                          </label>
                          <input
                            type="time"
                            value={manualClassForm.endTime}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, endTime: e.target.value }))
                            }
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Location
                          </label>
                          <input
                            type="text"
                            value={manualClassForm.location}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, location: e.target.value }))
                            }
                            placeholder="Room, campus, building"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>

                        <div>
                          <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Teacher / tutor
                          </label>
                          <input
                            type="text"
                            value={manualClassForm.teacher}
                            onChange={(e) =>
                              setManualClassForm((p) => ({ ...p, teacher: e.target.value }))
                            }
                            placeholder="Optional"
                            className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                          />
                        </div>
                      </div>

                      {manualClassError ? (
                        <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                          {manualClassError}
                        </div>
                      ) : null}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={saveManualClass}
                          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                        >
                          {editingManualClassId ? "Save" : "Add"}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setShowManualClassForm(false);
                            resetManualClassForm();
                          }}
                          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-4 space-y-2">
                    {sortedManualClasses.length === 0 ? (
                      <div className="app-empty-state">
                        <div className="text-sm font-medium text-foreground">
                          No manual classes yet
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Add lectures, tutorials, labs, sport, work, or custom timetable items.
                        </div>
                      </div>
                    ) : (
                      sortedManualClasses.map((item) => {
                        const subjectColor = getSubjectColor(item.subjectId);

                        return (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-border bg-background/50 px-4 py-3 shadow-sm"
                            style={{ borderLeftWidth: 4, borderLeftColor: subjectColor }}
                          >
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-semibold text-foreground">
                                  {item.title}
                                  {item.source && item.source !== "manual" ? (
                                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                                      Imported
                                    </span>
                                  ) : null}
                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                  <span>{getDayLabel(item.dayOfWeek)}</span>
                                  <span>•</span>
                                  <span>
                                    {formatTimetableTime(item.startTime)} –{" "}
                                    {formatTimetableTime(item.endTime)}
                                  </span>

                                  {timetableSettings.cycle === "fortnightly" ? (
                                    <>
                                      <span>•</span>
                                      <span>
                                        {item.week === "both"
                                          ? "Both weeks"
                                          : `Week ${item.week}`}
                                      </span>
                                    </>
                                  ) : null}

                                  {item.subjectId ? (
                                    <>
                                      <span>•</span>
                                      <span>{getSubjectName(item.subjectId)}</span>
                                    </>
                                  ) : null}

                                  {item.location ? (
                                    <>
                                      <span>•</span>
                                      <span>{item.location}</span>
                                    </>
                                  ) : null}
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => openEditManualClass(item)}
                                  className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                                  aria-label="Edit class"
                                >
                                  <Edit2 className="h-4 w-4 text-foreground" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => setDeletingTimetableClassId(item.id)}
                                  className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted"
                                  aria-label="Delete class"
                                >
                                  <Trash2 className="h-4 w-4 text-muted-foreground" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>

        <CalendarImports
          appMode={appMode}
          subjects={subjects}
          importedEvents={importedCalendarEvents}
          timetableClasses={timetableClasses}
          timetableSettings={timetableSettings}
          onImport={onImportCalendarEvents}
          onImportTimetableClasses={(classes) => {
            classes.forEach((item) => onAddTimetableClass(item));
          }}
          onUpdateTimetableSettings={onUpdateTimetableSettings}
          onRemoveSource={onRemoveImportedCalendarSource}
          onRemoveTimetableSource={(source) => {
            timetableClasses
              .filter((item) => item.source === source)
              .forEach((item) => onDeleteTimetableClass(item.id));
          }}
          onOpenSubjects={() => {
            setSubjectsOpen(true);
            setTimetableOpen(false);
            window.setTimeout(() => {
              subjectsCardRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 50);
          }}
          onOpenTimetable={() => {
            setTimetableOpen(true);
            window.setTimeout(() => {
              timetableCardRef.current?.scrollIntoView({
                behavior: "smooth",
                block: "start",
              });
            }, 50);
          }}
        />

        <div ref={backupCardRef} className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setBackupOpen((v) => !v)}
            className="settings-panel-trigger flex w-full items-center justify-between px-5 py-3 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="settings-row-icon settings-icon-data"><Database className="h-4 w-4" /></span>
              <div>
                <div className="text-sm font-semibold text-foreground">Backup & data</div>
                <div className="text-xs text-muted-foreground">Export, import, reset, or clear your planner data.</div>
              </div>
            </div>

            <ChevronDown
              className={[
                "h-5 w-5 text-muted-foreground transition-transform",
                backupOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {backupOpen ? (
            <div className="settings-panel-content space-y-4 border-t border-border px-5 pb-5 pt-4">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="rounded-2xl border border-border bg-background/50 px-4 py-4 text-left transition hover:bg-muted/40"
                >
                  <div className="text-sm font-semibold text-foreground">Export backup</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Download your planner as a JSON file.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={openImportPicker}
                  className="rounded-2xl border border-border bg-background/50 px-4 py-4 text-left transition hover:bg-muted/40"
                >
                  <div className="text-sm font-semibold text-foreground">Import backup</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Restore from a previous backup.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShowClearConfirm(true)}
                  className="rounded-2xl border border-border bg-background/50 px-4 py-4 text-left transition hover:bg-muted/40"
                >
                  <div className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
                    <Trash className="h-4 w-4" />
                    {clearButtonLabel}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {appMode === "demo"
                      ? "Reset the demo back to sample data."
                      : "Remove all saved planner data."}
                  </div>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="application/json,.json"
                className="hidden"
                onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
              />

              {importError ? (
                <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                  {importError}
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div ref={premiumCardRef} className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <button
            type="button"
            onClick={() => setPremiumOpen((value) => !value)}
            className="settings-panel-trigger flex w-full items-center justify-between px-5 py-3 transition-colors"
          >
            <div className="flex items-center gap-3 text-left">
              <span className="settings-row-icon settings-icon-premium">
                <Sparkles className="h-4 w-4" />
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">Premium</div>
                <div className="text-xs text-muted-foreground">
                  Compare plans and manage your subscription.
                </div>
              </div>
            </div>

            <ChevronDown
              className={[
                "h-5 w-5 text-muted-foreground transition-transform",
                premiumOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {premiumOpen ? (
            <div className="settings-panel-content space-y-4 border-t border-border px-5 pb-5 pt-4">
              <div className="flex flex-col gap-3 rounded-2xl border border-border bg-muted/[0.08] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-semibold text-foreground">Current plan</div>
                  <div className="mt-1 text-xs leading-5 text-muted-foreground">
                    {appMode === "demo"
                      ? "Preview mode includes Premium features."
                      : plan === "premium"
                        ? "Premium is active on this account."
                        : "The core planner remains available on the Free plan."}
                  </div>
                </div>
                <span className="app-pill w-fit">{currentPlanLabel}</span>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                <button
                  type="button"
                  disabled={plan === "premium" || billingLoading || appMode === "demo"}
                  onClick={() => {
                    setBillingInterval("monthly");
                    void startPremiumCheckout();
                  }}
                  className="rounded-2xl border border-border bg-background/50 p-5 text-left transition hover:border-border-strong hover:bg-muted/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <div className="text-sm font-semibold text-foreground">Monthly</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    US$2.99
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">per month</div>
                  <div className="mt-4 text-xs font-medium text-foreground">
                    Choose monthly
                  </div>
                </button>

                <button
                  type="button"
                  disabled={plan === "premium" || billingLoading || appMode === "demo"}
                  onClick={() => {
                    setBillingInterval("yearly");
                    void startPremiumCheckout();
                  }}
                  className="relative rounded-2xl border border-primary/40 bg-primary-soft/50 p-5 text-left transition hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                    Best value
                  </span>
                  <div className="text-sm font-semibold text-foreground">Yearly</div>
                  <div className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    US$19.99
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">per year</div>
                  <div className="mt-3 text-xs font-semibold text-primary">
                    Save US$15.89, about 44%
                  </div>
                  <div className="mt-4 text-xs font-medium text-foreground">
                    Choose yearly
                  </div>
                </button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    Free includes
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                    <div>Calendar, tasks, study sessions, subjects, terms, and timetable</div>
                    <div>Account sync and backup tools</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    Premium unlocks
                  </div>
                  <div className="mt-2 space-y-1.5 text-xs leading-5 text-muted-foreground">
                    <div>Marks tracking and assessment performance</div>
                    <div>Deeper study insights and future Premium tools</div>
                  </div>
                </div>
              </div>

              {billingError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
                  {billingError}
                </div>
              ) : null}

              {plan === "premium" && appMode === "app" ? (
                <button
                  type="button"
                  onClick={openBillingPortal}
                  disabled={billingLoading}
                  className="app-btn-primary"
                >
                  {billingLoading ? "Opening billing..." : "Manage subscription"}
                </button>
              ) : null}

              {billingLoading && plan !== "premium" ? (
                <div className="text-xs text-muted-foreground">Opening secure checkout...</div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
          <div className="flex flex-col gap-3 px-5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <span className="settings-row-icon settings-icon-support"><LifeBuoy className="h-4 w-4" /></span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">Support</div>
                <div className="text-xs leading-5 text-muted-foreground">Need help or found a bug? We’re happy to help.</div>
              </div>
            </div>
            <a href="mailto:mystudyplanner.studio@gmail.com" className="app-btn-secondary h-9 shrink-0 px-3">Email support</a>
          </div>
        </div>
      </div>

      {deletingSubject ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDeletingSubjectId(null)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">
                Delete “{deletingSubject.name}”?
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                This also removes linked tasks, study sessions, and timetable classes.
              </div>
            </div>

            <div className="space-y-2 p-5 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>Tasks</span>
                <span>{deleteCounts.tasks}</span>
              </div>
              <div className="flex justify-between">
                <span>Study items</span>
                <span>{deleteCounts.items}</span>
              </div>
              <div className="flex justify-between">
                <span>Study sessions</span>
                <span>{deleteCounts.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span>Timetable classes</span>
                <span>{deleteCounts.timetableClasses}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-5">
              <button
                type="button"
                onClick={() => setDeletingSubjectId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteSubject(deletingSubject.id);
                  setDeletingSubjectId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}

      {deletingTerm ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDeletingPeriodId(null)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">
                Delete “{deletingTerm.name}”?
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                This removes the term from Settings.
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5">
              <button
                type="button"
                onClick={() => setDeletingPeriodId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  commitPeriods(periods.filter((p) => p.id !== deletingTerm.id));
                  setDeletingPeriodId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}

      {deletingTimetableClass ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setDeletingTimetableClassId(null)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">
                Delete “{deletingTimetableClass.title}”?
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                This removes it from your timetable.
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5">
              <button
                type="button"
                onClick={() => setDeletingTimetableClassId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeleteTimetableClass(deletingTimetableClass.id);
                  setDeletingTimetableClassId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}

      {showClearConfirm ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowClearConfirm(false)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">{clearButtonLabel}?</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {appMode === "demo"
                  ? "This resets the demo back to sample data."
                  : "This removes your planner data from this account/device."}
              </div>
            </div>

            <div className="flex justify-end gap-2 p-5">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmClear}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
              >
                {clearButtonLabel}
              </button>
            </div>
          </div>
        </>
      ) : null}

      {showImportConfirm && pendingBackup ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setShowImportConfirm(false)}
          />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">Import backup?</div>
              <div className="mt-1 text-xs text-muted-foreground">
                This will replace your current planner data and reload the app.
              </div>
            </div>

            <div className="space-y-2 p-5 text-sm text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Subjects</span>
                <span className="font-medium text-foreground">{importCounts.subjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tasks</span>
                <span className="font-medium text-foreground">{importCounts.tasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Study sessions</span>
                <span className="font-medium text-foreground">{importCounts.studySessions}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reminders</span>
                <span className="font-medium text-foreground">{importCounts.reminders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Terms</span>
                <span className="font-medium text-foreground">{importCounts.periods}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timetable periods</span>
                <span className="font-medium text-foreground">
                  {importCounts.timetablePeriods}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Timetable classes</span>
                <span className="font-medium text-foreground">
                  {importCounts.timetableClasses}
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-border p-5">
              <button
                type="button"
                onClick={() => {
                  setShowImportConfirm(false);
                  setPendingBackup(null);
                }}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground transition hover:bg-muted"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmImport}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
              >
                Import
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}