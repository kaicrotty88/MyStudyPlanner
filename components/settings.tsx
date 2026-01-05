"use client";
import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Trash, ChevronDown, ChevronUp } from "lucide-react";

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
  const [subjectsOpen, setSubjectsOpen] = useState(true);

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

  const handleConfirmClear = () => {
    onClearAllData();
    setShowClearConfirm(false);
  };

  const clearTitle = appMode === "demo" ? "Reset demo data?" : "Clear all data?";
  const clearBody =
    appMode === "demo"
      ? "This will reset the demo back to the original sample subjects, tasks, and sessions."
      : "This will permanently delete all your subjects, tasks, and study sessions from this device.";

  const clearButtonLabel = appMode === "demo" ? "Reset demo" : "Clear all data";

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
            className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
          >
            <div className="text-left">
              <div className="text-sm font-semibold text-foreground">Subjects</div>
              <div className="text-xs text-muted-foreground">Add, edit, and organise your subjects.</div>
            </div>

            {subjectsOpen ? (
              <ChevronUp className="w-5 h-5 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-5 h-5 text-muted-foreground" />
            )}
          </button>

          {subjectsOpen && (
            <div className="px-5 pb-5 space-y-4">
              <div className="flex items-center justify-end">
                <button
                  type="button"
                  onClick={() => {
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

              <div className="text-[11px] text-muted-foreground">
                This action cannot be undone.
              </div>
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
