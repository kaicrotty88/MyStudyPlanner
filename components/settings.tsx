"use client";
import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2, Trash, ChevronDown, ChevronUp } from "lucide-react";
import { UserProfile } from "@clerk/nextjs";

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

  // Clear/reset confirm modal
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Subjects collapsible (default collapsed)
  const [subjectsOpen, setSubjectsOpen] = useState(false);

  // ✅ Account manager collapsible (default collapsed)
  const [accountOpen, setAccountOpen] = useState(false);

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

      {/* ✅ Account manager (collapsible, default CLOSED) */}
      <div className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
        <button
          type="button"
          onClick={() => setAccountOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/40 transition-colors"
        >
          <div className="text-left">
            <div className="text-foreground font-medium">Manage account</div>
            <div className="text-muted-foreground text-sm">
              Email, password, security, connected accounts, sign out.
            </div>
          </div>

          {accountOpen ? (
            <ChevronUp className="w-5 h-5 text-muted-foreground" />
          ) : (
            <ChevronDown className="w-5 h-5 text-muted-foreground" />
          )}
        </button>

        {accountOpen && (
          <div className="px-5 pb-5">
            <div className="rounded-lg border border-border bg-background/40 p-3">
              <UserProfile
                routing="virtual"
                appearance={{
                  variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorText: "hsl(var(--foreground))",
                    colorTextSecondary: "hsl(var(--muted-foreground))",
                    colorBackground: "hsl(var(--card))",
                    colorInputBackground: "hsl(var(--input-background))",
                    colorNeutral: "hsl(var(--border))",
                    borderRadius: "12px",
                    fontFamily: "inherit",
                  },
                  elements: {
                    card: "shadow-none border border-border bg-card",
                    navbar: "bg-card border-r border-border",
                    headerTitle: "text-foreground",
                    headerSubtitle: "text-muted-foreground",
                    profileSectionTitle: "text-foreground",
                    profileSectionContent: "text-foreground",
                    formFieldLabel: "text-foreground",
                    formFieldInput:
                      "bg-input-background border-border text-foreground focus:ring-2 focus:ring-primary",
                    button:
                      "bg-primary text-primary-foreground hover:bg-primary/90 transition-colors",
                    badge: "border border-border",
                  },
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Subjects (collapsible, default collapsed) */}
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
        )}
      </div>

      {/* Clear all data */}
      <div className="bg-card rounded-lg p-5 shadow-sm border border-border flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="text-foreground font-medium">Clear all data</div>
          <div className="text-muted-foreground text-sm">
            {appMode === "demo" ? "Start over with the sample data." : "Clear everything and start fresh."}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowClearConfirm(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition"
        >
          <Trash className="w-4 h-4" />
          {clearButtonLabel}
        </button>
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

      {/* Clear/Reset Confirmation Modal */}
      {showClearConfirm && (
        <>
          <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowClearConfirm(false)} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6">
            <h3 className="text-foreground font-semibold mb-2">{clearTitle}</h3>

            <p className="text-sm text-muted-foreground opacity-80 mb-4">{clearBody}</p>

            <p className="text-sm text-muted-foreground opacity-80 mb-4">
              {appMode === "demo" ? "You can keep exploring after reset." : "This action cannot be undone."}
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClear}
                className="px-4 py-2 text-sm rounded-lg bg-destructive text-destructive-foreground hover:opacity-90 transition font-medium"
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
