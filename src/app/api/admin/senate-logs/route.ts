import { NextResponse } from 'next/server'

// Legacy endpoint kept for compatibility. Advise clients to use /api/admin/hour-log instead.
export async function GET() {
  return NextResponse.json({ message: 'moved', location: '/api/admin/hour-log' }, { status: 301 })
}
