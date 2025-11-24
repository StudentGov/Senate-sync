"use client";

import { useState } from "react";
import { Calendar } from "../components/ui/calendar";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { CalendarIcon, Clock, ArrowRight } from "lucide-react";
import TimeSlots from "../components/time-slots";
import BookingModal from "../components/booking-modal";
import { format } from "date-fns";

interface Slot {
  id: number;
  date: string;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
}

// Helper function to check if a slot is past (same logic as in time-slots.tsx)
function isSlotPast(slot: Slot): boolean {
  try {
    const trimmedTime = slot.start_time.trim();
    let timePart: string;
    let modifier: string;
    
    if (trimmedTime.includes(" ")) {
      [timePart, modifier] = trimmedTime.split(" ");
    } else {
      modifier = trimmedTime.slice(-2).toUpperCase();
      timePart = trimmedTime.slice(0, -2);
    }
    
    const [hours, minutes] = timePart.split(":").map(Number);
    modifier = modifier.toUpperCase();
    
    let hours24 = hours;
    if (modifier === "PM" && hours !== 12) hours24 += 12;
    if (modifier === "AM" && hours === 12) hours24 = 0;
    
    const [year, month, day] = slot.date.split("-").map(Number);
    const slotDateTime = new Date(year, month - 1, day, hours24, minutes, 0, 0);
    const now = new Date();
    
    return slotDateTime.getTime() < now.getTime();
  } catch (error) {
    console.error("Error checking if slot is past:", error, slot);
    return false;
  }
}

export default function SchedulingPage() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    setSelectedSlot(null);
    if (selectedDate) {
      setStep(2);
    }
  };

  const handleSlotSelect = (slot: Slot) => {
    // Prevent selecting past or booked slots
    if (isSlotPast(slot) || slot.is_booked === true) {
      console.warn("Attempted to select unavailable slot:", slot);
      return;
    }
    setSelectedSlot(slot);
  };

  const handleNext = () => {
    if (selectedSlot) {
      setIsModalOpen(true);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  // const handleBookingSubmit = (data: { starId: string; techId: string; description: string }) => {
  //   console.log("Booking form submitted:", {
  //     date,
  //     timeSlot: selectedSlot,
  //     ...data,
  //   });

  //   setIsModalOpen(false);
  //   setDate(undefined);
  //   setSelectedSlot(null);
  //   setStep(1);
  // };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <CalendarIcon className="h-5 w-5" />
            </div>
            <div className={`h-1 w-16 md:w-24 ${step >= 2 ? "bg-primary" : "bg-muted"}`}></div>
          </div>
          <div className="flex items-center">
            <div className={`rounded-full h-10 w-10 flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
              <Clock className="h-5 w-5" />
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-2">
          <div className="text-sm font-medium text-center w-32 md:w-40">Select Date</div>
          <div className="text-sm font-medium text-center w-32 md:w-40">Choose Time</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="overflow-hidden border-none shadow-lg">
          <CardContent className="p-0">
            <div className="bg-primary p-4 text-primary-foreground">
              <h2 className="text-xl font-semibold">Select a Date</h2>
              <p className="text-sm opacity-90">Choose your preferred day</p>
            </div>
            <div className="p-4 flex justify-center items-center">
              <Calendar mode="single" selected={date} onSelect={handleDateSelect} className="rounded-md" />
            </div>
          </CardContent>
        </Card>

        <div>
          <Card className="h-full border-none shadow-lg">
            <CardContent className="p-0 h-full">
              <div className="bg-primary p-4 text-primary-foreground">
                <h2 className="text-xl font-semibold">Available Times</h2>
                <p className="text-sm opacity-90">
                  {date ? `For ${format(date, "MMMM d, yyyy")}` : "Select a date first"}
                </p>
              </div>
              <div className="p-4 h-[calc(100%-5rem)] flex flex-col">
                {date ? (
                  <>
                    <TimeSlots
                      date={date}
                      selectedSlot={selectedSlot}
                      onSelectSlot={handleSlotSelect}
                    />
                    <div className="mt-auto pt-4">
                      <Button onClick={handleNext} disabled={!selectedSlot} className="w-full group">
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-muted-foreground">
                      <CalendarIcon className="mx-auto h-12 w-12 mb-2 opacity-20" />
                      <p>Please select a date to view available time slots</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <BookingModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        date={date}
        timeSlot={selectedSlot}
      />
    </div>
  );
}
