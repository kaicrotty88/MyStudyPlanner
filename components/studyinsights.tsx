// components/studyinsights.tsx
"use client";

import React, { useMemo } from "react";
import { BarChart3, Clock, Flame, Sparkles, Target, TrendingUp } from "lucide-react";
import type { Subject, Task, StudySession } from "./models";

type StudySubjectRow = {
  subjectId: string;
  subject?: Subject;
  minutes: number;
  sessions: number;
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
  const cursor = startOfDay(now);

  while (days.has(cursor.toISOString())) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

interface StudyInsightsProps {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
}

export function StudyInsights({ subjects, tasks, studySessions }: StudyInsightsProps) {
  const now = useMemo(() => new Date(), []);

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((subject) => map.set(subject.id, subject));
    return map;
  }, [subjects]);

  const taskById = useMemo(() => {
    const map = new Map<string, Task>();
    tasks.forEach((task) => map.set(task.id, task));
    return map;
  }, [tasks]);

  const last30Days = useMemo(() => {
    const cutoff = startOfDay(new Date(now));
    cutoff.setDate(cutoff.getDate() - 30);
    return studySessions.filter((session) => startOfDay(session.date).getTime() >= cutoff.getTime());
  }, [studySessions, now]);

  const totalMinutes = useMemo(
    () => last30Days.reduce((sum, session) => sum + parseDurationToMinutes(session.duration), 0),
    [last30Days]
  );

  const totalStudyDays = useMemo(() => groupDaysBetween(last30Days).size, [last30Days]);

  const dailyAverageMinutes = useMemo(() => {
    if (totalStudyDays === 0) return 0;
    return Math.round(totalMinutes / totalStudyDays);
  }, [totalMinutes, totalStudyDays]);

  const currentStreak = useMemo(() => getCurrentStreak(last30Days, now), [last30Days, now]);

  const busiestDay = useMemo(() => {
    const grouped = Array.from(groupDaysBetween(last30Days).entries()).map(([iso, minutes]) => ({
      date: new Date(iso),
      minutes,
    }));

    grouped.sort((a, b) => b.minutes - a.minutes);
    return grouped[0] ?? null;
  }, [last30Days]);

  const studySubjectRows = useMemo<StudySubjectRow[]>(() => {
    const map = new Map<string, { minutes: number; sessions: number }>();

    last30Days.forEach((session) => {
      const current = map.get(session.subjectId) ?? { minutes: 0, sessions: 0 };
      map.set(session.subjectId, {
        minutes: current.minutes + parseDurationToMinutes(session.duration),
        sessions: current.sessions + 1,
      });
    });

    return Array.from(map.entries())
      .map(([subjectId, value]) => ({
        subjectId,
        subject: subjectById.get(subjectId),
        minutes: value.minutes,
        sessions: value.sessions,
      }))
      .filter((row) => row.minutes > 0)
      .sort((a, b) => b.minutes - a.minutes);
  }, [last30Days, subjectById]);

  const topStudySubject = studySubjectRows[0] ?? null;

  const minutesByAssessment = useMemo(() => {
    const map = new Map<string, number>();

    studySessions.forEach((session) => {
      if (!session.linkedTaskId) return;

      const task = taskById.get(session.linkedTaskId);
      if (!task) return;
      if (!(task.type === "exam" || task.type === "assignment")) return;

      map.set(task.id, (map.get(task.id) ?? 0) + parseDurationToMinutes(session.duration));
    });

    return map;
  }, [studySessions, taskById]);

  const mostStudiedAssessment = useMemo(() => {
    const entries = Array.from(minutesByAssessment.entries()).sort((a, b) => b[1] - a[1]);
    if (!entries.length) return null;

    const [taskId, minutes] = entries[0];
    const task = taskById.get(taskId);
    if (!task) return null;

    return { task, minutes };
  }, [minutesByAssessment, taskById]);

  const upcomingAssessments = useMemo(() => {
    return tasks
      .filter((task) => (task.type === "exam" || task.type === "assignment") && Boolean(task.subjectId))
      .filter((task) => task.dueDate.getTime() >= now.getTime())
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 5);
  }, [tasks, now]);

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
    <div className="app-card p-5">
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
    <div className="app-card overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border bg-muted/10 px-5 py-4">
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

      <div className="p-5">{children}</div>
    </div>
  );

  const EmptyState = ({ title, hint }: { title: string; hint: string }) => (
    <div className="rounded-xl border border-border bg-background/60 px-4 py-10 text-center">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight text-foreground">Study insights</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Analytics for the last 30 days of study sessions.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total study"
          value={formatMinutes(totalMinutes)}
          hint={`${last30Days.length} session${last30Days.length === 1 ? "" : "s"} logged`}
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          title="Daily average"
          value={formatMinutes(dailyAverageMinutes)}
          hint={totalStudyDays > 0 ? `Across ${totalStudyDays} study day${totalStudyDays === 1 ? "" : "s"}` : "No sessions yet"}
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
          title="Subject breakdown"
          subtitle="Where your study time is going"
          icon={<Sparkles className="h-4 w-4 text-muted-foreground" />}
        >
          {studySubjectRows.length ? (
            <div className="space-y-3">
              {studySubjectRows.slice(0, 8).map((row) => {
                const max = studySubjectRows[0]?.minutes || 1;
                const width = Math.max(8, Math.round((row.minutes / max) * 100));

                return (
                  <div key={row.subjectId} className="space-y-1.5">
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="inline-flex min-w-0 items-center gap-2 text-muted-foreground">
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
                  {busiestDay
                    ? busiestDay.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "short",
                        day: "numeric",
                      })
                    : "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {busiestDay ? `${formatMinutes(busiestDay.minutes)} logged` : "No study logged yet."}
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Most-studied assessment</div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {mostStudiedAssessment?.task.title ?? "—"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {mostStudiedAssessment
                    ? `${formatMinutes(mostStudiedAssessment.minutes)} linked study time`
                    : "Link sessions to assessments to see this."}
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Upcoming assessments" subtitle="Next deadlines">
            {upcomingAssessments.length ? (
              <div className="space-y-2">
                {upcomingAssessments.map((task) => {
                  const subject = task.subjectId ? subjectById.get(task.subjectId) : undefined;

                  return (
                    <div
                      key={task.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-foreground">{task.title}</div>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                          <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: subject?.color ?? "#94A3B8" }}
                          />
                          <span>{subject?.name ?? "Unassigned"}</span>
                        </div>
                      </div>

                      <div className="shrink-0 text-xs font-medium text-muted-foreground">
                        {task.dueDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState title="No upcoming assessments" hint="Assignments and exams will appear here." />
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}