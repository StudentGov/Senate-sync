"use client";
import Image from "next/image";
import styles from './NavBar.module.css'
import logo from '../../assets/image.png'
import { useRouter } from "next/navigation";

export default function Navbar() {
    const router = useRouter();
  return (
    <div className={styles.navBar}>
    <Image src={logo} alt="MNSU Logo" className={styles.img} onClick={() => router.push('/')}/>
    </div>
  );
}
