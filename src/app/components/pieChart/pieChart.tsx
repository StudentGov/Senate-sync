
"use client"

import { useState, useEffect } from "react"
import { PieChart, pieArcLabelClasses } from "@mui/x-charts/PieChart"
import Individual from "../individual/individual"
import pusherClient from "@/app/lib/pusher"

interface AgendaProps {
  agenda: {
    id: number
    title: string
    is_visible: boolean
    is_open: boolean
    created_at: string
  }
  isSpeaker: boolean
}

interface DataItem {
  id: number
  value: number
  label: string
}

export default function PieChartPopUp({ agenda, isSpeaker }: AgendaProps) {
  const [modal, setModal] = useState(false)
  const [voteData, setVoteData] = useState<DataItem[]>([])
  const [sum, setSum] = useState(0)
  const [isLoading, setIsLoading] = useState(false)

  // Subscribe to Pusher and silently refresh on updates
  useEffect(() => {
    const channel = pusherClient.subscribe("agenda-channel")
    const handleVoteUpdated = () => {
      refreshVotes()
    }
    channel.bind("vote-updated", handleVoteUpdated)
    return () => {
      channel.unbind("vote-updated", handleVoteUpdated)
    }
  }, [agenda.id])

  // Initial load when opening modal
  function openModal() {
    setModal(true)
    loadVotes()
  }
  function closeModal() {
    setModal(false)
  }

  // Fetch with loader
  async function loadVotes() {
    setIsLoading(true)
    try {
      const res = await fetch("/api/get-vote-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda_id: agenda.id }),
      })
      if (!res.ok) throw new Error("Failed to fetch votes")
      const data = await res.json()
      setVoteData(data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  // Silent refresh
  async function refreshVotes() {
    try {
      const res = await fetch("/api/get-vote-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agenda_id: agenda.id }),
      })
      if (!res.ok) throw new Error("Failed to fetch votes")
      const data = await res.json()
      setVoteData(data.data)
    } catch (err) {
      console.error(err)
    }
  }

  // Recalculate sum whenever voteData changes
  useEffect(() => {
    setSum(voteData.reduce((acc, item) => acc + item.value, 0))
  }, [voteData])

  // Manage body scroll / active-modal class
  useEffect(() => {
    if (typeof window !== "undefined") {
      document.body.classList.toggle("active-modal", modal)
      document.body.style.overflow = modal ? "hidden" : ""
    }
  }, [modal])

  // PieChart sizing and colors
  const size = { width: 400, height: 400 }
  const colors = [
    "#8b5cf6", "#3b82f6", "#10b981", "#f97316",
    "#ef4444", "#ec4899", "#6366f1", "#14b8a6",
    "#f59e0b", "#4ade80", "#f472b6", "#60a5fa",
    "#f87171", "#34d399", "#fb923c", "#a0522d",
    "#999999", "#22d3ee", "#fde047", "#7c3aed"
  ];
  
  const palette = voteData.map((_, i) => colors[i % colors.length])

  return (
    <>
      <button
        onClick={openModal}
        className="border border-purple-200 text-purple-700 hover:bg-purple-50 rounded-md px-4 py-2 text-sm font-medium transition-colors"
      >
        View Voting
      </button>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={closeModal}
            aria-hidden="true"
          />

          {/* Modal Content */}
          <div
            className="relative bg-white rounded-lg shadow-xl mt-[5vh] w-full max-w-3xl max-h-[80vh] flex flex-col overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {agenda.title}
              </h2>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-700 bg-red-600 hover:bg-gray-200 rounded-md px-3 py-1 text-sm font-medium transition-colors"
              >
                Close
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-6">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-700"></div>
                </div>
              ) : sum === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mb-4 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-xl font-medium">No votes yet</p>
                  <p className="text-sm mt-2">
                    Votes will appear here once they are cast
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <PieChart
                      series={[
                        {
                          data: voteData,
                          arcLabel: item =>
                            `${((item.value / sum) * 100).toFixed(0)}%`,
                          arcLabelMinAngle: 20,
                          innerRadius: 30,
                          outerRadius: 140,
                          paddingAngle: 2,
                          cornerRadius: 4,
                          startAngle: -90,
                          endAngle: 270,
                          cx: 200,
                          cy: 200,
                        },
                      ]}
                      colors={palette}
                      slotProps={{
                        legend: { hidden: true }
                      }}
                      sx={{
                        [`& .${pieArcLabelClasses.root}`]: {
                          fill: "white",
                          fontWeight: "bold",
                          fontSize: 14,
                        },
                      }}
                      {...size}
                    />
                  </div>

                  {/* Legend */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4 w-full max-w-md">
                    {voteData.map((item, idx) => (
                      <div key={item.id} className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-sm mr-2"
                          style={{ backgroundColor: palette[idx] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {item.label}
                          </p>
                        </div>
                        <div className="ml-2">
                          <p className="text-sm text-gray-500">
                            {item.value} (
                            {((item.value / sum) * 100).toFixed(1)}%)
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Total Votes */}
                  <div className="mt-6 bg-gray-50 rounded-lg p-4 w-full max-w-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500">
                        Total Votes:
                      </span>
                      <span className="text-lg font-bold text-purple-700">
                        {sum}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t p-4 flex justify-end">
              {(agenda.is_visible || isSpeaker) && (
                <Individual
                  agenda_id={agenda.id}
                  agenda_title={agenda.title}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
