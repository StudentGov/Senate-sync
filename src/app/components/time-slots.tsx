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
  is_booked?: boolean; // Optional field for defensive programming
}

interface TimeSlotsProps {
  date: Date;
  selectedSlot: Slot | null; // ✅ selectedSlot is now a Slot (not string)
  onSelectSlot: (slot: Slot) => void; // ✅ onSelectSlot receives a Slot
}

// Helper function to parse time string (format: "HH:MM AM/PM") and combine with date
function parseSlotDateTime(dateStr: string, timeStr: string): Date {
  // Handle time string with or without space between time and AM/PM
  const trimmedTime = timeStr.trim();
  let timePart: string;
  let modifier: string;
  
  // Check if there's a space between time and AM/PM
  if (trimmedTime.includes(" ")) {
    [timePart, modifier] = trimmedTime.split(" ");
  } else {
    // If no space, extract AM/PM from the end
    modifier = trimmedTime.slice(-2).toUpperCase();
    timePart = trimmedTime.slice(0, -2);
  }
  
  const [hours, minutes] = timePart.split(":").map(Number);
  modifier = modifier.toUpperCase();
  
  let hours24 = hours;
  if (modifier === "PM" && hours !== 12) hours24 += 12;
  if (modifier === "AM" && hours === 12) hours24 = 0;
  
  // Create date in local timezone by parsing the date string and setting time components
  const [year, month, day] = dateStr.split("-").map(Number);
  const slotDate = new Date(year, month - 1, day, hours24, minutes, 0, 0);
  
  return slotDate;
}

// Check if a slot has already passed
function isSlotPast(slot: Slot): boolean {
  try {
    const slotDateTime = parseSlotDateTime(slot.date, slot.start_time);
    const now = new Date();
    // Compare with a small buffer to account for any timing issues
    // If the slot time is in the past (even by 1 second), it's considered past
    return slotDateTime.getTime() < now.getTime();
  } catch (error) {
    console.error("Error parsing slot date/time:", error, slot);
    return false;
  }
}

// Check if a slot is unavailable (past or booked)
function isSlotUnavailable(slot: Slot): boolean {
  return isSlotPast(slot) || slot.is_booked === true;
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
        const isUnavailable = isSlotUnavailable(slot);
        const isPast = isSlotPast(slot);

        return (
          <Button
            key={slot.id}
            variant={selectedSlot?.id === slot.id ? "default" : "outline"}
            className={`w-full justify-between font-medium ${
              isUnavailable 
                ? "cursor-not-allowed bg-muted text-muted-foreground" 
                : ""
            }`}
            disabled={isUnavailable}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isUnavailable) {
                onSelectSlot(slot);
              }
            }}
            onMouseDown={(e) => {
              if (isUnavailable) {
                e.preventDefault();
                e.stopPropagation();
              }
            }}
            title={isPast ? "This time slot has already passed" : slot.is_booked ? "This time slot is already booked" : undefined}
          >
            {timeLabel}
          </Button>
        );
      })}
    </div>
  );
}
