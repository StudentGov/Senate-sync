import fs from 'fs/promises'
import path from 'path'

const votingJsonPath = path.join(process.cwd(), 'src', 'app', 'voting.json')

export async function GET() {
  try {
    const raw = await fs.readFile(votingJsonPath, 'utf-8')
    const parsed = JSON.parse(raw || '{}')
    return new Response(JSON.stringify({ success: true, voting: parsed }), { status: 200 })
  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, message: err?.message || String(err) }), { status: 500 })
  }
}
