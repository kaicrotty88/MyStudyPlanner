"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Trash, ChevronDown } from "lucide-react";

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

interface StudySession {
  id: string;
  subjectId: string;
  date: Date;
  startTime: string;
  duration: string;
}

type AppMode = "demo" | "app";

type Period = {
  id: string;
  name: string; // "Term 1", "Prelims", etc.
  startDate: Date;
  endDate: Date;
};

type PeriodStored = {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
};

interface SettingsProps {
  subjects: Subject[];

  tasks: Task[];
  studyItems: StudyItem[];
  studySessions: StudySession[];

  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;

  appMode: AppMode;
  onClearAllData: () => void;
}

const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

function toISODateInputValue(d: Date) {
  // YYYY-MM-DD in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  // value is YYYY-MM-DD; create local date (midnight)
  const [y, m, d] = value.split("-").map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function safeUUID() {
  // Avoid breaking older browsers/environments
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();
  return `p_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

export function Settings({
  subjects,
  tasks,
  studyItems,
  studySessions,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  appMode,
  onClearAllData,
}: SettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", color: "#7A9B7F" });

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Default to collapsed for calmer Settings landing
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  // ✅ Periods section (terms)
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [showAddPeriodForm, setShowAddPeriodForm] = useState(false);
  const [editingPeriodId, setEditingPeriodId] = useState<string | null>(null);
  const [deletingPeriodId, setDeletingPeriodId] = useState<string | null>(null);
  const [periodForm, setPeriodForm] = useState({
    name: "",
    startDate: toISODateInputValue(new Date()),
    endDate: toISODateInputValue(new Date()),
  });
  const [periodFormError, setPeriodFormError] = useState<string>("");

  const colorPalette = [
    "#7A9B7F",
    "#6B8E73",
    "#8BA888",
    "#9CAF88",
    "#758E6F",
    "#668C6A",
    "#7FA582",
    "#92B894",
    "#6B9BC3",
    "#5A8AAA",
    "#7BA5C7",
    "#4A7A9E",
    "#9B7FA8",
    "#8B73A0",
    "#A888B5",
    "#7A6B92",
    "#C4956E",
    "#B8885C",
    "#D4A574",
    "#A67C52",
    "#B87B7B",
    "#A66B6B",
    "#C88A8A",
    "#9E5F5F",
  ];

  // -------- Periods: load + persist --------
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (!raw) {
        setPeriods([]);
        return;
      }
      const parsed = JSON.parse(raw) as PeriodStored[];
      const hydrated: Period[] = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));
      hydrated.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
      setPeriods(hydrated);
    } catch {
      setPeriods([]);
    }
  }, []);

  useEffect(() => {
    try {
      const stored: PeriodStored[] = periods.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      }));
      localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(stored));
    } catch {
      // ignore
    }
  }, [periods]);

  const deletingSubject = useMemo(
    () => subjects.find((s) => s.id === deletingSubjectId) || null,
    [subjects, deletingSubjectId]
  );

  const deleteCounts = useMemo(() => {
    if (!deletingSubjectId) return { tasks: 0, items: 0, sessions: 0 };

    const t = tasks.filter((x) => x.subjectId === deletingSubjectId).length;
    const i = studyItems.filter((x) => x.subjectId === deletingSubjectId).length;
    const s = studySessions.filter((x) => x.subjectId === deletingSubjectId).length;

    return { tasks: t, items: i, sessions: s };
  }, [deletingSubjectId, tasks, studyItems, studySessions]);

  const deletingPeriod = useMemo(
    () => periods.find((p) => p.id === deletingPeriodId) || null,
    [periods, deletingPeriodId]
  );

  const handleSubmit = () => {
    if (!formData.name || !formData.color) return;

    if (editingId) {
      onUpdateSubject(editingId, formData.name.trim(), formData.color);
      setEditingId(null);
    } else {
      onAddSubject(formData.name.trim(), formData.color);
      setShowAddForm(false);
    }

    setFormData({ name: "", color: "#7A9B7F" });
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({ name: subject.name, color: subject.color });
    setShowAddForm(false);
    setSubjectsOpen(true);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({ name: "", color: "#7A9B7F" });
  };

  const confirmDelete = () => {
    if (!deletingSubjectId) return;
    onDeleteSubject(deletingSubjectId);
    setDeletingSubjectId(null);
  };

  // -------- Periods handlers --------
  const openNewPeriod = () => {
    setPeriodFormError("");
    setEditingPeriodId(null);
    setShowAddPeriodForm(true);
    setPeriodsOpen(true);

    const today = new Date();
    setPeriodForm({
      name: "",
      startDate: toISODateInputValue(today),
      endDate: toISODateInputValue(today),
    });
  };

  const openEditPeriod = (p: Period) => {
    setPeriodFormError("");
    setEditingPeriodId(p.id);
    setShowAddPeriodForm(true);
    setPeriodsOpen(true);
    setPeriodForm({
      name: p.name,
      startDate: toISODateInputValue(p.startDate),
      endDate: toISODateInputValue(p.endDate),
    });
  };

  const cancelPeriodForm = () => {
    setShowAddPeriodForm(false);
    setEditingPeriodId(null);
    setPeriodFormError("");
    const today = new Date();
    setPeriodForm({
      name: "",
      startDate: toISODateInputValue(today),
      endDate: toISODateInputValue(today),
    });
  };

  const savePeriod = () => {
    const name = periodForm.name.trim();
    if (!name) {
      setPeriodFormError("Please enter a term name (e.g. “Term 1”).");
      return;
    }

    const start = parseDateInput(periodForm.startDate);
    const end = parseDateInput(periodForm.endDate);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      setPeriodFormError("Please enter valid start and end dates.");
      return;
    }

    if (start.getTime() > end.getTime()) {
      setPeriodFormError("End date must be the same as or after the start date.");
      return;
    }

    // Prevent duplicate names (case-insensitive) unless editing same row
    const nameClash = periods.some(
      (p) => p.id !== editingPeriodId && p.name.toLowerCase() === name.toLowerCase()
    );
    if (nameClash) {
      setPeriodFormError("That term name already exists.");
      return;
    }

    if (editingPeriodId) {
      setPeriods((prev) => {
        const next = prev.map((p) =>
          p.id === editingPeriodId ? { ...p, name, startDate: start, endDate: end } : p
        );
        next.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        return next;
      });
    } else {
      const newPeriod: Period = { id: safeUUID(), name, startDate: start, endDate: end };
      setPeriods((prev) => {
        const next = [...prev, newPeriod];
        next.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
        return next;
      });
      setShowAddPeriodForm(false);
    }

    setPeriodFormError("");
    setEditingPeriodId(null);
    setPeriodForm({ name: "", startDate: periodForm.startDate, endDate: periodForm.endDate });
  };

  const confirmDeletePeriod = () => {
    if (!deletingPeriodId) return;
    setPeriods((prev) => prev.filter((p) => p.id !== deletingPeriodId));
    setDeletingPeriodId(null);
  };

  const handleConfirmClear = () => {
    // Ensure terms/periods are cleared too
    try {
      localStorage.removeItem(PERIODS_STORAGE_KEY);
    } catch {
      // ignore
    }
    onClearAllData();
    setShowClearConfirm(false);
  };

  const clearTitle = appMode === "demo" ? "Reset demo data?" : "Clear all data?";
  const clearBody =
    appMode === "demo"
      ? "This will reset the demo back to the original sample subjects, tasks, and sessions."
      : "This will permanently delete all your subjects, tasks, and study sessions from this device.";

  const clearButtonLabel = appMode === "demo" ? "Reset demo" : "Clear all data";

  const formatRange = (p: Period) => {
    const start = p.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = p.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${start} → ${end}`;
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your subjects and preferences.</p>
      </div>

      {/* Subtle wrapper for hierarchy */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5 space-y-4">
        {/* Subjects */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setSubjectsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Subjects</div>
              <div className="text-xs text-muted-foreground">Add, edit, and organise your subjects.</div>
            </div>

            <ChevronDown
              className={[
                "w-5 h-5 text-muted-foreground transition-transform",
                subjectsOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {subjectsOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setSubjectsOpen(true);
                    setShowAddForm(true);
                    setEditingId(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  Add subject
                </button>
              </div>

              {(showAddForm || editingId) && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="text-sm font-semibold text-foreground">
                    {editingId ? "Edit subject" : "New subject"}
                  </div>

                  <input
                    type="text"
                    placeholder="Subject name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Colour</label>

                    <div className="grid grid-cols-8 gap-2">
                      {colorPalette.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={[
                            "h-10 w-10 rounded-xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            formData.color === color ? "ring-2 ring-primary scale-105" : "hover:scale-105",
                          ].join(" ")}
                          style={{ backgroundColor: color }}
                          aria-label={`Pick ${color}`}
                        />
                      ))}
                    </div>

                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-full h-10 rounded-xl border border-border cursor-pointer bg-card"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleSubmit}
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
              )}

              <div className="space-y-2">
                {subjects.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
                    <div className="text-sm font-medium text-foreground">No subjects yet</div>
                    <div className="mt-1 text-xs text-muted-foreground">Create one to start organising your work.</div>
                  </div>
                ) : (
                  subjects.map((subject) => (
                    <div
                      key={subject.id}
                      className="group rounded-2xl border border-border bg-card px-4 py-3 shadow-sm hover:shadow-md transition flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="h-10 w-10 rounded-xl border border-border"
                          style={{ backgroundColor: subject.color }}
                        />
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{subject.name}</div>
                          <div className="text-xs text-muted-foreground">{subject.color}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                        <button
                          type="button"
                          onClick={() => handleEdit(subject)}
                          className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingSubjectId(subject.id)}
                          className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Terms / Periods */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setPeriodsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Terms</div>
              <div className="text-xs text-muted-foreground">
                Define your school terms so tasks can be grouped automatically.
              </div>
            </div>

            <ChevronDown
              className={[
                "w-5 h-5 text-muted-foreground transition-transform",
                periodsOpen ? "rotate-180" : "rotate-0",
              ].join(" ")}
            />
          </button>

          {periodsOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={openNewPeriod}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  Add term
                </button>
              </div>

              {showAddPeriodForm && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="text-sm font-semibold text-foreground">
                    {editingPeriodId ? "Edit term" : "New term"}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-1">
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Name</label>
                      <input
                        type="text"
                        placeholder='e.g. "Term 1"'
                        value={periodForm.name}
                        onChange={(e) => setPeriodForm((p) => ({ ...p, name: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">Start date</label>
                      <input
                        type="date"
                        value={periodForm.startDate}
                        onChange={(e) => setPeriodForm((p) => ({ ...p, startDate: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-1">End date</label>
                      <input
                        type="date"
                        value={periodForm.endDate}
                        onChange={(e) => setPeriodForm((p) => ({ ...p, endDate: e.target.value }))}
                        className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>

                  {periodFormError ? (
                    <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                      {periodFormError}
                    </div>
                  ) : null}

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={savePeriod}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      {editingPeriodId ? "Save" : "Add"}
                    </button>
                    <button
                      type="button"
                      onClick={cancelPeriodForm}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    Tip: keep term dates fixed — tasks can be assigned automatically based on due date.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {periods.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border bg-background/40 p-6 text-center">
                    <div className="text-sm font-medium text-foreground">No terms yet</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Add Term 1, Term 2, Prelims, HSC — whatever matches your year.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border bg-card overflow-hidden">
                    <div className="hidden md:grid grid-cols-[1.2fr_1fr_0.4fr] gap-4 px-4 py-3 text-xs font-medium text-muted-foreground bg-muted/20 border-b border-border">
                      <div>Term</div>
                      <div>Date range</div>
                      <div className="text-right">Actions</div>
                    </div>

                    <div className="divide-y divide-border">
                      {periods.map((p) => (
                        <div
                          key={p.id}
                          className="px-4 py-3 hover:bg-muted/10 transition grid grid-cols-1 md:grid-cols-[1.2fr_1fr_0.4fr] gap-3 md:gap-4 items-center"
                        >
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                            <div className="md:hidden text-xs text-muted-foreground mt-0.5">
                              {formatRange(p)}
                            </div>
                          </div>

                          <div className="hidden md:block text-sm text-foreground/90">{formatRange(p)}</div>

                          <div className="flex md:justify-end items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditPeriod(p)}
                              className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                              aria-label="Edit term"
                            >
                              <Edit2 className="w-4 h-4 text-foreground" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingPeriodId(p.id)}
                              className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                              aria-label="Delete term"
                            >
                              <Trash2 className="w-4 h-4 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-muted-foreground">
                These terms are saved on this device (local storage). Later we’ll use them to auto-assign tasks and
                group Marks.
              </div>
            </div>
          )}
        </div>

        {/* Clear all data */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4 flex items-center justify-between">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground">Clear all data</div>
            <div className="text-xs text-muted-foreground">
              {appMode === "demo" ? "Start over with the sample data." : "Clear everything and start fresh."}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowClearConfirm(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
          >
            <Trash className="w-4 h-4" />
            {clearButtonLabel}
          </button>
        </div>
      </div>

      {/* Contact */}
      <div className="pt-2 text-center text-xs text-muted-foreground">
        Need help? Contact us at{" "}
        <a
          href="mailto:mystudyplanner.studio@gmail.com"
          className="underline hover:text-foreground transition-colors"
        >
          mystudyplanner.studio@gmail.com
        </a>
      </div>

      {/* Delete subject modal */}
      {deletingSubject && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingSubjectId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete “{deletingSubject.name}”?</div>
              <div className="text-xs text-muted-foreground mt-1">
                This will remove the subject and any linked data.
              </div>
            </div>

            <div className="px-5 py-4 space-y-2">
              <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Tasks</span>
                  <span className="text-foreground font-medium">{deleteCounts.tasks}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>Study items</span>
                  <span className="text-foreground font-medium">{deleteCounts.items}</span>
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <span>Study sessions</span>
                  <span className="text-foreground font-medium">{deleteCounts.sessions}</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">This action cannot be undone.</div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeletingSubjectId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* ✅ Delete term modal */}
      {deletingPeriod && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingPeriodId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete “{deletingPeriod.name}”?</div>
              <div className="text-xs text-muted-foreground mt-1">
                This removes the term definition from this device.
              </div>
            </div>

            <div className="px-5 py-4 space-y-2">
              <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                <div className="flex items-center justify-between">
                  <span>Date range</span>
                  <span className="text-foreground font-medium">{formatRange(deletingPeriod)}</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">
                Tasks won’t be deleted — later we’ll decide how term reassignment should behave.
              </div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setDeletingPeriodId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletePeriod}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Clear all modal */}
      {showClearConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">{clearTitle}</div>
              <div className="text-xs text-muted-foreground mt-1">{clearBody}</div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmClear}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                {clearButtonLabel}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
