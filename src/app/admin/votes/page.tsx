"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import styles from './admin-votes-page.module.css'

type VoteData = { id: number; value: number; label: string }

export default function AdminVotesPage() {
  const [voting, setVoting] = useState<Record<string, { data: VoteData[] }>>({})
  const [loading, setLoading] = useState(false)
  const [newOptions, setNewOptions] = useState<string[]>([''])
  const [newTitle, setNewTitle] = useState<string>('')
  const [newRunning, setNewRunning] = useState<boolean>(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingOptions, setEditingOptions] = useState<Array<{ label: string; value?: number; id?: number }>>([])
  const [editingTitle, setEditingTitle] = useState<string>('')
  const [editingRunning, setEditingRunning] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/votes')
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      setVoting(json.voting || {})
    } catch (err: any) {
      setError(err.message || String(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function createVote(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const options = newOptions.map(s => s.trim()).filter(Boolean)
    if (options.length === 0) return setError('Provide at least one option label')
    if (!newTitle || !newTitle.trim()) return setError('Title is required')
    try {
      const res = await fetch('/api/admin/votes', { method: 'POST', body: JSON.stringify({ options, title: newTitle, running: newRunning }), headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error(await res.text())
      const json = await res.json()
      const newId = json.id
      setNewOptions([''])
      setNewTitle('')
      setNewRunning(true)
      await load()
      // navigate to newly created vote so admin can verify it
      if (newId) router.push(`/voting/${newId}`)
    } catch (err: any) {
      setError(err.message || String(err))
    }
  }

  async function deleteVote(id: string) {
    const entry: any = voting[id]
    const name = entry?.title || id
    if (!confirm('Delete vote "' + name + '"?')) return
    try {
      const res = await fetch('/api/admin/votes', { method: 'DELETE', body: JSON.stringify({ id }), headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error(await res.text())
      await load()
    } catch (err: any) {
      setError(err.message || String(err))
    }
  }

  function startEdit(id: string) {
    setEditingId(id)
    const entry = voting[id]
    const data = entry?.data || []
    setEditingOptions(data.map((d:any) => ({ label: d.label || '', value: d.value ?? 0, id: d.id })))
    // populate editable title and running
    setEditingTitle((entry as any)?.title || '')
    setEditingRunning((entry as any)?.running ?? true)
  }

  async function saveEdit() {
    if (!editingId) return
    try {
      if (!editingTitle || !editingTitle.trim()) return setError('Title is required')
      const data = editingOptions.map((o, idx) => ({ id: o.id ?? idx, label: o.label, value: o.value ?? 0 }))
      const res = await fetch('/api/admin/votes', { method: 'PUT', body: JSON.stringify({ id: editingId, data, title: editingTitle, running: editingRunning }), headers: { 'Content-Type': 'application/json' } })
      if (!res.ok) throw new Error(await res.text())
      setEditingId(null)
      setEditingOptions([])
      setEditingTitle('')
      setEditingRunning(true)
      await load()
    } catch (err: any) {
      setError(err.message || String(err))
    }
  }

  // new options handlers
  function updateNewOption(idx: number, val: string) {
    setNewOptions((prev) => prev.map((p, i) => i === idx ? val : p))
  }
  function addNewOption() {
    setNewOptions((prev) => [...prev, ''])
  }
  function removeNewOption(idx: number) {
    setNewOptions((prev) => prev.filter((_, i) => i !== idx))
  }

  // editing options handlers
  function updateEditingOption(idx: number, val: string) {
    setEditingOptions((prev) => prev.map((p, i) => i === idx ? { ...p, label: val } : p))
  }
  function addEditingOption() {
    setEditingOptions((prev) => [...prev, { label: '' }])
  }
  function removeEditingOption(idx: number) {
    setEditingOptions((prev) => prev.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.headerSection}>
        <h1 className={styles.pageTitle}>Admin: Manage Votes</h1>
        <Link href="/voting" className={styles.backLink}>
          ← Back to votes
        </Link>
      </div>
      {error && <div className={styles.errorMessage}>{error}</div>}
      <section className={styles.formSection}>
        <form onSubmit={createVote} className={styles.form}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Title <span className={styles.formLabelRequired}>*</span></label>
            <input aria-required className={styles.formInput} placeholder="Vote title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <label className={styles.formCheckboxLabel}>
              <input type="checkbox" checked={newRunning} onChange={(e) => setNewRunning(e.target.checked)} />
              <span className={styles.formCheckboxLabelText}>Running</span>
            </label>
          </div>
          <div className={styles.formOptionsHeader}>
            <strong className={styles.formOptionsHeaderText}>New vote options</strong>
            <button type="button" className={styles.addOptionButton} onClick={addNewOption}>+ Add option</button>
          </div>
          <div className={styles.formOptionsList}>
            {newOptions.map((opt, idx) => (
              <div key={idx} className={styles.formOptionRow}>
                <input className={styles.formOptionInput} placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateNewOption(idx, e.target.value)} />
                {newOptions.length > 1 && <button type="button" className={styles.removeOptionButton} onClick={() => removeNewOption(idx)}>Remove</button>}
              </div>
            ))}
          </div>
          <div>
            <button className={styles.submitButton} type="submit">Create vote</button>
          </div>
        </form>
      </section>

      <section>
        {loading ? <div className={styles.loadingState}>Loading...</div> : (
          <div className={styles.votesList}>
            {Object.keys(voting).length === 0 && <div className={styles.emptyState}>No votes found</div>}
            {Object.entries(voting).map(([id, entry]) => (
              <div key={id} className={styles.voteCard}>
                <div className={styles.voteCardHeader}>
                  <div className={styles.voteCardInfo}>
                    <div className={styles.voteCardTitleRow}>
                      <strong className={styles.voteCardTitle}>{(entry as any).title ?? 'Untitled vote'}</strong>
                      {(entry as any).running ? <span className={styles.voteCardStatusRunning}>● Running</span> : <span className={styles.voteCardStatusClosed}>● Closed</span>}
                    </div>
                    <div className={styles.voteCardOptions}>Options: {entry.data.map((d:any) => `${d.label} (${d.count ?? d.value ?? 0})`).join(', ')}</div>
                  </div>
                  <div className={styles.voteCardActions}>
                    <button className={styles.voteCardButton} onClick={() => startEdit(id)}>Edit</button>
                    <button className={`${styles.voteCardButton} ${styles.voteCardButtonDelete}`} onClick={() => deleteVote(id)}>Delete</button>
                  </div>
                </div>
                {editingId === id && (
                  <div className={styles.editForm}>
                    <div className={styles.editFormFields}>
                      <div className={styles.editFormRow}>
                        <label className={styles.editFormLabel}>Title <span className={styles.editFormLabelRequired}>*</span></label>
                        <input aria-required className={styles.editFormInput} value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
                        <label className={styles.editFormCheckboxLabel}>
                          <input type="checkbox" checked={editingRunning} onChange={(e) => setEditingRunning(e.target.checked)} />
                          <span className={styles.editFormCheckboxLabelText}>Running</span>
                        </label>
                      </div>
                      {editingOptions.map((opt, idx) => (
                        <div key={idx} className={styles.editFormOptionRow}>
                          <input className={styles.editFormOptionInput} value={opt.label} onChange={(e) => updateEditingOption(idx, e.target.value)} />
                          <input className={styles.editFormOptionValueInput} value={String(opt.value ?? 0)} onChange={(e) => setEditingOptions(prev => prev.map((p,i)=> i===idx ? { ...p, value: Number(e.target.value) || 0 } : p))} />
                          {editingOptions.length > 1 && <button type="button" className={styles.removeOptionButton} onClick={() => removeEditingOption(idx)}>Remove</button>}
                        </div>
                      ))}
                      <div>
                        <button type="button" className={styles.voteCardButton} onClick={addEditingOption}>+ Add option</button>
                      </div>
                    </div>
                    <div className={styles.editFormActions}>
                      <button className={styles.editFormSaveButton} onClick={() => saveEdit()}>Save</button>
                      <button className={styles.editFormCancelButton} onClick={() => { setEditingId(null); setEditingOptions([]) }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
