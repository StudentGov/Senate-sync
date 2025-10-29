import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-[#382450] relative pt-16 pb-8 px-0 mt-auto">
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
        {/* Quick Links */}
        <div>
          <h3 className="text-white text-lg font-kanit mb-6">Quick Links</h3>
          <ul className="space-y-2">
            <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Elections</a></li>
            <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Live Stream</a></li>
            <li><a href="#contact" className="text-white/80 hover:text-white font-kanit text-base">Contact</a></li>
            <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">State-Wide Government</a></li>
          </ul>
        </div>
        {/* Contact Info */}
        <div>
          <h3 className="text-white text-lg font-kanit mb-6">Contact Info</h3>
          <ul className="space-y-2 text-white/80 font-kanit text-base">
            <li>MSU Student Center, Room 204</li>
            <li>1400 Highway 14 West</li>
            <li>Mankato, MN 56001</li>
            <li>(507) 389-2611</li>
            <li>studentgov@mnsu.edu</li>
          </ul>
        </div>
        {/* Follow Us */}
        <div>
          <h3 className="text-white text-lg font-kanit mb-6">Follow Us</h3>
          <div className="flex gap-4">
            <a
              href="https://www.facebook.com/mnsustudentgovernment/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition"
              aria-label="Facebook"
            >
              <Facebook className="w-6 h-6 text-[#49306e]" />
            </a>
            <a
              href="https://www.instagram.com/mnsustudentgovernment/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition"
              aria-label="Instagram"
            >
              <Instagram className="w-6 h-6 text-[#49306e]" />
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-[#febd11] mt-12 pt-6">
        <p className="text-center text-white/80 font-kanit text-base">© Minnesota State Student Government 2025</p>
      </div>
    </footer>
  );
}

