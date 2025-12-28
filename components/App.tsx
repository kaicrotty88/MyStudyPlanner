"use client";

const STORAGE_KEY = "mystudylife-data";

import React, { useEffect, useRef, useState } from "react";

const defaultSubjects = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
];

import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { Insights } from "./insights"; // <-- NEW

type Tab = "dashboard" | "calendar" | "tasks" | "study" | "insights" | "settings"; // <-- NEW

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
  duration: string;
  linkedTaskId?: string;
  completed?: boolean;
  completedAt?: Date;
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

function App() {
  const hydrated = useRef(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  // Subjects
  const [subjects, setSubjects] = useState<Subject[]>(defaultSubjects);

  // Sample dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const inThreeDays = new Date(today);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const inFiveDays = new Date(today);
  inFiveDays.setDate(inFiveDays.getDate() + 5);

  // Tasks
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: "1",
      title: "Complete Chapter 5 Review",
      subjectId: "1",
      dueDate: inFiveDays,
      type: "assignment",
    },
    {
      id: "2",
      title: "Read pages 120-145",
      subjectId: "5",
      dueDate: tomorrow,
      type: "task",
    },
    {
      id: "3",
      title: "Midterm Exam",
      subjectId: "2",
      dueDate: nextWeek,
      type: "exam",
    },
    {
      id: "4",
      title: "Lab Report",
      subjectId: "3",
      dueDate: inThreeDays,
      type: "assignment",
    },
  ]);

  // Study Sessions (hours studied)
  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: "1",
      subjectId: "1",
      date: today,
      startTime: "2:00 PM",
      duration: "90 min",
      completed: false,
    },
  ]);

  // Study Items (if you still use these elsewhere, keep them)
  const [studyItems, setStudyItems] = useState<StudyItem[]>([
    {
      id: "1",
      subjectId: "1",
      topic: "Quadratic equations practice",
      date: today,
      linkedTaskId: "1",
      showOnCalendar: false,
    },
    {
      id: "2",
      subjectId: "2",
      topic: "Newton's laws review",
      date: today,
      showOnCalendar: false,
    },
  ]);

  // -------------------------
  // Task handlers
  // -------------------------
  const handleAddTask = (newTask: Omit<Task, "id">) => {
    const task: Task = { ...newTask, id: Date.now().toString() };
    setTasks((prev) => [...prev, task]);
  };

  const handleUpdateTask = (id: string, updatedTask: Omit<Task, "id">) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...updatedTask, id } : t)));
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    // Also unlink/delete study sessions linked to this task (optional but cleaner)
    setStudySessions((prev) =>
      prev.map((s) => (s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s))
    );
  };

  const toggleTaskCompleted = (taskId: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              completed: !task.completed,
              completedAt: !task.completed ? new Date() : undefined,
            }
          : task
      )
    );
  };

  // -------------------------
  // Study session handlers (NEW)
  // -------------------------
  const handleAddStudySession = (newSession: Omit<StudySession, "id">) => {
    const session: StudySession = { ...newSession, id: Date.now().toString() };
    setStudySessions((prev) => [...prev, session]);
  };

  const handleUpdateStudySession = (id: string, updated: Omit<StudySession, "id">) => {
    setStudySessions((prev) => prev.map((s) => (s.id === id ? { ...updated, id } : s)));
  };

  const handleDeleteStudySession = (id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  };

  const toggleStudySessionCompleted = (id: string) => {
    setStudySessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              completed: !s.completed,
              completedAt: !s.completed ? new Date() : undefined,
            }
          : s
      )
    );
  };

  // -------------------------
  // Study item handlers (if still used)
  // -------------------------
  const handleAddStudyItem = (newItem: Omit<StudyItem, "id">) => {
    const item: StudyItem = { ...newItem, id: Date.now().toString() };
    setStudyItems((prev) => [...prev, item]);
  };

  const handleUpdateStudyItem = (id: string, updatedItem: Omit<StudyItem, "id">) => {
    setStudyItems((prev) => prev.map((item) => (item.id === id ? { ...updatedItem, id } : item)));
  };

  const handleRemoveStudyItem = (id: string) => {
    setStudyItems((prev) => prev.filter((item) => item.id !== id));
  };

  // -------------------------
  // Subject handlers
  // -------------------------
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
    setStudyItems((prev) => prev.filter((i) => i.subjectId !== id));
    setStudySessions((prev) => prev.filter((s) => s.subjectId !== id));
  };

  // -------------------------
  // LocalStorage load/save
  // -------------------------
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      hydrated.current = true;
      return;
    }

    try {
      const parsed = JSON.parse(raw);

      const loadedSubjects = Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects;

      const loadedTasks = (parsed.tasks ?? []).map((t: any) => ({
        ...t,
        dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
        completedAt: t.completedAt ? new Date(t.completedAt) : undefined,
      }));

      const loadedStudyItems = (parsed.studyItems ?? []).map((i: any) => ({
        ...i,
        date: i.date ? new Date(i.date) : new Date(),
      }));

      const loadedStudySessions = (parsed.studySessions ?? []).map((s: any) => ({
        ...s,
        date: s.date ? new Date(s.date) : new Date(),
        completedAt: s.completedAt ? new Date(s.completedAt) : undefined,
      }));

      setSubjects(loadedSubjects);
      setTasks(loadedTasks);
      setStudyItems(loadedStudyItems);
      setStudySessions(loadedStudySessions);
    } catch (e) {
      console.error("Failed to load saved data", e);
    } finally {
      hydrated.current = true;
    }
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        tasks,
        subjects,
        studyItems,
        studySessions,
      })
    );
  }, [tasks, subjects, studyItems, studySessions]);

  // Dashboard: today's study items
  const todayStudyItems = studyItems.filter(
    (item) =>
      item.date.getDate() === today.getDate() &&
      item.date.getMonth() === today.getMonth() &&
      item.date.getFullYear() === today.getFullYear()
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-foreground font-bold pointer-events-none select-none">
                Student Planner
              </div>

              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === "dashboard"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab("calendar")}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === "calendar"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Calendar
                </button>

                <button
                  onClick={() => setActiveTab("tasks")}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === "tasks"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Tasks
                </button>

                <button
                  onClick={() => setActiveTab("study")}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === "study"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Study Planner
                </button>

                {/* NEW: Insights */}
                <button
                  onClick={() => setActiveTab("insights")}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === "insights"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  Insights
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveTab("settings")}
              className={`px-5 py-2 rounded-lg transition-colors ${
                activeTab === "settings"
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === "dashboard" && (
          <Dashboard tasks={tasks} subjects={subjects} studyItems={todayStudyItems} />
        )}

        {activeTab === "calendar" && (
          <Calendar
            studySessions={studySessions}
            tasks={tasks}
            studyItems={studyItems}
            subjects={subjects}
            onAddTask={handleAddTask}
            onAddStudyItem={handleAddStudyItem}
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
            onToggleSessionCompleted={toggleStudySessionCompleted}
          />
        )}

        {/* NEW: Insights */}
        {activeTab === "insights" && (
          <Insights subjects={subjects} tasks={tasks} studySessions={studySessions} />
        )}

        {activeTab === "settings" && (
          <Settings
            subjects={subjects}
            tasks={tasks}
            studyItems={studyItems}
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
