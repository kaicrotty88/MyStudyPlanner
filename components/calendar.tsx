"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";

import type {
  StudySession,
  Subject,
  Task,
  TimetableClass,
  TimetablePeriod,
  TimetableSettings,
  TimetableWeek,
  ImportedCalendarEvent,
} from "./models";
import {
  AssessmentLifecycleBadge,
  AssessmentPreparationLine,
  getAssessmentLifecycle,
  isAssessmentTask,
} from "./assessmentLifecycle";

type ViewMode = "day" | "week" | "month";
type AddFormType = "study" | "assignment" | "exam" | "homework" | "personal" | null;

const PERIODS_STORAGE_KEY = "mystudyplanner-periods";
const DAY_START_HOUR = 7;
const DAY_END_HOUR = 22;
const HOUR_HEIGHT = 64;
const DEADLINE_MARKER_MINUTES = 22;
const DEADLINE_MARKER_TIME = "08:00";

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

type CalendarItemKind =
  | "task"
  | "assignment"
  | "exam"
  | "homework"
  | "personal"
  | "study"
  | "class"
  | "imported";

type CalendarItemPlacement = "timed";

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
  dueLabel?: string;
  isDeadlineMarker?: boolean;
  isTimetableClass?: boolean;
  task?: Task;
  session?: StudySession;
  timetableClass?: TimetableClass;
  importedEvent?: ImportedCalendarEvent;
};

type TimedItemLayout = {
  item: CalendarItem;
  style: React.CSSProperties;
};

interface CalendarProps {
  studySessions: StudySession[];
  tasks: Task[];

  subjects: Subject[];

  timetableSettings: TimetableSettings;
  timetablePeriods: TimetablePeriod[];
  timetableClasses: TimetableClass[];
  importedCalendarEvents: ImportedCalendarEvent[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask?: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask?: (id: string) => void;

  onToggleTaskCompleted?: (taskId: string) => void;
  onToggleStudySessionCompleted?: (sessionId: string) => void;
  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession?: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession?: (id: string) => void;
  onStudyTask?: (taskId: string) => void;
  onViewTasks?: () => void;
  onViewMarks?: () => void;
  planningStudyTaskId?: string | null;
  onPlanningStudyHandled?: () => void;

}

type TaskFormErrors = Partial<
  Record<"title" | "subjectId" | "dueDate" | "scheduledDate" | "startTime" | "duration", string>
>;

type SessionFormErrors = Partial<
  Record<"title" | "subjectId" | "date" | "startTime" | "duration", string>
>;


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

const parseLocalDateInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
};

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

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

const findMatchingPeriodId = (
  dueDate: Date,
  periods: PeriodHydrated[]
): string | undefined => {
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
  if (t === "personal") return "Personal";
  return "Homework";
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

const formatMinutes = (minutes: number) => {
  const mins = Math.max(0, Math.round(minutes));
  const hours = Math.floor(mins / 60);
  const rest = mins % 60;
  if (!hours) return `${rest}m`;
  if (!rest) return `${hours}h`;
  return `${hours}h ${rest}m`;
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

const normalizeHex = (value: string) => {
  const raw = value.trim().replace(/^#/, "");
  if (raw.length === 3) return raw.split("").map((c) => c + c).join("");
  if (raw.length === 6) return raw;
  return "64748b";
};

const hexToRgb = (value: string) => {
  const hex = normalizeHex(value);
  return {
    r: parseInt(hex.slice(0, 2), 16),
    g: parseInt(hex.slice(2, 4), 16),
    b: parseInt(hex.slice(4, 6), 16),
  };
};

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((x) => clamp(Math.round(x), 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;

const mixHex = (from: string, to: string, amount: number) => {
  const a = hexToRgb(from);
  const b = hexToRgb(to);

  return rgbToHex(
    a.r + (b.r - a.r) * amount,
    a.g + (b.g - a.g) * amount,
    a.b + (b.b - a.b) * amount
  );
};

const relativeLuminance = (hex: string) => {
  const { r, g, b } = hexToRgb(hex);
  const channels = [r, g, b].map((value) => {
    const c = value / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const getReadableTextColor = (background: string) =>
  relativeLuminance(background) > 0.58 ? "#252824" : "#ffffff";

const getMutedTextColor = (background: string) =>
  relativeLuminance(background) > 0.58 ? "rgba(37, 40, 36, 0.72)" : "rgba(255, 255, 255, 0.78)";

const isCompactMarkerItem = (item: CalendarItem) =>
  item.isDeadlineMarker;

const createEventPalette = (baseColor: string, kind: CalendarItemKind, isClass?: boolean) => {
  const normalizedBase = `#${normalizeHex(baseColor)}`;
  const veryLight = relativeLuminance(normalizedBase) > 0.88;
  const visibleBorder = veryLight ? "#94a3b8" : normalizedBase;
  const visibleStripe = veryLight ? "#cbd5e1" : normalizedBase;

  if (isClass) {
    const background = mixHex(normalizedBase, "#ffffff", 0.78);

    return {
      background,
      border: veryLight ? visibleBorder : mixHex(normalizedBase, "#ffffff", 0.25),
      stripe: visibleStripe,
      text: "#252824",
      mutedText: "rgba(37, 40, 36, 0.68)",
    };
  }

  if (kind === "imported") {
    return { background: "color-mix(in srgb, #64748b 12%, var(--card))", border: "color-mix(in srgb, #64748b 32%, var(--border))", text: "#475569", dot: "#64748b" };
  }

  if (kind === "study") {
    const background = mixHex(normalizedBase, "#ffffff", 0.72);

    return {
      background,
      border: veryLight ? visibleBorder : mixHex(normalizedBase, "#ffffff", 0.18),
      stripe: visibleStripe,
      text: "#252824",
      mutedText: "rgba(37, 40, 36, 0.68)",
    };
  }

  const background = mixHex(normalizedBase, "#ffffff", 0.65);

  return {
    background,
    border: veryLight ? visibleBorder : mixHex(normalizedBase, "#ffffff", 0.12),
    stripe: visibleStripe,
    text: getReadableTextColor(background),
    mutedText: getMutedTextColor(background),
  };
};

const layoutTimedItems = (items: CalendarItem[]): TimedItemLayout[] => {
  const sorted = [...items].sort((a, b) => {
    const startDiff = itemStartMinutes(a) - itemStartMinutes(b);
    if (startDiff !== 0) return startDiff;
    return itemEndMinutes(b) - itemEndMinutes(a);
  });

  const groups: CalendarItem[][] = [];
  let currentGroup: CalendarItem[] = [];
  let currentGroupEnd = -Infinity;

  sorted.forEach((item) => {
    const start = itemStartMinutes(item);
    const end = itemEndMinutes(item);

    // Ignore tiny overlaps. This stops a 4:15 reminder ending at 4:33
    // from crushing a 4:30 assignment into a skinny column.
    const meaningfulOverlap = start < currentGroupEnd - 8;

    if (currentGroup.length === 0 || meaningfulOverlap) {
      currentGroup.push(item);
      currentGroupEnd = Math.max(currentGroupEnd, end);
      return;
    }

    groups.push(currentGroup);
    currentGroup = [item];
    currentGroupEnd = end;
  });

  if (currentGroup.length > 0) groups.push(currentGroup);

  return groups.flatMap((group) => {
    const columns: number[] = [];
    const positioned = group.map((item) => {
      const start = itemStartMinutes(item);
      const end = itemEndMinutes(item);
      let columnIndex = columns.findIndex((columnEnd) => columnEnd <= start + 8);

      if (columnIndex === -1) {
        columnIndex = columns.length;
        columns.push(end);
      } else {
        columns[columnIndex] = end;
      }

      return { item, columnIndex };
    });

    const columnCount = Math.max(1, columns.length);

    return positioned.map(({ item, columnIndex }) => {
      const gapPx = columnCount > 1 ? 6 : 0;
      const widthPct = 100 / columnCount;
      const leftPct = columnIndex * widthPct;

      return {
        item,
        style: {
          left: `calc(${leftPct}% + ${gapPx / 2}px)`,
          width: `calc(${widthPct}% - ${gapPx}px)`,
          zIndex: 25 + columnIndex,
        },
      };
    });
  });
};

const layoutCompactMarkers = (items: CalendarItem[]): TimedItemLayout[] => {
  const sorted = [...items].sort((a, b) => itemStartMinutes(a) - itemStartMinutes(b));

  return sorted.map((item, index) => ({
    item,
    style: {
      left: "0px",
      width: "100%",
      zIndex: 45 + index,
    },
  }));
};

const getTimetableWeekForDate = (
  date: Date,
  settings: TimetableSettings
): TimetableWeek => {
  if (settings.cycle !== "fortnightly") return "both";
  if (!settings.cycleStartDate) return "A";

  const dateWeekStart = startOfWeekMonday(date).getTime();
  const cycleWeekStart = startOfWeekMonday(settings.cycleStartDate).getTime();

  const diffWeeks = Math.floor(
    (dateWeekStart - cycleWeekStart) / (7 * 24 * 60 * 60 * 1000)
  );

  const safeMod = ((diffWeeks % 2) + 2) % 2;
  return safeMod === 0 ? "A" : "B";
};

const isDateInsideConfiguredTerm = (
  date: Date,
  periods: PeriodHydrated[]
) => periods.some((period) => inRangeInclusive(date, period.startDate, period.endDate));

const isTimetableClassOnDate = (
  date: Date,
  item: TimetableClass,
  settings: TimetableSettings,
  periods: PeriodHydrated[]
) => {
  if (!isDateInsideConfiguredTerm(date, periods)) return false;
  if (item.dayOfWeek !== date.getDay()) return false;
  if (settings.cycle === "weekly") return true;
  if (item.week === "both") return true;

  return item.week === getTimetableWeekForDate(date, settings);
};

const formatDueLabelBase = (date: Date) => {
  const today = startOfDay(new Date()).getTime();
  const due = startOfDay(date).getTime();
  const diff = Math.round((due - today) / (24 * 60 * 60 * 1000));

  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff === -1) return "Due yesterday";
  if (diff < 0) return `Overdue ${Math.abs(diff)}d`;

  return `Due ${date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  })}`;
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

const CalendarShell = ({ children }: { children: React.ReactNode }) => (
  <div className="calendar-shell">
    {children}
  </div>
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
      "app-switch-item",
      active ? "app-switch-item-active" : "",
    ].join(" ")}
    type="button"
  >
    {label}
  </button>
);

function CalendarView({
  studySessions,
  tasks,
  subjects,
  timetableSettings,
  timetablePeriods,
  timetableClasses,
  importedCalendarEvents,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskCompleted,
  onToggleStudySessionCompleted,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onStudyTask,
  onViewTasks,
  onViewMarks,
  planningStudyTaskId = null,
  onPlanningStudyHandled,
}: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const timeGridScrollRef = useRef<HTMLDivElement | null>(null);

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const taskDateInputRef = useRef<HTMLInputElement | null>(null);
  const [monthOverflowDate, setMonthOverflowDate] = useState<Date | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);

  const addMenuRef = useRef<HTMLDivElement>(null);

  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);

  const [editingTaskId, setEditingtaskId] = useState<string | null>(null);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [assessmentDetailTaskId, setAssessmentDetailTaskId] = useState<string | null>(null);
  const [planningSlot, setPlanningSlot] = useState<{ date: Date; startTime: string } | null>(null);
  const [planningDurationMinutes, setPlanningDurationMinutes] = useState(60);
  const [planningTime, setPlanningTime] = useState("");

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
    type: "homework" as "assignment" | "exam" | "homework" | "personal",
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

  const [taskErrors, setTaskErrors] = useState<TaskFormErrors>({});
  const [sessionErrors, setSessionErrors] = useState<SessionFormErrors>({});

  const canEditDeleteTasks = Boolean(onUpdateTask && onDeleteTask);
  const canEditDeleteSessions = Boolean(onUpdateStudySession && onDeleteStudySession);

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

  const handleCancel = () => {
    setShowAddForm(null);
    setShowAddMenu(false);
    setSelectedDate(null);

    setEditingtaskId(null);
    setEditingSessionId(null);

    setTaskErrors({});
    setSessionErrors({});

    setTaskFormData({
      title: "",
      subjectId: "",
      dueDate: "",
      type: "homework",
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

  };

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
    const abWeek =
      timetableSettings.cycle === "fortnightly"
        ? ` · Week ${getTimetableWeekForDate(currentDate, timetableSettings)}`
        : "";

    return `${active.name} · Week ${wk}${abWeek}`;
  }, [currentDate, periods, timetableSettings]);

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const timetablePeriodById = useMemo(() => {
    const map = new Map<string, TimetablePeriod>();
    timetablePeriods.forEach((p) => map.set(p.id, p));
    return map;
  }, [timetablePeriods]);

  const getTimetableClassTimes = (item: TimetableClass) => {
    const period = item.periodId ? timetablePeriodById.get(item.periodId) : undefined;

    const startTime = period?.startTime ?? item.startTime;
    const endTime = period?.endTime ?? item.endTime;

    return { startTime, endTime, period };
  };

  const taskById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((t) => map.set(t.id, t));
    return map;
  }, [tasks]);

  const planningStudyTask = planningStudyTaskId ? taskById.get(planningStudyTaskId) ?? null : null;

  const planningStudySummary = useMemo(() => {
    if (!planningStudyTask) return null;
    const completed = studySessions.filter((session) => session.completed && session.linkedTaskId === planningStudyTask.id).reduce((sum, session) => sum + parseDurationToMinutes(session.duration), 0);
    const planned = studySessions.filter((session) => !session.completed && session.linkedTaskId === planningStudyTask.id).reduce((sum, session) => sum + parseDurationToMinutes(session.duration), 0);
    const target = planningStudyTask.targetStudyMinutes ?? 180;
    return { completed, planned, target, unscheduled: Math.max(0, target - completed - planned) };
  }, [planningStudyTask, studySessions]);

  const isPlanningDateEligible = (date: Date) => {
    if (!planningStudyTask) return true;
    const day = startOfDay(date).getTime();
    return day >= startOfDay(new Date()).getTime() && day <= startOfDay(planningStudyTask.dueDate).getTime();
  };

  useEffect(() => {
    if (!planningStudyTaskId) return;
    setViewMode("week");
    setCurrentDate(new Date());
  }, [planningStudyTaskId]);

  const activeTasks = useMemo(() => tasks.filter((t: any) => !t.completed), [tasks]);
  const activeSessions = useMemo(
    () => studySessions.filter((s: any) => !s.completed),
    [studySessions]
  );
  const findMatchingTimetableClassForTask = (task: Task) => {
    if (!task.subjectId || task.type === "personal") return undefined;

    return timetableClasses
      .filter((item) => item.subjectId === task.subjectId)
      .filter((item) => isTimetableClassOnDate(task.dueDate, item, timetableSettings, periods))
      .sort((a, b) => {
        const aTimes = getTimetableClassTimes(a);
        const bTimes = getTimetableClassTimes(b);

        return String(aTimes.startTime ?? "").localeCompare(String(bTimes.startTime ?? ""));
      })[0];
  };

  const formatDueLabel = (task: Task) => {
    const base = formatDueLabelBase(task.dueDate);
    const matchingClass = findMatchingTimetableClassForTask(task);

    if (!matchingClass) return base;

    const { startTime } = getTimetableClassTimes(matchingClass);

    return `${base}${startTime ? ` · ${matchingClass.title} ${displayTime(startTime)}` : ` · ${matchingClass.title}`}`;
  };

  const calendarItems = useMemo<CalendarItem[]>(() => {
    const taskItems: CalendarItem[] = activeTasks.flatMap((task) => {
      const scheduledDate = task.scheduledDate;
      const startTime = task.startTime;
      const dueLabel = formatDueLabel(task);

      const startMins = scheduledDate && startTime ? parseTimeToMinutes(startTime) : null;
      const durationMins = parseDurationToMinutes(task.duration);
      const items: CalendarItem[] = [];

      if (scheduledDate && startMins !== null) {
        const start = dateWithMinutes(scheduledDate, startMins);
        const end = dateWithMinutes(
          scheduledDate,
          startMins + (task.type === "personal" ? Math.min(durationMins, 20) : durationMins)
        );

        items.push({
          id: `task-scheduled-${task.id}`,
          sourceId: task.id,
          kind: task.type === "personal" ? "task" : task.type,
          placement: "timed",
          title: task.title,
          subjectId: task.subjectId ?? "",
          start,
          end,
          timeLabel: displayTime(task.startTime),
          durationLabel: task.duration || (task.type === "personal" ? "15 min" : "60 min"),
          dueLabel,
          isDeadlineMarker: task.type === "personal",
          task,
        });
      } else {
        const fallbackStartMins = parseTimeToMinutes(DEADLINE_MARKER_TIME) ?? 8 * 60;
        const start = dateWithMinutes(task.dueDate, fallbackStartMins);
        const end = dateWithMinutes(task.dueDate, fallbackStartMins + DEADLINE_MARKER_MINUTES);

        items.push({
          id: `task-unscheduled-deadline-${task.id}`,
          sourceId: task.id,
          kind: task.type === "personal" ? "task" : task.type,
          placement: "timed",
          title: task.title,
          subjectId: task.subjectId ?? "",
          start,
          end,
          timeLabel: task.type === "personal" ? displayTime(task.startTime) || "Task" : "Due",
          dueLabel,
          isDeadlineMarker: true,
          task,
        });
      }

      const shouldCreateSeparateDueMarker =
        task.type !== "personal" &&
        Boolean(scheduledDate) &&
        scheduledDate !== undefined &&
        !isSameDay(startOfDay(task.dueDate), startOfDay(scheduledDate));

      if (shouldCreateSeparateDueMarker) {
        const fallbackStartMins = parseTimeToMinutes(DEADLINE_MARKER_TIME) ?? 8 * 60;
        const start = dateWithMinutes(task.dueDate, fallbackStartMins);
        const end = dateWithMinutes(task.dueDate, fallbackStartMins + DEADLINE_MARKER_MINUTES);

        items.push({
          id: `task-deadline-${task.id}`,
          sourceId: task.id,
          kind: task.type,
          placement: "timed",
          title: task.title,
          subjectId: task.subjectId ?? "",
          start,
          end,
          timeLabel: "Due",
          dueLabel,
          isDeadlineMarker: true,
          task,
        });
      }

      return items;
    });

    const sessionItems: CalendarItem[] = activeSessions.map((session) => {
      const hasExactTime = Boolean((session.startTime ?? "").trim());
      const startMins = parseTimeToMinutes(session.startTime) ?? DAY_START_HOUR * 60;
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
        timeLabel: hasExactTime ? displayTime(session.startTime) : "Time not set",
        durationLabel: session.duration,
        session,
      };
    });

    const importedItems: CalendarItem[] = importedCalendarEvents.map((event) => ({
      id: `imported-${event.id}`,
      sourceId: event.id,
      kind: "imported",
      placement: "timed",
      title: event.title,
      subjectId: event.subjectId,
      start: event.allDay ? dateWithMinutes(event.start, 8 * 60) : event.start,
      end: event.allDay ? dateWithMinutes(event.start, 8 * 60 + DEADLINE_MARKER_MINUTES) : event.end,
      timeLabel: event.allDay ? "All day" : displayTime(`${String(event.start.getHours()).padStart(2, "0")}:${String(event.start.getMinutes()).padStart(2, "0")}`),
      durationLabel: event.kind === "class"
        ? "Imported class"
        : event.source === "google"
          ? "Google Calendar"
          : "Imported calendar",
      isTimetableClass: event.kind === "class",
      importedEvent: event,
    }));

    return [...taskItems, ...sessionItems, ...importedItems].sort((a, b) => {
      const dayDiff = startOfDay(a.start).getTime() - startOfDay(b.start).getTime();
      if (dayDiff !== 0) return dayDiff;

      const markerDiff = Number(a.isDeadlineMarker ?? false) - Number(b.isDeadlineMarker ?? false);
      if (markerDiff !== 0) return markerDiff;

      return a.start.getTime() - b.start.getTime();
    });
  }, [activeTasks, activeSessions, importedCalendarEvents, timetableClasses, timetableSettings, timetablePeriodById, periods]);

  const getTimetableItemsForDate = (date: Date): CalendarItem[] => {
    return timetableClasses
      .filter((item) => isTimetableClassOnDate(date, item, timetableSettings, periods))
      .map((item): CalendarItem | null => {
        const { startTime, endTime, period } = getTimetableClassTimes(item);

        const startMins = parseTimeToMinutes(startTime);
        if (startMins === null) return null;

        const endMins = parseTimeToMinutes(endTime) ?? startMins + 60;
        const safeEndMins = Math.max(endMins, startMins + 15);

        return {
          id: `class-${item.id}-${toLocalDateInputValue(date)}`,
          sourceId: item.id,
          kind: "class",
          placement: "timed",
          title: item.title,
          subjectId: item.subjectId,
          start: dateWithMinutes(date, startMins),
          end: dateWithMinutes(date, safeEndMins),
          timeLabel: `${displayTime(startTime)} - ${displayTime(endTime)}`,
          durationLabel:
            period?.name ??
            (timetableSettings.cycle === "fortnightly"
              ? item.week === "both"
                ? "Both weeks"
                : `Week ${item.week}`
              : "Every week"),
          isTimetableClass: true,
          timetableClass: item,
        };
      })
      .filter((item): item is CalendarItem => item !== null)
      .sort((a, b) => a.start.getTime() - b.start.getTime());
  };

  const linkableTasks = useMemo(() => {
    return activeTasks
      .filter((t) => t.type !== "task" && t.type !== "personal" && Boolean(t.subjectId))
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

  const getAllDayItemsForDate = (date: Date) =>
    getItemsForDate(date).filter((item) => item.isDeadlineMarker || item.importedEvent?.allDay);

  const getVisibleTimedItemsForDate = (date: Date) => {
    const normalItems = getItemsForDate(date).filter((item) => !item.isDeadlineMarker && !item.importedEvent?.allDay);
    const classItems = viewMode === "month" ? [] : getTimetableItemsForDate(date);

    return [...classItems, ...normalItems].sort((a, b) => {
      const classOrder =
        Number(a.isTimetableClass ?? false) - Number(b.isTimetableClass ?? false);

      if (classOrder !== 0) return classOrder;

      return a.start.getTime() - b.start.getTime();
    });
  };

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
      })} - ${e.toLocaleDateString("en-US", {
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

  const openAddMenuForDate = (date: Date, startTime = "16:00") => {
    if (planningStudyTask) {
      const day = startOfDay(date).getTime();
      const today = startOfDay(new Date()).getTime();
      const due = startOfDay(planningStudyTask.dueDate).getTime();
      if (day < today || day > due) return;
      setPlanningSlot({ date, startTime: "" });
      setPlanningTime("");
      return;
    }
    setSelectedDate(date);
    setShowAddMenu(true);
  };

  const addPlanningSession = (durationMinutes: number) => {
    if (!planningStudyTask || !planningSlot) return;
    onAddStudySession({
      title: `${planningStudyTask.title} study`,
      subjectId: planningStudyTask.subjectId ?? "",
      date: planningSlot.date,
      startTime: planningTime,
      duration: `${durationMinutes} min`,
      linkedTaskId: planningStudyTask.id,
      completed: false,
    });
    setPlanningSlot(null);
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

    setEditingtaskId(null);
    setEditingSessionId(null);

    setTaskErrors({});
    setSessionErrors({});

    if (type === "study") {
      setSessionFormData({
        title: planningStudyTask ? `${planningStudyTask.title} study` : "",
        subjectId: planningStudyTask?.subjectId ?? "",
        date: dateStr,
        startTime: "16:00",
        duration: "60 min",
        linkedTaskId: planningStudyTask?.id ?? "",
      });
    } else if (type === "personal") {
      setTaskFormData({
        title: "",
        subjectId: "",
        dueDate: dateStr,
        type: "personal",
        scheduledDate: "",
        startTime: "",
        duration: "60 min",
      });
    } else if (type) {
      setTaskFormData({
        title: "",
        subjectId: "",
        dueDate: dateStr,
        type,
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

    const safeType = task.type === "task" ? "homework" : task.type === "personal" || !task.subjectId ? "personal" : task.type;

    setEditingtaskId(task.id);
    setSelectedDate(task.scheduledDate ?? task.dueDate);
    setTaskErrors({});

    setTaskFormData({
      title: task.title,
      subjectId: task.subjectId ?? "",
      dueDate: toLocalDateInputValue(task.dueDate),
      type: safeType,
      scheduledDate: task.scheduledDate
        ? toLocalDateInputValue(task.scheduledDate)
        : toLocalDateInputValue(task.dueDate),
      startTime: task.startTime ?? DEADLINE_MARKER_TIME,
      duration: task.duration ?? "60 min",
    });

    setShowAddForm(safeType);
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


  const openCalendarItem = (item: CalendarItem) => {
    if (item.isTimetableClass) return;
    if (item.task && isAssessmentTask(item.task)) {
      setAssessmentDetailTaskId(item.task.id);
      return;
    }
    if (item.task) openEditTask(item.task);
    else if (item.session) openEditSession(item.session);
  };

  const assessmentDetailTask = assessmentDetailTaskId
    ? tasks.find((task) => task.id === assessmentDetailTaskId) ?? null
    : null;
  const assessmentDetailLifecycle = assessmentDetailTask
    ? getAssessmentLifecycle(assessmentDetailTask, studySessions)
    : null;

  const validateTaskForm = () => {
    const next: TaskFormErrors = {};

    if (!taskFormData.title.trim()) next.title = "Title is required";
    if (taskFormData.type !== "personal" && !taskFormData.subjectId) {
      next.subjectId = "Subject is required";
    }
    if (!taskFormData.dueDate) next.dueDate = "Due date is required";

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


  const handleTaskSubmit = () => {
    if (!validateTaskForm()) return;

    const submittedDateValue = taskDateInputRef.current?.value || taskFormData.dueDate;
    const newDueDate = parseLocalDateInput(submittedDateValue);
    const existingTask = editingTaskId ? tasks.find((task) => task.id === editingTaskId) : undefined;
    const nextScheduledDate = existingTask?.scheduledDate;
    const nextStartTime = existingTask?.startTime;
    const nextDuration = existingTask?.duration;

    if (editingTaskId && onUpdateTask) {
      const existing = tasks.find((t) => t.id === editingTaskId);

      const dueChanged =
        existing?.dueDate &&
        startOfDay(existing.dueDate).getTime() !== startOfDay(newDueDate).getTime();

      const computedPeriodId = taskFormData.type === "personal" ? undefined : findMatchingPeriodId(newDueDate, periods);
      const nextPeriodId = dueChanged ? computedPeriodId : existing?.periodId;

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title.trim(),
        subjectId: taskFormData.type === "personal" ? undefined : taskFormData.subjectId,
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
        notes: existing?.notes,
        source: existing?.source,
        migratedFromReminderId: existing?.migratedFromReminderId,
        createdAt: existing?.createdAt,
      };

      onUpdateTask(editingTaskId, payload);
    } else {
      const computedPeriodId = taskFormData.type === "personal" ? undefined : findMatchingPeriodId(newDueDate, periods);

      const payload: Omit<Task, "id"> = {
        title: taskFormData.title.trim(),
        subjectId: taskFormData.type === "personal" ? undefined : taskFormData.subjectId,
        dueDate: newDueDate,
        type: taskFormData.type,
        scheduledDate: nextScheduledDate,
        startTime: nextStartTime,
        duration: nextDuration,
        periodId: computedPeriodId,
      };

      onAddTask(payload);
    }

    setEditingtaskId(null);
    setTaskFormData({
      title: "",
      subjectId: "",
      dueDate: "",
      type: "homework",
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

    if (planningStudyTaskId && payload.linkedTaskId === planningStudyTaskId) {
      onPlanningStudyHandled?.();
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


  const handleToggleItem = (event: React.MouseEvent, item: CalendarItem) => {
    event.stopPropagation();

    if (item.task && onToggleTaskCompleted) onToggleTaskCompleted(item.task.id);
    else if (item.session && onToggleStudySessionCompleted)
      onToggleStudySessionCompleted(item.session.id);
  };

  const getItemColor = (item: CalendarItem) => {
    const subject = item.subjectId ? item.subjectId ? subjectById.get(item.subjectId) : undefined : undefined;

    if (subject?.color) return subject.color;
    if (item.kind === "exam") return "#ef4444";
    if (item.kind === "assignment") return "#f59e0b";
    if (item.task?.type === "personal") return "#64748b";
    if (item.kind === "homework" || item.kind === "task") return "#3b82f6";
    if (item.kind === "study") return "#5f7f68";
    if (item.kind === "imported") {
      return item.importedEvent?.color || "#64748b";
    }

    return "#6366f1";
  };

  const getItemLabel = (item: CalendarItem) => {
    if (item.isTimetableClass) return "Class";
    if (item.isDeadlineMarker) return "Deadline";
    if (item.kind === "study") return "Study";
    if (item.kind === "imported") return item.importedEvent?.source === "google" ? "Google Calendar" : "Imported";
    if (item.task?.type === "personal") return "Personal";
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

      const firstTimed = getVisibleTimedItemsForDate(currentDate)
        .sort((a, b) => a.start.getTime() - b.start.getTime())[0];

      return firstTimed ? itemStartMinutes(firstTimed) : 9 * 60;
    }

    const weekHasToday = visibleWeekDays.some((day) => isSameDay(day, today));

    if (weekHasToday) {
      return now.getHours() * 60 + now.getMinutes();
    }

    const weekTimedItems = visibleWeekDays
      .flatMap((day) => getVisibleTimedItemsForDate(day))
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    return weekTimedItems[0] ? itemStartMinutes(weekTimedItems[0]) : 9 * 60;
  };

  useEffect(() => {
    // Keep scrolling controlled by the page instead of fighting it with an internal calendar scroller.
    // This avoids nested-scroll behaviour in week/day views.
  }, [viewMode, currentDate, calendarItems.length, timetableClasses.length, timetablePeriods.length]);

  const minimalPrimary = (item: CalendarItem) => {
    const subjectName = item.subjectId ? subjectById.get(item.subjectId)?.name : undefined;
    if (item.kind === "study") return subjectName ?? "Study";
    if (item.task) return item.title;
    if (item.importedEvent?.allDay) return item.title;
    return subjectName ?? item.title;
  };

  const minimalSecondary = (item: CalendarItem) => {
    if (item.isDeadlineMarker && item.task) return typeLabel(item.task.type);
    if (item.kind === "study") return "Study";
    if (item.isTimetableClass) return "Class";
    if (item.kind === "imported") return item.importedEvent?.allDay ? "All day" : "Event";
    if (item.task) return typeLabel(item.task.type);
    return getItemLabel(item);
  };

  const renderMonthItem = (item: CalendarItem) => {
    const color = getItemColor(item);
    const palette = createEventPalette(color, item.kind, item.isTimetableClass);

    return (
      <button
        key={item.id}
        type="button"
        onClick={(event) => { event.stopPropagation(); openCalendarItem(item); }}
        className="calendar-month-chip min-w-0 overflow-hidden border"
        style={{ backgroundColor: palette.background, borderColor: palette.border, color: palette.text }}
        title={`${minimalSecondary(item)}: ${item.title}`}
      >
        <span className="min-w-0 flex-1 truncate font-semibold" style={{ color: palette.text }}>{minimalPrimary(item)}</span>
        <span className="shrink-0 text-xs font-medium max-[1180px]:hidden" style={{ color: palette.mutedText }}>{minimalSecondary(item)}</span>
      </button>
    );
  };

  const renderDeadlineMarker = (
    item: CalendarItem,
    dayColumn = false,
    layoutStyle?: React.CSSProperties
  ) => {
    const color = getItemColor(item);
    const palette = createEventPalette(color, item.kind, false);
    const start = Math.max(itemStartMinutes(item), DAY_START_HOUR * 60);
    const top = ((start - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const canToggle = Boolean(item.task && onToggleTaskCompleted);

    return (
      <div
        key={item.id}
        className="absolute z-40 px-1"
        style={{ top, height: 24, ...(layoutStyle ?? { left: 0, width: "100%" }) }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openCalendarItem(item);
          }}
          className="group flex h-full w-full items-center gap-1.5 overflow-hidden rounded-lg border px-2 text-left shadow-sm transition hover:-translate-y-px hover:shadow-app-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          style={{
            borderColor: palette.border,
            backgroundColor: palette.background,
            color: palette.text,
          }}
          title={`Due: ${item.title}${item.dueLabel ? ` · ${item.dueLabel}` : ""}`}
        >
          {canToggle ? (
            <span
              role="button"
              tabIndex={0}
              onClick={(event) => handleToggleItem(event, item)}
              className="grid h-3.5 w-3.5 shrink-0 place-items-center rounded-full border border-white/60 bg-white/45 transition hover:bg-white/70"
              aria-label="Mark complete"
            >
              <span className="h-1.5 w-1.5 rounded-full opacity-0 transition group-hover:opacity-70" style={{ backgroundColor: palette.stripe }} />
            </span>
          ) : (
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: palette.stripe }}
            />
          )}

          <span className="shrink-0 text-[10px] font-semibold" style={{ color: palette.mutedText }}>
            Due:
          </span>

          <span
            className={["min-w-0 truncate font-semibold", dayColumn ? "text-xs" : "text-[11px]"].join(" ")}
            style={{ color: palette.text }}
          >
            {item.title}
          </span>
        </button>
      </div>
    );
  };


  const renderClassItem = (
    item: CalendarItem,
    dayColumn = false,
    layoutStyle?: React.CSSProperties
  ) => {
    const color = getItemColor(item);
    const palette = createEventPalette(color, item.kind, true);
    const start = Math.max(itemStartMinutes(item), DAY_START_HOUR * 60);
    const end = Math.min(itemEndMinutes(item), DAY_END_HOUR * 60);
    const top = ((start - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = Math.max(34, ((end - start) / 60) * HOUR_HEIGHT);
    const location = item.timetableClass?.location;
    const teacher = item.timetableClass?.teacher;

    return (
      <div
        key={item.id}
        className="absolute z-[5] px-1"
        style={{ top, height, ...(layoutStyle ?? { left: 0, width: "100%" }) }}
      >
        <div
          className="h-full w-full overflow-hidden rounded-xl border px-2.5 py-1.5 text-left shadow-sm"
          style={{
            borderColor: palette.border,
            borderLeftWidth: 4,
            borderLeftColor: palette.stripe,
            backgroundColor: palette.background,
            color: palette.text,
          }}
          title={`${item.title} · ${item.timeLabel}`}
        >
          <div
            className={["truncate font-semibold", dayColumn ? "text-xs" : "text-[11px]"].join(" ")}
            style={{ color: palette.text }}
          >
            {item.title}
          </div>

          <div className="truncate text-[10px] font-medium" style={{ color: palette.mutedText }}>
            Class · {item.timeLabel}
            {location ? ` · ${location}` : ""}
            {teacher ? ` · ${teacher}` : ""}
          </div>
        </div>
      </div>
    );
  };

  const renderTimedItem = (
    item: CalendarItem,
    dayColumn = false,
    layoutStyle?: React.CSSProperties
  ) => {
    if (item.isTimetableClass) return renderClassItem(item, dayColumn, layoutStyle);
    if (item.isDeadlineMarker) return renderDeadlineMarker(item, dayColumn, layoutStyle);

    const color = getItemColor(item);
    const palette = createEventPalette(color, item.kind, item.isTimetableClass);
    const start = Math.max(itemStartMinutes(item), DAY_START_HOUR * 60);
    const end = Math.min(itemEndMinutes(item), DAY_END_HOUR * 60);
    const top = ((start - DAY_START_HOUR * 60) / 60) * HOUR_HEIGHT;
    const height = item.isDeadlineMarker
      ? 32
      : Math.max(38, ((end - start) / 60) * HOUR_HEIGHT);

    const canToggle =
      Boolean(item.session && onToggleStudySessionCompleted) ||
      Boolean(item.task && onToggleTaskCompleted);

    return (
      <div
        key={item.id}
        className="absolute z-20 px-1"
        style={{ top, height, ...(layoutStyle ?? { left: 0, width: "100%" }) }}
      >
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            openCalendarItem(item);
          }}
          className="group h-full w-full overflow-hidden rounded-xl border px-2.5 py-1.5 text-left shadow-sm transition hover:-translate-y-px hover:shadow-app-card-hover focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          style={{
            borderColor: palette.border,
            borderLeftWidth: 4,
            borderLeftColor: palette.stripe,
            backgroundColor: palette.background,
            color: palette.text,
          }}
          title={`${getItemLabel(item)}: ${item.title}`}
        >
          <div className="flex min-w-0 items-start gap-1.5">
            {canToggle ? (
              <span
                role="button"
                tabIndex={0}
                onClick={(event) => handleToggleItem(event, item)}
                className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full border border-white/55 bg-white/45 transition hover:bg-white/70"
                aria-label="Mark complete"
              >
                <span className="h-1.5 w-1.5 rounded-full opacity-0 transition group-hover:opacity-70" style={{ backgroundColor: palette.stripe }} />
              </span>
            ) : null}

            <div className="min-w-0 flex-1">
              <div
                className={[
                  "truncate font-semibold",
                  dayColumn ? "text-xs" : "text-[11px]",
                ].join(" ")}
                style={{ color: palette.text }}
              >
                {minimalPrimary(item)}
              </div>

              <div className="truncate text-[10px] font-medium" style={{ color: palette.mutedText }}>
                {minimalSecondary(item)}{item.timeLabel ? ` · ${item.timeLabel}` : ""}
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
          className="relative border-b calendar-grid-line"
          style={{ height: HOUR_HEIGHT }}
        >
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed calendar-grid-line" />
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
        className="pointer-events-none absolute left-0 right-0 z-30 flex items-center"
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
            <div
              key={day}
              className="px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((date) => {
            const dayItems = getItemsForDate(date).filter(
              (item) =>
                !(
                  item.kind === "imported" &&
                  item.importedEvent?.kind === "class"
                ),
            );
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
                  "min-h-[96px] border-r border-b border-border p-1.5 text-left transition",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                  planningStudyTask
                    ? (isPlanningDateEligible(date) ? "cursor-pointer bg-primary/[0.15] hover:bg-primary/[0.22] ring-2 ring-inset ring-primary/40" : "cursor-not-allowed bg-muted/10 opacity-35")
                    : (isOtherMonth ? "cursor-pointer bg-muted/10 text-muted-foreground" : "cursor-pointer bg-card hover:bg-muted/25"),
                  isToday ? "bg-primary/[0.04]" : "",
                ].join(" ")}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span
                    className={[
                      "grid h-6 w-6 place-items-center rounded-full text-xs",
                      isToday ? "bg-primary text-primary-foreground font-semibold" : "font-medium text-foreground/85",
                      isOtherMonth && !isToday ? "text-muted-foreground" : "",
                    ].join(" ")}
                  >
                    {date.getDate()}
                  </span>
                </div>

                <div className="space-y-1">
                  {visible.map(renderMonthItem)}

                  {hiddenCount > 0 ? (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setMonthOverflowDate(date);
                      }}
                      className="px-1.5 pt-0.5 text-left text-[11px] font-semibold text-primary hover:underline"
                    >
                      +{hiddenCount} more
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        {monthOverflowDate ? (
          <div
            className="fixed inset-0 z-50 bg-black/10 p-4"
            onClick={() => setMonthOverflowDate(null)}
          >
            <div
              className="mx-auto mt-24 w-full max-w-sm rounded-2xl border border-border bg-card p-4 shadow-app-popover"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {monthOverflowDate.toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "long",
                      day: "numeric",
                    })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    All items for this day
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMonthOverflowDate(null)}
                  className="app-iconbtn h-8 w-8"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-1.5">
                {getItemsForDate(monthOverflowDate)
                  .filter(
                    (item) =>
                      !(
                        item.kind === "imported" &&
                        item.importedEvent?.kind === "class"
                      ),
                  )
                  .map(renderMonthItem)}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    );
  };

  const renderWeekView = () => {
    const days = visibleWeekDays;
    const hours = Array.from(
      { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
      (_, i) => DAY_START_HOUR + i
    );

    return (
      <div className="overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-card">
            <div className="border-r border-border" />

            {days.map((date) => {
              const isToday = isSameDay(new Date(), date);
              const weekLabel =
                timetableSettings.cycle === "fortnightly"
                  ? `Week ${getTimetableWeekForDate(date, timetableSettings)}`
                  : null;

              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => openAddMenuForDate(date)}
                  className={[
                    "border-r border-border px-2 py-3 text-center transition",
                    planningStudyTask ? (isPlanningDateEligible(date) ? "bg-primary/[0.15] hover:bg-primary/[0.22] ring-2 ring-inset ring-primary/35" : "opacity-35") : "hover:bg-muted/30",
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

                  {weekLabel ? (
                    <div className="mt-1 text-[10px] font-medium text-muted-foreground">
                      {weekLabel}
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="grid grid-cols-[64px_repeat(7,minmax(0,1fr))] border-b border-border bg-muted/[0.08]">
            <div className="border-r border-border px-2 py-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">All day</div>
            {days.map((date) => {
              const items = getAllDayItemsForDate(date);
              return (
                <div key={`all-day-${date.toISOString()}`} className="min-h-[44px] border-r border-border p-1.5">
                  <div className="space-y-1">
                    {items.slice(0, 2).map((item) => {
                      const color = getItemColor(item);
                      const palette = createEventPalette(color, item.kind, false);
                      return (
                        <button key={item.id} type="button" onClick={(event) => { event.stopPropagation(); openCalendarItem(item); }} className="flex w-full items-center gap-1.5 rounded-lg border px-2 py-1 text-left text-[10px] font-medium" style={{ borderColor: palette.border, backgroundColor: palette.background, color: palette.text }}>
                          <span className="min-w-0 flex-1 truncate">{minimalPrimary(item)}</span><span className="ml-auto shrink-0 opacity-65 max-[1180px]:hidden">{minimalSecondary(item)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={timeGridScrollRef}>
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
                const timedItems = getVisibleTimedItemsForDate(date);
                const isToday = isSameDay(new Date(), date);

                return (
                  <div
                    key={date.toISOString()}
                    role="button"
                    tabIndex={0}
                    onClick={(event) => {
                      if (!planningStudyTask) { openAddMenuForDate(date); return; }
                      if (!isPlanningDateEligible(date)) return;
                      const rect = event.currentTarget.getBoundingClientRect();
                      const rawMinutes = DAY_START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60;
                      const rounded = Math.round(rawMinutes / 15) * 15;
                      const clamped = clamp(rounded, DAY_START_HOUR * 60, DAY_END_HOUR * 60 - 15);
                      openAddMenuForDate(date, `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`);
                    }}
                    className={[
                      "relative border-r border-border bg-card text-left",
                      planningStudyTask ? (isPlanningDateEligible(date) ? "cursor-crosshair bg-primary/[0.13] hover:bg-primary/[0.20] ring-2 ring-inset ring-primary/30" : "cursor-not-allowed opacity-35") : "cursor-pointer",
                      isToday ? "bg-primary/[0.025]" : "",
                    ].join(" ")}
                    style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT }}
                  >
                    {renderHourGridLines(hours)}
                    {renderCurrentTimeLine(date)}
                    {timedItems
                      .filter((item) => item.isTimetableClass)
                      .map((item) => renderTimedItem(item))}
                    {layoutTimedItems(
                      timedItems.filter((item) => !item.isTimetableClass && !isCompactMarkerItem(item))
                    ).map(({ item, style }) => renderTimedItem(item, false, style))}
                    {layoutCompactMarkers(
                      timedItems.filter((item) => !item.isTimetableClass && isCompactMarkerItem(item))
                    ).map(({ item, style }) => renderTimedItem(item, false, style))}
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
    const timedItems = getVisibleTimedItemsForDate(currentDate);
    const hours = Array.from(
      { length: DAY_END_HOUR - DAY_START_HOUR + 1 },
      (_, i) => DAY_START_HOUR + i
    );
    const isToday = isSameDay(new Date(), currentDate);
    const weekLabel =
      timetableSettings.cycle === "fortnightly"
        ? `Week ${getTimetableWeekForDate(currentDate, timetableSettings)}`
        : null;

    return (
      <div>
        <div className="border-b border-border px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
                {weekLabel ? ` · ${weekLabel}` : ""}
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


          </div>
        </div>

        {getAllDayItemsForDate(currentDate).length > 0 ? (
          <div className="grid grid-cols-[72px_minmax(0,1fr)] border-b border-border bg-muted/[0.08]">
            <div className="border-r border-border px-3 py-3 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">All day</div>
            <div className="flex flex-wrap gap-2 p-2">
              {getAllDayItemsForDate(currentDate).map((item) => {
                const color = getItemColor(item);
                const palette = createEventPalette(color, item.kind, false);
                return (
                  <button key={item.id} type="button" onClick={() => openCalendarItem(item)} className="inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-xs font-medium" style={{ borderColor: palette.border, backgroundColor: palette.background, color: palette.text }}>
                    <span>{minimalPrimary(item)}</span><span className="opacity-65">{minimalSecondary(item)}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div ref={timeGridScrollRef}>
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
              onClick={(event) => {
                if (!planningStudyTask) { openAddMenuForDate(currentDate); return; }
                if (!isPlanningDateEligible(currentDate)) return;
                const rect = event.currentTarget.getBoundingClientRect();
                const rawMinutes = DAY_START_HOUR * 60 + ((event.clientY - rect.top) / HOUR_HEIGHT) * 60;
                const rounded = Math.round(rawMinutes / 15) * 15;
                const clamped = clamp(rounded, DAY_START_HOUR * 60, DAY_END_HOUR * 60 - 15);
                openAddMenuForDate(currentDate, `${String(Math.floor(clamped / 60)).padStart(2, "0")}:${String(clamped % 60).padStart(2, "0")}`);
              }}
              className={[
                "relative bg-card text-left",
                planningStudyTask ? (isPlanningDateEligible(currentDate) ? "cursor-crosshair bg-primary/[0.13] ring-2 ring-inset ring-primary/30" : "cursor-not-allowed opacity-35") : "cursor-pointer",
                isToday ? "bg-primary/[0.025]" : "",
              ].join(" ")}
              style={{ height: (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT }}
            >
              {renderHourGridLines(hours)}
              {renderCurrentTimeLine(currentDate, true)}
              {timedItems
                .filter((item) => item.isTimetableClass)
                .map((item) => renderTimedItem(item, true))}
              {layoutTimedItems(
                timedItems.filter((item) => !item.isTimetableClass && !isCompactMarkerItem(item))
              ).map(({ item, style }) => renderTimedItem(item, true, style))}
              {layoutCompactMarkers(
                timedItems.filter((item) => !item.isTimetableClass && isCompactMarkerItem(item))
              ).map(({ item, style }) => renderTimedItem(item, true, style))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSharedTimeFields = ({
    dateLabel,
    dateValue,
    onDateChange,
    dateError,
    startTimeValue,
    onStartTimeChange,
    startTimeError,
    durationValue,
    onDurationChange,
    durationError,
  }: {
    dateLabel: string;
    dateValue: string;
    onDateChange: (value: string) => void;
    dateError?: string;
    startTimeValue: string;
    onStartTimeChange: (value: string) => void;
    startTimeError?: string;
    durationValue?: string;
    onDurationChange?: (value: string) => void;
    durationError?: string;
  }) => (
    <div className="rounded-2xl border border-border bg-muted/[0.08] p-4">
      <div className="text-sm font-medium text-foreground">Calendar time</div>
      <div className="mt-1 text-xs leading-5 text-muted-foreground">
        This is where the item appears in the hourly calendar.
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3">
        <div>
          <label className={labelClass}>
            {dateLabel}
            <RequiredMark required />
          </label>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            Date
          </div>
          <input
            type="date"
            value={dateValue}
            onChange={(e) => onDateChange(e.target.value)}
            className={[inputBase, dateError ? inputErr : inputOk].join(" ")}
            aria-invalid={!!dateError}
          />
          <FieldError message={dateError} />
        </div>

        <div className={onDurationChange ? "grid grid-cols-1 gap-3 md:grid-cols-2" : "grid grid-cols-1 gap-3"}>
          <div>
            <label className={labelClass}>
              Start time
              <RequiredMark required />
            </label>
            <input
              type="time"
              value={startTimeValue}
              onChange={(e) => onStartTimeChange(e.target.value)}
              className={[
                "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                startTimeError
                  ? "border-red-500/50 focus-visible:ring-red-500/20"
                  : "border-border focus-visible:ring-primary/30",
              ].join(" ")}
              aria-invalid={!!startTimeError}
            />
            <FieldError message={startTimeError} />
          </div>

          {onDurationChange ? (
            <div>
              <label className={labelClass}>
                Duration
                <RequiredMark required />
              </label>
              <select
                value={durationValue}
                onChange={(e) => onDurationChange(e.target.value)}
                className={[
                  "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                  durationError
                    ? "border-red-500/50 focus-visible:ring-red-500/20"
                    : "border-border focus-visible:ring-primary/30",
                ].join(" ")}
                aria-invalid={!!durationError}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <FieldError message={durationError} />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-page-wide app-scroll-page space-y-5">
      <div className="app-page-header app-page-heading mx-auto w-full max-w-[1240px] px-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="app-page-title">Calendar</h1>
          <p className="app-page-subtitle">
            Plan study blocks, homework, assignments, exams, reminders, and timetable classes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openAddMenuForDate(currentDate)}
          className="app-btn-primary"
        >
          <Plus className="h-4 w-4" />
          Add item
        </button>
      </div>

      {planningStudyTask ? (
        <div className="sticky top-3 z-30 overflow-hidden rounded-3xl border-2 border-primary/45 bg-card shadow-2xl shadow-black/10">
          <div className="h-1.5 bg-primary" />
          <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-primary-foreground">Planning study</span>
                <span className="text-xs font-medium text-muted-foreground">Due {planningStudyTask.dueDate.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}</span>
              </div>
              <div className="mt-2 text-xs font-medium text-muted-foreground">{subjectById.get(planningStudyTask.subjectId ?? "")?.name ?? "Assessment"} · {planningStudyTask.type === "exam" ? "Exam" : "Assignment"}</div>
              <div className="mt-0.5 truncate text-lg font-semibold text-foreground">{planningStudyTask.title}</div>
              <div className="mt-2 text-sm font-medium text-foreground">Choose the days you want to prepare. Setting an exact time is optional.</div>
              {planningStudySummary ? <div className="mt-2 text-sm text-muted-foreground">{planningStudySummary.unscheduled > 0 ? <><span className="font-semibold text-primary">{formatMinutes(planningStudySummary.unscheduled)}</span> still needs to be scheduled.</> : <span className="font-semibold text-primary">Your study target is fully scheduled.</span>}</div> : null}
            </div>
            <button type="button" className="app-btn-primary h-11 shrink-0 px-5" onClick={onPlanningStudyHandled}>Done planning</button>
          </div>
        </div>
      ) : null}

      <CalendarShell>
        <div className="calendar-toolbar calendar-toolbar-polished">
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

            <div className="calendar-date-context ml-2 min-w-[220px]">
              <div className="text-lg font-semibold text-foreground">{getHeaderLabel()}</div>
              {termWeekLabel ? (
                <div className="text-xs text-muted-foreground">{termWeekLabel}</div>
              ) : timetableSettings.cycle === "fortnightly" ? (
                <div className="text-xs text-muted-foreground">
                  Week {getTimetableWeekForDate(currentDate, timetableSettings)}
                </div>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="app-switch">
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


      {planningSlot && planningStudyTask ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/35 p-4 backdrop-blur-[2px]" onMouseDown={() => setPlanningSlot(null)}>
          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="border-b border-border px-5 py-4">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-primary">Add study session</div>
              <div className="mt-1 text-lg font-semibold text-foreground">{subjectById.get(planningStudyTask.subjectId ?? "")?.name ?? planningStudyTask.title}</div>
              <div className="mt-1 text-sm text-muted-foreground">{planningSlot.date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })} · {planningTime ? displayTime(planningTime) : "Time not set"}</div>
            </div>
            <div className="px-5 py-5">
              <div className="text-sm font-medium text-foreground">How long do you want to study?</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[30, 45, 60, 90, 120, 180].map((minutes) => (
                  <button key={minutes} type="button" onClick={() => setPlanningDurationMinutes(minutes)} className={[
                    "rounded-xl border px-3 py-2.5 text-sm font-medium transition",
                    planningDurationMinutes === minutes ? "border-primary/45 bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted/40",
                  ].join(" ")}>{formatMinutes(minutes)}</button>
                ))}
              </div>
              <div className="mt-5 flex items-center justify-between rounded-xl border border-border bg-muted/[0.10] p-2">
                <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-lg text-foreground transition hover:bg-muted" onClick={() => setPlanningDurationMinutes((value) => Math.max(15, value - 15))}>−</button>
                <label className="flex items-baseline gap-2">
                  <input aria-label="Study duration in minutes" type="number" min="15" step="15" value={planningDurationMinutes} onChange={(event) => setPlanningDurationMinutes(Math.max(15, Number(event.target.value) || 15))} className="w-20 bg-transparent text-center text-2xl font-semibold text-foreground outline-none" />
                  <span className="text-xs font-medium text-muted-foreground">minutes</span>
                </label>
                <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-lg text-foreground transition hover:bg-muted" onClick={() => setPlanningDurationMinutes((value) => value + 15)}>+</button>
              </div>
              <div className="mt-4 rounded-xl border border-border bg-muted/[0.08] p-3">
                <label className="text-xs font-medium text-muted-foreground" htmlFor="planning-time">Set a time <span className="font-normal">(optional)</span></label>
                <input id="planning-time" type="time" value={planningTime} onChange={(event) => setPlanningTime(event.target.value)} className="mt-2 h-10 w-full rounded-xl border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
                {planningTime ? <button type="button" onClick={() => setPlanningTime("")} className="mt-2 text-xs font-medium text-primary hover:underline">Clear time</button> : <div className="mt-1 text-xs text-muted-foreground">Leave blank to plan only the study day.</div>}
              </div>
              <div className="mt-5 flex gap-2">
                <button type="button" className="app-btn-primary flex-1" onClick={() => addPlanningSession(planningDurationMinutes)}>Plan {formatMinutes(planningDurationMinutes)}</button>
                <button type="button" className="app-btn-secondary" onClick={() => setPlanningSlot(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
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
                <div className="text-xs text-muted-foreground">Add to calendar</div>
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
              {([
                ["study", "Study Session"],
                ["personal", "Personal Task"],
                ["homework", "Homework"],
                ["assignment", "Assignment"],
                ["exam", "Exam"],
              ] as const).map(([type, label]) => (
                <button
                  key={type}
                  onClick={() => handleAddOption(type)}
                  className="flex w-full items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 transition hover:bg-background/70"
                  type="button"
                >
                  <span className="text-sm text-foreground">{label}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}

              <div className="rounded-xl border border-border bg-muted/[0.08] px-3 py-2 text-[11px] leading-5 text-muted-foreground">
                Timetable classes are added from Settings → Timetable.
              </div>
            </div>
          </div>
        </>
      ) : null}


      {assessmentDetailTask && assessmentDetailLifecycle ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={() => setAssessmentDetailTaskId(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{typeLabel(assessmentDetailTask.type)}</span>
                  <span>•</span>
                  <span>{subjectById.get(assessmentDetailTask.subjectId ?? "")?.name ?? "Unassigned"}</span>
                </div>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
                  {assessmentDetailTask.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setAssessmentDetailTaskId(null)}
                className="app-iconbtn shrink-0"
                aria-label="Close assessment details"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div className="flex flex-wrap items-center gap-2">
                <AssessmentLifecycleBadge
                  state={assessmentDetailLifecycle.state}
                  label={assessmentDetailLifecycle.label}
                />
                <span className="text-sm text-muted-foreground">
                  Due {assessmentDetailTask.dueDate.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-[11px] text-muted-foreground">Preparation</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    <AssessmentPreparationLine
                      minutes={assessmentDetailLifecycle.stats.minutes}
                      sessions={assessmentDetailLifecycle.stats.sessions}
                    />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-muted/20 p-4">
                  <div className="text-[11px] text-muted-foreground">Last studied</div>
                  <div className="mt-1 text-sm font-semibold text-foreground">
                    {assessmentDetailLifecycle.stats.lastStudiedAt
                      ? assessmentDetailLifecycle.stats.lastStudiedAt.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "Not yet"}
                  </div>
                </div>
              </div>

              {assessmentDetailTask.result ? (
                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                  <div className="text-xs text-muted-foreground">Result</div>
                  <div className="mt-1 text-lg font-semibold text-foreground">
                    {assessmentDetailTask.result.score} / {assessmentDetailTask.result.outOf}
                  </div>
                </div>
              ) : null}

              <div className="flex flex-wrap gap-2">
                {!assessmentDetailTask.result &&
                assessmentDetailLifecycle.state !== "awaiting-result" &&
                onStudyTask ? (
                  <button
                    type="button"
                    onClick={() => {
                      const id = assessmentDetailTask.id;
                      setAssessmentDetailTaskId(null);
                      onStudyTask(id);
                    }}
                    className="app-btn-primary"
                  >
                    {assessmentDetailLifecycle.actionLabel}
                  </button>
                ) : null}
                {assessmentDetailLifecycle.state === "awaiting-result" && onViewMarks ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAssessmentDetailTaskId(null);
                      onViewMarks();
                    }}
                    className="app-btn-primary"
                  >
                    Add result
                  </button>
                ) : null}
                {assessmentDetailLifecycle.state === "completed" && onViewMarks ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAssessmentDetailTaskId(null);
                      onViewMarks();
                    }}
                    className="app-btn-primary"
                  >
                    View performance
                  </button>
                ) : null}
                {onViewTasks ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAssessmentDetailTaskId(null);
                      onViewTasks();
                    }}
                    className="app-btn-secondary"
                  >
                    View in Tasks
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() => {
                    const task = assessmentDetailTask;
                    setAssessmentDetailTaskId(null);
                    openEditTask(task);
                  }}
                  className="app-btn-secondary"
                >
                  Edit
                </button>
              </div>
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

            <div className="max-h-[76vh] space-y-4 overflow-y-auto p-5">
              {showAddForm === "study" ? (
                <>
                  <div>
                    <label className={labelClass}>
                      Title
                      <RequiredMark required />
                    </label>
                    <input
                      type="text"
                      placeholder="Study session title"
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
                      <RequiredMark required={taskFormData.type !== "personal"} />
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

                  {renderSharedTimeFields({
                    dateLabel: "Date",
                    dateValue: sessionFormData.date,
                    onDateChange: (value) => {
                      setSessionFormData({ ...sessionFormData, date: value });
                      clearError(setSessionErrors, "date");
                    },
                    dateError: sessionErrors.date,
                    startTimeValue: startTimeUiValue,
                    onStartTimeChange: (value) => {
                      setSessionFormData({
                        ...sessionFormData,
                        startTime: value,
                      });
                      clearError(setSessionErrors, "startTime");
                    },
                    startTimeError: sessionErrors.startTime,
                    durationValue: sessionFormData.duration,
                    onDurationChange: (value) => {
                      setSessionFormData({ ...sessionFormData, duration: value });
                      clearError(setSessionErrors, "duration");
                    },
                    durationError: sessionErrors.duration,
                  })}

                  <div>
                    <label className="text-sm font-medium text-foreground">Link to homework / assessment</label>
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
                          subjectId: linked.subjectId ?? p.subjectId,
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
                          No active homework or assessments
                        </option>
                      ) : (
                        linkableTasks.map((t) => {
                          const subj = t.subjectId ? subjectById.get(t.subjectId) : undefined;
                          const subjName = subj?.name ?? "Unassigned";
                          const due = t.dueDate?.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          });

                          return (
                            <option key={t.id} value={t.id}>
                              {typeLabel(t.type)} • {t.title} - {subjName} (due {due})
                            </option>
                          );
                        })
                      )}
                    </select>

                    <div className="mt-1 text-[11px] text-muted-foreground">
                      Optional. Useful when this study block is for a specific homework, assignment, or exam.
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
              ) : (
                <>
                  <div>
                    <label className={labelClass}>
                      Title
                      <RequiredMark required />
                    </label>
                    <input
                      type="text"
                      placeholder={`${typeLabel(showAddForm as Task["type"])} title`}
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

                  {taskFormData.type !== "personal" ? (
                    <div>
                      <label className={labelClass}>Subject<RequiredMark required /></label>
                      <select value={taskFormData.subjectId} onChange={(e) => { setTaskFormData({ ...taskFormData, subjectId: e.target.value }); clearError(setTaskErrors, "subjectId"); }} className={[inputBase, taskErrors.subjectId ? inputErr : inputOk].join(" ")} aria-invalid={!!taskErrors.subjectId}>
                        <option value="">Select subject</option>
                        {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
                      </select>
                      <FieldError message={taskErrors.subjectId} />
                    </div>
                  ) : null}


                  <div>
                    <label className={labelClass}>
                      {taskFormData.type === "exam" ? "Exam date" : taskFormData.type === "personal" ? "Date" : "Due date"}
                      <RequiredMark required />
                    </label>
                    <input
                      ref={taskDateInputRef}
                      type="date"
                      value={taskFormData.dueDate}
                      onChange={(e) => {
                        const value = e.currentTarget.value;
                        setTaskFormData((prev) => ({ ...prev, dueDate: value }));
                        clearError(setTaskErrors, "dueDate");
                      }}
                      className={[inputBase, taskErrors.dueDate ? inputErr : inputOk].join(" ")}
                      aria-invalid={!!taskErrors.dueDate}
                    />
                    <FieldError message={taskErrors.dueDate} />
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
