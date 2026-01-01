"use client";

import React, { useMemo } from "react";
import { ArrowUpRight, Calendar } from "lucide-react";

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
}

interface StudyItem {
  id: string;
  subjectId: string;
  topic: string;
  date: Date;
  notes?: string;
}

interface DashboardProps {
  tasks: Task[];
  subjects: Subject[];
  studyItems: StudyItem[];
}

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

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

export function Dashboard({ tasks, subjects, studyItems }: DashboardProps) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const focusToday = useMemo(
    () => studyItems.filter((i) => isSameDay(i.date, today)).slice(0, 4),
    [studyItems, today]
  );

  const upNext = useMemo(
    () =>
      tasks
        .filter((t) => !t.completed)
        .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
        .slice(0, 6),
    [tasks]
  );

  const dueSoonCount = useMemo(
    () =>
      tasks.filter((t) => {
        if (t.completed) return false;
        const d = daysUntil(t.dueDate, today);
        return d >= 0 && d <= 7;
      }).length,
    [tasks, today]
  );

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {formattedDate}
          </h1>
          <p className="text-sm text-muted-foreground">
            Keep it simple. Do the next right thing.
          </p>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap gap-2">
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Focus today{" "}
            <span className="ml-1 text-foreground font-medium">
              {focusToday.length}
            </span>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Due in 7 days{" "}
            <span className="ml-1 text-foreground font-medium">
              {dueSoonCount}
            </span>
          </div>
        </div>
      </div>

      {/* Main grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        {/* Focus today */}
        <section className="md:col-span-7 rounded-2xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Focus today
              </h2>
              <p className="text-xs text-muted-foreground">
                Top study items
              </p>
            </div>

            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              title="Jump to Study Planner (optional)"
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
                  Add a study session in Study Planner or Calendar.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {focusToday.map((item) => {
                  const subject = subjectById.get(item.subjectId);
                  const dot = subject?.color ?? "#94a3b8";

                  return (
                    <div
                      key={item.id}
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
                                {item.topic}
                              </div>
                              <div className="mt-1 text-xs text-muted-foreground truncate">
                                {subject?.name ?? "Unassigned"}
                              </div>
                            </div>

                            <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                          </div>

                          {item.notes ? (
                            <div className="mt-2 text-xs text-muted-foreground line-clamp-2">
                              {item.notes}
                            </div>
                          ) : null}
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
            <h2 className="text-sm font-semibold text-foreground">
              Up next
            </h2>
            <p className="text-xs text-muted-foreground">
              Upcoming deadlines
            </p>
          </div>

          <div className="p-4">
            {upNext.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-background/40 px-4 py-10 text-center">
                <div className="text-sm font-medium text-foreground">
                  All clear
                </div>
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
                      style={{
                        borderLeftWidth: 3,
                        borderLeftColor: dot,
                      }}
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
                              isLate
                                ? "text-destructive"
                                : "text-foreground",
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
  );
}