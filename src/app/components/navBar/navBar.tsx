"use client";
import { useState } from "react";
import Image from "next/image";
import styles from './navBar.module.css'
import purpleLogo from '../../assets/purpleImage.png'
import whiteLogo from '../../assets/whiteImage.png'
import { useRouter, usePathname } from "next/navigation";
import { useAuth, UserButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname()
  const { sessionClaims } = useAuth(); // Get user info from Clerk
  const isHome = pathname === '/'
  const showButton = pathname !== '/auth/sign-in'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Check if user is an admin or attorney
  const userRole = sessionClaims?.role as string;
  const isAdmin = userRole === "admin";
  const isAttorney = userRole === "attorney";

  return (
    <>
      <header className="w-full bg-[#49306e] h-16 flex items-center justify-between px-6 md:px-12 relative z-50">
        {/* Hamburger Menu Button - Mobile & Tablet Only */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden flex flex-col gap-1.5 w-8 h-8 justify-center items-center z-50"
          aria-label="Toggle menu"
        >
          <span className={`w-6 h-0.5 bg-[#febd11] transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#febd11] transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-6 h-0.5 bg-[#febd11] transition-all ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
        </button>

        {/* Logo Section - Centered on Mobile/Tablet, Left on Desktop */}
        <div className="flex items-center h-16 lg:flex-none absolute left-1/2 transform -translate-x-1/2 lg:relative lg:left-0 lg:transform-none">
          <a href="/">
            <img
              alt="MSU Logo"
              className="h-10 w-auto object-contain cursor-pointer"
              src="/images/MSU Logo.png"
            />
          </a>
        </div>

        {/* Navigation Links - Desktop Only */}
        <nav className="hidden lg:flex gap-10 text-white font-kanit text-base">
          <a href="/calendar" className={`hover:text-[#febd11] ${pathname === '/calendar' ? 'text-[#febd11]' : ''}`}>Calendar</a>
          <a href="/attorney" className={`hover:text-[#febd11] ${pathname === '/attorney' ? 'text-[#febd11]' : ''}`}>Attorney</a>
          <a href="/resources" className={`hover:text-[#febd11] ${pathname === '/resources' ? 'text-[#febd11]' : ''}`}>Resources</a>
          <a href="/archives" className={`hover:text-[#febd11] ${pathname === '/archives' ? 'text-[#febd11]' : ''}`}>Archives</a>
        </nav>

        {/* Auth Section */}
        <div className="flex items-center gap-4">
          <SignedIn>
            {/* Dashboard shortcut button (hidden for attorneys - they have their own dashboard) - Hidden on mobile */}
            {!isAttorney && (
              <button
                onClick={() => router.push('/senate/dashboard')}
                className="hidden md:block bg-white text-purple-700 rounded-md px-3 py-2 font-medium hover:bg-gray-100"
              >
                Dashboard
              </button>
            )}
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            >
              <UserButton.MenuItems>
                {isAttorney && (
                  <UserButton.Action
                    label="Attorney Dashboard"
                    labelIcon={
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="w-4 h-4"
                      >
                        <path d="m14 13-8.381 8.38a1 1 0 0 1-3.001-3l8.384-8.381"/>
                        <path d="m16 16 6-6"/>
                        <path d="m21.5 10.5-8-8"/>
                        <path d="m8 8 6-6"/>
                        <path d="m8.5 7.5 8 8"/>
                      </svg>
                    }
                    onClick={() => router.push('/attorney/dashboard')}
                  />
                )}
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
            {showButton && (
              <a
                href="/auth/sign-in"
                className="bg-[#febd11] text-black rounded-lg px-4 md:px-6 py-2 font-kanit hover:bg-[#e6a900] transition text-sm md:text-base"
              >
                Sign In
              </a>
            )}
          </SignedOut>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div
        className={`fixed top-16 left-0 w-full bg-[#49306e] z-40 lg:hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <nav className="flex flex-col py-4 px-6 gap-4">
          <a
            href="/calendar"
            className={`text-white font-kanit text-lg py-2 hover:text-[#febd11] ${pathname === '/calendar' ? 'text-[#febd11]' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Calendar
          </a>
          <a
            href="/attorney"
            className={`text-white font-kanit text-lg py-2 hover:text-[#febd11] ${pathname === '/attorney' ? 'text-[#febd11]' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Attorney
          </a>
          <a
            href="/resources"
            className={`text-white font-kanit text-lg py-2 hover:text-[#febd11] ${pathname === '/resources' ? 'text-[#febd11]' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Resources
          </a>
          <a
            href="/archives"
            className={`text-white font-kanit text-lg py-2 hover:text-[#febd11] ${pathname === '/archives' ? 'text-[#febd11]' : ''}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            Archives
          </a>
          <SignedIn>
            {!isAttorney && (
              <button
                onClick={() => {
                  router.push('/senate/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="bg-white text-purple-700 rounded-md px-4 py-2 font-medium hover:bg-gray-100 text-left"
              >
                Dashboard
              </button>
            )}
            {isAttorney && (
              <button
                onClick={() => {
                  router.push('/attorney/dashboard');
                  setMobileMenuOpen(false);
                }}
                className="bg-white text-purple-700 rounded-md px-4 py-2 font-medium hover:bg-gray-100 text-left"
              >
                Attorney Dashboard
              </button>
            )}
          </SignedIn>
        </nav>
      </div>
    </>
  );
}
