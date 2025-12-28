"use client";

import React, { useState } from 'react';
import { Plus, Calendar, ChevronDown, ChevronUp, Edit2, Trash2 } from 'lucide-react';

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

interface TasksProps {
  tasks: Task[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (id: string, task: Omit<Task, 'id'>) => void;
  onDeleteTask: (id: string) => void;
}

export function Tasks({ tasks, subjects, onAddTask, onUpdateTask, onDeleteTask }: TasksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [expandedSections, setExpandedSections] = useState({
    task: true,
    assignment: true,
    exam: true,
    homework: true
  });
  const [showAddForm, setShowAddForm] = useState<'task' | 'assignment' | 'exam' | 'homework' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showHelperText, setShowHelperText] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    subjectId: '',
    dueDate: ''
  });

  const toggleSection = (section: 'task' | 'assignment' | 'exam' | 'homework') => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredTasks =
    selectedSubject === 'all'
      ? tasks
      : tasks.filter((task) => task.subjectId === selectedSubject);

  const tasksByType = {
    homework: filteredTasks.filter((t) => t.type === 'homework'),
    task: filteredTasks.filter((t) => t.type === 'task'),
    assignment: filteredTasks.filter((t) => t.type === 'assignment'),
    exam: filteredTasks.filter((t) => t.type === 'exam')
  };

  const getDaysLeft = (dueDate: Date) => {
    const today = new Date();
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  // Get most common subject color for section accents
  const getSectionAccentColor = (taskList: Task[]) => {
    if (selectedSubject !== 'all') {
      return getSubjectById(selectedSubject)?.color || '#7A9B7F';
    }
    if (taskList.length === 0) return '#7A9B7F';
    
    const subjectCounts: { [key: string]: number } = {};
    taskList.forEach(task => {
      subjectCounts[task.subjectId] = (subjectCounts[task.subjectId] || 0) + 1;
    });
    
    const mostCommonSubjectId = Object.keys(subjectCounts).reduce((a, b) => 
      subjectCounts[a] > subjectCounts[b] ? a : b
    );
    
    return getSubjectById(mostCommonSubjectId)?.color || '#7A9B7F';
  };

  const handleSubmit = (type: 'task' | 'assignment' | 'exam' | 'homework') => {
    if (formData.title && formData.subjectId && formData.dueDate) {
      if (editingId) {
        onUpdateTask(editingId, {
          title: formData.title,
          subjectId: formData.subjectId,
          dueDate: new Date(formData.dueDate),
          type
        });
        setEditingId(null);
      } else {
        onAddTask({
          title: formData.title,
          subjectId: formData.subjectId,
          dueDate: new Date(formData.dueDate),
          type
        });
      }
      setFormData({ title: '', subjectId: '', dueDate: '' });
      setShowAddForm(null);
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setFormData({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: task.dueDate.toISOString().split('T')[0]
    });
    setShowAddForm(task.type);
  };

  const handleDelete = (id: string) => {
    onDeleteTask(id);
    setDeletingId(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setEditingId(null);
    setFormData({ title: '', subjectId: '', dueDate: '' });
  };

  const renderTaskList = (taskList: Task[], type: 'task' | 'assignment' | 'exam' | 'homework') => {
    const typeLabel = type.charAt(0).toUpperCase() + type.slice(1) + 's';
    const sortedTasks = [...taskList].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    const isExpanded = expandedSections[type];
    const accentColor = getSectionAccentColor(taskList);

    return (
      <div className="space-y-2">
        {/* Section Header */}
        <div 
          className="flex items-center justify-between bg-muted/50 rounded-lg p-3 border-l-4"
          style={{ borderLeftColor: accentColor }}
        >
          <button
            onClick={() => toggleSection(type)}
            className="flex items-center gap-2 flex-1 text-left"
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="w-4 h-4 text-muted-foreground" />
            )}
            <h3 className="text-foreground font-semibold">
              {typeLabel}
            </h3>
            <span className="text-muted-foreground text-sm opacity-80">({sortedTasks.length})</span>
          </button>
          <button
            onClick={() => {
              setShowAddForm(showAddForm === type ? null : type);
              setEditingId(null);
              setFormData({ title: '', subjectId: '', dueDate: '' });
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            Add
          </button>
        </div>

        {/* Add/Edit Form */}
        {showAddForm === type && isExpanded && (
          <div className="bg-card rounded-lg p-4 shadow-sm border border-border space-y-3">
            <div className="text-sm text-foreground font-medium">
              {editingId ? `Edit ${type}` : `New ${type}`}
            </div>
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select subject</option>
              {subjects.map((subject) => (
                <option key={subject.id} value={subject.id}>
                  {subject.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="flex gap-2">
              <button
                onClick={() => handleSubmit(type)}
                className="px-3 py-1.5 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                {editingId ? 'Save' : 'Add'}
              </button>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 text-sm rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Task Items - Compact rows */}
        {isExpanded && (
          <div className="space-y-1">
            {sortedTasks.length > 0 ? (
              sortedTasks.map((task) => {
                const daysLeft = getDaysLeft(task.dueDate);
                const isOverdue = daysLeft < 0;
                const isToday = daysLeft === 0;
                const subject = getSubjectById(task.subjectId);

                return (
                  <div key={task.id}>
                    <div className="bg-card rounded-lg px-4 py-2.5 shadow-sm border border-border hover:shadow-md transition-shadow group">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <div className="text-foreground text-sm font-medium truncate">{task.title}</div>
                          </div>
                          {subject && (
                            <span
                              className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0"
                              style={{ backgroundColor: subject.color }}
                            >
                              {subject.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs shrink-0">
                          <div className="flex items-center gap-4 text-muted-foreground">
                            <div className="flex items-center gap-1.5">
                              <Calendar className="w-3 h-3" />
                              <span className="opacity-80">
                                {task.dueDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div
                              className={`font-medium ${
                                isOverdue
                                  ? 'text-muted-foreground'
                                  : isToday
                                  ? 'text-primary'
                                  : 'text-foreground'
                              }`}
                            >
                              {isOverdue
                                ? 'Overdue'
                                : isToday
                                ? 'Due today'
                                : `${daysLeft}d`}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleEdit(task)}
                              className="p-1.5 hover:bg-muted rounded transition-colors"
                              aria-label="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-foreground" />
                            </button>
                            <button
                              onClick={() => setDeletingId(task.id)}
                              className="p-1.5 hover:bg-muted rounded transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Delete Confirmation */}
                    {deletingId === task.id && (
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
                              onClick={() => handleDelete(task.id)}
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
              <div className="bg-card rounded-lg p-3 shadow-sm border border-border">
                <p className="text-muted-foreground text-sm text-center opacity-80">No {type}s yet</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 space-y-6">
      {/* Helper Text */}
      {showHelperText && (
        <div className="flex items-center justify-between bg-accent/20 rounded-lg px-4 py-3 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            Add and manage tasks, assignments, and exams.
          </p>
          <button
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Subject Filter Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`px-4 py-2 rounded-full text-sm transition-colors font-medium ${
            selectedSubject === 'all'
              ? 'bg-primary text-primary-foreground'
              : 'bg-card border border-border text-foreground hover:bg-muted'
          }`}
        >
          All
        </button>
        {subjects.map((subject) => (
          <button
            key={subject.id}
            onClick={() => setSelectedSubject(subject.id)}
            className={`px-4 py-2 rounded-full text-sm text-white transition-all ${
              selectedSubject === subject.id
                ? 'font-semibold ring-2 ring-offset-2'
                : 'font-medium opacity-90 hover:opacity-100'
            }`}
            style={{
              backgroundColor: subject.color,
boxShadow:
  selectedSubject === subject.id
    ? `0 0 0 2px ${subject.color}`
    : undefined
            }}
          >
            {subject.name}
          </button>
        ))}
      </div>

      {/* Collapsible Sections */}
      <div className="space-y-4">
        {renderTaskList(tasksByType.task, 'task')}
        {renderTaskList(tasksByType.assignment, 'assignment')}
        {renderTaskList(tasksByType.exam, 'exam')}
        {renderTaskList(tasksByType.homework, 'homework')}
      </div>
    </div>
  );
}