"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useUser } from "@clerk/nextjs"; // ✅ Clerk hook
import styles from "./upcomingAppointments.module.css";
import SideBar from "../../../components/attorneySideBar/AttorneySideBar";
import { CollapsedProvider, useCollapsedContext } from "../../../components/attorneySideBar/attorneySideBarContext";

interface Appointment {
  id: number;
  student_name: string;
  date: string;
  start_time: string;
  end_time: string;
  star_id: string;
  tech_id: string;
  description: string;
}

function UpcomingAppointmentsContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();
  const pathname = usePathname();

  const { user, isLoaded } = useUser(); // ✅ get logged-in user
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoaded || !user) return;

    const fetchAppointments = async () => {
      try {
        const res = await fetch(`/api/get-booked-appointments?userId=${user.id}`);
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

  const groupByDate = (appointments: Appointment[]): Record<string, Appointment[]> => {
    return appointments.reduce((acc, curr) => {
      acc[curr.date] = acc[curr.date] || [];
      acc[curr.date].push(curr);
      return acc;
    }, {} as Record<string, Appointment[]>);
  };

  const groupedAppointments = groupByDate(appointments);

  return (
    <div className={styles.appointmentsPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Upcoming Appointments</h1>
          <div className={styles.navButtons}>
            {pathname !== "/attorney/dashboard/availability" && (
              <button onClick={() => router.push("/attorney/dashboard/availability")}>
                Availability
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <p>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p className={styles.noAppointments}>No upcoming appointments.</p>
        ) : (
          <div className={styles.appointmentGroups}>
            {Object.entries(groupedAppointments).map(([date, appts]) => (
              <div key={date} className={styles.appointmentGroup}>
                <h2 className={styles.dateHeader}>{date}</h2>
                <ul className={styles.appointmentList}>
                  {appts.map((appt) => (
                    <li key={appt.id} className={styles.appointmentItem}>
                      <div className={styles.topRow}>
                        <span className={styles.name}>{appt.student_name}</span>
                        <span className={styles.time}>
                          {appt.start_time} – {appt.end_time}
                        </span>
                      </div>
                      <div className={styles.hiddenDetails}>
                        <p>Star ID: {appt.star_id}</p>
                        <p>Tech ID: {appt.tech_id}</p>
                        <p>Description: {appt.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
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
