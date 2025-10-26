"use client";

import { useState } from "react";
import { AttorneyCard } from "../components/attorney-card";
import { UserForm } from "../components/user-form";
import { AppointmentSummary } from "../components/appointment-summary";
import { MapPin } from "lucide-react";

interface TimeSlot {
  id: string;
  time: string;
  duration: string;
}

// Footer images
const imgFrame6 = "/images/facebook logo.png";
const imgFrame7 = "/images/instagram logo.png";

export default function AttorneyPage() {
  const [selectedSlot, setSelectedSlot] = useState<{
    attorney: string;
    slot: TimeSlot;
  } | null>(null);

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

  const handleSlotSelect = (attorney: string, slot: TimeSlot) => {
    setSelectedSlot({ attorney, slot });
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
            />
            <AttorneyCard
              initials="MC"
              name="Michael Chen"
              title="Student Attorney"
              specialization="3L, Contract & Business Law"
              timeSlots={michaelTimeSlots}
              onSelectSlot={handleSlotSelect}
              selectedSlotId={selectedSlot?.slot.id}
            />
          </div>

          {/* Form and Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <UserForm onSubmit={handleFormSubmit} />
            </div>
            <div>
              <AppointmentSummary
                date={selectedSlot ? "December 10, 2024" : "-"}
                time={selectedSlot?.slot.time || "-"}
                attorney={selectedSlot?.attorney || "-"}
                duration={selectedSlot?.slot.duration || "-"}
                onConfirm={handleConfirmAppointment}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Footer (from homepage) */}
      <footer className="w-full bg-[#382450] relative pt-16 pb-8 px-0 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Elections</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Live Stream</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Contact</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">State-Wide Government</a></li>
            </ul>
          </div>
          {/* Contact Info */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Contact Info</h3>
            <ul className="space-y-2 text-white/80 font-kanit text-base">
              <li>MSU Student Center, Room 204</li>
              <li>1400 Highway 14 West</li>
              <li>Mankato, MN 56001</li>
              <li>(507) 389-2611</li>
              <li>studentgov@mnsu.edu</li>
            </ul>
          </div>
          {/* Follow Us */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Follow Us</h3>
            <div className="flex gap-4">
              <a href="https://www.facebook.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame6} alt="Facebook" className="w-6 h-6 object-contain" />
              </a>
              <a href="https://www.instagram.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame7} alt="Instagram" className="w-6 h-6 object-contain" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#febd11] mt-12 pt-6">
          <p className="text-center text-white/80 font-kanit text-base">© Minnesota State Student Government 2025</p>
        </div>
      </footer>
    </div>
  );
}

