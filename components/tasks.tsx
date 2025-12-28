"use client";

import React, { useMemo, useState } from "react";
import { Plus, Calendar, ChevronDown, ChevronUp, Edit2, Trash2 } from "lucide-react";

const ALL_ACCENT = "#7A9B7F";

interface Subject {
  id: string;
  name: string;
  color: string;
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

interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: Date;
  type: "task" | "assignment" | "exam" | "homework";
  completed?: boolean;
  completedAt?: Date;
}

const parseDurationToMinutes = (duration: string): number => {
  if (!duration) return 0;
  const s = duration.toLowerCase().trim();

  const colon = s.match(/^(\d{1,2}):(\d{2})$/);
  if (colon) return Number(colon[1]) * 60 + Number(colon[2]);

  let hours = 0;
  let minutes = 0;

  const hMatch = s.match(/(\d+(?:\.\d+)?)\s*(h|hr|hrs|hour|hours)\b/);
  if (hMatch) hours = Number(hMatch[1]);

  const mMatch = s.match(/(\d+(?:\.\d+)?)\s*(m|min|mins|minute|minutes)\b/);
  if (mMatch) minutes = Number(mMatch[1]);

  if (hMatch || mMatch) return Math.round(hours * 60 + minutes);

  const justNumber = s.match(/^\d+$/);
  if (justNumber) return Number(s);

  const firstNum = s.match(/(\d+)/);
  return firstNum ? Number(firstNum[1]) : 0;
};

const formatMinutes = (total: number): string => {
  const mins = Math.max(0, Math.round(total));
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h <= 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};

// ✅ Small helper for consistent date maths
const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysUntil = (due: Date) => {
  const a = startOfDay(new Date()).getTime();
  const b = startOfDay(due).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

// ✅ Returns classes for “heat” effect
const getDueHeatClasses = (task: Task) => {
  if (task.completed) return "opacity-70";

  const d = daysUntil(task.dueDate);

  if (d < 0) return "bg-red-500/15 border-red-500/30";
  if (d === 0) return "bg-orange-500/15 border-orange-500/30";
  if (d <= 3) return "bg-yellow-500/15 border-yellow-500/30";
  if (d <= 7) return "bg-muted/30 border-border";

  return "bg-card border-border";
};

interface TasksProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

export function Tasks({
  tasks,
  subjects,
  studySessions,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleCompleted,
}: TasksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  // ✅ default collapsible (all collapsed = false)
  const [expandedSections, setExpandedSections] = useState({
    task: false,
    assignment: false,
    exam: false,
    homework: false,
  });

  const [showAddForm, setShowAddForm] = useState<"task" | "assignment" | "exam" | "homework" | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHelperText, setShowHelperText] = useState(true);

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
  });

  // ✅ default hide completed
  const [showCompleted, setShowCompleted] = useState(false);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const toggleSection = (section: "task" | "assignment" | "exam" | "homework") => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredTasksBase =
    selectedSubject === "all" ? tasks : tasks.filter((task) => task.subjectId === selectedSubject);

  const filteredTasks = showCompleted ? filteredTasksBase : filteredTasksBase.filter((t) => !t.completed);

  const tasksByType = useMemo(
    () => ({
      homework: filteredTasks.filter((t) => t.type === "homework"),
      task: filteredTasks.filter((t) => t.type === "task"),
      assignment: filteredTasks.filter((t) => t.type === "assignment"),
      exam: filteredTasks.filter((t) => t.type === "exam"),
    }),
    [filteredTasks]
  );

  const getDaysLeftLabel = (dueDate: Date) => {
    const d = daysUntil(dueDate);
    if (d < 0) return "Overdue";
    if (d === 0) return "Due today";
    return `${d}d`;
  };

  const getDaysTextClass = (dueDate: Date) => {
    const d = daysUntil(dueDate);
    if (d < 0) return "text-red-600";
    if (d === 0) return "text-orange-600";
    if (d <= 3) return "text-yellow-600";
    return "text-foreground";
  };

  const getMinutesStudiedForTask = (taskId: string) =>
    studySessions
      .filter((s) => s.linkedTaskId === taskId)
      .reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);

  // Section accent color
  const getSectionAccentColor = () => {
    if (selectedSubject !== "all") return getSubjectById(selectedSubject)?.color || ALL_ACCENT;
    return ALL_ACCENT;
  };

  const handleSubmit = (type: "task" | "assignment" | "exam" | "homework") => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) return;

    if (editingId) {
      onUpdateTask(editingId, {
        title: formData.title,
        subjectId: formData.subjectId,
        dueDate: new Date(formData.dueDate),
        type,
        completed: tasks.find((t) => t.id === editingId)?.completed,
        completedAt: tasks.find((t) => t.id === editingId)?.completedAt,
      });
      setEditingId(null);
    } else {
      onAddTask({
        title: formData.title,
        subjectId: formData.subjectId,
        dueDate: new Date(formData.dueDate),
        type,
      });
    }

    setFormData({ title: "", subjectId: "", dueDate: "" });
    setShowAddForm(null);
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: task.dueDate.toISOString().split("T")[0],
    });
    setShowAddForm(task.type);
  };

  const handleDelete = (id: string) => {
    onDeleteTask(id);
    setDeletingId(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setEditingId(null);
    setFormData({ title: "", subjectId: "", dueDate: "" });
  };

  const renderTaskList = (taskList: Task[], type: "task" | "assignment" | "exam" | "homework") => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + "s";
    const sortedTasks = [...taskList].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const isExpanded = expandedSections[type];
    const accentColor = getSectionAccentColor();

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border-l-4" style={{ borderLeftColor: accentColor }}>
          <button onClick={() => toggleSection(type)} className="flex items-center gap-2 flex-1 text-left">
            {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            <h3 className="text-foreground font-semibold">{typeLabel}</h3>
            <span className="text-muted-foreground text-sm opacity-80">({sortedTasks.length})</span>
          </button>

          <button
            onClick={() => {
              setShowAddForm(showAddForm === type ? null : type);
              setEditingId(null);
              setFormData({ title: "", subjectId: "", dueDate: "" });
              // auto-open section if adding
              setExpandedSections((prev) => ({ ...prev, [type]: true }));
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {showAddForm === type && isExpanded && (
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border space-y-3">
            <div className="text-sm text-foreground font-medium">{editingId ? `Edit ${type}` : `New ${type}`}</div>

            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(type)}
                className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                {editingId ? "Save" : "Add"}
              </button>
              <button onClick={handleCancel} className="px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        )}

        {isExpanded && (
          <div className="space-y-1">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const subject = getSubjectById(task.subjectId);
                const heat = getDueHeatClasses(task);
                const studiedMins = getMinutesStudiedForTask(task.id);

                return (
                  <div key={task.id}>
                    <div className={`rounded-lg px-4 py-2.5 shadow-sm border hover:shadow-md transition-shadow group ${heat}`}>
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <button
                            onClick={() => onToggleCompleted(task.id)}
                            className="w-5 h-5 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                            aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
                          >
                            {task.completed ? <div className="w-3 h-3 rounded-sm bg-primary" /> : null}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div
                              className={`text-sm font-medium truncate ${
                                task.completed ? "text-muted-foreground line-through opacity-80" : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </div>

                            {studiedMins > 0 && (
                              <div className="text-xs text-muted-foreground opacity-80 mt-0.5">
                                Studied: {formatMinutes(studiedMins)}
                              </div>
                            )}
                          </div>

                          {subject && (
                            <span className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0" style={{ backgroundColor: subject.color }}>
                              {subject.name}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              <span className="opacity-80">
                                {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                              </span>
                            </div>

                            <div className={`font-semibold ${getDaysTextClass(task.dueDate)}`}>{getDaysLeftLabel(task.dueDate)}</div>
                          </div>

                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(task)} className="p-1.5 hover:bg-muted rounded transition-colors" aria-label="Edit">
                              <Edit2 className="w-3.5 h-3.5 text-foreground" />
                            </button>
                            <button onClick={() => setDeletingId(task.id)} className="p-1.5 hover:bg-muted rounded transition-colors" aria-label="Delete">
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {deletingId === task.id && (
                      <>
                        <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeletingId(null)} />
                        <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-sm">
                          <h3 className="text-foreground font-semibold mb-2">Delete this item?</h3>
                          <p className="text-sm text-muted-foreground opacity-80 mb-4">This action cannot be undone.</p>
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setDeletingId(null)} className="px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors">
                              Cancel
                            </button>
                            <button onClick={() => handleDelete(task.id)} className="px-4 py-2 text-sm rounded-lg bg-muted-foreground text-white hover:bg-muted-foreground/90 transition-colors font-medium">
                              Delete
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                <p className="text-muted-foreground text-sm text-center opacity-80">No {type}s yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
      {showHelperText && (
        <div className="flex items-center justify-between bg-accent/20 rounded-lg px-4 py-3 border border-primary/20">
          <p className="text-xs text-muted-foreground">Add and manage tasks, assignments, and exams.</p>
          <button onClick={() => setShowHelperText(false)} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject("all")}
          className={`px-4 py-2 rounded-full text-sm transition-colors font-medium ${
            selectedSubject === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border text-foreground hover:bg-muted"
          }`}
        >
          All
        </button>

        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`px-4 py-2 rounded-full text-sm text-white transition-all ${
              selectedSubject === subject.id ? "font-semibold ring-2 ring-offset-2" : "font-medium opacity-90 hover:opacity-100"
            }`}
            style={{
              backgroundColor: subject.color,
              boxShadow: selectedSubject === subject.id ? `0 0 0 2px ${subject.color}` : undefined,
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground opacity-80">{filteredTasks.length} total</div>

        <button
          onClick={() => setShowCompleted((v) => !v)}
          className="px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
        >
          {showCompleted ? "Hide completed" : "Show completed"}
        </button>
      </div>

      <div className="space-y-4">
        {renderTaskList(tasksByType.task, "task")}
        {renderTaskList(tasksByType.assignment, "assignment")}
        {renderTaskList(tasksByType.exam, "exam")}
        {renderTaskList(tasksByType.homework, "homework")}
      </div>
    </div>
  );
}
