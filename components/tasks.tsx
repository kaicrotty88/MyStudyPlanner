"use client";

import React, { useMemo, useState } from "react";
import { Plus, Calendar, ChevronDown, ChevronUp, Edit2, Trash2, Sparkles } from "lucide-react";

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

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const daysUntil = (due: Date) => {
  const a = startOfDay(new Date()).getTime();
  const b = startOfDay(due).getTime();
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
};

const dueTone = (task: Task) => {
  if (task.completed) return "muted";
  const d = daysUntil(task.dueDate);
  if (d < 0) return "overdue";
  if (d === 0) return "today";
  if (d <= 3) return "soon";
  return "ok";
};

const dueChip = (dueDate: Date) => {
  const d = daysUntil(dueDate);
  if (d < 0) return "Overdue";
  if (d === 0) return "Today";
  return `${d}d`;
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

  const [showCompleted, setShowCompleted] = useState(false);

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const toggleSection = (section: "task" | "assignment" | "exam" | "homework") => {
    setExpandedSections((prev) => {
      const next = !prev[section];

      if (!next) {
        if (showAddForm === section) setShowAddForm(null);
        if (editingId) setEditingId(null);
      }

      return { ...prev, [section]: next };
    });
  };

  const filteredTasksBase = selectedSubject === "all" ? tasks : tasks.filter((task) => task.subjectId === selectedSubject);
  const filteredTasks = showCompleted ? filteredTasksBase : filteredTasksBase.filter((t) => !t.completed);

  const tasksByType = useMemo(
    () => ({
      task: filteredTasks.filter((t) => t.type === "task"),
      assignment: filteredTasks.filter((t) => t.type === "assignment"),
      exam: filteredTasks.filter((t) => t.type === "exam"),
      homework: filteredTasks.filter((t) => t.type === "homework"),
    }),
    [filteredTasks]
  );

  const getMinutesStudiedForTask = (taskId: string) =>
    studySessions.filter((s) => s.linkedTaskId === taskId).reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);

  const getSectionAccentColor = () => {
    if (selectedSubject !== "all") return getSubjectById(selectedSubject)?.color || ALL_ACCENT;
    return ALL_ACCENT;
  };

  const handleSubmit = (type: "task" | "assignment" | "exam" | "homework") => {
    if (!formData.title || !formData.subjectId || !formData.dueDate) return;

    if (editingId) {
      const existing = tasks.find((t) => t.id === editingId);
      onUpdateTask(editingId, {
        title: formData.title,
        subjectId: formData.subjectId,
        dueDate: new Date(formData.dueDate),
        type,
        completed: existing?.completed,
        completedAt: existing?.completedAt,
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
    setExpandedSections((prev) => ({ ...prev, [task.type]: true }));
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

  // ✅ IMPORTANT FIX: render form as JSX (not a component) to prevent remount + focus loss
  const renderAddForm = (type: "task" | "assignment" | "exam" | "homework") => (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
      <div className="text-sm font-semibold text-foreground">
        {editingId ? "Edit" : "New"} {type}
      </div>

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
        autoFocus
      />

      <select
        value={formData.subjectId}
        onChange={(e) => setFormData((p) => ({ ...p, subjectId: e.target.value }))}
        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        <option value="">Select subject</option>
        {subjects.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      <input
        type="date"
        value={formData.dueDate}
        onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
      />

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={() => handleSubmit(type)}
          className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {editingId ? "Save" : "Add"}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  const SectionHeader = ({
    type,
    label,
    count,
  }: {
    type: "task" | "assignment" | "exam" | "homework";
    label: string;
    count: number;
  }) => {
    const isExpanded = expandedSections[type];
    const accent = getSectionAccentColor();

    return (
      <div
        className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm"
        style={{ borderLeftWidth: 4, borderLeftColor: accent }}
      >
        <button
          onClick={() => toggleSection(type)}
          className="flex items-center gap-3 flex-1 text-left rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          type="button"
        >
          <div className="h-9 w-9 rounded-xl border border-border bg-muted/20 grid place-items-center">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
          </div>

          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">{label}</div>
            <div className="text-xs text-muted-foreground">{count} items</div>
          </div>
        </button>

        <button
          type="button"
          onClick={() => {
            setExpandedSections((prev) => ({ ...prev, [type]: true }));
            setShowAddForm(showAddForm === type ? null : type);
            setEditingId(null);
            setFormData({ title: "", subjectId: "", dueDate: "" });
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <Plus className="w-4 h-4" />
          Add
        </button>
      </div>
    );
  };

  const TaskRow = ({ task }: { task: Task }) => {
    const subject = getSubjectById(task.subjectId);
    const studiedMins = getMinutesStudiedForTask(task.id);
    const tone = dueTone(task);

    const toneBorder =
      tone === "overdue" ? "border-red-500/30" :
      tone === "today" ? "border-orange-500/30" :
      tone === "soon" ? "border-yellow-500/30" :
      "border-border";

    const toneWash =
      tone === "overdue" ? "bg-red-500/5" :
      tone === "today" ? "bg-orange-500/5" :
      tone === "soon" ? "bg-yellow-500/5" :
      "bg-card";

    const chipClass =
      tone === "overdue" ? "bg-red-500/10 text-red-700 border-red-500/20" :
      tone === "today" ? "bg-orange-500/10 text-orange-700 border-orange-500/20" :
      tone === "soon" ? "bg-yellow-500/10 text-yellow-700 border-yellow-500/20" :
      "bg-muted/40 text-foreground border-border";

    return (
      <div
        className={[
          "group rounded-2xl border px-4 py-3 shadow-sm hover:shadow-md transition",
          "hover:bg-background/40",
          toneBorder,
          toneWash,
          task.completed ? "opacity-75" : "",
        ].join(" ")}
        style={{ borderLeftWidth: 4, borderLeftColor: subject?.color ?? ALL_ACCENT }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={() => onToggleCompleted(task.id)}
              className="h-5 w-5 rounded border border-border grid place-items-center bg-background/40 hover:bg-muted transition shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              aria-label={task.completed ? "Mark incomplete" : "Mark complete"}
            >
              {task.completed ? <div className="h-3 w-3 rounded-sm bg-primary" /> : null}
            </button>

            <div className="min-w-0">
              <div
                className={[
                  "text-sm font-medium truncate",
                  task.completed ? "line-through text-muted-foreground" : "text-foreground",
                ].join(" ")}
              >
                {task.title}
              </div>

              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {subject ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: subject.color }} />
                    <span className="truncate">{subject.name}</span>
                  </span>
                ) : (
                  <span>Unassigned</span>
                )}

                {studiedMins > 0 ? (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Studied {formatMinutes(studiedMins)}</span>
                  </>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>

            <span className={["px-2 py-1 rounded-full border text-xs font-medium", chipClass].join(" ")}>
              {dueChip(task.dueDate)}
            </span>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
              <button
                type="button"
                onClick={() => handleEdit(task)}
                className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Edit"
              >
                <Edit2 className="w-4 h-4 text-foreground" />
              </button>
              <button
                type="button"
                onClick={() => setDeletingId(task.id)}
                className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Delete"
              >
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (taskList: Task[], type: "task" | "assignment" | "exam" | "homework") => {
    const label = type.charAt(0).toUpperCase() + type.slice(1) + "s";
    const isExpanded = expandedSections[type];
    const sortedTasks = [...taskList].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    return (
      <div className="space-y-3">
        <SectionHeader type={type} label={label} count={sortedTasks.length} />

        {isExpanded ? (
          <div className="ml-3 sm:ml-5 pl-3 sm:pl-4 border-l border-border/60 space-y-3">
            {showAddForm === type ? renderAddForm(type) : null}

            {sortedTasks.length ? (
              <div className="space-y-2">
                {sortedTasks.map((t) => (
                  <TaskRow key={t.id} task={t} />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
                <div className="text-sm font-medium text-foreground">No {type}s yet</div>
                <div className="mt-1 text-xs text-muted-foreground">Click “Add” to create one.</div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-5">
      {/* Header (adds the missing "page rhythm") */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tasks</h1>
        <p className="text-sm text-muted-foreground">Organise assessments, track deadlines, and tick things off.</p>
      </div>

      {showHelperText ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4" />
            Add and manage tasks, assignments, and exams.
          </div>
          <button
            type="button"
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 rounded-lg px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {/* Subject filter (slightly cleaner surface + spacing) */}
      <div className="rounded-2xl border border-border bg-card p-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setSelectedSubject("all")}
          className={[
            "px-4 py-2 rounded-full text-sm font-medium transition border",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
            selectedSubject === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-card text-foreground border-border hover:bg-muted",
          ].join(" ")}
        >
          All
        </button>

        {subjects.map((s) => {
          const active = selectedSubject === s.id;
          return (
            <button
              type="button"
              key={s.id}
              onClick={() => setSelectedSubject(s.id)}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition border",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                active ? "bg-muted/50 border-border" : "bg-card border-border hover:bg-muted",
              ].join(" ")}
              style={{ boxShadow: active ? `0 0 0 2px ${s.color}33` : undefined }}
            >
              <span className="inline-flex items-center gap-2 min-w-0">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                <span className="text-foreground truncate">{s.name}</span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-xs text-muted-foreground">
          {filteredTasks.length} showing{selectedSubject !== "all" ? " (filtered)" : ""}
        </div>

        <button
          type="button"
          onClick={() => setShowCompleted((v) => !v)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          {showCompleted ? "Hide completed" : "Show completed"}
        </button>
      </div>

      {/* Section framing (same idea as Calendar’s “Plan” wrapper) */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Taskboard</div>
        </div>

        <div className="space-y-4">
          {renderSection(tasksByType.task, "task")}
          {renderSection(tasksByType.assignment, "assignment")}
          {renderSection(tasksByType.exam, "exam")}
          {renderSection(tasksByType.homework, "homework")}
        </div>
      </div>

      {deletingId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this item?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deletingId)}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
