import fs from "fs/promises";
import path from "path";
import React from "react";
import { auth } from "@clerk/nextjs/server";

const LOG_FILE = path.join(process.cwd(), "src", "app", "senate", "logs.json");
const PERIOD_MS = 14 * 24 * 60 * 60 * 1000;
const TARGET_HOURS = 6;

async function readLogs() {
  try {
    const raw = await fs.readFile(LOG_FILE, "utf-8");
    return JSON.parse(raw || "[]");
  } catch {
    return [];
  }
}

function parseTzOffsetFromName(tzName: string) {
  const m = String(tzName).match(/GMT\s*([+-]?\d{1,2})(?::(\d{2}))?/i);
  if (m) {
    const h = Number(m[1]) || 0;
    const mmins = Number(m[2] || 0) || 0;
    return (h * 60 + mmins) * 60 * 1000;
  }
  if (/CDT/i.test(tzName)) return -5 * 60 * 60 * 1000;
  if (/CST/i.test(tzName)) return -6 * 60 * 60 * 1000;
  return -6 * 60 * 60 * 1000;
}

function getChicagoParts(dt: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  interface FormatPart {
    type: string;
    value: string;
  }
  const parts = fmt
    .formatToParts(dt)
    .reduce((acc: Record<string, string>, p: FormatPart) => {
      if (p.type !== "literal") acc[p.type] = p.value;
      return acc;
    }, {});
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function getChicagoOffsetMs(dt: Date) {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    timeZoneName: "shortOffset",
  });
  const parts = fmt.formatToParts(dt);
  interface FormatPart {
    type: string;
    value: string;
  }
  const tzPart = parts.find(
    (p: FormatPart) => p.type === "timeZoneName"
  )?.value;
  if (tzPart) return parseTzOffsetFromName(tzPart);
  const fmt2 = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    timeZoneName: "short",
  });
  const parts2 = fmt2.formatToParts(dt);
  const tzAbbrev =
    parts2.find((p: FormatPart) => p.type === "timeZoneName")?.value || "";
  return parseTzOffsetFromName(tzAbbrev);
}

function getPeriodKey(dateStr: string) {
  const d = new Date(dateStr);
  const t = isNaN(d.getTime()) ? new Date() : d;

  const cp = getChicagoParts(t);
  const weekdayStr = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Chicago",
    weekday: "short",
  }).format(t);
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0;
  const daysSinceThursday = (dayOfWeek - 4 + 7) % 7;

  const offsetMs = getChicagoOffsetMs(
    new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0))
  );
  const chicagoMidnightUtcMs =
    Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs;
  const thursdayMs =
    chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000;
  return Math.floor(thursdayMs / PERIOD_MS);
}

function segmentHours(seg: { start?: string; end?: string }) {
  try {
    const [sh, sm] = String(seg.start || "")
      .split(":")
      .map((x: string) => Number(x) || 0);
    const [eh, em] = String(seg.end || "")
      .split(":")
      .map((x: string) => Number(x) || 0);
    const startM = sh * 60 + sm;
    let endM = eh * 60 + em;
    if (endM <= startM) endM += 24 * 60;
    const mins = Math.max(0, endM - startM);
    return Math.round((mins / 60) * 100) / 100;
  } catch {
    return 0;
  }
}

export default async function AdminSenateLogsPage() {
  // require admin
  const { userId, sessionClaims } = await auth();
  interface SessionClaims {
    role?: string;
  }
  const role = (sessionClaims as SessionClaims)?.role;
  if (!userId || role !== "admin") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold">Unauthorized</h1>
          <p className="mt-2 text-gray-600">
            You must be an admin to view this page.
          </p>
        </div>
      </main>
    );
  }

  const logs = await readLogs();

  // group by period then by userId
  type LogEntry = {
    userId?: string;
    date?: string;
    createdAt?: string;
    senatorName?: string;
    hours?: number | string;
    [key: string]: unknown;
  };
  const periods: Record<
    string,
    Record<string, { total: number; name?: string; entries: LogEntry[] }>
  > = {};
  for (const l of logs) {
    const entry = l as LogEntry;
    const uid = String(entry.userId || "unknown");
    const dateStr = entry.date || entry.createdAt || new Date().toISOString();
    const key = String(getPeriodKey(dateStr));
    periods[key] = periods[key] || {};
    periods[key][uid] = periods[key][uid] || {
      total: 0,
      name: entry.senatorName || "",
      entries: [],
    };
    periods[key][uid].total += Number(entry.hours || 0);
    periods[key][uid].entries.push(entry);
    if (!periods[key][uid].name && entry.senatorName)
      periods[key][uid].name = entry.senatorName;
  }

  const sortedPeriodKeys = Object.keys(periods).sort(
    (a, b) => Number(b) - Number(a)
  );

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">
            Admin — Senate Hours Report
          </h1>
          <div className="text-sm text-gray-600">
            Target per period: {TARGET_HOURS} hrs
          </div>
        </div>

        {sortedPeriodKeys.length === 0 && <div>No logs found.</div>}

        {sortedPeriodKeys.map((pkey) => {
          const periodStartMs = Number(pkey) * PERIOD_MS;
          const periodStart = new Date(periodStartMs)
            .toISOString()
            .slice(0, 10);
          const users = Object.entries(periods[pkey]).sort(
            (a, b) => b[1].total - a[1].total
          );
          return (
            <section key={pkey} className="mb-8 bg-white rounded shadow p-4">
              <h2 className="text-lg font-medium mb-3">
                Period starting {periodStart}
              </h2>
              {users.length === 0 ? (
                <div className="text-sm text-gray-600">No entries</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left table-auto border-collapse">
                    <thead>
                      <tr className="text-sm text-gray-600 border-b">
                        <th className="py-2 px-3">Name</th>
                        <th className="py-2 px-3">Hours</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3">Entries</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(([uid, meta]) => (
                        <tr key={uid} className="border-b">
                          <td className="py-2 px-3 align-top text-sm">
                            {meta.name || "—"}
                          </td>
                          <td className="py-2 px-3 align-top text-sm">
                            {Math.round(meta.total * 100) / 100}
                          </td>
                          <td className="py-2 px-3 align-top text-sm">
                            {meta.total >= TARGET_HOURS ? (
                              <span className="text-green-600 font-medium">
                                Met
                              </span>
                            ) : (
                              <span className="text-red-600 font-medium">
                                Missing
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 align-top text-sm">
                            <details className="text-sm">
                              <summary className="cursor-pointer">
                                {meta.entries.length} entr
                                {meta.entries.length === 1 ? "y" : "ies"}
                              </summary>
                              <div className="mt-2 space-y-2">
                                {meta.entries.map((e: LogEntry) => {
                                  const entry = e as LogEntry & {
                                    id?: string | number;
                                    activity?: string;
                                    notes?: string;
                                    segments?: Array<{
                                      date?: string;
                                      start?: string;
                                      end?: string;
                                    }>;
                                  };
                                  return (
                                    <div
                                      key={entry.id || entry.createdAt}
                                      className="p-2 border rounded bg-gray-50"
                                    >
                                      <div className="text-sm font-medium">
                                        {(entry.date || "").slice(0, 10)} —{" "}
                                        {Number(entry.hours || 0)} hrs
                                      </div>
                                      {entry.activity && (
                                        <div className="text-sm text-gray-700">
                                          Activity:{" "}
                                          {String(entry.activity).slice(0, 200)}
                                        </div>
                                      )}
                                      {entry.notes && (
                                        <div className="text-sm text-gray-500">
                                          Notes:{" "}
                                          {String(entry.notes).slice(0, 300)}
                                        </div>
                                      )}
                                      {Array.isArray(entry.segments) &&
                                        entry.segments.length > 0 && (
                                          <div className="mt-2 text-xs text-gray-600">
                                            Segments:
                                            <ul className="list-disc ml-5">
                                              {entry.segments.map(
                                                (s, i: number) => (
                                                  <li key={i}>
                                                    {s.date} {s.start}–{s.end} (
                                                    {segmentHours(s)} hrs)
                                                  </li>
                                                )
                                              )}
                                            </ul>
                                          </div>
                                        )}
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          );
        })}
      </div>
    </main>
  );
}
