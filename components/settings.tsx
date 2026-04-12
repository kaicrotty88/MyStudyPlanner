"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, Trash, ChevronDown, Sparkles, Lock } from "lucide-react";
import { useSession, useUser } from "@clerk/nextjs";

import { getSupabaseClient } from "@/lib/supabaseClient";
import { fetchUserPlan, type Plan } from "@/lib/profileSupabase";

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

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

type SettingsOpenSection = "subjects" | "terms" | "backup";

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
  openSection?: SettingsOpenSection | null;
  onOpenSectionHandled?: () => void;
}

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

const SUBJECT_COLOR_PALETTE = [
  "#2563EB",
  "#DC2626",
  "#16A34A",
  "#7C3AED",
  "#EA580C",
  "#0EA5E9",
  "#DB2777",
  "#CA8A04",
  "#059669",
  "#9333EA",
  "#4F46E5",
  "#B91C1C",
  "#15803D",
  "#A21CAF",
  "#C2410C",
  "#0284C7",
  "#BE185D",
  "#A16207",
  "#047857",
  "#6D28D9",
  "#1D4ED8",
  "#991B1B",
  "#166534",
  "#86198F",
  "#9A3412",
  "#0369A1",
  "#9D174D",
  "#854D0E",
  "#065F46",
  "#5B21B6",
];

function normalizeHex(hex: string) {
  return String(hex || "").trim().toLowerCase();
}

function pickNextColor(usedColors: string[]) {
  const used = new Set(usedColors.map(normalizeHex));
  const next = SUBJECT_COLOR_PALETTE.find((c) => !used.has(normalizeHex(c)));
  return next ?? SUBJECT_COLOR_PALETTE[usedColors.length % SUBJECT_COLOR_PALETTE.length];
}

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
  openSection,
  onOpenSectionHandled,
}: SettingsProps) {
  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();

  const supabase = useMemo(() => {
    if (!session) return null;
    return getSupabaseClient(() => session.getToken() ?? Promise.resolve(null));
  }, [session]);

  const storageKey = appMode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", color: pickNextColor([]) });

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const [subjectsOpen, setSubjectsOpen] = useState(false);

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

  const [backupOpen, setBackupOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string>("");
  const [pendingBackup, setPendingBackup] = useState<BackupV1 | null>(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);

  const subjectsCardRef = useRef<HTMLDivElement>(null);
  const termsCardRef = useRef<HTMLDivElement>(null);
  const backupCardRef = useRef<HTMLDivElement>(null);

  const subjectNameInputRef = useRef<HTMLInputElement>(null);
  const termNameInputRef = useRef<HTMLInputElement>(null);

  const usedSubjectColors = useMemo(() => subjects.map((s) => s.color), [subjects]);
  const [currentPlan, setCurrentPlan] = useState<Plan>(appMode === "demo" ? "premium" : "free");
  const [isStartingCheckout, setIsStartingCheckout] = useState(false);
  const [isOpeningPortal, setIsOpeningPortal] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string>("");
  const currentPlanLabel =
    appMode === "demo" ? "Preview mode" : currentPlan === "premium" ? "Premium" : "Free";

  const normalizeTermName = (s: string) => s.trim().replace(/\s+/g, " ").toLowerCase();

  useEffect(() => {
    if (appMode === "demo") {
      setCurrentPlan("premium");
      return;
    }

    if (!userLoaded) return;

    if (!isSignedIn || !supabase || !user?.id) {
      setCurrentPlan("free");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const plan = await fetchUserPlan(supabase, user.id);
        if (!cancelled) setCurrentPlan(plan);
      } catch (error) {
        console.error("Failed to fetch settings plan:", error);
        if (!cancelled) setCurrentPlan("free");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [appMode, userLoaded, isSignedIn, supabase, user?.id]);

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
    } catch {}
  }, [periods]);

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

  useEffect(() => {
    if (!openSection) return;

    if (openSection === "subjects") {
      setSubjectsOpen(true);
      setPeriodsOpen(false);
      setBackupOpen(false);

      setEditingId(null);
      setShowAddForm(true);

      requestAnimationFrame(() => {
        subjectsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        subjectNameInputRef.current?.focus();
      });
    }

    if (openSection === "terms") {
      setSubjectsOpen(false);
      setBackupOpen(false);
      setPeriodsOpen(true);

      openNewPeriod();

      requestAnimationFrame(() => {
        termsCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        termNameInputRef.current?.focus();
      });
    }

    if (openSection === "backup") {
      setSubjectsOpen(false);
      setPeriodsOpen(false);
      setBackupOpen(true);

      requestAnimationFrame(() => {
        backupCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    onOpenSectionHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSection]);

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

  const ensureNewSubjectDefaults = () => {
    setFormData({ name: "", color: pickNextColor(usedSubjectColors) });
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.color) return;

    if (editingId) {
      onUpdateSubject(editingId, formData.name.trim(), formData.color);
      setEditingId(null);
    } else {
      onAddSubject(formData.name.trim(), formData.color);
      setShowAddForm(false);
    }

    ensureNewSubjectDefaults();
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
    ensureNewSubjectDefaults();
  };

  const confirmDelete = () => {
    if (!deletingSubjectId) return;
    onDeleteSubject(deletingSubjectId);
    setDeletingSubjectId(null);
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

    const n = normalizeTermName(name);
    const nameClash = periods.some((p) => p.id !== editingPeriodId && normalizeTermName(p.name) === n);
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
    } catch {}

    onClearAllData();
    setShowClearConfirm(false);
  };

  const clearButtonLabel = appMode === "demo" ? "Reset demo" : "Clear all data";

  const formatRange = (p: Period) => {
    const start = p.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    const end = p.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${start} → ${end}`;
  };

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

  const handleStartCheckout = async () => {
    if (appMode !== "app" || currentPlan === "premium" || isOpeningPortal) return;

    setCheckoutError("");
    setIsStartingCheckout(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to start checkout.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to start checkout:", error);
      setCheckoutError("Couldn’t open checkout right now. Please try again.");
      setIsStartingCheckout(false);
    }
  };

  const handleOpenPortal = async () => {
    if (appMode !== "app" || currentPlan !== "premium") return;

    setCheckoutError("");
    setIsOpeningPortal(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error || "Failed to open billing portal.");
      }

      window.location.href = data.url;
    } catch (error) {
      console.error("Failed to open billing portal:", error);
      setCheckoutError("Couldn’t open billing settings right now. Please try again.");
      setIsOpeningPortal(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your subjects and preferences.</p>
      </div>

      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5 space-y-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm px-5 py-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Sparkles className="w-4 h-4" />
                Plan
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Manage your current plan and see what Premium will unlock.
              </div>
            </div>

            <div className="inline-flex items-center rounded-full border border-border bg-background/60 px-3 py-1.5 text-xs font-medium text-foreground">
              {currentPlanLabel}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Marks
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Log results across the year and keep all your marks in one place.
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Insights
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Unlock more advanced analytics and stronger study trends.
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                <Lock className="w-4 h-4 text-muted-foreground" />
                Custom widgets
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Personalise your dashboard and insights layout later.
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border bg-muted/20 px-4 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {appMode === "demo"
                    ? "Premium is included in preview mode"
                    : currentPlan === "premium"
                    ? "You are on Premium"
                    : "Upgrade to Premium"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {appMode === "demo"
                    ? "Demo mode includes Premium features so people can try them."
                    : currentPlan === "premium"
                    ? "Manage your subscription and billing details."
                    : "Unlock Marks, Insights, and future Premium features with a subscription."}
                </div>
              </div>

              <button
                type="button"
                onClick={currentPlan === "premium" ? handleOpenPortal : handleStartCheckout}
                disabled={appMode === "demo" || isStartingCheckout || isOpeningPortal}
                className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {appMode === "demo"
                  ? "Included in demo"
                  : currentPlan === "premium"
                  ? isOpeningPortal
                    ? "Opening billing..."
                    : "Manage billing"
                  : isStartingCheckout
                  ? "Opening checkout..."
                  : "Upgrade now"}
              </button>
            </div>

            {checkoutError ? (
              <div className="mt-3 rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                {checkoutError}
              </div>
            ) : null}
          </div>
        </div>

        <div ref={subjectsCardRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
              className={["w-5 h-5 text-muted-foreground transition-transform", subjectsOpen ? "rotate-180" : "rotate-0"].join(
                " "
              )}
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
                    setDeletingSubjectId(null);
                    ensureNewSubjectDefaults();
                    requestAnimationFrame(() => subjectNameInputRef.current?.focus());
                  }}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  Add subject
                </button>
              </div>

              {(showAddForm || editingId) && (
                <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold text-foreground">{editingId ? "Edit subject" : "New subject"}</div>

                    <div className="inline-flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">Preview</span>
                      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: formData.color }} />
                        <span className="text-foreground/90">{formData.name.trim() || "Subject"}</span>
                      </span>
                    </div>
                  </div>

                  <input
                    ref={subjectNameInputRef}
                    type="text"
                    placeholder="Subject name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    autoFocus
                  />

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Colour</label>

                    <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-2">
                      {SUBJECT_COLOR_PALETTE.map((color) => {
                        const selected = normalizeHex(formData.color) === normalizeHex(color);
                        return (
                          <button
                            type="button"
                            key={color}
                            onClick={() => setFormData({ ...formData, color })}
                            className={[
                              "h-9 w-9 md:h-10 md:w-10 rounded-xl transition-transform border",
                              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                              selected ? "scale-105 ring-2 ring-primary border-border" : "hover:scale-105 border-border",
                            ].join(" ")}
                            style={{ backgroundColor: color }}
                            aria-label={`Pick ${color}`}
                            title={color}
                          />
                        );
                      })}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData((p) => ({ ...p, color: pickNextColor(usedSubjectColors) }))}
                        className="rounded-xl border border-border bg-card px-3 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        Pick a new colour
                      </button>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Custom</span>
                        <input
                          type="color"
                          value={formData.color}
                          onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                          className="h-10 w-16 rounded-xl border border-border cursor-pointer bg-card"
                          aria-label="Pick custom color"
                        />
                      </div>
                    </div>

                    <div className="text-[11px] text-muted-foreground">
                      Tip: pick colours that look different at a glance (helps the calendar).
                    </div>
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

        <div ref={termsCardRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
              className={["w-5 h-5 text-muted-foreground transition-transform", periodsOpen ? "rotate-180" : "rotate-0"].join(
                " "
              )}
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
                        ref={termNameInputRef}
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

        <div ref={backupCardRef} className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
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
              className={["w-5 h-5 text-muted-foreground transition-transform", backupOpen ? "rotate-180" : "rotate-0"].join(
                " "
              )}
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
                <div className="rounded-xl border border-border bg-background/40 px-4 py-3 text-xs text-muted-foreground">
                  {importError}
                </div>
              ) : null}

              <div className="text-[11px] text-muted-foreground">Tip: store your backup in iCloud Drive / Google Drive.</div>
            </div>
          )}
        </div>

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

        <div className="rounded-2xl border border-border bg-card shadow-sm px-5 py-4">
          <div className="text-sm font-semibold text-foreground">Learn</div>
          <div className="mt-1 text-xs text-muted-foreground">Learn more about MyStudyPlanner and how it works.</div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <Link href="/about" className="text-muted-foreground hover:text-foreground transition">
              About
            </Link>
            <Link href="/how-it-works" className="text-muted-foreground hover:text-foreground transition">
              How it works
            </Link>
          </div>
        </div>

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