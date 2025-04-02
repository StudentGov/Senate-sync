"use client";

import { useRouter } from 'next/navigation';
import styles from './upcomingAppointments.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';
import upcomingAppointments from '../../../upcomingAppointments.json';

interface Appointment {
  id: number;
  student: string;
  date: string;
  time: string;
  reason: string;
}

const appointments: Appointment[] = upcomingAppointments as Appointment[];

const groupByDate = (appointments: Appointment[]): Record<string, Appointment[]> => {
  return appointments.reduce((acc, curr) => {
    acc[curr.date] = acc[curr.date] || [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, Appointment[]>);
};

function UpcomingAppointmentsContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const router = useRouter();
  const userRole = "super_admin"; // Replace this with real role

  const groupedAppointments = groupByDate(appointments);

  return (
    <div className={styles.appointmentsPage}>
      {userRole === "super_admin" && (
        <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      )}
      <div className={styles.mainContent}>
        <div className={styles.headerContainer}>
          <h1>Upcoming Appointments</h1>
          {userRole === "super_admin" && (
            <div className={styles.navButtons}>
              <button onClick={() => router.push('/attorney/dashboard/upcomingAppointments')}>
                Upcoming Appointments
              </button>
              <button onClick={() => router.push('/attorney/dashboard/availability')}>
                Availability
              </button>
            </div>
          )}
        </div>

        <div className={styles.appointmentGroups}>
          {Object.entries(groupedAppointments).map(([date, appts]) => (
            <div key={date} className={styles.appointmentGroup}>
              <h2 className={styles.dateHeader}>{date}</h2>
              <ul className={styles.appointmentList}>
                {appts.map((appt) => (
                  <li key={appt.id} className={styles.appointmentItem}>
                    <div className={styles.topRow}>
                      <span className={styles.name}>{appt.student}</span>
                      <span className={styles.time}>{appt.time}</span>
                    </div>
                    <p className={styles.reason}>{appt.reason}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
