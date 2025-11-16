"use client";

import React, { useEffect, useState } from "react";
import { useUser } from '@clerk/nextjs'
import Image from 'next/image';
import binIcon from '../../assets/bin.png';
import styles from './log-hours-page.module.css';

type Log = {
  id: string;
  date: string;
  senatorName?: string;
  hours: number;
  activity: string;
  notes?: string;
  createdAt?: string;
};

export default function SenateHourLoggingPage() {
  const { user, isSignedIn } = useUser()
  const [segments, setSegments] = useState<Array<{ date: string; start: string; end: string }>>(() => [
    { date: new Date().toISOString().slice(0, 10), start: "", end: "" },
  ]);
  const [notes, setNotes] = useState("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [saving, setSaving] = useState(false);
  const [showReport, setShowReport] = useState(false)
  const [periodKey, setPeriodKey] = useState(() => Math.floor(Date.now() / (14 * 24 * 60 * 60 * 1000)))
  const [successMessage, setSuccessMessage] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    // load recent logs (best-effort)
    if (!isSignedIn) return // don't fetch if not signed in
    fetch("/api/senate/log-hours")
      .then((r) => r.json())
      .then((d) => setLogs(d?.logs || []))
      .catch(() => {});
  }, [isSignedIn]);

  // Reset the report view when the 2-week period changes
  useEffect(() => {
    const id = setInterval(() => {
      const key = Math.floor(Date.now() / (14 * 24 * 60 * 60 * 1000))
      setPeriodKey((prev) => {
        if (prev !== key) {
          // period rolled over
          setShowReport(false)
          return key
        }
        return prev
      })
    }, 60 * 60 * 1000) // check hourly
    return () => clearInterval(id)
  }, [])

  // Also hide report when logs change such that there are no rows
  useEffect(() => {
    if (!showReport) return
    if (!logs || logs.length === 0) {
      setShowReport(false)
    }
  }, [logs, showReport])

  function minutesBetween(start: string, end: string) {
    if (!start || !end) return 0;
    // start/end format HH:MM
    const [sh, sm] = start.split(":").map((s) => parseInt(s, 10));
    const [eh, em] = end.split(":").map((s) => parseInt(s, 10));
    if (Number.isNaN(sh) || Number.isNaN(sm) || Number.isNaN(eh) || Number.isNaN(em)) return 0;
    let startM = sh * 60 + sm;
    let endM = eh * 60 + em;
    // if end <= start assume next day
    if (endM <= startM) endM += 24 * 60;
    return Math.max(0, endM - startM);
  }

  function computeTotalHours() {
    const mins = segments.reduce((sum, s) => sum + minutesBetween(s.start, s.end), 0);
    return Math.round((mins / 60) * 100) / 100; // two decimals
  }

  async function submitHours(e?: React.FormEvent) {
    e?.preventDefault();
    setSaving(true);
    try {
      if (!isSignedIn) {
        alert('Please sign in to log hours')
        setSaving(false)
        return
      }
      // validation: notes required
      if (!notes || notes.trim().length === 0) {
        alert('Please add comments/notes (required)');
        setSaving(false);
        return;
      }

      const totalHours = computeTotalHours();
      if (totalHours <= 0) {
        alert('Please enter at least one valid time segment');
        setSaving(false);
        return;
      }

      const payload = {
        // use first segment date as the entry date
        date: segments[0]?.date || new Date().toISOString().slice(0, 10),
        senatorName: user?.fullName || (user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : user?.primaryEmailAddress?.emailAddress) || '',
        hours: totalHours,
        activity: notes.slice(0, 200),
        notes,
        segments,
      };

      const response = await fetch('/api/senate/log-hours', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to save hours');
      }

      // Show success message before resetting form
      setSuccessMessage(`Successfully logged ${totalHours} hours!`);
      
      // refresh logs and reset segments
      const res = await fetch('/api/senate/log-hours');
      const data = await res.json();
      setLogs(data?.logs || []);
      setSegments([{ date: new Date().toISOString().slice(0, 10), start: '', end: '' }]);
      setNotes('');
      
      // Clear success message after 5 seconds
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to save hours');
    } finally {
      setSaving(false);
    }
  }

  function updateSegment(idx: number, field: 'date' | 'start' | 'end', value: string) {
    setSegments((prev) => {
      const copy = prev.slice();
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  }

  function addSegment() {
    setSegments((prev) => [...prev, { date: new Date().toISOString().slice(0, 10), start: '', end: '' }]);
  }

  function removeSegment(idx: number) {
    setSegments((prev) => prev.filter((_, i) => i !== idx));
  }

  async function deleteEntry(entryId: string) {
    if (!confirm('Are you sure you want to delete this entry? This action cannot be undone.')) {
      return;
    }

    setDeleting(entryId);
    try {
      const response = await fetch('/api/senate/log-hours', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId })
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete entry');
      }

      // Refresh logs
      const res = await fetch('/api/senate/log-hours');
      const data = await res.json();
      setLogs(data?.logs || []);
    } catch (err) {
      console.error(err);
      alert('Failed to delete entry');
    } finally {
      setDeleting(null);
    }
  }

  function twoWeekLoggedHours() {
    try {
      const now = new Date();
      const cutoff = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
      const total = logs.reduce((sum, l) => {
        const d = new Date(l.date);
        if (isNaN(d.getTime())) return sum;
        if (d >= cutoff && d <= now) return sum + (l.hours || 0);
        return sum;
      }, 0);
      return Math.round(total * 100) / 100;
    } catch (err) {
      return 0;
    }
  }

  // --- Period helpers (Chicago timezone) ---
  const PERIOD_MS = 14 * 24 * 60 * 60 * 1000

  function parseTzOffsetFromName(tzName: string) {
    const m = String(tzName).match(/GMT\s*([+-]?\d{1,2})(?::(\d{2}))?/i)
    if (m) {
      const h = Number(m[1]) || 0
      const mmins = Number(m[2] || 0) || 0
      return (h * 60 + mmins) * 60 * 1000
    }
    if (/CDT/i.test(tzName)) return -5 * 60 * 60 * 1000
    if (/CST/i.test(tzName)) return -6 * 60 * 60 * 1000
    return -6 * 60 * 60 * 1000
  }

  function getChicagoParts(dt: Date) {
    const fmt = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Chicago',
      year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    })
    const parts = fmt.formatToParts(dt).reduce((acc: any, p: any) => { if (p.type !== 'literal') acc[p.type] = p.value; return acc }, {})
    return {
      year: Number(parts.year),
      month: Number(parts.month),
      day: Number(parts.day),
      hour: Number(parts.hour),
      minute: Number(parts.minute),
      second: Number(parts.second),
    }
  }

  function getChicagoOffsetMs(dt: Date) {
    const fmt = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'shortOffset' })
    const parts = fmt.formatToParts(dt)
    const tzPart = parts.find((p: any) => p.type === 'timeZoneName')?.value
    if (tzPart) return parseTzOffsetFromName(tzPart)
    const fmt2 = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', timeZoneName: 'short' })
    const parts2 = fmt2.formatToParts(dt)
    const tzAbbrev = parts2.find((p: any) => p.type === 'timeZoneName')?.value || ''
    return parseTzOffsetFromName(tzAbbrev)
  }

  function daysLeftInCurrentPeriod() {
    try {
      const now = new Date()
      const cp = getChicagoParts(now)
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(now)
      const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
      const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0
      const daysSinceThursday = (dayOfWeek - 4 + 7) % 7

      // Chicago midnight UTC ms for the local Chicago date
      const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
      const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs

      const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
      const periodEndMs = thursdayMs + PERIOD_MS - 1
      const diffMs = periodEndMs - Date.now()
      if (diffMs <= 0) return 0
      return Math.ceil(diffMs / (24 * 60 * 60 * 1000))
    } catch (e) {
      return 0
    }
  }

  function periodEndLocalString() {
    try {
      const now = new Date()
      const cp = getChicagoParts(now)
      const weekdayStr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', weekday: 'short' }).format(now)
      const weekdayMap: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }
      const dayOfWeek = weekdayMap[weekdayStr as keyof typeof weekdayMap] ?? 0
      const daysSinceThursday = (dayOfWeek - 4 + 7) % 7
      const offsetMs = getChicagoOffsetMs(new Date(Date.UTC(cp.year, cp.month - 1, cp.day, 12, 0, 0)))
      const chicagoMidnightUtcMs = Date.UTC(cp.year, cp.month - 1, cp.day, 0, 0, 0) - offsetMs
      const thursdayMs = chicagoMidnightUtcMs - daysSinceThursday * 24 * 60 * 60 * 1000
      const periodEndMs = thursdayMs + PERIOD_MS - 1
      return new Intl.DateTimeFormat('en-US', { timeZone: 'America/Chicago', month: '2-digit', day: '2-digit', year: 'numeric', weekday: 'short' }).format(new Date(periodEndMs))
    } catch (e) {
      return ''
    }
  }

  return (
    <main className={styles.pageContainer}>
      {/* Top hero banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>Hour Logging</h1>
          <p className={styles.heroSubtitle}>Track your contributions and stay accountable</p>
        </div>
      </div>

      {/* Main content (purple background behind white cards) */}
      <div className={`${styles.purpleSection}`}>
        <div className={styles.mainContentGrid}>
        {/* left large card */}
        <div className={styles.leftCard}>
          <div className={styles.formCard}>
            <h2 className={styles.formTitle}>Log Your Hours</h2>

            <form onSubmit={submitHours} className={styles.formContainer}>
              {successMessage && (
                <div className={styles.successMessage}>
                  {successMessage}
                </div>
              )}
              <div className={styles.formFields}>
                {segments.map((seg, idx) => (
                  <div key={idx} className={styles.segmentRow}>
                    <div className={styles.segmentDateField}>
                      <label className={styles.segmentLabel}>Date</label>
                      <input type="date" value={seg.date} onChange={(e) => updateSegment(idx, 'date', e.target.value)} className={styles.segmentInput} />
                    </div>

                    <div className={styles.segmentTimeField}>
                      <label className={styles.segmentLabel}>Start</label>
                      <input type="time" value={seg.start} onChange={(e) => updateSegment(idx, 'start', e.target.value)} className={styles.segmentInput} />
                    </div>

                    <div className={styles.segmentTimeField}>
                      <label className={styles.segmentLabel}>End</label>
                      <input type="time" value={seg.end} onChange={(e) => updateSegment(idx, 'end', e.target.value)} className={styles.segmentInput} />
                    </div>

                    <div className={styles.segmentActions}>
                      <div className={styles.segmentHours}>{Math.round((minutesBetween(seg.start, seg.end) / 60) * 100) / 100} hrs</div>
                      <button type="button" onClick={() => removeSegment(idx)} className={styles.removeSegmentButton} aria-label="Remove segment">
                        <Image src={binIcon} alt="Remove" width={18} height={18} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className={styles.addSegmentSection}>
                  <button type="button" onClick={addSegment} className={styles.addSegmentButton}>
                    <span className={styles.addSegmentButtonIcon}>+</span> Add segment
                  </button>
                </div>

                <div className={styles.notesField}>
                  <label className={styles.notesLabel}>Comments/Notes <span className={styles.notesLabelRequired}>(Required)</span></label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className={styles.notesTextarea} placeholder="Describe your activities and contributions..."></textarea>
                </div>
              </div>

              <div className={styles.formButtons}>
                <button type="submit" disabled={saving} className={styles.submitButton}>{saving ? 'Saving...' : 'Submit Hours'}</button>
                <button type="button" className={styles.cancelButton}>Cancel</button>
              </div>
            </form>
          </div>
        </div>

        {/* right summary card */}
        <aside className={styles.rightCard}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Period Summary</h3>

            <div className={styles.summaryContent}>
              {/** compute values */}
              {(() => {
                const logged = twoWeekLoggedHours();
                const draft = computeTotalHours();
                const remaining = Math.max(0, 6 - logged);
                const remainingAfter = Math.max(0, 6 - (logged + draft));
                const progressPct = Math.min(100, Math.round(((logged + draft) / 6) * 100));
                const daysLeft = daysLeftInCurrentPeriod();
                const periodEnd = periodEndLocalString();
                return (
                  <>
                    <div className={`${styles.summaryStatCard} ${styles.summaryStatCardGray}`}>
                      <div className={styles.summaryStatContent}>
                        <div className={styles.summaryStatLabel}>Logged (14 days)</div>
                        <div className={styles.summaryStatSubtext}>Includes saved entries</div>
                      </div>
                      <div className={styles.summaryStatValue}>{logged} hrs</div>
                    </div>

                    <div className={`${styles.summaryStatCard} ${styles.summaryStatCardYellow}`}>
                      <div className={styles.summaryStatContent}>
                        <div className={styles.summaryStatLabel}>Remaining (target 6 hrs)</div>
                        <div className={styles.summaryStatSubtext}>After current draft: {remainingAfter} hrs</div>
                      </div>
                      <div className={styles.summaryStatValue}>{remaining} hrs</div>
                    </div>

                    <div className={styles.progressBar}>
                      <div className={styles.progressBarFill} style={{ width: `${progressPct}%` }} />
                    </div>

                    <div className={styles.periodInfo}>
                      <strong>{daysLeft} day{daysLeft === 1 ? '' : 's'} left</strong> — ends {periodEnd} (Chicago)
                    </div>

                    <div className={styles.draftHours}>Draft hours: {draft} hrs</div>
                    <button onClick={() => setShowReport(true)} className={styles.viewReportButton}>View Full Report</button>
                  </>
                );
              })()}
            </div>
          </div>
          {showReport && (
            <div className={styles.reportCard}>
              <div className={styles.reportHeader}>
                <h4 className={styles.reportTitle}>Full Report — by date</h4>
                <button className={styles.reportCloseButton} onClick={() => setShowReport(false)}>Close</button>
              </div>
              {logs.length === 0 ? (
                <div className={styles.reportEmpty}>No logged entries found.</div>
              ) : (
                <div className={styles.reportContent}>
                  <div className={styles.reportScrollContainer}>
                    {logs.map((log) => (
                      <div key={log.id} className={styles.reportRow}>
                        <div className={styles.reportRowInfo}>
                          <div className={styles.reportRowDate}>{log.date || new Date(log.createdAt || Date.now()).toISOString().slice(0,10)}</div>
                          <div className={styles.reportRowMeta}>
                            {Math.round((log.hours || 0) * 100) / 100} hrs
                            {log.activity && <span className={styles.reportRowActivity}> • {log.activity}</span>}
                          </div>
                        </div>
                        <button
                          onClick={() => deleteEntry(log.id)}
                          disabled={deleting === log.id}
                          className={styles.deleteButton}
                          title="Delete this entry"
                        >
                          {deleting === log.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </aside>
        </div>
      </div>
    </main>
  );
}
