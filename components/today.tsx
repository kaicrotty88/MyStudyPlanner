"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pause,
  Play,
  RotateCcw,
  Square,
  TimerReset,
} from "lucide-react";

import type {
  Subject,
  StudySession,
  Task,
  TimetableClass,
  TimetablePeriod,
  TimetableSettings,
} from "./models";
import { isAssessmentTask } from "./assessmentLifecycle";

const TIMER_STORAGE_KEY = "mystudyplanner-live-study-timer";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
];

type TimerState = {
  running: boolean;
  startedAt: number | null;
  accumulatedSeconds: number;
  subjectId: string;
  linkedTaskId?: string;
  plannedSessionId?: string;
  title: string;
};

const EMPTY_TIMER: TimerState = {
  running: false,
  startedAt: null,
  accumulatedSeconds: 0,
  subjectId: "",
  title: "",
};

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

const parseDurationToMinutes = (duration?: string) => {
  if (!duration) return 0;
  const s = duration.toLowerCase().trim();
  const colon = s.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);
  let hours = 0;
  let minutes = 0;
  const h = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  const m = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)\b/);
  if (h) hours = Number(h[1]);
  if (m) minutes = Number(m[1]);
  if (h || m) return Math.round(hours * 60 + minutes);
  const n = s.match(/\d+/);
  return n ? Number(n[0]) : 0;
};

const formatMinutes = (minutes: number) => {
  const mins = Math.max(0, Math.round(minutes));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
};

const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  if (h > 0) return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const to24HourMinutes = (value?: string) => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  return Number(match[1]) * 60 + Number(match[2]);
};

const currentCycleWeek = (settings: TimetableSettings, date: Date): "A" | "B" => {
  if (settings.cycle !== "fortnightly" || !settings.cycleStartDate) return "A";
  const start = startOfDay(settings.cycleStartDate);
  const target = startOfDay(date);
  const diffDays = Math.floor((target.getTime() - start.getTime()) / 86_400_000);
  const weekIndex = Math.floor(diffDays / 7);
  return ((weekIndex % 2) + 2) % 2 === 0 ? "A" : "B";
};

interface TodayProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  timetableSettings: TimetableSettings;
  timetablePeriods: TimetablePeriod[];
  timetableClasses: TimetableClass[];
  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession: (id: string, session: Omit<StudySession, "id">) => void;
  onToggleTaskCompleted: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onPlanStudy: (taskId: string) => void;
}

export function Today({
  tasks,
  subjects,
  studySessions,
  timetableSettings,
  timetablePeriods,
  timetableClasses,
  onAddStudySession,
  onUpdateStudySession,
  onToggleTaskCompleted,
  onOpenTask,
  onPlanStudy,
}: TodayProps) {
  const [now, setNow] = useState(() => new Date());
  const [timer, setTimer] = useState<TimerState>(EMPTY_TIMER);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishNote, setFinishNote] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");
  const [manualSession, setManualSession] = useState<StudySession | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(TIMER_STORAGE_KEY);
      if (raw) setTimer({ ...EMPTY_TIMER, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(TIMER_STORAGE_KEY, JSON.stringify(timer));
    } catch {}
  }, [timer]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const elapsedSeconds = timer.accumulatedSeconds + (timer.running && timer.startedAt ? Math.floor((now.getTime() - timer.startedAt) / 1000) : 0);

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const activeAssessments = useMemo(
    () => tasks.filter((task) => isAssessmentTask(task) && !task.completed).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    [tasks]
  );

  const todaySessions = useMemo(
    () => studySessions.filter((session) => !session.completed && sameDay(session.date, now)).sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [studySessions, now]
  );

  const missedSessions = useMemo(
    () => studySessions.filter((session) => !session.completed && startOfDay(session.date).getTime() < startOfDay(now).getTime()).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 3),
    [studySessions, now]
  );

  const todayTasks = useMemo(
    () => tasks.filter((task) => !task.completed && startOfDay(task.dueDate).getTime() <= startOfDay(now).getTime()).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 6),
    [tasks, now]
  );

  const recommended = useMemo(() => {
    return activeAssessments
      .map((task) => {
        const completed = studySessions.filter((s) => s.completed && s.linkedTaskId === task.id).reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
        const planned = studySessions.filter((s) => !s.completed && s.linkedTaskId === task.id).reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
        const target = task.targetStudyMinutes ?? 180;
        const remaining = Math.max(0, target - completed - planned);
        const days = Math.ceil((startOfDay(task.dueDate).getTime() - startOfDay(now).getTime()) / 86_400_000);
        const urgency = days <= 0 ? 1000 : 200 / Math.max(1, days);
        return { task, completed, planned, target, remaining, days, score: urgency + remaining / 10 };
      })
      .sort((a, b) => b.score - a.score)[0];
  }, [activeAssessments, studySessions, now]);

  const quote = useMemo(() => {
    const key = Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`);
    return QUOTES[key % QUOTES.length];
  }, [now]);

  const nextClass = useMemo(() => {
    const day = now.getDay();
    const week = currentCycleWeek(timetableSettings, now);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const periodById = new Map(timetablePeriods.map((p) => [p.id, p]));
    const candidates = timetableClasses
      .filter((c) => c.dayOfWeek === day && (c.week === "both" || timetableSettings.cycle === "weekly" || c.week === week))
      .map((c) => {
        const period = c.periodId ? periodById.get(c.periodId) : undefined;
        const startTime = c.startTime ?? period?.startTime;
        return { classItem: c, startTime, startMinutes: to24HourMinutes(startTime) };
      })
      .filter((x): x is { classItem: TimetableClass; startTime: string; startMinutes: number } => Boolean(x.startTime) && x.startMinutes !== null)
      .filter((x) => x.startMinutes >= currentMinutes)
      .sort((a, b) => a.startMinutes - b.startMinutes);
    return candidates[0] ?? null;
  }, [now, timetableClasses, timetablePeriods, timetableSettings]);

  const beginTimer = (opts: { subjectId: string; linkedTaskId?: string; plannedSessionId?: string; title: string }) => {
    setTimer({
      running: true,
      startedAt: Date.now(),
      accumulatedSeconds: 0,
      subjectId: opts.subjectId,
      linkedTaskId: opts.linkedTaskId,
      plannedSessionId: opts.plannedSessionId,
      title: opts.title,
    });
    setPickerOpen(false);
  };

  const pauseResume = () => {
    setTimer((current) => {
      if (current.running) {
        const added = current.startedAt ? Math.floor((Date.now() - current.startedAt) / 1000) : 0;
        return { ...current, running: false, startedAt: null, accumulatedSeconds: current.accumulatedSeconds + added };
      }
      return { ...current, running: true, startedAt: Date.now() };
    });
  };

  const finishTimer = () => {
    const mins = Math.max(1, Math.round(elapsedSeconds / 60));
    setManualMinutes(String(mins));
    setFinishOpen(true);
  };

  const saveTimer = () => {
    const actual = Math.max(1, Number(manualMinutes) || Math.round(elapsedSeconds / 60));
    const actualDuration = `${actual} min`;
    const linkedTask = timer.linkedTaskId ? tasks.find((task) => task.id === timer.linkedTaskId) : undefined;
    const existing = timer.plannedSessionId ? studySessions.find((session) => session.id === timer.plannedSessionId) : undefined;

    if (existing) {
      onUpdateStudySession(existing.id, {
        ...existing,
        plannedDuration: existing.plannedDuration ?? existing.duration,
        duration: actualDuration,
        notes: finishNote.trim() || existing.notes,
        completed: true,
        completedAt: new Date(),
      });
    } else {
      onAddStudySession({
        title: timer.title || linkedTask?.title || "Study session",
        subjectId: timer.subjectId || linkedTask?.subjectId || "",
        date: new Date(),
        startTime: new Date().toTimeString().slice(0, 5),
        duration: actualDuration,
        linkedTaskId: timer.linkedTaskId,
        notes: finishNote.trim() || undefined,
        completed: true,
        completedAt: new Date(),
      });
    }

    setTimer(EMPTY_TIMER);
    setFinishOpen(false);
    setFinishNote("");
    setManualMinutes("");
  };

  const saveManualCompletion = () => {
    if (!manualSession) return;
    const actual = Math.max(1, Number(manualMinutes) || parseDurationToMinutes(manualSession.duration));
    onUpdateStudySession(manualSession.id, {
      ...manualSession,
      plannedDuration: manualSession.plannedDuration ?? manualSession.duration,
      duration: `${actual} min`,
      notes: finishNote.trim() || manualSession.notes,
      completed: true,
      completedAt: new Date(),
    });
    setManualSession(null);
    setManualMinutes("");
    setFinishNote("");
  };

  const openManualCompletion = (session: StudySession) => {
    setManualSession(session);
    setManualMinutes(String(parseDurationToMinutes(session.duration)));
    setFinishNote(session.notes ?? "");
  };

  return (
    <div className="app-page app-scroll-page space-y-4">
      <div className="app-page-heading">
        <h1 className="app-page-title">Today</h1>
        <p className="app-page-subtitle">Your classes, study and deadlines in one place.</p>
      </div>

      <div className="app-card px-5 py-4">
        <div className="text-sm italic leading-6 text-foreground">“{quote.text}”</div>
        <div className="mt-1 text-xs text-muted-foreground">{quote.author}</div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="space-y-4">
          <div className="app-card overflow-hidden">
            <div className="app-card-header flex items-center justify-between gap-4 bg-muted/20">
              <div>
                <div className="text-sm font-semibold text-foreground">Study now</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Start working and MyStudyPlanner will record what you actually do.</div>
              </div>
              <TimerReset className="h-5 w-5 text-muted-foreground" />
            </div>

            <div className="p-5">
              {timer.subjectId || timer.linkedTaskId || timer.accumulatedSeconds > 0 || timer.running ? (
                <div>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Current session</div>
                      <div className="mt-2 text-lg font-semibold text-foreground">{timer.title || "Study session"}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{subjectById.get(timer.subjectId)?.name ?? "General study"}</div>
                    </div>
                    <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">{formatSeconds(elapsedSeconds)}</div>
                  </div>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <button type="button" onClick={pauseResume} className="app-btn-secondary">
                      {timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      {timer.running ? "Pause" : "Resume"}
                    </button>
                    <button type="button" onClick={finishTimer} className="app-btn-primary">
                      <Square className="h-4 w-4" /> Finish session
                    </button>
                    <button type="button" onClick={() => setTimer(EMPTY_TIMER)} className="app-btn-ghost">
                      <RotateCcw className="h-4 w-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="text-lg font-semibold text-foreground">Ready to start?</div>
                    <div className="mt-1 max-w-xl text-sm text-muted-foreground">Choose an assessment or subject, start the timer, then save the actual time when you finish.</div>
                  </div>
                  <button type="button" onClick={() => setPickerOpen(true)} className="app-btn-primary h-11 px-5">
                    <Play className="h-4 w-4" /> Study now
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="app-card overflow-hidden">
            <div className="app-card-header bg-muted/20">
              <div>
                <div className="text-sm font-semibold text-foreground">Planned study today</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Start a planned session or record what you actually completed.</div>
              </div>
            </div>
            {todaySessions.length === 0 ? (
              <div className="app-empty-state border-0">
                <div className="text-sm font-medium text-foreground">Nothing planned today</div>
                <div className="mt-1 text-xs text-muted-foreground">Plan preparation from Study and place it on Calendar.</div>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {todaySessions.map((session) => {
                  const subject = subjectById.get(session.subjectId);
                  const task = session.linkedTaskId ? tasks.find((item) => item.id === session.linkedTaskId) : undefined;
                  return (
                    <div key={session.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          {subject ? <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} /> : null}
                          <div className="truncate text-sm font-medium text-foreground">{session.title ?? task?.title ?? "Study session"}</div>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{session.startTime} · planned {formatMinutes(parseDurationToMinutes(session.duration))}{task ? ` · ${task.title}` : ""}</div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" className="app-btn-primary h-9 px-3" onClick={() => beginTimer({ subjectId: session.subjectId, linkedTaskId: session.linkedTaskId, plannedSessionId: session.id, title: session.title ?? task?.title ?? "Study session" })}>
                          <Play className="h-3.5 w-3.5" /> Start
                        </button>
                        <button type="button" className="app-btn-secondary h-9 px-3" onClick={() => openManualCompletion(session)}>
                          <CheckCircle2 className="h-3.5 w-3.5" /> Log actual
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {missedSessions.length > 0 ? (
            <div className="app-card overflow-hidden">
              <div className="app-card-header bg-muted/20">
                <div>
                  <div className="text-sm font-semibold text-foreground">Missed study</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">Nothing is silently counted as completed.</div>
                </div>
              </div>
              <div className="divide-y divide-border">
                {missedSessions.map((session) => {
                  const linked = session.linkedTaskId ? tasks.find((t) => t.id === session.linkedTaskId) : undefined;
                  return (
                    <div key={session.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="text-sm font-medium text-foreground">{session.title ?? linked?.title ?? "Study session"}</div>
                        <div className="mt-1 text-xs text-muted-foreground">Planned {session.date.toLocaleDateString()} · {formatMinutes(parseDurationToMinutes(session.duration))}</div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" className="app-btn-secondary h-9 px-3" onClick={() => openManualCompletion(session)}>Log what I did</button>
                        {linked ? <button type="button" className="app-btn-ghost h-9 px-3" onClick={() => onPlanStudy(linked.id)}>Reschedule</button> : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="app-card p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><Clock3 className="h-4 w-4" /> Next class</div>
            {nextClass ? (
              <div className="mt-4">
                <div className="text-lg font-semibold text-foreground">{nextClass.classItem.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{nextClass.startTime}{nextClass.classItem.location ? ` · ${nextClass.classItem.location}` : ""}</div>
              </div>
            ) : (
              <div className="mt-4 text-sm text-muted-foreground">No more classes on your timetable today.</div>
            )}
          </div>

          {recommended ? (
            <div className="app-card p-5">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground"><BookOpen className="h-4 w-4" /> Recommended next</div>
              <div className="mt-4 text-base font-semibold text-foreground">{recommended.task.title}</div>
              <div className="mt-1 text-xs text-muted-foreground">
                {recommended.days <= 0 ? "Due now" : `Due in ${recommended.days} day${recommended.days === 1 ? "" : "s"}`} · {formatMinutes(recommended.completed)} completed
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.min(100, (recommended.completed / Math.max(1, recommended.target)) * 100)}%` }} />
              </div>
              <div className="mt-2 text-xs text-muted-foreground">{formatMinutes(recommended.remaining)} of the target still needs completing or scheduling.</div>
              <div className="mt-4 flex gap-2">
                <button type="button" className="app-btn-primary h-9 px-3" onClick={() => beginTimer({ subjectId: recommended.task.subjectId ?? "", linkedTaskId: recommended.task.id, title: recommended.task.title })}>Study now</button>
                <button type="button" className="app-btn-secondary h-9 px-3" onClick={() => onPlanStudy(recommended.task.id)}>Plan</button>
              </div>
            </div>
          ) : null}

          <div className="app-card overflow-hidden">
            <div className="app-card-header bg-muted/20">
              <div>
                <div className="text-sm font-semibold text-foreground">Due and overdue</div>
                <div className="mt-0.5 text-xs text-muted-foreground">Keep the immediate list short.</div>
              </div>
            </div>
            {todayTasks.length === 0 ? (
              <div className="app-empty-state border-0 text-xs text-muted-foreground">Nothing due or overdue today.</div>
            ) : (
              <div className="divide-y divide-border">
                {todayTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
                    <button type="button" className="min-w-0 text-left" onClick={() => onOpenTask(task.id)}>
                      <div className="truncate text-sm font-medium text-foreground">{task.title}</div>
                      <div className="mt-1 text-[11px] text-muted-foreground">{startOfDay(task.dueDate).getTime() < startOfDay(now).getTime() ? "Overdue" : "Due today"}</div>
                    </button>
                    <button type="button" className="app-iconbtn" aria-label={`Complete ${task.title}`} onClick={() => onToggleTaskCompleted(task.id)}><CheckCircle2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4" onMouseDown={() => setPickerOpen(false)}>
          <div className="app-card w-full max-w-lg p-5" onMouseDown={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-foreground">What are you studying?</div>
            <div className="mt-1 text-sm text-muted-foreground">Pick an assessment for automatic preparation tracking, or choose a subject for general study.</div>
            <div className="mt-5 max-h-[55vh] space-y-2 overflow-y-auto">
              {activeAssessments.map((task) => {
                const subject = subjectById.get(task.subjectId ?? "");
                return (
                  <button key={task.id} type="button" onClick={() => beginTimer({ subjectId: task.subjectId ?? "", linkedTaskId: task.id, title: task.title })} className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition hover:bg-muted/40">
                    <div>
                      <div className="text-sm font-medium text-foreground">{task.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{subject?.name ?? "Assessment"} · due {task.dueDate.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</div>
                    </div>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
              <div className="pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">General subject study</div>
              {subjects.map((subject) => (
                <button key={subject.id} type="button" onClick={() => beginTimer({ subjectId: subject.id, title: subject.name })} className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition hover:bg-muted/40">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm font-medium text-foreground">{subject.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {finishOpen || manualSession ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4" onMouseDown={() => { setFinishOpen(false); setManualSession(null); }}>
          <div className="app-card w-full max-w-md p-5" onMouseDown={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-foreground">Record what you actually studied</div>
            <div className="mt-1 text-sm text-muted-foreground">Planned time and actual time stay separate so your Insights remain trustworthy.</div>
            <label className="mt-5 block text-sm font-medium text-foreground">Actual minutes</label>
            <input type="number" min="1" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <label className="mt-4 block text-sm font-medium text-foreground">What did you work on? <span className="font-normal text-muted-foreground">Optional</span></label>
            <textarea value={finishNote} onChange={(e) => setFinishNote(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Practice questions, essay plan, flashcards..." />
            <div className="mt-5 flex gap-2">
              <button type="button" className="app-btn-primary flex-1" onClick={manualSession ? saveManualCompletion : saveTimer}>Save completed study</button>
              <button type="button" className="app-btn-secondary" onClick={() => { setFinishOpen(false); setManualSession(null); }}>Cancel</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
