"use client";

import React from "react";
import { BookOpen, Calendar, AlertTriangle } from "lucide-react";

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
  linkedTaskId?: string;
  notes?: string;
  showOnCalendar: boolean;
}

interface DashboardProps {
  tasks: Task[];
  subjects: Subject[];
  studyItems: StudyItem[]; // these are already "todayStudyItems" from App.tsx
}

const MAX_TODAY = 3;
const MAX_WEEK = 5;
const MAX_OVERDUE = 4;

export function Dashboard({ tasks, subjects, studyItems }: DashboardProps) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  const daysBetween = (a: Date, b: Date) => {
    // difference in whole days from a -> b (b - a)
    const ms = startOfDay(b).getTime() - startOfDay(a).getTime();
    return Math.round(ms / (1000 * 60 * 60 * 24));
  };

  const labelForDaysLeft = (daysLeft: number) => {
    if (daysLeft < 0) return "Overdue";
    if (daysLeft === 0) return "Due today";
    if (daysLeft === 1) return "Due tomorrow";
    return `${daysLeft}d`;
  };

  const dueToneClass = (daysLeft: number) => {
    // subtle urgency (text only)
    if (daysLeft < 0) return "text-red-500";
    if (daysLeft <= 1) return "text-amber-500";
    if (daysLeft <= 3) return "text-yellow-500";
    return "text-muted-foreground";
  };

  // Only actionable tasks
  const activeTasks = tasks.filter((t) => !t.completed);

  // Overdue (strictly before today)
  const overdueTasks = activeTasks
    .filter((t) => daysBetween(today, t.dueDate) < 0)
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  // Next 7 days (today..+7), excluding overdue
  const upcomingWeek = activeTasks
    .filter((t) => {
      const d = daysBetween(today, t.dueDate);
      return d >= 0 && d <= 7;
    })
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  const todayCount = studyItems.length;
  const focusLine = `${todayCount} ${todayCount === 1 ? "item" : "items"} today`;

  const TaskRow = ({ task }: { task: Task }) => {
    const subject = getSubjectById(task.subjectId);
    const daysLeft = daysBetween(today, task.dueDate);

    return (
      <div className="flex items-center justify-between gap-3 py-2">
        <div className="min-w-0">
          <div className="text-sm text-foreground font-medium truncate">{task.title}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>
              {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </span>
            {subject && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-white"
                style={{ backgroundColor: subject.color }}
              >
                {subject.name}
              </span>
            )}
          </div>
        </div>

        <div className={`shrink-0 text-xs font-semibold ${dueToneClass(daysLeft)}`}>
          {labelForDaysLeft(daysLeft)}
        </div>
      </div>
    );
  };

  const StudyRow = ({ item }: { item: StudyItem }) => {
    const subject = getSubjectById(item.subjectId);

    return (
      <div className="flex items-start gap-3 py-2">
        <BookOpen className="w-4 h-4 mt-0.5 shrink-0" style={{ color: subject?.color }} />
        <div className="min-w-0">
          <div className="text-sm text-foreground font-medium truncate">{item.topic}</div>
          {subject ? (
            <div className="text-xs mt-1" style={{ color: subject.color }}>
              {subject.name}
            </div>
          ) : (
            <div className="text-xs mt-1 text-muted-foreground">No subject</div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-6 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground font-semibold">{formattedDate}</h1>
        <div className="text-sm text-muted-foreground opacity-80">{focusLine}</div>
      </div>

      {/* Overdue (only if needed) */}
      {overdueTasks.length > 0 && (
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <h2 className="text-foreground font-semibold">Overdue</h2>
            <span className="text-xs text-muted-foreground opacity-80">
              ({overdueTasks.length})
            </span>
          </div>

          <div className="divide-y divide-border">
            {overdueTasks.slice(0, MAX_OVERDUE).map((t) => (
              <div key={t.id}>
                <TaskRow task={t} />
              </div>
            ))}
          </div>

          {overdueTasks.length > MAX_OVERDUE && (
            <div className="pt-3 text-xs text-muted-foreground opacity-80">
              +{overdueTasks.length - MAX_OVERDUE} more overdue
            </div>
          )}
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Today plan */}
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground font-semibold">Today’s plan</h2>
            <span className="text-xs text-muted-foreground opacity-80">
              {studyItems.length}
            </span>
          </div>

          {studyItems.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {studyItems.slice(0, MAX_TODAY).map((item) => (
                  <div key={item.id}>
                    <StudyRow item={item} />
                  </div>
                ))}
              </div>

              {studyItems.length > MAX_TODAY && (
                <div className="pt-3 text-xs text-muted-foreground opacity-80">
                  +{studyItems.length - MAX_TODAY} more planned today
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-sm text-muted-foreground opacity-80">
              Nothing planned yet — add a study item in Study Planner.
            </div>
          )}
        </div>

        {/* Next 7 days */}
        <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-foreground font-semibold">Deadlines (next 7 days)</h2>
            <span className="text-xs text-muted-foreground opacity-80">
              {upcomingWeek.length}
            </span>
          </div>

          {upcomingWeek.length > 0 ? (
            <>
              <div className="divide-y divide-border">
                {upcomingWeek.slice(0, MAX_WEEK).map((t) => (
                  <div key={t.id}>
                    <TaskRow task={t} />
                  </div>
                ))}
              </div>

              {upcomingWeek.length > MAX_WEEK && (
                <div className="pt-3 text-xs text-muted-foreground opacity-80">
                  +{upcomingWeek.length - MAX_WEEK} more this week
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-sm text-muted-foreground opacity-80">
              All clear — no deadlines in the next week.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
