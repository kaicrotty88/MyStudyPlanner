"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Pencil, Trash2, X, Bell, CheckCircle2, Circle, ChevronDown, ChevronRight } from "lucide-react";
import type { Reminder } from "./models";

type Repeat = "none" | "daily" | "weekly";

interface RemindersProps {
  reminders: Reminder[];
  onAddReminder: (r: Omit<Reminder, "id">) => void;
  onUpdateReminder: (id: string, r: Omit<Reminder, "id">) => void;
  onDeleteReminder: (id: string) => void;
  onToggleCompleted: (id: string) => void;
}

/* -------------------- helpers -------------------- */

const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

const daysUntil = (due: Date, from: Date) =>
  Math.ceil((startOfDay(due).getTime() - startOfDay(from).getTime()) / (1000 * 60 * 60 * 24));

function dueLabel(d: number) {
  if (d < 0) return `${Math.abs(d)}d late`;
  if (d === 0) return "Today";
  if (d === 1) return "Tomorrow";
  return `In ${d}d`;
}

function safeTimeLabel(t?: string) {
  if (!t) return "";
  // "HH:MM" -> "h:mm AM/PM"
  const [hh, mm] = t.split(":").map((x) => Number(x));
  if (Number.isNaN(hh) || Number.isNaN(mm)) return "";
  const ampm = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${ampm}`;
}

/* -------------------- component -------------------- */

export function Reminders({
  reminders,
  onAddReminder,
  onUpdateReminder,
  onDeleteReminder,
  onToggleCompleted,
}: RemindersProps) {
  const today = useMemo(() => new Date(), []);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [showCompleted, setShowCompleted] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    notes: string;
    dueDate: string; // YYYY-MM-DD
    hasDate: boolean;
    time: string; // HH:MM
    repeat: Repeat;
  }>({
    title: "",
    notes: "",
    dueDate: toLocalDateInputValue(today),
    hasDate: true,
    time: "",
    repeat: "none",
  });

  const modalRef = useRef<HTMLDivElement>(null);

  // keyboard escape
  useEffect(() => {
    if (!showModal && !deletingId) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setShowModal(false);
        setDeletingId(null);
        setEditingId(null);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showModal, deletingId]);

  const active = useMemo(() => {
    const list = reminders.filter((r) => !r.completed);

    // order:
    // 1) dated before undated
    // 2) soonest date first
    // 3) title
    list.sort((a, b) => {
      const ad = a.dueDate ? 0 : 1;
      const bd = b.dueDate ? 0 : 1;
      if (ad !== bd) return ad - bd;

      const at = a.dueDate ? startOfDay(a.dueDate).getTime() : Number.POSITIVE_INFINITY;
      const bt = b.dueDate ? startOfDay(b.dueDate).getTime() : Number.POSITIVE_INFINITY;
      if (at !== bt) return at - bt;

      return (a.title || "").localeCompare(b.title || "");
    });

    return list;
  }, [reminders]);

  const completed = useMemo(() => {
    const list = reminders.filter((r) => r.completed);

    // most recently completed first (fallback to createdAt)
    list.sort((a, b) => {
      const at = a.completedAt ? a.completedAt.getTime() : a.createdAt ? a.createdAt.getTime() : 0;
      const bt = b.completedAt ? b.completedAt.getTime() : b.createdAt ? b.createdAt.getTime() : 0;
      return bt - at;
    });

    return list;
  }, [reminders]);

  const dueSoonCount = useMemo(() => {
    return reminders.filter((r) => {
      if (r.completed) return false;
      if (!r.dueDate) return false;
      const d = daysUntil(r.dueDate, today);
      return d >= 0 && d <= 7;
    }).length;
  }, [reminders, today]);

  const overdueCount = useMemo(() => {
    return reminders.filter((r) => {
      if (r.completed) return false;
      if (!r.dueDate) return false;
      const d = daysUntil(r.dueDate, today);
      return d < 0;
    }).length;
  }, [reminders, today]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      title: "",
      notes: "",
      dueDate: toLocalDateInputValue(today),
      hasDate: true,
      time: "",
      repeat: "none",
    });
    setShowModal(true);
  };

  const openEdit = (r: Reminder) => {
    setEditingId(r.id);
    setForm({
      title: r.title ?? "",
      notes: r.notes ?? "",
      dueDate: r.dueDate ? toLocalDateInputValue(r.dueDate) : toLocalDateInputValue(today),
      hasDate: Boolean(r.dueDate),
      time: r.time ?? "",
      repeat: (r.repeat ?? "none") as Repeat,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
  };

  const submit = () => {
    const title = form.title.trim();
    if (!title) return;

    const existing = editingId ? reminders.find((x) => x.id === editingId) : undefined;

    const payload: Omit<Reminder, "id"> = {
      title,
      notes: form.notes.trim() ? form.notes.trim() : undefined,
      dueDate: form.hasDate ? new Date(form.dueDate) : undefined,
      time: form.time.trim() ? form.time.trim() : undefined,
      repeat: form.repeat,
      completed: existing?.completed ?? false,
      completedAt: existing?.completedAt,
      createdAt: existing?.createdAt ?? new Date(),
    };

    if (editingId) onUpdateReminder(editingId, payload);
    else onAddReminder(payload);

    closeModal();
    setForm({
      title: "",
      notes: "",
      dueDate: toLocalDateInputValue(today),
      hasDate: true,
      time: "",
      repeat: "none",
    });
  };

  const deleting = useMemo(() => reminders.find((r) => r.id === deletingId) || null, [reminders, deletingId]);

  const confirmDelete = () => {
    if (!deletingId) return;
    onDeleteReminder(deletingId);
    setDeletingId(null);
  };

  const clearCompleted = () => {
    completed.forEach((r) => onDeleteReminder(r.id));
  };

  const RepeatPill = ({ value, label }: { value: Repeat; label: string }) => (
    <button
      type="button"
      onClick={() => setForm((p) => ({ ...p, repeat: value }))}
      className={[
        "px-3 py-1.5 rounded-full text-sm transition",
        form.repeat === value
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted border border-border bg-card",
      ].join(" ")}
    >
      {label}
    </button>
  );

  const Row = ({ r }: { r: Reminder }) => {
    const hasDate = Boolean(r.dueDate);
    const d = hasDate && r.dueDate ? daysUntil(r.dueDate, today) : null;
    const isLate = typeof d === "number" ? d < 0 : false;

    const dateLabel = hasDate && r.dueDate
      ? r.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : "No date";

    const rightLabel = hasDate && typeof d === "number" ? dueLabel(d) : "";

    return (
      <div
        key={r.id}
        className={[
          "group px-4 py-3 hover:bg-muted/10 transition flex items-start justify-between gap-3",
          r.completed ? "opacity-70" : "",
        ].join(" ")}
      >
        <button
          type="button"
          onClick={() => onToggleCompleted(r.id)}
          className="mt-0.5 h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          aria-label={r.completed ? "Mark as not done" : "Mark as done"}
          title={r.completed ? "Mark as not done" : "Mark as done"}
        >
          {r.completed ? (
            <CheckCircle2 className="h-5 w-5 text-primary" />
          ) : (
            <Circle className="h-5 w-5 text-muted-foreground" />
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{r.title}</div>

              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  {dateLabel}
                </span>

                {r.time ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span>{safeTimeLabel(r.time)}</span>
                  </>
                ) : null}

                {r.repeat && r.repeat !== "none" ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="capitalize">{r.repeat}</span>
                  </>
                ) : null}

                {r.notes ? (
                  <>
                    <span className="text-muted-foreground/60">•</span>
                    <span className="truncate">{r.notes}</span>
                  </>
                ) : null}
              </div>
            </div>

            <div className="shrink-0 text-right">
              {rightLabel ? (
                <div className={["text-xs font-semibold", isLate ? "text-destructive" : "text-foreground"].join(" ")}>
                  {rightLabel}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground"> </div>
              )}

              <div className="mt-1 text-xs text-muted-foreground">
                {hasDate && r.dueDate && isSameDay(r.dueDate, today) ? "Today" : ""}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
          <button
            type="button"
            onClick={() => openEdit(r)}
            className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Edit"
          >
            <Pencil className="h-4 w-4 text-foreground" />
          </button>
          <button
            type="button"
            onClick={() => setDeletingId(r.id)}
            className="h-9 w-9 grid place-items-center rounded-xl hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-6 md:px-10 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Reminders</h1>
          <p className="text-sm text-muted-foreground">Quick notes for life stuff — not assignments.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Due soon <span className="ml-1 text-foreground font-medium">{dueSoonCount}</span>
          </div>
          <div className="rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground">
            Overdue <span className="ml-1 text-foreground font-medium">{overdueCount}</span>
          </div>

          <button
            type="button"
            onClick={openNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <Plus className="h-4 w-4" />
            Add reminder
          </button>
        </div>
      </div>

      {/* List shell */}
      <div className="rounded-2xl border border-border bg-muted/20 p-4 md:p-5">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-xs font-medium text-muted-foreground">Reminders</div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          {active.length === 0 && completed.length === 0 ? (
            <div className="p-10 text-center">
              <div className="mx-auto h-12 w-12 rounded-2xl border border-border bg-muted/30 grid place-items-center">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-4 text-sm font-medium text-foreground">Nothing here yet</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Add a reminder for anything you don’t want to forget.
              </div>
              <button
                type="button"
                onClick={openNew}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                Add reminder
              </button>
            </div>
          ) : (
            <>
              {/* Active */}
              {active.length > 0 ? (
                <div className="divide-y divide-border">
                  {active.map((r) => (
                    <Row key={r.id} r={r} />
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center border-b border-border">
                  <div className="text-sm font-medium text-foreground">All caught up</div>
                  <div className="mt-1 text-xs text-muted-foreground">No active reminders right now.</div>
                </div>
              )}

              {/* Completed (collapsed) */}
              <div className="border-t border-border bg-muted/10">
                <button
                  type="button"
                  onClick={() => setShowCompleted((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/20 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  <div className="flex items-center gap-2">
                    {showCompleted ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="text-foreground font-medium">Completed</span>
                    <span className="text-xs text-muted-foreground">({completed.length})</span>
                  </div>

                  {completed.length > 0 ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearCompleted();
                      }}
                      className="inline-flex items-center rounded-lg border border-border bg-card px-2.5 py-1 text-xs text-muted-foreground hover:bg-muted transition"
                      title="Delete all completed reminders"
                    >
                      Clear completed
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground"> </span>
                  )}
                </button>

                {showCompleted ? (
                  completed.length === 0 ? (
                    <div className="px-4 pb-4 text-xs text-muted-foreground">Nothing completed yet.</div>
                  ) : (
                    <div className="divide-y divide-border">
                      {completed.map((r) => (
                        <Row key={r.id} r={r} />
                      ))}
                    </div>
                  )
                ) : null}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeModal} />
          <div
            ref={modalRef}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">{editingId ? "Edit reminder" : "New reminder"}</div>
                <div className="text-xs text-muted-foreground">Keep it short. You’ll actually read it.</div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <input
                type="text"
                placeholder="Title (e.g. Bring sports uniform)"
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                autoFocus
              />

              <textarea
                placeholder="Notes (optional)"
                value={form.notes}
                onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                className="w-full min-h-[88px] resize-none rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              />

              <div className="rounded-2xl border border-border bg-muted/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-medium text-muted-foreground">Schedule</div>

                  <label className="inline-flex items-center gap-2 text-xs text-muted-foreground select-none">
                    <input
                      type="checkbox"
                      checked={form.hasDate}
                      onChange={(e) => setForm((p) => ({ ...p, hasDate: e.target.checked }))}
                      className="h-4 w-4 rounded border-border"
                    />
                    Has date
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Date</label>
                    <input
                      type="date"
                      disabled={!form.hasDate}
                      value={form.dueDate}
                      onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))}
                      className={[
                        "w-full rounded-xl border border-border px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        form.hasDate ? "bg-input-background" : "bg-muted/40 text-muted-foreground cursor-not-allowed",
                      ].join(" ")}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Time (optional)</label>
                    <input
                      type="time"
                      value={form.time}
                      onChange={(e) => setForm((p) => ({ ...p, time: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Repeat</div>
                  <div className="flex flex-wrap gap-2">
                    <RepeatPill value="none" label="None" />
                    <RepeatPill value="daily" label="Daily" />
                    <RepeatPill value="weekly" label="Weekly" />
                  </div>
                </div>

                {form.hasDate ? (
                  <div className="text-[11px] text-muted-foreground">
                    Tip: Use reminders for real-life stuff. Tasks/Assignments belong in Tasks.
                  </div>
                ) : null}
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={submit}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  {editingId ? "Save" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {/* Delete confirm modal */}
      {deleting ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this reminder?</div>
              <div className="text-xs text-muted-foreground mt-1">“{deleting.title}”</div>
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
                onClick={confirmDelete}
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
