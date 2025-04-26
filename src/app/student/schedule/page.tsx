import SchedulingPage from '../../components/scheduling-page'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center">Schedule an Appointment</h1>
        <p className="text-muted-foreground text-center mb-8">Select a date and time that works for you</p>
        <SchedulingPage />
      </div>
    </main>
  )
}
