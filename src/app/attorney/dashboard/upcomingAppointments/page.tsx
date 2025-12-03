"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import {
  format,
  parseISO,
  isToday,
  isTomorrow,
  isThisWeek,
  isBefore,
  startOfDay,
} from "date-fns";
import {
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  Mail,
  User,
  FileText,
  Hash,
  Trash2,
} from "lucide-react";
import SideBar from "../../../components/attorneySideBar/AttorneySideBar";
import {
  CollapsedProvider,
  useCollapsedContext,
} from "../../../components/attorneySideBar/attorneySideBarContext";

interface Appointment {
  id: number;
  student_name: string;
  student_email: string;
  date: string;
  start_time: string;
  end_time: string;
  star_id: string;
  tech_id: string;
  description: string;
}

function UpcomingAppointmentsContent() {
  const { collapsed } = useCollapsedContext();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isLoaded } = useUser();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppointments, setExpandedAppointments] = useState<
    Record<number, boolean>
  >({});
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [deletingAppointmentId, setDeletingAppointmentId] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(
          `/api/get-booked-appointments?userId=${user.id}`
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          setAppointments(data);
        } else {
          setAppointments([]);
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [isLoaded, user]);

  const toggleAppointmentDetails = (id: number) => {
    setExpandedAppointments((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleDeleteAppointment = async (appointmentId: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent expanding/collapsing when clicking delete
    
    const confirmed = window.confirm(
      "Are you sure you want to delete this appointment? This action cannot be undone."
    );
    
    if (!confirmed) return;

    setDeletingAppointmentId(appointmentId);
    
    try {
      const res = await fetch("/api/delete-appointment", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId }),
      });

      if (res.ok) {
        // Remove the appointment from the list
        setAppointments((prev) => prev.filter((apt) => apt.id !== appointmentId));
        // Close the expanded view if it was open
        setExpandedAppointments((prev) => {
          const updated = { ...prev };
          delete updated[appointmentId];
          return updated;
        });
      } else {
        const error = await res.json();
        alert(`Failed to delete appointment: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      alert("An error occurred while deleting the appointment.");
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  const getFilteredAppointments = () => {
    const today = new Date();
    const startOfToday = startOfDay(today);

    return appointments.filter((appointment) => {
      const apptDate = parseISO(`${appointment.date}T00:00:00`);

      switch (activeFilter) {
        case "today":
          return isToday(apptDate);

        case "tomorrow":
          return isTomorrow(apptDate);

        case "thisWeek":
          // in this week but not today or tomorrow
          return (
            isThisWeek(apptDate) &&
            !isToday(apptDate) &&
            !isTomorrow(apptDate)
          );

        case "all":
          // from today onwards
          return !isBefore(apptDate, startOfToday);

        case "past":
          // strictly before today
          return isBefore(apptDate, startOfToday);

        default:
          return true;
      }
    });
  };

  const groupByDate = (appts: Appointment[]) =>
    appts.reduce<Record<string, Appointment[]>>((acc, curr) => {
      acc[curr.date] = acc[curr.date] || [];
      acc[curr.date].push(curr);
      return acc;
    }, {});

  const filteredAppointments = getFilteredAppointments();
  const groupedAppointments = groupByDate(filteredAppointments);

  const formatDate = (dateString: string) => {
    try {
      const date = parseISO(`${dateString}T00:00:00`);
      if (isToday(date)) return "Today";
      if (isTomorrow(date)) return "Tomorrow";
      return format(date, "EEEE, MMMM d, yyyy");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <SideBar collapsed={collapsed} setCollapsed={() => {}} />
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b shadow-sm  pt-9">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <h1 className="text-4xl text-gray-900">
                Upcoming Appointments
              </h1>
              {pathname !== "/attorney/dashboard/availability" && (
                <button
                  onClick={() =>
                    router.push("/attorney/dashboard/availability")
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#63439a] hover:bg-[#8257cb] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Manage Availability
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="pb-4 flex space-x-2 overflow-x-auto">
              {[
                "today",
                "tomorrow",
                "thisWeek",
                "all",
                "past",
              ].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full ${
                    activeFilter === f
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {{
                    today: "Today",
                    tomorrow: "Tomorrow",
                    thisWeek: "This Week",
                    all: "All (Upcoming)",
                    past: "Past",
                  }[f]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-lg shadow p-8">
              <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
              <p className="mt-4 text-gray-500">
                Loading your appointments...
              </p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-8 text-center">
                <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-lg font-medium text-gray-900">
                  No appointments found
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {activeFilter !== "all"
                    ? "Try changing your filter or check back later."
                    : "You don't have any upcoming appointments scheduled."}
                </p>
                {pathname !== "/attorney/dashboard/availability" && (
                  <div className="mt-6">
                    <button
                      onClick={() =>
                        router.push("/attorney/dashboard/availability")
                      }
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Set your availability
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedAppointments).map(([date, appts]) => (
                <div key={date} className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-indigo-500" />
                    <h2 className="text-lg font-semibold text-gray-900">
                      {formatDate(date)}
                    </h2>
                  </div>
                  <div className="bg-white rounded-lg shadow overflow-hidden divide-y divide-gray-200">
                    {appts.map((appt) => (
                      <div
                        key={appt.id}
                        className="transition duration-150 ease-in-out hover:bg-gray-50"
                      >
                        <div className="px-6 py-4">
                          <button
                            className="w-full text-left"
                            onClick={() => toggleAppointmentDetails(appt.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                    <User className="h-5 w-5 text-indigo-600" />
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <h3 className="text-base font-medium text-gray-900">
                                    {appt.student_name}
                                  </h3>
                                  <div className="flex items-center mt-1 text-sm text-gray-500">
                                    <Clock className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                                    <span>
                                      {appt.start_time} – {appt.end_time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="ml-2">
                                {expandedAppointments[appt.id] ? (
                                  <ChevronUp className="h-5 w-5 text-gray-400" />
                                ) : (
                                  <ChevronDown className="h-5 w-5 text-gray-400" />
                                )}
                              </div>
                            </div>
                          </button>

                          {expandedAppointments[appt.id] && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Mail className="mr-1 h-4 w-4" />
                                    Email
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {appt.student_email}
                                  </dd>
                                </div>
                                <div className="sm:col-span-1">
                                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <Hash className="mr-1 h-4 w-4" />
                                    Tech ID
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {appt.tech_id}
                                  </dd>
                                </div>
                                <div className="sm:col-span-2">
                                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                                    <FileText className="mr-1 h-4 w-4" />
                                    Description
                                  </dt>
                                  <dd className="mt-1 text-sm text-gray-900">
                                    {appt.description || "No description provided."}
                                  </dd>
                                </div>
                              </dl>
                              <div className="mt-4 flex justify-end">
                                <button
                                  onClick={(e) => handleDeleteAppointment(appt.id, e)}
                                  disabled={deletingAppointmentId === appt.id}
                                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {deletingAppointmentId === appt.id ? "Deleting..." : "Delete Appointment"}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function UpcomingAppointmentsPage() {
  return (
    <CollapsedProvider>
      <UpcomingAppointmentsContent />
    </CollapsedProvider>
  );
}
