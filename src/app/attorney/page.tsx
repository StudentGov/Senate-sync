"use client";

import { useState } from "react";
import { AttorneyCard } from "../components/attorney-card";
import { UserForm } from "../components/user-form";
import { AppointmentSummary } from "../components/appointment-summary";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  duration: string;
}

// Helper function to get the start of the week (Monday)
function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
}

// Helper function to format date range (Mon - Fri)
function formatWeekRange(startDate: Date): string {
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4); // Monday to Friday (5 days)

  const startMonth = startDate.toLocaleDateString("en-US", { month: "short" });
  const endMonth = endDate.toLocaleDateString("en-US", { month: "short" });
  const startDay = startDate.getDate();
  const endDay = endDate.getDate();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}`;
  }
}

export default function AttorneyPage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date())
  );
  const [selectedSlot, setSelectedSlot] = useState<{
    attorney: string;
    slot: TimeSlot;
    date: Date;
  } | null>(null);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const sarahTimeSlots: TimeSlot[] = [
    { id: "sj-1", time: "Mon 9:00 AM", duration: "30 minutes" },
    { id: "sj-2", time: "Mon 9:30 AM", duration: "30 minutes" },
    { id: "sj-3", time: "Mon 10:00 AM", duration: "30 minutes" },
    { id: "sj-4", time: "Mon 10:30 AM", duration: "30 minutes" },
    { id: "sj-5", time: "Wed 2:00 PM", duration: "30 minutes" },
    { id: "sj-6", time: "Wed 2:30 PM", duration: "30 minutes" },
    { id: "sj-7", time: "Wed 3:00 PM", duration: "30 minutes" },
    { id: "sj-8", time: "Wed 3:30 PM", duration: "30 minutes" },
  ];

  const michaelTimeSlots: TimeSlot[] = [
    { id: "mc-1", time: "Tue 1:00 PM", duration: "30 minutes" },
    { id: "mc-2", time: "Tue 1:30 PM", duration: "30 minutes" },
    { id: "mc-3", time: "Tue 2:00 PM", duration: "30 minutes" },
    { id: "mc-4", time: "Tue 2:30 PM", duration: "30 minutes" },
    { id: "mc-5", time: "Thu 11:00 AM", duration: "30 minutes" },
    { id: "mc-6", time: "Thu 11:30 AM", duration: "30 minutes" },
    { id: "mc-7", time: "Thu 12:00 PM", duration: "30 minutes" },
    { id: "mc-8", time: "Thu 12:30 PM", duration: "30 minutes" },
  ];

  const handleSlotSelect = (attorney: string, slot: TimeSlot, dayOfWeek: number) => {
    // Calculate the actual date based on the selected week and day
    const appointmentDate = new Date(currentWeekStart);
    appointmentDate.setDate(currentWeekStart.getDate() + dayOfWeek);

    setSelectedSlot({ attorney, slot, date: appointmentDate });
  };

  const handleFormSubmit = (data: any) => {
    console.log("Form submitted:", data);
  };

  const handleConfirmAppointment = () => {
    console.log("Appointment confirmed!");
    // Handle appointment confirmation
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white py-12" id="attorney">
        <div className="container mx-auto px-4 text-center">
          <h1 className="font-bold text-3xl md:text-4xl text-gray-900 mb-4">
            Schedule Your Legal Consultation
          </h1>
          <p className="text-gray-600 max-w-3xl mx-auto mb-2">
            Connect with qualified student attorneys for free legal advice and guidance.
          </p>
          <p className="text-gray-600 max-w-3xl mx-auto">
            Our experienced law students provide professional consultation services under faculty supervision.
          </p>
        </div>
      </section>

      {/* Location Banner - Centered Box */}
      <section className="py-6">
        <div className="container mx-auto px-4 flex justify-center">
          <div className="bg-[#febd11]/20 border-2 border-[#febd11] rounded-lg px-8 py-4 inline-flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#49306e]" />
            <span className="font-semibold text-[#49306e]">Location: Student Government Office</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container mx-auto px-4">
          <h2 className="font-bold text-2xl md:text-3xl text-gray-900 text-center mb-8">
            Select an Attorney and Time Slot
          </h2>

          {/* Attorney Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
            <AttorneyCard
              initials="SJ"
              name="Sarah Johnson"
              title="Student Attorney"
              specialization="3L, Civil Rights & Family Law"
              timeSlots={sarahTimeSlots}
              onSelectSlot={handleSlotSelect}
              selectedSlotId={selectedSlot?.slot.id}
              weekRange={formatWeekRange(currentWeekStart)}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
            />
            <AttorneyCard
              initials="MC"
              name="Michael Chen"
              title="Student Attorney"
              specialization="3L, Contract & Business Law"
              timeSlots={michaelTimeSlots}
              onSelectSlot={handleSlotSelect}
              selectedSlotId={selectedSlot?.slot.id}
              weekRange={formatWeekRange(currentWeekStart)}
              onPreviousWeek={goToPreviousWeek}
              onNextWeek={goToNextWeek}
            />
          </div>

          {/* Form and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserForm onSubmit={handleFormSubmit} />
            </div>
            <div>
              <AppointmentSummary
                date={
                  selectedSlot
                    ? selectedSlot.date.toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })
                    : "-"
                }
                time={selectedSlot?.slot.time || "-"}
                attorney={selectedSlot?.attorney || "-"}
                duration={selectedSlot?.slot.duration || "-"}
                onConfirm={handleConfirmAppointment}
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

