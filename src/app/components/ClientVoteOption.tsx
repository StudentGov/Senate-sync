"use client"

import React, { useState } from 'react'

export default function ClientVoteOption({ voteId, option, showCount = true }: { voteId: string; option: { id: number; label: string; count: number }, showCount?: boolean }) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [count, setCount] = useState(option.count)

  async function cast() {
    setLoading(true)
    setMessage(null)
    try {
      const res = await fetch(`/api/voting/${voteId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ optionId: option.id }),
      })
      if (res.status === 409) {
        setMessage('You have already voted for this item')
        return
      }
      if (!res.ok) throw new Error('Failed')
      setMessage('Vote recorded')
      setCount((c) => c + 1)
    } catch (err) {
      setMessage('Failed to record vote')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center justify-between">
      <div>
        <div className="text-lg font-medium">{option.label}</div>
        {showCount && <div className="text-sm text-gray-500">Current count: {count}</div>}
      </div>
      <div className="flex flex-col items-end">
        <button onClick={cast} disabled={loading} className="bg-purple-700 text-white px-4 py-2 rounded">
          {loading ? 'Saving...' : 'Vote'}
        </button>
        {message && <div className="text-sm text-gray-500 mt-2">{message}</div>}
      </div>
    </div>
  )
}
