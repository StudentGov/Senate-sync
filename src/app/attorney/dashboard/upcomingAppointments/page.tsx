"use client";
import styles from './upcomingAppointments.module.css';
import SideBar from '../../../components/attorneySideBar/AttorneySideBar';
import { CollapsedProvider, useCollapsedContext } from '../../../components/attorneySideBar/attorneySideBarContext';

// Define a type for appointments
interface Appointment {
  id: number;
  student: string;
  date: string;
  time: string;
  reason: string;
}

// Sample appointments with defined type
const appointments: Appointment[] = [
  { id: 1, student: "Hermon Metaferia", date: "March 25, 2025", time: "10:00 AM", reason: "Scholarship consultation" },
  { id: 2, student: "Nahome Woinu", date: "March 26, 2025", time: "1:30 PM", reason: "Housing concern" },
  { id: 3, student: "Kidus Girmay", date: "March 27, 2025", time: "9:00 AM", reason: "Legal documentation review" },
];

// Group appointments by date
const groupByDate = (appointments: Appointment[]): Record<string, Appointment[]> => {
  return appointments.reduce((acc, curr) => {
    acc[curr.date] = acc[curr.date] || [];
    acc[curr.date].push(curr);
    return acc;
  }, {} as Record<string, Appointment[]>); // Explicitly define the return type
};

function UpcomingAppointmentsContent() {
  const { collapsed, setCollapsed } = useCollapsedContext();
  const groupedAppointments = groupByDate(appointments);

  return (
    <div className={styles.appointmentsPage}>
      <SideBar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={styles.mainContent}>
        <h1>Upcoming Appointments</h1>

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
