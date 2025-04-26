"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { format } from "date-fns"
import { Loader2 } from "lucide-react"
import availableSlotsData from "../time-data/available-slots.json"

interface TimeSlotsProps {
  date: Date
  selectedSlot: string | null
  onSelectSlot: (slot: string) => void
}

export default function TimeSlots({ date, selectedSlot, onSelectSlot }: TimeSlotsProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real application, you would fetch available slots from your API
    // This is a mock implementation
    setLoading(true)

    // Simulate API call
    setTimeout(() => {
      // Get time slots from the JSON data
      const formattedDate = format(date, "yyyy-MM-dd")
      const dateData = availableSlotsData.slots.find((slot) => slot.date === formattedDate)

      if (dateData) {
        setAvailableSlots(dateData.available)
      } else {
        // If no data for this date, return empty array
        setAvailableSlots([])
      }

      setLoading(false)
    }, 800)
  }, [date])

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading available time slots...</p>
      </div>
    )
  }

  if (availableSlots.length === 0) {
    return (
      <div className="py-8 text-center h-full flex items-center justify-center">
        <div>
          <p className="text-lg font-medium mb-2">No Available Times</p>
          <p className="text-muted-foreground">
            There are no available slots for {format(date, "MMMM d, yyyy")}.<br />
            Please select another date.
          </p>
        </div>
      </div>
    )
  }

  // Group time slots by morning, afternoon, evening
  const morningSlots = availableSlots.filter((slot) => slot.includes("AM"))
  const afternoonSlots = availableSlots.filter((slot) => slot.includes("PM") && Number.parseInt(slot.split(":")[0]) < 5)
  const eveningSlots = availableSlots.filter((slot) => slot.includes("PM") && Number.parseInt(slot.split(":")[0]) >= 5)

  // const container = {
  //   hidden: { opacity: 0 },
  //   show: {
  //     opacity: 1,
  //     transition: {
  //       staggerChildren: 0.05,
  //     },
  //   },
  // }

  // const item = {
  //   hidden: { opacity: 0, y: 20 },
  //   show: { opacity: 1, y: 0 },
  // }

  const renderTimeGroup = (title: string, slots: string[]) => {
    if (slots.length === 0) return null

    return (
      <div className="mb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          {slots.map((slot) => (
            <div key={slot}>
              <Button
                variant={selectedSlot === slot ? "default" : "outline"}
                className="w-full justify-center hover:border-primary/50 transition-all"
                onClick={() => onSelectSlot(slot)}
              >
                {slot}
              </Button>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-y-auto max-h-[350px] pr-1 space-y-4">
      {renderTimeGroup("Morning", morningSlots)}
      {renderTimeGroup("Afternoon", afternoonSlots)}
      {renderTimeGroup("Evening", eveningSlots)}
    </div>
  )
}
