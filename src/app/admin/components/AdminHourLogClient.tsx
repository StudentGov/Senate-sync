"use client";

import React, { useEffect, useState } from "react";

type LogEntry = {
  id?: string | number;
  createdAt?: string;
  date?: string;
  hours?: number | string;
  activity?: string;
  notes?: string;
  segments?: Array<{ date?: string; start?: string; end?: string }>;
};

type PeriodsShape = Record<
  string,
  Record<string, { total: number; name?: string; entries: LogEntry[] }>
>;

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

export default function AdminHourLogClient() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periods, setPeriods] = useState<PeriodsShape>({});
  const [sortedKeys, setSortedKeys] = useState<string[]>([]);
  const [targetHours, setTargetHours] = useState<number>(6);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const res = await fetch("/api/admin/hour-log");
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || "Failed to fetch");
        }
        const data = await res.json();
        if (!mounted) return;
        setPeriods(data.periods || {});
        setSortedKeys(data.sortedPeriodKeys || []);
        setTargetHours(data.TARGET_HOURS || 6);
      } catch (err) {
        console.error(err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchData();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) return <div className="p-4">Loading hour logs...</div>;
  if (error) return <div className="p-4 text-red-600">Error: {error}</div>;

  if (sortedKeys.length === 0) return <div className="p-4">No logs found.</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Hour Log Report</h2>
        <div className="text-sm text-gray-600">
          Target per period: {targetHours} hrs
        </div>
      </div>

      {sortedKeys.map((pkey) => {
        const PERIOD_MS = 14 * 24 * 60 * 60 * 1000;
        const periodStartMs = Number(pkey) * PERIOD_MS;
        const periodStart = new Date(periodStartMs).toISOString().slice(0, 10);
        const users = Object.entries(periods[pkey] || {}).sort(
          (a, b) => b[1].total - a[1].total
        );
        return (
          <section key={pkey} className="mb-6 bg-white rounded shadow p-3">
            <h3 className="text-md font-medium mb-2">
              Period starting {periodStart}
            </h3>
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
                          {meta.total >= targetHours ? (
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
                              {meta.entries.map((e: LogEntry) => (
                                <div
                                  key={e.id || e.createdAt}
                                  className="p-2 border rounded bg-gray-50"
                                >
                                  <div className="text-sm font-medium">
                                    {(e.date || "").slice(0, 10)} —{" "}
                                    {Number(e.hours || 0)} hrs
                                  </div>
                                  {e.activity && (
                                    <div className="text-sm text-gray-700">
                                      Activity:{" "}
                                      {String(e.activity).slice(0, 200)}
                                    </div>
                                  )}
                                  {e.notes && (
                                    <div className="text-sm text-gray-500">
                                      Notes: {String(e.notes).slice(0, 300)}
                                    </div>
                                  )}
                                  {Array.isArray(e.segments) &&
                                    e.segments.length > 0 && (
                                      <div className="mt-2 text-xs text-gray-600">
                                        Segments:
                                        <ul className="list-disc ml-5">
                                          {e.segments.map((s, i: number) => (
                                            <li key={i}>
                                              {s.date} {s.start}–{s.end} (
                                              {segmentHours(s)} hrs)
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                </div>
                              ))}
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
  );
}
