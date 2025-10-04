
// Figma asset URLs
const imgCampusClockTower1 = "https://www.figma.com/api/mcp/asset/55463380-b21d-4616-95c3-8b964c2998f1";
const imgImages2 = "https://www.figma.com/api/mcp/asset/4cebe1b1-39a6-4fd3-83c9-7c8b9a975fbf";
const imgWillSmithCHfpa20161 = "https://www.figma.com/api/mcp/asset/13227745-8e2f-4d3c-9a84-75b944061ae0";
const imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1 = "https://www.figma.com/api/mcp/asset/d6cad5c1-4569-4377-8acc-4c97f121422a";
const imgMsuLogo = "https://www.figma.com/api/mcp/asset/dd431b26-5c8c-4155-9e1b-a8e7bc3d897c";
const imgFrame = "https://www.figma.com/api/mcp/asset/92c90067-2fb6-423f-987b-76c14c616a5b";
const imgFrame1 = "https://www.figma.com/api/mcp/asset/b5a2b9b6-29e2-4be1-a685-2e2ba6b7823b";
const imgFrame2 = "https://www.figma.com/api/mcp/asset/748ad8f6-87bf-456c-a469-46bb67b41648";
const imgFrame3 = "https://www.figma.com/api/mcp/asset/dd9de976-5c04-45cc-905c-3aac3a912c94";
const imgFrame4 = "https://www.figma.com/api/mcp/asset/1921233b-f949-4ff4-aba8-79a1d80692ef";
const imgFrame5 = "https://www.figma.com/api/mcp/asset/f1e64c67-4ddc-4a88-9440-9f6e9fb82ab1";
const imgFrame6 = "https://www.figma.com/api/mcp/asset/ba51f79d-ec64-46ec-a81b-19b646f7cd43";
const imgFrame7 = "https://www.figma.com/api/mcp/asset/130395ca-d5ef-455a-8812-0dbff250ea4c";

export default function HomePage() {
  return (
    <div className="bg-white flex flex-col items-center min-h-screen w-full overflow-x-hidden">

      {/* Hero Section */}
      <section className="relative w-full h-[600px] flex items-center justify-center overflow-hidden">
        <img src={imgCampusClockTower1} alt="Campus Clock Tower" className="absolute inset-0 w-full h-full object-cover opacity-80" />
  <div className="relative z-10 flex flex-col items-start w-full pl-12">
          <h1 className="text-5xl md:text-6xl font-kanit text-white mb-6">Student Government</h1>
          <p className="text-xl text-white/90 mb-8 max-w-xl font-kanit">Welcome to your student-led hub for advocacy, support, and connection.</p>
          <div className="flex gap-4">
            <a href="/student/schedule" className="bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit text-lg hover:bg-[#e6a900] transition">Schedule Appointment</a>
            <a href="#learn-more" className="border-2 border-white text-white rounded-lg px-8 py-3 font-kanit text-lg hover:bg-white hover:text-[#49306e] transition">Learn More</a>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="w-full bg-white py-20" id="team">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-kanit text-[#49306e] mb-2">Student Government Team</h2>
            <p className="text-lg text-gray-600">Dedicated students working for your interests</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Brad Pitt */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <img src={imgImages2} alt="Brad Pitt" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Brad Pitt</h3>
              <p className="text-[#febd11] font-kanit">Student Government President</p>
              <p className="text-gray-600 text-center mt-2">Leading initiatives for student welfare, campus improvements, and academic advocacy.</p>
            </div>
            {/* Will Smith */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <img src={imgWillSmithCHfpa20161} alt="Will Smith" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Will Smith</h3>
              <p className="text-[#febd11] font-kanit">Student Senator</p>
              <p className="text-gray-600 text-center mt-2">Representing student voices in university policies and budget allocation decisions.</p>
            </div>
            {/* Margot Robbie */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <img src={imgW65Td5ShV2ZUJxmYfoYeV9V9MsrIzSydCdZtO2RrZIc1} alt="Margot Robbie" className="rounded-full w-20 h-20 object-cover mb-4" />
              <h3 className="text-xl font-kanit text-[#49306e]">Margot Robbie</h3>
              <p className="text-[#febd11] font-kanit">Events Coordinator</p>
              <p className="text-gray-600 text-center mt-2">Organizing campus events, student activities, and community engagement programs.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Offerings Section */}
      <section className="w-full bg-gray-50 py-20" id="learn-more">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-kanit text-[#49306e] mb-2">What We Offer</h2>
            <p className="text-lg text-gray-600">Comprehensive support for the MSU community</p>
          </div>
          <div className="flex flex-col md:flex-row gap-8 justify-center">
            {/* Students */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame} alt="Students Icon" className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Students</h3>
              <p className="text-gray-600 text-center mb-4">Academic advocacy, campus life improvements, and direct representation in university decisions.</p>
              <a href="/student/schedule" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
            {/* Legal Support */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame1} alt="Legal Support Icon" className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Legal Support</h3>
              <p className="text-gray-600 text-center mb-4">Free legal consultation and support for student-related issues and campus concerns.</p>
              <a href="/attorney/dashboard" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
            {/* Senate */}
            <div className="bg-white rounded-xl shadow-lg p-8 flex-1 flex flex-col items-center">
              <div className="bg-[#49306e] rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <img src={imgFrame2} alt="Senate Icon" className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-kanit text-[#49306e] mb-2">Senate</h3>
              <p className="text-gray-600 text-center mb-4">Participate in student governance, policy-making, and represent your fellow students' interests.</p>
              <a href="/senate/dashboard" className="bg-[#febd11] text-white rounded-lg px-8 py-2 font-kanit hover:bg-[#e6a900] transition">Get Started</a>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="w-full bg-[#49306e] py-20" id="contact">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-xl shadow-lg p-8 flex-1">
            <h2 className="text-3xl font-kanit text-[#49306e] mb-6">Contact Us</h2>
            <form className="space-y-6">
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Name</label>
                <input type="text" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Email</label>
                <input type="email" className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <div>
                <label className="block text-[#49306e] font-kanit mb-2">Message</label>
                <textarea className="w-full border border-gray-300 rounded-lg px-4 py-3 h-32 resize-none focus:outline-none focus:ring-2 focus:ring-[#febd11]" />
              </div>
              <button type="submit" className="bg-[#febd11] text-white rounded-lg px-8 py-3 font-kanit hover:bg-[#e6a900] transition">Send Message</button>
            </form>
          </div>
          {/* Office Info */}
          <div className="flex-1 text-white font-kanit flex flex-col justify-center">
            <h3 className="text-2xl mb-4">Office Information</h3>
            <p className="mb-2">MSU Student Center</p>
            <p className="mb-2">Room 204, 1400 Highway 14 West</p>
            <p className="mb-2">Mankato, MN 56001</p>
            <p className="mb-2">Phone: (507) 389-2611</p>
            <p className="mb-2">Email: studentgov@mnsu.edu</p>
            <div className="flex gap-4 mt-4">
              <a href="https://www.facebook.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame6} alt="Facebook" className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src={imgFrame7} alt="Instagram" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer (Figma accurate) */}
      <footer className="w-full bg-[#382450] relative pt-16 pb-8 px-0 mt-auto">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-kanit mb-6">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Elections</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Live Stream</a></li>
              <li><a href="#" className="text-white/80 hover:text-white font-kanit text-base">Contact</a></li>
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
              <a href="https://www.facebook.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src="https://www.figma.com/api/mcp/asset/1e5b1cf2-6171-4a82-bd01-4fde53cdd8fd" alt="Facebook" className="w-6 h-6" />
              </a>
              <a href="https://www.instagram.com/mnsustudentgovernment/" target="_blank" rel="noopener noreferrer" className="bg-[#febd11] rounded-full w-12 h-12 flex items-center justify-center hover:bg-[#e6a900] transition">
                <img src="https://www.figma.com/api/mcp/asset/d9356184-6725-4ef8-a60a-243214fa41f5" alt="Instagram" className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-[#febd11] mt-12 pt-6">
          <p className="text-center text-white/80 font-kanit text-base">© Minnesota State Student Government 2025</p>
        </div>
      </footer>
    </div>
  );
}
