"use client";

import React, { useState, useRef, JSX, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  Pencil,
  Trash2,
  Plus,
  Sparkles,
} from "lucide-react";

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

interface CalendarProps {
  studySessions: StudySession[];
  tasks: Task[];
  studyItems: StudyItem[];
  subjects: Subject[];
  onAddTask: (task: Omit<Task, "id">) => void;

  onUpdateTask?: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask?: (id: string) => void;

  onAddStudyItem: (item: Omit<StudyItem, "id">) => void;
}

type ViewMode = "day" | "week" | "month";
type AddFormType = "study" | "task" | "assignment" | "exam" | "homework" | null;

const toLocalDateInputValue = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const isSameDay = (date1: Date, date2: Date) =>
  date1.getDate() === date2.getDate() &&
  date1.getMonth() === date2.getMonth() &&
  date1.getFullYear() === date2.getFullYear();

const startOfWeek = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay());
  return x;
};

const endOfWeek = (d: Date) => {
  const s = startOfWeek(d);
  const e = new Date(s);
  e.setDate(s.getDate() + 6);
  return e;
};

function typeLabel(t: Task["type"]) {
  if (t === "assignment") return "Assignment";
  if (t === "exam") return "Exam";
  if (t === "homework") return "Homework";
  return "Task";
}

function typeDot(t: Task["type"]) {
  if (t === "exam") return "●";
  if (t === "assignment") return "◆";
  if (t === "homework") return "■";
  return "•";
}

function CalendarView({
  studySessions,
  tasks,
  studyItems,
  subjects,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onAddStudyItem,
}: CalendarProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showPopover, setShowPopover] = useState(false);
  const [showAddForm, setShowAddForm] = useState<AddFormType>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showHelperText, setShowHelperText] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const canEditDelete = Boolean(onUpdateTask && onDeleteTask);

  const [taskFormData, setTaskFormData] = useState({
    title: "",
    subjectId: "",
    dueDate: "",
    type: "task" as "task" | "assignment" | "exam" | "homework",
  });

  const [studyFormData, setStudyFormData] = useState({
    subjectId: "",
    topic: "",
    date: "",
    linkedTaskId: "",
    notes: "",
    showOnCalendar: true,
  });

  const subjectById = useMemo(() => {
    const map = new Map<string, Subject>();
    subjects.forEach((s) => map.set(s.id, s));
    return map;
  }, [subjects]);

  const daysInMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  const firstDayOfMonth = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const previousMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));

  const nextMonth = () =>
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));

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

  const getItemsForDate = (date: Date) => {
    const dateTasks = tasks.filter((task) => isSameDay(task.dueDate, date));
    const dateStudyItems = studyItems.filter(
      (item) => item.showOnCalendar && isSameDay(item.date, date)
    );
    const dateSessions = studySessions.filter((session) => isSameDay(session.date, date));

    return { tasks: dateTasks, studyItems: dateStudyItems, sessions: dateSessions };
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShowPopover(true);
  };

  const handleAddOption = (type: AddFormType) => {
    if (!selectedDate) return;

    const dateStr = toLocalDateInputValue(selectedDate);

    setEditingTaskId(null);

    if (type === "study") {
      setStudyFormData({
        subjectId: "",
        topic: "",
        date: dateStr,
        linkedTaskId: "",
        notes: "",
        showOnCalendar: true,
      });
    } else {
      setTaskFormData({
        title: "",
        subjectId: "",
        dueDate: dateStr,
        type: type as "task" | "assignment" | "exam" | "homework",
      });
    }

    setShowAddForm(type);
    setShowPopover(false);
  };

  const openEditTask = (task: Task) => {
    if (!canEditDelete) return;

    setEditingTaskId(task.id);
    setSelectedDate(task.dueDate);

    setTaskFormData({
      title: task.title,
      subjectId: task.subjectId,
      dueDate: toLocalDateInputValue(task.dueDate),
      type: task.type,
    });

    setShowAddForm(task.type);
    setShowPopover(false);
  };

  const handleTaskSubmit = () => {
    if (!taskFormData.title || !taskFormData.subjectId || !taskFormData.dueDate) return;

    const payload: Omit<Task, "id"> = {
      title: taskFormData.title,
      subjectId: taskFormData.subjectId,
      dueDate: new Date(taskFormData.dueDate),
      type: taskFormData.type,
    };

    if (editingTaskId && onUpdateTask) {
      onUpdateTask(editingTaskId, payload);
    } else {
      onAddTask(payload);
    }

    setEditingTaskId(null);
    setTaskFormData({ title: "", subjectId: "", dueDate: "", type: "task" });
    setShowAddForm(null);
    setSelectedDate(null);
  };

  const handleStudySubmit = () => {
    if (!studyFormData.topic || !studyFormData.subjectId || !studyFormData.date) return;

    onAddStudyItem({
      subjectId: studyFormData.subjectId,
      topic: studyFormData.topic,
      date: new Date(studyFormData.date),
      linkedTaskId: studyFormData.linkedTaskId || undefined,
      notes: studyFormData.notes || undefined,
      showOnCalendar: studyFormData.showOnCalendar,
    });

    setStudyFormData({
      subjectId: "",
      topic: "",
      date: "",
      linkedTaskId: "",
      notes: "",
      showOnCalendar: true,
    });
    setShowAddForm(null);
    setSelectedDate(null);
  };

  const handleCancel = () => {
    setShowAddForm(null);
    setShowPopover(false);
    setSelectedDate(null);
    setEditingTaskId(null);
    setDeletingTaskId(null);

    setTaskFormData({ title: "", subjectId: "", dueDate: "", type: "task" });
    setStudyFormData({
      subjectId: "",
      topic: "",
      date: "",
      linkedTaskId: "",
      notes: "",
      showOnCalendar: true,
    });
  };

  const SectionShell = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {children}
    </div>
  );

  const SwitchPill = ({
    label,
    active,
    onClick,
  }: {
    label: string;
    active: boolean;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className={[
        "px-3 py-1.5 rounded-full text-sm transition",
        active
          ? "bg-primary text-primary-foreground"
          : "text-foreground hover:bg-muted border border-border bg-card",
      ].join(" ")}
    >
      {label}
    </button>
  );

  // ✅ 2-line clamp so month view stays clean
  const renderChip = ({
    title,
    subjectId,
    isStudy,
    task,
  }: {
    title: string;
    subjectId?: string;
    isStudy?: boolean;
    task?: Task;
  }) => {
    const subject = subjectId ? subjectById.get(subjectId) : undefined;
    const dot = subject?.color ?? "#94a3b8";

    return (
      <div
        className="group flex items-start justify-between gap-2 rounded-lg border border-border bg-background/40 px-2 py-1 hover:bg-background/60 transition"
        style={{ borderLeftWidth: 3, borderLeftColor: dot }}
      >
        <div className="min-w-0 flex-1">
          <div
            className="text-xs text-foreground leading-snug wrap-break-word"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {isStudy ? "📚 " : ""}
            {task ? `${typeDot(task.type)} ` : ""}
            {title}
          </div>

          <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 min-w-0">
              <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: dot }} />
              <span className="truncate">{subject?.name ?? "Unassigned"}</span>
            </span>

            {task ? (
              <>
                <span className="text-muted-foreground/60">•</span>
                <span className="shrink-0">{typeLabel(task.type)}</span>
              </>
            ) : null}
          </div>
        </div>

        {task && canEditDelete ? (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition mt-0.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                openEditTask(task);
              }}
              className="p-1 rounded hover:bg-muted"
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5 text-foreground" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setDeletingTaskId(task.id);
              }}
              className="p-1 rounded hover:bg-muted"
              aria-label="Delete task"
            >
              <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
            </button>
          </div>
        ) : null}
      </div>
    );
  };

  const renderMonthView = () => {
    const days = daysInMonth(currentDate);
    const firstDay = firstDayOfMonth(currentDate);

    const weeks: JSX.Element[] = [];
    let cells: JSX.Element[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push(
        <div
          key={`empty-${i}`}
          className="min-h-35 p-2 bg-muted/20 border-r border-b border-border"
        />
      );
    }

    for (let day = 1; day <= days; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(date);

      const isToday = isSameDay(new Date(), date);
      const isSelected = selectedDate ? isSameDay(selectedDate, date) : false;

      const previewItems = [
        ...dayTasks.slice(0, 2).map((t) => ({ kind: "task" as const, t })),
        ...dayStudyItems.slice(0, 1).map((s) => ({ kind: "study" as const, s })),
      ];
      const totalCount = dayTasks.length + dayStudyItems.length;

      // ✅ FIX NESTED BUTTONS: outer day cell is a div, not a button
      cells.push(
        <div
          key={day}
          role="button"
          tabIndex={0}
          onClick={() => handleDayClick(date)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") handleDayClick(date);
          }}
          className={[
            "min-h-35 text-left p-2 bg-card border-r border-b border-border hover:bg-muted/40 transition",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            "flex flex-col cursor-pointer",
          ].join(" ")}
        >
          <div className="flex items-center justify-between">
            <div
              className={[
                "h-7 w-7 grid place-items-center rounded-full text-sm",
                isToday ? "bg-primary/10 text-primary font-semibold" : "text-foreground",
                isSelected ? "ring-1 ring-primary/30" : "",
              ].join(" ")}
            >
              {day}
            </div>
          </div>

          <div className="mt-2 space-y-1 min-h-0">
            {previewItems.map((x, idx) => {
              if (x.kind === "task") {
                return (
                  <div key={x.t.id + idx} className="min-w-0">
                    {renderChip({ title: x.t.title, subjectId: x.t.subjectId, task: x.t })}
                  </div>
                );
              }
              return (
                <div key={x.s.id + idx} className="min-w-0">
                  {renderChip({ title: x.s.topic, subjectId: x.s.subjectId, isStudy: true })}
                </div>
              );
            })}

            {totalCount > 3 ? (
              <div className="text-[11px] text-muted-foreground mt-1">
                +{totalCount - 3} more
              </div>
            ) : null}
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
    const s = startOfWeek(currentDate);
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(s);
      d.setDate(s.getDate() + i);
      days.push(d);
    }

    return (
      <div className="grid grid-cols-7 border-t border-border">
        {days.map((date, i) => {
          const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(date);
          const isToday = isSameDay(new Date(), date);

          // ✅ FIX NESTED BUTTONS: outer day column is a div, not a button
          return (
            <div
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => handleDayClick(date)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") handleDayClick(date);
              }}
              className="min-h-130 p-3 bg-card hover:bg-muted/40 transition text-left border-r border-border focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-muted-foreground">
                    {date.toLocaleDateString("en-US", { weekday: "short" }).toUpperCase()}
                  </div>
                  <div
                    className={["text-lg font-semibold", isToday ? "text-primary" : "text-foreground"].join(" ")}
                  >
                    {date.getDate()}
                  </div>
                </div>
                {isToday ? (
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
                    Today
                  </span>
                ) : null}
              </div>

              <div className="mt-3 space-y-2">
                {dayTasks.map((t) => (
                  <div key={t.id}>
                    {renderChip({ title: t.title, subjectId: t.subjectId, task: t })}
                  </div>
                ))}
                {dayStudyItems.map((item) => (
                  <div key={item.id}>
                    {renderChip({ title: item.topic, subjectId: item.subjectId, isStudy: true })}
                  </div>
                ))}

                {dayTasks.length === 0 && dayStudyItems.length === 0 ? (
                  <div className="mt-6 text-xs text-muted-foreground border border-dashed border-border rounded-xl p-3 bg-background/30">
                    Empty
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const { tasks: dayTasks, studyItems: dayStudyItems } = getItemsForDate(currentDate);
    const isToday = isSameDay(new Date(), currentDate);

    return (
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">
              {currentDate.toLocaleDateString("en-US", { weekday: "long" })}
            </div>
            <div className="mt-1 text-xl font-semibold text-foreground">
              {currentDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </div>
          </div>
          {isToday ? (
            <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              Today
            </span>
          ) : null}
        </div>

        <div className="mt-4 space-y-3">
          {dayTasks.length === 0 && dayStudyItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-background/40 px-4 py-12 text-center">
              <div className="text-sm font-medium text-foreground">No items planned</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Click below to add something to this day.
              </div>
              <button
                onClick={() => handleDayClick(currentDate)}
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
              >
                <Plus className="h-4 w-4" />
                Add item
              </button>
            </div>
          ) : (
            <>
              {dayTasks.map((t) => (
                <div key={t.id}>{renderChip({ title: t.title, subjectId: t.subjectId, task: t })}</div>
              ))}
              {dayStudyItems.map((item) => (
                <div key={item.id}>
                  {renderChip({ title: item.topic, subjectId: item.subjectId, isStudy: true })}
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    );
  };

  const getHeaderLabel = () => {
    if (viewMode === "month") {
      return currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
    }
    if (viewMode === "week") {
      const s = startOfWeek(currentDate);
      const e = endOfWeek(currentDate);
      return `${s.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${e.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })}`;
    }
    return currentDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
  };

  const handleNavigate = (direction: "prev" | "next") => {
    if (viewMode === "month") direction === "prev" ? previousMonth() : nextMonth();
    else if (viewMode === "week") direction === "prev" ? previousWeek() : nextWeek();
    else direction === "prev" ? previousDay() : nextDay();
  };

  return (
    <div className="mx-auto max-w-6xl px-6 md:px-10 py-8 space-y-4">
      {showHelperText ? (
        <div className="rounded-2xl border border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            Click a day to add study, tasks, or assessments.
          </div>
          <button
            onClick={() => setShowHelperText(false)}
            className="text-xs text-muted-foreground hover:text-foreground transition"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavigate("prev")}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Previous"
          >
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>

          <div className="min-w-55 text-left md:text-center">
            <div className="text-sm font-semibold text-foreground">{getHeaderLabel()}</div>
            <div className="text-xs text-muted-foreground">
              {viewMode === "month" ? "Overview" : viewMode === "week" ? "Weekly plan" : "Daily plan"}
            </div>
          </div>

          <button
            onClick={() => handleNavigate("next")}
            className="h-9 w-9 grid place-items-center rounded-lg border border-border bg-card hover:bg-muted transition"
            aria-label="Next"
          >
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-full border border-border bg-card p-1 flex gap-1">
            <SwitchPill label="Month" active={viewMode === "month"} onClick={() => setViewMode("month")} />
            <SwitchPill label="Week" active={viewMode === "week"} onClick={() => setViewMode("week")} />
            <SwitchPill label="Day" active={viewMode === "day"} onClick={() => setViewMode("day")} />
          </div>
        </div>
      </div>

      <SectionShell>
        {viewMode === "month" ? (
          <>
            <div className="grid grid-cols-7 bg-muted/20 border-b border-border">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground">
                  {day}
                </div>
              ))}
            </div>
            {renderMonthView()}
          </>
        ) : null}

        {viewMode === "week" ? renderWeekView() : null}
        {viewMode === "day" ? renderDayView() : null}
      </SectionShell>

      {/* Popover */}
      {showPopover && selectedDate ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setShowPopover(false)} />
          <div
            ref={popoverRef}
            className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[320px] rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {selectedDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                </div>
                <div className="text-xs text-muted-foreground">Add something to this day</div>
              </div>
              <button
                onClick={() => setShowPopover(false)}
                className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-3 space-y-2">
              <button
                onClick={() => handleAddOption("study")}
                className="w-full flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 hover:bg-background/60 transition"
              >
                <span className="text-sm text-foreground">📚 Add study</span>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>

              {(["task", "assignment", "exam", "homework"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => handleAddOption(t)}
                  className="w-full flex items-center justify-between rounded-xl border border-border bg-background/40 px-3 py-2 hover:bg-background/60 transition"
                >
                  <span className="text-sm text-foreground">Add {typeLabel(t)}</span>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : null}

      {/* Add/Edit Forms Modal */}
      {showAddForm ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={handleCancel} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div className="space-y-0.5">
                <div className="text-sm font-semibold text-foreground">
                  {showAddForm === "study"
                    ? "Add study"
                    : `${editingTaskId ? "Edit" : "Add"} ${typeLabel(showAddForm as Task["type"])}`}
                </div>
                <div className="text-xs text-muted-foreground">
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : ""}
                </div>
              </div>

              <button
                onClick={handleCancel}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {showAddForm === "study" ? (
                <>
                  <input
                    type="text"
                    placeholder="Topic (e.g. Quadratics practice)"
                    value={studyFormData.topic}
                    onChange={(e) => setStudyFormData({ ...studyFormData, topic: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  <select
                    value={studyFormData.subjectId}
                    onChange={(e) => setStudyFormData({ ...studyFormData, subjectId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value="">Select subject</option>
                    {subjects.map((subject) => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 gap-2">
                    <label className="text-xs text-muted-foreground flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      Date
                    </label>
                    <input
                      type="date"
                      value={studyFormData.date}
                      onChange={(e) => setStudyFormData({ ...studyFormData, date: e.target.value })}
                      className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>

                  <textarea
                    placeholder="Notes (optional)"
                    value={studyFormData.notes}
                    onChange={(e) => setStudyFormData({ ...studyFormData, notes: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    rows={3}
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

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleStudySubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                    >
                      Add
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    placeholder="Title"
                    value={taskFormData.title}
                    onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  <select
                    value={taskFormData.subjectId}
                    onChange={(e) => setTaskFormData({ ...taskFormData, subjectId: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
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
                    className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleTaskSubmit}
                      className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition"
                    >
                      {editingTaskId ? "Save" : "Add"}
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition"
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}

      {/* Delete confirm modal */}
      {deletingTaskId ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={() => setDeletingTaskId(null)} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this task?</div>
              <div className="text-xs text-muted-foreground mt-1">This action cannot be undone.</div>
            </div>
            <div className="p-5 flex gap-2 justify-end">
              <button
                onClick={() => setDeletingTaskId(null)}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (onDeleteTask) onDeleteTask(deletingTaskId);
                  setDeletingTaskId(null);
                }}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition"
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

export { CalendarView as Calendar };
