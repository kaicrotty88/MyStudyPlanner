"use client";

import React, { useMemo, useState } from "react";
import { Edit2 } from "lucide-react";

import type { Task, Subject, Period } from "./models";

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

  /* -------------------- Derived data -------------------- */

  // ✅ ONLY assignments + exams
  const assessableTasks = useMemo(() => {
    return tasks.filter((t) => t.type === "assignment" || t.type === "exam");
  }, [tasks]);

  // Periods inferred from tasks
  const periods: Period[] = useMemo(() => {
    const map = new Map<string, Period>();
    for (const t of assessableTasks) {
      if (t.periodId) map.set(t.periodId, { id: t.periodId, name: t.periodId });
    }
    return Array.from(map.values());
  }, [assessableTasks]);

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
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Marks
        </h1>
        <p className="text-sm text-muted-foreground">
          Assignments and exams appear automatically. Add results when released.
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Subject filter */}
        <div className="rounded-2xl border border-border bg-card p-2 flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject("all")}
            className={[
              "px-4 py-2 rounded-full text-sm font-medium transition border",
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
                key={s.id}
                onClick={() => setSelectedSubject(s.id)}
                className={[
                  "px-4 py-2 rounded-full text-sm font-medium transition border",
                  active
                    ? "bg-muted/50 border-border"
                    : "bg-card border-border hover:bg-muted",
                ].join(" ")}
                style={{ boxShadow: active ? `0 0 0 2px ${s.color}33` : undefined }}
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  {s.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Period filter */}
        {periods.length > 0 && (
          <div className="rounded-2xl border border-border bg-card p-2 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedPeriod("all")}
              className={[
                "px-4 py-2 rounded-full text-sm font-medium transition border",
                selectedPeriod === "all"
                  ? "bg-muted text-foreground border-border"
                  : "bg-card border-border hover:bg-muted",
              ].join(" ")}
            >
              All periods
            </button>

            {periods.map((p) => {
              const active = selectedPeriod === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedPeriod(p.id)}
                  className={[
                    "px-4 py-2 rounded-full text-sm font-medium transition border",
                    active
                      ? "bg-muted/60 border-border"
                      : "bg-card border-border hover:bg-muted",
                  ].join(" ")}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Status strip */}
      <div className="text-xs text-muted-foreground">
        {recordedCount} recorded • {pendingCount} pending
      </div>

      {/* Record sheet */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center bg-background/40">
            <div className="text-sm font-medium text-foreground">
              No assessments
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Assignments and exams will appear here automatically.
            </div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredTasks.map((task) => {
              const subject = subjectById(task.subjectId);
              const hasResult = Boolean(task.result);

              return (
                <div
                  key={task.id}
                  className="px-4 py-3 hover:bg-muted/20 transition"
                  style={{
                    borderLeft: `3px solid ${subject?.color ?? "transparent"}`,
                  }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">
                        {task.title}
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground flex gap-2">
                        <span>{subject?.name}</span>
                        <span className="opacity-50">•</span>
                        <span className="uppercase">{task.type}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {hasResult ? (
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {task.result!.score} / {task.result!.outOf}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage(
                              task.result!.score,
                              task.result!.outOf
                            )}
                            %
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full border border-border bg-muted/20 text-muted-foreground">
                          Pending
                        </span>
                      )}

                      <button
                        onClick={() => openEdit(task)}
                        className={[
                          "inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          hasResult
                            ? "border border-border hover:bg-muted"
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
      {editingTask && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeEdit} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold">
                {editingTask.result ? "Edit result" : "Enter result"}
              </div>
              <div className="text-xs text-muted-foreground">
                {editingTask.title}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Score"
                  value={formData.score}
                  onChange={(e) =>
                    setFormData({ ...formData, score: e.target.value })
                  }
                  className="rounded-xl border border-border px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  placeholder="Out of"
                  value={formData.outOf}
                  onChange={(e) =>
                    setFormData({ ...formData, outOf: e.target.value })
                  }
                  className="rounded-xl border border-border px-4 py-2.5 text-sm"
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full rounded-xl border border-border px-4 py-2.5 text-sm resize-none"
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveResult}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Save
                </button>
                <button
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm hover:bg-muted"
                >
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
