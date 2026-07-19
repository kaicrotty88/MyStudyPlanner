"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarSync,
  CheckCircle2,
  ChevronDown,
  CloudDownload,
  FileUp,
  Unplug,
} from "lucide-react";

import type {
  ImportedCalendarEvent,
  Subject,
} from "../models";
import { classifyImportedEvents } from "@/lib/calendarEventClassifier";

type GoogleCalendar = {
  id: string;
  name: string;
  primary?: boolean;
  color?: string;
};

type ImportedEventResponse = {
  id: string;
  title: string;
  start: string;
  end: string;
  allDay?: boolean;
  location?: string;
  description?: string;
  source: "google";
  externalId: string;
  externalCalendarId?: string;
  calendarName?: string;
  importedAt: string;
  updatedAt?: string;
  color?: string;
  recurring?: boolean;
};

type Props = {
  appMode: "demo" | "app";
  subjects: Subject[];
  importedEvents: ImportedCalendarEvent[];
  onImport: (events: ImportedCalendarEvent[]) => void;
  onRemoveSource: (source: "google" | "ics") => void;
};

const unfold = (text: string) => text.replace(/\r?\n[ \t]/g, "");

const parseIcsDate = (value: string) => {
  const raw = value.trim();

  if (/^\d{8}$/.test(raw)) {
    return new Date(
      Number(raw.slice(0, 4)),
      Number(raw.slice(4, 6)) - 1,
      Number(raw.slice(6, 8)),
    );
  }

  const match = raw.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z?$/,
  );

  if (!match) {
    throw new Error("Unsupported calendar date.");
  }

  const parts = match.slice(1).map(Number);

  return raw.endsWith("Z")
    ? new Date(
        Date.UTC(
          parts[0],
          parts[1] - 1,
          parts[2],
          parts[3],
          parts[4],
          parts[5],
        ),
      )
    : new Date(
        parts[0],
        parts[1] - 1,
        parts[2],
        parts[3],
        parts[4],
        parts[5],
      );
};

const cleanIcsValue = (value?: string) =>
  value
    ?.replace(/\\n/g, "\n")
    .replace(/\\,/g, ",")
    .replace(/\\;/g, ";")
    .replace(/\\\\/g, "\\");

function getCalendarProperty(
  text: string,
  property: string,
) {
  const unfolded = unfold(text);
  const row = unfolded
    .split(/\r?\n/)
    .find(
      (candidate) =>
        candidate.startsWith(`${property}:`) ||
        candidate.startsWith(`${property};`),
    );

  if (!row) {
    return undefined;
  }

  const colon = row.indexOf(":");

  return cleanIcsValue(row.slice(colon + 1));
}

function parseIcs(
  text: string,
  subjects: Subject[],
): ImportedCalendarEvent[] {
  const unfolded = unfold(text);
  const blocks = unfolded
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((entry) => entry.split("END:VEVENT")[0]);

  const sourceCalendarName =
    getCalendarProperty(text, "X-WR-CALNAME") ||
    (text.includes("Compass Calendar")
      ? "Compass timetable"
      : "Calendar file");

  const events: ImportedCalendarEvent[] = [];

  blocks.forEach((block, index) => {
    const rows = block.split(/\r?\n/);

    const get = (name: string) => {
      const row = rows.find(
        (candidate) =>
          candidate.startsWith(`${name}:`) ||
          candidate.startsWith(`${name};`),
      );

      if (!row) {
        return null;
      }

      const colon = row.indexOf(":");

      return {
        params: row.slice(name.length, colon),
        value: row.slice(colon + 1),
      };
    };

    const startRaw = get("DTSTART");

    if (!startRaw) {
      return;
    }

    const uid = get("UID")?.value || `ics-${index}`;
    const endRaw = get("DTEND");
    const start = parseIcsDate(startRaw.value);
    const end = endRaw
      ? parseIcsDate(endRaw.value)
      : new Date(start.getTime() + 60 * 60 * 1000);

    events.push({
      id: `ics:${uid}:${start.toISOString()}`,
      title:
        cleanIcsValue(get("SUMMARY")?.value) ||
        "Untitled event",
      start,
      end,
      allDay: Boolean(
        startRaw.params.includes("VALUE=DATE"),
      ),
      location: cleanIcsValue(get("LOCATION")?.value),
      description: cleanIcsValue(
        get("DESCRIPTION")?.value,
      ),
      source: "ics",
      externalId: uid,
      externalCalendarId: sourceCalendarName,
      calendarName: sourceCalendarName,
      recurring: Boolean(get("RRULE")),
      importedAt: new Date(),
    });
  });

  return classifyImportedEvents(events, subjects);
}

export function CalendarImports({
  appMode,
  subjects,
  importedEvents,
  onImport,
  onRemoveSource,
}: Props) {
  const [returnStatus, setReturnStatus] = useState<
    string | null
  >(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [connected, setConnected] = useState(false);
  const [calendars, setCalendars] = useState<
    GoogleCalendar[]
  >([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastImported, setLastImported] = useState<
    string | null
  >(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const automaticImportStarted = useRef(false);

  const googleCount = useMemo(
    () =>
      importedEvents.filter(
        (event) => event.source === "google",
      ).length,
    [importedEvents],
  );

  const icsCount = useMemo(
    () =>
      importedEvents.filter(
        (event) => event.source === "ics",
      ).length,
    [importedEvents],
  );

  const importGoogle = useCallback(
    async (
      calendarIds: string[],
      automatic = false,
    ) => {
      if (!calendarIds.length) return;

      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          "/api/calendar/google/import",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              calendarIds,
              days: 120,
            }),
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Google import failed.",
          );
        }

        const events = classifyImportedEvents(
          (data.events || []).map(
            (
              event: ImportedEventResponse,
            ): ImportedCalendarEvent => ({
              ...event,
              start: new Date(event.start),
              end: new Date(event.end),
              importedAt: new Date(event.importedAt),
              updatedAt: event.updatedAt
                ? new Date(event.updatedAt)
                : undefined,
            }),
          ),
          subjects,
        );

        onImport(events);
        setLastImported(new Date().toISOString());
        setNotice(
          events.length
            ? `${events.length} Google Calendar event${
                events.length === 1 ? "" : "s"
              } imported.`
            : "Google Calendar connected. No events were found in the selected range.",
        );

        if (automatic) {
          window.history.replaceState(
            {},
            "",
            `${window.location.pathname}#calendar-imports`,
          );
        }
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Google import failed.",
        );
      } finally {
        setLoading(false);
      }
    },
    [onImport, subjects],
  );

  const loadStatus = useCallback(async () => {
    if (appMode === "demo") return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/calendar/google/status",
        {
          cache: "no-store",
        },
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Could not check Google Calendar.",
        );
      }

      const availableCalendars: GoogleCalendar[] =
        data.calendars || [];
      const defaultSelection = data.selectedCalendarIds?.length
        ? data.selectedCalendarIds
        : availableCalendars
            .filter((calendar) => calendar.primary)
            .map((calendar) => calendar.id);

      setConnected(Boolean(data.connected));
      setCalendars(availableCalendars);
      setSelected(defaultSelection);
      setLastImported(data.lastImportedAt || null);

      if (
        returnStatus === "connected" &&
        data.connected &&
        defaultSelection.length &&
        !automaticImportStarted.current
      ) {
        automaticImportStarted.current = true;
        await importGoogle(defaultSelection, true);
      }
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not check Google Calendar.",
      );
    } finally {
      setLoading(false);
    }
  }, [
    appMode,
    importGoogle,
    returnStatus,
  ]);

  useEffect(() => {
    const status = new URLSearchParams(
      window.location.search,
    ).get("calendar");

    if (!status) return;

    setReturnStatus(status);
    setOpen(true);

    if (status === "connected") {
      setNotice(
        "Google Calendar connected. Importing your primary calendar now.",
      );
    } else if (status === "invalid-state") {
      setError(
        "The Google connection expired before it could finish. Please connect again.",
      );
    } else {
      setError(
        "Google Calendar could not be connected. Please try again.",
      );
    }
  }, []);

  useEffect(() => {
    if (!open) return;

    document
      .getElementById("calendar-imports")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

    void loadStatus();
  }, [loadStatus, open]);

  const disconnect = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "/api/calendar/google/disconnect",
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Could not disconnect Google Calendar.",
        );
      }

      setConnected(false);
      setCalendars([]);
      setSelected([]);
      setLastImported(null);
      setNotice(
        googleCount
          ? "Google Calendar disconnected. Your imported copies are still available below."
          : "Google Calendar disconnected.",
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not disconnect.",
      );
    } finally {
      setLoading(false);
    }
  };

  const removeImported = (
    source: "google" | "ics",
    count: number,
  ) => {
    const provider =
      source === "google"
        ? "Google Calendar"
        : "calendar file";

    const confirmed = window.confirm(
      `Remove ${count} imported ${provider} event${
        count === 1 ? "" : "s"
      } from MyStudyPlanner? This will not delete anything from the original calendar.`,
    );

    if (!confirmed) return;

    onRemoveSource(source);
    setNotice(
      `Imported ${provider} events removed from MyStudyPlanner.`,
    );
  };

  const importFile = async (file: File | null) => {
    if (!file) return;

    setError("");

    try {
      const events = parseIcs(
        await file.text(),
        subjects,
      );

      if (!events.length) {
        throw new Error(
          "No supported events were found in this file.",
        );
      }

      onImport(events);

      const classCount = events.filter(
        (event) => event.kind === "class",
      ).length;
      const eventCount = events.length - classCount;

      const matchedCount = events.filter(
        (event) => Boolean(event.subjectId),
      ).length;

      setNotice(
        `${events.length} calendar file event${
          events.length === 1 ? "" : "s"
        } imported. ${classCount} class${
          classCount === 1 ? "" : "es"
        } and ${eventCount} regular event${
          eventCount === 1 ? "" : "s"
        } detected.${
          subjects.length
            ? ` ${matchedCount} matched to your subjects.`
            : ""
        }`,
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not import the calendar file.",
      );
    } finally {
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  };

  return (
    <div
      id="calendar-imports"
      className="settings-panel overflow-hidden rounded-2xl border border-border bg-card"
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="settings-panel-trigger flex w-full items-center justify-between px-5 py-3 transition-colors"
      >
        <div className="flex items-center gap-3 text-left">
          <span className="settings-row-icon settings-icon-calendar">
            <CalendarSync className="h-4 w-4" />
          </span>

          <div>
            <div className="text-sm font-semibold text-foreground">
              Calendar imports
            </div>
            <div className="text-xs text-muted-foreground">
              Google Calendar, Apple Calendar, Outlook, and
              school calendar files.
            </div>
          </div>
        </div>

        <ChevronDown
          className={`h-5 w-5 text-muted-foreground transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div className="settings-panel-content space-y-4 border-t border-border px-5 pb-5 pt-4">
          {notice ? (
            <div className="flex items-start gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-xs text-foreground">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{notice}</span>
            </div>
          ) : null}

          {!subjects.length ? (
            <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground">
              No subjects are set up yet. That is fine. Imported
              events will receive consistent colours and class
              detection automatically. Subject colours will be used
              whenever a clear match is available later.
            </div>
          ) : null}

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    Google Calendar
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Read-only import. MyStudyPlanner cannot edit
                    your Google calendar.
                  </div>
                </div>

                <span
                  className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                    connected
                      ? "bg-primary/10 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {appMode === "demo"
                    ? "Demo"
                    : connected
                      ? "Connected"
                      : "Not connected"}
                </span>
              </div>

              {appMode === "demo" ? (
                <div className="mt-4 text-xs text-muted-foreground">
                  Google connection is disabled in preview mode.
                </div>
              ) : connected ? (
                <>
                  <div className="mt-4 max-h-44 space-y-2 overflow-auto rounded-xl border border-border bg-card p-3">
                    {calendars.length ? (
                      calendars.map((calendar) => (
                        <label
                          key={calendar.id}
                          className="flex items-center gap-2 text-sm"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(
                              calendar.id,
                            )}
                            onChange={() =>
                              setSelected((current) =>
                                current.includes(calendar.id)
                                  ? current.filter(
                                      (id) =>
                                        id !== calendar.id,
                                    )
                                  : [...current, calendar.id],
                              )
                            }
                          />
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{
                              background:
                                calendar.color || "#5f7f68",
                            }}
                          />
                          <span className="truncate">
                            {calendar.name}
                            {calendar.primary
                              ? " (Primary)"
                              : ""}
                          </span>
                        </label>
                      ))
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No readable calendars were found.
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        loading || !selected.length
                      }
                      onClick={() =>
                        void importGoogle(selected)
                      }
                      className="app-btn-primary h-9 px-3"
                    >
                      <CloudDownload className="h-4 w-4" />
                      {loading
                        ? "Importing..."
                        : googleCount
                          ? "Refresh import"
                          : "Import selected"}
                    </button>

                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => void disconnect()}
                      className="app-btn-secondary h-9 px-3"
                    >
                      <Unplug className="h-4 w-4" />
                      Disconnect
                    </button>
                  </div>

                  {lastImported ? (
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Last imported{" "}
                      {new Date(
                        lastImported,
                      ).toLocaleString("en-AU")}
                    </div>
                  ) : null}
                </>
              ) : (
                <a
                  href="/api/calendar/google/connect"
                  className="app-btn-primary mt-4 inline-flex h-9 px-3"
                >
                  Connect Google Calendar
                </a>
              )}

              {googleCount ? (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground">
                    {googleCount} Google event
                    {googleCount === 1 ? "" : "s"} currently
                    stored in MyStudyPlanner.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeImported(
                        "google",
                        googleCount,
                      )
                    }
                    className="app-btn-tertiary mt-2 h-9 px-3"
                  >
                    Remove imported Google events
                  </button>
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold">
                Calendar file
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Import a standard .ics export from Apple
                Calendar, Outlook, or a school system.
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".ics,text/calendar"
                className="hidden"
                onChange={(event) =>
                  void importFile(
                    event.target.files?.[0] || null,
                  )
                }
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    fileRef.current?.click()
                  }
                  className="app-btn-secondary h-9 px-3"
                >
                  <FileUp className="h-4 w-4" />
                  Choose .ics file
                </button>
              </div>

              <div className="mt-3 text-[11px] text-muted-foreground">
                Classes are detected automatically and appear only
                in Week and Day views. Other events also appear in
                Month view.
              </div>

              {icsCount ? (
                <div className="mt-4 border-t border-border pt-3">
                  <div className="text-xs text-muted-foreground">
                    {icsCount} calendar file event
                    {icsCount === 1 ? "" : "s"} currently
                    stored in MyStudyPlanner.
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      removeImported("ics", icsCount)
                    }
                    className="app-btn-tertiary mt-2 h-9 px-3"
                  >
                    Remove imported file events
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-xs text-destructive">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}