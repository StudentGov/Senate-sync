import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import AdminManageButton from '../components/AdminManageButton'
import { auth } from '@clerk/nextjs/server'

export default async function VotingIndexPage() {
  const votingJsonPath = path.join(process.cwd(), 'src', 'app', 'voting.json')
  let votingData: Record<string, any> = {}
  try {
    const raw = await fs.readFile(votingJsonPath, 'utf-8')
    votingData = JSON.parse(raw || '{}')
  } catch (err) {
    votingData = {}
  }

  const entries = Object.entries(votingData)
  // determine if current user is admin; only admins see closed votes
  let isAdmin = false
  try {
    const { sessionClaims } = await auth()
    isAdmin = (sessionClaims as any)?.role === 'admin'
  } catch (e) {
    isAdmin = false
  }
  const displayed = isAdmin ? entries : entries.filter(([, item]) => (item as any)?.running)
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto py-16 px-6">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-semibold text-gray-800">Voting</h1>
          <AdminManageButton />
        </div>
        <p className="mt-2 text-gray-600">Active and past votes.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayed.map(([id, item]) => (
            <div key={id} className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-medium text-gray-800">{(item as any)?.title ?? 'Untitled vote'}</h2>
              <p className="mt-2 text-gray-600">Options: {Array.isArray((item as any).data) ? (item as any).data.map((o:any)=>o.label).join(', ') : ''}</p>
              <div className="mt-4">
                <Link href={`/voting/${id}`} className="text-purple-700 font-medium">Open vote →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
