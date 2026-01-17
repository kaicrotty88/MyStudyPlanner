"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit2 } from "lucide-react";

import type { Task, Subject } from "./models";

// Must match Settings + Tasks key
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

type PeriodStored = {
  id: string;
  name: string;
  startDate: string; // ISO
  endDate: string; // ISO
};

type PeriodHydrated = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

interface MarksProps {
  tasks: Task[];
  subjects: Subject[];
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
}

export function Marks({ tasks, subjects, onUpdateTask }: MarksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    score: "",
    outOf: "100",
    notes: "",
  });

  // ✅ Load Terms (Periods) from localStorage (same as Tasks/Settings)
  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (!raw) {
        setPeriods([]);
        return;
      }

      const parsed = JSON.parse(raw) as PeriodStored[];
      const hydrated: PeriodHydrated[] = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));

      // ✅ ONLY Terms 1–4
      const onlyTerms1to4 = hydrated
        .filter((p) => /^term\s*[1-4]$/i.test(p.name.trim()))
        .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      setPeriods(onlyTerms1to4);
    } catch {
      setPeriods([]);
    }
  }, []);

  const periodNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of periods) map.set(p.id, p.name);
    return map;
  }, [periods]);

  /* -------------------- Derived data -------------------- */

  // ✅ ONLY assignments + exams
  const assessableTasks = useMemo(() => {
    return tasks.filter((t) => t.type === "assignment" || t.type === "exam");
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let base =
      selectedSubject === "all"
        ? assessableTasks
        : assessableTasks.filter((t) => t.subjectId === selectedSubject);

    if (selectedPeriod !== "all") {
      base = base.filter((t) => t.periodId === selectedPeriod);
    }

    // Pending first, then newest
    return [...base].sort((a, b) => {
      const aPending = a.result ? 0 : 1;
      const bPending = b.result ? 0 : 1;
      if (aPending !== bPending) return bPending - aPending;
      return b.dueDate.getTime() - a.dueDate.getTime();
    });
  }, [assessableTasks, selectedSubject, selectedPeriod]);

  const subjectById = (id: string) => subjects.find((s) => s.id === id);

  const percentage = (score: number, outOf: number) =>
    outOf > 0 ? Math.round((score / outOf) * 100) : 0;

  const pendingCount = filteredTasks.filter((t) => !t.result).length;
  const recordedCount = filteredTasks.filter((t) => Boolean(t.result)).length;

  /* -------------------- Handlers -------------------- */

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      score: task.result ? String(task.result.score) : "",
      outOf: task.result ? String(task.result.outOf) : "100",
      notes: task.result?.notes ?? "",
    });
  };

  const closeEdit = () => {
    setEditingTask(null);
    setFormData({ score: "", outOf: "100", notes: "" });
  };

  const saveResult = () => {
    if (!editingTask || !formData.score || !formData.outOf) return;

    onUpdateTask(editingTask.id, {
      ...editingTask,
      result: {
        score: Number(formData.score),
        outOf: Number(formData.outOf),
        notes: formData.notes.trim() || undefined,
        dateRecorded: new Date(),
      },
    });

    closeEdit();
  };

  /* -------------------- UI -------------------- */

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Marks</h1>
        <p className="text-sm text-muted-foreground">
          Assignments and exams appear automatically. Add results when released.
        </p>
      </div>

      {/* Controls + status */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 md:p-5 bg-muted/10 border-b border-border">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Status */}
            <div className="flex items-center gap-2 text-sm">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5">
                <span className="text-foreground font-medium">{recordedCount}</span>
                <span className="text-muted-foreground">recorded</span>
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-card/40 px-3 py-1.5">
                <span className="text-foreground font-medium">{pendingCount}</span>
                <span className="text-muted-foreground">pending</span>
              </span>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              {/* Subject */}
              <div className="inline-flex items-center rounded-xl border border-border bg-card/60 p-1">
                <button
                  type="button"
                  onClick={() => setSelectedSubject("all")}
                  className={[
                    "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                    selectedSubject === "all"
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground/90 hover:bg-muted",
                  ].join(" ")}
                >
                  All subjects
                </button>

                {subjects.map((s) => {
                  const active = selectedSubject === s.id;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSelectedSubject(s.id)}
                      className={[
                        "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        active ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted",
                      ].join(" ")}
                      style={{ boxShadow: active ? `0 0 0 2px ${s.color}22` : undefined }}
                      title={s.name}
                    >
                      <span className="inline-flex items-center gap-2 max-w-[140px]">
                        <span
                          className="h-2.5 w-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="truncate">{s.name}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Term */}
              {periods.length > 0 ? (
                <div className="inline-flex items-center rounded-xl border border-border bg-card/60 p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedPeriod("all")}
                    className={[
                      "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      selectedPeriod === "all"
                        ? "bg-muted text-foreground"
                        : "text-foreground/90 hover:bg-muted",
                    ].join(" ")}
                  >
                    All terms
                  </button>

                  {periods.map((p) => {
                    const active = selectedPeriod === p.id;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedPeriod(p.id)}
                        className={[
                          "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          active ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted",
                        ].join(" ")}
                      >
                        {p.name}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          </div>
        </div>

        {/* Record sheet */}
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center bg-background/40">
            <div className="text-sm font-medium text-foreground">No assessments</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Assignments and exams will appear here automatically.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1.4fr_0.9fr_0.6fr_0.5fr] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground bg-card">
              <div>Assessment</div>
              <div>Subject</div>
              <div className="text-right">Result</div>
              <div className="text-right">Action</div>
            </div>

            {filteredTasks.map((task) => {
              const subject = subjectById(task.subjectId);
              const hasResult = Boolean(task.result);

              const resultDisplay = hasResult ? `${task.result!.score} / ${task.result!.outOf}` : "Pending";
              const percentDisplay = hasResult ? `${percentage(task.result!.score, task.result!.outOf)}%` : "";

              const termLabel =
                task.periodId && periodNameById.get(task.periodId)
                  ? periodNameById.get(task.periodId)
                  : task.periodId
                  ? task.periodId
                  : undefined;

              return (
                <div
                  key={task.id}
                  className="px-4 md:px-5 py-3 hover:bg-muted/10 transition"
                  style={{ borderLeft: `3px solid ${subject?.color ?? "transparent"}` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.4fr_0.9fr_0.6fr_0.5fr] gap-4 items-center">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{task.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        <span className="uppercase tracking-wide">{task.type}</span>
                        <span className="opacity-40">•</span>
                        <span>
                          Due{" "}
                          {task.dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {termLabel ? (
                          <>
                            <span className="opacity-40">•</span>
                            <span className="truncate">{termLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm text-foreground/90">
                      <span className="inline-flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: subject?.color ?? "transparent" }}
                        />
                        <span className="truncate">{subject?.name ?? "Unassigned"}</span>
                      </span>
                    </div>

                    <div className="md:text-right">
                      {hasResult ? (
                        <>
                          <div className="text-sm font-medium text-foreground">{resultDisplay}</div>
                          <div className="text-xs text-muted-foreground">{percentDisplay}</div>
                        </>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-dashed border-border bg-card/40 px-2.5 py-1 text-xs text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="md:text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          hasResult
                            ? "border border-border bg-card hover:bg-muted"
                            : "bg-primary text-primary-foreground hover:bg-primary/90",
                        ].join(" ")}
                      >
                        <Edit2 className="h-4 w-4" />
                        {hasResult ? "Edit" : "Enter"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit modal */}
      {editingTask ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeEdit} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">
                {editingTask.result ? "Edit result" : "Enter result"}
              </div>
              <div className="text-xs text-muted-foreground">{editingTask.title}</div>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Score"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Out of"
                  value={formData.outOf}
                  onChange={(e) => setFormData({ ...formData, outOf: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={saveResult}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
