"use client";

import React, { useEffect, useMemo, useRef, useState, JSX } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Plus,
} from "lucide-react";

import type { Subject, Task, StudySession, Reminder } from "./models";

type ViewMode = "day" | "week" | "month";
type AddFormType = "study" | "task" | "assignment" | "exam" | "homework" | "reminder" | null;

// Must match Settings + Tasks
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

type PeriodStored = {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
};

type PeriodHydrated = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

interface CalendarProps {
  studySessions: StudySession[];
  tasks: Task[];
  reminders: Reminder[];
  subjects: Subject[];

  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask?: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask?: (id: string) => void;

  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession?: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession?: (id: string) => void;

  onAddReminder: (reminder: Omit<Reminder, "id">) => void;
  onUpdateReminder?: (id: string, reminder: Omit<Reminder, "id">) => void;
  onDeleteReminder?: (id: string) => void;
}

/* -------------------- helpers -------------------- */
const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear();

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
};

const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

// Monday-start week (better for school week numbers)
const startOfWeekMonday = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay(); // 0=Sun..6=Sat
  const diff = (day + 6) % 7; // Mon=0, Tue=1, ... Sun=6
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
  return diffWeeks + 1; // Week 1 at start week
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

/* -------------------- Time formatting (UI) -------------------- */
// Convert "HH:MM" (24h) -> "h:mm AM/PM"
const time24To12 = (t: string) => {
  if (!t) return "";
  const [hh, mm] = t.split(":").map((x) => Number(x));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "";
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
};

// Convert "h:mm AM/PM" -> "HH:MM" (24h)
const time12To24 = (t: string) => {
  if (!t) return "";
  const s = t.trim().toUpperCase();

  // Matches: "4:00 PM", "4 PM", "12:15 AM"
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

const displaySessionTime = (t: string) => {
  const s = (t ?? "").trim();
  if (!s) return "";
  // If stored as 24h "HH:MM", display nicely
  if (/^\d{2}:\d{2}$/.test(s)) return time24To12(s);
  return s;
};

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

const lineClampStyle = (lines: number) => ({
  display: "-webkit-box",
  WebkitLineClamp: lines,
  WebkitBoxOrient: "vertical" as const,
  overflow: "hidden",
});

function CalendarView({
  studySessions,
  tasks,
  reminders,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
}: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPopover, setShowPopover] = useState(false);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // ✅ Load terms/periods from localStorage
  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);
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
      hydrated.sort((a, b) => startOfDay(a.startDate).getTime() - startOfDay(b.startDate).getTime());
      setPeriods(hydrated);
    } catch {
      setPeriods([]);
    }
  }, []);

  const periodNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of periods) map.set(p.id, p.name);
    return map;
  }, [periods]);

  const termWeekLabel = useMemo(() => {
    if (periods.length === 0) return undefined;

    const active = periods.find((p) => inRangeInclusive(currentDate, p.startDate, p.endDate));
    if (!active) return undefined;

    const wk = weekOfTerm(currentDate, active.startDate);
    return `${active.name} · Week ${wk}`;
  }, [currentDate, periods]);

  // tasks edit/delete
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  // sessions edit/delete
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

  // reminders edit/delete
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [deletingReminderId, setDeletingReminderId] = useState<string | null>(null);

  const canEditDeleteTasks = Boolean(onUpdateTask && onDeleteTask);
  const canEditDeleteSessions = Boolean(onUpdateStudySession && onDeleteStudySession);
  const canEditDeleteReminders = Boolean(onUpdateReminder && onDeleteReminder);

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
    type: "task" as "task" | "assignment" | "exam" | "homework",
  });

  // ✅ Study Sessions form
  const [sessionFormData, setSessionFormData] = useState({
    title: "",
    subjectId: "",
    date: "",
    startTime: "",
    duration: "60 min",
    linkedTaskId: "",
  });

  // ✅ Reminders form
  const [reminderFormData, setReminderFormData] = useState({
    title: "",
    dueDate: "",
    time: "",
  });

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

  const linkableAssessments = useMemo(() => {
    return tasks
      .filter((t) => t.type === "exam" || t.type === "assignment")
      .filter((t) => (sessionFormData.subjectId ? t.subjectId === sessionFormData.subjectId : true))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks, sessionFormData.subjectId]);

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };
  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };
  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const getItemsForDate = (date: Date) => {
    const dateTasks = tasks.filter((task) => isSameDay(task.dueDate, date));
    const dateSessions = studySessions.filter((session) => isSameDay(session.date, date));
    const dateReminders = reminders
      .filter((r) => !r.completed)
      .filter((r) => (r.dueDate ? isSameDay(r.dueDate, date) : false));

    return { tasks: dateTasks, sessions: dateSessions, reminders: dateReminders };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowPopover(true);
  };

  const handleAddOption = (type: AddFormType) => {
    if (!selectedDate) return;
    const dateStr = toLocalDateInputValue(selectedDate);

    setEditingTaskId(null);
    setEditingSessionId(null);
    setEditingReminderId(null);

    if (type === "study") {
      setSessionFormData({
        title: "",
        subjectId: "",
        date: dateStr,
        startTime: "",
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
      });
    }

    setShowAddForm(type);
    setShowPopover(false);
  };

  const openEditTask = (task: Task) => {
    if (!canEditDeleteTasks) return;

    setEditingTaskId(task.id);
    setSelectedDate(task.dueDate);

    setTaskFormData({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: toLocalDateInputValue(task.dueDate),
      type: task.type,
    });

    setShowAddForm(task.type);
    setShowPopover(false);
  };

  const openEditSession = (session: StudySession) => {
    if (!canEditDeleteSessions) return;

    setEditingSessionId(session.id);
    setSelectedDate(session.date);

    setSessionFormData({
      title: session.title ?? "",
      subjectId: session.subjectId,
      date: toLocalDateInputValue(session.date),
      startTime: session.startTime ?? "",
      duration: session.duration ?? "60 min",
      linkedTaskId: session.linkedTaskId ?? "",
    });

    setShowAddForm("study");
    setShowPopover(false);
  };

  const openEditReminder = (reminder: Reminder) => {
    if (!canEditDeleteReminders) return;
    if (!reminder.dueDate) return;

    setEditingReminderId(reminder.id);
    setSelectedDate(reminder.dueDate);

    setReminderFormData({
      title: reminder.title ?? "",
      dueDate: toLocalDateInputValue(reminder.dueDate),
      time: reminder.time ?? "",
    });

    setShowAddForm("reminder");
    setShowPopover(false);
  };

  const handleTaskSubmit = () => {
    if (!taskFormData.title || !taskFormData.subjectId || !taskFormData.dueDate) return;

    const newDueDate = new Date(taskFormData.dueDate);

    if (editingTaskId && onUpdateTask) {
      const existing = tasks.find((t) => t.id === editingTaskId);

      // Stable history: keep existing periodId unless due date changed.
      const dueChanged =
        existing?.dueDate && startOfDay(existing.dueDate).getTime() !== startOfDay(newDueDate).getTime();

      const computedPeriodId = findMatchingPeriodId(newDueDate, periods);
      const nextPeriodId = dueChanged ? computedPeriodId : existing?.periodId;

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title,
        subjectId: taskFormData.subjectId,
        dueDate: newDueDate,
        type: taskFormData.type,
        completed: existing?.completed,
        completedAt: existing?.completedAt,
        periodId: nextPeriodId,
        result: existing?.result,
      };

      onUpdateTask(editingTaskId, payload);
    } else {
      const computedPeriodId = findMatchingPeriodId(newDueDate, periods);

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title,
        subjectId: taskFormData.subjectId,
        dueDate: newDueDate,
        type: taskFormData.type,
        periodId: computedPeriodId,
      };

      onAddTask(payload);
    }

    setEditingTaskId(null);
    setTaskFormData({ title: "", subjectId: "", dueDate: "", type: "task" });
    setShowAddForm(null);
    setSelectedDate(null);
  };

  const handleSessionSubmit = () => {
    if (
      !sessionFormData.title ||
      !sessionFormData.subjectId ||
      !sessionFormData.date ||
      !sessionFormData.startTime ||
      !sessionFormData.duration
    )
      return;

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
            return { completed: current?.completed, completedAt: current?.completedAt };
          })()
        : {}),
    };

    if (editingSessionId && onUpdateStudySession) onUpdateStudySession(editingSessionId, payload);
    else onAddStudySession(payload);

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
    setSelectedDate(null);
  };

  const handleReminderSubmit = () => {
    if (!reminderFormData.title || !reminderFormData.dueDate) return;

    const newDueDate = new Date(reminderFormData.dueDate);
    const trimmedTitle = reminderFormData.title.trim();
    if (!trimmedTitle) return;

    const existing = editingReminderId ? reminders.find((r) => r.id === editingReminderId) : undefined;

    const payloadBase: Omit<Reminder, "id"> = {
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

    if (editingReminderId && onUpdateReminder) onUpdateReminder(editingReminderId, payloadBase);
    else onAddReminder(payloadBase);

    setEditingReminderId(null);
    setReminderFormData({ title: "", dueDate: "", time: "" });
    setShowAddForm(null);
    setSelectedDate(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setShowPopover(false);
    setSelectedDate(null);

    setEditingTaskId(null);
    setDeletingTaskId(null);

    setEditingSessionId(null);
    setDeletingSessionId(null);

    setEditingReminderId(null);
    setDeletingReminderId(null);

    setTaskFormData({ title: "", subjectId: "", dueDate: "", type: "task" });
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

  const SectionShell = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">{children}</div>
  );

  const SwitchPill = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm transition",
        active ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted border border-border bg-card",
      ].join(" ")}
      type="button"
    >
      {label}
    </button>
  );

  const TermPill = ({ label }: { label: string }) => (
    <span className="inline-flex items-center rounded-full border border-border bg-card px-2.5 py-1 text-[11px] text-muted-foreground">
      {label}
    </span>
  );

  const renderChip = ({
    title,
    subjectId,
    task,
    session,
    reminder,
    compact,
  }: {
    title: string;
    subjectId?: string;
    task?: Task;
    session?: StudySession;
    reminder?: Reminder;
    compact?: boolean;
  }) => {
    const subject = subjectId ? subjectById.get(subjectId) : undefined;
    const dot = subject?.color ?? "#94a3b8";
    const linkedTask = session?.linkedTaskId ? taskById.get(session.linkedTaskId) : undefined;

    const titleLines = compact ? 2 : 3;

    return (
      <div
        className="group relative flex items-start justify-between gap-2 rounded-lg border border-border bg-background/40 px-2 py-1.5 hover:bg-background/60 transition"
        style={{ borderLeftWidth: 3, borderLeftColor: dot }}
        title={title}
      >
        <div className="min-w-0 flex-1 pr-9">
          <div className="text-xs text-foreground leading-snug" style={lineClampStyle(titleLines)}>
            {title}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground min-w-0">
            {reminder ? (
              <>
                <span className="inline-flex items-center gap-1 min-w-0 flex-1">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  <span className="truncate">Reminder</span>
                </span>

                {reminder.time ? (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">•</span>
                    <span className="shrink-0">{time24To12(reminder.time)}</span>
                  </>
                ) : null}
              </>
            ) : (
              <>
                <span className="inline-flex items-center gap-1 min-w-0 flex-1">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  <span className="truncate">{subject?.name ?? "Unassigned"}</span>
                </span>

                {task ? (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">•</span>
                    <span className="shrink-0">{typeLabel(task.type)}</span>
                  </>
                ) : null}

                {session ? (
                  <>
                    <span className="text-muted-foreground/60 shrink-0">•</span>
                    <span className="shrink-0">
                      {displaySessionTime(session.startTime)} • {session.duration}
                    </span>

                    {!compact && linkedTask ? (
                      <>
                        <span className="text-muted-foreground/60 shrink-0">•</span>
                        <span className="truncate">Linked: {linkedTask.title}</span>
                      </>
                    ) : null}
                  </>
                ) : null}
              </>
            )}
          </div>
        </div>

        {task && canEditDeleteTasks ? (
          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditTask(task);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Edit task"
              type="button"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingTaskId(task.id);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Delete task"
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : null}

        {session && canEditDeleteSessions ? (
          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditSession(session);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Edit session"
              type="button"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingSessionId(session.id);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Delete session"
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : null}

        {reminder && canEditDeleteReminders ? (
          <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditReminder(reminder);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Edit reminder"
              type="button"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingReminderId(reminder.id);
              }}
              className="h-7 w-7 grid place-items-center rounded-md hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label="Delete reminder"
              type="button"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

    const weeks: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="min-h-[140px] p-2 bg-muted/20 border-r border-b border-border"
          aria-hidden="true"
        />
      );
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { tasks: dayTasks, sessions: daySessions, reminders: dayReminders } = getItemsForDate(date);

      const isToday = isSameDay(new Date(), date);
      const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;

      const previewItems = [
        ...dayTasks.map((t) => ({ kind: "task" as const, t })),
        ...daySessions.map((s) => ({ kind: "session" as const, s })),
        ...dayReminders.map((r) => ({ kind: "reminder" as const, r })),
      ].slice(0, 3);

      const totalCount = dayTasks.length + daySessions.length + dayReminders.length;

      const ariaLabel = `${date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
      })}. ${totalCount === 0 ? "No items." : `${totalCount} item${totalCount === 1 ? "" : "s"}.`}`;

      cells.push(
        <div
          key={day}
          role="button"
          tabIndex={0}
          aria-label={ariaLabel}
          onClick={() => handleDayClick(date)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleDayClick(date);
          }}
          className={[
            "min-h-[140px] text-left p-2 border-r border-b border-border hover:bg-muted/40 transition",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            "flex flex-col cursor-pointer bg-card",
            isToday ? "bg-primary/[0.04]" : "",
            isSelected ? "ring-1 ring-primary/30 ring-inset" : "",
          ].join(" ")}
        >
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div
              className={[
                "h-7 w-7 grid place-items-center rounded-full text-sm shrink-0",
                isToday ? "bg-primary/10 text-primary font-semibold" : "text-foreground",
                isSelected ? "ring-1 ring-primary/30" : "",
              ].join(" ")}
            >
              {day}
            </div>

            {isToday ? (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 whitespace-nowrap shrink-0">
                Today
              </span>
            ) : null}
          </div>

          <div className="mt-2 space-y-1 min-h-0">
            {previewItems.map((x, idx) => {
              if (x.kind === "task") {
                return (
                  <div key={x.t.id + idx} className="min-w-0">
                    {renderChip({ title: x.t.title, subjectId: x.t.subjectId, task: x.t, compact: true })}
                  </div>
                );
              }
              if (x.kind === "session") {
                return (
                  <div key={x.s.id + idx} className="min-w-0">
                    {renderChip({
                      title: x.s.title || "Study session",
                      subjectId: x.s.subjectId,
                      session: x.s,
                      compact: true,
                    })}
                  </div>
                );
              }
              return (
                <div key={x.r.id + idx} className="min-w-0">
                  {renderChip({
                    title: x.r.title || "Reminder",
                    reminder: x.r,
                    compact: true,
                  })}
                </div>
              );
            })}

            {totalCount > 3 ? (
              <div className="text-[11px] text-muted-foreground mt-1">+{totalCount - 3} more</div>
            ) : null}
          </div>
        </div>
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7">
            {cells}
          </div>
        );
        cells = [];
      }
    }

    return <div className="space-y-0">{weeks}</div>;
  };

  const renderWeekView = () => {
    const s = startOfWeek(currentDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      days.push(d);
    }

    return (
      <div className="grid grid-cols-7 border-t border-border">
        {days.map((date, i) => {
          const { tasks: dayTasks, sessions: daySessions, reminders: dayReminders } = getItemsForDate(date);
          const isToday = isSameDay(new Date(), date);
          const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;

          const ariaLabel = `${date.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}. ${dayTasks.length + daySessions.length + dayReminders.length} items.`;

          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              onClick={() => handleDayClick(date)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDayClick(date);
              }}
              className={[
                "min-h-[520px] p-3 text-left border-r border-border cursor-pointer transition",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                isToday ? "bg-primary/[0.04]" : "bg-card hover:bg-muted/40",
                isSelected ? "ring-1 ring-primary/30 ring-inset" : "",
              ].join(" ")}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    {date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </div>
                  <div className={["text-lg font-semibold", isToday ? "text-primary" : "text-foreground"].join(" ")}>
                    {date.getDate()}
                  </div>
                </div>
                {isToday ? (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Today
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {dayTasks.map((t) => (
                  <div key={t.id}>{renderChip({ title: t.title, subjectId: t.subjectId, task: t, compact: false })}</div>
                ))}
                {daySessions.map((sess) => (
                  <div key={sess.id}>
                    {renderChip({
                      title: sess.title || "Study session",
                      subjectId: sess.subjectId,
                      session: sess,
                      compact: false,
                    })}
                  </div>
                ))}
                {dayReminders.map((r) => (
                  <div key={r.id}>
                    {renderChip({
                      title: r.title || "Reminder",
                      reminder: r,
                      compact: false,
                    })}
                  </div>
                ))}

                {dayTasks.length === 0 && daySessions.length === 0 && dayReminders.length === 0 ? (
                  <div className="mt-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl p-3 bg-background/30">
                    Empty
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const { tasks: dayTasks, sessions: daySessions, reminders: dayReminders } = getItemsForDate(currentDate);
    const isToday = isSameDay(new Date(), currentDate);

    return (
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">
              {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </div>
          </div>
          {isToday ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Today
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {dayTasks.length === 0 && daySessions.length === 0 && dayReminders.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/40 px-4 py-12 text-center">
              <div className="text-sm font-medium text-foreground">No items planned</div>
              <div className="mt-1 text-xs text-muted-foreground">Click below to add something to this day.</div>
              <button
                onClick={() => handleDayClick(currentDate)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                type="button"
              >
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>
          ) : (
            <>
              {dayTasks.map((t) => (
                <div key={t.id}>{renderChip({ title: t.title, subjectId: t.subjectId, task: t, compact: false })}</div>
              ))}
              {daySessions.map((sess) => (
                <div key={sess.id}>
                  {renderChip({
                    title: sess.title || "Study session",
                    subjectId: sess.subjectId,
                    session: sess,
                    compact: false,
                  })}
                </div>
              ))}
              {dayReminders.map((r) => (
                <div key={r.id}>
                  {renderChip({
                    title: r.title || "Reminder",
                    reminder: r,
                    compact: false,
                  })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const getHeaderLabel = () => {
    if (viewMode === "month") return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    if (viewMode === "week") {
      const s = startOfWeek(currentDate);
      const e = endOfWeek(currentDate);
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (viewMode === "month") direction === "prev" ? previousMonth() : nextMonth();
    else if (viewMode === "week") direction === "prev" ? previousWeek() : nextWeek();
    else direction === "prev" ? previousDay() : nextDay();
  };

  // UI value for <input type="time"> needs "HH:MM"
  const startTimeUiValue = useMemo(() => {
    const s = (sessionFormData.startTime ?? "").trim();
    if (/^\d{2}:\d{2}$/.test(s)) return s; // already 24h format
    return time12To24(s);
  }, [sessionFormData.startTime]);

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-7 space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Calendar</h1>
        <p className="text-sm text-muted-foreground">Click a day to add a task, reminder, or study session.</p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate("prev")}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Previous"
            type="button"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="min-w-[220px] text-left md:text-center">
            <div className="text-sm font-semibold text-foreground">{getHeaderLabel()}</div>
            {termWeekLabel ? <div className="text-xs text-muted-foreground mt-0.5">{termWeekLabel}</div> : null}
          </div>

          <button
            onClick={() => handleNavigate("next")}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Next"
            type="button"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border bg-card p-1 flex gap-1">
            <SwitchPill label="Month" active={viewMode === "month"} onClick={() => setViewMode("month")} />
            <SwitchPill label="Week" active={viewMode === "week"} onClick={() => setViewMode("week")} />
            <SwitchPill label="Day" active={viewMode === "day"} onClick={() => setViewMode("day")} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Plan</div>
        </div>

        <SectionShell>
          {viewMode === "month" ? (
            <>
              <div className="grid grid-cols-7 bg-muted/20 border-b border-border">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              {renderMonthView()}
            </>
          ) : null}

          {viewMode === "week" ? renderWeekView() : null}
          {viewMode === "day" ? renderDayView() : null}
        </SectionShell>
      </div>

      {showPopover && selectedDate ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowPopover(false)} />
          <div
            ref={popoverRef}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-muted-foreground">Add something to this day</div>
              </div>
              <button
                onClick={() => setShowPopover(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <button
                onClick={() => handleAddOption("study")}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 hover:bg-background/60 transition"
                type="button"
              >
                <span className="text-sm text-foreground">Add study session</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>

              <button
                onClick={() => handleAddOption("reminder")}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 hover:bg-background/60 transition"
                type="button"
              >
                <span className="text-sm text-foreground">Add reminder</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>

              {(["task", "assignment", "exam", "homework"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddOption(t)}
                  className="w-full flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 hover:bg-background/60 transition"
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

      {/* Add/Edit Forms Modal */}
      {showAddForm ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={handleCancel} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">
                  {showAddForm === "study"
                    ? `${editingSessionId ? "Edit" : "Add"} study session`
                    : showAddForm === "reminder"
                      ? `${editingReminderId ? "Edit" : "Add"} reminder`
                      : `${editingTaskId ? "Edit" : "Add"} ${typeLabel(showAddForm as Task["type"])}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : ""}
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
                type="button"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {showAddForm === "study" ? (
                <>
                  <input
                    type="text"
                    placeholder="Session title (e.g. Trig graphs revision)"
                    value={sessionFormData.title}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  <select
                    value={sessionFormData.subjectId}
                    onChange={(e) =>
                      setSessionFormData({ ...sessionFormData, subjectId: e.target.value, linkedTaskId: "" })
                    }
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={sessionFormData.linkedTaskId}
                    onChange={(e) => setSessionFormData({ ...sessionFormData, linkedTaskId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <option value="">Link to assessment (optional)</option>
                    {linkableAssessments.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.type.toUpperCase()}: {t.title}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={sessionFormData.date}
                      onChange={(e) => setSessionFormData({ ...sessionFormData, date: e.target.value })}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="time"
                      value={startTimeUiValue}
                      onChange={(e) =>
                        setSessionFormData({ ...sessionFormData, startTime: time24To12(e.target.value) })
                      }
                      className="w-full h-11 rounded-xl border border-border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />

                    <select
                      value={sessionFormData.duration}
                      onChange={(e) => setSessionFormData({ ...sessionFormData, duration: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      <option value="">Select duration</option>
                      {DURATION_OPTIONS.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSessionSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                      type="button"
                    >
                      {editingSessionId ? "Save" : "Add"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : showAddForm === "reminder" ? (
                <>
                  <input
                    type="text"
                    placeholder="Reminder title (e.g. Pack calculator)"
                    value={reminderFormData.title}
                    onChange={(e) => setReminderFormData({ ...reminderFormData, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={reminderFormData.dueDate}
                      onChange={(e) => setReminderFormData({ ...reminderFormData, dueDate: e.target.value })}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground">Time (optional)</label>
                    <input
                      type="time"
                      value={reminderFormData.time}
                      onChange={(e) => setReminderFormData({ ...reminderFormData, time: e.target.value })}
                      className="w-full h-11 rounded-xl border border-border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleReminderSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                      type="button"
                    >
                      {editingReminderId ? "Save" : "Add"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                      type="button"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  <select
                    value={taskFormData.subjectId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, subjectId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    value={taskFormData.dueDate}
                    onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  />

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleTaskSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                      type="button"
                    >
                      {editingTaskId ? "Save" : "Add"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
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

      {/* Delete task confirm modal */}
      {deletingTaskId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingTaskId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this task?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteTask) onDeleteTask(deletingTaskId);
                  setDeletingTaskId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Delete session confirm modal */}
      {deletingSessionId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingSessionId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this study session?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingSessionId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteStudySession) onDeleteStudySession(deletingSessionId);
                  setDeletingSessionId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Delete reminder confirm modal */}
      {deletingReminderId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingReminderId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this reminder?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingReminderId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteReminder) onDeleteReminder(deletingReminderId);
                  setDeletingReminderId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
                type="button"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

export { CalendarView as Calendar };
