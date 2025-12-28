"use client";
import React, { useMemo, useState } from "react";
import { Plus, Calendar, Edit2, Trash2 } from "lucide-react";

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
  duration: string; // e.g. "60 min" or "1h 30m"
  linkedTaskId?: string; // link to exam/assignment
  completed?: boolean;
  completedAt?: Date;
}

interface StudyPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];

  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession: (id: string) => void;
  onToggleSessionCompleted: (id: string) => void;
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

export function StudyPlanner({
  tasks,
  subjects,
  studySessions,
  onAddStudySession,
  onUpdateStudySession,
  onDeleteStudySession,
  onToggleSessionCompleted,
}: StudyPlannerProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [showHelperText, setShowHelperText] = useState(true);

  const [showAddSessionForm, setShowAddSessionForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showCompleted, setShowCompleted] = useState(false);

  const activeSubject = activeTab !== "all" ? subjects.find((s) => s.id === activeTab) : null;

  const [sessionForm, setSessionForm] = useState({
    subjectId: "",
    date: "",
    startTime: "",
    duration: "60 min",
    linkedTaskId: "",
  });

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const linkableAssessments = useMemo(() => {
    return tasks
      .filter((t) => t.type === "exam" || t.type === "assignment")
      .filter((t) => (sessionForm.subjectId ? t.subjectId === sessionForm.subjectId : true))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }, [tasks, sessionForm.subjectId]);

  const visibleSessions = useMemo(() => {
    const base =
      activeTab === "all" ? studySessions : studySessions.filter((s) => s.subjectId === activeTab);

    const withCompleted = showCompleted ? base : base.filter((s) => !s.completed);

    return withCompleted
      .slice()
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [studySessions, activeTab, showCompleted]);

  const totalMinutesVisible = useMemo(() => {
    return visibleSessions.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
  }, [visibleSessions]);

  const handleOpenNew = () => {
    setEditingId(null);
    setShowAddSessionForm(true);
    setSessionForm({
      subjectId: activeTab !== "all" ? activeTab : "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
  };

  const handleOpenEdit = (s: StudySession) => {
    setEditingId(s.id);
    setShowAddSessionForm(true);
    setSessionForm({
      subjectId: s.subjectId,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      duration: s.duration || "60 min",
      linkedTaskId: s.linkedTaskId || "",
    });
  };

  const handleSubmitSession = () => {
    if (!sessionForm.subjectId || !sessionForm.date || !sessionForm.startTime || !sessionForm.duration) return;

    const payload: Omit<StudySession, "id"> = {
      subjectId: sessionForm.subjectId,
      date: new Date(sessionForm.date),
      startTime: sessionForm.startTime,
      duration: sessionForm.duration,
      linkedTaskId: sessionForm.linkedTaskId || undefined,
      // if editing, keep completion state as-is by reading it from current session
      ...(editingId
        ? (() => {
            const current = studySessions.find((x) => x.id === editingId);
            return {
              completed: current?.completed,
              completedAt: current?.completedAt,
            };
          })()
        : {}),
    };

    if (editingId) {
      onUpdateStudySession(editingId, payload);
    } else {
      onAddStudySession(payload);
    }

    setEditingId(null);
    setShowAddSessionForm(false);
    setSessionForm({
      subjectId: activeTab !== "all" ? activeTab : "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
  };

  const handleCancelSession = () => {
    setEditingId(null);
    setShowAddSessionForm(false);
  };

  const getLinkedTask = (taskId?: string) => {
    if (!taskId) return null;
    return tasks.find((t) => t.id === taskId) || null;
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
      {/* Helper Text */}
      {showHelperText && (
        <div className="flex items-center justify-between bg-accent/20 rounded-lg px-4 py-3 border border-primary/20">
          <p className="text-xs text-muted-foreground">Log study sessions (hours) and link them to exams/assignments.</p>
          <button
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground font-semibold">Study Planner</h1>
        <p className="text-muted-foreground text-sm opacity-80">Log study sessions, organized by subject</p>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-6 py-3 transition-colors border-b-2 whitespace-nowrap font-medium ${
            activeTab === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-transparent text-foreground hover:bg-muted"
          }`}
        >
          All
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveTab(subject.id)}
            className={`px-6 py-3 transition-all border-b-2 whitespace-nowrap text-white ${
              activeTab === subject.id ? "font-semibold" : "font-medium opacity-90 hover:opacity-100"
            }`}
            style={{
              backgroundColor: subject.color + (activeTab === subject.id ? "" : "DD"),
              borderBottomColor: activeTab === subject.id ? subject.color : "transparent",
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground opacity-80">
          {visibleSessions.length} sessions • {formatMinutes(totalMinutesVisible)}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCompleted((v) => !v)}
            className="px-3 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors font-medium"
          >
            {showCompleted ? "Hide completed" : "Show completed"}
          </button>

          <button
            onClick={handleOpenNew}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium ${
              activeSubject ? "" : "bg-primary"
            }`}
            style={activeSubject ? { backgroundColor: activeSubject.color } : undefined}
          >
            <Plus className="w-4 h-4" />
            Log study session
          </button>
        </div>
      </div>

      {/* Add/Edit Session Form */}
      {showAddSessionForm && (
        <div className="bg-card rounded-lg p-5 shadow-sm border border-border space-y-4">
          <div className="text-foreground font-medium">{editingId ? "Edit study session" : "New study session"}</div>

          <select
            value={sessionForm.subjectId}
            onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value, linkedTaskId: "" })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={sessionForm.date}
                onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <input
              type="text"
              placeholder="Start time (e.g. 4:00 PM)"
              value={sessionForm.startTime}
              onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary h-10.5 mt-7 md:mt-0"
            />

            <input
              type="text"
              placeholder="Duration (e.g. 60 min / 1h 30m)"
              value={sessionForm.duration}
              onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary h-10.5 mt-7 md:mt-0"
            />
          </div>

          {/* Link to assessment (exam/assignment only) */}
          <select
            value={sessionForm.linkedTaskId}
            onChange={(e) => setSessionForm({ ...sessionForm, linkedTaskId: e.target.value })}
            className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Link to assessment (optional)</option>
            {linkableAssessments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.type.toUpperCase()}: {t.title}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            <button
              onClick={handleSubmitSession}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
            >
              {editingId ? "Save" : "Add"}
            </button>
            <button
              onClick={handleCancelSession}
              className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      <div className="space-y-3">
        {visibleSessions.length > 0 ? (
          visibleSessions.map((s) => {
            const subj = getSubjectById(s.subjectId);
            const linked = getLinkedTask(s.linkedTaskId);
            const minutes = parseDurationToMinutes(s.duration);

            return (
              <div
                key={s.id}
                className={`bg-card rounded-lg p-4 shadow-sm border border-border group hover:shadow-md transition-shadow ${
                  s.completed ? "opacity-80" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      {/* completion checkbox */}
                      <button
                        onClick={() => onToggleSessionCompleted(s.id)}
                        className="w-5 h-5 rounded border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"
                        aria-label={s.completed ? "Mark incomplete" : "Mark complete"}
                      >
                        {s.completed ? <div className="w-3 h-3 rounded-sm bg-primary" /> : null}
                      </button>

                      <div className="text-foreground font-medium">
                        {formatMinutes(minutes)} • {s.startTime}
                      </div>

                      {subj && (
                        <span
                          className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0"
                          style={{ backgroundColor: subj.color }}
                        >
                          {subj.name}
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {s.date.toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                      {s.completed && s.completedAt && (
                        <span className="opacity-70">
                          • completed{" "}
                          {s.completedAt.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                      )}
                    </div>

                    {linked && (
                      <div className="text-xs text-muted-foreground opacity-80">
                        Linked: {linked.type.toUpperCase()} • {linked.title}
                      </div>
                    )}
                  </div>

                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleOpenEdit(s)}
                      className="p-1.5 hover:bg-muted rounded"
                      aria-label="Edit"
                    >
                      <Edit2 className="w-4 h-4 text-foreground" />
                    </button>
                    <button
                      onClick={() => setDeletingId(s.id)}
                      className="p-1.5 hover:bg-muted rounded"
                      aria-label="Delete"
                    >
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                {/* Delete Confirmation */}
                {deletingId === s.id && (
                  <>
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeletingId(null)} />
                    <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-sm">
                      <h3 className="text-foreground font-semibold mb-2">Delete this session?</h3>
                      <p className="text-sm text-muted-foreground opacity-80 mb-4">This action cannot be undone.</p>
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDeleteStudySession(s.id);
                            setDeletingId(null);
                          }}
                          className="px-4 py-2 text-sm rounded-lg bg-muted-foreground text-white hover:bg-muted-foreground/90 transition-colors font-medium"
                        >
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
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <p className="text-muted-foreground text-sm text-center opacity-80">
              {activeTab === "all"
                ? "No study sessions yet. Log your first one."
                : `No study sessions for ${activeSubject?.name} yet.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
