"use client";

import React, { useEffect, useRef, useState } from "react";

import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { Insights } from "./insights";

import type { Subject, Task, StudySession } from "./models";

const STORAGE_KEY = "mystudylife-data";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000; // 24 hours

type Tab = "dashboard" | "calendar" | "tasks" | "study" | "insights" | "settings";

/* -------------------- Defaults -------------------- */

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

  return { demoTasks, demoStudySessions };
};

function App() {
  const hydrated = useRef(false);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);

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
    const raw = localStorage.getItem(STORAGE_KEY);

    // first run = seed demo data
    if (!raw) {
      const { demoTasks, demoStudySessions } = makeDefaultData();
      setSubjects(defaultSubjects);
      setTasks(demoTasks);
      setStudySessions(demoStudySessions);
      hydrated.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      const loadedSubjects: Subject[] = Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects;

      const loadedTasks: Task[] = (parsed.tasks ?? []).map((t: any) => ({
        ...t,
        dueDate: t?.dueDate ? new Date(t.dueDate) : new Date(),
        completedAt: t?.completedAt ? new Date(t.completedAt) : undefined,
      }));

      const loadedStudySessions: StudySession[] = (parsed.studySessions ?? []).map((s: any) => ({
        ...s,
        title: typeof s?.title === "string" && s.title.trim() ? s.title : "Study session",
        date: s?.date ? new Date(s.date) : new Date(),
        completedAt: s?.completedAt ? new Date(s.completedAt) : undefined,
      }));

      setSubjects(loadedSubjects);
      setTasks(pruneAutoDeletedCompletedTasks(loadedTasks));
      setStudySessions(loadedStudySessions);
    } catch (err) {
      console.error("Failed to load saved data", err);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;

    const pruned = pruneAutoDeletedCompletedTasks(tasks);
    if (pruned.length !== tasks.length) {
      setTasks(pruned);
      return; // next effect run will save
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        subjects,
        tasks,
        studySessions,
      })
    );
  }, [subjects, tasks, studySessions]);

  /* -------------------- Subjects (Settings) -------------------- */

  const handleAddSubject = (name: string, color: string) => {
    const newSubject: Subject = { id: Date.now().toString(), name, color };
    setSubjects((prev) => [...prev, newSubject]);
  };

  const handleUpdateSubject = (id: string, name: string, color: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name, color } : s)));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTasks((prev) => prev.filter((t) => t.subjectId !== id));
    setStudySessions((prev) => prev.filter((s) => s.subjectId !== id));
  };

  /* -------------------- Tasks -------------------- */

  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = { ...newTask, id: Date.now().toString() };
    setTasks((prev) => [...prev, task]);
  };

  const handleUpdateTask = (id: string, updatedTask: Omit<Task, "id">) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...updatedTask, id } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
    // unlink from sessions
    setStudySessions((prev) => prev.map((s) => (s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s)));
  };

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );
  };

  /* -------------------- Study Sessions -------------------- */

  const handleAddStudySession = (newSession: Omit<StudySession, "id">) => {
    const session: StudySession = {
      ...newSession,
      id: Date.now().toString(),
      title: newSession.title?.trim() ? newSession.title.trim() : "Study session",
      completed: false,
    };
    setStudySessions((prev) => [...prev, session]);
  };

  const handleUpdateStudySession = (id: string, updated: Omit<StudySession, "id">) => {
    setStudySessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...updated,
              id,
              title: updated.title?.trim() ? updated.title.trim() : "Study session",
            }
          : s
      )
    );
  };

  const handleDeleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleToggleSessionCompleted = (id: string) => {
    setStudySessions((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const nextCompleted = !s.completed;
        return {
          ...s,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );
  };

  /* -------------------- Render -------------------- */

  return (
    <div className="min-h-screen bg-background">
      {/* NAV */}
      <nav className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <span className="font-bold text-foreground">MyStudentPlanner</span>

            <div className="flex gap-1">
              {[
                ["dashboard", "Dashboard"],
                ["calendar", "Calendar"],
                ["tasks", "Tasks"],
                ["study", "Study Planner"],
                ["insights", "Insights"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as Tab)}
                  className={`px-4 py-2 rounded-lg transition ${
                    activeTab === key ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 rounded-lg transition ${
              activeTab === "settings" ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted"
            }`}
          >
            Settings
          </button>
        </div>
      </nav>

      {/* CONTENT */}
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

        {activeTab === "insights" && <Insights tasks={tasks} studySessions={studySessions} subjects={subjects} />}

        {activeTab === "settings" && (
          <Settings
            subjects={subjects}
            tasks={tasks}
            studyItems={[]}
            studySessions={studySessions}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}
      </main>
    </div>
  );
}

export default App;
