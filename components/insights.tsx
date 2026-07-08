// components/insights.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import type { Subject, Task, StudySession, TaskResult } from "./models";
import {
  Calendar,
  Clock,
  TrendingUp,
  Trophy,
  Sparkles,
  ChevronDown,
  Target,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const PERIODS_STORAGE_KEY = "mystudyplanner-periods";
const INSIGHTS_PREFS_KEY = "mystudyplanner-insights-prefs";

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

type InsightsPrefs = {
  view?: "study" | "marks";
  range?: 7 | 30;
  selectedPeriodStudy?: string;
  selectedPeriodMarks?: string;
};

type StudySubjectRow = {
  subjectId: string;
  subject: Subject | undefined;
  minutes: number;
  sessions: number;
};

type MarkSubjectRow = {
  subjectId: string;
  subject: Subject | undefined;
  percent: number;
  count: number;
};

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
  if (justNumber) return Number(justNumber[0]);

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

const clampDateMin = (a: Date, b: Date) => (a.getTime() >= b.getTime() ? a : b);

const formatDateShort = (d: Date) =>
  d.toLocaleDateString("en-US", { month: "short", day: "numeric" });

const formatWeekdayShort = (d: Date) =>
  d.toLocaleDateString("en-US", { weekday: "short" });

const getPerformanceLabel = (value: number) => {
  if (value >= 90) return "Excellent";
  if (value >= 80) return "Strong";
  if (value >= 70) return "Good";
  if (value >= 60) return "Developing";
  return "Needs attention";
};

const groupDaysBetween = (sessions: StudySession[]) => {
  const map = new Map<string, number>();

  sessions.forEach((session) => {
    const day = startOfDay(session.date).toISOString();
    map.set(day, (map.get(day) ?? 0) + parseDurationToMinutes(session.duration));
  });

  return map;
};

const getCurrentStreak = (sessions: StudySession[], now: Date) => {
  const days = new Set(sessions.map((s) => startOfDay(s.date).toISOString()));
  let streak = 0;
  let cursor = startOfDay(now);

  while (days.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

interface InsightsProps {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
}

export function Insights({ subjects, tasks, studySessions }: InsightsProps) {
  const [view, setView] = useState<"study" | "marks">("study");
  const [range, setRange] = useState<7 | 30>(30);
  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);
  const [selectedPeriodStudy, setSelectedPeriodStudy] = useState<string>("all");
  const [selectedPeriodMarks, setSelectedPeriodMarks] = useState<string>("all");

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

  useEffect(() => {
    try {
      const raw = localStorage.getItem(INSIGHTS_PREFS_KEY);
      if (!raw) return;

      const prefs = JSON.parse(raw) as InsightsPrefs;

      if (prefs.view === "study" || prefs.view === "marks") setView(prefs.view);
      setRange(30);
      if (typeof prefs.selectedPeriodStudy === "string") setSelectedPeriodStudy(prefs.selectedPeriodStudy);
      if (typeof prefs.selectedPeriodMarks === "string") setSelectedPeriodMarks(prefs.selectedPeriodMarks);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      const prefs: InsightsPrefs = {
        view,
        range: 30,
        selectedPeriodStudy,
        selectedPeriodMarks,
      };
      localStorage.setItem(INSIGHTS_PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // ignore
    }
  }, [view, selectedPeriodStudy, selectedPeriodMarks]);

  const now = useMemo(() => new Date(), []);

  const subjectById = useMemo(() => {
    const map: Record<string, Subject> = {};
    subjects.forEach((s) => {
      map[s.id] = s;
    });
    return map;
  }, [subjects]);

  const taskById = useMemo(() => {
    const map: Record<string, Task> = {};
    tasks.forEach((t) => {
      map[t.id] = t;
    });
    return map;
  }, [tasks]);

  const periodById = useMemo(() => {
    const map: Record<string, PeriodHydrated> = {};
    periods.forEach((p) => {
      map[p.id] = p;
    });
    return map;
  }, [periods]);

  const cutoff = useMemo(() => {
    const t = new Date(now);
    t.setDate(t.getDate() - range);
    return startOfDay(t);
  }, [range, now]);

  const selectedStudyPeriodObj = useMemo(() => {
    if (selectedPeriodStudy === "all") return null;
    return periodById[selectedPeriodStudy] ?? null;
  }, [selectedPeriodStudy, periodById]);

  const selectedMarksPeriodObj = useMemo(() => {
    if (selectedPeriodMarks === "all") return null;
    return periodById[selectedPeriodMarks] ?? null;
  }, [selectedPeriodMarks, periodById]);

  const sessionsInRange = useMemo(() => {
    if (selectedStudyPeriodObj) {
      const pStart = startOfDay(selectedStudyPeriodObj.startDate);
      const pEnd = startOfDay(selectedStudyPeriodObj.endDate);
      const effectiveStart = clampDateMin(cutoff, pStart);

      return studySessions.filter((s) => {
        const d = startOfDay(s.date);
        return d.getTime() >= effectiveStart.getTime() && d.getTime() <= pEnd.getTime();
      });
    }

    return studySessions.filter((s) => startOfDay(s.date).getTime() >= cutoff.getTime());
  }, [studySessions, cutoff, selectedStudyPeriodObj]);

  const totalMinutes = useMemo(
    () => sessionsInRange.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0),
    [sessionsInRange]
  );

  const totalStudyDays = useMemo(() => groupDaysBetween(sessionsInRange).size, [sessionsInRange]);

  const dailyAverageMinutes = useMemo(() => {
    if (totalStudyDays === 0) return 0;
    return Math.round(totalMinutes / totalStudyDays);
  }, [totalMinutes, totalStudyDays]);

  const currentStreak = useMemo(() => getCurrentStreak(sessionsInRange, now), [sessionsInRange, now]);

  const busiestDay = useMemo(() => {
    const grouped = Array.from(groupDaysBetween(sessionsInRange).entries()).map(([iso, minutes]) => ({
      date: new Date(iso),
      minutes,
    }));
    grouped.sort((a, b) => b.minutes - a.minutes);
    return grouped[0] ?? null;
  }, [sessionsInRange]);

  const studySubjectRows = useMemo<StudySubjectRow[]>(() => {
    const map = new Map<string, { minutes: number; sessions: number }>();

    sessionsInRange.forEach((session) => {
      const current = map.get(session.subjectId) ?? { minutes: 0, sessions: 0 };
      map.set(session.subjectId, {
        minutes: current.minutes + parseDurationToMinutes(session.duration),
        sessions: current.sessions + 1,
      });
    });

    return Array.from(map.entries())
      .map(([subjectId, value]) => ({
        subjectId,
        subject: subjectById[subjectId],
        minutes: value.minutes,
        sessions: value.sessions,
      }))
      .filter((row) => row.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  }, [sessionsInRange, subjectById]);

  const topStudySubject = studySubjectRows[0] ?? null;

  const minutesByAssessment = useMemo(() => {
    const map: Record<string, number> = {};

    studySessions.forEach((session) => {
      if (!session.linkedTaskId) return;
      const task = taskById[session.linkedTaskId];
      if (!task) return;
      if (!(task.type === "exam" || task.type === "assignment")) return;
      map[task.id] = (map[task.id] || 0) + parseDurationToMinutes(session.duration);
    });

    return map;
  }, [studySessions, taskById]);

  const mostStudiedAssessment = useMemo(() => {
    const entries = Object.entries(minutesByAssessment).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;
    const [taskId, minutes] = entries[0];
    return { task: taskById[taskId], minutes };
  }, [minutesByAssessment, taskById]);

  const upcomingAssessments = useMemo(() => {
    return tasks
      .filter((t) => (t.type === "exam" || t.type === "assignment") && Boolean(t.subjectId))
      .filter((t) => t.dueDate.getTime() >= now.getTime())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [tasks, now]);

  const assessableTasks = useMemo(
    () => tasks.filter((t) => (t.type === "exam" || t.type === "assignment") && Boolean(t.subjectId)),
    [tasks]
  );

  const recordedAssessmentsBase = useMemo(
    () => assessableTasks.filter((t) => Boolean(t.result)),
    [assessableTasks]
  );

  const recordedAssessments = useMemo(() => {
    let base = recordedAssessmentsBase;

    if (selectedMarksPeriodObj) {
      base = base.filter((t) => t.periodId === selectedMarksPeriodObj.id);
    }

    return base;
  }, [recordedAssessmentsBase, selectedMarksPeriodObj]);

  const marksTotals = useMemo(() => {
    let totalScore = 0;
    let totalOutOf = 0;

    for (const task of recordedAssessments) {
      const result: TaskResult | undefined = task.result;
      if (!result) continue;
      if (!Number.isFinite(result.score) || !Number.isFinite(result.outOf)) continue;
      if (result.outOf <= 0) continue;

      totalScore += result.score;
      totalOutOf += result.outOf;
    }

    const overallPercent = totalOutOf > 0 ? safePercent(totalScore, totalOutOf) : 0;
    return { totalScore, totalOutOf, overallPercent };
  }, [recordedAssessments]);

  const markSubjectRows = useMemo<MarkSubjectRow[]>(() => {
    const map = new Map<string, { score: number; outOf: number; count: number }>();

    recordedAssessments.forEach((task) => {
      const result = task.result;
      const subjectId = task.subjectId;
      if (!subjectId || !result || result.outOf <= 0) return;

      const current = map.get(subjectId) ?? { score: 0, outOf: 0, count: 0 };
      map.set(subjectId, {
        score: current.score + result.score,
        outOf: current.outOf + result.outOf,
        count: current.count + 1,
      });
    });

    return Array.from(map.entries())
      .map(([subjectId, value]) => ({
        subjectId,
        subject: subjectById[subjectId],
        percent: value.outOf > 0 ? safePercent(value.score, value.outOf) : 0,
        count: value.count,
      }))
      .sort((a, b) => b.percent - a.percent);
  }, [recordedAssessments, subjectById]);

  const topMarkSubject = markSubjectRows[0] ?? null;
  const weakestMarkSubject = markSubjectRows.length > 1 ? markSubjectRows[markSubjectRows.length - 1] : null;

  const bestAssessment = useMemo(() => {
    const entries = recordedAssessments
      .map((task) => {
        const result = task.result;
        if (!result || result.outOf <= 0) return null;
        return { task, percent: safePercent(result.score, result.outOf) };
      })
      .filter(Boolean) as { task: Task; percent: number }[];

    entries.sort((a, b) => b.percent - a.percent);
    return entries[0] ?? null;
  }, [recordedAssessments]);

  const recentResults = useMemo(() => {
    const items = recordedAssessments
      .map((task) => {
        const result = task.result;
        if (!result) return null;

        const date =
          result.dateRecorded instanceof Date
            ? result.dateRecorded
            : result.dateRecorded
            ? new Date(result.dateRecorded as unknown as string)
            : task.dueDate;

        return { task, result, date };
      })
      .filter(Boolean) as { task: Task; result: TaskResult; date: Date }[];

    items.sort((a, b) => b.date.getTime() - a.date.getTime());
    return items;
  }, [recordedAssessments]);

  const marksMomentum = useMemo(() => {
    if (recentResults.length < 4) return null;

    const latest = recentResults.slice(0, 3);
    const previous = recentResults.slice(3, 6);

    if (!previous.length) return null;

    const latestAvg = Math.round(
      latest.reduce((sum, row) => sum + safePercent(row.result.score, row.result.outOf), 0) / latest.length
    );

    const previousAvg = Math.round(
      previous.reduce((sum, row) => sum + safePercent(row.result.score, row.result.outOf), 0) / previous.length
    );

    return latestAvg - previousAvg;
  }, [recentResults]);

  const description =
    view === "study"
      ? "See how consistently you are studying, where your time is going, and what is coming up next."
      : "Track your recent results, strongest subjects, and where you need the most improvement.";

  const periodValue = view === "study" ? selectedPeriodStudy : selectedPeriodMarks;
  const setPeriodValue = view === "study" ? setSelectedPeriodStudy : setSelectedPeriodMarks;

  const StatCard = ({
    title,
    value,
    hint,
    icon,
  }: {
    title: string;
    value: React.ReactNode;
    hint: string;
    icon: React.ReactNode;
  }) => (
    <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
      <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {icon}
        {title}
      </div>
      <div className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );

  const SectionCard = ({
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
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/10 px-5 py-4">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            {icon ? (
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-background/70">
                {icon}
              </span>
            ) : null}
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">{title}</div>
              {subtitle ? <div className="mt-0.5 text-xs text-muted-foreground">{subtitle}</div> : null}
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
        "rounded-full px-3 py-1.5 text-[13px] leading-none transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
      ].join(" ")}
    >
      {children}
    </button>
  );

  const PeriodSelect = ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => {
    if (!periods.length) return null;

    return (
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            "appearance-none rounded-full border border-border bg-card shadow-sm",
            "px-4 py-2 pr-9 text-sm text-foreground transition hover:bg-background/60",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
          ].join(" ")}
        >
          <option value="all">All terms</option>
          {periods.map((period) => (
            <option key={period.id} value={period.id}>
              {period.name}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
    );
  };

  const EmptyState = ({
    title,
    hint,
  }: {
    title: string;
    hint: string;
  }) => (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-10 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-6 py-7 md:px-10">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-border bg-card p-1 shadow-sm">
            <ControlPill active={view === "study"} onClick={() => setView("study")}>
              Study
            </ControlPill>
            <ControlPill active={view === "marks"} onClick={() => setView("marks")}>
              Marks
            </ControlPill>
          </div>
          <PeriodSelect value={periodValue} onChange={setPeriodValue} />
        </div>
      </div>

      {view === "study" ? (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Total study"
              value={formatMinutes(totalMinutes)}
              hint={`${sessionsInRange.length} session${sessionsInRange.length === 1 ? "" : "s"} logged`}
              icon={<Clock className="h-4 w-4" />}
            />
            <StatCard
              title="Daily average"
              value={formatMinutes(dailyAverageMinutes)}
              hint={totalStudyDays > 0 ? `Across ${totalStudyDays} study day${totalStudyDays === 1 ? "" : "s"}` : "No sessions in this view yet"}
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatCard
              title="Current streak"
              value={currentStreak > 0 ? `${currentStreak} day${currentStreak === 1 ? "" : "s"}` : "—"}
              hint={currentStreak > 0 ? "Consecutive days studied" : "Study today to start a streak"}
              icon={<Flame className="h-4 w-4" />}
            />
            <StatCard
              title="Top subject"
              value={topStudySubject?.subject?.name ?? "—"}
              hint={topStudySubject ? `${formatMinutes(topStudySubject.minutes)} total` : "No study data yet"}
              icon={<TrendingUp className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <SectionCard
              title="Study breakdown"
              subtitle="Where your time is going"
              icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
            >
              {studySubjectRows.length ? (
                <div className="space-y-3">
                  {studySubjectRows.slice(0, 6).map((row) => {
                    const max = studySubjectRows[0]?.minutes || 1;
                    const width = Math.max(8, Math.round((row.minutes / max) * 100));
                    return (
                      <div key={row.subjectId} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 inline-flex items-center gap-2 text-muted-foreground">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: row.subject?.color ?? "#94A3B8" }}
                            />
                            <span className="truncate">{row.subject?.name ?? "Unassigned"}</span>
                          </div>
                          <div className="shrink-0 font-medium text-foreground">
                            {formatMinutes(row.minutes)}
                          </div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-border bg-muted/40">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: row.subject?.color ?? "#94A3B8",
                            }}
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row.sessions} session{row.sessions === 1 ? "" : "s"}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Nothing to show yet" hint="Log study sessions to unlock your breakdown." />
              )}
            </SectionCard>

            <div className="space-y-4">
              <SectionCard
                title="Study snapshot"
                subtitle="Quick read"
                icon={<Target className="h-4 w-4 text-muted-foreground" />}
              >
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <div className="text-xs font-medium text-muted-foreground">Busiest day</div>
                    <div className="mt-2 text-lg font-semibold text-foreground">
                      {busiestDay ? formatDateShort(busiestDay.date) : "—"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {busiestDay
                        ? `${formatMinutes(busiestDay.minutes)} studied on ${formatWeekdayShort(busiestDay.date)}`
                        : "No study days recorded in this view."}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border bg-background/50 p-4">
                    <div className="text-xs font-medium text-muted-foreground">Most studied assessment</div>
                    <div className="mt-2 text-sm font-semibold text-foreground">
                      {mostStudiedAssessment?.task?.title ?? "No linked study yet"}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {mostStudiedAssessment
                        ? `${formatMinutes(mostStudiedAssessment.minutes)} logged toward this assessment`
                        : "Link study sessions to exams or assignments to track focus."}
                    </div>
                  </div>
                </div>
              </SectionCard>

              <SectionCard
                title="Upcoming assessments"
                subtitle="Next 5"
                icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
              >
                {upcomingAssessments.length ? (
                  <div className="space-y-2">
                    {upcomingAssessments.map((task) => {
                      const subject = task.subjectId ? task.subjectId ? task.subjectId ? subjectById[task.subjectId] : undefined : undefined : undefined;
                      const color = subject?.color ?? "#94A3B8";

                      return (
                        <div
                          key={task.id}
                          className="rounded-xl border border-border bg-background/60 px-4 py-3 transition hover:bg-background/80"
                          style={{ borderLeftWidth: 3, borderLeftColor: color }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-semibold text-foreground">{task.title}</div>
                              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-flex items-center gap-2 min-w-0">
                                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                  <span className="truncate">{subject?.name ?? "Unassigned"}</span>
                                </span>
                                <span className="text-muted-foreground/60">•</span>
                                <span>{task.type.toUpperCase()}</span>
                              </div>
                            </div>
                            <div className="shrink-0 text-right">
                              <div className="text-xs font-semibold text-foreground">{formatDateShort(task.dueDate)}</div>
                              <div className="mt-1 text-[11px] text-muted-foreground">{formatWeekdayShort(task.dueDate)}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No upcoming assessments" hint="Add an exam or assignment in Tasks." />
                )}
              </SectionCard>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <StatCard
              title="Overall average"
              value={recordedAssessments.length ? `${marksTotals.overallPercent}%` : "—"}
              hint={
                recordedAssessments.length
                  ? `${recordedAssessments.length} recorded result${recordedAssessments.length === 1 ? "" : "s"}`
                  : "No results recorded yet"
              }
              icon={<TrendingUp className="h-4 w-4" />}
            />
            <StatCard
              title="Top subject"
              value={(topMarkSubject as MarkSubjectRow | null)?.subject?.name ?? "—"}
              hint={
                topMarkSubject
                  ? `${topMarkSubject.percent}% average`
                  : "Record marks to see subject strength"
              }
              icon={<Trophy className="h-4 w-4" />}
            />
            <StatCard
              title="Current focus"
              value={(weakestMarkSubject as MarkSubjectRow | null)?.subject?.name ?? "—"}
              hint={
                weakestMarkSubject
                  ? `${weakestMarkSubject.percent}% average`
                  : "Needs more subjects to compare"
              }
              icon={<Target className="h-4 w-4" />}
            />
            <StatCard
              title="Recent momentum"
              value={
                marksMomentum === null
                  ? "—"
                  : `${marksMomentum > 0 ? "+" : ""}${marksMomentum}%`
              }
              hint={
                marksMomentum === null
                  ? "Needs more recent results"
                  : marksMomentum >= 0
                  ? "Results are trending up"
                  : "Results dipped recently"
              }
              icon={marksMomentum !== null && marksMomentum >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <SectionCard
              title="Subject ranking"
              subtitle="How each subject is performing"
              icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
            >
              {markSubjectRows.length ? (
                <div className="space-y-3">
                  {markSubjectRows.map((row, index) => {
                    const max = markSubjectRows[0]?.percent || 1;
                    const width = Math.max(8, Math.round((row.percent / max) * 100));
                    return (
                      <div key={row.subjectId} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-xs">
                          <div className="min-w-0 inline-flex items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ backgroundColor: row.subject?.color ?? "#94A3B8" }}
                            />
                            <span className="truncate text-foreground">{row.subject?.name ?? "Unassigned"}</span>
                            {index === 0 ? (
                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                Strongest
                              </span>
                            ) : null}
                            {weakestMarkSubject && row.subjectId === weakestMarkSubject.subjectId ? (
                              <span className="rounded-full border border-border bg-background px-2 py-0.5 text-[11px] text-muted-foreground">
                                Focus
                              </span>
                            ) : null}
                          </div>
                          <div className="shrink-0 font-medium text-foreground">{row.percent}%</div>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full border border-border bg-muted/40">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${width}%`,
                              backgroundColor: row.subject?.color ?? "#94A3B8",
                            }}
                          />
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          {row.count} result{row.count === 1 ? "" : "s"} • {getPerformanceLabel(row.percent)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No subject trends yet" hint="Enter marks in the Marks page to build rankings." />
              )}
            </SectionCard>

            <SectionCard
              title="Recent results"
              subtitle="Latest 5"
              icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
            >
              {recentResults.length ? (
                <div className="space-y-2">
                  {recentResults.slice(0, 5).map(({ task, result, date }) => {
                    const subject = task.subjectId ? task.subjectId ? task.subjectId ? subjectById[task.subjectId] : undefined : undefined : undefined;
                    const color = subject?.color ?? "#94A3B8";
                    const percent = safePercent(result.score, result.outOf);

                    return (
                      <div
                        key={task.id}
                        className="rounded-xl border border-border bg-background/60 px-4 py-3 transition hover:bg-background/80"
                        style={{ borderLeftWidth: 3, borderLeftColor: color }}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">{task.title}</div>
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                              <span className="inline-flex items-center gap-2 min-w-0">
                                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
                                <span className="truncate">{subject?.name ?? "Unassigned"}</span>
                              </span>
                              <span className="text-muted-foreground/60">•</span>
                              <span>{task.type.toUpperCase()}</span>
                            </div>
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-xs font-semibold text-foreground">
                              {result.score} / {result.outOf} ({percent}%)
                            </div>
                            <div className="mt-1 text-[11px] text-muted-foreground">{formatDateShort(date)}</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="No recent results" hint="Enter results in Marks to populate this feed." />
              )}
            </SectionCard>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <SectionCard
              title="Best assessment"
              subtitle="Top individual result"
              icon={<Trophy className="h-4 w-4 text-muted-foreground" />}
            >
              {bestAssessment ? (
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="text-sm font-semibold text-foreground">{bestAssessment.task.title}</div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">{bestAssessment.percent}%</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {bestAssessment.task.type.toUpperCase()} • {bestAssessment.task.subjectId ? subjectById[bestAssessment.task.subjectId]?.name ?? "Unassigned" : "Unassigned"}
                  </div>
                </div>
              ) : (
                <EmptyState title="No best result yet" hint="Your top-performing assessment will appear here." />
              )}
            </SectionCard>

            <SectionCard
              title="Focus area"
              subtitle="Best next improvement target"
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
            >
              {weakestMarkSubject ? (
                <div className="rounded-2xl border border-border bg-background/50 p-4">
                  <div className="text-sm font-semibold text-foreground">
                    {(weakestMarkSubject as MarkSubjectRow).subject?.name ?? "Unassigned"}
                  </div>
                  <div className="mt-2 text-2xl font-semibold text-foreground">{weakestMarkSubject.percent}%</div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {weakestMarkSubject.count} result{weakestMarkSubject.count === 1 ? "" : "s"} • {getPerformanceLabel(weakestMarkSubject.percent)}
                  </div>
                </div>
              ) : (
                <EmptyState title="Nothing to compare yet" hint="Add results across more than one subject." />
              )}
            </SectionCard>
          </div>
        </>
      )}
    </div>
  );
}