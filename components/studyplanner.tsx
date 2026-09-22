// components/studyplanner.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Edit2, Trash2, X, Link2, Lock, Sparkles } from "lucide-react";
import type { Subject, Task, StudySession } from "./models";
import { StudyInsights } from "./studyinsights";
import { StudyTimer, type StudyTimerStartRequest } from "./studytimer";
import { trackProductEvent } from "@/lib/productAnalytics";
import { isAssessmentTask } from "./assessmentLifecycle";

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
  onUpdateTask?: (id: string, task: Omit<Task, "id">) => void;
  onPlanStudy?: (taskId: string) => void;
  hasPremium?: boolean;
  onGoToSettings?: () => void;
  initialTaskId?: string | null;
  onInitialTaskHandled?: () => void;
}

export function StudyPlanner({
  tasks,
  subjects,
  studySessions,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onUpdateTask,
  onPlanStudy,
  hasPremium = false,
  onGoToSettings,
  initialTaskId = null,
  onInitialTaskHandled,
}: StudyPlannerProps) {
  const [studyView, setStudyView] = useState<"focus" | "log" | "insights">("focus");
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [sessionIntent, setSessionIntent] = useState<"plan" | "log">("log");

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
  const [targetTaskId, setTargetTaskId] = useState<string | null>(null);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);
  const [targetHours, setTargetHours] = useState("3");
  const [showCompletedStudy, setShowCompletedStudy] = useState(false);
  const [timerStartRequest, setTimerStartRequest] = useState<StudyTimerStartRequest | null>(null);
  const timerSectionRef = useRef<HTMLDivElement>(null);

  const getSubjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined);
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
      subjectId: activeSubject !== "all" ? activeSubject : "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
      ...(preset ?? {}),
    });
    setFormErrors({});
  };

  // ✅ Only ACTIVE tasks are linkable (not completed)
  const linkableTasks = useMemo(() => {
    return tasks
      .filter((t) => !t.completed && t.type !== "personal" && Boolean(t.subjectId))
      .filter((t) => (sessionForm.subjectId ? t.subjectId === sessionForm.subjectId : true))
      .slice()
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks, sessionForm.subjectId]);

  const currentLinkedTask = useMemo(() => {
    if (!sessionForm.linkedTaskId) return null;
    return getTaskById(sessionForm.linkedTaskId) ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionForm.linkedTaskId, tasks]);

  const studyStatsByTask = useMemo(() => {
    const map = new Map<string, { minutes: number; sessions: number; lastStudiedAt: Date | null }>();

    for (const session of studySessions) {
      if (!session.completed || !session.linkedTaskId) continue;
      const current = map.get(session.linkedTaskId) ?? { minutes: 0, sessions: 0, lastStudiedAt: null };
      current.minutes += parseDurationToMinutes(session.duration);
      current.sessions += 1;
      if (!current.lastStudiedAt || session.date.getTime() > current.lastStudiedAt.getTime()) {
        current.lastStudiedAt = session.date;
      }
      map.set(session.linkedTaskId, current);
    }

    return map;
  }, [studySessions]);

  const assessmentOverview = useMemo(() => {
    return tasks
      .filter((task) => isAssessmentTask(task) && !task.completed)
      .map((task) => {
        const completedMinutes = studySessions
          .filter((session) => session.completed && session.linkedTaskId === task.id)
          .reduce((sum, session) => sum + parseDurationToMinutes(session.duration), 0);
        const plannedMinutes = studySessions
          .filter((session) => !session.completed && session.linkedTaskId === task.id)
          .reduce((sum, session) => sum + parseDurationToMinutes(session.duration), 0);
        const targetMinutes = task.targetStudyMinutes ?? 180;
        const remainingMinutes = Math.max(0, targetMinutes - completedMinutes);
        const unscheduledMinutes = Math.max(0, targetMinutes - completedMinutes - plannedMinutes);
        const daysLeft = Math.ceil((startOfDay(task.dueDate).getTime() - startOfDay(new Date()).getTime()) / 86_400_000);
        return { task, completedMinutes, plannedMinutes, targetMinutes, remainingMinutes, unscheduledMinutes, daysLeft };
      })
      .sort((a, b) => a.task.dueDate.getTime() - b.task.dueDate.getTime());
  }, [tasks, studySessions]);

  const saveStudyTarget = () => {
    if (!targetTaskId || !onUpdateTask) return;
    const task = tasks.find((item) => item.id === targetTaskId);
    if (!task) return;
    const hours = Math.max(0.25, Number(targetHours) || 3);
    onUpdateTask(task.id, { ...task, targetStudyMinutes: Math.round(hours * 60) });
    setTargetTaskId(null);
  };

  const openLogForTask = (task: Task) => {
    setSessionIntent("log");
    setEditingId(null);
    setDeletingId(null);
    setPanelOpen(true);
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    resetForm({
      title: task.title,
      subjectId: task.subjectId ?? "",
      date: localDate,
      startTime: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
      duration: "60 min",
      linkedTaskId: task.id,
    });
  };

  const startTimerForTask = (task: Task) => {
    setStudyView("focus");
    setDetailTaskId(null);
    setTimerStartRequest({
      key: Date.now(),
      subjectId: task.subjectId ?? "",
      linkedTaskId: task.id,
      title: task.title,
    });
    requestAnimationFrame(() => timerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const startTimerForSession = (session: StudySession) => {
    setStudyView("focus");
    setTimerStartRequest({
      key: Date.now(),
      subjectId: session.subjectId,
      linkedTaskId: session.linkedTaskId,
      plannedSessionId: session.id,
      title: session.title || "Study session",
    });
    requestAnimationFrame(() => timerSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const filteredSessions = useMemo(() => {
    const base = activeSubject === "all" ? studySessions : studySessions.filter((s) => s.subjectId === activeSubject);
    return base.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studySessions, activeSubject]);

  const completedSessions = useMemo(
    () => filteredSessions.filter((session) => session.completed),
    [filteredSessions]
  );

  const plannedSessions = useMemo(
    () => filteredSessions.filter((session) => !session.completed).sort((a, b) => a.date.getTime() - b.date.getTime()),
    [filteredSessions]
  );

  useEffect(() => {
    if (!initialTaskId) return;
    setStudyView("focus");
    onInitialTaskHandled?.();
  }, [initialTaskId, onInitialTaskHandled]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const a = getWeekStart(now);
    const b = getWeekEnd(now);
    const inWeek = studySessions.filter((s) => s.completed && inRange(s.date, a, b));
    const minutes = inWeek.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
    return {
      count: inWeek.length,
      minutes,
      label: `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString(
        "en-US",
        { month: "short", day: "numeric" }
      )}`,
    };
  }, [studySessions]);

  const totalCompletedMinutesVisible = useMemo(
    () => completedSessions.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0),
    [completedSessions]
  );

  const getNowPreset = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000)
      .toISOString()
      .slice(0, 10);
    return {
      date: localDate,
      startTime: now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
    };
  };

  const openNew = () => {
    setSessionIntent("log");
    setEditingId(null);
    setDeletingId(null);
    setPanelOpen(true);
    resetForm(getNowPreset());
  };


  const openEdit = (s: StudySession) => {
    setSessionIntent(s.completed ? "log" : "plan");
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
        : sessionIntent === "log"
          ? { completed: true, completedAt: new Date() }
          : { completed: false, completedAt: undefined }),
    };

    editingId ? onUpdateStudySession(editingId, payload) : onAddStudySession(payload);
    closePanel();
  };

  const startTimeUiValue = time12To24(sessionForm.startTime);

  const confirmDelete = () => {
    if (!deletingId) return;
    onDeleteStudySession(deletingId);
    setDeletingId(null);
  };

  const showPremiumInsightsLock = studyView === "insights" && !hasPremium;

  return (
    <div className="app-page app-scroll-page space-y-4">
      {/* Header */}
      <div className="app-page-heading">
        <h1 className="app-page-title">Study</h1>
        <p className="app-page-subtitle">Turn upcoming work into focused study sessions, then see what you actually did.</p>
      </div>

      <div className="app-control-bar flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="app-switch">
            <button
              type="button"
              onClick={() => setStudyView("focus")}
              className={["app-switch-item", studyView === "focus" ? "app-switch-item-active" : ""].join(" ")}
            >
              Focus
            </button>
            <button
              type="button"
              onClick={() => setStudyView("log")}
              className={["app-switch-item", studyView === "log" ? "app-switch-item-active" : ""].join(" ")}
            >
              Log
            </button>
            <button
              type="button"
              onClick={() => setStudyView("insights")}
              className={["app-switch-item", studyView === "insights" ? "app-switch-item-active" : ""].join(" ")}
            >
              <Sparkles className="h-3.5 w-3.5" />
              Insights
              {!hasPremium ? <Lock className="h-3.5 w-3.5" /> : null}
            </button>
          </div>

          <div className="app-inline-summary">
            <span className="font-medium text-foreground">This week</span>
            <span className="opacity-40">•</span>
            <span>{weeklySummary.count} completed session{weeklySummary.count === 1 ? "" : "s"}</span>
            <span className="opacity-40">•</span>
            <span className="font-semibold text-foreground">{formatMinutes(weeklySummary.minutes)}</span>
          </div>
        </div>

      </div>

      {studyView === "focus" ? (
        <div ref={timerSectionRef} className="scroll-mt-4">
          <StudyTimer
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddStudySession={onAddStudySession}
            onUpdateStudySession={onUpdateStudySession}
            startRequest={timerStartRequest}
          />
        </div>
      ) : null}

      {studyView === "focus" ? (
        <>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="border-b border-border px-5 py-4">
              <div className="text-sm font-semibold text-foreground">Upcoming assessments</div>
              <div className="mt-0.5 text-xs text-muted-foreground">Choose an assessment to plan, study or review your preparation.</div>
            </div>
            {assessmentOverview.length === 0 ? (
              <div className="app-empty-state border-0">
                <div className="text-sm font-medium text-foreground">No active assessments</div>
                <div className="mt-1 text-xs text-muted-foreground">Assignments and exams will appear here automatically.</div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {assessmentOverview.map(({ task, completedMinutes, targetMinutes, daysLeft }) => {
                  const subject = getSubjectById(task.subjectId);
                  const progress = Math.min(100, (completedMinutes / Math.max(1, targetMinutes)) * 100);
                  return (
                    <button
                      key={task.id}
                      type="button"
                      onClick={() => setDetailTaskId(task.id)}
                      className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-muted/25"
                    >
                      <span className="h-3 w-3 shrink-0 rounded-full border border-border" style={{ backgroundColor: subject?.color ?? "#94a3b8" }} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
                          <span className="font-medium">{subject?.name ?? "Assessment"}</span>
                          <span>·</span>
                          <span className="font-medium">{typeLabel(task.type)}</span>
                          <span>·</span>
                          <span>{daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}</span>
                        </div>
                        <div className="mt-1 truncate text-sm font-semibold text-foreground">{task.title}</div>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                          </div>
                          <span className="shrink-0 text-xs text-muted-foreground">{formatMinutes(completedMinutes)} / {formatMinutes(targetMinutes)}</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {detailTaskId ? (() => {
            const overview = assessmentOverview.find((item) => item.task.id === detailTaskId);
            if (!overview) return null;
            const { task, completedMinutes, plannedMinutes, targetMinutes, remainingMinutes, unscheduledMinutes, daysLeft } = overview;
            const subject = getSubjectById(task.subjectId);
            const sessions = studySessions.filter((session) => !session.completed && session.linkedTaskId === task.id).sort((a, b) => a.date.getTime() - b.date.getTime());
            return (
              <div className="fixed inset-0 z-[80] grid place-items-center bg-black/35 p-4" onMouseDown={() => setDetailTaskId(null)}>
                <div className="app-card w-full max-w-xl p-5" onMouseDown={(event) => event.stopPropagation()}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-full border border-border" style={{ backgroundColor: subject?.color ?? "#94a3b8" }} />
                        <span>{subject?.name ?? "Subject"}</span><span>·</span><span>{typeLabel(task.type)}</span>
                      </div>
                      <div className="mt-2 text-xl font-semibold text-foreground">{task.title}</div>
                      <div className="mt-1 text-sm text-muted-foreground">{daysLeft < 0 ? "Overdue" : daysLeft === 0 ? "Due today" : `Due in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}</div>
                    </div>
                    <button type="button" className="app-iconbtn" onClick={() => setDetailTaskId(null)} aria-label="Close"><X className="h-4 w-4" /></button>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Target</div><div className="mt-1 text-sm font-semibold text-foreground">{formatMinutes(targetMinutes)}</div></div>
                    <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Completed</div><div className="mt-1 text-sm font-semibold text-foreground">{formatMinutes(completedMinutes)}</div></div>
                    <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Planned</div><div className="mt-1 text-sm font-semibold text-foreground">{formatMinutes(plannedMinutes)}</div></div>
                    <div><div className="text-[10px] uppercase tracking-wide text-muted-foreground">Remaining</div><div className="mt-1 text-sm font-semibold text-foreground">{formatMinutes(remainingMinutes)}</div></div>
                  </div>

                  <div className="mt-5 h-2 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(100, (completedMinutes / Math.max(1, targetMinutes)) * 100)}%` }} />
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">{unscheduledMinutes > 0 ? `${formatMinutes(unscheduledMinutes)} still needs to be scheduled.` : "Your remaining target is scheduled."}</div>

                  {sessions.length > 0 ? (
                    <div className="mt-5 border-t border-border pt-4">
                      <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Planned sessions</div>
                      <div className="mt-2 space-y-2">
                        {sessions.slice(0, 4).map((session) => (
                          <div key={session.id} className="flex items-center justify-between text-sm">
                            <span className="text-foreground">{session.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })} · {session.startTime}</span>
                            <span className="text-muted-foreground">{formatMinutes(parseDurationToMinutes(session.duration))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-wrap gap-2">
                    <button type="button" className="app-btn-primary" onClick={() => startTimerForTask(task)}>Study now</button>
                    {onPlanStudy ? <button type="button" className="app-btn-secondary" onClick={() => { setDetailTaskId(null); onPlanStudy(task.id); }}>Plan study</button> : null}
                    <button type="button" className="app-btn-secondary" onClick={() => { setDetailTaskId(null); openLogForTask(task); }}>Log study</button>
                    <button
                      type="button"
                      className="app-btn-ghost"
                      onClick={() => {
                        setTargetTaskId(task.id);
                        setTargetHours(String((targetMinutes / 60).toFixed(targetMinutes % 60 === 0 ? 0 : 1)));
                      }}
                    >
                      Edit target
                    </button>
                  </div>

                  {targetTaskId === task.id ? (
                    <div className="mt-4 rounded-2xl border border-border bg-muted/[0.12] p-4">
                      <div className="text-sm font-semibold text-foreground">Study target</div>
                      <div className="mt-1 text-xs text-muted-foreground">Set the total preparation time you want for this assessment.</div>
                      <div className="mt-3 flex items-center gap-2">
                        <input
                          type="number"
                          min="0.25"
                          step="0.25"
                          value={targetHours}
                          onChange={(event) => setTargetHours(event.target.value)}
                          className="h-10 w-28 rounded-xl border border-border bg-input-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/30"
                        />
                        <span className="text-sm text-muted-foreground">hours</span>
                        <button type="button" className="app-btn-primary ml-auto h-10 px-4" onClick={saveStudyTarget}>Save</button>
                        <button type="button" className="app-btn-ghost h-10 px-3" onClick={() => setTargetTaskId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })() : null}
        </>
      ) : studyView === "log" ? (
        <>
          <div className="app-filter-scroll app-filter-scroll-compact">
            <div className="app-filter-scroll-track">
              <button
                onClick={() => setActiveSubject("all")}
                className={[
                  "px-3 py-1.5 rounded-full text-sm transition",
                  activeSubject === "all" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
                ].join(" ")}
                type="button"
              >
                All
              </button>

              {subjects.map((subject) => {
                const active = activeSubject === subject.id;
                return (
                  <button
                    key={subject.id}
                    onClick={() => setActiveSubject(subject.id)}
                    className={[
                      "shrink-0 rounded-full border px-2.5 py-1.5 text-sm transition",
                      active ? "text-foreground" : "border-transparent text-foreground hover:bg-muted",
                    ].join(" ")}
                    style={active ? { boxShadow: `0 0 0 1px ${subject.color}55`, backgroundColor: `${subject.color}14`, borderColor: `${subject.color}55` } : undefined}
                    type="button"
                  >
                    <span className="inline-flex min-w-0 items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full border border-border" style={{ backgroundColor: subject.color }} />
                      <span className="truncate">{subject.name}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-border bg-card">
              <button type="button" onClick={() => setShowCompletedStudy((value) => !value)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-muted/20">
                <div>
                  <div className="text-sm font-semibold text-foreground">Completed study</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{completedSessions.length} session{completedSessions.length === 1 ? "" : "s"} · {formatMinutes(totalCompletedMinutesVisible)}</div>
                </div>
                <span className="text-xs font-medium text-muted-foreground">{showCompletedStudy ? "Hide" : "Show history"}</span>
              </button>

              {showCompletedStudy ? (
                completedSessions.length === 0 ? (
                  <div className="border-t border-border px-5 py-5 text-sm text-muted-foreground">No completed study yet.</div>
                ) : (
                  <div className="divide-y divide-border border-t border-border">
                    {completedSessions.map((session) => {
                      const subject = getSubjectById(session.subjectId);
                      const mins = parseDurationToMinutes(session.duration);
                      const linked = session.linkedTaskId ? getTaskById(session.linkedTaskId) : undefined;
                      return (
                        <div key={session.id} className="group flex items-start justify-between gap-4 px-5 py-3.5 transition">
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-medium text-foreground">{session.title}</div>
                            <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                              <span>{formatMinutes(mins)} · {session.date.toLocaleDateString()}</span>
                              {subject ? <span>· {subject.name}</span> : null}
                              {linked ? <span>· {typeLabel(linked.type)}</span> : null}
                            </div>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 opacity-70 transition group-hover:opacity-100">
                            <button onClick={() => openEdit(session)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted" aria-label="Edit" type="button"><Edit2 className="h-4 w-4 text-foreground" /></button>
                            <button onClick={() => setDeletingId(session.id)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted" aria-label="Delete" type="button"><Trash2 className="h-4 w-4 text-muted-foreground" /></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : null}
            </div>

            <div className="app-card app-session-list overflow-hidden">
              <div className="app-card-header flex items-center justify-between gap-3 bg-muted/20">
                <div>
                  <div className="text-sm font-semibold text-foreground">Planned sessions</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Scheduled preparation. These do not count as study until completed.</div>
                </div>
                <div className="text-xs text-muted-foreground">{plannedSessions.length} planned</div>
              </div>

              {plannedSessions.length === 0 ? (
                <div className="app-empty-state border-0">
                  <div className="text-sm font-medium text-foreground">Nothing planned</div>
                  <div className="mt-1 text-xs text-muted-foreground">Use Plan study on an assessment to schedule preparation on Calendar.</div>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {plannedSessions.map((session) => {
                    const subject = getSubjectById(session.subjectId);
                    const mins = parseDurationToMinutes(session.duration);
                    const linked = session.linkedTaskId ? getTaskById(session.linkedTaskId) : undefined;
                    return (
                      <div key={session.id} className="app-session-row group flex items-start justify-between gap-4 px-5 py-3.5 transition">
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{session.title}</div>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                            <span>{formatMinutes(mins)} • {session.startTime}</span>
                            <span>• {session.date.toLocaleDateString()}</span>
                            {subject ? <span>• {subject.name}</span> : null}
                          </div>
                          {linked ? (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                              <span className="inline-flex items-center gap-1"><Link2 className="h-3.5 w-3.5" />Linked:</span>
                              <span className="text-foreground/90">{typeLabel(linked.type)} • {linked.title}</span>
                            </div>
                          ) : null}
                        </div>
                        <div className="flex shrink-0 items-center gap-1 opacity-80 transition group-hover:opacity-100 group-focus-within:opacity-100">
                          <button
                            type="button"
                            onClick={() => startTimerForSession(session)}
                            className="mr-1 inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 text-[11px] font-medium text-muted-foreground transition hover:bg-muted hover:text-foreground"
                          >
                            Start with timer
                          </button>
                          <button onClick={() => openEdit(session)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted" aria-label="Edit" type="button">
                            <Edit2 className="h-4 w-4 text-foreground" />
                          </button>
                          <button onClick={() => setDeletingId(session.id)} className="grid h-9 w-9 place-items-center rounded-xl transition hover:bg-muted" aria-label="Delete" type="button">
                            <Trash2 className="h-4 w-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      ) : showPremiumInsightsLock ? (
        <div className="app-card p-8">
          <div className="mx-auto flex max-w-xl flex-col items-center text-center">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-primary-softer text-primary">
              <Lock className="h-6 w-6" />
            </div>

            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Study insights are Premium
            </h2>

            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep logging sessions for free. Upgrade to unlock streaks, subject breakdowns,
              busiest days, and assessment-linked study analytics.
            </p>

            <button
              type="button"
              onClick={onGoToSettings}
              className="app-btn-primary mt-6"
            >
              View Premium
            </button>
          </div>
        </div>
      ) : (
        <StudyInsights
          subjects={subjects}
          tasks={tasks}
          studySessions={studySessions}
        />
      )}

      {targetTaskId && targetTaskId !== detailTaskId ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-black/40 p-4" onMouseDown={() => setTargetTaskId(null)}>
          <div className="app-card w-full max-w-sm p-5" onMouseDown={(event) => event.stopPropagation()}>
            <div className="text-lg font-semibold text-foreground">Study target</div>
            <div className="mt-1 text-sm text-muted-foreground">How much total preparation are you aiming to complete for this assessment?</div>
            <label className="mt-5 block text-sm font-medium text-foreground">Target hours</label>
            <input type="number" min="0.25" step="0.25" value={targetHours} onChange={(event) => setTargetHours(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <div className="mt-5 flex gap-2"><button type="button" className="app-btn-primary flex-1" onClick={saveStudyTarget}>Save target</button><button type="button" className="app-btn-secondary" onClick={() => setTargetTaskId(null)}>Cancel</button></div>
          </div>
        </div>
      ) : null}

      {/* Add / Edit panel */}
      {studyView !== "insights" && panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">
                  {editingId ? "Edit session" : sessionIntent === "plan" ? "Plan study session" : "Log completed study"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {sessionIntent === "plan"
                    ? "Schedule preparation now and mark it complete after you study."
                    : "Record study you have already completed. It will count toward Insights immediately."}
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
                      subjectId: linked.subjectId ?? sessionForm.subjectId,
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

                <div className="text-[11px] text-muted-foreground/90">
                  Only shows active (not completed) tasks. Linking helps Insights understand what you studied.
                </div>
              </div>

              {/* ✅ FIXED: prevents overlap + consistent spacing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
                <div className="space-y-1">
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
                      "h-11 w-full rounded-xl border bg-input-background px-3 text-sm focus:outline-none focus:ring-2",
                      formErrors.date ? "border-red-500/50 focus:ring-red-500/20" : "border-border focus:ring-primary/30",
                    ].join(" ")}
                    aria-invalid={!!formErrors.date}
                  />
                  <FieldError message={formErrors.date} />
                </div>

                <div className="space-y-1">
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
                      "h-11 w-full rounded-xl border bg-input-background px-3 text-sm focus:outline-none focus:ring-2",
                      formErrors.startTime
                        ? "border-red-500/50 focus:ring-red-500/20"
                        : "border-border focus:ring-primary/30",
                    ].join(" ")}
                    aria-invalid={!!formErrors.startTime}
                  />
                  <FieldError message={formErrors.startTime} />
                </div>

                <div className="space-y-1">
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
                  {editingId ? "Save" : sessionIntent === "plan" ? "Plan session" : "Log completed study"}
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
