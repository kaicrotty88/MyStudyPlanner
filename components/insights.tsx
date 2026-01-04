"use client";

import React, { useMemo, useState } from "react";
import type { Subject, Task, StudySession } from "./models";
import { Calendar, Clock, TrendingUp, Trophy, Sparkles } from "lucide-react";

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

const daysAgo = (n: number) => {
  const t = new Date();
  t.setDate(t.getDate() - n);
  return startOfDay(t);
};

interface InsightsProps {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
}

export function Insights({ subjects, tasks, studySessions }: InsightsProps) {
  const [range, setRange] = useState<7 | 30>(7);

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

  const cutoff = useMemo(() => daysAgo(range), [range]);

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
    const now = new Date();
    return tasks
      .filter((t) => t.type === "exam" || t.type === "assignment")
      .filter((t) => t.dueDate >= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [tasks]);

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

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Insights</h1>
          <p className="text-sm text-muted-foreground">A quick view of your study + upcoming assessments</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border bg-card p-1 flex gap-1">
            <button
              onClick={() => setRange(7)}
              className={[
                "px-3 py-1.5 rounded-full text-sm transition",
                range === 7 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted border border-border bg-card",
              ].join(" ")}
            >
              7 days
            </button>
            <button
              onClick={() => setRange(30)}
              className={[
                "px-3 py-1.5 rounded-full text-sm transition",
                range === 30 ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted border border-border bg-card",
              ].join(" ")}
            >
              30 days
            </button>
          </div>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          title={`Total study`}
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
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: topSubject.subject.color }} />
                  <div className="text-sm font-semibold text-foreground truncate">{topSubject.subject.name}</div>
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

        <Card title="Most studied assessment" subtitle="All time" icon={<Trophy className="h-4 w-4 text-muted-foreground" />}>
          {mostStudiedAssessment?.task ? (
            <div className="space-y-1">
              <div className="text-sm font-semibold text-foreground truncate">{mostStudiedAssessment.task.title}</div>
              <div className="text-xs text-muted-foreground">
                {mostStudiedAssessment.task.type.toUpperCase()} • {formatMinutes(mostStudiedAssessment.minutes)}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-8 text-center">
              <div className="text-sm font-medium text-foreground">No linked study yet</div>
              <div className="mt-1 text-xs text-muted-foreground">Link sessions to an exam/assignment to track progress.</div>
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
                          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: x.subject.color }} />
                          <span className="truncate">{x.subject.name}</span>
                        </div>
                        <div className="shrink-0 text-foreground font-medium">{formatMinutes(x.minutes)}</div>
                      </div>
                      <div className="h-2 rounded-full bg-muted/50 overflow-hidden border border-border">
                        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: x.subject.color }} />
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
          <Card title="Upcoming assessments" subtitle="Next 5 exams/assignments" icon={<Calendar className="h-4 w-4 text-muted-foreground" />}>
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
    </div>
  );
}
