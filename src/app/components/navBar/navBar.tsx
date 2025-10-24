
// Figma-based NavBar for Student Government
export default function NavBar() {
  return (
  <header className="w-full bg-[#49306e] h-16 flex items-center justify-between px-6 md:px-20 relative z-50">
      <div className="flex items-center h-16">
        <a href="/">
          <img
            alt="MSU Logo"
            className="h-12 w-auto object-contain"
            src="/images/MSU Logo.png"
          />
        </a>
      </div>
      <nav className="flex gap-10 text-white font-kanit text-base">
        <a href="#calendar" className="hover:text-[#febd11]">Calendar</a>
        <a href="#attorney" className="hover:text-[#febd11]">Attorney</a>
        <a href="#resources" className="hover:text-[#febd11]">Resources</a>
        <a href="#files" className="hover:text-[#febd11]">Files</a>
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
