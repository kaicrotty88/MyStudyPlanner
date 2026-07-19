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
  ChevronDown,
  CloudDownload,
  FileUp,
  Unplug,
} from "lucide-react";

import type { ImportedCalendarEvent } from "../models";

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
};

type Props = {
  appMode: "demo" | "app";
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

function parseIcs(text: string): ImportedCalendarEvent[] {
  const blocks = unfold(text)
    .split("BEGIN:VEVENT")
    .slice(1)
    .map((entry) => entry.split("END:VEVENT")[0]);

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

    const event: ImportedCalendarEvent = {
      id: `ics:${uid}:${start.toISOString()}`,
      title: cleanIcsValue(get("SUMMARY")?.value) || "Untitled event",
      start,
      end,
      allDay: startRaw.params.includes("VALUE=DATE"),
      location: cleanIcsValue(get("LOCATION")?.value),
      description: cleanIcsValue(get("DESCRIPTION")?.value),
      source: "ics",
      externalId: uid,
      calendarName: "Calendar file",
      importedAt: new Date(),
    };

    events.push(event);
  });

  return events;
}

export function CalendarImports({
  appMode,
  importedEvents,
  onImport,
  onRemoveSource,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [connected, setConnected] = useState(false);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [lastImported, setLastImported] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  const googleCount = useMemo(
    () =>
      importedEvents.filter((event) => event.source === "google").length,
    [importedEvents],
  );

  const icsCount = useMemo(
    () => importedEvents.filter((event) => event.source === "ics").length,
    [importedEvents],
  );

  const loadStatus = useCallback(async () => {
    if (appMode === "demo") {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/calendar/google/status", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Could not check Google Calendar.",
        );
      }

      const availableCalendars: GoogleCalendar[] =
        data.calendars || [];

      setConnected(Boolean(data.connected));
      setCalendars(availableCalendars);

      setSelected(
        data.selectedCalendarIds?.length
          ? data.selectedCalendarIds
          : availableCalendars
              .filter((calendar) => calendar.primary)
              .map((calendar) => calendar.id),
      );

      setLastImported(data.lastImportedAt || null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not check Google Calendar.",
      );
    } finally {
      setLoading(false);
    }
  }, [appMode]);

  useEffect(() => {
    if (open) {
      void loadStatus();
    }
  }, [loadStatus, open]);

  const importGoogle = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/calendar/google/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          calendarIds: selected,
          days: 120,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Google import failed.");
      }

      const events: ImportedCalendarEvent[] = (
        data.events || []
      ).map((event: ImportedEventResponse) => ({
        ...event,
        start: new Date(event.start),
        end: new Date(event.end),
        importedAt: new Date(event.importedAt),
        updatedAt: event.updatedAt
          ? new Date(event.updatedAt)
          : undefined,
      }));

      onImport(events);
      setLastImported(new Date().toISOString());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Google import failed.",
      );
    } finally {
      setLoading(false);
    }
  };

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
        throw new Error("Could not disconnect Google Calendar.");
      }

      setConnected(false);
      setCalendars([]);
      setSelected([]);
      setLastImported(null);
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

  const importFile = async (file: File | null) => {
    if (!file) {
      return;
    }

    setError("");

    try {
      const events = parseIcs(await file.text());

      if (!events.length) {
        throw new Error(
          "No supported events were found in this file.",
        );
      }

      onImport(events);
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
    <div className="settings-panel overflow-hidden rounded-2xl border border-border bg-card">
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
              Google Calendar, Apple Calendar, Outlook, and school
              calendar files.
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
          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">
                    Google Calendar
                  </div>

                  <div className="mt-1 text-xs text-muted-foreground">
                    Read-only import. MyStudyPlanner cannot edit your
                    Google calendar.
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
                    {calendars.map((calendar) => (
                      <label
                        key={calendar.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          checked={selected.includes(calendar.id)}
                          onChange={() =>
                            setSelected((current) =>
                              current.includes(calendar.id)
                                ? current.filter(
                                    (id) => id !== calendar.id,
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
                          {calendar.primary ? " (Primary)" : ""}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={loading || !selected.length}
                      onClick={() => void importGoogle()}
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

                    {googleCount ? (
                      <button
                        type="button"
                        onClick={() => onRemoveSource("google")}
                        className="app-btn-tertiary h-9 px-3"
                      >
                        Remove {googleCount} imported
                      </button>
                    ) : null}
                  </div>

                  {lastImported ? (
                    <div className="mt-2 text-[11px] text-muted-foreground">
                      Last imported{" "}
                      {new Date(lastImported).toLocaleString("en-AU")}
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
            </div>

            <div className="rounded-2xl border border-border bg-background/60 p-4">
              <div className="text-sm font-semibold">
                Calendar file
              </div>

              <div className="mt-1 text-xs text-muted-foreground">
                Import a standard .ics export from Apple Calendar,
                Outlook, or a school system.
              </div>

              <input
                ref={fileRef}
                type="file"
                accept=".ics,text/calendar"
                className="hidden"
                onChange={(event) =>
                  void importFile(event.target.files?.[0] || null)
                }
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="app-btn-secondary h-9 px-3"
                >
                  <FileUp className="h-4 w-4" />
                  Choose .ics file
                </button>

                {icsCount ? (
                  <button
                    type="button"
                    onClick={() => onRemoveSource("ics")}
                    className="app-btn-tertiary h-9 px-3"
                  >
                    Remove {icsCount} imported
                  </button>
                ) : null}
              </div>

              <div className="mt-3 text-[11px] text-muted-foreground">
                Existing events with the same UID and start time are
                updated rather than duplicated.
              </div>
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