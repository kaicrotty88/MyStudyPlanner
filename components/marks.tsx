"use client";

import React, { useMemo, useState } from "react";
import { Edit2 } from "lucide-react";

import type { Task, Subject } from "./models";

interface MarksProps {
  tasks: Task[];
  subjects: Subject[];
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
}

export function Marks({ tasks, subjects, onUpdateTask }: MarksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    score: "",
    outOf: "100",
    notes: "",
  });

  /* -------------------- Derived data -------------------- */

  const assessableTasks = useMemo(() => {
    return tasks.filter(
      (t) => t.type === "assignment" || t.type === "exam"
    );
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    const base =
      selectedSubject === "all"
        ? assessableTasks
        : assessableTasks.filter((t) => t.subjectId === selectedSubject);

    return [...base].sort((a, b) => b.dueDate.getTime() - a.dueDate.getTime());
  }, [assessableTasks, selectedSubject]);

  const subjectById = (id: string) =>
    subjects.find((s) => s.id === id);

  const percentage = (score: number, outOf: number) =>
    outOf > 0 ? Math.round((score / outOf) * 100) : 0;

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
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Marks
        </h1>
        <p className="text-sm text-muted-foreground">
          Results from assignments and exams are recorded here automatically.
        </p>
      </div>

      {/* Subject filter */}
      <div className="rounded-2xl border border-border bg-card p-2 flex flex-wrap gap-2">
        <button
          type="button"
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
              type="button"
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

      {/* List */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center">
            <div className="text-sm font-medium text-foreground">
              No assessments
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              Assignments and exams will appear here automatically.
            </div>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const subject = subjectById(task.subjectId);
            const hasResult = Boolean(task.result);

            return (
              <div
                key={task.id}
                className="group rounded-2xl border border-border bg-card px-4 py-3 shadow-sm hover:shadow-md transition"
                style={{
                  borderLeftWidth: 4,
                  borderLeftColor: subject?.color,
                }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {task.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2">
                      <span>{subject?.name}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span className="uppercase">{task.type}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    {hasResult ? (
                      <div className="text-right">
                        <div className="text-sm font-medium text-foreground">
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
                      <span className="text-xs px-3 py-1 rounded-full border border-dashed border-border text-muted-foreground">
                        Awaiting result
                      </span>
                    )}

                    <button
                      onClick={() => openEdit(task)}
                      className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition opacity-0 group-hover:opacity-100"
                      aria-label="Edit result"
                      type="button"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit result modal */}
      {editingTask ? (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={closeEdit}
          />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">
                Enter result
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
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  placeholder="Out of"
                  value={formData.outOf}
                  onChange={(e) =>
                    setFormData({ ...formData, outOf: e.target.value })
                  }
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
                />
              </div>

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm resize-none"
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={saveResult}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                  type="button"
                >
                  Save
                </button>
                <button
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm hover:bg-muted transition"
                  type="button"
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
