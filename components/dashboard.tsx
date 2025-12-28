"use client";

import React from 'react';
import { BookOpen, Calendar } from 'lucide-react';

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

interface DashboardProps {
  tasks: Task[];
  subjects: Subject[];
  studyItems: StudyItem[];
}

const dailyQuotes = [
  "Consistent effort compounds into mastery.",
  "Understanding comes from patient review.",
  "Each study session builds deeper clarity.",
  "Progress is made one concept at a time.",
  "Discipline shapes sustained excellence.",
  "Focus today, reap understanding tomorrow.",
  "Intentional practice leads to fluency.",
];

export function Dashboard({ tasks, subjects, studyItems }: DashboardProps) {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Select quote based on day of year for consistency
  const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 86400000);
  const quote = dailyQuotes[dayOfYear % dailyQuotes.length];

  const getDaysLeft = (dueDate: Date) => {
    const diff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysLeftText = (daysLeft: number) => {
    if (daysLeft < 0) return 'Overdue';
    if (daysLeft === 0) return 'Due today';
    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
  };

  const getSubjectById = (id: string) => subjects.find((s) => s.id === id);

  const sortedTasks = [...tasks].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

  return (
    <div className="max-w-5xl mx-auto px-8 py-6 space-y-5">
      {/* Header with Quote */}
      <div className="space-y-1">
        <h1 className="text-foreground font-semibold">{formattedDate}</h1>
        <p className="text-muted-foreground text-sm italic opacity-70">{quote}</p>
      </div>

      {/* Today's Study - Compact */}
      <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
        <h3 className="mb-3 text-foreground font-semibold">Today's Study</h3>
        {studyItems.length > 0 ? (
          <div className="space-y-2">
            {studyItems.map((item) => {
              const subject = getSubjectById(item.subjectId);
              return (
                <div key={item.id} className="flex items-center gap-2 text-sm">
                  <BookOpen className="w-4 h-4 shrink-0" style={{ color: subject?.color }} />
                  <span className="text-foreground">
                    <span className="font-medium" style={{ color: subject?.color }}>
                      {subject?.name}
                    </span>
                    <span className="text-muted-foreground"> — </span>
                    <span>{item.topic}</span>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm opacity-80">No study sessions planned for today</p>
        )}
      </div>

      {/* Upcoming Deadlines - Compact */}
      <div className="space-y-3">
        <h2 className="text-foreground font-semibold">Upcoming Deadlines</h2>
        <div className="space-y-2">
          {sortedTasks.length > 0 ? (
            sortedTasks.map((task) => {
              const daysLeft = getDaysLeft(task.dueDate);
              const isOverdue = daysLeft < 0;
              const isToday = daysLeft === 0;
              const subject = getSubjectById(task.subjectId);

              return (
                <div
                  key={task.id}
                  className="bg-card rounded-lg p-4 shadow-sm border-l-4 hover:shadow-md transition-shadow"
                  style={subject ? { borderLeftColor: subject.color } : {}}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="text-foreground font-semibold truncate">{task.title}</h4>
                        {subject && (
                          <span
                            className="inline-block px-2 py-0.5 rounded-full text-white text-xs shrink-0 font-medium"
                            style={{ backgroundColor: subject.color }}
                          >
                            {subject.name}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs opacity-80">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {task.dueDate.toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div
                        className={`text-base font-bold ${
                          isOverdue
                            ? 'text-muted-foreground'
                            : isToday
                            ? 'text-primary'
                            : 'text-foreground'
                        }`}
                      >
                        {getDaysLeftText(daysLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-card rounded-lg p-4 shadow-sm border border-border">
              <p className="text-muted-foreground text-sm text-center opacity-80">No upcoming deadlines</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
