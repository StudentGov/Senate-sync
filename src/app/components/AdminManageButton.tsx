"use client"

import React from 'react'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'

export default function AdminManageButton() {
  const { sessionClaims, isLoaded, isSignedIn } = useAuth()
  if (!isLoaded) return null
  if (!isSignedIn) return null
  const role = sessionClaims?.role as string | undefined
  if (role !== 'admin') return null
  return (
    <Link href="/admin/votes" className="ml-auto inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-md">
      Manage votes
    </Link>
  )
}
