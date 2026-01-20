"use client";

import React, { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Calendar, Settings2 } from "lucide-react";
import type { Subject, Task, StudySession } from "./models";
import { isSameDay } from "./models";

// Must match Settings + Tasks + Marks
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

/* -------------------- Helpers -------------------- */

const daysUntil = (due: Date, from: Date) =>
  Math.ceil((due.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function dueLabel(d: number) {
  if (d < 0) return `${Math.abs(d)}d late`;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `In ${d}d`;
}

function typeLabel(t: Task["type"]) {
  if (t === "assignment") return "Assignment";
  if (t === "exam") return "Exam";
  if (t === "homework") return "Homework";
  return "Task";
}

const startOfDay = (d: Date) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

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
  const diffWeeks = Math.floor(
    (wsToday - wsStart) / (7 * 24 * 60 * 60 * 1000)
  );
  return diffWeeks + 1; // Week 1 at start week
};

/* -------------------- Quotes -------------------- */

const QUOTES: Array<{ quote: string; author?: string }> = [
  { quote: "Keep it simple. Do the next right thing." },
  { quote: "Small progress, every day.", author: "Unknown" },
  { quote: "Consistency beats intensity.", author: "Unknown" },
  {
    quote: "You don’t rise to the goal — you fall to the system.",
    author: "James Clear",
  },
  {
    quote: "Discipline is choosing what you want most over what you want now.",
    author: "Unknown",
  },
  {
    quote: "Start where you are. Use what you have. Do what you can.",
    author: "Arthur Ashe",
  },
  {
    quote: "The work you do today builds the results you want tomorrow.",
    author: "Unknown",
  },
  { quote: "Focus on the reps, not the outcome.", author: "Unknown" },
  {
    quote: "Make it obvious. Make it easy. Make it satisfying.",
    author: "James Clear",
  },
  { quote: "Done is better than perfect.", author: "Sheryl Sandberg" },
];

function daySeed(d: Date) {
  // stable per-day (local time)
  return Number(
    `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(
      d.getDate()
    ).padStart(2, "0")}`
  );
}

function pickDailyQuote(d: Date) {
  const idx = daySeed(d) % QUOTES.length;
  return QUOTES[idx];
}

/* -------------------- Props -------------------- */

interface DashboardProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onOpenStudyPlanner: () => void;
  onOpenSettings: () => void;
}

/* -------------------- Dashboard -------------------- */

export function Dashboard({
  tasks,
  subjects,
  studySessions,
  onOpenStudyPlanner,
  onOpenSettings,
}: DashboardProps) {
  // Keep "today" stable so useMemo dependencies actually memoize
  const today = useMemo(() => new Date(), []);

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const dailyQuote = useMemo(() => pickDailyQuote(today), [today]);

  // ✅ Load Terms from localStorage (Terms 1–4)
  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (!raw) {
        setPeriods([]);
        return;
      }

      const parsed = JSON.parse(raw) as PeriodStored[];
      const hydrated: PeriodHydrated[] = (Array.isArray(parsed) ? parsed : []).map(
        (p) => ({
          id: p.id,
          name: p.name,
          startDate: new Date(p.startDate),
          endDate: new Date(p.endDate),
        })
      );

      const onlyTerms1to4 = hydrated
        .filter((p) => /^term\s*[1-4]$/i.test(p.name.trim()))
        .sort(
          (a, b) =>
            startOfDay(a.startDate).getTime() - startOfDay(b.startDate).getTime()
        );

      setPeriods(onlyTerms1to4);
    } catch {
      setPeriods([]);
    }
  }, []);

  const termWeekLabel = useMemo(() => {
    if (periods.length === 0) return null;

    const active = periods.find((p) =>
      inRangeInclusive(today, p.startDate, p.endDate)
    );
    if (!active) return null;

    const wk = weekOfTerm(today, active.startDate);
    return `${active.name} · Week ${wk}`;
  }, [periods, today]);

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  // ✅ Focus Today = sessions today (not completed)
  const focusToday = useMemo(
    () =>
      studySessions
        .filter((s) => !s.completed && isSameDay(s.date, today))
        .slice(0, 4),
    [studySessions, today]
  );

  const upNext = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 6),
    [tasks]
  );

  const needsSubjects = subjects.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {formattedDate}
          </h1>

          <div className="flex flex-col gap-1">
            <p className="text-sm text-muted-foreground">
              {dailyQuote.quote}
              {dailyQuote.author ? (
                <span className="text-muted-foreground/70"> — {dailyQuote.author}</span>
              ) : null}
            </p>

            {termWeekLabel ? (
              <div className="text-xs text-muted-foreground">{termWeekLabel}</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* ✅ First-run setup nudge (only when no subjects) */}
      {needsSubjects && (
        <div className="rounded-2xl border border-border bg-card shadow-sm">
          <div className="px-5 py-4 flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">
                Start by adding your subjects
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                MyStudyPlanner organises everything by subject. Add yours in Settings to get started.
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenSettings}
              className="shrink-0 inline-flex h-9 items-center gap-2 rounded-xl border border-border bg-background/40 px-3 text-sm font-medium text-foreground/90 hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              title="Go to Settings"
            >
              <Settings2 className="h-4 w-4" />
              Add subjects
            </button>
          </div>
        </div>
      )}

      {/* Subtle section wrapper (hierarchy/rhythm) */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Today</div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {/* Focus today */}
          <section className="md:col-span-7 rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-foreground">Focus today</h2>
                <p className="text-xs text-muted-foreground">Today’s study sessions</p>
              </div>

              <button
                type="button"
                onClick={onOpenStudyPlanner}
                className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                title="Jump to Study Planner"
              >
                Open <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              {focusToday.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
                  <div className="text-sm font-medium text-foreground">
                    Nothing planned
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Log a study session to see it here.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {focusToday.map((s) => {
                    const subject = subjectById.get(s.subjectId);
                    const dot = subject?.color ?? "#94a3b8";

                    return (
                      <div
                        key={s.id}
                        className="group rounded-xl border border-border bg-background/40 px-4 py-3 hover:bg-background/60 transition"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className="mt-1 h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: dot }}
                          />

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-medium text-foreground">
                                  {s.title}
                                </div>
                                <div className="mt-1 text-xs text-muted-foreground truncate">
                                  {s.duration} • {s.startTime} •{" "}
                                  {subject?.name ?? "Unassigned"}
                                </div>
                              </div>

                              <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>

          {/* Up next */}
          <section className="md:col-span-5 rounded-2xl border border-border bg-card shadow-sm">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-sm font-semibold text-foreground">Up next</h2>
              <p className="text-xs text-muted-foreground">Upcoming deadlines</p>
            </div>

            <div className="p-4">
              {upNext.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
                  <div className="text-sm font-medium text-foreground">All clear</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    No upcoming tasks.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {upNext.map((task) => {
                    const subject = subjectById.get(task.subjectId);
                    const d = daysUntil(task.dueDate, today);
                    const dot = subject?.color ?? "#94a3b8";

                    const urgency = clamp(d, -30, 30);
                    const isLate = urgency < 0;

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-border bg-background/40 px-4 py-3 hover:bg-background/60 transition"
                        style={{ borderLeftWidth: 3, borderLeftColor: dot }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-foreground">
                              {task.title}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                <span
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: dot }}
                                />
                                {subject?.name ?? "Unassigned"}
                              </span>
                              <span className="text-muted-foreground/60">•</span>
                              <span>{typeLabel(task.type)}</span>
                            </div>
                          </div>

                          <div className="shrink-0 text-right">
                            <div
                              className={[
                                "text-xs font-semibold",
                                isLate ? "text-destructive" : "text-foreground",
                              ].join(" ")}
                            >
                              {dueLabel(d)}
                            </div>
                            <div className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {task.dueDate.toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
