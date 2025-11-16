"use client";

import { useState } from "react";
import { AttorneyCard } from "../components/attorney-card";
import { UserForm } from "../components/user-form";
import { AppointmentSummary } from "../components/appointment-summary";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import styles from './attorney-page.module.css';

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
    <div className={styles.pageContainer}>
      {/* Hero Section */}
      <section className={styles.heroSection} id="attorney">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Schedule Your Legal Consultation
          </h1>
          <p className={styles.heroDescription}>
            Connect with qualified student attorneys for free legal advice and guidance.
          </p>
          <p className={styles.heroDescription}>
            Our experienced law students provide professional consultation services under faculty supervision.
          </p>
        </div>
      </section>

      {/* Location Banner - Centered Box */}
      <section className={styles.locationBanner}>
        <div className={styles.locationBannerContent}>
          <div className={styles.locationBannerBox}>
            <MapPin className={styles.locationBannerIcon} />
            <span className={styles.locationBannerText}>Location: Student Government Office</span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className={styles.mainContent}>
        <div className={styles.mainContentWrapper}>
          <h2 className={styles.sectionTitle}>
            Select an Attorney and Time Slot
          </h2>

          {/* Attorney Cards */}
          <div className={styles.attorneyCardsGrid}>
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
          <div className={styles.formAndSummaryGrid}>
            <div className={styles.formColumn}>
              <UserForm onSubmit={handleFormSubmit} />
            </div>
            <div className={styles.summaryColumn}>
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

