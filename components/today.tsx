"use client";

import React, { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, Pause, Play, RotateCcw, Square } from "lucide-react";

import type {
  Subject,
  StudySession,
  Task,
  TimetableClass,
  TimetablePeriod,
  TimetableSettings,
  ImportedCalendarEvent,
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
  const h = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  const m = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)\b/);
  if (h || m) return Math.round((h ? Number(h[1]) * 60 : 0) + (m ? Number(m[1]) : 0));
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
  importedCalendarEvents: ImportedCalendarEvent[];
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
  importedCalendarEvents,
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
    () => studySessions.filter((session) => !session.completed && startOfDay(session.date).getTime() < startOfDay(now).getTime()).sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 2),
    [studySessions, now]
  );

  const todayTasks = useMemo(
    () => tasks.filter((task) => !task.completed && startOfDay(task.dueDate).getTime() <= startOfDay(now).getTime()).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()).slice(0, 5),
    [tasks, now]
  );

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
    setTimer({ running: true, startedAt: Date.now(), accumulatedSeconds: 0, subjectId: opts.subjectId, linkedTaskId: opts.linkedTaskId, plannedSessionId: opts.plannedSessionId, title: opts.title });
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
    setManualMinutes(String(Math.max(1, Math.round(elapsedSeconds / 60))));
    setFinishOpen(true);
  };

  const saveTimer = () => {
    const actual = Math.max(1, Number(manualMinutes) || Math.round(elapsedSeconds / 60));
    const actualDuration = `${actual} min`;
    const linkedTask = timer.linkedTaskId ? tasks.find((task) => task.id === timer.linkedTaskId) : undefined;
    const existing = timer.plannedSessionId ? studySessions.find((session) => session.id === timer.plannedSessionId) : undefined;

    if (existing) {
      onUpdateStudySession(existing.id, { ...existing, plannedDuration: existing.plannedDuration ?? existing.duration, duration: actualDuration, notes: finishNote.trim() || existing.notes, completed: true, completedAt: new Date() });
    } else {
      onAddStudySession({ title: timer.title || linkedTask?.title || "Study session", subjectId: timer.subjectId || linkedTask?.subjectId || "", date: new Date(), startTime: new Date().toTimeString().slice(0, 5), duration: actualDuration, linkedTaskId: timer.linkedTaskId, notes: finishNote.trim() || undefined, completed: true, completedAt: new Date() });
    }

    setTimer(EMPTY_TIMER);
    setFinishOpen(false);
    setFinishNote("");
    setManualMinutes("");
  };

  const saveManualCompletion = () => {
    if (!manualSession) return;
    const actual = Math.max(1, Number(manualMinutes) || parseDurationToMinutes(manualSession.duration));
    onUpdateStudySession(manualSession.id, { ...manualSession, plannedDuration: manualSession.plannedDuration ?? manualSession.duration, duration: `${actual} min`, notes: finishNote.trim() || manualSession.notes, completed: true, completedAt: new Date() });
    setManualSession(null);
    setManualMinutes("");
    setFinishNote("");
  };

  const openManualCompletion = (session: StudySession) => {
    setManualSession(session);
    setManualMinutes(String(parseDurationToMinutes(session.duration)));
    setFinishNote(session.notes ?? "");
  };

  const todayAgenda = useMemo(() => {
    type AgendaItem = {
      id: string;
      startMinutes: number;
      timeLabel: string;
      title: string;
      meta: string;
      color?: string;
      kind: "class" | "study" | "task" | "event";
      studySession?: StudySession;
    };

    const items: AgendaItem[] = [];
    const day = now.getDay();
    const week = currentCycleWeek(timetableSettings, now);
    const periodById = new Map(timetablePeriods.map((period) => [period.id, period]));

    timetableClasses
      .filter((item) => item.dayOfWeek === day && (item.week === "both" || timetableSettings.cycle === "weekly" || item.week === week))
      .forEach((item) => {
        const period = item.periodId ? periodById.get(item.periodId) : undefined;
        const start = item.startTime ?? period?.startTime;
        const minutes = to24HourMinutes(start);
        if (!start || minutes === null) return;
        const subject = item.subjectId ? subjectById.get(item.subjectId) : undefined;
        items.push({ id: `class-${item.id}`, startMinutes: minutes, timeLabel: start, title: subject?.name ?? item.title, meta: item.title !== subject?.name ? item.title : (item.location ?? "Class"), color: subject?.color, kind: "class" });
      });

    studySessions.filter((session) => !session.completed && sameDay(session.date, now)).forEach((session) => {
      const minutes = to24HourMinutes(session.startTime);
      if (minutes === null) return;
      const subject = subjectById.get(session.subjectId);
      const task = session.linkedTaskId ? tasks.find((item) => item.id === session.linkedTaskId) : undefined;
      items.push({ id: `study-${session.id}`, startMinutes: minutes, timeLabel: session.startTime, title: subject?.name ?? session.title ?? "Study", meta: `${task ? (task.type === "exam" ? "Exam study" : "Assignment study") : "Study"} · ${formatMinutes(parseDurationToMinutes(session.duration))}`, color: subject?.color, kind: "study", studySession: session });
    });

    tasks.filter((task) => !task.completed && task.scheduledDate && sameDay(task.scheduledDate, now) && task.startTime).forEach((task) => {
      const minutes = to24HourMinutes(task.startTime);
      if (minutes === null) return;
      const subject = task.subjectId ? subjectById.get(task.subjectId) : undefined;
      items.push({ id: `task-${task.id}`, startMinutes: minutes, timeLabel: task.startTime!, title: subject?.name ?? task.title, meta: task.type === "exam" ? "Exam" : task.type === "assignment" ? "Assignment" : task.type === "homework" ? "Homework" : "Task", color: subject?.color, kind: "task" });
    });

    importedCalendarEvents.filter((event) => !event.allDay && sameDay(event.start, now)).forEach((event) => {
      const start = `${String(event.start.getHours()).padStart(2, "0")}:${String(event.start.getMinutes()).padStart(2, "0")}`;
      items.push({ id: `event-${event.id}`, startMinutes: event.start.getHours() * 60 + event.start.getMinutes(), timeLabel: start, title: event.subjectName ?? event.title, meta: event.kind === "class" ? "Class" : (event.location ?? "Event"), color: event.color, kind: "event" });
    });

    return items.sort((a, b) => a.startMinutes - b.startMinutes);
  }, [now, timetableClasses, timetablePeriods, timetableSettings, subjectById, studySessions, tasks, importedCalendarEvents]);

  const allDayToday = useMemo(() => {
    const due = tasks
      .filter((task) => !task.completed && sameDay(task.dueDate, now) && !task.startTime)
      .map((task) => ({ id: `due-${task.id}`, title: `${subjectById.get(task.subjectId ?? "")?.name ?? task.title} · ${task.type === "exam" ? "Exam" : task.type === "assignment" ? "Assignment" : task.type === "homework" ? "Homework" : "Due"}` }));
    const imported = importedCalendarEvents
      .filter((event) => event.allDay && sameDay(event.start, now))
      .map((event) => ({ id: `all-${event.id}`, title: event.title }));
    return [...due, ...imported].slice(0, 6);
  }, [tasks, importedCalendarEvents, now, subjectById]);

  const dayProgress = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const clockLabel = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateLabel = now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="app-page app-scroll-page pb-10">
      <section className="grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)] lg:items-start">
        <div className="flex flex-col items-center lg:sticky lg:top-4">
          <div className="relative grid h-[310px] w-[310px] place-items-center sm:h-[340px] sm:w-[340px]">
            <svg className="absolute inset-0 h-full w-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
              <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-border/70" />
              <circle cx="100" cy="100" r="88" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" pathLength="100" strokeDasharray={`${dayProgress} ${100 - dayProgress}`} className="text-primary/75" />
              {Array.from({ length: 12 }).map((_, index) => {
                const angle = (index / 12) * Math.PI * 2;
                const x1 = 100 + Math.cos(angle) * 79;
                const y1 = 100 + Math.sin(angle) * 79;
                const x2 = 100 + Math.cos(angle) * 84;
                const y2 = 100 + Math.sin(angle) * 84;
                return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground/35" />;
              })}
            </svg>
            <div className="relative text-center">
              <div className="font-mono text-5xl font-semibold tracking-[-0.055em] text-foreground sm:text-6xl">{clockLabel}</div>
              <div className="mt-3 text-sm font-medium text-muted-foreground">{dateLabel}</div>
              <button type="button" onClick={() => setPickerOpen(true)} className="app-btn-primary mt-6 h-11 px-5">
                <Play className="h-4 w-4" /> Study now
              </button>
            </div>
          </div>
          <div className="mt-3 max-w-[310px] text-center text-xs italic leading-5 text-muted-foreground/45">“{quote.text}” <span className="not-italic">· {quote.author}</span></div>
        </div>

        <div className="min-w-0">
          <div className="flex items-end justify-between gap-4 border-b border-border pb-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Your day</div>
              <div className="mt-1 text-xl font-semibold text-foreground">Everything happening today</div>
            </div>
            {nextClass ? <div className="hidden text-right text-xs text-muted-foreground sm:block"><span className="font-medium text-foreground">Next:</span> {nextClass.classItem.title} · {nextClass.startTime}</div> : null}
          </div>

          {allDayToday.length > 0 ? (
            <div className="border-b border-border py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">All day</div>
              <div className="flex flex-wrap gap-2">
                {allDayToday.map((item) => <span key={item.id} className="rounded-full bg-muted/55 px-3 py-1.5 text-xs font-medium text-foreground">{item.title}</span>)}
              </div>
            </div>
          ) : null}

          <div className="relative">
            {todayAgenda.length === 0 ? (
              <div className="py-14 text-center">
                <div className="text-sm font-medium text-foreground">Your day is clear</div>
                <div className="mt-1 text-sm text-muted-foreground">Nothing timed is scheduled today.</div>
              </div>
            ) : (
              <div className="divide-y divide-border/70">
                {todayAgenda.map((item) => {
                  const isPast = item.startMinutes < currentMinutes - 5;
                  const isNext = item.startMinutes >= currentMinutes && item.startMinutes === todayAgenda.filter((candidate) => candidate.startMinutes >= currentMinutes)[0]?.startMinutes;
                  return (
                    <div key={item.id} className={`group grid grid-cols-[70px_18px_minmax(0,1fr)_auto] items-center gap-3 py-4 transition ${isPast ? "opacity-50" : ""}`}>
                      <div className="font-mono text-xs font-medium text-muted-foreground">{item.timeLabel}</div>
                      <div className="relative flex h-full items-center justify-center">
                        <span className={`h-2.5 w-2.5 rounded-full ring-4 ring-background ${isNext ? "scale-110" : ""}`} style={{ backgroundColor: item.color ?? "var(--primary)" }} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                          {isNext ? <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">Next</span> : null}
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">{item.meta}</div>
                      </div>
                      {item.kind === "study" && item.studySession ? (
                        <button type="button" className="app-btn-secondary h-9 px-3 opacity-90" onClick={() => beginTimer({ subjectId: item.studySession!.subjectId, linkedTaskId: item.studySession!.linkedTaskId, plannedSessionId: item.studySession!.id, title: tasks.find((task) => task.id === item.studySession!.linkedTaskId)?.title ?? item.studySession!.title ?? "Study session" })}><Play className="h-3.5 w-3.5" /> Start</button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {missedSessions.length > 0 ? (
            <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{missedSessions.length} missed study session{missedSessions.length === 1 ? "" : "s"}.</span>{" "}
              <button type="button" className="underline underline-offset-2 hover:text-foreground" onClick={() => openManualCompletion(missedSessions[0])}>Review</button>
            </div>
          ) : null}
        </div>
      </section>

      {timer.subjectId || timer.linkedTaskId || timer.accumulatedSeconds > 0 || timer.running ? (
        <section className="mt-8 border-y border-primary/20 bg-primary/[0.025] px-1 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.12em] text-muted-foreground">Current study</div>
              <div className="mt-1 text-base font-semibold text-foreground">{timer.title || "Study session"}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{subjectById.get(timer.subjectId)?.name ?? "General study"}</div>
            </div>
            <div className="font-mono text-4xl font-semibold tracking-tight text-foreground">{formatSeconds(elapsedSeconds)}</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={pauseResume} className="app-btn-secondary">{timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}{timer.running ? "Pause" : "Resume"}</button>
            <button type="button" onClick={finishTimer} className="app-btn-primary"><Square className="h-4 w-4" /> Finish</button>
            <button type="button" onClick={() => setTimer(EMPTY_TIMER)} className="app-btn-ghost"><RotateCcw className="h-4 w-4" /> Cancel</button>
          </div>
        </section>
      ) : null}

      {pickerOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4" onMouseDown={() => setPickerOpen(false)}>
          <div className="app-card w-full max-w-lg p-5" onMouseDown={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-foreground">What are you studying?</div>
            <div className="mt-1 text-sm text-muted-foreground">Pick an assessment, or choose a subject for general study.</div>
            <div className="mt-5 max-h-[55vh] space-y-2 overflow-y-auto">
              {activeAssessments.map((task) => {
                const subject = subjectById.get(task.subjectId ?? "");
                return (
                  <button key={task.id} type="button" onClick={() => beginTimer({ subjectId: task.subjectId ?? "", linkedTaskId: task.id, title: task.title })} className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-left transition hover:bg-muted/40">
                    <div><div className="text-sm font-medium text-foreground">{subject?.name ?? task.title}</div><div className="mt-1 text-xs text-muted-foreground">{task.type === "exam" ? "Exam" : "Assignment"} · {task.title}</div></div>
                    <Play className="h-4 w-4 text-muted-foreground" />
                  </button>
                );
              })}
              <div className="pt-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">General subject study</div>
              {subjects.map((subject) => (
                <button key={subject.id} type="button" onClick={() => beginTimer({ subjectId: subject.id, title: subject.name })} className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition hover:bg-muted/40"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject.color }} /><span className="text-sm font-medium text-foreground">{subject.name}</span></button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {finishOpen || manualSession ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4" onMouseDown={() => { setFinishOpen(false); setManualSession(null); }}>
          <div className="app-card w-full max-w-md p-5" onMouseDown={(e) => e.stopPropagation()}>
            <div className="text-lg font-semibold text-foreground">Record actual study</div>
            <div className="mt-1 text-sm text-muted-foreground">Only the time you actually studied counts toward progress.</div>
            <label className="mt-5 block text-sm font-medium text-foreground">Actual minutes</label>
            <input type="number" min="1" value={manualMinutes} onChange={(e) => setManualMinutes(e.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
            <label className="mt-4 block text-sm font-medium text-foreground">What did you work on? <span className="font-normal text-muted-foreground">Optional</span></label>
            <textarea value={finishNote} onChange={(e) => setFinishNote(e.target.value)} rows={3} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/30" placeholder="Practice questions, essay plan, flashcards..." />
            <div className="mt-5 flex gap-2"><button type="button" className="app-btn-primary flex-1" onClick={manualSession ? saveManualCompletion : saveTimer}>Save completed study</button><button type="button" className="app-btn-secondary" onClick={() => { setFinishOpen(false); setManualSession(null); }}>Cancel</button></div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
