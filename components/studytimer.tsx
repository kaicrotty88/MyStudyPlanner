"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Check, ChevronDown, Pause, Play, RotateCcw, Square, X } from "lucide-react";

import type { Subject, StudySession, Task } from "./models";
import { isAssessmentTask } from "./assessmentLifecycle";
import {
  EMPTY_STUDY_TIMER,
  elapsedStudyTimerSeconds,
  readStoredStudyTimer,
  writeStoredStudyTimer,
  type StoredStudyTimerState,
} from "@/lib/studyTimerStorage";

type TimerState = StoredStudyTimerState;
const EMPTY_TIMER = EMPTY_STUDY_TIMER;

export type StudyTimerStartRequest = {
  key: number;
  subjectId: string;
  title: string;
  linkedTaskId?: string;
  plannedSessionId?: string;
};

interface StudyTimerProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession: (id: string, session: Omit<StudySession, "id">) => void;
  startRequest?: StudyTimerStartRequest | null;
  storageKey: string;
}

const formatSeconds = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

export function StudyTimer({
  tasks,
  subjects,
  studySessions,
  onAddStudySession,
  onUpdateStudySession,
  startRequest = null,
  storageKey,
}: StudyTimerProps) {
  const [now, setNow] = useState(() => new Date());
  const [timer, setTimer] = useState<TimerState>(EMPTY_TIMER);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [finishNote, setFinishNote] = useState("");
  const [finishElapsedSeconds, setFinishElapsedSeconds] = useState<number | null>(null);
  const [hydratedStorageKey, setHydratedStorageKey] = useState<string | null>(null);

  useEffect(() => {
    setHydratedStorageKey(null);
    setTimer(readStoredStudyTimer(storageKey));
    setFinishOpen(false);
    setFinishNote("");
    setFinishElapsedSeconds(null);
    setHydratedStorageKey(storageKey);
  }, [storageKey]);

  useEffect(() => {
    if (hydratedStorageKey !== storageKey) return;
    writeStoredStudyTimer(storageKey, timer);
  }, [timer, storageKey, hydratedStorageKey]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!startRequest) return;
    setTimer({
      running: true,
      startedAt: Date.now(),
      accumulatedSeconds: 0,
      subjectId: startRequest.subjectId,
      linkedTaskId: startRequest.linkedTaskId,
      plannedSessionId: startRequest.plannedSessionId,
      title: startRequest.title,
    });
    setPickerOpen(false);
    setFinishOpen(false);
    setFinishNote("");
    setFinishElapsedSeconds(null);
  }, [startRequest]);

  const elapsedSeconds =
    timer.accumulatedSeconds +
    (timer.running && timer.startedAt
      ? Math.floor((now.getTime() - timer.startedAt) / 1000)
      : 0);

  const subjectById = useMemo(
    () => new Map(subjects.map((subject) => [subject.id, subject])),
    [subjects]
  );
  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks]
  );

  const activeAssessments = useMemo(
    () =>
      tasks
        .filter((task) => isAssessmentTask(task) && !task.completed)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime()),
    [tasks]
  );

  const timerSelectionLabel = useMemo(() => {
    if (timer.linkedTaskId) {
      const task = taskById.get(timer.linkedTaskId);
      const subject = task ? subjectById.get(task.subjectId ?? "") : undefined;
      return task ? `${subject?.name ?? "Assessment"} · ${task.title}` : timer.title;
    }
    if (timer.subjectId) return subjectById.get(timer.subjectId)?.name ?? timer.title;
    return "Choose what you're studying";
  }, [timer, taskById, subjectById]);

  const selectWithoutStarting = (selection: Omit<TimerState, "running" | "startedAt" | "accumulatedSeconds">) => {
    setTimer({
      running: false,
      startedAt: null,
      accumulatedSeconds: 0,
      ...selection,
    });
    setPickerOpen(false);
  };

  const startSelected = () => {
    if (!timer.subjectId && !timer.linkedTaskId) {
      setPickerOpen(true);
      return;
    }
    setTimer((current) => ({ ...current, running: true, startedAt: Date.now() }));
  };

  const pauseResume = () => {
    setFinishElapsedSeconds(null);
    setTimer((current) => {
      if (current.running) {
        const added = current.startedAt
          ? Math.floor((Date.now() - current.startedAt) / 1000)
          : 0;
        return {
          ...current,
          running: false,
          startedAt: null,
          accumulatedSeconds: current.accumulatedSeconds + added,
        };
      }
      return { ...current, running: true, startedAt: Date.now() };
    });
  };

  const openFinishConfirmation = () => {
    const frozenSeconds = elapsedStudyTimerSeconds(timer);
    setTimer((current) => ({
      ...current,
      running: false,
      startedAt: null,
      accumulatedSeconds: frozenSeconds,
    }));
    setFinishElapsedSeconds(frozenSeconds);
    setFinishOpen(true);
  };

  const closeFinishConfirmation = () => {
    setFinishOpen(false);
    setFinishElapsedSeconds(null);
  };

  const saveTimer = () => {
    const frozenSeconds = finishElapsedSeconds ?? elapsedStudyTimerSeconds(timer);
    const actualMinutes = Math.max(0, Math.round(frozenSeconds / 60));
    const actualDuration = `${actualMinutes} min`;
    const linkedTask = timer.linkedTaskId
      ? tasks.find((task) => task.id === timer.linkedTaskId)
      : undefined;
    const existing = timer.plannedSessionId
      ? studySessions.find((session) => session.id === timer.plannedSessionId)
      : undefined;

    if (existing) {
      onUpdateStudySession(existing.id, {
        ...existing,
        plannedDuration: existing.plannedDuration ?? existing.duration,
        duration: actualDuration,
        actualSeconds: frozenSeconds,
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
        actualSeconds: frozenSeconds,
        linkedTaskId: timer.linkedTaskId,
        notes: finishNote.trim() || undefined,
        completed: true,
        completedAt: new Date(),
      });
    }

    setTimer(EMPTY_TIMER);
    setFinishOpen(false);
    setFinishNote("");
    setFinishElapsedSeconds(null);
  };

  const statusLabel = timer.running
    ? "Running"
    : elapsedSeconds > 0
      ? "Paused"
      : "Ready";

  return (
    <>
      <section className="app-card overflow-hidden">
        <div className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <div className="text-sm font-semibold text-foreground">Study timer</div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                {statusLabel}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Choose an assessment or subject, then record the time you actually study.
            </p>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="group mt-2 inline-flex max-w-full items-center gap-2 rounded-xl border border-border bg-background/70 px-3.5 py-2 text-sm font-medium text-foreground transition hover:bg-muted/40"
            >
              <span className="truncate">{timerSelectionLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            </button>
          </div>

          <div className="flex shrink-0 flex-col items-start gap-2 sm:flex-row sm:items-center lg:flex-col lg:items-end">
            <div className="font-mono text-4xl font-semibold tracking-[-0.06em] text-foreground sm:text-5xl">
              {formatSeconds(elapsedSeconds)}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {!timer.running && elapsedSeconds === 0 ? (
                <button type="button" className="app-btn-primary h-10 px-5" onClick={startSelected}>
                  <Play className="h-4 w-4" />
                  Start
                </button>
              ) : (
                <>
                  <button type="button" className="app-btn-primary h-10 px-4" onClick={pauseResume}>
                    {timer.running ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {timer.running ? "Pause" : "Resume"}
                  </button>
                  <button type="button" className="app-btn-secondary h-10 px-4" onClick={openFinishConfirmation}>
                    <Square className="h-4 w-4" />
                    Finish
                  </button>
                  <button type="button" className="app-btn-ghost h-10 px-3" onClick={() => { setTimer(EMPTY_TIMER); setFinishElapsedSeconds(null); }}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {pickerOpen ? (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={() => setPickerOpen(false)}>
          <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
              <div>
                <div className="text-base font-semibold text-foreground">What are you studying?</div>
                <div className="mt-1 text-xs text-muted-foreground">Choose an assessment or a subject before starting.</div>
              </div>
              <button type="button" className="app-iconbtn" onClick={() => setPickerOpen(false)} aria-label="Close">
                <X className="h-4 w-4" />
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
                          <span className="h-9 w-1 rounded-full border border-border" style={{ backgroundColor: subject?.color ?? "#94a3b8" }} />
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-muted-foreground">{subject?.name ?? "Assessment"} · {task.type === "exam" ? "Exam" : "Assignment"}</div>
                            <div className="mt-0.5 truncate text-sm font-semibold text-foreground">{task.title}</div>
                          </div>
                          {timer.linkedTaskId === task.id ? <Check className="h-4 w-4 text-primary" /> : null}
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
                      <span className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: subject.color }} />
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
        <div className="fixed inset-0 z-[90] grid place-items-center bg-black/40 p-4 backdrop-blur-[2px]" onMouseDown={closeFinishConfirmation}>
          <div
            className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="finish-study-title"
            onMouseDown={(event) => event.stopPropagation()}
            onKeyDown={(event) => {
              const target = event.target as HTMLElement;
              const isTextInput = target.tagName === "TEXTAREA" || target.tagName === "INPUT";
              if (event.key === "Enter" && (!isTextInput || event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                saveTimer();
              }
              if (event.key === "Escape") closeFinishConfirmation();
            }}
          >
            <div className="border-b border-border px-5 py-4">
              <div id="finish-study-title" className="text-base font-semibold text-foreground">Finish study session</div>
              <div className="mt-1 text-xs text-muted-foreground">Confirm the frozen duration before saving it to your Study log.</div>
            </div>
            <div className="p-5">
              <div className="mb-3 text-sm font-semibold text-foreground">{timerSelectionLabel}</div>
              <div className="rounded-2xl bg-muted/35 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Recorded by timer</div>
                <div className="mt-1 font-mono text-2xl font-semibold text-foreground">{formatSeconds(finishElapsedSeconds ?? elapsedSeconds)}</div>
              </div>
              <label className="mt-4 block text-sm font-medium text-foreground">What did you work on? <span className="font-normal text-muted-foreground">Optional</span></label>
              <textarea rows={3} value={finishNote} onChange={(event) => setFinishNote(event.target.value)} className="mt-2 w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30" />
              <div className="mt-5 flex gap-2">
                <button type="button" className="app-btn-primary flex-1" onClick={saveTimer}>Save session</button>
                <button type="button" className="app-btn-secondary" onClick={closeFinishConfirmation}>Cancel</button>
              </div>
              <div className="mt-2 text-center text-[11px] text-muted-foreground">Enter saves on desktop. Use Ctrl/⌘ + Enter while writing a note.</div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
