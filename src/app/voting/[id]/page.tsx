import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import ClientVoteOption from '../../components/ClientVoteOption'
import { auth } from '@clerk/nextjs/server'
import styles from './voting-detail-page.module.css'

type Option = { id: number; label: string; count: number }

export default async function VotingDetailPage({ params }: { params: { id: string } }) {
  const id = String(params.id)

  const votingJsonPath = path.join(process.cwd(), 'src', 'app', 'voting.json')
  const votesPath = path.join(process.cwd(), 'src', 'app', 'voting-votes.json')

  let votingRaw = '{}'
  try { votingRaw = await fs.readFile(votingJsonPath, 'utf-8') } catch (e) { votingRaw = '{}' }
  const voting = JSON.parse(votingRaw || '{}')
  const base = (voting as any)[id]
  if (!base) {
    return (
      <main className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>Vote not found</h1>
          <p className={styles.notFoundDescription}>The vote you're looking for doesn't exist or has been removed.</p>
          <div className={styles.notFoundLinkContainer}>
            <Link href="/voting" className={styles.notFoundLink}>← Back to votes</Link>
          </div>
        </div>
      </main>
    )
  }

  // If vote is closed, hide it for non-admins
  let isAdmin = false
  try {
    const { sessionClaims } = await auth()
    isAdmin = (sessionClaims as any)?.role === 'admin'
  } catch (e) {
    isAdmin = false
  }
  if (!base.running && !isAdmin) {
    return (
      <main className={styles.notFoundContainer}>
        <div className={styles.notFoundContent}>
          <h1 className={styles.notFoundTitle}>Vote not found</h1>
          <p className={styles.notFoundDescription}>The vote you're looking for doesn't exist or has been removed.</p>
          <div className={styles.notFoundLinkContainer}>
            <Link href="/voting" className={styles.notFoundLink}>← Back to votes</Link>
          </div>
        </div>
      </main>
    )
  }

  // compute current counts by combining base values and recorded votes
  let recorded: any[] = []
  try { recorded = JSON.parse(await fs.readFile(votesPath, 'utf-8') || '[]') } catch (e) { recorded = [] }

  const optionCounts: Record<string, number> = {}
  ;(base.data || []).forEach((o: any) => { optionCounts[String(o.id)] = Number(o.value || 0) })
  recorded.forEach((v) => { if (String(v.voteId) === id) { const k = String(v.optionId); optionCounts[k] = (optionCounts[k] || 0) + 1 } })

  const options: Option[] = (base.data || []).map((o: any) => ({ id: o.id, label: o.label, count: optionCounts[String(o.id)] || 0 }))

  return (
    <main className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <Link href="/voting" className={styles.backLink}>← Back</Link>
          <h1 className={styles.pageTitle}>{(base as any).title ?? 'Untitled vote'}</h1>
        </div>
        <p className={styles.pageDescription}>Choose an option below.</p>

        <div className={styles.optionsContainer}>
          {options.map((opt) => (
            <ClientVoteOption key={opt.id} voteId={id} option={opt} showCount={!((base as any)?.running)} />
          ))}
        </div>
      </div>
    </main>
  )
}
