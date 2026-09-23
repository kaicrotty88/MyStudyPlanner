export const STUDY_TIMER_STORAGE_PREFIX = "mystudyplanner-live-study-timer";
export const STUDY_TIMER_CHANGE_EVENT = "mystudyplanner-study-timer-change";

export type StoredStudyTimerState = {
  running: boolean;
  startedAt: number | null;
  accumulatedSeconds: number;
  subjectId: string;
  linkedTaskId?: string;
  plannedSessionId?: string;
  title: string;
};

export const EMPTY_STUDY_TIMER: StoredStudyTimerState = {
  running: false,
  startedAt: null,
  accumulatedSeconds: 0,
  subjectId: "",
  title: "",
};

export const timerStorageKeyForContext = (mode: "demo" | "app", userId?: string | null) =>
  mode === "demo"
    ? `${STUDY_TIMER_STORAGE_PREFIX}:demo`
    : userId
      ? `${STUDY_TIMER_STORAGE_PREFIX}:user:${userId}`
      : `${STUDY_TIMER_STORAGE_PREFIX}:guest`;

export const elapsedStudyTimerSeconds = (timer: StoredStudyTimerState, now = Date.now()) =>
  Math.max(0, timer.accumulatedSeconds + (timer.running && timer.startedAt ? Math.floor((now - timer.startedAt) / 1000) : 0));

export const readStoredStudyTimer = (storageKey: string): StoredStudyTimerState => {
  if (typeof window === "undefined") return EMPTY_STUDY_TIMER;
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return EMPTY_STUDY_TIMER;
    const parsed = JSON.parse(raw);
    return { ...EMPTY_STUDY_TIMER, ...parsed };
  } catch {
    return EMPTY_STUDY_TIMER;
  }
};

export const writeStoredStudyTimer = (storageKey: string, timer: StoredStudyTimerState) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(timer));
    window.dispatchEvent(new CustomEvent(STUDY_TIMER_CHANGE_EVENT, { detail: { storageKey, timer } }));
  } catch {}
};

export const pauseStoredStudyTimer = (storageKey: string) => {
  const current = readStoredStudyTimer(storageKey);
  if (!current.running) return current;
  const paused: StoredStudyTimerState = {
    ...current,
    running: false,
    startedAt: null,
    accumulatedSeconds: elapsedStudyTimerSeconds(current),
  };
  writeStoredStudyTimer(storageKey, paused);
  return paused;
};
