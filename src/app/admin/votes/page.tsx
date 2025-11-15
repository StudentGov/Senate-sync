"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

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
    <div className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <h1 className="text-2xl font-semibold">Admin: Manage Votes</h1>
        <Link href="/voting" className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 text-gray-800 rounded-md border">
          ← Back to votes
        </Link>
      </div>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      <section className="mb-6">
        <form onSubmit={createVote} className="space-y-2">
          <div className="flex gap-2 items-center">
            <label className="text-sm w-20">Title <span className="text-red-600 ml-1">*</span></label>
            <input aria-required className="border px-2 py-1 flex-1" placeholder="Vote title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
            <label className="flex items-center gap-2 ml-4">
              <input type="checkbox" checked={newRunning} onChange={(e) => setNewRunning(e.target.checked)} />
              <span className="text-sm">Running</span>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <strong className="mr-2">New vote options</strong>
            <button type="button" className="text-sm text-gray-500" onClick={addNewOption}>+ Add option</button>
          </div>
          <div className="space-y-2">
            {newOptions.map((opt, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <input className="border px-2 py-1 flex-1" placeholder={`Option ${idx + 1}`} value={opt} onChange={(e) => updateNewOption(idx, e.target.value)} />
                {newOptions.length > 1 && <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => removeNewOption(idx)}>Remove</button>}
              </div>
            ))}
          </div>
          <div>
            <button className="bg-blue-600 text-white px-3 py-1 rounded" type="submit">Create vote</button>
          </div>
        </form>
      </section>

      <section>
        {loading ? <div>Loading...</div> : (
          <div className="space-y-4">
            {Object.keys(voting).length === 0 && <div>No votes found</div>}
            {Object.entries(voting).map(([id, entry]) => (
              <div key={id} className="border p-3 rounded">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3">
                      <strong>{(entry as any).title ?? 'Untitled vote'}</strong>
                      {(entry as any).running ? <span className="ml-2 text-sm text-green-600">● Running</span> : <span className="ml-2 text-sm text-red-600">● Closed</span>}
                    </div>
                    <div className="text-sm text-gray-600">Options: {entry.data.map((d:any) => `${d.label} (${d.count ?? d.value ?? 0})`).join(', ')}</div>
                  </div>
                  <div className="flex gap-2">
                    <button className="px-2 py-1 border rounded" onClick={() => startEdit(id)}>Edit</button>
                    <button className="px-2 py-1 border rounded text-red-600" onClick={() => deleteVote(id)}>Delete</button>
                  </div>
                </div>
                {editingId === id && (
                  <div className="mt-3">
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <label className="text-sm w-20">Title <span className="text-red-600 ml-1">*</span></label>
                        <input aria-required className="border px-2 py-1 flex-1" value={editingTitle} onChange={(e) => setEditingTitle(e.target.value)} />
                        <label className="flex items-center gap-2 ml-4">
                          <input type="checkbox" checked={editingRunning} onChange={(e) => setEditingRunning(e.target.checked)} />
                          <span className="text-sm">Running</span>
                        </label>
                      </div>
                      {editingOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input className="border px-2 py-1 flex-1" value={opt.label} onChange={(e) => updateEditingOption(idx, e.target.value)} />
                          <input className="w-20 border px-2 py-1 text-center" value={String(opt.value ?? 0)} onChange={(e) => setEditingOptions(prev => prev.map((p,i)=> i===idx ? { ...p, value: Number(e.target.value) || 0 } : p))} />
                          {editingOptions.length > 1 && <button type="button" className="px-2 py-1 border rounded text-red-600" onClick={() => removeEditingOption(idx)}>Remove</button>}
                        </div>
                      ))}
                      <div>
                        <button type="button" className="px-2 py-1 border rounded" onClick={addEditingOption}>+ Add option</button>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={() => saveEdit()}>Save</button>
                      <button className="px-3 py-1 border rounded" onClick={() => { setEditingId(null); setEditingOptions([]) }}>Cancel</button>
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
