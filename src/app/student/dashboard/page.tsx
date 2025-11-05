"use client"

import React from 'react'
import Link from 'next/link'

export default function StudentDashboardPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <h1 className="text-3xl font-semibold text-gray-800">Student Dashboard</h1>
        <p className="mt-2 text-gray-600">Quick access to your student tools.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/voting" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <h2 className="text-xl font-medium text-gray-800">Voting</h2>
            <p className="mt-2 text-gray-600">Go to the voting page to review and cast votes.</p>
            <div className="mt-4 inline-flex items-center gap-2 text-purple-700 font-medium">Open →</div>
          </Link>

          <Link href="/senate/log-hours" className="block bg-white rounded-lg shadow p-6 hover:shadow-md transition">
            <h2 className="text-xl font-medium text-gray-800">Log Hours</h2>
            <p className="mt-2 text-gray-600">Record your senator hours and view your two-week progress.</p>
            <div className="mt-4 inline-flex items-center gap-2 text-purple-700 font-medium">Open →</div>
          </Link>
        </div>
      </div>
    </main>
  )
}
