// components/studyplanner.tsx
"use client";

import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, X, CheckCircle2, Link2 } from "lucide-react";
import type { Subject, Task, StudySession } from "./models";

/* -------------------- Small form helpers -------------------- */
type SessionFormErrors = Partial<Record<"title" | "subjectId" | "date" | "startTime", string>>;

const RequiredMark = ({ required }: { required?: boolean }) =>
  required ? <span className="ml-1 text-red-500" aria-hidden="true">*</span> : null;

const FieldError = ({ message }: { message?: string }) =>
  message ? <div className="mt-1 text-xs text-red-600">{message}</div> : null;

const labelClass = "text-sm font-medium text-foreground";

/* -------------------- Time helpers -------------------- */
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

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const getWeekStart = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
};
const getWeekEnd = (d: Date) => {
  const s = getWeekStart(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return e;
};
const inRange = (d: Date, a: Date, b: Date) => {
  const t = startOfDay(d).getTime();
  return t >= startOfDay(a).getTime() && t <= startOfDay(b).getTime();
};

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

const DURATION_OPTIONS = [
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

const typeLabel = (t: Task["type"]) => {
  if (t === "assignment") return "Assignment";
  if (t === "exam") return "Exam";
  if (t === "homework") return "Homework";
  return "Task";
};

interface StudyPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession: (id: string) => void;
  onToggleSessionCompleted: (id: string) => void;
}

export function StudyPlanner({
  tasks,
  subjects,
  studySessions,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onToggleSessionCompleted,
}: StudyPlannerProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showCompleted, setShowCompleted] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [sessionForm, setSessionForm] = useState({
    title: "",
    subjectId: "",
    date: "",
    startTime: "", // stored as "h:mm AM/PM"
    duration: "60 min",
    linkedTaskId: "",
  });

  const [formErrors, setFormErrors] = useState<SessionFormErrors>({});

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);
  const getTaskById = (id: string) => tasks.find((t) => t.id === id);

  const inputBase =
    "w-full rounded-xl border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";
  const inputOk = "border-border";
  const inputErr = "border-red-500/50 focus:ring-red-500/20";

  const clearError = (key: keyof SessionFormErrors) => {
    setFormErrors((e) => {
      if (!e[key]) return e;
      const copy = { ...e };
      delete copy[key];
      return copy;
    });
  };

  const validateForm = (): boolean => {
    const next: SessionFormErrors = {};

    if (!sessionForm.title.trim()) next.title = "Title is required";
    if (!sessionForm.subjectId) next.subjectId = "Subject is required";
    if (!sessionForm.date) next.date = "Date is required";
    if (!sessionForm.startTime) next.startTime = "Start time is required";

    setFormErrors(next);
    return Object.keys(next).length === 0;
  };

  const resetForm = (preset?: Partial<typeof sessionForm>) => {
    setSessionForm({
      title: "",
      subjectId: activeTab !== "all" ? activeTab : "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
      ...(preset ?? {}),
    });
    setFormErrors({});
  };

  // ✅ Only ACTIVE tasks are linkable (not completed), and include ALL task types (task/assignment/exam/homework)
  const linkableTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed)
      .filter((t) => (sessionForm.subjectId ? t.subjectId === sessionForm.subjectId : true))
      .slice()
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks, sessionForm.subjectId]);

  // If editing a session that is linked to a now-completed / missing task, keep it visible so we don’t drop the link.
  const currentLinkedTask = useMemo(() => {
    if (!sessionForm.linkedTaskId) return null;
    return getTaskById(sessionForm.linkedTaskId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionForm.linkedTaskId, tasks]);

  const visibleSessions = useMemo(() => {
    const base = activeTab === "all" ? studySessions : studySessions.filter((s) => s.subjectId === activeTab);
    const filtered = showCompleted ? base : base.filter((s) => !s.completed);
    return filtered.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studySessions, activeTab, showCompleted]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const a = getWeekStart(now);
    const b = getWeekEnd(now);
    const inWeek = studySessions.filter((s) => inRange(s.date, a, b));
    const minutes = inWeek.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
    return {
      count: inWeek.length,
      minutes,
      label: `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
    };
  }, [studySessions]);

  const totalMinutesVisible = useMemo(
    () => visibleSessions.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0),
    [visibleSessions]
  );

  const openNew = () => {
    setEditingId(null);
    setDeletingId(null);
    setPanelOpen(true);
    resetForm();
  };

  const openEdit = (s: StudySession) => {
    setEditingId(s.id);
    setDeletingId(null);
    setPanelOpen(true);
    setSessionForm({
      title: s.title ?? "",
      subjectId: s.subjectId,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      duration: s.duration || "60 min",
      linkedTaskId: s.linkedTaskId || "",
    });
    setFormErrors({});
  };

  const closePanel = () => {
    setEditingId(null);
    setPanelOpen(false);
    setFormErrors({});
  };

  const handleSubmit = () => {
    if (!validateForm()) return;

    const payload: Omit<StudySession, "id"> = {
      title: sessionForm.title.trim(),
      subjectId: sessionForm.subjectId,
      date: new Date(sessionForm.date),
      startTime: sessionForm.startTime,
      duration: sessionForm.duration,
      linkedTaskId: sessionForm.linkedTaskId || undefined,
      ...(editingId
        ? (() => {
            const current = studySessions.find((x) => x.id === editingId);
            return { completed: current?.completed, completedAt: current?.completedAt };
          })()
        : {}),
    };

    editingId ? onUpdateStudySession(editingId, payload) : onAddStudySession(payload);
    closePanel();
  };

  // UI value for <input type="time"> needs "HH:MM"
  const startTimeUiValue = time12To24(sessionForm.startTime);

  const confirmDelete = () => {
    if (!deletingId) return;
    onDeleteStudySession(deletingId);
    setDeletingId(null);
  };

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Study Log</h1>
          <p className="text-sm text-muted-foreground">Plan, log, and review your study sessions.</p>

          <div className="pt-2">
            <div className="inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs text-muted-foreground">
              <span className="text-foreground/90 font-medium">This week</span>
              <span className="opacity-40">•</span>
              <span>{weeklySummary.label}</span>
              <span className="opacity-40">•</span>
              <span>
                {weeklySummary.count} session{weeklySummary.count === 1 ? "" : "s"}
              </span>
              <span className="opacity-40">•</span>
              <span className="text-foreground font-semibold">{formatMinutes(weeklySummary.minutes)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            type="button"
          >
            {showCompleted ? "Hide completed" : "Show completed"}
          </button>

          <button
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            type="button"
          >
            <Plus className="w-4 h-4" />
            Log session
          </button>
        </div>
      </div>

      {/* Subject tabs */}
      <div className="rounded-full border border-border bg-card p-1 flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab("all")}
          className={[
            "px-3 py-1.5 rounded-full text-sm transition",
            activeTab === "all" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
          ].join(" ")}
          type="button"
        >
          All
        </button>

        {subjects.map((s) => {
          const active = activeTab === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className={[
                "px-3 py-1.5 rounded-full text-sm transition",
                active ? "bg-muted text-foreground" : "text-foreground hover:bg-muted",
              ].join(" ")}
              style={active ? { boxShadow: `0 0 0 2px ${s.color}22` } : undefined}
              type="button"
            >
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="truncate">{s.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Sessions list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-foreground">Sessions</div>
          <div className="text-xs text-muted-foreground">
            {visibleSessions.length} session{visibleSessions.length === 1 ? "" : "s"} •{" "}
            <span className="text-foreground font-semibold">{formatMinutes(totalMinutesVisible)}</span>
          </div>
        </div>

        {visibleSessions.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-sm font-medium text-foreground">No sessions yet</div>
            <div className="mt-1 text-xs text-muted-foreground">Log your first one to start tracking progress.</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleSessions.map((s) => {
              const subj = getSubjectById(s.subjectId);
              const mins = parseDurationToMinutes(s.duration);
              const linked = s.linkedTaskId ? getTaskById(s.linkedTaskId) : undefined;

              return (
                <div
                  key={s.id}
                  className={[
                    "group flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition",
                    s.completed ? "opacity-80" : "",
                  ].join(" ")}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleSessionCompleted(s.id)}
                      className={[
                        "mt-0.5 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border transition shrink-0",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        s.completed
                          ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                          : "bg-card text-foreground border-border hover:bg-muted",
                      ].join(" ")}
                      aria-label={s.completed ? "Mark incomplete" : "Mark complete"}
                      title={s.completed ? "Completed" : "Mark as completed"}
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      {s.completed ? "Completed" : "Complete"}
                    </button>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{s.title}</div>

                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2">
                        <span>
                          {formatMinutes(mins)} • {s.startTime}
                        </span>
                        <span>• {s.date.toLocaleDateString()}</span>
                        {subj && <span>• {subj.name}</span>}
                      </div>

                      {linked ? (
                        <div className="mt-1 text-[11px] text-muted-foreground flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-1">
                            <Link2 className="h-3.5 w-3.5" />
                            Linked:
                          </span>
                          <span className="text-foreground/90">
                            {typeLabel(linked.type)} • {linked.title}
                          </span>
                          <span className="opacity-60">
                            (due {linked.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})
                          </span>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => openEdit(s)}
                      className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label="Edit"
                      type="button"
                    >
                      <Edit2 className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => setDeletingId(s.id)}
                      className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      aria-label="Delete"
                      type="button"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">{editingId ? "Edit session" : "New session"}</div>
                <div className="text-xs text-muted-foreground">
                  Add title, subject, time, duration — and optionally link a task.
                </div>
              </div>
              <button
                onClick={closePanel}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
                type="button"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <label className={labelClass} htmlFor="session-title">
                  Title
                  <RequiredMark required />
                </label>
                <input
                  id="session-title"
                  value={sessionForm.title}
                  onChange={(e) => {
                    setSessionForm({ ...sessionForm, title: e.target.value });
                    clearError("title");
                  }}
                  placeholder="Session title (e.g. Trig graphs revision)"
                  className={[inputBase, formErrors.title ? inputErr : inputOk].join(" ")}
                  aria-invalid={!!formErrors.title}
                />
                <FieldError message={formErrors.title} />
              </div>

              <div>
                <label className={labelClass} htmlFor="session-subject">
                  Subject
                  <RequiredMark required />
                </label>
                <select
                  id="session-subject"
                  value={sessionForm.subjectId}
                  onChange={(e) => {
                    const nextSubjectId = e.target.value;

                    const linked = sessionForm.linkedTaskId ? getTaskById(sessionForm.linkedTaskId) : null;
                    const shouldClearLink = linked && linked.subjectId !== nextSubjectId;

                    setSessionForm((p) => ({
                      ...p,
                      subjectId: nextSubjectId,
                      linkedTaskId: shouldClearLink ? "" : p.linkedTaskId,
                    }));
                    clearError("subjectId");
                  }}
                  className={[inputBase, formErrors.subjectId ? inputErr : inputOk].join(" ")}
                  aria-invalid={!!formErrors.subjectId}
                >
                  <option value="">Select subject</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
                <FieldError message={formErrors.subjectId} />
              </div>

              {/* Link to task (optional) */}
              <div className="space-y-1">
                <div className="text-xs font-medium text-muted-foreground">Link to task (optional)</div>

                <select
                  value={sessionForm.linkedTaskId}
                  onChange={(e) => {
                    const nextId = e.target.value;

                    if (!nextId) {
                      setSessionForm((p) => ({ ...p, linkedTaskId: "" }));
                      return;
                    }

                    const linked = getTaskById(nextId);
                    if (!linked) {
                      setSessionForm((p) => ({ ...p, linkedTaskId: "" }));
                      return;
                    }

                    setSessionForm((p) => ({
                      ...p,
                      linkedTaskId: nextId,
                      subjectId: linked.subjectId,
                    }));
                    clearError("subjectId");
                  }}
                  className={[inputBase, inputOk].join(" ")}
                >
                  <option value="">Not linked</option>

                  {currentLinkedTask && currentLinkedTask.completed ? (
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
                      const subj = getSubjectById(t.subjectId);
                      const subjName = subj?.name ?? "Unassigned";
                      const due = t.dueDate?.toLocaleDateString("en-US", { month: "short", day: "numeric" });

                      return (
                        <option key={t.id} value={t.id}>
                          {typeLabel(t.type)} • {t.title} — {subjName} (due {due})
                        </option>
                      );
                    })
                  )}
                </select>

                <div className="text-[11px] text-muted-foreground">
                  Only shows active (not completed) tasks. Linking helps Insights understand what you studied.
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className={labelClass} htmlFor="session-date">
                    Date
                    <RequiredMark required />
                  </label>
                  <input
                    id="session-date"
                    type="date"
                    value={sessionForm.date}
                    onChange={(e) => {
                      setSessionForm({ ...sessionForm, date: e.target.value });
                      clearError("date");
                    }}
                    className={[
                      "h-11 rounded-xl border bg-input-background px-3 text-sm focus:outline-none focus:ring-2",
                      formErrors.date ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:ring-primary/30",
                    ].join(" ")}
                    aria-invalid={!!formErrors.date}
                  />
                  <FieldError message={formErrors.date} />
                </div>

                <div>
                  <label className={labelClass} htmlFor="session-time">
                    Start
                    <RequiredMark required />
                  </label>
                  <input
                    id="session-time"
                    type="time"
                    value={startTimeUiValue}
                    onChange={(e) => {
                      setSessionForm({ ...sessionForm, startTime: time24To12(e.target.value) });
                      clearError("startTime");
                    }}
                    className={[
                      "h-11 rounded-xl border bg-input-background px-3 text-sm focus:outline-none focus:ring-2",
                      formErrors.startTime
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-border focus:ring-primary/30",
                    ].join(" ")}
                    aria-invalid={!!formErrors.startTime}
                  />
                  <FieldError message={formErrors.startTime} />
                </div>

                <div>
                  <label className={labelClass} htmlFor="session-duration">
                    Duration
                  </label>
                  <select
                    id="session-duration"
                    value={sessionForm.duration}
                    onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                    className="h-11 w-full rounded-xl border border-border bg-input-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    {DURATION_OPTIONS.map((d) => (
                      <option key={d.value} value={d.value}>
                        {d.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  type="button"
                >
                  {editingId ? "Save" : "Add"}
                </button>
                <button
                  onClick={closePanel}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete modal */}
      {deletingId && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this study session?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
