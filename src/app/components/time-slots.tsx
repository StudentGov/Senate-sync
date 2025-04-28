"use client";

import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { format } from "date-fns";
import { Loader2, CalendarIcon } from "lucide-react";

export interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
}

interface TimeSlotsProps {
  date: Date;
  selectedSlot: Slot | null; // ✅ selectedSlot is now a Slot (not string)
  onSelectSlot: (slot: Slot) => void; // ✅ onSelectSlot receives a Slot
}

export default function TimeSlots({ date, selectedSlot, onSelectSlot }: TimeSlotsProps) {
  const [availableSlots, setAvailableSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setLoading(true);
        const formattedDate = format(date, "yyyy-MM-dd");
        const res = await fetch(`/api/student/get-availability`);
        const data = await res.json();

        const slotsForDate = data.filter((slot: Slot) => slot.date === formattedDate);
        setAvailableSlots(slotsForDate);
      } catch (error) {
        console.error("Failed to fetch available slots:", error);
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    };

    if (date) {
      fetchSlots();
    }
  }, [date]);

  if (loading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-muted-foreground">Loading available time slots...</p>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="py-8 flex items-center justify-center h-full">
        <div className="text-center">
          <CalendarIcon className="mx-auto h-10 w-10 mb-2 opacity-30" />
          <p className="text-lg font-medium mb-2">No Available Times</p>
          <p className="text-muted-foreground">
            There are no available slots for {format(date, "MMMM d, yyyy")}.<br />
            Please select another date.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto max-h-[350px] p-2">
      {availableSlots.map((slot) => {
        const timeLabel = `${slot.start_time} - ${slot.end_time}`;

        return (
          <Button
            key={slot.id}
            variant={selectedSlot?.id === slot.id ? "default" : "outline"} // ✅ Compare by ID
            className="w-full justify-between font-medium"
            onClick={() => onSelectSlot(slot)} // ✅ Pass full slot
          >
            {timeLabel}
          </Button>
        );
      })}
    </div>
  );
}
