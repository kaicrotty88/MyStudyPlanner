"use client";
import React, { useState } from 'react';
import { Plus, X, Calendar, Edit2, Trash2 } from 'lucide-react';

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
  type: 'task' | 'assignment' | 'exam' | 'homework';
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

interface StudyPlannerProps {
  tasks: Task[];
  subjects: Subject[];
  studyItems: StudyItem[];
  onAddStudyItem: (item: Omit<StudyItem, 'id'>) => void;
  onUpdateStudyItem: (id: string, item: Omit<StudyItem, 'id'>) => void;
  onRemoveStudyItem: (id: string) => void;
}

export function StudyPlanner({
  tasks,
  subjects,
  studyItems,
  onAddStudyItem,
  onUpdateStudyItem,
  onRemoveStudyItem
}: StudyPlannerProps) {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHelperText, setShowHelperText] = useState(true);
  const [formData, setFormData] = useState({
    subjectId: '',
    topic: '',
    date: '',
    linkedTaskId: '',
    notes: '',
    showOnCalendar: false
  });

  const getSubjectById = (id: string) => subjects.find(s => s.id === id);

  const filteredStudyItems = activeTab === 'all'
    ? studyItems
    : studyItems.filter(item => item.subjectId === activeTab);

  const sortedStudyItems = [...filteredStudyItems].sort((a, b) => a.date.getTime() - b.date.getTime());

  const activeSubject = activeTab !== 'all' ? subjects.find((s) => s.id === activeTab) : null;
  const subjectTasks = activeTab !== 'all' ? tasks.filter((task) => task.subjectId === activeTab) : tasks;

  const getLinkedTask = (taskId?: string) => {
    if (!taskId) return null;
    return tasks.find((task) => task.id === taskId);
  };

  const handleSubmit = () => {
    if (formData.topic && formData.date && formData.subjectId) {
      if (editingId) {
        onUpdateStudyItem(editingId, {
          subjectId: formData.subjectId,
          topic: formData.topic,
          date: new Date(formData.date),
          linkedTaskId: formData.linkedTaskId || undefined,
          notes: formData.notes || undefined,
          showOnCalendar: formData.showOnCalendar
        });
        setEditingId(null);
      } else {
        onAddStudyItem({
          subjectId: formData.subjectId,
          topic: formData.topic,
          date: new Date(formData.date),
          linkedTaskId: formData.linkedTaskId || undefined,
          notes: formData.notes || undefined,
          showOnCalendar: formData.showOnCalendar
        });
      }
      setFormData({
        subjectId: '',
        topic: '',
        date: '',
        linkedTaskId: '',
        notes: '',
        showOnCalendar: false
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (item: StudyItem) => {
    setEditingId(item.id);
    setFormData({
      subjectId: item.subjectId,
      topic: item.topic,
      date: item.date.toISOString().split('T')[0],
      linkedTaskId: item.linkedTaskId || '',
      notes: item.notes || '',
      showOnCalendar: item.showOnCalendar
    });
    setShowAddForm(true);
  };

  const handleDelete = (id: string) => {
    onRemoveStudyItem(id);
    setDeletingId(null);
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingId(null);
    setFormData({
      subjectId: '',
      topic: '',
      date: '',
      linkedTaskId: '',
      notes: '',
      showOnCalendar: false
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-6 space-y-6">
      {/* Helper Text */}
      {showHelperText && (
        <div className="flex items-center justify-between bg-accent/20 rounded-lg px-4 py-3 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            Plan what you'll study on specific dates.
          </p>
          <button
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-foreground font-semibold">Study Planner</h1>
        <p className="text-muted-foreground text-sm opacity-80">Plan what you'll study, organized by subject</p>
      </div>

      {/* Subject Tabs */}
      <div className="flex gap-2 border-b border-border overflow-x-auto">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-6 py-3 transition-colors border-b-2 whitespace-nowrap font-medium ${
            activeTab === 'all'
              ? 'border-primary bg-primary/10 text-primary'
              : 'border-transparent text-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setActiveTab(subject.id)}
            className={`px-6 py-3 transition-all border-b-2 whitespace-nowrap text-white ${
              activeTab === subject.id
                ? 'font-semibold'
                : 'font-medium opacity-90 hover:opacity-100'
            }`}
            style={{
              backgroundColor: subject.color + (activeTab === subject.id ? '' : 'DD'),
              borderBottomColor: activeTab === subject.id ? subject.color : 'transparent'
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Add Study Item Button */}
        <div className="flex justify-end">
          <button
            onClick={() => {
              setShowAddForm(!showAddForm);
              setEditingId(null);
              setFormData({
                subjectId: activeTab !== 'all' ? activeTab : '',
                topic: '',
                date: '',
                linkedTaskId: '',
                notes: '',
                showOnCalendar: false
              });
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium ${
              activeSubject ? '' : 'bg-primary'
            }`}
            style={activeSubject ? { backgroundColor: activeSubject.color } : undefined}
          >
            <Plus className="w-4 h-4" />
            Add study item
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-card rounded-lg p-5 shadow-sm border border-border space-y-4">
            <div className="text-foreground font-medium">
              {editingId ? 'Edit study item' : 'New study item'}
            </div>
            
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Topic or description"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Link to Task */}
            <select
              value={formData.linkedTaskId}
              onChange={(e) => setFormData({ ...formData, linkedTaskId: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Link to task (optional)</option>
              {subjectTasks
                .filter(t => t.subjectId === formData.subjectId)
                .map((task) => (
                  <option key={task.id} value={task.id}>
                    {task.title}
                  </option>
                ))}
            </select>

            {/* Notes */}
            <textarea
              placeholder="Notes (optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />

            {/* Show on Calendar */}
            <label className="flex items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                checked={formData.showOnCalendar}
                onChange={(e) => setFormData({ ...formData, showOnCalendar: e.target.checked })}
                className="rounded border-border"
              />
              Show on calendar
            </label>

            {/* Form Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                className={`px-4 py-2 rounded-lg text-white hover:opacity-90 transition-opacity font-medium ${
                  activeSubject ? '' : 'bg-primary'
                }`}
                style={activeSubject ? { backgroundColor: activeSubject.color } : undefined}
              >
                {editingId ? 'Save' : 'Add'}
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

        {/* Study Items List */}
        <div className="space-y-3">
          {sortedStudyItems.length > 0 ? (
            sortedStudyItems.map((item) => {
              const linkedTask = getLinkedTask(item.linkedTaskId);
              const itemSubject = getSubjectById(item.subjectId);
              
              return (
                <div key={item.id}>
                  <div className="bg-card rounded-lg p-4 shadow-sm border border-border group hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        {/* Topic with subject pill */}
                        <div className="flex items-start gap-2">
                          <div className="text-foreground font-medium">{item.topic}</div>
                          {itemSubject && activeTab === 'all' && (
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0"
                              style={{ backgroundColor: itemSubject.color }}
                            >
                              {itemSubject.name}
                            </span>
                          )}
                        </div>

                        {/* Date */}
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {item.date.toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>

                        {/* Linked Task */}
                        {linkedTask && (
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span>→</span>
                            <span>{linkedTask.title}</span>
                          </div>
                        )}

                        {/* Notes */}
                        {item.notes && (
                          <div className="text-sm text-muted-foreground italic opacity-80">
                            {item.notes}
                          </div>
                        )}

                        {/* Show on Calendar Indicator */}
                        {item.showOnCalendar && (
                          <div className="text-xs text-muted-foreground opacity-70">
                            📅 Visible on calendar
                          </div>
                        )}
                      </div>

                      {/* Edit/Delete Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-1.5 hover:bg-muted rounded"
                          aria-label="Edit"
                        >
                          <Edit2 className="w-4 h-4 text-foreground" />
                        </button>
                        <button
                          onClick={() => setDeletingId(item.id)}
                          className="p-1.5 hover:bg-muted rounded"
                          aria-label="Delete"
                        >
                          <Trash2 className="w-4 h-4 text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {deletingId === item.id && (
                    <>
                      <div
                        className="fixed inset-0 bg-black/50 z-40"
                        onClick={() => setDeletingId(null)}
                      />
                      <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-sm">
                        <h3 className="text-foreground font-semibold mb-2">Delete this item?</h3>
                        <p className="text-sm text-muted-foreground opacity-80 mb-4">
                          This action cannot be undone.
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setDeletingId(null)}
                            className="px-4 py-2 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
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
            })
          ) : (
            <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
              <p className="text-muted-foreground text-sm text-center opacity-80">
                {activeTab === 'all' ? 'No study items yet' : `No study items planned for ${activeSubject?.name} yet`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}