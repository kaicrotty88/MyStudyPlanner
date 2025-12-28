"use client";
import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";

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

interface SettingsProps {
  subjects: Subject[];

  // NEW: for delete-confirm counts
  tasks: Task[];
  studyItems: StudyItem[];
  studySessions: StudySession[];

  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
}

export function Settings({
  subjects,
  tasks,
  studyItems,
  studySessions,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
}: SettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingSubjectId, setDeletingSubjectId] = useState<string | null>(null);

  const [formData, setFormData] = useState({ name: "", color: "#7A9B7F" });

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
    if (formData.name && formData.color) {
      if (editingId) {
        onUpdateSubject(editingId, formData.name, formData.color);
        setEditingId(null);
      } else {
        onAddSubject(formData.name, formData.color);
        setShowAddForm(false);
      }
      setFormData({ name: "", color: "#7A9B7F" });
    }
  };

  const handleEdit = (subject: Subject) => {
    setEditingId(subject.id);
    setFormData({ name: subject.name, color: subject.color });
    setShowAddForm(false);
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

  return (
    <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground">Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your subjects and preferences</p>
      </div>

      {/* Subjects Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-foreground">Subjects</h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Subject
          </button>
        </div>

        {/* Add/Edit Form */}
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
                      formData.color === color ? "ring-2 ring-primary scale-110" : "hover:scale-105"
                    }`}
                    style={{ backgroundColor: color }}
                    aria-label={`Select color ${color}`}
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
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                {editingId ? "Save" : "Add"}
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Subjects List */}
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center justify-between group hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg" style={{ backgroundColor: subject.color }} />
                <div>
                  <div className="text-foreground">{subject.name}</div>
                  <div className="text-xs text-muted-foreground">{subject.color}</div>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Edit subject"
                >
                  <Edit2 className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => setDeletingSubjectId(subject.id)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Delete subject"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {subjects.length === 0 && (
          <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
            <p className="text-muted-foreground text-sm text-center">
              No subjects yet. Add your first subject to get started.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingSubject && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeletingSubjectId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6">
            <h3 className="text-foreground font-semibold mb-2">Delete “{deletingSubject.name}”?</h3>

            <p className="text-sm text-muted-foreground opacity-80 mb-4">
              This will permanently delete:
              <span className="block mt-2">
                • {deleteCounts.tasks} task(s) / assignment(s) / exam(s) / homework item(s)
              </span>
              <span className="block">• {deleteCounts.items} study item(s)</span>
              <span className="block">• {deleteCounts.sessions} study session(s)</span>
            </p>

            <p className="text-sm text-muted-foreground opacity-80 mb-4">This action cannot be undone.</p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeletingSubjectId(null)}
                className="px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm rounded-lg bg-muted-foreground text-white hover:bg-muted-foreground/90 transition-colors font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
