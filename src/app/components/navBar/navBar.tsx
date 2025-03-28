"use client";
import Image from "next/image";
import styles from './navBar.module.css'
import purpleLogo from '../../assets/purpleImage.png'
import whiteLogo from '../../assets/whiteImage.png'
import { useRouter,usePathname } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
    const router = useRouter();
    const pathname = usePathname()
    const { user } = useUser(); // Get user info from Clerk
    const isHome = pathname === '/'
    const showButton = pathname !== '/auth/sign-in'

  return (
    <div className={`${styles.navBar} ${isHome ? styles.whiteBg : styles.purpleBg}`}>
      <Image src={isHome? whiteLogo: purpleLogo} alt="MNSU Logo" className={styles.img} onClick={() => router.push('/')}/>
      {/* Profile Section at Bottom  */}
      <div className={styles.profileSection}>
        <SignedIn>
          <p>Welcome, {user?.firstName}.</p>
          <UserButton />
        </SignedIn>
        <SignedOut>
          {showButton && (<button className={styles.loginBtn} onClick={() => router.push("/auth/sign-in")}>Sign In</button>)}
        </SignedOut>
      </div>
    </div>
  );
}
