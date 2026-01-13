"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { AttorneyCard } from "../components/attorney-card";
import { UserForm } from "../components/user-form";
import { AppointmentSummary } from "../components/appointment-summary";
import FeedbackSection from "../components/FeedbackSection/FeedbackSection";
import { MapPin } from "lucide-react";
import styles from './attorney-page.module.css';

interface TimeSlot {
  id: string;
  slotId: number;
  time: string;
  duration: string;
  date: string;
  isAvailable: boolean;
}

interface Attorney {
  id: string;
  name: string;
  initials: string;
  title: string;
  specialization: string;
  timeSlots: TimeSlot[];
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
  const { userId, isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(
    getWeekStart(new Date())
  );
  const [attorneys, setAttorneys] = useState<Attorney[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlot, setSelectedSlot] = useState<{
    attorneyId: string;
    attorneyName: string;
    slot: TimeSlot;
    date: Date;
  } | null>(null);
  const [isBooking, setIsBooking] = useState(false);

  // Fetch attorneys and their availability
  useEffect(() => {
    const fetchAttorneys = async () => {
      setLoading(true);
      try {
        const weekStartStr = currentWeekStart.toISOString().split("T")[0];
        console.log("Fetching attorneys for week starting:", weekStartStr);
        const response = await fetch(
          `/api/get-attorneys-availability?weekStart=${weekStartStr}`
        );
        const data = await response.json();
        console.log("Fetched attorneys data:", data);
        if (Array.isArray(data)) {
          console.log(`Found ${data.length} attorneys with ${data.reduce((sum, a) => sum + (a.timeSlots?.length || 0), 0)} total time slots`);
          setAttorneys(data);
        }
      } catch (error) {
        console.error("Error fetching attorneys:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttorneys();
  }, [currentWeekStart]);

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

  // Helper to check if a slot is in the past
  const isSlotPast = (slot: TimeSlot): boolean => {
    try {
      const [year, month, day] = slot.date.split("-").map(Number);
      const timePart = slot.time.split(" ").slice(1).join(" ");
      const [timeStr, modifier] = timePart.trim().split(" ");
      const [hours, minutes] = timeStr.split(":").map(Number);
      
      let hours24 = hours;
      if (modifier === "PM" && hours !== 12) hours24 += 12;
      if (modifier === "AM" && hours === 12) hours24 = 0;
      
      const slotDateTime = new Date(year, month - 1, day, hours24, minutes, 0, 0);
      const now = new Date();
      
      return slotDateTime.getTime() < now.getTime();
    } catch (error) {
      console.error("Error checking if slot is past:", error, slot);
      return false;
    }
  };

  const handleSlotSelect = (
    attorneyId: string,
    attorneyName: string,
    slot: TimeSlot,
    dayOfWeek: number
  ) => {
    // Prevent selecting past or unavailable slots
    if (isSlotPast(slot) || !slot.isAvailable) {
      console.warn("Attempted to select unavailable slot:", slot);
      return;
    }
    
    // Calculate the actual date based on the selected week and day
    const appointmentDate = new Date(slot.date);
    appointmentDate.setHours(0, 0, 0, 0);

    setSelectedSlot({ attorneyId, attorneyName, slot, date: appointmentDate });
  };

  const handleFormSubmit = async (formData: {
    fullName: string;
    email: string;
    techId: string;
    reason: string;
  }) => {
    if (!selectedSlot || !isSignedIn || !userId) {
      alert("Please sign in to book an appointment and select a time slot.");
      router.push("/auth/sign-in");
      return;
    }

    setIsBooking(true);
    try {
      const response = await fetch("/api/student/book-appointment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slotId: selectedSlot.slot.slotId,
          starId: formData.techId, // Using techId as starId
          techId: formData.techId,
          description: formData.reason,
          studentId: userId,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Appointment booked successfully!");
        // Reset form and selection
        setSelectedSlot(null);
        // Refresh attorneys to update availability
        const weekStartStr = currentWeekStart.toISOString().split("T")[0];
        const refreshResponse = await fetch(
          `/api/get-attorneys-availability?weekStart=${weekStartStr}`
        );
        const refreshData = await refreshResponse.json();
        if (Array.isArray(refreshData)) {
          setAttorneys(refreshData);
        }
      } else {
        alert(`Failed to book appointment: ${data.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("An error occurred while booking the appointment.");
    } finally {
      setIsBooking(false);
    }
  };

  const handleConfirmAppointment = () => {
    // Trigger form submission
    const form = document.querySelector("form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
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
          {/* System is designed for exactly 2 attorneys */}
          {loading ? (
            <div className={styles.attorneyCardsGrid}>
              <p className="text-center text-gray-500 py-8">Loading attorneys...</p>
            </div>
          ) : attorneys.length === 0 ? (
            <div className={styles.attorneyCardsGrid}>
              <p className="text-center text-gray-500 py-8">
                No attorneys available at this time.
              </p>
            </div>
          ) : (
            <div className={styles.attorneyCardsGrid}>
              {attorneys.slice(0, 2).map((attorney) => (
                <AttorneyCard
                  key={attorney.id}
                  attorneyId={attorney.id}
                  initials={attorney.initials}
                  name={attorney.name}
                  title={attorney.title}
                  specialization={attorney.specialization}
                  timeSlots={attorney.timeSlots}
                  onSelectSlot={handleSlotSelect}
                  selectedSlotId={selectedSlot?.slot.id}
                  weekRange={formatWeekRange(currentWeekStart)}
                  onPreviousWeek={goToPreviousWeek}
                  onNextWeek={goToNextWeek}
                />
              ))}
              {attorneys.length < 2 && (
                <div className="bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <p className="text-gray-500 text-sm text-center">
                    Waiting for second attorney to be assigned...
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Form and Summary */}
          {!isSignedIn && (
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800 text-sm">
                <strong>Note:</strong> You need to be signed in to book an appointment.{" "}
                <a
                  href="/auth/sign-in"
                  className="underline font-semibold hover:text-yellow-900"
                >
                  Sign in here
                </a>
              </p>
            </div>
          )}
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
                attorney={selectedSlot?.attorneyName || "-"}
                duration={selectedSlot?.slot.duration || "-"}
                onConfirm={handleConfirmAppointment}
                disabled={isBooking || !isSignedIn}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <FeedbackSection />
    </div>
  );
}

