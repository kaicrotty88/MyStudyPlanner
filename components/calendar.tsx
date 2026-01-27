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
type AddFormType = "study" | "task" | "assignment" | "exam" | "homework" | null;

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

function typeDot(t: Task["type"]) {
  if (t === "exam") return "●";
  if (t === "assignment") return "◆";
  if (t === "homework") return "■";
  return "•";
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

const displayReminderTime = (t?: string) => {
  const s = (t ?? "").trim();
  if (!s) return "";
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

  const canEditDeleteTasks = Boolean(onUpdateTask && onDeleteTask);
  const canEditDeleteSessions = Boolean(onUpdateStudySession && onDeleteStudySession);

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

    const dateReminders = reminders.filter((r) => {
      if (!r.dueDate) return false;
      return isSameDay(r.dueDate, date);
    });

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

    if (type === "study") {
      setSessionFormData({
        title: "",
        subjectId: "",
        date: dateStr,
        startTime: "",
        duration: "60 min",
        linkedTaskId: "",
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

  const handleCancel = () => {
    setShowAddForm(null);
    setShowPopover(false);
    setSelectedDate(null);

    setEditingTaskId(null);
    setDeletingTaskId(null);

    setEditingSessionId(null);
    setDeletingSessionId(null);

    setTaskFormData({ title: "", subjectId: "", dueDate: "", type: "task" });
    setSessionFormData({
      title: "",
      subjectId: "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
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

  // ✅ improved chip readability:
  const renderChip = ({
    title,
    subjectId,
    isStudy,
    task,
    session,
    reminder,
    compact,
  }: {
    title: string;
    subjectId?: string;
    isStudy?: boolean;
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
            {isStudy ? "📚 " : ""}
            {reminder ? "⏰ " : ""}
            {task ? `${typeDot(task.type)} ` : ""}
            {title}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground min-w-0">
            {reminder ? (
              <>
                <span className="inline-flex items-center gap-1 min-w-0">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                  <span className="truncate">Reminder</span>
                </span>
                {reminder.time ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="shrink-0">{displayReminderTime(reminder.time)}</span>
                  </>
                ) : null}
              </>
            ) : (
              <span className="inline-flex items-center gap-1 min-w-0">
                <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                <span className="truncate">{subject?.name ?? "Unassigned"}</span>
              </span>
            )}

            {task ? (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="shrink-0">{typeLabel(task.type)}</span>
              </>
            ) : null}

            {session ? (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="shrink-0">
                  {displaySessionTime(session.startTime)} • {session.duration}
                </span>
                {!compact && linkedTask ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="truncate">Linked: {linkedTask.title}</span>
                  </>
                ) : null}
              </>
            ) : null}
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
        ...dayTasks.slice(0, 2).map((t) => ({ kind: "task" as const, t })),
        ...dayReminders.slice(0, 1).map((r) => ({ kind: "reminder" as const, r })),
        ...daySessions.slice(0, 1).map((s) => ({ kind: "session" as const, s })),
      ];

      const totalCount = dayTasks.length + daySessions.length + dayReminders.length;

      cells.push(
        <div
          key={day}
          role="button"
          tabIndex={0}
          onClick={() => handleDayClick(date)}
          className={[
            "min-h-[140px] text-left p-2 border-r border-b border-border hover:bg-muted/40 transition",
            "flex flex-col cursor-pointer bg-card",
            isToday ? "bg-primary/[0.04]" : "",
            isSelected ? "ring-1 ring-primary/30 ring-inset" : "",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div className="h-7 w-7 grid place-items-center rounded-full text-sm">
              {day}
            </div>
          </div>

          <div className="mt-2 space-y-1">
            {previewItems.map((x, idx) => {
              if (x.kind === "task") {
                return (
                  <div key={x.t.id + idx}>
                    {renderChip({ title: x.t.title, subjectId: x.t.subjectId, task: x.t, compact: true })}
                  </div>
                );
              }
              if (x.kind === "reminder") {
                return (
                  <div key={x.r.id + idx}>
                    {renderChip({
                      title: x.r.title,
                      reminder: x.r,
                      compact: true,
                    })}
                  </div>
                );
              }
              return (
                <div key={x.s.id + idx}>
                  {renderChip({
                    title: x.s.title || "Study session",
                    subjectId: x.s.subjectId,
                    isStudy: true,
                    session: x.s,
                    compact: true,
                  })}
                </div>
              );
            })}

            {totalCount > 3 ? (
              <div className="text-[11px] text-muted-foreground">+{totalCount - 3} more</div>
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

    return <div>{weeks}</div>;
  };

  const renderWeekView = () => {
    const s = startOfWeek(currentDate);
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      return d;
    });

    return (
      <div className="grid grid-cols-7 border-t border-border">
        {days.map((date) => {
          const { tasks, sessions, reminders } = getItemsForDate(date);

          return (
            <div
              key={date.toISOString()}
              onClick={() => handleDayClick(date)}
              className="min-h-[520px] p-3 border-r border-border bg-card hover:bg-muted/40 cursor-pointer"
            >
              <div className="text-sm font-semibold">{date.getDate()}</div>

              <div className="mt-3 space-y-2">
                {tasks.map((t) => (
                  <div key={t.id}>
                    {renderChip({ title: t.title, subjectId: t.subjectId, task: t })}
                  </div>
                ))}

                {reminders.map((r) => (
                  <div key={r.id}>
                    {renderChip({ title: r.title, reminder: r })}
                  </div>
                ))}

                {sessions.map((s) => (
                  <div key={s.id}>
                    {renderChip({
                      title: s.title || "Study session",
                      subjectId: s.subjectId,
                      isStudy: true,
                      session: s,
                    })}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const { tasks, sessions, reminders } = getItemsForDate(currentDate);

    return (
      <div className="p-5 space-y-3">
        {tasks.map((t) => (
          <div key={t.id}>
            {renderChip({ title: t.title, subjectId: t.subjectId, task: t })}
          </div>
        ))}

        {reminders.map((r) => (
          <div key={r.id}>
            {renderChip({ title: r.title, reminder: r })}
          </div>
        ))}

        {sessions.map((s) => (
          <div key={s.id}>
            {renderChip({
              title: s.title || "Study session",
              subjectId: s.subjectId,
              isStudy: true,
              session: s,
            })}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-7">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Calendar</h1>
        <div className="flex gap-2">
          <SwitchPill label="Month" active={viewMode === "month"} onClick={() => setViewMode("month")} />
          <SwitchPill label="Week" active={viewMode === "week"} onClick={() => setViewMode("week")} />
          <SwitchPill label="Day" active={viewMode === "day"} onClick={() => setViewMode("day")} />
        </div>
      </div>

      <SectionShell>
        {viewMode === "month" && renderMonthView()}
        {viewMode === "week" && renderWeekView()}
        {viewMode === "day" && renderDayView()}
      </SectionShell>
    </div>
  );
}

export { CalendarView as Calendar };
