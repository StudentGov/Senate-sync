import fs from 'fs/promises'
import path from 'path'
import { auth } from '@clerk/nextjs/server'

const votesPath = path.join(process.cwd(), 'src', 'app', 'voting-votes.json')
const votingJsonPath = path.join(process.cwd(), 'src', 'app', 'voting.json')

async function readVotesFile() {
  try {
    const raw = await fs.readFile(votesPath, 'utf-8')
    return JSON.parse(raw) as any[]
  } catch (err) {
    return []
  }
}

async function writeVotesFile(data: any[]) {
  await fs.writeFile(votesPath, JSON.stringify(data, null, 2), 'utf-8')
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const voteId = params.id
    const votingRaw = await fs.readFile(votingJsonPath, 'utf-8')
    const voting = JSON.parse(votingRaw || '{}')
    const base = (voting as any)[voteId]
    if (!base) return new Response(JSON.stringify({ error: 'Vote not found' }), { status: 404 })

    const votes = await readVotesFile()
    const optionCounts: Record<string, number> = {}
    // start with base counts if present
    (base.data || []).forEach((o: any) => {
      optionCounts[String(o.id)] = Number(o.value || 0)
    })

    // add recorded votes
    votes.forEach((v) => {
      if (String(v.voteId) === String(voteId)) {
        const key = String(v.optionId)
        optionCounts[key] = (optionCounts[key] || 0) + 1
      }
    })

    const options = (base.data || []).map((o: any) => ({ id: o.id, label: o.label, count: optionCounts[String(o.id)] || 0 }))
    return new Response(JSON.stringify({ id: voteId, options }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message || String(err) }), { status: 500 })
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })

    const voteId = params.id
    // ensure vote is open/running before accepting votes
    let votingRaw = '{}'
    try { votingRaw = await fs.readFile(votingJsonPath, 'utf-8') } catch (e) { votingRaw = '{}' }
    const voting = JSON.parse(votingRaw || '{}')
    const base = (voting as any)[voteId]
    if (!base) return new Response(JSON.stringify({ error: 'Vote not found' }), { status: 404 })
    if (!base.running) return new Response(JSON.stringify({ error: 'Vote is closed' }), { status: 403 })
    const body = await req.json()
    const optionId = body.optionId

    // prevent duplicate vote by same user for same voteId
    const existing = await readVotesFile()
    const already = existing.find((v) => String(v.voteId) === String(voteId) && v.userId === userId)
    if (already) {
      return new Response(JSON.stringify({ error: 'User has already voted' }), { status: 409 })
    }

    const entry = { id: Date.now(), voteId, optionId, userId, createdAt: new Date().toISOString() }
    existing.push(entry)
    await writeVotesFile(existing)

    return new Response(JSON.stringify({ success: true }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err?.message || String(err) }), { status: 500 })
  }
}

