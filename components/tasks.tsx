// components/tasks.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Edit2,
  Plus,
  Trash2,
} from "lucide-react";

import type { Subject, Task, StudySession } from "./models";

const ALL_ACCENT = "#7A9B7F";

// Must match Settings key
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

type TaskSectionType = "homework" | "assignment" | "exam" | "personal";

type TaskFormErrors = Partial<
  Record<
    "title" | "subjectId" | "dueDate" | "scheduledDate" | "startTime" | "duration",
    string
  >
>;

const RequiredMark = ({ required }: { required?: boolean }) =>
  required ? <span className="ml-1 text-red-500" aria-hidden="true">*</span> : null;

const FieldError = ({ message }: { message?: string }) =>
  message ? <div className="mt-1 text-xs text-red-600">{message}</div> : null;

const labelClass = "text-sm font-medium text-foreground";

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

const parseDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  const s = duration.toLowerCase().trim();

  const colon = s.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  let hours = 0;
  let minutes = 0;

  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  if (hMatch) hours = Number(hMatch[1]);

  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)\b/);
  if (mMatch) minutes = Number(mMatch[1]);

  if (hMatch || mMatch) return Math.round(hours * 60 + minutes);

  const justNumber = s.match(/^\d+$/);
  if (justNumber) return Number(s);

  const firstNum = s.match(/(\d+)/);
  return firstNum ? Number(firstNum[1]) : 0;
};

const formatMinutes = (total: number): string => {
  const mins = Math.max(0, Math.round(total));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

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

const displayTime = (value?: string) => {
  const s = (value ?? "").trim();
  if (!s) return "";
  if (/^\d{2}:\d{2}$/.test(s)) return time24To12(s);
  return s;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const daysUntil = (due: Date) => {
  const a = startOfDay(new Date()).getTime();
  const b = startOfDay(due).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

const dueTone = (task: Task) => {
  if (task.completed) return "muted";
  const d = daysUntil(task.dueDate);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 3) return "soon";
  return "ok";
};

const dueChip = (dueDate: Date) => {
  const d = daysUntil(dueDate);
  if (d < 0) return "Overdue";
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `${d}d`;
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

const typeLabel = (type: TaskSectionType) => {
  if (type === "assignment") return "Assignment";
  if (type === "exam") return "Exam";
  if (type === "personal") return "Personal";
  return "Homework";
};

const sectionLabel = (type: TaskSectionType) => {
  if (type === "assignment") return "Assignments";
  if (type === "exam") return "Exams";
  if (type === "personal") return "Personal tasks";
  return "Homework";
};

interface TasksProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export function Tasks({
  tasks,
  subjects,
  studySessions,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleCompleted,
}: TasksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const [expandedSections, setExpandedSections] = useState<Record<TaskSectionType, boolean>>({
    homework: false,
    assignment: false,
    exam: false,
    personal: false,
  });

  const [showAddForm, setShowAddForm] = useState<TaskSectionType | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
    scheduledDate: "",
    startTime: "",
    duration: "60 min",
  });

  const [formErrors, setFormErrors] = useState<TaskFormErrors>({});
  const [showCompleted, setShowCompleted] = useState(false);

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

      hydrated.sort(
        (a, b) => startOfDay(a.startDate).getTime() - startOfDay(b.startDate).getTime()
      );

      setPeriods(hydrated);
    } catch {
      setPeriods([]);
    }
  }, []);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const toggleSection = (section: TaskSectionType) => {
    setExpandedSections((prev) => {
      const next = !prev[section];

      if (!next) {
        if (showAddForm === section) setShowAddForm(null);
        if (editingId) setEditingId(null);
      }

      return { ...prev, [section]: next };
    });
  };

  const filteredTasksBase =
    selectedSubject === "all"
      ? tasks
      : selectedSubject === "school"
        ? tasks.filter((task) => task.type !== "personal" && Boolean(task.subjectId))
        : selectedSubject === "personal"
          ? tasks.filter((task) => task.type === "personal" || !task.subjectId)
          : tasks.filter((task) => task.subjectId === selectedSubject);

  const filteredTasks = showCompleted
    ? filteredTasksBase
    : filteredTasksBase.filter((t) => !t.completed);

  const tasksByType = useMemo(
    () => ({
      homework: filteredTasks.filter((t) => t.type === "homework" || t.type === "task"),
      assignment: filteredTasks.filter((t) => t.type === "assignment"),
      exam: filteredTasks.filter((t) => t.type === "exam"),
      personal: filteredTasks.filter((t) => t.type === "personal" || !t.subjectId),
    }),
    [filteredTasks]
  );

  const getMinutesStudiedForTask = (taskId: string) =>
    studySessions
      .filter((s) => s.linkedTaskId === taskId)
      .reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);

  const getSectionAccentColor = () => {
    if (selectedSubject !== "all") return getSubjectById(selectedSubject)?.color || ALL_ACCENT;
    return ALL_ACCENT;
  };

  const resetForm = () => {
    setFormData({
      title: "",
      subjectId: "",
      dueDate: "",
      scheduledDate: "",
      startTime: "",
      duration: "60 min",
    });
    setFormErrors({});
  };

  const validateForm = (): boolean => {
    const next: TaskFormErrors = {};

    if (!formData.title.trim()) next.title = "Title is required";
    if (showAddForm !== "personal" && !formData.subjectId) {
      next.subjectId = "Subject is required";
    }
    if (!formData.dueDate) next.dueDate = "Due date is required";

    const hasScheduledDate = Boolean(formData.scheduledDate);
    const hasStartTime = Boolean(formData.startTime);

    if ((hasScheduledDate || hasStartTime) && !hasScheduledDate) {
      next.scheduledDate = "Scheduled date is required when adding a calendar block";
    }

    if ((hasScheduledDate || hasStartTime) && !hasStartTime) {
      next.startTime = "Start time is required when adding a calendar block";
    }

    if ((hasScheduledDate || hasStartTime) && !formData.duration) {
      next.duration = "Duration is required when adding a calendar block";
    }

    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const clearError = (key: keyof TaskFormErrors) => {
    setFormErrors((e) => {
      if (!e[key]) return e;
      const copy = { ...e };
      delete copy[key];
      return copy;
    });
  };

  const handleSubmit = (type: TaskSectionType) => {
    if (!validateForm()) return;

    const newDueDate = new Date(formData.dueDate);
    const nextScheduledDate = formData.scheduledDate ? new Date(formData.scheduledDate) : undefined;
    const nextStartTime = formData.startTime.trim() ? formData.startTime.trim() : undefined;
    const nextDuration =
      nextScheduledDate && nextStartTime ? formData.duration.trim() || "60 min" : undefined;

    if (editingId) {
      const existing = tasks.find((t) => t.id === editingId);

      const dueChanged =
        existing?.dueDate &&
        startOfDay(existing.dueDate).getTime() !== startOfDay(newDueDate).getTime();

      const computedPeriodId =
        type === "personal" ? undefined : findMatchingPeriodId(newDueDate, periods);
      const nextPeriodId =
        type === "personal" ? undefined : dueChanged ? computedPeriodId : existing?.periodId;

      onUpdateTask(editingId, {
        title: formData.title.trim(),
        subjectId: type === "personal" ? undefined : formData.subjectId,
        dueDate: newDueDate,
        type,
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
      });

      setEditingId(null);
    } else {
      const computedPeriodId =
        type === "personal" ? undefined : findMatchingPeriodId(newDueDate, periods);

      onAddTask({
        title: formData.title.trim(),
        subjectId: type === "personal" ? undefined : formData.subjectId,
        dueDate: newDueDate,
        type,
        scheduledDate: nextScheduledDate,
        startTime: nextStartTime,
        duration: nextDuration,
        periodId: computedPeriodId,
        createdAt: new Date(),
        source: "manual",
      });
    }

    resetForm();
    setShowAddForm(null);
  };

  const handleEdit = (task: Task) => {
    const safeType: TaskSectionType =
      task.type === "task" ? "homework" : task.type === "personal" || !task.subjectId ? "personal" : task.type;

    setEditingId(task.id);
    setFormErrors({});
    setFormData({
      title: task.title,
      subjectId: task.subjectId ?? "",
      dueDate: toLocalDateInputValue(task.dueDate),
      scheduledDate: task.scheduledDate ? toLocalDateInputValue(task.scheduledDate) : "",
      startTime: task.startTime ? time12To24(task.startTime) || task.startTime : "",
      duration: task.duration ?? "60 min",
    });

    setShowAddForm(safeType);
    setExpandedSections((prev) => ({ ...prev, [safeType]: true }));
  };

  const handleDelete = (id: string) => {
    onDeleteTask(id);
    setDeletingId(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setEditingId(null);
    resetForm();
  };

  const inputBase =
    "w-full rounded-xl border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
  const inputOk = "border-border";
  const inputErr = "border-red-500/50 focus-visible:ring-red-500/20";

  const renderAddForm = (type: TaskSectionType) => (
    <div className="app-card space-y-4 p-4">
      <div>
        <div className="text-sm font-semibold text-foreground">
          {editingId ? "Edit" : "New"} {typeLabel(type)}
        </div>
        <div className="mt-1 text-xs text-muted-foreground">
          {type === "personal"
            ? "Personal tasks do not need a subject."
            : "School tasks use subject colours across Calendar and Tasks."}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor={`task-title-${type}`}>
          Title
          <RequiredMark required />
        </label>
        <input
          id={`task-title-${type}`}
          type="text"
          placeholder={`${typeLabel(type)} title`}
          value={formData.title}
          onChange={(e) => {
            setFormData((p) => ({ ...p, title: e.target.value }));
            clearError("title");
          }}
          className={[inputBase, formErrors.title ? inputErr : inputOk].join(" ")}
          autoFocus
          aria-invalid={!!formErrors.title}
        />
        <FieldError message={formErrors.title} />
      </div>

      <div>
        <label className={labelClass} htmlFor={`task-subject-${type}`}>
          Subject
          <RequiredMark required={type !== "personal"} />
        </label>
        <select
          id={`task-subject-${type}`}
          value={formData.subjectId}
          onChange={(e) => {
            setFormData((p) => ({ ...p, subjectId: e.target.value }));
            clearError("subjectId");
          }}
          className={[inputBase, formErrors.subjectId ? inputErr : inputOk].join(" ")}
          aria-invalid={!!formErrors.subjectId}
        >
          {type === "personal" ? <option value="">No subject / personal</option> : <option value="">Select subject</option>}
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <FieldError message={formErrors.subjectId} />
      </div>

      <div>
        <label className={labelClass} htmlFor={`task-date-${type}`}>
          {type === "personal" ? "Date" : "Due date"}
          <RequiredMark required />
        </label>
        <input
          id={`task-date-${type}`}
          type="date"
          value={formData.dueDate}
          onChange={(e) => {
            setFormData((p) => ({ ...p, dueDate: e.target.value }));
            clearError("dueDate");
          }}
          className={[inputBase, formErrors.dueDate ? inputErr : inputOk].join(" ")}
          aria-invalid={!!formErrors.dueDate}
        />
        <FieldError message={formErrors.dueDate} />
      </div>

      <div className="rounded-2xl border border-border bg-muted/[0.08] p-4">
        <div className="flex items-start gap-2">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl border border-border bg-card">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>

          <div>
            <div className="text-sm font-medium text-foreground">Schedule on calendar</div>
            <div className="mt-1 text-xs leading-5 text-muted-foreground">
              {type === "personal"
                ? "Optional. Add a time if this personal task should appear on the Calendar."
                : "Optional. Use this for exams or planned work blocks that should appear in the Calendar hourly grid."}
            </div>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3">
          <div>
            <label
              className="text-sm font-medium text-foreground"
              htmlFor={`task-scheduled-date-${type}`}
            >
              Scheduled date
            </label>
            <input
              id={`task-scheduled-date-${type}`}
              type="date"
              value={formData.scheduledDate}
              onChange={(e) => {
                setFormData((p) => ({ ...p, scheduledDate: e.target.value }));
                clearError("scheduledDate");
              }}
              className={[inputBase, formErrors.scheduledDate ? inputErr : inputOk].join(" ")}
              aria-invalid={!!formErrors.scheduledDate}
            />
            <FieldError message={formErrors.scheduledDate} />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label
                className="text-sm font-medium text-foreground"
                htmlFor={`task-start-time-${type}`}
              >
                Start time
              </label>
              <input
                id={`task-start-time-${type}`}
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, startTime: e.target.value }));
                  clearError("startTime");
                }}
                className={[
                  "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                  formErrors.startTime
                    ? "border-red-500/50 focus-visible:ring-red-500/20"
                    : "border-border focus-visible:ring-primary/30",
                ].join(" ")}
                aria-invalid={!!formErrors.startTime}
              />
              <FieldError message={formErrors.startTime} />
            </div>

            <div>
              <label
                className="text-sm font-medium text-foreground"
                htmlFor={`task-duration-${type}`}
              >
                Duration
              </label>
              <select
                id={`task-duration-${type}`}
                value={formData.duration}
                onChange={(e) => {
                  setFormData((p) => ({ ...p, duration: e.target.value }));
                  clearError("duration");
                }}
                className={[
                  "h-11 w-full rounded-xl border bg-input-background px-4 text-sm focus:outline-none focus-visible:ring-2",
                  formErrors.duration
                    ? "border-red-500/50 focus-visible:ring-red-500/20"
                    : "border-border focus-visible:ring-primary/30",
                ].join(" ")}
                aria-invalid={!!formErrors.duration}
              >
                <option value="">Select duration</option>
                {DURATION_OPTIONS.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
              <FieldError message={formErrors.duration} />
            </div>
          </div>

          {formData.scheduledDate || formData.startTime ? (
            <button
              type="button"
              onClick={() => {
                setFormData((p) => ({
                  ...p,
                  scheduledDate: "",
                  startTime: "",
                  duration: "60 min",
                }));
                setFormErrors((e) => {
                  const copy = { ...e };
                  delete copy.scheduledDate;
                  delete copy.startTime;
                  delete copy.duration;
                  return copy;
                });
              }}
              className="app-btn-secondary h-9 px-3"
            >
              Clear scheduled time
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleSubmit(type)}
          className="app-btn-primary flex-1"
        >
          {editingId ? "Save" : "Add"}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          className="app-btn-secondary flex-1"
        >
          Cancel
        </button>
      </div>

      {periods.length === 0 ? (
        <div className="text-[11px] text-muted-foreground">
          Tip: add your Term dates in Settings so homework and assessments can be grouped automatically.
        </div>
      ) : null}
    </div>
  );

  const SectionHeader = ({
    type,
    label,
    count,
  }: {
    type: TaskSectionType;
    label: string;
    count: number;
  }) => {
    const isExpanded = expandedSections[type];
    const accent = type === "personal" ? "#64748b" : getSectionAccentColor();

    return (
      <div
        className="app-card flex items-center justify-between px-4 py-3"
        style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      >
        <button
          onClick={() => toggleSection(type)}
          className="flex flex-1 items-center gap-3 rounded-xl text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          type="button"
        >
          <div className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-muted/20">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">{count} items</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setExpandedSections((prev) => ({ ...prev, [type]: true }));
            setShowAddForm(showAddForm === type ? null : type);
            setEditingId(null);
            resetForm();
          }}
          className="app-btn-primary h-9 px-3"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const subject = task.subjectId ? getSubjectById(task.subjectId) : undefined;
    const studiedMins = getMinutesStudiedForTask(task.id);
    const tone = dueTone(task);
    const hasScheduledBlock = Boolean(task.scheduledDate && task.startTime);

    const isPersonal = task.type === "personal" || !task.subjectId;
    const safeTypeLabel =
      isPersonal
        ? "Personal"
        : task.type === "assignment"
          ? "Assignment"
          : task.type === "exam"
            ? "Exam"
            : "Homework";

    const toneBorder =
      tone === "overdue"
        ? "border-red-500/30"
        : tone === "today"
          ? "border-orange-500/30"
          : tone === "soon"
            ? "border-yellow-500/30"
            : "border-border";

    const toneWash =
      tone === "overdue"
        ? "bg-red-500/5"
        : tone === "today"
          ? "bg-orange-500/5"
          : tone === "soon"
            ? "bg-yellow-500/5"
            : "bg-card";

    const chipClass =
      tone === "overdue"
        ? "border-red-500/20 bg-red-500/10 text-red-700 dark:text-red-300"
        : tone === "today"
          ? "border-orange-500/20 bg-orange-500/10 text-orange-700 dark:text-orange-300"
          : tone === "soon"
            ? "border-yellow-500/20 bg-yellow-500/10 text-yellow-700 dark:text-yellow-300"
            : "border-border bg-muted/40 text-foreground";

    return (
      <div
        className={[
          "group rounded-2xl border px-4 py-3 shadow-app-card transition hover:bg-background/40 hover:shadow-app-card-hover",
          toneBorder,
          toneWash,
          task.completed ? "opacity-75" : "",
        ].join(" ")}
        style={{ borderLeftWidth: 4, borderLeftColor: subject?.color ?? "#64748b" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => onToggleCompleted(task.id)}
              className="grid h-5 w-5 shrink-0 place-items-center rounded border border-border bg-background/40 transition hover:bg-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            >
              {task.completed ? <div className="h-3 w-3 rounded-sm bg-primary" /> : null}
            </button>

            <div className="min-w-0">
              <div
                className={[
                  "truncate text-sm font-medium",
                  task.completed ? "text-muted-foreground line-through" : "text-foreground",
                ].join(" ")}
              >
                {task.title}
              </div>

              <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span>{safeTypeLabel}</span>

                {subject ? (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="truncate">{subject.name}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>{isPersonal ? "Personal" : "Unassigned"}</span>
                  </>
                )}

                {studiedMins > 0 ? (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Studied {formatMinutes(studiedMins)}</span>
                  </>
                ) : null}

                {hasScheduledBlock && task.scheduledDate ? (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>
                        {task.scheduledDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        {displayTime(task.startTime)}
                        {task.duration ? ` · ${task.duration}` : ""}
                      </span>
                    </span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <Calendar className="h-3.5 w-3.5" />
              <span>{task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>

            <span className={["rounded-full border px-2 py-1 text-xs font-medium", chipClass].join(" ")}>
              {dueChip(task.dueDate)}
            </span>

            <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
              <button
                type="button"
                onClick={() => handleEdit(task)}
                className="app-iconbtn"
                aria-label="Edit"
              >
                <Edit2 className="h-4 w-4 text-foreground" />
              </button>

              <button
                type="button"
                onClick={() => setDeletingId(task.id)}
                className="app-iconbtn"
                aria-label="Delete"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (taskList: Task[], type: TaskSectionType) => {
    const label = sectionLabel(type);
    const isExpanded = expandedSections[type];
    const sortedTasks = [...taskList].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
      <div className="space-y-3">
        <SectionHeader type={type} label={label} count={sortedTasks.length} />

        {isExpanded ? (
          <div className="ml-3 space-y-3 border-l border-border/60 pl-3 sm:ml-5 sm:pl-4">
            {showAddForm === type ? renderAddForm(type) : null}

            {sortedTasks.length ? (
              <div className="space-y-2">
                {sortedTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
                <div className="text-sm font-medium text-foreground">No {label.toLowerCase()} yet</div>
                <div className="mt-1 text-xs text-muted-foreground">Click “Add” to create one.</div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="app-page space-y-5">
      <div>
        <h1 className="app-page-title">Tasks</h1>
        <p className="app-page-subtitle">
          Organise homework, assignments, exams, and personal tasks.
        </p>
      </div>

      <div className="app-card flex flex-wrap gap-2 p-2">
        <button
          type="button"
          onClick={() => setSelectedSubject("all")}
          className={[
            "app-pill",
            selectedSubject === "all" ? "app-pill-active" : "",
          ].join(" ")}
        >
          All
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject("school")}
          className={[
            "app-pill",
            selectedSubject === "school" ? "app-pill-active" : "",
          ].join(" ")}
        >
          School
        </button>

        <button
          type="button"
          onClick={() => setSelectedSubject("personal")}
          className={[
            "app-pill",
            selectedSubject === "personal" ? "app-pill-active" : "",
          ].join(" ")}
        >
          Personal
        </button>

        {subjects.map((s) => {
          const active = selectedSubject === s.id;

          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={[
                "app-pill",
                active ? "app-pill-active" : "",
              ].join(" ")}
              style={{ boxShadow: active ? `0 0 0 2px ${s.color}33` : undefined }}
            >
              <span className="inline-flex min-w-0 items-center gap-2">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="truncate text-foreground">{s.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {filteredTasks.length} showing{selectedSubject !== "all" ? " (filtered)" : ""}
        </div>

        <button
          type="button"
          onClick={() => setShowCompleted((v) => !v)}
          className="app-btn-secondary h-9 px-3"
        >
          {showCompleted ? "Hide completed" : "Show completed"}
        </button>
      </div>

      <div className="app-section">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Workboard</div>
        </div>

        <div className="space-y-4">
          {renderSection(tasksByType.homework, "homework")}
          {renderSection(tasksByType.assignment, "assignment")}
          {renderSection(tasksByType.exam, "exam")}
          {renderSection(tasksByType.personal, "personal")}
        </div>
      </div>

      {deletingId ? (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setDeletingId(null)} />

          <div className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">Delete this item?</div>
              <div className="mt-1 text-xs text-muted-foreground">This action cannot be undone.</div>
            </div>

            <div className="flex justify-end gap-2 p-5">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="app-btn-secondary"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="app-btn-danger"
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