// components/marks.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Edit2, Trash2, X, TrendingUp, Target, Clock3, Award } from "lucide-react";

import type { Task, Subject } from "./models";

// Must match Settings + Tasks key
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

type PeriodStored = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type PeriodHydrated = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
};

interface MarksProps {
  tasks: Task[];
  subjects: Subject[];
  onUpdateTask: (id: string, task: Omit<Task, "id">) => void;
}

type SubjectPerformance = {
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  average: number;
  count: number;
  latestDate: Date | null;
};

export function Marks({ tasks, subjects, onUpdateTask }: MarksProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingMarkTask, setDeletingMarkTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    score: "",
    outOf: "100",
    notes: "",
  });

  const [periods, setPeriods] = useState<PeriodHydrated[]>([]);

  const readPeriodsFromStorage = (): PeriodHydrated[] => {
    try {
      const raw = localStorage.getItem(PERIODS_STORAGE_KEY);
      if (!raw) return [];

      const parsed = JSON.parse(raw) as PeriodStored[];
      const hydrated: PeriodHydrated[] = (Array.isArray(parsed) ? parsed : []).map((p) => ({
        id: p.id,
        name: p.name,
        startDate: new Date(p.startDate),
        endDate: new Date(p.endDate),
      }));

      hydrated.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

      const onlyTerms1to4 = hydrated.filter((p) => /^term\s*[1-4]$/i.test(p.name.trim()));
      return onlyTerms1to4.length ? onlyTerms1to4 : hydrated;
    } catch {
      return [];
    }
  };

  useEffect(() => {
    const refresh = () => {
      const next = readPeriodsFromStorage();
      setPeriods(next);

      if (selectedPeriod !== "all" && !next.some((p) => p.id === selectedPeriod)) {
        setSelectedPeriod("all");
      }
    };

    refresh();

    const onStorage = (e: StorageEvent) => {
      if (e.key === PERIODS_STORAGE_KEY) refresh();
    };

    const onFocus = () => refresh();

    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
    };
  }, [selectedPeriod]);

  const periodNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of periods) map.set(p.id, p.name);
    return map;
  }, [periods]);

  const assessableTasks = useMemo(() => {
    return tasks.filter((t) => (t.type === "assignment" || t.type === "exam") && Boolean(t.subjectId));
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let base =
      selectedSubject === "all"
        ? assessableTasks
        : assessableTasks.filter((t) => t.subjectId === selectedSubject);

    if (selectedPeriod !== "all") {
      base = base.filter((t) => t.periodId === selectedPeriod);
    }

    return [...base].sort((a, b) => {
      const aPending = a.result ? 0 : 1;
      const bPending = b.result ? 0 : 1;
      if (aPending !== bPending) return bPending - aPending;
      return b.dueDate.getTime() - a.dueDate.getTime();
    });
  }, [assessableTasks, selectedSubject, selectedPeriod]);

  const subjectById = (id?: string) => (id ? subjects.find((s) => s.id === id) : undefined);

  const percentage = (score: number, outOf: number) => (outOf > 0 ? (score / outOf) * 100 : 0);

  const formatPercent = (value: number) => `${Math.round(value)}%`;

  const getBandLabel = (value: number) => {
    if (value >= 90) return "Excellent";
    if (value >= 80) return "Strong";
    if (value >= 70) return "Good";
    if (value >= 60) return "Developing";
    return "Needs attention";
  };

  const recordedTasks = useMemo(() => filteredTasks.filter((t) => Boolean(t.result)), [filteredTasks]);
  const pendingTasks = useMemo(() => filteredTasks.filter((t) => !t.result), [filteredTasks]);

  const pendingCount = pendingTasks.length;
  const recordedCount = recordedTasks.length;

  const overallAverage = useMemo(() => {
    if (recordedTasks.length === 0) return null;
    const total = recordedTasks.reduce((sum, task) => {
      const result = task.result;
      if (!result) return sum;
      return sum + percentage(result.score, result.outOf);
    }, 0);
    return total / recordedTasks.length;
  }, [recordedTasks]);

  const recentRecordedTasks = useMemo(() => {
    return [...recordedTasks].sort((a, b) => {
      const aDate = a.result?.dateRecorded ? new Date(a.result.dateRecorded).getTime() : 0;
      const bDate = b.result?.dateRecorded ? new Date(b.result.dateRecorded).getTime() : 0;
      return bDate - aDate;
    });
  }, [recordedTasks]);

  const recentAverage = useMemo(() => {
    if (recentRecordedTasks.length === 0) return null;
    const latestThree = recentRecordedTasks.slice(0, 3);
    const total = latestThree.reduce((sum, task) => {
      const result = task.result;
      if (!result) return sum;
      return sum + percentage(result.score, result.outOf);
    }, 0);
    return total / latestThree.length;
  }, [recentRecordedTasks]);

  const momentum = useMemo(() => {
    if (recentRecordedTasks.length < 4) return null;

    const latest = recentRecordedTasks.slice(0, 3);
    const previous = recentRecordedTasks.slice(3, 6);

    if (previous.length === 0) return null;

    const latestAvg =
      latest.reduce((sum, task) => {
        const result = task.result;
        if (!result) return sum;
        return sum + percentage(result.score, result.outOf);
      }, 0) / latest.length;

    const previousAvg =
      previous.reduce((sum, task) => {
        const result = task.result;
        if (!result) return sum;
        return sum + percentage(result.score, result.outOf);
      }, 0) / previous.length;

    return latestAvg - previousAvg;
  }, [recentRecordedTasks]);

  const subjectPerformance = useMemo<SubjectPerformance[]>(() => {
    const map = new Map<string, { total: number; count: number; latestDate: Date | null }>();

    recordedTasks.forEach((task) => {
      if (!task.result || !task.subjectId) return;
      const subjectId = task.subjectId;
      const current = map.get(subjectId) ?? { total: 0, count: 0, latestDate: null };
      const nextDate = task.result.dateRecorded ? new Date(task.result.dateRecorded) : current.latestDate;

      map.set(subjectId, {
        total: current.total + percentage(task.result.score, task.result.outOf),
        count: current.count + 1,
        latestDate:
          !current.latestDate || (nextDate && nextDate.getTime() > current.latestDate.getTime())
            ? nextDate
            : current.latestDate,
      });
    });

    return Array.from(map.entries())
      .map(([subjectId, data]) => {
        const subject = subjectById(subjectId);
        return {
          subjectId,
          subjectName: subject?.name ?? "Unassigned",
          subjectColor: subject?.color ?? "#D1D5DB",
          average: data.total / data.count,
          count: data.count,
          latestDate: data.latestDate,
        };
      })
      .sort((a, b) => b.average - a.average);
  }, [recordedTasks, subjects]);

  const strongestSubject = subjectPerformance[0] ?? null;
  const weakestSubject = subjectPerformance.length > 1 ? subjectPerformance[subjectPerformance.length - 1] : null;

  const upcomingPending = useMemo(() => {
    return [...pendingTasks]
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
      .slice(0, 4);
  }, [pendingTasks]);

  const buildUpdatePayload = (task: Task, nextResult: Task["result"] | undefined): Omit<Task, "id"> => ({
    title: task.title,
    subjectId: task.subjectId,
    dueDate: task.dueDate,
    type: task.type,
    periodId: task.periodId,
    completed: task.completed,
    completedAt: task.completedAt,
    result: nextResult,
  });

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      score: task.result ? String(task.result.score) : "",
      outOf: task.result ? String(task.result.outOf) : "100",
      notes: task.result?.notes ?? "",
    });
  };

  const closeEdit = () => {
    setEditingTask(null);
    setFormData({ score: "", outOf: "100", notes: "" });
  };

  const saveResult = () => {
    if (!editingTask) return;

    const scoreRaw = formData.score.trim();
    const outOfRaw = formData.outOf.trim();
    if (!scoreRaw || !outOfRaw) return;

    const score = Number(scoreRaw);
    const outOf = Number(outOfRaw);
    if (!Number.isFinite(score) || !Number.isFinite(outOf) || outOf <= 0 || score < 0 || score > outOf) return;

    const nextResult: Task["result"] = {
      score,
      outOf,
      notes: formData.notes.trim() || undefined,
      dateRecorded: editingTask.result?.dateRecorded ?? new Date(),
    };

    onUpdateTask(editingTask.id, buildUpdatePayload(editingTask, nextResult));
    closeEdit();
  };

  const requestDeleteMark = (task: Task) => {
    setDeletingMarkTask(task);
  };

  const cancelDeleteMark = () => {
    setDeletingMarkTask(null);
  };

  const confirmDeleteMark = () => {
    if (!deletingMarkTask) return;
    onUpdateTask(deletingMarkTask.id, buildUpdatePayload(deletingMarkTask, undefined));
    setDeletingMarkTask(null);
  };

  return (
    <div className="app-page app-scroll-page space-y-4">
      <div className="space-y-1">
        <h1 className="app-page-title">Marks</h1>
        <p className="app-page-subtitle">
          Track your assessment results, spot trends, and see where you are improving.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Target className="h-4 w-4" />
            Overall average
          </div>
          <div className="mt-3 text-2xl font-semibold text-foreground">
            {overallAverage === null ? "—" : formatPercent(overallAverage)}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {overallAverage === null ? "Add results to see your average." : getBandLabel(overallAverage)}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Award className="h-4 w-4" />
            Best subject
          </div>
          <div className="mt-3 text-lg font-semibold text-foreground truncate">
            {strongestSubject ? strongestSubject.subjectName : "—"}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {strongestSubject ? `${formatPercent(strongestSubject.average)} average` : "No subject data yet."}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            Recent trend
          </div>
          <div className="mt-3 text-2xl font-semibold text-foreground">
            {momentum === null ? "—" : `${momentum >= 0 ? "+" : ""}${Math.round(momentum)}%`}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            {momentum === null
              ? "Needs more recorded results."
              : momentum >= 0
              ? "Improving compared with earlier results."
              : "Slight drop from your earlier results."}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm p-5">
          <div className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Pending results
          </div>
          <div className="mt-3 text-2xl font-semibold text-foreground">{pendingCount}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            {recordedCount} recorded {recordedCount === 1 ? "assessment" : "assessments"} so far.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border bg-muted/10">
            <div className="text-sm font-semibold text-foreground">Subject performance</div>
            <div className="text-xs text-muted-foreground">See where you are strongest and where you need more attention.</div>
          </div>

          {subjectPerformance.length === 0 ? (
            <div className="p-8 text-center bg-background/40">
              <div className="text-sm font-medium text-foreground">No recorded marks yet</div>
              <div className="mt-1 text-xs text-muted-foreground">Once you enter results, subject averages will appear here.</div>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {subjectPerformance.map((item, index) => (
                <div key={item.subjectId} className="px-5 py-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition">
                  <div className="min-w-0">
                    <div className="inline-flex items-center gap-2 min-w-0">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.subjectColor }} />
                      <span className="text-sm font-medium text-foreground truncate">{item.subjectName}</span>
                      {index === 0 ? (
                        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          Strongest
                        </span>
                      ) : null}
                      {weakestSubject && item.subjectId === weakestSubject.subjectId ? (
                        <span className="rounded-full border border-border bg-card px-2 py-0.5 text-[11px] text-muted-foreground">
                          Focus
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {item.count} recorded {item.count === 1 ? "result" : "results"}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-semibold text-foreground">{formatPercent(item.average)}</div>
                    <div className="text-xs text-muted-foreground">{getBandLabel(item.average)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/10">
              <div className="text-sm font-semibold text-foreground">Performance snapshot</div>
              <div className="text-xs text-muted-foreground">A quick read on how your results are tracking.</div>
            </div>

            <div className="p-5 space-y-4">
              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Recent average</div>
                <div className="mt-2 text-xl font-semibold text-foreground">
                  {recentAverage === null ? "—" : formatPercent(recentAverage)}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Based on your latest {Math.min(recentRecordedTasks.length, 3)} recorded results.
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-background/50 p-4">
                <div className="text-xs font-medium text-muted-foreground">Current focus</div>
                <div className="mt-2 text-sm font-semibold text-foreground">
                  {weakestSubject ? weakestSubject.subjectName : "Add more marks first"}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {weakestSubject
                    ? `${formatPercent(weakestSubject.average)} average so far. This is your best area to improve next.`
                    : "Once you have results across subjects, this will show where to focus."}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-border bg-muted/10">
              <div className="text-sm font-semibold text-foreground">Upcoming marks to enter</div>
              <div className="text-xs text-muted-foreground">Stay on top of results that are still missing.</div>
            </div>

            {upcomingPending.length === 0 ? (
              <div className="p-5 text-sm text-muted-foreground">No pending assessments in this view.</div>
            ) : (
              <div className="divide-y divide-border">
                {upcomingPending.map((task) => {
                  const subject = subjectById(task.subjectId);
                  return (
                    <div key={task.id} className="px-5 py-4 flex items-center justify-between gap-3 hover:bg-muted/10 transition">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground truncate">{task.title}</div>
                        <div className="mt-1 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject?.color ?? "transparent" }} />
                            <span>{subject?.name ?? "Unassigned"}</span>
                          </span>
                          <span className="opacity-40">•</span>
                          <span>
                            Due{" "}
                            {task.dueDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                      >
                        Enter
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-border bg-muted/10">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-semibold text-foreground">Assessment results</div>
              <div className="mt-1 text-xs text-muted-foreground">
                Filter by subject or term, then enter, edit, or clear results.
              </div>
            </div>

            <div className="flex flex-col gap-3 xl:items-end">
              <div className="flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1.5">
                  <span className="text-foreground font-medium">{recordedCount}</span>
                  <span className="text-muted-foreground">recorded</span>
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-dashed border-border bg-card/60 px-3 py-1.5">
                  <span className="text-foreground font-medium">{pendingCount}</span>
                  <span className="text-muted-foreground">pending</span>
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <div className="inline-flex items-center rounded-xl border border-border bg-card/80 p-1">
                  <button
                    type="button"
                    onClick={() => setSelectedSubject("all")}
                    className={[
                      "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      selectedSubject === "all"
                        ? "bg-primary text-primary-foreground"
                        : "text-foreground/90 hover:bg-muted",
                    ].join(" ")}
                  >
                    All
                  </button>

                  {subjects.map((s) => {
                    const active = selectedSubject === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSelectedSubject(s.id)}
                        className={[
                          "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          active ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted",
                        ].join(" ")}
                        style={{ boxShadow: active ? `0 0 0 2px ${s.color}22` : undefined }}
                        title={s.name}
                      >
                        <span className="inline-flex items-center gap-2 max-w-[140px]">
                          <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                          <span className="truncate">{s.name}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                {periods.length > 0 ? (
                  <div className="inline-flex items-center rounded-xl border border-border bg-card/80 p-1">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod("all")}
                      className={[
                        "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                        selectedPeriod === "all" ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted",
                      ].join(" ")}
                    >
                      All terms
                    </button>

                    {periods.map((p) => {
                      const active = selectedPeriod === p.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelectedPeriod(p.id)}
                          className={[
                            "h-9 px-3 rounded-lg text-sm font-medium transition-colors",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                            active ? "bg-muted text-foreground" : "text-foreground/90 hover:bg-muted",
                          ].join(" ")}
                        >
                          {p.name}
                        </button>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="p-10 text-center bg-background/40">
            <div className="text-sm font-medium text-foreground">No assessments</div>
            <div className="mt-1 text-xs text-muted-foreground">Assignments and exams will appear here automatically.</div>
          </div>
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-[1.5fr_0.9fr_0.7fr_0.6fr] gap-4 px-5 py-3 text-xs font-medium text-muted-foreground bg-background/30">
              <div>Assessment</div>
              <div>Subject</div>
              <div className="text-right">Result</div>
              <div className="text-right">Actions</div>
            </div>

            {filteredTasks.map((task) => {
              const subject = subjectById(task.subjectId);
              const hasResult = Boolean(task.result);

              const resultDisplay = hasResult ? `${task.result!.score} / ${task.result!.outOf}` : "Pending";
              const percentValue = hasResult ? percentage(task.result!.score, task.result!.outOf) : null;
              const percentDisplay = percentValue !== null ? formatPercent(percentValue) : "";

              const termLabel =
                task.periodId && periodNameById.get(task.periodId)
                  ? periodNameById.get(task.periodId)
                  : task.periodId
                  ? task.periodId
                  : undefined;

              return (
                <div
                  key={task.id}
                  className="px-4 md:px-5 py-3 hover:bg-muted/10 transition"
                  style={{ borderLeft: `3px solid ${subject?.color ?? "transparent"}` }}
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_0.9fr_0.7fr_0.6fr] gap-4 items-center">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground truncate">{task.title}</div>
                      <div className="mt-0.5 text-xs text-muted-foreground flex flex-wrap items-center gap-2">
                        <span className="uppercase tracking-wide">{task.type}</span>
                        <span className="opacity-40">•</span>
                        <span>
                          Due{" "}
                          {task.dueDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        {termLabel ? (
                          <>
                            <span className="opacity-40">•</span>
                            <span className="truncate">{termLabel}</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="text-sm text-foreground/90">
                      <span className="inline-flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: subject?.color ?? "transparent" }} />
                        <span className="truncate">{subject?.name ?? "Unassigned"}</span>
                      </span>
                    </div>

                    <div className="md:text-right">
                      {hasResult ? (
                        <>
                          <div className="text-sm font-medium text-foreground">{resultDisplay}</div>
                          <div className="text-xs text-muted-foreground">
                            {percentDisplay} • {getBandLabel(percentValue ?? 0)}
                          </div>
                        </>
                      ) : (
                        <span className="inline-flex items-center rounded-full border border-dashed border-border bg-card/40 px-2.5 py-1 text-xs text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </div>

                    <div className="md:text-right flex md:justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => openEdit(task)}
                        className={[
                          "inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition",
                          "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          hasResult ? "border border-border bg-card hover:bg-muted" : "bg-primary text-primary-foreground hover:bg-primary/90",
                        ].join(" ")}
                      >
                        <Edit2 className="h-4 w-4" />
                        {hasResult ? "Edit" : "Enter"}
                      </button>

                      {hasResult ? (
                        <button
                          type="button"
                          onClick={() => requestDeleteMark(task)}
                          className={[
                            "inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition",
                            "border border-border bg-card hover:bg-muted",
                            "focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30",
                          ].join(" ")}
                          aria-label="Delete mark"
                          title="Delete mark"
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editingTask ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeEdit} />
          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-foreground">{editingTask.result ? "Edit result" : "Enter result"}</div>
                <div className="text-xs text-muted-foreground">{editingTask.title}</div>
              </div>
              <button
                type="button"
                onClick={closeEdit}
                className="h-9 w-9 grid place-items-center rounded-lg hover:bg-muted transition"
                aria-label="Close"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Score"
                  value={formData.score}
                  onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  autoFocus
                />
                <input
                  type="number"
                  placeholder="Out of"
                  value={formData.outOf}
                  onChange={(e) => setFormData({ ...formData, outOf: e.target.value })}
                  className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                />
              </div>

              {formData.score.trim() && formData.outOf.trim() && Number(formData.outOf) > 0 ? (
                <div className="rounded-xl border border-border bg-background/50 px-4 py-3 text-sm text-muted-foreground">
                  Preview:{" "}
                  <span className="font-medium text-foreground">
                    {formatPercent(percentage(Number(formData.score || 0), Number(formData.outOf || 1)))}
                  </span>
                </div>
              ) : null}

              <textarea
                placeholder="Notes (optional)"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full rounded-xl border border-border bg-input-background px-4 py-2.5 text-sm resize-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                rows={3}
              />

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={saveResult}
                  className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={closeEdit}
                  className="flex-1 rounded-xl border border-border bg-card px-4 py-2.5 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {deletingMarkTask ? (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={cancelDeleteMark} />
          <div className="fixed z-50 top-1/2 left-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <div className="text-sm font-semibold text-foreground">Delete this mark?</div>
              <div className="text-xs text-muted-foreground mt-1">
                This will remove the recorded score for <span className="text-foreground/90 font-medium">{deletingMarkTask.title}</span>.
              </div>
            </div>

            <div className="p-5 flex gap-2 justify-end">
              <button
                type="button"
                onClick={cancelDeleteMark}
                className="rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground hover:bg-muted transition focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteMark}
                className="rounded-xl bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/90 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-destructive/30"
              >
                Delete mark
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}