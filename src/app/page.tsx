"use client";
import styles from './home.module.css'
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();
  return (
    <div className={styles.homePage}>

      <h1>Home Page</h1>
      <button className={styles.scheduleNow} onClick={() => router.push('/schedule')} >Schedule</button>
    </div>
  );
}
