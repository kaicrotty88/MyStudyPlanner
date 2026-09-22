"use client";

import React, { useEffect, useMemo, useState } from "react";

import type {
  Subject,
  StudySession,
  Task,
  TimetableClass,
  TimetablePeriod,
  TimetableSettings,
  ImportedCalendarEvent,
} from "./models";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "A year from now you may wish you had started today.", author: "Karen Lamb" },
  { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { text: "It always seems impossible until it is done.", author: "Nelson Mandela" },
  { text: "Well done is better than well said.", author: "Benjamin Franklin" },
  { text: "Great things are done by a series of small things brought together.", author: "Vincent van Gogh" },
  { text: "The beginning is the most important part of the work.", author: "Plato" },
  { text: "What you do every day matters more than what you do once in a while.", author: "Gretchen Rubin" },
  { text: "Do what you can, with what you have, where you are.", author: "Theodore Roosevelt" },
];

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime();

const displayTime = (value?: string) => {
  if (!value) return "";
  const [hh, mm] = value.split(":").map(Number);
  const suffix = hh >= 12 ? "PM" : "AM";
  const hour = hh % 12 || 12;
  return `${hour}:${String(mm || 0).padStart(2, "0")} ${suffix}`;
};

const currentCycleWeek = (settings: TimetableSettings, date: Date): "A" | "B" => {
  if (settings.cycle !== "fortnightly" || !settings.cycleStartDate) return "A";
  const start = startOfDay(settings.cycleStartDate);
  const target = startOfDay(date);
  const diffDays = Math.floor((target.getTime() - start.getTime()) / 86_400_000);
  const weekIndex = Math.floor(diffDays / 7);
  return ((weekIndex % 2) + 2) % 2 === 0 ? "A" : "B";
};

interface TodayProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  timetableSettings: TimetableSettings;
  timetablePeriods: TimetablePeriod[];
  timetableClasses: TimetableClass[];
  importedCalendarEvents: ImportedCalendarEvent[];
  onToggleTaskCompleted: (taskId: string) => void;
  onOpenTask: (taskId: string) => void;
  onPlanStudy: (taskId: string) => void;
}

type DayItem = {
  id: string;
  time: string;
  sort: number;
  title: string;
  subtitle?: string;
  color?: string;
  kind: "class" | "study" | "event" | "task";
  session?: StudySession;
};

export function Today({
  tasks,
  subjects,
  studySessions,
  timetableSettings,
  timetablePeriods,
  timetableClasses,
  importedCalendarEvents,
}: TodayProps) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const subjectById = useMemo(() => new Map(subjects.map((s) => [s.id, s])), [subjects]);
  const taskById = useMemo(() => new Map(tasks.map((task) => [task.id, task])), [tasks]);

  const quote = useMemo(() => {
    const key = Number(`${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`);
    return QUOTES[key % QUOTES.length];
  }, [now]);


  const dayItems = useMemo(() => {
    const result: DayItem[] = [];
    const day = now.getDay();
    const week = currentCycleWeek(timetableSettings, now);
    const periodById = new Map(timetablePeriods.map((p) => [p.id, p]));

    timetableClasses
      .filter((item) => item.dayOfWeek === day && (item.week === "both" || timetableSettings.cycle === "weekly" || item.week === week))
      .forEach((item) => {
        const period = item.periodId ? periodById.get(item.periodId) : undefined;
        const time = item.startTime ?? period?.startTime;
        if (!time) return;
        const [h, m] = time.split(":").map(Number);
        const subject = item.subjectId ? subjectById.get(item.subjectId) : undefined;
        result.push({
          id: `class-${item.id}`,
          time,
          sort: h * 60 + m,
          title: subject?.name ?? item.title,
          subtitle: item.location || item.teacher || "Class",
          color: subject?.color,
          kind: "class",
        });
      });

    studySessions
      .filter((session) => !session.completed && sameDay(session.date, now))
      .forEach((session) => {
        const [h, m] = session.startTime.split(":").map(Number);
        const linkedTask = session.linkedTaskId ? taskById.get(session.linkedTaskId) : undefined;
        const subject = subjectById.get(session.subjectId);
        result.push({
          id: `study-${session.id}`,
          time: session.startTime,
          sort: h * 60 + m,
          title: subject?.name ?? "Study",
          subtitle: linkedTask ? `${linkedTask.title} · ${session.duration}` : `Study · ${session.duration}`,
          color: subject?.color,
          kind: "study",
          session,
        });
      });

    importedCalendarEvents
      .filter((event) => !event.allDay && sameDay(event.start, now))
      .forEach((event) => {
        const h = event.start.getHours();
        const m = event.start.getMinutes();
        result.push({
          id: `event-${event.id}`,
          time: `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
          sort: h * 60 + m,
          title: event.title,
          subtitle: event.location || event.calendarName || "Event",
          color: event.color,
          kind: "event",
        });
      });

    tasks
      .filter((task) => !task.completed && task.scheduledDate && sameDay(task.scheduledDate, now) && task.startTime)
      .forEach((task) => {
        const [h, m] = (task.startTime ?? "00:00").split(":").map(Number);
        const subject = subjectById.get(task.subjectId ?? "");
        result.push({
          id: `task-${task.id}`,
          time: task.startTime ?? "00:00",
          sort: h * 60 + m,
          title: subject?.name ?? task.title,
          subtitle: task.title,
          color: subject?.color,
          kind: "task",
        });
      });

    return result.sort((a, b) => a.sort - b.sort);
  }, [now, timetableSettings, timetablePeriods, timetableClasses, studySessions, importedCalendarEvents, tasks, subjectById, taskById]);

  const allDayItems = useMemo(() => {
    const due = tasks
      .filter((task) => !task.completed && sameDay(task.dueDate, now))
      .map((task) => ({ id: `due-${task.id}`, label: task.title, subject: subjectById.get(task.subjectId ?? "")?.name, kind: task.type }));
    const imported = importedCalendarEvents
      .filter((event) => event.allDay && sameDay(event.start, now))
      .map((event) => ({ id: `all-${event.id}`, label: event.title, subject: event.calendarName, kind: "event" }));
    return [...due, ...imported];
  }, [tasks, importedCalendarEvents, now, subjectById]);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  return (
    <div className="app-page app-scroll-page space-y-8 pb-12">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Today</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
            {now.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })}
          </h1>
        </div>
        <div className="hidden max-w-md text-right sm:block">
          <div className="text-sm italic text-muted-foreground/70">“{quote.text}”</div>
          <div className="mt-1 text-[11px] text-muted-foreground/50">{quote.author}</div>
        </div>
      </div>

      <section className="mx-auto w-full max-w-4xl">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-semibold text-foreground">Today at a glance</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Only what is coming up next. Use Calendar for your full day.</p>
          </div>
        </div>

        {allDayItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 border-b border-border py-3">
            {allDayItems.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-full bg-muted/35 px-3 py-1.5 text-xs text-foreground">
                <span className="font-medium">{item.label}</span>
                {item.subject ? <span className="ml-1 text-muted-foreground">· {item.subject}</span> : null}
              </div>
            ))}
          </div>
        ) : null}

        {dayItems.filter((item) => item.sort >= currentMinutes - 5).length === 0 ? (
          <div className="py-7 text-sm text-muted-foreground">Nothing else scheduled today. Use Study when you are ready to focus.</div>
        ) : (
          <div className="divide-y divide-border">
            {dayItems
              .filter((item) => item.sort >= currentMinutes - 5)
              .slice(0, 4)
              .map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 py-3.5">
                  <div className="w-[72px] shrink-0 text-right text-xs font-medium tabular-nums text-muted-foreground">{displayTime(item.time)}</div>
                  <span className="h-8 w-1 shrink-0 rounded-full border border-border" style={{ backgroundColor: item.color ?? "#94a3b8" }} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <div className="truncate text-sm font-semibold text-foreground">{item.title}</div>
                      {index === 0 ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">Next</span> : null}
                    </div>
                    {item.subtitle ? <div className="mt-0.5 truncate text-xs text-muted-foreground">{item.subtitle}</div> : null}
                  </div>
                </div>
              ))}
          </div>
        )}
      </section>

      <div className="text-center sm:hidden">
        <div className="text-xs italic text-muted-foreground/65">“{quote.text}”</div>
        <div className="mt-1 text-[10px] text-muted-foreground/45">{quote.author}</div>
      </div>

    </div>
  );
}
