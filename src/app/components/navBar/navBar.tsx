"use client";

import { usePathname } from "next/navigation";

// Figma-based NavBar for Student Government
export default function NavBar() {
  const pathname = usePathname();

  return (
  <header className="w-full bg-[#49306e] h-16 flex items-center justify-between px-6 md:px-12 relative z-50">
      <div className="flex items-center h-16">
        <a href="/">
          <img
            alt="MSU Logo"
            className="h-10 w-auto object-contain"
            src="/images/MSU Logo.png"
          />
        </a>
      </div>
      <nav className="flex gap-10 text-white font-kanit text-base">
        <a href="#calendar" className={`hover:text-[#febd11] ${pathname === '/calendar' ? 'text-[#febd11]' : ''}`}>Calendar</a>
        <a href="/attorney" className={`hover:text-[#febd11] ${pathname === '/attorney' ? 'text-[#febd11]' : ''}`}>Attorney</a>
        <a href="#resources" className={`hover:text-[#febd11] ${pathname === '/resources' ? 'text-[#febd11]' : ''}`}>Resources</a>
        <a href="/archives" className={`hover:text-[#febd11] ${pathname === '/archives' ? 'text-[#febd11]' : ''}`}>Archives</a>
      </nav>
      <a
        href="/auth/sign-in"
        className="bg-[#febd11] text-white rounded-lg px-6 py-2 font-kanit hover:bg-[#e6a900] transition"
      >
        Sign In
      </a>
    </header>
  );
}
