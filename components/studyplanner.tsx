"use client";
import React, { useMemo, useState } from "react";
import { Plus, Calendar, Edit2, Trash2, X } from "lucide-react";
import type { Subject, Task, StudySession } from "./models";

/* -------------------- Time helpers -------------------- */
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

const getWeekStart = (d: Date) => {
  const x = startOfDay(d);
  const day = x.getDay();
  x.setDate(x.getDate() - day);
  return x;
};
const getWeekEnd = (d: Date) => {
  const s = getWeekStart(d);
  const e = new Date(s);
  e.setDate(e.getDate() + 6);
  return e;
};
const inRange = (d: Date, a: Date, b: Date) => {
  const t = startOfDay(d).getTime();
  return t >= startOfDay(a).getTime() && t <= startOfDay(b).getTime();
};

/* -------------------- Dropdown helpers -------------------- */
const buildTimeOptions = (stepMinutes = 15) => {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      const d = new Date(2000, 0, 1, h, m);
      out.push(d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }));
    }
  }
  return out;
};

const DURATION_OPTIONS = [
  { label: "15 min", value: "15 min" },
  { label: "20 min", value: "20 min" },
  { label: "30 min", value: "30 min" },
  { label: "45 min", value: "45 min" },
  { label: "60 min", value: "60 min" },
  { label: "1h 15m", value: "1h 15m" },
  { label: "1h 30m", value: "1h 30m" },
  { label: "1h 45m", value: "1h 45m" },
  { label: "2h", value: "2h" },
  { label: "2h 30m", value: "2h 30m" },
  { label: "3h", value: "3h" },
];

interface StudyPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  studySessions: StudySession[];
  onAddStudySession: (session: Omit<StudySession, "id">) => void;
  onUpdateStudySession: (id: string, session: Omit<StudySession, "id">) => void;
  onDeleteStudySession: (id: string) => void;
  onToggleSessionCompleted: (id: string) => void;
}

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
  const [showCompleted, setShowCompleted] = useState(false);

  const [panelOpen, setPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const activeSubject = activeTab !== "all" ? subjects.find((s) => s.id === activeTab) : null;
  const timeOptions = useMemo(() => buildTimeOptions(15), []);

  const [sessionForm, setSessionForm] = useState({
    title: "",
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
    const base = activeTab === "all" ? studySessions : studySessions.filter((s) => s.subjectId === activeTab);
    const filtered = showCompleted ? base : base.filter((s) => !s.completed);
    return filtered.slice().sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [studySessions, activeTab, showCompleted]);

  const weeklySummary = useMemo(() => {
    const now = new Date();
    const a = getWeekStart(now);
    const b = getWeekEnd(now);
    const inWeek = studySessions.filter((s) => inRange(s.date, a, b));
    const minutes = inWeek.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0);
    return {
      count: inWeek.length,
      minutes,
      label: `${a.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${b.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })}`,
    };
  }, [studySessions]);

  const totalMinutesVisible = useMemo(
    () => visibleSessions.reduce((sum, s) => sum + parseDurationToMinutes(s.duration), 0),
    [visibleSessions]
  );

  const openNew = () => {
    setEditingId(null);
    setDeletingId(null);
    setPanelOpen(true);
    setSessionForm({
      title: "",
      subjectId: activeTab !== "all" ? activeTab : "",
      date: "",
      startTime: "",
      duration: "60 min",
      linkedTaskId: "",
    });
  };

  const openEdit = (s: StudySession) => {
    setEditingId(s.id);
    setDeletingId(null);
    setPanelOpen(true);
    setSessionForm({
      title: s.title ?? "",
      subjectId: s.subjectId,
      date: s.date.toISOString().split("T")[0],
      startTime: s.startTime,
      duration: s.duration || "60 min",
      linkedTaskId: s.linkedTaskId || "",
    });
  };

  const closePanel = () => {
    setEditingId(null);
    setPanelOpen(false);
  };

  const handleSubmit = () => {
    if (!sessionForm.title || !sessionForm.subjectId || !sessionForm.date || !sessionForm.startTime) return;

    const payload: Omit<StudySession, "id"> = {
      title: sessionForm.title.trim(),
      subjectId: sessionForm.subjectId,
      date: new Date(sessionForm.date),
      startTime: sessionForm.startTime,
      duration: sessionForm.duration,
      linkedTaskId: sessionForm.linkedTaskId || undefined,
      ...(editingId
        ? (() => {
            const current = studySessions.find((x) => x.id === editingId);
            return { completed: current?.completed, completedAt: current?.completedAt };
          })()
        : {}),
    };

    editingId ? onUpdateStudySession(editingId, payload) : onAddStudySession(payload);
    closePanel();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Study Planner</h1>
          <p className="text-sm text-muted-foreground">Plan, log, and review your study sessions.</p>
        </div>

        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
        >
          <Plus className="w-4 h-4" />
          Log session
        </button>
      </div>

      {/* Weekly summary */}
      <div className="rounded-2xl border border-border bg-card px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="text-sm">
          <span className="font-medium text-foreground">This week</span>
          <span className="text-muted-foreground"> • {weeklySummary.label}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {weeklySummary.count} sessions •{" "}
          <span className="text-foreground font-semibold">{formatMinutes(weeklySummary.minutes)}</span>
        </div>
      </div>

      {/* Subject tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            activeTab === "all" ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:bg-muted"
          }`}
        >
          All
        </button>

        {subjects.map((s) => {
          const active = activeTab === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActiveTab(s.id)}
              className="px-3 py-1.5 rounded-full text-sm font-medium border transition"
              style={
                active
                  ? { backgroundColor: s.color, borderColor: s.color, color: "white" }
                  : { backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }
              }
            >
              <span
                className="inline-block w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: active ? "white" : s.color }}
              />
              {s.name}
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {visibleSessions.length} sessions •{" "}
          <span className="text-foreground font-semibold">{formatMinutes(totalMinutesVisible)}</span>
        </div>
        <button
          onClick={() => setShowCompleted((v) => !v)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm hover:bg-muted transition"
        >
          {showCompleted ? "Hide completed" : "Show completed"}
        </button>
      </div>

      {/* Sessions list */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="px-4 py-3 border-b border-border bg-muted/30 text-sm font-semibold text-foreground">
          Sessions
        </div>

        {visibleSessions.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            No study sessions yet. Log your first one.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {visibleSessions.map((s) => {
              const subj = getSubjectById(s.subjectId);
              const mins = parseDurationToMinutes(s.duration);

              return (
                <div
                  key={s.id}
                  className={`group flex items-start justify-between gap-4 px-4 py-3 hover:bg-muted/40 transition ${
                    s.completed ? "opacity-80" : ""
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <button
                      onClick={() => onToggleSessionCompleted(s.id)}
                      className="mt-0.5 w-5 h-5 rounded border border-border grid place-items-center hover:bg-muted transition"
                    >
                      {s.completed && <div className="w-3 h-3 rounded-sm bg-primary" />}
                    </button>

                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">{s.title}</div>
                      <div className="mt-1 text-xs text-muted-foreground flex flex-wrap gap-2">
                        <span>{formatMinutes(mins)} • {s.startTime}</span>
                        <span>• {s.date.toLocaleDateString()}</span>
                        {subj && <span>• {subj.name}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-muted rounded">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeletingId(s.id)} className="p-1.5 hover:bg-muted rounded">
                      <Trash2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add / Edit panel */}
      {panelOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closePanel} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
              <div className="text-sm font-semibold">{editingId ? "Edit session" : "New session"}</div>
              <button onClick={closePanel} className="p-1.5 hover:bg-muted rounded">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <input
                value={sessionForm.title}
                onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                placeholder="Session title"
                className="w-full rounded-xl border border-border px-4 py-2"
              />

              <select
                value={sessionForm.subjectId}
                onChange={(e) => setSessionForm({ ...sessionForm, subjectId: e.target.value })}
                className="w-full rounded-xl border border-border px-4 py-2"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="date"
                  value={sessionForm.date}
                  onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                  className="rounded-xl border border-border px-3 py-2"
                />
                <select
                  value={sessionForm.startTime}
                  onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  className="rounded-xl border border-border px-3 py-2"
                >
                  <option value="">Start</option>
                  {timeOptions.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
                <select
                  value={sessionForm.duration}
                  onChange={(e) => setSessionForm({ ...sessionForm, duration: e.target.value })}
                  className="rounded-xl border border-border px-3 py-2"
                >
                  {DURATION_OPTIONS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2">
                <button onClick={handleSubmit} className="flex-1 rounded-xl bg-primary px-4 py-2 text-white">
                  {editingId ? "Save" : "Add"}
                </button>
                <button onClick={closePanel} className="flex-1 rounded-xl border border-border px-4 py-2">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
