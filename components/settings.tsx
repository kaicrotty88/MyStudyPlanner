"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
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
  name: string;
  startDate: Date;
  endDate: Date;
};

type PeriodStored = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
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

// Storage keys (must match App)
const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

// From Dashboard -> Settings
const SETTINGS_OPEN_SECTION_KEY = "msp-settings-open-section";

function toISODateInputValue(d: Date) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value: string) {
  const [y, m, d] = value.split("-").map((x) => Number(x));
  return new Date(y, (m || 1) - 1, d || 1);
}

function safeUUID() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c: any = globalThis as any;
  if (c?.crypto?.randomUUID) return c.crypto.randomUUID();
  return `p_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

/* -------------------- Backup helpers -------------------- */
type BackupV1 = {
  version: 1;
  exportedAt: string;
  appMode: AppMode;
  data: any;
  periods?: PeriodStored[];
};

function downloadJson(filename: string, obj: unknown) {
  const json = JSON.stringify(obj, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function safeJsonParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
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
  const storageKey = appMode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", color: "#7A9B7F" });

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Collapsed by default
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  // Terms
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

  // Backup (collapsible)
  const [backupOpen, setBackupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string>("");
  const [pendingBackup, setPendingBackup] = useState<BackupV1 | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  // Refs for scrolling when opened from Dashboard
  const subjectsSectionRef = useRef<HTMLDivElement>(null);
  const termsSectionRef = useRef<HTMLDivElement>(null);

  // Auto-open the right section if Dashboard requested it
  useEffect(() => {
    let section: string | null = null;
    try {
      section = localStorage.getItem(SETTINGS_OPEN_SECTION_KEY);
    } catch {
      section = null;
    }
    if (!section) return;

    if (section === "subjects") {
      setSubjectsOpen(true);
      requestAnimationFrame(() => subjectsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }

    if (section === "terms") {
      setPeriodsOpen(true);
      requestAnimationFrame(() => termsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    }

    try {
      localStorage.removeItem(SETTINGS_OPEN_SECTION_KEY);
    } catch {
      // ignore
    }
  }, []);

  const colorPalette = [
    "#7A9B7F",
    "#6B8E73",
    "#8BA888",
    "#9CAF88",
    "#668C6A",
    "#7FA582",
    "#92B894",
    "#4F7E62",
    "#6F9A7B",
    "#5C8F6E",
    "#5E9D9A",
    "#4D8E8A",
    "#78B7B3",
    "#3F7F7C",
    "#6FAEAA",
    "#2F6F6C",
    "#6B9BC3",
    "#5A8AAA",
    "#7BA5C7",
    "#4A7A9E",
    "#3E6F93",
    "#84B2D6",
    "#587EA5",
    "#4B6F8E",
    "#9B7FA8",
    "#8B73A0",
    "#A888B5",
    "#7A6B92",
    "#B39BC6",
    "#6F5F86",
    "#8F7AB2",
    "#C4956E",
    "#B8885C",
    "#D4A574",
    "#A67C52",
    "#D9B08C",
    "#B57F55",
    "#C98B5F",
    "#C8B36A",
    "#BDA85C",
    "#D6C27A",
    "#B87B7B",
    "#A66B6B",
    "#C88A8A",
    "#9E5F5F",
    "#C27C99",
    "#B36B88",
    "#A85F77",
    "#8E8E8E",
    "#6F6F6F",
    "#A3A3A3",
  ];

  // Periods: load + persist
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

  const deletingPeriod = useMemo(() => periods.find((p) => p.id === deletingPeriodId) || null, [periods, deletingPeriodId]);

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

  // Periods handlers
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

    const nameClash = periods.some((p) => p.id !== editingPeriodId && p.name.toLowerCase() === name.toLowerCase());
    if (nameClash) {
      setPeriodFormError("That term name already exists.");
      return;
    }

    if (editingPeriodId) {
      setPeriods((prev) => {
        const next = prev.map((p) => (p.id === editingPeriodId ? { ...p, name, startDate: start, endDate: end } : p));
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
    try {
      localStorage.removeItem(PERIODS_STORAGE_KEY);
    } catch {
      // ignore
    }
    onClearAllData();
    setShowClearConfirm(false);
  };

  const clearButtonLabel = appMode === "demo" ? "Reset demo" : "Clear all data";

  const formatRange = (p: Period) => {
    const start = p.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = p.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${start} → ${end}`;
  };

  /* -------------------- Backup handlers -------------------- */
  const handleExportBackup = () => {
    setImportError("");

    const rawAppData = safeJsonParse<any>(localStorage.getItem(storageKey));
    const rawPeriods = safeJsonParse<PeriodStored[]>(localStorage.getItem(PERIODS_STORAGE_KEY)) ?? undefined;

    const fallbackData = {
      subjects,
      periods: periods.map((p) => ({
        id: p.id,
        name: p.name,
        startDate: p.startDate.toISOString(),
        endDate: p.endDate.toISOString(),
      })),
      tasks: tasks.map((t) => ({
        ...t,
        dueDate: t.dueDate instanceof Date ? t.dueDate.toISOString() : t.dueDate,
      })),
      studySessions: studySessions.map((s) => ({
        ...s,
        date: s.date instanceof Date ? s.date.toISOString() : s.date,
      })),
      reminders: [],
    };

    const backup: BackupV1 = {
      version: 1,
      exportedAt: new Date().toISOString(),
      appMode,
      data: rawAppData ?? fallbackData,
      periods: rawPeriods,
    };

    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadJson(`mystudyplanner-backup-${dateStamp}.json`, backup);
  };

  const openImportPicker = () => {
    setImportError("");
    fileInputRef.current?.click();
  };

  const handleFileChosen = async (file: File | null) => {
    setImportError("");
    setPendingBackup(null);
    setShowImportConfirm(false);

    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<BackupV1>;

      if (parsed?.version !== 1) {
        setImportError("This backup file format isn’t supported.");
        return;
      }
      if (!parsed.data || typeof parsed.data !== "object") {
        setImportError("Backup is missing data.");
        return;
      }

      const next: BackupV1 = {
        version: 1,
        exportedAt: String(parsed.exportedAt ?? new Date().toISOString()),
        appMode: parsed.appMode === "demo" || parsed.appMode === "app" ? parsed.appMode : appMode,
        data: parsed.data,
        periods: Array.isArray(parsed.periods) ? parsed.periods : undefined,
      };

      setPendingBackup(next);
      setShowImportConfirm(true);
    } catch {
      setImportError("Couldn’t read that file. Make sure it’s a valid .json backup.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingBackup) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(pendingBackup.data));
      if (pendingBackup.periods) {
        localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(pendingBackup.periods));
      }
      window.location.reload();
    } catch {
      setImportError("Import failed. Your browser may be blocking storage.");
      setShowImportConfirm(false);
      setPendingBackup(null);
    }
  };

  const importCounts = useMemo(() => {
    const d = pendingBackup?.data;
    const getLen = (x: any) => (Array.isArray(x) ? x.length : 0);
    return {
      subjects: getLen(d?.subjects),
      tasks: getLen(d?.tasks),
      studySessions: getLen(d?.studySessions),
      reminders: getLen(d?.reminders),
      periods: Array.isArray(pendingBackup?.periods) ? pendingBackup!.periods!.length : 0,
    };
  }, [pendingBackup]);

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your subjects and preferences.</p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5 space-y-4">
        {/* Subjects */}
        <div ref={subjectsSectionRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
              className={["w-5 h-5 text-muted-foreground transition-transform", subjectsOpen ? "rotate-180" : "rotate-0"].join(" ")}
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
                  <div className="text-sm font-semibold text-foreground">{editingId ? "Edit subject" : "New subject"}</div>

                  <input
                    type="text"
                    placeholder="Subject name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">
                      Colour <span className="opacity-70">(or pick a custom one below)</span>
                    </label>

                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                      {colorPalette.map((color) => (
                        <button
                          type="button"
                          key={color}
                          onClick={() => setFormData({ ...formData, color })}
                          className={[
                            "h-9 w-9 md:h-10 md:w-10 rounded-xl transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
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
                        <div className="h-10 w-10 rounded-xl border border-border" style={{ backgroundColor: subject.color }} />
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

        {/* Terms */}
        <div ref={termsSectionRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setPeriodsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Terms</div>
              <div className="text-xs text-muted-foreground">Define your school terms so tasks can be grouped automatically.</div>
            </div>

            <ChevronDown
              className={["w-5 h-5 text-muted-foreground transition-transform", periodsOpen ? "rotate-180" : "rotate-0"].join(" ")}
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
                  <div className="text-sm font-semibold text-foreground">{editingPeriodId ? "Edit term" : "New term"}</div>

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
                    <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">{periodFormError}</div>
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
                    <div className="mt-1 text-xs text-muted-foreground">Add Term 1, Term 2, Prelims, HSC — whatever matches your year.</div>
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
                            <div className="md:hidden text-xs text-muted-foreground mt-0.5">{formatRange(p)}</div>
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
            </div>
          )}
        </div>

        {/* Backup */}
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setBackupOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Backup</div>
              <div className="text-xs text-muted-foreground">Export a copy or restore from a backup file.</div>
            </div>

            <ChevronDown
              className={["w-5 h-5 text-muted-foreground transition-transform", backupOpen ? "rotate-180" : "rotate-0"].join(" ")}
            />
          </button>

          {backupOpen && (
            <div className="px-5 pb-5 space-y-3">
              <div className="text-xs text-muted-foreground leading-5">
                Use this to <span className="text-foreground/90 font-medium">save a copy</span> of your planner data,
                move to another device/browser, or recover if your browser storage is cleared.
                <span className="block mt-1">
                  Restoring a backup will <span className="text-foreground/90 font-medium">replace</span> data on this device.
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportBackup}
                  className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Download backup
                </button>

                <button
                  type="button"
                  onClick={openImportPicker}
                  className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Restore backup
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={(e) => handleFileChosen(e.target.files?.[0] ?? null)}
                />
              </div>

              {importError ? (
                <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">{importError}</div>
              ) : null}

              <div className="text-[11px] text-muted-foreground">
                Tip: store your backup in iCloud Drive / Google Drive so you can restore anytime.
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

        {/* Legal */}
        <div className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4">
          <div className="text-sm font-semibold text-foreground">Legal</div>
          <div className="mt-1 text-xs text-muted-foreground">Privacy and terms.</div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground transition">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground transition">
              Terms of Use
            </Link>
          </div>
        </div>
      </div>

      <div className="pt-2 text-center text-xs text-muted-foreground">
        Need help? Contact us at{" "}
        <a href="mailto:mystudyplanner.studio@gmail.com" className="underline hover:text-foreground transition-colors">
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
              <div className="text-xs text-muted-foreground mt-1">This will remove the subject and any linked data.</div>
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

      {/* Delete term modal */}
      {deletingPeriod && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingPeriodId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete “{deletingPeriod.name}”?</div>
              <div className="text-xs text-muted-foreground mt-1">This removes the term definition from this device.</div>
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

      {/* Import confirm modal */}
      {showImportConfirm && pendingBackup ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowImportConfirm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Restore this backup?</div>
              <div className="text-xs text-muted-foreground mt-1">This will replace data on this device.</div>
            </div>

            <div className="px-5 py-4 space-y-2">
              <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground space-y-1">
                <div className="flex items-center justify-between">
                  <span>Subjects</span>
                  <span className="text-foreground font-medium">{importCounts.subjects}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tasks</span>
                  <span className="text-foreground font-medium">{importCounts.tasks}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Study sessions</span>
                  <span className="text-foreground font-medium">{importCounts.studySessions}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Reminders</span>
                  <span className="text-foreground font-medium">{importCounts.reminders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Terms</span>
                  <span className="text-foreground font-medium">{importCounts.periods}</span>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground">After restoring, the page will reload automatically.</div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setShowImportConfirm(false)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmImport}
                className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Restore
              </button>
            </div>
          </div>
        </>
      ) : null}

      {/* Clear all modal */}
      {showClearConfirm && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">{appMode === "demo" ? "Reset demo data?" : "Clear all data?"}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {appMode === "demo"
                  ? "This will reset the demo back to the original sample subjects, tasks, and sessions."
                  : "This will permanently delete all your subjects, tasks, and study sessions from this device."}
              </div>
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
                {appMode === "demo" ? "Reset demo" : "Clear all data"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
