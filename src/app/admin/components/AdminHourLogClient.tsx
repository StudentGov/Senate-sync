"use client"

import React, { useEffect, useState, useMemo } from 'react'
import styles from './AdminHourLogClient.module.css'
import SearchBar from '../../components/searchBar/SearchBar'
import DropDownOptions from '../../components/dropDown/dropDown'

type PeriodsShape = Record<string, Record<string, { total: number; name?: string; entries: any[] }>>

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface UserHourData extends User {
  hours: number;
  status: 'Complete' | 'Incomplete';
  entries: any[];
}

interface AdminHourLogClientProps {
  hourLogData: {
    periods: PeriodsShape;
    sortedPeriodKeys: string[];
    targetHours: number;
  } | null;
  loading: boolean;
  error: string | null;
  users: User[];
}

function segmentHours(seg: any) {
  try {
    const [sh, sm] = String(seg.start || '').split(':').map((x: string) => Number(x) || 0)
    const [eh, em] = String(seg.end || '').split(':').map((x: string) => Number(x) || 0)
    let startM = sh * 60 + sm
    let endM = eh * 60 + em
    if (endM <= startM) endM += 24 * 60
    const mins = Math.max(0, endM - startM)
    return Math.round((mins / 60) * 100) / 100
  } catch (e) {
    return 0
  }
}

function formatPeriodDate(periodKey: string): string {
  const PERIOD_MS = 14 * 24 * 60 * 60 * 1000
  const periodStartMs = Number(periodKey) * PERIOD_MS
  const periodStart = new Date(periodStartMs)
  const periodEnd = new Date(periodStartMs + PERIOD_MS - 1)
  
  const startStr = periodStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  const endStr = periodEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  
  return `${startStr} - ${endStr}`
}

export default function AdminHourLogClient({ 
  hourLogData, 
  loading, 
  error, 
  users: allUsers 
}: AdminHourLogClientProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOption, setSortOption] = useState('Name')
  const [roleFilter, setRoleFilter] = useState('All')

  // Extract data from props
  const periods = hourLogData?.periods || {}
  const sortedKeys = hourLogData?.sortedPeriodKeys || []
  const targetHours = hourLogData?.targetHours || 6

  // Set default period when data loads
  useEffect(() => {
    if (sortedKeys.length > 0 && !selectedPeriod) {
      setSelectedPeriod(sortedKeys[0])
    }
  }, [sortedKeys, selectedPeriod])

  // Combine all users with their hour log data for the selected period
  const usersWithHours = useMemo(() => {
    const currentPeriod = selectedPeriod || sortedKeys[0]
    const periodData = currentPeriod ? periods[currentPeriod] || {} : {}
    
    return allUsers.map(user => {
      const hourData = periodData[user.id]
      const hours = hourData ? Math.round(hourData.total * 100) / 100 : 0
      const status = hours >= targetHours ? 'Complete' : 'Incomplete'
      const entries = hourData?.entries || []
      
      return {
        ...user,
        hours,
        status,
        entries
      } as UserHourData
    })
  }, [allUsers, periods, selectedPeriod, sortedKeys, targetHours])

  // Filter and sort users
  const filteredAndSortedUsers = useMemo(() => {
    let filtered = usersWithHours.filter(user => {
      const matchesSearch = 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesRole = roleFilter === 'All' || user.role === roleFilter.toLowerCase()
      
      return matchesSearch && matchesRole
    })

    // Sort users
    if (sortOption === 'Name') {
      filtered.sort((a, b) =>
        `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
      )
    } else if (sortOption === 'Email') {
      filtered.sort((a, b) => a.email.localeCompare(b.email))
    } else if (sortOption === 'Role') {
      filtered.sort((a, b) => a.role.localeCompare(b.role))
    } else if (sortOption === 'Hours') {
      filtered.sort((a, b) => b.hours - a.hours)
    }

    return filtered
  }, [usersWithHours, searchQuery, sortOption, roleFilter])

  if (loading) return <div className={styles.loadingState}>Loading hour logs...</div>
  if (error) return <div className={styles.errorState}>Error: {error}</div>

  if (sortedKeys.length === 0) return <div className={styles.emptyState}>No logs found.</div>

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h2 className={styles.pageTitle}>Hour Log Report</h2>
        <div className={styles.headerInfo}>Target per period: {targetHours} hrs</div>
      </div>

      {/* Period Selector */}
      <div className={styles.periodSelectorSection}>
        <label htmlFor="period-select" className={styles.periodSelectorLabel}>
          Select 2-Week Period:
        </label>
        <select
          id="period-select"
          value={selectedPeriod || sortedKeys[0] || ''}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className={styles.periodSelector}
        >
          {sortedKeys.map((pkey) => (
            <option key={pkey} value={pkey}>
              {formatPeriodDate(pkey)}
            </option>
          ))}
        </select>
      </div>

      {/* Search and Sort Controls */}
      <div className={styles.searchSortSection}>
        <SearchBar onSearch={(query) => setSearchQuery(query)} />
        <DropDownOptions
          options={[
            { id: 0, optionText: "Name" },
            { id: 1, optionText: "Email" },
            { id: 2, optionText: "Role" },
            { id: 3, optionText: "Hours" },
          ]}
          setSelectedOption={(option) => setSortOption(option.optionText)}
          text="Sort By"
        />
        <DropDownOptions
          options={[
            { id: 0, optionText: "All" },
            { id: 1, optionText: "admin" },
            { id: 2, optionText: "senator" },
            { id: 3, optionText: "coordinator" },
            { id: 4, optionText: "attorney" },
          ]}
          setSelectedOption={(option) => setRoleFilter(option.optionText)}
          text="Filter by Role"
        />
      </div>

      {/* User Count */}
      <div className={styles.userCount}>
        Showing {filteredAndSortedUsers.length} of {allUsers.length} users
      </div>

      {/* Current Period Display */}
      {selectedPeriod && (
        <section className={styles.periodSection}>
          <h3 className={styles.periodTitle}>
            Period: {formatPeriodDate(selectedPeriod)}
          </h3>
          {filteredAndSortedUsers.length === 0 ? (
            <div className={styles.periodEmpty}>No users match your search or filter criteria</div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.tableHeader}>
                    <th className={styles.tableHeaderCell}>Name</th>
                    <th className={styles.tableHeaderCell}>Role</th>
                    <th className={styles.tableHeaderCell}>Hours</th>
                    <th className={styles.tableHeaderCell}>Status</th>
                    <th className={styles.tableHeaderCell}>Entries</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedUsers.map((user) => (
                    <tr key={user.id} className={styles.tableRow}>
                      <td className={styles.tableCell}>
                        <div className={styles.userNameCell}>
                          <span className={styles.tableCellName}>
                            {user.firstName} {user.lastName}
                          </span>
                          <span className={styles.userEmail}>{user.email}</span>
                        </div>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.userRole}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={styles.tableCellHours}>
                          {user.hours} hrs
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        <span className={`${styles.statusBadge} ${
                          user.status === 'Complete'
                            ? styles.statusComplete 
                            : styles.statusIncomplete
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className={styles.tableCell}>
                        {user.entries.length > 0 ? (
                          <details className={styles.entriesDetails}>
                            <summary className={styles.entriesSummary}>
                              {user.entries.length} entr{user.entries.length === 1 ? 'y' : 'ies'}
                            </summary>
                            <div className={styles.entriesContent}>
                              {user.entries.map((e: any) => (
                                <div key={e.id || e.createdAt} className={styles.entryCard}>
                                  <div className={styles.entryHeader}>
                                    <div className={styles.entryDate}>
                                      {(e.date || e.createdAt || '').slice(0,10)}
                                    </div>
                                    <div className={styles.entryHours}>
                                      {Number(e.hours || 0)} hrs
                                    </div>
                                  </div>
                                  {e.activity && (
                                    <div className={styles.entryActivity}>
                                      <strong>Activity:</strong> {String(e.activity).slice(0,200)}
                                    </div>
                                  )}
                                  {e.notes && (
                                    <div className={styles.entryNotes}>
                                      <strong>Notes:</strong> {String(e.notes).slice(0,300)}
                                    </div>
                                  )}
                                  {Array.isArray(e.segments) && e.segments.length > 0 && (
                                    <div className={styles.segmentsContainer}>
                                      <strong>Time Segments:</strong>
                                      <ul className={styles.segmentsList}>
                                        {e.segments.map((s: any, i: number) => (
                                          <li key={i} className={styles.segmentItem}>
                                            {s.date} {s.start}–{s.end} ({segmentHours(s)} hrs)
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <span className={styles.noEntries}>No entries</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  )
}
