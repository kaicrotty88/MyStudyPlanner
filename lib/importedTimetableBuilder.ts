import type {
  ImportedCalendarEvent,
  TimetableClass,
  TimetableCycle,
  TimetablePeriod,
  TimetableSettings,
  TimetableWeek,
} from "@/components/models";

type Source = "google" | "ics";

type BuildOptions = {
  events: ImportedCalendarEvent[];
  source: Source;
  sourceLabel: string;
  settings: TimetableSettings;
  periods: TimetablePeriod[];
  existingClasses: TimetableClass[];
};

export type ImportedTimetableBuildResult = {
  settings: TimetableSettings;
  periods: TimetablePeriod[];
  classes: Array<Omit<TimetableClass, "id">>;
  regularEvents: ImportedCalendarEvent[];
  gridCount: number;
  commitmentCount: number;
};

const startOfMonday = (date: Date) => {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  const day = value.getDay();
  value.setDate(
    value.getDate() -
      (day === 0 ? 6 : day - 1),
  );
  return value;
};

const formatTime = (date: Date) =>
  `${String(date.getHours()).padStart(
    2,
    "0",
  )}:${String(date.getMinutes()).padStart(
    2,
    "0",
  )}`;

const extractTeacher = (description?: string) => {
  const match = description?.match(
    /Attending Staff\s*:\s*([^\n]+)/i,
  );
  const value = match?.[1]?.trim();
  return value || undefined;
};

const minutes = (time: string) => {
  const [hours, mins] = time
    .split(":")
    .map(Number);
  return hours * 60 + mins;
};

const overlaps = (
  left: { start: string; end: string },
  right: { start: string; end: string },
) =>
  minutes(left.start) < minutes(right.end) &&
  minutes(right.start) < minutes(left.end);

const mostCommon = (
  values: Array<string | undefined>,
) => {
  const counts = new Map<string, number>();

  values
    .filter(
      (value): value is string =>
        Boolean(value && value.trim()),
    )
    .forEach((value) =>
      counts.set(
        value,
        (counts.get(value) || 0) + 1,
      ),
    );

  return [...counts.entries()].sort(
    (left, right) => right[1] - left[1],
  )[0]?.[0];
};

const parityForDate = (
  date: Date,
  cycle: TimetableCycle,
  cycleStart?: Date,
): "A" | "B" => {
  if (
    cycle !== "fortnightly" ||
    !cycleStart
  ) {
    return "A";
  }

  const difference = Math.floor(
    (startOfMonday(date).getTime() -
      startOfMonday(cycleStart).getTime()) /
      (7 * 24 * 60 * 60 * 1000),
  );

  return Math.abs(difference) % 2 === 0
    ? "A"
    : "B";
};

const finalWeek = (
  weeks: Set<"A" | "B">,
  cycle: TimetableCycle,
): TimetableWeek => {
  if (cycle === "weekly") {
    return "both";
  }

  if (
    weeks.has("A") &&
    weeks.has("B")
  ) {
    return "both";
  }

  return weeks.has("B") ? "B" : "A";
};

const sourceKey = (
  item: Omit<TimetableClass, "id">,
) =>
  [
    item.source,
    item.title.trim().toLowerCase(),
    item.subjectId || "",
    item.dayOfWeek,
    item.periodId || "",
    item.startTime || "",
    item.endTime || "",
    item.week,
    item.location || "",
  ].join("|");

export function buildImportedTimetable({
  events,
  source,
  sourceLabel,
  settings,
  periods,
  existingClasses,
}: BuildOptions): ImportedTimetableBuildResult {
  const timetableEvents = events.filter(
    (event) =>
      event.kind === "class" &&
      !event.allDay,
  );

  const regularEvents = events.filter(
    (event) =>
      event.kind !== "class" ||
      event.allDay,
  );

  if (!timetableEvents.length) {
    return {
      settings,
      periods,
      classes: [],
      regularEvents,
      gridCount: 0,
      commitmentCount: 0,
    };
  }

  const dates = timetableEvents
    .map((event) => event.start)
    .sort(
      (left, right) =>
        left.getTime() - right.getTime(),
    );

  const cycleStart =
    settings.cycleStartDate ||
    startOfMonday(dates[0]);

  const isSchoolExport = events.some(
    (event) =>
      /compass|school|timetable/i.test(
        `${event.calendarName || ""} ${
          event.description || ""
        }`,
      ),
  );

  const cycle: TimetableCycle =
    isSchoolExport
      ? "fortnightly"
      : settings.cycle;

  const academicEvents =
    timetableEvents.filter(
      (event) =>
        Boolean(event.subjectId) &&
        event.start.getDay() >= 1 &&
        event.start.getDay() <= 5,
    );

  const slotCounts = new Map<
    string,
    {
      start: string;
      end: string;
      count: number;
    }
  >();

  academicEvents.forEach((event) => {
    const start = formatTime(event.start);
    const end = formatTime(event.end);
    const key = `${start}|${end}`;
    const current = slotCounts.get(key);

    slotCounts.set(key, {
      start,
      end,
      count: (current?.count || 0) + 1,
    });
  });

  const hasManualGrid =
    existingClasses.some(
      (item) =>
        Boolean(item.periodId) &&
        (!item.source ||
          item.source === "manual"),
    );

  let nextPeriods = periods;
  let usablePeriods: TimetablePeriod[];

  if (hasManualGrid) {
    usablePeriods = periods.filter(
      (period) => period.type === "class",
    );
  } else {
    const candidates = [
      ...slotCounts.values(),
    ]
      .filter((slot) => slot.count >= 2)
      .sort(
        (left, right) =>
          right.count - left.count ||
          left.start.localeCompare(
            right.start,
          ),
      );

    const selected: typeof candidates = [];

    candidates.forEach((candidate) => {
      if (
        !selected.some((period) =>
          overlaps(period, candidate),
        )
      ) {
        selected.push(candidate);
      }
    });

    selected.sort((left, right) =>
      left.start.localeCompare(right.start),
    );

    const generated = selected.map(
      (slot, index): TimetablePeriod => ({
        id: `imported-period-${slot.start.replace(
          ":",
          "",
        )}-${slot.end.replace(":", "")}`,
        name: `Period ${index + 1}`,
        startTime: slot.start,
        endTime: slot.end,
        type: "class",
        order: index + 1,
      }),
    );

    if (generated.length >= 2) {
      nextPeriods = generated;
      usablePeriods = generated;
    } else {
      usablePeriods = periods.filter(
        (period) => period.type === "class",
      );
    }
  }

  const periodByTimes = new Map(
    usablePeriods.map((period) => [
      `${period.startTime}|${period.endTime}`,
      period,
    ]),
  );

  type Group = {
    events: ImportedCalendarEvent[];
    weeks: Set<"A" | "B">;
    period?: TimetablePeriod;
  };

  const groups = new Map<string, Group>();

  timetableEvents.forEach((event) => {
    const startTime = formatTime(event.start);
    const endTime = formatTime(event.end);
    const period =
      event.subjectId &&
      event.start.getDay() >= 1 &&
      event.start.getDay() <= 5
        ? periodByTimes.get(
            `${startTime}|${endTime}`,
          )
        : undefined;

    const baseKey = [
      event.subjectId || "",
      event.subjectName ||
        event.title.trim().toLowerCase(),
      event.start.getDay(),
      period?.id || "",
      period ? "" : startTime,
      period ? "" : endTime,
    ].join("|");

    const current = groups.get(baseKey) || {
      events: [],
      weeks: new Set<"A" | "B">(),
      period,
    };

    current.events.push(event);
    current.weeks.add(
      parityForDate(
        event.start,
        cycle,
        cycleStart,
      ),
    );
    groups.set(baseKey, current);
  });

  const existingKeys = new Set(
    existingClasses.map((item) =>
      sourceKey({
        ...item,
        source:
          item.source || "manual",
      }),
    ),
  );

  const classes: Array<
    Omit<TimetableClass, "id">
  > = [];
  let gridCount = 0;
  let commitmentCount = 0;

  groups.forEach((group) => {
    const first = group.events[0];
    const period = group.period;
    const location = mostCommon(
      group.events.map((event) =>
        event.location &&
        event.location !== "UNKNOWN"
          ? event.location
          : undefined,
      ),
    );
    const teacher = mostCommon(
      group.events.map((event) =>
        extractTeacher(event.description),
      ),
    );

    const item: Omit<
      TimetableClass,
      "id"
    > = {
      subjectId: first.subjectId,
      title:
        first.subjectName ||
        first.title,
      dayOfWeek:
        first.start.getDay() as TimetableClass["dayOfWeek"],
      periodId: period?.id,
      startTime: period
        ? period.startTime
        : formatTime(first.start),
      endTime: period
        ? period.endTime
        : formatTime(first.end),
      week: finalWeek(group.weeks, cycle),
      location,
      teacher,
      notes: `Imported from ${sourceLabel}. Fully editable in MyStudyPlanner.`,
      source,
      sourceLabel,
      createdAt: new Date(),
    };

    const key = sourceKey(item);

    if (!existingKeys.has(key)) {
      existingKeys.add(key);
      classes.push(item);

      if (period) {
        gridCount += 1;
      } else {
        commitmentCount += 1;
      }
    }
  });

  return {
    settings: {
      ...settings,
      mode:
        gridCount > 0
          ? "school"
          : settings.mode,
      cycle,
      cycleStartDate:
        cycle === "fortnightly"
          ? cycleStart
          : settings.cycleStartDate,
    },
    periods: nextPeriods,
    classes,
    regularEvents,
    gridCount,
    commitmentCount,
  };
}