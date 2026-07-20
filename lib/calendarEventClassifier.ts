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

const CLASS_WORDS = [
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
];
const NON_CLASS_WORDS = [
  "exam",
  "test",
  "assessment",
  "assignment",
  "deadline",
  "due",
  "appointment",
  "meeting",
  "game",
  "match",
  "event",
  "birthday",
  "holiday",
  "presentation",
  "assembly",
  "excursion",
  "fixture",
  "opens",
  "1st xi",
  "2nd xi",
];

const ALIASES: Record<string, string[]> = {
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
};

export function decodeSchoolCalendarCode(
  rawTitle: string,
): SchoolCodeDetails | undefined {
  const title = compact(rawTitle);

  if (/^11T\d+$/.test(title)) {
    return {
      label: "Tutor Group",
      kind: "class",
      subjectHints: ["tutor group", "tutor"],
    };
  }

  if (
    title.includes("11DP/11STUDY") ||
    title.includes("STUDY.")
  ) {
    return {
      label: "Study Period",
      kind: "class",
      subjectHints: ["study period", "study"],
    };
  }

  if (/^\d{2}EC[A-Z0-9]*$/.test(title)) {
    return {
      label: "Economics",
      kind: "class",
      subjectHints: ["economics", "econ"],
    };
  }

  if (/^\d{2}ENA[A-Z0-9]*$/.test(title)) {
    return {
      label: "English Advanced",
      kind: "class",
      subjectHints: ["english advanced", "english"],
    };
  }

  if (/^\d{2}LEG[A-Z0-9]*$/.test(title)) {
    return {
      label: "Legal Studies",
      kind: "class",
      subjectHints: ["legal studies", "legal"],
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
    };
  }

  return undefined;
}

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
  const haystack = normalise(
    [
      event.title,
      decoded?.label,
      ...(decoded?.subjectHints || []),
      event.description,
      event.calendarName,
    ]
      .filter(Boolean)
      .join(" "),
  );

  return subjects
    .map((subject) => {
      const subjectName = normalise(subject.name);

      const aliases =
        Object.entries(ALIASES).find(
          ([key, list]) =>
            subjectName.includes(key) ||
            list.some((alias) =>
              subjectName.includes(alias),
            ),
        )?.[1] ?? [];

      const terms = [
        subjectName,
        ...aliases,
        ...(decoded?.subjectHints || []),
      ].filter((term) => term.length >= 3);

      const score = terms.reduce((total, term) => {
        const normalisedTerm = normalise(term);

        if (!normalisedTerm) {
          return total;
        }

        if (haystack === normalisedTerm) {
          return total + normalisedTerm.length * 3;
        }

        if (haystack.includes(normalisedTerm)) {
          return total + normalisedTerm.length;
        }

        return total;
      }, 0);

      return {
        subject,
        score,
      };
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

  if (
    NON_CLASS_WORDS.some((word) =>
      text.includes(word),
    )
  ) {
    return "event";
  }

  const duration = Math.max(
    0,
    Math.round(
      (event.end.getTime() - event.start.getTime()) /
        60000,
    ),
  );

  const weekday = event.start.getDay();
  const schoolHours =
    weekday >= 1 &&
    weekday <= 5 &&
    event.start.getHours() >= 7 &&
    event.start.getHours() <= 18;

  const classLength =
    duration >= 25 && duration <= 180;

  if (
    CLASS_WORDS.some((word) => text.includes(word))
  ) {
    return "class";
  }

  if (
    Boolean(event.recurring) &&
    RECURRING_COMMITMENT_WORDS.some((word) =>
      text.includes(word),
    ) &&
    schoolHours &&
    classLength
  ) {
    return "class";
  }

  if (
    Boolean(event.recurring) &&
    Boolean(matchedSubject) &&
    schoolHours &&
    classLength
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
      ? matched?.name || decoded?.label || event.title
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
      (kind === "class" ? decoded?.label : undefined),
    color:
      event.color ||
      matched?.color ||
      stableImportedColor(seed),
    autoClassified: event.autoClassified ?? true,
  };
}

export function classifyImportedEvents(
  events: ImportedCalendarEvent[],
  subjects: Subject[],
) {
  const titleCounts = new Map<string, number>();

  events.forEach((event) => {
    const key = normalise(event.title);
    titleCounts.set(key, (titleCounts.get(key) || 0) + 1);
  });

  return events.map((event) => {
    const key = normalise(event.title);
    const repeated =
      (titleCounts.get(key) || 0) >= 2;

    return classifyImportedEvent(
      {
        ...event,
        recurring: event.recurring || repeated,
      },
      subjects,
    );
  });
}