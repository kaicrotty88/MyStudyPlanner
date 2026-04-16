"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import { Dashboard } from "./dashboard";
import { Calendar } from "./calendar";
import { Tasks } from "./tasks";
import { StudyPlanner } from "./studyplanner";
import { Settings } from "./settings";
import { Insights } from "./insights";
import { ThemeToggle } from "./ThemeToggle";
import { Marks } from "./marks";
import { Reminders } from "./reminders";

import type { Subject, Task, StudySession, Period, Reminder } from "./models";

import { UserButton, useSession, useUser, SignInButton } from "@clerk/nextjs";
import { User, X, Lock, Sparkles } from "lucide-react";
import LoadingScreen from "@/components/LoadingScreen";

import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  fetchPlannerState,
  upsertPlannerState,
  clearPlannerState,
} from "@/lib/plannerStateSupabase";
import { fetchUserPlan } from "@/lib/profileSupabase";

import WhatsNewModal from "@/components/WhatsNewModal";

const REAL_STORAGE_KEY = "mystudyplanner-data";
const DEMO_STORAGE_KEY = "mystudyplanner-demo";
const AUTO_DELETE_COMPLETED_AFTER_MS = 24 * 60 * 60 * 1000;
const PERIODS_STORAGE_KEY = "mystudyplanner-periods";

const WHATS_NEW_VERSION_KEY = "2026-02-21";
const WHATS_NEW_VERSION_LABEL = "Update";
const WHATS_NEW_UPDATES = [
  "Sync across devices for signed-in users.",
  "Added further colour options.",
  "You can now delete marks.",
  "Fixed onboarding / sync issues.",
  "Required fields now show a red asterisk for clarity.",
  "Calendar is now larger so items truncate less.",
  "Feedback: go to Settings → bottom email.",
];

type Tab =
  | "dashboard"
  | "calendar"
  | "tasks"
  | "study"
  | "insights"
  | "marks"
  | "reminders"
  | "settings";

type AppMode = "demo" | "app";
type Plan = "free" | "premium";
type SettingsOpenSection = "subjects" | "terms" | "backup" | null;

const defaultSubjects: Subject[] = [
  { id: "1", name: "Mathematics", color: "#6B9BC3" },
  { id: "2", name: "Physics", color: "#9B7FA8" },
  { id: "3", name: "Chemistry", color: "#C4956E" },
  { id: "4", name: "English", color: "#8B73A0" },
  { id: "5", name: "History", color: "#B87B7B" },
];

const DEMO_PERIODS: Period[] = [
  {
    id: "p1",
    name: "Term 1",
    startDate: new Date(2026, 0, 29),
    endDate: new Date(2026, 3, 11),
  },
  {
    id: "p2",
    name: "Term 2",
    startDate: new Date(2026, 3, 28),
    endDate: new Date(2026, 6, 3),
  },
];

const makeDefaultData = () => {
  const now = new Date();

  const atStartOfDay = (date: Date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const addDays = (days: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + days);
    return atStartOfDay(date);
  };

  const withTime = (base: Date, hours: number, minutes: number) => {
    const date = new Date(base);
    date.setHours(hours, minutes, 0, 0);
    return date;
  };

  const formatTime12 = (hours: number, minutes: number) => {
    const ampm = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${h12}:${String(minutes).padStart(2, "0")} ${ampm}`;
  };

  const today = addDays(0);
  const yesterday = addDays(-1);
  const twoDaysAgo = addDays(-2);
  const fourDaysAgo = addDays(-4);
  const sixDaysAgo = addDays(-6);
  const nineDaysAgo = addDays(-9);
  const fourteenDaysAgo = addDays(-14);
  const twentyOneDaysAgo = addDays(-21);

  const tomorrow = addDays(1);
  const in3 = addDays(3);
  const in5 = addDays(5);
  const in7 = addDays(7);
  const in10 = addDays(10);
  const in14 = addDays(14);
  const in18 = addDays(18);
  const in22 = addDays(22);
  const in26 = addDays(26);

  const demoTasks: Task[] = [
    {
      id: "t1",
      title: "Read pages 120–145",
      subjectId: "5",
      dueDate: tomorrow,
      type: "task",
      periodId: "p1",
    },
    {
      id: "t2",
      title: "Lab Report",
      subjectId: "3",
      dueDate: in3,
      type: "assignment",
      periodId: "p1",
    },
    {
      id: "t3",
      title: "Midterm Exam",
      subjectId: "2",
      dueDate: in7,
      type: "exam",
      periodId: "p1",
    },
    {
      id: "t4",
      title: "Essay plan",
      subjectId: "4",
      dueDate: in10,
      type: "assignment",
      periodId: "p1",
    },
    {
      id: "t5",
      title: "Source analysis",
      subjectId: "5",
      dueDate: in14,
      type: "assignment",
      periodId: "p1",
    },
    {
      id: "t6",
      title: "Chemistry quiz",
      subjectId: "3",
      dueDate: in18,
      type: "exam",
      periodId: "p1",
    },
    {
      id: "t7",
      title: "Complete Chapter 7 worksheet",
      subjectId: "1",
      dueDate: in22,
      type: "homework",
      periodId: "p1",
    },
    {
      id: "t8",
      title: "Practice response paragraph",
      subjectId: "4",
      dueDate: in26,
      type: "homework",
      periodId: "p1",
    },
    {
      id: "t9",
      title: "Complete Chapter 5 Review",
      subjectId: "1",
      dueDate: fourDaysAgo,
      type: "assignment",
      periodId: "p1",
      completed: true,
      completedAt: fourDaysAgo,
      result: {
        score: 18,
        outOf: 20,
        dateRecorded: fourDaysAgo,
        notes: "Stronger on algebra than worded questions.",
      },
    },
    {
      id: "t10",
      title: "Practical write-up",
      subjectId: "3",
      dueDate: nineDaysAgo,
      type: "assignment",
      periodId: "p1",
      completed: true,
      completedAt: nineDaysAgo,
      result: {
        score: 12,
        outOf: 20,
        dateRecorded: nineDaysAgo,
        notes: "Lost marks on evaluation depth.",
      },
    },
    {
      id: "t11",
      title: "Reading quiz",
      subjectId: "4",
      dueDate: fourteenDaysAgo,
      type: "exam",
      periodId: "p1",
      completed: true,
      completedAt: fourteenDaysAgo,
      result: {
        score: 23,
        outOf: 25,
        dateRecorded: fourteenDaysAgo,
      },
    },
    {
      id: "t12",
      title: "Forces test",
      subjectId: "2",
      dueDate: twentyOneDaysAgo,
      type: "exam",
      periodId: "p1",
      completed: true,
      completedAt: twentyOneDaysAgo,
      result: {
        score: 32,
        outOf: 50,
        dateRecorded: twentyOneDaysAgo,
      },
    },
    {
      id: "t13",
      title: "Functions checkpoint",
      subjectId: "1",
      dueDate: sixDaysAgo,
      type: "assignment",
      periodId: "p1",
      completed: true,
      completedAt: sixDaysAgo,
      result: {
        score: 27,
        outOf: 30,
        dateRecorded: sixDaysAgo,
      },
    },
  ];

  const demoStudySessions: StudySession[] = [
    {
      id: "ss1",
      subjectId: "1",
      title: "Chapter 5 review",
      date: withTime(today, 16, 0),
      startTime: formatTime12(16, 0),
      duration: "60 min",
      linkedTaskId: "t9",
      completed: false,
    },
    {
      id: "ss2",
      subjectId: "3",
      title: "Plan lab structure",
      date: withTime(today, 19, 0),
      startTime: formatTime12(19, 0),
      duration: "45 min",
      linkedTaskId: "t2",
      completed: false,
    },
    {
      id: "ss3",
      subjectId: "5",
      title: "History reading",
      date: withTime(yesterday, 17, 30),
      startTime: formatTime12(17, 30),
      duration: "50 min",
      linkedTaskId: "t1",
      completed: true,
      completedAt: withTime(yesterday, 18, 20),
    },
    {
      id: "ss4",
      subjectId: "2",
      title: "Physics formulas",
      date: withTime(twoDaysAgo, 18, 15),
      startTime: formatTime12(18, 15),
      duration: "1h 15m",
      linkedTaskId: "t3",
      completed: true,
      completedAt: withTime(twoDaysAgo, 19, 30),
    },
    {
      id: "ss5",
      subjectId: "4",
      title: "Essay structure practice",
      date: withTime(fourDaysAgo, 16, 45),
      startTime: formatTime12(16, 45),
      duration: "60 min",
      linkedTaskId: "t4",
      completed: true,
      completedAt: withTime(fourDaysAgo, 17, 45),
    },
    {
      id: "ss6",
      subjectId: "1",
      title: "Functions revision",
      date: withTime(sixDaysAgo, 15, 30),
      startTime: formatTime12(15, 30),
      duration: "1h 30m",
      linkedTaskId: "t13",
      completed: true,
      completedAt: withTime(sixDaysAgo, 17, 0),
    },
    {
      id: "ss7",
      subjectId: "3",
      title: "Chemistry recap",
      date: withTime(nineDaysAgo, 18, 0),
      startTime: formatTime12(18, 0),
      duration: "40 min",
      linkedTaskId: "t10",
      completed: true,
      completedAt: withTime(nineDaysAgo, 18, 40),
    },
    {
      id: "ss8",
      subjectId: "4",
      title: "Reading analysis",
      date: withTime(fourteenDaysAgo, 17, 0),
      startTime: formatTime12(17, 0),
      duration: "55 min",
      linkedTaskId: "t11",
      completed: true,
      completedAt: withTime(fourteenDaysAgo, 17, 55),
    },
  ];

  const demoReminders: Reminder[] = [
    {
      id: "r1",
      title: "Pack bag tonight",
      notes: "Laptop charger, workbook, sport kit",
      dueDate: today,
      time: "20:30",
      repeat: "none",
      completed: false,
      createdAt: today,
    },
    {
      id: "r2",
      title: "Email teacher about extension question",
      dueDate: tomorrow,
      time: "16:15",
      repeat: "none",
      completed: false,
      createdAt: yesterday,
    },
    {
      id: "r3",
      title: "Buy new pens",
      notes: "Black + blue",
      repeat: "none",
      completed: false,
      createdAt: sixDaysAgo,
    },
    {
      id: "r4",
      title: "Library books due back",
      dueDate: in5,
      time: "15:45",
      repeat: "none",
      completed: false,
      createdAt: twoDaysAgo,
    },
  ];

  return {
    subjects: defaultSubjects,
    periods: DEMO_PERIODS,
    tasks: demoTasks,
    studySessions: demoStudySessions,
    reminders: demoReminders,
  };
};

const seedDemoPeriodsKeyIfMissing = (periods: Period[]) => {
  try {
    const existing = localStorage.getItem(PERIODS_STORAGE_KEY);
    if (existing) return;

    const stored = periods.map((p) => ({
      id: p.id,
      name: p.name,
      startDate: p.startDate.toISOString(),
      endDate: p.endDate.toISOString(),
    }));

    localStorage.setItem(PERIODS_STORAGE_KEY, JSON.stringify(stored));
  } catch {}
};

const navTabButtonClass = (active: boolean) =>
  [
    "h-9 px-3 rounded-xl text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground/90 hover:bg-muted",
  ].join(" ");

const navTabButtonClassMobile = (active: boolean) =>
  [
    "shrink-0 h-9 px-3 rounded-xl text-sm font-medium transition-colors",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
    active
      ? "bg-primary text-primary-foreground shadow-sm"
      : "text-foreground/90 hover:bg-muted",
  ].join(" ");

function debounce<T extends (...args: any[]) => void>(fn: T, ms: number) {
  let t: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (t) clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

function LockedPremiumView({
  feature,
  onGoToSettings,
}: {
  feature: "marks" | "insights";
  onGoToSettings: () => void;
}) {
  const title = feature === "marks" ? "Marks" : "Insights";
  const description =
    feature === "marks"
      ? "Track results across the year and keep all your marks in one place."
      : "Unlock advanced analytics and deeper insights into your study and results.";

  return (
    <div className="mx-auto max-w-5xl px-6 py-8 md:px-10">
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        <div className="border-b border-border bg-muted/10 px-6 py-5 md:px-8">
          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background/70">
            <Lock className="h-5 w-5 text-muted-foreground" />
          </div>
          <h1 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
            {title} is a Premium feature
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p>
        </div>

        <div className="space-y-6 px-6 py-6 md:px-8 md:py-8">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">Marks</div>
              <div className="mt-1 text-sm text-muted-foreground">
                Log results, keep track of assessments, and build a record across
                the year.
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">
                Insights
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                See stronger analytics, patterns, and performance trends over
                time.
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold text-foreground">
                Custom widgets
              </div>
              <div className="mt-1 text-sm text-muted-foreground">
                Personalise your dashboard and insights layout with
                interchangeable widgets.
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-muted/20 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Sparkles className="h-4 w-4" />
                  Premium setup is coming next
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Billing is not connected yet, so this feature is locked for
                  now in the app and open in demo mode.
                </div>
              </div>

              <button
                type="button"
                onClick={onGoToSettings}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-card px-4 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                Go to Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App({ mode = "app" }: { mode?: AppMode }) {
  const hydrated = useRef(false);
  const [isReady, setIsReady] = useState(false);

  const { isLoaded: userLoaded, isSignedIn, user } = useUser();
  const { session } = useSession();

  const supabase = useMemo(() => {
    if (!session) return null;
    return getSupabaseClient(() => session.getToken() ?? Promise.resolve(null));
  }, [session]);

  const [activeTab, setActiveTab] = useState<Tab>("dashboard");

  const [subjects, setSubjects] = useState<Subject[]>(
    mode === "demo" ? defaultSubjects : []
  );
  const [periods, setPeriods] = useState<Period[]>(
    mode === "demo" ? DEMO_PERIODS : []
  );
  const [tasks, setTasks] = useState<Task[]>([]);
  const [studySessions, setStudySessions] = useState<StudySession[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);

  const storageKey = mode === "demo" ? DEMO_STORAGE_KEY : REAL_STORAGE_KEY;
  const [settingsOpenSection, setSettingsOpenSection] =
    useState<SettingsOpenSection>(null);

  const [showMobileDesktopHint, setShowMobileDesktopHint] = useState(false);
  const [showWhatsNew, setShowWhatsNew] = useState(false);
  const [plan, setPlan] = useState<Plan>(mode === "demo" ? "premium" : "free");

  const hasPremium = plan === "premium";
  const isPremiumTab = (tab: Tab) => tab === "insights" || tab === "marks";

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("msp-desktop-hint-dismissed");
      if (!dismissed) setShowMobileDesktopHint(true);
    } catch {
      setShowMobileDesktopHint(true);
    }
  }, []);

  const dismissMobileDesktopHint = () => {
    setShowMobileDesktopHint(false);
    try {
      localStorage.setItem("msp-desktop-hint-dismissed", "1");
    } catch {}
  };

  const pruneAutoDeletedCompletedTasks = (input: Task[]) => {
    const now = Date.now();
    return input.filter((t) => {
      if (!t.completed || !t.completedAt) return true;
      return now - t.completedAt.getTime() < AUTO_DELETE_COMPLETED_AFTER_MS;
    });
  };

  const markReadyNextPaint = () => {
    requestAnimationFrame(() => setIsReady(true));
  };

  const periodIdForDate = (d: Date) => {
    const t = d.getTime();
    const match = periods.find(
      (p) => t >= p.startDate.getTime() && t <= p.endDate.getTime()
    );
    return match?.id;
  };

  const applyParsedState = (parsed: any) => {
    setSubjects(Array.isArray(parsed.subjects) ? parsed.subjects : []);

    setPeriods(
      Array.isArray(parsed.periods)
        ? parsed.periods.map((p: any) => ({
            id: String(p.id),
            name: String(p.name),
            startDate: p?.startDate ? new Date(p.startDate) : new Date(),
            endDate: p?.endDate ? new Date(p.endDate) : new Date(),
          }))
        : mode === "demo"
          ? DEMO_PERIODS
          : []
    );

    setTasks(
      pruneAutoDeletedCompletedTasks(
        (parsed.tasks ?? []).map((t: any) => ({
          ...t,
          dueDate: t?.dueDate ? new Date(t.dueDate) : new Date(),
          completedAt: t?.completedAt ? new Date(t.completedAt) : undefined,
          result: t?.result
            ? {
                ...t.result,
                score:
                  typeof t?.result?.score === "number"
                    ? t.result.score
                    : Number(t?.result?.score ?? 0),
                outOf:
                  typeof t?.result?.outOf === "number"
                    ? t.result.outOf
                    : Number(t?.result?.outOf ?? 100),
                dateRecorded: t?.result?.dateRecorded
                  ? new Date(t.result.dateRecorded)
                  : new Date(),
              }
            : undefined,
        }))
      )
    );

    setStudySessions(
      (parsed.studySessions ?? []).map((s: any) => ({
        ...s,
        title: s?.title?.trim() || "Study session",
        date: s?.date ? new Date(s.date) : new Date(),
        completedAt: s?.completedAt ? new Date(s.completedAt) : undefined,
      }))
    );

    setReminders(
      (parsed.reminders ?? []).map((r: any) => ({
        ...r,
        title: String(r?.title ?? "").trim(),
        notes: r?.notes ? String(r.notes) : undefined,
        dueDate: r?.dueDate ? new Date(r.dueDate) : undefined,
        completedAt: r?.completedAt ? new Date(r.completedAt) : undefined,
        createdAt: r?.createdAt ? new Date(r.createdAt) : undefined,
      }))
    );
  };

  const makeStateSnapshot = () => ({
    subjects,
    periods,
    tasks,
    studySessions,
    reminders,
  });

  useEffect(() => {
    if (mode === "demo") {
      setPlan("premium");
      return;
    }

    if (!userLoaded) return;

    if (!isSignedIn || !supabase || !user?.id) {
      setPlan("free");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const nextPlan = await fetchUserPlan(supabase, user.id);
        if (!cancelled) setPlan(nextPlan);
      } catch (e) {
        console.error("Failed to fetch user plan:", e);
        if (!cancelled) setPlan("free");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [mode, userLoaded, isSignedIn, supabase, user?.id]);

  useEffect(() => {
    if (mode !== "app") return;
    if (!userLoaded) return;
    if (!isSignedIn) return;
    if (!user?.id) return;

    const key = `msp-whatsnew:${WHATS_NEW_VERSION_KEY}:${user.id}`;
    try {
      if (localStorage.getItem(key) === "1") return;
      setShowWhatsNew(true);
    } catch {
      setShowWhatsNew(true);
    }
  }, [mode, userLoaded, isSignedIn, user?.id]);

  const closeWhatsNew = () => {
    if (mode === "app" && user?.id) {
      const key = `msp-whatsnew:${WHATS_NEW_VERSION_KEY}:${user.id}`;
      try {
        localStorage.setItem(key, "1");
      } catch {}
    }
    setShowWhatsNew(false);
  };

  useEffect(() => {
    if (mode === "demo") {
      try {
        localStorage.removeItem(DEMO_STORAGE_KEY);
      } catch {}

      const seeded = makeDefaultData();
      seedDemoPeriodsKeyIfMissing(seeded.periods);

      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);

      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    if (!userLoaded) return;

    if (!isSignedIn || !supabase) {
      hydrated.current = true;
      markReadyNextPaint();
      return;
    }

    (async () => {
      const remote = await fetchPlannerState(supabase);

      const remoteHasPlannerData =
        !!remote &&
        (Array.isArray((remote as any).tasks) ||
          Array.isArray((remote as any).subjects) ||
          Array.isArray((remote as any).periods) ||
          Array.isArray((remote as any).studySessions) ||
          Array.isArray((remote as any).reminders));

      if (remoteHasPlannerData) {
        applyParsedState(remote);
        try {
          localStorage.setItem(storageKey, JSON.stringify(remote));
        } catch {}
        hydrated.current = true;
        markReadyNextPaint();
        return;
      }

      const rawLocal = (() => {
        try {
          return localStorage.getItem(storageKey);
        } catch {
          return null;
        }
      })();

      if (rawLocal) {
        try {
          const parsedLocal = JSON.parse(rawLocal);
          applyParsedState(parsedLocal);
          await upsertPlannerState(supabase, parsedLocal);
          hydrated.current = true;
          markReadyNextPaint();
          return;
        } catch {}
      }

      setSubjects([]);
      setPeriods([]);
      setTasks([]);
      setStudySessions([]);
      setReminders([]);

      await upsertPlannerState(supabase, {
        subjects: [],
        periods: [],
        tasks: [],
        studySessions: [],
        reminders: [],
      });

      hydrated.current = true;
      markReadyNextPaint();
    })().catch((e) => {
      console.error("Failed to init planner state:", e);
      hydrated.current = true;
      markReadyNextPaint();
    });
  }, [mode, storageKey, userLoaded, isSignedIn, supabase]);

  const saveRemoteDebounced = useMemo(
    () =>
      debounce(async (snapshot: Record<string, unknown>) => {
        if (!supabase) return;
        await upsertPlannerState(supabase, snapshot);
      }, 700),
    [supabase]
  );

  useEffect(() => {
    if (!hydrated.current) return;
    if (mode === "demo") return;

    const snapshot = makeStateSnapshot();

    try {
      localStorage.setItem(storageKey, JSON.stringify(snapshot));
    } catch {}

    if (mode === "app" && Boolean(isSignedIn) && supabase) {
      saveRemoteDebounced(snapshot);
    }
  }, [
    subjects,
    periods,
    tasks,
    studySessions,
    reminders,
    storageKey,
    mode,
    isSignedIn,
    supabase,
    saveRemoteDebounced,
  ]);

  const handleClearAllData = async () => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(PERIODS_STORAGE_KEY);
    } catch {}

    if (mode === "demo") {
      const seeded = makeDefaultData();
      seedDemoPeriodsKeyIfMissing(seeded.periods);

      setSubjects(seeded.subjects);
      setPeriods(seeded.periods);
      setTasks(seeded.tasks);
      setStudySessions(seeded.studySessions);
      setReminders(seeded.reminders);
      setActiveTab("dashboard");
      return;
    }

    setSubjects([]);
    setPeriods([]);
    setTasks([]);
    setStudySessions([]);
    setReminders([]);
    setActiveTab("dashboard");

    if (Boolean(isSignedIn) && supabase) {
      try {
        await clearPlannerState(supabase);
      } catch (e) {
        console.error("Failed to clear remote planner state:", e);
      }
    }
  };

  const handleAddSubject = (name: string, color: string) =>
    setSubjects((p) => [...p, { id: Date.now().toString(), name, color }]);

  const handleUpdateSubject = (id: string, name: string, color: string) =>
    setSubjects((p) =>
      p.map((s) => (s.id === id ? { ...s, name, color } : s))
    );

  const handleDeleteSubject = (id: string) => {
    setSubjects((p) => p.filter((s) => s.id !== id));
    setTasks((p) => p.filter((t) => t.subjectId !== id));
    setStudySessions((p) => p.filter((s) => s.subjectId !== id));
  };

  const handleAddTask = (t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) => [
      ...p,
      {
        ...t,
        periodId: inferredPeriodId ?? t.periodId,
        id: Date.now().toString(),
      },
    ]);
  };

  const handleUpdateTask = (id: string, t: Omit<Task, "id">) => {
    const inferredPeriodId = periodIdForDate(t.dueDate);
    setTasks((p) =>
      p.map((x) =>
        x.id === id
          ? { ...t, periodId: inferredPeriodId ?? t.periodId, id }
          : x
      )
    );
  };

  const handleDeleteTask = (id: string) => {
    setTasks((p) => p.filter((t) => t.id !== id));
    setStudySessions((p) =>
      p.map((s) => (s.linkedTaskId === id ? { ...s, linkedTaskId: undefined } : s))
    );
  };

  const toggleTaskCompleted = (id: string) =>
    setTasks((p) =>
      p.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, completedAt: new Date() } : t
      )
    );

  const handleAddStudySession = (s: Omit<StudySession, "id">) =>
    setStudySessions((p) => [
      ...p,
      { ...s, id: Date.now().toString(), completed: false },
    ]);

  const handleUpdateStudySession = (id: string, s: Omit<StudySession, "id">) =>
    setStudySessions((p) => p.map((x) => (x.id === id ? { ...s, id } : x)));

  const handleDeleteStudySession = (id: string) =>
    setStudySessions((p) => p.filter((s) => s.id !== id));

  const handleToggleSessionCompleted = (id: string) =>
    setStudySessions((p) =>
      p.map((s) =>
        s.id === id ? { ...s, completed: !s.completed, completedAt: new Date() } : s
      )
    );

  const handleAddReminder = (r: Omit<Reminder, "id">) =>
    setReminders((p) => [
      ...p,
      {
        ...r,
        id: Date.now().toString(),
        createdAt: r.createdAt ?? new Date(),
        completed: r.completed ?? false,
      },
    ]);

  const handleUpdateReminder = (id: string, r: Omit<Reminder, "id">) =>
    setReminders((p) => p.map((x) => (x.id === id ? { ...r, id } : x)));

  const handleDeleteReminder = (id: string) =>
    setReminders((p) => p.filter((r) => r.id !== id));

  const handleToggleReminderCompleted = (id: string) =>
    setReminders((p) =>
      p.map((r) => {
        if (r.id !== id) return r;
        const nextCompleted = !r.completed;
        return {
          ...r,
          completed: nextCompleted,
          completedAt: nextCompleted ? new Date() : undefined,
        };
      })
    );

  const openTab = (tab: Tab) => {
    setActiveTab(tab);
  };

  const tabs: Array<[Tab, string]> = [
    ["dashboard", "Dashboard"],
    ["calendar", "Calendar"],
    ["tasks", "Tasks"],
    ["study", "Study Log"],
    ["insights", "Insights"],
    ["marks", "Marks"],
    ["reminders", "Reminders"],
  ];

  if (!isReady) return <LoadingScreen label="Opening your planner…" />;

  if (mode === "app" && userLoaded && !Boolean(isSignedIn)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-6">
        <div className="space-y-4 rounded-2xl border border-border bg-card p-6">
          <div className="text-lg font-semibold">
            Sign in to sync your planner
          </div>
          <SignInButton mode="modal">
            <button
              className="rounded-xl border border-border px-4 py-2 transition hover:bg-muted"
              type="button"
            >
              Sign in
            </button>
          </SignInButton>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <WhatsNewModal
        open={mode === "app" && Boolean(isSignedIn) && showWhatsNew}
        onClose={closeWhatsNew}
        versionLabel={WHATS_NEW_VERSION_LABEL}
        updates={WHATS_NEW_UPDATES}
      />

      <nav className="sticky top-0 z-10 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex min-w-0 flex-col leading-tight">
              <span className="truncate font-semibold text-foreground">
                MyStudyPlanner
              </span>
              <span className="truncate text-[11px] text-muted-foreground">
                Made by students, for students
              </span>
            </div>

            <div className="hidden items-center gap-1 md:flex">
              {tabs.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => openTab(k)}
                  className={navTabButtonClass(activeTab === k)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span>{l}</span>
                    {isPremiumTab(k) && !hasPremium ? (
                      <Lock className="h-3.5 w-3.5 opacity-70" />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />

            <button
              onClick={() => setActiveTab("settings")}
              className={navTabButtonClass(activeTab === "settings")}
              type="button"
            >
              Settings
            </button>

            {mode === "demo" ? (
              <span className="hidden items-center rounded-full border border-border bg-muted/40 px-3 py-1.5 text-xs font-medium text-foreground sm:inline-flex">
                Sample data preview
              </span>
            ) : (
              <div className="inline-flex items-center gap-2 rounded-xl border border-border px-3 py-1.5 transition-colors hover:bg-muted/40">
                <span className="hidden text-sm text-muted-foreground sm:inline">
                  Account
                </span>

                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    variables: {
                      colorPrimary: "hsl(var(--primary))",
                      colorText: "hsl(var(--foreground))",
                      colorTextSecondary: "hsl(var(--muted-foreground))",
                      colorBackground: "hsl(var(--card))",
                      colorNeutral: "hsl(var(--border))",
                      borderRadius: "12px",
                      fontFamily: "inherit",
                    },
                    elements: {
                      userButtonAvatarBox: "ring-1 ring-border",
                      userButtonPopoverCard:
                        "border border-border shadow-lg bg-card",
                      userButtonPopoverFooter: "hidden",
                    },
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label="Account"
                      labelIcon={<User className="h-4 w-4" />}
                      onClick={() => setActiveTab("settings")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-border md:hidden">
          <div className="mx-auto max-w-7xl px-3 py-2">
            <div className="no-scrollbar flex gap-1 overflow-x-auto">
              {tabs.map(([k, l]) => (
                <button
                  key={k}
                  onClick={() => openTab(k)}
                  className={navTabButtonClassMobile(activeTab === k)}
                  type="button"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <span>{l}</span>
                    {isPremiumTab(k) && !hasPremium ? (
                      <Lock className="h-3.5 w-3.5 opacity-70" />
                    ) : null}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {mode === "demo" ? (
          <div className="border-t border-border bg-primary/10">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-2.5 md:px-10">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-foreground">
                    Preview mode
                  </span>
                  <span className="hidden text-xs text-muted-foreground sm:block">
                    You’re using sample data. Changes won’t sync or be saved to
                    an account.
                  </span>
                  <span className="text-[11px] text-muted-foreground sm:hidden">
                    Sample data • not saved
                  </span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/sign-in"
                  className="rounded-lg px-3 py-2 text-sm text-foreground transition hover:bg-muted/60"
                >
                  Sign in
                </Link>
                <Link
                  href="/sign-up"
                  className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-95"
                >
                  Create account
                </Link>
              </div>
            </div>
          </div>
        ) : null}
      </nav>

      {showMobileDesktopHint && (
        <div className="border-b border-border bg-card/80 backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-7xl items-start justify-between gap-3 px-4 py-2">
            <div className="text-[12px] leading-5 text-muted-foreground">
              Best on desktop. Mobile is great for quick check-ins.
            </div>

            <button
              onClick={dismissMobileDesktopHint}
              className="shrink-0 rounded-lg p-2 text-muted-foreground transition hover:bg-muted/50 hover:text-foreground"
              aria-label="Dismiss"
              type="button"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <main>
        {activeTab === "dashboard" && (
          <Dashboard
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onOpenStudyPlanner={() => setActiveTab("study")}
            onOpenTasks={() => setActiveTab("tasks")}
            onOpenSettings={(section) => {
              setActiveTab("settings");
              setSettingsOpenSection(section ?? null);
            }}
          />
        )}

        {activeTab === "calendar" && (
          <Calendar
            studySessions={studySessions}
            tasks={tasks}
            reminders={reminders}
            subjects={subjects}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleTaskCompleted={toggleTaskCompleted}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
            onToggleStudySessionCompleted={handleToggleSessionCompleted}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleReminderCompleted={handleToggleReminderCompleted}
          />
        )}

        {activeTab === "tasks" && (
          <Tasks
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddTask={handleAddTask}
            onUpdateTask={handleUpdateTask}
            onDeleteTask={handleDeleteTask}
            onToggleCompleted={toggleTaskCompleted}
          />
        )}

        {activeTab === "study" && (
          <StudyPlanner
            tasks={tasks}
            subjects={subjects}
            studySessions={studySessions}
            onAddStudySession={handleAddStudySession}
            onUpdateStudySession={handleUpdateStudySession}
            onDeleteStudySession={handleDeleteStudySession}
            onToggleSessionCompleted={handleToggleSessionCompleted}
          />
        )}

        {activeTab === "insights" &&
          (hasPremium ? (
            <Insights
              tasks={tasks}
              studySessions={studySessions}
              subjects={subjects}
            />
          ) : (
            <LockedPremiumView
              feature="insights"
              onGoToSettings={() => setActiveTab("settings")}
            />
          ))}

        {activeTab === "marks" &&
          (hasPremium ? (
            <Marks
              tasks={tasks}
              subjects={subjects}
              onUpdateTask={handleUpdateTask}
            />
          ) : (
            <LockedPremiumView
              feature="marks"
              onGoToSettings={() => setActiveTab("settings")}
            />
          ))}

        {activeTab === "reminders" && (
          <Reminders
            reminders={reminders}
            onAddReminder={handleAddReminder}
            onUpdateReminder={handleUpdateReminder}
            onDeleteReminder={handleDeleteReminder}
            onToggleCompleted={handleToggleReminderCompleted}
          />
        )}

        {activeTab === "settings" && (
          <Settings
            appMode={mode}
            subjects={subjects}
            tasks={tasks}
            studyItems={[]}
            studySessions={studySessions}
            onAddSubject={handleAddSubject}
            onUpdateSubject={handleUpdateSubject}
            onDeleteSubject={handleDeleteSubject}
            onClearAllData={handleClearAllData}
            openSection={settingsOpenSection}
            onOpenSectionHandled={() => setSettingsOpenSection(null)}
          />
        )}
      </main>
    </div>
  );
}