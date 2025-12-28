"use client";

import React, { useMemo, useState } from "react";

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: Date;
  type: "task" | "assignment" | "exam" | "homework";
  completed?: boolean;
  completedAt?: Date;
}

interface StudySession {
  id: string;
  subjectId: string;
  date: Date;
  startTime: string;
  duration: string; // e.g. "60 min", "1h 30m", "1:30"
  linkedTaskId?: string;
  completed?: boolean;
  completedAt?: Date;
}

interface InsightsProps {
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
}

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
      if (!(t.type === "exam" || t.type === "assignment")) return; // exclude homework/tasks
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

  return (
    <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground font-semibold">Insights</h1>
          <p className="text-sm text-muted-foreground opacity-80">
            A quick view of your study + upcoming assessments
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setRange(7)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              range === 7 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            7 days
          </button>
          <button
            onClick={() => setRange(30)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              range === 30 ? "bg-primary text-primary-foreground" : "bg-muted text-foreground hover:bg-muted/80"
            }`}
          >
            30 days
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="text-xs text-muted-foreground opacity-80">Total study (last {range} days)</div>
          <div className="text-2xl text-foreground font-semibold mt-1">{formatMinutes(totalMinutes)}</div>
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="text-xs text-muted-foreground opacity-80">Top subject (last {range} days)</div>
          {topSubject?.subject ? (
            <div className="flex items-center gap-2 mt-2">
              <span
                className="inline-block px-2 py-0.5 rounded-full text-white text-xs"
                style={{ backgroundColor: topSubject.subject.color }}
              >
                {topSubject.subject.name}
              </span>
              <div className="text-sm text-foreground font-medium">{formatMinutes(topSubject.minutes)}</div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-2 opacity-80">No sessions yet</div>
          )}
        </div>

        <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
          <div className="text-xs text-muted-foreground opacity-80">Most studied assessment</div>
          {mostStudiedAssessment?.task ? (
            <div className="mt-2 space-y-1">
              <div className="text-sm text-foreground font-medium truncate">
                {mostStudiedAssessment.task.title}
              </div>
              <div className="text-xs text-muted-foreground opacity-80">
                {mostStudiedAssessment.task.type.toUpperCase()} • {formatMinutes(mostStudiedAssessment.minutes)}
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground mt-2 opacity-80">No linked study yet</div>
          )}
        </div>
      </div>

      {/* Upcoming assessments */}
      <div className="bg-card rounded-lg p-5 shadow-sm border border-border">
        <div className="flex items-center justify-between">
          <div className="text-foreground font-semibold">Upcoming assessments</div>
          <div className="text-xs text-muted-foreground opacity-80">Next 5</div>
        </div>

        <div className="mt-4 space-y-2">
          {upcomingAssessments.length ? (
            upcomingAssessments.map((t) => {
              const subj = subjectById[t.subjectId];
              return (
                <div key={t.id} className="flex items-center justify-between gap-3 p-3 rounded-lg border border-border">
                  <div className="min-w-0">
                    <div className="text-sm text-foreground font-medium truncate">{t.title}</div>
                    <div className="text-xs text-muted-foreground opacity-80">
                      {t.type.toUpperCase()} • {t.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  </div>
                  {subj && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0"
                      style={{ backgroundColor: subj.color }}
                    >
                      {subj.name}
                    </span>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground opacity-80">No upcoming exams/assignments</div>
          )}
        </div>
      </div>
    </div>
  );
}
