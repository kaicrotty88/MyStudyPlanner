"use client";

import React, { useEffect, useRef, useState } from "react";

import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { Insights } from "./insights";
import { ThemeToggle } from "./ThemeToggle";
import { Marks } from "./marks";
import { Reminders } from "./reminders";

import type { Subject, Task, StudySession, Period, Reminder } from "./models";

import { UserButton } from "@clerk/nextjs";
import { User, X } from "lucide-react";

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

type Tab =
  | "dashboard"
  | "calendar"
  | "tasks"
  | "study"
  | "insights"
  | "marks"
  | "reminders"
  | "settings";
type AppMode = "demo" | "app";

/* -------------------- Defaults / Demo -------------------- */

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
];

// Simple “Term 1–4” defaults (quarterly) for the current year.
// Later you can replace with real school dates via Settings.
function makeDefaultPeriodsForYear(year: number): Period[] {
  const mk = (
    id: string,
    name: string,
    start: [number, number, number],
    end: [number, number, number]
  ) => ({
    id,
    name,
    startDate: new Date(year, start[0], start[1]),
    endDate: new Date(year, end[0], end[1]),
  });

  // Months are 0-indexed: Jan=0, Apr=3, etc.
  return [
    mk("p1", "Term 1", [0, 1, 1], [2, 31, 1]), // Jan 1 – Mar 31
    mk("p2", "Term 2", [3, 1, 1], [5, 30, 1]), // Apr 1 – Jun 30
    mk("p3", "Term 3", [6, 1, 1], [8, 30, 1]), // Jul 1 – Sep 30
    mk("p4", "Term 4", [9, 1, 1], [11, 31, 1]), // Oct 1 – Dec 31
  ];
}

const defaultPeriods: Period[] = makeDefaultPeriodsForYear(
  new Date().getFullYear()
);

const makeDefaultData = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const in3 = new Date(today);
  in3.setDate(today.getDate() + 3);

  const in5 = new Date(today);
  in5.setDate(today.getDate() + 5);

  const in7 = new Date(today);
  in7.setDate(today.getDate() + 7);

  const demoTasks: Task[] = [
    {
      id: "t1",
      title: "Read pages 120–145",
      subjectId: "5",
      dueDate: tomorrow,
      type: "task",
      periodId: "p1",
    },
    {
      id: "t2",
      title: "Lab Report",
      subjectId: "3",
      dueDate: in3,
      type: "assignment",
      periodId: "p1",
    },
    {
      id: "t3",
      title: "Complete Chapter 5 Review",
      subjectId: "1",
      dueDate: in5,
      type: "assignment",
      periodId: "p1",
      result: {
        score: 18,
        outOf: 20,
        dateRecorded: today,
      },
    },
    {
      id: "t4",
      title: "Midterm Exam",
      subjectId: "2",
      dueDate: in7,
      type: "exam",
      periodId: "p1",
    },
  ];

  const demoStudySessions: StudySession[] = [
    {
      id: "ss1",
      subjectId: "1",
      title: "Chapter 5 review",
      date: today,
      startTime: "4:00 PM",
      duration: "60 min",
      linkedTaskId: "t3",
      completed: false,
    },
  ];

  const demoReminders: Reminder[] = [
    {
      id: "r1",
      title: "Pack bag tonight",
      notes: "Laptop charger, workbook, sport kit",
      dueDate: today,
      time: "20:30",
      repeat: "none",
      completed: false,
      createdAt: today,
    },
    {
      id: "r2",
      title: "Email teacher about extension question",
      dueDate: tomorrow,
      repeat: "none",
      completed: false,
      createdAt: today,
    },
    {
      id: "r3",
      title: "Buy new pens",
      notes: "Black + blue",
      // sticky reminder (no date)
      repeat: "none",
      completed: false,
      createdAt: today,
    },
  ];

  return {
    subjects: defaultSubjects,
    periods: makeDefaultPeriodsForYear(today.getFullYear()),
    tasks: demoTasks,
    studySessions: demoStudySessions,
    reminders: demoReminders,
  };
};

/* -------------------- Skeleton -------------------- */

function AppSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-8">
            <div className="flex flex-col gap-2">
              <div className="h-4 w-32 rounded bg-muted/70" />
              <div className="h-3 w-44 rounded bg-muted/50" />
            </div>

            <div className="hidden md:flex gap-2">
              <div className="h-9 w-24 rounded-lg bg-muted/50" />
              <div className="h-9 w-24 rounded-lg bg-muted/50" />
              <div className="h-9 w-24 rounded-lg bg-muted/50" />
              <div className="h-9 w-28 rounded-lg bg-muted/50" />
              <div className="h-9 w-24 rounded-lg bg-muted/50" />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-muted/50" />
            <div className="h-9 w-24 rounded-lg bg-muted/50" />
            <div className="h-9 w-28 rounded-lg bg-muted/50" />
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10">
        <div className="grid gap-6 md:grid-cols-12">
          <div className="md:col-span-8 space-y-4">
            <div className="h-10 w-60 rounded-xl bg-muted/60" />
            <div className="h-28 rounded-2xl border border-border bg-card">
              <div className="p-5 space-y-3">
                <div className="h-4 w-40 rounded bg-muted/60" />
                <div className="h-4 w-72 rounded bg-muted/40" />
                <div className="h-4 w-64 rounded bg-muted/40" />
              </div>
            </div>
            <div className="h-28 rounded-2xl border border-border bg-card">
              <div className="p-5 space-y-3">
                <div className="h-4 w-44 rounded bg-muted/60" />
                <div className="h-4 w-80 rounded bg-muted/40" />
                <div className="h-4 w-56 rounded bg-muted/40" />
              </div>
            </div>
          </div>

          <div className="md:col-span-4 space-y-4">
            <div className="h-10 w-40 rounded-xl bg-muted/60" />
            <div className="h-40 rounded-2xl border border-border bg-card">
              <div className="p-5 space-y-3">
                <div className="h-4 w-32 rounded bg-muted/60" />
                <div className="h-4 w-44 rounded bg-muted/40" />
                <div className="h-4 w-40 rounded bg-muted/40" />
                <div className="h-4 w-36 rounded bg-muted/40" />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function App({ mode = "app" }: { mode?: AppMode }) {
  const hydrated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [periods, setPeriods] = useState<Period[]>(defaultPeriods);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const storageKey = mode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  /* -------------------- Mobile desktop hint -------------------- */

  const [showMobileDesktopHint, setShowMobileDesktopHint] = useState(false);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("msp-desktop-hint-dismissed");
      if (!dismissed) setShowMobileDesktopHint(true);
    } catch {
      setShowMobileDesktopHint(true);
    }
  }, []);

  const dismissMobileDesktopHint = () => {
    setShowMobileDesktopHint(false);
    try {
      localStorage.setItem("msp-desktop-hint-dismissed", "1");
    } catch {}
  };

  /* -------------------- Helpers -------------------- */

  const pruneAutoDeletedCompletedTasks = (input: Task[]) => {
    const now = Date.now();
    return input.filter((t) => {
      if (!t.completed || !t.completedAt) return true;
      return now - t.completedAt.getTime() < AUTO_DELETE_COMPLETED_AFTER_MS;
    });
  };

  const markReadyNextPaint = () => {
    requestAnimationFrame(() => setIsReady(true));
  };

  // Auto-assign a term based on dueDate
  const periodIdForDate = (d: Date) => {
    const t = d.getTime();
    const match = periods.find(
      (p) => t >= p.startDate.getTime() && t <= p.endDate.getTime()
    );
    return match?.id;
  };

  /* -------------------- Persistence -------------------- */

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);

    if (!raw && mode === "demo") {
      const seeded = makeDefaultData();
      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);
      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    if (!raw && mode === "app") {
      setSubjects(defaultSubjects);
      setPeriods(defaultPeriods);
      setTasks([]);
      setStudySessions([]);
      setReminders([]);
      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    try {
      const parsed = JSON.parse(raw as string);

      setSubjects(
        Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects
      );

      // ✅ Hydrate periods (startDate/endDate back into Date objects)
      setPeriods(
        Array.isArray(parsed.periods)
          ? parsed.periods.map((p: any) => ({
              id: String(p.id),
              name: String(p.name),
              startDate: p?.startDate ? new Date(p.startDate) : new Date(),
              endDate: p?.endDate ? new Date(p.endDate) : new Date(),
            }))
          : defaultPeriods
      );

      setTasks(
        pruneAutoDeletedCompletedTasks(
          (parsed.tasks ?? []).map((t: any) => ({
            ...t,
            dueDate: t?.dueDate ? new Date(t.dueDate) : new Date(),
            completedAt: t?.completedAt ? new Date(t.completedAt) : undefined,
            result: t?.result
              ? {
                  ...t.result,
                  score:
                    typeof t?.result?.score === "number"
                      ? t.result.score
                      : Number(t?.result?.score ?? 0),
                  outOf:
                    typeof t?.result?.outOf === "number"
                      ? t.result.outOf
                      : Number(t?.result?.outOf ?? 100),
                  dateRecorded: t?.result?.dateRecorded
                    ? new Date(t.result.dateRecorded)
                    : new Date(),
                }
              : undefined,
          }))
        )
      );

      setStudySessions(
        (parsed.studySessions ?? []).map((s: any) => ({
          ...s,
          title: s?.title?.trim() || "Study session",
          date: s?.date ? new Date(s.date) : new Date(),
          completedAt: s?.completedAt ? new Date(s.completedAt) : undefined,
        }))
      );

      setReminders(
        (parsed.reminders ?? []).map((r: any) => ({
          ...r,
          title: String(r?.title ?? "").trim(),
          notes: r?.notes ? String(r.notes) : undefined,
          dueDate: r?.dueDate ? new Date(r.dueDate) : undefined,
          completedAt: r?.completedAt ? new Date(r.completedAt) : undefined,
          createdAt: r?.createdAt ? new Date(r.createdAt) : undefined,
        }))
      );
    } catch {
      if (mode === "demo") {
        const seeded = makeDefaultData();
        setSubjects(seeded.subjects);
        setPeriods(seeded.periods);
        setTasks(seeded.tasks);
        setStudySessions(seeded.studySessions);
        setReminders(seeded.reminders);
      } else {
        setSubjects(defaultSubjects);
        setPeriods(defaultPeriods);
        setTasks([]);
        setStudySessions([]);
        setReminders([]);
      }
    } finally {
      hydrated.current = true;
      markReadyNextPaint();
    }
  }, [mode, storageKey]);

  useEffect(() => {
    if (!hydrated.current) return;

    // Note: JSON.stringify will store Dates as ISO strings automatically.
    localStorage.setItem(
      storageKey,
      JSON.stringify({ subjects, periods, tasks, studySessions, reminders })
    );
  }, [subjects, periods, tasks, studySessions, reminders, storageKey]);

  /* -------------------- Clear / Reset -------------------- */

  const handleClearAllData = () => {
    localStorage.removeItem(storageKey);

    if (mode === "demo") {
      const seeded = makeDefaultData();
      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);
    } else {
      setSubjects(defaultSubjects);
      setPeriods(defaultPeriods);
      setTasks([]);
      setStudySessions([]);
      setReminders([]);
    }

    setActiveTab("dashboard");
  };

  /* -------------------- Handlers -------------------- */

  const handleAddSubject = (name: string, color: string) =>
    setSubjects((p) => [...p, { id: Date.now().toString(), name, color }]);

  const handleUpdateSubject = (id: string, name: string, color: string) =>
    setSubjects((p) =>
      p.map((s) => (s.id === id ? { ...s, name, color } : s))
    );

  const handleDeleteSubject = (id: string) => {
    setSubjects((p) => p.filter((s) => s.id !== id));
    setTasks((p) => p.filter((t) => t.subjectId !== id));
    setStudySessions((p) => p.filter((s) => s.subjectId !== id));
  };

  const handleAddTask = (t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) => [
      ...p,
      {
        ...t,
        periodId: inferredPeriodId ?? t.periodId,
        id: Date.now().toString(),
      },
    ]);
  };

  const handleUpdateTask = (id: string, t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) =>
      p.map((x) =>
        x.id === id
          ? {
              ...t,
              periodId: inferredPeriodId ?? t.periodId,
              id,
            }
          : x
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setStudySessions((p) =>
      p.map((s) =>
        s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s
      )
    );
  };

  const toggleTaskCompleted = (id: string) =>
    setTasks((p) =>
      p.map((t) =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: new Date() }
          : t
      )
    );

  const handleAddStudySession = (s: Omit<StudySession, "id">) =>
    setStudySessions((p) => [
      ...p,
      { ...s, id: Date.now().toString(), completed: false },
    ]);

  const handleUpdateStudySession = (id: string, s: Omit<StudySession, "id">) =>
    setStudySessions((p) => p.map((x) => (x.id === id ? { ...s, id } : x)));

  const handleDeleteStudySession = (id: string) =>
    setStudySessions((p) => p.filter((s) => s.id !== id));

  const handleToggleSessionCompleted = (id: string) =>
    setStudySessions((p) =>
      p.map((s) =>
        s.id === id
          ? { ...s, completed: !s.completed, completedAt: new Date() }
          : s
      )
    );

  // ✅ Reminders
  const handleAddReminder = (r: Omit<Reminder, "id">) =>
    setReminders((p) => [
      ...p,
      {
        ...r,
        id: Date.now().toString(),
        createdAt: r.createdAt ?? new Date(),
        completed: r.completed ?? false,
      },
    ]);

  const handleUpdateReminder = (id: string, r: Omit<Reminder, "id">) =>
    setReminders((p) => p.map((x) => (x.id === id ? { ...r, id } : x)));

  const handleDeleteReminder = (id: string) =>
    setReminders((p) => p.filter((r) => r.id !== id));

  const handleToggleReminderCompleted = (id: string) =>
    setReminders((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        const nextCompleted = !r.completed;
        return {
          ...r,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );

  /* -------------------- Render -------------------- */

  const tabs: Array<[Tab, string]> = [
    ["dashboard", "Dashboard"],
    ["calendar", "Calendar"],
    ["tasks", "Tasks"],
    ["study", "Study Planner"],
    ["insights", "Insights"],
    ["marks", "Marks"],
    ["reminders", "Reminders"],
  ];

  if (!isReady) return <AppSkeleton />;

  return (
    <div className="min-h-screen bg-background transition-opacity duration-200 ease-out opacity-100">
      <nav className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        {/* Top bar */}
        <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8 min-w-0">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-semibold text-foreground truncate">
                MyStudyPlanner
              </span>
              <span className="text-[11px] text-muted-foreground truncate">
                Made by students, for students
              </span>
            </div>

            {/* Desktop tabs */}
            <div className="hidden md:flex gap-1">
              {tabs.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k)}
                  className={[
                    "h-9 px-3 rounded-xl text-sm font-medium transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    activeTab === k
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/90 hover:bg-muted",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <button
              onClick={() => setActiveTab("settings")}
              className={[
                "h-9 px-3 rounded-xl text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-foreground/90 hover:bg-muted",
              ].join(" ")}
            >
              Settings
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-border bg-background/40 px-3 py-1.5 hover:bg-muted/40 transition-colors">
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Account
              </span>

              <UserButton
                afterSignOutUrl="/sign-in"
                appearance={{
                  variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorText: "hsl(var(--foreground))",
                    colorTextSecondary: "hsl(var(--muted-foreground))",
                    colorBackground: "hsl(var(--card))",
                    colorNeutral: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontFamily: "inherit",
                  },
                  elements: {
                    userButtonAvatarBox: "ring-1 ring-border",
                    userButtonPopoverCard:
                      "border border-border shadow-lg bg-card",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Account"
                    labelIcon={<User className="h-4 w-4" />}
                    onClick={() => setActiveTab("settings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </div>

        {/* ✅ Mobile tabs row (iOS fix) */}
        <div className="md:hidden border-t border-border">
          <div className="mx-auto max-w-7xl px-3 py-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k)}
                  className={[
                    "shrink-0 h-9 px-3 rounded-xl text-sm font-medium transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    activeTab === k
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground/90 hover:bg-muted border border-border bg-card",
                  ].join(" ")}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* ✅ Mobile note: best on desktop (shown once, dismissible) */}
      {showMobileDesktopHint && (
        <div className="md:hidden border-b border-border bg-card/80 backdrop-blur">
          <div className="mx-auto max-w-7xl px-4 py-2 flex items-start justify-between gap-3">
            <div className="text-[12px] leading-5 text-muted-foreground">
              Best on desktop. Mobile is great for quick check-ins.
            </div>

            <button
              onClick={dismissMobileDesktopHint}
              className="shrink-0 rounded-lg p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main>
        {activeTab === "dashboard" && (
          <Dashboard
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onOpenStudyPlanner={() => setActiveTab("study")}
          />
        )}

        {activeTab === "calendar" && (
          <Calendar
            studySessions={studySessions}
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
          />
        )}

        {activeTab === "tasks" && (
          <Tasks
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompleted={toggleTaskCompleted}
          />
        )}

        {activeTab === "study" && (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
            onToggleSessionCompleted={handleToggleSessionCompleted}
          />
        )}

        {activeTab === "insights" && (
          <Insights
            tasks={tasks}
            studySessions={studySessions}
            subjects={subjects}
          />
        )}

        {activeTab === "marks" && (
          <Marks
            tasks={tasks}
            subjects={subjects}
            onUpdateTask={handleUpdateTask}
          />
        )}

        {activeTab === "reminders" && (
          <Reminders
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleCompleted={handleToggleReminderCompleted}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            appMode={mode}
            subjects={subjects}
            tasks={tasks}
            studyItems={[]}
            studySessions={studySessions}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onClearAllData={handleClearAllData}
          />
        )}
      </main>
    </div>
  );
}

export default App;
