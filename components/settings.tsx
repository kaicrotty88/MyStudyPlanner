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
  const [subjectsOpen, setSubjectsOpen] = useState(false);

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
      onUpdateSubject(editingId, formData.name, formData.color);
      setEditingId(null);
    } else {
      onAddSubject(formData.name, formData.color);
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
    <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your subjects and preferences</p>
      </div>

      {/* Subjects */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setSubjectsOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
        >
          <div className="text-left">
            <div className="text-foreground font-medium">Subjects</div>
            <div className="text-muted-foreground text-sm">
              Add, edit, and organise your subjects.
            </div>
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
                onClick={() => {
                  setShowAddForm(true);
                  setEditingId(null);
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Subject
              </button>
            </div>

            {(showAddForm || editingId) && (
              <div className="bg-card rounded-lg p-5 shadow-sm border border-border space-y-4">
                <h3 className="text-foreground">{editingId ? "Edit Subject" : "New Subject"}</h3>

                <input
                  type="text"
                  placeholder="Subject name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="space-y-2">
                  <label className="text-sm text-foreground">Choose a color</label>
                  <div className="grid grid-cols-8 gap-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color}
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-10 h-10 rounded-lg transition-transform ${
                          formData.color === color
                            ? "ring-2 ring-primary scale-110"
                            : "hover:scale-105"
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full h-10 rounded-lg border border-border cursor-pointer"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground"
                  >
                    {editingId ? "Save" : "Add"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-muted text-foreground"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {subjects.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg"
                      style={{ backgroundColor: subject.color }}
                    />
                    <div>
                      <div className="text-foreground">{subject.name}</div>
                      <div className="text-xs text-muted-foreground">{subject.color}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                    <button onClick={() => handleEdit(subject)} className="p-2 hover:bg-muted rounded-lg">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeletingSubjectId(subject.id)}
                      className="p-2 hover:bg-muted rounded-lg"
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

      {/* Clear all data */}
      <div className="bg-card rounded-lg p-5 shadow-sm border border-border flex items-center justify-between">
        <div>
          <div className="text-foreground font-medium">Clear all data</div>
          <div className="text-muted-foreground text-sm">
            {appMode === "demo"
              ? "Start over with the sample data."
              : "Clear everything and start fresh."}
          </div>
        </div>

        <button
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground"
        >
          <Trash className="w-4 h-4" />
          {clearButtonLabel}
        </button>
      </div>

      {/* Contact */}
      <div className="pt-6 text-center text-xs text-muted-foreground">
        Need help? Contact us at{" "}
        <a
          href="mailto:mystudyplanner.studio@gmail.com"
          className="underline hover:text-foreground transition-colors"
        >
          mystudyplanner.studio@gmail.com
        </a>
      </div>

      {/* Modals */}
      {deletingSubject && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">
              Delete “{deletingSubject.name}”?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeletingSubjectId(null)}
                className="px-4 py-2 bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-muted-foreground text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {showClearConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card p-6 border rounded-lg">
            <h3 className="font-semibold mb-2">{clearTitle}</h3>
            <p className="text-sm text-muted-foreground mb-4">{clearBody}</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 bg-muted rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg"
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
