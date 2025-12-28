"use client";
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface SettingsProps {
  subjects: Subject[];
  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;
}

export function Settings({ subjects, onAddSubject, onUpdateSubject, onDeleteSubject }: SettingsProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', color: '#7A9B7F' });

  // Expanded color palette with varied colors
  const colorPalette = [
    // Greens
    '#7A9B7F',
    '#6B8E73',
    '#8BA888',
    '#9CAF88',
    '#758E6F',
    '#668C6A',
    '#7FA582',
    '#92B894',
    // Blues
    '#6B9BC3',
    '#5A8AAA',
    '#7BA5C7',
    '#4A7A9E',
    // Purples
    '#9B7FA8',
    '#8B73A0',
    '#A888B5',
    '#7A6B92',
    // Oranges/Browns
    '#C4956E',
    '#B8885C',
    '#D4A574',
    '#A67C52',
    // Reds/Pinks
    '#B87B7B',
    '#A66B6B',
    '#C88A8A',
    '#9E5F5F',
  ];

  const handleSubmit = () => {
    if (formData.name && formData.color) {
      if (editingId) {
        onUpdateSubject(editingId, formData.name, formData.color);
        setEditingId(null);
      } else {
        onAddSubject(formData.name, formData.color);
        setShowAddForm(false);
      }
      setFormData({ name: '', color: '#7A9B7F' });
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
    setFormData({ name: '', color: '#7A9B7F' });
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
            <h3 className="text-foreground">{editingId ? 'Edit Subject' : 'New Subject'}</h3>
            
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
                      formData.color === color ? 'ring-2 ring-primary scale-110' : 'hover:scale-105'
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

        {/* Subjects List */}
        <div className="space-y-2">
          {subjects.map((subject) => (
            <div
              key={subject.id}
              className="bg-card rounded-lg p-4 shadow-sm border border-border flex items-center justify-between group hover:shadow-md transition-shadow"
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
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(subject)}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                  aria-label="Edit subject"
                >
                  <Edit2 className="w-4 h-4 text-foreground" />
                </button>
                <button
                  onClick={() => onDeleteSubject(subject.id)}
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
    </div>
  );
}