"use client";
import Image from "next/image";
import styles from './navBar.module.css'
import purpleLogo from '../../assets/purpleImage.png'
import whiteLogo from '../../assets/whiteImage.png'
import { useRouter, usePathname } from "next/navigation";
import { useUser, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname()
  const { user } = useUser(); // Get user info from Clerk
  const isHome = pathname === '/'
  const showButton = pathname !== '/auth/sign-in'
  
  // Check if user is an admin
  const userRole = user?.publicMetadata?.role as string;
  const isAdmin = userRole === "admin";

  return (
    <div className={`${styles.navBar} ${isHome ? styles.whiteBg : styles.purpleBg}`}>
      {/* Home icon */}
        <div onClick={() => router.push('/')}>
          <svg
            className={styles.homeIcon}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            style={{ color: isHome ? '#3f3f3f' : '#FFFFFF'}} // purple or white
          >
            <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
          </svg>
        </div>
        <div style={{height: '40px', width: '1px', backgroundColor: '#ccc', margin: '0 16px', marginTop:'5px', flexShrink: 0}}
          />
      <Image src={isHome? whiteLogo: purpleLogo} alt="MNSU Logo" className={styles.img} onClick={() => router.push('/')}/>
      <div className={styles.links}>
        <button className={styles.linkBtn} onClick={() => router.push('/calendar')}>Calendar</button>
      </div>
      {/* Profile Section at Bottom  */}
      <div className={styles.profileSection}>
        <SignedIn>
          <p>Welcome, {user?.firstName}.</p>
          <UserButton 
            afterSignOutUrl="/"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          >
            <UserButton.MenuItems>
              {isAdmin && (
                <UserButton.Action
                  label="Admin Dashboard"
                  labelIcon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  }
                  onClick={() => router.push('/admin/dashboard')}
                />
              )}
            </UserButton.MenuItems>
          </UserButton>
        </SignedIn>
        <SignedOut>
          {showButton && (<button className={styles.loginBtn} onClick={() => router.push("/auth/sign-in")}>Sign In</button>)}
        </SignedOut>
      </div>
    </div>
  );
}
