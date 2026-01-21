"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Subject, Task, StudySession, TaskResult } from "./models";
import { Calendar, Clock, TrendingUp, Trophy, Sparkles } from "lucide-react";

// Must match Settings + Tasks key
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

// --- helpers ---
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

const safePercent = (score: number, outOf: number): number => {
  if (!outOf || outOf <= 0) return 0;
  return Math.round((score / outOf) * 100);
};

interface InsightsProps {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
}

export function Insights({ subjects, tasks, studySessions }: InsightsProps) {
  const [view, setView] = useState<"study" | "marks">("study");
  const [range, setRange] = useState<7 | 30>(7);

  // Marks period filter (only used on marks view)
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
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

      hydrated.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setPeriods(hydrated);
    } catch {
      setPeriods([]);
    }
  }, []);

  // Stable "now" so date-based memos don't drift every render
  const now = useMemo(() => new Date(), []);

  const subjectById = useMemo(() => {
    const map: Record<string, Subject> = {};
    subjects.forEach((s) => (map[s.id] = s));
    return map;
  }, [subjects]);

  const taskById = useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach((t) => (map[t.id] = t));
    return map;
  }, [tasks]);

  /* -------------------- Study insights (existing) -------------------- */

  const cutoff = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() - range);
    return startOfDay(t);
  }, [range, now]);

  const sessionsInRange = useMemo(() => {
    return studySessions.filter((s) => startOfDay(s.date) >= cutoff);
  }, [studySessions, cutoff]);

  const totalMinutes = useMemo(() => {
    return sessionsInRange.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
  }, [sessionsInRange]);

  const minutesBySubject = useMemo(() => {
    const map: Record<string, number> = {};
    sessionsInRange.forEach((s) => {
      map[s.subjectId] = (map[s.subjectId] || 0) + parseDurationToMinutes(s.duration);
    });
    return map;
  }, [sessionsInRange]);

  const topSubject = useMemo(() => {
    const entries = Object.entries(minutesBySubject).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const [subjectId, mins] = entries[0];
    return { subject: subjectById[subjectId], minutes: mins };
  }, [minutesBySubject, subjectById]);

  const upcomingAssessments = useMemo(() => {
    return tasks
      .filter((t) => t.type === "exam" || t.type === "assignment")
      .filter((t) => t.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [tasks, now]);

  const minutesByAssessment = useMemo(() => {
    const map: Record<string, number> = {};
    studySessions.forEach((s) => {
      if (!s.linkedTaskId) return;
      const t = taskById[s.linkedTaskId];
      if (!t) return;
      if (!(t.type === "exam" || t.type === "assignment")) return;
      map[t.id] = (map[t.id] || 0) + parseDurationToMinutes(s.duration);
    });
    return map;
  }, [studySessions, taskById]);

  const mostStudiedAssessment = useMemo(() => {
    const entries = Object.entries(minutesByAssessment).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const [taskId, mins] = entries[0];
    return { task: taskById[taskId], minutes: mins };
  }, [minutesByAssessment, taskById]);

  const subjectBreakdown = useMemo(() => {
    const entries = Object.entries(minutesBySubject)
      .map(([subjectId, mins]) => ({
        subjectId,
        minutes: mins,
        subject: subjectById[subjectId],
      }))
      .filter((x) => x.subject && x.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 6);

    const max = entries.reduce((m, x) => Math.max(m, x.minutes), 0) || 1;

    return { entries, max };
  }, [minutesBySubject, subjectById]);

  /* -------------------- Marks insights (derived from tasks) -------------------- */

  const assessableTasks = useMemo(() => {
    return tasks.filter((t) => t.type === "exam" || t.type === "assignment");
  }, [tasks]);

  const recordedAssessmentsBase = useMemo(() => {
    return assessableTasks.filter((t) => Boolean(t.result));
  }, [assessableTasks]);

  const recordedAssessments = useMemo(() => {
    if (selectedPeriod === "all") return recordedAssessmentsBase;
    return recordedAssessmentsBase.filter((t) => t.periodId === selectedPeriod);
  }, [recordedAssessmentsBase, selectedPeriod]);

  const marksTotals = useMemo(() => {
    let totalScore = 0;
    let totalOutOf = 0;

    for (const t of recordedAssessments) {
      const r: TaskResult | undefined = t.result;
      if (!r) continue;
      if (!Number.isFinite(r.score) || !Number.isFinite(r.outOf)) continue;
      if (r.outOf <= 0) continue;
      totalScore += r.score;
      totalOutOf += r.outOf;
    }

    const overallPercent = totalOutOf > 0 ? safePercent(totalScore, totalOutOf) : 0;

    return { totalScore, totalOutOf, overallPercent };
  }, [recordedAssessments]);

  const marksBySubject = useMemo(() => {
    const map: Record<string, { score: number; outOf: number; count: number }> = {};

    for (const t of recordedAssessments) {
      const r: TaskResult | undefined = t.result;
      if (!r) continue;
      if (r.outOf <= 0) continue;

      const sid = t.subjectId;
      if (!map[sid]) map[sid] = { score: 0, outOf: 0, count: 0 };
      map[sid].score += r.score;
      map[sid].outOf += r.outOf;
      map[sid].count += 1;
    }

    return map;
  }, [recordedAssessments]);

  const topMarkSubject = useMemo(() => {
    const entries = Object.entries(marksBySubject)
      .map(([subjectId, agg]) => ({
        subjectId,
        subject: subjectById[subjectId],
        percent: agg.outOf > 0 ? safePercent(agg.score, agg.outOf) : 0,
        count: agg.count,
      }))
      .filter((x) => x.subject && x.count > 0)
      .sort((a, b) => b.percent - a.percent);

    return entries.length ? entries[0] : null;
  }, [marksBySubject, subjectById]);

  const bestAssessment = useMemo(() => {
    const entries = recordedAssessments
      .map((t) => {
        const r: TaskResult | undefined = t.result;
        if (!r || r.outOf <= 0) return null;
        return { task: t, percent: safePercent(r.score, r.outOf) };
      })
      .filter(Boolean) as { task: Task; percent: number }[];

    entries.sort((a, b) => b.percent - a.percent);
    return entries.length ? entries[0] : null;
  }, [recordedAssessments]);

  const recentResults = useMemo(() => {
    const items: {
      task: Task;
      result: TaskResult;
      date: Date;
    }[] = recordedAssessments
      .map((t) => {
        const r: TaskResult | undefined = t.result;
        if (!r) return null;

        const date =
          r.dateRecorded instanceof Date
            ? r.dateRecorded
            : r.dateRecorded
            ? new Date(r.dateRecorded)
            : t.dueDate;

        return { task: t, result: r, date };
      })
      .filter(Boolean) as {
      task: Task;
      result: TaskResult;
      date: Date;
    }[];

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items.slice(0, 5);
  }, [recordedAssessments]);

  const Card = ({
    title,
    subtitle,
    icon,
    children,
  }: {
    title: string;
    subtitle?: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {icon ? (
              <span className="h-9 w-9 rounded-xl border border-border bg-background/40 grid place-items-center">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{title}</div>
              {subtitle ? <div className="text-xs text-muted-foreground">{subtitle}</div> : null}
            </div>
          </div>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );

  const ControlPill = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const HeaderTab = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-lg text-sm transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active ? "bg-muted text-foreground font-medium" : "text-muted-foreground hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">
            {view === "study"
              ? "A quick view of your study + upcoming assessments"
              : "A quick view of your recorded results"}
          </p>
        </div>

        {/* Tabs (lighter, calmer) */}
        <div className="flex items-center gap-2">
          <HeaderTab active={view === "study"} onClick={() => setView("study")}>
            Study
          </HeaderTab>
          <HeaderTab active={view === "marks"} onClick={() => setView("marks")}>
            Marks
          </HeaderTab>
        </div>
      </div>

      {view === "study" ? (
        <>
          {/* Study range (contextual, not in header) */}
          <div className="flex items-center justify-end">
            <div className="rounded-full border border-border bg-card p-1 flex items-center gap-1">
              <ControlPill active={range === 7} onClick={() => setRange(7)}>
                7 days
              </ControlPill>
              <ControlPill active={range === 30} onClick={() => setRange(30)}>
                30 days
              </ControlPill>
            </div>
          </div>

          {/* Top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              title="Total study"
              subtitle={`Last ${range} days`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            >
              <div className="text-3xl font-semibold text-foreground">{formatMinutes(totalMinutes)}</div>
              <div className="mt-2 text-xs text-muted-foreground">
                {sessionsInRange.length} session{sessionsInRange.length === 1 ? "" : "s"} logged
              </div>
            </Card>

            <Card
              title="Top subject"
              subtitle={`Last ${range} days`}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            >
              {topSubject?.subject ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: topSubject.subject.color }}
                      />
                      <div className="text-sm font-semibold text-foreground truncate">
                        {topSubject.subject.name}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{formatMinutes(topSubject.minutes)}</div>
                  </div>

                  <span
                    className="shrink-0 inline-flex items-center rounded-full border border-border bg-background/40 px-2 py-1 text-xs text-muted-foreground"
                    style={{ boxShadow: `0 0 0 2px ${topSubject.subject.color}22` }}
                  >
                    Top
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-foreground">No sessions yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">Log a study session to unlock insights.</div>
                </div>
              )}
            </Card>

            <Card
              title="Most studied assessment"
              subtitle="All time"
              icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            >
              {mostStudiedAssessment?.task ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground truncate">
                    {mostStudiedAssessment.task.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {mostStudiedAssessment.task.type.toUpperCase()} •{" "}
                    {formatMinutes(mostStudiedAssessment.minutes)}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-foreground">No linked study yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Link sessions to an exam/assignment to track progress.
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Breakdown + upcoming */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Subject breakdown */}
            <div className="lg:col-span-5">
              <Card
                title="Study breakdown"
                subtitle={`By subject (last ${range} days)`}
                icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
              >
                {subjectBreakdown.entries.length ? (
                  <div className="space-y-3">
                    {subjectBreakdown.entries.map((x) => {
                      const pct = Math.max(0.06, x.minutes / subjectBreakdown.max); // keep tiny bars visible
                      return (
                        <div key={x.subjectId} className="space-y-1">
                          <div className="flex items-center justify-between gap-3 text-xs">
                            <div className="min-w-0 flex items-center gap-2 text-muted-foreground">
                              <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: x.subject.color }}
                              />
                              <span className="truncate">{x.subject.name}</span>
                            </div>
                            <div className="shrink-0 text-foreground font-medium">{formatMinutes(x.minutes)}</div>
                          </div>
                          <div className="h-2 rounded-full bg-muted/50 overflow-hidden border border-border">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${pct * 100}%`, backgroundColor: x.subject.color }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                    <div className="text-sm font-medium text-foreground">Nothing to show</div>
                    <div className="mt-1 text-xs text-muted-foreground">Log sessions in the Study Planner.</div>
                  </div>
                )}
              </Card>
            </div>

            {/* Upcoming assessments */}
            <div className="lg:col-span-7">
              <Card
                title="Upcoming assessments"
                subtitle="Next 5 exams/assignments"
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              >
                {upcomingAssessments.length ? (
                  <div className="space-y-2">
                    {upcomingAssessments.map((t) => {
                      const subj = subjectById[t.subjectId];
                      const dot = subj?.color ?? "#94a3b8";

                      return (
                        <div
                          key={t.id}
                          className="rounded-xl border border-border bg-background/40 px-4 py-3 hover:bg-background/60 transition"
                          style={{ borderLeftWidth: 3, borderLeftColor: dot }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">{t.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2 min-w-0">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
                                  <span className="truncate">{subj?.name ?? "Unassigned"}</span>
                                </span>
                                <span className="text-muted-foreground/60">•</span>
                                <span className="shrink-0">{t.type.toUpperCase()}</span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <div className="text-xs font-semibold text-foreground">
                                {t.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                {t.dueDate.toLocaleDateString("en-US", { weekday: "short" })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
                    <div className="text-sm font-medium text-foreground">No upcoming exams/assignments</div>
                    <div className="mt-1 text-xs text-muted-foreground">Add one in Tasks or Calendar.</div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Marks period filter (contextual, inside marks view) */}
          {periods.length > 0 ? (
            <div className="flex items-center justify-end">
              <div className="rounded-full border border-border bg-card p-1 flex items-center gap-1">
                <ControlPill active={selectedPeriod === "all"} onClick={() => setSelectedPeriod("all")}>
                  All periods
                </ControlPill>
                {periods.map((p) => (
                  <ControlPill key={p.id} active={selectedPeriod === p.id} onClick={() => setSelectedPeriod(p.id)}>
                    {p.name}
                  </ControlPill>
                ))}
              </div>
            </div>
          ) : null}

          {/* Marks top cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card
              title="Overall average"
              subtitle={recordedAssessments.length ? "Across recorded results" : "No results yet"}
              icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
            >
              {recordedAssessments.length ? (
                <>
                  <div className="text-3xl font-semibold text-foreground">{marksTotals.overallPercent}%</div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {recordedAssessments.length} recorded result{recordedAssessments.length === 1 ? "" : "s"}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-foreground">No results recorded</div>
                  <div className="mt-1 text-xs text-muted-foreground">Enter a result in Marks to see insights.</div>
                </div>
              )}
            </Card>

            <Card
              title="Top subject"
              subtitle={topMarkSubject ? `${topMarkSubject.count} result${topMarkSubject.count === 1 ? "" : "s"}` : "—"}
              icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
            >
              {topMarkSubject?.subject ? (
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: topMarkSubject.subject.color }} />
                      <div className="text-sm font-semibold text-foreground truncate">{topMarkSubject.subject.name}</div>
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">{topMarkSubject.percent}% average</div>
                  </div>

                  <span
                    className="shrink-0 inline-flex items-center rounded-full border border-border bg-background/40 px-2 py-1 text-xs text-muted-foreground"
                    style={{ boxShadow: `0 0 0 2px ${topMarkSubject.subject.color}22` }}
                  >
                    Top
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-foreground">Not enough data</div>
                  <div className="mt-1 text-xs text-muted-foreground">Record results to see subject trends.</div>
                </div>
              )}
            </Card>

            <Card
              title="Best assessment"
              subtitle="Highest result"
              icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            >
              {bestAssessment?.task ? (
                <div className="space-y-1">
                  <div className="text-sm font-semibold text-foreground truncate">{bestAssessment.task.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {bestAssessment.percent}% • {bestAssessment.task.type.toUpperCase()}
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
                  <div className="text-sm font-medium text-foreground">No results yet</div>
                  <div className="mt-1 text-xs text-muted-foreground">Your best result will appear here.</div>
                </div>
              )}
            </Card>
          </div>

          {/* Recent results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-12">
              <Card title="Recent results" subtitle="Last 5 recorded" icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
                {recentResults.length ? (
                  <div className="space-y-2">
                    {recentResults.map(({ task, result, date }) => {
                      const subj = subjectById[task.subjectId];
                      const dot = subj?.color ?? "#94a3b8";
                      const pct = safePercent(result.score, result.outOf);

                      return (
                        <div
                          key={task.id}
                          className="rounded-xl border border-border bg-background/40 px-4 py-3 hover:bg-background/60 transition"
                          style={{ borderLeftWidth: 3, borderLeftColor: dot }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="text-sm font-semibold text-foreground truncate">{task.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2 min-w-0">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: dot }} />
                                  <span className="truncate">{subj?.name ?? "Unassigned"}</span>
                                </span>
                                <span className="text-muted-foreground/60">•</span>
                                <span className="shrink-0">{task.type.toUpperCase()}</span>
                              </div>
                            </div>

                            <div className="shrink-0 text-right">
                              <div className="text-xs font-semibold text-foreground">
                                {result.score} / {result.outOf} ({pct}%)
                              </div>
                              <div className="mt-1 text-[11px] text-muted-foreground">
                                {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
                    <div className="text-sm font-medium text-foreground">No recent results</div>
                    <div className="mt-1 text-xs text-muted-foreground">Record results in Marks to populate insights.</div>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
