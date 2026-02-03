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
import LoadingScreen from "@/components/LoadingScreen";

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

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

type SettingsOpenSection = "subjects" | "terms" | "backup" | null;

/* -------------------- Defaults / Demo -------------------- */

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
];

const DEMO_PERIODS: Period[] = [
  { id: "p1", name: "Term 1", startDate: new Date(2026, 0, 29), endDate: new Date(2026, 3, 11) },
  { id: "p2", name: "Term 2", startDate: new Date(2026, 3, 29), endDate: new Date(2026, 6, 5) },
];

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
    { id: "t1", title: "Read pages 120–145", subjectId: "5", dueDate: tomorrow, type: "task", periodId: "p1" },
    { id: "t2", title: "Lab Report", subjectId: "3", dueDate: in3, type: "assignment", periodId: "p1" },
    {
      id: "t3",
      title: "Complete Chapter 5 Review",
      subjectId: "1",
      dueDate: in5,
      type: "assignment",
      periodId: "p1",
      result: { score: 18, outOf: 20, dateRecorded: today },
    },
    { id: "t4", title: "Midterm Exam", subjectId: "2", dueDate: in7, type: "exam", periodId: "p1" },
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
    { id: "r2", title: "Email teacher about extension question", dueDate: tomorrow, repeat: "none", completed: false, createdAt: today },
    { id: "r3", title: "Buy new pens", notes: "Black + blue", repeat: "none", completed: false, createdAt: today },
  ];

  return {
    subjects: defaultSubjects,
    periods: DEMO_PERIODS,
    tasks: demoTasks,
    studySessions: demoStudySessions,
    reminders: demoReminders,
  };
};

const seedDemoPeriodsKeyIfMissing = (periods: Period[]) => {
  try {
    const existing = localStorage.getItem(PERIODS_STORAGE_KEY);
    if (existing) return;

    const stored = periods.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
    }));

    localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

const navTabButtonClass = (active: boolean) =>
  [
    "h-9 px-3 rounded-xl text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/90 hover:bg-muted",
  ].join(" ");

const navTabButtonClassMobile = (active: boolean) =>
  [
    "shrink-0 h-9 px-3 rounded-xl text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    active ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground/90 hover:bg-muted",
  ].join(" ");

function App({ mode = "app" }: { mode?: AppMode }) {
  const hydrated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(mode === "demo" ? defaultSubjects : []);
  const [periods, setPeriods] = useState<Period[]>(mode === "demo" ? DEMO_PERIODS : []);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const storageKey = mode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  // ✅ tell Settings which section to open (from Dashboard banners)
  const [settingsOpenSection, setSettingsOpenSection] = useState<SettingsOpenSection>(null);

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

  const periodIdForDate = (d: Date) => {
    const t = d.getTime();
    const match = periods.find((p) => t >= p.startDate.getTime() && t <= p.endDate.getTime());
    return match?.id;
  };

  /* -------------------- Persistence -------------------- */

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);

    if (!raw && mode === "demo") {
      const seeded = makeDefaultData();
      seedDemoPeriodsKeyIfMissing(seeded.periods);

      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);

      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    // ✅ For brand new app users: clear any leftover demo/shared "periods" key too
    if (!raw && mode === "app") {
      try {
        localStorage.removeItem(PERIODS_STORAGE_KEY);
      } catch {}

      setSubjects([]);
      setPeriods([]);
      setTasks([]);
      setStudySessions([]);
      setReminders([]);

      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    try {
      const parsed = JSON.parse(raw as string);

      setSubjects(Array.isArray(parsed.subjects) ? parsed.subjects : []);

      setPeriods(
        Array.isArray(parsed.periods)
          ? parsed.periods.map((p: any) => ({
              id: String(p.id),
              name: String(p.name),
              startDate: p?.startDate ? new Date(p.startDate) : new Date(),
              endDate: p?.endDate ? new Date(p.endDate) : new Date(),
            }))
          : mode === "demo"
          ? DEMO_PERIODS
          : []
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
                  score: typeof t?.result?.score === "number" ? t.result.score : Number(t?.result?.score ?? 0),
                  outOf: typeof t?.result?.outOf === "number" ? t.result.outOf : Number(t?.result?.outOf ?? 100),
                  dateRecorded: t?.result?.dateRecorded ? new Date(t.result.dateRecorded) : new Date(),
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
        seedDemoPeriodsKeyIfMissing(seeded.periods);

        setSubjects(seeded.subjects);
        setPeriods(seeded.periods);
        setTasks(seeded.tasks);
        setStudySessions(seeded.studySessions);
        setReminders(seeded.reminders);
      } else {
        // ✅ If app storage is corrupted, also clear periods key so the user starts clean
        try {
          localStorage.removeItem(PERIODS_STORAGE_KEY);
        } catch {}

        setSubjects([]);
        setPeriods([]);
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

    try {
      localStorage.setItem(storageKey, JSON.stringify({ subjects, periods, tasks, studySessions, reminders }));
    } catch {}
  }, [subjects, periods, tasks, studySessions, reminders, storageKey]);

  /* -------------------- Clear / Reset -------------------- */

  const handleClearAllData = () => {
    localStorage.removeItem(storageKey);

    if (mode === "demo") {
      const seeded = makeDefaultData();
      seedDemoPeriodsKeyIfMissing(seeded.periods);

      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);
    } else {
      setSubjects([]);
      setPeriods([]);
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
    setSubjects((p) => p.map((s) => (s.id === id ? { ...s, name, color } : s)));

  const handleDeleteSubject = (id: string) => {
    setSubjects((p) => p.filter((s) => s.id !== id));
    setTasks((p) => p.filter((t) => t.subjectId !== id));
    setStudySessions((p) => p.filter((s) => s.subjectId !== id));
  };

  const handleAddTask = (t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) => [...p, { ...t, periodId: inferredPeriodId ?? t.periodId, id: Date.now().toString() }]);
  };

  const handleUpdateTask = (id: string, t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) => p.map((x) => (x.id === id ? { ...t, periodId: inferredPeriodId ?? t.periodId, id } : x)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setStudySessions((p) => p.map((s) => (s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s)));
  };

  const toggleTaskCompleted = (id: string) =>
    setTasks((p) => p.map((t) => (t.id === id ? { ...t, completed: !t.completed, completedAt: new Date() } : t)));

  const handleAddStudySession = (s: Omit<StudySession, "id">) =>
    setStudySessions((p) => [...p, { ...s, id: Date.now().toString(), completed: false }]);

  const handleUpdateStudySession = (id: string, s: Omit<StudySession, "id">) =>
    setStudySessions((p) => p.map((x) => (x.id === id ? { ...s, id } : x)));

  const handleDeleteStudySession = (id: string) => setStudySessions((p) => p.filter((s) => s.id !== id));

  const handleToggleSessionCompleted = (id: string) =>
    setStudySessions((p) =>
      p.map((s) => (s.id === id ? { ...s, completed: !s.completed, completedAt: new Date() } : s))
    );

  const handleAddReminder = (r: Omit<Reminder, "id">) =>
    setReminders((p) => [
      ...p,
      { ...r, id: Date.now().toString(), createdAt: r.createdAt ?? new Date(), completed: r.completed ?? false },
    ]);

  const handleUpdateReminder = (id: string, r: Omit<Reminder, "id">) =>
    setReminders((p) => p.map((x) => (x.id === id ? { ...r, id } : x)));

  const handleDeleteReminder = (id: string) => setReminders((p) => p.filter((r) => r.id !== id));

  const handleToggleReminderCompleted = (id: string) =>
    setReminders((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        const nextCompleted = !r.completed;
        return { ...r, completed: nextCompleted, completedAt: nextCompleted ? new Date() : undefined };
      })
    );

  /* -------------------- Render -------------------- */

  const tabs: Array<[Tab, string]> = [
    ["dashboard", "Dashboard"],
    ["calendar", "Calendar"],
    ["tasks", "Tasks"],
    ["study", "Study Log"],
    ["insights", "Insights"],
    ["marks", "Marks"],
    ["reminders", "Reminders"],
  ];

  if (!isReady) return <LoadingScreen label="Opening your planner…" />;

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto max-w-7xl px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6 min-w-0">
            <div className="flex flex-col leading-tight min-w-0">
              <span className="font-semibold text-foreground truncate">MyStudyPlanner</span>
              <span className="text-[11px] text-muted-foreground truncate">Made by students, for students</span>
            </div>

            <div className="hidden md:flex gap-1">
              {tabs.map(([k, l]) => (
                <button key={k} onClick={() => setActiveTab(k)} className={navTabButtonClass(activeTab === k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <ThemeToggle />

            <button onClick={() => setActiveTab("settings")} className={navTabButtonClass(activeTab === "settings")}>
              Settings
            </button>

            <div className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 hover:bg-muted/40 transition-colors">
              <span className="hidden sm:inline text-sm text-muted-foreground">Account</span>

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
                    userButtonPopoverCard: "border border-border shadow-lg bg-card",
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

        <div className="md:hidden border-t border-border">
          <div className="mx-auto max-w-7xl px-3 py-2">
            <div className="flex gap-1 overflow-x-auto no-scrollbar">
              {tabs.map(([k, l]) => (
                <button key={k} onClick={() => setActiveTab(k)} className={navTabButtonClassMobile(activeTab === k)}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

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
            onOpenTasks={() => setActiveTab("tasks")}
            onOpenSettings={(section) => {
              setActiveTab("settings");
              setSettingsOpenSection(section ?? null);
            }}
          />
        )}

        {activeTab === "calendar" && (
  <Calendar
    studySessions={studySessions}
    tasks={tasks}
    reminders={reminders}
    subjects={subjects}
    onAddTask={handleAddTask}
    onUpdateTask={handleUpdateTask}
    onDeleteTask={handleDeleteTask}
    onToggleTaskCompleted={toggleTaskCompleted}
    onAddStudySession={handleAddStudySession}
    onUpdateStudySession={handleUpdateStudySession}
    onDeleteStudySession={handleDeleteStudySession}
    onAddReminder={handleAddReminder}
    onUpdateReminder={handleUpdateReminder}
    onDeleteReminder={handleDeleteReminder}
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

        {activeTab === "insights" && <Insights tasks={tasks} studySessions={studySessions} subjects={subjects} />}

        {activeTab === "marks" && <Marks tasks={tasks} subjects={subjects} onUpdateTask={handleUpdateTask} />}

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
            openSection={settingsOpenSection}
            onOpenSectionHandled={() => setSettingsOpenSection(null)}
          />
        )}
      </main>
    </div>
  );
}

export default App;
