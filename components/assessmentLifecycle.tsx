"use client";

import React from "react";
import type { StudySession, Task } from "./models";

export type AssessmentLifecycleState =
  | "upcoming"
  | "preparing"
  | "due-soon"
  | "awaiting-result"
  | "completed";

export type AssessmentPreparationStats = {
  minutes: number;
  sessions: number;
  lastStudiedAt: Date | null;
};

export const isAssessmentTask = (task: Task) =>
  task.type === "assignment" || task.type === "exam";

export const parseStudyDurationMinutes = (duration?: string): number => {
  if (!duration) return 0;
  const value = duration.toLowerCase().trim();
  const colon = value.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  let total = 0;
  const hours = value.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  const minutes = value.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)\b/);
  if (hours) total += Number(hours[1]) * 60;
  if (minutes) total += Number(minutes[1]);
  if (!hours && !minutes) {
    const numeric = Number(value.replace(/[^\d.]/g, ""));
    if (!Number.isNaN(numeric)) total = numeric;
  }
  return Math.max(0, Math.round(total));
};

export const formatPreparationMinutes = (total: number): string => {
  const minutes = Math.max(0, Math.round(total));
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (hours <= 0) return `${remainder}m`;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
};

export const getAssessmentPreparationStats = (
  taskId: string,
  studySessions: StudySession[]
): AssessmentPreparationStats => {
  let minutes = 0;
  let sessions = 0;
  let lastStudiedAt: Date | null = null;

  for (const session of studySessions) {
    if (session.linkedTaskId !== taskId || !session.completed) continue;
    minutes += parseStudyDurationMinutes(session.duration);
    sessions += 1;
    if (!lastStudiedAt || session.date.getTime() > lastStudiedAt.getTime()) {
      lastStudiedAt = session.date;
    }
  }

  return { minutes, sessions, lastStudiedAt };
};

const startOfDay = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getAssessmentLifecycle = (
  task: Task,
  studySessions: StudySession[],
  now = new Date()
): {
  state: AssessmentLifecycleState;
  label: string;
  actionLabel: string;
  daysUntilDue: number;
  stats: AssessmentPreparationStats;
} => {
  const stats = getAssessmentPreparationStats(task.id, studySessions);
  const dayMs = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.round(
    (startOfDay(task.dueDate).getTime() - startOfDay(now).getTime()) / dayMs
  );

  if (task.result) {
    return {
      state: "completed",
      label: "Result recorded",
      actionLabel: "View performance",
      daysUntilDue,
      stats,
    };
  }

  if (daysUntilDue < 0) {
    return {
      state: "awaiting-result",
      label: "Awaiting result",
      actionLabel: "Add result",
      daysUntilDue,
      stats,
    };
  }

  if (daysUntilDue <= 3) {
    return {
      state: "due-soon",
      label: daysUntilDue === 0 ? "Due today" : "Due soon",
      actionLabel: stats.sessions > 0 ? "Plan more prep" : "Plan preparation",
      daysUntilDue,
      stats,
    };
  }

  if (stats.sessions > 0) {
    return {
      state: "preparing",
      label: "Preparing",
      actionLabel: "Plan more prep",
      daysUntilDue,
      stats,
    };
  }

  return {
    state: "upcoming",
    label: "Upcoming",
    actionLabel: "Plan preparation",
    daysUntilDue,
    stats,
  };
};

const toneClass: Record<AssessmentLifecycleState, string> = {
  upcoming: "border-border bg-muted/35 text-muted-foreground",
  preparing: "border-primary/20 bg-primary/10 text-primary",
  "due-soon": "border-orange-500/25 bg-orange-500/10 text-orange-700 dark:text-orange-300",
  "awaiting-result": "border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-300",
  completed: "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
};

export function AssessmentLifecycleBadge({
  state,
  label,
}: {
  state: AssessmentLifecycleState;
  label: string;
}) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold",
        toneClass[state],
      ].join(" ")}
    >
      {label}
    </span>
  );
}

export function AssessmentPreparationLine({
  minutes,
  sessions,
}: {
  minutes: number;
  sessions: number;
}) {
  return (
    <span className="text-xs text-muted-foreground">
      {minutes > 0 ? `${formatPreparationMinutes(minutes)} prepared` : "No preparation yet"}
      {sessions > 0
        ? ` · ${sessions} session${sessions === 1 ? "" : "s"}`
        : ""}
    </span>
  );
}
