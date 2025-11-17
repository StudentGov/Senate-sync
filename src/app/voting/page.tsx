import fs from 'fs/promises'
import path from 'path'
import Link from 'next/link'
import AdminManageButton from '../components/AdminManageButton'
import { auth } from '@clerk/nextjs/server'
import styles from './voting-page.module.css'

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
    <main className={styles.pageContainer}>
      <div className={styles.contentWrapper}>
        <div className={styles.headerSection}>
          <h1 className={styles.pageTitle}>Voting</h1>
          <AdminManageButton />
        </div>
        <p className={styles.pageDescription}>Active and past votes.</p>

        <div className={styles.votingCardsGrid}>
          {displayed.map(([id, item]) => (
            <div key={id} className={styles.votingCard}>
              <h2 className={styles.votingCardTitle}>{(item as any)?.title ?? 'Untitled vote'}</h2>
              <p className={styles.votingCardDescription}>Options: {Array.isArray((item as any).data) ? (item as any).data.map((o:any)=>o.label).join(', ') : ''}</p>
              <div className={styles.votingCardLink}>
                <Link href={`/voting/${id}`} className={styles.votingCardLinkText}>Open vote →</Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
