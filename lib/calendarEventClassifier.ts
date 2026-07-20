import type {
  ImportedCalendarEvent,
  ImportedCalendarKind,
  Subject,
} from "@/components/models";

const COLORS = [
  "#5F7F68",
  "#6B7FA3",
  "#8B6FA8",
  "#B7795B",
  "#4F8C8D",
  "#8A6F5A",
  "#7B879D",
  "#9A6F82",
];

const ACADEMIC_CLASS_WORDS = [
  "class",
  "lesson",
  "lecture",
  "tutorial",
  "seminar",
  "workshop",
  "period",
  "lab",
  "laboratory",
];

const RECURRING_COMMITMENT_WORDS = [
  "training",
  "practice",
  "work shift",
  "shift",
  "club",
  "rehearsal",
  "tutor",
  "tutoring",
  "gym",
  "mentor",
  "homeroom",
  "roll call",
  "pastoral",
  "chapel",
  "study period",
  "free period",
  "1st xi",
  "2nd xi",
  "opens",
];

const DEFINITE_ONE_OFF_WORDS = [
  "exam",
  "test",
  "assessment",
  "assignment",
  "deadline",
  "due",
  "appointment",
  "birthday",
  "holiday",
  "presentation",
  "assembly",
  "excursion",
  "fixture",
  "game",
  "match",
  "competition",
  "ceremony",
  "conference",
];

const SUBJECT_ALIASES: Record<string, string[]> = {
  mathematics: [
    "math",
    "maths",
    "mathematics",
    "calculus",
    "algebra",
    "geometry",
  ],
  "mathematics advanced": [
    "math advanced",
    "maths advanced",
    "mathematics advanced",
    "maa",
  ],
  "mathematics extension": [
    "math extension",
    "maths extension",
    "mathematics extension",
    "extension 1",
    "max",
  ],
  english: ["english", "literature", "writing"],
  "english advanced": ["english advanced", "ena"],
  physics: ["physics"],
  chemistry: ["chemistry", "chem"],
  biology: ["biology", "bio"],
  economics: ["economics", "economy", "econ"],
  history: ["history"],
  engineering: [
    "engineering",
    "engineering studies",
    "ngin",
  ],
  business: [
    "business studies",
    "business",
    "bus",
  ],
  legal: [
    "legal studies",
    "legal",
    "leg",
  ],
};

const normalise = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const compact = (value: string) =>
  value.toUpperCase().replace(/[^A-Z0-9/.-]/g, "");

const hash = (value: string) => {
  let result = 0;

  for (let index = 0; index < value.length; index += 1) {
    result =
      (result * 31 + value.charCodeAt(index)) >>> 0;
  }

  return result;
};

export const stableImportedColor = (seed: string) =>
  COLORS[hash(seed || "calendar") % COLORS.length];

export type SchoolCodeDetails = {
  label: string;
  kind: ImportedCalendarKind;
  subjectHints: string[];
  allowSubjectMatch: boolean;
};

export function decodeSchoolCalendarCode(
  rawTitle: string,
): SchoolCodeDetails | undefined {
  const title = compact(rawTitle);

  if (/^\d{2}T\d+$/.test(title)) {
    return {
      label: "Mentor Period",
      kind: "class",
      subjectHints: [],
      allowSubjectMatch: false,
    };
  }

  if (
    title.includes("DP/") ||
    title.includes("STUDY.")
  ) {
    return {
      label: "Study Period",
      kind: "class",
      subjectHints: [],
      allowSubjectMatch: false,
    };
  }

  if (/^\d{2}EC[A-Z0-9]*$/.test(title)) {
    return {
      label: "Economics",
      kind: "class",
      subjectHints: ["economics", "econ"],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}ENA[A-Z0-9]*$/.test(title)) {
    return {
      label: "English Advanced",
      kind: "class",
      subjectHints: ["english advanced", "english"],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}LEG[A-Z0-9]*$/.test(title)) {
    return {
      label: "Legal Studies",
      kind: "class",
      subjectHints: ["legal studies", "legal"],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}NGIN[A-Z0-9]*$/.test(title)) {
    return {
      label: "Engineering Studies",
      kind: "class",
      subjectHints: [
        "engineering studies",
        "engineering",
      ],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}BUS[A-Z0-9]*$/.test(title)) {
    return {
      label: "Business Studies",
      kind: "class",
      subjectHints: [
        "business studies",
        "business",
      ],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}MAA[A-Z0-9]*$/.test(title)) {
    return {
      label: "Mathematics Advanced",
      kind: "class",
      subjectHints: [
        "mathematics advanced",
        "maths advanced",
        "mathematics",
      ],
      allowSubjectMatch: true,
    };
  }

  if (/^\d{2}MAX[A-Z0-9]*$/.test(title)) {
    return {
      label: "Mathematics Extension 1",
      kind: "class",
      subjectHints: [
        "mathematics extension 1",
        "maths extension 1",
        "mathematics extension",
        "extension 1",
        "mathematics",
      ],
      allowSubjectMatch: true,
    };
  }

  return undefined;
}

const aliasesForSubject = (subjectName: string) => {
  const normalised = normalise(subjectName);

  return (
    Object.entries(SUBJECT_ALIASES).find(
      ([key, aliases]) =>
        normalised.includes(key) ||
        aliases.some((alias) =>
          normalised.includes(normalise(alias)),
        ),
    )?.[1] ?? []
  );
};

export function matchImportedSubject(
  event: Pick<
    ImportedCalendarEvent,
    "title" | "description" | "calendarName"
  >,
  subjects: Subject[],
) {
  if (!subjects.length) {
    return undefined;
  }

  const decoded = decodeSchoolCalendarCode(event.title);

  if (decoded && !decoded.allowSubjectMatch) {
    return undefined;
  }

  if (decoded?.subjectHints.length) {
    const direct = subjects
      .map((subject) => {
        const subjectName = normalise(subject.name);
        const aliases = [
          subjectName,
          ...aliasesForSubject(subject.name),
        ].map(normalise);

        const score = decoded.subjectHints.reduce(
          (total, hint) => {
            const value = normalise(hint);

            if (subjectName === value) {
              return total + 100;
            }

            if (
              subjectName.includes(value) ||
              aliases.some(
                (alias) =>
                  alias === value ||
                  alias.includes(value) ||
                  value.includes(alias),
              )
            ) {
              return total + value.length;
            }

            return total;
          },
          0,
        );

        return { subject, score };
      })
      .sort((left, right) => right.score - left.score)
      .find((result) => result.score > 0)?.subject;

    if (direct) {
      return direct;
    }
  }

  const haystack = normalise(
    [
      event.title,
      event.description,
      event.calendarName,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return subjects
    .map((subject) => {
      const terms = [
        normalise(subject.name),
        ...aliasesForSubject(subject.name).map(normalise),
      ].filter((term) => term.length >= 3);

      const score = terms.reduce((total, term) => {
        if (haystack === term) {
          return total + term.length * 3;
        }

        if (haystack.includes(term)) {
          return total + term.length;
        }

        return total;
      }, 0);

      return { subject, score };
    })
    .sort((left, right) => right.score - left.score)
    .find((result) => result.score > 0)?.subject;
}

export function detectImportedKind(
  event: Pick<
    ImportedCalendarEvent,
    | "title"
    | "description"
    | "calendarName"
    | "start"
    | "end"
    | "allDay"
    | "recurring"
  >,
  matchedSubject?: Subject,
): ImportedCalendarKind {
  if (event.allDay) {
    return "event";
  }

  const decoded = decodeSchoolCalendarCode(event.title);

  if (decoded) {
    return decoded.kind;
  }

  const text = normalise(
    [
      event.title,
      event.description,
      event.calendarName,
    ]
      .filter(Boolean)
      .join(" "),
  );

  const duration = Math.max(
    0,
    Math.round(
      (event.end.getTime() - event.start.getTime()) /
        60000,
    ),
  );

  const weekday = event.start.getDay();
  const weekdayCommitment =
    weekday >= 1 && weekday <= 5;
  const reasonableDuration =
    duration >= 20 && duration <= 240;

  const recurringCommitment =
    Boolean(event.recurring) &&
    RECURRING_COMMITMENT_WORDS.some((word) =>
      text.includes(word),
    );

  if (
    recurringCommitment &&
    weekdayCommitment &&
    reasonableDuration
  ) {
    return "class";
  }

  if (
    DEFINITE_ONE_OFF_WORDS.some((word) =>
      text.includes(word),
    )
  ) {
    return "event";
  }

  if (
    ACADEMIC_CLASS_WORDS.some((word) =>
      text.includes(word),
    )
  ) {
    return "class";
  }

  if (
    Boolean(event.recurring) &&
    Boolean(matchedSubject) &&
    weekdayCommitment &&
    reasonableDuration
  ) {
    return "class";
  }

  return "event";
}

export function classifyImportedEvent(
  event: ImportedCalendarEvent,
  subjects: Subject[],
): ImportedCalendarEvent {
  const decoded = decodeSchoolCalendarCode(event.title);
  const matched = matchImportedSubject(event, subjects);
  const kind =
    event.kind ??
    decoded?.kind ??
    detectImportedKind(event, matched);

  const displayTitle =
    kind === "class"
      ? matched?.name ||
        decoded?.label ||
        event.title
      : event.title;

  const seed =
    matched?.name ||
    decoded?.label ||
    event.calendarName ||
    event.externalCalendarId ||
    event.title ||
    event.source;

  return {
    ...event,
    title: displayTitle,
    kind,
    subjectId: event.subjectId ?? matched?.id,
    subjectName:
      event.subjectName ??
      matched?.name ??
      (kind === "class"
        ? decoded?.label
        : undefined),
    color:
      event.color ||
      matched?.color ||
      stableImportedColor(seed),
    autoClassified:
      event.autoClassified ?? true,
  };
}

export function classifyImportedEvents(
  events: ImportedCalendarEvent[],
  subjects: Subject[],
) {
  const titleCounts = new Map<string, number>();

  events.forEach((event) => {
    const key = normalise(event.title);
    titleCounts.set(
      key,
      (titleCounts.get(key) || 0) + 1,
    );
  });

  return events.map((event) => {
    const key = normalise(event.title);
    const repeated =
      (titleCounts.get(key) || 0) >= 2;

    return classifyImportedEvent(
      {
        ...event,
        recurring:
          event.recurring || repeated,
      },
      subjects,
    );
  });
}