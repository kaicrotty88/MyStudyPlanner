"use client";

import React, { useEffect, useRef, useState } from "react";

import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { Insights } from "./insights";

import type { Subject, Task, StudySession } from "./models";

import { UserButton } from "@clerk/nextjs";
import { Settings as SettingsIcon } from "lucide-react";

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

type Tab = "dashboard" | "calendar" | "tasks" | "study" | "insights" | "settings";
type AppMode = "demo" | "app";

/* -------------------- Defaults / Demo -------------------- */

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
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
    { id: "t1", title: "Read pages 120–145", subjectId: "5", dueDate: tomorrow, type: "task" },
    { id: "t2", title: "Lab Report", subjectId: "3", dueDate: in3, type: "assignment" },
    { id: "t3", title: "Complete Chapter 5 Review", subjectId: "1", dueDate: in5, type: "assignment" },
    { id: "t4", title: "Midterm Exam", subjectId: "2", dueDate: in7, type: "exam" },
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

  return { subjects: defaultSubjects, tasks: demoTasks, studySessions: demoStudySessions };
};

function App({ mode = "app" }: { mode?: AppMode }) {
  const hydrated = useRef(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

  const storageKey = mode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  /* -------------------- Helpers -------------------- */

  const pruneAutoDeletedCompletedTasks = (input: Task[]) => {
    const now = Date.now();
    return input.filter((t) => {
      if (!t.completed || !t.completedAt) return true;
      return now - t.completedAt.getTime() < AUTO_DELETE_COMPLETED_AFTER_MS;
    });
  };

  /* -------------------- Persistence -------------------- */

  useEffect(() => {
    const raw = localStorage.getItem(storageKey);

    if (!raw && mode === "demo") {
      const seeded = makeDefaultData();
      setSubjects(seeded.subjects);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      hydrated.current = true;
      return;
    }

    if (!raw && mode === "app") {
      setSubjects(defaultSubjects);
      setTasks([]);
      setStudySessions([]);
      hydrated.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw as string);

      setSubjects(Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects);

      setTasks(
        pruneAutoDeletedCompletedTasks(
          (parsed.tasks ?? []).map((t: any) => ({
            ...t,
            dueDate: t?.dueDate ? new Date(t.dueDate) : new Date(),
            completedAt: t?.completedAt ? new Date(t.completedAt) : undefined,
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
    } catch {
      if (mode === "demo") {
        const seeded = makeDefaultData();
        setSubjects(seeded.subjects);
        setTasks(seeded.tasks);
        setStudySessions(seeded.studySessions);
      } else {
        setSubjects(defaultSubjects);
        setTasks([]);
        setStudySessions([]);
      }
    } finally {
      hydrated.current = true;
    }
  }, [mode, storageKey]);

  useEffect(() => {
    if (!hydrated.current) return;

    localStorage.setItem(storageKey, JSON.stringify({ subjects, tasks, studySessions }));
  }, [subjects, tasks, studySessions, storageKey]);

  /* -------------------- Clear / Reset -------------------- */

  const handleClearAllData = () => {
    localStorage.removeItem(storageKey);

    if (mode === "demo") {
      const seeded = makeDefaultData();
      setSubjects(seeded.subjects);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
    } else {
      setSubjects(defaultSubjects);
      setTasks([]);
      setStudySessions([]);
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

  const handleAddTask = (t: Omit<Task, "id">) =>
    setTasks((p) => [...p, { ...t, id: Date.now().toString() }]);

  const handleUpdateTask = (id: string, t: Omit<Task, "id">) =>
    setTasks((p) => p.map((x) => (x.id === id ? { ...t, id } : x)));

  const handleDeleteTask = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setStudySessions((p) =>
      p.map((s) => (s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s))
    );
  };

  const toggleTaskCompleted = (id: string) =>
    setTasks((p) =>
      p.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: new Date() } : t
      )
    );

  const handleAddStudySession = (s: Omit<StudySession, "id">) =>
    setStudySessions((p) => [...p, { ...s, id: Date.now().toString(), completed: false }]);

  const handleUpdateStudySession = (id: string, s: Omit<StudySession, "id">) =>
    setStudySessions((p) => p.map((x) => (x.id === id ? { ...s, id } : x)));

  const handleDeleteStudySession = (id: string) =>
    setStudySessions((p) => p.filter((s) => s.id !== id));

  const handleToggleSessionCompleted = (id: string) =>
    setStudySessions((p) =>
      p.map((s) =>
        s.id === id ? { ...s, completed: !s.completed, completedAt: new Date() } : s
      )
    );

  /* -------------------- Render -------------------- */

  const tabs: Array<[Tab, string]> = [
    ["dashboard", "Dashboard"],
    ["calendar", "Calendar"],
    ["tasks", "Tasks"],
    ["study", "Study Planner"],
    ["insights", "Insights"],
  ];

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="mx-auto max-w-6xl px-6 md:px-10 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-foreground">MyStudyPlanner</span>
              <span className="text-[11px] text-muted-foreground">
                Made by students, for students
              </span>
            </div>

            <div className="hidden md:flex gap-1">
              {tabs.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => setActiveTab(k)}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === k ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-4 py-2 rounded-lg transition ${
                activeTab === "settings" ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              Settings
            </button>

            {/* Profile pill (icon-only) + themed Clerk button */}
            <div className="inline-flex items-center rounded-lg border border-border bg-background/40 px-2 py-1.5 hover:bg-muted/40 transition-colors">
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
                    // ✅ Force avatar placeholder / fallback to be green-toned (instead of Clerk purple)
                    // This affects the circle behind initials & the default avatar background.
                    userButtonAvatarBox:
                      "ring-1 ring-border bg-primary/15 text-primary [&_svg]:text-primary",

                    // ✅ Also theme the popover to match your app
                    userButtonPopoverCard: "border border-border shadow-lg bg-card",
                    userButtonPopoverFooter: "hidden",

                    // ✅ Make menu items feel consistent
                    userButtonPopoverActionButton:
                      "hover:bg-muted focus:bg-muted text-foreground",
                    userButtonPopoverActionButtonText: "text-foreground",
                    userButtonPopoverActionButtonIcon: "text-muted-foreground",
                  },
                }}
              >
                {/* Custom menu: only Settings */}
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Settings"
                    labelIcon={<SettingsIcon className="h-4 w-4" />}
                    onClick={() => setActiveTab("settings")}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </div>
        </div>
      </nav>

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
          <Insights tasks={tasks} studySessions={studySessions} subjects={subjects} />
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

      {/* ✅ Small version badge (non-intrusive) */}
      <div className="fixed bottom-3 right-3 z-20 pointer-events-none">
        <span className="inline-flex items-center rounded-full border border-border bg-card/70 px-2 py-1 text-[11px] text-muted-foreground backdrop-blur">
          v1.0
        </span>
      </div>
    </div>
  );
}

export default App;
