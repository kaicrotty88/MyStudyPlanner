"use client";

const STORAGE_KEY = "mystudylife-data";


import React, { useState, useEffect } from "react";
import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";

type Tab = 'dashboard' | 'calendar' | 'tasks' | 'study' | 'settings';

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
  type: 'task' | 'assignment' | 'exam' | 'homework';
}

interface StudySession {
  id: string;
  subjectId: string;
  date: Date;
  startTime: string;
  duration: string;
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
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  // Subjects with varied color palette
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: 'Mathematics', color: '#6B9BC3' },
    { id: '2', name: 'Physics', color: '#9B7FA8' },
    { id: '3', name: 'Chemistry', color: '#C4956E' },
    { id: '4', name: 'English', color: '#7A9B7F' },
    { id: '5', name: 'History', color: '#B87B7B' },
  ]);

  // Sample data with 2025/2026 dates
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const inThreeDays = new Date(today);
  inThreeDays.setDate(inThreeDays.getDate() + 3);
  const inFiveDays = new Date(today);
  inFiveDays.setDate(inFiveDays.getDate() + 5);

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Complete Chapter 5 Review',
      subjectId: '1',
      dueDate: inFiveDays,
      type: 'assignment'
    },
    {
      id: '2',
      title: 'Read pages 120-145',
      subjectId: '5',
      dueDate: tomorrow,
      type: 'task'
    },
    {
      id: '3',
      title: 'Midterm Exam',
      subjectId: '2',
      dueDate: nextWeek,
      type: 'exam'
    },
    {
      id: '4',
      title: 'Lab Report',
      subjectId: '3',
      dueDate: inThreeDays,
      type: 'assignment'
    }
  ]);

  const [studySessions, setStudySessions] = useState<StudySession[]>([
    {
      id: '1',
      subjectId: '1',
      date: today,
      startTime: '2:00 PM',
      duration: '90 min'
    }
  ]);

  const [studyItems, setStudyItems] = useState<StudyItem[]>([
    {
      id: '1',
      subjectId: '1',
      topic: 'Quadratic equations practice',
      date: today,
      linkedTaskId: '1',
      showOnCalendar: false
    },
    {
      id: '2',
      subjectId: '2',
      topic: 'Newton\'s laws review',
      date: today,
      showOnCalendar: false
    }
  ]);

useEffect(() => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return;

  try {
    const parsed = JSON.parse(raw);

    const loadedTasks = (parsed.tasks ?? []).map((t: any) => ({
      ...t,
      dueDate: t.dueDate ? new Date(t.dueDate) : new Date(),
    }));

    const loadedStudyItems = (parsed.studyItems ?? []).map((i: any) => ({
      ...i,
      date: i.date ? new Date(i.date) : new Date(),
    }));

    const loadedStudySessions = (parsed.studySessions ?? []).map((s: any) => ({
      ...s,
      date: s.date ? new Date(s.date) : new Date(),
    }));

    setTasks(loadedTasks);
    setSubjects(parsed.subjects ?? []);
    setStudyItems(loadedStudyItems);
    setStudySessions(loadedStudySessions);
  } catch (e) {
    console.error("Failed to load saved data", e);
  }
}, []);



useEffect(() => {
  const data = {
    tasks,
    subjects,
    studyItems,
    studySessions,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}, [tasks, subjects, studyItems, studySessions]);


  // Get today's study items
  const todayStudyItems = studyItems.filter(
    (item) =>
      item.date.getDate() === today.getDate() &&
      item.date.getMonth() === today.getMonth() &&
      item.date.getFullYear() === today.getFullYear()
  );

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString()
    };
    setTasks([...tasks, task]);
  };

  const handleUpdateTask = (id: string, updatedTask: Omit<Task, 'id'>) => {
    setTasks(tasks.map(t => t.id === id ? { ...updatedTask, id } : t));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleAddStudyItem = (newItem: Omit<StudyItem, 'id'>) => {
    const item: StudyItem = {
      ...newItem,
      id: Date.now().toString()
    };
    setStudyItems([...studyItems, item]);
  };

  const handleUpdateStudyItem = (id: string, updatedItem: Omit<StudyItem, 'id'>) => {
    setStudyItems(studyItems.map(item => item.id === id ? { ...updatedItem, id } : item));
  };

  const handleRemoveStudyItem = (id: string) => {
    setStudyItems(studyItems.filter((item) => item.id !== id));
  };

  const handleAddSubject = (name: string, color: string) => {
    const newSubject: Subject = {
      id: Date.now().toString(),
      name,
      color
    };
    setSubjects([...subjects, newSubject]);
  };

  const handleUpdateSubject = (id: string, name: string, color: string) => {
    setSubjects(subjects.map(s => s.id === id ? { ...s, name, color } : s));
  };

  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-card border-b border-border sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="text-foreground font-bold pointer-events-none select-none">Student Planner</div>
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === 'dashboard'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === 'calendar'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === 'tasks'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Tasks
                </button>
                <button
                  onClick={() => setActiveTab('study')}
                  className={`px-5 py-2 rounded-lg transition-colors ${
                    activeTab === 'study'
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  Study Planner
                </button>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-5 py-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted'
              }`}
            >
              Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {activeTab === 'dashboard' && (
          <Dashboard
            tasks={tasks}
            subjects={subjects}
            studyItems={todayStudyItems}
          />
        )}
        {activeTab === 'calendar' && (
          <Calendar
            studySessions={studySessions}
            tasks={tasks}
            studyItems={studyItems}
            subjects={subjects}
            onAddTask={handleAddTask}
            onAddStudyItem={handleAddStudyItem}
          />
        )}
        {activeTab === 'tasks' && (
          <Tasks
            tasks={tasks}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {activeTab === 'study' && (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            studyItems={studyItems}
            onAddStudyItem={handleAddStudyItem}
            onUpdateStudyItem={handleUpdateStudyItem}
            onRemoveStudyItem={handleRemoveStudyItem}
          />
        )}
        {activeTab === 'settings' && (
          <Settings
            subjects={subjects}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
          />
        )}
      </main>
    </div>
  );
  return <div>App loaded</div>;
}
export default App;

