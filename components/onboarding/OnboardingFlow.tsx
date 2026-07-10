"use client";

import React, { useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";

import { Settings } from "@/components/settings";
import { Tasks } from "@/components/tasks";

import type {
  Period,
  StudySession,
  Subject,
  Task,
  TimetableClass,
  TimetablePeriod,
  TimetableSettings,
} from "@/components/models";

type Step = 0 | 1 | 2;

type SettingsOpenSection =
  | "subjects"
  | "terms"
  | "timetable"
  | "backup"
  | "premium"
  | null;

interface OnboardingFlowProps {
  subjects: Subject[];
  periods: Period[];
  tasks: Task[];
  studySessions: StudySession[];

  timetableSettings: TimetableSettings;
  timetablePeriods: TimetablePeriod[];
  timetableClasses: TimetableClass[];

  plan: "free" | "premium";

  onAddSubject: (name: string, color: string) => void;
  onUpdateSubject: (id: string, name: string, color: string) => void;
  onDeleteSubject: (id: string) => void;

  onUpdatePeriods: (periods: Period[]) => void;

  onUpdateTimetableSettings: (settings: TimetableSettings) => void;
  onUpdateTimetablePeriods: (periods: TimetablePeriod[]) => void;
  onAddTimetableClass: (timetableClass: Omit<TimetableClass, "id">) => void;
  onUpdateTimetableClass: (
    id: string,
    timetableClass: Omit<TimetableClass, "id">
  ) => void;
  onDeleteTimetableClass: (id: string) => void;

  onAddTask: (task: Omit<Task, "id">) => void;
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
  onDeleteTask: (id: string) => void;
  onToggleTaskCompleted: (id: string) => void;

  onClearAllData: () => void;
  onComplete: () => void;
}

const steps = [
  {
    title: "Subjects",
    eyebrow: "Step 1 of 3",
    heading: "What are you studying?",
    body: "Add your subjects first so tasks, classes, study sessions, and marks can use the right colours.",
  },
  {
    title: "Timetable",
    eyebrow: "Step 2 of 3",
    heading: "Add your class timetable",
    body: "Set up your school periods and Week A/B timetable so Calendar shows your real classes.",
  },
  {
    title: "First task",
    eyebrow: "Optional step",
    heading: "Add your first task or exam",
    body: "This is optional, but adding one task helps make the Calendar useful immediately.",
  },
];

export function OnboardingFlow({
  subjects,
  periods,
  tasks,
  studySessions,
  timetableSettings,
  timetablePeriods,
  timetableClasses,
  plan,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject,
  onUpdatePeriods,
  onUpdateTimetableSettings,
  onUpdateTimetablePeriods,
  onAddTimetableClass,
  onUpdateTimetableClass,
  onDeleteTimetableClass,
  onAddTask,
  onUpdateTask,
  onDeleteTask,
  onToggleTaskCompleted,
  onClearAllData,
  onComplete,
}: OnboardingFlowProps) {
  const [step, setStep] = useState<Step>(0);
  const [settingsOpenSection, setSettingsOpenSection] =
    useState<SettingsOpenSection>("subjects");

  const goToStep = (next: Step) => {
    setStep(next);

    if (next === 0) setSettingsOpenSection("subjects");
    if (next === 1) setSettingsOpenSection("timetable");
    if (next === 2) setSettingsOpenSection(null);
  };

  const next = () => {
    if (step === 0) goToStep(1);
    else if (step === 1) goToStep(2);
    else onComplete();
  };

  const back = () => {
    if (step === 1) goToStep(0);
    if (step === 2) goToStep(1);
  };

  const current = steps[step];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-30 border-b border-border bg-card/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <div className="text-base font-semibold tracking-tight text-foreground">
              MyStudyPlanner
            </div>
            <div className="text-[11px] text-muted-foreground">
              First-time setup
            </div>
          </div>

          <button type="button" onClick={onComplete} className="app-btn-secondary">
            Skip for now
          </button>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="app-card mb-5 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {current.eyebrow}
              </div>
              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
                {current.heading}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {current.body}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {steps.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => goToStep(index as Step)}
                  className={[
                    "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    step === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:bg-muted",
                  ].join(" ")}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        {step === 0 || step === 1 ? (
          <Settings
            appMode="app"
            subjects={subjects}
            periods={periods}
            tasks={tasks}
            studyItems={[]}
            studySessions={studySessions}
            plan={plan}
            timetableSettings={timetableSettings}
            timetablePeriods={timetablePeriods}
            timetableClasses={timetableClasses}
            onAddSubject={onAddSubject}
            onUpdateSubject={onUpdateSubject}
            onDeleteSubject={onDeleteSubject}
            onUpdatePeriods={onUpdatePeriods}
            onUpdateTimetableSettings={onUpdateTimetableSettings}
            onUpdateTimetablePeriods={onUpdateTimetablePeriods}
            onAddTimetableClass={onAddTimetableClass}
            onUpdateTimetableClass={onUpdateTimetableClass}
            onDeleteTimetableClass={onDeleteTimetableClass}
            onClearAllData={onClearAllData}
            openSection={settingsOpenSection}
            onOpenSectionHandled={() => setSettingsOpenSection(null)}
          />
        ) : (
          <Tasks
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddTask={onAddTask}
            onUpdateTask={onUpdateTask}
            onDeleteTask={onDeleteTask}
            onToggleCompleted={onToggleTaskCompleted}
          />
        )}

        <div className="sticky bottom-0 mt-6 border-t border-border bg-background/90 py-4 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-muted-foreground">
              You can change all of this later from Settings.
            </div>

            <div className="flex flex-wrap gap-2">
              {step > 0 ? (
                <button type="button" onClick={back} className="app-btn-secondary">
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : null}

              <button type="button" onClick={onComplete} className="app-btn-secondary">
                Skip for now
              </button>

              <button type="button" onClick={next} className="app-btn-primary">
                {step === 2 ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Finish
                  </>
                ) : (
                  <>
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}