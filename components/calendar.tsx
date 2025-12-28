"use client";

import React, { useState, useEffect, useRef, JSX } from 'react';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
}

interface StudySession {
  id: string;
  subjectId: string;
  date: Date;
  startTime: string;
  duration: string;
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

interface CalendarProps {
  studySessions: StudySession[];
  tasks: Task[];
  studyItems: StudyItem[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onAddStudyItem: (item: Omit<StudyItem, 'id'>) => void;
}

type ViewMode = 'day' | 'week' | 'month';
type AddFormType = 'study' | 'task' | 'assignment' | 'exam' | 'homework' | null;

function CalendarView({ studySessions, tasks, studyItems, subjects, onAddTask, onAddStudyItem }: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPopover, setShowPopover] = useState(false);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ x: 0, y: 0 });
  const [showHelperText, setShowHelperText] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [taskFormData, setTaskFormData] = useState({
    title: '',
    subjectId: '',
    dueDate: '',
    type: 'task' as 'task' | 'assignment' | 'exam' | 'homework'
  });

  const [studyFormData, setStudyFormData] = useState({
    subjectId: '',
    topic: '',
    date: '',
    linkedTaskId: '',
    notes: '',
    showOnCalendar: true
  });

  const today = new Date();

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const previousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const previousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const nextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    );
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const getItemsForDate = (date: Date) => {
    const dateTasks = tasks.filter((task) => isSameDay(task.dueDate, date));
    const dateStudyItems = studyItems.filter((item) => item.showOnCalendar && isSameDay(item.date, date));
    const dateSessions = studySessions.filter((session) => isSameDay(session.date, date));

    return { tasks: dateTasks, studyItems: dateStudyItems, sessions: dateSessions };
  };

  const handleDayClick = (date: Date, event: React.MouseEvent) => {
    setSelectedDate(date);
    setShowPopover(true);
  };

  const handleAddOption = (type: AddFormType) => {
    if (!selectedDate) return;

    const dateStr = selectedDate.toISOString().split('T')[0];

    if (type === 'study') {
      setStudyFormData({
        subjectId: '',
        topic: '',
        date: dateStr,
        linkedTaskId: '',
        notes: '',
        showOnCalendar: true
      });
    } else {
      setTaskFormData({
        title: '',
        subjectId: '',
        dueDate: dateStr,
        type: type as 'task' | 'assignment' | 'exam' | 'homework'
      });
    }

    setShowAddForm(type);
    setShowPopover(false);
  };

  const handleTaskSubmit = () => {
    if (taskFormData.title && taskFormData.subjectId && taskFormData.dueDate) {
      onAddTask({
        title: taskFormData.title,
        subjectId: taskFormData.subjectId,
        dueDate: new Date(taskFormData.dueDate),
        type: taskFormData.type
      });
      setTaskFormData({ title: '', subjectId: '', dueDate: '', type: 'task' });
      setShowAddForm(null);
      setSelectedDate(null);
    }
  };

  const handleStudySubmit = () => {
    if (studyFormData.topic && studyFormData.subjectId && studyFormData.date) {
      onAddStudyItem({
        subjectId: studyFormData.subjectId,
        topic: studyFormData.topic,
        date: new Date(studyFormData.date),
        linkedTaskId: studyFormData.linkedTaskId || undefined,
        notes: studyFormData.notes || undefined,
        showOnCalendar: studyFormData.showOnCalendar
      });
      setStudyFormData({
        subjectId: '',
        topic: '',
        date: '',
        linkedTaskId: '',
        notes: '',
        showOnCalendar: true
      });
      setShowAddForm(null);
      setSelectedDate(null);
    }
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setShowPopover(false);
    setSelectedDate(null);
    setTaskFormData({ title: '', subjectId: '', dueDate: '', type: 'task' });
    setStudyFormData({
      subjectId: '',
      topic: '',
      date: '',
      linkedTaskId: '',
      notes: '',
      showOnCalendar: true
    });
  };

  const renderItemCard = (item: { subject?: Subject; title: string; type?: string; isStudy?: boolean }) => (
    <div
      className="text-xs px-2 py-1 rounded border text-foreground"
      style={item.subject ? {
        borderColor: item.subject.color,
        backgroundColor: item.isStudy ? item.subject.color + '10' : 'transparent'
      } : {}}
    >
      <div className="truncate">{item.isStudy ? '📚 ' : ''}{item.title}</div>
      {item.subject && (
        <div className="text-xs" style={{ color: item.subject.color }}>
          {item.subject.name}
        </div>
      )}
    </div>
  );

  const getTodayCellClasses = (isToday: boolean) => {
    if (!isToday) return "";
    // Clear "today" highlight: border + subtle fill + ring
    return "border-primary bg-primary/10 ring-2 ring-primary/30";
  };

  const renderMonthView = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);
    const weeks: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="min-h-32 p-2 border border-border bg-muted/30" />);
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(date);
      const isToday = isSameDay(today, date);

      cells.push(
        <div
          key={day}
          onClick={(e) => handleDayClick(date, e)}
          className={`min-h-32 p-2 border bg-card transition-colors cursor-pointer hover:bg-muted/50 ${getTodayCellClasses(isToday)}`}
        >
          <div className={`mb-2 text-sm ${isToday ? 'text-primary font-semibold' : 'text-foreground'}`}>{day}</div>
          <div className="space-y-1">
            {dayTasks.map((task) => {
              const subject = getSubjectById(task.subjectId);
              return <div key={task.id}>{renderItemCard({ subject, title: task.title })}</div>;
            })}
            {dayStudyItems.map((item) => {
              const subject = getSubjectById(item.subjectId);
              return <div key={item.id}>{renderItemCard({ subject, title: item.topic, isStudy: true })}</div>;
            })}
          </div>
        </div>
      );

      if ((firstDay + day) % 7 === 0 || day === days) {
        weeks.push(
          <div key={`week-${weeks.length}`} className="grid grid-cols-7">
            {cells}
          </div>
        );
        cells = [];
      }
    }

    return <div className="space-y-0">{weeks}</div>;
  };

  const renderWeekView = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      days.push(date);
    }

    return (
      <div className="grid grid-cols-7 gap-px bg-border">
        {days.map((date, i) => {
          const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(date);
          const isToday = isSameDay(today, date);

          return (
            <div
              key={i}
              onClick={(e) => handleDayClick(date, e)}
              className={`min-h-96 p-3 bg-card cursor-pointer hover:bg-muted/50 transition-colors border border-transparent ${isToday ? "border-primary bg-primary/10 ring-2 ring-primary/30" : ""}`}
            >
              <div className="mb-3">
                <div className="text-xs text-muted-foreground">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-lg ${isToday ? 'text-primary font-semibold' : 'text-foreground font-medium'}`}>
                  {date.getDate()}
                </div>
              </div>
              <div className="space-y-2">
                {dayTasks.map((task) => {
                  const subject = getSubjectById(task.subjectId);
                  return <div key={task.id}>{renderItemCard({ subject, title: task.title })}</div>;
                })}
                {dayStudyItems.map((item) => {
                  const subject = getSubjectById(item.subjectId);
                  return <div key={item.id}>{renderItemCard({ subject, title: item.topic, isStudy: true })}</div>;
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(currentDate);
    const isToday = isSameDay(today, currentDate);

    return (
      <div className={`rounded-lg p-6 border ${isToday ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "bg-card border-border"}`}>
        <div className="mb-6">
          <div className="text-xs text-muted-foreground mb-1">
            {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className={`text-2xl ${isToday ? 'text-primary font-semibold' : 'text-foreground font-medium'}`}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>

        <div className="space-y-3">
          {dayTasks.length === 0 && dayStudyItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm mb-4">No items planned for this day</p>
              <button
                onClick={(e) => {
                  handleDayClick(currentDate, e as any);
                }}
                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-sm"
              >
                Add item
              </button>
            </div>
          ) : (
            <>
              {dayTasks.map((task) => {
                const subject = getSubjectById(task.subjectId);
                return (
                  <div key={task.id} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-foreground font-medium mb-1">{task.title}</div>
                        <div className="text-xs text-muted-foreground capitalize">{task.type}</div>
                      </div>
                      {subject && (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-white text-xs"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
              {dayStudyItems.map((item) => {
                const subject = getSubjectById(item.subjectId);
                return (
                  <div key={item.id} className="p-3 rounded-lg border border-border bg-card hover:bg-muted/30 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="text-foreground font-medium mb-1">📚 {item.topic}</div>
                        {item.notes && <div className="text-xs text-muted-foreground italic mt-1">{item.notes}</div>}
                      </div>
                      {subject && (
                        <span
                          className="inline-block px-2 py-1 rounded-full text-white text-xs"
                          style={{ backgroundColor: subject.color }}
                        >
                          {subject.name}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    );
  };

  const getHeaderLabel = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
  };

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'month') {
      direction === 'prev' ? previousMonth() : nextMonth();
    } else if (viewMode === 'week') {
      direction === 'prev' ? previousWeek() : nextWeek();
    } else {
      direction === 'prev' ? previousDay() : nextDay();
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-8 py-8 space-y-6">
      {/* Helper Text */}
      {showHelperText && (
        <div className="flex items-center justify-between bg-accent/20 rounded-lg px-4 py-3 border border-primary/20">
          <p className="text-xs text-muted-foreground">
            Click on a day to add study, tasks, or assessments.
          </p>
          <button
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header with view mode toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => handleNavigate('prev')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-foreground font-semibold min-w-64 text-center">{getHeaderLabel()}</h1>
          <button
            onClick={() => handleNavigate('next')}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>
        <div className="flex gap-2">
          {(['month', 'week', 'day'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                viewMode === mode
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
        {viewMode === 'month' && (
          <>
            <div className="grid grid-cols-7 bg-muted/50 border-b border-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="p-3 text-center text-muted-foreground text-sm font-medium">
                  {day}
                </div>
              ))}
            </div>
            {renderMonthView()}
          </>
        )}
        {viewMode === 'week' && renderWeekView()}
        {viewMode === 'day' && renderDayView()}
      </div>

      {/* Popover */}
      {showPopover && selectedDate && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowPopover(false)}
          />
          <div
            ref={popoverRef}
            className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-3 space-y-2"
            style={{ minWidth: '200px' }}
          >
            <div className="flex items-center justify-between mb-2 border-b border-border pb-2">
              <div className="text-sm text-foreground font-medium">
                {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </div>
              <button
                onClick={() => setShowPopover(false)}
                className="p-1 hover:bg-muted rounded"
              >
                <X className="w-3 h-3 text-muted-foreground" />
              </button>
            </div>
            <button
              onClick={() => handleAddOption('study')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
            >
              Add Study
            </button>
            <button
              onClick={() => handleAddOption('task')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
            >
              Add Task
            </button>
            <button
              onClick={() => handleAddOption('assignment')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
            >
              Add Assignment
            </button>
            <button
              onClick={() => handleAddOption('exam')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
            >
              Add Exam
            </button>
            <button
              onClick={() => handleAddOption('homework')}
              className="w-full text-left px-3 py-2 text-sm rounded hover:bg-muted transition-colors text-foreground"
            >
              Add Homework
            </button>
          </div>
        </>
      )}

      {/* Add Forms Modal */}
      {showAddForm && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={handleCancel}
          />
          <div className="fixed z-50 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-card rounded-lg shadow-xl border border-border p-6 w-full max-w-md">
            {showAddForm === 'study' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-foreground font-semibold">Add Study</h3>
                  <button onClick={handleCancel} className="p-1 hover:bg-muted rounded">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Topic or description"
                  value={studyFormData.topic}
                  onChange={(e) => setStudyFormData({ ...studyFormData, topic: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <select
                  value={studyFormData.subjectId}
                  onChange={(e) => setStudyFormData({ ...studyFormData, subjectId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {subject.name}
                    </option>
                  ))}
                </select>

                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={studyFormData.date}
                    onChange={(e) => setStudyFormData({ ...studyFormData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <select
                  value={studyFormData.linkedTaskId}
                  onChange={(e) => setStudyFormData({ ...studyFormData, linkedTaskId: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Link to task (optional)</option>
                  {tasks
                    .filter(t => t.subjectId === studyFormData.subjectId)
                    .map((task) => (
                      <option key={task.id} value={task.id}>
                        {task.title}
                      </option>
                    ))}
                </select>

                <textarea
                  placeholder="Notes (optional)"
                  value={studyFormData.notes}
                  onChange={(e) => setStudyFormData({ ...studyFormData, notes: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                  rows={2}
                />

                <label className="flex items-center gap-2 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={studyFormData.showOnCalendar}
                    onChange={(e) => setStudyFormData({ ...studyFormData, showOnCalendar: e.target.checked })}
                    className="rounded border-border"
                  />
                  Show on calendar
                </label>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleStudySubmit}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Add
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 rounded-lg bg-muted text-foreground hover:bg-muted/80 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <h3 className="text-foreground font-semibold">
                    Add {showAddForm?.charAt(0).toUpperCase()}{showAddForm?.slice(1)}
                  </h3>
                  <button onClick={handleCancel} className="p-1 hover:bg-muted rounded">
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                </div>

                <input
                  type="text"
                  placeholder="Title"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <select
                  value={taskFormData.subjectId}
                  onChange={(e) => setTaskFormData({ ...taskFormData, subjectId: e.target.value })}
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
                  type="date"
                  value={taskFormData.dueDate}
                  onChange={(e) => setTaskFormData({ ...taskFormData, dueDate: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                />

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleTaskSubmit}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                  >
                    Add
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
          </div>
        </>
      )}
    </div>
  );
}
export { CalendarView as Calendar };
