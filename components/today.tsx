"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Pause, Play, RotateCcw, Square, X } from "lucide-react";

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

const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const displayTime = (value?: string) => {
  if (!value) return "";
  const [hh, mm] = value.split(":").map(Number);
  const suffix = hh >= 12 ? "PM" : "AM";
  const hour = hh % 12 || 12;
  return `${hour}:${String(mm || 0).padStart(2, "0")} ${suffix}`;
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

type DayItem = {
  id: string;
  time: string;
  sort: number;
  title: string;
  subtitle?: string;
  color?: string;
  kind: "class" | "study" | "event" | "task";
  session?: StudySession;
};

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
}: TodayProps) {
  const [now, setNow] = useState(() => new Date());
  const [timer, setTimer] = useState<TimerState>(EMPTY_TIMER);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishNote, setFinishNote] = useState("");
  const [manualMinutes, setManualMinutes] = useState("");

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
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const activeAssessments = useMemo(
    () => tasks.filter((task) => isAssessmentTask(task) && !task.completed).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    [tasks]
  );

  const quote = useMemo(() => {
    const key = Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`);
    return QUOTES[key % QUOTES.length];
  }, [now]);

  const timerSelectionLabel = useMemo(() => {
    if (timer.linkedTaskId) {
      const task = taskById.get(timer.linkedTaskId);
      const subject = task ? subjectById.get(task.subjectId ?? "") : undefined;
      return task ? `${subject?.name ?? "Assessment"} · ${task.title}` : timer.title;
    }
    if (timer.subjectId) return subjectById.get(timer.subjectId)?.name ?? timer.title;
    return "Choose what you're studying";
  }, [timer, taskById, subjectById]);

  const beginTimer = (opts: { subjectId: string; linkedTaskId?: string; plannedSessionId?: string; title: string }) => {
    setTimer({ running: true, startedAt: Date.now(), accumulatedSeconds: 0, subjectId: opts.subjectId, linkedTaskId: opts.linkedTaskId, plannedSessionId: opts.plannedSessionId, title: opts.title });
    setPickerOpen(false);
  };

  const selectWithoutStarting = (opts: { subjectId: string; linkedTaskId?: string; plannedSessionId?: string; title: string }) => {
    setTimer({ running: false, startedAt: null, accumulatedSeconds: 0, subjectId: opts.subjectId, linkedTaskId: opts.linkedTaskId, plannedSessionId: opts.plannedSessionId, title: opts.title });
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

  const startSelected = () => {
    if (!timer.subjectId && !timer.linkedTaskId) {
      setPickerOpen(true);
      return;
    }
    setTimer((current) => ({ ...current, running: true, startedAt: Date.now() }));
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

  const dayItems = useMemo(() => {
    const result: DayItem[] = [];
    const day = now.getDay();
    const week = currentCycleWeek(timetableSettings, now);
    const periodById = new Map(timetablePeriods.map((p) => [p.id, p]));

    timetableClasses
      .filter((item) => item.dayOfWeek === day && (item.week === "both" || timetableSettings.cycle === "weekly" || item.week === week))
      .forEach((item) => {
        const period = item.periodId ? periodById.get(item.periodId) : undefined;
        const time = item.startTime ?? period?.startTime;
        if (!time) return;
        const [h, m] = time.split(":").map(Number);
        const subject = item.subjectId ? subjectById.get(item.subjectId) : undefined;
        result.push({
          id: `class-${item.id}`,
          time,
          sort: h * 60 + m,
          title: subject?.name ?? item.title,
          subtitle: item.location || item.teacher || "Class",
          color: subject?.color,
          kind: "class",
        });
      });

    studySessions
      .filter((session) => !session.completed && sameDay(session.date, now))
      .forEach((session) => {
        const [h, m] = session.startTime.split(":").map(Number);
        const linkedTask = session.linkedTaskId ? taskById.get(session.linkedTaskId) : undefined;
        const subject = subjectById.get(session.subjectId);
        result.push({
          id: `study-${session.id}`,
          time: session.startTime,
          sort: h * 60 + m,
          title: subject?.name ?? "Study",
          subtitle: linkedTask ? `${linkedTask.title} · ${session.duration}` : `Study · ${session.duration}`,
          color: subject?.color,
          kind: "study",
          session,
        });
      });

    importedCalendarEvents
      .filter((event) => !event.allDay && sameDay(event.start, now))
      .forEach((event) => {
        const h = event.start.getHours();
        const m = event.start.getMinutes();
        result.push({
          id: `event-${event.id}`,
          time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          sort: h * 60 + m,
          title: event.title,
          subtitle: event.location || event.calendarName || "Event",
          color: event.color,
          kind: "event",
        });
      });

    tasks
      .filter((task) => !task.completed && task.scheduledDate && sameDay(task.scheduledDate, now) && task.startTime)
      .forEach((task) => {
        const [h, m] = (task.startTime ?? "00:00").split(":").map(Number);
        const subject = subjectById.get(task.subjectId ?? "");
        result.push({
          id: `task-${task.id}`,
          time: task.startTime ?? "00:00",
          sort: h * 60 + m,
          title: subject?.name ?? task.title,
          subtitle: task.title,
          color: subject?.color,
          kind: "task",
        });
      });

    return result.sort((a, b) => a.sort - b.sort);
  }, [now, timetableSettings, timetablePeriods, timetableClasses, studySessions, importedCalendarEvents, tasks, subjectById, taskById]);

  const allDayItems = useMemo(() => {
    const due = tasks
      .filter((task) => !task.completed && sameDay(task.dueDate, now))
      .map((task) => ({ id: `due-${task.id}`, label: task.title, subject: subjectById.get(task.subjectId ?? "")?.name, kind: task.type }));
    const imported = importedCalendarEvents
      .filter((event) => event.allDay && sameDay(event.start, now))
      .map((event) => ({ id: `all-${event.id}`, label: event.title, subject: event.calendarName, kind: "event" }));
    return [...due, ...imported];
  }, [tasks, importedCalendarEvents, now, subjectById]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="app-page app-scroll-page space-y-8 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Today</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h1>
        </div>
        <div className="hidden max-w-md text-right sm:block">
          <div className="text-sm italic text-muted-foreground/70">“{quote.text}”</div>
          <div className="mt-1 text-[11px] text-muted-foreground/50">{quote.author}</div>
        </div>
      </div>

      <section className="relative overflow-hidden rounded-[32px] border border-border/80 bg-card px-5 py-8 shadow-[0_18px_60px_rgba(0,0,0,0.04)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/[0.035] to-transparent" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <button
            type="button"
            onClick={() => setPickerOpen(true)}
            className="group inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-background/80 px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-muted/40"
          >
            <span className="truncate">{timerSelectionLabel}</span>
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:text-foreground" />
          </button>

          <div className="relative mt-7 grid h-[280px] w-[280px] place-items-center rounded-full border border-border bg-background shadow-inner sm:h-[330px] sm:w-[330px]">
            <div className="absolute inset-[14px] rounded-full border border-border/60" />
            <div className="absolute inset-[28px] rounded-full border border-dashed border-border/45" />
            <div className="relative z-10">
              <div className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">Study timer</div>
              <div className="mt-3 font-mono text-5xl font-semibold tracking-[-0.06em] text-foreground sm:text-6xl">
                {formatSeconds(elapsedSeconds)}
              </div>
              <div className="mt-4 text-xs text-muted-foreground">
                {timer.running ? "Focus on the work. We'll record the time." : elapsedSeconds > 0 ? "Paused" : "Ready when you are"}
              </div>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
            {!timer.running && elapsedSeconds === 0 ? (
              <button type="button" className="app-btn-primary h-11 min-w-[130px] px-6" onClick={startSelected}>
                <Play className="h-4 w-4" />
                Start
              </button>
            ) : (
              <>
                <button type="button" className="app-btn-primary h-11 min-w-[130px] px-6" onClick={pauseResume}>
                  {timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {timer.running ? "Pause" : "Resume"}
                </button>
                <button type="button" className="app-btn-secondary h-11 px-5" onClick={finishTimer}>
                  <Square className="h-4 w-4" />
                  Finish
                </button>
                <button type="button" className="app-btn-ghost h-11 px-4" onClick={() => setTimer(EMPTY_TIMER)}>
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl">
        <div className="flex items-end justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Your day</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Classes, study and calendar events in time order.</p>
          </div>
          {allDayItems.length > 0 ? <div className="text-xs text-muted-foreground">{allDayItems.length} all-day</div> : null}
        </div>

        {allDayItems.length > 0 ? (
          <div className="border-b border-border py-3">
            <div className="flex flex-wrap gap-2">
              {allDayItems.map((item) => (
                <div key={item.id} className="rounded-full border border-border bg-muted/25 px-3 py-1.5 text-xs text-foreground">
                  <span className="font-medium">{item.label}</span>
                  {item.subject ? <span className="ml-1 text-muted-foreground">· {item.subject}</span> : null}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {dayItems.length === 0 ? (
          <div className="py-10 text-center text-sm text-muted-foreground">Nothing scheduled today. Your study timer is ready whenever you are.</div>
        ) : (
          <div className="divide-y divide-border">
            {dayItems.map((item) => {
              const past = item.sort < currentMinutes - 5;
              return (
                <div key={item.id} className={["group flex items-center gap-4 py-4 transition", past ? "opacity-45" : "opacity-100"].join(" ")}>
                  <div className="w-[72px] shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">{displayTime(item.time)}</div>
                  <div className="relative flex min-w-0 flex-1 items-center gap-3">
                    <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: item.color ?? "#94a3b8" }} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                      {item.subtitle ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{item.subtitle}</div> : null}
                    </div>
                    {item.kind === "study" && item.session && !past ? (
                      <button
                        type="button"
                        className="app-btn-secondary h-9 shrink-0 px-3 text-xs"
                        onClick={() => beginTimer({
                          subjectId: item.session!.subjectId,
                          linkedTaskId: item.session!.linkedTaskId,
                          plannedSessionId: item.session!.id,
                          title: item.session!.title || "Study session",
                        })}
                      >
                        Start
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="text-center sm:hidden">
        <div className="text-xs italic text-muted-foreground/65">“{quote.text}”</div>
        <div className="mt-1 text-[10px] text-muted-foreground/45">{quote.author}</div>
      </div>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={() => setPickerOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <div className="text-base font-semibold text-foreground">What are you studying?</div>
                <div className="mt-1 text-xs text-muted-foreground">Choose an assessment or subject. You can change it before you start.</div>
              </div>
              <button type="button" className="grid h-9 w-9 place-items-center rounded-full transition hover:bg-muted" onClick={() => setPickerOpen(false)} aria-label="Close">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-3">
              {activeAssessments.length > 0 ? (
                <div>
                  <div className="px-2 pb-2 pt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">Assessments</div>
                  <div className="space-y-1">
                    {activeAssessments.map((task) => {
                      const subject = subjectById.get(task.subjectId ?? "");
                      return (
                        <button
                          key={task.id}
                          type="button"
                          className="flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted/45"
                          onClick={() => selectWithoutStarting({ subjectId: task.subjectId ?? "", linkedTaskId: task.id, title: task.title })}
                        >
                          <span className="h-9 w-1 rounded-full" style={{ backgroundColor: subject?.color ?? "#94a3b8" }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-muted-foreground">{subject?.name ?? "Assessment"} · {task.type === "exam" ? "Exam" : "Assignment"}</div>
                            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{task.title}</div>
                          </div>
                          {(timer.linkedTaskId === task.id) ? <Check className="h-4 w-4 text-primary" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-4 border-t border-border pt-3">
                <div className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">General subject study</div>
                <div className="grid gap-1 sm:grid-cols-2">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      type="button"
                      className="flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition hover:bg-muted/45"
                      onClick={() => selectWithoutStarting({ subjectId: subject.id, title: `${subject.name} study` })}
                    >
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: subject.color }} />
                      <span className="text-sm font-medium text-foreground">{subject.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {finishOpen ? (
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={() => setFinishOpen(false)}>
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="border-b border-border px-5 py-4">
              <div className="text-base font-semibold text-foreground">Finish study session</div>
              <div className="mt-1 text-xs text-muted-foreground">Confirm what you actually studied. This is the time that counts in Insights.</div>
            </div>
            <div className="p-5">
              <label className="text-sm font-medium text-foreground">Actual minutes</label>
              <input type="number" min="1" value={manualMinutes} onChange={(event) => setManualMinutes(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-border bg-input-background px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <label className="mt-4 block text-sm font-medium text-foreground">What did you work on? <span className="font-normal text-muted-foreground">Optional</span></label>
              <textarea rows={3} value={finishNote} onChange={(event) => setFinishNote(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="mt-5 flex gap-2">
                <button type="button" className="app-btn-primary flex-1" onClick={saveTimer}>Save session</button>
                <button type="button" className="app-btn-secondary" onClick={() => setFinishOpen(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
