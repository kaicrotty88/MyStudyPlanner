"use client";

import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

import type { Mark, Subject } from "./models";

interface MarksProps {
  marks: Mark[];
  subjects: Subject[];
  onAddMark: (mark: Omit<Mark, "id">) => void;
  onUpdateMark: (id: string, mark: Omit<Mark, "id">) => void;
  onDeleteMark: (id: string) => void;
}

export function Marks({
  marks,
  subjects,
  onAddMark,
  onUpdateMark,
  onDeleteMark,
}: MarksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    subjectId: "",
    score: "",
    outOf: "100",
    date: "",
    notes: "",
  });

  const subjectById = (id: string) => subjects.find((s) => s.id === id);

  const filteredMarks = useMemo(() => {
    const base = selectedSubject === "all"
      ? marks
      : marks.filter((m) => m.subjectId === selectedSubject);

    return [...base].sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [marks, selectedSubject]);

  const resetForm = () => {
    setFormData({
      title: "",
      subjectId: "",
      score: "",
      outOf: "100",
      date: "",
      notes: "",
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.subjectId || !formData.score || !formData.outOf || !formData.date)
      return;

    const payload: Omit<Mark, "id"> = {
      title: formData.title.trim(),
      subjectId: formData.subjectId,
      score: Number(formData.score),
      outOf: Number(formData.outOf),
      date: new Date(formData.date),
      notes: formData.notes.trim() || undefined,
    };

    if (editingId) onUpdateMark(editingId, payload);
    else onAddMark(payload);

    resetForm();
  };

  const handleEdit = (mark: Mark) => {
    setEditingId(mark.id);
    setFormData({
      title: mark.title,
      subjectId: mark.subjectId,
      score: String(mark.score),
      outOf: String(mark.outOf),
      date: mark.date.toISOString().split("T")[0],
      notes: mark.notes ?? "",
    });
    setShowForm(true);
  };

  const percentage = (m: Mark) =>
    m.outOf > 0 ? Math.round((m.score / m.outOf) * 100) : 0;

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-5">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Marks</h1>
        <p className="text-sm text-muted-foreground">
          Record and review assessment results across the year.
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
                active ? "bg-muted/50 border-border" : "bg-card border-border hover:bg-muted",
              ].join(" ")}
              style={{ boxShadow: active ? `0 0 0 2px ${s.color}33` : undefined }}
            >
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                {s.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
          type="button"
        >
          <Plus className="h-4 w-4" />
          Add mark
        </button>
      </div>

      {/* List */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5 space-y-3">
        {filteredMarks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background/40 p-10 text-center">
            <div className="text-sm font-medium text-foreground">No marks yet</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Add your first assessment result to get started.
            </div>
          </div>
        ) : (
          filteredMarks.map((m) => {
            const subject = subjectById(m.subjectId);
            return (
              <div
                key={m.id}
                className="group rounded-2xl border border-border bg-card px-4 py-3 shadow-sm hover:shadow-md transition"
                style={{ borderLeftWidth: 4, borderLeftColor: subject?.color }}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-foreground truncate">
                      {m.title}
                    </div>
                    <div className="mt-0.5 text-xs text-muted-foreground flex items-center gap-2">
                      <span>{subject?.name}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <span>
                        {m.date.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-medium text-foreground">
                        {m.score} / {m.outOf}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {percentage(m)}%
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleEdit(m)}
                        className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition"
                        aria-label="Edit"
                        type="button"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(m.id)}
                        className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition"
                        aria-label="Delete"
                        type="button"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit modal */}
      {showForm ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={resetForm} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">
                {editingId ? "Edit mark" : "Add mark"}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <input
                type="text"
                placeholder="Assessment title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
                autoFocus
              />

              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Score"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
                />
                <input
                  type="number"
                  placeholder="Out of"
                  value={formData.outOf}
                  onChange={(e) => setFormData({ ...formData, outOf: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
                />
              </div>

              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm"
              />

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm resize-none"
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleSubmit}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                  type="button"
                >
                  Save
                </button>
                <button
                  onClick={resetForm}
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

      {/* Delete confirm */}
      {deletingId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this mark?</div>
              <div className="text-xs text-muted-foreground mt-1">
                This action cannot be undone.
              </div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm hover:bg-muted transition"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteMark(deletingId);
                  setDeletingId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
                type="button"
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
