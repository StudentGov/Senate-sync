"use client"

import SchedulingPage from "../../components/scheduling-page"
import { Card, CardContent } from "../../components/ui/card"
import { ExternalLink } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 ">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center">Book Your Appointment</h1>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12  ">
          {/* International Consultation Option */}
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors rounded-xl">
            <CardContent className="p-6 flex flex-col items-center text-center bg-white rounded-xl">
              <h2 className="text-xl font-bold mb-3">International Consultation</h2>
              <p className="text-muted-foreground mb-6">
                For international clients seeking legal consultation with our attorneys.
              </p>
              <a
                href="https://forms.office.com/pages/responsepage.aspx?id=xscRULQKq0ae9PrnSpIaf_E0SXkZUCBIlzFE-ZzOyLNUMk5RRkk0NDdJSUpXVVhTSktUNkY2WUhFSSQlQCN0PWcu&route=shorturl"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <span>International Attorney Intake Form</span>
                <ExternalLink className="h-4 w-4" />
              </a>
            </CardContent>
          </Card>

          {/* Regular Appointment Option */}
          <Card className="border-2 border-primary/20 hover:border-primary/50 transition-colors rounded-xl">
            <CardContent className="p-6 flex flex-col items-center text-center bg-white rounded-xl">
              <h2 className="text-xl font-bold mb-3">Regular Appointment</h2>
              <p className="text-muted-foreground mb-6">For all other appointment types with our team.</p>
              <button
                onClick={() => document.getElementById("scheduling-section")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center justify-center gap-2 bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <span>Schedule Below</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-chevron-down"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </CardContent>
          </Card>
        </div>

        <div id="scheduling-section">
          <h2 className="text-2xl font-bold mb-2 text-center">Schedule an Appointment</h2>
          <p className="text-muted-foreground text-center mb-8">Select a date and time that works for you</p>
          <SchedulingPage />
        </div>
      </div>
    </main>
  )
}
