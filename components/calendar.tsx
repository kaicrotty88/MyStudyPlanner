"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
} from "lucide-react";

import type { Reminder, StudySession, Subject, Task } from "./models";

type ViewMode = "day" | "week" | "month";
type AddFormType = "study" | "task" | "assignment" | "exam" | "homework" | "reminder" | null;

const PERIODS_STORAGE_KEY = "mystudyplanner-periods";
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;
const HOUR_HEIGHT = 64;

type PeriodStored = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type PeriodHydrated = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

type CalendarItemKind = "task" | "assignment" | "exam" | "homework" | "study" | "reminder";
type CalendarItemPlacement = "timed" | "all-day" | "due";

type CalendarItem = {
  id: string;
  sourceId: string;
  kind: CalendarItemKind;
  placement: CalendarItemPlacement;
  title: string;
  subjectId?: string;
  start: Date;
  end?: Date;
  timeLabel?: string;
  durationLabel?: string;
  task?: Task;
  session?: StudySession;
  reminder?: Reminder;
};

interface CalendarProps {
  studySessions: StudySession[];
  tasks: Task[];
  reminders: Reminder[];
  subjects: Subject[];

  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask?: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask?: (id: string) => void;

  onToggleTaskCompleted?: (taskId: string) => void;
  onToggleStudySessionCompleted?: (sessionId: string) => void;
  onToggleReminderCompleted?: (reminderId: string) => void;

  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession?: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession?: (id: string) => void;

  onAddReminder: (reminder: Omit<Reminder, "id">) => void;
  onUpdateReminder?: (id: string, reminder: Omit<Reminder, "id">) => void;
  onDeleteReminder?: (id: string) => void;
}

type TaskFormErrors = Partial<
  Record<"title" | "subjectId" | "dueDate" | "scheduledDate" | "startTime" | "duration", string>
>;
type SessionFormErrors = Partial<Record<"title" | "subjectId" | "date" | "startTime" | "duration", string>>;
type ReminderFormErrors = Partial<Record<"title" | "dueDate", string>>;

const RequiredMark = ({ required }: { required?: boolean }) =>
  required ? <span className="ml-1 text-red-500" aria-hidden="true">*</span> : null;

const FieldError = ({ message }: { message?: string }) =>
  message ? <div className="mt-1 text-xs text-red-600">{message}</div> : null;

const labelClass = "text-sm font-medium text-foreground";

const inputBase =
  "w-full rounded-xl border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

const inputOk = "border-border";
const inputErr = "border-red-500/50 focus-visible:ring-red-500/20";

const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (date: Date, days: number) => {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
};

const startOfWeek = (d: Date) => {
  const x = startOfDay(d);
  x.setDate(x.getDate() - x.getDay());
  return x;
};

const endOfWeek = (d: Date) => addDays(startOfWeek(d), 6);

const startOfWeekMonday = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay();
  const diff = (day + 6) % 7;
  x.setDate(x.getDate() - diff);
  return x;
};

const inRangeInclusive = (t: Date, a: Date, b: Date) => {
  const tt = startOfDay(t).getTime();
  const aa = startOfDay(a).getTime();
  const bb = startOfDay(b).getTime();
  return tt >= aa && tt <= bb;
};

const weekOfTerm = (today: Date, termStart: Date) => {
  const wsToday = startOfWeekMonday(today).getTime();
  const wsStart = startOfWeekMonday(termStart).getTime();
  const diffWeeks = Math.floor((wsToday - wsStart) / (7 * 24 * 60 * 60 * 1000));
  return diffWeeks + 1;
};

const findMatchingPeriodId = (dueDate: Date, periods: PeriodHydrated[]): string | undefined => {
  const t = startOfDay(dueDate).getTime();

  for (const p of periods) {
    const a = startOfDay(p.startDate).getTime();
    const b = startOfDay(p.endDate).getTime();

    if (t >= a && t <= b) return p.id;
  }

  return undefined;
};

function typeLabel(t: Task["type"]) {
  if (t === "assignment") return "Assignment";
  if (t === "exam") return "Exam";
  if (t === "homework") return "Homework";
  return "Task";
}

const time24To12 = (t: string) => {
  if (!t) return "";

  const [hhRaw, mmRaw] = t.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);

  if (Number.isNaN(hh) || Number.isNaN(mm)) return "";

  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;

  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
};

const time12To24 = (t: string) => {
  if (!t) return "";

  const s = t.trim().toUpperCase();

  if (/^\d{2}:\d{2}$/.test(s)) return s;

  const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/);
  if (!m) return "";

  let h = Number(m[1]);
  const mins = Number(m[2] ?? "0");
  const ap = m[3];

  if (Number.isNaN(h) || Number.isNaN(mins)) return "";

  h = Math.max(1, Math.min(12, h));

  let hh = h % 12;
  if (ap === "PM") hh += 12;

  return `${String(hh).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const displayTime = (t?: string) => {
  const s = (t ?? "").trim();
  if (!s) return "";
  if (/^\d{2}:\d{2}$/.test(s)) return time24To12(s);
  return s;
};

const parseTimeToMinutes = (value?: string) => {
  if (!value) return null;

  const raw = value.trim();
  const as24 = /^\d{2}:\d{2}$/.test(raw) ? raw : time12To24(raw);

  if (!as24) return null;

  const [hhRaw, mmRaw] = as24.split(":");
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);

  if (Number.isNaN(hh) || Number.isNaN(mm)) return null;

  return hh * 60 + mm;
};

const parseDurationToMinutes = (value?: string) => {
  if (!value) return 60;

  const s = value.toLowerCase().trim();

  const hourMatch = s.match(/(\d+(?:\.\d+)?)\s*h/);
  const minMatch = s.match(/(\d+)\s*m/);

  let total = 0;

  if (hourMatch) total += Number(hourMatch[1]) * 60;
  if (minMatch) total += Number(minMatch[1]);

  if (!hourMatch && !minMatch) {
    const onlyNumber = Number(s.replace(/[^\d.]/g, ""));
    if (!Number.isNaN(onlyNumber) && onlyNumber > 0) total = onlyNumber;
  }

  return total > 0 ? Math.round(total) : 60;
};

const dateWithMinutes = (date: Date, minutes: number) => {
  const d = startOfDay(date);
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
};

const itemStartMinutes = (item: CalendarItem) =>
  item.start.getHours() * 60 + item.start.getMinutes();

const itemEndMinutes = (item: CalendarItem) => {
  if (!item.end) return itemStartMinutes(item) + 60;
  return item.end.getHours() * 60 + item.end.getMinutes();
};

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const DURATION_OPTIONS: { label: string; value: string }[] = [
  { label: "15 min", value: "15 min" },
  { label: "20 min", value: "20 min" },
  { label: "30 min", value: "30 min" },
  { label: "45 min", value: "45 min" },
  { label: "60 min", value: "60 min" },
  { label: "1h 15m", value: "1h 15m" },
  { label: "1h 30m", value: "1h 30m" },
  { label: "1h 45m", value: "1h 45m" },
  { label: "2h", value: "2h" },
  { label: "2h 30m", value: "2h 30m" },
  { label: "3h", value: "3h" },
];

const CalendarShell = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">{children}</div>
);

const SwitchPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={[
      "rounded-lg px-3 py-1.5 text-sm font-medium transition",
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:bg-muted hover:text-foreground",
    ].join(" ")}
    type="button"
  >
    {label}
  </button>
);

function CalendarView({
  studySessions,
  tasks,
  reminders,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskCompleted,
  onToggleStudySessionCompleted,
  onToggleReminderCompleted,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const timeGridScrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);

  const addMenuRef = useRef<HTMLDivElement>(null);

  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
    type: "task" as "task" | "assignment" | "exam" | "homework",
    scheduledDate: "",
    startTime: "",
    duration: "60 min",
  });

  const [sessionFormData, setSessionFormData] = useState({
    title: "",
    subjectId: "",
    date: "",
    startTime: "",
    duration: "60 min",
    linkedTaskId: "",
  });

  const [reminderFormData, setReminderFormData] = useState({
    title: "",
    dueDate: "",
    time: "",
  });

  const [taskErrors, setTaskErrors] = useState<TaskFormErrors>({});
  const [sessionErrors, setSessionErrors] = useState<SessionFormErrors>({});
  const [reminderErrors, setReminderErrors] = useState<ReminderFormErrors>({});

  const canEditDeleteTasks = Boolean(onUpdateTask && onDeleteTask);
  const canEditDeleteSessions = Boolean(onUpdateStudySession && onDeleteStudySession);
  const canEditDeleteReminders = Boolean(onUpdateReminder && onDeleteReminder);

  useEffect(() => {
    const interval = window.setInterval(() => setNow(new Date()), 60 * 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);

      if (!raw) {
        setPeriods([]);
        return;
      }

      const parsed = JSON.parse(raw) as PeriodStored[];

      const hydrated: PeriodHydrated[] = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));

      hydrated.sort(
        (a, b) => startOfDay(a.startDate).getTime() - startOfDay(b.startDate).getTime()
      );

      setPeriods(hydrated);
    } catch {
      setPeriods([]);
    }
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleCancel();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const termWeekLabel = useMemo(() => {
    if (periods.length === 0) return undefined;

    const active = periods.find((p) => inRangeInclusive(currentDate, p.startDate, p.endDate));
    if (!active) return undefined;

    const wk = weekOfTerm(currentDate, active.startDate);

    return `${active.name} · Week ${wk}`;
  }, [currentDate, periods]);

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const taskById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  const activeTasks = useMemo(() => tasks.filter((t: any) => !t.completed), [tasks]);
  const activeSessions = useMemo(() => studySessions.filter((s: any) => !s.completed), [studySessions]);
  const activeReminders = useMemo(() => reminders.filter((r: any) => !r.completed), [reminders]);

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const taskItems: CalendarItem[] = activeTasks.flatMap((task) => {
      const scheduledDate = task.scheduledDate;
      const hasScheduledBlock = Boolean(scheduledDate && task.startTime);
      const scheduledStartMins = hasScheduledBlock ? parseTimeToMinutes(task.startTime) : null;
      const durationMins = parseDurationToMinutes(task.duration);
      const items: CalendarItem[] = [];

      if (hasScheduledBlock && scheduledStartMins !== null && scheduledDate) {
        const start = dateWithMinutes(scheduledDate, scheduledStartMins);
        const end = dateWithMinutes(scheduledDate, scheduledStartMins + durationMins);

        items.push({
          id: `task-timed-${task.id}`,
          sourceId: task.id,
          kind: task.type,
          placement: "timed",
          title: task.title,
          subjectId: task.subjectId,
          start,
          end,
          timeLabel: displayTime(task.startTime),
          durationLabel: task.duration || "60 min",
          task,
        });
      }

      const shouldShowDueItem =
        !hasScheduledBlock ||
        !scheduledDate ||
        !isSameDay(startOfDay(task.dueDate), startOfDay(scheduledDate));

      if (shouldShowDueItem) {
        items.push({
          id: `task-due-${task.id}`,
          sourceId: task.id,
          kind: task.type,
          placement: "due",
          title: task.title,
          subjectId: task.subjectId,
          start: startOfDay(task.dueDate),
          task,
        });
      }

      return items;
    });

    const sessionItems: CalendarItem[] = activeSessions.map((session) => {
      const startMins = parseTimeToMinutes(session.startTime) ?? 16 * 60;
      const durationMins = parseDurationToMinutes(session.duration);
      const start = dateWithMinutes(session.date, startMins);
      const end = dateWithMinutes(session.date, startMins + durationMins);

      return {
        id: `study-${session.id}`,
        sourceId: session.id,
        kind: "study",
        placement: "timed",
        title: session.title || "Study Session",
        subjectId: session.subjectId,
        start,
        end,
        timeLabel: displayTime(session.startTime),
        durationLabel: session.duration,
        session,
      };
    });

    const reminderItems: CalendarItem[] = activeReminders
      .filter((reminder) => reminder.dueDate)
      .map((reminder) => {
        const hasTime = Boolean(reminder.time);
        const startMins = parseTimeToMinutes(reminder.time) ?? 9 * 60;
        const start = dateWithMinutes(reminder.dueDate as Date, startMins);
        const end = dateWithMinutes(reminder.dueDate as Date, startMins + 30);

        return {
          id: `reminder-${reminder.id}`,
          sourceId: reminder.id,
          kind: "reminder",
          placement: hasTime ? "timed" : "all-day",
          title: reminder.title || "Reminder",
          start,
          end,
          timeLabel: reminder.time ? time24To12(reminder.time) : undefined,
          reminder,
        };
      });

    return [...taskItems, ...sessionItems, ...reminderItems].sort((a, b) => {
      const dayDiff = startOfDay(a.start).getTime() - startOfDay(b.start).getTime();
      if (dayDiff !== 0) return dayDiff;

      const placementOrder: Record<CalendarItemPlacement, number> = {
        "all-day": 0,
        due: 1,
        timed: 2,
      };

      const placementDiff = placementOrder[a.placement] - placementOrder[b.placement];
      if (placementDiff !== 0) return placementDiff;

      return a.start.getTime() - b.start.getTime();
    });
  }, [activeTasks, activeSessions, activeReminders]);

  const linkableTasks = useMemo(() => {
    return activeTasks
      .filter((t) => (sessionFormData.subjectId ? t.subjectId === sessionFormData.subjectId : true))
      .slice()
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [activeTasks, sessionFormData.subjectId]);

  const currentLinkedTask = useMemo(() => {
    const id = (sessionFormData.linkedTaskId ?? "").trim();
    if (!id) return null;
    return taskById.get(id) ?? null;
  }, [sessionFormData.linkedTaskId, taskById]);

  const startTimeUiValue = useMemo(() => {
    const s = (sessionFormData.startTime ?? "").trim();
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    return time12To24(s);
  }, [sessionFormData.startTime]);

  const taskStartTimeUiValue = useMemo(() => {
    const s = (taskFormData.startTime ?? "").trim();
    if (/^\d{2}:\d{2}$/.test(s)) return s;
    return time12To24(s);
  }, [taskFormData.startTime]);

  const clearError = <T extends Record<string, string | undefined>>(
    setFn: React.Dispatch<React.SetStateAction<T>>,
    key: keyof T
  ) => {
    setFn((e) => {
      if (!e[key]) return e;

      const copy = { ...e };
      delete copy[key];

      return copy;
    });
  };

  const getItemsForDate = (date: Date) =>
    calendarItems.filter((item) => isSameDay(item.start, date));

  const getHeaderLabel = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }

    if (viewMode === "week") {
      const s = startOfWeek(currentDate);
      const e = endOfWeek(currentDate);

      return `${s.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} – ${e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }

    return currentDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (viewMode === "month") {
      setCurrentDate(
        new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() + (direction === "next" ? 1 : -1),
          1
        )
      );
      return;
    }

    if (viewMode === "week") {
      setCurrentDate(addDays(currentDate, direction === "next" ? 7 : -7));
      return;
    }

    setCurrentDate(addDays(currentDate, direction === "next" ? 1 : -1));
  };

  const openAddMenuForDate = (date: Date) => {
    setSelectedDate(date);
    setShowAddMenu(true);
  };

  const closeAddMenu = () => {
    setShowAddMenu(false);
    setSelectedDate(null);
  };

  const closeForm = () => {
    setShowAddForm(null);
    setSelectedDate(null);
  };

  const handleAddOption = (type: AddFormType) => {
    if (!selectedDate) return;

    const dateStr = toLocalDateInputValue(selectedDate);

    setEditingTaskId(null);
    setEditingSessionId(null);
    setEditingReminderId(null);

    setTaskErrors({});
    setSessionErrors({});
    setReminderErrors({});

    if (type === "study") {
      setSessionFormData({
        title: "",
        subjectId: "",
        date: dateStr,
        startTime: "4:00 PM",
        duration: "60 min",
        linkedTaskId: "",
      });
    } else if (type === "reminder") {
      setReminderFormData({
        title: "",
        dueDate: dateStr,
        time: "",
      });
    } else {
      setTaskFormData({
        title: "",
        subjectId: "",
        dueDate: dateStr,
        type: type as "task" | "assignment" | "exam" | "homework",
        scheduledDate: "",
        startTime: "",
        duration: "60 min",
      });
    }

    setShowAddForm(type);
    setShowAddMenu(false);
  };

  const openEditTask = (task: Task) => {
    if (!canEditDeleteTasks) return;

    setEditingTaskId(task.id);
    setSelectedDate(task.scheduledDate ?? task.dueDate);
    setTaskErrors({});

    setTaskFormData({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: toLocalDateInputValue(task.dueDate),
      type: task.type,
      scheduledDate: task.scheduledDate ? toLocalDateInputValue(task.scheduledDate) : "",
      startTime: task.startTime ?? "",
      duration: task.duration ?? "60 min",
    });

    setShowAddForm(task.type);
    setShowAddMenu(false);
  };

  const openEditSession = (session: StudySession) => {
    if (!canEditDeleteSessions) return;

    setEditingSessionId(session.id);
    setSelectedDate(session.date);
    setSessionErrors({});

    setSessionFormData({
      title: session.title ?? "",
      subjectId: session.subjectId,
      date: toLocalDateInputValue(session.date),
      startTime: session.startTime ?? "",
      duration: session.duration ?? "60 min",
      linkedTaskId: session.linkedTaskId ?? "",
    });

    setShowAddForm("study");
    setShowAddMenu(false);
  };

  const openEditReminder = (reminder: Reminder) => {
    if (!canEditDeleteReminders) return;
    if (!reminder.dueDate) return;

    setEditingReminderId(reminder.id);
    setSelectedDate(reminder.dueDate);
    setReminderErrors({});

    setReminderFormData({
      title: reminder.title ?? "",
      dueDate: toLocalDateInputValue(reminder.dueDate),
      time: reminder.time ?? "",
    });

    setShowAddForm("reminder");
    setShowAddMenu(false);
  };

  const openCalendarItem = (item: CalendarItem) => {
    if (item.task) openEditTask(item.task);
    else if (item.session) openEditSession(item.session);
    else if (item.reminder) openEditReminder(item.reminder);
  };

  const validateTaskForm = () => {
    const next: TaskFormErrors = {};

    if (!taskFormData.title.trim()) next.title = "Title is required";
    if (!taskFormData.subjectId) next.subjectId = "Subject is required";
    if (!taskFormData.dueDate) next.dueDate = "Due date is required";

    const hasScheduledDate = Boolean(taskFormData.scheduledDate);
    const hasStartTime = Boolean(taskFormData.startTime);
    const hasDuration = Boolean(taskFormData.duration);

    if ((hasScheduledDate || hasStartTime) && !hasScheduledDate) {
      next.scheduledDate = "Scheduled date is required when adding a time block";
    }

    if ((hasScheduledDate || hasStartTime) && !hasStartTime) {
      next.startTime = "Start time is required when adding a scheduled block";
    }

    if ((hasScheduledDate || hasStartTime) && !hasDuration) {
      next.duration = "Duration is required when adding a scheduled block";
    }

    setTaskErrors(next);

    return Object.keys(next).length === 0;
  };

  const validateSessionForm = () => {
    const next: SessionFormErrors = {};

    if (!sessionFormData.title.trim()) next.title = "Title is required";
    if (!sessionFormData.subjectId) next.subjectId = "Subject is required";
    if (!sessionFormData.date) next.date = "Date is required";
    if (!sessionFormData.startTime.trim()) next.startTime = "Start time is required";
    if (!sessionFormData.duration.trim()) next.duration = "Duration is required";

    setSessionErrors(next);

    return Object.keys(next).length === 0;
  };

  const validateReminderForm = () => {
    const next: ReminderFormErrors = {};

    if (!reminderFormData.title.trim()) next.title = "Title is required";
    if (!reminderFormData.dueDate) next.dueDate = "Date is required";

    setReminderErrors(next);

    return Object.keys(next).length === 0;
  };

  const handleTaskSubmit = () => {
    if (!validateTaskForm()) return;

    const newDueDate = new Date(taskFormData.dueDate);
    const nextScheduledDate = taskFormData.scheduledDate
      ? new Date(taskFormData.scheduledDate)
      : undefined;
    const nextStartTime = taskFormData.startTime?.trim()
      ? taskFormData.startTime.trim()
      : undefined;
    const nextDuration =
      nextScheduledDate && nextStartTime
        ? taskFormData.duration?.trim() || "60 min"
        : undefined;

    if (editingTaskId && onUpdateTask) {
      const existing = tasks.find((t) => t.id === editingTaskId);

      const dueChanged =
        existing?.dueDate &&
        startOfDay(existing.dueDate).getTime() !== startOfDay(newDueDate).getTime();

      const computedPeriodId = findMatchingPeriodId(newDueDate, periods);
      const nextPeriodId = dueChanged ? computedPeriodId : existing?.periodId;

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title.trim(),
        subjectId: taskFormData.subjectId,
        dueDate: newDueDate,
        type: taskFormData.type,
        scheduledDate: nextScheduledDate,
        startTime: nextStartTime,
        duration: nextDuration,
        completed: existing?.completed,
        completedAt: existing?.completedAt,
        periodId: nextPeriodId,
        result: existing?.result,
        repeat: existing?.repeat,
        repeatUntil: existing?.repeatUntil,
      };

      onUpdateTask(editingTaskId, payload);
    } else {
      const computedPeriodId = findMatchingPeriodId(newDueDate, periods);

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title.trim(),
        subjectId: taskFormData.subjectId,
        dueDate: newDueDate,
        type: taskFormData.type,
        scheduledDate: nextScheduledDate,
        startTime: nextStartTime,
        duration: nextDuration,
        periodId: computedPeriodId,
      };

      onAddTask(payload);
    }

    setEditingTaskId(null);
    setTaskFormData({
      title: "",
      subjectId: "",
      dueDate: "",
      type: "task",
      scheduledDate: "",
      startTime: "",
      duration: "60 min",
    });
    setShowAddForm(null);
    closeForm();
  };

  const handleSessionSubmit = () => {
    if (!validateSessionForm()) return;

    const payload: Omit<StudySession, "id"> = {
      title: sessionFormData.title.trim(),
      subjectId: sessionFormData.subjectId,
      date: new Date(sessionFormData.date),
      startTime: sessionFormData.startTime,
      duration: sessionFormData.duration,
      linkedTaskId: sessionFormData.linkedTaskId || undefined,
      ...(editingSessionId
        ? (() => {
            const current = studySessions.find((x) => x.id === editingSessionId);
            return {
              completed: current?.completed,
              completedAt: current?.completedAt,
            };
          })()
        : {}),
    };

    if (editingSessionId && onUpdateStudySession) {
      onUpdateStudySession(editingSessionId, payload);
    } else {
      onAddStudySession(payload);
    }

    setEditingSessionId(null);
    setSessionFormData({
      title: "",
      subjectId: "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
    setShowAddForm(null);
    closeForm();
  };

  const handleReminderSubmit = () => {
    if (!validateReminderForm()) return;

    const newDueDate = new Date(reminderFormData.dueDate);
    const trimmedTitle = reminderFormData.title.trim();

    if (!trimmedTitle) return;

    const existing = editingReminderId
      ? reminders.find((r) => r.id === editingReminderId)
      : undefined;

    const payload: Omit<Reminder, "id"> = {
      title: trimmedTitle,
      dueDate: newDueDate,
      time: reminderFormData.time?.trim() ? reminderFormData.time.trim() : undefined,
      ...(editingReminderId
        ? {
            notes: existing?.notes,
            repeat: existing?.repeat,
            completed: existing?.completed,
            completedAt: existing?.completedAt,
            createdAt: existing?.createdAt,
          }
        : {}),
    };

    if (editingReminderId && onUpdateReminder) {
      onUpdateReminder(editingReminderId, payload);
    } else {
      onAddReminder(payload);
    }

    setEditingReminderId(null);
    setReminderFormData({ title: "", dueDate: "", time: "" });
    setShowAddForm(null);
    closeForm();
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setShowAddMenu(false);
    setSelectedDate(null);

    setEditingTaskId(null);
    setEditingSessionId(null);
    setEditingReminderId(null);

    setTaskErrors({});
    setSessionErrors({});
    setReminderErrors({});

    setTaskFormData({
      title: "",
      subjectId: "",
      dueDate: "",
      type: "task",
      scheduledDate: "",
      startTime: "",
      duration: "60 min",
    });
    setSessionFormData({
      title: "",
      subjectId: "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
    setReminderFormData({ title: "", dueDate: "", time: "" });
  };

  const handleToggleItem = (event: React.MouseEvent, item: CalendarItem) => {
    event.stopPropagation();

    if (item.task && onToggleTaskCompleted) onToggleTaskCompleted(item.task.id);
    else if (item.session && onToggleStudySessionCompleted) onToggleStudySessionCompleted(item.session.id);
    else if (item.reminder && onToggleReminderCompleted) onToggleReminderCompleted(item.reminder.id);
  };

  const getItemColor = (item: CalendarItem) => {
    if (item.kind === "exam") return "#ef4444";
    if (item.kind === "assignment") return "#f59e0b";
    if (item.kind === "homework") return "#3b82f6";
    if (item.kind === "reminder") return "#64748b";

    const subject = item.subjectId ? subjectById.get(item.subjectId) : undefined;

    return subject?.color ?? "#6366f1";
  };

  const getItemLabel = (item: CalendarItem) => {
    if (item.kind === "study") return "Study";
    if (item.kind === "reminder") return "Reminder";
    if (item.task) return typeLabel(item.task.type);
    return "Item";
  };

  const visibleWeekDays = useMemo(() => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, index) => addDays(start, index));
  }, [currentDate]);

  const getAutoScrollTargetMinutes = () => {
    const today = startOfDay(now);

    if (viewMode === "day") {
      if (isSameDay(currentDate, today)) {
        return now.getHours() * 60 + now.getMinutes();
      }

      const firstTimed = getItemsForDate(currentDate)
        .filter((item) => item.placement === "timed")
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      return firstTimed ? itemStartMinutes(firstTimed) : 9 * 60;
    }

    const weekHasToday = visibleWeekDays.some((day) => isSameDay(day, today));

    if (weekHasToday) {
      return now.getHours() * 60 + now.getMinutes();
    }

    const weekTimedItems = visibleWeekDays
      .flatMap((day) => getItemsForDate(day))
      .filter((item) => item.placement === "timed")
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return weekTimedItems[0] ? itemStartMinutes(weekTimedItems[0]) : 9 * 60;
  };

  useEffect(() => {
    if (viewMode === "month") return;

    const target = getAutoScrollTargetMinutes();
    const rawTop = ((target - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT - 160;
    const maxTop = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

    window.setTimeout(() => {
      if (!timeGridScrollRef.current) return;

      timeGridScrollRef.current.scrollTop = clamp(rawTop, 0, maxTop);
    }, 0);
  }, [viewMode, currentDate, calendarItems.length]);

  const renderMonthItem = (item: CalendarItem) => {
    const color = getItemColor(item);
    const isTimed = item.placement === "timed";

    return (
      <button
        key={item.id}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openCalendarItem(item);
        }}
        className={[
          "group flex h-[22px] min-w-0 items-center gap-1.5 rounded-md px-1.5 text-left text-[11px] leading-none",
          "transition hover:brightness-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        ].join(" ")}
        style={{
          backgroundColor: `${color}14`,
          color,
        }}
        title={`${getItemLabel(item)}: ${item.title}`}
      >
        {isTimed ? (
          <span className="shrink-0 font-semibold text-[10px]" style={{ color }}>
            {item.timeLabel}
          </span>
        ) : null}

        {!isTimed ? (
          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
        ) : null}

        <span className="truncate font-medium text-foreground">{item.title}</span>
      </button>
    );
  };

  const renderCompactItem = (item: CalendarItem, compact = false) => {
    const color = getItemColor(item);
    const canToggle =
      Boolean(item.task && onToggleTaskCompleted) ||
      Boolean(item.session && onToggleStudySessionCompleted) ||
      Boolean(item.reminder && onToggleReminderCompleted);

    return (
      <button
        key={item.id}
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          openCalendarItem(item);
        }}
        className={[
          "group flex min-w-0 items-center gap-2 rounded-lg border bg-background/70 px-2 py-1.5 text-left",
          "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition hover:bg-muted/60",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          compact ? "h-7" : "min-h-8",
        ].join(" ")}
        style={{ borderLeftWidth: 4, borderLeftColor: color }}
        title={`${getItemLabel(item)}: ${item.title}`}
      >
        {canToggle ? (
          <span
            role="button"
            tabIndex={0}
            onClick={(event) => handleToggleItem(event, item)}
            className="grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-card transition hover:bg-muted"
            aria-label="Mark complete"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition group-hover:opacity-60" />
          </span>
        ) : null}

        <div className="min-w-0 flex-1">
          <div className="truncate text-[11px] font-medium text-foreground">{item.title}</div>
          {!compact ? (
            <div className="truncate text-[10px] text-muted-foreground">{getItemLabel(item)}</div>
          ) : null}
        </div>
      </button>
    );
  };

  const renderTimedItem = (item: CalendarItem, dayColumn = false) => {
    const color = getItemColor(item);
    const start = Math.max(itemStartMinutes(item), DAY_START_HOUR * 60);
    const end = Math.min(itemEndMinutes(item), DAY_END_HOUR * 60);
    const top = ((start - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max(36, ((end - start) / 60) * HOUR_HEIGHT);

    const canToggle =
      Boolean(item.session && onToggleStudySessionCompleted) ||
      Boolean(item.reminder && onToggleReminderCompleted) ||
      Boolean(item.task && onToggleTaskCompleted);

    return (
      <div
        key={item.id}
        className="absolute left-1.5 right-1.5 z-10"
        style={{ top, height }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openCalendarItem(item);
          }}
          className={[
            "group h-full w-full overflow-hidden rounded-xl border bg-card px-2.5 py-1.5 text-left",
            "shadow-[0_4px_10px_rgba(0,0,0,0.07)] ring-1 ring-black/[0.02]",
            "transition hover:-translate-y-[1px] hover:shadow-[0_7px_14px_rgba(0,0,0,0.09)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          ].join(" ")}
          style={{
            borderLeftWidth: 4,
            borderLeftColor: color,
            backgroundColor: `${color}12`,
          }}
          title={`${getItemLabel(item)}: ${item.title}`}
        >
          <div className="flex min-w-0 items-start gap-1.5">
            {canToggle ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => handleToggleItem(event, item)}
                className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-border bg-card/70 transition hover:bg-muted"
                aria-label="Mark complete"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary opacity-0 transition group-hover:opacity-60" />
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <div
                className={[
                  "truncate font-semibold text-foreground",
                  dayColumn ? "text-xs" : "text-[11px]",
                ].join(" ")}
              >
                {item.title}
              </div>
              <div className="truncate text-[10px] text-muted-foreground">
                {item.timeLabel}
                {item.durationLabel ? ` · ${item.durationLabel}` : ""}
              </div>
            </div>
          </div>
        </button>
      </div>
    );
  };

  const renderHourGridLines = (hours: number[]) => (
    <div className="pointer-events-none absolute inset-0 z-0">
      {hours.slice(0, -1).map((hour) => (
        <div
          key={hour}
          className="relative border-b border-border/60"
          style={{ height: HOUR_HEIGHT }}
        >
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-border/35" />
        </div>
      ))}
    </div>
  );

  const renderCurrentTimeLine = (date: Date, wide = false) => {
    if (!isSameDay(date, now)) return null;

    const minutes = now.getHours() * 60 + now.getMinutes();

    if (minutes < DAY_START_HOUR * 60 || minutes > DAY_END_HOUR * 60) return null;

    const top = ((minutes - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;

    return (
      <div
        className="pointer-events-none absolute left-0 right-0 z-20 flex items-center"
        style={{ top }}
      >
        <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        <div className={["h-[2px] flex-1 bg-primary", wide ? "shadow-sm" : ""].join(" ")} />
      </div>
    );
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstOfMonth = new Date(year, month, 1);
    const gridStart = startOfWeek(firstOfMonth);

    const cells = Array.from({ length: 42 }, (_, index) => addDays(gridStart, index));

    return (
      <div>
        <div className="grid grid-cols-7 border-b border-border bg-muted/20">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const dayItems = getItemsForDate(date);
            const visible = dayItems.slice(0, 4);
            const hiddenCount = Math.max(0, dayItems.length - visible.length);

            const isToday = isSameDay(new Date(), date);
            const isOtherMonth = date.getMonth() !== month;

            return (
              <div
                key={date.toISOString()}
                onClick={() => openAddMenuForDate(date)}
                role="button"
                tabIndex={0}
                className={[
                  "min-h-[128px] cursor-pointer border-r border-b border-border p-1.5 text-left transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  isOtherMonth ? "bg-muted/10 text-muted-foreground" : "bg-card hover:bg-muted/25",
                  isToday ? "bg-primary/[0.04]" : "",
                ].join(" ")}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={[
                      "grid h-6 w-6 place-items-center rounded-full text-xs",
                      isToday ? "bg-primary text-primary-foreground font-semibold" : "text-foreground",
                      isOtherMonth && !isToday ? "text-muted-foreground" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>

                  {dayItems.length > 0 ? (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {dayItems.length}
                    </span>
                  ) : null}
                </div>

                <div className="space-y-1">
                  {visible.map(renderMonthItem)}

                  {hiddenCount > 0 ? (
                    <div className="px-1.5 pt-0.5 text-[11px] font-medium text-muted-foreground">
                      +{hiddenCount} more
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const days = visibleWeekDays;
    const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-card">
            <div className="border-r border-border" />

            {days.map((date) => {
              const isToday = isSameDay(new Date(), date);

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => openAddMenuForDate(date)}
                  className={[
                    "border-r border-border px-2 py-3 text-center transition hover:bg-muted/30",
                    isToday ? "bg-primary/[0.04]" : "",
                  ].join(" ")}
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div
                    className={[
                      "mx-auto mt-1 grid h-8 w-8 place-items-center rounded-full text-sm font-semibold",
                      isToday ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/10">
            <div className="border-r border-border px-2 py-2 text-[11px] font-medium text-muted-foreground">
              All-day
            </div>

            {days.map((date) => {
              const allDayItems = getItemsForDate(date).filter((item) => item.placement === "all-day");

              return (
                <div
                  key={date.toISOString()}
                  role="button"
                  tabIndex={0}
                  onClick={() => openAddMenuForDate(date)}
                  className="min-h-[54px] cursor-pointer border-r border-border p-1.5 text-left transition hover:bg-muted/30"
                >
                  <div className="space-y-1">
                    {allDayItems.slice(0, 2).map((item) => renderCompactItem(item, true))}

                    {allDayItems.length > 2 ? (
                      <div className="px-1 text-[11px] text-muted-foreground">
                        +{allDayItems.length - 2} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/[0.06]">
            <div className="border-r border-border px-2 py-2 text-[11px] font-medium text-muted-foreground">
              Due
            </div>

            {days.map((date) => {
              const dueItems = getItemsForDate(date).filter((item) => item.placement === "due");

              return (
                <div
                  key={date.toISOString()}
                  role="button"
                  tabIndex={0}
                  onClick={() => openAddMenuForDate(date)}
                  className="min-h-[74px] cursor-pointer border-r border-border p-1.5 text-left transition hover:bg-muted/30"
                >
                  <div className="space-y-1">
                    {dueItems.slice(0, 3).map((item) => renderCompactItem(item, true))}

                    {dueItems.length > 3 ? (
                      <div className="px-1 text-[11px] text-muted-foreground">
                        +{dueItems.length - 3} more
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            ref={timeGridScrollRef}
            className="max-h-[680px] overflow-y-auto"
          >
            <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))]">
              <div className="border-r border-border bg-card">
                {hours.slice(0, -1).map((hour) => (
                  <div
                    key={hour}
                    className="border-b border-border/60 pr-2 pt-1 text-right text-[11px] text-muted-foreground"
                    style={{ height: HOUR_HEIGHT }}
                  >
                    {time24To12(`${String(hour).padStart(2, "0")}:00`).replace(":00", "")}
                  </div>
                ))}
              </div>

              {days.map((date) => {
                const timedItems = getItemsForDate(date).filter((item) => item.placement === "timed");
                const isToday = isSameDay(new Date(), date);

                return (
                  <div
                    key={date.toISOString()}
                    role="button"
                    tabIndex={0}
                    onClick={() => openAddMenuForDate(date)}
                    className={[
                      "relative cursor-pointer border-r border-border bg-card text-left",
                      isToday ? "bg-primary/[0.025]" : "",
                    ].join(" ")}
                    style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT }}
                  >
                    {renderHourGridLines(hours)}
                    {renderCurrentTimeLine(date)}
                    {timedItems.map((item) => renderTimedItem(item))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDayView = () => {
    const items = getItemsForDate(currentDate);
    const allDayItems = items.filter((item) => item.placement === "all-day");
    const dueItems = items.filter((item) => item.placement === "due");
    const timedItems = items.filter((item) => item.placement === "timed");
    const hours = Array.from({ length: DAY_END_HOUR - DAY_START_HOUR + 1 }, (_, i) => DAY_START_HOUR + i);
    const isToday = isSameDay(new Date(), currentDate);

    return (
      <div>
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
              </div>
              <div className="mt-1 flex items-center gap-2">
                <div
                  className={[
                    "grid h-9 w-9 place-items-center rounded-full text-base font-semibold",
                    isToday ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-foreground",
                  ].join(" ")}
                >
                  {currentDate.getDate()}
                </div>
                <div className="text-lg font-semibold text-foreground">
                  {currentDate.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => openAddMenuForDate(currentDate)}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              Add item
            </button>
          </div>
        </div>

        <div className="border-b border-border bg-muted/10 px-5 py-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            All-day
          </div>

          {allDayItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {allDayItems.map((item) => renderCompactItem(item))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAddMenuForDate(currentDate)}
              className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/40"
            >
              No all-day items
            </button>
          )}
        </div>

        <div className="border-b border-border bg-muted/[0.06] px-5 py-3">
          <div className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            Due
          </div>

          {dueItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-1.5 md:grid-cols-2 xl:grid-cols-3">
              {dueItems.map((item) => renderCompactItem(item))}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => openAddMenuForDate(currentDate)}
              className="rounded-xl border border-dashed border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted/40"
            >
              No due items
            </button>
          )}
        </div>

        <div
          ref={timeGridScrollRef}
          className="max-h-[720px] overflow-y-auto"
        >
          <div className="grid grid-cols-[72px_minmax(0,1fr)]">
            <div className="border-r border-border bg-card">
              {hours.slice(0, -1).map((hour) => (
                <div
                  key={hour}
                  className="border-b border-border/60 pr-3 pt-1 text-right text-[11px] text-muted-foreground"
                  style={{ height: HOUR_HEIGHT }}
                >
                  {time24To12(`${String(hour).padStart(2, "0")}:00`).replace(":00", "")}
                </div>
              ))}
            </div>

            <div
              role="button"
              tabIndex={0}
              onClick={() => openAddMenuForDate(currentDate)}
              className={[
                "relative cursor-pointer bg-card text-left",
                isToday ? "bg-primary/[0.025]" : "",
              ].join(" ")}
              style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT }}
            >
              {renderHourGridLines(hours)}
              {renderCurrentTimeLine(currentDate, true)}
              {timedItems.map((item) => renderTimedItem(item, true))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-5 px-4 py-7 sm:px-6 md:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
          <p className="text-sm text-muted-foreground">
            A central calendar for tasks, reminders, exams, homework, and study sessions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddMenuForDate(currentDate)}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      <CalendarShell>
        <div className="flex flex-col gap-3 border-b border-border bg-card px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleNavigate("prev")}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card transition hover:bg-muted"
              aria-label="Previous"
              type="button"
            >
              <ChevronLeft className="h-4 w-4 text-foreground" />
            </button>

            <button
              onClick={() => handleNavigate("next")}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-card transition hover:bg-muted"
              aria-label="Next"
              type="button"
            >
              <ChevronRight className="h-4 w-4 text-foreground" />
            </button>

            <div className="ml-2 min-w-[220px]">
              <div className="text-lg font-semibold text-foreground">{getHeaderLabel()}</div>
              {termWeekLabel ? (
                <div className="text-xs text-muted-foreground">{termWeekLabel}</div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl border border-border bg-muted/20 p-1">
              <SwitchPill label="Month" active={viewMode === "month"} onClick={() => setViewMode("month")} />
              <SwitchPill label="Week" active={viewMode === "week"} onClick={() => setViewMode("week")} />
              <SwitchPill label="Day" active={viewMode === "day"} onClick={() => setViewMode("day")} />
            </div>
          </div>
        </div>

        {viewMode === "month" ? renderMonthView() : null}
        {viewMode === "week" ? renderWeekView() : null}
        {viewMode === "day" ? renderDayView() : null}
      </CalendarShell>

      {showAddMenu && selectedDate ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closeAddMenu} />

          <div
            ref={addMenuRef}
            className="fixed left-1/2 top-1/2 z-50 w-[330px] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {selectedDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
                <div className="text-xs text-muted-foreground">Add something to this day</div>
              </div>

              <button
                onClick={closeAddMenu}
                className="grid h-8 w-8 place-items-center rounded-lg transition hover:bg-muted"
                aria-label="Close"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-2 p-3">
              <button
                onClick={() => handleAddOption("study")}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 transition hover:bg-background/70"
                type="button"
              >
                <span className="text-sm text-foreground">Add Study Session</span>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleAddOption("reminder")}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 transition hover:bg-background/70"
                type="button"
              >
                <span className="text-sm text-foreground">Add Reminder</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>

              {(["task", "assignment", "exam", "homework"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddOption(t)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 transition hover:bg-background/70"
                  type="button"
                >
                  <span className="text-sm text-foreground">Add {typeLabel(t)}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {showAddForm ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={handleCancel} />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">
                  {showAddForm === "study"
                    ? `${editingSessionId ? "Edit" : "Add"} Study Session`
                    : showAddForm === "reminder"
                      ? `${editingReminderId ? "Edit" : "Add"} Reminder`
                      : `${editingTaskId ? "Edit" : "Add"} ${typeLabel(showAddForm as Task["type"])}`}
                </div>

                <div className="text-xs text-muted-foreground">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : ""}
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="grid h-9 w-9 place-items-center rounded-lg transition hover:bg-muted"
                aria-label="Close"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              {showAddForm === "study" ? (
                <>
                  <div>
                    <label className={labelClass}>
                      Title
                      <RequiredMark required />
                    </label>
                    <input
                      type="text"
                      placeholder="Session title"
                      value={sessionFormData.title}
                      onChange={(e) => {
                        setSessionFormData({ ...sessionFormData, title: e.target.value });
                        clearError(setSessionErrors, "title");
                      }}
                      className={[inputBase, sessionErrors.title ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!sessionErrors.title}
                    />
                    <FieldError message={sessionErrors.title} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Subject
                      <RequiredMark required />
                    </label>
                    <select
                      value={sessionFormData.subjectId}
                      onChange={(e) => {
                        const nextSubjectId = e.target.value;
                        const linked = sessionFormData.linkedTaskId
                          ? taskById.get(sessionFormData.linkedTaskId)
                          : null;
                        const shouldClearLink = linked && linked.subjectId !== nextSubjectId;

                        setSessionFormData((p) => ({
                          ...p,
                          subjectId: nextSubjectId,
                          linkedTaskId: shouldClearLink ? "" : p.linkedTaskId,
                        }));

                        clearError(setSessionErrors, "subjectId");
                      }}
                      className={[inputBase, sessionErrors.subjectId ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!sessionErrors.subjectId}
                    >
                      <option value="">Select subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={sessionErrors.subjectId} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Link to task</label>
                    <select
                      value={sessionFormData.linkedTaskId}
                      onChange={(e) => {
                        const nextId = e.target.value;

                        if (!nextId) {
                          setSessionFormData((p) => ({ ...p, linkedTaskId: "" }));
                          return;
                        }

                        const linked = taskById.get(nextId);

                        if (!linked) {
                          setSessionFormData((p) => ({ ...p, linkedTaskId: "" }));
                          return;
                        }

                        setSessionFormData((p) => ({
                          ...p,
                          linkedTaskId: nextId,
                          subjectId: linked.subjectId,
                        }));

                        clearError(setSessionErrors, "subjectId");
                      }}
                      className={[inputBase, inputOk].join(" ")}
                    >
                      <option value="">Not linked</option>

                      {currentLinkedTask && (currentLinkedTask as any).completed ? (
                        <option value={currentLinkedTask.id} disabled>
                          {typeLabel(currentLinkedTask.type)} • {currentLinkedTask.title} (completed)
                        </option>
                      ) : null}

                      {linkableTasks.length === 0 ? (
                        <option value="" disabled>
                          No active tasks available
                        </option>
                      ) : (
                        linkableTasks.map((t) => {
                          const subj = subjectById.get(t.subjectId);
                          const subjName = subj?.name ?? "Unassigned";
                          const due = t.dueDate?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <option key={t.id} value={t.id}>
                              {typeLabel(t.type)} • {t.title} — {subjName} (due {due})
                            </option>
                          );
                        })
                      )}
                    </select>

                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Only active, not completed tasks are shown.
                    </div>
                  </div>

                  <div>
                    <label className={labelClass}>
                      Date
                      <RequiredMark required />
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </div>
                    <input
                      type="date"
                      value={sessionFormData.date}
                      onChange={(e) => {
                        setSessionFormData({ ...sessionFormData, date: e.target.value });
                        clearError(setSessionErrors, "date");
                      }}
                      className={[inputBase, sessionErrors.date ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!sessionErrors.date}
                    />
                    <FieldError message={sessionErrors.date} />
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div>
                      <label className={labelClass}>
                        Start time
                        <RequiredMark required />
                      </label>
                      <input
                        type="time"
                        value={startTimeUiValue}
                        onChange={(e) => {
                          setSessionFormData({
                            ...sessionFormData,
                            startTime: time24To12(e.target.value),
                          });
                          clearError(setSessionErrors, "startTime");
                        }}
                        className={[
                          "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                          sessionErrors.startTime
                            ? "border-red-500/50 focus-visible:ring-red-500/20"
                            : "border-border focus-visible:ring-primary/30",
                        ].join(" ")}
                        aria-invalid={!!sessionErrors.startTime}
                      />
                      <FieldError message={sessionErrors.startTime} />
                    </div>

                    <div>
                      <label className={labelClass}>
                        Duration
                        <RequiredMark required />
                      </label>
                      <select
                        value={sessionFormData.duration}
                        onChange={(e) => {
                          setSessionFormData({ ...sessionFormData, duration: e.target.value });
                          clearError(setSessionErrors, "duration");
                        }}
                        className={[
                          "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                          sessionErrors.duration
                            ? "border-red-500/50 focus-visible:ring-red-500/20"
                            : "border-border focus-visible:ring-primary/30",
                        ].join(" ")}
                        aria-invalid={!!sessionErrors.duration}
                      >
                        <option value="">Select duration</option>
                        {DURATION_OPTIONS.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                      <FieldError message={sessionErrors.duration} />
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingSessionId && onDeleteStudySession ? (
                      <button
                        onClick={() => {
                          onDeleteStudySession(editingSessionId);
                          handleCancel();
                        }}
                        className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                        type="button"
                      >
                        Delete
                      </button>
                    ) : null}

                    <button
                      onClick={handleSessionSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      type="button"
                    >
                      {editingSessionId ? "Save" : "Add"}
                    </button>

                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : showAddForm === "reminder" ? (
                <>
                  <div>
                    <label className={labelClass}>
                      Title
                      <RequiredMark required />
                    </label>
                    <input
                      type="text"
                      placeholder="Reminder title"
                      value={reminderFormData.title}
                      onChange={(e) => {
                        setReminderFormData({ ...reminderFormData, title: e.target.value });
                        clearError(setReminderErrors, "title");
                      }}
                      className={[inputBase, reminderErrors.title ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!reminderErrors.title}
                    />
                    <FieldError message={reminderErrors.title} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Date
                      <RequiredMark required />
                    </label>
                    <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </div>
                    <input
                      type="date"
                      value={reminderFormData.dueDate}
                      onChange={(e) => {
                        setReminderFormData({ ...reminderFormData, dueDate: e.target.value });
                        clearError(setReminderErrors, "dueDate");
                      }}
                      className={[inputBase, reminderErrors.dueDate ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!reminderErrors.dueDate}
                    />
                    <FieldError message={reminderErrors.dueDate} />
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground">Time</label>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Optional. Timed reminders appear in the hourly grid.
                    </div>
                    <input
                      type="time"
                      value={reminderFormData.time}
                      onChange={(e) =>
                        setReminderFormData({ ...reminderFormData, time: e.target.value })
                      }
                      className="h-11 w-full rounded-xl border border-border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingReminderId && onDeleteReminder ? (
                      <button
                        onClick={() => {
                          onDeleteReminder(editingReminderId);
                          handleCancel();
                        }}
                        className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                        type="button"
                      >
                        Delete
                      </button>
                    ) : null}

                    <button
                      onClick={handleReminderSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      type="button"
                    >
                      {editingReminderId ? "Save" : "Add"}
                    </button>

                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className={labelClass}>
                      Title
                      <RequiredMark required />
                    </label>
                    <input
                      type="text"
                      placeholder="Title"
                      value={taskFormData.title}
                      onChange={(e) => {
                        setTaskFormData({ ...taskFormData, title: e.target.value });
                        clearError(setTaskErrors, "title");
                      }}
                      className={[inputBase, taskErrors.title ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!taskErrors.title}
                    />
                    <FieldError message={taskErrors.title} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Subject
                      <RequiredMark required />
                    </label>
                    <select
                      value={taskFormData.subjectId}
                      onChange={(e) => {
                        setTaskFormData({ ...taskFormData, subjectId: e.target.value });
                        clearError(setTaskErrors, "subjectId");
                      }}
                      className={[inputBase, taskErrors.subjectId ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!taskErrors.subjectId}
                    >
                      <option value="">Select subject</option>
                      {subjects.map((subject) => (
                        <option key={subject.id} value={subject.id}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <FieldError message={taskErrors.subjectId} />
                  </div>

                  <div>
                    <label className={labelClass}>
                      Due date
                      <RequiredMark required />
                    </label>
                    <input
                      type="date"
                      value={taskFormData.dueDate}
                      onChange={(e) => {
                        setTaskFormData({ ...taskFormData, dueDate: e.target.value });
                        clearError(setTaskErrors, "dueDate");
                      }}
                      className={[inputBase, taskErrors.dueDate ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!taskErrors.dueDate}
                    />
                    <FieldError message={taskErrors.dueDate} />
                  </div>

                  <div className="rounded-2xl border border-border bg-muted/[0.08] p-4">
                    <div className="text-sm font-medium text-foreground">
                      Schedule on calendar
                    </div>
                    <div className="mt-1 text-xs leading-5 text-muted-foreground">
                      Optional. Use this for exams or planned task blocks that should appear in the hourly grid.
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-3">
                      <div>
                        <label className="text-sm font-medium text-foreground">Scheduled date</label>
                        <input
                          type="date"
                          value={taskFormData.scheduledDate}
                          onChange={(e) => {
                            setTaskFormData({ ...taskFormData, scheduledDate: e.target.value });
                            clearError(setTaskErrors, "scheduledDate");
                          }}
                          className={[inputBase, taskErrors.scheduledDate ? inputErr : inputOk].join(" ")}
                          aria-invalid={!!taskErrors.scheduledDate}
                        />
                        <FieldError message={taskErrors.scheduledDate} />
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="text-sm font-medium text-foreground">Start time</label>
                          <input
                            type="time"
                            value={taskStartTimeUiValue}
                            onChange={(e) => {
                              setTaskFormData({
                                ...taskFormData,
                                startTime: e.target.value,
                              });
                              clearError(setTaskErrors, "startTime");
                            }}
                            className={[
                              "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                              taskErrors.startTime
                                ? "border-red-500/50 focus-visible:ring-red-500/20"
                                : "border-border focus-visible:ring-primary/30",
                            ].join(" ")}
                            aria-invalid={!!taskErrors.startTime}
                          />
                          <FieldError message={taskErrors.startTime} />
                        </div>

                        <div>
                          <label className="text-sm font-medium text-foreground">Duration</label>
                          <select
                            value={taskFormData.duration}
                            onChange={(e) => {
                              setTaskFormData({ ...taskFormData, duration: e.target.value });
                              clearError(setTaskErrors, "duration");
                            }}
                            className={[
                              "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                              taskErrors.duration
                                ? "border-red-500/50 focus-visible:ring-red-500/20"
                                : "border-border focus-visible:ring-primary/30",
                            ].join(" ")}
                            aria-invalid={!!taskErrors.duration}
                          >
                            <option value="">Select duration</option>
                            {DURATION_OPTIONS.map((d) => (
                              <option key={d.value} value={d.value}>
                                {d.label}
                              </option>
                            ))}
                          </select>
                          <FieldError message={taskErrors.duration} />
                        </div>
                      </div>

                      {(taskFormData.scheduledDate || taskFormData.startTime) ? (
                        <button
                          type="button"
                          onClick={() =>
                            setTaskFormData({
                              ...taskFormData,
                              scheduledDate: "",
                              startTime: "",
                              duration: "60 min",
                            })
                          }
                          className="w-fit rounded-xl border border-border bg-card px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                        >
                          Clear scheduled time
                        </button>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    {editingTaskId && onDeleteTask ? (
                      <button
                        onClick={() => {
                          onDeleteTask(editingTaskId);
                          handleCancel();
                        }}
                        className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition hover:bg-destructive/90"
                        type="button"
                      >
                        Delete
                      </button>
                    ) : null}

                    <button
                      onClick={handleTaskSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                      type="button"
                    >
                      {editingTaskId ? "Save" : "Add"}
                    </button>

                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground transition hover:bg-muted"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export { CalendarView as Calendar };